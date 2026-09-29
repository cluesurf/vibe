// Idea 4a of the gravity roadmap (note/research/vibe/roadmap/remaining-pieces.md, section 4): can one depth per line
// class carry spin-2 waves? A derivation on the lattice symbol, not a run of the working rule.
//
// THE FIELD. One depth d_a per line class a per dock, the 12 classes the D4 first roots of the {3,4,3,4} mesh
// (code/measure/line-class-metric lineClasses): e_i +- e4 over each husk axis, e_i +- e_j over the face diagonals. The span
// along class a reads its own depth, delta l / l = d_a, and a metric perturbation gives d_a = (1/2) n_a.h.n_a (Regge's
// edge-length relation), so d = A h with A the 12 x 6 span map.
//
// THE VARIANTS (every one evaluated at k = |p| along the axis, the face diagonal and the body diagonal):
//   naive     each class runs the husk operator on its own: d'' = -c^2 (lambda(p) / 6) d, no coupling.
//   regge     the metric part h = A^+ d runs linearized general relativity in synchronous gauge, h'' = -2 R(q) h, R the
//             spatial Ricci tensor on the central lattice symbol q_i = sin p_i, with the Hamiltonian and momentum
//             constraints held; the 6 non-metric combinations are held (no dynamics of their own).
//   staggered the same on the nearest-neighbor symbol q_i = 2 sin(p_i / 2) (a second discretization, for robustness).
//   husk      regge with the |q|^2 h_ij term replaced by the husk operator lambda / 6 (the per-class husk operator plus
//             the couplings), a negative control on the gauge identity.
//   loose     regge with the 6 non-metric combinations given the husk operator (what the extras do if not held).
//   scalar    CONTROL: the one-depth field in use, every class reading the same depth.
// The time step is the leapfrog's, 4 sin^2(omega / 2) = kappa mu, mu an eigenvalue of the evolution matrix, kappa = c^2
// with c = 2 / sqrt(3 (2D + 1)) at D = 3, the light's c(D) and the radion's.
//
// THE GATES, fixed before computing:
//   S1  exactly 2 transverse-traceless propagating modes per k on the constraint surface, with omega = c |k| to 1% at
//       k = 0.05, and isotropic across the three directions through O(k^2): the k -> 0 limit of omega^2 / k^2
//       (Richardson from k = 0.01, 0.02) the same in all three directions to 1%.
//   S2  every trace, longitudinal and vector (non-TT metric) mode is either gauge (zero frequency, inside the span of
//       q xi + xi q) or excluded by the constraints (bound to the source), in every direction.
//   S3  the static field of a point source (lapse and spatial metric, de Donder gauge, solved by least squares from the
//       linearized R_00 and R_ij, with no isotropy imposed) has gamma = Psi / Phi = 1 to 1% (bending 1 + gamma = 2),
//       reads the same span on all 12 classes to 1%, and its gauge-invariant Psi equals the scalar depth's static
//       solution 1 / lambda(p) (times 6, the unit of G) to 1% at k = 0.05 in all three directions.
//   control  the scalar field has 0 transverse-traceless modes.
// A real-space leapfrog of the regge variant on a periodic box of side 8 checks that the beat is local and matches the
// symbol, that a pure gauge start stays put, that the constraints are preserved, and that it runs backward.
//
// WHAT THIS IS NOT. The regge variant is linearized general relativity written on the line classes, not Regge's action
// on this mesh. Regge's action needs a simplicial complex, and the husk is not one: every square face carries both
// diagonals, which cross at the face center with no dock there. A deficit-angle action needs a choice of one diagonal
// per face (a 5-tetrahedron split of each cube, alternating), which breaks the cubic symmetry the 12 classes carry. The
// extras are held by assumption (Rocek and Williams 1981 found the extra edge variables of a hypercubic Regge lattice
// auxiliary at long wavelength), not derived here. L1: known math, correctly confirmed on this mesh's classes.
//
// WHAT IS PUT IN. The speed: kappa = c^2 makes the TT modes run at c, so omega = c k is the normalization, not a
// finding. The coupling: the regge variant's operator is the linearized Ricci tensor, chosen because it is general
// relativity. What could have come out otherwise and is measured: how many modes propagate on the constraint surface
// and of which kind, that the gauge and longitudinal modes sit at exactly zero on the lattice, that the leading
// coefficient is the same in the three directions, the 12-to-6 rank and what the kernel holds, gamma and the span
// spread of the static field (no isotropy imposed), and the real-space beat's agreement with its symbol.
//
// DETERMINISM: nothing is drawn. Every start is a placed plane wave.

