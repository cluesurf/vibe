// Why the span lumps did not fall alike (E-GRV-0096). E-GRV-0093 found the matter built with the spanned light's change
// (code/rule/depth-clock-wave, span form) falling toward depth at 0.855 and 0.384 of its ray law (rest terms 3 and 12,
// 480 beats), where the light's side of general relativity's 2 held. Three causes were named: (a) the run is short in
// the lump's own units, (b) the rest term does not scale with the lump's size, (c) the integer depth staircase
// reflects slow lumps.
//
// THE PROBES, disclosed (tmp/span-fall-probe1..4.log, before this file; none is read by a gate):
//  (a) REFUTED as stated. Longer runs make it worse, not better: over 480, 960, 1,920, 3,840 beats the rest-3 lump
//      reads 0.854, 0.640, 0.270, 0.211 and the rest-12 lump 0.385, 0.109, 0.051, -0.019 of its ray law.
//  (b) the WIDTH does not matter (widths 12, 24, 48: 0.809, 0.854, 0.852 at rest 3) and the AMPLITUDE does not (2e5 to
//      1e8: the same to 1e-3, so the integer X resolves the fall); the REST TERM does: 0.938, 0.854, 0.385, -0.184 at
//      rest 1, 3, 12, 27.
//  (c) CONFIRMED, with a second effect behind it. Reading the slab with K levels per level (finer steps, the same
//      profile) and K times the beats: rest 9 reads 0.546, 0.686, 0.807, 0.878 at K = 1, 2, 4, 8, and then 0.846 at 16
//      and 0.766 at 32, worse again. The late windows fall further: at K = 32 rest 9 reads 1.011 over the first
//      quarter and 0.549 over the second half. The LATTICE RAY (the leapfrog's band theta(k, x) integrated from k = 0 on
//      the smooth field, which cannot see a step) reproduces this: at K = 32 rest 1 reads 0.984, 0.968, 0.938 against
//      the ray's 0.985, 0.964, 0.937, and rest 9 reads 0.932, 0.766, 0.549 against 0.936, 0.781, 0.581; at K = 1 the
//      ray reads 1.05 for both while the waves read 0.94 and 0.55, the steps' part.
//
// THE CAUSE, stated before the gated run (code/measure/span-fall's header): two effects of the mesh, neither of the
// depth's metric. The staircase reflects slow lumps (a step every 12 docks at K = 1). And a span lump's Compton length
// c / theta_0 = sqrt(12 / (m q)) docks is under one dock (a clock lump's is sqrt(12 / m), depth free), so falling it
// gains lattice momentum k = t |d theta_0 / dx| while still slow; its speed d theta / dk then leaves the parabola, and
// a heavier lump (theta_0 ~ sqrt m) leaves it sooner. So span matter falls alike, at its ray law, while the steps are
// finer than it can resolve and its lattice momentum is small, and departs from both in the way the band says.
//
// THE RUN. The slab at K = 32 levels per level. Lumps of rest terms 2 and 18 (nine times apart, neither probed) at
// x = 154 (toward -x) and at the mirror x = 48 (toward +x, the other side of the sheet), width 24, amplitude 3e5, for
// the window that brings the heavier lump's lattice momentum to 0.3 (computed from the band at k = 0, not tuned). A
// uniform-depth lump beside them. The long window: four times that at x = 154, against the lattice ray. The steps:
// the same lumps on the integer staircase (K = 1) over its own window to momentum 0.3.
//
// Gates, fixed before the gated run:
//  F1 instrument: every lump run reverses bit for bit, and each fine run's energy drift is under 1e-3.
//  F2 universal fall (THE gate): the two lumps' falls agree within 3 percent at x = 154 and at x = 48.
//  F3 the ray law: each of the four fine falls within 10 percent of its k = 0 ray law.
//  F4 controls: every fine lump falls toward depth (the mirror pair the other way), and the uniform lump's fall is
//     under 1e-3 of the slab's.
//  F5 the band (the cause, its second half): over the long window each lump's fall over its k = 0 ray law is within
//     5 percent of the lattice ray's, and the heavier lump's is under 0.9 (the departure is real).
//  F6 the steps (the cause, its first half): on the integer staircase the two lumps' falls differ by more than 10
//     percent, while their smooth lattice rays agree within 3 percent.
// Verdict: fail if F1, F2 or F3 fails; pass if all six hold; partial otherwise (the fall holds, the cause is not
// shown).
//
// FIRST RUN (tmp/span-fall-run1.log, 29 s, the record): FAIL on F2 alone, no gate moved. Over 2,611 beats the lumps
// fall at 0.991 and 1.000 of their ray law at x = 154 (alike to 0.9 percent) but at 0.947 and 1.008 at the mirror
// (6.1 percent apart); F1, F3, F4 hold (every run reversed, drift under 2.3e-5, the mirror pair falls the other way,
// the uniform lump's fall -3e-19). The CAUSE gates hold: over four times the window the waves read 0.972 and 0.785
// against the lattice ray's 0.967 and 0.797 (the heavier lump at lattice momentum 1.2), and on the integer staircase
// the lumps read 0.898 and 0.104 (a factor 8.5 apart) where the smooth ray reads 1.049 and 1.037. POST-RUN PROBE
// (tmp/span-fall-post1.log, disclosed, gates unchanged): over the gated window each fall moves the lump about 0.01
// docks, and the fit scatters by about 5 percent about the lattice ray (widths 24 and 48: 0.948 and 1.044 for rest 2
// at the mirror, against the ray's 0.992 and 0.972); over twice the window the waves follow the ray within 3 percent
// (0.996, 0.974, 0.955, 0.962 against 0.989, 0.969, 0.956, 0.937 at the mirror) while the heavier lump has already
// left the k = 0 law. So on this mesh a window short enough to keep the band away is too short to read a 3 percent
// agreement, and one long enough brings the band in: the span lumps fall as their LATTICE RAY says, mass by mass, and
// that ray is not the same for two masses. Title written after the run.
//
// Depth L2: the lump is a stand-in given by hand (depth-clock-wave), the radion is machinery added by hand (E-GRV-0079),
// and the finer staircase is a reading of that machinery with K times the levels. What this shows is where the span
// matter's fall is universal on the mesh and why it is not elsewhere, with the lattice ray as a prediction that could
// have failed. DETERMINISM: every start is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by
// the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { FINE_LEVELS, FINE_MOMENTUM, LONG_FACTOR, spanFallSurvey } from '@/code/measure/span-fall'

