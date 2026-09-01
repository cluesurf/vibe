// A wormhole cannot be shared three ways. Because the throat between two regions is their
// entanglement (E-HLG-0034) and its bandwidth is the number of Bell pairs (E-HLG-0035), and because
// entanglement is monogamous (the Toner-Verstraete and Coffman-Kundu-Wootters bounds, and vibe's own
// CHSH monogamy), a wormhole that opens maximally between two regions has used up all their capacity
// to bridge anywhere else. So if the throat between A and B is fully open, there is no throat at all
// from A to a third region C. The strongest bridge is exclusive, which is the geometric reading of
// why maximal entanglement is monogamous.
//
// Measured with the Horodecki optimal CHSH as a throat-strength gauge on a three-party state: at the
// singlet corner, where A and B share a maximally violating (fully open) wormhole, the A-to-C CHSH is
// exactly zero, so there is no wormhole from A to C at all. Across a swept family the squared throat
// strengths of the A-B and A-C bridges obey the monogamy bound, their sum never exceeding the
// two-party maximum, so a wider A-B throat always narrows the A-C one.
//
// The control is a classically correlated three-party state (the GHZ state): its A-B and A-C bridges
// each carry only the classical-strength value at once, so classical correlation can be shared by
// both while the maximal quantum wormhole cannot, exactly the distinction between shareable classical
// links and monogamous quantum throats.
//
// Depth L2. It measures the monogamy of the wormhole throat (a maximal A-B bridge forces A-C to zero,
// the swept squared strengths obeying the bound) with the classical-sharing GHZ control, the
// no-three-way-sharing property of the ER=EPR bridge on the substrate. A model-level result on the
// emergent entanglement geometry.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  horodeckiChsh,
  wClassState,
  ghzState,
} from '@/code/measure/bell-structure'

const SWEEP = [0.1, 0.3, 0.5, 0.7, 0.9]
const BOUND = 8

export default experiment({
  id: 'quantum/wormhole-monogamy',
  code: 'E-QTM-0069',
  title:
    'a maximal A-B wormhole (singlet corner, CHSH 2 root 2) forces the A-C throat to exactly zero and the swept squared throat strengths obey the monogamy bound, so a wormhole cannot be shared three ways, while a GHZ state shares classical-strength links in both',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    // the singlet corner: A-B a maximal wormhole, C detached
    const singletCorner = wClassState({
      a: -1 / Math.SQRT2,
      b: 1 / Math.SQRT2,
      c: 0,
    })

    const throatAB = horodeckiChsh({
      state: singletCorner,
      first: 0,
      second: 1,
    })

    const throatAC = horodeckiChsh({
      state: singletCorner,
      first: 0,
      second: 2,
    })

    const maximalIsExclusive =
      Math.abs(throatAB - 2 * Math.SQRT2) < 1e-9 && throatAC < 1e-9

    // the swept family obeys the monogamy bound on squared throat strengths
    let worstSum = 0

    for (const t of SWEEP) {
      const share = Math.cos((t * Math.PI) / 2)
      const rest = Math.sin((t * Math.PI) / 2) / Math.SQRT2
      const state = wClassState({ a: rest, b: share, c: rest })
      const ab = horodeckiChsh({ state, first: 0, second: 1 })
      const ac = horodeckiChsh({ state, first: 0, second: 2 })

      worstSum = Math.max(worstSum, ab * ab + ac * ac)
    }

    const boundHolds = worstSum <= BOUND + 1e-9

    // CONTROL: the GHZ state shares classical-strength throats in both pairs at once
    const ghz = ghzState()
    const ghzAB = horodeckiChsh({ state: ghz, first: 0, second: 1 })
    const ghzAC = horodeckiChsh({ state: ghz, first: 0, second: 2 })
    const classicalShared =
      Math.abs(ghzAB - 2) < 1e-9 && Math.abs(ghzAC - 2) < 1e-9

    const ok = maximalIsExclusive && boundHolds && classicalShared

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'reading the Horodecki optimal CHSH as the throat strength of a wormhole, at the singlet corner where A and B share a maximally open bridge (CHSH two root two) the A-to-C throat is exactly zero so there is no wormhole from A to C at all, and across the swept family the sum of the squared throat strengths of the A-B and A-C bridges never exceeds the two-party maximum of eight (the monogamy bound), so a wider A-B throat always narrows the A-C one and the strongest bridge is exclusive, the geometric reading of entanglement monogamy, while a GHZ state carries the classical-strength value two in both its A-B and A-C throats at once, so classical correlation is shareable by both partners while the maximal quantum wormhole cannot be shared three ways',
      metrics: {
        throatAB: Number(throatAB.toFixed(4)),
        throatAC: Number(throatAC.toFixed(6)),
        worstSweptSquaredSum: Number(worstSum.toFixed(4)),
        ghzThroatAB: Number(ghzAB.toFixed(4)),
        ghzThroatAC: Number(ghzAC.toFixed(4)),
      },
      // CONTROL: the GHZ state shares classical-strength throats in both pairs.
      control: { ghzBothThroatsAtTwo: classicalShared ? 1 : 0 },
      notes:
        'Wormhole monogamy: a maximal A-B throat forces A-C to zero (Toner-Verstraete via Horodecki). A bridge cannot be shared three ways, the geometric face of entanglement monogamy. Bounds the throat bandwidth (E-HLG-0035) and completes the cross-section (E-HLG-0034) and traversal (E-QTM-0068) picture.',
    })
  },
})
