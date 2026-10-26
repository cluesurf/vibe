// THE KNOT OF A SEPARATING PAIR, READ BEAT BY BEAT (E-QTM-0188, OPEN-QTM-20). A like meeting of two open vibes with
// unequal points leaves their points in one superposed knot (E-RLT-0105, E-QTM-0163). Between that meeting and the
// pair's next one the two vibes move apart along their line, one dock a beat each, and each meets the vacuum's store on
// its own. This module reads, at every beat, how far apart the two vibes are (the shortest path between their docks in
// the box's dock graph) and the best CHSH value of their two points.
//
// THE READING. The two-vibe state is a sum of configurations with amplitudes (a + b w) / 2^k. The terms are grouped by
// their ENVIRONMENT: everything in the configuration except the points on the two open slots (every vibe, open bit and
// point elsewhere, every store unit, its point and its open marks). With one environment class the pair's points are a
// pure two-party state, its 9 x 9 coefficient matrix gives the Schmidt weights, and the CHSH maximum is read from the
// weights (code/measure/doublet-locked-readings chshFromWeights; with two weights it is 2 sqrt(1 + 4 p1 p2), Horodecki's
// exact maximum, which E-QTM-0132's theorem also gives). With more than one class the pair is mixed with its
// environment and the pure reading does not apply: the reading says so (classes > 1) and gives no value.
//
// THE CONTROL CARRIER. `isolatePair` keeps the two open vibes of a state and clears everything else (the store, its
// points and marks, every closed vibe), so the same knot can be carried by the meeting, collision and stream of the
// knit with no vacuum at all.
//
// NOTHING MOVES: a reading, never a piece of the rule. Exact amplitudes; floats appear only in the Schmidt weights and
// CHSH values and the distance is an integer.

