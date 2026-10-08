// THE CANDIDATE RULE'S READINGS (E-SPN-0134). note/project/vibe/roadmap/research/remaining-pieces.md, "The link holonomy
// (E-SPN-0132)": the candidate rule for 3d motion is FLAT links, a filled LOVE SEA as the vacuum, and E-SPN-0130's
// fermionic frame mixer. These are the readings an audit of what that rule breaks needs: the candidate beat itself (the
// mixer first, then the working keyed beat, E-SPN-0132's run), the front of a difference, the image of a run under
// charge conjugation and under particle-hole exchange, and the per-column charge and energy a husk field reads.
//
// DETERMINISM: every start is placed and every choice is the key's integer. EXACT: configurations compared slot for slot;
// the husk fields (code/measure/energy-lines staticDepth) are floats and only read. NOTHING MOVES: the mixer hands a vibe
// to an empty slot of its own frame on its own dock; the stream takes each value one dock along.

import {
  cloneConfiguration,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
import { type PathKey } from '@/code/measure/full-key-paths'
import { starBeat, type KEvent } from '@/code/measure/hub-star'
import {
  keyedFermionMix,
  newFermionTally,
  type FermionTally,
} from '@/code/measure/pauli-mixer'
import { type BoxHusk } from '@/code/measure/causal-components'
import { addColumns, staticDepth } from '@/code/measure/energy-lines'

export type CandidateRun = {
  tally: FermionTally
  kEvents: number
  last: Configuration
}

// the candidate beat on a start for `beats` beats: the fermionic mixer (on or off), then the working keyed beat
// (code/measure/hub-star starBeat: coin, meeting, 'pass' contact with K, veto 'none', stream); `each` sees the state after
// every beat (t is the beat just run)
export function candidateRun(input: {
  tables: LockedTables
  start: Configuration
  key: PathKey
  beats: number
  mix: boolean
  each?: (t: number, c: Configuration) => void
  threshold?: number
}): CandidateRun {
  const {
    tables,
    start,
    key,
    beats,
    mix,
    each,
    threshold = THRESHOLD_BORN,
  } = input

  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)

  const tally = newFermionTally()
  const events: KEvent[] = []

  for (let t = 0; t < beats; t++) {
    keyedFermionMix(tables, a, key, t, mix, tally)
    starBeat(tables, a, b, key, threshold, t, events)
    ;[a, b] = [b, a]

    if (each) {
      each(t, a)
    }
  }

  return { tally, kEvents: events.length, last: a }
}

// the docks where two configurations differ (a slot's vibe, or a held slot's point, or a store)
function differingDocks(
  a: Configuration,
  b: Configuration,
  cells: number,
): number[] {
  const out: number[] = []

  for (let x = 0; x < cells; x++) {
    let here = false

    for (let d = 0; d < 24 && !here; d++) {
      const i = x * 24 + d

      if (
        a.vibe[i] !== b.vibe[i] ||
        (a.vibe[i] !== 0 && a.point[i] !== b.point[i])
      ) {
        here = true
      }
    }

    for (let l = 0; l < 12 && !here; l++) {
      if (a.store[x * 12 + l] !== b.store[x * 12 + l]) {
        here = true
      }
    }

    if (here) {
      out.push(x)
    }
  }

  return out
}

// the farthest dock (in `steps`, e.g. code/measure/full-key-paths boxSteps from the start dock) at which two
// configurations differ; -1 when they agree everywhere
export function frontReach(
  a: Configuration,
  b: Configuration,
  cells: number,
  steps: Int32Array,
): number {
  return differingDocks(a, b, cells).reduce(
    (m, x) => Math.max(m, steps[x]!),
    -1,
  )
}

