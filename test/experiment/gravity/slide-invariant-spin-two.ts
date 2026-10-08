// Section 4 of note/project/vibe/roadmap/research/remaining-pieces.md, the open piece E-GRV-0125 left: its coupling was
// CHOSEN (linearized general relativity) and its 6 extras were held by Rocek and Williams' result, not the model's.
// Can the rule's own bookkeeping symmetry pick the coupling, as Fierz and Pauli's uniqueness does in the continuum?
//
// THE SYMMETRY. The docks are unlabeled: nothing moves, the stream takes values one dock along. So sliding where each
// dock sits by a small xi(x) must leave the physics unchanged, and on the per-class depths that slide is
// delta d_a = (n_a . D)(n_a . xi), a linearized diffeomorphism on the edge lengths (code/measure/slide-invariant-operators).
//
// THE COMPUTATION, exact over GF(p) for two primes (every count must agree between them):
//   1. every local quadratic operator on the 12 depths within range 2 (the offsets two husk steps reach, the range
//      E-GRV-0125 needed), invariant under the husk's 48 point symmetries: one real parameter per orbit of (a, b, r)
//   2. the slide-invariant ones: K G = 0 as a kernel identity, with G the central axis difference E-GRV-0125's
//      depths use (PRIMARY, fixed before computing); the own-link difference, the cube |r_i| <= 2 and the larger group
//      with w -> -w are variants, reported and gating nothing
//   3. the leading order of each invariant operator: the metric block A^T K A of its p^0, p^1, p^2 moments, and the
//      extras' block and the extras-metric block
//
// THE GATES, fixed before computing:
//   U1  the invariant operators' metric block at p^2 spans exactly one dimension (their p^0 and p^1 metric blocks
//       vanish), and E-GRV-0125's linearized Einstein-Hilbert operator lies in that dimension; its full lattice
//       kernel is itself invariant and in the family
//   U2  no invariant operator gives the extras a derivative term of any order (their block is a constant: at most a
//       mass, so they are auxiliary) by invariance and locality alone
//   U3  with the rule's own kinetic form (every class register the same inertia as the scalar depth's, M = I on the
//       12 depths) the two TT polarizations along an axis run at one speed, and the scalar depth's own operator (the
//       husk operator lambda on the uniform mode) is in the same invariant family, so one normalization fixes the TT
//       speed against the scalar depth's c
//   controls
//     C1 dropping invariance leaves many independent metric p^2 forms (the U1 count could have refused)
//     C2 E-GRV-0125's operator is in the invariant family (exact), and its evolution is the Einstein-Hilbert
//        member's Euler-Lagrange form with the DeWitt kinetic metric, up to a multiple of the Hamiltonian constraint
//     C3 the scalar-only field (every class one depth) holds no TT mode
// Status: pass if every gate and control holds, partial if U1 and the controls hold but U2 or U3 fails, fail else.
//
// WHAT IS PUT IN. The symmetry is assumed to be exactly the slide with the central difference; the operator class
// is quadratic, local within range 2, and cube-symmetric. The slide is STATIC (time independent): a slide that
// varies in time needs a shift field to keep any kinetic term, and none is added here. L1: Fierz-Pauli uniqueness
// read on this mesh's classes, known math.
//
// WHAT CAME OUT (2026-09-27). U1 passes, and more strongly than asked: within range 2 the metric block of every
// invariant operator is E-GRV-0125's Einstein-Hilbert lattice operator at ALL orders, not only at p^2. U2 fails for a
// structural reason: the central slide keeps every depth change inside the span map's range, so the extras are
// slide singlets and the symmetry says nothing about them. U3 fails twice: the static slide never touches the kinetic
// form (delta d-dot = 0), and the kinetic form the rule gives (M = I per class) is cubic, not isotropic; the weight
// |u|^4 per class (the register holding the squared-length change u.h.u, Regge's own variable) is the extra condition
// that makes it isotropic, and a boost (a slide mixing time and space at the light's c) the one that would fix the
// speed, since the scalar depth's operator is outside the invariant family.
//
// DETERMINISM: nothing is drawn. Every count is an exact rank.

