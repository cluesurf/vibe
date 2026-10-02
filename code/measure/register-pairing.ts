// A PAIRING MEAN FIELD ON THE REGISTER RULE (E-FND-0173). Hartree-Fock keeps no pair correlations; its pairing version
// (Bogoliubov-de Gennes, BCS) can. This module is that new piece and nothing else: it is a reading of the rule, not the
// rule. The rule supplies three things exactly, and the reading adds one step.
//
//   the band      one hole of the register sea moves on the 8 moving states a momentum of one half (E-FND-0161's frame,
//                 E-SPN-0160's walk); the free cycle there is A2(q) A1(q), unitary. The band reading is the cycle's own
//                 Floquet Hamiltonian h(q) = i log(-A2 A1) (the eigenphases sit near pi, so -U puts them near 0; the shift
//                 by pi a hole is a constant on any fixed hole number)
//   the channels  beat 1's pair piece acts on two holes that both sit in S at one site, beat 2's on two that both sit in
//                 D at one site (the contact; E-SPN-0175's sector pieces, the only pair pieces that keep the flats). In
//                 beat 1's frame an S mode at q is fiber a = 0..3, and a D mode is row a of A1(q) (the transfer to beat 2's
//                 frame, where D is fibers 0..3). The pair operator of a channel at one site is B_ab = s_b s_a, a < b
//   the phases    beat 1 multiplies a contact pair in S by e^(i phi), beat 2 a contact pair in D by e^(-i phi), with
//                 phi = -2 theta_v = -2.668 for holes (E-SPN-0175's reversal)
//   the reading   a phase e^(i phi) on n_a n_b is e^(-i H) with H = -phi n_a n_b + 2 pi k; to first order in the cycle
//                 (the pieces summed, commutators dropped) H_eff = h + sum_channels g sum_x sum_{a<b} B_ab^dag B_ab, with
//                 g_S = -phi and g_D = +phi on the principal branch (|phi| < pi). The pairing mean field replaces
//                 B^dag B by <B^dag> B + B^dag <B> - |<B>|^2 and solves Delta_ab = g <B_ab(x)> self-consistently at a
//                 chemical potential. Hartree and Fock shifts are left out (they move mu, standard BCS)
//
// THE SOLVER (generic, so the textbook control runs through the same code). Each momentum q has an n x n Hermitian h(q),
// its negative's index, and per channel four rows sigma_a(q) (the mode s_a(q) = sum_m sigma_a(q)_m c_{q m}). With the
// Nambu spinor Psi_q = (c_q, c^dag_{-q}), H = (1/2) sum_q Psi^dag H_BdG Psi, H_BdG = [[h(q) - mu, D(q)], [D(q)^dag,
// -(h(-q) - mu)^T]], D(q) = X(q) - X(-q)^T, X(q)_mn = sum_ch sum_{a<b} Delta_ab conj(sigma_a(q)_m) conj(sigma_b(-q)_n).
// At zero temperature <Psi Psi^dag> is the projector P_+ on the positive BdG levels, so <c_{-q m} c_{q n}> =
// -P_+(q)[n, n + m] and <B_ab(x)> = (1/N) sum_q sum_mn sigma_b(-q)_m sigma_a(q)_n <c_{-q m} c_{q n}>.
//
// DETERMINISM: no random numbers; seeds come from code/tool/weyl. FLOATS: the eigensolver is cyclic complex Jacobi to the
// float floor, checked by residual.

import { weyl } from '@/code/tool/weyl'

export type CM = { re: Float64Array; im: Float64Array }

export const cm = (n: number): CM => ({
  re: new Float64Array(n * n),
  im: new Float64Array(n * n),
})

