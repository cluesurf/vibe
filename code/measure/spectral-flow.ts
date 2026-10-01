// Measurement for the spectral-flow test of the light's split (test/experiment/gauge/spectral-flow): the plaquette
// ladder's quantum light followed from the identity. Both exponents are scaled together, U(t) = F(t f) D(t s), and
// every level's phase is carried continuously from U(0) = 1, so its whole turns are counted along the path rather
// than read from a harmonic energy (code/measure/quantum-ladder `unwrapped`, the reading E-FRC-0270 traced its
// jitter to).
//
// THE BLOCKS. The light's beat commutes with the translation T (square p to p + 1), the charge mirror C (every loop
// value m to -m) and, on three or more squares, the reflection P (square p to square -p). A block is one momentum q
// and one character of {C} or {C, P} (P acts inside a sector only when q = -q mod L; otherwise it maps sector q onto
// sector L - q, whose lift is then an exact copy). Levels of different blocks cross freely, so each block is followed
// on its own and no crossing between blocks needs a matching rule.
//
// THE BLOCK BEAT, exactly. N_D = sum over links of bal(e)^2 is diagonal in the flux coordinates and N_F = sum over
// squares of bal(B)^2 in the angle coordinates, both invariant under T, C and P, so each is constant on a group orbit
// and diagonal on a block basis built from one orbit. With V the per-digit Fourier transform to the angle
// coordinates (it commutes with T, C and P) and Y = B^dag V B on a block basis B, the beat on the block is
//   U = Y^dag diag(e^(-i pi f N_F / N)) Y diag(e^(-i pi s N_D / N))
// which is the ladder's beat (code/rule/plaquette-ladder) at drift s / 2N and force f / 2N with root 1, restricted.
// det U = e^(-i (pi / N)(s Tr N_D + f Tr N_F)), traces over the block, integers. That is the trace identity.
//
// THE STEP, exactly. On a straight path in (s, f), U' = -i A U - i U B with A = (pi / N) df Y^dag N_F Y and
// B = (pi / N) ds N_D, so a level's phase moves at -<A> - <B> (Hellmann-Feynman for a product), which lies in a known
// window of width (pi / N)(|df| max N_F + |ds| max N_D). Each step keeps that width at most `window` (< 2 pi), so a
// level's increment is the unique value in the window: its turn is exact once its match is. Matching: each level
// follows its eigenvector; a step is accepted when every level's best overlap with the new eigenvectors is at least
// `clean`, and is halved otherwise, down to a floor, where the match is forced (and counted).
//
// THE PASSINGS. Two levels of one block meet on the circle when their lifted difference crosses a multiple of 2 pi.
// A crossing of 0 (a LINE passing) leaves the lifted multiset the same whichever way the pair is matched. A crossing
// of 2 pi m, m != 0 (a TURN passing) moves a whole turn between the pair if the match is swapped, and the trace
// cannot see it (the sum is the same). Both are counted. Doubles: this is measurement.

import { bal } from '@/code/rule/lattice-qed'
import { electricOf, type LadderSpec } from '@/code/rule/plaquette-ladder'
import {
  applyDense,
  inner,
  planck,
  sectorsOf,
  thermalEnergy,
  type UnitaryEigen,
  type Vec,
} from '@/code/measure/quantum-ladder'
import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import { GOLDEN, SILVER } from '@/code/tool/weyl'

const TAU = 2 * Math.PI

/**
 * The phases and eigenvectors of a unitary, as code/measure/quantum-ladder `unitaryEigen` finds them (through the
 * Hermitian (U + U^dag)/2 + t (U - U^dag)/(2i), each cluster re-diagonalized with a second t, every pair checked by
 * its residual |U v - lambda v|), but with the complex Householder solver
 * (code/algebra/linear/eig-hermitian-householder) on n rows instead of the real embedding on 2n.
 */
