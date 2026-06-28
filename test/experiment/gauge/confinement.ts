// P8 Stage C: non-Abelian confinement.
// Run 3D SU(2) lattice gauge theory, sweep the coupling, and measure the string
// tension via the Creutz ratio chi(2,2). Confinement (an area law) shows up as a
// positive string tension. 3D SU(2) confines at all couplings, with the tension
// decreasing as beta rises, so the signature is chi(2,2) > 0 and falling with
// beta, alongside the average plaquette rising from disorder toward order.
// Run: npx tsx code/experiment/p8-confinement.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import {
  makeSu2Lattice,
  metropolisSweep,
  averagePlaquette,
  wilsonLoop,
} from '@/code/dynamics/su2-lattice'
import { creutzRatioFromLoops } from '@/code/measure/wilson-loop'

function study(input: { beta: number; seed: number }): {
  beta: number
  plaquette: number
  stringTension: number
  acceptance: number
} {
  const rng = makeRng({ seed: input.seed })
  const lattice = makeSu2Lattice({ dim: 3, length: 6, hot: false, rng })
  const eps = 0.5

  // Thermalise.
  let acceptance = 0

  for (let sweep = 0; sweep < 200; sweep++) {
    acceptance = metropolisSweep({
      lattice,
      beta: input.beta,
      eps,
      rng,
    })
  }

  // Measure: average the Wilson loops over decorrelated configurations, then form
  // the Creutz ratio from the averaged loops (averaging loops, not ratios, keeps
  // the estimator stable).
  let w11 = 0
  let w21 = 0
  let w12 = 0
  let w22 = 0

  const measurements = 120

  for (let m = 0; m < measurements; m++) {
    for (let s = 0; s < 3; s++) {
      metropolisSweep({ lattice, beta: input.beta, eps, rng })
    }

    w11 += wilsonLoop({ lattice, r: 1, t: 1 })
    w21 += wilsonLoop({ lattice, r: 2, t: 1 })
    w12 += wilsonLoop({ lattice, r: 1, t: 2 })
    w22 += wilsonLoop({ lattice, r: 2, t: 2 })
  }

  w11 /= measurements
  w21 /= measurements
  w12 /= measurements
  w22 /= measurements

  const stringTension = creutzRatioFromLoops({
    loop11: w11,
    loop21: w21,
    loop12: w12,
    loop22: w22,
  })

  return {
    beta: input.beta,
    plaquette: averagePlaquette({ lattice }),
    stringTension,
    acceptance,
  }
}

export default experiment({
  id: 'gauge/confinement',
  code: 'E-FRC-0007',
  title:
    '3D SU(2) lattice gauge theory confines, a positive string tension that weakens with the coupling',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const betas = [0.5, 1.0, 1.6, 2.2, 3.0]
    const rows = betas.map((beta, index) =>
      study({ beta, seed: 50 + index }),
    )

    const tensions = rows.map(row => row.stringTension)
    const allPositive = tensions.every(tension => tension > 0)
    const decreasing =
      (tensions[0] ?? 0) > (tensions[tensions.length - 1] ?? 0)

    const ok = allPositive && decreasing

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'in 3D SU(2) lattice gauge theory the Creutz-ratio string tension is positive at every coupling and decreases as the coupling rises, the area-law signature of confinement',
      metrics: {
        firstStringTension: tensions[0] ?? 0,
        lastStringTension: tensions[tensions.length - 1] ?? 0,
        allPositive: allPositive ? 1 : 0,
        decreasing: decreasing ? 1 : 0,
      },
      notes:
        'L2, known physics, textbook 3D SU(2) confinement. The Metropolis sweeps use a pseudo-random number generator, so each string tension is a Monte Carlo estimate over an ensemble, not a deterministic-base quantity. The result is a statistical reproduction of a known lattice fact, not an emergent claim about the substrate.',
    })
  },
})
