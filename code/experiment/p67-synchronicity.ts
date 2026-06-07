// P67: synchronicity (correlated transitions, shared ancestry, no link).
// Synchronicity is a meaningful coincidence between things with no causal link between them now.
// The model's honest account: two subsystems that share a deep ancestry (a common root in the
// tree-like mesh, P49) inherited a correlated structure, and so, under the same ambient rhythm,
// they undergo correlated transitions, with no signal passing between them. This is the same
// shared-substrate mechanism that yields the Bell correlations without signaling (P7): the
// correlation was established in the shared past, not transmitted now.
// We build two separate memory subsystems (no edges between them) and drive both with the SAME
// ambient rhythm. When they share ancestry (the same memory landscape, inherited from a common
// root), their states move in lockstep. When their ancestry is unrelated, the same rhythm leaves
// them uncorrelated. Run: npx tsx code/experiment/p67-synchronicity.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'
import { storedPatterns, hebbianFills, step, overlap } from '~/experiment/p65-dreaming-and-waking'

// Drive a subsystem with a shared ambient rhythm: at each window a mode is cued briefly toward
// THIS subsystem's own m-th memory, then it relaxes. Returns the state overlap with the partner
// at each window end (the partner driven by the same mode sequence).
function runPair(input: {
  size: number
  patternsA: Int8Array[]
  patternsB: Int8Array[]
  modeSeq: number[]
  dwell: number
  seed: number
}): number {
  const { size, patternsA, patternsB, modeSeq, dwell } = input
  const Ja = hebbianFills(patternsA, size)
  const Jb = hebbianFills(patternsB, size)
  const ra = makeRng({ seed: input.seed })
  const rb = makeRng({ seed: input.seed + 1 })
  let a = Int8Array.from({ length: size }, () => (ra.nextInt({ max: 3 }) - 1) as -1 | 0 | 1)
  let b = Int8Array.from({ length: size }, () => (rb.nextInt({ max: 3 }) - 1) as -1 | 0 | 1)
  const zero = new Float64Array(size)
  const cueCount = Math.round(0.6 * size)
  const cueHold = 4
  const overlaps: number[] = []
  const totalBeats = modeSeq.length * dwell
  for (let t = 0; t < totalBeats; t++) {
    const phase = t % dwell
    const m = modeSeq[Math.floor(t / dwell)] ?? 0 // the shared ambient rhythm, same for both
    let cueA: Int8Array | null = null
    let cueB: Int8Array | null = null
    if (phase < cueHold) {
      const pa = patternsA[m] ?? new Int8Array(size)
      const pb = patternsB[m] ?? new Int8Array(size)
      cueA = new Int8Array(size)
      cueB = new Int8Array(size)
      for (let i = 0; i < cueCount; i++) {
        cueA[i] = pa[i] as -1 | 0 | 1
        cueB[i] = pb[i] as -1 | 0 | 1
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
  hasDirectLink: boolean
  solved: boolean
} {
  const size = 120
  const K = 4
  const windows = 16
  const rng = makeRng({ seed: input.seed })
  const patternsA = storedPatterns(K, size, rng)
  // Shared ancestry: B inherited the SAME memory landscape from the common root.
  const patternsBShared = patternsA.map((p) => Int8Array.from(p))
  // Unrelated ancestry: B's memories are independent.
  const patternsBUnrelated = storedPatterns(K, size, makeRng({ seed: input.seed + 99 }))
  // The shared ambient rhythm (the same external cycle both are exposed to).
  const mr = makeRng({ seed: input.seed + 7 })
  const modeSeq = Array.from({ length: windows }, () => mr.nextInt({ max: K }))

  const sharedCorrelation = runPair({ size, patternsA, patternsB: patternsBShared, modeSeq, dwell: 30, seed: input.seed + 10 })
  const unrelatedCorrelation = runPair({ size, patternsA, patternsB: patternsBUnrelated, modeSeq, dwell: 30, seed: input.seed + 10 })

  return {
    sharedCorrelation,
    unrelatedCorrelation,
    hasDirectLink: false, // the two subsystems have no edges between them, by construction
    // Solved: shared ancestry yields strongly correlated transitions, unrelated ancestry does
    // not, and there is no direct link between the subsystems carrying the correlation.
    solved: sharedCorrelation > 0.8 && unrelatedCorrelation < 0.2 && sharedCorrelation > unrelatedCorrelation + 0.5,
  }
}

export function main(): void {
  const r = synchronicity({ seed: 1 })
  console.log('P67: synchronicity (correlated transitions, shared ancestry, no link)')
  console.log('')
  console.log('  Two separate subsystems, no edges between them, both exposed to the same ambient rhythm.')
  console.log('  How correlated are their states over time?')
  console.log('')
  console.log(`  shared deep ancestry (same memory landscape, from a common root): ${(100 * r.sharedCorrelation).toFixed(0)}%`)
  console.log(`  unrelated ancestry (independent landscapes):                      ${(100 * r.unrelatedCorrelation).toFixed(0)}%`)
  console.log(`  is there a direct link between the subsystems carrying this?       ${r.hasDirectLink ? 'yes' : 'NO'}`)
  console.log('')
  console.log(`  synchronicity solved: ${r.solved ? 'YES' : 'no'}`)
  console.log('')
  console.log('  Two subsystems with no link between them move in lockstep when, and only when, they')
  console.log('  share a deep ancestry. Having branched from a common root, they inherited the same')
  console.log('  inner landscape, so the same ambient rhythm steers both to corresponding states at')
  console.log('  corresponding times, a meaningful coincidence with no signal between them. Unrelated')
  console.log('  subsystems, under the very same rhythm, stay uncorrelated. The correlation was laid')
  console.log('  down in the shared past, not transmitted in the present, exactly the mechanism that')
  console.log('  gives the Bell correlations without signaling (P7). This is synchronicity as the model')
  console.log('  allows it: not spooky action, but the surfacing of a common origin, through the deep')
  console.log('  field where things far apart in space can be near through a shared root.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
