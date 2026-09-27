// The hidden state of a headroom horizon (test/experiment/gravity/headroom-horizon-entropy): which registers of the
// husk no dock off the horizon ever reads, found by running the rule, and the count of their values. Real numbers live
// here only; the rule holds integers.
//
// THE HORIZON. E-GRV-0122's headroom register: the room at radius r is C - floor(C e / cap), e = M times the box-free
// unit profile, 0 where e reaches the cap (code/measure/headroom-horizon roomOf). The horizon H is the set of husk docks
// whose room is 0, read at the periodic distance from the lump's center: on a decreasing profile, the ball r < r_h.
//
// THE RULE that hides. code/rule/count-horizon (E-GRV-0113): a husk lateral link with an end on H is TORN (its step
// takes no new value and no dock reads it), and a horizon dock's source is its share of the count N = sum over H of
// div f, which the links with both ends on H do not change (each adds to one end and takes from the other). So the
// candidates are: every torn link's step, and every line on a link with both ends on H. Every other register (every
// dock's rate and remainder, the horizon docks' included; every live step; every line with an end off H) is a
// candidate for being SEEN. hiddenCheck asks the rule which is which.
//
// DETERMINISM: every start is a fixed Weyl pattern; nothing is drawn. NOTHING MOVES: each value takes its new value by
// the rule.

import { HUSK_LATERAL, duplicateOpen, emptyOpen, type OpenMesh, type OpenState } from '@/code/rule/open-husk'
import { huskDistance } from '@/code/measure/open-husk'
import { countBeat, countBeatBack, countScratch } from '@/code/rule/count-horizon'
import type { HorizonRule } from '@/code/rule/horizon-husk'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const PHI = (Math.sqrt(5) - 1) / 2

// the horizon: husk docks whose room at the periodic distance from `center` is 0
export function roomHorizon(mesh: OpenMesh, center: readonly number[], room: (r: number) => number): Uint8Array {
  const out = new Uint8Array(mesh.huskDocks)

  for (let y = 0; y < mesh.huskDocks; y++) out[y] = room(huskDistance(mesh, y, center)) === 0 ? 1 : 0

  return out
}

// the husk docks within radius r of `center` (the no-horizon control's ball, the same docks as a horizon of that radius)
export function ballDocks(mesh: OpenMesh, center: readonly number[], radius: number): Uint8Array {
  const out = new Uint8Array(mesh.huskDocks)

  for (let y = 0; y < mesh.huskDocks; y++) out[y] = huskDistance(mesh, y, center) < radius ? 1 : 0

  return out
}

// the torn links of a region, split: INTERIOR (both ends in it) and CUT (exactly one end: the lattice's measure of its
// 2d surface), and the region's SURFACE docks (in it, with a lateral neighbor out of it)
export type TornSets = { docks: number; interior: number[]; cut: number[]; surface: number }

export function tornSets(mesh: OpenMesh, region: Uint8Array): TornSets {
  const interior: number[] = []
  const cut: number[] = []
  const edge = new Uint8Array(mesh.huskDocks)
  let docks = 0

  for (let y = 0; y < mesh.huskDocks; y++) docks += region[y]!
  for (let m = 0; m < mesh.links; m++) {
    if (mesh.kind[m] !== HUSK_LATERAL) continue

    const a = region[mesh.tail[m]!]!
    const b = region[mesh.head[m]!]!

    if (a && b) interior.push(m)
    else if (a || b) {
      cut.push(m)
      edge[a ? mesh.tail[m]! : mesh.head[m]!] = 1
    }
  }

  return { docks, interior, cut, surface: edge.reduce((t, v) => t + v, 0) }
}

// a generic start (a fixed Weyl pattern, not a physical lump: the claim is about which registers the rule reads, so it
// must hold on any state): a line trit on every link, a step within half a whole step of 0 on every link, every rate
// and remainder 0
export function genericStart(mesh: OpenMesh, rule: HorizonRule): OpenState {
  const s = emptyOpen(mesh)

  for (let m = 0; m < mesh.links; m++) {
    s.line[m] = Math.floor(3 * mod(m * PHI, 1)) - 1
    s.step[m] = Math.floor(rule.unit * (mod(m * Math.SQRT2, 1) - 0.5))
  }

  return s
}

