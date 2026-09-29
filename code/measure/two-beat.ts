// A TWO-BEAT SCHEDULE OF COVARIANT DOCK PIECES ON THE SWAP COIN, AND THE CHANNELS A LIGHT COMPOSITE MUST AVOID
// (E-SPN-0159). code/measure/swap-cone builds the Floquet cycle U(K) = S P_N ... S P_1 of a schedule of one-vibe dock
// matrices, code/measure/odd-phase the five W(F4)-invariant projectors and the covariant dock X sum_k e^(i phi_k) Pi_k.
// This file adds what the two-beat question reads:
//
//   covariantPhases     the phase of a covariant cycle on each projector at K = 0 (the rest phases rho_k, read as
//                       v^dag U(0) v for a unit v in each sector)
//   pairCensus          THE CHANNEL CENSUS OF A LIGHT COMPOSITE. Every band's eps (from the S-D midpoint, signed so the
//                       singlet sits at +M at rest) at every sampled momentum q; every pair sum e_a(q) + e_b(q) (the two
//                       members at q and -q, total K = 0, the spectrum even in q); the composite at 2 M - B lies outside
//                       every two-member continuum iff B < B*, B* the least positive wrap(2 M - pair sum). B* = 0 means a
//                       channel reaches the threshold from below: no binding, however weak, is a true bound state
//   scalingBands        THE CONTINUUM CLUSTER MODEL. For a light singlet every sector within O(M) of the S-D midpoint
//                       is degenerate in the limit, and the cycle is H = M diag(x_k) + K . A, A the first-order couplings,
//                       which join only adjacent degrees of the root functions (1 - 4 - 9 - 8 - 2): multiplication by a
//                       coordinate of r raises or lowers the degree by one. Its bands in units of M at p = K / M
//
// DETERMINISM: no random numbers; the momenta and the scan are Weyl sequences and grids. Floats, as measurement.

import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import {
  DOCK_ROOTS,
  wrap,
  type CMatrix,
} from '@/code/measure/dock-mixer'
import { cycleMatrix, cyclePhases } from '@/code/measure/swap-cone'
import {
  projectorList,
  type Projectors,
} from '@/code/measure/odd-phase'
import { polynomialAtZero } from '@/code/measure/singlet-kinematics'
import {
  lockedState,
  sameConfiguration,
  type Branch,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'
import {
  ringScale,
  swapMixedBeat,
  type RingUnit,
} from '@/code/rule/swap-mixer'
import { oddPhasedBeat } from '@/code/rule/odd-phase'
import {
  BOUNCE_TABLE,
  bouncePermutation,
} from '@/code/rule/bounce-pair-knit'
import { seaConfiguration } from '@/code/measure/pauli-mixer'
import {
  ePow,
  flatBoxTables,
  seaFactor,
} from '@/code/measure/swap-sector'
import { eisMul, eisPow } from '@/code/measure/swap-cone'
import { pieceScale } from '@/code/measure/swap-string'

const N = 24
const R = DOCK_ROOTS

// the rest phase of a covariant cycle on each projector (one, two, nine, four, eight): arg v^dag U(0) v, v the
// normalized column of the projector with the largest diagonal entry
export function covariantPhases(
  Ps: readonly CMatrix[],
  p: Projectors,
): number[] {
  const U = cycleMatrix(Ps, R, [0, 0, 0, 0])

  return projectorList(p).map(P => {
    let col = 0

    for (let j = 1; j < N; j++) {
      if (P[j * N + j]! > P[col * N + col]!) {
        col = j
      }
    }

    const v = Array.from({ length: N }, (_, i) => P[i * N + col]!)
    const n = Math.hypot(...v)

    let sr = 0
    let si = 0

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        sr += v[i]! * U.re[i * N + j]! * v[j]!
        si += v[i]! * U.im[i * N + j]! * v[j]!
      }
    }

    return Math.atan2(si / (n * n), sr / (n * n))
  })
}

