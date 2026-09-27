// Husk transport of the bounce knit on a dock-varying living vacuum (E-RLT-0084, E-RLT-0085). MEASUREMENT: floats
// throughout.
//
// Two readings, both on E-RLT-0079's oriented background (code/measure/varying-transport ORIENTED; a stored line's law
// STORED_LAW or REVERSED_LAW by its sign, every other line EMPTY_LAW):
//  - THE CELL AVERAGE (first order in the contrast between docks, E-RLT-0082's reading): every dock's pair of collision
//    matrices, averaged over the period cell, read by code/measure/varying-transport readTransport.
//  - THE EXACT PERIODIC TRANSPORT: the medium itself, every dock with its own matrices on the period cell, a Bloch
//    wave of wave vector k through it. The period map (two beats: collide every dock, then stream with the phase
//    e^(-i k . r) per step, the cell wrapped) acts on (cells x 72) complex numbers. Its slow eigenvalues come from
//    subspace iteration on a block started from the k = 0 slow space, with a Rayleigh-Ritz step, until the block's
//    eigenvalues move by less than a set tolerance; each is named, as in code/measure/store-transport, by the family of
//    cell-summed invariants its eigenvector holds most. The anisotropy of a quantity at one |k| is (max - min) / mean
//    over the husk directions, and the three-rung exponent is log(anisotropy(kc / 4) / anisotropy(kc / 16)) / log 4,
//    E-RLT-0082's reading. Every dock's matrix is exact (code/measure/bounce-linearization, carried to its oriented root
//    by the covariance, C_(g rho) = P_g C_rho P_g^T); the periodic medium is not averaged.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { bounceLinearization } from '@/code/measure/bounce-linearization'
import { conjugated, lawsOf, ORIENTED } from '@/code/measure/varying-transport'
import { STORE_N } from '@/code/measure/token-store-linearization'
import { complexEigenvalues, complexEigenvector } from '@/code/algebra/linear/complex-eigen'
import { orthonormalize, spread } from '@/code/measure/husk-transport-order'
import { familiesOf } from '@/code/measure/store-transport'
import { type Mesh } from '@/code/tool/mesh'

const ROOTS = rootsD4()
const N = STORE_N

// the two collision matrices (B P on even beats, P B on odd ones) of a dock storing the given signs (0 for none)
export function bounceLawMatrices(kind: CollisionKind, signs: readonly number[]): [Float64Array, Float64Array] {
  const laws = lawsOf(signs)

  return [bounceLinearization({ kind, background: ORIENTED, mode: 'BP', laws }), bounceLinearization({ kind, background: ORIENTED, mode: 'PB', laws })]
}

// per dock of a store (at most one stored line per dock): its two matrices, the line-0 stored matrices carried to the
// dock's oriented root, or the empty dock's. `permutations` is W(F4) as slot permutations
export function dockMatrices(input: { kind: CollisionKind; store: Int8Array; cells: number; permutations: readonly (readonly number[])[] }): { even: Float64Array[]; odd: Float64Array[]; stored: number; carriers: number } {
  const { kind, store, cells, permutations } = input
  const f0 = LINE_FIRSTS[0] as number
  const base = bounceLawMatrices(kind, LINE_FIRSTS.map((_, l) => (l === 0 ? 1 : 0)))
  const empty = bounceLawMatrices(kind, LINE_FIRSTS.map(() => 0))
  const carrier = new Map<number, readonly number[]>()

  for (const g of permutations) if (!carrier.has(g[f0] as number)) carrier.set(g[f0] as number, g)

  const carried = new Map<number, [Float64Array, Float64Array]>()
  const even: Float64Array[] = []
  const odd: Float64Array[] = []
  let stored = 0

  for (let x = 0; x < cells; x++) {
    let slot = -1
    let count = 0

    for (let l = 0; l < 12; l++) {
      const s = store[x * 12 + l] as number

      if (s === 0) continue

      count++
      slot = s === 1 ? (LINE_FIRSTS[l] as number) : ROOTS.findIndex(r => r.every((v, k) => v === -((ROOTS[LINE_FIRSTS[l] as number] as number[])[k] as number)))
    }

    if (count > 1) throw new Error('dockMatrices takes at most one stored line per dock')

    let pair = empty

    if (count === 1) {
      const known = carried.get(slot)

      if (known) pair = known
      else {
        const g = carrier.get(slot) as readonly number[]

        pair = [conjugated(base[0], g), conjugated(base[1], g)]
        carried.set(slot, pair)
      }

      stored++
    }

    even.push(pair[0])
    odd.push(pair[1])
  }

  return { even, odd, stored, carriers: carried.size }
}

