// WIGNER'S FRIEND ON THE RULE'S OWN GATES (E-QTM-0162). The ledger row "Wigner's friend" (an observer inside the model
// treated quantum mechanically by another) was none, with the note that the model can pose it exactly. This file poses
// it with the rule's gates (code/measure/rule-gates, read bit for bit on the start family) and states what the rule
// predicts.
//
// THE SETUP: the system S is a love A's direction after the coin (k on R, x on L). The friend F is a love B whose point
// is its memory: F measures S by sharing A's line on arm R (the line of two, w U on points (A, B), A's point 0 and B's 1),
// so F ends holding A's point 0 only if S was R: a one-way record (a reading "0" means R for certain; "1" is either).
// Wigner then either reads F and S, or acts on S and F together: two more meetings on arm R, which by (w U)^3 = I undo
// F's measurement exactly, then the coin, then S's direction is read.
//
// DERIVED, before this file's first run:
//  - F's view: F reads 0 with probability |k|^2 |x|^2 = 3/16, and then S is R with certainty; F's record is Born's
//  - the rule is unitary, so Wigner's undo returns S and F to their state before F's measurement: F's memory is back to
//    1 with probability 1, and S's interference after the coin is exactly the no-friend interferometer's
//  - the collapse account (F's reading made definite: F's record dephased before Wigner acts) predicts a different
//    distribution for Wigner's reading: the rule predicts Wigner sees interference, the collapse account does not
//  - if F's record has been copied onward (F meets a third love G, point 2, before Wigner acts), Wigner's undo on S and F
//    alone no longer restores the interference: the record has spread past what Wigner acts on (objectivity by
//    redundancy, the direction of E-QTM-0070, objectivity-needs-redundant-records)
// So the rule's answer to the puzzle is that F's reading is a correlation, reversible by an agent who acts on everything
// that carries it, and definite for every agent who does not.
//
// GATES, fixed before the first run:
//  G0 the three splittings read on the working rule on 17 of 17 starts
//  F1 F's record: P(F reads 0) = 3/16 exactly, and given it S is R with probability 1
//  F2 Wigner's undo: F reads 1 with probability exactly 1 after it, and Wigner's P(f) equals the no-friend
//     interferometer's exactly for f = R, L
//  F3 the collapse account differs: the L1 between the rule's P(f) and the dephased-record account's is > 0
//  F4 redundancy: with F's record copied to G first, Wigner's undo on S and F leaves an L1 > 0 against the no-friend
//     interferometer, and F no longer reads 1 with certainty
//  C1 control, no friend (F's point equal to A's, so the meeting is a phase and records nothing): the dephased-record
//     account equals the rule (there is no record to dephase)
// Verdict: fail if G0 or C1 fails; partial if every gate holds (the friend is one vibe's point, not a self region: the
// selves of section P do not form on the bare knit, E-SLF-0083; and the schedule is arranged); fail otherwise.
//
// PROBES before this file, disclosed: tmp/qf-probe1 ((w U)^n for n = 1, 2, 3). tmp/qf-smoke-friend.log ran this file as
// written with its placeholder title; the gates did not move after it.
//
// FIRST RUN (1.8 s, tmp/qf-exp-friend-run1.log): partial as derived, every gate held, title written after the run.
// P(f = R, L): no friend 1/4, 3/4; Wigner after the undo 1/4, 3/4; the collapse account 17/32, 15/32; the record copied
// to G then the undo 59/128, 69/128.
//
// DETERMINISM: exact in Q(w); no random number. Depth L2 (Wigner's friend, known physics) on the rule's measured gates.
// NOTHING MOVES: F's memory is the point a vibe holds, taken by exchange within one line of one dock.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  add,
  apply,
  coinGate,
  dirOf,
  eq,
  float,
  gatesOnFamily,
  lineOfTwo,
  ONE,
  pointsOf,
  qw,
  show,
  start,
  sub,
  weightWhere,
  ZERO,
  type Qw,
  type State,
} from '@/code/measure/rule-gates'

const FRIEND = 1

function prepared(points: number[]): State {
  return apply(start('R', points), coinGate)
}

const friendMeasures = (s: State): State =>
  apply(s, lineOfTwo(0, FRIEND, 'R'))

function wignerUndo(s: State): State {
  let t = apply(s, lineOfTwo(0, FRIEND, 'R'))

  t = apply(t, lineOfTwo(0, FRIEND, 'R'))

  return apply(t, coinGate)
}

const readS = (s: State): Qw[] =>
  ['R', 'L'].map(f => weightWhere(s, l => dirOf(l) === f))

// the collapse account: split by F's record, act on each branch alone, add the probabilities
function collapsed(s: State): Qw[] {
  const records = new Set([...s.keys()].map(l => pointsOf(l)[FRIEND]))
  const total = [ZERO, ZERO]

  for (const r of records) {
    const branch: State = new Map(
      [...s].filter(([l]) => pointsOf(l)[FRIEND] === r),
    )
    const p = readS(wignerUndo(branch))

    total[0] = add(total[0]!, p[0]!)
    total[1] = add(total[1]!, p[1]!)
  }

  return total
}

