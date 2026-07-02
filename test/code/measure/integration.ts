// Conformance for code/measure/integration: algebraicConnectivity (the Fiedler value)
// and toneIntegration (the rule-aware Phi). algebraicConnectivity is checked against
// graphs with KNOWN Laplacian spectra (K_n -> n, path P3 -> 1, disconnected -> 0).
//
// toneIntegration guards the odd-n bipartition bug the audit just fixed: a disconnected
// region's weakest cut carries zero cross-influence (Phi = 0), but that separating cut
// puts node 0 on side 1. The old code deduped complements for ALL n, which for ODD n
// silently dropped every part[0] = 1 cut -> it missed the zero cut and reported Phi > 0.
// The fix dedups only for even n, so Phi = 0 again.

import { suite, check, close, ok } from '@/test/code/harness'
import {
  algebraicConnectivity,
  toneIntegration,
} from '@/code/measure/integration'
import { makeRng } from '@/code/tool/rng'

// Build a readonly Uint32Array[] adjacency from a plain neighbor list.
function adjacency(rows: number[][]): Uint32Array[] {
  return rows.map(r => Uint32Array.from(r))
}

// Complete graph K_n adjacency.
function completeGraph(n: number): Uint32Array[] {
  return adjacency(
    Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => j).filter(j => j !== i),
    ),
  )
}

suite('measure/integration: algebraicConnectivity (Fiedler value)', [
  check(
    'K4 has algebraic connectivity 4 (Laplacian spectrum {0, 4, 4, 4})',
    () => {
      const adj = completeGraph(4)
      const value = algebraicConnectivity({
        adjacency: adj,
        region: new Set([0, 1, 2, 3]),
      })

      close(value, 4, 1e-3)
    },
  ),
  check(
    'path P3 has algebraic connectivity 1 (spectrum {0, 1, 3})',
    () => {
      const adj = adjacency([[1], [0, 2], [1]])
      const value = algebraicConnectivity({
        adjacency: adj,
        region: new Set([0, 1, 2]),
      })

      close(value, 1, 1e-3)
    },
  ),
  check(
    'a disconnected 2-node region has algebraic connectivity 0',
    () => {
      const adj = adjacency([[], []])
      const value = algebraicConnectivity({
        adjacency: adj,
        region: new Set([0, 1]),
      })

      close(value, 0, 1e-9)
    },
  ),
])

suite('measure/integration: toneIntegration (Phi)', [
  check(
    'REGRESSION (odd n): a disconnected 5-node region has Phi = 0',
    () => {
      // Two components: edge {0,1} and triangle {2,3,4}, no cross edges. The weakest
      // balanced cut separates them ({0,1} on side 1), carrying zero cross-influence ->
      // Phi = 0. With the old odd-n dedup that cut (part[0] = 1) is dropped and Phi > 0.
      const adj = adjacency([[1], [0], [3, 4], [2, 4], [2, 3]])
      const phi = toneIntegration({
        adjacency: adj,
        region: [0, 1, 2, 3, 4],
        rng: makeRng({ seed: 11 }),
        samples: 64,
      })

      close(phi, 0, 1e-12)
    },
  ),
  check('even n: a disconnected 4-node region also has Phi = 0', () => {
    const adj = adjacency([[1], [0], [3], [2]])
    const phi = toneIntegration({
      adjacency: adj,
      region: [0, 1, 2, 3],
      rng: makeRng({ seed: 11 }),
      samples: 64,
    })

    close(phi, 0, 1e-12)
  }),
  check('a complete K4 region is integrated (Phi > 0)', () => {
    const phi = toneIntegration({
      adjacency: completeGraph(4),
      region: [0, 1, 2, 3],
      rng: makeRng({ seed: 5 }),
      samples: 64,
    })

    ok(
      phi > 0,
      `a fully coupled region must have positive Phi, got ${phi}`,
    )
  }),
])