// the cell average of per-dock matrices
export function cellAverage(matrices: readonly Float64Array[]): Float64Array {
  const out = new Float64Array(N * N)

  for (const m of matrices) for (let i = 0; i < N * N; i++) out[i] = (out[i] as number) + (m[i] as number) / matrices.length

  return out
}

// ---- the exact periodic transport ----

export type PeriodicMedium = {
  readonly cells: number
  // per beat of the period (even, odd): per dock its matrix
  readonly beats: readonly (readonly Float64Array[])[]
  // per slot (dock * 24 + d): the dock it streams to
  readonly target: Int32Array
}

export function periodicMedium(mesh: Mesh, even: readonly Float64Array[], odd: readonly Float64Array[]): PeriodicMedium {
  const cells = mesh.cellCount
  const target = new Int32Array(cells * 24)

  for (let x = 0; x < cells; x++) for (let d = 0; d < 24; d++) target[x * 24 + d] = mesh.neighbour(x, d)

  return { cells, beats: [even, odd], target }
}

// apply the period map at wave vector k to a block of vectors in place (re, im: block * cells * 72)
function applyPeriod(medium: PeriodicMedium, k: readonly number[], re: Float64Array, im: Float64Array, block: number): void {
  const size = medium.cells * N
  const cr = new Float64Array(24)
  const ci = new Float64Array(24)

  for (let d = 0; d < 24; d++) {
    const r = ROOTS[d] as number[]
    const phase = -((r[0] as number) * (k[0] ?? 0) + (r[1] as number) * (k[1] ?? 0) + (r[2] as number) * (k[2] ?? 0) + (r[3] as number) * (k[3] ?? 0))

    cr[d] = Math.cos(phase)
    ci[d] = Math.sin(phase)
  }

  const tr = new Float64Array(size)
  const ti = new Float64Array(size)

  for (let b = 0; b < block; b++) {
    const off = b * size

    for (const mats of medium.beats) {
      // collide: t = A_x v_x per dock
      for (let x = 0; x < medium.cells; x++) {
        const a = mats[x] as Float64Array
        const vo = off + x * N
        const to = x * N

        for (let r = 0; r < N; r++) {
          let sr = 0
          let si = 0
          const row = r * N

          for (let c = 0; c < N; c++) {
            const w = a[row + c] as number

            if (w === 0) continue

            sr += w * (re[vo + c] as number)
            si += w * (im[vo + c] as number)
          }

          tr[to + r] = sr
          ti[to + r] = si
        }
      }

      // stream: index 2d + s on dock x goes to dock target(x, d) with the phase; store indices stay
      for (let x = 0; x < medium.cells; x++) {
        const from = x * N

        for (let i = 48; i < N; i++) {
          re[off + from + i] = tr[from + i] as number
          im[off + from + i] = ti[from + i] as number
        }
      }

      for (let x = 0; x < medium.cells; x++) {
        const from = x * N

        for (let d = 0; d < 24; d++) {
          const to = off + (medium.target[x * 24 + d] as number) * N
          const c = cr[d] as number
          const s = ci[d] as number

          for (let sign = 0; sign < 2; sign++) {
            const i = d * 2 + sign
            const xr = tr[from + i] as number
            const xi = ti[from + i] as number

            re[to + i] = c * xr - s * xi
            im[to + i] = c * xi + s * xr
          }
        }
      }
    }
  }
}

