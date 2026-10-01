// THE KERNEL PRIMITIVES ON A GPU, float64. kernel/src/
// One source, compiled three ways, never by a build step on this machine:
//   hip    by hiprtc at load, on the AMD machine that runs it (-ffp-contract=off)
//   cuda   by NVRTC at load, on the NVIDIA machine that runs it (--fmad=false)
//   emu    by the host C++ compiler with -DVK_EMU, one CPU thread, so the GPU path runs byte for byte on any machine
//          (task/kernel/build.ts emu), which is how this file is checked where there is no GPU
//
// Each kernel restates a loop of prim.rs (itself the TypeScript reference restated), with the same rules:
//   float64 only, and no contraction: every a * b + c is a multiply rounded to double and then an add rounded to
//   double, which the compile options above enforce (the FMA control compiles this file with contraction on)
//   no reordered sum: each output element is computed by ONE thread, summing its terms in the reference's order; no
//   atomics and no tree reductions. Where the reference sums across rows (bandWeights, the inner product), a thread
//   returns its row's partial and TypeScript finishes the sum in order, as the CPU kernel does
//   no trigonometry: every cos and sin is computed in TypeScript and passed in
//   signed zeros: a zero test is == 0.0, true for -0, and an addition is skipped only where the reference skips it
//
// The unit of work is finer than prim.rs's row where the row's outputs are independent: conv, pairBeat and the others
// give a thread one ENTRY of a row (a row's 64 entries do not read each other), and the sea piece is cut into five
// passes over the dock (each pass's outputs summed over the same terms in the same order as the reference's loop).
// That changes which thread computes an entry, never what it computes.
//
// Every kernel takes ONE argument, a struct of 8-byte fields (device pointers, long long, double), mirrored field for
// field by #[repr(C)] structs in gpu.rs. Every kernel is a grid-stride loop, so any launch size covers the work.

#ifdef VK_EMU
#define VK_GLOBAL extern "C"
#define VK_DEVICE static inline
#define VK_GID 0LL
#define VK_STRIDE 1LL
// the emulator calls vk_x_emu(&args) for kernel vk_x
#define VK_KERNEL(name, Args)                                                                                          \
  static void name##_body(const Args a);                                                                               \
  extern "C" void name##_emu(const void* p) { name##_body(*(const Args*)p); }                                         \
  static void name##_body(const Args a)
#else
#define VK_DEVICE __device__ static inline
#define VK_GID ((long long)blockIdx.x * (long long)blockDim.x + (long long)threadIdx.x)
#define VK_STRIDE ((long long)gridDim.x * (long long)blockDim.x)
#define VK_KERNEL(name, Args) extern "C" __global__ void name(const Args a)
#endif

// the reference's own guard against contraction, in the source as well as in the compile options: off unless the FMA
// control asks for it (a clang pragma, honored by hiprtc and by the emulator's clang; NVRTC ignores it and is held by
// --fmad=false)
#if defined(__clang__) && !defined(VK_CONTRACT)
#pragma clang fp contract(off)
#endif

typedef long long i64;

#define FOR_EACH(idx, total) for (i64 idx = VK_GID; idx < (total); idx += VK_STRIDE)

#define PAIR 64
#define SITE 256
#define NR 24
#define REG 8
#define MODES 192
#define FULL (MODES * MODES)

// ---- the pair engines ----

// register-ball-reduced conv and register-reduced conv, an entry a thread: out[i][k] = the sum over roots d (in order)
// and over the overlap's entries q (in order) whose row reaches entry k, of w (C or C^dag, times the root phase) times
// the source entry read through the element's signed index map. The host picks the member's neighbour table and the
// dagger's overlap
struct VkConv {
  const int* rep;
  const int* gel;
  const short* src;
  const signed char* sgn;
  const int* off;
  const signed char* row;
  const signed char* col;
  const double* val;
  const double* half_re;
  const double* half_im;
  double sg;
  const double* sre;
  const double* sim;
  i64 src_off;
  i64 src_stride;
  i64 t;
  double* ore;
  double* oim;
  i64 member;
  i64 count;
};

