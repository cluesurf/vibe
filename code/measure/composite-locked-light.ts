// Composite light on the doublet-locked walk (E-FRC-0246, E-FRC-0247): a love and a fear as ONE neutral pair, read
// through the locked token's symbol, the pair's Bloch operator at total momentum K, and the exact rule of
// code/rule/drift-cost-line. Measurement only: floats read the rule, the rule itself is the exact integer one.
//
// THE TOKEN (code/rule/locked-token-line, labels e0 and e1; the line label o is never written by the knit and is
// left out). One beat is the coin C = [[a, b], [b, a]], 2a = 1 + omega, 2b = 1 - omega, then the stream: e0 copied
// one dock forward, e1 one dock back. Its symbol is U(k) = S(k) C, S(k) = diag(e^(-ik), e^(ik)), and
//   tr U = (1 + omega) cos k = e^(i pi / 3) cos k,   det U = det C = omega,
// so the eigenvalues are e^(i pi / 3) e^(+- i E(k)) with cos E = cos(k) / 2. The two eigenphases always add to
// arg omega = 2 pi / 3 (THE DET IDENTITY), the group velocity is v = sin k / sqrt(4 - cos^2 k), largest at k = pi / 2
// where it is exactly 1/2 = |C_00| and where E'' = 0 (an inflection point).
//
// THE PAIR. A love at x1 and a fear at x2 = x1 + r, both under the convention C (the fear runs the same coin and the
// same steps in its conjugate coordinates), the love-fear meeting 'knit' (the identity: head-on love and fear pass
// without meeting, E-SPN-0073), and optionally the drift cost zeta_(2N)^(-l) per beat, l = |r| the number of flux
// links between them on a line (E-SPN-0086). With psi(x1, x2) = e^(i K x1) phi(r) one beat is a unitary on
// phi(r, j1, j2): the cost (a phase of r), the coin C (x) C, then the stream r -> r + s(j2) - s(j1) with the phase
// e^(-i K s(j1)). THE RELATIVE RING of M docks is a measurement box (the ring distance stands for l); the rule
// has no box.
//
// THE COMOVING STATE. chi_r = (|e0 e0> - |e1 e1>) / sqrt 2 at separation r: both copy forward, minus both copy back.
// (1 (x) sigma_x) maps the antisymmetric label state to chi, and U(-p) = sigma_x U(p) sigma_x, so
// (U(p) (x) U(-p)) chi = det U(p) chi for EVERY p: at K = 0 chi_r is an exact eigenstate at omega for every r, and
// with any separation-dependent phase V(r) it stays one, at omega e^(-i V(r)).
//
// VELOCITY BY HELLMANN-FEYNMAN. W_K = P D_K B, D_K = e^(-i K s(j1)) on the love's label before the copy, so an
// eigenvector psi of W_K has d(omega)/dK = <s(j1)>_psi exactly (omega = -arg lambda): the group velocity is the mean
// copy direction of the love in the eigenvector. No finite difference.

import {
  complexEigenvalues,
  complexShiftedSolve,
} from '@/code/algebra/linear/complex-eigen'
import { eigen2, walkSymbol } from '@/code/measure/composite-light'
import { canonical } from '@/code/rule/lattice-qed'
import {
  decodeDrift,
  driftBeat,
  driftBeatBack,
  driftStart,
  fluxLinks,
  gaussHoldsDrift,
  type DriftCostSpec,
  type DriftRegisters,
} from '@/code/rule/drift-cost-line'

type Complex = [number, number]

const S3 = Math.sqrt(3)
const A: Complex = [0.25, S3 / 4]
const B: Complex = [0.75, -S3 / 4]
const COIN: readonly (readonly Complex[])[] = [
  [A, B],
  [B, A],
]

export const STEP = [1, -1] as const
export const OMEGA_PHASE = (2 * Math.PI) / 3
// the token's largest group velocity, |C_00| = |1 + omega| / 2
export const V_MAX = 0.5

const mod = (a: number, m: number): number => ((a % m) + m) % m

