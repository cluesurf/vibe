// A quantum light as part of the signed whole (E-FRC-0223 to 0226): the discrete Wigner function (Gross 2006) of
// several registers of odd dimension, so a link's integer register (its flow, mod d) and its conjugate join the
// vibes' grid in the whole, and each history (a joint phase point) carries its own light.
//
// CONVENTIONS, the same as code/measure/qutrit-phase-space and code/rule/fear-kernel-exact for d = 3, extended
// to any odd d. One register of dimension d has the displacement D(a, b) = X^a Z^b (times a phase that cancels
// below), X^a Z^b |j> = omega_d^(b j) |j + a>, and the phase-point operator
//   A(a, b) = D(a, b) P D(a, b)^dagger,  P |j> = |-j>,  so  A(a, b) |j> = omega_d^(2 b (a - j)) |2 a - j>
// (derived: P D^dagger |j> = omega^(-b (j - a)) |a - j>, then D gives omega^(b (a - j)) |2 a - j>). A(a, b) is
// monomial, sum_(a, b) A(a, b) = d 1 and Tr A(x) A(y) = d delta_xy, so for registers of total dimension N
//   W(x) = Tr(rho A(x)) / N,   rho = sum_x W(x) A(x),
// and the position of the point (a, b) is a: <j| A(a, b) |j> is nonzero only at j = a (2 is invertible mod d).
// A joint point is one (a, b) per register; its index is sum_q (a_q d_q + b_q) times the product of d^2 over the
// later registers (the first register most significant), which for two qutrits is fear-kernel-exact's 9 x1 + x2.
//
// THE COST OF A WIGNER FUNCTION. rho is transformed one register at a time: the pair (row digit j, column digit
// k) of register q becomes (a, b) with out(a, b) = sum_j in(j, 2a - j) omega^(2 b (a - j)), N^2 d_q operations per
// register, never a sum over all N^2 points of an N-term trace.
//
// Everything here is measurement: floats on small matrices. The rule side (exact integer kernels) lives in the
// experiments, built from code/rule/fear-kernel-exact.

export type Registers = {
  readonly dims: readonly number[]
  readonly size: number
  // basis index -> the digit of register q, at [index * count + q]
  readonly digits: Int32Array
  // stride of register q in a basis index
  readonly strides: readonly number[]
}

export type Density = { readonly size: number; readonly re: Float64Array; readonly im: Float64Array }

export type State = { readonly re: Float64Array; readonly im: Float64Array }

const mod = (x: number, m: number): number => ((x % m) + m) % m

// the inverse of 2 mod an odd d
const halfOf = (d: number): number => (d + 1) / 2

export function registers(dims: readonly number[]): Registers {
  for (const d of dims) if (d % 2 === 0) throw new Error('quantum-light: every register must have odd dimension')

  const size = dims.reduce((p, d) => p * d, 1)
  const strides = dims.map((_, q) => dims.slice(q + 1).reduce((p, d) => p * d, 1))
  const digits = new Int32Array(size * dims.length)

  for (let i = 0; i < size; i++) for (let q = 0; q < dims.length; q++) digits[i * dims.length + q] = Math.floor(i / strides[q]!) % dims[q]!

  return { dims, size, digits, strides }
}

export const digitOf = (r: Registers, index: number, q: number): number => r.digits[index * r.dims.length + q]!

// the balanced reading of a digit: -(d - 1)/2 .. (d - 1)/2
export const balanced = (digit: number, d: number): number => (digit > (d - 1) / 2 ? digit - d : digit)

export function emptyState(r: Registers): State {
  return { re: new Float64Array(r.size), im: new Float64Array(r.size) }
}

export function basisState(r: Registers, digits: readonly number[]): State {
  const s = emptyState(r)

  s.re[digits.reduce((i, v, q) => i + v * r.strides[q]!, 0)] = 1

  return s
}

export function normalize(s: State): State {
  let n = 0

  for (let i = 0; i < s.re.length; i++) n += s.re[i]! ** 2 + s.im[i]! ** 2

  const k = 1 / Math.sqrt(n)

  for (let i = 0; i < s.re.length; i++) {
    s.re[i] = s.re[i]! * k
    s.im[i] = s.im[i]! * k
  }

  return s
}