VK_KERNEL(vk_conv, VkConv) {
  FOR_EACH(idx, a.count * PAIR) {
    const i64 i = idx / PAIR;
    const i64 k = idx % PAIR;
    // member 1: entry k = r * 8 + r2, reached by the overlap entries of row r, reading the source's c * 8 + r2
    // member 2: entry k = r1 * 8 + r, reached by the overlap entries of row r, reading the source's r1 * 8 + c
    const i64 want = a.member == 1 ? k / 8 : k % 8;
    const i64 fixed = a.member == 1 ? k % 8 : k / 8;
    double acc_re = 0.0;
    double acc_im = 0.0;

    for (i64 d = 0; d < NR; d++) {
      const int j = a.rep[i * NR + d];

      if (j < 0) {
        continue;
      }

      const i64 base = ((i64)a.gel[i * NR + d] * 4 + a.t) * PAIR;
      const i64 so = (i64)j * a.src_stride + a.src_off;
      const double pr = a.half_re[d];
      const double pi = a.sg * a.half_im[d];
      const i64 q0 = a.off[d];
      const i64 q1 = a.off[d + 1];

      for (i64 q = q0; q < q1; q++) {
        if ((i64)a.row[q] != want) {
          continue;
        }

        const i64 c = a.col[q];
        const i64 kin = a.member == 1 ? c * 8 + fixed : fixed * 8 + c;
        const double f = (double)a.sgn[base + kin];
        const i64 at = so + (i64)a.src[base + kin];
        const double xr = f * a.sre[at];
        const double xi = f * a.sim[at];
        const double v = a.val[q];
        const double wr = v * pr;
        const double wi = v * pi;

        acc_re = acc_re + (wr * xr - wi * xi);
        acc_im = acc_im + (wr * xi + wi * xr);
      }
    }

    a.ore[i * PAIR + k] = acc_re;
    a.oim[i * PAIR + k] = acc_im;
  }
}

// the site-local update of one beat, an entry of the main, B and X blocks a thread
struct VkBeat {
  double* re;
  double* im;
  const double* t1r;
  const double* t1i;
  const double* t2r;
  const double* t2i;
  const double* fr;
  const double* fi;
  const double* qbr;
  const double* qbi;
  const double* qxr;
  const double* qxi;
  const double* beta;
  double alr;
  double ali;
  i64 main_off;
  i64 n;
};

VK_KERNEL(vk_pair_beat, VkBeat) {
  FOR_EACH(idx, a.n * PAIR) {
    const i64 i = idx / PAIR;
    const i64 k = idx % PAIR;
    const double alr = a.alr;
    const double ali = a.ali;
    const double b1r = a.beta[2 * i];
    const double b1i = a.beta[2 * i + 1];
    const i64 c = i * PAIR + k;
    const i64 mi = i * SITE + a.main_off + k;
    const i64 bi = i * SITE + 64 + k;
    const i64 xi_ = i * SITE + 128 + k;
    const double a_r = a.re[mi];
    const double a_i = a.im[mi];
    const double p1r = a_r + a.t1r[c];
    const double p1i = a_i + a.t1i[c];
    const double p2r = a_r + a.t2r[c];
    const double p2i = a_i + a.t2i[c];
    const double psr = p1r + a.t2r[c] + a.fr[c];
    const double psi = p1i + a.t2i[c] + a.fi[c];

    a.re[mi] = a_r + alr * (p1r + p2r) - ali * (p1i + p2i) + b1r * psr - b1i * psi;
    a.im[mi] = a_i + alr * (p1i + p2i) + ali * (p1r + p2r) + b1r * psi + b1i * psr;

    const double b_r = a.re[bi];
    const double b_i = a.im[bi];
    const double qbr = b_r + a.qbr[c];
    const double qbi = b_i + a.qbi[c];

    a.re[bi] = b_r + alr * qbr - ali * qbi;
    a.im[bi] = b_i + alr * qbi + ali * qbr;

    const double x_r = a.re[xi_];
    const double x_i = a.im[xi_];
    const double qxr = x_r + a.qxr[c];
    const double qxi = x_i + a.qxi[c];

    a.re[xi_] = x_r + alr * qxr - ali * qxi;
    a.im[xi_] = x_i + alr * qxi + ali * qxr;
  }
}

// register-reduced crossProjection then crossPiece, an entry of the own block a thread
struct VkCross {
  double* re;
  double* im;
  const double* t1r;
  const double* t1i;
  const double* t2r;
  const double* t2i;
  const double* t4r;
  const double* t4i;
  const double* cross;
  i64 own;
  i64 n;
};

