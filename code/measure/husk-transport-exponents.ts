// The husk transport exponents of a knit from its exact linear lattice Boltzmann equation, for any period
// and a given ladder of wavelengths (E-RLT-0061 to E-RLT-0063).
//
// This is the reading of E-RLT-0059 (test/experiment/relativity/husk-anisotropy-order), promoted to code so
// that more than one experiment can run it, with three changes: the period is the number of matrices (not
// 24), the period map is computed with dense typed arrays (a schedule of a thousand beats is read in a
// fraction of a second per wave vector), and the sound speed of a propagating hydrodynamic pair is read as a
// quantity of its own. Everything else is E-RLT-0059's method: the period map M(k) = prod_t S(k) A_t, its
// eigenvalues of largest modulus (as many as the schedule has exact invariants) are the slow modes, each
// named by where its eigenvector sits among the invariants (code/measure/husk-transport-order familiesFor);
// the anisotropy of a quantity at one |k| is (max - min) / mean over the directions; its exponent is the
// log-log slope of the anisotropy against |k| over the longest wavelengths.
//
// A LONG PERIOD (a schedule of a thousand beats) sends every non-conserved mode of M(k) to the rounding
// floor, and the QR iteration on the full map need not converge there (E-RLT-0062's first run stopped on it).
// The 'ritz' method reads the slow modes in the dominant subspace instead: M applied twice to the invariants
// and four fixed vectors, orthonormalized, and the eigenpairs of the small projected map lifted back
// (Rayleigh-Ritz). On a map whose fast modes are at the floor it returns the slow eigenpairs to rounding.
//
// Quantities per direction and |k|:
// - charge: the decay rate over k^2 of the mode named charge (the charge diffusion D)
// - trace: the sum of Gamma / k^2 over the other decaying slow modes (a basis-free scalar)
// - slowest: the smallest of them
// - shear: Gamma / k^2 of each decaying mode named shear (momentum across k in the husk), pooled
// - sound: the largest omega / k among the decaying modes (a propagating pair needs a kept count and momentum)
// - ballistic: omega / k of the modes that do not decay (Gamma / k^2 under 1e-4)

import { complexEigenvalues, complexEigenvector } from '@/code/algebra/linear/complex-eigen'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { familiesFor, logSlope, spread } from '@/code/measure/husk-transport-order'

const ROOTS = rootsD4()
const N = 48
const ZERO_RATE = 1e-4
const SOUND_FLOOR = 1e-3

// the streaming phase of each one-body index at a wave vector
function phases(wave: readonly number[]): { cos: Float64Array; sin: Float64Array } {
  const cos = new Float64Array(N)
  const sin = new Float64Array(N)

  for (let i = 0; i < N; i++) {
    const r = ROOTS[i >> 1] ?? []
    const phase = -((r[0] ?? 0) * (wave[0] ?? 0) + (r[1] ?? 0) * (wave[1] ?? 0) + (r[2] ?? 0) * (wave[2] ?? 0) + (r[3] ?? 0) * (wave[3] ?? 0))

    cos[i] = Math.cos(phase)
    sin[i] = Math.sin(phase)
  }

  return { cos, sin }
}

// M(k) = prod_t S(k) A_t, A_0 applied first (the convention of code/coarse/knit-boltzmann periodMap)
export function fastPeriodMap(input: { matrices: readonly Float64Array[]; wave: readonly number[] }): { re: Float64Array; im: Float64Array } {
  const { cos, sin } = phases(input.wave)
  let mr = new Float64Array(N * N)
  let mi = new Float64Array(N * N)
  let nr = new Float64Array(N * N)
  let ni = new Float64Array(N * N)
  const rowR = new Float64Array(N)
  const rowI = new Float64Array(N)

  for (let i = 0; i < N; i++) mr[i * N + i] = 1

  for (const a of input.matrices) {
    for (let r = 0; r < N; r++) {
      rowR.fill(0)
      rowI.fill(0)

      for (let k = 0; k < N; k++) {
        const w = a[r * N + k] as number

        if (w === 0) continue

        const base = k * N

        for (let c = 0; c < N; c++) {
          rowR[c] = (rowR[c] as number) + w * (mr[base + c] as number)
          rowI[c] = (rowI[c] as number) + w * (mi[base + c] as number)
        }
      }

      const cr = cos[r] as number
      const ci = sin[r] as number
      const base = r * N

      for (let c = 0; c < N; c++) {
        const sr = rowR[c] as number
        const si = rowI[c] as number

        nr[base + c] = cr * sr - ci * si
        ni[base + c] = cr * si + ci * sr
      }
    }

    ;[mr, nr] = [nr, mr]
    ;[mi, ni] = [ni, mi]
  }

  return { re: mr, im: mi }
}

