// Conformance for code/operator/jackiw-rebbi: the 1D Jackiw-Rebbi Dirac Hamiltonian in a kink
// (soliton) mass background H = [[m(x), -D],[D, -m(x)]]. Re-derivable facts:
//   - H is a real symmetric matrix (so the spectrum is real).
//   - The trace is exactly zero: the +m and -m diagonal entries cancel site by site.
//   - Chiral symmetry: H anticommutes with the grade operator, so the spectrum is symmetric
//     about 0 (every E has a partner -E).
//   - The kink binds a topologically protected zero mode: the smallest |E| sits at zero
//     (separated from the continuum gap by the kink), the Jackiw-Rebbi midgap state.

import { suite, check, close } from '@/test/code/harness'
import { jackiwRebbiHamiltonian } from '@/code/operator/jackiw-rebbi'
import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

function build(sites: number, mass: number, width: number) {
  const H = jackiwRebbiHamiltonian({ sites, mass, width })
  const n = H.length
  const dense = makeDense({ rows: n, cols: n })

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      dense.data[i * n + j] = H[i]![j] ?? 0
    }
  }

  return { H, n, dense }
}

suite('operator/jackiw-rebbi: structure', [
  check('the Hamiltonian is real symmetric', () => {
    const { H, n } = build(20, 1, 4)

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        close(H[i]![j] ?? 0, H[j]![i] ?? 0, 0, `symmetry [${i}][${j}]`)
      }
    }
  }),
  check(
    'the trace is exactly zero (the +/- m diagonal cancels)',
    () => {
      const { H, n } = build(20, 1, 4)

      let trace = 0

      for (let i = 0; i < n; i++) {
        trace += H[i]![i] ?? 0
      }

      close(trace, 0, 0, 'trace')
    },
  ),
])

suite('operator/jackiw-rebbi: spectrum', [
  check(
    'the spectrum is symmetric about zero (chiral symmetry)',
    () => {
      const { n, dense } = build(24, 1, 4)
      const values = Array.from(
        eigSymmetric({ matrix: dense }).values,
      ).sort((a, b) => a - b)

      for (let i = 0; i < n; i++) {
        close(
          (values[i] ?? 0) + (values[n - 1 - i] ?? 0),
          0,
          1e-9,
          `chiral pair ${i}`,
        )
      }
    },
  ),
  check('the kink binds a zero-energy midgap mode', () => {
    const { dense } = build(24, 1, 4)
    const values = Array.from(eigSymmetric({ matrix: dense }).values)
    const minAbs = Math.min(...values.map(v => Math.abs(v)))
    close(minAbs, 0, 1e-6, 'Jackiw-Rebbi zero mode')
  }),
  check(
    'the zero mode is topologically robust to the kink width',
    () => {
      // the midgap state is protected by the change of mass sign across the kink, so it persists
      // for both a broad and a sharp kink (only the localisation length changes).
      for (const width of [2, 6]) {
        const { dense } = build(24, 1, width)
        const values = Array.from(
          eigSymmetric({ matrix: dense }).values,
        )

        close(
          Math.min(...values.map(v => Math.abs(v))),
          0,
          1e-5,
          `zero mode at width ${width}`,
        )
      }
    },
  ),
])
