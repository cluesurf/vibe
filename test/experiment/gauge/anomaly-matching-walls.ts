// 'T HOOFT MATCHING ON BOTH WALLS, EVERY INPUT READ FROM THE RULE (E-FRC-0290, note/project/vibe/roadmap/moving-matter
// item 0028, route 1 of research/charge-one-after-anomaly.md). RULE: the register rule R*, with the spinor lift L(s) as
// the member's rotation (decision 0006).
//
// E-FRC-0289 killed a light three-member electron on one face with the member number of that face. Three of its inputs
// were not read from the rule: the hand (a parameter), the colour (both tones 3, but the fear tone carries 3-bar), and
// the symmetry (R* conserves N+, the number of register half +, which counts BOTH walls of the slab; the one-wall number
// is at best emergent and has a colour ABJ coefficient). This file reads each input from the rule and matches on the set
// R* actually keeps.
//
// STEP 0, READ NOT TYPED. On E-FRC-0267's chiral slab (L = 12, ringUnit(-2, 5), Wilson mixers on half +):
//  - the wall theory's spacetime: the root dimension, minus the depth axis, gives the axes the wall's Weyl cone is read
//    along (wallChirality differentiates along each), plus the cycle's one time;
//  - per face (wall A, wall B) the in-gap levels at k = 0 in each half, their hand from the handedness index (the net
//    chirality, E-FRC-0267's instrument: hand = 2 chi / states, and |chi| = states / 2 means every Weyl copy on the face
//    has that one hand), and their SU(2)+ representation (right multiplication by e_0k on half +, E-FRC-0268,
//    compressed to the face: the Casimir -sum G_k^2, 3 for doublets);
//  - tone and Q: every piece leaves the tone alone (E-SPN-0189), so each level comes in both tones, Q by the vibe count
//    of the hole (three-member-census holeCharge3, the count member-charge.ts reads on every wall level);
//  - colour: Sigma(648) on the role (role-register sigmaReading): if the unlike singlet is kept by g (x) conj g and not
//    by g (x) g, the two tones carry conjugate representations (love 3, fear 3-bar). The singlets of three members are
//    counted per symmetry type by Schur characters averaged over the 648 elements (a finite group may hold more
//    invariants than SU(3)), and for mixed tones.
// STEP 1, EXACTNESS ON R*. The largest entry of [q, 1 (x) J] (N+) and [q, 1 (x) R(e_0k) (1 + J)] (SU(2)+) over the
//  rule's pieces 24 Q_S, 48 Q_D, 96 Q_D P+, 48 Q_S P+, 2 P+: integer matrices, so exact. The one-wall numbers N_A and N_B
//  are not dock operators: read [U, Pi_A] on the in-gap levels (|e^(i phi_a) - e^(i phi_b)| |<a| Pi_A |b>|) and the
//  in-gap A-B splitting at L = 8, 12, 16, 20.
// STEP 2, FROZEN: S4 = U(1)_Q x SU(2)_A x SU(2)_B x U(1)_V, SU(2)_A/B the one SU(2)+ restricted to one wall (emergent
//  as the walls separate), N_V = N_A + N_B = N+. A U(1) with Tr X C^2 not 0, or not exact on R*, is inadmissible and
//  dropped with every coefficient that needs it. Composites: colour-singlet three-member states on ONE wall, J = 1/2
//  only, hand from Lorentz content (three Weyl spinors of one hand hold only (j, 0) of that hand), both walls.
//  Coefficients (scaled to integers): 27 Tr Q^3, 3 Tr Q, Tr V^3, Tr V, 9 Tr Q^2 V, 3 Tr Q V^2, 12 Tr Q T_A^2, 4 Tr V
//  T_A^2, the same with T_B, and Witten's parity of SU(2)_A and SU(2)_B. Indices |l| <= 3 per composite multiplet.
//
// DERIVED BEFORE THE RUN (L1), with the lead's prediction. Face A +2, face B -2, all in half + (E-FRC-0267 P1), so hand
// +1 on A and -1 on B; each face one SU(2)+ doublet of Weyl spinors (4 states). Per wall per tone 3 colours x 2 = 6
// fields, N_V 1. Then wall A gives Tr V^3 = Tr V = 12, 9 Tr Q^2 V = 12, 2 Tr V C^2 = 4, Tr V T_A^2 = 3; wall B the
// negatives; Q odd traces cancel per wall; Witten 6 doublets per wall, even. So U(1)_V is admissible (2 Tr V C^2 = 0),
// U(1)_Q too, and S4 is non-vacuous through Tr V T_A^2 = 3 and Tr V T_B^2 = -3. The axial A = N_A - N_B has 2 Tr A C^2
// = 8: inadmissible, as U(1)_A in QCD. Colour: 3 x 3 x 3-bar holds no singlet (the centre of Sigma(648) is Z3), so only
// like-tone states are singlets; with one antisymmetric invariant they are Sym^3 (2 x 2) = (3/2, 3/2) + (1/2, 1/2),
// so per wall per tone one J = 1/2 doublet, Q = +-1, N_V 3: four multiplets, 7^4 = 2,401 assignments. Matching: Tr Q
// T_A^2 forces equal indices for the two tones on a wall, Tr V T_A^2 = 3/2 (l1 + l2) = 3 forces l1 + l2 = 2, so l = (1,
// 1, 1, 1), unique; it also gives Tr V^3 = 108 - 108, 9 Tr Q^2 V = 54 - 54 and two doublets per wall (Witten even).
// PREDICTED: PASS, one assignment, the charge-one doublet at index 1 per tone per wall.
//
// HYPOTHESES AND GATES, fixed before the run, never moved.
//  D  DIMENSION: three tangent axes and one time, so the walls are 3+1d. If 2+1d: OPEN, a Diagnose: item, stop.
//  R  READ CONTENT AS E-FRC-0289 CITED IT: face A 4 in-gap states, face B 4, half - none; hands +1 and -1 with |chi| =
//     states / 2 (1e-3); every face state in an SU(2)+ doublet (Casimir 3 and the span invariant, 1e-8); 3Q = -1 and +1.
//     A difference makes the verdict OPEN, gates run on what was read, the difference named.
//  E  EXACT: N+ and SU(2)+ commute with every piece, gap exactly 0.
//  PASS: S4 admissible and non-vacuous, and some assignment matches every coefficient with a charge-one J = 1/2
//     composite at nonzero index on each wall. KILL: S4 admissible and non-vacuous, no such assignment. OPEN: S4 vacuous
//     after admissibility, or D or R reads otherwise.
//  CONTROLS (a failure makes the verdict partial):
//   C1 E-FRC-0289's S3 (one-wall U(1)_N, wall A alone, its own searchMatches) still matches nothing with the colour read
//      here;
//   C2 two-flavour QCD (quarks B 1/3 as N_V 1, N_c 3, continuous SU(3): one antisymmetric invariant; SU(2)_L x SU(2)_R x
//      U(1)_B) matches, with the nucleon doublet at index 1 on each side;
//   C3 dropping wall B (wall A's constituents as the target, every S4 coefficient) leaves no match.
//  INSTRUMENT (a failure makes the verdict partial): I1 E-FRC-0289's member weights (four joint weights, multiplicity
//   1, isospin Casimir 3); I2 the like-tone content with one antisymmetric colour invariant equals E-FRC-0289's Q = +-1
//   irreps; I3 a planted target (composite indices 2, -1, 0, 1) is found; I4 the group averages are integers to 1e-9
//   and the order is 648.
// READ, gating nothing: the coefficient tables, the colour traces including the axial number, the leak table.
//
// WHAT THIS CAN AND CANNOT SHOW. Matching is necessary, not sufficient: QCD satisfies it at two flavours and breaks
// chiral symmetry anyway. It assumes the confining force is colour and that SU(2)_A x SU(2)_B emerge as the walls
// separate; whether colour on R* (the finite Sigma(648)) breaks the one-wall number is item 0029, and whether members
// are caged at all is 0019. Tr X C^2 is the continuous-group coefficient; for a finite colour group it is the
// admissibility test the brief fixes, not a derivation.
//
// FIRST RUN 2026-10-08 (tmp/walls.log, 101.5 s): PASS, as derived. No gate moved, none rerun.
//  - D: tangent axes 0, 1, 2 (speeds 0.6225 each), so 3+1d. R: faces A and B 4 states each, chi +2.000000 and
//    -2.000000 (hands +1, -1, one hand per face), half - 0 in-gap; SU(2)+ Casimir 3 to 8e-12, spans invariant to 5e-12;
//    3Q -1, +1. Colour: [g x conj g, V] 6.5e-16, [g x g, V] 1.0 (conjugate tones); like-tone invariants anti 1, sym 0,
//    mixed 0 (Sigma(648) holds no extra cubic invariant), mixed-tone 0 and 0.
//  - E: N+ and SU(2)+ gaps exactly 0 over the 5 pieces; left-multiplication teeth 1/12.
//  - Leak (max |eps|, half +): L 8 2.44e-2, L 12 1.22e-4, L 16 3.18e-4, L 20 7.35e-5, with [U, Pi_A] 1.9e-2, 9.7e-5,
//    2.7e-4, 5.3e-5: small and falling overall but NOT monotone (L 16 above L 12), read, gating nothing.
//  - Colour traces 2 Tr V C^2 0, 6 Tr Q C^2 0, 2 Tr (N_A - N_B) C^2 8: S4 admissible, axial not. Constituents: Tr V T_A^2
//    3, Tr V T_B^2 -3, every other coefficient 0. Composites: per wall per tone one (1/2, 1/2), Q +-1. 1 of 2,401
//    assignments matches, (1, 1, 1, 1), with charge one on both walls.
//  - C1: S3 one wall 0 of 49. C2: QCD 1 of 49, (1, 1). C3: wall B dropped 0 of 2,401. I1 to I4 hold.
//
// DETERMINISM: no random numbers. EXACT: rule pieces and traces are integers; the slab spectra, face vectors and
// characters are floats, as measurement, rounded only behind the residuals above.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { wallChirality } from '@/code/measure/wilson-register'
import { holeCharge3 } from '@/code/measure/three-member-census'
import {
  compositeMultiplets,
  memberWeights,
  searchMatches,
  traces,
  vacuous,
  type Multiplet,
} from '@/code/measure/anomaly-matching'
import {
  asFraction4,
  chiralSlab,
  COEFFICIENTS4,
  colourRead,
  colourTraces,
  faceIsospin,
  faceSpans,
  halfGenerators,
  likeContent,
  NEEDS,
  ruleExactness,
  SCALE4,
  search4,
  slabSplitting,
  traces4,
  wallComposites,
  wallConstituents,
  wallGeometry,
  type Coefficient4,
  type Constituent,
  type WallMultiplet,
} from '@/code/measure/anomaly-matching-walls'

