// Frontier 3, completing the Koide scope audit with a sharp falsifiable statement: the charged-
// lepton Koide relation does NOT extend to the neutrinos. With E-FRC-0063 (quarks) this maps the
// full scope of the mechanism, and it is a testable prediction in its own right.
//
// Neutrinos are leptons, so a lepton-specific Koide mechanism might predict Q_nu = 2/3 for them
// too. This tests that against the measured neutrino mass-squared splittings, for both mass
// orderings, scanning the one free parameter (the lightest mass). The result is a clean exclusion:
//   - normal ordering: Q ranges over [1/3, 0.584] as the lightest mass runs from zero upward, with
//     the maximum 0.584 at zero lightest mass, well below 2/3,
//   - inverted ordering: Q ranges over [1/3, 0.500], maximum 0.500, further below 2/3.
// So with the measured splittings the neutrino Koide combination CANNOT reach 2/3 with the ordinary
// positive square roots, for either ordering and any lightest-mass value. The naive extension of the
// charged-lepton relation to neutrinos is excluded.
//
// The scope audit is now complete: the Koide relation Q = 2/3 holds sharply for the charged leptons
// (E-FRC-0057, one part in a hundred thousand), fails for the quarks (E-FRC-0063, up quarks 0.85),
// and cannot even be reached for the neutrinos (this, 0.584 and 0.500 maxima). So the mechanism is
// specific to the charged leptons, and the neutrino sector must carry a different structure (for
// instance Majorana masses, or the signed-root convention of Brannen, a separate hypothesis not
// assumed here). This is the honest boundary of the whole Koide arc.
//
// The falsifiable content: a future absolute-neutrino-mass measurement (from cosmology, beta decay,
// or neutrinoless double beta decay) satisfying Q = 2/3 with positive roots is IMPOSSIBLE given the
// splittings, so it would not happen, and if the neutrino masses are ever fully pinned they must
// give a Q at or below these maxima. That is a genuine, already-constrained prediction.
//
// Grade L1: Koide Q for the neutrinos scanned over the lightest mass for both orderings, shown
// bounded below 2/3, with the charged leptons (which DO reach 2/3) as the control that the neutrino
// failure is a real sector difference, not a property of the Koide form.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { koideRatio } from '@/code/measure/koide'

const DM21 = 7.53e-5 // eV^2, solar mass-squared splitting
const DM31_NO = 2.453e-3 // eV^2, atmospheric splitting, normal ordering
const DM31_IO = 2.536e-3 // eV^2, atmospheric splitting magnitude, inverted ordering

// scan the Koide Q over the lightest neutrino mass, return the maximum over the physical range
function maxQ(masses: (light: number) => number[]): number {
  let mx = -Infinity

  for (let i = 0; i <= 4000; i++) {
    const light = (i / 4000) * 0.3 // lightest mass 0 to 0.3 eV (well past cosmological bounds)

    mx = Math.max(mx, koideRatio(masses(light)))
  }

  return mx
}

export default experiment({
  id: 'gauge/koide-scope-neutrinos',
  code: 'E-FRC-0065',
  title:
    'the charged-lepton Koide relation does not extend to the neutrinos: with the measured mass-squared splittings the neutrino Koide Q maxes at 0.584 (normal) and 0.500 (inverted), both below 2/3 and unreachable with positive roots, so the mechanism is charged-lepton specific and the neutrino sector needs different structure, completing the scope audit begun for the quarks',
  category: 'gauge',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    // normal ordering: m1 lightest, m2 and m3 from the splittings
    const maxNormal = maxQ(m1 => [
      m1,
      Math.sqrt(m1 * m1 + DM21),
      Math.sqrt(m1 * m1 + DM31_NO),
    ])

    // inverted ordering: m3 lightest, m1 and m2 the near-degenerate heavy pair
    const maxInverted = maxQ(m3 => {
      const m1 = Math.sqrt(m3 * m3 + DM31_IO)
      const m2 = Math.sqrt(m1 * m1 + DM21)

      return [m1, m2, m3]
    })

    // the charged leptons DO reach 2/3 (the control that 2/3 is attainable for a lepton triple)
    const qChargedLeptons = koideRatio([0.51099895, 105.6583755, 1776.86])

    // 1. normal-ordering neutrino Q cannot reach 2/3.
    const normalExcluded = maxNormal < 2 / 3 - 0.05

    // 2. inverted-ordering neutrino Q cannot reach 2/3 (further below).
    const invertedExcluded = maxInverted < 2 / 3 - 0.1

    // 3. control: the charged leptons DO satisfy 2/3, so the neutrino failure is a sector
    //    difference, not an impossibility of the Koide form.
    const chargedLeptonsReach = Math.abs(qChargedLeptons - 2 / 3) < 1e-4

    const solved =
      normalExcluded && invertedExcluded && chargedLeptonsReach

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'with the measured neutrino mass-squared splittings the Koide combination for the three neutrinos, scanned over the lightest mass, cannot reach 2/3 with ordinary positive roots for either ordering, maxing at about 0.584 for normal ordering and 0.500 for inverted ordering, both below the 2/3 the charged leptons hit exactly, so the charged-lepton Koide relation does not extend to the neutrinos, the mechanism is charged-lepton specific, and the neutrino sector must carry a different structure such as Majorana masses, which completes the scope audit (charged leptons satisfy it, quarks fail it, neutrinos cannot reach it) and is itself a falsifiable statement since a positive-root neutrino Q of 2/3 is excluded by the splittings',
      metrics: {
        maxQNormalOrdering: Number(maxNormal.toFixed(4)),
        maxQInvertedOrdering: Number(maxInverted.toFixed(4)),
        target: Number((2 / 3).toFixed(4)),
        qChargedLeptonsControl: Number(qChargedLeptons.toFixed(4)),
      },
      control: {
        // the charged leptons reach 2/3 exactly, so 2/3 is attainable for a lepton triple; the
        // neutrinos not reaching it is a genuine difference of the neutrino sector, not a defect
        // of the Koide form. If 2/3 were unreachable for any triple, the statement would be empty.
        qChargedLeptonsControl: Number(qChargedLeptons.toFixed(4)),
        maxQNormalOrdering: Number(maxNormal.toFixed(4)),
      },
      notes:
        'L1. Koide Q scanned over the lightest neutrino mass (0 to 0.3 eV) for both orderings with the measured splittings (DM21 = 7.53e-5, |DM31| = 2.453e-3 / 2.536e-3 eV^2). The maxima 0.584 (normal) and 0.500 (inverted) are both below 2/3, so a positive-root neutrino Koide of 2/3 is excluded. The charged leptons (control) reach 2/3 exactly, so this is a real sector difference. Completes the scope audit begun in E-FRC-0063 (quarks): the Koide mechanism is charged-lepton specific. The neutrino sector needs different structure (Majorana, or the signed-root Brannen convention), not assumed here. Falsifiable: any future absolute neutrino mass determination must give Q at or below these maxima, never 2/3 with positive roots.',
    })
  },
})
