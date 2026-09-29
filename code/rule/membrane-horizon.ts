// The membrane tear (test/experiment/gravity/membrane-horizon-entropy): a horizon whose interior holds no state of its
// own. note/research/vibe/roadmap/remaining-pieces.md, 7, "What an area law would need": when a link tears, its value
// is carried, exactly and reversibly, onto a bounded counter on the nearest SURFACE dock, so the only registers nothing
// outside reads are the surface's. A STAND-IN, as the torn husk is (code/rule/horizon-husk, code/rule/count-horizon):
// nothing in the model makes the depth read any state (E-GRV-0071).
//
// THE RULE, at the event that forms the horizon H (a set of husk docks, E-GRV-0124's headroom horizon):
//  - THE SURFACE is the docks of H with a husk lateral neighbor off H. The CUT links are the husk lateral links with
//    exactly one end on H; each belongs to its end on H, a surface dock.
//  - THE COUNTER of a surface dock s is the c_s step registers of its own cut links, read as ONE balanced number in base
//    span (the step window, a trit and L base-Q digits), least significant digit on the lowest link index. No register is
//    added: the counter is the torn registers E-GRV-0124 already found on the surface, and its window is span^c_s values.
//  - THE ITEMS. Every register the tear takes out of the dynamics: the step of every link with an end on H (radix span)
//    and the line of every link with both ends on H (radix 3). A cut link's item goes to its own surface dock. An
//    interior link's goes to the surface dock NEAREST its shallower end: a breadth-first search inward from the surface
//    docks in index order, over husk lateral links inside H, gives each dock of H a depth and an owner.
//  - THE PUSH, per surface dock, in a fixed order: its cut steps (link order), then its interior items by depth
//    (shallowest first), link order, line before step. Each item is pushed with carry, n <- n r + v, v the item's
//    balanced value; so the first item pushed is the most significant and the deepest the least.
//  - FORMS if every surface dock's n fits its window, |n| <= (span^c_s - 1) / 2. Then every interior link's step and line
//    are set to 0, and each cut link's step to its digit of n. IS REFUSED otherwise, and nothing changes: the horizon is
//    held from forming (hold, all or nothing), and its bit stays clear.
//
// DERIVED, before any run:
//  - EXACT. n r + v with v balanced in radix r is a bijection from (n, v) to n', and v = n' balanced mod r, n = (n' - v)
//    / r inverts it. The push is done on the c_s digits with carry, in integers under 2^53 (a digit times a radix is at
//    most (span - 1) / 2 span < 3.1e15); an overflow is a carry left over the top digit, which is exactly |n| > the window
//    (the balanced digits hold every value of the window once, and a carry c != 0 puts n at least (span^c + 1) / 2 out).
//  - REVERSIBLE, and which option keeps it so. Formation maps the fitting states one to one onto the formed ones (the
//    items are read back off the digits, deepest first; unform), and the horizon's bit says which branch was taken. A
//    refused formation changes nothing and leaves the bit clear, so the whole event is one to one too: REFUSING (holding
//    the horizon from forming) keeps the rule reversible. SATURATING (wrapping the counter mod its window) does not: two
//    infalls that differ only in the wrapped digits land on the same counter. Refusing a single dock's tear instead of
//    the whole horizon is also reversible (the bits record which), but it makes the horizon's shape depend on the hidden
//    counters in push order; the whole-horizon hold keeps the shape a function of M and one bit.
//  - WHAT THE OUTSIDE CAN LEARN. Between events nothing outside reads a torn register (code/rule/count-horizon), so the
//    counters are hidden. At the event, whether the horizon formed depends on the counters' values: one bit about the
//    infall reaches the outside. The rest stays on the surface.
//  - THE CAPACITY. A surface dock holds c_s ln(span) nats, span = 3 Q^L (18.18 nats at D 16, L 3, Q = 297), and the
//    whole surface T_cut ln(span): exactly the "cut part" of E-GRV-0124's count. The pigeonhole bound is code-free: of
//    the infall configurations a dock can receive, exactly span^c_s fit; which ones is this code's choice (those whose
//    number, first item most significant, lies in the window: leading zeros are free, anything after a nonzero costs
//    its radix whatever its size).
//  - THE COUNT after a formation: every interior register holds 0 on every formed state (one value, ln 1 = 0), every
//    counter digit any of span values, so S = T_cut ln(span), with no interior term.
// DETERMINISM: nothing is drawn; the order of every search and push is fixed by index. NOTHING MOVES: each value takes
// its new value by the rule.