export const wrap = (t: number): number =>
  t - 2 * Math.PI * Math.round(t / (2 * Math.PI))

export const lightN = (D: number): number => 2 * D + 1

export const photonC = (D: number): number =>
  Math.sqrt(4 / (3 * (2 * D + 1)))

// the token's band E(k), cos E = cos(k) / 2, and its group velocity
export const tokenBand = (k: number): number =>
  Math.acos(Math.cos(k) / 2)

export const tokenVelocity = (k: number): number =>
  Math.sin(k) / Math.sqrt(4 - Math.cos(k) ** 2)

// the opposite-branch pair's edge at total momentum K, max_q [E(q + K/2) - E(q - K/2)], in closed form
export const pairEdge = (K: number): number =>
  2 * Math.asin(Math.sin(K / 2) / 2)

// the particle-hole continuum of a sea filled to k_F = pi / 2: top (at the inflection point) minus bottom (the ends)
export const seaWidth = (K: number): number =>
  pairEdge(K) - Math.asin(Math.sin(K) / 2)

// the line token's eigenphases (theta in (-pi, pi], sorted), read from the E-FRC-0186 symbol with one x substep
export const linePhases = (k: number): [number, number] =>
  eigen2(walkSymbol([k, 0, 0], [0])).theta

// ---------------------------------------------------------------------------------------------------------
// the pair's Bloch operator

export type Dense = { n: number; re: Float64Array; im: Float64Array }

export const pairIndex = (r: number, j1: number, j2: number): number =>
  r * 4 + j1 * 2 + j2

export const ringDistance = (M: number, r: number): number => {
  const d = mod(r, M)

  return Math.min(d, M - d)
}

// one beat at total momentum K on the relative ring of M docks; N > 0 adds the drift cost pi / N per flux link
export function pairMatrix(M: number, K: number, N: number): Dense {
  const n = 4 * M
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let r = 0; r < M; r++) {
    const th = N > 0 ? (-Math.PI * ringDistance(M, r)) / N : 0
    const c: Complex = [Math.cos(th), Math.sin(th)]

    for (let j1 = 0; j1 < 2; j1++) {
      for (let j2 = 0; j2 < 2; j2++) {
        const col = pairIndex(r, j1, j2)

        for (let k1 = 0; k1 < 2; k1++) {
          for (let k2 = 0; k2 < 2; k2++) {
            const c1 = COIN[k1]![j1]!
            const c2 = COIN[k2]![j2]!
            const ar = c1[0] * c2[0] - c1[1] * c2[1]
            const ai = c1[0] * c2[1] + c1[1] * c2[0]
            const br = ar * c[0] - ai * c[1]
            const bi = ar * c[1] + ai * c[0]
            const ph = -K * STEP[k1]!
            const pr = Math.cos(ph)
            const pi = Math.sin(ph)
            const row = pairIndex(
              mod(r + STEP[k2]! - STEP[k1]!, M),
              k1,
              k2,
            )

            re[row * n + col] = re[row * n + col]! + br * pr - bi * pi
            im[row * n + col] = im[row * n + col]! + br * pi + bi * pr
          }
        }
      }
    }
  }

  return { n, re, im }
}

export type Vec = { re: Float64Array; im: Float64Array }

export function apply(W: Dense, x: Vec): Vec {
  const { n } = W
  const re = new Float64Array(n)
  const im = new Float64Array(n)

  for (let r = 0; r < n; r++) {
    let sr = 0
    let si = 0

    for (let c = 0; c < n; c++) {
      const wr = W.re[r * n + c]!
      const wi = W.im[r * n + c]!

      if (wr === 0 && wi === 0) {
        continue
      }

      sr += wr * x.re[c]! - wi * x.im[c]!
      si += wr * x.im[c]! + wi * x.re[c]!
    }

    re[r] = sr
    im[r] = si
  }

  return { re, im }
}

