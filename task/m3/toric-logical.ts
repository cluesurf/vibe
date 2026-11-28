// M3 driver (item vibe-computation-models-0069 part c): the number of logical qutrits of the qutrit toric code of
// E-CMP-0042 (Q4 follow-up, test/experiment/computation/bare-u-toric.ts) on the closed quotients, so the {3,4,3,4}
// level-5 quotient (16,384 docks) gets the count the laptop could not hold (P51 of m12-predictions.md).
//
//   pnpm call task/m3/toric-logical.ts [--meshes t4,t8,l4] [--route library|packed|both] [--second true]
//
// Meshes: tS is the flat D4 torus {3,4,3,3} of side S (S^4 / 2 docks), lM the {3,4,3,4} congruence quotient K mod
// (sqrt 2)^M (level 4: 2,048 docks, level 5: 16,384). The complex is code/compute/quantum/toric-memory's toricComplex
// with the experiment's dock cap (20,000), so the code, the plaquettes and the facet ids are the experiment's.
//
// Two routes to the same number, both the cocycle route of the experiment (a breadth-first spanning tree fixes the
// gauge, the plaquette equations are propagated by peeling, every facet left undetermined becomes a free symbol, and
// logical = symbols - rank of the residual constraints over F_3):
// - library: toric-memory's logicalQutritsByCocycles itself. Each facet's value is a Map from symbol to coefficient, so
//   memory grows as facets x symbols (traps.md: level 5 ran out of a 4 GB heap).
// - packed: the same propagation in two passes. Pass 1 replays the library's settle order exactly with counters only
//   (which facets are tree, free or derived, and from which plaquette, depends on the counts alone, never on the
//   values), so the number of symbols S is known before any value is stored. Pass 2 stores every facet's value as a
//   bitsliced F_3 vector of S trits (two bit planes, 2 S bits per facet) and ranks the residual rows by incremental
//   echelon elimination on the same packing. The F_3 addition is checked on all 9 pairs of trits at start.
// --route both (the default) runs both and fails unless they agree on symbols, constraint rank and logical count.
// --second true also runs the experiment's second route on the hyperbolic levels (root V - 1, descending order), which
// must agree (gate G2). On the flat tori the rank route (logicalQutrits) runs beside, and both must read 4.
//
// With no flags it reproduces E-CMP-0042's counts: 4 on both flat tori, 291 on level 4 (511 symbols from root 0, 538
// from the second route). The closing SUMMARY line holds every count, time and peak memory. Exit code 1 on a failed gate.
import { LINES, LINE_OF_SLOT, OPPOSITE_SLOT, type ClosedBeatMesh } from '@/code/rule/bare-beat'
import {
  logicalQutrits,
  logicalQutritsByCocycles,
  plaquetteCount,
  toricComplex,
  type ToricComplex,
} from '@/code/compute/quantum/toric-memory'
import { flags, listFlag, seconds, summary } from './args'

// the experiment's cap (bare-u-toric.ts MAX_DOCKS) and the beat library's slot counts
const MAX_DOCKS = 20000
const SLOTS = 24
const LINE_COUNT = 12

const isFirstSlot = (slot: number): boolean => LINES[LINE_OF_SLOT[slot]!]![0] === slot

// ---- bitsliced F_3: a trit is (p, n) with 1 = (1, 0), 2 = (0, 1), 0 = (0, 0); 32 trits per word pair ----

function addWord(ap: number, an: number, bp: number, bn: number): [number, number] {
  const az = ~(ap | an)
  const bz = ~(bp | bn)

  return [((ap & bz) | (bp & az) | (an & bn)) >>> 0, ((an & bz) | (bn & az) | (ap & bp)) >>> 0]
}

// every pair of trits, against integer arithmetic mod 3
function checkAddition(): boolean {
  const enc = (x: number): [number, number] => (x === 1 ? [1, 0] : x === 2 ? [0, 1] : [0, 0])

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      const [p, n] = addWord(...enc(a), ...enc(b))
      const want = enc((a + b) % 3)

      if ((p & 1) !== want[0] || (n & 1) !== want[1]) {
        return false
      }
    }
  }

  return true
}

// ---- the packed route ----

