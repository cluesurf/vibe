// PATHS ON A FULL-PERIOD KEY (E-MTH-0029). A path of the all-open rule fixes every keep-or-exchange choice by a key
// of (beat, dock, line). The key the registered experiments read, code/measure/doublet-locked-readings exchangeAt,
// is ((t cells + x) 12 + l) 27145 + 12345 mod 65536, and code/measure/occupation-veto-readings mixBin has the same
// shape with 3 frames. On a D4 box of side 16, cells = 2^16, so t cells vanishes mod 2^16: the key does NOT depend on
// the beat. On sides 8 and 24, cells 12 carries 2^14, so the key repeats every 4 beats. Every path read on those boxes
// was a special, time-periodic record. Those two functions are left exactly as they are, so every registered
// experiment still reproduces its record; this file adds a NAMED key beside them.
//
// THE FULL KEY: fullKey(t, x, l, offset) = (t 40503 + (x 18 + l) 27145 + 12345 + offset) mod 65536. 40503 is odd, so
// for every slot the key runs through all 65,536 values as t runs through 65,536 beats (a full-period integer Weyl
// sequence in t, the golden rate 40503 / 2^16). A dock owns 18 key slots: its 12 lines (the coin and the meeting),
// then 3 frames for the vibe mixer (12 + f), then 3 frames for the store mixer (15 + f), so no two pieces of the rule
// read one key at one beat (the probes that found the flaw used a stride of 12 and let a frame's mixer read the next
// dock's line key; this file does not). An OFFSET gives another path of the same rule: since 40503 is invertible mod
// 2^16, an offset is the same record read from another beat, 40503^-1 offset beats along it, so offsets spaced by
// PATH_OFFSET_RATE (7919, prime) read far-apart stretches of one full-period record.
//
// THE PIECES, each the rule's own path piece with its key read from a PathKey: the coin (pathCoin), the meeting
// (pathMeet), the frame mixer at a move rate 7 N / 64 (N = 4 is G, E-SPN-0095's 16 Born bins cut into 64: bins 0 to
// 64 - 7 N - 1 keep, then N bins for each of the seven outcomes), the lifted mixer Gamma(G) (pathLift's bins), and the
// store mixer (a frame whose four lines hold exactly one stored pair keeps it or hands it to one of the other three
// lines, Grover on four: 16 bins, 0 to 3 keep, 4 k to 4 k + 3 hop k along the frame). oldPathKey(cells) is the
// registered key in the same shape (lines exchangeAt's, frames mixBin's, stores the store-mixer probe's), so a reading
// can run both and a control can reproduce a probe bit for bit.
//
// DETERMINISM: no random numbers anywhere; a key is integer arithmetic on (beat, dock, slot, offset). The rule is
// exact integers; nothing here rounds. NOTHING MOVES: every piece hands a value to a slot, and the stream takes it.

import { cloneConfiguration, type Configuration, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { collideVeto, type VetoKind } from '@/code/rule/occupation-veto-knit'
import { FRAME_LINES, FRAME_SLOTS, liftFrames, loneFrames } from '@/code/rule/coined-locked-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { SILVER_RATE, streamInto, THRESHOLD_BORN } from '@/code/measure/doublet-locked-readings'
import { LIFT_PATH } from '@/code/measure/occupation-veto-readings'
import { d4BoxCoordinates } from '@/code/substrate/d4-box-integer'

export const KEY_MODULUS = 65536
export const FULL_KEY_BEAT_RATE = 40503
export const FULL_KEY_STRIDE = 18
export const PATH_OFFSET_RATE = 7919

const SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] as number)

export const fullKey = (t: number, x: number, l: number, offset = 0): number => (((t * FULL_KEY_BEAT_RATE) % KEY_MODULUS) + (((x * FULL_KEY_STRIDE + l) * SILVER_RATE + 12345 + offset) % KEY_MODULUS)) % KEY_MODULUS

// the k-th path offset of a family: an integer Weyl sequence
export const pathOffset = (k: number): number => (k * PATH_OFFSET_RATE) % KEY_MODULUS

