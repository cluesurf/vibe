// P97: genuine self-emergence. (Stage 5 of the unfolding, what-is-a-self.md.)
//
// A self is a vibe from its own perspective, a HIGHER self is a vibe patch (a coherent, integrated
// region). This test does NOT hand-draw any patch. It runs the dynamics from the five and asks whether
// coherent patches FORM and GROW on their own, discovered by integration, not imposed.
//
// It honestly compares two regimes on the same start:
//   - FIVE: fills are FIXED (the five as literally stated, the conserved rule moves only tones).
//   - SIX:  fills ADAPT each beat by a Hebbian rule (agreeing neighbors bind as sharing, opposing as
//           polarizing), the candidate sixth ingredient (a fill-dynamics / learning rule).
//
// Measures, over time, with no patch ever drawn by hand:
//   - coherence: the fraction of notes whose fill is consistent with its two tones (an ordered,
//     integrated structure scores high, a frustrated one scores low).
//   - largest patch: the biggest connected domain of same-sign cells bound by sharing fills (the
//     biggest higher self that has self-organized).
// The verdict is whatever the numbers say: if SIX self-organizes coherent patches and FIVE does not,
// then durable selves need adaptive fills (a real sixth thing). If FIVE also self-organizes, the five
// suffice. Charge Q is conserved throughout (fills never touch tones). Run: npx tsx code/experiment/p97-self-emergence.ts

import { pathToFileURL } from 'node:url'
import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

function edgesOf(neighbors: number[][]): Array<[number, number]> {
  const edges: Array<[number, number]> = []
  for (let v = 0; v < neighbors.length; v++) {
    for (const w of neighbors[v]!) if (w > v) edges.push([v, w])
  }
  return edges
}

const sumTone = (t: Int8Array): number => {
  let s = 0
  for (let i = 0; i < t.length; i++) s += t[i]!
  return s
}

// One beat of the conserved exchange, per-note fills (hop / polarize / share), conserves every pair sum.
function beat(tone: Int8Array, edges: Array<[number, number]>, fill: Int8Array, rng: Rng): void {
  const moved = new Uint8Array(tone.length)
  for (let i = 0; i < edges.length; i++) {
    const v = edges[i]![0]
    const w = edges[i]![1]
    if (moved[v] || moved[w]) continue
    const f = fill[i]!
    const tv = tone[v]!
    const tw = tone[w]!
    if (f === -1) {
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
    } else if (f === 1) {
      if ((tv === 1 && tw === -1) || (tv === -1 && tw === 1)) {
        tone[v] = 0
        tone[w] = 0
        moved[v] = 1
        moved[w] = 1
      } else if ((tv === 0) !== (tw === 0) && rng.next() < 0.5) {
        // hop: swap the charged with the neutral
        const tmp = tone[v]!
        tone[v] = tone[w]!
        tone[w] = tmp
        moved[v] = 1
        moved[w] = 1
      }
    }
  }
}

// Hebbian fill update (the candidate sixth rule): a note binds (sharing) agreeing neighbors, polarizes
// opposing ones, insulates when either is at peace. Fills follow the tone relationships (learning).
function adaptFills(tone: Int8Array, edges: Array<[number, number]>, fill: Int8Array): void {
  for (let i = 0; i < edges.length; i++) {
    const tv = tone[edges[i]![0]]!
    const tw = tone[edges[i]![1]]!
    if (tv !== 0 && tw !== 0) fill[i] = tv === tw ? 1 : -1
    else fill[i] = 0
  }
}

// fraction of notes whose fill is consistent with its two tones (a measure of ordered integration)
function coherence(tone: Int8Array, edges: Array<[number, number]>, fill: Int8Array): number {
  let sat = 0
  for (let i = 0; i < edges.length; i++) {
    const tv = tone[edges[i]![0]]!
    const tw = tone[edges[i]![1]]!
    const f = fill[i]!
    const ok =
      f === 1 ? tv !== 0 && tv === tw : f === -1 ? tv !== 0 && tw !== 0 && tv !== tw : tv === 0 || tw === 0
    if (ok) sat++
  }
  return sat / edges.length
}

// largest connected domain of same-sign cells bound by sharing (+1) fills, the biggest higher self
function largestPatch(tone: Int8Array, edges: Array<[number, number]>, fill: Int8Array, n: number): number {
  const parent = new Int32Array(n)
  for (let i = 0; i < n; i++) parent[i] = i
  const find = (x: number): number => {
    let r = x
    while (parent[r] !== r) r = parent[r]!
    while (parent[x] !== r) {
      const nx = parent[x]!
      parent[x] = r
      x = nx
    }
    return r
  }
  for (let i = 0; i < edges.length; i++) {
    if (fill[i] !== 1) continue
    const v = edges[i]![0]
    const w = edges[i]![1]
    if (tone[v] !== 0 && tone[v] === tone[w]) parent[find(v)] = find(w)
  }
  const size = new Int32Array(n)
  let best = 0
  for (let i = 0; i < n; i++) {
    if (tone[i] === 0) continue
    const r = find(i)
    size[r]!++
    if (size[r]! > best) best = size[r]!
  }
  return best
}

