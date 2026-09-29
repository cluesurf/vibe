// The lens with a tail (E-GRV-0075): the even field's static potential (E-GRV-0074) read per column as the husk's
// depth, D = D0 + (the number of integer thresholds the potential reaches), feeding the varying-depth medium of
// E-GRV-0070. Around a static lump, is light delayed through AND beside it, is a weak lens read past it bent
// toward it as 1/b, and would a vibe that reads the depth be drawn in?
//
// THE CONSTRUCTION: code/measure/even-field (header). The medium is E-GRV-0070's (mediumBeat with per-column
// parameters, a STAND-IN for a variable-depth trit bulk that does not exist). The lump is a STAND-IN placement,
// not a rule-run lump: the center column of the box and its six axis neighbors, each holding 3 love and 1 fear
// (content 28, charge +14); its flip holds 1 love and 3 fear. The potential is the infinite husk's (E-FRC-0241's
// G0 and 1/(24 pi r) + A/r^5), summed over the content by the minimum image and zero at infinity: the box is a
// window on an infinite husk, a stand-in for a compensator at infinity, since a closed husk cannot hold an even
// source alone (E-GRV-0074). The threshold theta = M / (24 pi K), K = 10, so Delta is about 10 / r and 0 beyond
// r = 10: the tail is a staircase whose steps sit at 1/r spacing, and it ends where the potential falls below one
// threshold. Box 112 x 32 x 32, D0 = 16, lump center (32, 16, 16); the plane packet of E-GRV-0070 (amplitude 2 * 12,
// support 16) starts at x = 12; detectors on the exit plane x = 52 (20 past the center, 10 past the last shell),
// along y at z = 16 and along z at y = 16; window 270 beats (the packet's -x half reaches the plane after about 318).
//
// THE PREDICTOR (floats, measurement only): the straight-line eikonal of the depth map, tau(y, z) = sum over the
// docks x = 12 .. 51 of 1/c(D) - 1/c(D0), c(D) = 2 / sqrt(3 (2D + 1)), and its deflection read with the reader's own
// stencil, c0 (tau(b + 2) - tau(b - 2)) / 4, antisymmetrized. The GR-like law for a point potential is a deflection
// 2 eps / b (eps = K / (2 D0 + 1) for an index 1 + eps / r); the threshold's cut at K bends it down by the reported
// truncated form, about 5 to 20 percent over b = 3 to 6.
//
// Gates, fixed before the first run of this file:
//  L1 instrument: the lump run returns to its start bit for bit when run back, keeps 0 Gauss violations (read
//     every 10 beats) and makes 0 wraps; the control (no lump) makes 0 wraps; the flipped lump's medium equals the
//     lump's in every per-column parameter (so its run is the lump's), and at least one column is deepened
//  L2 delay through and beside: at b = 0 (through) and 2, 4, 6, 8 (beside; the content ends at r = 1), the exit
//     plane delay, lump minus control averaged over +-b on the y and z lines, within 15 percent of the eikonal
//  L3 bending: at b = 3, 4, 5, 6 the deflection toward the lump (the wavefront's tilt, asin of c0 dt/db over +-2
//     docks, antisymmetrized, averaged over the y and z lines) is positive and within 30 percent of the eikonal's
//  L4 the tail: b times the measured deflection at b = 3, 4, 5, 6 each within 20 percent of their mean (1/b)
//  T  matter reading the depth: the static self-energy of a unit charge (charge blind, it goes as q^2), its field
//     weighted per link by pi / D (the light's energy scale at that link's depth, first order), does not decrease
//     from r to r + 1 anywhere on r = 2 .. 14 from the lump center (averaged over +y and +z), and is larger at 14
//     than at 2: a vibe's energy is lowest near the lump, the sign of a fall
// Verdict: pass if all hold; partial if L1 fails; fail otherwise.
//
// Reported, not gated: the depth staircase and its shell radii; the deflection and delay at b = 10 and 12 (at and
// past the cut); the truncated continuum deflection; r^2 times the self-energy's slope against 1/r^2; the even
// field's OWN interaction energy with a unit of content there, (pi / D0) phi, which E-GRV-0074 found repulsive,
// and the net of the two; the boundary triangles whose spatial term reads another depth's counter.
//
// DISCLOSED: one probe before the gates, tmp/grv74-probe1.ts (the depth map: 13 11 5 3 2 2 1 1 1 1 1 0 along +y
// from the center; the straight-line eikonal: b alpha 0.68, 0.57, 0.58, 0.57 at b = 3 .. 6; 0.62 s a beat). No wave
// was read before this file. The beat's cost is why the flipped lump's wave run is replaced by L1's medium identity.
//
// FIRST RUN (tmp/grv0075-run1.log, 485 s, the record): fail on L2, L3 and L4, recorded as is, no gate moved. L1
// holds: the lump run reverses bit for bit, Gauss 0, 0 wraps on both runs, the flipped lump's medium identical,
// 4,169 columns deepened (D up to 29, 54,513 boundary triangles). T holds: the self-energy never falls from r to
// r + 1 on 2 .. 14 and rises 1.142e-3 overall, in steps at the shells (r^2 times its slope ranges 3.1e-4 to 1.2e-2:
// no pointwise 1/r^2, as a unit-step staircase cannot give one). The light does not follow the eikonal: delays
// 0.095 to 1.350 beats, rising AWAY from the axis, against 9.504 to 1.931, and the tilt reads -0.021 to -0.047 rad
// (away) against +0.229 to +0.096; past the cut, b = 10 and 12 read 1.117 and 0.720 beats against 0.149 and 0.
// POST RUN (tmp/grv75-post.ts, written after the run, read by no gate): the eikonal delay averaged over the whole
// 32 x 32 cross-section is 0.723 beats (over the two detector lines 2.283), the size of what was measured. So the
// plane packet carried close to the cross-section's MEAN delay: it is 16 docks long, the lens's radius is 10 and
// its deep core about 3, and the exit plane is 20 docks past the center, inside one Fresnel zone (sqrt(16 x 20),
// about 18 docks). The ray reading was designed for a lens much larger than the wave, and this one is not. The
// on-axis minimum and the outward tilt are not explained here (a focus of the inner rays, about 13 docks past the
// center at b = 3, is one candidate). What the next file needs: a wave short against the lens (a narrower packet,
// or a larger K and box), read beyond a Fresnel zone. The cost is what stopped it here (0.62 s a beat at 115,000
// docks). THE SIGN ROUTE: the depth pulls a charge in (T) at 1.14e-3 over r = 2 to 14, but the even field's own
// interaction energy with one unit of content falls by 3.17e-2 over the same span (E-GRV-0074's repulsion). At this
// coupling (theta = M / (24 pi 10)) the net is REPULSION, 28 to 1, unless the static energy's sign is flipped as
// E-GRV-0074 sets out. Title written after the run.
//
// Depth: L2 (the rule's own propagation against a prediction from the depth map alone, nothing fitted).
// DETERMINISM: every start is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  BEND_B,
  DELAY_B,
  DRIFT_R,
  FAR_B,
  LENS,
  LENS_CENTER,
  LENS_DEPTH,
  LENS_K,
  lensSurvey,
  truncatedDeflection,
} from '@/code/measure/even-field'
import { lightSpeed } from '@/code/measure/varying-depth-light'

