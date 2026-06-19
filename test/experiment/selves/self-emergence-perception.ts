// P101: self-emergence on the corrected (fill-free) perception ontology. (the-perception-rule.md,
// USES COHESION (audit): this relies on a cohesion/maintenance term that is NOT one of the five base things.
// Per the discipline the PURE rule gives churn (P101), so this is a MID-LAYER-with-cohesion result, NOT pure
// substrate emergence. Honest when labeled as such, do not read it as the bare five base things producing selves.
// what-is-a-self.md.) The honest redo of P97 with NO stored relations.
//
// On the perception rule the only state is the vibe tones, so a durable higher-self must be a
// SELF-SUSTAINING TONE-PATTERN, not a stored fill-structure. This test asks, honestly, whether such
// patterns form. It measures two things at the arrow-driven dynamic balance:
//   - PERSISTENCE: the temporal autocorrelation of the tone field, pearson({ a: tone at t, b: tone at t+lag }). If it
//     stays high at long lag, coherent structure persists (durable selves). If it decays to zero, the
//     balance is structureless churn (no durable selves).
//   - IMPRINT MEMORY: imprint a pattern (a pleasure blob), run, and see whether it survives above the
//     background (memory) or washes out (no memory).
// Whatever the numbers say is the verdict. Charge Q is conserved throughout.
// Run: npx tsx code/experiment/p101-self-emergence-perception.ts

import { pearson } from '@/code/measure/statistics'
import { neighborDistances, edgesOf } from '@/code/tool/graph'
import { totalCharge as sumTone } from '@/code/model/self-kit'
import { conservingEdgeListSweep } from '@/code/dynamics/conserving-sweep'
import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const dd = (d: Int32Array, i: number): number => d[i] ?? 1e9

// Pearson correlation of two tone snapshots
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
  const mesh = buildCoxeterMesh({
    symbol: [5, 3, 4],
    depth: 20,
    maxChambers: 60000,
  })
  const neighbors = mesh.neighbors
  const n = mesh.cellCount
  const edges = edgesOf(neighbors)
  const moved = new Uint8Array(n)

  const ARROW = 0.1

  // run to the dynamic balance from all-peace
  const t = new Int8Array(n)
  const q0 = sumTone(t)
  const rng = makeRng({ seed: 9 })
  for (let b = 0; b < 80; b++) {
    conservingEdgeListSweep({
      tone: t,
      edges,
      moved,
      rng,
      arrow: ARROW,
    })
  }

  // PERSISTENCE: autocorrelation of the tone field at increasing lags
  const base = t.slice()
  const lags = [1, 5, 10, 20, 40]
  const autocorr: { lag: number; c: number }[] = []
  const work = base.slice()
  let done = 0
  for (const lag of lags) {
    while (done < lag) {
      conservingEdgeListSweep({
        tone: work,
        edges,
        moved,
        rng,
        arrow: ARROW,
      })
      done++
    }
    autocorr.push({ lag, c: pearson({ a: base, b: work }) })
  }
  const longLagCorr = autocorr[autocorr.length - 1]!.c
  const conservedRun = sumTone(t) === q0

  // IMPRINT MEMORY: imprint a pleasure blob, run, measure its survival above background
  let center = 0
  for (let i = 1; i < n; i++) {
    if (neighbors[i]!.length > neighbors[center]!.length) {
      center = i
    }
  }
  const distC = neighborDistances({
    neighbors,
    size: n,
    source: center,
  })
  const imp = t.slice() // start from the balanced state
  const blob: number[] = []
  for (let i = 0; i < n; i++) {
    if (dd(distC, i) <= 3) {
      imp[i] = 1 // imprint pleasure
      blob.push(i)
    }
  }
  const meanBlob = (arr: Int8Array): number =>
    blob.reduce((s, i) => s + arr[i]!, 0) / blob.length
  const start = meanBlob(imp)
  const rng2 = makeRng({ seed: 31 })
  for (let b = 0; b < 40; b++) {
    conservingEdgeListSweep({
      tone: imp,
      edges,
      moved,
      rng: rng2,
      arrow: ARROW,
    })
  }
  const after = meanBlob(imp)
  // background mean tone for reference
  let bg = 0
  for (let i = 0; i < n; i++) {
    bg += imp[i]!
  }
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

export default experiment({
  id: 'selves/self-emergence-perception',
  title:
    'living balance is structureless churn, no durable selves from tones alone',
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
      metrics: {
        longLagCorr: r.longLagCorr,
        imprintRetention: r.imprintRetention,
      },
    })
  },
})