VK_KERNEL(vk_cross_apply, VkCross) {
  FOR_EACH(idx, a.n * PAIR) {
    const i64 i = idx / PAIR;
    const i64 k = idx % PAIR;
    const double cr = a.cross[2 * i];
    const double ci = a.cross[2 * i + 1];

    if (cr == 0.0 && ci == 0.0) {
      continue;
    }

    const i64 c = i * PAIR + k;
    const i64 o = i * SITE + a.own + k;
    const double xr = a.re[o] + a.t1r[c] + a.t2r[c] + a.t4r[c];
    const double xi = a.im[o] + a.t1i[c] + a.t2i[c] + a.t4i[c];

    a.re[o] = a.re[o] + (cr * xr - ci * xi);
    a.im[o] = a.im[o] + (cr * xi + ci * xr);
  }
}

// ballGram's add, an entry a thread
struct VkBlockAdd {
  double* ore;
  double* oim;
  const double* fr;
  const double* fi;
  i64 off;
  i64 n;
};

VK_KERNEL(vk_block_add, VkBlockAdd) {
  FOR_EACH(idx, a.n * PAIR) {
    const i64 i = idx / PAIR;
    const i64 k = idx % PAIR;
    const i64 o = i * SITE + a.off + k;
    const i64 c = i * PAIR + k;

    a.ore[o] = a.ore[o] + a.fr[c];
    a.oim[o] = a.oim[o] + a.fi[c];
  }
}

// ballInner's local product, a representative a thread: its 256 terms in order (the caller sums the partials in order)
struct VkBlockInner {
  const double* ar;
  const double* ai;
  const double* br;
  const double* bi;
  double* pr;
  double* pi;
  i64 n;
};

VK_KERNEL(vk_block_inner, VkBlockInner) {
  FOR_EACH(i, a.n) {
    double sr = 0.0;
    double si = 0.0;

    for (i64 k = i * SITE; k < (i + 1) * SITE; k++) {
      const double xr = a.ar[k];
      const double xi = a.ai[k];
      const double yr = a.br[k];
      const double yi = a.bi[k];

      sr = sr + (xr * yr + xi * yi);
      si = si + (xr * yi - xi * yr);
    }

    a.pr[i] = sr;
    a.pi[i] = si;
  }
}

// axpyBall: y += (fr + i fi) x, an entry a thread
struct VkAxpy {
  double* yr;
  double* yi;
  const double* xr;
  const double* xi;
  double fr;
  double fi;
  i64 n;
};

VK_KERNEL(vk_axpy, VkAxpy) {
  FOR_EACH(i, a.n) {
    const double r = a.xr[i];
    const double m = a.xi[i];

    a.yr[i] = a.yr[i] + (a.fr * r - a.fi * m);
    a.yi[i] = a.yi[i] + (a.fr * m + a.fi * r);
  }
}

// scaleBall, an entry a thread
struct VkScale {
  double* re;
  double* im;
  double f;
  i64 n;
};

VK_KERNEL(vk_scale, VkScale) {
  FOR_EACH(i, a.n) {
    a.re[i] = a.re[i] * a.f;
    a.im[i] = a.im[i] * a.f;
  }
}

// ---- register-sea ----
// sectorPiece, in five passes over every dock. The reference, per dock: (0) the whole control's phase, (1) L = E^T psi
// and R = psi E, both read from the phased dock, (2) C = E^T L E... accumulated as core[eta][z], (3) g per (s1, z), (4)
// the update psi[s1][s2] += sum over eta. Each pass's outputs are exactly the reference's accumulators, each summed over
// the same terms in the same order, so the passes give the reference's values; a later pass starts only when the
// earlier one is done for every dock (the host launches them in order on one stream)

// pass 0: psi <- (c + i s) psi at every entry of a dock (seaBeat's whole control)
struct VkSeaPhase {
  double* re;
  double* im;
  const double* phase;
  i64 docks;
};

VK_KERNEL(vk_sea_phase, VkSeaPhase) {
  FOR_EACH(idx, a.docks * FULL) {
    const i64 dock = idx / FULL;
    const double c = a.phase[2 * dock];
    const double sn = a.phase[2 * dock + 1];
    const double xr = a.re[idx];
    const double xi = a.im[idx];

    a.re[idx] = c * xr - sn * xi;
    a.im[idx] = c * xi + sn * xr;
  }
}