// how many beats along the full-period record an offset reads (offset = 40503 shift mod 2^16)
export function offsetAsBeats(offset: number): number {
  let inverse = 1

  // 40503^-1 mod 2^16 by Newton's iteration on odd numbers (each step doubles the correct low bits)
  for (let k = 0; k < 5; k++) inverse = (inverse * (2 - ((FULL_KEY_BEAT_RATE * inverse) % KEY_MODULUS) + KEY_MODULUS)) % KEY_MODULUS

  return (((offset % KEY_MODULUS) * inverse) % KEY_MODULUS + KEY_MODULUS) % KEY_MODULUS
}

// a key for each kind of choice: a line's (coin, meeting), a frame's (vibe mixer), a frame's stores (store mixer)
export type PathKey = { readonly name: string; line: (t: number, x: number, l: number) => number; frame: (t: number, x: number, f: number) => number; store: (t: number, x: number, f: number) => number }

export const fullPathKey = (offset = 0): PathKey => ({
  name: `full+${offset}`,
  line: (t, x, l) => fullKey(t, x, l, offset),
  frame: (t, x, f) => fullKey(t, x, 12 + f, offset),
  store: (t, x, f) => fullKey(t, x, 15 + f, offset),
})

// the registered key, unchanged: exchangeAt's on lines, mixBin's (before its cut into 16 bins) on frames, and the store
// mixer probe's (tmp/pair-mixer-probe, + 54321) on stores
export const oldPathKey = (cells: number): PathKey => ({
  name: 'old',
  line: (t, x, l) => (((t * cells + x) * 12 + l) * SILVER_RATE + 12345) % KEY_MODULUS,
  frame: (t, x, f) => (((t * cells + x) * 3 + f) * SILVER_RATE + 12345) % KEY_MODULUS,
  store: (t, x, f) => (((t * cells + x) * 3 + f) * SILVER_RATE + 54321) % KEY_MODULUS,
})

// ---- the pieces ----

// the coin: a line of one open vibe and an empty slot hands the vibe across where the key is under the threshold
export function keyedCoin(tables: LockedTables, c: Configuration, key: PathKey, threshold: number, t: number): number {
  let crossed = 0

  for (let x = 0; x < tables.cells; x++) {
    for (let l = 0; l < 12; l++) {
      const i = x * 24 + (LINE_FIRSTS[l] as number)
      const j = x * 24 + (SECONDS[l] as number)
      const hi = c.vibe[i] !== 0
      const hj = c.vibe[j] !== 0

      if (hi === hj) continue

      const from = hi ? i : j
      const to = hi ? j : i

      if (!c.open[from] || !(key.line(t, x, l) < threshold)) continue

      c.vibe[to] = c.vibe[from] as number
      c.point[to] = c.point[from] as number
      c.open[to] = c.open[from] as number
      c.vibe[from] = 0
      c.point[from] = 0
      c.open[from] = 0
      crossed++
    }
  }

  return crossed
}

// the meeting: two like vibes of unequal points exchange points where the key is under the threshold
export function keyedMeet(tables: LockedTables, c: Configuration, key: PathKey, threshold: number, t: number): number {
  let exchanged = 0

  for (let x = 0; x < tables.cells; x++) {
    for (let l = 0; l < 12; l++) {
      const i = x * 24 + (LINE_FIRSTS[l] as number)
      const j = x * 24 + (SECONDS[l] as number)
      const vi = c.vibe[i] as number

      if (vi === 0 || vi !== c.vibe[j] || c.point[i] === c.point[j] || !(key.line(t, x, l) < threshold)) continue

      const p = c.point[i] as number

      c.point[i] = c.point[j] as number
      c.point[j] = p
      exchanged++
    }
  }

  return exchanged
}

function handTo(c: Configuration, from: number, to: number): void {
  c.vibe[to] = c.vibe[from] as number
  c.point[to] = c.point[from] as number
  c.open[to] = c.open[from] as number
  c.vibe[from] = 0
  c.point[from] = 0
  c.open[from] = 0
}

// the frame mixer at move rate 7 n / 64 on every lone frame (n = 0 none, n = 4 G); returns the moves
export function keyedMix(tables: LockedTables, c: Configuration, key: PathKey, t: number, n: number): number {
  if (n <= 0) return 0
  if (n > 9) throw new Error('full-key-paths: a move rate above 63/64 has no keep bin')

  const keep = 64 - 7 * n
  let moved = 0

  for (const { base, frame, q } of loneFrames(tables.cells, c)) {
    const b = Math.floor(key.frame(t, base / 24, frame) / 1024)

    if (b < keep) continue

    const o = Math.floor((b - keep) / n) + 1
    const ss = FRAME_SLOTS[frame] as readonly number[]

    handTo(c, base + (ss[q] as number), base + (ss[q ^ o] as number))
    moved++
  }

  return moved
}

