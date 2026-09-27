// Measurement for E-SPN-0113 (test/experiment/spin/meson-joint-limit): the string-bound love-fear meson of code/measure/string-binding at large D and fine n,
// where the dense eigensolve of a parity block (dimension about 4 box) is past any budget.
//
// THE BANDED BEAT. The pair beat on one parity block (string-binding pairReduced) moves d = x_fear - x_love by 0 or
// +-2 and the wall keeps d, so in the block's own order (configurations by d, then the four labels) every column
// reaches rows within a few places of its own: the operator is banded. `pairBand` holds it as sparse columns with its
// measured lower and upper bandwidths, `bandSolve` solves (U - s) x = b by banded Gaussian elimination with partial
// pivoting (the fill of the upper band is at most the lower bandwidth, so every row fits a window of 2 kl + ku + 1),
// and `bandInverse` is drift-cost-bloch's inverseIterate on it (the same Rayleigh shift nudged off the circle by 1e-10,
// the same rounds and stop). The experiment checks it against the dense inverseIterate and pairLevels on blocks both
// can hold.
//
// THE FAMILY, FOLLOWED IN D (`carry`). A level of the block at (D, box) is carried to (D', box') by keeping each
// amplitude at its own (d, labels) (dropping any d past the new wall), normalizing, and inverse iterating on the new
// block from it. The overlap of the carried start with the result is reported: a family that keeps its shape keeps it
// near 1, and a family lost to another level drops it.
//
// THE SEED (`nrSeed`). The non-relativistic ground of two walkers of inertia tan m each, bound by sigma |d| on the even
// d: a Gaussian in d of width l = (sigma tan m)^(-1/3) (the only length of -phi''/tan m + sigma |d| phi), each token in
// the lone walk's particle branch B at k = 0 (string-binding fineBranch), so the pair reader reads it as all particle.
// It is a start for inverse iteration, never a result: the level is what the iteration converges to.
//
// NOTHING MOVES: the coin and the cost write amplitudes on a dock's own line; the stream copies. The floats are
// measurement.

import { lightN } from '@/code/measure/drift-cost-bloch'
import { type Vec } from '@/code/measure/quantum-ladder'
import { fineBranch, meson, pairColumn, pairEmbed, pairMoments, pairReader, parityIndices, type Meson, type Parity } from '@/code/measure/string-binding'

export type PairBand = { dim: number; kl: number; ku: number; start: Int32Array; rows: Int32Array; re: Float64Array; im: Float64Array; leak: number; unitarity: number }

// the beat on one parity block at total momentum K, as sparse columns (string-binding pairReduced, banded)
export function pairBand(m: Meson, K: number, parity: Parity, withCost = true): PairBand {
  const idx = parityIndices(m, parity)
  const at = new Map(idx.map((i, a) => [i, a]))
  const dim = idx.length
  const start = new Int32Array(dim + 1)
  const rows: number[] = []
  const re: number[] = []
  const im: number[] = []
  let kl = 0
  let ku = 0
  let leak = 0
  let unitarity = 0

  idx.forEach((i0, col) => {
    const c = pairColumn(m, K, i0, withCost)
    const acc = new Map<number, [number, number]>()
    let out = 0
    let t = 0

    c.idx.forEach((i, k) => {
      const a = at.get(i)

      if (a === undefined) {
        out += c.re[k]! ** 2 + c.im[k]! ** 2
        return
      }

      const p = acc.get(a) ?? [0, 0]

      acc.set(a, [p[0] + c.re[k]!, p[1] + c.im[k]!])
    })

    start[col] = rows.length
    for (const [a, v] of [...acc.entries()].sort((x, y) => x[0] - y[0])) {
      rows.push(a)
      re.push(v[0])
      im.push(v[1])
      t += v[0] ** 2 + v[1] ** 2
      kl = Math.max(kl, a - col)
      ku = Math.max(ku, col - a)
    }

    leak = Math.max(leak, out)
    unitarity = Math.max(unitarity, Math.abs(t - 1))
  })
  start[dim] = rows.length

  return { dim, kl, ku, start, rows: Int32Array.from(rows), re: Float64Array.from(re), im: Float64Array.from(im), leak, unitarity }
}

