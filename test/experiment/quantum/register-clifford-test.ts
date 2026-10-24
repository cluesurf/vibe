// IS THE SUPERPOSED RULE'S BEAT A QUTRIT CLIFFORD CIRCUIT? (E-QTM-0183). Sigma(648) and the cube-root phases look like
// the qutrit Clifford group, and E-QTM-0117 showed the link group is exactly that group mod phases. If every piece of
// a beat were Clifford too, the qudit Gottesman-Knill theorem would simulate the rule in polynomial time and break the
// exact engine's four-hole wall (E-FND-0163, 6.0 GB on L = 4). This file tests every piece of the beat exactly.
//
// WHAT IS TESTED. A unitary G is Clifford when G P G^dag is a phase times one Pauli for every generator P = X_j, Z_j of
// the register (code/algebra/group/exact-clifford: the Pauli spread, the count of nonzero Pauli coefficients, is 1 on
// every generator). All arithmetic is exact in Q(zeta_9). The pieces (code/measure/rule-clifford), read from the rule's
// own gate code:
//   LINKS     all 648 elements of Sigma(648) on one qutrit (built by exact closure, code/measure/holonomy-caging), and
//             all 216 grid moves of code/rule/vibe-weave as permutations of the nine points, two qutrits (y, x)
//   KNIT      the coin on a vibe's direction (a qubit) and the line of two on two vibes' points (four qutrits), bare and
//             controlled by the direction (a qubit and four qutrits), with code/measure/rule-gates readRuleGates
//             confirming on the rule itself that these are the coin, meeting and phase it splits into
//   ROLES     the fear beat's like and unlike kernels on two roles (code/measure/role-register)
//   ENGINE    the register rule's phases in the exact engine (E-FND-0161, 0163): the member mixer ringUnit(-1, 4), the
//             sector string ringUnit(-2, 1) per unit of V for V = 1 to the cap 8, and the sector contact v^2 with
//             v = ringUnit(2, 0). A mixer 1 + (u - 1) Q has eigenvalues 1 and u, so it is Clifford in no dimension
//             unless u is a root of unity (the Clifford group is finite mod phases); in Q(omega) that is u^6 = 1. If
//             the trace u + conj u has a prime other than 2 or 3 in its denominator, no qubit or qutrit Clifford+T
//             circuit equals the piece exactly, on any ancillas (ringUnitReading's argument)
//
// DERIVED BEFORE THE RUN. The coin C = k 1 + x X (k = (1 + w)/2, x = (1 - w)/2) is a rotation by 2 pi / 3 about the X
// axis up to phase: it fixes X and sends Z to -Z / 2 plus a multiple of X Z, spread 2, so it is not Clifford. The line of
// two is a 1 + b SWAP with a b-bar purely imaginary: the coefficient of X (x) 1 in its image of X (x) 1 is |a|^2 = 1/4
// and of 1 (x) X is 3/4, so the spread is at least 2. The unlike kernel is Clifford-equivalent to a phase on |00>,
// degree 4 over F3, not Clifford (E-QTM-0118 found it level 4). The engine's ring units are rho^k w^j with
// rho = (3 + w)/(3 + conj w) and k nonzero, never roots of unity, with 7 in the trace's denominator.
// PREDICTED VERDICT: FAIL. The links are Clifford, and every piece that superposes is not.
//
// GATES, fixed before the gate run.
//  I  INSTRUMENT (a failure makes the verdict open): X, Z, the phase gate diag(1, 1, w), the Fourier matrix on one qutrit,
//     SUM and SWAP on two, and X, Z, CNOT, CZ on qubits are unitary and Clifford; the qutrit T gate and CCZ on three
//     qutrits are unitary and NOT Clifford; the six ring units ringUnit(0, j) read as roots of unity with residual
//     denominator 1.
//  R  THE GATES ARE THE RULE'S (a failure makes the verdict open): readRuleGates reads the coin, the meeting and the
//     phase off the rule.
//  A  LINKS: Sigma(648) closes at 648 elements, each unitary and Clifford; the 216 grid moves are each Clifford.
//  H  THE HYPOTHESIS: every KNIT and ROLES piece is Clifford and every ENGINE unit is a root of unity.
// Verdict: open if I or R fails; pass if A and H hold; fail otherwise (the beat is not a Clifford circuit).
//
// PROBE BEFORE THE GATE RUN, disclosed (tmp/clifford-probe-0183.ts): the controls read as stated (T spread 3, CCZ 9),
// the coin 1 and 2, the like kernel 8, the unlike kernel 6, the line of two 56 on every generator, controlled 82 on the
// direction's X, 1 on its Z and 112 elsewhere; the engine units are not roots of unity, with trace denominators 7 and
// 49. The gates above are qualitative (spread 1 or not) and were written from the derivation; the probe moved none.
//
// FIRST RUN (2026-10-24, tmp/run-0183.ts, 2.2 s): FAIL, as predicted. No gate moved and none was rerun.
//  - I: 10 of 10 Clifford controls pass, T (spread 3) and CCZ (spread 9) rejected, 6 of 6 units roots of unity.
//  - R: the coin, the meeting and the phase read off the rule.
//  - A: Sigma(648) closes at 648, all 648 Clifford; 216 of 216 grid moves Clifford (E-QTM-0117 held, now exactly).
//  - H: 0 of 5 superposing pieces Clifford (largest spread coin 2, line of two 56, controlled 112, like 8, unlike 6);
//    0 of 10 engine phases roots of unity, all 10 with 7 or 49 in the trace's denominator (the mixer's trace -13/7).
// WHAT IT MEANS. Stabilizer simulation cannot carry the rule past four holes. The links are Clifford, so a link
// changes no stabilizer cost, and the non-Clifford part sits in exactly the pieces that make amplitudes: the coin, the
// meeting and the fear beat in the knit, the mixer and the pair phases in the exact engine. The engine's phases are
// not even in a finite group, so no Clifford+T compilation is exact and a stabilizer-rank method would pay for every
// mixer of every dock every beat. The lever left is the one E-FND-0163 already uses: the one-body part is free
// fermions (a Slater determinant at any hole count), so the interaction phases are the only non-Gaussian part.
//
// Depth L1: exact algebra on the rule's own gates. DETERMINISM: no random numbers. NOTHING MOVES: each piece is read as
// the operator it is on the register of one line of one dock.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  cliffordReading,
  QUBIT_CNOT,
  QUBIT_CZ,
  QUBIT_X,
  QUBIT_Z,
  QUTRIT_CCZ,
  QUTRIT_CLOCK,
  QUTRIT_PHASE,
  QUTRIT_SHIFT,
  QUTRIT_SUM,
  QUTRIT_SWAP,
  QUTRIT_T,
  ringUnitReading,
  sparseFromDense,
  type Register,
  type SparseOperator,
} from '@/code/algebra/group/exact-clifford'
import {
  gridMoveOperator,
  likeKernelOperator,
  ruleCoinOperator,
  ruleMeetingOperator,
  unlikeKernelOperator,
} from '@/code/measure/rule-clifford'
import { FOURIER_EXACT, sigmaElements } from '@/code/measure/holonomy-caging'
import { readRuleGates } from '@/code/measure/rule-gates'
import { ringUnit } from '@/code/measure/swap-string'
import { gridMoves } from '@/code/rule/vibe-weave'