export function cmMul(A: CM, B: CM, n: number): CM {
  const C = cm(n)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ar = A.re[i * n + k]!
      const ai = A.im[i * n + k]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let j = 0; j < n; j++) {
        const br = B.re[k * n + j]!
        const bi = B.im[k * n + j]!

        C.re[i * n + j]! += ar * br - ai * bi
        C.im[i * n + j]! += ar * bi + ai * br
      }
    }
  }

  return C
}

// ---- cyclic Jacobi for a complex Hermitian matrix ----

export type Eigen = { values: Float64Array; V: CM; residual: number }

// eigenvalues ascending, V's columns the eigenvectors; residual = max_i |A v_i - lambda_i v_i|
export function eigH(A0: CM, n: number): Eigen {
  const A: CM = {
    re: Float64Array.from(A0.re),
    im: Float64Array.from(A0.im),
  }
  const V = cm(n)

  for (let i = 0; i < n; i++) {
    V.re[i * n + i] = 1
  }

  let scale = 0

  for (let k = 0; k < n * n; k++) {
    scale += A.re[k]! ** 2 + A.im[k]! ** 2
  }

  const floor = 1e-30 * Math.max(scale, 1e-300)

  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        off += A.re[p * n + q]! ** 2 + A.im[p * n + q]! ** 2
      }
    }

    if (off <= floor) {
      break
    }

    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        const xr = A.re[p * n + q]!
        const xi = A.im[p * n + q]!
        const r = Math.hypot(xr, xi)

        if (r < 1e-300) {
          continue
        }

        // A_pq = r e^(i th); J = Phi P, Phi_qq = e^(-i th), P the real rotation zeroing r
        const er = xr / r
        const ei = xi / r
        const app = A.re[p * n + p]!
        const aqq = A.re[q * n + q]!
        const zeta = (aqq - app) / (2 * r)
        const t =
          (zeta >= 0 ? 1 : -1) /
          (Math.abs(zeta) + Math.sqrt(1 + zeta * zeta))
        const c = 1 / Math.sqrt(1 + t * t)
        const s = t * c

        // columns: p <- c a_p - s e^(-i th) a_q ; q <- s a_p + c e^(-i th) a_q
        const cols = (M: CM): void => {
          for (let k = 0; k < n; k++) {
            const pr = M.re[k * n + p]!
            const pi = M.im[k * n + p]!
            const qr = M.re[k * n + q]!
            const qi = M.im[k * n + q]!
            // e^(-i th) a_q
            const wr = er * qr + ei * qi
            const wi = er * qi - ei * qr

            M.re[k * n + p] = c * pr - s * wr
            M.im[k * n + p] = c * pi - s * wi
            M.re[k * n + q] = s * pr + c * wr
            M.im[k * n + q] = s * pi + c * wi
          }
        }

        cols(A)
        cols(V)

        // rows: p <- c r_p - s e^(i th) r_q ; q <- s r_p + c e^(i th) r_q
        for (let k = 0; k < n; k++) {
          const pr = A.re[p * n + k]!
          const pi = A.im[p * n + k]!
          const qr = A.re[q * n + k]!
          const qi = A.im[q * n + k]!
          const wr = er * qr - ei * qi
          const wi = er * qi + ei * qr

          A.re[p * n + k] = c * pr - s * wr
          A.im[p * n + k] = c * pi - s * wi
          A.re[q * n + k] = s * pr + c * wr
          A.im[q * n + k] = s * pi + c * wi
        }
      }
    }
  }

  const order = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => A.re[a * n + a]! - A.re[b * n + b]!,
  )
  const values = Float64Array.from(order.map(i => A.re[i * n + i]!))
  const W = cm(n)

  order.forEach((src, dst) => {
    for (let k = 0; k < n; k++) {
      W.re[k * n + dst] = V.re[k * n + src]!
      W.im[k * n + dst] = V.im[k * n + src]!
    }
  })

  let residual = 0

  for (let i = 0; i < n; i++) {
    for (let r = 0; r < n; r++) {
      let yr = -values[i]! * W.re[r * n + i]!
      let yi = -values[i]! * W.im[r * n + i]!

      for (let k = 0; k < n; k++) {
        const ar = A0.re[r * n + k]!
        const ai = A0.im[r * n + k]!
        const vr = W.re[k * n + i]!
        const vi = W.im[k * n + i]!

        yr += ar * vr - ai * vi
        yi += ar * vi + ai * vr
      }

      residual = Math.max(residual, Math.hypot(yr, yi))
    }
  }

  return { values, V: W, residual }
}

