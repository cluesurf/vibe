// P99: willpower grounded in the five (no scalar posited). (Stage 6 grounding, the-will-from-the-four.md.)
//
// P98 tested the will's decision logic with willpower as an abstract number. This test removes that
// abstraction. Here "willpower" is NOT a posited scalar, it IS the self's reserve of charge, a measured
// quantity of the real conserved dynamics (P94, hop / polarize / share on {5,3,4}), nothing added
// beyond the five base things.
//
// Setup: a self (a central cluster) holds a reserve of charge. It PUMPS (biased interior hops) to keep
// a pleasure at its core, while the surrounding field DRAINS it (leaky boundary hops let charge escape
// into the peace). Pumping holds the core only by feeding it from the reserve, so the reserve depletes.
// When the reserve runs out, the core collapses, this is willpower running out and the self relapsing
// or dying, with willpower being literally the measured reserve.
//
// Predictions checked: the reserve DEPLETES while the self pumps against the field, a stronger field
// drains it FASTER (shorter endurance), pumping PROLONGS the hold versus not pumping (it spends the
// reserve to do so), and the total charge Q is conserved exactly throughout. Willpower is the reserve,
// emergent, not a sixth base thing. Run: npx tsx code/experiment/p99-willpower-grounded.ts

import { pathToFileURL } from 'node:url'
import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { makeRng } from '@/code/tool/rng'

type Rng = { next: () => number }

function bfs(neighbors: number[][], n: number, src: number): Int32Array {
  const dist = new Int32Array(n).fill(-1)
  dist[src] = 0
  let frontier = [src]
  while (frontier.length > 0) {
    const next: number[] = []
    for (const u of frontier) {
      for (const w of neighbors[u]!) {
        if (dist[w] === -1) {
          dist[w] = (dist[u] ?? 0) + 1
          next.push(w)
        }
      }
    }
    frontier = next
  }
  return dist
}

function edgesOf(neighbors: number[][]): Array<[number, number]> {
  const edges: Array<[number, number]> = []
  for (let v = 0; v < neighbors.length; v++) {
    for (const w of neighbors[v]!) if (w > v) edges.push([v, w])
  }
  return edges
}

const dd = (d: Int32Array, i: number): number => d[i] ?? 1e9

// One beat of conserved hops. Interior hops pump charge toward the center, boundary hops leak with
// probability fieldLeak (the field draining the self), exterior hops are an unbiased random walk (so
// escaped charge diffuses away). If pump is false, ALL hops are an unbiased random walk (no pumping).
// Every swap preserves the pair sum, so Q is conserved.
function beat(
  tone: Int8Array,
  edges: Array<[number, number]>,
  inSelf: Uint8Array,
  distC: Int32Array,
  rng: Rng,
  fieldLeak: number,
  pump: boolean,
): void {
  const moved = new Uint8Array(tone.length)
  for (const [v, w] of edges) {
    if (moved[v] || moved[w]) continue
    const tv = tone[v]!
    const tw = tone[w]!
    // hop candidate: exactly one neutral, one charged
    let c = -1
    let e = -1
    if (tv === 0 && tw !== 0) {
      e = v
      c = w
    } else if (tw === 0 && tv !== 0) {
      e = w
      c = v
    } else {
      continue
    }
    const crossing = inSelf[v] !== inSelf[w]
    const interior = inSelf[v] === 1 && inSelf[w] === 1
    let swap = false
    if (pump && interior) {
      // the field penetrates the interior with probability fieldLeak (disorder the self), otherwise
      // the self pumps + toward the center. A stronger field overwhelms the pump from within.
      if (rng.next() < fieldLeak) {
        swap = rng.next() < 0.5 // field disorders the interior
      } else {
        swap = tone[c]! > 0 ? dd(distC, e) < dd(distC, c) : dd(distC, e) > dd(distC, c) // pump
      }
    } else if (pump && crossing) {
      // leaky boundary: the field drains charge across with probability fieldLeak
      swap = rng.next() < fieldLeak
    } else {
      // exterior, or no-pump control: unbiased random walk
      swap = rng.next() < 0.5
    }
    if (swap) {
      tone[e] = tone[c]!
      tone[c] = 0
      moved[v] = 1
      moved[w] = 1
    }
  }
}

const sumTone = (t: Int8Array): number => {
  let s = 0
  for (let i = 0; i < t.length; i++) s += t[i]!
  return s
}

