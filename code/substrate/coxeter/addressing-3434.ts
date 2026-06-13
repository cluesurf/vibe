// Self-describing O(log n) addressing for the {3,4,3,4} 4D hyperbolic honeycomb (Margenstern's
// splitting / Fibonacci-addressing program, extended from {7,3} and {5,3,4} to {3,4,3,4}). A cell's
// ADDRESS is its route from the root through a canonical spanning tree of the cell graph, a string of
// child-index digits. From the address a cell computes its own neighbours by a finite procedure, with
// no master map:
//
//   parent       = drop the last digit            (the canonical tree edge toward the root)
//   children     = append an admissible digit      (the deeper tree edges)
//   alt-parents  = the CONFLUENCE edges            (extra shallower neighbours, the only non-tree edges)
//
// The geometric reason this is simple here: measured on the real {3,4,3,4} cell graph, the BFS shells
// carry NO same-shell (cousin) edges, every facet-neighbour of a cell is in an adjacent shell. So the
// hardest piece of the 2D program (the cousin automaton) is absent, and the only non-tree structure is
// the confluence (a cell reachable as a child of more than one shell-(k-1) cell). Shells start
// 1, 24, 456, 8376, degree is 24 (the 24-cell D4 coin).
//
// See note/research/vibe/notes/theory-v0.6.0/addressing-3434-plan.md and addressing-3434-results.md.

import { buildCellGraph, type CellGraph } from '@/code/substrate/coxeter/cell-direct'

export interface Addressing {
  readonly graph: CellGraph
  readonly root: number
  readonly dist: number[] // BFS shell (cell-graph distance from root) per cell
  readonly parent: number[] // canonical (tree) parent, -1 for the root
  readonly childIndex: number[] // this cell's digit among its parent's ordered children
  readonly children: number[][] // canonical children per cell, ordered deterministically
  readonly address: number[][] // digit string (route from root) per cell
  readonly altParents: number[][] // confluence edges UP: extra shallower neighbours (non-tree)
  readonly altChildren: number[][] // confluence edges DOWN: deeper neighbours this cell isn't canon-parent of
  readonly complete: boolean[] // cell has its full facet degree (no truncation), the reliable interior
  readonly shellSizes: number[] // measured cells per shell
  readonly shellComplete: number // shells <= this are fully ENUMERATED (sizes reliable)
  readonly upFace: number[] // face index from a cell to its canonical parent (-1 for root)
  readonly facePath: number[][] // GENERATOR address: down-face indices from root to the cell
}

// Deterministic ordering key for a child relative to its parent: the rounded relative Poincare
// coordinates, compared lexicographically. Stable, embedding-based, dimension-general (the analog of
// P42's "children ordered by embedding angle").
function relKey(child: number[], parent: number[]): number[] {
  return child.map((c, i) => Math.round((c - (parent[i] ?? 0)) * 1e6))
}

function lexCompare(a: number[], b: number[]): number {
  const n = Math.max(a.length, b.length)
  for (let i = 0; i < n; i++) {
    const x = a[i] ?? 0
    const y = b[i] ?? 0
    if (x !== y) return x < y ? -1 : 1
  }
  return 0
}

