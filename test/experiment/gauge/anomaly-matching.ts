// 'T HOOFT ANOMALY MATCHING FOR A LIGHT THREE-MEMBER ELECTRON (E-FRC-0289, note/project/vibe/roadmap/moving-matter item
// 0018, idea/keys.md Key 3). RULE: the register rule R*, with the spinor lift L(s) as the member's rotation (decision
// 0006).
//
// If members are confined thirds and the electron is their singlet, the electron is a composite far lighter than its
// binding scale. 't Hooft's condition says that can be natural only if the composites reproduce the constituents'
// anomaly coefficients for every global symmetry the confining force leaves unbroken. This file asks, by algebra alone,
// whether the rule's own three-member singlets can.
//
// CONSTITUENTS. One chiral face of E-FRC-0267's slab (the husk is one face): its in-gap levels are one Weyl SU(2)+
// doublet of the face's hand, all in the J = +1 (Wilson) half (E-FRC-0267 P1, E-FRC-0268 H5: 8 levels per slab, 4 per
// face = spin 2 x isospin 2). Lifted to the two tones (E-SPN-0189) and the role triplet (E-FRC-0278): per tone an SU(2)+
// doublet of colour multiplicity 3, charge read by the vibe count of the hole (three-member-census holeCharge3: a
// love-sea hole -1/3, a fear-sea hole +1/3, never typed), member number 1, hand +1. The overall sign of the hand is
// common to constituents and composites (both are holes of the same face), so it cancels in every match.
// COMPOSITES. Three members on one level in a colour singlet: the role part is epsilon (antisymmetric), so under Fermi
// exchange the (spin, isospin, tone) part is SYMMETRIC, the census's 'bose' table (E-SPN-0192). Only half + members are
// light on the face, so n+ = 3. The composite J = 1/2 multiplets, hand from the face (three left Weyl spinors make a
// left J = 1/2 and no right one), member number 3, isospin read from the weights of R(e_0k) on half +.
//
// SYMMETRY SETS, FROZEN BEFORE COMPUTING: S1 = U(1)_Q, S2 = U(1)_Q x SU(2)+, S3 = S2 x U(1)_N (member number).
// Coefficients per set: every cubic and mixed-gravitational trace of its U(1)s, Tr U(1) T3^2, and Witten's SU(2)+
// parity (E-FRC-0002's sums; the parity is the Dynkin index mod 2, 1 for a doublet and 0 for a quartet). Indices l_k,
// |l_k| <= 3, per composite multiplet; a negative index is the other hand.
//
// DERIVED BEFORE THE RUN (L1).
// 1. Half + is spin 2 x isospin 2, so the colour-singlet cube is Sym^3 over 8 labels (120 states). Q = -1 (three
//    love-sea holes): Sym^3 (2 x 2) = (J, T) (3/2, 3/2) + (1/2, 1/2). Q = -1/3: Sym^2 (2 x 2) x (2 x 2) = (3/2, 3/2) +
//    (3/2, 1/2) + (1/2, 3/2) + 2 (1/2, 1/2). The same at +1 and +1/3. So 8 J = 1/2 multiplets: A+-: Q = +-1, T = 1/2;
//    B+-: Q = +-1/3, T = 3/2; C+-, C'+-: Q = +-1/3, T = 1/2. The census's bose rows at n+ = 3 must hold the same counts.
// 2. Constituents: the two tones cancel in every odd power of Q, so 27 Tr Q^3 = 3 Tr Q = 12 Tr Q T3^2 = 0, and Witten's
//    count is 2 tones x 3 colours = 6 doublets, even. S1 and S2 are VACUOUS: they protect nothing.
// 3. S3 is not vacuous: Tr N^3 = Tr N = 12, Tr N Q^2 = 4/3, Tr N T3^2 = 3. Every composite has N = 3, so its Tr N^3 is
//    27 times its dimension-weighted index and its Tr N 3 times the same sum: matching needs that sum to be 4/9 and 4 at
//    once. No assignment, at any bound, matches S3.
// PREDICTED: KILL.
//
// HYPOTHESES AND GATES, fixed before the run, never moved.
//  I1 INSTRUMENT: (a) on half +, L(e_01) and R(e_0k) are integer 4 x 4 with squares -1, the R(e_0k) close as su(2),
//     commute with L(e_01), Casimir 3 (a doublet), tr(L R) = 0, so the four joint weights have multiplicity 1; (b) the
//     member charges read 3Q = -1 and +1; (c) the cube has dimension 120, decomposes with no negative count, and per 3Q
//     its J = 1/2 and J = 3/2 state counts at n+ = 3 equal census(3, 'bose')'s; (d) the trace code reproduces E-FRC-0002
//     on the Standard Model generation (Tr Y^3, Tr Y, Tr Y T3^2 zero, even doublets) and an exotic singlet breaks it;
//     (e) the search finds a match when one exists: a target built from composites at chosen indices, including a
//     charge-one one, is matched with an electron at nonzero index.
//  C1 CONTROL (brief): dropping any one constituent level (one tone, colour, T3; 12 ways) leaves no matching assignment
//     for any set, vacuous or not.
//  PASS: for S2 or S3, non-vacuous, some assignment matches every coefficient with a |Q| = 1, J = 1/2 composite at
//     nonzero index. PARTIAL: such a match only for S1 (non-vacuous). KILL: no non-vacuous set has such a match. Then no
//     light three-member electron exists on this rule and blocker 2 is a rule change on tone. A failed I1 or C1 makes the
//     verdict partial, the gap named.
// READ, gating nothing: the coefficient tables; Tr N C^2 and Tr Q C^2 (whether U(1)_N or U(1)_Q has an ABJ anomaly with
//  colour); both faces together; dropping a whole tone-colour doublet in place of one level.
//
// WHAT THIS CAN AND CANNOT SHOW. It is pure counting on one face. It assumes the confining force is colour (role) and
// that the face's light levels are the whole light constituent content. It does not build that force, and it does not
// decide which symmetries a real confining vacuum keeps: the three sets are frozen guesses.
//
// FIRST RUN 2026-10-08 (tmp/anomaly.log, 10.4 s): KILL (status fail), as derived. No gate moved, none rerun.
//  - Constituents: Tr Q^3 0, Tr Q 0, Tr Q T3^2 0, Witten 0 (S1, S2 vacuous); Tr Q^2 N 4/3, Tr Q N^2 0, Tr N^3 12, Tr N
//    12, Tr N T3^2 3.
//  - Composites as derived: Q +-1 (1/2, 1/2) x1, Q +-1/3 (1/2, 3/2) x1 and (1/2, 1/2) x2, 8 multiplets; the census's
//    bose n+ = 3 counts agree. Of 7^8 = 5,764,801 assignments S1 matches 45,521 (39,018 with an electron), S2 11,319
//    (9,702), S3 0: the only non-vacuous set matches nothing.
//  - I1 (a) to (e) hold (planted target: 42 matches); C1: 0 of 12 one-level drops leave any match.
//  - READ: Tr N C^2 = 2, Tr Q C^2 = 0, so U(1)_N is also broken by colour's ABJ anomaly; both faces give all zero (the
//    pair of faces is vector-like); dropping a whole doublet keeps 38,640 S1 electron matches (S1 is then non-vacuous
//    and matchable, so the control's grain is one level, not one doublet).
//
// DETERMINISM: no random numbers. EXACT: integer matrices and integer-scaled traces.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { census } from '@/code/measure/three-member-census'
import {
  asFraction,
  COEFFICIENTS,
  colorAnomaly,
  compositeMultiplets,
  dropOneLevel,
  faceConstituents,
  memberWeights,
  SCALE,
  searchMatches,
  SETS,
  spinHalfComposites,
  traces,
  vacuous,
  type Coefficient,
  type Multiplet,
  type Search,
  type SymmetrySet,
} from '@/code/measure/anomaly-matching'

