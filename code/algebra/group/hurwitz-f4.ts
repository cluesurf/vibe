// W(F4), the Hurwitz units and SL(2,3), in exact integer arithmetic (E-MTH-0008, E-MTH-0009).
//
// Every F4 reflection has entries in Z / 2, so a group element is stored DOUBLED: 2 g, an integer 4 x 4
// matrix, and products divide by 2 exactly. Quaternions a + b i + c j + d k are stored doubled the same way,
// so the Hurwitz units (+-1, +-i, +-j, +-k, (+-1 +-i +-j +-k) / 2) are integer 4-vectors.

export type DoubledMatrix = Int32Array
export type DoubledQuaternion = readonly [number, number, number, number]

export const DOUBLED_IDENTITY: DoubledMatrix = Int32Array.from({ length: 16 }, (_, i) => (i % 5 === 0 ? 2 : 0))

export const matrixKey = (m: DoubledMatrix): string => m.join(',')

export function multiplyDoubled(a: DoubledMatrix, b: DoubledMatrix): DoubledMatrix {
  const out = new Int32Array(16)

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let s = 0

      for (let k = 0; k < 4; k++) {
        s += a[i * 4 + k]! * b[k * 4 + j]!
      }

      if (s % 2 !== 0) {
        throw new Error('a doubled product is odd')
      }

      out[i * 4 + j] = s / 2
    }
  }

  return out
}

// the 48 F4 roots, doubled: 8 short 2 e_i, 16 short (+-1)^4 (the half-integer vectors), 24 long 2 (e_i +- e_j)
export function f4Roots(): number[][] {
  const roots: number[][] = []

  for (let i = 0; i < 4; i++) {
    for (const s of [2, -2]) {
      roots.push([0, 1, 2, 3].map(j => (j === i ? s : 0)))
    }
  }

  for (let m = 0; m < 16; m++) {
    roots.push([0, 1, 2, 3].map(j => ((m >> j) & 1 ? -1 : 1)))
  }

  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const a of [2, -2]) {
        for (const b of [2, -2]) {
          roots.push([0, 1, 2, 3].map(k => (k === i ? a : k === j ? b : 0)))
        }
      }
    }
  }

  return roots
}

export const isLongRoot = (r: readonly number[]): boolean => r.reduce((s, x) => s + x * x, 0) === 8

export function doubledReflection(r: readonly number[]): DoubledMatrix {
  const rr = r.reduce((s, x) => s + x * x, 0)
  const m = new Int32Array(16)

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      m[i * 4 + j] = Math.round(2 * ((i === j ? 1 : 0) - (2 * r[i]! * r[j]!) / rr))
    }
  }

  return m
}

export function doubledClosure(generators: readonly DoubledMatrix[]): Map<string, DoubledMatrix> {
  const seen = new Map<string, DoubledMatrix>([[matrixKey(DOUBLED_IDENTITY), DOUBLED_IDENTITY]])
  let frontier = [DOUBLED_IDENTITY]

  while (frontier.length > 0) {
    const next: DoubledMatrix[] = []

    for (const g of frontier) {
      for (const s of generators) {
        const h = multiplyDoubled(s, g)
        const k = matrixKey(h)

        if (!seen.has(k)) {
          seen.set(k, h)
          next.push(h)
        }
      }
    }

    frontier = next
  }

  return seen
}

// det(I - t g) for the top-left n x n block of a doubled matrix, integer coefficients (Faddeev-LeVerrier)
export function oneMinusDeterminant(m: DoubledMatrix, n = 4): number[] {
  const g = Array.from({ length: n * n }, (_, i) => m[Math.floor(i / n) * 4 + (i % n)]! / 2)
  let mk: number[] = Array.from({ length: n * n }, (_, i) => (i % (n + 1) === 0 ? 1 : 0))
  const c = [1]

  for (let k = 1; k <= n; k++) {
    const am = Array<number>(n * n).fill(0)

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let s = 0

        for (let l = 0; l < n; l++) {
          s += g[i * n + l]! * mk[l * n + j]!
        }

        am[i * n + j] = s
      }
    }

    let trace = 0

    for (let i = 0; i < n; i++) {
      trace += am[i * n + i]!
    }

    const ck = -trace / k

    c.push(Math.round(ck))
    mk = am.map((x, i) => x + (i % (n + 1) === 0 ? ck : 0))
  }

  return c
}

