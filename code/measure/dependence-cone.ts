// Dependence cones: which docks a change at one dock reaches (E-RLT-0091). MEASUREMENT: every count is an exact integer.
//
// THE USER'S DIRECTION (2026-09-26). Calm, love and fear are treated alike. Dock B at beat t arose from dock A at beat
// s when changing A's value at s (to any other value its slots and dock data can hold: the other two vibes, and the
// role point or store the slot carries) changes B's value at t. Two histories, the reference and the changed one, run
// in lockstep, both deterministic, and every dock whose state differs is marked. A copy of a value that a later
// collision overwrites regardless carries nothing and marks nothing.
//
// THE LOCKSTEP IS SPARSE AND EXACT. Every knit here beats as collide, then stream, and the collision reads one dock
// only. So the changed history equals the reference everywhere except on a set D_t of docks, and one beat of the
// changed history is: collide each dock of D_t on its own copy, compare it with the reference's collided dock, and
// stream only the slots that differ into the docks they are copied to (whose other slots are the reference's). A dock
// whose dock data (a store, a counter) differs stays in D_(t+1) itself. `bruteDifferences` runs the whole changed
// history instead and must give the same D_t on every beat; the experiment gates that.
//
// NOTHING MOVES: the stream copies each slot's value one dock along; this file only compares values.
//
// A RULE is given as one dock's collision on local arrays (24 vibes, 24 riding values, the dock's own data), the
// stream's slot map, and the move a riding value takes when its slot is copied (a role point's grid move).

import { collideBounce, type BounceKernel } from '@/code/measure/bounce-pair-kernel'
import { type Reduced } from '@/code/measure/living-pair-kernel'
import { coldQuaternionCollide, type ColdQuaternionKnit } from '@/code/rule/cold-quaternion-knit'
import { type Collision } from '@/code/rule/collision'
import { forest, join, rootOf, componentCount, type BoxHusk } from '@/code/measure/causal-components'
import { type Mesh } from '@/code/tool/mesh'

export type DockRule = {
  readonly name: string
  readonly cells: number
  // values held per dock that never stream (hub: 12 stores and their 12 points; cold: 6 couple counters)
  readonly dockFields: number
  // slot i is copied into slot target[i]
  readonly target: Int32Array
  // the riding value's move when slot i is copied (identity when undefined)
  readonly auxMove: ((slot: number, value: number) => number) | undefined
  // beat t's collision of one dock, in place
  collide(t: number, v: Int8Array, a: Int16Array, d: Int16Array): void
  // do two slot values (vibe, riding value) differ in anything the rule can ever read
  slotDiffers(v1: number, a1: number, v2: number, a2: number): boolean
  // do two docks' data differ in anything the rule can ever read (d1 at o1, d2 at o2)
  dockDiffers(d1: Int16Array, o1: number, d2: Int16Array, o2: number): boolean
  // every other value dock state (v, a, d) can hold at one changed place, as edits of local copies
  perturbations(v: Int8Array, a: Int16Array, d: Int16Array): Perturbation[]
}

// one change of one dock's state: the vibe or riding value of a slot, or one or two dock fields
export type Perturbation = { readonly kind: 'slot' | 'dock'; readonly index: number; readonly v: number; readonly a: number; readonly index2?: number; readonly a2?: number }

export function applyPerturbation(p: Perturbation, v: Int8Array, a: Int16Array, d: Int16Array): void {
  if (p.kind === 'slot') {
    v[p.index] = p.v
    a[p.index] = p.a
  } else {
    d[p.index] = p.a
    if (p.index2 !== undefined) d[p.index2] = p.a2 ?? 0
  }
}

export type State = { v: Int8Array; a: Int16Array; d: Int16Array }

export function emptyState(rule: DockRule): State {
  return { v: new Int8Array(rule.cells * 24), a: new Int16Array(rule.cells * 24), d: new Int16Array(rule.cells * rule.dockFields) }
}

