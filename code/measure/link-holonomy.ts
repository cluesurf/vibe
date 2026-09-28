// THE HOLONOMY OF THE LINKS' POINT MOVES (E-SPN-0132). note/research/vibe/roadmap/remaining-pieces.md, "The Pauli-blocked
// mixer (E-SPN-0130)": left open was whether the point moves the stream applies are GAUGE (a change of frame at each
// dock, so "flat links" is a choice of frame) or CURVATURE (a loop carries a point to another point).
//
// THE OBJECT. Each directed link (x, d) holds a grid move g(x, d), an element of ASL(2, 3) (the 216 affine maps of Z3^2
// of determinant one, code/rule/vibe-weave), acting on the 9 points; the reverse link holds its inverse. The stream
// carries a vibe's point p across (x, d) to g(x, d) p (code/rule/doublet-locked-knit streamConfiguration, the tables'
// `move`). Around a closed loop of steps d_1 .. d_n from dock x the holonomy is g_n ... g_1, a permutation of the 9
// points; ASL(2, 3) acts faithfully, so the permutation is the identity exactly when the element is. A change of frame
// h(x) at every dock takes g(x, d) to h(y) g(x, d) h(x)^-1 and each holonomy to its conjugate by h(x), so whether a
// loop's holonomy is trivial does not depend on the frame: the links are pure gauge on a region exactly when every
// contractible loop there has trivial holonomy.
//
// THE ELEMENTARY LOOPS of the D4 mesh (24 roots, a dock's slot d streams along root r_d), for two roots a, b not on one
// line:
//   a . b = -1   a TRIANGLE a, b, -(a + b) (a + b is a root)
//   a . b =  0   a SQUARE a, b, -a, -b; orthogonal roots lie in one frame (the four mutually orthogonal lines of a dock,
//                code/rule/coined-locked-knit FRAME_LINES), so every square is a loop of ONE frame's lattice
//   a . b = +-1  a RHOMBUS a, b, -a, -b, two triangles glued (its angles are 60 and 120 degrees, so one geometric
//                rhombus is walked from its 60-degree docks with a . b = +1 and from its 120-degree docks with -1)
// A triangle's three lines lie in three different frames (lines of one frame are orthogonal), so triangles and rhombi
// are the loops that mix line classes across frames. Counted once each: a triangle is met from 3 starting docks in 2
// orientations, a rhombus from 4 in 2, a square from 4 in 2.
//
// EXACT: integer permutations of 9 points, no float. DETERMINISM: no random numbers. NOTHING MOVES: a holonomy is read
// off the tables; the rule is not run here.