export function bandApply(op: PairBand, x: Vec): Vec {
  const y = { re: new Float64Array(op.dim), im: new Float64Array(op.dim) }

  for (let j = 0; j < op.dim; j++) {
    const xr = x.re[j]!
    const xi = x.im[j]!

    if (xr === 0 && xi === 0) continue

    for (let p = op.start[j]!; p < op.start[j + 1]!; p++) {
      const i = op.rows[p]!

      y.re[i] = y.re[i]! + op.re[p]! * xr - op.im[p]! * xi
      y.im[i] = y.im[i]! + op.re[p]! * xi + op.im[p]! * xr
    }
  }

  return y
}

// (U - s) x = b, banded elimination with partial pivoting; b is overwritten by x
export function bandSolve(op: PairBand, sr: number, si: number, bre: Float64Array, bim: Float64Array): void {
  const { dim: n, kl, ku } = op
  const W = 2 * kl + ku + 1
  const ar = new Float64Array(n * W)
  const ai = new Float64Array(n * W)
  const slot = (i: number, j: number): number => i * W + (j - i + kl)

  for (let j = 0; j < n; j++) {
    for (let p = op.start[j]!; p < op.start[j + 1]!; p++) {
      const s = slot(op.rows[p]!, j)

      ar[s] = ar[s]! + op.re[p]!
      ai[s] = ai[s]! + op.im[p]!
    }

    ar[slot(j, j)] = ar[slot(j, j)]! - sr
    ai[slot(j, j)] = ai[slot(j, j)]! - si
  }

  for (let k = 0; k < n; k++) {
    const last = Math.min(n - 1, k + kl)
    const right = Math.min(n - 1, k + kl + ku)
    let p = k
    let best = ar[slot(k, k)]! ** 2 + ai[slot(k, k)]! ** 2

    for (let i = k + 1; i <= last; i++) {
      const g = ar[slot(i, k)]! ** 2 + ai[slot(i, k)]! ** 2

      if (g > best) {
        best = g
        p = i
      }
    }

    if (p !== k) {
      for (let j = k; j <= right; j++) {
        const a = slot(k, j)
        const b = slot(p, j)
        const tr = ar[a]!
        const ti = ai[a]!

        ar[a] = ar[b]!
        ai[a] = ai[b]!
        ar[b] = tr
        ai[b] = ti
      }

      const tr = bre[k]!
      const ti = bim[k]!

      bre[k] = bre[p]!
      bim[k] = bim[p]!
      bre[p] = tr
      bim[p] = ti
    }

    const pr = ar[slot(k, k)]!
    const pi = ai[slot(k, k)]!
    const pp = pr * pr + pi * pi

    for (let i = k + 1; i <= last; i++) {
      const s = slot(i, k)
      const fr = (ar[s]! * pr + ai[s]! * pi) / pp
      const fi = (ai[s]! * pr - ar[s]! * pi) / pp

      if (fr === 0 && fi === 0) continue

      ar[s] = 0
      ai[s] = 0
      for (let j = k + 1; j <= right; j++) {
        const a = slot(k, j)
        const b = slot(i, j)

        ar[b] = ar[b]! - (fr * ar[a]! - fi * ai[a]!)
        ai[b] = ai[b]! - (fr * ai[a]! + fi * ar[a]!)
      }

      bre[i] = bre[i]! - (fr * bre[k]! - fi * bim[k]!)
      bim[i] = bim[i]! - (fr * bim[k]! + fi * bre[k]!)
    }
  }

  for (let k = n - 1; k >= 0; k--) {
    let sr2 = bre[k]!
    let si2 = bim[k]!
    const right = Math.min(n - 1, k + kl + ku)

    for (let j = k + 1; j <= right; j++) {
      const a = slot(k, j)

      sr2 -= ar[a]! * bre[j]! - ai[a]! * bim[j]!
      si2 -= ar[a]! * bim[j]! + ai[a]! * bre[j]!
    }

    const pr = ar[slot(k, k)]!
    const pi = ai[slot(k, k)]!
    const pp = pr * pr + pi * pi

    bre[k] = (sr2 * pr + si2 * pi) / pp
    bim[k] = (si2 * pr - sr2 * pi) / pp
  }
}

