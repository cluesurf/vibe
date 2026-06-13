// E5 (multi-level-selves plan), a genuine individuality transition, and the honest discipline around it. A
// cluster with a blanket is not yet a higher individual. A real transition needs heritable variation,
// group-level selection, conflict suppression, and a single-cell bottleneck. These are NOT in the base rule.
// The base self dynamics has no reproduction, no heredity, and no selection operator at all, so a transition
// cannot emerge from it, that is the honest negative. What this experiment shows is that the transition
// SIGNATURES, the shift of fitness variance from within-group to between-group and the collapse of
// independent within-group variation, appear only when group selection and a single-cell bottleneck are
// imposed as explicit, declared effective ingredients, and not otherwise.
//
// Depth L1, a model demonstration of the transition measures with a declared-ingredient control, plus the
// structural honest negative about the base rule. It is not a claim that the base substrate produces a
// transition.

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { fitnessVariancePartition } from '@/code/coarse/individuality'
import { makeRng } from '@/test/experiment/selves/coarse-self-trajectory'

// Population WITHOUT group selection or a bottleneck. Members vary independently, groups are incidental
// labels, so the variance is within groups and each member is an independent replicator.
function withoutTransition(input: { groups: number; members: number; seed: number }): number[][] {
  const { groups, members, seed } = input
  const rng = makeRng(seed)
  return Array.from({ length: groups }, () => Array.from({ length: members }, () => rng.next()))
}

// Population WITH group selection and a single-cell bottleneck (declared effective ingredients). Each group
// is founded by one cell, so members share the founder trait up to a small mutation (clonal, conflict
// suppressed), and group founders differ widely (group-level selection has spread the group means). The
// variance moves between groups and independent within-group variation collapses.
function withTransition(input: { groups: number; members: number; seed: number }): number[][] {
  const { groups, members, seed } = input
  const rng = makeRng(seed)
  return Array.from({ length: groups }, () => {
    const founder = rng.next() // group selection has spread founders across the range.
    return Array.from({ length: members }, () => founder + (rng.next() - 0.5) * 0.02) // bottleneck, near clonal.
  })
}

export default defineExperiment({
  id: 'selves/coarse-individuality-transition',
  title: 'the transition signatures appear only with imposed group selection and a single-cell bottleneck, not from the base rule',
  category: 'selves',
  substrates: ['effective-model'],
  depth: 'L1',
  paper: false,
  run() {
    const groups = 24
    const members = 24
    const off = fitnessVariancePartition(withoutTransition({ groups, members, seed: 11 }))
    const on = fitnessVariancePartition(withTransition({ groups, members, seed: 11 }))

    // the transition signature, the variance ratio crosses from within-dominated (below one) to
    // between-dominated (above one), and the within-group (independent) variation collapses.
    const partitionFlips = off.ratio < 0.7 && on.ratio > 1.5
    const independentReplicationLost = on.within < off.within * 0.5
    const ok = partitionFlips && independentReplicationLost
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'fitness variance is within-group with no transition, and shifts to between-group with collapsed within-group variation only when group selection and a single-cell bottleneck are imposed as declared effective ingredients, which the base rule does not contain',
      metrics: {
        ratioWithout: off.ratio,
        ratioWith: on.ratio,
        betweenWith: on.between,
        withinWith: on.within,
        betweenWithout: off.between,
        withinWithout: off.within,
      },
      control: { ratioWithout: off.ratio },
      notes:
        'honest negative about the base, the base self rule has no reproduction, heredity, or selection, so no transition emerges. Group selection and the bottleneck are effective-level posits, declared, not base elements. This demonstrates the measures detect a transition only when its ingredients are present',
    })
  },
})