import { rootsD4 } from '@/code/algebra/group/integer-roots'
import { lockedTables, type Configuration, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { type ColorWeave } from '@/code/rule/color-weave'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { pairWord, wordFirst, wordSecond } from '@/code/rule/occupation-veto-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { cloneConfiguration } from '@/code/rule/doublet-locked-knit'

const ROOTS = rootsD4()
const dot = (a: readonly number[], b: readonly number[]): number => a.reduce((s, x, k) => s + x * (b[k] as number), 0)

// the slot whose root is v, or -1
export function slotOfRoot(v: readonly number[]): number {
  return ROOTS.findIndex(r => r.every((x, k) => x === v[k]))
}

export type LoopKind = 'triangle' | 'square' | 'rhombus'

export const LOOP_KINDS: readonly LoopKind[] = ['triangle', 'square', 'rhombus']

// the step lists (slots) of every elementary loop shape from one dock, by kind (ordered: each geometric loop appears
// once per starting vertex and orientation, the multiplicity LOOP_MULTIPLICITY)
export function loopShapes(): Record<LoopKind, number[][]> {
  const out: Record<LoopKind, number[][]> = { triangle: [], square: [], rhombus: [] }

  for (let a = 0; a < 24; a++) {
    for (let b = 0; b < 24; b++) {
      const ra = ROOTS[a] as number[]
      const rb = ROOTS[b] as number[]
      const ab = dot(ra, rb)

      if (ab === 2 || ab === -2) continue

      const na = slotOfRoot(ra.map(x => -x))
      const nb = slotOfRoot(rb.map(x => -x))
      const rhombus = [a, b, na, nb]

      if (ab === 0) out.square.push(rhombus)
      else out.rhombus.push(rhombus)
      if (ab === -1) out.triangle.push([a, b, slotOfRoot(ra.map((x, k) => -x - (rb[k] as number)))])
    }
  }

  return out
}

export const LOOP_MULTIPLICITY: Record<LoopKind, number> = { triangle: 6, square: 8, rhombus: 8 }

// the elementary loops through one undirected edge {x, x + a} of the unbounded mesh, derived: a triangle's third dock
// is x + b with b . a = 1 (8 roots), a square's side is b orthogonal to a (6), a rhombus's other side any root b with
// b . a = +-1 (16). A single link set off the identity on flat links curves exactly these
export const LOOPS_THROUGH_EDGE: Record<LoopKind, number> = { triangle: 8, square: 6, rhombus: 16 }

// flat links with one link (x, d) and its reverse set to the move g (the planted curvature of the instrument check)
export function plantedLinks(weave: ColorWeave, x: number, d: number, g: number): Int16Array {
  const out = flatLinks(weave)
  const y = weave.mesh.neighbour(x, d)

  out[x * 24 + d] = g
  out[y * 24 + (OPPOSITE[d] as number)] = weave.moves.inverse[g] as number

  return out
}

// the three-body offset pairs (n1, n2) in Z^4 with Steiner length (the bounding box's half perimeter, the fewest frame
// links joining three docks) at most w: per axis the triple (0, a, b) of spread s is 1 way for s = 0 and 6 s ways
// otherwise, so the count is the coefficient sum of (1 + sum 6 s x^s)^4 to x^w. The size of a route-free three-hole
// stand-in's window, per slot triple (8^3 = 512 of them)
export function steinerOffsetPairs(w: number): number {
  let total = 0
  const rec = (k: number, left: number, prod: number): void => {
    if (k === 4) {
      total += prod

      return
    }

    for (let s = 0; s <= left; s++) rec(k + 1, left - s, prod * (s === 0 ? 1 : 6 * s))
  }

  rec(0, w, 1)

  return total
}

// the holonomy of a walk from dock x along `steps` (slots): the composed point permutation, and the dock it ends on
export function walkHolonomy(tables: LockedTables, x: number, steps: readonly number[]): { perm: Int8Array; end: number } {
  const perm = Int8Array.from({ length: 9 }, (_, p) => p)
  let at = x

  for (const d of steps) {
    const slot = at * 24 + d

    for (let p = 0; p < 9; p++) perm[p] = tables.move[slot * 9 + (perm[p] as number)] as number
    at = Math.floor((tables.target[slot] as number) / 24)
  }

  return { perm, end: at }
}

export const isIdentity = (perm: Int8Array): boolean => perm.every((q, p) => q === p)

export const fixedPoints = (perm: Int8Array): number => perm.reduce((n, q, p) => n + (q === p ? 1 : 0), 0)

export function permOrder(perm: Int8Array): number {
  const cur = Int8Array.from(perm)
  let n = 1

  while (!isIdentity(cur) && n < 64) {
    for (let p = 0; p < 9; p++) cur[p] = perm[cur[p] as number] as number
    n++
  }

  return n
}

export type HolonomyTally = {
  // geometric loops (ordered walks / multiplicity), and those with a nontrivial holonomy
  loops: number
  curved: number
  // nontrivial holonomies that fix at least one point (a love sea could keep one point round the loop), and those that
  // fix none (a translation's part, no one-content point survives)
  fixing: number
  fixless: number
  // holonomy element orders, nontrivial ones: order -> count (geometric)
  orders: Record<number, number>
  // walks that did not close (0 on a sound instrument), ordered walks read
  open: number
  walks: number
  // docks with at least one curved loop of this kind through them as the starting vertex
  curvedDocks: number
}

// every elementary loop of every kind from every dock
export function holonomyCensus(tables: LockedTables): Record<LoopKind, HolonomyTally> {
  const shapes = loopShapes()
  const out = {} as Record<LoopKind, HolonomyTally>

  for (const kind of LOOP_KINDS) {
    const m = LOOP_MULTIPLICITY[kind]
    const t: HolonomyTally = { loops: 0, curved: 0, fixing: 0, fixless: 0, orders: {}, open: 0, walks: 0, curvedDocks: 0 }
    let curvedWalks = 0
    let fixingWalks = 0
    const orderWalks: Record<number, number> = {}

    for (let x = 0; x < tables.cells; x++) {
      let here = false

      for (const steps of shapes[kind]) {
        const h = walkHolonomy(tables, x, steps)

        t.walks++
        if (h.end !== x) t.open++
        if (isIdentity(h.perm)) continue
        here = true
        curvedWalks++
        if (fixedPoints(h.perm) > 0) fixingWalks++

        const o = permOrder(h.perm)

        orderWalks[o] = (orderWalks[o] ?? 0) + 1
      }

      if (here) t.curvedDocks++
    }

    t.loops = t.walks / m
    t.curved = curvedWalks / m
    t.fixing = fixingWalks / m
    t.fixless = (curvedWalks - fixingWalks) / m
    for (const [o, n] of Object.entries(orderWalks)) t.orders[Number(o)] = n / m
    out[kind] = t
  }

  return out
}

// the holonomy round every mesh line's ring (a line direction d = a line's first slot, walked until it returns): the
// noncontractible loops of the torus. Returns per ring its length and holonomy's order and fixed points
export function ringHolonomies(tables: LockedTables): { length: number; order: number; fixed: number }[] {
  const out: { length: number; order: number; fixed: number }[] = []

  for (const d of LINE_FIRSTS) {
    const seen = new Uint8Array(tables.cells)

    for (let x = 0; x < tables.cells; x++) {
      if (seen[x]) continue

      const steps: number[] = []
      let at = x

      do {
        seen[at] = 1
        steps.push(d)
        at = Math.floor((tables.target[at * 24 + d] as number) / 24)
      } while (at !== x)

      const h = walkHolonomy(tables, x, steps)

      out.push({ length: steps.length, order: permOrder(h.perm), fixed: fixedPoints(h.perm) })
    }
  }

  return out
}

// ---- frames: a change of frame at every dock ----

export type GroupMoves = ColorWeave['moves']

// the links under the frame field h (one grid move per dock): g(x, d) -> h(y) g(x, d) h(x)^-1, a link and its reverse
// staying inverse to each other
export function gaugeLinks(weave: ColorWeave, links: Int16Array, h: Int16Array): Int16Array {
  const { compose, inverse } = weave.moves
  const out = new Int16Array(links.length)

  for (let x = 0; x < weave.mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      const y = weave.mesh.neighbour(x, d)

      out[x * 24 + d] = compose(h[y] as number, compose(links[x * 24 + d] as number, inverse[h[x] as number] as number))
    }
  }

  return out
}

