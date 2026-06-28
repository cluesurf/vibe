// Conformance for code/coarse/group-field: the block-average and block-sum coarse fields and the
// cubic block partition. The averaging step preserves the per-group mean (an empty group reads 0);
// the summing step preserves the TOTAL field (every cell lands in exactly one group); and the cubic
// partition is an exact L^3 -> (L/b)^3 blocking. All exact integer / rational facts.

import { suite, check, equal, close, exactArray } from '@/test/code/harness'
import {
  coarseFieldByGroup,
  sumFieldByGroup,
  cubicBlockGroups,
} from '@/code/coarse/group-field'

suite('coarse/group-field: block average', [
  // groups {0,1}: group 0 = {1,3} mean 2, group 1 = {10,20} mean 15.
  check('the group field is the per-group mean', () => {
    const out = coarseFieldByGroup({
      field: [1, 3, 10, 20],
      group: [0, 0, 1, 1],
      groupCount: 2,
    })
    close(out[0]!, 2, 1e-12)
    close(out[1]!, 15, 1e-12)
  }),
  // An empty group reads 0.
  check('an empty group averages to 0', () => {
    const out = coarseFieldByGroup({
      field: [1, 3, 5, 7],
      group: [0, 0, 0, 0],
      groupCount: 2,
    })
    close(out[0]!, 4, 1e-12)
    equal(out[1]!, 0)
  }),
  // A single group reduces to the grand mean.
  check('one group gives the grand mean', () => {
    const out = coarseFieldByGroup({
      field: [2, 4, 6, 8],
      group: [0, 0, 0, 0],
      groupCount: 1,
    })
    close(out[0]!, 5, 1e-12)
  }),
])

suite('coarse/group-field: block sum conserves the total', [
  check('the group sum field totals the cell field', () => {
    const field = [1, 3, 10, 20]
    const out = sumFieldByGroup({
      field,
      group: [0, 0, 1, 1],
      groupCount: 2,
    })
    close(out[0]!, 4, 1e-12)
    close(out[1]!, 30, 1e-12)
    const total = out.reduce((a, b) => a + b, 0)
    const fieldTotal = field.reduce((a, b) => a + b, 0)
    close(total, fieldTotal, 1e-12, 'summing across groups conserves the total field')
  }),
])

suite('coarse/group-field: cubic block partition', [
  // blockSize 1 on L=2: every cell is its own block, group id = cell index, 8 blocks.
  check('block size 1 makes each cell its own block', () => {
    const { group, groupCount } = cubicBlockGroups({ size: 2, blockSize: 1 })
    equal(groupCount, 8)
    exactArray(group, [0, 1, 2, 3, 4, 5, 6, 7])
  }),
  // blockSize = L collapses the whole grid to one block.
  check('block size = L makes one block', () => {
    const { group, groupCount } = cubicBlockGroups({ size: 2, blockSize: 2 })
    equal(groupCount, 1)
    for (let i = 0; i < group.length; i++) {
      equal(group[i]!, 0)
    }
  }),
  // L=4, b=2: side 2, 8 blocks. Cell (1,0,0)=index 1 shares block 0 with (0,0,0); cell (2,0,0)=index 2
  // is in block 1 (x/b = 1).
  check('a 4-cube with block size 2 partitions into 8 blocks of 8', () => {
    const { group, groupCount } = cubicBlockGroups({ size: 4, blockSize: 2 })
    equal(groupCount, 8)
    equal(group[0]!, 0)
    equal(group[1]!, 0)
    equal(group[2]!, 1)
    // count cells per block: each block must hold exactly 8 cells.
    const sizes = new Array<number>(8).fill(0)
    for (let i = 0; i < group.length; i++) {
      sizes[group[i]!]!++
    }
    for (const s of sizes) {
      equal(s, 8, 'each cubic block has b^3 = 8 cells')
    }
  }),
])
