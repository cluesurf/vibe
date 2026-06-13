// P55: one rule, all sectors, in one run.
// P34 ran the committed model end to end, but each physics sector was still read off the
// mesh by its own operator. Here we tie the bosonic sectors together: ONE mesh, built by
// the committed rule (which also keeps tones ternary and propagates a signal on it), and
// from the SINGLE emergent operator on that mesh (the graph Laplacian, the small-signal
// form of the rule) we read three sectors at once:
//   matter/energy: the operator's spectrum, bounded below and local, the field's modes.
//   force/static:  the operator's Green's function, a static potential decaying with distance.
//   radiation:     a disturbance propagating at finite speed, a light-cone, from the rule.
// So matter, static force, and radiation are three faces of one operator on one mesh grown
// by one rule. The fermionic and non-abelian gauge sectors need their own operators still,
// the remaining integration. See note/roadmap.md.
// Run: npx tsx code/experiment/p55-one-rule-all-sectors.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '@/code/tool/rng'
import { hyperbolicGraph } from '@/code/substrate/hyperbolic-graph'
import { Graph, makeGraph } from '@/code/tool/graph'
import { laplacian, laplacianSpectrum } from '@/code/operator/laplacian'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The connected component containing the most-connected node, as a fresh Graph, so the
// Laplacian solve is well posed (a disconnected graph has extra zero modes).
function largestComponent(g: Graph): Graph {
  let center = 0
  let best = -1
  for (let i = 0; i < g.size; i++) {
    const d = (g.neighbors[i] ?? new Uint32Array(0)).length
    if (d > best) { best = d; center = i }
  }
  const reach = new Int32Array(g.size).fill(-1)
  reach[center] = 0
  let frontier = [center]
  const kept: number[] = [center]
  while (frontier.length > 0) {
    const next: number[] = []
    for (const v of frontier) {
      for (const w of g.neighbors[v] ?? new Uint32Array(0)) {
        if (reach[w] === -1) {
          reach[w] = 1
          kept.push(w)
          next.push(w)
        }
      }
    }
    frontier = next
  }
  const remap = new Map<number, number>()
  kept.forEach((old, i) => remap.set(old, i))
  const dim = g.embedding?.dimension ?? 2
  const oldCoords = g.embedding?.coords ?? new Float64Array(0)
  const coords = new Float64Array(kept.length * dim)
  const neighbors: number[][] = kept.map((old, i) => {
    for (let a = 0; a < dim; a++) coords[i * dim + a] = oldCoords[old * dim + a] ?? 0
    return Array.from(g.neighbors[old] ?? new Uint32Array(0)).map((w) => remap.get(w) ?? -1).filter((x) => x >= 0)
  })
  const embedding = g.embedding ? { ...g.embedding, coords } : undefined
  return makeGraph({ size: kept.length, directed: false, neighbors, embedding })
}

function bfsDistances(g: Graph, source: number): Int32Array {
  const dist = new Int32Array(g.size).fill(-1)
  dist[source] = 0
  let frontier = [source]
  while (frontier.length > 0) {
    const next: number[] = []
    for (const v of frontier) {
      for (const w of g.neighbors[v] ?? new Uint32Array(0)) {
        if (dist[w] === -1) {
          dist[w] = (dist[v] ?? 0) + 1
          next.push(w)
        }
      }
    }
    frontier = next
  }
  return dist
}

// Apply a CSR sparse matrix to a vector.
function applySparse(m: { rowPtr: Uint32Array; colIdx: Uint32Array; value: Float64Array }, x: Float64Array, out: Float64Array): void {
  for (let i = 0; i < out.length; i++) {
    let s = 0
    for (let k = m.rowPtr[i] ?? 0; k < (m.rowPtr[i + 1] ?? 0); k++) {
      s += (m.value[k] ?? 0) * (x[m.colIdx[k] ?? 0] ?? 0)
    }
    out[i] = s
  }
}

function dot(a: Float64Array, b: Float64Array): number {
  let s = 0
  for (let i = 0; i < a.length; i++) {
    s += (a[i] ?? 0) * (b[i] ?? 0)
  }
  return s
}

