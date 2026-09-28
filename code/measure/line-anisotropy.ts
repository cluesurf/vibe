// A 3d state averaged over the twelve line classes, read as a dispersion: the one-line bands' Taylor series, the class
// moments in exact rational arithmetic, the lone love's band by a stable closed form and by the 2x2 walk's own
// eigenvalues, and the average's energy and velocity over directions.
//
// A branch on line class u carries the momentum k = a P . u of a 3d plane wave e^(i P . x) (a the dock step along a
// line), so the class average of a one-line band E(k) = sum_j e_2j k^2j is
//   E(P, n) = sum_j e_2j (a P)^2j M_2j(n) / 12,   M_2j(n) = sum over the 12 classes of (n . u)^2j.
// The 24 D4 roots are a spherical 5-design, so M_2 = 3 and M_4 = 3/2 for every unit n, and the first direction-dependent
// term is j = 3. On the husk (n = (x, y, z, 0)) the sixth moment is, exactly,
//   M_6(n) = 3/4 + (3/2) q - 9 r,   q = x^2 y^2 + y^2 z^2 + z^2 x^2,   r = x^2 y^2 z^2,
// 3/4 on an axis, 9/8 on a face diagonal, 11/12 on a body diagonal, and 27/28 averaged over the sphere.

import { lineClasses } from '@/code/measure/crossing-lines'

// ---- power series in k, coefficient arrays of fixed length ----

export type Series = number[]

export const seriesMul = (a: Series, b: Series): Series => a.map((_, n) => a.slice(0, n + 1).reduce((s, x, i) => s + x * (b[n - i] as number), 0))

export function seriesSqrt(h: Series): Series {
  const r: Series = new Array<number>(h.length).fill(0)

  r[0] = Math.sqrt(h[0] as number)

  for (let n = 1; n < h.length; n++) {
    let s = h[n] as number

    for (let i = 1; i < n; i++) s -= (r[i] as number) * (r[n - i] as number)
    r[n] = s / (2 * (r[0] as number))
  }

  return r
}

export function seriesDiv(a: Series, b: Series): Series {
  const q: Series = new Array<number>(a.length).fill(0)

  for (let n = 0; n < a.length; n++) {
    let s = a[n] as number

    for (let i = 0; i < n; i++) s -= (q[i] as number) * (b[n - i] as number)
    q[n] = s / (b[0] as number)
  }

  return q
}

const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1))

// the lone love's lower band under the fine coin of half-gap m, E(k) = eps(k) - m with cos eps = cos k cos m, as a series
// in k: eps' = -g'/sqrt(1 - g^2), g = cos m cos k, integrated from E(0) = 0
export function walkSeries(m: number, order: number): Series {
  const len = order + 2
  const g: Series = Array.from({ length: len }, (_, j) => (j % 2 === 0 ? (Math.cos(m) * (-1) ** (j / 2)) / factorial(j) : 0))
  const h = seriesMul(g, g).map((x, j) => (j === 0 ? 1 : 0) - x)
  const dg: Series = g.map((_, j) => (j + 1 < len ? (j + 1) * (g[j + 1] as number) : 0))
  const de = seriesDiv(dg, seriesSqrt(h)).map(x => -x)

  return Array.from({ length: order + 1 }, (_, j) => (j === 0 ? 0 : (de[j - 1] as number) / j))
}

// a relativistic band E(k) = sqrt(rest^2 + c^2 k^2) - rest, as a series in k
export function relativisticSeries(rest: number, c: number, order: number): Series {
  const h: Series = Array.from({ length: order + 1 }, (_, j) => (j === 0 ? rest * rest : j === 2 ? c * c : 0))

  return seriesSqrt(h).map((x, j) => (j === 0 ? x - rest : x))
}

// ---- the lone love's band, two ways ----

// the stable closed form: sin^2(eps/2) = sin^2(m/2) + cos m sin^2(k/2), and E = eps - m from
// sin((eps - m)/2) = cos m sin^2(k/2) / sin((eps + m)/2), with no cancellation at small k or small m
export function walkBand(m: number, k: number): { energy: number; slope: number } {
  const s2 = Math.sin(k / 2) ** 2
  const eps = 2 * Math.asin(Math.sqrt(Math.sin(m / 2) ** 2 + Math.cos(m) * s2))
  const energy = 2 * Math.asin((Math.cos(m) * s2) / Math.sin((eps + m) / 2))
  const slope = (Math.sin(k) * Math.cos(m)) / Math.sin(eps)

  return { energy, slope }
}

