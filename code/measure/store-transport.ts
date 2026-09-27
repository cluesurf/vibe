// The husk transport exponents of a knit whose one-body space holds more than the 48 streaming indices: a store
// that sits in the dock (E-RLT-0065). The method is code/measure/husk-transport-exponents' (E-RLT-0059's), with the
// dimension a parameter and a stream root per index (null for an index that does not stream). The 48-index tool
// is shared and fixed at 48, so this is a new file, not an edit of it.
//
// Period map M(k) = prod_t S(k) A_t; its `count` eigenvalues of largest modulus are the slow modes, each named by
// the family of exact invariants its eigenvector sits in most; the anisotropy of a quantity at one |k| is
// (max - min) / mean over the husk directions; its exponent is the log-log slope against |k|.

import { complexEigenvalues, complexEigenvector } from '@/code/algebra/linear/complex-eigen'
import { logSlope, orthonormalize, spread } from '@/code/measure/husk-transport-order'

const ZERO_RATE = 1e-4
const SOUND_FLOOR = 1e-3

// a one-body space: its size, and for each index the root it streams along (undefined: it stays)
export type Space = { readonly n: number; readonly roots: readonly (readonly number[] | undefined)[] }

function phases(space: Space, wave: readonly number[]): { cos: Float64Array; sin: Float64Array } {
  const cos = new Float64Array(space.n)
  const sin = new Float64Array(space.n)

  for (let i = 0; i < space.n; i++) {
    const r = space.roots[i]
    const phase = r ? -((r[0] ?? 0) * (wave[0] ?? 0) + (r[1] ?? 0) * (wave[1] ?? 0) + (r[2] ?? 0) * (wave[2] ?? 0) + (r[3] ?? 0) * (wave[3] ?? 0)) : 0

    cos[i] = Math.cos(phase)
    sin[i] = Math.sin(phase)
  }

  return { cos, sin }
}

