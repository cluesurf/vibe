// DOES THE REGISTER RULE TELL LEFT FROM RIGHT AT LONG WAVELENGTH, AND WHAT DOES IT KEEP WHILE IT DOES? (E-FRC-0267).
// The constraint "the knit tells left from right at long wavelength" is broken on the adopted knit: its rule keeps every
// orientation-reversing coin map, so it has no handedness (E-RLT-0070), a vacuum's stored points give it one hand with
// no hand preferred across layouts (E-RLT-0076), and the turning weave's handedness was lattice-scale only (E-FRC-0142,
// E-RLT-0046). This file reads the smallest change the notes hold that adds a hand, and checks it against the held
// constraints it could break.
//
// DIAGNOSIS (the cause, on the knit). Handedness at long wavelength needs a quantity odd under a reflection that
// survives at k -> 0. The knit's state is slots, and the 24 slots carry W(F4)'s root permutation, which a reflection maps
// to itself: every piece that is covariant under the rotations is covariant under the reflections too, so nothing odd
// survives (E-RLT-0070). A member needs an internal space on which a reflection acts differently from every rotation.
//
// THE CHANGE. The Cl+(4) register (E-SPN-0160) has one: J = right multiplication by the volume element splits it into
// two halves, kept by the 576 rotations and swapped by the 576 reflections (E-FRC-0258). Put E-SPN-0166's Wilson mixers on
// ONE half (the chiral variant, E-SPN-0168), covariant under the rotations only. On a slab the Wilson half has one Weyl
// doublet on each face and the other half none, so a face's chirality, summed over the halves, is +2 on face A and -2 on
// face B: a P-odd number read at the Weyl node, k -> 0. The husk parity that keeps the depth, P_h = diag(-1, -1, -1, 1),
// keeps each face and swaps the halves, so it maps this rule to the rule with the Wilson mixers on the other half, and
// the two read opposite hands on the same face (E-SPN-0168 P3 read the first; this file reads both and gates them).
//
// WHAT IT MUST NOT BREAK (the held constraints it touches), DERIVED BEFORE THE RUN.
// 1. ROTATION. The chiral pieces commute with the 576 rotations exactly, and with no reflection (a reflection maps Q_D P+
//    to Q_D P-). W+(F4) has W(F4)'s invariants in every degree below 24 (E-FRC-0258, Molien), so long-wave isotropy is
//    kept to the order W(F4) keeps it.
// 2. SPIN ONE HALF. W(F4) acts on the register by minors, which on even forms is conjugation rho(g) w = s w s~: the
//    lattice's own ("twisted") rotation, a genuine representation, so it reads integer spin (rho(g)^2 = 1 for a turn by
//    pi). But every q of the rule commutes with every right multiplication R(x) (E-FRC-0268), so the UNTWISTED rotation,
//    the slot permutation with L(s) = rho(g) R(s), commutes with the rule too. It is the spinor action: the lift of a turn
//    by pi in a coordinate plane is e_ij, and L(e_ij)^2 = -1. A full turn negates a member. (This is the Kaehler-Dirac
//    structure: the lattice rotates spin and taste together, and R, the taste, is internal.)
// 3. CHARGE. Every q commutes with J exactly, so the member number of each half is kept (N+ and N-).
// 4. CPT. For each half of the chiral Wilson bulk the spectrum at K is minus itself up to a rephasing of the conserved
//    half (E-FRC-0258 point 5): CPT with the proper parity -I.
//
// PREDICTED: every gate holds.
//
// GATES, fixed before the gate run.
//  P1 HANDEDNESS AT LONG WAVELENGTH. On E-SPN-0168's slab (L = 12 depth classes, the heavy unit ringUnit(-2, 5), the
//     Wilson mixers on half 0), the net Weyl chirality at k = 0 summed over the halves is +2 on face A and -2 on face B
//     (1e-3); with the Wilson mixers on half 1 instead (the P_h image), -2 on face A and +2 on face B (1e-3).
//  P2 ROTATIONS, NOT REFLECTIONS. The chiral projectors 96 Q_D P+ and 48 Q_S P+ commute exactly with each of the 576
//     rotations and with none of the 576 reflections; 24 Q_S and 48 Q_D commute with all 1,152.
//  P3 SPIN ONE HALF. For each of the 576 rotations: the lift s is unique up to sign (a null space of dimension 1), s s~ =
//     1 to 1e-12, L(s) = rho(g) R(s) to 1e-12, and the untwisted action commutes with every q of the rule (24 Q_S, 48 Q_D,
//     96 Q_D P+, 48 Q_S P+, 2 P+) to 1e-12. The turn by pi in the (0, 1) plane lifts to +-e_01 with L(e_01)^2 = -1
//     exactly, while rho(g)^2 = +1 exactly.
//  P4 CHARGE PER HALF. Every q commutes exactly with 2 P+.
//  P5 CPT. Over 16 Weyl momenta, each half of the chiral Wilson bulk has its spectrum at K equal to minus itself up to a
//     rephasing, to 1e-9.
// CONTROLS (a failure makes the verdict partial). C1 NO HAND WITHOUT THE CHANGE: the symmetric slab (Wilson on both
//  halves) reads face sums 0 and 0 (1e-3). C2 THE CHECK HAS TEETH: left multiplications by the bivectors do not commute
//  with 48 Q_D (a register map that is not a symmetry is caught).
// INSTRUMENT (a failure makes the verdict partial). I1 E-SPN-0166's recorded chiralities on the symmetric slab's half 0 at
//  step 0.01, 1.9999999999856668 and -1.9999999999834868, reproduced bit for bit.
// READ, gating nothing: every face's chirality per half, the in-gap count per half on the chiral slab, the covariance
//  counts, the CPT gaps.
// Verdict: fail if P1 to P5 fail; partial if a control or the instrument fails; pass otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them): tmp/bc-sym-probe.log checked P2 to P4's algebra on
// the 192 modes (every R(e_B) commutes with every q, gaps 0; L(e_B) fails on 48 Q_D with gap 4; 576 lifts with kernel 1,
// norm 2.2e-16, L = rho R to 1.2e-16, the untwisted commutator 4.4e-16; the pi turn's lift e_01, L^2 = -1, rho^2 = +1).
//
// FIRST RUN (tmp/bc-hand-gate-run1.log, 192 s): PASS, as predicted. No gate moved.
//  - P1: the chiral slab's faces read +2.000000 and -2.000000, all from half 0 (half 1 reads 0 and 0, with 0 in-gap
//    levels against 8); the mirror rule reads -2.000000 and +2.000000, all from half 1.
//  - P2: the chiral projectors keep 576 of 576 rotations and 0 of 576 reflections; Q_S and Q_D keep all 1,152.
//  - P3: 576 lifts, each a null space of dimension 1, s s~ = 1 to 2.2e-16, L(s) = rho(g) R(s) to 1.2e-16, the untwisted
//    action commutes with every q to 4.4e-16; the pi turn lifts to e_01, L(e_01)^2 = -1 and rho(g)^2 = +1 exactly.
//  - P4 exact. P5: CPT to 2.2e-15 and 1.8e-15 on the two halves.
//  - C1: the symmetric slab's faces 0 and 0 (each half +-2, opposite). C2: every left bivector fails on 48 Q_D (gap 4).
//    I1: E-SPN-0166's two chiralities bit for bit.
//
// DETERMINISM: no random numbers. EXACT: the projectors, J, the group and the blade multiplications are integer or dyadic
// matrices; the spin lifts and the spectra are floats, as measurement. NOTHING MOVES: the mixers act on a dock's own
// slots and register, and the stream takes each slot's value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { DOCK_ROOTS, type CMatrix } from '@/code/measure/dock-mixer'
import { weylMomenta } from '@/code/measure/singlet-kinematics'
import {
  commutesExactly,
  EVEN,
  f4Group,
  matMul,
  partnerProjector48,
  rangeBasis,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import {
  chirality2,
  det4,
  phaseMismatch,
  sectorBasis,
  sectorBlock,
  volumeRight,
} from '@/code/measure/chiral-register'
import { halfPhases, halfPieces } from '@/code/measure/chiral-flow'
import {
  wallChirality,
  wilsonSchedule,
  type HalfSet,
  type Slab,
} from '@/code/measure/wilson-register'
import {
  evenBlade,
  IDENTITY_SLOTS,
  leftMultiplication,
  mul8,
  registerGap,
  rightMultiplication,
  spinLift,
} from '@/code/measure/register-symmetry'

const HEAVY: readonly [number, number] = [-2, 5]
const RECORDED_CHI_A0 = 1.9999999999856668
const RECORDED_CHI_B0 = -1.9999999999834868
const CHI_TOLERANCE = 1e-3
const LIFT_TOLERANCE = 1e-12
const CPT_TOLERANCE = 1e-9

export type HandednessPlan = {
  wallL: number
  step: number
  window: number
  cptMomenta: number
}

export const GATE_PLAN: HandednessPlan = {
  wallL: 12,
  step: 0.01,
  window: 0.1,
  cptMomenta: 16,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gauge/register-handedness',
  code: 'E-FRC-0267',
  title:
    'the register rule tells left from right at long wavelength, and keeps rotation, spin one half, charge and CPT while it does: with the Wilson mixers on one register half (E-SPN-0168) the net Weyl chirality at k = 0 is +2 on face A and -2 on face B, and the husk parity that keeps the depth maps the rule to the one with the Wilson half swapped, which reads -2 and +2 on the same faces, where the symmetric slab reads 0 and 0; the chiral pieces commute exactly with the 576 rotations of W(F4) and with no reflection; every piece commutes with the right multiplications of Cl+(4), so beside the lattice rotation by minors (integer spin) the untwisted rotation L(s) = rho(g) R(s) is an exact symmetry, and a turn by pi lifts to e_01 with L(e_01)^2 = -1: a full turn negates a member; each half keeps its member number and CPT holds half by half',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerHandednessRun(GATE_PLAN)
  },
})

