// THE TWO-SPECIES CLASS STORE (item vibe-roadmap-grounding-0055, grounding decisions 009, 010, 011 and 013): the run
// loop of code/measure/class-store over FEAR sectors, for item 0051's fear schedule. B1's line self on a ring of L docks
// with loves and fears (code/measure/fear-line, gates F0 to F3 of item 0050), the pieces, arrivals of either charge,
// and the same ledgers, on a store that holds columns and dense blocks per class.
//
// A NEW FILE, NOT AN OPTION OF class-store. class-store's sectors are cold-line's colex ranks of love-only bit masks
// (two bits a dock), so a fear (a third value a mode) and the dock's store trit have no place in them. This file builds
// its own sectors on fear-line's configuration and takes every piece from fear-line's functions, so class-store,
// error-boundary and cold-line stay byte-unchanged and every loves-only caller with them. It imports class-store's
// in-place merge (decision 010) and pivoted Cholesky as they are.
//
// THE SECTOR (l, f): every configuration of the ring holding l loves and f fears, a stored pair counting once in each
// (a store holds a love and a fear). The beat keeps both counts (the coin and the stream move vibes, the pair move
// trades a love and a fear on one dock for the store and back), an arrival adds one of its charge, and an export
// removes the vibes it hands out. A configuration is fear-line's Cfg; it is held as one code a dock (front slot, back
// slot, store, each 0, +1 or -1: 27 codes), the sector's configurations in lexicographic order of their codes, dock 0
// first, and found by binary search on 11-dock keys (27^11 < 2^53). No hash, no random number.
//
// THE CLASS. Q_t = loves minus fears on docks x = t mod 2 at the step of beat t, mod 3 (fear-line chargeClass). Every
// open vibe moves one dock a beat on the ring (L even) and a store is neutral, so the beat keeps Q (the pair move makes
// and unmakes on one dock, charge 0 either way). An arrival at a known dock shifts Q by its charge or 0, and an export
// reads vibes at known docks, so every branch lies in ONE residue (checked at every column: a column across two
// residues throws). The store holds each (loves, fears, residue) apart, on its own configurations only, and with the
// boundary or the swap piece only on the configurations the piece leaves alone (checked: an entry off them throws).
// Every store pattern (which docks hold a resting pair, and its trit) is part of the configuration, never a class of
// its own: the pair rests one stream, so the pattern is not kept by the beat.
//
// DENSE BLOCKS (decision 009's rule, by option). A (loves, fears, residue) named in `dense` is held as its density
// matrix on its support: every record handed to it is added as its outer product, so it is never merged and never
// truncated. Its beat is P C rho C^dag P^dag in place (the phase and the coin keep the class and the support), then
// the pair move and the stream as one signed relabelling. The next step's arrival and piece group its rows; the largest
// group bound for the block itself is moved IN PLACE into the block for the next beat (no block is held twice), a group
// bound for another dense block is added as its sub-block, and a group bound for columns is split by a pivoted Cholesky
// whose residual trace goes to the ledger.
//
// COLUMNS. Every other class is held as columns rho = sum v v^dag, merged in place past its cap (class-store
// mergeInPlace, decision 010), the dropped eigen weight ledgered. The floor applies to every column put.
//
// THE ORDER (class-store's). The store holds the state after the step of beat t (its arrival, then the piece). One beat
// works the dense blocks first, then every column: B1's beat (fear-line's, coin before: cost and dock phase, coin, pair
// move, stream), the readings, then the step of beat t + 1 into the next beat's store.
//
// TRACKED. A branch left with fewer than TRACKED loves (open or stored) has lost the self: its weight is ledgered as
// broken and followed no further, as in error-boundary.
//
// THE READINGS (item 0059, decision 017), by option: given a `reader` (0039's level, cold-line lineReader), every read
// beat also carries F (the bound count, fears and stores as bath), out_rel, R = F / F(0) and R_up, and given `tvAt`
// the run returns I's TV means keyed by the love part, all from code/measure/fear-reader. With no reader and no tvAt
// nothing is computed and no existing field changes. F(0) and I's beat-0 distribution are read on the start column
// before the step of beat 1, as class-store reads them.
//
// Measurement in floats. The pieces are fear-line's, exact (signed permutations). Nothing here moves the rule.

import { choleskyColumns, merged, mergeInPlace } from '@/code/measure/class-store'
import type { Amp, LineReader } from '@/code/measure/cold-line'
import { emptyAmp } from '@/code/measure/cold-line'
import { TRACKED, type Arm } from '@/code/measure/error-boundary'
import {
  fearBound,
  fearBoundDense,
  fearReaderTable,
  lovePartIds,
  splitColours,
  type FearReaderTable,
} from '@/code/measure/fear-reader'
import {
  chargeClass,
  costLinks,
  dockPower,
  emptyCfg,
  fearArrival,
  fearExport,
  modeOf,
  pairPass,
  storeAt,
  streamCfg,
  type Cfg,
  type FearLine,
} from '@/code/measure/fear-line'

const SQ3 = Math.sqrt(3)
// the coin over a dock with one vibe: keep (1 + w)/2, cross (1 - w)/2 (cold-line FULL_COIN, fear-line KEEP and CROSS)
const KR = 0.25
const KI = SQ3 / 4
const CR = 0.75
const CI = -SQ3 / 4

const CHUNK = 11

const t3 = (v: number): number => (v === 0 ? 0 : v === 1 ? 1 : 2)
const v3 = (t: number): number => (t === 0 ? 0 : t === 1 ? 1 : -1)
const mod = (a: number, m: number): number => ((a % m) + m) % m

// ---- sectors ----

export type FearSector = {
  readonly L: number
  readonly loves: number
  readonly fears: number
  readonly M: number
  // the column size: M configurations x 3 cut values
  readonly size: number
  // a code a dock, M x L
  readonly codes: Uint8Array
  readonly chunks: number
  readonly keys: Float64Array
  // the order the store scans the configurations in (decision 018): with no fear, class-store's (cold-line's colex rank
  // of the love mask), so the two stores make the same buckets, residue lists and merges in the same order; with a fear,
  // the sector's own order
  readonly scan: Int32Array
}

// the codes of dock x: front (mode 2x + 1), back (mode 2x), store
const codeOf = (front: number, back: number, store: number): number => t3(front) * 9 + t3(back) * 3 + t3(store)

// loves and fears a code holds
const LOVES = Int8Array.from({ length: 27 }, (_, c) => {
  const f = v3(Math.floor(c / 9))
  const b = v3(Math.floor(c / 3) % 3)
  const s = v3(c % 3)

  return (f === 1 ? 1 : 0) + (b === 1 ? 1 : 0) + (s !== 0 ? 1 : 0)
})
const FEARS = Int8Array.from({ length: 27 }, (_, c) => {
  const f = v3(Math.floor(c / 9))
  const b = v3(Math.floor(c / 3) % 3)
  const s = v3(c % 3)

  return (f === -1 ? 1 : 0) + (b === -1 ? 1 : 0) + (s !== 0 ? 1 : 0)
})