// THE REST FRAME: the S-D midpoint, M (half the S-D gap, the singlet's cycle rest energy) and the sign that puts S at
// +M. `half` gives the signed half-gap when it is known from the construction (a cycle's S and D phases fix the midpoint
// only mod pi: past M = pi/2 the wrapped difference picks the other one)
export type Frame = { mid: number; M: number; sign: number }

export function restFrame(
  sPhase: number,
  dPhase: number,
  half?: number,
): Frame {
  const h = half ?? wrap(sPhase - dPhase) / 2

  return { mid: dPhase + h, M: Math.abs(h), sign: h > 0 ? -1 : 1 }
}

export const epsOf = (
  Ps: readonly CMatrix[],
  f: Frame,
  q: readonly number[],
): number[] =>
  cyclePhases(Ps, R, q).map(ph => f.sign * -wrap(ph - f.mid))

// the bands along a path of momenta, each step's eps matched to the last step's (greedy nearest, circular), so band b is
// one continuous function of the path (a degenerate multiplet's members are interchangeable, which no pair sum sees)
export function trackedEps(
  Ps: readonly CMatrix[],
  f: Frame,
  path: readonly (readonly number[])[],
): number[][] {
  const out: number[][] = []

  let prev: number[] | null = null

  for (const q of path) {
    const raw = epsOf(Ps, f, q)

    if (!prev) {
      prev = [...raw].sort((a, b) => a - b)
      out.push(prev)
      continue
    }

    const cand: { i: number; j: number; d: number }[] = []

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        cand.push({ i, j, d: Math.abs(wrap(raw[j]! - prev[i]!)) })
      }
    }

    cand.sort((a, b) => a.d - b.d)

    const next = Array<number>(N).fill(NaN)
    const used = new Uint8Array(N)

    for (const c of cand) {
      if (!Number.isNaN(next[c.i]!) || used[c.j]) {
        continue
      }

      next[c.i] = raw[c.j]!
      used[c.j] = 1
    }

    prev = next
    out.push(next)
  }

  return out
}

// `first` is the least |q| at which a crossing is seen and the pair's two eps there
export type Census = {
  M: number
  Bstar: number
  crossings: number
  at: number[]
  pair: [number, number]
  first: { q: number; pair: [number, number] }
}

// THE CENSUS. B* is the least positive wrap(2 M - e_a - e_b) over every pair (a <= b, a = b allowed: love and fear in one
// band) at every sampled momentum (an upper bound on the true window, which the sampling can only overstate), and a
// CROSSING is a pair sum passing the threshold 2 M between two neighboring steps of a tracked path (both readings
// within 1 of it and past tol on either side): a crossing sets B* = 0, a channel open at the threshold itself. tol drops
// the threshold's own readings (S + S at rest, and a level degenerate with S at rest)
export function pairCensus(
  Ps: readonly CMatrix[],
  f: Frame,
  paths: readonly (readonly (readonly number[])[])[],
  extra: readonly (readonly number[])[],
  tol = 1e-9,
): Census {
  let Bstar = Math.PI
  let at: number[] = []
  let pair: [number, number] = [NaN, NaN]
  let crossings = 0
  let first: Census['first'] = { q: Infinity, pair: [NaN, NaN] }

  const see = (
    eps: readonly number[],
    q: readonly number[],
  ): Float64Array => {
    const d = new Float64Array(N * N)

    for (let a = 0; a < N; a++) {
      for (let b = a; b < N; b++) {
        const x = wrap(2 * f.M - eps[a]! - eps[b]!)

        d[a * N + b] = x

        if (x > tol && x < Bstar) {
          Bstar = x
          at = [...q]
          pair = [eps[a]!, eps[b]!]
        }
      }
    }

    return d
  }

  for (const path of paths) {
    const bands = trackedEps(Ps, f, path)
    // the last reading of each pair past tol and within 1 of the threshold (NaN once a pair leaves that band, so a pass
    // through the far side of the circle is not a crossing; a reading within tol is skipped, not reset)
    const last = new Float64Array(N * N).fill(NaN)

    bands.forEach((eps, s) => {
      const d = see(eps, path[s]!)

      for (let a = 0; a < N; a++) {
        for (let b = a; b < N; b++) {
          const y = d[a * N + b]!
          const x = last[a * N + b]!

          if (Math.abs(y) <= tol) {
            continue
          }

          if (Math.abs(y) >= 1) {
            last[a * N + b] = NaN
            continue
          }

          if (!Number.isNaN(x) && x > 0 !== y > 0) {
            crossings++

            const r = Math.hypot(...path[s]!)

            if (r < first.q) {
              first = { q: r, pair: [eps[a]!, eps[b]!] }
            }
          }

          last[a * N + b] = y
        }
      }
    })
  }

  for (const q of extra) {
    see(epsOf(Ps, f, q), q)
  }

  return {
    M: f.M,
    Bstar: crossings > 0 ? 0 : Bstar,
    crossings,
    at,
    pair,
    first,
  }
}

