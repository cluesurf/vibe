// EXTERNAL THEORY: Roy Herbert (Chronoflux), the transport-sector half of the
// covariant closure, completing the discrete-to-continuum map. The map so far:
// E-GRV-0039 shows the SCALAR law (charge continuity) closes exactly at every
// coarse scale, and E-GRV-0046 shows the coarse field converges to a smooth
// limit. Chronoflux's covariant closure claims more, that the TRANSPORT sector
// also closes, which discretely is the momentum current: for every coarse block
// and every momentum component, the change of block momentum over a beat must
// equal minus the momentum flux the stream carries across the block boundary.
// This experiment measures that vector law on the committed {3,4,3,4} lattice
// under the momentum-conserving rule candidate (headOnRotate, which only moves
// zero-momentum head-on pairs between lines): the residual is integer-exact
// ZERO at every block scale and every component, over every measured beat. The
// CONTROL is the pair table, whose create move makes a (+1, -1) pair on one
// line (net momentum two roots), so its residual is nonzero, the discriminator
// that the closure is momentum conservation, not bookkeeping. Charge stays
// exactly conserved under both rules, so the two laws are genuinely separate.
//
// With this pair of laws closed at every scale, and the field convergence of
// E-GRV-0046, the discrete substrate carries a smooth conserved current AND a
// closed momentum transport law into the continuum, which is the full discrete
// origin of the Chronoflux transport sector: both halves of the covariant
// closure emerge from collisions, on the honest note that FULL covariance
// (frame invariance of these laws under emergent boosts) is the separate
// standing result of the relativity category (the Lorentz-safe first order of
// E-RLT-0029 and the propagating modes), cited rather than re-measured here.
//
// Grade L2: exact known conservation mathematics measured cleanly on the
// committed substrate with a genuinely failing control. The identification
// with the Chronoflux transport sector is the bridge reading, stated as such.

import { d4Mesh } from '@/code/tool/mesh'
import { makeWill, charge, type Will } from '@/code/tone/will'
import { headOnRotate, pairCollision } from '@/code/rule/collision'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { maxMomentumResidual } from '@/code/measure/momentum-continuity'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const SIDE = 6 // 6^4 cells, block sides 1, 2, 3 divide it
const BEATS = 8

// deterministic heterogeneous ternary texture (period 7, coprime to side and blocks)
function fillTexture(will: Will): void {
  const { mesh, data } = will

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const x = cell % SIDE
    const y = Math.floor(cell / SIDE) % SIDE
    const z = Math.floor(cell / (SIDE * SIDE)) % SIDE
    const w = Math.floor(cell / (SIDE * SIDE * SIDE)) % SIDE

    for (let d = 0; d < mesh.degree; d++) {
      const phase = (x + 2 * y + 3 * z + 5 * w + d) % 7

      data[cell * mesh.degree + d] = (phase % 3) - 1
    }
  }
}

// the worst residual over all beats and block scales for one collision rule
function worstResidual(rule: 'rotate' | 'pair'): {
  worst: number
  chargeConserved: boolean
} {
  const mesh = d4Mesh({ side: SIDE })
  const roots = rootsD4()
  const opposite = Array.from({ length: mesh.degree }, (_, d) =>
    mesh.opposite(d),
  )

  const collision =
    rule === 'rotate'
      ? headOnRotate({ opposite })
      : pairCollision({ opposite })

  let will = makeWill(mesh)

  fillTexture(will)

  const chargeBefore = charge(will)

  let worst = 0

  for (let b = 0; b < BEATS; b++) {
    let after: Will = will

    for (const block of [1, 2, 3]) {
      const result = maxMomentumResidual({
        will,
        collision,
        roots,
        side: SIDE,
        block,
      })

      worst = Math.max(worst, result.residual)
      after = result.after
    }

    will = after
  }

  return { worst, chargeConserved: charge(will) === chargeBefore }
}

export default experiment({
  id: 'gravity/coarse-stress-closure',
  code: 'E-GRV-0047',
  title:
    'the momentum transport law closes integer-exactly at every coarse block scale under the momentum-conserving rule (block momentum change equals minus the boundary momentum flux, all four components, every beat), while the pair-table control leaves a nonzero residual, so both halves of the Chronoflux covariant transport closure, the scalar law and the momentum law, emerge exactly from the discrete substrate',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const rotate = worstResidual('rotate')
    const pair = worstResidual('pair')

    // 1. the momentum law closes exactly under the momentum-conserving rule
    const closesExactly = rotate.worst === 0

    // 2. the control fails: the pair table creates momentum the flux cannot
    // account for, so the residual is nonzero
    const controlFails = pair.worst > 0

    // 3. charge is exactly conserved under BOTH rules, so the two conservation
    // laws are separate facts and the control fails only the momentum law
    const chargeSeparates =
      rotate.chargeConserved && pair.chargeConserved

    const solved = closesExactly && controlFails && chargeSeparates

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'on the committed {3,4,3,4} lattice under the momentum-conserving head-on-rotate rule, the block momentum change over each beat equals minus the momentum flux across the block boundary as integer equality, for all four momentum components, at block sides one, two, and three, over every measured beat, while the pair-table control leaves a nonzero residual because its create move makes momentum inside cells, and charge is conserved exactly under both rules, so the momentum transport law closes exactly at every coarse scale and only under momentum conservation, completing with E-GRV-0039 and E-GRV-0046 the discrete origin of both halves of the Chronoflux covariant transport closure',
      metrics: {
        rotateWorstResidual: rotate.worst,
        pairWorstResidual: pair.worst,
        rotateChargeConserved: rotate.chargeConserved ? 1 : 0,
        pairChargeConserved: pair.chargeConserved ? 1 : 0,
      },
      control: {
        // the pair table is the control: it conserves charge but its create
        // move injects momentum inside cells, so the momentum residual is
        // nonzero while the charge law still closes, isolating exactly what
        // the closure requires
        pairWorstResidual: pair.worst,
        rotateWorstResidual: rotate.worst,
      },
      notes:
        'AUDIT 2026-08-31: this run uses d4Mesh with an even side, which is two disconnected lattices (the D4 roots preserve coordinate-sum parity, see the PARITY note on d4Mesh). The seeds and measurements here are local, so the result stands on the component the seed lives in; roadmap item 0017 tracks the switch to an odd side. ' +
        'L2, exact conservation mathematics measured on the committed substrate. The residual is asserted as exact integer equality (zero tolerance) under the momentum-conserving rule, per the exactness methodology, and the control residual is strictly positive. Full covariance (frame invariance under emergent boosts) is the standing relativity-category result (Lorentz-safe first order, E-RLT-0029) and is cited, not re-measured. The bridge reading is that the scalar law (E-GRV-0039), the smooth limit (E-GRV-0046), and this momentum closure together give the Chronoflux transport sector a complete discrete origin, with the fitted continuum constants staying out per the bridge rules.',
    })
  },
})