export function unitarityDefect(W: Dense): number {
  const { n } = W

  let worst = 0

  for (let a = 0; a < n; a++) {
    for (let b = a; b < n; b++) {
      let sr = 0
      let si = 0

      for (let r = 0; r < n; r++) {
        const ar = W.re[r * n + a]!
        const ai = -W.im[r * n + a]!
        const br = W.re[r * n + b]!
        const bi = W.im[r * n + b]!

        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }

      worst = Math.max(worst, Math.hypot(sr - (a === b ? 1 : 0), si))
    }
  }

  return worst
}

const normalize = (x: Vec): Vec => {
  let s = 0

  for (let i = 0; i < x.re.length; i++) {
    s += x.re[i]! ** 2 + x.im[i]! ** 2
  }

  s = Math.sqrt(s)

  return { re: x.re.map(v => v / s), im: x.im.map(v => v / s) }
}

const dot = (x: Vec, y: Vec): Complex => {
  let r = 0
  let i = 0

  for (let a = 0; a < x.re.length; a++) {
    r += x.re[a]! * y.re[a]! + x.im[a]! * y.im[a]!
    i += x.re[a]! * y.im[a]! - x.im[a]! * y.re[a]!
  }

  return [r, i]
}

// chi_r at separation r on the ring of M, unit norm
export function comoving(M: number, r: number): Vec {
  const re = new Float64Array(4 * M)
  const im = new Float64Array(4 * M)

  re[pairIndex(mod(r, M), 0, 0)] = Math.SQRT1_2
  re[pairIndex(mod(r, M), 1, 1)] = -Math.SQRT1_2

  return { re, im }
}

export type BranchPoint = {
  K: number
  // eigenphase arg lambda, and omega = -theta measured from the comoving rest phase: offset = wrap(arg omega - theta)
  theta: number
  offset: number
  // d(omega)/dK = <s(j1)> (Hellmann-Feynman)
  velocity: number
  residual: number
  meanString: number
  chiShare: number
  vector: Vec
}

// Rayleigh quotient iteration from x on W; returns the eigenpair it settles on
export function settle(
  W: Dense,
  start: Vec,
  rounds = 5,
): { vector: Vec; lambda: Complex; residual: number } {
  let x = normalize(start)
  let lambda = dot(x, apply(W, x))

  for (let t = 0; t < rounds; t++) {
    const y = complexShiftedSolve({
      re: W.re,
      im: W.im,
      n: W.n,
      shift: [lambda[0] + 1e-13, lambda[1]],
      b: x,
    })

    x = normalize({
      re: Float64Array.from(y.re),
      im: Float64Array.from(y.im),
    })
    lambda = dot(x, apply(W, x))
  }

  const wx = apply(W, x)

  let res = 0

  for (let i = 0; i < W.n; i++) {
    res +=
      (wx.re[i]! - (lambda[0] * x.re[i]! - lambda[1] * x.im[i]!)) ** 2 +
      (wx.im[i]! - (lambda[0] * x.im[i]! + lambda[1] * x.re[i]!)) ** 2
  }

  return { vector: x, lambda, residual: Math.sqrt(res) }
}

export function readPoint(
  M: number,
  K: number,
  vector: Vec,
  lambda: Complex,
  residual: number,
): BranchPoint {
  let velocity = 0
  let meanString = 0
  let chiShare = 0

  for (let r = 0; r < M; r++) {
    for (let j1 = 0; j1 < 2; j1++) {
      for (let j2 = 0; j2 < 2; j2++) {
        const i = pairIndex(r, j1, j2)
        const w = vector.re[i]! ** 2 + vector.im[i]! ** 2

        velocity += w * STEP[j1]!
        meanString += w * ringDistance(M, r)
      }
    }

    const a = pairIndex(r, 0, 0)
    const b = pairIndex(r, 1, 1)
    const cr = (vector.re[a]! - vector.re[b]!) * Math.SQRT1_2
    const ci = (vector.im[a]! - vector.im[b]!) * Math.SQRT1_2

    chiShare += cr * cr + ci * ci
  }

  const theta = Math.atan2(lambda[1], lambda[0])

  return {
    K,
    theta,
    offset: wrap(OMEGA_PHASE - theta),
    velocity,
    residual,
    meanString,
    chiShare,
    vector,
  }
}

