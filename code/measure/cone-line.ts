// THE LIGHT-CONE LINE (item vibe-roadmap-grounding-0019, B3's engine). B1's line rule (code/measure/cold-line.ts, the
// working knit's line sector with E-SPN-0103's drift cost and fermion sign, pass contact, flat links, in floats) on an
// OPEN line of absolute docks, storing only the configurations the start reaches. cold-line.ts holds every
// configuration of n loves on at most 32 docks; here a run of B beats needs only the start's light cone, so the line can
// be as long as the run needs (no love ever reaches an end, so it is the infinite line of empty docks exactly).
//
// THE STORE. A configuration is a set of modes (mode 2x + 1 the forward label 0 at dock x, 2x the back label 1, as
// cold-line.ts). Its SHAPE is the docks it occupies with their multiplicity. The coin mixes only the labels of the lone
// docks and the cost reads only the shape (a lone dock adds 1 to the link flux whatever its label, a full dock 2), so a
// shape holds one block of 2^m amplitudes, one per label assignment of its m lone docks (bit i set: the i-th lone dock
// from the left carries the forward label). Shapes are found by a hash of their packed positions; blocks live in
// chunked arenas.
//
// THE BEAT, operation for operation cold-line.ts's: the cost zeta_14^(-links) and the full docks' w^2 (a = 28 of 42;
// the links are those with flux Q(l) not 0 mod 3, which on an open neutral line lie between the first and the last
// love), the coin dock by dock from the left, the line block's sign, the stream (label 0 one dock forward, label 1 one
// back). With `split` the coin is D P D (decision 004). The arithmetic of each pair update is cold-line.ts's own, in
// the same order, so the two agree bit for bit wherever cold-line.ts's open line is the infinite line.
//
// NOTHING MOVES the rule: no amplitude is cut. A store that would pass its cap throws ConeCap and the run stops at the
// last whole beat.

import type { Placed } from '@/code/measure/held-cluster'
import {
  FULL_COIN,
  HALF_COIN,
  rankOf,
  type Amp,
  type Coin,
  type LineEngine,
  type LineReader,
} from '@/code/measure/cold-line'

const TURN = 42
const COS = Float64Array.from({ length: TURN }, (_, a) =>
  Math.cos((2 * Math.PI * a) / TURN),
)
const SIN = Float64Array.from({ length: TURN }, (_, a) =>
  Math.sin((2 * Math.PI * a) / TURN),
)

// positions and modes packed two to a 32-bit word, 15 bits each
const FIELD = 15
const FIELD_MAX = 1 << FIELD
// arena chunk, in amplitudes
const CHUNK = 1 << 22
const MAX_N = 12

export class ConeCap extends Error {
  constructor(public readonly needed: number) {
    super(`cone-line: the store would pass its cap (${needed} amplitudes)`)
  }
}

export type ConeStore = {
  n: number
  // key words a shape
  K: number
  shapes: number
  keys: Int32Array
  start: Float64Array
  ms: Uint8Array
  table: Int32Array
  // stored amplitudes (block slots, not counting chunk tails)
  used: number
  // the next free slot, as chunk * CHUNK + offset
  top: number
  re: Float64Array[]
  im: Float64Array[]
  cap: number
  // the line: docks 0..line - 1; a love on dock 0 or line - 1 is an end hit
  line: number
  endHits: number
  // configurations written with a nonzero amplitude (the reached ones; `used` also counts a block's unreached labels)
  written: number
}

export function coneStore(n: number, line: number, cap: number): ConeStore {
  if (n < 1 || n > MAX_N) {
    throw new Error(`cone-line: n ${n} out of range`)
  }

  if (line < 3 || 2 * line >= FIELD_MAX) {
    throw new Error(`cone-line: a line of ${line} docks is out of range`)
  }

  const K = Math.ceil(n / 2)
  const size = 1024

  return {
    n,
    K,
    shapes: 0,
    keys: new Int32Array(size * K),
    start: new Float64Array(size),
    ms: new Uint8Array(size),
    table: new Int32Array(2 * size),
    used: 0,
    top: 0,
    re: [],
    im: [],
    cap,
    line,
    endHits: 0,
    written: 0,
  }
}

