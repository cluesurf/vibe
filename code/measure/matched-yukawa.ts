// The matched Yukawa test on the D4 box. Built for E-FRC-0217.
//
// THE RULE is code/rule/string-graph (the paid Z3 string, E-FRC-0129 and 0131), run in place by a copy of
// code/measure/nucleon-gas fastBeat with ONE switch: `pairs`. With pairs on it is fastBeat to the bit (checked by
// every run, switchAgrees). With pairs off the move (0, 0) <-> (1, -1) is never taken, in either direction, on any
// flux, and nothing else changes: hops, their payability, the matchings and the demon stream are the same. Each
// matching's step stays an involution (a pairing and its payability are symmetric), so the beat reverses by
// un-streaming the demons and running the moves in the opposite order (switchBeatBack, checked by every run).
//
// WHY A SWITCH AND NOT A CAPACITY. On one link the pair move costs 2 mass + tension from flux 0 mod 3, 2 mass from
// flux 1, and 2 mass - tension from flux 2 (it breaks a string), and a move is payable when its cost lies between
// minus the capacity and the demon's value. So every capacity that pays a pair from calm (2 mass + tension) also pays
// a string's break (2 mass - tension, smaller for any positive tension): no capacity turns the pair from calm on and
// the break off, and no capacity turns the pair from calm off while leaving the rule's hops alone except by also
// removing every pair move whose cost is at least the capacity. E-FRC-0200's control (capacity 6 against a pair cost
// of 7) kept the break (cost 1) and the flux-1 pair (cost 4). The canonical measure does not tell the three costs
// apart either: every pair adds two charges at weight y each (E-FRC-0188), so the no-pair measure is y = 0, which a
// switch on the one move is.
//
// THE STATIC SINGLET, READ WITHOUT PINNING ANYTHING. In the measure a charged free dock weighs y and a static dock
// of the same charge weighs 1 with the same Gauss constraint (code/measure/pair-string staticCell against freeCell),
// so the chance that docks a1, a2 hold +1, -1 is y^2 Z_A / Z_0 with Z_A the partition function with those docks
// static. For two such patterns A and B,
//   P(A and B) / (P(A) P(B)) = Z_AB Z_0 / (Z_A Z_B) = e^(-beta V_AB)
// exactly, in any dimension: the connected ratio of two static mesons IS the pair correlation of the pattern "a
// love and a fear on the two ends of one link" in the unpinned vacuum. So g(R) - 1 of those patterns is the static
// residual of E-FRC-0188 read off the rule's own histories. The reference is translation: for n_c patterns on links
// of direction class c (12 classes), the uncorrelated count of ordered pairs at a midpoint key is
// n_c1 n_c2 S(c1, c2, key) / V (c1 != c2) or n_c (n_c - 1) S(c, c, key) / (V - 1), S the number of box
// translations putting a class-c2 link at that key from a class-c1 link without sharing a dock. Real and reference
// both drop pairs that share a dock. Nothing moves: a pattern is read afresh from each snapshot.

