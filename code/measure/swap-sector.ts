// THE FEW-EXCITATION SECTORS OF THE SWAP-MIXED RULE (E-SPN-0145). code/rule/swap-mixer is the rule: the ring mixer, the
// swap coin, the working beat. On the flat love sea every piece but the stream acts inside one dock, and a dock that is
// the sea's (24 loves at point 0, open, no store) takes one fixed factor, so the state of a few excitations is a sum of
// configurations that differ from the sea at a few docks. This file carries such sums on the INFINITE D4 lattice:
//
//   dockOutcomes   the rule's own pieces (ringDockMixBranch, swapCoinBranch, meetBranch, collideVeto) run on ONE dock,
//                  read as a list of outcomes with Eisenstein numerators over ringScale 2^k. Nothing is re-derived:
//                  the numbers are the rule's. A sea dock gives one outcome, itself, times F = 24 num (the mixer's u,
//                  twelve full lines' det X^12 = 1 and twelve meetings' w^12 = 1).
//   sectorBeat     one beat of a sparse sum: every defect dock takes its outcomes, the product over defect docks, then
//                  the stream takes every slot that differs from the sea one dock along its root. EXACT (rule units:
//                  each beat times F^(cells - defect docks) on a finite box, so it can be compared with the rule's
//                  superposed run entry for entry) or FLOAT (each defect dock divided by F, the sea's phase removed).
//   pairBeat       two holes at total momentum K, in the relative coordinate y = x1 - x2 on a ball of D4, floats: off
//                  contact (y != 0) each hole takes the one-hole dock matrix A, at contact (y = 0) the pair takes the
//                  two-hole dock matrix B, both read from dockOutcomes; then the stream. Weight leaving the ball is
//                  absorbed and counted.
//   holeWalk       one hole on a D4 ball, floats, the dock matrix A and the stream (for the speed readings).
//
// The configuration amplitude is the rule's (no stream sign: the superposed rule of E-SPN-0140 carries none, and a
// hop's fermion sign lives inside the mixer). DETERMINISM: no random numbers. EXACT where stated; the float runs are
// measurement of maps whose entries are read exactly from the rule. NOTHING MOVES: the pieces hand values between slots
// of one dock; the stream takes each slot's value one dock along.

import { rootsD4 } from '@/code/algebra/group/integer-roots'
import { modeIndex } from '@/code/rule/coined-locked-knit'
import {
  type Branch,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { LINE_OF } from '@/code/rule/isometric-knit'
import {
  collideVeto,
  meetBranch,
} from '@/code/rule/occupation-veto-knit'
import { mergeBranches } from '@/code/rule/doublet-locked-knit'
import {
  ringDockMixBranch,
  ringScale,
  swapCoinBranch,
  SWAP_ANGLE,
  type RingUnit,
} from '@/code/rule/swap-mixer'
import {
  BOUNCE_TABLE,
  bouncePermutation,
} from '@/code/rule/bounce-pair-knit'
import {
  d4BoxCell,
  d4BoxMesh,
  d4Coordinates,
} from '@/code/substrate/d4-box-integer'

export const ROOTS: readonly (readonly number[])[] = rootsD4()

// ---- one dock ----

export type DockState = {
  vibe: Int8Array
  point: Int8Array
  open: Uint8Array
  store: Int8Array
  spoint: Int8Array
  sopen: Uint8Array
}

export const seaDock = (): DockState => ({
  vibe: new Int8Array(24).fill(1),
  point: new Int8Array(24),
  open: new Uint8Array(24).fill(1),
  store: new Int8Array(12),
  spoint: new Int8Array(12),
  sopen: new Uint8Array(12),
})

export const cloneDock = (s: DockState): DockState => ({
  vibe: Int8Array.from(s.vibe),
  point: Int8Array.from(s.point),
  open: Uint8Array.from(s.open),
  store: Int8Array.from(s.store),
  spoint: Int8Array.from(s.spoint),
  sopen: Uint8Array.from(s.sopen),
})

// a slot differs from the sea unless it holds a love at point 0, open
export const seaSlot = (s: DockState, d: number): boolean =>
  s.vibe[d] === 1 && s.point[d] === 0 && s.open[d] === 1

export function isSeaDock(s: DockState): boolean {
  for (let d = 0; d < 24; d++) {
    if (!seaSlot(s, d)) {
      return false
    }
  }

  for (let l = 0; l < 12; l++) {
    if (s.store[l] !== 0) {
      return false
    }
  }

  return true
}

export function dockKey(s: DockState): string {
  let k = ''

  for (let d = 0; d < 24; d++) {
    if (!seaSlot(s, d)) {
      k += `${d}:${s.vibe[d]}:${s.point[d]}:${s.open[d]};`
    }
  }

  k += '|'

  for (let l = 0; l < 12; l++) {
    if (s.store[l] !== 0) {
      k += `${l}:${s.store[l]}:${s.spoint[l]}:${s.sopen[l]};`
    }
  }

  return k
}

// a one-dock table for the collision (the collision reads only the kind and the dock count)
const ONE_DOCK: LockedTables = {
  cells: 1,
  collision: 'pass',
  veto: false,
  target: new Int32Array(24),
  source: new Int32Array(24),
  move: new Int8Array(216),
  back: new Int8Array(216),
}

// the rule's tables on a side-L D4 box with flat links (every grid move the identity) and the contact 'pass', built
// from the box mesh alone (contactFresh needs a side divisible by 4 for its vacuum store, which the love sea never uses)
export function flatBoxTables(side: number): LockedTables {
  const mesh = d4BoxMesh({ side })
  const cells = mesh.cellCount
  const target = new Int32Array(cells * 24)
  const source = new Int32Array(cells * 24)
  const move = new Int8Array(cells * 24 * 9)

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < 24; d++) {
      const to = mesh.neighbour(x, d) * 24 + d

      target[x * 24 + d] = to
      source[to] = x * 24 + d
    }
  }

  for (let i = 0; i < cells * 24; i++) {
    for (let p = 0; p < 9; p++) {
      move[i * 9 + p] = p
    }
  }

  return {
    cells,
    collision: 'pass',
    veto: true,
    target,
    source,
    move,
    back: Int8Array.from(move),
  }
}