export function willpowerGrounded(): {
  cells: number
  selfSize: number
  reserveStart: number
  reserveEndPumped: number
  reserveDepletes: boolean
  conserved: boolean
  enduranceWeakField: number
  enduranceStrongField: number
  strongerFieldDrainsFaster: boolean
  endurancePumped: number
  enduranceNoPump: number
  pumpingProlongs: boolean
  solved: boolean
} {
  const mesh = buildCoxeterMesh({ symbol: [5, 3, 4], depth: 20, maxChambers: 60000 })
  const neighbors = mesh.neighbors
  const n = mesh.cellCount
  const edges = edgesOf(neighbors)

  let center = 0
  for (let i = 1; i < n; i++) if (neighbors[i]!.length > neighbors[center]!.length) center = i
  const distC = bfs(neighbors, n, center)

  // {5,3,4} is very dense, so use BFS-ORDER prefixes for a small, controllable self and core (a
  // distance shell would grab hundreds of cells). The self is a modest reserve, the core is the held
  // pleasure it must keep topped up.
  const order: number[] = []
  {
    const seen = new Uint8Array(n)
    seen[center] = 1
    let frontier = [center]
    while (frontier.length > 0 && order.length < n) {
      const next: number[] = []
      for (const u of frontier) {
        order.push(u)
        for (const w of neighbors[u]!) if (!seen[w]) {
          seen[w] = 1
          next.push(w)
        }
      }
      frontier = next
    }
  }
  const SELF_SIZE = 40
  const CORE_SIZE = 6
  const inSelf = new Uint8Array(n)
  const inCore = new Uint8Array(n)
  for (let k = 0; k < SELF_SIZE && k < order.length; k++) inSelf[order[k]!] = 1
  for (let k = 0; k < CORE_SIZE && k < order.length; k++) inCore[order[k]!] = 1
  let selfSize = 0
  for (let i = 0; i < n; i++) if (inSelf[i]) selfSize++

  const coreCharge = (t: Int8Array): number => {
    let s = 0
    for (let i = 0; i < n; i++) if (inCore[i]) s += t[i]!
    return s
  }
  const reserve = (t: Int8Array): number => {
    let s = 0
    for (let i = 0; i < n; i++) if (inSelf[i]) s += t[i]!
    return s
  }

  // initial state: the self is full of pleasure (its reserve), everything else is at peace
  function makeSelf(): Int8Array {
    const t = new Int8Array(n)
    for (let i = 0; i < n; i++) if (inSelf[i]) t[i] = 1
    return t
  }

  // run until the core pleasure collapses (falls below half its start), return that endurance time
  function endurance(fieldLeak: number, pump: boolean): { beats: number; reserveEnd: number; q0: number; qEnd: number } {
    const t = makeSelf()
    const q0 = sumTone(t)
    const core0 = coreCharge(t)
    const rng = makeRng({ seed: 3 })
    const maxBeats = 200
    let beats = maxBeats
    for (let b = 1; b <= maxBeats; b++) {
      beat(t, edges, inSelf, distC, rng, fieldLeak, pump)
      if (coreCharge(t) < 0.5 * core0) {
        beats = b
        break
      }
    }
    return { beats, reserveEnd: reserve(t), q0, qEnd: sumTone(t) }
  }

  const reserveStart = reserve(makeSelf())

  const weak = endurance(0.15, true)
  const strong = endurance(0.6, true)
  const noPump = endurance(0.15, false)

  const reserveEndPumped = strong.reserveEnd
  const reserveDepletes = strong.reserveEnd < reserveStart
  const conserved = weak.q0 === weak.qEnd && strong.q0 === strong.qEnd && noPump.q0 === noPump.qEnd
  const strongerFieldDrainsFaster = strong.beats < weak.beats
  const pumpingProlongs = weak.beats > noPump.beats

  const solved = reserveDepletes && conserved && strongerFieldDrainsFaster && pumpingProlongs

  return {
    cells: n,
    selfSize,
    reserveStart,
    reserveEndPumped,
    reserveDepletes,
    conserved,
    enduranceWeakField: weak.beats,
    enduranceStrongField: strong.beats,
    strongerFieldDrainsFaster,
    endurancePumped: weak.beats,
    enduranceNoPump: noPump.beats,
    pumpingProlongs,
    solved,
  }
}

export function main(): void {
  const r = willpowerGrounded()
  console.log('P99: willpower grounded in the five (no scalar posited)')
  console.log('')
  console.log(`  ${r.cells} cells, a self of ${r.selfSize} cells holding a reserve of charge`)
  console.log(`  willpower = the measured reserve (self charge), not a posited number`)
  console.log('')
  console.log('  the reserve depletes while pumping against the field:')
  console.log(`    reserve ${r.reserveStart} -> ${r.reserveEndPumped} (strong field), depletes: ${r.reserveDepletes}`)
  console.log('')
  console.log('  a stronger field drains it faster (shorter endurance):')
  console.log(`    weak field endurance ${r.enduranceWeakField} beats, strong field ${r.enduranceStrongField} beats, faster: ${r.strongerFieldDrainsFaster}`)
  console.log('')
  console.log('  pumping prolongs the hold versus not pumping (spends the reserve to do so):')
  console.log(`    pumped ${r.endurancePumped} beats vs no-pump ${r.enduranceNoPump} beats, prolongs: ${r.pumpingProlongs}`)
  console.log('')
  console.log(`  charge Q conserved throughout: ${r.conserved}`)
  console.log('')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
