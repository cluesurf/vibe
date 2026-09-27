// Measurement for the balanced membrane (code/rule/balanced-membrane, test/experiment/gravity/balanced-membrane-growth):
// the starts, the independent BigInt witness of whether a stage fits, the growth driver with its exact reversal, and
// the comparison of the pushed run's outside with the unpushed run's. Real numbers live here only; the rule holds
// integers.
//
// THE WITNESS. The rule pushes each item on base-span digits with carry, in doubles. The witness reads the old counter
// off the old cut links by Horner's rule in BigInt, builds the stage's number V from the start's own registers by a
// PRODUCT TREE (V of a run of items is V_left R_right + V_right, R the product of the radices), with no digits and no
// carry, and compares |V span^T_old + N_old| to (span^T_new - 1) / 2. It also gives sizes in nats: the infall
// ln(2 |V| + 1) against the stage's new digits (T_new - T_old) ln(span), and the whole counter ln(2 |N_new| + 1) against
// T_new ln(span).
//
// THE GROWTH. A schedule of target horizons H_1 .. H_K (the headroom horizon at M_1 < .. < M_K). Stage k: an optional
// FEED (a scheduled event, like a unit of content added in E-GRV-0112: Weyl values ADDED to the stage's least
// significant item registers, wrapped in their windows, so it is undone by subtracting), then the JOIN from the horizon
// held now to H_k (pushed: code/rule/balanced-membrane stageForm, held if refused; unpushed: the bits only, the torn
// registers keep their values, E-GRV-0124's rule), then `between` beats of the count rule (code/rule/count-horizon). After
// the last stage, `settle` beats. growBack runs it all back.
//
// DETERMINISM: every start and feed is a fixed Weyl pattern; nothing is drawn. NOTHING MOVES: each value takes its new
// value by the rule; a feed is a scheduled event.

import { HUSK_LATERAL, duplicateOpen, type OpenMesh, type OpenState } from '@/code/rule/open-husk'
import { countBeat, countBeatBack, countScratch, type CountScratch } from '@/code/rule/count-horizon'
import { LINE_ITEM, balanced } from '@/code/rule/membrane-horizon'
import { stageForm, stagePlan, stageUnform, type StagePlan } from '@/code/rule/balanced-membrane'
import type { HorizonRule } from '@/code/rule/horizon-husk'
import { huskDistance } from '@/code/measure/open-husk'
import { genericStart } from '@/code/measure/horizon-entropy'
import { weylLine, weylStep } from '@/code/measure/membrane-horizon'

const isLine = (item: number): boolean => (item & 1) === LINE_ITEM
const radix = (rule: HorizonRule, item: number): number => (isLine(item) ? 3 : rule.span)
const valueOf = (s: OpenState, item: number): number => (isLine(item) ? s.line[item >> 1]! : s.step[item >> 1]!)

// ---------------------------------------------------------------------------------------------------------
// starts

// a dock's place in husk coordinates (a layer-k dock of a shrinking stack covers 2^k husk docks a side: its middle)
export function dockPlace(mesh: OpenMesh, y: number): number[] {
  let k = 0

  while (k + 1 < mesh.sides.length && y >= mesh.offset[k + 1]!) k++

  const s = mesh.sides[k]!
  const i = y - mesh.offset[k]!
  const f = mesh.side / s
  const mid = (f - 1) / 2

  return [(i % s) * f + mid, (Math.floor(i / s) % s) * f + mid, Math.floor(i / (s * s)) * f + mid]
}

export function placeDistance(mesh: OpenMesh, y: number, center: readonly number[]): number {
  const p = dockPlace(mesh, y)
  let d = 0

  for (let i = 0; i < 3; i++) {
    const a = Math.abs(p[i]! - center[i]!)
    const b = Math.min(a, mesh.side - a)

    d += b * b
  }

  return Math.sqrt(d)
}

// E-GRV-0124's generic state (code/measure/horizon-entropy genericStart) with every register within `radius` of the
// center at rest: each dock there (every layer, by its place) has rate and remainder 0, and each link with an end there
// has step and line 0
export function quietStart(mesh: OpenMesh, rule: HorizonRule, center: readonly number[], radius: number): OpenState {
  const s = genericStart(mesh, rule)
  const near = new Uint8Array(mesh.docks)

  for (let y = 0; y < mesh.docks; y++) {
    if (placeDistance(mesh, y, center) >= radius) continue
    near[y] = 1
    s.rate[y] = 0
    s.rest[y] = 0
  }
  for (let m = 0; m < mesh.links; m++) {
    const b = mesh.head[m]!

    if (near[mesh.tail[m]!] || (b >= 0 && near[b])) (s.step[m] = 0), (s.line[m] = 0)
  }

  return s
}