export function clearStore(s: ConeStore): void {
  s.shapes = 0
  s.used = 0
  s.top = 0
  s.endHits = 0
  s.written = 0
  s.table.fill(0)
}

function hashWords(w: Int32Array, from: number, K: number): number {
  let h = 0x811c9dc5 | 0

  for (let i = 0; i < K; i++) {
    h = Math.imul(h ^ w[from + i]!, 0x9e3779b1)
    h ^= h >>> 15
  }

  return h
}

function grow(s: ConeStore): void {
  const size = s.start.length * 2
  const keys = new Int32Array(size * s.K)

  keys.set(s.keys)

  const start = new Float64Array(size)

  start.set(s.start)

  const ms = new Uint8Array(size)

  ms.set(s.ms)
  s.keys = keys
  s.start = start
  s.ms = ms
  s.table = new Int32Array(2 * size)

  const mask = s.table.length - 1

  for (let i = 0; i < s.shapes; i++) {
    let h = hashWords(s.keys, i * s.K, s.K) & mask

    while (s.table[h] !== 0) {
      h = (h + 1) & mask
    }

    s.table[h] = i + 1
  }
}

// a block of 2^m zeroed slots; returns its start
function allocate(s: ConeStore, m: number): number {
  const size = 1 << m

  if (s.used + size > s.cap) {
    throw new ConeCap(s.used + size)
  }

  let chunk = Math.floor(s.top / CHUNK)
  let offset = s.top - chunk * CHUNK

  if (offset + size > CHUNK) {
    chunk++
    offset = 0
  }

  while (s.re.length <= chunk) {
    s.re.push(new Float64Array(CHUNK))
    s.im.push(new Float64Array(CHUNK))
  }

  s.re[chunk]!.fill(0, offset, offset + size)
  s.im[chunk]!.fill(0, offset, offset + size)

  const at = chunk * CHUNK + offset

  s.top = at + size
  s.used += size

  return at
}

// the shape index of packed key `key`, made (with a zeroed block of 2^m) when absent
const KEY = new Int32Array(MAX_N)

function shapeOf(s: ConeStore, key: Int32Array, m: number): number {
  const K = s.K
  const mask = s.table.length - 1

  let h = hashWords(key, 0, K) & mask

  for (;;) {
    const e = s.table[h]!

    if (e === 0) {
      break
    }

    const i = e - 1
    let same = true

    for (let w = 0; w < K; w++) {
      if (s.keys[i * K + w] !== key[w]) {
        same = false
        break
      }
    }

    if (same) {
      return i
    }

    h = (h + 1) & mask
  }

  const i = s.shapes

  if (i + 1 > s.start.length) {
    grow(s)

    return shapeOf(s, key, m)
  }

  for (let w = 0; w < K; w++) {
    s.keys[i * K + w] = key[w]!
  }

  s.ms[i] = m
  s.start[i] = allocate(s, m)
  s.table[h] = i + 1
  s.shapes++

  if (s.shapes * 2 > s.table.length) {
    grow(s)
  }

  return i
}

// ---- configurations ----

// the shape's sorted positions (with repeats) into `out`
function positionsOf(s: ConeStore, i: number, out: Int32Array): void {
  const K = s.K

  for (let w = 0; w < K; w++) {
    const v = s.keys[i * K + w]!

    out[2 * w] = v >>> FIELD
    if (2 * w + 1 < s.n) {
      out[2 * w + 1] = v & (FIELD_MAX - 1)
    }
  }
}

// the modes (ascending) of label assignment j of a shape with positions `pos`, into `out`
function modesOf(n: number, pos: Int32Array, j: number, out: Int32Array): void {
  let single = 0

  for (let a = 0; a < n; a++) {
    const x = pos[a]!

    if (a + 1 < n && pos[a + 1] === x) {
      out[a] = 2 * x
      out[a + 1] = 2 * x + 1
      a++
    } else {
      out[a] = 2 * x + ((j >>> single) & 1)
      single++
    }
  }
}

