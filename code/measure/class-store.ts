// THE CLASS STORE: error-boundary.ts's run (B1's line self, the pieces, the
// arrivals, the same readings and ledgers) on a smaller exact store, for E-SLF-0196's two-arrival run.
//
// THE CLASS. On the ring (L even) every love moves exactly one dock a beat (the coin only turns a love's label on its
// dock), so Q_t, the loves on docks x = t mod 2 counted at the step of beat t, is conserved by the beat (E-SLF-0192's
// separation parity, read as a count). The start (B1's level at momentum 0) holds its three loves on one colour, so it
// lies in Q in {0, 3}: one residue of Q mod 3. An arrival at a known dock shifts Q by a known 0 or 1, and an export or a
// copy-out reads loves at known docks, so every branch the run makes lies in ONE residue of Q mod 3 (checked at every
// column: a column across two residues throws). Columns of different residues are orthogonal, so the store holds each
// (love number, residue) apart, each on its own configurations only.
//
// THE KEPT SUPPORT. After the boundary or the swap piece no love it reads is left on the line, so every stored column
// lies on the configurations the piece leaves alone (checked: a stored entry off them throws). Together with the class
// this holds a 4-love column in 371,496 amplitudes on the ring of 32 (d 8), against 1,906,128.
//
// DENSE SECTORS. A (love number, residue) named in `dense` is held as its density matrix on that support (3-love
// residue 0 on the ring of 32: 13,824 rows), not as columns: every record the higher sectors hand it is added as its
// outer product, so it is never merged and never truncated. Its beat is P C rho C^dag P^dag in place (the phase and the
// coin keep the class and the support; the stream is a relabelling), its piece is a block extraction by the piece's
// key, and where it must become columns (an arrival lifting it into a column sector) it is split by a pivoted Cholesky
// whose residual trace is ledgered as truncation. The decision holds every 3-love residue dense (19,200 rows for
// residues 1 and 2 on the ring of 32), and each block becomes the next beat's block IN PLACE: the rows that stay in
// the block are signed and permuted by their stream-and-piece target in the block's own memory, the rows that leave
// are taken out first, so no block is held twice.
//
// THE ORDER. One beat works the dense blocks first (each moved in place to the next beat; a sub-block bound for a
// block not yet moved waits until it has), then runs every stored column through B1's beat, its readings, and the
// next step's arrival and piece, into the next beat's store, so a column is dense in memory only while it is worked.
// Merges are error-boundary's mergeColumns done in place (mergeInPlace: bit-equal, the same caps per
// class, no new columns held beside the old). At full rank this is the stream path exactly; checked to 1e-12 against it
// (tmp/eb41-class-check.ts). The floor applies to every column put, as in the stream path; a dense sector has no floor.
//
// Measurement in floats, as cold-line. Nothing here moves the rule.

import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import { boundCount, emptyAmp, lineBeat, popcount, rankOf, type Amp, type LineReader } from '@/code/measure/cold-line'
import {
  exportTable,
  makeSector,
  takeMergeOff,
  TRACKED,
  type ExportTable,
  type Ledger,
  type Reading,
  type RunResult,
  type Sector,
  type Settings,
} from '@/code/measure/error-boundary'

const TURN = 42
const COS = Float64Array.from({ length: TURN }, (_, a) => Math.cos((2 * Math.PI * a) / TURN))
const SIN = Float64Array.from({ length: TURN }, (_, a) => Math.sin((2 * Math.PI * a) / TURN))
const SQ3 = Math.sqrt(3)
// cold-line's FULL_COIN: keep, cross
const KR = 0.25
const KI = SQ3 / 4
const CR = 0.75
const CI = -SQ3 / 4

// docks x = 0 mod 2 and x = 1 mod 2 in either word (dock 16 starts the high word, so the masks agree)
const PARITY_MASK = [0x33333333, 0xcccccccc | 0]

export type ClassSettings = Settings & {
  // the (love number, residue) pairs held as a density matrix (love numbers TRACKED .. 3 only)
  readonly dense: readonly (readonly [number, number])[]
  // the pivoted Cholesky that hands a dense block to columns stops when no remaining diagonal is over this
  readonly cholesky: number
}

const bit = (lo: number, hi: number, m: number): number => (m < 32 ? (lo >>> m) & 1 : (hi >>> (m - 32)) & 1)

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

  if (m >= 64) {
    return popcount(lo) + popcount(hi)
  }

  return popcount(lo) + popcount(hi & ((1 << (m - 32)) - 1))
}

function extract(lo: number, hi: number, s: number, len: number): number {
  let v: number

  if (s === 0) {
    v = lo
  } else if (s >= 32) {
    v = hi >>> (s - 32)
  } else {
    v = (lo >>> s) | (hi << (32 - s))
  }

  return v & ((1 << len) - 1)
}

function cyclic(lo: number, hi: number, modes: number, s: number, len: number): number {
  if (s + len <= modes) {
    return extract(lo, hi, s, len)
  }

  const first = modes - s

  return extract(lo, hi, s, first) | (extract(lo, hi, 0, len - first) << first)
}

