// P7: quantum statistics from a classical base (the Bell hinge).
// A constructed superdeterministic model (in the spirit of 't Hooft): the hidden
// state lambda is engineered, per setting pair, to give the CHSH sign pattern.
// We sweep how strongly the settings are correlated with lambda. At independence
// the local model obeys |S| <= 2; as the correlation rises, S climbs past 2
// toward the algebraic maximum 4, the quantitative price of denying statistical
// independence. The outcomes deliberately depend on lambda, not the angle: that
// IS the superdeterministic conspiracy, made measurable.
// Run: npx tsx code/experiment/p7-bell.ts

import { chsh, Lambda } from '@/code/measure/bell'
import { runScan, ScanSpec } from '@/test/scaffold/runner'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'quantum/bell',
  code: 'E-QTM-0002',
  title:
    'an engineered superdeterministic model climbs CHSH past 2 as setting-state correlation rises',
  category: 'quantum',
  substrates: 'any',
  depth: 'L0',
  paper: false,
  run() {
    const angles = {
      a: 0,
      aPrime: Math.PI / 2,
      b: Math.PI / 4,
      bPrime: -Math.PI / 4,
    }

    const spec: ScanSpec<number> = {
      form: 'scan',
      name: 'bell',
      parameters: [0, 1],
      repeats: 3,
      run: ({ parameter, rng }) => {
        const r = chsh({
          drawHidden: ({ rng: r2 }): Lambda => r2.next() * Math.PI,
          settingCorrelation: parameter,
          outcomeA: () => 1,
          outcomeB: ({ lambda }) =>
            lambda >= Math.PI / 4 && lambda < Math.PI / 2 ? -1 : 1,
          angles,
          trials: 40000,
          rng,
        })

        return { s: r.s }
      },
    }

    const result = runScan({ spec, baseSeed: 5 })
    const independent = result.points.find(p => p.parameterIndex === 0)
    const correlated = result.points.find(p => p.parameterIndex === 1)
    const sIndependent = independent?.mean.s ?? 0
    const sCorrelated = correlated?.mean.s ?? 0
    const ok =
      sIndependent <= 2.1 &&
      sCorrelated > 2 &&
      sCorrelated > sIndependent

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a constructed superdeterministic model obeys the CHSH bound when settings are independent of the hidden state and climbs above it as the setting-state correlation rises',
      metrics: {
        sIndependent,
        sCorrelated,
      },
      control: {
        sIndependent,
      },
      notes:
        'L0, put in by hand. The outcome map is engineered per hidden-state region to give the CHSH sign pattern, so the violation at full correlation is constructed, not emergent. The independence point (correlation 0, S within the bound) is the control. It uses random hidden-state draws over 40000 trials, so the reported S is a Monte Carlo estimate, a statistical claim about the ensemble. This quantifies the price of denying statistical independence, it is not a derivation of quantum nonlocality from the base.',
    })
  },
})
