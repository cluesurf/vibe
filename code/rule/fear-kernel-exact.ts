// The fear beat's meeting kernels in exact Eisenstein integers (E-FRC-0206): the same integer tables that
// code/rule/fear-weave fearKernels builds, with no angle, no cosine and no rounding.
//
// fearKernels takes two REAL angles (the fear beat is like = unlike = 2 pi / 3), builds the swap phase and the
// singlet phase from Math.cos and Math.sin, forms the Wigner kernel K(x, y) = Tr(A(x) U A(y) U^dagger) / 9 in
// floating point, and then searches for the smallest divisor d with every d K within 1e-9 of an integer and
// rounds. The result is exact, but it is reached through continuity and a rounding, which the base may not do
// (the user's rule of 2026-09-26). The E-MTH-0025 audit finds it: the fear port (code/measure/fear-port)
// hands these tables to the knit's fear beat.
//
// Here every angle the fear beat uses is a cube root of unity, so the angle is a trit k in Z_3 and the phase
// is omega^k, omega = e^(2 pi i / 3), held as an Eisenstein integer a + b omega with a, b integers
// (omega^2 = -1 - omega, conj(omega) = omega^2). The phase-point operators A(a, b) = D(a, b) P D(a, b)^dagger
// have entries in Z[omega]. The swap phase U = P_sym + omega^k P_anti has entries (1 +- omega^k)/2, so 2U is
// in Z[omega]; the singlet phase V = 1 + (omega^k - 1) Phi Phi^dagger has entries with a 1/3, so 3V is. With
// U' = c U, K = Tr(A(x) U' A(y) U'^dagger) / (9 c^2), and the trace is an Eisenstein integer with no omega
// part (K is real), so K is an integer over 9 c^2, exactly, and the smallest divisor is 9 c^2 over the gcd.
//
// Integers only: sums, products, remainders, shifts. The one exact division (a table entry by the common
// factor) is binary long division with its remainder checked to be zero.

export type Eisenstein = { a: Int32Array; b: Int32Array; n: number }

export type ExactFearKernels = {
  readonly like: number[][]
  readonly likeDivisor: number
  readonly unlike: number[][]
  readonly unlikeDivisor: number
}

function eisenstein(n: number): Eisenstein {
  return { n, a: new Int32Array(n * n), b: new Int32Array(n * n) }
}

// omega^k as (a, b)
function omegaPower(k: number): [number, number] {
  const r = ((k % 3) + 3) % 3

  return r === 0 ? [1, 0] : r === 1 ? [0, 1] : [-1, -1]
}

function multiply(x: Eisenstein, y: Eisenstein): Eisenstein {
  const n = x.n
  const out = eisenstein(n)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const xa = x.a[i * n + k] as number
      const xb = x.b[i * n + k] as number

      if (xa === 0 && xb === 0) {
        continue
      }

      for (let j = 0; j < n; j++) {
        const ya = y.a[k * n + j] as number
        const yb = y.b[k * n + j] as number

        // (xa + xb w)(ya + yb w) = xa ya - xb yb + (xa yb + xb ya - xb yb) w
        out.a[i * n + j] = (out.a[i * n + j] as number) + xa * ya - xb * yb
        out.b[i * n + j] = (out.b[i * n + j] as number) + xa * yb + xb * ya - xb * yb
      }
    }
  }

  return out
}

// the conjugate transpose: conj(a + b w) = (a - b) - b w
function adjoint(x: Eisenstein): Eisenstein {
  const n = x.n
  const out = eisenstein(n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const a = x.a[j * n + i] as number
      const b = x.b[j * n + i] as number

      out.a[i * n + j] = a - b
      out.b[i * n + j] = -b
    }
  }

  return out
}

function tensor(x: Eisenstein, y: Eisenstein): Eisenstein {
  const n = x.n * y.n
  const out = eisenstein(n)

  for (let i = 0; i < x.n; i++) {
    for (let j = 0; j < x.n; j++) {
      const xa = x.a[i * x.n + j] as number
      const xb = x.b[i * x.n + j] as number

      for (let k = 0; k < y.n; k++) {
        for (let l = 0; l < y.n; l++) {
          const ya = y.a[k * y.n + l] as number
          const yb = y.b[k * y.n + l] as number
          const at = (i * y.n + k) * n + (j * y.n + l)

          out.a[at] = xa * ya - xb * yb
          out.b[at] = xa * yb + xb * ya - xb * yb
        }
      }
    }
  }

  return out
}

// the displacement D(a, b) = omega^(2ab) X^a Z^b, with X^a Z^b |j> = omega^(b j) |j + a>
function displacement(a: number, b: number): Eisenstein {
  const out = eisenstein(3)
  const [pa, pb] = omegaPower(2 * a * b)

  for (let j = 0; j < 3; j++) {
    const [za, zb] = omegaPower(b * j)
    const row = (j + a) % 3

    out.a[3 * row + j] = pa * za - pb * zb
    out.b[3 * row + j] = pa * zb + pb * za - pb * zb
  }

  return out
}

// A(a, b) = D(a, b) P D(a, b)^dagger, P|j> = |-j>
function phasePoint(a: number, b: number): Eisenstein {
  const parity = eisenstein(3)

  for (let j = 0; j < 3; j++) {
    parity.a[3 * ((3 - j) % 3) + j] = 1
  }

  const d = displacement(a, b)

  return multiply(multiply(d, parity), adjoint(d))
}

let POINTS: Eisenstein[] | undefined

