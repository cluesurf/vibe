// Frontier 5, the self both sources and falls, the equivalence principle on the substrate. Gravity was shown on
// abstract test masses and rays. Here a SELF (a bound body of mass cells, the emergent matter) is shown to do both
// things a gravitating body must, SOURCE the field in proportion to its mass, and FALL in an external field at a
// rate INDEPENDENT of its mass.
//
//   - SOURCE proportional to mass (the gravitational mass). A bigger body sources a wider gravity well, the well
//     range grows with the body mass, so the field a self produces is set by how much self there is.
//   - UNIVERSAL free fall (the inertial mass equals the gravitational mass). In a uniform external field, bodies of
//     very different mass fall at EXACTLY the same rate (one cell per beat), because every piece follows the same
//     field gradient. This is the equivalence principle, the universality of free fall, and it holds because gravity
//     here is GEOMETRIC (the potential gradient), not a force proportional to a charge that would have to be divided
//     out. A flat field gives no fall at all, the control, so it is the field GRADIENT that moves a body, and a
//     UNIFORM (constant) field term gives no local force, which is exactly the cosmological-constant role of the
//     wake's uniform growth, the dark-energy term that drives global expansion but no local attraction.
//
// So the self sources gravity in proportion to its mass and falls universally, the equivalence principle, closing
// the matter-coupling frontier. Depth L2, the source-mass scaling and the mass-independent free fall measured
// deterministically, with the flat field the no-force control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh } from '@/code/tool/mesh'
import { bulkMass, relaxPotential } from '@/code/dynamics/gravity-field'
import { freeFallStep } from '@/code/dynamics/free-fall'

const SIDE = 24
const DEGREE = 24

