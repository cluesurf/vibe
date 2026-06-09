// P119: attention and a global workspace, emergent from the base. (minimal-additions-for-consciousness.md.)
//
// The hub is the global WORKSPACE: the single place where every boundary sector's signal converges (P116).
// ATTENTION is a gain on that workspace: clamp ONE sector strongly and the others weakly, and the
// attended sector should WIN the workspace, the hub represents the attended signal far more than the
// unattended ones, and it is STEERABLE (attend a different sector and the hub now represents that one).
//
// Honest scope: the workspace is the hub (the convergence point), and attention selects its content.
// Physical BROADCAST to the FAR periphery is range-limited (the field is massive, short-ranged, P114), so
// the winning content is available AT the workspace, not copied to every distant cell. That is the
// realistic emergent workspace. Run: npx tsx code/experiment/p119-attention-workspace.ts

import { pathToFileURL } from 'node:url'
import { buildDodecagrid } from '~/substrate/coxeter/cell-scale'
import { makeRng } from '~/tool/rng'

type Rng = { next: () => number }

function bfs(offsets: Int32Array, adj: Int32Array, n: number, src: number, maxR: number): Int32Array {
  const dist = new Int32Array(n).fill(-1)
  dist[src] = 0
  let fr = [src]
  let r = 0
  while (fr.length > 0 && r < maxR) {
    r++
    const next: number[] = []
    for (const u of fr) for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
      const w = adj[p]!
      if (dist[w] === -1) {
        dist[w] = r
        next.push(w)
      }
    }
    fr = next
  }
  return dist
}

function edgesFromCsr(offsets: Int32Array, adj: Int32Array, n: number): { eu: Int32Array; ev: Int32Array } {
  const eu: number[] = []
  const ev: number[] = []
  for (let v = 0; v < n; v++) for (let p = offsets[v]!; p < offsets[v + 1]!; p++) {
    const w = adj[p]!
    if (w > v) {
      eu.push(v)
      ev.push(w)
    }
  }
  return { eu: Int32Array.from(eu), ev: Int32Array.from(ev) }
}

function fullBeat(tone: Int8Array, eu: Int32Array, ev: Int32Array, moved: Uint8Array, rng: Rng): void {
  moved.fill(0)
  for (let k = 0; k < eu.length; k++) {
    const v = eu[k]!
    const w = ev[k]!
    if (moved[v] || moved[w]) continue
    const a = tone[v]!
    const b = tone[w]!
    if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
      tone[v] = 0
      tone[w] = 0
      moved[v] = 1
      moved[w] = 1
    } else if ((a === 0) !== (b === 0)) {
      const c = a === 0 ? w : v
      const e = a === 0 ? v : w
      if (rng.next() < 0.5) {
        tone[e] = tone[c]!
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    }
  }
}

function corr(x: number[], y: number[]): number {
  const n = x.length
  let mx = 0
  let my = 0
  for (let i = 0; i < n; i++) {
    mx += x[i]!
    my += y[i]!
  }
  mx /= n
  my /= n
  let sxy = 0
  let sxx = 0
  let syy = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i]! - mx
    const dy = y[i]! - my
    sxy += dx * dy
    sxx += dx * dx
    syy += dy * dy
  }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0
}

