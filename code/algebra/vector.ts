// Real Euclidean and Minkowski vector operations on plain number arrays. The small kit that experiments and
// the geometry engine kept reinventing inline (norm, dot, sub, normalize). Positional arguments here on
// purpose, these are low-level math primitives and the inline copies they replace are positional, so the
// swap is a drop-in. For the Lorentzian model space (one timelike axis) use the J-variants with a metric.

export type Vec = number[]

export function dot(a: Vec, b: Vec): number {
  let s = 0
  for (let i = 0; i < a.length; i++) {
    s += (a[i] ?? 0) * (b[i] ?? 0)
  }

  return s
}

export function norm(v: Vec): number {
  return Math.sqrt(dot(v, v))
}

export function add(a: Vec, b: Vec): Vec {
  return a.map((x, i) => x + (b[i] ?? 0))
}

// a - s * b (s defaults to 1), the common "subtract" and "project off" shape
export function sub(a: Vec, b: Vec, s = 1): Vec {
  return a.map((x, i) => x - s * (b[i] ?? 0))
}

export function scale(v: Vec, s: number): Vec {
  return v.map(x => x * s)
}

export function normalize(v: Vec): Vec {
  const m = norm(v) || 1

  return v.map(x => x / m)
}

// Minkowski inner product with a diagonal metric (entries +1 spacelike, -1 timelike)
export function innerJ(a: Vec, b: Vec, metric: number[]): number {
  let s = 0
  for (let i = 0; i < a.length; i++) {
    s += (metric[i] ?? 1) * (a[i] ?? 0) * (b[i] ?? 0)
  }

  return s
}

export function normJ(v: Vec, metric: number[]): number {
  return Math.sqrt(Math.abs(innerJ(v, v, metric)))
}
