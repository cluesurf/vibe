// THE QUTRIT TORIC CODE UNDER THE BARE BEAT U ON CLOSED QUOTIENTS (the Q4
// follow-up). Q4 (E-CMP-0038) could not run the toric code: it holds logical qutrits only
// on a closed space (zero on an open patch, E-QTM-0095), and the beat library had no closed quotient. bare-beat.ts now
// has two (section 8): the {3,4,3,4} congruence quotients K mod (sqrt 2)^m and the flat D_4 tori {3,4,3,3}.
//
// THE CODE (E-QTM-0095's complex read on the dock graph): one qutrit per facet, X checks on docks, Z checks on the
// 2-cells around each triangle of the honeycomb. A facet joins two docks; it is held by the dock in which its slot is
// the FIRST slot of its line (s = LINES[l][0]), so every dock holds exactly 12 facets, one per line, and the facet (d, l)
// runs d -> stepDock(d, s). The qutrit value is the tone on that slot (0 empty, 1 = +1, 2 = -1), role 0. This is the
// embedding that keeps one slot per line, so the stream S maps it into itself: S moves facet (d, l) to facet
// (stepDock(d, s), l), a fixed permutation pi of the facets (each line of facets shifts one dock along itself).
//   star X_v    shifts the facets out of v by -1 and the facets into v by +1 (x -> x + delta e_v)
//   plaquette Z_p  omega^(circulation) around the triangle 2-cell: a cycle of 4 docks on {3,4,3,4} (four 24-cells
//               around each triangle: from dock d with the two facets a, b of the triangle (roots at 60 degrees) the
//               cycle steps a, opp b, a, opp b), a 3-clique of docks on {3,4,3,3} (three around each triangle)
// Code states are uniform superpositions over cosets of the coboundaries C = {delta f}; logical qutrits k = dim H^1 =
// E - (V - 1) - rank(plaquette rows) over the field of three elements.
//
// WHAT U DOES TO IT, exactly (each step gated in the experiment against the library's own layers):
//   - on a configuration with at most one excitation per line, K, M_pair and M_meet are the identity (no full line, no
//     dock with exactly one full line and nothing else), so the seven per-dock layers reduce to L_d = Phi_odd C Phi_odd
//     with C = D^2 the line coin on every occupied line: keep zeta6 / 2 (weight 1/4), flip to the antipodal slot
//     (1 - omega) / 2 (weight 3/4);
//   - hence <y| L |x> = 0 for distinct embedded configurations and <x| L |x> = prod_d zeta6^(2 p_d chi(x_d)) (zeta6/2)^n_d;
//     for any diagonal observable O read on first slots, <L psi| O |L psi> = sum_x |psi(x)|^2 E_flips O(x_F), the phases
//     cancel, and every facet is erased (read as 0) independently with weight 3/4;
//   - a code state's values on a set of facets that forms a forest of the dock graph are jointly uniform (f -> delta f is
//     onto there), and on one plaquette uniform on the circulation-zero plane: the same for every logical and Fourier
//     state (a logical shift is a fixed circulation-zero vector).
// From these: the fidelity after one beat, lab frame and co-moving (against pi of the code) alike, is
// |E_x A(x)|^2 <= (E_tree 2^-|x|)^2 = (2/3)^(2 (V - 1)); the weight still inside the embedding is E 4^-|x| <= 2^-(V - 1);
// a co-moving plaquette reads <Z_p> = (3/4)^m + (1/4)^m (m its length), a lab plaquette (3/4)^m when its sheared
// facets form a forest.
//
// NOTHING HERE ROUNDS: probabilities are elements of Q(zeta_9) (code/algebra/ninth-field), powers are kept symbolic with
// an exact decimal bound. No host Math call, no random numbers.

import {
  type ClosedBeatMesh,
  type Vibe,
  applyHalfCoinD,
  applyOddChiralPhase,
  applyOppositeSignBounce,
  applyPairLineMixer,
  applyRoleMeet,
  applyStream,
  chiralOrientationDock,
  closedDockResidues,
  closedMeshDocks,
  closedMeshName,
  dockParityOf,
  inconsistentStepCount,
  LINE_OF_SLOT,
  LINES,
  OPPOSITE_SLOT,
  ROOTS,
  stateToNinth,
  stepDock,
  superpose,
  withClosedMesh,
  withGeometry,
  decodeConfig,
  type BeatState,
} from '@/code/rule/bare-beat'
import {
  type Ninth,
  add,
  conj,
  equals,
  keyOf,
  mul,
  ninth,
  ONE,
  ZERO,
  zetaPower,
} from '@/code/algebra/ninth-field'

const SLOTS = 24
const LINE_COUNT = 12

// ---- the complex ----

export type ToricComplex = {
  readonly name: string
  readonly mesh: ClosedBeatMesh
  readonly docks: number
  // neighbors[d * 24 + s]: the dock across slot s of dock d
  readonly neighbors: Int32Array
  readonly parity: Int8Array
  readonly inconsistentSteps: number
  // facet f = d * 12 + l runs facetTail[f] = d -> facetHead[f] = stepDock(d, LINES[l][0])
  readonly facetHead: Int32Array
  // the plaquettes, m facets each (m = 4 on {3,4,3,4}, 3 on {3,4,3,3}), with the signs of a closed walk and its docks
  readonly plaquetteLength: number
  readonly plaquetteFacets: Int32Array
  readonly plaquetteSigns: Int8Array
  readonly plaquetteDocks: Int32Array
  // walks that did not close (0 expected) and plaquettes with a repeated dock or facet
  readonly openWalks: number
  readonly degeneratePlaquettes: number
}

export const FIRST_SLOT: readonly number[] = LINES.map(([a]) => a)

const isFirstSlot = (slot: number): boolean => LINES[LINE_OF_SLOT[slot]!]![0] === slot

const dot = (a: number, b: number): bigint =>
  ROOTS[a]![0] * ROOTS[b]![0] + ROOTS[a]![1] * ROOTS[b]![1] + ROOTS[a]![2] * ROOTS[b]![2] + ROOTS[a]![3] * ROOTS[b]![3]

