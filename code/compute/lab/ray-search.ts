// Item vibe-computation-models-0061: do Kleene min and max exist for the four 3-cycle wire rules that compute neg
// (id.CAB.swap, id.BCA.swap on +1; swap.BCA.id, swap.CAB.id on -1)? Layer 2, on code/compute/lab/gates.ts only.
//
// THE RAY PICTURE OF THE BRICK LINE. Under the brick schedule every pair is (first, second) = (a cell that just left a
// pair as its second cell, a cell that just left a pair as its first cell). So the line is a brickwork of one gate on
// two families of straight light rays: what a pair's second cell holds rides a RIGHT ray into the next pair as its
// first cell, what its first cell holds rides a LEFT ray into the next pair as its second cell. At round 0 the right
// rays start on the even cells and the left rays on the odd cells. Two right rays never share a pair, nor two left
// rays; a right ray from cell 2j meets, in order, the left rays from cells 2j + 1, 2j + 3, ... (two per round).
//
// So the values a right ray ever carries depend only on its own start and on the cells to its right, never on a cell to
// its left. For a rule whose wire rides the right rays and passes a background left ray unchanged (leaving it
// background), a read slot that rides its wire carries, from the read round on, the value its ray holds after crossing
// every left ray of the window. A layout is therefore WLOG a sequence of ray values starting at the output ray (index 0,
// a right ray, its value possibly the background), right rays at even indices and left rays at odd ones, and its output
// is the output ray after the sweep. The sweep is incremental: appending a right ray pushes its value; appending a left
// ray sends it leftward through every right ray already there, updating each. That turns the line search into a depth-
// first search over ray values with every prefix's work shared. A rule whose wire rides the left rays is searched as its
// mirror (cells swapped) and the found window reversed. Every found layout is replayed by the dense and the sparse
// runners of gates.ts and wire-invariant.ts; the ray picture is only the search order, never the evidence.
//
// TABLES. A ray holds a table: its value at each of the 9 inputs (x, y) of inputsOf(2), x least significant. Digits
// are value + 1, packed three to a group (27 values) and the three groups in one integer (5 bits each), so a gate is
// three lookups in a 729-entry table.

import { GateRule, TRITS, Target, fixesUniform, inputsOf } from '@/code/compute/lab/gates'

export type RayRule = {
  name: string
  // indexed by (right-ray group) * 27 + (left-ray group): the group going left (the pair's first cell after the rule)
  // and the group going right (its second cell)
  leftOut: Uint8Array
  rightOut: Uint8Array
}

export function mirrorRule(rule: GateRule): GateRule {
  const first = new Int8Array(9)
  const second = new Int8Array(9)

  for (const a of TRITS) {
    for (const b of TRITS) {
      const p = (a + 1) * 3 + b + 1
      const q = (b + 1) * 3 + a + 1

      first[p] = rule.second[q]!
      second[p] = rule.first[q]!
    }
  }

  return { name: `${rule.name}~mirror`, table: rule.table, first, second }
}

export function rayRule(rule: GateRule): RayRule {
  const leftOut = new Uint8Array(729)
  const rightOut = new Uint8Array(729)

  for (let r = 0; r < 27; r++) {
    for (let l = 0; l < 27; l++) {
      let x = 0
      let y = 0

      for (let i = 0; i < 3; i++) {
        const p = (Math.floor(r / 3 ** i) % 3) * 3 + (Math.floor(l / 3 ** i) % 3)

        x += (rule.first[p]! + 1) * 3 ** i
        y += (rule.second[p]! + 1) * 3 ** i
      }

      leftOut[r * 27 + l] = x
      rightOut[r * 27 + l] = y
    }
  }

  return { name: rule.name, leftOut, rightOut }
}

// ---- packed tables ----

export function packTable(table: ArrayLike<number>): number {
  let packed = 0

  for (let g = 0; g < 3; g++) {
    let group = 0

    for (let i = 0; i < 3; i++) {
      group += (table[g * 3 + i]! + 1) * 3 ** i
    }

    packed |= group << (5 * g)
  }

  return packed
}

export function unpackTable(packed: number): Int8Array {
  const out = new Int8Array(9)

  for (let g = 0; g < 3; g++) {
    const group = (packed >> (5 * g)) & 31

    for (let i = 0; i < 3; i++) {
      out[g * 3 + i] = (Math.floor(group / 3 ** i) % 3) - 1
    }
  }

  return out
}

// the base-3 code of a packed table (0 .. 19,682), digit i = value at input i plus 1
export const tableCode = (packed: number): number =>
  (packed & 31) + 27 * ((packed >> 5) & 31) + 729 * ((packed >> 10) & 31)