export function makeFearSector(L: number, loves: number, fears: number): FearSector {
  const chunks = Math.ceil(L / CHUNK)
  const codeList: number[] = []
  const cur = new Uint8Array(L)

  // lexicographic, dock 0 first, codes ascending
  const walk = (x: number, l: number, f: number): void => {
    if (x === L) {
      if (l === 0 && f === 0) {
        for (let i = 0; i < L; i++) {
          codeList.push(cur[i]!)
        }
      }

      return
    }

    for (let c = 0; c < 27; c++) {
      const dl = LOVES[c]!
      const df = FEARS[c]!

      if (dl > l || df > f) {
        continue
      }

      cur[x] = c
      walk(x + 1, l - dl, f - df)
    }
  }

  walk(0, loves, fears)

  const codes = Uint8Array.from(codeList)
  const M = codes.length / L
  const keys = new Float64Array(M * chunks)

  for (let r = 0; r < M; r++) {
    for (let j = 0; j < chunks; j++) {
      let k = 0

      for (let x = j * CHUNK; x < Math.min(L, (j + 1) * CHUNK); x++) {
        k = k * 27 + codes[r * L + x]!
      }

      keys[r * chunks + j] = k
    }
  }

  // colex on love masks is the masks' numeric order: compare docks from L - 1 down, and on a loves-only dock the code
  // (front mode 2x + 1 above back mode 2x) ascends as the dock's two bits do
  const scan = Int32Array.from({ length: M }, (_, r) => r)

  if (fears === 0) {
    scan.sort((a, b) => {
      for (let x = L - 1; x >= 0; x--) {
        const d = codes[a * L + x]! - codes[b * L + x]!

        if (d !== 0) {
          return d
        }
      }

      return 0
    })
  }

  return { L, loves, fears, M, size: 3 * M, codes, chunks, keys, scan }
}

export function cfgOf(s: FearSector, r: number): Cfg {
  const { L } = s
  const c = emptyCfg(L)

  for (let x = 0; x < L; x++) {
    const code = s.codes[r * L + x]!

    c[2 * x + 1] = v3(Math.floor(code / 9))
    c[2 * x] = v3(Math.floor(code / 3) % 3)
    c[storeAt(L, x)] = v3(code % 3)
  }

  return c
}