// the branch through chi_0 (the lightest neutral pair: no string, rest phase exactly arg omega) at each K, each
// settled from chi_0 itself when `fromRest`, else followed along the list from the previous K
export function lightestBranch(
  M: number,
  N: number,
  Ks: readonly number[],
  fromRest: boolean,
): BranchPoint[] {
  const out: BranchPoint[] = []

  let x = comoving(M, 0)

  for (const K of Ks) {
    const W = pairMatrix(M, K, N)
    const s = settle(W, fromRest ? comoving(M, 0) : x)

    x = s.vector
    out.push(readPoint(M, K, s.vector, s.lambda, s.residual))
  }

  return out
}

// eigenphases of W within `tol` of arg omega, and the nearest other one (circular distance)
export function restCount(
  W: Dense,
  tol: number,
): { count: number; nearestOther: number } {
  const ev = complexEigenvalues({ re: W.re, im: W.im, n: W.n })

  let count = 0
  let nearestOther = Infinity

  for (let i = 0; i < ev.re.length; i++) {
    const d = Math.abs(
      wrap(Math.atan2(ev.im[i]!, ev.re[i]!) - OMEGA_PHASE),
    )

    if (d < tol) {
      count++
    } else {
      nearestOther = Math.min(nearestOther, d)
    }
  }

  return { count, nearestOther }
}

// ---------------------------------------------------------------------------------------------------------
// the free pair on a ring of L docks at K = 2 pi m / L: its spectrum against the sum set of two token bands

export function freeSumSet(
  L: number,
  m: number,
): {
  gap: number
  restMultiplicity: number
  oppositeCount: number
  edge: number
  edgeClosed: number
} {
  const K = (2 * Math.PI * m) / L
  const W = pairMatrix(L, K, 0)
  const ev = complexEigenvalues({ re: W.re, im: W.im, n: W.n })
  const numeric = ev.re.map((x, i) => Math.atan2(ev.im[i]!, x))
  const analytic: number[] = []

  for (let n = 0; n < L; n++) {
    const q = (2 * Math.PI * n) / L
    const t1 = linePhases(K - q)
    const t2 = linePhases(q)

    for (const a of t1) {
      for (const b of t2) {
        analytic.push(a + b)
      }
    }
  }

  const used = new Uint8Array(numeric.length)

  let gap = 0

  for (const a of analytic) {
    let best = -1
    let d = Infinity

    numeric.forEach((x, i) => {
      if (used[i]) {
        return
      }

      const e = Math.abs(wrap(x - a))

      if (e < d) {
        d = e
        best = i
      }
    })

    used[best] = 1
    gap = Math.max(gap, d)
  }

  const W0 = pairMatrix(L, 0, 0)
  const rest = restCount(W0, 1e-9)

  let oppositeCount = 0
  let edge = 0

  for (const x of numeric) {
    const d = Math.abs(wrap(x - OMEGA_PHASE))

    if (d < 0.5) {
      oppositeCount++
      edge = Math.max(edge, d)
    }
  }

  return {
    gap,
    restMultiplicity: rest.count,
    oppositeCount,
    edge,
    edgeClosed: pairEdge(K),
  }
}

// the edge on the continuum: max over q of E(q + K/2) - E(q - K/2), a grid then a golden-section refinement
export function edgeByMaximum(K: number): number {
  const f = (q: number): number =>
    tokenBand(q + K / 2) - tokenBand(q - K / 2)
  const G = 20000

  let best = 0

  for (let i = 1; i < G; i++) {
    if (f((Math.PI * i) / G) > f((Math.PI * best) / G)) {
      best = i
    }
  }

  let lo = (Math.PI * (best - 1)) / G
  let hi = (Math.PI * (best + 1)) / G

  const g = (Math.sqrt(5) - 1) / 2

  for (let t = 0; t < 200; t++) {
    const a = hi - g * (hi - lo)
    const b = lo + g * (hi - lo)

    if (f(a) > f(b)) {
      hi = b
    } else {
      lo = a
    }
  }

  return f((lo + hi) / 2)
}

