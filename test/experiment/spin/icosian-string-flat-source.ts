// DOES THE 2I GAUGE STRING BIND A LIGHT MEMBER THAT MOVES? (E-SPN-0161). E-SPN-0153 found a window before 2I freezes on
// the husk and E-SPN-0154 kept its ordered vacuum prethermally at a small beat angle, and left open whether its string
// binds a light member. Every binding tried on the swap-coin rule leaks through the 22 flat bands of each member (the
// phase string E-SPN-0146, the Coulomb law E-SPN-0155 for light members, every covariant schedule E-SPN-0159). A
// confining string is not a static potential, so it might escape: its flux tube costs energy linear in separation. This
// file derives what any gauge string does to the flat channel, and checks the three facts the derivation rests on.
//
// DERIVED BEFORE THE RUN (machinery: code/measure/flat-source on the side-L husk quotient box, code/measure/husk-meson;
// a member holds dock x, slot d and a color in the fundamental of a finite subgroup of SU(2), c = 2 components; its hop
// along root d multiplies the color by the link value g(x, d), and a link read from its other end holds the inverse,
// g(x + r_d, -d) = g(x, d)^-1; the one-vibe matrix is A = c X (I + beta J), E-SPN-0146's shape, at the light point
// u = ringUnit(-1, 4), mixer angle theta 2.761341, bare mass m0 = pi/2 - theta/2 = 0.190126).
// 1. THE INVOLUTION (L1). The beat is U = c U0 (I + (u - 1) P_Z), U0 = S_g X, P_Z the uniform projector of each dock
//    and color, u = 1 + 24 beta = e^(-i theta). Slot d leaves along r_d, is swapped to -d, and returns along -r_d
//    meeting g^-1, so U0^2 = I in EVERY static field of EVERY group. P+- = (I +- U0) / 2 are exact projectors of rank
//    12 c N (N docks).
// 2. THE FLAT COUNT (L1). On E+- n ker P_Z the beat is +-c: a flat state. dim(E+- n ker P_Z) = 12 c N - rank(P+- Z),
//    and Z^dag P+- Z = (I +- T) / 2 with T = Z^dag U0 Z the averaged hop (T[x, y] = (1/24) sum of the link values from
//    y to x; Hermitian by the reverse rule, |T| <= 1). So
//        flat(+-) = 11 c N + dim ker(I -+ T)     exactly, for any group and any static field.
//    T has the eigenvalue +1 only if every hop carries one color vector parallel (a flat connection) and -1 only for a
//    flat connection times the central -1. So in every field that is not flat the count is EXACTLY 11 per color per
//    dock at each sign: THE FLAT BANDS SURVIVE EVERY GAUGE FIELD. A member in them is a color charge that bounces on its
//    links and never leaves them: a STATIC SOURCE.
// 3. THE MOVING PAIR (L1). For T y = lambda y, a = P+ Z y and b = P- Z y span an invariant plane (P_Z a = p Z y, P_Z b
//    = q Z y, p, q = (1 +- lambda) / 2), where U = c [[1 + (u - 1) p, (u - 1) q], [-(u - 1) p, -1 - (u - 1) q]]. With
//    U = c sqrt(u) nu: nu^2 + 2 i sin(theta/2) lambda nu - 1 = 0, nu = e^(-i w), so
//        sin w = sin(theta/2) lambda,          the pair w and pi - w,
//    E-SPN-0143's law with g(K) replaced by lambda. The member's lightest level is m(lambda_top) = pi/2 - arcsin(sin(theta
//    /2) lambda_top): m0 only where T's top reaches 1, an ordered field.
// 4. HEAVY WHERE THE FIELD IS DISORDERED (L2, Theorem B with numbers). A field with no correlation between links makes
//    T the averaged hop of a 24-regular graph whose short loops carry unrelated holonomies: locally the 24-regular tree,
//    whose normalized adjacency has spectral radius 2 sqrt 23 / 24 = 0.39965 (Kesten). PREDICTED on the box: lambda_top in
//    [0.30, 0.42] for 2I, 2T and Q8 Weyl fields, so m >= pi/2 - arcsin(0.98198 x 0.42) = 1.14 against m0 = 0.190: the
//    Kesten floor E-SPN-0150 measured on the tree, now read off the rule in a field. A member is light only over a region
//    where the links are ordered, below the length at which the string is tense; E-SPN-0151's Theorem B (an exactly
//    light member means zero tension) is the limit of this.
// 5. THE STRING IS BAND-BLIND (L1). The gauge register's energy is an electric class function of each link's flux and
//    a magnetic class function of each plaquette's holonomy (Theorem A: the magnetic piece commutes with the hop). It
//    reads the members only through Gauss's law at each dock, whose source is the member's color. The color is a tensor
//    factor, the same for a member in S as in F, so a string's energy for (S at x, F at y) equals its energy for (S at
//    x, S at y), configuration for configuration: NO GAUGE STRING, of any group at any coupling, tells the flipped
//    channel from the composite. (E-SPN-0147's mass string could, because it reads the separation into the mixer angle,
//    which the band feels; it is nonlocal and no gauge field is.)
// 6. THE CHANNEL UNDER CONFINEMENT (L1 given 2 and 5). With one member flat (2, a static source) and the string blind
//    to it (5), the (S, F-) sector at every total momentum is the S member bound to a static charge, shifted by the flat
//    phase: K-independent (the source cannot move). Under an area law the static potential grows as sigma r, so the S
//    member's levels near the source reach every energy above their floor (the band plus sigma r for every r), a ladder
//    whose spacing falls as sigma shrinks and which wraps the whole quasi-energy circle. The composite (both members in
//    S) at E_c meets it at the separation V* = (E_c - floor) / sigma for EVERY member mass and every sigma > 0. At
//    E-SPN-0146's point (m = pi/6, sigma 0.093556, E_c near 2 m) V* = 2 m / sigma = 11.19, where 0146's tail flattened
//    (V = 11, recorded). So confinement does not close the flat channel: it turns E-SPN-0155's continuum into a dense
//    ladder, and the composite's hold is set by its own weight at V* alone, 0146's regime: long-lived when V* is many
//    widths out, never exact. Confinement even removes the heavy members' exact binding the non-confining Coulomb law
//    allowed (0155's (pi + E_b) / 4 < m).
// 7. THE ANSWER PREDICTED: NO. The 2I string binds no light member exactly (6, for any flat band anywhere on the circle,
//    E-SPN-0160's 176 at eps pi included), and over the lengths where it is tense its members are heavy (4). What closes
//    the channel is a string that reads the band (nonlocal) or removing the flats (E-SPN-0160's Clifford register); what a
//    string can add is metastability, set by the weight at V*.
//
// PREDICTED: F1, F2, F3 hold; F4 fails (derived: it needs F1 to fail); the instrument and every control hold. Verdict
// fail: the 2I string does not bind a light member.
//
// GATES, fixed before the gate run.
//  F1 THE FLATS SURVIVE (2): on sides L = 4, 6, 8, for 2I, 2T and Q8 Weyl fields: exactly 11 c N flat at +c and at -c
//     (flat(+-) from T's spectrum, eigenvalues within 1e-9 of +-1), and T at least 1e-6 from +-1; the trivial field and
//     a 2I pure gauge 11 c N + 2 at +c and 11 c N at -c; the central -1 field 11 c N at +c and 11 c N + 2 at -c. REALIZED:
//     at L = 4 in each Weyl field, three flat vectors per sign built from Weyl starts have uniform part <= 1e-13 and
//     |U w -+ c w| <= 1e-13.
//  F2 THE MOVING PAIR (3): at L = 4 in the trivial and the 2I Weyl field, five eigenvectors of T each (indices 0, 31,
//     63, 95, 127): the plane closes under the explicit beat to 1e-12 and its phases obey the law to 1e-12.
//  F3 HEAVY IN A DISORDERED FIELD (4): every Weyl field at L = 4, 6, 8 has lambda_top in [0.30, 0.42] and m >= 1.14.
//  F4 THE CHANNEL CLOSES FOR A STRING-BOUND LIGHT PAIR (6): holds only if some field removes the flats; so F4 = not F1.
// INSTRUMENT (a failure makes the verdict partial): the husk steps equal the rule's roots; the reverse rule exact
//  (<= 1e-15) and T Hermitian (<= 1e-15) in every field; U0^2 = I on a Weyl vector to 1e-13 in every field.
// CONTROLS (a failure makes the verdict partial). C1 E-SPN-0143 REPRODUCED: in the trivial field T's spectrum is
//  g(q) = (1/24) sum cos(q . rho_d) over the box momenta q = 2 pi n / L, each twice, to 1e-12 (L = 4, 6), so the moving
//  pair is 0143's sin w = sin(theta/2) g. C2 E-SPN-0154 REPRODUCED: 2I's exact character algebra (integral, class
//  constant, completeness, idempotents) and the husk tetrahedron's register: 1,728,000 gauge-fixed values, 29,288 Gauss
//  states, 1,589 symmetric. C3 E-SPN-0150 REPRODUCED: the Kesten floor pi/2 - arcsin(rho cos m0), rho = 2 sqrt 23 / 24,
//  within 2e-3 of 0150's measured 1.2170, 1.1688, 1.1636, 1.1604 at m0 0.524, 0.190, 0.143, 0.047 (0150 read the floor on
//  finite words, so small differences either way). C4 GAUGE COVARIANCE: the 2I pure gauge's T spectrum equals the
//  trivial field's to 1e-12 (L = 4, 6).
// READ, gating nothing: R1 the member's mass in a dilute 2I field (a share p of links on 2I's 12 elements nearest the
//  identity, Weyl placed, the rest the identity) at L = 6 for p = 0, 0.01, 0.03, 0.1, 0.3, 1: how fast the ordered
//  member turns heavy as the field disorders. R2 V* = 2 m / sigma at E-SPN-0146's point against its recorded 11.
// Verdict: partial if the instrument or a control fails, or if F4 holds (a field without flats would need a binding
// run); fail otherwise (the answer to the question is no, by 6).
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them). tmp/fsrc-probe1.log: the count on L = 4, 6 in six
//  fields (Weyl 2I, 2T, Q8: exactly 22 N at each sign, T's top 0.368 to 0.395; trivial and pure gauge 22 N + 2 at +;
//  -1 field 22 N + 2 at -) and flat vectors at L = 4 (uniform 1e-16, residual 2.4e-16), which confirmed 2 and suggested
//  4's Kesten reading before 4 was written as a gate. tmp/fsrc-probe2.log: the pair law on L = 4 (closure 1.4e-14, law
//  1.5e-15; the lambda = 1 plane of the trivial field degenerates to a line, P- Z y = 0, a reading defect fixed in
//  pairChecks before this header), L = 8's 2I top 0.387 (27 s), and C2's counts and algebra (0.5 s).
//  tmp/fsrc-smoke.log: every code path on a small plan (L = 4, 5 s; checks the code, gates nothing).
//
// FIRST RUN (tmp/fsrc-exp-run1.log, 163 s): FAIL, as predicted (F1, F2, F3 hold; F4 fails). The instrument and all four
//  controls hold. No gate moved and none was rerun.
//  - F1: 9 Weyl fields (2I, 2T, Q8 at L = 4, 6, 8) exactly 11 c N flat at each sign (1,408, 4,752, 11,264), T at least
//    0.594 from +-1; trivial and 2I pure gauge 11 c N + 2 at +c, the -1 field 11 c N + 2 at -c, at every side. Flat
//    vectors: uniform part at most 9.6e-17, beat residual at most 2.4e-16.
//  - F2: the pair plane closes to 2.1e-14 and obeys sin w = sin(theta/2) lambda to 3.1e-14 (ten eigenvectors).
//  - F3: lambda_top 0.368 to 0.406 in the Weyl fields (Kesten 0.39965), member mass 1.160 to 1.200 against m0 0.190126.
//  - F4 fails: no field removes a flat band.
//  - C1: the trivial field is E-SPN-0143's g(q) to 1.2e-14. C2: E-SPN-0154's algebra and 1,728,000 / 29,288 / 1,589.
//    C3: the Kesten floor 1.2175, 1.1675, 1.1641, 1.1601 against E-SPN-0150's 1.217, 1.1688, 1.1636, 1.1604. C4: pure
//    gauge equals trivial to 3.3e-15.
//  - R1 (L = 6, 2I dilute): the member's mass is 0.190, 0.199, 0.216, 0.267, 0.378, 0.633 at link share 0, 0.01, 0.03,
//    0.1, 0.3, 1 on the elements nearest the identity: even a field one step from the identity on every link triples it.
//    The flat count stays 11 c N at each sign once any link is off the identity. R2: V* = 11.19 against 0146's 11.
// NEXT. The flats are a property of the swap coin in any gauge field, so no gauge string reaches them; a string that
//  reads the band is nonlocal. What removes them is on the member itself: E-SPN-0160's Clifford register (176 flat at
//  eps pi, which point 6 says a confining string still meets at V* = (pi - E_c + floor) / sigma, so its hold needs the
//  same weight reading), or a coin that is not an involution (U0^2 = I is what makes 11 c N exact).
//
// Depth L1 (the involution, the count, the pair law, band-blindness and the ladder are mathematics) and L2 (the Kesten
// floor in a field is measured). DETERMINISM: no random numbers; every field is a golden-ratio Weyl stream. NOTHING
// MOVES: the coin and the mixer hand a value to another slot of one dock, the stream takes each slot's value one dock
// along, its color turned by the link.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { averagedHop, boxSize, flatCount, flatVector, hermitianGap, involutionGap, linkField, mixerTheta, pairChecks, pairMass, reverseGap, stepsAgree, weylVector, type FieldKind, type GroupName, type LinkField } from '@/code/measure/flat-source'
import { gOf } from '@/code/measure/husk-meson'
import { overEmpty, ringUnit, unitAngle, vibeDockExact, vibeShape } from '@/code/measure/swap-string'
import { binaryIcosahedral, conjugacyClasses } from '@/code/measure/hurwitz-gauge'
import { icosianCharacters } from '@/code/measure/gauge-window'
import { exactCharacterAlgebra, huskTetrahedron, registerOf, sectorsOf } from '@/code/measure/prethermal-patch'

