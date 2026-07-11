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
//   dynamically mirror-symmetric ready state the pointer stays EXACTLY zero, and a
//   microscopic seed on that symmetric state is NOT amplified into a macroscopic
//   branch. This is checked on TWO kinds of ready state: the homogeneous ensemble
//   (where the zero is protected by translation symmetry) and a STRUCTURED
//   cell-varying state made dynamically mirror-symmetric (positions mirrored in x,
//   direction slots mapped through the x-reflection of the coin, and the tone negated
//   on x-carrying lines, the exact symmetry that commutes with the pair table). The
//   zero holds on both, so the no-selection is not an artefact of homogeneity.
//
// So the honest headline: the single outcome is determinism (piece one), but the
// SELECTION among alternatives (piece two) is the precise open obstruction, and it is
// the SAME obstruction as the three-generation distinction (E-SPN-0039), a reversible
// deterministic symmetry cannot spontaneously break itself. Naming this shared root is
// the contribution.
//
// Grade L1, an honest negative with controls. The zero pointer is symmetry-protected
// in both cases: the ready states are exact fixed points of a symmetry the dynamics
// preserves, so the result verifies that the rule respects its symmetry (as a
// deterministic symmetric rule must) rather than measuring a contingent dynamical
// fact. The dynamical content is the seed test (a microscopic asymmetry is not
// amplified) and the one-sided control (the pointer measure does register records).

