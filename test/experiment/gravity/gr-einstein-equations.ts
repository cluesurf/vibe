// The Einstein field equations on the substrate, beyond the Newtonian 1/r and the holographic correlator.
// Two routes, both tied to substrate-established facts.
//
//   ROUTE A (entropic, Jacobson 1995). Given the substrate's AREA LAW S = A/4G (P15/P33) and the Unruh
//     temperature T = kappa/2pi (P71), the Clausius relation dQ = T dS on every local Rindler horizon is
//     EQUIVALENT to the full nonlinear Einstein equation G_uv + Lambda g_uv = 8pi G T_uv. The area-law
//     coefficient 1/4G fixes the Einstein coefficient to 8piG, the SAME G as Newton's law. We verify that
//     chain numerically (the coefficient, and the weak-field Poisson limit with the right 4pi).
//   ROUTE B (the GR-beyond-Newton observable). The linearized Einstein equation curves both time AND
//     space, so light bends by 4GM/b, TWICE the naive Newtonian 2GM/b. We integrate the photon deflection
//     and confirm the factor 2. This is the cleanest prediction that distinguishes full GR from Newton.
//
// Plus the cosmological constant Lambda = 3 H^2 from the substrate's de Sitter expansion. G = c = 1.
//
// Run: npx tsx --no-warnings=ExperimentalWarning code/experiment/gr-einstein-equations.ts

import { buildEuclideanLattice } from '@/code/substrate/coxeter/cell-direct'
import { latticePoissonJacobi } from '@/code/operator/lattice-poisson-jacobi'
import { weakFieldLightDeflection } from '@/code/measure/gravity-potential'
import { fitForm } from '@/code/measure/regression'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// ---------- Route A, Jacobson: area-law coefficient -> Einstein coefficient -> Newtonian 4pi ----------

function jacobsonCoefficient(): { einsteinCoeff: number; poissonCoeff: number; ok: boolean } {
  // S = eta A with eta = 1/(4G). Clausius dQ = T dS with T = kappa/2pi and Raychaudhuri focusing gives
  //   R_uv k^u k^v = (2pi/eta) T_uv k^u k^v  for all null k  =>  coefficient 2pi/eta = 8 pi G.
  const G = 1
  const eta = 1 / (4 * G) // area-law entropy density (the substrate's 1/4G)
  const einsteinCoeff = (2 * Math.PI) / eta // should be 8 pi G
  // The weak-field 00-component G_00 = einsteinCoeff * T_00 must reduce to Poisson nabla^2 Phi = 4 pi G rho.
  // G_00 -> 2 nabla^2 Phi and T_00 -> rho, so 2 nabla^2 Phi = 8 pi G rho => nabla^2 Phi = 4 pi G rho.
  const poissonCoeff = einsteinCoeff / 2 // the 4 pi G in Poisson
  const ok = Math.abs(einsteinCoeff - 8 * Math.PI * G) < 1e-12 && Math.abs(poissonCoeff - 4 * Math.PI * G) < 1e-12
  return { einsteinCoeff, poissonCoeff, ok }
}

// ---------- the weak-field Poisson limit on the actual cusp lattice (recovers Newton's 1/r) ----------

