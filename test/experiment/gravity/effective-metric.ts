// P88: ANALYTIC / CONSISTENCY CHECK of a graded-index lensing model.
//
// This is NOT an emergent test of the vibe substrate. It does NOT show the substrate produces an
// effective metric or gravity. It ASSUMES, put in by hand, the index field
//   n(x) = 1 + mass / (r + SOFT)
// which is a softened 1/r potential chosen to match the assumed Green's function (P16). It does NOT
// derive that index from the fills. GIVEN that assumed index, the rest is standard graded-index
// optics: a ray bends toward higher index (toward the mass), the deflection scales with mass and
// falls off with impact parameter, and the Laplacian of ln(n) peaks at the mass. All of these are
// consequences of the hand-built 1/r index field, not evidence that the substrate generates an
// effective metric. The connection from fills to n(x) is asserted in the prose, not computed here.
// Run: npx tsx code/experiment/p88-effective-metric.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

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

export default defineExperiment({
  id: 'gravity/effective-metric',
  title: 'rays bend toward matter (lensing) scaling with mass, curvature sourced by matter',
  category: 'gravity',
  substrates: 'any',
  depth: 'L0',
  paper: false,
  run() {
    const r = effectiveMetric()
    const ok =
      r.solved &&
      r.scalesWithMass &&
      r.decreasesWithImpact &&
      r.curvaturePeakAtMass
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a hand-built 1/r index field bends rays toward matter with deflection scaling with mass and falling with impact parameter',
      metrics: {
        deflectionWithMass: r.deflectionWithMass,
        deflectionDoubleMass: r.deflectionDoubleMass,
        massRatio: r.massRatio,
        deflectionNear: r.deflectionNear,
        deflectionFar: r.deflectionFar,
      },
      notes:
        'analytic consistency check of an assumed 1/r index field, not a derivation of an effective metric from the fills',
    })
  },
})
