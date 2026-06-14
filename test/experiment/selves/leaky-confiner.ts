// The leaky-confiner attempt (one-tone-photon-as-phonon), and the honest negative it gives. The single-tone
// picture wants ONE rule where the body's core confines but its disturbances radiate away as neutral ripples
// (phonons), so the body can settle, all in one tone field. The natural candidate, CONFINE charged line-states
// (reflect a lone charge so the body is held) but leave CHARGE-NEUTRAL states alone so they stream (the phonon),
// with NO create move (a clean empty vacuum). It is reversible and charge-conserving.
//
// The result, it CONFINES but it does NOT radiate. A perturbation's effect fills the body and then STALLS at the
// body's edge, the perturbation cone equals the body size and does not grow with time, it never reaches the
// boundary (the bath). The reason, the confinement is reflection of lone charges, and a neutral ripple streaming
// outward decomposes into lone charges at the body-vacuum edge, which then reflect back inward, the radiation is
// SEALED in. So a single charged tone field cannot, by this rule, carry a coherent neutral disturbance out to the
// bath. Confinement (reflect lone charges) seals radiation.
//
// This is an honest negative that sharpens the one-tone problem, a local charge-confinement rule seals its own
// radiation. A working single-field self needs a confinement that does NOT seal (a bound core with a genuine
// propagating continuum), which this simplest candidate is not.
//
// Depth L2, the leaky confiner measured for confinement (it holds a body) and radiation (it seals the
// perturbation), with the momentum rotate (which radiates but disperses) as the contrast.

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, shellDistances, type Mesh } from '@/code/tool/mesh'
import { makeWill, cloneWill, cellTone, type Will } from '@/code/tone/will'
import { leakyConfine, headOnRotate, type Collision } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import { isReversible, conservesCharge } from '@/code/check/invariant'

export default defineExperiment({
  id: 'selves/leaky-confiner',
  title: 'the leaky confiner holds a body but seals its radiation (the perturbation never reaches the bath)',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 16
    const beats = 40
    const mesh: Mesh = d4Mesh({ side })
    const degree = mesh.degree
    const opposite = Array.from({ length: degree }, (_, d) => mesh.opposite(d))
    const half = side / 2
    const center = half + half * side + half * side * side + half * side * side * side
    const dist = shellDistances(mesh, center)
    const boundary = side / 2

    const packet = (): Will => {
      const will = makeWill(mesh)
      for (let c = 0; c < mesh.cellCount; c++) {
        if (dist[c]! <= 2) {
          const base = c * degree
          for (let d = 0; d < degree; d++) will.data[base + d] = 1
        }
      }
      return will
    }

    const leaky: Collision = leakyConfine({ opposite })
    const mobile: Collision = headOnRotate({ opposite })

    // confinement, the net-charge extent of the body over the run.
    const extent = (rule: Collision): number => {
      let current = packet()
      let max = 0
      for (let t = 0; t < beats; t++) {
        current = beat(current, rule)
        for (let c = 0; c < mesh.cellCount; c++) if (cellTone(current, c) !== 0 && dist[c]! > max) max = dist[c]!
      }
      return max
    }

    // radiation, how far a one-flip perturbation's cone reaches (does it get to the boundary).
    const cone = (rule: Collision): number => {
      let plain = packet()
      let pert = cloneWill(packet())
      pert.data[center * degree + 0] = (pert.data[center * degree + 0] === 1 ? -1 : 1) as -1 | 1
      let max = 0
      for (let t = 0; t < beats; t++) {
        plain = beat(plain, rule)
        pert = beat(pert, rule)
        for (let c = 0; c < mesh.cellCount; c++) {
          const base = c * degree
          let differs = false
          for (let d = 0; d < degree; d++) if (plain.data[base + d] !== pert.data[base + d]) { differs = true; break }
          if (differs && dist[c]! > max) max = dist[c]!
        }
      }
      return max
    }

    const leakyExtent = extent(leaky)
    const leakyCone = cone(leaky)
    const mobileExtent = extent(mobile)
    const reversible = isReversible(packet(), leaky, beats)
    const chargeOk = conservesCharge(packet(), leaky, beats)

    // the honest finding, the leaky confiner is reversible and charge-conserving and CONFINES a body (small
    // extent, unlike the dispersing momentum rotate), but it SEALS the radiation, the perturbation cone stays
    // within the body and never reaches the boundary.
    const confines = leakyExtent <= 5 && mobileExtent >= 8
    const sealsRadiation = leakyCone < boundary

    const ok = reversible && chargeOk && confines && sealsRadiation
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the leaky confiner is reversible and charge-conserving and CONFINES a body (its net charge stays bounded, while the momentum rotate disperses), but it SEALS its radiation, a perturbation cone stays within the body and never reaches the boundary, because confinement by reflecting lone charges also reflects the decomposed halves of a neutral ripple at the body-vacuum edge, so a single charged tone field does not radiate by this rule, an honest negative for the simplest one-tone leaky confiner',
      metrics: {
        leakyExtent,
        leakyCone,
        boundary,
        mobileExtent,
        reversible: reversible ? 1 : 0,
        chargeConserved: chargeOk ? 1 : 0,
        confines: confines ? 1 : 0,
        sealsRadiation: sealsRadiation ? 1 : 0,
        beats,
      },
      control: { mobileExtent, leakyCone },
      notes:
        'honest negative. Confine-charged plus stream-neutral confines a body but seals its radiation, the neutral ripple decomposes into lone charges that reflect at the body edge. A working single-field self needs a confinement that does NOT seal, a bound core with a genuine propagating continuum (a resonance), which this is not. The one-tone radiation problem stays open',
    })
  },
})
