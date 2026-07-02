// Abiogenesis as a threshold. A self-maintaining region (a droplet of the self phase) nucleates only above a
// critical seed size. Below it, surface tension wins and the pattern dies, its repair losing to its decay. Above
// it, the region holds its mass and persists, the first self-maintaining pattern. This is the origin-of-life
// transition modeled as a critical nucleus, the spatial form of the maintenance-threshold result.
//
// Honest scope: the nucleate rule is a hand-tuned irreversible majority-hysteresis rule (stay 0.42 < grow
// 0.55), an imposed maintenance ingredient, NOT the base rule. What the experiment measures is the sharp
// critical radius that rule produces (the bracket, radius 5 dies, radius 6 persists). Depth L2 with a control
// (the sub-critical seed dies), deterministic. Compute in code/dynamics/nucleation.

import { nucleate } from '@/code/dynamics/nucleation'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'selves/abiogenesis-threshold',
  code: 'E-SLF-0001',
  title:
    'a self-maintaining region nucleates above a critical seed size and dies below it, the abiogenesis transition',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const common = {
      side: 81,
      neighborRadius: 3,
      stay: 0.42,
      grow: 0.55,
      beats: 60,
    }

    // sweep seed radius across the threshold (5 and 6 bracket it)
    const radii = [2, 3, 4, 5, 6, 8, 10]
    const sweep = radii.map(seedRadius => ({
      seedRadius,
      ...nucleate({ ...common, seedRadius }),
    }))

    const subCritical = sweep.filter(s => s.seedRadius <= 5)
    const superCritical = sweep.filter(s => s.seedRadius >= 6)

    const smallDie = subCritical.every(
      s => !s.survived && s.finalFraction === 0,
    )

    const largePersist = superCritical.every(s => s.survived)
    // a real threshold: persistence is monotone in seed size (no large dies, no small survives)
    const thresholdSharp = sweep.every(
      (s, i) =>
        i === 0 ||
        !(s.survived === false && sweep[i - 1]!.survived === true),
    )

    // the measured critical radius, the largest dying seed and the smallest persisting seed
    const criticalRadiusBelow = subCritical.reduce(
      (max, s) => (!s.survived ? Math.max(max, s.seedRadius) : max),
      0,
    )

    const criticalRadiusAbove = sweep.reduce(
      (min, s) => (s.survived ? Math.min(min, s.seedRadius) : min),
      Infinity,
    )

    const ok = smallDie && largePersist && thresholdSharp

    const small = subCritical[subCritical.length - 1]!
    const large = superCritical[0]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'below a critical seed size the self-maintaining region dies out (repair loses to surface tension) and above it the region holds its mass and persists, a deterministic critical-nucleus threshold measured to lie between seed radius 5 and 6, the abiogenesis transition under a hand-tuned maintenance rule',
      metrics: {
        criticalRadiusBelow,
        criticalRadiusAbove,
        largeSeedFinalFraction: large.finalFraction,
        largeSeedInitialFraction: large.initialFraction,
      },
      control: { smallSeedFinalFraction: small.finalFraction },
      notes:
        'L2 deterministic nucleation. The nucleate rule is a hand-tuned irreversible majority-hysteresis rule (stay 0.42 < grow 0.55), an imposed maintenance ingredient, not the base rule, so the measured content is the sharp critical radius that rule produces, bracketed at 5 to 6. Survival is a RELATIVE criterion (final at least half of initial, and the surviving droplets are frozen fixed points with final exactly equal to initial), the old absolute floor misclassified small perfectly persisting droplets. Prior art: classical nucleation theory (the critical droplet) and bootstrap percolation',
    })
  },
})
