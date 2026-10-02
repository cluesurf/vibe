// The vacuum breaks the frame locally: a knot's role dephasing in each of a dock's three frames in the coset-union vacuum.
//
// THE QUESTION (routes/quantum-relativity-light-computation, decoherence and pointer states, row 2, "the vacuum breaks
// the frame locally"). The coset-union vacuum breaks W(F4) dock by dock while the rule keeps it (E-RLT-0069,
// E-RLT-0093). A covariant rule acting on a state that is not covariant can pick a basis spontaneously, as a magnet
// picks an axis; the pointer would then be set by the vacuum's coset at the knot's dock and could differ from place
// to place. The row's test: a knot's role dephasing in each of a dock's three frames, 17 starts, exact, with the
// frame-averaged control reading no preference; it is killed if the dephasing is the same in every frame at every dock.
//
// WHAT IS RUN. The knot is a lone love on one slot of one dock of the side-4 coset-union vacuum (code/measure/
// frame-pointer, the schedule of E-QTM-0155 with the dock free), under the bounce knit and the adopted comoving fear
// beat, for 24 beats. Its environment is every vacuum token it meets in the window, opened in the frame-invariant
// state (weight 1 on all 9 points); the whole (the knot and up to 4 partners, 9^5 integers) is exact. The knot starts
// on the line of each of the 4 classes through its own point; its SURVIVAL in a class is (3 r - 1) / 2, r the weight
// left on the start line carried by its own moves (1 untouched, 0 fully dephased), an exact rational. A dock's 24 slots
// fall into three frames of 8 (four mutually orthogonal lines each). One dock of each of the four cosets of D4 / L' is
// read: the hub coset (stores nothing) and the three root cosets (each stores the four lines of one frame). On each,
// all 24 slots. A FRAME PROFILE is the four class survivals summed over the frame's 8 slots.
//
// DERIVED BEFORE THE GATE RUN.
//  (a) With no meeting in the window the knot's whole is acted on by its crossings only, which permute its points and
//      are carried by its own moves: survival exactly 1 in every class.
//  (b) At the knot's first meeting its partner is fresh and in the frame-invariant state, so (E-QTM-0154 (A), the 648
//      role frame changes a 2-design) the meeting depolarizes: every class keeps exactly lambda, 1/4 (a like partner)
//      or 2/3 (a love-fear meeting). This is the role-frame-averaged reading, where no class can be preferred.
//  (c) A lone love goes straight along its root and meets only tokens on its own line. The coset-union vacuum's
//      tokens on a line of root r sit on docks whose stored frame contains r, and on the hubs they visit. Whether the
//      knot's line through a root dock carries any vacuum token is a property of the coset pattern, and is read here.
//  (d) Class preference: (b) holds at one meeting only. A partner met again after the two tokens crossed different
//      links carries a relative grid move (the link holonomy), which breaks (b) case by case (E-QTM-0155: equal
//      survival on 6 of 136 cases, each class best on some). The link holonomy is set by the link start, not by the
//      vacuum's coset, so a class picked by the coset alone should be the same on every start.
//
// PROBES BEFORE THE GATES (disclosed; tmp/fp-probe1 to fp-probe4, link start integer+0 only).
//  - fp-probe1 (48 beats, partners and meetings per slot, docks 0, 1, 4, 5 = the frame-0, hub, frame-1, frame-2
//    cosets): on each root dock the knot met 4 partners on all 8 slots of the stored frame and none on the other 16; on
//    the hub dock it met 3 or 4 partners on all 24 slots. The coset pattern is 64 docks each on side 4.
//  - fp-probe2 (48 beats, class survivals, docks 0 and 1): on dock 0 the stored frame's profile was 0.664, 0.956,
//    0.664, 1.459 (class 3 highest; per slot three classes equal and one apart, the odd class 3 on 6 slots, 1 on 2);
//    on the hub the three frame profiles all differed, (1.014, 0.718, 0.869, 1.095), (0.656, 0.891, 0.707, 1.075),
//    (0.810, 0.928, 0.950, 0.985).
//  - fp-probe3 (first meetings by window): root docks at beat 1, the hub at beat 4; 4 partners on most slots by 24.
//  - fp-probe4 (timing): one 24-beat whole run 0.8 s, which sets the window at 24 beats (three periods of the
//    knot's 8-beat meeting cycle on dock 0) to keep the run near 30 minutes.
//
// HYPOTHESES AND GATES, fixed before the gate run (each judged on E-MTH-0028's 17 link starts):
//  I1 instrument: every slot with no knot meeting in the window ends with survival exactly 1 in all four classes (a).
//  C1 control, the instrument can read frame-blind dephasing: on the hub dock, where the vacuum names no frame, the
//     knot meets the vacuum on all 24 slots (all three frames dephase).
//  C2 control, the frame-averaged reading shows no preference: at the knot's first meeting, on every slot with a
//     meeting at all four docks, the four class survivals are equal and exactly 1/4 or 2/3 (b).
//  H1 the route, where: on each root dock the knot meets the vacuum on all 8 slots of the dock's stored frame and on
//     none of the other 16, and the three root docks store three different frames. So the frame in which the role
//     dephases is the dock's coset, and it changes from dock to dock.
//  P1 the falsifier (the row's kill): at every dock read, the three frame profiles are equal (exactly). If P1 holds
//     on any start the verdict is fail.
//  H2 the route, which basis: on each root dock the stored frame's profile has a unique largest class, the same class
//     on all 17 starts (a pointer class set by the dock). PREDICTED TO FAIL, from (d): the class differences come from
//     the link holonomy, which the start sets; the coset sets which tokens the knot meets, not their relative frames.
// VERDICT: fail if I1, C1 or C2 fails (the instrument), if H1 fails, or if P1 holds; pass if H2 also holds; partial if
// I1, C1, C2 and H1 hold, P1 does not, and H2 fails (the vacuum's coset sets the frame in which the role dephases, but
// no role basis).
// The hub dock is read at the first meeting only (C1, C2), so I1, P1 and H2 are judged on the three root docks; this
// keeps the run near 30 minutes.
// Readings (not gated): per root dock the winning class on each start and the frame profiles; whether the winners
// differ between root docks; meeting counts.
//
// WHAT THIS CAN AND CANNOT SHOW. It can show whether the vacuum's local frame choice decides which motions of a knot
// decohere its role, and whether a role class is picked by the dock. It reads one dock per coset on the side-4 box and
// a 24-beat window; the frame-invariant opening of the partners is an ensemble over their role points (the member
// opening is not read), and a pointer basis in Zurek's sense would also need redundant records, which E-QTM-0155 found
// absent on this vacuum. The husk is not read separately: every number is a role-grid number of one knot.
//
// Depth L2 (the model's own vacuum, knit and fear beat, exact integer wholes). No random numbers: starts are E-MTH-0028's
// family, docks are the first of each coset, slots and class starts are enumerated.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  GRID_LINES,
  UNIFORM,
  unitsOf,
} from '@/code/measure/pointer-basis'
import {
  marginalSingle,
  runWhole,
  startWhole,
  type VacuumSchedule,
} from '@/code/measure/vacuum-records'
import {
  slotFrame,
  storedFrames,
  unionStore,
  vacuumScheduleAt,
} from '@/code/measure/frame-pointer'
import { type Whole } from '@/code/rule/fear-weave'