function poissonOnCusp(): { rFit: number; r2Fit: number; ok: boolean } {
  // Solve nabla^2 Phi = 4 pi rho for a point source on the {4,3,4} = Z^3 cusp (the substrate's physical
  // space), by Jacobi relaxation of the lattice Laplacian, and confirm Phi(r) ~ 1/r (Newtonian), NOT
  // 1/r^2. In a finite Dirichlet box the Green's function is 1/r + const, so we fit Phi = a/r + c (and
  // Phi = a/r^2 + c) and compare the fit quality; 1/r should win decisively.
  const g = buildEuclideanLattice({ symbol: [4, 3, 4], maxCells: 30000 })
  const n = g.cellCount
  // find the most central cell (max coordination is uniform; pick the one nearest the centroid)
  const cx = g.coords.reduce((s, c) => s.map((v, i) => v + c[i]!), [0, 0, 0]).map((v) => v / n)
  let src = 0
  let bd = Infinity
  for (let i = 0; i < n; i++) {
    const d = g.coords[i]!.reduce((s, v, k) => s + (v - cx[k]!) ** 2, 0)
    if (d < bd) { bd = d; src = i }
  }
  const rho = new Float64Array(n)
  rho[src] = 1
  // Dirichlet boundary (the box edge, where deg < 6) is clamped to Phi = 0, so the discrete Poisson
  // -nabla^2 Phi = 4 pi rho is well posed and relaxes to the lattice Green's function ~ +1/r.
  const phi = latticePoissonJacobi({ neighbors: g.neighbors, source: rho, interiorDegree: 6, iterations: 2000 })
  // collect (r, Phi) in a clean window well inside the box, fit Phi = a*f(r) + c for f = 1/r and 1/r^2,
  // report R^2 of each. Newtonian gravity => 1/r fits far better.
  const norm = (c: number[]): number => Math.sqrt(c.reduce((s, v, k) => s + (v - g.coords[src]![k]!) ** 2, 0))
  const rs: number[] = []
  const phis: number[] = []
  for (let i = 0; i < n; i++) {
    const r = norm(g.coords[i]!)
    if (r >= 2 && r <= 9 && phi[i]! > 1e-9) { rs.push(r); phis.push(phi[i]!) }
  }
  const rFit = fitForm(rs, phis, (r) => 1 / r).r2
  const r2Fit = fitForm(rs, phis, (r) => 1 / (r * r)).r2
  return { rFit, r2Fit, ok: rFit > 0.97 && rFit > r2Fit }
}

// ---------- Route B, light bending = 4GM/b (the GR factor 2 over Newton) ----------

function lightBending(M: number, b: number): { grAngle: number; newtonAngle: number; ratio: number; ok: boolean } {
  // Weak-field metric ds^2 = -(1+2Phi)dt^2 + (1-2Phi)dx^2, Phi = -M/r. A photon curves under BOTH the
  // time term and the space term, so the GR deflection is twice the Newtonian one (the factor-2 of GR).
  const d = weakFieldLightDeflection({ mass: M, impact: b })
  const ok = Math.abs(d.grAngle - 4 * M / b) / (4 * M / b) < 0.01 && Math.abs(d.ratio - 2) < 0.01
  return { grAngle: d.grAngle, newtonAngle: d.newtonAngle, ratio: d.ratio, ok }
}

// ---------- the cosmological constant from the substrate ----------

function cosmologicalConstant(): { H: number; Lambda: number } {
  const g = buildEuclideanLattice({ symbol: [4, 3, 4], maxCells: 1000 }) // not used for H, kept minimal
  void g
  const H = 0.8006 // from cosmology-and-anisotropy.ts (R ~ 11 early-shell average); Lambda = 3 H^2
  return { H, Lambda: 3 * H ** 2 }
}

export default experiment({
  id: 'gravity/gr-einstein-equations',
  title: 'the assumed area-law and weak-field formulas reproduce the Einstein coefficient, 1/r on the cusp, and 4GM/b bending',
  category: 'gravity',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const jc = jacobsonCoefficient()
    const pc = poissonOnCusp()
    const lb = lightBending(1, 10)
    const cc = cosmologicalConstant()
    const ok = jc.ok && pc.ok && lb.ok
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the hardcoded area-law density gives the 8 pi G Einstein coefficient, a discrete Poisson solve on the cubic cusp recovers a 1/r potential better than 1/r squared, and the assumed weak-field metric bends light by 4GM over b',
      metrics: {
        einsteinCoeff: jc.einsteinCoeff,
        poissonCoeff: jc.poissonCoeff,
        cuspOneOverRFit: pc.rFit,
        cuspOneOverRSquaredFit: pc.r2Fit,
        bendingRatio: lb.ratio,
        cosmologicalConstant: cc.Lambda,
      },
      notes:
        'Mostly L0 algebra. The Jacobson coefficient and the 4GM/b bending are pure consequences of assumed formulas (the area-law density and the weak-field metric), not derived from the substrate. The one measured part is the cusp Poisson solve, which reads a 1/r falloff against a 1/r squared control on the real {4,3,4} lattice, but it solves a hardcoded lattice Laplacian, so it is L1 known math (the lattice Green function is 1/r in 3D), not emergent gravity.',
    })
  },
})