// every item register of a stage set to 0
export function clearStage(plan: StagePlan, s: OpenState): void {
  for (const item of plan.items) {
    if (isLine(item)) s.line[item >> 1] = 0
    else s.step[item >> 1] = 0
  }
}

// THE FEED: Weyl values on the stage's LEAST significant items (the last in push order) while their radices' logs sum to
// at most `fill` times `room` nats. Returned as amounts, applied by addition in each register's window
export type Feed = { items: Int32Array; amounts: Float64Array }

export function stageFeed(rule: HorizonRule, plan: StagePlan, fill: number, room: number, phase: number): Feed {
  const items: number[] = []
  const amounts: number[] = []
  let used = 0

  for (let i = plan.items.length - 1; i >= 0; i--) {
    const item = plan.items[i]!

    used += Math.log(radix(rule, item))
    if (used > fill * room * (1 + 1e-12)) break
    items.push(item)
    amounts.push(isLine(item) ? weylLine(item >> 1, phase) : weylStep(rule, item >> 1, phase))
  }

  return { items: Int32Array.from(items), amounts: Float64Array.from(amounts) }
}

export function applyFeed(rule: HorizonRule, feed: Feed, s: OpenState, sense: 1 | -1): void {
  feed.items.forEach((item, i) => {
    const link = item >> 1
    const a = sense * feed.amounts[i]!

    if (isLine(item)) s.line[link] = balanced(s.line[link]! + a, 3)
    else s.step[link] = balanced(s.step[link]! + a, rule.span)
  })
}

// ---------------------------------------------------------------------------------------------------------
// the witness

// the value and the radix product of items [lo, hi), by halves
function tree(rule: HorizonRule, items: Int32Array, s: OpenState, lo: number, hi: number): { v: bigint; r: bigint } {
  if (hi - lo === 1) return { v: BigInt(valueOf(s, items[lo]!)), r: BigInt(radix(rule, items[lo]!)) }

  const mid = (lo + hi) >> 1
  const a = tree(rule, items, s, lo, mid)
  const b = tree(rule, items, s, mid, hi)

  return { v: a.v * b.r + b.v, r: a.r * b.r }
}

export const lnBig = (x: bigint): number => {
  const bits = x.toString(2).length

  if (bits <= 52) return Math.log(Number(x))

  const shift = bits - 52

  return Math.log(Number(x >> BigInt(shift))) + shift * Math.LN2
}

const abs = (x: bigint): bigint => (x < 0n ? -x : x)

export type StageWitness = {
  fits: boolean
  // ln(2 |V| + 1), the stage's new digits' capacity (T_new - T_old) ln(span), and the counter's ln(2 |N_new| + 1)
  // against T_new ln(span), in nats
  infall: number
  room: number
  counter: number
  capacity: number
}

export function stageWitness(rule: HorizonRule, plan: StagePlan, s: OpenState): StageWitness {
  const span = BigInt(rule.span)
  let old = 0n

  for (let j = plan.oldCut.length - 1; j >= 0; j--) old = old * span + BigInt(s.step[plan.oldCut[j]!]!)

  const v = plan.items.length ? tree(rule, plan.items, s, 0, plan.items.length).v : 0n
  const n = v * span ** BigInt(plan.oldCut.length) + old
  const half = (span ** BigInt(plan.newCut.length) - 1n) / 2n
  const lnSpan = Math.log(rule.span)

  return {
    fits: abs(n) <= half,
    infall: lnBig(2n * abs(v) + 1n),
    room: Math.max(plan.newCut.length - plan.oldCut.length, 0) * lnSpan,
    counter: lnBig(2n * abs(n) + 1n),
    capacity: plan.newCut.length * lnSpan,
  }
}

// ---------------------------------------------------------------------------------------------------------
// the growth

export type GrowSpec = {
  // the target horizon of each stage, H_1 .. H_K, each inside the next
  targets: readonly Uint8Array[]
  // the plan of each stage when the horizon held is the previous target (index k - 1 for stage k; H_0 empty)
  plans: readonly StagePlan[]
  between: number
  settle: number
  pushed: boolean
  // the feed before stage k's join (index k - 1), given the stage's plan
  feed?: (k: number, plan: StagePlan) => Feed | null
}

