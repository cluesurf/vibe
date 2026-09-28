// NORMAL-ORDERED ENERGY ON A SEA (E-GRV-0144). note/research/vibe/roadmap/remaining-pieces.md, "Auditing the candidate
// rule (E-SPN-0134)": the depth is sourced by the energy count (code/measure/energy-lines: held slots + 2 stored pairs),
// and relative to the love sea a hole is -1, so it would fall up. Normal ordering counts energy from the vacuum instead.
//
// TWO REGISTERS, both local (a slot's weight reads the slot and the sea's value v in {-1, 0, 1} there, a store's weight
// reads the store), both bounded, both 0 on the sea:
//   'occupation'  |occupied - v occupied| per slot, 2 |stored - 0| per store: a hole 1, a love on the empty mesh 1, a
//                 fear in the love sea 0 (its slot is as occupied as the sea's), a store 2.
//   'charge'      (occupied - v^2) - 2 v (vibe - v) per slot, 2 stored per store: a hole 1, a love on the empty mesh 1, a
//                 fear in the love sea 4, a store 2. On the empty mesh (v = 0) it is the count; on a sea it is the count
//                 minus twice the charge, both measured from the sea.
// WHY TWO. Any register that is a sum of a slot weight f(value) and a store weight g is kept by every permutation of
// values (coin, mixer, meeting, stream), and by the pair move (a love and a fear on one line into its store, or back)
// only if f(1) + f(-1) - 2 f(0) = g(1) - g(0). Normal ordering on the love sea fixes f(1) = 0 (the sea) and f(0) = 1 (a
// hole). The occupation register has f(-1) = 0 and g = 2, so it breaks the condition by 4: it is kept only where no pair
// is made or unmade, which on the sea is the hole sector (a fear there is unmade with a sea love at its first collision,
// E-SPN-0132 B0). Keeping g = 2 (the store weight E-GRV-0106's Gauss law needs) forces f(-1) = 4: the charge register.
// So the charge register is the conserved completion of the occupation one, and they agree on every configuration of
// holes alone.
//
// THE LINES. Every piece but the stream acts inside one dock and keeps the dock's register (a slot permutation keeps
// sum f, the pair move keeps f + f = g + 2 f(0) by the condition above), and the stream takes each slot's value, and so
// its weight, one dock along one bulk link. So E-GRV-0106's register with each crossing weighted by the weight it carries
// keeps div L - e constant on every dock (code/measure/energy-lines dragLines is the weight-1-per-vibe case). On the sea
// a love carries 0 and a hole 1: the hole drags the line.
//
// NOTHING MOVES: these are readings of the rule's configurations. Exact integers.

import { LINE_FIRSTS, LINE_OF } from '@/code/rule/isometric-knit'
import type { Configuration, LockedTables } from '@/code/rule/doublet-locked-knit'
import { lineDivergence, type BulkLinks } from '@/code/measure/energy-lines'

export type Register = 'occupation' | 'charge'

// the weight of one slot's value on a sea of value v
export function slotWeight(value: number, v: number, register: Register): number {
  const held = value !== 0 ? 1 : 0

  return register === 'occupation' ? Math.abs(held - (v !== 0 ? 1 : 0)) : held - v * v - 2 * v * (value - v)
}

// the weight of a store (the sea's stores are empty)
export const storeWeight = (store: number): number => (store !== 0 ? 2 : 0)

// the per-dock register of a configuration on a sea of value v
export function seaEnergies(c: Configuration, v: number, register: Register, out: Int32Array): Int32Array {
  out.fill(0)

  for (let i = 0; i < c.vibe.length; i++) {
    const w = slotWeight(c.vibe[i] as number, v, register)

    if (w !== 0) out[Math.floor(i / 24)]! += w
  }

  for (let s = 0; s < c.store.length; s++) if (c.store[s] !== 0) out[Math.floor(s / 12)]! += storeWeight(c.store[s] as number)

  return out
}

export const totalOf = (xs: ArrayLike<number>): number => {
  let s = 0

  for (let k = 0; k < xs.length; k++) s += xs[k] as number

  return s
}

// the weighted drag of one beat, read on the state just after the stream (sense -1 applies it): each slot's weight
// crosses the link its value came through, as code/measure/energy-lines dragLines does for weight 1 per vibe
export function dragWeighted(tables: LockedTables, after: Configuration, line: Int32Array, sense: -1 | 1, v: number, register: Register): void {
  for (let i = 0; i < after.vibe.length; i++) {
    const w = slotWeight(after.vibe[i] as number, v, register)

    if (w === 0) continue

    const d = i % 24
    const l = LINE_OF[d] as number

    if (d === LINE_FIRSTS[l]) line[Math.floor((tables.source[i] as number) / 24) * 12 + l]! += sense * w
    else line[Math.floor(i / 24) * 12 + l]! -= sense * w
  }
}

// b = div L - e per dock under a register, the Gauss invariant a run must keep
export function seaGauss(links: BulkLinks, line: Int32Array, c: Configuration, v: number, register: Register): Int32Array {
  const div = lineDivergence(links, line, new Int32Array(links.cells))
  const e = seaEnergies(c, v, register, new Int32Array(links.cells))

  return Int32Array.from(div, (x, k) => x - (e[k] as number))
}