// the perturbations: a step moved by one whole step within the trit window; a line trit cycled -1 -> 0 -> 1 -> -1
export const shiftStep = (rule: HorizonRule, v: number): number => mod(v + rule.unit + rule.top, rule.span) - rule.top
export const cycleLine = (v: number): number => mod(v + 2, 3) - 1

// the registers a comparison leaves out: steps and lines by link, a rate and its remainder by dock
export type Skip = { step: Uint8Array; line: Uint8Array; dock: Uint8Array }

export const noSkip = (mesh: OpenMesh): Skip => ({ step: new Uint8Array(mesh.links), line: new Uint8Array(mesh.links), dock: new Uint8Array(mesh.docks) })

// every register of a and b outside `skip` equal
function sameOutside(a: OpenState, b: OpenState, skip: Skip): boolean {
  for (let y = 0; y < a.rate.length; y++) if (!skip.dock[y] && (a.rate[y] !== b.rate[y] || a.rest[y] !== b.rest[y])) return false
  for (let m = 0; m < a.step.length; m++) {
    if (!skip.step[m] && a.step[m] !== b.step[m]) return false
    if (!skip.line[m] && a.line[m] !== b.line[m]) return false
  }

  return true
}

// THE ASK. From `start` and from `start` changed by `change`, the count rule on `horizon` for `beats` beats: the first
// beat (1 ..) on which some register outside `skip` differs, -1 if one differs before any beat (the change itself is
// outside `skip`), 0 if none ever does (the changed registers are hidden);
// `kept`: the changed registers themselves never rewritten in the changed run (a hidden register holds its value)
export type Ask = { first: number; kept: boolean }

export function ask(mesh: OpenMesh, rule: HorizonRule, horizon: Uint8Array, start: OpenState, change: (s: OpenState) => void, skip: Skip, beats: number): Ask {
  const a = duplicateOpen(start)
  const b = duplicateOpen(start)
  const sa = countScratch(mesh)
  const sb = countScratch(mesh)

  change(b)

  const held = duplicateOpen(b)
  let first = sameOutside(a, b, skip) ? 0 : -1

  for (let t = 1; t <= beats && first === 0; t++) {
    countBeat(mesh, rule, a, horizon, sa)
    countBeat(mesh, rule, b, horizon, sb)
    if (!sameOutside(a, b, skip)) first = t
  }

  let kept = true

  for (let m = 0; m < mesh.links && kept; m++) {
    if (skip.step[m] && b.step[m] !== held.step[m]) kept = false
    if (skip.line[m] && b.line[m] !== held.line[m]) kept = false
  }

  return { first, kept }
}

// the rule's exact reversal from `start` over `beats` beats
export function reverses(mesh: OpenMesh, rule: HorizonRule, horizon: Uint8Array, start: OpenState, beats: number): boolean {
  const s = duplicateOpen(start)
  const scratch = countScratch(mesh)

  for (let t = 0; t < beats; t++) countBeat(mesh, rule, s, horizon, scratch)
  for (let t = 0; t < beats; t++) countBeatBack(mesh, rule, s, horizon, scratch)

  return sameOutside(s, start, noSkip(mesh))
}

// THE COUNT, in nats: every hidden register free over its window, the others fixed by the outside. Torn steps: the trit
// window's `span` values each; interior lines: a trit each
export type HiddenCount = { steps: number; lines: number; total: number; perDock: number; cutPart: number }

export function hiddenCount(rule: HorizonRule, sets: TornSets): HiddenCount {
  const steps = (sets.interior.length + sets.cut.length) * Math.log(rule.span)
  const lines = sets.interior.length * Math.log(3)

  return { steps, lines, total: steps + lines, perDock: (steps + lines) / sets.docks, cutPart: sets.cut.length * Math.log(rule.span) }
}

// THE VOLUME CONTROL's count: every register of a ball of husk with no horizon, each over its whole window (every dock's
// rate over the trit window and its remainder over its q values; every lateral link with an end in the ball, its line
// trit and its step): the most the ball's own registers can hold, whatever the outside
export function ballCount(rule: HorizonRule, sets: TornSets): number {
  const links = sets.interior.length + sets.cut.length

  return sets.docks * (Math.log(rule.span) + Math.log(rule.q)) + links * (Math.log(3) + Math.log(rule.span))
}
