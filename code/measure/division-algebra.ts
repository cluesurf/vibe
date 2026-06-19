// The Cayley-Dickson tower of normed algebras, R, C, H, O, S (the reals, complexes, quaternions, octonions,
// sedenions), and where it stops being a division algebra. Each level doubles the previous one. The norm composition
// property |xy| = |x| |y| (so no zero divisors, a division algebra) holds for the reals, complexes, quaternions, and
// octonions (Hurwitz's theorem), and FAILS at the sedenions (dimension 16), which have zero divisors. So the OCTONIONS
// (dimension 8) are the unique MAXIMAL normed division algebra, the seed the base-generator program descends from.

// the conjugate in the Cayley-Dickson construction, conj(a, b) = (conj(a), -b)
export function cayleyConjugate(x: number[]): number[] {
  if (x.length === 1) {
    return [x[0]!]
  }
  const half = x.length / 2
  return [
    ...cayleyConjugate(x.slice(0, half)),
    ...x.slice(half).map(v => -v),
  ]
}

// the product in the Cayley-Dickson construction, (a, b)(c, d) = (ac - conj(d) b, d a + b conj(c)). The dimension is
// the (power-of-two) length of the inputs.
export function cayleyMultiply(x: number[], y: number[]): number[] {
  if (x.length === 1) {
    return [x[0]! * y[0]!]
  }
  const half = x.length / 2
  const a = x.slice(0, half)
  const b = x.slice(half)
  const c = y.slice(0, half)
  const d = y.slice(half)
  const low = cayleyMultiply(a, c).map(
    (v, i) => v - cayleyMultiply(cayleyConjugate(d), b)[i]!,
  )
  const high = cayleyMultiply(d, a).map(
    (v, i) => v + cayleyMultiply(b, cayleyConjugate(c))[i]!,
  )
  return [...low, ...high]
}

export function normSquared(x: number[]): number {
  return x.reduce((s, v) => s + v * v, 0)
}

function unit(dimension: number, index: number): number[] {
  const v = new Array<number>(dimension).fill(0)
  v[index] = 1
  return v
}

// whether the level-n Cayley-Dickson algebra (dimension 2^n) has a zero divisor, two nonzero elements whose product is
// zero. Searched over sums of two basis units, which is where the sedenion zero divisors live.
export function hasZeroDivisor(level: number): boolean {
  const dimension = 2 ** level
  for (let i = 1; i < dimension; i++) {
    for (let j = i + 1; j < dimension; j++) {
      for (let k = 1; k < dimension; k++) {
        for (let l = k + 1; l < dimension; l++) {
          const x = unit(dimension, i).map(
            (v, m) => v + unit(dimension, j)[m]!,
          )
          const y = unit(dimension, k).map(
            (v, m) => v + unit(dimension, l)[m]!,
          )
          if (normSquared(cayleyMultiply(x, y)) === 0) {
            return true
          }
        }
      }
    }
  }
  return false
}

// whether the level-n algebra satisfies norm composition |xy|^2 = |x|^2 |y|^2 on a deterministic test set (a
// necessary condition for a division algebra, equivalent to no zero divisors here)
export function hasNormComposition(level: number): boolean {
  const dimension = 2 ** level
  const sample = (offset: number): number[] =>
    Array.from(
      { length: dimension },
      (_, i) => ((i * 7 + offset) % 11) - 5,
    )
  // test several distinct pairs, including basis-unit sums where zero divisors appear
  for (let off = 0; off < 5; off++) {
    const x = sample(off)
    const y = sample(off + 3)
    if (
      normSquared(cayleyMultiply(x, y)) !==
      normSquared(x) * normSquared(y)
    ) {
      return false
    }
  }
  // also test the basis-unit-sum pairs (the zero-divisor candidates)
  for (let i = 1; i < dimension; i++) {
    for (let j = i + 1; j < Math.min(dimension, i + 12); j++) {
      const x = unit(dimension, i).map(
        (v, m) => v + unit(dimension, j)[m]!,
      )
      for (let k = 1; k < dimension; k++) {
        for (let l = k + 1; l < Math.min(dimension, k + 12); l++) {
          const y = unit(dimension, k).map(
            (v, m) => v + unit(dimension, l)[m]!,
          )
          if (
            normSquared(cayleyMultiply(x, y)) !==
            normSquared(x) * normSquared(y)
          ) {
            return false
          }
        }
      }
    }
  }
  return true
}

// the octonion triality core, whether the trilinear form Re((xy)z) is cyclically (Z3) symmetric (the octonion
// realization of the order-three Spin(8) triality), tested on a deterministic distinct triple
export function octonionTrialityCyclic(): boolean {
  const u = (i: number): number[] => unit(8, i)
  const add = (a: number[], b: number[]): number[] =>
    a.map((v, i) => v + b[i]!)
  const x = add(u(1), u(4))
  const y = add(u(2), u(6))
  const z = add(u(3), u(5))
  const re = (v: number[]): number => v[0]!
  const f1 = re(cayleyMultiply(cayleyMultiply(x, y), z))
  const f2 = re(cayleyMultiply(cayleyMultiply(y, z), x))
  const f3 = re(cayleyMultiply(cayleyMultiply(z, x), y))
  return f1 === f2 && f2 === f3
}

// the number of imaginary unit triples (i < j < k) whose associator is nonzero (the non-associative Fano structure),
// out of the 35 triples
export function nonAssociativeTripleCount(): number {
  const u = (i: number): number[] => unit(8, i)
  let count = 0
  for (let i = 1; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      for (let k = j + 1; k < 8; k++) {
        const associator = cayleyMultiply(
          cayleyMultiply(u(i), u(j)),
          u(k),
        ).map(
          (v, m) =>
            v - cayleyMultiply(u(i), cayleyMultiply(u(j), u(k)))[m]!,
        )
        if (associator.some(v => v !== 0)) {
          count++
        }
      }
    }
  }
  return count
}