export function unitaryEigenHouseholder(
  n: number,
  ure: Float64Array,
  uim: Float64Array,
  t = GOLDEN,
  depth = 0,
): UnitaryEigen {
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const ur = ure[i * n + j]!
      const ui = uim[i * n + j]!
      const vr = ure[j * n + i]!
      const vi = -uim[j * n + i]!

      re[i * n + j] = (ur + vr) / 2 + (t * (ui - vi)) / 2
      im[i * n + j] = (ui + vi) / 2 - (t * (ur - vr)) / 2
    }
  }

  const h = hermitianEigenRows(n, re, im)
  const rows: Vec[] = Array.from({ length: n }, (_, r) => ({
    re: h.vectorsRe.slice(r * n, r * n + n),
    im: h.vectorsIm.slice(r * n, r * n + n),
  }))
  const phases: number[] = []
  const vectors: Vec[] = []

  let residual = 0
  let start = 0

  const check = (v: Vec): number => {
    const uv = applyDense(n, ure, uim, v)
    const [lr, li] = inner(v, uv)

    let r2 = 0

    for (let x = 0; x < n; x++) {
      r2 +=
        (uv.re[x]! - (lr * v.re[x]! - li * v.im[x]!)) ** 2 +
        (uv.im[x]! - (lr * v.im[x]! + li * v.re[x]!)) ** 2
    }

    residual = Math.max(residual, Math.sqrt(r2))

    return Math.atan2(li, lr)
  }

  while (start < n) {
    let end = start + 1

    while (end < n && h.values[end]! - h.values[end - 1]! <= 1e-7) {
      end++
    }

    const block = rows.slice(start, end)

    if (block.length === 1 || depth > 0) {
      for (const v of block) {
        phases.push(check(v))
        vectors.push(v)
      }
    } else {
      const k = block.length
      const wre = new Float64Array(k * k)
      const wim = new Float64Array(k * k)
      const images = block.map(v => applyDense(n, ure, uim, v))

      for (let a = 0; a < k; a++) {
        for (let b = 0; b < k; b++) {
          const [r, i] = inner(block[a]!, images[b]!)

          wre[a * k + b] = r
          wim[a * k + b] = i
        }
      }

      const sub = unitaryEigenHouseholder(k, wre, wim, SILVER, depth + 1)

      sub.vectors.forEach(c => {
        const v = { re: new Float64Array(n), im: new Float64Array(n) }

        for (let a = 0; a < k; a++) {
          for (let x = 0; x < n; x++) {
            v.re[x] =
              v.re[x]! +
              c.re[a]! * block[a]!.re[x]! -
              c.im[a]! * block[a]!.im[x]!

            v.im[x] =
              v.im[x]! +
              c.re[a]! * block[a]!.im[x]! +
              c.im[a]! * block[a]!.re[x]!
          }
        }

        phases.push(check(v))
        vectors.push(v)
      })
    }

    start = end
  }

  return { phases, vectors, residual }
}

export type SparseVector = {
  readonly index: Int32Array
  readonly re: Float64Array
  readonly im: Float64Array
}

export type FlowBlock = {
  readonly q: number
  /** the C character, +1 or -1 */
  readonly charge: number
  /** the P character, +1 or -1, or 0 where P does not act inside the sector */
  readonly parity: number
  /** 2 when sector L - q is P's image of sector q, else 1 */
  readonly copies: number
  readonly dim: number
  readonly basis: readonly SparseVector[]
  readonly electric: Int32Array
  readonly magnetic: Int32Array
  readonly maxElectric: number
  readonly maxMagnetic: number
  readonly traceElectric: number
  readonly traceMagnetic: number
  readonly yRe: Float64Array
  readonly yIm: Float64Array
}

export type FlowSystem = {
  readonly n: number
  readonly plaquettes: number
  readonly size: number
  readonly digits: Int32Array
  readonly blocks: readonly FlowBlock[]
}

/** The light's spec with no split (the blocks do not depend on it). */
const bareSpec = (n: number, plaquettes: number): LadderSpec => ({
  n,
  plaquettes,
  root: 1,
  drift: 0,
  force: 0,
})