// a rule configuration's key on the box: its non-sea docks as `${cell}=${dockKey}`, sorted
export function ruleBoxKey(
  c: {
    vibe: Int8Array
    point: Int8Array
    open: Uint8Array
    store: Int8Array
    spoint: Int8Array
    sopen: Uint8Array
  },
  cells: number,
): string {
  const out: string[] = []

  for (let x = 0; x < cells; x++) {
    const d: DockState = {
      vibe: c.vibe.slice(x * 24, x * 24 + 24),
      point: c.point.slice(x * 24, x * 24 + 24),
      open: c.open.slice(x * 24, x * 24 + 24),
      store: c.store.slice(x * 12, x * 12 + 12),
      spoint: c.spoint.slice(x * 12, x * 12 + 12),
      sopen: c.sopen.slice(x * 12, x * 12 + 12),
    }

    if (!isSeaDock(d)) {
      out.push(`${x}=${dockKey(d)}`)
    }
  }

  return out.sort().join('/')
}

// a lattice configuration folded onto the side-L box (docks at one cell overlaid), in ruleBoxKey's form; `aliased` when
// two of its excitations land on one slot or one store of the box (the box then holds a different configuration)
export function foldedBoxKey(
  c: Config,
  side: number,
): { key: string; aliased: boolean } {
  const byCell = new Map<number, DockState>()

  let aliased = false

  for (const { x, s } of c.docks) {
    const cell = d4BoxCell({ coordinates: d4Coordinates(x), side })

    let t = byCell.get(cell)

    if (!t) {
      t = seaDock()
      byCell.set(cell, t)
    }

    for (let d = 0; d < 24; d++) {
      if (seaSlot(s, d)) {
        continue
      }

      if (!seaSlot(t, d)) {
        aliased = true
      }

      t.vibe[d] = s.vibe[d]!
      t.point[d] = s.point[d]!
      t.open[d] = s.open[d]!
    }

    for (let l = 0; l < 12; l++) {
      if (s.store[l] === 0) {
        continue
      }

      if (t.store[l] !== 0) {
        aliased = true
      }

      t.store[l] = s.store[l]!
      t.spoint[l] = s.spoint[l]!
      t.sopen[l] = s.sopen[l]!
    }
  }

  return {
    key: [...byCell]
      .filter(([, s]) => !isSeaDock(s))
      .map(([x, s]) => `${x}=${dockKey(s)}`)
      .sort()
      .join('/'),
    aliased,
  }
}

export type Outcome = {
  state: DockState
  a: bigint
  b: bigint
  k: number
}

const OUTCOMES = new Map<string, { input: DockState; out: Outcome[] }>()

// every dock state the sums have met, with its outcomes (for the per-dock register check)
export const metDocks = (): { input: DockState; out: Outcome[] }[] => [
  ...OUTCOMES.values(),
]

// the rule's pieces before the stream on one dock (the mixer scaled by ringScale(u), the swap coin, the meetings, the
// collision of beat `beat`): the outcomes with numerators over ringScale(u) 2^k
export function dockOutcomes(
  s: DockState,
  beat: number,
  u: RingUnit = SWAP_ANGLE,
): Outcome[] {
  const key = `${beat % 2}#${u.num.join(',')}/${u.den}#${dockKey(s)}`
  const hit = OUTCOMES.get(key)

  if (hit) {
    return hit.out
  }

  const br: Branch = { ...cloneDock(s), a: 1n, b: 0n, k: 0 }
  const mixed = mergeBranches(ringDockMixBranch(1, br, u, false))
  const coined = mixed.flatMap(b => swapCoinBranch(1, b))
  const met = coined.flatMap(b => meetBranch(b, 1, false))

  for (const b of met) {
    collideVeto('none', ONE_DOCK, b, beat, false)
  }

  const out = mergeBranches(met).map(b => ({
    state: {
      vibe: b.vibe,
      point: b.point,
      open: b.open,
      store: b.store,
      spoint: b.spoint,
      sopen: b.sopen,
    },
    a: b.a,
    b: b.b,
    k: b.k,
  }))

  OUTCOMES.set(key, { input: cloneDock(s), out })

  return out
}

// the sea dock's factor F (numerator over ringScale): read from the rule, and required to be the sea itself alone
export function seaFactor(u: RingUnit = SWAP_ANGLE): [bigint, bigint] {
  const o = dockOutcomes(seaDock(), 0, u)

  if (o.length !== 1 || !isSeaDock(o[0]!.state) || o[0]!.k !== 0) {
    throw new Error('swap-sector: the sea dock is not stationary')
  }

  return [o[0]!.a, o[0]!.b]
}

// ---- Eisenstein and complex helpers ----

export type Eis = [bigint, bigint]

export const eMul = (x: Eis, y: Eis): Eis => [
  x[0] * y[0] - x[1] * y[1],
  x[0] * y[1] + x[1] * y[0] - x[1] * y[1],
]
export const eNorm = (x: Eis): bigint =>
  x[0] * x[0] - x[0] * x[1] + x[1] * x[1]

export const ePow = (x: Eis, n: number): Eis => {
  let r: Eis = [1n, 0n]

  for (let i = 0; i < n; i++) {
    r = eMul(r, x)
  }

  return r
}

const W_IM = Math.sqrt(3) / 2

// (a + b w) as a complex float
export const eFloat = (a: bigint, b: bigint): [number, number] => [
  Number(a) - Number(b) / 2,
  Number(b) * W_IM,
]

// ---- sparse sums on the infinite lattice ----

export type Vec = readonly number[]

const vkey = (v: Vec): string => v.join(',')

// a configuration: its defect docks (position and state), keyed canonically
export type Config = { docks: { x: number[]; s: DockState }[] }

export function configKey(c: Config): string {
  return c.docks
    .map(d => `${vkey(d.x)}=${dockKey(d.s)}`)
    .sort()
    .join('/')
}

export type ExactAmp = { a: bigint; b: bigint; k: number }
export type ExactSum = Map<string, { c: Config; amp: ExactAmp }>
export type FloatSum = Map<
  string,
  { c: Config; re: number; im: number }
>

// a configuration from a list of marks on the sea: { x, slot, vibe } (vibe 0 a hole, -1 a fear) and { x, line, store }
export function markedConfig(
  marks: readonly {
    x: number[]
    slot?: number
    vibe?: number
    line?: number
    store?: number
  }[],
): Config {
  const byDock = new Map<string, { x: number[]; s: DockState }>()

  for (const m of marks) {
    const k = vkey(m.x)

    let d = byDock.get(k)

    if (!d) {
      d = { x: [...m.x], s: seaDock() }
      byDock.set(k, d)
    }

    if (m.slot !== undefined) {
      d.s.vibe[m.slot] = m.vibe ?? 0
      d.s.point[m.slot] = 0
      d.s.open[m.slot] = (m.vibe ?? 0) === 0 ? 0 : 1
    }

    if (m.line !== undefined) {
      d.s.store[m.line] = m.store ?? 1
      d.s.spoint[m.line] = 0
      d.s.sopen[m.line] = 3
    }
  }

  return { docks: [...byDock.values()] }
}