export function cloneState(s: State): State {
  return { v: Int8Array.from(s.v), a: Int16Array.from(s.a), d: Int16Array.from(s.d) }
}

const LV = new Int8Array(24)
const LA = new Int16Array(24)
let LD = new Int16Array(64)

// one beat of the whole state: collide every dock, then stream (every slot copied, calm included)
export function fullBeat(rule: DockRule, t: number, s: State): State {
  const post = cloneState(s)
  const f = rule.dockFields

  if (LD.length < f) LD = new Int16Array(f)

  const ld = LD.subarray(0, f)

  for (let x = 0; x < rule.cells; x++) {
    LV.set(post.v.subarray(x * 24, x * 24 + 24))
    LA.set(post.a.subarray(x * 24, x * 24 + 24))
    ld.set(post.d.subarray(x * f, x * f + f))
    rule.collide(t, LV, LA, ld)
    post.v.set(LV, x * 24)
    post.a.set(LA, x * 24)
    post.d.set(ld, x * f)
  }

  const next: State = { v: new Int8Array(s.v.length), a: new Int16Array(s.a.length), d: Int16Array.from(post.d) }

  for (let i = 0; i < s.v.length; i++) {
    const to = rule.target[i] as number

    next.v[to] = post.v[i] as number
    next.a[to] = rule.auxMove ? rule.auxMove(i, post.a[i] as number) : (post.a[i] as number)
  }

  return next
}

// the reference history: the state at the start of beats 0 .. beats
export function referenceFrames(rule: DockRule, start: State, beats: number): State[] {
  const frames: State[] = [cloneState(start)]

  for (let t = 0; t < beats; t++) frames.push(fullBeat(rule, t, frames[t] as State))

  return frames
}

// does dock x differ between two states
export function dockStateDiffers(rule: DockRule, p: State, q: State, x: number): boolean {
  for (let d = 0; d < 24; d++) {
    const i = x * 24 + d

    if (rule.slotDiffers(p.v[i] as number, p.a[i] as number, q.v[i] as number, q.a[i] as number)) return true
  }

  return rule.dockFields > 0 && rule.dockDiffers(p.d, x * rule.dockFields, q.d, x * rule.dockFields)
}

// ---- the sparse lockstep ----

export type Cone = {
  // per dock: the first beat it differs (0 for the changed dock), -1 if never within the window
  readonly firstAt: Int32Array
  // |D_t| for t = 0 .. beats (0 once the difference is gone)
  readonly sizes: Int32Array
  // docks whose collision erased their difference (collided state equal to the reference's though the state before
  // differed): 0 for a collision that is a bijection of the dock's state
  killed: number
  // the per-beat difference sets, when asked (sorted)
  readonly sets: number[][] | undefined
}

type Buffers = { v: Int8Array; a: Int16Array; d: Int16Array; stamp: Int32Array; list: Int32Array }

const BUFFERS = new WeakMap<DockRule, [Buffers, Buffers]>()
let EPOCH = 0

function buffersOf(rule: DockRule): [Buffers, Buffers] {
  let b = BUFFERS.get(rule)

  if (!b) {
    const make = (): Buffers => ({
      v: new Int8Array(rule.cells * 24),
      a: new Int16Array(rule.cells * 24),
      d: new Int16Array(Math.max(1, rule.cells * rule.dockFields)),
      stamp: new Int32Array(rule.cells).fill(-1),
      list: new Int32Array(rule.cells),
    })

    b = [make(), make()]
    BUFFERS.set(rule, b)
  }

  return b
}

const RV = new Int8Array(24)
const RA = new Int16Array(24)
let RD = new Int16Array(64)

