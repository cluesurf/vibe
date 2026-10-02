// CHSH on a pure two-qutrit state through Jordan's lemma, with instruments independent of code/measure/pure-chsh.
// Built for E-QTM-0165.
//
// Two ±1 observables on C^3 split C^3 (Jordan 1875) into a plane, where they are two reflections at an angle, and
// a line, where they are signs. Every such pair is A_x = s_x (1 - 2 |v_x><v_x|) for unit vectors v_0, v_1 and
// signs s_x (the plane is the span of v_0 and v_1), so a pair built this way is an exact involution by
// construction and needs no eigendecomposition. Bob's best answer is the sign of the operator Alice leaves him,
// so the CHSH value of Alice's pair is || D X^T D ||_1 + || D Y^T D ||_1 (X = A0 + A1, Y = A0 - A1, D the square
// roots of the Schmidt weights). The trace norm here is the sum of |roots| of the Hermitian's characteristic
// cubic, solved in closed form: no Jacobi sweep, no Gram-Schmidt.
//
// Floating point throughout, and labeled so: this module is the independent witness, not the exact answer.

export type C3 = { re: number[]; im: number[] } // 3 x 3, row major

export const zeroC3 = (): C3 => ({
  re: new Array<number>(9).fill(0),
  im: new Array<number>(9).fill(0),
})

export function identityC3(): C3 {
  const m = zeroC3()

  m.re[0] = 1
  m.re[4] = 1
  m.re[8] = 1

  return m
}

export function addC3(a: C3, b: C3, s = 1): C3 {
  return {
    re: a.re.map((x, i) => x + s * b.re[i]!),
    im: a.im.map((x, i) => x + s * b.im[i]!),
  }
}

export function mulC3(a: C3, b: C3): C3 {
  const out = zeroC3()

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < 3; k++) {
        const ar = a.re[3 * i + k]!
        const ai = a.im[3 * i + k]!
        const br = b.re[3 * k + j]!
        const bi = b.im[3 * k + j]!

        re += ar * br - ai * bi
        im += ar * bi + ai * br
      }

      out.re[3 * i + j] = re
      out.im[3 * i + j] = im
    }
  }

  return out
}

export function adjointC3(a: C3): C3 {
  const out = zeroC3()

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      out.re[3 * i + j] = a.re[3 * j + i]!
      out.im[3 * i + j] = -a.im[3 * j + i]!
    }
  }

  return out
}

// the eigenvalues of a Hermitian 3 x 3 from det(x - H) = x^3 - t x^2 + m x - d, by the trigonometric cubic
export function hermitianEigenvalues(h: C3): number[] {
  const r = (i: number, j: number): number => h.re[3 * i + j]!
  const c = (i: number, j: number): number => h.im[3 * i + j]!
  const t = r(0, 0) + r(1, 1) + r(2, 2)
  // principal 2 x 2 minors: h_ii h_jj - |h_ij|^2
  const m =
    r(0, 0) * r(1, 1) -
    (r(0, 1) ** 2 + c(0, 1) ** 2) +
    r(0, 0) * r(2, 2) -
    (r(0, 2) ** 2 + c(0, 2) ** 2) +
    r(1, 1) * r(2, 2) -
    (r(1, 2) ** 2 + c(1, 2) ** 2)
  // det of a Hermitian: h00 h11 h22 + 2 Re(h01 h12 h20) - h00 |h12|^2 - h11 |h02|^2 - h22 |h01|^2
  const triple =
    // Re(h01 h12 h20), h20 = conj(h02)
    (r(0, 1) * r(1, 2) - c(0, 1) * c(1, 2)) * r(0, 2) +
    (r(0, 1) * c(1, 2) + c(0, 1) * r(1, 2)) * c(0, 2)
  const d =
    r(0, 0) * r(1, 1) * r(2, 2) +
    2 * triple -
    r(0, 0) * (r(1, 2) ** 2 + c(1, 2) ** 2) -
    r(1, 1) * (r(0, 2) ** 2 + c(0, 2) ** 2) -
    r(2, 2) * (r(0, 1) ** 2 + c(0, 1) ** 2)
  // depressed: x = y + t / 3
  const p = m - (t * t) / 3
  const q = -(2 * t * t * t) / 27 + (t * m) / 3 - d

  if (p > -1e-300) {
    return [t / 3, t / 3, t / 3]
  }

  const k = 2 * Math.sqrt(-p / 3)
  const arg = Math.max(-1, Math.min(1, (3 * q) / (p * k)))
  const theta = Math.acos(arg) / 3

  return [0, 1, 2].map(j => k * Math.cos(theta - (2 * Math.PI * j) / 3) + t / 3)
}

export function traceNormCubic(h: C3): number {
  return hermitianEigenvalues(h).reduce((s, x) => s + Math.abs(x), 0)
}

