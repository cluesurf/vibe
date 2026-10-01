// THE VIBE KERNEL PRIMITIVES, the arithmetic. code/kernel/
// Each function is a line-for-line restatement of a loop in a TypeScript engine (named at each function), written so that
// every floating-point operation is the same operation, on the same operands, in the same order: JavaScript evaluates
// a + b - c * d as ((a + b) - (c * d)) with every operation rounded to double, and so does C99 once contraction is off.
// So each output element is bitwise the reference's, and a range of rows is independent of every other range.
//
// Rules this file keeps (a result that breaks one is worthless to the gates it feeds):
//   no fused multiply-add: built with -ffp-contract=off, and no fma() call anywhere
//   no reassociation: no -ffast-math, no reductions split into partial sums unless the reference splits them the same way
//   signed zeros kept: a zero test is == 0 (true for -0, as JavaScript's === is), and a skipped addition is skipped in
//   the reference too
//   sums in the reference's order: a row's terms are added root by root, entry by entry, exactly as the loop runs

#include "kernel.h"

#include <string.h>

#define PAIR 64
#define SITE 256
#define NR 24
#define REG 8
#define MODES 192
#define FULL (MODES * MODES)

// code/measure/register-ball-reduced conv and code/measure/register-reduced conv (the same loop), rows [start, end)
void vk_conv(const vk_pair_op *op, const double *srcRe, const double *srcIm,
             int32_t srcOff, int32_t srcStride, int32_t t, double *outRe,
             double *outIm, int32_t member, int32_t dagger, int32_t start,
             int32_t end) {
  const int usePlus = !((member == 1) != (dagger != 0));
  const int32_t *repT = usePlus ? op->plusRep : op->minusRep;
  const int32_t *gT = usePlus ? op->plusG : op->minusG;
  const int32_t *off = dagger ? op->offT : op->off;
  const int8_t *row = dagger ? op->rowT : op->row;
  const int8_t *col = dagger ? op->colT : op->col;
  const double *val = dagger ? op->valT : op->val;
  const double sg = dagger ? -1.0 : 1.0;
  double tr[PAIR];
  double ti[PAIR];

  memset(outRe + (int64_t)start * PAIR, 0,
         sizeof(double) * (size_t)(end - start) * PAIR);
  memset(outIm + (int64_t)start * PAIR, 0,
         sizeof(double) * (size_t)(end - start) * PAIR);

  for (int32_t i = start; i < end; i++) {
    const int64_t oo = (int64_t)i * PAIR;

    for (int32_t d = 0; d < NR; d++) {
      const int32_t j = repT[(int64_t)i * NR + d];

      if (j < 0) {
        continue;
      }

      const int64_t base = ((int64_t)gT[(int64_t)i * NR + d] * 4 + t) * PAIR;
      const int16_t *src = op->src + base;
      const int8_t *sgn = op->sgn + base;
      const int64_t so = (int64_t)j * srcStride + srcOff;

      for (int k = 0; k < PAIR; k++) {
        const double f = (double)sgn[k];
        const int64_t at = so + src[k];

        tr[k] = f * srcRe[at];
        ti[k] = f * srcIm[at];
      }

      const double pr = op->halfRe[d];
      const double pi = sg * op->halfIm[d];

      for (int32_t q = off[d]; q < off[d + 1]; q++) {
        const int r = row[q];
        const int c = col[q];
        const double v = val[q];
        const double wr = v * pr;
        const double wi = v * pi;

        if (member == 1) {
          const int64_t ob = oo + r * 8;
          const int sb = c * 8;

          for (int r2 = 0; r2 < 8; r2++) {
            const double xr = tr[sb + r2];
            const double xi = ti[sb + r2];

            outRe[ob + r2] = outRe[ob + r2] + (wr * xr - wi * xi);
            outIm[ob + r2] = outIm[ob + r2] + (wr * xi + wi * xr);
          }
        } else {
          for (int r1 = 0; r1 < 8; r1++) {
            const double xr = tr[r1 * 8 + c];
            const double xi = ti[r1 * 8 + c];

            outRe[oo + r1 * 8 + r] = outRe[oo + r1 * 8 + r] + (wr * xr - wi * xi);
            outIm[oo + r1 * 8 + r] = outIm[oo + r1 * 8 + r] + (wr * xi + wi * xr);
          }
        }
      }
    }
  }
}