// Gamma(G) (E-SPN-0097) on every frame of one content, pathLift's 16 bins read from the frame key
export function keyedLift(tables: LockedTables, c: Configuration, key: PathKey, t: number): number {
  let moved = 0

  for (const { base, frame, held } of liftFrames(tables.cells, c)) {
    const bin = Math.floor(key.frame(t, base / 24, frame) / 4096)
    const mask = held.reduce((m, q) => m | (1 << q), 0)
    const next = LIFT_PATH.forward[bin]![mask] as number

    if (next === mask) continue

    const ss = FRAME_SLOTS[frame] as readonly number[]

    handTo(c, base + (ss[Math.log2(mask & ~next)] as number), base + (ss[Math.log2(next & ~mask)] as number))
    moved++
  }

  return moved
}

// the store mixer: a frame whose lines hold exactly one stored pair keeps it (bins 0 to 3) or hands the store (value,
// point word, open bits) to the line k steps along the frame (bins 4 k to 4 k + 3); lone vibes untouched
export function keyedPairMix(tables: LockedTables, c: Configuration, key: PathKey, t: number): number {
  let hops = 0

  for (let x = 0; x < tables.cells; x++) {
    for (let f = 0; f < 3; f++) {
      const ls = FRAME_LINES[f] as readonly number[]
      let held = -1
      let count = 0

      for (const l of ls) {
        if (c.store[x * 12 + l] !== 0) {
          held = l
          count++
        }
      }

      if (count !== 1) continue

      const b = Math.floor(key.store(t, x, f) / 4096)

      if (b < 4) continue

      const s = x * 12 + held
      const d = x * 12 + (ls[(ls.indexOf(held) + Math.floor(b / 4)) % 4] as number)

      c.store[d] = c.store[s] as number
      c.spoint[d] = c.spoint[s] as number
      c.sopen[d] = c.sopen[s] as number
      c.store[s] = 0
      c.spoint[s] = 0
      c.sopen[s] = 0
      hops++
    }
  }

  return hops
}

// ---- the runner ----

// mix: 0 none, 1 to 9 the frame mixer at 7 n / 64 (4 is G), 'lift' Gamma(G), 'pairs' the store mixer.
// collide: the rule's collision with a veto (default 'none'), or a replacement collision (the partial contact).
export type KeyedMix = number | 'lift' | 'pairs'

export type KeyedFlags = {
  readonly key: PathKey
  readonly threshold?: number
  readonly coin?: boolean
  readonly mix?: KeyedMix
  readonly veto?: VetoKind
  readonly collide?: (tables: LockedTables, c: Configuration, beat: number) => void
  readonly phase?: number
}

export type KeyedRunner = { state: () => Configuration; time: () => number; beat: () => void; mixed: () => number; crossed: () => number }

export function keyedRunner(tables: LockedTables, start: Configuration, flags: KeyedFlags): KeyedRunner {
  const { key, threshold = THRESHOLD_BORN, coin = true, mix = 0, veto = 'none', collide, phase = 0 } = flags
  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)
  let t = phase
  let mixed = 0
  let crossed = 0

  return {
    state: () => a,
    time: () => t,
    mixed: () => mixed,
    crossed: () => crossed,
    beat() {
      if (mix === 'lift') mixed += keyedLift(tables, a, key, t)
      else if (mix === 'pairs') mixed += keyedPairMix(tables, a, key, t)
      else mixed += keyedMix(tables, a, key, t, mix)
      if (coin) crossed += keyedCoin(tables, a, key, threshold, t)
      keyedMeet(tables, a, key, threshold, t)
      if (collide) collide(tables, a, t)
      else collideVeto(veto, tables, a, t, false)
      streamInto(tables, a, b)

      const s = a

      a = b
      b = s
      t++
    },
  }
}

// ---- readings shared by the full-key experiments ----

// the vibe slots where two configurations differ (stores not counted; tritsApart counts both)
export function vibesApart(a: Configuration, b: Configuration): number {
  let n = 0

  for (let i = 0; i < a.vibe.length; i++) n += a.vibe[i] !== b.vibe[i] ? 1 : 0

  return n
}

