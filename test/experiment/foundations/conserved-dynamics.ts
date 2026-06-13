// P94: the conserved dynamics on the real {5,3,4} crystal. (Stage 2 of the unfolding,
// see note/research/vibe/notes/unfolding-experiment-plan.md.)
//
// Implements the discrete conserved exchange (how-zero-becomes-charged.md) with its three elementary
// moves, all conserving the total charge Q = sum of tones:
//   - HOP (on a sharing fill, +1): a charge quantum swaps with a neutral neighbor, (0,+1)->(+1,0).
//     This is transport. Unbiased it is diffusion (a random walk), biased it is pumping.
//   - SHARE (on a sharing fill, +1): a pole annihilates, (+1,-1)->(0,0).
//   - POLARIZE (on a polarizing fill, -1): a peaceful pair creates, (0,0)->(+1,-1).
//   - INSULATE (on a 0 fill): nothing.
// Predictions checked: Q is conserved exactly under every move, an unbiased pocket DIFFUSES and drains
// (its concentration falls), a biased self PUMPS charge inward (net charge concentrates at the center),
// and polarizing fills CREATE pairs from peace which sharing fills then ANNIHILATE, all at fixed Q.
// Run: npx tsx code/experiment/p94-conserved-dynamics.ts

import { pathToFileURL } from 'node:url'
import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

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

// One beat of the conserved exchange. fillSign sets every note's fill. If pump is given, hops are
// directed (+ toward lower distance, - toward higher), otherwise hops are an unbiased random walk.
// Every cell takes at most one move per beat. Every branch preserves the sum, so Q is conserved.
function beat(
  tone: Int8Array,
  edges: Array<[number, number]>,
  fillSign: number,
  rng: Rng,
  pump: Int32Array | null,
): void {
  const moved = new Uint8Array(tone.length)
  for (const [v, w] of edges) {
    if (moved[v] || moved[w]) continue
    const tv = tone[v]!
    const tw = tone[w]!
    if (fillSign === -1) {
      // polarize: create a pair from a peaceful pair
      if (tv === 0 && tw === 0) {
        if (rng.next() < 0.5) {
          tone[v] = 1
          tone[w] = -1
        } else {
          tone[v] = -1
          tone[w] = 1
        }
        moved[v] = 1
        moved[w] = 1
      }
    } else if (fillSign === 1) {
      if ((tv === 1 && tw === -1) || (tv === -1 && tw === 1)) {
        // share: annihilate a pole
        tone[v] = 0
        tone[w] = 0
        moved[v] = 1
        moved[w] = 1
      } else if (tv === 0 && tw !== 0) {
        // hop: charged w into neutral v
        if (pump ? (tw > 0 ? dist(pump, v) < dist(pump, w) : dist(pump, v) > dist(pump, w)) : rng.next() < 0.5) {
          tone[v] = tw
          tone[w] = 0
          moved[v] = 1
          moved[w] = 1
        }
      } else if (tw === 0 && tv !== 0) {
        // hop: charged v into neutral w
        if (pump ? (tv > 0 ? dist(pump, w) < dist(pump, v) : dist(pump, w) > dist(pump, v)) : rng.next() < 0.5) {
          tone[w] = tv
          tone[v] = 0
          moved[v] = 1
          moved[w] = 1
        }
      }
    }
  }
}

function dist(d: Int32Array, i: number): number {
  return d[i] ?? 1e9
}

const sumTone = (t: Int8Array): number => {
  let s = 0
  for (let i = 0; i < t.length; i++) s += t[i]!
  return s
}

