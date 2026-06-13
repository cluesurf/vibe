// Exact hyperbolic growth series: how many cells (or polygons) are ADDED at each layer (generation) out
// from a starting cell, for the tilings we use, plus the general 2D {p,q} formula. Each series satisfies
// a linear recurrence and grows exponentially, so the counts are bigint.

import { pathToFileURL } from 'node:url'

export type RecurrenceSpec = {
  seed: bigint[]
  coeffs: bigint[]
}

// Generic linear recurrence: out[n] = sum_i coeffs[i] * out[n-1-i], seeded by spec.seed.
export function sequence(count: number, spec: RecurrenceSpec): bigint[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error('count must be a nonnegative integer')
  }

  const out = spec.seed.slice(0, count)

  for (let n = spec.seed.length; n < count; n++) {
    let next = 0n
    for (let i = 0; i < spec.coeffs.length; i++) {
      next += spec.coeffs[i]! * out[n - 1 - i]!
    }
    out.push(next)
  }

  return out
}

// Polygons added per layer of the heptagrid {7,3}: 1, 7, 21, then a(n)=3a(n-1)-a(n-2).
export function polygonsAddedPerLayer73(count: number): bigint[] {
  return sequence(count, { seed: [1n, 7n, 21n], coeffs: [3n, -1n] })
}

// Polygons added per layer of the pentagrid {5,4}: 1, 5, 15, then a(n)=3a(n-1)-a(n-2).
export function polygonsAddedPerLayer54(count: number): bigint[] {
  return sequence(count, { seed: [1n, 5n, 15n], coeffs: [3n, -1n] })
}

// Cells added per layer of the dodecagrid {5,3,4}: 1, 12, 102, 812, then a(n)=9a(n-1)-9a(n-2)+a(n-3).
export function cellsAddedPerLayer5354(count: number): bigint[] {
  return sequence(count, { seed: [1n, 12n, 102n, 812n], coeffs: [9n, -9n, 1n] })
}

// General 2D face-layer counts for a regular hyperbolic {p,q} tiling (q = 3 or q = 4).
export function regular2DFaceLayers(p: number, q: number, count: number): bigint[] {
  if (!Number.isInteger(p) || !Number.isInteger(q) || p < 3 || q < 3) {
    throw new Error('p and q must be integers >= 3')
  }
  if (1 / p + 1 / q > 1 / 2) {
    throw new Error(`{${p},${q}} is spherical/finite, not infinite`)
  }
  if (q === 3) {
    return sequence(count, { seed: [1n, BigInt(p), BigInt(p * (p - 4))], coeffs: [BigInt(p - 4), -1n] })
  }
  if (q === 4) {
    return sequence(count, { seed: [1n, BigInt(p), BigInt(p * (p - 2))], coeffs: [BigInt(p - 2), -1n] })
  }
  throw new Error(`No built-in recurrence for {${p},${q}}. Pass a custom RecurrenceSpec to sequence(...).`)
}

// Cumulative total within `count` layers (the size of a ball of that radius).
export function cumulative(seq: bigint[]): bigint[] {
  let sum = 0n
  return seq.map((x) => {
    sum += x
    return sum
  })
}

export function toStrings(seq: bigint[]): string[] {
  return seq.map(String)
}

// The growth ratio of the last two COMPLETE shells of a BFS / reflection mesh. The final shell is usually
// truncated by a cell cap, so it is dropped. A faster-growing (more negatively curved) mesh has a higher ratio,
// a flat honeycomb tends toward 1. The capacity signature for the bulk-as-data experiments.
export function lastCompleteShellRatio(shells: number[]): number {
  const count = shells.length
  if (count < 4) {
    return 1
  }
  return shells[count - 2]! / shells[count - 3]!
}

// The fraction of cells that lie in the last COMPLETE shell (the truncated final shell is dropped). On a
// negatively curved mesh the boundary dominates, this is bounded away from 0, on a flat mesh it tends to 0.
// The boundary-dominance signature, the honest caveat that the bulk interior is nearly empty.
export function outermostShellFraction(shells: number[]): number {
  const count = shells.length
  if (count < 3) {
    return 0
  }
  const complete = shells.slice(0, count - 1) // drop the truncated final shell
  const total = complete.reduce((sum, size) => sum + size, 0)
  return total > 0 ? complete[complete.length - 1]! / total : 0
}

export function main(): void {
  const count = 12
  console.log('{7,3} face layers:', toStrings(polygonsAddedPerLayer73(count)).join(', '))
  console.log('{5,4} face layers:', toStrings(polygonsAddedPerLayer54(count)).join(', '))
  console.log('{5,3,4} cell layers:', toStrings(cellsAddedPerLayer5354(count)).join(', '))
  console.log('general 2D {7,3}:', toStrings(regular2DFaceLayers(7, 3, count)).join(', '))
  console.log('general 2D {5,4}:', toStrings(regular2DFaceLayers(5, 4, count)).join(', '))
  console.log('cumulative {5,3,4}:', toStrings(cumulative(cellsAddedPerLayer5354(count))).join(', '))
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
