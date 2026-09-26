// What one history records under net records (E-QTM-0144): the price of the Bell fork's candidate
// resolution (c) (see E-QTM-0142 for the fork, E-QTM-0143 for the Bell values).
//
// Under (c) a record reads the net count, loves minus fears, on its outcome line. The ensemble's net counts
// are non-negative and are the Born rule (E-QTM-0142). The question here is what ONE history does. The model's
// deterministic histories are its classical members: a start of weight 1 at one joint point of the knot. With
// the fear beat on, a member does not stay a point: each meeting's kernel spreads it over several joint points
// with signs, so a member's weight after t beats is one column of the history's propagator (in its own grain,
// code/measure/net-records propagateMembers). A line-product start is the sum of its 9 members.
//
// For one member at one pair of in-model settings, its 9 net cells (loves minus fears of that member's own
// weight on each outcome pair) say what it records:
//   clean     a definite outcome with no cancellation: one cell positive, the rest 0, no fear anywhere
//   netted    a definite outcome after the member's own cancellation: one cell positive, the rest net 0, with
//             fears inside
//   spread    every cell non-negative, two or more positive: a member that is itself a spread of outcomes
//   negative  some cell negative: the member alone would write a negative number of records there
// The same four classes for one party alone (its 3 net cells, its marginal weight).
//
// Predictions, written before the first run:
//   I1 the members add up to the whole: on every state, the sum of the 9 members of the start, each in its own
//      units, equals the whole exactly (the rule is linear in the weight; its frames and own points depend on
//      the classical record only).
//   I2 the control: with the fear beat off every member stays one joint point, so it is clean at every setting
//      pair and for each party alone, on every state (the fear-off runs are the local hidden-variable model).
//   I3 before its first meeting every member with the fear beat on is still one joint point.
//   H1 THE (c) HYPOTHESIS OF DEFINITE SINGLE OUTCOMES: every member at every state and every setting pair is
//      clean or netted. PREDICTED TO FAIL: a meeting spreads a point over points of one sum with signs, so
//      some member's net cells are spread or negative.
//   P2 Bell forces it (a check of the instrument, a theorem): on every state whose in-model CHSH passes 2,
//      some member is spread or negative at some setting pair. If every member were definite, each party's
//      outcome would be a function of the member and its own setting (a member's one-party net marginal does
//      not depend on the other party's setting), the members carry weight +1 each, and CHSH would be at most 2.
//   P3 a single history can record a negative count: some member has a negative net cell.
// Readings: the four shares, joint and one-party; the share of members definite at every setting pair of a
// state; the same at the best state (E-QTM-0138's 62/27); in the unit view (each of the whole's units at one
// joint point, loves and fears after the fear beat's pointwise annihilation), the share of positive outcome
// cells holding no fear, where every unit is already a record, and the whole's units that survive the cell
// sums, (L - F) / (L + F) = e^(-mana).
//
// Status: pass when I1 to I3, H1, P2 and P3 hold; fail otherwise. H1 is predicted to fail, so the predicted
// status is fail, with I1 to I3, P2 and P3 holding.
//
// FIRST RUN (2026-09-26, 116 s): fail, as predicted, on H1 alone. I1 (0 linearity mismatches on 1,222
// states), I2 (every fear-off member clean on all 1,520,208 joint and 253,368 one-party readings), I3 (405
// members one point before the first meeting), P2 (140 states past CHSH 2, 0 without an indefinite member)
// and P3 hold. Of 1,520,208 member-setting pairs: clean 179,424 (11.8 percent), netted 233,811 (15.4),
// spread 43,857 (2.9), negative 1,063,116 (69.9). One party alone, of 253,368: clean 33,882, netted 149,340,
// spread 34,014, negative 36,132. 1,687 of 10,998 member readings are definite at every setting pair, and
// 9,311 record a negative count somewhere. At the best state (rlt0055, beat 78, CHSH 2.5298 on the comoving
// beat) 1 of 9 members is definite everywhere, and of its 1,296 member-setting pairs 144 are clean and 1,152
// negative. Unit view: 473,319 of 1,370,772 positive outcome cells hold no fear, and at the best state the
// units that survive the cell sums are (L - F) / (L + F) = 0.404. No gate was moved.
//
// Depth L2: the model's own propagator on the knit's histories, exact integers. The husk is not read.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { wholeLovesAndFears, type Whole } from '@/code/rule/fear-weave'
import { advanceKnot, bellHistories, lineKnot, physicalKnot } from '@/code/measure/knot-histories'
import { gridLines } from '@/code/measure/bell-gates'
import {
  cellLovesAndFears,
  classifyNet,
  fearOff,
  inModelSettings,
  netChsh,
  netTable,
  nextMeeting,
  RECORD,
  settingsAt,
  type NetClass,
} from '@/code/measure/net-records'