/** The symmetry-adapted blocks of the ladder light on `plaquettes` squares with modulus n. */
export function flowSystem(n: number, plaquettes: number): FlowSystem {
  const L = plaquettes
  const spec = bareSpec(n, L)
  const size = n ** L
  const digits = new Int32Array(size * L)

  for (let i = 0; i < size; i++) {
    let rest = i

    for (let p = 0; p < L; p++) {
      digits[i * L + p] = rest % n
      rest = Math.floor(rest / n)
    }
  }

  const compose = (ds: ArrayLike<number>): number => {
    let out = 0

    for (let p = L - 1; p >= 0; p--) {
      out = out * n + ds[p]!
    }

    return out
  }
  const negate = (i: number): number =>
    compose(
      Array.from({ length: L }, (_, p) => (n - digits[i * L + p]!) % n),
    )
  const reverse = (i: number): number =>
    compose(Array.from({ length: L }, (_, p) => digits[i * L + ((L - p) % L)]!))

  const electricAll = Int32Array.from({ length: size }, (_, i) =>
    electricOf(spec, i),
  )
  const magneticAll = Int32Array.from({ length: size }, (_, i) => {
    let e = 0

    for (let p = 0; p < L; p++) {
      e += bal(digits[i * L + p]!, n) ** 2
    }

    return e
  })

  const sectors = sectorsOf(spec)
  const blocks: FlowBlock[] = []

  for (let q = 0; q <= Math.floor(L / 2); q++) {
    const k = (TAU * q) / L
    const hasP = L >= 3 && (2 * q) % L === 0
    const copies = (2 * q) % L === 0 ? 1 : 2
    const elements: [boolean, boolean][] = hasP
      ? [
          [false, false],
          [true, false],
          [false, true],
          [true, true],
        ]
      : [
          [false, false],
          [true, false],
        ]
    const act = ([c, p]: [boolean, boolean], i: number): number => {
      let j = i

      if (c) {
        j = negate(j)
      }

      if (p) {
        j = reverse(j)
      }

      return j
    }
    const characters: [number, number][] = hasP
      ? [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]
      : [
          [1, 0],
          [-1, 0],
        ]
    const found = characters.map(() => [] as SparseVector[])
    const visited = new Uint8Array(size)

    for (let r = 0; r < size; r++) {
      if (sectors.rep[r] !== r || (q * sectors.length[r]!) % L !== 0) {
        continue
      }

      if (visited[r]) {
        continue
      }

      // the sector state |r, q> = (1 / sqrt len) sum_j e^(-i k j) |T^j r>
      const len = sectors.length[r]!
      const state: [number, number, number][] = []

      {
        let j = r

        for (let t = 0; t < len; t++) {
          state.push([
            j,
            Math.cos(-k * t) / Math.sqrt(len),
            Math.sin(-k * t) / Math.sqrt(len),
          ])
          j = translateIndex(digits, n, L, j)
        }
      }

      for (const g of elements) {
        for (const [i] of state) {
          visited[sectors.rep[act(g, i)]!] = 1
        }
      }

      characters.forEach(([xc, xp], c) => {
        const acc = new Map<number, [number, number]>()

        for (const g of elements) {
          const w = (g[0] ? xc : 1) * (g[1] ? xp : 1) / elements.length

          for (const [i, cr, ci] of state) {
            const j = act(g, i)
            const prev = acc.get(j) ?? [0, 0]

            acc.set(j, [prev[0] + w * cr, prev[1] + w * ci])
          }
        }

        let norm = 0

        for (const [cr, ci] of acc.values()) {
          norm += cr * cr + ci * ci
        }

        if (norm < 1e-9) {
          return
        }

        const entries = [...acc.entries()]
          .filter(([, [cr, ci]]) => cr * cr + ci * ci > 1e-24)
          .sort((a, b) => a[0] - b[0])
        const scale = 1 / Math.sqrt(norm)

        found[c]!.push({
          index: Int32Array.from(entries, e => e[0]),
          re: Float64Array.from(entries, e => e[1][0] * scale),
          im: Float64Array.from(entries, e => e[1][1] * scale),
        })
      })
    }

    characters.forEach(([xc, xp], c) => {
      const basis = found[c]!
      const d = basis.length

      if (d === 0) {
        return
      }

      const electric = Int32Array.from(basis, b => electricAll[b.index[0]!]!)
      const magnetic = Int32Array.from(basis, b => magneticAll[b.index[0]!]!)

      basis.forEach((b, a) => {
        for (const i of b.index) {
          if (
            electricAll[i] !== electric[a] ||
            magneticAll[i] !== magnetic[a]
          ) {
            throw new Error('spectral-flow: an orbit is not level in N_D or N_F')
          }
        }
      })

      const { yRe, yIm } = fourierBlock(digits, n, L, basis)

      blocks.push({
        q,
        charge: xc,
        parity: xp,
        copies,
        dim: d,
        basis,
        electric,
        magnetic,
        maxElectric: Math.max(...electric),
        maxMagnetic: Math.max(...magnetic),
        traceElectric: electric.reduce((a, b) => a + b, 0),
        traceMagnetic: magnetic.reduce((a, b) => a + b, 0),
        yRe,
        yIm,
      })
    })
  }

  return { n, plaquettes: L, size, digits, blocks }
}