// the 96 facet pairs of a 24-cell that share a triangle (roots at 60 degrees), a < b
export const TRIANGLE_PAIRS: readonly (readonly [number, number])[] = (() => {
  const pairs: [number, number][] = []

  for (let a = 0; a < SLOTS; a++) {
    for (let b = a + 1; b < SLOTS; b++) {
      if (dot(a, b) === 1n) {
        pairs.push([a, b])
      }
    }
  }

  return pairs
})()

const PAIR_INDEX = new Map<number, number>(
  TRIANGLE_PAIRS.flatMap(([a, b], i) => [
    [a * SLOTS + b, i],
    [b * SLOTS + a, i],
  ]),
)

const slotOfRoot = (root: readonly bigint[]): number =>
  ROOTS.findIndex(r => r.every((x, i) => x === root[i]))

// The toric complex of a closed mesh. Runs inside withClosedMesh; fails closed past maxDocks.
// `rule` overrides the plaquette rule of the geometry (negative controls only: the other geometry's rule must leave
// every walk open).
export function toricComplex(
  mesh: ClosedBeatMesh,
  maxDocks: number,
  rule?: 'square' | 'triangle',
): ToricComplex {
  return withClosedMesh(mesh, () => buildComplex(mesh, maxDocks, rule))
}

// Run `compute` on the closed mesh of a complex with every dock discovered in the complex's order (breadth first from
// dock 0, as toricComplex does), so the complex's dock and facet ids name the same docks; fails closed otherwise.
export function withToricMesh<T>(c: ToricComplex, compute: () => T): T {
  return withClosedMesh(c.mesh, () => {
    const docks = closedMeshDocks(c.docks)

    for (let d = 0; d < docks; d++) {
      for (let s = 0; s < SLOTS; s++) {
        if (stepDock(d, s) !== c.neighbors[d * SLOTS + s]) {
          throw new Error(`FAIL: ${c.name} rediscovered in another order`)
        }
      }
    }

    return compute()
  })
}

function buildComplex(mesh: ClosedBeatMesh, maxDocks: number, rule?: 'square' | 'triangle'): ToricComplex {
  const docks = closedMeshDocks(maxDocks)
  const neighbors = new Int32Array(docks * SLOTS)
  const parity = new Int8Array(docks)

  for (let d = 0; d < docks; d++) {
    parity[d] = dockParityOf(d)

    for (let s = 0; s < SLOTS; s++) {
      neighbors[d * SLOTS + s] = stepDock(d, s)
    }
  }

  const facetHead = new Int32Array(docks * LINE_COUNT)

  for (let d = 0; d < docks; d++) {
    for (let l = 0; l < LINE_COUNT; l++) {
      facetHead[d * LINE_COUNT + l] = neighbors[d * SLOTS + FIRST_SLOT[l]!]!
    }
  }

  const nb = (d: number, s: number): number => neighbors[d * SLOTS + s]!
  const hyperbolic = (rule ?? (mesh.kind === 'congruence-3434' ? 'square' : 'triangle')) === 'square'
  const m = hyperbolic ? 4 : 3
  const seen = new Uint8Array(docks * TRIANGLE_PAIRS.length)
  const facets: number[] = []
  const signs: number[] = []
  const dockList: number[] = []

  let openWalks = 0
  let degenerate = 0

  for (let d = 0; d < docks; d++) {
    for (let p = 0; p < TRIANGLE_PAIRS.length; p++) {
      if (seen[d * TRIANGLE_PAIRS.length + p]) {
        continue
      }

      const [a, b] = TRIANGLE_PAIRS[p]!
      // the slots of the walk, and at each dock the pair of slots to its two neighbours on the cycle
      const walk: number[] = []
      const pairsAt: [number, number][] = []

      if (hyperbolic) {
        walk.push(a, OPPOSITE_SLOT[b]!, a, OPPOSITE_SLOT[b]!)
        pairsAt.push(
          [a, b],
          [OPPOSITE_SLOT[a]!, OPPOSITE_SLOT[b]!],
          [a, b],
          [OPPOSITE_SLOT[a]!, OPPOSITE_SLOT[b]!],
        )
      } else {
        const c = slotOfRoot(ROOTS[b]!.map((x, i) => x - ROOTS[a]![i]!))

        walk.push(a, c, OPPOSITE_SLOT[b]!)
        pairsAt.push([a, b], [OPPOSITE_SLOT[a]!, c], [OPPOSITE_SLOT[b]!, OPPOSITE_SLOT[c]!])
      }

      const cycle: number[] = [d]

      for (const slot of walk) {
        cycle.push(nb(cycle[cycle.length - 1]!, slot))
      }

      if (cycle[m] !== d) {
        openWalks++
        continue
      }

      for (let k = 0; k < m; k++) {
        const [x, y] = pairsAt[k]!

        seen[cycle[k]! * TRIANGLE_PAIRS.length + PAIR_INDEX.get(x * SLOTS + y)!] = 1
      }

      const ownFacets: number[] = []

      for (let k = 0; k < m; k++) {
        const from = cycle[k]!
        const slot = walk[k]!
        const line = LINE_OF_SLOT[slot]!

        if (isFirstSlot(slot)) {
          ownFacets.push(from * LINE_COUNT + line)
          signs.push(1)
        } else {
          ownFacets.push(cycle[k + 1]! * LINE_COUNT + line)
          signs.push(-1)
        }

        dockList.push(from)
      }

      facets.push(...ownFacets)

      if (new Set(cycle.slice(0, m)).size < m || new Set(ownFacets).size < m) {
        degenerate++
      }
    }
  }

  return {
    name: closedMeshName(mesh),
    mesh,
    docks,
    neighbors,
    parity,
    inconsistentSteps: inconsistentStepCount(),
    facetHead,
    plaquetteLength: m,
    plaquetteFacets: Int32Array.from(facets),
    plaquetteSigns: Int8Array.from(signs),
    plaquetteDocks: Int32Array.from(dockList),
    openWalks,
    degeneratePlaquettes: degenerate,
  }
}

export const plaquetteCount = (c: ToricComplex): number => c.plaquetteFacets.length / c.plaquetteLength