// key, m and block index of the configuration with ascending modes `modes`; returns the block index, sets KEY and LONE
let LONE = 0

function packModes(n: number, modes: Int32Array, line: number, s: ConeStore): number {
  let j = 0
  let single = 0

  for (let a = 0; a < n; a++) {
    const x = modes[a]! >> 1

    if (x <= 0 || x >= line - 1) {
      s.endHits++
    }

    if (a + 1 < n && modes[a + 1]! >> 1 === x) {
      a++
    } else {
      j |= (modes[a]! & 1) << single
      single++
    }
  }

  for (let w = 0; w < Math.ceil(n / 2); w++) {
    const p = modes[2 * w]! >> 1
    const q = 2 * w + 1 < n ? modes[2 * w + 1]! >> 1 : 0

    KEY[w] = (p << FIELD) | q
  }

  LONE = single

  return j
}

// put amplitude (re, im) on the configuration with ascending modes `modes` (adding to what is there)
export function addAmp(s: ConeStore, modes: Int32Array, re: number, im: number): void {
  const j = packModes(s.n, modes, s.line, s)
  const i = shapeOf(s, KEY, LONE)
  const at = s.start[i]! + j
  const c = Math.floor(at / CHUNK)
  const o = at - c * CHUNK

  s.re[c]![o]! += re
  s.im[c]![o]! += im
  s.written++
}

// visit every stored configuration: modes ascending, amplitude
export function eachConfiguration(
  s: ConeStore,
  visit: (modes: Int32Array, re: number, im: number) => void,
): void {
  const pos = new Int32Array(s.n)
  const modes = new Int32Array(s.n)

  for (let i = 0; i < s.shapes; i++) {
    positionsOf(s, i, pos)

    const size = 1 << s.ms[i]!
    const at = s.start[i]!
    const c = Math.floor(at / CHUNK)
    const o = at - c * CHUNK
    const re = s.re[c]!
    const im = s.im[c]!

    for (let j = 0; j < size; j++) {
      modesOf(s.n, pos, j, modes)
      visit(modes, re[o + j]!, im[o + j]!)
    }
  }
}

// the norm, summed block by block with Kahan compensation (a plain sum of 1e8 terms drifts by 1e-11 on its own)
export function coneNorm(s: ConeStore): number {
  let total = 0
  let carry = 0

  for (let i = 0; i < s.shapes; i++) {
    const size = 1 << s.ms[i]!
    const at = s.start[i]!
    const c = Math.floor(at / CHUNK)
    const o = at - c * CHUNK
    const re = s.re[c]!
    const im = s.im[c]!

    let block = 0

    for (let j = 0; j < size; j++) {
      block += re[o + j]! ** 2 + im[o + j]! ** 2
    }

    const y = block - carry
    const t = total + y

    carry = t - total - y
    total = t
  }

  return total
}

// ---- the beat ----

// the cost's phase index of a shape (sorted positions with repeats): -3 links + 28 full, mod 42
function phaseIndex(n: number, pos: Int32Array): number {
  let links = 0
  let full = 0
  let Q = 0

  for (let a = 0; a < n; a++) {
    const x = pos[a]!

    Q++

    if (a + 1 < n && pos[a + 1] === x) {
      continue
    }

    if (a > 0 && pos[a - 1] === x) {
      full++
    }

    // links x .. next - 1 carry flux Q
    if (a + 1 < n && Q % 3 !== 0) {
      links += pos[a + 1]! - x
    }
  }

  return (((-3 * links + 28 * full) % TURN) + TURN) % TURN
}