// the stream of one outcome list (dock position and state after the pieces): every slot that differs from the sea goes
// one dock along its root; stores stay
function streamed(
  parts: readonly { x: number[]; s: DockState }[],
): Config {
  const byDock = new Map<string, { x: number[]; s: DockState }>()

  const at = (x: number[]): DockState => {
    const k = vkey(x)

    let d = byDock.get(k)

    if (!d) {
      d = { x, s: seaDock() }
      byDock.set(k, d)
    }

    return d.s
  }

  for (const { x, s } of parts) {
    for (let d = 0; d < 24; d++) {
      if (seaSlot(s, d)) {
        continue
      }

      const r = ROOTS[d]!
      const t = at(x.map((c, k) => c + r[k]!))

      t.vibe[d] = s.vibe[d]!
      t.point[d] = s.point[d]!
      t.open[d] = s.open[d]!
    }

    for (let l = 0; l < 12; l++) {
      if (s.store[l] === 0) {
        continue
      }

      const t = at([...x])

      t.store[l] = s.store[l]!
      t.spoint[l] = s.spoint[l]!
      t.sopen[l] = s.sopen[l]!
    }
  }

  return { docks: [...byDock.values()].filter(d => !isSeaDock(d.s)) }
}

// every product of the defect docks' outcomes: calls `each` with the parts, the numerator product and its 2-power
function products(
  c: Config,
  beat: number,
  u: RingUnit,
  each: (
    parts: { x: number[]; s: DockState }[],
    a: bigint,
    b: bigint,
    k: number,
  ) => void,
): void {
  const lists = c.docks.map(d => dockOutcomes(d.s, beat, u))
  const idx = new Array<number>(lists.length).fill(0)

  if (lists.some(l => l.length === 0)) {
    return
  }

  for (;;) {
    let amp: Eis = [1n, 0n]
    let k = 0

    const parts: { x: number[]; s: DockState }[] = []

    lists.forEach((l, i) => {
      const o = l[idx[i]!]!

      amp = eMul(amp, [o.a, o.b])
      k += o.k
      parts.push({ x: (c.docks[i] as { x: number[] }).x, s: o.state })
    })

    each(parts, amp[0], amp[1], k)

    let i = 0

    while (i < lists.length) {
      idx[i]!++

      if (idx[i]! < lists[i]!.length) {
        break
      }

      idx[i] = 0
      i++
    }

    if (i === lists.length) {
      return
    }
  }
}

// one exact beat in rule units on a box of `cells` docks: each configuration also takes F^(cells - its defect docks)
export function exactBeat(
  sum: ExactSum,
  beat: number,
  cells: number,
  u: RingUnit = SWAP_ANGLE,
): ExactSum {
  const F = seaFactor(u)
  const out: ExactSum = new Map()

  for (const { c, amp } of sum.values()) {
    const full = ePow(F, cells - c.docks.length)

    products(c, beat, u, (parts, a, b, k) => {
      const next = streamed(parts)
      const key = configKey(next)
      const z = eMul(eMul([amp.a, amp.b], [a, b]), full)
      const kk = amp.k + k
      const o = out.get(key)

      if (!o) {
        out.set(key, { c: next, amp: { a: z[0], b: z[1], k: kk } })

        return
      }

      const K = Math.max(o.amp.k, kk)
      const s1 = 1n << BigInt(K - o.amp.k)
      const s2 = 1n << BigInt(K - kk)

      o.amp = {
        a: o.amp.a * s1 + z[0] * s2,
        b: o.amp.b * s1 + z[1] * s2,
        k: K,
      }
    })
  }

  for (const [key, v] of out) {
    if (v.amp.a === 0n && v.amp.b === 0n) {
      out.delete(key)
    }
  }

  return out
}

// one float beat with the sea's phase removed (each defect dock's outcome divided by F), dropping configurations whose
// weight is below `floor` (the dropped weight is added to `lost`)
export function floatBeat(
  sum: FloatSum,
  beat: number,
  u: RingUnit = SWAP_ANGLE,
  floor = 0,
  lost?: { weight: number },
): FloatSum {
  const [fr, fi] = eFloat(...seaFactor(u))
  const f2 = fr * fr + fi * fi
  const out: FloatSum = new Map()

  for (const { c, re, im } of sum.values()) {
    products(c, beat, u, (parts, a, b, k) => {
      const next = streamed(parts)
      const key = configKey(next)

      let [zr, zi] = eFloat(a, b)

      const scale = 2 ** -k

      zr *= scale
      zi *= scale

      // divide by F once per defect dock
      for (let i = 0; i < parts.length; i++) {
        const nr = (zr * fr + zi * fi) / f2
        const ni = (zi * fr - zr * fi) / f2

        zr = nr
        zi = ni
      }

      const r = re * zr - im * zi
      const m = re * zi + im * zr
      const o = out.get(key)

      if (o) {
        o.re += r
        o.im += m
      } else {
        out.set(key, { c: next, re: r, im: m })
      }
    })
  }

  for (const [key, v] of out) {
    const w = v.re * v.re + v.im * v.im

    if (w <= floor) {
      out.delete(key)

      if (lost) {
        lost.weight += w
      }
    }
  }

  return out
}

// the rule's superposed branches against an exact sum folded onto the box: the entries off (a branch with no match or
// another amplitude, or a folded sum entry with no branch), and the number of aliased sum entries (0 for a clean check)
export function compareWithRule(
  branches: readonly Branch[],
  sum: ExactSum,
  side: number,
): { off: number; aliased: number; rule: number; engine: number } {
  const folded = new Map<string, ExactAmp>()

  let aliased = 0

  for (const { c, amp } of sum.values()) {
    const f = foldedBoxKey(c, side)

    if (f.aliased) {
      aliased++
    }

    const o = folded.get(f.key)

    if (!o) {
      folded.set(f.key, { ...amp })
      continue
    }

    const K = Math.max(o.k, amp.k)

    o.a =
      o.a * (1n << BigInt(K - o.k)) + amp.a * (1n << BigInt(K - amp.k))

    o.b =
      o.b * (1n << BigInt(K - o.k)) + amp.b * (1n << BigInt(K - amp.k))
    o.k = K
  }

  for (const [key, v] of folded) {
    if (v.a === 0n && v.b === 0n) {
      folded.delete(key)
    }
  }

  const cells = side ** 4

  let off = 0

  for (const br of branches) {
    const e = folded.get(ruleBoxKey(br, cells))

    if (!e) {
      off++
      continue
    }

    const K = Math.max(e.k, br.k)

    if (
      br.a * (1n << BigInt(K - br.k)) !==
        e.a * (1n << BigInt(K - e.k)) ||
      br.b * (1n << BigInt(K - br.k)) !== e.b * (1n << BigInt(K - e.k))
    ) {
      off++
    }
  }

  return {
    off: off + Math.max(0, folded.size - branches.length),
    aliased,
    rule: branches.length,
    engine: folded.size,
  }
}