// pass 1a: l[dock][eta][s2] = sum over s1 in order of w(s1, eta) psi[s1][s2], w = 0 skipped
struct VkSeaLeft {
  const double* re;
  const double* im;
  const double* e;
  double* lr;
  double* li;
  i64 docks;
};

VK_KERNEL(vk_sea_left, VkSeaLeft) {
  FOR_EACH(idx, a.docks * REG * MODES) {
    const i64 dock = idx / (REG * MODES);
    const i64 eta = (idx / MODES) % REG;
    const i64 s2 = idx % MODES;
    const i64 off = dock * FULL;
    double xr = 0.0;
    double xi = 0.0;

    for (i64 s1 = 0; s1 < MODES; s1++) {
      const double w = a.e[s1 * REG + eta];

      if (w == 0.0) {
        continue;
      }

      xr = xr + w * a.re[off + s1 * MODES + s2];
      xi = xi + w * a.im[off + s1 * MODES + s2];
    }

    a.lr[idx] = xr;
    a.li[idx] = xi;
  }
}

// pass 1b: r[dock][s1][eta] = sum over s2 in order of w(s2, eta) psi[s1][s2], a zero entry of psi skipped
struct VkSeaRight {
  const double* re;
  const double* im;
  const double* e;
  double* rr;
  double* ri;
  i64 docks;
};

VK_KERNEL(vk_sea_right, VkSeaRight) {
  FOR_EACH(idx, a.docks * MODES * REG) {
    const i64 dock = idx / (MODES * REG);
    const i64 s1 = (idx / REG) % MODES;
    const i64 eta = idx % REG;
    const i64 o = dock * FULL + s1 * MODES;
    double yr = 0.0;
    double yi = 0.0;

    for (i64 s2 = 0; s2 < MODES; s2++) {
      const double xr = a.re[o + s2];
      const double xi = a.im[o + s2];

      if (xr == 0.0 && xi == 0.0) {
        continue;
      }

      const double w = a.e[s2 * REG + eta];

      yr = yr + w * xr;
      yi = yi + w * xi;
    }

    a.rr[idx] = yr;
    a.ri[idx] = yi;
  }
}

// pass 2: core[dock][eta][z] = sum over s2 in order of w(s2, z) l[eta][s2]
struct VkSeaCore {
  const double* e;
  const double* lr;
  const double* li;
  double* cr;
  double* ci;
  i64 docks;
};

VK_KERNEL(vk_sea_core, VkSeaCore) {
  FOR_EACH(idx, a.docks * REG * REG) {
    const i64 dock = idx / (REG * REG);
    const i64 eta = (idx / REG) % REG;
    const i64 z = idx % REG;
    const i64 lo = dock * REG * MODES + eta * MODES;
    double yr = 0.0;
    double yi = 0.0;

    for (i64 s2 = 0; s2 < MODES; s2++) {
      const double w = a.e[s2 * REG + z];

      yr = yr + w * a.lr[lo + s2];
      yi = yi + w * a.li[lo + s2];
    }

    a.cr[idx] = yr;
    a.ci[idx] = yi;
  }
}

// pass 3: g[dock][s1][z] = alpha r[s1][z] + beta (sum over eta in order of w(s1, eta) core[eta][z])
struct VkSeaG {
  const double* e;
  const double* rr;
  const double* ri;
  const double* cr;
  const double* ci;
  const double* alpha;
  const double* beta;
  double* gr;
  double* gi;
  i64 docks;
};

VK_KERNEL(vk_sea_g, VkSeaG) {
  FOR_EACH(idx, a.docks * MODES * REG) {
    const i64 dock = idx / (MODES * REG);
    const i64 s1 = (idx / REG) % MODES;
    const i64 z = idx % REG;
    const i64 co = dock * REG * REG;
    double cr = 0.0;
    double ci = 0.0;

    for (i64 eta = 0; eta < REG; eta++) {
      const double w = a.e[s1 * REG + eta];

      cr = cr + w * a.cr[co + eta * REG + z];
      ci = ci + w * a.ci[co + eta * REG + z];
    }

    const double ar = a.alpha[2 * dock];
    const double ai = a.alpha[2 * dock + 1];
    const double br = a.beta[2 * dock];
    const double bi = a.beta[2 * dock + 1];
    const double rrv = a.rr[idx];
    const double riv = a.ri[idx];

    a.gr[idx] = ar * rrv - ai * riv + br * cr - bi * ci;
    a.gi[idx] = ar * riv + ai * rrv + br * ci + bi * cr;
  }
}

