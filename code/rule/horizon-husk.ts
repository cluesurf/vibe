// The torn husk (E-GRV-0108, 0109): a horizon on the bounded depth field of a husk backed by the {3,4,3,4}'s shrinking
// bulk (code/rule/open-husk, the warped clock of E-GRV-0102). A STAND-IN, as the radion is: nothing in the model makes
// the depth read any state (E-GRV-0071), and the bulk is the octree stand-in of code/rule/open-husk.
//
// THE PROBLEM (E-GRV-0090, 0091, 0094). A dense lump demands a husk step past the trit window (|F| < 3/2): the M = 400
// lump of E-GRV-0090 demands 2.05 on the husk alone and 1.80 on the warped stack, and the reversible wrap that keeps
// the register bounded then slips three whole steps at once, so the depth stops being single valued and the energy is
// not kept. The husk cannot carry the lump's field any further: that is where a horizon should be.
//
// THE RULE: where the husk cannot carry the lines, it TEARS, and the lump's flux leaves down.
//  - THE HORIZON is a set of husk docks set from the lines: a husk dock JOINS the horizon when every one of its 18 husk
//    lateral links carries a content line (|f| = 1, horizonOf), so the husk has no room left to carry one more line
//    through it. Lines change only at a scheduled event (placement, or a unit of content added), so the horizon is read
//    at events only (joinHorizon) and is fixed between them: the beat is one fixed linear map between events, exactly
//    reversible, its energy exactly kept. A dock that has joined STAYS (one stored bit per husk dock): the lines of a
//    growing lump reroute now and then (3 docks of 452 fall out of saturation for one event while E-GRV-0090's M = 1600
//    lump grows, tmp/horizon-probe7), and a torn link rejoined would carry a held step that is not the difference of
//    its docks' depths, a curl. The event that set a bit records it, and undoing the event clears it.
//  - A TORN LINK is a husk lateral link with either end on the horizon. It takes no new value: its step is held at the
//    value it had when it tore (0 when the horizon is there from the start). A horizon dock is then joined to the rest
//    of the mesh by its one vertical link only, so the whole of its content's flux passes DOWN into the bulk: the
//    horizon is a surface through which lines leave the husk (the Randall-Sundrum picture of a brane black hole: the
//    brane's horizon is where a bulk object meets it).
//  - WHY TEAR RATHER THAN WIDEN THE VERTICAL. Raising the vertical weight under the lump (tmp/horizon-probe2, 3) sends
//    only 40 percent of the flux down and leaves the husk's own links at 1.47 to 1.53 (a knife edge that moves with M
//    and the weight). Tearing leaves NO husk link at a horizon dock, so the husk step there is 0 by construction, and
//    the vertical link's static step is fixed by Gauss alone: F = rho_y, the dock's content.
//  - THE WINDOWS. The trit window (a trit and L digits, |F| < 3/2) holds on every husk lateral link and on the rate of
//    every husk dock off the horizon: the husk never leaves its trit. The vertical links, the bulk's lateral links, the
//    bulk's docks and the horizon's own docks (which have left the husk) hold `bulk` whole steps (odd), the same digits:
//    a bounded register, fixed by the rule whatever the content.
//  - THE BOUND (the vertical's, derived): lines are one a link, so a husk dock holds at most 18 units (its 18 lateral
//    lines), and a horizon dock's vertical step is statically its content, |F| <= 18. A step switched on from rest
//    swings at most twice its static value in one mode, so 36 < 81 / 2 holds the vertical. THE BULK'S (measured, not
//    derived): its lateral steps are read against the linear solve (code/measure/open-husk greenSolve) and run, and must
//    stay under the window; the husk's are the gate.
//  - WHERE IT IS NOT CLEAN (E-GRV-0108): a content dock beside the tear whose lines are not all in use stays on the husk
//    with fewer links to carry its content (E-GRV-0090's M = 100 lump: a 10-unit dock with 15 live links, static step
//    1.00), and switched on from rest it swings past the trit and wraps. The line criterion is clean only where the lump
//    is line saturated to its edge.
// Torn links keep their held step in the divergence the beat reads, so a held step acts as a fixed source (it moved
// flux between its two docks when it tore); the conserved energy counts it with the content (code/measure/horizon-husk).
// WHAT IS STORED beyond code/rule/open-husk's: one bit per husk dock, the horizon. Nothing else; the windows are fixed
// by the rule.
// REVERSIBLE: horizonBeatBack inverts horizonBeat bit for bit, for a fixed horizon. DETERMINISM: every start and source
// is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule; a unit of content added is a
// scheduled event.

import {
  HUSK_LATERAL,
  openRestLow,
  type OpenMesh,
  type OpenState,
} from '@/code/rule/open-husk'
import type { StepRule, StepTally } from '@/code/rule/step-depth'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const floorDiv = (x: number, q: number): number => (x - mod(x, q)) / q

