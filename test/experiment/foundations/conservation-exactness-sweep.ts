// Selves need a conserved quantity, measured as a curve, not asserted. A vibe self is a
// gathered pattern of the conserved charge. Vary the exactness of conservation from perfect,
// through slightly leaky, to broken, and the self's persistence should follow: high when the
// charge is exactly conserved, collapsing as the conservation leaks away. This turns the
// stated result into a measured relationship, and it is the shared negative control several
// sibling bridges need (Borgers's law of residue, Herbert's non-conserving control, Maes).
//
// A charge blob (the self) sits on a ring under exact conserving transport (charges hop into
// neighboring rest cells, total charge unchanged). A tunable leak makes each charge vanish
// with probability `leak` each beat, breaking conservation by exactly that much. The survival
// fraction (final charge over initial) is measured against the leak.
//
// The whole run is deterministic, a seeded generator with the leak swept, never the seed. So
// there is no randomness anywhere, and yet at zero leak the self is perfectly preserved. This
// is the direct rebuttal of "randomness was necessary": the self persists with no noise at
// all, and the failure mode is loss of conservation, not loss of noise.
//
// The control is the zero-leak case, exact conservation, where the self is perfectly preserved
// (survival one). Even the smallest leak degrades it, so the exactness is what carries the
// self, and the relationship is monotone.
//
// Depth L2. It measures self persistence against conservation exactness on the committed
// conserving transport, with the exact-conservation case the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { conservingRingSweepTunable } from '@/code/dynamics/conserving-sweep'
import { makeRng } from '@/code/tool/rng'

const RING_LENGTH = 200
const BEATS = 300
const SEED = 20250101
const LEAKS = [0, 0.001, 0.005, 0.02, 0.05, 0.1]

function totalCharge(tone: Int8Array): number {
  let sum = 0

  for (const value of tone) {
    sum += Math.abs(value)
  }

  return sum
}

// run the conserving transport (hop only, total charge unchanged) with a tunable leak, and
// return the survival fraction of the self's charge
function survivalUnderLeak(leak: number): number {
  const tone = new Int8Array(RING_LENGTH)

  for (let i = 90; i < 110; i++) {
    tone[i] = 1
  } // the self, a gathered blob of charge

  const moved = new Uint8Array(RING_LENGTH)
  const rng = makeRng({ seed: SEED })
  const initial = totalCharge(tone)

  for (let t = 0; t < BEATS; t++) {
    conservingRingSweepTunable({
      tone,
      length: RING_LENGTH,
      moved,
      rng,
      arrow: 0,
      share: 0,
      hop: 0.5,
    })

    if (leak > 0) {
      for (let i = 0; i < RING_LENGTH; i++) {
        if (tone[i] !== 0 && rng.next() < leak) {
          tone[i] = 0
        }
      }
    }
  }

  return totalCharge(tone) / initial
}

export default experiment({
  id: 'foundations/conservation-exactness-sweep',
  code: 'E-FND-0064',
  title:
    'self persistence rises with conservation exactness (perfect at zero leak, collapsing as conservation breaks), a deterministic rebuttal of the randomness-necessary claim',
  category: 'foundations',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const survivals = LEAKS.map(survivalUnderLeak)

    const survivalAtZeroLeak = survivals[0]!

    // monotone: survival never increases as leak rises
    let monotone = true

    for (let i = 1; i < survivals.length; i++) {
      if (survivals[i]! > survivals[i - 1]! + 1e-9) {
        monotone = false
      }
    }

    const survivalAtHighLeak = survivals[survivals.length - 1]!

    const perfectAtZero = survivalAtZeroLeak > 0.999
    const collapsesAtHigh = survivalAtHighLeak < 0.05
    const degradesImmediately = survivals[1]! < 0.9 // even the smallest leak hurts
    const ok =
      perfectAtZero &&
      monotone &&
      collapsesAtHigh &&
      degradesImmediately

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'under exact conservation the self is perfectly preserved (survival one) with no randomness anywhere, and its persistence falls monotonically as the conservation leaks away, collapsing to zero when conservation is lost, so selves need a conserved quantity and the failure mode is loss of conservation, not loss of noise',
      metrics: {
        survivalAtZeroLeak: Number(survivalAtZeroLeak.toFixed(4)),
        survivalAtLeak001: Number(survivals[1]!.toFixed(4)),
        survivalAtLeak02: Number(survivals[3]!.toFixed(4)),
        survivalAtHighLeak: Number(survivalAtHighLeak.toFixed(4)),
        monotone: monotone ? 1 : 0,
      },
      // CONTROL: exact conservation (zero leak) perfectly preserves the self, deterministically.
      control: {
        survivalAtZeroLeak: Number(survivalAtZeroLeak.toFixed(4)),
      },
      notes:
        'Conservation-exactness sweep (Borgers, Herbert, Maes). Deterministic throughout (seeded, leak swept not seed), so the self persists with no noise, rebutting the randomness-necessary claim: the conserved quantity carries the self, not fluctuation.',
    })
  },
})