export type GrowRecord = {
  // per stage: formed (always, unpushed), the horizon held after it, its plan, its feed, the witness (pushed)
  formed: boolean[]
  held: Uint8Array[]
  plans: StagePlan[]
  feeds: (Feed | null)[]
  witness: StageWitness[]
  agree: boolean[]
}

export const newGrowRecord = (): GrowRecord => ({ formed: [], held: [], plans: [], feeds: [], witness: [], agree: [] })

export type GrowTick = { stage: number; beat: number; horizon: Uint8Array }

// the growth, step by step: yields after every join and every beat. `follow`, for an unpushed run: a pushed run's
// record, read as it is written (the pushed run a tick ahead), whose held horizons and feeds this run takes, so both
// runs tear the same links and take the same events
export function* growSteps(mesh: OpenMesh, rule: HorizonRule, s: OpenState, spec: GrowSpec, record: GrowRecord, follow?: GrowRecord, scratch: CountScratch = countScratch(mesh)): Generator<GrowTick> {
  let horizon = new Uint8Array(mesh.huskDocks)
  let onTrack = true

  for (let k = 1; k <= spec.targets.length; k++) {
    const target = follow ? follow.held[k - 1]! : spec.targets[k - 1]!
    const plan = onTrack && target === spec.targets[k - 1] ? spec.plans[k - 1]! : stagePlan(mesh, horizon, target)
    const feed = follow ? follow.feeds[k - 1]! : spec.feed ? spec.feed(k, plan) : null

    if (feed) applyFeed(rule, feed, s, 1)

    let formed = true

    if (spec.pushed) {
      const w = stageWitness(rule, plan, s)

      formed = stageForm(rule, plan, s).formed
      record.witness.push(w)
      record.agree.push(w.fits === formed)
    }
    if (formed) horizon = target
    onTrack = onTrack && formed && target === spec.targets[k - 1]
    record.formed.push(formed)
    record.held.push(horizon)
    record.plans.push(plan)
    record.feeds.push(feed)
    yield { stage: k, beat: 0, horizon }

    const beats = spec.between + (k === spec.targets.length ? spec.settle : 0)

    for (let t = 1; t <= beats; t++) {
      countBeat(mesh, rule, s, horizon, scratch)
      yield { stage: k, beat: t, horizon }
    }
  }
}

export function grow(mesh: OpenMesh, rule: HorizonRule, s: OpenState, spec: GrowSpec, each?: (tick: GrowTick, s: OpenState) => void): GrowRecord {
  const record = newGrowRecord()

  for (const tick of growSteps(mesh, rule, s, spec, record)) each?.(tick, s)

  return record
}

// the growth run back: every beat back, every formed join unformed, every feed taken off
export function growBack(mesh: OpenMesh, rule: HorizonRule, s: OpenState, spec: GrowSpec, record: GrowRecord, scratch: CountScratch = countScratch(mesh)): void {
  const stages = record.formed.length

  for (let k = stages; k >= 1; k--) {
    const beats = spec.between + (k === spec.targets.length ? spec.settle : 0)
    const horizon = record.held[k - 1]!

    for (let t = 0; t < beats; t++) countBeatBack(mesh, rule, s, horizon, scratch)
    if (spec.pushed && record.formed[k - 1]) stageUnform(rule, record.plans[k - 1]!, s)

    const feed = record.feeds[k - 1]

    if (feed) applyFeed(rule, feed, s, -1)
  }
}

// a run that formed every stage of `spec` with no feed, from the end of stage k's `between` beats: its stages run back
// to the start (unwind) and forward again (regrow, false if a stage is refused)
export function unwindStages(mesh: OpenMesh, rule: HorizonRule, s: OpenState, spec: GrowSpec, k: number, scratch: CountScratch = countScratch(mesh)): void {
  for (let j = k; j >= 1; j--) {
    for (let t = 0; t < spec.between; t++) countBeatBack(mesh, rule, s, spec.targets[j - 1]!, scratch)
    stageUnform(rule, spec.plans[j - 1]!, s)
  }
}

export function regrowStages(mesh: OpenMesh, rule: HorizonRule, s: OpenState, spec: GrowSpec, k: number, scratch: CountScratch = countScratch(mesh)): boolean {
  for (let j = 1; j <= k; j++) {
    if (!stageForm(rule, spec.plans[j - 1]!, s).formed) return false
    for (let t = 0; t < spec.between; t++) countBeat(mesh, rule, s, spec.targets[j - 1]!, scratch)
  }

  return true
}