function coinBlock(
  re: Float64Array,
  im: Float64Array,
  o: number,
  m: number,
  coin: Coin,
  adjoint: boolean,
): void {
  const kr = coin[0][0]
  const ki = adjoint ? -coin[0][1] : coin[0][1]
  const cr = coin[1][0]
  const ci = adjoint ? -coin[1][1] : coin[1][1]
  const size = 1 << m

  for (let i = 0; i < m; i++) {
    const bit = 1 << i

    for (let j = 0; j < size; j++) {
      if ((j & bit) === 0) {
        continue
      }

      // u: the forward label alone on the dock (cold-line's front), v: the back
      const u = o + j
      const v = o + (j ^ bit)
      const ar = re[u]!
      const ai = im[u]!
      const br = re[v]!
      const bi = im[v]!

      re[u] = kr * ar - ki * ai + (cr * br - ci * bi)
      im[u] = kr * ai + ki * ar + (cr * bi + ci * br)
      re[v] = cr * ar - ci * ai + (kr * br - ki * bi)
      im[v] = cr * ai + ci * ar + (kr * bi + ki * br)
    }
  }
}

function phaseBlock(
  re: Float64Array,
  im: Float64Array,
  o: number,
  m: number,
  t: number,
  conjugate: boolean,
): void {
  if (t === 0) {
    return
  }

  const pr = COS[t]!
  const pi = conjugate ? -SIN[t]! : SIN[t]!
  const size = 1 << m

  for (let j = 0; j < size; j++) {
    const ar = re[o + j]!
    const ai = im[o + j]!

    re[o + j] = pr * ar - pi * ai
    im[o + j] = pr * ai + pi * ar
  }
}

// the dock-local part of the beat on every block of s, in place (forward: before the stream; back: after the unstream)
function localPass(s: ConeStore, split: boolean, back: boolean): void {
  const pos = new Int32Array(s.n)

  for (let i = 0; i < s.shapes; i++) {
    positionsOf(s, i, pos)

    const m = s.ms[i]!
    const at = s.start[i]!
    const c = Math.floor(at / CHUNK)
    const o = at - c * CHUNK
    const re = s.re[c]!
    const im = s.im[c]!
    const t = phaseIndex(s.n, pos)

    if (split) {
      coinBlock(re, im, o, m, HALF_COIN, back)
      phaseBlock(re, im, o, m, t, back)
      coinBlock(re, im, o, m, HALF_COIN, back)
    } else if (back) {
      coinBlock(re, im, o, m, FULL_COIN, true)
      phaseBlock(re, im, o, m, t, true)
    } else {
      phaseBlock(re, im, o, m, t, false)
      coinBlock(re, im, o, m, FULL_COIN, false)
    }
  }
}

// A DOCK MIXER'S ON-LINE BLOCK (item vibe-roadmap-grounding-0020, note/line-confinement.md section 4), in place: every
// lone dock takes [[keep, cross], [cross, keep]] on its two labels (coinBlock's form), every full dock the scalar
// `full`. Not unitary: the weight a mixer sends off the line leaves the store, which is the P part Lemma W reads.
export function mixPass(
  s: ConeStore,
  lone: Coin,
  full: readonly [number, number],
): void {
  const pos = new Int32Array(s.n)

  for (let i = 0; i < s.shapes; i++) {
    positionsOf(s, i, pos)

    const m = s.ms[i]!
    const at = s.start[i]!
    const c = Math.floor(at / CHUNK)
    const o = at - c * CHUNK
    const re = s.re[c]!
    const im = s.im[c]!

    coinBlock(re, im, o, m, lone, false)

    let fr = 1
    let fi = 0

    for (let a = 0; a + 1 < s.n; a++) {
      if (pos[a + 1] === pos[a]) {
        const r = fr * full[0] - fi * full[1]

        fi = fr * full[1] + fi * full[0]
        fr = r
      }
    }

    if (fr === 1 && fi === 0) {
      continue
    }

    const size = 1 << m

    for (let j = 0; j < size; j++) {
      const ar = re[o + j]!
      const ai = im[o + j]!

      re[o + j] = fr * ar - fi * ai
      im[o + j] = fr * ai + fi * ar
    }
  }
}

