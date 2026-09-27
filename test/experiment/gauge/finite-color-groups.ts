// Can a finite color group stand in for SU(3) where the hadron experiments live? E-FRC-0104 shows the
// Hessian group Sigma(648) acts classically (its links are three tones and a coin direction), and
// that the only larger crystal subgroup, Sigma(1080), needs a golden-ratio element that makes Wigner
// negativity. A finite gauge group matches SU(3) at strong coupling and freezes at weak coupling, so
// the question is whether it reaches the couplings where physics is measured (the N_t = 4
// deconfinement of SU(3) is at beta 5.6925, the spacing of E-FRC-0084 to 0089).
//
// Four measurements, each gauge group built by closure from published generators:
//
// A. Wilson action. Below freezing the plaquette of Sigma(648) and Sigma(1080) matches SU(3). The
//    freezing coupling rises with the group (Sigma(108) < Sigma(648) < Sigma(1080)), and every one is
//    below 5.6925. Sigma(1080)'s bracket holds the published 3.935 (Alexandru et al. 2019).
// B. The modified action S = -sum ((beta0 / 3) Re Tr U_p + beta1 Re Tr U_p^2). At the published
//    Sigma(1080) N_t = 4 deconfinement point (9.154, -0.9061) Sigma(1080) is unfrozen (cold and hot
//    starts agree) and Sigma(648) is not. On its own trajectory beta1 = -0.165 beta0 + 0.31, chosen
//    here from a scan, Sigma(648) is unfrozen.
// C. N_t = 4 deconfinement on 8^3 x 4: the Polyakov loop brackets Sigma(1080)'s transition around the
//    published 9.154, and Sigma(648)'s on its trajectory.
// D. The physics check. At each theory's own N_t = 4 transition the lattice spacing is 1 / (4 T_c), so
//    if the finite theories are SU(3) there, their Creutz ratios (the string tension in lattice
//    units, with its short-distance part) equal SU(3)'s at beta 5.6925. Measured on 8^4 with
//    jackknife errors.
//
// The heatbaths are seeded samplers, the reference method for a gauge ensemble. E-FRC-0102 shows the
// deterministic kinetic rule reproduces a heatbath for the Z3 center, and that is the route a base
// would use.
//
// Depth L2: finite-group lattice gauge theory (Bhanot and Rebbi 1981, Alexandru et al. 2019)
// reproduced, and one measurement not in that literature, Sigma(648) with the Re Tr U^2 term.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeWeyl } from '@/code/tool/weyl'
import {
  FiniteGroup,
  finiteHeatbathSweep,
  finitePlaquette,
  finitePolyakovLoop,
  finiteWilsonLoops,
  generateGroup,
  makeFiniteGaugeLattice,
} from '@/code/dynamics/finite-gauge'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import {
  makeGaugeLattice,
  sampleGaugeEnsemble,
} from '@/code/dynamics/gauge-lattice'
import {
  averagePlaquette,
  creutzRatioFromTable,
  wilsonLoopTable,
} from '@/code/measure/lattice-gauge-observable'
import { jackknife } from '@/code/measure/jackknife'

const SU3_TRANSITION = 5.6925
const PUBLISHED_FREEZING_1080 = 3.935
const PUBLISHED_POINT: [number, number] = [9.154, -0.9061]
const TRAJECTORY_648 = (beta0: number): number => -0.165 * beta0 + 0.31
// the published Sigma(1080) trajectory, Alexandru et al. (2019) equation 3
const TRAJECTORY_1080 = (beta0: number): number =>
  -0.1267 * beta0 + 0.253
const TRANSITION_648 = 13
const WILSON_BETAS = [2, 3, 3.5, 4, 4.5]
const LOOP_MAX = 4

type Groups = {
  sigma108: FiniteGroup
  sigma648: FiniteGroup
  sigma1080: FiniteGroup
}

function plaquette(input: {
  group: FiniteGroup
  beta: number
  beta1: number
  start: 'cold' | 'hot' | 'mixed'
  sweeps: number
  seed: number
}): number {
  const rng = makeWeyl({ start: input.seed })
  const lattice = makeFiniteGaugeLattice({
    group: input.group,
    lengths: [4, 4, 4, 4],
    start: input.start,
    rng,
  })

  let sum = 0
  let count = 0

  for (let sweep = 0; sweep < input.sweeps; sweep++) {
    finiteHeatbathSweep({
      lattice,
      beta: input.beta,
      beta1: input.beta1,
      rng,
    })

    if (sweep >= input.sweeps / 2) {
      sum += finitePlaquette({ lattice })
      count += 1
    }
  }

  return sum / count
}

