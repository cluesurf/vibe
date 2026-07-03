// Conformance for code/operator/radial-schrodinger: bound states of a central potential on a
// uniform radial grid. The Coulomb potential V(r) = -k/r is the analytic benchmark:
//   - Hydrogen Rydberg series E_n = -m k^2 / (2 n^2). With m = k = 1: E_1 = -1/2, E_2 = -1/8.
//   - The accidental SO(4) l-degeneracy: the energy depends only on the principal quantum
//     number n = n_r + l + 1, so the n=2 level reached as (l=0, first excited) and (l=1,
//     ground) coincide.
// These are genuine discretisation results, so the tolerance is the grid error (calibrated at
// 200 points, spacing 0.1), kept tight enough that a wrong operator could not pass.

import { suite, check, close } from '@/test/code/harness'
import { radialSchrodingerLevels } from '@/code/operator/radial-schrodinger'

const coulomb = (r: number): number => -1 / r
const grid = { mass: 1, spacing: 0.1, points: 200 }

suite('operator/radial-schrodinger: hydrogen spectrum', [
  check(
    'the l=0 ground and first excited states are -1/2 and -1/8',
    () => {
      const levels = radialSchrodingerLevels({
        l: 0,
        potential: coulomb,
        count: 3,
        ...grid,
      })

      close(levels[0] ?? NaN, -0.5, 3e-3, 'E_1 (1s)')
      close(levels[1] ?? NaN, -0.125, 3e-3, 'E_2 (2s)')
    },
  ),
  check('the l=1 ground state is the n=2 level -1/8', () => {
    const levels = radialSchrodingerLevels({
      l: 1,
      potential: coulomb,
      count: 2,
      ...grid,
    })

    close(levels[0] ?? NaN, -0.125, 3e-3, 'E_2 (2p)')
  }),
  check(
    'SO(4) accidental degeneracy: the n=2 level matches for l=0 and l=1',
    () => {
      const l0 = radialSchrodingerLevels({
        l: 0,
        potential: coulomb,
        count: 3,
        ...grid,
      })

      const l1 = radialSchrodingerLevels({
        l: 1,
        potential: coulomb,
        count: 2,
        ...grid,
      })

      // 2s is the first excited l=0 state, 2p is the l=1 ground state.
      close((l0[1] ?? NaN) - (l1[0] ?? NaN), 0, 2e-3, 'E(2s) = E(2p)')
    },
  ),
])