// the stream (or its inverse) of every stored configuration of `from` into the empty store `to`, with the line
// block's sign: the parity of reordering the moved loves, ordered by their modes before the move. Exact zeros are not
// carried (a label no stream reached); `floor` > 0 also leaves out amplitudes at most that large in both parts, and the
// weight left out is returned (the backward check only: running back, the coin's roundoff leaves ~1e-17 on labels the
// forward run never reached, and carrying them would grow the store without bound)
function streamPass(
  from: ConeStore,
  to: ConeStore,
  back: boolean,
  floor: number,
): number {
  const n = from.n
  const pos = new Int32Array(n)
  const modes = new Int32Array(n)
  const moved = new Int32Array(n)
  const src = new Int32Array(n)

  let skipped = 0

  for (let i = 0; i < from.shapes; i++) {
    positionsOf(from, i, pos)

    const size = 1 << from.ms[i]!
    const at = from.start[i]!
    const c = Math.floor(at / CHUNK)
    const o = at - c * CHUNK
    const fre = from.re[c]!
    const fim = from.im[c]!

    for (let j = 0; j < size; j++) {
      const re = fre[o + j]!
      const im = fim[o + j]!

      if (re === 0 && im === 0) {
        continue
      }

      if (Math.abs(re) <= floor && Math.abs(im) <= floor) {
        skipped += re * re + im * im
        continue
      }

      modesOf(n, pos, j, modes)

      // forward: label 0 (odd mode) one dock on, label 1 one back; back: the reverse
      for (let a = 0; a < n; a++) {
        const md = modes[a]!
        const forward = (md & 1) === 1

        moved[a] = forward !== back ? md + 2 : md - 2
      }

      // the sign belongs to the forward map, whose sources are `modes` (forward) or `moved` (back)
      let inversions = 0

      if (!back) {
        for (let a = 0; a < n; a++) {
          for (let b = a + 1; b < n; b++) {
            if (moved[a]! > moved[b]!) {
              inversions++
            }
          }
        }
      } else {
        // sources moved[a] (not sorted), targets modes[a]: count pairs ordered by source whose targets invert
        for (let a = 0; a < n; a++) {
          for (let b = 0; b < n; b++) {
            if (moved[a]! < moved[b]! && modes[a]! > modes[b]!) {
              inversions++
            }
          }
        }
      }

      // sort the new modes
      for (let a = 0; a < n; a++) {
        src[a] = moved[a]!
      }

      for (let a = 1; a < n; a++) {
        const v = src[a]!
        let b = a - 1

        while (b >= 0 && src[b]! > v) {
          src[b + 1] = src[b]!
          b--
        }

        src[b + 1] = v
      }

      const s = inversions % 2 === 0 ? 1 : -1
      const jj = packModes(n, src, to.line, to)
      const k = shapeOf(to, KEY, LONE)
      const tat = to.start[k]! + jj
      const tc = Math.floor(tat / CHUNK)
      const to2 = tat - tc * CHUNK

      to.re[tc]![to2] = s * re
      to.im[tc]![to2] = s * im
      to.written++
    }
  }

  return skipped
}

// one beat from `a` into the (cleared) store `b`; `a` is used up. Nothing is left out
export function coneBeat(a: ConeStore, b: ConeStore, split: boolean): void {
  clearStore(b)
  localPass(a, split, false)
  streamPass(a, b, false, 0)
}

// one beat back from `a` into the (cleared) store `b`, leaving out amplitudes at most `floor`; returns the weight left out
export function coneBeatBack(
  a: ConeStore,
  b: ConeStore,
  split: boolean,
  floor: number,
): number {
  clearStore(b)

  const skipped = streamPass(a, b, true, floor)

  localPass(b, split, true)

  return skipped
}

// the number of stored configurations
export const coneCount = (s: ConeStore): number => s.used

// ---- starts ----

const sortedModes = (ts: readonly (readonly [number, number])[]): number[] =>
  ts.map(([x, j]) => (j === 0 ? 2 * x + 1 : 2 * x)).sort((a, b) => a - b)

// the parity of normal-ordering A_dag B_dag (A's modes, then B's) into ascending order (cold-line mergeSign)
function mergeSign(a: readonly number[], b: readonly number[]): number {
  let n = 0

  for (const m of a) {
    for (const q of b) {
      if (q < m) {
        n++
      }
    }
  }

  return n % 2 === 0 ? 1 : -1
}

