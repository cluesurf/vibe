// PARALLEL LINES AND THE PLANON (E-SPN-0117). Readings for the theorem that a composite on parallel mesh lines of one
// class is exactly a set of independent lineons in the working knit: no piece of the rule carries a vibe, a store or a
// love-fear pair from one line to a parallel one, so a dipole of lineons is never a planon here.
//
// THE THEOREM (derived in test/experiment/spin/planon-lines, read here beat by beat). Let V be the vacuum's run and S a
// set of mesh lines of one line class (pairwise parallel, so no two share a dock). If a start equals V's start off S,
// and V has no single line on any dock at any beat (condition Z), then on the contacts 'pass', 'lone' and 'bounce', with
// veto 'none' and no mixer, at every beat
//   (1) CONFINEMENT: the run equals V off S (every slot and store of a line outside S), and
//   (2) FACTORIZATION: on each line L of S the run equals the run started from V with only L's content replaced.
// So each line of S evolves on its own, with no amplitude for anything to reach a parallel line.
//
// DETERMINISM: starts are integer hashes of (start, slot); no random numbers. The rule is exact integers.
// NOTHING MOVES: every piece hands a value to a slot, and the stream takes it one dock along.

import {
  cloneConfiguration,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  LINE_FIRSTS,
  LINE_OF,
  OPPOSITE,
} from '@/code/rule/isometric-knit'
import {
  keyedRunner,
  type MeshLines,
  type PathKey,
} from '@/code/measure/full-key-paths'

// the line class of every mesh line (the dock line index of any of its slots), and whether it is the same along the line
export function lineClasses(lines: MeshLines): {
  classOf: Int32Array
  constant: boolean
} {
  const classOf = new Int32Array(lines.count).fill(-1)

  let constant = true

  for (let i = 0; i < lines.lineOf.length; i++) {
    const L = lines.lineOf[i]!
    const c = LINE_OF[i % 24]!

    if (classOf[L] === -1) {
      classOf[L] = c
    } else if (classOf[L] !== c) {
      constant = false
    }
  }

  return { classOf, constant }
}

// the mesh line a dock line's store belongs to (its first slot's)
export const storeLine = (lines: MeshLines, s: number): number =>
  lines.lineOf[Math.floor(s / 12) * 24 + LINE_FIRSTS[s % 12]!]!

// the number of single lines (one slot held) over every dock of a configuration: condition Z asks for 0
export function singleLines(cells: number, c: Configuration): number {
  let n = 0

  for (let x = 0; x < cells; x++) {
    for (let l = 0; l < 12; l++) {
      const f = LINE_FIRSTS[l]!

      if (
        (c.vibe[x * 24 + f] !== 0) !==
        (c.vibe[x * 24 + OPPOSITE[f]!] !== 0)
      ) {
        n++
      }
    }
  }

  return n
}

// an integer hash of (k, i) in [0, 65536)
export const hash = (k: number, i: number): number =>
  (((i * 40503) % 65536) +
    ((k * 7919 + 12345) % 65536) +
    ((i * k * 27145) % 65536)) %
  65536

// the slots and stores of each mesh line in `set`
export function lineMembers(
  lines: MeshLines,
  set: readonly number[],
): { slots: number[][]; stores: number[][] } {
  const at = new Map(set.map((L, k) => [L, k]))
  const slots: number[][] = set.map(() => [])
  const stores: number[][] = set.map(() => [])

  for (let i = 0; i < lines.lineOf.length; i++) {
    const k = at.get(lines.lineOf[i]!)

    if (k !== undefined) {
      slots[k]!.push(i)
    }
  }

  for (let s = 0; s < lines.lineOf.length / 2; s++) {
    const k = at.get(storeLine(lines, s))

    if (k !== undefined) {
      stores[k]!.push(s)
    }
  }

  return { slots, stores }
}

// the configuration `base` with the slots and stores of line k (of `members`) taken from `from`
export function spliceLine(
  base: Configuration,
  from: Configuration,
  members: { slots: number[][]; stores: number[][] },
  k: number,
): Configuration {
  const out = cloneConfiguration(base)

  for (const i of members.slots[k]!) {
    out.vibe[i] = from.vibe[i]!
    out.point[i] = from.point[i]!
    out.open[i] = from.open[i]!
  }

  for (const s of members.stores[k]!) {
    out.store[s] = from.store[s]!
    out.spoint[s] = from.spoint[s]!
    out.sopen[s] = from.sopen[s]!
  }

  return out
}

// slot i of p and q hold the same thing (points and open bits read only where a vibe is, since the stream leaves the
// buffer's stale values at empty slots and no piece reads them there)
const sameSlot = (
  p: Configuration,
  q: Configuration,
  i: number,
): boolean =>
  p.vibe[i] === q.vibe[i] &&
  (p.vibe[i] === 0 ||
    (p.point[i] === q.point[i] && p.open[i] === q.open[i]))
