// The arrow of time on the adopted knit: records form only away from the low-entropy slice, in both run directions
// (E-FND-0147).
//
// THE THEOREM, stated before any run. Let U be the beat, a bijection of the finite state space (E-RLT-0084 B4).
//  (1) Fine-grained information is conserved: an ensemble of n equally weighted microstates is carried to n distinct
//      microstates, so its fine-grained entropy ln n never changes (measured in E-FND-0146 G4). No rule of this kind
//      can make an arrow.
//  (2) The inverse is as local as the rule: U^-1 undoes the stream (one dock back) and the collision (per dock). So the
//      causal cone is the same both ways: a change at dock x at time 0 can reach dock y at time t only if y is within
//      |t| streams of x, whichever way t runs.
//  (3) So a coarse correlation between a region and an event at the slice t = 0 is exactly absent inside the cone and
//      can form only for |t| beyond it, in BOTH directions. If the slice is the history's low-entropy slice, every
//      record of it points away from it: the "future" of each branch is the direction away from the slice. The arrow
//      is the boundary condition plus the coarse map; the rule supplies only the cone.
//
// THE RECORD, defined before the first run. A record at time t of an event is a husk correlation that persists: the
// correlation, over an ensemble, between the event and a coarse husk quantity of a region the event did not touch,
// which forms and then stays. The event: how many extra vibes husk block 0 holds at the slice, e in {8, 12, 16, 20, 24}
// per dock (e x 324 vibes). The region F: every husk block at block distance 2 from block 0 along some axis (the side-12
// husk cut into 64 blocks of 3 x 3 x 3 columns; F is 37 of them, never touching block 0: every column of F is at least
// 4 husk steps from every column of block 0 along one axis). The record R(t) = the correlation, over the 85 runs (17
// link starts x 5 events), of e with E_F(t), the energy in F.
//
// THE CONE, derived: a root moves the husk column by at most one step per axis per beat, so a copy from block 0 needs
// at least 4 beats to enter F. Before that E_F(t) cannot depend on e at all (within one link start, exactly).
//
// Gates, fixed before the first run (no probe of R was run before this file):
//  R0 the slice holds no record: E_F(0) is the same integer in all 85 runs
//  R1 the cone, exact: within each link start, E_F(t) is the same for all 5 events at every |t| < 4, both directions
//  R2 records form and persist, forward: R(t) >= 0.8 at every beat from 60 to 120
//  R3 the same on the backward run (the rule's exact inverse from the same slice): R(t) >= 0.8 at every beat from -60
//     to -120
//  R4 instrument: energy and charge exact in every run
// Verdict: pass if all hold; fail if R0, R1 and R4 hold and R2 or R3 fails; partial otherwise.
//
// Reported, not gated: the first beat each way with R >= 0.5, R at every tenth beat, the bulk reading beside (F
// restricted to its docks in the lower depth half, v4 mod L < L / 2, a bulk region), and the largest |R_forward(t) - R_backward(-t)|.
//
// DISCLOSED: a probe (tmp/arrow-probe3.ts) measured, on the same knit, a different record reader first: the two-time
// correlation of the ensemble's block energy fluctuations, corr(delta_s, delta_(s + D)) against corr(delta_s,
// delta_(s - D)). Its asymmetry read noise at 17 members (-0.25 to 0.45, no sign), and block energy fluctuations at 4 x
// 4 x 4 columns forget in about 4 beats (0.76, 0.46, 0.07 at lags 1, 2, 4), so that reader was dropped for this one.
// It is not a result of this file.
//
// FIRST RUN (123 s): pass, every gate, recorded as is. The second run (133 s, the record) only added the readout of the
// beat where the two branches differ most and R at beats 1 to 10; every gate and number is identical. That beat is 14:
// one branch's record dips to about -0.54 for a few beats (the far region's energy swinging as the first front passes
// and wraps the 12-dock box) and is back above 0.94 by beat 20; the late records agree to 0.01. Title written after
// the runs.
//
// Depth L2: a theorem plus its measurement on the adopted knit, read on the husk. DETERMINISM: Weyl fills and the 17
// link starts. NOTHING MOVES: the stream copies.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  arrowBox,
  chargeOf,
  correlation,
  energyOf,
  lowEntropyStart,
  twoWay,
  type ArrowBox,
} from '@/code/measure/second-law-husk'
import { type Reduced } from '@/code/measure/living-pair-kernel'
import { startFamily, withStart } from '@/code/measure/start-ensemble'

const SIDE = 12
const BLOCK = 3
const EVENTS = [8, 12, 16, 20, 24]
const BEATS = 120
const CONE = 4