import {
  apply,
  classBeat,
  classField,
  constraintRows,
  eigenspaces,
  gaugeVecs,
  hamiltonianField,
  huskShift,
  identity,
  intersectionDimension,
  latticeSymbol,
  lineClasses,
  metricOf,
  multiply,
  nullBasis,
  pseudoInverse,
  ricciEvolution,
  spanMap,
  spanMap4,
  transpose,
  transverseTracelessVecs,
  vecOf,
  type Matrix,
  type SymbolKind,
} from '@/code/measure/line-class-metric'
import { huskSymbol } from '@/code/measure/husk-box'
import { TRIT_HUSK_VECTORS } from '@/code/rule/trit-column'
import { solveLinearSystem } from '@/code/algebra/linear/dense'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const D = 3
const C = 2 / Math.sqrt(3 * (2 * D + 1))
const KAPPA = C * C
const K_GATE = 0.05
const K_FIT = 0.01
const TOLERANCE = 0.01
const DIRECTIONS: readonly { name: string; n: number[] }[] = [
  { name: 'axis', n: [1, 0, 0] },
  { name: 'face', n: [1 / Math.SQRT2, 1 / Math.SQRT2, 0] },
  {
    name: 'body',
    n: [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3)],
  },
]

type Variant = 'naive' | 'regge' | 'staggered' | 'husk' | 'loose'

const VARIANTS: readonly Variant[] = [
  'naive',
  'regge',
  'staggered',
  'husk',
  'loose',
]

const norm = (v: readonly number[]): number => Math.hypot(...v)
const unitVec = (v: readonly number[]): number[] =>
  v.map(x => x / norm(v))
const f3 = (x: number): string => x.toFixed(3)
const f5 = (x: number): string => x.toFixed(5)
const e1 = (x: number): string => x.toExponential(1)

// ---------------------------------------------------------------------------------------------------------
// the span map and its rank

const CLASSES = lineClasses()
const A = spanMap(CLASSES)
const A_PLUS = pseudoInverse(A)
const PROJECT = multiply(A, A_PLUS)

function rankReport(): {
  rank: number
  singular: number[]
  extras: number
  namedInKernel: number
  namedRank: number
  rank4: number
  extras4: number
  rankHusk: number
} {
  const gram = nullBasis(A, 6)
  const left = nullBasis(transpose(A), 12)
  const indexOf = (root: readonly number[]): number =>
    CLASSES.findIndex(c => c.root.every((x, i) => x === root[i]))
  const axis = (i: number, s: number): number =>
    indexOf([...[0, 1, 2].map((j): number => (j === i ? 1 : 0)), s])
  const diag = (i: number, j: number, s: number): number =>
    indexOf(
      [0, 1, 2].map(m => (m === i ? 1 : m === j ? s : 0)).concat([0]),
    )
  const tilt = [0, 1, 2].map(i =>
    Array.from({ length: 12 }, (_, a) =>
      a === axis(i, 1) ? 1 : a === axis(i, -1) ? -1 : 0,
    ),
  )
  const mismatch = [
    [0, 1],
    [0, 2],
    [1, 2],
  ].map(([i, j]) =>
    Array.from({ length: 12 }, (_, a) => {
      if (a === diag(i!, j!, 1) || a === diag(i!, j!, -1)) {
        return 1
      }

      if (
        a === axis(i!, 1) ||
        a === axis(i!, -1) ||
        a === axis(j!, 1) ||
        a === axis(j!, -1)
      ) {
        return -0.5
      }

      return 0
    }),
  )
  const named = [...tilt, ...mismatch]
  const namedInKernel = named.filter(
    v => norm(apply(transpose(A), v)) < 1e-14,
  ).length
  const namedRank = 6 - nullBasis(transpose(named), 6).basis.length
  const a4 = spanMap4(CLASSES)
  const husk = TRIT_HUSK_VECTORS.map(u => {
    const n = unitVec(u)

    return vecOf(n.map(x => n.map(y => 0.5 * x * y)))
  })

  return {
    rank: gram.rank,
    singular: gram.values.map(v => Math.sqrt(Math.max(0, v))),
    extras: left.basis.length,
    namedInKernel,
    namedRank,
    rank4: nullBasis(a4, 10).rank,
    extras4: 12 - nullBasis(a4, 10).rank,
    rankHusk: nullBasis(husk, 6).rank,
  }
}

