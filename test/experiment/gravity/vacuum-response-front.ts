// Induced gravity, the front (E-GRV-0082): when a lump is placed in the working vacuum with G at beat 0 (E-GRV-0081's
// construction), how does the vacuum's response spread: at a speed (and is it the light's), diffusively, or by the
// chaotic scramble? A depth set by content must reach a distant column at a finite speed, as the radion's pull did
// (E-GRV-0080: 1.04 c_s by its pulse's half-peak).
//
// THE RUN. E-GRV-0081's vacuum, path and readings (code/measure/vacuum-response) on a larger box, side 12 (1,728 husk
// columns of 12 docks, mesh distance r = 0 .. 9 from the center column), 144 beats; the lump is the content-3 love of
// E-GRV-0081 (the center dock's three frames, a point source); the control is the same vacuum with no lump; the 17
// starts of E-MTH-0028. THE READINGS, fixed before the gated run:
//   t_first(r)  the first beat after which any column at mesh distance r differs from the control in any reading
//               (an exact integer comparison), per start
//   Delta(t, r) reading (a) occupied, lump minus control, the shell mean per column after beat t, over the 17 starts
//   plateau(r)  Delta averaged over beats 96 .. 143 (cycles 8 to 11)
//   t_half(r)   the first beat t with Delta(t, r) >= plateau(r) / 2
// The stream takes a value one dock along per beat and a dock's husk shadow moves one mesh step, so the rule's own cone
// is 1 mesh step a beat: nothing can differ at r before beat r.
//
// GATES, fixed before the gated run.
//  F1 causal: on every start, t_first(r) >= r at every r = 1 .. 9 and t_first never decreases with r
//  F2 a finite speed: t_half(r) on r = 2 .. 6, fitted by t = t0 + r / v (least squares), has v > 0, v <= 1.1 (not
//     beyond the cone by more than 10 percent), an rms residual of at most 1.5 beats, and an rms residual no larger than
//     the diffusive fit t = t0 + r^2 / K
// Verdict: pass if F1 and F2 hold; fail otherwise.
// REPORTED: v against the cone (1) and the light's c(16) = 2 / sqrt(99) = 0.20101 on the radion's husk (the radion's
// front ran at 1.04 of it); the fit of t_first on r = 2 .. 6; plateau(r); the G-off run (integer+0) beside it.
//
// PREDICTED: F1 holds (it is the rule's cone). F2 holds: the scramble grows exponentially behind a front, so the time to
// half the plateau is the front's arrival plus a fixed growth time, linear in r, with v below the cone; the plateau is
// flat in r (E-GRV-0081's prediction), so what arrives is the scramble, not a profile.
//
// PROBE, disclosed (tmp/grv82-probe1.ts, integer+0, per 12-beat cycle box totals only): 240 beats on side 12 take 8.6 s
// with G and 6.4 s without; with G the box-wide excess of (a) is 14, 947, 9669, 14592, then 15,640 to 15,770 from cycle 4
// (of 99,792, 15.7 percent); without G it holds at 6 to 12. No probe read an arrival, a fit or a gate.
//
// FIRST RUN (tmp/grv82-run1.log, 89 s, the record): fail on F2, no gate moved; the 17 starts give one reading. F1
// holds: the first difference reaches r = 1 .. 9 at beats 1, 2, 3, 4, 7, 8, 11, 12, 17, never before the cone, a
// leading edge at 0.625 mesh steps a beat on r = 2 .. 6. F2 fails: reading (a) reaches half its plateau at beats 24,
// 24, 24, 24, 28 on r = 2 .. 6 (and 20 at r = 1, 28, 28, 27 at r = 7 .. 9), nearly at once, so the linear fit gives
// v = 1.25 (beyond the cone) with rms 1.13 against the diffusive fit's 0.99. What arrives is not a front: for the first
// 20 beats the difference is under 1.4 a column beyond r = 1, it grows while the leading edge crosses the box, and
// between beats 23 and 30 every shell jumps together to 20 to 30 a column on the cycle's peaks, oscillating with the
// control's 12-beat cycle (the scrambled box no longer keeps it); the plateau is flat in r (5.6 to 11.3 beyond r = 0,
// in the parity pattern E-GRV-0081 read). With G off (integer+0) the difference stops at r = 6 (beat 10) with a plateau
// under 1 a column at r = 0 and under 0.02 beyond r = 1. The prediction (F2 holds) missed: the scramble grows first
// and fills the box together, rather than saturating behind its leading edge. Title written after the run.
//
// Depth L2. DETERMINISM: placed lump, Weyl-numbered path, nothing drawn. NOTHING MOVES: each slot takes its neighbor's
// value one dock along. HUSK FIRST: every reading is a husk column's count.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
import { linearFit } from '@/code/measure/regression'
import { lightSpeed } from '@/code/measure/varying-depth-light'
import {
  columnSeries,
  lumpStart,
  READINGS,
  responseBox,
  ringsFrom,
  shellProfile,
  type ColumnSeries,
  type ResponseBox,
} from '@/code/measure/vacuum-response'

