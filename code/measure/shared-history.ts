// Distance counted in SHARED HISTORY (E-GRV-0072, E-GRV-0073). A pure READING of the relations the rule already makes:
// nothing in the rule is changed or added. Every gravity reading before this one measured nearness by dock position or
// by the current state's correlations, and the settled vacuum is a product state (E-GRV-0064, 0068). Here nearness is
// relational, in the spirit of geometry from entanglement: two places are near when the vibes now in them met recently.
// The relation is fixed once made (the history is what it is), and it has no sign.
//
// WHO IS WHO. Nothing moves: a vibe is a value the slots take from each other. A LABEL follows that value through the
// rule's own pieces, read off the rule, never steering it:
//   the stream         slot s takes the value of the slot behind it, so the label goes to target[s]
//   the coin piece     the dock's slots are permuted by the rule's own bouncePermutation; the labels are permuted alike
//   the pair move      an unmade love and fear go into their line's store, the first slot's label to the store's first
//                      half and the second's to its second half (the store keeps both points, 9 s + q, so it keeps both
//                      vibes); a made pair takes them back, first half to the first slot, second to the second
// Every label is at every beat in exactly one slot or one store half (checked). The rule itself runs in the rule's code
// on a second copy, and the labeled copy must equal it at every beat (checked), so the labels cannot drift from the
// rule.
//
// A MEETING. The rule acts on a dock as a whole: the coin piece reads all 24 slots, the pair move a line's two slots and
// its store. Two vibes MEET at beat t when both are in the slots of one dock at that beat's collision (before it, or
// after it, which adds a pair the pair move just made). The sign of a vibe is never read, so the relation is
// charge-blind by construction.
//
// THE RELATIONAL COUNT at beat T with window W: N_T(A, B) is the number of meetings in [T - W, T), counted per ordered
// label pair and per beat (a pair that meets on three beats counts three), whose first label is now, at T, in husk column
// A and whose second is now in B (in a slot or a store of a dock of that column). Counting meetings rather than distinct
// pairs is the form "the number of meetings linking vibes in A with vibes in B"; it needs no pair table (a side-16
// window holds more than 2^24 distinct pairs, over a Map's limit). Pooled by the minimal-image displacement of B from A
// and divided by the number of columns, it is the mean count per column pair at that displacement.
//
// Reals appear only in the readers. DETERMINISM: no random number anywhere; the start family only. NOTHING MOVES: each
// slot takes its neighbor's value, and a label records which value was taken where.

import {
  bouncePermutation,
  BOUNCE_TABLE,
} from '@/code/rule/bounce-pair-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  cloneConfiguration,
  lockedState,
  newTally,
  sameConfiguration,
  streamConfiguration,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  pairPiece,
  vetoBeat,
  type VetoKind,
} from '@/code/rule/occupation-veto-knit'

const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(
  f => OPPOSITE[f] ?? f,
)

export type Labeled = {
  c: Configuration
  // the label in each slot, -1 for none
  slotLabel: Int32Array
  // the labels in each line's store: [2 L] the first half, [2 L + 1] the second
  storeLabel: Int32Array
  labels: number
}

// label every vibe of a configuration with no open vibe: stored halves first (line order), then slots (slot order)
export function labelConfiguration(c: Configuration): Labeled {
  for (let i = 0; i < c.open.length; i++) {
    if (c.open[i]) {
      throw new Error(
        'shared-history: an open vibe; the reading is written for the classical (closed) vacuum',
      )
    }
  }

  for (let i = 0; i < c.sopen.length; i++) {
    if (c.sopen[i]) {
      throw new Error(
        'shared-history: an open stored pair; the reading is written for the classical (closed) vacuum',
      )
    }
  }

  const slotLabel = new Int32Array(c.vibe.length).fill(-1)
  const storeLabel = new Int32Array(c.store.length * 2).fill(-1)

  let n = 0

  for (let l = 0; l < c.store.length; l++) {
    if (c.store[l] === 0) {
      continue
    }

    storeLabel[2 * l] = n++
    storeLabel[2 * l + 1] = n++
  }

  for (let s = 0; s < c.vibe.length; s++) {
    if (c.vibe[s] !== 0) {
      slotLabel[s] = n++
    }
  }

  return { c: cloneConfiguration(c), slotLabel, storeLabel, labels: n }
}

const PERM = new Int32Array(24)
const SV = new Int8Array(24)
const SP = new Int8Array(24)
const SO = new Uint8Array(24)
const SL = new Int32Array(24)
const BEFORE_STORE = new Int8Array(12)

