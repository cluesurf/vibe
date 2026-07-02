// The measurement-selection tie, located at its layer: the sharp either-or that turns a seed into a
// definite outcome lives at the EMERGENT-SELF layer, not the base rule. This is the missing piece
// of the frontier 1 and 6 story, and it explains why E-QTM-0043 (testing the base rule) correctly
// found no selection, the base rule is the wrong layer to look.
//
// The chain so far. E-QTM-0043 showed the base reversible rule cannot turn a seed into a definite
// macroscopic outcome (a microscopic seed shifts the pointer by about 1e-4, no selection). E-QTM-0044
// showed the RESOLUTION mechanism is spontaneous symmetry breaking below a critical point, where an
// infinitesimal bias selects a definite branch, but on a mean-field toy, not the model. The open tie
// was to realize that bifurcation on a concrete spatial dynamics. The vibe framework is explicit that
// physics lives in EMERGENT layers above the raw rule, and the selves are exactly such a layer.
//
// The demonstration, on a toy nucleation model (reusing the nucleation dynamics of E-SLF-0001):
//   - a seed BELOW a critical radius dies, its repair losing to its decay, leaving the null outcome
//     (no self, the empty symmetric state),
//   - a seed ABOVE the critical radius PERSISTS as a definite, localized, self-maintaining structure.
//     It does not grow: at these parameters a surviving droplet is a frozen fixed point that holds
//     exactly its seed mass (radius 6 starts at fraction 0.0172 and stays at 0.0172). The selected
//     outcome is persistence, not amplification.
//   - the threshold is SHARP (here between seed radius 5, which dies to fraction zero, and 6, which
//     persists), a genuine bifurcation.
// So the selves-layer dynamics provide a sharp persistence threshold: the seed either dies to the
// null outcome or persists as a definite localized outcome, the either-or the base rule lacks and
// the bifurcation shape E-QTM-0044 needs.
//
// HONEST scope, the added ingredient: the nucleation rule here is a HAND-BUILT irreversible
// majority rule with hysteresis (stay 0.42, grow 0.55), not the committed reversible rule. It shows
// the selves-layer MECHANISM in a toy nucleation model. Whether the committed reversible rule plus
// drains produces an equivalent effective bistable dynamics at the selves layer remains open, that
// tie is NOT closed here. It also does not derive the Born WEIGHTS (the probability of each
// outcome, the separate envariance result E-QTM-0012), and it does not show that a specific
// laboratory measurement pointer IS a nucleating self.
//
// Grade L1: the threshold behaviour is classical nucleation theory (a critical nucleus from
// surface tension versus bulk drive) reproduced in a hand-built toy, known physics with no
// committed-rule involvement, graded accordingly. Its value is locating WHERE the selection
// mechanism would live (the emergent-self layer) with the sub-critical seed as the control.