import { d4BoxMesh } from '@/code/substrate/d4-box'
import { graphBeat, graphEnergy, graphGaussHolds, makeStringGraph, type GraphState, type StringGraph } from '@/code/rule/string-graph'
import { boxDisplacement, bulkLength, huskLength, lengthKey, makeBoxGeometry, makeFastGraph, seedGas, singletPieces, type BoxGeometry, type FastGraph, type LengthHistogram, addTo } from '@/code/measure/nucleon-gas'
import { linkTable, midpointKeys, type LinkTable } from '@/code/measure/pair-string'
import { unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import { SILVER } from '@/code/tool/weyl'

export const KEYS = 4096

// one beat of the rule in place, with the pair move on or off
export function switchBeat(fast: FastGraph, state: GraphState, pairs: boolean): void {
  const { from, to, order, next, mass, tension, capacity, scratch } = fast
  const vibe = state.vibe as Int8Array
  const flux = state.flux as Int32Array
  const demon = state.demon as Int32Array

  for (let k = 0; k < order.length; k++) {
    step(from, to, vibe, flux, demon, order[k] as number, mass, tension, capacity, pairs)
  }

  scratch.set(demon)

  for (let l = 0; l < scratch.length; l++) {
    demon[next[l] as number] = scratch[l] as number
  }
}

// the inverse beat: un-stream the demons, then every link's step (an involution) in the opposite order
export function switchBeatBack(fast: FastGraph, state: GraphState, pairs: boolean): void {
  const { from, to, order, next, mass, tension, capacity, scratch } = fast
  const vibe = state.vibe as Int8Array
  const flux = state.flux as Int32Array
  const demon = state.demon as Int32Array

  scratch.set(demon)

  for (let l = 0; l < scratch.length; l++) {
    demon[l] = scratch[next[l] as number] as number
  }

  for (let k = order.length - 1; k >= 0; k--) {
    step(from, to, vibe, flux, demon, order[k] as number, mass, tension, capacity, pairs)
  }
}

function step(
  from: Int32Array,
  to: Int32Array,
  vibe: Int8Array,
  flux: Int32Array,
  demon: Int32Array,
  l: number,
  mass: number,
  tension: number,
  capacity: number,
  pairs: boolean,
): void {
  const i = from[l] as number
  const j = to[l] as number
  const a = vibe[i] as number
  const b = vibe[j] as number

  let na: number
  let nb: number
  let change: number
  let massChange = 0

  if (a !== 0 && b === 0) {
    na = 0
    nb = a
    change = -a
  } else if (a === 0 && b !== 0) {
    na = b
    nb = 0
    change = b
  } else if (pairs && a === 0 && b === 0) {
    na = 1
    nb = -1
    change = 1
    massChange = 2 * mass
  } else if (pairs && a === 1 && b === -1) {
    na = 0
    nb = 0
    change = -1
    massChange = -2 * mass
  } else {
    return
  }

  const e = flux[l] as number
  const before = ((e % 3) + 3) % 3 !== 0 ? tension : 0
  const after = (((e + change) % 3) + 3) % 3 !== 0 ? tension : 0
  const d = (demon[l] as number) - (after - before + massChange)

  if (d < 0 || d > capacity) {
    return
  }

  vibe[i] = na
  vibe[j] = nb
  flux[l] = e + change
  demon[l] = d
}

// does switchBeat with pairs on reproduce graphBeat bit for bit, and does switchBeatBack undo switchBeat (both
// switches), over this many beats from this start
export function switchChecks(graph: StringGraph, start: GraphState, beats: number): { agrees: boolean; reverses: boolean; reversesOff: boolean } {
  const fast = makeFastGraph(graph)
  const same = (p: GraphState, q: GraphState): boolean =>
    p.vibe.every((v, i) => v === q.vibe[i]) && p.flux.every((v, i) => v === q.flux[i]) && p.demon.every((v, i) => v === q.demon[i])
  const copy = (s: GraphState): GraphState => ({ vibe: Int8Array.from(s.vibe), flux: Int32Array.from(s.flux), demon: Int32Array.from(s.demon) })
  const mine = copy(start)

  let reference = start
  let agrees = true

  for (let t = 0; t < beats; t++) {
    reference = graphBeat(graph, reference)
    switchBeat(fast, mine, true)
    agrees = agrees && same(mine, reference)
  }

  const reversal = (pairs: boolean): boolean => {
    const s = copy(start)

    for (let t = 0; t < beats; t++) {
      switchBeat(fast, s, pairs)
    }

    for (let t = 0; t < beats; t++) {
      switchBeatBack(fast, s, pairs)
    }

    return same(s, start)
  }

  return { agrees, reverses: reversal(true), reversesOff: reversal(false) }
}

// the demons' start: whole values from 0 to the capacity, drawn by the silver Weyl sequence from the truncated
// geometric law q^d (code/measure/pair-string runPairGas, the same start)
export function demonStart(links: number, capacity: number, q: number): Int32Array {
  const weights = Array.from({ length: capacity + 1 }, (_, d) => q ** d)
  const total = weights.reduce((a, b) => a + b, 0)
  const cumulative = weights.map((_, d) => weights.slice(0, d + 1).reduce((a, b) => a + b, 0) / total)

  return Int32Array.from({ length: links }, (_, l) => {
    const u = ((l + 1) * SILVER) % 1

    return cumulative.findIndex(c => u < c)
  })
}

// ---------------------------------------------------------------------------------------------------------
// the reference: box translations per class pair and midpoint key

export type ClassTable = {
  // the direction class (0 to 11) of every link
  readonly linkClass: Int8Array
  // per class pair (c1 * 12 + c2), the number of box translations at each bulk and husk key, disjoint links only
  readonly bulk: Float64Array[]
  readonly husk: Float64Array[]
  readonly classes: number
}

export function classTable(graph: StringGraph, geometry: BoxGeometry, table: LinkTable): ClassTable {
  const directions = [...new Set(graph.links.map(l => l[2]))].sort((a, b) => a - b)
  const classes = directions.length
  const classOf = new Map(directions.map((d, c) => [d, c]))
  const linkClass = Int8Array.from(graph.links, l => classOf.get(l[2]) ?? -1)
  const bulk = Array.from({ length: classes * classes }, () => new Float64Array(KEYS))
  const husk = Array.from({ length: classes * classes }, () => new Float64Array(KEYS))
  const keys = new Int32Array(2)
  // the link of each class at dock 0
  const firsts = directions.map(d => graph.linkAt[d] as number)

  firsts.forEach((first, c1) => {
    const [a1, b1] = graph.links[first] as readonly [number, number, number]

    for (let l = 0; l < graph.links.length; l++) {
      const [a2, b2] = graph.links[l] as readonly [number, number, number]

      if (a2 === a1 || a2 === b1 || b2 === a1 || b2 === b1) {
        continue
      }

      midpointKeys({ table, geometry, first, second: l, out: keys })

      const c2 = linkClass[l] as number
      const bh = bulk[c1 * classes + c2] as Float64Array
      const hh = husk[c1 * classes + c2] as Float64Array

      bh[keys[0] as number] = (bh[keys[0] as number] as number) + 1
      hh[keys[1] as number] = (hh[keys[1] as number] as number) + 1
    }
  })

  return { linkClass, bulk, husk, classes }
}

// ---------------------------------------------------------------------------------------------------------
// one run, read in batches

export type Batch = {
  readonly realBulk: Float64Array
  readonly realHusk: Float64Array
  // sum over reads of n_c1 n_c2 (c1 != c2) and n_c (n_c - 1) (c1 = c2), per class pair
  readonly products: Float64Array
  reads: number
  patterns: number
}

export type YukawaRun = {
  readonly beta: number
  readonly x: number
  readonly y: number
  readonly meanDemon: number
  readonly exact: boolean
  readonly reads: number
  readonly chargesPerDock: number
  readonly fewestCharges: number
  readonly mostCharges: number
  readonly patternsPerRead: number
  readonly batches: Batch[]
  // the love-fear displacement of every piece holding exactly one love and one fear (the meson profile)
  readonly profile: { bulk: LengthHistogram; husk: LengthHistogram; pieces: number }
  readonly final: GraphState
}

export type YukawaSetup = {
  readonly side: number
  readonly mass: number
  readonly tension: number
  readonly capacity: number
  readonly q: number
  readonly mesons: number
  readonly baryons: number
  readonly settle: number
  readonly beats: number
  readonly every: number
  readonly batches: number
}

export type YukawaBox = {
  readonly graph: StringGraph
  readonly geometry: BoxGeometry
  readonly table: LinkTable
  readonly classes: ClassTable
}

export function yukawaBox(setup: YukawaSetup): YukawaBox {
  const graph = makeStringGraph({ mesh: d4BoxMesh({ side: setup.side }), mass: setup.mass, tension: setup.tension, capacity: setup.capacity })
  const geometry = makeBoxGeometry(setup.side)
  const table = linkTable(graph, geometry)

  return { graph, geometry, table, classes: classTable(graph, geometry, table) }
}

// the seeded start of every run: code/measure/nucleon-gas seedGas and the demon start above
export function seededStart(box: YukawaBox, setup: YukawaSetup): GraphState {
  const seeded = seedGas({ graph: box.graph, mesons: setup.mesons, baryons: setup.baryons })

  return { ...seeded, demon: demonStart(box.graph.links.length, setup.capacity, setup.q) }
}

export function yukawaRun(input: { box: YukawaBox; setup: YukawaSetup; start: GraphState; pairs: boolean; profileEvery?: number }): YukawaRun {
  const { box, setup, pairs } = input
  const { graph, geometry, table, classes } = box
  const fast = makeFastGraph(graph)
  const s: GraphState = { vibe: Int8Array.from(input.start.vibe), flux: Int32Array.from(input.start.flux), demon: Int32Array.from(input.start.demon) }
  const e0 = graphEnergy(graph, s)
  const from = Int32Array.from(graph.links, l => l[0])
  const to = Int32Array.from(graph.links, l => l[1])
  const linkClass = classes.linkClass
  const nClasses = classes.classes
  const counts = new Float64Array(nClasses)
  const found = new Int32Array(graph.links.length)
  const keys = new Int32Array(2)
  const readsTotal = Math.floor(setup.beats / setup.every)
  const perBatch = Math.ceil(readsTotal / setup.batches)
  const batches: Batch[] = Array.from({ length: setup.batches }, () => ({
    realBulk: new Float64Array(KEYS),
    realHusk: new Float64Array(KEYS),
    products: new Float64Array(nClasses * nClasses),
    reads: 0,
    patterns: 0,
  }))
  const profile = { bulk: new Map() as LengthHistogram, husk: new Map() as LengthHistogram, pieces: 0 }
  const profileEvery = input.profileEvery ?? 1

  let exact = graphGaussHolds(graph, s)
  let demonSum = 0
  let reads = 0
  let charges = 0
  let fewest = Infinity
  let most = 0

  for (let t = 0; t < setup.settle + setup.beats; t++) {
    switchBeat(fast, s, pairs)

    if (t < setup.settle || (t - setup.settle) % setup.every !== 0) {
      continue
    }

    const batch = batches[Math.min(setup.batches - 1, Math.floor(reads / perBatch))] as Batch

    if (reads % 50 === 0) {
      exact = exact && graphEnergy(graph, s) === e0 && graphGaussHolds(graph, s)
    }

    let d = 0

    for (let l = 0; l < graph.links.length; l++) {
      d += s.demon[l] as number
    }

    demonSum += d / graph.links.length

    let here = 0

    for (let x = 0; x < s.vibe.length; x++) {
      here += s.vibe[x] !== 0 ? 1 : 0
    }

    charges += here
    fewest = Math.min(fewest, here)
    most = Math.max(most, here)

    // the patterns: links whose two ends hold opposite charges
    counts.fill(0)

    let n = 0

    for (let l = 0; l < graph.links.length; l++) {
      const a = s.vibe[from[l] as number] as number

      if (a !== 0 && a === -(s.vibe[to[l] as number] as number)) {
        found[n++] = l
        counts[linkClass[l] as number] = (counts[linkClass[l] as number] as number) + 1
      }
    }

    batch.patterns += n

    for (let c1 = 0; c1 < nClasses; c1++) {
      for (let c2 = 0; c2 < nClasses; c2++) {
        const p = (counts[c1] as number) * ((counts[c2] as number) - (c1 === c2 ? 1 : 0))

        batch.products[c1 * nClasses + c2] = (batch.products[c1 * nClasses + c2] as number) + p
      }
    }

    // real ordered pairs, disjoint only: each unordered pair counted once in each order, each order at its own key,
    // as the reference counts ordered pairs. pair-string midpointKeys is not symmetric under swapping its links (it
    // takes the minimal image of the first docks' difference, so near half a period the two orders can land on
    // different keys: 58,880 of 472,392 bulk keys and 67,472 husk keys on the side-9 box), and the first run
    // counted each pair twice at the key of its lower link index, which the reference does not (disclosed in
    // E-FRC-0217's header)
    for (let i = 0; i < n; i++) {
      const li = found[i] as number
      const ai = from[li] as number
      const bi = to[li] as number

      for (let j = i + 1; j < n; j++) {
        const lj = found[j] as number
        const aj = from[lj] as number
        const bj = to[lj] as number

        if (aj === ai || aj === bi || bj === ai || bj === bi) {
          continue
        }

        midpointKeys({ table, geometry, first: li, second: lj, out: keys })
        batch.realBulk[keys[0] as number] = (batch.realBulk[keys[0] as number] as number) + 1
        batch.realHusk[keys[1] as number] = (batch.realHusk[keys[1] as number] as number) + 1
        midpointKeys({ table, geometry, first: lj, second: li, out: keys })
        batch.realBulk[keys[0] as number] = (batch.realBulk[keys[0] as number] as number) + 1
        batch.realHusk[keys[1] as number] = (batch.realHusk[keys[1] as number] as number) + 1
      }
    }

    if (reads % profileEvery === 0) {
      for (const p of singletPieces(graph, s)) {
        if (p.loves.length === 1 && p.fears.length === 1) {
          const v = boxDisplacement(geometry, p.fears[0] as number, p.loves[0] as number)

          addTo(profile.bulk, lengthKey(bulkLength(v) ** 2))
          addTo(profile.husk, lengthKey(huskLength(v) ** 2))
          profile.pieces++
        }
      }
    }

    batch.reads++
    reads++
  }

  exact = exact && graphEnergy(graph, s) === e0 && graphGaussHolds(graph, s)

  const meanDemon = demonSum / Math.max(1, reads)
  const beta = unitDemonBeta({ meanDemon, capacity: setup.capacity })

  return {
    beta,
    x: Math.exp(-beta * setup.tension),
    y: Math.exp(-beta * setup.mass),
    meanDemon,
    exact,
    reads,
    chargesPerDock: charges / (reads * graph.mesh.cellCount),
    fewestCharges: fewest,
    mostCharges: most,
    patternsPerRead: batches.reduce((a, b) => a + b.patterns, 0) / reads,
    batches,
    profile,
    final: s,
  }
}

// g - 1 per shell from the batches: the pooled ratio of real to reference counts, with the spread of the batch
// ratios over the square root of the batch count as its error
export type YukawaShell = { readonly key: number; readonly r: number; readonly g: number; readonly sigma: number; readonly real: number; readonly reference: number }

export function yukawaShells(input: { run: YukawaRun; box: YukawaBox; which: 'bulk' | 'husk' }): YukawaShell[] {
  const { run, box, which } = input
  const nClasses = box.classes.classes
  const volume = box.graph.mesh.cellCount
  const per = run.batches.map(b => {
    const reference = new Float64Array(KEYS)

    for (let c1 = 0; c1 < nClasses; c1++) {
      for (let c2 = 0; c2 < nClasses; c2++) {
        const p = b.products[c1 * nClasses + c2] as number

        if (p === 0) {
          continue
        }

        const h = (which === 'bulk' ? box.classes.bulk : box.classes.husk)[c1 * nClasses + c2] as Float64Array
        const scale = p / (c1 === c2 ? volume - 1 : volume)

        for (let k = 0; k < KEYS; k++) {
          const v = h[k] as number

          if (v !== 0) {
            reference[k] = (reference[k] as number) + scale * v
          }
        }
      }
    }

    return { real: which === 'bulk' ? b.realBulk : b.realHusk, reference }
  })
  const out: YukawaShell[] = []

  for (let k = 1; k < KEYS; k++) {
    const real = per.reduce((a, b) => a + (b.real[k] as number), 0)
    const reference = per.reduce((a, b) => a + (b.reference[k] as number), 0)

    if (reference <= 0) {
      continue
    }

    const ratios = per.filter(b => (b.reference[k] as number) > 0).map(b => (b.real[k] as number) / (b.reference[k] as number))
    const mean = ratios.reduce((a, v) => a + v, 0) / ratios.length
    const spread = Math.sqrt(ratios.reduce((a, v) => a + (v - mean) ** 2, 0) / Math.max(1, ratios.length - 1))

    out.push({ key: k, r: Math.sqrt(k / 4), g: real / reference, sigma: spread / Math.sqrt(ratios.length), real, reference })
  }

  return out
}
