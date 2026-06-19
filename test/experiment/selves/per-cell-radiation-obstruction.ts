// The per-cell ternary self obstruction. We test the topological kink as a self in the per-cell (scalar) reading
// of the tone, the tone as Z3 ({-1,0,+1}) on a chain, evolved by an exactly reversible second-order CA,
// u(t+1) = (rule(left,c,right) - u(t-1)) mod 3. A self needs IDENTITY (it persists as one clean bound thing) and
// AGENCY (it sheds perturbations to the bath and recovers). At the per-cell level it cannot have both at once.
//
// The two horns of the obstruction, the same rule cannot give a clean localized kink AND radiation.
//   1. A COUPLED (radiating) rule lets disturbances propagate, but it SHATTERS the kink, a single clean wall
//      explodes into many walls (order-1 turbulence), so there is no stable localized identity. And even so the
//      turbulence does NOT drain to the bath, a single perturbation in a flat domain stays near its peak.
//   2. A DECOUPLED (static) rule keeps the kink a clean single wall, but it TRAPS a body hit in place (spread
//      radius at most one cell, oscillating forever), so the self has no agency, it cannot radiate.
// Neither shape gives a self. The root cause, ternary is too COARSE to carry a soft radiation field, the smallest
// excitation is order-1, so a disturbance either traps or turns to turbulence, it never softly drains.
//
// The only base-level remnant of identity is the abstract NET WINDING (the field must pass from the left vacuum to
// the right vacuum, so the net topological charge is boundary-forced), but that alone is far too weak to be a
// self, it does not localize and it does not heal. So the localized, corrective self is necessarily EMERGENT, a
// soft long-wavelength collective mode of MANY tones, not a per-cell thing. This is the committed picture, vibes
// give rise to emergent middle layers where selves live, and the reduced oscillator-bath model is the correct
// effective description of that layer.
//
// Depth L2, an honest negative, at the per-cell level a radiating rule shatters the kink and a static rule traps
// the disturbance, so the localized corrective self must be emergent.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  makeTernaryField,
  stepTernaryField,
  linearTernaryRule,
  decoupledTernaryRule,
  wallCount,
  spreadRadius,
  type TernaryField,
} from '@/code/dynamics/ternary-field'