export function tensorStates(a: State, b: State): State {
  const out = { re: new Float64Array(a.re.length * b.re.length), im: new Float64Array(a.re.length * b.re.length) }

  for (let i = 0; i < a.re.length; i++) {
    for (let j = 0; j < b.re.length; j++) {
      out.re[i * b.re.length + j] = a.re[i]! * b.re[j]! - a.im[i]! * b.im[j]!
      out.im[i * b.re.length + j] = a.re[i]! * b.im[j]! + a.im[i]! * b.re[j]!
    }
  }

  return out
}

export function densityOf(s: State): Density {
  const n = s.re.length
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      re[i * n + j] = s.re[i]! * s.re[j]! + s.im[i]! * s.im[j]!
      im[i * n + j] = s.im[i]! * s.re[j]! - s.re[i]! * s.im[j]!
    }
  }

  return { size: n, re, im }
}

// ---------------------------------------------------------------------------------------------------------
// Wigner functions

// the point index of per-register (a, b)
export function pointIndex(r: Registers, a: readonly number[], b: readonly number[]): number {
  let x = 0

  for (let q = 0; q < r.dims.length; q++) x = x * r.dims[q]! * r.dims[q]! + a[q]! * r.dims[q]! + b[q]!

  return x
}

// the positions a_q of every point, at [point * count + q]
export function pointPositions(r: Registers): Int32Array {
  const count = r.dims.length
  const points = r.size * r.size
  const out = new Int32Array(points * count)

  for (let x = 0; x < points; x++) {
    let rest = x

    for (let q = count - 1; q >= 0; q--) {
      const d = r.dims[q]!
      const pair = rest % (d * d)

      rest = Math.floor(rest / (d * d))
      out[x * count + q] = Math.floor(pair / d)
    }
  }

  return out
}

// the conjugates b_q of every point, at [point * count + q]
export function pointConjugates(r: Registers): Int32Array {
  const count = r.dims.length
  const points = r.size * r.size
  const out = new Int32Array(points * count)

  for (let x = 0; x < points; x++) {
    let rest = x

    for (let q = count - 1; q >= 0; q--) {
      const d = r.dims[q]!
      const pair = rest % (d * d)

      rest = Math.floor(rest / (d * d))
      out[x * count + q] = pair % d
    }
  }

  return out
}

// the (row, column) layout index of per-register row digits and column digits, and the map from it to points
function layoutToPoint(r: Registers): Int32Array {
  const out = new Int32Array(r.size * r.size)

  for (let row = 0; row < r.size; row++) {
    for (let col = 0; col < r.size; col++) {
      const a = r.dims.map((_, q) => digitOf(r, row, q))
      const b = r.dims.map((_, q) => digitOf(r, col, q))

      out[row * r.size + col] = pointIndex(r, a, b)
    }
  }

  return out
}

const LAYOUTS = new Map<string, Int32Array>()

function layout(r: Registers): Int32Array {
  const key = r.dims.join(',')
  let found = LAYOUTS.get(key)

  if (!found) {
    found = layoutToPoint(r)
    LAYOUTS.set(key, found)
  }

  return found
}

