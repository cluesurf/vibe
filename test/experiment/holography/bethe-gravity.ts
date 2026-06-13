// P239 (TOOLKIT A+F, the Bethe-lattice exact propagator with geodesic distance, the clean gravity/holographic
// fix): instead of a finite Euclidean-distance patch (confounded, p210), use the EXACT infinite-tree (Bethe)
// Green's function via the cavity recursion, with TREE (geodesic) distance. For the Laplacian L = zI - A (the
// static Coulomb / massless propagator), the per-step decay mu solves b*mu^2 - z*mu + 1 = 0, and the
// bulk-mediated BOUNDARY correlator decays as 1/r^alpha with alpha = 2*ln(1/mu)/ln(b), r = boundary distance ~
// b^(tree-distance/2). We get a CLEAN exponent (no finite-patch artifact), and validate the recursion against a
// directly-solved finite tree. Run: npx tsx code/experiment/p239-bethe-gravity.ts

import { pathToFileURL } from 'node:url'

// cavity decay mu(E) for the resolvent of the adjacency at spectral parameter E on a Bethe lattice (branching b)
// the Laplacian static point is E = z (coordination), where mu = the Coulomb decay per tree-step.
function muFor(z: number, E: number): number { const b = z - 1; return (E - Math.sqrt(E * E - 4 * b)) / (2 * b) }
function boundaryExponent(z: number, E: number): number { const b = z - 1, mu = muFor(z, E); return (2 * Math.log(1 / mu)) / Math.log(b) }

// validate, build a finite rooted tree (branching b, depth D), solve (z I - A) phi = delta_root, measure
// phi(d)/phi(d-1) -> should equal mu
function validateTree(z: number, depth: number): number {
  const b = z - 1
  // nodes by level, level 0 = root (1 node), level k has b^k nodes; parent of a node = previous level
  const levelSize: number[] = [1]; for (let k = 1; k <= depth; k++) levelSize.push(levelSize[k - 1]! * b)
  const offset: number[] = [0]; for (let k = 1; k <= depth + 1; k++) offset.push(offset[k - 1]! + (levelSize[k - 1] ?? 0))
  const N = offset[depth + 1]!
  const level = (i: number): number => { let k = 0; while (k <= depth && i >= offset[k + 1]!) k++; return k }
  const parent = (i: number): number => { const k = level(i); if (k === 0) return -1; const within = i - offset[k]!; return offset[k - 1]! + Math.floor(within / b) }
  // degree, root has b children (z would be b+1 but root has no parent), interior has 1 parent + b children = z,
  // leaves have 1 parent. Use the actual degree per node for L = deg*I - A.
  const children = (i: number): number[] => { const k = level(i); if (k >= depth) return []; const within = i - offset[k]!; const base = offset[k + 1]! + within * b; return Array.from({ length: b }, (_, j) => base + j) }
  // solve (D - A) phi = delta_0 by Gauss-Seidel-ish (the tree is small)
  const phi = new Float64Array(N); const src = new Float64Array(N); src[0] = 1
  const deg = (i: number): number => { let d = 0; if (parent(i) >= 0) d++; d += children(i).length; return d }
  for (let it = 0; it < 4000; it++) {
    for (let i = 0; i < N; i++) { let s = src[i]!; const p = parent(i); if (p >= 0) s += phi[p]!; for (const c of children(i)) s += phi[c]!; phi[i] = s / (deg(i) + 0.0) }
  }
  // measure phi at level d (one representative) ratio
  const r2 = phi[offset[2]!]!, r3 = phi[offset[3]!]!
  return r3 / r2
}

export function betheGravity(): { alpha24: number; alpha12: number; massiveAlpha: number; validated: boolean } {
  const alpha24 = Math.round(boundaryExponent(24, 24) * 1000) / 1000 // {3,4,3,4} bulk, z=24, Laplacian E=z
  const alpha12 = Math.round(boundaryExponent(12, 12) * 1000) / 1000 // {5,3,4} bulk, z=12
  console.log('P239 Bethe-lattice exact bulk-mediated boundary correlator (geodesic / tree distance):')
  console.log(`  z=24 ({3,4,3,4}): mu = ${muFor(24, 24).toFixed(4)} (= 1/23), boundary correlator ~ 1/r^${alpha24}`)
  console.log(`  z=12 ({5,3,4}):   mu = ${muFor(12, 12).toFixed(4)} (= 1/11), boundary correlator ~ 1/r^${alpha12}`)
  console.log(`  => the massless (Laplacian) bulk-mediated boundary correlator is a CLEAN 1/r^2, universally (mu = 1/b`)
  console.log('     gives alpha = 2). No finite-patch confound, the exact recursion + geodesic distance fixes p210.')
  // massive bulk field, E > z -> mu smaller -> alpha larger (screened / Yukawa-like)
  const massiveAlpha = Math.round(boundaryExponent(24, 30) * 1000) / 1000
  console.log(`  massive bulk field (E=30 > z): boundary correlator ~ 1/r^${massiveAlpha} (steeper, screened)`)
  // validate the recursion against a directly-solved finite tree
  const measured = validateTree(12, 7), predicted = muFor(12, 12)
  const validated = Math.abs(measured - predicted) < 0.05
  console.log(`  validation, finite-tree solve gives per-step ratio ${measured.toFixed(3)} vs analytic mu ${predicted.toFixed(3)}: ${validated}`)
  console.log('  NOTE, this is the bulk-MEDIATED (holographic) boundary correlator (a CFT 2-point function), distinct')
  console.log('  from the flat-3D NEWTONIAN potential 1/r (p224, the physical-space gravity, already clean).')
  return { alpha24, alpha12, massiveAlpha, validated }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = betheGravity()
  console.log(`SOLVED: exact Bethe boundary correlator ~ 1/r^${r.alpha24} (clean, universal), recursion validated ${r.validated}. Fixes the p210 confound via recursion + geodesic distance.`)
}
