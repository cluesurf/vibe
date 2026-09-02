// Why no magnetic monopole has ever been seen, on the model. The model's gauge connection is DERIVED:
// the magnitude half from fills (E-FRC-0073) and the phase candidates from site clocks, so whatever
// the final carrier is, the magnetic field is the lattice curl of a link potential. For a curl, the
// no-monopole law is not a dynamical accident but an exact identity: the net flux out of every cube
// sums each link twice with opposite signs, so div B = 0 to the last digit for EVERY link field, with
// no equation of motion involved (the lattice Bianchi identity). The monopole field itself is outside
// the potential-derived space: its closed-surface flux is nonzero, which no curl can produce.
//
// The measured contrast that makes this falsifiable rather than definitional: lattice monopoles DO
// exist in the COMPACT reading, where plaquette flux is only defined modulo 2 pi. The Dirac-string
// potential (one flux quantum, string along -z) has div B exactly zero in the non-compact reading
// (the string carries the return flux), and the DeGrand-Toussaint prescription (each plaquette flux
// wrapped to (-pi, pi]) finds exactly one +1 and one -1 charged cube on the same field, the monopole
// and its periodic image. So monopoles require a connection that wraps, and the model's derived
// connection (a real-valued magnitude, a clock phase that lives on sites) does not wrap.
// PREDICTION: free magnetic monopoles are exactly absent, at every scale, not merely rare. Depth L2:
// known lattice gauge structure (Bianchi, DeGrand-Toussaint) measured exactly, framing the model's
// derived connection. Deterministic, structured fields, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  cubeDivergence,
  gradientLinkField,
  linkField,
  plaquetteFlux,
} from '@/code/operator/maxwell-lattice'

const TWO_PI = 2 * Math.PI

function wrap(v: number): number {
  let w = v % TWO_PI

  if (w > Math.PI) {
    w -= TWO_PI
  }

  if (w <= -Math.PI) {
    w += TWO_PI
  }

  return w
}

// worst |div B| over every cube of a link field
function worstDivergence(input: {
  side: number
  field: Float64Array
}): number {
  const { side, field } = input
  let worst = 0

  for (let x = 0; x < side; x++) {
    for (let y = 0; y < side; y++) {
      for (let z = 0; z < side; z++) {
        worst = Math.max(
          worst,
          Math.abs(cubeDivergence({ side, field, x, y, z })),
        )
      }
    }
  }

  return worst
}

// the Dirac-string potential, one flux quantum, string along -z through the box center
function diracField(side: number): Float64Array {
  const center = side / 2 - 0.5

  const potential = (
    px: number,
    py: number,
    pz: number,
  ): [number, number, number] => {
    const dx = px - center
    const dy = py - center
    const dz = pz - center
    const rho = Math.hypot(dx, dy)
    const r = Math.hypot(dx, dy, dz)

    if (rho < 1e-9) {
      return [0, 0, 0]
    }

    const magnitude = (TWO_PI / (4 * Math.PI)) * ((1 - dz / r) / rho)

    return [(-magnitude * dy) / rho, (magnitude * dx) / rho, 0]
  }

  return linkField({
    side,
    value: (x, y, z, d) => {
      const mx = d === 0 ? x + 0.5 : x
      const my = d === 1 ? y + 0.5 : y
      const mz = d === 2 ? z + 0.5 : z

      return potential(mx, my, mz)[d]!
    },
  })
}

// the DeGrand-Toussaint monopole charges (in flux quanta) of a link field under compact reduction
function compactCharges(input: {
  side: number
  field: Float64Array
}): number[] {
  const { side, field } = input
  const charges: number[] = []

  const face = (
    px: number,
    py: number,
    pz: number,
    orientation: number,
  ): number =>
    wrap(
      plaquetteFlux({
        side,
        field,
        x: (px + side) % side,
        y: (py + side) % side,
        z: (pz + side) % side,
        orientation,
      }),
    )

  for (let x = 0; x < side; x++) {
    for (let y = 0; y < side; y++) {
      for (let z = 0; z < side; z++) {
        let q = 0

        q += face(x + 1, y, z, 0) - face(x, y, z, 0)
        q += face(x, y + 1, z, 1) - face(x, y, z, 1)
        q += face(x, y, z + 1, 2) - face(x, y, z, 2)

        if (Math.abs(q) > 1) {
          charges.push(Math.round(q / TWO_PI))
        }
      }
    }
  }

  return charges.sort((a, b) => a - b)
}

