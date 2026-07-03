// Conformance for code/coarse/validator: the commuting-square test of an effective rule. The error is
// the fraction of sampled micro states where evolve-then-coarse disagrees with coarse-then-evolve, so
// a genuinely commuting macro rule scores 0 and a wrong one near 1. mostProbableNext reads the argmax
// of each transition row. All re-derived by hand.

import { suite, check, close, exactArray } from '@/test/code/harness'
import {
  commutingSquareError,
  mostProbableNext,
} from '@/code/coarse/validator'

const TOL = 1e-12

suite('coarse/validator: commuting square', [
  // micro step +1 mod 4, coarse map = parity, macro step = flip parity. Then both paths give (s+1)%2,
  // so the square commutes and the error is 0.
  check('a commuting macro rule has error 0', () => {
    const err = commutingSquareError<number>({
      states: [0, 1, 2, 3],
      microStep: s => (s + 1) % 4,
      coarseMap: s => s % 2,
      macroStep: m => (m + 1) % 2,
    })

    close(err, 0, TOL)
  }),
  // Same micro step and coarse map but an IDENTITY macro step: coarse-then-evolve gives s%2 while
  // evolve-then-coarse gives (s+1)%2, which disagree for every state -> error 1.
  check('a non-commuting macro rule has error 1', () => {
    const err = commutingSquareError<number>({
      states: [0, 1, 2, 3],
      microStep: s => (s + 1) % 4,
      coarseMap: s => s % 2,
      macroStep: m => m,
    })

    close(err, 1, TOL)
  }),
  // Half right: a macro step correct on even macro states only -> half the samples disagree.
  check('a partially correct rule has a fractional error', () => {
    const err = commutingSquareError<number>({
      states: [0, 1, 2, 3],
      microStep: s => (s + 1) % 4,
      coarseMap: s => s % 2,
      // correct flip only when the macro state is 0, identity otherwise.
      macroStep: m => (m === 0 ? 1 : m),
    })

    // states 0,2 map to macro 0 -> correct; states 1,3 map to macro 1 -> macroStep identity gives 1,
    // but evolve-then-coarse gives 0, disagree. So 2 of 4 disagree -> 0.5.
    close(err, 0.5, TOL)
  }),
  check('no states reports the worst-case error 1', () => {
    close(
      commutingSquareError<number>({
        states: [],
        microStep: s => s,
        coarseMap: s => s,
        macroStep: m => m,
      }),
      1,
      TOL,
    )
  }),
])

suite('coarse/validator: most-probable next', [
  check('the argmax of each row is the deterministic skeleton', () => {
    exactArray(
      mostProbableNext([
        [0.1, 0.9],
        [0.7, 0.3],
      ]),
      [1, 0],
    )
  }),
  // ties keep the first index (strict >).
  check('a tie keeps the first index', () => {
    exactArray(mostProbableNext([[0.5, 0.5]]), [0])
  }),
])