// a start beside its reference in lockstep under the candidate beat: per beat, the farthest dock (in `steps`) where they
// differ, the front of the start's disturbance
export function lockstepFront(input: {
  tables: LockedTables
  start: Configuration
  reference: Configuration
  key: PathKey
  beats: number
  mix: boolean
  steps: Int32Array
}): number[] {
  const { tables, start, reference, key, beats, mix, steps } = input

  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)
  let p = cloneConfiguration(reference)
  let q = cloneConfiguration(reference)

  const tally = newFermionTally()
  const events: KEvent[] = []
  const out: number[] = []

  for (let t = 0; t < beats; t++) {
    keyedFermionMix(tables, a, key, t, mix, tally)
    keyedFermionMix(tables, p, key, t, mix, tally)
    starBeat(tables, a, b, key, THRESHOLD_BORN, t, events)
    starBeat(tables, p, q, key, THRESHOLD_BORN, t, events)

    const aNext = b
    const pNext = q

    b = a
    a = aNext
    q = p
    p = pNext
    out.push(frontReach(a, p, tables.cells, steps))
  }

  return out
}

// slots and stores where `b` is not the image of `a` under a map of vibe trits (charge conjugation v -> -v, or particle-
// hole v -> 1 - v on a love sea against the empty mesh); a held slot's point must agree too, a store's trit maps as a vibe
// does under C and must be empty under particle-hole (`storeMap` null)
export function imageOff(
  a: Configuration,
  b: Configuration,
  map: (v: number) => number,
  storeMap: ((s: number) => number) | null,
): number {
  let n = 0

  for (let i = 0; i < a.vibe.length; i++) {
    const v = map(a.vibe[i]!)

    if (b.vibe[i] !== v) {
      n++
    } else if (
      v !== 0 &&
      a.vibe[i]! !== 0 &&
      a.point[i] !== b.point[i]
    ) {
      n++
    }
  }

  for (let s = 0; s < a.store.length; s++) {
    if (storeMap === null) {
      n += a.store[s] !== 0 || b.store[s] !== 0 ? 1 : 0
    } else if (b.store[s] !== storeMap(a.store[s]!)) {
      n++
    }
  }

  return n
}

export const conjugate = (v: number): number => -v
export const particleHole = (v: number): number => 1 - v

// the charge (loves minus fears; a stored pair is a love and a fear, charge 0) held at every dock
export function dockCharges(
  c: Configuration,
  out: Int32Array,
): Int32Array {
  out.fill(0)

  for (let i = 0; i < c.vibe.length; i++) {
    if (c.vibe[i] !== 0) {
      out[Math.floor(i / 24)]! += c.vibe[i]!
    }
  }

  return out
}

export const sumOf = (xs: ArrayLike<number>): number => {
  let s = 0

  // eslint-disable-next-line @typescript-eslint/prefer-for-of -- an ArrayLike is not iterable
  for (let k = 0; k < xs.length; k++) {
    s += xs[k]!
  }

  return s
}

// a per-dock integer field summed down each husk column
export function columnField(
  husk: BoxHusk,
  perDock: Int32Array,
): Float64Array {
  const out = new Float64Array(husk.columns)

  addColumns(husk, perDock, out)

  return out
}

// the husk static field of a column source (the torus's uniform mean removed, E-GRV-0090's rule, code/measure/energy-
// lines staticDepth): its flux, its depth, and its field energy half the sum of the squared flux
export function huskField(
  side: number,
  rho: Float64Array,
): { flux: Float64Array; depth: Float64Array; energy: number } {
  const { flux, depth } = staticDepth(side, rho)

  let e = 0

  for (const f of flux) {
    e += f ** 2
  }

  return { flux, depth, energy: e / 2 }
}

// the largest absolute entry of a field, and of the sum of two fields (0 when one is the other's negative)
export const largest = (f: ArrayLike<number>): number => {
  let m = 0

  // eslint-disable-next-line @typescript-eslint/prefer-for-of -- an ArrayLike is not iterable
  for (let k = 0; k < f.length; k++) {
    m = Math.max(m, Math.abs(f[k]!))
  }

  return m
}

export function sumLargest(
  a: ArrayLike<number>,
  b: ArrayLike<number>,
): number {
  let m = 0

  for (let k = 0; k < a.length; k++) {
    m = Math.max(m, Math.abs(a[k]! + b[k]!))
  }

  return m
}
