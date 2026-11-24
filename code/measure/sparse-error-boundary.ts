// SPARSE ERROR BOUNDARY (optimization #2 for code/measure/error-boundary).
//
// Exact sparse implementation of runBoundary supporting all 4 arms ('boundary', 'swap', 'copy', 'none') and both batch
// and stream modes, with ZERO C(2L, n) dense sector/export-table allocations and ZERO dense syndrome column allocations.
//
// Key improvements over dense code/measure/error-boundary:
//   - No makeSector(L, n) or exportTable(s, ...): syndromes, removal signs, and beats are computed on-the-fly over
//     occupied configurations only.
//   - Sparse syndrome buckets become exact SparseAmp columns (25 B / nonzero entry instead of 366 MB dense at n = 5).
//   - Sparse Gram-matrix merge builds a compact union index across the k columns using a flat Int32Array open-addressed
//     hash table (zero BigInt allocations), then computes Gram entries and eigenvector reconstructions in contiguous
//     Float64Array scratch buffers.

import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import { popcount, type LineReader } from '@/code/measure/cold-line'
import {
  TRACKED,
  type Arrival,
  type Ledger,
  type Reading,
  type RunResult,
  type Settings,
} from '@/code/measure/error-boundary'
import {
  cloneSparseAmp,
  emptySparseAmp,
  hashKey3,
  nextPow2,
  sparseBoundCount,
  sparseBytes,
  sparseLineBeat,
  sparseWeightOf,
  type SparseAmp,
} from '@/code/measure/sparse-cold-line'

export type SparseSettings = Settings & {
  // optional amplitude-squared pruning threshold (default 0 for exact mode; 1e-30 prunes float noise)
  readonly dropTol?: number
}

const bit = (lo: number, hi: number, m: number): number =>
  m < 32 ? (lo >>> m) & 1 : (hi >>> (m - 32)) & 1

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

// Reusable scratch buffers for on-the-fly syndrome evaluation (single-threaded, deterministic).
const occDock = new Int32Array(32)
const occCount = new Uint8Array(32)
const occMode = new Uint8Array(32)
const synModes = new Uint8Array(32)

// Computes syndrome modes for (lo, hi) in ascending mode order into synModes[0..k-1] and returns k.
function findSyndromeModes(
  lo: number,
  hi: number,
  L: number,
  d: number,
  isolatedOnly: boolean,
): number {
  let numOcc = 0
  let w = lo

  while (w !== 0) {
    const low = w & -w
    const b = 31 - Math.clz32(low)
    const x = b >>> 1

    if (numOcc > 0 && occDock[numOcc - 1] === x) {
      occCount[numOcc - 1] = 2
    } else {
      occDock[numOcc] = x
      occCount[numOcc] = 1
      occMode[numOcc] = b
      numOcc++
    }

    w ^= low
  }

  w = hi

  while (w !== 0) {
    const low = w & -w
    const b = 63 - Math.clz32(low)
    const x = b >>> 1

    if (numOcc > 0 && occDock[numOcc - 1] === x) {
      occCount[numOcc - 1] = 2
    } else {
      occDock[numOcc] = x
      occCount[numOcc] = 1
      occMode[numOcc] = b
      numOcc++
    }

    w ^= low
  }

  let k = 0

  for (let i = 0; i < numOcc; i++) {
    if (occCount[i] !== 1) {
      continue
    }

    if (isolatedOnly) {
      const xi = occDock[i]!
      let alone = true

      for (let j = 0; j < numOcc; j++) {
        if (j === i) {
          continue
        }

        const raw = Math.abs(xi - occDock[j]!)

        if (Math.min(raw, L - raw) <= d) {
          alone = false
          break
        }
      }

      if (!alone) {
        continue
      }
    }

    synModes[k++] = occMode[i]!
  }

  return k
}

// ---- sparse columns and Gram-matrix merge ----

export type SparseColumns = { cols: SparseAmp[]; orth: number }

let sparseMergeOff = 0

export function takeSparseMergeOff(): number {
  const x = sparseMergeOff

  sparseMergeOff = 0

  return x
}

