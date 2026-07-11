// Bulk-boundary correspondence, read off the walk operator's OWN spectrum. Where two regions of a
// chiral walk carry different bulk winding numbers, the interface between them binds protected edge
// modes at the gap centre (quasienergy 0 or pi), and the NUMBER of them is fixed by the winding jump,
// not by any detail of the interface. This is the bulk-boundary correspondence, the theorem that a
// bulk topological invariant forces boundary states (the principle behind topological insulator edge
// channels). It is measured here by diagonalising the split-step walk's one-step unitary on a periodic
// chain with a phase interface, and counting the in-gap eigenstates localised at the interface.
//
// The one-step unitary U = R(theta1/2) T R(theta2) T R(theta1/2), with theta1 taking one value on the
// left half of the ring and another on the right (so the ring has two interfaces). U is unitary, so its
// eigenvalues lie on the unit circle at e^{i*quasienergy}; the Hermitian A = (U + U^dagger)/2 has the
// SAME eigenvectors and eigenvalues cos(quasienergy), so a gap-centre mode (quasienergy 0 or pi) shows
// up as an eigenvalue of A near +1 or -1. An edge mode is such an eigenstate localised at an interface.

import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { makeComplexMatrix } from '@/code/algebra/linear/dense'

// apply the split-step walk U = R(th1/2) T R(th2) T R(th1/2) to a complex state (re, im over 2L slots,
// slot 2x+s = site x, spin s), th1 a per-site function, th2 uniform.
function applyStep(
  reIn: Float64Array,
  imIn: Float64Array,
  L: number,
  th1: (x: number) => number,
  th2: (x: number) => number,
): [Float64Array, Float64Array] {
  const idx = (x: number, s: number): number => 2 * x + s
  const wrap = (x: number): number => ((x % L) + L) % L

  let re = reIn.slice()
  let im = imIn.slice()

  const coin = (th: (x: number) => number): void => {
    const r2 = new Float64Array(2 * L)
    const i2 = new Float64Array(2 * L)

    for (let x = 0; x < L; x++) {
      const c = Math.cos(th(x) / 2)
      const s = Math.sin(th(x) / 2)
      const ur = re[idx(x, 0)]!
      const ui = im[idx(x, 0)]!
      const dr = re[idx(x, 1)]!
      const di = im[idx(x, 1)]!

      r2[idx(x, 0)] = c * ur - s * dr
      i2[idx(x, 0)] = c * ui - s * di
      r2[idx(x, 1)] = s * ur + c * dr
      i2[idx(x, 1)] = s * ui + c * di
    }

    re = r2
    im = i2
  }

  const shift = (): void => {
    const r2 = new Float64Array(2 * L)
    const i2 = new Float64Array(2 * L)

    for (let x = 0; x < L; x++) {
      r2[idx(wrap(x + 1), 0)] = re[idx(x, 0)]! // up-mover shifts +1
      i2[idx(wrap(x + 1), 0)] = im[idx(x, 0)]!
      r2[idx(wrap(x - 1), 1)] = re[idx(x, 1)]! // down-mover shifts -1
      i2[idx(wrap(x - 1), 1)] = im[idx(x, 1)]!
    }

    re = r2
    im = i2
  }

  coin(x => th1(x) / 2)
  shift()
  coin(th2)
  shift()
  coin(x => th1(x) / 2)

  return [re, im]
}

// Count the in-gap edge modes (quasienergy near 0 and near pi) localised at an interface, for a
// periodic chain of L sites whose per-site coin angles are given by theta1(x) and theta2(x). The
// interfaces are wherever theta1 changes; localisation is measured relative to x = L/2 and the wrap
// x = 0 (the two interfaces of a half-and-half profile). Returns the counts at each gap. This is the
// general form: a sharp half-and-half step, a smooth interface, and a perturbed coin all go through it.
export function edgeModeCountFromProfile(input: {
  size: number
  theta1: (x: number) => number
  theta2: (x: number) => number
  gapTolerance?: number
  localizationRadius?: number
}): { zero: number; pi: number } {
  const { size: L, theta1: th1, theta2: th2Fn } = input
  const gapTol = input.gapTolerance ?? 0.985
  const locRadius = input.localizationRadius ?? 8
  const N = 2 * L

  // build U column by column (column j = U applied to basis vector e_j)
  const columnRe: Float64Array[] = []
  const columnIm: Float64Array[] = []

  for (let j = 0; j < N; j++) {
    const re = new Float64Array(N)
    const im = new Float64Array(N)

    re[j] = 1

    const [r, i] = applyStep(re, im, L, th1, th2Fn)

    columnRe.push(r)
    columnIm.push(i)
  }

  // A = (U + U^dagger)/2 (Hermitian). U[a][b] = columnRe[b][a] + i columnIm[b][a].
  const mat = makeComplexMatrix({ rows: N, cols: N })

  for (let a = 0; a < N; a++) {
    for (let b = 0; b < N; b++) {
      const uab_r = columnRe[b]![a]!
      const uab_i = columnIm[b]![a]!
      const uba_r = columnRe[a]![b]!
      const uba_i = columnIm[a]![b]!

      mat.re[a * N + b] = (uab_r + uba_r) / 2
      mat.im[a * N + b] = (uab_i - uba_i) / 2 // conj(U[b][a]) = uba_r - i uba_i
    }
  }

  const eig = eigHermitian({ matrix: mat })
  const ifaceA = Math.floor(L / 2)

  let zero = 0
  let pi = 0

  for (let k = 0; k < N; k++) {
    const ev = eig.values[k]!
    const nearZero = ev > gapTol
    const nearPi = ev < -gapTol

    if (!nearZero && !nearPi) {
      continue
    }

    // localization: fraction of weight within locRadius of either interface (x = ifaceA or x = 0)
    let wIface = 0
    let wTotal = 0

    for (let x = 0; x < L; x++) {
      for (let s = 0; s < 2; s++) {
        const a = 2 * x + s
        const p =
          eig.vectorsRe[a * N + k]! ** 2 +
          eig.vectorsIm[a * N + k]! ** 2

        wTotal += p

        const dA = Math.min(
          Math.abs(x - ifaceA),
          L - Math.abs(x - ifaceA),
        )

        const dB = Math.min(x, L - x)

        if (dA <= locRadius || dB <= locRadius) {
          wIface += p
        }
      }
    }

    if (wIface / (wTotal || 1) > 0.5) {
      if (nearZero) {
        zero++
      } else {
        pi++
      }
    }
  }

  return { zero, pi }
}

// The common case: a sharp half-and-half interface, theta1Left on the left half and theta1Right on the
// right half, with a uniform theta2. A thin wrapper over edgeModeCountFromProfile.
export function interfaceEdgeModeCount(input: {
  size: number
  theta1Left: number
  theta1Right: number
  theta2: number
  gapTolerance?: number
  localizationRadius?: number
}): { zero: number; pi: number } {
  const { size: L, theta1Left, theta1Right, theta2 } = input

  return edgeModeCountFromProfile({
    size: L,
    theta1: (x: number) => (x < L / 2 ? theta1Left : theta1Right),
    theta2: () => theta2,
    gapTolerance: input.gapTolerance,
    localizationRadius: input.localizationRadius ?? 6,
  })
}