const BEATS = 480
const CLASSES: readonly NetClass[] = ['clean', 'netted', 'spread', 'negative']

const gcd = (a: bigint, b: bigint): bigint => {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b

  while (y > 0n) {
    ;[x, y] = [y, x % y]
  }

  return x
}

const marginals = (w: readonly bigint[]): { alice: bigint[]; bob: bigint[] } => {
  const alice = new Array<bigint>(9).fill(0n)
  const bob = new Array<bigint>(9).fill(0n)

  for (let i = 0; i < 81; i++) {
    alice[Math.floor(i / 9)] = (alice[Math.floor(i / 9)] ?? 0n) + (w[i] ?? 0n)
    bob[i % 9] = (bob[i % 9] ?? 0n) + (w[i] ?? 0n)
  }

  return { alice, bob }
}

// one party's 3 net cells at setting l, from its marginal weight on its 9 points
const oneParty = (m: readonly bigint[], l: number): bigint[] => {
  const out = [0n, 0n, 0n]

  for (let x = 0; x < 9; x++) {
    const k = RECORD[l]![x] ?? 0

    out[k] = (out[k] ?? 0n) + (m[x] ?? 0n)
  }

  return out
}

type Tally =Record<NetClass, number>
const tally = (): Tally => ({ clean: 0, netted: 0, spread: 0, negative: 0 })

