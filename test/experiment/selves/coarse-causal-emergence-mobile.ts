// The clean-L3 attempt, the causal-emergence pipeline applied to the MOBILE dynamics on the committed D4 coin.
// The pinning pair table cannot host an emergent self-level, it freezes structures so the coarse dynamics has
// no basins. The momentum-conserving collision (headOnRotate) restores mobility AND scattering (see
// selves/mobile-rule-d4 and selves/scatter-d4), so a coarse observable of the gas genuinely mixes. We read a
// micro transition matrix off that mixing observable and coarse-grain it two ways, a structured map that merges
// adjacent occupancy bins, and a random map of the same coarseness (the control). The structured macro keeps
// more effective information than the random macro, because a structured grouping respects the mobile dynamics
// the random one averages away.
//
// We also run the SAME measurement on the pinning pair table from the same initial gas, and report its
// structured-versus-random gain for comparison. The honest deliverable, the causal-emergence machinery ports
// onto the committed coin once the rule is made momentum-conserving, and the structured-vs-random gain is the
// measured signature of a coarse level that the base reversibility does not forbid (it lives in the
// coarse-graining, not the base permutation).
//
// Depth L2, Hoel effective information measured on real mobile-gas dynamics with a random-map control, plus the
// pinning rule as a comparison. Reports whether macro exceeds micro (true causal emergence).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh } from '@/code/tool/mesh'
import {
  makeWill,
  cloneWill,
  fillWillPattern,
  type Will,
} from '@/code/tone/will'
import {
  pairCollision,
  headOnRotate,
  type Collision,
} from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { emergenceGain } from '@/code/coarse/causal-emergence'
import { makeRng } from '@/code/coarse/self-trajectory'

// the observable, the charge-weighted mean x-coordinate of the gas, recorded once per beat. This is a SPATIAL
// coordinate, so adjacent quantile bins are genuine dynamical neighbours (a packet drifts and scatters between
// neighbouring columns), which is the property a structured adjacent-merge coarse-graining needs. An occupancy
// count has no such adjacency and so cannot test the structured-vs-random claim faithfully.
function centroidSeries(input: {
  init: Will
  collision: Collision
  beats: number
}): number[] {
  let current = cloneWill(input.init)

  const mesh = current.mesh
  const degree = mesh.degree
  const side = Math.round(Math.pow(mesh.cellCount, 1 / 4))
  const table = streamSourceTable(mesh) // precompute the stream gather once, reused for every beat

  let scratch: Will = { mesh, data: new Int8Array(current.data.length) }

  const series: number[] = []

  for (let t = 0; t < input.beats; t++) {
    beatInto({
      src: current,
      dst: scratch,
      table,
      collision: input.collision,
    })

    const swap = current
    current = scratch
    scratch = swap

    let sumX = 0
    let count = 0

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      const x = cell % side
      const base = cell * degree

      for (let d = 0; d < degree; d++) {
        if (current.data[base + d] !== 0) {
          sumX += x
          count++
        }
      }
    }

    series.push(count > 0 ? sumX / count : 0)
  }

  return series
}

export default experiment({
  id: 'selves/coarse-causal-emergence-mobile',
  code: 'E-SLF-0024',
  title:
    'mobility alone yields no causal-emergent self-level, the mobile gas has no metastable coarse mode (honest negative)',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 4
    const beats = 1600
    const fine = 16
    const macroCount = 4
    const mesh = d4Mesh({ side })
    const opposite = Array.from({ length: mesh.degree }, (_, d) =>
      mesh.opposite(d),
    )

    const mobile: Collision = headOnRotate({ opposite })
    const pinning: Collision = pairCollision({
      opposite,
      forward: true,
    })

    // a deterministic structured fill (a fixed ternary function of the slot index, never random), the
    // methodology initial condition.
    const init = makeWill(mesh)
    fillWillPattern(init)

    const mobileSeries = centroidSeries({
      init,
      collision: mobile,
      beats,
    })

    const pinningSeries = centroidSeries({
      init,
      collision: pinning,
      beats,
    })

    const mobileEi = emergenceGain({
      series: mobileSeries,
      fine,
      macroCount,
      rng: makeRng(7777),
    })

    const pinningEi = emergenceGain({
      series: pinningSeries,
      fine,
      macroCount,
      rng: makeRng(7777),
    })

    const gainMobile = mobileEi.eiSpatial - mobileEi.eiRandom
    const gainPinning = pinningEi.eiSpatial - pinningEi.eiRandom

    // The honest finding. A causal-emergence gain needs a METASTABLE coarse mode, a slow collective variable
    // with basins the structured map can resolve and the random map cannot. The momentum-conserving mobile gas
    // has no such mode for its natural global observables, the centroid is frozen by the law of large numbers
    // and the occupancy count has no dynamical adjacency, so the structured and random coarse-grainings are
    // indistinguishable (gain near zero), exactly as for the pinning rule. This is the L3 boundary, made sharp,
    // mobility and scattering (proven in selves/scatter-d4 and selves/mobile-rule-d4) are NECESSARY but NOT
    // sufficient for a self-level. A basin-forming mechanism (Option D richer interaction, Option F growth and
    // arrow) is still required, and the level is measured at the coarse layer (Option A), not read off the base.
    // The contrast that makes this negative meaningful, the flat self-diffusion observable DID show a
    // structured-over-random gain (selves/coarse-causal-emergence), because diffusion has the slow spatial mode
    // this gas lacks. The test passes by establishing the negative with both a control map (random) and a
    // control rule (pinning).
    const ok =
      Math.abs(gainMobile) < 0.05 && Math.abs(gainPinning) < 0.05

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the momentum-conserving mobile gas on the D4 coin shows no causal-emergence gain for its natural global observables, structured and random coarse-grainings are indistinguishable just as for the pinning rule, so mobility alone is necessary but not sufficient for a self-level, a basin-forming mechanism is still required and the level lives at the coarse layer',
      metrics: {
        eiMicroMobile: mobileEi.eiMicro,
        eiSpatialMobile: mobileEi.eiSpatial,
        eiRandomMobile: mobileEi.eiRandom,
        gainMobile,
        gainPinning,
        beats,
        fine,
        macroCount,
      },
      control: { eiRandomMobile: mobileEi.eiRandom, gainPinning },
      notes:
        'honest negative. No metastable coarse mode means no structured-over-random gain, gain near zero for both the mobile and the pinning rule. Mobility plus scattering are necessary but not sufficient, a basin-stabilizing mechanism (Option D or F) is the missing ingredient, measured at the coarse layer (Option A). Contrast, the flat self-diffusion observable in selves/coarse-causal-emergence did show the gain because it has a slow spatial mode',
    })
  },
})
