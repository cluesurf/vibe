// Asymptotic freedom: the non-abelian coupling grows with distance, because the gluons themselves
// carry color and anti-screen it. How fast it grows is set by the gluon's own color charge C_A (N
// for SU(N), zero for the photon of U(1)), and NOT by the charge of whatever probes it.
//
// The observable is rho = chi(2, 2) / chi(1, 1), a ratio of Creutz ratios, each the force between
// static charges at a different distance (chi(1, 1) is the plaquette, the shortest distance the
// lattice has, chi(2, 2) about twice as far). At tree level every loop is C_R g^2 times the same
// lattice propagator sum, C_R the Casimir of the source's representation, so rho at g^2 -> 0 is one
// pure geometric number, the SAME for every group and every representation. Its rise with g^2 is
//
//   rho = rho_0 + r g^2 + q g^4,     r = alpha + kappa C_A
//
// because Wilson loops exponentiate: the abelian C_R^2 terms of ln W cancel, and the first term that
// survives is C_R C_A, whose C_R cancels in the ratio. alpha is a lattice artifact of the compact
// action that does not care about color, measured by U(1) (C_A = 0), and kappa is the anti-screening.
//
// Three predictions, each of which could fail:
//
// - one tree-level rho_0 for U(1), SU(2), SU(3), SU(4), in both representations;
// - kappa = (r - alpha) / C_A is the same number from SU(2), SU(3) and SU(4): the anti-screening is
//   proportional to C_A = 2, 3, 4;
// - the adjoint loops, whose source carries C_A instead of the quark's C_F, rise at the SAME rate as
//   the fundamental ones. Were the rise set by the source's charge, the adjoint excess would be
//   C_A / C_F = 8/3, 9/4, 32/15 times the fundamental one, which is how the quark-charge alternative
//   an SU(2)-to-SU(3) comparison alone could not exclude is excluded here.
//
// The tree-level value rho_0 is not fitted. It is computed exactly on the same finite 8^4 box from
// the free lattice propagator (wilson-loop-perturbation), so each rate comes from a two-parameter
// line, (rho - rho_0) / g^2 = r + q g^2, and the U(1) data extrapolated to g^2 = 0 must land on the
// computed rho_0, which checks the computation and the simulation against each other. The couplings
// are matched in C_A g^2 = 0.6, 0.9, 1.2 across the non-abelian groups, so every group sits at the
// same distance from where higher orders take over.
//
// Grade L2: the one-loop Yang-Mills beta function (Gross and Wilczek 1973, Politzer 1973) seen in
// lattice Wilson loops at weak coupling. The Monte Carlo is the seeded heatbath, the sampling
// stand-in for the thermal ensemble, with binned jackknife errors.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import {
  GaugeGroup,
  groupSize,
  makeGaugeLattice,
  sampleGaugeEnsemble,
} from '@/code/dynamics/gauge-lattice'
import {
  LoopRepresentation,
  creutzRatioFromTable,
  wilsonLoopTable,
} from '@/code/measure/lattice-gauge-observable'
import { jackknife } from '@/code/measure/jackknife'
import { weightedLinearFit } from '@/code/measure/regression'
import { treeLevelCreutz } from '@/code/measure/wilson-loop-perturbation'

const BOX = 8
// matched in C_A g^2 for the non-abelian groups, a plain ladder for U(1)
const MATCHED = [0.6, 0.9, 1.2]
const ABELIAN_COUPLINGS = [0.2, 0.35, 0.5]
const NON_ABELIAN: GaugeGroup[] = ['su2', 'su3', 'su4']
// Monte Carlo samples per coupling: U(1) is cheap and noisy per sample, SU(4) the reverse
const MEASUREMENTS: Record<GaugeGroup, number> = {
  u1: 900,
  su2: 300,
  su3: 80,
  su4: 60,
}
const BIN = 5

type Estimate = { value: number; error: number }
type Rates = Record<
  LoopRepresentation,
  {
    rate: Estimate
    curvature: Estimate
    chi2: number
    points: { g: number; rho: Estimate }[]
  }
>

function forceRatio(tables: readonly number[][][]): number {
  const table = [0, 1, 2].map(r =>
    [0, 1, 2].map(
      t =>
        tables.reduce((sum, s) => sum + (s[r]?.[t] ?? 0), 0) /
        tables.length,
    ),
  )

  return (
    creutzRatioFromTable({ table, r: 2, t: 2 }) /
    creutzRatioFromTable({ table, r: 1, t: 1 })
  )
}