// h_0 .. h_count of 1 / det(I - t g): the characters of the symmetric powers
export function symmetricPowerTraces(determinant: readonly number[], count: number): number[] {
  const h = [1]

  for (let n = 1; n <= count; n++) {
    let s = 0

    for (let k = 1; k < determinant.length && k <= n; k++) {
      s -= determinant[k]! * h[n - k]!
    }

    h.push(s)
  }

  return h
}

export type MolienReport = {
  // the Molien series coefficients, exact (group averages of integers, checked integral)
  readonly series: number[]
  readonly order: number
  // dim Hom_G(Sym^4 V, Sym^2 V): the quartic matrix-valued covariants
  readonly quarticCovariants: number
  // multiplicity of the traceless quadratics inside the harmonic quartics: the anisotropic quartic covariants
  readonly anisotropicQuarticCovariants: number
}

export function molien(group: Iterable<DoubledMatrix>, dimension: number, count: number): MolienReport {
  const total = Array<number>(count + 1).fill(0)
  let order = 0
  let quartic = 0
  let anisotropic = 0

  for (const g of group) {
    const h = symmetricPowerTraces(oneMinusDeterminant(g, dimension), count)

    h.forEach((x, i) => (total[i] = total[i]! + x))
    quartic += h[4]! * h[2]!
    anisotropic += (h[4]! - h[2]!) * (h[2]! - 1)
    order++
  }

  return { series: total.map(x => x / order), order, quarticCovariants: quartic / order, anisotropicQuarticCovariants: anisotropic / order }
}

// the series of 1 / prod (1 - t^d)
export function degreeSeries(degrees: readonly number[], count: number): number[] {
  let s = Array<number>(count + 1).fill(0)

  s[0] = 1

  for (const d of degrees) {
    const next = [...s]

    for (let i = d; i <= count; i++) {
      next[i] = next[i]! + next[i - d]!
    }

    s = next
  }

  return s
}

export function multiplyQuaternions(p: DoubledQuaternion, q: DoubledQuaternion): DoubledQuaternion {
  const [a1, b1, c1, d1] = p
  const [a2, b2, c2, d2] = q

  return [
    (a1 * a2 - b1 * b2 - c1 * c2 - d1 * d2) / 2,
    (a1 * b2 + b1 * a2 + c1 * d2 - d1 * c2) / 2,
    (a1 * c2 - b1 * d2 + c1 * a2 + d1 * b2) / 2,
    (a1 * d2 + b1 * c2 - c1 * b2 + d1 * a2) / 2,
  ]
}

export const quaternionKey = (q: DoubledQuaternion): string => q.join(',')

// the 24 Hurwitz units, doubled: the short F4 roots
export function hurwitzUnits(): DoubledQuaternion[] {
  return f4Roots()
    .filter(r => !isLongRoot(r))
    .map(r => [r[0]!, r[1]!, r[2]!, r[3]!] as const)
}

export const OMEGA_QUATERNION: DoubledQuaternion = [-1, 1, 1, 1]
export const I_QUATERNION: DoubledQuaternion = [0, 2, 0, 0]
export const ONE_QUATERNION: DoubledQuaternion = [2, 0, 0, 0]

export function quaternionOrder(q: DoubledQuaternion): number {
  let p = q
  let n = 1

  while (quaternionKey(p) !== quaternionKey(ONE_QUATERNION)) {
    p = multiplyQuaternions(p, q)
    n++
  }

  return n
}

