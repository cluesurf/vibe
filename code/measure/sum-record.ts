// SUM records: the qutrit SUM gate as a record of a role, read on the grid (E-QTM-0127 to E-QTM-0130).
//
// E-QTM-0114 and E-QTM-0116 found the model has no rule that READS a role without WRITING one: every
// coupling is the fear beat, a partial swap that commutes with no local observable. The candidate here is
// SUM, |a>|b> -> |a>|a + b>, a two-role Clifford (E-QTM-0118). A Clifford moves the discrete Wigner function
// by an affine symplectic permutation of the joint grid points (Gross 2006), so a knot's loves and fears ride
// along unchanged and a deterministic knit can carry it exactly.
//
// Nothing here is assumed about how SUM acts on the grid: kernelPermutation reads the permutation off the
// Wigner kernel of the SUM operator itself (code/rule/fear-weave's wignerKernel, the kernel every meeting of
// the fear weave is built from), and symplecticCheck confirms it is affine and keeps the symplectic form.
//
// Conventions follow code/rule/fear-weave: a grid point p = 3 a + b holds role a = floor(p / 3) and tilt
// b = p % 3; two roles index 9 p1 + p2, the first the most significant; a whole's coordinates are its tokens
// in order, most significant first.
//
// Pieces:
// - sumOperator, kernelPermutation, symplecticCheck: the gate and its grid permutation
// - LINE_CLASSES and readerPermutation: the 4 parallel classes of the 12 grid lines, and the SUM conjugated
//   by a one-role symplectic map S that turns a class into the role lines, so the record's role reads which
//   line of that class the system sits on
// - openToken, permuteTwo, traceOut, marginalOne: bigint whole operations (exact)
// - lagrangianPlanes: the 40 isotropic planes of Z3^4, whose 360 cosets are the two-role stabilizer readings
// - lineProjector: the eigenprojectors of a displacement, an operator reading of a line class that does not
//   go through the phase-point operators

import { operator, multiplyOperators, type Operator } from '@/code/measure/grid-weights'
import { displacementOperators } from '@/code/measure/qutrit-clifford'
import { wignerKernel, type Whole } from '@/code/rule/fear-weave'

const mod3 = (x: number): number => ((x % 3) + 3) % 3
const KERNEL_TOLERANCE = 1e-9

// a grid point as (role, tilt)
export const pointVector = (p: number): [number, number] => [Math.floor(p / 3), p % 3]
export const vectorPoint = (a: number, b: number): number => 3 * mod3(a) + mod3(b)

// SUM on two roles, index 3 a + b: |a, b> -> |a, a + b>, the first role the control
export function sumOperator(): Operator {
  const u = operator(9)

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      u.re[(3 * a + mod3(a + b)) * 9 + (3 * a + b)] = 1
    }
  }

  return u
}

// the permutation a two-role unitary makes of the 81 joint grid points, perm[source] = image, read off its
// Wigner kernel; null when the kernel is not a 0/1 permutation matrix (the unitary is not Clifford)
export function kernelPermutation(u: Operator): Int16Array | null {
  const k = wignerKernel(u)
  const perm = new Int16Array(81).fill(-1)
  const hit = new Uint8Array(81)

  for (let c = 0; c < 81; c++) {
    for (let r = 0; r < 81; r++) {
      const x = k[r]?.[c] ?? 0

      if (Math.abs(x) < KERNEL_TOLERANCE) {
        continue
      }

      if (Math.abs(x - 1) > KERNEL_TOLERANCE || perm[c] !== -1 || hit[r] === 1) {
        return null
      }

      perm[c] = r
      hit[r] = 1
    }

    if (perm[c] === -1) {
      return null
    }
  }

  return perm
}

// the joint point of two roles as (a1, b1, a2, b2)
const jointVector = (j: number): number[] => [...pointVector(Math.floor(j / 9)), ...pointVector(j % 9)]
const jointIndex = (v: readonly number[]): number => 9 * vectorPoint(v[0] ?? 0, v[1] ?? 0) + vectorPoint(v[2] ?? 0, v[3] ?? 0)

// the symplectic form of two roles, [x, y] = a1 b1' - b1 a1' + a2 b2' - b2 a2' mod 3
export function jointForm(x: number, y: number): number {
  const u = jointVector(x)
  const v = jointVector(y)

  return mod3((u[0] ?? 0) * (v[1] ?? 0) - (u[1] ?? 0) * (v[0] ?? 0) + (u[2] ?? 0) * (v[3] ?? 0) - (u[3] ?? 0) * (v[2] ?? 0))
}

// whether an 81-point permutation is affine (a linear map plus a shift) and keeps the symplectic form
export function symplecticCheck(perm: ArrayLike<number>): { affine: boolean; symplectic: boolean } {
  const shift = jointVector(perm[0] ?? 0)
  const linear = (j: number): number => jointIndex(jointVector(perm[j] ?? 0).map((x, i) => x - (shift[i] ?? 0)))
  const add = (x: number, y: number): number => jointIndex(jointVector(x).map((v, i) => v + (jointVector(y)[i] ?? 0)))
  let affine = true
  let symplectic = true

  for (let x = 0; x < 81 && affine; x++) {
    for (let y = 0; y < 81; y++) {
      if (linear(add(x, y)) !== add(linear(x), linear(y))) {
        affine = false
        break
      }

      symplectic = symplectic && jointForm(linear(x), linear(y)) === jointForm(x, y)
    }
  }

  return { affine, symplectic: affine && symplectic }
}