// transform register q's (row, column) digit pair in place, forward (rho -> Tr rho A) or back (W -> rho)
function transformRegister(r: Registers, re: Float64Array, im: Float64Array, q: number, forward: boolean): void {
  const d = r.dims[q]!
  const stride = r.strides[q]!
  const size = r.size
  const half = halfOf(d)
  const cos = Float64Array.from({ length: d }, (_, k) => Math.cos((2 * Math.PI * k) / d))
  const sin = Float64Array.from({ length: d }, (_, k) => Math.sin((2 * Math.PI * k) / d))
  const inRe = new Float64Array(d * d)
  const inIm = new Float64Array(d * d)

  for (let row0 = 0; row0 < size; row0++) {
    if (Math.floor(row0 / stride) % d !== 0) continue

    for (let col0 = 0; col0 < size; col0++) {
      if (Math.floor(col0 / stride) % d !== 0) continue

      for (let j = 0; j < d; j++) {
        for (let k = 0; k < d; k++) {
          const at = (row0 + j * stride) * size + col0 + k * stride

          inRe[j * d + k] = re[at]!
          inIm[j * d + k] = im[at]!
        }
      }

      for (let u = 0; u < d; u++) {
        for (let v = 0; v < d; v++) {
          let sr = 0
          let si = 0

          if (forward) {
            // out(a = u, b = v) = sum_j in(j, 2a - j) omega^(2 b (a - j))
            for (let j = 0; j < d; j++) {
              const k = mod(2 * u - j, d)
              const e = mod(2 * v * (u - j), d)
              const xr = inRe[j * d + k]!
              const xi = inIm[j * d + k]!

              sr += xr * cos[e]! - xi * sin[e]!
              si += xr * sin[e]! + xi * cos[e]!
            }
          } else {
            // rho(j = u, k = v) = sum_b W(a = (j + k)/2, b) omega^(2 b (a - k))
            const a = mod((u + v) * half, d)

            for (let b = 0; b < d; b++) {
              const e = mod(2 * b * (a - v), d)
              const xr = inRe[a * d + b]!
              const xi = inIm[a * d + b]!

              sr += xr * cos[e]! - xi * sin[e]!
              si += xr * sin[e]! + xi * cos[e]!
            }
          }

          const at = (row0 + u * stride) * size + col0 + v * stride

          re[at] = sr
          im[at] = si
        }
      }
    }
  }
}

// W(x) = Tr(rho A(x)) / N; returns W and the largest imaginary part met (a check, it must vanish)
export function wigner(r: Registers, rho: Density): { w: Float64Array; imaginary: number } {
  const re = Float64Array.from(rho.re)
  const im = Float64Array.from(rho.im)

  for (let q = 0; q < r.dims.length; q++) transformRegister(r, re, im, q, true)

  const map = layout(r)
  const w = new Float64Array(r.size * r.size)
  let imaginary = 0

  for (let i = 0; i < w.length; i++) {
    w[map[i]!] = re[i]! / r.size
    imaginary = Math.max(imaginary, Math.abs(im[i]!) / r.size)
  }

  return { w, imaginary }
}

export function densityFromWigner(r: Registers, w: Float64Array): Density {
  const map = layout(r)
  const re = new Float64Array(r.size * r.size)
  const im = new Float64Array(r.size * r.size)

  for (let i = 0; i < re.length; i++) re[i] = w[map[i]!]!

  for (let q = 0; q < r.dims.length; q++) transformRegister(r, re, im, q, false)

  return { size: r.size, re, im }
}

export const mana = (w: Float64Array): number => Math.log(w.reduce((s, x) => s + Math.abs(x), 0))

export const negativeWeight = (w: Float64Array): number => w.reduce((s, x) => s + (x < 0 ? -x : 0), 0)

// the marginal whole of the registers `keep` (a sum over the others' points, the partial trace)
export function marginal(r: Registers, w: Float64Array, keep: readonly number[]): { registers: Registers; w: Float64Array } {
  const sub = registers(keep.map(q => r.dims[q]!))
  const out = new Float64Array(sub.size * sub.size)
  const positions = pointPositions(r)
  const conjugates = pointConjugates(r)
  const count = r.dims.length

  for (let x = 0; x < w.length; x++) {
    if (w[x] === 0) continue

    const at = pointIndex(
      sub,
      keep.map(q => positions[x * count + q]!),
      keep.map(q => conjugates[x * count + q]!),
    )

    out[at] = out[at]! + w[x]!
  }

  return { registers: sub, w: out }
}

// ---------------------------------------------------------------------------------------------------------
// the smallest eigenvalue of a Hermitian density (cyclic Jacobi on the real 2n x 2n embedding)

