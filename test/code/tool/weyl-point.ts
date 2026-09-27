// Conformance for code/tool/weyl-point, random access into the Kronecker stream: weylPoint must return,
// bit for bit, the value makeWeyl({ start }) returns at draw 64 index + slot, and the 64 values of one index
// must be jointly equidistributed (two slots of one index read as a pair fill a 10 x 10 grid evenly), where
// two beats of one weylCell key do not (their difference is a constant).

import { suite, check, equal, ok } from '@/test/code/harness'
import { makeWeyl, weylCell } from '@/code/tool/weyl'
import { weylPoint } from '@/code/tool/weyl-point'

suite('tool/weyl-point: random access into the stream', [
  check('weylPoint equals makeWeyl draw for draw at starts 0, 7 and 100003', () => {
    for (const start of [0, 7, 100003]) {
      const stream = makeWeyl({ start })

      for (let index = 0; index < 40; index++) {
        for (let slot = 0; slot < 64; slot++) {
          equal(weylPoint({ start, index, slot }), stream.next(), `start ${start} index ${index} slot ${slot}`)
        }
      }
    }
  }),
  check('two slots of one index are jointly equidistributed: every cell of a 10 x 10 grid within 25 percent of its share over 20,000 indices', () => {
    const counts = new Array<number>(100).fill(0)

    for (let index = 0; index < 20000; index++) {
      const a = Math.floor(10 * weylPoint({ start: 11, index, slot: 3 }))
      const b = Math.floor(10 * weylPoint({ start: 11, index, slot: 17 }))

      counts[a * 10 + b] = (counts[a * 10 + b] ?? 0) + 1
    }

    ok(counts.every(c => Math.abs(c - 200) < 50), `cells from ${Math.min(...counts)} to ${Math.max(...counts)}`)
  }),
  check('control: two beats of one weylCell key leave most of the same 10 x 10 grid empty', () => {
    const counts = new Array<number>(100).fill(0)

    for (let key = 0; key < 20000; key++) {
      const a = Math.floor(10 * weylCell(key, 1, 11))
      const b = Math.floor(10 * weylCell(key, 2, 11))

      counts[a * 10 + b] = (counts[a * 10 + b] ?? 0) + 1
    }

    ok(counts.filter(c => c === 0).length >= 50, `${counts.filter(c => c === 0).length} empty cells`)
  }),
])