// ---------------------------------------------------------------------------------------------------------
// the exact rule (code/rule/drift-cost-line): the comoving identity over Z[zeta_K]

// a K = 0 combination sum_r w_r chi_r on a ring (every dock x, the love at x, the fear at x + r, the flux +1 on the
// r links between them); one exact beat must return 4 omega zeta_(2N)^(-r) times each component, and the inverse
// beat the start times 16
export function comovingExact(
  D: number,
  ring: number,
  weights: readonly bigint[],
): {
  exact: boolean
  back: boolean
  gauss: boolean
  registers: number
} {
  const N = lightN(D)
  const spec: DriftCostSpec = {
    ring,
    kinds: ['love', 'fear'],
    convention: 'C',
    unlike: 'knit',
    cost: N,
    root: 2 * N * N,
  }
  const entries: { registers: DriftRegisters; weight: bigint }[] = []

  weights.forEach((w, r) => {
    if (w === 0n) {
      return
    }

    for (let x = 0; x < ring; x++) {
      const f = new Array<number>(ring).fill(0)

      for (let t = 0; t < r; t++) {
        f[(x + t) % ring] = 1
      }

      entries.push({
        registers: { x: [x, (x + r) % ring], j: [0, 0], f },
        weight: w,
      })

      entries.push({
        registers: { x: [x, (x + r) % ring], j: [1, 1], f: f.slice() },
        weight: -w,
      })
    }
  })

  const st = driftStart(spec, entries)
  const start = new Map([...st.amp].map(([i, v]) => [i, v.slice()]))
  const k = st.k
  const unit = k / spec.root
  const gauss = [...start.keys()].every(i =>
    gaussHoldsDrift(spec, decodeDrift(spec, i)),
  )

  driftBeat(st)

  let exact = st.den === 4n

  const keys = new Set([...start.keys(), ...st.amp.keys()])

  for (const i of keys) {
    const s = start.get(i)
    const got = canonical(
      st.amp.get(i) ?? new Array<bigint>(k).fill(0n),
      k,
    )
    const want = new Array<bigint>(k).fill(0n)

    if (s) {
      const l = fluxLinks(decodeDrift(spec, i).f)
      const e = mod(k / 3 - N * l * unit, k)

      for (let a = 0; a < k; a++) {
        want[(a + e) % k] = want[(a + e) % k]! + 4n * s[a]!
      }
    }

    const wc = canonical(want, k)

    if (!got.every((x, a) => x === wc[a])) {
      exact = false
    }
  }

  driftBeatBack(st)

  let back = true

  for (const i of keys) {
    const s = start.get(i)
    const got = canonical(
      st.amp.get(i) ?? new Array<bigint>(k).fill(0n),
      k,
    )
    const want = canonical(
      s ? s.map(x => 16n * x) : new Array<bigint>(k).fill(0n),
      k,
    )

    if (!got.every((x, a) => x === want[a])) {
      back = false
    }
  }

  return { exact, back, gauss, registers: start.size }
}

// ---------------------------------------------------------------------------------------------------------
// the husk patch: the 3D palindrome walk of E-FRC-0186 with the same coin

type M2 = ReturnType<typeof walkSymbol>

const cmul = (x: Complex, y: Complex): Complex => [
  x[0] * y[0] - x[1] * y[1],
  x[0] * y[1] + x[1] * y[0],
]

// theta_hi in [0, pi]: det U = omega^6 = 1, so the eigenphases are +- theta
export function huskTheta(p: readonly number[]): number {
  const t = eigen2(walkSymbol(p)).theta

  return Math.max(Math.abs(t[0]), Math.abs(t[1]))
}

