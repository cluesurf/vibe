// A UNIFORM SOURCE AND THE DEPTH (E-GRV-0153), route H12c (note/project/vibe/roadmap/research/routes/
// gravity-cosmos-heat-classical.md, H · the cosmological constant): "a Floquet rule has no vacuum energy: a cycle has a
// quasi-energy defined mod 2 pi and no ground state, so a uniform vacuum energy is not defined, and only departures source
// depth (discrete-gravity.md 5e: a uniform source sets the zero of depth)." Test, in the route's words: "show the depth
// field is blind to a uniform source on a closed box, exact". Kill: "a uniform source tilts the husk." OPEN-CSM-06.
//
// WHAT IS RUN. The bounded depth field of E-GRV-0090 (code/rule/step-depth: per husk link a line trit and a step, per
// dock a rate and a carried rest, the depth FOUND by summing steps, all integers), on a closed husk box (side 16
// periodic, 4,096 docks, D 16, three base-297 digits as E-GRV-0090), for 1,024 beats from rest. The rule reads its source
// only as the lines' divergence, so the source is passed here directly per dock (code/measure/sourced-depth sourcedBeat,
// stepBeat with Q^L rho in place of Q^L div f; I1 gates that they agree). A stand-in, as E-GRV-0090 is: what is read is
// what this depth register does with a uniform source, not whether the rule's own vacuum energy is uniform.
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE LINES CANNOT HOLD IT. Every line adds +1 at its tail and -1 at its head, so on a closed box the divergence of any
//    line field sums to 0. A uniform content c != 0 sums to c N. So the lines, the only way the rule reads matter, cannot
//    carry a uniform source at all: on a closed box Gauss's law already says only departures from the mean have lines.
// 2. GIVEN DIRECTLY, IT MOVES ONLY THE RATE. With rho + c in place of rho, the beat's X = a (Q^L rho - div F) gains a Q^L c
//    at every dock. Q = 297 divides Q^L (L >= 1), so the floor gains exactly a Q^(L-1) c and the rest R is unchanged. So
//    the rate gains the same 2 c Q^(L-1) at every dock every beat, its difference between docks is unchanged, and the
//    step F (which changes by g times a difference of two rates) is unchanged bit for bit. The window does not spoil this:
//    where the uniform shift makes some rates wrap and not others, their difference changes by a multiple of the span, F's
//    raw value by g times it, and F's own wrap (the same span) removes it. So the steps, the rests and the found depth are
//    exactly the departure's, every beat, and the rate differs from it by t 2 c Q^(L-1) mod the span at every dock. The
//    uniform source moves the depth's zero (the uniform part of the depth grows as kappa c t^2 / 2, held nowhere, since
//    no register holds a depth) and tilts nothing. This holds for every integer c; for c a fraction of a content unit
//    whose a Q^L c is not a multiple of q, the floor depends on each dock's rest and the step can change (a read below).
// 3. THE CONTROL. A source of the same total N (mean 1) that is not uniform has a departure, and the departure has lines
//    and a static depth A x = rho - 1 (A the husk's g-weighted Laplacian, div F = A x). For the planar pair, +1 on the
//    plane x = 0 and -1 on the plane x = 8 over a uniform 1, the crossing count of a plane is 6 (the axis link, g = 2, and
//    four face diagonals), so -6 (x_(n+1) - 2 x_n + x_(n-1)) = rho - 1: the depth is a tent, x(0) - x(8) = 8 / 12 = 2/3.
//    The leapfrog from rest oscillates about the static depth, so the time average over 1,024 beats should be near it:
//    the slowest planar mode has omega = sqrt(kappa 6 (2 - 2 cos(2 pi / 16))) = 0.078 a beat, about 13 periods.
//
// PROBES BEFORE THE GATES, disclosed. tmp/us-probe1 (side 8, 256 beats, this file's code with PROBE_PLAN): I1, I2, I3, H1
//  exact on all six pairs (0 steps, rests, rates or depths off; the c = 50 runs' rates wrap 14,848 times); the sub-unit
//  read: on the zero base it changes no step (every dock's rest is the same), on the dip base it changes steps on
//  961,118 link-beats, by at most 70 register units (70 / 297^3 = 2.7e-6 of a whole step); the control: the uniform
//  source leaves 0 links tilted and a depth spread of 0, the dip, planes and slab tilt 4,240, 2,560 and 1,920 links,
//  the planar contrast 0.3272 against the side-8 static 1/3 (1.8 percent). It fixed STATIC_TOL at 5 percent. The F wrap
//  tallies of the C1 runs count the uniform rate's wraps passing through F (derived in 2), not slips.
//
// HYPOTHESES AND GATES, fixed before the gate run (sources: zero; the dip, +4 at (0,0,0) and -4 at (0,8,8); uniform c =
// 1, -2, 50 content units a dock, 50 chosen so the rates wrap):
//  I1 THE INSTRUMENT: the dip's placed lines (placeLines) have divergence equal to the dip on every dock, and stepBeat on
//     them equals sourcedBeat with Q^L div f bit for bit (step, rate, rest) on every one of the 1,024 beats.
//  I2 THE CLOSED BOX: the dip's lines and a fixed patterned line field ((7 l mod 3) - 1) have total divergence exactly
//     0, and placeLines refuses a uniform content of 1 on a side-4 box (no unit can be routed).
//  I3 the found depth has curl 0 in every H1 run.
//  H1 BLIND (the route's hypothesis): for both bases and all three c, the run with the uniform source added has the
//     base run's steps on every link and rests on every dock at every beat (0 off), its rate minus the base's equals
//     t 2 c Q^(L-1) mod the span at every dock and beat (0 off), and the same found depth at the end (0 docks off).
//  P1 THE KILL: any step, rest or found depth off in H1 (a uniform source tilts the husk). H1 fails exactly when P1 fires.
//  C1 THE CONTROL (the instrument can read a tilt): three sources of total N, 1 + the dip, 1 + the planar pair, and the
//     slab (2 on x < 8, 0 on x >= 8), each end with some nonzero step and a found-depth spread above 0, while the uniform
//     1 ends with every step 0 and spread 0; and the planar pair's time-averaged x(plane 0) - x(plane 8) is positive and
//     within 5 percent of the static 2/3.
// READ, gating nothing: the rate wraps of each H1 run; the sub-unit uniform source (one register unit a dock, 1 / Q^L of
// a content unit) on both bases, its step-beats off and largest step change; the controls' spreads, contrasts, wraps.
// VERDICT: fail if H1 fails (P1 fires); partial if H1 holds and I1, I2, I3 or C1 fails; pass otherwise.
//
// WHAT THIS CAN AND CANNOT SHOW. It can show that this depth register, the bounded stand-in on a closed box, cannot be
// sourced by a uniform density, exactly, at every beat: the uniform part of a source sets the zero of depth and runs it
// (a uniform depth acceleration that no register holds), and only departures tilt the husk. That is the route's
// mechanism for why a uniform vacuum energy does not gravitate here. It cannot show that the rule's vacuum energy is
// uniform (E-GRV-0106 found the vacuum's lines a fixed background of a trit, not proven uniform as a source), that the
// depth register is the rule's own (it is added by hand), nor anything about an open or growing mesh, where the box is
// not closed and the uniform part can have lines to the edge. It gives Λ no value: it says only that a constant vacuum
// density contributes zero, so Λ must come from elsewhere (H12a, H12b).
//
// FIRST RUN 2026-10-02 (tmp/us-run1.log, 48 s): PASS, as derived. No gate moved and none was rerun.
//  - I1: the dip's lines have its divergence on every dock, and stepBeat and sourcedBeat agree bit for bit on all 1,024
//    beats. I2: total divergence 0 for both line fields; placeLines refuses the uniform 1. I3: curl 0 in every H1 run.
//  - H1: on both bases and for c = 1, -2, 50, 0 link-beats with a step off, 0 dock-beats with a rest off, 0 dock-beats
//    with the rate off its uniform shift, 0 docks of found depth off. The rates wrapped 8,192, 20,480 and 471,040 times
//    (c = 1, -2, 50) and the steps never noticed. P1 does not fire.
//  - C1: the uniform 1 ends with 0 links tilted and spread 0; 1 + dip, 1 + planes and the slab tilt 35,360, 20,480 and
//    17,920 links, depth spreads 0.389, 0.596 and 1.864; the planar contrast averaged over the run is 0.6740 against the
//    static 2/3 (1.1 percent). The slab's departure demands steps past the window: it slips (3,916,800 step wraps,
//    curl on 6,320,128 link-beats), so its depth is not single valued; its gates (a tilt) are met but it is not a clean
//    static field.
//  - Read: the sub-unit uniform source (1 / 297^3 of a content unit a dock) changes no step on the zero base, and on the
//    dip base changes steps on 34,457,618 link-beats by at most 228 register units (8.6e-6 of a whole step): below one
//    content unit the blindness is only up to the carried rest's rounding, and content comes in whole units.
//
// Depth L1: exact integer arithmetic and a derivation it checks. DETERMINISM: every source is placed; nothing is drawn.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { radionMesh, type RadionMesh } from '@/code/rule/trit-radion'
import {
  divergence,
  emptyStep,
  newStepTally,
  placeLines,
  stepBeat,
  stepDepth,
  stepRule,
  stepScratch,
  type StepRule,
  type StepState,
} from '@/code/rule/step-depth'
import { sourcedBeat } from '@/code/measure/sourced-depth'

