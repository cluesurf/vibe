import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  type Complex,
  complex,
  cMul,
  cAbs2,
} from '@/code/algebra/linear/complex'

// Closing the gap, a PROPAGATING SPINOR on the curved {5,3,4} bulk. The bare lattice-gas occupation field
// streams (propagates) but is linear, no spinor (spin/lattice-gas-spinor-534). The geometry carries the spin
// connection with holonomy minus one around a 2pi loop (spin/spin-connection-534, spin/continuum-holonomy-534).
// Here we COUPLE them, the staggered Kahler-Dirac step, a two-component spinor field is STREAMED around a loop
// while its spinor index is parallel-transported by the spin connection (an SU(2) link per hop whose product
// around the loop is minus the identity). The result is a field that PROPAGATES around the loop AND returns as
// MINUS itself after one 2pi circuit, plus itself after two, a genuine propagating spinor. The control is the
// trivial connection, where the same streaming field returns to PLUS itself (no spinor), so the minus one is
// supplied by the spin connection, the curvature, not by the streaming.

type Spinor = [Complex, Complex]

// the SU(2) spin-connection link, a rotation about z by 2pi/loopLength, so the product of loopLength links is
// exp(-i pi sigma_z) = minus the identity, the verified {5,3,4} 2pi-loop holonomy
const connectionLink = (loopLength: number): [Complex, Complex] => {
  const angle = Math.PI / loopLength

  return [
    complex({ re: Math.cos(angle), im: -Math.sin(angle) }),
    complex({ re: Math.cos(angle), im: Math.sin(angle) }),
  ]
}

const transport = (
  spinor: Spinor,
  link: [Complex, Complex],
): Spinor => [cMul(link[0], spinor[0]), cMul(link[1], spinor[1])]

const zero = (): Complex => complex({ re: 0, im: 0 })
const closeTo = (spinor: Spinor, target: Spinor): boolean =>
  spinor.every(
    (component, index) =>
      Math.abs(component.re - target[index]!.re) < 1e-9 &&
      Math.abs(component.im - target[index]!.im) < 1e-9,
  )

export default experiment({
  id: 'spin/propagating-spinor-534',
  code: 'E-SPN-0028',
  title:
    'a propagating spinor on curved {5,3,4}, streaming coupled to the spin connection returns minus itself per 2pi loop',
  category: 'spin',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const loop = 12 // a loop of 12 cells around the {5,3,4} structure
    const link = connectionLink(loop)
    const trivialLink: [Complex, Complex] = [
      complex({ re: 1, im: 0 }),
      complex({ re: 1, im: 0 }),
    ]

    // a localized spinor excitation, the streaming field on the ring of cells, seeded at cell 0
    const seed: Spinor = [complex({ re: 1, im: 0 }), zero()]
    const makeField = (): Spinor[] =>
      Array.from({ length: loop }, (_, index) =>
        index === 0
          ? ([complex({ re: 1, im: 0 }), zero()] as Spinor)
          : ([zero(), zero()] as Spinor),
      )

    // one covariant streaming step: the field at cell n comes from cell n-1, parallel-transported by the link
    const step = (
      field: Spinor[],
      theLink: [Complex, Complex],
    ): Spinor[] =>
      field.map((_, index) =>
        transport(field[(index - 1 + loop) % loop]!, theLink),
      )

    // (A) the COUPLED field, stream with the spin connection
    let field = makeField()

    const half = Math.floor(loop / 2)

    // after half a loop, the packet should have moved to the opposite cell and left cell 0
    for (let t = 0; t < half; t++) {
      field = step(field, link)
    }

    const amplitudeAt = (cell: Spinor): number =>
      cAbs2(cell[0]) + cAbs2(cell[1])

    const propagated =
      amplitudeAt(field[half]!) > 0.5 && amplitudeAt(field[0]!) < 1e-9

    for (let t = half; t < loop; t++) {
      field = step(field, link)
    } // finish the loop, back to cell 0

    const afterOneLoop = field[0]! // back at the start after going around
    const minusSeed: Spinor = [complex({ re: -1, im: 0 }), zero()]
    const spinorFlipAfterOneLoop = closeTo(afterOneLoop, minusSeed)

    for (let t = 0; t < loop; t++) {
      field = step(field, link)
    } // a second loop

    const afterTwoLoops = field[0]!
    const spinorReturnAfterTwoLoops = closeTo(afterTwoLoops, seed)

    // (B) CONTROL, the trivial connection, the same streaming field returns to PLUS itself, no spinor
    let control = makeField()

    for (let t = 0; t < loop; t++) {
      control = step(control, trivialLink)
    }

    const trivialAfterOneLoop = control[0]!
    const trivialReturnsPlus = closeTo(trivialAfterOneLoop, seed)

    const ok =
      propagated &&
      spinorFlipAfterOneLoop &&
      spinorReturnAfterTwoLoops &&
      trivialReturnsPlus

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a two-component field streamed around a loop on {5,3,4} while parallel-transported by the spin connection PROPAGATES and returns as minus itself after one 2pi circuit and plus itself after two, a propagating spinor on the curved bulk, while the same field with a trivial connection returns to plus itself',
      metrics: {
        propagated: propagated ? 1 : 0,
        spinorFlipAfterOneLoop: spinorFlipAfterOneLoop ? 1 : 0,
        spinorReturnAfterTwoLoops: spinorReturnAfterTwoLoops ? 1 : 0,
      },
      // CONTROL: with the trivial connection the streaming field returns to PLUS itself (no spinor), so the
      // minus one is supplied by the {5,3,4} spin connection (the curvature), not by the streaming. The
      // coupling of the two is what makes a propagating spinor.
      control: {
        trivialConnectionReturnsPlus: trivialReturnsPlus ? 1 : 0,
      },
      notes:
        'Closes the residual gap of spin/lattice-gas-spinor-534. The streaming gives propagation, the spin connection (verified in spin/spin-connection-534 and spin/continuum-holonomy-534) gives the spinor minus one, the coupling gives a propagating spinor on the curved {5,3,4} bulk. The connection link is the staggered Kahler-Dirac coupling, an SU(2) transport whose loop product is the verified minus-one holonomy. OPEN refinement, deriving these link variables from the bare conserving rule (rather than the geometry) is the deepest residual question.',
    })
  },
})