// the index with every digit moved from square p to square p + 1 (quantum-ladder's translate, on a digit table)
function translateIndex(
  digits: Int32Array,
  n: number,
  L: number,
  i: number,
): number {
  let out = 0

  for (let p = L - 1; p >= 0; p--) {
    out = out * n + digits[i * L + ((p - 1 + L) % L)]!
  }

  return out
}

// Y = B^dag V B, with V the per-digit transform V(B, m) = N^(-L/2) e^(-2 pi i sum_p B_p m_p / N)
function fourierBlock(
  digits: Int32Array,
  n: number,
  L: number,
  basis: readonly SparseVector[],
): { yRe: Float64Array; yIm: Float64Array } {
  const d = basis.length
  const yRe = new Float64Array(d * d)
  const yIm = new Float64Array(d * d)
  const cosT = Float64Array.from({ length: n }, (_, j) => Math.cos((-TAU * j) / n))
  const sinT = Float64Array.from({ length: n }, (_, j) => Math.sin((-TAU * j) / n))
  const norm = n ** (-L / 2)

  for (let row = 0; row < d; row++) {
    const b2 = basis[row]!

    for (let col = 0; col < d; col++) {
      const b1 = basis[col]!

      let sr = 0
      let si = 0

      for (let x = 0; x < b2.index.length; x++) {
        const j = b2.index[x]!
        // conj(gamma)
        const gr = b2.re[x]!
        const gi = -b2.im[x]!

        for (let y = 0; y < b1.index.length; y++) {
          const i = b1.index[y]!

          let e = 0

          for (let p = 0; p < L; p++) {
            e += digits[j * L + p]! * digits[i * L + p]!
          }

          e %= n

          const vr = cosT[e]!
          const vi = sinT[e]!
          // conj(gamma) * beta * V
          const br = b1.re[y]!
          const bi = b1.im[y]!
          const pr = gr * br - gi * bi
          const pi = gr * bi + gi * br

          sr += pr * vr - pi * vi
          si += pr * vi + pi * vr
        }
      }

      yRe[row * d + col] = sr * norm
      yIm[row * d + col] = si * norm
    }
  }

  return { yRe, yIm }
}

/** The beat on a block at drift s / 2N and force f / 2N (root 1), dense row-major. */
export function blockUnitary(
  block: FlowBlock,
  n: number,
  s: number,
  f: number,
): { re: Float64Array; im: Float64Array } {
  const d = block.dim
  const zr = new Float64Array(d * d)
  const zi = new Float64Array(d * d)

  for (let k = 0; k < d; k++) {
    const t = (-Math.PI * f * block.magnetic[k]!) / n
    const c = Math.cos(t)
    const sn = Math.sin(t)

    for (let j = 0; j < d; j++) {
      const yr = block.yRe[k * d + j]!
      const yi = block.yIm[k * d + j]!

      zr[k * d + j] = c * yr - sn * yi
      zi[k * d + j] = c * yi + sn * yr
    }
  }

  const re = new Float64Array(d * d)
  const im = new Float64Array(d * d)

  // U = Y^dag Z: U_ij = sum_k conj(Y_ki) Z_kj
  for (let k = 0; k < d; k++) {
    for (let i = 0; i < d; i++) {
      const ar = block.yRe[k * d + i]!
      const ai = -block.yIm[k * d + i]!

      if (ar === 0 && ai === 0) {
        continue
      }

      const row = i * d
      const zrow = k * d

      for (let j = 0; j < d; j++) {
        const br = zr[zrow + j]!
        const bi = zi[zrow + j]!

        re[row + j] = re[row + j]! + ar * br - ai * bi
        im[row + j] = im[row + j]! + ar * bi + ai * br
      }
    }
  }

  for (let j = 0; j < d; j++) {
    const t = (-Math.PI * s * block.electric[j]!) / n
    const c = Math.cos(t)
    const sn = Math.sin(t)

    for (let i = 0; i < d; i++) {
      const xr = re[i * d + j]!
      const xi = im[i * d + j]!

      re[i * d + j] = c * xr - sn * xi
      im[i * d + j] = c * xi + sn * xr
    }
  }

  return { re, im }
}