// the cone of one change `p` of dock x0 at beat 0 over the reference frames (frames.length - 1 beats)
export function coneOf(rule: DockRule, frames: readonly State[], x0: number, p: Perturbation, keepSets = false): Cone {
  const beats = frames.length - 1
  const f = rule.dockFields
  const firstAt = new Int32Array(rule.cells).fill(-1)
  const sizes = new Int32Array(beats + 1)
  const sets: number[][] | undefined = keepSets ? [] : undefined
  let [cur, next] = buffersOf(rule)
  let count = 1

  if (RD.length < f) RD = new Int16Array(f)
  if (LD.length < f) LD = new Int16Array(f)

  const ld = LD.subarray(0, f)
  const rd = RD.subarray(0, f)
  const cone: Cone = { firstAt, sizes, killed: 0, sets }
  const f0 = frames[0] as State

  EPOCH++
  cur.stamp[x0] = EPOCH
  cur.list[0] = x0
  cur.v.set(f0.v.subarray(x0 * 24, x0 * 24 + 24), x0 * 24)
  cur.a.set(f0.a.subarray(x0 * 24, x0 * 24 + 24), x0 * 24)
  if (f > 0) cur.d.set(f0.d.subarray(x0 * f, x0 * f + f), x0 * f)

  {
    const v = cur.v.subarray(x0 * 24, x0 * 24 + 24)
    const a = cur.a.subarray(x0 * 24, x0 * 24 + 24)
    const d = cur.d.subarray(x0 * f, x0 * f + f)

    applyPerturbation(p, v, a, d)
  }

  firstAt[x0] = 0
  sizes[0] = 1
  sets?.push([x0])

  for (let t = 0; t < beats; t++) {
    const ref = frames[t] as State
    const refNext = frames[t + 1] as State
    const epoch = ++EPOCH
    let nextCount = 0

    for (let k = 0; k < count; k++) {
      const x = cur.list[k] as number
      const b24 = x * 24

      LV.set(cur.v.subarray(b24, b24 + 24))
      LA.set(cur.a.subarray(b24, b24 + 24))
      if (f > 0) ld.set(cur.d.subarray(x * f, x * f + f))
      rule.collide(t, LV, LA, ld)

      RV.set(ref.v.subarray(b24, b24 + 24))
      RA.set(ref.a.subarray(b24, b24 + 24))
      if (f > 0) rd.set(ref.d.subarray(x * f, x * f + f))
      rule.collide(t, RV, RA, rd)

      let any = false

      for (let d = 0; d < 24; d++) {
        if (!rule.slotDiffers(LV[d] as number, LA[d] as number, RV[d] as number, RA[d] as number)) continue

        any = true

        const i = b24 + d
        const to = rule.target[i] as number
        const y = (to / 24) | 0

        if (next.stamp[y] !== epoch) {
          next.stamp[y] = epoch
          next.list[nextCount++] = y
          next.v.set(refNext.v.subarray(y * 24, y * 24 + 24), y * 24)
          next.a.set(refNext.a.subarray(y * 24, y * 24 + 24), y * 24)
          if (f > 0) next.d.set(refNext.d.subarray(y * f, y * f + f), y * f)
        }

        next.v[to] = LV[d] as number
        next.a[to] = rule.auxMove ? rule.auxMove(i, LA[d] as number) : (LA[d] as number)
      }

      if (f > 0 && rule.dockDiffers(ld, 0, rd, 0)) {
        any = true

        if (next.stamp[x] !== epoch) {
          next.stamp[x] = epoch
          next.list[nextCount++] = x
          next.v.set(refNext.v.subarray(b24, b24 + 24), b24)
          next.a.set(refNext.a.subarray(b24, b24 + 24), b24)
        }

        next.d.set(ld, x * f)
      }

      if (!any) cone.killed++
    }

    sizes[t + 1] = nextCount

    for (let k = 0; k < nextCount; k++) {
      const y = next.list[k] as number

      if (firstAt[y] === -1) firstAt[y] = t + 1
    }

    if (sets) sets.push(Array.from(next.list.subarray(0, nextCount)).sort((m, n) => m - n))

    const swap = cur

    cur = next
    next = swap
    count = nextCount

    if (count === 0) {
      for (let u = t + 2; u <= beats; u++) sets?.push([])
      break
    }
  }

  return cone
}