// ---- the dock matrices of one and two holes (the configuration basis, no sign), from the rule ----

export type ExactMatrix = { entries: Eis[][]; k: number }

// A[to][from] for a lone hole in a love dock: numerators over ringScale 2^k, the rule's pieces before the stream
export function holeDockExact(
  beat: number,
  u: RingUnit = SWAP_ANGLE,
  pieces: 'all' | 'mixer-coin' = 'all',
): ExactMatrix {
  const entries: Eis[][] = Array.from({ length: 24 }, () =>
    Array.from({ length: 24 }, (): Eis => [0n, 0n]),
  )

  let kMax = 0

  const found: {
    from: number
    to: number
    a: bigint
    b: bigint
    k: number
  }[] = []

  for (let from = 0; from < 24; from++) {
    const s = seaDock()

    s.vibe[from] = 0
    s.open[from] = 0

    const outs =
      pieces === 'all'
        ? dockOutcomes(s, beat, u)
        : mixerCoinOutcomes(s, u)

    for (const o of outs) {
      const holes = [...o.state.vibe]
        .map((v, d) => (v === 0 ? d : -1))
        .filter(d => d >= 0)

      if (
        holes.length !== 1 ||
        [...o.state.store].some(x => x !== 0) ||
        [...o.state.vibe].some(v => v < 0)
      ) {
        throw new Error(
          'swap-sector: a lone hole left the one-hole sector',
        )
      }

      found.push({ from, to: holes[0]!, a: o.a, b: o.b, k: o.k })
      kMax = Math.max(kMax, o.k)
    }
  }

  for (const f of found) {
    const sc = 1n << BigInt(kMax - f.k)
    const e = entries[f.to]![f.from]!

    entries[f.to]![f.from] = [e[0] + f.a * sc, e[1] + f.b * sc]
  }

  return { entries, k: kMax }
}

// the mixer and the coin alone on one dock (E-SPN-0140's ruleDockMatrix reading, for the comparison with the float
// one-body model of code/measure/dock-mixer)
export function mixerCoinOutcomes(
  s: DockState,
  u: RingUnit = SWAP_ANGLE,
): Outcome[] {
  const br: Branch = { ...cloneDock(s), a: 1n, b: 0n, k: 0 }

  return mergeBranches(
    mergeBranches(ringDockMixBranch(1, br, u, false)).flatMap(b =>
      swapCoinBranch(1, b),
    ),
  ).map(b => ({
    state: {
      vibe: b.vibe,
      point: b.point,
      open: b.open,
      store: b.store,
      spoint: b.spoint,
      sopen: b.sopen,
    },
    a: b.a,
    b: b.b,
    k: b.k,
  }))
}

// the unordered pairs of distinct slots, d1 < d2, and their index
export const PAIRS: readonly (readonly [number, number])[] = (() => {
  const out: [number, number][] = []

  for (let a = 0; a < 24; a++) {
    for (let b = a + 1; b < 24; b++) {
      out.push([a, b])
    }
  }

  return out
})()

export const pairIndex = (a: number, b: number): number => {
  const [p, q] = a < b ? [a, b] : [b, a]

  return PAIRS.findIndex(x => x[0] === p && x[1] === q)
}

const PAIR_OF = new Int32Array(576).fill(-1)

PAIRS.forEach(([a, b], i) => {
  PAIR_OF[a * 24 + b] = i
  PAIR_OF[b * 24 + a] = i
})

// B[to][from] over the 276 pairs for two holes in one love dock; `variant` 'rule' is the rule, 'no-contact' runs the
// same pieces with the contact K switched off (the collision's permutation is skipped when the dock holds two singles)
export function pairDockExact(
  beat: number,
  u: RingUnit = SWAP_ANGLE,
): ExactMatrix {
  const entries: Eis[][] = Array.from({ length: 276 }, () =>
    Array.from({ length: 276 }, (): Eis => [0n, 0n]),
  )

  let kMax = 0

  const found: {
    from: number
    to: number
    a: bigint
    b: bigint
    k: number
  }[] = []

  PAIRS.forEach(([p, q], from) => {
    const s = seaDock()

    for (const d of [p, q]) {
      s.vibe[d] = 0
      s.open[d] = 0
    }

    for (const o of dockOutcomes(s, beat, u)) {
      const holes = [...o.state.vibe]
        .map((v, d) => (v === 0 ? d : -1))
        .filter(d => d >= 0)

      if (
        holes.length !== 2 ||
        [...o.state.store].some(x => x !== 0) ||
        [...o.state.vibe].some(v => v < 0)
      ) {
        throw new Error(
          'swap-sector: two holes left the two-hole sector',
        )
      }

      found.push({
        from,
        to: PAIR_OF[holes[0]! * 24 + holes[1]!]!,
        a: o.a,
        b: o.b,
        k: o.k,
      })
      kMax = Math.max(kMax, o.k)
    }
  })

  for (const f of found) {
    const sc = 1n << BigInt(kMax - f.k)
    const e = entries[f.to]![f.from]!

    entries[f.to]![f.from] = [e[0] + f.a * sc, e[1] + f.b * sc]
  }

  return { entries, k: kMax }
}

export type CMat = { n: number; re: Float64Array; im: Float64Array }

// an exact matrix over ringScale 2^k divided by the sea factor F (the sea's phase removed), as floats
export function relativeFloat(
  m: ExactMatrix,
  u: RingUnit = SWAP_ANGLE,
): CMat {
  const n = m.entries.length
  const [fr, fi] = eFloat(...seaFactor(u))
  const f2 = fr * fr + fi * fi
  const scale = 2 ** -m.k
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const e = m.entries[i]![j]!
      const [zr, zi] = eFloat(e[0], e[1])

      re[i * n + j] = ((zr * fr + zi * fi) / f2) * scale
      im[i * n + j] = ((zi * fr - zr * fi) / f2) * scale
    }
  }

  return { n, re, im }
}