// pass 4: psi[s1][s2] += sum over eta in order of w(s1, eta) alpha l[eta][s2] (w1 = 0 skipped) and w(s2, eta)
// g[s1][eta] (w2 = 0 skipped), the two terms interleaved per eta as the reference adds them
struct VkSeaUpdate {
  double* re;
  double* im;
  const double* e;
  const double* lr;
  const double* li;
  const double* gr;
  const double* gi;
  const double* alpha;
  i64 docks;
};

VK_KERNEL(vk_sea_update, VkSeaUpdate) {
  FOR_EACH(idx, a.docks * FULL) {
    const i64 dock = idx / FULL;
    const i64 s1 = (idx / MODES) % MODES;
    const i64 s2 = idx % MODES;
    const double ar = a.alpha[2 * dock];
    const double ai = a.alpha[2 * dock + 1];
    const i64 lo = dock * REG * MODES;
    const i64 go = dock * MODES * REG + s1 * REG;
    double sr = 0.0;
    double si = 0.0;

    for (i64 eta = 0; eta < REG; eta++) {
      const double w1 = a.e[s1 * REG + eta];
      const double w2 = a.e[s2 * REG + eta];

      if (w1 != 0.0) {
        const double l_r = a.lr[lo + eta * MODES + s2];
        const double l_i = a.li[lo + eta * MODES + s2];

        sr = sr + w1 * (ar * l_r - ai * l_i);
        si = si + w1 * (ar * l_i + ai * l_r);
      }

      if (w2 != 0.0) {
        sr = sr + w2 * a.gr[go + eta];
        si = si + w2 * a.gi[go + eta];
      }
    }

    a.re[idx] = a.re[idx] + sr;
    a.im[idx] = a.im[idx] + si;
  }
}

// seaBeat's swap coin and stream, an entry a thread: out[move(i, d, e)][d a][e b] = s[i][opp(d) a][opp(e) b]. For
// each (d, e) the move is a bijection of docks, so every entry of out is written once
struct VkSeaStream {
  const double* sr;
  const double* si;
  double* orr;
  double* oi;
  const int* mv;
  const int* opp;
  i64 docks;
};

VK_KERNEL(vk_sea_stream, VkSeaStream) {
  FOR_EACH(idx, a.docks * FULL) {
    const i64 i = idx / FULL;
    const i64 d = (idx / (REG * MODES)) % NR;
    const i64 aa = (idx / MODES) % REG;
    const i64 e = (idx / REG) % NR;
    const i64 b = idx % REG;
    const i64 j = a.mv[i * NR * NR + d * NR + e];
    const i64 from1 = a.opp[d];
    const i64 from2 = a.opp[e];
    const i64 src = i * FULL + (from1 * REG + aa) * MODES + from2 * REG + b;
    const i64 dst = j * FULL + (d * REG + aa) * MODES + e * REG + b;

    a.orr[dst] = a.sr[src];
    a.oi[dst] = a.si[src];
  }
}

// pairAt's sum over docks, an entry a thread, docks in order, zero entries skipped
struct VkPhaseSum {
  const double* re;
  const double* im;
  const double* c;
  const double* s;
  double* mr;
  double* mi;
  i64 docks;
  i64 width;
};

VK_KERNEL(vk_phase_sum, VkPhaseSum) {
  FOR_EACH(k, a.width) {
    double yr = 0.0;
    double yi = 0.0;

    for (i64 i = 0; i < a.docks; i++) {
      const double xr = a.re[i * a.width + k];
      const double xi = a.im[i * a.width + k];

      if (xr == 0.0 && xi == 0.0) {
        continue;
      }

      const double ci = a.c[i];
      const double sn = a.s[i];

      yr = yr + (ci * xr - sn * xi);
      yi = yi + (ci * xi + sn * xr);
    }

    a.mr[k] = yr;
    a.mi[k] = yi;
  }
}

// ---- register-holes ----

#define HOLE_FIBER_MAX 16