export default experiment({
  id: 'gravity/span-fall',
  code: 'E-GRV-0096',
  title:
    "the span lumps do not fall alike, and the cause is the mesh, not the depth, fail on F2: E-GRV-0093's 0.855 and 0.384 are two lattice effects, the integer staircase reflecting a slow heavy lump (on it rest terms 2 and 18 fall at 0.898 and 0.104 of their ray law where the smooth lattice ray reads 1.049 and 1.037) and the mesh's band (a span lump's Compton length sqrt(12 / (m q)) is under a dock, so it gains lattice momentum while slow: over 4 times the window the waves read 0.972 and 0.785 against the lattice ray's 0.967 and 0.797); on the slab read with 32 levels per level, in the window that holds the heavier lump's momentum to 0.3, the lumps fall at 0.991 and 1.000 of their ray law at x = 154 (alike to 0.9 percent) but 0.947 and 1.008 at the mirror (6.1 percent apart against a 3 percent gate), because a fall of 0.01 docks is read only to about 5 percent there; longer runs make it worse, not better, and width and amplitude do not matter",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const s = spanFallSurvey(what => console.error(what))
    const within = (x: number, want: number, tol: number): boolean => Math.abs(x / want - 1) <= tol
    const at = (x: number): typeof s.fine => s.fine.filter(r => r.at === x)
    const locations = [...new Set(s.fine.map(r => r.at))]
    const alike = (x: number): number => at(x)[0]!.run.g / at(x)[1]!.run.g
    const f1 = s.fine.every(r => r.run.reversed && Math.abs(r.run.energyDrift) < 1e-3) && s.uniform.reversed && s.long.every(l => l.run.reversed) && s.stair.every(r => r.run.reversed)
    const f2 = locations.every(x => within(alike(x), 1, 0.03))
    const f3 = s.fine.every(r => within(r.ratio, 1, 0.1))
    const heaviestPredicted = Math.max(...s.fine.map(r => Math.abs(r.run.gPredicted)))
    const f4 = s.fine.every(r => r.ratio > 0) && Math.sign(at(locations[0]!)[0]!.run.g) !== Math.sign(at(locations[1]!)[0]!.run.g) && Math.abs(s.uniform.g) < 1e-3 * heaviestPredicted
    const f5 = s.long.every(l => within(l.wave, l.ray, 0.05)) && s.long[s.long.length - 1]!.wave < 0.9
    const stairAlike = s.stair[0]!.run.g / s.stair[1]!.run.g
    const f6 = !within(stairAlike, 1, 0.1) && within(s.stair[0]!.ray, s.stair[1]!.ray, 0.03)
    const status = !f1 || !f2 || !f3 ? 'fail' : f4 && f5 && f6 ? 'pass' : 'partial'
    const f = (x: number): string => x.toPrecision(5)
    const metrics: Record<string, number> = {
      gate_F1: f1 ? 1 : 0,
      gate_F2: f2 ? 1 : 0,
      gate_F3: f3 ? 1 : 0,
      gate_F4: f4 ? 1 : 0,
      gate_F5: f5 ? 1 : 0,
      gate_F6: f6 ? 1 : 0,
      levels: FINE_LEVELS,
      window: s.window,
      stairWindow: s.stairWindow,
      uniformFall: s.uniform.g,
      stairAlike,
      seconds: s.seconds,
    }

    for (const x of locations) metrics[`alike_x${x}`] = alike(x)
    for (const r of s.fine) {
      metrics[`ratio_x${r.at}_m${r.m}`] = r.ratio
      metrics[`fall_x${r.at}_m${r.m}`] = r.run.g
      metrics[`predicted_x${r.at}_m${r.m}`] = r.run.gPredicted
      metrics[`drift_x${r.at}_m${r.m}`] = r.run.energyDrift
      metrics[`compton_x${r.at}_m${r.m}`] = r.compton
      metrics[`period_x${r.at}_m${r.m}`] = r.period
    }
    for (const l of s.long) {
      metrics[`long_wave_m${l.m}`] = l.wave
      metrics[`long_ray_m${l.m}`] = l.ray
      metrics[`long_momentum_m${l.m}`] = l.momentum
    }
    for (const r of s.stair) {
      metrics[`stair_ratio_m${r.m}`] = r.ratio
      metrics[`stair_ray_m${r.m}`] = r.ray
    }

    return verdict({
      status,
      claim: `on the slab read with ${FINE_LEVELS} levels per level, span lumps of rest terms ${s.fine
        .filter(r => r.at === locations[0])
        .map(r => r.m)
        .join(' and ')} fall at ${s.fine.map(r => `${f(r.ratio)} (x ${r.at}, m ${r.m})`).join(', ')} of their ray law over ${s.window} beats (the heavier lump's lattice momentum reaching ${FINE_MOMENTUM}), alike to ${locations.map(x => f(alike(x))).join(' and ')}; over ${LONG_FACTOR} times that the waves read ${s.long.map(l => f(l.wave)).join(' and ')} against the lattice ray's ${s.long.map(l => f(l.ray)).join(' and ')}; on the integer staircase over ${s.stairWindow} beats they read ${s.stair.map(r => f(r.ratio)).join(' and ')} (alike ${f(stairAlike)}) where the smooth ray reads ${s.stair.map(r => f(r.ray)).join(' and ')}`,
      metrics,
      control: { uniformFall: s.uniform.g, stairAlike },
      notes: `L2. Gates F1 ${f1}, F2 ${f2}, F3 ${f3}, F4 ${f4}, F5 ${f5}, F6 ${f6}. Compton lengths c / theta_0 in docks: ${s.fine.map(r => `m ${r.m} ${r.compton.toFixed(3)}`).join(', ')}; rest periods ${s.fine.map(r => r.period.toFixed(1)).join(', ')} beats. Long-window lattice momentum ${s.long.map(l => l.momentum.toFixed(3)).join(', ')}. Energy drift ${s.fine.map(r => r.run.energyDrift.toExponential(2)).join(', ')}. Survey ${s.seconds.toFixed(1)} s.`,
    })
  },
})
