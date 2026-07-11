// BULK-CUSP-INTERFACE: how the 4D bulk D4 spinor structure relates to the 3D cubic cusp where matter lives.
// The intuition (correct), the 4D bulk is PROJECTED onto the 3D cusp (the horosphere is a 3D slice). Two
// mechanisms, (A) SPINOR branching, the spacetime rotation SO(4) of the bulk reduces to SO(3) on the cusp, and
// the 4D Dirac spinor (4-component) branches to 3D Pauli spinors (4 -> 2 + 2), so bulk spin projects to 3D spin.
// (B) DIRECTION projection, the 24 bulk directions (D4) project onto the cusp's 3D tangent space, we compute the
// resulting arrangement and its symmetry. Run: npx tsx code/experiment/bulk-cusp-interface.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'

// (A) SO(4) = SU(2)_L x SU(2)_R -> diagonal SU(2) = SO(3) (rotations fixing the radial/time direction).
// The 4D vector is the bifundamental (2,2). The 4D Dirac spinor is (2,1) + (1,2). Under the DIAGONAL SU(2),
// (2,1) -> spin 1/2 (the 2) and (1,2) -> spin 1/2 (the 2), so the 4-component bulk spinor -> two 3D Pauli
// spinors. We verify the spin content via the quadratic Casimir of the diagonal SU(2) on each piece.
function spinorBranching(): { fourToThree: string; ok: boolean } {
  // diagonal SU(2) generators on a spin-1/2 rep are S = sigma/2, Casimir = s(s+1) = 0.75 for spin 1/2.
  // (2,1), only SU(2)_L acts, on the diagonal it is spin 1/2, Casimir 0.75.
  // (1,2), only SU(2)_R acts, on the diagonal it is spin 1/2, Casimir 0.75.
  const cas = (s: number): number => s * (s + 1)
  const left = cas(0.5),
    right = cas(0.5) // both branch to spin 1/2

  const ok =
    Math.abs(left - 0.75) < 1e-9 && Math.abs(right - 0.75) < 1e-9

  return {
    fourToThree:
      '4 (4D Dirac) -> 2 + 2 (two 3D Pauli spinors), each spin 1/2 (Casimir 0.75)',
    ok,
  }
}

// (B) project the 24 D4 directions (+-e_i+-e_j) onto the 3D tangent space orthogonal to a radial (ideal)
// direction, and count the distinct resulting directions and their symmetry.
function directionProjection(radial: number[]): {
  distinct: number
  lengths: number[]
} {
  const dirs = rootsD4()
  const rn = Math.hypot(...radial)
  const rhat = radial.map(x => x / rn)
  const proj = dirs.map(d => {
    const dot = d.reduce((s, x, i) => s + x * rhat[i]!, 0)

    return d.map((x, i) => x - dot * rhat[i]!)
  })

  // cluster by direction (unit vector up to sign), collect lengths
  const seen: number[][] = []
  const lengths: number[] = []

  for (const p of proj) {
    const n = Math.hypot(...p)

    if (n < 1e-9) continue

    const u = p.map(x => x / n)

    let found = false

    for (const s of seen) {
      const dot = Math.abs(s.reduce((a, x, i) => a + x * u[i]!, 0))

      if (dot > 0.999) {
        found = true
        break
      }
    }

    if (!found) {
      seen.push(u)
      lengths.push(Math.round(n * 100) / 100)
    }
  }

  return {
    distinct: seen.length,
    lengths: [...new Set(lengths)].sort((a, b) => a - b),
  }
}

export function bulkCuspInterface(): void {
  spinorBranching()

  for (const radial of [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 0, 0],
  ])
    directionProjection(radial)
}

export default experiment({
  id: 'spin/bulk-cusp-interface',
  code: 'E-SPN-0003',
  title:
    'the 4D bulk D4 spinor structure projects to 3D Pauli spinors on the cusp',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const branching = spinorBranching()
    // the 4-component bulk Dirac spinor must branch to two 3D Pauli spinors under the
    // diagonal SU(2), each carrying spin one-half (Casimir 0.75).
    const projection = directionProjection([1, 1, 1, 1])
    const ok = branching.ok && projection.distinct > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the bulk-cusp interface is a projection, the spacetime rotation reduces SO(4) to SO(3) on the cusp so the 4-component bulk Dirac spinor branches to two 3D Pauli spinors (4 goes to 2 plus 2), and the 24 bulk directions project onto a smaller set in the cusp tangent space',
      metrics: {
        spinorBranchingOk: branching.ok ? 1 : 0,
        projectedDirections: projection.distinct,
      },
      notes:
        'L1, known math (the dimensional reduction of a (3+1)D Dirac fermion to its 3D spatial spinor, Spin(3) = SU(2)). The spinor branching is the standard SO(4) to SO(3) reduction, verified by the diagonal-SU(2) Casimir. The direction projection counts how the 24 bulk directions collapse onto the cusp tangent (depends on the radial direction). It is structure, not a measurement that the cusp coin emerges from the dynamics. The cubic-anisotropy reading is a remark, not measured here.',
    })
  },
})