type Packed = { symbols: number; constraintRank: number; logical: number; residualRows: number; words: number }

function packedCocycles(c: ToricComplex, root = 0, descending = false): Packed {
  const m = c.plaquetteLength
  const E = c.docks * LINE_COUNT
  const P = plaquetteCount(c)
  const plaquetteStart = new Int32Array(E + 1)

  for (let i = 0; i < P * m; i++) {
    plaquetteStart[c.plaquetteFacets[i]! + 1]!++
  }

  for (let f = 0; f < E; f++) {
    plaquetteStart[f + 1]! += plaquetteStart[f]!
  }

  // plaquettes of each facet, in increasing plaquette order (the library pushes p = 0, 1, ... in turn)
  const plaquettesOf = new Int32Array(P * m)
  const fill = plaquetteStart.slice(0, E)

  for (let p = 0; p < P; p++) {
    for (let k = 0; k < m; k++) {
      const f = c.plaquetteFacets[p * m + k]!

      plaquettesOf[fill[f]!++] = p
    }
  }

  // ---- pass 1: the settle order with counters only ----
  // kind: 0 unset, 1 tree, 2 free symbol, 3 derived from the plaquette in source[f]
  const kind = new Uint8Array(E)
  const source = new Int32Array(E).fill(-1)
  const known = new Uint8Array(E)
  const unknownCount = new Int32Array(P).fill(m)
  const seenDock = new Uint8Array(c.docks)
  const order = [root]

  seenDock[root] = 1

  for (const d of order) {
    for (let s = 0; s < SLOTS; s++) {
      const e = c.neighbors[d * SLOTS + s]!

      if (!seenDock[e]) {
        seenDock[e] = 1
        order.push(e)

        const line = LINE_OF_SLOT[s]!

        kind[isFirstSlot(s) ? d * LINE_COUNT + line : e * LINE_COUNT + line] = 1
      }
    }
  }

  // events in settle order: a facet value to compute (>= 0) or a closing plaquette (-1 - p)
  const events: number[] = []
  const worklist: number[] = []

  const settle = (f: number): void => {
    known[f] = 1
    events.push(f)

    for (let i = plaquetteStart[f]!; i < plaquetteStart[f + 1]!; i++) {
      const p = plaquettesOf[i]!

      unknownCount[p]!--

      if (unknownCount[p] === 1) {
        worklist.push(p)
      } else if (unknownCount[p] === 0) {
        events.push(-1 - p)
      }
    }
  }

  for (let f = 0; f < E; f++) {
    if (kind[f] === 1) {
      settle(f)
    }
  }

  const symbolOf = new Int32Array(E).fill(-1)

  let symbols = 0
  let cursor = 0

  for (;;) {
    while (worklist.length > 0) {
      const p = worklist.pop()!

      if (unknownCount[p] !== 1) {
        continue
      }

      let target = -1

      for (let k = 0; k < m; k++) {
        const f = c.plaquetteFacets[p * m + k]!

        if (!known[f]) {
          target = f
        }
      }

      kind[target] = 3
      source[target] = p
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

    kind[free] = 2
    symbolOf[free] = symbols
    symbols++
    settle(free)
  }

  // ---- pass 2: values as packed F_3 vectors of `symbols` trits ----
  const W = symbols === 0 ? 1 : Math.ceil(symbols / 32)
  const value = new Uint32Array(E * 2 * W)
  const row = new Uint32Array(2 * W)

  // row += sign * value[f] (sign is +1 or -1; -1 swaps the planes)
  const addFacet = (target: Uint32Array, f: number, sign: number): void => {
    const base = f * 2 * W

    for (let w = 0; w < W; w++) {
      const vp = value[base + w]!
      const vn = value[base + W + w]!
      const [p, n] = addWord(target[w]!, target[W + w]!, sign > 0 ? vp : vn, sign > 0 ? vn : vp)

      target[w] = p
      target[W + w] = n
    }
  }

  // the echelon basis: pivot column -> row (normalized to 1 at its pivot), every entry below its pivot 0
  const basis = new Map<number, Uint32Array>()

  let residualRows = 0

  const trit = (r: Uint32Array, i: number): number =>
    (r[i >>> 5]! >>> (i & 31)) & 1 ? 1 : (r[W + (i >>> 5)]! >>> (i & 31)) & 1 ? 2 : 0

  const reduce = (r: Uint32Array): void => {
    let w = 0

    for (;;) {
      while (w < W && (r[w]! | r[W + w]!) === 0) {
        w++
      }

      if (w >= W) {
        return
      }

      const bits = (r[w]! | r[W + w]!) >>> 0
      const low = w * 32 + (31 - Math.clz32(bits & -bits))
      const t = trit(r, low)
      const b = basis.get(low)

      if (!b) {
        const stored = new Uint32Array(2 * W)

        // normalize to 1 at the pivot: a 2 is negated
        stored.set(t === 1 ? r.subarray(0, W) : r.subarray(W, 2 * W), 0)
        stored.set(t === 1 ? r.subarray(W, 2 * W) : r.subarray(0, W), W)
        basis.set(low, stored)

        return
      }

      // r -= t * b: subtract b when t = 1, add it when t = 2
      for (let k = w; k < W; k++) {
        const bp = b[k]!
        const bn = b[W + k]!
        const [p, n] = addWord(r[k]!, r[W + k]!, t === 1 ? bn : bp, t === 1 ? bp : bn)

        r[k] = p
        r[W + k] = n
      }
    }
  }

  for (const ev of events) {
    if (ev >= 0) {
      const f = ev

      if (kind[f] === 2) {
        const s = symbolOf[f]!

        value[f * 2 * W + (s >>> 5)] = (1 << (s & 31)) >>> 0
      } else if (kind[f] === 3) {
        // sign * x + sum = 0, so x = -sign * sum over the plaquette's other (known) facets
        const p = source[f]!

        row.fill(0)

        let targetSign = 0

        for (let k = 0; k < m; k++) {
          const g = c.plaquetteFacets[p * m + k]!
          const sign = c.plaquetteSigns[p * m + k]!

          if (g === f) {
            targetSign = sign
          } else {
            addFacet(row, g, sign)
          }
        }

        const base = f * 2 * W

        // x = -targetSign * row
        value.set(targetSign > 0 ? row.subarray(W, 2 * W) : row.subarray(0, W), base)
        value.set(targetSign > 0 ? row.subarray(0, W) : row.subarray(W, 2 * W), base + W)
      }

      continue
    }

    const p = -1 - ev

    row.fill(0)

    for (let k = 0; k < m; k++) {
      addFacet(row, c.plaquetteFacets[p * m + k]!, c.plaquetteSigns[p * m + k]!)
    }

    let nonzero = false

    for (let w = 0; w < 2 * W && !nonzero; w++) {
      nonzero = row[w] !== 0
    }

    if (nonzero) {
      residualRows++

      if (basis.size < symbols) {
        reduce(row)
      }
    }
  }

  return { symbols, constraintRank: basis.size, logical: symbols - basis.size, residualRows, words: W }
}

// ---- the run ----

function meshOf(word: string): ClosedBeatMesh {
  const n = Number(word.slice(1))

  if (word.startsWith('t') && Number.isInteger(n) && n >= 4 && n % 2 === 0) {
    return { kind: 'torus-3433', side: n }
  }

  if (word.startsWith('l') && Number.isInteger(n) && n >= 3) {
    return { kind: 'congruence-3434', twoPower: n }
  }

  throw new Error(`toric-logical: unknown mesh ${word} (tS for a flat torus of side S, lM for {3,4,3,4} level M)`)
}

const f = flags()
const meshes = listFlag(f, 'meshes', ['t4', 't8', 'l4']).map(meshOf)
const route = f.get('route') ?? 'both'
const second = (f.get('second') ?? 'true') === 'true'
const start = performance.now()
const failures: string[] = []
const results: object[] = []

let peakRss = 0

const sampleRss = (): number => {
  const rss = process.memoryUsage().rss

  peakRss = rss > peakRss ? rss : peakRss

  return Number((rss / 2 ** 30).toFixed(2))
}

if (!['library', 'packed', 'both'].includes(route)) {
  throw new Error(`toric-logical: --route must be library, packed or both, got ${route}`)
}

if (!checkAddition()) {
  throw new Error('toric-logical: the bitsliced F_3 addition fails its 9-pair check')
}

console.log(`meshes ${meshes.map(x => JSON.stringify(x)).join(' ')}, route ${route}, second route ${second}`)

for (const mesh of meshes) {
  const t0 = performance.now()
  const c = toricComplex(mesh, MAX_DOCKS)
  const hyperbolic = mesh.kind === 'congruence-3434'
  const out: Record<string, unknown> = { name: c.name, docks: c.docks, facets: c.docks * LINE_COUNT, plaquettes: plaquetteCount(c) }

  // the complex gates the experiment's counts rest on (G0, G1): closed walks, distinct neighbours, involution
  let distinct = true
  let involution = true

  for (let d = 0; d < c.docks; d++) {
    const seen = new Set<number>()

    for (let s = 0; s < SLOTS; s++) {
      const e = c.neighbors[d * SLOTS + s]!

      distinct &&= e !== d && !seen.has(e)
      seen.add(e)
      involution &&= c.neighbors[e * SLOTS + OPPOSITE_SLOT[s]!] === d
    }
  }

  const complexOk =
    c.openWalks === 0 && c.inconsistentSteps === 0 && distinct && involution && plaquetteCount(c) === (hyperbolic ? 24 : 32) * c.docks

  if (!complexOk) {
    failures.push(`${c.name}: complex gate`)
  }

  const complexRss = sampleRss()

  out.complexSeconds = seconds(t0)
  out.complexRssGB = complexRss
  console.log(`${c.name}: ${c.docks} docks, complex ${complexOk ? 'ok' : 'FAILED'} (${seconds(t0)} s, rss ${complexRss} GB)`)

  const routes: [string, number, boolean][] = [['root0', 0, false]]

  if (second && hyperbolic) {
    routes.push(['second', c.docks - 1, true])
  }

  for (const [label, root, descending] of routes) {
    let lib: { symbols: number; constraintRank: number; logical: number } | null = null
    let packed: Packed | null = null

    if (route !== 'packed') {
      const t1 = performance.now()

      lib = logicalQutritsByCocycles(c, root, descending)
      out[`${label}Library`] = { ...lib, seconds: seconds(t1), rssGB: sampleRss() }
      console.log(`${c.name} ${label} library: ${JSON.stringify(out[`${label}Library`])}`)
    }

    if (route !== 'library') {
      const t1 = performance.now()

      packed = packedCocycles(c, root, descending)
      out[`${label}Packed`] = { ...packed, seconds: seconds(t1), rssGB: sampleRss() }
      console.log(`${c.name} ${label} packed: ${JSON.stringify(out[`${label}Packed`])}`)
    }

    if (lib && packed && (lib.symbols !== packed.symbols || lib.constraintRank !== packed.constraintRank || lib.logical !== packed.logical)) {
      failures.push(`${c.name} ${label}: library and packed routes differ`)
    }

    out[`${label}Logical`] = (lib ?? packed)!.logical
  }

  if (second && hyperbolic && out.root0Logical !== out.secondLogical) {
    failures.push(`${c.name}: the second route reads ${String(out.secondLogical)}, root 0 reads ${String(out.root0Logical)}`)
  }

  if (!hyperbolic) {
    const t1 = performance.now()
    const rank = logicalQutrits(c)

    out.rankRoute = { ...rank, seconds: seconds(t1) }
    console.log(`${c.name} rank route: ${JSON.stringify(out.rankRoute)}`)

    if (rank.logical !== 4 || out.root0Logical !== 4) {
      failures.push(`${c.name}: flat torus does not read 4 logical qutrits on both routes`)
    }
  }

  out.seconds = seconds(t0)
  results.push(out)
  console.log(`${c.name}: logical qutrits ${JSON.stringify(out.root0Logical)} (${seconds(t0)} s)`)
}

console.log(`failures: ${failures.length === 0 ? 'none' : failures.join('; ')}`)

summary({
  item: 'vibe-computation-models-0069',
  part: 'c',
  route,
  results,
  failures,
  peakRssGB: Number((peakRss / 2 ** 30).toFixed(2)),
  seconds: seconds(start),
})

if (failures.length > 0) {
  process.exitCode = 1
}
