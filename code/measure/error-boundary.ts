// A BOUNDARY THAT HANDS ONLY ERRORS OUTWARD (item vibe-roadmap-grounding-0024; self-structures-and-experience.md,
// structures 7 and 6). B1's line self (E-SLF-0182's level under E-SPN-0103's pieces) on a ring of L docks, with bath
// loves arriving at chosen beats and slots, and an opt-in piece that hands deviations to passing vacuum cells.
//
// THE LINE. B1's closed-ring engine (code/measure/cold-line, the cut trit carried), one sector per love number
// n = 0 .. nMax. Nothing here moves B1's beat: every column is stepped by cold-line's lineBeat (coin before).
//
// THE PASSING VACUUM. Every dock meets a fresh empty passing cell each beat, and the cell leaves (it never meets the
// line again). A love moved into a cell is a record: records of different beats, docks or labels are orthogonal and
// never return, so the line's reduced state is a mixture. It is held as columns per sector, rho_n = sum_i v_i v_i^dag,
// each column a branch of record histories; columns are merged by the Gram eigen decomposition (exact at full rank)
// and, past a cap, the smallest eigen weights are dropped into the `trunc` ledger, reported.
//
// THE PIECES (opt-in, none adopted). Each is a signed permutation of (line, cells), entries 0 and +-1:
//   boundary: a love alone on its dock with no other love within cyclic distance d moves into that dock's cell (the
//     syndrome is the love itself; its fermion sign (-1)^(loves on lower modes)). The partner state (dock empty, cell
//     full, the same neighbourhood) maps back, so the piece is an involution; cells arrive empty, so only the export
//     direction acts. Removing an isolated love cannot change another love's isolation (no love lies within d of
//     it), so the docks' exports commute and the piece is order free (checked).
//   swap: the plain-swap control: every love alone on its dock moves into its cell (the syndrome test removed).
//   copy: the copy-out variant (structure 6): where the boundary's syndrome holds, the cell's trit gains the dock's
//     tone (one love, +1 mod 3), a controlled shift; no love moves. On the line it is the projection onto the
//     syndrome's value at every dock (each value a different record).
//   none: no piece.
// ARRIVALS. At a chosen beat a love in an incoming cell enters line mode (dock a, label j) when that mode is empty
// (a swap, sign (-1)^(loves on lower modes)); when the mode is full the love stays in its cell and passes on.
//
// The cut trit is not touched by an export or an arrival (the cut link's register lies off the dock).
//
// Measurement in floats, as cold-line. The pieces themselves are exact (signed permutations, checked).

import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import {
  boundCount,
  emptyAmp,
  lineBeat,
  lineEngine,
  popcount,
  rankOf,
  type Amp,
  type LineEngine,
  type LineReader,
} from '@/code/measure/cold-line'
import type { Placed } from '@/code/measure/held-cluster'

export type Arm = 'boundary' | 'swap' | 'copy' | 'none'

const TURN = 42
const COS = Float64Array.from({ length: TURN }, (_, a) => Math.cos((2 * Math.PI * a) / TURN))
const SIN = Float64Array.from({ length: TURN }, (_, a) => Math.sin((2 * Math.PI * a) / TURN))

const bit = (lo: number, hi: number, m: number): number => (m < 32 ? (lo >>> m) & 1 : (hi >>> (m - 32)) & 1)

// set modes below m
function below(lo: number, hi: number, m: number): number {
  if (m <= 0) {
    return 0
  }

  if (m < 32) {
    return popcount(lo & ((1 << m) - 1))
  }

  if (m === 32) {
    return popcount(lo)
  }

  return popcount(lo) + popcount(hi & ((1 << (m - 32)) - 1))
}

const docksOf = (lo: number, hi: number, L: number, q: Int32Array): void => {
  for (let x = 0; x < L; x++) {
    q[x] = bit(lo, hi, 2 * x) + bit(lo, hi, 2 * x + 1)
  }
}

const ringDistance = (a: number, b: number, L: number): number => {
  const d = Math.abs(a - b) % L

  return Math.min(d, L - d)
}