// the same D_t by running the whole changed history (the check on the sparse lockstep)
export function bruteDifferences(rule: DockRule, frames: readonly State[], x0: number, p: Perturbation): number[][] {
  const s = cloneState(frames[0] as State)
  const f = rule.dockFields

  applyPerturbation(p, s.v.subarray(x0 * 24, x0 * 24 + 24), s.a.subarray(x0 * 24, x0 * 24 + 24), s.d.subarray(x0 * f, x0 * f + f))

  const sets: number[][] = []
  let state = s

  for (let t = 0; t < frames.length; t++) {
    const ref = frames[t] as State
    const set: number[] = []

    for (let x = 0; x < rule.cells; x++) if (dockStateDiffers(rule, state, ref, x)) set.push(x)

    sets.push(set)

    if (t < frames.length - 1) state = fullBeat(rule, t, state)
  }

  return sets
}

// ---- the seed's cone: every change of one dock at beat 0, united ----

export type SeedCone = {
  readonly perturbations: number
  // docks in the union of the cones, and husk docks (columns)
  readonly bulk: Uint8Array
  readonly husk: Uint8Array
  readonly bulkCount: number
  readonly huskCount: number
  // the smallest single change's husk and bulk coverage
  readonly smallestHusk: number
  readonly smallestBulk: number
  // over every change: beats where the difference was gone, docks whose collision erased it
  readonly emptyBeats: number
  readonly killed: number
  // the changes whose difference was gone by the last beat
  readonly died: number
}

export function seedCone(rule: DockRule, husk: BoxHusk, frames: readonly State[], x0: number, filter?: (p: Perturbation) => boolean): SeedCone {
  const f0 = frames[0] as State
  const f = rule.dockFields
  const all = rule.perturbations(f0.v.slice(x0 * 24, x0 * 24 + 24), f0.a.slice(x0 * 24, x0 * 24 + 24), f0.d.slice(x0 * f, x0 * f + f))
  const list = filter ? all.filter(filter) : all
  const bulk = new Uint8Array(rule.cells)
  const top = new Uint8Array(husk.columns)
  const own = new Uint8Array(husk.columns)
  let smallestHusk = Number.POSITIVE_INFINITY
  let smallestBulk = Number.POSITIVE_INFINITY
  let emptyBeats = 0
  let killed = 0
  let died = 0

  for (const p of list) {
    const c = coneOf(rule, frames, x0, p)
    let b = 0
    let h = 0

    own.fill(0)

    for (let x = 0; x < rule.cells; x++) {
      if (c.firstAt[x] === -1) continue

      b++
      bulk[x] = 1

      const col = husk.column[x] as number

      if (!own[col]) {
        own[col] = 1
        h++
      }

      top[col] = 1
    }

    smallestHusk = Math.min(smallestHusk, h)
    smallestBulk = Math.min(smallestBulk, b)

    for (let t = 0; t < c.sizes.length; t++) emptyBeats += c.sizes[t] === 0 ? 1 : 0

    killed += c.killed
    died += c.sizes[c.sizes.length - 1] === 0 ? 1 : 0
  }

  return {
    perturbations: list.length,
    bulk,
    husk: top,
    bulkCount: bulk.reduce((m, n) => m + n, 0),
    huskCount: top.reduce((m, n) => m + n, 0),
    smallestHusk: list.length ? smallestHusk : 0,
    smallestBulk: list.length ? smallestBulk : 0,
    emptyBeats,
    killed,
    died,
  }
}

// ---- the union reading: every dock at every beat, joined to every dock one change of it reaches one beat later ----
//
// The transitive closure of dependence is built from one-beat links, because every multi-beat difference passes
// through a chain of one-beat ones. A dock already joined to all 24 docks its slots are copied into is skipped: no
// change of it can add a join.