// the dock whose husk column a label sits in, per label
export function labelDocks(h: Labeled): Int32Array {
  const at = new Int32Array(h.labels).fill(-1)

  for (let s = 0; s < h.slotLabel.length; s++) {
    const u = h.slotLabel[s]!

    if (u >= 0) {
      at[u] = (s / 24) | 0
    }
  }

  for (let k = 0; k < h.storeLabel.length; k++) {
    const u = h.storeLabel[k]!

    if (u >= 0) {
      at[u] = (k / 24) | 0
    }
  }

  return at
}

// every label exactly once, and a label exactly where a vibe or a stored half is
export function labelsSound(h: Labeled): boolean {
  const seen = new Uint8Array(h.labels)

  for (let s = 0; s < h.slotLabel.length; s++) {
    const u = h.slotLabel[s]!

    if (u >= 0 !== (h.c.vibe[s] !== 0)) {
      return false
    }

    if (u >= 0) {
      if (seen[u]) {
        return false
      }

      seen[u] = 1
    }
  }

  for (let k = 0; k < h.storeLabel.length; k++) {
    const u = h.storeLabel[k]!

    if (u >= 0 !== (h.c.store[(k / 2) | 0] !== 0)) {
      return false
    }

    if (u >= 0) {
      if (seen[u]) {
        return false
      }

      seen[u] = 1
    }
  }

  return seen.every(x => x === 1)
}

// one beat of the rule on the labeled configuration: the collision (the pieces in the rule's order, pairPiece the
// rule's own, the coin piece the rule's own permutation), then the stream (the rule's own). `meet(x, labels)` receives,
// per dock with two or more, the labels in its slots before or after the collision.
export function labeledBeat(
  kind: VetoKind,
  t: LockedTables,
  h: Labeled,
  beat: number,
  meet: (x: number, labels: number[]) => void,
): void {
  const c = h.c
  const order = collisionOrder('alternate', beat)
  const present: number[] = []

  for (let x = 0; x < t.cells; x++) {
    const base = x * 24
    const lineBase = x * 12

    present.length = 0

    for (let d = 0; d < 24; d++) {
      const u = h.slotLabel[base + d]!

      if (u >= 0) {
        present.push(u)
      }
    }

    for (const piece of order) {
      if (piece === 'P') {
        for (let l = 0; l < 12; l++) {
          BEFORE_STORE[l] = c.store[lineBase + l]!
        }

        pairPiece(kind, c, x)

        for (let l = 0; l < 12; l++) {
          const before = BEFORE_STORE[l]!
          const after = c.store[lineBase + l]!
          const i = base + LINE_FIRSTS[l]!
          const j = base + LINE_SECONDS[l]!
          const L = lineBase + l

          if (before === 0 && after !== 0) {
            h.storeLabel[2 * L] = h.slotLabel[i]!
            h.storeLabel[2 * L + 1] = h.slotLabel[j]!
            h.slotLabel[i] = -1
            h.slotLabel[j] = -1
          } else if (before !== 0 && after === 0) {
            h.slotLabel[i] = h.storeLabel[2 * L]!
            h.slotLabel[j] = h.storeLabel[2 * L + 1]!
            h.storeLabel[2 * L] = -1
            h.storeLabel[2 * L + 1] = -1
          }
        }
      } else {
        if (
          bouncePermutation(
            BOUNCE_TABLE,
            t.collision,
            c.vibe,
            base,
            PERM,
          ) === 0
        ) {
          continue
        }

        for (let d = 0; d < 24; d++) {
          const to = PERM[d]!

          SV[to] = c.vibe[base + d]!
          SP[to] = c.point[base + d]!
          SO[to] = c.open[base + d]!
          SL[to] = h.slotLabel[base + d]!
        }

        for (let d = 0; d < 24; d++) {
          c.vibe[base + d] = SV[d]!
          c.point[base + d] = SP[d]!
          c.open[base + d] = SO[d]!
          h.slotLabel[base + d] = SL[d]!
        }
      }
    }

    for (let d = 0; d < 24; d++) {
      const u = h.slotLabel[base + d]!

      if (u >= 0 && !present.includes(u)) {
        present.push(u)
      }
    }

    if (present.length >= 2) {
      meet(x, present.slice())
    }
  }

  streamConfiguration(t, c, false)

  const next = new Int32Array(h.slotLabel.length).fill(-1)

  for (let s = 0; s < next.length; s++) {
    const u = h.slotLabel[s]!

    if (u >= 0) {
      next[t.target[s]!] = u
    }
  }

  h.slotLabel = next
}

// ---- one run, read: where every label is at each read beat, then every meeting of each window ----

export type HistoryRun = {
  // the labeled configuration equal to the rule's own (vetoBeat on a second copy) at every beat
  readonly matchesRule: boolean
  // every label exactly once at every beat
  readonly sound: boolean
  // the second pass gave the same configuration at every read beat as the first (the run is deterministic)
  readonly repeatable: boolean
  readonly labels: number
  // meetings (docks with two or more labels) and ordered label pairs per window
  readonly meetings: number[]
  readonly orderedPairs: number[]
}