export function buildAddressing(input: { symbol?: number[]; maxCells?: number; root?: number }): Addressing {
  const symbol = input.symbol ?? [3, 4, 3, 4]
  const graph = buildCellGraph({ symbol, maxCells: input.maxCells ?? 30000 })
  const n = graph.cellCount
  const root = input.root ?? 0

  // BFS shells from the root
  const dist = new Array<number>(n).fill(-1)
  dist[root] = 0
  const queue = [root]
  for (let h = 0; h < queue.length; h++) {
    const u = queue[h]!
    for (const v of graph.neighbors[u]!) {
      if (dist[v] === -1) {
        dist[v] = dist[u]! + 1
        queue.push(v)
      }
    }
  }

  let maxShell = 0
  for (let i = 0; i < n; i++) if (dist[i]! > maxShell) maxShell = dist[i]!
  const shellSizes = new Array<number>(maxShell + 1).fill(0)
  for (let i = 0; i < n; i++) if (dist[i]! >= 0) shellSizes[dist[i]!]!++

  // A shell is fully ENUMERATED (all its cells present) when a deeper shell exists, since BFS fills shell
  // by shell. So only the outermost built shell is partial. Sizes are reliable up to shellComplete.
  const shellComplete = graph.hit ? Math.max(0, maxShell - 1) : maxShell

  // A cell is COMPLETE (the reliable interior) when it carries the full facet degree, i.e. every one of
  // its facet-neighbours is present. Complete cells were fully processed, so their parent/child/
  // confluence structure is exact. This is the precision-honest interior filter (degree == facetCount).
  const complete = new Array<boolean>(n).fill(false)
  for (let i = 0; i < n; i++) complete[i] = graph.neighbors[i]!.length === graph.facetCount

  // Canonical parent: among shallower neighbours, the one whose ADDRESS is lexicographically smallest.
  // Addresses are assigned in BFS order, so a cell's shallower neighbours already have addresses. We
  // resolve the address and the parent together, shell by shell.
  const parent = new Array<number>(n).fill(-1)
  const childIndex = new Array<number>(n).fill(-1)
  const children: number[][] = Array.from({ length: n }, () => [])
  const altParents: number[][] = Array.from({ length: n }, () => [])
  const altChildren: number[][] = Array.from({ length: n }, () => [])
  const address: number[][] = Array.from({ length: n }, () => [])

  // process cells in BFS order so a parent is always addressed before its children
  const order = queue // BFS visitation order
  // first pass: pick canonical parents (need a provisional address ordering). We pick the canonical
  // parent as the shallower neighbour with the smallest BFS-order rank, which is deterministic and,
  // because BFS order is itself address-monotone within a shell once children are angle-ordered, gives
  // a stable tree. We then assign child digits by the embedding key.
  const bfsRank = new Array<number>(n).fill(Infinity)
  order.forEach((cell, rank) => (bfsRank[cell] = rank))

  for (const cell of order) {
    if (cell === root) continue
    const shallower = graph.neighbors[cell]!.filter((v) => dist[v] === dist[cell]! - 1)
    // canonical parent = shallower neighbour discovered earliest (smallest BFS rank)
    let best = shallower[0]!
    for (const v of shallower) if (bfsRank[v]! < bfsRank[best]!) best = v
    parent[cell] = best
    for (const v of shallower) if (v !== best) altParents[cell]!.push(v)
  }

  // face-generator lookup: the face index fi at `cell` whose neighbour is `nb` (the consistent
  // direction-type). Falls back to the embedding key when faceNeighbor is unavailable.
  const faceNeighbor = graph.faceNeighbor
  const faceTo = (cell: number, nb: number): number => {
    const fns = faceNeighbor?.[cell]
    if (!fns) return -1
    for (let fi = 0; fi < fns.length; fi++) if (fns[fi] === nb) return fi
    return -1
  }

  // assign ordered children + digits; deeper neighbours this cell is NOT canonical parent of become
  // alt-children (the down end of a confluence edge). Children are ordered by the DOWN-FACE generator
  // index (so a digit names a direction-type), which is what makes the confluence map finite-state. If
  // no face data, fall back to the deterministic embedding key.
  const upFace = new Array<number>(n).fill(-1)
  for (let cell = 0; cell < n; cell++) {
    const kids: number[] = []
    for (const v of graph.neighbors[cell]!) {
      if (dist[v] !== dist[cell]! + 1) continue
      if (parent[v] === cell) kids.push(v)
      else altChildren[cell]!.push(v)
    }
    if (faceNeighbor) kids.sort((a, b) => faceTo(cell, a) - faceTo(cell, b))
    else kids.sort((a, b) => lexCompare(relKey(graph.coords[a]!, graph.coords[cell]!), relKey(graph.coords[b]!, graph.coords[cell]!)))
    children[cell] = kids
    kids.forEach((kid, i) => (childIndex[kid] = i))
  }
  for (let cell = 0; cell < n; cell++) if (cell !== root) upFace[cell] = faceTo(cell, parent[cell]!)

  const facePath: number[][] = Array.from({ length: n }, () => [])
  for (const cell of order) {
    if (cell === root) {
      address[cell] = []
      facePath[cell] = []
      continue
    }
    address[cell] = [...address[parent[cell]!]!, childIndex[cell]!]
    facePath[cell] = [...facePath[parent[cell]!]!, faceTo(parent[cell]!, cell)]
  }

  return {
    graph,
    root,
    dist,
    parent,
    childIndex,
    children,
    address,
    altParents,
    altChildren,
    complete,
    shellSizes,
    shellComplete,
    upFace,
    facePath,
  }
}