// the largest |(M^dag M - I)_ij| of a float matrix
export function unitarityGap(m: CMat): number {
  const { n, re, im } = m

  let gap = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < n; k++) {
        const ar = re[k * n + i]!
        const ai = -im[k * n + i]!
        const br = re[k * n + j]!
        const bi = im[k * n + j]!

        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }

      gap = Math.max(gap, Math.hypot(sr - (i === j ? 1 : 0), si))
    }
  }

  return gap
}

// does the collision's contact K act on a dock holding two holes (two single lines) at p and q
export function contactActs(p: number, q: number): boolean {
  const v = new Int8Array(24).fill(1)
  const perm = new Int32Array(24)

  v[p] = 0
  v[q] = 0

  if (LINE_OF[p] === LINE_OF[q]) {
    return false
  }

  return (
    bouncePermutation(BOUNCE_TABLE, 'pass', v, 0, perm) === 1 &&
    [...perm].some((x, d) => x !== d)
  )
}

// ---- a D4 ball ----

export const d4Steps = (v: Vec): number =>
  Math.max(
    ...v.map(Math.abs),
    v.reduce((s, x) => s + Math.abs(x), 0) / 2,
  )

export type Ball = {
  radius: number
  points: number[][]
  index: Map<string, number>
  step: Int32Array
}

// the D4 points within `radius` root steps, and step[p * 24 + d] the index of p + r_d (or -1 outside)
export function d4Ball(radius: number): Ball {
  const points: number[][] = []

  for (let a = -radius; a <= radius; a++) {
    for (let b = -radius; b <= radius; b++) {
      for (let c = -radius; c <= radius; c++) {
        for (let e = -radius; e <= radius; e++) {
          if ((((a + b + c + e) % 2) + 2) % 2 !== 0) {
            continue
          }

          const v = [a, b, c, e]

          if (d4Steps(v) <= radius) {
            points.push(v)
          }
        }
      }
    }
  }

  const index = new Map(points.map((p, i) => [vkey(p), i]))
  const step = new Int32Array(points.length * 24)

  points.forEach((p, i) => {
    for (let d = 0; d < 24; d++) {
      const r = ROOTS[d]!

      step[i * 24 + d] =
        index.get(vkey(p.map((x, k) => x + r[k]!))) ?? -1
    }
  })

  return { radius, points, index, step }
}

// ---- one hole on a ball ----

export type HoleState = { re: Float64Array; im: Float64Array }

// one float beat of a lone hole on the ball: A on every dock, then the stream; weight leaving the ball is returned
export function holeBeat(
  ball: Ball,
  A: CMat,
  s: HoleState,
): { next: HoleState; lost: number } {
  const n = ball.points.length
  const re = new Float64Array(n * 24)
  const im = new Float64Array(n * 24)

  let lost = 0

  for (let p = 0; p < n; p++) {
    for (let to = 0; to < 24; to++) {
      let r = 0
      let m = 0

      for (let from = 0; from < 24; from++) {
        const xr = s.re[p * 24 + from]!
        const xi = s.im[p * 24 + from]!

        if (xr === 0 && xi === 0) {
          continue
        }

        const ar = A.re[to * 24 + from]!
        const ai = A.im[to * 24 + from]!

        r += ar * xr - ai * xi
        m += ar * xi + ai * xr
      }

      if (r === 0 && m === 0) {
        continue
      }

      const q = ball.step[p * 24 + to]!

      if (q < 0) {
        lost += r * r + m * m
        continue
      }

      re[q * 24 + to] = r
      im[q * 24 + to] = m
    }
  }

  return { next: { re, im }, lost }
}

// ---- two holes at total momentum K, relative coordinate ----

export type PairState = { re: Float64Array; im: Float64Array }

// the pair state indexed [site][d1][d2] (ordered; the configuration amplitude sits on both orders, (y, d1, d2) and
// (-y, d2, d1)); a start with both holes on one dock at slots p, q
export function pairStart(ball: Ball, p: number, q: number): PairState {
  const n = ball.points.length
  const re = new Float64Array(n * 576)
  const im = new Float64Array(n * 576)
  const o = ball.index.get('0,0,0,0')!

  re[o * 576 + p * 24 + q] = 1
  re[o * 576 + q * 24 + p] = 1

  return { re, im }
}

// the configuration weight of a pair state (each configuration counted once)
export function pairWeight(s: PairState): number {
  let w = 0

  for (let i = 0; i < s.re.length; i++) {
    w += s.re[i]! ** 2 + s.im[i]! ** 2
  }

  return w / 2
}

export type PairMaps = { A: CMat; B: CMat }

