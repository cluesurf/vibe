// A tiny DSL for the committed Vibe Theory model, so the whole model reads at a
// glance. Write it in a few fluent lines, print it with describe(), and build and run
// it. The defaults ARE the committed model of note/the-model.md, so vibe().build() is
// the model itself, and the fluent setters let you express variants (a lattice, a
// static universe) for comparison. No string is ever evaluated: options are named and
// dispatched, so this is a constructor, not runtime codegen.
//
//   const model = vibe().size(1500).seed(1)        // the committed model (defaults)
//   console.log(model.describe())                  // the model at a glance, for the paper
//   const world = model.build().run(40)            // build the mesh, run 40 beats
//   console.log(world.read())                      // emergent structures read off the mesh

import { makeRng, Rng } from '@/code/tool/rng'
import { Substrate, undirectedAdjacency } from '@/code/tool/substrate'
import { hyperbolicGraph } from '@/code/substrate/hyperbolic-graph'
import { hyperbolicDodecagrid } from '@/code/substrate/hyperbolic-honeycomb'
import { coxeterTessellation } from '@/code/substrate/coxeter'
import { lattice } from '@/code/substrate/lattice'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { lorentzIsotropy } from '@/code/measure/lorentz'
import {
  ballGrowth,
  growthIsExponential,
} from '@/code/measure/dimension'
import { algebraicConnectivity } from '@/code/measure/integration'
import { laplacianSpectrum } from '@/code/operator/laplacian'

// The committed mesh is the random hyperbolic causal mesh. The two crystals are the ideal
// forms it approximates: the 2D heptagrid {7,3} and the real 3D substrate, the dodecagrid
// {5,3,4} (P45, P62, P68). Lattice and sprinkle are comparison meshes.
export type MeshKind =
  | 'hyperbolic'
  | 'dodecagrid'
  | 'coxeter'
  | 'lattice'
  | 'sprinkle'
export type ToneKind = 'ternary' | 'binary'
export type FillKind = 'ternary-symmetric' | 'ternary-directed'
export type RuleKind = 'signed-majority'
export type ScheduleKind = 'asynchronous' | 'synchronous'
export type GrowthKind = 'net-positive' | 'static'

export interface VibeConfig {
  mesh: MeshKind
  tone: ToneKind
  fill: FillKind
  rule: RuleKind
  schedule: ScheduleKind
  growth: GrowthKind
  size: number
  seed: number
}

// The committed model is the default. Every field is a fixed choice from note/the-model.md.
const COMMITTED: VibeConfig = {
  mesh: 'hyperbolic',
  tone: 'ternary',
  fill: 'ternary-symmetric',
  rule: 'signed-majority',
  schedule: 'asynchronous',
  growth: 'net-positive',
  size: 1000,
  seed: 1,
}

const MESH_NOTE: Record<MeshKind, string> = {
  hyperbolic:
    'random hyperbolic causal mesh, Lorentz-safe, mean degree about 10',
  dodecagrid:
    'the real 3D crystal, the dodecahedral honeycomb {5,3,4} (P45)',
  coxeter:
    'the 2D heptagrid crystal {7,3}, the ideal Lorentz-safe form (P41)',
  lattice:
    'regular lattice (a comparison: has a preferred frame, breaks Lorentz)',
  sprinkle:
    'flat Poisson sprinkling (a comparison: Lorentz-safe but not navigable)',
}

export class VibeBuilder {
  private cfg: VibeConfig
  constructor(cfg: VibeConfig) {
    this.cfg = cfg
  }

  mesh(k: MeshKind): VibeBuilder {
    return new VibeBuilder({ ...this.cfg, mesh: k })
  }

  tone(k: ToneKind): VibeBuilder {
    return new VibeBuilder({ ...this.cfg, tone: k })
  }

  fill(k: FillKind): VibeBuilder {
    return new VibeBuilder({ ...this.cfg, fill: k })
  }

  rule(k: RuleKind): VibeBuilder {
    return new VibeBuilder({ ...this.cfg, rule: k })
  }

  schedule(k: ScheduleKind): VibeBuilder {
    return new VibeBuilder({ ...this.cfg, schedule: k })
  }

  grow(k: GrowthKind): VibeBuilder {
    return new VibeBuilder({ ...this.cfg, growth: k })
  }

  size(n: number): VibeBuilder {
    return new VibeBuilder({ ...this.cfg, size: n })
  }

