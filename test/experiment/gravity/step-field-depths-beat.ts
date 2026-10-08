// The two pieces E-GRV-0139 left free (note/project/vibe/roadmap/research/remaining-pieces.md, "The spacetime slide"): V3, the
// TT wave speed (a linear gauge slide never sees a light cone, so the kinetic and potential parts are each invariant),
// and V4, the Eg doublet of 2 non-metric registers, which no diffeomorphism reaches. The idea, fixed before computing:
//   (a) THE UNIVERSAL BEAT. The rule advances every field once a beat on one stream, and the scalar step field's speed
//       c comes from that (E-GRV-0090, 0104). Every per-class depth is the SAME register kind: a rate with the step
//       field's inertia 1 / kappa per dock, updated by the same leapfrog, a step field ALONG ITS OWN LINE CLASS (its
//       steps live on the links of its own class u_a, with that link's stiffness g). The TT speed then follows.
//   (b) THE Eg DOUBLET in that form: does it get a kinetic term, and is it forced non-propagating (a Lagrange
//       multiplier, a constraint, or massive at the dock scale)?
//
// THE DERIVATION of the step field's speed (code/measure/step-field-depths): one beat is v += kappa (rho - div F),
// F += g (v_tail - v_head), so the found depth obeys x(t+1) - 2 x(t) + x(t-1) = -kappa A x with per-dock inertia
// 1 / kappa and per-link stiffness g; c^2 = kappa S(n) / |n|^2 with S(n) = (1/2) sum_r (-A_r)(r . n)^2 = 6 |n|^2, which
// with kappa = 2 / (9 (2D + 1)) is the light's c(D)^2 = 4 / (3 (2D + 1)). The kernel A is READ from one beat of
// code/rule/step-depth, not typed in.
//
// THE READINGS. Primary, the words of (a): LINE, class a's steps on its own links only, a 1d wave along u_a. Variant,
// gating nothing: FULL, every class a whole scalar step field on all 18 links; there the TT speed is c by construction
// (kinetic and potential carry the same class weights, so the metric inherits the scalar's omega(k) whole), so a pass
// of W1 there is circular and is labeled so. The 1 / kappa scale drops out of every ratio and every invariance row.
//
// THE GATES, fixed before computing:
//   W1  with (a), both TT polarizations have omega^2 = c^2 k^2 at long waves along the axis, the face diagonal and the
//       body diagonal, exactly (integer cross-multiplication), no free parameter. The TT speed is read on the metric:
//       the forms restricted to d = A h (E-GRV-0139's reading)
//   W2  with (a), the operator is in E-GRV-0139's invariant family: every row of S(omega) G(omega) = 0 of the spacetime
//       slide vanishes (exact, two primes). If not, the failing rows are reported by power of omega and by whether they
//       come from the spatial slide xi_i or the time slide xi_0
//   W3  the Eg doublet is non-propagating: its block of K at k = 0 is nonsingular with omega^2 at least a dock-scale
//       gap (>= c^2, one dock per beat squared), or it has no kinetic term. Its dispersion is reported
//   controls
//     C1  E-GRV-0139's family with free M reproduces V3's freedom: the cross polarization's (mu, S2) have rank 2
//     C2  the scalar step field read from the rule reproduces its c: c^2 = 6 kappa along axis, face and body, equal to
//         code/measure/trit-hop-light's light c(D)^2 exactly at D = 1 and 2, the read kernel integral, the beat
//         reversed bit for bit
//     C3  dropping the slide loses W2's discrimination: E-GRV-0125's Einstein-Hilbert potential leaves every row at 0
//         (the rows admit a known member), and with no slide there is no row for the step form to fail
// Status: pass if W1, W2, W3 and the controls hold; partial if the controls and one or two gates hold; fail else.
//
// Variants, gating nothing: the FULL reading (W1 circular there); the |u|^4 register weight (Regge's u.h.u) in both
// forms; the static slide alone; within E-GRV-0139's family, the members with the step field's own symmetry (no
// register reads an absolute depth: K(p = 0) = 0 on every block), and what the doublet can do there.
//
// WHAT IS PUT IN. The class step fields' form (inertia, leapfrog, link stiffness) is the hypothesis under test; the
// scalar's kernel is read from the rule. L1: kernel arithmetic plus one beat of the rule.
//
// WHAT CAME OUT (2026-09-27). Fail: W1, W2 and W3 fail, every control holds, the two primes agree.
//   C2  one beat of the step rule reads A: 24 on-site, -2 on the 6 axis links, -1 on the 12 diagonals (exact, reversed
//       bit for bit); S(n) = 6 |n|^2 on axis, face and body, so c^2 = 6 kappa = 4/9 at D 1 and 4/15 at D 2, the light's
//   W1  LINE: TT omega^2 / (c^2 k^2) = 1/30 plus, 0 cross on the axis; 0.0441 and 1/12 on the face; 0.0617 on the body
//       (|u|^4 weight: 1/12 and 0, 1/32 and 1/12, 1/27). The zero is structural: the cross polarization along z lives
//       only on the (1, +-1, 0) classes, whose own links are perpendicular to z, so no normalization of the inertia
//       rescues it, and the face's two polarizations differ, so no rescaling puts the six readings at one speed. The 12
//       decoupled class branches run at 0 to 1/3 of c^2
//   W2  LINE breaks 288 rows: omega^3 6 + 12 (the tilts and lapse get inertia), omega^2 60 + 12 (a per-register
//       inertia is not DeWitt), omega^1 18 + 36, omega^0 120 + 24 (the static slide alone breaks the same 120: a
//       per-class line energy is not Einstein-Hilbert), counts as (from xi_i) + (from xi_0)
//   W3  a step field reads only differences, so the doublet's k = 0 block is 0 while its inertia is not (det 18.75):
//       omega(0) = 0, long-wave omega^2 / (c^2 k^2) 0.089 to 0.133 (the doublet is not an invariant subspace of the
//       line form): a massless propagating pair, not a multiplier, a constraint or a dock-scale mass
//   FULL (circular): TT exactly c on every direction and weight, the doublet exactly c too, 1,224 broken rows
//   family: 22 invariant, cross (mu, S2) rank 2 (V3 reproduced); the 21 members with K(0) = 0 on every block keep a
//   metric kinetic term (rank 1) and the free speed (rank 2), force the doublet's mass to 0, and leave its kinetic
//   term at rank 1, 14 derivative forms and 3 curvature couplings: the step field's own symmetry makes the doublet
//   massless or kinetic-free, never gapped
//   What it says: "every depth is a step field" contradicts the slide at every power of omega, so the beat's c cannot
//   reach the metric through the registers' own form. The speed still needs the background's boost or the cubic
//   order (E-GRV-0139's V3), and the doublet needs a rule that gives it no inertia.
//
// DETERMINISM: nothing is drawn. Every count is an exact rank or an exact integer comparison.

