// The Meissner effect on the lattice Maxwell operator, closing the superconductivity row's field
// half. A superconductor is a medium whose carriers flow without dissipation, and the model has
// measured pieces of that: the gas has no wavelength-independent damping (E-FLD-0015) and an
// impurity-free current persists exactly (E-FLD-0017). London's step turns dissipationless flow
// plus minimal coupling into a constitutive law, the current proportional to minus the potential,
// which makes the field operator the MASSIVE (Proca) Maxwell operator, the same mass term
// maxwellLatticeMatrix already carries. The Meissner effect is then the massive Green's function:
//
//   - EXPULSION WITH THE EXACT LATTICE DEPTH: a uniform current sheet's magnetic field inside the
//     London medium decays exponentially, and the fitted decay rate matches the exact lattice
//     prediction 2 asinh(m/2) to better than one percent at both masses tested. Halving the London
//     mass doubles the penetration depth on the same exact curve, the London scaling.
//   - THE NORMAL CONTROL PENETRATES: at a near-zero mass the same field stays above sixty percent
//     of its surface value six cells deep, the static field of a normal medium, no expulsion.
//   - THE SHEET REDUCTION IS REAL: the one-dimensional solve is cross-checked against the full
//     three-dimensional curl-curl operator (conjugate gradients at the heaviest mass), matching the
//     field profile pointwise.
//
// So flux expulsion with the London penetration depth is what the model's field sector does the
// moment its carriers are dissipationless, which the gas sector measures. What stays open, and the
// ledger row keeps saying so, is the PAIRING mechanism: why carriers remain dissipationless
// DESPITE impurities below a transition temperature (E-FLD-0017 measures the opposite for the bare
// gas, impurities damp it). Depth L2: known London-Meissner physics assembled on the model's own
// operator with the stated constitutive bridge, deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  applyMaxwell,
  maxwellLatticeMatrix,
  maxwellLinkIndex,
  plaquetteFlux,
} from '@/code/operator/maxwell-lattice'

const SHEET_SIDE = 32

// the exact 1D periodic sheet solve: (-Delta + m^2) A = delta, B is the lattice derivative
function sheetField(input: { side: number; mass: number }): number[] {
  const { side, mass } = input
  const A = new Array<number>(side).fill(0)

  for (let x = 0; x < side; x++) {
    let a = 0

    for (let k = 1; k < side; k++) {
      const kk = (2 * Math.PI * k) / side

      a += Math.cos(kk * x) / (4 * Math.sin(kk / 2) ** 2 + mass * mass)
    }

    a += 1 / (mass * mass)
    A[x] = a / side
  }

  const B: number[] = []

  for (let x = 0; x < side; x++) {
    B.push(Math.abs(A[(x + 1) % side]! - A[x]!))
  }

  return B
}

function fittedRate(B: number[]): number {
  const rates: number[] = []

  for (let x = 2; x <= 8; x++) {
    rates.push(Math.log(B[x]! / B[x + 1]!))
  }

  return rates.reduce((a, b) => a + b, 0) / rates.length
}

// the 3D cross-check: the same sheet through the full curl-curl operator, conjugate gradients
function crossCheck3d(mass: number): number[] {
  const L = 8
  const H = maxwellLatticeMatrix({ side: L, mass: mass * mass })
  const source = new Float64Array(3 * L * L * L)

  for (let y = 0; y < L; y++) {
    for (let z = 0; z < L; z++) {
      source[
        maxwellLinkIndex({ side: L, x: 0, y, z, direction: 1 })
      ] = 1
    }
  }

  const x = new Float64Array(source.length)
  const r = Float64Array.from(source)
  const p = Float64Array.from(source)

  let rs = 0

  for (const v of r) {
    rs += v * v
  }

  for (let it = 0; it < 400; it++) {
    const Hp = applyMaxwell({ matrix: H, field: p })

    let pHp = 0

    for (let i = 0; i < p.length; i++) {
      pHp += p[i]! * Hp[i]!
    }

    const alpha = rs / pHp

    for (let i = 0; i < x.length; i++) {
      x[i]! += alpha * p[i]!
      r[i]! -= alpha * Hp[i]!
    }

    let rs2 = 0

    for (const v of r) {
      rs2 += v * v
    }

    if (rs2 < 1e-20) {
      break
    }

    const beta = rs2 / rs

    for (let i = 0; i < p.length; i++) {
      p[i] = r[i]! + beta * p[i]!
    }

    rs = rs2
  }

  const profile: number[] = []

  for (let d = 1; d <= 3; d++) {
    profile.push(
      Math.abs(
        plaquetteFlux({
          side: L,
          field: x,
          x: d,
          y: 4,
          z: 4,
          orientation: 2,
        }),
      ),
    )
  }

  return profile
}