// ---------------------------------------------------------------------------------------------------------
// the outside

// every register of a and b equal, except the torn ones of `horizon`: the step of each husk lateral link with an end on
// it and the line of each with both ends on it
export function sameOutsideOf(mesh: OpenMesh, a: OpenState, b: OpenState, horizon: Uint8Array): boolean {
  for (let y = 0; y < a.rate.length; y++) if (a.rate[y] !== b.rate[y] || a.rest[y] !== b.rest[y]) return false
  for (let m = 0; m < mesh.links; m++) {
    let ends = 0

    if (mesh.kind[m] === HUSK_LATERAL) ends = horizon[mesh.tail[m]!]! + horizon[mesh.head[m]!]!
    if (ends === 0 && a.step[m] !== b.step[m]) return false
    if (ends < 2 && a.line[m] !== b.line[m]) return false
  }

  return true
}

// the pushed and the unpushed runs in lockstep from the same start: the ticks on which their outsides differ
export function outsideAgainstHeld(mesh: OpenMesh, rule: HorizonRule, start: OpenState, spec: GrowSpec): { ticks: number; differ: number; pushed: GrowRecord; final: OpenState } {
  const a = duplicateOpen(start)
  const b = duplicateOpen(start)
  const pushed = newGrowRecord()
  const runA = growSteps(mesh, rule, a, { ...spec, pushed: true }, pushed)
  const runB = growSteps(mesh, rule, b, { ...spec, pushed: false }, newGrowRecord(), pushed)
  let ticks = 0
  let differ = 0

  for (;;) {
    const ta = runA.next()

    if (ta.done) break

    const tb = runB.next()

    if (tb.done) throw new Error('outsideAgainstHeld: the runs fell out of step')
    ticks++
    if (tb.value.horizon !== ta.value.horizon || !sameOutsideOf(mesh, a, b, ta.value.horizon)) differ++
  }

  return { ticks, differ, pushed, final: a }
}

// every torn register of `horizon` (steps of links with an end on it, lines of links with both ends on it), read
export type TornValues = { cut: Float64Array; interiorStep: Float64Array; interiorLine: Float64Array }

export function tornValues(mesh: OpenMesh, horizon: Uint8Array, s: OpenState): TornValues {
  const cut: number[] = []
  const step: number[] = []
  const line: number[] = []

  for (let m = 0; m < mesh.links; m++) {
    if (mesh.kind[m] !== HUSK_LATERAL) continue

    const ends = horizon[mesh.tail[m]!]! + horizon[mesh.head[m]!]!

    if (ends === 1) cut.push(s.step[m]!)
    else if (ends === 2) (step.push(s.step[m]!), line.push(s.line[m]!))
  }

  return { cut: Float64Array.from(cut), interiorStep: Float64Array.from(step), interiorLine: Float64Array.from(line) }
}

// how many torn registers take more than one value across the states, and the count in nats (span a step, 3 a line)
export function tornVarietyOf(rule: HorizonRule, states: readonly TornValues[]): { cut: number; interiorStep: number; interiorLine: number; nats: number } {
  const varies = (pick: (t: TornValues) => Float64Array, i: number): boolean => states.some(t => pick(t)[i] !== pick(states[0]!)[i])
  const count = (pick: (t: TornValues) => Float64Array): number => {
    let n = 0

    for (let i = 0; i < pick(states[0]!).length; i++) if (varies(pick, i)) n++

    return n
  }
  const cut = count(t => t.cut)
  const interiorStep = count(t => t.interiorStep)
  const interiorLine = count(t => t.interiorLine)

  return { cut, interiorStep, interiorLine, nats: (cut + interiorStep) * Math.log(rule.span) + interiorLine * Math.log(3) }
}

// the items of a plan whose link has both ends within `radius` of `center`, given Weyl values; every other item 0
export function ballStart(mesh: OpenMesh, rule: HorizonRule, plan: StagePlan, base: OpenState, center: readonly number[], radius: number, phase: number): OpenState {
  const s = duplicateOpen(base)

  clearStage(plan, s)
  for (const item of plan.items) {
    const link = item >> 1

    if (huskDistance(mesh, mesh.tail[link]!, center) >= radius || huskDistance(mesh, mesh.head[link]!, center) >= radius) continue
    if (isLine(item)) s.line[link] = weylLine(link, phase)
    else s.step[link] = weylStep(rule, link, phase)
  }

  return s
}