// the loves the piece reads at a configuration: every love alone on its dock (swap) or only the isolated ones
// (boundary, copy), as their modes, ascending
export function syndromeModes(lo: number, hi: number, L: number, d: number, isolatedOnly: boolean): number[] {
  const q = new Int32Array(L)

  docksOf(lo, hi, L, q)

  const out: number[] = []

  for (let x = 0; x < L; x++) {
    if (q[x] !== 1) {
      continue
    }

    if (isolatedOnly) {
      let alone = true

      for (let y = 0; y < L && alone; y++) {
        if (y !== x && q[y]! > 0 && ringDistance(x, y, L) <= d) {
          alone = false
        }
      }

      if (!alone) {
        continue
      }
    }

    out.push(bit(lo, hi, 2 * x) === 1 ? 2 * x : 2 * x + 1)
  }

  return out
}

// ---- sectors ----

type Sector = {
  readonly n: number
  // undefined for n = 0 (the empty line: three cut values, the phase only)
  readonly e: LineEngine | undefined
  readonly size: number
  readonly lo: Int32Array
  readonly hi: Int32Array
}

const EMPTY_SIZE = 3

function makeSector(L: number, n: number): Sector {
  if (n === 0) {
    return { n, e: undefined, size: EMPTY_SIZE, lo: new Int32Array(1), hi: new Int32Array(1) }
  }

  const e = lineEngine(L, n, true)

  return { n, e, size: e.sp.count * 3, lo: e.sp.lo, hi: e.sp.hi }
}

// the empty line's beat: the drift cost reads every link with flux c (L links when c != 0), no coin, no stream
function emptyBeat(L: number, a: Amp, out: Amp): void {
  for (let c = 0; c < 3; c++) {
    const t = c === 0 ? 0 : ((((-3 * L) % TURN) + TURN) % TURN)
    const re = a.re[c]!
    const im = a.im[c]!

    out.re[c] = COS[t]! * re - SIN[t]! * im
    out.im[c] = COS[t]! * im + SIN[t]! * re
  }
}

// the export table of a sector for one piece: per configuration the read loves' key (0 none), their count, the
// configuration left (its rank in sector n - k) and the sign of taking them out in ascending order
type ExportTable = {
  readonly key: Float64Array
  readonly k: Uint8Array
  readonly target: Int32Array
  readonly sign: Int8Array
}

function exportTable(s: Sector, L: number, d: number, isolatedOnly: boolean, binom: Float64Array[]): ExportTable {
  const M = s.n === 0 ? 1 : s.e!.sp.count
  const key = new Float64Array(M)
  const k = new Uint8Array(M)
  const target = new Int32Array(M)
  const sign = new Int8Array(M)

  if (s.n === 0) {
    return { key, k, target, sign }
  }

  for (let r = 0; r < M; r++) {
    const lo = s.lo[r]!
    const hi = s.hi[r]!
    const ms = syndromeModes(lo, hi, L, d, isolatedOnly)

    if (ms.length === 0) {
      continue
    }

    let a = lo
    let b = hi
    let parity = 0
    let kk = 0

    for (const m of ms) {
      parity += below(a, b, m)

      if (m < 32) {
        a &= ~(1 << m)
      } else {
        b &= ~(1 << (m - 32))
      }

      kk = kk * 64 + m
    }

    key[r] = kk * 8 + ms.length
    k[r] = ms.length
    target[r] = s.n - ms.length === 0 ? 0 : rankOf(binom, a, b)
    sign[r] = parity % 2 === 0 ? 1 : -1
  }

  return { key, k, target, sign }
}

// ---- columns ----

const weightOf = (a: Amp): number => {
  let w = 0

  for (let u = 0; u < a.re.length; u++) {
    w += a.re[u]! * a.re[u]! + a.im[u]! * a.im[u]!
  }

  return w
}

function inner(a: Amp, b: Amp): [number, number] {
  let sr = 0
  let si = 0

  for (let u = 0; u < a.re.length; u++) {
    const ar = a.re[u]!
    const ai = a.im[u]!
    const br = b.re[u]!
    const bi = b.im[u]!

    sr += ar * br + ai * bi
    si += ar * bi - ai * br
  }

  return [sr, si]
}

// rho = sum_i v_i v_i^dag held as columns; the first `orth` are mutually orthogonal (after a merge)
type Columns = { cols: Amp[]; orth: number }