// the dense reference of pairBeat (every dock matrix applied as a full 24 x 24): one beat at total momentum K, off
// contact A (x) A, at contact B on the unordered pair, then the stream with the phase e^(-i K . (r_d1 + r_d2) / 2);
// weight leaving the ball is absorbed and returned
export function pairBeatDense(
  ball: Ball,
  maps: PairMaps,
  K: Vec,
  s: PairState,
): { next: PairState; lost: number } {
  const n = ball.points.length
  const { A, B } = maps
  const o = ball.index.get('0,0,0,0')!
  const tr = new Float64Array(n * 576)
  const ti = new Float64Array(n * 576)
  const row = new Float64Array(48)

  // A on the second index, then on the first, for every site but contact
  for (let p = 0; p < n; p++) {
    if (p === o) {
      continue
    }

    const base = p * 576

    let empty = true

    for (let i = 0; i < 576; i++) {
      if (s.re[base + i] !== 0 || s.im[base + i] !== 0) {
        empty = false
        break
      }
    }

    if (empty) {
      continue
    }

    const mr = new Float64Array(576)
    const mi = new Float64Array(576)

    for (let d1 = 0; d1 < 24; d1++) {
      for (let e = 0; e < 24; e++) {
        row[e] = s.re[base + d1 * 24 + e]!
        row[24 + e] = s.im[base + d1 * 24 + e]!
      }

      for (let t = 0; t < 24; t++) {
        let r = 0
        let m = 0

        for (let e = 0; e < 24; e++) {
          const ar = A.re[t * 24 + e]!
          const ai = A.im[t * 24 + e]!
          const xr = row[e]!
          const xi = row[24 + e]!

          r += ar * xr - ai * xi
          m += ar * xi + ai * xr
        }

        mr[d1 * 24 + t] = r
        mi[d1 * 24 + t] = m
      }
    }

    for (let t2 = 0; t2 < 24; t2++) {
      for (let t1 = 0; t1 < 24; t1++) {
        let r = 0
        let m = 0

        for (let e = 0; e < 24; e++) {
          const ar = A.re[t1 * 24 + e]!
          const ai = A.im[t1 * 24 + e]!
          const xr = mr[e * 24 + t2]!
          const xi = mi[e * 24 + t2]!

          r += ar * xr - ai * xi
          m += ar * xi + ai * xr
        }

        tr[base + t1 * 24 + t2] = r
        ti[base + t1 * 24 + t2] = m
      }
    }
  }

  // contact: B on the 276 unordered pairs (the configuration amplitude is read from the d1 < d2 order)
  {
    const base = o * 576
    const vr = new Float64Array(276)
    const vi = new Float64Array(276)

    PAIRS.forEach(([a, b], i) => {
      vr[i] = s.re[base + a * 24 + b]!
      vi[i] = s.im[base + a * 24 + b]!
    })

    for (let t = 0; t < 276; t++) {
      let r = 0
      let m = 0

      for (let f = 0; f < 276; f++) {
        const xr = vr[f]!
        const xi = vi[f]!

        if (xr === 0 && xi === 0) {
          continue
        }

        const br = B.re[t * 276 + f]!
        const bi = B.im[t * 276 + f]!

        r += br * xr - bi * xi
        m += br * xi + bi * xr
      }

      const [a, b] = PAIRS[t]!

      tr[base + a * 24 + b] = r
      ti[base + a * 24 + b] = m
      tr[base + b * 24 + a] = r
      ti[base + b * 24 + a] = m
    }
  }

  // the stream: (y, d1, d2) -> (y + r_d1 - r_d2, d1, d2) with e^(-i K . (r_d1 + r_d2) / 2)
  const re = new Float64Array(n * 576)
  const im = new Float64Array(n * 576)

  let lost = 0

  const phase = new Float64Array(576 * 2)

  for (let d1 = 0; d1 < 24; d1++) {
    for (let d2 = 0; d2 < 24; d2++) {
      const r1 = ROOTS[d1]!
      const r2 = ROOTS[d2]!
      const ph = -(
        K.reduce((sum, x, k) => sum + x * (r1[k]! + r2[k]!), 0) / 2
      )

      phase[(d1 * 24 + d2) * 2] = Math.cos(ph)
      phase[(d1 * 24 + d2) * 2 + 1] = Math.sin(ph)
    }
  }

  for (let p = 0; p < n; p++) {
    for (let d1 = 0; d1 < 24; d1++) {
      const q1 = ball.step[p * 24 + d1]!

      for (let d2 = 0; d2 < 24; d2++) {
        const i = p * 576 + d1 * 24 + d2
        const xr = tr[i]!
        const xi = ti[i]!

        if (xr === 0 && xi === 0) {
          continue
        }

        // y + r_d1 - r_d2: step by d1, then by the root opposite d2
        const q = q1 < 0 ? -1 : ball.step[q1 * 24 + OPP[d2]!]!

        if (q < 0) {
          lost += (xr * xr + xi * xi) / 2
          continue
        }

        const c = phase[(d1 * 24 + d2) * 2]!
        const sn = phase[(d1 * 24 + d2) * 2 + 1]!
        const j = q * 576 + d1 * 24 + d2

        re[j] = re[j]! + xr * c - xi * sn
        im[j] = im[j]! + xr * sn + xi * c
      }
    }
  }

  return { next: { re, im }, lost }
}

const OPP = ROOTS.map(r =>
  ROOTS.findIndex(o => o.every((x, k) => x === -r[k]!)),
)

// ---- the one-hole dock matrix's shape, and the fast beats ----

// A = c X (I + beta z z^T): the swap coin X after the mixer's rank-one change on the staggered z (the hole sees the
// mixer through Z conj(m) Z). Read off A (c from a diagonal of X, beta from an off entry) and checked on all 576 entries
export type HoleShape = {
  c: [number, number]
  beta: [number, number]
  gap: number
}

export function holeShape(A: CMat): HoleShape {
  const z = MODE_SIGN
  const at = (t: number, f: number): [number, number] => [
    A.re[t * 24 + f]!,
    A.im[t * 24 + f]!,
  ]
  const cb = at(OPP[1]!, 0).map(x => x / (z[1]! * z[0]!)) as [
    number,
    number,
  ]
  const d = at(OPP[0]!, 0)
  const c: [number, number] = [d[0] - cb[0], d[1] - cb[1]]
  const c2 = c[0] * c[0] + c[1] * c[1]
  const beta: [number, number] = [
    (cb[0] * c[0] + cb[1] * c[1]) / c2,
    (cb[1] * c[0] - cb[0] * c[1]) / c2,
  ]

  let gap = 0

  for (let t = 0; t < 24; t++) {
    for (let f = 0; f < 24; f++) {
      const i = OPP[t]!
      const zz = z[i]! * z[f]!
      const mr = (i === f ? 1 : 0) + beta[0] * zz
      const mi = beta[1] * zz

      gap = Math.max(
        gap,
        Math.hypot(
          A.re[t * 24 + f]! - (c[0] * mr - c[1] * mi),
          A.im[t * 24 + f]! - (c[0] * mi + c[1] * mr),
        ),
      )
    }
  }

  return { c, beta, gap }
}

// out = A v for A = c X (I + beta z z^T), v and out 24 complex numbers at an offset (stride 1)
function applyHole(
  h: HoleShape,
  vr: Float64Array,
  vi: Float64Array,
  vo: number,
  stride: number,
  or: Float64Array,
  oi: Float64Array,
  oo: number,
  ostride: number,
): void {
  let sr = 0
  let si = 0

  for (let e = 0; e < 24; e++) {
    const z = MODE_SIGN[e]!

    sr += z * vr[vo + e * stride]!
    si += z * vi[vo + e * stride]!
  }

  // w = v + beta z s, then out[t] = c w[opp t]
  const bsr = h.beta[0] * sr - h.beta[1] * si
  const bsi = h.beta[0] * si + h.beta[1] * sr

  for (let t = 0; t < 24; t++) {
    const i = OPP[t]!
    const z = MODE_SIGN[i]!
    const wr = vr[vo + i * stride]! + z * bsr
    const wi = vi[vo + i * stride]! + z * bsi

    or[oo + t * ostride] = h.c[0] * wr - h.c[1] * wi
    oi[oo + t * ostride] = h.c[0] * wi + h.c[1] * wr
  }
}