const wrapE = (phase: number): number => {
  let e = -phase

  while (e <= -Math.PI) e += 2 * Math.PI
  while (e > Math.PI) e -= 2 * Math.PI

  return e
}

function normalizeVec(x: Vec): void {
  let t = 0

  for (let i = 0; i < x.re.length; i++) t += x.re[i]! ** 2 + x.im[i]! ** 2

  const s = 1 / Math.sqrt(t)

  for (let i = 0; i < x.re.length; i++) {
    x.re[i] = x.re[i]! * s
    x.im[i] = x.im[i]! * s
  }
}

// drift-cost-bloch's inverseIterate on the banded block
export function bandInverse(op: PairBand, start: Vec, rounds = 4): { vector: Vec; energy: number; residual: number } {
  const n = op.dim
  const x = { re: Float64Array.from(start.re), im: Float64Array.from(start.im) }

  normalizeVec(x)

  let residual = Number.POSITIVE_INFINITY
  let lambda: [number, number] = [1, 0]

  for (let round = 0; round < rounds; round++) {
    const ux = bandApply(op, x)
    let lr = 0
    let li = 0

    for (let i = 0; i < n; i++) {
      lr += x.re[i]! * ux.re[i]! + x.im[i]! * ux.im[i]!
      li += x.re[i]! * ux.im[i]! - x.im[i]! * ux.re[i]!
    }

    lambda = [lr, li]

    let r2 = 0

    for (let i = 0; i < n; i++) r2 += (ux.re[i]! - (lr * x.re[i]! - li * x.im[i]!)) ** 2 + (ux.im[i]! - (lr * x.im[i]! + li * x.re[i]!)) ** 2

    residual = Math.sqrt(r2)

    if (residual < 1e-11) break

    const mg = Math.hypot(lr, li)

    bandSolve(op, (lr / mg) * (1 + 1e-10), (li / mg) * (1 + 1e-10), x.re, x.im)
    normalizeVec(x)
  }

  return { vector: x, energy: wrapE(Math.atan2(lambda[1], lambda[0])), residual }
}

// |<u|v>| / (|u| |v|)
export function overlapOf(u: Vec, v: Vec): number {
  let r = 0
  let i = 0
  let a = 0
  let b = 0

  for (let k = 0; k < u.re.length; k++) {
    r += u.re[k]! * v.re[k]! + u.im[k]! * v.im[k]!
    i += u.re[k]! * v.im[k]! - u.im[k]! * v.re[k]!
    a += u.re[k]! ** 2 + u.im[k]! ** 2
    b += v.re[k]! ** 2 + v.im[k]! ** 2
  }

  return Math.hypot(r, i) / Math.sqrt(a * b)
}

// a block vector of one meson moved to another meson's block of the same parity, amplitude by (d, labels)
export function moveBlock(from: Meson, to: Meson, parity: Parity, v: Vec): Vec {
  const src = parityIndices(from, parity)
  const dst = parityIndices(to, parity)
  const where = new Map(dst.map((i, a) => [i, a]))
  const out = { re: new Float64Array(dst.length), im: new Float64Array(dst.length) }

  src.forEach((i, a) => {
    const c = Math.floor(i / from.b.labelCount)
    const r = i % from.b.labelCount
    const d = from.b.configs[c]![1]!

    if (Math.abs(d) > to.box) return

    const j = where.get(to.b.index(to.b.configOf([0, d]), r))

    if (j === undefined) return

    out.re[j] = v.re[a]!
    out.im[j] = v.im[a]!
  })

  return out
}

// the non-relativistic start on the even block (see the header)
export function nrSeed(m: Meson): Vec {
  const idx = parityIndices(m, 0)
  const mass = Math.PI / (3 * m.fine)
  const sigma = Math.PI / lightN(m.D)
  const l = (sigma * Math.tan(mass)) ** (-1 / 3)
  const B = fineBranch(m.fine, 0).B
  const out = { re: new Float64Array(idx.length), im: new Float64Array(idx.length) }

  idx.forEach((i, a) => {
    const c = Math.floor(i / m.b.labelCount)
    const r = i % m.b.labelCount
    const d = m.b.configs[c]![1]!
    const g = Math.exp(-(d * d) / (2 * l * l))
    const u = B[r >> 1]!
    const w = B[r & 1]!

    out.re[a] = g * (u[0] * w[0] - u[1] * w[1])
    out.im[a] = g * (u[0] * w[1] + u[1] * w[0])
  })

  normalizeVec(out)

  return out
}