  seed(s: number): VibeBuilder {
    return new VibeBuilder({ ...this.cfg, seed: s })
  }

  config(): VibeConfig {
    return { ...this.cfg }
  }

  // The model at a glance: a readable spec block, for the paper and the reader.
  describe(): string {
    const c = this.cfg
    const toneSet = c.tone === 'ternary' ? '{-1, 0, +1}' : '{-1, +1}'

    return [
      'vibe model',
      `  mesh      ${c.mesh}   (${MESH_NOTE[c.mesh]})`,
      `  tone      ${c.tone}   ${toneSet}, the felt quality of a vibe`,
      `  fill      ${c.fill}   each note carries a ternary fill (a shared relational vibe)`,
      `  rule      ${c.rule}   next(v) = sign( sum over neighbours w of fill(v,w) * will(w) )`,
      `  schedule  ${c.schedule}   local, neighbours only${c.schedule === 'asynchronous' ? ', no global clock' : ''}`,
      `  growth    ${c.growth}   ${c.growth === 'net-positive' ? 'eternal expansion by local birth' : 'fixed size'}`,
      `  size ${c.size}, seed ${c.seed}`,
    ].join('\n')
  }

  build(): VibeWorld {
    return new VibeWorld(this.cfg)
  }
}

// A built, runnable universe.
export class VibeWorld {
  private cfg: VibeConfig
  private substrate: Substrate
  private neighbors: readonly Uint32Array[]
  private tone: Int8Array
  private fills: Int8Array[]
  private rng: Rng

  constructor(cfg: VibeConfig) {
    this.cfg = cfg
    this.rng = makeRng({ seed: cfg.seed })
    this.substrate = buildSubstrate(cfg, this.rng)
    this.neighbors = undirectedAdjacency({ substrate: this.substrate })

    const n = this.substrate.size
    const toneValues = cfg.tone === 'ternary' ? 3 : 2
    this.tone = new Int8Array(n)

    for (let i = 0; i < n; i++) {
      this.tone[i] =
        toneValues === 3
          ? this.rng.nextInt({ max: 3 }) - 1
          : this.rng.nextInt({ max: 2 }) * 2 - 1
    }

    this.fills = buildFills(this.neighbors, cfg, this.rng)
  }

  // Run the update rule for the given number of beats (sweeps).
  run(beats: number): VibeWorld {
    const n = this.substrate.size

    for (let beat = 0; beat < beats; beat++) {
      const order = this.cfg.schedule === 'synchronous' ? null : true

      for (let s = 0; s < n; s++) {
        const v = order ? this.rng.nextInt({ max: n }) : s
        const nb = this.neighbors[v] ?? new Uint32Array(0)
        const fl = this.fills[v] ?? new Int8Array(0)

        let h = 0

        for (let k = 0; k < nb.length; k++) {
          h += (fl[k] ?? 0) * (this.tone[nb[k] ?? 0] ?? 0)
        }

        this.tone[v] = h > 0 ? 1 : h < 0 ? -1 : 0
      }
    }

    return this
  }

  // Emergent structures, read off the same mesh. This is the committed model run end to end
  // (the capstone), with the key structures spanning the findings read off one instantiation:
  // geometry and its dominance, Lorentz safety, the bounded-below Hamiltonian, integration, the
  // ternary tones, and the recursion (higher vibes coarse-grained off the settled mesh).
  read(): {
    meanDegree: number
    lorentzAnisotropy: number
    exponentialReach: boolean
    hamiltonianMin: number
    hamiltonianBoundedBelow: boolean
    integrationPhi: number
    higherVibes: number
    toneHistogram: { minus: number; zero: number; plus: number }
  } {
    const n = this.substrate.size

    let deg = 0

    for (let i = 0; i < n; i++) {
      deg += (this.neighbors[i] ?? new Uint32Array(0)).length
    }

    const aniso = lorentzIsotropy({
      substrate: this.substrate,
      samples: 2000,
      rng: makeRng({ seed: this.cfg.seed + 11 }),
    })

    // Ball growth from the most-connected node (a central one).
    let center = 0
    let best = -1

    for (let i = 0; i < n; i++) {
      const d = (this.neighbors[i] ?? new Uint32Array(0)).length

      if (d > best) {
        best = d
        center = i
      }
    }

    const growth = ballGrowth({
      substrate: this.substrate,
      center,
      maxRadius: 12,
    })

    const spectrum = laplacianSpectrum({
      substrate: this.substrate,
      count: 20,
    })

    let lapMin = Infinity

    for (const v of spectrum) {
      lapMin = Math.min(lapMin, v)
    }

    let minus = 0
    let zero = 0
    let plus = 0

    for (const t of this.tone) {
      if (t < 0) {
        minus += 1
      } else if (t === 0) {
        zero += 1
      } else {
        plus += 1
      }
    }

    // Integration Phi (P63): the algebraic connectivity of the whole mesh, how strongly it
    // resists being cut into independent parts, the structural correlate of a unity.
    const phi = algebraicConnectivity({
      adjacency: this.neighbors,
      region: new Set(Array.from({ length: n }, (_, i) => i)),
    })

    // Recursion (P57 to P60): coarse-grain the settled mesh into coherent domains, the higher
    // vibes. We count those of meaningful size, the genuine wholes-within-the-whole.
    const higherVibes = countHigherVibes(this.neighbors, this.tone, 3)

    return {
      meanDegree: deg / Math.max(1, n),
      lorentzAnisotropy: aniso.anisotropy,
      exponentialReach: growthIsExponential({ growth }),
      hamiltonianMin: lapMin,
      hamiltonianBoundedBelow: lapMin > -1e-9,
      integrationPhi: phi,
      higherVibes,
      toneHistogram: { minus, zero, plus },
    }
  }
}

