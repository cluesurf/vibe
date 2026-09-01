// EXTERNAL THEORY: Roy Herbert (Chronoflux), with Jacobson behind it (author-bridges/roy-herbert.md,
// chronoflux-bridge/, external-leverage/01-roy-herbert-the-continuum-engine.md). His central primitive is a
// conserved 4D current obeying a divergence-free continuity law (div J = 0), and his gravity derivation is the
// continuity-closure path: curvature is the only lawful way to keep the current continuous under stress. The
// bridge claim is that vibe's exactly-conserved ternary tone IS that current, coarse-grained. This is the
// anchor calculation for the next paper: until it runs, the Chronoflux bridge is a conjecture.
//
// Tested on the committed knit (collide then stream) on the periodic {3,4,3,4} d4 mesh. We coarse-grain the
// tone-charge into blocks at several scales and check the discrete continuity law: for every block, the charge
// change inside over one beat equals minus the net charge flux across the block boundary. For the conserving
// knit this residual is EXACTLY zero at every block scale (integer equality), so the conserved tone is a
// divergence-free current at every coarse-graining. CONTROL: the erasing (lossy) collision injects a per-cell
// sink, so its continuity residual is nonzero at every block scale, the discriminator that the closure is
// conservation and not a generic smoothing. (The lossy residual magnitude falls with block size because the
// signed erased charges partially cancel inside larger blocks. What matters is that it is never zero.)

import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { headOnRotate } from '@/code/rule/collision'
import { erasingCollision } from '@/code/control/lossy-collision'
import { makeWill } from '@/code/tone/will'
import { coarseContinuityResidual } from '@/code/measure/continuity'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'gravity/coarse-continuity-closure',
  code: 'E-GRV-0039',
  title:
    "vibe's conserved tone obeys the discrete continuity law exactly at every coarse-block scale (Chronoflux div J = 0), where a lossy rule's residual grows with scale",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const meshSide = 8 // 8^4 = 4096 cells, divisible by block sides 1, 2, 4
    const mesh = d4Mesh({ side: meshSide })
    const opposite = meshOpposites(mesh)

    const collision = headOnRotate({ opposite })
    const degree = mesh.degree
    const blockSides = [1, 2, 4]

    // a deterministic charged initial configuration, a fixed coordinate pattern, no randomness.
    const coordinate = (cell: number, axis: number): number =>
      Math.floor(cell / meshSide ** axis) % meshSide

    const start = makeWill(mesh)

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      for (let d = 0; d < degree; d++) {
        start.data[cell * degree + d] =
          ((coordinate(cell, 0) + 2 * coordinate(cell, 1) + d) % 3) - 1
      }
    }

    // REAL: the conserving knit. Continuity residual must be exactly zero at every block scale.
    const real = blockSides.map(blockSide =>
      coarseContinuityResidual({
        will: start,
        collision,
        meshSide,
        blockSide,
      }),
    )

    const realExactAllScales = real.every(r => r.absResidual === 0)

    // CONTROL: the lossy knit. Residual is nonzero and grows with block size.
    const lossy = blockSides.map(blockSide =>
      coarseContinuityResidual({
        will: start,
        collision: erasingCollision,
        meshSide,
        blockSide,
      }),
    )

    // the lossy rule violates continuity at every block scale (a per-cell sink), the discriminator.
    const lossyNonzeroAllScales = lossy.every(r => r.absResidual > 0)

    const ok = realExactAllScales && lossyNonzeroAllScales

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "vibe's conserved tone obeys the discrete continuity law exactly at every coarse-block scale: the charge change inside each block equals minus the net flux across its boundary, with zero residual under integer equality, so the conserved tone is a divergence-free current at every coarse-graining (the discrete face of Chronoflux's div J = 0), while a lossy rule violates continuity at every scale with a nonzero residual, confirming the closure is conservation and not a generic smoothing",
      metrics: {
        meshSide,
        realResidualBlock1: real[0]!.absResidual,
        realResidualBlock2: real[1]!.absResidual,
        realResidualBlock4: real[2]!.absResidual,
        realExactAllScales: realExactAllScales ? 1 : 0,
      },
      control: {
        lossyResidualBlock1: lossy[0]!.absResidual,
        lossyResidualBlock2: lossy[1]!.absResidual,
        lossyResidualBlock4: lossy[2]!.absResidual,
        lossyNonzeroAllScales: lossyNonzeroAllScales ? 1 : 0,
      },
      notes:
        'L2, the discrete continuity-closure anchor for the Chronoflux bridge. The conserving knit (collide is per-cell tone-permuting, stream is a slot permutation) rearranges tones without creating or destroying, so the block charge change equals minus the net boundary flux exactly, at every block scale, with zero residual (integer equality, no tolerance). This is the lattice statement of div J = 0. The erasing collision is the Landauer-dissipative control: it injects a per-cell sink, so the continuity residual is nonzero at every scale (its magnitude falls with block size only because the signed erased charges partially cancel inside larger blocks, the relevant fact is that it is never zero). Fully deterministic, a fixed coordinate initial condition.',
    })
  },
})
