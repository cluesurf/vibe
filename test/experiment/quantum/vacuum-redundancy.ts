// Redundant records in the coset-union vacuum: counted exactly, a knot's environment copies no basis.
//
// THE QUESTION (quantum Darwinism, Zurek). A pointer basis is the one whose record the environment copies into many
// fragments. On the model's default dock-varying vacuum (the coset-union hub vacuum, E-RLT-0093), which basis of a
// knot, if any, is recorded redundantly, and does the knot decohere in it and not in the others?
//
// THE SETUP. The knot is a lone love streamed into the side-4 coset-union vacuum from the anchor dock, on each of the
// 24 directions (code/measure/vacuum-records). Its environment is every vacuum token it meets in 48 beats; on side 4
// that is 4 tokens on every start and direction with a meeting (8 of 24 directions, 13 to 21 knot meetings, counted
// before the gates by a plumbing probe that read nothing else). The measured run opens the knot and those 4 tokens
// (a 9^5 whole, exact integers) and advances it by the adopted comoving fear beat; each token's other meetings stay
// classical. The knot starts on the line of each class through its own point (4 starts). The environment is opened
// two ways, both in-model readings of a classical token:
//   ensemble: weight 1 on all 9 points, the sum of the 9 point members, the frame-invariant state (1/3)
//   member:   weight 1 on the token's own classical point, one member of that sum (not a state: its tables can go
//             negative, E-QTM-0144, and then carry no mutual information)
// A RECORD of the knot's class c (read in the knot's own frame, the start's lines carried by every crossing it made)
// in a partner is a 3 x 3 table of net line counts, knot class c against the partner's best class, whose mutual
// information is at least (1 - delta) H(knot's class-c label), delta = 0.1 (Zurek's customary value). R_delta(c) is
// the number of partners holding one; fragments are single tokens, and on the husk they are the husk columns where the
// knot first met each partner.
//
// THE PREDICTION (E-QTM-0154): no meeting of the model premeasures, and an environment of points or of the frame-
// invariant state can prefer no class. So R = 0 for every class, and no class decoheres differently from the others.
//
// THE CALIBRATION (a STAND-IN, the missing ingredient put in by hand): every meeting of the knot replaced by the SUM
// reader of the role class carried in the knot's own frame, the partner opened on its role line through its point
// (an environment that already holds lines of one class). This is what a pointer basis looks like to the same
// instrument: the role start keeps its line, every other start dephases completely, and each partner met holds a
// full record.
//
// Gates, fixed before the first run, judged on each of E-MTH-0028's 17 link starts:
//  C1 calibration (stand-in, own frame): on every direction with a knot meeting, the role start ends with survival 1
//     exactly, the other three starts with survival 0 exactly (survival (3 r - 1) / 2, r the weight left on the start
//     line carried by the knot's moves), and right after the knot's first meeting the partner met holds I = log 3
//     (to 1e-12) of the role label for each of the three non-role starts.
//  M1 no record (model, ensemble): at every beat, for every class, every knot start and every direction, R_0.1 = 0.
//  M2 no pointer basis (model, ensemble): on no direction does one start class end with survival exactly 1 while
//     another ends below 1.
// Readings (not gated): the largest I / H the model reaches; whether the four start classes end with equal survival
// (the covariance prediction, exact on a fresh environment; a partner met twice through different links need not
// satisfy it); the member opening's negative tables and records; the stand-in's redundancy at the end over partners and
// over husk columns; the same reader in the DOCK frame (the class read not carried with the knot), on live links.
// Verdict: pass if C1, M1 and M2 hold on 17 of 17 starts; fail otherwise.
//
// FIRST RUN (2026-09-26, 1,566 s, tmp/dar-vacuum-redundancy.log): FAIL on C1 (0 of 17), a wrong prediction of the
// calibration, no gate moved. M1 and M2 hold on 17 of 17.
//  - M1: over 136 cases (8 of 24 directions per start, 4 partners each), no partner ever holds a record of any class
//    at any beat; the largest I / H is 0.2689, the same on every start.
//  - M2: no class is kept while another decays. But the covariance reading FAILS: the four start classes end with
//    equal survival on only 6 of 136 cases. Survivals run 0.0085 to 0.4004, and the class that survives best changes
//    from case to case: each of the four wins on some cases (read from the notes, tmp/dar-parse155.ts), none on all.
//    A partner met twice through different links carries a relative frame (the link holonomy between the two paths),
//    which is exactly what breaks the covariance of E-QTM-0154 (A). It favors a class per case, never one class.
//  - C1, diagnosed after the run (tmp/dar-probe5 to 8, the clauses counted separately over the whole family): the role
//    start keeps its line exactly on 136 of 136 cases; the first partner holds a full log 3 record right after the
//    first meeting on 303 of 408 (start, case) pairs, the rest having met another partner first; the other starts end
//    at survival exactly 0 on only 3 of 408, with r from 0.2608 to 0.4132 instead of 1/3. They miss because the partners also meet EACH OTHER by the fear beat, which spoils their role-line
//    ready states, so later SUMs kick back a non-uniform tilt and no longer dephase completely. For the same reason
//    no partner holds the role record at the end (R = 0 over partners and husk columns on every case): the vacuum's
//    own fear beats among the environment swap each single-token record into many-token correlations. The prediction
//    assumed fresh ready states; the vacuum does not supply them.
//
// Depth L2 (the model's own vacuum, knit and fear beat; the calibration is a stand-in). The husk: the fragments are
// read as husk columns first, the bulk tokens beside them. No random numbers: starts are E-MTH-0028's family,
// directions and knot starts are enumerated.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  LINE_CLASSES,
  readerPermutation,
} from '@/code/measure/sum-record'
import {
  GRID_LINES,
  onPoints,
  UNIFORM,
  unitsOf,
} from '@/code/measure/pointer-basis'
import {
  jointTable,
  knotPairs,
  marginalSingle,
  moveBefore,
  movedClass,
  runWhole,
  standInBeat,
  startWhole,
  tableInformation,
  vacuumSchedule,
  type VacuumSchedule,
} from '@/code/measure/vacuum-records'
import { type Whole } from '@/code/rule/fear-weave'

