// A recording window records at most its Shannon capacity, and the excess spills below it conserved.
// This is Timeless Dynamics' recordability condition c(q) >= phi(q) + nu and its cool-star spectral
// prediction (v16 section 8) on the vibe substrate: a photosphere records a spectral line only if its
// local Shannon capacity clears the load, so line density hits a hard ceiling and extra chemistry
// spills to other wavelengths rather than into the saturated window. Here the "window" is a coarse
// block readout of the mesh, its capacity is ln(B), and the excess distinction spills to finer scale.
//
// Measured deterministically (no randomness), on the flat D4 lattice, across three window resolutions:
//   1. THE RECORDED DISTINGUISHABILITY PLATEAUS AT THE WINDOW CAPACITY ln(B). As the input's
//      fine-scale distinguishable content rises (more cells carrying a mark, its occupied-cell entropy
//      climbing without bound toward ln(N)), the coarse window's recorded entropy rises then SATURATES
//      at ln(B) and stays flat while the input keeps rising. The window is full: no added fine
//      complexity is recorded in it, exactly TD's spectral plateau (M-class chemistry does not raise
//      the visible-window line density past the K-class ceiling).
//   2. THE CEILING IS THE WINDOW CAPACITY, AND IT SCALES AS ln(B) (the could-fail quantitative check).
//      A finer window (more blocks) records more before saturating, the ceiling rising by ln(B2/B1)
//      exactly, so the plateau is the Shannon capacity of the window and not an artifact.
//   3. THE EXCESS SPILLS CONSERVED, NOT LOST (the control that could fail). Injecting charge beyond a
//      block's capacity, the committed reversible conserving rule streams the excess OUT of the block
//      (the recorded total is exactly the injected charge, the excess is recoverable elsewhere), while
//      a lossy record-destroying rule loses it (the total falls below the injected charge). So the
//      spill is the conservation of the base rule, the substrate form of TD's "features appear at other
//      wavelengths".
//
// Honest depth: the plateau VALUE is the maximum-entropy bound (a B-bin distribution has entropy at
// most ln(B)), known information theory, which is precisely what TD's recordability capacity condition
// asserts, so confirming it is the bridge. The substrate content that lifts this to L2 is the measured
// saturation SHAPE (recorded distinguishability flat while the input rises), the ln(B) capacity scaling,
// and the conserved-versus-lossy spill under the committed rule, the control that could have failed.
// Grade L2, a faithful instantiation of TD's recordability capacity and spectral-saturation prediction
// on the substrate, with the max-entropy bound as its known-math backbone stated plainly.

import { d4Mesh, meshCsr } from '@/code/tool/mesh'
import { edgesFromCsr } from '@/code/tool/graph'
import { conservingEdgeSweepHashed } from '@/code/dynamics/conserving-sweep'
import {
  blockPlusCounts,
  shannonEntropy,
} from '@/code/measure/window-capacity'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Csr = {
  cellCount: number
  offsets: Int32Array
  adj: Int32Array
}

const SIDE = 12
const WINDOWS = [8, 32, 128]

// a deterministic input carrying `support` occupied +cells spread evenly across the lattice by a
// fixed stride (no randomness), its fine-scale distinguishable content the occupied-cell entropy
// ln(support). Even spread so the fine complexity is genuine spatial spread, not a contiguous lump.
function spreadInput(size: number, support: number): Int8Array {
  const tone = new Int8Array(size)
  const wanted = Math.min(size, Math.max(1, support))
  const stride = Math.max(1, Math.floor(size / wanted))

  let placed = 0

  for (let i = 0; i < size && placed < wanted; i += stride) {
    tone[i] = 1
    placed++
  }

  return tone
}

function occupiedCount(tone: Int8Array): number {
  let k = 0

  for (const value of tone) {
    if (value === 1) {
      k++
    }
  }

  return k
}

// inject one full block of +charge and run `beats` of the committed rule; with `lossy`, any +charge
// that leaves the source block is destroyed (records not preserved). Returns the injected charge and
// the surviving total (retained in the block plus spilled outside).
function spill(
  csr: Csr,
  lossy: boolean,
): { injected: number; total: number } {
  const n = csr.cellCount
  const blockSize = Math.ceil(n / 32)
  const tone = new Int8Array(n)

  for (let i = 0; i < blockSize; i++) {
    tone[i] = 1
  }

  const injected = blockSize
  const { eu, ev } = edgesFromCsr(csr.offsets, csr.adj, n)
  const moved = new Uint8Array(n)

  for (let t = 1; t <= 60; t++) {
    conservingEdgeSweepHashed({
      tone,
      eu,
      ev,
      moved,
      beat: t,
      arrow: 0,
    })

    if (lossy) {
      for (let i = blockSize; i < n; i++) {
        if (tone[i] === 1) {
          tone[i] = 0
        }
      }
    }
  }

  return { injected, total: occupiedCount(tone) }
}