/** The trace identity: the lifted phases of a block sum to this, exactly. */
export const blockTrace = (
  block: FlowBlock,
  n: number,
  s: number,
  f: number,
): number =>
  (-Math.PI / n) * (s * block.traceElectric + f * block.traceMagnetic)

// ---------------------------------------------------------------------------------------------------------
// the tracker

export type FlowState = {
  /** lifted phases, one per level, radians (energy = -theta) */
  readonly theta: Float64Array
  /** the levels' eigenvectors on the block basis, null at the identity */
  readonly vectors: readonly Vec[] | null
}

export type FlowStats = {
  steps: number
  refinements: number
  forced: number
  traceGap: number
  residual: number
  /** the least best-overlap accepted on any step */
  leastOverlap: number
  linePassings: number
  turnPassings: number
}

export const emptyStats = (): FlowStats => ({
  steps: 0,
  refinements: 0,
  forced: 0,
  traceGap: 0,
  residual: 0,
  leastOverlap: 1,
  linePassings: 0,
  turnPassings: 0,
})

export const identityState = (block: FlowBlock): FlowState => ({
  theta: new Float64Array(block.dim),
  vectors: null,
})

export type FlowOptions = {
  /** the largest width of a step's increment window, radians (< 2 pi) */
  readonly window: number
  /** the least best-overlap a step accepts */
  readonly clean: number
  /** the smallest step, as a fraction of the largest, before a match is forced */
  readonly floor: number
}

export const FLOW_DEFAULTS: FlowOptions = {
  window: Math.PI / 2,
  clean: 0.75,
  floor: 2 ** -20,
}

const wrap = (x: number): number => x - TAU * Math.round(x / TAU)

/**
 * Carry one block's lift along the straight path from (s0, f0) to (s1, f1). Returns the state at the end; `stats` is
 * added to.
 */
export function flowBlock(
  block: FlowBlock,
  n: number,
  state: FlowState,
  from: readonly [number, number],
  to: readonly [number, number],
  options: FlowOptions,
  stats: FlowStats,
): FlowState {
  const d = block.dim
  const [s0, f0] = from
  const [s1, f1] = to
  const ds = s1 - s0
  const df = f1 - f0
  // the phase rate's window per unit path parameter: [lowRate, highRate]
  const lowRate =
    (-Math.PI / n) *
    (Math.max(df, 0) * block.maxMagnetic + Math.max(ds, 0) * block.maxElectric)
  const highRate =
    (Math.PI / n) *
    (Math.max(-df, 0) * block.maxMagnetic +
      Math.max(-ds, 0) * block.maxElectric)
  const width = highRate - lowRate
  const hMax = width > 0 ? Math.min(1, options.window / width) : 1

  let theta = Float64Array.from(state.theta)
  let vectors = state.vectors
  let lam = 0
  let h = hMax

  while (lam < 1 - 1e-15) {
    h = Math.min(h, 1 - lam)

    const next = lam + h >= 1 - 1e-15 ? 1 : lam + h
    const step = next - lam
    const s = s0 + next * ds
    const f = f0 + next * df
    const u = blockUnitary(block, n, s, f)
    const eig = unitaryEigenHouseholder(d, u.re, u.im)

    let order: Int32Array
    let least = 1

    if (vectors === null) {
      order = Int32Array.from({ length: d }, (_, i) => i)
    } else {
      const match = matchLevels(vectors, eig.vectors, options.clean)

      if (!match.clean && h > hMax * options.floor) {
        h /= 2
        stats.refinements++
        continue
      }

      if (!match.clean) {
        stats.forced++
      }

      order = match.order
      least = match.least
    }

    const center = ((lowRate + highRate) / 2) * step
    const increments = new Float64Array(d)

    for (let j = 0; j < d; j++) {
      increments[j] =
        center + wrap(eig.phases[order[j]!]! - theta[j]! - center)
    }

    if (vectors !== null) {
      for (let i = 0; i < d; i++) {
        for (let j = i + 1; j < d; j++) {
          const before = theta[i]! - theta[j]!
          const after = before + increments[i]! - increments[j]!
          const kb = Math.floor(before / TAU)
          const ka = Math.floor(after / TAU)

          if (kb !== ka) {
            if (Math.max(kb, ka) === 0) {
              stats.linePassings++
            } else {
              stats.turnPassings++
            }
          }
        }
      }
    }

    const nextTheta = new Float64Array(d)

    for (let j = 0; j < d; j++) {
      nextTheta[j] = theta[j]! + increments[j]!
    }

    let sum = 0

    for (let j = 0; j < d; j++) {
      sum += nextTheta[j]!
    }

    stats.traceGap = Math.max(
      stats.traceGap,
      Math.abs(sum - blockTrace(block, n, s, f)),
    )
    stats.residual = Math.max(stats.residual, eig.residual)
    stats.leastOverlap = Math.min(stats.leastOverlap, least)
    stats.steps++
    theta = nextTheta
    vectors = Array.from(order, i => eig.vectors[i]!)
    lam = next
    h = Math.min(2 * h, hMax)
  }

  return { theta, vectors }
}