export function unionReading(rule: DockRule, husk: BoxHusk, frames: readonly State[]): { bulk: number; husk: number; changesTried: number } {
  const bulk = forest(rule.cells)
  const f = rule.dockFields
  const ld = new Int16Array(Math.max(1, f))
  const rd = new Int16Array(Math.max(1, f))
  const lv = new Int8Array(24)
  const la = new Int16Array(24)
  const rv = new Int8Array(24)
  const ra = new Int16Array(24)
  const into = new Int32Array(24)
  let changesTried = 0

  for (let t = 0; t < frames.length - 1; t++) {
    const s = frames[t] as State

    for (let x = 0; x < rule.cells; x++) {
      for (let d = 0; d < 24; d++) into[d] = ((rule.target[x * 24 + d] as number) / 24) | 0

      const done = (): boolean => {
        const r = rootOf(bulk, x)

        for (let d = 0; d < 24; d++) if (rootOf(bulk, into[d] as number) !== r) return false

        return true
      }

      if (done()) continue

      const v0 = s.v.slice(x * 24, x * 24 + 24)
      const a0 = s.a.slice(x * 24, x * 24 + 24)
      const d0 = s.d.slice(x * f, x * f + f)

      rv.set(v0)
      ra.set(a0)
      if (f > 0) rd.set(d0)
      rule.collide(t, rv, ra, rd.subarray(0, f))

      for (const p of rule.perturbations(v0, a0, d0)) {
        lv.set(v0)
        la.set(a0)
        if (f > 0) ld.set(d0)
        applyPerturbation(p, lv, la, ld)
        rule.collide(t, lv, la, ld.subarray(0, f))
        changesTried++

        let joined = false

        for (let d = 0; d < 24; d++) {
          if (rule.slotDiffers(lv[d] as number, la[d] as number, rv[d] as number, ra[d] as number)) {
            join(bulk, x, into[d] as number)
            joined = true
          }
        }

        if (joined && done()) break
      }
    }
  }

  const top = forest(husk.columns)

  for (let x = 0; x < rule.cells; x++) join(top, husk.column[x] as number, husk.column[rootOf(bulk, x)] as number)

  return { bulk: componentCount(bulk), husk: componentCount(top), changesTried }
}

// ---- the cover count: seeds taken in order until their cones cover the husk ----

export function coverCount(rule: DockRule, husk: BoxHusk, frames: readonly State[], first: number, limit: number): { seeds: number; covered: number; complete: boolean } {
  const covered = new Uint8Array(husk.columns)
  let seeds = 0
  let x0 = first

  while (seeds < limit) {
    const c = seedCone(rule, husk, frames, x0)

    seeds++

    for (let k = 0; k < husk.columns; k++) covered[k] = (covered[k] as number) | (c.husk[k] as number)

    let nextSeed = -1

    for (let x = 0; x < rule.cells && nextSeed === -1; x++) if (!covered[husk.column[x] as number]) nextSeed = x

    if (nextSeed === -1) return { seeds, covered: husk.columns, complete: true }

    x0 = nextSeed
  }

  return { seeds, covered: covered.reduce((m, n) => m + n, 0), complete: false }
}

// ---- the free star: the docks a lone value copied straight along each of the 24 roots visits, k = 0 .. beats ----

export function freeStar(mesh: Mesh, husk: BoxHusk, x0: number, beats: number): { bulk: Uint8Array; huskCount: number; bulkCount: number } {
  const bulk = new Uint8Array(mesh.cellCount)
  const top = new Uint8Array(husk.columns)

  bulk[x0] = 1
  top[husk.column[x0] as number] = 1

  for (let d = 0; d < 24; d++) {
    let x = x0

    for (let k = 1; k <= beats; k++) {
      x = mesh.neighbour(x, d)
      bulk[x] = 1
      top[husk.column[x] as number] = 1
    }
  }

  return { bulk, huskCount: top.reduce((m, n) => m + n, 0), bulkCount: bulk.reduce((m, n) => m + n, 0) }
}