// x -> q x and x -> x q as doubled matrices
export function leftMultiplication(q: DoubledQuaternion): DoubledMatrix {
  const m = new Int32Array(16)

  for (let j = 0; j < 4; j++) {
    const e = [0, 0, 0, 0].map((_, i) => (i === j ? 2 : 0)) as unknown as DoubledQuaternion
    const image = multiplyQuaternions(q, e)

    for (let i = 0; i < 4; i++) {
      m[i * 4 + j] = image[i]!
    }
  }

  return m
}

export function rightMultiplication(q: DoubledQuaternion): DoubledMatrix {
  const m = new Int32Array(16)

  for (let j = 0; j < 4; j++) {
    const e = [0, 0, 0, 0].map((_, i) => (i === j ? 2 : 0)) as unknown as DoubledQuaternion
    const image = multiplyQuaternions(e, q)

    for (let i = 0; i < 4; i++) {
      m[i * 4 + j] = image[i]!
    }
  }

  return m
}

// SL(2,3) as [a, b, c, d] mod 3, the linear part of the role grid's 216 moves (code/rule/vibe-weave)
export type Mod3Matrix = readonly [number, number, number, number]

const mod3 = (x: number): number => ((x % 3) + 3) % 3

export function multiplyMod3(p: Mod3Matrix, q: Mod3Matrix): Mod3Matrix {
  return [mod3(p[0] * q[0] + p[1] * q[2]), mod3(p[0] * q[1] + p[1] * q[3]), mod3(p[2] * q[0] + p[3] * q[2]), mod3(p[2] * q[1] + p[3] * q[3])]
}

export function specialLinearMod3(): Mod3Matrix[] {
  const out: Mod3Matrix[] = []

  for (let m = 0; m < 81; m++) {
    const s = [0, 1, 2, 3].map(k => Math.floor(m / 3 ** k) % 3) as unknown as Mod3Matrix

    if (mod3(s[0] * s[3] - s[1] * s[2]) === 1) {
      out.push(s)
    }
  }

  return out
}

export function mod3Order(s: Mod3Matrix): number {
  let p = s
  let n = 1

  while (p.join('') !== '1001') {
    p = multiplyMod3(p, s)
    n++
  }

  return n
}

// every isomorphism 2T -> SL(2,3), found by choosing images of the generators i and omega and extending over
// words: a choice counts when the extension is well defined on all 24 units and injective
export function binaryTetrahedralIsomorphisms(): number {
  const targets = specialLinearMod3()
  let count = 0

  for (const a of targets) {
    for (const b of targets) {
      const image = new Map<string, Mod3Matrix>([[quaternionKey(ONE_QUATERNION), [1, 0, 0, 1]]])
      let frontier: [DoubledQuaternion, Mod3Matrix][] = [[ONE_QUATERNION, [1, 0, 0, 1]]]
      let consistent = true

      while (frontier.length > 0 && consistent) {
        const next: [DoubledQuaternion, Mod3Matrix][] = []

        for (const [q, s] of frontier) {
          for (const [gq, gs] of [
            [I_QUATERNION, a],
            [OMEGA_QUATERNION, b],
          ] as const) {
            const q2 = multiplyQuaternions(q, gq)
            const s2 = multiplyMod3(s, gs)
            const have = image.get(quaternionKey(q2))

            if (have) {
              consistent = consistent && have.join('') === s2.join('')
            } else {
              image.set(quaternionKey(q2), s2)
              next.push([q2, s2])
            }
          }
        }

        frontier = next
      }

      if (consistent && image.size === 24 && new Set([...image.values()].map(s => s.join(''))).size === 24) {
        count++
      }
    }
  }

  return count
}

// how many elements have each order, keyed in increasing order
export function orderCensus(orders: readonly number[]): Record<string, number> {
  const out: Record<string, number> = {}

  for (const o of [...orders].sort((a, b) => a - b)) {
    out[`order${o}`] = (out[`order${o}`] ?? 0) + 1
  }

  return out
}