export type BlindPlan = {
  side: number
  beats: number
  depth: number
  levels: number
  // the uniform sources added, in whole content units a dock
  uniforms: readonly number[]
}

export const GATE_PLAN: BlindPlan = {
  side: 16,
  beats: 1024,
  depth: 16,
  levels: 3,
  uniforms: [1, -2, 50],
}

export const PROBE_PLAN: BlindPlan = {
  side: 8,
  beats: 256,
  depth: 16,
  levels: 3,
  uniforms: [1, -2, 50],
}

const STATIC_TOL = 0.05
const LUMP = 4

const flag = (b: boolean): number => (b ? 1 : 0)
const mod = (x: number, m: number): number => ((x % m) + m) % m

export default experiment({
  id: 'gravity/uniform-source-blind',
  code: 'E-GRV-0153',
  title:
    "a uniform source on a closed husk box moves only the depth's zero and tilts nothing, exact, pass: on E-GRV-0090's bounded depth field (side 16, 1,024 beats) the lines cannot hold a uniform content (every line field's divergence sums to 0), and a uniform source of 1, -2 or 50 units a dock given directly leaves every step, rest and found depth bit for bit the departure's alone, with zero or a dipole beneath it, while the rate of every dock gains the same 2 c 297^2 a beat (wrapping up to 471,040 times unseen); sources of the same total that are not uniform tilt it (a planar pair's averaged contrast 0.674 against the static 2/3); below one content unit a uniform source changes steps on a structured field by up to 8.6e-6 of a step, the carried rest's rounding",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return blindRun(GATE_PLAN)
  },
})

