// The two open pieces E-GRV-0138 left (note/research/vibe/roadmap/remaining-pieces.md, "Spin 2 from the rule's own
// symmetry"): its static slide fixed the metric coupling to linearized Einstein-Hilbert but left the 6 extras
// dynamical and the kinetic term free (the TT polarizations' squared speeds 2.5 apart with equal inertia per class).
// Two ideas, both fixed before computing:
//   (a) isotropy: weight class a by |u_a|^4, the register holding the squared-length change u.h.u (Regge's variable);
//       the claim is A^T W A = |h|^2 + (1/2)(tr h)^2
//   (b) a SPACETIME slide: xi_mu(x, t) with x^0 = c t, the light's c, delta h_mu nu = D_mu xi_nu + D_nu xi_mu; the 3
//       depth tilts carry h_0i (the ADM shift), and the full quadratic action, kinetic plus first order plus potential,
//       must be invariant (code/measure/spacetime-slide)
//
// HOW THE SLIDE ACTS ON THE 12 DEPTHS (derived in code/measure/spacetime-slide, checked here). The 12 depths split
// under the cube group and the depth flip w -> -w into the metric's 6 (A1g + Eg + T2g, even), the 3 tilts (T1u, odd)
// and the 3 axis-diagonal mismatches (A1g + Eg, even). The ADM variables split into h_ij (the same 6), h_0i (T1u, odd
// under time reversal) and h_00 (A1g, even). So the tilts are the shift, the mismatches' sum L (+1 on the face
// diagonals, -1 on the axes) is the only slot with the lapse's representation, and the mismatches' Eg doublet has no
// slot in a 4d metric at all: the D4 span map over the 10 components of a 4d metric has rank 10 and a 2-dimensional
// left kernel carrying no A1g, T1u or T2g part. On the depths: delta h_ij = D_i xi_j + D_j xi_i (E-GRV-0138's central
// slide), delta tau_i = D_i xi_0 + (1/c) dt xi_i, delta L = (2/c) dt xi_0, and the doublet never moves.
//
// THE COMPUTATION, exact over GF(p) for two primes (every count must agree). Parameters: one per orbit of the kernels'
// (a, b, r) under the 48 cube maps and the transpose; M (kinetic) on-site, N (first order in time, antisymmetric)
// within one husk step, K (potential) within two, the tower the slide's equations need (M G0 reaches one step, so N
// must; N G0 reaches two, so K must). Invariance is S(omega, p) G(omega, p) = 0 power by power in omega.
//
// THE GATES, fixed before computing:
//   V1  with (a), the two TT polarizations have equal omega^2 / k^2 along an axis, a face diagonal and a body diagonal,
//       exactly (dyadic arithmetic, cross-multiplied)
//   V2  with (b), no invariant action gives the tilts a kinetic term: every member's M has zero tilt rows and its N
//       zero (tilt, tilt or lapse) block, while the family still holds a metric kinetic term and a shift coupling
//   V3  with (b), the TT speed is fixed: over the family the cross polarization's kinetic coefficient mu and gradient
//       coefficient S2 are proportional (rank 1) with S2 + 2 c^2 mu = 0, so omega^2 = c^2 k^2 exactly
//   V4  with (b), none of the 3 mismatches is left free: each is forced auxiliary (no M row, no N block with itself)
//       or pure gauge
//   controls
//     C1 (a) off (equal inertia per class) gives the two polarizations along an axis unequal speeds, E-GRV-0138's
//        omega^2 ratio 5/2
//     C2 the static spatial slide reproduces E-GRV-0138: its potential family and its extras' derivative count equal
//        those computed by E-GRV-0138's own route (code/measure/slide-invariant-operators), M and N are left free
//        (U3), and the tilts may carry a kinetic term (U2)
//     C3 E-GRV-0125's Einstein-Hilbert operator is a member of the spacetime family (exact)
// Status: pass if every gate and control holds, partial if the controls and V2 hold but another gate fails, fail else.
//
// Variants, gating nothing: the slide with c = 2 and the tilt and lapse scales 2 and 1/2 (every count must match);
// the wider tower (M one step, N and K two); the foliation slide (xi_i time dependent, no xi_0); xi_0 with no lapse
// slot.
//
// WHAT IS PUT IN. The tilts are assigned to the shift and L to the lapse by representation (the only assignment),
// with free scales; the action is quadratic, local, cube-symmetric, with at most two time derivatives. L1:
// linearized diffeomorphism invariance read on this mesh, known math.
//
// WHAT CAME OUT (2026-09-27). Partial: V1 and V2 pass, V3 and V4 fail.
//   V1  the |u|^4 weight gives A^T W A = |h|^2 + (tr h)^2 / 2 exactly and equal TT speeds along all three directions;
//       equal inertia gives cross / plus 2.5 (axis), 2.125 (face), 1 (body)
//   V2  of 272 action parameters 22 are invariant; every one gives the tilts no M row and no N block (forced: the
//       static slide's family allows both), the shift couples to the metric at rank 1, and the metric kinetic block is
//       rank 1 and exactly DeWitt |h|^2 - (tr h)^2: the slide forces isotropy on its own, with the indefinite DeWitt
//       sign, and no member with a diagonal (per-class) M has any metric kinetic term, so (a) is outside (b)'s family
//   V3  the cross polarization's kinetic and gradient coefficients have rank 2 over the family: a linearized gauge
//       transformation delta h = D xi + xi D never sees a background light cone, so the kinetic-only and the
//       potential-only members are each invariant and the speed is free. What fixes it: the background's own boost
//       (global Lorentz symmetry at the light's c), or the slide's transport term at the next order in h
//   V4  the lapse L is forced to a pure Lagrange multiplier (no M row, no N block, no mass, no L-L term, one coupling
//       to the metric: the Hamiltonian constraint); the Eg doublet is a gauge singlet and stays free (kinetic rank 1,
//       mass rank 1, 14 derivative forms, 3 curvature couplings). What fixes it: no diffeomorphism reaches it; a rule
//       that gives those registers no kinetic term (Rocek and Williams' reading), or a shift symmetry of their own
//   variants: c 2 with scales 2 and 1/2 gives every count again; the wide tower (38 invariant) keeps V2 and the rank-2
//   speed; the foliation slide leaves the metric kinetic block at rank 3 (Horava's lambda and two cubic anisotropies);
//   xi_0 with no lapse slot kills every metric kinetic term (the lapse is needed)
//
// DETERMINISM: nothing is drawn. Every count is an exact rank.