let SUM_PERM: Int16Array | null | undefined

// SUM's permutation of the joint grid, read off its kernel once
export function sumPermutation(): Int16Array {
  SUM_PERM = SUM_PERM === undefined ? kernelPermutation(sumOperator()) : SUM_PERM

  if (!SUM_PERM) {
    throw new Error('sum kernel is not a permutation')
  }

  return SUM_PERM
}

// The 4 parallel classes of grid lines, each by its direction (the step along a line) and its 3 lines.
// Role lines: role fixed, tilt varying, direction (0, 1). A line of direction v is {x0 + t v}.
export type LineClass = { readonly name: string; readonly direction: readonly [number, number]; readonly lines: readonly (readonly number[])[] }

export const LINE_CLASSES: readonly LineClass[] = (
  [
    ['role', [0, 1]],
    ['tilt', [1, 0]],
    ['diagonal', [1, 1]],
    ['antidiagonal', [1, 2]],
  ] as const
).map(([name, direction]) => {
  const lines: number[][] = []
  const seen = new Set<number>()

  for (let p = 0; p < 9; p++) {
    if (seen.has(p)) {
      continue
    }

    const [a, b] = pointVector(p)
    const line = [0, 1, 2].map(t => vectorPoint(a + t * direction[0], b + t * direction[1])).sort((x, y) => x - y)

    line.forEach(q => seen.add(q))
    lines.push(line)
  }

  return { name, direction, lines }
})

// a one-role linear map, [[s, t], [u, w]] acting on (role, tilt)
type Linear2 = readonly [number, number, number, number]
const applyLinear = (m: Linear2, p: number): number => {
  const [a, b] = pointVector(p)

  return vectorPoint(m[0] * a + m[1] * b, m[2] * a + m[3] * b)
}

// the SUM that reads class `direction`: the control is first moved by a determinant-1 map S carrying the
// class's lines onto the role lines, SUM acts, and S is undone. label[p] = the role of S p, which is constant
// on each line of the class and different on the three, so the record's role names the line
export function readerPermutation(direction: readonly [number, number]): { perm: Int16Array; label: Int8Array } {
  const sum = sumPermutation()

  for (let m = 0; m < 81; m++) {
    const s = [0, 1, 2, 3].map(k => Math.floor(m / 3 ** k) % 3) as unknown as Linear2

    if (mod3(s[0] * s[3] - s[1] * s[2]) !== 1) {
      continue
    }

    // S v must lie along the role lines' direction (0, 1)
    if (mod3(s[0] * direction[0] + s[1] * direction[1]) !== 0) {
      continue
    }

    const inverse = new Int16Array(9)

    for (let p = 0; p < 9; p++) {
      inverse[applyLinear(s, p)] = p
    }

    const perm = new Int16Array(81)

    for (let j = 0; j < 81; j++) {
      const moved = 9 * applyLinear(s, Math.floor(j / 9)) + (j % 9)
      const image = sum[moved] ?? 0

      perm[j] = 9 * (inverse[Math.floor(image / 9)] ?? 0) + (image % 9)
    }

    return { perm, label: Int8Array.from({ length: 9 }, (_, p) => pointVector(applyLinear(s, p))[0]) }
  }

  throw new Error('no reader for this direction')
}

// the whole with one more token, `token`, opened on a set of grid points (weight 1 on each, times the
// whole's weight): opened on a line it is that line's stabilizer state
export function openToken(whole: Whole, token: number, points: readonly number[]): Whole {
  const weight = new Array<bigint>(whole.weight.length * 9).fill(0n)

  whole.weight.forEach((w, i) => {
    if (w !== 0n) {
      for (const q of points) {
        weight[i * 9 + q] = w
      }
    }
  })

  return { tokens: [...whole.tokens, token], weight }
}

// move coordinates a and b of the whole by an 81-point joint permutation (perm[9 x + y], x on a)
export function permuteTwo(whole: Whole, a: number, b: number, perm: ArrayLike<number>): Whole {
  const k = whole.tokens.length
  const sa = 9 ** (k - 1 - a)
  const sb = 9 ** (k - 1 - b)
  const out = new Array<bigint>(whole.weight.length).fill(0n)

  for (let i = 0; i < whole.weight.length; i++) {
    const w = whole.weight[i] ?? 0n

    if (w === 0n) {
      continue
    }

    const x = Math.floor(i / sa) % 9
    const y = Math.floor(i / sb) % 9
    const image = perm[9 * x + y] ?? 0
    const j = i + (Math.floor(image / 9) - x) * sa + ((image % 9) - y) * sb

    out[j] = (out[j] ?? 0n) + w
  }

  return { tokens: whole.tokens, weight: out }
}

