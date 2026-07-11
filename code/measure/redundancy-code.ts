// A classical holographic redundancy code: a bulk logical bit stored redundantly across N boundary
// sites, recovered by majority vote. corruptConnectedRegion flips a contiguous block of the boundary (a
// connected erasure of the given fraction), recoverByMajority returns the recovered logical bit (1 if at
// least half the boundary sites are 1). Below half corruption the bit survives, above half it is lost,
// the finite-distance threshold of a real code.

export function recoverByMajority(boundary: readonly number[]): number {
  const ones = boundary.reduce((sum, bit) => sum + bit, 0)

  return ones * 2 >= boundary.length ? 1 : 0
}

export function corruptConnectedRegion(input: {
  size: number
  fraction: number
  logical: number
}): number[] {
  const boundary = new Array<number>(input.size).fill(input.logical)
  const corrupt = Math.round(input.size * input.fraction)

  for (let index = 0; index < corrupt; index++)
    boundary[index] = 1 - input.logical
  // flip a connected block

  return boundary
}