// each old level's best new eigenvector by |overlap|^2; clean when every best is at least `clean` (then the bests are a
// permutation, since a column's overlaps sum to 1); otherwise a greedy assignment by descending overlap
function matchLevels(
  old: readonly Vec[],
  fresh: readonly Vec[],
  clean: number,
): { order: Int32Array; clean: boolean; least: number } {
  const d = old.length
  const overlap = new Float64Array(d * d)

  for (let j = 0; j < d; j++) {
    const a = old[j]!

    for (let i = 0; i < d; i++) {
      const b = fresh[i]!

      let r = 0
      let s = 0

      for (let x = 0; x < d; x++) {
        r += a.re[x]! * b.re[x]! + a.im[x]! * b.im[x]!
        s += a.re[x]! * b.im[x]! - a.im[x]! * b.re[x]!
      }

      overlap[j * d + i] = r * r + s * s
    }
  }

  const order = new Int32Array(d)
  const used = new Uint8Array(d)

  let least = 1
  let ok = true

  for (let j = 0; j < d; j++) {
    let best = 0

    for (let i = 1; i < d; i++) {
      if (overlap[j * d + i]! > overlap[j * d + best]!) {
        best = i
      }
    }

    const v = overlap[j * d + best]!

    least = Math.min(least, v)

    if (v < clean || used[best]) {
      ok = false
    }

    used[best] = 1
    order[j] = best
  }

  if (ok) {
    return { order, clean: true, least }
  }

  // forced: greedy over all pairs by descending overlap
  const pairs = Array.from({ length: d * d }, (_, x) => x).sort(
    (a, b) => overlap[b]! - overlap[a]!,
  )
  const takenOld = new Uint8Array(d)
  const takenNew = new Uint8Array(d)

  for (const x of pairs) {
    const j = Math.floor(x / d)
    const i = x % d

    if (takenOld[j] || takenNew[i]) {
      continue
    }

    takenOld[j] = 1
    takenNew[i] = 1
    order[j] = i
  }

  return { order, clean: false, least }
}

// ---------------------------------------------------------------------------------------------------------
// the whole light: rays from the identity, and a line of ratios at t = 1

export type FlowLift = {
  readonly states: readonly FlowState[]
  readonly stats: FlowStats
}

/** The split (s, f) of kappa = 2 / n at the real ratio rho = f / s. */
export const splitAt = (n: number, rho: number): [number, number] => [
  Math.sqrt(2 / (n * rho)),
  Math.sqrt((2 * rho) / n),
]