const LIGHT: readonly [number, number] = [-1, 4]
const COUNT_TOLERANCE = 1e-9
const APART = 1e-6
const VECTOR_TOLERANCE = 1e-13
const PAIR_TOLERANCE = 1e-12
const TOP_RANGE: readonly [number, number] = [0.3, 0.42]
const HEAVY_FLOOR = 1.14
const EXACT = 1e-15
const INVOLUTION = 1e-13
const SPECTRUM = 1e-12
const KESTEN = (2 * Math.sqrt(23)) / 24
const TREE_RECORD: readonly [number, number][] = [
  [0.524, 1.217],
  [0.19, 1.1688],
  [0.143, 1.1636],
  [0.047, 1.1604],
]
const TREE_TOLERANCE = 2e-3
const TETRAHEDRON = { size: 1728000, orbits: 29288, symmetric: 1589 }
const PHASE_STRING = { m: Math.PI / 6, sigma: 0.093556, recorded: 11 }

export type FlatSourcePlan = { sides: readonly number[]; groups: readonly GroupName[]; starts: readonly number[]; pairIndices: readonly number[]; densities: readonly number[]; diluteSide: number }

export const GATE_PLAN: FlatSourcePlan = { sides: [4, 6, 8], groups: ['2I', '2T', 'Q8'], starts: [0.11, 0.37, 0.71], pairIndices: [0, 31, 63, 95, 127], densities: [0, 0.01, 0.03, 0.1, 0.3, 1], diluteSide: 6 }

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'spin/icosian-string-flat-source',
  code: 'E-SPN-0161',
  title:
    'no gauge string binds a light member of the swap-coin rule, fail as derived (F4): the free coin beat U0 = S_g X is an involution in every static field of every group, so exactly 11 flat states per color per dock survive at each sign, 11 c N + dim ker(I -+ T) with T the averaged hop (9 Weyl fields of 2I, 2T, Q8 on the husk box, sides 4, 6, 8: 11 c N exactly, flat vectors to 2.4e-16), and a flat member is a static color source; any gauge string reads the members only through Gauss, blind to the band, so the (S, F) channel is the S member held to a static source, which an area law turns into a dense ladder the composite meets at V* = 2m/sigma (11.19 at E-SPN-0146, where its tail flattened); the moving pair obeys sin w = sin(theta/2) lambda (to 3.1e-14), so a disordered field makes the member heavy, lambda_top 0.368 to 0.406 (the Kesten floor 0.39965) and mass 1.16 to 1.20 against 0.190, and a dilute 2I field on the nearest elements triples it at share 1; E-SPN-0143, 0150 and 0154 reproduced; next: remove the flats on the member (a Clifford register, or a coin that is not an involution)',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return flatSourceRun(GATE_PLAN)
  },
})

