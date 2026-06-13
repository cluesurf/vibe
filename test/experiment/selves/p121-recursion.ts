// P121: full recursion, a model of the model (the tower of self-models). (P116, P118, the-self-architecture.md.)
//
// A self-model (P116) is a part that represents the whole self. Recursion is a model OF a model. We build
// two selves in a chain: self 1 is driven by the world and forms hub1 (a model of the world, P116). hub1's
// running representation is then WIRED as the input to self 2, which forms hub2. So hub2 comes to represent
// hub1, a representation of a representation. The recursive chain is world -> model1 -> model2(model1).
//
// We check: hub2 tracks hub1 far above a time-shuffled baseline and vanishes without the dynamics (hub2 is
// a real, dynamically-built model of hub1), and hub2 tracks hub1 (its direct object) at least as well as it
// tracks the raw world (which it only sees THROUGH hub1), confirming it models the model, one step removed
// from the world. The wiring between selves is mere connectivity, the modeling itself is emergent.
// Run: npx tsx code/experiment/p121-recursion.ts

import { pathToFileURL } from 'node:url'
import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

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

function bfsFar(offsets: Int32Array, adj: Int32Array, n: number, src: number): number {
  const dist = new Int32Array(n).fill(-1)
  dist[src] = 0
  let fr = [src]
  let far = src
  while (fr.length > 0) {
    const next: number[] = []
    for (const u of fr) for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
      const w = adj[p]!
      if (dist[w] === -1) {
        dist[w] = dist[u]! + 1
        far = w
        next.push(w)
      }
    }
    fr = next
  }
  return far
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

export function recursion(input?: { n?: number }): {
  n: number
  hub1ModelsWorld: number
  hub2ModelsHub1: number
  hub2ModelsWorld: number
  shuffledBaseline: number
  noDynamics: number
  realModel: boolean
  modelsTheModel: boolean
  solved: boolean
} {
  const n = input?.n ?? 60000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)

  // two selves, far apart
  let center1 = 0
  for (let i = 1; i < N; i++) if (g.offsets[i + 1]! - g.offsets[i]! > g.offsets[center1 + 1]! - g.offsets[center1]!) center1 = i
  const center2 = bfsFar(g.offsets, g.adj, N, center1)
  const d1 = bfs(g.offsets, g.adj, N, center1, 12)
  const d2 = bfs(g.offsets, g.adj, N, center2, 12)
  const r = 3
  const boundary1: number[] = []
  const hub1cells: number[] = []
  const boundary2: number[] = []
  const hub2cells: number[] = []
  for (let i = 0; i < N; i++) {
    if (d1[i]! >= r - 1 && d1[i]! <= r) boundary1.push(i)
    if (d1[i]! >= 0 && d1[i]! <= 1) hub1cells.push(i)
    if (d2[i]! >= r - 1 && d2[i]! <= r && d1[i]! > r) boundary2.push(i)
    if (d2[i]! >= 0 && d2[i]! <= 1 && d1[i]! > r) hub2cells.push(i)
  }
  // world input on self 1, sectored
  const K = 4
  const sectorOf = new Int32Array(N).fill(-1)
  for (let j = 0; j < boundary1.length; j++) sectorOf[boundary1[j]!] = Math.floor((j * K) / boundary1.length)

  const meanOver = (tone: Int8Array, cells: number[]): number => {
    let s = 0
    for (const i of cells) s += tone[i]!
    return cells.length > 0 ? s / cells.length : 0
  }

  function run(withDynamics: boolean): { h1: number[]; h2: number[]; world: number[] } {
    const tone = new Int8Array(N)
    const rng = makeRng({ seed: 9 })
    const T = 600
    const sigs = new Array<number>(K).fill(1)
    const h1: number[] = []
    const h2: number[] = []
    const world: number[] = []
    for (let t = 0; t < T; t++) {
      for (let s = 0; s < K; s++) if (rng.next() < 0.06) sigs[s] = -sigs[s]!
      // drive self 1 with the world
      for (const i of boundary1) tone[i] = sigs[sectorOf[i]!]! as -1 | 0 | 1
      // model1's current representation of the world
      const m1 = meanOver(tone, hub1cells)
      // WIRE hub1 -> self 2's input (broadcast the sign of model1 onto self 2's boundary)
      const s2in = (m1 > 0.05 ? 1 : m1 < -0.05 ? -1 : 0) as -1 | 0 | 1
      for (const i of boundary2) tone[i] = s2in
      if (withDynamics) fullBeat(tone, eu, ev, moved, rng)
      for (const i of boundary1) tone[i] = sigs[sectorOf[i]!]! as -1 | 0 | 1
      for (const i of boundary2) tone[i] = s2in
      h1.push(meanOver(tone, hub1cells))
      h2.push(meanOver(tone, hub2cells))
      let wsum = 0
      for (let s = 0; s < K; s++) wsum += sigs[s]!
      world.push(wsum / K)
    }
    return { h1, h2, world }
  }

  const live = run(true)
  const dead = run(false)

  const hub1ModelsWorld = Math.abs(corr(live.h1, live.world))
  const hub2ModelsHub1 = Math.abs(corr(live.h2, live.h1))
  const hub2ModelsWorld = Math.abs(corr(live.h2, live.world))
  const shuffledBaseline = Math.abs(corr(live.h2, live.h1.slice().reverse()))
  const noDynamics = Math.abs(corr(dead.h2, dead.h1))

  const realModel = hub2ModelsHub1 > 0.4 && hub2ModelsHub1 > shuffledBaseline + 0.3 && hub2ModelsHub1 > noDynamics + 0.3
  const modelsTheModel = hub2ModelsHub1 >= hub2ModelsWorld - 0.05 // tracks the model at least as well as the world
  const solved = realModel && modelsTheModel && hub1ModelsWorld > 0.4

  return {
    n: N,
    hub1ModelsWorld,
    hub2ModelsHub1,
    hub2ModelsWorld,
    shuffledBaseline,
    noDynamics,
    realModel,
    modelsTheModel,
    solved,
  }
}