import {
  actionColumns,
  einsteinHilbertDepthKernel,
  extraVectors,
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
  huskBall,
  PLAIN_SLOTS,
  type Offset,
} from '@/code/measure/slide-invariant-operators'
import {
  classMoments,
  classStepInertia,
  classStepPotential,
  quadratic,
  readStepKernel,
  slideResidual,
  stepKineticBlock,
  stepPotentialBlock,
  stepStiffness,
  ttPolarizations,
  type KernelEntry,
  type StepKernel,
  type StepReading,
} from '@/code/measure/step-field-depths'
import { lightSpeedOf } from '@/code/measure/trit-hop-light'
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
const X = extraVectors(GEOMETRY)
const UNIT12 = Array.from({ length: 12 }, (_, a) =>
  Array.from({ length: 12 }, (__, b) => (a === b ? 1 : 0)),
)
const CROSS = SPAN_T[3]!
const ORIGIN: Offset[] = [[0, 0, 0]]
const TOWER: [Offset[], Offset[], Offset[]] = [
  ORIGIN,
  huskBall(1),
  huskBall(2),
]
const LIGHT: Slide = {
  kind: 'spacetime',
  c: 1,
  shiftScale: 1,
  lapseScale: 1,
}
const STATIC: Slide = {
  kind: 'static',
  c: 1,
  shiftScale: 1,
  lapseScale: 1,
}