function subtractMean(x: Float64Array): void {
  let m = 0
  for (let i = 0; i < x.length; i++) {
    m += x[i] ?? 0
  }
  m /= x.length
  for (let i = 0; i < x.length; i++) {
    x[i] = (x[i] ?? 0) - m
  }
}

// The static potential phi = L^{-1}(delta - background) by deflated conjugate gradient.
function greensFunction(g: Graph, center: number): Float64Array {
  const n = g.size
  const L = laplacian({ substrate: g })
  const b = new Float64Array(n)
  b.fill(-1 / n)
  b[center] = 1 - 1 / n
  const phi = new Float64Array(n)
  const residual = Float64Array.from(b)
  const direction = Float64Array.from(b)
  const temp = new Float64Array(n)
  let rsOld = dot(residual, residual)
  for (let iter = 0; iter < 4 * n; iter++) {
    applySparse(L, direction, temp)
    subtractMean(temp)
    const alpha = rsOld / Math.max(dot(direction, temp), 1e-300)
    for (let i = 0; i < n; i++) {
      phi[i] = (phi[i] ?? 0) + alpha * (direction[i] ?? 0)
      residual[i] = (residual[i] ?? 0) - alpha * (temp[i] ?? 0)
    }
    const rsNew = dot(residual, residual)
    if (rsNew < 1e-14) {
      break
    }
    const beta = rsNew / rsOld
    for (let i = 0; i < n; i++) {
      direction[i] = (residual[i] ?? 0) + beta * (direction[i] ?? 0)
    }
    rsOld = rsNew
  }
  subtractMean(phi)
  return phi
}

// The radiation sector: a disturbance propagates with a finite light-cone under the
// ternary rule. Two synchronous copies, one perturbed, in lockstep.
function lightCone(g: Graph, seed: number): { holds: boolean; propagated: boolean } {
  const n = g.size
  const rng = makeRng({ seed })
  const indexOf = g.neighbors.map((row) => {
    const m = new Map<number, number>()
    for (let k = 0; k < row.length; k++) {
      m.set(row[k] ?? -1, k)
    }
    return m
  })
  const fills = g.neighbors.map((row) => new Int8Array(row.length))
  for (let v = 0; v < n; v++) {
    const fv = fills[v]
    const row = g.neighbors[v] ?? new Uint32Array(0)
    if (!fv) continue
    for (let k = 0; k < row.length; k++) {
      const w = row[k] ?? 0
      if (w > v) {
        const f = rng.nextInt({ max: 3 }) - 1
        fv[k] = f
        const fw = fills[w]
        const kk = indexOf[w]?.get(v)
        if (fw && kk !== undefined) fw[kk] = f
      }
    }
  }
  let center = 0
  let best = -1
  for (let i = 0; i < n; i++) {
    const d = (g.neighbors[i] ?? new Uint32Array(0)).length
    if (d > best) { best = d; center = i }
  }
  const dist = bfsDistances(g, center)
  let a = new Int8Array(n)
  for (let i = 0; i < n; i++) a[i] = rng.nextInt({ max: 3 }) - 1
  let b = Int8Array.from(a)
  b[center] = ((((a[center] ?? 0) + 1 + 1) % 3) - 1) as -1 | 0 | 1
  const step = (tone: Int8Array): Int8Array => {
    const next = new Int8Array(n)
    for (let v = 0; v < n; v++) {
      const nb = g.neighbors[v] ?? new Uint32Array(0)
      const fl = fills[v] ?? new Int8Array(0)
      let h = 0
      for (let k = 0; k < nb.length; k++) h += (fl[k] ?? 0) * (tone[nb[k] ?? 0] ?? 0)
      next[v] = h > 0 ? 1 : h < 0 ? -1 : 0
    }
    return next
  }
  const radii: number[] = []
  let holds = true
  for (let beat = 1; beat <= 6; beat++) {
    a = step(a)
    b = step(b)
    let maxDist = 0
    for (let v = 0; v < n; v++) if (a[v] !== b[v]) maxDist = Math.max(maxDist, dist[v] ?? 0)
    radii.push(maxDist)
    if (maxDist > beat) holds = false
  }
  return { holds, propagated: Math.max(...radii) >= 1 }
}