const BOUND = 3
const SET_NAMES: readonly SymmetrySet[] = ['S1', 'S2', 'S3']

export default experiment({
  id: 'gauge/anomaly-matching',
  code: 'E-FRC-0289',
  title:
    "'t Hooft anomaly matching for a light three-member electron on the register rule, fail as derived: on one chiral face the constituents (per tone an SU(2)+ doublet of colour 3, Q -1/3 and +1/3) cancel every Q coefficient and Witten's parity, so U(1)_Q and U(1)_Q x SU(2)+ are vacuous, and with member number the constituents give Tr N^3 = Tr N = 12 while every colour-singlet composite has N = 3, so its Tr N^3 is 9 times its Tr N: none of 5,764,801 index assignments over the 8 J = 1/2 composite multiplets matches, no anomaly protects a light composite electron, and blocker 2 becomes a rule change on tone",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return anomalyMatchingRun()
  },
})

const table = (t: Record<Coefficient, number>): string =>
  COEFFICIENTS.map(c => `${c} ${asFraction(c, t[c])}`).join(', ')

const searchLine = (s: Search, cs: readonly Multiplet[]): string =>
  `${s.set}: ${s.matches} of ${s.tried} match, ${s.electronMatches} with |Q| = 1 at nonzero index${
    s.example
      ? ` (e.g. ${s.example
          .map((x, i) => (x === 0 ? '' : `${x} x [${cs[i]!.name}]`))
          .filter(Boolean)
          .join(' + ')})`
      : ''
  }`

