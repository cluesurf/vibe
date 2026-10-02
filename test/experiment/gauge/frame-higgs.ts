// IS THE FRAME THE HIGGS? (E-FRC-0277, the first route of "G · the Higgs mechanism" in
// note/research/vibe/roadmap/routes/matter-forces-numbers.md, and decision 1 in gaps.md). Nothing breaks SU(2)+
// (E-FRC-0268): every gauge-invariant operator holds an even number of half + fields, because the center of SU(2)+ acts
// as -J (E-FRC-0273), so a Higgs needs a scalar odd under that center, and the rule has none. The route, from Nesti and
// Percacci's graviweak unification: a slot direction is a 4-vector, the (2, 2) of the two SU(2)s; right multiplication by
// -1 sends every slot to its opposite, which is the W(F4) element -I. If SU(2)+'s center acts on the dock as that same
// element, the slot frame, nonzero wherever there is a mesh, is a center-odd field with a value, and decision 1's scalar
// is already present.
//
// HOW THE RULE COUPLES THE TWO, read before the run. A member's state is (slot d, register w): 24 x 8 = 192 modes, w in
// Cl+(4) = H+ + H- (E-SPN-0160). The rule's pieces are P = X (1 + sum (u_k - 1) q_k): X sends every slot to its opposite
// and keeps the register (code/measure/spinor-register registerPiece), and the q_k are Q_S, Q_D and J = R(vol). W(F4) acts
// on the 192 modes as its slot permutation times its action on even forms by minors (evenAction, the "twisted" rotation,
// rho(-1) = 1), so the rule's own -I is X (x) 1. SU(2)+ is right multiplication R(x) by the norm-one x of H+, acting as
// 1 (x) R(x): no slot moves (E-FRC-0268 calls it internal). The spinor ("untwisted") rotation L(s) = rho(g) R(s) of
// code/measure/register-symmetry is the third action named here: for -I its lifts are s = +-vol.
//
// HYPOTHESES, written before any run of this file.
//  H1 THE CENTER IS -I. The SU(2)+ center element C+ (exp(pi X) for a generator X of SU(2)+, built from the package's
//     Y_k = R(e_0k) (1 + J)), as it acts on the 192 modes, equals the W(F4) element -I as the package acts with it: the
//     same slot permutation and the same 8 x 8 register matrix, exactly. Asked of all 1,152 elements: some element of
//     W(F4) acts on the dock exactly as C+ does.
//  H2 A SLOT DIRECTION IS ODD AND HAS A VALUE. The observable is the dock's slot quaternion, the one-body operators
//     O_i = sum_d r_(d, i) n_(d, a) (r_d the slot's root, i = 0..3, summed over the register index a): O_i is odd under
//     C+ (C+ O_i C+^-1 = -O_i exactly), and its expectation in the vacuum, the full sea of E-FRC-0268 (its working
//     vacuum, every mode filled), is nonzero.
//  P  FALSIFIER: H1 fails because SU(2)+ acts only on the register, which no slot permutation touches. Then the frame is
//     NOT the Higgs as a reading of the rule: making it one is a new piece (an identification of SU(2)+ with right
//     multiplication on the slots). Both outcomes decide decision 1's options: H1 holding would make the frame route a
//     reading of the present rule; P makes the frame one more candidate for the added scalar, beside the bidoublet.
//  PREDICTED: P. H1 fails (C+ moves no slot, and W(F4)'s twisted action fixes the scalar blade while C+ sends it to
//     -vol), and H2 fails twice (O_i acts on slots only, so it commutes with C+; and the full sea is invariant under the
//     permutation X (x) 1, which sends O_i to -O_i, so its expectation is 0).
//
// READ, gating nothing (what the comparison finds beside the yes or no). R1 the spinor lift of -I: s = +-vol exactly, and
//  L(-vol) on the register equals C+ exactly, so C+ IS the register part of the untwisted -I, and C+ = (untwisted -I)
//  (twisted -I)^-1 on the 192 modes. R2 the rotations whose spin lift is central (in span{1, vol}, the only lifts whose
//  left multiplication is also a right one): predicted 2 of 576 (+-I). R3 the twisted actions that are right
//  multiplications at all: predicted 2 of 1,152 (+-I, both the identity on the register). R4 both X (x) 1 and 1 (x) C+
//  commute with the rule's Q_S, Q_D and 1 + J (gaps 0): two distinct symmetries of the rule.
// CONTROLS (a failure makes the verdict partial). C1 THE ODDNESS TEST CAN SAY YES: O_i is odd under X (x) 1 exactly, and
//  every det -1 element of W(F4) acts on the register by a C+-odd matrix (C+ rho C+ = -rho: mirrors swap the halves),
//  576 of 576, while every det +1 element is C+-even, 576 of 576. C2 THE COMPARISON CAN SAY EQUAL: exactly one element
//  acts as the identity, and the element with matrix -I acts exactly as (OPPOSITE, 1), the rule's X.
// INSTRUMENT. I1 the generators obey X_k^2 = -P+, X_k P- = 0 exactly, so exp(theta X) = P- + cos theta P+ + sin theta X and
//  C+ = P- - P+; C+ is a right multiplication (C+ = R(C+ 1)), squares to 1, commutes with every X_k, and equals -J.
//  I2 OPPOSITE[d] is the slot with root -r_d for all 24.
// VERDICT, fixed before the run: FAIL when H1 or H2 fails (the predicted outcome, P); PASS when both hold; PARTIAL when a
// control or the instrument fails.
//
// FIRST RUN (tmp/gq-frame-run1.log, 1 s): FAIL as derived, P holds, no gate moved.
//  - H1: 0 of 1,152 elements act on the 192 modes as C+, and 0 carry C+'s register matrix with any slot map. The element
//    -I acts as the slot reversal OPPOSITE times the identity on the register (C2).
//  - H2: the slot quaternion is even under C+ and odd under X x 1; its full-sea value is 0, 0, 0, 0.
//  - R1: +-vol lifts -I and L(-vol) = C+ exactly. R2: 2 of 576 rotations have a central lift. R3: 2 of 1,152 twisted
//    actions are right multiplications. R4: both X x 1 and 1 x C+ commute with Q_S, Q_D and 1 + J (gaps 0).
//  - C1: 576 of 576 mirrors are C+-odd, 576 of 576 rotations C+-even. I1, I2 hold.
// WHAT IT MEANS. The rule carries two different "-1"s. Its own -I (the swap coin's X) reverses the slots and leaves the
// register alone; SU(2)+'s center flips half + and moves no slot. A slot direction is odd under the first and blind to the
// second, so the frame carries no SU(2)+ center charge and the gauge-invariance argument of E-FRC-0273 is untouched. The
// two meet only in the spinor -I, X x C+, whose register part is exactly C+. Nesti and Percacci's identification is a
// gauged group that is the DIAGONAL of SU(2)+ on the register and right multiplication on the slots, whose center is that
// spinor -I, and under it every slot field is odd. That is a new piece, and on the slots only the 24 units of 2T act
// (right multiplication by a unit outside 2T sends a slot off the mesh), so the diagonal is at most a 2T, not an SU(2).
// Decision 1 keeps both options: the frame enters only as such a piece, beside the bidoublet scalar. Even then the full sea's value is the
// measured 0 (Tr O_i = 8 sum_d r_(d, i) = 0, whatever acts on the register): a value needs a vacuum that fills the slots
// unevenly, one that breaks the dock's point reflection.
//
// PRIOR ART: Nesti and Percacci 2008 (graviweak unification, J. Phys. A 41, 075405); Lisi 2007 (arXiv 0711.0770);
// Spin(4) = SU(2) x SU(2) with -I lifting to (-1, 1) and (1, -1) (every text on Clifford algebras, e.g. Lawson and
// Michelsohn, Spin Geometry, ch. I).
//
// Depth L1: exact linear algebra on the package's own representation. DETERMINISM: no random numbers. EXACT: blades,
// projectors and group actions are integer or dyadic matrices; the spin lifts of R2 are floats, as measurement.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { EVEN, f4Group, matMul, partnerProjector48, singletProjector24 } from '@/code/measure/spinor-register'
import { chirality2, det4, volumeRight } from '@/code/measure/chiral-register'
import {
  bladeElement,
  evenBlade,
  IDENTITY_SLOTS,
  leftMultiplication,
  mul8,
  multiply,
  registerGap,
  reverse,
  rightMultiplication,
  spinLift,
} from '@/code/measure/register-symmetry'