export type SlowMode = { readonly gamma: number; readonly omega: number; readonly family: string; readonly share: number }

// y = M x for a complex 48 x 48 map and a complex vector
function applyMap(map: { re: Float64Array; im: Float64Array }, xr: Float64Array, xi: Float64Array): { re: Float64Array; im: Float64Array } {
  const re = new Float64Array(N)
  const im = new Float64Array(N)

  for (let r = 0; r < N; r++) {
    let sr = 0
    let si = 0

    for (let c = 0; c < N; c++) {
      const ar = map.re[r * N + c] as number
      const ai = map.im[r * N + c] as number

      sr += ar * (xr[c] as number) - ai * (xi[c] as number)
      si += ar * (xi[c] as number) + ai * (xr[c] as number)
    }

    re[r] = sr
    im[r] = si
  }

  return { re, im }
}

// The eigenpairs of the period map restricted to its dominant subspace (Rayleigh-Ritz). A period of a
// thousand beats sends every non-conserved mode to the rounding floor, where the QR iteration of the full
// 48 x 48 map need not converge. Two applications of M to the invariants (as columns) and `extra` fixed
// vectors span the slow subspace to rounding; the eigenpairs of Q^H M Q, lifted by Q, are the slow modes.
function ritzPairs(map: { re: Float64Array; im: Float64Array }, starts: readonly Float64Array[]): { values: [number, number][]; vectors: { re: Float64Array; im: Float64Array }[] } {
  const basis: { re: Float64Array; im: Float64Array }[] = []

  for (const s of starts) {
    let v = applyMap(map, s, new Float64Array(N))

    v = applyMap(map, v.re, v.im)

    for (const b of basis) {
      // v -= (b^H v) b
      let pr = 0
      let pi = 0

      for (let i = 0; i < N; i++) {
        pr += (b.re[i] as number) * (v.re[i] as number) + (b.im[i] as number) * (v.im[i] as number)
        pi += (b.re[i] as number) * (v.im[i] as number) - (b.im[i] as number) * (v.re[i] as number)
      }

      for (let i = 0; i < N; i++) {
        v.re[i] = (v.re[i] as number) - (pr * (b.re[i] as number) - pi * (b.im[i] as number))
        v.im[i] = (v.im[i] as number) - (pr * (b.im[i] as number) + pi * (b.re[i] as number))
      }
    }

    let norm = 0

    for (let i = 0; i < N; i++) norm += (v.re[i] as number) ** 2 + (v.im[i] as number) ** 2

    norm = Math.sqrt(norm)

    if (norm > 1e-12) basis.push({ re: v.re.map(x => x / norm), im: v.im.map(x => x / norm) })
  }

  const m = basis.length
  const images = basis.map(b => applyMap(map, b.re, b.im))
  const br = new Float64Array(m * m)
  const bi = new Float64Array(m * m)

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < m; c++) {
      const u = basis[r]!
      const w = images[c]!
      let pr = 0
      let pi = 0

      for (let i = 0; i < N; i++) {
        pr += (u.re[i] as number) * (w.re[i] as number) + (u.im[i] as number) * (w.im[i] as number)
        pi += (u.re[i] as number) * (w.im[i] as number) - (u.im[i] as number) * (w.re[i] as number)
      }

      br[r * m + c] = pr
      bi[r * m + c] = pi
    }
  }

  const ev = complexEigenvalues({ re: br, im: bi, n: m })
  const values: [number, number][] = ev.re.map((re, i) => [re, ev.im[i] ?? 0])
  const vectors = values.map(value => {
    const y = complexEigenvector({ re: br, im: bi, n: m, value })
    const re = new Float64Array(N)
    const im = new Float64Array(N)

    for (let k = 0; k < m; k++) {
      const b = basis[k]!
      const yr = y.re[k] as number
      const yi = y.im[k] as number

      for (let i = 0; i < N; i++) {
        re[i] = (re[i] as number) + yr * (b.re[i] as number) - yi * (b.im[i] as number)
        im[i] = (im[i] as number) + yr * (b.im[i] as number) + yi * (b.re[i] as number)
      }
    }

    return { re, im }
  })

  return { values, vectors }
}

