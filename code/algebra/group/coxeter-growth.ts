// The facet-shell series of a regular honeycomb, derived from its Coxeter group with no build at all.
//
// The cells of a regular honeycomb with Coxeter group W (generators s_0 .. s_n, labels m_ij) are the cosets
// w W_J of the cell stabilizer W_J, J every generator but the last one, s_n. Two cells are adjacent across a
// facet, and every facet lies on a mirror of a conjugate of s_n. When s_n is conjugate to no other generator
// (its neighbors are joined to it by even labels only), the number of s_n letters in a reduced word is well
// defined, the s_n-type mirrors are unions of facets and cut no cell, and so the facet distance of a cell from
// the base cell is the s_n count of its minimal coset representative. Weighting the s_n class alone by z,
// Steinberg's formula for an infinite Coxeter group,
//
//   1 / W(1/z) = sum over J subset S with W_J finite of (-1)^|J| / W_J(z),
//
// gives W(z), and the shell series is W(z) / |W_J|. Every finite W_J(z) here is found by breadth-first search
// over the group in its geometric representation, so no Poincare product formula is assumed. Integer exact.

export type BigPoly = bigint[]

const trim = (p: BigPoly): BigPoly => {
  const q = [...p]

  while (q.length > 1 && q[q.length - 1] === 0n) {
    q.pop()
  }

  return q
}

export const multiplyPoly = (p: BigPoly, q: BigPoly): BigPoly => {
  const out: bigint[] = Array(p.length + q.length - 1).fill(0n)

  p.forEach((a, i) => q.forEach((c, j) => (out[i + j] = out[i + j]! + a * c)))

  return trim(out)
}

export const addPoly = (p: BigPoly, q: BigPoly): BigPoly => trim(Array.from({ length: Math.max(p.length, q.length) }, (_, i) => (p[i] ?? 0n) + (q[i] ?? 0n)))

const scalePoly = (p: BigPoly, s: bigint): BigPoly => p.map(x => x * s)

// z^d p(1/z)
const reversePoly = (p: BigPoly, d: number): BigPoly => Array.from({ length: d + 1 }, (_, i) => p[d - i] ?? 0n)

const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? (a < 0n ? -a : a) : gcd(b, a % b))

const primitive = (p: BigPoly): BigPoly => {
  const c = p.reduce((g, x) => gcd(g, x), 0n) || 1n
  const lead = p[p.length - 1] ?? 1n

  return trim(p.map(x => ((lead < 0n ? -1n : 1n) * x) / c))
}

// the greatest common divisor over Q, primitive, by pseudo-remainders
export function polyGcd(a0: BigPoly, b0: BigPoly): BigPoly {
  let a = primitive(trim(a0))
  let b = primitive(trim(b0))
  const isZero = (p: BigPoly): boolean => p.length === 1 && p[0] === 0n

  while (!isZero(b)) {
    let r = [...a]

    while (r.length >= b.length && !isZero(r)) {
      const lead = b[b.length - 1]!
      const top = r[r.length - 1]!
      const shift = r.length - b.length

      r = r.map(x => x * lead)

      for (let i = 0; i < b.length; i++) {
        r[i + shift] = r[i + shift]! - top * b[i]!
      }

      r = trim(r)
    }

    a = b
    b = isZero(r) ? [0n] : primitive(r)
  }

  return a
}

export function dividePoly(p: BigPoly, d: BigPoly): BigPoly {
  let r = trim([...p])
  const q: bigint[] = Array(Math.max(1, r.length - d.length + 1)).fill(0n)

  while (r.length >= d.length && !(r.length === 1 && r[0] === 0n)) {
    const shift = r.length - d.length
    const top = r[r.length - 1]!
    const lead = d[d.length - 1]!

    if (top % lead !== 0n) {
      throw new Error('the division is not exact over Z')
    }

    const c = top / lead

    q[shift] = c

    for (let i = 0; i < d.length; i++) {
      r[i + shift] = r[i + shift]! - c * d[i]!
    }

    r = trim(r)
  }

  return trim(q)
}