// B1's start lifted onto the open line (cold-line lineStart with lift, offset): the cluster at total momentum 0 over
// anchors 0..W - 1 unwrapped, the bath's modes, translates overlapping the bath (taken mod W, B1's rule) or the bath on
// the line dropped, normalized
export function coneStart(input: {
  n: number
  line: number
  cap: number
  W: number
  placed: readonly Placed[] | undefined
  bath: readonly (readonly [number, number])[]
  offset: number
}): { store: ConeStore; dropped: number } {
  const { n, line, cap, W, placed, bath, offset } = input

  // the open line's links past the last love carry flux n, so n must be 0 mod 3
  if (n % 3 !== 0) {
    throw new Error(`cone-line: ${n} loves are not neutral mod 3`)
  }

  const store = coneStore(n, line, cap)
  const bathHere = sortedModes(bath.map(([x, j]) => [x + offset, j] as const))
  const bathRing = new Set(
    bath.map(([x, j]) => (j === 0 ? 2 * (((x % W) + W) % W) + 1 : 2 * (((x % W) + W) % W))),
  )
  const amps = new Map<string, { modes: number[]; re: number; im: number }>()

  let dropped = 0

  if (placed === undefined) {
    amps.set(bathHere.join(','), { modes: bathHere, re: 1, im: 0 })
  } else {
    const w = 1 / Math.sqrt(W)

    for (let X = 0; X < W; X++) {
      for (const p of placed) {
        const ts = p.ts.map(([x, j]) => [x + X, j] as const)
        const ring = ts.map(([x, j]) =>
          j === 0 ? 2 * (((x % W) + W) % W) + 1 : 2 * (((x % W) + W) % W),
        )

        if (ring.some(m => bathRing.has(m))) {
          dropped += (p.re ** 2 + p.im ** 2) / W
          continue
        }

        const m = sortedModes(ts.map(([x, j]) => [x + offset, j] as const))
        const bathSet = new Set(bathHere)

        if (
          m.some(q => bathSet.has(q)) ||
          new Set(m).size !== m.length
        ) {
          dropped += (p.re ** 2 + p.im ** 2) / W
          continue
        }

        const s = mergeSign(m, bathHere)
        const both = [...m, ...bathHere].sort((a, b) => a - b)
        const key = both.join(',')
        const at = amps.get(key) ?? { modes: both, re: 0, im: 0 }

        at.re += s * w * p.re
        at.im += s * w * p.im
        amps.set(key, at)
      }
    }
  }

  let norm = 0

  for (const v of amps.values()) {
    norm += v.re ** 2 + v.im ** 2
  }

  const scale = Math.sqrt(norm)
  const modes = new Int32Array(n)

  for (const v of amps.values()) {
    if (v.modes.length !== n) {
      throw new Error(`cone-line: a start configuration holds ${v.modes.length} loves, not ${n}`)
    }

    v.modes.forEach((q, a) => {
      modes[a] = q
    })
    addAmp(store, modes, v.re / scale, v.im / scale)
  }

  return { store, dropped }
}

// ---- against cold-line.ts ----

// a cold-line.ts amplitude vector (cut trit 0 entries; dock x taken as dock x + shift) as a store
export function fromDense(
  e: LineEngine,
  a: Amp,
  line: number,
  cap: number,
  shift = 0,
): ConeStore {
  const n = e.sp.n
  const store = coneStore(n, line, cap)
  const modes = new Int32Array(n)

  for (let r = 0; r < e.sp.count; r++) {
    const re = a.re[r * e.cuts]!
    const im = a.im[r * e.cuts]!

    if (re === 0 && im === 0) {
      continue
    }

    let q = 0

    for (let md = 0; md < 2 * e.sp.L; md++) {
      const bit =
        md < 32 ? (e.sp.lo[r]! >>> md) & 1 : (e.sp.hi[r]! >>> (md - 32)) & 1

      if (bit === 1) {
        modes[q++] = md + 2 * shift
      }
    }

    addAmp(store, modes, re, im)
  }

  return store
}