import {
  actionColumns,
  einsteinHilbertDepthKernel,
  extraVectors,
  plainSpan4,
  sandwichRows,
  signedSpace,
  slideRows,
  spacetimeSlide,
  type ActionSpaces,
  type Slide,
} from '@/code/measure/spacetime-slide'
import {
  classGeometry,
  classSymmetries,
  einsteinHilbertForm,
  extraBasis,
  huskBall,
  invarianceRows,
  operatorSpace,
  PLAIN_SLOTS,
  sandwichedKernel,
  slideGauge,
  type Offset,
} from '@/code/measure/slide-invariant-operators'
import {
  dyadicMod,
  multiplyMod,
  nullSpaceMod,
  primeBelow,
  rankMod,
} from '@/code/algebra/linear/modular-linear'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const PRIMES = [primeBelow(2 ** 25), primeBelow(2 ** 24)]
const GEOMETRY = classGeometry()
const GROUP = classSymmetries(GEOMETRY, false)
const SPAN_T = PLAIN_SLOTS.map((_, s) =>
  GEOMETRY.span.map(row => row[s]!),
)
const EXTRAS = extraBasis(GEOMETRY)
const X = extraVectors(GEOMETRY)
const UNIT12 = Array.from({ length: 12 }, (_, a) =>
  Array.from({ length: 12 }, (__, b) => (a === b ? 1 : 0)),
)
const AUX = [...X.tilts, X.lapse]
// the cross polarization along z (h_xy) on the depths
const CROSS = SPAN_T[3]!
const ORIGIN: Offset[] = [[0, 0, 0]]

const toMod = (
  m: readonly (readonly number[])[],
  p: number,
): number[][] => m.map(row => row.map(x => dyadicMod(x, p)))
const transposed = (m: readonly (readonly number[])[]): number[][] =>
  m.length === 0 ? [] : m[0]!.map((_, j) => m.map(row => row[j]!))