import {
  HUSK_LATERAL,
  type OpenMesh,
  type OpenState,
} from '@/code/rule/open-husk'
import type { HorizonRule } from '@/code/rule/horizon-husk'

const mod = (x: number, m: number): number => ((x % m) + m) % m
const floorDiv = (x: number, q: number): number => (x - mod(x, q)) / q

// the balanced representative of x in an odd radix m: -(m - 1) / 2 .. (m - 1) / 2
export const balanced = (x: number, m: number): number =>
  mod(x + (m - 1) / 2, m) - (m - 1) / 2

// an item: 2 x link + 0 for its step, + 1 for its line
export const STEP_ITEM = 0
export const LINE_ITEM = 1

export type MembranePlan = {
  // the horizon's husk docks
  readonly docks: number
  // the surface docks, ascending
  readonly surface: Int32Array
  // per husk dock: its depth inside H from the surface (0 on it, -1 off H) and the surface dock that owns it (-1 off H)
  readonly depth: Int32Array
  readonly owner: Int32Array
  // links with both ends on H, and with exactly one
  readonly interior: Int32Array
  readonly cut: Int32Array
  // per surface dock (by its index in `surface`): its cut links ascending (the counter's digits, least significant
  // first), and its items in push order
  readonly digits: readonly Int32Array[]
  readonly items: readonly Int32Array[]
}

// the other end of link m seen from dock y
const across = (mesh: OpenMesh, m: number, y: number): number =>
  mesh.tail[m] === y ? mesh.head[m]! : mesh.tail[m]!

export function membranePlan(
  mesh: OpenMesh,
  horizon: Uint8Array,
): MembranePlan {
  const n = mesh.huskDocks
  const depth = new Int32Array(n).fill(-1)
  const owner = new Int32Array(n).fill(-1)
  const surface: number[] = []

  let docks = 0

  for (let y = 0; y < n; y++) {
    if (!horizon[y]) {
      continue
    }

    docks++

    for (let j = mesh.incStart[y]!; j < mesh.incStart[y + 1]!; j++) {
      const m = mesh.incLink[j]!

      if (
        mesh.kind[m] === HUSK_LATERAL &&
        !horizon[across(mesh, m, y)]
      ) {
        surface.push(y)
        break
      }
    }
  }

  // breadth first inward from the surface docks, in index order
  const queue = new Int32Array(docks)

  let tail = 0

  for (const y of surface) {
    depth[y] = 0
    owner[y] = y
    queue[tail++] = y
  }

  for (let at = 0; at < tail; at++) {
    const y = queue[at]!

    for (let j = mesh.incStart[y]!; j < mesh.incStart[y + 1]!; j++) {
      const m = mesh.incLink[j]!

      if (mesh.kind[m] !== HUSK_LATERAL) {
        continue
      }

      const z = across(mesh, m, y)

      if (!horizon[z] || depth[z]! >= 0) {
        continue
      }

      depth[z] = depth[y]! + 1
      owner[z] = owner[y]!
      queue[tail++] = z
    }
  }

  if (tail !== docks) {
    throw new Error(
      'membranePlan: a horizon dock is not reached from the surface',
    )
  }

  const slot = new Int32Array(n).fill(-1)

  surface.forEach((y, k) => (slot[y] = k))

  const interior: number[] = []
  const cut: number[] = []
  const digits: number[][] = surface.map(() => [])
  const deep: { depth: number; item: number }[][] = surface.map(
    () => [],
  )

  for (let m = 0; m < mesh.links; m++) {
    if (mesh.kind[m] !== HUSK_LATERAL) {
      continue
    }

    const a = mesh.tail[m]!
    const b = mesh.head[m]!

    if (horizon[a] && horizon[b]) {
      interior.push(m)

      const e =
        depth[a]! < depth[b]!
          ? a
          : depth[b]! < depth[a]!
            ? b
            : Math.min(a, b)
      const k = slot[owner[e]!]!

      deep[k]!.push(
        { depth: depth[e]!, item: 2 * m + LINE_ITEM },
        { depth: depth[e]!, item: 2 * m + STEP_ITEM },
      )
    } else if (horizon[a] || horizon[b]) {
      cut.push(m)
      digits[slot[horizon[a] ? a : b]!]!.push(m)
    }
  }

  // cut steps first (link order), then interior items shallowest first (a stable sort keeps link order, line before step)
  const items = surface.map((_, k) => {
    const inner = deep[k]!.sort((p, q) => p.depth - q.depth).map(
      p => p.item,
    )

    return Int32Array.from([
      ...digits[k]!.map(m => 2 * m + STEP_ITEM),
      ...inner,
    ])
  })

  return {
    docks,
    surface: Int32Array.from(surface),
    depth,
    owner,
    interior: Int32Array.from(interior),
    cut: Int32Array.from(cut),
    digits: digits.map(d => Int32Array.from(d)),
    items,
  }
}

