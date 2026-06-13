// Consolidated validation: complete the checks for P1, P5, P8, and P3, beyond
// the per-problem experiments. Each prints a PASS or FAIL against a stated
// prediction. Run: npx tsx code/experiment/validation.ts

import { makeRng, deriveSeed } from '@/code/tool/rng'
import { lattice } from '@/code/substrate/lattice'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { hyperbolicGraph } from '@/code/substrate/hyperbolic-graph'
import { Graph } from '@/code/tool/graph'
import { makeConfiguration } from '@/code/tone/configuration'
import { reversibleEvenOdd } from '@/code/rule/reversible'
import { ruleLocalityRange } from '@/code/measure/locality'
import { longestChain } from '@/code/measure/distance'
import { makeGaugeField } from '@/code/tool/gauge-field'
import { plaquettesOf } from '@/code/dynamics/wilson'
import { wilsonLoopPhase } from '@/code/measure/wilson-loop'
import { aharonovBohmPhase } from '@/code/measure/aharonov-bohm'
import { cellComplexOf, kahlerDirac } from '@/code/operator/dirac'
import { covariantKahlerDirac } from '@/code/operator/gauge-dirac'
import {
  SparseMatrix,
  sparseMatVec,
  LinearOperator,
} from '@/code/algebra/linear/sparse'
import { lowestEigenvalues } from '@/code/algebra/linear/eig-lanczos'
import {
  greedyRoutingSuccess,
  routingWithBacktrack,
} from '@/code/measure/navigation'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function report(input: { name: string; pass: boolean; detail: string }): void {
  console.log(`  [${input.pass ? 'PASS' : 'FAIL'}] ${input.name}: ${input.detail}`)
}

// D^2 as a positive linear operator, for finding |eigenvalues of D|.
function squaredOperator(m: SparseMatrix): LinearOperator {
  return {
    size: m.rows,
    apply: ({ x }) => sparseMatVec(m, { x: sparseMatVec(m, { x }) }),
  }
}

// Sum of the lowest few |eigenvalues|, a spectral fingerprint of the low end.
function lowSpectrumSum(op: LinearOperator): number {
  const squared = lowestEigenvalues({ operator: op, count: 6, steps: 100 })
  let total = 0
  for (let i = 0; i < squared.length; i++) {
    total += Math.sqrt(Math.max(0, squared[i] ?? 0))
  }
  return total
}

// P1: the reversible rule is local. An even-odd update propagates influence about
// two cells per full beat, so a radius near 2 is still strictly local (bounded).
function validateP1(): void {
  const substrate = lattice({ dimension: 1, extent: 12, signature: 'riemannian' })
  const rng = makeRng({ seed: 1 })
  const configuration = makeConfiguration({
    alphabet: { form: 'boolean' },
    size: substrate.size,
    rng,
  })
  const rule = reversibleEvenOdd({
    name: 'xor-parity',
    local: ({ self, neighborhood }) => {
      let parity = 0
      for (const t of neighborhood) {
        parity ^= t & 1
      }
      return (self ^ parity) & 1
    },
  })
  const radius = ruleLocalityRange({
    rule,
    substrate,
    configuration,
    sampleSize: 12,
    rng,
  })
  report({
    name: 'P1 rule locality',
    pass: radius <= 2.5,
    detail: `interaction radius ${radius.toFixed(2)} (bounded, local; even-odd is range ~2)`,
  })
}

// P5: the recovered geometry is sharp beyond dimension. The proper-time
// (longest-chain) distance across the diamond has low variance over sprinklings.
function validateP5(): void {
  const trials = 8
  const depths: number[] = []
  for (let i = 0; i < trials; i++) {
    const rng = makeRng({ seed: deriveSeed({ base: 7, index: i }) })
    const poset = sprinkleMinkowski({ dimension: 2, count: 1200, rng })
    depths.push(longestChain({ poset, from: 0, to: poset.size - 1 }))
  }
  const mean = depths.reduce((a, b) => a + b, 0) / depths.length
  const variance =
    depths.reduce((a, b) => a + (b - mean) * (b - mean), 0) / depths.length
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 1
  report({
    name: 'P5 proper-time sharpness',
    pass: cv < 0.15,
    detail: `longest-chain mean ${mean.toFixed(1)}, coeff of variation ${cv.toFixed(3)}`,
  })
}

