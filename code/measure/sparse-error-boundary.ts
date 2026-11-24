// SPARSE ERROR BOUNDARY (optimization #2 for code/measure/error-boundary).
//
// Exact sparse implementation of runBoundary supporting all 4 arms ('boundary', 'swap', 'copy', 'none') and both batch
// and stream modes, with ZERO C(2L, n) dense sector/export-table allocations and ZERO dense syndrome column allocations.
//
// Key improvements over dense code/measure/error-boundary:
//   - No makeSector(L, n) or exportTable(s, ...): syndromes, removal signs, and beats are computed on-the-fly over
//     occupied configurations only.
//   - Sparse syndrome buckets become exact SparseAmp columns (25 B / nonzero entry instead of 366 MB dense at n = 5).
//   - Sparse Gram-matrix merge assigns a compact union index across the k columns once, then computes Gram entries and
//     eigenvector reconstructions in contiguous Float64Array scratch buffers with zero BigInt hashing in the inner loop.

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
  packKey,
  packMaskKey,
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

// Exact sparse Gram-matrix merge: builds a compact union index across the k columns once, computes the Hermitian Gram
// matrix with zero BigInt hashing in the inner loop, diagonalizes via hermitianEigenRows, and reconstructs the `keep`
// largest eigen-columns as SparseAmps.
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

  // 1. Build union index of all active keys across the k columns.
  const unionMap = new Map<bigint, number>()
  const uLoList: number[] = []
  const uHiList: number[] = []
  const uCutList: number[] = []
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
      const key = packKey(l, h, ct)
      let u = unionMap.get(key)

      if (u === undefined) {
        u = uLoList.length
        unionMap.set(key, u)
        uLoList.push(l)
        uHiList.push(h)
        uCutList.push(ct)
      }

      idx[j] = u
    }

    colIdx[b] = idx
  }

  const U = uLoList.length
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

    // Scatter colA into accRe/accIm.
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

    // Clear only the entries written by colA.
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

      lo[pos] = uLoList[u]!
      hi[pos] = uHiList[u]!
      cut[pos] = uCutList[u]!
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
  const stayLo: number[] = []
  const stayHi: number[] = []
  const stayCut: number[] = []
  const stayRe: number[] = []
  const stayIm: number[] = []
  const upLo: number[] | undefined = keepUp ? [] : undefined
  const upHi: number[] | undefined = keepUp ? [] : undefined
  const upCut: number[] | undefined = keepUp ? [] : undefined
  const upRe: number[] | undefined = keepUp ? [] : undefined
  const upIm: number[] | undefined = keepUp ? [] : undefined
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
      stayLo.push(l)
      stayHi.push(h)
      stayCut.push(c)
      stayRe.push(xr)
      stayIm.push(xi)
      continue
    }

    moved += xr * xr + xi * xi

    if (keepUp) {
      const sg = (below(l, h, m) & 1) === 0 ? 1 : -1

      upLo!.push(m < 32 ? l | bitMask : l)
      upHi!.push(m < 32 ? h : h | bitMask)
      upCut!.push(c)
      upRe!.push(sg * xr)
      upIm!.push(sg * xi)
    }
  }

  const stay: SparseAmp = {
    lo: Int32Array.from(stayLo),
    hi: Int32Array.from(stayHi),
    cut: Uint8Array.from(stayCut),
    re: Float64Array.from(stayRe),
    im: Float64Array.from(stayIm),
    size: stayLo.length,
  }
  const up: SparseAmp | undefined = keepUp
    ? {
        lo: Int32Array.from(upLo!),
        hi: Int32Array.from(upHi!),
        cut: Uint8Array.from(upCut!),
        re: Float64Array.from(upRe!),
        im: Float64Array.from(upIm!),
        size: upLo!.length,
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
): { stay: SparseAmp; buckets: Map<bigint, SparseBucket> } {
  const isolatedOnly = arm !== 'swap'
  const isCopy = arm === 'copy'
  const { lo, hi, cut, re, im, size } = v
  const stayLo: number[] = []
  const stayHi: number[] = []
  const stayCut: number[] = []
  const stayRe: number[] = []
  const stayIm: number[] = []
  const buckets = new Map<bigint, SparseBucket>()

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
      stayLo.push(l)
      stayHi.push(h)
      stayCut.push(c)
      stayRe.push(xr)
      stayIm.push(xi)
      continue
    }

    const w = xr * xr + xi * xi

    if (!isCopy && n - k < TRACKED) {
      ledger.exported += k * w
      ledger.broken += w
      ledger.brokenLoves += (n - k) * w
      continue
    }

    // Build syndrome mask key (uniquely identifies the sorted set of k syndrome modes for any k).
    let synLo = 0
    let synHi = 0

    for (let j = 0; j < k; j++) {
      const m = synModes[j]!

      if (m < 32) {
        synLo |= 1 << m
      } else {
        synHi |= 1 << (m - 32)
      }
    }

    const key = packMaskKey(synLo, synHi)
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
    lo: Int32Array.from(stayLo),
    hi: Int32Array.from(stayHi),
    cut: Uint8Array.from(stayCut),
    re: Float64Array.from(stayRe),
    im: Float64Array.from(stayIm),
    size: stayLo.length,
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
  let prev: Map<bigint, number> | undefined
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

  // Sparse n = 3 configuration distribution (summed over the cut trit).
  const distribution = (): Map<bigint, number> => {
    const p = new Map<bigint, number>()

    for (const v of rho[3]!.cols) {
      const { lo, hi, re, im, size } = v

      for (let i = 0; i < size; i++) {
        const w = re[i]! * re[i]! + im[i]! * im[i]!

        if (w === 0) {
          continue
        }

        const k = packMaskKey(lo[i]!, hi[i]!)

        p.set(k, (p.get(k) ?? 0) + w)
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
    prev = distribution()
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
      const p = distribution()

      if (prev && tvStart.has(t - 1)) {
        let s = 0

        for (const [k, v] of p) {
          s += Math.abs(v - (prev.get(k) ?? 0))
        }

        for (const [k, v] of prev) {
          if (!p.has(k)) {
            s += v
          }
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
