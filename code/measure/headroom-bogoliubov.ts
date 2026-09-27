// Particle production on a forming headroom horizon (test/experiment/gravity/forming-headroom-horizon): the linear
// shadow of the headroom light (code/rule/depth-span-light makeHeadroomSpanMedium) on the radial chain, its
// time-dependent rooms, and the Bogoliubov coefficients read by exact projection. Real numbers live here only.
//
// THE SHADOW. The headroom light runs, exactly up to its carried fraction, the leapfrog
//   A <- A - K (C^T U),      U <- U + G (C W A),      K = diag(k_l),  G = diag(n_P p k_P / M)
// on A2 = R A + r (R = q0 C, M = R^2): tmp/hawk-probe2 found the float map equal to the integer rule's shadow
// (A2 + k_l C^T f_t, f the carried fraction from the lags) to 1.7e-13 over 200 beats on a room gradient. Written on
// the link space with y = C^T U it is
//   A_(t+1) = A_t - K y_t,     y_(t+1) = y_t + L A_(t+1),     L = C^T G C W
// and both steps are shears that keep the form Omega((A, y), (A', y')) = sum_l w_l (A_l y'_l - y_l A'_l) for ANY
// rates, so it holds through every quench of the growth: the KG product the Bogoliubov coefficients are read in.
// The U the rule holds in ker(C^T) never reaches A and pairs with nothing under Omega.
//
// THE RADIAL CHAIN. On the L x 2 x 2 line with rooms that read x only, the transverse-uniform states (all four
// copies of a link equal) are invariant (tmp/hawk-probe2: spread 2e-13 after 200 beats), so the chain is 9 links a
// dock: the row of link (x, h) on the (0, 0) copy, its column summed over the four copies. W^(1/2) L W^(-1/2) is
// symmetric there (probe3: asymmetry 0), and couplings reach one dock. The line's triangles repeat with period 2 in
// x, so the flat chain is a Bloch problem on a 2-dock cell of 18 links.
//
// THE PROJECTION. On the flat chain (every room C) a = W^(1/2) A runs a_(t+1) - 2 a_t + a_(t-1) = -Q a_t, Q = C W^(1/2)
// L W^(-1/2), per Bloch k an 18 x 18 Hermitian Q(k) with eigenpairs (lambda_j, phi_j), cos omega_j = 1 - lambda_j / 2.
// A state (A_0, y_0) gives a_0 and a_1 = W^(1/2) (A_0 - C y_0); per mode c_0 = phi^dagger a_0(k), c_1 = phi^dagger
// a_1(k), and the solution c_0 = alpha + beta, c_1 = alpha e^(-i omega) + beta e^(i omega) splits it into positive
// (alpha) and negative (beta) frequency with KG norms +(2 / C) sin(omega) |alpha|^2 and -(2 / C) sin(omega) |beta|^2
// (per cell count). No sampling: a projection. Zero modes (lambda = 0, the gauge) are null under Omega and skipped.
//
// DETERMINISM: nothing is drawn. NOTHING MOVES: each value takes its new value by the rule.

import { makeHeadroomSpanMedium, type SpanMedium } from '@/code/rule/depth-span-light'
import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'

const TILE = 16

// ---------------------------------------------------------------------------------------------------------
// the chain

export type UniformChain = {
  readonly length: number
  readonly base: number
  readonly resolution: number
  readonly links: number
  readonly weight: Float64Array
  // per link: its dock and its neighbor's dock (x)
  readonly linkFrom: Int32Array
  readonly linkTo: Int32Array
  // the triangles touching the (0, 0) copy: n_P p / M, and the six dock x's whose smallest room they read
  readonly triScale: Float64Array
  readonly triDocks: Int32Array
  // L = C^T G C W as rows on the (0, 0) copy: CSR, each entry a sum of (triangle, coefficient) contributions
  readonly rowStart: Int32Array
  readonly col: Int32Array
  readonly value: Float64Array
  readonly partStart: Int32Array
  readonly partTri: Int32Array
  readonly partCoef: Float64Array
  // the rooms now, per dock, and what they set
  readonly room: Int32Array
  readonly linkRate: Float64Array
  readonly triRate: Float64Array
  // per dock: the CSR rows whose entries read a triangle touching it (for a local refresh)
  readonly dockTris: Int32Array[]
}

