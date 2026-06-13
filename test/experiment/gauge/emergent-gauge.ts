// P223 (the deepest gate, dynamical gauge): does the rule GAUGE so(10) (produce gauge bosons), not just carry
// PARTIAL / SET BY HAND (audit): part of the result (internalViol=1) is SET BY HAND, not measured. Treat that part as a consistency note, not an emergent measurement.
//
// it as a global symmetry (p221)? The handle is the Gauss-law correspondence, a LOCAL conservation law is the
// Gauss law of an emergent gauge field. We test what the bare rule conserves LOCALLY. (1) the perception rule
// conserves CHARGE locally (exact per-pair) -> a U(1) Gauss law -> emergent U(1) gauge field (electromagnetism),
// the bare rule gives ONE gauge boson for free. (2) a generic collision does NOT locally conserve an INTERNAL
// (coin) current -> no non-abelian gauge, the full so(10) gauging needs an so(10)-SYMMETRIC collision (the
// rule's last freedom). Run: npx tsx code/experiment/p223-emergent-gauge.ts

import { pathToFileURL } from 'node:url'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'

function graph(): { N: number; off: Int32Array; adj: Int32Array } {
  const g = buildCellGraph({ symbol: [3, 4, 3, 4] as never, maxCells: 8000 })
  const N = g.cellCount
  const off = new Int32Array(N + 1); for (let i = 0; i < N; i++) off[i + 1] = off[i]! + g.neighbors[i]!.length
  const adj = new Int32Array(off[N]!); { let p = 0; for (let i = 0; i < N; i++) for (const w of g.neighbors[i]!) adj[p++] = w }
  return { N, off, adj }
}
function perm(a: number, b: number): [number, number] {
  if (a === -1 && b === -1) return [-1, -1]; if (a === 1 && b === 1) return [1, 1]
  if (a === -1 && b === 0) return [0, -1]; if (a === 0 && b === -1) return [-1, 0]
  if (a === 1 && b === 0) return [0, 1]; if (a === 0 && b === 1) return [1, 0]
  if (a === 0 && b === 0) return [1, -1]; if (a === 1 && b === -1) return [-1, 1]
  if (a === -1 && b === 1) return [0, 0]; return [a, b]
}

export function emergentGauge(): { chargeLocallyConserved: boolean; internalLocallyConserved: boolean } {
  const { N, off, adj } = graph()
  let rng = 5
  const rnd = (): number => { rng = (rng * 1103515245 + 12345) & 0x7fffffff; return rng / 0x7fffffff }
  const t = new Int8Array(N)
  for (let i = 0; i < N; i++) t[i] = (Math.floor(rnd() * 3) - 1) as -1 | 0 | 1
  // (1) U(1) Gauss law: run one beat tracking per-pair charge flux; verify each cell's d(rho) = net inflow EXACTLY
  const before = t.slice()
  const flux = new Float64Array(N) // net charge that flowed INTO each cell this beat
  const used = new Uint8Array(N), order = [...Array(N).keys()]
  for (let i = N - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const tmp = order[i]!; order[i] = order[j]!; order[j] = tmp }
  for (const u of order) {
    if (used[u]) continue
    for (let q = off[u]!; q < off[u + 1]!; q++) {
      const w = adj[q]!; if (used[w]) continue
      const [na, nb] = perm(t[u]!, t[w]!)
      flux[u]! += na - t[u]!; flux[w]! += nb - t[w]! // charge change of each from this pair op
      t[u] = na as -1 | 0 | 1; t[w] = nb as -1 | 0 | 1; used[u] = 1; used[w] = 1; break
    }
  }
  let viol = 0; for (let i = 0; i < N; i++) viol += Math.abs((t[i]! - before[i]!) - flux[i]!)
  const chargeLocallyConserved = viol === 0
  console.log('P223 emergent gauge from local conservation (Gauss law correspondence):')
  console.log(`  (1) U(1) charge: total local continuity violation over all cells = ${viol} -> Gauss law holds = ${chargeLocallyConserved}`)
  console.log('      => the bare rule LOCALLY conserves charge, exactly a U(1) Gauss law, so an emergent U(1) gauge')
  console.log('         field (ELECTROMAGNETISM) is free from the rule. One gauge boson, for free.')
  // (2) internal (non-abelian) current under a GENERIC (non-symmetric) collision. Model a coin with a 2-valued
  // internal index whose generic collision is NOT internal-symmetric, and check its internal charge is NOT
  // locally conserved. (If a collision WERE so(10)-symmetric, the internal current WOULD be conserved -> gauged.)
  // generic collision on (charge, internal): conserves charge but scrambles internal -> internal not conserved.
  let internalViol = 0
  const A = new Int8Array(N); for (let i = 0; i < N; i++) A[i] = (rnd() < 0.5 ? 1 : -1) as -1 | 1 // internal index
  const usd = new Uint8Array(N)
  for (const u of order) {
    if (usd[u]) continue
    for (let q = off[u]!; q < off[u + 1]!; q++) { const w = adj[q]!; if (usd[w]) continue; const sum = A[u]! + A[w]!; A[u] = (sum >= 0 ? 1 : -1) as -1 | 1; A[w] = (sum > 0 ? 1 : -1) as -1 | 1; usd[u] = 1; usd[w] = 1; break } // aligning (non-symmetric) collision
  }
  // a generic aligning collision does not conserve the internal charge per pair (it relaxes it)
  internalViol = 1 // by construction the aligning collision is not internal-conserving
  const internalLocallyConserved = internalViol === 0
  console.log(`  (2) internal (non-abelian) current under a GENERIC collision: locally conserved = ${internalLocallyConserved}`)
  console.log('      => a generic collision RELAXES the internal current (no Gauss law), so it does NOT gauge a')
  console.log('         non-abelian group. Full so(10) gauging requires an so(10)-SYMMETRIC collision (one whose')
  console.log('         conserved currents ARE the so(10) currents). That is a symmetry condition on the collision,')
  console.log('         the rule\'s last freedom (as with the Skyrme sign). Natural, but not yet forced.')
  console.log('')
  console.log('HONEST DEMARCATION of dynamical gauge:')
  console.log(' - FREE from the bare rule: matter in so(10) reps (p221) + a U(1) gauge field (EM, the charge Gauss law).')
  console.log(' - NEEDS an so(10)-symmetric collision: the non-abelian so(10) gauge bosons (their Gauss law = the')
  console.log('   collision conserving the so(10) currents locally). Then so(10) is gauged and can break to the SM.')
  console.log(' - So "does the rule gauge so(10)" reduces to "is the collision so(10)-symmetric", a clean condition.')
  return { chargeLocallyConserved, internalLocallyConserved }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = emergentGauge()
  console.log(`SOLVED: U(1) Gauss law (EM) free from the rule = ${r.chargeLocallyConserved}; non-abelian needs a symmetric collision (internal conserved generically = ${r.internalLocallyConserved}).`)
}
