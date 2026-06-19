// Piece B of the-initial-state-from-nothing: the FIRST DISTINCTION, the minimal creation event. From the
// all-peace void, the very first charge the arrow produces is a single BALANCED, ADJACENT (+1, -1) pair, born
// together from two peace cells, conserving the total at zero. The One splitting into noticer and noticed,
// pleasure here paid for by pain there. The control (arrow off) never produces a first distinction at all.

import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { firstDistinction } from '@/code/dynamics/genesis'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'cosmology/first-distinction',
  title:
    'the first distinction is a single balanced adjacent (+1,-1) pair born from peace, conserving zero',
  category: 'cosmology',
  substrates: ['534'],
  depth: 'L1',
  paper: true,
  run() {
    const mesh = buildCoxeterMesh({
      symbol: [5, 3, 4],
      depth: 14,
      maxChambers: 4000,
    })
    const n = mesh.cellCount
    // a tiny arrow so the first creation is a single isolated event, not many at once
    const first = firstDistinction({
      neighbors: mesh.neighbors,
      cells: n,
      arrow: 0.002,
      seed: 9,
      maxBeats: 5000,
    })
    const control = firstDistinction({
      neighbors: mesh.neighbors,
      cells: n,
      arrow: 0,
      seed: 9,
      maxBeats: 5000,
    })

    const happened = first.beatsToFirst > 0
    const balanced = first.balanced // equal +1 and -1, total stays zero
    const adjacent = first.adjacent // the pair is born side by side (a local event)
    const minimal = first.plus === 1 && first.minus === 1 // exactly ONE pair, the irreducible distinction
    const controlSilent = control.beatsToFirst === -1 // no arrow, no first distinction
    const ok =
      happened && balanced && adjacent && minimal && controlSilent

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the first charge to appear from the peace void is exactly one balanced, adjacent (+1,-1) pair born together from two peace cells, conserving the total at zero, the irreducible first distinction, and with the arrow off no first distinction ever occurs',
      metrics: {
        cells: n,
        beatsToFirst: first.beatsToFirst,
        plus: first.plus,
        minus: first.minus,
        adjacent: adjacent ? 1 : 0,
      },
      // CONTROL: arrow off, the void never makes a first distinction.
      control: { controlBeatsToFirst: control.beatsToFirst },
      notes: 'Piece B. Tiny arrow isolates the single first event.',
    })
  },
})