// ---------------------------------------------------------------------------------------------------------
// the modes of a variant at one wavevector

type ModeCount = {
  // propagating modes on the constraint surface, by kind
  tt: number
  nonTT: number
  extra: number
  // propagating non-TT modes with no constraint applied (what an unconstrained run carries)
  nonTTFree: number
  // zero-frequency modes on the constraint surface outside gauge and the held extras
  zeroStray: number
  // omega / (c k) of the TT modes, and their mu / k^2
  ttSpeed: number[]
  ttMu: number[]
  // omega / (c k) of the non-TT propagating modes on the constraint surface (metric and extra)
  strayOmega: number[]
  // largest |imaginary| part and eigenspace dimensions total (6 or 12 if diagonalizable)
  imaginary: number
  dimension: number
}

function evolution12(
  variant: Variant,
  q: number[],
  p: number[],
): Matrix {
  const lambda6 = huskSymbol(p) / 6

  if (variant === 'naive') {
    return identity(12).map(row => row.map(x => x * lambda6))
  }

  const m6 = ricciEvolution(q)
  const shifted =
    variant === 'husk'
      ? m6.map((row, i) =>
          row.map((x, j) => x + (i === j ? huskShift(q, p) : 0)),
        )
      : m6
  const metric = multiply(multiply(A, shifted), A_PLUS)

  if (variant !== 'loose') {
    return metric
  }

  return metric.map((row, i) =>
    row.map(
      (x, j) => x + lambda6 * ((i === j ? 1 : 0) - PROJECT[i]![j]!),
    ),
  )
}

// the orthonormal basis of the non-metric combinations (the left null space of A)
const EXTRAS = nullBasis(transpose(A), 12).basis

