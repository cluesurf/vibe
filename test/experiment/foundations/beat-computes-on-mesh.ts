// The beat computes on the forced mesh. Register two runs: the equipment is fixed (the
// ternary tone, the 24-cell, the {3,4,3,4} mesh, the knit law, all forced upstream), and
// now the beat acts. One beat is collide then stream, applied SYNCHRONOUSLY to every
// cell at once (no cell order, no randomness), the parallel cellular-automaton tick. This
// experiment runs the knit on the actual d4 mesh from a deterministic fill and confirms
// the two defining properties of the computation:
//   - it CONSERVES charge exactly (integer equality) at every beat, so the tone-current
//     is exactly conserved, the scalar law,
//   - it is REVERSIBLE: running forward N beats then backward N beats recovers the start
//     bit for bit, so the knit destroys no information, the beat is a permutation.
// Together these are what makes the beat a lawful computation rather than a lossy smear.
// The forward arrow does not come from the knit (which runs either way) but from the wake
// (the growth, measured in mesh-unfolds-exactly): the knit is the reversible mechanism,
// the wake is why the clock runs forward.
//
// CONTROL: an erasing (lossy) rule is not a lawful computation. The lossy collision zeroes
// a slot, so it neither conserves charge nor reverses, the discriminator that the knit's
// conservation and reversibility are real properties of the forced law, not generic to any
// update.
//
// Grade L2: the committed reversible conserving dynamics run on the committed substrate,
// the register-two counterpart of the register-one forcing experiments (tone-is-forced,
// cell-is-forced), with a lossy control that fails both properties.

import { d4Mesh } from '@/code/tool/mesh'
import { makeWill, charge, type Will } from '@/code/tone/will'
import { pairCollision, type Collision } from '@/code/rule/collision'
import { conservesCharge, isReversible } from '@/code/check/invariant'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const SIDE = 6
const BEATS = 10

// a deterministic heterogeneous fill (period 7, coprime to the side, so cells differ)
function fillTexture(will: Will): void {
  const { mesh, data } = will

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    for (let d = 0; d < mesh.degree; d++) {
      data[cell * mesh.degree + d] = (((cell * 5 + d) % 7) % 3) - 1
    }
  }
}

// a lossy control collision: zero the first slot of every cell (erases charge), which
// neither conserves nor reverses
const erasingCollision: Collision = (slots, base) => {
  slots[base] = 0
}

export default experiment({
  id: 'foundations/beat-computes-on-mesh',
  code: 'E-FND-0046',
  title:
    'the beat computes on the forced mesh: the knit (collide then stream, applied synchronously to every cell) conserves charge exactly and is reversible (forward then backward recovers the start bit for bit) on the {3,4,3,4} d4 mesh, while an erasing rule conserves neither, so the beat is a lawful reversible computation and the arrow lives in the wake, not the knit',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = Array.from({ length: mesh.degree }, (_, d) =>
      mesh.opposite(d),
    )

    const knit = pairCollision({ opposite })
    const knitInverse = pairCollision({ opposite, forward: false })

    const will = makeWill(mesh)
    fillTexture(will)

    // 1. the knit conserves charge exactly over the run
    const chargeConserved = conservesCharge(will, knit, BEATS)

    // 2. the knit is reversible: forward then backward recovers the start exactly
    const reversible = isReversible(will, knit, BEATS, knitInverse)

    // 3. the control: the erasing rule conserves neither charge nor reversibility
    const lossyWill = makeWill(mesh)
    fillTexture(lossyWill)

    const lossyConserves = conservesCharge(lossyWill, erasingCollision, BEATS)
    const lossyReversible = isReversible(lossyWill, erasingCollision, BEATS)
    const controlFails = !lossyConserves && !lossyReversible

    const solved = chargeConserved && reversible && controlFails

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'on the {3,4,3,4} d4 mesh from a deterministic fill, the knit (collide then stream, synchronous over every cell) conserves the total charge as exact integer equality across every beat and is reversible (running forward ten beats then backward ten beats recovers the start state bit for bit), so the beat is a lawful reversible charge-conserving computation, while an erasing rule that zeroes a slot conserves neither, the control, and the forward arrow therefore lives in the wake (the growth), not in the reversible knit',
      metrics: {
        beats: BEATS,
        startCharge: charge(will),
        chargeConserved: chargeConserved ? 1 : 0,
        reversible: reversible ? 1 : 0,
        lossyConserves: lossyConserves ? 1 : 0,
        lossyReversible: lossyReversible ? 1 : 0,
      },
      control: {
        // the erasing rule fails both properties, so conservation and reversibility are
        // real properties of the forced knit, not generic to any cell update
        lossyConserves: lossyConserves ? 1 : 0,
        lossyReversible: lossyReversible ? 1 : 0,
      },
      notes:
        'L2, the committed reversible conserving knit run on the committed d4 substrate, reusing code/rule/lattice-gas and code/check/invariant. This is register two (the running) to the register-one forcing experiments: the equipment is fixed upstream (tone-is-forced, cell-is-forced, the ladder), and the beat computes on it. Charge equality is exact (integer), reversibility is bit-exact. The arrow is not here (the knit runs either way), it is in the wake measured by mesh-unfolds-exactly. The erasing rule is the lossy control failing both properties.',
    })
  },
})
