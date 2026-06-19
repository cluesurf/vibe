// Measures on a ternary tone field with per-edge fills (the perception substrate).
// Each edge i carries a fill in {-1, 0, +1} and joins two cells with tones in
// {-1, 0, +1}. `edges[i] = [v, w]` aligned to `fill[i]`.

// Fraction of edges whose fill is consistent with the tones of its endpoints: a
// sharing fill (+1) wants equal non-zero tones, a polarizing fill (-1) wants opposite
// non-zero tones, an insulating fill (0) wants at least one endpoint at peace. This is
// an order parameter for an integrated, non-frustrated structure.
export function fillCoherence(
  tone: Int8Array,
  edges: Array<[number, number]>,
  fill: Int8Array,
): number {
  let sat = 0
  for (let i = 0; i < edges.length; i++) {
    const tv = tone[edges[i]![0]]!
    const tw = tone[edges[i]![1]]!
    const f = fill[i]!
    const ok =
      f === 1
        ? tv !== 0 && tv === tw
        : f === -1
          ? tv !== 0 && tw !== 0 && tv !== tw
          : tv === 0 || tw === 0
    if (ok) {
      sat++
    }
  }
  return sat / edges.length
}

// The Hebbian fill update (the candidate "sixth rule"): every edge's fill follows the
// tone relationship of its endpoints, binding (sharing, +1) agreeing non-zero neighbors,
// polarizing (-1) opposing ones, and insulating (0) when either endpoint is at peace.
// This makes fills LEARN the tone structure rather than staying fixed.
export function adaptFills(
  tone: Int8Array,
  edges: ReadonlyArray<readonly [number, number]>,
  fill: Int8Array,
): void {
  for (let i = 0; i < edges.length; i++) {
    const tv = tone[edges[i]![0]]!
    const tw = tone[edges[i]![1]]!
    if (tv !== 0 && tw !== 0) fill[i] = tv === tw ? 1 : -1
    else fill[i] = 0
  }
}

// Size of the largest connected domain of same-sign cells bound by sharing (+1) fills,
// the biggest coherent patch (a candidate higher self). `n` is the cell count.
export function largestSharingPatch(
  tone: Int8Array,
  edges: Array<[number, number]>,
  fill: Int8Array,
  n: number,
): number {
  const parent = new Int32Array(n)
  for (let i = 0; i < n; i++) {
    parent[i] = i
  }
  const find = (x: number): number => {
    let r = x
    while (parent[r] !== r) {
      r = parent[r]!
    }
    while (parent[x] !== r) {
      const nx = parent[x]!
      parent[x] = r
      x = nx
    }
    return r
  }
  for (let i = 0; i < edges.length; i++) {
    if (fill[i] !== 1) {
      continue
    }
    const v = edges[i]![0]
    const w = edges[i]![1]
    if (tone[v] !== 0 && tone[v] === tone[w]) {
      parent[find(v)] = find(w)
    }
  }
  const size = new Int32Array(n)
  let best = 0
  for (let i = 0; i < n; i++) {
    if (tone[i] === 0) {
      continue
    }
    const r = find(i)
    size[r]!++
    if (size[r]! > best) {
      best = size[r]!
    }
  }
  return best
}