// one beat of a lone hole on the ball with the shaped A (holeBeat's fast form)
export function holeBeatFast(
  ball: Ball,
  h: HoleShape,
  s: HoleState,
): { next: HoleState; lost: number } {
  const n = ball.points.length
  const re = new Float64Array(n * 24)
  const im = new Float64Array(n * 24)
  const tr = new Float64Array(24)
  const ti = new Float64Array(24)

  let lost = 0

  for (let p = 0; p < n; p++) {
    let empty = true

    for (let d = 0; d < 24; d++) {
      if (s.re[p * 24 + d] !== 0 || s.im[p * 24 + d] !== 0) {
        empty = false
        break
      }
    }

    if (empty) {
      continue
    }

    applyHole(h, s.re, s.im, p * 24, 1, tr, ti, 0, 1)

    for (let t = 0; t < 24; t++) {
      const r = tr[t]!
      const m = ti[t]!
      const q = ball.step[p * 24 + t]!

      if (q < 0) {
        lost += r * r + m * m
        continue
      }

      re[q * 24 + t] = r
      im[q * 24 + t] = m
    }
  }

  return { next: { re, im }, lost }
}

// the stream phases e^(-i K . (r_d1 + r_d2) / 2), interleaved re, im over (d1, d2)
export function streamPhases(K: Vec): Float64Array {
  const phase = new Float64Array(1152)

  for (let d1 = 0; d1 < 24; d1++) {
    for (let d2 = 0; d2 < 24; d2++) {
      const r1 = ROOTS[d1]!
      const r2 = ROOTS[d2]!
      const ph = -(
        K.reduce((sum, x, k) => sum + x * (r1[k]! + r2[k]!), 0) / 2
      )

      phase[(d1 * 24 + d2) * 2] = Math.cos(ph)
      phase[(d1 * 24 + d2) * 2 + 1] = Math.sin(ph)
    }
  }

  return phase
}

// one beat at total momentum K with the shaped A: off contact A (x) A; at contact B on the unordered pair, or, with B
// null, A (x) A there too (two DISTINGUISHABLE free holes, the non-interacting reference: it may put both on one slot);
// then the stream. Weight leaving the ball is absorbed and returned
export type CenterFlow = {
  mask: Uint8Array
  weight: number
  v: Float64Array
}

// `flow`, when given, adds up the weight leaving the masked sites in this beat's stream and its center-of-mass step
// (r_d1 + r_d2) / 2, weighted: the retained part's mean velocity (Hellmann-Feynman on the pair's dE/dK)
export function pairBeat(
  ball: Ball,
  h: HoleShape,
  B: CMat | null,
  K: Vec,
  s: PairState,
  phase = streamPhases(K),
  flow?: CenterFlow,
): { next: PairState; lost: number } {
  const n = ball.points.length
  const o = ball.index.get('0,0,0,0')!
  const tr = new Float64Array(n * 576)
  const ti = new Float64Array(n * 576)
  const mr = new Float64Array(576)
  const mi = new Float64Array(576)

  for (let p = 0; p < n; p++) {
    if (p === o && B) {
      continue
    }

    const base = p * 576

    let empty = true

    for (let i = 0; i < 576; i++) {
      if (s.re[base + i] !== 0 || s.im[base + i] !== 0) {
        empty = false
        break
      }
    }

    if (empty) {
      continue
    }

    // A on the second index (for each d1: the 24 entries d2 at stride 1), then on the first (stride 24)
    for (let d1 = 0; d1 < 24; d1++) {
      applyHole(h, s.re, s.im, base + d1 * 24, 1, mr, mi, d1 * 24, 1)
    }

    for (let d2 = 0; d2 < 24; d2++) {
      applyHole(h, mr, mi, d2, 24, tr, ti, base + d2, 24)
    }
  }

  if (B) {
    const base = o * 576
    const vr = new Float64Array(276)
    const vi = new Float64Array(276)

    PAIRS.forEach(([a, b], i) => {
      vr[i] = s.re[base + a * 24 + b]!
      vi[i] = s.im[base + a * 24 + b]!
    })

    for (let t = 0; t < 276; t++) {
      let r = 0
      let m = 0

      for (let f = 0; f < 276; f++) {
        const xr = vr[f]!
        const xi = vi[f]!

        if (xr === 0 && xi === 0) {
          continue
        }

        const br = B.re[t * 276 + f]!
        const bi = B.im[t * 276 + f]!

        r += br * xr - bi * xi
        m += br * xi + bi * xr
      }

      const [a, b] = PAIRS[t]!

      tr[base + a * 24 + b] = r
      ti[base + a * 24 + b] = m
      tr[base + b * 24 + a] = r
      ti[base + b * 24 + a] = m
    }
  }

  const re = new Float64Array(n * 576)
  const im = new Float64Array(n * 576)

  let lost = 0

  for (let p = 0; p < n; p++) {
    for (let d1 = 0; d1 < 24; d1++) {
      const q1 = ball.step[p * 24 + d1]!

      for (let d2 = 0; d2 < 24; d2++) {
        const i = p * 576 + d1 * 24 + d2
        const xr = tr[i]!
        const xi = ti[i]!

        if (xr === 0 && xi === 0) {
          continue
        }

        if (flow?.mask[p]) {
          const w = (xr * xr + xi * xi) / 2
          const r1 = ROOTS[d1]!
          const r2 = ROOTS[d2]!

          flow.weight += w

          for (let k = 0; k < 4; k++) {
            flow.v[k]! += (w * (r1[k]! + r2[k]!)) / 2
          }
        }

        const q = q1 < 0 ? -1 : ball.step[q1 * 24 + OPP[d2]!]!

        if (q < 0) {
          lost += (xr * xr + xi * xi) / 2
          continue
        }

        const c = phase[(d1 * 24 + d2) * 2]!
        const sn = phase[(d1 * 24 + d2) * 2 + 1]!
        const j = q * 576 + d1 * 24 + d2

        re[j] = re[j]! + xr * c - xi * sn
        im[j] = im[j]! + xr * sn + xi * c
      }
    }
  }

  return { next: { re, im }, lost }
}

// the configuration weight at each relative distance (root steps) of a pair state
export function pairProfile(ball: Ball, s: PairState): number[] {
  const out = new Array<number>(2 * ball.radius + 1).fill(0)

  ball.points.forEach((p, i) => {
    let w = 0

    for (let j = 0; j < 576; j++) {
      w += s.re[i * 576 + j]! ** 2 + s.im[i * 576 + j]! ** 2
    }

    out[Math.round(d4Steps(p))]! += w / 2
  })

  return out
}

// ---- the mode sign, for the particle-hole reading ----

// z_d = (-1)^(modeIndex d)
export const MODE_SIGN: readonly number[] = Array.from(
  { length: 24 },
  (_, d) => (modeIndex(d) % 2 === 0 ? 1 : -1),
)

// ---- spectral readings of a retained state ----

export type Snap = { re: Float64Array; im: Float64Array }
export type Peak = { phase: number; weight: number }