// the det identity, the parity conjugation and the comoving eigenvector at every point of a side-`side` torus
export function huskIdentities(side: number): {
  detGap: number
  parityGap: number
  comovingGap: number
} {
  let detGap = 0
  let parityGap = 0
  let comovingGap = 0

  for (let i = 0; i < side ** 3; i++) {
    const p = [
      i % side,
      Math.floor(i / side) % side,
      Math.floor(i / (side * side)),
    ].map(a => (2 * Math.PI * a) / side)
    const u = walkSymbol(p)
    const v = walkSymbol(p.map(a => -a))
    const t = eigen2(u).theta
    const det: Complex = [
      u[0][0] * u[3][0] -
        u[0][1] * u[3][1] -
        (u[1][0] * u[2][0] - u[1][1] * u[2][1]),
      u[0][0] * u[3][1] +
        u[0][1] * u[3][0] -
        (u[1][0] * u[2][1] + u[1][1] * u[2][0]),
    ]

    detGap = Math.max(
      detGap,
      Math.abs(wrap(t[0] + t[1])),
      Math.hypot(det[0] - 1, det[1]),
    )

    // sigma_x u sigma_x = [u11, u10, u01, u00] against v
    const sx: M2 = [u[3], u[2], u[1], u[0]]

    for (let e = 0; e < 4; e++) {
      parityGap = Math.max(
        parityGap,
        Math.hypot(sx[e]![0] - v[e]![0], sx[e]![1] - v[e]![1]),
      )
    }

    // (u (x) v) chi, chi = |00> - |11>, against chi
    const out: Complex[] = []

    for (let a = 0; a < 2; a++) {
      for (let b = 0; b < 2; b++) {
        const x = cmul(u[a * 2]!, v[b * 2]!)
        const y = cmul(u[a * 2 + 1]!, v[b * 2 + 1]!)

        out.push([x[0] - y[0], x[1] - y[1]])
      }
    }

    const want: Complex[] = [
      [1, 0],
      [0, 0],
      [0, 0],
      [-1, 0],
    ]

    for (let e = 0; e < 4; e++) {
      comovingGap = Math.max(
        comovingGap,
        Math.hypot(out[e]![0] - want[e]![0], out[e]![1] - want[e]![1]),
      )
    }
  }

  return { detGap, parityGap, comovingGap }
}

// the label states the pair keeps at K = 0 for EVERY relative momentum: the null space of sum_p X_p^dagger X_p,
// X_p = U(p) (x) U(-p) - det U(p); returns the four eigenvalues of that sum, ascending, divided by the sample count
export function commonRestSpectrum(
  ps: readonly (readonly number[])[],
  order?: readonly number[],
): number[] {
  const re = new Float64Array(16)
  const im = new Float64Array(16)

  for (const p of ps) {
    const u = order ? walkSymbol(p, order) : walkSymbol(p)
    const v = order
      ? walkSymbol(
          p.map(a => -a),
          order,
        )
      : walkSymbol(p.map(a => -a))
    const det = cmul(u[0], u[3])
    const off = cmul(u[1], u[2])
    const d: Complex = [det[0] - off[0], det[1] - off[1]]
    const X: Complex[] = []

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const e = cmul(
          u[(row >> 1) * 2 + (col >> 1)]!,
          v[(row & 1) * 2 + (col & 1)]!,
        )

        X.push(row === col ? [e[0] - d[0], e[1] - d[1]] : e)
      }
    }

    for (let a = 0; a < 4; a++) {
      for (let b = 0; b < 4; b++) {
        let sr = 0
        let si = 0

        for (let r = 0; r < 4; r++) {
          const x = X[r * 4 + a]!
          const y = X[r * 4 + b]!

          sr += x[0] * y[0] + x[1] * y[1]
          si += x[0] * y[1] - x[1] * y[0]
        }

        re[a * 4 + b] = re[a * 4 + b]! + sr / ps.length
        im[a * 4 + b] = im[a * 4 + b]! + si / ps.length
      }
    }
  }

  const ev = complexEigenvalues({ re, im, n: 4 })

  return ev.re.slice().sort((a, b) => a - b)
}

