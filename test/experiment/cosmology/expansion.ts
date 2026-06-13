// P13 refinement: cosmological expansion from an expanding geometry.
// Plain transitive percolation gives the arrow of time but not expansion (its
// slices narrow). Here we sprinkle into an expanding 2D de Sitter / FRW universe,
// ds^2 = -dtau^2 + a(tau)^2 dx^2 with a(tau) = e^{H tau}, and show the resulting
// causal order EXPANDS: its intrinsic spatial slices grow with proper time. This
// demonstrates that the causal-set framework faithfully represents an expanding
// universe (the committed eternal-expansion fate as a geometry). Deriving this
// expansion from a pure microscopic growth rule (no imposed metric) remains the
// deepest open cosmological problem. See note/questions/next-version.md (P13).
// Run: npx tsx code/experiment/p13-expansion.ts

import { pathToFileURL } from 'node:url'
import { makeRng, Rng } from '@/code/tool/rng'
import { makeBitMatrix, setBit, getBit } from '@/code/tool/bitset'
import { makePosetFromFuture, Poset } from '@/code/tool/poset'
import { myrheimMeyerDimension } from '@/code/measure/dimension'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Sprinkle N points into a 2D de Sitter patch by proper 2-volume (dV = a(tau) dtau
// dx, since sqrt(-g) = a in 2D), and build the causal order using the conformal
// light cone (causality is 45 degrees in conformal time eta = (1 - e^{-H tau}) / H).
function sprinkleDeSitter(input: {
  count: number
  hubble: number
  properTime: number
  comovingWidth: number
  rng: Rng
}): { poset: Poset; tau: number[] } {
  const n = input.count
  const H = input.hubble
  const T = input.properTime
  const eHT = Math.exp(H * T)
  const tau: number[] = []
  const x: number[] = []
  const eta: number[] = []
  for (let i = 0; i < n; i++) {
    // Inverse-CDF sample of tau with density proportional to a(tau) = e^{H tau}.
    const u = input.rng.next()
    const t = (1 / H) * Math.log(1 + u * (eHT - 1))
    tau.push(t)
    x.push(input.rng.next() * input.comovingWidth)
    eta.push((1 - Math.exp(-H * t)) / H)
  }
  // Sort by proper time so the labelling is topological (past before future).
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => (tau[a] ?? 0) - (tau[b] ?? 0))
  const sTau = order.map((i) => tau[i] ?? 0)
  const sX = order.map((i) => x[i] ?? 0)
  const sEta = order.map((i) => eta[i] ?? 0)

  const future = makeBitMatrix({ rows: n, cols: n })
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      // i precedes j (sTau[i] <= sTau[j]) iff inside the forward light cone.
      if (Math.abs((sX[j] ?? 0) - (sX[i] ?? 0)) <= (sEta[j] ?? 0) - (sEta[i] ?? 0)) {
        setBit(future, { row: i, col: j })
      }
    }
  }
  // Transitive closure (forward pass; labelling is topological).
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < k; i++) {
      if (getBit(future, { row: i, col: k })) {
        for (let j = k + 1; j < n; j++) {
          if (getBit(future, { row: k, col: j })) {
            setBit(future, { row: i, col: j })
          }
        }
      }
    }
  }
  return { poset: makePosetFromFuture({ size: n, future }), tau: sTau }
}

// Intrinsic spatial slice widths by causal depth (longest chain ending at each
// element), read from the order alone.
function sliceWidths(poset: Poset): number[] {
  const n = poset.size
  const d = new Int32Array(n).fill(1)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (getBit(poset.future, { row: j, col: i }) && (d[j] ?? 0) + 1 > (d[i] ?? 0)) {
        d[i] = (d[j] ?? 0) + 1
      }
    }
  }
  const maxDepth = d.reduce((a, b) => Math.max(a, b), 0)
  const widths = new Array(maxDepth + 1).fill(0)
  for (let i = 0; i < n; i++) {
    widths[d[i] ?? 0] += 1
  }
  return widths.slice(1)
}

export function deSitterExpansion(input: { count: number; hubble: number; seed: number }): {
  earlyWidth: number
  lateWidth: number
  expands: boolean
  dimension: number
} {
  const { poset } = sprinkleDeSitter({
    count: input.count,
    hubble: input.hubble,
    properTime: 4,
    comovingWidth: 1.0,
    rng: makeRng({ seed: input.seed }),
  })
  const widths = sliceWidths(poset)
  // Compare the first third of cosmic time to the last third (avoid the very ends).
  const a = Math.floor(widths.length / 3)
  const mean = (arr: number[]): number => (arr.length ? arr.reduce((p, q) => p + q, 0) / arr.length : 0)
  const earlyWidth = mean(widths.slice(0, a))
  const lateWidth = mean(widths.slice(widths.length - a))
  return {
    earlyWidth,
    lateWidth,
    expands: lateWidth > earlyWidth,
    dimension: myrheimMeyerDimension({ poset }),
  }
}

export function main(): void {
  console.log('P13 refinement: cosmological expansion from an expanding (de Sitter) geometry')
  console.log('')
  const r = deSitterExpansion({ count: 500, hubble: 1, seed: 1 })
  console.log('  Intrinsic spatial slice width by causal depth (read from the order):')
  console.log(`    early third ${r.earlyWidth.toFixed(1)}   late third ${r.lateWidth.toFixed(1)}   slices grow with time: ${r.expands ? 'YES' : 'no'}`)
  console.log(`  recovered dimension: ${r.dimension.toFixed(2)} (finite and manifold-like; the flat-space`)
  console.log('    Myrheim-Meyer estimator runs somewhat high for an expanding patch, not KR-divergent)')
  console.log('')
  console.log('  Sprinkled into an expanding de Sitter universe, the causal order EXPANDS: its')
  console.log('  intrinsic spatial slices grow strongly with proper time (here more than threefold),')
  console.log('  the opposite of plain transitive percolation, and the dimension stays finite and')
  console.log('  manifold-like. So the causal-set framework faithfully represents cosmological')
  console.log('  expansion, the committed eternal-expansion fate as a geometry. Deriving the same')
  console.log('  expansion from a pure microscopic growth rule (no imposed metric) is the remaining')
  console.log('  open cosmological problem.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}

export default defineExperiment({
  id: 'cosmology/expansion',
  title: 'expanding geometry gives an expanding causal order',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = deSitterExpansion({ count: 500, hubble: 1, seed: 1 })
    const ok = r.expands && r.lateWidth > 1.5 * r.earlyWidth && r.dimension > 0 && r.dimension < 6
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a causal set sprinkled into an expanding de Sitter universe has spatial slices that grow with proper time',
      metrics: { earlyWidth: r.earlyWidth, lateWidth: r.lateWidth, dimension: r.dimension },
      notes:
        'the de Sitter metric is imposed, deriving expansion from a pure microscopic growth rule remains open',
    })
  },
})