// Every plaquette is a closed walk whose signed facets match its dock steps (tail -> head forward, +1; backward, -1), so
// the circulation of every coboundary is 0: the X and Z checks commute. Returns the number of plaquette edges that fail.
export function checkCommutation(c: ToricComplex): number {
  const m = c.plaquetteLength

  let failures = 0

  for (let p = 0; p < plaquetteCount(c); p++) {
    for (let k = 0; k < m; k++) {
      const f = c.plaquetteFacets[p * m + k]!
      const from = c.plaquetteDocks[p * m + k]!
      const to = c.plaquetteDocks[p * m + ((k + 1) % m)]!
      const tail = (f / LINE_COUNT) | 0
      const head = c.facetHead[f]!
      const ok = c.plaquetteSigns[p * m + k] === 1 ? tail === from && head === to : tail === to && head === from

      if (!ok) {
        failures++
      }
    }
  }

  return failures
}

// ---- rank over the field of three elements (sparse, rows of a few entries) ----

// The rank of sparse rows over F_3, each row as parallel column and value lists (values +-1 or 0..2). Pivot rows are
// kept with leading entry 1 at their smallest column; a new row is reduced at its smallest column until it is zero or
// leads at a free column.
export function sparseRankF3(
  rowCols: readonly (readonly number[])[],
  rowVals: readonly (readonly number[])[],
  columns: number,
): number {
  const pivotCols = new Array<Int32Array | undefined>(columns)
  const pivotVals = new Array<Int8Array | undefined>(columns)
  const scratch = new Int8Array(columns)
  const heap: number[] = []
  const inHeap = new Uint8Array(columns)

  const push = (c: number): void => {
    heap.push(c)
    inHeap[c] = 1

    let i = heap.length - 1

    while (i > 0) {
      const parent = (i - 1) >> 1

      if (heap[parent]! <= heap[i]!) {
        break
      }

      const t = heap[parent]!

      heap[parent] = heap[i]!
      heap[i] = t
      i = parent
    }
  }

  const pop = (): number => {
    const top = heap[0]!
    const last = heap.pop()!

    if (heap.length > 0) {
      heap[0] = last

      let i = 0

      for (;;) {
        const l = 2 * i + 1
        const r = l + 1

        let smallest = i

        if (l < heap.length && heap[l]! < heap[smallest]!) {
          smallest = l
        }

        if (r < heap.length && heap[r]! < heap[smallest]!) {
          smallest = r
        }

        if (smallest === i) {
          break
        }

        const t = heap[smallest]!

        heap[smallest] = heap[i]!
        heap[i] = t
        i = smallest
      }
    }

    inHeap[top] = 0

    return top
  }

  let rank = 0

  for (let r = 0; r < rowCols.length; r++) {
    const cols = rowCols[r]!
    const vals = rowVals[r]!

    for (let k = 0; k < cols.length; k++) {
      const c = cols[k]!
      const was = scratch[c]!

      scratch[c] = (((was + vals[k]!) % 3) + 3) % 3

      if (scratch[c] !== 0 && !inHeap[c]) {
        push(c)
      }
    }

    while (heap.length > 0) {
      const c = pop()
      const v = scratch[c]!

      if (v === 0) {
        continue
      }

      const pc = pivotCols[c]

      if (pc === undefined) {
        // a new pivot: collect the row (normalized so the lead is 1), clear the scratch
        const outCols: number[] = [c]
        const inverse = v === 2 ? 2 : 1
        const outVals: number[] = [1]

        scratch[c] = 0

        while (heap.length > 0) {
          const cc = pop()
          const vv = scratch[cc]!

          if (vv !== 0) {
            outCols.push(cc)
            outVals.push((vv * inverse) % 3)
            scratch[cc] = 0
          }
        }

        pivotCols[c] = Int32Array.from(outCols)
        pivotVals[c] = Int8Array.from(outVals)
        rank++
        break
      }

      const pv = pivotVals[c]!

      for (let k = 0; k < pc.length; k++) {
        const cc = pc[k]!

        scratch[cc] = (((scratch[cc]! - v * pv[k]!) % 3) + 3) % 3

        if (scratch[cc] !== 0 && !inHeap[cc]) {
          push(cc)
        }
      }
    }
  }

  return rank
}

// Logical qutrits k = E - (V - 1) - rank of the plaquette rows (the dock graph is connected: every dock was reached
// from dock 0).
export function logicalQutrits(c: ToricComplex): { facets: number; plaquetteRank: number; logical: number } {
  const m = c.plaquetteLength
  const rowCols: number[][] = []
  const rowVals: number[][] = []

  for (let p = 0; p < plaquetteCount(c); p++) {
    const cols: number[] = []
    const vals: number[] = []

    for (let k = 0; k < m; k++) {
      cols.push(c.plaquetteFacets[p * m + k]!)
      vals.push(c.plaquetteSigns[p * m + k]!)
    }

    rowCols.push(cols)
    rowVals.push(vals)
  }

  const facets = c.docks * LINE_COUNT
  const plaquetteRank = sparseRankF3(rowCols, rowVals, facets)

  return { facets, plaquetteRank, logical: facets - (c.docks - 1) - plaquetteRank }
}

