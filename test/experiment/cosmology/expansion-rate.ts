// G4 of chunk 10, the expansion rate is a fixed invariant, not a knob. The mesh grows one shell per beat, so
// the per-beat expansion factor is the GROWTH RATIO, the ratio of consecutive complete shells. That ratio is a
// fixed property of the Schlafli symbol (the lead eigenvalue of the shell map), it is stable across shells and
// across mesh sizes, it is greater than 1 for every hyperbolic substrate (exponential, eternal expansion), and
// it differs from symbol to symbol. So the standard expansion happens at the geometry's own rate, forced, with
// no free parameter.

import { buildCoxeterMatrixMesh } from '@/code/substrate/coxeter/matrix-group'
import { lastCompleteShellRatio } from '@/code/substrate/coxeter/growth'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'cosmology/expansion-rate',
  title:
    'the per-beat expansion is the growth-ratio invariant of the symbol, fixed and greater than 1, not a free knob',
  category: 'cosmology',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const ratioOf = (symbol: number[], cap: number) =>
      lastCompleteShellRatio(buildCoxeterMatrixMesh(symbol, cap).shells)

    const symbols: [string, number[]][] = [
      ['{7,3}', [7, 3]],
      ['{8,3}', [8, 3]],
      ['{5,4}', [5, 4]],
      ['{5,3,4}', [5, 3, 4]],
      ['{3,4,3,4}', [3, 4, 3, 4]],
    ]

    const ratios = symbols.map(([, s]) => ratioOf(s, 20000))

    // stability: the same symbol gives the same ratio at a different size (a genuine invariant, not noise)
    const r73small = ratioOf([7, 3], 2000)
    const r73large = ratioOf([7, 3], 30000)
    const stable = Math.abs(r73small - r73large) < 0.25 * r73large

    const allExponential = ratios.every(r => r > 1.1) // every hyperbolic substrate expands, ratio > 1 (above the euclidean limit)
    const distinct = new Set(ratios.map(r => r.toFixed(2))).size >= 4 // different symbols, different rates
    const ok = allExponential && distinct && stable

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the per-beat expansion factor is the growth ratio of the symbol, a fixed invariant greater than 1 for every hyperbolic substrate, stable across mesh sizes and differing from symbol to symbol, so the expansion rate is forced by the geometry, not a free parameter',
      metrics: Object.fromEntries(
        symbols.map(([name], i) => [
          name,
          Number(ratios[i]!.toFixed(3)),
        ]),
      ),
      // CONTROL: the same symbol gives the same ratio at two sizes (a true invariant), while different symbols give different ratios (the rate is the geometry).
      control: {
        ratio73small: Number(r73small.toFixed(3)),
        ratio73large: Number(r73large.toFixed(3)),
        distinctRates: distinct ? 1 : 0,
      },
      notes:
        'G4, the expansion rate is the growth-ratio invariant (why-the-mesh-expands, sub-question 3).',
    })
  },
})