const SIDE = 12
const BEATS = 144
const PLATEAU_FROM = 96
const SIZE = 3
const FIT_R = [2, 3, 4, 5, 6] as const
const RADION_DEPTH = 16

// the first beat (1-based) after which any column at each distance differs in any reading
function firstArrival(
  box: ResponseBox,
  rOf: Int32Array,
  a: ColumnSeries,
  b: ColumnSeries,
): number[] {
  const first = Array.from({ length: box.rMax + 1 }, () => Infinity)

  for (let t = 0; t < a.beats; t++) {
    for (let col = 0; col < a.columns; col++) {
      const r = rOf[col]!

      if (first[r]! <= t + 1) {
        continue
      }

      if (
        READINGS.some(
          n => a[n][t * a.columns + col] !== b[n][t * a.columns + col],
        )
      ) {
        first[r] = t + 1
      }
    }
  }

  return first
}

const rms = (residual: number, n: number): number =>
  Math.sqrt(residual / n)

export default experiment({
  id: 'gravity/vacuum-response-front',
  code: 'E-GRV-0082',
  title:
    "the working vacuum's response to a placed lump has no front, it fills the box at once, fail on F2 (F2 was predicted to hold): a content-3 lump in E-SPN-0095's vacuum with G (side 12, Born path, 17 starts that agree bit for bit) is felt first at r = 1 .. 9 on beats 1, 2, 3, 4, 7, 8, 11, 12, 17, inside the cone (a leading edge at 0.625 mesh steps a beat), but the occupied count reaches half its plateau at beats 24, 24, 24, 24, 28 on r = 2 .. 6, nearly together: the linear fit gives 1.25 of the cone (6.2 times the radion's c(16)) with rms 1.13 beats, worse than the diffusive fit's 0.99; the difference stays under 1.4 a column for 20 beats while the scramble grows, then every shell jumps to 20 to 30 a column between beats 23 and 30 and the plateau is flat in r, so what spreads is a chaotic scramble of the whole box, not a field with a speed; without G it stops at r = 6 with under 0.02 a column beyond r = 1",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const family = startFamily(16)
    const born = { threshold: THRESHOLD_BORN, beats: BEATS, coin: true }

    let rMax = 0
    let off: { first: number[]; plateau: number[] } | undefined

    const perStart = family.map((member, m) =>
      withStart(member, () => {
        const box = responseBox(SIDE)
        const rOf = ringsFrom(box, box.center)
        const control = columnSeries({
          box,
          start: lumpStart(box, 0, 0).start,
          mix: true,
          ...born,
        })
        const lump = columnSeries({
          box,
          start: lumpStart(box, 1, SIZE).start,
          mix: true,
          ...born,
        })
        const delta = Array.from({ length: BEATS }, (_, t) =>
          shellProfile(
            box,
            rOf,
            lump.occupied,
            control.occupied,
            t,
            t + 1,
          ),
        )

        rMax = box.rMax

        if (m === 0) {
          const c = columnSeries({
            box,
            start: lumpStart(box, 0, 0).start,
            mix: false,
            ...born,
          })
          const l = columnSeries({
            box,
            start: lumpStart(box, 1, SIZE).start,
            mix: false,
            ...born,
          })

          off = {
            first: firstArrival(box, rOf, l, c),
            plateau: shellProfile(
              box,
              rOf,
              l.occupied,
              c.occupied,
              PLATEAU_FROM,
              BEATS,
            ),
          }
        }

        log(`start ${member.name}`)

        return {
          name: member.name,
          first: firstArrival(box, rOf, lump, control),
          delta,
        }
      }),
    )

    const rsAll = Array.from({ length: rMax }, (_, i) => i + 1)
    const delta = Array.from({ length: BEATS }, (_, t) =>
      Array.from(
        { length: rMax + 1 },
        (_, r) =>
          perStart.reduce((s, p) => s + p.delta[t]![r]!, 0) /
          perStart.length,
      ),
    )
    const plateau = Array.from(
      { length: rMax + 1 },
      (_, r) =>
        delta.slice(PLATEAU_FROM).reduce((s, d) => s + d[r]!, 0) /
        (BEATS - PLATEAU_FROM),
    )
    const half = plateau.map((p, r) => {
      const t = delta.findIndex(d =>
        p >= 0 ? d[r]! >= p / 2 : d[r]! <= p / 2,
      )

      return t < 0 ? Infinity : t + 1
    })
    const first = perStart[0]!.first
    const f1 = perStart.every(p =>
      rsAll.every(
        r =>
          p.first[r]! >= r &&
          (r === 1 || p.first[r]! >= p.first[r - 1]!),
      ),
    )
    const ys = FIT_R.map(r => half[r]!)
    const linear = linearFit({ xs: [...FIT_R], ys })
    const diffusive = linearFit({ xs: FIT_R.map(r => r * r), ys })
    const v = linear.slope > 0 ? 1 / linear.slope : Infinity
    const rmsLinear = rms(linear.residual, FIT_R.length)
    const rmsDiffusive = rms(diffusive.residual, FIT_R.length)
    const f2 =
      ys.every(Number.isFinite) &&
      linear.slope > 0 &&
      v <= 1.1 &&
      rmsLinear <= 1.5 &&
      rmsLinear <= rmsDiffusive
    const firstFit = linearFit({
      xs: [...FIT_R],
      ys: FIT_R.map(r => first[r]!),
    })
    const vFirst = firstFit.slope > 0 ? 1 / firstFit.slope : Infinity
    const cRadion = lightSpeed(RADION_DEPTH)
    const status = f1 && f2 ? 'pass' : 'fail'
    const startsAgree = new Set(
      perStart.map(p => JSON.stringify([p.first, p.delta])),
    ).size

    const g4 = (x: number): string =>
      Number.isFinite(x) ? x.toPrecision(4) : String(x)
    const metrics: Record<string, number> = {
      gate_F1: f1 ? 1 : 0,
      gate_F2: f2 ? 1 : 0,
      starts: family.length,
      startsDistinct: startsAgree,
      side: SIDE,
      speed: v,
      speedOverCone: v,
      speedOverRadionC: v / cRadion,
      rmsLinear,
      rmsDiffusive,
      t0: linear.intercept,
      firstSpeed: vFirst,
      radionC: cRadion,
      seconds: (Date.now() - started) / 1000,
    }

    for (let r = 0; r <= rMax; r++) {
      metrics[`first_r${r}`] = first[r]!
      metrics[`half_r${r}`] = half[r]!
      metrics[`plateau_r${r}`] = plateau[r]!
    }

    return verdict({
      status,
      claim: `a content-3 lump in the working vacuum with G (side 12, Born path, 17 starts): the first difference reaches r = 1 .. ${rMax} at beats ${first.slice(1).join(', ')} (causal on every start: ${f1}); reading (a) reaches half its plateau (${plateau.map(p => p.toFixed(2)).join(', ')} at r = 0 .. ${rMax}) at beats ${half.slice(1).join(', ')}; on r = 2 .. 6 t = ${g4(linear.intercept)} + r / ${g4(v)} (rms ${g4(rmsLinear)} beats, diffusive rms ${g4(rmsDiffusive)}): a front at ${g4(v)} mesh steps a beat, ${g4(v)} of the cone and ${g4(v / cRadion)} of the radion's c(16) = ${g4(cRadion)}; the first difference moves at ${g4(vFirst)}`,
      metrics,
      control: {
        offFirstR2: off?.first[2] ?? -1,
        offPlateauMax: off
          ? Math.max(...off.plateau.map(Math.abs))
          : -1,
      },
      notes: `L2. Gates F1 ${f1}, F2 ${f2}. Distinct start readings ${startsAgree} of ${family.length}. First arrival per start range: ${rsAll.map(r => `r ${r} ${Math.min(...perStart.map(p => p.first[r]!))}..${Math.max(...perStart.map(p => p.first[r]!))}`).join(', ')}. Delta(t, r) of (a) by beat 1 .. 48 (r = 0 .. ${rMax}): ${delta
        .slice(0, 48)
        .map(
          (d, t) => `${t + 1}: ${d.map(x => x.toFixed(2)).join(' ')}`,
        )
        .join(
          ' | ',
        )}. G off (integer+0): first arrival ${off?.first.join(', ')}, plateau ${off?.plateau.map(x => x.toFixed(4)).join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