// The same count by a second, independent route: dim H^1 = the cocycles that vanish on a breadth-first spanning tree.
// Tree facets are 0; a plaquette with one unknown facet fixes it (peeling); when none has one, the smallest unknown
// facet becomes a free symbol. Plaquettes that close with every facet known leave a linear constraint on the symbols.
// k = symbols - rank(constraints). Expressions are sparse maps symbol -> value over F_3.
// `root` picks the tree's root and `descending` the order in which free symbols are taken: a second root and order give
// a different tree, symbols and constraints, and must give the same k.
export function logicalQutritsByCocycles(
  c: ToricComplex,
  root = 0,
  descending = false,
): { symbols: number; constraintRank: number; logical: number } {
  const m = c.plaquetteLength
  const E = c.docks * LINE_COUNT
  const P = plaquetteCount(c)
  const known = new Uint8Array(E)
  const expr = new Array<Map<number, number> | undefined>(E)
  const unknownCount = new Int32Array(P).fill(m)
  const plaquettesOf: number[][] = Array.from({ length: E }, () => [])

  for (let p = 0; p < P; p++) {
    for (let k = 0; k < m; k++) {
      plaquettesOf[c.plaquetteFacets[p * m + k]!]!.push(p)
    }
  }

  // breadth-first tree from the root
  const seenDock = new Uint8Array(c.docks)
  const order = [root]

  seenDock[root] = 1

  // for-of sees the docks pushed during the loop (breadth first)
  for (const d of order) {
    for (let s = 0; s < SLOTS; s++) {
      const e = c.neighbors[d * SLOTS + s]!

      if (!seenDock[e]) {
        seenDock[e] = 1
        order.push(e)

        const line = LINE_OF_SLOT[s]!
        const f = isFirstSlot(s) ? d * LINE_COUNT + line : e * LINE_COUNT + line

        expr[f] = new Map()
      }
    }
  }

  const worklist: number[] = []
  const constraints: Map<number, number>[] = []

  const settle = (f: number): void => {
    known[f] = 1

    for (const p of plaquettesOf[f]!) {
      unknownCount[p]!--

      if (unknownCount[p] === 1) {
        worklist.push(p)
      } else if (unknownCount[p] === 0) {
        const residual = new Map<number, number>()

        for (let k = 0; k < m; k++) {
          addInto(residual, expr[c.plaquetteFacets[p * m + k]!]!, c.plaquetteSigns[p * m + k]!)
        }

        if (residual.size > 0) {
          constraints.push(residual)
        }
      }
    }
  }

  for (let f = 0; f < E; f++) {
    if (expr[f] !== undefined) {
      settle(f)
    }
  }

  let symbols = 0
  let cursor = 0

  for (;;) {
    while (worklist.length > 0) {
      const p = worklist.pop()!

      if (unknownCount[p] !== 1) {
        continue
      }

      let target = -1
      let targetSign = 0

      const sum = new Map<number, number>()

      for (let k = 0; k < m; k++) {
        const f = c.plaquetteFacets[p * m + k]!
        const sign = c.plaquetteSigns[p * m + k]!

        if (known[f]) {
          addInto(sum, expr[f]!, sign)
        } else {
          target = f
          targetSign = sign
        }
      }

      // sign * x + sum = 0, so x = -sign * sum (sign is its own inverse mod 3)
      const value = new Map<number, number>()

      addInto(value, sum, -targetSign)
      expr[target] = value
      settle(target)
    }

    const facetAt = (i: number): number => (descending ? E - 1 - i : i)

    while (cursor < E && known[facetAt(cursor)]) {
      cursor++
    }

    if (cursor >= E) {
      break
    }

    const free = facetAt(cursor)

    expr[free] = new Map([[symbols, 1]])
    symbols++
    settle(free)
  }

  const rows = constraints.map(r => [...r.keys()])
  const vals = constraints.map(r => [...r.values()])
  const constraintRank = sparseRankF3(rows, vals, symbols)

  return { symbols, constraintRank, logical: symbols - constraintRank }
}

function addInto(target: Map<number, number>, source: ReadonlyMap<number, number>, factor: number): void {
  for (const [sym, v] of source) {
    const next = ((((target.get(sym) ?? 0) + factor * v) % 3) + 3) % 3

    if (next === 0) {
      target.delete(sym)
    } else {
      target.set(sym, next)
    }
  }
}

// ---- the systole (the radius to which the quotient looks like the infinite mesh) ----

// Shells and edges inside each ball of the infinite mesh of the same geometry, from dock 0, to maxRadius (one more
// radius is discovered so that the last ball's edges are complete).
function infiniteBallCounts(geometry: '3434' | '3433', maxRadius: number): { shells: number[]; edges: number[] } {
  return withGeometry(geometry, () => ballCounts(maxRadius, (d, s) => stepDock(d, s)))
}

function ballCounts(maxRadius: number, step: (d: number, s: number) => number): { shells: number[]; edges: number[] } {
  const distance = new Map<number, number>([[0, 0]])
  const order: number[] = [0]

  for (const d of order) {
    const r = distance.get(d)!

    if (r >= maxRadius) {
      continue
    }

    for (let s = 0; s < SLOTS; s++) {
      const e = step(d, s)

      if (!distance.has(e)) {
        distance.set(e, r + 1)
        order.push(e)
      }
    }
  }

  const shells = new Array<number>(maxRadius + 1).fill(0)
  const edges = new Array<number>(maxRadius + 1).fill(0)

  for (const d of order) {
    shells[distance.get(d)!]!++
  }

  // an edge lies in ball r when both ends do; counted once per unordered pair (a dock pair joined by two slots counts
  // once, so a multigraph cannot pass)
  for (const d of order) {
    const rd = distance.get(d)!
    const seen = new Set<number>()

    for (let s = 0; s < SLOTS; s++) {
      const e = step(d, s)
      const re = distance.get(e)

      if (re === undefined || e <= d || seen.has(e)) {
        continue
      }

      seen.add(e)

      const r = rd > re ? rd : re

      for (let k = r; k <= maxRadius; k++) {
        edges[k]!++
      }
    }
  }

  return { shells, edges }
}

export type SystoleRow = { radius: number; shells: number; reference: number; edges: number; referenceEdges: number }

// The largest r <= maxRadius at which the quotient's r-ball around dock 0 has the infinite mesh's shells and edge count
// (the covering map is onto the ball, so equal counts make it an isomorphism; both quotients are dock-transitive).
export function ballSystole(c: ToricComplex, maxRadius: number): { systole: number; rows: SystoleRow[] } {
  const geometry = c.mesh.kind === 'congruence-3434' ? '3434' : '3433'
  const reference = infiniteBallCounts(geometry, maxRadius)
  const own = ballCounts(maxRadius, (d, s) => c.neighbors[d * SLOTS + s]!)
  const rows: SystoleRow[] = []

  let systole = -1

  for (let r = 0; r <= maxRadius; r++) {
    const shellsEqual = own.shells.slice(0, r + 1).every((n, k) => n === reference.shells[k])
    const ok = shellsEqual && own.edges[r] === reference.edges[r]

    if (ok && systole === r - 1) {
      systole = r
    }

    rows.push({
      radius: r,
      shells: own.shells[r]!,
      reference: reference.shells[r]!,
      edges: own.edges[r]!,
      referenceEdges: reference.edges[r]!,
    })
  }

  return { systole, rows }
}

