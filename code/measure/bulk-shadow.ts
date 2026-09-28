// THE HUSK AS THE BULK'S SHADOW (E-SPN-0127). Readings for the question of note/research/vibe/roadmap/remaining-pieces.md,
// "Six angles on 3d motion", angle 5: is 3d turning on the husk the shadow of something free in the 4d bulk?
//
// THE PROJECTION. A dock of the D4 box is a D4 vector v = (v_1, v_2, v_3, w), w the depth. The husk reading is
// pi(v) = (v_1, v_2, v_3). pi is a group homomorphism D4 -> Z^3, onto (pi(1, 0, 0, 1) = e_1), with kernel the vectors
// (0, 0, 0, 2k). It sends the period lattice L D4 onto L Z^3, so it is well defined from the box D4 / L D4 onto the husk
// torus Z^3 / L Z^3, with fibers of L docks. No root lies in the kernel, so every bulk line (x + t r) goes to a husk line
// (pi(x) + t pi(r)), dock by dock: the stream, which copies a value from x to x + r, is read on the husk as a copy from
// pi(x) to pi(x) + pi(r). The twelve bulk line classes go to nine husk ones: the six with w = 0 one to one (the face
// diagonals e_a +- e_b), and the six depth classes (e_a +- e_4) two to one onto the three axes e_a.
//
// Everything here is exact integer arithmetic on the box and the committed bounce table, except `offShadow`, a float
// reading of a stand-in's velocity. DETERMINISM: no random numbers. NOTHING MOVES: the readings only look.

import { bouncePermutation, BOUNCE_TABLE } from '@/code/rule/bounce-pair-knit'
import { LINE_FIRSTS, LINE_OF } from '@/code/rule/isometric-knit'
import { rootsD4 } from '@/code/algebra/group/integer-roots'
import { type LockedTables } from '@/code/rule/doublet-locked-knit'
import { type MeshLines } from '@/code/measure/full-key-paths'
import { d4BoxCoordinates, d4Vector } from '@/code/substrate/d4-box-integer'

const ROOTS = rootsD4()
const mod = (a: number, m: number): number => ((a % m) + m) % m

// the husk shadow of a 4d vector
export const shadowOf = (v: readonly number[]): number[] => [v[0] as number, v[1] as number, v[2] as number]

// a canonical key for a husk direction up to sign (its first nonzero entry made positive)
function directionKey(u: readonly number[]): string {
  const first = u.find(x => x !== 0) ?? 1

  return u.map(x => (first < 0 ? -x : x)).join(',')
}

// the husk direction class of each of the twelve bulk line classes, and the classes grouped by it
export function shadowClasses(): { huskOf: number[]; keys: string[]; members: number[][]; depth: number[] } {
  const keys: string[] = []
  const huskOf = LINE_FIRSTS.map(d => {
    const k = directionKey(shadowOf(ROOTS[d] as number[]))
    let i = keys.indexOf(k)

    if (i < 0) {
      keys.push(k)
      i = keys.length - 1
    }

    return i
  })
  const members = keys.map((_, i) => huskOf.map((h, l) => ({ h, l })).filter(t => t.h === i).map(t => t.l))
  const depth = LINE_FIRSTS.map(d => (ROOTS[d] as number[])[3] as number)

  return { huskOf, keys, members, depth }
}

// the D4 vector of a box dock
export const dockVector = (dock: number, side: number): number[] => d4Vector(d4BoxCoordinates({ cell: dock, side }))

// a husk point of the torus as one integer
const huskPoint = (v: readonly number[], side: number): number => mod(v[0] as number, side) + side * mod(v[1] as number, side) + side * side * mod(v[2] as number, side)

