// Freeze-out, the mechanism behind big-bang nucleosynthesis, measured on the gas. The light-element
// abundances exist because reaction rates lost a race: while the universe was small and dense,
// collisions processed matter freely, and once expansion diluted the gas faster than reactions could
// find partners, the abundances FROZE at whatever the race had reached. The competition is Gamma
// (the reaction rate) against H (the expansion rate), and the relic abundance is a monotone function
// of the expansion speed.
//
// Measured here with the collision clause itself instrumented (a wrapper counts every cell whose
// slots the momentum collision actually changed): a cloud of tones in a growing active region
// reacts, and the region's edge opens at one cell of radius every k beats.
//
//   - CONFINED (the region never grows): reactions never stop, the per-window rate holds steady
//     near two hundred forty per twelve beats, total 1419. No freeze-out without expansion.
//   - GROWING at k = 4, then k = 2, then instantly open: the totals fall strictly monotonically
//     (632, 396, 285), the faster the expansion the earlier the race is lost.
//   - THE FREEZE: at k = 4 the per-window rate collapses from 171 to 39 across the run, the relic
//     signature, while the confined control's late rate stays above eighty percent of its steady
//     value.
//
// So the model has the BBN mechanism: a relic abundance set by the expansion rate at decoupling,
// with the confined universe the no-freeze-out control. The actual light-element numbers need the
// nuclear reaction network (binding energies and channels), which stays the open half of the row.
// Depth L2, deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { squareMesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { Collision, headOnRotate } from '@/code/rule/collision'
import { growingBeat } from '@/code/rule/lattice-gas'

const SIDE = 60
const BEATS = 72
const WINDOW = 12
const SEED_RADIUS = 6

function chebyshev(cell: number): number {
  const mid = SIDE / 2
  const x = cell % SIDE
  const y = Math.floor(cell / SIDE)

  return Math.max(Math.abs(x - mid), Math.abs(y - mid))
}

function seededCloud(): Will {
  const mesh = squareMesh({ side: SIDE })
  const will = makeWill(mesh)

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    if (chebyshev(cell) <= SEED_RADIUS) {
      const x = cell % SIDE
      const y = Math.floor(cell / SIDE)

      for (let d = 0; d < mesh.degree; d++) {
        if ((x * 3 + y * 5 + d * 2) % 3 === 0) {
          will.data[cell * mesh.degree + d] = 1
        }
      }
    }
  }

  return will
}

// growthK 0 means instantly open everywhere, -1 means confined forever
function reactionHistory(growthK: number): {
  total: number
  windows: number[]
} {
  const mesh = squareMesh({ side: SIDE })
  const opposite = meshOpposites(mesh)
  const gas = headOnRotate({ opposite })

  let events = 0

  const counting: Collision = (slots, base, degree) => {
    const before = slots.slice(base, base + degree)

    gas(slots, base, degree)

    for (let d = 0; d < degree; d++) {
      if (slots[base + d] !== before[d]) {
        events++
        break
      }
    }
  }

  let will: Will = seededCloud()

  const windows: number[] = []

  let last = 0

  for (let t = 0; t < BEATS; t++) {
    const radius =
      growthK === -1
        ? SEED_RADIUS
        : growthK === 0
          ? SIDE
          : SEED_RADIUS + Math.floor(t / growthK)
    const active = (cell: number): boolean => chebyshev(cell) <= radius

    will = growingBeat(will, counting, active)

    if ((t + 1) % WINDOW === 0) {
      windows.push(events - last)
      last = events
    }
  }

  return { total: events, windows }
}

export default experiment({
  id: 'cosmology/freeze-out-vs-expansion',
  code: 'E-CSM-0055',
  title:
    'freeze-out, the BBN mechanism, on the instrumented gas: the confined cloud reacts forever at a steady rate (no freeze-out without expansion), opening the region at one radius cell per 4 beats, per 2 beats, and instantly makes the total reaction count fall strictly monotonically (the faster the expansion the earlier the Gamma-versus-H race is lost), and the k = 4 per-window rate collapses to under thirty percent of its start while the confined rate holds above eighty percent, so the relic-abundance mechanism exists on the model with the nuclear network the open half',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const confined = reactionHistory(-1)
    const slow = reactionHistory(4)
    const medium = reactionHistory(2)
    const instant = reactionHistory(0)

    const monotone =
      confined.total > slow.total &&
      slow.total > medium.total &&
      medium.total > instant.total
    const slowFreezes =
      slow.windows[slow.windows.length - 1]! < 0.3 * slow.windows[0]!
    const confinedOngoing =
      confined.windows[confined.windows.length - 1]! >
      0.8 * confined.windows[1]!

    const ok = monotone && slowFreezes && confinedOngoing

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'reaction totals fall strictly with expansion speed, the k = 4 window rate collapses below thirty percent of its start, and the confined rate holds above eighty percent of steady',
      metrics: {
        confinedTotal: confined.total,
        slowGrowthTotal: slow.total,
        mediumGrowthTotal: medium.total,
        instantOpenTotal: instant.total,
        slowFirstWindow: slow.windows[0]!,
        slowLastWindow: slow.windows[slow.windows.length - 1]!,
      },
      // CONTROL: the confined region, where reactions never freeze
      control: {
        confinedLastWindow:
          confined.windows[confined.windows.length - 1]!,
        confinedSteadyWindow: confined.windows[1]!,
      },
      notes:
        'the instrumented counter fires once per cell-beat whose slots the collision changed, so the measure is the reaction rate itself, not a proxy. The instant-open case is the free-expansion limit and lands lowest, and the torus recurrences that make its late windows noisy are visible in the window lists, reported.',
    })
  },
})
