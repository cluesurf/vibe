// The difference engine (E-CMP-0015): the knit run on only the docks that differ from the vacuum.
//
// The knit is deterministic, local and the same at every dock, and the vacuum born empty is the same in
// every dock at every beat, so it is one dock's 24 slots evolved by the collision alone (V_(t+1) =
// C_t(V_t)), computed here lazily for any beat and never assumed periodic. A dock holding V_t collides into
// V_(t+1), and streaming moves equal values, so after a beat a dock can differ from V_(t+1) only if one of
// its 24 neighbours differed before it. The engine therefore stores only the differing docks, collides only
// them, and streams only the slots whose collided value differs from V_(t+1). The result is the full
// lattice state exactly (every other dock is V_t), at a cost set by the disturbance's support, not the
// volume.
//
// code/measure/lone-dressing (loneDressing, perturbationOn) is the same idea on a finite box, with a Map
// of cells and a precomputed neighbour table of the whole box. This engine adds what scale needs:
// - an UNBOUNDED lattice: docks are addressed by their four D4 basis coordinates (the basis of
//   code/substrate/d4-box), kept as 16-bit integers, so the lattice is Z^4 in that basis with no box and
//   no wrap. A coordinate leaving +-32000 throws rather than wrapping silently
// - or a WRAPPING box of any side, on exactly d4BoxMesh's cells, with no table of the box built
// - any seed: any set of docks set to any states at the current beat
// - flat typed-array storage (coordinates, states and an open-addressing index), with a cap on docks:
//   passing it throws DifferenceOverflow, so memory is bounded by the caller
// - a translation-invariant signature of the difference, so an exact recurrence of the dressing up to a
//   shift (which, since the rule and vacuum repeat, proves the dressing bounded for all later beats) can
//   be detected
//
// Exact by construction; E-CMP-0015 checks it bit for bit against the dense lattice gas.

import { type Collision } from '@/code/rule/collision'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { d4Coordinates, d4Vector } from '@/code/substrate/d4-box'

const DEGREE = 24
const LIMIT = 32000
const EMPTY = -1

// each direction's step in basis coordinates
export const ROOT_STEPS: readonly (readonly number[])[] = rootsD4().map(d4Coordinates)

export class DifferenceOverflow extends Error {
  constructor(readonly docks: number, readonly beat: number) {
    super(`difference engine: more than ${docks} docks differ from the vacuum at beat ${beat}`)
  }
}

type Generation = {
  count: number
  capacity: number
  coords: Int16Array
  states: Int8Array
  index: Int32Array
  mask: number
}

function makeGeneration(capacity: number): Generation {
  const size = nextPower(capacity * 2)

  return {
    count: 0,
    capacity,
    coords: new Int16Array(capacity * 4),
    states: new Int8Array(capacity * DEGREE),
    index: new Int32Array(size).fill(EMPTY),
    mask: size - 1,
  }
}

function nextPower(n: number): number {
  let p = 16

  while (p < n) {
    p *= 2
  }

  return p
}

const hash4 = (a: number, b: number, c: number, d: number): number => {
  let h = Math.imul(a + 0x9e37, 0x85ebca6b)

  h = Math.imul(h ^ (b + 0x7f4a), 0xc2b2ae35)
  h = Math.imul(h ^ (c + 0x165667b1), 0x27d4eb2f)
  h = Math.imul(h ^ (d + 0x3c6ef372), 0x85ebca6b)

  return (h ^ (h >>> 15)) >>> 0
}

export type DifferenceEngine = {
  // the beat about to be run
  readonly beat: () => number
  // the vacuum's dock state entering beat t
  readonly vacuum: (t: number) => Int8Array
  // set one dock's whole state at the current beat
  readonly set: (coords: readonly number[], state: ArrayLike<number>) => void
  // one beat forward
  readonly step: () => void
  // docks and slots differing from the vacuum now
  readonly support: () => { docks: number; slots: number }
  // every differing dock, its basis coordinates and its 24 slots (views, valid until the next step)
  readonly forEach: (visit: (coords: readonly number[], state: Int8Array) => void) => void
  // the state of one dock now
  readonly stateAt: (coords: readonly number[]) => Int8Array
  // the largest true distance from `center` (a D4 vector) of a differing dock, unwrapped (unbounded only)
  readonly reach: (center: readonly number[]) => number
  // the difference up to a translation: a string equal for two beats exactly when the differing docks and
  // their states are one shifted copy of the other, and the shift (the lexicographic least dock's
  // coordinates). Unbounded only
  readonly signature: () => { key: string; anchor: number[] }
  readonly peakDocks: () => number
}