// the radial paths: along each unit direction, n equal steps from hi / n to hi (a tracked path starts next to rest)
export function radialPaths(
  dirs: readonly (readonly number[])[],
  hi: number,
  n: number,
): number[][][] {
  return dirs.map(u =>
    Array.from({ length: n }, (_, j) =>
      u.map(x => (x * hi * (j + 1)) / n),
    ),
  )
}

// the cycle phases present, within tol, at every sampled momentum, with the least multiplicity over the sample
// (code/measure/odd-phase flatBands, on a cycle)
export function cycleFlats(
  Ps: readonly CMatrix[],
  momenta: readonly (readonly number[])[],
  tol: number,
): { phase: number; count: number }[] {
  const phs = momenta.map(K => cyclePhases(Ps, R, K))
  const out: { phase: number; count: number }[] = []

  for (const p of [...phs[0]!].sort((a, b) => a - b)) {
    if (out.some(o => Math.abs(wrap(o.phase - p)) <= tol)) {
      continue
    }

    const count = Math.min(
      ...phs.map(
        ph => ph.filter(x => Math.abs(wrap(x - p)) <= tol).length,
      ),
    )

    if (count > 0) {
      out.push({ phase: p, count })
    }
  }

  return out
}

// THE SINGLET'S INERTIA IN A FRAME: per beat, eps(K) of the band nearest S's rest phase along u at K = s m u (m = M /
// beats), the fit eps^2 = m^2 + c^2 K^2 + d K^4 (code/measure/singlet-kinematics polynomialAtZero), and R = cStar^2 / c^2
export function frameR(
  Ps: readonly CMatrix[],
  f: Frame,
  sPhase: number,
  u: readonly number[],
  cStar: number,
  scales: readonly number[],
): { m: number; c2: number; R: number } {
  const beats = Ps.length
  const m = f.M / beats
  const xs = scales.map(s => s * s)
  const ys = scales.map(s => {
    const K = s * m
    const near = cyclePhases(
      Ps,
      R,
      u.map(x => x * K),
    ).reduce((b, ph) =>
      Math.abs(wrap(ph - sPhase)) < Math.abs(wrap(b - sPhase)) ? ph : b,
    )
    const e = (f.sign * -wrap(near - f.mid)) / beats

    return (e * e - m * m) / (K * K)
  })
  const c2 = polynomialAtZero(xs, ys).value

  return { m, c2, R: (cStar * cStar) / c2 }
}