// the largest directional group velocity of the token along `dir` (a central difference of theta_hi, h = 1e-6),
// and the pair's opposite-branch edge at |K| = kappa along `dir` over kappa; each a grid of side G then a
// deterministic pattern search
function maximize(
  f: (p: readonly number[]) => number,
  G: number,
): number {
  let best = [0, 0, 0]
  let value = -Infinity

  for (let i = 0; i < G ** 3; i++) {
    const p = [
      i % G,
      Math.floor(i / G) % G,
      Math.floor(i / (G * G)),
    ].map(a => -Math.PI + (2 * Math.PI * (a + 0.5)) / G)
    const v = f(p)

    if (v > value) {
      value = v
      best = p
    }
  }

  for (let step = Math.PI / G; step > 1e-9; step /= 2) {
    let moved = true

    while (moved) {
      moved = false

      for (let axis = 0; axis < 3; axis++) {
        for (const sign of [1, -1]) {
          const q = best.slice()

          q[axis] = q[axis]! + sign * step

          const v = f(q)

          if (v > value) {
            value = v
            best = q
            moved = true
          }
        }
      }
    }
  }

  return value
}

export function directionalVmax(
  dir: readonly number[],
  G: number,
): number {
  const n = Math.hypot(...dir)
  const u = dir.map(x => x / n)
  const h = 1e-6

  return maximize(
    p =>
      (huskTheta(p.map((a, i) => a + h * u[i]!)) -
        huskTheta(p.map((a, i) => a - h * u[i]!))) /
      (2 * h),
    G,
  )
}

export function directionalEdge(
  dir: readonly number[],
  kappa: number,
  G: number,
): number {
  const n = Math.hypot(...dir)
  const u = dir.map(x => x / n)

  return (
    maximize(
      p =>
        huskTheta(p.map((a, i) => a + (kappa / 2) * u[i]!)) -
        huskTheta(p.map((a, i) => a - (kappa / 2) * u[i]!)),
      G,
    ) / kappa
  )
}

// the particle-hole continuum of a husk sea: branch theta_hi filled below its median on a side-`side` torus, the
// excitations at K = (2 pi / side) e_x: every hole p in the sea with p + K outside; returns (top - bottom) / top
export function huskSeaSpread(side: number): {
  top: number
  bottom: number
  ratio: number
  pairs: number
  K: number
} {
  const count = side ** 3
  const theta = new Float64Array(count)

  for (let i = 0; i < count; i++) {
    const p = [
      i % side,
      Math.floor(i / side) % side,
      Math.floor(i / (side * side)),
    ].map(a => (2 * Math.PI * a) / side)

    theta[i] = huskTheta(p)
  }

  const sorted = Float64Array.from(theta).sort()
  const mu = (sorted[count / 2 - 1]! + sorted[count / 2]!) / 2

  let top = -Infinity
  let bottom = Infinity
  let pairs = 0

  for (let i = 0; i < count; i++) {
    if (!(theta[i]! < mu)) {
      continue
    }

    const x = i % side
    const j = i - x + ((x + 1) % side)

    if (theta[j]! < mu) {
      continue
    }

    const e = theta[j]! - theta[i]!

    top = Math.max(top, e)
    bottom = Math.min(bottom, e)
    pairs++
  }

  return {
    top,
    bottom,
    ratio: (top - bottom) / top,
    pairs,
    K: (2 * Math.PI) / side,
  }
}

// the same continuum for the line sea filled to k_F = pi / 2, sampled densely (the closed form is seaWidth)
export function lineSeaSpread(
  K: number,
  samples: number,
): { top: number; bottom: number } {
  let top = -Infinity
  let bottom = Infinity

  for (let i = 0; i <= samples; i++) {
    const p = Math.PI / 2 - K + (K * i) / samples
    const e = tokenBand(p + K) - tokenBand(p)

    top = Math.max(top, e)
    bottom = Math.min(bottom, e)
  }

  return { top, bottom }
}
