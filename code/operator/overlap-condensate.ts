// The chiral condensate of the overlap fermion in a dynamical U(1) gauge field
// (the 2D Schwinger model, P8 / A4). The overlap is gamma5-Hermitian, so
// H_ov = gamma5 D_ov = gamma5 + sign(H_W) is Hermitian and its spectrum is real.
// By Banks-Casher the chiral condensate is proportional to the spectral density of
// the Hermitian Dirac operator at zero, so a nonzero near-zero density signals a
// nonzero condensate. The Schwinger condensate is nonzero purely from the anomaly,
// and grows with gauge disorder. See note/questions/remaining-frontier-spec.md (A4).

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
import { Block, addComplexBlock } from '@/code/operator/block'

const I_MINUS_SX: Block = { re: [1, -1, -1, 1], im: [0, 0, 0, 0] }
const I_PLUS_SX: Block = { re: [1, 1, 1, 1], im: [0, 0, 0, 0] }
const I_MINUS_SY: Block = { re: [1, 0, 0, 1], im: [0, 1, -1, 0] }
const I_PLUS_SY: Block = { re: [1, 0, 0, 1], im: [0, -1, 1, 0] }

function site(n1: number, n2: number, L: number): number {
  return modulo(n1, L) + modulo(n2, L) * L
}

// A random U(1) gauge field: each link phase is uniform in [-disorder*pi,
// disorder*pi]. disorder = 0 is the free field, larger is stronger coupling.
function randomLinks(input: {
  length: number
  disorder: number
  rng: Rng
}): {
  u1: Float64Array
  u2: Float64Array
} {
  const sites = input.length * input.length
  const u1 = new Float64Array(sites)
  const u2 = new Float64Array(sites)
  for (let s = 0; s < sites; s++) {
    u1[s] = (input.rng.next() * 2 - 1) * Math.PI * input.disorder
    u2[s] = (input.rng.next() * 2 - 1) * Math.PI * input.disorder
  }
  return { u1, u2 }
}

function gaugeWilsonDiracRandom(input: {
  length: number
  u1: Float64Array
  u2: Float64Array
}): ComplexMatrix {
  const L = input.length
  const sites = L * L
  const d = makeComplexMatrix({ rows: 2 * sites, cols: 2 * sites })
  const ph = (theta: number): { re: number; im: number } => ({
    re: Math.cos(theta),
    im: Math.sin(theta),
  })
  for (let n1 = 0; n1 < L; n1++) {
    for (let n2 = 0; n2 < L; n2++) {
      const x = site(n1, n2, L)
      addComplexBlock({
        matrix: d,
        rowSite: x,
        colSite: x,
        block: { re: [1, 0, 0, 1], im: [0, 0, 0, 0] },
        phaseRe: 1,
        phaseIm: 0,
        coefficient: 2,
      })
      // mu = 1
      const u1x = ph(input.u1[x] ?? 0)
      addComplexBlock({
        matrix: d,
        rowSite: x,
        colSite: site(n1 + 1, n2, L),
        block: I_MINUS_SX,
        phaseRe: u1x.re,
        phaseIm: u1x.im,
        coefficient: -0.5,
      })
      const u1b = ph(input.u1[site(n1 - 1, n2, L)] ?? 0)
      addComplexBlock({
        matrix: d,
        rowSite: x,
        colSite: site(n1 - 1, n2, L),
        block: I_PLUS_SX,
        phaseRe: u1b.re,
        phaseIm: -u1b.im,
        coefficient: -0.5,
      })
      // mu = 2
      const u2x = ph(input.u2[x] ?? 0)
      addComplexBlock({
        matrix: d,
        rowSite: x,
        colSite: site(n1, n2 + 1, L),
        block: I_MINUS_SY,
        phaseRe: u2x.re,
        phaseIm: u2x.im,
        coefficient: -0.5,
      })
      const u2b = ph(input.u2[site(n1, n2 - 1, L)] ?? 0)
      addComplexBlock({
        matrix: d,
        rowSite: x,
        colSite: site(n1, n2 - 1, L),
        block: I_PLUS_SY,
        phaseRe: u2b.re,
        phaseIm: -u2b.im,
        coefficient: -0.5,
      })
    }
  }
  return d
}

// The near-zero spectral density of the gamma5-Hermitian overlap, averaged over
// random gauge configurations. By Banks-Casher this is proportional to the chiral
// condensate. Returns the fraction of eigenvalues with |lambda| < tolerance.
export function chiralCondensateSignal(input: {
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
  const n = 2 * L * L
  let nearZero = 0
  let totalEig = 0

  for (let c = 0; c < input.configs; c++) {
    const links = randomLinks({
      length: L,
      disorder: input.disorder,
      rng: input.rng,
    })
    const dw = gaugeWilsonDiracRandom({
      length: L,
      u1: links.u1,
      u2: links.u2,
    })
    // H_W = gamma5 (D_W - m0): subtract m0 on the diagonal, negate spin-down rows.
    for (let i = 0; i < n; i++) {
      dw.re[i * n + i] = (dw.re[i * n + i] ?? 0) - m0
    }
    for (let row = 0; row < n; row++) {
      if (row % 2 === 1) {
        for (let col = 0; col < n; col++) {
          dw.re[row * n + col] = -(dw.re[row * n + col] ?? 0)
          dw.im[row * n + col] = -(dw.im[row * n + col] ?? 0)
        }
      }
    }
    const epsilon = hermitianMatrixSign({ matrix: dw })
    // H_ov = gamma5 + epsilon (gamma5 is +1 on spin-up, -1 on spin-down diagonal).
    for (let i = 0; i < n; i++) {
      epsilon.re[i * n + i] =
        (epsilon.re[i * n + i] ?? 0) + (i % 2 === 0 ? 1 : -1)
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
