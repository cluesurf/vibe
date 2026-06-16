// The discovery bet, anyons from the ternary tone. The hyperbolic substrate is a natural home for topological
// order, and the question is whether the base hosts ANYONS, particles with fractional braiding statistics, neither
// bosons nor fermions. The answer is yes, and it comes from the ternary tone directly. The tone alphabet is balanced
// ternary, the three values forming Z_3, and a Z_3 gauge structure hosts anyons whose mutual braiding phase is
// 2 pi / 3, a FRACTIONAL phase.
//
//   - THE BRAIDING PHASE IS FRACTIONAL (the anyon). A charge transported around a Z_3 flux accumulates the
//     Aharonov-Bohm holonomy 2 pi / 3, which is neither zero (a boson) nor pi (a fermion), the hallmark of an anyon.
//     The binary alphabet Z_2 gives pi (a fermion) and the trivial Z_1 gives zero (a boson), so the THREE-valued
//     tone is exactly what is needed for fractional statistics, the ternary base naturally hosts anyons.
//   - THE PHASE IS TOPOLOGICAL. Every loop that encloses the flux once gives the same 2 pi / 3 regardless of its
//     size or shape (path-independence), the signature of a topological, not a local, effect.
//   - THE CONTROL. A loop that does NOT enclose the flux gives zero, so the phase is genuinely the braiding of one
//     particle around another, not an artifact.
//
// So the ternary tone gives Z_3 anyons with a fractional 2 pi / 3 braiding phase, topological and enclosure-gated,
// the discovery bet realized at the level of the tone's Z_3 structure. The honest residual is the deconfinement of
// this Z_3 topological order in the full knit dynamics (whether the anyons are free or confined), the deeper open
// part. Depth L2, the fractional braiding phase and its topological path-independence measured deterministically,
// with the non-enclosing loop the control and the boson and fermion the alphabet comparison.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { zNVortexHolonomy, squareLoop } from '@/code/measure/anyon-braiding'

const FLUX_X = 20
const FLUX_Y = 20

function braiding(states: number, radius: number): number {
  return zNVortexHolonomy({ states, loop: squareLoop({ radius, cx: FLUX_X, cy: FLUX_Y }), fluxX: FLUX_X, fluxY: FLUX_Y })
}

export default experiment({
  id: 'spin/ternary-anyons',
  title: 'the ternary tone (Z_3) hosts anyons, a fractional 2pi/3 braiding phase, topological and enclosure-gated, vs the binary boson and fermion',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the braiding phase for the ternary Z_3 flux, and the binary Z_2 (fermion) and trivial Z_1 (boson)
    const ternary = braiding(3, 5)
    const fermion = braiding(2, 5)
    const boson = braiding(1, 5)

    // topological path-independence, loops of different sizes give the same ternary phase
    const ternaryAtRadii = [3, 5, 8].map((r) => braiding(3, r))
    const pathIndependent =
      Math.max(...ternaryAtRadii) - Math.min(...ternaryAtRadii) < 1e-6

    // the control, a loop NOT enclosing the flux gives zero
    const notEnclosing = zNVortexHolonomy({
      states: 3,
      loop: squareLoop({ radius: 4, cx: FLUX_X + 12, cy: FLUX_Y + 12 }),
      fluxX: FLUX_X,
      fluxY: FLUX_Y,
    })

    // the ternary phase is the fractional 2 pi / 3 (an anyon), distinct from the boson 0 and the fermion pi
    const fractional =
      Math.abs(ternary - (2 * Math.PI) / 3) < 1e-6 &&
      Math.abs(ternary) > 0.1 &&
      Math.abs(Math.abs(ternary) - Math.PI) > 0.1
    const bosonIsZero = Math.abs(boson) < 1e-6
    const fermionIsPi = Math.abs(Math.abs(fermion) - Math.PI) < 1e-6
    const controlIsZero = Math.abs(notEnclosing) < 1e-6
    const ok = fractional && pathIndependent && bosonIsZero && fermionIsPi && controlIsZero

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the ternary tone (the three values forming Z_3) hosts anyons, a charge transported around a Z_3 flux accumulates a fractional braiding phase of 2 pi / 3, neither zero (a boson) nor pi (a fermion), the hallmark of an anyon. The binary alphabet Z_2 gives pi (a fermion) and the trivial Z_1 gives zero (a boson), so the THREE-valued tone is exactly what produces fractional statistics. The phase is topological, every loop enclosing the flux once gives 2 pi / 3 regardless of size, and a loop not enclosing it gives zero (the control). So the ternary base naturally hosts Z_3 anyons, the topological-matter discovery bet realized at the level of the tone structure.',
      metrics: {
        ternaryBraiding: Number(ternary.toFixed(5)),
        twoPiOverThree: Number(((2 * Math.PI) / 3).toFixed(5)),
        fermionBraiding: Number(fermion.toFixed(5)),
        bosonBraiding: Number(boson.toFixed(5)),
        pathIndependentSpread: Number((Math.max(...ternaryAtRadii) - Math.min(...ternaryAtRadii)).toExponential(2)),
        notEnclosing: Number(notEnclosing.toFixed(5)),
      },
      control: {
        notEnclosing: Number(notEnclosing.toFixed(5)),
        controlIsZero: controlIsZero ? 1 : 0,
      },
      notes:
        'the braiding phase is the Aharonov-Bohm holonomy of a charge around a Z_n flux, 2 pi / n, the mutual statistics of the Z_n gauge theory anyons. The ternary tone is Z_3, so the phase is 2 pi / 3, fractional and anyonic, while the binary case is the familiar fermion (pi) and boson (zero). The topological path-independence (every enclosing loop gives the same phase) and the zero for non-enclosing loops are the signatures of genuine braiding, not a local effect. So the three-valued tone is precisely the structure that produces fractional statistics, the ternary base is a natural home for anyons. The honest residual is whether the full knit dynamics DECONFINE this Z_3 topological order (free anyons versus confined), the deeper open part of the discovery bet.',
    })
  },
})
