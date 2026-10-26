// ONE MESH LINE OF THE WORKING RULE, AS A PLACE FOR A BARRIER (E-QTM-0187). The working rule (code/rule/coined-locked-knit
// coinedVetoBeat, veto 'none', tables on the pass contact, every link the identity) run on a box whose only content sits
// on one mesh line through the center: the line's docks in order (a ring of `cells.length` docks), the vibes on the
// line's two slots of each dock, and the stored pairs on the line. By the line law (E-SPN-0098, E-QTM-0157 gate F)
// content on the other lines of a dock never reaches this line, so a box holding content on this line only is the
// line's own dynamics.
//
// What is read here, never written into the rule: where each closed vibe is at every beat, how many stored pairs the
// line holds, and for a lone open vibe, its reduced state on the line (the environment traced out), so how much of its
// coherence the line's other content keeps.
//
// Exact in Z[w][1/2] (the rule's own numbers); floats only in the purity printed for a report.

import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { vacuumConfiguration } from '@/code/measure/doublet-locked-readings'
import { toWords } from '@/code/rule/occupation-veto-knit'
import { coinedVetoBeat } from '@/code/rule/coined-locked-knit'
import { LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  lockedState,
  lockedTables,
  type Branch,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import type { WalkState } from '@/code/rule/fear-walk'

export type LineBox = {
  readonly cells: readonly number[]
  readonly index: ReadonlyMap<number, number>
  readonly slot: number
  readonly back: number
  readonly line: number
  readonly tables: LockedTables
  readonly blank: () => Configuration
}

// the box of side `side`, the mesh line through its center along `slot`, every link the identity
export function lineBox(side: number, slot: number): LineBox {
  const f = contactFresh(side, 'pass')
  const center = centerOf(side)
  const cells: number[] = []

  let x = center

  do {
    cells.push(x)
    x = f.weave.mesh.neighbour(x, slot)
  } while (x !== center && cells.length < 4096)

  const tables = lockedTables(
    f.weave,
    'pass',
    new Int16Array(f.cells * 24).fill(f.weave.moves.identity),
  )

  return {
    cells,
    index: new Map(cells.map((c, i) => [c, i])),
    slot,
    back: OPPOSITE[slot]!,
    line: LINE_OF[slot]!,
    tables,
    blank: () =>
      toWords(
        vacuumConfiguration(
          {
            cells: f.cells,
            store: new Int8Array(f.store.length),
            layout: f.layout,
          },
          'none',
        ),
      ),
  }
}

export type LineVibe = {
  readonly dock: number
  readonly forward: boolean
  readonly value: 1 | -1
  readonly open: boolean
}

export type LineStore = { readonly dock: number; readonly tau: 1 | -1 }

// a configuration with the given vibes and closed stored pairs on the line, nothing else
export function lineConfiguration(
  box: LineBox,
  vibes: readonly LineVibe[],
  stores: readonly LineStore[],
): Configuration {
  const c = box.blank()
  const n = box.cells.length

  for (const v of vibes) {
    const i = box.cells[((v.dock % n) + n) % n]! * 24 + (v.forward ? box.slot : box.back)

    c.vibe[i] = v.value
    c.open[i] = v.open ? 1 : 0
  }

  for (const s of stores) {
    const l = box.cells[((s.dock % n) + n) % n]! * 12 + box.line

    c.store[l] = s.tau
    c.sopen[l] = 0
  }

  return c
}

export const lineBeat = (
  box: LineBox,
  s: LockedState,
  t: number,
): LockedState => coinedVetoBeat('none', box.tables, s, t)

export type LineSnapshot = {
  readonly vibes: LineVibe[]
  readonly stores: number[]
  // content anywhere off the line (should never appear)
  readonly offLine: number
}

export function lineSnapshot(box: LineBox, b: Branch): LineSnapshot {
  const vibes: LineVibe[] = []
  const stores: number[] = []

  let offLine = 0

  for (let i = 0; i < b.vibe.length; i++) {
    const v = b.vibe[i]!

    if (v === 0) {
      continue
    }

    const dock = box.index.get(Math.floor(i / 24))
    const d = i % 24

    if (dock === undefined || (d !== box.slot && d !== box.back)) {
      offLine++
      continue
    }

    vibes.push({
      dock,
      forward: d === box.slot,
      value: v > 0 ? 1 : -1,
      open: b.open[i] === 1,
    })
  }

  for (let i = 0; i < b.store.length; i++) {
    if (b.store[i] === 0) {
      continue
    }

    const dock = box.index.get(Math.floor(i / 12))

    if (dock === undefined || i % 12 !== box.line) {
      offLine++
      continue
    }

    stores.push(dock)
  }

  return { vibes, stores, offLine }
}

// the docks of a lone closed vibe at beats 0..beats (a classical run: one branch every beat)
export function closedVibeTrack(
  box: LineBox,
  vibe: LineVibe,
  beats: number,
): { docks: number[]; branchesMax: number; offLine: number } {
  let s = lockedState(lineConfiguration(box, [vibe], []))

  const docks = [vibe.dock]

  let branchesMax = 1
  let offLine = 0

  for (let t = 1; t <= beats; t++) {
    s = lineBeat(box, s, t - 1)
    branchesMax = Math.max(branchesMax, s.branches.length)

    const snap = lineSnapshot(box, s.branches[0]!)

    offLine += snap.offLine
    docks.push(snap.vibes.length === 1 ? snap.vibes[0]!.dock : -1)
  }

  return { docks, branchesMax, offLine }
}

// a wall of closed stored pairs on docks [from, from + width): the number of stores and the vibes on the line at
// every beat (a classical run)
export function storeWallRun(
  box: LineBox,
  from: number,
  width: number,
  beats: number,
): { stores: number[]; vibes: number[]; branchesMax: number; offLine: number } {
  const wall: LineStore[] = Array.from({ length: width }, (_, k) => ({
    dock: from + k,
    tau: 1 as const,
  }))

  let s = lockedState(lineConfiguration(box, [], wall))

  const stores = [width]
  const vibes = [0]

  let branchesMax = 1
  let offLine = 0

  for (let t = 1; t <= beats; t++) {
    s = lineBeat(box, s, t - 1)
    branchesMax = Math.max(branchesMax, s.branches.length)

    const snap = lineSnapshot(box, s.branches[0]!)

    offLine += snap.offLine
    stores.push(snap.stores.length)
    vibes.push(snap.vibes.length)
  }

  return { stores, vibes, branchesMax, offLine }
}

// the rule's state of one open vibe and no other content, against the fear walk's weights (Eisenstein integers over
// 2^t, docks counted along the line from the box's center), bit for bit
export function matchesFearWalk(
  box: LineBox,
  s: LockedState,
  walk: WalkState,
  t: number,
): boolean {
  const seen = new Set<string>()

  for (const b of s.branches) {
    const snap = lineSnapshot(box, b)

    if (snap.offLine > 0 || snap.stores.length > 0 || snap.vibes.length !== 1) {
      return false
    }

    const v = snap.vibes[0]!
    const w = (v.forward ? walk.right : walk.left)[v.dock]!
    const id = `${v.dock}:${v.forward}`

    if (b.k > t || seen.has(id)) {
      return false
    }

    const scale = 1n << BigInt(t - b.k)

    if (b.a * scale !== w[0] || b.b * scale !== w[1]) {
      return false
    }

    seen.add(id)
  }

  const nonzero = [...walk.right, ...walk.left].filter(
    w => w[0] !== 0n || w[1] !== 0n,
  ).length

  return nonzero === seen.size
}

const cx = (a: bigint, b: bigint, k: number): [number, number] => {
  const s = 2 ** -k

  return [(Number(a) - Number(b) / 2) * s, ((Number(b) * Math.sqrt(3)) / 2) * s]
}

// the reduced state of the line's one OPEN vibe, the rest of the configuration traced out: its purity, and the number
// of distinct environments (configurations with the open vibe removed) among the branches. Purity 1 with one
// environment is a lone walk; an environment that differs between the vibe's positions has read them
export function openVibePurity(
  box: LineBox,
  s: LockedState,
): { purity: number; environments: number; norm: number } {
  type Entry = { pos: string; re: number; im: number }

  const byEnv = new Map<string, Entry[]>()

  let norm = 0

  for (const b of s.branches) {
    let pos = ''

    const envVibe = Int8Array.from(b.vibe)

    for (let i = 0; i < b.vibe.length; i++) {
      if (b.vibe[i] !== 0 && b.open[i] === 1) {
        pos += `${i},`
        envVibe[i] = 0
      }
    }

    for (let i = 0; i < b.store.length; i++) {
      if (b.store[i] !== 0 && b.sopen[i] !== 0) {
        pos += `s${i},`
      }
    }

    const key = `${envVibe.join('')}|${Array.from(b.store, (v, i) => (b.sopen[i] !== 0 ? 0 : v)).join('')}`
    const [re, im] = cx(b.a, b.b, b.k)

    norm += re * re + im * im

    const list = byEnv.get(key) ?? []

    list.push({ pos, re, im })
    byEnv.set(key, list)
  }

  // rho(x, x') = sum_env psi(x, env) psi*(x', env) / norm; purity = sum |rho|^2
  const rho = new Map<string, [number, number]>()

  for (const list of byEnv.values()) {
    for (const p of list) {
      for (const q of list) {
        const id = `${p.pos}|${q.pos}`
        const r = rho.get(id) ?? [0, 0]

        rho.set(id, [r[0] + p.re * q.re + p.im * q.im, r[1] + p.im * q.re - p.re * q.im])
      }
    }
  }

  let purity = 0

  for (const [re, im] of rho.values()) {
    purity += re * re + im * im
  }

  return { purity: purity / (norm * norm), environments: byEnv.size, norm }
}