const sortedSpectrum = (f: LinkField): number[] => {
  const T = averagedHop(f)

  return [...complexEigenvalues({ re: T.re, im: T.im, n: T.n }).re].sort((a, b) => a - b)
}

const spectrumGap = (a: readonly number[], b: readonly number[]): number => Math.max(...a.map((x, i) => Math.abs(x - (b[i] as number))))

export function flatSourceRun(plan: FlatSourcePlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const u = ringUnit(LIGHT[0], LIGHT[1])
  const shape = vibeShape(overEmpty(vibeDockExact(1, 0, u), u))
  const theta = mixerTheta(shape)
  const m0 = pairMass(theta, 1)

  // ---------------- the fields ----------------
  type Row = { L: number; group: GroupName; kind: FieldKind; plus: number; minus: number; base: number; top: number; gapPlus: number; gapMinus: number; reverse: number; herm: number; involution: number; mass: number }
  const rows: Row[] = []
  const kinds: [GroupName, FieldKind][] = [...plan.groups.map((g): [GroupName, FieldKind] => [g, 'weyl']), ['trivial', 'trivial'], ['2I', 'pure-gauge'], ['trivial', 'minus']]

  for (const L of plan.sides) {
    for (const [group, kind] of kinds) {
      const f = linkField(L, group, kind)
      const c = flatCount(f, COUNT_TOLERANCE)
      const row: Row = { L, group, kind, plus: c.plus, minus: c.minus, base: 22 * c.cells, top: c.top, gapPlus: c.gapPlus, gapMinus: c.gapMinus, reverse: reverseGap(f), herm: hermitianGap(averagedHop(f)), involution: involutionGap(f, weylVector(boxSize(f), 0.3)), mass: pairMass(theta, Math.max(c.top, -c.bottom)) }

      rows.push(row)
      log(`L ${L} ${group} ${kind}: flats + ${row.plus} - ${row.minus} (11 c N ${row.base}), top ${row.top.toFixed(9)}, gaps ${row.gapPlus.toExponential(3)} ${row.gapMinus.toExponential(3)}, mass ${row.mass.toFixed(6)}`)
    }
  }

  const weylRows = rows.filter(r => r.kind === 'weyl')
  const countsExact =
    weylRows.every(r => r.plus === r.base && r.minus === r.base && r.gapPlus >= APART && r.gapMinus >= APART) &&
    rows.filter(r => r.kind === 'trivial' || r.kind === 'pure-gauge').every(r => r.plus === r.base + 2 && r.minus === r.base) &&
    rows.filter(r => r.kind === 'minus').every(r => r.plus === r.base && r.minus === r.base + 2)

  // realized: flat vectors at L = 4 in each Weyl field
  const vectors = plan.groups.flatMap(group => {
    const f = linkField(4, group, 'weyl')

    return ([1, -1] as const).flatMap(sign => plan.starts.map(o => ({ group, sign, ...flatVector(f, shape, sign, weylVector(boxSize(f), o)) })))
  })
  const vectorsHold = vectors.every(v => v.uniform <= VECTOR_TOLERANCE && v.residual <= VECTOR_TOLERANCE)
  const F1 = countsExact && vectorsHold

  log(`F1 ${F1}: counts ${countsExact}, vectors ${vectorsHold} (worst uniform ${Math.max(...vectors.map(v => v.uniform)).toExponential(2)}, residual ${Math.max(...vectors.map(v => v.residual)).toExponential(2)})`)

  // ---------------- the moving pair ----------------
  const pairFields: [GroupName, FieldKind][] = [
    ['trivial', 'trivial'],
    ['2I', 'weyl'],
  ]
  const pairs = pairFields.map(([group, kind]) => ({ group, kind, checks: pairChecks(linkField(4, group, kind), shape, plan.pairIndices) }))
  const F2 = pairs.every(p => p.checks.every(c => c.closure <= PAIR_TOLERANCE && c.lawGap <= PAIR_TOLERANCE))

  log(`F2 ${F2}: ${pairs.map(p => `${p.group}: ${p.checks.map(c => `lambda ${c.lambda.toFixed(6)} closure ${c.closure.toExponential(1)} law ${c.lawGap.toExponential(1)}`).join(', ')}`).join('; ')}`)

  // ---------------- heavy in a disordered field ----------------
  const F3 = weylRows.every(r => r.top >= (TOP_RANGE[0] as number) && r.top <= (TOP_RANGE[1] as number) && r.mass >= HEAVY_FLOOR)
  const F4 = !F1

  // ---------------- the instrument ----------------
  const steps = stepsAgree()
  const instrument = steps && rows.every(r => r.reverse <= EXACT && r.herm <= EXACT && r.involution <= INVOLUTION)

  // ---------------- controls ----------------
  // C1 the trivial field's T spectrum is g over the box momenta, twice
  const c1 = [4, 6].map(L => {
    const predicted: number[] = []

    for (let a = 0; a < L; a++) for (let b = 0; b < L; b++) for (let c = 0; c < L; c++) for (let k = 0; k < 2; k++) predicted.push(gOf([(2 * Math.PI * a) / L, (2 * Math.PI * b) / L, (2 * Math.PI * c) / L]))

    return spectrumGap(sortedSpectrum(linkField(L, 'trivial', 'trivial')), predicted.sort((x, y) => x - y))
  })
  const C1 = c1.every(g => g <= SPECTRUM)

  // C2 E-SPN-0154's exact algebra and tetrahedron counts
  const g = binaryIcosahedral()
  const reg = registerOf(g, huskTetrahedron(), conjugacyClasses(g))
  const sec = sectorsOf(reg)
  const algebra = exactCharacterAlgebra(g, icosianCharacters(g), reg.classOf)
  const C2 = algebra.integral && algebra.classConstant && algebra.completeness && algebra.idempotents && reg.size === TETRAHEDRON.size && sec.orbits === TETRAHEDRON.orbits && sec.n === TETRAHEDRON.symmetric

  // C3 E-SPN-0150's Kesten floor
  const c3 = TREE_RECORD.map(([m, measured]) => ({ m, measured, floor: Math.PI / 2 - Math.asin(KESTEN * Math.cos(m)) }))
  const C3 = c3.every(x => Math.abs(x.floor - x.measured) <= TREE_TOLERANCE)

  // C4 pure gauge equals trivial
  const c4 = [4, 6].map(L => spectrumGap(sortedSpectrum(linkField(L, '2I', 'pure-gauge')), sortedSpectrum(linkField(L, 'trivial', 'trivial'))))
  const C4 = c4.every(x => x <= SPECTRUM)
  const controls = C1 && C2 && C3 && C4

  log(`instrument ${instrument}; C1 ${C1} (${c1.map(x => x.toExponential(1)).join(' ')}), C2 ${C2}, C3 ${C3}, C4 ${C4} (${c4.map(x => x.toExponential(1)).join(' ')})`)

  // ---------------- reads ----------------
  const dilute = plan.densities.map(p => {
    const c = flatCount(linkField(plan.diluteSide, '2I', 'dilute', 0.5, p), COUNT_TOLERANCE)

    return { p, top: c.top, mass: pairMass(theta, c.top), plus: c.plus, minus: c.minus, base: 22 * c.cells }
  })
  const vStar = (2 * PHASE_STRING.m) / PHASE_STRING.sigma

  log(`R1 ${dilute.map(d => `p ${d.p}: top ${d.top.toFixed(6)} m ${d.mass.toFixed(6)} flats ${d.plus} ${d.minus}`).join('; ')}; R2 V* ${vStar.toFixed(3)}`)

  const status = !instrument || !controls || F4 ? 'partial' : 'fail'
  const weylTops = weylRows.map(r => `${r.group} L ${r.L} ${r.top.toFixed(4)}`).join(', ')

  return verdict({
    status,
    claim: `F1 ${F1} (${weylRows.length} Weyl fields exactly 11 c N flat at each sign, T at least ${Math.min(...weylRows.map(r => Math.min(r.gapPlus, r.gapMinus))).toFixed(4)} from +-1; trivial and pure gauge 11 c N + 2 at +c, the -1 field 11 c N + 2 at -c; flat vectors uniform <= ${Math.max(...vectors.map(v => v.uniform)).toExponential(1)}, residual <= ${Math.max(...vectors.map(v => v.residual)).toExponential(1)}); F2 ${F2} (closure <= ${Math.max(...pairs.flatMap(p => p.checks.map(c => c.closure))).toExponential(1)}, law <= ${Math.max(...pairs.flatMap(p => p.checks.map(c => c.lawGap))).toExponential(1)}); F3 ${F3} (lambda_top ${weylTops}; member mass ${Math.min(...weylRows.map(r => r.mass)).toFixed(4)} to ${Math.max(...weylRows.map(r => r.mass)).toFixed(4)} against m0 ${m0.toFixed(6)}); F4 ${F4}; instrument ${instrument}; controls C1 ${C1} C2 ${C2} C3 ${C3} C4 ${C4}`,
    metrics: {
      F1: flag(F1),
      F2: flag(F2),
      F3: flag(F3),
      F4: flag(F4),
      instrument: flag(instrument),
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      C4: flag(C4),
      m0,
      theta,
      topMin: Math.min(...weylRows.map(r => r.top)),
      topMax: Math.max(...weylRows.map(r => r.top)),
      massMin: Math.min(...weylRows.map(r => r.mass)),
      vectorResidual: Math.max(...vectors.map(v => v.residual)),
      pairLaw: Math.max(...pairs.flatMap(p => p.checks.map(c => c.lawGap))),
      vStar,
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: flag(C1), C2: flag(C2), C3: flag(C3), C4: flag(C4), instrument: flag(instrument) },
    notes: `Light point u = ringUnit(${LIGHT.join(', ')}), angle ${unitAngle(u).toFixed(6)}, theta ${theta.toFixed(6)}, m0 ${m0.toFixed(6)}; Kesten ${KESTEN.toFixed(6)}. Fields: ${rows.map(r => `L ${r.L} ${r.group} ${r.kind} + ${r.plus} - ${r.minus} of ${r.base}, top ${r.top.toFixed(6)}, mass ${r.mass.toFixed(4)}, reverse ${r.reverse.toExponential(0)}, herm ${r.herm.toExponential(0)}, U0^2 ${r.involution.toExponential(1)}`).join('; ')}. F2: ${pairs.map(p => `${p.group}: ${p.checks.map(c => `lambda ${c.lambda.toFixed(6)} phases ${c.phases.map(x => x.toFixed(6)).join('/')} closure ${c.closure.toExponential(1)} law ${c.lawGap.toExponential(1)}`).join(', ')}`).join('; ')}. C1: ${c1.map(x => x.toExponential(1)).join(' ')}. C2: ${JSON.stringify(algebra)}, register ${reg.size}, orbits ${sec.orbits}, symmetric ${sec.n}. C3: ${c3.map(x => `m0 ${x.m} floor ${x.floor.toFixed(4)} measured ${x.measured}`).join(', ')}. C4: ${c4.map(x => x.toExponential(1)).join(' ')}. R1 (L ${plan.diluteSide}): ${dilute.map(d => `p ${d.p} top ${d.top.toFixed(6)} m ${d.mass.toFixed(4)} flats ${d.plus - d.base}/${d.minus - d.base} over 11 c N`).join('; ')}. R2: V* = 2 m / sigma ${vStar.toFixed(3)} against E-SPN-0146's recorded ${PHASE_STRING.recorded}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
