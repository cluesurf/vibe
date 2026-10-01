// WHAT THE SU(2)+ GAUGE FIELD ALLOWS ON THE REGISTER RULE (E-FRC-0271). E-SPN-0180 built a curved 2T link field acting on
// half + of the register by right multiplication and found that it keeps the member light. E-FRC-0268 left SU(2)+ as a
// global symmetry with no gauge field, and E-FND-0159 found the vacuum cannot be selected without a piece that reads
// isospin and a two-body channel joining the register halves. This file reads what the field newly allows, without
// forcing any of it. The derivation is note/research/vibe/roadmap/remaining-pieces.md, "A curved link field that keeps the
// member light", "What it could newly allow".
//
// DERIVED BEFORE THE RUN (code/measure/register-link-field, code/measure/hurwitz-gauge).
// 1. GAUSS'S LAW FOR SU(2)+ HOLDS EXACTLY (L1). With the links as 2T registers, the pieces are: the member's mixers and
//    coin (commute with every Gamma(h), E-SPN-0180 G), the stream across a link (covariant link by link, since g ->
//    Gamma(g) is a homomorphism), E-SPN-0152's electric piece (a class-function convolution, which commutes with left and
//    right translation) and the magnetic phase mu^(2 - chi_2(U_p)) on each D4 triangle (chi_2 is a class function, and a
//    local move conjugates the holonomy). So every piece commutes with every local move and each dock's 2T charge is
//    conserved. What it takes is an exact homomorphism and exact class functions, all checked in integers.
// 2. THE CHARGE (L1). The trace of 4 Gamma(h) is 16 + 8 chi_2(h), so the register holds 4 singlets (half -) and 2 doublets
//    (half +, spin times isospin): a half + member is an SU(2)+ source, a half - member is neutral. Two half + members at
//    one dock hold 2 x 2 = 1 + 3.
// 3. A PIECE THAT READS ISOSPIN: YES, WITH THE SIGN THAT FAVORS THE SINGLET (L1). The 3 holds no invariant (<chi_3, 1> =
//    0), so a triplet pair cannot stand without flux; <chi_3^2, 1> = 1 lets a 3-flux line pass a dock and <chi_3^3, 1> = 2
//    lets a loop of it close at the triplet's dock, so the least flux on a closed torus is a triangle loop, electric count
//    3 C_3 / 2 against 0 for the singlet (C_R the Cayley Laplacian's eigenvalue, E-SPN-0152's exponents). The field reads
//    the pair's isospin, and it charges the non-singlet: it prefers the symmetric sea, the opposite of what selecting B
//    needs.
// 4. NO CHANNEL JOINS THE HALVES (L1). Gamma commutes with J, and the link pieces act on links only, so each half keeps its
//    member number. PREDICTED TO FAIL.
// 5. NO LEDGER SELECTS THE BREAKING SEA (L1, L2). (a) In a flat field the rule is a gauge transform of E-FND-0159's, so its
//    ledger reads the same. (b) In a static curved field the link pieces are c-numbers, the same for every member sea, so
//    they cannot order seas; and B is not stationary, because the field does not commute with the global generator X_1.
//    (c) Under Gauss's law B is not a state of the gauged rule: its holes fill the X_1 = +i space of half + at every dock
//    (48 modes), where a local move h acts as (w + i x) times the identity, so B's weight in a dock's Gauss sector is
//    (1/24) sum_h (w + i x)^48 = 1/6 + (2/3) 2^-24 exactly, and its projection there has <X_1> = 0, since sum_h Ad(h) X_1 =
//    0. That is Elitzur's theorem on this rule: a local SU(2)+ is not broken by a sea. PREDICTED TO FAIL (nothing selects
//    B).
//
// PREDICTED VERDICT: FAIL, on H and S, as derived. Gauss's law, the charge and the isospin reading hold.
//
// GATES, fixed before the gate run.
//  G1 GAUSS EXACT: g -> Gamma(g) a homomorphism over all 576 products; 4 Gamma(h) commutes exactly with 24 Q_S, 48 Q_D,
//     96 Q_D P+, 48 Q_S P+ and 2 P+ for all 24 h; the link-by-link covariance exact on the 0.5 Weyl field at L = 4 under the
//     gauge function of offset 0.29; the electric piece (exponents C_R / 2, the unit ringUnit(-1, 4)) a class function and
//     exactly unitary; chi_2(h g h^-1) = chi_2(g) for all 576 pairs.
//  G2 THE CHARGE: the trace of 4 Gamma(h) is 16 + 8 chi_2(h) for all 24; the multiplicities are exactly 2 doublets and 4
//     singlets; <chi_2^2, 1> = 1 and <chi_2^2, chi_3> = 1.
//  I  THE ISOSPIN READ: <chi_3, 1> = 0, <chi_3^2, 1> = 1, <chi_3^3, 1> >= 1, and C_3 > C_1 = 0 (the least flux a lone
//     triplet needs costs more than the singlet's none).
//  H  A CHANNEL JOINING THE HALVES (predicted FAIL): some piece moves member number between the halves, that is, 4 Gamma(h)
//     fails to commute with J for some h.
//  S  THE LEDGER SELECTS THE BREAKING SEA (predicted FAIL): selected only if B is stationary in the curved field (one-cycle
//     leak at most 1e-12 on the 0.5 Weyl field at L = 4) AND B lies in the Gauss sector (per-dock Gauss weight 1). Read with
//     it: the weight exactly (2^50 + 2^28) / (24 x 2^48) with no imaginary part, Pi Gamma(h) Pi = (w + i x) Pi to 1e-14 for
//     all 24, and sum_h Gamma(h) X_1 Gamma(h)^-1 = 0 exactly.
// CONTROLS (a failure makes the verdict partial at best).
//  C1 THE LEFT FIELD IS CAUGHT: the construction with left multiplication fails to commute with 48 Q_D.
//  C2 THE LEAK READER READS A FLAT FIELD AS STATIONARY: B's one-cycle leak in the trivial field is at most 1e-12.
//  C3 2T's SEVEN CHARACTERS ARE EXACTLY ORTHOGONAL (code/measure/hurwitz-gauge).
// READ, gating nothing: the Cayley Laplacian's C_R on the seven irreps, the mean magnetic count 2 - chi_2 of the triangles
//  (flat and Weyl fields), B's leak in the pure-gauge and a dilute field.
// Verdict: fail if G1, G2, I, H or S fails (H and S are predicted to); partial if a control fails; pass otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after the gate run). tmp/lf-probe2.log: every exact check held; the
//  Gauss weight read 1125900175278080 / 6755399441055744 = 1/6 + (2/3) 2^-24 with block gap 0; B's one-cycle leak 1.9e-14
//  (trivial), 7.5e-2 (Weyl), 7.8e-2 (pure gauge, where B is not the covariant sea) and 1.5e-2 (dilute 0.1).
//  tmp/lf-smoke2.log: every code path on another Weyl offset (0.61) and gauge function (0.17), the same verdict.
//
// FIRST RUN (tmp/lf-gate-E-FRC-0271.log, 0.5 s): FAIL on H and S, as derived. No gate moved and none was rerun.
//  - G1: the homomorphism holds over all 576 products (signs -1, 1, 1 on e_01, e_02, e_03), all five projector gaps 0,
//    the link covariance exact, the electric piece (exponents 0, 6, 6, 2, 5, 5, 4) a class function and exactly unitary,
//    chi_2 a class function. Every local 2T move commutes with every piece: Gauss's law for SU(2)+ holds exactly.
//  - G2: trace 16 + 8 chi_2 on all 24, 2 doublets and 4 singlets, 2 x 2 = 1 + 3.
//  - I: <chi_3, 1> = 0, <chi_3^2, 1> = 1, <chi_3^3, 1> = 2, C_R = 0, 12, 12, 4, 10, 10, 8: a lone triplet pair must
//    emit 3-flux, at least a triangle loop (electric count 3 x 4 = 12 in the unit's exponent), where the singlet needs 0.
//  - H fails: every Gamma(h) commutes with J.
//  - S fails: B leaks 7.53e-2 in one cycle of the Weyl field (1.9e-14 in the trivial field), and its per-dock Gauss
//    weight is (2^50 + 2^28) / (24 x 2^48) = 1/6 + (2/3) 2^-24 exactly, with Pi Gamma Pi = (w + i x) Pi to 0 and the
//    averaged X_1 exactly 0. Controls C1 (left gap 8), C2, C3 hold.
//  - READ: the Weyl field curves 0.956 of the 24,576 triangles, mean magnetic count 1.995 (0 in the trivial field).
//  THE AUDIT, as harshly as a stranger's. Everything here is L1: group theory and exact commutation that hold by the
//  construction, each with a control that fails when the construction is changed (the left field, the trivial leak). The
//  informative parts are the two negatives, that the field's isospin reading favors the singlet and that a local SU(2)+
//  removes the breaking sea from the physical sector, and neither is new physics (Gauss's law, Elitzur). What is new is
//  that the register rule carries them exactly, with a member that stays light (E-SPN-0180).
//
// DETERMINISM: no random numbers; fields and starts are golden-ratio Weyl streams. EXACT: the group, characters,
// Casimirs, 4 Gamma, the projectors, the electric piece (Z[w] over its denominator) and the Gauss weight (BigInt); the
// leak is float measurement.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { torus } from '@/code/measure/register-sea'
import {
  matMul,
  partnerProjector48,
  singletProjector24,
} from '@/code/measure/spinor-register'
import { chirality2 } from '@/code/measure/chiral-register'
import { IDENTITY_SLOTS, registerGap } from '@/code/measure/register-symmetry'
import {
  electricExact,
  hurwitzCasimirs,
  hurwitzCharacters,
} from '@/code/measure/hurwitz-gauge'
import {
  breakingGaussWeight,
  breakingLeak,
  covariantExact,
  exactGauge,
  gaugedField,
  gaugeFunction,
  magneticClassExact,
  neighbors,
  registerField,
  registerGauge,
  triangleCurvature,
  weylMember,
} from '@/code/measure/register-link-field'