// Exact sparse Gram-matrix merge: builds a compact union index across the k columns once using a flat Int32Array
// open-addressed hash table, computes the Hermitian Gram matrix with zero BigInt hashing, diagonalizes via
// hermitianEigenRows, and reconstructs the `keep` largest eigen-columns as SparseAmps.
export function sparseMergeColumns(
  c: SparseColumns,
  keep: number,
  seen?: (values: readonly number[]) => void,
  dropTol = 0,
): number {
  const k = c.cols.length

  if (k === 0) {
    return 0
  }

  // 1. Build union index of all active keys across the k columns with a flat open-addressed table.
  let maxColSize = 0

  for (let b = 0; b < k; b++) {
    if (c.cols[b]!.size > maxColSize) {
      maxColSize = c.cols[b]!.size
    }
  }

  let htCap = nextPow2(Math.max(64, maxColSize * 4))
  let htMask = htCap - 1
  let ht = new Int32Array(htCap)

  ht.fill(-1)

  let uCap = htCap >> 1
  let uLo = new Int32Array(uCap)
  let uHi = new Int32Array(uCap)
  let uCut = new Uint8Array(uCap)
  let U = 0

  const rehashUnion = (): void => {
    const newHtCap = htCap * 2
    const newMask = newHtCap - 1
    const newHt = new Int32Array(newHtCap)

    newHt.fill(-1)

    for (let i = 0; i < U; i++) {
      let pos = hashKey3(uLo[i]!, uHi[i]!, uCut[i]!) & newMask

      while (newHt[pos]! !== -1) {
        pos = (pos + 1) & newMask
      }

      newHt[pos] = i
    }

    const newUCap = newHtCap >> 1
    const nLo = new Int32Array(newUCap)
    const nHi = new Int32Array(newUCap)
    const nCut = new Uint8Array(newUCap)

    nLo.set(uLo)
    nHi.set(uHi)
    nCut.set(uCut)
    htCap = newHtCap
    htMask = newMask
    ht = newHt
    uCap = newUCap
    uLo = nLo
    uHi = nHi
    uCut = nCut
  }

  const colIdx: Int32Array[] = new Array(k)

  for (let b = 0; b < k; b++) {
    const col = c.cols[b]!
    const n = col.size
    const idx = new Int32Array(n)
    const { lo, hi, cut } = col

    for (let j = 0; j < n; j++) {
      const l = lo[j]!
      const h = hi[j]!
      const ct = cut[j]!

      if (U >= uCap) {
        rehashUnion()
      }

      let pos = hashKey3(l, h, ct) & htMask
      let u = ht[pos]!

      while (u !== -1) {
        if (uLo[u] === l && uHi[u] === h && uCut[u] === ct) {
          break
        }

        pos = (pos + 1) & htMask
        u = ht[pos]!
      }

      if (u === -1) {
        u = U++
        ht[pos] = u
        uLo[u] = l
        uHi[u] = h
        uCut[u] = ct
      }

      idx[j] = u
    }

    colIdx[b] = idx
  }

  const accRe = new Float64Array(U)
  const accIm = new Float64Array(U)

  // 2. Compute k x k Hermitian Gram matrix.
  const re = new Float64Array(k * k)
  const im = new Float64Array(k * k)

  for (let a = 0; a < k; a++) {
    const colA = c.cols[a]!

    re[a * k + a] = sparseWeightOf(colA)
    im[a * k + a] = 0

    const bStart = a < c.orth ? c.orth : a + 1

    if (bStart >= k || colA.size === 0) {
      continue
    }

    const idxA = colIdx[a]!

    for (let j = 0; j < colA.size; j++) {
      const u = idxA[j]!

      accRe[u] = colA.re[j]!
      accIm[u] = colA.im[j]!
    }

    for (let b = bStart; b < k; b++) {
      const colB = c.cols[b]!
      const idxB = colIdx[b]!
      const bRe = colB.re
      const bIm = colB.im
      let sr = 0
      let si = 0

      for (let j = 0; j < colB.size; j++) {
        const u = idxB[j]!
        const ar = accRe[u]!
        const ai = accIm[u]!
        const br = bRe[j]!
        const bi = bIm[j]!

        sr += ar * br + ai * bi
        si += ar * bi - ai * br
      }

      re[a * k + b] = sr
      im[a * k + b] = si
      re[b * k + a] = sr
      im[b * k + a] = -si
    }

    for (let j = 0; j < colA.size; j++) {
      const u = idxA[j]!

      accRe[u] = 0
      accIm[u] = 0
    }
  }

  // 3. Eigendecompose the k x k Gram matrix.
  const h = hermitianEigenRows(k, re, im)
  const order = Array.from({ length: k }, (_, i) => i).sort((x, y) => h.values[y]! - h.values[x]!)

  if (seen) {
    seen(order.map(i => h.values[i]!))
  }

  const kept = order.slice(0, keep).filter(i => h.values[i]! > 0)
  const keptSet = new Set(kept)
  let dropped = 0

  for (const i of order) {
    if (!keptSet.has(i)) {
      dropped += Math.max(0, h.values[i]!)
    }
  }

  // 4. Reconstruct kept columns as compact SparseAmps.
  const out: SparseAmp[] = kept.map(i => {
    accRe.fill(0)
    accIm.fill(0)

    for (let b = 0; b < k; b++) {
      const wr = h.vectorsRe[i * k + b]!
      const wi = h.vectorsIm[i * k + b]!

      if (wr === 0 && wi === 0) {
        continue
      }

      const col = c.cols[b]!
      const idx = colIdx[b]!
      const cRe = col.re
      const cIm = col.im

      for (let j = 0; j < col.size; j++) {
        const u = idx[j]!
        const xr = cRe[j]!
        const xi = cIm[j]!

        accRe[u]! += xr * wr - xi * wi
        accIm[u]! += xr * wi + xi * wr
      }
    }

    let count = 0

    for (let u = 0; u < U; u++) {
      const r = accRe[u]!
      const m = accIm[u]!

      if (dropTol === 0 ? r !== 0 || m !== 0 : r * r + m * m > dropTol) {
        count++
      }
    }

    const lo = new Int32Array(count)
    const hi = new Int32Array(count)
    const cut = new Uint8Array(count)
    const oRe = new Float64Array(count)
    const oIm = new Float64Array(count)
    let pos = 0

    for (let u = 0; u < U; u++) {
      const r = accRe[u]!
      const m = accIm[u]!

      if (dropTol === 0 ? r === 0 && m === 0 : r * r + m * m <= dropTol) {
        continue
      }

      lo[pos] = uLo[u]!
      hi[pos] = uHi[u]!
      cut[pos] = uCut[u]!
      oRe[pos] = r
      oIm[pos] = m
      pos++
    }

    return { lo, hi, cut, re: oRe, im: oIm, size: count }
  })

  // 5. Merge trace check.
  let before = 0
  let after = 0

  for (let b = 0; b < k; b++) {
    before += re[b * k + b]!
  }

  for (const v of out) {
    after += sparseWeightOf(v)
  }

  sparseMergeOff = Math.max(sparseMergeOff, Math.abs(before - after - dropped))

  c.cols = out
  c.orth = out.length

  return dropped
}