// ballCycle's and register-reduced beats' site-local update, one beat. Beat 1: main A, B from g, X from e, beta1;
// beat 2: main D, B from e, X from g, beta2
void vk_pair_beat(double *re, double *im, const double *t1r, const double *t1i,
                  const double *t2r, const double *t2i, const double *fr,
                  const double *fi, const double *qBr, const double *qBi,
                  const double *qXr, const double *qXi, const double *beta,
                  double alr, double ali, int32_t mainOff, int32_t start,
                  int32_t end) {
  for (int32_t i = start; i < end; i++) {
    const double b1r = beta[2 * (int64_t)i];
    const double b1i = beta[2 * (int64_t)i + 1];

    for (int k = 0; k < PAIR; k++) {
      const int64_t c = (int64_t)i * PAIR + k;
      const int64_t Mi = (int64_t)i * SITE + mainOff + k;
      const int64_t Bi = (int64_t)i * SITE + 64 + k;
      const int64_t Xi = (int64_t)i * SITE + 128 + k;
      const double aR = re[Mi];
      const double aI = im[Mi];
      const double p1r = aR + t1r[c];
      const double p1i = aI + t1i[c];
      const double p2r = aR + t2r[c];
      const double p2i = aI + t2i[c];
      const double psr = p1r + t2r[c] + fr[c];
      const double psi = p1i + t2i[c] + fi[c];

      re[Mi] = aR + alr * (p1r + p2r) - ali * (p1i + p2i) + b1r * psr - b1i * psi;
      im[Mi] = aI + alr * (p1i + p2i) + ali * (p1r + p2r) + b1r * psi + b1i * psr;

      const double bR = re[Bi];
      const double bI = im[Bi];
      const double qbr = bR + qBr[c];
      const double qbi = bI + qBi[c];

      re[Bi] = bR + alr * qbr - ali * qbi;
      im[Bi] = bI + alr * qbi + ali * qbr;

      const double xR = re[Xi];
      const double xI = im[Xi];
      const double qxr = xR + qXr[c];
      const double qxi = xI + qXi[c];

      re[Xi] = xR + alr * qxr - ali * qxi;
      im[Xi] = xI + alr * qxi + ali * qxr;
    }
  }
}

// register-reduced crossProjection then crossPiece, fused per representative (the projection at i reads only i's own
// block, and the piece writes only it)
void vk_cross_apply(double *re, double *im, const double *t1r,
                    const double *t1i, const double *t2r, const double *t2i,
                    const double *t4r, const double *t4i, const double *cross,
                    int32_t own, int32_t start, int32_t end) {
  for (int32_t i = start; i < end; i++) {
    const double cr = cross[2 * (int64_t)i];
    const double ci = cross[2 * (int64_t)i + 1];

    if (cr == 0 && ci == 0) {
      continue;
    }

    for (int k = 0; k < PAIR; k++) {
      const int64_t c = (int64_t)i * PAIR + k;
      const int64_t o = (int64_t)i * SITE + own + k;
      const double xr = re[o] + t1r[c] + t2r[c] + t4r[c];
      const double xi = im[o] + t1i[c] + t2i[c] + t4i[c];

      re[o] = re[o] + (cr * xr - ci * xi);
      im[o] = im[o] + (cr * xi + ci * xr);
    }
  }
}

// ballGram's add
void vk_block_add(double *outRe, double *outIm, const double *fr,
                  const double *fi, int32_t off, int32_t start, int32_t end) {
  for (int32_t i = start; i < end; i++) {
    for (int k = 0; k < PAIR; k++) {
      const int64_t o = (int64_t)i * SITE + off + k;
      const int64_t c = (int64_t)i * PAIR + k;

      outRe[o] = outRe[o] + fr[c];
      outIm[o] = outIm[o] + fi[c];
    }
  }
}

