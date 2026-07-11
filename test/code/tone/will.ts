// Conformance for code/tone/will: the directional ternary state of the mesh. We check
// the storage size (cellCount * degree), that charge is the exact sum of every slot,
// that cellTone is the exact sum of one cell's directional slots, and the structured
// fill. Expected charges are re-derived from the fill FORMULA, independent of the
// stored-array sum the implementation computes. All exact (integer tones).

import { suite, check, equal } from '@/test/code/harness'
import { squareMesh } from '@/code/tool/mesh'
import {
  makeWill,
  fillWillPattern,
  charge,
  cellTone,
  loneParticle,
  gliderLine,
} from '@/code/tone/will'

suite('tool/tone: will storage and charge', [
  check('makeWill allocates cellCount * degree slots, all zero', () => {
    const mesh = squareMesh({ side: 4 })
    const will = makeWill(mesh)

    equal(will.data.length, mesh.cellCount * mesh.degree, 'slot count')
    equal(charge(will), 0, 'empty will has zero charge')
  }),
  check(
    'charge equals the independent sum over the fill formula',
    () => {
      const mesh = squareMesh({ side: 3 }) // 9 cells * 4 dirs = 36 slots
      const will = makeWill(mesh)

      fillWillPattern(will)

      // re-derive: slot i holds (i % 3) - 1
      let expected = 0

      for (let i = 0; i < will.data.length; i++) {
        expected += (i % 3) - 1
      }

      equal(charge(will), expected, 'charge = sum of (i%3 - 1)')
      // 36 slots = 12 full {-1,0,1} blocks, each summing to 0
      equal(expected, 0, 'and that sum is exactly 0 for 36 slots')
    },
  ),
  check('phase shifts the fill deterministically', () => {
    const mesh = squareMesh({ side: 3 })
    const will = makeWill(mesh)

    fillWillPattern(will, 1)

    let expected = 0

    for (let i = 0; i < will.data.length; i++) {
      expected += ((i + 1) % 3) - 1
    }

    equal(
      charge(will),
      expected,
      'phased charge matches the phased formula',
    )

    // every slot in {-1,0,1}
    for (let i = 0; i < will.data.length; i++) {
      const v = will.data[i]!

      equal(v, ((i + 1) % 3) - 1, `slot ${i} value`)
    }
  }),
  check('cellTone is the exact sum of a cell directional slots', () => {
    const mesh = squareMesh({ side: 3 })
    const will = makeWill(mesh)

    fillWillPattern(will)

    const degree = mesh.degree

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      let expected = 0

      for (let dir = 0; dir < degree; dir++) {
        expected += ((cell * degree + dir) % 3) - 1
      }

      equal(cellTone(will, cell), expected, `cellTone(${cell})`)
    }
  }),
  check('whole-mesh charge equals the sum of every cell tone', () => {
    const mesh = squareMesh({ side: 3 })
    const will = makeWill(mesh)

    fillWillPattern(will, 2)

    let byCells = 0

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      byCells += cellTone(will, cell)
    }

    equal(charge(will), byCells, 'charge = sum of cellTones')
  }),
])

suite('tool/tone: structured fills', [
  check(
    'loneParticle places exactly one charge of the given tone',
    () => {
      const mesh = squareMesh({ side: 4 })
      const will = loneParticle(mesh, 5, 2, -1)

      equal(charge(will), -1, 'total charge is the single tone')
      equal(cellTone(will, 5), -1, 'the host cell carries it')
      equal(will.data[5 * mesh.degree + 2], -1, 'in the right slot')
      equal(cellTone(will, 0), 0, 'every other cell is empty')
    },
  ),
  check(
    'gliderLine of length L carries charge tone * L on distinct cells',
    () => {
      const mesh = squareMesh({ side: 8 })
      const { will, cells } = gliderLine({
        mesh,
        start: 0,
        direction: 0, // +x, distinct cells while length <= side
        tone: 1,
        length: 4,
      })

      equal(cells.length, 4, 'four occupied cells')
      equal(new Set(cells).size, 4, 'cells are distinct')
      equal(charge(will), 4, 'charge = tone * length')
    },
  ),
])