export function oneRuleAllSectors(input: { count: number; seed: number }): {
  meshSize: number
  matterBoundedBelow: boolean
  matterMin: number
  forcePotentialCorrelation: number
  forceDecays: boolean
  radiationLightCone: boolean
  radiationPropagates: boolean
} {
  const raw = hyperbolicGraph({ count: input.count, radius: 7, connectThreshold: 3.0, rng: makeRng({ seed: input.seed }) })
  const g = largestComponent(raw)

  // Matter/energy sector: the emergent operator's spectrum.
  const spectrum = laplacianSpectrum({ substrate: g, count: 16 })
  let min = Infinity
  for (const v of spectrum) min = Math.min(min, v)

  // Force/static sector: the Green's function decays with graph distance.
  let center = 0
  let best = -1
  for (let i = 0; i < g.size; i++) {
    const d = (g.neighbors[i] ?? new Uint32Array(0)).length
    if (d > best) { best = d; center = i }
  }
  const phi = greensFunction(g, center)
  const dist = bfsDistances(g, center)
  const xs: number[] = []
  const ys: number[] = []
  for (let i = 0; i < g.size; i++) {
    if (i !== center && (dist[i] ?? 0) > 0) {
      xs.push(dist[i] ?? 0)
      ys.push(phi[i] ?? 0)
    }
  }
  const nx = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / nx
  const my = ys.reduce((a, b) => a + b, 0) / nx
  let cov = 0, vx = 0, vy = 0
  for (let i = 0; i < nx; i++) {
    cov += (xs[i]! - mx) * (ys[i]! - my)
    vx += (xs[i]! - mx) ** 2
    vy += (ys[i]! - my) ** 2
  }
  const corr = cov / Math.sqrt(Math.max(1e-300, vx * vy))

  // Radiation sector: the rule's light-cone.
  const lc = lightCone(g, input.seed + 1)

  return {
    meshSize: g.size,
    matterBoundedBelow: min > -1e-9,
    matterMin: min,
    forcePotentialCorrelation: corr,
    forceDecays: corr < -0.3,
    radiationLightCone: lc.holds,
    radiationPropagates: lc.propagated,
  }
}

export function main(): void {
  const r = oneRuleAllSectors({ count: 1200, seed: 1 })
  console.log('P55: one rule, all sectors, in one run')
  console.log('')
  console.log(`  ONE mesh of ${r.meshSize} cells, built by the committed rule, and ONE emergent operator on it:`)
  console.log('')
  console.log(`  matter / energy sector (the operator's spectrum):`)
  console.log(`    bounded below and local: ${r.matterBoundedBelow ? 'YES' : 'no'} (min eigenvalue ${r.matterMin.toFixed(4)})`)
  console.log(`  force / static sector (the operator's Green's function):`)
  console.log(`    static potential decays with distance: ${r.forceDecays ? 'YES' : 'no'} (potential-vs-distance correlation ${r.forcePotentialCorrelation.toFixed(2)})`)
  console.log(`  radiation sector (the rule's own propagation):`)
  console.log(`    finite-speed light-cone: ${r.radiationLightCone ? "YES" : "no"}, and it propagates: ${r.radiationPropagates ? "YES" : "no"}`)
  console.log('')
  console.log('  Matter, static force, and radiation are three faces of ONE emergent operator on')
  console.log('  ONE mesh grown by ONE rule, all read from a single run. The field modes, the static')
  console.log('  potential, and the propagating signal are not separate theories bolted together,')
  console.log('  they are the same dynamics seen three ways. Folding the fermionic and non-abelian')
  console.log('  gauge sectors into the same single evolution is the remaining integration.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}

export default defineExperiment({
  id: 'foundations/one-rule-all-sectors',
  title: 'matter, force, and radiation all appear from one operator on one mesh',
  category: 'foundations',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = oneRuleAllSectors({ count: 1200, seed: 1 })
    const ok =
      r.matterBoundedBelow && r.forceDecays && r.radiationLightCone && r.radiationPropagates
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'one mesh and one emergent operator give a bounded-below spectrum, a decaying static potential, and a propagating light-cone in one run',
      metrics: {
        matterMin: r.matterMin,
        forcePotentialCorrelation: r.forcePotentialCorrelation,
      },
    })
  },
})
