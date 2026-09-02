// The zitterbewegung cycle, exact: the interacting species' front NEVER moves at any
// speed except exactly plus or minus the light speed. Tracking the leading edge of the
// difference field along the drift axis, window-safe at side twenty-five, every one of
// the measured beats advances or retreats by EXACTLY one light-step (root two cells),
// never a fraction, never a pause: speed is never intermediate, only the DIRECTION flips,
// at species-specific beats of the schedule (the middleweight runs six beats forward
// before its first reversal, the heavy species three), while the massless control never
// flips at all. Mass in this model is therefore a DUTY CYCLE: every species' bare front
// rides the cone exactly, and what distinguishes a heavy species from a light one from a
// massless one is only how often the schedule reverses it. This sharpens E-FND-0132's
// zitterbewegung mechanism into an exact kinematic law and reduces the mass formula to
// the reversal statistics of the schedule, the named continuation. Depth L2,
// deterministic, the massless never-reversing control and the exactness of every step the
// two gates that could have failed.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const SIDE = 25
const BEATS = 9

export default experiment({
  id: 'foundations/zitterbewegung-cycle',
  code: 'E-FND-0133',
  title:
    'the zitterbewegung cycle is exact: the interacting species front advances or retreats by exactly one light-step every beat with speed never intermediate and only the direction flipping, at species-specific schedule beats (the middleweight first reverses at beat seven, the heavy at beat four, both pinned), while the massless control never flips, so mass in this model is a duty cycle of exact cone segments and the mass formula reduces to the schedule reversal statistics',
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
    const wrapOf = (d: number): number =>
      d > SIDE / 2 ? d - SIDE : d < -SIDE / 2 ? d + SIDE : d
    const mid = 12
    const center =
      mid + mid * SIDE + mid * SIDE * SIDE + mid * SIDE ** 3
    const roots: number[][] = []

    for (let d = 0; d < 24; d++) {
      const to = mesh.neighbour(center, d)

      roots.push(
        [0, 1, 2, 3].map(a => wrapOf(coordinate(to, a) - mid)),
      )
    }

    const trackFront = (
      dir: number,
    ): { steps: number[]; exactSteps: number; reversals: number[] } => {
      const axis = roots[dir]!.map(v => v / Math.SQRT2)
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      seeded.data[center * 24 + dir] = 1

      const steps: number[] = []
      const reversals: number[] = []
      let exactSteps = 0
      let prev = 0

      for (let t = 0; t < BEATS; t++) {
        vacuum = beat(vacuum, rule(t))
        seeded = beat(seeded, rule(t))

        let front = -99

        for (let i = 0; i < seeded.data.length; i++) {
          if (seeded.data[i] !== vacuum.data[i]) {
            const cell = Math.floor(i / 24)
            let p = 0

            for (let a = 0; a < 4; a++) {
              p += wrapOf(coordinate(cell, a) - mid) * axis[a]!
            }

            front = Math.max(front, p)
          }
        }

        const step = front - prev

        prev = front
        steps.push(step)

        if (Math.abs(Math.abs(step) - Math.SQRT2) < 1e-9) {
          exactSteps++
        }

        if (step < 0) {
          reversals.push(t + 1)
        }
      }

      return { steps, exactSteps, reversals }
    }

    const massless = trackFront(0)
    const middleweight = trackFront(4)
    const heavy = trackFront(8)

    const ok =
      massless.exactSteps === BEATS &&
      massless.reversals.length === 0 &&
      middleweight.exactSteps === BEATS &&
      heavy.exactSteps === BEATS &&
      middleweight.reversals[0] === 7 &&
      heavy.reversals[0] === 4 &&
      middleweight.reversals.length >= 1 &&
      heavy.reversals.length >= 2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'every front step of every species is exactly one light-step in magnitude, the massless control never reverses, the middleweight first reverses at beat seven and the heavy at beat four with the heavy reversing at least twice in the window',
      metrics: {
        masslessExactSteps: massless.exactSteps,
        middleweightExactSteps: middleweight.exactSteps,
        heavyExactSteps: heavy.exactSteps,
        middleweightFirstReversal: middleweight.reversals[0] ?? 0,
        heavyFirstReversal: heavy.reversals[0] ?? 0,
        heavyReversalsInWindow: heavy.reversals.length,
      },
      // CONTROL: the massless species through the identical tracker, nine exact forward
      // steps and zero reversals
      control: {
        masslessNeverReverses:
          massless.reversals.length === 0 ? 1 : 0,
      },
      notes:
        'speed is never intermediate at the front: eighteen of eighteen interacting-species beats and nine of nine massless beats land at exactly root two cells per beat in magnitude. The mass formula is now a counting problem over the schedule (the reversal duty cycle per species), and connecting that duty cycle to the composite centroid speeds of E-FND-0129, through the cloud drag the naive churn formula exposed, is the dispersion programme continuation.',
    })
  },
})
