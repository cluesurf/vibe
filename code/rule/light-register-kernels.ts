// Exact integer kernels for a vibe meeting a light register in the signed whole (E-FRC-0223 to 0226): the flow
// update SUM, the smallest Gauss-safe non-Clifford coupling w^(v^2 a), and the fear beat's swap phase, each as the
// Wigner kernel K / divisor of code/rule/fear-kernel-exact (two qutrits, point index 9 x1 + x2, x = 3 a + b, a the
// position). Also the one-meeting map of an emitter's whole with a fresh vacuum register (the register traced, as
// the stream carries it away), in BigInt weights over a common grain.
//
// Integers only: the unitaries have entries in Z[w]; the kernels are integers over their divisor; the emitter's
// whole is integers over a grain, reduced by their gcd.

import { doubledSwapPhase, exactWholeKernel, type Eisenstein } from '@/code/rule/fear-kernel-exact'

export type Kernel = { divisor: number; kernel: number[][] }

export type Whole = { w: bigint[]; grain: bigint }

const OMEGA_POWER: readonly [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, -1],
]

const empty = (): Eisenstein => ({ n: 9, a: new Int32Array(81), b: new Int32Array(81) })

// |v, a> -> |v, a + sign v>, v read balanced (index 2 is -1), index 3 v + a
export function sumMatrix(sign: number): Eisenstein {
  const u = empty()

  for (let v = 0; v < 3; v++) for (let a = 0; a < 3; a++) u.a[(3 * v + ((a + sign * v + 9) % 3)) * 9 + 3 * v + a] = 1

  return u
}

// w^(sign v^2 a), diagonal
export function cubicPhaseMatrix(sign: number): Eisenstein {
  const u = empty()

  for (let v = 0; v < 3; v++) {
    for (let a = 0; a < 3; a++) {
      const [x, y] = OMEGA_POWER[(((sign * v * v * a) % 3) + 3) % 3]!

      u.a[(3 * v + a) * 10] = x
      u.b[(3 * v + a) * 10] = y
    }
  }

  return u
}

export const sumKernel = (sign = 1): Kernel => exactWholeKernel(sumMatrix(sign), 1)

export const cubicPhaseKernel = (sign = 1): Kernel => exactWholeKernel(cubicPhaseMatrix(sign), 1)

// the swap phase P_sym + w^k P_anti (k = 1 the fear beat, k = 2 its inverse)
export const swapPhaseKernel = (k = 1): Kernel => exactWholeKernel(doubledSwapPhase(k), 2)

export const applyKernel = (k: Kernel, w: readonly number[]): number[] => k.kernel.map(row => row.reduce((s, x, j) => s + x * w[j]!, 0))

// the 12 stabilizer states of a qutrit: the 12 lines of Z_3^2, weight 1 on each of its points (grain 3)
export function stabilizerLines(): number[][] {
  const lines: number[][] = []

  for (const [da, db] of [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, 2],
  ] as const) {
    for (let offset = 0; offset < 3; offset++) {
      const w = new Array<number>(9).fill(0)
      const a0 = da === 0 ? offset : 0
      const b0 = da === 0 ? 0 : offset

      for (let t = 0; t < 3; t++) w[3 * ((a0 + t * da) % 3) + ((b0 + t * db) % 3)] = 1

      lines.push(w)
    }
  }

  return lines
}

const gcd = (x: bigint, y: bigint): bigint => {
  let p = x < 0n ? -x : x
  let q = y < 0n ? -y : y

  while (q !== 0n) [p, q] = [q, p % q]

  return p
}

// The exact whole of rho = [[1 - P, c, 0], [c, P, 0], [0, 0, 0]], P = pn / den, c = cn / den (a real qubit in the
// qutrit's levels 0 and 1): 6 den W(a, b) = sum_j (den rho(j, 2a - j)) (2 if 2 b (a - j) = 0 mod 3, else -1), since
// the imaginary parts cancel in pairs and Re w^m is 1 or -1/2
export function qubitWhole(pn: number, cn: number, den: number): Whole {
  const rho = [
    [den - pn, cn, 0],
    [cn, pn, 0],
    [0, 0, 0],
  ]
  const w: bigint[] = []

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      let s = 0

      for (let j = 0; j < 3; j++) s += rho[j]![(((2 * a - j) % 3) + 3) % 3]! * ((((2 * b * (a - j)) % 3) + 3) % 3 === 0 ? 2 : -1)

      w.push(BigInt(s))
    }
  }

  return { w, grain: BigInt(6 * den) }
}

// one meeting of the emitter (first register) with a fresh register in the whole `fresh` (9 integer weights over
// grain `freshGrain`), the register then traced; reduced by the gcd
export function meetFresh(k: Kernel, e: Whole, fresh: readonly number[] = [1, 1, 1, 0, 0, 0, 0, 0, 0], freshGrain = 3n): Whole {
  const out = new Array<bigint>(9).fill(0n)

  for (let x1 = 0; x1 < 9; x1++) {
    for (let x2 = 0; x2 < 9; x2++) {
      let s = 0n

      for (let y1 = 0; y1 < 9; y1++) {
        if (e.w[y1] === 0n) continue

        for (let y2 = 0; y2 < 9; y2++) {
          if (fresh[y2] === 0) continue

          s += BigInt(k.kernel[9 * x1 + x2]![9 * y1 + y2]! * fresh[y2]!) * e.w[y1]!
        }
      }

      out[x1] = out[x1]! + s
    }
  }

  let grain = e.grain * freshGrain * BigInt(k.divisor)
  const common = out.reduce((g, x) => gcd(g, x), grain)

  grain /= common

  return { w: out.map(x => x / common), grain }
}

// the chance of level 1 (the line a = 1), as its numerator over the grain
export const levelOne = (w: readonly bigint[]): bigint => w[3]! + w[4]! + w[5]!