// complex modified Gram-Schmidt on a block; returns the kept count (a vector falling below `floor` is dropped)
function orthonormalizeBlock(re: Float64Array, im: Float64Array, block: number, size: number): number {
  for (let b = 0; b < block; b++) {
    const ob = b * size

    for (let p = 0; p < b; p++) {
      const op = p * size
      let sr = 0
      let si = 0

      for (let i = 0; i < size; i++) {
        // <p, b> = sum conj(p) b
        const pr = re[op + i] as number
        const pi = im[op + i] as number
        const br = re[ob + i] as number
        const bi = im[ob + i] as number

        sr += pr * br + pi * bi
        si += pr * bi - pi * br
      }

      for (let i = 0; i < size; i++) {
        const pr = re[op + i] as number
        const pi = im[op + i] as number

        re[ob + i] = (re[ob + i] as number) - (sr * pr - si * pi)
        im[ob + i] = (im[ob + i] as number) - (sr * pi + si * pr)
      }
    }

    let norm = 0

    for (let i = 0; i < size; i++) norm += (re[ob + i] as number) ** 2 + (im[ob + i] as number) ** 2

    norm = Math.sqrt(norm)

    for (let i = 0; i < size; i++) {
      re[ob + i] = (re[ob + i] as number) / norm
      im[ob + i] = (im[ob + i] as number) / norm
    }
  }

  return block
}

// a Ritz pair of the period map: decay and frequency per beat, the family it holds most, that family's share of its
// cell-uniform content, and its cell-uniform content (the squared projection on the repeated families, of 1)
export type PeriodicMode = { readonly gamma: number; readonly omega: number; readonly family: string; readonly share: number; readonly content: number }

// The `count` slowest modes at wave vector k: subspace iteration on a block of `block` vectors started from `start`
// (block vectors of cells * 72, real), Rayleigh-Ritz on the block, until the Ritz values of the `count` largest move by
// less than `tolerance` in one iteration (or `limit` iterations). Families: name -> list of cell vectors (left, real).
export function periodicSlowModes(input: {
  medium: PeriodicMedium
  k: readonly number[]
  start: readonly Float64Array[]
  count: number
  families: Record<string, Float64Array[]>
  tolerance?: number
  limit?: number
  // a converged block of a nearby wave vector to start from instead of `start` (complex, `count` vectors)
  warm?: { re: Float64Array; im: Float64Array; count: number }
}): { modes: PeriodicMode[]; iterations: number; change: number; block: { re: Float64Array; im: Float64Array; count: number } } {
  const { medium, k, start, count, families, warm } = input
  const size = medium.cells * N
  const block = warm ? warm.count : start.length
  const re = new Float64Array(block * size)
  const im = new Float64Array(block * size)
  const tolerance = input.tolerance ?? 1e-13
  const limit = input.limit ?? 400

  if (warm) {
    re.set(warm.re)
    im.set(warm.im)
  } else start.forEach((v, b) => re.set(v, b * size))

  orthonormalizeBlock(re, im, block, size)

  let previous: number[] = []
  let change = Infinity
  let iterations = 0
  let ritz: { re: number[]; im: number[]; hr: Float64Array; hi: Float64Array } | undefined

  // H = V* M V on the current block V; then the block becomes M V orthonormalized unless `keep`
  const rayleighRitz = (keep = false): { re: number[]; im: number[]; hr: Float64Array; hi: Float64Array } => {
    const mr = Float64Array.from(re)
    const mi = Float64Array.from(im)

    applyPeriod(medium, k, mr, mi, block)

    const hr = new Float64Array(block * block)
    const hi = new Float64Array(block * block)

    for (let p = 0; p < block; p++) {
      for (let q = 0; q < block; q++) {
        let sr = 0
        let si = 0

        for (let i = 0; i < size; i++) {
          const pr = re[p * size + i] as number
          const pi = im[p * size + i] as number
          const br = mr[q * size + i] as number
          const bi = mi[q * size + i] as number

          sr += pr * br + pi * bi
          si += pr * bi - pi * br
        }

        hr[p * block + q] = sr
        hi[p * block + q] = si
      }
    }

    const ev = complexEigenvalues({ re: hr, im: hi, n: block })

    if (!keep) {
      re.set(mr)
      im.set(mi)
      orthonormalizeBlock(re, im, block, size)
    }

    return { re: ev.re, im: ev.im, hr, hi }
  }

  while (iterations < limit) {
    ritz = rayleighRitz()
    iterations++

    const moduli = ritz.re.map((r, i) => Math.hypot(r, ritz?.im[i] ?? 0)).sort((a, b) => b - a).slice(0, count)

    change = previous.length === moduli.length ? Math.max(...moduli.map((m, i) => Math.abs(m - (previous[i] as number)))) : Infinity
    previous = moduli

    if (change < tolerance) break
  }

  // the Ritz pairs on the converged block V, which is kept: the Ritz vector of a Ritz value is V y
  const final = rayleighRitz(true)
  const order = final.re.map((_, i) => i).sort((a, b) => Math.hypot(final.re[b] ?? 0, final.im[b] ?? 0) - Math.hypot(final.re[a] ?? 0, final.im[a] ?? 0))
  const modes = order.slice(0, Math.max(count, block)).map(i => {
    const value: [number, number] = [final.re[i] ?? 0, final.im[i] ?? 0]
    const y = complexEigenvector({ re: final.hr, im: final.hi, n: block, value })
    const xr = new Float64Array(size)
    const xi = new Float64Array(size)

    for (let b = 0; b < block; b++) {
      const yr = y.re[b] ?? 0
      const yi = y.im[b] ?? 0

      for (let j = 0; j < size; j++) {
        const vr = re[b * size + j] as number
        const vi = im[b * size + j] as number

        xr[j] = (xr[j] as number) + yr * vr - yi * vi
        xi[j] = (xi[j] as number) + yr * vi + yi * vr
      }
    }

    const weights: Record<string, number> = {}
    let total = 0

    for (const [name, list] of Object.entries(families)) {
      let w = 0

      for (const l of list) {
        let sr = 0
        let si = 0

        for (let j = 0; j < size; j++) {
          sr += (l[j] as number) * (xr[j] as number)
          si += (l[j] as number) * (xi[j] as number)
        }

        w += sr * sr + si * si
      }

      weights[name] = w
      total += w
    }

    const [family, weight] = Object.entries(weights).reduce((best, e) => (e[1] > best[1] ? e : best), ['none', -1] as [string, number])
    let norm = 0

    for (let j = 0; j < size; j++) norm += (xr[j] as number) ** 2 + (xi[j] as number) ** 2

    return {
      gamma: -Math.log(Math.hypot(value[0], value[1])) / 2,
      omega: Math.abs(Math.atan2(value[1], value[0])) / 2,
      family,
      share: total > 0 ? weight / total : 0,
      content: norm > 0 ? total / norm : 0,
    }
  })

  return { modes, iterations, change, block: { re, im, count: block } }
}

