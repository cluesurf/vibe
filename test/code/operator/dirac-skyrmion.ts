// Conformance for code/operator/dirac-skyrmion: the 3D Dirac operator on a
// hedgehog background, H = alpha.p + phi (beta (x) (rhat.tau)). The alpha and beta
// matrices are private, but their defining algebra is fully observable through the
// public operator H (built column by column via applyH on basis vectors):
//   - H is Hermitian.
//   - For the FREE operator (phi = 0), H^2 = (sum_i p_i^2) (x) I_8: it is diagonal
//     in the 8-component internal space and identical on each component. This holds
//     iff alpha_i^2 = I and {alpha_i, alpha_j} = 0 (the full Clifford algebra).
//   - For a UNIFORM mass/direction, H^2 = free H^2 + M^2 I. This extra term being a
//     pure internal-identity holds iff beta^2 = I and {alpha_i, beta} = 0.
// All checks use only the public applyH, so the private matrices are tested
// indirectly but rigorously.

import { suite, check, close } from '@/test/code/harness'
import { makeDirac } from '@/code/operator/dirac-skyrmion'
import { newCx } from '@/code/algebra/linear/complex-vector'

interface Dense {
  dim: number
  re: Float64Array
  im: Float64Array
}

// Materialize H as a dense complex matrix: column j is H applied to basis vector j.
function buildH(L: number, M: number, R: number, mode: 'bag' | 'uniformz'): Dense {
  const { dim, applyH } = makeDirac(L, M, R, mode)
  const re = new Float64Array(dim * dim)
  const im = new Float64Array(dim * dim)
  const v = newCx(dim)
  const o = newCx(dim)

  for (let j = 0; j < dim; j++) {
    v.re.fill(0)
    v.im.fill(0)
    v.re[j] = 1
    applyH(v, o)

    for (let i = 0; i < dim; i++) {
      re[i * dim + j] = o.re[i] ?? 0
      im[i * dim + j] = o.im[i] ?? 0
    }
  }

  return { dim, re, im }
}

// Complex matrix square H^2 = H . H.
function square(h: Dense): Dense {
  const n = h.dim
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < n; k++) {
        const ar = h.re[i * n + k] ?? 0
        const ai = h.im[i * n + k] ?? 0
        const br = h.re[k * n + j] ?? 0
        const bi = h.im[k * n + j] ?? 0
        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }

      re[i * n + j] = sr
      im[i * n + j] = si
    }
  }

  return { dim: n, re, im }
}

const L = 2 // dim = 8 * L^3 = 64

suite('operator/dirac-skyrmion: Hermiticity', [
  check('H is Hermitian (hedgehog bag background)', () => {
    const h = buildH(L, 0.7, 1, 'bag')
    const n = h.dim

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        close(h.re[i * n + j] ?? 0, h.re[j * n + i] ?? 0, 1e-12, `re Hermitian (${i},${j})`)
        close(h.im[i * n + j] ?? 0, -(h.im[j * n + i] ?? 0), 1e-12, `im anti (${i},${j})`)
      }
    }
  }),
])

suite('operator/dirac-skyrmion: Clifford algebra via H^2', [
  check('free H^2 is internal-diagonal: {alpha_i, alpha_j} = 0 for i != j', () => {
    // M = 0 -> phi = 0 -> pure kinetic operator.
    const h2 = square(buildH(L, 0, 0, 'bag'))
    const n = h2.dim

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        // internal index = position mod 8; different internal indices must not mix.
        if (i % 8 !== j % 8) {
          close(h2.re[i * n + j] ?? 0, 0, 1e-12, `H^2 internal off-diagonal re (${i},${j})`)
          close(h2.im[i * n + j] ?? 0, 0, 1e-12, `H^2 internal off-diagonal im (${i},${j})`)
        }
      }
    }
  }),
  check('free H^2 acts identically on each of the 8 internal components: alpha_i^2 = I', () => {
    const h2 = square(buildH(L, 0, 0, 'bag'))
    const n = h2.dim
    const sites = n / 8

    // For each pair of sites, the diagonal-in-internal entry must be the same for
    // every internal index a in 0..7 (the kinetic scalar is internal-independent).
    for (let sa = 0; sa < sites; sa++) {
      for (let sb = 0; sb < sites; sb++) {
        const ref = h2.re[(sa * 8 + 0) * n + (sb * 8 + 0)] ?? 0
        const refIm = h2.im[(sa * 8 + 0) * n + (sb * 8 + 0)] ?? 0

        for (let a = 1; a < 8; a++) {
          close(
            h2.re[(sa * 8 + a) * n + (sb * 8 + a)] ?? 0,
            ref,
            1e-12,
            `internal-independent re sites (${sa},${sb}) comp ${a}`,
          )
          close(
            h2.im[(sa * 8 + a) * n + (sb * 8 + a)] ?? 0,
            refIm,
            1e-12,
            `internal-independent im sites (${sa},${sb}) comp ${a}`,
          )
        }
      }
    }
  }),
  check('uniform-mass H^2 = free H^2 + M^2 I: beta^2 = I and {alpha_i, beta} = 0', () => {
    const M = 0.5
    const free = square(buildH(L, 0, 0, 'bag'))
    const massive = square(buildH(L, M, 1, 'uniformz'))
    const n = free.dim

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const add = i === j ? M * M : 0
        close(
          massive.re[i * n + j] ?? 0,
          (free.re[i * n + j] ?? 0) + add,
          1e-12,
          `H^2(uniform) - H^2(free) re (${i},${j})`,
        )
        close(
          massive.im[i * n + j] ?? 0,
          free.im[i * n + j] ?? 0,
          1e-12,
          `H^2(uniform) - H^2(free) im (${i},${j})`,
        )
      }
    }
  }),
])
