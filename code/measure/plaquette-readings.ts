// Readings of the plaquette store (code/rule/plaquette-store-knit, E-RLT-0107, E-GRV-0087): a path of the rule on a
// PathKey (the coin and the meeting of code/measure/full-key-paths, the collision with the plaquette piece, the stream),
// its exact inverse, and the laws and line charges it keeps. MEASUREMENT: every count is an exact integer.
//
// NOTHING MOVES: the stream takes each slot's value one dock along; stores and units never stream.

import {
  streamConfiguration,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  clonePlaquettes,
  collidePlaquette,
  unitLines,
  type PlaquetteConfiguration,
  type PlaquetteTally,
} from '@/code/rule/plaquette-store-knit'
import {
  pairWord,
  wordFirst,
  wordSecond,
} from '@/code/rule/occupation-veto-knit'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { streamInto } from '@/code/measure/doublet-locked-readings'
import {
  keyedCoin,
  keyedMeet,
  type PathKey,
} from '@/code/measure/full-key-paths'
import { type NetworkRule } from '@/code/measure/knot-network'

// `watch` is called on the configuration just before and just after each beat's collision (a reading, never a write)
export type PlaquetteFlags = {
  readonly key: PathKey
  readonly threshold: number
  readonly coin?: boolean
  readonly plaquettes?: boolean
  readonly watch?: (
    c: PlaquetteConfiguration,
    t: number,
    after: boolean,
  ) => void
}

export type PlaquetteRunner = {
  state: () => PlaquetteConfiguration
  time: () => number
  beat: (tally?: PlaquetteTally) => void
  back: () => void
}

// a path: the coin, the meeting, the collision (with or without the plaquette piece), the stream; and its inverse
export function plaquetteRunner(
  tables: LockedTables,
  start: PlaquetteConfiguration,
  flags: PlaquetteFlags,
): PlaquetteRunner {
  const {
    key,
    threshold,
    coin = true,
    plaquettes = true,
    watch,
  } = flags

  let a = clonePlaquettes(start)
  let b = clonePlaquettes(start)
  let t = 0

  return {
    state: () => a,
    time: () => t,
    beat(tally?: PlaquetteTally) {
      if (coin) {
        keyedCoin(tables, a, key, threshold, t)
      }

      keyedMeet(tables, a, key, threshold, t)

      if (watch) {
        watch(a, t, false)
      }

      collidePlaquette(tables, a, t, false, tally, plaquettes)

      if (watch) {
        watch(a, t, true)
      }

      streamInto(tables, a, b)
      b.punit.set(a.punit)
      b.pword.set(a.pword)
      b.popen.set(a.popen)

      const s = a

      a = b
      b = s
      t++
    },
    back() {
      t--
      streamConfiguration(tables, a, true)
      collidePlaquette(tables, a, t, true, undefined, plaquettes)
      // the meeting and the coin are each their own inverse at one beat (neither changes the set of lines it acts on)
      keyedMeet(tables, a, key, threshold, t)

      if (coin) {
        keyedCoin(tables, a, key, threshold, t)
      }

      b = clonePlaquettes(a)
    },
  }
}

// ---- the rule for code/measure/knot-network: each unit holds four halves (the two lines' first and second points) ----

const unitPoints = (
  c: PlaquetteConfiguration,
  at: number,
): number[] => {
  const word = c.pword[at]!
  const wi = Math.floor(word / 81)
  const wj = word % 81

  return [wordFirst(wi), wordSecond(wi), wordFirst(wj), wordSecond(wj)]
}

// the plaquette rule as a knot-network rule (`plaquettes` false: the working vacuum's rule through the same code path)
export function plaquetteNetworkRule(plaquettes = true): NetworkRule {
  return {
    clone: c => clonePlaquettes(c as PlaquetteConfiguration),
    collide: (tables, c, t, inverse) =>
      collidePlaquette(
        tables,
        c as PlaquetteConfiguration,
        t,
        inverse,
        undefined,
        plaquettes,
      ),
    halves: c => (c as PlaquetteConfiguration).punit.length * 4,
    readHalf: (c, h) => {
      const p = c as PlaquetteConfiguration

      return p.punit[h >> 2] === 0 ? -1 : unitPoints(p, h >> 2)[h & 3]!
    },
    writeHalf: (c, h, v) => {
      const p = c as PlaquetteConfiguration
      const points = unitPoints(p, h >> 2)

      points[h & 3] = v
      p.pword[h >> 2] =
        81 * pairWord(points[0]!, points[1]!) +
        pairWord(points[2]!, points[3]!)
    },
    dockOfHalf: h => Math.floor(h / 12),
  }
}

// the first slot of the line a unit half will be released onto (for reading which mesh line a token is on)
export function unitHalfSlot(c: Configuration, h: number): number {
  const p = c as PlaquetteConfiguration
  const at = h >> 2
  const { i, j } = unitLines(at % 3, p.punit[at]!)

  return Math.floor(at / 3) * 24 + LINE_FIRSTS[(h & 3) < 2 ? i : j]!
}

const ROOTS = rootsD4()