function runningRates(input: {
  group: GaugeGroup
  seed: number
  tree: number
}): Rates {
  const { group } = input
  const n = groupSize({ group })
  const couplings =
    group === 'u1' ? ABELIAN_COUPLINGS : MATCHED.map(x => x / n)
  const representations: LoopRepresentation[] =
    group === 'u1' ? ['fundamental'] : ['fundamental', 'adjoint']
  const points: Record<LoopRepresentation, Estimate[]> = {
    fundamental: [],
    adjoint: [],
  }

  couplings.forEach((gSquared, index) => {
    const rng = makeRng({ seed: input.seed + index })
    const lattice = makeGaugeLattice({
      group,
      lengths: [BOX, BOX, BOX, BOX],
      start: 'cold',
      rng,
    })
    const samples = sampleGaugeEnsemble({
      lattice,
      beta: group === 'u1' ? 1 / gSquared : (2 * n) / gSquared,
      thermalization: 30,
      measurements: MEASUREMENTS[group],
      separation: 1,
      overrelaxation: 1,
      rng,
      measure: current =>
        representations.map(representation =>
          wilsonLoopTable({ lattice: current, max: 2, representation }),
        ),
    })

    representations.forEach((representation, r) => {
      points[representation].push(
        jackknife({
          samples,
          estimator: subset => forceRatio(subset.map(s => s[r] ?? [])),
          binSize: BIN,
        }),
      )
    })
  })

  // (rho - rho_0) / g^2 = r + q g^2, a straight line in g^2 whose intercept is the rate
  const fit = (list: Estimate[]): Rates['fundamental'] => {
    if (list.length === 0) {
      return {
        rate: { value: 0, error: 0 },
        curvature: { value: 0, error: 0 },
        chi2: 0,
        points: [],
      }
    }

    const result = weightedLinearFit({
      xs: couplings,
      ys: list.map(
        (p, i) => (p.value - input.tree) / (couplings[i] ?? 1),
      ),
      errors: list.map((p, i) => p.error / (couplings[i] ?? 1)),
    })

    return {
      rate: { value: result.intercept, error: result.interceptError },
      curvature: { value: result.slope, error: result.slopeError },
      chi2: result.chi2,
      points: list.map((rho, i) => ({ g: couplings[i] ?? 0, rho })),
    }
  }

  return {
    fundamental: fit(points.fundamental),
    adjoint: fit(points.adjoint),
  }
}

function pull(a: Estimate, b: Estimate): number {
  return (a.value - b.value) / Math.hypot(a.error, b.error)
}

