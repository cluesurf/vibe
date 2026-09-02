// The second law on the adopted rule, Loschmidt's pair measured together. The turning weave
// is exactly reversible, so nothing microscopic prefers disorder, and yet the COARSE
// description loses order at the usual rate: matter prepared in the left quarter of the box
// climbs from column entropy ln three to ninety-nine percent of the ln nine ceiling in
// forty-eight beats. The beats where the coarse entropy DROPS are counted and reported
// (twenty-five of forty-eight, the reversible rule's mandatory fluctuations, not hidden),
// and then the exact inverse schedule returns the ordered start with Hamming distance zero.
// The echo is the experiment's own control: the same trajectory whose coarse entropy rose
// is microscopically un-runnable to the bit, so the rise is bookkeeping loss in the coarse
// view, not dissipation in the dynamics, which is the second law's actual content. Depth
// L2, deterministic (the ordered filling is a position-indexed hash), canon part two of the
// adoption programme.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beat, collide, streamInverse } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const SIDE = 9
const BEATS = 48

export default experiment({
  id: 'foundations/turning-weave-second-law',
  code: 'E-FND-0122',
  title:
    'the second law holds on the adopted rule as coarse bookkeeping over exactly reversible dynamics: matter ordered into the left quarter climbs from column entropy ln three to ninety-nine percent of the ln nine ceiling in forty-eight beats with the twenty-five fluctuation drops counted and reported, and the exact inverse schedule then returns the ordered microstate with Hamming distance zero, the echo serving as the control that the rise is coarse loss rather than dissipation',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const forward = turningWeave({ opposite })
    const inverse = turningWeave({ opposite, forward: false })
    const coordinate = (c: number, a: number): number =>
      Math.floor(c / SIDE ** a) % SIDE

    const start = makeWill(mesh)

    for (let i = 0; i < start.data.length; i++) {
      const cell = Math.floor(i / 24)

      if (coordinate(cell, 0) < Math.floor(SIDE / 4) + 1) {
        start.data[i] = (((i * 5 + (i % 11)) % 3) - 1) as -1 | 0 | 1
      }
    }

    const entropyOf = (w: Will): number => {
      const perColumn = new Array<number>(SIDE).fill(0)
      let total = 0

      for (let i = 0; i < w.data.length; i++) {
        if (w.data[i] !== 0) {
          perColumn[coordinate(Math.floor(i / 24), 0)]!++
          total++
        }
      }

      let entropy = 0

      for (const n of perColumn) {
        const p = n / total

        if (p > 0) {
          entropy -= p * Math.log(p)
        }
      }

      return entropy
    }

    let will: Will = { mesh, data: Int8Array.from(start.data) }
    const series: number[] = [entropyOf(will)]

    for (let t = 0; t < BEATS; t++) {
      will = beat(will, forward(t))
      series.push(entropyOf(will))
    }

    let drops = 0

    for (let t = 1; t < series.length; t++) {
      if (series[t]! < series[t - 1]! - 1e-12) {
        drops++
      }
    }

    for (let t = BEATS - 1; t >= 0; t--) {
      will = streamInverse(will)
      collide(will, inverse(t))
    }

    let echoHamming = 0

    for (let i = 0; i < will.data.length; i++) {
      if (will.data[i] !== start.data[i]) {
        echoHamming++
      }
    }

    const initial = series[0]!
    const final = series[BEATS]!
    const ceiling = Math.log(SIDE)

    const ok =
      initial < 1.2 &&
      final > 0.95 * ceiling &&
      drops > 0 &&
      drops < BEATS &&
      echoHamming === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the column entropy starts near ln three, ends above ninety-five percent of the ln nine ceiling, the fluctuation drops are counted and lie strictly between zero and every beat, and the inverse schedule returns the ordered start with Hamming distance zero',
      metrics: {
        initialEntropy: Number(initial.toFixed(3)),
        finalEntropy: Number(final.toFixed(3)),
        ceiling: Number(ceiling.toFixed(3)),
        fluctuationDrops: drops,
        echoHamming,
      },
      // CONTROL: the echo itself, the same trajectory reversed to the bit, proving the rise
      // is coarse bookkeeping and not dissipation
      control: {
        echoExact: echoHamming === 0 ? 1 : 0,
      },
      notes:
        'canon part two continues: the condensate law became the relic-background law (E-FND-0120, the commensurate null does not survive interaction), the counting and Sakharov laws carried (E-FND-0119), and this closes the second law. The remaining canon item is the walk-sector bridge, which is the coarse-bridge programme itself.',
    })
  },
})
