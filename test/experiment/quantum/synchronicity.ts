// P67: synchronicity (correlated transitions from shared ancestry, no link).
// Synchronicity is a meaningful coincidence between things with no causal link between them now.
// The model's honest account: two subsystems that share a deep ancestry (a common root in the
// tree-like mesh, P49) inherited a correlated structure, so under the same ambient rhythm they
// undergo correlated transitions, with no signal passing between them. This is the shared-substrate
// mechanism that gives the Bell correlations without signaling (P7): the correlation was established
// in the shared past, not transmitted now.
//
// The earlier version made subsystem B an EXACT COPY of A and clamped both to the same vectors, so
// the "100% correlation" was forced and tautological. This version is genuine: A and B share a
// common ANCESTOR (root memory patterns) but have DIVERGED, each = root with its own independent
// mutations. They are genuinely different systems with no link. We show their synchronized-transition
// correlation TRACKS the shared ancestry: it falls from near 1 (little divergence) toward the
// unrelated baseline as the two diverge from their common root, and equals the inherited pattern
// overlap at every point. So the correlation is inherited, not transmitted.
// Run: npx tsx code/experiment/p67-synchronicity.ts

import { pathToFileURL } from 'node:url'
import { makeRng, Rng } from '@/code/tool/rng'
import { storedPatterns, hebbianFills, step, overlap } from '@/test/experiment/selves/dreaming-and-waking'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Diverge a pattern from the common ancestor: flip each bit independently with probability d.
function mutate(p: Int8Array, d: number, rng: Rng): Int8Array {
  const q = Int8Array.from(p)
  for (let i = 0; i < q.length; i++) if (rng.next() < d) q[i] = (rng.next() < 0.5 ? -1 : 1) as -1 | 1
  return q
}
// Mean inherited overlap between the two memory landscapes (the measurable shared ancestry).
function patternOverlap(pA: Int8Array[], pB: Int8Array[]): number {
  let s = 0
  for (let m = 0; m < pA.length; m++) s += Math.abs(overlap(pA[m] ?? new Int8Array(0), pB[m] ?? new Int8Array(0)))
  return s / Math.max(1, pA.length)
}

// Two separate subsystems (no edges between them), each its own Hopfield landscape, both driven by
// the SAME ambient rhythm (mode sequence). Each is cued toward ITS OWN pattern m, then relaxes.
// Returns the mean state overlap at the end of each window.
function runPair(input: { size: number; pA: Int8Array[]; pB: Int8Array[]; modeSeq: number[]; seed: number }): number {
  const { size, pA, pB, modeSeq } = input
  const Ja = hebbianFills(pA, size)
  const Jb = hebbianFills(pB, size)
  const ra = makeRng({ seed: input.seed })
  const rb = makeRng({ seed: input.seed + 1 })
  let a = Int8Array.from({ length: size }, () => (ra.nextInt({ max: 3 }) - 1) as -1 | 0 | 1)
  let b = Int8Array.from({ length: size }, () => (rb.nextInt({ max: 3 }) - 1) as -1 | 0 | 1)
  const zero = new Float64Array(size)
  const cueCount = Math.round(0.55 * size)
  const cueHold = 4
  const dwell = 30
  const overlaps: number[] = []
  for (let t = 0; t < modeSeq.length * dwell; t++) {
    const phase = t % dwell
    const m = modeSeq[Math.floor(t / dwell)] ?? 0
    let cueA: Int8Array | null = null
    let cueB: Int8Array | null = null
    if (phase < cueHold) {
      cueA = new Int8Array(size)
      cueB = new Int8Array(size)
      const qa = pA[m] ?? new Int8Array(size)
      const qb = pB[m] ?? new Int8Array(size)
      for (let i = 0; i < cueCount; i++) {
        cueA[i] = qa[i] as -1 | 0 | 1
        cueB[i] = qb[i] as -1 | 0 | 1
      }
    }
    a = step(Ja, a, zero, cueA)
    b = step(Jb, b, zero, cueB)
    if (phase === dwell - 1) overlaps.push(Math.abs(overlap(a, b)))
  }
  return overlaps.reduce((x, y) => x + y, 0) / Math.max(1, overlaps.length)
}