const INPUTS2 = inputsOf(2)

export const constantTable = (c: number): number => packTable(INPUTS2.map(() => c))
export const inputTable = (j: number): number => packTable(INPUTS2.map(x => x[j]!))

// A target of arity 1 or 2 as a table over the 9 binary inputs (a unary target reads input x only).
export const targetOver9 = (target: Target): number =>
  packTable(INPUTS2.map(x => target.table[target.arity === 1 ? x[0]! + 1 : (x[0]! + 1) + 3 * (x[1]! + 1)]!))

// ---- which rays carry the wire, and whether the ray reduction holds ----

export type RaySide = 'right' | 'left'

// A cell's wire side by the pair table alone: both off-background tones pass a background partner on that side
// unchanged (the tone keeps its ray and the background stays background). On the right side the tone is the first cell
// of a pair and leaves as its second; on the left side, the reverse.
export function wireSide(rule: GateRule, background: number): RaySide | null {
  if (!fixesUniform(rule, background)) {
    return null
  }

  const tones = TRITS.filter(t => t !== background)
  const passes = (side: RaySide): boolean =>
    tones.every(t => {
      const p = side === 'right' ? (t + 1) * 3 + background + 1 : (background + 1) * 3 + t + 1

      return side === 'right'
        ? rule.first[p] === background && rule.second[p] === t
        : rule.second[p] === background && rule.first[p] === t
    })
  const right = passes('right')
  const left = passes('left')

  return right && !left ? 'right' : left && !right ? 'left' : null
}

// ---- the ray search ----

export type RayHit = {
  target: string
  // ray values from the output ray (index 0) rightward, inputs as null (first input x, then y)
  rays: (number | null)[]
  inputs: number[]
}

export type RaySearch = {
  rule: string
  background: number
  side: RaySide
  maxSpan: number
  // per target: the smallest span with a hit, null when none to maxSpan
  foundSpan: Record<string, number | null>
  // per target: windows of that smallest span that hit (the last ray off the background or an input)
  foundCount: Record<string, number>
  // per target: the first hit in search order at the smallest span
  hits: RayHit[]
  // distinct output tables (arity 2: over the 9 inputs) reached with both inputs placed, by span (cumulative)
  tablesBySpan: number[]
  // windows whose last ray is off the background or an input, by span (the new windows at that span)
  windowsBySpan: number[]
  nodes: number
}