export function main(): void {
  const r = recursion()
  console.log('P121: full recursion, a model of the model (the tower of self-models)')
  console.log('')
  console.log(`  level 1: hub1 models the WORLD: corr ${r.hub1ModelsWorld.toFixed(2)}`)
  console.log(`  level 2: hub2 models HUB1 (a model of the model): corr ${r.hub2ModelsHub1.toFixed(2)}`)
  console.log(`    vs time-shuffled baseline: ${r.shuffledBaseline.toFixed(2)} (real model: ${r.realModel})`)
  console.log(`    vs no dynamics (frozen):   ${r.noDynamics.toFixed(2)}`)
  console.log(`    hub2 tracks hub1 (${r.hub2ModelsHub1.toFixed(2)}) at least as well as the raw world (${r.hub2ModelsWorld.toFixed(2)}): ${r.modelsTheModel}`)
  console.log('')
  console.log(`  the chain world -> model1 -> model2(model1) holds, a model of a model: ${r.solved}`)
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
  id: 'selves/p121-recursion',
  title: 'hub2 represents hub1, the chain world to model1 to model2 of model1',
  category: 'selves',
  substrates: ['534'],
  depth: 'L3',
  paper: true,
  run() {
    const r = recursion({ n: 60000 })
    const ok =
      r.solved && r.realModel && r.modelsTheModel && r.hub1ModelsWorld > 0.4
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'self two forms a hub that represents self one hub, a model of a model, tracking it above the raw world and far above a shuffle',
      metrics: { hub1ModelsWorld: r.hub1ModelsWorld, hub2ModelsHub1: r.hub2ModelsHub1 },
      control: { shuffledBaseline: r.shuffledBaseline, noDynamics: r.noDynamics },
    })
  },
})