function su3Plaquette(beta: number): number {
  const rng = makeWeyl({ start: 3 })
  const lattice = makeGaugeLattice({
    group: 'su3',
    lengths: [4, 4, 4, 4],
    start: 'hot',
    rng,
  })
  const samples = sampleGaugeEnsemble({
    lattice,
    beta,
    thermalization: 100,
    measurements: 60,
    separation: 2,
    overrelaxation: 2,
    rng,
    measure: l => averagePlaquette({ lattice: l }),
  })

  return samples.reduce((a, b) => a + b, 0) / samples.length
}

// the first beta of the grid where the mixed start has left the SU(3) branch, its plaquette more than
// 0.1 above SU(3)'s at the same beta: fully frozen or frozen onto a subgroup, either way no longer SU(3)
function freezingBracket(
  group: FiniteGroup,
  seed: number,
  su3: readonly number[],
): { low: number; high: number; plaquettes: number[] } {
  const plaquettes = WILSON_BETAS.map(beta =>
    plaquette({
      group,
      beta,
      beta1: 0,
      start: 'mixed',
      sweeps: 240,
      seed,
    }),
  )
  const first = plaquettes.findIndex((p, k) => p - (su3[k] ?? 0) > 0.1)

  return {
    low:
      first <= 0 ? Number.NaN : (WILSON_BETAS[first - 1] ?? Number.NaN),
    high:
      first < 0
        ? Number.POSITIVE_INFINITY
        : (WILSON_BETAS[first] ?? Number.NaN),
    plaquettes,
  }
}

function polyakov(
  group: FiniteGroup,
  beta: number,
  beta1: number,
): number {
  const rng = makeWeyl({ start: 23 })
  const lattice = makeFiniteGaugeLattice({
    group,
    lengths: [8, 8, 8, 4],
    start: 'mixed',
    rng,
  })

  let sum = 0
  let count = 0

  for (let sweep = 0; sweep < 200; sweep++) {
    finiteHeatbathSweep({ lattice, beta, beta1, rng })

    if (sweep >= 80) {
      const loop = finitePolyakovLoop({ lattice })

      sum += Math.hypot(loop.re, loop.im)
      count += 1
    }
  }

  return sum / count
}

type Creutz = {
  chi22: { value: number; error: number }
  chi33: { value: number; error: number }
}

function creutzFrom(tables: readonly number[][][]): Creutz {
  const ratio =
    (r: number) =>
    (samples: readonly number[][][]): number => {
      const mean = Array.from({ length: LOOP_MAX + 1 }, (_, i) =>
        Array.from(
          { length: LOOP_MAX + 1 },
          (_, j) =>
            samples.reduce((s, t) => s + (t[i]?.[j] ?? 0), 0) /
            samples.length,
        ),
      )

      return creutzRatioFromTable({ table: mean, r, t: r })
    }

  return {
    chi22: jackknife({
      samples: tables,
      estimator: ratio(2),
      binSize: 5,
    }),
    chi33: jackknife({
      samples: tables,
      estimator: ratio(3),
      binSize: 5,
    }),
  }
}

function finiteCreutz(
  group: FiniteGroup,
  beta: number,
  beta1: number,
): Creutz {
  const rng = makeWeyl({ start: 29 })
  const lattice = makeFiniteGaugeLattice({
    group,
    lengths: [8, 8, 8, 8],
    start: 'hot',
    rng,
  })
  const tables: number[][][] = []

  for (let sweep = 0; sweep < 100; sweep++) {
    finiteHeatbathSweep({ lattice, beta, beta1, rng })
  }

  for (let m = 0; m < 50; m++) {
    for (let k = 0; k < 3; k++) {
      finiteHeatbathSweep({ lattice, beta, beta1, rng })
    }

    tables.push(finiteWilsonLoops({ lattice, max: LOOP_MAX }))
  }

  return creutzFrom(tables)
}