/** Every block lifted along the ray from the identity to (s, f). */
export function rayLift(
  system: FlowSystem,
  to: readonly [number, number],
  options: FlowOptions = FLOW_DEFAULTS,
): FlowLift {
  const stats = emptyStats()
  const states = system.blocks.map(b =>
    flowBlock(b, system.n, identityState(b), [0, 0], to, options, stats),
  )

  return { states, stats }
}

/** Every block carried on from `lift` at `from` to `to`. */
export function carryLift(
  system: FlowSystem,
  lift: FlowLift,
  from: readonly [number, number],
  to: readonly [number, number],
  options: FlowOptions = FLOW_DEFAULTS,
): FlowLift {
  const stats = emptyStats()
  const states = system.blocks.map((b, i) =>
    flowBlock(b, system.n, lift.states[i]!, from, to, options, stats),
  )

  return { states, stats }
}

export const addStats = (into: FlowStats, add: FlowStats): void => {
  into.steps += add.steps
  into.refinements += add.refinements
  into.forced += add.forced
  into.traceGap = Math.max(into.traceGap, add.traceGap)
  into.residual = Math.max(into.residual, add.residual)
  into.leastOverlap = Math.min(into.leastOverlap, add.leastOverlap)
  into.linePassings += add.linePassings
  into.turnPassings += add.turnPassings
}

// ---------------------------------------------------------------------------------------------------------
// the analytic lift: inside one block no two levels meet along a generic path (they avoid), so the exact continuation
// from U(0) = 1, where every phase is 0, keeps the levels' cyclic order, and the lifted phases stay d consecutive
// points of the 2 pi-periodic set {phase + 2 pi k}. Which d consecutive points is fixed by the trace identity, since
// moving the window by one adds 2 pi to the sum. So the analytic lift needs no path: one spectrum and one integer.

export function cyclicBlock(
  block: FlowBlock,
  n: number,
  s: number,
  f: number,
): FlowState & { integerGap: number; residual: number } {
  const d = block.dim
  const u = blockUnitary(block, n, s, f)
  const eig = unitaryEigenHouseholder(d, u.re, u.im)
  const order = Array.from({ length: d }, (_, i) => i).sort(
    (a, b) => eig.phases[a]! - eig.phases[b]!,
  )
  const base = order.reduce((acc, i) => acc + eig.phases[i]!, 0)
  const shift = (blockTrace(block, n, s, f) - base) / TAU
  const m = Math.round(shift)
  const theta = new Float64Array(d)

  order.forEach((i, r) => {
    const j = m + (((r - m) % d) + d) % d

    theta[i] = eig.phases[i]! + TAU * Math.floor(j / d)
  })

  return {
    theta,
    vectors: eig.vectors,
    integerGap: Math.abs(shift - m),
    residual: eig.residual,
  }
}

/** Every block's analytic lift at (s, f); stats carry the largest integer gap as traceGap. */
export function cyclicLift(
  system: FlowSystem,
  at: readonly [number, number],
): FlowLift {
  const stats = emptyStats()
  const states = system.blocks.map(b => {
    const c = cyclicBlock(b, system.n, at[0], at[1])

    stats.traceGap = Math.max(stats.traceGap, c.integerGap)
    stats.residual = Math.max(stats.residual, c.residual)
    stats.steps++

    return { theta: c.theta, vectors: c.vectors }
  })

  return { states, stats }
}

/** The largest difference between two lifts' sorted lifted phases, block by block. */
export function liftGap(a: FlowLift, b: FlowLift): number {
  let gap = 0

  a.states.forEach((sa, i) => {
    const x = [...sa.theta].sort((u, v) => u - v)
    const y = [...b.states[i]!.theta].sort((u, v) => u - v)

    x.forEach((v, j) => {
      gap = Math.max(gap, Math.abs(v - y[j]!))
    })
  })

  return gap
}

/** Per block, the lifted span (max - min phase) in turns of 2 pi. */
export const liftSpans = (lift: FlowLift): number[] =>
  lift.states.map(
    s => (Math.max(...s.theta) - Math.min(...s.theta)) / TAU,
  )