// Exhaustive depth-first search over ray windows of span 1 .. maxSpan: each ray a constant (every tone) or an input
// (x before y), a window counted at the span of its last ray off the background (a background last ray is the shorter
// window). The arity is the largest target arity; a unary search places x only.
export function searchRays(input: {
  rule: GateRule
  background: number
  targets: readonly Target[]
  maxSpan: number
}): RaySearch {
  const { background, targets, maxSpan } = input
  const side = wireSide(input.rule, background)

  if (side === null) {
    throw new Error(`${input.rule.name} on ${background}: no one-sided wire, the ray reduction does not apply`)
  }

  const g = rayRule(side === 'right' ? input.rule : mirrorRule(input.rule))
  const arity = Math.max(...targets.map(t => t.arity))
  const constants = TRITS.map(constantTable)
  const inputs = [inputTable(0), inputTable(1)]
  const bgPacked = constantTable(background)
  const wanted = targets.map(t => ({ name: t.name, packed: targetOver9(t) }))
  const foundSpan: Record<string, number | null> = Object.fromEntries(targets.map(t => [t.name, null]))
  const foundCount: Record<string, number> = Object.fromEntries(targets.map(t => [t.name, 0]))
  const hitOf = new Map<string, RayHit>()
  const firstSpan = new Int32Array(19683).fill(-1)
  const windowsBySpan = new Array<number>(maxSpan + 1).fill(0)
  const rays = new Int32Array(maxSpan)
  const save = new Int32Array(maxSpan * maxSpan)
  const choice = new Int32Array(maxSpan)
  const { leftOut, rightOut } = g

  let nodes = 0

  const visit = (k: number, n: number, placed: number): void => {
    if (k === maxSpan) {
      return
    }

    const isLeft = (k & 1) === 1
    const options = placed < arity ? 4 : 3

    for (let o = 0; o < options; o++) {
      const value = o < 3 ? constants[o]! : inputs[placed]!
      const nowPlaced = o < 3 ? placed : placed + 1

      nodes++
      choice[k] = o < 3 ? o : 3 + placed

      let m = n

      if (isLeft) {
        save.set(rays.subarray(0, n), k * maxSpan)

        let l = value

        for (let j = n - 1; j >= 0; j--) {
          const r = rays[j]!
          const i0 = (r & 31) * 27 + (l & 31)
          const i1 = ((r >> 5) & 31) * 27 + ((l >> 5) & 31)
          const i2 = ((r >> 10) & 31) * 27 + ((l >> 10) & 31)

          rays[j] = rightOut[i0]! | (rightOut[i1]! << 5) | (rightOut[i2]! << 10)
          l = leftOut[i0]! | (leftOut[i1]! << 5) | (leftOut[i2]! << 10)
        }
      } else {
        rays[n] = value
        m = n + 1
      }

      const fresh = o === 3 || value !== bgPacked

      if (nowPlaced === arity && fresh) {
        const span = k + 1
        const out = rays[0]!
        const code = tableCode(out)

        windowsBySpan[span]!++

        // the search is depth first, so a table or a target may be met at a larger span before a smaller one
        if (firstSpan[code]! < 0 || span < firstSpan[code]!) {
          firstSpan[code] = span
        }

        for (const w of wanted) {
          const best = foundSpan[w.name] ?? null

          if (out !== w.packed || (best !== null && span > best)) {
            continue
          }

          if (best === null || span < best) {
            foundSpan[w.name] = span
            foundCount[w.name] = 0
            hitOf.set(w.name, {
              target: w.name,
              rays: Array.from(choice.subarray(0, span), c => (c < 3 ? c - 1 : null)),
              inputs: Array.from(choice.subarray(0, span)).flatMap((c, i) => (c >= 3 ? [i] : [])),
            })
          }

          foundCount[w.name]!++
        }
      }

      visit(k + 1, m, nowPlaced)

      if (isLeft) {
        rays.set(save.subarray(k * maxSpan, k * maxSpan + n), 0)
      }
    }
  }

  visit(0, 0, 0)

  const tablesBySpan: number[] = []

  for (let s = 0; s <= maxSpan; s++) {
    let c = 0

    for (let code = 0; code < 19683; code++) {
      if (firstSpan[code]! >= 0 && firstSpan[code]! <= s) {
        c++
      }
    }

    tablesBySpan.push(c)
  }

  const hits = targets.flatMap(t => {
    const h = hitOf.get(t.name)

    return h ? [h] : []
  })

  return { rule: input.rule.name, background, side, maxSpan, foundSpan, foundCount, hits, tablesBySpan, windowsBySpan, nodes }
}

// The line layout of a ray window, on the cells of gates.ts. A right-side wire puts ray 0 on cell 0 (even, a right ray at
// round 0); every ray is read after round t, the round in which ray 0 crosses the window's last left ray (two per round),
// so every right ray of the window has crossed all of them, and right ray j then sits on cell j + 2t. A left-side wire
// reverses the window so ray 0 is its last cell, on an odd cell. `inputs` are ray indices in input order (x, y, z);
// without them the inputs are the null rays left to right.
export function rayLayoutToLine(input: {
  rays: readonly (number | null)[]
  side: RaySide
  background: number
  inputs?: readonly number[]
  outputRay?: number
}): {
  background: number
  start: number
  window: (number | null)[]
  inputs: number[]
  readPosition: number
  readRound: number
} {
  const { rays, side, background } = input
  const j = input.outputRay ?? 0
  const inputs = input.inputs ?? rays.flatMap((v, i) => (v === null ? [i] : []))
  const lastLeft = rays.length % 2 === 0 ? rays.length - 1 : rays.length - 2
  const readRound = lastLeft < 1 ? 1 : Math.floor((lastLeft - 1) / 2 / 2) + 1

  if (side === 'right') {
    return { background, start: 0, window: [...rays], inputs: [...inputs], readPosition: j + 2 * readRound, readRound }
  }

  // ray 0 on the smallest odd cell that keeps the whole window on cells >= 0 (the dense runner's frame)
  const window = [...rays].reverse()
  const out = (window.length - 1) % 2 === 1 ? window.length - 1 : window.length
  const start = out - (window.length - 1)

  return {
    background,
    start,
    window,
    // ray index i lands on window index length - 1 - i
    inputs: inputs.map(i => rays.length - 1 - i),
    readPosition: out - j - 2 * readRound,
    readRound,
  }
}

