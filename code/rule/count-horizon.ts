// The horizon with no hair (E-GRV-0113): the clock horizon of code/rule/clock-horizon with the torn links' held steps
// taken OUT of the beat, and the horizon's pull on the rest of the mesh set by one number, the COUNT of lines that went
// down through it (note/research/vibe/roadmap/discrete-gravity.md, "Measured, the clock horizon": "Next: a horizon with
// no hair"). A STAND-IN, as the torn husk is: nothing in the model makes the depth read any state (E-GRV-0071).
//
// THE HAIR (E-GRV-0109, 0112). A dock that joins the horizon while the lump is still filling tears its husk links, and
// code/rule/horizon-husk HOLDS each torn link's step at the value it had then. A held step stays in the divergence the
// beat reads, so it is a fixed source at both its ends: it moves flux between the docks it joins, and on a link from the
// horizon to a dock outside it, it is a charge on the horizon's skin frozen at the moment of the tear. The settled field
// outside then depends on WHEN each dock tore: 36 percent off the placed lump's at r = 8 .. 11 in E-GRV-0112.
//
// THE RULE. Between events the horizon H (the set of husk docks, one bit a dock) is fixed, and:
//  - THE COUNT. N = sum over y in H of div f_y: the net number of content lines through the horizon's husk surface (the
//    lines are one a link, so |N| is at most the lines crossing that surface, bounded by what exists, never a free
//    integer). It is FOUND from the lines each beat, never stored. By Gauss for the lines it is the content inside.
//  - THE SPREAD. The horizon's surface, in the brane picture of code/rule/horizon-husk, is its docks' vertical links:
//    where the lines leave the husk. The count is spread evenly over them, with carry, in register units: with
//    T = Q^L N and h = |H|, base = floor(T / h), extra = T - h base (0 <= extra < h), the first `extra` horizon docks by
//    index take base + 1 and the rest take base. So sum over H of share_y = T exactly, in integers, every beat.
//  - THE BEAT is code/rule/horizon-husk's with two changes. A horizon dock's source is its share, not its own content:
//      X_y = a (share_y - div' F_y)   (y in H)      X_z = a (Q^L div f_z - div' F_z)   (z off H)
//    where div' reads only the LIVE links: a torn link's step is not read by any dock. A torn link takes no new value.
//  - SO THE OUTSIDE SEES ONLY (N, H). Every dock off the horizon reads its own content and its live links. The horizon
//    docks are leaves (a horizon dock's one live link is its vertical), and each vertical's static step is its share,
//    N / h to one register unit. So the static field everywhere off H is the solve with the count spread on H's
//    verticals: a function of the count and the surface alone. How the lump grew, and how its content lies inside the
//    horizon, reaches nothing outside.
//
// DERIVED, before the code:
//  - EXACTLY REVERSIBLE. Between events the shares are a fixed function of the lines and H (both fixed), so the beat is
//    the torn husk's leapfrog with a fixed source: rates from the fixed source and the live steps, then live steps from
//    the rates, each division's remainder carried. countBeatBack inverts it line for line (the same algebra as
//    horizonBeatBack). A join changes nothing in any register: it sets bits, and the beat that set them clears them when
//    undone (code/measure/horizon-husk growthRun).
//  - WHAT IT CANNOT KEEP: THE COUNT ALONE IS NOT ENOUGH TO REVERSE. The steps on a dock's links at the moment it tears
//    are many numbers, and the count is one: a map from them to the count is many to one, so no rule that ERASES them
//    can run back. So the torn links' registers keep their values, unread. They are the only place the growth history
//    survives, and nothing outside the horizon reads them: the history is kept (the rule is a bijection) and hidden (no
//    dock's update depends on it). That is the most a reversible rule can do, and it is the information paradox in
//    small: no hair outside, every bit inside.
//  - BOUNDED. The count is at most the lines through the surface; a share is at most the horizon's mean content plus
//    one register unit, and a dock holds at most 18 units (its 18 lateral lines), so a share is at most 18: the bound
//    code/rule/horizon-husk derived for a vertical (|F| <= 18 static; with shares in 0 .. 18, a step switched from one
//    static value a to another b swings to at most |2 b - a| <= 36 < 81 / 2, one mode). The torn registers are not
//    changed. Nothing new is stored: the count is found, the spread is found, the horizon is the same one bit a dock.
//  - GAUSS EXACT. The lines keep div f = rho on every dock (nothing here touches them), the shares sum to Q^L N in
//    integers, and the source the whole mesh reads sums to Q^L times the total content: rho off H plus N on H. What
//    changes is WHERE on H the content's flux leaves: evenly, not where the content lies.
//  - THE ENERGY is code/measure/horizon-husk's with the source rho' = share / Q^L on H and rho off it, and no torn term
//    (a torn link is read by no dock, so it is no source): kept between events to the carry level.
//  - WHAT IT DOES NOT CLAIM: the horizon's SHAPE is still set by the clock criterion as the lump grew (a dock that
//    joined stays), so two histories that give different horizons give different fields; the spread is even over the
//    surface's links by rule, not found by a relaxation; and the tear is a jolt (the outside docks lose the flux their
//    torn links carried at once), where the held step was smooth. MEASURED (E-GRV-0113): the jolts are what break it.
//    With no damping in the leapfrog each one's overshoot carries the found depth past the cap on the next ring, a dock
//    that joined stays, and the grown horizon runs to 2,154 docks against the placed lump's 779.
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule; a unit of content added is a scheduled event.

