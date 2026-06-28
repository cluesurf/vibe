// Conformance for code/measure/curvature: the combinatorial Forman-Ricci curvature and
// the shell-growth curvature sign. Forman-Ricci is integer arithmetic from degrees and
// triangle counts, so it is checked exactly. The shell-growth classifier is fed shell
// sequences whose qualitative geometry is unambiguous: polynomial growth (flat), turnover
// (positive/sphere), exponential growth (negative/hyperbolic).

import { suite, check, equal } from '@/test/code/harness'
import { makeGraph } from '@/code/tool/graph'
import {
  formanRicci,
  meanCurvature,
  shellGrowthCurvature,
} from '@/code/measure/curvature'

// A triangle K3: every edge has two degree-2 endpoints sharing one common neighbour.
const triangle = makeGraph({
  size: 3,
  directed: false,
  neighbors: [[1, 2], [0, 2], [0, 1]],
})

// A star: one centre (degree 4) and four leaves (degree 1), no triangles.
const star = makeGraph({
  size: 5,
  directed: false,
  neighbors: [[1, 2, 3, 4], [0], [0], [0], [0]],
})

suite('measure/curvature: Forman-Ricci', [
  // F = 4 - deg(a) - deg(b) + 3*triangles = 4 - 2 - 2 + 3 = 3 on a triangle edge.
  check('a triangle edge has curvature +3', () => {
    equal(formanRicci({ substrate: triangle, a: 0, b: 1 }), 3)
  }),
  check('the mean curvature of K3 is +3 (clustered, positive)', () => {
    equal(meanCurvature({ substrate: triangle }), 3)
  }),
  // F = 4 - 4 - 1 + 0 = -1 on a star spoke (tree-like, negative).
  check('a star spoke has curvature -1', () => {
    equal(formanRicci({ substrate: star, a: 0, b: 1 }), -1)
  }),
  check('the mean curvature of a star is -1 (tree-like, negative)', () => {
    equal(meanCurvature({ substrate: star }), -1)
  }),
])

suite('measure/curvature: shell-growth sign', [
  // Polynomial 2D-grid shells (~ linear in d): late successive ratio decays below the flat
  // threshold and never turns over, so the sign is flat.
  check('polynomially growing shells read flat', () => {
    const out = shellGrowthCurvature({
      shellCounts: [1, 4, 8, 12, 16, 20, 24],
    })
    equal(out.sign, 'flat')
  }),
  // Exponential shells (ratio ~2) stay above the negative threshold: hyperbolic.
  check('exponentially growing shells read negative', () => {
    const out = shellGrowthCurvature({
      shellCounts: [1, 3, 6, 12, 24, 48, 96],
    })
    equal(out.sign, 'negative')
  }),
  // Shells that grow then shrink (a sphere) have an interior ratio below 1: positive.
  check('shells that turn over read positive', () => {
    const out = shellGrowthCurvature({
      shellCounts: [1, 4, 8, 10, 8, 4, 1],
    })
    equal(out.sign, 'positive')
  }),
])