// Every variant's 12 x 12 evolution keeps the metric part (the range of A) and the non-metric part apart exactly
// (checked: `leak` is |M P - P M|), so the two sectors are diagonalized apart: the metric sector as A^+ M A (6 x 6) on
// h, the non-metric sector as E M E^T on the 6 extras. Diagonalizing the 12 x 12 at once mixes them numerically where
// their eigenvalues nearly meet (the loose variant's extras sit at lambda / 6, within p^4 of the TT modes' |q|^2).
function modes(
  variant: Variant,
  n: readonly number[],
  k: number,
): ModeCount & { leak: number } {
  const p = n.map(x => x * k)
  const symbol: SymbolKind =
    variant === 'staggered' ? 'staggered' : 'central'
  const q = latticeSymbol(symbol, p)
  const q2 = q.reduce((t, x) => t + x * x, 0)
  const m12 = evolution12(variant, q, p)
  const scale = Math.max(...m12.flat().map(Math.abs))
  const left = multiply(PROJECT, m12)
  const leak =
    Math.max(
      ...multiply(m12, PROJECT).flatMap((row, i) =>
        row.map((x, j) => Math.abs(x - left[i]![j]!)),
      ),
    ) / scale
  const metric = multiply(multiply(A_PLUS, m12), A)
  const extra = multiply(multiply(EXTRAS, m12), transpose(EXTRAS))
  const constrained = variant !== 'naive'
  // scaled to order one, so the null space below is read against a floor of 1
  const c6 = constraintRows(q).map(row => row.map(x => x / q2))
  const tt6 = transverseTracelessVecs(unitVec(q))
  const gauge6 = gaugeVecs(q).map(unitVec)
  const count: ModeCount & { leak: number } = {
    tt: 0,
    nonTT: 0,
    extra: 0,
    nonTTFree: 0,
    zeroStray: 0,
    ttSpeed: [],
    ttMu: [],
    strayOmega: [],
    imaginary: 0,
    dimension: 0,
    leak,
  }
  const omegaOf = (mu: number): number =>
    2 * Math.asin(Math.sqrt(KAPPA * mu) / 2)

  for (const space of eigenspaces(metric, 1e-7, q2)) {
    count.imaginary = Math.max(
      count.imaginary,
      Math.abs(space.imaginary),
    )
    count.dimension += space.basis.length

    const mu = space.value
    const moving = mu > 1e-10 * q2
    // the constraint surface: for a moving mode all four rows (the momentum constraint reads dh/dt, proportional to
    // h); for a static mode the Hamiltonian row only (dh/dt = 0)
    const rows = constrained ? (moving ? c6 : [c6[0]!]) : []
    const inside =
      rows.length === 0
        ? space.basis
        : nullBasis(
            multiply(rows, transpose(space.basis)),
            space.basis.length,
            1e-12,
            1,
          ).basis.map(w =>
            space.basis[0]!.map((_, i) =>
              space.basis.reduce((t, b, j) => t + w[j]! * b[i]!, 0),
            ),
          )
    const tt = intersectionDimension(inside, tt6)

    if (moving) {
      count.tt += tt
      count.nonTT += inside.length - tt
      count.nonTTFree +=
        space.basis.length - intersectionDimension(space.basis, tt6)

      for (let i = 0; i < tt; i++) {
        count.ttSpeed.push(omegaOf(mu) / (C * k))
        count.ttMu.push(mu / (k * k))
      }

      for (let i = 0; i < inside.length - tt; i++) {
        count.strayOmega.push(omegaOf(mu) / (C * k))
      }
    } else {
      count.zeroStray +=
        inside.length - intersectionDimension(inside, gauge6)
    }
  }

  // the extras read no constraint (A^+ annihilates them): every one with a nonzero frequency propagates
  for (const space of eigenspaces(extra, 1e-7, q2)) {
    count.imaginary = Math.max(
      count.imaginary,
      Math.abs(space.imaginary),
    )
    count.dimension += space.basis.length

    if (space.value > 1e-10 * q2) {
      count.extra += space.basis.length

      for (let i = 0; i < space.basis.length; i++) {
        count.strayOmega.push(omegaOf(space.value) / (C * k))
      }
    }
  }

  return count
}

// ---------------------------------------------------------------------------------------------------------
// the static field of a point source, de Donder gauge, least squares over R_00, R_ij and the gauge rows

function staticField(
  variant: 'regge' | 'husk',
  n: readonly number[],
  k: number,
): {
  gamma: number
  spread: number
  profile: number
  residual: number
  offDiagonal: number
} {
  const p = n.map(x => x * k)
  const q = latticeSymbol('central', p)
  const q2 = q.reduce((t, x) => t + x * x, 0)
  const m6 = ricciEvolution(q)
  const shift = variant === 'husk' ? huskShift(q, p) : 0
  // unknowns [phi, vec h]; 2 R_ij + 2 q_i q_j phi = 2 delta_ij, -q^2 phi = 1 (R_00), q_j h_ij - (1/2) q_i (2 phi + tr h) = 0
  const rows: number[][] = []
  const rhs: number[] = []

  rows.push([-q2, 0, 0, 0, 0, 0, 0])
  rhs.push(1)

  const qq = vecOf(q.map(x => q.map(y => x * y)))
  const delta = vecOf(identity(3))

  for (let s = 0; s < 6; s++) {
    rows.push([
      2 * qq[s]!,
      ...m6[s]!.map((x, j) => x + (s === j ? shift : 0)),
    ])
    rhs.push(2 * delta[s]!)
  }

  const trace = [1, 1, 1, 0, 0, 0]

  for (let i = 0; i < 3; i++) {
    const g = constraintRows(q)[1 + i]!

    // q_j h_ij - q_i tr h + (1/2) q_i tr h - q_i phi
    rows.push([-q[i]!, ...g.map((x, s) => x + 0.5 * q[i]! * trace[s]!)])
    rhs.push(0)
  }

  const jt = transpose(rows)
  const x = solveLinearSystem({
    matrix: multiply(jt, rows),
    rightHandSide: apply(jt, rhs),
  })
  const residual = norm(apply(rows, x).map((v, i) => v - rhs[i]!))
  const phi = x[0]!
  const h = x.slice(1)
  const nq = unitVec(q)
  const hm = [0, 1, 2].map(i =>
    [0, 1, 2].map(j =>
      i === j ? h[i]! : h[[3, 4, 5][i + j - 1]!]! / Math.SQRT2,
    ),
  )
  const projectedTrace = [0, 1, 2].reduce(
    (t, i) =>
      t +
      hm[i]![i]! -
      nq[i]! * [0, 1, 2].reduce((u, j) => u + hm[i]![j]! * nq[j]!, 0),
    0,
  )
  const psi = projectedTrace / 4
  const spans = apply(A, h)
  const mean = spans.reduce((t, v) => t + v, 0) / 12

  return {
    gamma: psi / -phi,
    spread: (Math.max(...spans) - Math.min(...spans)) / Math.abs(mean),
    profile: psi / (6 / huskSymbol(p)),
    residual,
    offDiagonal:
      Math.max(...h.slice(3).map(Math.abs)) / Math.abs(h[0]!),
  }
}