const l1 = (p: Qw[], q: Qw[]): number =>
  p.reduce((s, x, i) => s + Math.abs(float(sub(x, q[i]!)).re), 0)

export default experiment({
  id: 'quantum/wigners-friend',
  code: 'E-QTM-0162',
  title:
    "Wigner's friend on the rule's own gates, partial: a friend love records the system's arm by a meeting (reads 0 with 3/16, and then the system was R for certain); Wigner's two further meetings ((w U)^3 = I) restore the friend's memory with probability 1 and the no-friend interference exactly (P(R) 1/4, where the friend's reading made definite predicts 17/32); once the record is copied to a third love the undo on system and friend fails (L1 0.42, memory back with 91/256); the friend is one vibe's point, not a self, and the schedule is arranged",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const gates = gatesOnFamily()
    const points = [0, 1, 2]

    // F1
    const afterFriend = friendMeasures(prepared(points))
    const readsZero = weightWhere(
      afterFriend,
      l => pointsOf(l)[FRIEND] === 0,
    )
    const zeroAndR = weightWhere(
      afterFriend,
      l => pointsOf(l)[FRIEND] === 0 && dirOf(l) === 'R',
    )
    const f1 = eq(readsZero, qw(3n, 0n, 16n)) && eq(zeroAndR, readsZero)

    // F2
    const undone = wignerUndo(afterFriend)
    const noFriend = readS(apply(prepared(points), coinGate))
    const wigner = readS(undone)
    const restored = weightWhere(undone, l => pointsOf(l)[FRIEND] === 1)
    const f2 =
      eq(restored, ONE) && wigner.every((p, i) => eq(p, noFriend[i]!))

    // F3
    const collapse = collapsed(afterFriend)
    const f3 = l1(wigner, collapse) > 0

    // F4: F's record copied to G (F and G meet) before Wigner acts on S and F
    const copied = apply(afterFriend, lineOfTwo(FRIEND, 2, null))
    const redundant = wignerUndo(copied)
    const redundantRead = readS(redundant)
    const redundantRestored = weightWhere(
      redundant,
      l => pointsOf(l)[FRIEND] === 1,
    )
    const f4 =
      l1(redundantRead, noFriend) > 0 && !eq(redundantRestored, ONE)

    // C1: no record (F's point equal to A's)
    const plainAfter = friendMeasures(prepared([0, 0, 2]))
    const c1 = collapsed(plainAfter).every((p, i) =>
      eq(p, readS(wignerUndo(plainAfter))[i]!),
    )

    const g = {
      G0: gates.passing === gates.of,
      F1: f1,
      F2: f2,
      F3: f3,
      F4: f4,
      C1: c1,
    }
    const status =
      !g.G0 || !g.C1
        ? 'fail'
        : Object.values(g).every(Boolean)
          ? 'partial'
          : 'fail'
    const metrics: Record<string, number> = {
      startsReadingTheGates: gates.passing,
      starts: gates.of,
      friendReadsZero: float(readsZero).re,
      wignerR: float(wigner[0]!).re,
      noFriendR: float(noFriend[0]!).re,
      collapseR: float(collapse[0]!).re,
      ruleVersusCollapseL1: l1(wigner, collapse),
      redundantVersusNoFriendL1: l1(redundantRead, noFriend),
      redundantFriendRestored: float(redundantRestored).re,
    }

    for (const [k, v] of Object.entries(g)) {
      metrics[`gate_${k}`] = v ? 1 : 0
    }

    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `Wigner's friend posed exactly on the working rule's gates (read on ${gates.passing} of ${gates.of} starts): the friend, a love whose point is its memory, records the system's arm by a meeting (reads 0 with probability ${show(readsZero)}, and then the system was R for certain); the rule predicts that Wigner, meeting the system twice more ((w U)^3 = I), restores the friend's memory with probability ${show(restored)} and sees the no-friend interference exactly (P(R) ${show(wigner[0]!)}), where the account with the friend's reading made definite predicts P(R) ${show(collapse[0]!)}; once the record is copied to a third love, Wigner's undo on system and friend fails (L1 ${l1(redundantRead, noFriend).toFixed(4)}, memory restored with probability ${show(redundantRestored)})`,
      metrics,
      control: { noRecordCollapseEqualsRule: c1 ? 1 : 0 },
      notes: `L2. Gates ${Object.entries(g)
        .map(([k, v]) => `${k} ${v}`)
        .join(
          ', ',
        )}. P(f) for f = R, L: no friend ${noFriend.map(show).join(', ')}; Wigner after undo ${wigner.map(show).join(', ')}; collapse account ${collapse.map(show).join(', ')}; record copied to G then undo ${redundantRead.map(show).join(', ')}. The friend is one vibe's point, not a self region, and the schedule is arranged. ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