import {
  centralSymbolKernel,
  chebyshevBall,
  classGeometry,
  classSymmetries,
  einsteinHilbertForm,
  extraBasis,
  huskBall,
  invarianceRows,
  operatorSpace,
  PLAIN_SLOTS,
  sandwichedKernel,
  sandwichedMoment,
  slideGauge,
  type ClassGeometry,
  type GaugeKind,
  type Offset,
} from '@/code/measure/slide-invariant-operators'
import {
  constraintRows,
  ricciEvolution,
} from '@/code/measure/line-class-metric'
import {
  dyadicMod,
  inverseMatrixMod,
  multiplyMod,
  nullSpaceMod,
  primeBelow,
  rankMod,
} from '@/code/algebra/linear/modular-linear'
import { radionWeight } from '@/code/rule/trit-radion'
import { TRIT_HUSK_VECTORS } from '@/code/rule/trit-column'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const PRIMES = [primeBelow(2 ** 25), primeBelow(2 ** 24)]
const GEOMETRY = classGeometry()
// the span map's columns: row s is (A)_{., s}, so a sandwich with it is the metric block A^T C A
const SPAN_T = PLAIN_SLOTS.map((_, s) =>
  GEOMETRY.span.map(row => row[s]!),
)
const EXTRAS = extraBasis(GEOMETRY)

const key3 = (r: readonly number[]): string => `${r[0]},${r[1]},${r[2]}`
const toMod = (
  m: readonly (readonly number[])[],
  p: number,
): number[][] => m.map(row => row.map(x => dyadicMod(x, p)))
const stack = (...blocks: number[][][]): number[][] => blocks.flat()

type Variant = {
  name: string
  offsets: Offset[]
  depthFlip: boolean
  gauge: GaugeKind
}

const VARIANTS: readonly Variant[] = [
  {
    name: 'primary (husk range 2, O_h, central)',
    offsets: huskBall(2),
    depthFlip: false,
    gauge: 'central',
  },
  {
    name: 'own-link slide',
    offsets: huskBall(2),
    depthFlip: false,
    gauge: 'own',
  },
  {
    name: 'cube |r_i| <= 2',
    offsets: chebyshevBall(2),
    depthFlip: false,
    gauge: 'central',
  },
  {
    name: 'O_h x (w -> -w)',
    offsets: huskBall(2),
    depthFlip: true,
    gauge: 'central',
  },
]

type Counts = {
  offsets: number
  parameters: number
  invariant: number
  metricP0: number
  metricP1: number
  metricP2: number
  metricAll: number
  ehLeadingInSpan: boolean
  ehOrbitMismatch: number
  ehOutside: number
  ehResidual: number
  ehInFamily: boolean
  extrasMass: number
  extrasP2: number
  extrasDerivative: number
  crossP0: number
  crossP2: number
  crossAll: number
  extrasOnly: number
  freeMetricP2: number
  freeMetricP2Leading: number
}

// E-GRV-0125's Einstein-Hilbert operator on the 12 depths, K = A^+T Q(sin p) A^+, per offset, mod p
function einsteinHilbertKernel(
  geometry: ClassGeometry,
  p: number,
): Map<string, number[][]> {
  const a = toMod(geometry.span, p)
  const at = a[0]!.map((_, j) => a.map(row => row[j]!))
  const plus = multiplyMod(
    inverseMatrixMod(multiplyMod(at, a, p), p),
    at,
    p,
  )
  const plusT = plus[0]!.map((_, j) => plus.map(row => row[j]!))
  const out = new Map<string, number[][]>()

  for (const [k, { value }] of centralSymbolKernel(q =>
    einsteinHilbertForm(q),
  )) {
    out.set(
      k,
      multiplyMod(multiplyMod(plusT, toMod(value, p), p), plus, p),
    )
  }

  return out
}