// ---------------------------------------------------------------------------------------------------------
// the Planck ratio of a lift: every level's energy is minus its lifted phase (U = e^(-i H)); the vacuum is the level
// of least energy; the one-quantum band in each sector is the level with the largest overlap with m_k |vac> (as
// code/measure/quantum-ladder oneQuantumBand), its omega the lifted energy difference; the ratio is the thermal energy
// of the whole spectrum over Planck's sum over the band

export type LiftPlanck = {
  ratios: number[]
  omegas: number[]
  energies: number[]
  vacuum: number
}

export function liftPlanck(
  system: FlowSystem,
  lift: FlowLift,
  temperatures: readonly number[],
): LiftPlanck {
  const { n, plaquettes: L, size, digits, blocks } = system
  const energies: number[] = []

  let vb = -1
  let vj = -1
  let ve = Infinity

  blocks.forEach((b, i) => {
    const th = lift.states[i]!.theta

    for (let j = 0; j < b.dim; j++) {
      const e = -th[j]!

      for (let c = 0; c < b.copies; c++) {
        energies.push(e)
      }

      if (e < ve) {
        ve = e
        vb = i
        vj = j
      }
    }
  })

  // the vacuum in the full space
  const vr = new Float64Array(size)
  const vi = new Float64Array(size)
  const vblock = blocks[vb]!
  const vvec = lift.states[vb]!.vectors![vj]!

  vblock.basis.forEach((b, a) => {
    const cr = vvec.re[a]!
    const ci = vvec.im[a]!

    for (let x = 0; x < b.index.length; x++) {
      const idx = b.index[x]!

      vr[idx] = vr[idx]! + cr * b.re[x]! - ci * b.im[x]!
      vi[idx] = vi[idx]! + cr * b.im[x]! + ci * b.re[x]!
    }
  })

  const omegaOf = new Map<number, number>()

  for (let q = 0; q <= Math.floor(L / 2); q++) {
    const k = (TAU * q) / L
    const tr = new Float64Array(size)
    const ti = new Float64Array(size)

    let norm = 0

    for (let i = 0; i < size; i++) {
      let sr = 0
      let si = 0

      for (let p = 0; p < L; p++) {
        const m = bal(digits[i * L + p]!, n)

        sr += (m * Math.cos(-k * p)) / Math.sqrt(L)
        si += (m * Math.sin(-k * p)) / Math.sqrt(L)
      }

      tr[i] = sr * vr[i]! - si * vi[i]!
      ti[i] = sr * vi[i]! + si * vr[i]!
      norm += tr[i]! ** 2 + ti[i]! ** 2
    }

    let best = -1
    let bestWeight = 0

    blocks.forEach((b, bi) => {
      if (b.q !== q) {
        return
      }

      // g_a = <b_a | m_k vac>
      const gr = new Float64Array(b.dim)
      const gi = new Float64Array(b.dim)

      b.basis.forEach((bv, a) => {
        let r = 0
        let s = 0

        for (let x = 0; x < bv.index.length; x++) {
          const idx = bv.index[x]!

          r += bv.re[x]! * tr[idx]! + bv.im[x]! * ti[idx]!
          s += bv.re[x]! * ti[idx]! - bv.im[x]! * tr[idx]!
        }

        gr[a] = r
        gi[a] = s
      })

      const vecs = lift.states[bi]!.vectors!

      for (let j = 0; j < b.dim; j++) {
        if (bi === vb && j === vj) {
          continue
        }

        const c = vecs[j]!

        let r = 0
        let s = 0

        for (let a = 0; a < b.dim; a++) {
          r += c.re[a]! * gr[a]! + c.im[a]! * gi[a]!
          s += c.re[a]! * gi[a]! - c.im[a]! * gr[a]!
        }

        const w = (r * r + s * s) / norm

        if (w > bestWeight) {
          bestWeight = w
          best = -lift.states[bi]!.theta[j]! - ve
        }
      }
    })

    omegaOf.set(q, best)
  }

  const omegas = Array.from(
    { length: L },
    (_, q) => omegaOf.get(Math.min(q, L - q))!,
  )

  return {
    ratios: temperatures.map(
      T =>
        thermalEnergy(energies, T) /
        omegas.reduce((acc, w) => acc + planck(w, T), 0),
    ),
    omegas,
    energies,
    vacuum: ve,
  }
}