const key3 = (r: readonly number[]): string => `${r[0]},${r[1]},${r[2]}`
const one = (): number => 1
const atOrigin = (r: Offset): boolean =>
  r[0] === 0 && r[1] === 0 && r[2] === 0

type Variant = {
  name: string
  slide: Slide
  ranges: [Offset[], Offset[], Offset[]]
}

const TOWER: [Offset[], Offset[], Offset[]] = [
  ORIGIN,
  huskBall(1),
  huskBall(2),
]
const WIDE: [Offset[], Offset[], Offset[]] = [
  huskBall(1),
  huskBall(2),
  huskBall(2),
]
const LIGHT = { c: 1, shiftScale: 1, lapseScale: 1 }

const VARIANTS: readonly Variant[] = [
  {
    name: 'spacetime (primary)',
    slide: { kind: 'spacetime', ...LIGHT },
    ranges: TOWER,
  },
  {
    name: 'static spatial (E-GRV-0138)',
    slide: { kind: 'static', ...LIGHT },
    ranges: TOWER,
  },
  {
    name: 'spacetime, c 2, scales 2 and 1/2',
    slide: { kind: 'spacetime', c: 2, shiftScale: 2, lapseScale: 0.5 },
    ranges: TOWER,
  },
  {
    name: 'spacetime, wide tower',
    slide: { kind: 'spacetime', ...LIGHT },
    ranges: WIDE,
  },
  {
    name: 'foliation (no xi_0)',
    slide: { kind: 'foliation', ...LIGHT },
    ranges: TOWER,
  },
  {
    name: 'xi_0 with no lapse slot',
    slide: { kind: 'no-lapse', ...LIGHT },
    ranges: TOWER,
  },
]

// the metric blocks (6 x 6 plain) the kinetic block is compared against: DeWitt |h|^2 - (tr h)^2, the |u|^4 weight,
// and equal inertia per class
const dewitt = PLAIN_SLOTS.map((_, s) =>
  PLAIN_SLOTS.map((__, t) =>
    s === t ? (s < 3 ? 0 : 2) : s < 3 && t < 3 ? -1 : 0,
  ),
)
const weightBlock = (w: (a: number) => number): number[][] =>
  PLAIN_SLOTS.map((_, s) =>
    PLAIN_SLOTS.map((__, t) =>
      GEOMETRY.span.reduce(
        (u, row, c) => u + w(c) * row[s]! * row[t]!,
        0,
      ),
    ),
  )
const REGGE = (a: number): number =>
  GEOMETRY.husk[a]!.reduce((t, x) => t + x * x, 0) ** 2
const EQUAL = (): number => 1

type Reads = {
  kinetic: number
  first: number
  potential: number
  firstForcedZero: number
  invariant: number
  metricKinetic: number
  dewittInSpan: boolean
  reggeInSpan: boolean
  equalInSpan: boolean
  diagonalMetricKinetic: number
  tiltKinetic: number
  lapseKinetic: number
  doubletKinetic: number
  tiltFirstOrder: number
  auxFirstOrder: number
  doubletFirstOrder: number
  shiftCoupling: number
  tiltGradient: number
  lapseMass: number
  lapseConstraint: number
  lapseLapse: number
  doubletMass: number
  doubletDerivative: number
  doubletCurvature: number
  extrasDerivative: number
  crossMu: number
  crossPair: number
  crossTied: number
  crossMass: number
  crossFirstOrder: number
  ehInFamily: boolean
  ehOrbitMismatch: number
  ehOutside: number
}