function analyse(v: Variant, p: number): Counts {
  const space = operatorSpace(
    v.offsets,
    classSymmetries(GEOMETRY, v.depthFlip),
  )
  const P = space.members.length
  const rows = toMod(
    invarianceRows(space, slideGauge(GEOMETRY, v.gauge)),
    p,
  )
  const basis = nullSpaceMod(rows, P, p)
  const basisT =
    basis.length > 0
      ? basis[0]!.map((_, j) => basis.map(b => b[j]!))
      : []
  const onFamily = (m: number[][]): number =>
    basis.length === 0
      ? 0
      : rankMod(multiplyMod(toMod(m, p), basisT, p), basis.length, p)
  const one = (): number => 1
  const first = [0, 1, 2].map(
    i =>
      (r: Offset): number =>
        r[i]!,
  )
  const second = PLAIN_SLOTS.map(
    ([i, j]) =>
      (r: Offset): number =>
        r[i]! * r[j]!,
  )
  const metric = (w: (r: Offset) => number): number[][] =>
    sandwichedMoment(space, SPAN_T, SPAN_T, w)
  const m0 = metric(one)
  const m1 = stack(...first.map(metric))
  const m2 = stack(...second.map(metric))
  const metricAll = sandwichedKernel(space, SPAN_T, SPAN_T, () => false)
  const e0 = sandwichedMoment(space, EXTRAS, EXTRAS, one)
  const e2 = stack(
    ...second.map(w => sandwichedMoment(space, EXTRAS, EXTRAS, w)),
  )
  const eDerivative = sandwichedKernel(
    space,
    EXTRAS,
    EXTRAS,
    r => r[0] === 0 && r[1] === 0 && r[2] === 0,
  )
  const c0 = sandwichedMoment(space, EXTRAS, SPAN_T, one)
  const c2 = stack(
    ...second.map(w => sandwichedMoment(space, EXTRAS, SPAN_T, w)),
  )
  const cAll = sandwichedKernel(space, EXTRAS, SPAN_T, () => false)

  // E-GRV-0125's operator as orbit parameters
  const eh = einsteinHilbertKernel(GEOMETRY, p)
  const index = new Map(v.offsets.map((r, i) => [key3(r), i]))

  let ehOutside = 0

  for (const [k, m] of eh) {
    if (!index.has(k) && m.some(row => row.some(x => x !== 0))) {
      ehOutside++
    }
  }

  let ehOrbitMismatch = 0

  const theta = space.members.map(list => {
    const [a0, b0, r0] = list[0]!
    const value = eh.get(key3(v.offsets[r0]!))?.[a0]![b0] ?? 0

    for (const [a, b, r] of list) {
      if ((eh.get(key3(v.offsets[r]!))?.[a]![b] ?? 0) !== value) {
        ehOrbitMismatch++
      }
    }

    return value
  })
  const ehResidual = multiplyMod(
    rows,
    theta.map(x => [x]),
    p,
  ).filter(r => r[0] !== 0).length
  const ehInFamily = rankMod([...basis, theta], P, p) === basis.length
  const m2Family =
    basis.length === 0 ? [] : multiplyMod(toMod(m2, p), basisT, p)
  const m2Eh = multiplyMod(
    toMod(m2, p),
    theta.map(x => [x]),
    p,
  ).map(r => r[0]!)
  const leadingRank = onFamily(m2)
  const ehLeadingInSpan =
    rankMod(
      [
        ...(m2Family.length > 0
          ? m2Family[0]!.map((_, j) => m2Family.map(r => r[j]!))
          : []),
        m2Eh,
      ],
      m2.length,
      p,
    ) === leadingRank
  // the free (no slide) family restricted to operators whose metric p^0 and p^1 vanish, so p^2 is their leading order
  const lowOrder = toMod(stack(m0, m1), p)
  const leadingFree = nullSpaceMod(lowOrder, P, p)
  const freeLeading =
    leadingFree.length === 0
      ? 0
      : rankMod(
          multiplyMod(
            toMod(m2, p),
            leadingFree[0]!.map((_, j) => leadingFree.map(b => b[j]!)),
            p,
          ),
          leadingFree.length,
          p,
        )

  return {
    offsets: v.offsets.length,
    parameters: P,
    invariant: basis.length,
    metricP0: onFamily(m0),
    metricP1: onFamily(m1),
    metricP2: leadingRank,
    metricAll: onFamily(metricAll),
    ehLeadingInSpan,
    ehOrbitMismatch,
    ehOutside,
    ehResidual,
    ehInFamily,
    extrasMass: onFamily(e0),
    extrasP2: onFamily(e2),
    extrasDerivative: onFamily(eDerivative),
    crossP0: onFamily(c0),
    crossP2: onFamily(c2),
    crossAll: onFamily(cAll),
    extrasOnly: basis.length - onFamily(stack(metricAll, cAll)),
    freeMetricP2: rankMod(toMod(m2, p), P, p),
    freeMetricP2Leading: freeLeading,
  }
}

