// The perturbation-audit harness, the standing attack, demonstrated and self-validated. The
// method frontier asks for a runner that fails any result whose booleans are not each traced to
// a substrate cause plus a live control. The gate (perturbation-audit.ts) grants an audited pass
// only when a result is durable (holds nominally and under an irrelevant perturbation) and its
// control is live (fails under the relevant perturbation, the one that removes its cause). The
// harness itself is only trustworthy if it PASSES a known-durable result and FAILS a known-
// circular one, so this experiment validates it on both.
//
// The durable case is the emergent complex unit i (E-FND-0062). The signed tone alternation
// [+1, -1] carried by the beat swap gives an iterant e with e^2 = minus the identity. Nominal it
// holds. Under an IRRELEVANT perturbation, a change of basis (a similarity transform), it still
// holds, e^2 is basis independent. Under the RELEVANT perturbation, the unsigned tone alphabet
// [0, 1], it FAILS (e^2 is the zero matrix, not minus the identity), a live control. So the
// harness must grant it an audited pass.
//
// The circular case is a claim true for every iterant regardless of the substrate: the trace of
// the iterant is zero. It holds nominally, it holds under the basis change, and it also holds for
// the unsigned control (the trace of any off-diagonal iterant is zero). So its control is dead,
// it is traced to nothing substrate-specific, and the harness must FAIL it as circular.
//
// The harness passes the durable result and fails the circular one, so it is a real gate, not a
// rubber stamp. This is the mechanism that lets other results reach an audited grade.
//
// Depth L2. It measures the audit gate on two real substrate claims, one durable and one circular,
// and confirms the gate discriminates them, the perturbation-audit method made concrete.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { auditResult } from '@/code/tool/perturbation-audit'

type Matrix = [number, number, number, number]

function multiply(a: Matrix, b: Matrix): Matrix {
  return [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
  ]
}

const SWAP: Matrix = [0, 1, 1, 0]
const NEGATIVE_IDENTITY: Matrix = [-1, 0, 0, -1]

// the iterant e = diag(a, b) * swap for a tone alternation [a, b]
function iterant(a: number, b: number): Matrix {
  return multiply([a, 0, 0, b], SWAP)
}

function equals(a: Matrix, b: Matrix): boolean {
  return a.every((value, index) => Math.abs(value - b[index]!) < 1e-12)
}

// a change of basis (the irrelevant perturbation): conjugate by an invertible matrix M
function conjugate(matrix: Matrix): Matrix {
  const m: Matrix = [1, 1, 0, 1]
  const mInverse: Matrix = [1, -1, 0, 1]

  return multiply(multiply(m, matrix), mInverse)
}

function trace(matrix: Matrix): number {
  return matrix[0] + matrix[3]
}

export default experiment({
  id: 'method/perturbation-audit-harness',
  code: 'E-MTH-0003',
  title:
    'the perturbation-audit gate passes a durable result and fails a circular one, the standing attack self-validated',
  category: 'method',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // DURABLE claim: e^2 = -I from the signed alternation
    const signed = iterant(1, -1)
    const durableNominal = equals(multiply(signed, signed), NEGATIVE_IDENTITY)
    const conjugated = conjugate(signed)
    const durableUnderIrrelevant = equals(
      multiply(conjugated, conjugated),
      conjugate(NEGATIVE_IDENTITY),
    )

    const unsigned = iterant(0, 1) // the relevant perturbation, unsigned alphabet
    const durableControlFails = !equals(
      multiply(unsigned, unsigned),
      NEGATIVE_IDENTITY,
    )

    const durableAudit = auditResult({
      nominal: durableNominal,
      underIrrelevantPerturbation: durableUnderIrrelevant,
      controlFails: durableControlFails,
    })

    // CIRCULAR claim: the trace of the iterant is zero (true for every iterant)
    const circularNominal = Math.abs(trace(signed)) < 1e-12
    const circularUnderIrrelevant =
      Math.abs(trace(conjugate(signed))) < 1e-12

    // the control (unsigned) ALSO has trace zero, so the control does not fail
    const circularControlFails = !(Math.abs(trace(unsigned)) < 1e-12)
    const circularAudit = auditResult({
      nominal: circularNominal,
      underIrrelevantPerturbation: circularUnderIrrelevant,
      controlFails: circularControlFails,
    })

    const passesDurable = durableAudit.audited === true
    const failsCircular = circularAudit.audited === false
    // the circular one fails specifically because its control is dead, not because it is fragile
    const circularFlaggedForDeadControl =
      circularAudit.durable && !circularAudit.liveControl

    const ok =
      passesDurable && failsCircular && circularFlaggedForDeadControl

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the perturbation-audit gate grants an audited pass to the durable emergent-i result (it holds nominally, survives a change of basis, and fails under the unsigned-alphabet control, a live cause) and refuses it to the circular trace-is-zero claim (which holds under every perturbation including the control, a dead control), so the gate discriminates a caused result from a tautology and is a real standing attack, not a rubber stamp',
      metrics: {
        durableAudited: durableAudit.audited ? 1 : 0,
        durableLiveControl: durableAudit.liveControl ? 1 : 0,
        circularAudited: circularAudit.audited ? 1 : 0,
        circularLiveControl: circularAudit.liveControl ? 1 : 0,
      },
      // CONTROL: the circular claim, durable but with a dead control, must be flagged.
      control: { circularAudited: circularAudit.audited ? 1 : 0 },
      notes:
        'The perturbation-audit harness (the method frontier item), demonstrated on the emergent-i result and self-validated against a circular claim. The gate is auditResult in code/tool/perturbation-audit.ts. Extends consistency-matrix (E-MTH-0001) and the numerology audit (E-MTH-0002).',
    })
  },
})
