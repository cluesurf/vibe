// The effective-speed spectrum of the adopted rule, all twenty-four directions, and it is
// a mass hierarchy: THREE directions exactly massless (speed exactly the light speed,
// support one, the protected species), FOUR exactly at rest (zero centroid displacement at
// support one, massive species at rest), and SEVENTEEN in between at species-dependent
// fractions from about eight percent to seventy-five percent of light speed, with visible
// clusterings (three species near an eighth, pairs at a quarter and a half). One rule,
// twenty-four species, three exact bands and a populated interior: the phenomenological
// shape the mass-hierarchy rows require, produced by scheduling geometry alone with
// nothing tuned. The caveat is stated: these are coarse effective speeds over eight
// window-clean beats of a schedule-modulated walk, the dispersion relation proper
// (energy against momentum across scales) is the coarse-bridge deliverable, and the
// intermediate values are pinned as deterministic regression values rather than claimed
// as continuum masses. Depth L2, deterministic, the exact bands the controls for the
// interior.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const SIDE = 21

export default experiment({
  id: 'foundations/speed-spectrum',
  code: 'E-FND-0129',
  title:
    'the twenty-four direction effective-speed spectrum of the adopted rule is a mass hierarchy: exactly three directions massless at exactly light speed and support one, exactly four at rest at exactly zero displacement and support one, and seventeen interacting species at species-dependent intermediate fractions of light speed with visible clusterings, one rule producing the mass-hierarchy shape from scheduling geometry alone, with the coarse effective-speed caveat and the pinned deterministic values stated',
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
    const mid = 10
    const center =
      mid + mid * SIDE + mid * SIDE * SIDE + mid * SIDE ** 3

    let massless = 0
    let atRest = 0
    let interior = 0
    let bandViolations = 0
    const speeds: number[] = []

    for (let dir = 0; dir < 24; dir++) {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      seeded.data[center * 24 + dir] = 1

      let displacement = 0
      let support = 0

      for (let t = 0; t < 8; t++) {
        vacuum = beat(vacuum, rule(t))
        seeded = beat(seeded, rule(t))

        if (t === 7) {
          const cells = new Set<number>()

          for (let i = 0; i < seeded.data.length; i++) {
            if (seeded.data[i] !== vacuum.data[i]) {
              cells.add(Math.floor(i / 24))
            }
          }

          const sum = [0, 0, 0, 0]

          for (const c of cells) {
            for (let a = 0; a < 4; a++) {
              sum[a]! += wrapOf(coordinate(c, a) - mid)
            }
          }

          const n = cells.size || 1

          displacement = Math.hypot(...sum.map(v => v / n))
          support = cells.size
        }
      }

      const v = displacement / 8 / Math.SQRT2

      speeds.push(Number(v.toFixed(3)))

      if (Math.abs(v - 1) < 1e-9 && support === 1) {
        massless++
      } else if (v < 1e-9 && support === 1) {
        atRest++
      } else if (v > 0.05 && v < 0.95) {
        interior++
      } else {
        bandViolations++
      }
    }

    const ok =
      massless === 3 &&
      atRest === 4 &&
      interior === 17 &&
      bandViolations === 0 &&
      speeds[3] === 0.75 &&
      speeds[7] === 0.5 &&
      speeds[13] === 0.083

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'exactly three massless at support one, exactly four at rest at support one, seventeen interior species with no band violations, and the pinned regression speeds hold',
      metrics: {
        massless,
        atRest,
        interior,
        fastestInterior: Math.max(
          ...speeds.filter(v => v > 0.05 && v < 0.95),
        ),
        slowestInterior: Math.min(
          ...speeds.filter(v => v > 0.05 && v < 0.95),
        ),
      },
      // CONTROL: the two exact bands, measured by the identical instrument that reads the
      // interior fractions
      control: {
        exactBands: massless === 3 && atRest === 4 ? 1 : 0,
      },
      notes:
        'the four at-rest species are support-one stationary states, localized massive particles at rest distinct from the static weave breathers (which had support up to two and lived on clock wires). The seventeen interior species cluster near an eighth, a quarter, a half and three quarters of light speed. Turning these coarse effective speeds into a dispersion relation, and the clusterings into mass ratios, is the named continuation of the coarse-bridge programme.',
    })
  },
})