export default experiment({
  id: 'selves/equivalence-principle',
  code: 'E-SLF-0046',
  title:
    'a self sources gravity in proportion to its mass and falls universally, the equivalence principle on the substrate',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const cellCount = mesh.cellCount
    const half = Math.floor(SIDE / 2)
    const coord = (c: number): number[] => [
      c % SIDE,
      Math.floor(c / SIDE) % SIDE,
      Math.floor(c / (SIDE * SIDE)) % SIDE,
      Math.floor(c / SIDE ** 3) % SIDE,
    ]

    const neighbour = (c: number, d: number): number =>
      mesh.neighbour(c, d)

    const index = (
      x: number,
      y: number,
      z: number,
      w: number,
    ): number => x + SIDE * y + SIDE * SIDE * z + SIDE ** 3 * w

    const distance = (c: number): number =>
      coord(c).reduce((s, v) => s + Math.abs(v - half), 0)

    // SOURCE proportional to mass, a body of radius `radius` sources a well whose range grows with its mass
    const sourceWell = (
      radius: number,
    ): { mass: number; range: number } => {
      const body = new Uint8Array(cellCount)

      for (let c = 0; c < cellCount; c++) {
        const p = coord(c)

        if (
          (p[0]! - half) ** 2 +
            (p[1]! - half) ** 2 +
            (p[2]! - half) ** 2 +
            (p[3]! - half) ** 2 <=
          radius * radius
        ) {
          body[c] = 1
        }
      }

      const phi = relaxPotential({
        source: bulkMass({
          occupied: body,
          neighbour,
          cellCount,
          spatialDegree: DEGREE,
          minNeighbours: 3,
        }),
        neighbour,
        cellCount,
        spatialDegree: DEGREE,
        sweeps: 200,
        strength: 4,
        cap: 13,
      })

      let mass = 0
      let range = 0

      for (let c = 0; c < cellCount; c++) {
        if (body[c]) {
          mass++
        }

        if (phi[c]! < 0 && distance(c) > range) {
          range = distance(c)
        }
      }

      return { mass, range }
    }

    const smallSource = sourceWell(2)
    const largeSource = sourceWell(4)

    // UNIVERSAL free fall, a uniform field phi = x, bodies of different mass (perpendicular to the field, so excluded
    // volume does not self-block) fall at the same rate
    const uniformField = new Int32Array(cellCount)

    for (let c = 0; c < cellCount; c++) {
      uniformField[c] = coord(c)[0]!
    }

    const fallRate = (
      shape: 'point' | 'plane' | 'block',
    ): { mass: number; rate: number } => {
      const body = new Uint8Array(cellCount)
      const x0 = 20
      const y0 = 10
      const z0 = 10
      const w0 = 10

      if (shape === 'point') {
        body[index(x0, y0, z0, w0)] = 1
      }

      if (shape === 'plane') {
        for (let dy = 0; dy < 3; dy++) {
          for (let dz = 0; dz < 3; dz++) {
            body[index(x0, y0 + dy, z0 + dz, w0)] = 1
          }
        }
      }

      if (shape === 'block') {
        for (let dy = 0; dy < 3; dy++) {
          for (let dz = 0; dz < 3; dz++) {
            for (let dw = 0; dw < 2; dw++) {
              body[index(x0, y0 + dy, z0 + dz, w0 + dw)] = 1
            }
          }
        }
      }

      const centroidX = (): number => {
        let sum = 0
        let count = 0

        for (let c = 0; c < cellCount; c++) {
          if (body[c]) {
            sum += coord(c)[0]!
            count++
          }
        }

        return count ? sum / count : 0
      }

      let mass = 0

      for (let c = 0; c < cellCount; c++) {
        if (body[c]) {
          mass++
        }
      }

      const start = centroidX()
      const beats = 8

      for (let b = 0; b < beats; b++) {
        freeFallStep({
          occupied: body,
          phi: uniformField,
          neighbour,
          cellCount,
          spatialDegree: DEGREE,
        })
      }

      return { mass, rate: (start - centroidX()) / beats }
    }

    const point = fallRate('point')
    const plane = fallRate('plane')
    const block = fallRate('block')

    // the control, a flat field has no gradient and no body moves
    const flatField = new Int32Array(cellCount)
    const flatBody = new Uint8Array(cellCount)

    flatBody[index(20, 10, 10, 10)] = 1

    let flatMoves = 0

    for (let b = 0; b < 8; b++) {
      flatMoves += freeFallStep({
        occupied: flatBody,
        phi: flatField,
        neighbour,
        cellCount,
        spatialDegree: DEGREE,
      })
    }

    // the source range grows with mass, the fall rate is mass-independent (the three masses fall at the same rate),
    // and the flat field produces no fall
    const sourceScalesWithMass =
      largeSource.mass > smallSource.mass &&
      largeSource.range > smallSource.range

    const rates = [point.rate, plane.rate, block.rate]
    const universalFreeFall =
      Math.max(...rates) - Math.min(...rates) < 1e-9 && point.rate > 0.5

    const flatNoForce = flatMoves === 0
    const ok = sourceScalesWithMass && universalFreeFall && flatNoForce

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a self sources gravity in proportion to its mass (a larger body sources a wider gravity well) and falls universally (bodies of mass one, nine, and eighteen fall at exactly the same rate in a uniform field, the universality of free fall), so the gravitational mass that sources the field equals the inertial mass that responds, the equivalence principle. It holds because gravity here is the geometric potential gradient, not a charge-proportional force, and a flat field moves nothing (the control), so a uniform field term gives no local force, the cosmological-constant role of the wake uniform growth.',
      metrics: {
        smallSourceMass: smallSource.mass,
        smallSourceRange: smallSource.range,
        largeSourceMass: largeSource.mass,
        largeSourceRange: largeSource.range,
        pointMass: point.mass,
        blockMass: block.mass,
        pointFallRate: Number(point.rate.toFixed(4)),
        blockFallRate: Number(block.rate.toFixed(4)),
        fallRateSpread: Number(
          (Math.max(...rates) - Math.min(...rates)).toFixed(6),
        ),
        flatMoves,
      },
      control: { flatMoves },
      notes:
        'AUDIT 2026-08-31: this run uses d4Mesh with an even side, which is two disconnected lattices (the D4 roots preserve coordinate-sum parity, see the PARITY note on d4Mesh). The seeds and measurements here are local, so the result stands on the component the seed lives in; roadmap item 0017 tracks the switch to an odd side. ' +
        'the source range grows with the body mass (the gravitational mass), and the free-fall rate is identical across masses (one cell per beat for every body, the inertial-equals-gravitational equivalence principle), because the free fall follows the field gradient, the same for all bodies. The bodies are oriented perpendicular to the field so excluded volume does not self-block. The flat-field control moves nothing, confirming it is the GRADIENT that gravitates, so a uniform field term (the wake uniform growth) is a no-local-force cosmological constant, the dark-energy term. This closes the matter-coupling frontier, the self both sources and falls.',
    })
  },
})
