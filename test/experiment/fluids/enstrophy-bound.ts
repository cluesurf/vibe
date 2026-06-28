// PUSH on the Navier-Stokes rung. Herbert's continuity-closure reading of Navier-Stokes says the fluid appears
// to blow up only because the reduced description forgets a bound the deeper conserved flow keeps. On the lattice
// the bound is exact: an enstrophy-like quadratic (the sum of tone squared, the count of nonzero sites) is
// conserved EXACTLY by the reversible knit, because the rule only permutes the multiset of tone values. CONTROL:
// the erasing (lossy) rule destroys nonzero sites, so its enstrophy collapses, the discriminator that the bound
// is conservation and not a generic feature. Honest scope: this shows the fine-grained bound holds exactly. It
// does NOT yet exhibit a coarse-grained velocity field whose naive gradient runs away while the fine bound holds,
// which needs a constructed interacting flow, so the full "truncation hides a bound" demonstration stays a target.

import { d4Mesh } from '@/code/tool/mesh'
import { headOnRotate } from '@/code/rule/collision'
import { erasingCollision } from '@/code/control/lossy-collision'
import { makeWill, cloneWill, fillWillPattern } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { enstrophy } from '@/code/measure/enstrophy'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'fluids/enstrophy-bound',
  code: 'E-FLD-0009',
  title:
    'an enstrophy-like quadratic is conserved exactly by the reversible knit (the lattice bound Navier-Stokes forgets), where a lossy rule lets it collapse',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 12
    const mesh = d4Mesh({ side })
    const beats = 12

    const filled = makeWill(mesh)
    fillWillPattern(filled)

    const e0 = enstrophy(filled)

    // REAL: the reversible knit conserves the quadratic exactly.
    let real = cloneWill(filled)
    let realMin = e0
    let realMax = e0

    for (let b = 0; b < beats; b++) {
      real = beat(real, headOnRotate({ opposite: opposites(mesh) }))

      const e = enstrophy(real)
      realMin = Math.min(realMin, e)
      realMax = Math.max(realMax, e)
    }

    const realConserved = realMin === e0 && realMax === e0

    // CONTROL: the lossy rule destroys nonzero sites, the quadratic collapses.
    let lossy = cloneWill(filled)
    let lossyMin = e0

    for (let b = 0; b < beats; b++) {
      lossy = beat(lossy, erasingCollision)
      lossyMin = Math.min(lossyMin, enstrophy(lossy))
    }

    const lossyCollapses = lossyMin < e0

    const ok = realConserved && lossyCollapses

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'an enstrophy-like quadratic (the sum of tone squared) is conserved exactly by the reversible knit over many beats, because the rule only permutes the multiset of tone values, so the lattice keeps a bound that a reduced description would forget, while a lossy rule lets the quadratic collapse, confirming the bound is conservation and not a generic feature',
      metrics: {
        beats,
        enstrophyStart: e0,
        enstrophyMin: realMin,
        enstrophyMax: realMax,
        realConserved: realConserved ? 1 : 0,
      },
      control: {
        lossyEnstrophyMin: lossyMin,
        lossyCollapses: lossyCollapses ? 1 : 0,
      },
      notes:
        'L2. The quadratic is the count of nonzero sites, conserved exactly because collide rearranges tones within a cell and stream permutes sites, neither creating nor destroying a value. The lossy control erases a site per cell, collapsing it. Honest scope: this is the fine-grained bound only. The full Navier-Stokes demonstration, a coarse velocity field whose naive gradient runs away while this fine bound holds, needs a constructed interacting flow and is not shown here, so the Navier-Stokes rung stays a target for the coarse half.',
    })
  },
})

function opposites(mesh: {
  degree: number
  opposite(d: number): number
}): number[] {
  const out: number[] = []

  for (let d = 0; d < mesh.degree; d++) {
    out.push(mesh.opposite(d))
  }

  return out
}