function su3Creutz(): Creutz {
  const rng = makeWeyl({ start: 29 })
  const lattice = makeGaugeLattice({
    group: 'su3',
    lengths: [8, 8, 8, 8],
    start: 'hot',
    rng,
  })

  return creutzFrom(
    sampleGaugeEnsemble({
      lattice,
      beta: SU3_TRANSITION,
      thermalization: 100,
      measurements: 50,
      separation: 3,
      overrelaxation: 2,
      rng,
      measure: l => wilsonLoopTable({ lattice: l, max: LOOP_MAX }),
    }),
  )
}

const pull = (
  a: { value: number; error: number },
  b: { value: number; error: number },
): number => (a.value - b.value) / Math.hypot(a.error, b.error)

export default experiment({
  id: 'gauge/finite-color-groups',
  code: 'E-FRC-0103',
  title:
    'the classical color group Sigma(648), whose links are three tones and a coin direction, freezes under the Wilson action long before the couplings where hadrons are measured, but with a Re Tr U^2 term it stays unfrozen, deconfines at N_t = 4, and there gives the same Creutz ratios as SU(3) at its N_t = 4 transition, so at that spacing SU(3) needs no golden-ratio element',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const groups: Groups = {
      sigma108: generateGroup({
        generators: [...SU3_SUBGROUPS.sigma108.generators],
      }),
      sigma648: generateGroup({
        generators: [...SU3_SUBGROUPS.sigma648.generators],
      }),
      sigma1080: generateGroup({
        generators: [...SU3_SUBGROUPS.sigma1080.generators],
      }),
    }

    // A. Wilson action
    const su3Branch = WILSON_BETAS.map(su3Plaquette)
    const su3At2 = su3Branch[0] ?? 0
    const su3At3 = su3Branch[1] ?? 0
    const freezing = {
      sigma108: freezingBracket(groups.sigma108, 11, su3Branch),
      sigma648: freezingBracket(groups.sigma648, 11, su3Branch),
      sigma1080: freezingBracket(groups.sigma1080, 11, su3Branch),
    }
    const strongMatch = (['sigma648', 'sigma1080'] as const).every(
      name =>
        Math.abs((freezing[name].plaquettes[0] ?? 0) - su3At2) < 0.01 &&
        Math.abs((freezing[name].plaquettes[1] ?? 0) - su3At3) < 0.01,
    )
    const freezingOrdered =
      freezing.sigma108.high <= freezing.sigma648.high &&
      freezing.sigma648.high <= freezing.sigma1080.high &&
      freezing.sigma1080.high < SU3_TRANSITION
    const publishedInBracket =
      freezing.sigma1080.low <= PUBLISHED_FREEZING_1080 &&
      PUBLISHED_FREEZING_1080 <= freezing.sigma1080.high

    // B. the modified action: which starts agree
    const hysteresis = (
      group: FiniteGroup,
      beta: number,
      beta1: number,
    ): number =>
      Math.abs(
        plaquette({
          group,
          beta,
          beta1,
          start: 'cold',
          sweeps: 400,
          seed: 17,
        }) -
          plaquette({
            group,
            beta,
            beta1,
            start: 'hot',
            sweeps: 400,
            seed: 17,
          }),
      )
    const golden = hysteresis(groups.sigma1080, ...PUBLISHED_POINT)
    const classicalOnGolden = hysteresis(
      groups.sigma648,
      ...PUBLISHED_POINT,
    )
    const classicalOnOwn = hysteresis(
      groups.sigma648,
      TRANSITION_648,
      TRAJECTORY_648(TRANSITION_648),
    )
    const unfrozen =
      golden < 0.01 && classicalOnOwn < 0.01 && classicalOnGolden > 0.05

    // C. N_t = 4 deconfinement brackets
    const goldenConfined = polyakov(
      groups.sigma1080,
      8,
      TRAJECTORY_1080(8),
    )
    const goldenDeconfined = polyakov(
      groups.sigma1080,
      10,
      TRAJECTORY_1080(10),
    )
    const classicalConfined = polyakov(
      groups.sigma648,
      11,
      TRAJECTORY_648(11),
    )
    const classicalDeconfined = polyakov(
      groups.sigma648,
      14,
      TRAJECTORY_648(14),
    )
    const brackets =
      goldenConfined < 0.05 &&
      goldenDeconfined > 0.1 &&
      classicalConfined < 0.05 &&
      classicalDeconfined > 0.1

    // D. Creutz ratios at each theory's own N_t = 4 transition
    const su3 = su3Creutz()
    const classical = finiteCreutz(
      groups.sigma648,
      TRANSITION_648,
      TRAJECTORY_648(TRANSITION_648),
    )
    const goldenCreutz = finiteCreutz(
      groups.sigma1080,
      ...PUBLISHED_POINT,
    )
    const sameString =
      Math.abs(pull(classical.chi22, su3.chi22)) < 3 &&
      Math.abs(pull(classical.chi33, su3.chi33)) < 3 &&
      Math.abs(classical.chi33.value / su3.chi33.value - 1) < 0.1

    const ok =
      strongMatch &&
      freezingOrdered &&
      publishedInBracket &&
      unfrozen &&
      brackets &&
      sameString

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'under the Wilson action Sigma(648) and Sigma(1080) match the SU(3) plaquette at beta 2 and 3 and freeze in the order Sigma(108), Sigma(648), Sigma(1080), all below the SU(3) N_t = 4 transition at 5.6925, Sigma(1080) between the grid points around the published 3.935. With a Re Tr U^2 term Sigma(1080) is unfrozen at its published N_t = 4 point and Sigma(648) is frozen there but unfrozen on its own trajectory, both deconfine at N_t = 4 (Sigma(1080) between 8 and 10, Sigma(648) between 11 and 14), and at its transition the classical Sigma(648) gives Creutz ratios chi(2,2) and chi(3,3) within 3 sigma and 10 percent of SU(3) at 5.6925',
      metrics: {
        sigma108FreezingHigh: freezing.sigma108.high,
        sigma648FreezingHigh: freezing.sigma648.high,
        sigma1080FreezingLow: freezing.sigma1080.low,
        sigma1080FreezingHigh: freezing.sigma1080.high,
        ...Object.fromEntries(
          WILSON_BETAS.flatMap((beta, k) => [
            [
              `sigma648WilsonPlaquetteAt${beta}`,
              freezing.sigma648.plaquettes[k] ?? Number.NaN,
            ],
            [
              `sigma1080WilsonPlaquetteAt${beta}`,
              freezing.sigma1080.plaquettes[k] ?? Number.NaN,
            ],
          ]),
        ),
        goldenHysteresisAtPublishedPoint: golden,
        classicalHysteresisAtPublishedPoint: classicalOnGolden,
        classicalHysteresisOnOwnTrajectory: classicalOnOwn,
        goldenPolyakovConfined: goldenConfined,
        goldenPolyakovDeconfined: goldenDeconfined,
        classicalPolyakovConfined: classicalConfined,
        classicalPolyakovDeconfined: classicalDeconfined,
        classicalChi22: classical.chi22.value,
        classicalChi22Error: classical.chi22.error,
        classicalChi33: classical.chi33.value,
        classicalChi33Error: classical.chi33.error,
        goldenChi22: goldenCreutz.chi22.value,
        goldenChi33: goldenCreutz.chi33.value,
        chi33RatioClassicalOverSu3:
          classical.chi33.value / su3.chi33.value,
      },
      control: {
        ...Object.fromEntries(
          WILSON_BETAS.map((beta, k) => [
            `su3WilsonPlaquetteAt${beta}`,
            su3Branch[k] ?? Number.NaN,
          ]),
        ),
        su3Chi22: su3.chi22.value,
        su3Chi22Error: su3.chi22.error,
        su3Chi33: su3.chi33.value,
        su3Chi33Error: su3.chi33.error,
        su3Transition: SU3_TRANSITION,
        publishedFreezing1080: PUBLISHED_FREEZING_1080,
        publishedTransition1080: PUBLISHED_POINT[0],
      },
      notes:
        'L2, finite-group gauge theory reproduced and one new measurement. Small boxes (4^4 for freezing, 8^3 x 4 for deconfinement, 8^4 for loops) and one lattice spacing, the N_t = 4 one, about 0.17 fm with r0 = 0.5 fm. The Sigma(648) trajectory was chosen from a scan of which beta1 keeps cold and hot starts together, and its transition was located to about 0.5 in beta0. Creutz ratios at 2 and 3 carry short-distance parts and are compared like for like at the same physical spacing, not converted to a string tension. What it says for the base: color links that are classical records (three tones and a coin direction, E-FRC-0104) reproduce SU(3) confinement and deconfinement at this spacing, so the golden-ratio element is not needed here. Whether that holds toward the continuum (N_t = 6 and beyond, where the freezing boundary of this trajectory approaches) is measured separately and stated in note/experiment/gauge/what-the-base-needs.md.',
    })
  },
})