type Cx = [number, number]
const cmul = (a: Cx, b: Cx): Cx => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const csqrt = (a: Cx): Cx => {
  const r = Math.hypot(a[0], a[1])
  const re = Math.sqrt((r + a[0]) / 2)
  const im = Math.sign(a[1] || 1) * Math.sqrt(Math.max(0, (r - a[0]) / 2))

  return [re, im]
}

// the one-line walk U(k) = diag(e^(-ik), e^(ik)) C, C = P+ + zeta P- with zeta = e^(2im) (the fine coin, E-SPN-0107): its
// two eigenvalues from the characteristic polynomial, lambda^2 - tr lambda + det, read as E = -arg lambda. Independent of
// the closed form: it never uses cos eps = cos k cos m. Returns both quasi-energies, the band through E(0) = 0 first
// (eps - m, then -eps - m).
export function walkEigen(m: number, k: number): [number, number] {
  const z: Cx = [Math.cos(2 * m), Math.sin(2 * m)]
  const k0: Cx = [(1 + z[0]) / 2, z[1] / 2]
  const tr: Cx = cmul(k0, [2 * Math.cos(k), 0])
  const disc = csqrt([tr[0] * tr[0] - tr[1] * tr[1] - 4 * z[0], 2 * tr[0] * tr[1] - 4 * z[1]])
  const roots: Cx[] = [
    [(tr[0] + disc[0]) / 2, (tr[1] + disc[1]) / 2],
    [(tr[0] - disc[0]) / 2, (tr[1] - disc[1]) / 2],
  ]
  const es = roots.map(l => -Math.atan2(l[1], l[0])).sort((a, b) => b - a)

  return [es[0] as number, es[1] as number]
}

// ---- class moments, exact ----

const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? (a < 0n ? -a : a) : gcd(b, a % b))

export type Fraction = { num: bigint; den: bigint }

const reduce = (num: bigint, den: bigint): Fraction => {
  const g = gcd(num, den)

  return { num: num / g, den: den / g }
}

// the classes' integer roots r (u = r / sqrt 2), read off lineClasses
export const classRoots = (): number[][] => lineClasses().map(u => u.map(x => Math.round(x * Math.SQRT2)))

// sum over a set of integer line vectors r of (n . r / |r|)^m for the integer direction p (n = p/|p|), m even, exactly
export function exactMoment(p: readonly number[], m: number, roots: readonly (readonly number[])[] = classRoots()): Fraction {
  const pp = BigInt(p.reduce((s, x) => s + x * x, 0))
  let num = 0n
  let den = 1n

  for (const r of roots) {
    const dot = BigInt(r.reduce((s, x, c) => s + x * ((p[c] ?? 0) as number), 0))
    const rr = BigInt(r.reduce((s, x) => s + x * x, 0))
    const tn = dot ** BigInt(m)
    const td = (pp * rr) ** BigInt(m / 2)

    num = num * td + tn * den
    den = den * td
    const f = reduce(num, den)

    num = f.num
    den = f.den
  }

  return { num, den }
}

export const fractionValue = (f: Fraction): number => Number(f.num) / Number(f.den)

// the sixth moment's closed form on the husk
export function sixthPattern(n: readonly number[]): number {
  const [x, y, z] = [(n[0] as number) ** 2, (n[1] as number) ** 2, (n[2] as number) ** 2]

  return 3 / 4 + 1.5 * (x * y + y * z + z * x) - 9 * x * y * z
}

// the classes' first absolute moment on the husk, sum |n . u| / 12: a massless class average's energy over |P| a
export const absoluteMoment = (n: readonly number[]): number => lineClasses().reduce((s, u) => s + Math.abs(u.reduce((t, x, c) => t + x * ((n[c] ?? 0) as number), 0)), 0) / 12

// ---- directions ----

// a deterministic grid on the positive octant of the husk's sphere (the cubic group covers the rest)
export function octantGrid(steps: number): number[][] {
  const out: number[][] = []

  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const t = (i * Math.PI) / (2 * steps)
      const f = (j * Math.PI) / (2 * steps)

      out.push([Math.sin(t) * Math.cos(f), Math.sin(t) * Math.sin(f), Math.cos(t), 0])
    }
  }

  return out
}

// the class average of a band over an arbitrary set of unit line directions (4d), for controls on other line sets
export function lineAverage(dirs: readonly (readonly number[])[], n: readonly number[], K: number, band: (k: number) => { energy: number }): number {
  return dirs.reduce((s, u) => s + band(K * u.reduce((t, x, c) => t + x * ((n[c] ?? 0) as number), 0)).energy, 0) / dirs.length
}
