// The balanced membrane (test/experiment/gravity/balanced-membrane-growth): E-GRV-0131's membrane tear (code/rule/
// membrane-horizon) with its two caveats removed. There the bound was enforced PER SURFACE DOCK, because each torn value
// went to the counter of its nearest surface dock, so a compact deep infall piled onto a few docks and was refused at 4
// percent of the surface's capacity; and the horizon was PLACED at each M. Here the whole surface is ONE counter, and
// the horizon GROWS, stage by stage, each join carrying the joined docks' torn registers onto the surface of that
// moment. A STAND-IN, as the torn husk is (code/rule/horizon-husk, code/rule/count-horizon): nothing in the model makes
// the depth read any state (E-GRV-0071).
//
// THE COUNTER. The whole surface of a horizon H holds one balanced number N in base span (the step window, a trit and L
// base-Q digits), T_cut digits, digit j on the j-th CUT link of H in link-index order (the cut links: husk lateral
// links with exactly one end on H). No register is added: the digits are the cut links' own step registers.
//
// A STAGE, H_old -> H_new (H_old inside H_new; H_old empty for a placed horizon). Its ITEMS are every register the
// join takes out of the dynamics: the step of every husk lateral link with an end on H_new and none on H_old (radix
// span), and the line of every link with both ends on H_new and not both on H_old (radix 3). Their order, most
// significant first: the steps of H_new's cut links among them (link order), then the rest by the depth of the link's
// shallower end inside H_new (a breadth-first search inward from H_new's surface docks, in index order), shallowest
// first, link order, line before step. The stage's number V is Horner's rule over the items, V <- V r + v, pushed with
// carry on digits in base span.
//   N_new = V span^T_old + N_old,
// the OLD counter the least significant T_old digits, the stage's infall above it. FORMS if |N_new| fits T_new digits,
// |N_new| <= (span^T_new - 1) / 2: then every item register is set to 0, every old counter digit is taken off its old
// cut link (set to 0), and N_new's digits are laid on H_new's cut links. IS REFUSED otherwise, and nothing changes:
// the join is held (the horizon stays H_old, its bit clear).
//
// DERIVED, before any run.
//  - THE BALANCED PUSH IS EXACT, AND ITS INVERSE. V r + v with v balanced in radix r is a bijection (v = n balanced mod
//    r, n = (n' - v) / r inverts it), done on digits with carry in integers under 2^53 (a digit times a radix is at most
//    (span - 1) span / 2 < 3.1e15). Unform: read N_new off H_new's cut links, its low T_old digits are N_old (|N_old| <=
//    (span^T_old - 1) / 2, so adding V span^T_old leaves them alone: the balanced digits of a sum whose low part is in
//    its window), the rest are V; pop the items off V deepest first, which must leave 0; lay N_old back on H_old's cut
//    links. The stage's bit (formed or refused) says which branch ran, so the whole event is one to one.
//  - REFUSAL IS EXACTLY THE TOTAL BOUND. For a placed horizon (H_old empty) N_new = V: the horizon forms iff the whole
//    infall, read as ONE number, fits the whole surface's T_cut digits: ln(2 |V| + 1) <= T_cut ln(span) (the balanced
//    window holds span^T values, one each). No dock has a share, so a compact infall is refused only if its number
//    exceeds the surface's total capacity. Pigeonhole: exactly span^T_cut infall configurations fit, as for any
//    reversible rule; which ones is the order's choice (leading zeros are free, anything after a nonzero item costs its
//    radix whatever its value), so the size of an infall is ln(2 |V| + 1), not a sum over its nonzero registers: a
//    compact infall near the center (least significant) costs about its own size, one near the surface everything
//    deeper than it. That order dependence REMAINS; what is removed is the per-dock pile.
//  - A GROWING HORIZON: EACH STAGE IS BOUNDED BY ITS OWN AREA INCREASE. With N_old least significant, a stage forms iff
//    its infall fits the new digits, ln(2 |V| + 1) <= (T_new - T_old) ln(span) (if T_new <= T_old, iff V = 0 and N_old
//    fits T_new digits). A quiet join (V = 0) is free, and a loud one is refused however much room the old counter
//    left unused. The total over a growth is still exactly the surface's: the histories that end formed at T_K number
//    span^T_K. (The other choice, N_new = N_old R + V with the old counter most significant, would bound the total but
//    refuse every join after anything was stored: R, the items' radices, is span to the power of the shell's torn
//    links, far more than its new cut links.) So this is the differential form of the bound, dS_in <= dA ln(span).
//  - THE SURFACE MOVES AND STAYS REVERSIBLE. The counter's digits keep their SIGNIFICANCE, not their links: digit j of
//    N_old sits on the j-th cut link of H_old before the join and on the j-th cut link of H_new after it. Some old cut
//    links become interior (their digit moves), some stay cut (they take a new digit), and new cut links appear (they
//    take the moved and the new digits). Both link orders are functions of the horizons alone, so the re-reading is a
//    fixed permutation of values plus the push, and the unform above inverts it.
//  - WHAT THE OUTSIDE CAN LEARN. The count rule (code/rule/count-horizon) reads no torn register, and an interior line
//    only through the sum N of the horizon's content, which the push leaves alone (an interior line adds to one end
//    what it takes from the other; the cut links' lines are not items). So the pushes change nothing outside; one bit
//    a stage (formed or held) reaches the outside through the horizon's shape.
// DETERMINISM: nothing is drawn; the order of every search and push is fixed by index. NOTHING MOVES: each value takes
// its new value by the rule.

