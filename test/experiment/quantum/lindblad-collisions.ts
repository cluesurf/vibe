// The Lindblad reduction from collisions. Open-system quantum mechanics describes a system
// coupled to an environment by the Lindblad master equation, whose hallmark is Markovian
// exponential decay. On the substrate this reduces cleanly: a system meets a FRESH environment
// cell each beat (the light cone streams new substrate past any moving system, so freshness is
// enforced by the causal structure, the Lorentz face of Markovianity), interacts by a partial
// swap, and the traced-out dynamics is an exact semigroup: the excited population decays
// exponentially at exactly the rate set by the collision angle, the discrete Lindblad evolution.
//
// The control breaks the freshness: reusing the SAME environment cell every beat makes the pair
// oscillate coherently, the population revives to its initial value instead of decaying, the
// non-Markov signature of back-flowing information. So the Lindblad form is specifically the
// payoff of fresh environment, which the substrate's causal structure supplies for free.
//
// Depth L2. It reproduces the Lindblad reduction (exact exponential semigroup decay from
// repeated fresh collisions) against the reused-environment non-Markov control, the collision
// model route, known open-system physics with the causal-freshness reading.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  freshCollisionPopulations,
  reusedCollisionPopulations,
} from '@/code/dynamics/collision-model'

const THETA = 0.3
const COLLISIONS = 60
const INITIAL = 1

export default experiment({
  id: 'quantum/lindblad-collisions',
  code: 'E-QTM-0065',
  title:
    'fresh-environment collisions give exact exponential Lindblad decay at the collision-angle rate while a reused environment revives (non-Markov), Markovianity from causal freshness',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const fresh = freshCollisionPopulations({
      initial: INITIAL,
      theta: THETA,
      collisions: COLLISIONS,
    })

    // exact exponential: population n equals cos^(2n) theta, checked at every beat
    const rate = -2 * Math.log(Math.cos(THETA))

    let worstExponential = 0

    for (let n = 0; n <= COLLISIONS; n++) {
      worstExponential = Math.max(
        worstExponential,
        Math.abs(fresh[n]! - INITIAL * Math.exp(-rate * n)),
      )
    }

    // the semigroup property: the decay factor per beat is constant
    let worstSemigroup = 0

    for (let n = 1; n <= COLLISIONS; n++) {
      worstSemigroup = Math.max(
        worstSemigroup,
        Math.abs(
          fresh[n]! / fresh[n - 1]! - Math.cos(THETA) * Math.cos(THETA),
        ),
      )
    }

    const decayed = fresh[COLLISIONS]! < 0.01

    // CONTROL: the reused environment oscillates and revives
    const reused = reusedCollisionPopulations({
      initial: INITIAL,
      theta: THETA,
      collisions: 200,
    })

    let revivalPeak = 0

    for (let n = 20; n < reused.length; n++) {
      revivalPeak = Math.max(revivalPeak, reused[n]!)
    }

    const revives = revivalPeak > 0.9

    const ok =
      worstExponential < 1e-12 &&
      worstSemigroup < 1e-12 &&
      decayed &&
      revives

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a system colliding with a fresh environment cell each beat by a partial swap decays exactly exponentially (the population matches exp of minus the Lindblad rate minus two log cosine of the collision angle at every beat to machine precision, the per-beat decay factor exactly constant, the semigroup property) down below one percent, while reusing the same environment cell makes the population revive above ninety percent (information flowing back, non-Markov), so the Lindblad reduction is the payoff of fresh environment, which the substrate light cone supplies by streaming new cells past any system, Markovianity from the causal structure',
      metrics: {
        lindbladRate: Number(rate.toFixed(5)),
        worstExponentialError: Number(
          worstExponential.toExponential(2),
        ),
        worstSemigroupError: Number(worstSemigroup.toExponential(2)),
        finalPopulation: Number(fresh[COLLISIONS]!.toExponential(2)),
        reusedRevivalPeak: Number(revivalPeak.toFixed(4)),
      },
      // CONTROL: the reused environment revives, no Lindblad decay without freshness.
      control: { reusedRevivalPeak: Number(revivalPeak.toFixed(4)) },
      notes:
        'Collision-model Lindblad reduction: exact semigroup, exponential rate from the collision angle. The Markov property has a causal face (fresh cells at light speed), tying the open-system item to the Lorentz structure (E-RLT-0042). Non-Markov revival control.',
    })
  },
})
