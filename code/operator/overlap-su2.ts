// B2 down-payment: the chiral overlap fermion in a dynamical NON-ABELIAN (SU(2))
// gauge field. The full chiral gauge theory (the Weyl projection coupled to a
// non-Abelian field) is open in physics, but we can reach the rung below it: a
// vector-like overlap fermion coupled to a dynamical SU(2) field, and show the
// chiral condensate forms from the anomaly, as for the Abelian Schwinger model.
// The fermion carries spin (2) times color (2) = 4 components per site, the link
// is an SU(2) matrix acting on color, and gamma5 acts on spin. See
// note/questions/remaining-frontier-spec.md (B2).

import {
  ComplexMatrix,
  makeComplexMatrix,
} from '@/code/algebra/linear/dense'
import { modulo } from '@/code/tool/integer'
import {
  hermitianMatrixSign,
  eigHermitian,
} from '@/code/algebra/linear/eig-hermitian'
import { Rng } from '@/code/tool/rng'

interface C4 {
  re: [number, number, number, number]
  im: [number, number, number, number]
}
// Spin projectors I -/+ gamma_mu (gamma1 = sigma_x, gamma2 = sigma_y), as complex
// 2x2 blocks in row-major [00, 01, 10, 11].
const SPIN_I_MINUS_SX: C4 = { re: [1, -1, -1, 1], im: [0, 0, 0, 0] }
const SPIN_I_PLUS_SX: C4 = { re: [1, 1, 1, 1], im: [0, 0, 0, 0] }
const SPIN_I_MINUS_SY: C4 = { re: [1, 0, 0, 1], im: [0, 1, -1, 0] }
const SPIN_I_PLUS_SY: C4 = { re: [1, 0, 0, 1], im: [0, -1, 1, 0] }

function site(n1: number, n2: number, L: number): number {
  return modulo(n1, L) + modulo(n2, L) * L
}

// An SU(2) matrix from a unit quaternion: U = q0 I + i(q.sigma).
function colorMatrix(
  q: [number, number, number, number],
  dagger: boolean,
): C4 {
  const [q0, q1, q2, q3] = q
  // U.re = [q0, q2, -q2, q0], U.im = [q3, q1, q1, -q3].
  const re: [number, number, number, number] = [q0, q2, -q2, q0]
  const im: [number, number, number, number] = [q3, q1, q1, -q3]
  if (!dagger) {
    return { re, im }
  }
  // Conjugate transpose: swap off-diagonal, negate all imaginary parts.
  return {
    re: [re[0], re[2], re[1], re[3]],
    im: [-im[0], -im[2], -im[1], -im[3]],
  }
}

// Add coef * (spin block tensor color block) into the 4x4 site block.
function addBlock4(input: {
  m: ComplexMatrix
  rowSite: number
  colSite: number
  spin: C4
  color: C4
  coef: number
}): void {
  const n = input.m.rows
  for (let si = 0; si < 2; si++) {
    for (let sj = 0; sj < 2; sj++) {
      const spRe = input.spin.re[si * 2 + sj] ?? 0
      const spIm = input.spin.im[si * 2 + sj] ?? 0
      for (let ci = 0; ci < 2; ci++) {
        for (let cj = 0; cj < 2; cj++) {
          const coRe = input.color.re[ci * 2 + cj] ?? 0
          const coIm = input.color.im[ci * 2 + cj] ?? 0
          // (sp * co) * coef
          let re = spRe * coRe - spIm * coIm
          let im = spRe * coIm + spIm * coRe
          re *= input.coef
          im *= input.coef
          const row = input.rowSite * 4 + si * 2 + ci
          const col = input.colSite * 4 + sj * 2 + cj
          input.m.re[row * n + col] =
            (input.m.re[row * n + col] ?? 0) + re
          input.m.im[row * n + col] =
            (input.m.im[row * n + col] ?? 0) + im
        }
      }
    }
  }
}

const IDENT_SPIN: C4 = { re: [1, 0, 0, 1], im: [0, 0, 0, 0] }
const IDENT_COLOR: C4 = { re: [1, 0, 0, 1], im: [0, 0, 0, 0] }

function randomSu2(
  disorder: number,
  rng: Rng,
): [number, number, number, number] {
  const q1 = (rng.next() * 2 - 1) * disorder
  const q2 = (rng.next() * 2 - 1) * disorder
  const q3 = (rng.next() * 2 - 1) * disorder
  const norm = Math.hypot(1, q1, q2, q3)
  return [1 / norm, q1 / norm, q2 / norm, q3 / norm]
}

