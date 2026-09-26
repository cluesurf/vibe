// Line components and walls on a dock-varying vacuum under the bounce collisions (E-RLT-0087). MEASUREMENT, but
// every count here is an exact integer: runs of the classical kernel (code/measure/bounce-pair-kernel) compared trit
// for trit.
//
// THE QUESTIONS. E-RLT-0085 found the lone bounce knit's hub vacuum at 12 line components (the committed knit's 3) and
// walls that do not quantize. code/measure/line-locality proves the first is forced by the lone wake: a seed's
// difference stays on its own line as long as (i) the vacuum visits only vacuum-like docks at every coin piece and
// (ii) the collision keeps every line of a vacuum-like-plus-one-single dock (checked there exhaustively). Here:
//  - vacuumSingleDocks counts, over a run of the vacuum, the docks that hold a single line at a coin piece (condition
//    (i) needs 0);
//  - seedWake runs a single seed from each of the 24 slots of a dock and counts the trits that differ from the vacuum
//    OFF the seed's line (the theorem says 0), and the battery's union of touched lines;
//  - pairSeedComponents seeds TWO vibes on two different lines of one dock (a matter-matter meeting at beat 0) for
//    every such pair, and unions the lines each run touches: the line components reached through matter meetings;
//  - wallReading splits the battery's wall difference (a vacuum with half the box born one beat late, against the
//    uniform vacuum) into the IDEAL part (the early half the uniform vacuum, the late half the all-late vacuum, each
//    run on its own) and the EXCITATION (the run against that ideal), the part the wall itself makes.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { bounceRunner, coinMove, collideBounce, makeBounceKernel, pairMove, type BounceKernel } from '@/code/measure/bounce-pair-kernel'
import { cloneReduced, tritDifference, type Reduced } from '@/code/measure/living-pair-kernel'
import { d4BoxCell, d4BoxCoordinates, d4Coordinates } from '@/code/substrate/d4-box'
import { coinData, orientedHubStore } from '@/code/measure/varying-vacuum'
import { groupTable } from '@/code/measure/color-isotropy-bound'
import { layoutOf, weaveOf } from '@/code/measure/varying-living-battery'

const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)

export type HubSetup = { readonly kernel: BounceKernel; readonly store: Int8Array; readonly layout: Int8Array; readonly cells: number; readonly side: number; readonly anchor: number }

let COINS: ReturnType<typeof coinData> | undefined

// the oriented hub vacuum on a side-`side` box anchored so dock `anchor` stores line 0 (E-RLT-0082's convention)
export function hubSetup(side: number, kind: CollisionKind, anchor = 0): HubSetup {
  COINS ??= coinData(groupTable())

  const r0 = d4Coordinates(rootsD4()[LINE_FIRSTS[0] as number] as number[])
  const hub = d4BoxCoordinates({ cell: anchor, side }).map((v, k) => v - (r0[k] as number))
  const weave = weaveOf(side)

  return { kernel: makeBounceKernel(weave, kind), store: orientedHubStore(COINS, side, hub), layout: layoutOf(side), cells: weave.mesh.cellCount, side, anchor }
}

export function emptyOf(s: HubSetup): Reduced {
  return { vibe: new Int8Array(s.cells * 24), point: new Int8Array(s.cells * 24), store: Int8Array.from(s.store), spoint: Int8Array.from(s.layout) }
}

export const centerOf = (side: number): number => {
  const mid = Math.floor(side / 2)

  return d4BoxCell({ coordinates: [mid, mid, mid, mid], side })
}

// the number of single lines a dock holds
function singlesAt(vibe: Int8Array, x: number): number {
  let n = 0

  for (let l = 0; l < 12; l++) {
    const a = vibe[x * 24 + (LINE_FIRSTS[l] as number)] !== 0
    const b = vibe[x * 24 + (LINE_SECONDS[l] as number)] !== 0

    if (a !== b) n++
  }

  return n
}

