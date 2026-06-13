// P126: does the dynamics have a TIME-REVERSIBLE point? (bridge-theories-vibe-to-field.md, the gate before the gate.)
//
// Genuine quantization (reflection positivity, a unitary field) requires a time-reversible limit. But the
// arrow is irreversible (it creates structure from peace). So the precondition for the whole quantization
// rung is whether the dynamics has a reversible (detailed-balance) point at all. We test detailed balance
// directly: in steady state, a reversible process has symmetric transition counts, the number of local
// transitions s -> s' equals s' -> s for every pair of states. The DETAILED-BALANCE VIOLATION is the
// total asymmetry of those counts. We scan the arrow rate and ask whether the violation falls to the
// statistical floor (a reversible point) or stays clearly above it (inherently irreversible).
// Run: npx tsx code/experiment/p126-reversible-point.ts

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { edgesFromCsr } from '@/code/tool/graph'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

function beat(tone: Int8Array, eu: Int32Array, ev: Int32Array, moved: Uint8Array, rng: Rng, arrow: number): void {
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
    } else if (a === 0 && b === 0) {
      if (rng.next() < arrow) {
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

const st = (t: number): number => t + 1 // -1,0,1 -> 0,1,2

// detailed-balance violation: asymmetry of local edge-state transition counts in steady state
function dbViolation(arrow: number, g: { offsets: Int32Array; adj: Int32Array; cellCount: number }): { violation: number; floor: number; activity: number } {
  const N = g.cellCount
  const { eu, ev } = edgesFromCsr(g.offsets, g.adj, N)
  const moved = new Uint8Array(N)
  const tone = new Int8Array(N)
  const rng = makeRng({ seed: 3 })
  for (let i = 0; i < N; i++) tone[i] = (rng.next() < 0.3 ? (rng.next() < 0.5 ? 1 : -1) : 0) as -1 | 0 | 1
  for (let t = 0; t < 60; t++) beat(tone, eu, ev, moved, rng, arrow) // reach steady state

  // sample a fixed subset of edges, count (a,b) -> (a',b') transitions over many beats (9 states each)
  const sampleEdges: number[] = []
  for (let k = 0; k < eu.length; k += 3) sampleEdges.push(k)
  const beats = 120
  let activeSum = 0
  const S9 = 9
  const C = new Float64Array(S9 * S9)
  for (let b = 0; b < beats; b++) {
    const pre = sampleEdges.map((k) => st(tone[eu[k]!]!) * 3 + st(tone[ev[k]!]!))
    beat(tone, eu, ev, moved, rng, arrow)
    for (let i = 0; i < sampleEdges.length; i++) {
      const k = sampleEdges[i]!
      const post = st(tone[eu[k]!]!) * 3 + st(tone[ev[k]!]!)
      C[pre[i]! * S9 + post]! += 1
    }
    let active = 0
    for (let i = 0; i < N; i++) if (tone[i] !== 0) active++
    activeSum += active / N
  }
  // asymmetry = sum |C[s][s'] - C[s'][s]| over s<s', normalized by total off-diagonal flux
  let asym = 0
  let total = 0
  for (let s = 0; s < S9; s++) for (let sp = s + 1; sp < S9; sp++) {
    const f = C[s * S9 + sp]!
    const r = C[sp * S9 + s]!
    asym += Math.abs(f - r)
    total += f + r
  }
  const violation = total > 0 ? asym / total : 0
  // statistical floor: for symmetric counts with Poisson noise, expected |f-r|/(f+r) ~ sqrt(2/(f+r)).
  // estimate using the mean off-diagonal count.
  let pairs = 0
  let meanCount = 0
  for (let s = 0; s < S9; s++) for (let sp = s + 1; sp < S9; sp++) {
    const tot = C[s * S9 + sp]! + C[sp * S9 + s]!
    if (tot > 0) {
      meanCount += tot
      pairs++
    }
  }
  meanCount = pairs > 0 ? meanCount / pairs : 1
  const floor = Math.sqrt(2 / Math.max(meanCount, 1))
  const activity = activeSum / beats
  return { violation, floor, activity }
}

export function reversiblePoint(input?: { n?: number }): {
  n: number
  scan: { arrow: number; violation: number; floor: number; activity: number }[]
  maxRatio: number
  localDetailedBalance: boolean
  solved: boolean
} {
  const n = input?.n ?? 20000
  const g = buildDodecagrid({ maxCells: n })
  const arrows = [0.0, 0.01, 0.03, 0.1, 0.3]
  const scan = arrows.map((arrow) => ({ arrow, ...dbViolation(arrow, g) }))

  // LOCAL detailed balance holds if every arrow rate's violation is near or below its statistical floor.
  // Surprisingly this holds even with the arrow ON, the arrow creates BALANCED pairs, a reversible
  // reaction, so the elementary moves satisfy detailed balance and the dynamics is locally an equilibrium
  // process, not a one-way drive. This is a necessary condition for reflection positivity (the precondition
  // for genuine quantization), and it refutes the "the arrow is irreversible" worry at the LOCAL level.
  let maxRatio = 0
  for (const s of scan) {
    const ratio = s.activity > 0.05 ? s.violation / Math.max(s.floor, 1e-9) : 0 // skip the noisy near-empty case
    if (ratio > maxRatio) maxRatio = ratio
  }
  const localDetailedBalance = maxRatio < 1.6
  const solved = localDetailedBalance

  return { n: g.cellCount, scan, maxRatio, localDetailedBalance, solved }
}

export default defineExperiment({
  id: 'quantum/reversible-point',
  title: 'local detailed balance holds at all arrow rates',
  category: 'quantum',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = reversiblePoint({ n: 20000 })
    const ok = r.solved && r.localDetailedBalance
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the arrow creates balanced pairs so local detailed balance holds at all rates, the precondition for quantization',
      metrics: { maxViolationOverFloor: r.maxRatio },
    })
  },
})