// ---- sparse arrival & piece helpers ----

function applyArrivalToColumn(
  v: SparseAmp,
  m: number,
  keepUp: boolean,
): { stay: SparseAmp; up: SparseAmp | undefined; moved: number } {
  const { lo, hi, cut, re, im, size } = v
  const stayLo = new Int32Array(size)
  const stayHi = new Int32Array(size)
  const stayCut = new Uint8Array(size)
  const stayRe = new Float64Array(size)
  const stayIm = new Float64Array(size)
  let stayCount = 0

  const upLo = keepUp ? new Int32Array(size) : undefined
  const upHi = keepUp ? new Int32Array(size) : undefined
  const upCut = keepUp ? new Uint8Array(size) : undefined
  const upRe = keepUp ? new Float64Array(size) : undefined
  const upIm = keepUp ? new Float64Array(size) : undefined
  let upCount = 0

  const bitMask = m < 32 ? 1 << m : 1 << (m - 32)
  let moved = 0

  for (let i = 0; i < size; i++) {
    const xr = re[i]!
    const xi = im[i]!

    if (xr === 0 && xi === 0) {
      continue
    }

    const l = lo[i]!
    const h = hi[i]!
    const c = cut[i]!

    if (bit(l, h, m) === 1) {
      stayLo[stayCount] = l
      stayHi[stayCount] = h
      stayCut[stayCount] = c
      stayRe[stayCount] = xr
      stayIm[stayCount] = xi
      stayCount++
      continue
    }

    moved += xr * xr + xi * xi

    if (keepUp) {
      const sg = (below(l, h, m) & 1) === 0 ? 1 : -1

      upLo![upCount] = m < 32 ? l | bitMask : l
      upHi![upCount] = m < 32 ? h : h | bitMask
      upCut![upCount] = c
      upRe![upCount] = sg * xr
      upIm![upCount] = sg * xi
      upCount++
    }
  }

  const stay: SparseAmp = {
    lo: stayCount === size ? stayLo : stayLo.slice(0, stayCount),
    hi: stayCount === size ? stayHi : stayHi.slice(0, stayCount),
    cut: stayCount === size ? stayCut : stayCut.slice(0, stayCount),
    re: stayCount === size ? stayRe : stayRe.slice(0, stayCount),
    im: stayCount === size ? stayIm : stayIm.slice(0, stayCount),
    size: stayCount,
  }
  const up: SparseAmp | undefined = keepUp
    ? {
        lo: upCount === size ? upLo! : upLo!.slice(0, upCount),
        hi: upCount === size ? upHi! : upHi!.slice(0, upCount),
        cut: upCount === size ? upCut! : upCut!.slice(0, upCount),
        re: upCount === size ? upRe! : upRe!.slice(0, upCount),
        im: upCount === size ? upIm! : upIm!.slice(0, upCount),
        size: upCount,
      }
    : undefined

  return { stay, up, moved }
}

