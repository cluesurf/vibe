// Conformance for code/tool/grid-gauge: a U(1) gauge field on a periodic square lattice. The three
// load-bearing facts are GAUGE-INVARIANT geometry:
//   - plaquetteFlux is the lattice curl (Ax + Ay(shift x) - Ax(shift y) - Ay) of a cell.
//   - gridWilsonLoop around a rectangle equals the sum of the enclosed plaquette fluxes (discrete Stokes).
//   - a gauge transformation A -> A + d(lambda) leaves every flux and loop unchanged.
// With integer link phases all three are EXACT, so those use equality; the floating vortex field uses a
// tight tolerance.

import { suite, check, equal, close } from '@/test/code/harness'
import {
  GridGauge,
  makeGridGrid,
  plaquetteFlux,
  gridWilsonLoop,
  gridGaugeTransform,
  vortexGaugeField,
} from '@/code/tool/grid-gauge'

const SIDE = 5

// A deterministic integer link field: distinct values per link so cancellations are real, not coincidental.
function integerField(): GridGauge {
  const Ax = makeGridGrid(SIDE)
  const Ay = makeGridGrid(SIDE)

  for (let x = 0; x < SIDE; x++) {
    for (let y = 0; y < SIDE; y++) {
      Ax[x]![y] = x * 7 + y * 2 + 1
      Ay[x]![y] = x * 3 - y * 5 + 4
    }
  }

  return { Ax, Ay }
}

suite('tool/grid-gauge: plaquette flux is the lattice curl', [
  check('the zero field has zero flux everywhere', () => {
    const g: GridGauge = { Ax: makeGridGrid(SIDE), Ay: makeGridGrid(SIDE) }

    for (let x = 0; x < SIDE; x++) {
      for (let y = 0; y < SIDE; y++) {
        equal(plaquetteFlux(g, { x, y, side: SIDE }), 0, `flux at ${x},${y}`)
      }
    }
  }),
  check('flux equals the hand-computed curl on an interior cell', () => {
    const g = integerField()
    const x = 1
    const y = 2
    const expected =
      g.Ax[x]![y]! +
      g.Ay[(x + 1) % SIDE]![y]! -
      g.Ax[x]![(y + 1) % SIDE]! -
      g.Ay[x]![y]!

    equal(plaquetteFlux(g, { x, y, side: SIDE }), expected, 'curl at 1,2')
  }),
])

suite('tool/grid-gauge: Wilson loop is the enclosed flux (discrete Stokes)', [
  check('loop around a rectangle equals the sum of inner plaquette fluxes', () => {
    const g = integerField()
    const rect = { x0: 1, x1: 4, y0: 1, y1: 3 } // interior, no wrap

    let sum = 0

    for (let x = rect.x0; x < rect.x1; x++) {
      for (let y = rect.y0; y < rect.y1; y++) {
        sum += plaquetteFlux(g, { x, y, side: SIDE })
      }
    }

    equal(gridWilsonLoop(g, rect), sum, 'Stokes: loop = enclosed flux')
  }),
  check('a unit-cell loop equals that single plaquette flux', () => {
    const g = integerField()
    equal(
      gridWilsonLoop(g, { x0: 2, x1: 3, y0: 1, y1: 2 }),
      plaquetteFlux(g, { x: 2, y: 1, side: SIDE }),
      'one-cell loop = one flux',
    )
  }),
])

suite('tool/grid-gauge: gauge invariance', [
  check('A -> A + d(lambda) leaves every plaquette flux unchanged', () => {
    const g = integerField()
    // A deterministic integer gauge function on the sites.
    const lambda = makeGridGrid(SIDE)

    for (let x = 0; x < SIDE; x++) {
      for (let y = 0; y < SIDE; y++) {
        lambda[x]![y] = x * x - 3 * y + 11
      }
    }

    const g2 = gridGaugeTransform(g, lambda, SIDE)

    for (let x = 0; x < SIDE; x++) {
      for (let y = 0; y < SIDE; y++) {
        equal(
          plaquetteFlux(g2, { x, y, side: SIDE }),
          plaquetteFlux(g, { x, y, side: SIDE }),
          `flux invariant at ${x},${y}`,
        )
      }
    }
  }),
  check('the transform leaves an interior Wilson loop unchanged', () => {
    const g = integerField()
    const lambda = makeGridGrid(SIDE)

    for (let x = 0; x < SIDE; x++) {
      for (let y = 0; y < SIDE; y++) {
        lambda[x]![y] = 2 * x - y
      }
    }

    const g2 = gridGaugeTransform(g, lambda, SIDE)
    const rect = { x0: 1, x1: 4, y0: 1, y1: 3 }
    equal(
      gridWilsonLoop(g2, rect),
      gridWilsonLoop(g, rect),
      'loop invariant under gauge transform',
    )
  }),
])

suite('tool/grid-gauge: single-vortex field', [
  check('a loop encircling the vortex returns exactly the flux (holonomy)', () => {
    const flux = 1.3
    const g = vortexGaugeField({ side: SIDE, flux, centerX: 2, centerY: 2 })
    // The boundary of the 3x3 block around plaquette (2,2) winds once about the
    // singularity, so the Aharonov-Bohm holonomy equals the total enclosed flux.
    close(
      gridWilsonLoop(g, { x0: 1, x1: 4, y0: 1, y1: 4 }),
      flux,
      1e-9,
      'enclosed flux = total flux',
    )
  }),
  check('a plaquette far from the vortex carries ~0 flux', () => {
    const flux = 0.8
    const g = vortexGaugeField({ side: SIDE, flux, centerX: 2, centerY: 2 })
    // The corner cell is in the smooth region (no winding), so its curl vanishes.
    close(plaquetteFlux(g, { x: 0, y: 0, side: SIDE }), 0, 1e-9, 'smooth region has zero flux')
  }),
  check('the total flux over the torus is zero (topological constraint)', () => {
    const flux = 0.8
    const g = vortexGaugeField({ side: SIDE, flux, centerX: 2, centerY: 2 })

    let total = 0

    for (let x = 0; x < SIDE; x++) {
      for (let y = 0; y < SIDE; y++) {
        total += plaquetteFlux(g, { x, y, side: SIDE })
      }
    }

    close(total, 0, 1e-9, 'plaquette fluxes sum to zero on a torus')
  }),
])
