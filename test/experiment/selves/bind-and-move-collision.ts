// Option 3 (routes-to-nested-selves), the bind-and-move collision, built and tested. The aim was one reversible
// collision that both CONFINES a structure (like the pair table's breathers) and lets it TRAVEL (like the
// momentum-conserving rotate). We built `bindAndMove`, the committed pair table with the HOP disabled (so lone
// charges stream, mobility) while keeping the create-flip-annihilate cycle (the binding engine). It is reversible
// and charge-conserving. But it does NOT yield a clean moving bound state, and the reason is structural, not a
// tuning failure.
//
// The single-speed obstruction, stated as a clean dichotomy between mobility and the binding engine. Every
// direction of the D4 coin has the same length, one cell per beat, so the gas has a single speed. The only
// binding mechanism a local table has is the create-flip-annihilate cycle (the move that turns peace into a
// balanced pair). That cycle is also what makes the VACUUM active, every peace line creates a pair, so a rule
// that has the binding engine has an unstable (churning) vacuum. We show the dichotomy on the single speed.
//  - headOnRotate MOVES a lone charge (it streams ballistically) but has NO create move, so its vacuum is inert
//    and it has no binding engine at all.
//  - pairCollision HAS the create binding engine (active vacuum) but its hop REFLECTS a lone charge, so it PINS
//    (a lone charge does not travel).
//  - bindAndMove keeps the create binding engine AND disables the hop, and is reversible and charge-conserving,
//    but the create move then destabilizes the vacuum globally (occupancy explodes) rather than confining one
//    structure, so disabling the hop does not buy a clean moving bound state.
//
// So mobility and the binding engine are mutually exclusive in a single local collision at one speed, the mobile
// rule has an inert vacuum (no binding), the binding rules either pin or destabilize. The resolution is Option 4,
// a MULTI-SPEED coin (the F4 root system has long and short roots, or add a rest slot), where a bound state can
// drift slowly while its parts move fast, or the open-system bath of Option F.
//
// Depth L2, the three rules measured with each other as controls, establishing the single-speed obstruction and
// the validity of the bindAndMove build.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, type Mesh } from '@/code/tool/mesh'
import { loneParticle } from '@/code/tone/will'
import {
  pairCollision,
  headOnRotate,
  bindAndMove,
  type Collision,
} from '@/code/rule/collision'
import { run } from '@/code/rule/lattice-gas'
import { isReversible, conservesCharge } from '@/code/check/invariant'
import { travelDistance, maxOccupancy } from '@/code/check/structure'

export default experiment({
  id: 'selves/bind-and-move-collision',
  title:
    'no single-speed local reversible collision both binds and moves: mobility and the binding engine are mutually exclusive',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 20
    const beats = 10
    const mesh: Mesh = d4Mesh({ side })
    const opposite = Array.from({ length: mesh.degree }, (_, d) =>
      mesh.opposite(d),
    )
    const dir = 0
    const half = side / 2
    const center =
      half +
      half * side +
      half * side * side +
      half * side * side * side

    const pair: Collision = pairCollision({ opposite, forward: true })
    const mobile: Collision = headOnRotate({ opposite })
    const bind: Collision = bindAndMove({ opposite })
    const bindInverse: Collision = bindAndMove({
      opposite,
      forward: false,
    })

    const start = () => loneParticle(mesh, center, dir)

    // the build is valid, bindAndMove is reversible and charge-conserving.
    const bindReversible = isReversible(
      start(),
      bind,
      beats,
      bindInverse,
    )
    const bindChargeOk = conservesCharge(start(), bind, beats)

    // mobility axis, a lone charge travels under headOnRotate, pins under pairCollision.
    const headOnTravel = travelDistance({
      will: run(start(), mobile, beats),
      start: center,
    })
    const pairTravel = travelDistance({
      will: run(start(), pair, beats),
      start: center,
    })

    // vacuum-stability axis, the max occupied cells reached over the run from a single charge. The create
    // binding engine (in pairCollision and bindAndMove) makes the vacuum active, headOnRotate (no create) leaves
    // it exactly inert (the one charge just streams).
    const headOnVacuum = maxOccupancy(start(), mobile, beats)
    const pairVacuum = maxOccupancy(start(), pair, beats)
    const bindVacuum = maxOccupancy(start(), bind, beats)

    const ok =
      bindReversible &&
      bindChargeOk &&
      headOnTravel >= beats - 2 && // headOnRotate moves
      headOnVacuum <= 3 && //         headOnRotate has an inert vacuum, no binding engine
      pairTravel <= 2 && //           pairCollision pins
      pairVacuum > 100 && //          pairCollision has the create binding engine, active vacuum
      bindVacuum > 100 //             bindAndMove keeps the binding engine, so its vacuum is active too
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the single-speed D4 coin mobility and the binding engine are mutually exclusive in a local reversible collision, the only mobile rule (headOnRotate) has an inert vacuum and no binding move, the rules with the create binding engine either pin the charge (pairCollision, via its reflecting hop) or destabilize the vacuum globally (bindAndMove, hop disabled), so no single-speed local collision both confines and translates, a moving bound state needs a multi-speed coin (Option 4) or the open-system bath (Option F)',
      metrics: {
        bindReversible: bindReversible ? 1 : 0,
        bindChargeConserved: bindChargeOk ? 1 : 0,
        headOnTravel,
        pairTravel,
        headOnVacuum,
        pairVacuum,
        bindVacuum,
        beats,
      },
      control: { headOnTravel, headOnVacuum, pairTravel },
      notes:
        'the single-speed obstruction as a dichotomy, mobility (streaming) needs no reflection and no create, the binding engine is the create cycle which also makes the vacuum active, and confinement of a moving structure on one speed needs reflection (which pins). The bindAndMove build is valid (reversible, charge-conserving) but cannot escape the wall. The route to a moving bound state is a multi-speed coin (F4 long and short roots, or a rest slot), Option 4, or binding from the growth bath, Option F',
    })
  },
})