// The ray picture run plainly, one input at a time (no packing, no shared prefixes): the final table of every right ray
// of a window, in right-ray order. An instrument check for the packed search and for the picture itself.
export function rayTables(input: {
  rule: GateRule
  side: RaySide
  rays: readonly (number | null)[]
  inputs: readonly number[]
}): Int8Array[] {
  const g = input.side === 'right' ? input.rule : mirrorRule(input.rule)
  const points = inputsOf(input.inputs.length)
  const out: number[][] = []

  points.forEach(x => {
    const right: number[] = []

    input.rays.forEach((v, k) => {
      const value = v ?? x[input.inputs.indexOf(k)]!

      if ((k & 1) === 0) {
        right.push(value)

        return
      }

      let l = value

      for (let j = right.length - 1; j >= 0; j--) {
        const p = (right[j]! + 1) * 3 + l + 1

        right[j] = g.second[p]!
        l = g.first[p]!
      }
    })

    right.forEach((v, j) => {
      const column = out[j] ?? []

      column.push(v)
      out[j] = column
    })
  })

  return out.map(t => Int8Array.from(t))
}

// ---- conjugate rules ----

// The tone-negation conjugate C R C (every tone negated before and after): the same dynamics on the negated start.
export function negateRule(rule: GateRule): GateRule {
  const first = new Int8Array(9)
  const second = new Int8Array(9)

  for (const a of TRITS) {
    for (const b of TRITS) {
      const q = (-a + 1) * 3 + -b + 1

      first[(a + 1) * 3 + b + 1] = -rule.first[q]!
      second[(a + 1) * 3 + b + 1] = -rule.second[q]!
    }
  }

  return { name: `${rule.name}~negated`, table: rule.table, first, second }
}

export const sameRule = (a: GateRule, b: GateRule): boolean =>
  a.first.every((v, p) => v === b.first[p]) && a.second.every((v, p) => v === b.second[p])

// ---- the bus: every right ray of a window as an output, three inputs ----
//
// After the sweep every right ray of a window has crossed every left ray of it, and from then on it rides its wire
// (right rays never meet each other, and later left rays are background). So a window gives as many outputs as it has
// right rays. With three inputs a table has 27 values (inputsOf(3), x least significant), held as three packed words,
// word w being the 9-input table (x, y) at z = w - 1; each word sweeps exactly as an arity-2 table.

export type BusTarget = { name: string; tables: readonly Int8Array[] }

export type BusHit = {
  target: string
  rays: (number | null)[]
  // ray index of x, y, z
  inputs: number[]
  // ray index of each target table, in order
  outputs: number[]
}

export type BusSearch = {
  maxSpan: number
  foundSpan: Record<string, number | null>
  foundCount: Record<string, number>
  hits: BusHit[]
  windows: number
  nodes: number
}

const INPUTS3 = inputsOf(3)

export function packWide(table: ArrayLike<number>): [number, number, number] {
  return [0, 1, 2].map(w => packTable(Array.from({ length: 9 }, (_, i) => table[w * 9 + i]!))) as [number, number, number]
}

const wideKey = (w0: number, w1: number, w2: number): number => w0 + w1 * 32768 + w2 * 1073741824

export const wideTable = (f: (x: readonly number[]) => number): Int8Array => Int8Array.from(INPUTS3.map(f))

