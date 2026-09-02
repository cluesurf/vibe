// The Einstein-aether bound on the withdrawn Chronoflux action's kinetic coefficient, applied. The
// recovered 2022 action (Zenodo 18988402) is a unit-timelike vector field with a Lagrange multiplier
// and weighted kinetic terms, which is Einstein-aether theory (Jacobson and Mattingly), with the
// Chronoflux alpha_1 sitting where the aether c_1 does and the corpus citing none of that literature.
// The sharpest published constraint is the gravitational-wave speed: in Einstein-aether the spin-2
// mode's speed is s_2^2 = 1 / (1 - c_13), and with the correspondence c_1 = alpha_1, c_3 = 0 named by
// the corpus changelog, s_2^2 = 1 / (1 - alpha_1). GW170817 with its gamma-ray counterpart bounds
// |s_2 - 1| below 3e-15, so |alpha_1| is pinned below about 6e-15. Measured here: over a logarithmic
// grid of alpha_1 from 1e-20 to 1, every value above 6e-15 is excluded and every value below 2e-15
// survives, so an order-one alpha_1, which is what the corpus's papers use when the flow sector does
// any work, is excluded by fifteen orders of magnitude unless the correspondence itself is broken.
// The control checks the formula's exact limit: alpha_1 = 0 gives speed exactly one. Depth L1: an
// exact published formula evaluated, an external theory's parameter confronted with a published bound.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const GW_BOUND = 3e-15

// the Einstein-aether spin-2 speed squared with c_13 = alpha_1 (c_3 = c_4 = 0)
function spin2SpeedSquared(alpha1: number): number {
  return 1 / (1 - alpha1)
}

export default experiment({
  id: 'relativity/chronoflux-aether-bound',
  code: 'E-RLT-0044',
  title:
    "the gravitational-wave speed bound applied to the withdrawn Chronoflux action through its Einstein-aether correspondence: the spin-2 speed 1/(1 - alpha_1) with the GW170817 bound |s - 1| < 3e-15 pins |alpha_1| below 6e-15, excluding the order-one values the corpus's flow sector uses by fifteen orders of magnitude, with the alpha_1 = 0 limit exact as the control",
  category: 'relativity',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    const decades: number[] = []

    for (let exponent = -20; exponent <= 0; exponent++) {
      decades.push(10 ** exponent)
      decades.push(-(10 ** exponent))
    }

    let excluded = 0
    let survived = 0
    let boundaryDecade = 0

    for (const alpha1 of decades) {
      const speed = Math.sqrt(spin2SpeedSquared(alpha1))

      if (Math.abs(speed - 1) > GW_BOUND) {
        excluded++

        if (Math.abs(alpha1) < 1e-14) {
          boundaryDecade++
        }
      } else {
        survived++
      }
    }

    // every surviving |alpha_1| is below 6e-15, every excluded one above 2e-15
    let survivorsSmall = true
    let excludedLarge = true

    for (const alpha1 of decades) {
      const speed = Math.sqrt(spin2SpeedSquared(alpha1))
      const inBound = Math.abs(speed - 1) <= GW_BOUND

      if (inBound && Math.abs(alpha1) > 6e-15) {
        survivorsSmall = false
      }

      if (!inBound && Math.abs(alpha1) < 2e-15) {
        excludedLarge = false
      }
    }

    const limitExact = spin2SpeedSquared(0) === 1
    const orderOneExcluded =
      Math.abs(Math.sqrt(spin2SpeedSquared(0.1)) - 1) > 1e13 * GW_BOUND

    const ok =
      survivorsSmall &&
      excludedLarge &&
      limitExact &&
      orderOneExcluded &&
      excluded > 0 &&
      survived > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'over forty-two signed decades of alpha_1 the spin-2 speed formula of the Einstein-aether correspondence excludes every value above 6e-15 in magnitude and admits every value below 2e-15, alpha_1 = 0 gives speed exactly one, and alpha_1 = 0.1 misses the bound by more than thirteen orders of magnitude, so the withdrawn action is either fifteen orders of magnitude from doing flow-sector work or outside its own nearest refereed relative',
      metrics: {
        decadesTried: decades.length,
        excluded,
        survived,
        speedAtTenth: Number(
          Math.sqrt(spin2SpeedSquared(0.1)).toFixed(12),
        ),
      },
      // CONTROL: the exact zero-coupling limit
      control: {
        speedSquaredAtZero: spin2SpeedSquared(0),
        boundaryMisassignments: boundaryDecade,
      },
      notes:
        'Roadmap base-model 0009, the second open item of the Roy Herbert corpus changelog (2026-09-01): no Chronoflux paper cites the Einstein-aether literature, so its implicit claim to be unconstrained was untested. The formula s_2^2 = 1/(1 - c_13) is Jacobson and Mattingly standard; the correspondence c_1 = alpha_1 with the other c_i zero is the reading the corpus changelog records, and if the correspondence is wrong the burden moves to stating the actual kinetic terms, which the three-page action does not fix uniquely. Binary-pulsar and Solar System bounds constrain further combinations at the 1e-5 level and are not evaluated here. The rebuilt 2026 current-based action has no alpha_1 and is untouched by this bound.',
    })
  },
})