const DIRECTIONS = [
  { name: 'axis', n: [0, 0, 1], a: [1, 0, 0], b: [0, 1, 0] },
  { name: 'face', n: [1, 1, 0], a: [1, -1, 0], b: [0, 0, 1] },
  { name: 'body', n: [1, 1, 1], a: [1, -1, 0], b: [1, 1, -2] },
]

const EQUAL = (): number => 1
const REGGE = (a: number): number =>
  GEOMETRY.husk[a]!.reduce((t, x) => t + x * x, 0) ** 2
const toMod = (
  m: readonly (readonly number[])[],
  p: number,
): number[][] => m.map(row => row.map(x => dyadicMod(x, p)))
const transposed = (m: readonly (readonly number[])[]): number[][] =>
  m.length === 0 ? [] : m[0]!.map((_, j) => m.map(row => row[j]!))
const one = (): number => 1
const atOrigin = (r: Offset): boolean =>
  r[0] === 0 && r[1] === 0 && r[2] === 0
const n2 = (n: readonly number[]): number =>
  n.reduce((t, x) => t + x * x, 0)

// ---------------------------------------------------------------------------------------------------------
// W1: the TT speed on the metric, as omega^2 / (c^2 k^2) = h P(n) h / (S(n) h T h), cross-multiplied exact

type Speed = {
  direction: string
  plus: [number, number]
  cross: [number, number]
}

function ttSpeeds(
  scalar: StepKernel,
  potential: readonly KernelEntry[],
  weight: (a: number) => number,
): Speed[] {
  const t = stepKineticBlock(GEOMETRY, weight)

  return DIRECTIONS.map(d => {
    const p = stepPotentialBlock(GEOMETRY, potential, d.n, weight)
    const s = stepStiffness(scalar, d.n)
    const { plus, cross } = ttPolarizations(d.a, d.b)

    return {
      direction: d.name,
      plus: [quadratic(p, plus), s * quadratic(t, plus)],
      cross: [quadratic(p, cross), s * quadratic(t, cross)],
    }
  })
}

const atC = (speeds: readonly Speed[]): boolean =>
  speeds.every(
    s => s.plus[0] === s.plus[1] && s.cross[0] === s.cross[1],
  )
const ratioText = (speeds: readonly Speed[]): string =>
  speeds
    .map(
      s =>
        `${s.direction} plus ${s.plus[0] / s.plus[1]} cross ${s.cross[0] / s.cross[1]}`,
    )
    .join('; ')

// ---------------------------------------------------------------------------------------------------------
// W3: the doublet's dispersion in the step form (omega^2 / (c^2 k^2) of the 2 x 2 projected problem, and its mass)

// the doublet's k = 0 block (the mass, per unit kappa: omega^2(0) = kappa lambda), its inertia's determinant, the
// least omega^2(0) / c^2, and omega^2 / (c^2 k^2) at long waves; a dock-scale gap is omega^2(0) >= c^2
type Doublet = {
  mass: number[][]
  inertia: number
  gapOverC2: number
  invariant: boolean
  ratios: string[]
  least: number
}

