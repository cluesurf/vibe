// The coupled fermion-plus-gauge evolution on a 1+1D ring, the lattice Schwinger model realized as
// the substrate's photon (gauge) and fermion (spinor) sectors. One synchronous beat is: the fermion
// mass coin, a gauge-covariant shift carrying the Peierls phase e * theta, then the gauge field
// back-reacting to the fermion current (Ampere) and evolving the link. The coupling e binds the two
// sectors. At e = 0 they decouple. Everything is deterministic, a fixed Gaussian wavepacket and a
// fixed background field, no randomness. Reused by the co-emergence and coupling experiments.

import {
  type Complex,
  cAbs2,
  cAdd,
  cConj,
  cFromPhase,
  cMul,
  cScale,
  complex,
} from '@/code/algebra/linear/complex'

const ZERO: Complex = complex({ re: 0, im: 0 })
const IMAGINARY: Complex = complex({ re: 0, im: 1 })

export type CoupledSchwingerInput = {
  sites: number
  coupling: number // the gauge coupling e, the free constant whose value the bare rule does not fix
  mass: number
  flavors: number // the number of identical charged fermion copies sharing the one gauge field
  backgroundField: number // a constant E0 seeded on every link, to probe the field -> fermion push
  momentumStart: number // the initial fermion momentum, to probe the fermion -> field radiation
  steps: number
  dt: number
}

export type CoupledSchwingerResult = {
  fieldEnergy: number // the field energy sourced above the constant background
  momentumDrift: number // the change in the fermion mean momentum over the run
}

// the gauge-naive lattice momentum of one flavor, <p> = sum Im(psi*_x psi_{x+1}) / norm
function meanMomentum(
  R: Complex[],
  Lf: Complex[],
  wrap: (x: number) => number,
): number {
  const sites = R.length

  let current = 0
  let norm = 0

  for (let x = 0; x < sites; x++) {
    const next = wrap(x + 1)
    current +=
      cMul(cConj(R[x]!), R[next]!).im +
      cMul(cConj(Lf[x]!), Lf[next]!).im
    norm += cAbs2(R[x]!) + cAbs2(Lf[x]!)
  }

  return norm > 0 ? current / norm : 0
}

export function runCoupledSchwinger(
  input: CoupledSchwingerInput,
): CoupledSchwingerResult {
  const {
    sites,
    coupling,
    mass,
    flavors,
    backgroundField,
    momentumStart,
    steps,
    dt,
  } = input

  const wrap = (x: number): number => ((x % sites) + sites) % sites
  const cosM = Math.cos(mass)
  const sinM = Math.sin(mass)

  // one charged Gaussian wavepacket per flavor, on the right-mover, all identical
  const R: Complex[][] = []
  const Lf: Complex[][] = []
  const x0 = sites / 2
  const width = sites / 16

  for (let f = 0; f < flavors; f++) {
    let r: Complex[] = new Array(sites).fill(ZERO)
    let lf: Complex[] = new Array(sites).fill(ZERO)

    for (let x = 0; x < sites; x++) {
      const envelope = Math.exp(-((x - x0) ** 2) / (2 * width * width))
      r[x] = cScale(cFromPhase({ phase: momentumStart * x }), envelope)
    }

    let norm = 0

    for (let x = 0; x < sites; x++) {
      norm += cAbs2(r[x]!) + cAbs2(lf[x]!)
    }

    const inverse = 1 / Math.sqrt(norm)
    r = r.map(z => cScale(z, inverse))
    lf = lf.map(z => cScale(z, inverse))
    R.push(r)
    Lf.push(lf)
  }

  const theta = new Array(sites).fill(0)
  const electric: number[] = new Array<number>(sites).fill(
    backgroundField,
  )

  const step = (): void => {
    const current = new Array(sites).fill(0)

    for (let f = 0; f < flavors; f++) {
      const r = R[f]!
      const lf = Lf[f]!
      // (1) the fermion mass coin, mixing the two chiralities
      const r2: Complex[] = new Array(sites)
      const l2: Complex[] = new Array(sites)

      for (let x = 0; x < sites; x++) {
        r2[x] = cAdd(
          cScale(r[x]!, cosM),
          cScale(cMul(IMAGINARY, lf[x]!), -sinM),
        )
        l2[x] = cAdd(
          cScale(cMul(IMAGINARY, r[x]!), -sinM),
          cScale(lf[x]!, cosM),
        )
      }

      // (2) this flavor's current across each bond, before the shift, accumulated into the shared field
      for (let x = 0; x < sites; x++) {
        current[x]! += cAbs2(r2[x]!) - cAbs2(l2[wrap(x + 1)]!)
      }

      // (3) gauge-covariant shift: R hops +1 with e^{i e theta}, L hops -1 with e^{-i e theta}
      const r3: Complex[] = new Array(sites).fill(ZERO)
      const l3: Complex[] = new Array(sites).fill(ZERO)

      for (let x = 0; x < sites; x++) {
        r3[wrap(x + 1)] = cMul(
          r2[x]!,
          cFromPhase({ phase: coupling * theta[x]! }),
        )
        l3[wrap(x - 1)] = cMul(
          l2[x]!,
          cFromPhase({ phase: -coupling * theta[wrap(x - 1)]! }),
        )
      }

      R[f] = r3
      Lf[f] = l3
    }

    // (4) the shared gauge field back-reacts to the total current and evolves the link
    for (let x = 0; x < sites; x++) {
      electric[x]! -= coupling * current[x]! * dt
    }

    for (let x = 0; x < sites; x++) {
      theta[x]! += electric[x]! * dt
    }
  }

  const momentumBefore = meanMomentum(R[0]!, Lf[0]!, wrap)
  const backgroundEnergy = backgroundField * backgroundField * sites

  for (let t = 0; t < steps; t++) {
    step()
  }

  const momentumAfter = meanMomentum(R[0]!, Lf[0]!, wrap)
  const fieldEnergy =
    electric.reduce((a, v) => a + v * v, 0) - backgroundEnergy

  return {
    fieldEnergy: Math.abs(fieldEnergy),
    momentumDrift: momentumAfter - momentumBefore,
  }
}