const dockAt = (mesh: RadionMesh, p: readonly number[]): number => {
  const [sx, sy] = mesh.sides

  return p[0]! + sx * (p[1]! + sy * p[2]!)
}

const xOf = (mesh: RadionMesh, y: number): number => y % mesh.sides[0]

// register units a dock of a content map, plus `extra` register units at every dock
function units(
  rule: StepRule,
  content: Int32Array,
  extra: number,
): Float64Array {
  return Float64Array.from(content, c => rule.unit * c + extra)
}

type PairRead = {
  // link-beats where the two runs' steps differ, and dock-beats where their rests differ
  stepOff: number
  restOff: number
  // dock-beats where the rate difference is not the uniform shift t (a c Q^L / q), mod the window
  rateOff: number
  // docks where the found depths (relative to dock 0) differ at the end
  depthOff: number
  curl: number
  // rate wraps in the run with the uniform source added
  vWraps: number
  // largest |step difference| over the run, in register units (for the sub-unit read)
  maxStep: number
  // links with a nonzero step in the uniform run at the end
  tilted: number
}

// the base source and the base plus a uniform `extra` register units a dock, run in lockstep from rest
function pairRun(
  mesh: RadionMesh,
  rule: StepRule,
  base: Float64Array,
  extra: number,
  beats: number,
): PairRead {
  const plus = Float64Array.from(base, v => v + extra)
  const a = emptyStep(mesh)
  const b = emptyStep(mesh)
  const sa = stepScratch(mesh)
  const sb = stepScratch(mesh)
  const tally = newStepTally()
  // the uniform rate shift a beat: a extra / q, exact when q divides a extra
  const shift = (rule.a * extra) / rule.q
  const whole = Number.isInteger(shift)

  let stepOff = 0
  let restOff = 0
  let rateOff = 0
  let maxStep = 0

  for (let t = 1; t <= beats; t++) {
    sourcedBeat(mesh, rule, a, base, sa)
    sourcedBeat(mesh, rule, b, plus, sb, tally)

    for (let l = 0; l < a.step.length; l++) {
      if (a.step[l] !== b.step[l]) {
        stepOff++

        const d = Math.abs(
          mod(b.step[l]! - a.step[l]! + rule.top, rule.span) - rule.top,
        )

        maxStep = Math.max(maxStep, d)
      }
    }

    for (let y = 0; y < mesh.docks; y++) {
      if (a.rest[y] !== b.rest[y]) {
        restOff++
      }

      if (
        whole &&
        mod(b.rate[y]! - a.rate[y]! - t * shift, rule.span) !== 0
      ) {
        rateOff++
      }
    }
  }

  const da = stepDepth(mesh, a.step)
  const db = stepDepth(mesh, b.step)

  let depthOff = 0

  for (let y = 0; y < mesh.docks; y++) {
    if (da.twice[y] !== db.twice[y]) {
      depthOff++
    }
  }

  return {
    stepOff,
    restOff,
    rateOff: whole ? rateOff : -1,
    depthOff,
    curl: da.curl + db.curl,
    vWraps: tally.vWraps,
    maxStep,
    tilted: b.step.reduce((n, v) => n + (v !== 0 ? 1 : 0), 0),
  }
}