const LIGHT: readonly [number, number] = [-1, 4]
const STATIONARY = 1e-12
const BLOCK = 1e-14

export type Su2GaugePlan = { L: number; offset: number; gaugeOffset: number }

export const GATE_PLAN: Su2GaugePlan = { L: 4, offset: 0.5, gaugeOffset: 0.29 }

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gauge/register-su2-gauge',
  code: 'E-FRC-0271',
  title:
    'the SU(2)+ gauge field on the register rule gives Gauss\'s law exactly and reads isospin, but joins no halves and selects no breaking sea, fail as derived: 2T acting on half + by right multiplication is an exact homomorphism commuting with every piece, the electric and magnetic pieces are class functions, so every local 2T move is a symmetry; a half + member carries two doublets and a half - member none; Gauss makes a triplet pair emit flux (the least a triangle loop) while a singlet needs none, so the field reads isospin with the sign that favors the symmetric sea; the field commutes with J, so no channel joins the halves; the breaking sea is not stationary in a curved field and lies in each dock\'s Gauss sector with weight exactly 1/6 + (2/3) 2^-24, its order parameter averaging to 0 there (Elitzur)',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return su2GaugeRun(GATE_PLAN)
  },
})

export function su2GaugeRun(plan: Su2GaugePlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const unit = ringUnit(LIGHT[0], LIGHT[1])
  const th = unitAngle(unit)
  const u: [number, number] = [Math.cos(th), Math.sin(th)]
  const G = registerGauge()
  const h2t = G.hurwitz
  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const chi2 = chirality2(G.J, 1)
  const ex = exactGauge(
    G,
    [S24, D48, matMul(D48, chi2), matMul(S24, chi2), chi2],
    registerGap,
    IDENTITY_SLOTS,
  )
  const t = torus(plan.L)
  const nb = neighbors(t)
  const weyl = registerField(t, nb, G, 'weyl', plan.offset)
  const trivial = registerField(t, nb, G, 'trivial')
  const h = gaugeFunction(t.sites.length, G.group.order, plan.gaugeOffset)
  const linkCovariant = covariantExact(weyl, gaugedField(weyl, G, h), G, h)
  const chars = hurwitzCharacters(h2t)
  const casimirs = hurwitzCasimirs(h2t, chars)
  const exponents = casimirs.map(c => c / 2)
  const electric = electricExact(h2t, chars, exponents, unit)
  const magnetic = magneticClassExact(G)
  const G1 =
    ex.homomorphism &&
    ex.projectorGaps.every(x => x === 0) &&
    linkCovariant &&
    electric.classFunction &&
    electric.unitary &&
    magnetic

  log(
    `G1 ${G1}: hom ${ex.homomorphism}, projector gaps ${ex.projectorGaps.join(' ')}, link covariance ${linkCovariant}, electric class ${electric.classFunction} unitary ${electric.unitary} (exponents ${exponents.join(' ')}), magnetic class ${magnetic}`,
  )

  // ---- the charge and the isospin read, exact integer character sums (chi_2 = W, chi_3 = W^2 - 1, W the doubled real part)
  const W = h2t.doubled.map(q => q[0]!)
  const inner = (f: (w: number) => number): number =>
    W.reduce((s, w) => s + f(w), 0) / 24
  const pairSinglet = inner(w => w * w)
  const pairTriplet = inner(w => w * w * (w * w - 1))
  const tripletAlone = inner(w => w * w - 1)
  const tripletLine = inner(w => (w * w - 1) ** 2)
  const tripletLoop = inner(w => (w * w - 1) ** 3)
  const G2 =
    ex.traceLaw &&
    ex.doublets === 2 &&
    ex.singlets === 4 &&
    pairSinglet === 1 &&
    pairTriplet === 1
  const c1 = casimirs[0]!
  const c3 = casimirs[6]!
  const I =
    tripletAlone === 0 && tripletLine === 1 && tripletLoop >= 1 && c1 === 0 && c3 > c1

  log(
    `G2 ${G2}: trace law ${ex.traceLaw}, doublets ${ex.doublets} singlets ${ex.singlets}, <chi2^2,1> ${pairSinglet} <chi2^2,chi3> ${pairTriplet}; I ${I}: <chi3,1> ${tripletAlone} <chi3^2,1> ${tripletLine} <chi3^3,1> ${tripletLoop}, C_R ${casimirs.join(' ')}`,
  )

  // ---- the halves ----
  const H = !ex.commutesJ

  // ---- the breaking sea ----
  const start = weylMember(t.sites.length, 0.3)
  const leakWeyl = breakingLeak(weyl, G, u, start)
  const leakTrivial = breakingLeak(trivial, G, u, start)
  const leakPure = breakingLeak(
    registerField(t, nb, G, 'pure-gauge', plan.offset),
    G,
    u,
    start,
  )
  const leakDilute = breakingLeak(
    registerField(t, nb, G, 'dilute', plan.offset, 0.1),
    G,
    u,
    start,
  )
  const gw = breakingGaussWeight(G)
  const expected = 2n ** 50n + 2n ** 28n
  const weightExact =
    gw.numerator === expected &&
    gw.imaginary === 0n &&
    gw.denominator === 24n * 2n ** 48n &&
    gw.blockGap <= BLOCK &&
    ex.averagedGenerator === 0
  const stationary = leakWeyl <= STATIONARY
  const inGauss = gw.numerator === gw.denominator
  const S = stationary && inGauss

  log(
    `H ${H} (J commutes ${ex.commutesJ}); S ${S}: leak Weyl ${leakWeyl.toExponential(3)}, trivial ${leakTrivial.toExponential(3)}, pure ${leakPure.toExponential(3)}, dilute ${leakDilute.toExponential(3)}; Gauss weight ${gw.numerator} / ${gw.denominator} = ${gw.value} (exact as derived ${weightExact}), block ${gw.blockGap.toExponential(1)}, averaged X1 ${ex.averagedGenerator}`,
  )

  // ---- controls and reads ----
  const C1 = ex.leftGap > 0
  const C2 = leakTrivial <= STATIONARY
  const C3 = chars.orthogonal
  const curvature = {
    trivial: triangleCurvature(trivial, G),
    weyl: triangleCurvature(weyl, G),
  }
  const hard = G1 && G2 && I && H && S
  const status = !hard ? 'fail' : !(C1 && C2 && C3) ? 'partial' : 'pass'

  return verdict({
    status,
    claim: `G1 ${G1} (Gauss exact: homomorphism, projector gaps ${ex.projectorGaps.join(' ')}, link covariance, electric and magnetic class functions) G2 ${G2} (2 doublets, 4 singlets, 2 x 2 = 1 + 3) I ${I} (<chi3,1> ${tripletAlone}, <chi3^2,1> ${tripletLine}, <chi3^3,1> ${tripletLoop}, C_3 ${c3} against C_1 ${c1}: the field reads isospin and charges the triplet) H ${H} (the field commutes with J: no channel joins the halves) S ${S} (the breaking sea leaks ${leakWeyl.toExponential(2)} a cycle in a curved field and lies in each dock's Gauss sector with weight ${gw.value.toPrecision(10)}, = 1/6 + (2/3) 2^-24 exactly ${weightExact}, its X_1 averaging to 0); controls C1 ${C1} C2 ${C2} C3 ${C3}`,
    metrics: {
      G1: flag(G1),
      G2: flag(G2),
      I: flag(I),
      H: flag(H),
      S: flag(S),
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      weightExact: flag(weightExact),
      gaussWeight: gw.value,
      leakWeyl,
      leakTrivial,
      c3,
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: flag(C1), C2: flag(C2), C3: flag(C3) },
    notes: `Unit ringUnit(${LIGHT.join(', ')}). L ${plan.L}, Weyl offset ${plan.offset}, gauge offset ${plan.gaugeOffset}. C_R on 1, 1', 1'', 2, 2', 2'', 3: ${casimirs.join(', ')}; electric exponents ${exponents.join(', ')}. Triangles: trivial curved ${curvature.trivial.curved.toFixed(4)} magnetic ${curvature.trivial.magnetic.toFixed(4)}, Weyl curved ${curvature.weyl.curved.toFixed(4)} magnetic ${curvature.weyl.magnetic.toFixed(4)} (of ${curvature.weyl.triangles}). B's leak: Weyl ${leakWeyl.toExponential(3)}, trivial ${leakTrivial.toExponential(3)}, pure gauge ${leakPure.toExponential(3)} (B is not the covariant sea there), dilute 0.1 ${leakDilute.toExponential(3)}. Exact: ${JSON.stringify(ex)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
