// Stapp's quantum-Zeno holding: attention holds a mental state in place by continually re-imposing
// it, and the effort of attention is the rate of re-imposition. Henry Stapp reads the quantum Zeno
// effect (repeated observation freezes a state's evolution) as the physical basis of volition: the
// will keeps a chosen state present by measuring it fast enough that it cannot decay. A vibe self is
// a localized packet of charge that, left alone, diffuses under the committed conserving transport.
// If effort re-imposes the template, the packet should stay concentrated, and the holding strength
// should scale with the re-imposition rate.
//
// The earlier attempt failed two ways: re-imposing the FULL template saturated (any nonzero rate
// held everything), and a partial nudge that painted charge in violated conservation. The fix is a
// conservation-respecting restoring hop: each beat, with probability equal to the rate, every
// out-of-place charge takes one step back toward the center into an adjacent rest cell, moving
// charge, never creating it. Now the hold is graded, because diffusion and restoring compete beat by
// beat.
//
// Measured: the time-averaged spread of the packet falls monotonically as the re-imposition rate
// rises, from wide (free diffusion) to tight (strong holding), a clean graded law rather than a
// saturating switch. The holding strength is the rate of re-imposition, exactly Stapp's reading of
// the Zeno effect as effortful attention.
//
// The control is rate zero: no effort, pure conserved diffusion, the packet spreads to its widest.
// Against it every nonzero rate is tighter, and the tightening is monotone in the rate.
//
// Depth L2. It measures a graded holding law (spread versus re-imposition rate) under the committed
// conserving rule with a conservation-respecting restoring nudge, a model of Stapp's quantum-Zeno
// volition. Distinct from the free-will signature (E-SLF-0170, determined-yet-unpredictable): this
// is the effort-holds-a-state result.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { zenoHoldSpreadOverSizes } from '@/code/dynamics/zeno-holding'

const SIZES = [160, 200, 240, 280]
const REGION_FRACTION = 0.1
const BEATS = 300
const SEED = 5
const RATES = [0, 0.05, 0.1, 0.2, 0.4, 0.8]

export default experiment({
  id: 'selves/zeno-holding',
  code: 'E-SLF-0171',
  title:
    'the holding strength of a self scales monotonically with the rate of re-imposition, Stapp quantum-Zeno volition as a graded law under conservation',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const spreads = RATES.map(rate =>
      zenoHoldSpreadOverSizes({
        sizes: SIZES,
        regionFraction: REGION_FRACTION,
        beats: BEATS,
        rate,
        seed: SEED,
      }),
    )

    // rate zero: pure diffusion, the widest spread, the control
    const freeSpread = spreads[0]!
    // the strongest effort: the tightest hold
    const heldSpread = spreads[spreads.length - 1]!

    // the hold tightens monotonically as the rate rises (spread strictly falls)
    let monotone = true

    for (let i = 1; i < spreads.length; i++) {
      if (spreads[i]! > spreads[i - 1]! + 1e-9) {
        monotone = false
      }
    }

    // effort holds: the strongest re-imposition is much tighter than free diffusion
    const holds = heldSpread < freeSpread * 0.5
    const ok = monotone && holds && freeSpread > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a localized packet of charge diffuses under the committed conserving transport, and an effort that re-imposes the template at a tunable rate (each beat every out-of-place charge takes one conservation-respecting step back toward the center) holds it in place, with the time-averaged spread falling monotonically as the re-imposition rate rises, from wide free diffusion to a tight hold, a clean graded holding law, so the holding strength is the rate of re-imposition exactly as Stapp reads the quantum Zeno effect as effortful attention, with rate zero (pure diffusion, the widest spread) as the control',
      metrics: {
        freeSpread: Number(freeSpread.toFixed(3)),
        heldSpread: Number(heldSpread.toFixed(3)),
        spreadRatio: Number((heldSpread / freeSpread).toFixed(3)),
        monotone: monotone ? 1 : 0,
      },
      // CONTROL: rate zero is pure conserved diffusion with no effort, the widest spread.
      control: { freeSpread: Number(freeSpread.toFixed(3)) },
      notes:
        'Stapp quantum-Zeno volition (Stapp, and the Zeno-effect reading shared with Nirvanic and QCAT). Effort holds a state by re-imposing it, and the holding strength is the re-imposition rate, realized as a conservation-respecting restoring nudge, not a full state reset. Distinct from the free-will signature (E-SLF-0170).',
    })
  },
})
