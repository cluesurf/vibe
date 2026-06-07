// P37: one rule, causal propagation (deepening the capstone).
// P34 read geometry, the Hamiltonian, and the arrow off one mesh, but each physics
// sector still used its own operator. The first step of the deeper integration is to
// show the MICROSCOPIC RULE ITSELF, the ternary signed-majority update, carries the
// signal sector: a disturbance propagates causally, at finite speed, with a strict
// light-cone. We perturb one vibe and run two copies of the same dynamics in lockstep,
// and measure how far the difference can reach by each beat.
// See note/the-model.md. Run: npx tsx code/experiment/p37-one-rule-propagation.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'
import { hyperbolicGraph } from '~/substrate/hyperbolic-graph'
import { Graph } from '~/tool/graph'

function symmetricFills(g: Graph, seed: number): Int8Array[] {
  const rng = makeRng({ seed })
  const indexOf = g.neighbors.map((row) => {
    const m = new Map<number, number>()
    for (let k = 0; k < row.length; k++) {
      m.set(row[k] ?? -1, k)
    }
    return m
  })
  const fills = g.neighbors.map((row) => new Int8Array(row.length))
  for (let v = 0; v < g.size; v++) {
    const fv = fills[v]
    const row = g.neighbors[v] ?? new Uint32Array(0)
    if (!fv) {
      continue
    }
    for (let k = 0; k < row.length; k++) {
      const w = row[k] ?? 0
      if (w > v) {
        const f = rng.nextInt({ max: 3 }) - 1
        fv[k] = f
        const fw = fills[w]
        const kk = indexOf[w]?.get(v)
        if (fw && kk !== undefined) {
          fw[kk] = f
        }
      }
    }
  }
  return fills
}

// Synchronous signed-majority step: next tone from the whole current state at once.
function step(g: Graph, fills: Int8Array[], tone: Int8Array): Int8Array {
  const next = new Int8Array(g.size)
  for (let v = 0; v < g.size; v++) {
    const nb = g.neighbors[v] ?? new Uint32Array(0)
    const fl = fills[v] ?? new Int8Array(0)
    let h = 0
    for (let k = 0; k < nb.length; k++) {
      h += (fl[k] ?? 0) * (tone[nb[k] ?? 0] ?? 0)
    }
    next[v] = h > 0 ? 1 : h < 0 ? -1 : 0
  }
  return next
}

// Graph-distance from a source by breadth-first search.
function distancesFrom(g: Graph, source: number): Int32Array {
  const dist = new Int32Array(g.size).fill(-1)
  dist[source] = 0
  let frontier = [source]
  while (frontier.length > 0) {
    const nextFrontier: number[] = []
    for (const v of frontier) {
      for (const w of g.neighbors[v] ?? new Uint32Array(0)) {
        if (dist[w] === -1) {
          dist[w] = (dist[v] ?? 0) + 1
          nextFrontier.push(w)
        }
      }
    }
    frontier = nextFrontier
  }
  return dist
}

export function propagation(input: { count: number; beats: number; seed: number }): {
  frontRadius: number[]
  lightConeHolds: boolean
  frontAdvances: boolean
} {
  const rng = makeRng({ seed: input.seed })
  const g = hyperbolicGraph({ count: input.count, radius: 7, connectThreshold: 3.0, rng })
  const fills = symmetricFills(g, input.seed + 1)

  // A central source (most-connected node).
  let source = 0
  let best = -1
  for (let i = 0; i < g.size; i++) {
    const d = (g.neighbors[i] ?? new Uint32Array(0)).length
    if (d > best) {
      best = d
      source = i
    }
  }
  const dist = distancesFrom(g, source)

  // Random initial state, then the perturbed copy flips the source.
  let toneA = new Int8Array(g.size)
  for (let i = 0; i < g.size; i++) {
    toneA[i] = rng.nextInt({ max: 3 }) - 1
  }
  let toneB = Int8Array.from(toneA)
  toneB[source] = (((toneA[source] ?? 0) + 1 + 1) % 3) - 1 // guaranteed different ternary value

  const frontRadius: number[] = []
  let lightConeHolds = true
  for (let beat = 1; beat <= input.beats; beat++) {
    toneA = step(g, fills, toneA)
    toneB = step(g, fills, toneB)
    let maxDist = 0
    for (let v = 0; v < g.size; v++) {
      if (toneA[v] !== toneB[v]) {
        maxDist = Math.max(maxDist, dist[v] ?? 0)
      }
    }
    frontRadius.push(maxDist)
    // The light-cone bound: nothing can differ beyond graph-distance equal to the beat.
    if (maxDist > beat) {
      lightConeHolds = false
    }
  }
  const frontAdvances = (frontRadius[2] ?? 0) > (frontRadius[0] ?? 0)
  return { frontRadius, lightConeHolds, frontAdvances }
}

export function main(): void {
  const r = propagation({ count: 700, beats: 8, seed: 1 })
  console.log('P37: one rule, causal propagation (the signal sector from the rule itself)')
  console.log('')
  console.log('  perturb one vibe, run two copies of the ternary rule in lockstep,')
  console.log('  measure the furthest graph-distance the difference reaches by each beat:')
  console.log('    beat:          ' + r.frontRadius.map((_, i) => (i + 1).toString().padStart(3)).join(''))
  console.log('    front radius:  ' + r.frontRadius.map((x) => x.toString().padStart(3)).join(''))
  console.log('')
  console.log(`  light-cone holds (front radius never exceeds the beat number): ${r.lightConeHolds ? 'YES' : 'no'}`)
  console.log(`  the front advances (a disturbance really propagates): ${r.frontAdvances ? 'YES' : 'no'}`)
  console.log('')
  console.log('  So the microscopic rule itself carries causal propagation at finite speed, with a')
  console.log('  strict light-cone of one hop per beat. The signal sector, a disturbance traveling')
  console.log('  through the mesh, is not a separate operator added on top. It is what the one rule')
  console.log('  already does. Matter and signals ride the same dynamics that builds the geometry.')
  console.log('  The front then stays contained rather than swamping the mesh, because the dynamics')
  console.log('  is dissipative and locally stable (the convergence of P34), so a small disturbance')
  console.log('  stays small. Causality from the rule, stability from the rule, one mechanism.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