export function smallestEigenvalue(rho: Density): number {
  const n = rho.size
  const m = 2 * n
  const a = new Float64Array(m * m)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = (rho.re[i * n + j]! + rho.re[j * n + i]!) / 2
      const y = (rho.im[i * n + j]! - rho.im[j * n + i]!) / 2

      a[i * m + j] = x
      a[(n + i) * m + n + j] = x
      a[i * m + n + j] = -y
      a[(n + i) * m + j] = y
    }
  }

  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0

    for (let p = 0; p < m; p++) for (let q = p + 1; q < m; q++) off += a[p * m + q]! ** 2

    if (off < 1e-26) break

    for (let p = 0; p < m; p++) {
      for (let q = p + 1; q < m; q++) {
        const apq = a[p * m + q]!

        if (Math.abs(apq) < 1e-300) continue

        const theta = (a[q * m + q]! - a[p * m + p]!) / (2 * apq)
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c

        for (let k = 0; k < m; k++) {
          const akp = a[k * m + p]!
          const akq = a[k * m + q]!

          a[k * m + p] = c * akp - s * akq
          a[k * m + q] = s * akp + c * akq
        }

        for (let k = 0; k < m; k++) {
          const apk = a[p * m + k]!
          const aqk = a[q * m + k]!

          a[p * m + k] = c * apk - s * aqk
          a[q * m + k] = s * apk + c * aqk
        }
      }
    }
  }

  let least = Infinity

  for (let i = 0; i < m; i++) least = Math.min(least, a[i * m + i]!)

  return least
}

// ---------------------------------------------------------------------------------------------------------
// the gates on state vectors

// the flow update SUM: register `target` += sign x (the balanced value of `control`), mod its dimension
export function applySum(r: Registers, s: State, control: number, target: number, sign = 1): State {
  const out = emptyState(r)
  const dc = r.dims[control]!
  const dt = r.dims[target]!

  for (let i = 0; i < r.size; i++) {
    const v = balanced(digitOf(r, i, control), dc)
    const t = digitOf(r, i, target)
    const j = i + (mod(t + sign * v, dt) - t) * r.strides[target]!

    out.re[j] = s.re[i]!
    out.im[j] = s.im[i]!
  }

  return out
}

// a diagonal phase: basis state i gets e^(2 pi i turns(i))
export function applyPhase(r: Registers, s: State, turns: (i: number) => number): State {
  const out = emptyState(r)

  for (let i = 0; i < r.size; i++) {
    const t = 2 * Math.PI * turns(i)
    const c = Math.cos(t)
    const n = Math.sin(t)

    out.re[i] = s.re[i]! * c - s.im[i]! * n
    out.im[i] = s.re[i]! * n + s.im[i]! * c
  }

  return out
}

// exchange two registers of one dimension (a relabeling: the stream copies)
export function applyExchange(r: Registers, s: State, p: number, q: number): State {
  const out = emptyState(r)

  for (let i = 0; i < r.size; i++) {
    const x = digitOf(r, i, p)
    const y = digitOf(r, i, q)
    const j = i + (y - x) * r.strides[p]! + (x - y) * r.strides[q]!

    out.re[j] = s.re[i]!
    out.im[j] = s.im[i]!
  }

  return out
}

// the swap phase P_sym + e^(2 pi i k / n) P_anti on registers p, q of one dimension: ((1 + z)/2) 1 + ((1 - z)/2) SWAP
export function applySwapPhase(r: Registers, s: State, p: number, q: number, k: number, n = 3): State {
  const swapped = applyExchange(r, s, p, q)
  const zr = Math.cos((2 * Math.PI * k) / n)
  const zi = Math.sin((2 * Math.PI * k) / n)
  const ar = (1 + zr) / 2
  const ai = zi / 2
  const br = (1 - zr) / 2
  const bi = -zi / 2
  const out = emptyState(r)

  for (let i = 0; i < r.size; i++) {
    out.re[i] = ar * s.re[i]! - ai * s.im[i]! + br * swapped.re[i]! - bi * swapped.im[i]!
    out.im[i] = ar * s.im[i]! + ai * s.re[i]! + br * swapped.im[i]! + bi * swapped.re[i]!
  }

  return out
}

// the weight of a state outside a set of basis states (a leak out of a sector)
export function weightOutside(s: State, inside: (i: number) => boolean): number {
  let w = 0

  for (let i = 0; i < s.re.length; i++) if (!inside(i)) w += s.re[i]! ** 2 + s.im[i]! ** 2

  return w
}