// Exhaustive depth-first search over ray windows of span 1 .. maxSpan with the three inputs placed once each in any
// order. A target is met when each of its tables sits on some right ray at the end (distinct tables, so distinct rays).
export function searchRayBus(input: {
  rule: GateRule
  background: number
  targets: readonly BusTarget[]
  maxSpan: number
}): BusSearch {
  const { background, targets, maxSpan } = input
  const side = wireSide(input.rule, background)

  if (side === null) {
    throw new Error(`${input.rule.name} on ${background}: no one-sided wire, the ray reduction does not apply`)
  }

  const { leftOut, rightOut } = rayRule(side === 'right' ? input.rule : mirrorRule(input.rule))
  const constants = TRITS.map(c => constantTable(c))
  const inputWords: [number, number, number][] = [
    [inputTable(0), inputTable(0), inputTable(0)],
    [inputTable(1), inputTable(1), inputTable(1)],
    [constantTable(-1), constantTable(0), constantTable(1)],
  ]
  const bgPacked = constantTable(background)
  const keyed = new Map<number, [number, number][]>()

  targets.forEach((t, ti) =>
    t.tables.forEach((table, k) => {
      const [w0, w1, w2] = packWide(table)
      const key = wideKey(w0, w1, w2)

      keyed.set(key, [...(keyed.get(key) ?? []), [ti, k]])
    }),
  )

  const foundSpan: Record<string, number | null> = Object.fromEntries(targets.map(t => [t.name, null]))
  const foundCount: Record<string, number> = Object.fromEntries(targets.map(t => [t.name, 0]))
  const hitOf = new Map<string, BusHit>()
  const rays = new Int32Array(maxSpan * 3)
  const save = new Int32Array(maxSpan * maxSpan * 3)
  const choice = new Int32Array(maxSpan)
  const where = targets.map(t => new Int32Array(t.tables.length))

  let nodes = 0
  let windows = 0

  const check = (span: number, n: number): void => {
    windows++
    where.forEach(w => w.fill(-1))

    for (let j = 0; j < n; j++) {
      const list = keyed.get(wideKey(rays[3 * j]!, rays[3 * j + 1]!, rays[3 * j + 2]!))

      if (list) {
        for (const [ti, k] of list) {
          where[ti]![k] = j
        }
      }
    }

    targets.forEach((t, ti) => {
      const best = foundSpan[t.name] ?? null

      if (!where[ti]!.every(j => j >= 0) || (best !== null && span > best)) {
        return
      }

      if (best === null || span < best) {
        foundSpan[t.name] = span
        foundCount[t.name] = 0
        hitOf.set(t.name, {
          target: t.name,
          rays: Array.from(choice.subarray(0, span), c => (c < 3 ? c - 1 : null)),
          inputs: [0, 1, 2].map(v => Array.from(choice.subarray(0, span)).indexOf(3 + v)),
          outputs: Array.from(where[ti]!),
        })
      }

      foundCount[t.name]!++
    })
  }

  const visit = (k: number, n: number, placed: number): void => {
    if (k === maxSpan) {
      return
    }

    const isLeft = (k & 1) === 1

    for (let o = 0; o < 6; o++) {
      if (o >= 3 && (placed >> (o - 3)) & 1) {
        continue
      }

      const nowPlaced = o < 3 ? placed : placed | (1 << (o - 3))

      nodes++
      choice[k] = o

      let m = n

      for (let w = 0; w < 3; w++) {
        const value = o < 3 ? constants[o]! : inputWords[o - 3]![w]!

        if (isLeft) {
          if (w === 0) {
            save.set(rays.subarray(0, 3 * n), k * maxSpan * 3)
          }

          let l = value

          for (let j = n - 1; j >= 0; j--) {
            const r = rays[3 * j + w]!
            const i0 = (r & 31) * 27 + (l & 31)
            const i1 = ((r >> 5) & 31) * 27 + ((l >> 5) & 31)
            const i2 = ((r >> 10) & 31) * 27 + ((l >> 10) & 31)

            rays[3 * j + w] = rightOut[i0]! | (rightOut[i1]! << 5) | (rightOut[i2]! << 10)
            l = leftOut[i0]! | (leftOut[i1]! << 5) | (leftOut[i2]! << 10)
          }
        } else {
          rays[3 * n + w] = value
          m = n + 1
        }
      }

      if (nowPlaced === 7 && (o >= 3 || constants[o] !== bgPacked)) {
        check(k + 1, m)
      }

      visit(k + 1, m, nowPlaced)

      if (isLeft) {
        rays.set(save.subarray(k * maxSpan * 3, k * maxSpan * 3 + 3 * n), 0)
      }
    }
  }

  visit(0, 0, 0)

  const hits = targets.flatMap(t => {
    const h = hitOf.get(t.name)

    return h ? [h] : []
  })

  return { maxSpan, foundSpan, foundCount, hits, windows, nodes }
}

// ---- finitely many interactions on the line ----
//
// A pair event is FREE when the rule acts as the pass (a, b) -> (b, a): each ray keeps its tone. A line state is SETTLED
// when no event will ever be other than free: every off-background tone on a left ray (odd cell at a round end) lies to
// the left of every off-background tone on a right ray (even cell), every left tone passes a background right ray, and
// every right tone passes a background left ray. Then left tones only meet background right rays and conversely, all
// passes. For a cell with a one-sided wire on +-1 every finite start settles (m6-universality.md: a background crossing
// ray outside the window stays background, and every other event at a background ray lowers the crossing tone's
// deficit), and the run below finds the round.

export function settledLine(rule: GateRule, background: number, frame: ArrayLike<number>, pad: number): boolean {
  let maxLeft = -Infinity
  let minRight = Infinity

  for (let i = 0; i < frame.length; i++) {
    const v = frame[i]!

    if (v === background) {
      continue
    }

    const right = ((i - pad) & 1) === 0

    if (right) {
      const p = (v + 1) * 3 + background + 1

      if (rule.first[p] !== background || rule.second[p] !== v) {
        return false
      }

      minRight = Math.min(minRight, i)
    } else {
      const p = (background + 1) * 3 + v + 1

      if (rule.first[p] !== v || rule.second[p] !== background) {
        return false
      }

      maxLeft = Math.max(maxLeft, i)
    }
  }

  return maxLeft < minRight
}