import { HUSK_LATERAL, type OpenMesh, type OpenState } from '@/code/rule/open-husk'
import type { HorizonRule } from '@/code/rule/horizon-husk'
import { LINE_ITEM, STEP_ITEM, balanced } from '@/code/rule/membrane-horizon'

const across = (mesh: OpenMesh, m: number, y: number): number => (mesh.tail[m] === y ? mesh.head[m]! : mesh.tail[m]!)

export type StagePlan = {
  // the cut links of H_old and H_new, ascending (the counter's digits, least significant first)
  readonly oldCut: Int32Array
  readonly newCut: Int32Array
  // the stage's items, most significant first: 2 x link + STEP_ITEM or LINE_ITEM
  readonly items: Int32Array
  // the docks that join
  readonly joined: Int32Array
}

// the cut links of a horizon, ascending
export function cutLinks(mesh: OpenMesh, horizon: Uint8Array): Int32Array {
  const out: number[] = []

  for (let m = 0; m < mesh.links; m++) {
    if (mesh.kind[m] !== HUSK_LATERAL) continue
    if (horizon[mesh.tail[m]!]! + horizon[mesh.head[m]!]! === 1) out.push(m)
  }

  return Int32Array.from(out)
}

// per husk dock its depth inside H from H's surface (0 on it, -1 off H): breadth first inward, in index order
export function surfaceDepth(mesh: OpenMesh, horizon: Uint8Array): Int32Array {
  const depth = new Int32Array(mesh.huskDocks).fill(-1)
  const queue: number[] = []

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (!horizon[y]) continue

    for (let j = mesh.incStart[y]!; j < mesh.incStart[y + 1]!; j++) {
      const m = mesh.incLink[j]!

      if (mesh.kind[m] === HUSK_LATERAL && !horizon[across(mesh, m, y)]) {
        depth[y] = 0
        queue.push(y)
        break
      }
    }
  }

  for (let at = 0; at < queue.length; at++) {
    const y = queue[at]!

    for (let j = mesh.incStart[y]!; j < mesh.incStart[y + 1]!; j++) {
      const m = mesh.incLink[j]!

      if (mesh.kind[m] !== HUSK_LATERAL) continue

      const z = across(mesh, m, y)

      if (!horizon[z] || depth[z]! >= 0) continue
      depth[z] = depth[y]! + 1
      queue.push(z)
    }
  }

  for (let y = 0; y < mesh.huskDocks; y++) if (horizon[y] && depth[y]! < 0) throw new Error('surfaceDepth: a horizon dock is not reached from the surface')

  return depth
}