const BOUND = 3
const WALL_L = 12
const LEAK_L = [8, 12, 16, 20]
const CHI_TOLERANCE = 1e-3
const SPAN_TOLERANCE = 1e-8

export default experiment({
  id: 'gauge/anomaly-matching-walls',
  code: 'E-FRC-0290',
  title:
    "'t Hooft matching on both walls of the chiral slab with every input read from the register rule: the walls are 3+1d, face A reads hand +1 and face B -1, each an SU(2)+ doublet, the tones carry conjugate colour so only like-tone triples are singlets, R* keeps N+ = N_A + N_B and SU(2)+ exactly while the one-wall numbers are broken only by the inter-wall leak; on S4 = U(1)_Q x SU(2)_A x SU(2)_B x U(1)_V the charge-one (1/2, 1/2) doublet at index 1 per tone per wall matches every coefficient",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return anomalyMatchingWallsRun()
  },
})

const flag = (b: boolean): number => (b ? 1 : 0)

const table = (t: Record<Coefficient4, number>, cs: readonly Coefficient4[]): string =>
  cs.map(c => `${c} ${asFraction4(c, t[c])}`).join(', ')

export function anomalyMatchingWallsRun(): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${((Date.now() - started) / 1000).toFixed(1)}s`)

  // ================= STEP 0 =================
  const geo = wallGeometry()
  const D = geo.tangentAxes.length === 3 && geo.time === 1

  const cs = chiralSlab(WALL_L)
  const hands = ([0, 1] as const).map(half =>
    wallChirality(
      cs.slab,
      cs.sets[half]!,
      DOCK_ROOTS,
      cs.ranges[half]!.sR,
      cs.ranges[half]!.dR,
      cs.aDepths,
      0.01,
      0.1,
    ),
  )

  log('hands')

  const faceRead = [0, 1].map(w => {
    const r = hands[0]!.walls[w]!
    const hand = r.states > 0 ? (2 * r.chirality) / r.states : 0

    return {
      states: r.states,
      chirality: r.chirality,
      hand: Math.round(hand),
      oneHand:
        r.states > 0 &&
        Math.abs(Math.abs(r.chirality) - r.states / 2) <= CHI_TOLERANCE,
      speeds: r.speeds,
    }
  })
  const otherHalf = hands[1]!.inGap
  const spans = faceSpans(cs, 0)
  const Y = halfGenerators(cs.basis, 0)
  const iso = spans.faces.map(zs => faceIsospin(zs, Y))

  log('isospin')

  const toneQ = [0, 1].map(t => holeCharge3([t]))
  const colour = colourRead()

  log('colour')

  const handA = faceRead[0]!.hand
  const handB = faceRead[1]!.hand
  const R =
    faceRead[0]!.states === 4 &&
    faceRead[1]!.states === 4 &&
    otherHalf === 0 &&
    handA === 1 &&
    handB === -1 &&
    faceRead.every(f => f.oneHand) &&
    iso.every(
      x =>
        x.states === 4 &&
        x.invariance <= SPAN_TOLERANCE &&
        x.casimirGap <= SPAN_TOLERANCE,
    ) &&
    toneQ[0] === -1 &&
    toneQ[1] === 1
  const differences: string[] = []

  if (faceRead[0]!.states !== 4 || faceRead[1]!.states !== 4) {
    differences.push(`face states ${faceRead.map(f => f.states).join('/')}`)
  }

  if (otherHalf !== 0) {
    differences.push(`half - holds ${otherHalf} in-gap levels`)
  }

  if (handA !== 1 || handB !== -1 || !faceRead.every(f => f.oneHand)) {
    differences.push(`hands ${handA}/${handB}`)
  }

  if (!iso.every(x => x.casimirGap <= SPAN_TOLERANCE)) {
    differences.push('not all doublets')
  }

  // the tones as read: Q from the hole count, colour conjugate on the love-sea hole (the fear-tone member) when the
  // unlike singlet is kept by g (x) conj g (which tone is called 3 is a convention; only the conjugacy is read)
  const tones: Constituent[] = [0, 1].map(t => ({
    tone: t,
    charge3: toneQ[t]!,
    conj: t === 0 && colour.conjugate,
  }))
  const colourDimension = 3
  const twoT = iso[0]!.casimirGap <= SPAN_TOLERANCE ? 1 : Number.NaN

  // ================= STEP 1 =================
  const ex = ruleExactness()
  const E = ex.halfNumberGap === 0 && ex.su2Gap === 0 && ex.leftTeeth > 0
  const leaks = LEAK_L.map(L => slabSplitting(L))

  log('leaks')

  const leakMax = leaks.map(x => Math.max(0, ...x.eps.map(Math.abs)))
  const leakFalls = leakMax.every((x, i) => i === 0 || x < leakMax[i - 1]!)

  // ================= STEP 2 =================
  const constituents: WallMultiplet[] = [
    ...wallConstituents('A', handA, tones, colourDimension, twoT),
    ...wallConstituents('B', handB, tones, colourDimension, twoT),
  ]
  const target = traces4(constituents)
  const ct = colourTraces(constituents)
  const admissible = {
    Q: ct.sixQCC === 0,
    V: ct.twiceVCC === 0 && ex.halfNumberGap === 0,
  }
  const S4: Coefficient4[] = COEFFICIENTS4.filter(c =>
    NEEDS[c].every(u => admissible[u]),
  )
  const dropped = COEFFICIENTS4.filter(c => !S4.includes(c))
  const s4Vacuous = S4.every(c => target[c] === 0)
  const w = memberWeights()
  const mixedSinglets = colour.mixedTone[0] + colour.mixedTone[1]
  const like = likeContent(w, colour.like)
  const composites: WallMultiplet[] = [
    ...wallComposites('A', handA, tones, like.irreps),
    ...wallComposites('B', handB, tones, like.irreps),
  ]
  const search = search4(target, composites, S4, BOUND)

  log('search')

  // ================= controls =================
  // C1: E-FRC-0289's S3 on wall A with the colour read here
  const as0289 = (m: WallMultiplet): Multiplet => ({
    name: m.name,
    charge3: m.charge3,
    members: m.v,
    twoT: m.twoT,
    twoT3: m.twoT3,
    copies: m.copies,
    hand: m.hand,
  })
  const wallA = constituents.filter(m => m.wall === 'A').map(as0289)
  const wallAComposites = composites.filter(m => m.wall === 'A').map(as0289)
  const s3Target = traces(wallA)
  const s3 = searchMatches(s3Target, wallAComposites, 'S3', BOUND)
  const C1 = !vacuous(s3Target, 'S3') && s3.matches === 0

  // C2: two-flavour QCD
  const quark: Constituent[] = [{ tone: 0, charge3: 0, conj: false }]
  const qcdLike = likeContent(w, { sym: 0, mixed: 0, anti: 1 })
  const qcdConstituents = [
    ...wallConstituents('A', 1, quark, 3, 1),
    ...wallConstituents('B', -1, quark, 3, 1),
  ]
  const qcdComposites = [
    ...wallComposites('A', 1, quark, qcdLike.irreps),
    ...wallComposites('B', -1, quark, qcdLike.irreps),
  ]
  const QCD_SET: Coefficient4[] = ['VVV', 'V', 'VTA', 'VTB', 'wittenA', 'wittenB']
  const qcdTarget = traces4(qcdConstituents)
  const qcd = search4(qcdTarget, qcdComposites, QCD_SET, BOUND)
  const nucleonAt = qcdComposites.map(m => m.twoT === 1)
  const C2 =
    qcd.matches > 0 &&
    qcd.examples.some(l => l.every((x, i) => (nucleonAt[i] ? x === 1 : x === 0)))

  // C3: drop wall B
  const aOnly = traces4(constituents.filter(m => m.wall === 'A'))
  const dropB = search4(aOnly, composites, COEFFICIENTS4.slice(), BOUND)
  const C3 = dropB.matches === 0

  // ================= instrument =================
  const I1 =
    w.exact &&
    w.closes &&
    w.commutes &&
    w.isospinCasimir === 3 &&
    w.weights.length === 4 &&
    w.weights.every(x => x.multiplicity === 1)
  const old = compositeMultiplets(w)
    .irreps.filter(r => Math.abs(r.charge3) === 3)
    .filter(r => r.charge3 === -3)
    .map(r => `${r.twoJ},${r.twoT},${r.count}`)
    .sort()
  const mine = qcdLike.irreps.map(r => `${r.twoJ},${r.twoT},${r.count}`).sort()
  const I2 = qcdLike.ok && old.join(';') === mine.join(';')
  const plantedL = [2, -1, 0, 1]
  const planted = traces4(
    composites.flatMap((m, i) =>
      plantedL[i] ? [{ ...m, hand: m.hand * plantedL[i]! }] : [],
    ),
  )
  const plantedSearch = search4(planted, composites, S4, BOUND)
  const I3 =
    composites.length === plantedL.length &&
    plantedSearch.examples.some(l => l.join(',') === plantedL.join(','))
  const I4 = colour.order === 648 && colour.roundGap <= 1e-9
  const I = I1 && I2 && I3 && I4

  // ================= verdict =================
  const electronComposite = composites.some(m => Math.abs(m.charge3) === 3)
  const pass = !s4Vacuous && search.electronMatches > 0
  const open = !D || !R || s4Vacuous || mixedSinglets !== 0 || !like.ok
  const controls = C1 && C2 && C3
  const status: Verdict['status'] = open
    ? 'open'
    : !(I && E && controls)
      ? 'partial'
      : pass
        ? 'pass'
        : 'fail'
  const seconds = (Date.now() - started) / 1000
  const compNames = composites.map(m => m.name).join('; ')
  const ex0 = search.examples
    .map(l => l.map((x, i) => (x === 0 ? '' : `${x} x [${composites[i]!.name}]`)).filter(Boolean).join(' + '))
    .join(' | ')

  return verdict({
    status,
    claim: `two-wall matching on R*, ${status === 'pass' ? 'PASS' : status === 'fail' ? 'KILL' : status.toUpperCase()}: walls ${geo.tangentAxes.length}+${geo.time}d; face A ${faceRead[0]!.states} states chi ${faceRead[0]!.chirality.toFixed(6)} (hand ${handA}), face B ${faceRead[1]!.states} chi ${faceRead[1]!.chirality.toFixed(6)} (hand ${handB}), half - ${otherHalf}; SU(2)+ Casimir ${iso.map(x => x.casimir.toFixed(9)).join('/')}; 3Q ${toneQ.join('/')}; tones conjugate in colour ${colour.conjugate}, like-tone invariants anti ${colour.like.anti} sym ${colour.like.sym} mixed ${colour.like.mixed}, mixed-tone ${colour.mixedTone.join('/')}; N+ gap ${ex.halfNumberGap}, SU(2)+ gap ${ex.su2Gap}; admissible Q ${admissible.Q} V ${admissible.V}; S4 ${s4Vacuous ? 'VACUOUS' : 'non-vacuous'}: ${table(target, S4)}; ${composites.length} J = 1/2 composites, ${search.matches} of ${search.tried} assignments match, ${search.electronMatches} with a charge-one composite on each wall (${ex0 || 'none'}); controls C1 ${C1} (S3 one wall ${s3.matches} matches) C2 ${C2} (QCD ${qcd.matches}) C3 ${C3} (wall B dropped ${dropB.matches}); instrument ${I}`,
    metrics: {
      D: flag(D),
      R: flag(R),
      E: flag(E),
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      I1: flag(I1),
      I2: flag(I2),
      I3: flag(I3),
      I4: flag(I4),
      faceAChirality: faceRead[0]!.chirality,
      faceBChirality: faceRead[1]!.chirality,
      handA,
      handB,
      otherHalfInGap: otherHalf,
      casimirGapMax: Math.max(...iso.map(x => x.casimirGap)),
      invarianceMax: Math.max(...iso.map(x => x.invariance)),
      halfNumberGap: ex.halfNumberGap,
      su2Gap: ex.su2Gap,
      twiceTrVCC: ct.twiceVCC,
      sixTrQCC: ct.sixQCC,
      twiceTrAxialCC: ct.twiceAxialCC,
      s4Vacuous: flag(s4Vacuous),
      compositeMultiplets: composites.length,
      matches: search.matches,
      electronMatches: search.electronMatches,
      electronComposite: flag(electronComposite),
      ...Object.fromEntries(COEFFICIENTS4.map(c => [`constituent_${c}_x${SCALE4[c]}`, target[c]])),
      ...Object.fromEntries(leaks.map((x, i) => [`leak_L${x.L}`, leakMax[i]!])),
      ...Object.fromEntries(leaks.map(x => [`commutatorA_L${x.L}`, x.commutatorA])),
      leakFalls: flag(leakFalls),
      seconds,
    },
    control: {
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      s3Matches: s3.matches,
      qcdMatches: qcd.matches,
      dropBMatches: dropB.matches,
      plantedFound: flag(I3),
      colourRoundGap: colour.roundGap,
      leftTeeth: ex.leftTeeth,
    },
    notes: `L1 algebra on L2 reads. STEP 0: root dimension ${geo.rootDimension}, depth axis ${geo.depthAxis}, tangent axes ${geo.tangentAxes.join(',')} (speeds A ${faceRead[0]!.speeds.map(x => x.toFixed(4)).join('/')}, B ${faceRead[1]!.speeds.map(x => x.toFixed(4)).join('/')}); in-gap weights ${spans.weights.map(x => x.toFixed(4)).join(' ')}; isospin span invariance ${iso.map(x => x.invariance.toExponential(1)).join('/')}, Casimir gap ${iso.map(x => x.casimirGap.toExponential(1)).join('/')}; Sigma(648) [g x conj g, V] ${colour.singletConjugate.toExponential(1)}, [g x g, V] ${colour.singletSame.toFixed(4)}, averages round gap ${colour.roundGap.toExponential(1)}. ${differences.length ? `DIFFERENCES from E-FRC-0289's citation: ${differences.join('; ')}. ` : 'Read content equals E-FRC-0289 citation (face doublets, hands, Q); colour differs from it as the brief expects (fear 3-bar). '}STEP 1: rule pieces ${ex.pieces}, N+ gap ${ex.halfNumberGap}, SU(2)+ gap ${ex.su2Gap}, left-multiplication teeth ${ex.leftTeeth}; leak (max |eps| in gap, half +) ${leaks.map((x, i) => `L ${x.L}: ${leakMax[i]!.toExponential(3)} (${x.eps.length} levels, half - ${x.otherHalf}, [U, Pi_A] ${x.commutatorA.toExponential(2)})`).join('; ')}, falls ${leakFalls}. STEP 2: colour traces 2 Tr V C^2 ${ct.twiceVCC}, 6 Tr Q C^2 ${ct.sixQCC}, 2 Tr (N_A - N_B) C^2 ${ct.twiceAxialCC} (axial inadmissible); dropped coefficients ${dropped.join(',') || 'none'}; constituents ${table(target, COEFFICIENTS4)}; like-tone content ${like.irreps.map(r => `(${r.twoJ}/2, ${r.twoT}/2) x${r.count}`).join(' + ')} (${like.states} states); composites ${compNames}; matches ${search.examples.map(l => `(${l.join(',')})`).join(' ')}. Controls: S3 one wall ${s3.matches} of ${s3.tried}; QCD ${qcd.matches} of ${qcd.tried} (${qcd.examples.map(l => `(${l.join(',')})`).join(' ')}), QCD target ${table(qcdTarget, QCD_SET)}; wall B dropped ${dropB.matches} of ${dropB.tried}, target ${table(aOnly, COEFFICIENTS4)}. ${seconds.toFixed(1)} s.`,
  })
}