const SIDE = 4
const BEATS = 48
const DELTA = 0.1
const LOG3 = Math.log(3)
const STARTS = GRID_LINES.filter(l => l.points.includes(0))

const READERS = LINE_CLASSES.map(
  c => readerPermutation(c.direction).perm,
)

// the knot's retained weight on its start line carried by its moves, exactly, as [on, units]
function retained(
  s: VacuumSchedule,
  w: Whole,
  startCls: number,
  t: number,
): [bigint, bigint] {
  const line = STARTS.find(l => l.cls === startCls)!.points.map(
    p => s.knotMove[t]![p]!,
  )
  const m = marginalSingle(w, 0)

  return [line.reduce((a, p) => a + m[p]!, 0n), unitsOf(m)]
}

// every partner's best record of each knot class (own frame): the largest I and the knot's H, and negatives
function records(
  s: VacuumSchedule,
  w: Whole,
  t: number,
): { info: number[][]; h: number[]; negative: number } {
  const pairs = knotPairs(w)
  const move = s.knotMove[t]!

  let negative = 0

  const h = [0, 0, 0, 0]
  const info = pairs.map(pair =>
    [0, 1, 2, 3].map(c => {
      const cd = movedClass(move, c)

      let best = 0

      for (let e = 0; e < 4; e++) {
        const r = tableInformation(jointTable(pair, cd, e))

        if (r.negative) {
          negative++
          continue
        }

        h[c] = r.hKnot
        best = Math.max(best, r.info)
      }

      return best
    }),
  )

  return { info, h, negative }
}