export const classOf = (lo: number, hi: number, parity: number): number =>
  (popcount(lo & PARITY_MASK[parity]!) + popcount(hi & PARITY_MASK[parity]!)) % 3

// per sector and step parity: each configuration's residue (-1 off the kept support), its place in its residue's list
type Index = { resid: Int8Array; pos: Int32Array; lists: Int32Array[] }

function makeIndex(s: Sector, tb: ExportTable | undefined, parity: number, restrict: boolean): Index {
  const M = s.e!.sp.count
  const resid = new Int8Array(M).fill(-1)
  const pos = new Int32Array(M).fill(-1)
  const counts = [0, 0, 0]

  for (let r = 0; r < M; r++) {
    if (restrict && tb!.k[r] !== 0) {
      continue
    }

    const q = classOf(s.lo[r]!, s.hi[r]!, parity)

    resid[r] = q
    pos[r] = counts[q]!
    counts[q]!++
  }

  const lists = counts.map(c => new Int32Array(c))

  for (let r = 0; r < M; r++) {
    if (resid[r]! >= 0) {
      lists[resid[r]!]![pos[r]!] = r
    }
  }

  return { resid, pos, lists }
}

// a dense block's rows bound for one place (its target sector, the rows a, their targets at, their signs)
type Group = { fs: number; a: number[]; at: number[]; sign: number[] }
type Columns = { cols: Amp[]; orth: number }
type Dense = { D: number; re: Float64Array; im: Float64Array }
// per love number, per residue
type Store = { cols: Map<number, Columns>[]; dense: Map<number, Dense>[] }

const weightOf = (a: Amp): number => {
  let w = 0

  for (let u = 0; u < a.re.length; u++) {
    w += a.re[u]! * a.re[u]! + a.im[u]! * a.im[u]!
  }

  return w
}

// B1's reading operator on one configuration and cut: the outputs (anchor, the loves left, the cut left) and the
// coefficients, as boundCount sums them
function boundTerms(
  s: Sector,
  rd: LineReader,
  r: number,
  c: number,
  out: { o: number[]; re: number[]; im: number[] },
): void {
  const sp = s.e!.sp
  const cuts = 3
  const L = sp.L
  const modesAll = 2 * L
  const R = sp.binom[2 * L]![sp.n - 3]!
  const lo = sp.lo[r]!
  const hi = sp.hi[r]!

  for (let X = 0; X < rd.anchors; X++) {
    if (rd.anchored && (X < 16 ? (lo >>> (2 * X)) & 3 : (hi >>> (2 * X - 32)) & 3) === 0) {
      continue
    }

    const w = rd.closed ? cyclic(lo, hi, modesAll, 2 * X, rd.width) : extract(lo, hi, 2 * X, rd.width)
    const list = rd.index[w]!

    for (let li = 0; li < list.length; li++) {
      const t = list[li]!
      const ms = rd.modes[t]!
      let a = lo
      let b = hi
      let wrapped = 0

      for (const m of ms) {
        const g = 2 * X + m

        if (g >= modesAll) {
          wrapped++
        }

        const pm = g % modesAll

        if (pm < 32) {
          a &= ~(1 << pm)
        } else {
          b &= ~(1 << (pm - 32))
        }
      }

      let parity = 0

      for (const m of ms) {
        parity += below(a, b, (2 * X + m) % modesAll)
      }

      const sg = parity % 2 === 0 ? 1 : -1

      out.o.push((X * R + rankOf(sp.binom, a, b)) * cuts + ((c + wrapped) % cuts))
      out.re.push(sg * rd.re[t]!)
      out.im.push(sg * rd.im[t]!)
    }
  }
}

// pivoted Cholesky of the principal block g of a Hermitian matrix (row-major, stride D), in place: emits columns l
// (over g) with block = sum l l^dag + residual, and returns the residual's trace
export function choleskyColumns(
  re: Float64Array,
  im: Float64Array,
  D: number,
  g: readonly number[],
  tol: number,
  emit: (lr: Float64Array, li: Float64Array) => void,
): number {
  const n = g.length
  const d = new Float64Array(n)
  const done = new Uint8Array(n)

  for (let i = 0; i < n; i++) {
    d[i] = re[g[i]! * D + g[i]!]!
  }

  for (let step = 0; step < n; step++) {
    let j = -1

    for (let i = 0; i < n; i++) {
      if (!done[i] && (j < 0 || d[i]! > d[j]!)) {
        j = i
      }
    }

    if (j < 0 || !(d[j]! > tol)) {
      break
    }

    const piv = Math.sqrt(d[j]!)
    const lr = new Float64Array(n)
    const li = new Float64Array(n)
    const gj = g[j]!

    done[j] = 1

    for (let i = 0; i < n; i++) {
      if (done[i]) {
        continue
      }

      lr[i] = re[g[i]! * D + gj]! / piv
      li[i] = im[g[i]! * D + gj]! / piv
    }

    lr[j] = piv

    for (let i = 0; i < n; i++) {
      if (done[i]) {
        continue
      }

      const ar = lr[i]!
      const ai = li[i]!

      if (ar === 0 && ai === 0) {
        continue
      }

      const row = g[i]! * D

      for (let k = 0; k < n; k++) {
        if (done[k]) {
          continue
        }

        const br = lr[k]!
        const bi = li[k]!
        const u = row + g[k]!

        // A_ik -= l_i conj(l_k)
        re[u]! -= ar * br + ai * bi
        im[u]! -= ai * br - ar * bi
      }

      d[i]! -= ar * ar + ai * ai
    }

    emit(lr, li)
  }

  let residual = 0

  for (let i = 0; i < n; i++) {
    if (!done[i]) {
      residual += d[i]!
    }
  }

  return residual
}

