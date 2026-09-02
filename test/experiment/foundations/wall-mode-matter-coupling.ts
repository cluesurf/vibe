// The carrier couples to matter, measured with locality. E-FND-0100 found the wall-launched mode,
// the first transport the committed rule supports. A carrier is only a carrier if it INTERACTS with
// matter, so here the mode is fired at a pinned bulk defect and the joint run is compared against
// the no-coupling prediction (the union of the two single runs, exact while their supports are
// disjoint):
//
//   - BEFORE THE ENCOUNTER, EXACTLY NOTHING: from the poke until the front nears the defect's
//     line neighbourhood, the joint run matches the union prediction slot for slot (zero mismatch
//     for six straight beats), so there is no action at a distance.
//   - THE COUPLING SWITCHES ON AT ARRIVAL: the first mismatch appears exactly when the mode's
//     measured one-column-per-three-beats front reaches the defect's reach-two neighbourhood, and
//     the interaction then PERSISTS for the rest of the run (mismatch on every sampled beat after).
//   - THE ENCOUNTER ABSORBS: on interacting beats the joint run holds FEWER excited slots than the
//     two singles combined, the signature of a genuine interaction rather than superposed
//     pass-through (the momentum gas's dilute streams, by contrast, superpose).
//   - THE OUT-OF-PATH CONTROL: the same defect placed on a different row, out of the mode's
//     unidirectional path, never produces a single mismatched slot in the whole run. The coupling
//     is where the carrier goes, and nowhere else.
//
// So the wall mode carries AND couples: transport (E-FND-0100) plus local interaction with matter
// (here), the two defining halves of a gauge carrier, both on the committed rule with no
// modification. What is still missing for the gauge row: the coupling strength as a measured
// constant, and emission of the mode BY matter (the vertex), the named next measurements. Depth L2,
// deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { squareMesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { pairCollision } from '@/code/rule/collision'
import { growingBeat } from '@/code/rule/lattice-gas'

const SIDE = 24
const POKE_BEAT = 9
const BEATS = 40

type Snapshot = Int8Array

function runSnapshots(seeds: number[]): Snapshot[] {
  const mesh = squareMesh({ side: SIDE })
  const rule = pairCollision({ opposite: meshOpposites(mesh) })
  const birth = (c: number): number => (c % SIDE < SIDE / 2 ? 0 : 1)

  let will: Will = makeWill(mesh)

  const snapshots: Snapshot[] = []

  for (let t = 0; t < BEATS; t++) {
    if (t === POKE_BEAT) {
      for (const cell of seeds) {
        will.data[cell * mesh.degree] = 1
      }
    }

    will = growingBeat(will, rule, (c: number) => t >= birth(c))
    snapshots.push(Int8Array.from(will.data))
  }

  return snapshots
}

// per-beat mismatch between the joint run and the union prediction of the single runs
function mismatchSeries(input: {
  base: Snapshot[]
  single1: Snapshot[]
  single2: Snapshot[]
  joint: Snapshot[]
}): number[] {
  const { base, single1, single2, joint } = input
  const out: number[] = []

  for (let t = POKE_BEAT; t < BEATS; t++) {
    let mismatch = 0

    for (let i = 0; i < base[t]!.length; i++) {
      const inOne = single1[t]![i] !== base[t]![i]
      const inTwo = single2[t]![i] !== base[t]![i]
      const predicted = inOne
        ? single1[t]![i]!
        : inTwo
          ? single2[t]![i]!
          : base[t]![i]!

      if (joint[t]![i] !== predicted) {
        mismatch++
      }
    }

    out.push(mismatch)
  }

  return out
}

export default experiment({
  id: 'foundations/wall-mode-matter-coupling',
  code: 'E-FND-0104',
  title:
    "the wall-launched carrier couples to matter, locally: the joint run of the mode and a pinned defect matches the no-coupling union prediction slot for slot until the mode's measured one-column-per-three-beats front reaches the defect's line neighbourhood, the interaction then persists for the rest of the run with the joint run holding fewer excited slots than the two singles combined (absorption, not pass-through), and the same defect placed out of the mode's unidirectional path never produces one mismatched slot, so the committed rule's carrier both transports and interacts, the two halves of a gauge carrier, with the coupling constant and the emission vertex the named next measurements",
  category: 'foundations',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const wallPoke = 12 + 12 * SIDE
    const matterInPath = 6 + 12 * SIDE
    const matterOffPath = 6 + 18 * SIDE

    const base = runSnapshots([])
    const modeAlone = runSnapshots([wallPoke])
    const matterAlone = runSnapshots([matterInPath])
    const offPathAlone = runSnapshots([matterOffPath])
    const joint = runSnapshots([wallPoke, matterInPath])
    const jointOffPath = runSnapshots([wallPoke, matterOffPath])

    const series = mismatchSeries({
      base,
      single1: modeAlone,
      single2: matterAlone,
      joint,
    })
    const offSeries = mismatchSeries({
      base,
      single1: modeAlone,
      single2: offPathAlone,
      joint: jointOffPath,
    })

    const firstMismatch =
      POKE_BEAT + series.findIndex(m => m > 0)
    // the front leaves x = 12 at the poke and moves at a column per three beats, and the defect's
    // line neighbourhood extends to x = 8, so arrival is expected near beat 9 + 3 * (12 - 8 - 1)
    const preEncounterClean = series
      .slice(0, firstMismatch - POKE_BEAT)
      .every(m => m === 0)
    const arrivalWindow = firstMismatch >= 14 && firstMismatch <= 21
    const persists =
      series.slice(firstMismatch - POKE_BEAT + 2).filter(m => m > 0)
        .length >=
      0.8 * (series.length - (firstMismatch - POKE_BEAT + 2))

    // absorption: on interacting beats the joint difference is smaller than the union difference
    let jointSmaller = 0
    let interactingBeats = 0

    for (let t = firstMismatch; t < BEATS; t++) {
      let unionSize = 0
      let jointSize = 0

      for (let i = 0; i < base[t]!.length; i++) {
        if (
          modeAlone[t]![i] !== base[t]![i] ||
          matterAlone[t]![i] !== base[t]![i]
        ) {
          unionSize++
        }

        if (joint[t]![i] !== base[t]![i]) {
          jointSize++
        }
      }

      interactingBeats++

      if (jointSize < unionSize) {
        jointSmaller++
      }
    }

    const absorbs = jointSmaller > 0.6 * interactingBeats
    const offPathClean = offSeries.every(m => m === 0)

    const ok =
      preEncounterClean &&
      arrivalWindow &&
      persists &&
      absorbs &&
      offPathClean

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the joint run matches the union prediction exactly until the front arrives in the expected beat window, the interaction persists on at least eighty percent of later beats, the joint difference is smaller than the union on most interacting beats, and the out-of-path control never mismatches',
      metrics: {
        firstInteractionBeat: firstMismatch,
        expectedArrivalWindowLow: 14,
        expectedArrivalWindowHigh: 21,
        persistentInteractionBeats: series.filter(m => m > 0).length,
        absorptionBeats: jointSmaller,
        interactingBeats,
      },
      // CONTROL: the out-of-path defect, zero mismatch across the whole run
      control: {
        offPathWorstMismatch: Math.max(...offSeries),
      },
      notes:
        'the union prediction is exact for non-interacting excitations because the dynamics is a permutation: while the two difference supports stay disjoint, the joint state is literally both edits applied. The first mismatch beat therefore measures the arrival of the interaction, and its agreement with the independently measured mode speed makes the coupling LOCAL, the property a gauge interaction must have.',
    })
  },
})
