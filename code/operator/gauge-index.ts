// The lattice index theorem: the overlap fermion in a U(1) gauge background.
// We build a 2D U(1) field of topological charge Q, the gauge Wilson-Dirac
// operator, the overlap operator from it, and count its zero modes. The
// Atiyah-Singer index theorem on the lattice says the zero-mode count equals |Q|:
// the chiral fermion sees gauge topology exactly, as an integer. This is the
// genuine coupling of the chiral fermion (P4) to the gauge field (P8).
// See note/questions/frontier-spec.md.

import {
  ComplexMatrix,
  makeComplexMatrix,
} from '@/code/algebra/linear/dense'
import { modulo } from '@/code/tool/integer'
import { cMul, cConj } from '@/code/algebra/linear/complex'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { Block, addComplexBlock } from '@/code/operator/block'

const I2: Block = { re: [1, 0, 0, 1], im: [0, 0, 0, 0] }
// Wilson projectors r I -/+ gamma_mu, with r = 1. gamma1 = sigma_x, gamma2 = sigma_y.
const P1_MINUS: Block = { re: [1, -1, -1, 1], im: [0, 0, 0, 0] }
const P1_PLUS: Block = { re: [1, 1, 1, 1], im: [0, 0, 0, 0] }
const P2_MINUS: Block = { re: [1, 0, 0, 1], im: [0, 1, -1, 0] }
const P2_PLUS: Block = { re: [1, 0, 0, 1], im: [0, -1, 1, 0] }

// The uniform-flux U(1) link phases on an L by L torus with topological charge Q.
// U_1(n1,n2) = exp(-i F n2); U_2(n1,n2) = exp(i F L n1) on the top row, else 1.
function linkPhase(input: {
  mu: number
  n1: number
  n2: number
  flux: number
  length: number
}): { re: number; im: number } {
  // Wrap coordinates onto the torus. The link variables live on sites mod L; the
  // boundary twist in U_2 supplies the holonomy, so a neighbor at n2 = L is the
  // link at n2 = 0, not exp(-i F L).
  const L = input.length
  const n1 = modulo(input.n1, L)
  const n2 = modulo(input.n2, L)

  let phase = 0

  if (input.mu === 1) {
    phase = -input.flux * n2
  } else if (n2 === L - 1) {
    phase = input.flux * L * n1
  }

  return { re: Math.cos(phase), im: Math.sin(phase) }
}

function site(n1: number, n2: number, L: number): number {
  return modulo(n1, L) + modulo(n2, L) * L
}

// Total gauge flux (sum of plaquette phases). Self-check: equals 2 pi Q.
export function totalFlux(input: {
  length: number
  charge: number
}): number {
  const L = input.length
  const F = (2 * Math.PI * input.charge) / (L * L)

  let total = 0

  for (let n1 = 0; n1 < L; n1++) {
    for (let n2 = 0; n2 < L; n2++) {
      const u1 = linkPhase({ mu: 1, n1, n2, flux: F, length: L })
      const u2x = linkPhase({
        mu: 2,
        n1: n1 + 1,
        n2,
        flux: F,
        length: L,
      })

      const u1y = linkPhase({
        mu: 1,
        n1,
        n2: n2 + 1,
        flux: F,
        length: L,
      })

      const u2 = linkPhase({ mu: 2, n1, n2, flux: F, length: L })
      // plaquette = U1(x) U2(x+1) U1(x+2)* U2(x)*
      const a = cMul(u1, u2x)
      const b = cMul(cConj(u1y), cConj(u2))
      const p = cMul(a, b)
      total += Math.atan2(p.im, p.re)
    }
  }

  return total
}

