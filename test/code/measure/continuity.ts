// Conformance for code/measure/continuity: the coarse-block discrete continuity (conservation) law.
// For each coarse block the residual is (charge change inside) + (net charge flux out). A reversible,
// charge-conserving knit (passThrough collide + stream) only rearranges tones, so the residual is
// EXACTLY zero at every block scale, every beat. This is the discrete div J = 0, re-derived from the
// conservation of the stream permutation rather than read off the implementation.

import { suite, check, equal, ok } from '@/test/code/harness'
import { coarseContinuityResidual } from '@/code/measure/continuity'
import { d4Mesh } from '@/code/tool/mesh'
import { makeWill, fillWillPattern } from '@/code/tone/will'
import { passThrough } from '@/code/rule/collision'

function patternWill() {
  const will = makeWill(d4Mesh({ side: 4 }))
  fillWillPattern(will)

  return will
}

suite('measure/continuity: conserving knit has zero residual at every block scale', [
  check('blockSide 1 (per-cell) gives absResidual exactly 0', () => {
    const out = coarseContinuityResidual({
      will: patternWill(),
      collision: passThrough,
      meshSide: 4,
      blockSide: 1,
    })

    equal(out.absResidual, 0)
    equal(out.relative, 0)
  }),
  check('blockSide 2 gives absResidual exactly 0', () => {
    const out = coarseContinuityResidual({
      will: patternWill(),
      collision: passThrough,
      meshSide: 4,
      blockSide: 2,
    })

    equal(out.absResidual, 0)
    equal(out.relative, 0)
    ok(out.blocks === 16, `4/2 per axis ^4 = 16 blocks, got ${out.blocks}`)
  }),
  check('blockSide 4 (whole mesh, one block) gives absResidual exactly 0', () => {
    const out = coarseContinuityResidual({
      will: patternWill(),
      collision: passThrough,
      meshSide: 4,
      blockSide: 4,
    })

    equal(out.absResidual, 0)
    equal(out.blocks, 1)
  }),
])