export function anomalyMatchingRun(): Verdict {
  const started = Date.now()

  // ---------------- I1 ----------------
  const w = memberWeights()
  const I1a =
    w.exact &&
    w.closes &&
    w.commutes &&
    w.isospinCasimir === 3 &&
    w.traceAB === 0 &&
    w.weights.length === 4 &&
    w.weights.every(x => x.multiplicity === 1)

  const face = faceConstituents()
  const I1b =
    face.length === 2 && face[0]!.charge3 === -1 && face[1]!.charge3 === 1

  const comp = compositeMultiplets(w)
  const bose = census(3, 'bose')
  const statesAt = (q3: number, twoJ: number): number =>
    comp.irreps
      .filter(r => r.charge3 === q3 && r.twoJ === twoJ)
      .reduce((s, r) => s + r.count * (r.twoJ + 1) * (r.twoT + 1), 0)
  const censusAt = (q3: number, twoJ: number): number =>
    bose.rows
      .filter(r => r.charge3 === q3 && r.twoJ === twoJ && r.nPlus === 3)
      .reduce((s, r) => s + r.states, 0)
  const I1c =
    comp.dimension === 120 &&
    comp.decomposed &&
    [-3, -1, 1, 3].every(q3 =>
      [1, 3].every(j => statesAt(q3, j) === censusAt(q3, j)),
    )

  // E-FRC-0002's generation as multiplets: hypercharge 6Y in place of 3Q, no member number
  const sm = (name: string, y6: number, twoT: number, copies: number) => ({
    name,
    charge3: y6,
    members: 0,
    twoT,
    twoT3: Array.from({ length: twoT + 1 }, (_, i) => twoT - 2 * i),
    copies,
    hand: 1,
  })
  const generation: Multiplet[] = [
    sm('Q', 1, 1, 3),
    sm('uc', -4, 0, 3),
    sm('dc', 2, 0, 3),
    sm('L', -3, 1, 1),
    sm('ec', 6, 0, 1),
  ]
  const smT = traces(generation)
  const exoticT = traces([...generation, sm('X', 3, 0, 1)])
  const I1d =
    smT.QQQ === 0 &&
    smT.Q === 0 &&
    smT.QTT === 0 &&
    smT.witten === 0 &&
    (exoticT.QQQ !== 0 || exoticT.Q !== 0)

  const composites = spinHalfComposites(comp)
  const electronAt = composites.findIndex(m => m.charge3 === -3)
  const thirdAt = composites.findIndex(m => m.charge3 === 1 && m.twoT === 1)
  const planted = traces([
    { ...composites[electronAt]!, hand: 2 },
    { ...composites[thirdAt]!, hand: -1 },
  ])
  const plantedSearch = searchMatches(planted, composites, 'S3', BOUND)
  const I1e = plantedSearch.electronMatches > 0
  const I1 = I1a && I1b && I1c && I1d && I1e

  // ---------------- the coefficients and the search ----------------
  const target = traces(face)
  const searches = SET_NAMES.map(s => searchMatches(target, composites, s, BOUND))
  const live = searches.filter(s => !vacuous(target, s.set))
  const winning = live.filter(s => s.electronMatches > 0)

  // ---------------- C1 ----------------
  const drops = dropOneLevel(face)
  const dropMatches = drops.map(d => {
    const t = traces(d)

    return SET_NAMES.reduce(
      (s, set) => s + searchMatches(t, composites, set, BOUND).matches,
      0,
    )
  })
  const C1 = drops.length === 12 && dropMatches.every(m => m === 0)

  // ---------------- the gate ----------------
  const pass = winning.some(s => s.set === 'S2' || s.set === 'S3')
  const partialOnly = !pass && winning.some(s => s.set === 'S1')
  const status: Verdict['status'] = !(I1 && C1)
    ? 'partial'
    : pass
      ? 'pass'
      : partialOnly
        ? 'partial'
        : 'fail'

  // ---------------- READ ----------------
  const colour = colorAnomaly(face)
  const bothFaces = traces([...face, ...faceConstituents(-1)])
  const doubletDrop = traces([
    { ...face[0]!, copies: face[0]!.copies - 1 },
    face[1]!,
  ])
  const doubletSearch = searchMatches(doubletDrop, composites, 'S1', BOUND)
  const seconds = (Date.now() - started) / 1000
  const vac = SET_NAMES.filter(s => vacuous(target, s))
  const compNames = comp.irreps
    .map(
      r =>
        `Q ${r.charge3}/3 (J ${r.twoJ}/2, T ${r.twoT}/2) x${r.count}`,
    )
    .join('; ')

  return verdict({
    status,
    claim: `'t Hooft matching on one chiral face, ${status === 'fail' ? 'KILL' : status}: the constituents (per tone an SU(2)+ doublet, colour 3, Q -1/3 and +1/3) give ${table(target)}, so ${vac.join(' and ') || 'no set'} ${vac.length === 1 ? 'is' : 'are'} vacuous; the colour-singlet three-member J = 1/2 composites (${composites.length} multiplets) match ${searches.map(s => `${s.set} in ${s.matches}`).join(', ')} of ${searches[0]!.tried} index assignments (|l| <= ${BOUND}), with a charge-one composite at nonzero index in ${searches.map(s => `${s.set} ${s.electronMatches}`).join(', ')}; the non-vacuous set${live.length === 1 ? '' : 's'} ${live.map(s => s.set).join(', ')} ${winning.length === 0 ? 'match nothing' : 'match'}; instrument ${I1}, dropping one level kills every match ${C1}`,
    metrics: {
      I1: I1 ? 1 : 0,
      I1a: I1a ? 1 : 0,
      I1b: I1b ? 1 : 0,
      I1c: I1c ? 1 : 0,
      I1d: I1d ? 1 : 0,
      I1e: I1e ? 1 : 0,
      C1: C1 ? 1 : 0,
      ...Object.fromEntries(
        COEFFICIENTS.map(c => [`constituent_${c}_x${SCALE[c]}`, target[c]]),
      ),
      ...Object.fromEntries(
        searches.flatMap(s => [
          [`${s.set}_matches`, s.matches],
          [`${s.set}_electron_matches`, s.electronMatches],
          [`${s.set}_vacuous`, vacuous(target, s.set) ? 1 : 0],
        ]),
      ),
      compositeMultiplets: composites.length,
      cubeDimension: comp.dimension,
      seconds,
    },
    control: {
      dropsTried: drops.length,
      dropsWithAnyMatch: dropMatches.filter(m => m > 0).length,
      plantedElectronMatches: plantedSearch.electronMatches,
      exoticQQQ: exoticT.QQQ,
      twiceTrNCC: colour.twiceNCC,
      sixTrQCC: colour.sixQCC,
      bothFacesNonzero: COEFFICIENTS.filter(c => bothFaces[c] !== 0).length,
      doubletDropS1Electron: doubletSearch.electronMatches,
    },
    notes: `L1, exact. Member on half +: weights ${w.weights.map(x => `(${x.twoJz}, ${x.twoT3}) x${x.multiplicity}`).join(' ')}, isospin Casimir ${w.isospinCasimir}, tr(L R) ${w.traceAB}. Cube (colour singlet, bose on spin x isospin x tone, n+ 3): ${compNames}. Constituents: ${table(target)}. Searches: ${searches.map(s => searchLine(s, composites)).join('; ')}. Sets per coefficient: ${SET_NAMES.map(s => `${s} ${SETS[s].join('/')}`).join('; ')}. READ: Tr N C^2 = ${colour.twiceNCC}/2 and Tr Q C^2 = ${colour.sixQCC}/6 (U(1)_N ${colour.twiceNCC === 0 ? 'has no' : 'HAS an'} ABJ anomaly with colour, so on a gauged confining colour it is not a symmetry to match); both faces: ${table(bothFaces)}; a whole love-sea doublet of one colour dropped: ${searchLine(doubletSearch, composites)}. Planted control: ${searchLine(plantedSearch, composites)}. ${seconds.toFixed(1)} s.`,
  })
}