VK_DEVICE i64 vk_pow(i64 b, i64 e) {
  i64 out = 1;

  for (i64 k = 0; k < e; k++) {
    out *= b;
  }

  return out;
}

// oneBody for ONE member i (the host launches member 0, then 1, ...: member i + 1 reads what member i wrote), a line of
// f entries a thread: the line's entries read first, then each output entry summed over k in order, zero entries of
// the transfer skipped
struct VkOneBody {
  double* re;
  double* im;
  const int* mom;
  const double* ar;
  const double* ai;
  i64 n;
  i64 f;
  i64 i;
  i64 rows;
};

VK_KERNEL(vk_hole_one_body, VkOneBody) {
  const i64 n = a.n;
  const i64 f = a.f;
  const i64 st = vk_pow(f, n - 1 - a.i);
  const i64 lines = vk_pow(f, n - 1);
  const i64 block = lines * f;

  FOR_EACH(idx, a.rows * lines) {
    const i64 t = idx / lines;
    const i64 line = idx % lines;
    const i64 hi = line / st;
    const i64 lo = line % st;
    const i64 base = t * block + hi * f * st + lo;
    const i64 m = (i64)a.mom[t * n + a.i] * f * f;
    double xr[HOLE_FIBER_MAX];
    double xi[HOLE_FIBER_MAX];

    for (i64 k = 0; k < f; k++) {
      xr[k] = a.re[base + k * st];
      xi[k] = a.im[base + k * st];
    }

    for (i64 r = 0; r < f; r++) {
      double yr = 0.0;
      double yi = 0.0;
      const i64 ro = m + r * f;

      for (i64 k = 0; k < f; k++) {
        const double tr = a.ar[ro + k];
        const double ti = a.ai[ro + k];

        if (tr == 0.0 && ti == 0.0) {
          continue;
        }

        yr = yr + (tr * xr[k] - ti * xi[k]);
        yi = yi + (tr * xi[k] + ti * xr[k]);
      }

      a.re[base + r * st] = yr;
      a.im[base + r * st] = yi;
    }
  }
}

// bandWeights' local sum, a (tuple, member) a thread, over the member's lines in order
struct VkBand {
  const double* re;
  const double* im;
  const int* mom;
  const double* pr;
  const double* pi;
  double* part;
  i64 n;
  i64 f;
  i64 rows;
};

VK_KERNEL(vk_hole_band, VkBand) {
  const i64 n = a.n;
  const i64 f = a.f;
  const i64 block = vk_pow(f, n);

  FOR_EACH(idx, a.rows * n) {
    const i64 t = idx / n;
    const i64 i = idx % n;
    const i64 off = t * block;
    const i64 p = (i64)a.mom[t * n + i] * f * f;
    const i64 st = vk_pow(f, n - 1 - i);
    const i64 outer = vk_pow(f, i);
    double yr[HOLE_FIBER_MAX];
    double yi[HOLE_FIBER_MAX];
    double w = 0.0;

    for (i64 hi = 0; hi < outer; hi++) {
      for (i64 lo = 0; lo < st; lo++) {
        const i64 base = off + hi * f * st + lo;

        for (i64 r = 0; r < f; r++) {
          double ur = 0.0;
          double ui = 0.0;

          for (i64 k = 0; k < f; k++) {
            const double qr = a.pr[p + r * f + k];
            const double qi = a.pi[p + r * f + k];
            const double xr = a.re[base + k * st];
            const double xi = a.im[base + k * st];

            ur = ur + (qr * xr - qi * xi);
            ui = ui + (qr * xi + qi * xr);
          }

          yr[r] = ur;
          yi[r] = ui;
        }

        for (i64 r = 0; r < f; r++) {
          w = w + (yr[r] * yr[r] + yi[r] * yi[r]);
        }
      }
    }

    a.part[idx] = w;
  }
}

// pairPhases, a batch of orbits [o0, o0 + nb) at a time, in four kinds of pass: the gather (an entry of a column a
// thread), the transform axis by axis (a line of a column a thread, with its own grid scratch), the phase (an entry a
// thread), the scatter (an (orbit, stored row) a thread). Each column entry is the reference's value: the gather and
// scatter are exact copies (and negations), the transform on a line is prim.rs's hole_line operation for operation,
// and the lines of one axis are independent, as they are in the reference's loop

