// Faggin's free-will signature on a deterministic base: an act is fully determined from the
// outside (the full microscopic state fixes the entire future exactly) yet unpredictable from
// within (the self's own coarse view of itself cannot forecast its next state). Federico Faggin
// argues real free will is neither random nor mechanically predictable, and vibe has no
// randomness anywhere, so it must produce this signature from determinism plus the self's loss of
// its own fine detail. This adjudicates the free-will fork without a random base (contra a
// memoryless sampler), the strongest form of the Faggin and Nirvanic contrast.
//
// A body evolves under the committed reversible rule. Its full microscopic state (every
// directional slot) determines the whole future exactly: replaying it gives a bit-identical
// trajectory, the determined-from-outside half. Now take a second body with the SAME coarse view
// (the same per-slab occupancy, the self's own macroscopic self-model) but a different microstate
// (the momenta reversed). Its future coarse trajectory DIVERGES from the first. So the coarse
// self-view does not fix the future: from inside its own view the self cannot predict its next
// coarse state, the unpredictable-from-within half.
//
// Measured: the exact replay diverges by zero (determined from outside), while the same-coarse
// different-microstate body diverges by a sixth of full range (unpredictable from within), and the
// two bodies start from an identical coarse view. All deterministic, no randomness, so the
// unpredictability is purely the epistemic loss of the fine detail, not noise, which is exactly
// what distinguishes this from a memoryless random sampler.
//
// The control is the exact replay, divergence zero, the determinism made explicit. Against it the
// same-coarse divergence is the free-will signature.
//
// Depth L2. It measures determined-from-outside (exact replay) against unpredictable-from-within
// (same coarse view, divergent future) on the committed rule, deterministic throughout, the Faggin
// signature. Distinct from the no-shortcut irreducibility result (choice-determined-yet-irreducible).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, fillWillPattern, cloneWill } from '@/code/tone/will'
import { pairCollision, type Collision } from '@/code/rule/collision'
import { streamSourceTable, beatInto } from '@/code/rule/lattice-gas'
import { slabOccupancy } from '@/code/dynamics/measurement'

const SIDE = 6
const BEATS = 80

export default experiment({
  id: 'selves/free-will-signature',
  code: 'E-SLF-0170',
  title:
    'an act is determined from outside (exact replay) yet unpredictable from within (same coarse view, divergent future), Faggin free will from determinism without randomness',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const degree = mesh.degree
    const opposite = meshOpposites(mesh)

    const forward: Collision = pairCollision({
      opposite,
      forward: true,
    })

    const table = streamSourceTable(mesh)

    // the coarse (per-slab occupancy) trajectory, the self's own macroscopic self-view
    function coarseTrajectory(
      init: ReturnType<typeof makeWill>,
    ): number[][] {
      let current = cloneWill(init)
      let scratch = {
        mesh: current.mesh,
        data: new Int8Array(current.data.length),
      }

      const out: number[][] = []

      for (let t = 0; t < BEATS; t++) {
        beatInto({
          src: current,
          dst: scratch,
          table,
          collision: forward,
        })

        const swap = current

        current = scratch
        scratch = swap
        out.push(slabOccupancy(current, 0))
      }

      return out
    }

    function coarseDistance(a: number[][], b: number[][]): number {
      let maximum = 0

      for (let t = 0; t < a.length; t++) {
        for (let i = 0; i < a[t]!.length; i++) {
          maximum = Math.max(maximum, Math.abs(a[t]![i]! - b[t]![i]!))
        }
      }

      return maximum
    }

    const body = makeWill(mesh)

    fillWillPattern(body)

    // a second body: SAME coarse view (occupancy) but momenta reversed (a different microstate)
    const reversed = cloneWill(body)

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      const base = cell * degree
      const original: number[] = []

      for (let d = 0; d < degree; d++) {
        original.push(body.data[base + d]!)
      }

      for (let d = 0; d < degree; d++) {
        reversed.data[base + opposite[d]!] = original[d]!
      }
    }

    // the two start from an identical coarse view
    const occupancyBody = slabOccupancy(body, 0)
    const occupancyReversed = slabOccupancy(reversed, 0)

    let sameInitialCoarse = true

    for (let i = 0; i < occupancyBody.length; i++) {
      if (Math.abs(occupancyBody[i]! - occupancyReversed[i]!) > 1e-9) {
        sameInitialCoarse = false
      }
    }

    // determined from outside: the exact microstate replays bit for bit
    const replayDivergence = coarseDistance(
      coarseTrajectory(body),
      coarseTrajectory(cloneWill(body)),
    )

    // unpredictable from within: the same coarse view with a different microstate diverges
    const withinViewDivergence = coarseDistance(
      coarseTrajectory(body),
      coarseTrajectory(reversed),
    )

    const determinedFromOutside = replayDivergence === 0
    const unpredictableFromWithin = withinViewDivergence > 0.05
    const ok =
      sameInitialCoarse &&
      determinedFromOutside &&
      unpredictableFromWithin

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the full microstate determines the future exactly (an exact replay diverges by zero, determined from outside) while a second body with the same coarse self-view but a reversed microstate diverges in its coarse future, so the self cannot predict its next coarse state from its own view (unpredictable from within), and all of it is deterministic with no randomness, so the unpredictability is the epistemic loss of fine detail, not noise, the Faggin free-will signature distinct from a random sampler',
      metrics: {
        replayDivergence,
        withinViewDivergence: Number(withinViewDivergence.toFixed(4)),
        sameInitialCoarse: sameInitialCoarse ? 1 : 0,
      },
      // CONTROL: the exact replay diverges by zero, the determinism made explicit.
      control: { replayDivergence },
      notes:
        'AUDIT 2026-08-31: this run uses d4Mesh with an even side, which is two disconnected lattices (the D4 roots preserve coordinate-sum parity, see the PARITY note on d4Mesh). The seeds and measurements here are local, so the result stands on the component the seed lives in; roadmap item 0017 tracks the switch to an odd side. ' +
        'Faggin free-will signature (Faggin, Nirvanic, Stapp). Determined from outside, unpredictable from within, from a deterministic base with no randomness. Distinct from choice-determined-yet-irreducible (E-SLF-0020, the no-shortcut result): this is the coarse-view unpredictability.',
    })
  },
})