export type HorizonRule = StepRule & {
  // the whole steps of the bulk's window (odd), and its span and top in register units
  readonly bulk: number
  readonly bulkSpan: number
  readonly bulkTop: number
}

export function horizonRule(rule: StepRule, bulk: number): HorizonRule {
  if (bulk % 2 !== 1) {
    throw new Error(
      'horizonRule: the bulk window is an odd count of whole steps',
    )
  }

  const bulkSpan = bulk * rule.unit

  return { ...rule, bulk, bulkSpan, bulkTop: (bulkSpan - 1) / 2 }
}

// the horizon read from the lines: husk docks all of whose husk lateral links carry a line
export function horizonOf(
  mesh: OpenMesh,
  line: Int8Array,
  out = new Uint8Array(mesh.huskDocks),
): Uint8Array {
  const busy = new Int32Array(mesh.huskDocks)

  for (let l = 0; l < mesh.huskDocks * 9; l++) {
    if (line[l] === 0) {
      continue
    }

    busy[mesh.tail[l]!]!++
    busy[mesh.head[l]!]!++
  }

  for (let y = 0; y < mesh.huskDocks; y++) {
    out[y] = busy[y] === 18 ? 1 : 0
  }

  return out
}

// the event's horizon update: every saturated dock joins (the horizon only grows); returns the docks that joined, the
// record that undoing the event clears (leaveHorizon)
export function joinHorizon(
  mesh: OpenMesh,
  line: Int8Array,
  horizon: Uint8Array,
): number[] {
  const saturated = horizonOf(mesh, line)
  const joined: number[] = []

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (saturated[y] && !horizon[y]) {
      ;((horizon[y] = 1), joined.push(y))
    }
  }

  return joined
}

export function leaveHorizon(
  horizon: Uint8Array,
  joined: readonly number[],
): void {
  for (const y of joined) {
    horizon[y] = 0
  }
}

// a husk lateral link with an end on the horizon
export const tornLink = (
  mesh: OpenMesh,
  horizon: Uint8Array,
  m: number,
): boolean =>
  mesh.kind[m] === HUSK_LATERAL &&
  (horizon[mesh.tail[m]!] === 1 || horizon[mesh.head[m]!] === 1)

// the trit window on husk lateral links and on husk docks off the horizon; the bulk's everywhere else
const linkTrit = (mesh: OpenMesh, m: number): boolean =>
  mesh.kind[m] === HUSK_LATERAL
const dockTrit = (
  mesh: OpenMesh,
  horizon: Uint8Array,
  y: number,
): boolean => y < mesh.huskDocks && horizon[y] === 0

const wrapTrit = (rule: HorizonRule, v: number): number =>
  mod(v + rule.top, rule.span) - rule.top
const wrapBulk = (rule: HorizonRule, v: number): number =>
  mod(v + rule.bulkTop, rule.bulkSpan) - rule.bulkTop

export type HorizonScratch = {
  divLine: Float64Array
  divStep: Float64Array
}

export const horizonScratch = (mesh: OpenMesh): HorizonScratch => ({
  divLine: new Float64Array(mesh.docks),
  divStep: new Float64Array(mesh.docks),
})

function divergence(
  mesh: OpenMesh,
  field: ArrayLike<number>,
  out: Float64Array,
): void {
  out.fill(0)

  for (let m = 0; m < mesh.links; m++) {
    const v = field[m]!

    if (v === 0) {
      continue
    }

    out[mesh.tail[m]!] = out[mesh.tail[m]!]! + v

    if (mesh.head[m]! >= 0) {
      out[mesh.head[m]!] = out[mesh.head[m]!]! - v
    }
  }
}

// one beat, in place, for the horizon `horizon` (fixed through the beat)
export function horizonBeat(
  mesh: OpenMesh,
  rule: HorizonRule,
  s: OpenState,
  horizon: Uint8Array,
  scratch: HorizonScratch,
  tally?: StepTally,
): void {
  if (mesh.lapse) {
    throw new Error(
      'horizonBeat: the lapse in the links is not carried here',
    )
  }

  const { a, q, h, unit } = rule
  const inertia = mesh.inertia

  divergence(mesh, s.line, scratch.divLine)
  divergence(mesh, s.step, scratch.divStep)

  for (let y = 0; y < mesh.docks; y++) {
    const x = a * (unit * scratch.divLine[y]! - scratch.divStep[y]!)
    const qy = inertia ? q * inertia[y]! : q
    const w = floorDiv(
      x + s.rest[y]! + (inertia ? openRestLow(qy) : h),
      qy,
    )
    const raw = s.rate[y]! + w

    s.rest[y] = x + s.rest[y]! - qy * w
    s.rate[y] = dockTrit(mesh, horizon, y)
      ? wrapTrit(rule, raw)
      : wrapBulk(rule, raw)

    if (tally && s.rate[y] !== raw) {
      tally.vWraps++
    }
  }

  const { tail, head, weight } = mesh

  for (let m = 0; m < mesh.links; m++) {
    if (tornLink(mesh, horizon, m)) {
      continue
    }

    const z = head[m]!
    const raw =
      s.step[m]! +
      weight[m]! * (s.rate[tail[m]!]! - (z >= 0 ? s.rate[z]! : 0))

    s.step[m] = linkTrit(mesh, m)
      ? wrapTrit(rule, raw)
      : wrapBulk(rule, raw)

    if (tally && s.step[m] !== raw) {
      tally.fWraps++
    }
  }
}