const SLOTS = 24
const REG = 8
const MODES = SLOTS * REG
const LIFT_TOLERANCE = 1e-9

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gauge/frame-higgs',
  code: 'E-FRC-0277',
  title:
    "the slot frame is not the Higgs on the present rule, fail as derived: SU(2)+'s center acts on the dock as 1 x (-J), moving no slot, and no element of W(F4) acts that way (0 of 1,152; the rule's -I is the slot reversal times 1 on the register); the dock's slot quaternion is odd under -I and even under the SU(2)+ center, and its full-sea expectation is 0; the center is exactly the register part of -I's spinor lift (L(-vol) = -J), so a frame that carried SU(2)+ charge needs the spinor -I to be the rule's own, a new piece",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return frameHiggsRun()
  },
})

type M8 = number[][]

const I8: M8 = EVEN.map((_, i) => EVEN.map((__, j) => (i === j ? 1 : 0)))
const same8 = (a: M8, b: M8, k = 1): boolean => a.every((row, i) => row.every((x, j) => x === k * b[i]![j]!))
const add8 = (a: M8, b: M8, k = 1): M8 => a.map((row, i) => row.map((x, j) => x + k * b[i]![j]!))
const scale8 = (a: M8, k: number): M8 => a.map(row => row.map(x => x * k))
const sameSlots = (a: ArrayLike<number>, b: ArrayLike<number>): boolean =>
  Array.from({ length: SLOTS }, (_, d) => a[d] === b[d]).every(Boolean)