import { HUSK_LATERAL, openRestLow, type OpenMesh, type OpenState } from '@/code/rule/open-husk'
import { tornLink, type HorizonRule, type HorizonScratch } from '@/code/rule/horizon-husk'
import type { StepTally } from '@/code/rule/step-depth'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const floorDiv = (x: number, q: number): number => (x - mod(x, q)) / q

const wrapTrit = (rule: HorizonRule, v: number): number => mod(v + rule.top, rule.span) - rule.top
const wrapBulk = (rule: HorizonRule, v: number): number => mod(v + rule.bulkTop, rule.bulkSpan) - rule.bulkTop

export type CountShares = {
  // the count: net content lines through the horizon's husk surface (whole units)
  count: number
  // the horizon's docks
  docks: number
  // per husk dock, its share of Q^L N in register units (0 off the horizon)
  share: Float64Array
}

// the count found from the lines' divergence, spread over the horizon's docks by index with carry
export function countShares(mesh: OpenMesh, rule: HorizonRule, divLine: ArrayLike<number>, horizon: Uint8Array, out = new Float64Array(mesh.huskDocks)): CountShares {
  let count = 0
  let docks = 0

  out.fill(0)
  for (let y = 0; y < mesh.huskDocks; y++) if (horizon[y]) (count += divLine[y]!), docks++
  if (docks === 0) return { count, docks, share: out }

  const total = rule.unit * count
  const base = floorDiv(total, docks)
  let extra = total - base * docks

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (!horizon[y]) continue
    out[y] = base + (extra > 0 ? 1 : 0)
    if (extra > 0) extra--
  }

  return { count, docks, share: out }
}

export type CountScratch = HorizonScratch & { share: Float64Array }

export const countScratch = (mesh: OpenMesh): CountScratch => ({ divLine: new Float64Array(mesh.docks), divStep: new Float64Array(mesh.docks), share: new Float64Array(mesh.huskDocks) })

function divergence(mesh: OpenMesh, field: ArrayLike<number>, out: Float64Array): void {
  out.fill(0)

  for (let m = 0; m < mesh.links; m++) {
    const v = field[m]!

    if (v === 0) continue
    out[mesh.tail[m]!] = out[mesh.tail[m]!]! + v
    if (mesh.head[m]! >= 0) out[mesh.head[m]!] = out[mesh.head[m]!]! - v
  }
}