// the chain of `length` docks (even) at resolution D0 and register C, every room C: its triangles read off a 16 x 2 x 2
// line of the headroom medium and tiled with period 2
export function makeUniformChain(length: number, resolution: number, base: number): UniformChain {
  if (length % 2 !== 0 || length < TILE) throw new Error('makeUniformChain: an even length of at least 16')

  const m: SpanMedium = makeHeadroomSpanMedium([TILE, 2, 2], resolution, base, () => base)
  const g = m.geometry
  const big = m.square[0]!
  const xOf = (l: number): number => Math.floor(l / 9) % TILE
  const copyOf = (l: number): number => Math.floor(Math.floor(l / 9) / TILE)
  const wrap = (d: number): number => ((((d + TILE / 2) % TILE) + TILE) % TILE) - TILE / 2
  const links = 9 * length
  const weight = Float64Array.from({ length: links }, (_, i) => g.weight[i % 9]!)
  const linkFrom = Int32Array.from({ length: links }, (_, i) => Math.floor(i / 9))
  const linkTo = Int32Array.from({ length: links }, (_, i) => {
    // huskNeighbour is a dock index: dock 0's link h reaches dock huskNeighbour[h], whose x is that mod the tile
    const d = wrap((g.huskNeighbour[i % 9]! % TILE) - 0)

    return (((Math.floor(i / 9) + d) % length) + length) % length
  })

  // the template: triangles of the tile touching the (0, 0) copy, anchored at the smallest x of their (0, 0) links
  // when that x is 0 or 1, every x taken relative to it
  type Template = { parity: number; scale: number; docks: number[]; parts: { row: number; rowH: number; col: number; colH: number; coef: number }[] }
  const templates: Template[] = []

  for (let p = 0; p < g.triangles; p++) {
    const ls = [0, 1, 2].map(j => g.triLinks[p * 3 + j]!)
    const rows = ls.filter(l => copyOf(l) === 0)

    if (rows.length === 0) continue

    // the anchor is the least row x, read across the tile's seam (offsets from the first row wrapped to -8 .. 7), so a
    // triangle astride the seam is anchored at 15, not 0; one anchor per repeat: the tile's x 0 and 1
    const first = xOf(rows[0]!)
    const anchor = (((first + Math.min(...rows.map(l => wrap(xOf(l) - first)))) % TILE) + TILE) % TILE

    if (anchor > 1) continue

    const rel = (x: number): number => wrap(x - anchor)
    const docks: number[] = []

    for (const l of ls) {
      docks.push(rel(Math.floor(l / 9) % TILE), rel(g.huskNeighbour[l]! % TILE))
    }

    const parts: Template['parts'] = []

    for (let a = 0; a < 3; a++) {
      const la = ls[a]!

      if (copyOf(la) !== 0) continue
      for (let b = 0; b < 3; b++) {
        const lb = ls[b]!

        parts.push({ row: rel(xOf(la)), rowH: la % 9, col: rel(xOf(lb)), colH: lb % 9, coef: g.triSigns[p * 3 + a]! * g.triSigns[p * 3 + b]! * g.weight[lb % 9]! })
      }
    }

    templates.push({ parity: anchor, scale: (g.multiplicity[p]! * m.p) / big, docks, parts })
  }

  const tris: { scale: number; docks: number[]; parts: { row: number; col: number; coef: number }[] }[] = []
  const at = (x: number, h: number): number => 9 * ((((x % length) + length) % length)) + h

  for (let x = 0; x < length; x++) {
    for (const t of templates) {
      if (t.parity !== x % 2) continue
      tris.push({
        scale: t.scale,
        docks: t.docks.map(d => (((x + d) % length) + length) % length),
        parts: t.parts.map(q => ({ row: at(x + q.row, q.rowH), col: at(x + q.col, q.colH), coef: q.coef })),
      })
    }
  }

  const triScale = Float64Array.from(tris, t => t.scale)
  const triDocks = new Int32Array(tris.length * 6)

  tris.forEach((t, i) => t.docks.forEach((d, j) => (triDocks[i * 6 + j] = d)))

  // CSR: group parts by row, then by column
  const byRow: Map<number, { tri: number; coef: number }[]>[] = Array.from({ length: links }, () => new Map())

  tris.forEach((t, i) => {
    for (const q of t.parts) {
      const row = byRow[q.row]!
      const list = row.get(q.col) ?? []

      list.push({ tri: i, coef: q.coef })
      row.set(q.col, list)
    }
  })

  const rowStart = new Int32Array(links + 1)
  const cols: number[] = []
  const partStartList: number[] = []
  const partTri: number[] = []
  const partCoef: number[] = []

  for (let i = 0; i < links; i++) {
    const entries = [...byRow[i]!.entries()].sort((a, b) => a[0] - b[0])

    for (const [c, list] of entries) {
      cols.push(c)
      partStartList.push(partTri.length)
      for (const q of list) {
        partTri.push(q.tri)
        partCoef.push(q.coef)
      }
    }

    rowStart[i + 1] = cols.length
  }

  partStartList.push(partTri.length)

  const dockTris: number[][] = Array.from({ length }, () => [])

  tris.forEach((t, i) => new Set(t.docks).forEach(d => dockTris[d]!.push(i)))

  const chain: UniformChain = {
    length,
    base,
    resolution,
    links,
    weight,
    linkFrom,
    linkTo,
    triScale,
    triDocks,
    rowStart,
    col: Int32Array.from(cols),
    value: new Float64Array(cols.length),
    partStart: Int32Array.from(partStartList),
    partTri: Int32Array.from(partTri),
    partCoef: Float64Array.from(partCoef),
    room: new Int32Array(length).fill(base),
    linkRate: new Float64Array(links),
    triRate: new Float64Array(tris.length),
    dockTris: dockTris.map(a => Int32Array.from(a)),
  }

  setChainRooms(chain, () => base, true)

  return chain
}