// a 72-index vector repeated on every dock of the cell, normalized
export function repeated(v: Float64Array, cells: number): Float64Array {
  const out = new Float64Array(cells * N)
  let norm = 0

  for (let x = 0; x < cells; x++) for (let i = 0; i < N; i++) out[x * N + i] = v[i] as number

  for (const x of out) norm += x * x

  norm = Math.sqrt(norm)

  return out.map(x => x / norm)
}

// the families of a direction u lifted to the cell: each 72-index family vector repeated on every dock
export function cellFamilies(families: Record<string, Float64Array[]>, cells: number): Record<string, Float64Array[]> {
  return Object.fromEntries(Object.entries(families).map(([name, list]) => [name, orthonormalize(list.map(v => repeated(v, cells)))]))
}

// ---- the exact periodic reading ----
//
// THE SLOW MODES OF A PERIODIC MEDIUM, and why they are selected by content. A cell of period Lambda folds the Bloch
// vectors of Lambda's dual onto k = 0. The D4 gas has exact STAGGERED invariants at some of them (momentum carried with a
// sign that alternates in time and space, which every momentum-keeping collision keeps; 12 of them fold into a side-4
// cell), so the period map of a side-4 cell holds 6 + 12 eigenvalues near 1 at small k, not 6. The physical hydrodynamic
// modes are the ones whose eigenvectors hold the cell-uniform invariants (their CONTENT, of 1); on a uniform medium the
// folded modes hold none, and selecting by content reproduces the 72-index modes exactly (E-RLT-0085 checks this). On a
// medium whose docks differ, the folded modes and the physical ones can mix; the mixing is measured by the content.
//
// THE READING, fixed for E-RLT-0085: per direction and |k|, the charge mode is the mode whose largest family is the
// charge with the largest content; the PHYSICAL modes are the others with content at least `threshold`. charge =
// Gamma / k^2 of the charge mode; trace = the sum over the physical modes of content x Gamma / k^2; sound = the largest
// omega / k among them; shear = Gamma / k^2 of each physical mode whose largest family is the husk shear. The
// anisotropy of each at one |k| is (max - min) / mean over the directions (and polarizations), and the exponent is
// log(anisotropy(kc / 4) / anisotropy(kc / 16)) / log 4.