export default experiment({
  id: 'quantum/vacuum-redundancy',
  code: 'E-QTM-0155',
  title:
    "no redundant record in the coset-union vacuum: counted exactly over 17 starts, a knot's environment of vacuum tokens holds no record of any class under the fear beat and no class decoheres apart, while a stand-in SUM reader in the knot's own frame makes the role class a pointer basis on the same instrument",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const perStart: {
      name: string
      c1: boolean
      m1: boolean
      m2: boolean
      cases: number
      maxRatio: number
      equalSurvival: number
      memberNegative: number
      memberRecords: number
      standInR: number[]
      standInColumns: number[]
      dockSurvival: string[]
      survivals: string[]
    }[] = []

    for (const member of startFamily(16)) {
      const row = {
        name: member.name,
        c1: true,
        m1: true,
        m2: true,
        cases: 0,
        maxRatio: 0,
        equalSurvival: 0,
        memberNegative: 0,
        memberRecords: 0,
        standInR: [] as number[],
        standInColumns: [] as number[],
        dockSurvival: [] as string[],
        survivals: [] as string[],
      }

      withStart(member, () => {
        for (let d = 0; d < 24; d++) {
          const s = vacuumSchedule(SIDE, d, BEATS)

          if (s.knotMeetings.every(n => n === 0)) {
            continue
          }

          row.cases++

          const firstMeeting = s.knotMeetings.findIndex(n => n > 0)
          const firstPartner = s.partners[0]!

          // the model, ensemble opening, every beat
          const survival: [bigint, bigint][] = []

          for (const start of STARTS) {
            let w = startWhole(s, start.points, () => UNIFORM)

            for (let t = 0; t < BEATS; t++) {
              w = runWhole(s, w, t, t + 1)

              const r = records(s, w, t)

              r.info.forEach(byClass =>
                byClass.forEach((i, c) => {
                  const h = r.h[c]!

                  if (h > 1e-12) {
                    row.maxRatio = Math.max(row.maxRatio, i / h)

                    if (i >= (1 - DELTA) * h) {
                      row.m1 = false
                    }
                  }
                }),
              )
            }

            survival.push(retained(s, w, start.cls, BEATS - 1))
          }

          const exactOne = survival.map(([on, u]) => on === u)
          const below = survival.map(([on, u]) => on < u)

          if (exactOne.some(Boolean) && below.some(Boolean)) {
            row.m2 = false
          }

          row.equalSurvival += survival.every(
            ([on, u]) => on * survival[0]![1] === survival[0]![0] * u,
          )
            ? 1
            : 0

          row.survivals.push(
            survival
              .map(([on, u]) => ((3 * Number(on)) / Number(u) - 1) / 2)
              .map(x => x.toFixed(4))
              .join('/'),
          )

          // the model, member opening, at the end
          for (const start of STARTS) {
            const w = runWhole(
              s,
              startWhole(s, start.points, j =>
                onPoints([s.partnerPoint[j]!]),
              ),
              0,
              BEATS,
            )
            const r = records(s, w, BEATS - 1)

            row.memberNegative += r.negative
            r.info.forEach(byClass =>
              byClass.forEach((i, c) => {
                const h = r.h[c]!

                row.memberRecords +=
                  h > 1e-12 && i >= (1 - DELTA) * h ? 1 : 0
              }),
            )
          }

          // the stand-in: the role reader carried in the knot's own frame, partners on their role line
          const roleLine = (j: number): bigint[] => {
            const p = s.partnerPoint[j]!

            return onPoints([
              3 * Math.floor(p / 3),
              3 * Math.floor(p / 3) + 1,
              3 * Math.floor(p / 3) + 2,
            ])
          }

          const ownReader = (t: number): ArrayLike<number> =>
            READERS[movedClass(moveBefore(s, t), 0)]!
          const dockReader = (): ArrayLike<number> => READERS[0]!
          const dockSurv: string[] = []

          for (const start of STARTS) {
            let w = startWhole(s, start.points, roleLine)

            for (let t = 0; t < BEATS; t++) {
              w = standInBeat(s, w, t, ownReader)

              if (t === firstMeeting && start.cls !== 0) {
                const r = records(s, w, t)
                const j = s.partners.indexOf(firstPartner)
                const i = r.info[j]?.[0] ?? 0

                if (Math.abs(i - LOG3) > 1e-12) {
                  row.c1 = false
                }
              }
            }

            const [on, u] = retained(s, w, start.cls, BEATS - 1)

            if (start.cls === 0 ? on !== u : 3n * on !== u) {
              row.c1 = false
            }

            if (start.cls !== 0) {
              const r = records(s, w, BEATS - 1)
              const holders = r.info
                .map((byClass, j) =>
                  (byClass[0] ?? 0) >= (1 - DELTA) * (r.h[0] ?? 0) &&
                  (r.h[0] ?? 0) > 1e-12
                    ? j
                    : -1,
                )
                .filter(j => j >= 0)

              row.standInR.push(holders.length)
              row.standInColumns.push(
                new Set(holders.map(j => s.partnerColumn[j])).size,
              )
            }

            let wd = startWhole(s, start.points, roleLine)

            for (let t = 0; t < BEATS; t++) {
              wd = standInBeat(s, wd, t, dockReader)
            }

            const [ond, ud] = retained(s, wd, start.cls, BEATS - 1)

            dockSurv.push(
              (((3 * Number(ond)) / Number(ud) - 1) / 2).toFixed(4),
            )
          }

          row.dockSurvival.push(dockSurv.join('/'))
        }
      })

      perStart.push(row)
    }

    const count = (
      f: (r: (typeof perStart)[number]) => boolean,
    ): number => perStart.filter(f).length
    const g = {
      C1: count(r => r.c1),
      M1: count(r => r.m1),
      M2: count(r => r.m2),
    }
    const ok = g.C1 === 17 && g.M1 === 17 && g.M2 === 17
    const maxRatio = Math.max(...perStart.map(r => r.maxRatio))
    const cases = perStart.reduce((a, r) => a + r.cases, 0)
    const equal = perStart.reduce((a, r) => a + r.equalSurvival, 0)
    const standInR = perStart.flatMap(r => r.standInR)
    const standInColumns = perStart.flatMap(r => r.standInColumns)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `on the side-4 coset-union vacuum, over 17 link starts and ${cases} (start, direction) cases, a lone love meets 4 vacuum tokens and under the fear beat none of them ever holds a record of any class of it (R_0.1 = 0 at every beat on ${g.M1} of 17 starts; the largest I / H is ${maxRatio.toFixed(4)}), and no class decoheres apart (${g.M2} of 17); the four start classes end with equal survival on ${equal} of ${cases} cases; the same instrument with a stand-in SUM reader carried in the knot's own frame shows a pointer basis (${g.C1} of 17: role start kept exactly, the others dephased exactly, a full log 3 record in the first partner), with ${Math.min(...standInR)} to ${Math.max(...standInR)} of 4 partners and ${Math.min(...standInColumns)} to ${Math.max(...standInColumns)} husk columns holding the role record at the end`,
      metrics: {
        cases,
        startsC1: g.C1,
        startsM1: g.M1,
        startsM2: g.M2,
        maxInformationRatio: maxRatio,
        equalSurvivalCases: equal,
        memberNegativeTables: perStart.reduce(
          (a, r) => a + r.memberNegative,
          0,
        ),
        memberRecords: perStart.reduce(
          (a, r) => a + r.memberRecords,
          0,
        ),
        standInRedundancyMin: Math.min(...standInR),
        standInRedundancyMax: Math.max(...standInR),
        standInHuskColumnsMin: Math.min(...standInColumns),
        standInHuskColumnsMax: Math.max(...standInColumns),
        gate_C1: g.C1 === 17 ? 1 : 0,
        gate_M1: g.M1 === 17 ? 1 : 0,
        gate_M2: g.M2 === 17 ? 1 : 0,
        seconds: (Date.now() - started) / 1000,
      },
      notes: `Per start (cases; max I/H; equal-survival cases; model survivals role/tilt/diagonal/antidiagonal start per direction; stand-in dock-frame survivals): ${perStart.map(r => `${r.name} ${r.cases}; ${r.maxRatio.toFixed(4)}; ${r.equalSurvival}; ${r.survivals.join(' ')}; dock ${r.dockSurvival.join(' ')}`).join(' | ')}. Stand-in R over partners ${JSON.stringify(standInR)}, over husk columns ${JSON.stringify(standInColumns)}. L2, exact integer wholes (9^5), readings in reals.`,
    })
  },
})