// the rooms of every dock (a whole count 0 .. C); only what changed is recomputed unless `all`. Returns how many
// docks changed
export function setChainRooms(chain: UniformChain, roomAt: (x: number) => number, all = false): number {
  const changed: number[] = []

  for (let x = 0; x < chain.length; x++) {
    const k = roomAt(x)

    if (!Number.isInteger(k) || k < 0 || k > chain.base) throw new Error(`setChainRooms: room ${k} outside 0 .. ${chain.base}`)
    if (all || k !== chain.room[x]) {
      chain.room[x] = k
      changed.push(x)
    }
  }

  if (changed.length === 0) return 0

  const tris = new Set<number>()
  const links = new Set<number>()

  for (const x of changed) {
    for (const t of chain.dockTris[x]!) tris.add(t)
    for (const d of [x - 1, x, x + 1]) {
      const xx = ((d % chain.length) + chain.length) % chain.length

      for (let h = 0; h < 9; h++) links.add(9 * xx + h)
    }
  }

  for (const i of links) chain.linkRate[i] = Math.min(chain.room[chain.linkFrom[i]!]!, chain.room[chain.linkTo[i]!]!)

  for (const t of tris) {
    let k = chain.base

    for (let j = t * 6; j < t * 6 + 6; j++) k = Math.min(k, chain.room[chain.triDocks[j]!]!)
    chain.triRate[t] = chain.triScale[t]! * k
  }

  // every row within two docks of a change reads only triangles near it
  const rows = new Set<number>()

  for (const x of changed) {
    for (let d = -2; d <= 2; d++) {
      const xx = (((x + d) % chain.length) + chain.length) % chain.length

      for (let h = 0; h < 9; h++) rows.add(9 * xx + h)
    }
  }

  for (const i of all ? Array.from({ length: chain.links }, (_, j) => j) : rows) {
    for (let e = chain.rowStart[i]!; e < chain.rowStart[i + 1]!; e++) {
      let v = 0

      for (let q = chain.partStart[e]!; q < chain.partStart[e + 1]!; q++) v += chain.partCoef[q]! * chain.triRate[chain.partTri[q]!]!
      chain.value[e] = v
    }
  }

  return changed.length
}

// ---------------------------------------------------------------------------------------------------------
// batched states: `width` real columns, link i column b at i * width + b

export type ChainBatch = { readonly width: number; readonly a: Float64Array; readonly y: Float64Array }