// the scalar-only control: every class reads one depth phi, K = k(r) J (J all ones), k cube-symmetric on the offsets
function scalarOnly(p: number): {
  parameters: number
  invariant: number
  uniformTrace: number[]
  ttOverlap: number
} {
  const offsets = huskBall(2)
  const group = classSymmetries(GEOMETRY, false)
  const orbitOf = new Map<string, number>()

  let count = 0

  for (const r of offsets) {
    if (orbitOf.has(key3(r))) {
      continue
    }

    for (const g of group) {
      orbitOf.set(key3(g.offset(r)), count)
    }

    count++
  }

  const gauge = slideGauge(GEOMETRY, 'central')
  const rows = new Map<string, number[]>()

  for (const r of offsets) {
    const t = orbitOf.get(key3(r))!

    for (let a = 0; a < 12; a++) {
      for (const g of gauge) {
        const k = `${a},${g.component},${key3([r[0] + g.offset[0], r[1] + g.offset[1], r[2] + g.offset[2]])}`

        if (!rows.has(k)) {
          rows.set(k, new Array<number>(count).fill(0))
        }

        rows.get(k)![t]! += g.value
      }
    }
  }

  const invariant = nullSpaceMod(
    toMod([...rows.values()], p),
    count,
    p,
  ).length
  // 1^T A: the uniform mode's metric content, and its overlap with the two TT polarizations along z
  const uniformTrace = PLAIN_SLOTS.map((_, s) =>
    GEOMETRY.span.reduce((t, row) => t + row[s]!, 0),
  )
  const plus = [1, -1, 0, 0, 0, 0]
  const cross = [0, 0, 0, 1, 0, 0]
  const ttOverlap = Math.max(
    ...[plus, cross].map(e =>
      Math.abs(
        GEOMETRY.span.reduce(
          (t, row) => t + row.reduce((u, x, s) => u + x * e[s]!, 0),
          0,
        ),
      ),
    ),
  )

  return { parameters: count, invariant, uniformTrace, ttOverlap }
}

// is lambda (the husk operator, radion weights, integer kernel) times I or times J slide-invariant: how many
// invariance rows it leaves nonzero
function huskOperatorResidual(p: number, uniform: boolean): number {
  const gauge = slideGauge(GEOMETRY, 'central')
  const kernel = new Map<string, { r: number[]; w: number }>()

  let centre = 0

  TRIT_HUSK_VECTORS.forEach((u, h) => {
    const g = radionWeight(h)

    centre += 2 * g
    kernel.set(key3(u), { r: [...u], w: -g })
    kernel.set(key3(u.map(x => -x)), { r: u.map(x => -x), w: -g })
  })
  kernel.set('0,0,0', { r: [0, 0, 0], w: centre })

  const residual = new Map<string, number>()

  for (const { r, w } of kernel.values()) {
    for (let a = 0; a < 12; a++) {
      for (let b = 0; b < 12; b++) {
        if (!uniform && a !== b) {
          continue
        }

        for (const g of gauge) {
          if (g.class !== b) {
            continue
          }

          const k = `${a},${g.component},${key3([r[0]! + g.offset[0], r[1]! + g.offset[1], r[2]! + g.offset[2]])}`

          residual.set(k, (residual.get(k) ?? 0) + w * g.value)
        }
      }
    }
  }

  return [...residual.values()].filter(x => dyadicMod(x, p) !== 0)
    .length
}

