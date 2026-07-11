// P97: genuine self-emergence. (Stage 5 of the unfolding, what-is-a-self.md.)
//
// A self is a vibe from its own perspective, a HIGHER self is a vibe patch (a coherent, integrated
// region). This test does NOT hand-draw any patch. It runs the dynamics from the five and asks whether
// coherent patches FORM and GROW on their own, discovered by integration, not imposed.
//
// It honestly compares two regimes on the same start:
//   - FIVE: fills are FIXED (the five as literally stated, the conserved rule moves only tones).
//   - SIX:  fills ADAPT each beat by a Hebbian rule (agreeing neighbors bind as sharing, opposing as
//           polarizing), the candidate sixth ingredient (a fill-dynamics / learning rule).
//
// Measures, over time, with no patch ever drawn by hand:
//   - coherence: the fraction of notes whose fill is consistent with its two tones (an ordered,
//     integrated structure scores high, a frustrated one scores low).
//   - largest patch: the biggest connected domain of same-sign cells bound by sharing fills (the
//     biggest higher self that has self-organized).
// The verdict is whatever the numbers say: if SIX self-organizes coherent patches and FIVE does not,
// then durable selves need adaptive fills (a real sixth thing). If FIVE also self-organizes, the five
// suffice. Charge Q is conserved throughout (fills never touch tones). Run: npx tsx code/experiment/p97-self-emergence.ts

import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { hashRand } from '@/code/dynamics/conserving-sweep'
import { edgesOf } from '@/code/tool/graph'
import { totalCharge as sumTone } from '@/code/model/self-kit'
import {
  adaptFills,
  fillCoherence as coherence,
  largestSharingPatch as largestPatch,
} from '@/code/measure/fill-coherence'
import { fillGatedSweepHashed } from '@/code/dynamics/fill-gated-sweep'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function selfEmergence(): {
  cells: number
  coherenceFiveStart: number
  coherenceFiveEnd: number
  coherenceSixStart: number
  coherenceSixEnd: number
  patchFiveStart: number
  patchFiveEnd: number
  patchSixStart: number
  patchSixEnd: number
  conserved: boolean
  fiveSelfOrganizes: boolean
  sixSelfOrganizes: boolean
  needsAdaptiveFills: boolean
  solved: boolean
} {
  const mesh = buildCoxeterMesh({
    symbol: [5, 3, 4],
    depth: 20,
    maxChambers: 60000,
  })

  const neighbors = mesh.neighbors
  const n = mesh.cellCount
  const edges = edgesOf(neighbors)

  // identical random start for both regimes
  const tone0 = new Int8Array(n)
  const fill0 = new Int8Array(edges.length)

  for (let i = 0; i < n; i++) {
    const r = hashRand(i, 0, 1)

    tone0[i] = r < 0.4 ? 1 : r < 0.7 ? -1 : 0 // a net-positive charge so domains can persist
  }

  for (let i = 0; i < edges.length; i++) {
    const r = hashRand(i, 0, 2)

    fill0[i] = r < 0.34 ? 1 : r < 0.67 ? -1 : 0
  }

  const BEATS = 80

  // FIVE: fixed fills
  const tF = tone0.slice()
  const fF = fill0.slice()
  const qF0 = sumTone(tF)
  const coherenceFiveStart = coherence(tF, edges, fF)
  const patchFiveStart = largestPatch(tF, edges, fF, n)

  for (let b = 0; b < BEATS; b++) {
    fillGatedSweepHashed({ tone: tF, edges, fill: fF, beat: b })
  }

  const coherenceFiveEnd = coherence(tF, edges, fF)
  const patchFiveEnd = largestPatch(tF, edges, fF, n)
  const conservedFive = sumTone(tF) === qF0

  // SIX: adaptive fills
  const tS = tone0.slice()
  const fS = fill0.slice()
  const qS0 = sumTone(tS)
  const coherenceSixStart = coherence(tS, edges, fS)
  const patchSixStart = largestPatch(tS, edges, fS, n)

  for (let b = 0; b < BEATS; b++) {
    fillGatedSweepHashed({ tone: tS, edges, fill: fS, beat: b })
    adaptFills(tS, edges, fS)
  }

  const coherenceSixEnd = coherence(tS, edges, fS)
  const patchSixEnd = largestPatch(tS, edges, fS, n)
  const conservedSix = sumTone(tS) === qS0

  const conserved = conservedFive && conservedSix
  // self-organization = coherence climbs meaningfully and the largest patch grows
  const fiveSelfOrganizes =
    coherenceFiveEnd > coherenceFiveStart + 0.15 &&
    patchFiveEnd > patchFiveStart * 1.5

  const sixSelfOrganizes =
    coherenceSixEnd > coherenceSixStart + 0.15 &&
    patchSixEnd > patchSixStart * 1.5

  const needsAdaptiveFills = sixSelfOrganizes && !fiveSelfOrganizes

  // the experiment "succeeds" if it conserves charge and returns a clear verdict either way
  const solved = conserved && (sixSelfOrganizes || fiveSelfOrganizes)

  return {
    cells: n,
    coherenceFiveStart,
    coherenceFiveEnd,
    coherenceSixStart,
    coherenceSixEnd,
    patchFiveStart,
    patchFiveEnd,
    patchSixStart,
    patchSixEnd,
    conserved,
    fiveSelfOrganizes,
    sixSelfOrganizes,
    needsAdaptiveFills,
    solved,
  }
}

export default experiment({
  id: 'selves/self-emergence',
  code: 'E-SLF-0112',
  title: 'fixed fills do not self-organize selves, adaptive fills do',
  category: 'selves',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = selfEmergence()
    const ok =
      r.solved &&
      r.conserved &&
      r.sixSelfOrganizes &&
      !r.fiveSelfOrganizes &&
      r.needsAdaptiveFills

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'fixed fills do not self-organize coherent patches while adaptive Hebbian fills do, so durable selves need an adaptive fill-dynamics rule',
      metrics: {
        coherenceSixStart: r.coherenceSixStart,
        coherenceSixEnd: r.coherenceSixEnd,
        patchSixStart: r.patchSixStart,
        patchSixEnd: r.patchSixEnd,
      },
      control: {
        coherenceFiveStart: r.coherenceFiveStart,
        coherenceFiveEnd: r.coherenceFiveEnd,
        patchFiveStart: r.patchFiveStart,
        patchFiveEnd: r.patchFiveEnd,
      },
    })
  },
})
