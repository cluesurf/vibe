// PUSH on the relativity rung. A relativistic continuum face needs a conserved momentum current as well as a
// conserved charge, and a sharp causal speed limit. This shows both on the committed knit: the momentum current
// (the vector sum of tone times direction) is conserved EXACTLY over many beats, and a localized disturbance has
// a causal radius that grows by exactly one cell per beat (a sharp speed limit of one). CONTROL: the erasing
// (lossy) rule does NOT conserve the momentum current, so its momentum drifts, the discriminator that the
// conservation is a property of the reversible knit and not of streaming alone. This does not close full Lorentz
// invariance (the open wall), it establishes the second conserved current and the exact causal speed the
// relativity rung needs.

import { d4Mesh, shellDistances } from '@/code/tool/mesh'
import { headOnRotate } from '@/code/rule/collision'
import { erasingCollision } from '@/code/control/lossy-collision'
import { makeWill, cloneWill, fillWillPattern } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { totalMomentum, momentumDrift } from '@/code/measure/momentum'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'relativity/momentum-current-and-cone',
  code: 'E-RLT-0039',
  title:
    'the knit conserves a momentum current exactly and carries a sharp causal speed of one cell per beat, the second conserved current relativity needs, where a lossy rule loses the momentum',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 16
    const mesh = d4Mesh({ side })
    const degree = mesh.degree
    const opposite: number[] = []

    for (let d = 0; d < degree; d++) opposite.push(mesh.opposite(d))

    const knit = headOnRotate({ opposite })
    const beats = 8

    // momentum conservation on a deterministic structured fill.
    const filled = makeWill(mesh)

    fillWillPattern(filled)

    const p0 = totalMomentum(filled)

    let real = cloneWill(filled)
    let realDrift = 0

    for (let b = 0; b < beats; b++) {
      real = beat(real, knit)
      realDrift = Math.max(
        realDrift,
        momentumDrift(totalMomentum(real), p0),
      )
    }

    // CONTROL: the lossy rule drifts the momentum.
    let lossy = cloneWill(filled)
    let lossyDrift = 0

    for (let b = 0; b < beats; b++) {
      lossy = beat(lossy, erasingCollision)
      lossyDrift = Math.max(
        lossyDrift,
        momentumDrift(totalMomentum(lossy), p0),
      )
    }

    // causal cone: a centered perturbation in vacuum, the radius must grow by one per beat (speed one).
    const centre = mesh.cellCount >> 1
    const dist = shellDistances(mesh, centre)
    const pert = makeWill(mesh)

    for (let d = 0; d < degree; d++) pert.data[centre * degree + d] = 1

    let ps = pert

    const radii: number[] = []

    for (let b = 1; b <= 6; b++) {
      ps = beat(ps, knit)

      let outer = 0

      for (let cell = 0; cell < mesh.cellCount; cell++) {
        const base = cell * degree

        let nonzero = false

        for (let d = 0; d < degree; d++) {
          if (ps.data[base + d] !== 0) {
            nonzero = true
            break
          }
        }

        if (nonzero && (dist[cell] ?? 0) > outer)
          outer = dist[cell] ?? 0
      }

      radii.push(outer)
    }

    // the radius equals the beat number exactly: a sharp speed of one.
    const coneSpeedOne = radii.every((r, k) => r === k + 1)

    const momentumConserved = realDrift === 0
    const lossyBreaks = lossyDrift > 0

    const ok = momentumConserved && coneSpeedOne && lossyBreaks

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the committed knit conserves the momentum current exactly over many beats (zero drift) and a localized disturbance has a causal radius that grows by exactly one cell per beat, establishing the conserved momentum current and the sharp causal speed of one that a relativistic continuum face requires, while the lossy rule fails to conserve the momentum, so the conservation is a property of the reversible knit and not of streaming alone',
      metrics: {
        beats,
        momentumDrift: realDrift,
        momentumConserved: momentumConserved ? 1 : 0,
        coneRadiusFinal: radii[radii.length - 1]!,
        coneSpeedOne: coneSpeedOne ? 1 : 0,
      },
      control: {
        lossyMomentumDrift: lossyDrift,
        lossyBreaks: lossyBreaks ? 1 : 0,
      },
      notes:
        'L2. The momentum current is the vector sum of tone times the D4 root direction. It is conserved exactly by collide-then-stream (collide conserves momentum per cell, stream permutes sites). The causal radius grows by one cell per beat, a sharp speed limit of one. The lossy control erases a site per cell, breaking momentum conservation. This establishes the second conserved current and the exact causal speed, but does NOT close full Lorentz invariance on the fixed lattice, which is the open wall (the E-RLT arena, E-DEC-01). Honest open part: a sharp dispersionless massless mode in a filled background is not shown by the bare rule.',
    })
  },
})