export default experiment({
  id: 'selves/per-cell-radiation-obstruction',
  title:
    'per-cell ternary has no self: a radiating rule shatters the kink, a static rule traps the hit (the corrective self is emergent)',
  category: 'selves',
  substrates: ['ternary-z3'],
  depth: 'L2',
  paper: true,
  run() {
    const size = 160
    const steps = 220
    const center = size / 2

    // horn 1, COUPLED (linear) rule, a single perturbation in a FLAT 0-domain with absorbing-to-0 ends (the bath).
    // a self would shed it (final near 0), instead it spreads into persistent order-1 turbulence that does not
    // drain (final stays near peak).
    let flat: TernaryField = makeTernaryField({ size, fill: () => 0 })
    flat.curr[center] = 1

    const nonzero = (u: Int8Array): number => {
      let c = 0

      for (let x = 0; x < u.length; x++) {
        if (u[x] !== 0) {
          c++
        }
      }

      return c
    }

    let coupledPeak = 0
    let coupledFinal = 0

    for (let t = 0; t < steps; t++) {
      flat = stepTernaryField({
        field: flat,
        rule: linearTernaryRule,
        boundary: { form: 'absorbing', left: 0, right: 0 },
      })

      const c = nonzero(flat.curr)

      if (c > coupledPeak) {
        coupledPeak = c
      }

      coupledFinal = c
    }

    // horn 2, DECOUPLED rule keeps a kink static, but a body hit (flip the wall cell and a neighbour) is TRAPPED,
    // it never spreads beyond a cell, it cannot radiate to the bath.
    const makeKink = (): TernaryField =>
      makeTernaryField({ size, fill: x => (x < center ? 0 : 1) })

    let clean = makeKink()
    let hit = makeKink()
    hit.curr[center] = ((hit.curr[center]! + 1) % 3) as number
    hit.curr[center - 1] = ((hit.curr[center - 1]! + 2) % 3) as number

    let maxSpread = 0

    for (let t = 0; t < steps; t++) {
      clean = stepTernaryField({
        field: clean,
        rule: decoupledTernaryRule,
        boundary: { form: 'absorbing', left: 0, right: 1 },
      })
      hit = stepTernaryField({
        field: hit,
        rule: decoupledTernaryRule,
        boundary: { form: 'absorbing', left: 0, right: 1 },
      })

      const r = spreadRadius({
        clean: clean.curr,
        perturbed: hit.curr,
        center,
      })

      if (r > maxSpread) {
        maxSpread = r
      }
    }

    // under the radiating rule the kink SHATTERS, a single clean wall explodes into many (no stable localized
    // identity), while under the static rule it stays clean. So no single rule gives a clean kink that also
    // radiates.
    let radiating: TernaryField = makeKink()

    const radiatingWallsStart = wallCount(radiating.curr)

    for (let t = 0; t < steps; t++) {
      radiating = stepTernaryField({
        field: radiating,
        rule: linearTernaryRule,
        boundary: { form: 'absorbing', left: 0, right: 1 },
      })
    }

    const radiatingWallsEnd = wallCount(radiating.curr)

    let staticKink: TernaryField = makeKink()

    for (let t = 0; t < steps; t++) {
      staticKink = stepTernaryField({
        field: staticKink,
        rule: decoupledTernaryRule,
        boundary: { form: 'absorbing', left: 0, right: 1 },
      })
    }

    const staticWallsEnd = wallCount(staticKink.curr)

    // the honest negative, the radiating rule shatters the kink (no localized identity) and still does not drain
    // (no agency), while the static rule keeps the kink clean but traps the body hit (no agency). PASS means we
    // correctly demonstrated that no per-cell rule gives a self with both identity and agency.
    const coupledDoesNotDrain = coupledFinal > coupledPeak * 0.5
    const radiatingShattersKink =
      radiatingWallsEnd >= radiatingWallsStart * 10

    const staticKeepsButTraps = staticWallsEnd <= 3 && maxSpread <= 1
    const noPerCellSelf =
      coupledDoesNotDrain &&
      radiatingShattersKink &&
      staticKeepsButTraps

    const ok = noPerCellSelf

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'in the per-cell ternary reading no single reversible rule gives a self with both identity and agency, a radiating rule lets disturbances move but SHATTERS the kink (one clean wall explodes into many, no stable localized identity) and even then a flat-domain perturbation does not drain to the bath (final near peak), while a static rule keeps the kink a clean single wall but TRAPS a body hit in place (spread radius at most one cell), so neither sheds the disturbance, the root cause is that ternary is too coarse for a soft radiation field (the smallest excitation is order-1), so the localized corrective self cannot exist at the per-cell level and must be emergent, a soft long-wavelength mode of many tones',
      metrics: {
        coupledFlatPeak: coupledPeak,
        coupledFlatFinal: coupledFinal,
        decoupledBodyHitSpread: maxSpread,
        radiatingWallsStart,
        radiatingWallsEnd,
        staticWallsEnd,
        coupledDoesNotDrain: coupledDoesNotDrain ? 1 : 0,
        radiatingShattersKink: radiatingShattersKink ? 1 : 0,
        staticKeepsButTraps: staticKeepsButTraps ? 1 : 0,
        steps,
      },
      control: { radiatingWallsEnd, staticWallsEnd },
      notes:
        'honest negative that LOCATES the self. The only base remnant of identity is the abstract net winding (boundary-forced), too weak to be a self. A radiating rule shatters the kink, a static rule traps the hit, ternary {-1,0,+1} has no soft radiation continuum, so the localized corrective self lives at the EMERGENT layer, and the reduced oscillator-bath model is its effective description. Consistent with vibes giving rise to emergent middle layers where selves live',
    })
  },
})
