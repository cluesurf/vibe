// The largest CHSH value a pure two-qutrit state gives with two-outcome (dichotomic) observables on each
// side, as a function of its Schmidt weights, with the exact structure that makes it computable.
//
// THE REDUCTION (derived in E-QTM-0132). For |psi> = sum_i sqrt(p_i) |i i> and D = diag(sqrt p), the
// expectation of A (x) B is Tr[B D A^T D]. The best B for fixed Alice is the sign of the operator it
// meets, so
//   CHSH(p) = max over A0, A1 of || D X D ||_1 + || D Y D ||_1,  X = A0 + A1, Y = A0 - A1,
// the trace norm. Two involutions on C^3 split by Jordan's lemma into one two-dimensional block, where
// they are two reflections at an angle, and one common eigenvector e, where they are signs. So
//   X = 2 cos(t) R1 + 2 s1 e e^dagger,  Y = 2 sin(t) R2 + 2 s2 e e^dagger,
// R1, R2 anticommuting reflections of the plane orthogonal to e, and (s1, s2) one of (+-1, 0), (0, +-1).
//
// Everything here is floating point. Complex Hermitian 3 x 3 matrices are diagonalized through their real
// symmetric 6 x 6 embedding [[Re, -Im], [Im, Re]] by cyclic Jacobi, which doubles every eigenvalue.

export type Complex3 = { re: Float64Array; im: Float64Array }

export function zero3(): Complex3 {
  return { re: new Float64Array(9), im: new Float64Array(9) }
}

// eigenvalues (ascending, each once) and eigenvectors (columns, as complex 3-vectors) of a Hermitian 3 x 3
export function hermitian3(h: Complex3): { values: number[]; vectors: { re: number[]; im: number[] }[] } {
  const n = 6
  const a = new Float64Array(36)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const re = h.re[3 * i + j] ?? 0
      const im = h.im[3 * i + j] ?? 0

      a[i * n + j] = re
      a[(i + 3) * n + (j + 3)] = re
      a[(i + 3) * n + j] = im
      a[i * n + (j + 3)] = -im
    }
  }

  const v = new Float64Array(36)

  for (let i = 0; i < n; i++) {
    v[i * n + i] = 1
  }

  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        off += (a[p * n + q] ?? 0) ** 2
      }
    }

    if (off < 1e-30) {
      break
    }

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = a[p * n + q] ?? 0

        if (Math.abs(apq) < 1e-300) {
          continue
        }

        const theta = ((a[q * n + q] ?? 0) - (a[p * n + p] ?? 0)) / (2 * apq)
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c

        for (let k = 0; k < n; k++) {
          const akp = a[k * n + p] ?? 0
          const akq = a[k * n + q] ?? 0

          a[k * n + p] = c * akp - s * akq
          a[k * n + q] = s * akp + c * akq
        }

        for (let k = 0; k < n; k++) {
          const apk = a[p * n + k] ?? 0
          const aqk = a[q * n + k] ?? 0

          a[p * n + k] = c * apk - s * aqk
          a[q * n + k] = s * apk + c * aqk
        }

        for (let k = 0; k < n; k++) {
          const vkp = v[k * n + p] ?? 0
          const vkq = v[k * n + q] ?? 0

          v[k * n + p] = c * vkp - s * vkq
          v[k * n + q] = s * vkp + c * vkq
        }
      }
    }
  }

  // pair the doubled eigenvalues: sort, take every other, and read each complex vector off a column
  const order = Array.from({ length: n }, (_, i) => i).sort((x, y) => (a[x * n + x] ?? 0) - (a[y * n + y] ?? 0))
  const values: number[] = []
  const vectors: { re: number[]; im: number[] }[] = []
  const taken: { re: number[]; im: number[] }[] = []

  for (const col of order) {
    // complex vector x + i y from the column (x; y)
    let re = [0, 1, 2].map(k => v[k * n + col] ?? 0)
    let im = [0, 1, 2].map(k => v[(k + 3) * n + col] ?? 0)

    // Gram-Schmidt against the vectors already taken (complex inner product)
    for (const t of taken) {
      let dr = 0
      let di = 0

      for (let k = 0; k < 3; k++) {
        dr += (t.re[k] ?? 0) * (re[k] ?? 0) + (t.im[k] ?? 0) * (im[k] ?? 0)
        di += (t.re[k] ?? 0) * (im[k] ?? 0) - (t.im[k] ?? 0) * (re[k] ?? 0)
      }

      re = re.map((x, k) => x - (dr * (t.re[k] ?? 0) - di * (t.im[k] ?? 0)))
      im = im.map((x, k) => x - (dr * (t.im[k] ?? 0) + di * (t.re[k] ?? 0)))
    }

    const norm = Math.sqrt(re.reduce((s, x) => s + x * x, 0) + im.reduce((s, x) => s + x * x, 0))

    if (norm < 1e-6 || taken.length === 3) {
      continue
    }

    const vec = { re: re.map(x => x / norm), im: im.map(x => x / norm) }

    taken.push(vec)
    vectors.push(vec)
    values.push(a[col * n + col] ?? 0)
  }

  return { values, vectors }
}