export function conservedDynamics(): {
  cells: number
  conservedDiffusion: boolean
  conservedPump: boolean
  conservedPairs: boolean
  absChargeStart: number
  absChargeDiffused: number
  diffusionDrains: boolean
  netCenterPumped: number
  netCenterDiffused: number
  pumpingConcentrates: boolean
  pairsCreated: number
  pairsAfterAnnihilation: number
  pairsCreateAndAnnihilate: boolean
  solved: boolean
} {
  const mesh = buildCoxeterMesh({ symbol: [5, 3, 4], depth: 20, maxChambers: 60000 })
  const neighbors = mesh.neighbors
  const n = mesh.cellCount
  const edges = edgesOf(neighbors)

  // center = the most-connected (deepest interior) cell
  let center = 0
  for (let i = 1; i < n; i++) if (neighbors[i]!.length > neighbors[center]!.length) center = i
  const distC = bfs(neighbors, n, center)
  const r0 = 4

  // a balanced charged pocket near the center (equal + and -, so Q = 0)
  function makePocket(seed: number): Int8Array {
    const t = new Int8Array(n)
    const rng = makeRng({ seed })
    const inner: number[] = []
    for (let i = 0; i < n; i++) if (dist(distC, i) <= r0) inner.push(i)
    // alternate +1 / -1 over the inner cells, balanced
    for (let k = 0; k < inner.length; k++) t[inner[k]!] = k % 2 === 0 ? 1 : -1
    if (inner.length % 2 === 1) t[inner[inner.length - 1]!] = 0 // keep Q = 0
    void rng
    return t
  }

  const absInR0 = (t: Int8Array): number => {
    let s = 0
    for (let i = 0; i < n; i++) if (dist(distC, i) <= r0) s += Math.abs(t[i]!)
    return s
  }
  const netInR0 = (t: Int8Array): number => {
    let s = 0
    for (let i = 0; i < n; i++) if (dist(distC, i) <= r0) s += t[i]!
    return s
  }

  // DIFFUSION: unbiased hops spread and drain the pocket
  const diff = makePocket(1)
  const q0diff = sumTone(diff)
  const absChargeStart = absInR0(diff)
  const rngD = makeRng({ seed: 11 })
  for (let b = 0; b < 80; b++) beat(diff, edges, 1, rngD, null)
  const absChargeDiffused = absInR0(diff)
  const netCenterDiffused = netInR0(diff)
  const conservedDiffusion = sumTone(diff) === q0diff

  // PUMPING: biased hops pull + toward center, push - out, concentrating net charge
  const pump = makePocket(1)
  const q0pump = sumTone(pump)
  const rngP = makeRng({ seed: 11 })
  for (let b = 0; b < 80; b++) beat(pump, edges, 1, rngP, distC)
  const netCenterPumped = netInR0(pump)
  const conservedPump = sumTone(pump) === q0pump

  // PAIRS: from all-peace, polarizing fills create pairs, then sharing fills annihilate them
  const pair = new Int8Array(n) // all 0
  const q0pair = sumTone(pair)
  const rngC = makeRng({ seed: 7 })
  for (let b = 0; b < 40; b++) beat(pair, edges, -1, rngC, null)
  let pairsCreated = 0
  for (let i = 0; i < n; i++) if (pair[i] !== 0) pairsCreated++
  const qAfterCreate = sumTone(pair)
  for (let b = 0; b < 120; b++) beat(pair, edges, 1, rngC, null)
  let pairsAfterAnnihilation = 0
  for (let i = 0; i < n; i++) if (pair[i] !== 0) pairsAfterAnnihilation++
  const conservedPairs = qAfterCreate === q0pair && sumTone(pair) === q0pair

  const diffusionDrains = absChargeDiffused < absChargeStart
  const pumpingConcentrates = Math.abs(netCenterPumped) > Math.abs(netCenterDiffused) + 3
  const pairsCreateAndAnnihilate = pairsCreated > 0 && pairsAfterAnnihilation < pairsCreated

  const solved =
    conservedDiffusion &&
    conservedPump &&
    conservedPairs &&
    diffusionDrains &&
    pumpingConcentrates &&
    pairsCreateAndAnnihilate

  return {
    cells: n,
    conservedDiffusion,
    conservedPump,
    conservedPairs,
    absChargeStart,
    absChargeDiffused,
    diffusionDrains,
    netCenterPumped,
    netCenterDiffused,
    pumpingConcentrates,
    pairsCreated,
    pairsAfterAnnihilation,
    pairsCreateAndAnnihilate,
    solved,
  }
}

export function main(): void {
  const r = conservedDynamics()
  console.log('P94: the conserved dynamics on the real {5,3,4} crystal')
  console.log('')
  console.log(`  ${r.cells} cells, the discrete conserved exchange (hop / polarize / share)`)
  console.log('')
  console.log('  charge conserved exactly under every regime:')
  console.log(`    diffusion ${r.conservedDiffusion}, pumping ${r.conservedPump}, pairs ${r.conservedPairs}`)
  console.log('')
  console.log('  diffusion drains a pocket (unbiased hops spread it):')
  console.log(`    charge within the center fell ${r.absChargeStart} -> ${r.absChargeDiffused}, drains ${r.diffusionDrains}`)
  console.log('')
  console.log('  pumping concentrates (biased hops pull + in, push - out):')
  console.log(`    net center charge: pumped ${r.netCenterPumped}, diffused ${r.netCenterDiffused}, concentrates ${r.pumpingConcentrates}`)
  console.log('')
  console.log('  pairs create from peace then annihilate (conserving Q = 0 throughout):')
  console.log(`    created ${r.pairsCreated} charged cells, then down to ${r.pairsAfterAnnihilation}: ${r.pairsCreateAndAnnihilate}`)
  console.log('')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
  id: 'foundations/conserved-dynamics',
  title: 'conserved exchange on {5,3,4} keeps Q exact while charge diffuses, pumps, and pairs',
  category: 'foundations',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = conservedDynamics()
    const ok =
      r.solved &&
      r.conservedDiffusion &&
      r.conservedPump &&
      r.conservedPairs &&
      r.diffusionDrains &&
      r.pumpingConcentrates &&
      r.pairsCreateAndAnnihilate
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the discrete conserved exchange holds Q exactly while a pocket drains, a biased self pumps charge inward, and polarizing fills create pairs that sharing fills annihilate',
      metrics: {
        absChargeStart: r.absChargeStart,
        absChargeDiffused: r.absChargeDiffused,
        netCenterPumped: r.netCenterPumped,
        netCenterDiffused: r.netCenterDiffused,
        pairsCreated: r.pairsCreated,
        pairsAfterAnnihilation: r.pairsAfterAnnihilation,
      },
    })
  },
})