// generalized eigenvalues of the 2 x 2 pair (p, g): det(p - lambda g) = 0
function pairEigen(
  p: readonly (readonly number[])[],
  g: readonly (readonly number[])[],
): [number, number] {
  const A = g[0]![0]! * g[1]![1]! - g[0]![1]! * g[1]![0]!
  const B = -(
    p[0]![0]! * g[1]![1]! +
    p[1]![1]! * g[0]![0]! -
    p[0]![1]! * g[1]![0]! -
    p[1]![0]! * g[0]![1]!
  )
  const C = p[0]![0]! * p[1]![1]! - p[0]![1]! * p[1]![0]!
  const root = Math.sqrt(Math.max(0, B * B - 4 * A * C))

  return [(-B - root) / (2 * A), (-B + root) / (2 * A)]
}

function doubletDispersion(
  scalar: StepKernel,
  potential: readonly KernelEntry[],
): Doublet {
  const d = X.doublet
  const gram = d.map(u =>
    d.map(v => u.reduce((t, x, a) => t + x * v[a]!, 0)),
  )
  // the k = 0 block: sum_r K_aa(r) on the doublet
  const zero = new Array<number>(12).fill(0)

  for (const k of potential) {
    zero[k.a]! += k.value
  }

  const mass = d.map(u =>
    d.map(v => u.reduce((t, x, a) => t + x * zero[a]! * v[a]!, 0)),
  )
  const inertia =
    gram[0]![0]! * gram[1]![1]! - gram[0]![1]! * gram[1]![0]!
  // omega^2(0) / c^2 = kappa lambda / (6 kappa) with c^2 = kappa S(axis) = 6 kappa
  const gapOverC2 =
    pairEigen(mass, gram)[0] / stepStiffness(scalar, [0, 0, 1])

  let invariant = true
  let least = Infinity

  const ratios = DIRECTIONS.map(dir => {
    const m = classMoments(potential, dir.n)
    const s = stepStiffness(scalar, dir.n)
    const p = d.map(u =>
      d.map(v => u.reduce((t, x, a) => t + x * m[a]! * v[a]!, 0) / s),
    )
    const [lo, hi] = pairEigen(p, gram)
    // is span(doublet) invariant under the class moments: m d_i in span(d)?
    const md = d.map(u => u.map((x, a) => x * m[a]!))
    const spanRank = rankMod(
      [...toMod(d, PRIMES[0]!), ...toMod(md, PRIMES[0]!)],
      12,
      PRIMES[0]!,
    )

    if (spanRank !== 2) {
      invariant = false
    }

    least = Math.min(least, lo)

    return `${dir.name} ${lo} and ${hi}`
  })

  return { mass, inertia, gapOverC2, invariant, ratios, least }
}

// ---------------------------------------------------------------------------------------------------------
// C1 and the shift-symmetric members of E-GRV-0139's family

type Family = {
  invariant: number
  crossMu: number
  crossPair: number
  shiftSymmetric: number
  symMetricKinetic: number
  symCrossPair: number
  symDoubletKinetic: number
  symDoubletMass: number
  symDoubletDerivative: number
  symDoubletCurvature: number
}