// per dock: 1 if its husk block is at block distance 2 from block 0 along some axis (4 blocks per axis)
function farRegion(box: ArrowBox): Uint8Array {
  const per = box.side / box.blockSide

  return Uint8Array.from(box.block, b => {
    const c = [
      b % per,
      Math.floor(b / per) % per,
      Math.floor(b / (per * per)),
    ]

    return c.some(v => v === 2) ? 1 : 0
  })
}

function regionEnergy(
  box: ArrowBox,
  region: Uint8Array,
  s: Reduced,
  bulkThird: boolean,
): number {
  let e = 0

  for (let x = 0; x < box.cells; x++) {
    if (!region[x]) {
      continue
    }

    // the lower depth half by v4 mod L (v4 mod 2L is not defined on the box: the period L (0, 0, 1, 1) shifts it by L)
    if (bulkThird && box.depth[x]! % box.side >= box.side / 2) {
      continue
    }

    for (let d = 0; d < 24; d++) {
      if (s.vibe[x * 24 + d] !== 0) {
        e++
      }
    }

    for (let l = 0; l < 12; l++) {
      if (s.store[x * 12 + l] !== 0) {
        e += 2
      }
    }
  }

  return e
}

export default experiment({
  id: 'foundations/husk-arrow-records',
  code: 'E-FND-0147',
  title:
    'the arrow of time on the adopted knit, pass: a bijective beat keeps fine-grained information and has the same causal cone both ways, so the arrow is the low-entropy slice plus the coarse map; measured over 85 runs (17 link starts x 5 events), the energy of a husk region 4 steps from the slice event is the same integer in every run at the slice and, within a start, for every event until beat 4 in both directions (the cone, exact), then the record (its correlation with the event) reaches 1.00 at beat 4 and holds 0.985 to 0.993 from beat 60 to 120 forward and backward (bulk half 0.95 to 0.98); one branch dips to about -0.54 at beat 14 as the first front wraps the box',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const members = startFamily(16)
    // husk[run][t + BEATS], bulk[run][t + BEATS]
    const husk: Float64Array[] = []
    const bulk: Float64Array[] = []
    const eventOf: number[] = []
    const memberOf: number[] = []

    let exact = true

    members.forEach((member, k) => {
      const box = withStart(member, () => arrowBox(SIDE, BLOCK))
      const region = farRegion(box)

      for (const e of EVENTS) {
        const start = lowEntropyStart(box, {
          blocks: [0],
          perDock: e,
          phase: k,
        })
        const h = new Float64Array(2 * BEATS + 1)
        const b = new Float64Array(2 * BEATS + 1)
        const energy = energyOf(start)
        const charge = chargeOf(start)

        h[BEATS] = regionEnergy(box, region, start, false)
        b[BEATS] = regionEnergy(box, region, start, true)

        for (const direction of [1, -1]) {
          const r = twoWay(box, start)

          for (let t = 1; t <= BEATS; t++) {
            if (direction > 0) {
              r.forward()
            } else {
              r.backward()
            }

            const s = r.state()

            if (t % 10 === 0 || t === BEATS) {
              exact =
                exact &&
                energyOf(s) === energy &&
                chargeOf(s) === charge
            }

            h[BEATS + direction * t] = regionEnergy(
              box,
              region,
              s,
              false,
            )

            b[BEATS + direction * t] = regionEnergy(
              box,
              region,
              s,
              true,
            )
          }
        }

        husk.push(h)
        bulk.push(b)
        eventOf.push(e)
        memberOf.push(k)
      }

      log(`member ${member.name}`)
    })

    const runs = husk.length
    const event = Float64Array.from(eventOf)
    const eventMean = event.reduce((a, b) => a + b, 0) / runs
    const centeredEvent = Float64Array.from(event, v => v - eventMean)

    const recordAt = (rows: Float64Array[], t: number): number => {
      const column = Float64Array.from(rows, r => r[BEATS + t]!)
      const mean = column.reduce((a, b) => a + b, 0) / runs

      return correlation(
        centeredEvent,
        Float64Array.from(column, v => v - mean),
      )
    }

    const huskR = Array.from({ length: 2 * BEATS + 1 }, (_, i) =>
      recordAt(husk, i - BEATS),
    )
    const bulkR = Array.from({ length: 2 * BEATS + 1 }, (_, i) =>
      recordAt(bulk, i - BEATS),
    )
    const R = (t: number): number => huskR[BEATS + t]!

    const r0 = husk.every(h => h[BEATS] === husk[0]![BEATS])

    // the cone: within one link start, every event gives the same E_F at |t| < CONE; and the first |t| where they differ
    const firstDifference = (direction: 1 | -1): number => {
      for (let t = 1; t <= BEATS; t++) {
        for (let k = 0; k < members.length; k++) {
          const rows = husk.filter((_, i) => memberOf[i] === k)

          if (
            rows.some(
              h =>
                h[BEATS + direction * t] !==
                rows[0]![BEATS + direction * t],
            )
          ) {
            return t
          }
        }
      }

      return BEATS + 1
    }

    const coneForward = firstDifference(1)
    const coneBackward = firstDifference(-1)
    const r1 = coneForward >= CONE && coneBackward >= CONE
    const lateForward = Array.from({ length: BEATS / 2 + 1 }, (_, i) =>
      R(BEATS / 2 + i),
    )
    const lateBackward = Array.from({ length: BEATS / 2 + 1 }, (_, i) =>
      R(-(BEATS / 2 + i)),
    )
    const r2 = lateForward.every(x => x >= 0.8)
    const r3 = lateBackward.every(x => x >= 0.8)
    const r4 = exact

    const firstHalf = (direction: 1 | -1): number => {
      for (let t = 1; t <= BEATS; t++) {
        if (R(direction * t) >= 0.5) {
          return t
        }
      }

      return -1
    }

    let asymmetry = 0
    let asymmetryBeat = 0

    for (let t = 1; t <= BEATS; t++) {
      if (Math.abs(R(t) - R(-t)) > asymmetry) {
        asymmetry = Math.abs(R(t) - R(-t))
        asymmetryBeat = t
      }
    }

    const early = Array.from({ length: 10 }, (_, i) => i + 1)
      .map(t => `${t}:${R(t).toFixed(2)}/${R(-t).toFixed(2)}`)
      .join(' ')

    const status =
      r0 && r1 && r4 ? (r2 && r3 ? 'pass' : 'fail') : 'partial'
    const tenth = (rows: number[]): string =>
      Array.from(
        { length: 2 * (BEATS / 10) + 1 },
        (_, i) => (i - BEATS / 10) * 10,
      )
        .map(t => `${t}:${rows[BEATS + t]!.toFixed(2)}`)
        .join(' ')

    return verdict({
      status,
      claim: `on the coset-union vacuum under the lone bounce collision (side ${SIDE}, 17 link starts x 5 events), the energy of a husk region 4 steps from the slice's event is the same integer in every run at the slice and, within each start, for every event until beat ${coneForward} forward and ${coneBackward} backward (the cone); the record R, the correlation of the event with that energy, first reaches 0.5 at beat ${firstHalf(1)} forward and ${firstHalf(-1)} backward and holds ${Math.min(...lateForward).toFixed(3)} to ${Math.max(...lateForward).toFixed(3)} forward and ${Math.min(...lateBackward).toFixed(3)} to ${Math.max(...lateBackward).toFixed(3)} backward over beats 60 to 120: records of the low-entropy slice form only away from it, in both run directions`,
      metrics: {
        gate_R0: r0 ? 1 : 0,
        gate_R1: r1 ? 1 : 0,
        gate_R2: r2 ? 1 : 0,
        gate_R3: r3 ? 1 : 0,
        gate_R4: r4 ? 1 : 0,
        runs,
        coneForward,
        coneBackward,
        firstHalfForward: firstHalf(1),
        firstHalfBackward: firstHalf(-1),
        lateForwardMin: Math.min(...lateForward),
        lateBackwardMin: Math.min(...lateBackward),
        largestDirectionDifference: asymmetry,
        bulkLateForwardMin: Math.min(
          ...Array.from(
            { length: BEATS / 2 + 1 },
            (_, i) => bulkR[BEATS + BEATS / 2 + i]!,
          ),
        ),
        bulkLateBackwardMin: Math.min(
          ...Array.from(
            { length: BEATS / 2 + 1 },
            (_, i) => bulkR[BEATS - BEATS / 2 - i]!,
          ),
        ),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        sliceHoldsNoRecord: r0 ? 1 : 0,
        coneExact: r1 ? 1 : 0,
      },
      notes: `L2. Gates R0 ${r0}, R1 ${r1}, R2 ${r2}, R3 ${r3}, R4 ${r4}. Husk R by beat (negative = the backward run): ${tenth(huskR)}. Bulk beside (F's docks in the lower depth half): ${tenth(bulkR)}. Largest |R(t) - R(-t)| ${asymmetry.toFixed(3)} at beat ${asymmetryBeat}; R forward/backward at beats 1 to 10: ${early}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