// ballInner's per-representative local product
void vk_block_inner(const double *aRe, const double *aIm, const double *bRe,
                    const double *bIm, double *partRe, double *partIm,
                    int32_t start, int32_t end) {
  for (int32_t i = start; i < end; i++) {
    double sr = 0;
    double si = 0;

    for (int64_t k = (int64_t)i * SITE; k < ((int64_t)i + 1) * SITE; k++) {
      const double xr = aRe[k];
      const double xi = aIm[k];
      const double yr = bRe[k];
      const double yi = bIm[k];

      sr = sr + (xr * yr + xi * yi);
      si = si + (xr * yi - xi * yr);
    }

    partRe[i] = sr;
    partIm[i] = si;
  }
}

// axpyBall and scaleBall
void vk_axpy(double *yRe, double *yIm, const double *xRe, const double *xIm,
             double fr, double fi, int32_t start, int32_t end) {
  for (int32_t i = start; i < end; i++) {
    const double r = xRe[i];
    const double m = xIm[i];

    yRe[i] = yRe[i] + (fr * r - fi * m);
    yIm[i] = yIm[i] + (fr * m + fi * r);
  }
}

void vk_scale(double *re, double *im, double f, int32_t start, int32_t end) {
  for (int32_t i = start; i < end; i++) {
    re[i] = re[i] * f;
    im[i] = im[i] * f;
  }
}

// register-sea sectorPiece (with seaBeat's `whole` phase first when phase is given), docks [start, end)
void vk_sea_piece(double *re, double *im, const double *E, const double *alpha,
                  const double *beta, const double *phase, int32_t start,
                  int32_t end) {
  double Lr[REG * MODES];
  double Li[REG * MODES];
  double Rr[MODES * REG];
  double Ri[MODES * REG];
  double Cr[REG * REG];
  double Ci[REG * REG];
  double gr[REG];
  double gi[REG];

  for (int32_t dock = start; dock < end; dock++) {
    const int64_t off = (int64_t)dock * FULL;

    if (phase) {
      const double c = phase[2 * (int64_t)dock];
      const double sn = phase[2 * (int64_t)dock + 1];

      for (int64_t k = 0; k < FULL; k++) {
        const double xr = re[off + k];
        const double xi = im[off + k];

        re[off + k] = c * xr - sn * xi;
        im[off + k] = c * xi + sn * xr;
      }
    }

    memset(Lr, 0, sizeof Lr);
    memset(Li, 0, sizeof Li);
    memset(Rr, 0, sizeof Rr);
    memset(Ri, 0, sizeof Ri);
    memset(Cr, 0, sizeof Cr);
    memset(Ci, 0, sizeof Ci);
    memset(gr, 0, sizeof gr);
    memset(gi, 0, sizeof gi);

    for (int s1 = 0; s1 < MODES; s1++) {
      const int64_t o = off + (int64_t)s1 * MODES;

      for (int eta = 0; eta < REG; eta++) {
        const double w = E[s1 * REG + eta];

        if (w == 0) {
          continue;
        }

        const int lo = eta * MODES;

        for (int s2 = 0; s2 < MODES; s2++) {
          Lr[lo + s2] = Lr[lo + s2] + w * re[o + s2];
          Li[lo + s2] = Li[lo + s2] + w * im[o + s2];
        }
      }

      for (int s2 = 0; s2 < MODES; s2++) {
        const double xr = re[o + s2];
        const double xi = im[o + s2];

        if (xr == 0 && xi == 0) {
          continue;
        }

        for (int eta = 0; eta < REG; eta++) {
          const double w = E[s2 * REG + eta];

          Rr[s1 * REG + eta] = Rr[s1 * REG + eta] + w * xr;
          Ri[s1 * REG + eta] = Ri[s1 * REG + eta] + w * xi;
        }
      }
    }

    for (int eta = 0; eta < REG; eta++) {
      for (int s2 = 0; s2 < MODES; s2++) {
        const double xr = Lr[eta * MODES + s2];
        const double xi = Li[eta * MODES + s2];

        for (int z = 0; z < REG; z++) {
          const double w = E[s2 * REG + z];

          Cr[eta * REG + z] = Cr[eta * REG + z] + w * xr;
          Ci[eta * REG + z] = Ci[eta * REG + z] + w * xi;
        }
      }
    }

    const double ar = alpha[2 * (int64_t)dock];
    const double ai = alpha[2 * (int64_t)dock + 1];
    const double br = beta[2 * (int64_t)dock];
    const double bi = beta[2 * (int64_t)dock + 1];

    for (int s1 = 0; s1 < MODES; s1++) {
      for (int z = 0; z < REG; z++) {
        double cr = 0;
        double ci = 0;

        for (int eta = 0; eta < REG; eta++) {
          const double w = E[s1 * REG + eta];

          cr = cr + w * Cr[eta * REG + z];
          ci = ci + w * Ci[eta * REG + z];
        }

        const double rr = Rr[s1 * REG + z];
        const double ri = Ri[s1 * REG + z];

        gr[z] = ar * rr - ai * ri + br * cr - bi * ci;
        gi[z] = ar * ri + ai * rr + br * ci + bi * cr;
      }

      const int64_t o = off + (int64_t)s1 * MODES;

      for (int s2 = 0; s2 < MODES; s2++) {
        double sr = 0;
        double si = 0;

        for (int eta = 0; eta < REG; eta++) {
          const double w1 = E[s1 * REG + eta];
          const double w2 = E[s2 * REG + eta];

          if (w1 != 0) {
            const double lr = Lr[eta * MODES + s2];
            const double li = Li[eta * MODES + s2];

            sr = sr + w1 * (ar * lr - ai * li);
            si = si + w1 * (ar * li + ai * lr);
          }

          if (w2 != 0) {
            sr = sr + w2 * gr[eta];
            si = si + w2 * gi[eta];
          }
        }

        re[o + s2] = re[o + s2] + sr;
        im[o + s2] = im[o + s2] + si;
      }
    }
  }
}

