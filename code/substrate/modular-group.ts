// The modular group PSL(2, Z): the parameter-free hyperbolic base. Elements are 2x2
// integer matrices [a, b, c, d] taken modulo the overall sign, BFS-generated from the
// S / T generators to closure, and embedded in the Poincare disc by acting on an
// interior base point. The generation is pure integer arithmetic with no randomness,
// so the same builder is the deterministic automaton growing the base from the
// integers. Continued-fraction (Stern-Brocot) addressing reaches every rational.

import { Embedding, ManifoldSpec } from '@/code/tool/embedding'
import { makeGraph, Graph } from '@/code/tool/graph'

export type IntegerMatrix = [number, number, number, number] // a, b, c, d

// Normalize a PSL(2, Z) matrix (mod the overall sign) for deduplication.
export function normalizeModularMatrix(m: IntegerMatrix): string {
  let [a, b, c, d] = m
  if (a < 0 || (a === 0 && b < 0) || (a === 0 && b === 0 && c < 0)) {
    a = -a
    b = -b
    c = -c
    d = -d
  }
  return `${a},${b},${c},${d}`
}

// Multiply two integer 2x2 matrices.
export function multiplyIntegerMatrix(m: IntegerMatrix, n: IntegerMatrix): IntegerMatrix {
  return [
    m[0] * n[0] + m[1] * n[2],
    m[0] * n[1] + m[1] * n[3],
    m[2] * n[0] + m[3] * n[2],
    m[2] * n[1] + m[3] * n[3],
  ]
}

// Build the modular tessellation as the PSL(2, Z) Cayley graph, embedded in the
// Poincare disc by acting on an interior base point z0 in the upper half-plane.
export function modularGraph(maxNodes: number): Graph {
  const S: IntegerMatrix = [0, -1, 1, 0]
  const T: IntegerMatrix = [1, 1, 0, 1]
  const Ti: IntegerMatrix = [1, -1, 0, 1]
  const gens = [S, T, Ti]
  const I: IntegerMatrix = [1, 0, 0, 1]
  const index = new Map<string, number>()
  const mats: IntegerMatrix[] = []
  const add = (m: IntegerMatrix): number => {
    const k = normalizeModularMatrix(m)
    let i = index.get(k)
    if (i === undefined) {
      i = mats.length
      index.set(k, i)
      mats.push(m)
    }
    return i
  }
  add(I)
  const neighbors: number[][] = [[]]
  let frontier = [0]
  while (frontier.length > 0 && mats.length < maxNodes) {
    const next: number[] = []
    for (const gi of frontier) {
      if (mats.length >= maxNodes) {
        break
      }
      const g = mats[gi]!
      for (const gen of gens) {
        const h = multiplyIntegerMatrix(g, gen)
        const before = mats.length
        const hi = add(h)
        if (hi >= neighbors.length) {
          neighbors.push([])
        }
        if (!(neighbors[gi] ?? []).includes(hi) && hi !== gi) {
          neighbors[gi]!.push(hi)
          neighbors[hi]!.push(gi)
        }
        if (hi === before && mats.length < maxNodes) {
          next.push(hi)
        }
      }
    }
    frontier = next
  }

  // Embed: z0 interior, w = (z - i)/(z + i) maps the upper half-plane to the disc.
  const z0re = 0.0
  const z0im = 1.7
  const n = mats.length
  const coords = new Float64Array(n * 2)
  for (let i = 0; i < n; i++) {
    const [a, b, c, d] = mats[i]!
    // z = (a z0 + b)/(c z0 + d), complex.
    const numRe = a * z0re + b
    const numIm = a * z0im
    const denRe = c * z0re + d
    const denIm = c * z0im
    const den2 = denRe * denRe + denIm * denIm
    const zre = (numRe * denRe + numIm * denIm) / den2
    const zim = (numIm * denRe - numRe * denIm) / den2
    // w = (z - i)/(z + i)
    const wnumRe = zre
    const wnumIm = zim - 1
    const wdenRe = zre
    const wdenIm = zim + 1
    const wden2 = wdenRe * wdenRe + wdenIm * wdenIm
    coords[i * 2] = (wnumRe * wdenRe + wnumIm * wdenIm) / wden2
    coords[i * 2 + 1] = (wnumIm * wdenRe - wnumRe * wdenIm) / wden2
  }
  const manifold: ManifoldSpec = { form: 'hyperbolic', dimension: 2, curvature: -1 }
  const embedding: Embedding = { form: 'embedding', dimension: 2, signature: 'riemannian', coords, manifold }
  return makeGraph({ size: n, directed: false, neighbors, embedding })
}

// The Stern-Brocot mediant rule: address a rational by its continued fraction.
// [a0; a1, a2, ...] corresponds to a0 rights, a1 lefts, ... in the Stern-Brocot tree,
// the last term consuming one fewer step to land exactly on the rational. Returns the
// rational reached. The golden ratio is the all-ones continued fraction (Fibonacci
// convergents).
export function rationalFromContinuedFraction(cf: number[]): { num: number; den: number } {
  let ln = 0
  let ld = 1
  let rn = 1
  let rd = 0
  let mn = 1
  let md = 1
  let goRight = true
  for (let k = 0; k < cf.length; k++) {
    let steps = cf[k] ?? 0
    if (k === cf.length - 1) {
      steps -= 1
    }
    for (let s = 0; s < steps; s++) {
      if (goRight) {
        ln = mn
        ld = md
      } else {
        rn = mn
        rd = md
      }
      mn = ln + rn
      md = ld + rd
    }
    goRight = !goRight
  }
  return { num: mn, den: md }
}
