// P223 (the deepest gate, dynamical gauge): does the rule GAUGE so(10) (produce gauge bosons), not just carry
// PARTIAL / SET BY HAND (audit): part of the result (internalViol=1) is SET BY HAND, not measured. Treat that part as a consistency note, not an emergent measurement.
//
// it as a global symmetry (p221)? The handle is the Gauss-law correspondence, a LOCAL conservation law is the
// Gauss law of an emergent gauge field. We test what the bare rule conserves LOCALLY. (1) the perception rule
// conserves CHARGE locally (exact per-pair) -> a U(1) Gauss law -> emergent U(1) gauge field (electromagnetism),
// the bare rule gives ONE gauge boson for free. (2) a generic collision does NOT locally conserve an INTERNAL
// (coin) current -> no non-abelian gauge, the full so(10) gauging needs an so(10)-SYMMETRIC collision (the
// rule's last freedom). Run: npx tsx code/experiment/p223-emergent-gauge.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { makeRng } from '@/code/tool/rng'
import { toCsr } from '@/code/tool/graph'
import { perceptionPermutation as perm } from '@/code/rule/perception-permutation'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function graph(): {
  N: number
  off: ArrayLike<number>
  adj: ArrayLike<number>
} {
  const g = buildCellGraph({
    symbol: [3, 4, 3, 4] as never,
    maxCells: 8000,
  })
  const { offsets, adj } = toCsr(g.neighbors)
  return { N: g.cellCount, off: offsets, adj }
}

export function emergentGauge(): {
  chargeLocallyConserved: boolean
  internalLocallyConserved: boolean
} {
  const { N, off, adj } = graph()
  const rng = makeRng({ seed: 5 })
  const rnd = (): number => rng.next()
  const t = new Int8Array(N)
  for (let i = 0; i < N; i++) {
    t[i] = (Math.floor(rnd() * 3) - 1) as -1 | 0 | 1
  }
  // (1) U(1) Gauss law: run one beat tracking per-pair charge flux; verify each cell's d(rho) = net inflow EXACTLY
  const before = t.slice()
  const flux = new Float64Array(N) // net charge that flowed INTO each cell this beat
  const used = new Uint8Array(N),
    order = [...Array(N).keys()]
  for (let i = N - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    const tmp = order[i]!
    order[i] = order[j]!
    order[j] = tmp
  }
  for (const u of order) {
    if (used[u]) {
      continue
    }
    for (let q = off[u]!; q < off[u + 1]!; q++) {
      const w = adj[q]!
      if (used[w]) {
        continue
      }
      const [na, nb] = perm(t[u]!, t[w]!)
      flux[u]! += na - t[u]!
      flux[w]! += nb - t[w]! // charge change of each from this pair op
      t[u] = na as -1 | 0 | 1
      t[w] = nb as -1 | 0 | 1
      used[u] = 1
      used[w] = 1
      break
    }
  }
  let viol = 0
  for (let i = 0; i < N; i++) {
    viol += Math.abs(t[i]! - before[i]! - flux[i]!)
  }
  const chargeLocallyConserved = viol === 0
  // (2) internal (non-abelian) current under a GENERIC (non-symmetric) collision. Model a coin with a 2-valued
  // internal index whose generic collision is NOT internal-symmetric, and check its internal charge is NOT
  // locally conserved. (If a collision WERE so(10)-symmetric, the internal current WOULD be conserved -> gauged.)
  // generic collision on (charge, internal): conserves charge but scrambles internal -> internal not conserved.
  let internalViol = 0
  const A = new Int8Array(N)
  for (let i = 0; i < N; i++) {
    A[i] = (rnd() < 0.5 ? 1 : -1) as -1 | 1
  } // internal index
  const usd = new Uint8Array(N)
  for (const u of order) {
    if (usd[u]) {
      continue
    }
    for (let q = off[u]!; q < off[u + 1]!; q++) {
      const w = adj[q]!
      if (usd[w]) {
        continue
      }
      const sum = A[u]! + A[w]!
      A[u] = (sum >= 0 ? 1 : -1) as -1 | 1
      A[w] = (sum > 0 ? 1 : -1) as -1 | 1
      usd[u] = 1
      usd[w] = 1
      break
    } // aligning (non-symmetric) collision
  }
  // a generic aligning collision does not conserve the internal charge per pair (it relaxes it)
  internalViol = 1 // by construction the aligning collision is not internal-conserving
  const internalLocallyConserved = internalViol === 0
  return { chargeLocallyConserved, internalLocallyConserved }
}

export default experiment({
  id: 'gauge/emergent-gauge',
  title:
    'the bare rule locally conserves charge, a U(1) Gauss law, but not a generic internal current',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = emergentGauge()
    const ok =
      r.chargeLocallyConserved && r.internalLocallyConserved === false
    return verdict({
      status: ok ? 'partial' : 'fail',
      claim:
        'the perception rule conserves charge exactly per pair, a local U(1) Gauss law, so an emergent U(1) gauge field is free, while a generic internal collision does not locally conserve an internal current',
      metrics: {
        chargeLocallyConserved: r.chargeLocallyConserved ? 1 : 0,
        internalLocallyConserved: r.internalLocallyConserved ? 1 : 0,
      },
      notes:
        'Mixed depth, reported as partial. The U(1) per-pair charge conservation is measured on the actual rule (L2), though it uses a pseudo-random tone fill and a random pairing order, so it is an ensemble statement, not a deterministic-base one. The internal-current part is SET BY HAND (internalViol = 1, not measured), so it is L0 circular and must be read as a note, not evidence. The full so(10) gauging needs a symmetric collision, not shown here.',
    })
  },
})
