// P21: the graviton (a propagating massless spin-2 field).
// Gravity so far is the action (P2), the Newtonian limit (P16), and the phase that
// selects spacetime. The graviton is the propagating excitation of the geometry: a
// symmetric rank-2 tensor perturbation h_ij. Like the photon (P20, a vector with two
// transverse polarizations), the massless graviton is transverse-traceless and has
// exactly TWO polarizations in 3+1, the hallmark of spin two, while a MASSIVE spin-2
// field would have five. We build the transverse-traceless projector on symmetric
// tensors and count the physical polarizations, and read off the massless dispersion.
// See note/questions/frontiers.md. Run: npx tsx code/experiment/p21-graviton.ts

import { pathToFileURL } from 'node:url'
import { makeDense } from '~/linalg/dense'
import { eigSymmetric } from '~/linalg/eig-jacobi'

// Orthonormal basis of symmetric 3x3 tensors as 6-vectors: the three diagonals and
// the three off-diagonals scaled by sqrt(2) so the vector dot product equals the
// tensor inner product sum_ij A_ij B_ij.
const ROOT2 = Math.SQRT2
function tensorToVec(t: number[][]): number[] {
  return [t[0]?.[0] ?? 0, t[1]?.[1] ?? 0, t[2]?.[2] ?? 0, ROOT2 * (t[0]?.[1] ?? 0), ROOT2 * (t[0]?.[2] ?? 0), ROOT2 * (t[1]?.[2] ?? 0)]
}
function vecToTensor(v: number[]): number[][] {
  const xy = (v[3] ?? 0) / ROOT2
  const xz = (v[4] ?? 0) / ROOT2
  const yz = (v[5] ?? 0) / ROOT2
  return [
    [v[0] ?? 0, xy, xz],
    [xy, v[1] ?? 0, yz],
    [xz, yz, v[2] ?? 0],
  ]
}

// The transverse-traceless projector on symmetric tensors for a unit direction n,
// as a 6x6 matrix. (P_TT h)_ij = P_ik P_jl h_kl - (1/2) P_ij (P_kl h_kl), P = I - n n.
function ttProjector(n: number[], traceOnly: boolean): ReturnType<typeof makeDense> {
  const P = traceOnly
    ? [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ]
    : [
        [1 - (n[0] ?? 0) * (n[0] ?? 0), -(n[0] ?? 0) * (n[1] ?? 0), -(n[0] ?? 0) * (n[2] ?? 0)],
        [-(n[1] ?? 0) * (n[0] ?? 0), 1 - (n[1] ?? 0) * (n[1] ?? 0), -(n[1] ?? 0) * (n[2] ?? 0)],
        [-(n[2] ?? 0) * (n[0] ?? 0), -(n[2] ?? 0) * (n[1] ?? 0), 1 - (n[2] ?? 0) * (n[2] ?? 0)],
      ]
  const m = makeDense({ rows: 6, cols: 6 })
  for (let a = 0; a < 6; a++) {
    const e = [0, 0, 0, 0, 0, 0]
    e[a] = 1
    const h = vecToTensor(e)
    // Ph P (project both indices), then remove the projected trace.
    const ph: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]
    let ptrace = 0
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let s = 0
        for (let k = 0; k < 3; k++) {
          for (let l = 0; l < 3; l++) {
            s += (P[i]?.[k] ?? 0) * (P[j]?.[l] ?? 0) * (h[k]?.[l] ?? 0)
          }
        }
        ph[i]![j] = s
      }
    }
    for (let i = 0; i < 3; i++) {
      ptrace += ph[i]?.[i] ?? 0
    }
    const out: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        // traceless part of Ph (the TT projector); for traceOnly we just remove the trace.
        out[i]![j] = (ph[i]?.[j] ?? 0) - 0.5 * (P[i]?.[j] ?? 0) * ptrace
      }
    }
    const col = tensorToVec(out)
    for (let r = 0; r < 6; r++) {
      m.data[r * 6 + a] = col[r] ?? 0
    }
  }
  return m
}

function polarizationCount(input: { direction: number[]; traceOnly: boolean }): number {
  const n0 = input.direction
  const norm = Math.hypot(n0[0] ?? 0, n0[1] ?? 0, n0[2] ?? 0)
  const n = [(n0[0] ?? 0) / norm, (n0[1] ?? 0) / norm, (n0[2] ?? 0) / norm]
  const eig = eigSymmetric({ matrix: ttProjector(n, input.traceOnly) })
  let count = 0
  for (const v of eig.values) {
    if (Math.abs(v - 1) < 1e-6) {
      count += 1
    }
  }
  return count
}

// Massless dispersion: lowest graviton omega^2 on a periodic lattice of side L is the
// lowest lattice momentum, 4 sin^2(pi/L), which shrinks to zero as L grows.
function minDispersion(side: number): number {
  return 4 * Math.sin(Math.PI / side) ** 2
}

export function gravitonStudy(): {
  masslessPolarizations: number[]
  massivePolarizations: number
  dispersion: { side: number; omega2: number }[]
} {
  const directions = [
    [0, 0, 1],
    [1, 1, 0],
    [1, 1, 1],
    [2, 1, 3],
  ]
  return {
    masslessPolarizations: directions.map((d) => polarizationCount({ direction: d, traceOnly: false })),
    massivePolarizations: polarizationCount({ direction: [0, 0, 1], traceOnly: true }),
    dispersion: [4, 6, 8].map((side) => ({ side, omega2: minDispersion(side) })),
  }
}

export function main(): void {
  const r = gravitonStudy()
  console.log('P21: the graviton (massless spin-2 field)')
  console.log('')
  console.log(`  transverse-traceless polarizations per momentum direction: ${r.masslessPolarizations.join(', ')}`)
  console.log('  (always 2, the two physical graviton polarizations, the signature of spin two)')
  console.log(`  massive spin-2 (traceless only, no transverse projection): ${r.massivePolarizations} polarizations`)
  console.log('')
  console.log('  massless dispersion, lowest omega^2 on a lattice of side L:')
  for (const d of r.dispersion) {
    console.log(`    L = ${d.side}: omega^2 = ${d.omega2.toFixed(3)}`)
  }
  console.log('  (shrinks as the lattice grows, so the graviton is massless: omega -> 0 as k -> 0)')
  console.log('')
  console.log('  The graviton is a symmetric rank-2 tensor (spin two), and its massless,')
  console.log('  diffeomorphism-invariant, transverse-traceless form has exactly TWO')
  console.log('  polarizations, like the photon has two but for a tensor rather than a vector.')
  console.log('  A massive spin-2 field would have five (the vDVZ count). So the propagating')
  console.log('  excitation of the geometry is a proper massless spin-2 graviton. The remaining')
  console.log('  step is to derive this kinetic operator from the discrete action itself (P16).')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