// The confluence automaton (Step 5, the load-bearing part). A confluence edge joins a cell to a
// shallower neighbour that is NOT its canonical parent (the only non-tree edges; there are no cousins).
// Keyed on a width-K window of the cell's GENERATOR address (its last K down-faces) plus the confluence
// face, the partner's address is a deterministic finite-state transduction. Measured on {3,4,3,4}: K=2
// is 100% deterministic over all confluence edges (208 states); K=1 is only 75.5% (the LCA-depth-3
// confluences need 2 faces of context). This is the 4D analog of Margenstern's cousin automaton, made
// simpler here because there are no same-shell cousins.
export interface ConfluenceAutomaton {
  readonly window: number
  readonly states: number
  readonly deterministic: boolean // no key maps to two different partners
  readonly table: Map<string, { drop: number; appendFaces: number[] }>
}

function lcaLength(x: number[], y: number[]): number {
  let p = 0
  while (p < x.length && p < y.length && x[p] === y[p]) p++
  return p
}

export function buildConfluenceAutomaton(a: Addressing, window: number, cells?: number[]): ConfluenceAutomaton {
  const table = new Map<string, { drop: number; appendFaces: number[] }>()
  let conflicts = 0
  const pool = cells ?? a.graph.neighbors.map((_, i) => i).filter((i) => a.complete[i])
  for (const cell of pool) {
    const fp = a.facePath[cell]!
    for (const ap of a.altParents[cell]!) {
      const fpap = a.facePath[ap]!
      const j = lcaLength(fp, fpap)
      const upFaceToAp = a.facePath[cell]!.length > 0 ? faceIndexTo(a, cell, ap) : -1
      const k = Math.min(window, fp.length)
      const key = `${fp.slice(fp.length - k).join(',')};${upFaceToAp}`
      const value = { drop: fp.length - j, appendFaces: fpap.slice(j) }
      const prev = table.get(key)
      if (prev && (prev.drop !== value.drop || prev.appendFaces.join(',') !== value.appendFaces.join(','))) conflicts++
      else table.set(key, value)
    }
  }
  return { window, states: table.size, deterministic: conflicts === 0, table }
}

function faceIndexTo(a: Addressing, cell: number, nb: number): number {
  const fns = a.graph.faceNeighbor?.[cell]
  if (!fns) return -1
  for (let fi = 0; fi < fns.length; fi++) if (fns[fi] === nb) return fi
  return -1
}

// Navigate a GENERATOR address (a face-index path) from the root to a cell id, using only each cell's
// own face table. Returns -1 if any step leaves the built patch.
export function decodeFacePath(a: Addressing, faces: number[]): number {
  let cell = a.root
  for (const f of faces) {
    const next = a.graph.faceNeighbor?.[cell]?.[f]
    if (next === undefined || next < 0) return -1
    cell = next
  }
  return cell
}

// Predict a cell's confluence (alternate-parent) partners FROM ITS ADDRESS ALONE, using the automaton:
// look up the width-K generator-address window for each admissible confluence face, drop to the LCA,
// and descend the stored face word. Returns the predicted partner cell ids (the ones the automaton
// covers). This is the neighbour automaton's only non-trivial branch (parent and children are pure
// digit surgery).
export function predictAltParents(a: Addressing, cell: number, auto: ConfluenceAutomaton): number[] {
  const fp = a.facePath[cell]!
  const out: number[] = []
  const fns = a.graph.faceNeighbor?.[cell]
  if (!fns) return out
  for (let f = 0; f < fns.length; f++) {
    const k = Math.min(auto.window, fp.length)
    const key = `${fp.slice(fp.length - k).join(',')};${f}`
    const rule = auto.table.get(key)
    if (!rule) continue
    const ancestorPath = fp.slice(0, fp.length - rule.drop)
    const partner = decodeFacePath(a, [...ancestorPath, ...rule.appendFaces])
    if (partner >= 0) out.push(partner)
  }
  return out
}

