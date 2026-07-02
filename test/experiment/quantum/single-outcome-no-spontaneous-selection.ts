// The single definite outcome, split into the part the committed rule settles and the
// part it cannot. This is the sharp state of the measurement problem's hardest clause.
//
// The puzzle "why one outcome, not a superposition" has two separable pieces on this
// substrate, and this experiment locates the boundary between them precisely.
//
//   PIECE ONE, resolved: the rule is deterministic, so a FIXED microstate gives exactly
//   one definite record. There is never an ontological superposition of outcomes, only
//   ignorance of the microstate. With a one-sided drain the coarse pointer settles to a
//   definite non-zero value, reproducibly (same input, same output). A single outcome
//   exists because determinism gives one.
//
//   PIECE TWO, open: a genuine measurement must SELECT one branch among symmetric
//   alternatives (the detector could have gone either way, and does go one way). The
//   committed reversible rule does NOT provide this. With two symmetric drains and a
//   left-right symmetric ready-state the pointer stays EXACTLY zero across every phase,
//   the rule preserves the symmetry perfectly and never chooses a side. And a
//   microscopic seed on that symmetric state is NOT amplified into a macroscopic branch,
//   the shift stays microscopic. Spontaneous symmetry breaking is forbidden here by
//   reversibility plus conservation, so a bistable "sensitive detector" needs a
//   metastable amplifier the bare rule lacks.
//
// So the honest headline: the single outcome is determinism (piece one), but the
// SELECTION among alternatives (piece two) is the precise open obstruction, and it is
// the SAME obstruction as the three-generation distinction (E-SPN-0039), a reversible
// deterministic symmetry cannot spontaneously break itself. Naming this shared root is
// the contribution.
//
// Grade L2, an honest negative with controls: it measures that the reversible rule
// settles a definite record (piece one, the control) yet cannot select among symmetric
// alternatives (piece two, the negative), pinning the obstruction rather than papering
// over it. This does not add a collapse law and does not claim the Born weights, which
// stay the separate open problem (E-QTM-0005, E-QTM-0012).

import { d4Mesh } from '@/code/tool/mesh'
import { makeWill, fillWillPattern, cloneWill } from '@/code/tone/will'
import { pairCollision, type Collision } from '@/code/rule/collision'
import { streamSourceTable } from '@/code/rule/lattice-gas'
import {
  settledSignedPointer,
  symmetriseLeftRight,
} from '@/code/dynamics/measurement'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'quantum/single-outcome-no-spontaneous-selection',
  code: 'E-QTM-0043',
  title:
    'the single measurement outcome is determinism (a one-sided drain settles a definite reproducible record), but SELECTION among symmetric alternatives is not provided by the reversible rule (symmetric drains hold the pointer at exactly zero and a microscopic seed is not amplified), the same no-spontaneous-breaking obstruction as the three generations',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 6
    const beats = 200
    const mesh = d4Mesh({ side })
    const degree = mesh.degree
    const opposite = Array.from({ length: degree }, (_, d) => mesh.opposite(d))
    const forward: Collision = pairCollision({ opposite, forward: true })
    const table = streamSourceTable(mesh)

    const phases = Array.from({ length: 10 }, (_, k) => (k * Math.PI) / 5)

    // PIECE ONE (control): a one-sided drain (only x=0 open) settles a DEFINITE record.
    const oneSided = phases.map(phase => {
      const init = makeWill(mesh)
      fillWillPattern(init, phase)

      return settledSignedPointer({ init, forward, table, beats, drains: [0] })
    })

    const definiteRecord = Math.min(...oneSided.map(Math.abs))

    // determinism: the same microstate gives the identical outcome twice.
    const detInit = makeWill(mesh)
    fillWillPattern(detInit, Math.PI / 3)

    const runA = settledSignedPointer({ init: detInit, forward, table, beats, drains: [0] })
    const runB = settledSignedPointer({ init: cloneWill(detInit), forward, table, beats, drains: [0] })
    const deterministic = Math.abs(runA - runB)

    // PIECE TWO (the negative): symmetric drains (both ends open) + a symmetric
    // ready-state. Does the rule spontaneously choose a side?
    const symmetric = phases.map(phase => {
      const init = makeWill(mesh)
      fillWillPattern(init, phase)
      symmetriseLeftRight(init)

      return settledSignedPointer({ init, forward, table, beats, drains: [0, side - 1] })
    })

    const maxSpontaneous = Math.max(...symmetric.map(Math.abs))

    // and does a MICROSCOPIC seed on the symmetric state get amplified into a branch?
    const seededShift = phases.slice(0, 3).map(phase => {
      const base = makeWill(mesh)
      fillWillPattern(base, phase)
      symmetriseLeftRight(base)

      const bare = settledSignedPointer({ init: cloneWill(base), forward, table, beats, drains: [0, side - 1] })

      const seeded = cloneWill(base)
      seeded.data[degree] = 1 // flip one slot in the low-x half (cell 1 is at x=1)

      const tipped = settledSignedPointer({ init: seeded, forward, table, beats, drains: [0, side - 1] })

      return Math.abs(tipped - bare)
    })

    const maxAmplification = Math.max(...seededShift)

    // 1. piece one: a one-sided drain settles a definite, reproducible record.
    const settlesDefinite = definiteRecord > 0.05 && deterministic < 1e-9

    // 2. piece two, the negative: symmetric drains hold the pointer at exactly zero.
    const noSpontaneousChoice = maxSpontaneous < 1e-6

    // 3. piece two, sharpened: a microscopic seed is NOT amplified to a macro branch.
    const noAmplification = maxAmplification < 1e-2

    const solved = settlesDefinite && noSpontaneousChoice && noAmplification

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the single measurement outcome splits into determinism (a one-sided drain settles a definite reproducible record, so one outcome exists because the rule is deterministic) and SELECTION among symmetric alternatives (which the reversible rule does not provide, symmetric drains with a symmetric ready-state hold the pointer at exactly zero across every phase and a microscopic seed is not amplified into a macroscopic branch), so the why-this-branch piece of the measurement problem is the precise open obstruction, forbidden here by reversibility plus conservation, the same no-spontaneous-symmetry-breaking obstruction as the three generations',
      metrics: {
        definiteRecordMinMagnitude: Number(definiteRecord.toFixed(4)),
        determinismError: deterministic,
        maxSpontaneousPointer: Number(maxSpontaneous.toExponential(2)),
        maxSeedAmplification: Number(maxAmplification.toExponential(2)),
      },
      control: {
        // The one-sided drain is the control: it DOES settle a definite record (piece
        // one works), so the symmetric-drain zero is a real inability to select, not a
        // dead or trivial dynamics. If even the one-sided drain gave zero, the pointer
        // measure would be broken rather than the selection being absent.
        oneSidedDefiniteRecord: Number(definiteRecord.toFixed(4)),
        symmetricSpontaneousPointer: Number(maxSpontaneous.toExponential(2)),
      },
      notes:
        'L2, an honest negative that pins the obstruction. Piece one (determinism gives one outcome) is resolved and is the control. Piece two (selection among symmetric alternatives) is not provided by the reversible rule: symmetric drains preserve the symmetry to machine precision and a microscopic seed is not amplified. Spontaneous symmetry breaking is forbidden by reversibility plus conservation, so a bistable detector needs a metastable amplifier the bare rule lacks. This is the SAME root as the three-generation distinction obstruction (E-SPN-0039). No collapse law is added and the Born weights stay the separate open problem (E-QTM-0005, E-QTM-0012). Deterministic throughout, the ensemble varies the ready-state phase, never a random seed.',
    })
  },
})