// Build the gauge Wilson-Dirac operator (m = 0) on the L by L torus with charge Q.
export function gaugeWilsonDirac(input: {
  length: number
  charge: number
}): ComplexMatrix {
  const L = input.length
  const F = (2 * Math.PI * input.charge) / (L * L)
  const sites = L * L
  const d = makeComplexMatrix({ rows: 2 * sites, cols: 2 * sites })

  for (let n1 = 0; n1 < L; n1++) {
    for (let n2 = 0; n2 < L; n2++) {
      const x = site(n1, n2, L)
      // diagonal mass term: M0 = r * dim = 2.
      addComplexBlock({
        matrix: d,
        rowSite: x,
        colSite: x,
        block: I2,
        phaseRe: 1,
        phaseIm: 0,
        coefficient: 2,
      })

      // mu = 1 (x direction)
      {
        const u = linkPhase({ mu: 1, n1, n2, flux: F, length: L })
        const xPlus = site(n1 + 1, n2, L)
        addComplexBlock({
          matrix: d,
          rowSite: x,
          colSite: xPlus,
          block: P1_MINUS,
          phaseRe: u.re,
          phaseIm: u.im,
          coefficient: -0.5,
        })

        const uBack = linkPhase({
          mu: 1,
          n1: n1 - 1,
          n2,
          flux: F,
          length: L,
        })

        const xMinus = site(n1 - 1, n2, L)
        addComplexBlock({
          matrix: d,
          rowSite: x,
          colSite: xMinus,
          block: P1_PLUS,
          phaseRe: uBack.re,
          phaseIm: -uBack.im,
          coefficient: -0.5,
        })
      }

      // mu = 2 (y direction)
      {
        const u = linkPhase({ mu: 2, n1, n2, flux: F, length: L })
        const xPlus = site(n1, n2 + 1, L)
        addComplexBlock({
          matrix: d,
          rowSite: x,
          colSite: xPlus,
          block: P2_MINUS,
          phaseRe: u.re,
          phaseIm: u.im,
          coefficient: -0.5,
        })

        const uBack = linkPhase({
          mu: 2,
          n1,
          n2: n2 - 1,
          flux: F,
          length: L,
        })

        const xMinus = site(n1, n2 - 1, L)
        addComplexBlock({
          matrix: d,
          rowSite: x,
          colSite: xMinus,
          block: P2_PLUS,
          phaseRe: uBack.re,
          phaseIm: -uBack.im,
          coefficient: -0.5,
        })
      }
    }
  }

  return d
}

// Negate the spin-down rows (gamma5 acting from the left, gamma5 = diag(1, -1)).
function gamma5RowsInPlace(m: ComplexMatrix): void {
  const n = m.rows

  for (let row = 0; row < n; row++) {
    if (row % 2 === 1) {
      for (let col = 0; col < n; col++) {
        m.re[row * n + col] = -(m.re[row * n + col] ?? 0)
        m.im[row * n + col] = -(m.im[row * n + col] ?? 0)
      }
    }
  }
}

// Maximum Hermiticity violation of a matrix, |M[i,j] - conj(M[j,i])|. The kernel
// H_W must be Hermitian for the eigensolver to be valid; this is the self-check.
function hermiticityError(m: ComplexMatrix): number {
  const n = m.rows

  let worst = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const dr = (m.re[i * n + j] ?? 0) - (m.re[j * n + i] ?? 0)
      const di = (m.im[i * n + j] ?? 0) + (m.im[j * n + i] ?? 0)
      const e = Math.hypot(dr, di)

      if (e > worst) {
        worst = e
      }
    }
  }

  return worst
}

// Build the overlap kernel in the gauge background and compute its index, the
// signed count of chiral zero modes, via the spectral-asymmetry form of the
// overlap index theorem: index = -(1/2) Tr(sign(H_W)) = -(1/2) sum_i sign(lambda_i)
// of the Hermitian kernel H_W = gamma5 (D_W - m0). The spectral asymmetry counts
// the net zero crossings as the mass is dialed, which is the topological charge,
// so non-topological free zero modes do not pollute it. The lattice index theorem
// predicts index = +/- charge (a fixed sign convention). Total flux and the
// Hermiticity error are returned as self-checks.
export function overlapIndex(input: {
  length: number
  charge: number
  m0?: number
}): {
  index: number
  flux: number
  charge: number
  hermiticityError: number
} {
  const L = input.length
  const m0 = input.m0 ?? 1
  const n = 2 * L * L

  const dw = gaugeWilsonDirac({ length: L, charge: input.charge })

  // H_W = gamma5 (D_W - m0): subtract m0 from the diagonal, then apply gamma5.
  for (let i = 0; i < n; i++) {
    dw.re[i * n + i] = (dw.re[i * n + i] ?? 0) - m0
  }

  gamma5RowsInPlace(dw)

  const hermError = hermiticityError(dw)

  const eig = eigHermitian({ matrix: dw })

  let asymmetry = 0

  for (const eigenvalue of eig.values) {
    const lambda = eigenvalue ?? 0
    asymmetry += lambda > 0 ? 1 : lambda < 0 ? -1 : 0
  }

  const index = -0.5 * asymmetry

  return {
    index,
    flux: totalFlux({ length: L, charge: input.charge }),
    charge: input.charge,
    hermiticityError: hermError,
  }
}
