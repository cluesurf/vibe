// Conformance for code/operator/block: the 2x2 complex block assembler. The math
// is a single accumulation rule: into the sub-block at (rowSite, colSite) of a
// ComplexMatrix (each site a 2-spinor) it adds coefficient * phase * block, with
// complex phase. We check it lands at the right offsets, computes the complex
// product (coefficient * phase * block) entry-for-entry, accumulates additively,
// and leaves every other entry untouched. Everything is re-derived by hand.

import { suite, check, equal, close } from '@/test/code/harness'
import { Block, addComplexBlock } from '@/code/operator/block'
import { makeComplexMatrix } from '@/code/algebra/linear/dense'

const I2: Block = { re: [1, 0, 0, 1], im: [0, 0, 0, 0] }

suite('operator/block: addComplexBlock', [
  check(
    'the identity block at (0,0), phase 1, coeff 1 lands on the diagonal',
    () => {
      // two sites -> a 4x4 matrix.
      const m = makeComplexMatrix({ rows: 4, cols: 4 })

      addComplexBlock({
        matrix: m,
        rowSite: 0,
        colSite: 0,
        block: I2,
        phaseRe: 1,
        phaseIm: 0,
        coefficient: 1,
      })

      // expected: 1 at (0,0) and (1,1), zero elsewhere.
      const expectedRe = [
        1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]

      for (let k = 0; k < 16; k++) {
        equal(m.re[k] ?? 0, expectedRe[k] ?? 0, `re[${k}]`)
        equal(m.im[k] ?? 0, 0, `im[${k}]`)
      }
    },
  ),
  check(
    'a known block at (1,0) reconstructs coeff * phase * block exactly',
    () => {
      const m = makeComplexMatrix({ rows: 4, cols: 4 })
      const block: Block = { re: [1, 2, 3, 4], im: [5, 6, 7, 8] }
      const phaseRe = 0.5
      const phaseIm = -0.3
      const coefficient = 2

      addComplexBlock({
        matrix: m,
        rowSite: 1,
        colSite: 0,
        block,
        phaseRe,
        phaseIm,
        coefficient,
      })

      const pr = phaseRe * coefficient
      const pi = phaseIm * coefficient

      for (let s = 0; s < 2; s++) {
        for (let t = 0; t < 2; t++) {
          const k = s * 2 + t
          const br = block.re[k] ?? 0
          const bi = block.im[k] ?? 0
          // (pr + i pi)(br + i bi)
          const wantRe = pr * br - pi * bi
          const wantIm = pr * bi + pi * br
          const row = 1 * 2 + s
          const col = 0 + t

          close(
            m.re[row * 4 + col] ?? 0,
            wantRe,
            1e-12,
            `re at (${row},${col})`,
          )

          close(
            m.im[row * 4 + col] ?? 0,
            wantIm,
            1e-12,
            `im at (${row},${col})`,
          )
        }
      }

      // every entry outside rows {2,3} x cols {0,1} stays zero.
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const inBlock =
            (row === 2 || row === 3) && (col === 0 || col === 1)

          if (!inBlock) {
            equal(
              m.re[row * 4 + col] ?? 0,
              0,
              `re untouched at (${row},${col})`,
            )

            equal(
              m.im[row * 4 + col] ?? 0,
              0,
              `im untouched at (${row},${col})`,
            )
          }
        }
      }
    },
  ),
  check(
    'adding the same block twice doubles the sub-block (additive accumulation)',
    () => {
      const once = makeComplexMatrix({ rows: 4, cols: 4 })
      const twice = makeComplexMatrix({ rows: 4, cols: 4 })
      const block: Block = { re: [1, -2, 3, -4], im: [0, 1, -1, 2] }
      const args = {
        rowSite: 0,
        colSite: 1,
        block,
        phaseRe: 0.8,
        phaseIm: 0.6,
        coefficient: 1.5,
      }

      addComplexBlock({ matrix: once, ...args })
      addComplexBlock({ matrix: twice, ...args })
      addComplexBlock({ matrix: twice, ...args })

      for (let k = 0; k < 16; k++) {
        close(
          twice.re[k] ?? 0,
          2 * (once.re[k] ?? 0),
          1e-12,
          `re[${k}] doubled`,
        )

        close(
          twice.im[k] ?? 0,
          2 * (once.im[k] ?? 0),
          1e-12,
          `im[${k}] doubled`,
        )
      }
    },
  ),
  check(
    'blocks land at the correct offsets in a 4-site (8x8) matrix',
    () => {
      const m = makeComplexMatrix({ rows: 8, cols: 8 })

      // place the identity at (rowSite=2, colSite=3): rows {4,5}, cols {6,7}.
      addComplexBlock({
        matrix: m,
        rowSite: 2,
        colSite: 3,
        block: I2,
        phaseRe: 1,
        phaseIm: 0,
        coefficient: 1,
      })

      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const want =
            (row === 4 && col === 6) || (row === 5 && col === 7) ? 1 : 0

          equal(m.re[row * 8 + col] ?? 0, want, `re at (${row},${col})`)
          equal(m.im[row * 8 + col] ?? 0, 0, `im at (${row},${col})`)
        }
      }
    },
  ),
])