// the gather: column[ob][t] = psign[p] state[rowOf[t] * block + fbOf[o * nperm + p]], p = permOf[t]
struct VkGather {
  const double* re;
  const double* im;
  const int* row_of;
  const int* perm_of;
  const int* psign;
  const int* fb_of;
  double* cr;
  double* ci;
  i64 block;
  i64 nperm;
  i64 tuples;
  i64 o0;
  i64 nb;
};

VK_KERNEL(vk_hp_gather, VkGather) {
  FOR_EACH(idx, a.nb * a.tuples) {
    const i64 ob = idx / a.tuples;
    const i64 t = idx % a.tuples;
    const i64 p = a.perm_of[t];
    const i64 at = (i64)a.row_of[t] * a.block + (i64)a.fb_of[(a.o0 + ob) * a.nperm + p];

    if (a.psign[p] < 0) {
      a.cr[idx] = -a.re[at];
      a.ci[idx] = -a.im[at];
    } else {
      a.cr[idx] = a.re[at];
      a.ci[idx] = a.im[at];
    }
  }
}

// one axis of the column between classes and sites. The scratch is per launched thread (slot), entry g at g * slots +
// slot: the L^4 grid (gr, gi) and the direct sum's L outputs (sr, si)
struct VkAxis {
  double* cr;
  double* ci;
  const int* cog;
  const int* gos;
  const int* goc;
  const double* cos;
  const double* sin;
  double* gr;
  double* gi;
  double* sr;
  double* si;
  double k_sites;
  double k_classes;
  i64 l;
  i64 n;
  i64 g;
  i64 tuples;
  i64 axes;
  i64 axis;
  i64 dir;
  i64 nb;
  i64 slots;
};

// register-holes dft4d on one thread's grid, in place, the radix-4 butterfly at L = 4 and the direct sum otherwise
VK_DEVICE void vk_dft4d(const VkAxis& a, i64 slot, double sign) {
  const i64 l = a.l;
  const i64 S = a.slots;
  double* R = a.gr;
  double* M = a.gi;

  for (i64 axis = 0; axis < 4; axis++) {
    const i64 st = vk_pow(l, 3 - axis);
    const i64 outer = vk_pow(l, axis);

    for (i64 o = 0; o < outer; o++) {
      for (i64 lo = 0; lo < st; lo++) {
        const i64 base = o * l * st + lo;

        if (l == 4) {
          const i64 i0 = (base) * S + slot;
          const i64 i1 = (base + st) * S + slot;
          const i64 i2 = (base + 2 * st) * S + slot;
          const i64 i3 = (base + 3 * st) * S + slot;
          const double a0r = R[i0] + R[i2];
          const double a0i = M[i0] + M[i2];
          const double a1r = R[i0] - R[i2];
          const double a1i = M[i0] - M[i2];
          const double b0r = R[i1] + R[i3];
          const double b0i = M[i1] + M[i3];
          const double b1r = R[i1] - R[i3];
          const double b1i = M[i1] - M[i3];

          R[i0] = a0r + b0r;
          M[i0] = a0i + b0i;
          R[i2] = a0r - b0r;
          M[i2] = a0i - b0i;
          R[i1] = a1r - sign * b1i;
          M[i1] = a1i + sign * b1r;
          R[i3] = a1r + sign * b1i;
          M[i3] = a1i - sign * b1r;
          continue;
        }

        for (i64 m = 0; m < l; m++) {
          double r = 0.0;
          double q = 0.0;

          for (i64 nn = 0; nn < l; nn++) {
            const i64 k = (m * nn) % l;
            const double c = a.cos[k];
            const double s = sign * a.sin[k];
            const double xr = R[(base + nn * st) * S + slot];
            const double xi = M[(base + nn * st) * S + slot];

            r = r + (c * xr - s * xi);
            q = q + (c * xi + s * xr);
          }

          a.sr[m * S + slot] = r;
          a.si[m * S + slot] = q;
        }

        for (i64 m = 0; m < l; m++) {
          R[(base + m * st) * S + slot] = a.sr[m * S + slot];
          M[(base + m * st) * S + slot] = a.si[m * S + slot];
        }
      }
    }
  }
}

