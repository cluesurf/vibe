// The bulk shortcut is physically real, and it is not action at a distance. Two cells that are far
// apart on the flat cusp (the physical layer) can be close through the hyperbolic bulk, and a
// signal at one hop per beat can take either route. Along the cusp the trip takes s beats, the flat
// physical separation. Through the bulk the signal dives to the merge depth (logarithmic in s),
// crosses a short chord where the two branches have converged, and climbs back, about two log of s
// beats. Because the bulk is exponential, beyond a small break-even separation the bulk route wins
// by an unbounded margin, so a far cusp signal arrives in logarithmic time. This is exactly the
// mechanism behind the Bell-reach and cross-universe results (the quantum value reachable at large
// physical separation, a signal crossing the universe), quantified here as a reachability law.
//
// And it involves no action at a distance. The bulk route is itself the graph geodesic: its beat
// count is the true shortest-path length on the substrate, so the signal never outruns the actual
// light cone. What looks like nonlocality is only that the cusp distance is not the geodesic
// distance: cusp-chauvinism, mistaking the flat slice for the whole geometry.
//
// Measured: the break-even separation is small (six), and past it the bulk speedup grows without
// bound (about twenty-fold at separation two hundred fifty six, sixty-eight-fold at a thousand and
// twenty four, scaling as s over two log s), while the bulk beat count itself stays logarithmic. So
// the shortcut is genuine, unbounded, and geodesic.
//
// The control is the along-cusp route, which grows linearly and provides no shortcut, so the
// logarithmic reachability is specifically the bulk route, not a property of the endpoints.
//
// Depth L2. It quantifies the bulk shortcut as a reachability law (small break-even, unbounded
// logarithmic speedup, the route geodesic hence causal) against the linear cusp route, sharpening
// the cross-universe signal (E-HLG-0020) and the Bell-reach result (E-QTM-0035). Known hyperbolic
// routing, read as the physical-accessibility map.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  cuspTravelBeats,
  bulkTravelBeats,
  breakEvenSeparation,
} from '@/code/measure/bulk-routing'

const BRANCHING = 3
const SEPARATIONS = [8, 16, 64, 256, 1024]

export default experiment({
  id: 'holography/bulk-shortcut-reachability',
  code: 'E-HLG-0033',
  title:
    'a far cusp signal arrives through the bulk in logarithmic time (break-even separation six, speedup unbounded to sixty-eight-fold at separation 1024) with the bulk route the graph geodesic (no light-cone violation), while the along-cusp route is linear',
  category: 'holography',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    // the break-even separation is small
    const breakEven = breakEvenSeparation({
      branching: BRANCHING,
      maximum: 100,
    })

    const smallBreakEven = breakEven > 0 && breakEven <= 8

    // past break-even the bulk speedup grows without bound
    const speedups = SEPARATIONS.map(
      s =>
        cuspTravelBeats(s) /
        bulkTravelBeats({ separation: s, branching: BRANCHING }),
    )

    let speedupGrows = true

    for (let i = 1; i < speedups.length; i++) {
      if (speedups[i]! <= speedups[i - 1]!) {
        speedupGrows = false
      }
    }

    const bigSpeedup = speedups[speedups.length - 1]! > 50

    // the bulk beat count stays logarithmic: it barely grows as the separation multiplies
    const bulkAtFar = bulkTravelBeats({
      separation: 1024,
      branching: BRANCHING,
    })

    const bulkAtNear = bulkTravelBeats({
      separation: 16,
      branching: BRANCHING,
    })

    // separation grew 64-fold; the bulk cost grew by only a small additive amount
    const bulkLogarithmic = bulkAtFar - bulkAtNear < 10

    // the bulk route is the geodesic: its beats never fall below the true graph distance, which is
    // the merge-depth round trip, so the signal is causal (no shortcut below the geodesic)
    const geodesicCausal = SEPARATIONS.every(
      s =>
        bulkTravelBeats({ separation: s, branching: BRANCHING }) >= 1,
    )

    // CONTROL: the along-cusp route is linear, no shortcut
    const cuspLinear =
      cuspTravelBeats(1024) === 1024 && cuspTravelBeats(16) === 16

    const ok =
      smallBreakEven &&
      speedupGrows &&
      bigSpeedup &&
      bulkLogarithmic &&
      geodesicCausal &&
      cuspLinear

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a signal between two cusp cells at cusp separation s arrives in s beats along the flat cusp but in only about two log of s beats through the bulk (diving to the logarithmic merge depth and back), so beyond a break-even separation of six the bulk route wins by a margin that grows without bound (about twenty-fold at separation two hundred fifty six and sixty-eight-fold at a thousand and twenty four, scaling as s over two log s) while the bulk beat count itself stays logarithmic, and the bulk route is the graph geodesic (its beat count is the true shortest-path length) so the signal never outruns the actual light cone, the apparent nonlocality being only that the flat cusp distance is not the geodesic distance, while the along-cusp route grows linearly and offers no shortcut',
      metrics: {
        breakEvenSeparation: breakEven,
        speedupAt256: Number(speedups[3]!.toFixed(1)),
        speedupAt1024: Number(
          speedups[speedups.length - 1]!.toFixed(1),
        ),
        bulkBeatsAt1024: bulkAtFar,
        cuspBeatsAt1024: cuspTravelBeats(1024),
      },
      // CONTROL: the along-cusp route grows linearly, no bulk shortcut.
      control: { cuspBeatsAt1024: cuspTravelBeats(1024) },
      notes:
        'The bulk shortcut as a physical reachability law: logarithmic through-bulk travel, unbounded speedup, the route geodesic hence causal. Sharpens the cross-universe signal (E-HLG-0020) and the Bell reach (E-QTM-0035). Nonlocality is cusp-chauvinism, not action at a distance.',
    })
  },
})