export function traceNorm3(h: Complex3): number {
  return hermitian3(h).values.reduce((s, x) => s + Math.abs(x), 0)
}

// the sign of a Hermitian 3 x 3 (zero eigenvalues sent to +1)
export function sign3(h: Complex3): Complex3 {
  const { values, vectors } = hermitian3(h)
  const out = zero3()

  values.forEach((lambda, k) => {
    const s = lambda >= 0 ? 1 : -1
    const v = vectors[k]!

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        // v_i conj(v_j)
        const re = (v.re[i] ?? 0) * (v.re[j] ?? 0) + (v.im[i] ?? 0) * (v.im[j] ?? 0)
        const im = (v.im[i] ?? 0) * (v.re[j] ?? 0) - (v.re[i] ?? 0) * (v.im[j] ?? 0)

        out.re[3 * i + j] = (out.re[3 * i + j] ?? 0) + s * re
        out.im[3 * i + j] = (out.im[3 * i + j] ?? 0) + s * im
      }
    }
  })

  return out
}

// D X^T D for D = diag(sqrt p)
function sandwich(p: readonly number[], x: Complex3): Complex3 {
  const out = zero3()

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const w = Math.sqrt((p[i] ?? 0) * (p[j] ?? 0))

      out.re[3 * i + j] = w * (x.re[3 * j + i] ?? 0)
      out.im[3 * i + j] = w * (x.im[3 * j + i] ?? 0)
    }
  }

  return out
}

function add3(a: Complex3, b: Complex3, s: number): Complex3 {
  return { re: a.re.map((x, i) => x + s * (b.re[i] ?? 0)), im: a.im.map((x, i) => x + s * (b.im[i] ?? 0)) }
}

// the CHSH value of Alice's pair at its best Bob: || D X D ||_1 + || D Y D ||_1
export function aliceValue(p: readonly number[], a0: Complex3, a1: Complex3): number {
  return traceNorm3(sandwich(p, add3(a0, a1, 1))) + traceNorm3(sandwich(p, add3(a0, a1, -1)))
}

// a Hermitian 3 x 3 from nine numbers in [0, 1)
function hermitianFrom(u: readonly number[]): Complex3 {
  const h = zero3()
  let k = 0

  for (let i = 0; i < 3; i++) {
    for (let j = i; j < 3; j++) {
      const re = (u[k++] ?? 0) - 0.5

      h.re[3 * i + j] = re
      h.re[3 * j + i] = re

      if (i !== j) {
        const im = (u[k++] ?? 0) - 0.5

        h.im[3 * i + j] = im
        h.im[3 * j + i] = -im
      }
    }
  }

  return h
}

// the see-saw on the pure Schmidt state from `starts` golden Weyl starts: the largest value found, and the
// observables that found it
export function pureSeeSaw(p: readonly number[], starts: number): { value: number; a0: Complex3; a1: Complex3 } {
  let best = { value: Number.NEGATIVE_INFINITY, a0: zero3(), a1: zero3() }
  // eighteen Weyl rates: frac(sqrt q) for the primes 2 .. 61
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61]
  const rates = primes.map(q => Math.sqrt(q) % 1)

  for (let s = 1; s <= starts; s++) {
    const u = rates.map(r => (s * r) % 1)
    let a0 = sign3(hermitianFrom(u.slice(0, 9)))
    let a1 = sign3(hermitianFrom(u.slice(9, 18)))
    let value = aliceValue(p, a0, a1)

    for (let step = 0; step < 400; step++) {
      const b0 = sign3(sandwich(p, add3(a0, a1, 1)))
      const b1 = sign3(sandwich(p, add3(a0, a1, -1)))

      a0 = sign3(sandwich(p, add3(b0, b1, 1)))
      a1 = sign3(sandwich(p, add3(b0, b1, -1)))

      const next = aliceValue(p, a0, a1)

      if (Math.abs(next - value) < 1e-15) {
        value = next
        break
      }

      value = next
    }

    if (value > best.value) {
      best = { value, a0, a1 }
    }
  }

  return best
}