export function horizonBeatBack(
  mesh: OpenMesh,
  rule: HorizonRule,
  s: OpenState,
  horizon: Uint8Array,
  scratch: HorizonScratch,
): void {
  const { a, q, h, unit } = rule
  const { tail, head, weight } = mesh
  const inertia = mesh.inertia

  for (let m = 0; m < mesh.links; m++) {
    if (tornLink(mesh, horizon, m)) {
      continue
    }

    const z = head[m]!
    const raw =
      s.step[m]! -
      weight[m]! * (s.rate[tail[m]!]! - (z >= 0 ? s.rate[z]! : 0))

    s.step[m] = linkTrit(mesh, m)
      ? wrapTrit(rule, raw)
      : wrapBulk(rule, raw)
  }

  divergence(mesh, s.line, scratch.divLine)
  divergence(mesh, s.step, scratch.divStep)

  for (let y = 0; y < mesh.docks; y++) {
    const x = a * (unit * scratch.divLine[y]! - scratch.divStep[y]!)
    const qy = inertia ? q * inertia[y]! : q
    const w = floorDiv(
      x - s.rest[y]! + (inertia ? qy - 1 - openRestLow(qy) : h),
      qy,
    )
    const raw = s.rate[y]! - w

    s.rest[y] = s.rest[y]! - x + qy * w
    s.rate[y] = dockTrit(mesh, horizon, y)
      ? wrapTrit(rule, raw)
      : wrapBulk(rule, raw)
  }
}

// ---------------------------------------------------------------------------------------------------------
// depth, found by summing steps over the links that are not torn

export type HorizonDepth = {
  // 2 x per dock in the step's units, x = 0 at dock 0: along a live link x_tail - x_head = F / g
  twice: Float64Array
  // live links where x_tail - x_head differs from F / g
  curl: number
  // live links checked, and of them the vertical ones
  checked: number
}

// which links are torn for a horizon (the torn husk's by default: a husk lateral link with EITHER end on it; the
// continuous horizon of code/rule/wave-horizon tears only a link with BOTH ends on it)
export type TornTest = (
  mesh: OpenMesh,
  horizon: Uint8Array,
  m: number,
) => boolean

export function horizonDepth(
  mesh: OpenMesh,
  step: ArrayLike<number>,
  horizon: Uint8Array,
  torn: TornTest = tornLink,
): HorizonDepth {
  const twice = new Float64Array(mesh.docks)
  const seen = new Uint8Array(mesh.docks)
  const queue = new Int32Array(mesh.docks)

  let tail = 0

  seen[0] = 1
  queue[tail++] = 0

  for (let at = 0; at < tail; at++) {
    const y = queue[at]!

    for (let j = mesh.incStart[y]!; j < mesh.incStart[y + 1]!; j++) {
      const m = mesh.incLink[j]!

      if (torn(mesh, horizon, m)) {
        continue
      }

      const out = mesh.incSign[j]! > 0
      const z = out ? mesh.head[m]! : mesh.tail[m]!

      if (z < 0 || seen[z]) {
        continue
      }

      seen[z] = 1
      // along an out-link x_head = x_tail - F / g; along an in-link x_tail = x_head + F / g
      twice[z] = out
        ? twice[y]! - (2 / mesh.weight[m]!) * step[m]!
        : twice[y]! + (2 / mesh.weight[m]!) * step[m]!
      queue[tail++] = z
    }
  }

  if (tail !== mesh.docks) {
    throw new Error(
      'horizonDepth: the live links do not reach every dock',
    )
  }

  let curl = 0
  let checked = 0

  for (let m = 0; m < mesh.links; m++) {
    if (torn(mesh, horizon, m) || mesh.head[m]! < 0) {
      continue
    }

    checked++

    if (
      twice[mesh.tail[m]!]! - twice[mesh.head[m]!]! !==
      (2 / mesh.weight[m]!) * step[m]!
    ) {
      curl++
    }
  }

  return { twice, curl, checked }
}
