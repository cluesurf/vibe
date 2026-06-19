// P172: TRUE binding, a bound composite with internal structure (completes rung 2). (P168, the-coarse-graining-chain.md, open-question 6.)
//
// P168 rung 2 showed two particles' CENTER OF MASS moves freely (momentum conserved through interaction),
// the composite's TRANSLATIONAL law. The missing half was a true BOUND state, an internal structure that
// holds the pair together (a real atom, not just a free center of mass). The simple contact phase did not
// bind. Here we solve the RELATIVE-coordinate problem directly, two particles with an attractive
// interaction, and find the bound spectrum. We check, (1) a TRUE bound state exists, localized (not
// spread across the box) with energy BELOW the free band (positive binding energy), where no well gives a
// delocalized band state, and (2) a deeper well has MULTIPLE discrete bound levels, the atom's internal
// ENERGY LEVELS, a NEW discrete variable (a quantum number) that seeds the next coarse-graining rung.
// With P168's free center of mass, this completes particle -> composite, a bound atom that moves freely.
// Run: npx tsx code/experiment/p172-bound-composite.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lowestEigenpairs as lowestEigenpairsOf } from '@/code/algebra/linear/power-iteration'
import { openChainPotentialApply } from '@/code/operator/tight-binding'

// lowest `k` eigenpairs of the relative-coordinate Hamiltonian, by shifted power iteration with
// deflation. The shift cI must bound the spectrum from above so cI - H is positive.
function lowestEigenpairs(
  V: Float64Array,
  t: number,
  k: number,
  seedBase: number,
): { energy: number; state: Float64Array }[] {
  const N = V.length

  let shift = 2 * t + 1

  for (let r = 0; r < N; r++) {
    shift = Math.max(shift, -V[r]! + 2 * t + 1)
  }

  return lowestEigenpairsOf({
    operator: {
      size: N,
      apply: ({ x }) =>
        openChainPotentialApply({ phi: x, potential: V, hopping: t }),
    },
    count: k,
    shift,
    seed: seedBase,
  })
}

function spread(state: Float64Array, center: number): number {
  // <|r - center|> under |phi|^2
  let s = 0

  for (let r = 0; r < state.length; r++) {
    s += Math.abs(r - center) * state[r]! * state[r]!
  }

  return s
}

export function boundComposite(input?: {
  N?: number
  halfWidth?: number
}): {
  N: number
  bandBottom: number
  groundEnergy: number
  bindingEnergy: number
  groundSpread: number
  freeSpread: number
  localized: boolean
  trueBoundState: boolean
  boundLevelsShallow: number
  boundLevelsDeep: number
  discreteInternalLevels: boolean
  solved: boolean
} {
  const N = input?.N ?? 161
  const a = input?.halfWidth ?? 3
  const center = Math.floor(N / 2)
  const t = 1
  const bandBottom = -2 * t

  const wellOf = (V0: number): Float64Array => {
    const V = new Float64Array(N)

    for (let r = 0; r < N; r++) {
      if (Math.abs(r - center) <= a) {
        V[r] = -V0
      }
    }

    return V
  }

  // a moderate well, the bound ground state
  const moderate = lowestEigenpairs(wellOf(1.0), t, 1, 1)[0]!
  const groundEnergy = moderate.energy
  const bindingEnergy = bandBottom - groundEnergy // > 0 if below the band (bound)
  const groundSpread = spread(moderate.state, center)
  const trueBoundState =
    groundEnergy < bandBottom - 1e-4 && groundSpread < N / 6

  // control, no well, the lowest state is a delocalized band state (spread ~ box)
  const free = lowestEigenpairs(wellOf(0), t, 1, 1)[0]!
  const freeSpread = spread(free.state, center)
  const localized = groundSpread < 0.3 * freeSpread

  // a SHALLOW vs DEEP well, count discrete bound levels (E < band bottom) = the atom's internal levels
  const countBound = (V0: number): number => {
    const eigs = lowestEigenpairs(wellOf(V0), t, 4, 2)

    return eigs.filter(e => e.energy < bandBottom - 1e-4).length
  }

  const boundLevelsShallow = countBound(0.6)
  const boundLevelsDeep = countBound(4.0)
  const discreteInternalLevels = boundLevelsDeep >= 2 // multiple discrete internal energy levels

  const solved = trueBoundState && localized && discreteInternalLevels

  return {
    N,
    bandBottom,
    groundEnergy,
    bindingEnergy,
    groundSpread,
    freeSpread,
    localized,
    trueBoundState,
    boundLevelsShallow,
    boundLevelsDeep,
    discreteInternalLevels,
    solved,
  }
}

export default experiment({
  id: 'quantum/bound-composite',
  title:
    'two attracting particles form a true bound state with discrete levels',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = boundComposite()
    const ok =
      r.solved &&
      r.trueBoundState &&
      r.localized &&
      r.discreteInternalLevels

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'two attracting particles form a localized bound state with positive binding energy and discrete internal levels, completing particle to composite',
      metrics: {
        bindingEnergy: r.bindingEnergy,
        groundSpread: r.groundSpread,
        freeSpread: r.freeSpread,
        boundLevelsDeep: r.boundLevelsDeep,
      },
    })
  },
})