// A difference engine for a scheduled dock collision (forward(t) is beat t's collision on one dock). `side`
// undefined is the unbounded lattice; a side is d4BoxMesh's box of that side, wrapping. `maxDocks` caps
// memory: the stored docks never exceed it (about 60 bytes each per generation, two generations).
export function makeDifferenceEngine(input: {
  forward: (t: number) => Collision
  side?: number
  maxDocks?: number
  startBeat?: number
}): DifferenceEngine {
  const { forward, side } = input
  const maxDocks = input.maxDocks ?? 1 << 21
  const vacua: Int8Array[] = [new Int8Array(DEGREE)]
  const rules = new Map<number, Collision>()
  const ruleAt = (t: number): Collision => {
    let rule = rules.get(t)

    if (!rule) {
      rule = forward(t)
      rules.set(t, rule)

      if (rules.size > 64) {
        rules.delete(rules.keys().next().value as number)
      }
    }

    return rule
  }
  const vacuum = (t: number): Int8Array => {
    while (vacua.length <= t) {
      const next = Int8Array.from(vacua[vacua.length - 1] ?? new Int8Array(DEGREE))

      ruleAt(vacua.length - 1)(next, 0, DEGREE)
      vacua.push(next)
    }

    return vacua[t] ?? new Int8Array(DEGREE)
  }

  let beat = input.startBeat ?? 0
  let current = makeGeneration(1024)
  let next = makeGeneration(1024)
  let peak = 0

  const wrap = (x: number): number => (side === undefined ? x : ((x % side) + side) % side)

  const find = (g: Generation, a: number, b: number, c: number, d: number): number => {
    let i = hash4(a, b, c, d) & g.mask

    for (;;) {
      const e = g.index[i] ?? EMPTY

      if (e === EMPTY) {
        return -1 - i
      }

      const o = e * 4

      if (g.coords[o] === a && g.coords[o + 1] === b && g.coords[o + 2] === c && g.coords[o + 3] === d) {
        return e
      }

      i = (i + 1) & g.mask
    }
  }

  const grow = (g: Generation, capacity: number): Generation => {
    const bigger = makeGeneration(capacity)

    bigger.coords.set(g.coords.subarray(0, g.count * 4))
    bigger.states.set(g.states.subarray(0, g.count * DEGREE))
    bigger.count = g.count

    for (let e = 0; e < g.count; e++) {
      const o = e * 4
      let i = hash4(g.coords[o] ?? 0, g.coords[o + 1] ?? 0, g.coords[o + 2] ?? 0, g.coords[o + 3] ?? 0) & bigger.mask

      while ((bigger.index[i] ?? EMPTY) !== EMPTY) {
        i = (i + 1) & bigger.mask
      }

      bigger.index[i] = e
    }

    return bigger
  }

  // the entry for a dock in generation g, created holding `fill` if absent; may replace g, so returns both
  const entry = (which: 'current' | 'next', a: number, b: number, c: number, d: number, fill: Int8Array): number => {
    let g = which === 'current' ? current : next
    const found = find(g, a, b, c, d)

    if (found >= 0) {
      return found
    }

    if (g.count >= maxDocks) {
      throw new DifferenceOverflow(maxDocks, beat)
    }

    if (g.count >= g.capacity) {
      g = grow(g, Math.min(maxDocks, g.capacity * 2))

      if (which === 'current') {
        current = g
      } else {
        next = g
      }

      return entry(which, a, b, c, d, fill)
    }

    const e = g.count++
    const o = e * 4

    g.coords[o] = a
    g.coords[o + 1] = b
    g.coords[o + 2] = c
    g.coords[o + 3] = d
    g.states.set(fill, e * DEGREE)
    g.index[-1 - found] = e

    return e
  }

  const check = (x: number): number => {
    if (x > LIMIT || x < -LIMIT) {
      throw new Error(`difference engine: coordinate ${x} outside +-${LIMIT}`)
    }

    return x
  }

  const scratch = new Int8Array(DEGREE)
  const stepA = Int16Array.from(ROOT_STEPS.map(s => s[0] ?? 0))
  const stepB = Int16Array.from(ROOT_STEPS.map(s => s[1] ?? 0))
  const stepC = Int16Array.from(ROOT_STEPS.map(s => s[2] ?? 0))
  const stepD = Int16Array.from(ROOT_STEPS.map(s => s[3] ?? 0))

  const step = (): void => {
    const rule = ruleAt(beat)
    const after = vacuum(beat + 1)

    // clear next (its index is proportional to its last use)
    next.index.fill(EMPTY)
    next.count = 0

    for (let e = 0; e < current.count; e++) {
      scratch.set(current.states.subarray(e * DEGREE, (e + 1) * DEGREE))
      rule(scratch, 0, DEGREE)

      const o = e * 4
      const a = current.coords[o] ?? 0
      const b = current.coords[o + 1] ?? 0
      const c = current.coords[o + 2] ?? 0
      const d = current.coords[o + 3] ?? 0

      for (let k = 0; k < DEGREE; k++) {
        const v = scratch[k] ?? 0

        if (v === after[k]) {
          continue
        }

        const y0 = side === undefined ? check(a + (stepA[k] ?? 0)) : wrap(a + (stepA[k] ?? 0))
        const y1 = side === undefined ? check(b + (stepB[k] ?? 0)) : wrap(b + (stepB[k] ?? 0))
        const y2 = side === undefined ? check(c + (stepC[k] ?? 0)) : wrap(c + (stepC[k] ?? 0))
        const y3 = side === undefined ? check(d + (stepD[k] ?? 0)) : wrap(d + (stepD[k] ?? 0))
        const j = entry('next', y0, y1, y2, y3, after)

        next.states[j * DEGREE + k] = v
      }
    }

    const swap = current

    current = next
    next = swap
    beat += 1
    peak = Math.max(peak, current.count)
  }

  const set = (coords: readonly number[], state: ArrayLike<number>): void => {
    const [a = 0, b = 0, c = 0, d = 0] = coords.map(wrap)
    const e = entry('current', a, b, c, d, vacuum(beat))

    for (let k = 0; k < DEGREE; k++) {
      current.states[e * DEGREE + k] = state[k] ?? 0
    }

    peak = Math.max(peak, current.count)
  }

  const support = (): { docks: number; slots: number } => {
    const vac = vacuum(beat)
    let slots = 0

    for (let i = 0; i < current.count * DEGREE; i++) {
      slots += current.states[i] === vac[i % DEGREE] ? 0 : 1
    }

    return { docks: current.count, slots }
  }

  const forEach = (visit: (coords: readonly number[], state: Int8Array) => void): void => {
    for (let e = 0; e < current.count; e++) {
      const o = e * 4

      visit([current.coords[o] ?? 0, current.coords[o + 1] ?? 0, current.coords[o + 2] ?? 0, current.coords[o + 3] ?? 0], current.states.subarray(e * DEGREE, (e + 1) * DEGREE))
    }
  }

  const stateAt = (coords: readonly number[]): Int8Array => {
    const [a = 0, b = 0, c = 0, d = 0] = coords.map(wrap)
    const e = find(current, a, b, c, d)

    return e >= 0 ? current.states.slice(e * DEGREE, (e + 1) * DEGREE) : Int8Array.from(vacuum(beat))
  }

  const reach = (center: readonly number[]): number => {
    let best = 0

    forEach(coords => {
      const v = d4Vector(coords)

      best = Math.max(best, Math.hypot(...v.map((x, k) => x - (center[k] ?? 0))))
    })

    return best
  }

  const signature = (): { key: string; anchor: number[] } => {
    const rows: { c: number[]; s: string }[] = []

    forEach((coords, state) => rows.push({ c: [...coords], s: Array.from(state, x => x + 1).join('') }))

    const less = (p: number[], q: number[]): number => {
      for (let k = 0; k < 4; k++) {
        const diff = (p[k] ?? 0) - (q[k] ?? 0)

        if (diff !== 0) {
          return diff
        }
      }

      return 0
    }

    rows.sort((p, q) => less(p.c, q.c))

    const anchor = rows[0]?.c ?? [0, 0, 0, 0]
    const key = rows.map(r => `${r.c.map((x, k) => x - (anchor[k] ?? 0)).join(',')}:${r.s}`).join(';')

    return { key, anchor }
  }

  return {
    beat: () => beat,
    vacuum,
    set,
    step,
    support,
    forEach,
    stateAt,
    reach,
    signature,
    peakDocks: () => peak,
  }
}