// THE MASSLESS PAIR OF A CYCLE (code/measure/singlet-kinematics masslessPair, on the cycle): the K = 0 cycle phases
// grouped within tol, the group holding the phase `rest`; at K = kappa u and kappa u / 2 its members' offsets (E = -phase,
// per beat: divided by the cycle's beats), E_+- = +-c0 K + gamma K^2 from the top and bottom, Richardson on each
export function cycleMasslessPair(
  Ps: readonly CMatrix[],
  rest: number,
  u: readonly number[],
  kappa: number,
  tol = 1e-9,
): { c0: number; gamma: number; size: number } {
  const beats = Ps.length
  const at0 = cyclePhases(Ps, R, [0, 0, 0, 0])
  const size = at0.filter(ph => Math.abs(wrap(ph - rest)) <= tol).length

  const read = (k: number): { c: number; g: number } => {
    const ph = cyclePhases(
      Ps,
      R,
      u.map(x => x * k),
    )
    // the `size` phases nearest rest are the group's members at small K
    const e = ph
      .map(x => wrap(x - rest))
      .sort((a, b) => Math.abs(a) - Math.abs(b))
      .slice(0, size)
      .map(x => -x / beats)
    const top = Math.max(...e)
    const bottom = Math.min(...e)

    return {
      c: (top - bottom) / (2 * k),
      g: (top + bottom) / (2 * k * k),
    }
  }

  const a = read(kappa)
  const b = read(kappa / 2)

  return { c0: (4 * b.c - a.c) / 3, gamma: (4 * b.g - a.g) / 3, size }
}

// ---- the exact rule: the two-beat schedule on the vacuum ----

// THE CANDIDATE'S VACUUM under the exact rule: even beats code/rule/swap-mixer swapMixedBeat (the mixer u, the coin, the
// working beat), odd beats code/rule/odd-phase oddPhasedBeat (the mixer u, the odd-octet piece v, the coin, the working
// beat), on the empty box (sea 0) or the love sea (sea 1) of a side. exact: one branch equal to the vacuum every beat,
// with that beat's exact amplitude (empty: ringScale(u)^cells, then (ringScale(u) oddScale(v))^cells; sea: the ring
// mixer's sea factor^cells, then (sea factor 12 num(v)^8)^cells); charged: slots whose value differs from the vacuum's;
// permutes: dock-beats where the collision moves a value onto a slot of another value (K fires)
export function twoBeatVacuum(
  u: RingUnit,
  v: RingUnit,
  side: number,
  sea: number,
  beats: number,
): {
  side: number
  sea: number
  cells: number
  exact: boolean
  permutes: number
  charged: number
} {
  const tab = flatBoxTables(side)
  const c0 = seaConfiguration(tab.cells, sea)
  const oddFull: [bigint, bigint] = eisMul(
    [12n, 0n],
    eisPow([v.num[0], v.num[1]], 8),
  )
  const factors: [bigint, bigint][] =
    sea === 0
      ? [
          [ringScale(u) ** BigInt(tab.cells), 0n],
          [pieceScale(u, v) ** BigInt(tab.cells), 0n],
        ]
      : [
          ePow(seaFactor(u), tab.cells),
          ePow(eisMul(seaFactor(u), oddFull), tab.cells),
        ]
  const perm = new Int32Array(24)

  let s: LockedState = lockedState(c0)
  let exact = true
  let permutes = 0
  let charged = 0

  for (let t = 0; t < beats; t++) {
    s =
      t % 2 === 0
        ? swapMixedBeat('none', tab, s, t, u)
        : oddPhasedBeat('none', tab, s, t, u, v)

    const br = s.branches[0]!
    const factor = factors[t % 2]!

    if (
      s.branches.length !== 1 ||
      !sameConfiguration(br, c0) ||
      br.k !== 0 ||
      br.a !== factor[0] ||
      br.b !== factor[1]
    ) {
      exact = false
      break
    }

    for (let i = 0; i < tab.cells * 24; i++) {
      if (br.vibe[i] !== c0.vibe[i]) {
        charged++
      }
    }

    for (let x = 0; x < tab.cells; x++) {
      if (
        bouncePermutation(
          BOUNCE_TABLE,
          'pass',
          br.vibe,
          x * 24,
          perm,
        ) !== 0 &&
        [...perm].some(
          (to, d) => br.vibe[x * 24 + to] !== br.vibe[x * 24 + d],
        )
      ) {
        permutes++
      }
    }

    br.a = 1n
    br.b = 0n
  }

  return { side, sea, cells: tab.cells, exact, permutes, charged }
}

