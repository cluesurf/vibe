// The horizon with no hair, its radius against the box (E-GRV-0114): how the clock horizon's radius law moves toward
// Schwarzschild's r ~ M as the box grows and the reference dock the depth is read against moves away, read on the
// statics of the no-hair rule (code/rule/count-horizon, code/measure/count-horizon countStatics).
//
// WHY (note/research/vibe/roadmap/discrete-gravity.md, "Measured, the clock horizon"). E-GRV-0111 read a log slope of
// 0.64 for radius against M on the side-24 box, 0.76 on a side-96 statics read and 0.88 on the infinite stack, and put
// about half the gap to 1 on the box: the reference sits 21 docks away. This file fills in the sequence at one stack
// depth (3 layers on every box, so the stack's modes are the same and only the box moves) for the no-hair rule.
//
// DERIVED BEFORE THE RUN. Read against a reference at r_ref, the criterion is M (G(r_h) - G(r_ref)) = CAP (less the
// sinks' share). Where G is k / r: 1 / r_h = CAP / (k M) + 1 / r_ref, so
//   d ln r_h / d ln M = 1 - r_h / r_ref,
// the slope falls short of 1 by the horizon's size over the reference's distance. The reference is the husk corner,
// sqrt(3) side / 2 away: 20.8, 27.7 and 41.6 for sides 24, 32, 48. With r_h about 3 .. 6, the shortfall is about 0.2,
// 0.16 and 0.11: the slope RISES with the box, by about 0.05 a step, on top of the stack's own shortfall (its massive
// modes, which the infinite stack's slope measures). The field criterion (E-GRV-0108's: a dock whose 18 husk links all
// carry a line) reads no depth and no reference, so its radius should not move with the box at all.
// THE RADIUS. The farthest horizon dock's distance moves in steps of a lattice shell (a slope over a factor 2.7 in M
// carries about 0.05 of quantization), which is the size of the effect, so the gate reads the VOLUME radius,
// (3 h / (4 pi))^(1/3) for h horizon docks, and the farthest dock is reported.
//
// THE RUN (linear solves only; no beat is run, so this is a read of the rule's statics: E-GRV-0111 showed the rule joins
// exactly the statics' docks on placed lumps). The warped shrinking stack of 3 layers under husks of side 24, 32, 48;
// the compressed lumps (code/measure/step-depth compressLump, capacity 1) M = 600, 800, 1200, 1600 at the box's center,
// sinks spread from 9 (code/measure/clock-horizon spreadSinks); CAP 3/2 against dock 0.
//
// GATES, fixed before the first run of this file.
//  P1 the no-hair clock horizon's volume-radius slope rises strictly with the box: s(24) < s(32) < s(48).
//  K  (a control that should NOT move) the field criterion's volume-radius slope changes by at most 0.05 from side 24 to
//     side 48.
// REPORTED: every radius (volume and farthest), the held rule's (clockStatics) beside the no-hair rule's, the infinite
// stack's slope (code/measure/clock-horizon stackDepthRadius, reference at infinity), and 1 - r_h / r_ref beside each
// measured slope. NOT GATED AT 1: no prediction puts any finite box at 1.
// Verdict: pass if P1 holds with K; partial if K fails; fail otherwise.
//
// FIRST RUN (tmp/nohair-scaling-run1.log, 125 s, the record): PASS. The volume-radius slope 0.670, 0.699, 0.738 at sides
// 24, 32, 48 (farthest dock: radius 3.16 .. 5.83, 3.16 .. 6.00, 3.32 .. 6.48), rising with the box; the field criterion's
// 0.495 at every side (K: moved 0). The no-hair statics join exactly the held statics' docks on every lump (109 .. 779,
// 109 .. 855, 118 .. 1,051): the spread changes the field inside, not where the cap is reached. The pure-1/r box
// correction 1 - r_h / r_ref is 0.795, 0.842, 0.890 and the infinite stack's slope 0.877, so the measured slopes sit
// about 0.13 to 0.15 under the box correction alone: the stack's massive modes, which do not move with the side, carry
// the rest. At this stack depth and these M, r ~ M is not reached on any box, and the approach is about 0.03 a step in
// side. Title written after the run.
//
// Depth L1: a derivation (the slope's box correction) checked on linear statics of the rule; no dynamics.
// DETERMINISM: every source is placed; nothing is drawn.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { linearFit } from '@/code/measure/regression'
import { radionMesh } from '@/code/rule/trit-radion'
import { stepRule } from '@/code/rule/step-depth'
import {
  openMesh,
  warpClock,
  type OpenMesh,
} from '@/code/rule/open-husk'
import { horizonOf, horizonRule } from '@/code/rule/horizon-husk'
import { clockHorizonRule } from '@/code/rule/clock-horizon'
import { compressLump } from '@/code/measure/step-depth'
import { huskDistance, stackModes } from '@/code/measure/open-husk'
import {
  clockStatics,
  spreadSinks,
  stackDepthRadius,
} from '@/code/measure/clock-horizon'
import { countStatics } from '@/code/measure/count-horizon'

