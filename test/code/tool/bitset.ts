// Conformance for code/tool/bitset: the bit-packed relation matrix. We check the
// storage layout (stride = ceil(cols/32)), set/get/clear round-trips across word
// boundaries, popcount against a hand count, and the Warshall transitive closure /
// height against a reachability re-derived by independent BFS on a tiny DAG. All
// quantities are exact (bits and counts), so no tolerance.

import { suite, check, equal, exactArray } from '@/test/code/harness'
import {
  makeBitMatrix,
  setBit,
  getBit,
  clearBit,
  popcountRow,
  popcountAnd,
  bitMatrixTransitiveClosure,
  bitMatrixHeight,
  rowToArray,
  forEachSetBit,
} from '@/code/tool/bitset'

suite('tool/bitset: storage and bit ops', [
  check('stride = ceil(cols / 32)', () => {
    for (const cols of [1, 31, 32, 33, 63, 64, 65, 100]) {
      const m = makeBitMatrix({ rows: 2, cols })
      equal(m.stride, Math.ceil(cols / 32), `stride for cols=${cols}`)
    }
  }),
  check('words length = rows * stride', () => {
    const m = makeBitMatrix({ rows: 5, cols: 40 })
    equal(m.stride, 2, 'stride')
    equal(m.words.length, 5 * 2, 'word count')
  }),
  check('set then get round-trips, including across a word boundary', () => {
    const m = makeBitMatrix({ rows: 3, cols: 70 })
    const set = [0, 31, 32, 35, 63, 64, 69]
    for (const col of set) {
      setBit(m, { row: 1, col })
    }
    for (let col = 0; col < 70; col++) {
      equal(getBit(m, { row: 1, col }), set.includes(col), `bit ${col}`)
    }
    // row 0 and row 2 untouched
    for (let col = 0; col < 70; col++) {
      equal(getBit(m, { row: 0, col }), false, `row0 bit ${col}`)
      equal(getBit(m, { row: 2, col }), false, `row2 bit ${col}`)
    }
  }),
  check('clearBit removes exactly one bit', () => {
    const m = makeBitMatrix({ rows: 1, cols: 40 })
    setBit(m, { row: 0, col: 5 })
    setBit(m, { row: 0, col: 35 })
    clearBit(m, { row: 0, col: 5 })
    equal(getBit(m, { row: 0, col: 5 }), false, 'cleared')
    equal(getBit(m, { row: 0, col: 35 }), true, 'other kept')
  }),
  check('popcountRow counts the set bits in a row', () => {
    const m = makeBitMatrix({ rows: 1, cols: 100 })
    const set = [0, 1, 33, 64, 99]
    for (const col of set) {
      setBit(m, { row: 0, col })
    }
    equal(popcountRow(m, { row: 0 }), set.length, 'popcount')
  }),
  check('popcountAnd counts the shared bits of two rows', () => {
    const m = makeBitMatrix({ rows: 2, cols: 100 })
    const a = [1, 5, 40, 70, 99]
    const b = [5, 6, 40, 71, 99]
    for (const col of a) {
      setBit(m, { row: 0, col })
    }
    for (const col of b) {
      setBit(m, { row: 1, col })
    }
    const shared = a.filter(x => b.includes(x)) // {5, 40, 99}
    equal(popcountAnd(m, { rowA: 0, rowB: 1 }), shared.length, 'and-popcount')
  }),
  check('rowToArray returns set columns sorted ascending', () => {
    const m = makeBitMatrix({ rows: 1, cols: 80 })
    for (const col of [70, 3, 33, 0, 64]) {
      setBit(m, { row: 0, col })
    }
    exactArray(rowToArray(m, { row: 0 }), Uint32Array.from([0, 3, 33, 64, 70]), 'sorted cols')
  }),
  check('forEachSetBit visits each set column once, in order', () => {
    const m = makeBitMatrix({ rows: 1, cols: 80 })
    const set = [2, 31, 32, 79]
    for (const col of set) {
      setBit(m, { row: 0, col })
    }
    const seen: number[] = []
    forEachSetBit(m, { row: 0, visit: col => seen.push(col) })
    exactArray(Uint32Array.from(seen), Uint32Array.from(set), 'visited cols')
  }),
])

// A tiny DAG on 4 topologically-labelled nodes, asserted edges (upper triangular):
//   0 -> 1, 1 -> 2, 0 -> 3
// Reachability (transitive closure) re-derived BY HAND:
//   0 reaches {1, 2, 3}, 1 reaches {2}, 2 reaches {}, 3 reaches {}
// Longest chain in elements: 0 < 1 < 2  => height 3.
suite('tool/bitset: transitive closure and height', [
  check('Warshall closure matches hand-derived reachability', () => {
    const n = 4
    const asserted = makeBitMatrix({ rows: n, cols: n })
    setBit(asserted, { row: 0, col: 1 })
    setBit(asserted, { row: 1, col: 2 })
    setBit(asserted, { row: 0, col: 3 })

    const closure = bitMatrixTransitiveClosure(asserted, n)
    const expected: Record<number, number[]> = {
      0: [1, 2, 3],
      1: [2],
      2: [],
      3: [],
    }
    for (let row = 0; row < n; row++) {
      exactArray(
        rowToArray(closure, { row }),
        Uint32Array.from(expected[row]!),
        `closure row ${row}`,
      )
    }
  }),
  check('closure relation count equals the hand pair count (4)', () => {
    const n = 4
    const asserted = makeBitMatrix({ rows: n, cols: n })
    setBit(asserted, { row: 0, col: 1 })
    setBit(asserted, { row: 1, col: 2 })
    setBit(asserted, { row: 0, col: 3 })
    const closure = bitMatrixTransitiveClosure(asserted, n)
    let total = 0
    for (let row = 0; row < n; row++) {
      total += popcountRow(closure, { row })
    }
    // {(0,1),(0,2),(0,3),(1,2)} = 4
    equal(total, 4, 'closure pair count')
  }),
  check('height of the chain 0<1<2 (plus 3) is 3', () => {
    const n = 4
    const asserted = makeBitMatrix({ rows: n, cols: n })
    setBit(asserted, { row: 0, col: 1 })
    setBit(asserted, { row: 1, col: 2 })
    setBit(asserted, { row: 0, col: 3 })
    const closure = bitMatrixTransitiveClosure(asserted, n)
    equal(bitMatrixHeight(closure, n), 3, 'longest chain length')
  }),
  check('height of a pure 5-element antichain is 1', () => {
    const n = 5
    const empty = makeBitMatrix({ rows: n, cols: n })
    equal(bitMatrixHeight(empty, n), 1, 'antichain height')
  }),
  check('height of a full 6-element chain is 6', () => {
    const n = 6
    const asserted = makeBitMatrix({ rows: n, cols: n })
    for (let i = 0; i + 1 < n; i++) {
      setBit(asserted, { row: i, col: i + 1 })
    }
    const closure = bitMatrixTransitiveClosure(asserted, n)
    equal(bitMatrixHeight(closure, n), 6, 'chain height')
    // a full chain has C(6,2) = 15 ordered pairs
    let total = 0
    for (let row = 0; row < n; row++) {
      total += popcountRow(closure, { row })
    }
    equal(total, 15, 'chain pair count')
  }),
])
