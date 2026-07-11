// Conformance for code/algebra/linear/bethe-resolvent: the Bethe-lattice cavity
// resolvent and its boundary exponent. The cavity decay solves b mu^2 - E mu + 1 = 0;
// at the massless point E = z the root is mu = 1/b exactly (derived: E^2 - 4b =
// (z-2)^2, so mu = (z - (z-2))/(2b) = 1/(z-1)). The boundary exponent there is the
// universal alpha = 2. At the band edge E = 2 sqrt(b) the discriminant vanishes and
// mu = 1/sqrt(b). The finite-tree solver is checked against the exact finite-size
// decay phi_k = A b^-k + B with leaf boundary B = -A b^-(d+1), which we derive
// independently and which limits to mu = 1/b as depth grows.

import { suite, check, close } from '@/test/code/harness'
import {
  betheCavityDecay,
  betheBoundaryExponent,
  finiteTreeResolventRatio,
} from '@/code/algebra/linear/bethe-resolvent'

suite('algebra/linear/bethe-resolvent: cavity decay closed forms', [
  check('massless point E = z gives mu = 1/b exactly', () => {
    // z = 3, b = 2 -> mu = 1/2
    close(
      betheCavityDecay({ coordination: 3, energy: 3 }),
      1 / 2,
      1e-12,
      'z=3',
    )

    // z = 4, b = 3 -> mu = 1/3
    close(
      betheCavityDecay({ coordination: 4, energy: 4 }),
      1 / 3,
      1e-12,
      'z=4',
    )

    // z = 5, b = 4 -> mu = 1/4
    close(
      betheCavityDecay({ coordination: 5, energy: 5 }),
      1 / 4,
      1e-12,
      'z=5',
    )
  }),
  check('the decay solves b mu^2 - E mu + 1 = 0', () => {
    const z = 4
    const energy = 5 // above the band edge 2 sqrt(3) ~ 3.46
    const b = z - 1
    const mu = betheCavityDecay({ coordination: z, energy })

    close(
      b * mu * mu - energy * mu + 1,
      0,
      1e-12,
      'satisfies the cavity quadratic',
    )
  }),
  check('band edge E = 2 sqrt(b) gives mu = 1/sqrt(b)', () => {
    const b = 2
    const z = b + 1
    const mu = betheCavityDecay({
      coordination: z,
      energy: 2 * Math.sqrt(b),
    })

    // At the band edge the discriminant vanishes, so the closed form takes the
    // square root of a quantity that is zero up to rounding: ~1e-8 precision at this
    // branch point is expected, not a defect. Away from the edge the value is exact.
    close(mu, 1 / Math.sqrt(b), 1e-6, 'band-edge decay')
  }),
])

suite('algebra/linear/bethe-resolvent: boundary exponent', [
  check('massless point gives the universal alpha = 2', () => {
    close(
      betheBoundaryExponent({ coordination: 3, energy: 3 }),
      2,
      1e-12,
      'z=3',
    )

    close(
      betheBoundaryExponent({ coordination: 4, energy: 4 }),
      2,
      1e-12,
      'z=4',
    )

    close(
      betheBoundaryExponent({ coordination: 5, energy: 5 }),
      2,
      1e-12,
      'z=5',
    )
  }),
  check('alpha = 2 ln(1/mu) / ln(b) off the massless point', () => {
    const z = 4
    const energy = 5
    const b = z - 1
    const mu = betheCavityDecay({ coordination: z, energy })
    const expected = (2 * Math.log(1 / mu)) / Math.log(b)

    close(
      betheBoundaryExponent({ coordination: z, energy }),
      expected,
      1e-12,
      'formula',
    )
  }),
])

suite('algebra/linear/bethe-resolvent: finite-tree validation', [
  check(
    'finite-tree ratio matches the exact finite-size decay (z=3)',
    () => {
      const z = 3
      const depth = 10
      const b = z - 1
      // exact: phi_k = A b^-k + B with B = -A b^-(d+1); ratio phi_3/phi_2.
      const tail = Math.pow(b, -(depth + 1))
      const expected =
        (Math.pow(b, -3) - tail) / (Math.pow(b, -2) - tail)

      const measured = finiteTreeResolventRatio({
        coordination: z,
        depth,
      })

      close(measured, expected, 2e-3, 'finite-tree decay ratio')
    },
  ),
  check(
    'the finite-tree ratio approaches the cavity mu = 1/b as depth grows',
    () => {
      const z = 3
      const mu = betheCavityDecay({ coordination: z, energy: z }) // 1/2
      const measured = finiteTreeResolventRatio({
        coordination: z,
        depth: 12,
      })

      close(measured, mu, 1e-2, 'approaches 1/b')
    },
  ),
])