// merge: the Gram matrix's eigen decomposition, rho = sum_i (V w_i)(V w_i)^dag, keeping the `keep` largest; returns
// the weight left out
export function mergeColumns(c: Columns, keep: number, seen?: (values: readonly number[]) => void): number {
  const k = c.cols.length

  if (k === 0) {
    return 0
  }

  const re = new Float64Array(k * k)
  const im = new Float64Array(k * k)

  for (let a = 0; a < k; a++) {
    for (let b = a; b < k; b++) {
      let g: [number, number]

      if (a < c.orth && b < c.orth) {
        g = a === b ? [weightOf(c.cols[a]!), 0] : [0, 0]
      } else {
        g = inner(c.cols[a]!, c.cols[b]!)
      }

      re[a * k + b] = g[0]
      im[a * k + b] = g[1]
      re[b * k + a] = g[0]
      im[b * k + a] = -g[1]
    }
  }

  const h = hermitianEigenRows(k, re, im)
  const order = Array.from({ length: k }, (_, i) => i).sort((x, y) => h.values[y]! - h.values[x]!)

  if (seen) {
    seen(order.map(i => h.values[i]!))
  }

  const kept = order.slice(0, keep).filter(i => h.values[i]! > 0)
  let dropped = 0

  for (const i of order) {
    if (!kept.includes(i)) {
      dropped += Math.max(0, h.values[i]!)
    }
  }

  const size = c.cols[0]!.re.length
  const out: Amp[] = kept.map(i => {
    const v = emptyAmp(size)

    for (let b = 0; b < k; b++) {
      const wr = h.vectorsRe[i * k + b]!
      const wi = h.vectorsIm[i * k + b]!

      if (wr === 0 && wi === 0) {
        continue
      }

      const col = c.cols[b]!

      for (let u = 0; u < size; u++) {
        const xr = col.re[u]!
        const xi = col.im[u]!

        v.re[u]! += xr * wr - xi * wi
        v.im[u]! += xr * wi + xi * wr
      }
    }

    return v
  })

  // the merge's own check: the kept columns' weight plus the dropped eigen weight is the trace it started with
  let before = 0
  let after = 0

  for (let b = 0; b < k; b++) {
    before += re[b * k + b]!
  }

  for (const v of out) {
    after += weightOf(v)
  }

  mergeOff = Math.max(mergeOff, Math.abs(before - after - dropped))

  c.cols = out
  c.orth = out.length

  return dropped
}

// the worst merge trace mismatch since the last reset
let mergeOff = 0

export function takeMergeOff(): number {
  const x = mergeOff

  mergeOff = 0

  return x
}

// ---- the run ----

export type Arrival = { readonly beat: number; readonly dock: number; readonly label: number }

export type Settings = {
  readonly L: number
  readonly d: number
  readonly nMax: number
  readonly arm: Arm
  readonly arrivals: readonly Arrival[]
  readonly beats: number
  // per sector n: merge when more than cap[n] columns, keeping keep[n]
  readonly cap: readonly number[]
  readonly keep: readonly number[]
  // a new record column under this weight goes to the trunc ledger
  readonly floor: number
  // beats at which F is read (the bound-trio count)
  readonly readAt: readonly number[]
  // the TV window: the beats at whose end the mean TV over the previous `tvWindow` beats is read
  readonly tvAt: readonly number[]
  readonly tvWindow: number
  // log progress every this many beats
  readonly every?: number
  // the most bytes of new dense columns one piece step may make; past it the arm ends (controls only)
  readonly byteBudget?: number
  // STREAM (item vibe-roadmap-grounding-0036's store): one column at a time, the arrival then the piece, each output
  // column added at once to the next beat's sector, which merges as soon as it passes its cap. Both maps are linear
  // and act column by column, so at full rank this is the batch path exactly; only the merges come at other moments,
  // and no step holds more than cap + 1 columns of a sector (plus one column's export buckets). The arrival's own
  // merge goes: a love entering far from the self is handed out by the piece before any merge reads it
  readonly stream?: boolean
  // each merge's eigen weights, descending (sizing only)
  readonly spectrum?: (n: number, beat: number, values: readonly number[]) => void
}