// the flat links (every move the identity)
export const flatLinks = (weave: ColorWeave): Int16Array => new Int16Array(weave.links.length).fill(weave.moves.identity)

// the rule's tables on a link field
export const tablesOn = (weave: ColorWeave, contact: CollisionKind, links: Int16Array): LockedTables => lockedTables(weave, contact, links)

// a configuration in the frame h: every held slot's point p -> h(x) p, every stored pair word (s, q) -> (h s, h q)
export function gaugeConfiguration(weave: ColorWeave, c: Configuration, h: Int16Array): Configuration {
  const out = cloneConfiguration(c)
  const act = weave.moves.act

  for (let x = 0; x < weave.mesh.cellCount; x++) {
    const g = act[h[x] as number] as Int8Array

    for (let d = 0; d < 24; d++) {
      const i = x * 24 + d

      if (c.vibe[i] !== 0) out.point[i] = g[c.point[i] as number] as number
    }

    for (let l = 0; l < 12; l++) {
      const s = x * 12 + l

      if (c.store[s] === 0) continue

      const w = c.spoint[s] as number

      out.spoint[s] = pairWord(g[wordFirst(w)] as number, g[wordSecond(w)] as number)
    }
  }

  return out
}

// slots and stores where two configurations differ (a held slot's point and open bit counted, an empty slot's not)
export function configurationsApart(a: Configuration, b: Configuration): number {
  let n = 0

  for (let i = 0; i < a.vibe.length; i++) {
    if (a.vibe[i] !== b.vibe[i]) n++
    else if (a.vibe[i] !== 0 && (a.point[i] !== b.point[i] || a.open[i] !== b.open[i])) n++
  }

  for (let s = 0; s < a.store.length; s++) {
    if (a.store[s] !== b.store[s]) n++
    else if (a.store[s] !== 0 && (a.spoint[s] !== b.spoint[s] || a.sopen[s] !== b.sopen[s])) n++
  }

  return n
}

// slots and stores whose OCCUPATION differs (vibe trit, store trit, open bits), points ignored
export function occupationsApart(a: Configuration, b: Configuration): number {
  let n = 0

  for (let i = 0; i < a.vibe.length; i++) if (a.vibe[i] !== b.vibe[i] || (a.vibe[i] !== 0 && a.open[i] !== b.open[i])) n++
  for (let s = 0; s < a.store.length; s++) if (a.store[s] !== b.store[s] || (a.store[s] !== 0 && a.sopen[s] !== b.sopen[s])) n++

  return n
}

// the like-full dock lines of a configuration (both slots one vibe), by whether their two points agree: the meetings
// the next beat reads (a coin never makes a full line, so these are the meetings of the beat)
export function likeMeetings(c: Configuration, cells: number): { equal: number; unequal: number } {
  let equal = 0
  let unequal = 0

  for (let x = 0; x < cells; x++) {
    for (let l = 0; l < 12; l++) {
      const f = LINE_FIRSTS[l] as number
      const i = x * 24 + f
      const j = x * 24 + (OPPOSITE[f] as number)

      if (c.vibe[i] === 0 || c.vibe[i] !== c.vibe[j]) continue
      if (c.point[i] === c.point[j]) equal++
      else unequal++
    }
  }

  return { equal, unequal }
}

// the slot opposite each slot by the roots (-r_d), to be checked against the rule's own OPPOSITE
export const ROOT_OPPOSITE: readonly number[] = ROOTS.map(r => slotOfRoot(r.map(x => -x)))

// the love sea's counts against a configuration: loves, fears, empty slots (holes), held stores
export function seaCounts(c: Configuration): { loves: number; fears: number; holes: number; stores: number } {
  let loves = 0
  let fears = 0
  let holes = 0
  let stores = 0

  for (let i = 0; i < c.vibe.length; i++) {
    const v = c.vibe[i] as number

    if (v > 0) loves++
    else if (v < 0) fears++
    else holes++
  }

  for (let s = 0; s < c.store.length; s++) if (c.store[s] !== 0) stores++

  return { loves, fears, holes, stores }
}