function analyse(v: Variant, p: number): Reads {
  const spaces: ActionSpaces = {
    kinetic: signedSpace(v.ranges[0], GROUP, 1),
    first: signedSpace(v.ranges[1], GROUP, -1),
    potential: signedSpace(v.ranges[2], GROUP, 1),
  }
  const col = actionColumns(spaces)
  const W = col.width
  const rows = toMod(
    slideRows(spaces, spacetimeSlide(GEOMETRY, v.slide), v.slide.kind),
    p,
  )
  const basis = nullSpaceMod(rows, W, p)
  const basisT = transposed(basis)
  const dim = basis.length
  const onFamily = (f: number[][]): number =>
    dim === 0 ? 0 : rankMod(multiplyMod(toMod(f, p), basisT, p), dim, p)
  const M = (
    l: readonly (readonly number[])[],
    r: readonly (readonly number[])[],
    w: (x: Offset) => number,
    per: boolean,
    skip?: (x: Offset) => boolean,
  ): number[][] =>
    sandwichRows(spaces.kinetic, col.kinetic, W, l, r, w, per, skip)
  const N = (
    l: readonly (readonly number[])[],
    r: readonly (readonly number[])[],
    w: (x: Offset) => number,
    per: boolean,
    skip?: (x: Offset) => boolean,
  ): number[][] =>
    sandwichRows(spaces.first, col.first, W, l, r, w, per, skip)
  const K = (
    l: readonly (readonly number[])[],
    r: readonly (readonly number[])[],
    w: (x: Offset) => number,
    per: boolean,
    skip?: (x: Offset) => boolean,
  ): number[][] =>
    sandwichRows(spaces.potential, col.potential, W, l, r, w, per, skip)

  // the metric kinetic block at p^0 (36 rows, s * 6 + t), and whether a target block is in the family's span of it
  const metricBlock = M(SPAN_T, SPAN_T, one, false)
  const blockOnFamily =
    dim === 0 ? [] : multiplyMod(toMod(metricBlock, p), basisT, p)
  const blockRank = dim === 0 ? 0 : rankMod(blockOnFamily, dim, p)

  const inSpan = (target: readonly (readonly number[])[]): boolean => {
    const columns = transposed(blockOnFamily)
    const t = target.flat().map(x => dyadicMod(x, p))

    return rankMod([...columns, t], 36, p) === blockRank
  }

  // the sub-family whose M is diagonal per class (the rule's own per-register inertia), and its metric kinetic rank
  const allM = M(UNIT12, UNIT12, one, true)
  const offDiagonal = allM.filter(
    (_, i) => Math.floor((i % 144) / 12) !== i % 12,
  )

  let diagonalMetricKinetic = 0

  if (dim > 0) {
    const y = nullSpaceMod(
      multiplyMod(toMod(offDiagonal, p), basisT, p),
      dim,
      p,
    )

    if (y.length > 0) {
      const sub = multiplyMod(y, basis, p)

      diagonalMetricKinetic = rankMod(
        multiplyMod(toMod(metricBlock, p), transposed(sub), p),
        sub.length,
        p,
      )
    }
  }

  // the cross polarization along z: kinetic mu, the potential's p_z^2 moment S2 (omega^2 mu = -S2 k^2 / 2), and ties
  const mu = M([CROSS], [CROSS], one, false)[0]!
  const s2 = K([CROSS], [CROSS], r => r[2] * r[2], false)[0]!
  const c2 = v.slide.c * v.slide.c
  const tied = s2.map((x, i) => x + 2 * c2 * mu[i]!)

  // E-GRV-0125's operator as potential-only parameters
  const eh = einsteinHilbertDepthKernel(GEOMETRY, p)
  const index = new Map(
    spaces.potential.offsets.map((r, i) => [key3(r), i]),
  )

  let ehOutside = 0
  let ehOrbitMismatch = 0

  for (const [k, m] of eh) {
    if (!index.has(k) && m.some(row => row.some(x => x !== 0))) {
      ehOutside++
    }
  }

  const theta = new Array<number>(W).fill(0)

  spaces.potential.members.forEach((list, t) => {
    const [a0, b0, r0, sign0] = list[0]!
    const value =
      ((eh.get(key3(spaces.potential.offsets[r0]!))?.[a0]![b0] ?? 0) *
        sign0) %
      p

    for (const [a, b, r, sign] of list) {
      if (
        ((eh.get(key3(spaces.potential.offsets[r]!))?.[a]![b] ?? 0) *
          sign -
          value) %
          p !==
        0
      ) {
        ehOrbitMismatch++
      }
    }

    theta[col.potential + t] = (value + p) % p
  })

  return {
    kinetic: spaces.kinetic.members.length,
    first: spaces.first.members.length,
    potential: spaces.potential.members.length,
    firstForcedZero: spaces.first.forcedZero,
    invariant: dim,
    metricKinetic: blockRank,
    dewittInSpan: inSpan(dewitt),
    reggeInSpan: inSpan(weightBlock(REGGE)),
    equalInSpan: inSpan(weightBlock(EQUAL)),
    diagonalMetricKinetic,
    tiltKinetic: onFamily(M(X.tilts, UNIT12, one, true)),
    lapseKinetic: onFamily(M([X.lapse], UNIT12, one, true)),
    doubletKinetic: onFamily(M(X.doublet, X.doublet, one, true)),
    tiltFirstOrder: onFamily(N(X.tilts, AUX, one, true)),
    auxFirstOrder: onFamily(N(AUX, AUX, one, true)),
    doubletFirstOrder: onFamily(N(X.doublet, X.doublet, one, true)),
    shiftCoupling: onFamily(N(X.tilts, SPAN_T, one, true)),
    tiltGradient: onFamily(K(X.tilts, X.tilts, one, true, atOrigin)),
    lapseMass: onFamily(K([X.lapse], UNIT12, one, false)),
    lapseConstraint: onFamily(K([X.lapse], SPAN_T, one, true)),
    lapseLapse: onFamily(K([X.lapse], [X.lapse], one, true)),
    doubletMass: onFamily(K(X.doublet, X.doublet, one, false)),
    doubletDerivative: onFamily(
      K(X.doublet, X.doublet, one, true, atOrigin),
    ),
    doubletCurvature: onFamily(K(X.doublet, SPAN_T, one, true)),
    extrasDerivative: onFamily(K(EXTRAS, EXTRAS, one, true, atOrigin)),
    crossMu: onFamily([mu]),
    crossPair: onFamily([mu, s2]),
    crossTied: onFamily([tied]),
    crossMass: onFamily(K([CROSS], [CROSS], one, false)),
    crossFirstOrder: onFamily(N([CROSS], [CROSS], r => r[2], false)),
    ehInFamily:
      rankMod(
        multiplyMod(
          rows,
          theta.map(x => [x]),
          p,
        ),
        1,
        p,
      ) === 0,
    ehOrbitMismatch,
    ehOutside,
  }
}

