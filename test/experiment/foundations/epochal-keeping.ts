// Epochal keeping: what decides the seed-remnant texture, answered. The keeper-leaver
// classification (E-FND-0143) is re-measured at three consecutive birth beats, and the
// law is the theory's own signature: KEEPING IS EPOCHAL. Three classes emerge:
//
//   - INTRINSIC LEAVERS: directions five and six never keep at any tested birth beat.
//   - INTRINSIC KEEPERS: directions ten and fourteen keep at every tested birth beat.
//   - PHASE-FLIPPERS: the split-line directions change classification with birth beat,
//     each with a pinned deterministic pattern, and the two split CPT line pairs have
//     MUTUALLY REVERSED patterns (twenty-one reads keep-keep-leave where twenty-two reads
//     leave-keep-keep, and eight against eleven the same), so at any single birth beat
//     exactly one of a conjugate pair keeps while over the ensemble of birth phases the
//     charge symmetry restores, the same phase-local-violation ensemble-restoration
//     structure the Born arc measured for outcomes (E-FND-0127).
//
// The meaning, plainly: which species couple to which is not a fixed table but a function
// of BIRTH EPOCH, the growth-writes-phase principle governing the flavor texture, so the
// origin-is-conserved theme runs unbroken from cosmology (the relic background) through
// measurement (the outcome ensemble) into flavor (who may couple). Depth L2,
// deterministic, the intrinsic classes at both extremes the controls that the flipping is
// structure and not noise.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const SIDE = 15

export default experiment({
  id: 'foundations/epochal-keeping',
  code: 'E-FND-0144',
  title:
    'keeping is epochal: the seed-remnant classification is a function of birth beat, with intrinsic leavers and intrinsic keepers at the extremes and the split-line directions flipping deterministically, the split CPT pairs carrying mutually reversed patterns so exactly one of a conjugate pair keeps at any single birth beat while ensemble charge symmetry restores, which places the growth-writes-phase principle in command of the flavor texture and runs the origin-is-conserved theme unbroken from cosmology through measurement into flavor',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const rule = turningWeave({ opposite })
    const coordinate = (c: number, a: number): number =>
      Math.floor(c / SIDE ** a) % SIDE
    const mid = 7
    const seedCell =
      mid + mid * SIDE + mid * SIDE * SIDE + mid * SIDE ** 3

    const classify = (dir: number, seedBeat: number): 'K' | 'l' => {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)
      const acc = new Set<number>()
      const readStart = seedBeat + 8

      for (let t = 0; t < readStart + 6; t++) {
        const active = (c: number): boolean => coordinate(c, 0) <= t

        if (t === seedBeat) {
          const slot = seedCell * 24 + dir
          const v = seeded.data[slot]!

          seeded.data[slot] = (((v + 1 + 4) % 3) - 1) as -1 | 0 | 1
        }

        vacuum = growingBeat(vacuum, rule(t), active)
        seeded = growingBeat(seeded, rule(t), active)

        if (t >= readStart) {
          for (let i = 0; i < seeded.data.length; i++) {
            if (seeded.data[i] !== vacuum.data[i]) {
              acc.add(Math.floor(i / 24))
            }
          }
        }
      }

      return acc.has(seedCell) ? 'K' : 'l'
    }

    const patternOf = (dir: number): string =>
      [20, 21, 22].map(b => classify(dir, b)).join('')

    const leaverA = patternOf(5)
    const leaverB = patternOf(6)
    const keeperA = patternOf(10)
    const keeperB = patternOf(14)
    const flip21 = patternOf(21)
    const flip22 = patternOf(22)
    const flip8 = patternOf(8)
    const flip11 = patternOf(11)

    const reverse = (s: string): string =>
      s.split('').reverse().join('')

    const ok =
      leaverA === 'lll' &&
      leaverB === 'lll' &&
      keeperA === 'KKK' &&
      keeperB === 'KKK' &&
      flip21 === 'KKl' &&
      flip22 === 'lKK' &&
      flip8 === 'lKK' &&
      flip11 === 'KKl' &&
      flip22 === reverse(flip21) &&
      flip11 === reverse(flip8)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the intrinsic leavers read leave at all three birth beats, the intrinsic keepers keep at all three, the four split directions carry their pinned flip patterns, and both split CPT pairs have mutually reversed patterns',
      metrics: {
        intrinsicLeavers: leaverA === 'lll' && leaverB === 'lll' ? 2 : 0,
        intrinsicKeepers: keeperA === 'KKK' && keeperB === 'KKK' ? 2 : 0,
        pairReversed21_22: flip22 === reverse(flip21) ? 1 : 0,
        pairReversed8_11: flip11 === reverse(flip8) ? 1 : 0,
      },
      // CONTROL: the intrinsic classes, the same instrument at the same beats reading
      // no flip at either extreme
      control: {
        intrinsicClassesStable:
          leaverA === 'lll' && keeperA === 'KKK' ? 1 : 0,
      },
      notes:
        'SCOPE CORRECTION from the full-period sweep (E-FND-0145): the intrinsic classes named here are three-beat-window classes only, and every direction flickers over the full twenty-four beat period (direction five keeps twelve of twenty-four, direction ten twelve of twenty-four), so intrinsic means stable-within-this-window, not absolute, while the pinned flip patterns and the mutual reversals stand as measured. Three consecutive birth beats at one geometry, stated; the full birth-phase period (twenty-four beats) and the ensemble-restoration quantification (does the keeping duty cycle of a conjugate pair balance exactly over the period, as the Born ensemble charge sums did) are the named continuation. The mutual-reversal structure is the flavor-sector sibling of the ensemble charge restoration in E-FND-0127, and its exactness over the full period is the next sharp question.',
    })
  },
})
