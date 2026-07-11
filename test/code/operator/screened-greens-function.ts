// Conformance for code/operator/screened-greens-function: the massive (Yukawa-screened)
// graph-Laplacian Green's function (D - A + m^2) phi = delta by Jacobi fixed point, and the
// clamped leaky-diffusion stationary state. Re-derivable facts:
//   - The converged phi satisfies its own fixed-point equation phi_i (deg_i + m^2) =
//     delta_i + sum_{j~i} phi_j EXACTLY in the limit (residual to machine zero), which is
//     the statement (D - A + m^2) phi = delta.
//   - The screened potential is positive everywhere and peaks at the source.
//   - The clamped leaky walk pins the source to 1 and its stationary occupancy is a fixed
//     point of the leaky push map.

import { suite, check, equal, ok, close } from '@/test/code/harness'
import {
  screenedGreensFunction,
  clampedLeakyDiffusion,
} from '@/code/operator/screened-greens-function'
import { toCsr } from '@/code/tool/graph'

// open 1D chain of 9 sites.
const chain: number[][] = []

for (let i = 0; i < 9; i++) {
  const row: number[] = []

  if (i > 0) row.push(i - 1)

  if (i < 8) row.push(i + 1)

  chain.push(row)
}

suite('operator/screened-greens-function: Yukawa fixed point', [
  check('(D - A + m^2) phi = delta_start at the fixed point', () => {
    const mass2 = 0.5
    const start = 4
    const phi = screenedGreensFunction({
      neighbors: chain,
      start,
      mass2,
      iterations: 10000,
    })

    for (let i = 0; i < chain.length; i++) {
      let sum = 0

      for (const j of chain[i]!) sum += phi[j] ?? 0

      const lhs = (phi[i] ?? 0) * (chain[i]!.length + mass2)
      const rhs = (i === start ? 1 : 0) + sum

      close(lhs, rhs, 1e-10, `screened fixed point at ${i}`)
    }
  }),
  check(
    'the screened potential is positive everywhere and peaks at the source',
    () => {
      const phi = screenedGreensFunction({
        neighbors: chain,
        start: 4,
        mass2: 0.5,
        iterations: 10000,
      })

      let argmax = 0

      for (let i = 1; i < phi.length; i++) {
        if ((phi[i] ?? 0) > (phi[argmax] ?? 0)) argmax = i
      }

      equal(argmax, 4, 'peak at source')

      for (let i = 0; i < phi.length; i++)
        ok((phi[i] ?? 0) > 0, `phi[${i}] positive`)
    },
  ),
  check(
    'a larger mass gives stronger screening (smaller potential one step out)',
    () => {
      const light = screenedGreensFunction({
        neighbors: chain,
        start: 4,
        mass2: 0.2,
        iterations: 10000,
      })

      const heavy = screenedGreensFunction({
        neighbors: chain,
        start: 4,
        mass2: 2.0,
        iterations: 10000,
      })

      // at a fixed distance from the source the heavier mass decays faster.
      ok(
        (heavy[6] ?? 0) / (heavy[4] ?? 1) <
          (light[6] ?? 0) / (light[4] ?? 1),
        'heavier mass decays faster',
      )
    },
  ),
])

suite('operator/screened-greens-function: clamped leaky diffusion', [
  check(
    'the stationary occupancy is a fixed point of the clamped leaky map',
    () => {
      // The map each step is: set base (source = 1, else 0), then add to every node the leaked
      // inflow (1-leak)/deg from each neighbour. NOTE the source is set to 1 and THEN receives
      // inflow, so its stationary value is 1 + inflow, not exactly 1 (see findings: this differs
      // from the "pinned to 1" wording in the doc comment). We verify the genuine fixed point.
      const { offsets, adj } = toCsr(chain)
      const leak = 0.1
      const source = 4
      const p = clampedLeakyDiffusion({
        offsets,
        adjacency: adj,
        nodeCount: chain.length,
        source,
        leak,
        iterations: 30000,
      })

      for (let i = 0; i < chain.length; i++) {
        let inflow = 0

        for (let j = 0; j < chain.length; j++) {
          if (chain[j]!.includes(i))
            inflow += ((1 - leak) * (p[j] ?? 0)) / chain[j]!.length
        }

        const base = i === source ? 1 : 0

        close(
          p[i] ?? 0,
          base + inflow,
          1e-9,
          `leaky fixed point at ${i}`,
        )
      }
    },
  ),
  check('the occupancy is positive and largest at the source', () => {
    const { offsets, adj } = toCsr(chain)
    const p = clampedLeakyDiffusion({
      offsets,
      adjacency: adj,
      nodeCount: chain.length,
      source: 4,
      leak: 0.1,
      iterations: 30000,
    })

    let argmax = 0

    for (let i = 1; i < p.length; i++) {
      if ((p[i] ?? 0) > (p[argmax] ?? 0)) argmax = i
    }

    equal(argmax, 4, 'peak at source')

    for (let i = 0; i < p.length; i++)
      ok((p[i] ?? 0) > 0, `p[${i}] positive`)
  }),
])