// register-sea seaBeat's swap coin and stream, source docks [start, end): for each (d, e) the move is a bijection of
// docks, so two source docks never write one destination
void vk_sea_stream(const double *sRe, const double *sIm, double *oRe,
                   double *oIm, const int32_t *move, const int32_t *opposite,
                   int32_t start, int32_t end) {
  for (int32_t i = start; i < end; i++) {
    for (int d = 0; d < NR; d++) {
      const int from1 = opposite[d];

      for (int e = 0; e < NR; e++) {
        const int64_t j = move[(int64_t)i * NR * NR + d * NR + e];
        const int from2 = opposite[e];

        for (int a = 0; a < REG; a++) {
          const int64_t src = (int64_t)i * FULL + (int64_t)(from1 * REG + a) * MODES + from2 * REG;
          const int64_t dst = j * FULL + (int64_t)(d * REG + a) * MODES + e * REG;

          memcpy(oRe + dst, sRe + src, sizeof(double) * REG);
          memcpy(oIm + dst, sIm + src, sizeof(double) * REG);
        }
      }
    }
  }
}

// register-sea pairAt's sum over docks, entries [start, end)
void vk_phase_sum(const double *re, const double *im, const double *c,
                  const double *s, int32_t docks, int32_t width, double *mRe,
                  double *mIm, int32_t start, int32_t end) {
  memset(mRe + start, 0, sizeof(double) * (size_t)(end - start));
  memset(mIm + start, 0, sizeof(double) * (size_t)(end - start));

  for (int32_t i = 0; i < docks; i++) {
    const double ci = c[i];
    const double sn = s[i];
    const int64_t o = (int64_t)i * width;

    for (int32_t k = start; k < end; k++) {
      const double xr = re[o + k];
      const double xi = im[o + k];

      if (xr == 0 && xi == 0) {
        continue;
      }

      mRe[k] = mRe[k] + (ci * xr - sn * xi);
      mIm[k] = mIm[k] + (ci * xi + sn * xr);
    }
  }
}
