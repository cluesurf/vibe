// Small real-vector helpers shared by the renderers and the 4D projection. Plain
// number arrays so they work in any dimension, with no allocation surprises.

export function norm(v: number[]): number {
  return Math.sqrt(v.reduce((sum, x) => sum + x * x, 0))
}

export function dot(a: number[], b: number[]): number {
  return a.reduce((sum, x, i) => sum + x * (b[i] ?? 0), 0)
}

// a - scale * b, the building block of the Gram-Schmidt the projections use.
export function subtract(a: number[], b: number[], scale = 1): number[] {
  return a.map((x, i) => x - scale * (b[i] ?? 0))
}

export function scaled(v: number[], factor: number): number[] {
  return v.map((x) => x * factor)
}

export function normalize(v: number[]): number[] {
  const length = norm(v) || 1
  return v.map((x) => x / length)
}
