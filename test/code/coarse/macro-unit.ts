// Conformance for code/coarse/macro-unit: cluster extraction and the coarse-map. A
// macro-unit's charge must equal its member count times the sign (the block-average that
// preserves total charge), its centroid is the exact mean of member positions, the coarse
// labels map every member to its unit id and everything else to -1, and the mean unit size
// is the arithmetic mean of the sizes. All exact integer / rational facts.

import {
  suite,
  check,
  equal,
  close,
  exactArray,
} from '@/test/code/harness'
import {
  extractUnits,
  coarseLabels,
  meanUnitSize,
  Graph,
} from '@/code/coarse/macro-unit'

// A CSR chain 0-1-2-3-4: offsets[i]..offsets[i+1] index into adj.
const chain: Graph = {
  cellCount: 5,
  offsets: Int32Array.from([0, 1, 3, 5, 7, 8]),
  adj: Int32Array.from([1, 0, 2, 1, 3, 2, 4, 3]),
}

// Position on a 1D line: (index, 0).
const linePos = (cell: number): readonly [number, number] => [cell, 0]

suite('coarse/macro-unit: extraction', [
  // All five cells +1: one cluster, size 5, charge 5, centroid x = (0+1+2+3+4)/5 = 2.
  check(
    'a full +1 chain is one unit with charge = size and mean centroid',
    () => {
      const units = extractUnits({
        tone: Int8Array.from([1, 1, 1, 1, 1]),
        graph: chain,
        positions: linePos,
      })

      equal(units.length, 1)
      equal(units[0]!.size, 5)
      equal(units[0]!.charge, 5)
      close(units[0]!.cx, 2, 1e-12)
      close(units[0]!.cy, 0, 1e-12)
    },
  ),
  // tone [1,1,0,1,1] with minSize 2: two units {0,1} and {3,4}, the 0-cell breaks them.
  check('a gap splits the chain into two units', () => {
    const units = extractUnits({
      tone: Int8Array.from([1, 1, 0, 1, 1]),
      graph: chain,
      positions: linePos,
      minSize: 2,
    })

    equal(units.length, 2)
    equal(units[0]!.size, 2)
    equal(units[1]!.size, 2)
    exactArray(
      units[0]!.members.slice().sort((a, b) => a - b),
      [0, 1],
    )
    exactArray(
      units[1]!.members.slice().sort((a, b) => a - b),
      [3, 4],
    )
  }),
  // The default minSize is 3, so two size-2 clusters are dropped entirely.
  check('clusters below minSize are dropped', () => {
    const units = extractUnits({
      tone: Int8Array.from([1, 1, 0, 1, 1]),
      graph: chain,
      positions: linePos,
    })

    equal(units.length, 0)
  }),
  // Sign selection: a -1 cluster is found only when sign = -1, with negative charge.
  check('sign selects the cluster and sets the charge sign', () => {
    const units = extractUnits({
      tone: Int8Array.from([-1, -1, -1, 0, 0]),
      graph: chain,
      positions: linePos,
      sign: -1,
    })

    equal(units.length, 1)
    equal(units[0]!.size, 3)
    equal(units[0]!.charge, -3)
  }),
])

suite('coarse/macro-unit: coarse map and compression', [
  check('coarse labels map members to ids and the rest to -1', () => {
    const units = extractUnits({
      tone: Int8Array.from([1, 1, 0, 1, 1]),
      graph: chain,
      positions: linePos,
      minSize: 2,
    })

    const labels = coarseLabels({ units, cellCount: 5 })
    exactArray(labels, [0, 0, -1, 1, 1])
  }),
  check('mean unit size is the arithmetic mean of the sizes', () => {
    const units = [
      {
        id: 0,
        level: 0,
        members: [],
        size: 2,
        charge: 2,
        cx: 0,
        cy: 0,
      },
      {
        id: 1,
        level: 0,
        members: [],
        size: 4,
        charge: 4,
        cx: 0,
        cy: 0,
      },
    ]

    close(meanUnitSize(units), 3, 1e-12)
  }),
  check('mean unit size of no units is 0', () => {
    equal(meanUnitSize([]), 0)
  }),
])