// Coarse-grain the settled mesh into coherent domains (connected regions of one tone) and count
// those of at least minSize, the higher vibes the recursion reads off the base (P57 to P60).
function countHigherVibes(
  neighbors: readonly Uint32Array[],
  tone: Int8Array,
  minSize: number,
): number {
  const n = neighbors.length
  const seen = new Uint8Array(n)

  let count = 0

  for (let s = 0; s < n; s++) {
    if (seen[s]) {
      continue
    }

    let size = 0
    let frontier = [s]
    seen[s] = 1

    while (frontier.length > 0) {
      const next: number[] = []

      for (const v of frontier) {
        size += 1

        for (const w of neighbors[v] ?? new Uint32Array(0)) {
          if (!seen[w] && tone[w] === tone[v]) {
            seen[w] = 1
            next.push(w)
          }
        }
      }

      frontier = next
    }

    if (size >= minSize) {
      count += 1
    }
  }

  return count
}

function buildSubstrate(cfg: VibeConfig, rng: Rng): Substrate {
  if (cfg.mesh === 'hyperbolic') {
    return hyperbolicGraph({
      count: cfg.size,
      radius: 7,
      connectThreshold: 3.0,
      rng,
    })
  }

  if (cfg.mesh === 'dodecagrid') {
    return hyperbolicDodecagrid({
      depth: 4,
      connectThreshold: 2.0,
      maxVertices: cfg.size,
    })
  }

  if (cfg.mesh === 'coxeter') {
    return coxeterTessellation({
      schlafli: [7, 3],
      maxVertices: cfg.size,
    })
  }

  if (cfg.mesh === 'lattice') {
    const side = Math.max(2, Math.round(Math.sqrt(cfg.size)))

    return lattice({
      dimension: 2,
      extent: side,
      signature: 'riemannian',
    })
  }

  return sprinkleMinkowski({ dimension: 2, count: cfg.size, rng })
}

// Ternary fills, symmetric (one shared value per note) unless directed.
function buildFills(
  neighbors: readonly Uint32Array[],
  cfg: VibeConfig,
  rng: Rng,
): Int8Array[] {
  const n = neighbors.length
  const fills = neighbors.map(row => new Int8Array(row.length))

  if (cfg.fill === 'ternary-directed') {
    for (let v = 0; v < n; v++) {
      const fv = fills[v]
      const row = neighbors[v] ?? new Uint32Array(0)

      if (fv) {
        for (let k = 0; k < row.length; k++) {
          fv[k] = rng.nextInt({ max: 3 }) - 1
        }
      }
    }

    return fills
  }

  const indexOf = neighbors.map(row => {
    const m = new Map<number, number>()

    for (let k = 0; k < row.length; k++) {
      m.set(row[k] ?? -1, k)
    }

    return m
  })

  for (let v = 0; v < n; v++) {
    const fv = fills[v]
    const row = neighbors[v] ?? new Uint32Array(0)

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

// Start a model. With no setters it is the committed model of note/the-model.md.
export function vibe(): VibeBuilder {
  return new VibeBuilder({ ...COMMITTED })
}
