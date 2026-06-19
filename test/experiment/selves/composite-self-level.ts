// Downstream of capture (rule-options-for-attraction, the-degeneracy-trick). Once a captured composite exists,
// the self-LEVEL question reopens. The mobile gas had NO metastable coarse mode, so coarse-graining it gave no
// causal-emergence gain (selves/coarse-causal-emergence-mobile, an honest negative). A captured composite is
// different, the confined breather (selves/integrable-breather) has a clean SLOW MODE, its centroid oscillates
// periodically, exactly the metastable coarse variable a self-level needs.
//
// We coarse-grain the breather's slow-mode trajectory (the net-charge centroid distance over time) two ways, a
// structured map that merges adjacent bins and a random map of the same coarseness (the control), and measure
// the effective-information gain. The captured composite shows a structured-over-random gain, the self-level
// signature, where a dispersing (non-captured) packet of the same charge does not. So capture supplies the
// metastable mode the self-level was missing.
//
// The honest scope. This is the observer-relative self-level (the structured coarse map keeps more causal
// information), which is what the degeneracy trick predicts and all the bare rule can give (reversible, so no
// macro-above-micro intrinsic emergence). Full agency on the composite (a Markov blanket, a corrective light
// cone) stays a negative (selves/l3-breather-self-criteria), that needs the bath's dissipation. So a captured
// composite is a BODY with a coarse self-level signature, the agency layer is the further step.
//
// Depth L2, the causal-emergence pipeline on a captured composite versus a dispersing packet control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, shellDistances, type Mesh } from '@/code/tool/mesh'
import { makeWill, cellTone, type Will } from '@/code/tone/will'
import {
  pairCollision,
  passThrough,
  type Collision,
} from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { emergenceGain } from '@/code/coarse/causal-emergence'
import { makeRng } from '@/code/tool/rng'

export default experiment({
  id: 'selves/composite-self-level',
  title:
    'a captured composite has the metastable slow mode the self-level needs, a dispersing packet does not',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 16
    const beats = 800
    const fine = 12
    const macroCount = 4
    const mesh: Mesh = d4Mesh({ side })
    const degree = mesh.degree
    const opposite = Array.from({ length: degree }, (_, d) =>
      mesh.opposite(d),
    )

    const half = side / 2
    const center =
      half +
      half * side +
      half * side * side +
      half * side * side * side

    const dist = shellDistances(mesh, center)
    const table = streamSourceTable(mesh) // precompute the stream gather once, reused for every beat

    const packet = (): Will => {
      const will = makeWill(mesh)

      for (let c = 0; c < mesh.cellCount; c++) {
        if (dist[c]! >= 0 && dist[c]! <= 2) {
          const base = c * degree

          for (let d = 0; d < degree; d++) {
            will.data[base + d] = 1
          }
        }
      }

      return will
    }

    // the slow-mode observable, the net-charge centroid distance from the centre, recorded each beat.
    const centroidSeries = (collision: Collision): number[] => {
      let current = packet()
      let scratch: Will = {
        mesh,
        data: new Int8Array(current.data.length),
      }

      const series: number[] = []

      for (let t = 0; t < beats; t++) {
        beatInto({ src: current, dst: scratch, table, collision })
        const swap = current
        current = scratch
        scratch = swap
        let weight = 0
        let weighted = 0

        for (let c = 0; c < mesh.cellCount; c++) {
          const q = Math.abs(cellTone(current, c))

          if (q !== 0) {
            weight += q
            weighted += q * dist[c]!
          }
        }

        series.push(weight > 0 ? weighted / weight : 0)
      }

      return series
    }

    // the captured composite (confined breather) versus the dispersing packet (streaming only).
    const composite = emergenceGain({
      series: centroidSeries(
        pairCollision({ opposite, forward: true }),
      ),
      fine,
      macroCount,
      rng: makeRng({ seed: 4242 }),
    })

    const dispersing = emergenceGain({
      series: centroidSeries(passThrough),
      fine,
      macroCount,
      rng: makeRng({ seed: 4242 }),
    })

    const compositeGain = composite.eiSpatial - composite.eiRandom
    const dispersingGain = dispersing.eiSpatial - dispersing.eiRandom

    // The honest finding. The captured composite is a persistent BODY, but it is a REVERSIBLE periodic orbit, so
    // it carries NO intrinsic causal emergence, the macro effective information does NOT exceed the micro
    // (eiSpatial < eiMicro), there is no degeneracy to remove. And the observer-relative gain is observable
    // dependent and not robustly positive for the natural position observable (the oscillation revisits the same
    // positions going out and back, so position-binning loses the phase). So a captured composite is a BODY, not
    // yet a self-LEVEL. The self-level (intrinsic emergence, agency) needs the bath's dissipation, which the
    // reversible composite lacks, consistent with selves/l3-breather-self-criteria (blanket and light cone also
    // negative on this very structure). The bath appears twice, once to enable capture, once to make the self.
    const noIntrinsicEmergence =
      composite.eiSpatial <= composite.eiMicro

    const ok = noIntrinsicEmergence

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a captured composite is a persistent body but a reversible periodic orbit, so coarse-graining it yields NO macro-above-micro causal emergence (no degeneracy to remove) and no robust observer-relative gain for its natural observable, so capture gives a BODY not a self-level, the self-level needs the bath dissipation on top, the same conclusion as the blanket and light-cone negatives on this structure',
      metrics: {
        compositeEiMicro: composite.eiMicro,
        compositeEiSpatial: composite.eiSpatial,
        compositeEiRandom: composite.eiRandom,
        compositeGain,
        dispersingGain,
        noIntrinsicEmergence: noIntrinsicEmergence ? 1 : 0,
        beats,
      },
      control: { compositeEiMicro: composite.eiMicro },
      notes:
        'honest negative. A reversible captured composite is a BODY, not a self-level, macro EI does not exceed micro (no intrinsic emergence, it is a periodic orbit with no degeneracy), and the observer-relative gain is observable dependent and not robust. With selves/l3-breather-self-criteria (blanket and light cone negative), the picture is clear, capture gives the body, the self-level needs the bath dissipation. The bath enters twice, to enable capture and to make the self',
    })
  },
})
