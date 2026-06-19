// Coxeter growth series from the Steinberg formula. Computes the rational growth function W(t) of a
// Coxeter group given its linear diagram labels, by summing (-1)^|T| / f_T(t) over the finite parabolic
// subsets T, then inverting. Expanding W(t) gives the exact cells-added-per-layer series, and the
// denominator gives the linear recurrence. Cross-checks the hardcoded series in growth.ts.

import { pathToFileURL } from 'node:url'

type Poly = bigint[]
type Rational = { num: Poly; den: Poly }

function trim(p: Poly): Poly {
  let i = p.length - 1
  while (i > 0 && p[i] === 0n) {
    i--
  }
  return p.slice(0, i + 1)
}

function add(a: Poly, b: Poly): Poly {
  const n = Math.max(a.length, b.length)
  const out = Array<bigint>(n).fill(0n)
  for (let i = 0; i < n; i++) {
    out[i] = (a[i] ?? 0n) + (b[i] ?? 0n)
  }
  return trim(out)
}

function mul(a: Poly, b: Poly): Poly {
  const out = Array<bigint>(a.length + b.length - 1).fill(0n)
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = out[i + j]! + a[i]! * b[j]!
    }
  }
  return trim(out)
}

function scale(a: Poly, k: bigint): Poly {
  return trim(a.map(x => x * k))
}

function reversePoly(p: Poly): Poly {
  return trim([...p].reverse())
}

function shift(p: Poly, k: number): Poly {
  return trim([...Array<bigint>(k).fill(0n), ...p])
}

function qInteger(n: number): Poly {
  // [n] = 1 + t + ... + t^(n-1)
  return Array<bigint>(n).fill(1n)
}

function rationalAdd(a: Rational, b: Rational): Rational {
  return {
    num: add(mul(a.num, b.den), mul(b.num, a.den)),
    den: mul(a.den, b.den),
  }
}

function finiteGrowthFromExponents(exponents: number[]): Poly {
  let p: Poly = [1n]
  for (const e of exponents) {
    p = mul(p, qInteger(e + 1))
  }
  return p
}

function connectedComponents(mask: number, rank: number): number[][] {
  const out: number[][] = []
  let cur: number[] = []
  for (let i = 0; i < rank; i++) {
    if (mask & (1 << i)) {
      cur.push(i)
    } else if (cur.length) {
      out.push(cur)
      cur = []
    }
  }
  if (cur.length) {
    out.push(cur)
  }
  return out
}

function componentExponents(
  component: number[],
  labels: number[],
): number[] | null {
  const size = component.length
  if (size === 1) {
    return [1]
  }
  const edgeLabels = component.slice(0, -1).map(v => labels[v]!)
  if (size === 2) {
    const m = edgeLabels[0]!
    return [1, m - 1] // I2(m)
  }
  if (size === 3) {
    const key = edgeLabels.join(',')
    if (key === '3,3') {
      return [1, 2, 3]
    } // A3
    if (key === '4,3' || key === '3,4') {
      return [1, 3, 5]
    } // B3
    if (key === '5,3' || key === '3,5') {
      return [1, 5, 9]
    } // H3
    return null
  }
  if (size === 4) {
    const key = edgeLabels.join(',')
    if (key === '3,3,3') {
      return [1, 2, 3, 4]
    } // A4
    if (key === '4,3,3' || key === '3,3,4') {
      return [1, 3, 5, 7]
    } // B4
    if (key === '3,4,3') {
      return [1, 5, 7, 11]
    } // F4
    if (key === '5,3,3' || key === '3,3,5') {
      return [1, 11, 19, 29]
    } // H4
    return null
  }
  return null
}

function finiteParabolicGrowth(
  mask: number,
  rank: number,
  labels: number[],
): Poly | null {
  if (mask === 0) {
    return [1n]
  }
  let growth: Poly = [1n]
  for (const component of connectedComponents(mask, rank)) {
    const exponents = componentExponents(component, labels)
    if (!exponents) {
      return null
    }
    growth = mul(growth, finiteGrowthFromExponents(exponents))
  }
  return growth
}

