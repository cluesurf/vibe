// The SECOND conserved quantity, DETERMINISTICALLY, on the committed {3,4,3,4} knit. A relativistic z = 1
// massless mode (the photon, the graviton, sound) needs a second conserved current beyond the U(1) charge, and
// so does hydrodynamics (Navier-Stokes conserves mass AND momentum). The existing search
// (relativity/second-conservation-search) used a STOCHASTIC 1D ring sweep with random initial conditions, which
// the methodology forbids, and it never tested the committed momentum-conserving collision. This experiment is the
// deterministic version on the real 24-direction D4 coin, no random anywhere. The momentum-conserving collision
// (headOnRotate) conserves BOTH the charge AND the exact integer momentum vector, the second conserved current,
// while the committed pair-table collision conserves the charge but BREAKS momentum (the hop and the create move
// move charge across a line). So the second conserved quantity that the relativistic light-cone mode and fluid
// dynamics both require EXISTS deterministically as the momentum of the momentum-conserving rule. The honest open
// part, whether this second conservation actually yields a z = 1 mode (versus the diffusive z = 2 of the
// charge-only rule), is the named remaining gap.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeWill, fillWillPattern, gliderLine, charge } from '@/code/tone/will'
import { d4Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { headOnRotate, pairCollision } from '@/code/rule/collision'
import { conservesCharge, conservesMomentum, totalMomentum } from '@/code/check/invariant'

export default experiment({
  id: 'relativity/second-conserved-quantity-3434',
  title: 'the momentum-conserving knit has a second conserved current (momentum) deterministically, the pair table does not',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: 6 })
    const directions = rootsD4()
    const opposite: number[] = []
    for (let d = 0; d < mesh.degree; d++) opposite.push(mesh.opposite(d))
    const beats = 50

    // a deterministic structured initial condition, never random (the methodology rule), a fixed function of the slot index
    const will = makeWill(mesh)
    fillWillPattern(will)
    const startMomentum = totalMomentum(will, directions)
    const startCharge = charge(will)

    // the momentum-conserving collision: a head-on zero-momentum pair rotates to an empty line, lone charges stream
    const momentumRule = headOnRotate({ opposite })
    const momentumConservesCharge = conservesCharge(will, momentumRule, beats)
    const momentumConservesMomentum = conservesMomentum(will, momentumRule, beats, directions)

    // the control: the committed pair table conserves charge but NOT momentum (the hop and create move charge across a line)
    const pairForward = pairCollision({ opposite, forward: true })
    const pairConservesCharge = conservesCharge(will, pairForward, beats)
    const pairConservesMomentum = conservesMomentum(will, pairForward, beats, directions)

    // a NON-TRIVIAL check, a deterministic glider with NONZERO net momentum, the momentum rule must preserve the
    // nonzero vector exactly while the pair rule alters it (so conservation is not the trivial preservation of zero)
    const glider = gliderLine({ mesh, start: 0, direction: 0, tone: 1, length: 5 }).will
    const gliderMomentum = totalMomentum(glider, directions)
    const gliderMomentumNonzero = gliderMomentum.some((value) => value !== 0)
    const momentumRuleHoldsGlider = conservesMomentum(glider, momentumRule, beats, directions)
    const pairRuleHoldsGlider = conservesMomentum(glider, pairForward, beats, directions)

    const ok =
      momentumConservesCharge && momentumConservesMomentum && // the second current exists for the momentum rule
      pairConservesCharge && !pairConservesMomentum && // the control conserves charge but breaks momentum
      gliderMomentumNonzero && momentumRuleHoldsGlider && !pairRuleHoldsGlider // non-trivial, a nonzero momentum is held

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the committed 24-direction D4 coin, deterministically and with no random anywhere, the momentum-conserving collision conserves both the U(1) charge and the exact integer momentum vector (a genuine second conserved current), while the committed pair-table collision conserves the charge but breaks momentum, so the second conserved quantity that a relativistic z=1 mode and hydrodynamics both require exists deterministically as the momentum of the momentum-conserving rule',
      metrics: {
        startCharge,
        startMomentumX: startMomentum[0] ?? 0,
        momentumRuleConservesMomentum: momentumConservesMomentum ? 1 : 0,
        pairRuleConservesMomentum: pairConservesMomentum ? 1 : 0,
        gliderMomentumX: gliderMomentum[0] ?? 0,
        momentumRuleHoldsGliderMomentum: momentumRuleHoldsGlider ? 1 : 0,
        pairRuleHoldsGliderMomentum: pairRuleHoldsGlider ? 1 : 0,
        beats,
        directions: 24,
      },
      control: { pairRuleConservesMomentum: pairConservesMomentum ? 1 : 0 },
      notes:
        'deterministic replacement for the stochastic relativity/second-conservation-search (which used random initial conditions, against the methodology, and never tested the committed momentum collision). Honest open, whether this second conservation yields a z=1 relativistic massless mode (vs the diffusive z=2 of the charge-only rule) is the named remaining gap = ST1.',
    })
  },
})