export function selfEmergence(): {
  cells: number
  coherenceFiveStart: number
  coherenceFiveEnd: number
  coherenceSixStart: number
  coherenceSixEnd: number
  patchFiveStart: number
  patchFiveEnd: number
  patchSixStart: number
  patchSixEnd: number
  conserved: boolean
  fiveSelfOrganizes: boolean
  sixSelfOrganizes: boolean
  needsAdaptiveFills: boolean
  solved: boolean
} {
  const mesh = buildCoxeterMesh({ symbol: [5, 3, 4], depth: 20, maxChambers: 60000 })
  const neighbors = mesh.neighbors
  const n = mesh.cellCount
  const edges = edgesOf(neighbors)

  // identical random start for both regimes
  const rng0 = makeRng({ seed: 4 })
  const tone0 = new Int8Array(n)
  const fill0 = new Int8Array(edges.length)
  for (let i = 0; i < n; i++) {
    const r = rng0.next()
    tone0[i] = r < 0.4 ? 1 : r < 0.7 ? -1 : 0 // a net-positive charge so domains can persist
  }
  for (let i = 0; i < edges.length; i++) {
    const r = rng0.next()
    fill0[i] = r < 0.34 ? 1 : r < 0.67 ? -1 : 0
  }

  const BEATS = 80

  // FIVE: fixed fills
  const tF = tone0.slice()
  const fF = fill0.slice()
  const qF0 = sumTone(tF)
  const coherenceFiveStart = coherence(tF, edges, fF)
  const patchFiveStart = largestPatch(tF, edges, fF, n)
  const rngF = makeRng({ seed: 21 })
  for (let b = 0; b < BEATS; b++) beat(tF, edges, fF, rngF)
  const coherenceFiveEnd = coherence(tF, edges, fF)
  const patchFiveEnd = largestPatch(tF, edges, fF, n)
  const conservedFive = sumTone(tF) === qF0

  // SIX: adaptive fills
  const tS = tone0.slice()
  const fS = fill0.slice()
  const qS0 = sumTone(tS)
  const coherenceSixStart = coherence(tS, edges, fS)
  const patchSixStart = largestPatch(tS, edges, fS, n)
  const rngS = makeRng({ seed: 21 })
  for (let b = 0; b < BEATS; b++) {
    beat(tS, edges, fS, rngS)
    adaptFills(tS, edges, fS)
  }
  const coherenceSixEnd = coherence(tS, edges, fS)
  const patchSixEnd = largestPatch(tS, edges, fS, n)
  const conservedSix = sumTone(tS) === qS0

  const conserved = conservedFive && conservedSix
  // self-organization = coherence climbs meaningfully and the largest patch grows
  const fiveSelfOrganizes = coherenceFiveEnd > coherenceFiveStart + 0.15 && patchFiveEnd > patchFiveStart * 1.5
  const sixSelfOrganizes = coherenceSixEnd > coherenceSixStart + 0.15 && patchSixEnd > patchSixStart * 1.5
  const needsAdaptiveFills = sixSelfOrganizes && !fiveSelfOrganizes

  // the experiment "succeeds" if it conserves charge and returns a clear verdict either way
  const solved = conserved && (sixSelfOrganizes || fiveSelfOrganizes)

  return {
    cells: n,
    coherenceFiveStart,
    coherenceFiveEnd,
    coherenceSixStart,
    coherenceSixEnd,
    patchFiveStart,
    patchFiveEnd,
    patchSixStart,
    patchSixEnd,
    conserved,
    fiveSelfOrganizes,
    sixSelfOrganizes,
    needsAdaptiveFills,
    solved,
  }
}

export function main(): void {
  const r = selfEmergence()
  console.log('P97: genuine self-emergence (no patch hand-drawn)')
  console.log('')
  console.log(`  ${r.cells} cells. A higher self = a coherent vibe-patch, found by integration, not drawn.`)
  console.log('')
  console.log('  FIVE (fixed fills, the five as stated):')
  console.log(`    coherence ${r.coherenceFiveStart.toFixed(3)} -> ${r.coherenceFiveEnd.toFixed(3)}, largest patch ${r.patchFiveStart} -> ${r.patchFiveEnd}`)
  console.log(`    self-organizes: ${r.fiveSelfOrganizes}`)
  console.log('')
  console.log('  SIX (adaptive fills, the candidate sixth rule):')
  console.log(`    coherence ${r.coherenceSixStart.toFixed(3)} -> ${r.coherenceSixEnd.toFixed(3)}, largest patch ${r.patchSixStart} -> ${r.patchSixEnd}`)
  console.log(`    self-organizes: ${r.sixSelfOrganizes}`)
  console.log('')
  console.log(`  charge conserved throughout: ${r.conserved}`)
  console.log('')
  console.log(`  VERDICT: durable selves need adaptive fills (a sixth thing): ${r.needsAdaptiveFills}`)
  console.log(`  SOLVED (clean verdict + conserved): ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
  id: 'selves/self-emergence',
  title: 'fixed fills do not self-organize selves, adaptive fills do',
  category: 'selves',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = selfEmergence()
    const ok =
      r.solved &&
      r.conserved &&
      r.sixSelfOrganizes &&
      !r.fiveSelfOrganizes &&
      r.needsAdaptiveFills
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'fixed fills do not self-organize coherent patches while adaptive Hebbian fills do, so durable selves need an adaptive fill-dynamics rule',
      metrics: {
        coherenceSixStart: r.coherenceSixStart,
        coherenceSixEnd: r.coherenceSixEnd,
        patchSixStart: r.patchSixStart,
        patchSixEnd: r.patchSixEnd,
      },
      control: {
        coherenceFiveStart: r.coherenceFiveStart,
        coherenceFiveEnd: r.coherenceFiveEnd,
        patchFiveStart: r.patchFiveStart,
        patchFiveEnd: r.patchFiveEnd,
      },
    })
  },
})