import {
  chshFromWeights,
  schmidtWeights,
} from '@/code/measure/doublet-locked-readings'
import {
  type Branch,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'

export type KnotReading = {
  // open slots in the first term (the pair is readable when there are exactly 2 and every term holds the same 2)
  readonly open: number[]
  readonly readable: boolean
  // environment classes over the terms (1: the pair's points are a pure state)
  readonly classes: number
  readonly weights: number[]
  readonly chsh: number | undefined
}

export function openSlots(b: Branch): number[] {
  const out: number[] = []

  for (let i = 0; i < b.vibe.length; i++) {
    if (b.vibe[i] !== 0 && b.open[i]) {
      out.push(i)
    }
  }

  return out
}

// a string key of everything in a term except the points on slots `sa` and `sb`
export function environmentKey(
  b: Branch,
  sa: number,
  sb: number,
): string {
  let h1 = 2166136261
  let h2 = 5381
  let count = 0

  const mix = (v: number): void => {
    h1 = Math.imul(h1 ^ (v & 0xff), 16777619) >>> 0
    h2 = (Math.imul(h2, 33) + (v & 0xff)) >>> 0
  }

  for (let i = 0; i < b.vibe.length; i++) {
    const v = b.vibe[i]!

    if (v === 0) {
      continue
    }

    count++
    mix(i)
    mix(i >> 8)
    mix(i >> 16)
    mix(v)
    mix(b.open[i]!)
    mix(i === sa || i === sb ? 99 : b.point[i]!)
  }

  for (let i = 0; i < b.store.length; i++) {
    const v = b.store[i]!

    if (v === 0 && b.sopen[i] === 0) {
      continue
    }

    count++
    mix(i)
    mix(i >> 8)
    mix(i >> 16)
    mix(v)
    mix(b.spoint[i]!)
    mix(b.sopen[i]!)
  }

  return `${h1}:${h2}:${count}`
}

// two terms hold the same environment: equal in everything except the points on slots `sa` and `sb`
export function sameEnvironment(
  a: Branch,
  b: Branch,
  sa: number,
  sb: number,
): boolean {
  for (let i = 0; i < a.vibe.length; i++) {
    if (a.vibe[i] !== b.vibe[i] || a.open[i] !== b.open[i]) {
      return false
    }

    if (
      a.vibe[i] !== 0 &&
      i !== sa &&
      i !== sb &&
      a.point[i] !== b.point[i]
    ) {
      return false
    }
  }

  for (let i = 0; i < a.store.length; i++) {
    if (
      a.store[i] !== b.store[i] ||
      a.sopen[i] !== b.sopen[i] ||
      ((a.store[i] !== 0 || a.sopen[i] !== 0) &&
        a.spoint[i] !== b.spoint[i])
    ) {
      return false
    }
  }

  return true
}

// the pair's knot over the two open slots of a state, read as above
export function pairKnot(branches: readonly Branch[]): KnotReading {
  const first = branches[0]
  const open = first ? openSlots(first) : []
  const none = {
    open,
    readable: false,
    classes: 0,
    weights: [],
    chsh: undefined,
  }

  if (!first || open.length !== 2) {
    return none
  }

  const [sa, sb] = open as [number, number]

  for (const b of branches) {
    const o = openSlots(b)

    if (o.length !== 2 || o[0] !== sa || o[1] !== sb) {
      return none
    }
  }

  const half = Math.sqrt(3) / 2
  const classes = new Map<
    string,
    { rep: Branch; re: number[][]; im: number[][] }
  >()

  for (const b of branches) {
    const hash = environmentKey(b, sa, sb)

    // the hash buckets, and an exact comparison inside a bucket, so a collision never joins two environments
    let key = hash
    let m = classes.get(key)
    let n = 0

    while (m && !sameEnvironment(m.rep, b, sa, sb)) {
      n++
      key = `${hash}#${n}`
      m = classes.get(key)
    }

    if (!m) {
      m = {
        rep: b,
        re: Array.from({ length: 9 }, () => new Array<number>(9).fill(0)),
        im: Array.from({ length: 9 }, () => new Array<number>(9).fill(0)),
      }
      classes.set(key, m)
    }

    const d = 2 ** b.k
    const x = Number(b.a)
    const y = Number(b.b)

    m.re[b.point[sa]!]![b.point[sb]!]! += (x - y / 2) / d
    m.im[b.point[sa]!]![b.point[sb]!]! += (y * half) / d
  }

  if (classes.size !== 1) {
    return { open, readable: true, classes: classes.size, weights: [], chsh: undefined }
  }

  const m = [...classes.values()][0]!
  const raw = schmidtWeights(m.re, m.im)
  const total = raw.reduce((u, v) => u + v, 0)
  const weights = raw
    .map(v => v / total)
    .filter(v => v > 1e-15)
    .sort((u, v) => v - u)

  return {
    open,
    readable: true,
    classes: 1,
    weights,
    chsh: chshFromWeights(weights),
  }
}

// the shortest path, in links, between two docks of the box (breadth first over every slot's stream target)
export function dockDistance(
  tables: LockedTables,
  from: number,
  to: number,
): number {
  if (from === to) {
    return 0
  }

  const seen = new Int32Array(tables.cells).fill(-1)
  const queue = new Int32Array(tables.cells)

  let head = 0
  let tail = 0

  seen[from] = 0
  queue[tail++] = from

  while (head < tail) {
    const x = queue[head++]!

    for (let s = 0; s < 24; s++) {
      const y = Math.floor(tables.target[x * 24 + s]! / 24)

      if (seen[y] !== -1) {
        continue
      }

      seen[y] = seen[x]! + 1

      if (y === to) {
        return seen[y]!
      }

      queue[tail++] = y
    }
  }

  return -1
}

// the two open vibes of every term kept, everything else cleared: the same knot with no vacuum
export function isolatePair(branches: readonly Branch[]): Branch[] {
  return branches.map(b => {
    const o = openSlots(b)
    const vibe = new Int8Array(b.vibe.length)
    const point = new Int8Array(b.point.length)
    const open = new Uint8Array(b.open.length)

    for (const s of o) {
      vibe[s] = b.vibe[s]!
      point[s] = b.point[s]!
      open[s] = 1
    }

    return {
      vibe,
      point,
      open,
      store: new Int8Array(b.store.length),
      spoint: new Int8Array(b.spoint.length),
      sopen: new Uint8Array(b.sopen.length),
      a: b.a,
      b: b.b,
      k: b.k,
    }
  })
}
