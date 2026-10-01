// A LOCAL DENSITY ON TWO NEIGHBORING DOCKS (E-FND-0171). code/measure/conserved-density reads a density of support one
// dock, q(s at x), as 2,593 features of degree <= 2. A density of support two neighboring docks adds the products that
// straddle a link: for each of the twelve line directions l (first slot f_l, the neighbor y = the dock slot f_l streams
// into from x),
//
//   Q(s) = sum over docks x of [ q1(s at x) + sum over l of q_l(s at x, s at y_l(x)) ]
//
// and every degree-<= 2 function of two docks is a one-dock part plus a BILINEAR part, a product of one indicator of x
// and one of y (a product of a constant and an indicator sums to a one-dock term, so the bilinears are the whole new
// content). The features:
//
//   0 .. 2,592                       the one-dock features of code/measure/conserved-density
//   2,593 + 5,184 l + 72 i + j      the bilinear [x has indicator i][y_l(x) has indicator j], i and j two of the 72
//                                    indicators (1 + i is the one-dock linear feature of the same indicator)
//
// 64,801 features in all. A degree-1 density of support two docks sums to one of support one dock, so it adds nothing.
//
//   neighborTables      y_l(x) for every dock and line direction, and the inverse x = y_l^-1(y), read off the box's own
//                       stream targets, with the checks that make the bilinears well defined: y_l(x) is the target of
//                       slot f_l and the target of the opposite slot from y_l(x) is x again
//   pairFeatures        a configuration's feature counts over some docks and every link touching them, or the
//                       difference between two configurations there
//   pairFeatureName     a feature in words
//   pairPermutation     a slot permutation acting on all 64,801 features: on the one-dock part as
//                       featurePermutation; a bilinear on line l goes to the line of g(f_l), with its two docks
//                       exchanged when g carries f_l to a SECOND slot (the link then points the other way)
//   coordinateFlip      the slot permutation that negates one coordinate of every root (an element of W(F4))
//
// DETERMINISM: no random numbers. EXACT: integer counts.