// the TT kinetic and potential of the two polarizations along z under a per-class inertia weight, exact (dyadic)
function polarizationSpeeds(weight: (a: number) => number): {
  plus: number
  cross: number
} {
  const kinetic = (e: readonly number[]): number =>
    GEOMETRY.span.reduce(
      (t, row, a) =>
        t + weight(a) * row.reduce((u, x, s) => u + x * e[s]!, 0) ** 2,
      0,
    )
  const q = einsteinHilbertForm([0, 0, 1])
  const potential = (e: readonly number[]): number =>
    q.reduce(
      (t, row, s) =>
        t + e[s]! * row.reduce((u, x, j) => u + x * e[j]!, 0),
      0,
    )
  const plus = [1, -1, 0, 0, 0, 0]
  const cross = [0, 0, 0, 1, 0, 0]

  // omega^2 / k^2 per unit normalization of the operator
  return {
    plus: potential(plus) / kinetic(plus),
    cross: potential(cross) / kinetic(cross),
  }
}

// is A^T W A an isotropic form a |h|^2 + b (tr h)^2 in plain coordinates (exact)
function isotropicKinetic(weight: (a: number) => number): {
  isotropic: boolean
  a: number
  b: number
} {
  const m = PLAIN_SLOTS.map((_, s) =>
    PLAIN_SLOTS.map((__, t) =>
      GEOMETRY.span.reduce(
        (u, row, c) => u + weight(c) * row[s]! * row[t]!,
        0,
      ),
    ),
  )
  const a = m[3]![3]! / 2
  const b = m[0]![1]!
  const target = PLAIN_SLOTS.map(([i, j], s) =>
    PLAIN_SLOTS.map((__, t) =>
      s === t ? (i === j ? a + b : 2 * a) : s < 3 && t < 3 ? b : 0,
    ),
  )

  return {
    isotropic: m.every((row, s) =>
      row.every((x, t) => x === target[s]![t]!),
    ),
    a,
    b,
  }
}

// E-GRV-0125's evolution against the Einstein-Hilbert member, in its Frobenius-orthonormal vec coordinates:
// Q's Hessian is 2 G (symmetric), 2 G = 2 R + delta (x) H, and W^-1 2 G = 2 R + delta (x) H / 2 with W the DeWitt
// metric I - delta delta^T; the largest deviation over a few wavevectors (floating point)
function evolutionTie(): {
  symmetric: number
  einstein: number
  dewitt: number
} {
  const r2 = Math.SQRT2
  // plain = T vec
  const T = PLAIN_SLOTS.map((_, s) =>
    PLAIN_SLOTS.map((__, t) => (s === t ? (s < 3 ? 1 : 1 / r2) : 0)),
  )
  const points = [
    [0.3, 0.1, -0.2],
    [0.05, 0.05, 0.05],
    [1.1, -0.7, 0.4],
  ]

  let symmetric = 0
  let einstein = 0
  let dewitt = 0

  for (const p of points) {
    const q = p.map(Math.sin)
    const m = einsteinHilbertForm(q)
    const g = T.map((_, s) =>
      T.map((__, t) =>
        T.reduce(
          (u, row, i) =>
            u +
            row[s]! *
              T.reduce((w, col, j) => w + m[i]![j]! * col[t]!, 0),
          0,
        ),
      ),
    )
    const ricci = ricciEvolution(q)
    const h = constraintRows(q)[0]!
    const delta = [1, 1, 1, 0, 0, 0]

    for (let s = 0; s < 6; s++) {
      for (let t = 0; t < 6; t++) {
        symmetric = Math.max(symmetric, Math.abs(g[s]![t]! - g[t]![s]!))
        einstein = Math.max(
          einstein,
          Math.abs(g[s]![t]! - ricci[s]![t]! - delta[s]! * h[t]!),
        )

        const trace = g[0]![t]! + g[1]![t]! + g[2]![t]!

        dewitt = Math.max(
          dewitt,
          Math.abs(
            g[s]![t]! -
              (delta[s]! * trace) / 2 -
              ricci[s]![t]! -
              (delta[s]! * h[t]!) / 2,
          ),
        )
      }
    }
  }

  return { symmetric, einstein, dewitt }
}

