// The substrate healing channel, the bath damps the emergent soft mode. A reversible CLOSED system cannot heal,
// it recurs (Poincare). Healing needs the bath, the open or growing lattice, where a disturbance radiates to the
// boundary and is absorbed for good. We take the emergent soft (sound) mode shown in selves/emergent-soft-radiation
// and run it two ways. On the CLOSED torus it recurs, its amplitude returns to full in the late window. On the
// OPEN lattice with an absorbing boundary (the bath) it is DAMPED, the amplitude decays to near zero and stays
// there, the disturbance has left the system irreversibly.
//
// This is the corrective self's AGENCY realized on the committed {3,4,3,4} substrate, with no real numbers. The
// momentum-conserving gas carries a disturbance away as the soft mode, and the bath absorbs it, so an open
// structure can shed a disturbance (heal) while a closed one cannot. Together with selves/emergent-soft-radiation
// (the soft mode exists and is gapless) this is the substrate realization of the reduced oscillator-bath self,
// the disturbance is the soft mode, the bath is the absorbing boundary, the damping is the healing.
//
// Depth L2, an emergent dissipative property, the bath turning the reversible soft mode into a damped one.

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, type Mesh } from '@/code/tool/mesh'
import { type Will } from '@/code/tone/will'
import { headOnRotate, type Collision } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import { absorbBoundary } from '@/code/dynamics/bath'
import { coinLines, densityWaveAlongAxis, stripeContrast } from '@/code/measure/sound-wave'

export default defineExperiment({
  id: 'selves/bath-damps-soft-mode',
  title: 'the bath damps the emergent soft mode: open radiates the disturbance away and heals, closed recurs',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 14
    const beats = 120
    const lambda = 4
    const mesh: Mesh = d4Mesh({ side })
    const degree = mesh.degree
    const opposite = Array.from({ length: degree }, (_, d) => mesh.opposite(d))
    const rule: Collision = headOnRotate({ opposite })
    const lines = coinLines(opposite)
    const axisOf = (cell: number): number => cell % side

    // run the soft density wave, returning the initial amplitude, the peak amplitude in the late window (the
    // recurrence signal), and the final amplitude.
    const trace = (open: boolean): { c0: number; lateMax: number; final: number } => {
      let will: Will = densityWaveAlongAxis({ mesh, lambda, axisOf, highTarget: 9, lowTarget: 3, lines })
      const c0 = Math.abs(stripeContrast({ will, lambda, axisOf, bins: side }))
      let lateMax = 0
      let final = 0
      for (let t = 1; t <= beats; t++) {
        will = beat(will, rule)
        if (open) absorbBoundary(will)
        const c = Math.abs(stripeContrast({ will, lambda, axisOf, bins: side }))
        if (t > beats / 2 && c > lateMax) lateMax = c
        final = c
      }
      return { c0, lateMax, final }
    }

    const closed = trace(false)
    const open = trace(true)

    // the closed torus RECURS, its late amplitude returns to near the initial (a reversible system cannot heal).
    const closedRecurs = closed.lateMax >= closed.c0 * 0.8
    // the open lattice is DAMPED, its late amplitude is driven to near zero by the bath (the disturbance left).
    const openDamped = open.lateMax <= open.c0 * 0.2
    // and the open final amplitude is far below the closed late amplitude (open healed, closed did not).
    const openHealsClosedDoesNot = open.final < closed.lateMax * 0.3

    const ok = closedRecurs && openDamped && openHealsClosedDoesNot
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the bath damps the emergent soft mode on the {3,4,3,4} substrate, a soft (sound) density wave run on the closed torus RECURS (its late amplitude returns to near the initial, a reversible closed system cannot heal) while the same wave run on the open lattice with an absorbing boundary is DAMPED to near zero (the disturbance radiates to the boundary and is absorbed for good), so an open structure sheds a disturbance carried by the soft mode and heals while a closed one cannot, this is the corrective self agency realized on the substrate with no real numbers, the disturbance is the soft mode, the bath is the absorbing boundary, the damping is the healing',
      metrics: {
        initialAmplitude: Math.round(closed.c0 * 100),
        closedLateAmplitude: Math.round(closed.lateMax * 100),
        openLateAmplitude: Math.round(open.lateMax * 100),
        openFinalAmplitude: Math.round(open.final * 100),
        closedRecurs: closedRecurs ? 1 : 0,
        openDamped: openDamped ? 1 : 0,
        openHealsClosedDoesNot: openHealsClosedDoesNot ? 1 : 0,
        beats,
      },
      control: { closedLateAmplitude: Math.round(closed.lateMax * 100), openLateAmplitude: Math.round(open.lateMax * 100) },
      notes:
        'the substrate healing channel, the agency half of the emergent self. Identity is base (conserved / topological charge), agency rides this damped soft mode. The closed torus recurs (reversible, no healing), the open lattice damps to zero (the bath absorbs the radiated disturbance). This is the substrate realization of the reduced oscillator-bath self, disturbance is the soft mode, bath is the boundary, damping is the healing, no real numbers',
    })
  },
})