// E-GRV-0138's own route to its static family: the potential-only invariant count and its extras' derivative rank
function reference(p: number): {
  invariant: number
  extrasDerivative: number
  parameters: number
} {
  const space = operatorSpace(huskBall(2), GROUP)
  const rows = toMod(
    invarianceRows(space, slideGauge(GEOMETRY, 'central')),
    p,
  )
  const basis = nullSpaceMod(rows, space.members.length, p)
  const e = toMod(sandwichedKernel(space, EXTRAS, EXTRAS, atOrigin), p)

  return {
    invariant: basis.length,
    extrasDerivative: rankMod(
      multiplyMod(e, transposed(basis), p),
      basis.length,
      p,
    ),
    parameters: space.members.length,
  }
}

// the TT polarizations' omega^2 / k^2 along an integer direction n (a, b integer and orthogonal to n and each other),
// kinetic h . m . h with m a 6 x 6 plain block, potential h . Q(n) . h: returned as [potential, kinetic] pairs (dyadic)
function ttPairs(
  m: readonly (readonly number[])[],
  n: readonly number[],
  a: readonly number[],
  b: readonly number[],
): { plus: [number, number]; cross: [number, number] } {
  const aa = a.reduce((t, x) => t + x * x, 0)
  const bb = b.reduce((t, x) => t + x * x, 0)
  const vec = (h: (i: number, j: number) => number): number[] =>
    PLAIN_SLOTS.map(([i, j]) => h(i, j))
  const plus = vec((i, j) => bb * a[i]! * a[j]! - aa * b[i]! * b[j]!)
  const cross = vec((i, j) => a[i]! * b[j]! + b[i]! * a[j]!)
  const q = einsteinHilbertForm(n)
  const form = (
    f: readonly (readonly number[])[],
    h: readonly number[],
  ): number =>
    f.reduce(
      (t, row, s) =>
        t + h[s]! * row.reduce((u, x, j) => u + x * h[j]!, 0),
      0,
    )

  return {
    plus: [form(q, plus), form(m, plus)],
    cross: [form(q, cross), form(m, cross)],
  }
}

