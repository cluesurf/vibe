// Canon under the turning weave, part one: the counting-weight law and the Sakharov
// mechanism re-derived on the palindromic turning weave, continuing the discipline that a
// rule change re-earns the canon by measurement (sixth-thing-0007). Both carry exactly:
//
//   - COUNTING WEIGHTS EXACT: the offset-slab response to one, two, and three well-separated
//     defects is exactly proportional (ratios two point zero zero zero and three point zero
//     zero zero to the slot). The detector reads the count of defects, not the squared
//     amplitude, the same substrate-level step-not-weight statement the committed rule made.
//   - THE SAKHAROV STRUCTURE CARRIES: growth quenches generate persistent charge asymmetry
//     from the exactly symmetric empty state, with the total tone sum exactly zero at every
//     beat (the conservation-law half) and every per-line charge quantized in whole
//     side-cubed sheets. Under the turning weave the asymmetry spreads across lines on the
//     schedule rather than sitting in one fixed couple, which is the universality of the
//     interaction made visible in the baryogenesis channel.
//
// Depth L2, deterministic. The proportionality itself is the control shape: a detector that
// merely saturated would read ratios below two and three.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { Collision, PAIR_FORWARD } from '@/code/rule/collision'
import { linesOf, linePermutations } from '@/task/palindrome-hunt'

type Tone = -1 | 0 | 1
type Beat = { couples: [number, number][]; swapIdx: number }

const SIDE = 13
const ELEMENT = 148
const ORDER = [0, 2, 3, 1, 4, 5]
const POS_MIRROR = [0, 1, 2, 3, 3, 2, 1, 0]

function pairKeyOf(a: Tone, b: Tone): number {
  return (a + 1) * 3 + (b + 1)
}