// the configuration's rank in its sector, -1 when it is not there
export function rankOfCfg(s: FearSector, c: Cfg): number {
  const { L, chunks } = s
  const key = new Float64Array(chunks)

  for (let j = 0; j < chunks; j++) {
    let k = 0

    for (let x = j * CHUNK; x < Math.min(L, (j + 1) * CHUNK); x++) {
      k = k * 27 + codeOf(c[2 * x + 1]!, c[2 * x]!, c[storeAt(L, x)]!)
    }

    key[j] = k
  }

  let lo = 0
  let hi = s.M - 1

  while (lo <= hi) {
    const mid = (lo + hi) >> 1

    let cmp = 0

    for (let j = 0; j < chunks && cmp === 0; j++) {
      const a = s.keys[mid * chunks + j]!

      cmp = a < key[j]! ? -1 : a > key[j]! ? 1 : 0
    }

    if (cmp === 0) {
      return mid
    }

    if (cmp < 0) {
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  return -1
}

export const loveCount = (c: Cfg, L: number): number => {
  let n = 0

  for (let i = 0; i < 2 * L; i++) {
    n += c[i] === 1 ? 1 : 0
  }

  for (let x = 0; x < L; x++) {
    n += c[storeAt(L, x)] !== 0 ? 1 : 0
  }

  return n
}

export const fearCount = (c: Cfg, L: number): number => {
  let n = 0

  for (let i = 0; i < 2 * L; i++) {
    n += c[i] === -1 ? 1 : 0
  }

  for (let x = 0; x < L; x++) {
    n += c[storeAt(L, x)] !== 0 ? 1 : 0
  }

  return n
}

const hasStore = (c: Cfg, L: number): boolean => {
  for (let x = 0; x < L; x++) {
    if (c[storeAt(L, x)] !== 0) {
      return true
    }
  }

  return false
}

// ---- B1's beat on a sector (fear-line's map, coin before) ----

export type FearEngine = {
  readonly s: FearSector
  readonly turn: number
  readonly cos: Float64Array
  readonly sin: Float64Array
  // per (configuration, cut): the cost and dock phase, in turns of `turn`
  readonly phase: Uint16Array
  // the coin's pairs: front alone (u) and the vibe moved to the back (v), every dock
  readonly coinU: Int32Array
  readonly coinV: Int32Array
  // the pair move then the stream: target, cut shift, sign; and whether the target holds a resting pair
  readonly target: Int32Array
  readonly dc: Int8Array
  readonly sign: Int8Array
  readonly rest: Uint8Array
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

export function makeFearEngine(line: FearLine, s: FearSector): FearEngine {
  if (!line.closed || line.L !== s.L) {
    throw new Error('fear-store: the store runs on the closed ring of the sector')
  }

  const { L, M } = s
  const turn = (3 * line.clock) / gcd(3, line.clock)
  const cos = Float64Array.from({ length: turn }, (_, a) => Math.cos((2 * Math.PI * a) / turn))
  const sin = Float64Array.from({ length: turn }, (_, a) => Math.sin((2 * Math.PI * a) / turn))
  const phase = new Uint16Array(M * 3)
  const target = new Int32Array(M)
  const dc = new Int8Array(M)
  const sign = new Int8Array(M)
  const rest = new Uint8Array(M)
  // the coin's pairs by dock: one dock's pairs are disjoint, but pairs of two docks share entries, so the docks are
  // applied one after the other (cold-line coinPass's order), never interleaved
  const usBy: number[][] = Array.from({ length: L }, () => [])
  const vsBy: number[][] = Array.from({ length: L }, () => [])

  for (let r = 0; r < M; r++) {
    const c = cfgOf(s, r)
    const p = dockPower(line, c)

    for (let cut = 0; cut < 3; cut++) {
      const n = line.cost ? costLinks(line, c, cut) : 0

      phase[r * 3 + cut] = mod(-n * (turn / line.clock) + p * (turn / 3), turn)
    }

    for (let x = 0; x < L; x++) {
      const front = c[2 * x + 1]!

      if (front !== 0 && c[2 * x] === 0) {
        const o = Int8Array.from(c)

        o[2 * x] = front
        o[2 * x + 1] = 0
        usBy[x]!.push(r)
        vsBy[x]!.push(rankOfCfg(s, o))
      }
    }

    const moved = Int8Array.from(c)

    pairPass(line, moved)

    const st = streamCfg(line, moved)
    const t = rankOfCfg(s, st.cfg)

    if (t < 0) {
      throw new Error('fear-store: the beat left the sector')
    }

    target[r] = t
    dc[r] = st.dc
    sign[r] = line.sign && st.parity === 1 ? -1 : 1
    rest[t] = hasStore(st.cfg, L) ? 1 : 0
  }

  return { s, turn, cos, sin, phase, coinU: Int32Array.from(usBy.flat()), coinV: Int32Array.from(vsBy.flat()), target, dc, sign, rest }
}

// one beat on a full column a into out (a is worked in place first; out is overwritten whole, the move is a bijection)
export function fearBeat(e: FearEngine, a: Amp, out: Amp): void {
  const { M } = e.s

  for (let u = 0; u < 3 * M; u++) {
    const t = e.phase[u]!

    if (t === 0) {
      continue
    }

    const pr = e.cos[t]!
    const pi = e.sin[t]!
    const ar = a.re[u]!
    const ai = a.im[u]!

    a.re[u] = pr * ar - pi * ai
    a.im[u] = pr * ai + pi * ar
  }

  for (let i = 0; i < e.coinU.length; i++) {
    const r = e.coinU[i]!
    const p = e.coinV[i]!

    for (let c = 0; c < 3; c++) {
      const u = r * 3 + c
      const v = p * 3 + c
      const ar = a.re[u]!
      const ai = a.im[u]!
      const br = a.re[v]!
      const bi = a.im[v]!

      a.re[u] = KR * ar - KI * ai + (CR * br - CI * bi)
      a.im[u] = KR * ai + KI * ar + (CR * bi + CI * br)
      a.re[v] = CR * ar - CI * ai + (KR * br - KI * bi)
      a.im[v] = CR * ai + CI * ar + (KR * bi + KI * br)
    }
  }

  for (let r = 0; r < M; r++) {
    const t = e.target[r]!
    const s = e.sign[r]!
    const d = e.dc[r]!

    for (let c = 0; c < 3; c++) {
      const v = t * 3 + ((c + d) % 3)

      out.re[v] = s * a.re[r * 3 + c]!
      out.im[v] = s * a.im[r * 3 + c]!
    }
  }
}

// ---- the piece's table (fear-line fearExport) ----

export type FearTable = {
  // per configuration: the records' key (0 none), their count, the loves and fears handed out, the configuration
  // left (its rank in its sector), the sign
  readonly key: Float64Array
  readonly k: Uint8Array
  readonly kl: Uint8Array
  readonly kf: Uint8Array
  readonly target: Int32Array
  readonly sign: Int8Array
}

// ---- the run ----

export type FearArrival = { readonly beat: number; readonly dock: number; readonly label: number; readonly q: 1 | -1 }

export type FearStoreSettings = {
  readonly L: number
  readonly d: number
  readonly arm: Arm
  readonly arrivals: readonly FearArrival[]
  readonly beats: number
  // the most loves and fears a followed branch holds (an arrival past them goes to the cap ledger)
  readonly nMax: number
  readonly fMax: number
  // per sector [loves][fears]: merge past cap columns, keeping keep
  readonly cap: readonly (readonly number[])[]
  readonly keep: readonly (readonly number[])[]
  readonly floor: number
  // the (loves, fears, residue) classes held as a density matrix
  readonly dense: readonly (readonly [number, number, number])[]
  readonly cholesky: number
  readonly readAt: readonly number[]
  // B1's pieces on the line (default: cost and sign on, clock 14)
  readonly cost?: boolean
  readonly sign?: boolean
  readonly clock?: number
  readonly every?: number
  // the state after B1's beat at every beat, piece by piece (instruments only): a column (full sector, cut innermost)
  // or a dense block whose row a is the full index rows[a] with sign signs[a]
  readonly observe?: (t: number, s: FearSector, part: Observed) => void
  // decision 017's readings (item 0059): the level's reader (F, out_rel, R, R_up at every read beat), the TV beats and
  // window (I, as class-store's tvAt and tvWindow), and R_up's constants (FMAX, FBROKEN, FSTORE) for the schedule
  readonly reader?: LineReader
  readonly tvAt?: readonly number[]
  readonly tvWindow?: number
  readonly bounds?: FearBounds
}

export type FearBounds = { readonly fmax: number; readonly fbroken: number; readonly fstore: number }

// decision 017 section 4: 0039's love schedule, and the fear schedule (BF, SF, NF)
export const LOVE_BOUNDS: FearBounds = { fmax: 10, fbroken: 1, fstore: 1 }
export const FEAR_BOUNDS: FearBounds = { fmax: 1, fbroken: 0, fstore: 1 }

export const rUpOf = (b: FearBounds, F: number, ledger: FearLedger, rest: number, F0: number): number =>
  (F + b.fmax * (ledger.trunc + ledger.cap) + b.fbroken * ledger.broken + b.fstore * rest) / F0

export type Observed =
  | { readonly kind: 'column'; readonly v: Amp }
  | {
      readonly kind: 'dense'
      readonly D: number
      readonly re: Float64Array
      readonly im: Float64Array
      readonly rows: Int32Array
      readonly signs: Int8Array
    }

export type FearLedger = {
  entered: number
  exported: number
  exportedLoves: number
  exportedFears: number
  copies: number
  trunc: number
  cap: number
  broken: number
  brokenLoves: number
}

export type FearReading = {
  readonly beat: number
  readonly weight: number
  readonly loves: number
  readonly fears: number
  // the weight on configurations holding a resting pair after the beat (it rested at the stream)
  readonly rest: number
  readonly ledger: FearLedger
  // kept weight and column count by sector, 'loves:fears'
  readonly weightBy: Readonly<Record<string, number>>
  readonly columns: Readonly<Record<string, number>>
  // with a reader (decision 017): F, out_rel, R, R_up with the run's bounds (when given) and with LOVE_BOUNDS, and F
  // and weight by block 'loves:fears:residue'
  readonly F?: number
  readonly outRel?: number
  readonly R?: number
  readonly Rup?: number
  readonly RupLove?: number
  readonly blocks?: Readonly<Record<string, { readonly F: number; readonly weight: number }>>
}

export type FearRunResult = {
  // with a reader: F at the start (beat 0); with tvAt: I's TV means
  readonly F0?: number
  readonly tv?: { readonly beat: number; readonly mean: number }[]
  readonly readings: FearReading[]
  // the store rest weight at every beat 1 .. beats
  readonly rest: number[]
  readonly traceOff: number
  readonly maxColumns: number
  readonly mergeOff: number
  readonly seconds: number
}

type Index = { resid: Int8Array; pos: Int32Array; lists: Int32Array[] }
type Columns = { cols: Amp[]; orth: number }
type Dense = { D: number; re: Float64Array; im: Float64Array }
// keyed by sector id (loves * 64 + fears), then residue
type Store = { cols: Map<number, Map<number, Columns>>; dense: Map<number, Map<number, Dense>> }
type Group = { fs: number; a: number[]; at: number[]; sign: number[] }
type Add = { fs: number; res: number; size: number; ii: Int32Array; re: Float64Array; im: Float64Array }

const sid = (l: number, f: number): number => l * 64 + f
const lovesOf = (id: number): number => Math.floor(id / 64)
const fearsOf = (id: number): number => id % 64
const label = (id: number): string => `${lovesOf(id)}:${fearsOf(id)}`

const weightOf = (a: Amp): number => {
  let w = 0

  for (let u = 0; u < a.re.length; u++) {
    w += a.re[u]! * a.re[u]! + a.im[u]! * a.im[u]!
  }

  return w
}

export type FearStart = { readonly loves: number; readonly fears: number; readonly amp: Amp }

// a start from (configuration, cut, re, im) entries, in its sector
export function fearStart(L: number, entries: readonly { cfg: Cfg; cut: number; re: number; im: number }[]): FearStart {
  const loves = loveCount(entries[0]!.cfg, L)
  const fears = fearCount(entries[0]!.cfg, L)
  const s = makeFearSector(L, loves, fears)
  const amp = emptyAmp(s.size)

  for (const x of entries) {
    const r = rankOfCfg(s, x.cfg)

    if (r < 0) {
      throw new Error('fear-store: a start entry off its sector')
    }

    amp.re[r * 3 + x.cut]! += x.re
    amp.im[r * 3 + x.cut]! += x.im
  }

  return { loves, fears, amp }
}

export function runFearStore(set: FearStoreSettings, start: FearStart, log: (what: string) => void): FearRunResult {
  const started = Date.now()
  const { L, d, arm, nMax, fMax } = set

  if (L % 2 !== 0) {
    throw new Error('fear-store: the class needs an even ring')
  }

  if (nMax >= 64 || fMax >= 64) {
    throw new Error('fear-store: at most 63 of each charge')
  }

  merged.off = 0

  const line: FearLine = { L, closed: true, cost: set.cost ?? true, sign: set.sign ?? true, clock: set.clock ?? 14 }
  const isolatedOnly = arm !== 'swap'
  const restrict = arm === 'boundary' || arm === 'swap'
  const sectors = new Map<number, FearSector>()
  const engines = new Map<number, FearEngine>()
  const tables = new Map<number, FearTable>()
  const indexes = new Map<number, Index>()

  const sector = (id: number): FearSector => {
    let s = sectors.get(id)

    if (!s) {
      s = makeFearSector(L, lovesOf(id), fearsOf(id))
      sectors.set(id, s)
    }

    return s
  }

  const engine = (id: number): FearEngine => {
    let e = engines.get(id)

    if (!e) {
      e = makeFearEngine(line, sector(id))
      engines.set(id, e)
    }

    return e
  }

  const table = (id: number): FearTable => {
    let tb = tables.get(id)

    if (tb) {
      return tb
    }

    const s = sector(id)
    const { M } = s
    const key = new Float64Array(M)
    const k = new Uint8Array(M)
    const kl = new Uint8Array(M)
    const kf = new Uint8Array(M)
    const target = new Int32Array(M)
    const sign = new Int8Array(M)

    for (let r = 0; r < M; r++) {
      const x = fearExport(L, cfgOf(s, r), d, true, isolatedOnly)

      if (x.taken.length === 0) {
        continue
      }

      // 7 bits a record and 3 for the count keep the key, and twice it, exact in a double
      if (x.taken.length > 6) {
        throw new Error('fear-store: more than 6 records in one piece')
      }

      let kk = 0
      let nl = 0
      let nf = 0

      for (const t of x.taken) {
        kk = kk * 128 + t.mode * 2 + (t.q < 0 ? 1 : 0)
        nl += t.q > 0 ? 1 : 0
        nf += t.q < 0 ? 1 : 0
      }

      key[r] = kk * 8 + x.taken.length
      k[r] = x.taken.length
      kl[r] = nl
      kf[r] = nf
      sign[r] = x.sign

      const ls = s.loves - nl

      // a target with fewer than TRACKED loves is never stored (broken), and a copy-out stays where it is
      target[r] = arm === 'copy' || ls < TRACKED ? r : rankOfCfg(sector(sid(ls, s.fears - nf)), x.left)
    }

    tb = { key, k, kl, kf, target, sign }
    tables.set(id, tb)

    return tb
  }

  const index = (id: number, parity: number): Index => {
    const key = id * 2 + parity
    let x = indexes.get(key)

    if (x) {
      return x
    }

    const s = sector(id)
    const tb = arm === 'none' ? undefined : table(id)
    const resid = new Int8Array(s.M).fill(-1)
    const pos = new Int32Array(s.M).fill(-1)
    const counts = [0, 0, 0]

    // each residue's list in the scan order (decision 018), the basis of its columns and dense block
    for (let i = 0; i < s.M; i++) {
      const r = s.scan[i]!

      if (restrict && tb!.k[r] !== 0) {
        continue
      }

      const q = chargeClass(L, cfgOf(s, r), parity)

      resid[r] = q
      pos[r] = counts[q]!
      counts[q]!++
    }

    const lists = counts.map(c => new Int32Array(c))

    for (let r = 0; r < s.M; r++) {
      if (resid[r]! >= 0) {
        lists[resid[r]!]![pos[r]!] = r
      }
    }

    x = { resid, pos, lists }
    indexes.set(key, x)

    return x
  }

  const denseSet = new Set(set.dense.map(([l, f, r]) => sid(l, f) * 3 + r))
  const isDense = (id: number, r: number): boolean => denseSet.has(id * 3 + r)

  const ledger: FearLedger = {
    entered: 0,
    exported: 0,
    exportedLoves: 0,
    exportedFears: 0,
    copies: 0,
    trunc: 0,
    cap: 0,
    broken: 0,
    brokenLoves: 0,
  }
  const readings: FearReading[] = []
  const restBy: number[] = []
  const arrivalsAt = new Map(set.arrivals.map(a => [a.beat, a]))

  const emptyStore = (): Store => ({ cols: new Map(), dense: new Map() })
  const colsOf = (st: Store, id: number): Map<number, Columns> => {
    let m = st.cols.get(id)

    if (!m) {
      m = new Map()
      st.cols.set(id, m)
    }

    return m
  }
  const denseOf = (st: Store, id: number): Map<number, Dense> => {
    let m = st.dense.get(id)

    if (!m) {
      m = new Map()
      st.dense.set(id, m)
    }

    return m
  }

  let beatNow = 0
  let traceOff = 0
  let maxColumns = 1

  const capOf = (id: number): number => set.cap[lovesOf(id)]?.[fearsOf(id)] ?? Number.POSITIVE_INFINITY
  const keepOf = (id: number): number => set.keep[lovesOf(id)]?.[fearsOf(id)] ?? Number.POSITIVE_INFINITY

  const dropTrunc = (id: number, w: number): void => {
    if (lovesOf(id) === TRACKED) {
      ledger.broken += w
      ledger.brokenLoves += TRACKED * w
    } else {
      ledger.trunc += w
    }
  }

  const merge = (id: number, c: Columns): void => {
    if (c.cols.length > capOf(id)) {
      dropTrunc(id, mergeInPlace(c, keepOf(id)))
    }
  }

  // a column by its full-sector entries into the next store at the step parity
  const put = (
    next: Store,
    id: number,
    parity: number,
    at: ArrayLike<number>,
    re: ArrayLike<number>,
    im: ArrayLike<number>,
    w: number,
    floorOn: boolean,
  ): void => {
    const l = lovesOf(id)

    if (l > nMax || fearsOf(id) > fMax) {
      ledger.cap += w
      return
    }

    if (l < TRACKED) {
      ledger.broken += w
      ledger.brokenLoves += l * w
      return
    }

    if (floorOn && w < set.floor) {
      ledger.trunc += w
      return
    }

    if (at.length === 0) {
      return
    }

    const ix = index(id, parity)
    const r = ix.resid[Math.floor(at[0]! / 3)]!

    for (let i = 0; i < at.length; i++) {
      const q = ix.resid[Math.floor(at[i]! / 3)]!

      if (q !== r || q < 0) {
        throw new Error(
          `fear-store: a ${label(id)} column at beat ${beatNow} ${q < 0 ? 'off the kept support' : 'across two classes'}`,
        )
      }
    }

    const size = 3 * ix.lists[r]!.length

    if (isDense(id, r)) {
      const dm = denseOf(next, id)
      let m = dm.get(r)

      if (!m) {
        m = { D: size, re: new Float64Array(size * size), im: new Float64Array(size * size) }
        dm.set(r, m)
      }

      const k = at.length
      const ii = new Int32Array(k)

      for (let i = 0; i < k; i++) {
        ii[i] = ix.pos[Math.floor(at[i]! / 3)]! * 3 + (at[i]! % 3)
      }

      for (let i = 0; i < k; i++) {
        const xr = re[i]!
        const xi = im[i]!
        const row = ii[i]! * size

        for (let j = 0; j < k; j++) {
          m.re[row + ii[j]!]! += xr * re[j]! + xi * im[j]!
          m.im[row + ii[j]!]! += xi * re[j]! - xr * im[j]!
        }
      }

      return
    }

    const v = emptyAmp(size)

    for (let i = 0; i < at.length; i++) {
      const u = ix.pos[Math.floor(at[i]! / 3)]! * 3 + (at[i]! % 3)

      v.re[u] = re[i]!
      v.im[u] = im[i]!
    }

    const cm = colsOf(next, id)
    let c = cm.get(r)

    if (!c) {
      c = { cols: [], orth: 0 }
      cm.set(r, c)
    }

    c.cols.push(v)
    merge(id, c)
  }

  const putFull = (next: Store, id: number, parity: number, v: Amp, floorOn: boolean): void => {
    const w = weightOf(v)
    const at: number[] = []
    const re: number[] = []
    const im: number[] = []

    for (let u = 0; u < v.re.length; u++) {
      if (v.re[u] !== 0 || v.im[u] !== 0) {
        at.push(u)
        re.push(v.re[u]!)
        im.push(v.im[u]!)
      }
    }

    put(next, id, parity, at, re, im, w, floorOn)
  }

  // the piece on one full column of sector id: the part it reads leaves as bucket columns, the rest stays in v
  const pieceOn = (next: Store, id: number, v: Amp, parity: number): void => {
    if (arm === 'none') {
      putFull(next, id, parity, v, true)
      return
    }

    const s = sector(id)
    const tb = table(id)
    const buckets = new Map<number, { fs: number; at: number[]; re: number[]; im: number[]; w: number }>()

    // the buckets made in the scan order (decision 018), so they reach the next store in class-store's order
    for (let i = 0; i < s.M; i++) {
      const r = s.scan[i]!
      const k = tb.k[r]!

      if (k === 0) {
        continue
      }

      for (let c = 0; c < 3; c++) {
        const u = r * 3 + c
        const xr = v.re[u]!
        const xi = v.im[u]!

        if (xr === 0 && xi === 0) {
          continue
        }

        const w = xr * xr + xi * xi
        const ls = s.loves - tb.kl[r]!

        if (arm !== 'copy' && ls < TRACKED) {
          ledger.exported += k * w
          ledger.exportedLoves += tb.kl[r]! * w
          ledger.exportedFears += tb.kf[r]! * w
          ledger.broken += w
          ledger.brokenLoves += ls * w
          v.re[u] = 0
          v.im[u] = 0
          continue
        }

        const key = tb.key[r]!
        let b = buckets.get(key)

        if (!b) {
          b = { fs: arm === 'copy' ? id : sid(ls, s.fears - tb.kf[r]!), at: [], re: [], im: [], w: 0 }
          buckets.set(key, b)
        }

        b.w += w

        if (arm === 'copy') {
          b.at.push(u)
          b.re.push(xr)
          b.im.push(xi)
          ledger.copies += k * w
        } else {
          b.at.push(tb.target[r]! * 3 + c)
          b.re.push(tb.sign[r]! * xr)
          b.im.push(tb.sign[r]! * xi)
          ledger.exported += k * w
          ledger.exportedLoves += tb.kl[r]! * w
          ledger.exportedFears += tb.kf[r]! * w
        }

        v.re[u] = 0
        v.im[u] = 0
      }
    }

    putFull(next, id, parity, v, true)

    for (const b of buckets.values()) {
      put(next, b.fs, parity, b.at, b.re, b.im, b.w, true)
    }
  }

  // the arrival's target sector and mode
  const arrivalOf = (beat: number): { a: FearArrival; mode: number } | undefined => {
    const a = arrivalsAt.get(beat)

    return a ? { a, mode: modeOf(a.dock, a.label) } : undefined
  }

  const upOf = (id: number, q: number): number => (q > 0 ? sid(lovesOf(id) + 1, fearsOf(id)) : sid(lovesOf(id), fearsOf(id) + 1))
  const overMax = (id: number): boolean => lovesOf(id) > nMax || fearsOf(id) > fMax

  // the step of beat `beat` on one full column of sector id holding the state after the previous beat
  const stepColumn = (next: Store, id: number, v: Amp, beat: number): void => {
    const parity = beat % 2
    const arr = arrivalOf(beat)

    if (!arr) {
      pieceOn(next, id, v, parity)
      return
    }

    const s = sector(id)
    const upId = upOf(id, arr.a.q)
    const up = overMax(upId) ? undefined : emptyAmp(sector(upId).size)
    const us = up ? sector(upId) : undefined
    let moved = 0

    for (let r = 0; r < s.M; r++) {
      const x = fearArrival(cfgOf(s, r), arr.a.dock, arr.a.label, arr.a.q)

      if (!x) {
        continue
      }

      const r1 = us ? rankOfCfg(us, x.cfg) : 0

      for (let c = 0; c < 3; c++) {
        const u = r * 3 + c
        const xr = v.re[u]!
        const xi = v.im[u]!

        if (xr === 0 && xi === 0) {
          continue
        }

        moved += xr * xr + xi * xi

        if (up) {
          up.re[r1 * 3 + c] = x.sign * xr
          up.im[r1 * 3 + c] = x.sign * xi
        }

        v.re[u] = 0
        v.im[u] = 0
      }
    }

    ledger.entered += moved

    if (!up) {
      ledger.cap += moved
    }

    pieceOn(next, id, v, parity)

    if (up) {
      pieceOn(next, upId, up, parity)
    }
  }

  // ---- readings, summed over the store as it is worked ----
  type Acc = {
    weight: number
    loves: number
    fears: number
    rest: number
    weightBy: Map<number, number>
    // decision 017's readings: F and out_rel at read beats (withF), I's distribution at TV beats
    withF: boolean
    F: number
    outRel: number
    blocks: Map<string, { F: number; weight: number }>
    dist: Map<number, number> | undefined
  }

  const rd = set.reader
  const tvAt = set.tvAt ?? []
  const tvWindow = set.tvWindow ?? 0
  const tvStart = new Set<number>()

  for (const t of tvAt) {
    for (let s = t - tvWindow; s <= t; s++) {
      tvStart.add(s)
    }
  }

  const newAcc = (t: number): Acc => ({
    weight: 0,
    loves: 0,
    fears: 0,
    rest: 0,
    weightBy: new Map(),
    withF: rd !== undefined && set.readAt.includes(t),
    F: 0,
    outRel: 0,
    blocks: new Map(),
    dist: tvStart.has(t) ? new Map() : undefined,
  })

  const addWeight = (acc: Acc, id: number, w: number, rest: number): void => {
    acc.weight += w
    acc.loves += lovesOf(id) * w
    acc.fears += fearsOf(id) * w
    acc.rest += rest
    acc.weightBy.set(id, (acc.weightBy.get(id) ?? 0) + w)
  }

  const readerTables = new Map<number, FearReaderTable>()
  const readerOf = (id: number): FearReaderTable => {
    let tb = readerTables.get(id)

    if (!tb) {
      tb = fearReaderTable(rd!, sector(id), sector(sid(lovesOf(id) - 3, fearsOf(id))))
      readerTables.set(id, tb)
    }

    return tb
  }
  const intern = new Map<string, number>()
  const partIds = new Map<number, Int32Array>()
  const partsOf = (id: number): Int32Array => {
    let x = partIds.get(id)

    if (!x) {
      x = lovePartIds(sector(id), intern)
      partIds.set(id, x)
    }

    return x
  }
  const splits = new Map<number, Uint8Array>()
  const splitOf = (id: number): Uint8Array => {
    let x = splits.get(id)

    if (!x) {
      x = splitColours(sector(id))
      splits.set(id, x)
    }

    return x
  }

  const addBlockReading = (acc: Acc, id: number, r: number, F: number, w: number): void => {
    const k = `${label(id)}:${r}`
    const b = acc.blocks.get(k) ?? { F: 0, weight: 0 }

    b.F += F
    b.weight += w
    acc.blocks.set(k, b)
  }

  // the readings of one full column of sector id (configuration-major, cut innermost) after the beat
  const readColumn = (acc: Acc, id: number, r: number, v: Amp, w: number): void => {
    const s = sector(id)

    if (acc.withF) {
      const F = lovesOf(id) >= 3 ? fearBound(readerOf(id), v) : 0
      const split = splitOf(id)

      acc.F += F
      addBlockReading(acc, id, r, F, w)

      for (let q = 0; q < s.M; q++) {
        if (split[q]) {
          for (let c = 0; c < 3; c++) {
            acc.outRel += v.re[q * 3 + c]! ** 2 + v.im[q * 3 + c]! ** 2
          }
        }
      }
    }

    if (acc.dist && lovesOf(id) === 3) {
      const ids = partsOf(id)

      for (let q = 0; q < s.M; q++) {
        let x = 0

        for (let c = 0; c < 3; c++) {
          x += v.re[q * 3 + c]! ** 2 + v.im[q * 3 + c]! ** 2
        }

        if (x !== 0) {
          acc.dist.set(ids[q]!, (acc.dist.get(ids[q]!) ?? 0) + x)
        }
      }
    }
  }

  // I: the TV between consecutive beats' 3-love distributions, meaned over the window (class-store's finish)
  const tv: { beat: number; mean: number }[] = []
  let prevDist: Map<number, number> | undefined
  let tvSum = 0
  let tvCount = 0

  const finishTv = (t: number, acc: Acc): void => {
    if (acc.dist) {
      if (prevDist && tvStart.has(t - 1)) {
        let s = 0

        for (const [k, x] of acc.dist) {
          s += Math.abs(x - (prevDist.get(k) ?? 0))
        }

        for (const [k, x] of prevDist) {
          if (!acc.dist.has(k)) {
            s += Math.abs(x)
          }
        }

        tvSum += s / 2
        tvCount++
      }

      prevDist = acc.dist
    }

    if (tvAt.includes(t)) {
      tv.push({ beat: t, mean: tvCount > 0 ? tvSum / tvCount : Number.NaN })
      tvSum = 0
      tvCount = 0
    }
  }

  let F0 = Number.NaN

  // a read beat's decision-017 fields (none without a reader); the ledger is the one the beat's other fields read
  const withReadings = (acc: Acc, lg: FearLedger, rest: number): Partial<FearReading> => {
    if (!rd) {
      return {}
    }

    const blocks: Record<string, { F: number; weight: number }> = {}

    for (const [k, b] of acc.blocks) {
      blocks[k] = { F: b.F, weight: b.weight }
    }

    return {
      F: acc.F,
      outRel: acc.outRel,
      R: acc.F / F0,
      ...(set.bounds ? { Rup: rUpOf(set.bounds, acc.F, lg, rest, F0) } : {}),
      RupLove: rUpOf(LOVE_BOUNDS, acc.F, lg, rest, F0),
      blocks,
    }
  }

  // ---- a dense block: its beat, readings, the next step, moved in place ----
  let cur = emptyStore()
  const pending: Add[] = []
  const waiting = (id: number, r: number): boolean => cur.dense.get(id)?.has(r) ?? false

  const addBlock = (next: Store, x: Add): void => {
    const dm = denseOf(next, x.fs)
    let m = dm.get(x.res)

    if (!m) {
      m = { D: x.size, re: new Float64Array(x.size * x.size), im: new Float64Array(x.size * x.size) }
      dm.set(x.res, m)
    }

    const k = x.ii.length

    for (let i = 0; i < k; i++) {
      const out = x.ii[i]! * x.size

      for (let j = 0; j < k; j++) {
        m.re[out + x.ii[j]!]! += x.re[i * k + j]!
        m.im[out + x.ii[j]!]! += x.im[i * k + j]!
      }
    }
  }

  // class-store's moveInPlace: rows and columns off the primary group zeroed, signs applied, then rows and columns
  // permuted by pi (completed to a permutation by the unused targets in order), one row of scratch
  const moveInPlace = (m: Dense, primary: { gr: Group; ii: Int32Array } | undefined): void => {
    const D = m.D
    const { re, im } = m

    if (!primary) {
      re.fill(0)
      im.fill(0)
      return
    }

    const pi = new Int32Array(D).fill(-1)
    const sg = new Int8Array(D)
    const used = new Uint8Array(D)
    const { gr, ii } = primary

    for (let i = 0; i < gr.a.length; i++) {
      if (used[ii[i]!]) {
        throw new Error('fear-store: two rows of one group land on one target')
      }

      used[ii[i]!] = 1
      pi[gr.a[i]!] = ii[i]!
      sg[gr.a[i]!] = gr.sign[i]!
    }

    for (let a = 0; a < D; a++) {
      const row = a * D

      if (pi[a]! < 0) {
        re.fill(0, row, row + D)
        im.fill(0, row, row + D)
        continue
      }

      const sa = sg[a]!

      for (let b = 0; b < D; b++) {
        if (pi[b]! < 0) {
          re[row + b] = 0
          im[row + b] = 0
        } else if (sa * sg[b]! < 0) {
          re[row + b] = -re[row + b]!
          im[row + b] = -im[row + b]!
        }
      }
    }

    let free = 0

    for (let a = 0; a < D; a++) {
      if (pi[a]! >= 0) {
        continue
      }

      while (used[free]) {
        free++
      }

      pi[a] = free
      used[free] = 1
    }

    const inv = new Int32Array(D)

    for (let a = 0; a < D; a++) {
      inv[pi[a]!] = a
    }

    const tr = new Float64Array(D)
    const ti = new Float64Array(D)
    const seen = new Uint8Array(D)

    for (let p0 = 0; p0 < D; p0++) {
      if (seen[p0] || inv[p0] === p0) {
        seen[p0] = 1
        continue
      }

      tr.set(re.subarray(p0 * D, p0 * D + D))
      ti.set(im.subarray(p0 * D, p0 * D + D))

      let p = p0

      while (inv[p] !== p0) {
        const q = inv[p]!

        re.copyWithin(p * D, q * D, q * D + D)
        im.copyWithin(p * D, q * D, q * D + D)
        seen[p] = 1
        p = q
      }

      re.set(tr, p * D)
      im.set(ti, p * D)
      seen[p] = 1
    }

    for (let a = 0; a < D; a++) {
      const row = a * D

      tr.set(re.subarray(row, row + D))
      ti.set(im.subarray(row, row + D))

      for (let b = 0; b < D; b++) {
        re[row + pi[b]!] = tr[b]!
        im[row + pi[b]!] = ti[b]!
      }
    }
  }

  const workDense = (acc: Acc, id: number, r: number, m: Dense, t: number, next: Store | undefined): void => {
    const s = sector(id)
    const e = engine(id)
    const ix = index(id, t % 2)
    const list = ix.lists[r]!
    const D = m.D
    const { re, im } = m

    // the block's coin pairs: both ends in this residue's list (the coin keeps the class and the support)
    const pairs: number[] = []

    for (let i = 0; i < e.coinU.length; i++) {
      const u = e.coinU[i]!

      if (ix.resid[u] !== r) {
        continue
      }

      const v = e.coinV[i]!

      if (ix.resid[v] !== r) {
        throw new Error('fear-store: the coin left the class or the support')
      }

      pairs.push(ix.pos[u]!, ix.pos[v]!)
    }

    // P then C on the rows
    const rows = (): void => {
      for (let a = 0; a < D; a++) {
        const th = e.phase[list[Math.floor(a / 3)]! * 3 + (a % 3)]!

        if (th === 0) {
          continue
        }

        const pr = e.cos[th]!
        const pi = e.sin[th]!
        const row = a * D

        for (let b = 0; b < D; b++) {
          const xr = re[row + b]!
          const xi = im[row + b]!

          re[row + b] = pr * xr - pi * xi
          im[row + b] = pr * xi + pi * xr
        }
      }

      for (let q = 0; q < pairs.length; q += 2) {
        const i = pairs[q]!
        const j = pairs[q + 1]!

        for (let c = 0; c < 3; c++) {
          const ru = (3 * i + c) * D
          const rv = (3 * j + c) * D

          for (let b = 0; b < D; b++) {
            const ar = re[ru + b]!
            const ai = im[ru + b]!
            const br = re[rv + b]!
            const bi = im[rv + b]!

            re[ru + b] = KR * ar - KI * ai + (CR * br - CI * bi)
            im[ru + b] = KR * ai + KI * ar + (CR * bi + CI * br)
            re[rv + b] = CR * ar - CI * ai + (KR * br - KI * bi)
            im[rv + b] = CR * ai + CI * ar + (KR * bi + KI * br)
          }
        }
      }
    }

    rows()

    for (let a = 0; a < D; a++) {
      im[a * D + a] = -im[a * D + a]!

      for (let b = a + 1; b < D; b++) {
        const u = a * D + b
        const v = b * D + a
        const xr = re[u]!
        const xi = im[u]!

        re[u] = re[v]!
        im[u] = -im[v]!
        re[v] = xr
        im[v] = -xi
      }
    }

    rows()

    // the pair move and the stream: row a holds configuration nc[a], cut ncut[a], sign sg[a]
    const nc = new Int32Array(D)
    const ncut = new Uint8Array(D)
    const sg = new Int8Array(D)
    let w = 0
    let rest = 0

    for (let a = 0; a < D; a++) {
      const R = list[Math.floor(a / 3)]!

      nc[a] = e.target[R]!
      ncut[a] = ((a % 3) + e.dc[R]!) % 3
      sg[a] = e.sign[R]!
      w += re[a * D + a]!
      rest += e.rest[nc[a]!] ? re[a * D + a]! : 0
    }

    addWeight(acc, id, w, rest)

    if (acc.withF) {
      const F = lovesOf(id) >= 3 ? fearBoundDense(readerOf(id), D, re, im, nc, ncut, sg) : 0
      const split = splitOf(id)

      acc.F += F
      addBlockReading(acc, id, r, F, w)

      for (let a = 0; a < D; a++) {
        acc.outRel += split[nc[a]!] ? re[a * D + a]! : 0
      }
    }

    if (acc.dist && lovesOf(id) === 3) {
      const ids = partsOf(id)

      for (let a = 0; a < D; a++) {
        const k = ids[nc[a]!]!

        acc.dist.set(k, (acc.dist.get(k) ?? 0) + re[a * D + a]!)
      }
    }

    if (set.observe) {
      const rowsAt = new Int32Array(D)

      for (let a = 0; a < D; a++) {
        rowsAt[a] = nc[a]! * 3 + ncut[a]!
      }

      set.observe(t, s, { kind: 'dense', D, re, im, rows: rowsAt, signs: sg })
    }

    if (!next) {
      return
    }

    // ---- the next step: the arrival, then the piece, by group ----
    const beat = t + 1
    const parity = beat % 2
    const arr = arrivalOf(beat)
    const groups = new Map<number, Group>()

    for (let a = 0; a < D; a++) {
      const wa = re[a * D + a]!
      let ds = id
      let cfg = nc[a]!
      let sign = sg[a]!
      let stage = 0

      if (arr) {
        const x = fearArrival(cfgOf(s, cfg), arr.a.dock, arr.a.label, arr.a.q)

        if (x) {
          ledger.entered += wa

          const upId = upOf(id, arr.a.q)

          if (overMax(upId)) {
            ledger.cap += wa
            continue
          }

          stage = 1
          ds = upId
          sign *= x.sign
          cfg = rankOfCfg(sector(upId), x.cfg)
        }
      }

      let fs = ds
      let key = 0

      if (arm !== 'none') {
        const tb = table(ds)
        const k = tb.k[cfg]!

        if (k > 0) {
          const ls = lovesOf(ds) - tb.kl[cfg]!

          if (arm !== 'copy' && ls < TRACKED) {
            ledger.exported += k * wa
            ledger.exportedLoves += tb.kl[cfg]! * wa
            ledger.exportedFears += tb.kf[cfg]! * wa
            ledger.broken += wa
            ledger.brokenLoves += ls * wa
            continue
          }

          key = tb.key[cfg]!

          if (arm === 'copy') {
            ledger.copies += k * wa
          } else {
            ledger.exported += k * wa
            ledger.exportedLoves += tb.kl[cfg]! * wa
            ledger.exportedFears += tb.kf[cfg]! * wa
            fs = sid(ls, fearsOf(ds) - tb.kf[cfg]!)
            sign *= tb.sign[cfg]!
            cfg = tb.target[cfg]!
          }
        }
      }

      const gid = key * 2 + stage
      let gr = groups.get(gid)

      if (!gr) {
        gr = { fs, a: [], at: [], sign: [] }
        groups.set(gid, gr)
      }

      gr.a.push(a)
      gr.at.push(cfg * 3 + ncut[a]!)
      gr.sign.push(sign)
    }

    const toColumns: Group[] = []
    const toDense: { gr: Group; res: number; ii: Int32Array; size: number }[] = []
    let primary: { gr: Group; ii: Int32Array } | undefined

    for (const gr of groups.values()) {
      if (lovesOf(gr.fs) < TRACKED) {
        throw new Error('fear-store: a group below TRACKED loves')
      }

      const ixF = index(gr.fs, parity)
      const res = ixF.resid[Math.floor(gr.at[0]! / 3)]!

      for (const u of gr.at) {
        if (ixF.resid[Math.floor(u / 3)] !== res || res < 0) {
          throw new Error(`fear-store: a dense block at beat ${beat} leaves the kept support or its class`)
        }
      }

      if (!isDense(gr.fs, res)) {
        toColumns.push(gr)
        continue
      }

      const size = 3 * ixF.lists[res]!.length
      const k = gr.a.length
      const ii = new Int32Array(k)

      for (let i = 0; i < k; i++) {
        ii[i] = ixF.pos[Math.floor(gr.at[i]! / 3)]! * 3 + (gr.at[i]! % 3)
      }

      if (gr.fs === id && res === r) {
        if (size !== D) {
          throw new Error(`fear-store: the ${label(id)} residue ${r} block changes size (${D} to ${size}) at beat ${beat}`)
        }

        if (!primary || k > primary.gr.a.length) {
          if (primary) {
            toDense.push({ gr: primary.gr, res, ii: primary.ii, size })
          }

          primary = { gr, ii }
          continue
        }
      }

      toDense.push({ gr, res, ii, size })
    }

    for (const { gr, res, ii, size } of toDense) {
      const k = gr.a.length
      const br = new Float64Array(k * k)
      const bi = new Float64Array(k * k)

      for (let i = 0; i < k; i++) {
        const row = gr.a[i]! * D

        for (let j = 0; j < k; j++) {
          const sj = gr.sign[i]! * gr.sign[j]!

          br[i * k + j] = sj * re[row + gr.a[j]!]!
          bi[i * k + j] = sj * im[row + gr.a[j]!]!
        }
      }

      const add = { fs: gr.fs, res, size, ii, re: br, im: bi }

      if ((next.dense.get(gr.fs)?.has(res) ?? false) || !waiting(gr.fs, res)) {
        addBlock(next, add)
      } else {
        pending.push(add)
      }
    }

    toColumns.sort((x, y) => x.a.length - y.a.length)

    toColumns.forEach((gr, gi) => {
      const last = gi === toColumns.length - 1
      let mr = re
      let mi = im
      let stride = D
      let g = gr.a

      if (!last) {
        const k = gr.a.length

        mr = new Float64Array(k * k)
        mi = new Float64Array(k * k)
        stride = k

        for (let i = 0; i < k; i++) {
          for (let j = 0; j < k; j++) {
            mr[i * k + j] = re[gr.a[i]! * D + gr.a[j]!]!
            mi[i * k + j] = im[gr.a[i]! * D + gr.a[j]!]!
          }
        }

        g = Array.from({ length: k }, (_, i) => i)
      }

      const residual = choleskyColumns(mr, mi, stride, g, set.cholesky, (lr, li) => {
        const at: number[] = []
        const xr: number[] = []
        const xi: number[] = []
        let cw = 0

        for (let i = 0; i < lr.length; i++) {
          if (lr[i] === 0 && li[i] === 0) {
            continue
          }

          at.push(gr.at[i]!)
          xr.push(gr.sign[i]! * lr[i]!)
          xi.push(gr.sign[i]! * li[i]!)
          cw += lr[i]! * lr[i]! + li[i]! * li[i]!
        }

        put(next, gr.fs, parity, at, xr, xi, cw, true)
      })

      dropTrunc(gr.fs, residual)
    })

    moveInPlace(m, primary)
    denseOf(next, id).set(r, m)
  }

  // ---- the run ----
  {
    const id = sid(start.loves, start.fears)
    const s = sector(id)
    const v = { re: Float64Array.from(start.amp.re), im: Float64Array.from(start.amp.im) }

    if (v.re.length !== s.size) {
      throw new Error('fear-store: the start is not a full column of its sector')
    }

    // beat 0: F(0) and I's first distribution on the start as given (class-store reads the start before its dust is cut)
    if (rd || tvStart.has(0)) {
      const acc = newAcc(0)

      acc.withF = rd !== undefined
      addWeight(acc, id, weightOf(v), 0)
      readColumn(acc, id, -1, v, acc.weight)
      F0 = rd ? acc.F : Number.NaN
      finishTv(0, acc)

      if (rd && set.readAt.includes(0)) {
        const weightBy: Record<string, number> = { [label(id)]: acc.weight }

        readings.push({
          beat: 0,
          weight: acc.weight,
          loves: acc.loves,
          fears: acc.fears,
          rest: 0,
          ledger: { ...ledger },
          weightBy,
          columns: { [label(id)]: 1 },
          ...withReadings(acc, ledger, 0),
        })
      }
    }

    // the start's weight off its main class (float dust of a solve) is ledgered as truncation
    const byClass = [0, 0, 0]
    const q = new Int8Array(s.M)

    for (let r = 0; r < s.M; r++) {
      q[r] = chargeClass(L, cfgOf(s, r), 1)

      for (let c = 0; c < 3; c++) {
        byClass[q[r]!]! += v.re[r * 3 + c]! ** 2 + v.im[r * 3 + c]! ** 2
      }
    }

    const main = byClass.indexOf(Math.max(...byClass))

    for (let r = 0; r < s.M; r++) {
      if (q[r] === main) {
        continue
      }

      for (let c = 0; c < 3; c++) {
        v.re[r * 3 + c] = 0
        v.im[r * 3 + c] = 0
      }
    }

    ledger.trunc += byClass.reduce((x, y, k) => (k === main ? x : x + y), 0)

    const next = emptyStore()

    beatNow = 1
    stepColumn(next, id, v, 1)
    cur = next
  }

  const order = (m: Map<number, unknown>): number[] => [...m.keys()].sort((a, b) => b - a)

  for (let t = 1; t <= set.beats; t++) {
    // the ledgers as the store this beat starts from left them (its step of beat t done), as class-store's snapshot
    const snap: FearLedger = { ...ledger }
    const acc = newAcc(t)
    const next = t < set.beats ? emptyStore() : undefined
    const columns: Record<string, number> = {}

    for (const [id, m] of cur.cols) {
      columns[label(id)] = [...m.values()].reduce((x, c) => x + c.cols.length, 0)
    }

    maxColumns = Math.max(maxColumns, Object.values(columns).reduce((x, y) => x + y, 0))
    beatNow = t + 1

    for (const id of order(cur.dense)) {
      for (const [r, m] of cur.dense.get(id)!) {
        workDense(acc, id, r, m, t, next)
      }
    }

    if (next) {
      for (const x of pending.splice(0)) {
        addBlock(next, x)
      }
    }

    cur.dense.clear()

    for (const id of order(cur.cols)) {
      const s = sector(id)
      const e = engine(id)
      const ix = index(id, t % 2)
      const a = emptyAmp(s.size)
      const b = emptyAmp(s.size)

      for (const [r, c] of cur.cols.get(id)!) {
        const list = ix.lists[r]!

        while (c.cols.length > 0) {
          const col = c.cols.pop()!

          a.re.fill(0)
          a.im.fill(0)

          for (let i = 0; i < list.length; i++) {
            for (let k = 0; k < 3; k++) {
              a.re[list[i]! * 3 + k] = col.re[3 * i + k]!
              a.im[list[i]! * 3 + k] = col.im[3 * i + k]!
            }
          }

          fearBeat(e, a, b)

          let w = 0
          let rest = 0

          for (let rr = 0; rr < s.M; rr++) {
            let x = 0

            for (let k = 0; k < 3; k++) {
              x += b.re[rr * 3 + k]! ** 2 + b.im[rr * 3 + k]! ** 2
            }

            w += x
            rest += e.rest[rr] ? x : 0
          }

          addWeight(acc, id, w, rest)
          readColumn(acc, id, r, b, w)

          if (set.observe) {
            set.observe(t, s, { kind: 'column', v: b })
          }

          // the step reads b and zeroes what it moves; fearBeat writes b whole for the next column
          if (next) {
            stepColumn(next, id, b, t + 1)
          }
        }
      }
    }

    cur.cols.clear()

    traceOff = Math.max(traceOff, Math.abs(acc.weight + snap.trunc + snap.cap + snap.broken - 1))
    restBy.push(acc.rest)
    finishTv(t, acc)

    if (set.every !== undefined && t % set.every === 0) {
      log(
        `fear-store ${arm}: beat ${t} columns ${Object.entries(columns)
          .map(([k, n]) => `${k}=${n}`)
          .join(',')} trunc ${snap.trunc.toExponential(1)} cap ${snap.cap.toExponential(1)} rest ${acc.rest.toExponential(2)}`,
      )
    }

    if (set.readAt.includes(t)) {
      const weightBy: Record<string, number> = {}

      for (const [id, w] of acc.weightBy) {
        weightBy[label(id)] = w
      }

      readings.push({
        beat: t,
        weight: acc.weight,
        loves: acc.loves,
        fears: acc.fears,
        rest: acc.rest,
        ledger: snap,
        weightBy,
        columns,
        ...withReadings(acc, snap, acc.rest),
      })
    }

    if (next) {
      cur = next
    }
  }

  return {
    ...(rd ? { F0 } : {}),
    ...(tvAt.length > 0 ? { tv } : {}),
    readings,
    rest: restBy,
    traceOff,
    maxColumns,
    mergeOff: merged.off,
    seconds: (Date.now() - started) / 1000,
  }
}