export type PeriodicReading = {
  readonly three: Record<string, number>
  readonly anisotropy: Record<string, number[]>
  readonly means: Record<string, number>
  readonly iterations: number
  readonly worstChange: number
  // at kc / 4, over the directions: the least content of the charge mode, and the physical modes' contents
  readonly chargeContent: number
  readonly physicalContents: number[]
  readonly physicalCounts: number[]
}

const QUANTITIES = ['charge', 'trace', 'sound', 'shear'] as const

export function readPeriodicTransport(input: {
  medium: PeriodicMedium
  invariants: readonly Float64Array[]
  named: Parameters<typeof familiesOf>[1]
  space: Parameters<typeof familiesOf>[0]
  kc: number
  directions: readonly (readonly number[])[]
  block: number
  threshold: number
  extra: (b: number) => Float64Array
  log?: (what: string) => void
}): PeriodicReading {
  const { medium, invariants, kc, directions, block, threshold } = input
  const rungs = [kc / 4, kc / 16]
  const values: Record<string, number[][]> = Object.fromEntries(QUANTITIES.map(q => [q, rungs.map(() => [] as number[])]))
  const start = [...invariants.map(v => repeated(v, medium.cells)), ...Array.from({ length: block - invariants.length }, (_, b) => input.extra(b))]
  let iterations = 0
  let worstChange = 0
  let chargeContent = 1
  const physicalContents: number[] = []
  const physicalCounts: number[] = []

  directions.forEach((u, index) => {
    const families = cellFamilies(familiesOf(input.space, input.named, u, invariants), medium.cells)
    let warm: { re: Float64Array; im: Float64Array; count: number } | undefined

    rungs.forEach((k, rung) => {
      const r = periodicSlowModes({ medium, k: u.map(x => x * k), start, count: 6, families, warm })

      warm = r.block
      iterations += r.iterations
      worstChange = Math.max(worstChange, r.change)

      const chargeMode = r.modes.filter(m => m.family === 'charge').reduce((best, m) => (m.content > (best?.content ?? -1) ? m : best), undefined as PeriodicMode | undefined)
      const physical = r.modes.filter(m => m !== chargeMode && m.content >= threshold)

      if (chargeMode) values.charge![rung]!.push(chargeMode.gamma / (k * k))
      values.trace![rung]!.push(physical.reduce((s, m) => s + (m.content * m.gamma) / (k * k), 0))

      const speed = Math.max(0, ...physical.map(m => m.omega / k))

      if (speed > 1e-3) values.sound![rung]!.push(speed)

      for (const m of physical) if (m.family === 'shear') values.shear![rung]!.push(m.gamma / (k * k))

      if (rung === 0) {
        chargeContent = Math.min(chargeContent, chargeMode?.content ?? 0)
        physicalContents.push(...physical.map(m => m.content))
        physicalCounts.push(physical.length)
      }

      input.log?.(`periodic direction ${index} rung ${rung}: ${r.iterations} iterations`)
    })
  })

  const three: Record<string, number> = {}
  const anisotropy: Record<string, number[]> = {}
  const means: Record<string, number> = {}

  for (const q of QUANTITIES) {
    const a = values[q]!.map(v => (v.length > 1 ? spread(v) : Number.NaN))

    anisotropy[q] = a
    three[q] = Math.log((a[0] ?? 1) / (a[1] ?? 1)) / Math.log(4)

    const first = values[q]![0] ?? []

    means[q] = first.length > 0 ? first.reduce((s, x) => s + x, 0) / first.length : Number.NaN
  }

  return { three, anisotropy, means, iterations, worstChange, chargeContent, physicalContents, physicalCounts }
}