export function stagePlan(mesh: OpenMesh, oldH: Uint8Array, newH: Uint8Array): StagePlan {
  const joined: number[] = []

  for (let y = 0; y < mesh.huskDocks; y++) {
    if (oldH[y] && !newH[y]) throw new Error('stagePlan: the old horizon is not inside the new one')
    if (newH[y] && !oldH[y]) joined.push(y)
  }

  const depth = surfaceDepth(mesh, newH)
  const cutItems: number[] = []
  const deep: { depth: number; item: number }[] = []

  for (let m = 0; m < mesh.links; m++) {
    if (mesh.kind[m] !== HUSK_LATERAL) continue

    const a = mesh.tail[m]!
    const b = mesh.head[m]!
    const inNew = newH[a]! + newH[b]!
    const inOld = oldH[a]! + oldH[b]!

    if (inNew === 0) continue
    if (inNew === 1) {
      // a cut link of H_new: its step is an item when it was live before (no end on H_old)
      if (inOld === 0) cutItems.push(2 * m + STEP_ITEM)
      continue
    }

    // both ends on H_new
    const e = depth[a]! < depth[b]! ? a : depth[b]! < depth[a]! ? b : Math.min(a, b)

    if (inOld < 2) deep.push({ depth: depth[e]!, item: 2 * m + LINE_ITEM })
    if (inOld === 0) deep.push({ depth: depth[e]!, item: 2 * m + STEP_ITEM })
  }

  // a stable sort keeps link order within a depth, line before step
  deep.sort((p, q) => p.depth - q.depth)

  return { oldCut: cutLinks(mesh, oldH), newCut: cutLinks(mesh, newH), items: Int32Array.from([...cutItems, ...deep.map(p => p.item)]), joined: Int32Array.from(joined) }
}

// ---------------------------------------------------------------------------------------------------------
// a balanced number on digits in base `base`, least significant first, `len` the digits in use (every digit at or
// above len is 0)

export type Digits = { d: Float64Array; len: number }

export const digitsOf = (d: Float64Array): Digits => {
  let len = d.length

  while (len > 0 && d[len - 1] === 0) len--

  return { d, len }
}

// the balanced quotient of an integer t (|t| < 2^53) by an odd `base`: t = q base + (t - q base), |t - q base| <= half.
// The rounded float quotient is corrected by one step, so the result is exact whatever the division's rounding
function nearQuotient(t: number, base: number, half: number): number {
  let q = Math.round(t / base)
  const d = t - q * base

  if (d > half) q++
  else if (d < -half) q--

  return q
}

// the floor quotient of an integer t (|t| < 2^53) by r > 0, exact
function floorQuotient(t: number, r: number): number {
  let q = Math.floor(t / r)
  const d = t - q * r

  if (d < 0) q--
  else if (d >= r) q++

  return q
}

// n <- n r + v, with carry; false when a carry is left over the top digit (n out of the window: the balanced digits hold
// every value of the window once, so a carry c != 0 puts n at least (base^c + 1) / 2 out)
export function pushItem(n: Digits, base: number, r: number, v: number): boolean {
  const d = n.d
  const half = (base - 1) / 2
  let carry = v

  for (let i = 0; i < n.len; i++) {
    const t = d[i]! * r + carry
    const q = nearQuotient(t, base, half)

    d[i] = t - q * base
    carry = q
  }
  while (carry !== 0) {
    if (n.len === d.length) return false

    const q = nearQuotient(carry, base, half)

    d[n.len++] = carry - q * base
    carry = q
  }
  while (n.len > 0 && d[n.len - 1] === 0) n.len--

  return true
}