export const makeBatch = (chain: UniformChain, width: number): ChainBatch => ({ width, a: new Float64Array(chain.links * width), y: new Float64Array(chain.links * width) })

// one beat forward: A <- A - K y, then y <- y + L A
export function chainBeat(chain: UniformChain, s: ChainBatch): void {
  const w = s.width
  const { a, y } = s

  for (let i = 0; i < chain.links; i++) {
    const k = chain.linkRate[i]!

    if (k === 0) continue
    for (let b = i * w; b < i * w + w; b++) a[b] = a[b]! - k * y[b]!
  }

  for (let i = 0; i < chain.links; i++) {
    const o = i * w

    for (let e = chain.rowStart[i]!; e < chain.rowStart[i + 1]!; e++) {
      const v = chain.value[e]!

      if (v === 0) continue
      const c = chain.col[e]! * w

      for (let b = 0; b < w; b++) y[o + b] = y[o + b]! + v * a[c + b]!
    }
  }
}

// the inverse beat: y <- y - L A, then A <- A + K y
export function chainBeatBack(chain: UniformChain, s: ChainBatch): void {
  const w = s.width
  const { a, y } = s

  for (let i = 0; i < chain.links; i++) {
    const o = i * w

    for (let e = chain.rowStart[i]!; e < chain.rowStart[i + 1]!; e++) {
      const v = chain.value[e]!

      if (v === 0) continue
      const c = chain.col[e]! * w

      for (let b = 0; b < w; b++) y[o + b] = y[o + b]! - v * a[c + b]!
    }
  }

  for (let i = 0; i < chain.links; i++) {
    const k = chain.linkRate[i]!

    if (k === 0) continue
    for (let b = i * w; b < i * w + w; b++) a[b] = a[b]! + k * y[b]!
  }
}

// the KG product of the complex states held in columns (re, im) and (re', im'): N = -i Omega(conj v, v'), so
// N(v, v) = 2 sum_l w_l Im(conj(A_l) y_l)
export function kgNorm(chain: UniformChain, s: ChainBatch, re: number, im: number): number {
  const w = s.width
  let n = 0

  for (let i = 0; i < chain.links; i++) {
    const ar = s.a[i * w + re]!
    const ai = s.a[i * w + im]!
    const yr = s.y[i * w + re]!
    const yi = s.y[i * w + im]!

    n += chain.weight[i]! * (ar * yi - ai * yr)
  }

  return 2 * n
}

// ---------------------------------------------------------------------------------------------------------
// the flat modes

export type FlatModes = {
  readonly cells: number
  // per cell wave number k_n = 2 pi n / cells: 18 values (lambda) and 18 x 18 vectors, [n][a * 18 + j]
  readonly lambda: Float64Array[]
  readonly re: Float64Array[]
  readonly im: Float64Array[]
  // the light band's top (the acoustic pair's largest frequency) and the zero tolerance
  readonly top: number
  readonly zero: number
}

const CELL = 18

