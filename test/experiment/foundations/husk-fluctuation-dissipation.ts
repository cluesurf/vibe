// Fluctuation and dissipation on the husk of the adopted knit: noise and drag from one bath, one temperature
// (E-FND-0156).
//
// THE QUESTION. The fluctuation-dissipation theorem says a subsystem in equilibrium with a bath jitters and relaxes by
// the same numbers: the size of its fluctuations fixes its response, and the time shape of its fluctuations is the time
// shape of its relaxation. On the model that is a test that one temperature governs the husk: E-FND-0148 read
// beta = 3.898 per unit from the occupations, the static side. The dynamic side and the equality are not tested.
//
// THE KNIT, THE SUBSYSTEM AND THE BATH. The coset-union vacuum under the lone bounce, side 12 (E-FND-0146 to 0148). The
// subsystem is one husk block of 4 x 4 x 4 columns (768 bulk docks), its energy E_b the knit's conserved energy there;
// the bath is the other 26 blocks. Starts hold 12, 16 or 20 extra vibes per dock in block 0, which sets the total
// energy and so the temperature; beats 121 to 420 are read.
//
// DERIVATION, before the gate run.
//  1. Static. In a canonical state Var(E_b) = - dE_b / dbeta. The total energy is conserved exactly, so B equal blocks
//     show (1 - 1/B) of that variance. So (B / (B - 1)) Var(E_b), read at the middle energy, must equal - dE_b / dbeta,
//     read as the change of the mean block energy E / B between the low and high energies over the change of beta, with
//     beta = b_slot + ln 9 from the husk occupations (E-FND-0148). Two independent readings of one number: noise and
//     the response of energy to temperature.
//  2. Dynamic (Onsager's regression). Add a small excess of 384 vibes (1/2 per dock, charge 0) to block 0 of an
//     equilibrium state and run it beside the same state without the excess: the difference of block 0's energy
//     between the twins, normalized to its start and averaged, is the response R(tau). It must equal the normalized
//     equilibrium autocorrelation C(tau) of the block energies of the unperturbed run.
//  3. The control: E-FND-0148's arm B (identity grid moves, empty vacuum), where the depth step is exact and the husk is
//     not Gibbs (Fano 12 times Fermi-Dirac). There the blocks are not one bath, and the static relation should fail.
//
// GATES, fixed before the gate run:
//  S1 static: on at least 5 of 6 link starts, (B / (B - 1)) Var(E_b) / (- dE_b / dbeta) lies in 0.85 to 1.15, and its
//     mean over the six lies in 0.9 to 1.1
//  S2 one thermometer: at every energy of every start, b_store - b_slot is within 0.02 of (1/2) ln 9 (the slot and store
//     thermometers read one beta, E-FND-0148's condition)
//  D1 regression: pooled over 6 starts x 5 origins x 2 excess phases (60 twins), |R(tau) - C(tau)| <= 0.05 for tau <= 4
//     and <= 0.12 for tau <= 24
//  C1 the control fails: on arm B the static ratio lies outside 0.85 to 1.15
// Verdict: pass if all hold.
//
// DISCLOSED: probes before this file. tmp/hc-probe3b (one start): static ratio 0.979 from 16 and 20; C(tau) 1, 0.649,
// 0.315, 0.082, -0.083 and R(tau) from 10 twins 1, 0.660, 0.291, 0.094, -0.086, later lags within about 0.11.
// tmp/hc-probe4 (one start, 12 / 16 / 20): static ratio 0.958 on the knit, 159 on arm B. The D1 and S1 bands were set
// after these probes.
//
// FIRST RUN (tmp/hc-exp34-run1.log, 204 s): pass, every gate, recorded as is. Static ratio 0.941 to 1.045, mean 0.995;
// thermometer gap 1.0962 to 1.1009; regression gap 0.031 to lag 4 and 0.096 to lag 24 over 60 twins; control ratio 159.
// Title written after the run.
//
// SECOND RUN, the full 17-start family (tmp/hc-fdt17-run1.log). No band moved: S1's 0.85 to 1.15 per start and 0.9 to
// 1.1 on the mean, S2's 0.02, D1's 0.05 and 0.12, C1's band. The first run's S1 allowed one of 6 starts outside the
// band; the same allowance of one start is kept for 17 (at least 16 of 17 in band), and the strict count is reported.
// D1 pools 17 x 5 x 2 = 170 twins. The first run's 6 starts are members 0 to 5 of the same family, rerun here.
// Result (439 s): pass, every gate. Static ratio in band on 17 of 17 (the allowance of one was not used), 0.941 to
// 1.045, mean 1.001; thermometer gap 1.0962 to 1.1009 on all 51 readings; beta 3.869 to 3.928; regression gap 0.025
// to lag 4 and 0.085 to lag 24 over 170 twins; control ratio 159. Members 0 to 5 reproduce the first run's ratios
// exactly. Title updated to the 17-start numbers.
//
// Depth L2. DETERMINISM: Weyl starts and excesses, the link-start family; nothing is drawn. NOTHING MOVES.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  arrowBox,
  blockEnergy,
  lowEntropyStart,
  makeHuskLaw,
  readHuskLaw,
  sampleHuskLaw,
  twoWay,
  type ArrowBox,
} from '@/code/measure/second-law-husk'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  addExcess,
  autocorrelation,
  variance,
} from '@/code/measure/fluctuation-dissipation'
import type { Reduced } from '@/code/measure/living-pair-kernel'