function gaugeWilsonDiracSu2(input: {
  length: number
  links1: Array<[number, number, number, number]>
  links2: Array<[number, number, number, number]>
}): ComplexMatrix {
  const L = input.length
  const sites = L * L
  const d = makeComplexMatrix({ rows: 4 * sites, cols: 4 * sites })
  for (let n1 = 0; n1 < L; n1++) {
    for (let n2 = 0; n2 < L; n2++) {
      const x = site(n1, n2, L)
      // diagonal mass term M0 = 2 (spin identity tensor color identity).
      addBlock4({
        m: d,
        rowSite: x,
        colSite: x,
        spin: IDENT_SPIN,
        color: IDENT_COLOR,
        coef: 2,
      })
      // mu = 1
      addBlock4({
        m: d,
        rowSite: x,
        colSite: site(n1 + 1, n2, L),
        spin: SPIN_I_MINUS_SX,
        color: colorMatrix(input.links1[x] ?? [1, 0, 0, 0], false),
        coef: -0.5,
      })
      addBlock4({
        m: d,
        rowSite: x,
        colSite: site(n1 - 1, n2, L),
        spin: SPIN_I_PLUS_SX,
        color: colorMatrix(
          input.links1[site(n1 - 1, n2, L)] ?? [1, 0, 0, 0],
          true,
        ),
        coef: -0.5,
      })
      // mu = 2
      addBlock4({
        m: d,
        rowSite: x,
        colSite: site(n1, n2 + 1, L),
        spin: SPIN_I_MINUS_SY,
        color: colorMatrix(input.links2[x] ?? [1, 0, 0, 0], false),
        coef: -0.5,
      })
      addBlock4({
        m: d,
        rowSite: x,
        colSite: site(n1, n2 - 1, L),
        spin: SPIN_I_PLUS_SY,
        color: colorMatrix(
          input.links2[site(n1, n2 - 1, L)] ?? [1, 0, 0, 0],
          true,
        ),
        coef: -0.5,
      })
    }
  }
  return d
}

// The chiral condensate signal (Banks-Casher near-zero density) of the SU(2)
// overlap, averaged over random SU(2) gauge configurations.
export function chiralCondensateSignalSU2(input: {
  length: number
  disorder: number
  configs: number
  m0?: number
  tolerance?: number
  rng: Rng
}): { nearZeroDensity: number } {
  const L = input.length
  const m0 = input.m0 ?? 1
  const tol = input.tolerance ?? 0.05
  const n = 4 * L * L
  const sites = L * L
  let nearZero = 0
  let totalEig = 0

  for (let c = 0; c < input.configs; c++) {
    const links1: Array<[number, number, number, number]> = []
    const links2: Array<[number, number, number, number]> = []
    for (let s = 0; s < sites; s++) {
      links1.push(randomSu2(input.disorder, input.rng))
      links2.push(randomSu2(input.disorder, input.rng))
    }
    const dw = gaugeWilsonDiracSu2({ length: L, links1, links2 })
    // H_W = gamma5 (D_W - m0). gamma5 acts on spin: rows with spin index 1
    // (local index in {2,3}) flip sign.
    for (let i = 0; i < n; i++) {
      dw.re[i * n + i] = (dw.re[i * n + i] ?? 0) - m0
    }
    for (let row = 0; row < n; row++) {
      if (row % 4 >= 2) {
        for (let col = 0; col < n; col++) {
          dw.re[row * n + col] = -(dw.re[row * n + col] ?? 0)
          dw.im[row * n + col] = -(dw.im[row * n + col] ?? 0)
        }
      }
    }
    const epsilon = hermitianMatrixSign({ matrix: dw })
    // H_ov = gamma5 + epsilon.
    for (let i = 0; i < n; i++) {
      epsilon.re[i * n + i] =
        (epsilon.re[i * n + i] ?? 0) + (i % 4 < 2 ? 1 : -1)
    }
    const eig = eigHermitian({ matrix: epsilon })
    for (let k = 0; k < eig.values.length; k++) {
      if (Math.abs(eig.values[k] ?? 0) < tol) {
        nearZero += 1
      }
      totalEig += 1
    }
  }

  return { nearZeroDensity: totalEig > 0 ? nearZero / totalEig : 0 }
}