// ---------------------------------------------------------------------------------------------------------
// the counter: c balanced digits in base `base`, least significant first

// n <- n r + v, with carry; false when a carry is left over the top digit (n out of the window)
export function pushDigit(
  d: Float64Array,
  base: number,
  r: number,
  v: number,
): boolean {
  let carry = v

  for (let i = 0; i < d.length; i++) {
    const t = d[i]! * r + carry
    const di = balanced(t, base)

    carry = (t - di) / base
    d[i] = di
  }

  return carry === 0
}

// v = n balanced mod r, n <- (n - v) / r; the inverse of pushDigit
export function popDigit(
  d: Float64Array,
  base: number,
  r: number,
): number {
  let rem = 0

  for (let i = d.length - 1; i >= 0; i--) {
    rem = mod(rem * base + d[i]!, r)
  }

  const v = balanced(rem, r)

  let carry = -v

  for (let i = 0; i < d.length; i++) {
    const t = d[i]! + carry
    const di = balanced(t, base)

    carry = (t - di) / base
    d[i] = di
  }

  if (carry !== 0) {
    throw new Error('popDigit: the counter left its window')
  }

  rem = 0

  for (let i = d.length - 1; i >= 0; i--) {
    const t = rem * base + d[i]!
    const q = floorDiv(t, r)

    rem = t - q * r
    d[i] = q
  }

  if (rem !== 0) {
    throw new Error(
      'popDigit: the counter was not divisible after taking its remainder',
    )
  }

  carry = 0

  for (let i = 0; i < d.length; i++) {
    const t = d[i]! + carry
    const di = balanced(t, base)

    carry = (t - di) / base
    d[i] = di
  }

  if (carry !== 0) {
    throw new Error('popDigit: the quotient left the window')
  }

  return v
}

// ---------------------------------------------------------------------------------------------------------
// the event

export type Formation = {
  formed: boolean
  // surface docks (by index) whose counter would overflow; empty when formed
  overflow: number[]
}

// FORM the membrane horizon on `s` in place, or refuse and leave `s` unchanged. `scratch` holds one digit a link
export function membraneForm(
  mesh: OpenMesh,
  rule: HorizonRule,
  plan: MembranePlan,
  s: OpenState,
  scratch = new Float64Array(mesh.links),
): Formation {
  const overflow: number[] = []

  plan.surface.forEach((_, k) => {
    const cells = plan.digits[k]!
    const d = new Float64Array(cells.length)

    let fits = true

    for (const item of plan.items[k]!) {
      const link = item >> 1
      const line = (item & 1) === LINE_ITEM
      const r = line ? 3 : rule.span

      if (
        !pushDigit(
          d,
          rule.span,
          r,
          line ? s.line[link]! : s.step[link]!,
        )
      ) {
        fits = false
        break
      }
    }

    if (!fits) {
      overflow.push(k)
    } else {
      cells.forEach((m, i) => (scratch[m] = d[i]!))
    }
  })

  if (overflow.length > 0) {
    return { formed: false, overflow }
  }

  for (const m of plan.interior) {
    s.step[m] = 0
    s.line[m] = 0
  }

  for (const m of plan.cut) {
    s.step[m] = scratch[m]!
  }

  return { formed: true, overflow }
}

// the inverse of a formation: every item read back off its surface dock's counter, deepest first
export function membraneUnform(
  rule: HorizonRule,
  plan: MembranePlan,
  s: OpenState,
): void {
  plan.surface.forEach((_, k) => {
    const cells = plan.digits[k]!
    const d = Float64Array.from(cells, m => s.step[m]!)
    const items = plan.items[k]!

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i]!
      const link = item >> 1

      if ((item & 1) === LINE_ITEM) {
        s.line[link] = popDigit(d, rule.span, 3)
      } else {
        s.step[link] = popDigit(d, rule.span, rule.span)
      }
    }

    if (d.some(v => v !== 0)) {
      throw new Error('membraneUnform: the counter did not empty')
    }
  })
}