export default experiment({
  id: 'gauge/meissner-screening',
  code: 'E-FRC-0078',
  title:
    "the Meissner effect from the London bridge on the model's own operator: dissipationless flow (measured on the gas) plus minimal coupling makes the field operator massive, the current sheet's field is then expelled with a fitted decay rate matching the exact lattice penetration 2 asinh(m/2) to under one percent at two London masses (halving the mass doubles the depth), the near-massless control penetrates sixty percent deep (the normal medium), and the one-dimensional solve matches the full three-dimensional curl-curl operator pointwise, leaving the pairing mechanism (dissipationless despite impurities, a transition temperature) as the row's open half",
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const heavy = sheetField({ side: SHEET_SIDE, mass: 1 })
    const light = sheetField({ side: SHEET_SIDE, mass: 0.5 })
    const normal = sheetField({ side: SHEET_SIDE, mass: 0.05 })

    const heavyRate = fittedRate(heavy)
    const lightRate = fittedRate(light)
    const heavyExact = 2 * Math.asinh(0.5)
    const lightExact = 2 * Math.asinh(0.25)

    const heavyMatch =
      Math.abs(heavyRate - heavyExact) / heavyExact < 0.01
    const lightMatch =
      Math.abs(lightRate - lightExact) / lightExact < 0.01
    const londonScaling =
      Math.abs(heavyRate / lightRate - heavyExact / lightExact) < 0.02
    const normalPenetrates = normal[6]! > 0.5 * normal[1]!

    // the 3D cross-check at the heaviest mass, pointwise within five percent
    const profile3d = crossCheck3d(1)
    const profile1d = sheetField({ side: 8, mass: 1 })

    let worstCross = 0

    for (let d = 1; d <= 3; d++) {
      worstCross = Math.max(
        worstCross,
        Math.abs(profile3d[d - 1]! - profile1d[d]!) / profile1d[d]!,
      )
    }

    const crossChecked = worstCross < 0.05

    const ok =
      heavyMatch &&
      lightMatch &&
      londonScaling &&
      normalPenetrates &&
      crossChecked

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'both fitted decay rates match 2 asinh(m/2) within one percent, their ratio holds the London scaling within two percent, the near-massless field stays above half its surface value six cells deep, and the 3D operator matches the sheet solve within five percent',
      metrics: {
        fittedRateMass1: Number(heavyRate.toFixed(4)),
        exactRateMass1: Number(heavyExact.toFixed(4)),
        fittedRateMassHalf: Number(lightRate.toFixed(4)),
        exactRateMassHalf: Number(lightExact.toFixed(4)),
        crossCheckWorstError: Number(worstCross.toFixed(4)),
      },
      // CONTROL: the near-massless (normal) medium, where the field penetrates instead of dying
      control: {
        normalDepthSixRatio: Number(
          (normal[6]! / normal[1]!).toFixed(3),
        ),
      },
      notes:
        'the London step (current proportional to minus the potential) is the stated constitutive bridge, standard since 1935, and its justification here is the measured dissipationless transport of the clean gas. The missing microphysics is exactly what the ledger row still lists: a pairing mechanism that keeps carriers dissipationless despite impurities, with a transition temperature. The mass term doubling as the Anderson-Higgs mechanism connects this to electroweak_boson_masses.',
    })
  },
})