// v = n balanced mod r, n <- (n - v) / r; the inverse of pushItem
export function popItem(n: Digits, base: number, r: number): number {
  const d = n.d
  const half = (base - 1) / 2
  let rem = 0

  for (let i = n.len - 1; i >= 0; i--) {
    const t = rem * base + d[i]!

    rem = t - floorQuotient(t, r) * r
  }

  const v = balanced(rem, r)

  if (n.len === 0) {
    if (v !== 0) throw new Error('popItem: a remainder from 0')

    return 0
  }

  // (n - v) / r, exact, top down on floor quotients, then balanced again bottom up
  d[0] = d[0]! - v
  rem = 0
  for (let i = n.len - 1; i >= 0; i--) {
    const t = rem * base + d[i]!
    const q = floorQuotient(t, r)

    rem = t - q * r
    d[i] = q
  }
  if (rem !== 0) throw new Error('popItem: the counter was not divisible after taking its remainder')

  let carry = 0

  for (let i = 0; i < n.len; i++) {
    const t = d[i]! + carry
    const q = nearQuotient(t, base, half)

    d[i] = t - q * base
    carry = q
  }
  if (carry !== 0) throw new Error('popItem: the quotient left the window')
  while (n.len > 0 && d[n.len - 1] === 0) n.len--

  return v
}

// ---------------------------------------------------------------------------------------------------------
// the stage

const itemRadix = (rule: HorizonRule, item: number): number => ((item & 1) === LINE_ITEM ? 3 : rule.span)
const itemValue = (s: OpenState, item: number): number => ((item & 1) === LINE_ITEM ? s.line[item >> 1]! : s.step[item >> 1]!)

export type StageResult = {
  formed: boolean
  // the stage's infall as a number fits its digits (T_new - T_old of them), and the old counter fits T_new digits
  infallFits: boolean
  oldFits: boolean
}

// FORM the stage on `s` in place, or refuse and leave `s` unchanged
export function stageForm(rule: HorizonRule, plan: StagePlan, s: OpenState): StageResult {
  const tOld = plan.oldCut.length
  const tNew = plan.newCut.length
  const room = Math.max(tNew - tOld, 0)
  const v: Digits = { d: new Float64Array(room), len: 0 }
  let infallFits = true

  for (const item of plan.items) {
    if (!pushItem(v, rule.span, itemRadix(rule, item), itemValue(s, item))) {
      infallFits = false
      break
    }
  }

  let oldFits = true

  for (let j = tNew; j < tOld; j++) if (s.step[plan.oldCut[j]!] !== 0) oldFits = false
  if (!infallFits || !oldFits) return { formed: false, infallFits, oldFits }

  const next = new Float64Array(tNew)

  for (let j = 0; j < Math.min(tOld, tNew); j++) next[j] = s.step[plan.oldCut[j]!]!
  for (let j = 0; j < v.len; j++) next[tOld + j] = v.d[j]!

  for (const m of plan.oldCut) s.step[m] = 0
  for (const item of plan.items) {
    if ((item & 1) === LINE_ITEM) s.line[item >> 1] = 0
    else s.step[item >> 1] = 0
  }
  plan.newCut.forEach((m, j) => (s.step[m] = next[j]!))

  return { formed: true, infallFits, oldFits }
}

// the inverse of a formed stage
export function stageUnform(rule: HorizonRule, plan: StagePlan, s: OpenState): void {
  const tOld = plan.oldCut.length
  const tNew = plan.newCut.length
  const read = Float64Array.from(plan.newCut, m => s.step[m]!)
  const low = new Float64Array(tOld)

  for (let j = 0; j < Math.min(tOld, tNew); j++) low[j] = read[j]!

  const v = digitsOf(tNew > tOld ? read.slice(tOld) : new Float64Array(0))

  for (const m of plan.newCut) s.step[m] = 0

  const items = plan.items

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i]!
    const value = popItem(v, rule.span, itemRadix(rule, item))

    if ((item & 1) === LINE_ITEM) s.line[item >> 1] = value
    else s.step[item >> 1] = value
  }
  if (v.len !== 0) throw new Error('stageUnform: the stage number did not empty')

  plan.oldCut.forEach((m, j) => (s.step[m] = low[j]!))
}