// ---------------------------------------------------------------------------------------------------------
// the real-space leapfrog on a box of side 8

function realSpace(): {
  speedGap: number
  scalarGap: number
  gaugeDrift: number
  extraDrift: number
  constraint: number
  reverse: number
  bound: number
} {
  const side = 8
  const f = classField(side)
  const p = (2 * Math.PI) / side
  const beats = 240
  const coords = (y: number): number[] => [
    y % side,
    Math.floor(y / side) % side,
    Math.floor(y / (side * side)),
  ]

  const place = (h: (x: number[]) => number[][]): Float64Array => {
    const d = new Float64Array(f.docks * 12)

    for (let y = 0; y < f.docks; y++) {
      apply(A, vecOf(h(coords(y)))).forEach(
        (v, a) => (d[y * 12 + a] = v),
      )
    }

    return d
  }

  const zero = (): number[][] => [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]

  // the amplitude of h_ij along cos(p x) (component (i, j) of the metric)
  const amplitude = (d: Float64Array, i: number, j: number): number => {
    const h = metricOf(f, d)
    const slot =
      [0, 1, 2].includes(i) && i === j ? i : [3, 4, 5][i + j - 1]!
    const scale = i === j ? 1 : 1 / Math.SQRT2

    let s = 0
    let w = 0

    for (let y = 0; y < f.docks; y++) {
      const c = Math.cos(p * coords(y)[0]!)

      s += c * h[y * 6 + slot]! * scale
      w += c * c
    }

    return s / w
  }

  const run = (
    start: Float64Array,
    count: number,
    read: (d: Float64Array) => number,
  ): {
    series: number[]
    last: Float64Array
    before: Float64Array
    peak: number
  } => {
    let before = start
    let now = start

    const series = [read(now)]

    let peak = 0

    for (let t = 0; t < count; t++) {
      const next = classBeat(f, KAPPA, now, before)

      before = now
      now = next
      series.push(read(now))

      for (const v of now) {
        peak = Math.max(peak, Math.abs(v))
      }
    }

    return { series, last: now, before, peak }
  }

  const cosOmega = (series: number[]): number => {
    const top = Math.max(...series.map(Math.abs))
    const reads: number[] = []

    for (let t = 1; t < series.length - 1; t++) {
      if (Math.abs(series[t]!) > 0.5 * top) {
        reads.push((series[t + 1]! + series[t - 1]!) / (2 * series[t]!))
      }
    }

    return reads.reduce((a, b) => a + b, 0) / reads.length
  }

  const q2 = Math.sin(p) ** 2
  const symbolCos = 1 - (KAPPA * q2) / 2
  // (a) a TT wave along x: h_yz = cos(p x)
  const tt = place(x => {
    const h = zero()

    h[1]![2] = Math.cos(p * x[0]!)
    h[2]![1] = h[1]![2]!

    return h
  })

  let constraint = 0

  const ttRun = run(tt, beats, d => {
    for (const v of hamiltonianField(f, metricOf(f, d))) {
      constraint = Math.max(constraint, Math.abs(v))
    }

    return amplitude(d, 1, 2)
  })

  // (c) the constraint-violating trace: h_yy = h_zz = cos(p x)
  const scalar = place(x => {
    const h = zero()

    h[1]![1] = Math.cos(p * x[0]!)
    h[2]![2] = h[1]![1]!

    return h
  })
  const scalarRun = run(scalar, beats, d => amplitude(d, 1, 1))
  // (d) pure gauge, xi_x = sin(p x) and xi_y = sin(p (x + z)): h = D xi + xi D by central differences
  const gauge = place(x => {
    const h = zero()
    const dx = Math.sin(p) * Math.cos(p * x[0]!)
    const dxy = Math.sin(p) * Math.cos(p * (x[0]! + x[2]!))

    h[0]![0] = 2 * dx
    h[0]![1] = dxy
    h[1]![0] = dxy
    h[1]![2] = dxy
    h[2]![1] = dxy

    return h
  })
  const gaugeRun = run(gauge, beats, () => 0)
  const gaugeDrift = Math.max(
    ...gaugeRun.last.map((v, i) => Math.abs(v - gauge[i]!)),
  )
  // (e) a held extra: the first tilt (e_x + e4 against e_x - e4) at every dock, times cos(p x)
  const extraStart = new Float64Array(f.docks * 12)

  for (let y = 0; y < f.docks; y++) {
    extraStart[y * 12 + 0] = Math.cos(p * coords(y)[0]!)
    extraStart[y * 12 + 1] = -Math.cos(p * coords(y)[0]!)
  }

  const extraRun = run(extraStart, beats, () => 0)
  const extraDrift = Math.max(
    ...extraRun.last.map((v, i) => Math.abs(v - extraStart[i]!)),
  )
  // (f) all three together forward, then backward
  const mixed = tt.map((v, i) => v + gauge[i]! + extraStart[i]!)
  const forward = run(mixed, 120, () => 0)

  let before = forward.last
  let now = forward.before

  for (let t = 0; t < 119; t++) {
    const next = classBeat(f, KAPPA, now, before)

    before = now
    now = next
  }

  const reverse = Math.max(
    ...now.map((v, i) => Math.abs(v - mixed[i]!)),
  )

  return {
    speedGap: Math.abs(cosOmega(ttRun.series) - symbolCos),
    scalarGap: Math.abs(cosOmega(scalarRun.series) - symbolCos),
    gaugeDrift,
    extraDrift,
    constraint,
    reverse,
    bound: ttRun.peak / Math.max(...tt.map(Math.abs)),
  }
}