// the Floquet Hamiltonian of a unitary whose eigenphases lie in (-pi/2, pi/2): U = e^(-i h). From the Hermitian
// S = (U^dag - U) / (2 i), whose eigenvalues are sin(eps); checks cos(eps) > 0 and |U v - e^(-i eps) v|
export function floquetH(
  U: CM,
  n: number,
): { h: CM; eps: Float64Array; residual: number; minCos: number } {
  const S = cm(n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // (U^dag)_ij = conj(U_ji)
      const dr = U.re[j * n + i]!
      const di = -U.im[j * n + i]!
      const zr = dr - U.re[i * n + j]!
      const zi = di - U.im[i * n + j]!

      // z / (2 i) = (zi - i zr) / 2
      S.re[i * n + j] = zi / 2
      S.im[i * n + j] = -zr / 2
    }
  }

  const e = eigH(S, n)
  const eps = e.values.map(x => Math.asin(Math.max(-1, Math.min(1, x))))
  const h = cm(n)

  let residual = 0
  let minCos = Infinity

  for (let i = 0; i < n; i++) {
    const cr = Math.cos(eps[i]!)
    const ci = -Math.sin(eps[i]!)

    let lr = 0

    for (let r = 0; r < n; r++) {
      let yr = 0
      let yi = 0

      for (let k = 0; k < n; k++) {
        const ur = U.re[r * n + k]!
        const ui = U.im[r * n + k]!
        const vr = e.V.re[k * n + i]!
        const vi = e.V.im[k * n + i]!

        yr += ur * vr - ui * vi
        yi += ur * vi + ui * vr
      }

      const vr = e.V.re[r * n + i]!
      const vi = e.V.im[r * n + i]!

      // Re conj(v_r) y_r, summed: Re <v|U|v> = cos(eps)
      lr += vr * yr + vi * yi
      residual = Math.max(
        residual,
        Math.hypot(yr - (cr * vr - ci * vi), yi - (cr * vi + ci * vr)),
      )
    }

    minCos = Math.min(minCos, lr)
  }

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      let xr = 0
      let xi = 0

      for (let i = 0; i < n; i++) {
        const ar = e.V.re[r * n + i]!
        const ai = e.V.im[r * n + i]!
        const br = e.V.re[c * n + i]!
        const bi = -e.V.im[c * n + i]!

        xr += eps[i]! * (ar * br - ai * bi)
        xi += eps[i]! * (ar * bi + ai * br)
      }

      h.re[r * n + c] = xr
      h.im[r * n + c] = xi
    }
  }

  return { h, eps, residual, minCos }
}

// ---- the pairing problem ----

export type Channel = {
  name: string
  g: number
  // per momentum, 4 rows of length n: rows[q] is a 4 x n complex array, row-major [a * n + m]
  rows: CM[]
}

export type PairProblem = {
  n: number
  // per momentum
  h: CM[]
  neg: Int32Array
  channels: Channel[]
}

// the pair labels a < b of four sector modes
export const PAIRS: readonly (readonly [number, number])[] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
  [2, 3],
]

export type PairState = {
  // Delta per channel, 6 complex each: [ch][2 * p], [ch][2 * p + 1]
  delta: Float64Array[]
  // <B_ab(x)> per channel
  pair: Float64Array[]
  filling: number
  // the smallest |E| of the BdG spectrum over the momenta
  gap: number
  residual: number
  // the mean-field grand potential a site, (1/N) sum_q (1/2)(sum_{E<0} E + tr(h - mu)) - sum |Delta|^2 / g
  omega: number
}

