// The root systems held as integers (E-MTH-0027). The base uses no real number, so a root system whose
// coordinates are half-integers (the F4 short roots, the spinor weights, the exceptional E8 node) is held in
// DOUBLED coordinates, where every coordinate is an integer and every inner product is four times the true
// one. A reflection is then an integer map: v - f a with f = 2 (v.a) / (a.a) the same in doubled
// coordinates as in true ones, and an integer for a crystallographic root system, taken here as an exact
// quotient that refuses a remainder rather than rounding it away.
//
// code/algebra/group/root-system is the real-valued face of the same objects (half-integers as floats, the
// icosahedron's golden ratio, normalized probe directions). It takes its integer root systems from here, and
// its half-integer ones equal these halved, which E-MTH-0027 proves entry for entry. The committed knit's
// path imports this file and not that one.

// the exact integer quotient of two integers, refusing a remainder
export function exactQuotient(numerator: number, denominator: number): number {
  const quotient = Math.trunc(numerator / denominator)

  if (quotient * denominator !== numerator) {
    throw new Error(`exactQuotient: ${numerator} is not a multiple of ${denominator}`)
  }

  return quotient
}

// The general D_n root system: all (+-1, +-1, 0, ..., 0), the 2n(n-1) roots of norm squared 2.
export function rootsDn(n: number): number[][] {
  const roots: number[][] = []

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (const si of [1, -1]) {
        for (const sj of [1, -1]) {
          const v = new Array<number>(n).fill(0)

          v[i] = si
          v[j] = sj
          roots.push(v)
        }
      }
    }
  }

  return roots
}

// The A_{n-1} roots embedded in Z^n: all e_i - e_j with i != j, the n(n-1) vectors of su(n).
export function rootsAn(n: number): number[][] {
  const roots: number[][] = []

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        const v = new Array<number>(n).fill(0)

        v[i] = 1
        v[j] = -1
        roots.push(v)
      }
    }
  }

  return roots
}

// D4, the 24 roots, all coordinate permutations of (+-1, +-1, 0, 0), the 24 directions of the dock.
export function rootsD4(): number[][] {
  const roots: number[][] = []

  for (let first = 0; first < 4; first++) {
    for (let second = first + 1; second < 4; second++) {
      for (const signFirst of [1, -1]) {
        for (const signSecond of [1, -1]) {
          const root = [0, 0, 0, 0]

          root[first] = signFirst
          root[second] = signSecond
          roots.push(root)
        }
      }
    }
  }

  return roots
}

// B4, the 32 roots of so(9): the 24 long D4 roots plus the 8 short axis roots (+-1, 0, 0, 0).
export function rootsB4(): number[][] {
  const roots: number[][] = rootsD4()

  for (let axis = 0; axis < 4; axis++) {
    for (const sign of [1, -1]) {
      const root = [0, 0, 0, 0]

      root[axis] = sign
      roots.push(root)
    }
  }

  return roots
}

// Integer dot product.
export function dotInteger(a: readonly number[], b: readonly number[]): number {
  let sum = 0

  for (let i = 0; i < a.length; i++) {
    sum += (a[i] ?? 0) * (b[i] ?? 0)
  }

  return sum
}

// All 2^n weights (+-1/2, ..., +-1/2) doubled to (+-1, ..., +-1), in the order of root-system's
// halfIntegerWeights (the + branch first at every coordinate).
export function doubledHalfIntegerWeights(n: number): number[][] {
  const weights: number[][] = []

  const build = (acc: number[]): void => {
    if (acc.length === n) {
      weights.push(acc)

      return
    }

    build([...acc, 1])
    build([...acc, -1])
  }

  build([])

  return weights
}

// The positive-chirality spinor weights of D_n doubled: (+-1)^n with an even number of minus signs.
export function doubledSpinorWeightsDn(n: number): number[][] {
  return doubledHalfIntegerWeights(n).filter(w => w.filter(x => x < 0).length % 2 === 0)
}

// F4, the 48 roots doubled: the 24 long D4 roots (+-2, +-2, 0, 0), the 8 short axis roots (+-2, 0, 0, 0),
// and the 16 short half-integer roots (+-1, +-1, +-1, +-1), in the order of root-system's rootsF4.
export function doubledRootsF4(): number[][] {
  const roots = rootsB4().map(root => root.map(x => 2 * x))

  for (const a of [1, -1]) {
    for (const b of [1, -1]) {
      for (const c of [1, -1]) {
        for (const d of [1, -1]) {
          roots.push([a, b, c, d])
        }
      }
    }
  }

  return roots
}

// The 8 simple roots of E8 in the Bourbaki basis, doubled: the exceptional node (1/2)(1, -1, ..., -1, 1)
// becomes (1, -1, -1, -1, -1, -1, -1, 1) and every integer root is multiplied by 2.
export function doubledE8SimpleRoots(): number[][] {
  const axis = (i: number): number[] => {
    const v = new Array<number>(8).fill(0)

    v[i] = 2

    return v
  }

  const minus = (a: number[], b: number[]): number[] => a.map((x, i) => x - (b[i] ?? 0))
  const plus = (a: number[], b: number[]): number[] => a.map((x, i) => x + (b[i] ?? 0))

  return [
    [1, -1, -1, -1, -1, -1, -1, 1],
    plus(axis(0), axis(1)),
    minus(axis(1), axis(0)),
    minus(axis(2), axis(1)),
    minus(axis(3), axis(2)),
    minus(axis(4), axis(3)),
    minus(axis(5), axis(4)),
    minus(axis(6), axis(5)),
  ]
}

// The reflection of v in the hyperplane perpendicular to root a, in integer (or doubled) coordinates:
// v - f a with f = 2 (v.a) / (a.a), an exact integer for a crystallographic pair (it refuses otherwise).
export function reflectInteger(v: readonly number[], a: readonly number[]): number[] {
  const f = exactQuotient(2 * dotInteger(v, a), dotInteger(a, a))

  return v.map((x, i) => x - f * (a[i] ?? 0))
}

// The closure of a set of integer (or doubled) roots under reflection in its own members, in the order
// root-system's reflectionClosure finds them, keyed by the exact coordinates.
export function reflectionClosureInteger(seed: readonly (readonly number[])[]): number[][] {
  const found = new Map<string, number[]>()

  const add = (vector: number[]): void => {
    const key = vector.join(',')

    if (!found.has(key)) {
      found.set(key, vector)
    }
  }

  for (const root of seed) {
    add([...root])
  }

  let changed = true

  while (changed) {
    changed = false

    const current = [...found.values()]

    for (const a of current) {
      for (const v of current) {
        const reflected = reflectInteger(v, a)

        if (!found.has(reflected.join(','))) {
          add(reflected)
          changed = true
        }
      }
    }
  }

  return [...found.values()]
}

// The 240 roots of E8, doubled.
export function doubledRootsE8(): number[][] {
  return reflectionClosureInteger(doubledE8SimpleRoots())
}

// The Cartan matrix of integer (or doubled) simple roots, A[i][j] = 2 (s_i . s_j) / (s_j . s_j), an exact
// integer (doubling scales both products by 4 and cancels).
export function cartanMatrixInteger(simpleRoots: readonly (readonly number[])[]): number[][] {
  return simpleRoots.map(si => simpleRoots.map(sj => exactQuotient(2 * dotInteger(si, sj), dotInteger(sj, sj))))
}