import { d4Mesh } from '@/code/tool/mesh'
import { makeWill, fillWillPattern, cloneWill } from '@/code/tone/will'
import { pairCollision, type Collision } from '@/code/rule/collision'
import { streamSourceTable } from '@/code/rule/lattice-gas'
import {
  settledSignedPointer,
  symmetriseLeftRight,
} from '@/code/dynamics/measurement'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'quantum/single-outcome-no-spontaneous-selection',
  code: 'E-QTM-0043',
  title:
    'the single measurement outcome is determinism (a one-sided drain settles a definite reproducible record), but SELECTION among symmetric alternatives is not provided by the reversible rule (symmetric drains hold the pointer at exactly zero, on the homogeneous ensemble and on a structured dynamically mirror-symmetric state, and a microscopic seed is not amplified), the same no-spontaneous-breaking obstruction as the three generations',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const side = 6
    const beats = 200
    const mesh = d4Mesh({ side })
    const degree = mesh.degree
    const opposite = Array.from({ length: degree }, (_, d) =>
      mesh.opposite(d),
    )

    const forward: Collision = pairCollision({
      opposite,
      forward: true,
    })

    const table = streamSourceTable(mesh)

    // INTEGER phase shifts of the period-3 fill. The fill is ((index + phase) % 3) - 1,
    // so integer phases give exactly 3 distinct patterns (phase 3 repeats phase 0), and
    // that is the whole ensemble. Float phases truncated into the Int8Array would only
    // masquerade as more.
    const phases = [0, 1, 2]

    // PIECE ONE (control): a one-sided drain (only x=0 open) settles a DEFINITE record.
    const oneSided = phases.map(phase => {
      const init = makeWill(mesh)

      fillWillPattern(init, phase)

      return settledSignedPointer({
        init,
        forward,
        table,
        beats,
        drains: [0],
      })
    })

    const definiteRecord = Math.min(...oneSided.map(Math.abs))

    // determinism: the same microstate gives the identical outcome twice.
    const detInit = makeWill(mesh)

    fillWillPattern(detInit, 1)

    const runA = settledSignedPointer({
      init: detInit,
      forward,
      table,
      beats,
      drains: [0],
    })

    const runB = settledSignedPointer({
      init: cloneWill(detInit),
      forward,
      table,
      beats,
      drains: [0],
    })

    const deterministic = Math.abs(runA - runB)

    // PIECE TWO (the negative): symmetric drains (both ends open) + a symmetric
    // ready-state. Does the rule spontaneously choose a side?
    //
    // (a) the homogeneous ensemble: every cell identical, so the zero is protected by
    // translation symmetry.
    const symmetric = phases.map(phase => {
      const init = makeWill(mesh)

      fillWillPattern(init, phase)
      symmetriseLeftRight(init)

      return settledSignedPointer({
        init,
        forward,
        table,
        beats,
        drains: [0, side - 1],
      })
    })

    const maxSpontaneousHomogeneous = Math.max(
      ...symmetric.map(Math.abs),
    )

    // (b) a STRUCTURED cell-varying state made dynamically mirror-symmetric. A
    // position-only mirror is NOT dynamically symmetric (it drifts to a pointer of
    // order 1e-2, measured), because the x-reflection also swaps the orientation of
    // every x-carrying opposite-direction line and the pair table is not
    // swap-symmetric. The table DOES commute with slot-swap plus tone negation, so
    // the exact mirror maps direction d to its x-reflected direction and negates the
    // tone on x-carrying lines. A state fixed by that symmetry is dynamically
    // symmetric, and the drains at x = 0 and x = side - 1 are mirror images.
    const roots = rootsD4()
    const mirrorDirection = roots.map(root =>
      roots.findIndex(
        other =>
          other[0] === -(root[0] ?? 0) &&
          other[1] === (root[1] ?? 0) &&
          other[2] === (root[2] ?? 0) &&
          other[3] === (root[3] ?? 0),
      ),
    )

    const carriesX = roots.map(root => (root[0] ?? 0) !== 0)

    const structured = makeWill(mesh)

    // a cell-varying pattern (period 5 does not divide the degree 24, so cells differ)
    for (let i = 0; i < structured.data.length; i++)
      structured.data[i] = ((i % 5) % 3) - 1

    // overwrite the high-x half with the exact dynamical mirror of the low-x half
    for (let cell = 0; cell < mesh.cellCount; cell++) {
      const x = cell % side

      if (x >= side / 2) {
        const mirrorCell = cell - x + (side - 1 - x)

        for (let d = 0; d < degree; d++) {
          const sourceD = mirrorDirection[d]!
          const sign = carriesX[d] ? -1 : 1

          structured.data[cell * degree + d] =
            sign * structured.data[mirrorCell * degree + sourceD]!
        }
      }
    }

    const structuredPointer = settledSignedPointer({
      init: cloneWill(structured),
      forward,
      table,
      beats,
      drains: [0, side - 1],
    })

    const maxSpontaneous = Math.max(
      maxSpontaneousHomogeneous,
      Math.abs(structuredPointer),
    )

    // and does a MICROSCOPIC seed on a symmetric state get amplified into a branch?
    // Checked on the homogeneous ensemble and on the structured symmetric state.
    const seededShift = [
      ...phases.map(phase => {
        const base = makeWill(mesh)

        fillWillPattern(base, phase)
        symmetriseLeftRight(base)

        return base
      }),
      cloneWill(structured),
    ].map(base => {
      const bare = settledSignedPointer({
        init: cloneWill(base),
        forward,
        table,
        beats,
        drains: [0, side - 1],
      })

      const seeded = cloneWill(base)

      seeded.data[degree] = 1 // flip one slot in the low-x half (cell 1 is at x=1)

      const tipped = settledSignedPointer({
        init: seeded,
        forward,
        table,
        beats,
        drains: [0, side - 1],
      })

      return Math.abs(tipped - bare)
    })

    const maxAmplification = Math.max(...seededShift)

    // 1. piece one: a one-sided drain settles a definite, reproducible record.
    const settlesDefinite =
      definiteRecord > 0.05 && deterministic < 1e-9

    // 2. piece two, the negative: symmetric drains hold the pointer at exactly zero,
    //    on the homogeneous ensemble AND on the structured mirror-symmetric state.
    const noSpontaneousChoice = maxSpontaneous < 1e-6

    // 3. piece two, sharpened: a microscopic seed is NOT amplified to a macro branch.
    const noAmplification = maxAmplification < 1e-2

    const solved =
      settlesDefinite && noSpontaneousChoice && noAmplification

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the single measurement outcome splits into determinism (a one-sided drain settles a definite reproducible record, so one outcome exists because the rule is deterministic) and SELECTION among symmetric alternatives (which the reversible rule does not provide, symmetric drains hold the pointer at exactly zero on the homogeneous ensemble and on a structured cell-varying state made dynamically mirror-symmetric, and a microscopic seed is not amplified into a macroscopic branch), so the why-this-branch piece of the measurement problem is the precise open obstruction, forbidden here by reversibility plus conservation, the same no-spontaneous-symmetry-breaking obstruction as the three generations',
      metrics: {
        definiteRecordMinMagnitude: Number(definiteRecord.toFixed(4)),
        determinismError: deterministic,
        maxSpontaneousPointerHomogeneous: Number(
          maxSpontaneousHomogeneous.toExponential(2),
        ),
        structuredSymmetricPointer: Number(
          Math.abs(structuredPointer).toExponential(2),
        ),
        maxSeedAmplification: Number(maxAmplification.toExponential(2)),
        distinctReadyPatterns: phases.length,
      },
      control: {
        // The one-sided drain is the control: it DOES settle a definite record (piece
        // one works), so the symmetric-drain zero is a real inability to select, not a
        // dead or trivial dynamics. If even the one-sided drain gave zero, the pointer
        // measure would be broken rather than the selection being absent.
        oneSidedDefiniteRecord: Number(definiteRecord.toFixed(4)),
        symmetricSpontaneousPointer: Number(
          maxSpontaneous.toExponential(2),
        ),
      },
      notes:
        'L1, an honest negative that pins the obstruction. Piece one (determinism gives one outcome) is resolved and is the control. Piece two (selection among symmetric alternatives) is not provided by the reversible rule. The ready-state ensemble is the 3 distinct integer phase shifts of the period-3 fill (all that exist, every cell identical, so those zeros are translation-symmetry-protected), PLUS a structured cell-varying state made dynamically mirror-symmetric: positions mirrored in x, direction slots mapped through the x-reflection of the D4 coin, and the tone negated on the x-carrying lines, which is the exact symmetry that commutes with the pair table (a position-only mirror is not dynamically symmetric and drifts to a pointer of order 1e-2). The structured symmetric pointer is exactly zero too, so the no-selection holds for a structured detector, not just a homogeneous gas. The zeros are symmetry-protected by construction (a deterministic rule cannot break a symmetry it commutes with), which is why this grades L1: the dynamical content is the seed test (a flipped slot is not amplified) and the one-sided control. Spontaneous symmetry breaking is forbidden by reversibility plus conservation, so a bistable detector needs a metastable amplifier the bare rule lacks. This is the SAME root as the three-generation distinction obstruction (E-SPN-0039). No collapse law is added and the Born weights stay the separate open problem (E-QTM-0005, E-QTM-0012). Deterministic throughout, never a random seed.',
    })
  },
})