function family(p: number): Family {
  const spaces: ActionSpaces = {
    kinetic: signedSpace(TOWER[0], GROUP, 1),
    first: signedSpace(TOWER[1], GROUP, -1),
    potential: signedSpace(TOWER[2], GROUP, 1),
  }
  const col = actionColumns(spaces)
  const W = col.width
  const rows = toMod(
    slideRows(spaces, spacetimeSlide(GEOMETRY, LIGHT), 'spacetime'),
    p,
  )
  const M = (
    l: readonly (readonly number[])[],
    r: readonly (readonly number[])[],
    per: boolean,
    skip?: (x: Offset) => boolean,
  ): number[][] =>
    sandwichRows(spaces.kinetic, col.kinetic, W, l, r, one, per, skip)
  const K = (
    l: readonly (readonly number[])[],
    r: readonly (readonly number[])[],
    w: (x: Offset) => number,
    per: boolean,
    skip?: (x: Offset) => boolean,
  ): number[][] =>
    sandwichRows(spaces.potential, col.potential, W, l, r, w, per, skip)

  const on = (basis: number[][]) => {
    const bt = transposed(basis)

    return (f: number[][]): number =>
      basis.length === 0
        ? 0
        : rankMod(multiplyMod(toMod(f, p), bt, p), basis.length, p)
  }

  const mu = M([CROSS], [CROSS], false)[0]!
  const s2 = K([CROSS], [CROSS], r => r[2] * r[2], false)[0]!
  const all = nullSpaceMod(rows, W, p)
  // the step field's own symmetry: no register reads an absolute depth, sum_r K_ab(r) = 0 on every block
  const shift = toMod(K(UNIT12, UNIT12, one, false), p)
  const sym = nullSpaceMod([...rows, ...shift], W, p)
  const onAll = on(all)
  const onSym = on(sym)

  return {
    invariant: all.length,
    crossMu: onAll([mu]),
    crossPair: onAll([mu, s2]),
    shiftSymmetric: sym.length,
    symMetricKinetic: onSym(M(SPAN_T, SPAN_T, false)),
    symCrossPair: onSym([mu, s2]),
    symDoubletKinetic: onSym(M(X.doublet, X.doublet, true)),
    symDoubletMass: onSym(K(X.doublet, X.doublet, one, false)),
    symDoubletDerivative: onSym(
      K(X.doublet, X.doublet, one, true, atOrigin),
    ),
    symDoubletCurvature: onSym(K(X.doublet, SPAN_T, one, true)),
  }
}

// E-GRV-0125's operator as kernel entries on the 12 depths, mod p (a potential-only member, C3)
function einsteinHilbertEntries(p: number): KernelEntry[] {
  const out: KernelEntry[] = []

  for (const [k, m] of einsteinHilbertDepthKernel(GEOMETRY, p)) {
    const offset = k.split(',').map(Number) as unknown as Offset

    m.forEach((row, a) =>
      row.forEach(
        (value, b) => value !== 0 && out.push({ a, b, offset, value }),
      ),
    )
  }

  return out
}

const total = (r: ReturnType<typeof slideResidual>): number =>
  Object.values(r).reduce((t, x) => t + x.spatial + x.time, 0)
const residualText = (r: ReturnType<typeof slideResidual>): string =>
  (['3', '2', '1', '0'] as const)
    .map(
      t =>
        `omega^${t} ${r[t].spatial} from xi_i, ${r[t].time} from xi_0`,
    )
    .join('; ')