const SIDE = 12
const BLOCK = 4
const ENERGIES = [12, 16, 20]
const SETTLE = 120
const SAMPLE = 300
const MEMBERS = 17
const ORIGIN_EVERY = 60
const EXCESS = 384
const LAGS = 24
const LN9 = Math.log(9)
const HALF_LN9 = 0.5 * LN9

type Reading = {
  mean: number
  variance: number
  beta: number
  gap: number
  series: Float64Array[]
  origins: { state: Reduced; time: number }[]
}

function readAt(
  box: ArrowBox,
  perDock: number,
  phase: number,
  emptyVacuum = false,
): Reading {
  const r = twoWay(
    box,
    lowEntropyStart(box, { blocks: [0], perDock, phase, emptyVacuum }),
  )
  const e = new Float64Array(box.blocks)
  const law = makeHuskLaw(box.side)
  const series = Array.from(
    { length: box.blocks },
    () => new Float64Array(SAMPLE),
  )
  const pooled: number[] = []
  const origins: { state: Reduced; time: number }[] = []

  for (let t = 1; t <= SETTLE; t++) {
    r.forward()
  }

  for (let t = 0; t < SAMPLE; t++) {
    r.forward()
    blockEnergy(box, r.state(), e)

    for (let b = 0; b < box.blocks; b++) {
      ;(series[b] as Float64Array)[t] = e[b]!
      pooled.push(e[b]!)
    }

    sampleHuskLaw(box, law, r.state())

    if (t % ORIGIN_EVERY === 0) {
      origins.push({
        state: structuredClone(r.state()),
        time: r.time(),
      })
    }
  }

  const { mean, variance: v } = variance(pooled)
  const reading = readHuskLaw(law)

  return {
    mean,
    variance: v,
    beta: reading.betaSlot + LN9,
    gap: reading.betaStore - reading.betaSlot,
    series,
    origins,
  }
}

function staticRatio(box: ArrowBox, readings: Reading[]): number {
  const [lo, mid, hi] = readings as [Reading, Reading, Reading]
  const B = box.blocks

  return (
    ((B / (B - 1)) * mid.variance) /
    (-(hi.mean - lo.mean) / (hi.beta - lo.beta))
  )
}

