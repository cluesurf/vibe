// P25: the Standard-Model electroweak breaking pattern.
// P22 showed the Higgs mechanism for one U(1). The Standard Model breaks SU(2) x
// U(1)_Y down to U(1)_EM: a Higgs DOUBLET with vacuum value v gives mass to three of
// the four gauge bosons (W+, W-, Z) while one combination (the photon) stays
// massless, with the famous Weinberg-angle relation m_W = m_Z cos(theta_W). We build
// the gauge-boson mass matrix from the Higgs doublet and diagonalise it. With the
// measured couplings it reproduces the observed W and Z masses. See
// note/questions/frontiers.md. Run: npx tsx code/experiment/p25-electroweak.ts

import { pathToFileURL } from 'node:url'
import { makeDense } from '~/linalg/dense'
import { eigSymmetric } from '~/linalg/eig-jacobi'

export function electroweak(input: { g: number; gPrime: number; v: number }): {
  mW: number
  mZ: number
  mPhoton: number
  cosThetaW: number
  sin2ThetaW: number
  ratioCheck: number
} {
  const { g, gPrime, v } = input
  // W^1, W^2 pair into W+ and W- with mass g v / 2.
  const mW = (g * v) / 2
  // W^3 and B mix. The mass matrix (v^2 / 4) [[g^2, -g g'], [-g g', g'^2]] has
  // eigenvalues 0 (the photon) and (g^2 + g'^2) v^2 / 4 (the Z).
  const m = makeDense({ rows: 2, cols: 2 })
  const c = (v * v) / 4
  m.data[0] = c * g * g
  m.data[1] = -c * g * gPrime
  m.data[2] = -c * g * gPrime
  m.data[3] = c * gPrime * gPrime
  const eig = eigSymmetric({ matrix: m })
  const vals = Array.from(eig.values).sort((a, b) => a - b)
  const mPhoton = Math.sqrt(Math.max(0, vals[0] ?? 0))
  const mZ = Math.sqrt(Math.max(0, vals[1] ?? 0))
  const cosThetaW = g / Math.sqrt(g * g + gPrime * gPrime)
  const sin2ThetaW = (gPrime * gPrime) / (g * g + gPrime * gPrime)
  return { mW, mZ, mPhoton, cosThetaW, sin2ThetaW, ratioCheck: mZ > 0 ? mW / mZ : 0 }
}

export function main(): void {
  console.log('P25: the Standard-Model electroweak breaking SU(2) x U(1) -> U(1)_EM')
  console.log('')
  // Measured-ish couplings and the Higgs vacuum value (GeV).
  const r = electroweak({ g: 0.65, gPrime: 0.358, v: 246 })
  console.log('  Higgs doublet with vacuum value v = 246 GeV, couplings g = 0.65 and g-prime = 0.358:')
  console.log(`    W+ and W-:  mass ${r.mW.toFixed(1)} GeV  (massive)`)
  console.log(`    Z:          mass ${r.mZ.toFixed(1)} GeV  (massive)`)
  console.log(`    photon:     mass ${r.mPhoton.toFixed(3)} GeV  (massless, the unbroken U(1)_EM)`)
  console.log('')
  console.log(`    Weinberg angle: sin^2(theta_W) = ${r.sin2ThetaW.toFixed(3)} (observed about 0.231)`)
  console.log(`    mass relation:  m_W / m_Z = ${r.ratioCheck.toFixed(4)}, cos(theta_W) = ${r.cosThetaW.toFixed(4)} (equal)`)
  console.log('')
  console.log('  The Higgs doublet breaks SU(2) x U(1)_Y to U(1)_EM. Three of the four gauge')
  console.log('  bosons (W+, W-, Z) become massive, one combination (the photon) stays massless,')
  console.log('  and the masses obey m_W = m_Z cos(theta_W). With the measured couplings this')
  console.log('  reproduces the observed W (80.4) and Z (91.2) masses and the Weinberg angle.')
  console.log('  So the specific electroweak breaking pattern, not just a single U(1) (P22),')
  console.log('  follows from a Higgs doublet, the heart of the Standard-Model gauge sector.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
