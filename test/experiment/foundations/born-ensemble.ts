// Born randomness located: single-particle outcomes are deterministic per vacuum phase and
// distributed over the phase ensemble. The same packet, prepared at different beats of the
// twenty-four beat schedule and sent through the same port, transmits DIFFERENT numbers
// (zero, one, two at the gated beats, up to four across the full sweep), each outcome
// exactly reproducible at its beat. So the model's single-event probabilities are
// epistemic: the hidden variable is the vacuum clock phase at preparation, ignorance of it
// gives the outcome distribution, and the distribution is a measurable histogram rather
// than an axiom. This is the deterministic hidden-variable account made concrete, and its
// Bell posture is stated plainly: the preparation, the port, and the vacuum share the one
// clock, a common cause in every correlation, which is the superdeterminism-adjacent
// loophole a one-world reversible model necessarily lives in.
//
// The full-period sweep at side twenty-five (task/born-ensemble-sweep.ts, forty-eight
// runs) found one more thing, recorded with its caveat: the particle and antiparticle
// outcome series summed to EXACTLY thirty-two each over the whole period, ensemble charge
// symmetry restored exactly while fixed-phase outcomes violate C maximally (one against
// four at the E-FND-0125 beat). That window was marginal, the side-seventeen replication
// was window-contaminated and did not reproduce the equality, so exact ensemble C
// restoration is held as measured-once and open, not gated here. Depth L2, deterministic,
// the beat-repeat rerun the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const SIDE = 21

export default experiment({
  id: 'foundations/born-ensemble',
  code: 'E-FND-0127',
  title:
    'single-particle outcomes are deterministic per vacuum phase and distributed over the phase ensemble: the same packet prepared at four different beats of the schedule transmits pinned different numbers through the same port (at least three distinct outcomes per charge), each exactly reproducible at its beat, so Born randomness in this model is epistemic ignorance of the vacuum clock phase with the outcome histogram a measurement rather than an axiom, the hidden-variable account and its superdeterminism-adjacent Bell posture stated plainly, and the exactly balanced full-period charge sums found at side twenty-five held as measured-once with the window caveat recorded',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const rule = turningWeave({ opposite })
    const coordinate = (c: number, a: number): number =>
      Math.floor(c / SIDE ** a) % SIDE
    const cellAt = (v: number[]): number =>
      v[0]! + v[1]! * SIDE + v[2]! * SIDE * SIDE + v[3]! * SIDE ** 3
    const mid = 10

    const slabCells = new Set<number>()

    for (let c = 0; c < mesh.cellCount; c++) {
      if (coordinate(c, 0) === 11) {
        slabCells.add(c)
      }
    }

    const transmitted = (seedBeat: number, tone: number): number => {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)
      const readout = seedBeat + 7
      let far = 0

      for (let t = 0; t <= readout; t++) {
        if (t === seedBeat) {
          const slot = cellAt([10, 4, mid, mid]) * 24 + 8
          const v = seeded.data[slot]!

          seeded.data[slot] = (((v + tone + 4) % 3) -
            1) as -1 | 0 | 1
        }

        const active = (c: number): boolean =>
          slabCells.has(c) ? t >= 2 : true

        vacuum = growingBeat(vacuum, rule(t), active)
        seeded = growingBeat(seeded, rule(t), active)

        if (t === readout) {
          for (let i = 0; i < seeded.data.length; i++) {
            if (seeded.data[i] !== vacuum.data[i]) {
              const x = coordinate(Math.floor(i / 24), 0)

              if (x >= 12 && x <= 17) {
                far++
              }
            }
          }
        }
      }

      return far
    }

    const beats = [3, 7, 15, 23]
    const plus = beats.map(b => transmitted(b, 1))
    const minus = beats.map(b => transmitted(b, -1))
    const rerun = transmitted(3, 1)

    const plusPinned = plus.join() === '1,0,2,1'
    const minusPinned = minus.join() === '3,0,2,0'

    const ok =
      new Set(plus).size >= 3 &&
      new Set(minus).size >= 3 &&
      rerun === plus[0] &&
      plusPinned &&
      minusPinned

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the four preparation beats give at least three distinct outcomes per charge with the exact pinned values, and the repeat of the first beat reproduces its outcome exactly',
      metrics: {
        plusOutcomes: Number(plus.join('')),
        minusOutcomes: Number(minus.join('')),
        plusDistinct: new Set(plus).size,
        minusDistinct: new Set(minus).size,
        rerunMatches: rerun === plus[0] ? 1 : 0,
      },
      // CONTROL: the determinism rerun, the same preparation beat giving the same outcome
      // to the slot, proving the variation is phase structure and not noise
      control: {
        deterministicRerun: rerun === plus[0] ? 1 : 0,
      },
      notes:
        'the full-period side-twenty-five sweep (task/born-ensemble-sweep.ts) is the complete histogram: outcomes zero through four, means equal at one point three three, sums exactly thirty-two and thirty-two. The side-seventeen replication broke the sum equality and the window analysis attributes that to difference-field wraparound, so the exact ensemble charge restoration is an open question for a larger window, stated rather than claimed. What this experiment pins is the mechanism: outcome variation by preparation phase, exact per-phase determinism.',
    })
  },
})