export function huskFdtRun() {
  const started = Date.now()
  const members = startFamily(16).slice(0, MEMBERS)
  const ratios: number[] = []
  const gaps: number[] = []
  const betas: number[][] = []
  const cSum = new Float64Array(LAGS + 1)
  const rSum = new Float64Array(LAGS + 1)

  let twins = 0

  members.forEach((member, k) => {
    const box = withStart(member, () => arrowBox(SIDE, BLOCK))
    const readings = ENERGIES.map(perDock => readAt(box, perDock, k))
    const mid = readings[1]!

    ratios.push(staticRatio(box, readings))
    gaps.push(...readings.map(r => r.gap))
    betas.push(readings.map(r => r.beta))

    const c = autocorrelation(mid.series, LAGS)

    c.forEach((x, lag) => {
      cSum[lag] = cSum[lag]! + x / MEMBERS
    })

    mid.origins.forEach((origin, o) => {
      for (const phase of [0, 1]) {
        const pert = addExcess({
          box,
          state: origin.state,
          block: 0,
          count: EXCESS,
          phase: k * 100 + o * 2 + phase,
        })
        const a = twoWay(box, origin.state, origin.time)
        const b = twoWay(box, pert, origin.time)
        const ea = new Float64Array(box.blocks)
        const eb = new Float64Array(box.blocks)

        let d0 = 0

        for (let t = 0; t <= LAGS; t++) {
          blockEnergy(box, a.state(), ea)
          blockEnergy(box, b.state(), eb)

          const d = eb[0]! - ea[0]!

          if (t === 0) {
            d0 = d
          }

          rSum[t] = rSum[t]! + d / d0
          a.forward()
          b.forward()
        }

        twins++
      }
    })

    console.error(
      `member ${k} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  })

  const C = Array.from(cSum)
  const R = Array.from(rSum, x => x / twins)
  const diff = R.map((r, lag) => Math.abs(r - C[lag]!))
  const earlyDiff = Math.max(...diff.slice(0, 5))
  const allDiff = Math.max(...diff)

  // the control, arm B, first start
  const controlBox = withStart(members[0]!, () =>
    arrowBox(SIDE, BLOCK, 'union', 'lone', true),
  )
  const controlRatio = staticRatio(
    controlBox,
    ENERGIES.map(perDock => readAt(controlBox, perDock, 0, true)),
  )

  const inBand = ratios.filter(r => r >= 0.85 && r <= 1.15).length
  const s1 =
    inBand >= MEMBERS - 1 &&
    Math.abs(ratios.reduce((a, b) => a + b, 0) / MEMBERS - 1) <= 0.1
  const s2 = gaps.every(g => Math.abs(g - HALF_LN9) <= 0.02)
  const d1 = earlyDiff <= 0.05 && allDiff <= 0.12
  const c1 = controlRatio < 0.85 || controlRatio > 1.15
  const status = s1 && s2 && d1 && c1 ? 'pass' : 'fail'
  const meanRatio = ratios.reduce((a, b) => a + b, 0) / MEMBERS
  const range = (xs: number[], digits = 3): string =>
    `${Math.min(...xs).toFixed(digits)} to ${Math.max(...xs).toFixed(digits)}`

  return verdict({
    status,
    claim: `on the adopted knit (side ${SIDE}, a husk block of 768 docks as the subsystem, the other 26 as the bath, ${MEMBERS} link starts) noise and drag come from one bath at one temperature: the block energy's fluctuation, (B / (B - 1)) Var(E_b), is ${range(ratios)} of its response to temperature, - dE_b / dbeta (mean ${meanRatio.toFixed(3)}), with beta ${range(betas.flat())} per unit from the occupations and the slot and store thermometers apart by ${range(gaps, 4)} against (1/2) ln 9 = ${HALF_LN9.toFixed(4)}; and the relaxation of a 384-vibe excess, averaged over ${twins} twins, follows the equilibrium autocorrelation lag by lag (${R.slice(
      0,
      5,
    )
      .map(x => x.toFixed(3))
      .join(', ')} against ${C.slice(0, 5)
      .map(x => x.toFixed(3))
      .join(
        ', ',
      )} at lags 0 to 4, largest gap ${allDiff.toFixed(3)} to lag ${LAGS}); on the control where the depth step is exact and the husk is not Gibbs, the static ratio is ${controlRatio.toFixed(1)}`,
    metrics: {
      gate_S1: s1 ? 1 : 0,
      gate_S2: s2 ? 1 : 0,
      gate_D1: d1 ? 1 : 0,
      gate_C1: c1 ? 1 : 0,
      staticRatioMin: Math.min(...ratios),
      staticRatioMax: Math.max(...ratios),
      staticRatioMean: meanRatio,
      staticRatioInBand: inBand,
      members: MEMBERS,
      thermometerGapMin: Math.min(...gaps),
      thermometerGapMax: Math.max(...gaps),
      betaMin: Math.min(...betas.flat()),
      betaMax: Math.max(...betas.flat()),
      regressionEarlyGap: earlyDiff,
      regressionGap: allDiff,
      twins,
      controlStaticRatio: controlRatio,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      nonErgodicControlFails: c1 ? 1 : 0,
    },
    notes: `L2. Gates S1 ${s1}, S2 ${s2}, D1 ${d1}, C1 ${c1}. Static ratio per start: ${ratios.map(r => r.toFixed(3)).join(', ')}. Beta at 12 / 16 / 20 extra per dock, per start: ${betas.map(b => b.map(x => x.toFixed(4)).join(' / ')).join('; ')}. C(tau) lags 0 to ${LAGS}: ${C.map(x => x.toFixed(3)).join(' ')}. R(tau): ${R.map(x => x.toFixed(3)).join(' ')}. Lag 12 is the stream's period on the side-12 box, where a free vibe returns to its dock. What this is not: a response to an external field (the knit has no field to apply here); the excess plays that part, as in Onsager's regression. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'foundations/husk-fluctuation-dissipation',
  code: 'E-FND-0156',
  title:
    "fluctuation and dissipation on the husk of the adopted knit, pass: a husk block's energy fluctuation is 0.941 to 1.045 of its response to temperature on 17 of 17 link starts (mean 1.001, beta 3.87 to 3.93 per unit), and the relaxation of an added excess follows the block's equilibrium autocorrelation lag by lag (within 0.025 to lag 4 and 0.085 to lag 24, 170 twins), so noise and drag come from one bath at one temperature; on the control where the depth step is exact and the husk is not Gibbs the static relation fails by a factor of 159",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run: huskFdtRun,
})