type TiltRead = {
  // links with a nonzero step at the end, and the found depth's spread there (in depth units)
  tilted: number
  spread: number
  // the time-averaged depth of plane x = 0 minus plane x = side / 2 (depth units)
  contrast: number
  fWraps: number
  vWraps: number
  curl: number
}

function tiltRun(
  mesh: RadionMesh,
  rule: StepRule,
  rho: Float64Array,
  beats: number,
): TiltRead {
  const s = emptyStep(mesh)
  const sc = stepScratch(mesh)
  const tally = newStepTally()
  const half = mesh.sides[0] / 2
  const plane = mesh.docks / mesh.sides[0]

  let sum = 0
  let curl = 0

  for (let t = 1; t <= beats; t++) {
    sourcedBeat(mesh, rule, s, rho, sc, tally)

    const d = stepDepth(mesh, s.step)

    curl += d.curl

    let p0 = 0
    let p1 = 0

    for (let y = 0; y < mesh.docks; y++) {
      const x = xOf(mesh, y)

      if (x === 0) {
        p0 += d.twice[y]!
      } else if (x === half) {
        p1 += d.twice[y]!
      }
    }

    sum += (p0 - p1) / plane / (2 * rule.unit)
  }

  const d = stepDepth(mesh, s.step)

  let lo = Infinity
  let hi = -Infinity

  for (const v of d.twice) {
    lo = Math.min(lo, v)
    hi = Math.max(hi, v)
  }

  return {
    tilted: s.step.reduce((n, v) => n + (v !== 0 ? 1 : 0), 0),
    spread: (hi - lo) / (2 * rule.unit),
    contrast: sum / beats,
    fWraps: tally.fWraps,
    vWraps: tally.vWraps,
    curl,
  }
}