// four fixed extra start vectors for the Ritz subspace (square-root rates, no draw)
const EXTRA_STARTS: Float64Array[] = [3, 5, 7, 11].map(q => Float64Array.from({ length: N }, (_, i) => Math.cos(2 * Math.PI * (i + 1) * (Math.sqrt(q) % 1))))

// the `count` slowest modes of the period map at one wave vector, named by family. `method` 'full' eigen-
// decomposes the whole map (E-RLT-0059's way); 'ritz' works in the dominant subspace spanned from the
// invariants (`starts`), for long periods.
export function slowModes(input: {
  matrices: readonly Float64Array[]
  wave: readonly number[]
  count: number
  families: Record<string, Float64Array[]>
  method?: 'full' | 'ritz'
  starts?: readonly Float64Array[]
}): SlowMode[] {
  const period = input.matrices.length
  const map = fastPeriodMap({ matrices: input.matrices, wave: input.wave })
  let pairs: { value: [number, number]; vector: () => { re: Float64Array; im: Float64Array } }[]

  if (input.method === 'ritz') {
    const ritz = ritzPairs(map, [...(input.starts ?? []), ...EXTRA_STARTS])

    pairs = ritz.values.map((value, i) => ({ value, vector: () => ritz.vectors[i]! }))
  } else {
    const ev = complexEigenvalues({ re: map.re, im: map.im, n: N })

    pairs = ev.re.map((re, i) => {
      const value: [number, number] = [re, ev.im[i] ?? 0]

      return { value, vector: () => complexEigenvector({ re: map.re, im: map.im, n: N, value }) }
    })
  }

  const order = pairs.map((_, i) => i).sort((a, b) => Math.hypot(...pairs[b]!.value) - Math.hypot(...pairs[a]!.value))

  return order.slice(0, input.count).map(i => {
    const [re, im] = pairs[i]!.value
    const x = pairs[i]!.vector()
    const weights: Record<string, number> = {}
    let total = 0

    for (const [name, list] of Object.entries(input.families)) {
      let w = 0

      for (const l of list) {
        let sr = 0
        let si = 0

        for (let j = 0; j < N; j++) {
          sr += (l[j] ?? 0) * (x.re[j] ?? 0)
          si += (l[j] ?? 0) * (x.im[j] ?? 0)
        }

        w += sr * sr + si * si
      }

      weights[name] = w
      total += w
    }

    const [family, weight] = Object.entries(weights).reduce((best, e) => (e[1] > best[1] ? e : best), ['none', -1] as [string, number])

    return { gamma: -Math.log(Math.hypot(re, im)) / period, omega: Math.abs(Math.atan2(im, re)) / period, family, share: total > 0 ? weight / total : 0 }
  })
}

export type Spectrum = {
  // exact invariants, and eigenvalues of M(0) of modulus 1 (to 1e-12)
  readonly invariants: number
  readonly unitEigenvalues: number
  // the decay rate per beat of the slowest non-conserved mode at k = 0
  readonly gap: number
  // the largest slow Gamma / k^2 over the husk axes at |k| = 1e-4
  readonly dMax: number
}

export function spectrumOf(input: { matrices: readonly Float64Array[]; invariants: readonly Float64Array[]; method?: 'full' | 'ritz' }): Spectrum {
  const { matrices, invariants, method } = input
  const period = matrices.length
  const m0 = fastPeriodMap({ matrices, wave: [0, 0, 0, 0] })
  const ev = method === 'ritz' ? (() => {
    const values = ritzPairs(m0, [...invariants, ...EXTRA_STARTS]).values

    return { re: values.map(v => v[0]), im: values.map(v => v[1]) }
  })() : complexEigenvalues({ re: m0.re, im: m0.im, n: N })
  const moduli = ev.re.map((r, i) => Math.hypot(r, ev.im[i] ?? 0)).sort((a, b) => b - a)
  const unit = moduli.filter(x => Math.abs(x - 1) < 1e-12).length
  const next = moduli[invariants.length] ?? 0
  const probe = 1e-4
  let dMax = 0

  for (const u of [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
  ]) {
    const modes = slowModes({ matrices, wave: u.map(x => x * probe), count: invariants.length, families: familiesFor({ u, invariants, husk: true }), method, starts: invariants })

    for (const m of modes) dMax = Math.max(dMax, m.gamma / probe / probe)
  }

  return { invariants: invariants.length, unitEigenvalues: unit, gap: -Math.log(next) / period, dMax }
}