const within = (x: number, want: number, tol: number): boolean =>
  Math.abs(x / want - 1) <= tol

export default experiment({
  id: 'gravity/even-lens',
  code: 'E-GRV-0075',
  title:
    "the even field read as the husk depth gives a staircase with a 1/r tail and pulls matter in, but the light does not follow its rays, fail on L2 to L4: the even potential of a placed lump (content 28, 7 columns) counted in thresholds of M / (24 pi 10) deepens 4,169 columns up to D 29 with shells at r = 1, 2, 3, 4, 6, 11 and makes a medium identical bit for bit under the charge flip; the lens run reverses exactly with 0 Gauss violations and 0 wraps, but the exit-plane delay is nearly flat, 0.095, 0.293, 0.411, 0.719, 1.350 beats at b = 0 .. 8 against the straight-line eikonal 9.504, 5.368, 3.833, 2.525, 1.931, near the eikonal's cross-section mean 0.723 (post run), and the wavefront tilts AWAY, -0.021 to -0.047 rad at b = 3 .. 6 against +0.229 to +0.096: a packet 16 docks long past a lens of radius 10 is read 20 docks on, inside one Fresnel zone (about 18 docks), so no ray reading holds and the 1/b test is not reached; a unit charge's self-energy (q^2, charge blind) rises monotonically away from the lump by 1.14e-3 from r = 2 to 14 (a fall, in unit steps at the shells), but the even field's own repulsion of unit content over the same span is 3.17e-2, 28 times larger",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const s = lensSurvey(what => console.error(what))
    const c0 = lightSpeed(LENS_DEPTH)
    const [, sy] = LENS
    const [, cy, cz] = LENS_CENTER
    // detector i < sy: (y = i, z = cz); detector sy + i: (y = cy, z = i)
    const line = (
      arr: readonly number[],
      axis: 'y' | 'z',
      at: number,
    ): number => arr[axis === 'y' ? at : sy + at] ?? Number.NaN
    const center = (axis: 'y' | 'z'): number => (axis === 'y' ? cy : cz)
    const delayOn = (axis: 'y' | 'z', b: number): number =>
      (line(s.lump.arrival, axis, center(axis) + b) -
        line(s.u0.arrival, axis, center(axis) + b) +
        line(s.lump.arrival, axis, center(axis) - b) -
        line(s.u0.arrival, axis, center(axis) - b)) /
      2
    const delay = (b: number): number =>
      (delayOn('y', b) + delayOn('z', b)) / 2
    const eik = (axis: 'y' | 'z', at: number): number =>
      (axis === 'y' ? s.eikonalY[at] : s.eikonalZ[at]) ?? Number.NaN
    const eikDelay = (b: number): number =>
      (eik('y', cy + b) +
        eik('y', cy - b) +
        eik('z', cz + b) +
        eik('z', cz - b)) /
      4
    const tilt = (
      arr: (axis: 'y' | 'z', at: number) => number,
      axis: 'y' | 'z',
      at: number,
    ): number =>
      Math.asin(
        Math.max(
          -1,
          Math.min(
            1,
            (c0 * (arr(axis, at + 2) - arr(axis, at - 2))) / 4,
          ),
        ),
      )
    const lumpAt = (axis: 'y' | 'z', at: number): number =>
      line(s.lump.arrival, axis, at)
    // toward the lump: positive when the ray above turns down and the ray below turns up
    const toward = (
      arr: (axis: 'y' | 'z', at: number) => number,
      b: number,
    ): number =>
      (['y', 'z'] as const).reduce(
        (acc, axis) =>
          acc -
          (tilt(arr, axis, center(axis) + b) -
            tilt(arr, axis, center(axis) - b)) /
            2,
        0,
      ) / 2
    const bend = (b: number): number => toward(lumpAt, b)
    const eikBend = (b: number): number => toward(eik, b)

    // L1
    const wrapsOf = (w: {
      angle: number
      field: number
      potential: number
    }): number => w.angle + w.field + w.potential
    const g1 =
      s.lump.reversed &&
      s.lump.gauss === 0 &&
      wrapsOf(s.lump.wraps) === 0 &&
      wrapsOf(s.u0.wraps) === 0 &&
      s.flipMediumIdentical &&
      s.depthColumnsDeepened > 0

    // L2
    const delayRows = DELAY_B.map(b => ({
      b,
      delay: delay(b),
      want: eikDelay(b),
    }))
    const g2 = delayRows.every(r => within(r.delay, r.want, 0.15))

    // L3, L4
    const bendRows = BEND_B.map(b => ({
      b,
      bend: bend(b),
      want: eikBend(b),
      truncated: truncatedDeflection(b),
    }))
    const g3 = bendRows.every(
      r => r.bend > 0 && within(r.bend, r.want, 0.3),
    )
    const scaled = bendRows.map(r => r.b * r.bend)
    const mean = scaled.reduce((a, v) => a + v, 0) / scaled.length
    const g4 = scaled.every(v => within(v, mean, 0.2))

    // T
    const e = s.selfEnergy
    const steps = e.slice(1).map((v, i) => v - e[i]!)
    const g5 = steps.every(d => d >= 0) && e[e.length - 1]! > e[0]!

    const status = !g1
      ? 'partial'
      : g2 && g3 && g4 && g5
        ? 'pass'
        : 'fail'
    const farRows = FAR_B.map(b => ({
      b,
      delay: delay(b),
      want: eikDelay(b),
      bend: bend(b),
      wantBend: eikBend(b),
    }))
    const selfDrop = e[e.length - 1]! - e[0]!
    const evenDrop =
      s.evenEnergy[s.evenEnergy.length - 1]! - s.evenEnergy[0]!
    const f = (x: number): string => x.toFixed(4)

    const metrics: Record<string, number> = {
      gate_L1: g1 ? 1 : 0,
      gate_L2: g2 ? 1 : 0,
      gate_L3: g3 ? 1 : 0,
      gate_L4: g4 ? 1 : 0,
      gate_T: g5 ? 1 : 0,
      c0,
      K: LENS_K,
      depthMax: s.depthMaxLump,
      columnsDeepened: s.depthColumnsDeepened,
      flipMediumIdentical: s.flipMediumIdentical ? 1 : 0,
      lumpReversed: s.lump.reversed ? 1 : 0,
      lumpGauss: s.lump.gauss,
      lumpWraps: wrapsOf(s.lump.wraps),
      controlWraps: wrapsOf(s.u0.wraps),
      boundaryTriangles: s.boundary,
      bAlphaMean: mean,
      // energy change from r = 2 to r = 14 (positive: higher far away, a pull inward)
      selfEnergyRise: selfDrop,
      evenEnergyRise: evenDrop,
      netEnergyRise: selfDrop + evenDrop,
      seconds: s.seconds,
    }

    for (const r of delayRows) {
      metrics[`delay_b${r.b}`] = r.delay
      metrics[`delayEikonal_b${r.b}`] = r.want
    }

    for (const r of bendRows) {
      metrics[`bend_b${r.b}`] = r.bend
      metrics[`bendEikonal_b${r.b}`] = r.want
      metrics[`bendTruncatedContinuum_b${r.b}`] = r.truncated
      metrics[`bAlpha_b${r.b}`] = r.b * r.bend
    }

    for (const r of farRows) {
      metrics[`delay_b${r.b}`] = r.delay
      metrics[`delayEikonal_b${r.b}`] = r.want
      metrics[`bend_b${r.b}`] = r.bend
      metrics[`bendEikonal_b${r.b}`] = r.wantBend
    }

    DRIFT_R.forEach((r, i) => {
      metrics[`selfEnergy_r${r}`] = e[i]!
      metrics[`evenEnergy_r${r}`] = s.evenEnergy[i]!

      if (i > 0 && i < DRIFT_R.length - 1) {
        metrics[`r2Pull_r${r}`] = (r * r * (e[i + 1]! - e[i - 1]!)) / 2
      }
    })

    return verdict({
      status,
      claim: `the even field's potential read as depth (D0 ${LENS_DEPTH}, one step per 1/(24 pi ${LENS_K}) of potential per unit content, up to D ${s.depthMaxLump}, shells at r = ${s.shellRadius.join(', ')}): exit-plane delay ${delayRows.map(r => f(r.delay)).join(', ')} beats at b = ${DELAY_B.join(', ')} against the eikonal ${delayRows.map(r => f(r.want)).join(', ')}; bending toward the lump ${bendRows.map(r => f(r.bend)).join(', ')} rad at b = ${BEND_B.join(', ')} against ${bendRows.map(r => f(r.want)).join(', ')}, b alpha ${scaled.map(f).join(', ')} (1/b: within ${(Math.max(...scaled.map(v => Math.abs(v / mean - 1))) * 100).toFixed(1)} percent of the mean); past the cut at b = ${FAR_B.join(', ')} delay ${farRows.map(r => f(r.delay)).join(', ')} and bending ${farRows.map(r => f(r.bend)).join(', ')}; a unit charge's self-energy rises by ${selfDrop.toExponential(3)} from r = 2 to 14 (the even field's own energy with unit content falls by ${(-evenDrop).toExponential(3)}); the flipped lump's medium is the lump's (${s.flipMediumIdentical})`,
      metrics,
      control: {
        controlWraps: wrapsOf(s.u0.wraps),
        flipMediumIdentical: s.flipMediumIdentical ? 1 : 0,
      },
      notes: `L2. STAND-INS: the medium (no variable-depth trit bulk), the placed lump, the infinite-husk potential (a compensator at infinity), the per-link pi / D energy scale (first order). Gates L1 ${g1}, L2 ${g2}, L3 ${g3}, L4 ${g4}, T ${g5}. Self-energy steps r -> r + 1 (r = 2 .. 13): ${steps.map(d => d.toExponential(2)).join(' ')}. Even-field energy (pi/D0) phi at r = 2 .. 14: ${s.evenEnergy.map(v => v.toExponential(3)).join(' ')}. Lump wraps ${JSON.stringify(s.lump.wraps)}, control wraps ${JSON.stringify(s.u0.wraps)}, boundary triangles ${s.boundary}, columns deepened ${s.depthColumnsDeepened}. Survey ${s.seconds.toFixed(0)} s.`,
    })
  },
})
