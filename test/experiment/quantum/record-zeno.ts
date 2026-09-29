// No Zeno from repeated copying: a record commutes with the fear beat's meeting, so recording a knot every beat
// cannot shrink a step that is one beat long.
//
// THE QUESTION. Quantum Zeno says frequent records freeze a transition. E-QTM-0116 and E-QTM-0129 found that a
// meeting is a finite step and repeated records never freeze it. Here the records are the copies quantum Darwinism
// needs (E-QTM-0155's stand-in: an ideal copy of the knot's class into a fresh ancilla, which on the knot is full
// dephasing in that class), repeated as often as the model allows, once per beat, on the coset-union vacuum.
//
// THE REASON, derived before the run. Zeno needs the unrecorded loss over a step tau to be quadratic, 1 - O(tau^2),
// so that n records per step leave n (tau/n)^2 -> 0. The model's finest step is a beat, and a knot's change in a beat
// is a meeting. With the frame-invariant environment a meeting is lambda id + (1 - lambda) flat (E-QTM-0154), which
// commutes with every record: the loss (1 - lambda = 3/4 like, 1/3 love-fear) is first order in the meeting and no
// placement of records changes it.
//
// THE SETUP. E-QTM-0155's knot, schedule and environment (the ensemble opening). The knot starts on the line of each
// class through its own point; the record is of that class, carried in the knot's own frame. Record period P: a record
// after every P-th beat, P = 1 (every beat, the finest possible) and P = infinity (none).
//
// Gates, fixed before the first run:
//  Z1 (role grid, exact) a record commutes with a meeting against the frame-invariant environment: for both kernels,
//     all 81 own-point pairs and all 4 classes (648 cases), record o meeting = meeting o record on the knot's 9 point
//     members, exactly.
//  Z2 (vacuum, each of the 17 starts) the step is not shrunk: on every direction with a knot meeting and every start
//     class, with a record every beat the knot's survival right after its first meeting is exactly the one-meeting
//     lambda of that meeting's kernel (1/4 like, 2/3 love-fear), exactly what it is with no record.
// Readings (not gated): the end survival at P = 1 against P = infinity on every case (a freeze would read 1 at P = 1);
// how many cases differ between the two at the end (a knot met twice by one partner through different links need
// not commute with the record); and, on the role grid, how many meetings with a POINT member environment commute
// with the record (that environment is not frame invariant, so the theorem does not cover it).
// Verdict: pass if Z1 holds and Z2 holds on 17 of 17 starts; fail otherwise.
//
// FIRST RUN (2026-09-26, 842 s, tmp/dar-record-zeno.log): pass, both gates on the first run, no gate moved.
//  - Z1: 648 of 648. With a POINT member environment the record commutes in 0 of 648 (reading).
//  - Z2: 17 of 17; the first-meeting survival is exactly 2/3 or 1/4 with and without records on all 544 runs.
//  - Readings: at the end of 48 beats the records change the survival on all 544 runs, lowering it on 474 and raising
//    it on 70 (largest rise 0.1055, largest fall 0.1445, tmp/dar-parse156.ts); the largest survival with a record
//    every beat is 0.2757. So once a partner is met twice the record no longer commutes (the relative frame of
//    E-QTM-0155), and recording mostly speeds the loss (anti-Zeno), never freezes it.
//
// Depth L2. The husk is not read: survival is a role-grid number; the schedule is the bulk knit's on the side-4
// box. No random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { exactFearKernels } from '@/code/rule/fear-kernel-exact'
import {
  applyMap,
  GRID_LINES,
  meetingMap,
  onPoints,
  UNIFORM,
  unitsOf,
} from '@/code/measure/pointer-basis'
import {
  marginalSingle,
  movedClass,
  recordKnot,
  runWhole,
  startWhole,
  vacuumSchedule,
  type VacuumSchedule,
} from '@/code/measure/vacuum-records'
import { type Whole } from '@/code/rule/fear-weave'

const SIDE = 4
const BEATS = 48
const STARTS = GRID_LINES.filter(l => l.points.includes(0))

// full dephasing of 9 weights in a class: each point takes its line's sum (units times 3)
const dephase = (w: readonly bigint[], cls: number): bigint[] => {
  const lines = GRID_LINES.filter(l => l.cls === cls)

  return Array.from({ length: 9 }, (_, p) =>
    lines
      .find(l => l.points.includes(p))!
      .points.reduce((s, x) => s + w[x]!, 0n),
  )
}

// the map composed both ways on every point member, compared as ratios
function commutes(map: { columns: bigint[][] }, cls: number): boolean {
  for (let x = 0; x < 9; x++) {
    const delta = onPoints([x])
    const a = dephase(applyMap(map, delta), cls)
    const b = applyMap(map, dephase(delta, cls))
    const ua = unitsOf(a)
    const ub = unitsOf(b)

    if (!a.every((v, i) => v * ub === b[i]! * ua)) {
      return false
    }
  }

  return true
}

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

const survivalOf = ([on, u]: [bigint, bigint]): number =>
  ((3 * Number(on)) / Number(u) - 1) / 2