// A density on two roles, row-major 9 x 9, index 3 i + j (first role i). The operators each side meets:
//   Tr[(A (x) B) rho] = sum A_ik B_jl rho_(k l),(i j)
//   Bob's, for Alice's X:   beta_lj  = sum_ik X_ik rho_(k l),(i j)
//   Alice's, for Bob's Y:   alpha_ki = sum_jl Y_jl rho_(k l),(i j)
// each read as a Hermitian operator on its role (Tr[B beta] = sum B_jl beta_lj).
export type Density9 = { re: Float64Array; im: Float64Array }

function meets(rho: Density9, x: Complex3, side: 'bob' | 'alice'): Complex3 {
  const out = zero3()

  for (let i = 0; i < 3; i++) {
    for (let k = 0; k < 3; k++) {
      for (let j = 0; j < 3; j++) {
        for (let l = 0; l < 3; l++) {
          const at = (3 * k + l) * 9 + (3 * i + j)
          const rr = rho.re[at] ?? 0
          const ri = rho.im[at] ?? 0
          // the observable's entry: X_ik for Bob's operator, Y_jl for Alice's
          const xr = side === 'bob' ? (x.re[3 * i + k] ?? 0) : (x.re[3 * j + l] ?? 0)
          const xi = side === 'bob' ? (x.im[3 * i + k] ?? 0) : (x.im[3 * j + l] ?? 0)
          // the product lands at beta_lj (Bob) or alpha_ki (Alice)
          const to = side === 'bob' ? 3 * l + j : 3 * k + i

          out.re[to] = (out.re[to] ?? 0) + xr * rr - xi * ri
          out.im[to] = (out.im[to] ?? 0) + xr * ri + xi * rr
        }
      }
    }
  }

  return out
}

// the see-saw on a general two-role density from `starts` Weyl starts: Bob and Alice in turn take the sign
// of the operator their partner's observables leave them, which never lowers the value
export function densitySeeSaw(rho: Density9, starts: number): number {
  let best = Number.NEGATIVE_INFINITY
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61]
  const rates = primes.map(q => Math.sqrt(q) % 1)
  const valueOf = (a0: Complex3, a1: Complex3): number => traceNorm3(meets(rho, add3(a0, a1, 1), 'bob')) + traceNorm3(meets(rho, add3(a0, a1, -1), 'bob'))

  for (let s = 1; s <= starts; s++) {
    const u = rates.map(r => (s * r) % 1)
    let a0 = sign3(hermitianFrom(u.slice(0, 9)))
    let a1 = sign3(hermitianFrom(u.slice(9, 18)))
    let value = valueOf(a0, a1)

    for (let step = 0; step < 400; step++) {
      const b0 = sign3(meets(rho, add3(a0, a1, 1), 'bob'))
      const b1 = sign3(meets(rho, add3(a0, a1, -1), 'bob'))

      a0 = sign3(meets(rho, add3(b0, b1, 1), 'alice'))
      a1 = sign3(meets(rho, add3(b0, b1, -1), 'alice'))

      const next = valueOf(a0, a1)

      if (Math.abs(next - value) < 1e-15) {
        value = next
        break
      }

      value = next
    }

    best = Math.max(best, value)
  }

  return best
}

// THE THEOREM (E-QTM-0132), for a pure state with Schmidt weights p1 >= p2 >= p3:
//   CHSH_max = 2 sqrt((p1 + p2)^2 + 4 p1 p2) + 2 p3.
// Upper bound: Alice's pair splits C^3 into a plane S and a line E, Bob's into T and F (Jordan). The Bell
// operator is block diagonal on S x T, S x F, E x T, E x F. On S x T it is a qubit CHSH operator, worth at
// most 2 sqrt((a + b)^2 + 4 a b) on the block's piece of psi (Horodecki, a and b its squared singular
// values); on each other block it is a sign times at most 2. So CHSH <= 2 sqrt((a + b)^2 + 4 a b) +
// 2 (1 - a - b), which grows in a and in b, and a compression's singular values sit below the whole's
// (a <= p1, b <= p2). Reached by the Schmidt-aligned blocks. So this is the maximum, not a lower bound.
export function pureChshExact(schmidt: readonly number[]): number {
  const [a = 0, b = 0, c = 0] = [...schmidt].sort((x, y) => y - x)

  return 2 * Math.sqrt((a + b) ** 2 + 4 * a * b) + 2 * c
}

// the pairing form of code/measure/bell-gates, the best Schmidt-aligned block choice
export function pairingForm(p: readonly number[]): number {
  const [a = 0, b = 0, c = 0] = p
  const pair = (x: number, y: number, z: number): number => 2 * Math.sqrt((x + y) ** 2 + 4 * x * y) + 2 * z

  return Math.max(pair(a, b, c), pair(a, c, b), pair(b, c, a))
}