// the finite parabolic subgroup on `generators` of the Coxeter group with labels m: its Poincare polynomial
// in z, each element counted by its number of `special` letters, or null when it has more than `limit`
// elements (infinite, for the purpose here)
export function parabolicPoincare(input: { labels: readonly (readonly number[])[]; generators: readonly number[]; special: number; limit?: number }): BigPoly | null {
  const { labels, generators, special } = input
  const limit = input.limit ?? 20000
  const n = generators.length

  if (n === 0) {
    return [1n]
  }

  const form = generators.map(i => generators.map(j => -Math.cos(Math.PI / labels[i]![j]!)))
  const reflect = (i: number, v: readonly number[]): number[] => {
    let dot = 0

    for (let j = 0; j < n; j++) {
      dot += form[i]![j]! * v[j]!
    }

    return v.map((x, j) => x - (j === i ? 2 * dot : 0))
  }
  const key = (element: readonly (readonly number[])[]): string => element.map(v => v.map(x => Math.round(x * 1e6)).join(',')).join(';')
  const identity = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? 1 : 0)))
  const seen = new Set<string>([key(identity)])
  const counts = new Map<number, bigint>([[0, 1n]])
  let frontier: [number[][], number][] = [[identity, 0]]

  // breadth by left multiplication: every first visit is along a reduced word, and every reduced word of an
  // element has the same number of letters of each conjugacy class
  while (frontier.length > 0) {
    const next: [number[][], number][] = []

    for (const [element, weight] of frontier) {
      for (let i = 0; i < n; i++) {
        const moved = element.map(v => reflect(i, v))
        const k = key(moved)

        if (!seen.has(k)) {
          const w = weight + (generators[i] === special ? 1 : 0)

          seen.add(k)
          counts.set(w, (counts.get(w) ?? 0n) + 1n)
          next.push([moved, w])
        }
      }
    }

    if (seen.size > limit) {
      return null
    }

    frontier = next
  }

  const top = Math.max(...counts.keys())

  return Array.from({ length: top + 1 }, (_, p) => counts.get(p) ?? 0n)
}

export type ShellSeries = {
  // the shell series a(z) = numerator / denominator, reduced, denominator(0) = 1
  readonly numerator: BigPoly
  readonly denominator: BigPoly
  // the finite parabolic subgroups used, with their weighted Poincare polynomials
  readonly parabolics: readonly { generators: number[]; poincare: BigPoly }[]
  // the order of the cell stabilizer
  readonly stabilizer: bigint
  // the orbifold Euler characteristic of W, sum of (-1)^|J| / |W_J|, as a fraction
  readonly euler: readonly [bigint, bigint]
}

// the facet-shell series of the honeycomb whose Coxeter labels are `labels`, cells stabilized by every
// generator but the last
export function honeycombShellSeries(labels: readonly (readonly number[])[]): ShellSeries {
  const size = labels.length
  const special = size - 1
  let num: BigPoly = [0n]
  let den: BigPoly = [1n]
  let eulerNum = 0n
  let eulerDen = 1n
  let stabilizer = 0n
  const parabolics: { generators: number[]; poincare: BigPoly }[] = []

  for (let mask = 0; mask < 1 << size; mask++) {
    const generators = Array.from({ length: size }, (_, i) => i).filter(i => (mask >> i) & 1)
    const p = parabolicPoincare({ labels, generators, special })

    if (!p) {
      continue
    }

    parabolics.push({ generators, poincare: p })

    const sign = generators.length % 2 === 0 ? 1n : -1n
    const order = p.reduce((s, x) => s + x, 0n)

    num = addPoly(multiplyPoly(num, p), scalePoly(den, sign))
    den = multiplyPoly(den, p)
    eulerNum = eulerNum * order + sign * eulerDen
    eulerDen = eulerDen * order

    if (!generators.includes(special) && generators.length === size - 1) {
      stabilizer = order
    }
  }

  // W(z) = 1 / f(1/z) = den(1/z) / num(1/z)
  const degree = Math.max(num.length, den.length) - 1
  const wNum = reversePoly(den, degree)
  const wDen = reversePoly(num, degree)
  const common = polyGcd(wNum, wDen)
  let numerator = dividePoly(wNum, common)
  let denominator = scalePoly(dividePoly(wDen, common), stabilizer)
  const g = [...numerator, ...denominator].reduce((a, x) => gcd(a, x), 0n) || 1n
  const s = (denominator[0] ?? 1n) < 0n ? -1n : 1n

  numerator = numerator.map(x => (s * x) / g)
  denominator = denominator.map(x => (s * x) / g)

  const e = gcd(eulerNum, eulerDen) || 1n

  return { numerator, denominator, parabolics, stabilizer, euler: [eulerNum / e, eulerDen / e] }
}

// the first `count` coefficients of numerator / denominator, exact; throws if one is not an integer
export function seriesCoefficients(numerator: BigPoly, denominator: BigPoly, count: number): bigint[] {
  const out: bigint[] = []
  const lead = denominator[0]!

  for (let k = 0; k < count; k++) {
    let acc = numerator[k] ?? 0n

    for (let j = 1; j <= k; j++) {
      acc -= (denominator[j] ?? 0n) * out[k - j]!
    }

    if (acc % lead !== 0n) {
      throw new Error(`coefficient ${k} is not an integer`)
    }

    out.push(acc / lead)
  }

  return out
}

// the largest real root of a monic-up-to-sign polynomial by Newton from a seed
export function newtonRoot(poly: readonly number[], seed: number): number {
  let x = seed

  for (let i = 0; i < 100; i++) {
    let p = 0
    let d = 0

    for (let k = poly.length - 1; k >= 0; k--) {
      d = d * x + p
      p = p * x + poly[k]!
    }

    x -= p / d
  }

  return x
}