// div' F: out minus in over the live links only (a torn link is read by no dock)
function liveDivergence(mesh: OpenMesh, step: ArrayLike<number>, horizon: Uint8Array, out: Float64Array): void {
  out.fill(0)

  for (let m = 0; m < mesh.links; m++) {
    const v = step[m]!

    if (v === 0 || tornLink(mesh, horizon, m)) continue
    out[mesh.tail[m]!] = out[mesh.tail[m]!]! + v
    if (mesh.head[m]! >= 0) out[mesh.head[m]!] = out[mesh.head[m]!]! - v
  }
}

// the source each dock's rate reads, in register units: the share on the horizon, Q^L div f off it
const source = (mesh: OpenMesh, rule: HorizonRule, horizon: Uint8Array, scratch: CountScratch, y: number): number => (y < mesh.huskDocks && horizon[y] ? scratch.share[y]! : rule.unit * scratch.divLine[y]!)

const dockTrit = (mesh: OpenMesh, horizon: Uint8Array, y: number): boolean => y < mesh.huskDocks && horizon[y] === 0

// one beat, in place, for the horizon `horizon` (fixed through the beat)
export function countBeat(mesh: OpenMesh, rule: HorizonRule, s: OpenState, horizon: Uint8Array, scratch: CountScratch, tally?: StepTally): void {
  if (mesh.lapse) throw new Error('countBeat: the lapse in the links is not carried here')

  const { a, q, h } = rule
  const inertia = mesh.inertia

  divergence(mesh, s.line, scratch.divLine)
  countShares(mesh, rule, scratch.divLine, horizon, scratch.share)
  liveDivergence(mesh, s.step, horizon, scratch.divStep)

  for (let y = 0; y < mesh.docks; y++) {
    const x = a * (source(mesh, rule, horizon, scratch, y) - scratch.divStep[y]!)
    const qy = inertia ? q * inertia[y]! : q
    const w = floorDiv(x + s.rest[y]! + (inertia ? openRestLow(qy) : h), qy)
    const raw = s.rate[y]! + w

    s.rest[y] = x + s.rest[y]! - qy * w
    s.rate[y] = dockTrit(mesh, horizon, y) ? wrapTrit(rule, raw) : wrapBulk(rule, raw)
    if (tally && s.rate[y] !== raw) tally.vWraps++
  }

  const { tail, head, weight, kind } = mesh

  for (let m = 0; m < mesh.links; m++) {
    if (tornLink(mesh, horizon, m)) continue

    const z = head[m]!
    const raw = s.step[m]! + weight[m]! * (s.rate[tail[m]!]! - (z >= 0 ? s.rate[z]! : 0))

    s.step[m] = kind[m] === HUSK_LATERAL ? wrapTrit(rule, raw) : wrapBulk(rule, raw)
    if (tally && s.step[m] !== raw) tally.fWraps++
  }
}

export function countBeatBack(mesh: OpenMesh, rule: HorizonRule, s: OpenState, horizon: Uint8Array, scratch: CountScratch): void {
  const { a, q, h } = rule
  const { tail, head, weight, kind } = mesh
  const inertia = mesh.inertia

  for (let m = 0; m < mesh.links; m++) {
    if (tornLink(mesh, horizon, m)) continue

    const z = head[m]!
    const raw = s.step[m]! - weight[m]! * (s.rate[tail[m]!]! - (z >= 0 ? s.rate[z]! : 0))

    s.step[m] = kind[m] === HUSK_LATERAL ? wrapTrit(rule, raw) : wrapBulk(rule, raw)
  }

  divergence(mesh, s.line, scratch.divLine)
  countShares(mesh, rule, scratch.divLine, horizon, scratch.share)
  liveDivergence(mesh, s.step, horizon, scratch.divStep)

  for (let y = 0; y < mesh.docks; y++) {
    const x = a * (source(mesh, rule, horizon, scratch, y) - scratch.divStep[y]!)
    const qy = inertia ? q * inertia[y]! : q
    const w = floorDiv(x - s.rest[y]! + (inertia ? qy - 1 - openRestLow(qy) : h), qy)
    const raw = s.rate[y]! - w

    s.rest[y] = s.rest[y]! - x + qy * w
    s.rate[y] = dockTrit(mesh, horizon, y) ? wrapTrit(rule, raw) : wrapBulk(rule, raw)
  }
}
