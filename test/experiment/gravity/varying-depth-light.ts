// "Mass makes the column deeper, and depth slows light", the medium (E-GRV-0070): can the husk light run with a depth
// that varies from column to column, exactly and stably, and does a region of deeper columns then act on light as a
// medium of index n(D) = c(D0) / c(D) does, c(D) = 2 / sqrt(3 (2D + 1)): slower inside, a Shapiro delay through it,
// and rays bent toward it?
//
// THE MEDIUM, THE PACKET AND THE READER: code/measure/varying-depth-light (header). In short: the husk integer rule's
// wave form (code/rule/trit-husk fastBeat) with every depth-dependent parameter read from its own object's column
// (a link's window from its start dock, a triangle's q = 2D + 1, h = D, N_B = 4D and potential window n_P D from its
// first link's start dock). A STAND-IN: there is no variable-depth trit bulk (the D4 bulk's period 2D along x4 gives
// two columns of different depth no consistent joining), so this is the husk rule the trit rule would have to equal.
// A plane packet of y polarization (amplitude 2 * 12 on the y axis links, support 16 docks) starts at x = 40 with
// E = 0 and moves along +x (its -x half is kept out of every window). Arrivals are half-maximum centroids of the
// 9-link A^2 at a detector dock.
//
// RUNS: U0 and U1 (the line box 192 x 2 x 2, every column at D0 = 16 or D1 = 24); SLAB (the line, D1 on 64 <= x < 88,
// D0 elsewhere); DISK (the plane box 192 x 96 x 2, D1 on the disk of radius 16 at (76, 48), a cylinder along z, D0
// elsewhere, detectors on the exit plane x = 96, 4 docks past the disk); EDGE (reported: the line at D = 4, and at
// D = 4 with a D = 8 slab, amplitude 2 * 3, 233 beats: the stability edge D >= 4).
//
// Gates, fixed before the first run of this file:
//  V1 instrument: the medium at one depth equals fastBeat bit for bit over 64 beats at D0 and at D1; a uniform y
//     potential has zero plaquette field on every triangle; every run (U0, U1, SLAB, DISK, both EDGE runs) keeps 0
//     husk Gauss violations on every beat, every column at D >= 4, and returns to its start bit for bit when run
//     back; U0, U1, SLAB and DISK make no wrap of any kind (so the boundary's compact seam is never exercised)
//  V2 local speed, uniform: 40 / (t(100) - t(60)) within 1 percent of c(D0) on U0 and of c(D1) on U1
//  V3 the slab: the speed inside, 16 / (t(84) - t(68)), within 3 percent of c(D1); the speed after it,
//     20 / (t(120) - t(100)), within 3 percent of c(D0); the Shapiro delay, SLAB minus U0 at x = 100 and at x = 120,
//     each within 3 percent of 24 (1 / c(D1) - 1 / c(D0))
//  V4 lensing through the patch: at exit heights b = 0, 4, 8, 12 from the disk's axis (the mean of +b and -b), the
//     delay DISK minus U0 within 15 percent of the ray-optics delay (Snell's law at both faces of the disk, index
//     n = c(D0) / c(D1), traced to the exit plane); at b = 4, 8, 12 the deflection toward the axis, read from the
//     wavefront's tilt (asin of c0 dt/dy over +-2 docks, c0 the measured U0 speed, antisymmetrized), positive and
//     within 30 percent of the ray-optics deflection
//  V5 beside the patch: at b = 20, 24, 28 (4 to 12 docks past its edge), where ray optics predicts no delay and no
//     bending for a sharp patch, |delay| <= 1.5 beats and |deflection| <= 0.02 radian
// Verdict: pass if all hold; partial if V1 fails (the medium is not exact, so no reading counts); fail otherwise.
//
// Reported, not gated: every arrival; the ray-optics numbers; the EDGE runs' speeds and wraps; the triangles on a
// boundary whose spatial term reads a counter of another depth (where the wave form's shadow is not exact, see the
// module header); charge-blindness is not a question here, since a depth has no sign.
//
// DISCLOSED: two probes before the gates, uniform depth only (no slab, disk or boundary was run before this file):
// tmp/grv70-probe1.ts (the uniform curl 0, the medium equal to fastBeat over 64 beats at D 4 and 16, 0.1 s a beat
// on the plane box, and the whole-window centroid biased by the counters' residue: D 16 read 0.238 and 0.218 against
// 0.201) and tmp/grv70-probe2.ts (the half-maximum reader: D 16 at 0.9999 and D 24 at 1.0005 of c(D) with amplitude
// 12 and no wraps; D 8 clean only at amplitude 6 (0.991), garbage at 2 and 4 (the field held in the counters, as
// E-GRV-0062 found for small kicks); D 4 wrapping 340,000 to 411,000 times in 233 beats at amplitudes 1, 2 and 3
// with speeds 1.9 to 2.5 times c). D0 = 16, D1 = 24, the amplitude, the reader and the 1 percent tolerance of V2 were
// set from them. The EDGE runs are reported because of that last finding.
//
// FIRST RUN (tmp/grv0070-run1.log, 106 s, the record): fail on V4 and V5, recorded as is, no gate moved. V1 to V3
// hold: every run exact on reversal, Gauss 0 on every beat, 0 wraps on the four primary runs, the medium equal to
// fastBeat at one depth; uniform speeds 1.00035 and 1.00022 of c(16) and c(24); inside the slab 1.0014 of c(24),
// after it 0.9966 of c(16); Shapiro delay 26.32 and 26.87 beats against 26.09 (+0.9 and +3.0 percent). Through the
// disk the exit-plane delay is a smooth converging profile, 32.60, 30.63, 24.19, 18.20 beats at b = 0, 4, 8, 12, and
// the wavefront turns toward the axis (0.244, 0.345, 0.339 rad at b = 4, 8, 12). V4 FAILS AGAINST A FLAWED PREDICTOR:
// diskEikonal assumed the impact to exit map monotone before the paraxial focus (44.6 from the center), but this
// disk (n = 1.2185, radius 16, exit plane 20 from the center) folds every refracted ray into |y| < about 5 by the
// exit plane (post-run branch map, tmp/grv70-post.ts, written after the run and read by no gate): at b = 0 and 4 the
// paraxial branch gives 34.79 and 33.04 beats and 0.196 rad (measured -6.3 and -7.3 percent, and +25 percent on the
// angle), but at b = 8 and 12 no refracted ray lands at all, and the scan returned a grazing ray (79.30 beats). Those
// heights, and the beside heights of V5, lie in the geometric shadow of a strong thick lens, where the wave field is
// diffraction: b = 20 read 4.14 beats and 0.254 rad, b = 24 -0.04 and 0.168, b = 28 -1.13 and 0.0027. So the rays
// the reader can compare do bend toward the deep patch at about the ray-optics size, and the gate design (a strong
// lens read 4 docks past it) cannot decide deflection against impact parameter: that needs a weak lens (n - 1 small,
// radius much larger than the packet) read far past it, which is a new file. EDGE: at D = 4 the packet cannot be
// carried at all (amplitude 3 in a window of 16: 921,536 wraps, apparent speed 1.77 c), exact on reversal anyway.
// Title written after the run.
// FOUND LATER, by E-GRV-0071's diagnosis (tmp/grv71-diag.ts): the tiled husk geometry this file runs on orients some
// triangles opposite to the trit bulk's own, and at D = 4 with a pulse of 7 it departs from the trit rule from beat 4,
// through the field's seam at -N_B / 2. V1 compares the medium with fastBeat on the SAME tiled geometry, so it proves
// the per-column rule consistent, not equal to the trit rule. The four primary runs make 0 field wraps, so the seam
// never acts in them, and the orientation then enters only through the counters' rounding, which is symmetric
// (q is odd); the gated readings are not expected to change on the bulk's geometry, but that was not run.
//
// Depth: L2 (the rule's own propagation against a closed-form speed and a ray-optics prediction from n(D) alone,
// nothing fitted). DETERMINISM: every start is placed; nothing is drawn. NOTHING MOVES: each value takes its new
// value by the rule; no vibe is present.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  BESIDE,
  D0,
  D1,
  DISK_CENTER,
  DISK_RADIUS,
  EXIT_X,
  INSIDE,
  SLAB,
  diskEikonal,
  lightSpeed,
  lineArrival,
  mediumSurvey,
  type Run,
} from '@/code/measure/varying-depth-light'

