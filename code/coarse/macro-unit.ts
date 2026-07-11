// The macro-unit layer of the coarse-graining engine (see the multi-level-selves plan). A MacroUnit is one
// detected self at some level, a member set plus the few observables the next level up will run on. This is
// the data structure that makes the renormalization recursion well-defined, each level treats the units
// below as its cells.

export type Graph = {
  cellCount: number
  offsets: Int32Array
  adj: Int32Array
}

export type MacroUnit = {
  id: number
  level: number
  members: number[]
  size: number
  charge: number
  // centroid in the supplied coordinate system (the horosphere is flat, so x and y are faithful).
  cx: number
  cy: number
}

// All connected same-sign clusters of at least minSize, as macro-units. positions maps a cell index to its
// (x, y). On the flat horosphere lattice of side L, position is (index mod L, floor(index / L)).
export function extractUnits(input: {
  tone: Int8Array
  graph: Graph
  positions: (cell: number) => readonly [number, number]
  sign?: number
  minSize?: number
  level?: number
}): MacroUnit[] {
  const { tone, graph, positions } = input
  const sign = input.sign ?? 1
  const minSize = input.minSize ?? 3
  const level = input.level ?? 0
  const { offsets, adj, cellCount } = graph
  const seen = new Uint8Array(cellCount)
  const units: MacroUnit[] = []

  let id = 0

  for (let s = 0; s < cellCount; s++) {
    if (tone[s] !== sign || seen[s]) {
      continue
    }

    const members: number[] = []

    let frontier = [s]

    seen[s] = 1

    while (frontier.length) {
      const next: number[] = []

      for (const u of frontier) {
        members.push(u)

        for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
          const w = adj[p]!

          if (tone[w] === sign && !seen[w]) {
            seen[w] = 1
            next.push(w)
          }
        }
      }

      frontier = next
    }

    if (members.length < minSize) {
      continue
    }

    let cx = 0
    let cy = 0

    for (const m of members) {
      const [x, y] = positions(m)

      cx += x
      cy += y
    }

    units.push({
      id: id++,
      level,
      members,
      size: members.length,
      charge: members.length * sign,
      cx: cx / members.length,
      cy: cy / members.length,
    })
  }

  return units
}

// Per-cell label array, mapping each cell to the id of the unit it belongs to, or -1 for unaffiliated cells.
// This is the CoarseMap from cells to macro-units.
export function coarseLabels(input: {
  units: MacroUnit[]
  cellCount: number
}): Int32Array {
  const labels = new Int32Array(input.cellCount).fill(-1)

  for (const unit of input.units) {
    for (const m of unit.members) {
      labels[m] = unit.id
    }
  }

  return labels
}

// The compression ratio of one level, the mean number of sub-units per macro-unit (cells per self at level
// 0). This is the factor C in the effective-vibe-count accounting, effective = N_top * C^L.
export function meanUnitSize(units: MacroUnit[]): number {
  if (units.length === 0) {
    return 0
  }

  return units.reduce((a, u) => a + u.size, 0) / units.length
}