// sum coordinate c out of the whole
export function traceOut(whole: Whole, c: number): Whole {
  const k = whole.tokens.length
  const stride = 9 ** (k - 1 - c)
  const out = new Array<bigint>(whole.weight.length / 9).fill(0n)

  whole.weight.forEach((w, i) => {
    const high = Math.floor(i / (stride * 9))
    const low = i % stride
    const j = high * stride + low

    out[j] = (out[j] ?? 0n) + w
  })

  return { tokens: whole.tokens.filter((_, i) => i !== c), weight: out }
}

// the 9 weights of coordinate c alone
export function marginalOne(whole: Whole, c: number): bigint[] {
  const k = whole.tokens.length
  const stride = 9 ** (k - 1 - c)
  const out = new Array<bigint>(9).fill(0n)

  whole.weight.forEach((w, i) => {
    const p = Math.floor(i / stride) % 9

    out[p] = (out[p] ?? 0n) + w
  })

  return out
}

// the weight on each of a class's 3 lines
export function lineSums(weights: readonly bigint[], lineClass: LineClass): bigint[] {
  return lineClass.lines.map(line => line.reduce((s, p) => s + (weights[p] ?? 0n), 0n))
}

// The 40 isotropic planes of Z3^4 (two roles), each as its 9 joint points, with whether it is a product of
// two one-role line directions. A coset of one is the support of a two-role stabilizer state (Gross 2006), so
// the 360 cosets are the two-role stabilizer readings, 144 of them products of lines and 216 entangled.
// The non-isotropic planes are returned too, as the control: a coset of one is no reading.
export function jointPlanes(): { isotropic: { points: number[]; product: boolean }[]; other: number[][] } {
  const isotropic = new Map<string, { points: number[]; product: boolean }>()
  const other = new Map<string, number[]>()
  const add = (x: number, y: number): number => jointIndex(jointVector(x).map((v, i) => v + (jointVector(y)[i] ?? 0)))

  for (let u = 1; u < 81; u++) {
    for (let w = u + 1; w < 81; w++) {
      const span = new Set<number>()

      for (let s = 0; s < 3; s++) {
        for (let t = 0; t < 3; t++) {
          let x = 0

          for (let k = 0; k < s; k++) {
            x = add(x, u)
          }

          for (let k = 0; k < t; k++) {
            x = add(x, w)
          }

          span.add(x)
        }
      }

      if (span.size !== 9) {
        continue
      }

      const points = [...span].sort((a, b) => a - b)
      const key = points.join(',')

      if (jointForm(u, w) === 0) {
        // a product plane holds a nonzero vector on each role alone
        const product = points.some(x => x !== 0 && x % 9 === 0) && points.some(x => x !== 0 && x < 9)

        isotropic.set(key, { points, product })
      } else {
        other.set(key, points)
      }
    }
  }

  return { isotropic: [...isotropic.values()], other: [...other.values()] }
}

// the 9 cosets of a plane of joint points
export function cosetsOf(plane: readonly number[]): number[][] {
  const add = (x: number, y: number): number => jointIndex(jointVector(x).map((v, i) => v + (jointVector(y)[i] ?? 0)))
  const seen = new Set<number>()
  const out: number[][] = []

  for (let x = 0; x < 81; x++) {
    if (seen.has(x)) {
      continue
    }

    const coset = plane.map(p => add(x, p)).sort((a, b) => a - b)

    coset.forEach(c => seen.add(c))
    out.push(coset)
  }

  return out
}

// The eigenprojectors of the one-role displacement D(v): P_k = (1/3) sum_j omega^(-j k) D(v)^j, for k = 0, 1,
// 2. Their eigenbases are the stabilizer bases, one per line class, built here from the displacements alone
export function lineProjectors(direction: readonly [number, number]): Operator[] {
  const d = displacementOperators(1)[vectorPoint(direction[0], direction[1])]!
  const powers: Operator[] = [operator(3), d, multiplyOperators(d, d)]

  for (let i = 0; i < 3; i++) {
    powers[0]!.re[4 * i] = 1
  }

  return [0, 1, 2].map(k => {
    const out = operator(3)

    powers.forEach((m, j) => {
      const angle = (-2 * Math.PI * j * k) / 3
      const c = Math.cos(angle) / 3
      const s = Math.sin(angle) / 3

      for (let i = 0; i < 9; i++) {
        out.re[i] = (out.re[i] ?? 0) + c * (m.re[i] ?? 0) - s * (m.im[i] ?? 0)
        out.im[i] = (out.im[i] ?? 0) + c * (m.im[i] ?? 0) + s * (m.re[i] ?? 0)
      }
    })

    return out
  })
}

// Re Tr(a b) of two operators of one size
export function traceProduct(a: Operator, b: Operator): number {
  const n = a.n
  let re = 0

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      re += (a.re[i * n + k] ?? 0) * (b.re[k * n + i] ?? 0) - (a.im[i * n + k] ?? 0) * (b.im[k * n + i] ?? 0)
    }
  }

  return re
}