type Case = { name: string; register: Register; gate: SparseOperator }

const SIGMA_ORDER = 648
const GRID_MOVES = 216
const STRING_CAP = 8

// the engine's ring units as [k, j] of ringUnit(k, j): the mixer, the string per unit of V (k -2 V, j V), the contact v^2
const MIXER: readonly [number, number] = [-1, 4]
const CONTACT: readonly [number, number] = [4, 0]

export default experiment({
  id: 'quantum/register-clifford-test',
  code: 'E-QTM-0183',
  title:
    "explores whether the superposed rule's beat is a qutrit Clifford circuit: the links are, every piece that superposes is not",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const reading = (c: Case): ReturnType<typeof cliffordReading> =>
      cliffordReading({ register: c.register, gate: c.gate })

    // I: the instrument
    const cliffordControls: Case[] = [
      { name: 'qutrit X', register: [3], gate: QUTRIT_SHIFT },
      { name: 'qutrit Z', register: [3], gate: QUTRIT_CLOCK },
      { name: 'qutrit phase', register: [3], gate: QUTRIT_PHASE },
      { name: 'qutrit Fourier', register: [3], gate: sparseFromDense(FOURIER_EXACT) },
      { name: 'SUM', register: [3, 3], gate: QUTRIT_SUM },
      { name: 'qutrit SWAP', register: [3, 3], gate: QUTRIT_SWAP },
      { name: 'qubit X', register: [2], gate: QUBIT_X },
      { name: 'qubit Z', register: [2], gate: QUBIT_Z },
      { name: 'CNOT', register: [2, 2], gate: QUBIT_CNOT },
      { name: 'CZ', register: [2, 2], gate: QUBIT_CZ },
    ]
    const magicControls: Case[] = [
      { name: 'qutrit T', register: [3], gate: QUTRIT_T },
      { name: 'CCZ', register: [3, 3, 3], gate: QUTRIT_CCZ },
    ]
    const cliffordRead = cliffordControls.map(reading)
    const magicRead = magicControls.map(reading)
    const unitRead = [0, 1, 2, 3, 4, 5].map(j => {
      const u = ringUnit(0, j)

      return ringUnitReading({ a: u.num[0], b: u.num[1], d: u.den })
    })
    const instrument =
      cliffordRead.every(r => r.unitary && r.clifford) &&
      magicRead.every(r => r.unitary && !r.clifford) &&
      unitRead.every(r => r.normOne && r.rootOfUnity && r.residualDenominator === 1n)

    // R: the gates are the rule's
    const ruleGates = readRuleGates()
    const gatesAreTheRules = ruleGates.coin && ruleGates.meeting && ruleGates.phase

    // A: the links
    const sigma = sigmaElements()
    const sigmaRead = sigma.elements.map(e =>
      cliffordReading({ register: [3], gate: sparseFromDense(e) }),
    )
    const sigmaClifford = sigmaRead.filter(r => r.unitary && r.clifford).length
    const moves = gridMoves()
    const moveClifford = moves.act.filter(
      t => cliffordReading({ register: [3, 3], gate: gridMoveOperator(t) }).clifford,
    ).length
    const linksClifford =
      sigma.closed &&
      sigma.elements.length === SIGMA_ORDER &&
      sigmaClifford === SIGMA_ORDER &&
      moves.act.length === GRID_MOVES &&
      moveClifford === GRID_MOVES

    // H: the pieces that superpose
    const coin = ruleCoinOperator()
    const meeting = ruleMeetingOperator(null)
    const controlled = ruleMeetingOperator('R')
    const pieces: Case[] = [
      { name: 'coin', register: coin.register, gate: coin.operator },
      { name: 'line of two', register: meeting.register, gate: meeting.operator },
      {
        name: 'controlled line of two',
        register: controlled.register,
        gate: controlled.operator,
      },
      { name: 'like kernel', register: [3, 3], gate: likeKernelOperator() },
      { name: 'unlike kernel', register: [3, 3], gate: unlikeKernelOperator() },
    ]
    const pieceRead = pieces.map(reading)
    const piecesUnitary = pieceRead.every(r => r.unitary)
    const cliffordPieces = pieceRead.filter(r => r.clifford).length

    const engineUnits: { name: string; kj: readonly [number, number] }[] = [
      { name: 'mixer', kj: MIXER },
      ...Array.from({ length: STRING_CAP }, (_, i) => ({
        name: `string V ${i + 1}`,
        kj: [-2 * (i + 1), i + 1] as const,
      })),
      { name: 'contact', kj: CONTACT },
    ]
    const engineRead = engineUnits.map(e => {
      const u = ringUnit(e.kj[0], e.kj[1])

      return ringUnitReading({ a: u.num[0], b: u.num[1], d: u.den })
    })
    const engineNormOne = engineRead.every(r => r.normOne)
    const engineRoots = engineRead.filter(r => r.rootOfUnity).length
    const engineOutsideCliffordT = engineRead.filter(
      r => r.residualDenominator !== 1n,
    ).length

    const hypothesis =
      piecesUnitary &&
      cliffordPieces === pieces.length &&
      engineNormOne &&
      engineRoots === engineUnits.length

    const status =
      !instrument || !gatesAreTheRules
        ? 'open'
        : linksClifford && hypothesis
          ? 'pass'
          : 'fail'

    const spread = (name: string): number =>
      pieceRead[pieces.findIndex(p => p.name === name)]!.largest
    const mixer = engineRead[0]!

    return verdict({
      status,
      claim:
        status === 'fail'
          ? `the beat is not a Clifford circuit: all ${sigmaClifford} elements of Sigma(648) and all ${moveClifford} grid moves are Clifford, but ${pieces.length - cliffordPieces} of ${pieces.length} superposing pieces are not (largest Pauli spread: coin ${spread('coin')}, line of two ${spread('line of two')}, controlled ${spread('controlled line of two')}, like kernel ${spread('like kernel')}, unlike kernel ${spread('unlike kernel')}), and ${engineUnits.length - engineRoots} of ${engineUnits.length} engine phases are not roots of unity (the mixer's trace ${mixer.traceNumerator}/${mixer.traceDenominator}), so they have infinite order mod phases and ${engineOutsideCliffordT} of them equal no Clifford+T circuit exactly`
          : status === 'pass'
            ? 'every piece of the beat is Clifford: the rule is a qutrit Clifford circuit'
            : 'the instrument or the reading of the rule failed, so no verdict on the hypothesis',
      metrics: {
        sigmaElements: sigma.elements.length,
        sigmaClifford,
        gridMoves: moves.act.length,
        gridMovesClifford: moveClifford,
        piecesTested: pieces.length,
        piecesClifford: cliffordPieces,
        coinSpread: spread('coin'),
        lineOfTwoSpread: spread('line of two'),
        controlledLineOfTwoSpread: spread('controlled line of two'),
        likeKernelSpread: spread('like kernel'),
        unlikeKernelSpread: spread('unlike kernel'),
        engineUnits: engineUnits.length,
        engineRootsOfUnity: engineRoots,
        engineOutsideCliffordT,
        mixerTraceDenominator: Number(mixer.traceDenominator),
      },
      control: {
        cliffordControls: cliffordControls.length,
        cliffordControlsPassing: cliffordRead.filter(r => r.unitary && r.clifford).length,
        magicControls: magicControls.length,
        magicControlsRejected: magicRead.filter(r => r.unitary && !r.clifford).length,
        qutritTSpread: magicRead[0]!.largest,
        cczSpread: magicRead[1]!.largest,
        unitsRootsOfUnity: unitRead.filter(r => r.rootOfUnity).length,
        ruleGatesRead: [ruleGates.coin, ruleGates.meeting, ruleGates.phase].filter(Boolean).length,
      },
      notes:
        'Stabilizer simulation cannot run this rule: the non-Clifford part is supplied by every piece that superposes (the coin, the meeting, the fear beat), and in the exact engine by the member mixer and the pair phases, whose angles are irrational multiples of pi, so no Clifford+T compilation is exact. The engine\'s one-body part is a free-fermion (Gaussian) evolution, which E-FND-0163 already follows as a Slater determinant at any hole count; the interaction phases are its only non-Gaussian part.',
    })
  },
})
