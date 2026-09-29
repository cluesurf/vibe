// Measurement for the membrane tear (code/rule/membrane-horizon, test/experiment/gravity/membrane-horizon-entropy): the
// infall starts, the independent witness of whether an infall fits its surface, and which torn registers vary across
// formed states. Real numbers live here only; the rule holds integers.
//
// THE WITNESS. The rule pushes each item on c_s base-span digits with carry, in doubles. The witness recomputes every
// surface dock's number from the start's own registers by Horner's rule in BigInt, n = (..(v_1 r_2 + v_2) r_3 ..) + v_k,
// with no digits and no carry, and compares |n| to (span^c_s - 1) / 2. It also gives the infall's size exactly:
// ln(2 |n| + 1) nats, against the dock's capacity c_s ln(span).
//
// DETERMINISM: every start is a fixed Weyl pattern; nothing is drawn. NOTHING MOVES: each value takes its new value by
// the rule.

import {
  duplicateOpen,
  type OpenMesh,
  type OpenState,
} from '@/code/rule/open-husk'
import { huskDistance } from '@/code/measure/open-husk'
import {
  LINE_ITEM,
  type MembranePlan,
} from '@/code/rule/membrane-horizon'
import type { HorizonRule } from '@/code/rule/horizon-husk'

const PHI = (Math.sqrt(5) - 1) / 2
const frac = (x: number): number => x - Math.floor(x)

// a Weyl value over the whole window: a step in -top .. top, a line trit in -1 .. 1
export const weylStep = (
  rule: HorizonRule,
  link: number,
  phase: number,
): number =>
  Math.floor(rule.span * frac((link + phase) * Math.SQRT2)) - rule.top
export const weylLine = (link: number, phase: number): number =>
  Math.floor(3 * frac((link + phase) * PHI)) - 1

const isLine = (item: number): boolean => (item & 1) === LINE_ITEM
const radix = (rule: HorizonRule, item: number): number =>
  isLine(item) ? 3 : rule.span

// every item register of the plan set to 0 (the torn registers of a horizon that has no infall)
export function clearItems(plan: MembranePlan, s: OpenState): void {
  for (const m of plan.interior) {
    s.step[m] = 0
    s.line[m] = 0
  }

  for (const m of plan.cut) {
    s.step[m] = 0
  }
}

// THE FILL: `base` with every item 0, then on each surface dock the LEAST significant items (the deepest, pushed last)
// set to Weyl values while their radices' logs sum to at most `fill` times the dock's capacity c_s ln(span). A fill of 1
// or less always fits (the product of the radices is at most the window); past 1 it fits only if the value of the most
// significant filled item leaves the number in the window
export function fillStart(
  rule: HorizonRule,
  plan: MembranePlan,
  base: OpenState,
  fill: number,
  phase: number,
): OpenState {
  const s = duplicateOpen(base)
  const lnSpan = Math.log(rule.span)

  clearItems(plan, s)
  plan.items.forEach((items, k) => {
    const room = fill * plan.digits[k]!.length * lnSpan

    let used = 0

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i]!
      const link = item >> 1

      used += Math.log(radix(rule, item))

      if (used > room * (1 + 1e-12)) {
        break
      }

      if (isLine(item)) {
        s.line[link] = weylLine(link, phase)
      } else {
        s.step[link] = weylStep(rule, link, phase)
      }
    }
  })

  return s
}

// `base` with every item 0 except those whose link has both ends within `radius` of `center` (on the husk): a fixed ball
// of infall, the same docks at every M
export function ballInfall(
  mesh: OpenMesh,
  rule: HorizonRule,
  plan: MembranePlan,
  base: OpenState,
  center: readonly number[],
  radius: number,
  phase: number,
): OpenState {
  const s = duplicateOpen(base)

  clearItems(plan, s)
  plan.items.forEach(items => {
    for (const item of items) {
      const link = item >> 1

      if (
        huskDistance(mesh, mesh.tail[link]!, center) >= radius ||
        huskDistance(mesh, mesh.head[link]!, center) >= radius
      ) {
        continue
      }

      if (isLine(item)) {
        s.line[link] = weylLine(link, phase)
      } else {
        s.step[link] = weylStep(rule, link, phase)
      }
    }
  })

  return s
}

// a FORMED state with every counter digit a Weyl value and the interior 0: unformed and formed again it must come back,
// which shows those digits are in the image of formation
export function weylCounters(
  rule: HorizonRule,
  plan: MembranePlan,
  base: OpenState,
  phase: number,
): OpenState {
  const s = duplicateOpen(base)

  clearItems(plan, s)

  for (const m of plan.cut) {
    s.step[m] = weylStep(rule, m, phase)
  }

  return s
}

// ---------------------------------------------------------------------------------------------------------
// the witness

const lnBig = (x: bigint): number => {
  const bits = x.toString(2).length

  if (bits <= 52) {
    return Math.log(Number(x))
  }

  const shift = bits - 52

  return Math.log(Number(x >> BigInt(shift))) + shift * Math.LN2
}

export type Witness = {
  fits: boolean
  // per surface dock: fits, the infall's size ln(2 |n| + 1) and the capacity c_s ln(span), in nats
  dockFits: boolean[]
  nats: Float64Array
  capacity: Float64Array
}

export function infallWitness(
  rule: HorizonRule,
  plan: MembranePlan,
  s: OpenState,
): Witness {
  const n = plan.surface.length
  const dockFits: boolean[] = []
  const nats = new Float64Array(n)
  const capacity = new Float64Array(n)
  const span = BigInt(rule.span)

  for (let k = 0; k < n; k++) {
    let x = 0n

    for (const item of plan.items[k]!) {
      const link = item >> 1

      x =
        x * BigInt(radix(rule, item)) +
        BigInt(isLine(item) ? s.line[link]! : s.step[link]!)
    }

    const c = plan.digits[k]!.length
    const half = (span ** BigInt(c) - 1n) / 2n
    const size = x < 0n ? -x : x

    dockFits.push(size <= half)
    nats[k] = lnBig(2n * size + 1n)
    capacity[k] = c * Math.log(rule.span)
  }

  return { fits: dockFits.every(v => v), dockFits, nats, capacity }
}

// ---------------------------------------------------------------------------------------------------------
// which torn registers vary

export type Variety = {
  // registers that take more than one value across the states
  interiorSteps: number
  interiorLines: number
  cutSteps: number
}

export function tornVariety(
  plan: MembranePlan,
  states: readonly OpenState[],
): Variety {
  const varies = (read: (s: OpenState) => number): boolean =>
    states.some(s => read(s) !== read(states[0]!))

  let interiorSteps = 0
  let interiorLines = 0
  let cutSteps = 0

  for (const m of plan.interior) {
    if (varies(s => s.step[m]!)) {
      interiorSteps++
    }

    if (varies(s => s.line[m]!)) {
      interiorLines++
    }
  }

  for (const m of plan.cut) {
    if (varies(s => s.step[m]!)) {
      cutSteps++
    }
  }

  return { interiorSteps, interiorLines, cutSteps }
}

// the hidden count, in nats: every torn register that varies, over its window (span for a step, 3 for a line)
export const varietyCount = (rule: HorizonRule, v: Variety): number =>
  (v.interiorSteps + v.cutSteps) * Math.log(rule.span) +
  v.interiorLines * Math.log(3)