export function periodMap(space: Space, matrices: readonly Float64Array[], wave: readonly number[]): { re: Float64Array; im: Float64Array } {
  const N = space.n
  const { cos, sin } = phases(space, wave)
  let mr = new Float64Array(N * N)
  let mi = new Float64Array(N * N)
  let nr = new Float64Array(N * N)
  let ni = new Float64Array(N * N)
  const rowR = new Float64Array(N)
  const rowI = new Float64Array(N)

  for (let i = 0; i < N; i++) mr[i * N + i] = 1

  for (const a of matrices) {
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

// an orthonormal basis of the left vectors every matrix keeps (l A = l)
export function invariantsOf(space: Space, matrices: readonly Float64Array[], floor = 1e-9): Float64Array[] {
  const N = space.n
  const rows: Float64Array[] = []

  for (const a of matrices) {
    for (let c = 0; c < N; c++) rows.push(Float64Array.from({ length: N }, (_, r) => (a[r * N + c] ?? 0) - (r === c ? 1 : 0)))
  }

  const pivots: number[] = []
  let rank = 0

  for (let col = 0; col < N && rank < rows.length; col++) {
    let best = rank
    let size = 0

    for (let i = rank; i < rows.length; i++) {
      const v = Math.abs(rows[i]?.[col] ?? 0)

      if (v > size) {
        size = v
        best = i
      }
    }

    if (size < floor) continue

    const swap = rows[rank] as Float64Array

    rows[rank] = rows[best] as Float64Array
    rows[best] = swap

    const pivot = rows[rank] as Float64Array
    const p = pivot[col] as number

    for (let j = 0; j < N; j++) pivot[j] = (pivot[j] as number) / p

    for (let i = 0; i < rows.length; i++) {
      if (i === rank) continue

      const row = rows[i] as Float64Array
      const f = row[col] as number

      if (f !== 0) for (let j = 0; j < N; j++) row[j] = (row[j] as number) - f * (pivot[j] as number)
    }

    pivots.push(col)
    rank++
  }

  const free = Array.from({ length: N }, (_, i) => i).filter(i => !pivots.includes(i))

  return orthonormalize(
    free.map(f => {
      const v = new Float64Array(N)

      v[f] = 1
      pivots.forEach((col, i) => {
        v[col] = -(rows[i]?.[f] ?? 0)
      })

      return v
    }),
  )
}

// named densities: the charge (loves +1, fears -1 on the streaming indices), and the momentum along u
export type Named = { readonly charge: Float64Array; readonly momentumAlong: (u: readonly number[]) => Float64Array }

export function familiesOf(space: Space, named: Named, u: readonly number[], invariants: readonly Float64Array[]): Record<string, Float64Array[]> {
  const N = space.n
  const basis4 = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
  ]
  const acrossVectors: number[][] = []

  for (const e of basis4) {
    const s = e.reduce((acc, x, k) => acc + x * (u[k] ?? 0), 0)
    const w = e.map((x, k) => x - s * (u[k] ?? 0))

    for (const a of acrossVectors) {
      const t = w.reduce((acc, x, k) => acc + x * (a[k] ?? 0), 0)

      for (let k = 0; k < 4; k++) w[k] = (w[k] ?? 0) - t * (a[k] ?? 0)
    }

    const norm = Math.hypot(...w)

    if (norm > 1e-9) acrossVectors.push(w.map(x => x / norm))
  }

  const list: [string, Float64Array][] = [
    ['charge', named.charge],
    ['longitudinal', named.momentumAlong(u)],
    ...acrossVectors.map(a => ['shear', named.momentumAlong(a)] as [string, Float64Array]),
    ['depth', named.momentumAlong([0, 0, 0, 1])],
  ]
  const project = (v: Float64Array): Float64Array => {
    const out = new Float64Array(N)

    for (const b of invariants) {
      let s = 0

      for (let i = 0; i < N; i++) s += (b[i] as number) * (v[i] as number)
      for (let i = 0; i < N; i++) out[i] = (out[i] as number) + s * (b[i] as number)
    }

    return out
  }
  const ordered: Float64Array[] = []
  const labels: string[] = []

  for (const [name, v] of list) {
    const before = ordered.length
    const next = orthonormalize([...ordered, project(v)])

    if (next.length > before) {
      ordered.push(next[next.length - 1] as Float64Array)
      labels.push(name)
    }
  }

  const all = orthonormalize([...ordered, ...invariants])

  for (let i = ordered.length; i < all.length; i++) {
    ordered.push(all[i] as Float64Array)
    labels.push('other')
  }

  const out: Record<string, Float64Array[]> = {}

  ordered.forEach((v, i) => {
    const name = labels[i] ?? 'other'

    out[name] = [...(out[name] ?? []), v]
  })

  return out
}

export type SlowMode = { readonly gamma: number; readonly omega: number; readonly family: string; readonly share: number }

export function slowModes(space: Space, matrices: readonly Float64Array[], wave: readonly number[], count: number, families: Record<string, Float64Array[]>): SlowMode[] {
  const N = space.n
  const period = matrices.length
  const map = periodMap(space, matrices, wave)
  const ev = complexEigenvalues({ re: map.re, im: map.im, n: N })
  const order = ev.re.map((_, i) => i).sort((a, b) => Math.hypot(ev.re[b] ?? 0, ev.im[b] ?? 0) - Math.hypot(ev.re[a] ?? 0, ev.im[a] ?? 0))

  return order.slice(0, count).map(i => {
    const re = ev.re[i] ?? 0
    const im = ev.im[i] ?? 0
    const x = complexEigenvector({ re: map.re, im: map.im, n: N, value: [re, im] })
    const weights: Record<string, number> = {}
    let total = 0

    for (const [name, list] of Object.entries(families)) {
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

export type StoreSpectrum = { readonly invariants: number; readonly unitEigenvalues: number; readonly gap: number; readonly dMax: number }

export function storeSpectrum(space: Space, named: Named, matrices: readonly Float64Array[], invariants: readonly Float64Array[]): StoreSpectrum {
  const N = space.n
  const period = matrices.length
  const m0 = periodMap(space, matrices, [0, 0, 0, 0])
  const ev = complexEigenvalues({ re: m0.re, im: m0.im, n: N })
  const moduli = ev.re.map((r, i) => Math.hypot(r, ev.im[i] ?? 0)).sort((a, b) => b - a)
  // 1e-10, not the 48-index tool's 1e-12: a linearization summed over 3^12 line-momentum vectors carries about
  // 7e-12 of rounding (the idle-collision check of E-RLT-0065 reads 6.8e-12 against the identity)
  const unit = moduli.filter(x => Math.abs(x - 1) < 1e-10).length
  const next = moduli[invariants.length] ?? 0
  const probe = 1e-4
  let dMax = 0

  for (const u of [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
  ]) {
    const modes = slowModes(space, matrices, u.map(x => x * probe), invariants.length, familiesOf(space, named, u, invariants))

    for (const m of modes) dMax = Math.max(dMax, m.gamma / probe / probe)
  }

  return { invariants: invariants.length, unitEigenvalues: unit, gap: -Math.log(next) / period, dMax }
}

export const STORE_QUANTITIES = ['charge', 'trace', 'slowest', 'shear', 'sound', 'ballistic'] as const

export type StoreReading = {
  readonly series: Record<string, number[]>
  readonly ks: readonly number[]
  readonly means: Record<string, number>
  readonly axes: Record<string, number[]>
}

export function readStoreTransport(input: {
  space: Space
  named: Named
  matrices: readonly Float64Array[]
  invariants: readonly Float64Array[]
  ks: readonly number[]
  directions: readonly (readonly number[])[]
}): StoreReading {
  const { space, named, matrices, invariants, ks, directions } = input
  const series: Record<string, number[]> = Object.fromEntries(STORE_QUANTITIES.map(q => [q, [] as number[]]))
  const axes: Record<string, number[]> = Object.fromEntries(STORE_QUANTITIES.map(q => [q, [] as number[]]))
  const means: Record<string, number> = {}
  const families = directions.map(u => familiesOf(space, named, u, invariants))

  ks.forEach((k, rung) => {
    const values: Record<string, number[]> = Object.fromEntries(STORE_QUANTITIES.map(q => [q, [] as number[]]))

    directions.forEach((u, index) => {
      const modes = slowModes(space, matrices, u.map(x => x * k), invariants.length, families[index] ?? {})
      const chargeMode = modes.reduce((best, m) => (m.family === 'charge' && m.share > (best?.share ?? -1) ? m : best), undefined as SlowMode | undefined)
      const rest = modes.filter(m => m !== chargeMode)
      const decaying = rest.filter(m => m.gamma / (k * k) > ZERO_RATE)
      const ballistic = rest.filter(m => m.gamma / (k * k) <= ZERO_RATE)
      const per: Record<string, number[]> = Object.fromEntries(STORE_QUANTITIES.map(q => [q, [] as number[]]))

      if (chargeMode) per.charge!.push(chargeMode.gamma / (k * k))

      if (decaying.length > 0) {
        per.trace!.push(decaying.reduce((s, m) => s + m.gamma / (k * k), 0))
        per.slowest!.push(Math.min(...decaying.map(m => m.gamma / (k * k))))

        const speed = Math.max(...decaying.map(m => m.omega / k))

        if (speed > SOUND_FLOOR) per.sound!.push(speed)
      }

      for (const m of decaying) if (m.family === 'shear') per.shear!.push(m.gamma / (k * k))
      for (const m of ballistic) per.ballistic!.push(m.omega / k)

      for (const q of STORE_QUANTITIES) {
        values[q]!.push(...per[q]!)

        if (rung === 0 && index < 3) axes[q]!.push(...per[q]!)
      }
    })

    for (const q of STORE_QUANTITIES) {
      const v = values[q] ?? []

      series[q]!.push(v.length > 1 && v.some(x => x !== 0) ? spread(v) : Number.NaN)

      if (rung === 0) means[q] = v.length > 0 ? v.reduce((s, x) => s + x, 0) / v.length : Number.NaN
    }
  })

  return { series, ks, means, axes }
}

export type StoreExponent = { readonly slope: number; readonly error: number; readonly atSmallestK: number; readonly atLargestK: number }

export function storeExponents(reading: StoreReading, fit: number): Record<string, StoreExponent> {
  const out: Record<string, StoreExponent> = {}

  for (const [name, ys] of Object.entries(reading.series)) {
    if (ys.length === 0 || ys.some(y => !Number.isFinite(y))) continue

    const f = logSlope(reading.ks.slice(0, fit), ys.slice(0, fit))

    out[name] = { slope: f.slope, error: f.error, atSmallestK: ys[ys.length - 1] ?? Number.NaN, atLargestK: ys[0] ?? Number.NaN }
  }

  return out
}