// Run `start` for max(reads) beats twice. The first pass checks the labels against the rule's own beat and records the
// husk column of every label at each read beat T. The second pass hands `visit(k, A, B)` every ordered pair of labels
// (u, v) that met at a beat t in window k, [reads[k] - window, reads[k]), with A and B the columns u and v sit in at
// reads[k]. Windows may overlap; a meeting is handed to each window it lies in.
export function historyRun(input: {
  kind: VetoKind
  tables: LockedTables
  start: Configuration
  column: Int32Array
  reads: readonly number[]
  window: number
  visit: (k: number, a: number, b: number) => void
  // the column of every label at read k (first pass), when wanted
  onRead?: (k: number, columns: Int32Array) => void
}): HistoryRun {
  const last = Math.max(...input.reads)
  const at: Int32Array[] = []
  const firstPass: Configuration[] = []

  let h = labelConfiguration(input.start)
  let state: LockedState = lockedState(input.start)
  let matchesRule = true
  let sound = labelsSound(h)

  for (let t = 0; t < last; t++) {
    labeledBeat(input.kind, input.tables, h, t, () => {})
    state = vetoBeat(input.kind, input.tables, state, t, newTally())
    matchesRule =
      matchesRule &&
      state.branches.length === 1 &&
      sameConfiguration(state.branches[0]!, h.c)
    sound = sound && labelsSound(h)

    const k = input.reads.indexOf(t + 1)

    if (k >= 0) {
      const docks = labelDocks(h)

      at[k] = Int32Array.from(docks, x => input.column[x]!)
      firstPass[k] = cloneConfiguration(h.c)
      input.onRead?.(k, at[k])
    }
  }

  h = labelConfiguration(input.start)

  const meetings = input.reads.map(() => 0)
  const orderedPairs = input.reads.map(() => 0)

  let repeatable = true

  for (let t = 0; t < last; t++) {
    const open: number[] = []

    input.reads.forEach((T, k) => {
      if (t >= T - input.window && t < T) {
        open.push(k)
      }
    })

    labeledBeat(input.kind, input.tables, h, t, (x, labels) => {
      for (const k of open) {
        const col = at[k]!

        meetings[k]!++
        orderedPairs[k]! += labels.length * (labels.length - 1)

        for (let i = 0; i < labels.length; i++) {
          const a = col[labels[i]!]!

          for (let j = 0; j < labels.length; j++) {
            if (i !== j) {
              input.visit(k, a, col[labels[j]!]!)
            }
          }
        }
      }
    })

    const k = input.reads.indexOf(t + 1)

    if (k >= 0) {
      repeatable = repeatable && sameConfiguration(firstPass[k]!, h.c)
    }
  }

  return {
    matchesRule,
    sound,
    repeatable,
    labels: h.labels,
    meetings,
    orderedPairs,
  }
}

// ---- the husk torus: minimal-image displacements as indices ----

export type Torus = {
  readonly side: number
  readonly columns: number
  // the displacement index of column b from column a
  delta(a: number, b: number): number
  // the minimal-image vector of a displacement index
  readonly vector: Int32Array[]
}

export function torus(side: number): Torus {
  const columns = side ** 3
  const mod = (v: number): number => ((v % side) + side) % side
  const half = (v: number): number => (v > side / 2 ? v - side : v)
  const vector = Array.from({ length: columns }, (_, i) =>
    Int32Array.from([
      half(i % side),
      half(((i / side) | 0) % side),
      half((i / (side * side)) | 0),
    ]),
  )

  return {
    side,
    columns,
    vector,
    delta: (a, b) =>
      mod((b % side) - (a % side)) +
      side *
        mod((((b / side) | 0) % side) - (((a / side) | 0) % side)) +
      side *
        side *
        mod(((b / (side * side)) | 0) - ((a / (side * side)) | 0)),
  }
}

// hops from displacement 0 to every displacement on the torus with the given step set (-1 where unreached)
export function hopDistances(
  t: Torus,
  steps: readonly number[],
): Int32Array {
  const hops = new Int32Array(t.columns).fill(-1)
  const vec = steps.map(s => t.vector[s]!)
  const s = t.side
  const mod = (v: number): number => ((v % s) + s) % s

  let front = [0]

  hops[0] = 0

  for (let d = 1; front.length > 0; d++) {
    const next: number[] = []

    for (const i of front) {
      const x = i % s
      const y = ((i / s) | 0) % s
      const z = (i / (s * s)) | 0

      for (const v of vec) {
        const j =
          mod(x + v[0]!) + s * mod(y + v[1]!) + s * s * mod(z + v[2]!)

        if (hops[j] === -1) {
          hops[j] = d
          next.push(j)
        }
      }
    }

    front = next
  }

  return hops
}