export type Ledger = {
  // the entered arrivals (expected), the loves handed out, the records written by copy-out (expected)
  entered: number
  exported: number
  copies: number
  // weight dropped by merges and the floor, and weight that would pass nMax loves
  trunc: number
  cap: number
  // trunc by sector
  truncBy: number[]
  // branches left with fewer than TRACKED loves (the self lost), their weight and expected loves, followed no further
  broken: number
  brokenLoves: number
}

// the fewest loves a followed branch holds
export const TRACKED = 2

export type Reading = {
  readonly beat: number
  readonly F: number
  readonly weight: number
  readonly loves: number
  readonly entered: number
  readonly exported: number
  readonly copies: number
  readonly trunc: number
  readonly cap: number
  readonly columns: readonly number[]
  readonly truncBy: readonly number[]
  readonly broken: number
  readonly brokenLoves: number
  // kept weight by sector
  readonly weightBy: readonly number[]
}

export type RunResult = {
  readonly readings: Reading[]
  readonly tv: { beat: number; mean: number }[]
  // the worst |kept weight + ledgers - 1| over every beat
  readonly traceOff: number
  readonly maxColumns: number
  // the worst merge trace mismatch (kept + dropped eigen weight against the trace merged)
  readonly mergeOff: number
  // the last whole beat run (the beats asked, unless the byte budget ended the arm)
  readonly reach: number
  readonly seconds: number
}

// B1's level anchored at X (positions taken mod L, wrapped translates carried by the cut trit), in sector 3
export function anchoredStart(L: number, placed: readonly Placed[], X: number): Amp {
  const e = lineEngine(L, 3, true)
  const a = emptyAmp(e.sp.count * 3)

  for (const p of placed) {
    let lo = 0
    let hi = 0
    let wrapped = 0

    for (const [x, j] of p.ts) {
      const y = (((x + X) % L) + L) % L
      const m = j === 0 ? 2 * y + 1 : 2 * y

      wrapped += Math.floor((x + X) / L)

      if (m < 32) {
        lo |= 1 << m
      } else {
        hi |= 1 << (m - 32)
      }
    }

    if (popcount(lo) + popcount(hi) !== 3) {
      continue
    }

    const u = rankOf(e.sp.binom, lo, hi) * 3 + (((-wrapped % 3) + 3) % 3)

    a.re[u]! += p.re
    a.im[u]! += p.im
  }

  const s = 1 / Math.sqrt(weightOf(a))

  for (let u = 0; u < a.re.length; u++) {
    a.re[u]! *= s
    a.im[u]! *= s
  }

  return a
}