export default experiment({
  id: 'gauge/monopole-absence',
  code: 'E-FRC-0076',
  title:
    'monopole absence is exactness: div B is zero to the last digit for every link potential at two lattice sizes (the lattice Bianchi identity, no dynamics involved), the hand-made monopole field has nonzero closed-surface flux so no potential can realize it, and the Dirac-string potential that is monopole-free in the non-compact reading shows exactly the +1 and -1 DeGrand-Toussaint pair under compact (mod 2 pi) reduction, so lattice monopoles require a wrapping connection and the model prediction is exact absence of free monopoles',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const sides = [8, 10]

    // 1. the Bianchi identity for three field families at both sizes
    const worst = Math.max(
      ...sides.flatMap(side => [
        worstDivergence({
          side,
          field: linkField({
            side,
            value: (x, y, z, d) =>
              Math.cos((TWO_PI * (x + 2 * y + 3 * z + d)) / side) +
              0.3 * Math.sin((TWO_PI * (2 * x - y + z)) / side),
          }),
        }),
        worstDivergence({
          side,
          field: gradientLinkField({
            side,
            scalar: (x, y, z) =>
              Math.cos((TWO_PI * (x + y)) / side) + 0.1 * z,
          }),
        }),
        worstDivergence({ side, field: diracField(side) }),
      ]),
    )

    // 2. the monopole field is outside the space: nonzero net flux out of the central cube
    // (face-center estimate of B = rhat / r^2 through the six unit faces)
    const side = 8
    const center = side / 2 - 0.5
    const cube = Math.floor(center)

    const monopoleFace = (
      px: number,
      py: number,
      pz: number,
      o: number,
    ): number => {
      const fx = o === 0 ? px : px + 0.5
      const fy = o === 1 ? py : py + 0.5
      const fz = o === 2 ? pz : pz + 0.5
      const dx = fx - center
      const dy = fy - center
      const dz = fz - center
      const r = Math.hypot(dx, dy, dz)

      return [dx, dy, dz][o]! / (r * r * r)
    }

    let monopoleFlux = 0

    monopoleFlux += monopoleFace(cube + 1, cube, cube, 0)
    monopoleFlux -= monopoleFace(cube, cube, cube, 0)
    monopoleFlux += monopoleFace(cube, cube + 1, cube, 1)
    monopoleFlux -= monopoleFace(cube, cube, cube, 1)
    monopoleFlux += monopoleFace(cube, cube, cube + 1, 2)
    monopoleFlux -= monopoleFace(cube, cube, cube, 2)

    // 3. the compact control: the Dirac-string field grows the DeGrand-Toussaint pair
    const charges = compactCharges({ side: 8, field: diracField(8) })

    const bianchiExact = worst < 1e-12
    const monopoleOutside = monopoleFlux > 1
    const pairFound =
      charges.length === 2 && charges[0] === -1 && charges[1] === 1

    const ok = bianchiExact && monopoleOutside && pairFound

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'every link potential has div B under 1e-12 on every cube at sides 8 and 10, the monopole field has order-ten closed-surface flux no potential can produce, and the compact reduction of the Dirac-string potential finds exactly the plus-minus-one monopole pair',
      metrics: {
        worstBianchiResidual: Number(worst.toExponential(2)),
        monopoleCubeFlux: Number(monopoleFlux.toFixed(3)),
        compactChargeCount: charges.length,
      },
      // CONTROL: the compact reading DOES find monopoles on the same field, so the null result of
      // the non-compact reading is a property of the formulation, not blindness of the detector
      control: {
        compactChargeMinus: charges[0] ?? 0,
        compactChargePlus: charges[1] ?? 0,
      },
      notes:
        "the face-center flux estimate for the hand monopole is coarse (24.0 for the singular cube against the continuum 4 pi), which does not matter: the gate is nonzero against an identity that holds to 1e-12. The model's remaining exposure: if the final phase carrier turned out to be an angle that wraps (compact), monopoles would return as DeGrand-Toussaint defects, so this experiment doubles as a discriminator on the carrier hunt (see the sixth-thing programme).",
    })
  },
})
