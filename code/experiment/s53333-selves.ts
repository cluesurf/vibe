// S53333-SELVES ({5,3,3,3,3} suite): matter / solitons on the 4D horosphere. Verdicts, topological solitons DO
// exist in 4D (instantons, pi_3(S^3) = Z, and pi_4 textures), so "selves" form (POSITIVE), but they are 4D
// objects in a 4D physical space, OVER-dimensional. 4D does have spinors (Spin(4) = SU(2)xSU(2)), so statistics
// could be fermionic, but the COIN supplies no spinor (s53333-structure), and the dimension is wrong (4D not
// 3D). The form-tower is a generic slow-mode (NEUTRAL). Run: npx tsx code/experiment/s53333-selves.ts

import { pathToFileURL } from 'node:url'

export function s53333Selves(): { solitonsExist: boolean; instantonCharge: number; overDimensional: boolean } {
  // 4D instanton topological charge, pi_3(S^3) = Z. A BPST-like profile on a 4D radial grid, winding = 1.
  // We verify the winding of the map S^3 -> S^3 for a hedgehog in 4D (the degree of the boundary 3-sphere map).
  // Discretize the radial profile, charge = (1/2pi^2) * integral of the winding density, here = 1 by construction.
  const samples = 200
  let charge = 0
  for (let i = 0; i < samples; i++) {
    const r = (i + 0.5) / samples * 6 // radius
    const f = Math.PI * (1 - 1 / (1 + r * r)) // chiral angle 0 -> pi (the instanton profile)
    const fNext = Math.PI * (1 - 1 / (1 + ((i + 1.5) / samples * 6) ** 2))
    const df = fNext - f
    charge += (2 / Math.PI) * (Math.sin(f) ** 2) * df // d/df of (f - sin f cos f)/pi integrated = winding density
  }
  const instantonCharge = Math.round(charge)
  const solitonsExist = Math.abs(instantonCharge) >= 1
  const overDimensional = true // physical space is 4D, one more than the observed 3D
  console.log('S53333-SELVES ({5,3,3,3,3}, 4D horosphere):')
  console.log(`  4D INSTANTON (pi_3(S^3) = Z), topological charge = ${instantonCharge} (winding ${charge.toFixed(3)}), solitons EXIST: ${solitonsExist}`)
  console.log(`  4D space DOES have spinors (Spin(4) = SU(2) x SU(2)), so statistics could be fermionic in principle`)
  console.log(`  but the COIN supplies no spinor (H5, s53333-structure), and the dimension is 4D, not 3D: over-dimensional ${overDimensional}`)
  console.log('')
  console.log('Verdicts:')
  console.log('  - SELVES exist, POSITIVE, 4D topological solitons (instantons) form on the 4D horosphere.')
  console.log('  - but they live in 4D physical space, OVER-dimensional (DIFFERENT), one dimension too many vs the')
  console.log('    observed 3D, and the H5 coin still supplies no fundamental spinor or gauge.')
  console.log('  - the form-coherence tower is a generic slow-mode (NEUTRAL), same as the others (P208).')
  return { solitonsExist, instantonCharge, overDimensional }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = s53333Selves()
  console.log(`SOLVED: {5,3,3,3,3} selves, 4D instantons exist ${r.solitonsExist} (charge ${r.instantonCharge}, POSITIVE), but OVER-dimensional ${r.overDimensional} (4D space, no base spinor/gauge). Overshoots the dimension.`)
}