// ---- the rules ----

const TRITS = [-1, 0, 1]

function vibeChanges(v: Int8Array, a: Int16Array): Perturbation[] {
  const out: Perturbation[] = []

  for (let d = 0; d < 24; d++) for (const w of TRITS) if (w !== v[d]) out.push({ kind: 'slot', index: d, v: w, a: a[d] as number })

  return out
}

// a tone-only knit: one Collision per beat, slots carry nothing else
export function toneRule(name: string, mesh: Mesh, target: Int32Array, forward: (t: number) => Collision): DockRule {
  const scratch = new Int8Array(24)

  return {
    name,
    cells: mesh.cellCount,
    dockFields: 0,
    target,
    auxMove: undefined,
    collide(t, v) {
      scratch.set(v)
      forward(t)(scratch, 0, 24)
      v.set(scratch)
    },
    slotDiffers: (v1, _a1, v2) => v1 !== v2,
    dockDiffers: () => false,
    perturbations: (v, a) => vibeChanges(v, a),
  }
}

// the hub vacuum's knit (code/measure/bounce-pair-kernel): per slot a vibe and its role point, per line a store trit
// and its unit's point. A point is read only on a held slot or a held store, so a change there counts only then.
export function hubRule(kernel: BounceKernel, name = 'hub'): DockRule {
  const points = (kernel.move[0] as Int8Array).length
  const s: Reduced = { vibe: new Int8Array(24), point: new Int8Array(24), store: new Int8Array(12), spoint: new Int8Array(12) }

  return {
    name,
    cells: kernel.cells,
    dockFields: 24,
    target: kernel.target,
    auxMove: (slot, value) => (kernel.move[slot] as Int8Array)[value] as number,
    collide(t, v, a, d) {
      for (let k = 0; k < 24; k++) {
        s.vibe[k] = v[k] as number
        s.point[k] = a[k] as number
      }

      for (let l = 0; l < 12; l++) {
        s.store[l] = d[l] as number
        s.spoint[l] = d[12 + l] as number
      }

      collideBounce(kernel, s, 0, t)

      for (let k = 0; k < 24; k++) {
        v[k] = s.vibe[k] as number
        a[k] = s.point[k] as number
      }

      for (let l = 0; l < 12; l++) {
        d[l] = s.store[l] as number
        d[12 + l] = s.spoint[l] as number
      }
    },
    slotDiffers: (v1, a1, v2, a2) => v1 !== v2 || (v1 !== 0 && a1 !== a2),
    dockDiffers(d1, o1, d2, o2) {
      for (let l = 0; l < 12; l++) {
        const s1 = d1[o1 + l] as number

        if (s1 !== d2[o2 + l]) return true
        if (s1 !== 0 && d1[o1 + 12 + l] !== d2[o2 + 12 + l]) return true
      }

      return false
    },
    // every other value of each slot (calm, or love or fear at any point) and of each line's store (empty, or a unit of
    // either sign at any point): exhaustive and symmetric in the three vibes
    perturbations(v, a, d) {
      const out: Perturbation[] = []

      for (let k = 0; k < 24; k++) {
        if (v[k] !== 0) out.push({ kind: 'slot', index: k, v: 0, a: a[k] as number })

        for (const w of [1, -1]) for (let p = 0; p < points; p++) if (!(w === v[k] && p === a[k])) out.push({ kind: 'slot', index: k, v: w, a: p })
      }

      for (let l = 0; l < 12; l++) {
        if (d[l] !== 0) out.push({ kind: 'dock', index: l, v: 0, a: 0, index2: 12 + l, a2: d[12 + l] as number })

        for (const w of [1, -1]) for (let p = 0; p < points; p++) if (!(w === d[l] && p === d[12 + l])) out.push({ kind: 'dock', index: l, v: 0, a: w, index2: 12 + l, a2: p })
      }

      return out
    },
  }
}