type SparseBucket = {
  n: number
  lo: number[]
  hi: number[]
  cut: number[]
  re: number[]
  im: number[]
  w: number
}

function applyPieceToColumn(
  n: number,
  v: SparseAmp,
  L: number,
  d: number,
  arm: 'boundary' | 'swap' | 'copy',
  ledger: Ledger,
): { stay: SparseAmp; buckets: Map<number, SparseBucket> } {
  const isolatedOnly = arm !== 'swap'
  const isCopy = arm === 'copy'
  const { lo, hi, cut, re, im, size } = v
  const stayLo = new Int32Array(size)
  const stayHi = new Int32Array(size)
  const stayCut = new Uint8Array(size)
  const stayRe = new Float64Array(size)
  const stayIm = new Float64Array(size)
  let stayCount = 0
  const buckets = new Map<number, SparseBucket>()

  for (let i = 0; i < size; i++) {
    const xr = re[i]!
    const xi = im[i]!

    if (xr === 0 && xi === 0) {
      continue
    }

    const l = lo[i]!
    const h = hi[i]!
    const c = cut[i]!
    const k = findSyndromeModes(l, h, L, d, isolatedOnly)

    if (k === 0) {
      stayLo[stayCount] = l
      stayHi[stayCount] = h
      stayCut[stayCount] = c
      stayRe[stayCount] = xr
      stayIm[stayCount] = xi
      stayCount++
      continue
    }

    const w = xr * xr + xi * xi

    if (!isCopy && n - k < TRACKED) {
      ledger.exported += k * w
      ledger.broken += w
      ledger.brokenLoves += (n - k) * w
      continue
    }

    // Exact safe-integer syndrome key matching dense error-boundary.ts (exact up to k <= 8).
    let kk = 0

    for (let j = 0; j < k; j++) {
      kk = kk * 64 + synModes[j]!
    }

    const key = kk * 8 + k
    let b = buckets.get(key)

    if (!b) {
      b = { n: isCopy ? n : n - k, lo: [], hi: [], cut: [], re: [], im: [], w: 0 }
      buckets.set(key, b)
    }

    b.w += w

    if (isCopy) {
      b.lo.push(l)
      b.hi.push(h)
      b.cut.push(c)
      b.re.push(xr)
      b.im.push(xi)
      ledger.copies += k * w
    } else {
      let aLo = l
      let aHi = h
      let parity = 0

      for (let j = 0; j < k; j++) {
        const m = synModes[j]!

        parity += below(aLo, aHi, m)

        if (m < 32) {
          aLo &= ~(1 << m)
        } else {
          aHi &= ~(1 << (m - 32))
        }
      }

      const sg = (parity & 1) === 0 ? 1 : -1

      b.lo.push(aLo)
      b.hi.push(aHi)
      b.cut.push(c)
      b.re.push(sg * xr)
      b.im.push(sg * xi)
      ledger.exported += k * w
    }
  }

  const stay: SparseAmp = {
    lo: stayCount === size ? stayLo : stayLo.slice(0, stayCount),
    hi: stayCount === size ? stayHi : stayHi.slice(0, stayCount),
    cut: stayCount === size ? stayCut : stayCut.slice(0, stayCount),
    re: stayCount === size ? stayRe : stayRe.slice(0, stayCount),
    im: stayCount === size ? stayIm : stayIm.slice(0, stayCount),
    size: stayCount,
  }

  return { stay, buckets }
}