const unitValue = (kj: readonly [number, number]): [number, number] => {
  const t = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(t), Math.sin(t)]
}

export function registerHandednessRun(plan: HandednessPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const J = volumeRight()
  const chi2 = chirality2(J, 1)
  const chi2m = chirality2(J, -1)
  const DP96 = matMul(D48, chi2)
  const SP48 = matMul(S24, chi2)
  const ruleQ = [S24, D48, DP96, SP48, chi2]
  const qS = scaled(S24, 24)
  const qD = scaled(D48, 48)
  const pPlus = scaled(chi2, 2)
  const pMinus = scaled(chi2m, 2)
  const basis = sectorBasis(J)
  const uH = unitValue(HEAVY)
  const symmetric = wilsonSchedule(qS, qD, uH, { wilson: true })
  const trivial = wilsonSchedule(qS, qD, uH, { wilson: false })
  const chiral = wilsonSchedule(qS, qD, uH, { wilson: true, half: pPlus })
  const mirror = wilsonSchedule(qS, qD, uH, { wilson: true, half: pMinus })
  const setsOf = (P: CMatrix[], half: 0 | 1): HalfSet[] => [
    { pieces: halfPieces(trivial, basis, half).pieces },
    { pieces: halfPieces(P, basis, half).pieces },
  ]
  const rangesOf = (half: 0 | 1): { sR: number[][]; dR: number[][] } => ({
    sR: rangeBasis(
      sectorBlock({ re: qS, im: new Float64Array(qS.length) }, basis, half)
        .block.re,
      96,
    ),
    dR: rangeBasis(
      sectorBlock({ re: qD, im: new Float64Array(qD.length) }, basis, half)
        .block.re,
      96,
    ),
  })
  const ranges = [rangesOf(0), rangesOf(1)]
  const L = plan.wallL
  const slab: Slab = {
    L,
    qa: 1,
    p: 0,
    profile: Array.from({ length: L }, (_, c) => (c < L / 2 ? 1 : 0)),
  }
  const aDepths = new Set(
    [L / 2 - 3, L / 2 - 2, L / 2 - 1, L / 2, L / 2 + 1, L / 2 + 2].map(
      c => ((c % L) + L) % L,
    ),
  )

  // ---- P1 and C1: the faces ----
  type Face = { perHalf: number[][]; sums: number[]; inGap: number[] }

  const faces = (P: CMatrix[]): Face => {
    const reads = ([0, 1] as const).map(half =>
      wallChirality(
        slab,
        setsOf(P, half),
        DOCK_ROOTS,
        ranges[half]!.sR,
        ranges[half]!.dR,
        aDepths,
        plan.step,
        plan.window,
      ),
    )
    const perHalf = reads.map(r =>
      [0, 1].map(w =>
        r.walls[w] ? (r.walls[w] as { chirality: number }).chirality : 0,
      ),
    )

    return {
      perHalf,
      sums: [0, 1].map(w => perHalf[0]![w]! + perHalf[1]![w]!),
      inGap: reads.map(r => r.inGap),
    }
  }

  const fChiral = faces(chiral)

  log('chiral faces')

  const fMirror = faces(mirror)

  log('mirror faces')

  const fSym = faces(symmetric)

  log('symmetric faces')

  const near = (x: number, y: number): boolean =>
    Math.abs(x - y) <= CHI_TOLERANCE
  const P1 =
    near(fChiral.sums[0]!, 2) &&
    near(fChiral.sums[1]!, -2) &&
    near(fMirror.sums[0]!, -2) &&
    near(fMirror.sums[1]!, 2)
  const C1 = near(fSym.sums[0]!, 0) && near(fSym.sums[1]!, 0)
  const I1 =
    fSym.perHalf[0]![0] === RECORDED_CHI_A0 &&
    fSym.perHalf[0]![1] === RECORDED_CHI_B0

  // ---- P2: rotations, not reflections ----
  const group = f4Group()
  const rotations = group.filter(g => det4(g.matrix) === 1)
  const reflections = group.filter(g => det4(g.matrix) === -1)
  const chiralRot = [DP96, SP48].map(
    q => rotations.filter(g => commutesExactly(g, q)).length,
  )
  const chiralRef = [DP96, SP48].map(
    q => reflections.filter(g => commutesExactly(g, q)).length,
  )
  const symAll = [S24, D48].map(
    q => group.filter(g => commutesExactly(g, q)).length,
  )
  const P2 =
    group.length === 1152 &&
    rotations.length === 576 &&
    chiralRot.every(n => n === 576) &&
    chiralRef.every(n => n === 0) &&
    symAll.every(n => n === 1152)

  log('P2')

  // ---- P3: spin one half ----
  let kernelOk = true
  let normGap = 0
  let liftGap = 0
  let untwisted = 0

  for (const g of rotations) {
    const l = spinLift(g.matrix)

    kernelOk = kernelOk && l.kernel === 1
    normGap = Math.max(normGap, l.normGap)

    const Ls = leftMultiplication(l.s)
    const rhoR = mul8(g.register, rightMultiplication(l.s))

    liftGap = Math.max(
      liftGap,
      ...Ls.flatMap((row, i) =>
        row.map((x, j) => Math.abs(x - rhoR[i]![j]!)),
      ),
    )

    for (const q of ruleQ) {
      untwisted = Math.max(untwisted, registerGap(q, g.slots, Ls))
    }
  }

  const piTurn = rotations.find(g =>
    g.matrix.every((row, i) =>
      row.every((x, j) => x === (i === j ? (i < 2 ? -1 : 1) : 0)),
    ),
  )
  const e01 = evenBlade(EVEN.findIndex(b => b.join(',') === '0,1'))
  const piLift = piTurn ? spinLift(piTurn.matrix).s : []
  const isE01 =
    piLift.length === 8 &&
    piLift.every((x, i) => Math.abs(Math.abs(x) - e01[i]!) <= LIFT_TOLERANCE)
  const L01 = leftMultiplication(e01)
  const L2 = mul8(L01, L01)
  const rho2 = piTurn ? mul8(piTurn.register, piTurn.register) : []
  const minusOne = L2.every((row, i) =>
    row.every((x, j) => x === (i === j ? -1 : 0)),
  )
  const plusOne = rho2.every((row, i) =>
    row.every((x, j) => x === (i === j ? 1 : 0)),
  )
  const P3 =
    kernelOk &&
    normGap <= LIFT_TOLERANCE &&
    liftGap <= LIFT_TOLERANCE &&
    untwisted <= LIFT_TOLERANCE &&
    Boolean(piTurn) &&
    isE01 &&
    minusOne &&
    plusOne

  log('P3')

  // ---- P4: charge per half; C2: the check's teeth ----
  const P4 = ruleQ.every(q => registerGap(q, IDENTITY_SLOTS, J) === 0)
  const bivectors = EVEN.map((b, i) => ({ b, i })).filter(
    x => x.b.length === 2,
  )
  const leftGaps = bivectors.map(x =>
    registerGap(D48, IDENTITY_SLOTS, leftMultiplication(evenBlade(x.i))),
  )
  const C2 = leftGaps.every(g => g > 0)

  // ---- P5: CPT half by half on the chiral Wilson bulk ----
  const cptMomenta = weylMomenta(plan.cptMomenta)
  const cptGaps = ([0, 1] as const).map(half => {
    const pieces = halfPieces(chiral, basis, half).pieces

    let worst = 0

    for (const K of cptMomenta) {
      const ph = halfPhases(pieces, { q: 1, p: 0 }, K)

      worst = Math.max(
        worst,
        phaseMismatch(
          ph,
          ph.map(x => -x),
          true,
        ),
      )
    }

    return worst
  })
  const P5 = cptGaps.every(g => g <= CPT_TOLERANCE)

  log('P4 P5')

  const hard = P1 && P2 && P3 && P4 && P5
  const status = !hard ? 'fail' : !C1 || !C2 || !I1 ? 'partial' : 'pass'
  const faceLine = (f: Face): string =>
    `faces ${f.sums.map(x => x.toFixed(6)).join(', ')} (half 0 ${f.perHalf[0]!.map(x => x.toFixed(6)).join('/')}, half 1 ${f.perHalf[1]!.map(x => x.toFixed(6)).join('/')}; in-gap ${f.inGap.join('/')})`

  return verdict({
    status,
    claim: `P1 ${P1} (chiral ${faceLine(fChiral)}; mirror ${faceLine(fMirror)}) P2 ${P2} (chiral pieces keep ${chiralRot.join('/')} of 576 rotations and ${chiralRef.join('/')} of 576 reflections; Q_S, Q_D keep ${symAll.join('/')} of 1152) P3 ${P3} (576 lifts, kernel 1 ${kernelOk}, norm ${normGap.toExponential(1)}, L = rho R ${liftGap.toExponential(1)}, untwisted commutator ${untwisted.toExponential(1)}; the pi turn lifts to e_01 ${isE01}, L^2 = -1 ${minusOne}, rho^2 = +1 ${plusOne}) P4 ${P4} P5 ${P5} (CPT ${cptGaps.map(x => x.toExponential(1)).join(', ')}); controls C1 ${C1} (symmetric ${faceLine(fSym)}) C2 ${C2} (left bivector gaps ${leftGaps.join(' ')}); instrument I1 ${I1}`,
    metrics: {
      P1: flag(P1),
      P2: flag(P2),
      P3: flag(P3),
      P4: flag(P4),
      P5: flag(P5),
      C1: flag(C1),
      C2: flag(C2),
      I1: flag(I1),
      chiralFaceA: fChiral.sums[0]!,
      chiralFaceB: fChiral.sums[1]!,
      mirrorFaceA: fMirror.sums[0]!,
      mirrorFaceB: fMirror.sums[1]!,
      symmetricFaceA: fSym.sums[0]!,
      symmetricFaceB: fSym.sums[1]!,
      untwistedCommutator: untwisted,
      liftGap,
      cptGapMax: Math.max(...cptGaps),
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      C1: flag(C1),
      C2: flag(C2),
      I1: flag(I1),
    },
    notes: `L1 (the halves, the covariance, the spin lift, the untwisted rotation) and L2 (the slab's Weyl content, the spectra). Slab L ${L}, unit ringUnit(${HEAVY.join(', ')}), step ${plan.step}, window ${plan.window}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
