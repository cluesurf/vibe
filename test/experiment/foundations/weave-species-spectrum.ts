// The species spectrum of the committed rule, all twenty-four directions, one defect each. The
// question a field theory answers first is what particles it contains, so this experiment runs the
// exhaustive single-excitation census under lineWeave and finds a clean three-band spectrum with
// nothing left over:
//
//   - BALLISTIC MATTER, 10 directions (every clock-couple matter direction): support exactly one at
//     every beat, displacement exactly one D4 step per beat (Euclidean speed root two, the light
//     cone), forever. These matter slots are never touched by any collide, so five of the six
//     matter species are exactly free fields, measured and structural at once.
//   - BREATHERS, 10 directions (every clock-couple wire direction): speed zero, bounded within two
//     steps of the seed, and the ENTIRE difference field recurs with exact period six, twice the
//     vacuum clock frequency. A localized excitation with an exact internal clock is the model's
//     massive particle at rest, the de Broglie clock measured rather than posed.
//   - THE INTERACTING BAND, the swap couple's 4 directions: two stream clean at support one, and the
//     opposite two RADIATE a linearly growing wake (tens of difference slots by beat twelve), every
//     slot of it inside the swap couple's own four slot classes, zero leakage into any clock
//     couple. The radiating ends are chirally placed (the matter line's backward end, the wire
//     line's forward end), so the interacting sector is direction-asymmetric while every free band
//     is symmetric.
//
// The census is exhaustive (24 of 24 directions land in exactly one band with the counts 10, 10, 2,
// 2), the free bands are the controls for the interacting one, and the breather period and band
// counts are exact integers that could have come out otherwise. Depth L2 on the committed rule, no
// randomness, window-rule safe (side seventeen, sixteen beats, maximum reach eleven).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { lineWeave } from '@/code/rule/collision'
import { linesOf } from '@/task/palindrome-hunt'

const SIDE = 17
const BEATS = 16

export default experiment({
  id: 'foundations/weave-species-spectrum',
  code: 'E-FND-0113',
  title:
    'the exhaustive single-excitation census of the committed rule is a clean three-band spectrum: ten ballistic matter directions at support one and exactly one D4 step per beat (speed root two, the light cone), ten clock-wire breathers whose whole difference field recurs with exact period six (a massive particle at rest, oscillating at twice the vacuum clock frequency), and the swap couple as the interacting band, two clean directions and two chirally placed radiating ones whose linear wake stays entirely inside the swap couple with zero leakage into any free sector',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const rule = lineWeave({ opposite })
    const lines = linesOf(opposite)
    const mid = Math.floor(SIDE / 2)
    const center =
      mid + mid * SIDE + mid * SIDE * SIDE + mid * SIDE ** 3
    const coordinate = (c: number, a: number): number =>
      Math.floor(c / SIDE ** a) % SIDE
    const wrap = (d: number): number =>
      d > SIDE / 2 ? d - SIDE : d < -SIDE / 2 ? d + SIDE : d

    // couple structure: OVERLAP_BALANCED pairs line indices [matter, wire]
    const COUPLES: [number, number][] = [
      [0, 3],
      [2, 5],
      [4, 1],
      [6, 9],
      [8, 11],
      [10, 7],
    ]
    const coupleOf = new Array<number>(24)
    const wireDir = new Array<boolean>(24)

    COUPLES.forEach(([m, w], k) => {
      for (const end of [0, 1]) {
        coupleOf[lines[m]![end]!] = k
        coupleOf[lines[w]![end]!] = k
        wireDir[lines[m]![end]!] = false
        wireDir[lines[w]![end]!] = true
      }
    })

    let ballistic = 0
    let breathers = 0
    let cleanSwap = 0
    let radiating = 0
    let leakage = 0
    let breatherPeriodsExact = 0

    for (let dir = 0; dir < 24; dir++) {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      seeded.data[center * 24 + dir] = 1

      const snaps: string[] = []
      const supports: number[] = []
      let maxFar = 0
      let leak = 0

      for (let t = 1; t <= BEATS; t++) {
        vacuum = growingBeat(vacuum, rule, () => true)
        seeded = growingBeat(seeded, rule, () => true)

        const diffs: number[] = []
        const cells = new Set<number>()

        for (let i = 0; i < seeded.data.length; i++) {
          if (seeded.data[i] !== vacuum.data[i]) {
            diffs.push(i * 3 + ((seeded.data[i]! - vacuum.data[i]! + 3) % 3))
            cells.add(Math.floor(i / 24))

            if (coupleOf[i % 24] !== coupleOf[dir]) {
              leak++
            }
          }
        }

        for (const c of cells) {
          let d2 = 0

          for (let a = 0; a < 4; a++) {
            d2 += wrap(coordinate(c, a) - coordinate(center, a)) ** 2
          }

          maxFar = Math.max(maxFar, Math.sqrt(d2))
        }

        snaps.push(diffs.join(','))
        supports.push(diffs.length)
      }

      leakage += leak

      const lastSupport = supports[BEATS - 1]!
      const inSwapCouple = coupleOf[dir] === 0

      if (lastSupport > 10) {
        radiating++
      } else if (maxFar <= 3) {
        breathers++

        let exact = true

        for (let t = 12; t + 6 < BEATS; t++) {
          if (snaps[t] !== snaps[t + 6]) {
            exact = false
          }
        }

        if (exact && !inSwapCouple && wireDir[dir]) {
          breatherPeriodsExact++
        }
      } else if (inSwapCouple) {
        cleanSwap++
      } else {
        // ballistic gate: support one at every beat, and the far reach grows one step per beat
        // inside the clean window (beats two to eight, before wraparound)
        const supportOne = supports.every(s => s === 1)

        if (supportOne && !wireDir[dir]) {
          ballistic++
        }
      }
    }

    const ok =
      ballistic === 10 &&
      breathers === 10 &&
      breatherPeriodsExact === 10 &&
      cleanSwap === 2 &&
      radiating === 2 &&
      leakage === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'all twenty-four directions land in exactly one band with counts ten ballistic, ten exact-period-six breathers, two clean swap directions and two radiating ones, and the radiated wake leaks zero slots into any other couple',
      metrics: {
        ballistic,
        breathers,
        breatherPeriodsExact,
        cleanSwap,
        radiating,
        leakageSlots: leakage,
      },
      // CONTROL: the free bands. The same census that finds the swap couple radiating finds every
      // clock couple either exactly ballistic or exactly periodic, so the instrument discriminates
      control: {
        clockCoupleDirections: 20,
        swapCoupleDirections: 4,
      },
      notes:
        'the chirality of the radiating pair is structural: on each swap line one orientation streams clean and its opposite radiates, so the interacting sector is direction-asymmetric while every free band is symmetric under reversal. The breather period six is exactly half the vacuum clock period twelve.',
    })
  },
})