// ---- the residues, for the dock-for-dock gate against code/substrate (read only) ----

export function dockResidues(mesh: ClosedBeatMesh, maxDocks: number): bigint[][] {
  return withClosedMesh(mesh, () => {
    const docks = closedMeshDocks(maxDocks)

    return Array.from({ length: docks }, (_, d) => [...closedDockResidues(d)])
  })
}

// ---- the layers on the embedding ----

// A dock configuration of the embedding: tones on the first slots of its lines (0 empty).
export type DockWord = readonly number[]

const vibesOf = (dock: number, word: DockWord): Vibe[] =>
  word.flatMap((tone, l) => (tone === 0 ? [] : [[dock, FIRST_SLOT[l]!, tone as 1 | -1, 0] as const]))

const Z6 = add(ONE, zetaPower(3)) // zeta6 = 1 + omega

function zeta6Power(k: number): Ninth {
  const e = ((k % 6) + 6) % 6

  let out = ONE

  for (let i = 0; i < e; i++) {
    out = mul(out, Z6)
  }

  return out
}

const HALF_ZETA6 = mul(Z6, ninth([1], 2))

const powerOf = (x: Ninth, n: number): Ninth => {
  let out = ONE

  for (let i = 0; i < n; i++) {
    out = mul(out, x)
  }

  return out
}

const norm2 = (x: Ninth): Ninth => mul(x, conj(x))

const sumWeights = (state: BeatState): Ninth => {
  let total = ZERO

  for (const amp of stateToNinth(state).values()) {
    total = add(total, norm2(amp))
  }

  return total
}

// the seven per-dock layers in beat order (U without the stream)
const PER_DOCK: readonly ((s: BeatState) => BeatState)[] = [
  s => applyOddChiralPhase(s, false),
  s => applyHalfCoinD(s, false),
  s => applyOppositeSignBounce(s),
  s => applyPairLineMixer(s, false),
  s => applyRoleMeet(s, false),
  s => applyHalfCoinD(s, false),
  s => applyOddChiralPhase(s, false),
]

const applyPerDock = (state: BeatState): BeatState => PER_DOCK.reduce((s, layer) => layer(s), state)

const isEmbedded = (key: string): boolean => decodeConfig(key).every(([, slot]) => isFirstSlot(slot))

export type LayerGate = {
  readonly words: number
  // words with chi != 0, on which Phi_odd puts a phase (the formula below then tests it)
  readonly chiralWords: number
  // K, M_pair, M_meet change no configuration reached by D from an embedded one
  readonly passiveLayerDefects: number
  // <x| L |x> differs from zeta6^(2 p chi(x)) (zeta6/2)^n, or L|x> has weight on another embedded configuration
  readonly diagonalDefects: number
  readonly offDiagonalEmbedded: number
  // an output configuration whose weight is not (1/4)^(n - |F|) (3/4)^|F|
  readonly flipWeightDefects: number
  readonly normDefects: number
}

// The reduction of the seven per-dock layers on the embedding, gated on every word of a declared family at one dock of
// the current closed mesh (call inside withClosedMesh).
export function gateLayersOnEmbedding(dock: number, words: readonly DockWord[]): LayerGate {
  const p = dockParityOf(dock)

  let passive = 0
  let diag = 0
  let offDiag = 0
  let flips = 0
  let norms = 0
  let chiralWords = 0

  for (const word of words) {
    const vibes = vibesOf(dock, word)
    const ket = superpose([[vibes, ONE]])
    const afterD = applyHalfCoinD(applyOddChiralPhase(ket, false), false)

    for (const passiveLayer of [
      (s: BeatState) => applyOppositeSignBounce(s),
      (s: BeatState) => applyPairLineMixer(s, false),
      (s: BeatState) => applyRoleMeet(s, false),
    ]) {
      const out = passiveLayer(afterD)
      const a = stateToNinth(afterD)
      const b = stateToNinth(out)

      if (a.size !== b.size || [...a].some(([k, v]) => !b.has(k) || !equals(b.get(k)!, v))) {
        passive++
      }
    }

    const out = applyPerDock(ket)
    const amps = stateToNinth(out)
    const n = vibes.length
    const chi = n >= 4 ? chiralOrientationDock(vibes, vibes.map((_, i) => i)) : 0
    const expected = mul(zeta6Power(2 * p * chi), powerOf(HALF_ZETA6, n))

    if (chi !== 0) {
      chiralWords++
    }

    const selfKey = [...amps.keys()].find(k => isEmbedded(k) && sameMultiset(k, vibes))
    const got = selfKey === undefined ? ZERO : amps.get(selfKey)!

    if (!equals(got, expected)) {
      diag++
    }

    for (const [key, amp] of amps) {
      if (key !== selfKey && isEmbedded(key)) {
        offDiag++
      }

      const flipped = decodeConfig(key).filter(([, slot]) => !isFirstSlot(slot)).length
      const weight = mul(powerOf(ninth([1], 4), n - flipped), powerOf(ninth([3], 4), flipped))

      if (!equals(norm2(amp), weight)) {
        flips++
      }
    }

    if (!equals(sumWeights(out), ONE)) {
      norms++
    }
  }

  return {
    words: words.length,
    chiralWords,
    passiveLayerDefects: passive,
    diagonalDefects: diag,
    offDiagonalEmbedded: offDiag,
    flipWeightDefects: flips,
    normDefects: norms,
  }
}

function sameMultiset(key: string, vibes: readonly Vibe[]): boolean {
  const decoded = decodeConfig(key)

  if (decoded.length !== vibes.length) {
    return false
  }

  const a = decoded.map(v => v.join(':')).sort()
  const b = vibes.map(v => v.join(':')).sort()

  return a.every((x, i) => x === b[i])
}