// one evaluation: the BdG ground state at mu for given Deltas, its pair amplitudes and filling
export function bdgEvaluate(
  P: PairProblem,
  mu: number,
  delta: readonly Float64Array[],
  pairsUsed = PAIRS.length,
): PairState {
  const n = P.n
  const N = P.h.length
  const m2 = 2 * n
  const pair = P.channels.map(() => new Float64Array(2 * PAIRS.length))

  let fill = 0
  let gap = Infinity
  let residual = 0
  let bdg = 0

  // X(q) for every q
  const X: CM[] = P.h.map((_, q) => {
    const Xq = cm(n)
    const qn = P.neg[q]!

    P.channels.forEach((ch, c) => {
      const Rq = ch.rows[q]!
      const Rn = ch.rows[qn]!

      for (let p = 0; p < pairsUsed; p++) {
        const [a, b] = PAIRS[p]!
        const dr = delta[c]![2 * p]!
        const di = delta[c]![2 * p + 1]!

        if (dr === 0 && di === 0) {
          continue
        }

        for (let i = 0; i < n; i++) {
          // conj(sigma_a(q)_i)
          const sr = Rq.re[a * n + i]!
          const si = -Rq.im[a * n + i]!
          // Delta conj(sigma_a)
          const tr = dr * sr - di * si
          const ti = dr * si + di * sr

          for (let j = 0; j < n; j++) {
            const ur = Rn.re[b * n + j]!
            const ui = -Rn.im[b * n + j]!

            Xq.re[i * n + j]! += tr * ur - ti * ui
            Xq.im[i * n + j]! += tr * ui + ti * ur
          }
        }
      }
    })

    return Xq
  })

  for (let q = 0; q < N; q++) {
    const qn = P.neg[q]!
    const H = cm(m2)
    const hq = P.h[q]!
    const hn = P.h[qn]!

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        H.re[i * m2 + j] = hq.re[i * n + j]! - (i === j ? mu : 0)
        H.im[i * m2 + j] = hq.im[i * n + j]!
        // -(h(-q) - mu)^T
        H.re[(n + i) * m2 + n + j] =
          -hn.re[j * n + i]! + (i === j ? mu : 0)
        H.im[(n + i) * m2 + n + j] = -hn.im[j * n + i]!

        // D = X(q) - X(-q)^T
        const dr = X[q]!.re[i * n + j]! - X[qn]!.re[j * n + i]!
        const di = X[q]!.im[i * n + j]! - X[qn]!.im[j * n + i]!

        H.re[i * m2 + n + j] = dr
        H.im[i * m2 + n + j] = di
        // D^dag at (n + j, i)
        H.re[(n + j) * m2 + i] = dr
        H.im[(n + j) * m2 + i] = -di
      }
    }

    const e = eigH(H, m2)

    residual = Math.max(residual, e.residual)

    // P_+ = sum over positive levels of v v^dag; G[r][c] = sum v_r conj(v_c)
    const G = cm(m2)

    for (let i = 0; i < n; i++) {
      bdg += (hq.re[i * n + i]! - mu) / 2
    }

    for (let l = 0; l < m2; l++) {
      const E = e.values[l]!

      gap = Math.min(gap, Math.abs(E))

      if (E < 0) {
        bdg += E / 2
      }

      if (E <= 0) {
        continue
      }

      for (let r = 0; r < m2; r++) {
        const ar = e.V.re[r * m2 + l]!
        const ai = e.V.im[r * m2 + l]!

        for (let c = 0; c < m2; c++) {
          const br = e.V.re[c * m2 + l]!
          const bi = e.V.im[c * m2 + l]!

          G.re[r * m2 + c]! += ar * br + ai * bi
          G.im[r * m2 + c]! += ai * br - ar * bi
        }
      }
    }

    for (let i = 0; i < n; i++) {
      fill += 1 - G.re[i * m2 + i]!
    }

    // <B_ab> += sum_mn sigma_b(-q)_m sigma_a(q)_n (-G[n][n + m])
    P.channels.forEach((ch, c) => {
      const Rq = ch.rows[q]!
      const Rn = ch.rows[qn]!

      for (let p = 0; p < PAIRS.length; p++) {
        const [a, b] = PAIRS[p]!

        let sr = 0
        let si = 0

        for (let nn = 0; nn < n; nn++) {
          const ar = Rq.re[a * n + nn]!
          const ai = Rq.im[a * n + nn]!

          if (ar === 0 && ai === 0) {
            continue
          }

          for (let m = 0; m < n; m++) {
            const br = Rn.re[b * n + m]!
            const bi = Rn.im[b * n + m]!
            const gr = -G.re[nn * m2 + n + m]!
            const gi = -G.im[nn * m2 + n + m]!
            // sigma_b sigma_a g
            const xr = br * ar - bi * ai
            const xi = br * ai + bi * ar

            sr += xr * gr - xi * gi
            si += xr * gi + xi * gr
          }
        }

        pair[c]![2 * p]! += sr / N
        pair[c]![2 * p + 1]! += si / N
      }
    })
  }

  let cost = 0

  P.channels.forEach((ch, c) => {
    if (ch.g !== 0) {
      cost += delta[c]!.reduce((a, x) => a + x * x, 0) / ch.g
    }
  })

  return {
    delta: delta.map(d => Float64Array.from(d)),
    pair,
    filling: fill / (n * N),
    gap,
    residual,
    omega: bdg / N - cost,
  }
}

