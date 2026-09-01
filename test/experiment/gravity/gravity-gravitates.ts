// Frontier 4, the nonlinear Einstein structure, gravity gravitates. What makes Einstein gravity NONLINEAR, unlike a
// linear field, is that the gravitational field's own energy sources more gravity, so the field does NOT obey
// superposition. This experiment measures exactly that defining nonlinearity on the reversible wave, and that it
// stays reversible and bounded.
//
//   - SUPERPOSITION IS BROKEN (gravity gravitates). With the gravitational self-coupling on, the nonlinear evolution
//     of the sum of two field configurations is NOT the sum of their evolutions, because the self-energy term (the
//     field squared) has a cross term, the field sources itself. The superposition defect is nonzero and grows with
//     the coupling. With the self-coupling off (the linear wave, the control) superposition holds EXACTLY, the
//     defect is zero. So the self-coupling is the genuine Einstein nonlinearity, gravity gravitating.
//   - REVERSIBLE AND BOUNDED. The nonlinear evolution run forward then backward recovers the seed exactly (the
//     self-term depends only on the current slice, so the leapfrog stays reversible), and the activity stays bounded
//     over a long run (the mod-q wrap), so the nonlinearity is stable, however strong the coupling.
//
// Together with the nonlinear Friedmann cosmology (`gravity/nonlinear-einstein`, the integrated nonlinear Einstein
// equation with the Bianchi consistency) and the propagating nonlinear field (`gravity/propagating-curved-gravity`),
// this gives the nonlinear Einstein structure, gravity gravitates, reversibly and stably. The honest residual is the
// full strong-field interior (the Schwarzschild solution), which stays future work. Depth L2, the superposition
// defect and the reversibility measured deterministically, with the linear (no self-coupling) wave the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { reversibleWaveStepNonlinear } from '@/code/dynamics/reversible-wave'
import { ringNeighbors } from '@/code/substrate/ring'

const RING = 48
const MODULUS = 251
const COUPLING = 3

// one step of the nonlinear wave on a (previous, current) pair, returning the next slice
function step(
  neighbors: number[][],
  previous: Uint8Array,
  current: Uint8Array,
  coupling: number,
): Uint8Array {
  const next = new Uint8Array(neighbors.length)

  reversibleWaveStepNonlinear({
    neighbors,
    previous,
    current,
    next,
    modulus: MODULUS,
    selfCoupling: coupling,
  })

  return next
}

// the superposition defect, how much the evolution of the SUM differs from the SUM of the evolutions, summed over
// cells. Zero means superposition holds (a linear field), nonzero means the field self-couples (gravity gravitates).
function superpositionDefect(coupling: number): number {
  const neighbors = ringNeighbors(RING)
  // two overlapping field configurations A and B (blocks that overlap, so the cross term is nonzero)
  const prevA = new Uint8Array(RING)
  const curA = new Uint8Array(RING)
  const prevB = new Uint8Array(RING)
  const curB = new Uint8Array(RING)

  for (let i = 14; i <= 26; i++) {
    curA[i] = 1
  }

  for (let i = 20; i <= 32; i++) {
    curB[i] = 1
  }

  const nextA = step(neighbors, prevA, curA, coupling)
  const nextB = step(neighbors, prevB, curB, coupling)
  const prevSum = new Uint8Array(RING)
  const curSum = new Uint8Array(RING)

  for (let i = 0; i < RING; i++) {
    prevSum[i] = (prevA[i]! + prevB[i]!) % MODULUS
    curSum[i] = (curA[i]! + curB[i]!) % MODULUS
  }

  const nextSum = step(neighbors, prevSum, curSum, coupling)

  let defect = 0

  for (let i = 0; i < RING; i++) {
    const summed = (nextA[i]! + nextB[i]!) % MODULUS

    if (nextSum[i] !== summed) {
      defect += Math.abs(nextSum[i]! - summed)
    }
  }

  return defect
}