const DIRECTIONS = [
  { name: 'axis', n: [0, 0, 1], a: [1, 0, 0], b: [0, 1, 0] },
  { name: 'face', n: [1, 1, 0], a: [1, -1, 0], b: [0, 0, 1] },
  { name: 'body', n: [1, 1, 1], a: [1, -1, 0], b: [1, 1, -2] },
]

function speeds(m: readonly (readonly number[])[]): {
  equal: boolean
  values: string[]
  ratios: number[]
} {
  const reads = DIRECTIONS.map(d => ({
    d,
    t: ttPairs(m, d.n, d.a, d.b),
    n2: d.n.reduce((s, x) => s + x * x, 0),
  }))

  return {
    equal: reads.every(
      ({ t }) => t.plus[0] * t.cross[1] === t.cross[0] * t.plus[1],
    ),
    values: reads.map(
      ({ d, t, n2 }) =>
        `${d.name} plus ${t.plus[0] / t.plus[1] / n2} cross ${t.cross[0] / t.cross[1] / n2}`,
    ),
    ratios: reads.map(
      ({ t }) => t.cross[0] / t.cross[1] / (t.plus[0] / t.plus[1]),
    ),
  }
}

// the derivation's two checks: the depth flip's parity on the extras, and the 4d span map's rank and left kernel
function derivation(p: number): {
  flipParity: boolean
  span4Rank: number
  span4Left: number
  leftIsDoublet: boolean
  leftInExtras: boolean
} {
  const flip = classSymmetries(GEOMETRY, true).at(-1)!

  const moved = (v: readonly number[]): number[] => {
    const out = new Array<number>(12).fill(0)

    v.forEach((x, a) => (out[flip.classes[a]!] = x))

    return out
  }

  const same = (
    u: readonly number[],
    v: readonly number[],
    s: number,
  ): boolean => u.every((x, a) => x === s * v[a]!)
  const flipParity =
    X.tilts.every(t => same(moved(t), t, -1)) &&
    same(moved(X.lapse), X.lapse, 1) &&
    X.doublet.every(d => same(moved(d), d, 1))
  const s4 = toMod(plainSpan4(GEOMETRY), p)
  const left = nullSpaceMod(transposed(s4), 12, p)
  const axis = GEOMETRY.roots.map(r => (r[3] === 0 ? 0 : 1))
  const diagonal = GEOMETRY.roots.map(r => (r[3] === 0 ? 1 : 0))
  const probes = toMod(
    [axis, diagonal, ...X.tilts, SPAN_T[3]!, SPAN_T[4]!, SPAN_T[5]!],
    p,
  )
  const dot = (u: readonly number[], v: readonly number[]): number =>
    u.reduce((t, x, a) => (t + x * v[a]!) % p, 0)

  return {
    flipParity,
    span4Rank: rankMod(s4, 10, p),
    span4Left: left.length,
    leftIsDoublet: left.every(v => probes.every(q => dot(v, q) === 0)),
    leftInExtras: rankMod([...toMod(EXTRAS, p), ...left], 12, p) === 6,
  }
}