export default experiment({
  id: 'gravity/step-field-depths-beat',
  code: 'E-GRV-0140',
  title:
    "making every per-class depth a step field along its own line class, with the scalar step field's inertia and link stiffness, does not fix the TT speed at c, fail at L1 (W1, W2, W3 all fail; controls hold): the scalar's kernel read from one beat of the step rule gives c^2 = 6 kappa = 4/9 at D 1 and 4/15 at D 2 on axis, face and body, the light's c(D)^2 exactly; but with each class's steps on its own links the metric's TT omega^2 / c^2 k^2 is 1/30 (plus) and 0 (cross) on the axis (the cross polarization along z lives only on the (1, +-1, 0) classes, whose links are perpendicular to z), 0.044 and 1/12 on the face diagonal, 0.062 on the body, anisotropic whatever the inertia's normalization; the form breaks 288 of the spacetime slide's rows (every power of omega, 120 of them the static slide's) where E-GRV-0125's potential breaks 0; a step field is shift symmetric, so the Eg doublet keeps the register's inertia and no mass (omega(0) = 0, omega^2 / c^2 k^2 0.089 to 0.133): massless and propagating, not a multiplier, constraint or dock-scale mass. Making each class a whole scalar step field gives c exactly on every mode, but only by construction, and breaks 1,224 rows; E-GRV-0139's family keeps the speed free (rank 2), and its 21 shift-symmetric members force the doublet's mass to 0 with kinetic rank 1",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    // C2: the scalar step field, read from the rule
    const scalars = [1, 2].map(readStepKernel)
    const scalar = scalars[0]!
    const cSquared = scalars.map(k =>
      DIRECTIONS.map(d => {
        const s = stepStiffness(k, d.n)
        const light = lightSpeedOf(k.depth) ** 2

        // c^2 = (a / q) s / |n|^2 against the light's 4 / (3 (2D + 1)), cross-multiplied in integers
        return {
          direction: d.name,
          s,
          six: s === 6 * n2(d.n),
          light: k.a * s * 3 * (2 * k.depth + 1) === 4 * k.q * n2(d.n),
          value: (k.a * s) / (k.q * n2(d.n)),
          lightValue: light,
        }
      }),
    )
    const C2 =
      scalars.every(
        k => k.exact && k.reversed && k.kernel.size === 19,
      ) && cSquared.every(rows => rows.every(r => r.six && r.light))

    const potentials: Record<StepReading, KernelEntry[]> = {
      line: classStepPotential(GEOMETRY, scalar, 'line'),
      full: classStepPotential(GEOMETRY, scalar, 'full'),
    }
    const inertia = classStepInertia()

    // W1
    const lineSpeeds = ttSpeeds(scalar, potentials.line, EQUAL)
    const fullSpeeds = ttSpeeds(scalar, potentials.full, EQUAL)
    const lineRegge = ttSpeeds(scalar, potentials.line, REGGE)
    const fullRegge = ttSpeeds(scalar, potentials.full, REGGE)
    const W1 = atC(lineSpeeds)
    const branches = DIRECTIONS.map(d => {
      const m = classMoments(potentials.line, d.n)
      const s = stepStiffness(scalar, d.n)

      return `${d.name} ${[...new Set(m.map(x => x / s))].sort((u, v) => u - v).join(', ')}`
    })

    // W2 and C3
    const slide = spacetimeSlide(GEOMETRY, LIGHT)
    const stat = spacetimeSlide(GEOMETRY, STATIC)
    const residuals = PRIMES.map(p => ({
      line: slideResidual(inertia, potentials.line, slide, true, p),
      full: slideResidual(inertia, potentials.full, slide, true, p),
      lineStatic: slideResidual(
        inertia,
        potentials.line,
        stat,
        false,
        p,
      ),
      eh: slideResidual(
        [],
        einsteinHilbertEntries(p),
        slide,
        true,
        p,
        true,
      ),
      ehStatic: slideResidual(
        [],
        einsteinHilbertEntries(p),
        stat,
        false,
        p,
        true,
      ),
    }))
    const res = residuals[0]!
    const W2 = total(res.line) === 0
    const noSlideRows = 0
    const C3 =
      total(res.eh) === 0 &&
      total(res.ehStatic) === 0 &&
      noSlideRows === 0

    // W3
    const lineDoublet = doubletDispersion(scalar, potentials.line)
    const fullDoublet = doubletDispersion(scalar, potentials.full)
    const W3 = lineDoublet.inertia === 0 || lineDoublet.gapOverC2 >= 1

    // C1 and the family's shift-symmetric members
    const fams = PRIMES.map(family)
    const fam = fams[0]!
    const C1 = fam.crossMu > 0 && fam.crossPair === 2

    const agree =
      JSON.stringify(fams[0]) === JSON.stringify(fams[1]) &&
      JSON.stringify(residuals[0]) === JSON.stringify(residuals[1])
    const controls = C1 && C2 && C3 && agree
    const gates = [W1, W2, W3].filter(Boolean).length
    const status =
      gates === 3 && controls
        ? 'pass'
        : gates > 0 && controls
          ? 'partial'
          : 'fail'

    const metrics: Record<string, number> = {
      w1: W1 ? 1 : 0,
      w2: W2 ? 1 : 0,
      w3: W3 ? 1 : 0,
      lineAxisPlus: lineSpeeds[0]!.plus[0] / lineSpeeds[0]!.plus[1],
      lineAxisCross: lineSpeeds[0]!.cross[0] / lineSpeeds[0]!.cross[1],
      lineFacePlus: lineSpeeds[1]!.plus[0] / lineSpeeds[1]!.plus[1],
      lineFaceCross: lineSpeeds[1]!.cross[0] / lineSpeeds[1]!.cross[1],
      lineBodyPlus: lineSpeeds[2]!.plus[0] / lineSpeeds[2]!.plus[1],
      lineBodyCross: lineSpeeds[2]!.cross[0] / lineSpeeds[2]!.cross[1],
      fullAtC: atC(fullSpeeds) ? 1 : 0,
      lineResidualRows: total(res.line),
      fullResidualRows: total(res.full),
      ehResidualRows: total(res.eh),
      lineStaticResidualRows: total(res.lineStatic),
      doubletGapOverC2: lineDoublet.gapOverC2,
      doubletLeastRatio: lineDoublet.least,
      fullDoubletLeastRatio: fullDoublet.least,
      familyInvariant: fam.invariant,
      familyCrossPair: fam.crossPair,
      shiftSymmetricMembers: fam.shiftSymmetric,
      shiftSymmetricMetricKinetic: fam.symMetricKinetic,
      shiftSymmetricCrossPair: fam.symCrossPair,
      shiftSymmetricDoubletKinetic: fam.symDoubletKinetic,
      shiftSymmetricDoubletMass: fam.symDoubletMass,
      stepCSquaredD1: cSquared[0]![0]!.value,
    }

    return verdict({
      status,
      claim: `W1 ${W1}, W2 ${W2}, W3 ${W3}; C1 ${C1}, C2 ${C2}, C3 ${C3}, primes agree ${agree}. LINE reading: TT omega^2 / (c^2 k^2) ${ratioText(lineSpeeds)} (|u|^4 weight: ${ratioText(lineRegge)}); the 12 decoupled class branches ${branches.join(' | ')}; slide residual rows ${residualText(res.line)}; static slide ${residualText(res.lineStatic)}; doublet mass block ${JSON.stringify(lineDoublet.mass)} (omega^2(0) / c^2 ${lineDoublet.gapOverC2}), inertia det ${lineDoublet.inertia}, invariant subspace ${lineDoublet.invariant}, omega^2 / (c^2 k^2) ${lineDoublet.ratios.join('; ')}. FULL reading (W1 circular): TT ${ratioText(fullSpeeds)} (|u|^4: ${ratioText(fullRegge)}); residual rows ${residualText(res.full)}; doublet ${fullDoublet.ratios.join('; ')} mass ${JSON.stringify(fullDoublet.mass)}. EH potential residual ${residualText(res.eh)}. Family: ${fam.invariant} invariant, cross (mu, S2) rank ${fam.crossPair}; with K(0) = 0 on every block ${fam.shiftSymmetric} members, metric kinetic rank ${fam.symMetricKinetic}, cross (mu, S2) rank ${fam.symCrossPair}, doublet kinetic ${fam.symDoubletKinetic}, mass ${fam.symDoubletMass}, derivative ${fam.symDoubletDerivative}, curvature coupling ${fam.symDoubletCurvature}`,
      metrics,
      control: {
        familyCrossPair: fam.crossPair,
        stepCSquaredD1: cSquared[0]![0]!.value,
        stepCSquaredD2: cSquared[1]![0]!.value,
        ehResidualRows: total(res.eh),
      },
      notes: `primes ${PRIMES.join(', ')}. Step kernel read from one beat (D = 1): ${[...scalar.kernel.values()].map(e => `${e.offset.join(',')}:${e.value}`).join(' ')}; exact ${scalar.exact}, reversed ${scalar.reversed}. c^2 per direction: ${cSquared.map((rows, i) => `D ${i + 1}: ${rows.map(r => `${r.direction} S ${r.s} c^2 ${r.value} light ${r.lightValue}`).join(', ')}`).join(' | ')}.`,
    })
  },
})