const bucketToSparseAmp = (b: SparseBucket): SparseAmp => ({
  lo: Int32Array.from(b.lo),
  hi: Int32Array.from(b.hi),
  cut: Uint8Array.from(b.cut),
  re: Float64Array.from(b.re),
  im: Float64Array.from(b.im),
  size: b.lo.length,
})

// ---- flat sparse configuration distribution for TV distance ----

type SparseDist = {
  readonly lo: Int32Array
  readonly hi: Int32Array
  readonly w: Float64Array
  readonly count: number
  readonly ht: Int32Array
  readonly mask: number
}

function buildSparseDist(cols: readonly SparseAmp[]): SparseDist {
  let maxCol = 0

  for (const v of cols) {
    if (v.size > maxCol) {
      maxCol = v.size
    }
  }

  let htCap = nextPow2(Math.max(64, maxCol * 2))
  let mask = htCap - 1
  let ht = new Int32Array(htCap)

  ht.fill(-1)

  let cap = htCap >> 1
  let dLo = new Int32Array(cap)
  let dHi = new Int32Array(cap)
  let dW = new Float64Array(cap)
  let count = 0

  const rehash = (): void => {
    const nHtCap = htCap * 2
    const nMask = nHtCap - 1
    const nHt = new Int32Array(nHtCap)

    nHt.fill(-1)

    for (let i = 0; i < count; i++) {
      let pos = hashKey3(dLo[i]!, dHi[i]!, 0) & nMask

      while (nHt[pos]! !== -1) {
        pos = (pos + 1) & nMask
      }

      nHt[pos] = i
    }

    const nCap = nHtCap >> 1
    const nLo = new Int32Array(nCap)
    const nHi = new Int32Array(nCap)
    const nW = new Float64Array(nCap)

    nLo.set(dLo)
    nHi.set(dHi)
    nW.set(dW)
    htCap = nHtCap
    mask = nMask
    ht = nHt
    cap = nCap
    dLo = nLo
    dHi = nHi
    dW = nW
  }

  for (const v of cols) {
    const { lo, hi, re, im, size } = v

    for (let i = 0; i < size; i++) {
      const w = re[i]! * re[i]! + im[i]! * im[i]!

      if (w === 0) {
        continue
      }

      const l = lo[i]!
      const h = hi[i]!

      if (count >= cap) {
        rehash()
      }

      let pos = hashKey3(l, h, 0) & mask
      let idx = ht[pos]!

      while (idx !== -1) {
        if (dLo[idx] === l && dHi[idx] === h) {
          dW[idx]! += w
          break
        }

        pos = (pos + 1) & mask
        idx = ht[pos]!
      }

      if (idx === -1) {
        const id = count++

        ht[pos] = id
        dLo[id] = l
        dHi[id] = h
        dW[id] = w
      }
    }
  }

  return { lo: dLo, hi: dHi, w: dW, count, ht, mask }
}