export type Agreement = {
  // the largest amplitude difference over the sparse store and the dense entries it holds
  worst: number
  // sparse configurations whose amplitude equals the dense one bit for bit, and all sparse configurations
  exact: number
  sparse: number
  // dense weight on configurations (or cut trits) the sparse store does not hold
  missing: number
}

// the sparse store against a cold-line.ts amplitude vector of engine e (sparse dock x + shift is dense dock x; cut
// trit 0)
export function agreeWith(
  s: ConeStore,
  e: LineEngine,
  a: Amp,
  shift = 0,
): Agreement {
  const cuts = e.cuts
  const modesAll = 2 * e.sp.L
  const held = new Uint8Array(a.re.length)

  let worst = 0
  let exact = 0
  let sparse = 0

  eachConfiguration(s, (modes, re, im) => {
    sparse++

    let lo = 0
    let hi = 0
    let inside = true

    for (let q = 0; q < modes.length; q++) {
      const md = modes[q]! - 2 * shift

      if (md < 0 || md >= modesAll) {
        inside = false
      } else if (md < 32) {
        lo |= 1 << md
      } else {
        hi |= 1 << (md - 32)
      }
    }

    if (!inside) {
      worst = Math.max(worst, Math.abs(re), Math.abs(im))
      return
    }

    const u = rankOf(e.sp.binom, lo, hi) * cuts
    const dr = a.re[u]!
    const di = a.im[u]!

    held[u] = 1
    worst = Math.max(worst, Math.abs(re - dr), Math.abs(im - di))

    if (re === dr && im === di) {
      exact++
    }
  })

  let missing = 0

  for (let u = 0; u < a.re.length; u++) {
    if (held[u] === 0) {
      missing += a.re[u]! ** 2 + a.im[u]! ** 2
    }
  }

  return { worst, exact, sparse, missing }
}

// ---- the reading ----

// an accumulator keyed by packed modes (X then the others), for B1's bound-trio count
type Acc = {
  K: number
  size: number
  count: number
  keys: Int32Array
  re: Float64Array
  im: Float64Array
  table: Int32Array
}

function accOf(K: number): Acc {
  const size = 1 << 16

  return {
    K,
    size,
    count: 0,
    keys: new Int32Array(size * K),
    re: new Float64Array(size),
    im: new Float64Array(size),
    table: new Int32Array(2 * size),
  }
}

function accGrow(c: Acc): void {
  const size = c.size * 2
  const keys = new Int32Array(size * c.K)
  const re = new Float64Array(size)
  const im = new Float64Array(size)

  keys.set(c.keys)
  re.set(c.re)
  im.set(c.im)
  c.keys = keys
  c.re = re
  c.im = im
  c.size = size
  c.table = new Int32Array(2 * size)

  const mask = c.table.length - 1

  for (let i = 0; i < c.count; i++) {
    let h = hashWords(c.keys, i * c.K, c.K) & mask

    while (c.table[h] !== 0) {
      h = (h + 1) & mask
    }

    c.table[h] = i + 1
  }
}

function accAdd(c: Acc, key: Int32Array, re: number, im: number): void {
  const K = c.K
  const mask = c.table.length - 1

  let h = hashWords(key, 0, K) & mask

  for (;;) {
    const e = c.table[h]!

    if (e === 0) {
      break
    }

    const i = e - 1
    let same = true

    for (let w = 0; w < K; w++) {
      if (c.keys[i * K + w] !== key[w]) {
        same = false
        break
      }
    }

    if (same) {
      c.re[i]! += re
      c.im[i]! += im

      return
    }

    h = (h + 1) & mask
  }

  const i = c.count

  for (let w = 0; w < K; w++) {
    c.keys[i * K + w] = key[w]!
  }

  c.re[i] = re
  c.im[i] = im
  c.table[h] = i + 1
  c.count++

  if (c.count * 2 > c.table.length || c.count >= c.size) {
    accGrow(c)
  }
}

