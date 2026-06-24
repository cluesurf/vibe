// Abiogenesis as a threshold. A self-maintaining region (a droplet of the self phase) nucleates only above a
// critical seed size. Below it, surface tension wins and the pattern dies, its repair losing to its decay. Above
// it, the region holds its mass and persists, the first self-maintaining pattern. This is the origin-of-life
// transition modeled as a critical nucleus, the spatial form of the maintenance-threshold result.
//
// L3 with a control (the sub-critical seed dies), deterministic. Compute in code/dynamics/nucleation.

import { nucleate } from '@/code/dynamics/nucleation'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'selves/abiogenesis-threshold',
  title:
    'a self-maintaining region nucleates above a critical seed size and dies below it, the abiogenesis transition',
  category: 'selves',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const common = {
      side: 81,
      neighborRadius: 3,
      stay: 0.42,
      grow: 0.55,
      beats: 60,
    }

    // sweep seed radius across the threshold
    const radii = [2, 3, 4, 6, 8, 10]
    const sweep = radii.map(seedRadius => ({
      seedRadius,
      ...nucleate({ ...common, seedRadius }),
    }))

    const subCritical = sweep.filter(s => s.seedRadius <= 3)
    const superCritical = sweep.filter(s => s.seedRadius >= 6)

    const smallDie = subCritical.every(s => !s.survived && s.finalFraction < 0.004)
    const largePersist = superCritical.every(s => s.survived)
    // a real threshold: persistence is monotone in seed size (no large dies, no small survives)
    const thresholdSharp =
      sweep.every((s, i) => i === 0 || !(s.survived === false && sweep[i - 1]!.survived === true))

    const ok = smallDie && largePersist && thresholdSharp

    const small = subCritical[subCritical.length - 1]!
    const large = superCritical[0]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'below a critical seed size the self-maintaining region dies out (repair loses to surface tension) and above it the region holds its mass and persists, a deterministic critical-nucleus threshold, the abiogenesis transition',
      metrics: {
        largeSeedFinalFraction: large.finalFraction,
        largeSeedInitialFraction: large.initialFraction,
      },
      control: { smallSeedFinalFraction: small.finalFraction },
      notes:
        'L3 deterministic nucleation. life begins as a critical nucleus, the spatial form of the maintenance threshold (repair beats decay only above a critical size)',
    })
  },
})