export function runBoundary(
  set: Settings,
  start: Amp,
  reader: LineReader,
  log: (what: string) => void,
): RunResult {
  const started = Date.now()
  const { L, d, nMax, arm } = set

  takeMergeOff()
  const sectors: Sector[] = []

  for (let n = 0; n <= nMax; n++) {
    sectors.push(makeSector(L, n))
  }

  const binom = sectors[1]!.e!.sp.binom
  const isolatedOnly = arm !== 'swap'
  const tables: (ExportTable | undefined)[] = sectors.map(s =>
    arm === 'none' ? undefined : exportTable(s, L, d, isolatedOnly, binom),
  )

  log(`error-boundary ${arm}: tables`)

  const rho: Columns[] = sectors.map(() => ({ cols: [], orth: 0 }))

  // a copy: the piece and lineBeat work on their columns in place
  rho[3]!.cols.push({ re: Float64Array.from(start.re), im: Float64Array.from(start.im) })

  const ledger: Ledger = {
    entered: 0,
    exported: 0,
    copies: 0,
    trunc: 0,
    cap: 0,
    truncBy: sectors.map(() => 0),
    broken: 0,
    brokenLoves: 0,
  }
  const readings: Reading[] = []
  const tv: { beat: number; mean: number }[] = []
  const arrivalsAt = new Map<number, Arrival>(set.arrivals.map(a => [a.beat, a]))
  const tvStart = new Set<number>()

  for (const t of set.tvAt) {
    for (let s = t - set.tvWindow; s <= t; s++) {
      tvStart.add(s)
    }
  }

  let traceOff = 0
  let maxColumns = 1
  let stoppedAt: number | undefined
  let prev: Float64Array | undefined
  let tvSum = 0
  let tvCount = 0

  const add = (n: number, v: Amp): void => {
    const w = weightOf(v)

    if (n > nMax) {
      ledger.cap += w
      return
    }

    if (n < TRACKED) {
      ledger.broken += w
      ledger.brokenLoves += n * w
      return
    }

    if (w < set.floor) {
      ledger.trunc += w
      ledger.truncBy[n]! += w
      return
    }

    rho[n]!.cols.push(v)
  }

  // drop the columns a step left under the floor, and forget their orthogonality
  const prune = (): void => {
    rho.forEach((c, n) => {
      c.cols = c.cols.filter(v => {
        const w = weightOf(v)

        if (w < set.floor) {
          ledger.trunc += w
          ledger.truncBy[n]! += w
          return false
        }

        return true
      })
      c.orth = 0
    })
  }

  let beatNow = 0

  const merge = (n: number, c: Columns = rho[n]!): void => {
    if (c.cols.length > set.cap[n]!) {
      const spy = set.spectrum
      const x = mergeColumns(c, set.keep[n]!, spy ? values => spy(n, beatNow, values) : undefined)

      // a 2-love branch has lost the self already: its dropped weight is ledgered as broken, not as truncation
      if (n === TRACKED) {
        ledger.broken += x
        ledger.brokenLoves += n * x
      } else {
        ledger.trunc += x
        ledger.truncBy[n]! += x
      }
    }
  }

  // the n = 3 configuration distribution (summed over the cut), for the interior reading
  const distribution = (): Float64Array => {
    const s = sectors[3]!
    const M = s.e!.sp.count
    const p = new Float64Array(M)

    for (const v of rho[3]!.cols) {
      for (let r = 0; r < M; r++) {
        let w = 0

        for (let c = 0; c < 3; c++) {
          w += v.re[r * 3 + c]! ** 2 + v.im[r * 3 + c]! ** 2
        }

        p[r]! += w
      }
    }

    return p
  }

  const read = (t: number): void => {
    let F = 0
    let weight = 0
    let loves = 0
    const weightBy = rho.map(() => 0)

    rho.forEach((c, n) => {
      for (const v of c.cols) {
        const w = weightOf(v)

        weight += w
        weightBy[n]! += w
        loves += n * w

        if (n >= 3) {
          F += boundCount(sectors[n]!.e!, reader, v)
        }
      }
    })

    readings.push({
      beat: t,
      F,
      weight,
      loves,
      entered: ledger.entered,
      exported: ledger.exported,
      copies: ledger.copies,
      trunc: ledger.trunc,
      cap: ledger.cap,
      columns: rho.map(c => c.cols.length),
      truncBy: [...ledger.truncBy],
      broken: ledger.broken,
      brokenLoves: ledger.brokenLoves,
      weightBy,
    })
  }

  if (set.readAt.includes(0)) {
    read(0)
  }

  if (tvStart.has(0)) {
    prev = distribution()
  }

  // ---- the stream store: one column at a time, the arrival then the piece, into the next beat's sectors ----
  const streamStep = (t: number): boolean => {
    const next: Columns[] = sectors.map(() => ({ cols: [], orth: 0 }))
    let freshBytes = 0
    let overBudget = false

    // as `add`, into next, merging as soon as a sector passes its cap
    const put = (n: number, v: Amp): void => {
      const w = weightOf(v)

      if (n > nMax) {
        ledger.cap += w
        return
      }

      if (n < TRACKED) {
        ledger.broken += w
        ledger.brokenLoves += n * w
        return
      }

      if (w < set.floor) {
        ledger.trunc += w
        ledger.truncBy[n]! += w
        return
      }

      next[n]!.cols.push(v)
      merge(n, next[n]!)
    }

    // the piece on one column of sector n: the part it reads leaves as bucket columns, the rest stays in v
    const pieceOn = (n: number, v: Amp): void => {
      if (arm === 'none' || overBudget) {
        put(n, v)
        return
      }

      const s = sectors[n]!
      const tb = tables[n]!
      const M = s.e!.sp.count
      const buckets = new Map<number, { n: number; at: number[]; re: number[]; im: number[]; w: number }>()

      for (let r = 0; r < M; r++) {
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

          if (arm !== 'copy' && n - k < TRACKED) {
            ledger.exported += k * w
            ledger.broken += w
            ledger.brokenLoves += (n - k) * w
            v.re[u] = 0
            v.im[u] = 0
            continue
          }

          const key = tb.key[r]!
          let b = buckets.get(key)

          if (!b) {
            b = { n: arm === 'copy' ? n : n - k, at: [], re: [], im: [], w: 0 }
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
          }

          v.re[u] = 0
          v.im[u] = 0
        }
      }

      put(n, v)

      for (const b of buckets.values()) {
        if (b.w < set.floor) {
          ledger.trunc += b.w
          ledger.truncBy[b.n]! += b.w
          continue
        }

        const size = sectors[b.n]!.size

        freshBytes += 16 * size

        if (set.byteBudget !== undefined && freshBytes > set.byteBudget) {
          overBudget = true
          return
        }

        const dense = emptyAmp(size)

        b.at.forEach((u, i) => {
          dense.re[u] = b.re[i]!
          dense.im[u] = b.im[i]!
        })
        put(b.n, dense)
      }
    }

    const arrival = arrivalsAt.get(t)
    const m = arrival ? (arrival.label === 0 ? 2 * arrival.dock + 1 : 2 * arrival.dock) : -1

    for (let n = TRACKED; n <= nMax && !overBudget; n++) {
      const list = rho[n]!.cols

      rho[n]!.cols = []

      // the columns leave the old store as they are read, so a sector never sits in memory twice
      while (list.length > 0 && !overBudget) {
        const v = list.pop()!

        if (!arrival) {
          pieceOn(n, v)
          continue
        }

        const s = sectors[n]!
        const M = s.e!.sp.count
        const up = n + 1 <= nMax ? emptyAmp(sectors[n + 1]!.size) : undefined
        let moved = 0

        for (let r = 0; r < M; r++) {
          const lo = s.lo[r]!
          const hi = s.hi[r]!

          if (bit(lo, hi, m) === 1) {
            continue
          }

          const sg = below(lo, hi, m) % 2 === 0 ? 1 : -1
          const nlo = m < 32 ? lo | (1 << m) : lo
          const nhi = m < 32 ? hi : hi | (1 << (m - 32))
          const r1 = up ? rankOf(binom, nlo, nhi) : 0

          for (let c = 0; c < 3; c++) {
            const u = r * 3 + c
            const xr = v.re[u]!
            const xi = v.im[u]!

            if (xr === 0 && xi === 0) {
              continue
            }

            moved += xr * xr + xi * xi

            if (up) {
              up.re[r1 * 3 + c] = sg * xr
              up.im[r1 * 3 + c] = sg * xi
            }

            v.re[u] = 0
            v.im[u] = 0
          }
        }

        ledger.entered += moved

        if (!up) {
          ledger.cap += moved
        }

        pieceOn(n, v)

        if (up) {
          pieceOn(n + 1, up)
        }
      }
    }

    if (overBudget) {
      return false
    }

    next.forEach((c, n) => {
      rho[n] = c
    })

    return true
  }

  for (let t = 1; t <= set.beats; t++) {
    beatNow = t

    if (set.stream) {
      if (!streamStep(t)) {
        stoppedAt = t - 1
        log(`error-boundary ${arm}: beat ${t} needs over ${set.byteBudget} bytes of new columns; the arm ends at beat ${t - 1}`)
        break
      }
    } else {
    // ---- the arrival ----
    const arrival = arrivalsAt.get(t)

    if (arrival) {
      const m = arrival.label === 0 ? 2 * arrival.dock + 1 : 2 * arrival.dock
      const fresh: [number, Amp][] = []

      for (let n = nMax; n >= TRACKED; n--) {
        const s = sectors[n]!

        for (const v of rho[n]!.cols) {
          const up = n + 1 <= nMax ? emptyAmp(sectors[n + 1]!.size) : undefined
          let moved = 0

          if (n === 0) {
            const r1 = rankOf(binom, m < 32 ? 1 << m : 0, m < 32 ? 0 : 1 << (m - 32))

            for (let c = 0; c < 3; c++) {
              moved += v.re[c]! ** 2 + v.im[c]! ** 2

              if (up) {
                up.re[r1 * 3 + c] = v.re[c]!
                up.im[r1 * 3 + c] = v.im[c]!
              }

              v.re[c] = 0
              v.im[c] = 0
            }
          } else {
            const M = s.e!.sp.count

            for (let r = 0; r < M; r++) {
              const lo = s.lo[r]!
              const hi = s.hi[r]!

              if (bit(lo, hi, m) === 1) {
                continue
              }

              const sg = below(lo, hi, m) % 2 === 0 ? 1 : -1
              const nlo = m < 32 ? lo | (1 << m) : lo
              const nhi = m < 32 ? hi : hi | (1 << (m - 32))
              const r1 = up ? rankOf(binom, nlo, nhi) : 0

              for (let c = 0; c < 3; c++) {
                const u = r * 3 + c
                const xr = v.re[u]!
                const xi = v.im[u]!

                if (xr === 0 && xi === 0) {
                  continue
                }

                moved += xr * xr + xi * xi

                if (up) {
                  up.re[r1 * 3 + c] = sg * xr
                  up.im[r1 * 3 + c] = sg * xi
                }

                v.re[u] = 0
                v.im[u] = 0
              }
            }
          }

          ledger.entered += moved

          if (up) {
            fresh.push([n + 1, up])
          } else {
            ledger.cap += moved
          }
        }
      }

      prune()

      for (const [n, v] of fresh) {
        add(n, v)
      }

      for (let n = 0; n <= nMax; n++) {
        merge(n)
      }
    }

    // ---- the piece ----
    if (arm !== 'none') {
      const fresh: [number, Amp][] = []
      let freshBytes = 0
      let overBudget = false

      for (let n = TRACKED; n <= nMax; n++) {
        const s = sectors[n]!
        const tb = tables[n]!
        const M = s.e!.sp.count
        const kept: Amp[] = []

        for (const v of rho[n]!.cols) {
          // sparse until its weight is known: only a bucket over the floor is made dense
          const buckets = new Map<number, { n: number; at: number[]; re: number[]; im: number[]; w: number }>()
          let any = false

          for (let r = 0; r < M; r++) {
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

              any = true

              const w = xr * xr + xi * xi

              // a branch left with fewer than TRACKED loves has lost the self: only its weight is kept, as broken
              if (arm !== 'copy' && n - k < TRACKED) {
                ledger.exported += k * w
                ledger.broken += w
                ledger.brokenLoves += (n - k) * w
                v.re[u] = 0
                v.im[u] = 0
                continue
              }

              const key = tb.key[r]!
              let b = buckets.get(key)

              if (!b) {
                b = { n: arm === 'copy' ? n : n - k, at: [], re: [], im: [], w: 0 }
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
              }

              v.re[u] = 0
              v.im[u] = 0
            }
          }

          kept.push(v)

          if (!any) {
            continue
          }

          for (const b of buckets.values()) {
            if (b.w < set.floor) {
              ledger.trunc += b.w
              ledger.truncBy[b.n]! += b.w
              continue
            }

            const size = sectors[b.n]!.size

            freshBytes += 16 * size

            if (set.byteBudget !== undefined && freshBytes > set.byteBudget) {
              overBudget = true
              break
            }

            const dense = emptyAmp(size)

            b.at.forEach((u, i) => {
              dense.re[u] = b.re[i]!
              dense.im[u] = b.im[i]!
            })
            fresh.push([b.n, dense])
          }

          if (overBudget) {
            break
          }
        }

        if (overBudget) {
          break
        }

        rho[n]!.cols = kept
        rho[n]!.orth = 0
      }

      // past the byte budget the arm ends at the last whole beat (its reach is reported)
      if (overBudget) {
        stoppedAt = t - 1
        log(`error-boundary ${arm}: beat ${t} needs over ${set.byteBudget} bytes of new columns; the arm ends at beat ${t - 1}`)
        break
      }

      prune()

      for (const [n, v] of fresh) {
        add(n, v)
      }

      for (let n = 0; n <= nMax; n++) {
        merge(n)
      }
    }
    }

    // ---- B1's beat ----
    // column by column in place, so the store never sits in memory twice (the old column is dropped as its beaten
    // copy replaces it)
    rho.forEach((c, n) => {
      for (let i = 0; i < c.cols.length; i++) {
        const v = c.cols[i]!
        const out = emptyAmp(v.re.length)

        if (n === 0) {
          emptyBeat(L, v, out)
        } else {
          lineBeat(sectors[n]!.e!, v, out, false)
        }

        c.cols[i] = out
      }
    })

    maxColumns = Math.max(maxColumns, rho.reduce((s, c) => s + c.cols.length, 0))

    if (set.every !== undefined && t % set.every === 0) {
      log(`error-boundary ${arm}: beat ${t} columns ${rho.map(c => c.cols.length).join(',')} trunc ${ledger.truncBy.map(x => x.toExponential(1)).join(',')}`)
    }

    // ---- the readings ----
    let kept = 0

    for (const c of rho) {
      for (const v of c.cols) {
        kept += weightOf(v)
      }
    }

    traceOff = Math.max(traceOff, Math.abs(kept + ledger.trunc + ledger.cap + ledger.broken - 1))

    if (tvStart.has(t)) {
      const p = distribution()

      if (prev && tvStart.has(t - 1)) {
        let s = 0

        for (let r = 0; r < p.length; r++) {
          s += Math.abs(p[r]! - prev[r]!)
        }

        tvSum += s / 2
        tvCount++
      }

      prev = p
    }

    if (set.tvAt.includes(t)) {
      tv.push({ beat: t, mean: tvCount > 0 ? tvSum / tvCount : Number.NaN })
      tvSum = 0
      tvCount = 0
    }

    if (set.readAt.includes(t)) {
      read(t)
      log(
        `error-boundary ${arm}: beat ${t} F ${readings[readings.length - 1]!.F.toFixed(4)} columns ${rho.map(c => c.cols.length).join(',')} trunc ${ledger.trunc.toExponential(1)} cap ${ledger.cap.toExponential(1)}`,
      )
    }
  }

  return {
    readings,
    tv,
    traceOff,
    maxColumns,
    mergeOff: takeMergeOff(),
    reach: stoppedAt ?? set.beats,
    seconds: (Date.now() - started) / 1000,
  }
}