export type TransportReading = {
  // the anisotropy of each quantity at each rung
  readonly series: Record<string, number[]>
  readonly ks: readonly number[]
  // the quantity on the first three directions (the husk axes) at the longest rung
  readonly axes: Record<string, number[]>
  // the mean over directions of each quantity at the longest rung
  readonly means: Record<string, number>
  // at each rung, how many directions carry a mode that neither decays nor moves
  readonly frozen: number[]
  readonly directions: number
}

export const QUANTITIES = ['charge', 'trace', 'slowest', 'shear', 'sound', 'ballistic'] as const

export function readTransport(input: {
  matrices: readonly Float64Array[]
  invariants: readonly Float64Array[]
  ks: readonly number[]
  directions: readonly (readonly number[])[]
  husk: boolean
  method?: 'full' | 'ritz'
}): TransportReading {
  const { matrices, invariants, ks, directions, husk, method } = input
  const series: Record<string, number[]> = Object.fromEntries(QUANTITIES.map(q => [q, [] as number[]]))
  const axes: Record<string, number[]> = Object.fromEntries(QUANTITIES.map(q => [q, [] as number[]]))
  const means: Record<string, number> = {}
  const frozen: number[] = []
  const families = directions.map(u => familiesFor({ u, invariants, husk }))

  ks.forEach((k, rung) => {
    const values: Record<string, number[]> = Object.fromEntries(QUANTITIES.map(q => [q, [] as number[]]))

    directions.forEach((u, index) => {
      const modes = slowModes({ matrices, wave: u.map(x => x * k), count: invariants.length, families: families[index] ?? {}, method, starts: invariants })
      const chargeMode = modes.reduce((best, m) => (m.family === 'charge' && m.share > (best?.share ?? -1) ? m : best), undefined as SlowMode | undefined)
      const rest = modes.filter(m => m !== chargeMode)
      const decaying = rest.filter(m => m.gamma / (k * k) > ZERO_RATE)
      const ballistic = rest.filter(m => m.gamma / (k * k) <= ZERO_RATE)
      const per: Record<string, number[]> = Object.fromEntries(QUANTITIES.map(q => [q, [] as number[]]))

      frozen[rung] = (frozen[rung] ?? 0) + (ballistic.some(m => m.omega / k < 1e-3) ? 1 : 0)

      if (chargeMode) per.charge!.push(chargeMode.gamma / (k * k))

      if (decaying.length > 0) {
        per.trace!.push(decaying.reduce((s, m) => s + m.gamma / (k * k), 0))
        per.slowest!.push(Math.min(...decaying.map(m => m.gamma / (k * k))))

        const speed = Math.max(...decaying.map(m => m.omega / k))

        if (speed > SOUND_FLOOR) per.sound!.push(speed)
      }

      for (const m of decaying) if (m.family === 'shear') per.shear!.push(m.gamma / (k * k))
      for (const m of ballistic) per.ballistic!.push(m.omega / k)

      for (const q of QUANTITIES) {
        values[q]!.push(...per[q]!)

        if (rung === 0 && index < 3) axes[q]!.push(...per[q]!)
      }
    })

    for (const q of QUANTITIES) {
      const v = values[q] ?? []

      series[q]!.push(v.length > 1 && v.some(x => x !== 0) ? spread(v) : Number.NaN)

      if (rung === 0) means[q] = v.length > 0 ? v.reduce((s, x) => s + x, 0) / v.length : Number.NaN
    }
  })

  return { series, ks, axes, means, frozen, directions: directions.length }
}

// slope and standard error of the fit, the slope between the two smallest |k|, and the anisotropy at the
// smallest and at the largest |k| of the ladder
export type Exponent = { readonly slope: number; readonly error: number; readonly tail: number; readonly atSmallestK: number; readonly atLargestK: number }

// the log-log slope of each quantity's anisotropy over the first `fit` rungs, and between the last two
export function exponentsOf(reading: TransportReading, fit: number): Record<string, Exponent> {
  const out: Record<string, Exponent> = {}

  for (const [name, ys] of Object.entries(reading.series)) {
    if (ys.length === 0 || ys.some(y => !Number.isFinite(y))) continue

    const f = logSlope(reading.ks.slice(0, fit), ys.slice(0, fit))
    const n = ys.length
    const tail = Math.log((ys[n - 2] ?? 1) / (ys[n - 1] ?? 1)) / Math.log((reading.ks[n - 2] ?? 1) / (reading.ks[n - 1] ?? 1))

    out[name] = { slope: f.slope, error: f.error, tail, atSmallestK: ys[n - 1] ?? Number.NaN, atLargestK: ys[0] ?? Number.NaN }
  }

  return out
}