// a wake's growth a beat: the geometric mean ratio over the beats where the wake lies between `low` and `high`
// (tmp/rate-probe1's window: 100 to a twentieth of the slots); NaN when fewer than two beats fall in the window
export function wakeGrowth(wake: readonly number[], low: number, high: number): number {
  const window = wake.map((v, t) => ({ v, t })).filter(p => p.v >= low && p.v <= high)

  if (window.length < 2) return Number.NaN

  const first = window[0]!
  const last = window[window.length - 1]!

  return last.t === first.t ? Number.NaN : (last.v / first.v) ** (1 / (last.t - first.t))
}

// THE MESH LINES (step-back.md H1): the components of "a slot and its stream target" and "a slot and the opposite slot
// of its dock line". A dock line's store belongs to its first slot's component. On side 8 there are 6,144, on side 16
// 49,152.
export type MeshLines = { readonly lineOf: Int32Array; readonly count: number }

export function meshLines(tables: LockedTables): MeshLines {
  const slots = tables.cells * 24
  const parent = Int32Array.from({ length: slots }, (_, i) => i)
  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i] as number] as number
      i = parent[i] as number
    }

    return i
  }

  for (let i = 0; i < slots; i++) {
    parent[find(i)] = find(tables.target[i] as number)
    parent[find(i)] = find(Math.floor(i / 24) * 24 + (OPPOSITE[i % 24] as number))
  }

  const ids = new Map<number, number>()
  const lineOf = new Int32Array(slots)

  for (let i = 0; i < slots; i++) {
    const r = find(i)
    let id = ids.get(r)

    if (id === undefined) {
      id = ids.size
      ids.set(r, id)
    }

    lineOf[i] = id
  }

  return { lineOf, count: ids.size }
}

// the tone on every mesh line (the sum of its vibes; a stored pair is a love and a fear, tone 0), and the directed tone
// (first-slot vibes +1, second-slot vibes -1, a store tau counted 2 tau, its own dipole)
export function lineCharges(lines: MeshLines, c: Configuration): { tone: Int32Array; directed: Int32Array } {
  const tone = new Int32Array(lines.count)
  const directed = new Int32Array(lines.count)
  const first = new Uint8Array(24)

  for (let l = 0; l < 12; l++) first[LINE_FIRSTS[l] as number] = 1

  for (let i = 0; i < c.vibe.length; i++) {
    const v = c.vibe[i] as number

    if (v === 0) continue
    tone[lines.lineOf[i] as number]! += v
    directed[lines.lineOf[i] as number]! += first[i % 24] ? v : -v
  }

  for (let s = 0; s < c.store.length; s++) {
    const a = c.store[s] as number

    if (a !== 0) directed[lines.lineOf[Math.floor(s / 12) * 24 + (LINE_FIRSTS[s % 12] as number)] as number]! += 2 * a
  }

  return { tone, directed }
}

// the mesh lines on which two charge arrays differ
export function linesDiffering(a: Int32Array, b: Int32Array): number {
  let n = 0

  for (let k = 0; k < a.length; k++) n += a[k] !== b[k] ? 1 : 0

  return n
}

// the distance of every dock from one dock in box-basis steps: the largest basis coordinate apart, minimum image
export function boxSteps(cells: number, side: number, from: number): Int32Array {
  const c0 = d4BoxCoordinates({ cell: from, side })
  const out = new Int32Array(cells)

  for (let x = 0; x < cells; x++) {
    const c = d4BoxCoordinates({ cell: x, side })
    let s = 0

    for (let k = 0; k < c.length; k++) {
      const d = Math.abs((c[k] as number) - (c0[k] as number)) % side

      s = Math.max(s, Math.min(d, side - d))
    }

    out[x] = s
  }

  return out
}

// n docks placed by the golden Weyl sequence floor(frac(k phi') cells), phi' = (sqrt 5 - 1) / 2, k = 1, 2, ...,
// distinct: the placement the density probes used (a fixed pattern, not a draw; the float only places the seeds and
// never enters the rule)
const GOLDEN = (Math.sqrt(5) - 1) / 2

export function weylDocks(cells: number, n: number): number[] {
  const docks: number[] = []
  const seen = new Set<number>()

  for (let k = 1; docks.length < n; k++) {
    const x = Math.floor(((k * GOLDEN) % 1) * cells)

    if (seen.has(x)) continue
    seen.add(x)
    docks.push(x)
  }

  return docks
}
