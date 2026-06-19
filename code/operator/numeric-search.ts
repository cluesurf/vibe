// Potter's associative numeric-search functions, the maximum, minimum, and next-value searches over a
// per-cell field. In the SITDAC model these run by bit-slice masking driven by the some-or-none responder
// signal, so they cost one pass per field BIT, constant in the number of cells. The reference results here
// are the plain argmax, argmin, and next-value, and numericSearchSteps reports the constant ASC pass count
// (the parallel cost). See note/research/vibe/notes/theory-v0.7.0/plans/associative-engine-architecture.md.

// The cell holding the maximum field value among the active cells (maxdex). active is an optional responder
// mask, all cells active by default. Ties go to the lowest index.
export function maxIndex(input: {
  field: ArrayLike<number>
  active?: ArrayLike<number>
}): { index: number; value: number } {
  const { field, active } = input
  let index = -1
  let value = -Infinity
  for (let c = 0; c < field.length; c++) {
    if (active && !active[c]) {
      continue
    }
    if (field[c]! > value) {
      value = field[c]!
      index = c
    }
  }
  return { index, value }
}

// The cell holding the minimum field value among the active cells (mindex).
export function minIndex(input: {
  field: ArrayLike<number>
  active?: ArrayLike<number>
}): { index: number; value: number } {
  const { field, active } = input
  let index = -1
  let value = Infinity
  for (let c = 0; c < field.length; c++) {
    if (active && !active[c]) {
      continue
    }
    if (field[c]! < value) {
      value = field[c]!
      index = c
    }
  }
  return { index, value }
}

// The cell with the smallest value strictly greater than the target (nxtdex), or index -1 if none.
export function nextHigherIndex(input: {
  field: ArrayLike<number>
  target: number
  active?: ArrayLike<number>
}): { index: number; value: number } {
  const { field, target, active } = input
  let index = -1
  let value = Infinity
  for (let c = 0; c < field.length; c++) {
    if (active && !active[c]) {
      continue
    }
    const v = field[c]!
    if (v > target && v < value) {
      value = v
      index = c
    }
  }
  return { index, value: index < 0 ? NaN : value }
}

// The cell with the largest value strictly less than the target (prvdex), or index -1 if none.
export function nextLowerIndex(input: {
  field: ArrayLike<number>
  target: number
  active?: ArrayLike<number>
}): { index: number; value: number } {
  const { field, target, active } = input
  let index = -1
  let value = -Infinity
  for (let c = 0; c < field.length; c++) {
    if (active && !active[c]) {
      continue
    }
    const v = field[c]!
    if (v < target && v > value) {
      value = v
      index = c
    }
  }
  return { index, value: index < 0 ? NaN : value }
}

// The ASC parallel cost of a numeric search, one bit-slice pass per field bit, ceil(log2(maxValue + 1)).
// This is CONSTANT in the number of cells, the defining property of associative search.
export function numericSearchSteps(maxValue: number): number {
  return Math.max(1, Math.ceil(Math.log2(Math.max(1, maxValue) + 1)))
}