const SIDE = 4
const BEATS = 24
const STARTS = GRID_LINES.filter(l => l.points.includes(0))

type Ratio = readonly [bigint, bigint]

const ratioAdd = (a: Ratio, b: Ratio): Ratio => [
  a[0] * b[1] + b[0] * a[1],
  a[1] * b[1],
]
const ratioEq = (a: Ratio, b: Ratio): boolean =>
  a[0] * b[1] === b[0] * a[1]
const ratioLess = (a: Ratio, b: Ratio): boolean =>
  a[0] * b[1] < b[0] * a[1]
const ratioFloat = (a: Ratio): number => Number(a[0]) / Number(a[1])

// survival (3 r - 1) / 2 of class start `cls` after beat t, r on the start line carried by the knot's moves
function survival(
  s: VacuumSchedule,
  w: Whole,
  cls: number,
  t: number,
): Ratio {
  const line = STARTS.find(l => l.cls === cls)!.points.map(
    p => s.knotMove[t]![p]!,
  )
  const m = marginalSingle(w, 0)
  const on = line.reduce((a, p) => a + m[p]!, 0n)
  const u = unitsOf(m)

  return [3n * on - u, 2n * u]
}

// the four class survivals at the end of the window, and at the knot's first meeting (null if none)
function classSurvivals(s: VacuumSchedule): {
  end: Ratio[]
  first: Ratio[] | null
} {
  const firstMeeting = s.knotMeetings.findIndex(n => n > 0)
  const end: Ratio[] = []
  const first: Ratio[] = []

  for (const start of STARTS) {
    let w = startWhole(s, start.points, () => UNIFORM)

    if (firstMeeting >= 0) {
      w = runWhole(s, w, 0, firstMeeting + 1)
      first.push(survival(s, w, start.cls, firstMeeting))
      w = runWhole(s, w, firstMeeting + 1, BEATS)
    } else {
      w = runWhole(s, w, 0, BEATS)
    }

    end.push(survival(s, w, start.cls, BEATS - 1))
  }

  return { end, first: firstMeeting >= 0 ? first : null }
}