// ---- the instrument: the piece is a signed permutation, order free ----

export type PieceCheck = { configurations: number; orderFree: boolean; injective: boolean; signs: boolean }

// on sector n: exporting the read loves one dock at a time in ascending dock order, re-reading the syndrome after each,
// gives the table's configuration and sign; the map config -> (config left, read modes) is injective; every sign is
// +-1
export function checkPiece(L: number, n: number, d: number, isolatedOnly: boolean): PieceCheck {
  const s = makeSector(L, n)
  const binom = s.e!.sp.binom
  const tb = exportTable(s, L, d, isolatedOnly, binom)
  const M = s.e!.sp.count
  const seen = new Set<string>()

  let orderFree = true
  let injective = true
  let signs = true

  for (let r = 0; r < M; r++) {
    if (tb.k[r] === 0) {
      continue
    }

    let lo = s.lo[r]!
    let hi = s.hi[r]!
    let parity = 0
    const taken: number[] = []

    for (let x = 0; x < L; x++) {
      const now = syndromeModes(lo, hi, L, d, isolatedOnly).filter(m => m >> 1 === x)

      for (const m of now) {
        parity += below(lo, hi, m)
        taken.push(m)

        if (m < 32) {
          lo &= ~(1 << m)
        } else {
          hi &= ~(1 << (m - 32))
        }
      }

      // a dock read once is not read again in the same beat: nothing new may become readable at a lower dock
      if (isolatedOnly) {
        const again = syndromeModes(lo, hi, L, d, true).filter(m => m >> 1 <= x)

        if (again.length > 0) {
          orderFree = false
        }
      }
    }

    const left = n - taken.length === 0 ? 0 : rankOf(binom, lo, hi)
    const sg = parity % 2 === 0 ? 1 : -1

    if (left !== tb.target[r] || sg !== tb.sign[r] || taken.length !== tb.k[r]) {
      orderFree = false
    }

    if (Math.abs(tb.sign[r]!) !== 1) {
      signs = false
    }

    const id = `${left},${tb.key[r]}`

    if (seen.has(id)) {
      injective = false
    }

    seen.add(id)
  }

  return { configurations: M, orderFree, injective, signs }
}