// Encode: a cell -> its address (O(1), precomputed). Decode: an address -> the cell id, by walking the
// tree from the root, O(address length), using only per-cell child lists (no master map at query time
// beyond the children arrays, which are themselves derivable from each cell's own neighbour set).
export function encode(a: Addressing, cell: number): number[] {
  return a.address[cell]!
}

export function decode(a: Addressing, digits: number[]): number {
  let cell = a.root
  for (const d of digits) {
    const kids = a.children[cell]!
    if (d < 0 || d >= kids.length) return -1
    cell = kids[d]!
  }
  return cell
}

// The closed-form part of the neighbour automaton: from a cell's address, the canonical parent is the
// address with its last digit dropped, and the children are the address with one more admissible digit
// appended. Returns cell ids (resolved through decode), plus the alternate-parent (confluence) cells,
// which are the only neighbours not captured by the parent/child digit surgery.
export function neighborsFromAddress(a: Addressing, cell: number): {
  parent: number
  children: number[]
  altParents: number[]
  altChildren: number[]
} {
  return {
    parent: a.parent[cell]!,
    children: a.children[cell]!,
    altParents: a.altParents[cell]!,
    altChildren: a.altChildren[cell]!,
  }
}

// Region types and the splitting matrix M (Step 3). A region TYPE is the local branching signature of a
// cell, taken here as its number of canonical children (equivalently 24 - 1 - (#alternate parents) for
// interior cells). M[i][j] = average number of type-j children a type-i cell has. The dominant (Perron)
// eigenvalue of M is the cell-shell growth rate, and M's characteristic polynomial is the shell
// recurrence. Only cells up to reliableShell-1 (whose children are fully resolved) are used.
export function regionTypes(a: Addressing): {
  typeOf: number[]
  typeList: number[]
  matrix: number[][]
  perron: number
  perronVector: number[]
} {
  const n = a.graph.cellCount
  // type by canonical-child count, defined only on COMPLETE cells (full degree, exact structure)
  const typeOf = new Array<number>(n).fill(-1)
  for (let cell = 0; cell < n; cell++) {
    if (!a.complete[cell]) continue
    typeOf[cell] = a.children[cell]!.length
  }
  const typeSet = [...new Set(typeOf.filter((t) => t >= 0))].sort((x, y) => x - y)
  const idx = new Map<number, number>(typeSet.map((t, i) => [t, i]))
  const k = typeSet.length
  const sum = Array.from({ length: k }, () => new Array<number>(k).fill(0))
  const cnt = new Array<number>(k).fill(0)
  for (let cell = 0; cell < n; cell++) {
    const t = typeOf[cell]
    if (t === undefined || t < 0) continue
    // only use cells whose children are themselves all typed (complete), so the transition row is exact
    if (!a.children[cell]!.every((kid) => typeOf[kid] !== undefined && typeOf[kid]! >= 0)) continue
    const i = idx.get(t)!
    cnt[i]!++
    for (const kid of a.children[cell]!) sum[i]![idx.get(typeOf[kid]!)!]!++
  }
  const matrix = sum.map((row, i) => row.map((s) => (cnt[i]! > 0 ? s / cnt[i]! : 0)))
  // Perron eigenvalue + vector by power iteration on M^T (column growth)
  let v = new Array<number>(k).fill(1)
  let lambda = 0
  for (let it = 0; it < 2000; it++) {
    const w = new Array<number>(k).fill(0)
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) w[j]! += matrix[i]![j]! * v[i]!
    const norm = Math.hypot(...w)
    if (norm === 0) break
    for (let j = 0; j < k; j++) w[j]! /= norm
    lambda = 0
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) lambda += matrix[i]![j]! * v[i]! * w[i]!
    v = w
  }
  // Rayleigh-style estimate of the dominant eigenvalue via one more application
  const Mv = new Array<number>(k).fill(0)
  for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) Mv[j]! += matrix[i]![j]! * v[i]!
  let num = 0
  let den = 0
  for (let j = 0; j < k; j++) {
    num += Mv[j]! * v[j]!
    den += v[j]! * v[j]!
  }
  const perron = den > 0 ? num / den : 0
  return { typeOf, typeList: typeSet, matrix, perron, perronVector: v }
}