import { type Configuration, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { LINE_FIRSTS, LINE_OF, OPPOSITE, SIDE } from '@/code/rule/isometric-knit'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import {
  DENSITY_FEATURES,
  featureName,
  featurePermutation,
  linearFeature,
  pairFeature,
  POSITIONS,
} from '@/code/measure/conserved-density'

export const INDICATORS = 2 * POSITIONS
export const LINK_FEATURES = INDICATORS * INDICATORS
export const TWO_DOCK_FEATURES = DENSITY_FEATURES + 12 * LINK_FEATURES

// the indicator of a position holding a nonzero trit v: 2 pos + (v < 0)
const indicator = (pos: number, v: number): number => 2 * pos + (v < 0 ? 1 : 0)

export const bilinearFeature = (l: number, i: number, j: number): number =>
  DENSITY_FEATURES + l * LINK_FEATURES + i * INDICATORS + j

export type NeighborTables = {
  // next[x * 12 + l] = y_l(x), back[y * 12 + l] = the x with y_l(x) = y
  readonly next: Int32Array
  readonly back: Int32Array
  // y_l(x) is the target dock of slot f_l, and the opposite slot from y_l(x) streams back into x, at every dock
  readonly consistent: boolean
  // the inverse is a function (each y has exactly one x per line)
  readonly bijective: boolean
}

export function neighborTables(tables: LockedTables): NeighborTables {
  const cells = tables.cells
  const next = new Int32Array(cells * 12)
  const back = new Int32Array(cells * 12).fill(-1)

  let consistent = true
  let bijective = true

  for (let x = 0; x < cells; x++) {
    for (let l = 0; l < 12; l++) {
      const f = LINE_FIRSTS[l]!
      const y = Math.floor(tables.target[x * 24 + f]! / 24)
      const home = Math.floor(tables.target[y * 24 + OPPOSITE[f]!]! / 24)

      consistent &&= home === x && y !== x
      next[x * 12 + l] = y

      if (back[y * 12 + l] !== -1) {
        bijective = false
      }

      back[y * 12 + l] = x
    }
  }

  bijective &&= back.every(v => v >= 0)

  return { next, back, consistent, bijective }
}

const HELD_POS = new Int32Array(POSITIONS)
const HELD_VAL = new Int8Array(POSITIONS)

function held(c: Configuration, x: number, out: number[]): void {
  out.length = 0

  for (let d = 0; d < 24; d++) {
    const v = c.vibe[x * 24 + d]!

    if (v !== 0) {
      out.push(indicator(d, v))
    }
  }

  for (let l = 0; l < 12; l++) {
    const v = c.store[x * 12 + l]!

    if (v !== 0) {
      out.push(indicator(24 + l, v))
    }
  }
}

function addDock(c: Configuration, x: number, sign: number, out: Map<number, number>): void {
  let k = 0

  for (let d = 0; d < 24; d++) {
    const v = c.vibe[x * 24 + d]!

    if (v !== 0) {
      HELD_POS[k] = d
      HELD_VAL[k] = v
      k++
    }
  }

  for (let l = 0; l < 12; l++) {
    const v = c.store[x * 12 + l]!

    if (v !== 0) {
      HELD_POS[k] = 24 + l
      HELD_VAL[k] = v
      k++
    }
  }

  const bump = (f: number): void => {
    out.set(f, (out.get(f) ?? 0) + sign)
  }

  for (let i = 0; i < k; i++) {
    bump(linearFeature(HELD_POS[i]!, HELD_VAL[i]!))

    for (let j = i + 1; j < k; j++) {
      bump(pairFeature(HELD_POS[i]!, HELD_VAL[i]!, HELD_POS[j]!, HELD_VAL[j]!))
    }
  }
}

const AT_X: number[] = []
const AT_Y: number[] = []

function addLink(c: Configuration, x: number, l: number, y: number, sign: number, out: Map<number, number>): void {
  held(c, x, AT_X)

  if (AT_X.length === 0) {
    return
  }

  held(c, y, AT_Y)

  for (const i of AT_X) {
    for (const j of AT_Y) {
      const f = bilinearFeature(l, i, j)

      out.set(f, (out.get(f) ?? 0) + sign)
    }
  }
}

// the feature counts of `a` on `docks` and on every link with an end in `docks`, minus those of `b` on the same docks
// and links when `b` is given
export function pairFeatures(
  a: Configuration,
  docks: Iterable<number>,
  nb: NeighborTables,
  b?: Configuration,
): Map<number, number> {
  const out = new Map<number, number>()
  const set = new Set(docks)
  const links = new Set<number>()

  for (const x of set) {
    addDock(a, x, 1, out)

    if (b) {
      addDock(b, x, -1, out)
    }

    for (let l = 0; l < 12; l++) {
      links.add(x * 12 + l)
      links.add(nb.back[x * 12 + l]! * 12 + l)
    }
  }

  for (const k of links) {
    const x = Math.floor(k / 12)
    const l = k % 12
    const y = nb.next[k]!

    addLink(a, x, l, y, 1, out)

    if (b) {
      addLink(b, x, l, y, -1, out)
    }
  }

  return out
}

const posName = (p: number): string => (p < 24 ? `slot ${p}` : `store ${p - 24}`)

export function pairFeatureName(f: number): string {
  if (f < DENSITY_FEATURES) {
    return featureName(f)
  }

  const r = f - DENSITY_FEATURES
  const l = Math.floor(r / LINK_FEATURES)
  const i = Math.floor((r % LINK_FEATURES) / INDICATORS)
  const j = r % INDICATORS
  const name = (ind: number): string => `${posName(ind >> 1)} ${ind & 1 ? '-' : '+'}`

  return `[x: ${name(i)}][x+line ${l}: ${name(j)}]`
}

// the image of every feature under a slot permutation (slots[d] the slot d goes to), which must carry roots to roots
export function pairPermutation(slots: ArrayLike<number>): Int32Array {
  const out = new Int32Array(TWO_DOCK_FEATURES)
  const one = featurePermutation(slots)

  out.set(one)

  // the image of an indicator: the image of its linear feature, read back as an indicator
  const ind = new Int32Array(INDICATORS)

  for (let i = 0; i < INDICATORS; i++) {
    ind[i] = one[1 + i]! - 1
  }

  for (let l = 0; l < 12; l++) {
    const e = slots[LINE_FIRSTS[l]!]!
    const m = LINE_OF[e]!
    const forward = SIDE[e] === 1

    for (let i = 0; i < INDICATORS; i++) {
      for (let j = 0; j < INDICATORS; j++) {
        out[bilinearFeature(l, i, j)] = forward
          ? bilinearFeature(m, ind[i]!, ind[j]!)
          : bilinearFeature(m, ind[j]!, ind[i]!)
      }
    }
  }

  return out
}

// the slot permutation of the reflection that negates coordinate k of every root
export function coordinateFlip(k: number): Int32Array {
  return Int32Array.from(DOCK_ROOTS, r =>
    DOCK_ROOTS.findIndex(o => o.every((v, c) => v === (c === k ? -r[c]! : r[c]!))),
  )
}