const sameState = (a: StepState, b: StepState): boolean =>
  a.step.every((v, i) => v === b.step[i]) &&
  a.rate.every((v, i) => v === b.rate[i]) &&
  a.rest.every((v, i) => v === b.rest[i])

export function blindRun(plan: BlindPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const L = plan.side
  const mesh = radionMesh([L, L, L])
  const rule = stepRule(plan.depth, plan.levels)
  const N = mesh.docks
  const h = L / 2
  const zero = new Int32Array(N)
  const dip = new Int32Array(N)

  dip[dockAt(mesh, [0, 0, 0])] = LUMP
  dip[dockAt(mesh, [0, h, h])] = -LUMP

  // ---------------- I1: the sourced beat is stepBeat when the source is the lines' divergence ----------------
  const lines = placeLines(mesh, dip)
  const divF = new Float64Array(N)

  divergence(mesh, lines, divF)

  const gaussDip = divF.every((v, y) => v === dip[y])
  const ref = emptyStep(mesh)

  ref.line.set(lines)

  const src = emptyStep(mesh)
  const rs = stepScratch(mesh)
  const ss = stepScratch(mesh)
  const rhoLines = Float64Array.from(divF, v => rule.unit * v)

  let i1Off = 0

  for (let t = 0; t < plan.beats; t++) {
    stepBeat(mesh, rule, ref, rs)
    sourcedBeat(mesh, rule, src, rhoLines, ss)

    if (!sameState(ref, src)) {
      i1Off++
    }
  }

  const I1 = gaussDip && i1Off === 0

  log(`I1 ${I1}: Gauss ${gaussDip}, beats off ${i1Off}`)

  // ---------------- I2: a closed box's lines cannot hold a uniform source ----------------
  const pattern = Int8Array.from(
    { length: N * 9 },
    (_, l) => ((l * 7) % 3) - 1,
  )
  const divP = new Float64Array(N)

  divergence(mesh, pattern, divP)

  const totalDip = divF.reduce((a, v) => a + v, 0)
  const totalPattern = divP.reduce((a, v) => a + v, 0)

  let uniformRefused = false

  try {
    placeLines(radionMesh([4, 4, 4]), new Int32Array(64).fill(1))
  } catch {
    uniformRefused = true
  }

  const I2 = totalDip === 0 && totalPattern === 0 && uniformRefused

  log(
    `I2 ${I2}: totals ${totalDip} ${totalPattern}, uniform refused ${uniformRefused}`,
  )

  // ---------------- H1: the depth is blind to a uniform source ----------------
  const bases: [string, Int32Array][] = [
    ['zero', zero],
    ['dip', dip],
  ]
  const metrics: Record<string, number> = {}

  let H1 = true
  let curlAll = 0

  for (const [name, content] of bases) {
    for (const c of plan.uniforms) {
      const r = pairRun(
        mesh,
        rule,
        units(rule, content, 0),
        rule.unit * c,
        plan.beats,
      )
      const ok =
        r.stepOff === 0 &&
        r.restOff === 0 &&
        r.rateOff === 0 &&
        r.depthOff === 0
      const tag = `${name}_c${c}`

      H1 = H1 && ok
      curlAll += r.curl
      metrics[`${tag}_stepOff`] = r.stepOff
      metrics[`${tag}_restOff`] = r.restOff
      metrics[`${tag}_rateOff`] = r.rateOff
      metrics[`${tag}_depthOff`] = r.depthOff
      metrics[`${tag}_vWraps`] = r.vWraps
      log(`H1 ${tag} ${ok}: ${JSON.stringify(r)}`)
    }
  }

  const I3 = curlAll === 0

  // ---------------- READ: a uniform source below one content unit (one register unit a dock) ----------------
  const sub0 = pairRun(mesh, rule, units(rule, zero, 0), 1, plan.beats)
  const subDip = pairRun(mesh, rule, units(rule, dip, 0), 1, plan.beats)

  log(
    `read sub-unit: zero ${JSON.stringify(sub0)} dip ${JSON.stringify(subDip)}`,
  )

  // ---------------- C1: non-uniform sources of the same total tilt it ----------------
  const uniform1 = units(rule, new Int32Array(N).fill(1), 0)
  const plus = (content: Int32Array): Int32Array =>
    Int32Array.from(content, v => v + 1)
  const planes = new Int32Array(N)
  const slab = new Int32Array(N)

  for (let y = 0; y < N; y++) {
    const x = xOf(mesh, y)

    planes[y] = x === 0 ? 1 : x === h ? -1 : 0
    slab[y] = x < h ? 2 : 0
  }

  const uni = tiltRun(mesh, rule, uniform1, plan.beats)
  const cDip = tiltRun(
    mesh,
    rule,
    units(rule, plus(dip), 0),
    plan.beats,
  )
  const cPlanes = tiltRun(
    mesh,
    rule,
    units(rule, plus(planes), 0),
    plan.beats,
  )
  const cSlab = tiltRun(mesh, rule, units(rule, slab, 0), plan.beats)
  // the static planar depth: -6 (x_{n+1} - 2 x_n + x_{n-1}) = rho, so x(0) - x(L/2) = (L/2) / 12
  const planarStatic = h / 12
  const planarRel = Math.abs(cPlanes.contrast / planarStatic - 1)
  const totals = [plus(dip), plus(planes), slab].map(c =>
    c.reduce((a, v) => a + v, 0),
  )
  const C1 =
    totals.every(t => t === N) &&
    uni.tilted === 0 &&
    uni.spread === 0 &&
    [cDip, cPlanes, cSlab].every(r => r.tilted > 0 && r.spread > 0) &&
    cPlanes.contrast > 0 &&
    planarRel <= STATIC_TOL

  log(
    `C1 ${C1}: uniform ${JSON.stringify(uni)} dip ${JSON.stringify(cDip)} planes ${JSON.stringify(cPlanes)} slab ${JSON.stringify(cSlab)} planar static ${planarStatic} rel ${planarRel}`,
  )

  const instrument = I1 && I2 && I3
  const status: Verdict['status'] = !H1
    ? 'fail'
    : instrument && C1
      ? 'pass'
      : 'partial'

  return verdict({
    status,
    claim: H1
      ? "a uniform source moves only the depth register's uniform rate; every step, rest and found depth is bit for bit the departure's alone"
      : 'a uniform source changes the steps: the depth field is not blind to it',
    metrics: {
      side: L,
      beats: plan.beats,
      I1: flag(I1),
      I1_beatsOff: i1Off,
      I2: flag(I2),
      I3: flag(I3),
      H1: flag(H1),
      C1: flag(C1),
      ...metrics,
      sub_zero_stepOff: sub0.stepOff,
      sub_zero_maxStepUnits: sub0.maxStep,
      sub_dip_stepOff: subDip.stepOff,
      sub_dip_maxStepUnits: subDip.maxStep,
      sub_dip_restOff: subDip.restOff,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      uniform_tilted: uni.tilted,
      uniform_spread: uni.spread,
      dip_tilted: cDip.tilted,
      dip_spread: cDip.spread,
      planes_tilted: cPlanes.tilted,
      planes_spread: cPlanes.spread,
      planes_contrast: cPlanes.contrast,
      planes_static: planarStatic,
      planes_rel: planarRel,
      slab_tilted: cSlab.tilted,
      slab_spread: cSlab.spread,
      slab_contrast: cSlab.contrast,
      slab_fWraps: cSlab.fWraps,
      slab_vWraps: cSlab.vWraps,
    },
    notes: `I1 ${I1} I2 ${I2} I3 ${I3} H1 ${H1} C1 ${C1}`,
  })
}
