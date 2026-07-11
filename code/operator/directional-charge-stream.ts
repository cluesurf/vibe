// Per-port directional charge streaming on a neighbors graph, the substrate-general form of the
// rule's streaming step. Each cell holds one integer charge per outgoing port (one slot per
// neighbour). A beat moves the charge on port k of cell i into the matched back-port of the
// neighbour j = nb[i][k] (the slot where j lists i). Because every port maps to exactly one
// back-port, total charge is conserved exactly. Returns the streamed charge field, leaving the
// input untouched.

type Neighbors = readonly (readonly number[])[]

// One beat of per-port streaming. next[j][back] += charge[i][k] for every port k of every cell i,
// where back is the index of i in nb[j].
export function streamDirectionalChargeStep(input: {
  neighbors: Neighbors
  charge: readonly (readonly number[])[]
}): number[][] {
  const { neighbors, charge } = input
  const N = neighbors.length
  const next: number[][] = Array.from({ length: N }, (_, i) =>
    neighbors[i]!.map(() => 0),
  )

  for (let i = 0; i < N; i++) {
    for (let k = 0; k < neighbors[i]!.length; k++) {
      const j = neighbors[i]![k]!
      const back = neighbors[j]!.indexOf(i)

      if (back >= 0) next[j]![back] = next[j]![back]! + charge[i]![k]!
    }
  }

  return next
}

// Run `steps` beats of per-port streaming from an initial charge field, returning the final field.
export function streamDirectionalCharge(input: {
  neighbors: Neighbors
  charge: readonly (readonly number[])[]
  steps: number
}): number[][] {
  let charge: readonly (readonly number[])[] = input.charge

  for (let step = 0; step < input.steps; step++) {
    charge = streamDirectionalChargeStep({
      neighbors: input.neighbors,
      charge,
    })
  }

  return charge as number[][]
}

// The total charge summed over every cell and port.
export function totalDirectionalCharge(
  charge: readonly (readonly number[])[],
): number {
  return charge.reduce(
    (s, row) => s + row.reduce((a, b) => a + b, 0),
    0,
  )
}