VK_KERNEL(vk_hp_axis, VkAxis) {
  const i64 slot = VK_GID;

  if (slot >= a.slots) {
    return;
  }

  const i64 n = a.n;
  const i64 S = a.slots;
  const i64 st = vk_pow(n, a.axes - 1 - a.axis);
  const i64 lines = a.tuples / n;

  for (i64 idx = slot; idx < a.nb * lines; idx += S) {
    const i64 ob = idx / lines;
    const i64 line = idx % lines;
    const i64 o = line / st;
    const i64 lo = line % st;
    double* cr = a.cr + ob * a.tuples;
    double* ci = a.ci + ob * a.tuples;
    const i64 base = o * n * st + lo;

    if (a.dir == 1) {
      // toSites: the classes onto the grid, the transform, the sites off it, scaled
      for (i64 g = 0; g < a.g; g++) {
        const i64 j = a.cog[g];

        a.gr[g * S + slot] = cr[base + j * st];
        a.gi[g * S + slot] = ci[base + j * st];
      }

      vk_dft4d(a, slot, 1.0);

      for (i64 i = 0; i < n; i++) {
        const i64 g = a.gos[i];

        cr[base + i * st] = a.gr[g * S + slot] * a.k_sites;
        ci[base + i * st] = a.gi[g * S + slot] * a.k_sites;
      }
    } else {
      // toClasses: a zero grid, the sites onto it in order, the transform, the classes off it, scaled
      for (i64 g = 0; g < a.g; g++) {
        a.gr[g * S + slot] = 0.0;
        a.gi[g * S + slot] = 0.0;
      }

      for (i64 i = 0; i < n; i++) {
        const i64 g = a.gos[i];

        a.gr[g * S + slot] = cr[base + i * st];
        a.gi[g * S + slot] = ci[base + i * st];
      }

      vk_dft4d(a, slot, -1.0);

      for (i64 j = 0; j < n; j++) {
        const i64 g = a.goc[j];

        cr[base + j * st] = a.gr[g * S + slot] * a.k_classes;
        ci[base + j * st] = a.gi[g * S + slot] * a.k_classes;
      }
    }
  }
}

// the phase of the orbit's pattern at every tuple, unless skip
struct VkPhase {
  double* cr;
  double* ci;
  const int* pattern;
  const double* cos;
  const double* sin;
  const signed char* skip;
  i64 tuples;
  i64 o0;
  i64 nb;
};

VK_KERNEL(vk_hp_phase, VkPhase) {
  FOR_EACH(idx, a.nb * a.tuples) {
    const i64 ob = idx / a.tuples;
    const i64 t = idx % a.tuples;
    const i64 pat = (i64)a.pattern[a.o0 + ob] * a.tuples;

    if (a.skip[pat + t] != 0) {
      continue;
    }

    const double c = a.cos[pat + t];
    const double sn = a.sin[pat + t];
    const double xr = a.cr[idx];
    const double xi = a.ci[idx];

    a.cr[idx] = c * xr - sn * xi;
    a.ci[idx] = c * xi + sn * xr;
  }
}

// the scatter: for each stored row r and each (c, tau) of the orbit's write list, state[r * block + c] = psign[tau]
// column[tOf[r * nperm + tau]]
struct VkScatter {
  double* re;
  double* im;
  const double* cr;
  const double* ci;
  const int* psign;
  const int* write_off;
  const int* write_c;
  const int* write_tau;
  const int* t_of;
  i64 block;
  i64 nperm;
  i64 rows;
  i64 tuples;
  i64 o0;
  i64 nb;
};

VK_KERNEL(vk_hp_scatter, VkScatter) {
  FOR_EACH(idx, a.nb * a.rows) {
    const i64 ob = idx / a.rows;
    const i64 r = idx % a.rows;
    const i64 o = a.o0 + ob;
    const double* cr = a.cr + ob * a.tuples;
    const double* ci = a.ci + ob * a.tuples;

    for (i64 w = a.write_off[o]; w < a.write_off[o + 1]; w++) {
      const i64 c = a.write_c[w];
      const i64 tau = a.write_tau[w];
      const i64 t = a.t_of[r * a.nperm + tau];
      const i64 at = r * a.block + c;

      if (a.psign[tau] < 0) {
        a.re[at] = -cr[t];
        a.im[at] = -ci[t];
      } else {
        a.re[at] = cr[t];
        a.im[at] = ci[t];
      }
    }
  }
}
