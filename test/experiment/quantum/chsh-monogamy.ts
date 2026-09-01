// Monogamy of the Bell violation: maximal nonlocality cannot be shared. The Toner-Verstraete
// trade-off says that for any three-party quantum state the squared CHSH values of the two pairs
// sharing a party obey CHSH(AB)^2 + CHSH(AC)^2 at most 8. So if Alice and Bob violate CHSH at the
// Tsirelson bound 2 root 2 (squared, 8), Alice and Charlie get CHSH exactly zero: not merely no
// violation, no correlation usable in a CHSH test at all. This is the structural reason the
// emergent nonlocality (E-QTM-0011, E-QTM-0057) cannot be broadcast: the strongest link uses up
// the whole budget.
//
// Measured exactly with the Horodecki optimal-CHSH formula on reduced two-qubit states of real
// three-party states: at the singlet corner (the singlet with a detached third party) the AB pair
// reaches 2 root 2 and the AC pair sits at exactly zero, the extreme of the trade-off. Across a
// swept W-class family the squared sum stays below 8 everywhere. And the classical corner is the
// GHZ state: BOTH its pairs sit at exactly the classical bound 2 simultaneously (squared sum
// exactly 8), because its reduced pairs are exactly classically correlated bits, so
// classical-strength correlation CAN be shared by both pairs at once while Tsirelson-strength
// correlation forces the third party to zero. Sharing is what separates classical correlation
// from quantum nonlocality.
//
// The GHZ corner doubles as the control: the measure does not force decoupling by itself (both
// GHZ pairs hold correlation 2 at the same time), so the zero at the singlet corner is the
// monogamy trade-off, not an artifact.
//
// Depth L1. It confirms the Toner-Verstraete monogamy bound, its saturation at both corners
// (Tsirelson-with-zero and classical-with-classical), and the bound across a swept family,
// exactly via the Horodecki formula, the known quantum monogamy structure at the emergent layer.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  wClassState,
  ghzState,
  horodeckiChsh,
} from '@/code/measure/bell-structure'

const SWEEP = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
const BOUND = 8

export default experiment({
  id: 'quantum/chsh-monogamy',
  code: 'E-QTM-0058',
  title:
    'the Bell violation is monogamous: the singlet pair at Tsirelson forces the third party to CHSH exactly zero, the squared sum stays below 8 across a swept family (Toner-Verstraete), and the GHZ control holds classical-strength correlation in both pairs at once',
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    // the singlet corner: AB maximally violating, C detached
    const singletCorner = wClassState({
      a: -1 / Math.SQRT2,
      b: 1 / Math.SQRT2,
      c: 0,
    })

    const cornerAB = horodeckiChsh({
      state: singletCorner,
      first: 0,
      second: 1,
    })

    const cornerAC = horodeckiChsh({
      state: singletCorner,
      first: 0,
      second: 2,
    })

    // the swept W-class family: the squared sum stays below the bound everywhere
    let worstSum = 0

    for (const t of SWEEP) {
      const share = Math.cos((t * Math.PI) / 2)
      const rest = Math.sin((t * Math.PI) / 2) / Math.SQRT2
      const state = wClassState({ a: rest, b: share, c: rest })

      const ab = horodeckiChsh({ state, first: 0, second: 1 })
      const ac = horodeckiChsh({ state, first: 0, second: 2 })

      worstSum = Math.max(worstSum, ab * ab + ac * ac)
    }

    // CONTROL: the GHZ corner, both pairs at the classical bound 2 simultaneously
    const ghz = ghzState()
    const ghzAB = horodeckiChsh({ state: ghz, first: 0, second: 1 })
    const ghzAC = horodeckiChsh({ state: ghz, first: 0, second: 2 })

    const tsirelsonCorner =
      Math.abs(cornerAB - 2 * Math.SQRT2) < 1e-12 && cornerAC < 1e-12

    const boundHolds = worstSum <= BOUND + 1e-9
    const classicalShared =
      Math.abs(ghzAB - 2) < 1e-12 && Math.abs(ghzAC - 2) < 1e-12

    const ok = tsirelsonCorner && boundHolds && classicalShared

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the Horodecki optimal CHSH of the singlet-with-detached-third-party gives the AB pair the full Tsirelson value 2 root 2 while the AC pair sits at exactly zero (maximal violation uses the whole Toner-Verstraete budget, so the strongest link forces total third-party decoupling), the squared sum CHSH(AB)^2 + CHSH(AC)^2 stays below 8 across the swept W-class family, and the GHZ state holds CHSH exactly 2 in BOTH pairs simultaneously (its reduced pairs are classically correlated bits, squared sum exactly 8), so classical-strength correlation can be shared while Tsirelson-strength correlation cannot, the monogamy that makes the emergent nonlocality unbroadcastable',
      metrics: {
        singletCornerAB: Number(cornerAB.toFixed(6)),
        singletCornerAC: Number(cornerAC.toFixed(6)),
        worstSweptSquaredSum: Number(worstSum.toFixed(4)),
        ghzAB: Number(ghzAB.toFixed(6)),
        ghzAC: Number(ghzAC.toFixed(6)),
      },
      // CONTROL: GHZ holds classical-strength correlation in both pairs at once, so the zero at
      // the singlet corner is the monogamy trade-off, not the measure forcing decoupling.
      control: { ghzBothPairsAtTwo: classicalShared ? 1 : 0 },
      notes:
        'Toner-Verstraete CHSH monogamy via the Horodecki formula, exact. The structural reason the emergent Bell violation (E-QTM-0011) cannot be shared or broadcast, pairing with no-signaling (E-QTM-0057): nonlocal correlations that neither signal nor share.',
    })
  },
})