export type GapSolution = PairState & {
  iterations: number
  // the last step's residual max |g <B> - Delta|
  change: number
  // the Frobenius norm of Delta over the six pairs, per channel
  norm: number[]
  // the start's largest channel norm
  seedNorm: number
}

export const deltaNorm = (d: Float64Array): number =>
  Math.sqrt(d.reduce((a, x) => a + x * x, 0))

export type SolveOptions = {
  // a Weyl-spread seed of this size (ignored when start is given)
  seed: number
  seedIndex: number
  start?: readonly Float64Array[]
  maxIter: number
  tol: number
  // the Anderson step's mixing and memory (memory 0: plain mixing Delta <- Delta + mix (g <B> - Delta))
  mix: number
  memory: number
  // plain mixing steps before Anderson starts (Anderson alone can settle on the unstable Delta = 0 of an attractive
  // channel; plain mixing leaves it)
  plain: number
  pairsUsed?: number
}

// small dense least squares min |F gamma - f| by normal equations with a Tikhonov floor
function leastSquares(
  cols: Float64Array[],
  f: Float64Array,
): Float64Array {
  const m = cols.length
  const A = Array.from({ length: m }, (_, i) =>
    Array.from({ length: m }, (_, j) =>
      cols[i]!.reduce((a, x, k) => a + x * cols[j]![k]!, 0),
    ),
  )
  const b = cols.map(c => c.reduce((a, x, k) => a + x * f[k]!, 0))
  const tr = A.reduce((a, r, i) => a + r[i]!, 0)

  A.forEach((r, i) => (r[i]! += 1e-12 * tr + 1e-300))

  // Gaussian elimination with partial pivoting
  for (let c = 0; c < m; c++) {
    let piv = c

    for (let r = c + 1; r < m; r++) {
      if (Math.abs(A[r]![c]!) > Math.abs(A[piv]![c]!)) {
        piv = r
      }
    }

    ;[A[c], A[piv]] = [A[piv]!, A[c]!]
    ;[b[c], b[piv]] = [b[piv]!, b[c]!]

    for (let r = c + 1; r < m; r++) {
      const t = A[r]![c]! / A[c]![c]!

      for (let k = c; k < m; k++) {
        A[r]![k]! -= t * A[c]![k]!
      }

      b[r]! -= t * b[c]!
    }
  }

  const x = new Float64Array(m)

  for (let r = m - 1; r >= 0; r--) {
    let s = b[r]!

    for (let k = r + 1; k < m; k++) {
      s -= A[r]![k]! * x[k]!
    }

    x[r] = s / A[r]![r]!
  }

  return x
}

