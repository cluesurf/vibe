// Conformance for code/operator/conway-life: the canonical universal CA. Exact facts:
//   - the Moore neighbourhood has 8 offsets.
//   - the 2x2 block is a still life (fixed point).
//   - the blinker has period 2.
//   - the glider is a rigid translation by (1,1) after 4 steps.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  mooreOffsets,
  lifeStep,
  cellSetEqual,
  cellSetCentroid,
} from '@/code/operator/conway-life'

const set = (cells: [number, number][]): Set<string> =>
  new Set(cells.map(([x, y]) => `${x},${y}`))

const steps = (s: Set<string>, n: number): Set<string> => {
  let cur = s

  for (let i = 0; i < n; i++) {
    cur = lifeStep(cur)
  }

  return cur
}

const translate = (
  s: Set<string>,
  dx: number,
  dy: number,
): Set<string> => {
  const out = new Set<string>()

  for (const k of s) {
    const [x, y] = k.split(',').map(Number)

    out.add(`${x! + dx},${y! + dy}`)
  }

  return out
}

const minXY = (s: Set<string>): [number, number] => {
  let mx = Infinity
  let my = Infinity

  for (const k of s) {
    const [x, y] = k.split(',').map(Number)

    mx = Math.min(mx, x!)
    my = Math.min(my, y!)
  }

  return [mx, my]
}

suite('operator/conway-life: neighbourhood', [
  check('the Moore neighbourhood has 8 offsets (no centre)', () => {
    equal(mooreOffsets.length, 8, '3x3 minus the centre')
    ok(
      mooreOffsets.every(([dx, dy]) => dx !== 0 || dy !== 0),
      'no offset is the centre',
    )
  }),
])

suite('operator/conway-life: still life and oscillator', [
  check('the 2x2 block is a fixed point', () => {
    const block = set([
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ])

    ok(
      cellSetEqual(lifeStep(block), block),
      'the block does not change',
    )
  }),
  check('the blinker has period 2', () => {
    const horizontal = set([
      [0, 0],
      [1, 0],
      [2, 0],
    ])

    const vertical = set([
      [1, -1],
      [1, 0],
      [1, 1],
    ])

    ok(
      cellSetEqual(lifeStep(horizontal), vertical),
      'one step rotates to vertical',
    )

    ok(
      cellSetEqual(steps(horizontal, 2), horizontal),
      'two steps returns to horizontal',
    )
  }),
])

suite('operator/conway-life: glider', [
  check(
    'the glider is a rigid translation by (1,1) after 4 steps',
    () => {
      const glider = set([
        [1, 0],
        [2, 1],
        [0, 2],
        [1, 2],
        [2, 2],
      ])

      const after = steps(glider, 4)

      equal(after.size, glider.size, 'the glider keeps its 5 cells')

      const [mx0, my0] = minXY(glider)
      const [mx1, my1] = minXY(after)
      const dx = mx1 - mx0
      const dy = my1 - my0

      ok(
        cellSetEqual(after, translate(glider, dx, dy)),
        'the pattern moves rigidly',
      )
      equal(dx, 1, 'displaces by +1 in x')
      equal(dy, 1, 'displaces by +1 in y')
    },
  ),
  check('cellSetCentroid is the mean position', () => {
    const s = set([
      [0, 0],
      [2, 0],
      [1, 3],
    ])

    const [cx, cy] = cellSetCentroid(s)

    equal(cx, 1, 'mean x = (0+2+1)/3')
    equal(cy, 1, 'mean y = (0+0+3)/3')
  }),
])