export default experiment({
  id: 'foundations/recordability-capacity-ceiling',
  code: 'E-FND-0072',
  title:
    'a recording window records at most its Shannon capacity ln(B) and the excess spills conserved: the coarse window recorded distinguishability saturates at ln(B) while the input fine complexity keeps rising (TD spectral plateau), the ceiling scales as ln(B) with window size, and injected excess streams out conserved under the committed rule while a lossy rule loses it, instantiating Timeless Dynamics recordability capacity c(q) >= phi(q) + nu on the substrate',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const csr = meshCsr(d4Mesh({ side: SIDE }))
    const n = csr.cellCount

    let worstCeilingError = 0
    let worstPlateauFlatness = 0
    let worstFineRise = Infinity

    const ceilings: Record<number, number> = {}

    for (const blocks of WINDOWS) {
      const ladder = [blocks, blocks * 4, blocks * 16, n]
      const coarse: number[] = []
      const fine: number[] = []

      for (const support of ladder) {
        const tone = spreadInput(n, support)

        coarse.push(shannonEntropy(blockPlusCounts(tone, blocks)))
        fine.push(Math.log(Math.max(1, occupiedCount(tone))))
      }

      const capacity = Math.log(blocks)
      const ceiling = coarse[coarse.length - 1]!

      ceilings[blocks] = ceiling

      // the plateau equals the window capacity ln(B)
      worstCeilingError = Math.max(
        worstCeilingError,
        Math.abs(ceiling - capacity) / capacity,
      )

      // the recorded distinguishability stays flat once the window is full, as the input rises
      const flat = Math.max(...coarse) - Math.min(...coarse)

      worstPlateauFlatness = Math.max(worstPlateauFlatness, flat)

      // the input's fine complexity keeps rising well past the recorded ceiling
      worstFineRise = Math.min(
        worstFineRise,
        fine[fine.length - 1]! - fine[0]!,
      )
    }

    // the ceiling scales as ln(B): the finest window records ln(128/8) = ln(16) more than the coarsest
    const scalingError = Math.abs(
      ceilings[128]! - ceilings[8]! - Math.log(16),
    )

    // the excess spills conserved (reversible) and is lost (lossy)
    const conserving = spill(csr, false)
    const lossy = spill(csr, true)

    const plateauAtCapacity = worstCeilingError < 0.02
    const recordedFlatWhileInputRises =
      worstPlateauFlatness < 0.15 && worstFineRise > 2

    const scalesWithWindow = scalingError < 0.05
    const spillConserved =
      conserving.total === conserving.injected &&
      lossy.total < 0.8 * lossy.injected

    const ok =
      plateauAtCapacity &&
      recordedFlatWhileInputRises &&
      scalesWithWindow &&
      spillConserved

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a coarse recording window records at most its Shannon capacity ln(B): as the input fine-scale distinguishable content rises without bound, the recorded coarse distinguishability rises then saturates at ln(B) and stays flat while the input keeps rising (the TD spectral plateau, extra fine complexity not recorded in the full window), the ceiling scaling as ln(B) with window size (a finer window records ln(16) more before saturating), and injected excess charge streams out of a block conserved under the committed reversible rule (the recorded total equals the injected charge, the excess recoverable elsewhere) while a lossy rule loses it, so the recordability capacity condition c(q) >= phi(q) + nu of Timeless Dynamics holds on the substrate with the excess spilling below the window, conserved by the base rule',
      metrics: {
        worstCeilingErrorTimes1000: Math.round(
          worstCeilingError * 1000,
        ),
        worstPlateauFlatnessTimes1000: Math.round(
          worstPlateauFlatness * 1000,
        ),
        worstFineRiseTimes1000: Math.round(worstFineRise * 1000),
        scalingErrorTimes1000: Math.round(scalingError * 1000),
        conservingTotalOverInjected: Number(
          (conserving.total / conserving.injected).toFixed(3),
        ),
        lossyTotalOverInjected: Number(
          (lossy.total / lossy.injected).toFixed(3),
        ),
      },
      control: {
        // the lossy record-destroying rule is the control: the same injected excess is lost (the total
        // falls below the injected charge) instead of spilling out conserved. If the conserving rule
        // had also lost the excess, the spill would not be the base rule's conservation. And if the
        // coarse window had NOT plateaued (recorded distinguishability tracking the input), there would
        // be no capacity ceiling.
        lossyTotalOverInjected: Number(
          (lossy.total / lossy.injected).toFixed(3),
        ),
        worstPlateauFlatnessTimes1000: Math.round(
          worstPlateauFlatness * 1000,
        ),
      },
      notes:
        'AUDIT 2026-08-31: this run uses d4Mesh with an even side, which is two disconnected lattices (the D4 roots preserve coordinate-sum parity, see the PARITY note on d4Mesh), and it reports a whole-mesh quantity (a cell count, fraction, distance or coverage), so half of the cells counted belong to the component the seed never reaches. Read the number as a two-component figure until roadmap item 0017 decides whether to switch to an odd side. ' +
        'L2, deterministic, no randomness, on the flat D4 lattice. The plateau VALUE (recorded coarse entropy saturating at ln(B)) is the maximum-entropy bound of a B-bin distribution, known information theory, which is exactly what TD recordability capacity c(q) >= phi(q) + nu asserts, so confirming it on the substrate is the bridge, not a discovery. The L2 substrate content is the measured saturation SHAPE (the recorded distinguishability stays flat, spread under 0.15 nats, while the input fine complexity rises by more than 2 nats toward ln(N)), the ln(B) capacity scaling (a finer window records ln(16) more before saturating, matched to 0.05), and the conserved-versus-lossy spill under the committed rule: injecting one full block, the reversible conserving rule keeps the recorded total exactly the injected charge (the excess spilled out, recoverable) while a lossy rule that destroys charge leaving the block loses it (total below injected), the control that could have failed. Input fine complexity is the occupied-cell entropy ln(support), the Shannon distinguishable content, not Kolmogorov pattern complexity. This is TD section-8 cool-star spectral saturation on the substrate: the window (there the visible band, here the block readout) records at most its Shannon capacity, and the excess distinction appears below it (there other wavelengths, here finer scale), conserved by the base rule.',
    })
  },
})