function bitCount(x: number): number {
  let n = 0
  while (x) {
    n += x & 1
    x >>= 1
  }
  return n
}

export function coxeterGrowthSeries(labels: number[]): Rational {
  const rank = labels.length + 1
  let sum: Rational = { num: [0n], den: [1n] }
  for (let mask = 0; mask < 1 << rank; mask++) {
    const finiteGrowth = finiteParabolicGrowth(mask, rank, labels)
    if (!finiteGrowth) {
      continue
    }
    const sign = bitCount(mask) % 2 === 0 ? 1n : -1n
    sum = rationalAdd(sum, { num: [sign], den: finiteGrowth })
  }
  // sum(t) = 1 / W(1/t), so W(t) = den(1/t) / num(1/t)
  const n = trim(sum.num)
  const d = trim(sum.den)
  let num = reversePoly(d)
  let den = reversePoly(n)
  const shiftAmount = n.length - d.length
  if (shiftAmount > 0) {
    num = shift(num, shiftAmount)
  }
  if (shiftAmount < 0) {
    den = shift(den, -shiftAmount)
  }
  if (den[0]! < 0n) {
    num = scale(num, -1n)
    den = scale(den, -1n)
  }
  return { num: trim(num), den: trim(den) }
}

export function expandSeries(
  series: Rational,
  count: number,
): bigint[] {
  const { num, den } = series
  if (den[0] === 0n) {
    throw new Error('Denominator has zero constant term')
  }
  const out: bigint[] = []
  for (let n = 0; n < count; n++) {
    let value = num[n] ?? 0n
    for (let i = 1; i < den.length && i <= n; i++) {
      value -= den[i]! * out[n - i]!
    }
    if (value % den[0]! !== 0n) {
      throw new Error('Non-integral coefficient encountered')
    }
    out.push(value / den[0]!)
  }
  return out
}

export function recurrenceFromDenominator(den: Poly): bigint[] {
  // Q(t) = 1 + q1 t + ... + qd t^d  =>  a_n = -q1 a_{n-1} - ... - qd a_{n-d}
  if (den[0] !== 1n) {
    throw new Error('Expected denominator constant term 1')
  }
  return den.slice(1).map(x => -x)
}

export function polyToString(p: Poly): string {
  return p
    .map((c, i) => ({ c, i }))
    .filter(x => x.c !== 0n)
    .map(({ c, i }) => {
      const coeff =
        c === 1n && i > 0 ? '' : c === -1n && i > 0 ? '-' : String(c)
      const term = i === 0 ? '' : i === 1 ? 't' : `t^${i}`
      return `${coeff}${term}`
    })
    .join(' + ')
    .replace(/\+ -/g, '- ')
}

export function coxeter237(count: number): bigint[] {
  return expandSeries(coxeterGrowthSeries([7, 3]), count)
}

export function coxeter254(count: number): bigint[] {
  return expandSeries(coxeterGrowthSeries([5, 4]), count)
}

export function coxeter2534(count: number): bigint[] {
  return expandSeries(coxeterGrowthSeries([5, 3, 4]), count)
}

export function main(): void {
  const examples = [
    ['[7,3]', [7, 3]],
    ['[5,4]', [5, 4]],
    ['[5,3,4]', [5, 3, 4]],
  ] as const
  for (const [name, labels] of examples) {
    const series = coxeterGrowthSeries([...labels])
    const seq = expandSeries(series, 20)
    const rec = recurrenceFromDenominator(series.den)
    console.log(`\n${name}`)
    console.log(
      `W(t) = (${polyToString(series.num)}) / (${polyToString(series.den)})`,
    )
    console.log(
      `recurrence coefficients: ${rec.map(String).join(', ')}`,
    )
    console.log(seq.map(String).join(', '))
  }
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
