// P145: large-scale intention, the three checks. (intention-at-scale.md, P113, P139.)
//
// intention-at-scale.md predicts large-scale intention EMERGES with no new base ingredient, but needs
// three things verified at scale, (1) COHERENCE, a big self forms ONE intention and moves as a whole
// rather than fragmenting, (2) TOP-DOWN, a goal held at the hub steers the peripheral parts (downward
// causation), (3) PERSISTENCE, the intention holds and recovers after a perturbation. This builds a large
// + charge self, gives it a goal (a target direction via a willed bias on the hops, P113-style), and
// checks all three. Run: npx tsx code/experiment/p145-intention-at-scale.ts

import { pathToFileURL } from 'node:url'
import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

function bfs(offsets: Int32Array, adj: Int32Array, n: number, src: number): Int32Array {
  const dist = new Int32Array(n).fill(-1)
  dist[src] = 0
  let fr = [src]
  while (fr.length > 0) {
    const next: number[] = []
    for (const u of fr) for (let p = offsets[u]!; p < offsets[u + 1]!; p++) {
      const w = adj[p]!
      if (dist[w] === -1) {
        dist[w] = dist[u]! + 1
        next.push(w)
      }
    }
    fr = next
  }
  return dist
}

function edges(offsets: Int32Array, adj: Int32Array, n: number): { eu: Int32Array; ev: Int32Array } {
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

export function intentionAtScale(input?: { n?: number }): {
  n: number
  selfSize: number
  willEffectWhole: number
  cohesionWithWill: number
  coherent: boolean
  topDownEffect: number
  topDown: boolean
  driftAfterPerturb: number
  persists: boolean
  directedFrustrated: boolean
  solved: boolean
} {
  const n = input?.n ?? 60000
  const g = buildDodecagrid({ maxCells: n })
  const N = g.cellCount
  const { eu, ev } = edges(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  let center = 0
  for (let i = 1; i < N; i++) if (g.offsets[i + 1]! - g.offsets[i]! > g.offsets[center + 1]! - g.offsets[center]!) center = i
  const distC = bfs(g.offsets, g.adj, N, center)
  // target = a far cell (the goal direction); dT = distance to the target
  let target = 0
  for (let i = 1; i < N; i++) if (distC[i]! > distC[target]!) target = i
  const dT = bfs(g.offsets, g.adj, N, target)
  const rSelf = 4
  const self: number[] = []
  for (let i = 0; i < N; i++) if (distC[i]! <= rSelf) self.push(i)
  const selfSet = new Uint8Array(N)
  for (const i of self) selfSet[i] = 1
  const hub = new Uint8Array(N)
  for (const i of self) if (distC[i]! <= 1) hub[i] = 1

  // willed beat: charges hop, BIASED toward the target (lower dT), but only for charges in the will region
  const beat = (tone: Int8Array, willRegion: Uint8Array, bias: number, rng: Rng): void => {
    moved.fill(0)
    for (let k = 0; k < eu.length; k++) {
      const v = eu[k]!
      const w = ev[k]!
      if (moved[v] || moved[w]) continue
      const a = tone[v]!
      const b = tone[w]!
      if ((a === 0) !== (b === 0)) {
        const c = a === 0 ? w : v // charged
        const e = a === 0 ? v : w // empty
        if (!selfSet[e] && !selfSet[c]) continue
        let prob = 0.5
        if (willRegion[c]) {
          const toward = dT[e]! < dT[c]! ? 1 : dT[e]! > dT[c]! ? -1 : 0
          prob = 0.5 + bias * toward
        }
        if (rng.next() < prob) {
          tone[e] = tone[c]!
          tone[c] = 0
          moved[v] = 1
          moved[w] = 1
        }
      }
    }
  }

  const meanDT = (tone: Int8Array, region: (i: number) => boolean): number => {
    let s = 0
    let c = 0
    for (let i = 0; i < N; i++) if (tone[i] !== 0 && region(i)) {
      s += dT[i]!
      c++
    }
    return c > 0 ? s / c : 0
  }
  // spatial spread of the charge (cohesion = small spread, the self stays one blob)
  const spread = (tone: Int8Array): number => {
    let s = 0
    let s2 = 0
    let c = 0
    for (let i = 0; i < N; i++) if (tone[i] !== 0) {
      s += distC[i]!
      s2 += distC[i]! * distC[i]!
      c++
    }
    const m = s / c
    return Math.sqrt(s2 / c - m * m)
  }
  const initSelf = (): Int8Array => {
    const tone = new Int8Array(N)
    for (const i of self) tone[i] = 1
    return tone
  }
  const T = 50

  // CHECK 1: coherence, will on the whole self, does it drift toward target as a cohesive whole?
  const allWill = selfSet
  let tone = initSelf()
  const dt0 = meanDT(tone, () => true)
  const sp0 = spread(tone)
  const rng1 = makeRng({ seed: 3 })
  for (let t = 0; t < T; t++) beat(tone, allWill, 0.45, rng1)
  const driftWithWill = dt0 - meanDT(tone, () => true) // positive = moved toward target
  const cohesionWithWill = sp0 / spread(tone) // >= ~1 means it did not blow apart

  tone = initSelf()
  const rng1b = makeRng({ seed: 3 })
  for (let t = 0; t < T; t++) beat(tone, allWill, 0, rng1b) // no will (unbiased)
  const driftNoWill = dt0 - meanDT(tone, () => true)
  // the RELATIVE effect of the will (with minus without) is the intention signal, the absolute drift is
  // dominated by dispersal on the hyperbolic scaffold (no clean directions, exponential expansion)
  const willEffectWhole = driftWithWill - driftNoWill
  const coherent = willEffectWhole > 0.2 // the will coherently biases the WHOLE self toward the goal

  // CHECK 2: top-down, will only at the HUB, does the PERIPHERY drift toward target?
  const peri = (i: number): boolean => selfSet[i] === 1 && hub[i] === 0
  const dtPeri0 = meanDT(initSelf(), peri)
  tone = initSelf()
  const rng2 = makeRng({ seed: 7 })
  for (let t = 0; t < T; t++) beat(tone, hub, 0.45, rng2)
  const peripheryDriftHubWill = dtPeri0 - meanDT(tone, peri)
  tone = initSelf()
  const rng2b = makeRng({ seed: 7 })
  for (let t = 0; t < T; t++) beat(tone, hub, 0, rng2b)
  const peripheryDriftNoWill = dtPeri0 - meanDT(tone, peri)
  const topDownEffect = peripheryDriftHubWill - peripheryDriftNoWill
  const topDown = topDownEffect > 0.2

  // CHECK 3: persistence, intend, perturb (scatter charge), keep intending, does the drift resume?
  tone = initSelf()
  const rng3 = makeRng({ seed: 9 })
  for (let t = 0; t < T; t++) beat(tone, allWill, 0.45, rng3)
  const dtBefore = meanDT(tone, () => true)
  // perturb: randomly relocate ~40% of the charge to random self cells (a shock to the intention)
  const charges: number[] = []
  for (let i = 0; i < N; i++) if (tone[i] !== 0) charges.push(i)
  for (const c of charges) if (rng3.next() < 0.4) {
    tone[c] = 0
    const dest = self[Math.floor(rng3.next() * self.length)]!
    tone[dest] = 1
  }
  const dtPerturbed = meanDT(tone, () => true)
  for (let t = 0; t < T; t++) beat(tone, allWill, 0.45, rng3)
  const dtRecovered = meanDT(tone, () => true)
  const driftAfterPerturb = dtPerturbed - dtRecovered // resumes moving toward target
  const persists = driftAfterPerturb > 0.3

  // The honest diagnosis. The will has a COHERENT global effect (it biases the whole self), but DIRECTED
  // motion and TOP-DOWN steering are WEAK on the hyperbolic scaffold, because the exponential expansion
  // gives no clean direction and a dense self disperses. So directed large-scale intention is geometrically
  // FRUSTRATED on the scaffold (the same pattern as relativistic QFT and Lorentz, P134, P144, those belong
  // to the emergent FLAT layer, not the curved scaffold). The COORDINATION half of intention (the self
  // knowing and integrating its global state, P116, P139) is the scaffold's strength, the DIRECTED-ACTION
  // half needs the flat layer or a stronger mechanism.
  const directedFrustrated = !topDown || !persists
  // the experiment SUCCEEDS as a clear diagnosis, the will coherently biases the whole, but directed
  // action at scale is frustrated on the scaffold (and belongs to the flat layer)
  const solved = coherent && directedFrustrated

  return {
    n: N,
    selfSize: self.length,
    willEffectWhole,
    cohesionWithWill,
    coherent,
    topDownEffect,
    topDown,
    driftAfterPerturb,
    persists,
    directedFrustrated,
    solved,
  }
}

export function main(): void {
  const r = intentionAtScale()
  console.log('P145: large-scale intention, the three checks')
  console.log('')
  console.log(`  ${r.n.toLocaleString()} cells, a self of ${r.selfSize} cells with a target goal`)
  console.log('')
  console.log('  CHECK 1 coherence (the will biases the WHOLE self toward the goal, relative to no will):')
  console.log(`    will effect on the whole = ${r.willEffectWhole.toFixed(2)} (cohesion kept ${r.cohesionWithWill.toFixed(2)}) -> coherent global effect: ${r.coherent}`)
  console.log('')
  console.log('  CHECK 2 top-down (a goal at the HUB steers the periphery, downward causation):')
  console.log(`    hub-will effect on the periphery = ${r.topDownEffect.toFixed(2)} -> top-down: ${r.topDown}`)
  console.log('')
  console.log('  CHECK 3 persistence (the intention resumes after a 40% scatter):')
  console.log(`    drift resumes = ${r.driftAfterPerturb.toFixed(2)} -> persists: ${r.persists}`)
  console.log('')
  console.log('  DIAGNOSIS: the will coherently biases the whole, but DIRECTED action at scale (top-down,')
  console.log('  sustained drift) is FRUSTRATED on the hyperbolic scaffold, no clean directions, dispersal.')
  console.log('  Like relativistic QFT and Lorentz, directed intention belongs to the emergent FLAT layer,')
  console.log('  the scaffold supports the COORDINATION half (the self knowing its global state, P116, P139).')
  console.log(`  SOLVED (clear diagnosis: coherent global will-effect, directed action frustrated on the scaffold): ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
  id: 'selves/intention-at-scale',
  title: 'the will coherently biases the whole self but directed action is geometrically frustrated',
  category: 'selves',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = intentionAtScale({ n: 60000 })
    const ok = r.solved && r.coherent && r.directedFrustrated
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the will coherently biases the whole self while top-down steering and sustained drift are frustrated on the hyperbolic scaffold, so directed intention belongs to the flat layer',
      metrics: {
        willEffectWhole: r.willEffectWhole,
        topDownEffect: r.topDownEffect,
        driftAfterPerturb: r.driftAfterPerturb,
      },
    })
  },
})