// the gap equation Delta = g <B>(Delta) at chemical potential mu, by Anderson-accelerated fixed-point iteration
export function solveGap(
  P: PairProblem,
  mu: number,
  opts: SolveOptions,
): GapSolution {
  const used = opts.pairsUsed ?? PAIRS.length
  const C = P.channels.length
  const len = 2 * PAIRS.length

  const pack = (d: readonly Float64Array[]): Float64Array => {
    const x = new Float64Array(C * len)

    d.forEach((v, c) => x.set(v, c * len))

    return x
  }

  const unpack = (x: Float64Array): Float64Array[] =>
    Array.from({ length: C }, (_, c) =>
      Float64Array.from(x.subarray(c * len, (c + 1) * len)),
    )
  const start =
    opts.start?.map(d => Float64Array.from(d)) ??
    P.channels.map((ch, c) =>
      Float64Array.from({ length: len }, (_, k) =>
        Math.floor(k / 2) < used && ch.g !== 0
          ? opts.seed * (2 * weyl(opts.seedIndex + 13 * c + k) - 1)
          : 0,
      ),
    )
  const seedNorm = Math.max(...start.map(deltaNorm))
  const mapOf = (st: PairState): Float64Array =>
    pack(
      P.channels.map((ch, c) =>
        Float64Array.from(st.pair[c]!, (x, k) =>
          Math.floor(k / 2) < used ? ch.g * x : 0,
        ),
      ),
    )

  let x = pack(start)
  let st = bdgEvaluate(P, mu, unpack(x), used)
  let f = mapOf(st).map((y, k) => y - x[k]!)
  let change = f.reduce((a, y) => Math.max(a, Math.abs(y)), 0)
  let it = 0

  const dX: Float64Array[] = []
  const dF: Float64Array[] = []

  while (it < opts.maxIter && change >= opts.tol) {
    it++

    let next: Float64Array

    if (opts.memory > 0 && dF.length > 0 && it > opts.plain) {
      const gamma = leastSquares(dF, f)

      next = x.map((xi, k) => {
        let v = xi + opts.mix * f[k]!

        gamma.forEach(
          (gm, j) => (v -= gm * (dX[j]![k]! + opts.mix * dF[j]![k]!)),
        )

        return v
      })
    } else {
      next = x.map((xi, k) => xi + opts.mix * f[k]!)
    }

    const stN = bdgEvaluate(P, mu, unpack(next), used)
    const fN = mapOf(stN).map((y, k) => y - next[k]!)

    if (it >= opts.plain) {
      dX.push(next.map((v, k) => v - x[k]!))
      dF.push(fN.map((v, k) => v - f[k]!))
    }

    if (dX.length > opts.memory) {
      dX.shift()
      dF.shift()
    }

    x = next
    st = stN
    f = fN
    change = f.reduce((a, y) => Math.max(a, Math.abs(y)), 0)
  }

  const delta = unpack(x)

  return {
    ...st,
    iterations: it,
    change,
    norm: delta.map(deltaNorm),
    seedNorm,
  }
}

