// Complex numbers as a pair [re, im], the form the walk and spectral hot loops use (no object allocation
// per operation). The object form in complex.ts is for operator APIs. Until 2026-08-31 ten modules under
// code/ each carried their own copy of these four-line helpers, with four different naming schemes.
// Callers alias on import (`import { pairMul as cmul }`) so their arithmetic reads as before, and the
// operation order inside each helper is exactly the order those copies used, so results match bit for bit.

export type ComplexPair = readonly [number, number]

export const PAIR_ZERO: ComplexPair = [0, 0]
export const PAIR_ONE: ComplexPair = [1, 0]
export const PAIR_I: ComplexPair = [0, 1]

export const pairAdd = (a: ComplexPair, b: ComplexPair): ComplexPair => [
  a[0] + b[0],
  a[1] + b[1],
]

export const pairSub = (a: ComplexPair, b: ComplexPair): ComplexPair => [
  a[0] - b[0],
  a[1] - b[1],
]

export const pairMul = (a: ComplexPair, b: ComplexPair): ComplexPair => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]

export const pairScale = (a: ComplexPair, s: number): ComplexPair => [
  a[0] * s,
  a[1] * s,
]

export const pairConj = (a: ComplexPair): ComplexPair => [a[0], -a[1]]

export const pairAbs2 = (a: ComplexPair): number =>
  a[0] * a[0] + a[1] * a[1]

export const pairFromPhase = (phase: number): ComplexPair => [
  Math.cos(phase),
  Math.sin(phase),
]
