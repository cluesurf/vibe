// EXTERNAL THEORY: Toffoli, Fredkin, Margolus, and Bennett-Landauer, conservative reversible computation
// (author-bridges/tommaso-toffoli.md, norman-margolus.md). Their claim: a cellular rule can compute while
// conserving its tokens and erasing nothing, so it dissipates no logical heat (the Landauer bound: only
// erasure must cost energy). Such a rule has two structural marks, no fan-out (information is routed, never
// copied) and an invertible step (the past is recoverable). Vibe's knit is exactly this kind of rule, so it
// should pass all three marks, and a lossy rule should fail every one.
//
// Tested on the committed knit (collide then stream, the directional lattice gas) on the periodic {3,4,3,4} d4
// mesh. (1) the stream routes with no fan-out (its gather table is a permutation of the slots), (2) the
// ternary tone census is a conserved multiset across a beat (number conservation), (3) the knit is invertible
// (forward then backward recovers the exact start, Hamming 0, so nothing is erased). CONTROL: the erasing
// (lossy) collision must fail all three, it destroys tokens (census changes, count drops) and is not
// invertible (positive roundtrip Hamming), the Landauer-dissipative case.

import { d4Mesh } from '@/code/tool/mesh'
import { headOnRotate } from '@/code/rule/collision'
import { erasingCollision } from '@/code/control/lossy-collision'
import { makeWill, cloneWill } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { roundtrip } from '@/code/check/reversibility'
import {
  streamIsPermutation,
  toneCensus,
  censusEqual,
} from '@/code/check/lattice-gas-laws'
import { liveCount } from '@/code/measure/tone-census'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'foundations/lattice-gas-reversible-logic',
  code: 'E-FND-0030',
  title:
    "vibe's knit is conservative reversible logic, no fan-out, a conserved tone census, and an invertible step (Toffoli, Fredkin, Bennett-Landauer), where a lossy rule fails all three",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const side = 6
    const mesh = d4Mesh({ side })
    const opposite: number[] = []

    for (let d = 0; d < mesh.degree; d++) {
      opposite.push(mesh.opposite(d))
    }

    const collision = headOnRotate({ opposite })
    const degree = mesh.degree
    const beats = 10

    // a deterministic initial configuration, a fixed coordinate pattern, no randomness.
    const coordinate = (cell: number, axis: number): number =>
      Math.floor(cell / side ** axis) % side

    const start = makeWill(mesh)

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      for (let d = 0; d < degree; d++) {
        start.data[cell * degree + d] =
          ((coordinate(cell, 0) + 2 * coordinate(cell, 1) + d) % 3) - 1
      }
    }

    const censusStart = toneCensus(start.data)
    const particlesStart = liveCount(start.data)

    // (1) no fan-out: the stream gather table is a permutation of the slots (conservative routing).
    const noFanOut = streamIsPermutation(mesh)

    // (2) number conservation: the tone census is unchanged after one beat of the real knit.
    const afterOne = beat(cloneWill(start), collision)
    const censusAfter = toneCensus(afterOne.data)
    const particlesAfter = liveCount(afterOne.data)
    const censusConserved = censusEqual(censusStart, censusAfter)
    const particlesConserved = particlesStart === particlesAfter

    // (3) invertible: forward then backward recovers the exact start (nothing erased).
    const real = roundtrip({ will: start, collision, beats })
    const invertible = real.roundtripHamming === 0

    // CONTROL: the erasing (lossy) collision must fail every mark.
    const lossyAfter = beat(cloneWill(start), erasingCollision)
    const lossyCensusConserved = censusEqual(
      censusStart,
      toneCensus(lossyAfter.data),
    )

    const lossyParticlesConserved =
      particlesStart === liveCount(lossyAfter.data)

    const lossy = roundtrip({
      will: start,
      collision: erasingCollision,
      beats,
    })

    const lossyInvertible = lossy.roundtripHamming === 0

    const controlFailsAll =
      !lossyCensusConserved &&
      !lossyParticlesConserved &&
      !lossyInvertible

    const ok =
      noFanOut &&
      censusConserved &&
      particlesConserved &&
      invertible &&
      controlFailsAll

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "vibe's knit on the periodic {3,4,3,4} mesh is conservative reversible logic: the stream routes with no fan-out (a slot permutation), the ternary tone census is a conserved multiset across a beat, and the step is invertible so nothing is erased and no logical heat is dissipated (the Landauer floor), while an erasing rule fails all three, validating the Toffoli-Fredkin-Bennett conservative-reversible-computation reading of the base",
      metrics: {
        slots: mesh.cellCount * degree,
        particlesStart,
        particlesAfter,
        noFanOut: noFanOut ? 1 : 0,
        roundtripHamming: real.roundtripHamming,
      },
      control: {
        lossyParticlesAfter: liveCount(lossyAfter.data),
        lossyRoundtripHamming: lossy.roundtripHamming,
        controlFailsAll: controlFailsAll ? 1 : 0,
      },
      notes:
        'L2, the conservative-reversible-computation reading of the base (Toffoli, Fredkin, Margolus, Bennett-Landauer). The periodic d4 mesh makes the stream an exact slot permutation, so routing has no fan-out and the tone census is conserved exactly (integer equality, no tolerance). headOnRotate only moves a head-on pair between lines within a cell, so it permutes tones and conserves the census, and it is an involution, so the knit is invertible. The erasing collision is the Landauer-dissipative control: it destroys tokens and cannot be inverted. Fully deterministic, the initial condition is a fixed coordinate pattern.',
    })
  },
})