export default experiment({
  id: 'quantum/single-history-records',
  code: 'E-QTM-0144',
  title:
    'what one history records under net records: with the fear beat on, a classical member of the knot is a signed spread after its first meeting, and at in-model settings it often records a spread of outcomes or a negative count on its own; every Bell violation needs such members, so net records give definite outcome statistics for the ensemble, not a definite outcome for each history',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const settings = inModelSettings(BEATS)
    const { lines } = gridLines()
    const joint = tally()
    const single = tally()
    const jointBest = tally()
    const offJoint = tally()
    const offSingle = tally()
    const counts = {
      states: 0,
      linearityBad: 0,
      beforeFirstBad: 0,
      beforeFirstChecked: 0,
      statesAbove2: 0,
      statesAbove2WithoutIndefinite: 0,
      membersRead: 0,
      membersDefiniteEverywhere: 0,
      membersNegativeSomewhere: 0,
      positiveCells: 0,
      positiveCellsWithoutFear: 0,
    }
    let best = { numerator: 0n, units: 1n, history: '', beat: -1, survive: 0, members: 0, membersDefinite: 0 }

    for (const h of bellHistories(BEATS)) {
      const off = fearOff(h)
      const first = nextMeeting(h, 0)
      const reading = first + 1
      const ownA = lines.find(a => a.every(p => Math.floor(p / 3) === h.start[0]))!
      const ownB = lines.find(b => b.every(p => Math.floor(p / 3) === h.start[1]))!
      const one = (i: number): Whole => {
        const weight = new Array<bigint>(81).fill(0n)

        weight[i] = 1n

        return { tokens: h.tokens, weight }
      }
      let members = Array.from({ length: 81 }, (_, i) => one(i))
      let offMembers = members
      const starts = lines.flatMap(a => lines.map(b => ({ a, b, own: a === ownA && b === ownB, w: lineKnot(h.tokens, a, b) })))

      for (let t = 0; t < BEATS; t++) {
        const record = h.records[t]!
        const readHere = t === reading || (record.meetings.length ?? 0) > 0

        members = members.map(w => advanceKnot(h, w, record))
        offMembers = offMembers.map(w => advanceKnot(off, w, record))

        for (const s of starts) {
          if (s.own || t <= reading) {
            s.w = advanceKnot(h, s.w, record)
          }
        }

        if (t === first - 1) {
          for (const m of members) {
            counts.beforeFirstChecked++
            counts.beforeFirstBad += m.weight.filter(x => x !== 0n).length === 1 ? 0 : 1
          }
        }

        if (!readHere) {
          continue
        }

        const physical = members.map(m => physicalKnot(h, m).weight)
        const offPhysical = offMembers.map(m => physicalKnot(off, m).weight)
        const S = settingsAt(settings, t)

        for (const s of starts) {
          if (!(t === reading || s.own)) {
            continue
          }

          counts.states++

          const whole = physicalKnot(h, s.w).weight
          const U = whole.reduce((x, y) => x + y, 0n)
          const ids = s.a.flatMap(x => s.b.map(y => 9 * x + y))

          // I1: linearity, each member in its own units
          const unitsOf = ids.map(i => (physical[i] ?? []).reduce((x, y) => x + y, 0n))
          const L = unitsOf.reduce((acc, u) => (acc * u) / gcd(acc, u), 1n)
          const V = new Array<bigint>(81).fill(0n)

          ids.forEach((i, k) => {
            const scale = L / (unitsOf[k] ?? 1n)

            physical[i]!.forEach((x, j) => {
              V[j] = (V[j] ?? 0n) + x * scale
            })
          })
          counts.linearityBad += whole.every((x, j) => x * BigInt(ids.length) * L === (V[j] ?? 0n) * U) ? 0 : 1

          // the state's CHSH, to know whether Bell binds it
          const chsh = netChsh(whole, S)
          const above2 = chsh.numerator > 2n * chsh.units
          let anyIndefinite = false
          const stateJoint = tally()
          let definiteMembers = 0

          counts.statesAbove2 += above2 ? 1 : 0

          for (const i of ids) {
            const c = physical[i]!
            const oc = offPhysical[i]!
            const hasFear = c.some(x => x < 0n)
            const { alice, bob } = marginals(c)
            const offMarg = marginals(oc)
            let definiteEverywhere = true
            let negativeSomewhere = false

            counts.membersRead++

            for (const la of S) {
              for (const lb of S) {
                const k = classifyNet(netTable(c, la, lb), hasFear)
                const ko = classifyNet(netTable(oc, la, lb), oc.some(x => x < 0n))

                joint[k]++
                stateJoint[k]++
                offJoint[ko]++
                definiteEverywhere = definiteEverywhere && (k === 'clean' || k === 'netted')
                negativeSomewhere = negativeSomewhere || k === 'negative'
                anyIndefinite = anyIndefinite || k === 'spread' || k === 'negative'
              }

              // one party alone at setting la: Alice's marginal, then Bob's
              for (const [m, mo] of [
                [alice, offMarg.alice],
                [bob, offMarg.bob],
              ] as const) {
                single[classifyNet(oneParty(m, la), m.some(x => x < 0n))]++
                offSingle[classifyNet(oneParty(mo, la), mo.some(x => x < 0n))]++
              }
            }

            counts.membersDefiniteEverywhere += definiteEverywhere ? 1 : 0
            counts.membersNegativeSomewhere += negativeSomewhere ? 1 : 0
            definiteMembers += definiteEverywhere ? 1 : 0
          }

          counts.statesAbove2WithoutIndefinite += above2 && !anyIndefinite ? 1 : 0

          // the unit view: positive cells with no fear in them
          for (const la of S) {
            for (const lb of S) {
              const n = netTable(whole, la, lb)
              const { fears } = cellLovesAndFears(whole, la, lb)

              for (let k = 0; k < 9; k++) {
                if ((n[k] ?? 0n) > 0n) {
                  counts.positiveCells++
                  counts.positiveCellsWithoutFear += (fears[k] ?? 0n) === 0n ? 1 : 0
                }
              }
            }
          }

          if (chsh.numerator * best.units > best.numerator * chsh.units) {
            const { loves, fears } = wholeLovesAndFears({ tokens: h.tokens, weight: whole })

            best = {
              ...chsh,
              history: h.name,
              beat: t,
              survive: Number(loves - fears) / Number(loves + fears),
              members: ids.length,
              membersDefinite: definiteMembers,
            }
            CLASSES.forEach(k => {
              jointBest[k] = stateJoint[k]
            })
          }
        }
      }
    }

    const jointTotal = CLASSES.reduce((s, k) => s + joint[k], 0)
    const singleTotal = CLASSES.reduce((s, k) => s + single[k], 0)
    const gates = {
      I1: counts.linearityBad === 0 && counts.states > 0,
      I2: offJoint.netted + offJoint.spread + offJoint.negative === 0 && offSingle.netted + offSingle.spread + offSingle.negative === 0,
      I3: counts.beforeFirstBad === 0 && counts.beforeFirstChecked > 0,
      H1: joint.spread + joint.negative === 0,
      P2: counts.statesAbove2WithoutIndefinite === 0 && counts.statesAbove2 > 0,
      P3: joint.negative > 0,
    }
    const ok = Object.values(gates).every(Boolean)
    const share = (x: number, n: number): string => `${x.toLocaleString()} of ${n.toLocaleString()}`

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `over ${counts.states.toLocaleString()} states, ${counts.membersRead.toLocaleString()} member readings and ${jointTotal.toLocaleString()} member-setting pairs, one history records a clean definite outcome at ${share(joint.clean, jointTotal)}, a definite outcome after its own cancellation at ${share(joint.netted, jointTotal)}, a spread at ${share(joint.spread, jointTotal)} and a negative count at ${share(joint.negative, jointTotal)} (one party alone: ${single.clean}, ${single.netted}, ${single.spread}, ${single.negative} of ${singleTotal.toLocaleString()}); ${share(counts.membersDefiniteEverywhere, counts.membersRead)} member readings are definite at every setting pair; on the ${counts.statesAbove2} states past CHSH 2 some member is always indefinite (${counts.statesAbove2WithoutIndefinite} exceptions); at the best state (${best.history}, beat ${best.beat}, ${best.numerator}/${best.units}) ${best.membersDefinite} of ${best.members} members are definite everywhere; the fear-off members are clean on every reading`,
      metrics: {
        ...counts,
        ...Object.fromEntries(CLASSES.map(k => [`joint_${k}`, joint[k]])),
        ...Object.fromEntries(CLASSES.map(k => [`single_${k}`, single[k]])),
        ...Object.fromEntries(CLASSES.map(k => [`best_${k}`, jointBest[k]])),
        ...Object.fromEntries(CLASSES.map(k => [`offJoint_${k}`, offJoint[k]])),
        ...Object.fromEntries(CLASSES.map(k => [`offSingle_${k}`, offSingle[k]])),
        bestChsh: Number(best.numerator) / Number(best.units),
        bestBeat: best.beat,
        bestMembersDefinite: best.membersDefinite,
        bestSurvivingUnitShare: best.survive,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes: `L2, exact BigInt, no random numbers: members, starts and settings are enumerated. A member is one joint point of the start with weight 1; its later weight is the history's propagator column, each member reduced to its own grain and compared in its own units. The best state is ${best.history} at beat ${best.beat}.`,
    })
  },
})