const LAMBDAS: readonly Ratio[] = [
  [1n, 4n],
  [2n, 3n],
]

export default experiment({
  id: 'quantum/frame-broken-pointer',
  code: 'E-QTM-0176',
  title:
    'the vacuum breaks the frame locally (placeholder title, set after the gate run)',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const store = unionStore(SIDE)
    // the first dock of each coset: the hub (stores nothing) and the three root cosets (one frame each)
    const docks: { dock: number; stored: number[] }[] = []

    for (let x = 0; x < SIDE ** 4 && docks.length < 4; x++) {
      const stored = storedFrames(store, x)

      if (!docks.some(d => d.stored.join() === stored.join())) {
        docks.push({ dock: x, stored })
      }
    }

    const hubFound = docks.some(d => d.stored.length === 0)
    const roots = docks.filter(d => d.stored.length === 1)
    const distinctStored =
      hubFound &&
      roots.length === 3 &&
      new Set(roots.map(d => d.stored[0])).size === 3

    const rows: {
      name: string
      i1: boolean
      c1: boolean
      c2: boolean
      h1: boolean
      p1: boolean
      winners: number[]
      profiles: string[]
      meetings: number
    }[] = []
    const winnersByDock = roots.map(() => [] as number[])

    for (const member of startFamily(16)) {
      const row = {
        name: member.name,
        i1: true,
        c1: true,
        c2: true,
        h1: true,
        p1: true,
        winners: [] as number[],
        profiles: [] as string[],
        meetings: 0,
      }

      withStart(member, () => {
        for (const d of docks) {
          const isHub = d.stored.length === 0
          const profile: Ratio[][] = [0, 1, 2].map(() =>
            [0, 1, 2, 3].map((): Ratio => [0n, 1n]),
          )

          for (let slot = 0; slot < 24; slot++) {
            const s = vacuumScheduleAt(SIDE, d.dock, slot, BEATS, store)
            const f = slotFrame(slot)
            const met = s.knotMeetings.some(n => n > 0)

            row.meetings += s.knotMeetings.reduce((a, n) => a + n, 0)

            if (isHub && !met) {
              row.c1 = false
            }

            if (!isHub && met !== (f === d.stored[0])) {
              row.h1 = false
            }

            // the hub's slots are read at the first meeting only (C1, C2); the root docks' slots in full
            if (isHub) {
              const firstMeeting = s.knotMeetings.findIndex(n => n > 0)

              if (firstMeeting >= 0) {
                const first = STARTS.map(start =>
                  survival(
                    s,
                    runWhole(
                      s,
                      startWhole(s, start.points, () => UNIFORM),
                      0,
                      firstMeeting + 1,
                    ),
                    start.cls,
                    firstMeeting,
                  ),
                )

                if (
                  !LAMBDAS.some(l => first.every(x => ratioEq(x, l)))
                ) {
                  row.c2 = false
                }
              }

              continue
            }

            const r = classSurvivals(s)

            if (!met && !r.end.every(x => x[0] === x[1])) {
              row.i1 = false
            }

            if (
              r.first &&
              !LAMBDAS.some(l => r.first!.every(x => ratioEq(x, l)))
            ) {
              row.c2 = false
            }

            r.end.forEach((x, c) => {
              profile[f]![c] = ratioAdd(profile[f]![c]!, x)
            })
          }

          if (isHub) {
            continue
          }

          // P1 on this dock: the three frame profiles equal
          const same = [1, 2].every(f =>
            profile[f]!.every((x, c) => ratioEq(x, profile[0]![c]!)),
          )

          if (!same) {
            row.p1 = false
          }

          const own = profile[d.stored[0]!]!
          const best = own.reduce(
            (b, x, c) => (ratioLess(own[b]!, x) ? c : b),
            0,
          )
          const unique = own.every(
            (x, c) => c === best || ratioLess(x, own[best]!),
          )
          const winner = unique ? best : -1

          row.winners.push(winner)
          winnersByDock[roots.indexOf(d)]!.push(winner)
          row.profiles.push(
            `dock ${d.dock} frame ${d.stored[0]}: ${profile
              .map(p => p.map(x => ratioFloat(x).toFixed(4)).join('/'))
              .join(' ; ')}`,
          )
        }
      })

      rows.push(row)
    }

    const count = (f: (r: (typeof rows)[number]) => boolean): number =>
      rows.filter(f).length
    const g = {
      I1: count(r => r.i1),
      C1: count(r => r.c1),
      C2: count(r => r.c2),
      H1: distinctStored ? count(r => r.h1) : 0,
      P1: count(r => r.p1),
    }
    const h2Docks = winnersByDock.filter(
      w => w[0]! >= 0 && w.every(x => x === w[0]),
    ).length
    const h2 = h2Docks === roots.length
    const instrument = g.I1 === 17 && g.C1 === 17 && g.C2 === 17
    const status =
      !instrument || g.H1 !== 17 || g.P1 > 0
        ? 'fail'
        : h2
          ? 'pass'
          : 'partial'
    const tally = winnersByDock.map(w =>
      [-1, 0, 1, 2, 3]
        .map(
          c =>
            `${c < 0 ? 'tie' : `class ${c}`} ${w.filter(x => x === c).length}`,
        )
        .join(', '),
    )

    return verdict({
      status,
      claim: `in the side-4 coset-union vacuum (docks ${docks.map(d => `${d.dock} stores frame ${d.stored.join('') || 'none'}`).join(', ')}; 24 beats; 17 starts) a lone love's role dephases on a root dock only when it moves in the dock's stored frame (${g.H1} of 17 starts: all 8 of its slots meet the vacuum, none of the other 16) and in every frame on the hub (${g.C1} of 17), so the frame of dephasing is the dock's coset; the three frame profiles are equal at every dock on ${g.P1} of 17 starts; the first meeting is class-blind (${g.C2} of 17); a unique best class constant over the 17 starts holds at ${h2Docks} of ${roots.length} root docks (${tally.join(' | ')})`,
      metrics: {
        startsI1: g.I1,
        startsC1: g.C1,
        startsC2: g.C2,
        startsH1: g.H1,
        startsP1: g.P1,
        rootDocksWithConstantWinner: h2Docks,
        distinctStoredFrames: distinctStored ? 1 : 0,
        knotMeetings: rows.reduce((a, r) => a + r.meetings, 0),
        gate_I1: g.I1 === 17 ? 1 : 0,
        gate_C1: g.C1 === 17 ? 1 : 0,
        gate_C2: g.C2 === 17 ? 1 : 0,
        gate_H1: g.H1 === 17 ? 1 : 0,
        gate_P1_holds: g.P1 > 0 ? 1 : 0,
        gate_H2: h2 ? 1 : 0,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        hubAllFramesDephase: g.C1,
        firstMeetingClassBlind: g.C2,
      },
      notes: `L2, exact integer wholes. Winners per root dock (dock order ${roots.map(d => d.dock).join(', ')}; -1 a tie): ${winnersByDock.map(w => w.join(',')).join(' | ')}. Frame profiles (class 0/1/2/3 survival summed over the frame's 8 slots, frames 0 ; 1 ; 2) per start: ${rows.map(r => `${r.name}: ${r.profiles.join(' || ')}`).join(' | ')}.`,
    })
  },
})
