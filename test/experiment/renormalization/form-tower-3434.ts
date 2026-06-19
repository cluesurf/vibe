// P197: the form-coherence tower on the flat 3D cusp ({4,3,4} cubic). The exact 9-state permutation rule with
// a SYMMETRIC update, coarse-grained by compact blocks, the form-persistence (net-charge-per-block lag
// autocorrelation) RISES with coarse scale and beats a spatial-shuffle null, a coherence tower in 3D. Ported
// from the throwaway probe. Run: npx tsx code/experiment/p197-form-tower-3434.ts

import { makeRng } from '@/code/tool/rng'
import { lagAutocorrelation } from '@/code/measure/persistence'
import { perceptionMatchingSweep3d } from '@/code/rule/perception-permutation'
import {
  coarseFieldByGroup,
  cubicBlockGroups,
} from '@/code/coarse/group-field'
import { shuffledToneField } from '@/code/control/null'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const L = 48

export function formTower(): {
  real: number[]
  nul: number[]
  tower: boolean
} {
  const N = L * L * L
  const rng = makeRng({ seed: 12345 })
  const tone = new Int8Array(N),
    m = new Uint8Array(N)

  const step = (): void =>
    perceptionMatchingSweep3d({ tone, matched: m, length: L, rng })

  for (let f = 0; f < 60; f++) {
    step()
  }

  const blocks = [1, 2, 4, 8]
  const blockGroups = blocks.map(b =>
    cubicBlockGroups({ size: L, blockSize: b }),
  )

  const coarse = (t: Int8Array, bi: number): Float64Array =>
    coarseFieldByGroup({
      field: t,
      group: blockGroups[bi]!.group,
      groupCount: blockGroups[bi]!.groupCount,
    })

  const LAG = 10,
    M = 30

  const realS: Float64Array[][] = blocks.map(() => []),
    nulS: Float64Array[][] = blocks.map(() => [])

  for (let f = 0; f < M + LAG; f++) {
    step()
    const sh = shuffledToneField({ tone, rng })
    blocks.forEach((_, bi) => {
      realS[bi]!.push(coarse(tone, bi))
      nulS[bi]!.push(coarse(sh, bi))
    })
  }

  const persist = (ser: Float64Array[]): number =>
    Math.round(
      lagAutocorrelation({ series: ser, lag: LAG, epsilon: 1e-9 }) *
        100,
    ) / 100

  const real = blocks.map((_, bi) => persist(realS[bi]!)),
    nul = blocks.map((_, bi) => persist(nulS[bi]!))

  const tower =
    real[real.length - 1]! > real[0]! + 0.15 &&
    real[real.length - 1]! > (nul[nul.length - 1]! ?? 0) + 0.2

  return { real, nul, tower }
}

export default experiment({
  id: 'renormalization/form-tower-3434',
  title:
    'coarse-grained form-persistence rises with scale and beats a spatial-shuffle null on the 3D cusp',
  category: 'renormalization',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = formTower()

    return verdict({
      status: r.tower ? 'pass' : 'fail',
      claim:
        'under the 9-state permutation rule on the cubic cusp, the block net-charge persistence climbs with coarse scale and beats a spatial-shuffle null, a coherence tower in 3D',
      metrics: {
        finePersistence: r.real[0] ?? 0,
        coarsePersistence: r.real[r.real.length - 1] ?? 0,
        nullCoarsePersistence: r.nul[r.nul.length - 1] ?? 0,
        tower: r.tower ? 1 : 0,
      },
      control: {
        nullCoarsePersistence: r.nul[r.nul.length - 1] ?? 0,
      },
      notes:
        'L2 with a spatial-shuffle control. The persistence is measured from the dynamics and the shuffle null guards against plain averaging, which is the strength. But the run uses a random fill and a random update order, so this is a STATISTICAL ensemble claim, not a property of a deterministic rule, and robustness should come from varying SIZE rather than the seed. Not yet a clean emergent self, the asymmetric update and the randomness keep it L2.',
    })
  },
})