export default experiment({
  id: 'gravity/slide-invariant-spin-two',
  code: 'E-GRV-0138',
  title:
    "the dock slide picks E-GRV-0125's coupling but not its extras or its speed, partial at L1 (pass on U1, fail on U2 and U3): of the 231 cube-symmetric range-2 quadratic operators on the 12 class depths, 83 are invariant under the static slide delta d_a = (n_a . D)(n_a . xi) (central difference, exact ranks over two primes), and every one of them has a metric block that is a multiple of E-GRV-0125's linearized Einstein-Hilbert operator, at p^2 and to all orders in range 2 (rank 1 of 9 without the slide); but the central slide never moves the 6 extras, so 71 invariant dimensions give them derivative terms (3 masses, 7 p^2 forms, 2 couplings to curvature), and a static slide leaves the kinetic form free: with the rule's equal inertia per class the two TT polarizations along an axis run at omega^2 ratio 2.5, a register holding delta(l^2) (weight |u|^4) makes it isotropic exactly, and the scalar depth's operator is not slide-invariant (624 and 1008 rows off) with a uniform-mode stiffness of -8 k^2, so nothing ties the TT speed to c; the own-link slide, the cube |r_i| <= 2 and O_h x (w -> -w) give the same metric rank 1 and the same free extras; E-GRV-0125's evolution is this member with the DeWitt kinetic metric up to the Hamiltonian constraint (3.6e-16)",
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
    const primary = table[0]!.reads[0]!
    const scalar = PRIMES.map(scalarOnly)
    const huskI = PRIMES.map(p => huskOperatorResidual(p, false))
    const huskJ = PRIMES.map(p => huskOperatorResidual(p, true))
    const unit = polarizationSpeeds(() => 1)
    const regge = polarizationSpeeds(
      a => GEOMETRY.husk[a]!.reduce((t, x) => t + x * x, 0) ** 2,
    )
    const isoUnit = isotropicKinetic(() => 1)
    const isoRegge = isotropicKinetic(
      a => GEOMETRY.husk[a]!.reduce((t, x) => t + x * x, 0) ** 2,
    )
    const tie = evolutionTie()
    const qz = einsteinHilbertForm([0, 0, 1])
    // the uniform mode d = 1 is h = 2 delta: its Einstein-Hilbert stiffness per k^2
    const twoDelta = [2, 2, 2, 0, 0, 0]
    const uniformStiffness = qz.reduce(
      (t, row, s) =>
        t +
        twoDelta[s]! * row.reduce((u, x, j) => u + x * twoDelta[j]!, 0),
      0,
    )

    const U1 =
      primary.metricP0 === 0 &&
      primary.metricP1 === 0 &&
      primary.metricP2 === 1 &&
      primary.ehLeadingInSpan &&
      primary.ehInFamily
    const U2 = primary.extrasDerivative === 0
    const U3 = unit.plus === unit.cross && huskJ[0] === 0
    const C1 = primary.freeMetricP2Leading > 1
    const C2 =
      primary.ehInFamily &&
      primary.ehResidual === 0 &&
      primary.ehOrbitMismatch === 0 &&
      primary.ehOutside === 0 &&
      tie.einstein < 1e-12 &&
      tie.dewitt < 1e-12
    const C3 = scalar[0]!.ttOverlap === 0
    const controls = C1 && C2 && C3 && agree
    const status =
      U1 && U2 && U3 && controls
        ? 'pass'
        : U1 && controls
          ? 'partial'
          : 'fail'
    const row = (c: Counts): string =>
      `offsets ${c.offsets}, parameters ${c.parameters}, invariant ${c.invariant}; metric p^0/p^1/p^2 ranks ${c.metricP0}/${c.metricP1}/${c.metricP2} (all orders ${c.metricAll}), EH leading in span ${c.ehLeadingInSpan}, EH in family ${c.ehInFamily} (residual rows ${c.ehResidual}, orbit mismatches ${c.ehOrbitMismatch}, outside ${c.ehOutside}); extras mass ${c.extrasMass}, extras p^2 ${c.extrasP2}, extras any derivative ${c.extrasDerivative}; cross p^0/p^2/all ${c.crossP0}/${c.crossP2}/${c.crossAll}; extras-only members ${c.extrasOnly}; no slide: metric p^2 rank ${c.freeMetricP2}, ${c.freeMetricP2Leading} with p^2 leading`
    const metrics: Record<string, number> = {
      parameters: primary.parameters,
      invariant: primary.invariant,
      metricP0: primary.metricP0,
      metricP1: primary.metricP1,
      metricP2: primary.metricP2,
      metricAllOrders: primary.metricAll,
      extrasMass: primary.extrasMass,
      extrasP2: primary.extrasP2,
      extrasDerivative: primary.extrasDerivative,
      crossP2: primary.crossP2,
      crossAll: primary.crossAll,
      extrasOnly: primary.extrasOnly,
      freeMetricP2Leading: primary.freeMetricP2Leading,
      ownInvariant: table[1]!.reads[0]!.invariant,
      ownMetricP2: table[1]!.reads[0]!.metricP2,
      ownExtrasDerivative: table[1]!.reads[0]!.extrasDerivative,
      ownEhInFamily: table[1]!.reads[0]!.ehInFamily ? 1 : 0,
      cubeMetricP2: table[2]!.reads[0]!.metricP2,
      flipMetricP2: table[3]!.reads[0]!.metricP2,
      speedRatioSquaredUnit: unit.cross / unit.plus,
      speedRatioSquaredRegge: regge.cross / regge.plus,
      uniformStiffness,
      huskIResidual: huskI[0]!,
      huskJResidual: huskJ[0]!,
      scalarInvariant: scalar[0]!.invariant,
      tieEinstein: tie.einstein,
      tieDewitt: tie.dewitt,
    }

    return verdict({
      status,
      claim: `U1 ${U1}, U2 ${U2}, U3 ${U3}; C1 ${C1}, C2 ${C2}, C3 ${C3}, primes agree ${agree}. ${table.map(({ v, reads }) => `${v.name}: ${row(reads[0]!)}`).join(' | ')}`,
      metrics,
      control: {
        freeMetricP2Leading: primary.freeMetricP2Leading,
        ehInFamily: primary.ehInFamily ? 1 : 0,
        scalarTT: scalar[0]!.ttOverlap,
      },
      notes: `primes ${PRIMES.join(', ')}. Scalar-only: ${scalar[0]!.parameters} cube-symmetric kernels, ${scalar[0]!.invariant} slide-invariant, 1^T A = [${scalar[0]!.uniformTrace.join(', ')}], TT overlap ${scalar[0]!.ttOverlap}. Husk operator lambda I leaves ${huskI[0]} invariance rows nonzero, lambda J ${huskJ[0]}. Kinetic M = I: omega^2 / k^2 plus ${unit.plus}, cross ${unit.cross} (ratio ${unit.cross / unit.plus}), isotropic ${isoUnit.isotropic}; weight |u|^4 (the register holding delta(l^2)): plus ${regge.plus}, cross ${regge.cross}, isotropic ${isoRegge.isotropic} (a ${isoRegge.a}, b ${isoRegge.b}). Uniform mode Einstein-Hilbert stiffness ${uniformStiffness} k^2. E-GRV-0125 tie: Hessian symmetric to ${tie.symmetric.toExponential(1)}, 2G - 2R - delta H ${tie.einstein.toExponential(1)}, W^-1 2G - 2R - delta H / 2 ${tie.dewitt.toExponential(1)}.`,
    })
  },
})