// the 81 phase points of two qutrits, index 9 x1 + x2, each x = 3 a + b
export function twoQutritPoints(): Eisenstein[] {
  if (!POINTS) {
    const single: Eisenstein[] = []

    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        single.push(phasePoint(a, b))
      }
    }

    POINTS = single.flatMap(p => single.map(s => tensor(p, s)))
  }

  return POINTS
}

// 2 U, U = P_sym + omega^k P_anti on two roles, index 3 i + j
export function doubledSwapPhase(k: number): Eisenstein {
  const u = eisenstein(9)
  const [wa, wb] = omegaPower(k)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const row = 3 * i + j
      const swapped = 3 * j + i

      u.a[row * 9 + row] = (u.a[row * 9 + row] as number) + 1 + wa
      u.b[row * 9 + row] = (u.b[row * 9 + row] as number) + wb
      u.a[row * 9 + swapped] = (u.a[row * 9 + swapped] as number) + 1 - wa
      u.b[row * 9 + swapped] = (u.b[row * 9 + swapped] as number) - wb
    }
  }

  return u
}

// 3 V, V = 1 + (omega^k - 1) P, P the projector on sum_j |j j> / sqrt 3
export function tripledSingletPhase(k: number): Eisenstein {
  const v = eisenstein(9)
  const [wa, wb] = omegaPower(k)

  for (let i = 0; i < 9; i++) {
    v.a[i * 9 + i] = 3
  }

  for (let j = 0; j < 3; j++) {
    for (let m = 0; m < 3; m++) {
      const at = (3 * j + j) * 9 + (3 * m + m)

      v.a[at] = (v.a[at] as number) + wa - 1
      v.b[at] = (v.b[at] as number) + wb
    }
  }

  return v
}

export function exchange(): Eisenstein {
  const s = eisenstein(9)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      s.a[(3 * j + i) * 9 + (3 * i + j)] = 1
    }
  }

  return s
}

const gcd = (x: number, y: number): number => {
  let p = x < 0 ? -x : x
  let q = y < 0 ? -y : y

  while (q !== 0) {
    const r = p % q

    p = q
    q = r
  }

  return p
}

// x over y for y > 0 dividing x, by binary long division; throws if y does not divide x
export function exactQuotient(x: number, y: number): number {
  const negative = x < 0
  let rest = negative ? -x : x
  let shift = 0
  let quotient = 0

  while (y * (1 << (shift + 1)) <= rest && shift < 29) {
    shift += 1
  }

  for (let s = shift; s >= 0; s--) {
    const chunk = y * (1 << s)

    if (chunk <= rest) {
      rest -= chunk
      quotient += 1 << s
    }
  }

  if (rest !== 0) {
    throw new Error(`fear-kernel-exact: ${y} does not divide ${x}`)
  }

  return negative ? -quotient : quotient
}

// T(x, y) = Tr(A(x) U' A(y) U'^dagger), an integer (its omega part is checked to vanish), for all 81 x 81 points
function traceKernel(u: Eisenstein): number[][] {
  const points = twoQutritPoints()
  const ud = adjoint(u)
  const moved = points.map(p => multiply(multiply(u, p), ud))

  return points.map(ax =>
    moved.map(m => {
      let a = 0
      let b = 0

      for (let i = 0; i < 9; i++) {
        for (let k = 0; k < 9; k++) {
          const xa = ax.a[i * 9 + k] as number
          const xb = ax.b[i * 9 + k] as number
          const ya = m.a[k * 9 + i] as number
          const yb = m.b[k * 9 + i] as number

          a += xa * ya - xb * yb
          b += xa * yb + xb * ya - xb * yb
        }
      }

      if (b !== 0) {
        throw new Error('fear-kernel-exact: a Wigner kernel entry is not real')
      }

      return a
    }),
  )
}

// D K in whole numbers with the smallest D, from U' = c U: K = T / (9 c^2)
export function exactWholeKernel(u: Eisenstein, c: number): { divisor: number; kernel: number[][] } {
  const t = traceKernel(u)
  const whole = 9 * c * c
  const common = t.reduce((g, row) => row.reduce((h, x) => gcd(h, x), g), whole)

  return { divisor: exactQuotient(whole, common), kernel: t.map(row => row.map(x => exactQuotient(x, common))) }
}

// the reflection (a, b) -> (a, -b) of a point 3 a + b, and of a two-point index 9 x1 + x2 on its second point
const conjugatePoint = (p: number): number => p - (p % 3) + ((3 - (p % 3)) % 3)
const conjugateIndex = (i: number): number => i - (i % 9) + conjugatePoint(i % 9)

// The fear beat's kernels with the like and unlike phases given as trits: omega^like, omega^unlike. The fear
// beat is (1, 1), its backward beat (2, 2), the color weave with the fear beat off (0, 0).
export function exactFearKernels(input: { like: number; unlike: number; likeExchanged?: boolean }): ExactFearKernels {
  const swap = doubledSwapPhase(input.like)
  const like = exactWholeKernel((input.likeExchanged ?? true) ? multiply(exchange(), swap) : swap, 2)
  const unlike = exactWholeKernel(tripledSingletPhase(input.unlike), 3)
  const reflected = Array.from({ length: 81 }, (_, r) => Array.from({ length: 81 }, (__, c) => unlike.kernel[conjugateIndex(r)]?.[conjugateIndex(c)] ?? 0))

  return { like: like.kernel, likeDivisor: like.divisor, unlike: reflected, unlikeDivisor: unlike.divisor }
}
