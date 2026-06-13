// P146: can a SECOND conserved current (momentum) EMERGE from the five things? (P137, P144, quantization-status.md.)
//
// A relativistic massless mode (z=1) needs a second conserved current beyond the U(1) charge (P137). Before
// adding one to the base, we try to find it EMERGENT. Two routes:
//
//   (A) A hidden CONSERVATION LAW (Noether gives a current). We track candidate conserved quantities, the
//       charge Q = sum tone, the count, the activity sum tone^2, and the staggered charge sum (-1)^x tone,
//       and see which the rule actually preserves. (Analytically the only single-cell conserved quantities
//       solve 2 g(0) = g(+1) + g(-1), a 2D space spanned by Q and the trivial count, so we expect ONLY Q.)
//   (B) A GOLDSTONE mode of spontaneous order (an antiferromagnetic magnon or a superfluid sound mode is
//       z=1, relativistic, and uses the EXISTING U(1) symmetry, no new field). We scan for long-range
//       ORDER (a diverging staggered correlation), which would carry a gapless Goldstone.
//
// If only Q is conserved AND no spontaneous order appears, momentum does NOT emerge from the bare rule and
// must be added. Run: npx tsx code/experiment/p146-second-conservation-search.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '@/code/tool/rng'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

function beat(tone: Int8Array, L: number, moved: Uint8Array, rng: Rng, arrow: number): void {
  moved.fill(0)
  for (let i = 0; i < L; i++) {
    const v = i
    const w = (i + 1) % L
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
    } else if (a === 0 && b === 0 && rng.next() < arrow) {
      const flip = rng.next() < 0.5
      tone[v] = (flip ? 1 : -1) as -1 | 1
      tone[w] = (flip ? -1 : 1) as -1 | 1
      moved[v] = 1
      moved[w] = 1
    }
  }
}

const relStd = (series: number[]): number => {
  const m = series.reduce((s, x) => s + x, 0) / series.length
  const v = series.reduce((s, x) => s + (x - m) ** 2, 0) / series.length
  const scale = Math.max(1e-9, ...series.map((x) => Math.abs(x)))
  return Math.sqrt(v) / scale
}