// the one-body operator O_i on the 192 modes, diagonal: r_(d, i) on every (d, a)
const slotQuaternion = (i: number): Float64Array => {
  const o = new Float64Array(MODES * MODES)

  for (let d = 0; d < SLOTS; d++) {
    for (let a = 0; a < REG; a++) {
      const m = d * REG + a

      o[m * MODES + m] = DOCK_ROOTS[d]![i]!
    }
  }

  return o
}

// g O g^-1 for g = (slot map, register matrix m) with m orthogonal (m^-1 = m^T): entry ((s d, a), (s e, b)) is
// sum_(c, c') m[a][c] O[(d, c), (e, c')] m[b][c']
function conjugated(o: Float64Array, slots: ArrayLike<number>, m: M8): Float64Array {
  const out = new Float64Array(MODES * MODES)

  for (let d = 0; d < SLOTS; d++) {
    for (let e = 0; e < SLOTS; e++) {
      for (let a = 0; a < REG; a++) {
        for (let b = 0; b < REG; b++) {
          let s = 0

          for (let c = 0; c < REG; c++) {
            for (let c2 = 0; c2 < REG; c2++) {
              s += m[a]![c]! * o[(d * REG + c) * MODES + e * REG + c2]! * m[b]![c2]!
            }
          }

          out[(slots[d]! * REG + a) * MODES + slots[e]! * REG + b] = s
        }
      }
    }
  }

  return out
}

const sameOperator = (a: Float64Array, b: Float64Array, k: number): boolean => a.every((x, i) => x === k * b[i]!)