export default experiment({
  id: 'quantum/record-zeno',
  code: 'E-QTM-0156',
  title:
    'no Zeno from repeated copying: a record commutes with every meeting against the frame-invariant environment, so a knot recorded every beat in the coset-union vacuum still loses exactly 3/4 (like) or 1/3 (love-fear) of its class label at its first meeting',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const kernels = exactFearKernels({
      like: 1,
      unlike: 1,
      likeExchanged: false,
    })
    const kinds = [
      { kernel: kernels.like, divisor: kernels.likeDivisor },
      { kernel: kernels.unlike, divisor: kernels.unlikeDivisor },
    ]

    // Z1 and the member reading
    let z1 = 0
    let memberCommute = 0
    let memberCases = 0

    for (const k of kinds) {
      for (let q = 0; q < 9; q++) {
        for (let p = 0; p < 9; p++) {
          const ensemble = meetingMap({
            kernel: k.kernel,
            divisor: k.divisor,
            env: UNIFORM,
            own: [q, p],
          })
          const member = meetingMap({
            kernel: k.kernel,
            divisor: k.divisor,
            env: onPoints([p]),
            own: [q, p],
          })

          for (let c = 0; c < 4; c++) {
            z1 += commutes(ensemble, c) ? 1 : 0
            memberCommute += commutes(member, c) ? 1 : 0
            memberCases++
          }
        }
      }
    }

    // Z2 and the readings on the vacuum
    const perStart: {
      name: string
      z2: boolean
      cases: number
      firstSurvival: Set<string>
      differ: number
      end: string[]
      maxEndWithRecords: number
    }[] = []

    for (const member of startFamily(16)) {
      const row = {
        name: member.name,
        z2: true,
        cases: 0,
        firstSurvival: new Set<string>(),
        differ: 0,
        end: [] as string[],
        maxEndWithRecords: -1,
      }

      withStart(member, () => {
        for (let d = 0; d < 24; d++) {
          const s = vacuumSchedule(SIDE, d, BEATS)
          const first = s.knotMeetings.findIndex(n => n > 0)

          if (first < 0) {
            continue
          }

          row.cases++

          const firstRecord = s.records[first]
          const at =
            firstRecord?.meetings.findIndex(
              ([a, b]) => a === s.knot || b === s.knot,
            ) ?? -1
          const [sa, sb] = firstRecord?.signs?.[at] ?? [1, 1]
          const lambda = sa === sb ? 0.25 : 2 / 3
          const ends: string[] = []

          for (const start of STARTS) {
            const w0 = startWhole(s, start.points, () => UNIFORM)

            let wr = w0
            let wn = w0

            for (let t = 0; t < BEATS; t++) {
              wr = recordKnot(
                runWhole(s, wr, t, t + 1),
                movedClass(s.knotMove[t]!, start.cls),
              )
              wn = runWhole(s, wn, t, t + 1)

              if (t === first) {
                const [on, u] = retained(s, wr, start.cls, t)
                const [onN, uN] = retained(s, wn, start.cls, t)
                // survival (3 r - 1) / 2 = lambda exactly: 3 on - u = 2 lambda u
                const target = sa === sb ? [1n, 4n] : [2n, 3n]
                const exact =
                  (3n * on - u) * target[1]! === 2n * target[0]! * u &&
                  (3n * onN - uN) * target[1]! === 2n * target[0]! * uN

                if (!exact) {
                  row.z2 = false
                }

                row.firstSurvival.add(
                  `${survivalOf([on, u]).toFixed(6)}(${lambda.toFixed(4)})`,
                )
              }
            }

            const er = survivalOf(retained(s, wr, start.cls, BEATS - 1))
            const en = survivalOf(retained(s, wn, start.cls, BEATS - 1))

            row.differ += Math.abs(er - en) > 1e-12 ? 1 : 0
            row.maxEndWithRecords = Math.max(row.maxEndWithRecords, er)
            ends.push(`${er.toFixed(4)}:${en.toFixed(4)}`)
          }

          row.end.push(ends.join('/'))
        }
      })

      perStart.push(row)
    }

    const z1ok = z1 === 648
    const z2 = perStart.filter(r => r.z2).length
    const ok = z1ok && z2 === 17
    const cases = perStart.reduce((a, r) => a + r.cases, 0)
    const differ = perStart.reduce((a, r) => a + r.differ, 0)
    const maxEnd = Math.max(...perStart.map(r => r.maxEndWithRecords))

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `a record commutes with a meeting against the frame-invariant environment in ${z1} of 648 cases (both kernels, 81 own-point pairs, 4 classes), and on the coset-union vacuum a knot recorded every beat, the finest time, still keeps exactly 1/4 (like) or 2/3 (love-fear) of its class label at its first meeting, as without records (${z2} of 17 starts, ${cases} cases x 4 start classes); at the end of 48 beats the largest survival with a record every beat is ${maxEnd.toFixed(4)} and the records change the end survival in ${differ} of ${cases * 4} runs: no freeze`,
      metrics: {
        z1Commuting: z1,
        memberCommuting: memberCommute,
        memberCases,
        startsZ2: z2,
        cases,
        endDiffers: differ,
        maxEndSurvivalWithRecords: maxEnd,
        gate_Z1: z1ok ? 1 : 0,
        gate_Z2: z2 === 17 ? 1 : 0,
        seconds: (Date.now() - started) / 1000,
      },
      notes: `Per start (first-meeting survivals with the kernel's lambda; end survival with a record every beat : with none, per start class role/tilt/diagonal/antidiagonal, per direction): ${perStart.map(r => `${r.name} ${[...r.firstSurvival].join(',')}; ${r.end.join(' ')}`).join(' | ')}. L2, exact integer wholes (9^5), readings in reals.`,
    })
  },
})
