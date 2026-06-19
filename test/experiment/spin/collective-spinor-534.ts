// SK4 (the mechanism-agnostic collective spinor mode): SK2 (spin/disclination-spin-534) showed a POINT
// probe transported around a disclination picks up the spinor -1. SK4 asks whether that is an artifact of
// a localized probe or a genuine FIELD property: does a DELOCALIZED collective mode, spread over the loop
// and varying with a mode index, also carry the sign? We transport a collective spinor mode (a
// mode-dependent superposition of the two components) around a winding-w disclination and read its overlap
// with itself.
//
//   - The overlap is (-1)^w for EVERY mode: an odd (half) disclination flips the collective mode, and the
//     result does not depend on which collective mode it is. So the spin-half is carried by the extended
//     excitation, topologically, not by any single cell.
//   - Mode-independence is the control: if the sign came from a probe detail it would vary with the mode.
//     It does not, so it is the defect's Z_2 charge acting on the whole mode.
//
// Together with SK1 (the Kahler-Dirac fermion propagates) and SK2 (a defect carries spin), this closes the
// {5,3,4} spin route: the spinless-coin substrate hosts a propagating, collective, topologically protected
// spin-half. Pure algebra, deterministic.

import { collectiveModeOverlap } from '@/code/algebra/group/disclination'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const MODES = [0, 1, 2, 3, 4, 5]
const WINDINGS = [0, 1, 2, 3]

export function collectiveSpinor(): {
  oddFlipsEveryMode: boolean
  evenPreservesEveryMode: boolean
  modeIndependent: boolean
} {
  // for every mode, an odd-winding disclination must flip the collective mode (overlap -1) and an even
  // one must preserve it (overlap +1)
  let oddFlipsEveryMode = true
  let evenPreservesEveryMode = true
  let modeIndependent = true
  for (const winding of WINDINGS) {
    const overlaps = MODES.map(mode =>
      collectiveModeOverlap({ winding, steps: 24, mode }),
    )
    const expected = winding % 2 === 1 ? -1 : 1
    for (const overlap of overlaps) {
      if (Math.abs(overlap - expected) > 1e-9) {
        if (winding % 2 === 1) {
          oddFlipsEveryMode = false
        } else {
          evenPreservesEveryMode = false
        }
      }
    }

    // every mode gives the same overlap (within rounding): the sign is mode-independent
    for (const overlap of overlaps) {
      if (Math.abs(overlap - overlaps[0]!) > 1e-9) {
        modeIndependent = false
      }
    }
  }

  return { oddFlipsEveryMode, evenPreservesEveryMode, modeIndependent }
}

export default experiment({
  id: 'spin/collective-spinor-534',
  title:
    'a delocalized collective mode carries the disclination spinor sign for every mode, the topological spin is a field property',
  category: 'spin',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = collectiveSpinor()
    const ok =
      r.oddFlipsEveryMode &&
      r.evenPreservesEveryMode &&
      r.modeIndependent

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a delocalized collective spinor mode transported around a winding-w disclination returns to (-1)^w times itself for EVERY mode, so an odd (half) disclination flips the whole collective mode independent of which mode it is, and the spin-half is a topological property of the extended excitation rather than an artifact of a localized probe',
      metrics: {
        oddFlipsEveryMode: r.oddFlipsEveryMode ? 1 : 0,
        evenPreservesEveryMode: r.evenPreservesEveryMode ? 1 : 0,
        modeIndependent: r.modeIndependent ? 1 : 0,
      },
      control: {
        // mode-independence: the same (-1)^w for every collective mode. If the sign were a probe artifact
        // it would depend on the mode. It does not, so it is the defect's Z_2 charge on the whole mode.
        modeIndependent: r.modeIndependent ? 1 : 0,
      },
      notes:
        'L2, the mechanism-agnostic collective spinor mode (SK4), completing the {5,3,4} spin route alongside SK1 (spin/kahler-dirac-propagation-534, propagation) and SK2 (spin/disclination-spin-534, defect spin). The loop holonomy (-1)^w I acts on ANY collective spinor, so a delocalized mode carries the sign for every mode, the topological spin is a field property not a point-probe artifact. Reuses code/algebra/group/disclination. Pure algebra, deterministic.',
    })
  },
})