// charge (loves minus fears, stored ones included: each store and unit is neutral), count (vibes, 2 a line store, 4 a
// unit) and the occupation momentum of all vibes summed (a stored pair or unit holds 0)
export function plaquetteLaws(c: PlaquetteConfiguration): {
  charge: number
  count: number
  momentum: string
} {
  let charge = 0
  let count = 0

  const momentum = [0, 0, 0, 0]

  for (let i = 0; i < c.vibe.length; i++) {
    const v = c.vibe[i]!

    if (v === 0) {
      continue
    }

    charge += v
    count++

    const r = ROOTS[i % 24]!

    for (let k = 0; k < 4; k++) {
      momentum[k] = momentum[k]! + r[k]!
    }
  }

  for (let l = 0; l < c.store.length; l++) {
    count += c.store[l] !== 0 ? 2 : 0
  }

  for (let u = 0; u < c.punit.length; u++) {
    count += c.punit[u] !== 0 ? 4 : 0
  }

  return { charge, count, momentum: momentum.join(',') }
}

// one dock's occupation momentum
export function dockMomentum(c: Configuration, x: number): string {
  const m = [0, 0, 0, 0]

  for (let d = 0; d < 24; d++) {
    if (c.vibe[x * 24 + d] === 0) {
      continue
    }

    const r = ROOTS[d]!

    for (let k = 0; k < 4; k++) {
      m[k] = m[k]! + r[k]!
    }
  }

  return m.join(',')
}

// trits apart: slots, line stores and units that differ in their trit or unit code
export function plaquetteTritsApart(
  a: PlaquetteConfiguration,
  b: PlaquetteConfiguration,
): number {
  let n = 0

  for (let i = 0; i < a.vibe.length; i++) {
    n += a.vibe[i] !== b.vibe[i] ? 1 : 0
  }

  for (let i = 0; i < a.store.length; i++) {
    n += a.store[i] !== b.store[i] ? 1 : 0
  }

  for (let i = 0; i < a.punit.length; i++) {
    n += a.punit[i] !== b.punit[i] ? 1 : 0
  }

  return n
}

// every unit read as its two line stores (the same words and open bits on its two lines): the map under which the
// plaquette rule is the line rule relabeled wherever a unit is made and released exactly when its two line stores would
// be. A conflict is a unit line that also holds a line store (the map is then not one to one there)
export function unitsAsLineStores(c: PlaquetteConfiguration): {
  out: PlaquetteConfiguration
  conflicts: number
} {
  const out = clonePlaquettes(c)

  let conflicts = 0

  for (let at = 0; at < c.punit.length; at++) {
    const unit = c.punit[at]!

    if (unit === 0) {
      continue
    }

    const x = Math.floor(at / 3)
    const { i, j, ti, tj } = unitLines(at % 3, unit)
    const word = c.pword[at]!
    const open = c.popen[at]!

    for (const [l, tau, w, o] of [
      [i, ti, Math.floor(word / 81), open & 3],
      [j, tj, word % 81, (open >> 2) & 3],
    ] as const) {
      if (out.store[x * 12 + l] !== 0) {
        conflicts++
      }

      out.store[x * 12 + l] = tau
      out.spoint[x * 12 + l] = w
      out.sopen[x * 12 + l] = o
    }

    out.punit[at] = 0
    out.pword[at] = 0
    out.popen[at] = 0
  }

  return { out, conflicts }
}

// the husk distance of every husk column from one column on the side^3 husk torus: the Euclidean length of the
// minimum-image difference, rounded to the nearest integer (the shells of tmp/elastic-average-2)
export function huskDistances(side: number, from: number): Int32Array {
  const at = (c: number): number[] => [
    c % side,
    Math.floor(c / side) % side,
    Math.floor(c / (side * side)),
  ]
  const p0 = at(from)
  const out = new Int32Array(side ** 3)

  for (let c = 0; c < out.length; c++) {
    const p = at(c)

    let s = 0

    for (let k = 0; k < 3; k++) {
      const d = Math.abs(p[k]! - p0[k]!)

      s += Math.min(d, side - d) ** 2
    }

    out[c] = Math.round(Math.sqrt(s))
  }

  return out
}

// per mesh line (lineOf a slot's component, code/measure/full-key-paths meshLines): tone (sum of vibe trits; a store
// or a unit is tone 0 on each of its lines) and count (vibes, 2 for a line store on it, 2 for each of a unit's lines)
export function plaquetteLineCharges(
  lineOf: Int32Array,
  lines: number,
  c: PlaquetteConfiguration,
): { tone: Int32Array; count: Int32Array } {
  const tone = new Int32Array(lines)
  const count = new Int32Array(lines)
  const docks = c.vibe.length / 24
  const lineAt = (x: number, l: number): number =>
    lineOf[x * 24 + LINE_FIRSTS[l]!]!

  for (let i = 0; i < c.vibe.length; i++) {
    const v = c.vibe[i]!

    if (v === 0) {
      continue
    }

    tone[lineOf[i]!]! += v
    count[lineOf[i]!]! += 1
  }

  for (let s = 0; s < c.store.length; s++) {
    if (c.store[s] !== 0) {
      count[lineAt(Math.floor(s / 12), s % 12)]! += 2
    }
  }

  for (let x = 0; x < docks; x++) {
    for (let f = 0; f < 3; f++) {
      const unit = c.punit[x * 3 + f]!

      if (unit === 0) {
        continue
      }

      const { i, j } = unitLines(f, unit)

      count[lineAt(x, i)]! += 2
      count[lineAt(x, j)]! += 2
    }
  }

  return { tone, count }
}