// B1's bound-trio count F = sum_X <B_X^dag B_X> on the open line (cold-line boundCount with no cut trit): every anchor
// X on an occupied dock, every placement of the read level inside the window of modes from 2X, the others left behind
// with the fermion sign of taking the trio out. `anchorMax` restricts X as cold-line.ts's open reader does.
export function coneBoundCount(
  s: ConeStore,
  rd: LineReader,
  anchorMax = Infinity,
): number {
  const n = s.n

  if (n < 3) {
    return 0
  }

  if (!rd.anchored) {
    throw new Error('cone-line: the reader is not anchored')
  }

  const values = 1 + (n - 3)
  const K = Math.ceil(values / 2)
  const acc = accOf(K)
  const key = new Int32Array(K)
  const others = new Int32Array(n)
  const vals = new Int32Array(2 * K)
  const width = rd.width

  eachConfiguration(s, (modes, re, im) => {
    if (re === 0 && im === 0) {
      return
    }

    for (let a = 0; a < n; a++) {
      const X = modes[a]! >> 1

      // each occupied dock once
      if (a > 0 && modes[a - 1]! >> 1 === X) {
        continue
      }

      if (X > anchorMax) {
        continue
      }

      let w = 0

      for (let b = a; b < n; b++) {
        const r = modes[b]! - 2 * X

        if (r >= width) {
          break
        }

        w |= 1 << r
      }

      const list = rd.index[w]!

      for (let li = 0; li < list.length; li++) {
        const t = list[li]!
        const ms = rd.modes[t]!

        let o = 0
        let parity = 0

        for (let b = 0; b < n; b++) {
          const md = modes[b]!
          const r = md - 2 * X
          let inTrio = false

          for (let q = 0; q < ms.length; q++) {
            if (ms[q] === r) {
              inTrio = true
              break
            }
          }

          if (!inTrio) {
            others[o++] = md
          }
        }

        for (let q = 0; q < ms.length; q++) {
          const g = 2 * X + ms[q]!

          for (let b = 0; b < o; b++) {
            if (others[b]! < g) {
              parity++
            }
          }
        }

        vals.fill(0)
        vals[0] = X

        for (let b = 0; b < o; b++) {
          vals[b + 1] = others[b]!
        }

        for (let k = 0; k < K; k++) {
          key[k] = (vals[2 * k]! << FIELD) | vals[2 * k + 1]!
        }

        const sg = parity % 2 === 0 ? 1 : -1
        const tr = rd.re[t]!
        const ti = rd.im[t]!

        accAdd(acc, key, sg * (tr * re - ti * im), sg * (tr * im + ti * re))
      }
    }
  })

  let F = 0

  for (let i = 0; i < acc.count; i++) {
    F += acc.re[i]! ** 2 + acc.im[i]! ** 2
  }

  return F
}

// the expected number of loves outside docks [from, to]
export function coneLovesOutside(s: ConeStore, from: number, to: number): number {
  let total = 0

  eachConfiguration(s, (modes, re, im) => {
    const w = re * re + im * im

    if (w === 0) {
      return
    }

    let out = 0

    for (let a = 0; a < modes.length; a++) {
      const x = modes[a]! >> 1

      if (x < from || x > to) {
        out++
      }
    }

    total += w * out
  })

  return total
}

// a copy of a store (for the reversibility check)
export function copyStore(s: ConeStore): ConeStore {
  const c = coneStore(s.n, s.line, s.cap)

  eachConfiguration(s, (modes, re, im) => {
    addAmp(c, modes, re, im)
  })

  return c
}

// the largest amplitude difference between two stores (configurations missing from one count as 0 there)
export function storeDifference(a: ConeStore, b: ConeStore): number {
  const map = new Map<string, [number, number]>()

  eachConfiguration(a, (modes, re, im) => {
    map.set(modes.join(','), [re, im])
  })

  let worst = 0

  eachConfiguration(b, (modes, re, im) => {
    const k = modes.join(',')
    const v = map.get(k) ?? [0, 0]

    worst = Math.max(worst, Math.abs(v[0] - re), Math.abs(v[1] - im))
    map.delete(k)
  })

  for (const [re, im] of map.values()) {
    worst = Math.max(worst, Math.abs(re), Math.abs(im))
  }

  return worst
}
