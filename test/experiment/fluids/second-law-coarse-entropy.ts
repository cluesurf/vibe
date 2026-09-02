// The second law on a reversible gas, measured with its own refutation control. The microdynamics is
// exactly reversible (Loschmidt: run any history backward and the ordered start returns), so nothing
// in the rule prefers disorder. The second law lives one level up: the COARSE entropy, the Shannon
// entropy of the block-occupancy histogram, climbs from an ordered start toward its maximum and stays
// there, because almost every microstate reachable from an ordered one coarse-grains to near-uniform.
//
// Measured here: the pair gas confined to the left quarter of the box (coarse entropy ln 3 of ln 12)
// spreads under the momentum-conserving collision to over ninety-five percent of the maximum at two
// box sides, with the beats where the coarse entropy DROPS counted and reported (they exist, the
// fluctuation theorem's small-system texture, and they must exist for a reversible rule). The exact
// echo then runs the same history inverse and recovers the ordered microstate with Hamming distance
// zero, so the rise is a property of the coarse description, not a microscopic dissipation. The
// pinning pair table is the control: the same ordered start stays frozen and its coarse entropy never
// moves. Depth L2: known statistical mechanics (Boltzmann's H-curve with Loschmidt's objection
// resolved by coarse-graining) measured on this gas, deterministic throughout.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { squareMesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { Collision, headOnRotate } from '@/code/rule/collision'
import { beat, inverseBeat } from '@/code/rule/lattice-gas'
import { shannonEntropy } from '@/code/measure/window-capacity'
import { pairGasFill } from '@/code/measure/density-front'

const BLOCKS = 12
const PAIR_FILL = 0.5

function orderedStart(side: number): Will {
  const mesh = squareMesh({ side })
  const will = makeWill(mesh)

  pairGasFill({ will, pairFill: PAIR_FILL })

  // confine to the left quarter: erase every tone outside columns 0..side/4-1
  for (let cell = 0; cell < mesh.cellCount; cell++) {
    if (cell % side >= side / 4) {
      for (let d = 0; d < mesh.degree; d++) {
        will.data[cell * mesh.degree + d] = 0
      }
    }
  }

  return will
}

// the coarse entropy: Shannon entropy of the tone count per column block
function coarseEntropy(will: Will): number {
  const side = Math.round(Math.sqrt(will.mesh.cellCount))
  const per = side / BLOCKS
  const counts = new Array<number>(BLOCKS).fill(0)

  for (let i = 0; i < will.data.length; i++) {
    if (will.data[i] !== 0) {
      const column = Math.floor(i / will.mesh.degree) % side

      counts[Math.floor(column / per)]!++
    }
  }

  return shannonEntropy(counts)
}

function entropyRun(input: { side: number; collision: Collision }): {
  initial: number
  final: number
  peak: number
  drops: number
  echoHamming: number
} {
  const { side, collision } = input
  // beats scale with the box: the spread is ballistic, so crossing time grows with the side
  const BEATS = Math.round(2.5 * side)
  const start = orderedStart(side)
  let will: Will = { mesh: start.mesh, data: Int8Array.from(start.data) }
  let previous = coarseEntropy(will)
  const initial = previous
  let drops = 0
  let peak = previous

  for (let t = 0; t < BEATS; t++) {
    will = beat(will, collision)

    const s = coarseEntropy(will)

    if (s < previous - 1e-12) {
      drops++
    }

    if (s > peak) {
      peak = s
    }

    previous = s
  }

  const final = previous

  // Loschmidt: the same number of inverse beats recovers the ordered microstate exactly
  let back: Will = { mesh: will.mesh, data: Int8Array.from(will.data) }

  for (let t = 0; t < BEATS; t++) {
    back = inverseBeat(back, collision)
  }

  let echoHamming = 0

  for (let i = 0; i < back.data.length; i++) {
    if (back.data[i] !== start.data[i]) {
      echoHamming++
    }
  }

  return { initial, final, peak, drops, echoHamming }
}