export default experiment({
  id: 'gravity/line-class-spin-two',
  code: 'E-GRV-0125',
  title:
    "one depth per line class carries spin 2 at the symbol level, pass at L1 with two assumptions: the 12 class spans fix all 6 h_ij (rank 6; the 6 extras are 3 depth tilts, e_i + e4 against e_i - e4, and 3 axis-diagonal mismatches), and linearized general relativity on them (central symbol sin p, range 2, Hamiltonian and momentum constraints held, extras held) has exactly 2 TT modes at omega / c k 0.9996 .. 0.9999 at k = 0.05, the c^2 limit equal along axis, face and body to 2e-9, vector and longitudinal modes exact gauge zeros, the trace mode at c only off the constraint surface, and a static source with gamma 1 to 2e-14, one span on all 12 classes and Psi within 6e-4 of the scalar depth; the per-class husk operator alone fails S2 (4 non-TT metric modes and 6 extras at c), the husk operator in place of |q|^2 breaks the gauge identity at p^4 (a vector mode at 0.025 c, no consistent static field), unheld extras add 6 modes at c, and the husk is not simplicial (both diagonals on every face), so this is not Regge's action",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const rank = rankReport()
    const table = VARIANTS.map(variant => ({
      variant,
      gate: DIRECTIONS.map(d => modes(variant, d.n, K_GATE)),
      fit: DIRECTIONS.map(d => {
        const a = modes(variant, d.n, K_FIT).ttMu
        const b = modes(variant, d.n, 2 * K_FIT).ttMu

        return a.length > 0 && b.length > 0
          ? (4 * a[0]! - b[0]!) / 3
          : Number.NaN
      }),
      quartic: DIRECTIONS.map(d => {
        const a = modes(variant, d.n, K_FIT).ttMu
        const b = modes(variant, d.n, 2 * K_FIT).ttMu

        return a.length > 0 && b.length > 0
          ? (b[0]! - a[0]!) / (3 * K_FIT * K_FIT)
          : Number.NaN
      }),
    }))

    const s1 = (row: (typeof table)[number]): boolean => {
      const counts = row.gate.every(
        g =>
          g.dimension === 12 &&
          g.tt === 2 &&
          g.ttSpeed.every(s => Math.abs(s - 1) < TOLERANCE),
      )
      const limits = row.fit.map(x => x)
      const iso =
        limits.every(x => Number.isFinite(x)) &&
        (Math.max(...limits) - Math.min(...limits)) /
          Math.max(...limits) <
          TOLERANCE

      return counts && iso
    }

    const s2 = (row: (typeof table)[number]): boolean =>
      row.gate.every(
        g => g.dimension === 12 && g.nonTT === 0 && g.zeroStray === 0,
      )
    const statics = (['regge', 'husk'] as const).map(v => ({
      variant: v,
      reads: DIRECTIONS.map(d => staticField(v, d.n, K_GATE)),
    }))
    const s3 = (reads: ReturnType<typeof staticField>[]): boolean =>
      reads.every(
        r =>
          Math.abs(r.gamma - 1) < TOLERANCE &&
          r.spread < TOLERANCE &&
          Math.abs(r.profile - 1) < TOLERANCE &&
          r.residual < 1e-9,
      )
    // the control: the scalar depth read equally by every class
    const scalarState = unitVec(new Array<number>(12).fill(1))
    const scalarTT = DIRECTIONS.map(d =>
      intersectionDimension(
        [scalarState],
        transverseTracelessVecs(d.n).map(v => unitVec(apply(A, v))),
      ),
    )
    const scalarOverlap = Math.max(
      ...DIRECTIONS.map(d =>
        Math.max(
          ...transverseTracelessVecs(d.n).map(v =>
            Math.abs(
              apply(A_PLUS, scalarState).reduce(
                (t, x, i) => t + x * v[i]!,
                0,
              ),
            ),
          ),
        ),
      ),
    )
    const control = scalarTT.every(x => x === 0)
    const real = realSpace()
    const regge = table.find(r => r.variant === 'regge')!
    const reggeStatic = statics[0]!.reads
    const pass = {
      S1: s1(regge),
      S2: s2(regge),
      S3: s3(reggeStatic),
    }
    const status =
      pass.S1 && pass.S2 && pass.S3 && control ? 'pass' : 'fail'
    const describe = (row: (typeof table)[number]): string =>
      `${row.variant}: S1 ${s1(row)}, S2 ${s2(row)}; ${row.gate
        .map(
          (g, i) =>
            `${DIRECTIONS[i]!.name} TT ${g.tt} at ${g.ttSpeed.map(f5).join('/')}, non-TT moving ${g.nonTT} (free ${g.nonTTFree})${g.strayOmega.length > 0 ? ` at ${g.strayOmega.map(f3).join('/')}` : ''}, extras moving ${g.extra}, stray zeros ${g.zeroStray}, dims ${g.dimension}, imag ${e1(g.imaginary)}`,
        )
        .join(
          '; ',
        )}; c^2 limits ${row.fit.map(f5).join(', ')}; k^4 coefficients ${row.quartic.map(f3).join(', ')}`
    const metrics: Record<string, number> = {
      rank: rank.rank,
      extras: rank.extras,
      namedInKernel: rank.namedInKernel,
      namedRank: rank.namedRank,
      rank4: rank.rank4,
      extras4: rank.extras4,
      rankHusk: rank.rankHusk,
      reggeTT: Math.min(...regge.gate.map(g => g.tt)),
      reggeNonTT: Math.max(...regge.gate.map(g => g.nonTT)),
      reggeNonTTFree: Math.max(...regge.gate.map(g => g.nonTTFree)),
      reggeSpeedWorst: Math.max(
        ...regge.gate.flatMap(g => g.ttSpeed.map(s => Math.abs(s - 1))),
      ),
      reggeIsotropy:
        (Math.max(...regge.fit) - Math.min(...regge.fit)) /
        Math.max(...regge.fit),
      gammaWorst: Math.max(
        ...reggeStatic.map(r => Math.abs(r.gamma - 1)),
      ),
      spanSpreadWorst: Math.max(...reggeStatic.map(r => r.spread)),
      profileWorst: Math.max(
        ...reggeStatic.map(r => Math.abs(r.profile - 1)),
      ),
      huskNonTT: Math.max(
        ...table
          .find(r => r.variant === 'husk')!
          .gate.map(g => g.nonTT + g.zeroStray),
      ),
      naiveNonTT: Math.max(
        ...table
          .find(r => r.variant === 'naive')!
          .gate.map(g => g.nonTT),
      ),
      looseExtras: Math.max(
        ...table
          .find(r => r.variant === 'loose')!
          .gate.map(g => g.extra),
      ),
      scalarTT: Math.max(...scalarTT),
      sectorLeak: Math.max(
        ...table.flatMap(r => r.gate.map(g => g.leak)),
      ),
      realSpeedGap: real.speedGap,
      realGaugeDrift: real.gaugeDrift,
      realConstraint: real.constraint,
      realReverse: real.reverse,
    }

    return verdict({
      status,
      claim: `the 12 class spans fix all 6 h_ij (rank ${rank.rank}, ${rank.extras} extras: ${rank.namedInKernel} named, 3 depth tilts and 3 axis-diagonal mismatches, rank ${rank.namedRank}); linearized general relativity on the classes (central symbol, constraints held, extras held) gives S1 ${pass.S1} (2 TT modes, omega / c k within ${e1(metrics.reggeSpeedWorst!)} of 1 at k = ${K_GATE}, c^2 limits equal to ${e1(metrics.reggeIsotropy!)}), S2 ${pass.S2} (the trace mode moves at c only off the constraint surface, vector and longitudinal modes are exact gauge zeros), S3 ${pass.S3} (gamma 1 to ${e1(metrics.gammaWorst!)}, every class the same span, Psi against the scalar depth within ${e1(metrics.profileWorst!)}), control ${control} (the scalar depth has ${metrics.scalarTT} TT modes); the per-class husk operator alone ${s2(table[0]!) ? 'passes' : 'fails'} S2 (${metrics.naiveNonTT} non-TT metric modes and 6 extras at c), the husk operator in place of |q|^2 ${s2(table[3]!) ? 'passes' : 'fails'} S2 (a vector mode at omega / c k = ${f3(table[3]!.gate[0]!.strayOmega[0] ?? 0)} on the axis, the gauge identity broken at p^4) and ${s3(statics[1]!.reads) ? 'passes' : 'fails'} S3 (no consistent static solution, residual ${e1(statics[1]!.reads[0]!.residual)}), and unheld extras add ${metrics.looseExtras} non-metric modes at c`,
      metrics,
      control: {
        scalarTT: Math.max(...scalarTT),
        naiveNonTT: metrics.naiveNonTT!,
        huskNonTT: metrics.huskNonTT!,
      },
      notes: `L1. Rank: A 12x6 rank ${rank.rank}, singular ${rank.singular.map(f3).join(' ')}; 4d reading rank ${rank.rank4} of 10 (${rank.extras4} extras); the 9 husk directions alone rank ${rank.rankHusk}. ${table.map(describe).join(' | ')}. Static (regge): ${reggeStatic.map((r, i) => `${DIRECTIONS[i]!.name} gamma ${f5(r.gamma)} spread ${e1(r.spread)} profile ${f5(r.profile)} off-diagonal ${e1(r.offDiagonal)} residual ${e1(r.residual)}`).join('; ')}. Static (husk): ${statics[1]!.reads.map((r, i) => `${DIRECTIONS[i]!.name} gamma ${f5(r.gamma)} profile ${f5(r.profile)} residual ${e1(r.residual)}`).join('; ')}. Control: scalar TT ${scalarTT.join('/')}, overlap ${e1(scalarOverlap)}. Real space, side 8, ${'regge'}: TT cos omega against the symbol ${e1(real.speedGap)}, the trace start propagates too (${e1(real.scalarGap)} from the TT symbol: only the constraint binds it), gauge drift ${e1(real.gaugeDrift)}, extras drift ${e1(real.extraDrift)}, Hamiltonian constraint ${e1(real.constraint)}, reversed ${e1(real.reverse)}, peak over start ${f3(real.bound)}. Not Regge's action: the husk has both diagonals on every face, so it is not simplicial; the extras are held by assumption.`,
    })
  },
})