// the flat chain's Bloch modes: Q(k) = C W^(1/2) L W^(-1/2) summed over cell shifts, diagonalized per k. The chain
// must be flat (every room C) when called
export function flatModes(chain: UniformChain): FlatModes {
  const cells = chain.length / 2
  const n = chain.links
  const lambda: Float64Array[] = []
  const re: Float64Array[] = []
  const im: Float64Array[] = []
  const entries: { i: number; j: number; shift: number; v: number }[] = []

  for (let i = 0; i < CELL; i++) {
    for (let e = chain.rowStart[i]!; e < chain.rowStart[i + 1]!; e++) {
      const c = chain.col[e]!
      const xc = Math.floor(c / 9)
      let dx = xc - Math.floor(i / 9)

      if (dx > chain.length / 2) dx -= chain.length
      if (dx < -chain.length / 2) dx += chain.length

      const target = Math.floor(i / 9) + dx
      const shift = Math.floor(target / 2)
      const j = (((target % 2) + 2) % 2) * 9 + (c % 9)

      entries.push({ i, j, shift, v: (chain.base * Math.sqrt(chain.weight[i]!) * chain.value[e]!) / Math.sqrt(chain.weight[c]!) })
    }
  }

  void n
  let top = 0
  let scale = 0

  for (let q = 0; q < cells; q++) {
    const k = (2 * Math.PI * q) / cells
    const mat = makeComplexMatrix({ rows: CELL, cols: CELL })

    for (const e of entries) {
      mat.re[e.i * CELL + e.j] = mat.re[e.i * CELL + e.j]! + e.v * Math.cos(k * e.shift)
      mat.im[e.i * CELL + e.j] = mat.im[e.i * CELL + e.j]! + e.v * Math.sin(k * e.shift)
    }

    const eig = eigHermitian({ matrix: mat })

    lambda.push(Float64Array.from(eig.values))
    re.push(Float64Array.from(eig.vectorsRe))
    im.push(Float64Array.from(eig.vectorsIm))
    scale = Math.max(scale, ...Array.from(eig.values, Math.abs))
  }

  const zero = 1e-10 * scale

  // the acoustic pair: the two smallest nonzero values at each k, whose largest frequency is the light's top
  for (let q = 1; q < cells; q++) {
    const live = Array.from(lambda[q]!).filter(v => v > zero)

    top = Math.max(top, Math.acos(1 - live[1]! / 2))
  }

  // the folded partner at k = 0 (extended k = pi per dock) is the band's top: the third and fourth nonzero at k near 0
  const near = Array.from(lambda[0]!).filter(v => v > zero)

  top = Math.max(top, Math.acos(1 - near[1]! / 2))

  return { cells, lambda, re, im, top, zero }
}

// ---------------------------------------------------------------------------------------------------------
// FFT (radix 2, in place), sign -1 forward

export function fft(re: Float64Array, im: Float64Array, inverse: boolean): void {
  const n = re.length

  if ((n & (n - 1)) !== 0) throw new Error('fft: the length must be a power of 2')

  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1

    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      ;[re[i], re[j]] = [re[j]!, re[i]!]
      ;[im[i], im[j]] = [im[j]!, im[i]!]
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inverse ? 2 : -2) * Math.PI) / len
    const wr = Math.cos(ang)
    const wi = Math.sin(ang)

    for (let i = 0; i < n; i += len) {
      let cr = 1
      let ci = 0

      for (let j = 0; j < len / 2; j++) {
        const ur = re[i + j]!
        const ui = im[i + j]!
        const vr = re[i + j + len / 2]! * cr - im[i + j + len / 2]! * ci
        const vi = re[i + j + len / 2]! * ci + im[i + j + len / 2]! * cr

        re[i + j] = ur + vr
        im[i + j] = ui + vi
        re[i + j + len / 2] = ur - vr
        im[i + j + len / 2] = ui - vi

        const t = cr * wr - ci * wi

        ci = cr * wi + ci * wr
        cr = t
      }
    }
  }

  if (inverse) {
    for (let i = 0; i < n; i++) {
      re[i] = re[i]! / n
      im[i] = im[i]! / n
    }
  }
}

// ---------------------------------------------------------------------------------------------------------
// projection and construction

// a_0 and a_1 of a complex state in columns (re, im), transformed per component over cells: [component][cell]
function blochOf(chain: UniformChain, s: ChainBatch, re: number, im: number): { r0: Float64Array[]; i0: Float64Array[]; r1: Float64Array[]; i1: Float64Array[] } {
  const cells = chain.length / 2
  const w = s.width
  const make = (): Float64Array[] => Array.from({ length: CELL }, () => new Float64Array(cells))
  const r0 = make()
  const i0 = make()
  const r1 = make()
  const i1 = make()

  for (let l = 0; l < chain.links; l++) {
    const x = Math.floor(l / 9)
    const comp = (x % 2) * 9 + (l % 9)
    const cell = x >> 1
    const sw = Math.sqrt(chain.weight[l]!)
    const ar = s.a[l * w + re]!
    const ai = s.a[l * w + im]!

    r0[comp]![cell] = sw * ar
    i0[comp]![cell] = sw * ai
    r1[comp]![cell] = sw * (ar - chain.base * s.y[l * w + re]!)
    i1[comp]![cell] = sw * (ai - chain.base * s.y[l * w + im]!)
  }

  for (let c = 0; c < CELL; c++) {
    fft(r0[c]!, i0[c]!, false)
    fft(r1[c]!, i1[c]!, false)
  }

  return { r0, i0, r1, i1 }
}

