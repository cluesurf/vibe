// Conformance for code/measure/quantum-double: the Z_N toric code signatures. The ground-state
// degeneracy is N^(2 - chi) = N^(2g), a topological invariant: N^2 on the torus, 1 on the sphere,
// N^4 on a genus-2 surface. The anyon count is N^2, the elementary braiding phase is 2 pi / N, the
// total quantum dimension is N, and the topological entanglement entropy is log N. All exact.

import { suite, check, close, equal } from '@/test/code/harness'
import {
  toricCodeGroundStateDegeneracy,
  squareLatticeCellCounts,
  anyonTypeCount,
  mutualBraidingPhase,
  totalQuantumDimension,
  topologicalEntanglementEntropy,
} from '@/code/measure/quantum-double'

const TIGHT = 1e-12

suite(
  'measure/quantum-double: cell counts give the right Euler characteristic',
  [
    check('torus (genus 1): chi = V - E + F = 0', () => {
      const c = squareLatticeCellCounts({ side: 3, genus: 1 })

      equal(c.vertices - c.edges + c.faces, 0)
    }),
    check('sphere (genus 0): chi = 2', () => {
      const c = squareLatticeCellCounts({ side: 3, genus: 0 })

      equal(c.vertices - c.edges + c.faces, 2)
    }),
    check('genus 2: chi = -2', () => {
      const c = squareLatticeCellCounts({ side: 3, genus: 2 })

      equal(c.vertices - c.edges + c.faces, -2)
    }),
  ],
)

suite('measure/quantum-double: ground-state degeneracy N^(2g)', [
  check('Z_3 torus has degeneracy 3^2 = 9', () => {
    const c = squareLatticeCellCounts({ side: 4, genus: 1 })

    equal(toricCodeGroundStateDegeneracy({ toneStates: 3, ...c }), 9)
  }),
  check('Z_3 sphere has degeneracy 1 (no topological order)', () => {
    const c = squareLatticeCellCounts({ side: 4, genus: 0 })

    equal(toricCodeGroundStateDegeneracy({ toneStates: 3, ...c }), 1)
  }),
  check('Z_3 genus-2 surface has degeneracy 3^4 = 81', () => {
    const c = squareLatticeCellCounts({ side: 4, genus: 2 })

    equal(toricCodeGroundStateDegeneracy({ toneStates: 3, ...c }), 81)
  }),
  check('Z_2 torus has degeneracy 4, and is size-independent', () => {
    const small = squareLatticeCellCounts({ side: 3, genus: 1 })
    const big = squareLatticeCellCounts({ side: 9, genus: 1 })

    equal(
      toricCodeGroundStateDegeneracy({ toneStates: 2, ...small }),
      4,
    )
    equal(toricCodeGroundStateDegeneracy({ toneStates: 2, ...big }), 4)
  }),
])

suite('measure/quantum-double: anyons, braiding, quantum dimension', [
  check('Z_N has N^2 anyon types', () => {
    equal(anyonTypeCount(3), 9)
    equal(anyonTypeCount(2), 4)
  }),
  check('elementary braiding phase is 2 pi / N', () => {
    close(
      mutualBraidingPhase({
        electricCharge: 1,
        magneticFlux: 1,
        toneStates: 3,
      }),
      (2 * Math.PI) / 3,
      TIGHT,
    )

    // a charge-2 around a flux-1 in Z_3 is twice that
    close(
      mutualBraidingPhase({
        electricCharge: 2,
        magneticFlux: 1,
        toneStates: 3,
      }),
      (4 * Math.PI) / 3,
      TIGHT,
    )
  }),
  check('total quantum dimension is N for abelian Z_N', () => {
    close(totalQuantumDimension(3), 3, TIGHT)
    close(totalQuantumDimension(2), 2, TIGHT)
  }),
  check('topological entanglement entropy is log N', () => {
    close(topologicalEntanglementEntropy(3), Math.log(3), TIGHT)
    close(topologicalEntanglementEntropy(2), Math.log(2), TIGHT)
  }),
])