// A = s (1 - 2 |v><v|), v normalized here
export function jordanObservable(
  v: { re: number[]; im: number[] },
  s: number,
): C3 {
  const n = Math.sqrt(
    v.re.reduce((a, x) => a + x * x, 0) + v.im.reduce((a, x) => a + x * x, 0),
  )
  const out = identityC3()

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      // v_i conj(v_j)
      const re = (v.re[i]! * v.re[j]! + v.im[i]! * v.im[j]!) / (n * n)
      const im = (v.im[i]! * v.re[j]! - v.re[i]! * v.im[j]!) / (n * n)

      out.re[3 * i + j] = out.re[3 * i + j]! - 2 * re
      out.im[3 * i + j] = out.im[3 * i + j]! - 2 * im
    }
  }

  return { re: out.re.map(x => s * x), im: out.im.map(x => s * x) }
}

// D X^T D
function sandwich(p: readonly number[], x: C3): C3 {
  const out = zeroC3()

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const w = Math.sqrt(p[i]! * p[j]!)

      out.re[3 * i + j] = w * x.re[3 * j + i]!
      out.im[3 * i + j] = w * x.im[3 * j + i]!
    }
  }

  return out
}

export function chshOfAlice(p: readonly number[], a0: C3, a1: C3): number {
  return (
    traceNormCubic(sandwich(p, addC3(a0, a1))) +
    traceNormCubic(sandwich(p, addC3(a0, a1, -1)))
  )
}

// how far a matrix is from a ±1 observable: the largest entry of |A^2 - 1| and of |A - A^dagger|
export function involutionDefect(a: C3): number {
  const square = addC3(mulC3(a, a), identityC3(), -1)
  const skew = addC3(a, adjointC3(a), -1)

  return Math.max(
    ...square.re.map(Math.abs),
    ...square.im.map(Math.abs),
    ...skew.re.map(Math.abs),
    ...skew.im.map(Math.abs),
  )
}

// <psi| sum_xy (-1)^(xy) A_x (x) B_y |psi> for psi = sum sqrt(p_k) |k k>, read directly
export function chshDirect(
  p: readonly number[],
  a: readonly C3[],
  b: readonly C3[],
): number {
  let total = 0

  for (let x = 0; x < 2; x++) {
    for (let y = 0; y < 2; y++) {
      const sign = x * y === 1 ? -1 : 1

      // <psi|A (x) B|psi> = sum_kl sqrt(p_k p_l) A_kl B_kl (real part)
      let s = 0

      for (let k = 0; k < 3; k++) {
        for (let l = 0; l < 3; l++) {
          const w = Math.sqrt(p[k]! * p[l]!)
          const ar = a[x]!.re[3 * k + l]!
          const ai = a[x]!.im[3 * k + l]!
          const br = b[y]!.re[3 * k + l]!
          const bi = b[y]!.im[3 * k + l]!

          s += w * (ar * br - ai * bi)
        }
      }

      total += sign * s
    }
  }

  return total
}

// unit vector from four angles
export function vectorFrom(angles: readonly number[]): {
  re: number[]
  im: number[]
} {
  const [a = 0, b = 0, f1 = 0, f2 = 0] = angles

  return {
    re: [
      Math.cos(a),
      Math.sin(a) * Math.cos(b) * Math.cos(f1),
      Math.sin(a) * Math.sin(b) * Math.cos(f2),
    ],
    im: [
      0,
      Math.sin(a) * Math.cos(b) * Math.sin(f1),
      Math.sin(a) * Math.sin(b) * Math.sin(f2),
    ],
  }
}

// Alice's Jordan pair from eight angles and two signs
export function jordanPair(
  angles: readonly number[],
  signs: readonly [number, number],
): [C3, C3] {
  return [
    jordanObservable(vectorFrom(angles.slice(0, 4)), signs[0]),
    jordanObservable(vectorFrom(angles.slice(4, 8)), signs[1]),
  ]
}

// a deterministic pattern search over the eight angles from Weyl starts, every sign pair: the largest value
// found and its angles
export function jordanSearch(
  p: readonly number[],
  starts: number,
): { value: number; angles: number[]; signs: [number, number] } {
  const rates = [2, 3, 5, 7, 11, 13, 17, 19].map(q => Math.sqrt(q) % 1)

  let best = {
    value: Number.NEGATIVE_INFINITY,
    angles: [] as number[],
    signs: [1, 1] as [number, number],
  }

  for (const signs of [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ] as [number, number][]) {
    for (let s = 1; s <= starts; s++) {
      let x = rates.map(r => ((s * r) % 1) * 2 * Math.PI)
      let fx = chshOfAlice(p, ...jordanPair(x, signs))

      for (let step = 0.5; step > 1e-10; step /= 2) {
        let moved = true

        while (moved) {
          moved = false

          for (let k = 0; k < 8; k++) {
            for (const dir of [1, -1]) {
              const y = [...x]

              y[k] = y[k]! + dir * step

              const fy = chshOfAlice(p, ...jordanPair(y, signs))

              if (fy > fx + 1e-15) {
                x = y
                fx = fy
                moved = true
              }
            }
          }
        }
      }

      if (fx > best.value) {
        best = { value: fx, angles: x, signs }
      }
    }
  }

  return best
}