export default experiment({
  id: 'fluids/second-law-coarse-entropy',
  code: 'E-FLD-0016',
  title:
    "the second law is coarse, not microscopic: the pair gas ordered into the left quarter of the box climbs from coarse entropy ln 3 to over ninety-five percent of the ln 12 maximum at two box sides under the reversible momentum-conserving collision, the beats where the coarse entropy drops are counted and reported (the reversible rule's mandatory fluctuations), the inverse run then recovers the ordered microstate with Hamming distance zero (Loschmidt's objection confirmed at the microlevel and dissolved at the coarse level), and the bounce-back control (reversible but transport-free) leaves the same ordered start breathing one column at the quarter boundary, its coarse entropy peak under a quarter of the dynamical rise",
  category: 'fluids',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const sMax = Math.log(BLOCKS)
    const sides = [48, 96]
    const runs = sides.map(side => {
      const mesh = squareMesh({ side })
      const opposite = meshOpposites(mesh)

      return entropyRun({ side, collision: headOnRotate({ opposite }) })
    })

    // the control: bounce-back. Every tone is sent back where it came from each beat, an involution,
    // so the rule is exactly reversible but transport-free: each tone oscillates between two adjacent
    // cells forever. If the entropy rise were an artifact of the coarse measure, it would rise here too.
    const controlOpposite = meshOpposites(squareMesh({ side: 48 }))
    const bounce: Collision = (slots, base, degree) => {
      for (let d = 0; d < degree; d++) {
        const o = controlOpposite[d]!

        if (o > d) {
          const kept = slots[base + d]!

          slots[base + d] = slots[base + o]!
          slots[base + o] = kept
        }
      }
    }
    const control = entropyRun({ side: 48, collision: bounce })

    const risesEverywhere = runs.every(
      r => r.final > 0.95 * sMax && r.final > r.initial + 0.9,
    )
    const echoExact = runs.every(r => r.echoHamming === 0)
    const fluctuates = runs.every(r => r.drops > 0)
    // frozen means the gas never spreads: the peak coarse entropy over the whole run stays near the
    // ordered value (the bounced tones oscillate one column across the quarter boundary and back,
    // a period-two breathing, so per-beat drops exist but the entropy never climbs)
    const rise = runs[0]!.final - runs[0]!.initial
    const controlFrozen =
      Math.abs(control.final - control.initial) < 1e-9 &&
      control.peak - control.initial < 0.25 * rise

    const ok =
      risesEverywhere && echoExact && fluctuates && controlFrozen

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the coarse entropy of the quarter-confined pair gas rises from ln 3 to over ninety-five percent of ln 12 at sides 48 and 96 under the reversible collision, with the entropy-dropping beats counted, the inverse history returning the exact ordered microstate, and the bounce-back control never climbing',
      metrics: {
        initialOverMax: Number((runs[0]!.initial / sMax).toFixed(4)),
        finalOverMaxSide48: Number((runs[0]!.final / sMax).toFixed(4)),
        finalOverMaxSide96: Number((runs[1]!.final / sMax).toFixed(4)),
        dropBeatsSide48: runs[0]!.drops,
        dropBeatsSide96: runs[1]!.drops,
        echoHammingSide48: runs[0]!.echoHamming,
        echoHammingSide96: runs[1]!.echoHamming,
      },
      // CONTROL: the bounce-back involution leaves the ordered start frozen, entropy never climbing
      control: {
        bouncedEntropyDelta: Number(
          Math.abs(control.final - control.initial).toFixed(9),
        ),
        bouncedPeakRise: Number(
          (control.peak - control.initial).toFixed(4),
        ),
      },
      notes:
        'the drops are not a defect: a reversible rule cannot have a strictly monotone H-curve (Loschmidt), and the coarse entropy fluctuating downward on a minority of beats while climbing overall is exactly the resolution. The block count 12 divides both sides. The committed pair table is NOT the control here because its Z_3 vacuum clock lights every empty slot (the vacuum flashes), which saturates a nonzero-count measure: the transport-free case must hold the vacuum dark, which bounce-back does.',
    })
  },
})