// ---- the continuum cluster model ----

// the first-order coupling operator K . A = sum over adjacent sector pairs (j, k) of c_jk Pi_j D(K) Pi_k + h.c.,
// D(K) = diag(K . r_d), couplings (c14, c49, c98, c28) real (a chain: their phases gauge away), plus M diag(x) on the
// sectors: returns the 24 x 24 real symmetric matrix at momentum K
export function clusterMatrix(
  p: Projectors,
  x: readonly number[],
  c: readonly number[],
  K: readonly number[],
): number[][] {
  const [P1, P2, P9, P4, P8] = projectorList(p) as [
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
  ]
  const d = R.map(r => r.reduce((s, v, k) => s + v * K[k]!, 0))
  const H: number[][] = Array.from({ length: N }, () =>
    Array<number>(N).fill(0),
  )

  const block = (A: Float64Array, B: Float64Array, w: number): void => {
    if (w === 0) {
      return
    }

    // w (A D B + B D A)
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        let s = 0

        for (let k = 0; k < N; k++) {
          s +=
            A[i * N + k]! * d[k]! * B[k * N + j]! +
            B[i * N + k]! * d[k]! * A[k * N + j]!
        }

        H[i]![j]! += w * s
      }
    }
  }

  const sectors = [P1, P2, P9, P4, P8]

  sectors.forEach((P, k) => {
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        H[i]![j]! += x[k]! * P[i * N + j]!
      }
    }
  })
  block(P1, P4, c[0]!)
  block(P9, P4, c[1]!)
  block(P9, P8, c[2]!)
  block(P2, P8, c[3]!)

  return H
}

// the cluster model's 24 bands at K (ascending), from the complex eigen solver on the real symmetric matrix
export function clusterBands(
  p: Projectors,
  x: readonly number[],
  c: readonly number[],
  K: readonly number[],
): number[] {
  const H = clusterMatrix(p, x, c, K)
  const re = Float64Array.from(H.flat())
  const im = new Float64Array(N * N)

  return [...complexEigenvalues({ re, im, n: N }).re].sort(
    (a, b) => a - b,
  )
}

export type HMat = { re: Float64Array; im: Float64Array }

export type FamilyCensus = {
  Bstar: number
  crossings: number
  pair: [number, number]
  at: number
  first: number
}

// THE CENSUS OF A HERMITIAN FAMILY H(p) = B + p A_u (24 x 24), in units where the singlet rests at +1 and the threshold
// is 2: for each A_u, p = P j / n (j = 1 .. n), the sorted real eigenvalues (sorted eigenvalues of a continuous
// Hermitian family are continuous), every pair sum against 2. B* the least positive 2 - sum (0 on a crossing), the
// crossings, the nearest pair and its p, and `first` the least p at which a crossing is seen
export function familyCensus(
  B: HMat,
  As: readonly HMat[],
  P: number,
  n: number,
  tol = 1e-9,
): FamilyCensus {
  let Bstar = Infinity
  let crossings = 0
  let pair: [number, number] = [NaN, NaN]
  let at = NaN
  let first = Infinity

  for (const A of As) {
    const last = new Float64Array(N * N).fill(NaN)

    for (let j = 1; j <= n; j++) {
      const s = (P * j) / n
      const re = new Float64Array(N * N)
      const im = new Float64Array(N * N)

      for (let i = 0; i < N * N; i++) {
        re[i] = B.re[i]! + s * A.re[i]!
        im[i] = B.im[i]! + s * A.im[i]!
      }

      const e = [...complexEigenvalues({ re, im, n: N }).re].sort(
        (a, b) => a - b,
      )

      for (let a = 0; a < N; a++) {
        for (let b = a; b < N; b++) {
          const y = 2 - e[a]! - e[b]!
          const w = last[a * N + b]!

          if (y > tol && y < Bstar) {
            Bstar = y
            pair = [e[a]!, e[b]!]
            at = s
          }

          if (Math.abs(y) <= tol) {
            continue
          }

          if (!Number.isNaN(w) && w > 0 !== y > 0) {
            crossings++
            first = Math.min(first, s)
          }

          last[a * N + b] = y
        }
      }
    }
  }

  return {
    Bstar: crossings > 0 ? 0 : Bstar,
    crossings,
    pair,
    at,
    first,
  }
}