const DEPTH = 16
const LEVELS = 3
const BULK = 81
const LAYERS = 3
const CAP = 1.5
const SINKS_FROM = 9
const SIDES: readonly number[] = [24, 32, 48]
const MASSES: readonly number[] = [600, 800, 1200, 1600]
const FIELD_TOLERANCE = 0.05
const TOLERANCE = 1e-11

const slopeOf = (
  ms: readonly number[],
  rs: readonly number[],
): number =>
  linearFit({ xs: ms.map(Math.log), ys: rs.map(Math.log) }).slope
const volumeRadius = (docks: number): number =>
  Math.cbrt((3 * docks) / (4 * Math.PI))

type Read = { docks: number; volume: number; farthest: number }

function readHorizon(
  mesh: OpenMesh,
  horizon: Uint8Array,
  center: readonly number[],
): Read {
  let docks = 0
  let farthest = 0

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (horizon[y]) {
      docks++
      farthest = Math.max(farthest, huskDistance(mesh, y, center))
    }
  }

  return { docks, volume: volumeRadius(docks), farthest }
}

export default experiment({
  id: 'gravity/count-horizon-scaling',
  code: 'E-GRV-0114',
  title:
    "the clock horizon's radius law moves toward M as the box grows, but slowly, pass on the derived direction: on the statics of the no-hair rule the volume-radius slope for compressed M = 600 .. 1600 is 0.670, 0.699, 0.738 on sides 24, 32, 48 (reference 20.8, 27.7, 41.6 docks away) while the field criterion stays at 0.495; the box correction alone would give 0.80 .. 0.89 and the infinite stack gives 0.88, so the stack's massive modes hold the rest of the gap; the no-hair spread joins exactly the held statics' docks",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(`${what} ${(Date.now() - started) / 1000}s`)
    const metrics: Record<string, number> = {}
    const clockSlope: number[] = []
    const fieldSlope: number[] = []
    const lines: string[] = []

    for (const side of SIDES) {
      const mesh = warpClock(openMesh(side, LAYERS, 'shrink'))
      const rule = clockHorizonRule(
        horizonRule(stepRule(DEPTH, LEVELS), BULK),
        CAP,
      )
      const center = [side / 2, side / 2, side / 2]
      const reference = huskDistance(mesh, rule.reference, center)
      const noHair: Read[] = []
      const held: Read[] = []
      const field: Read[] = []

      for (const m of MASSES) {
        const sinks = spreadSinks(mesh, center, m, SINKS_FROM)
        const lump = compressLump(
          radionMesh([side, side, side]),
          center,
          m,
          1,
          sinks,
        )
        const rho = new Int32Array(mesh.docks)
        const line = new Int8Array(mesh.links)

        rho.set(lump.content)
        line.set(lump.line)
        noHair.push(
          readHorizon(
            mesh,
            countStatics(mesh, rule, rho, TOLERANCE).horizon,
            center,
          ),
        )

        held.push(
          readHorizon(
            mesh,
            clockStatics(mesh, rule, rho, TOLERANCE).horizon,
            center,
          ),
        )
        field.push(readHorizon(mesh, horizonOf(mesh, line), center))
        log(`side ${side} M ${m}`)
      }

      const s = slopeOf(
        MASSES,
        noHair.map(r => r.volume),
      )
      const sField = slopeOf(
        MASSES,
        field.map(r => r.volume),
      )
      const meanRadius =
        noHair.reduce((t, r) => t + r.volume, 0) / noHair.length
      const modes = stackModes(mesh.sides, 'clock')
      const infinite = slopeOf(
        MASSES,
        MASSES.map(m => stackDepthRadius(modes, m, CAP)),
      )

      clockSlope.push(s)
      fieldSlope.push(sField)
      metrics[`side${side}_reference`] = reference
      metrics[`side${side}_slopeVolume`] = s
      metrics[`side${side}_slopeFarthest`] = slopeOf(
        MASSES,
        noHair.map(r => r.farthest),
      )

      metrics[`side${side}_heldSlopeVolume`] = slopeOf(
        MASSES,
        held.map(r => r.volume),
      )

      metrics[`side${side}_heldSlopeFarthest`] = slopeOf(
        MASSES,
        held.map(r => r.farthest),
      )
      metrics[`side${side}_fieldSlopeVolume`] = sField
      metrics[`side${side}_boxPrediction`] = 1 - meanRadius / reference
      metrics[`side${side}_infiniteSlope`] = infinite
      MASSES.forEach((m, i) => {
        metrics[`side${side}_M${m}_docks`] = noHair[i]!.docks
        metrics[`side${side}_M${m}_volume`] = noHair[i]!.volume
        metrics[`side${side}_M${m}_farthest`] = noHair[i]!.farthest
        metrics[`side${side}_M${m}_heldDocks`] = held[i]!.docks
        metrics[`side${side}_M${m}_fieldDocks`] = field[i]!.docks
      })

      lines.push(
        `side ${side} (reference ${reference.toFixed(1)}): volume radius ${noHair.map(r => r.volume.toFixed(2)).join(', ')} (slope ${s.toFixed(3)}), farthest ${noHair.map(r => r.farthest.toFixed(2)).join(', ')}, held docks ${held.map(r => r.docks).join(', ')} against no-hair ${noHair.map(r => r.docks).join(', ')}, field ${field.map(r => r.volume.toFixed(2)).join(', ')} (slope ${sField.toFixed(3)}), 1 - r_h / r_ref ${(1 - meanRadius / reference).toFixed(3)}, infinite stack ${infinite.toFixed(3)}`,
      )
    }

    const p1 = clockSlope.every(
      (s, i) => i === 0 || s > clockSlope[i - 1]!,
    )
    const fieldMoved = Math.abs(
      fieldSlope[fieldSlope.length - 1]! - fieldSlope[0]!,
    )
    const k = fieldMoved <= FIELD_TOLERANCE
    const status = !k ? 'partial' : p1 ? 'pass' : 'fail'

    metrics.gate_P1 = p1 ? 1 : 0
    metrics.control_K = k ? 1 : 0
    metrics.fieldMoved = fieldMoved
    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `the no-hair clock horizon (cap ${CAP} against the husk corner) of compressed lumps M = ${MASSES.join(', ')} on the ${LAYERS}-layer warped shrinking stack: volume-radius slope ${SIDES.map((side, i) => `${clockSlope[i]!.toFixed(3)} at side ${side}`).join(', ')}; the field criterion's ${fieldSlope.map(s => s.toFixed(3)).join(', ')}`,
      metrics,
      control: { k: k ? 1 : 0, fieldMoved },
      notes: `L1. P1 ${p1}, K ${k}. ${lines.join('. ')}.`,
    })
  },
})
