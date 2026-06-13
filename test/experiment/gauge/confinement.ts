// P8 Stage C: non-Abelian confinement.
// Run 3D SU(2) lattice gauge theory, sweep the coupling, and measure the string
// tension via the Creutz ratio chi(2,2). Confinement (an area law) shows up as a
// positive string tension. 3D SU(2) confines at all couplings, with the tension
// decreasing as beta rises, so the signature is chi(2,2) > 0 and falling with
// beta, alongside the average plaquette rising from disorder toward order.
// Run: npx tsx code/experiment/p8-confinement.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '@/code/tool/rng'
import {
  makeSu2Lattice,
  metropolisSweep,
  averagePlaquette,
  wilsonLoop,
} from '@/code/dynamics/su2-lattice'

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
    acceptance = metropolisSweep({ lattice, beta: input.beta, eps, rng })
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

  const numerator = w22 * w11
  const denominator = w21 * w12
  const stringTension =
    numerator > 0 && denominator > 0 ? -Math.log(numerator / denominator) : 0

  return {
    beta: input.beta,
    plaquette: averagePlaquette({ lattice }),
    stringTension,
    acceptance,
  }
}

export function main(): void {
  const betas = [0.5, 1.0, 1.6, 2.2, 3.0]
  const rows = betas.map((beta, i) => study({ beta, seed: 50 + i }))

  console.log('P8 Stage C: 3D SU(2) confinement (L=6)')
  console.log('  beta   avgPlaquette  stringTension(2,2)  acceptance')
  for (const r of rows) {
    console.log(
      `  ${r.beta.toFixed(1).padStart(4)}  ${r.plaquette.toFixed(3).padStart(11)}  ${r.stringTension.toFixed(3).padStart(17)}  ${r.acceptance.toFixed(2).padStart(10)}`,
    )
  }
  const tensions = rows.map((r) => r.stringTension)
  const allPositive = tensions.every((t) => t > 0)
  const decreasing = (tensions[0] ?? 0) > (tensions[tensions.length - 1] ?? 0)
  console.log('')
  console.log(
    `  confinement (string tension > 0 at all beta): ${allPositive ? 'YES' : 'no'}`,
  )
  console.log(
    `  tension decreases as beta rises (weakening): ${decreasing ? 'YES' : 'no'}`,
  )
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