const within = (x: number, want: number, tol: number): boolean =>
  Math.abs(x / want - 1) <= tol

export default experiment({
  id: 'gravity/varying-depth-light',
  code: 'E-GRV-0070',
  title:
    'the husk light runs with a depth that varies by column and slows where columns are deeper, fail on V4 and V5 (a flawed ray-optics predictor): the per-column husk integer rule (a STAND-IN, since no variable-depth trit bulk exists) is exact on reversal with Gauss 0 on every run and 0 wraps at D 16 and 24; a plane packet moves at 1.00035 and 1.00022 of c(D) = 2 / sqrt(3 (2D + 1)), at 1.0014 of c(24) inside a D 24 slab and 0.9966 of c(16) after it, and is delayed 26.32 and 26.87 beats against the Shapiro 24 (1/c(24) - 1/c(16)) = 26.09; a D 24 disk of radius 16 delays the wavefront by a smooth converging profile (32.60 beats on axis against 34.79 from ray optics, 30.63 against 33.04 at b = 4, turned 0.244 rad toward it against 0.196), but the gated predictor took a grazing ray at b = 8 and 12, where this strong thick lens sends no refracted ray, and the beside readings (4.14 beats and 0.254 rad at b = 20) lie in its geometric shadow; at D 4 the packet cannot be carried (921,536 wraps)',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const survey = mediumSurvey(what => console.error(what))
    const c0 = lightSpeed(D0)
    const c1 = lightSpeed(D1)
    const n = c0 / c1
    const { u0, u1, slab, disk } = survey
    const primary: Run[] = [u0, u1, slab, disk]
    const all: Run[] = [...primary, survey.edgeUniform, survey.edgeSlab]

    // V1
    const g1 =
      survey.uniformEqualsFast.every(Boolean) &&
      survey.uniformCurl === 0 &&
      all.every(r => r.gauss === 0 && r.minDepth >= 4 && r.reversed) &&
      primary.every(
        r =>
          r.wraps.angle === 0 &&
          r.wraps.field === 0 &&
          r.wraps.potential === 0,
      )

    // V2
    const v0 = 40 / (lineArrival(u0, 100) - lineArrival(u0, 60))
    const v1 = 40 / (lineArrival(u1, 100) - lineArrival(u1, 60))
    const g2 = within(v0, c0, 0.01) && within(v1, c1, 0.01)

    // V3
    const inside = 16 / (lineArrival(slab, 84) - lineArrival(slab, 68))
    const after = 20 / (lineArrival(slab, 120) - lineArrival(slab, 100))
    const shapiroWant = (SLAB[1] - SLAB[0]) * (1 / c1 - 1 / c0)
    const shapiro = [100, 120].map(
      x => lineArrival(slab, x) - lineArrival(u0, x),
    )
    const g3 =
      within(inside, c1, 0.03) &&
      within(after, c0, 0.03) &&
      shapiro.every(d => within(d, shapiroWant, 0.03))

    // V4, V5: the exit plane
    const base = lineArrival(u0, EXIT_X)
    const yc = DISK_CENTER[1]
    const t = (y: number): number => disk.arrival[y] ?? Number.NaN
    const delay = (b: number): number =>
      (t(yc + b) + t(yc - b)) / 2 - base
    const tilt = (y: number): number =>
      Math.asin(
        Math.max(-1, Math.min(1, (v0 * (t(y + 2) - t(y - 2))) / 4)),
      )
    // toward the axis: positive when the ray above the axis turns down and the ray below turns up
    const toward = (b: number): number =>
      -(tilt(yc + b) - tilt(yc - b)) / 2
    const plane = EXIT_X - DISK_CENTER[0]
    const ray = (
      b: number,
    ): { delay: number; angle: number; impact: number } =>
      diskEikonal(b, DISK_RADIUS, n, plane, c0)
    const insideRows = INSIDE.map(b => ({
      b,
      delay: delay(b),
      want: ray(b).delay,
      toward: toward(b),
      wantToward: -ray(b).angle,
      impact: ray(b).impact,
    }))
    const besideRows = BESIDE.map(b => ({
      b,
      delay: delay(b),
      toward: toward(b),
    }))
    const g4 = insideRows.every(
      r =>
        within(r.delay, r.want, 0.15) &&
        (r.b === 0 ||
          (r.toward > 0 && within(r.toward, r.wantToward, 0.3))),
    )
    const g5 = besideRows.every(
      r => Math.abs(r.delay) <= 1.5 && Math.abs(r.toward) <= 0.02,
    )

    const status = !g1
      ? 'partial'
      : g2 && g3 && g4 && g5
        ? 'pass'
        : 'fail'
    const edgeSpeed = (r: Run): number =>
      40 / (lineArrival(r, 100) - lineArrival(r, 60))
    const wrapsOf = (r: Run): number =>
      r.wraps.angle + r.wraps.field + r.wraps.potential

    const metrics: Record<string, number> = {
      gate_V1: g1 ? 1 : 0,
      gate_V2: g2 ? 1 : 0,
      gate_V3: g3 ? 1 : 0,
      gate_V4: g4 ? 1 : 0,
      gate_V5: g5 ? 1 : 0,
      c0,
      c1,
      index: n,
      speedU0: v0,
      speedU1: v1,
      speedU0OverC: v0 / c0,
      speedU1OverC: v1 / c1,
      speedInsideSlab: inside,
      speedInsideOverC1: inside / c1,
      speedAfterSlab: after,
      speedAfterOverC0: after / c0,
      shapiroWant,
      shapiro100: shapiro[0] ?? Number.NaN,
      shapiro120: shapiro[1] ?? Number.NaN,
      diskBoundaryTriangles: survey.diskBoundary,
      slabBoundaryTriangles: survey.slabBoundary,
      edgeUniformSpeedOverC:
        edgeSpeed(survey.edgeUniform) / lightSpeed(4),
      edgeUniformWraps: wrapsOf(survey.edgeUniform),
      edgeSlabWraps: wrapsOf(survey.edgeSlab),
      edgeReversed:
        survey.edgeUniform.reversed && survey.edgeSlab.reversed ? 1 : 0,
      worstGauss: Math.max(...all.map(r => r.gauss)),
      primaryWraps: primary.reduce((s, r) => s + wrapsOf(r), 0),
      seconds: survey.seconds,
    }

    for (const r of insideRows) {
      metrics[`delay_b${r.b}`] = r.delay
      metrics[`delayRay_b${r.b}`] = r.want
      metrics[`toward_b${r.b}`] = r.toward
      metrics[`towardRay_b${r.b}`] = r.wantToward
    }

    for (const r of besideRows) {
      metrics[`delay_b${r.b}`] = r.delay
      metrics[`toward_b${r.b}`] = r.toward
    }

    const profile = Array.from({ length: 33 }, (_, i) => i - 16)
      .map(b => `${b}:${delay(Math.abs(b)).toFixed(2)}`)
      .join(' ')

    return verdict({
      status,
      claim: `a plane packet through columns of depth D1 = ${D1} in a D0 = ${D0} husk light (index ${n.toFixed(4)}): uniform speeds ${v0.toFixed(4)} and ${v1.toFixed(4)} against c = ${c0.toFixed(4)} and ${c1.toFixed(4)}; inside a 24-dock slab ${inside.toFixed(4)}, after it ${after.toFixed(4)}; Shapiro delay ${shapiro.map(d => d.toFixed(2)).join(' and ')} beats against ${shapiroWant.toFixed(2)}; through a disk of radius ${DISK_RADIUS} the exit-plane delay at b = ${INSIDE.join(', ')} is ${insideRows.map(r => r.delay.toFixed(2)).join(', ')} against ray optics ${insideRows.map(r => r.want.toFixed(2)).join(', ')}, bending toward the axis ${insideRows.map(r => r.toward.toFixed(4)).join(', ')} rad against ${insideRows.map(r => r.wantToward.toFixed(4)).join(', ')}; beside it at b = ${BESIDE.join(', ')} delay ${besideRows.map(r => r.delay.toFixed(2)).join(', ')} and bending ${besideRows.map(r => r.toward.toFixed(4)).join(', ')}; exact reversal and Gauss on every run`,
      metrics,
      control: {
        uniformEqualsFast: survey.uniformEqualsFast.every(Boolean)
          ? 1
          : 0,
        uniformCurl: survey.uniformCurl,
      },
      notes: `L2. STAND-IN: the husk integer rule with per-column parameters (no variable-depth trit bulk exists). Gates V1 ${g1}, V2 ${g2}, V3 ${g3}, V4 ${g4}, V5 ${g5}. Line arrivals at x = 60, 68, 84, 96, 100, 120: U0 [${u0.arrival.map(x => x.toFixed(2)).join(' ')}], U1 [${u1.arrival.map(x => x.toFixed(2)).join(' ')}], SLAB [${slab.arrival.map(x => x.toFixed(2)).join(' ')}]. Exit-plane delay profile (b: beats) ${profile}. Ray impacts landing at b = ${INSIDE.join(', ')}: ${insideRows.map(r => r.impact.toFixed(2)).join(', ')}. Runs: gauss ${all.map(r => r.gauss).join(' ')}, reversed ${all.map(r => r.reversed).join(' ')}, min depth ${all.map(r => r.minDepth).join(' ')}, wraps ${all.map(r => JSON.stringify(r.wraps)).join(' ')}, seconds ${all.map(r => r.seconds.toFixed(1)).join(' ')}. Boundary triangles whose spatial term reads another depth's counter: slab ${survey.slabBoundary}, disk ${survey.diskBoundary}. EDGE (D 4, amplitude 3): uniform speed ${edgeSpeed(survey.edgeUniform).toFixed(4)} against c(4) = ${lightSpeed(4).toFixed(4)}, wraps ${wrapsOf(survey.edgeUniform)}; with a D 8 slab wraps ${wrapsOf(survey.edgeSlab)}; both exact on reversal: ${survey.edgeUniform.reversed && survey.edgeSlab.reversed}. Survey ${survey.seconds.toFixed(0)} s.`,
    })
  },
})
