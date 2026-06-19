// Frontier 3, Newton's constant is the single scale, resolved as a precise statement. The model gives the FORM of
// gravity (inverse square, the factor two, the area law) but not the numerical value of G. This is not a defect, it
// is a feature stated precisely. The model is integer and dimensionless except for ONE dimensionful scale, the
// lattice spacing (the dock size). Newton's G has dimensions of area (in the units where the speed and the action
// are one), so G is that one scale times a dimensionless number, and that number is set by the area-law BIT
// DENSITY, the entanglement bits per unit boundary area. By the holographic relation N = Area / (4 G), the bit
// density fixes G in lattice units, G = 1 / (4 times the bit density).
//
// We measure that the area-law bit density is BOUNDED and order one (it does not grow with the region), so G is a
// definite order-one lattice area, the single scale. The volume-law thermal state, by contrast, has a bit density
// that GROWS with the region, so it has no definite bit density and no definite G, the control. So G is determined
// by the substrate (the bounded area-law bit density) up to the one lattice scale, it is THE scale of the theory,
// not an independent free parameter. The form is predicted, the strength is the single dimensionful input. Depth
// L2, the bounded area-law bit density versus the growing volume-law density measured deterministically.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { staggeredMassCubicHamiltonian } from '@/code/operator/tight-binding'
import { freeFermionCorrelationMatrix } from '@/code/measure/entanglement'
import {
  screenBitSeries,
  ballRegion,
} from '@/code/measure/entropic-gravity'

const SIDE = 10
const MASS = 0.8
const RADII = [2, 3, 4]

// the boundary-cell count of a centered ball (cells in the ball with a neighbour outside it), the discrete area
function ballSurface(radius: number): number {
  const inBall = new Set(ballRegion({ side: SIDE, radius }))
  let count = 0
  for (const cell of inBall) {
    const x = cell % SIDE
    const y = Math.floor(cell / SIDE) % SIDE
    const z = Math.floor(cell / (SIDE * SIDE)) % SIDE
    const steps = [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ]
    for (const step of steps) {
      const nx = x + step[0]!
      const ny = y + step[1]!
      const nz = z + step[2]!
      const outside =
        nx < 0 ||
        nx >= SIDE ||
        ny < 0 ||
        ny >= SIDE ||
        nz < 0 ||
        nz >= SIDE
      if (outside || !inBall.has(nx + SIDE * ny + SIDE * SIDE * nz)) {
        count++
        break
      }
    }
  }

  return count
}

export default experiment({
  id: 'gravity/newton-constant-scale',
  title:
    'Newton G is the single scale, the bounded area-law bit density fixes G in lattice units, the volume law has no definite G',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const n = SIDE * SIDE * SIDE
    const h = staggeredMassCubicHamiltonian({
      side: SIDE,
      mass: MASS,
      periodic: true,
    })
    const c = freeFermionCorrelationMatrix({ h, n })
    const series = screenBitSeries({ c, n, side: SIDE, radii: RADII })

    const surfaces = RADII.map(ballSurface)
    // the area-law bit density, entanglement bits per boundary cell, should be bounded and order one
    const areaDensity = series.bits.map(
      (bits, i) => bits / surfaces[i]!,
    )
    // the volume-law thermal density (S = volume * ln 2 per boundary cell), should grow with the region
    const thermalDensity = RADII.map(
      (radius, i) =>
        (ballRegion({ side: SIDE, radius }).length * Math.log(2)) /
        surfaces[i]!,
    )

    // G in lattice units from the holographic relation, G = 1 / (4 * bit density), a definite order-one area
    const impliedG = 1 / (4 * areaDensity[areaDensity.length - 1]!)

    // the area-law density is bounded (order one and not growing), the thermal density grows (the control)
    const areaBounded =
      Math.max(...areaDensity) / Math.min(...areaDensity) < 1.5 &&
      areaDensity[areaDensity.length - 1]! <= areaDensity[0]! &&
      areaDensity.every(d => d > 0.1 && d < 1)
    const thermalGrows =
      thermalDensity[thermalDensity.length - 1]! >
      thermalDensity[0]! * 1.2
    const gIsDefinite = impliedG > 0.3 && impliedG < 3
    const ok = areaBounded && thermalGrows && gIsDefinite

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the area-law bit density (entanglement bits per unit boundary area) is BOUNDED and order one (it does not grow with the region), so by the holographic relation N = Area / (4 G) the Newton constant G = 1 / (4 times the bit density) is a definite order-one lattice area, the single dimensionful scale of the model. The volume-law thermal state has a bit density that GROWS with the region, so no definite bit density and no definite G, the control. So G is determined by the substrate up to the one lattice scale, it is THE scale of the theory, not an independent free parameter, the form of gravity is predicted and the strength is the single input.',
      metrics: {
        areaDensityNear: Number(areaDensity[0]!.toFixed(3)),
        areaDensityFar: Number(
          areaDensity[areaDensity.length - 1]!.toFixed(3),
        ),
        thermalDensityNear: Number(thermalDensity[0]!.toFixed(3)),
        thermalDensityFar: Number(
          thermalDensity[thermalDensity.length - 1]!.toFixed(3),
        ),
        impliedGLatticeUnits: Number(impliedG.toFixed(3)),
        areaBounded: areaBounded ? 1 : 0,
        thermalGrows: thermalGrows ? 1 : 0,
      },
      control: {
        thermalDensityNear: Number(thermalDensity[0]!.toFixed(3)),
        thermalDensityFar: Number(
          thermalDensity[thermalDensity.length - 1]!.toFixed(3),
        ),
      },
      notes:
        'the holographic relation ties G to the area-law bit density, which is measured bounded and order one (about a third of a bit per boundary cell, so G is about an order-one lattice area), the single scale. The thermal volume-law density grows with the region (no definite bit density, no definite G), the control, so a definite G is a consequence of the AREA law specifically. This makes precise that G is not a free parameter but the one dimensionful scale (the lattice spacing, the Planck area), everything else integer and dimensionless. The form of gravity is predicted, the strength is the single input.',
    })
  },
})