// condition (i): over `beats` beats of the vacuum, the dock-beats whose dock holds a single line at its coin piece
export function vacuumSingleDocks(s: HubSetup, beats: number): { withSingle: number; checked: number } {
  const k = s.kernel
  let a = emptyOf(s)
  let withSingle = 0
  let checked = 0

  for (let t = 0; t < beats; t++) {
    for (let x = 0; x < s.cells; x++) {
      for (const piece of collisionOrder(k.schedule, t)) {
        if (piece === 'P') pairMove(k, a, x)
        else {
          checked++
          withSingle += singlesAt(a.vibe, x) > 0 ? 1 : 0
          coinMove(k, a, x)
        }
      }
    }

    const next = cloneReduced(a)

    next.vibe.fill(0)

    for (let slot = 0; slot < a.vibe.length; slot++) {
      const v = a.vibe[slot] as number

      if (v === 0) continue

      const to = k.target[slot] as number

      next.vibe[to] = v
      next.point[to] = (k.move[slot] as Int8Array)[a.point[slot] as number] as number
    }

    a = next
  }

  return { withSingle, checked }
}

const background = (s: HubSetup, beats: number): Reduced[] => {
  const run = bounceRunner(s.kernel, emptyOf(s))
  const out: Reduced[] = []

  for (let t = 0; t < beats; t++) {
    run.beat()
    out.push(cloneReduced(run.state()))
  }

  return out
}

// the lines a run touches against the background (vibes and stores that differ), and the trits off `own`
function touched(run: Reduced, bg: Reduced, cells: number, own: ReadonlySet<number>, lines: Set<number>): number {
  let off = 0

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < 24; d++) {
      if (run.vibe[x * 24 + d] !== bg.vibe[x * 24 + d]) {
        const l = LINE_OF[d] as number

        lines.add(l)
        off += own.has(l) ? 0 : 1
      }
    }

    for (let l = 0; l < 12; l++) {
      if (run.store[x * 12 + l] !== bg.store[x * 12 + l]) {
        lines.add(l)
        off += own.has(l) ? 0 : 1
      }
    }
  }

  return off
}

const components = (edges: readonly (readonly number[])[]): number => {
  const parent = Array.from({ length: 12 }, (_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x] as number)))

  for (const group of edges) for (const l of group) parent[find(l)] = find(group[0] as number)

  return new Set(Array.from({ length: 12 }, (_, i) => find(i))).size
}

// one seed (a love on an empty slot, or the slot flipped) from each of the 24 slots of `center`
export function seedWake(s: HubSetup, center: number, beats: number): { offLine: number; components: number; largestWake: number } {
  const bg = background(s, beats)
  const edges: number[][] = []
  let offLine = 0
  let largestWake = 0

  for (let d = 0; d < 24; d++) {
    const start = emptyOf(s)
    const slot = center * 24 + d

    start.vibe[slot] = start.vibe[slot] === 1 ? -1 : 1

    const run = bounceRunner(s.kernel, start)
    const own = new Set([LINE_OF[d] as number])
    const lines = new Set<number>(own)

    for (let t = 0; t < beats; t++) {
      run.beat()
      offLine += touched(run.state(), bg[t] as Reduced, s.cells, own, lines)
      largestWake = Math.max(largestWake, tritDifference(run.state(), bg[t] as Reduced).trits)
    }

    edges.push([...lines])
  }

  return { offLine, components: components(edges), largestWake }
}

// two seeds on two different lines of `center`, every pair of slots
export function pairSeedComponents(s: HubSetup, center: number, beats: number): { pairs: number; components: number; crossing: number } {
  const bg = background(s, beats)
  const edges: number[][] = []
  let pairs = 0
  let crossing = 0

  for (let d1 = 0; d1 < 24; d1++) {
    for (let d2 = d1 + 1; d2 < 24; d2++) {
      if (LINE_OF[d1] === LINE_OF[d2]) continue

      const start = emptyOf(s)

      start.vibe[center * 24 + d1] = 1
      start.vibe[center * 24 + d2] = 1

      const run = bounceRunner(s.kernel, start)
      const own = new Set([LINE_OF[d1] as number, LINE_OF[d2] as number])
      const lines = new Set<number>(own)
      let off = 0

      for (let t = 0; t < beats; t++) {
        run.beat()
        off += touched(run.state(), bg[t] as Reduced, s.cells, own, lines)
      }

      pairs++
      crossing += off > 0 ? 1 : 0

      // two seeds join their own lines only when the run reached past them (a meeting that moved something);
      // otherwise each seed's line is its own group
      if (off > 0) edges.push([...lines])
      else for (const l of own) edges.push([l])
    }
  }

  return { pairs, components: components(edges), crossing }
}