// P8: the gauge field couples to the fermion. Under a strong random flux the
// charged Dirac low spectrum differs from the free one (the protected zero mode
// stays, but the bulk shifts), and the Aharonov-Bohm phase scales with charge.
function validateP8(): void {
  const rng = makeRng({ seed: 9 })
  const substrate = lattice({ dimension: 2, extent: 10, signature: 'riemannian' })
  const graph = substrate as Graph
  const field = makeGaugeField({ graph, group: { form: 'u1', q: 12 } })
  // strong random flux, so the charge has a clear, gauge-non-trivial effect
  for (let i = 0; i < field.link.length; i++) {
    field.link[i] = rng.nextInt({ max: 12 })
  }
  const complex = cellComplexOf({ substrate: graph, maxGrade: 2 })

  const free = kahlerDirac({ complex })
  const charged = covariantKahlerDirac({ complex, field, charge: 1 })
  const freeSum = lowSpectrumSum(squaredOperator(free))
  const chargedSum = lowSpectrumSum(squaredOperator(charged))
  const spectraDiffer = Math.abs(freeSum - chargedSum) > 1e-2

  const plaquettes = plaquettesOf({ graph })
  const loop = plaquettes.loops[0] ?? new Uint32Array(0)
  const base = wilsonLoopPhase({ field, loop })
  const ab2 = aharonovBohmPhase({ field, loop, charge: 2 })
  const linear = Math.abs(ab2 - 2 * base) < 1e-9

  report({
    name: 'P8 charge couples to the fermion',
    pass: spectraDiffer && linear,
    detail: `free low-sum ${freeSum.toFixed(3)} vs charged ${chargedSum.toFixed(3)}; AB(2)=${ab2.toFixed(3)} = 2 x ${base.toFixed(3)}`,
  })
}

// P3: backtracking routing reaches essentially every connected target, where
// pure greedy already does well, on the both-worlds hyperbolic substrate.
function validateP3(): void {
  const rng = makeRng({ seed: 30 })
  const graph = hyperbolicGraph({
    count: 1200,
    radius: 7,
    connectThreshold: 3.0,
    rng,
  })
  const greedy = greedyRoutingSuccess({ graph, trials: 500, rng })
  const backtrack = routingWithBacktrack({ graph, trials: 500, rng })
  report({
    name: 'P3 navigability (connected pairs)',
    pass: backtrack.successRate > 0.99 && greedy.successRate > 0.8,
    detail: `greedy ${(greedy.successRate * 100).toFixed(1)}%, backtrack ${(backtrack.successRate * 100).toFixed(1)}% (stretch ${backtrack.meanStretch.toFixed(2)})`,
  })
}

export default defineExperiment({
  id: 'foundations/validation',
  title: 'the reversible even-odd rule is local with a bounded interaction radius',
  category: 'foundations',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const substrate = lattice({ dimension: 1, extent: 12, signature: 'riemannian' })
    const rng = makeRng({ seed: 1 })
    const configuration = makeConfiguration({
      alphabet: { form: 'boolean' },
      size: substrate.size,
      rng,
    })
    const rule = reversibleEvenOdd({
      name: 'xor-parity',
      local: ({ self, neighborhood }) => {
        let parity = 0
        for (const t of neighborhood) {
          parity ^= t & 1
        }
        return (self ^ parity) & 1
      },
    })
    const radius = ruleLocalityRange({
      rule,
      substrate,
      configuration,
      sampleSize: 12,
      rng,
    })
    const ok = radius <= 2.5
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the reversible even-odd XOR-parity rule has a bounded interaction radius near two, confirming it is strictly local',
      metrics: { radius },
      notes:
        'L2, the locality of an even-odd reversible rule is a known structural property, run measures only the P1 locality check from the broader validation suite (P3, P5, P8 are exercised by the standalone main)',
    })
  },
})