export function secondConservationSearch(input?: { L?: number }): {
  L: number
  conserved: { name: string; relStd: number; isConserved: boolean }[]
  conservationLawCount: number
  staggeredScan: { arrow: number; staggeredRange: number }[]
  spontaneousOrder: boolean
  onlyChargeConserved: boolean
  momentumEmergent: boolean
  solved: boolean
} {
  const L = input?.L ?? 3000

  // (A) which quantities are conserved
  const tone = new Int8Array(L)
  const moved = new Uint8Array(L)
  const rng = makeRng({ seed: 5 })
  for (let i = 0; i < L; i++) tone[i] = (rng.next() < 0.3 ? (rng.next() < 0.5 ? 1 : -1) : 0) as -1 | 0 | 1
  for (let t = 0; t < 60; t++) beat(tone, L, moved, rng, 0.1)
  const T = 1500
  const Q: number[] = []
  const count: number[] = []
  const activity: number[] = []
  const staggered: number[] = []
  for (let t = 0; t < T; t++) {
    let q = 0
    let act = 0
    let stag = 0
    for (let x = 0; x < L; x++) {
      const s = tone[x]!
      q += s
      act += s * s
      stag += (x % 2 === 0 ? 1 : -1) * s
    }
    Q.push(q)
    count.push(L)
    activity.push(act)
    staggered.push(stag)
    beat(tone, L, moved, rng, 0.1)
  }
  const conserved = [
    { name: 'charge Q = sum tone', relStd: relStd(Q), isConserved: relStd(Q) < 1e-6 },
    { name: 'count (trivial)', relStd: relStd(count), isConserved: relStd(count) < 1e-6 },
    { name: 'activity sum tone^2', relStd: relStd(activity), isConserved: relStd(activity) < 1e-3 },
    { name: 'staggered sum (-1)^x tone', relStd: relStd(staggered), isConserved: relStd(staggered) < 1e-3 },
  ]
  // non-trivial conservation laws (exclude the trivial count)
  const conservationLawCount = conserved.filter((c) => c.isConserved && c.name !== 'count (trivial)').length

  // (B) scan for spontaneous (staggered / Neel) order, the carrier of a z=1 Goldstone
  const staggeredScan: { arrow: number; staggeredRange: number }[] = []
  for (const arrow of [0.4, 0.1, 0.02, 0.005]) {
    const tn = new Int8Array(L)
    const mv = new Uint8Array(L)
    const r2 = makeRng({ seed: 9 })
    for (let i = 0; i < L; i++) tn[i] = (r2.next() < 0.3 ? (r2.next() < 0.5 ? 1 : -1) : 0) as -1 | 0 | 1
    for (let t = 0; t < 300; t++) beat(tn, L, mv, r2, arrow)
    const maxR = 12
    const sumCC = new Float64Array(maxR + 1)
    const TT = 2000
    for (let t = 0; t < TT; t++) {
      for (let x = 0; x < L; x++) for (let r = 0; r <= maxR; r++) sumCC[r]! += tn[x]! * tn[(x + r) % L]!
      beat(tn, L, mv, r2, arrow)
    }
    // STAGGERED correlation magnitude (-1)^r C(r), the Neel order parameter at long range
    const c0 = sumCC[0]! / (L * TT)
    let range = 0
    for (let r = 1; r <= maxR; r++) {
      const cstag = Math.abs((((r % 2 === 0 ? 1 : -1) * sumCC[r]!) / (L * TT)))
      if (cstag > 0.05 * Math.abs(c0)) range = r
    }
    staggeredScan.push({ arrow, staggeredRange: range })
  }
  const spontaneousOrder = staggeredScan.some((s) => s.staggeredRange >= 5) // long-range order = a Goldstone

  const onlyChargeConserved = conservationLawCount === 1 && conserved[0]!.isConserved
  const momentumEmergent = !onlyChargeConserved || spontaneousOrder // a 2nd law OR a Goldstone
  const solved = onlyChargeConserved && !spontaneousOrder // a clear NEGATIVE verdict, decisively determined

  return {
    L,
    conserved,
    conservationLawCount,
    staggeredScan,
    spontaneousOrder,
    onlyChargeConserved,
    momentumEmergent,
    solved,
  }
}

export function main(): void {
  const r = secondConservationSearch()
  console.log('P146: can a second conserved current (momentum) EMERGE from the five things?')
  console.log('')
  console.log('  (A) what the rule conserves:')
  for (const c of r.conserved) console.log(`    ${c.name.padEnd(28)} relStd ${c.relStd.toExponential(1)}  conserved: ${c.isConserved}`)
  console.log(`    => non-trivial conservation laws: ${r.conservationLawCount} (only the U(1) charge: ${r.onlyChargeConserved})`)
  console.log('')
  console.log('  (B) scan for spontaneous order (a z=1 Goldstone carrier):')
  for (const s of r.staggeredScan) console.log(`    arrow ${s.arrow.toFixed(3)}: staggered (Neel) correlation range ${s.staggeredRange}`)
  console.log(`    => long-range order anywhere (a Goldstone): ${r.spontaneousOrder}`)
  console.log('')
  console.log(`  momentum / a second current EMERGES from the bare rule: ${r.momentumEmergent}`)
  if (!r.momentumEmergent) console.log('  => NO. Only the U(1) charge is conserved and there is no spontaneous order, so a relativistic')
  if (!r.momentumEmergent) console.log('     massless mode needs momentum ADDED (a velocity/current degree of freedom), not the bare five.')
  console.log(`  SOLVED (search conclusive): ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
  id: 'relativity/second-conservation-search',
  title: 'the stochastic rule conserves only the U(1) charge with no spontaneous order',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = secondConservationSearch({ L: 3000 })
    const ok = r.solved && r.onlyChargeConserved && !r.spontaneousOrder
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the random rule has only the U(1) charge conserved and no spontaneous order so no second current or Goldstone emerges',
      metrics: {
        conservationLawCount: r.conservationLawCount,
        spontaneousOrder: r.spontaneousOrder ? 1 : 0,
      },
      notes:
        'an honest negative, the search finds no emergent second current from the bare stochastic rule',
    })
  },
})
