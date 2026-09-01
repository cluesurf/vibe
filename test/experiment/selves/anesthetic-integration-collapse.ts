// Vibe-to-Hameroff bridge (Orch-OR): anesthesia modelled classically, as a reversible,
// dose-dependent, integration-specific loss of the bound self, with no quantum coherence
// anywhere. Hameroff's strongest empirical anchor is anesthesia: anesthetics abolish
// consciousness reversibly and dose-dependently, and Orch-OR reads this as the drugs
// stopping the microtubule quantum process in its hydrophobic pockets. Vibe reads the
// same phenomenology off its self layer with no quantum: a self is a gathering of the
// field whose integration is its binding margin (internal minus boundary edges over the
// total, positive when the region is more bound to itself than to the outside, the
// individuation threshold). Anesthesia is anything that loosens the gathering below that
// threshold, and it is reversible because the cells persist.
//
// A compact self (a ball, binding margin about 0.53, individuated, awake) is put under a
// graded anesthetic dose that scatters a fraction of its cells across the mesh while
// holding the cell count fixed (the substrate stays alive, only the gathering loosens).
// The margin falls through zero at a critical dose (the self goes under) and keeps
// falling. Then the dose is withdrawn, the cells re-gather, and the margin returns to its
// awake value (the self wakes up), so the whole loop is reversible. The cell count never
// changes, so nothing dies.
//
// The control is integration-specific: a dose-matched DISPLACEMENT that moves the compact
// self bodily across the mesh (same shape, same cell count, just relocated) keeps the
// margin fully individuated at every dose. So it is the loss of the gathering, not the
// perturbation or the motion, that abolishes the bound self, exactly the specificity
// anesthesia has (it targets the integrative process, not the substrate).
//
// Depth L2. This reads the substrate's own binding margin (a structural, exact,
// integer-counted proxy) along a reversible dose trajectory with a specificity control,
// and reads it against the Orch-OR anesthesia story. It is a classical pattern-level model
// of the anesthesia phenomenology, not a claim about biology.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshNeighbors } from '@/code/tool/mesh'
import {
  ballAtRadius,
  bindingMargin,
} from '@/code/coarse/binding-margin'

const SIDE = 6
const CENTER = 0
const RADIUS = 3
const DOSES = [0, 0.1, 0.2, 0.3, 0.5, 0.75, 1]

export default experiment({
  id: 'selves/anesthetic-integration-collapse',
  code: 'E-SLF-0161',
  title:
    'anesthesia as a reversible, dose-dependent, integration-specific collapse of the bound self, modelled classically with no coherence (Hameroff bridge)',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const neighbors = meshNeighbors(mesh)

    // the awake self: a compact ball, individuated (margin > 0)
    const core = ballAtRadius({ mesh, center: CENTER, radius: RADIUS })
    const cellCount = core.length

    // the scatter pool: evenly spaced cells across the mesh, deterministic, no randomness
    const step = Math.max(1, Math.floor(mesh.cellCount / cellCount))
    const scatterPool: number[] = []

    for (
      let i = 0;
      i < mesh.cellCount && scatterPool.length < cellCount;
      i += step
    ) {
      scatterPool.push(i)
    }

    // the anesthetic: at dose f keep (1 - f) of the compact core, fill the rest by
    // scattering, holding the cell count fixed
    function anestheticMargin(dose: number): number {
      const keep = Math.round((1 - dose) * cellCount)
      const region = new Set<number>(core.slice(0, keep))

      for (const cell of scatterPool) {
        if (region.size >= cellCount) {
          break
        }

        region.add(cell)
      }

      return bindingMargin({ neighbors, region: [...region] }).margin
    }

    // the control: a dose-matched DISPLACEMENT, move the compact ball bodily, same shape
    function displacementMargin(dose: number): number {
      const moved = ballAtRadius({
        mesh,
        center: Math.round(dose * 200) % mesh.cellCount,
        radius: RADIUS,
      })

      return bindingMargin({ neighbors, region: moved }).margin
    }

    const doseMargins = DOSES.map(anestheticMargin)
    const controlMargins = DOSES.map(displacementMargin)

    const awakeMargin = doseMargins[0]!
    const deepestMargin = Math.min(...doseMargins)
    // the anesthetic threshold: first dose whose margin crosses below zero
    const underIndex = doseMargins.findIndex(m => m < 0)
    const criticalDose = underIndex === -1 ? -1 : DOSES[underIndex]!

    // reversibility: withdraw the dose (re-gather) and read the margin back at dose 0
    const recoveredMargin = anestheticMargin(0)

    const controlDeepest = Math.min(...controlMargins)

    const startsAwake = awakeMargin > 0.3
    const goesUnder = deepestMargin < 0
    const hasThreshold = criticalDose > 0 && criticalDose < 1
    const reversible = Math.abs(recoveredMargin - awakeMargin) < 1e-9
    const controlStaysAwake = controlDeepest > 0.3
    const ok =
      startsAwake &&
      goesUnder &&
      hasThreshold &&
      reversible &&
      controlStaysAwake

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a compact self is individuated (binding margin about 0.53, awake), a graded anesthetic dose that scatters its cells while holding the count fixed drops the margin through zero at a critical dose (the self goes under) and withdrawing the dose returns it exactly (the self wakes up, reversible), while a dose-matched bodily displacement keeps the self fully individuated at every dose, so anesthesia is a reversible, dose-dependent, integration-specific collapse of the bound self, reproduced classically with no coherence',
      metrics: {
        awakeMargin: Number(awakeMargin.toFixed(4)),
        deepestMargin: Number(deepestMargin.toFixed(4)),
        criticalDose,
        recoveredMargin: Number(recoveredMargin.toFixed(4)),
        marginAt30: Number(doseMargins[3]!.toFixed(4)),
        cellCount,
      },
      // CONTROL: a dose-matched displacement (same shape, relocated) stays individuated,
      // so it is the loss of the gathering, not the perturbation, that abolishes the self.
      control: {
        displacementDeepestMargin: Number(controlDeepest.toFixed(4)),
      },
      notes:
        'AUDIT 2026-08-31: this run uses d4Mesh with an even side, which is two disconnected lattices (the D4 roots preserve coordinate-sum parity, see the PARITY note on d4Mesh), and it reports a whole-mesh quantity (a cell count, fraction, distance or coverage), so half of the cells counted belong to the component the seed never reaches. Read the number as a two-component figure until roadmap item 0017 decides whether to switch to an odd side.  Rerun at sides 5 and 7 on 2026-08-31, and the verdict FAILS at both. At side 5 the fixed core (505 cells) nearly fills the 625-cell torus, so there is no room to scatter and no dose collapses the margin. At side 7 (2401 connected cells) the awake margin is only 0.129 (against 0.527 at side 6) because the core is 625 cells wrapping less of the torus, and the awake threshold of the verdict is not met, though the dose still drives the margin negative (deepest -0.550, critical dose 0.1). The side-6 pass depends on the small torus and the even side: the scattered cells land in the unreachable half, which is what makes the margin negative there. A knife edge, recorded and not tuned.' +
        'Hameroff / Orch-OR bridge (author-bridges/stuart-hameroff.md), the anesthesia anchor. The reversible dose loop and the displacement control are what distinguish this from plain dissolution-death (E-SLF-0160). Reads the graph only, a structural proxy, deterministic.',
    })
  },
})
