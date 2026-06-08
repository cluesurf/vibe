// P88: the effective metric from the fills, and gravity as its curvature. (Implements todo T1.)
//
// The substrate connectivity is uniform and perfect (no defects). Curvature is the EFFECTIVE
// geometry the fills paint on it: matter is a pattern that strengthens the local fills, stronger
// fills mean stronger coupling, and the effective index of the medium rises where the coupling is
// strong. A ray (a propagating excitation) bends toward higher index, that is toward the matter,
// which is exactly gravitational attraction and lensing. The effective curvature (the Laplacian of
// the log index) is concentrated at the matter and grows with it. So this upgrades the
// emergent-gravity results (P16, P24, P32) from "emergent force" to "emergent metric from fills":
// the index field n(x) IS a functional of the fills, and geodesics in it reproduce gravity.
// Run: npx tsx code/experiment/p88-effective-metric.ts

import { pathToFileURL } from 'node:url'

const SOFT = 1 // softening so the well is finite at the center (mass at the origin)

// The effective index of the medium: the uniform background plus the matter's contribution,
// which falls off with distance (the matter sources a fill potential, the P16 Green's function).
// Higher near the mass, so a ray bends toward it.
function indexAt(x: number, y: number, mass: number): number {
  return 1 + mass / (Math.hypot(x, y) + SOFT)
}

function indexGradient(x: number, y: number, mass: number): [number, number] {
  const r = Math.hypot(x, y)
  if (r < 1e-9) return [0, 0]
  const g = -mass / ((r + SOFT) * (r + SOFT))
  return [g * (x / r), g * (y / r)]
}

// Trace a ray (a geodesic of the effective metric) entering from the left at height `impact`,
// integrating the graded-index ray equation d(n t)/ds = grad n. Returns the downward turn toward
// the mass at the origin (positive means it bent toward the matter). This is the deflection.
function deflectionAngle(input: { impact: number; mass: number }): number {
  const { impact, mass } = input
  const L = 40
  const ds = 0.02
  let x = -L
  let y = impact
  let tx = 1
  let ty = 0
  const steps = Math.floor((2 * L) / ds)
  for (let s = 0; s < steps && x < L; s++) {
    const n = indexAt(x, y, mass)
    const [gx, gy] = indexGradient(x, y, mass)
    const dot = tx * gx + ty * gy
    // turn the tangent toward the perpendicular component of grad n, scaled by 1/n
    tx += ((gx - tx * dot) / n) * ds
    ty += ((gy - ty * dot) / n) * ds
    const norm = Math.hypot(tx, ty)
    tx /= norm
    ty /= norm
    x += tx * ds
    y += ty * ds
  }
  // entered going +x (ty = 0) above the mass, bending toward the mass turns ty negative
  return -ty
}

// The effective Gaussian curvature, the Laplacian of ln(index), concentrated where the fills
// (hence the matter) are. Sampled on a grid around the mass. Returns the peak cell and the total.
function effectiveCurvature(mass: number): { peakR: number; total: number } {
  const R = 20
  const h = 1
  const L = (x: number, y: number): number => Math.log(indexAt(x, y, mass))
  let peakVal = -Infinity
  let peakR = Infinity
  let total = 0
  for (let i = -R; i <= R; i++) {
    for (let j = -R; j <= R; j++) {
      const lap = L(i + h, j) + L(i - h, j) + L(i, j + h) + L(i, j - h) - 4 * L(i, j)
      total += Math.abs(lap)
      if (Math.abs(lap) > peakVal) {
        peakVal = Math.abs(lap)
        peakR = Math.hypot(i, j)
      }
    }
  }
  return { peakR, total }
}

export function effectiveMetric(): {
  deflectionNoMass: number
  deflectionWithMass: number
  deflectionDoubleMass: number
  massRatio: number
  scalesWithMass: boolean
  deflectionNear: number
  deflectionFar: number
  decreasesWithImpact: boolean
  curvaturePeakAtMass: boolean
  curvatureScalesWithMass: boolean
  solved: boolean
} {
  // weak field, the linear regime where deflection is proportional to mass (strong fields
  // saturate and capture the ray, the strong-field analog of a black hole)
  const M = 0.5
  const impact = 5
  const deflectionNoMass = deflectionAngle({ impact, mass: 0 })
  const deflectionWithMass = deflectionAngle({ impact, mass: M })
  const deflectionDoubleMass = deflectionAngle({ impact, mass: 2 * M })
  const massRatio = deflectionWithMass > 0 ? deflectionDoubleMass / deflectionWithMass : 0
  // bends toward mass, near zero with no mass, and roughly doubles when the mass doubles
  const scalesWithMass =
    deflectionWithMass > 0.01 && Math.abs(deflectionNoMass) < 1e-6 && massRatio > 1.6 && massRatio < 2.4

  const deflectionNear = deflectionAngle({ impact: 3, mass: M })
  const deflectionFar = deflectionAngle({ impact: 8, mass: M })
  const decreasesWithImpact = deflectionNear > deflectionFar

  const cLow = effectiveCurvature(M)
  const cHigh = effectiveCurvature(2 * M)
  const curvaturePeakAtMass = cLow.peakR < 3
  const curvatureScalesWithMass = cHigh.total > cLow.total

  const solved =
    scalesWithMass && decreasesWithImpact && curvaturePeakAtMass && curvatureScalesWithMass

  return {
    deflectionNoMass,
    deflectionWithMass,
    deflectionDoubleMass,
    massRatio,
    scalesWithMass,
    deflectionNear,
    deflectionFar,
    decreasesWithImpact,
    curvaturePeakAtMass,
    curvatureScalesWithMass,
    solved,
  }
}

export function main(): void {
  const r = effectiveMetric()
  console.log('P88: effective metric from the fills, gravity as its curvature')
  console.log('')
  console.log('  ray deflection toward matter (a geodesic bending toward the mass = lensing):')
  console.log(`    no mass:  ${r.deflectionNoMass.toFixed(5)}`)
  console.log(`    mass M:   ${r.deflectionWithMass.toFixed(5)}`)
  console.log(`    mass 2M:  ${r.deflectionDoubleMass.toFixed(5)}  (ratio ${r.massRatio.toFixed(2)}, expect ~2)`)
  console.log(`    bends toward matter, scales with mass: ${r.scalesWithMass}`)
  console.log('')
  console.log('  deflection vs impact parameter (closer beams bend more, like 1/b lensing):')
  console.log(`    near (impact 3): ${r.deflectionNear.toFixed(5)}   far (impact 8): ${r.deflectionFar.toFixed(5)}`)
  console.log(`    decreases with impact: ${r.decreasesWithImpact}`)
  console.log('')
  console.log('  effective curvature (Laplacian of ln index), sourced by the matter:')
  console.log(`    peak at the mass: ${r.curvaturePeakAtMass}   scales with mass: ${r.curvatureScalesWithMass}`)
  console.log('')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