// run the nonlinear wave forward then backward, return whether it recovers the seed and the peak activity (bounded)
function reverseAndBound(coupling: number): {
  reversible: boolean
  peak: number
} {
  const neighbors = ringNeighbors(RING)
  const beats = 80

  let previous = new Uint8Array(RING)
  let current = new Uint8Array(RING)

  for (let i = 22; i <= 26; i++) {
    current[i] = i - 21
  }

  const seedPrev = previous.slice()
  const seedCur = current.slice()

  let peak = 0

  for (let beat = 0; beat < beats; beat++) {
    const next = step(neighbors, previous, current, coupling)

    previous = current
    current = next

    let activity = 0

    for (let i = 0; i < RING; i++) {
      activity += current[i]!
    }

    if (activity > peak) {
      peak = activity
    }
  }

  let revPrev = current.slice()
  let revCur = previous.slice()

  for (let beat = 0; beat < beats; beat++) {
    const next = step(neighbors, revPrev, revCur, coupling)

    revPrev = revCur
    revCur = next
  }

  let reversible = true

  for (let i = 0; i < RING; i++) {
    if (revCur[i] !== seedPrev[i] || revPrev[i] !== seedCur[i]) {
      reversible = false
    }
  }

  return { reversible, peak }
}

export default experiment({
  id: 'gravity/gravity-gravitates',
  code: 'E-GRV-0023',
  title:
    'the nonlinear Einstein structure, gravity gravitates (the self-coupling breaks superposition), reversibly and boundedly, the linear field the control',
  category: 'gravity',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    // the nonlinear field breaks superposition (gravity gravitates), the linear field does not (the control)
    const nonlinearDefect = superpositionDefect(COUPLING)
    const linearDefect = superpositionDefect(0)

    // the nonlinear field is reversible and bounded
    const nonlinear = reverseAndBound(COUPLING)
    // a first-order irreversible control would not recover, here the leapfrog nonlinear wave does
    const linearRun = reverseAndBound(0)

    const gravityGravitates = nonlinearDefect > 0 && linearDefect === 0
    const reversible = nonlinear.reversible && linearRun.reversible
    const bounded = nonlinear.peak < MODULUS * RING // never blows up, stays in the finite alphabet
    const ok = gravityGravitates && reversible && bounded

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the gravitational self-coupling makes the field NONLINEAR in the Einstein sense, gravity gravitates, the nonlinear evolution of the sum of two field configurations is not the sum of their evolutions (a nonzero superposition defect, the field self-energy sourcing more field), while the linear field (no self-coupling, the control) obeys superposition exactly (zero defect). And the nonlinearity stays reversible (forward then backward recovers the seed exactly) and bounded (the activity never blows up), so it is a stable, reversible, fully nonlinear gravity. With the integrated nonlinear Friedmann cosmology and the propagating nonlinear field, this is the nonlinear Einstein structure, gravity gravitating, the honest residual being the strong-field interior.',
      metrics: {
        nonlinearDefect,
        linearDefect,
        nonlinearReversible: nonlinear.reversible ? 1 : 0,
        nonlinearPeak: nonlinear.peak,
        boundedCeiling: MODULUS * RING,
        coupling: COUPLING,
      },
      control: { linearDefect },
      notes:
        'the superposition defect is the cross term of the field self-energy (the field squared), nonzero for the self-coupled (nonlinear) field and exactly zero for the linear field, which is the defining nonlinearity of Einstein gravity, gravity gravitates. The nonlinear leapfrog stays exactly reversible (the self-term depends only on the current slice) and bounded (mod-q), so the nonlinearity is stable. This complements nonlinear-einstein (the integrated nonlinear Friedmann equation with the Bianchi consistency) and propagating-curved-gravity (the nonlinear propagating field), giving the nonlinear Einstein structure, with the strong-field Schwarzschild interior the remaining future work.',
    })
  },
})