// The declared word family: every word with at most two excitations, every tone pattern on lines 0 to 3, the all-+1 and
// all--1 words on every 4 of the 12 lines, and four 6-excitation words (lines 0 to 5 all +1, all -1, alternating; lines 6 to
// 11 all +1). Full 12-excitation words are left out: two coin layers on 12 lone lines make 2^24 branch paths.
export function declaredWords(): DockWord[] {
  const words: DockWord[] = []
  const empty = (): number[] => new Array<number>(LINE_COUNT).fill(0)

  words.push(empty())

  for (let i = 0; i < LINE_COUNT; i++) {
    for (const t of [1, -1]) {
      const w = empty()

      w[i] = t
      words.push(w)
    }
  }

  for (let i = 0; i < LINE_COUNT; i++) {
    for (let j = i + 1; j < LINE_COUNT; j++) {
      for (const t of [1, -1]) {
        for (const u of [1, -1]) {
          const w = empty()

          w[i] = t
          w[j] = u
          words.push(w)
        }
      }
    }
  }

  for (let mask = 0; mask < 16; mask++) {
    const w = empty()

    for (let i = 0; i < 4; i++) {
      w[i] = (mask >> i) & 1 ? -1 : 1
    }

    words.push(w)
  }

  for (let mask = 0; mask < 1 << LINE_COUNT; mask++) {
    let bits = 0

    for (let i = 0; i < LINE_COUNT; i++) {
      bits += (mask >> i) & 1
    }

    if (bits === 4) {
      for (const t of [1, -1]) {
        words.push(Array.from({ length: LINE_COUNT }, (_, i) => ((mask >> i) & 1 ? t : 0)))
      }
    }
  }

  words.push(Array.from({ length: LINE_COUNT }, (_, i) => (i < 6 ? 1 : 0)))
  words.push(Array.from({ length: LINE_COUNT }, (_, i) => (i < 6 ? -1 : 0)))
  words.push(Array.from({ length: LINE_COUNT }, (_, i) => (i >= 6 ? 1 : 0)))
  words.push(Array.from({ length: LINE_COUNT }, (_, i) => (i < 6 ? (i % 2 === 0 ? 1 : -1) : 0)))

  return words
}

// ---- witnesses: which layers keep the code space ----

export type PhiWitness = {
  // chi of the star's dock word (all 12 first slots at tone -1) and of its negative (all +1), and the phase exponents
  // p * chi mod 6 that Phi_odd puts on delta e_v and on 2 delta e_v (the vacuum gets exponent 0)
  readonly chiStar: number
  readonly chiAntiStar: number
  readonly exponentStar: number
  readonly exponentAntiStar: number
  readonly breaks: boolean
}

// Phi_odd keeps the code space only if its phase is constant on every coset of C. The vacuum and delta e_v (dock v holds
// all 12 first slots at -1, each of its 12 backward neighbours one excitation, so only dock v can carry a phase) both lie
// in C: a phase exponent other than 0 on delta e_v is an exact witness that Phi_odd breaks the code space.
export function phiWitness(c: ToricComplex, v: number): PhiWitness {
  const star = vibesOf(v, new Array<number>(LINE_COUNT).fill(-1))
  const antiStar = vibesOf(v, new Array<number>(LINE_COUNT).fill(1))
  const all = star.map((_, i) => i)
  const chiStar = chiralOrientationDock(star, all)
  const chiAntiStar = chiralOrientationDock(antiStar, all)
  const p = c.parity[v]!
  const mod6 = (x: number): number => ((x % 6) + 6) % 6
  const exponentStar = mod6(p * chiStar)
  const exponentAntiStar = mod6(p * chiAntiStar)

  return {
    chiStar,
    chiAntiStar,
    exponentStar,
    exponentAntiStar,
    breaks: exponentStar !== 0 || exponentAntiStar !== 0,
  }
}

// The Phi_odd phase exponent (mod 6) of the code configuration delta g, g a cochain on docks given sparsely: x = delta g
// grouped by the dock holding each facet, sum over docks of p_d chi(word_d).
export function phiExponentOfCoboundary(c: ToricComplex, g: ReadonlyMap<number, number>): number {
  const x = new Map<number, number>()
  const value = (d: number): number => g.get(d) ?? 0

  const touch = (f: number): void => {
    const v = (((value(c.facetHead[f]!) - value((f / LINE_COUNT) | 0)) % 3) + 3) % 3

    if (v !== 0) {
      x.set(f, v)
    } else {
      x.delete(f)
    }
  }

  for (const d of g.keys()) {
    for (let l = 0; l < LINE_COUNT; l++) {
      touch(d * LINE_COUNT + l)
      touch(c.neighbors[d * SLOTS + OPPOSITE_SLOT[FIRST_SLOT[l]!]!]! * LINE_COUNT + l)
    }
  }

  const byDock = new Map<number, Vibe[]>()

  for (const [f, v] of x) {
    const d = (f / LINE_COUNT) | 0
    const list = byDock.get(d) ?? []

    list.push([d, FIRST_SLOT[f % LINE_COUNT]!, toneOf(v), 0])
    byDock.set(d, list)
  }

  let exponent = 0

  for (const [d, vibes] of byDock) {
    if (vibes.length >= 4) {
      exponent += c.parity[d]! * chiralOrientationDock(vibes, vibes.map((_, i) => i))
    }
  }

  return ((exponent % 6) + 6) % 6
}

export type PhiSearch = {
  // the cochain g (dock -> value) of the first witness found, or null, and how many cochains were tried
  readonly witness: readonly (readonly [number, number])[] | null
  readonly exponent: number
  readonly tried: number
}