export type BandLevel = {
  D: number
  box: number
  fine: number
  energy: number
  unwrapped: number
  even: number
  kinetic: number
  mean: number
  tailN: number
  contact: number
  residual: number
  block: Vec
}

// the reading of an even-block vector at K = 0 (string-binding pairLevels' reading of one level)
export function readBand(m: Meson, block: Vec, energy: number, residual: number, withCost = true): BandLevel {
  const vector = pairEmbed(m, 0, block)
  const r = pairReader(m, 2 * m.box + 6)(vector)
  const mo = pairMoments(m, vector)
  const sigma = withCost ? Math.PI / lightN(m.D) : 0
  const reference = r.kinetic + sigma * mo.mean
  const unwrapped = energy + 2 * Math.PI * Math.round((reference - energy) / (2 * Math.PI))

  return { D: m.D, box: m.box, fine: m.fine, energy, unwrapped, even: r.even, kinetic: r.kinetic, ...mo, residual, block }
}

// the level at (D, box) from a start on that block
export function settle(m: Meson, start: Vec, rounds = 12, withCost = true): BandLevel {
  const it = bandInverse(pairBand(m, 0, 0, withCost), start, rounds)

  return readBand(m, it.vector, it.energy, it.residual, withCost)
}

// a level carried from its meson to (D, box) at the same fine (see the header); `overlap` is the carried start's
// overlap with the level it settles on
export function carry(level: BandLevel, D: number, box: number, rounds = 12): { level: BandLevel; overlap: number } {
  const from = meson(level.D, level.box, level.fine)
  const to = meson(D, box, level.fine)
  const startVec = moveBlock(from, to, 0, level.block)

  normalizeVec(startVec)

  const next = settle(to, startVec, rounds)

  return { level: next, overlap: overlapOf(startVec, next.block) }
}

export type BandTrack = { K: number; energy: number; overlap: number; residual: number; vector: Vec }

// the even-block level followed from K = 0 through `ks` (increasing) by inverse iteration in steps of at most `step`
// (string-binding followPair, banded); energy unwrapped by continuity, `overlap` the least consecutive one so far
export function followBand(m: Meson, start: BandLevel, ks: readonly number[], step: number, rounds = 6): BandTrack[] {
  let prev: Vec = { re: Float64Array.from(start.block.re), im: Float64Array.from(start.block.im) }
  let K = 0
  let energy = start.unwrapped
  let least = 1
  let residual = 0
  const out: BandTrack[] = []

  for (const target of ks) {
    while (K < target - 1e-15) {
      const next = Math.min(target, K + step)
      const it = bandInverse(pairBand(m, next, 0), prev, rounds)

      least = Math.min(least, overlapOf(prev, it.vector))
      residual = Math.max(residual, it.residual)
      energy = it.energy + 2 * Math.PI * Math.round((energy - it.energy) / (2 * Math.PI))
      prev = it.vector
      K = next
    }

    out.push({ K, energy, overlap: least, residual, vector: { re: Float64Array.from(prev.re), im: Float64Array.from(prev.im) } })
  }

  return out
}

// E''(K) at a band point by a second difference of eigenvalues (string-binding pairCurvature, banded)
export function bandCurvature(m: Meson, at: BandTrack, d: number, rounds = 6): number {
  const near = (K: number): number => {
    const it = bandInverse(pairBand(m, K, 0), at.vector, rounds)

    return it.energy + 2 * Math.PI * Math.round((at.energy - it.energy) / (2 * Math.PI))
  }

  return (near(at.K + d) + near(at.K - d) - 2 * at.energy) / (d * d)
}

// the lone walk's largest group velocity at the fine coin: max over k of dE_B/dk, by a symmetric difference on a grid
export function loneTopVelocity(fine: number, grid = 4096): number {
  let top = 0
  const h = Math.PI / grid

  for (let s = 1; s < grid; s++) {
    const k = (Math.PI * s) / grid
    const v = (fineBranch(fine, k + h).energy - fineBranch(fine, k - h).energy) / (2 * h)

    top = Math.max(top, v)
  }

  return top
}