// THE STREAM COMMUTES WITH THE PROJECTION, read on every slot of the box: the dock a slot streams into projects to the
// slot's dock's shadow plus the shadow of the slot's root, on the husk torus; and the fiber of every husk point
export function projectionCensus(tables: LockedTables, side: number): { slots: number; off: number; fiberMin: number; fiberMax: number; huskPoints: number } {
  const cells = tables.cells
  const fiber = new Map<number, number>()
  let off = 0

  for (let x = 0; x < cells; x++) {
    const v = shadowOf(dockVector(x, side))
    const p = huskPoint(v, side)

    fiber.set(p, (fiber.get(p) ?? 0) + 1)
    for (let d = 0; d < 24; d++) {
      const y = Math.floor((tables.target[x * 24 + d] as number) / 24)
      const r = shadowOf(ROOTS[d] as number[])

      if (huskPoint(shadowOf(dockVector(y, side)), side) !== huskPoint(v.map((x0, k) => x0 + (r[k] as number)), side)) off++
    }
  }

  const sizes = [...fiber.values()]

  return { slots: cells * 24, off, fiberMin: Math.min(...sizes), fiberMax: Math.max(...sizes), huskPoints: fiber.size }
}

// the husk line a bulk line of class l through dock x projects onto: its direction class and the least husk point on it
function huskLineKey(x: number, l: number, side: number, huskOf: readonly number[]): string {
  const v = shadowOf(dockVector(x, side))
  const r = shadowOf(ROOTS[LINE_FIRSTS[l] as number] as number[])
  let least = Infinity

  for (let t = 0; t < side; t++) least = Math.min(least, huskPoint(v.map((a, k) => a + t * (r[k] as number)), side))

  return `${huskOf[l]}:${least}`
}

// every bulk mesh line lands on one husk line (each of its slots projects onto the line its first slot projects onto),
// and how many bulk lines share each husk line, by husk direction class
export function huskLineCensus(tables: LockedTables, lines: MeshLines, side: number): { bulkLines: number; huskLines: number; off: number; perHusk: { key: string; bulkClasses: number; huskLines: number; bulkPerHusk: number[] }[] } {
  const { huskOf, keys, members } = shadowClasses()
  const lineHusk = new Map<number, string>()
  let off = 0

  for (let x = 0; x < tables.cells; x++) {
    for (let l = 0; l < 12; l++) {
      const id = lines.lineOf[x * 24 + (LINE_FIRSTS[l] as number)] as number
      const k = huskLineKey(x, l, side, huskOf)
      const had = lineHusk.get(id)

      if (had === undefined) lineHusk.set(id, k)
      else if (had !== k) off++
    }
  }

  const count = new Map<string, number>()

  for (const k of lineHusk.values()) count.set(k, (count.get(k) ?? 0) + 1)

  const perHusk = keys.map((key, h) => {
    const mine = [...count.entries()].filter(([k]) => k.startsWith(`${h}:`)).map(([, n]) => n)

    return { key, bulkClasses: (members[h] as number[]).length, huskLines: mine.length, bulkPerHusk: [...new Set(mine)].sort((a, b) => a - b) }
  })

  return { bulkLines: lineHusk.size, huskLines: count.size, off, perHusk }
}

export type ShadowCensus = { total: number; fires: number; lineChange: number; shadowSetChange: number; depthOnly: number; vibeShadowChange: number; offLines: number }

// K on every set of singles of the given charges on distinct lines of one dock, no full line (no vacuum): how many
// fire; how many change the occupied line set; how many change the multiset of husk shadows of the occupied lines; how
// many change the line set but keep the shadow multiset (a change the husk cannot see: a depth flip); how many carry
// some vibe onto a line of another husk shadow (a swap does that and keeps both sets); and slot images off the dock's
// occupied-or-new lines are impossible by type (K permutes one dock's slots), so every image stays at the same dock and
// hence the same husk point
export function shadowCensus(charges: readonly number[]): ShadowCensus {
  const { huskOf } = shadowClasses()
  const out: ShadowCensus = { total: 0, fires: 0, lineChange: 0, shadowSetChange: 0, depthOnly: 0, vibeShadowChange: 0, offLines: 0 }
  const vibe = new Int8Array(24)
  const perm = new Int32Array(24)
  const m = charges.length
  const multiset = (ls: readonly number[]): string =>
    ls
      .map(l => huskOf[l] as number)
      .sort((a, b) => a - b)
      .join(',')
  const pick = (from: number, acc: number[]): void => {
    if (acc.length === m) {
      if (new Set(acc.map(d => LINE_OF[d])).size < m) return

      vibe.fill(0)
      acc.forEach((d, i) => (vibe[d] = charges[i] as number))
      out.total++
      if (bouncePermutation(BOUNCE_TABLE, 'pass', vibe, 0, perm) === 0) return
      out.fires++

      const before = acc.map(d => LINE_OF[d] as number)
      const after = acc.map(d => LINE_OF[perm[d] as number] as number)

      if (after.some(l => l === undefined)) out.offLines++

      const lineKey = (ls: readonly number[]): string =>
        ls
          .slice()
          .sort((a, b) => a - b)
          .join(',')
      const changed = lineKey(before) !== lineKey(after)
      const shadowChanged = multiset(before) !== multiset(after)

      if (changed) out.lineChange++
      if (shadowChanged) out.shadowSetChange++
      if (changed && !shadowChanged) out.depthOnly++
      if (before.some((l, i) => huskOf[l] !== huskOf[after[i] as number])) out.vibeShadowChange++

      return
    }

    for (let d = from; d < 24; d++) pick(d + 1, [...acc, d])
  }

  pick(0, [])

  return out
}