// A deterministic search for a coboundary with a Phi_odd phase other than the vacuum's: g = e_v first (both values),
// then e_v + c e_w over the forward neighbours w of v, then e_v + c e_w + c' e_w' over pairs of them. Phi_odd keeps the
// code space only if every coboundary has exponent 0, so one witness proves it does not.
export function searchPhiWitness(c: ToricComplex, v: number): PhiSearch {
  const forward = FIRST_SLOT.map(s => c.neighbors[v * SLOTS + s]!)
  const candidates: [number, number][][] = [[[v, 1]], [[v, 2]]]

  for (const w of forward) {
    for (const cw of [1, 2]) {
      candidates.push([
        [v, 1],
        [w, cw],
      ])
    }
  }

  for (let i = 0; i < forward.length; i++) {
    for (let j = i + 1; j < forward.length; j++) {
      for (const ci of [1, 2]) {
        for (const cj of [1, 2]) {
          candidates.push([
            [v, 1],
            [forward[i]!, ci],
            [forward[j]!, cj],
          ])
        }
      }
    }
  }

  let tried = 0

  for (const g of candidates) {
    tried++

    const exponent = phiExponentOfCoboundary(c, new Map(g))

    if (exponent !== 0) {
      return { witness: g, exponent, tried }
    }
  }

  return { witness: null, exponent: 0, tried }
}

// The facet permutation of the stream: facet (d, l) -> (stepDock(d, first slot of l), l), and its inverse.
export const streamFacet = (c: ToricComplex, f: number): number =>
  c.facetHead[f]! * LINE_COUNT + (f % LINE_COUNT)

export const streamFacetInverse = (c: ToricComplex, f: number): number => {
  const d = (f / LINE_COUNT) | 0
  const l = f % LINE_COUNT

  return c.neighbors[d * SLOTS + OPPOSITE_SLOT[FIRST_SLOT[l]!]!]! * LINE_COUNT + l
}

// The stream keeps the code space only if pi maps coboundaries to cocycles. pi(delta e_v) with a nonzero circulation on
// some plaquette is an exact witness that S does not. Returns the number of plaquettes with nonzero circulation.
export function streamWitness(c: ToricComplex, v: number): { nonzeroCirculations: number; supportSize: number } {
  const x = new Map<number, number>()

  for (let l = 0; l < LINE_COUNT; l++) {
    x.set(v * LINE_COUNT + l, 2) // out of v: -1
  }

  for (let f = 0; f < c.facetHead.length; f++) {
    if (c.facetHead[f] === v) {
      x.set(f, ((x.get(f) ?? 0) + 1) % 3) // into v: +1
    }
  }

  const moved = new Map<number, number>()

  for (const [f, value] of x) {
    if (value !== 0) {
      moved.set(streamFacet(c, f), value)
    }
  }

  return { nonzeroCirculations: countNonzeroCirculations(c, moved), supportSize: moved.size }
}

function countNonzeroCirculations(c: ToricComplex, x: ReadonlyMap<number, number>): number {
  const m = c.plaquetteLength

  let count = 0

  for (let p = 0; p < plaquetteCount(c); p++) {
    let circulation = 0

    for (let k = 0; k < m; k++) {
      circulation += c.plaquetteSigns[p * m + k]! * (x.get(c.plaquetteFacets[p * m + k]!) ?? 0)
    }

    if (((circulation % 3) + 3) % 3 !== 0) {
      count++
    }
  }

  return count
}

// The coboundary delta e_v itself has circulation 0 on every plaquette (control for the witness above).
export function coboundaryCirculations(c: ToricComplex, v: number): number {
  const x = new Map<number, number>()

  for (let l = 0; l < LINE_COUNT; l++) {
    x.set(v * LINE_COUNT + l, 2)
  }

  for (let f = 0; f < c.facetHead.length; f++) {
    if (c.facetHead[f] === v) {
      x.set(f, ((x.get(f) ?? 0) + 1) % 3)
    }
  }

  return countNonzeroCirculations(c, x)
}

// ---- one beat, exact ----

// The plaquettes whose sheared facets pi^-1(facets) form a forest of the dock graph (their code values then jointly
// uniform), out of all.
export function shearedForests(c: ToricComplex): { forests: number; total: number } {
  const m = c.plaquetteLength

  let forests = 0

  for (let p = 0; p < plaquetteCount(c); p++) {
    const parent = new Map<number, number>()

    const root = (x: number): number => {
      let r = x

      while (parent.has(r) && parent.get(r) !== r) {
        r = parent.get(r)!
      }

      return r
    }

    let forest = true

    for (let k = 0; k < m; k++) {
      const f = streamFacetInverse(c, c.plaquetteFacets[p * m + k]!)
      const a = root((f / LINE_COUNT) | 0)
      const b = root(c.facetHead[f]!)

      if (a === b) {
        forest = false
        break
      }

      parent.set(a, b)
      parent.set(b, b)
    }

    if (forest) {
      forests++
    }
  }

  return { forests, total: plaquetteCount(c) }
}

export type PlaquetteReading = {
  // the Phi_odd layers change the state (so the check covers their phases, which must cancel)
  readonly phiActs: boolean
  // <Z_p> read on first slots of the plaquette's own facets after the seven per-dock layers (co-moving frame) and after
  // the whole beat on the facets of pi(p); <Z_p> on the facets of p after the whole beat from a state uniform on the
  // sheared facets (lab frame)
  readonly comovingPerDock: Ninth
  readonly comovingBeat: Ninth
  readonly lab: Ninth
  // the same with the two D layers left out (negative control: nothing leaks, <Z_p> = 1)
  readonly withoutCoin: Ninth
  readonly startStates: number
  readonly branches: number
}

const OMEGA_POWERS: readonly Ninth[] = [ONE, zetaPower(3), zetaPower(6)]

// <psi| Z |psi> for Z = omega^(sum sign * value on the first slots of the given facets), exactly.
function plaquetteExpectation(state: BeatState, facets: readonly number[], signs: readonly number[]): Ninth {
  let total = ZERO

  for (const [key, amp] of stateToNinth(state)) {
    const bySlot = new Map<string, number>()

    for (const [dock, slot, tone] of decodeConfig(key)) {
      bySlot.set(`${dock}:${slot}`, tone)
    }

    let circulation = 0

    facets.forEach((f, k) => {
      const tone = bySlot.get(`${(f / LINE_COUNT) | 0}:${FIRST_SLOT[f % LINE_COUNT]!}`) ?? 0
      const value = tone === 1 ? 1 : tone === -1 ? 2 : 0

      circulation += signs[k]! * value
    })

    total = add(total, mul(norm2(amp), OMEGA_POWERS[((circulation % 3) + 3) % 3]!))
  }

  return total
}

