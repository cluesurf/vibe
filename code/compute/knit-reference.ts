// The dense reference the scale engines (E-CMP-0015, E-CMP-0016) are checked against, and the knits and
// seeds they run.
//
// THE REFERENCE is the lattice gas of code/rule/lattice-gas on d4BoxMesh, every dock collided with the
// beat's collision and every slot streamed through the box's gather table, exactly as E-FRC-0158 runs its
// reference. Brute force: its cost is the box's volume at every beat.
//
// THE KNITS, both scheduled with period 24:
// - committed: the turning weave of code/rule/collision (turningWeave, the pair table)
// - combined: code/rule/combined-knit with COMBINED_DEFAULT (the head-on turn base with the four-line
//   scatter block, no fold, no steering: the dock-level collision E-FRC-0158 builds and checks)
//
// THE SEEDS, each at the origin dock at beat 0 on the empty-born vacuum:
// - a lone vibe: a love (or a fear) on one direction
// - a meson seed: a love on direction 0 and a fear on direction 12, two lines, charge 0
// - a knot seed: loves on directions 0, 8 and 16, three lines, charge 3 = 0 mod 3 (the color-neutral triple)
// - a blob: every dock within two roots of the origin in a golden-ratio fill (-1, 0, 1), a dense start
// These are seeds, the smallest configurations with those charges. The base knits bind nothing without
// steering, so what the engines follow is how each seed dresses the vacuum.

import { collide, streamSourceTable } from '@/code/rule/lattice-gas'
import { type Collision, turningWeave } from '@/code/rule/collision'
import { combinedCollision, COMBINED_DEFAULT } from '@/code/rule/combined-knit'
import { d4BoxCell, d4BoxMesh, d4Coordinates } from '@/code/substrate/d4-box'
import { meshOpposites, type Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'

export const KNIT_PERIOD = 24
const GOLDEN = (Math.sqrt(5) - 1) / 2

export type KnitName = 'committed' | 'combined'

const OPPOSITE = meshOpposites(d4BoxMesh({ side: 3 }))

export function knitForward(name: KnitName): (t: number) => Collision {
  return name === 'committed' ? turningWeave({ opposite: OPPOSITE }) : combinedCollision({ spec: COMBINED_DEFAULT, opposite: OPPOSITE })
}

// a seed: docks by basis coordinates (code/substrate/d4-box) with their full 24-slot states on the empty
// vacuum of beat 0
export type Seed = { readonly name: string; readonly docks: readonly { readonly coords: readonly number[]; readonly state: Int8Array }[] }

const dockWith = (entries: readonly (readonly [number, number])[]): Int8Array => {
  const state = new Int8Array(24)

  for (const [d, v] of entries) {
    state[d] = v
  }

  return state
}

export function loneSeed(direction: number, tone: number): Seed {
  return { name: `${tone > 0 ? 'love' : 'fear'}${direction}`, docks: [{ coords: [0, 0, 0, 0], state: dockWith([[direction, tone]]) }] }
}

export const MESON_SEED: Seed = { name: 'meson', docks: [{ coords: [0, 0, 0, 0], state: dockWith([[0, 1], [12, -1]]) }] }
export const KNOT_SEED: Seed = { name: 'knot', docks: [{ coords: [0, 0, 0, 0], state: dockWith([[0, 1], [8, 1], [16, 1]]) }] }

export function blobSeed(radius = 2): Seed {
  const roots = rootsD4()
  const seen = new Map<string, number[]>([['0,0,0,0', [0, 0, 0, 0]]])
  let frontier = [[0, 0, 0, 0]]

  for (let r = 0; r < radius; r++) {
    const next: number[][] = []

    for (const v of frontier) {
      for (const root of roots) {
        const w = v.map((x, k) => x + (root[k] ?? 0))
        const key = w.join(',')

        if (!seen.has(key)) {
          seen.set(key, w)
          next.push(w)
        }
      }
    }

    frontier = next
  }

  const docks = [...seen.values()].map((v, n) => {
    const state = new Int8Array(24)

    for (let d = 0; d < 24; d++) {
      const u = ((n * 24 + d + 1) * GOLDEN * 1.37) % 1

      state[d] = u < 0.25 ? -1 : u < 0.75 ? 0 : 1
    }

    return { coords: d4Coordinates(v), state }
  })

  return { name: `blob${radius}`, docks }
}

// the dense box run
export type BoxRun = {
  readonly mesh: Mesh
  readonly side: number
  readonly data: () => Int8Array
  readonly step: () => void
  readonly beat: () => number
}

export function boxRun(input: { forward: (t: number) => Collision; side: number; seed: Seed; center: readonly number[] }): BoxRun {
  const { forward, side, seed, center } = input
  const mesh = d4BoxMesh({ side })
  const table = streamSourceTable(mesh)

  let a = new Int8Array(mesh.cellCount * 24)
  let b = new Int8Array(mesh.cellCount * 24)
  let beat = 0

  for (const dock of seed.docks) {
    const cell = d4BoxCell({ coordinates: dock.coords.map((x, k) => x + (center[k] ?? 0)), side })

    a.set(dock.state, cell * 24)
  }

  return {
    mesh,
    side,
    data: () => a,
    beat: () => beat,
    step: () => {
      collide({ mesh, data: a }, forward(beat))

      for (let i = 0; i < table.length; i++) {
        b[i] = a[table[i] ?? 0] ?? 0
      }

      const swap = a

      a = b
      b = swap
      beat += 1
    },
  }
}