export type Split = {
  // the KG norms of the positive and negative frequency parts (both >= 0), the norm skipped in zero modes (a-space
  // weight, which Omega does not see), and the negative part's norm by band and its mean frequency
  readonly positive: number
  readonly negative: number
  readonly zeroWeight: number
  readonly negativeByBand: number[]
  readonly negativeMeanOmega: number
  readonly positiveMeanOmega: number
}

// split a complex state (columns re, im) of the FLAT chain into positive and negative frequency, mode by mode
export function splitFlat(chain: UniformChain, modes: FlatModes, s: ChainBatch, re: number, im: number): Split {
  const cells = modes.cells
  const b = blochOf(chain, s, re, im)
  let positive = 0
  let negative = 0
  let zeroWeight = 0
  let negOmega = 0
  let posOmega = 0
  const negativeByBand = new Array<number>(CELL).fill(0)

  for (let q = 0; q < cells; q++) {
    const lam = modes.lambda[q]!
    const vr = modes.re[q]!
    const vi = modes.im[q]!

    for (let j = 0; j < CELL; j++) {
      // c = phi^dagger a
      let c0r = 0
      let c0i = 0
      let c1r = 0
      let c1i = 0

      for (let a = 0; a < CELL; a++) {
        const pr = vr[a * CELL + j]!
        const pi = vi[a * CELL + j]!
        const xr = b.r0[a]![q]!
        const xi = b.i0[a]![q]!
        const zr = b.r1[a]![q]!
        const zi = b.i1[a]![q]!

        c0r += pr * xr + pi * xi
        c0i += pr * xi - pi * xr
        c1r += pr * zr + pi * zi
        c1i += pr * zi - pi * zr
      }

      if (lam[j]! <= modes.zero) {
        zeroWeight += (c0r * c0r + c0i * c0i) / cells
        continue
      }

      const om = Math.acos(1 - lam[j]! / 2)
      const sn = Math.sin(om)
      const cs = Math.cos(om)
      // alpha = (c0 e^(i om) - c1) / (2 i sin om)
      const nr = c0r * cs - c0i * sn - c1r
      const ni = c0r * sn + c0i * cs - c1i
      const ar = ni / (2 * sn)
      const ai = -nr / (2 * sn)
      const br = c0r - ar
      const bi = c0i - ai
      const kp = ((2 / chain.base) * sn * (ar * ar + ai * ai)) / cells
      const kn = ((2 / chain.base) * sn * (br * br + bi * bi)) / cells

      positive += kp
      negative += kn
      negativeByBand[j] = negativeByBand[j]! + kn
      negOmega += kn * om
      posOmega += kp * om
    }
  }

  return { positive, negative, zeroWeight, negativeByBand, negativeMeanOmega: negOmega / negative, positiveMeanOmega: posOmega / positive }
}

