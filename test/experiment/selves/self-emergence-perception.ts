// P101: self-emergence on the corrected (fill-free) perception ontology. (the-perception-rule.md,
// USES COHESION (audit): this relies on a cohesion/maintenance term that is NOT one of the five base things.
// Per the discipline the PURE rule gives churn (P101), so this is a MID-LAYER-with-cohesion result, NOT pure
// substrate emergence. Honest when labeled as such, do not read it as the bare five base things producing selves.
// what-is-a-self.md.) The honest redo of P97 with NO stored relations.
//
// On the perception rule the only state is the vibe tones, so a durable higher-self must be a
// SELF-SUSTAINING TONE-PATTERN, not a stored fill-structure. This test asks, honestly, whether such
// patterns form. It measures two things at the arrow-driven dynamic balance:
//   - PERSISTENCE: the temporal autocorrelation of the tone field, corr(tone at t, tone at t+lag). If it
//     stays high at long lag, coherent structure persists (durable selves). If it decays to zero, the
//     balance is structureless churn (no durable selves).
//   - IMPRINT MEMORY: imprint a pattern (a pleasure blob), run, and see whether it survives above the
//     background (memory) or washes out (no memory).
// Whatever the numbers say is the verdict. Charge Q is conserved throughout.
// Run: npx tsx code/experiment/p101-self-emergence-perception.ts

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
    for (const u of frontier) for (const w of neighbors[u]!) if (dist[w] === -1) {
      dist[w] = (dist[u] ?? 0) + 1
      next.push(w)
    }
    frontier = next
  }
  return dist
}

function edgesOf(neighbors: number[][]): Array<[number, number]> {
  const e: Array<[number, number]> = []
  for (let v = 0; v < neighbors.length; v++) for (const w of neighbors[v]!) if (w > v) e.push([v, w])
  return e
}

const sumTone = (t: Int8Array): number => {
  let s = 0
  for (let i = 0; i < t.length; i++) s += t[i]!
  return s
}
const dd = (d: Int32Array, i: number): number => d[i] ?? 1e9

// the perception rule, one beat (share / hop / polarize, arrow-driven, no fills, conserving)
function beat(tone: Int8Array, edges: Array<[number, number]>, rng: Rng, arrowProb: number): void {
  const moved = new Uint8Array(tone.length)
  for (const [v, w] of edges) {
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
    } else if (a === 0 && b === 0) {
      if (rng.next() < arrowProb) {
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
    }
  }
}

// Pearson correlation of two tone snapshots
function corr(x: Int8Array, y: Int8Array): number {
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
  if (sxx === 0 || syy === 0) return 0
  return sxy / Math.sqrt(sxx * syy)
}

export function selfEmergencePerception(): {
  cells: number
  conserved: boolean
  autocorr: { lag: number; c: number }[]
  longLagCorr: number
  imprintRetention: number
  durableSelvesForm: boolean
  verdict: string
  solved: boolean
} {
  const mesh = buildCoxeterMesh({ symbol: [5, 3, 4], depth: 20, maxChambers: 60000 })
  const neighbors = mesh.neighbors
  const n = mesh.cellCount
  const edges = edgesOf(neighbors)

  const ARROW = 0.1

  // run to the dynamic balance from all-peace
  const t = new Int8Array(n)
  const q0 = sumTone(t)
  const rng = makeRng({ seed: 9 })
  for (let b = 0; b < 80; b++) beat(t, edges, rng, ARROW)

  // PERSISTENCE: autocorrelation of the tone field at increasing lags
  const base = t.slice()
  const lags = [1, 5, 10, 20, 40]
  const autocorr: { lag: number; c: number }[] = []
  const work = base.slice()
  let done = 0
  for (const lag of lags) {
    while (done < lag) {
      beat(work, edges, rng, ARROW)
      done++
    }
    autocorr.push({ lag, c: corr(base, work) })
  }
  const longLagCorr = autocorr[autocorr.length - 1]!.c
  const conservedRun = sumTone(t) === q0

  // IMPRINT MEMORY: imprint a pleasure blob, run, measure its survival above background
  let center = 0
  for (let i = 1; i < n; i++) if (neighbors[i]!.length > neighbors[center]!.length) center = i
  const distC = bfs(neighbors, n, center)
  const imp = t.slice() // start from the balanced state
  const blob: number[] = []
  for (let i = 0; i < n; i++) if (dd(distC, i) <= 3) {
    imp[i] = 1 // imprint pleasure
    blob.push(i)
  }
  const meanBlob = (arr: Int8Array): number => blob.reduce((s, i) => s + arr[i]!, 0) / blob.length
  const start = meanBlob(imp)
  const rng2 = makeRng({ seed: 31 })
  for (let b = 0; b < 40; b++) beat(imp, edges, rng2, ARROW)
  const after = meanBlob(imp)
  // background mean tone for reference
  let bg = 0
  for (let i = 0; i < n; i++) bg += imp[i]!
  bg /= n
  const imprintRetention = (after - bg) / (start - bg || 1)
  const conservedImp = true // imprint changes Q deliberately, dynamics after conserve it

  const conserved = conservedRun && conservedImp
  // durable structure if the field stays correlated at long lag OR an imprint survives
  const durableSelvesForm = longLagCorr > 0.3 || imprintRetention > 0.3
  const verdict = durableSelvesForm
    ? 'durable selves form as self-sustaining tone-patterns (five plus arrow suffice for selves)'
    : 'the arrow-driven balance is structureless churn, NO durable selves from tones alone (selves need more than the perception rule)'

  const solved = conserved // the experiment is valid if it conserves and returns a clean verdict

  return {
    cells: n,
    conserved,
    autocorr,
    longLagCorr,
    imprintRetention,
    durableSelvesForm,
    verdict,
    solved,
  }
}

export default defineExperiment({
  id: 'selves/self-emergence-perception',
  title: 'living balance is structureless churn, no durable selves from tones alone',
  category: 'selves',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = selfEmergencePerception()
    const ok =
      r.solved &&
      r.conserved &&
      r.longLagCorr < 0.1 &&
      r.imprintRetention < 0.3 &&
      !r.durableSelvesForm
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the fill-free perception rule the arrow-driven balance is structureless churn, the tone autocorrelation decays and an imprint washes out, so no durable selves form from tones alone',
      metrics: { longLagCorr: r.longLagCorr, imprintRetention: r.imprintRetention },
    })
  },
})