// THE IN-PLACE MERGE: error-boundary's mergeColumns with the kept columns written into the memory of
// the columns they replace, so a merge never holds its `keep` new columns beside the cap + 1 old ones. The Gram matrix,
// its eigen solve, the order, the kept set and the dropped weight are mergeColumns' own; the new column j is
// sum_b V_b w_{kept j, b} summed over b in the same order with the same skip of a zero weight, so every amplitude is
// bit-equal to mergeColumns'. The amplitudes are worked a block of rows at a time: the block's kept values are built
// in a scratch of rows x kept, then written over the first kept columns' rows of that block, which no later block
// reads. Returns the weight left out; the trace check is kept in `merged.off`.
const MERGE_ROWS = 256

export const merged = { off: 0 }

function innerOf(a: Amp, b: Amp): [number, number] {
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

export function mergeInPlace(
  c: { cols: Amp[]; orth: number },
  keep: number,
  seen?: (values: readonly number[]) => void,
): number {
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
        g = innerOf(c.cols[a]!, c.cols[b]!)
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
  const isKept = new Uint8Array(k)

  for (const i of kept) {
    isKept[i] = 1
  }

  let dropped = 0

  for (const i of order) {
    if (!isKept[i]) {
      dropped += Math.max(0, h.values[i]!)
    }
  }

  const size = c.cols[0]!.re.length
  const nk = kept.length
  const sr = new Float64Array(MERGE_ROWS * nk)
  const si = new Float64Array(MERGE_ROWS * nk)

  for (let u0 = 0; u0 < size; u0 += MERGE_ROWS) {
    const u1 = Math.min(size, u0 + MERGE_ROWS)
    const rows = u1 - u0

    sr.fill(0)
    si.fill(0)

    for (let b = 0; b < k; b++) {
      const col = c.cols[b]!

      for (let j = 0; j < nk; j++) {
        const wr = h.vectorsRe[kept[j]! * k + b]!
        const wi = h.vectorsIm[kept[j]! * k + b]!

        if (wr === 0 && wi === 0) {
          continue
        }

        const o = j * MERGE_ROWS - u0

        for (let u = u0; u < u1; u++) {
          const xr = col.re[u]!
          const xi = col.im[u]!

          sr[o + u]! += xr * wr - xi * wi
          si[o + u]! += xr * wi + xi * wr
        }
      }
    }

    for (let j = 0; j < nk; j++) {
      c.cols[j]!.re.set(sr.subarray(j * MERGE_ROWS, j * MERGE_ROWS + rows), u0)
      c.cols[j]!.im.set(si.subarray(j * MERGE_ROWS, j * MERGE_ROWS + rows), u0)
    }
  }

  c.cols.length = nk

  // mergeColumns' own check: the kept columns' weight plus the dropped eigen weight is the trace it started with
  let before = 0
  let after = 0

  for (let b = 0; b < k; b++) {
    before += re[b * k + b]!
  }

  for (const v of c.cols) {
    after += weightOf(v)
  }

  merged.off = Math.max(merged.off, Math.abs(before - after - dropped))
  c.orth = nk

  return dropped
}

export function runClassStore(
  set: ClassSettings,
  start: Amp,
  reader: LineReader,
  log: (what: string) => void,
): RunResult {
  const started = Date.now()
  const { L, d, nMax, arm } = set

  if (L % 2 !== 0) {
    throw new Error('class-store: the class needs an even ring')
  }

  if (set.byteBudget !== undefined) {
    throw new Error('class-store: no byte budget (controls only, on the stream path)')
  }

  takeMergeOff()
  merged.off = 0

  const sectors: Sector[] = []

  for (let n = 0; n <= nMax; n++) {
    sectors.push(makeSector(L, Math.max(1, n)))
  }

  const binom = sectors[1]!.e!.sp.binom
  const isolatedOnly = arm !== 'swap'
  const tables: (ExportTable | undefined)[] = sectors.map((s, n) =>
    arm === 'none' || n < TRACKED ? undefined : exportTable(s, L, d, isolatedOnly, binom),
  )
  const restrict = arm === 'boundary' || arm === 'swap'
  const indexes = new Map<number, Index>()
  const index = (n: number, parity: number): Index => {
    const key = n * 2 + parity
    let x = indexes.get(key)

    if (!x) {
      x = makeIndex(sectors[n]!, tables[n], parity, restrict)
      indexes.set(key, x)
    }

    return x
  }
  const denseSet = new Set(set.dense.map(([n, r]) => n * 3 + r))

  for (const [n] of set.dense) {
    if (n < TRACKED || n > 3) {
      throw new Error(`class-store: a dense sector at ${n} loves (only ${TRACKED} .. 3)`)
    }
  }

  const isDense = (n: number, r: number): boolean => denseSet.has(n * 3 + r)

  log(`class-store ${arm}: tables`)

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
  const arrivalsAt = new Map(set.arrivals.map(a => [a.beat, a]))
  const tvStart = new Set<number>()

  for (const t of set.tvAt) {
    for (let s = t - set.tvWindow; s <= t; s++) {
      tvStart.add(s)
    }
  }

  const emptyStore = (): Store => ({
    cols: sectors.map(() => new Map()),
    dense: sectors.map(() => new Map()),
  })

  let beatNow = 0
  let traceOff = 0
  let maxColumns = 1
  let prev: Float64Array | undefined
  let tvSum = 0
  let tvCount = 0

  const merge = (n: number, c: Columns): void => {
    if (c.cols.length > set.cap[n]!) {
      const spy = set.spectrum
      const x = mergeInPlace(c, set.keep[n]!, spy ? values => spy(n, beatNow, values) : undefined)

      if (n === TRACKED) {
        ledger.broken += x
        ledger.brokenLoves += n * x
      } else {
        ledger.trunc += x
        ledger.truncBy[n]! += x
      }
    }
  }

  const dropTrunc = (n: number, w: number): void => {
    if (n === TRACKED) {
      ledger.broken += w
      ledger.brokenLoves += n * w
    } else {
      ledger.trunc += w
      ledger.truncBy[n]! += w
    }
  }

  // a column given by its entries (full-space indices u = configuration * 3 + cut) into the next store at the step
  // parity: as error-boundary's put, then by class into a dense sector or a column list
  const put = (
    next: Store,
    n: number,
    parity: number,
    at: ArrayLike<number>,
    re: ArrayLike<number>,
    im: ArrayLike<number>,
    w: number,
    floorOn: boolean,
  ): void => {
    if (n > nMax) {
      ledger.cap += w
      return
    }

    if (n < TRACKED) {
      ledger.broken += w
      ledger.brokenLoves += n * w
      return
    }

    if (floorOn && w < set.floor) {
      ledger.trunc += w
      ledger.truncBy[n]! += w
      return
    }

    if (at.length === 0) {
      return
    }

    const ix = index(n, parity)
    const r = ix.resid[Math.floor(at[0]! / 3)]!

    for (let i = 0; i < at.length; i++) {
      const q = ix.resid[Math.floor(at[i]! / 3)]!

      if (q !== r || q < 0) {
        throw new Error(
          `class-store: a ${n}-love column at beat ${beatNow} ${q < 0 ? 'off the kept support' : 'across two classes'}`,
        )
      }
    }

    const size = 3 * ix.lists[r]!.length

    if (isDense(n, r)) {
      let m = next.dense[n]!.get(r)

      if (!m) {
        m = { D: size, re: new Float64Array(size * size), im: new Float64Array(size * size) }
        next.dense[n]!.set(r, m)
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
          const yr = re[j]!
          const yi = im[j]!
          const u = row + ii[j]!

          m.re[u]! += xr * yr + xi * yi
          m.im[u]! += xi * yr - xr * yi
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

    let c = next.cols[n]!.get(r)

    if (!c) {
      c = { cols: [], orth: 0 }
      next.cols[n]!.set(r, c)
    }

    c.cols.push(v)
    merge(n, c)
  }

  const putFull = (next: Store, n: number, parity: number, v: Amp, floorOn: boolean): void => {
    const w = weightOf(v)
    const at: number[] = []
    const re: number[] = []
    const im: number[] = []

    if (n <= nMax && n >= TRACKED && !(floorOn && w < set.floor)) {
      for (let u = 0; u < v.re.length; u++) {
        if (v.re[u] !== 0 || v.im[u] !== 0) {
          at.push(u)
          re.push(v.re[u]!)
          im.push(v.im[u]!)
        }
      }
    }

    put(next, n, parity, at, re, im, w, floorOn)
  }

  // error-boundary's pieceOn on one full column of sector n (the step's parity for the outputs)
  const pieceOn = (next: Store, n: number, v: Amp, parity: number): void => {
    if (arm === 'none') {
      putFull(next, n, parity, v, true)
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

    putFull(next, n, parity, v, true)

    for (const b of buckets.values()) {
      put(next, b.n, parity, b.at, b.re, b.im, b.w, true)
    }
  }

  const upBuffers = new Map<number, Amp>()

  // the step of beat `beat` (its arrival, then the piece) on one full column of sector n holding the state after the
  // previous beat
  const stepColumn = (next: Store, n: number, v: Amp, beat: number): void => {
    const parity = beat % 2
    const arrival = arrivalsAt.get(beat)

    if (!arrival) {
      pieceOn(next, n, v, parity)
      return
    }

    const m = arrival.label === 0 ? 2 * arrival.dock + 1 : 2 * arrival.dock
    const s = sectors[n]!
    const M = s.e!.sp.count
    let up: Amp | undefined

    if (n + 1 <= nMax) {
      up = upBuffers.get(n + 1)

      if (!up) {
        up = emptyAmp(sectors[n + 1]!.size)
        upBuffers.set(n + 1, up)
      } else {
        up.re.fill(0)
        up.im.fill(0)
      }
    }

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

    pieceOn(next, n, v, parity)

    if (up) {
      pieceOn(next, n + 1, up, parity)
    }
  }

  // ---- the readings of one beat, summed over the store as it is worked ----
  type Acc = { F: number; weight: number; loves: number; weightBy: number[]; dist: Float64Array | undefined }

  const newAcc = (t: number): Acc => ({
    F: 0,
    weight: 0,
    loves: 0,
    weightBy: sectors.map(() => 0),
    dist: tvStart.has(t) ? new Float64Array(sectors[3]!.e!.sp.count) : undefined,
  })

  const readColumn = (acc: Acc, n: number, v: Amp, withF: boolean): void => {
    const w = weightOf(v)

    acc.weight += w
    acc.weightBy[n]! += w
    acc.loves += n * w

    if (withF && n >= 3) {
      acc.F += boundCount(sectors[n]!.e!, reader, v)
    }

    if (acc.dist && n === 3) {
      const M = sectors[3]!.e!.sp.count

      for (let r = 0; r < M; r++) {
        let x = 0

        for (let c = 0; c < 3; c++) {
          x += v.re[r * 3 + c]! ** 2 + v.im[r * 3 + c]! ** 2
        }

        acc.dist[r]! += x
      }
    }
  }

  const finish = (t: number, acc: Acc, snap: Ledger, columns: number[], withF: boolean): void => {
    traceOff = Math.max(traceOff, Math.abs(acc.weight + snap.trunc + snap.cap + snap.broken - 1))

    if (acc.dist) {
      if (prev && tvStart.has(t - 1)) {
        let s = 0

        for (let r = 0; r < acc.dist.length; r++) {
          s += Math.abs(acc.dist[r]! - prev[r]!)
        }

        tvSum += s / 2
        tvCount++
      }

      prev = acc.dist
    }

    if (set.tvAt.includes(t)) {
      tv.push({ beat: t, mean: tvCount > 0 ? tvSum / tvCount : Number.NaN })
      tvSum = 0
      tvCount = 0
    }

    if (withF) {
      readings.push({
        beat: t,
        F: acc.F,
        weight: acc.weight,
        loves: acc.loves,
        entered: snap.entered,
        exported: snap.exported,
        copies: snap.copies,
        trunc: snap.trunc,
        cap: snap.cap,
        columns,
        truncBy: [...snap.truncBy],
        broken: snap.broken,
        brokenLoves: snap.brokenLoves,
        weightBy: acc.weightBy,
      })
      log(
        `class-store ${arm}: beat ${t} F ${acc.F.toFixed(4)} columns ${columns.join(',')} trunc ${snap.trunc.toExponential(1)} cap ${snap.cap.toExponential(1)}`,
      )
    }
  }

  const snapshot = (): Ledger => ({ ...ledger, truncBy: [...ledger.truncBy] })

  // ---- a dense sector's beat, its readings and the next step, in place ----
  const workDense = (acc: Acc, n: number, r: number, m: Dense, t: number, next: Store | undefined, withF: boolean): void => {
    const s = sectors[n]!
    const e = s.e!
    const ix = index(n, t % 2)
    const list = ix.lists[r]!
    const D = m.D
    const { re, im } = m

    // P then C on the rows
    const rows = (): void => {
      for (let a = 0; a < D; a++) {
        const th = e.phase[list[Math.floor(a / 3)]! * 3 + (a % 3)]!

        if (th === 0) {
          continue
        }

        const pr = COS[th]!
        const pi = SIN[th]!
        const row = a * D

        for (let b = 0; b < D; b++) {
          const xr = re[row + b]!
          const xi = im[row + b]!

          re[row + b] = pr * xr - pi * xi
          im[row + b] = pr * xi + pi * xr
        }
      }

      for (let x = 0; x < L; x++) {
        const shift = x < 16 ? 2 * x : 2 * x - 32
        const C1 = s.e!.sp.binom[2 * x + 1]!
        const C0 = s.e!.sp.binom[2 * x]!

        for (let i = 0; i < list.length; i++) {
          const R = list[i]!
          const word = x < 16 ? s.lo[R]! : s.hi[R]!

          if (((word >>> shift) & 3) !== 2) {
            continue
          }

          const k = below(s.lo[R]!, s.hi[R]!, 2 * x) + 1
          const P = R - C1[k]! + C0[k]!

          if (ix.resid[P] !== r) {
            throw new Error('class-store: the coin left the class')
          }

          const j = ix.pos[P]!

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
    }

    rows()

    // the conjugate transpose, in place
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

    // the stream: index a holds the configuration nc[a], cut ncut[a], with sign sg[a]
    const nc = new Int32Array(D)
    const ncut = new Uint8Array(D)
    const sg = new Int8Array(D)

    for (let a = 0; a < D; a++) {
      const R = list[Math.floor(a / 3)]!

      nc[a] = e.target[R]!
      ncut[a] = ((a % 3) + e.dc[R]!) % 3
      sg[a] = e.sign[R]!
    }

    // readings
    let w = 0

    for (let a = 0; a < D; a++) {
      w += re[a * D + a]!
    }

    acc.weight += w
    acc.weightBy[n]! += w
    acc.loves += n * w

    if (acc.dist && n === 3) {
      for (let a = 0; a < D; a++) {
        acc.dist[nc[a]!]! += re[a * D + a]!
      }
    }

    if (withF && n >= 3) {
      const terms = new Map<number, { a: number[]; re: number[]; im: number[] }>()
      const one = { o: [] as number[], re: [] as number[], im: [] as number[] }

      for (let a = 0; a < D; a++) {
        one.o.length = 0
        one.re.length = 0
        one.im.length = 0
        boundTerms(s, reader, nc[a]!, ncut[a]!, one)

        for (let q = 0; q < one.o.length; q++) {
          let x = terms.get(one.o[q]!)

          if (!x) {
            x = { a: [], re: [], im: [] }
            terms.set(one.o[q]!, x)
          }

          x.a.push(a)
          x.re.push(sg[a]! * one.re[q]!)
          x.im.push(sg[a]! * one.im[q]!)
        }
      }

      for (const x of terms.values()) {
        // sum_ab beta_a rho_ab conj(beta_b)
        for (let i = 0; i < x.a.length; i++) {
          const ar = x.re[i]!
          const ai = x.im[i]!
          const row = x.a[i]! * D

          for (let j = 0; j < x.a.length; j++) {
            const br = x.re[j]!
            const bi = x.im[j]!
            const pr = re[row + x.a[j]!]!
            const pi = im[row + x.a[j]!]!
            // beta_a rho conj(beta_b): real part
            const tr = ar * pr - ai * pi
            const ti = ar * pi + ai * pr

            acc.F += tr * br + ti * bi
          }
        }
      }
    }

    if (!next) {
      return
    }

    // ---- the next step: the arrival, then the piece, by group ----
    const beat = t + 1
    const parity = beat % 2
    const arrival = arrivalsAt.get(beat)
    const mode = arrival ? (arrival.label === 0 ? 2 * arrival.dock + 1 : 2 * arrival.dock) : -1
    const groups = new Map<number, Group>()

    for (let a = 0; a < D; a++) {
      const wa = re[a * D + a]!
      let ds = n
      let cfg = nc[a]!
      let sign = sg[a]!
      let stage = 0

      if (arrival) {
        const lo = s.lo[cfg]!
        const hi = s.hi[cfg]!

        if (bit(lo, hi, mode) === 0) {
          ledger.entered += wa

          if (n + 1 > nMax) {
            ledger.cap += wa
            continue
          }

          stage = 1
          ds = n + 1
          sign *= below(lo, hi, mode) % 2 === 0 ? 1 : -1
          cfg = rankOf(binom, mode < 32 ? lo | (1 << mode) : lo, mode < 32 ? hi : hi | (1 << (mode - 32)))
        }
      }

      let fs = ds
      let key = 0

      if (arm !== 'none') {
        const tb = tables[ds]!
        const k = tb.k[cfg]!

        if (k > 0) {
          if (arm !== 'copy' && ds - k < TRACKED) {
            ledger.exported += k * wa
            ledger.broken += wa
            ledger.brokenLoves += (ds - k) * wa
            continue
          }

          key = tb.key[cfg]!

          if (arm === 'copy') {
            ledger.copies += k * wa
          } else {
            ledger.exported += k * wa
            fs = ds - k
            sign *= tb.sign[cfg]!
            cfg = tb.target[cfg]!
          }
        }
      }

      const id = key * 2 + stage
      let gr = groups.get(id)

      if (!gr) {
        gr = { fs, a: [], at: [], sign: [] }
        groups.set(id, gr)
      }

      gr.a.push(a)
      gr.at.push(cfg * 3 + ncut[a]!)
      gr.sign.push(sign)
    }

    // groups bound for a dense sector are added as blocks; those bound for columns are split by Cholesky, the
    // largest last and in place. The largest group bound for this same block (n, r) is the PRIMARY: it is moved in
    // place, so the block for beat t + 1 lives in this block's memory and no block is held twice.
    const toColumns: Group[] = []
    const toDense: { gr: Group; res: number; ii: Int32Array; size: number }[] = []
    let primary: { gr: Group; ii: Int32Array } | undefined

    for (const gr of groups.values()) {
      const ixF = index(gr.fs, parity)
      const res = ixF.resid[Math.floor(gr.at[0]! / 3)]!

      for (const u of gr.at) {
        if (ixF.resid[Math.floor(u / 3)] !== res || res < 0) {
          throw new Error(`class-store: a dense block at beat ${beat} leaves the kept support or its class`)
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

      if (gr.fs === n && res === r) {
        if (size !== D) {
          throw new Error(`class-store: the ${n}-love residue ${r} block changes size (${D} to ${size}) at beat ${beat}`)
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

    // every other dense-bound group: added at once into a block already moved to beat t + 1, else held as its small
    // sub-block until its target has moved (pending), so nothing is added to a block still at beat t
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

      const add = { n: gr.fs, res, size, ii, re: br, im: bi }

      if (next.dense[gr.fs]!.has(res) || !waiting(gr.fs, res)) {
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

      let pieces = 0
      const residual = choleskyColumns(mr, mi, stride, g, set.cholesky, (lr, li) => {
        const at: number[] = []
        const xr: number[] = []
        const xi: number[] = []
        let w = 0

        for (let i = 0; i < lr.length; i++) {
          if (lr[i] === 0 && li[i] === 0) {
            continue
          }

          at.push(gr.at[i]!)
          xr.push(gr.sign[i]! * lr[i]!)
          xi.push(gr.sign[i]! * li[i]!)
          w += lr[i]! * lr[i]! + li[i]! * li[i]!
        }

        pieces++
        put(next, gr.fs, parity, at, xr, xi, w, true)
      })

      dropTrunc(gr.fs, residual)
      log(`class-store ${arm}: beat ${beat} a dense ${n}-love block of ${gr.a.length} went to ${pieces} ${gr.fs}-love columns, residual ${residual.toExponential(2)}`)
    })

    // the primary group, in place: N[pi(a), pi(b)] = s_a s_b rho[a, b] on its rows, zero elsewhere
    moveInPlace(m, primary)
    next.dense[n]!.set(r, m)
  }

  // the block m becomes the block for the next beat in its own memory: rows and columns off the primary group are
  // zeroed, the signs applied, and the rows then the columns permuted by pi (the primary's target index, completed to
  // a permutation by the unused targets in order), each with one row of scratch
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
        throw new Error('class-store: two rows of one group land on one target')
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

    // complete pi to a permutation: the zeroed rows take the unused targets
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

    // rows: the new row p is the old row inv[p], by cycles
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

    // columns: in each row the entry at b moves to pi[b]
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

  // a dense-bound sub-block (its rows ii in the target's residue list, signs applied) into the next store
  type Add = { n: number; res: number; size: number; ii: Int32Array; re: Float64Array; im: Float64Array }

  const addBlock = (next: Store, x: Add): void => {
    let dm = next.dense[x.n]!.get(x.res)

    if (!dm) {
      dm = { D: x.size, re: new Float64Array(x.size * x.size), im: new Float64Array(x.size * x.size) }
      next.dense[x.n]!.set(x.res, dm)
    }

    const k = x.ii.length

    for (let i = 0; i < k; i++) {
      const out = x.ii[i]! * x.size

      for (let j = 0; j < k; j++) {
        dm.re[out + x.ii[j]!]! += x.re[i * k + j]!
        dm.im[out + x.ii[j]!]! += x.im[i * k + j]!
      }
    }
  }

  // the dense blocks of the beat being worked that have not yet moved to the next beat, and the sub-blocks that wait
  // on them
  let cur = emptyStore()
  const pending: Add[] = []
  const waiting = (n: number, r: number): boolean => cur.dense[n]!.has(r)

  // ---- the run ----
  {
    const withF = set.readAt.includes(0)
    const acc = newAcc(0)
    const v = { re: Float64Array.from(start.re), im: Float64Array.from(start.im) }

    if (withF || acc.dist) {
      readColumn(acc, 3, v, withF)
      finish(0, acc, snapshot(), sectors.map((_, n) => (n === 3 ? 1 : 0)), withF)
    }

    // the start's weight off its main class (float dust of the level's solve) is ledgered as truncation
    const s3 = sectors[3]!
    const byClass = [0, 0, 0]

    for (let r = 0; r < s3.e!.sp.count; r++) {
      const q = classOf(s3.lo[r]!, s3.hi[r]!, 1)

      for (let c = 0; c < 3; c++) {
        byClass[q]! += v.re[r * 3 + c]! ** 2 + v.im[r * 3 + c]! ** 2
      }
    }

    const main = byClass.indexOf(Math.max(...byClass))

    for (let r = 0; r < s3.e!.sp.count; r++) {
      if (classOf(s3.lo[r]!, s3.hi[r]!, 1) === main) {
        continue
      }

      for (let c = 0; c < 3; c++) {
        v.re[r * 3 + c] = 0
        v.im[r * 3 + c] = 0
      }
    }

    const off = byClass.reduce((x, y, q) => (q === main ? x : x + y), 0)

    ledger.trunc += off
    ledger.truncBy[3]! += off
    log(`class-store ${arm}: the start's weight off class ${main}: ${off.toExponential(2)}`)

    const next = emptyStore()

    beatNow = 1
    stepColumn(next, 3, v, 1)
    cur = next
  }

  const bufA = new Map<number, Amp>()
  const bufB = new Map<number, Amp>()
  const scratch = (m: Map<number, Amp>, n: number): Amp => {
    let x = m.get(n)

    if (!x) {
      x = emptyAmp(sectors[n]!.size)
      m.set(n, x)
    }

    return x
  }

  for (let t = 1; t <= set.beats; t++) {
    const snap = snapshot()
    const withF = set.readAt.includes(t)
    const acc = newAcc(t)
    const next = t < set.beats ? emptyStore() : undefined
    const columns = sectors.map((_, n) => [...cur.cols[n]!.values()].reduce((x, c) => x + c.cols.length, 0))

    maxColumns = Math.max(maxColumns, columns.reduce((x, y) => x + y, 0))
    beatNow = t + 1

    // the store this beat starts from, by (love number, residue): columns x amplitudes each, or a dense block's rows,
    // and its bytes (16 a complex amplitude)
    let storeBytes = 0
    const byResidue =
      set.every !== undefined && t % set.every === 0
        ? cur.cols
            .flatMap((m, n) =>
              [...m].map(([r, c]) => {
                const size = c.cols[0]?.re.length ?? 0

                storeBytes += 16 * size * c.cols.length
                return `${n}:${r}=${c.cols.length}x${size}`
              }),
            )
            .concat(
              cur.dense.flatMap((m, n) =>
                [...m].map(([r, x]) => {
                  storeBytes += 16 * x.D * x.D
                  return `${n}:${r}=dense${x.D}`
                }),
              ),
            )
            .join(' ')
        : ''

    // the dense blocks first, each moved in place to the next beat; then what waited on them; then the columns, which
    // add only into blocks already moved
    for (let n = nMax; n >= TRACKED; n--) {
      for (const [r, m] of cur.dense[n]!) {
        workDense(acc, n, r, m, t, next, withF)
      }
    }

    for (const x of pending.splice(0)) {
      addBlock(next!, x)
    }

    for (let n = nMax; n >= TRACKED; n--) {
      cur.dense[n]!.clear()
    }

    for (let n = nMax; n >= TRACKED; n--) {
      const e = sectors[n]!.e!
      const ix = index(n, t % 2)

      for (const [r, c] of cur.cols[n]!) {
        const list = ix.lists[r]!

        while (c.cols.length > 0) {
          const col = c.cols.pop()!
          const a = scratch(bufA, n)
          const b = scratch(bufB, n)

          a.re.fill(0)
          a.im.fill(0)

          for (let i = 0; i < list.length; i++) {
            for (let k = 0; k < 3; k++) {
              a.re[list[i]! * 3 + k] = col.re[3 * i + k]!
              a.im[list[i]! * 3 + k] = col.im[3 * i + k]!
            }
          }

          lineBeat(e, a, b, false)
          readColumn(acc, n, b, withF)

          if (next) {
            stepColumn(next, n, b, t + 1)
          }
        }
      }

      cur.cols[n]!.clear()

      // this love number's full-sector scratch is let go once its columns are worked (a memory cut: the 5-love
      // pair is 0.68 GiB on the ring of 32 and was held through every 4-love merge); a fresh one is zero, as fill(0)
      // leaves a reused one, so no number changes
      bufA.delete(n)
      bufB.delete(n)
    }

    // the arrival's lift buffers are let go after the beat that used them (a memory cut: the 5-love one is 0.34
    // GiB and was held from beat 60 on); a fresh buffer is zero, as fill(0) leaves a reused one
    upBuffers.clear()

    if (set.every !== undefined && t % set.every === 0) {
      // the next beat's store, counted after this beat built it, so a caller reads its allocation beside the store
      // it was measured with (reading alloc against the store at the START of the beat counted an arrival's
      // new dense block twice)
      let nextBytes = 0

      if (next) {
        for (const m of next.cols) {
          for (const c of m.values()) {
            nextBytes += 16 * (c.cols[0]?.re.length ?? 0) * c.cols.length
          }
        }

        for (const m of next.dense) {
          for (const x of m.values()) {
            nextBytes += 16 * x.D * x.D
          }
        }
      }

      log(`class-store ${arm}: beat ${t} columns ${columns.join(',')} trunc ${snap.truncBy.map(x => x.toExponential(1)).join(',')} by residue ${byResidue} store ${(storeBytes / 2 ** 30).toFixed(2)} GiB next ${(nextBytes / 2 ** 30).toFixed(3)} GiB`)
    }

    finish(t, acc, snap, columns, withF)

    if (next) {
      cur = next
    }
  }

  return {
    readings,
    tv,
    traceOff,
    maxColumns,
    mergeOff: Math.max(takeMergeOff(), merged.off),
    reach: set.beats,
    seconds: (Date.now() - started) / 1000,
  }
}