const toneOf = (value: number): 1 | -1 => (value === 1 ? 1 : -1)

// An end-to-end exact check of the one-beat plaquette formulas with the library's own layers, on plaquette p of the
// current closed mesh: the start is the uniform superposition over the circulation-zero values of p's facets (what any
// code state gives there), plus `spectators` fixed +1 excitations on other first slots of p's first dock so that
// Phi_odd acts. Call inside withClosedMesh.
// `free` (negative control) starts from every value of the facets instead, which is not a code state: the co-moving
// reading must then be (3/4)^m, not the code's (3/4)^m + (1/4)^m.
export function plaquetteOneBeat(
  c: ToricComplex,
  p: number,
  spectators: number,
  start: 'code' | 'free' = 'code',
): PlaquetteReading {
  const m = c.plaquetteLength
  const facets = Array.from({ length: m }, (_, k) => c.plaquetteFacets[p * m + k]!)
  const signs = Array.from({ length: m }, (_, k) => c.plaquetteSigns[p * m + k]!)
  const firstDock = (facets[0]! / LINE_COUNT) | 0
  const usedLines = new Set(facets.filter(f => ((f / LINE_COUNT) | 0) === firstDock).map(f => f % LINE_COUNT))
  const spectatorVibes: Vibe[] = []

  for (let l = 0; l < LINE_COUNT && spectatorVibes.length < spectators; l++) {
    if (!usedLines.has(l)) {
      spectatorVibes.push([firstDock, FIRST_SLOT[l]!, 1, 0])
    }
  }

  const facetVibe = (f: number, value: number): Vibe[] =>
    value === 0 ? [] : [[(f / LINE_COUNT) | 0, FIRST_SLOT[f % LINE_COUNT]!, toneOf(value), 0]]

  const terms: [Vibe[], Ninth][] = []

  for (let code = 0; code < 3 ** m; code++) {
    const values = Array.from({ length: m }, (_, k) => ((code / 3 ** k) | 0) % 3)
    const circulation = values.reduce((s, v, k) => s + signs[k]! * v, 0)

    if (start === 'code' && ((circulation % 3) + 3) % 3 !== 0) {
      continue
    }

    terms.push([[...spectatorVibes, ...facets.flatMap((f, k) => facetVibe(f, values[k]!))], ONE])
  }

  const startState = superpose(terms)
  const scaleDown = ninth([1], terms.length)
  const perDock = applyPerDock(startState)
  const beat = applyStream(perDock, false)
  const moved = facets.map(f => streamFacet(c, f))
  const comovingPerDock = mul(plaquetteExpectation(perDock, facets, signs), scaleDown)
  const comovingBeat = mul(plaquetteExpectation(beat, moved, signs), scaleDown)

  // lab: uniform over all values of the sheared facets (a forest, so a code state's values there are jointly uniform)
  const sheared = facets.map(f => streamFacetInverse(c, f))
  const labTerms: [Vibe[], Ninth][] = []

  for (let code = 0; code < 3 ** m; code++) {
    const values = Array.from({ length: m }, (_, k) => ((code / 3 ** k) | 0) % 3)

    labTerms.push([sheared.flatMap((f, k) => facetVibe(f, values[k]!)), ONE])
  }

  const labBeat = applyStream(applyPerDock(superpose(labTerms)), false)
  const lab = mul(plaquetteExpectation(labBeat, facets, signs), ninth([1], labTerms.length))

  const noCoin = [PER_DOCK[0]!, PER_DOCK[2]!, PER_DOCK[3]!, PER_DOCK[4]!, PER_DOCK[6]!].reduce((s, layer) => layer(s), startState)
  const withoutCoin = mul(plaquetteExpectation(noCoin, facets, signs), scaleDown)
  const noPhi = PER_DOCK.slice(1, 6).reduce((s, layer) => layer(s), startState)
  const a = stateToNinth(perDock)
  const b = stateToNinth(noPhi)
  const phiActs = a.size !== b.size || [...a].some(([k, v]) => !b.has(k) || !equals(b.get(k)!, v))

  return {
    phiActs,
    comovingPerDock,
    comovingBeat,
    lab,
    withoutCoin,
    startStates: terms.length,
    branches: perDock.amp.size,
  }
}

// The predicted one-beat readings for a plaquette of length m.
export function predictedPlaquette(m: number): { comoving: Ninth; lab: Ninth; comovingProjector: Ninth; labProjector: Ninth } {
  const q3 = powerOf(ninth([3], 4), m)
  const q1 = powerOf(ninth([1], 4), m)
  const comoving = add(q3, q1)
  const lab = q3
  const projector = (z: Ninth): Ninth => mul(add(ONE, add(z, z)), ninth([1], 3))

  return { comoving, lab, comovingProjector: projector(comoving), labProjector: projector(lab) }
}

// ---- the bounds after one beat ----

export type OneBeatBounds = {
  // V - 1 facets of a spanning tree, whose code values are jointly uniform
  readonly treeFacets: number
  // F(1) <= (4/9)^(V - 1), weight left in the embedding <= (1/2)^(V - 1): as text, with an exact decimal exponent k such
  // that the bound is below 10^-k
  readonly fidelityBound: string
  readonly fidelityBelowTenTo: number
  readonly embeddingBound: string
  readonly embeddingBelowTenTo: number
}

// the largest k with (num/den)^n < 10^-k (num < den), exactly
function decimalBound(num: bigint, den: bigint, n: number): number {
  const ratio = den ** BigInt(n) / num ** BigInt(n)

  return ratio.toString().length - 1
}

export function oneBeatBounds(c: ToricComplex): OneBeatBounds {
  const n = c.docks - 1

  return {
    treeFacets: n,
    fidelityBound: `(4/9)^${n}`,
    fidelityBelowTenTo: decimalBound(4n, 9n, n),
    embeddingBound: `(1/2)^${n}`,
    embeddingBelowTenTo: decimalBound(1n, 2n, n),
  }
}

export const showNinth = (x: Ninth): string => keyOf(x)