// THE OUT PACKET: a positive-frequency, right-moving packet of the flat chain's acoustic pair, frequency weight
// exp(-(omega - omega0)^2 / (2 sigma^2)), centered at dock `center`, its polarization the plane packet's (links 1, 7,
// 8, 3, 4 at 2, 1, 1, 1, -1: code/measure/headroom-horizon smoothPacket) projected on the pair; written into columns
// (re, im) of the batch and normalized to KG norm 1. Only k in (0, pi) of the cell zone enters (right-moving)
export function outPacket(chain: UniformChain, modes: FlatModes, s: ChainBatch, re: number, im: number, omega0: number, sigma: number, center: number): void {
  const cells = modes.cells
  const pattern = [0, 2, 0, 1, -1, 0, 0, 1, 1]
  const make = (): Float64Array[] => Array.from({ length: CELL }, () => new Float64Array(cells))
  const r0 = make()
  const i0 = make()
  const r1 = make()
  const i1 = make()
  const nc = center / 2

  for (let q = 1; q < cells / 2; q++) {
    const k = (2 * Math.PI * q) / cells
    const lam = modes.lambda[q]!
    const live = Array.from(lam, (v, j) => ({ v, j })).filter(e => e.v > modes.zero)
    const pair = live.slice(0, 2)
    // seed s(k): the pattern on both docks of the cell, the second a half cell on
    const sr = new Float64Array(CELL)
    const si = new Float64Array(CELL)

    for (let h = 0; h < 9; h++) {
      for (let par = 0; par < 2; par++) {
        sr[par * 9 + h] = Math.sqrt(chain.weight[h]!) * pattern[h]! * Math.cos((k * par) / 2)
        si[par * 9 + h] = Math.sqrt(chain.weight[h]!) * pattern[h]! * Math.sin((k * par) / 2)
      }
    }

    for (const { v, j } of pair) {
      const om = Math.acos(1 - v / 2)
      const g = Math.exp(-((om - omega0) ** 2) / (2 * sigma * sigma))

      if (g < 1e-300) continue
      const vr = modes.re[q]!
      const vi = modes.im[q]!
      // overlap phi^dagger s, then the center phase e^(-i k nc)
      let or = 0
      let oi = 0

      for (let a = 0; a < CELL; a++) {
        const pr = vr[a * CELL + j]!
        const pi = vi[a * CELL + j]!

        or += pr * sr[a]! + pi * si[a]!
        oi += pr * si[a]! - pi * sr[a]!
      }

      const ph = -k * nc
      const cr = g * (or * Math.cos(ph) - oi * Math.sin(ph))
      const ci = g * (or * Math.sin(ph) + oi * Math.cos(ph))
      // a_1 coefficient: alpha e^(-i om)
      const dr = cr * Math.cos(om) + ci * Math.sin(om)
      const di = ci * Math.cos(om) - cr * Math.sin(om)

      for (let a = 0; a < CELL; a++) {
        const pr = vr[a * CELL + j]!
        const pi = vi[a * CELL + j]!

        r0[a]![q] = r0[a]![q]! + pr * cr - pi * ci
        i0[a]![q] = i0[a]![q]! + pr * ci + pi * cr
        r1[a]![q] = r1[a]![q]! + pr * dr - pi * di
        i1[a]![q] = i1[a]![q]! + pr * di + pi * dr
      }
    }
  }

  for (let c = 0; c < CELL; c++) {
    fft(r0[c]!, i0[c]!, true)
    fft(r1[c]!, i1[c]!, true)
  }

  const w = s.width

  for (let l = 0; l < chain.links; l++) {
    const x = Math.floor(l / 9)
    const comp = (x % 2) * 9 + (l % 9)
    const cell = x >> 1
    const sw = Math.sqrt(chain.weight[l]!)
    const ar = r0[comp]![cell]! / sw
    const ai = i0[comp]![cell]! / sw

    s.a[l * w + re] = ar
    s.a[l * w + im] = ai
    s.y[l * w + re] = (ar - r1[comp]![cell]! / sw) / chain.base
    s.y[l * w + im] = (ai - i1[comp]![cell]! / sw) / chain.base
  }

  const norm = kgNorm(chain, s, re, im)

  if (!(norm > 0)) throw new Error(`outPacket: KG norm ${norm} is not positive`)

  const f = 1 / Math.sqrt(norm)

  for (let l = 0; l < chain.links; l++) {
    for (const c of [re, im]) {
      s.a[l * w + c] = s.a[l * w + c]! * f
      s.y[l * w + c] = s.y[l * w + c]! * f
    }
  }
}

// the weight (sum over links of w (|A|^2 + |C y|^2)) of columns (re, im) on docks where `inside` holds, over the whole
export function weightShare(chain: UniformChain, s: ChainBatch, re: number, im: number, inside: (x: number) => boolean): number {
  const w = s.width
  let part = 0
  let all = 0

  for (let l = 0; l < chain.links; l++) {
    const v = chain.weight[l]! * (s.a[l * w + re]! ** 2 + s.a[l * w + im]! ** 2 + (chain.base * s.y[l * w + re]!) ** 2 + (chain.base * s.y[l * w + im]!) ** 2)

    all += v
    if (inside(Math.floor(l / 9))) part += v
  }

  return part / all
}

// the weight-weighted mean dock of columns (re, im)
export function weightCenter(chain: UniformChain, s: ChainBatch, re: number, im: number): number {
  const w = s.width
  let sum = 0
  let all = 0

  for (let l = 0; l < chain.links; l++) {
    const v = chain.weight[l]! * (s.a[l * w + re]! ** 2 + s.a[l * w + im]! ** 2)

    all += v
    sum += v * Math.floor(l / 9)
  }

  return sum / all
}