const sameStore = (
  p: Configuration,
  q: Configuration,
  s: number,
): boolean =>
  p.store[s] === q.store[s] &&
  (p.store[s] === 0 ||
    (p.spoint[s] === q.spoint[s] && p.sopen[s] === q.sopen[s]))

export type ParallelReading = {
  // slot or store readings off S where the run differs from the vacuum, summed over beats
  off: number
  // the first beat with such a difference, or -1
  firstOff: number
  // slot or store readings on S where the run differs from its line's own run, summed over beats
  unfactored: number
  // single lines on the vacuum's docks, summed over beats (condition Z asks for 0)
  vacuumSingles: number
  // store changes on S's dock lines in the run at a beat where the vacuum's same store did not change
  storeEvents: number
  // the largest box step from `from` of a slot differing from the vacuum
  reach: number
  // the largest number of slots differing from the vacuum at one beat
  wake: number
}

// the joint run, the vacuum run and one run per line of S in lockstep; `steps` is boxSteps from the anchor dock
export function parallelRun(input: {
  tables: LockedTables
  vacuum: Configuration
  start: Configuration
  lines: MeshLines
  set: readonly number[]
  key: PathKey
  threshold: number
  beats: number
  steps: Int32Array
  factor: boolean
}): ParallelReading {
  const {
    tables,
    vacuum,
    start,
    lines,
    set,
    key,
    threshold,
    beats,
    steps,
    factor,
  } = input
  const members = lineMembers(lines, set)
  const inS = new Uint8Array(lines.count)

  for (const L of set) {
    inS[L] = 1
  }

  const owner = (L: number): number => set.indexOf(L)
  const joint = keyedRunner(tables, start, { key, threshold })
  const plain = keyedRunner(tables, vacuum, { key, threshold })
  const own = factor
    ? set.map((_, k) =>
        keyedRunner(tables, spliceLine(vacuum, start, members, k), {
          key,
          threshold,
        }),
      )
    : []
  const stores = tables.cells * 12

  let prevJoint = Int8Array.from(start.store)
  let prevPlain = Int8Array.from(vacuum.store)

  const out: ParallelReading = {
    off: 0,
    firstOff: -1,
    unfactored: 0,
    vacuumSingles: 0,
    storeEvents: 0,
    reach: 0,
    wake: 0,
  }

  for (let t = 0; t < beats; t++) {
    joint.beat()
    plain.beat()

    for (const r of own) {
      r.beat()
    }

    const q = joint.state()
    const p = plain.state()

    let wake = 0

    out.vacuumSingles += singleLines(tables.cells, p)

    for (let i = 0; i < q.vibe.length; i++) {
      const L = lines.lineOf[i]!
      const differs = !sameSlot(q, p, i)

      if (differs) {
        wake++
        out.reach = Math.max(out.reach, steps[Math.floor(i / 24)]!)
      }

      if (!inS[L]) {
        if (differs) {
          out.off++

          if (out.firstOff < 0) {
            out.firstOff = t + 1
          }
        }
      } else if (factor && !sameSlot(q, own[owner(L)]!.state(), i)) {
        out.unfactored++
      }
    }

    for (let s = 0; s < stores; s++) {
      const L = storeLine(lines, s)

      if (!inS[L]) {
        if (!sameStore(q, p, s)) {
          out.off++

          if (out.firstOff < 0) {
            out.firstOff = t + 1
          }
        }

        continue
      }

      if (factor && !sameStore(q, own[owner(L)]!.state(), s)) {
        out.unfactored++
      }

      if (q.store[s] !== prevJoint[s] && p.store[s] === prevPlain[s]) {
        out.storeEvents++
      }
    }

    out.wake = Math.max(out.wake, wake)
    prevJoint = Int8Array.from(q.store)
    prevPlain = Int8Array.from(p.store)
  }

  return out
}

// the per-line tone of a configuration minus the vacuum's, on the lines where it is not zero (a sorted list of
// "line:tone"), for reading whether a composite's charge sits on the same lines
export function toneExcess(
  lines: MeshLines,
  c: Configuration,
  vacuum: Configuration,
): string {
  const tone = new Map<number, number>()

  for (let i = 0; i < c.vibe.length; i++) {
    const d = c.vibe[i]! - vacuum.vibe[i]!

    if (d !== 0) {
      tone.set(lines.lineOf[i]!, (tone.get(lines.lineOf[i]!) ?? 0) + d)
    }
  }

  return [...tone.entries()]
    .filter(([, v]) => v !== 0)
    .sort((a, b) => a[0] - b[0])
    .map(([L, v]) => `${L}:${v}`)
    .join(',')
}
