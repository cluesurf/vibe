import { algebraicConnectivity } from '@/code/measure/integration'

// The IIT exclusion postulate on a connectivity graph. A conscious complex exists over the set of
// elements whose integrated information is MAXIMAL, and that maximum is definite: both subsets and
// supersets integrate less, so the complex has definite borders and excludes overlapping candidates.
// The integration proxy is the algebraic connectivity (Fiedler value) of the induced subgraph, the
// same measure used across the selves experiments. A self modeled as a densely interacting core
// embedded in a sparse environment should show a sharp interior maximum at the core boundary.

// A dense core (every core element linked to every other) surrounded by a sparse halo (each halo
// element hangs off one core element by a single link). Returns the adjacency as rows of neighbor
// indices, core elements first (indices 0 .. coreSize-1), halo after.
export function coreWithHalo(input: {
  coreSize: number
  haloSize: number
}): Uint32Array[] {
  const { coreSize, haloSize } = input
  const total = coreSize + haloSize
  const sets: Set<number>[] = Array.from(
    { length: total },
    () => new Set<number>(),
  )

  for (let i = 0; i < coreSize; i++) {
    for (let j = 0; j < coreSize; j++) {
      if (i !== j) {
        sets[i]!.add(j)
      }
    }
  }

  for (let k = 0; k < haloSize; k++) {
    const halo = coreSize + k
    const anchor = k % coreSize

    sets[halo]!.add(anchor)
    sets[anchor]!.add(halo)
  }

  return sets.map(set => Uint32Array.from([...set]))
}

// A homogeneous ring: every element links to its two neighbors, no dense core. The control graph
// with no definite complex.
export function ringGraph(size: number): Uint32Array[] {
  const sets: Set<number>[] = Array.from(
    { length: size },
    () => new Set<number>(),
  )

  for (let i = 0; i < size; i++) {
    sets[i]!.add((i + 1) % size)
    sets[i]!.add((i + size - 1) % size)
  }

  return sets.map(set => Uint32Array.from([...set]))
}

// The integrated information (algebraic connectivity) over the nested regions {0 .. size-1} for each
// size in `sizes`, the sweep that reveals whether a definite-bordered complex exists.
export function integrationOverNestedRegions(input: {
  adjacency: readonly Uint32Array[]
  sizes: number[]
}): number[] {
  const { adjacency, sizes } = input

  return sizes.map(size => {
    const region = new Set<number>()

    for (let i = 0; i < size; i++) {
      region.add(i)
    }

    return algebraicConnectivity({ adjacency, region })
  })
}

// The index of the maximal-integration region and whether that maximum is INTERIOR (a genuine
// complex with definite borders: both a smaller and a larger region integrate strictly less) rather
// than sitting at an endpoint of the sweep.
export function maximalComplex(values: number[]): {
  argmax: number
  interior: boolean
  max: number
} {
  let argmax = 0

  for (let i = 1; i < values.length; i++) {
    if (values[i]! > values[argmax]!) {
      argmax = i
    }
  }

  const interior =
    argmax > 0 &&
    argmax < values.length - 1 &&
    values[argmax]! > values[argmax - 1]! &&
    values[argmax]! > values[argmax + 1]!

  return { argmax, interior, max: values[argmax]! }
}