// the cold quaternion knits (code/rule/cold-quaternion-knit, no labels): per slot a tone and its kinetic store (a
// whole number, zero on calm), per dock six couple counters (whole numbers). A store or counter is changed by one unit
// either way (they are unbounded, so "every other value" is taken as the nearest ones); a new tone carries store 0 or 1.
export function coldRule(name: string, mesh: Mesh, target: Int32Array, knit: ColdQuaternionKnit): DockRule {
  const arrays = { vibe: new Int8Array(24), store: new Int32Array(24), counter: new Int32Array(6), role: undefined, token: undefined }

  return {
    name,
    cells: mesh.cellCount,
    dockFields: 6,
    target,
    auxMove: undefined,
    collide(_t, v, a, d) {
      for (let k = 0; k < 24; k++) {
        arrays.vibe[k] = v[k] as number
        arrays.store[k] = a[k] as number
      }

      for (let c = 0; c < 6; c++) arrays.counter[c] = d[c] as number

      coldQuaternionCollide(knit, arrays, 0, true)

      for (let k = 0; k < 24; k++) {
        v[k] = arrays.vibe[k] as number

        const st = arrays.store[k] as number

        if (st > 32767 || st < -32768) throw new Error('store outside 16 bits')

        a[k] = st
      }

      for (let c = 0; c < 6; c++) {
        const n = arrays.counter[c] as number

        if (n > 32767 || n < -32768) throw new Error('counter outside 16 bits')

        d[c] = n
      }
    },
    slotDiffers: (v1, a1, v2, a2) => v1 !== v2 || a1 !== a2,
    dockDiffers(d1, o1, d2, o2) {
      for (let c = 0; c < 6; c++) if (d1[o1 + c] !== d2[o2 + c]) return true

      return false
    },
    perturbations(v, a, d) {
      const out: Perturbation[] = []

      for (let k = 0; k < 24; k++) {
        const s = a[k] as number

        if (v[k] === 0) {
          for (const w of [1, -1]) for (const st of [0, 1]) out.push({ kind: 'slot', index: k, v: w, a: st })
        } else {
          out.push({ kind: 'slot', index: k, v: 0, a: 0 })
          out.push({ kind: 'slot', index: k, v: -(v[k] as number), a: s })
          out.push({ kind: 'slot', index: k, v: v[k] as number, a: s + 1 })
          if (s > 0) out.push({ kind: 'slot', index: k, v: v[k] as number, a: s - 1 })
        }
      }

      for (let c = 0; c < 6; c++) {
        out.push({ kind: 'dock', index: c, v: 0, a: (d[c] as number) + 1 })
        if ((d[c] as number) > 0) out.push({ kind: 'dock', index: c, v: 0, a: (d[c] as number) - 1 })
      }

      return out
    },
  }
}

// ---- the control collisions ----

const wrap3 = (n: number): number => ((((n + 1) % 3) + 3) % 3) - 1

// LINEAR MIXING: every slot gains the dock's sum, mod 3 on the trits -1, 0, 1. A bijection (the sum is kept, since
// 25 = 1 mod 3, so the inverse subtracts it), and one changed slot changes all 24.
export const linearMixing: Collision = (slots, base) => {
  let sum = 0

  for (let d = 0; d < 24; d++) sum += slots[base + d] as number

  for (let d = 0; d < 24; d++) slots[base + d] = wrap3((slots[base + d] as number) + sum)
}

// CONSTANT OVERWRITE: every slot becomes love, whatever it held. Not a bijection: it erases.
export const constantLove: Collision = (slots, base) => {
  for (let d = 0; d < 24; d++) slots[base + d] = 1
}
