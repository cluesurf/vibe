// THE CROSS-LINE PIECES ON A SPARSE BALL (the board proposal's instrument). A dense
// branch of the exact R = 4 ball is 17.5 MB (162,049 docks x 108 bytes), so the ball arms store a configuration as its
// occupied slots alone, beside its link register and one exact amplitude per clock count. The beat is
// code/rule/cross-line-pieces' 'split' beat (the working beat with the optional sign and S1 cost) written on that store,
// operation for operation, and the experiment checks it equals the dense one (0 differing entries) on the R = 1 and R = 2
// balls before it is trusted on R = 4.
//
// SCOPE, refused outside it: open loves and fears with point 0 (the meetings then only take their phase w), no store,
// no closed vibe, and no line holding a love and a fear (the pair move would act; the dense rule handles it, this store
// does not).
//
// NOTHING MOVES the rule: exact in Z[w][1/2] per clock count, as the dense pieces; floats only in `physical`.

import { FRAME_SLOTS, modeIndex } from '@/code/rule/coined-locked-knit'
import { times, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { BOUNCE_TABLE, bouncePermutation } from '@/code/rule/bounce-pair-knit'
import {
  linkOf,
  localMode,
  registerKey,
  reorderParity,
  type CrossOptions,
  type CrossState,
  type Register,
} from '@/code/rule/cross-line-pieces'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'

export type Amp = { a: bigint; b: bigint; k: number }

// one configuration with its register: occupied slots (ascending) and their values, amplitudes by clock count
export type SparseTerm = {
  slots: Int32Array
  values: Int8Array
  reg: Register
  amps: Map<number, Amp>
}

export type SparseState = Map<string, SparseTerm>

export type SparseTally = { kFired: number; frontier: number }

export const newSparseTally = (): SparseTally => ({ kFired: 0, frontier: 0 })

// D's coefficients over 2 (forward): keep (2 + w), cross -w; a full open line's det 1 + w (coined-locked-knit HALF_*);
// the meeting's same-point phase w
const HALF_KEEP: [bigint, bigint] = [2n, 1n]
const HALF_CROSS: [bigint, bigint] = [0n, -1n]
const HALF_DET: [bigint, bigint] = [1n, 1n]
const PHASE: [bigint, bigint] = [0n, 1n]

const SECOND_OF = LINE_FIRSTS.map(f => OPPOSITE[f]!)
const mod = (a: number, m: number): number => ((a % m) + m) % m

const termKey = (slots: Int32Array, values: Int8Array, reg: Register): string =>
  `${Array.from(slots, (s, i) => `${s}${values[i]! > 0 ? '+' : '-'}`).join(',')}|${registerKey(reg)}`

function reduce(x: Amp): Amp {
  let { a, b, k } = x

  while (k > 0 && a % 2n === 0n && b % 2n === 0n) {
    a /= 2n
    b /= 2n
    k--
  }

  return { a, b, k }
}

function addAmp(into: Map<number, Amp>, e: number, x: Amp): void {
  const o = into.get(e)

  if (!o) {
    const r = reduce(x)

    if (r.a !== 0n || r.b !== 0n) {
      into.set(e, r)
    }

    return
  }

  const k = Math.max(o.k, x.k)
  const a = o.a * (1n << BigInt(k - o.k)) + x.a * (1n << BigInt(k - x.k))
  const b = o.b * (1n << BigInt(k - o.k)) + x.b * (1n << BigInt(k - x.k))
  const r = reduce({ a, b, k })

  if (r.a === 0n && r.b === 0n) {
    into.delete(e)
  } else {
    into.set(e, r)
  }
}

function scaled(amps: Map<number, Amp>, u: bigint, v: bigint, dk: number, shift = 0, clock = 1): Map<number, Amp> {
  const out = new Map<number, Amp>()

  for (const [e, x] of amps) {
    const y = { a: x.a, b: x.b }

    times(y, u, v)
    out.set(clock > 1 ? mod(e + shift, clock) : e, { a: y.a, b: y.b, k: x.k + dk })
  }

  return out
}

function put(out: SparseState, slots: Int32Array, values: Int8Array, reg: Register, amps: Map<number, Amp>): void {
  const order = Array.from(slots.keys()).sort((p, q) => slots[p]! - slots[q]!)
  const s = Int32Array.from(order, i => slots[i]!)
  const v = Int8Array.from(order, i => values[i]!)
  const key = termKey(s, v, reg)
  const o = out.get(key)

  if (!o) {
    const fresh = new Map<number, Amp>()

    for (const [e, x] of amps) {
      addAmp(fresh, e, x)
    }

    if (fresh.size > 0) {
      out.set(key, { slots: s, values: v, reg, amps: fresh })
    }

    return
  }

  for (const [e, x] of amps) {
    addAmp(o.amps, e, x)
  }

  if (o.amps.size === 0) {
    out.delete(key)
  }
}

// a sparse state from dense slices (refuses outside the scope)
export function sparseOf(s: CrossState): SparseState {
  const out: SparseState = new Map()

  for (const { e, reg, branches } of s.values()) {
    for (const br of branches) {
      const slots: number[] = []
      const values: number[] = []

      for (let i = 0; i < br.vibe.length; i++) {
        if (br.vibe[i] === 0) {
          continue
        }

        if (br.open[i] !== 1 || br.point[i] !== 0) {
          throw new Error('cross-ball: a closed vibe or a nonzero point is outside the sparse store')
        }

        slots.push(i)
        values.push(br.vibe[i]!)
      }

      if (br.store.some(v => v !== 0)) {
        throw new Error('cross-ball: a store is outside the sparse store')
      }

      put(out, Int32Array.from(slots), Int8Array.from(values), reg, new Map([[e, { a: br.a, b: br.b, k: br.k }]]))
    }
  }

  return out
}

// entries where two sparse states differ exactly (0 when equal)
export function sparseDiffer(a: SparseState, b: SparseState): number {
  let n = 0

  for (const k of new Set([...a.keys(), ...b.keys()])) {
    const x = a.get(k)?.amps ?? new Map<number, Amp>()
    const y = b.get(k)?.amps ?? new Map<number, Amp>()

    for (const e of new Set([...x.keys(), ...y.keys()])) {
      const p = x.get(e)
      const q = y.get(e)

      if (!p || !q || p.a !== q.a || p.b !== q.b || p.k !== q.k) {
        n++
      }
    }
  }

  return n
}

// ---- the beat's parts on one term ----

type Part = { slots: Int32Array; values: Int8Array; u: bigint; v: bigint; dk: number; parity: number }

const lineSlots = (x: number, l: number): [number, number] => [x * 24 + LINE_FIRSTS[l]!, x * 24 + SECOND_OF[l]!]

// the half coin D on every line of the term: the parts it becomes
function halfCoin(slots: Int32Array, values: Int8Array): Part[] {
  const at = new Map<number, number>()

  slots.forEach((s, i) => at.set(s, i))

  let u = 1n
  let v = 0n

  const halves: [number, number][] = []
  const seen = new Set<string>()

  for (const s of slots) {
    const x = Math.floor(s / 24)
    const l = LINE_OF[s % 24]!
    const key = `${x},${l}`

    if (seen.has(key)) {
      continue
    }

    seen.add(key)

    const [f, g] = lineSlots(x, l)
    const hf = at.has(f)
    const hg = at.has(g)

    if (hf && hg) {
      const y = { a: u, b: v }

      times(y, HALF_DET[0], HALF_DET[1])
      u = y.a
      v = y.b
    } else {
      halves.push(hf ? [at.get(f)!, g] : [at.get(g)!, f])
    }
  }

  const out: Part[] = []

  for (let mask = 0; mask < 1 << halves.length; mask++) {
    const s = Int32Array.from(slots)
    const y = { a: u, b: v }

    halves.forEach(([i, other], n) => {
      if ((mask >> n) & 1) {
        s[i] = other
        times(y, HALF_CROSS[0], HALF_CROSS[1])
      } else {
        times(y, HALF_KEEP[0], HALF_KEEP[1])
      }
    })

    out.push({ slots: s, values: values, u: y.a, v: y.b, dk: halves.length, parity: 0 })
  }

  return out
}

// the meetings: a full line of two like vibes (points equal) takes w
function meetPhase(slots: Int32Array, values: Int8Array): [bigint, bigint] {
  const at = new Map<number, number>()

  slots.forEach((s, i) => at.set(s, values[i]!))

  const y = { a: 1n, b: 0n }

  for (const s of slots) {
    const d = s % 24

    if (OPPOSITE[d]! < d) {
      continue
    }

    const t = s - d + OPPOSITE[d]!

    if (at.has(t)) {
      if (at.get(t) !== at.get(s)) {
        throw new Error('cross-ball: a love and a fear on one line is outside the sparse store')
      }

      times(y, PHASE[0], PHASE[1])
    }
  }

  return [y.a, y.b]
}

const DOCK = new Int8Array(24)
const PERM = new Int32Array(24)

// the collision at every occupied dock (B or K, the pair move idle), with the sign's parity
function collide(
  t: LockedTables,
  slots: Int32Array,
  values: Int8Array,
  beat: number,
  tally?: SparseTally,
): { slots: Int32Array; parity: number } {
  const out = Int32Array.from(slots)
  const docks = [...new Set(Array.from(slots, s => Math.floor(s / 24)))]

  // the pair move is idle on this store (no store, no love beside a fear on a line), so the beat's piece order
  // (collisionOrder 'alternate') leaves the dock permutation alone
  void beat

  let parity = 0

  for (const x of docks) {
    DOCK.fill(0)

    const here: number[] = []

    slots.forEach((s, i) => {
      if (Math.floor(s / 24) === x) {
        DOCK[s % 24] = values[i]!
        here.push(i)
      }
    })

    const kind = bouncePermutation(BOUNCE_TABLE, t.collision, DOCK, 0, PERM)

    if (kind === 0) {
      continue
    }

    let singles = 0

    for (let l = 0; l < 12; l++) {
      if ((DOCK[LINE_FIRSTS[l]!] !== 0) !== (DOCK[SECOND_OF[l]!] !== 0)) {
        singles++
      }
    }

    if (tally && singles > 1) {
      tally.kFired++
    }

    const keys: number[] = []
    const images: number[] = []

    for (const i of here) {
      const d = slots[i]! % 24

      keys.push(localMode(d))
      images.push(localMode(PERM[d]!))
      out[i] = x * 24 + PERM[d]!
    }

    parity ^= reorderParity(keys, images)
  }

  return { slots: out, parity }
}

// the stream with its sign's parity and the register after
function stream(
  t: LockedTables,
  slots: Int32Array,
  values: Int8Array,
  reg: Register,
  cost: boolean,
  tally?: SparseTally,
): { slots: Int32Array; parity: number; reg: Register } {
  const out = Int32Array.from(slots, s => t.target[s]!)
  const next = new Map(reg)

  if (cost) {
    slots.forEach((s, i) => {
      const link = linkOf(t, s)

      if (!link) {
        if (tally) {
          tally.frontier++
        }

        return
      }

      const f = mod((next.get(link.id) ?? 0) - values[i]! * link.dir, 3)

      if (f === 0) {
        next.delete(link.id)
      } else {
        next.set(link.id, f)
      }
    })
  } else if (tally) {
    slots.forEach(s => {
      if (Math.floor(t.target[s]! / 24) === Math.floor(s / 24)) {
        tally.frontier++
      }
    })
  }

  return {
    slots: out,
    parity: reorderParity(
      Array.from(slots, modeIndex),
      Array.from(out, modeIndex),
    ),
    reg: cost ? next : reg,
  }
}

// ONE 'split' BEAT of the sparse state: cost, D, meetings, collision, D, stream (cross-line-pieces crossBeat)
export function sparseBeat(
  options: CrossOptions,
  t: LockedTables,
  s: SparseState,
  beat: number,
  tally?: SparseTally,
): SparseState {
  if ((options.place ?? 'split') !== 'split') {
    throw new Error('cross-ball: the sparse store runs the split place only')
  }

  const clock = options.clock ?? 18

  // cost, D, meetings, collision: collected into a mid state (register unchanged)
  const mid: SparseState = new Map()

  for (const term of s.values()) {
    const shift = options.cost ? -term.reg.size : 0
    const amps0 = shift === 0 ? term.amps : scaled(term.amps, 1n, 0n, 0, shift, clock)

    for (const p of halfCoin(term.slots, term.values)) {
      const [mu, mv] = meetPhase(p.slots, p.values)
      const y = { a: p.u, b: p.v }

      times(y, mu, mv)

      const c = collide(t, p.slots, p.values, beat, tally)
      const sg = options.sign && c.parity === 1 ? -1n : 1n

      put(mid, c.slots, p.values, term.reg, scaled(amps0, sg * y.a, sg * y.b, p.dk))
    }
  }

  const out: SparseState = new Map()

  for (const term of mid.values()) {
    for (const p of halfCoin(term.slots, term.values)) {
      const st = stream(t, p.slots, p.values, term.reg, options.cost, tally)
      const sg = options.sign && st.parity === 1 ? -1n : 1n

      put(out, st.slots, p.values, st.reg, scaled(term.amps, sg * p.u, sg * p.v, p.dk))
    }
  }

  return out
}

// a sparse start: one configuration of open loves (and fears) at the given slots, amplitude 1, with its register
export function sparseStart(slots: readonly number[], values: readonly number[], reg: Register): SparseState {
  const out: SparseState = new Map()

  put(out, Int32Array.from(slots), Int8Array.from(values), reg, new Map([[0, { a: 1n, b: 0n, k: 0 }]]))

  return out
}

const SQ3 = Math.sqrt(3)

// the physical amplitude of a term: sum_e (a + b w) / 2^k zeta_clock^e
export function physical(term: SparseTerm, clock: number): [number, number] {
  let re = 0
  let im = 0

  for (const [e, x] of term.amps) {
    const s = 2 ** -x.k
    const ar = (Number(x.a) - Number(x.b) / 2) * s
    const ai = ((Number(x.b) * SQ3) / 2) * s
    const th = (2 * Math.PI * e) / clock
    const c = Math.cos(th)
    const n = Math.sin(th)

    re += ar * c - ai * n
    im += ar * n + ai * c
  }

  return [re, im]
}

// the exact summed norm over clock slices: sum N(a + b w) 4^(K - k) against 4^K
export function sparseNorm(s: SparseState): { total: bigint; unit: bigint } {
  const all = [...s.values()].flatMap(t => [...t.amps.values()])
  const K = Math.max(0, ...all.map(x => x.k))

  let total = 0n

  for (const x of all) {
    total += (x.a * x.a - x.a * x.b + x.b * x.b) * (1n << BigInt(2 * (K - x.k)))
  }

  return { total, unit: 1n << BigInt(2 * K) }
}

// ---- E-SLF-0190's locked mixer on the sparse store (additive) ----

// the opened locks of a term: every (dock, frame) holding exactly one vibe (open, the store's scope) whose dock has an
// occupied facet neighbour (read on all 24 facets through the stream's targets; a reflecting frontier slot has none)
export function openedLocks(t: LockedTables, slots: Int32Array): { base: number; frame: number; q: number }[] {
  const occupied = new Set(Array.from(slots, s => Math.floor(s / 24)))
  const held = new Set(slots)
  const out: { base: number; frame: number; q: number }[] = []

  for (const x of occupied) {
    let open = false

    for (let d = 0; d < 24 && !open; d++) {
      const y = Math.floor(t.target[x * 24 + d]! / 24)

      open = y !== x && occupied.has(y)
    }

    if (!open) {
      continue
    }

    const base = x * 24

    for (let f = 0; f < 3; f++) {
      const ss = FRAME_SLOTS[f]!

      let n = 0
      let at = -1

      for (let q = 0; q < 8; q++) {
        if (held.has(base + ss[q]!)) {
          n++
          at = q
        }
      }

      if (n === 1) {
        out.push({ base, frame: f, q: at })
      }
    }
  }

  return out
}

// LF-G on the sparse store: G of F-G (keep 3/4, -1/4 to each other slot of the frame) on every opened lock of each
// term, exact in Z[w][1/2]. G keeps each dock's vibe count, so every lock it reads is kept, and it is its own inverse.
// Equal to E-SLF-0190's lockedMixBranch on the branch code (the experiment's I1 gate)
export function sparseLockedMix(t: LockedTables, s: SparseState): SparseState {
  const out: SparseState = new Map()

  for (const term of s.values()) {
    const lone = openedLocks(t, term.slots)

    if (lone.length === 0) {
      put(out, term.slots, term.values, term.reg, term.amps)
      continue
    }

    if (lone.length > 6) {
      throw new Error(`cross-ball: ${lone.length} opened locks in one term, over the guard 6`)
    }

    const index = new Map<number, number>()

    term.slots.forEach((x, i) => index.set(x, i))

    for (let code = 0; code < 8 ** lone.length; code++) {
      const slots = Int32Array.from(term.slots)

      let rest = code
      let sign = 1n

      for (const { base, frame, q } of lone) {
        const o = rest % 8
        const ss = FRAME_SLOTS[frame]!

        rest = (rest - o) / 8

        if (o === 0) {
          sign *= 3n
          continue
        }

        slots[index.get(base + ss[q]!)!] = base + ss[q ^ o]!
        sign *= -1n
      }

      put(out, slots, term.values, term.reg, scaled(term.amps, sign, 0n, 2 * lone.length))
    }
  }

  return out
}