export type WallReading = {
  readonly gate: number[]
  readonly ideal: number[]
  readonly excitation: number[]
  readonly excitationDocks: number[]
  // the first-coordinate layers holding any excitation dock over the settled window, of `side`
  readonly layers: number[]
  readonly sheet: number
  // the least p <= 24 with the whole walled state at t + p equal to it at t over the settled window (0 if none), by an
  // exact comparison of 32-bit hashes confirmed on the last beat
  readonly period: number
}

// a 32-bit FNV-1a hash of the vibes and stores (a periodicity witness; equality is confirmed exactly where used)
function hashOf(s: Reduced): number {
  let h = 0x811c9dc5

  for (let i = 0; i < s.vibe.length; i++) h = Math.imul(h ^ ((s.vibe[i] as number) + 2), 0x01000193)
  for (let i = 0; i < s.store.length; i++) h = Math.imul(h ^ ((s.store[i] as number) + 5), 0x01000193)

  return h >>> 0
}

// the battery's wall (E-RLT-0082's walls(): the docks with first coordinate at least ceil(side / 2) skip beat 0's
// collision; 8 periods of 24, settled from beat 72), split into its ideal and its excitation
export function wallReading(s: HubSetup): WallReading {
  const k = s.kernel
  const cells = s.cells
  const edge = Math.ceil(s.side / 2)
  const layerOf = Array.from({ length: cells }, (_, x) => d4BoxCoordinates({ cell: x, side: s.side })[0] ?? 0)
  const late = layerOf.map(c => c >= edge)
  const delayed = (which: (x: number) => boolean): Reduced => {
    const a = emptyOf(s)

    for (let x = 0; x < cells; x++) if (!which(x)) collideBounce(k, a, x, 0)

    const out = cloneReduced(a)

    out.vibe.fill(0)

    for (let slot = 0; slot < a.vibe.length; slot++) {
      const v = a.vibe[slot] as number

      if (v === 0) continue

      const to = k.target[slot] as number

      out.vibe[to] = v
      out.point[to] = (k.move[slot] as Int8Array)[a.point[slot] as number] as number
    }

    return out
  }
  const uniform = bounceRunner(k, emptyOf(s))
  const run = bounceRunner(k, delayed(x => late[x] as boolean), 1)
  const allLate = bounceRunner(k, delayed(() => true), 1)
  const gate: number[] = []
  const ideal: number[] = []
  const excitation: number[] = []
  const excitationDocks: number[] = []
  const layers = new Set<number>()
  const hashes: number[] = []
  const saved: Reduced[] = []

  uniform.beat()

  for (let t = 1; t < 8 * 24; t++) {
    run.beat()
    uniform.beat()
    allLate.beat()

    if (t < 3 * 24) continue

    hashes.push(hashOf(run.state()))

    // keep the last 25 states for the exact confirmation of the period
    if (t >= 8 * 24 - 25) saved.push(cloneReduced(run.state()))

    const u = uniform.state()
    const b = allLate.state()
    const id = cloneReduced(u)

    for (let x = 0; x < cells; x++) {
      if (!late[x]) continue

      id.vibe.set(b.vibe.subarray(x * 24, x * 24 + 24), x * 24)
      id.point.set(b.point.subarray(x * 24, x * 24 + 24), x * 24)
      id.store.set(b.store.subarray(x * 12, x * 12 + 12), x * 12)
      id.spoint.set(b.spoint.subarray(x * 12, x * 12 + 12), x * 12)
    }

    const a = run.state()

    gate.push(tritDifference(a, u).trits)
    ideal.push(tritDifference(id, u).trits)

    const e = tritDifference(a, id)

    excitation.push(e.trits)
    excitationDocks.push(e.docks)

    for (let x = 0; x < cells; x++) {
      let differs = false

      for (let d = 0; d < 24 && !differs; d++) differs = a.vibe[x * 24 + d] !== id.vibe[x * 24 + d]
      for (let l = 0; l < 12 && !differs; l++) differs = a.store[x * 12 + l] !== id.store[x * 12 + l]

      if (differs) layers.add(layerOf[x] as number)
    }
  }

  let period = 0

  for (let p = 1; p <= 24 && period === 0; p++) {
    if (!hashes.every((h, i) => i + p >= hashes.length || h === hashes[i + p])) continue

    const last = saved[saved.length - 1] as Reduced
    const earlier = saved[saved.length - 1 - p] as Reduced

    if (tritDifference(last, earlier).trits === 0) period = p
  }

  return { gate, ideal, excitation, excitationDocks, layers: [...layers].sort((p, q) => p - q), sheet: s.side ** 3, period }
}
