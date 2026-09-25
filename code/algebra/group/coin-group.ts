// The 24 coin directions as a group. The D4 roots (+-1, +-1, 0, 0) are the vertices of a 24-cell,
// and one 24-cell is a group under quaternion multiplication: the Hurwitz units {+-1, +-i, +-j, +-k,
// (+-1 +-i +-j +-k) / 2}, the binary tetrahedral group 2T. Read as quaternions and scaled by 1 / sqrt 2,
// the roots are that group turned by the fixed unit q = (1 - i) / sqrt 2: q x is a Hurwitz unit for
// every root x. So the directions close under x o y = x q y, with the root (1, 1, 0, 0) as identity.
//
// 2T is isomorphic to SL(2, 3), the 2 x 2 matrices over Z_3 with determinant 1, which is the linear
// part of the qutrit Clifford group (code/measure/qutrit-phase-space). Both facts are checked here by
// computation: closure, and an explicit isomorphism found by search over generator images.

export type Quaternion = readonly [number, number, number, number]

export function quaternionProduct(a: Quaternion, b: Quaternion): Quaternion {
  const [a0, a1, a2, a3] = a
  const [b0, b1, b2, b3] = b

  return [
    a0 * b0 - a1 * b1 - a2 * b2 - a3 * b3,
    a0 * b1 + a1 * b0 + a2 * b3 - a3 * b2,
    a0 * b2 - a1 * b3 + a2 * b0 + a3 * b1,
    a0 * b3 + a1 * b2 - a2 * b1 + a3 * b0,
  ]
}

function keyOf(q: Quaternion): string {
  return q.map(x => Math.round(x * 1e6) || 0).join(',')
}

// The coin's group: each direction's index, and the product table of x o y = x q y.
export function coinGroup(input: { directions: readonly (readonly number[])[] }): {
  identity: number
  product: Int8Array
  closed: boolean
  hurwitz: boolean
} {
  const n = input.directions.length
  const s = 1 / Math.sqrt(2)
  const units: Quaternion[] = input.directions.map(d => [(d[0] ?? 0) * s, (d[1] ?? 0) * s, (d[2] ?? 0) * s, (d[3] ?? 0) * s])
  const q: Quaternion = [s, -s, 0, 0]
  const index = new Map(units.map((u, k) => [keyOf(u), k]))
  const product = new Int8Array(n * n)
  let closed = true

  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      const found = index.get(keyOf(quaternionProduct(quaternionProduct(units[a] ?? q, q), units[b] ?? q)))

      if (found === undefined) {
        closed = false
      }

      product[a * n + b] = found ?? -1
    }
  }

  // every q x is a Hurwitz unit: all coordinates 0 or +-1, or all +-1/2
  const hurwitz = units.every(u => {
    const r = quaternionProduct(q, u).map(x => Math.round(x * 2) / 2)

    return r.every(x => x === 0 || Math.abs(x) === 1) || r.every(x => Math.abs(x) === 0.5)
  })
  const identity = index.get(keyOf([s, s, 0, 0])) ?? -1

  return { identity, product, closed, hurwitz }
}

// SL(2, 3): its 24 matrices [a, b, c, d] (row major, entries 0 .. 2) and product table.
type Matrix22 = [number, number, number, number]

const IDENTITY_22: Matrix22 = [1, 0, 0, 1]

export function specialLinear23(): { matrices: Matrix22[]; product: Int8Array; identity: number } {
  const matrices: Matrix22[] = []

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      for (let c = 0; c < 3; c++) {
        for (let d = 0; d < 3; d++) {
          if ((((a * d - b * c) % 3) + 3) % 3 === 1) {
            matrices.push([a, b, c, d])
          }
        }
      }
    }
  }

  const key = (m: readonly number[]): string => m.join(',')
  const index = new Map(matrices.map((m, k) => [key(m), k]))
  const n = matrices.length
  const product = new Int8Array(n * n)

  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      const [a, b, c, d] = matrices[x] ?? IDENTITY_22
      const [e, f, g, h] = matrices[y] ?? IDENTITY_22
      const m = [(a * e + b * g) % 3, (a * f + b * h) % 3, (c * e + d * g) % 3, (c * f + d * h) % 3]

      product[x * n + y] = index.get(key(m)) ?? -1
    }
  }

  return { matrices, product, identity: index.get('1,0,0,1') ?? -1 }
}

// Every isomorphism between two groups of the same order given by product tables, found by choosing
// images for a generating pair of the first and extending along words, keeping those that are
// bijective and multiplicative on every pair. Returns how many there are.
export function countIsomorphisms(input: {
  first: { product: Int8Array; identity: number }
  second: { product: Int8Array; identity: number }
  order: number
  generators: readonly [number, number]
}): number {
  const { first, second, order, generators } = input
  const mul1 = (a: number, b: number): number => first.product[a * order + b] ?? -1
  const mul2 = (a: number, b: number): number => second.product[a * order + b] ?? -1
  let count = 0

  for (let x = 0; x < order; x++) {
    for (let y = 0; y < order; y++) {
      const map = new Array<number>(order).fill(-1)

      map[first.identity] = second.identity

      const queue = [first.identity]
      let consistent = true

      while (queue.length > 0 && consistent) {
        const g = queue.shift() ?? 0

        for (const [s, image] of [
          [generators[0], x],
          [generators[1], y],
        ] as const) {
          const next = mul1(g, s)
          const value = mul2(map[g] ?? 0, image)

          if (map[next] === -1) {
            map[next] = value
            queue.push(next)
          } else if (map[next] !== value) {
            consistent = false
          }
        }
      }

      if (!consistent || map.includes(-1) || new Set(map).size !== order) {
        continue
      }

      let multiplicative = true

      for (let a = 0; a < order && multiplicative; a++) {
        for (let b = 0; b < order && multiplicative; b++) {
          multiplicative = map[mul1(a, b)] === mul2(map[a] ?? 0, map[b] ?? 0)
        }
      }

      count += multiplicative ? 1 : 0
    }
  }

  return count
}