// the same at a fixed filling: mu by the secant method on filling(mu), each solve warm-started from the last
export function solveGapAtFilling(
  P: PairProblem,
  target: number,
  mus: readonly [number, number],
  opts: SolveOptions & { fillTol: number; maxMu: number },
): GapSolution & { mu: number; muSteps: number } {
  let a = mus[0]
  let b = mus[1]
  let sa = solveGap(P, a, opts)
  let sb = solveGap(P, b, { ...opts, start: sa.delta })
  let steps = 2

  while (
    Math.abs(sb.filling - target) > opts.fillTol &&
    steps < opts.maxMu
  ) {
    const slope = (sb.filling - sa.filling) / (b - a)
    const c =
      Math.abs(slope) > 1e-12
        ? b + (target - sb.filling) / slope
        : b + 0.01

    a = b
    sa = sb
    b = c
    sb = solveGap(P, b, { ...opts, start: sa.delta })
    steps++
  }

  return { ...sb, mu: b, muSteps: steps }
}

// ---- the register rule's pairing problem ----

export type RegisterBand = {
  problem: PairProblem
  // per momentum, the 8 band levels eps (h's eigenvalues)
  levels: Float64Array[]
  checks: {
    floquetResidual: number
    minCos: number
    frameUnitary: number
    sectorOutside: number
  }
}

// fr: E-FND-0161's frame on one half (fiber 8). g per channel: S (beat 1's contact) and D (beat 2's contact)
export function registerBand(
  fr: {
    fourier: { N: number; neg: Int32Array }
    fiber: number
    A1: CM[]
    A2: CM[]
    checks: { unitary: number; sectorOutside: number }
  },
  gS: number,
  gD: number,
): RegisterBand {
  const n = fr.fiber
  const N = fr.fourier.N
  const h: CM[] = []
  const levels: Float64Array[] = []
  const rowsS: CM[] = []
  const rowsD: CM[] = []

  let floquetResidual = 0
  let minCos = Infinity

  for (let q = 0; q < N; q++) {
    const U = cmMul(fr.A2[q]!, fr.A1[q]!, n)
    const W: CM = { re: U.re.map(x => -x), im: U.im.map(x => -x) }
    const f = floquetH(W, n)

    floquetResidual = Math.max(floquetResidual, f.residual)
    minCos = Math.min(minCos, f.minCos)
    h.push(f.h)
    levels.push(f.eps)

    const S = {
      re: new Float64Array(4 * n),
      im: new Float64Array(4 * n),
    }
    const D = {
      re: new Float64Array(4 * n),
      im: new Float64Array(4 * n),
    }

    for (let a = 0; a < 4; a++) {
      S.re[a * n + a] = 1

      for (let m = 0; m < n; m++) {
        D.re[a * n + m] = fr.A1[q]!.re[a * n + m]!
        D.im[a * n + m] = fr.A1[q]!.im[a * n + m]!
      }
    }

    rowsS.push(S)
    rowsD.push(D)
  }

  return {
    problem: {
      n,
      h,
      neg: fr.fourier.neg,
      channels: [
        { name: 'S', g: gS, rows: rowsS },
        { name: 'D', g: gD, rows: rowsD },
      ],
    },
    levels,
    checks: {
      floquetResidual,
      minCos,
      frameUnitary: fr.checks.unitary,
      sectorOutside: fr.checks.sectorOutside,
    },
  }
}

// the textbook control: a flat band of two modes (spin up, spin down) on N momenta, h = 0, one on-site channel. BCS
// gives |Delta| = sqrt(U^2 / 4 - mu^2) for U < 0 and |mu| < |U| / 2, and 0 for U > 0
export function flatBandProblem(N: number, U: number): PairProblem {
  const n = 2
  const rows = Array.from({ length: N }, () => {
    const R = {
      re: new Float64Array(4 * n),
      im: new Float64Array(4 * n),
    }

    R.re[0 * n + 0] = 1
    R.re[1 * n + 1] = 1

    return R
  })

  return {
    n,
    h: Array.from({ length: N }, () => cm(n)),
    neg: Int32Array.from({ length: N }, (_, q) => (N - q) % N),
    channels: [{ name: 'flat', g: U, rows }],
  }
}