const realH = (H: readonly (readonly number[])[]): HMat => ({
  re: Float64Array.from(H.flat()),
  im: new Float64Array(N * N),
})

// THE CLUSTER CENSUS: familyCensus of H(p) = M diag(x) + p (u . A) (clusterMatrix) along each direction
export function clusterCensus(
  p: Projectors,
  x: readonly number[],
  c: readonly number[],
  dirs: readonly (readonly number[])[],
  P: number,
  n: number,
  tol = 1e-9,
): FamilyCensus {
  return familyCensus(
    realH(clusterMatrix(p, x, [0, 0, 0, 0], [0, 0, 0, 0])),
    dirs.map(u => realH(clusterMatrix(p, [0, 0, 0, 0, 0], c, u))),
    P,
    n,
    tol,
  )
}

// THE IDEAL DIRAC MULTIPLET (a control the census must pass): six copies of the 4-component massive Dirac operator
// beta + p (u . alpha), beta = sz (x) 1, alpha_k = sx (x) s_k (k = 1, 2, 3), alpha_4 = sy (x) 1, five mutually
// anticommuting Hermitian matrices, so every band is +-sqrt(1 + p^2): S + S >= 2, S + D = 0, B* = 2 exactly
export function diracFamily(dirs: readonly (readonly number[])[]): {
  B: HMat
  As: HMat[]
} {
  type C = [number, number]

  const s: C[][][] = [
    [
      [
        [1, 0],
        [0, 0],
      ],
      [
        [0, 0],
        [1, 0],
      ],
    ],
    [
      [
        [0, 0],
        [1, 0],
      ],
      [
        [1, 0],
        [0, 0],
      ],
    ],
    [
      [
        [0, 0],
        [0, -1],
      ],
      [
        [0, 1],
        [0, 0],
      ],
    ],
    [
      [
        [1, 0],
        [0, 0],
      ],
      [
        [0, 0],
        [-1, 0],
      ],
    ],
  ]
  // s[0] = identity, s[1] = sx, s[2] = sy, s[3] = sz, each [row][col] = [re, im]
  const kron = (a: C[][], b: C[][]): C[][] =>
    Array.from({ length: 4 }, (_, i) =>
      Array.from({ length: 4 }, (_, j): C => {
        const x = a[i >> 1]![j >> 1]!
        const y = b[i & 1]![j & 1]!

        return [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]]
      }),
    )
  const [I2, sx, sy, sz] = s as [C[][], C[][], C[][], C[][]]
  const beta = kron(sz, I2)
  const alphas = [
    kron(sx, sx),
    kron(sx, sy),
    kron(sx, sz),
    kron(sy, I2),
  ]

  const blocks = (m: C[][], w: number, into: HMat): void => {
    for (let copy = 0; copy < 6; copy++) {
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          const e = m[i]![j]!
          const at = (4 * copy + i) * N + 4 * copy + j

          into.re[at] = into.re[at]! + w * e[0]
          into.im[at] = into.im[at]! + w * e[1]
        }
      }
    }
  }

  const B: HMat = {
    re: new Float64Array(N * N),
    im: new Float64Array(N * N),
  }

  blocks(beta, 1, B)

  const As = dirs.map(u => {
    const A: HMat = {
      re: new Float64Array(N * N),
      im: new Float64Array(N * N),
    }

    alphas.forEach((a, k) => blocks(a, u[k]!, A))

    return A
  })

  return { B, As }
}