// ---------------------------------------------------------------------------------------------------------
// the full L x 2 x 2 float shadow (the machinery's check on the chain) and the integer rule's shadow

// one beat of the float shadow on the whole medium: A <- A - K C^T U, U <- U + G C W A (A in A2 units)
export function fullShadowBeat(m: SpanMedium, A: Float64Array, U: Float64Array): void {
  const g = m.geometry
  const rate = m.rate

  if (!rate) throw new Error('fullShadowBeat: not a headroom medium')

  for (let p = 0; p < g.triangles; p++) {
    const u = U[p]!

    if (u === 0) continue
    for (let j = p * 3; j < p * 3 + 3; j++) {
      const l = g.triLinks[j]!

      A[l] = A[l]! - rate.link[l]! * g.triSigns[j]! * u
    }
  }

  for (let p = 0; p < g.triangles; p++) {
    let f = 0

    for (let j = p * 3; j < p * 3 + 3; j++) {
      const l = g.triLinks[j]!

      f += g.triSigns[j]! * g.weight[l % 9]! * A[l]!
    }

    U[p] = U[p]! + (g.multiplicity[p]! * m.p * rate.tri[p]! * f) / m.square[p]!
  }
}

// y = C^T U on every link
export function curlOfPotential(m: SpanMedium, U: ArrayLike<number>): Float64Array {
  const g = m.geometry
  const out = new Float64Array(g.huskLinks)

  for (let p = 0; p < g.triangles; p++) for (let j = p * 3; j < p * 3 + 3; j++) out[g.triLinks[j]!] = out[g.triLinks[j]!]! + g.triSigns[j]! * U[p]!

  return out
}

// the integer rule's shadow on every link, A2 + k_l (C^T f_t)_l, f_t the carried fraction held in the lags
// (sum_i lag_i / M^i): the value the float shadow runs (tmp/hawk-probe2)
export function ruleShadow(m: SpanMedium, s: { angle: Int32Array; remainder: Int32Array; lag: Int32Array; upperLag: Int32Array[] }): Float64Array {
  const g = m.geometry
  const rate = m.rate

  if (!rate) throw new Error('ruleShadow: not a headroom medium')

  const f = new Float64Array(g.triangles)

  for (let p = 0; p < g.triangles; p++) {
    const big = m.square[p]!
    let scale = big
    let v = s.lag[p]! / big

    for (const up of s.upperLag) {
      scale *= big
      v += up[p]! / scale
    }

    f[p] = v
  }

  const ct = curlOfPotential(m, f)

  return Float64Array.from({ length: g.huskLinks }, (_, l) => m.span[l]! * s.angle[l]! + s.remainder[l]! + rate.link[l]! * ct[l]!)
}

// ---------------------------------------------------------------------------------------------------------
// the integer rule under changing rooms

// set the rooms of a headroom medium in place (every dock's room read at its x), as makeHeadroomSpanMedium sets them:
// a link reads the smaller room of its two docks, a triangle the smallest of its links' docks
export function setMediumRooms(m: SpanMedium, roomAtX: (x: number) => number): void {
  const rate = m.rate

  if (!rate) throw new Error('setMediumRooms: not a headroom medium')

  const g = m.geometry
  const [sx] = m.sides
  const dock = new Int32Array(g.huskDocks)

  for (let y = 0; y < g.huskDocks; y++) {
    const k = roomAtX(y % sx)

    if (!Number.isInteger(k) || k < 0 || k > rate.base) throw new Error(`setMediumRooms: room ${k} outside 0 .. ${rate.base}`)
    dock[y] = k
  }

  for (let l = 0; l < g.huskLinks; l++) rate.link[l] = Math.min(dock[Math.floor(l / 9)]!, dock[g.huskNeighbour[l]!]!)

  for (let t = 0; t < g.triangles; t++) {
    let k = rate.base

    for (let j = t * 3; j < t * 3 + 3; j++) {
      const l = g.triLinks[j]!

      k = Math.min(k, dock[Math.floor(l / 9)]!, dock[g.huskNeighbour[l]!]!)
    }

    rate.tri[t] = k
  }
}