export function frameHiggsRun(): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

  // ---------------- the SU(2)+ center, I1 ----------------
  const J = volumeRight()
  const Pp = scale8(add8(I8, J), 1 / 2)
  const Pm = scale8(add8(I8, J, -1), 1 / 2)
  const idx = (b: string): number => EVEN.findIndex(x => x.join(',') === b)
  const generators = ['0,1', '0,2', '0,3'].map(b => mul8(rightMultiplication(evenBlade(idx(b))), Pp))
  const theta = Math.PI
  const Cplus = add8(add8(Pm, scale8(Pp, Math.round(Math.cos(theta)))), scale8(generators[0]!, Math.round(Math.sin(theta))))
  const asRight = rightMultiplication(Cplus.map(row => row[0]!))
  const I1 =
    generators.every(X => same8(mul8(X, X), Pp, -1) && same8(mul8(X, Pm), scale8(I8, 0))) &&
    same8(Cplus, add8(Pm, Pp, -1)) &&
    same8(asRight, Cplus) &&
    same8(mul8(Cplus, Cplus), I8) &&
    generators.every(X => same8(mul8(Cplus, X), mul8(X, Cplus))) &&
    same8(Cplus, J, -1) &&
    !same8(Cplus, I8) &&
    !same8(Cplus, I8, -1)
  const I2 = DOCK_ROOTS.every((r, d) => DOCK_ROOTS[OPPOSITE[d]!]!.every((x, i) => x === -r[i]!))

  // ---------------- H1: which element of W(F4) acts as C+ ----------------
  const G = f4Group()
  const actsAsCenter = G.filter(g => sameSlots(g.slots, IDENTITY_SLOTS) && same8(g.register, Cplus))
  const registerIsCenter = G.filter(g => same8(g.register, Cplus))
  const minusI = G.find(g => g.matrix.every((row, i) => row.every((x, j) => x === (i === j ? -1 : 0))))
  const minusIActsAsCenter =
    minusI !== undefined && sameSlots(minusI.slots, IDENTITY_SLOTS) && same8(minusI.register, Cplus)
  const H1 = actsAsCenter.length > 0 && minusIActsAsCenter

  log('H1')

  // ---------------- C2: the comparison can say equal ----------------
  const identities = G.filter(g => sameSlots(g.slots, IDENTITY_SLOTS) && same8(g.register, I8)).length
  const minusIIsX = minusI !== undefined && sameSlots(minusI.slots, OPPOSITE) && same8(minusI.register, I8)
  const C2 = identities === 1 && minusIIsX

  // ---------------- H2: the slot quaternion ----------------
  const O = [0, 1, 2, 3].map(slotQuaternion)
  const underCenter = O.map(o => conjugated(o, IDENTITY_SLOTS, Cplus))
  const oddUnderCenter = underCenter.every((x, i) => sameOperator(x, O[i]!, -1))
  const evenUnderCenter = underCenter.every((x, i) => sameOperator(x, O[i]!, 1))
  const underX = O.map(o => conjugated(o, OPPOSITE, I8))
  const oddUnderX = underX.every((x, i) => sameOperator(x, O[i]!, -1))
  const seaValue = O.map(o => Array.from({ length: MODES }, (_, m) => o[m * MODES + m]!).reduce((s, x) => s + x, 0))
  const H2 = oddUnderCenter && seaValue.some(v => v !== 0)

  log('H2')

  // ---------------- C1: the oddness test can say yes ----------------
  const mirrors = G.filter(g => det4(g.matrix) === -1)
  const turns = G.filter(g => det4(g.matrix) === 1)
  const centerConj = (m: M8): M8 => mul8(mul8(Cplus, m), Cplus)
  const oddMirrors = mirrors.filter(g => same8(centerConj(g.register), g.register, -1)).length
  const evenTurns = turns.filter(g => same8(centerConj(g.register), g.register)).length
  const C1 = oddUnderX && oddMirrors === mirrors.length && evenTurns === turns.length && mirrors.length === 576

  // ---------------- reads ----------------
  const vol = bladeElement([0, 1, 2, 3])
  const minusVol = vol.map(x => -x)
  const liftsMinusI = [0, 1, 2, 3].every(i => {
    const v = bladeElement([i])
    const image = multiply(multiply(vol, v), reverse(vol))

    return image.every((x, k) => x === -v[k]!)
  })
  const R1 = liftsMinusI && same8(leftMultiplication(minusVol.slice(0, REG)), Cplus)
  const centralIndex = new Set([idx(''), idx('0,1,2,3')])
  const centralLifts = turns.filter(g => {
    const lift = spinLift(g.matrix)

    return lift.kernel === 1 && lift.s.every((x, b) => centralIndex.has(b) || Math.abs(x) < LIFT_TOLERANCE)
  }).length
  const rightTwisted = G.filter(g => same8(rightMultiplication(g.register.map(row => row[0]!)), g.register)).length
  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const chi = chirality2(J, 1)
  const ruleQ = [S24, D48, matMul(D48, chi), chi]
  const gapX = Math.max(...ruleQ.map(q => registerGap(q, Int32Array.from(OPPOSITE), I8)))
  const gapCenter = Math.max(...ruleQ.map(q => registerGap(q, IDENTITY_SLOTS, Cplus)))

  log('reads')

  const hard = H1 && H2
  const status: Verdict['status'] = !(C1 && C2 && I1 && I2) ? 'partial' : hard ? 'pass' : 'fail'

  return verdict({
    status,
    claim: `H1 ${H1} (elements of W(F4) acting on the 192 modes exactly as C+ = 1 x (-J): ${actsAsCenter.length} of ${G.length}; with C+'s register matrix at all, whatever their slots: ${registerIsCenter.length}; the element -I acts as slot reversal ${minusIIsX} times the identity on the register); H2 ${H2} (the slot quaternion O_i: odd under C+ ${oddUnderCenter}, even under C+ ${evenUnderCenter}, odd under the rule's X x 1 ${oddUnderX}; full-sea values ${seaValue.join(', ')}); P holds: SU(2)+ acts only on the register; reads R1 ${R1} (s = +-vol lifts -I, and L(-vol) = C+ exactly: the center is the register part of the spinor -I) R2 ${centralLifts} of ${turns.length} rotations have a central spin lift R3 ${rightTwisted} of ${G.length} twisted actions are right multiplications R4 the rule's projectors commute with X x 1 (gap ${gapX}) and with 1 x C+ (gap ${gapCenter}); controls C1 ${C1} (mirrors C+-odd ${oddMirrors} of ${mirrors.length}, rotations C+-even ${evenTurns} of ${turns.length}) C2 ${C2} (identities ${identities}); instrument I1 ${I1} I2 ${I2}`,
    metrics: {
      H1: flag(H1),
      H2: flag(H2),
      C1: flag(C1),
      C2: flag(C2),
      I1: flag(I1),
      I2: flag(I2),
      R1: flag(R1),
      actsAsCenter: actsAsCenter.length,
      registerIsCenter: registerIsCenter.length,
      oddUnderCenter: flag(oddUnderCenter),
      evenUnderCenter: flag(evenUnderCenter),
      oddUnderX: flag(oddUnderX),
      seaValueMax: Math.max(...seaValue.map(Math.abs)),
      centralLifts,
      rightTwisted,
      oddMirrors,
      evenTurns,
      gapX,
      gapCenter,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      oddUnderX: flag(oddUnderX),
      oddMirrors,
      identities,
    },
    notes: `L1. C+ is -J: on half + (J = +1) it is -1, on half - it is +1. The rule's -I is X x 1, which commutes with C+; the spinor -I with lift -vol is X x C+, the product of the two. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