import { nucleate } from '@/code/dynamics/nucleation'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'quantum/selection-at-the-selves-layer',
  code: 'E-QTM-0045',
  title:
    'the sharp either-or the base rule lacks (E-QTM-0043) is demonstrated at the emergent-self layer in a toy nucleation model: a seed below the critical radius dies to the null outcome while a seed above it persists as a definite localized self holding exactly its seed mass, a sharp persistence threshold with the shape of the E-QTM-0044 bifurcation, the tie to the committed rule staying open',
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    const common = {
      side: 81,
      neighborRadius: 3,
      stay: 0.42,
      grow: 0.55,
      beats: 60,
    }

    // sweep the seed radius across the nucleation threshold
    const radii = [2, 3, 4, 5, 6, 8, 10]
    const sweep = radii.map(seedRadius => ({
      seedRadius,
      ...nucleate({ ...common, seedRadius }),
    }))

    const subCritical = sweep.filter(s => !s.survived)
    const superCritical = sweep.filter(s => s.survived)

    // the largest dying radius and the smallest surviving radius bracket the threshold
    const lastDied = Math.max(...subCritical.map(s => s.seedRadius), 0)
    const firstSurvived = Math.min(
      ...superCritical.map(s => s.seedRadius),
      Infinity,
    )

    // sub-critical outcome (dies to the null state) and super-critical outcome (a
    // definite persisting self)
    const nullOutcome = Math.max(
      ...subCritical.map(s => s.finalFraction),
      0,
    )

    const definiteOutcome = Math.min(
      ...superCritical.map(s => s.finalFraction),
      Infinity,
    )

    // survivors hold their seed mass (final over initial, 1 means exact persistence,
    // no growth): the outcome is persistence, not amplification
    const survivorMassRatio = superCritical.length
      ? Math.min(
          ...superCritical.map(
            s => s.finalFraction / s.initialFraction,
          ),
        )
      : 0

    // 1. a sharp threshold exists: some radii die, some persist, and the dying set is
    //    below the persisting set (a clean bifurcation, not noise).
    const sharpThreshold =
      subCritical.length > 0 &&
      superCritical.length > 0 &&
      lastDied < firstSurvived

    // 2. below threshold the seed dies to the null outcome (no self).
    const subCriticalDies = nullOutcome < 0.005

    // 3. above threshold a definite localized self persists (a finite outcome).
    const superCriticalPersists =
      definiteOutcome > 0.01 && survivorMassRatio > 0.5

    const solved =
      sharpThreshold && subCriticalDies && superCriticalPersists

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'in the toy nucleation model, a seed below a critical radius dies to the null outcome (no self) while a seed above it persists as a definite localized self-maintaining structure holding exactly its seed mass (the radius-6 seed starts at fraction 0.0172 and stays there, persistence not amplification), a sharp threshold bifurcation between seed radius 5 and 6, so the selves-layer dynamics provide the sharp either-or between the null outcome and a definite outcome that the base reversible rule lacks (E-QTM-0043) and that has the shape of the spontaneous-symmetry-breaking bifurcation E-QTM-0044 requires, with the sub-critical seed dying to null as the control, while the tie to the committed rule (whether it produces an equivalent bistable dynamics at the selves layer) and the Born weights (E-QTM-0012) remain open',
      metrics: {
        lastDyingRadius: lastDied,
        firstNucleatingRadius: firstSurvived,
        subCriticalNullOutcome: Number(nullOutcome.toFixed(4)),
        superCriticalDefiniteOutcome: Number(
          definiteOutcome.toFixed(4),
        ),
        survivorMassRatio: Number(survivorMassRatio.toFixed(4)),
        subCriticalCount: subCritical.length,
        superCriticalCount: superCritical.length,
      },
      control: {
        // the sub-critical seed dies to the null outcome (fraction zero), so the persistence above
        // threshold is a genuine bifurcation, not an always-on effect. If every seed persisted,
        // there would be no threshold and no selection, just unconditional survival.
        subCriticalNullOutcome: Number(nullOutcome.toFixed(4)),
        superCriticalDefiniteOutcome: Number(
          definiteOutcome.toFixed(4),
        ),
      },
      notes:
        'L1. Reuses the nucleation dynamics of E-SLF-0001 (deterministic). A seed below the critical radius dies to fraction zero (the null outcome), above it a definite localized self persists, a sharp threshold between radius 5 and 6. Survivors hold exactly their seed mass (final fraction equals initial fraction, the droplet is a frozen fixed point), so this is a persistence threshold, not an amplification: the seed size selects between the null outcome and a definite outcome, it is not grown into a macroscopic branch. The nucleation rule is a HAND-BUILT irreversible majority rule with hysteresis (an added ingredient, not the committed reversible rule), so this shows the selves-layer MECHANISM in a toy nucleation model, and the tie to the committed rule remains open. The threshold itself is classical nucleation theory (a critical nucleus set by surface tension versus bulk drive, Becker and Doering 1935, standard treatments e.g. Kelton and Greer, Nucleation in Condensed Matter, 2010), which is why this grades L1: known physics in a toy, valuable for locating WHERE the selection mechanism would live (the emergent-self layer, which is why E-QTM-0043 testing the base rule found no selection), not a substrate result. It does not derive the Born weights (E-QTM-0012) or identify a laboratory pointer as a nucleating self.',
    })
  },
})