export default experiment({
  id: 'gauge/asymptotic-freedom',
  code: 'E-FRC-0083',
  title:
    'the coupling grows with distance at a rate proportional to the gluon color charge C_A, the same per unit C_A in SU(2), SU(3) and SU(4), and the same for adjoint and fundamental sources, on top of the color-blind U(1) lattice artifact',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    // the exact tree-level ratio on this box, shared by every group and representation
    const tree =
      treeLevelCreutz({ r: 2, box: BOX }) /
      treeLevelCreutz({ r: 1, box: BOX })
    const u1 = runningRates({ group: 'u1', seed: 830, tree })
    const alpha = u1.fundamental.rate
    const groups = NON_ABELIAN.map((group, index) => ({
      group,
      casimir: groupSize({ group }),
      quarkCasimir:
        (groupSize({ group }) ** 2 - 1) / (2 * groupSize({ group })),
      rates: runningRates({ group, seed: 840 + 10 * index, tree }),
    }))
    // the simulation against the computation: U(1) rho extrapolated to g^2 = 0 must be rho_0
    const u1Line = weightedLinearFit({
      xs: u1.fundamental.points.map(p => p.g),
      ys: u1.fundamental.points.map(p => p.rho.value),
      errors: u1.fundamental.points.map(p => p.rho.error),
    })
    const treePull = (u1Line.intercept - tree) / u1Line.interceptError

    // kappa from each group's fundamental rate
    const kappas = groups.map(g => ({
      value: (g.rates.fundamental.rate.value - alpha.value) / g.casimir,
      error:
        Math.hypot(g.rates.fundamental.rate.error, alpha.error) /
        g.casimir,
    }))
    const kappaPulls = [
      pull(kappas[0]!, kappas[1]!),
      pull(kappas[0]!, kappas[2]!),
      pull(kappas[1]!, kappas[2]!),
    ]

    // the representation test: the adjoint excess over the fundamental excess, 1 under C_A scaling
    // and C_A / C_F under source-charge scaling
    const representation = groups.map(g => {
      const fundamental = {
        value: g.rates.fundamental.rate.value - alpha.value,
        error: Math.hypot(g.rates.fundamental.rate.error, alpha.error),
      }
      const adjoint = {
        value: g.rates.adjoint.rate.value - alpha.value,
        error: Math.hypot(g.rates.adjoint.rate.error, alpha.error),
      }
      const alternative = g.casimir / g.quarkCasimir

      return {
        ratio: adjoint.value / fundamental.value,
        // same rate: the difference of the two rates (alpha cancels) against zero
        sameRatePull:
          (g.rates.adjoint.rate.value -
            g.rates.fundamental.rate.value) /
          Math.hypot(
            g.rates.adjoint.rate.error,
            g.rates.fundamental.rate.error,
          ),
        // source-charge scaling: adjoint excess against alternative times fundamental excess
        alternativePull:
          (adjoint.value - alternative * fundamental.value) /
          Math.hypot(adjoint.error, alternative * fundamental.error),
      }
    })

    const treeMatches = Math.abs(treePull) < 3
    const antiscreens = kappas.every(k => k.value > 4 * k.error)
    const proportionalToCa = kappaPulls.every(p => Math.abs(p) < 3)
    const sameForAdjoint = representation.every(
      r => Math.abs(r.sameRatePull) < 3,
    )
    // the three groups are independent measurements, so their pulls against the source-charge
    // alternative combine in quadrature
    const combinedSourceChargePull = Math.hypot(
      ...representation.map(r => r.alternativePull),
    )
    const sourceChargeExcluded = combinedSourceChargePull > 5
    // one degree of freedom per line through three points, chi^2 under 9 is inside 3 sigma
    const fitsHold = [u1, ...groups.map(g => g.rates)].every(
      r => r.fundamental.chi2 < 9 && r.adjoint.chi2 < 9,
    )
    const ok =
      treeMatches &&
      antiscreens &&
      proportionalToCa &&
      sameForAdjoint &&
      sourceChargeExcluded &&
      fitsHold

    const kappa =
      kappas.reduce((s, k) => s + k.value / k.error ** 2, 0) /
      kappas.reduce((s, k) => s + 1 / k.error ** 2, 0)
    // relative excess per unit C_A g^2 over the one-loop 2 b_0 / C_A = 22 / (48 pi^2)
    const impliedScaleRatio = Math.exp(
      kappa / tree / ((2 * 11) / (48 * Math.PI ** 2)),
    )

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the force ratio chi(2,2) / chi(1,1) starts from its exactly computed tree-level value and rises with g^2 at alpha + kappa C_A with the same positive kappa from SU(2), SU(3) and SU(4), and at the same rate for adjoint and fundamental sources, so the coupling grows with distance in proportion to the gluon color charge and not the source charge, the anti-screening behind asymptotic freedom',
      metrics: {
        kappaSu2: kappas[0]?.value ?? 0,
        kappaSu2Error: kappas[0]?.error ?? 0,
        kappaSu3: kappas[1]?.value ?? 0,
        kappaSu3Error: kappas[1]?.error ?? 0,
        kappaSu4: kappas[2]?.value ?? 0,
        kappaSu4Error: kappas[2]?.error ?? 0,
        largestKappaPull: Math.max(...kappaPulls.map(Math.abs)),
        adjointOverFundamentalSu2: representation[0]?.ratio ?? 0,
        adjointOverFundamentalSu3: representation[1]?.ratio ?? 0,
        adjointOverFundamentalSu4: representation[2]?.ratio ?? 0,
        largestSameRatePull: Math.max(
          ...representation.map(r => Math.abs(r.sameRatePull)),
        ),
        smallestSourceChargePull: Math.min(
          ...representation.map(r => Math.abs(r.alternativePull)),
        ),
        combinedSourceChargePull,
        treeLevelRatio: tree,
        impliedScaleRatio,
      },
      control: {
        u1Rate: alpha.value,
        u1RateError: alpha.error,
        u1ExtrapolatedToZero: u1Line.intercept,
        u1ExtrapolatedError: u1Line.interceptError,
        treePull,
        sourceChargeRatioSu2: 8 / 3,
        sourceChargeRatioSu3: 9 / 4,
        sourceChargeRatioSu4: 32 / 15,
      },
      notes:
        'L2, known physics: the color-charge scaling of the one-loop Yang-Mills running in Wilson loops at weak coupling on an 8^4 periodic box, at C_A g^2 = 0.6, 0.9, 1.2 for every non-abelian group, with the next order carried by the slope of each line so the leading rate is not biased by it. The rise of compact U(1) (C_A = 0) is not running, pure U(1) has nothing charged to run with. It is the self-coupling of the compact cos action, the alpha the non-abelian rates are measured against. kappa also holds C_A-proportional lattice constants that are not a logarithm, so the implied ratio of the two distances mixes running with those constants and is printed, not tested. Errors are binned jackknife, bins of 5 consecutive measurements.',
    })
  },
})
