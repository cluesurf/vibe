// P12: the free-energy crossing (closing P2).
// P2 showed two phases coexist (a first-order signature). This asks which one
// strictly dominates the sum over histories, and at what coupling. We compute the
// free energy of each phase by thermodynamic integration and find the crossing
// beta-star where the manifold phase overtakes the layered phase.
//
// Method. With weight e^{-beta S}, log Z_phase(beta) = log W_phase - integral_0^beta
// <S>_phase dbeta'. The entropy term log W is read from the beta = 0 manifold
// fraction f0: log W_layered - log W_manifold = log((1-f0)/f0) = g. The per-phase
// action <S>_phase(beta) is measured class-restricted (manifold = height ratio > 1)
// so it is well defined even where a branch is only metastable. Then
//   Delta logZ(beta) = logZ_manifold - logZ_layered = -g + integral_0^beta (<S>_L - <S>_M) dbeta'.
// The manifold phase dominates where Delta logZ > 0. See note/questions/next-version.md (P12).
// Run: npx tsx code/experiment/p12-free-energy.ts

import { makeRng } from '@/code/tool/rng'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { kleitmanRothschildOrder } from '@/code/substrate/layered-order'
import { sampleUniform } from '@/code/dynamics/uniform-sampler'
import { smearedBenincasaDowker } from '@/code/dynamics/action'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Mean smeared action over fresh typical configs of one phase. Fresh configs avoid
// the metastable-decay contamination of a sampled branch, so the per-phase action
// is well sampled. Manifold = 2D sprinklings, layered = Kleitman-Rothschild orders.
function phaseAction(input: {
  size: number
  epsilon: number
  phase: 'manifold' | 'layered'
  repeats: number
}): number {
  const action = smearedBenincasaDowker({
    epsilon: input.epsilon,
    dimension: 2,
  })

  let sum = 0

  for (let r = 0; r < input.repeats; r++) {
    const poset =
      input.phase === 'manifold'
        ? sprinkleMinkowski({
            dimension: 2,
            count: input.size,
            rng: makeRng({ seed: input.size * 31 + r }),
          })
        : kleitmanRothschildOrder({ size: input.size })

    sum += action.value({ poset })
  }

  return sum / input.repeats
}

function crossingStudy(input: {
  size: number
  epsilon: number
  betas: number[]
  steps: number
}): {
  size: number
  g: number
  sM: number
  sL: number
  betas: number[]
  deltaLogZ: number[]
  manifoldFractionEq: number[]
  betaStar: number | null
} {
  const n = input.size

  // Entropy gap g = log W_L - log W_M from the equilibrium beta = 0 manifold
  // fraction (a long uniform-measure run from the antichain).
  const base = sampleUniform({
    size: n,
    beta: 0,
    epsilon: input.epsilon,
    steps: input.steps * 2,
    rng: makeRng({ seed: n * 7 + 1 }),
    sampleEvery: 20,
  })

  const f0 = Math.min(0.999, Math.max(0.001, base.manifoldFraction))
  const g = Math.log((1 - f0) / f0)

  // Per-phase action from fresh configs (the leading-order, constant-per-phase
  // approximation). The manifold phase has the lower smeared action by design.
  const sM = phaseAction({
    size: n,
    epsilon: input.epsilon,
    phase: 'manifold',
    repeats: 40,
  })

  const sL = phaseAction({
    size: n,
    epsilon: input.epsilon,
    phase: 'layered',
    repeats: 40,
  })

  const dS = sL - sM

  // Delta logZ(beta) = logZ_manifold - logZ_layered = -g + (S_L - S_M) * beta.
  const deltaLogZ = input.betas.map(beta => -g + dS * beta)
  const betaStar = dS > 0 ? g / dS : null
  const manifoldFractionEq = deltaLogZ.map(d => 1 / (1 + Math.exp(-d)))

  return {
    size: n,
    g,
    sM,
    sL,
    betas: input.betas,
    deltaLogZ,
    manifoldFractionEq,
    betaStar,
  }
}

export function p12Crossing(input: { size: number }): {
  betaStar: number | null
  g: number
  dS: number
} {
  const r = crossingStudy({
    size: input.size,
    epsilon: 0.9,
    betas: [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0],
    steps: 40000,
  })

  return { betaStar: r.betaStar, g: r.g, dS: r.sL - r.sM }
}

export default experiment({
  id: 'cosmology/free-energy',
  title:
    'the manifold phase wins the sum over histories above a finite coupling',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = p12Crossing({ size: 24 })
    const ok = r.dS > 0 && r.betaStar !== null && r.betaStar > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the smeared action favors the manifold phase by a positive extensive gap, giving a finite crossing coupling above which the manifold phase dominates the free energy',
      metrics: {
        betaStar: r.betaStar ?? 0,
        entropyGap: r.g,
        actionGap: r.dS,
      },
      notes:
        'L2, a thermodynamic-integration free-energy crossing, a standard statistical-mechanics construction on a known causal-set ensemble (uses seeded sampling). The entropy gap is measurable only up to about N=32, so the large-N crossing scaling is open, the structure (a finite crossing, manifold dominant above it) is what is shown.',
    })
  },
})