// the Hann-windowed periodogram of snapshots at phase w: |sum_t win_t e^(-i w t) psi_t|^2 / (M / 2)^2, over 2 when the
// snapshots are ordered pair states (each configuration held twice)
export function hannPower(
  snaps: readonly Snap[],
  w: number,
  half = 1,
): number {
  const n = snaps[0]!.re.length
  const M = snaps.length
  const ar = new Float64Array(n)
  const ai = new Float64Array(n)

  snaps.forEach((sn, t) => {
    const win = 0.5 - 0.5 * Math.cos((2 * Math.PI * (t + 0.5)) / M)
    const c = Math.cos(-w * t) * win
    const s = Math.sin(-w * t) * win

    for (let i = 0; i < n; i++) {
      const xr = sn.re[i]!
      const xi = sn.im[i]!

      if (xr === 0 && xi === 0) {
        continue
      }

      ar[i]! += xr * c - xi * s
      ai[i]! += xr * s + xi * c
    }
  })

  let e = 0

  for (let i = 0; i < n; i++) {
    e += ar[i]! ** 2 + ai[i]! ** 2
  }

  return (e / ((M / 2) * (M / 2))) * half
}

// the local maxima of the Hann periodogram on a G-point grid above `floor`, each refined by golden section
export function hannPeaks(
  snaps: readonly Snap[],
  floor: number,
  half = 1,
  G = 512,
): Peak[] {
  const at = (g: number): number => -Math.PI + (2 * Math.PI * g) / G
  const sp = Array.from({ length: G }, (_, g) =>
    hannPower(snaps, at(g), half),
  )

  return sp
    .map((e, g) => ({ e, g }))
    .filter(
      x =>
        x.e > floor &&
        x.e >= sp[(x.g + G - 1) % G]! &&
        x.e >= sp[(x.g + 1) % G]!,
    )
    .map(({ g }) => {
      let a = at(g - 1)
      let b = at(g + 1)

      for (let i = 0; i < 48; i++) {
        const m1 = a + (b - a) * 0.381966
        const m2 = a + (b - a) * 0.618034

        if (hannPower(snaps, m1, half) > hannPower(snaps, m2, half)) {
          b = m2
        } else {
          a = m1
        }
      }

      const phase = (a + b) / 2

      return {
        phase: Math.atan2(Math.sin(phase), Math.cos(phase)),
        weight: hannPower(snaps, phase, half),
      }
    })
}

export type PairRun = { kept: number[]; lost: number; peaks: Peak[] }

// two holes from contact (slots p, q at one dock) at total momentum K on a ball for T beats (B null: two free
// distinguishable holes); the configuration weight in the ball at each checkpoint, the weight absorbed, and the Hann
// peaks (above `floor`) of the last M beats of the state within one root step of contact
export function pairRun(input: {
  ball: Ball
  h: HoleShape
  B: CMat | null
  K: Vec
  p: number
  q: number
  T: number
  checkpoints: readonly number[]
  M: number
  floor: number
}): PairRun {
  const { ball, h, B, K, p, q, T, checkpoints, M, floor } = input
  const phase = streamPhases(K)
  const near = ball.points
    .map((x, i) => (d4Steps(x) <= 1 ? i : -1))
    .filter(i => i >= 0)

  let s = pairStart(ball, p, q)
  let lost = 0

  const kept: number[] = []
  const snaps: Snap[] = []

  for (let t = 1; t <= T; t++) {
    const r = pairBeat(ball, h, B, K, s, phase)

    s = r.next
    lost += r.lost

    if (checkpoints.includes(t)) {
      kept.push(pairWeight(s))
    }

    if (t > T - M) {
      const re = new Float64Array(near.length * 576)
      const im = new Float64Array(near.length * 576)

      near.forEach((i, k) => {
        re.set(s.re.subarray(i * 576, i * 576 + 576), k * 576)
        im.set(s.im.subarray(i * 576, i * 576 + 576), k * 576)
      })
      snaps.push({ re, im })
    }
  }

  return {
    kept,
    lost,
    peaks: floor >= 0 ? hannPeaks(snaps, floor, 0.5) : [],
  }
}

// the one-hole Bloch beat U(K) = S(K) A applied T times to e_start; its Hann peaks over the last M beats (the reading's
// control: the peaks are U(K)'s eigenphases, so their shift with K is the bands' secant velocity)
export function blochPeaks(
  A: CMat,
  K: Vec,
  start: number,
  T: number,
  M: number,
  floor: number,
): Peak[] {
  let re = new Float64Array(24)
  let im = new Float64Array(24)

  const snaps: Snap[] = []

  re[start] = 1

  for (let t = 1; t <= T; t++) {
    const nr = new Float64Array(24)
    const ni = new Float64Array(24)

    for (let r = 0; r < 24; r++) {
      let xr = 0
      let xi = 0

      for (let q = 0; q < 24; q++) {
        const ar = A.re[r * 24 + q]!
        const ai = A.im[r * 24 + q]!

        xr += ar * re[q]! - ai * im[q]!
        xi += ar * im[q]! + ai * re[q]!
      }

      const ph = -ROOTS[r]!.reduce((a, x, k) => a + x * K[k]!, 0)

      nr[r] = xr * Math.cos(ph) - xi * Math.sin(ph)
      ni[r] = xr * Math.sin(ph) + xi * Math.cos(ph)
    }

    re = nr
    im = ni

    if (t > T - M) {
      snaps.push({ re, im })
    }
  }

  return hannPeaks(snaps, floor)
}

// the peaks at K0 matched to the peaks at K0 + delta u (nearest phase within `window`): the secant speed of each over c
// (|delta phase| / delta / sqrt 2), or NaN where no partner is found
export function peakSpeeds(
  at0: readonly Peak[],
  at1: readonly Peak[],
  delta: number,
  window: number,
): { phase: number; weight: number; speed: number }[] {
  return at0.map(pk => {
    let best: Peak | undefined

    for (const o of at1) {
      if (
        Math.abs(
          Math.atan2(
            Math.sin(o.phase - pk.phase),
            Math.cos(o.phase - pk.phase),
          ),
        ) <= window &&
        (!best ||
          Math.abs(o.phase - pk.phase) <
            Math.abs(best.phase - pk.phase))
      ) {
        best = o
      }
    }

    const d = best
      ? Math.abs(
          Math.atan2(
            Math.sin(best.phase - pk.phase),
            Math.cos(best.phase - pk.phase),
          ),
        )
      : NaN

    return {
      phase: pk.phase,
      weight: pk.weight,
      speed: d / delta / Math.SQRT2,
    }
  })
}
