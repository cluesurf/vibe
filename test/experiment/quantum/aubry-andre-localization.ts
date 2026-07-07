// Aubry-Andre localization emerges from the coin's own Dirac walk under a DETERMINISTIC quasiperiodic
// modulation, with no randomness at all. A wave on a periodic lattice normally spreads forever. But if
// the lattice is modulated by a pattern that never repeats, because its period is irrational relative
// to the cells (a golden-ratio cosine), then above a critical strength the wave is TRAPPED: it stops
// spreading and stays localized near where it started. This is the Aubry-Andre transition, the clean
// deterministic cousin of Anderson localization. Crucially it needs a quasiperiodic pattern, NOT a
// random one, so it fits a fully deterministic substrate.
//
// Measured on the {3,4,3,4} coin's single-particle sector (the two-component coined Dirac walk): the
// local mass is modulated as m(x) = m0 + lambda * cos(2 pi phi x), phi the golden ratio. A packet is
// launched at the centre and its spread (the standard deviation of the position) is measured as the
// number of steps grows. The definitive signature of localization is that the spread SATURATES with
// time when localized, but grows LINEARLY (ballistically) with no modulation.
//
// - PREDICTION: with a strong quasiperiodic modulation the walk localizes, so its spread barely grows
//   as the step count increases (spread at 500 steps within a small factor of the spread at 100 steps),
//   and the final spread is a small bounded number, tens of times smaller than the delocalized case.
// - CONTROL: with NO modulation (lambda = 0) the same walk is ballistic, so its spread grows LINEARLY
//   with the step count (spread at 500 steps is about five times the spread at 100 steps). The contrast
//   between a bounded, saturating spread and a linearly growing one is localization, not an artefact.
//
// Depth L3. Localization is a MEASURED consequence of the {3,4,3,4} coin's own Dirac walk under a
// deterministic quasiperiodic modulation (not a built state, not random disorder, not an imported
// mobility edge), with the ballistic zero-modulation walk as the control that shows the effect vanish.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { quasiperiodicWalkSpread } from '@/code/dynamics/quasiperiodic-walk'

const SIZE = 1400
const MASS = 0.3
const WIDTH = 6
const LAMBDA = 1.5
const STEPS_SHORT = 100
const STEPS_LONG = 500

function spread(lambda: number, steps: number): number {
  return quasiperiodicWalkSpread({ size: SIZE, steps, mass: MASS, lambda, width: WIDTH })
}

export default experiment({
  id: 'quantum/aubry-andre-localization',
  code: 'E-QTM-0075',
  title:
    'Aubry-Andre localization from the coin\'s own Dirac walk: a deterministic quasiperiodic (golden-ratio) mass modulation traps the walk so its spread saturates with time (spread at 500 steps within about 1.8 times the spread at 100 steps and tens of times smaller than the delocalized case), while a zero modulation spreads ballistically (spread grows about five-fold, linearly in time)',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L3',
  paper: true,
  run() {
    // localized: strong quasiperiodic modulation, spread saturates with time
    const localizedShort = spread(LAMBDA, STEPS_SHORT)
    const localizedLong = spread(LAMBDA, STEPS_LONG)
    const localizedGrowth = localizedLong / localizedShort

    // CONTROL: no modulation, ballistic, spread grows linearly with time
    const ballisticShort = spread(0, STEPS_SHORT)
    const ballisticLong = spread(0, STEPS_LONG)
    const ballisticGrowth = ballisticLong / ballisticShort

    // localization = saturating (bounded) vs linearly-growing spread, and a large absolute suppression
    const stepRatio = STEPS_LONG / STEPS_SHORT
    const localizedSaturates = localizedGrowth < 2 // far below the ballistic step ratio (5)
    const ballisticGrows = Math.abs(ballisticGrowth - stepRatio) < 0.5 // linear in time
    const suppression = ballisticLong / localizedLong
    const stronglySuppressed = suppression > 10

    const ok = localizedSaturates && ballisticGrows && stronglySuppressed

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a packet on the coined Dirac walk under a deterministic golden-ratio quasiperiodic mass modulation localizes: its spread saturates with time (grows under 2x from 100 to 500 steps) and is more than ten times smaller than the unmodulated walk, whose spread grows about five-fold (linearly in time), so Aubry-Andre localization is an emergent consequence of the discrete rule under quasiperiodic (not random) modulation',
      metrics: {
        localizedGrowth: Number(localizedGrowth.toFixed(3)),
        localizedFinalSpread: Number(localizedLong.toFixed(3)),
        suppression: Number(suppression.toFixed(2)),
      },
      // CONTROL: with no modulation the walk is ballistic (spread grows linearly, ~5x over 5x the steps).
      control: {
        ballisticGrowth: Number(ballisticGrowth.toFixed(3)),
        ballisticFinalSpread: Number(ballisticLong.toFixed(3)),
      },
      notes:
        'Aubry-Andre localization measured on the {3,4,3,4} coin\'s own Dirac walk (code/dynamics/quasiperiodic-walk): a deterministic golden-ratio quasiperiodic mass modulation traps the walk (spread saturates, >10x suppression vs ballistic), the unmodulated control spreads linearly. Deterministic (quasiperiodic, never random). L3, emergent on the committed substrate sector.',
    })
  },
})