// THE STAR OF A HUB, SEEN FROM THE HUSK. The twelve bulk lines through X project to husk lines through pi(X); the
// docks off X whose husk image lies on two or more of those husk lines are HUSK crossings, where the husk would see two
// star lines meet although the bulk lines pass at different depths; the fiber over pi(X) (docks with the same shadow as
// X); and, for each dock Y of that fiber, the docks other than X and Y lying on a line through X and a line through Y
// (bulk crossings of the two stars, where two hubs over one husk point can meet)
export function huskStar(tables: LockedTables, lines: MeshLines, side: number, X: number): { huskLines: number; huskCrossings: number; fiber: number[]; fiberCrossings: number[]; fiberOnStar: number } {
  const { huskOf } = shadowClasses()
  const v = shadowOf(dockVector(X, side))
  const onLine = new Map<number, Set<number>>()

  for (let l = 0; l < 12; l++) {
    const r = shadowOf(ROOTS[LINE_FIRSTS[l] as number] as number[])

    for (let t = 0; t < side; t++) {
      const p = huskPoint(
        v.map((a, k) => a + t * (r[k] as number)),
        side,
      )
      const s = onLine.get(p) ?? new Set<number>()

      s.add(huskOf[l] as number)
      onLine.set(p, s)
    }
  }

  const home = huskPoint(v, side)
  const starOf = (x: number): Set<number> => new Set(Array.from({ length: 12 }, (_, l) => lines.lineOf[x * 24 + (LINE_FIRSTS[l] as number)] as number))
  const starX = starOf(X)
  let huskCrossings = 0
  const fiber: number[] = []

  for (let y = 0; y < tables.cells; y++) {
    if (y === X) continue

    const p = huskPoint(shadowOf(dockVector(y, side)), side)

    if ((onLine.get(p)?.size ?? 0) >= 2) huskCrossings++
    if (p === home) fiber.push(y)
  }

  const fiberOnStar = fiber.filter(y => [...starOf(y)].some(id => starX.has(id))).length
  const fiberCrossings = fiber.map(Y => {
    const starY = starOf(Y)
    let n = 0

    for (let z = 0; z < tables.cells; z++) {
      if (z === X || z === Y) continue

      const own = starOf(z)

      if ([...own].some(id => starX.has(id)) && [...own].some(id => starY.has(id))) n++
    }

    return n
  })
  const huskLines = new Set(Array.from({ length: 12 }, (_, l) => huskOf[l])).size

  return { huskLines, huskCrossings, fiber, fiberCrossings, fiberOnStar }
}

// the part of a husk velocity off every constituent shadow: its distance from the nearest of the husk lines spanned by
// `shadows` (0 when it lies along one of them)
export function offShadow(velocity: readonly number[], shadows: readonly (readonly number[])[]): number {
  return Math.min(
    ...shadows.map(s => {
      const n = Math.hypot(...s)
      const u = s.map(x => x / n)
      const along = velocity.reduce((a, x, k) => a + x * (u[k] as number), 0)

      return Math.hypot(...velocity.map((x, k) => x - along * (u[k] as number)))
    }),
  )
}