export function synchronicity(input: { seed: number }): {
  sharedCorrelation: number
  unrelatedCorrelation: number
  divergenceSweep: { d: number; correlation: number; ancestry: number }[]
  tracksAncestry: boolean
  monotoneDecreasing: boolean
  hasDirectLink: boolean
  solved: boolean
} {
  const size = 120
  const K = 4
  const windows = 16
  const root = storedPatterns(K, size, makeRng({ seed: input.seed }))
  const modeSeq = Array.from({ length: windows }, (_, i) => makeRng({ seed: input.seed + 7 + i }).nextInt({ max: K }))

  const sweep = [0, 0.15, 0.3, 0.5, 0.75].map((d) => {
    const pA = root.map((p, i) => mutate(p, d, makeRng({ seed: input.seed + 100 + i })))
    const pB = root.map((p, i) => mutate(p, d, makeRng({ seed: input.seed + 200 + i })))
    return {
      d,
      correlation: runPair({ size, pA, pB, modeSeq, seed: input.seed + 10 }),
      ancestry: patternOverlap(pA, pB),
    }
  })

  // "Shared" uses a GENUINE divergence (d = 0.15): A and B are different systems (about 71% overlap),
  // not a copy, yet still strongly correlated through their common root.
  const sharedCorrelation = sweep[1]?.correlation ?? 0
  const uA = storedPatterns(K, size, makeRng({ seed: input.seed + 300 }))
  const uB = storedPatterns(K, size, makeRng({ seed: input.seed + 400 }))
  const unrelatedCorrelation = runPair({ size, pA: uA, pB: uB, modeSeq, seed: input.seed + 10 })

  // The correlation tracks the inherited ancestry (|corr - overlap| small at every divergence).
  const tracksAncestry = sweep.every((s) => Math.abs(s.correlation - s.ancestry) < 0.1)
  // And it falls monotonically as the two diverge from the common root.
  let monotoneDecreasing = true
  for (let i = 1; i < sweep.length; i++) if ((sweep[i]?.correlation ?? 0) > (sweep[i - 1]?.correlation ?? 1) + 0.02) monotoneDecreasing = false

  return {
    sharedCorrelation,
    unrelatedCorrelation,
    divergenceSweep: sweep,
    tracksAncestry,
    monotoneDecreasing,
    hasDirectLink: false, // the two subsystems have no edges between them, by construction
    // Solved: genuinely different subsystems sharing a common ancestor are strongly correlated
    // (well above the unrelated baseline), the correlation tracks the inherited ancestry and falls
    // with divergence, and there is no link carrying it.
    solved:
      sharedCorrelation > 0.5 &&
      sharedCorrelation > unrelatedCorrelation + 0.4 &&
      tracksAncestry &&
      monotoneDecreasing,
  }
}

export function main(): void {
  const r = synchronicity({ seed: 1 })
  console.log('P67: synchronicity (correlated transitions from shared ancestry, no link)')
  console.log('')
  console.log('  Two separate subsystems, no edges between them, both exposed to the same ambient rhythm.')
  console.log('  A and B share a common ANCESTOR (root memories) but have diverged. How correlated are')
  console.log('  their transitions, and does the correlation track how much ancestry they still share?')
  console.log('')
  console.log('  divergence d from the common root -> state correlation (inherited pattern overlap):')
  for (const s of r.divergenceSweep) {
    console.log(`    d = ${s.d.toFixed(2)}: correlation ${s.correlation.toFixed(3)} (ancestry ${s.ancestry.toFixed(3)})`)
  }
  console.log(`    unrelated (independent roots): correlation ${r.unrelatedCorrelation.toFixed(3)}`)
  console.log('')
  console.log(`  the correlation tracks the inherited ancestry: ${r.tracksAncestry ? 'YES' : 'no'}`)
  console.log(`  it falls as the two diverge from the common root: ${r.monotoneDecreasing ? 'YES' : 'no'}`)
  console.log(`  a direct link carries the correlation: ${r.hasDirectLink ? 'yes' : 'NO'}`)
  console.log('')
  console.log(`  synchronicity solved: ${r.solved ? 'YES' : 'no'}`)
  console.log('')
  console.log('  Two subsystems with no link between them move together in proportion to the ancestry')
  console.log('  they share. Having branched from a common root and then drifted apart, their correlated')
  console.log('  transitions under a common rhythm equal the inherited overlap of their inner landscapes,')
  console.log('  and fade to the unrelated baseline as they diverge. The correlation is laid down in the')
  console.log('  shared past, not transmitted in the present, exactly the mechanism behind the Bell')
  console.log('  correlations without signaling. This is synchronicity as the model allows it: not')
  console.log('  spooky action, but the surfacing of a common origin through the deep field where things')
  console.log('  far apart in space can be near through a shared root.')
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
  id: 'quantum/synchronicity',
  title: 'diverged-but-related subsystems correlate without a link',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = synchronicity({ seed: 1 })
    const ok =
      r.solved &&
      r.sharedCorrelation > 0.5 &&
      r.sharedCorrelation > r.unrelatedCorrelation + 0.4 &&
      r.tracksAncestry &&
      r.monotoneDecreasing &&
      !r.hasDirectLink
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'two unlinked subsystems sharing a diverged ancestry correlate, tracking inherited ancestry and fading with divergence',
      metrics: {
        sharedCorrelation: r.sharedCorrelation,
        unrelatedCorrelation: r.unrelatedCorrelation,
      },
    })
  },
})
