// A difference engine for the cold weave (code/rule/cold-weave, E-FLD-0032) on the unbounded D4 lattice.
//
// The cold weave's dock holds more than 24 vibes: each slot also carries a kinetic store, and each line a
// counter (the demon), so the difference engine of E-CMP-0015, which stores 24 vibes per dock, cannot run
// it. The idea is the same. The cold vacuum is born empty with empty counters and never changes (E-FLD-0032,
// checked again here at construction on every beat of the period), so a dock differs from the vacuum only
// if it holds a tone, a store or a counter. The engine keeps just those docks, collides them with the
// weave's own dock collision (coldDockCollide, imported, not copied), and streams every tone and store one
// root along its direction; counters stay in their dock. Docks are addressed by basis coordinates
// (code/substrate/d4-box), as in code/compute/difference-engine, whose ROOT_STEPS it reuses.
//
// Exact by construction; E-FRC-0171 checks it against coldBeat on a wrapping box, slot by slot.

import { type ColdWeave, coldDockCollide } from '@/code/rule/cold-weave'
import { ROOT_STEPS } from '@/code/compute/difference-engine'

export type ColdDock = {
  readonly vibe: Int8Array
  readonly store: Int32Array
  readonly demon: Int32Array
}

export class ColdOverflow extends Error {
  constructor(readonly docks: number, readonly beat: number) {
    super(`cold difference engine: more than ${docks} docks differ from the vacuum at beat ${beat}`)
  }
}

export type ColdDifferenceEngine = {
  readonly beat: () => number
  readonly set: (coords: readonly number[], dock: ColdDock) => void
  readonly step: () => void
  readonly support: () => { docks: number; slots: number }
  readonly forEach: (visit: (coords: readonly number[], dock: ColdDock) => void) => void
  readonly signature: () => { key: string; anchor: number[] }
}

const keyOf = (c: readonly number[]): string => `${c[0]},${c[1]},${c[2]},${c[3]}`
const empty = (): ColdDock => ({ vibe: new Int8Array(24), store: new Int32Array(24), demon: new Int32Array(12) })
const isVacuum = (d: ColdDock): boolean => d.vibe.every(x => x === 0) && d.store.every(x => x === 0) && d.demon.every(x => x === 0)

// `side` undefined is the unbounded lattice; a side wraps the basis coordinates mod side, which is exactly
// d4BoxMesh's box of that side (the mode the exactness check runs in)
export function makeColdDifferenceEngine(input: { weave: ColdWeave; maxDocks?: number; startBeat?: number; period?: number; side?: number }): ColdDifferenceEngine {
  const { weave, side } = input
  const maxDocks = input.maxDocks ?? 1 << 18
  const period = input.period ?? 24
  const wrap = (x: number): number => (side === undefined ? x : ((x % side) + side) % side)

  // the fact the engine rests on: an empty dock collides to an empty dock at every beat
  for (let t = 0; t < period; t++) {
    const a = { ...empty(), role: undefined }

    coldDockCollide(weave, a, 0, t, true)

    if (!isVacuum(a)) {
      throw new Error(`cold difference engine: the empty dock does not stay empty at beat ${t}`)
    }
  }

  let beat = input.startBeat ?? 0
  let docks = new Map<string, { coords: number[]; dock: ColdDock }>()

  const set = (coords: readonly number[], dock: ColdDock): void => {
    const c = coords.map(wrap)

    docks.set(keyOf(c), { coords: c, dock: { vibe: Int8Array.from(dock.vibe), store: Int32Array.from(dock.store), demon: Int32Array.from(dock.demon) } })
  }

  const step = (): void => {
    const next = new Map<string, { coords: number[]; dock: ColdDock }>()
    const at = (coords: number[]): ColdDock => {
      const k = keyOf(coords)
      let entry = next.get(k)

      if (!entry) {
        if (next.size >= maxDocks) {
          throw new ColdOverflow(maxDocks, beat)
        }

        entry = { coords, dock: empty() }
        next.set(k, entry)
      }

      return entry.dock
    }

    for (const { coords, dock } of docks.values()) {
      const a = { vibe: Int8Array.from(dock.vibe), store: Int32Array.from(dock.store), demon: Int32Array.from(dock.demon), role: undefined }

      coldDockCollide(weave, a, 0, beat, true)

      if (a.demon.some(x => x !== 0)) {
        at(coords).demon.set(a.demon)
      }

      for (let k = 0; k < 24; k++) {
        if ((a.vibe[k] ?? 0) === 0 && (a.store[k] ?? 0) === 0) {
          continue
        }

        const step = ROOT_STEPS[k] ?? []
        const target = at(coords.map((x, i) => wrap(x + (step[i] ?? 0))))

        target.vibe[k] = a.vibe[k] ?? 0
        target.store[k] = a.store[k] ?? 0
      }
    }

    docks = next
    beat += 1
  }

  const support = (): { docks: number; slots: number } => {
    let slots = 0

    for (const { dock } of docks.values()) {
      for (let k = 0; k < 24; k++) {
        slots += (dock.vibe[k] ?? 0) !== 0 || (dock.store[k] ?? 0) !== 0 ? 1 : 0
      }

      for (let k = 0; k < 12; k++) {
        slots += (dock.demon[k] ?? 0) !== 0 ? 1 : 0
      }
    }

    return { docks: docks.size, slots }
  }

  const forEach = (visit: (coords: readonly number[], dock: ColdDock) => void): void => {
    for (const { coords, dock } of docks.values()) {
      visit(coords, dock)
    }
  }

  const signature = (): { key: string; anchor: number[] } => {
    const rows = [...docks.values()].map(({ coords, dock }) => ({ c: coords, s: `${Array.from(dock.vibe).join('')}|${Array.from(dock.store).join('.')}|${Array.from(dock.demon).join('.')}` }))
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

    return { key: rows.map(r => `${r.c.map((x, k) => x - (anchor[k] ?? 0)).join(',')}:${r.s}`).join(';'), anchor: [...anchor] }
  }

  return { beat: () => beat, set, step, support, forEach, signature }
}