function tvDistance(a: SparseDist, b: SparseDist): number {
  let s = 0

  for (let i = 0; i < a.count; i++) {
    const l = a.lo[i]!
    const h = a.hi[i]!
    let pos = hashKey3(l, h, 0) & b.mask
    let j = b.ht[pos]!

    while (j !== -1) {
      if (b.lo[j] === l && b.hi[j] === h) {
        break
      }

      pos = (pos + 1) & b.mask
      j = b.ht[pos]!
    }

    s += Math.abs(a.w[i]! - (j === -1 ? 0 : b.w[j]!))
  }

  for (let j = 0; j < b.count; j++) {
    const l = b.lo[j]!
    const h = b.hi[j]!
    let pos = hashKey3(l, h, 0) & a.mask
    let i = a.ht[pos]!

    while (i !== -1) {
      if (a.lo[i] === l && a.hi[i] === h) {
        break
      }

      pos = (pos + 1) & a.mask
      i = a.ht[pos]!
    }

    if (i === -1) {
      s += b.w[j]!
    }
  }

  return s / 2
}

// ---- the sparse run ----

export function runSparseBoundary(
  set: SparseSettings,
  start: SparseAmp,
  reader: LineReader,
  log: (what: string) => void,
): RunResult {
  const started = Date.now()
  const { L, d, nMax, arm } = set
  const dropTol = set.dropTol ?? 0

  takeSparseMergeOff()

  const rho: SparseColumns[] = Array.from({ length: nMax + 1 }, () => ({ cols: [], orth: 0 }))

  rho[3]!.cols.push(cloneSparseAmp(start))

  const ledger: Ledger = {
    entered: 0,
    exported: 0,
    copies: 0,
    trunc: 0,
    cap: 0,
    truncBy: Array.from({ length: nMax + 1 }, () => 0),
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
  let prev: SparseDist | undefined
  let tvSum = 0
  let tvCount = 0

  const add = (n: number, v: SparseAmp): void => {
    const w = sparseWeightOf(v)

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

  const prune = (): void => {
    rho.forEach((c, n) => {
      c.cols = c.cols.filter(v => {
        const w = sparseWeightOf(v)

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

  const merge = (n: number, c: SparseColumns = rho[n]!): void => {
    if (c.cols.length > set.cap[n]!) {
      const spy = set.spectrum
      const x = sparseMergeColumns(
        c,
        set.keep[n]!,
        spy ? values => spy(n, beatNow, values) : undefined,
        dropTol,
      )

      if (n === TRACKED) {
        ledger.broken += x
        ledger.brokenLoves += n * x
      } else {
        ledger.trunc += x
        ledger.truncBy[n]! += x
      }
    }
  }

  const read = (t: number): void => {
    let F = 0
    let weight = 0
    let loves = 0
    const weightBy = rho.map(() => 0)

    rho.forEach((c, n) => {
      for (const v of c.cols) {
        const w = sparseWeightOf(v)

        weight += w
        weightBy[n]! += w
        loves += n * w

        if (n >= 3) {
          F += sparseBoundCount(L, n, true, reader, v)
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
    prev = buildSparseDist(rho[3]!.cols)
  }

  // ---- stream mode ----
  const streamStep = (t: number): boolean => {
    const next: SparseColumns[] = Array.from({ length: nMax + 1 }, () => ({ cols: [], orth: 0 }))
    let freshBytes = 0
    let overBudget = false

    const put = (n: number, v: SparseAmp): void => {
      const w = sparseWeightOf(v)

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

    const pieceOn = (n: number, v: SparseAmp): void => {
      if (arm === 'none' || overBudget) {
        put(n, v)
        return
      }

      const { stay, buckets } = applyPieceToColumn(n, v, L, d, arm, ledger)

      put(n, stay)

      for (const b of buckets.values()) {
        if (b.w < set.floor) {
          ledger.trunc += b.w
          ledger.truncBy[b.n]! += b.w
          continue
        }

        const sp = bucketToSparseAmp(b)

        freshBytes += sparseBytes(sp)

        if (set.byteBudget !== undefined && freshBytes > set.byteBudget) {
          overBudget = true
          return
        }

        put(b.n, sp)
      }
    }

    const arrival = arrivalsAt.get(t)
    const m = arrival ? (arrival.label === 0 ? 2 * arrival.dock + 1 : 2 * arrival.dock) : -1

    for (let n = TRACKED; n <= nMax && !overBudget; n++) {
      const list = rho[n]!.cols

      rho[n]!.cols = []

      while (list.length > 0 && !overBudget) {
        const v = list.pop()!

        if (!arrival) {
          pieceOn(n, v)
          continue
        }

        const { stay, up, moved } = applyArrivalToColumn(v, m, n + 1 <= nMax)

        ledger.entered += moved

        if (!up) {
          ledger.cap += moved
        }

        pieceOn(n, stay)

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
        log(
          `sparse-error-boundary ${arm}: beat ${t} needs over ${set.byteBudget} bytes of new columns; the arm ends at beat ${t - 1}`,
        )
        break
      }
    } else {
      // ---- arrival ----
      const arrival = arrivalsAt.get(t)

      if (arrival) {
        const m = arrival.label === 0 ? 2 * arrival.dock + 1 : 2 * arrival.dock
        const fresh: [number, SparseAmp][] = []

        for (let n = nMax; n >= TRACKED; n--) {
          const cols = rho[n]!.cols

          for (let i = 0; i < cols.length; i++) {
            const { stay, up, moved } = applyArrivalToColumn(cols[i]!, m, n + 1 <= nMax)

            cols[i] = stay
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

      // ---- piece ----
      if (arm !== 'none') {
        const fresh: [number, SparseAmp][] = []
        let freshBytes = 0
        let overBudget = false

        for (let n = TRACKED; n <= nMax; n++) {
          const kept: SparseAmp[] = []

          for (const v of rho[n]!.cols) {
            const { stay, buckets } = applyPieceToColumn(n, v, L, d, arm, ledger)

            kept.push(stay)

            if (buckets.size === 0) {
              continue
            }

            for (const b of buckets.values()) {
              if (b.w < set.floor) {
                ledger.trunc += b.w
                ledger.truncBy[b.n]! += b.w
                continue
              }

              const sp = bucketToSparseAmp(b)

              freshBytes += sparseBytes(sp)

              if (set.byteBudget !== undefined && freshBytes > set.byteBudget) {
                overBudget = true
                break
              }

              fresh.push([b.n, sp])
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

        if (overBudget) {
          stoppedAt = t - 1
          log(
            `sparse-error-boundary ${arm}: beat ${t} needs over ${set.byteBudget} bytes of new columns; the arm ends at beat ${t - 1}`,
          )
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
    rho.forEach(c => {
      for (let i = 0; i < c.cols.length; i++) {
        c.cols[i] = sparseLineBeat(L, true, c.cols[i]!, false, dropTol).amp
      }
    })

    maxColumns = Math.max(
      maxColumns,
      rho.reduce((s, c) => s + c.cols.length, 0),
    )

    if (set.every !== undefined && t % set.every === 0) {
      log(
        `sparse-error-boundary ${arm}: beat ${t} columns ${rho.map(c => c.cols.length).join(',')} trunc ${ledger.truncBy.map(x => x.toExponential(1)).join(',')}`,
      )
    }

    // ---- readings ----
    let kept = 0

    for (const c of rho) {
      for (const v of c.cols) {
        kept += sparseWeightOf(v)
      }
    }

    traceOff = Math.max(traceOff, Math.abs(kept + ledger.trunc + ledger.cap + ledger.broken - 1))

    if (tvStart.has(t)) {
      const p = buildSparseDist(rho[3]!.cols)

      if (prev && tvStart.has(t - 1)) {
        tvSum += tvDistance(p, prev)
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
        `sparse-error-boundary ${arm}: beat ${t} F ${readings[readings.length - 1]!.F.toFixed(4)} columns ${rho.map(c => c.cols.length).join(',')} trunc ${ledger.trunc.toExponential(1)} cap ${ledger.cap.toExponential(1)}`,
      )
    }
  }

  return {
    readings,
    tv,
    traceOff,
    maxColumns,
    mergeOff: takeSparseMergeOff(),
    reach: stoppedAt ?? set.beats,
    seconds: (Date.now() - started) / 1000,
  }
}

export { emptySparseAmp, sparseBytes, sparseWeightOf }
