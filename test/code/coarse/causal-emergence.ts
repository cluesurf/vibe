// Conformance for code/coarse/causal-emergence: Hoel effective information and TPM coarse-graining.
// EI is the mean KL of each row from the mean row, in bits. A deterministic (identity) 2-state TPM
// carries 1 bit; a fully degenerate TPM (all rows equal) carries 0. coarseGrainTpm averages member
// rows and sums member columns, so a row-stochastic input stays row-stochastic. emergenceGain is
// checked only for finiteness and determinism (its inequality is a single stochastic realization).

import { suite, check, close, ok, allFinite } from '@/test/code/harness'
import {
  effectiveInformation,
  coarseGrainTpm,
  emergenceGain,
} from '@/code/coarse/causal-emergence'
import { makeRng } from '@/code/tool/rng'

const TOL = 1e-12

// row-sum of a matrix.
function rowSums(m: number[][]): number[] {
  return m.map(row => row.reduce((a, b) => a + b, 0))
}

suite('coarse/causal-emergence: effective information', [
  // The 2-state identity TPM: each row a point mass, mean row uniform [0.5,0.5]. Each row contributes
  // (1 * log2(1/0.5))/2 = 0.5, total 1 bit. The maximally causal 2-state dynamics.
  check('a deterministic 2-state TPM carries exactly 1 bit', () => {
    close(
      effectiveInformation([
        [1, 0],
        [0, 1],
      ]),
      1,
      TOL,
    )
  }),
  // All rows equal: every row is the mean row, KL 0, so EI 0. No causal power.
  check('a fully degenerate TPM carries 0 bits', () => {
    close(
      effectiveInformation([
        [0.5, 0.5],
        [0.5, 0.5],
      ]),
      0,
      TOL,
    )

    close(
      effectiveInformation([
        [0.3, 0.7],
        [0.3, 0.7],
      ]),
      0,
      TOL,
    )
  }),
  // A deterministic 3-state permutation TPM: each row a point mass, mean uniform [1/3,...]. Each row
  // gives log2(3)/3, total log2(3) bits.
  check(
    'a deterministic 3-state permutation carries log2(3) bits',
    () => {
      close(
        effectiveInformation([
          [0, 1, 0],
          [0, 0, 1],
          [1, 0, 0],
        ]),
        Math.log2(3),
        1e-12,
      )
    },
  ),
  check('the empty matrix carries 0 bits', () => {
    close(effectiveInformation([]), 0, TOL)
  }),
])

suite('coarse/causal-emergence: TPM coarse-graining', [
  // Merge both states of the identity TPM into one macro state: the macro row averages the two rows
  // (0.5,0.5) and sums into the single macro column -> [[1]]. Row-stochastic, and EI collapses to 0.
  check('merging all states yields the 1x1 stochastic matrix', () => {
    const macro = coarseGrainTpm({
      tpm: [
        [1, 0],
        [0, 1],
      ],
      groups: [0, 0],
    })

    close(macro[0]![0]!, 1, TOL)
    close(effectiveInformation(macro), 0, TOL)
  }),
  // Coarse-graining a row-stochastic matrix preserves row-stochasticity (the macro row averages
  // member rows, each of which sums to 1).
  check('coarse-graining preserves row-stochasticity', () => {
    const tpm = [
      [0.5, 0.5, 0, 0],
      [0.5, 0.5, 0, 0],
      [0, 0, 0.2, 0.8],
      [0, 0, 0.9, 0.1],
    ]

    const macro = coarseGrainTpm({ tpm, groups: [0, 0, 1, 1] })

    for (const s of rowSums(macro))
      close(s, 1, TOL, 'each macro row sums to 1')
  }),
])

suite('coarse/causal-emergence: structured vs random gain', [
  // emergenceGain draws an RNG for the random control shuffle. Test it is finite and reproducible.
  check('emergence gain is finite and reproducible', () => {
    const series = Array.from({ length: 200 }, (_, i) =>
      Math.sin(i / 7),
    )

    const run = (): {
      eiMicro: number
      eiSpatial: number
      eiRandom: number
    } =>
      emergenceGain({
        series,
        fine: 8,
        macroCount: 4,
        rng: makeRng({ seed: 5 }),
      })

    const a = run()
    const b = run()

    allFinite([a.eiMicro, a.eiSpatial, a.eiRandom])
    close(a.eiMicro, b.eiMicro, 0, 'reproducible micro EI')
    close(a.eiSpatial, b.eiSpatial, 0, 'reproducible spatial EI')
    close(a.eiRandom, b.eiRandom, 0, 'reproducible random EI')
    ok(a.eiMicro >= -1e-12, 'EI is non-negative')
  }),
])