export function attentionWorkspace(input?: { n?: number }): {
  n: number
  attendedCorr: number[]
  unattendedCorr: number[]
  attentionSelects: boolean
  steerable: boolean
  solved: boolean
} {
  const n = input?.n ?? 60000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  let center = 0
  for (let i = 1; i < N; i++) if (g.offsets[i + 1]! - g.offsets[i]! > g.offsets[center + 1]! - g.offsets[center]!) center = i
  const dist = bfs(g.offsets, g.adj, N, center, 12)
  const rSelf = 5
  const self: number[] = []
  for (let i = 0; i < N; i++) if (dist[i]! >= 0 && dist[i]! <= rSelf) self.push(i)
  const isInput = new Uint8Array(N)
  const inputAll: number[] = []
  for (const i of self) if (dist[i]! >= rSelf - 1) {
    isInput[i] = 1
    inputAll.push(i)
  }
  // K spatially-coherent sectors: farthest-point seeds among the boundary, then nearest-seed (Voronoi)
  const msBFS = (srcs: number[]): { dist: Int32Array; label: Int32Array } => {
    const d = new Int32Array(N).fill(-1)
    const lab = new Int32Array(N).fill(-1)
    let fr: number[] = []
    for (let s = 0; s < srcs.length; s++) {
      d[srcs[s]!] = 0
      lab[srcs[s]!] = s
      fr.push(srcs[s]!)
    }
    while (fr.length > 0) {
      const next: number[] = []
      for (const u of fr) for (let p = g.offsets[u]!; p < g.offsets[u + 1]!; p++) {
        const w = g.adj[p]!
        if (d[w] === -1) {
          d[w] = d[u]! + 1
          lab[w] = lab[u]!
          next.push(w)
        }
      }
      fr = next
    }
    return { dist: d, label: lab }
  }
  // two coherent input regions A and B (two farthest-point seeds), the rest of the boundary = background
  const seeds: number[] = [inputAll[0]!]
  {
    const { dist: d } = msBFS(seeds)
    let far = inputAll[0]!
    let fd = -1
    for (const i of inputAll) if (d[i]! > fd) {
      fd = d[i]!
      far = i
    }
    seeds.push(far)
  }
  const { label } = msBFS(seeds)
  const regionA = inputAll.filter((i) => label[i] === 0)
  const regionB = inputAll.filter((i) => label[i] === 1)
  const hubBall = (): number[] => {
    const out: number[] = []
    const seen = new Uint8Array(N)
    seen[center] = 1
    let fr = [center]
    while (fr.length > 0 && out.length < 40) {
      const nf: number[] = []
      for (const u of fr) {
        if (isInput[u]) continue
        out.push(u)
        for (let p = g.offsets[u]!; p < g.offsets[u + 1]!; p++) {
          const w = g.adj[p]!
          if (!seen[w]) {
            seen[w] = 1
            nf.push(w)
          }
        }
      }
      fr = nf
    }
    return out
  }
  const hub = hubBall()
  const meanOver = (tone: Int8Array, cells: number[]): number => {
    let s = 0
    for (const i of cells) s += tone[i]!
    return cells.length > 0 ? s / cells.length : 0
  }

  // drive a region with signal `sig` at the given GAIN (attended = 1.0, ignored = 0.25), with the rest
  // of the boundary as independent noise (distractors). Return how well the hub represents that signal.
  const otherBoundary = inputAll.filter((i) => label[i] !== 0 && label[i] !== 1)
  function trial(region: number[], gain: number): number {
    const tone = new Int8Array(N)
    const rng = makeRng({ seed: 9 })
    const T = 300
    let sig = 1
    const hubS: number[] = []
    const sigS: number[] = []
    const noiseTargets = otherBoundary.concat(region === regionA ? regionB : regionA)
    for (let t = 0; t < T; t++) {
      if (rng.next() < 0.06) sig = -sig
      for (const i of region) if (rng.next() < gain) tone[i] = sig as -1 | 0 | 1 // gain = attention
      for (const i of noiseTargets) tone[i] = (rng.next() < 0.5 ? 1 : -1) as -1 | 0 | 1 // distractors
      fullBeat(tone, eu, ev, moved, rng)
      for (const i of region) if (rng.next() < gain) tone[i] = sig as -1 | 0 | 1
      for (const i of noiseTargets) tone[i] = (rng.next() < 0.5 ? 1 : -1) as -1 | 0 | 1
      hubS.push(meanOver(tone, hub))
      sigS.push(sig)
    }
    return Math.abs(corr(hubS, sigS))
  }

  const aHi = trial(regionA, 1.0)
  const aLo = trial(regionA, 0.25)
  const bHi = trial(regionB, 1.0)
  const bLo = trial(regionB, 0.25)
  const attendedCorr = [aHi, bHi]
  const unattendedCorr = [aLo, bLo]
  // attention = gain boosts the region's representation at the hub, for BOTH regions (steerable)
  const attentionSelects = aHi > aLo + 0.15 && aHi > 0.3
  const steerable = bHi > bLo + 0.15 && bHi > 0.3
  const solved = attentionSelects && steerable

  return { n: N, attendedCorr, unattendedCorr, attentionSelects, steerable, solved }
}

export function main(): void {
  const r = attentionWorkspace()
  console.log('P119: attention and a global workspace (emergent)')
  console.log('')
  console.log('  the hub is the global workspace. attention (a gain) boosts the attended input there:')
  console.log(`    region A: attended corr ${r.attendedCorr[0]!.toFixed(2)} vs ignored ${r.unattendedCorr[0]!.toFixed(2)} -> boosted: ${r.attentionSelects}`)
  console.log(`    region B: attended corr ${r.attendedCorr[1]!.toFixed(2)} vs ignored ${r.unattendedCorr[1]!.toFixed(2)} -> boosted (steerable): ${r.steerable}`)
  console.log('')
  console.log(`  attention selects the workspace content, steerably, from the base: ${r.solved}`)
  console.log('  (broadcast to the FAR periphery is range-limited, the workspace is the hub itself)')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