export default experiment({
  id: 'gravity/spacetime-slide-spin-two',
  code: 'E-GRV-0139',
  title:
    "a spacetime slide of the docks makes the depth tilts the shift and forces the DeWitt kinetic term, but leaves the TT speed and the extras' Eg doublet free, partial at L1 (pass on V1 and V2, fail on V3 and V4): with the tilts carrying h_0i and the mismatches' sum h_00 (the only assignment by representation), 22 of 272 cube-symmetric local actions (M on-site, N within one husk step, K within two) are invariant, exact over two primes; every one gives the tilts and the lapse no kinetic or first-order term (the static slide allows both), the lapse no mass and one metric coupling (the Hamiltonian constraint), and the metric a kinetic block that is exactly DeWitt |h|^2 - (tr h)^2, so no per-class inertia survives; the |u|^4 weight gives |h|^2 + (tr h)^2 / 2 and equal TT speeds on axis, face and body diagonal (equal inertia: 2.5, 2.125, 1); but the cross polarization's kinetic and gradient coefficients are independent (rank 2), since a linear gauge slide sees no light cone, and the Eg doublet is a gauge singlet with kinetic rank 1; E-GRV-0125's operator is in the family, the static slide reproduces E-GRV-0138's 83 and 71, c 2 repeats every count, and a slide with no lapse slot kills every kinetic term",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const table = VARIANTS.map(v => ({
      v,
      reads: PRIMES.map(p => analyse(v, p)),
    }))
    const agree = table.every(
      ({ reads }) =>
        JSON.stringify(reads[0]) === JSON.stringify(reads[1]),
    )
    const read = (name: string): Reads =>
      table.find(t => t.v.name.startsWith(name))!.reads[0]!
    const primary = read('spacetime (primary)')
    const still = read('static')
    const scaled = read('spacetime, c 2')
    const wide = read('spacetime, wide')
    const foliation = read('foliation')
    const noLapse = read('xi_0 with no lapse')
    const ref = PRIMES.map(reference)
    const der = PRIMES.map(derivation)
    const regge = speeds(weightBlock(REGGE))
    const equal = speeds(weightBlock(EQUAL))
    const dw = speeds(dewitt)
    const axisEqual = ttPairs(
      weightBlock(EQUAL),
      DIRECTIONS[0]!.n,
      DIRECTIONS[0]!.a,
      DIRECTIONS[0]!.b,
    )
    const reggeBlock = weightBlock(REGGE)
    const reggeClaim = PLAIN_SLOTS.every(([i, j], s) =>
      PLAIN_SLOTS.every(
        (__, t) =>
          reggeBlock[s]![t] ===
          (s === t ? (i === j ? 1.5 : 2) : s < 3 && t < 3 ? 0.5 : 0),
      ),
    )

    const V1 = regge.equal && reggeClaim
    const V2 =
      primary.tiltKinetic === 0 &&
      primary.tiltFirstOrder === 0 &&
      primary.metricKinetic > 0 &&
      primary.shiftCoupling > 0
    const V3 =
      primary.crossMu > 0 &&
      primary.crossPair === 1 &&
      primary.crossTied === 0
    const lapseAuxiliary =
      primary.lapseKinetic === 0 && primary.auxFirstOrder === 0
    const doubletAuxiliary =
      primary.doubletKinetic === 0 && primary.doubletFirstOrder === 0
    const V4 = lapseAuxiliary && doubletAuxiliary
    const C1 =
      axisEqual.plus[0] * axisEqual.cross[1] !==
        axisEqual.cross[0] * axisEqual.plus[1] &&
      2 * axisEqual.cross[0] * axisEqual.plus[1] ===
        5 * axisEqual.plus[0] * axisEqual.cross[1]
    const C2 =
      still.invariant - still.kinetic - still.first ===
        ref[0]!.invariant &&
      still.potential === ref[0]!.parameters &&
      still.extrasDerivative === ref[0]!.extrasDerivative &&
      still.tiltKinetic > 0 &&
      still.equalInSpan &&
      still.reggeInSpan
    const C3 =
      primary.ehInFamily &&
      primary.ehOrbitMismatch === 0 &&
      primary.ehOutside === 0
    const refAgree =
      JSON.stringify(ref[0]) === JSON.stringify(ref[1]) &&
      JSON.stringify(der[0]) === JSON.stringify(der[1])
    const controls = C1 && C2 && C3 && agree && refAgree
    const status =
      V1 && V2 && V3 && V4 && controls
        ? 'pass'
        : V2 && controls
          ? 'partial'
          : 'fail'
    const row = (r: Reads): string =>
      `params M/N/K ${r.kinetic}/${r.first}/${r.potential} (N forced zero ${r.firstForcedZero}), invariant ${r.invariant}; metric kinetic rank ${r.metricKinetic} (DeWitt in span ${r.dewittInSpan}, |u|^4 ${r.reggeInSpan}, equal ${r.equalInSpan}; diagonal-M members' metric kinetic ${r.diagonalMetricKinetic}); tilts: M rows ${r.tiltKinetic}, N (tilt, aux) ${r.tiltFirstOrder}, shift coupling ${r.shiftCoupling}, gradient ${r.tiltGradient}; lapse: M rows ${r.lapseKinetic}, N aux block ${r.auxFirstOrder}, mass ${r.lapseMass}, constraint coupling ${r.lapseConstraint}, lapse-lapse ${r.lapseLapse}; doublet: M ${r.doubletKinetic}, N ${r.doubletFirstOrder}, mass ${r.doubletMass}, derivative ${r.doubletDerivative}, curvature coupling ${r.doubletCurvature}; extras derivative ${r.extrasDerivative}; cross: mu rank ${r.crossMu}, (mu, S2) rank ${r.crossPair}, S2 + 2c^2 mu rank ${r.crossTied}, mass ${r.crossMass}, first order ${r.crossFirstOrder}; EH in family ${r.ehInFamily} (orbit mismatches ${r.ehOrbitMismatch}, outside ${r.ehOutside})`
    const metrics: Record<string, number> = {
      invariant: primary.invariant,
      kineticParameters: primary.kinetic,
      firstParameters: primary.first,
      potentialParameters: primary.potential,
      metricKinetic: primary.metricKinetic,
      dewittInSpan: primary.dewittInSpan ? 1 : 0,
      reggeInSpan: primary.reggeInSpan ? 1 : 0,
      diagonalMetricKinetic: primary.diagonalMetricKinetic,
      tiltKinetic: primary.tiltKinetic,
      tiltFirstOrder: primary.tiltFirstOrder,
      shiftCoupling: primary.shiftCoupling,
      lapseKinetic: primary.lapseKinetic,
      lapseMass: primary.lapseMass,
      lapseConstraint: primary.lapseConstraint,
      doubletKinetic: primary.doubletKinetic,
      doubletMass: primary.doubletMass,
      doubletDerivative: primary.doubletDerivative,
      crossPair: primary.crossPair,
      crossTied: primary.crossTied,
      wideCrossPair: wide.crossPair,
      scaledInvariant: scaled.invariant,
      foliationMetricKinetic: foliation.metricKinetic,
      noLapseMetricKinetic: noLapse.metricKinetic,
      staticInvariant: still.invariant,
      staticExtrasDerivative: still.extrasDerivative,
      staticTiltKinetic: still.tiltKinetic,
      reggeAxisRatio: regge.ratios[0]!,
      equalAxisRatio: equal.ratios[0]!,
      equalFaceRatio: equal.ratios[1]!,
      equalBodyRatio: equal.ratios[2]!,
      span4Rank: der[0]!.span4Rank,
      span4Left: der[0]!.span4Left,
    }

    return verdict({
      status,
      claim: `V1 ${V1}, V2 ${V2}, V3 ${V3}, V4 ${V4} (lapse auxiliary ${lapseAuxiliary}, doublet auxiliary ${doubletAuxiliary}); C1 ${C1}, C2 ${C2}, C3 ${C3}, primes agree ${agree && refAgree}. ${table.map(({ v, reads }) => `${v.name}: ${row(reads[0]!)}`).join(' | ')}`,
      metrics,
      control: {
        equalAxisRatio: equal.ratios[0]!,
        staticTiltKinetic: still.tiltKinetic,
        referenceInvariant: ref[0]!.invariant,
        referenceExtrasDerivative: ref[0]!.extrasDerivative,
      },
      notes: `primes ${PRIMES.join(', ')}. Derivation: depth flip odd on the tilts, even on L and the doublet ${der[0]!.flipParity}; the 4d span map has rank ${der[0]!.span4Rank} with a ${der[0]!.span4Left}-dimensional left kernel free of A1g, T1u and T2g parts ${der[0]!.leftIsDoublet} (inside the 3d extras ${der[0]!.leftInExtras}). E-GRV-0138's route: ${ref[0]!.parameters} parameters, ${ref[0]!.invariant} invariant, extras derivative ${ref[0]!.extrasDerivative}. |u|^4 block is |h|^2 + (tr h)^2 / 2 ${reggeClaim}. omega^2 / k^2 per unit form: |u|^4 ${regge.values.join('; ')}; equal inertia ${equal.values.join('; ')}; DeWitt ${dw.values.join('; ')} (equal ${dw.equal}).`,
    })
  },
})
