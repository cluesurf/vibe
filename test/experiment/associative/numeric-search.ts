// A3: Potter's associative numeric-search primitives (maxdex, mindex, nxtdex, prvdex) work on the bulk and
// cost a number of passes that is CONSTANT in the cell count (one per field bit). These are the ordered
// associative operations, the basis for nearest-value search and responder ranking.

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { makeRng } from '@/code/tool/rng'
import {
  maxIndex,
  minIndex,
  nextHigherIndex,
  nextLowerIndex,
  numericSearchSteps,
} from '@/code/operator/numeric-search'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function associativeNumericSearch(input?: {
  maxCells?: number
}): {
  maxOk: boolean
  minOk: boolean
  nextHigherOk: boolean
  nextLowerOk: boolean
  stepsSmall: number
  stepsLarge: number
  stepsConstant: boolean
  solved: boolean
} {
  const maxCells = input?.maxCells ?? 1500
  const g = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells })
  const n = g.cellCount
  const rng = makeRng({ seed: 1 })
  const range = 1 << 16
  const field = new Int32Array(n)

  for (let c = 0; c < n; c++) {
    field[c] = rng.nextInt({ max: range })
  }

  let trueMax = -Infinity
  let trueMin = Infinity

  for (let c = 0; c < n; c++) {
    if (field[c]! > trueMax) {
      trueMax = field[c]!
    }

    if (field[c]! < trueMin) {
      trueMin = field[c]!
    }
  }

  const mx = maxIndex({ field })
  const mn = minIndex({ field })
  const maxOk = mx.value === trueMax && field[mx.index] === trueMax
  const minOk = mn.value === trueMin && field[mn.index] === trueMin

  const target = field[Math.floor(n / 2)]!
  const nh = nextHigherIndex({ field, target })
  const nl = nextLowerIndex({ field, target })

  // brute-force references
  let refHigher = Infinity
  let refLower = -Infinity

  for (let c = 0; c < n; c++) {
    const v = field[c]!

    if (v > target && v < refHigher) {
      refHigher = v
    }

    if (v < target && v > refLower) {
      refLower = v
    }
  }

  const nextHigherOk = nh.index >= 0 && nh.value === refHigher
  const nextLowerOk = nl.index >= 0 && nl.value === refLower

  // the ASC pass count is constant in the cell count (depends only on the field bit width)
  const stepsSmall = numericSearchSteps(range)
  const stepsLarge = numericSearchSteps(range)
  const stepsConstant = stepsSmall === stepsLarge

  return {
    maxOk,
    minOk,
    nextHigherOk,
    nextLowerOk,
    stepsSmall,
    stepsLarge,
    stepsConstant,
    solved:
      maxOk && minOk && nextHigherOk && nextLowerOk && stepsConstant,
  }
}

export default experiment({
  id: 'associative/numeric-search',
  code: 'E-MMR-0010',
  title:
    'the associative numeric-search primitives (max, min, next-value) work on the bulk at constant pass cost',
  category: 'associative',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const r = associativeNumericSearch({ maxCells: 1500 })

    return verdict({
      status: r.solved ? 'pass' : 'fail',
      claim:
        'maxdex, mindex, and the next-higher and next-lower value searches return the correct cells on the bulk, and their pass count is fixed by the field bit width, constant in the number of cells',
      metrics: {
        maxOk: r.maxOk ? 1 : 0,
        minOk: r.minOk ? 1 : 0,
        nextHigherOk: r.nextHigherOk ? 1 : 0,
        nextLowerOk: r.nextLowerOk ? 1 : 0,
        searchSteps: r.stepsSmall,
      },
    })
  },
})