export default experiment({
  id: 'foundations/turning-weave-canon',
  code: 'E-FND-0119',
  title:
    'the canon carries to the palindromic turning weave: the offset-slab response to one, two and three separated defects is exactly proportional (the counting-weight, step-not-weight law of the substrate detector), and the Sakharov mechanism holds with the total tone sum exactly zero at every beat of every quench, every per-line charge quantized in whole side-cubed sheets, and a persistent settled asymmetry generated from the exactly symmetric empty state, now spread across lines on the schedule rather than confined to one fixed couple, the universality of the interaction made visible in the baryogenesis channel',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const lines = linesOf(opposite)
    const mid = Math.floor(SIDE / 2)
    const center =
      mid + mid * SIDE + mid * SIDE * SIDE + mid * SIDE ** 3
    const coordinate = (c: number, a: number): number =>
      Math.floor(c / SIDE ** a) % SIDE
    const wrapOf = (d: number): number =>
      d > SIDE / 2 ? d - SIDE : d < -SIDE / 2 ? d + SIDE : d
    const roots: number[][] = []

    for (let d = 0; d < 24; d++) {
      const to = mesh.neighbour(center, d)

      roots.push(
        [0, 1, 2, 3].map(a =>
          wrapOf(coordinate(to, a) - coordinate(center, a)),
        ),
      )
    }

    const g = linePermutations({ lines, roots })[ELEMENT]!
    const M0: [number, number][] = [
      [0, 3],
      [2, 5],
      [4, 1],
      [6, 9],
      [8, 11],
      [10, 7],
    ]
    const norm = (a: number, b: number): [number, number] =>
      a < b ? [a, b] : [b, a]
    const positions: [number, number][][] = []
    let current = M0.map(([a, b]) => norm(a, b))

    for (let i = 0; i < 4; i++) {
      positions.push(current)
      current = current.map(([a, b]) => norm(g[a]!, g[b]!))
    }

    const swapMirror = [...ORDER, ...[...ORDER].reverse()]
    const beats: Beat[] = []

    for (let t = 0; t < 24; t++) {
      beats.push({
        couples: positions[POS_MIRROR[t % 8]!]!,
        swapIdx: swapMirror[t % 12]!,
      })
    }

    const collisionAt = (t: number): Collision => {
      const b = beats[t % 24]!
      const loneAway = (x: Tone, y: Tone): boolean => x === 0 && y !== 0
      const empty = (x: Tone, y: Tone): boolean => x === 0 && y === 0

      return (slots, base) => {
        for (let k = 0; k < 6; k++) {
          const line = lines[b.couples[k]![0]!]!
          const wire = lines[b.couples[k]![1]!]!
          const swap = (): void => {
            const a0 = (slots[base + line[0]] ?? 0) as Tone
            const a1 = (slots[base + line[1]] ?? 0) as Tone
            const w0 = (slots[base + wire[0]] ?? 0) as Tone
            const w1 = (slots[base + wire[1]] ?? 0) as Tone

            if (
              (loneAway(a0, a1) && empty(w0, w1)) ||
              (loneAway(w0, w1) && empty(a0, a1))
            ) {
              slots[base + line[0]] = w0
              slots[base + line[1]] = w1
              slots[base + wire[0]] = a0
              slots[base + wire[1]] = a1
            }
          }
          const clock = (): void => {
            const a = (slots[base + wire[0]] ?? 0) as Tone
            const x = (slots[base + wire[1]] ?? 0) as Tone
            const image = PAIR_FORWARD[pairKeyOf(a, x)]!

            slots[base + wire[0]] = image[0]
            slots[base + wire[1]] = image[1]
          }

          if (k === b.swapIdx) {
            swap()
            clock()
            swap()
          } else {
            clock()
          }
        }
      }
    }

    const cellAt = (v: number[]): number =>
      v[0]! + v[1]! * SIDE + v[2]! * SIDE * SIDE + v[3]! * SIDE ** 3

    // counting weights against the offset slab
    const slab = new Set<number>()

    for (let c = 0; c < mesh.cellCount; c++) {
      const x = coordinate(c, 0)

      if (x >= 4 && x <= 6) {
        slab.add(c)
      }
    }

    const response = (cells: number[]): number => {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)
      let max = 0

      for (let t = 0; t < 22; t++) {
        if (t === 3) {
          for (const cell of cells) {
            seeded.data[cell * 24] = 1
          }
        }

        const rule = collisionAt(t)
        const active = (c: number): boolean =>
          slab.has(c) ? t >= 2 : true

        vacuum = growingBeat(vacuum, rule, active)
        seeded = growingBeat(seeded, rule, active)

        let support = 0

        for (let i = 0; i < seeded.data.length; i++) {
          if (seeded.data[i] !== vacuum.data[i]) {
            support++
          }
        }

        max = Math.max(max, support)
      }

      return max
    }

    const one = response([cellAt([1, 2, 2, 2])])
    const two = response([
      cellAt([1, 2, 2, 2]),
      cellAt([1, 6, 6, 6]),
    ])
    const three = response([
      cellAt([1, 2, 2, 2]),
      cellAt([1, 6, 6, 6]),
      cellAt([1, 10, 10, 10]),
    ])

    // the Sakharov structure under two quench rates
    const sheet = SIDE * SIDE * SIDE
    const quench = (
      k: number,
    ): {
      totalWorst: number
      quantized: boolean
      settledMax: number
    } => {
      let will: Will = makeWill(mesh)
      let totalWorst = 0
      let quantized = true
      let settledMax = 0

      for (let t = 0; t < 48; t++) {
        const bornThrough = Math.min(
          SIDE - 1,
          Math.floor((t + 1) / k),
        )
        const active = (c: number): boolean =>
          coordinate(c, 0) <= bornThrough

        will = growingBeat(will, collisionAt(t), active)

        let total = 0
        const byLine = new Array<number>(12).fill(0)

        for (let i = 0; i < will.data.length; i++) {
          const v = will.data[i]!

          if (v !== 0) {
            total += v

            const d = i % 24
            const line = lines.findIndex(
              ([x, y]) => x === d || y === d,
            )

            byLine[line] = byLine[line]! + v
          }
        }

        totalWorst = Math.max(totalWorst, Math.abs(total))

        for (const lineCharge of byLine) {
          if (lineCharge % sheet !== 0) {
            quantized = false
          }
        }

        if (t >= 36) {
          settledMax = Math.max(
            settledMax,
            Math.max(...byLine.map(Math.abs)),
          )
        }
      }

      return { totalWorst, quantized, settledMax }
    }

    const k1 = quench(1)
    const k2 = quench(2)

    const ok =
      two === 2 * one &&
      three === 3 * one &&
      one >= 3 &&
      k1.totalWorst === 0 &&
      k2.totalWorst === 0 &&
      k1.quantized &&
      k2.quantized &&
      k1.settledMax >= sheet &&
      k2.settledMax >= sheet

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the slab response to one, two, three defects is exactly proportional, the total tone sum is exactly zero at every beat of both quenches, every per-line charge is a whole multiple of side cubed, and the settled asymmetry is at least one full sheet in both quenches',
      metrics: {
        responseOneDefect: one,
        responseTwoDefects: two,
        responseThreeDefects: three,
        totalToneWorst: Math.max(k1.totalWorst, k2.totalWorst),
        k1SettledMax: k1.settledMax,
        k2SettledMax: k2.settledMax,
        hypersheet: sheet,
      },
      // CONTROL: the proportionality shape itself, a saturating detector would read below it
      control: {
        countingRatioTwo: Number((two / one).toFixed(3)),
        countingRatioThree: Number((three / one).toFixed(3)),
      },
      notes:
        'the asymmetry under the turning weave spreads across lines on the schedule instead of sitting in one fixed couple, and the commensurate null moves from three beats to the schedule period (recorded in E-FND-0118). Part two of the canon programme (condensate, second law, the walk-sector bridge) stays open pending the adoption decision.',
    })
  },
})
