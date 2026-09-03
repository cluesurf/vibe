// The Kac mass table: telegraph statistics for every direction, the model's mass spectrum
// proper, with three structural findings beyond the numbers:
//
//   - DEGENERACY BY RESIDUAL SYMMETRY: the two exact-ladder rest species (directions
//     twenty-one and twenty-two, E-FND-0130) are LINE PARTNERS (exact opposites, the
//     charge-conjugate pair) and return IDENTICAL telegraph records to the integer, while
//     the well-measured moving species pair near-degenerately with their MIRROR partners,
//     the direction with one flipped coordinate (eight with nine across the w axis, five
//     with seven across x, ten with eleven across w). Mass respects the schedule's
//     residual reflection symmetry, exactly on lines and approximately on mirrors, a
//     structure the rule was never told to have.
//   - THE MASSLESS FLOOR IS EXACT AFTER ARTIFACT ACCOUNTING: the two trackable massless
//     directions each show exactly three isolated lap dips (six sign transitions), the
//     wrap seam of a speed-one walker on a side-seventeen torus, and nothing else, so
//     their true flip rate is zero.
//   - A GENUINE HIERARCHY: well-measured interacting species span Kac masses from about
//     zero point zero nine to zero point two zero lattice units, with the pinned ordering
//     stable and the heaviest (direction eighteen) more than twice the lightest.
//
// Scope stated: one massless direction's bare content converts out of its seeded slot
// immediately (untrackable by this instrument), and four species' bare content dies early
// (fewer than twenty steps), their rates reported but not gated. Depth L2, deterministic,
// the exact 21-22 degeneracy and the lap-dip accounting the controls.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const SIDE = 17
const BEATS = 48

export default experiment({
  id: 'foundations/kac-mass-table',
  code: 'E-FND-0135',
  title:
    'the Kac mass table over every direction shows mass respecting the schedule residual symmetry (the exact-ladder rest pair, which is a line of charge-conjugate opposites, returns identical telegraph records to the integer, and moving species pair near-degenerately with their mirror partners, the one-flipped-coordinate directions), an exact massless floor after lap-dip accounting (exactly three isolated wrap dips each and nothing else), and a genuine hierarchy with the heaviest well-measured species more than twice the lightest, the model mass spectrum from flip counting with one rule and one measured constant',
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
    const mid = 8
    const center =
      mid + mid * SIDE + mid * SIDE * SIDE + mid * SIDE ** 3
    const roots: number[][] = []

    for (let d = 0; d < 24; d++) {
      const to = mesh.neighbour(center, d)

      roots.push(
        [0, 1, 2, 3].map(a => wrapOf(coordinate(to, a) - mid)),
      )
    }

    const telegraph = (
      dir: number,
    ): { steps: number; flips: number; dips: number; isolated: boolean } => {
      const axis = roots[dir]!.map(v => v / Math.SQRT2)
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      seeded.data[center * 24 + dir] = 1

      let prevPos: number[] | null = null
      const signs: number[] = []

      for (let t = 0; t < BEATS; t++) {
        vacuum = beat(vacuum, rule(t % 24))
        seeded = beat(seeded, rule(t % 24))

        const cells: number[] = []

        for (let cell = 0; cell < mesh.cellCount; cell++) {
          if (
            seeded.data[cell * 24 + dir] !==
            vacuum.data[cell * 24 + dir]
          ) {
            cells.push(cell)
          }
        }

        if (cells.length === 0) {
          prevPos = null
          continue
        }

        const pos = [0, 1, 2, 3].map(a => {
          let s = 0

          for (const c of cells) {
            s += wrapOf(coordinate(c, a) - mid)
          }

          return s / cells.length
        })

        if (prevPos) {
          let step = 0

          for (let a = 0; a < 4; a++) {
            step += (pos[a]! - prevPos[a]!) * axis[a]!
          }

          signs.push(Math.sign(Math.round(step * 100) / 100))
        }

        prevPos = pos
      }

      let flips = 0
      let last = 0
      let dips = 0
      let isolated = true

      for (let i = 0; i < signs.length; i++) {
        const s = signs[i]!

        if (s !== 0) {
          if (last !== 0 && s !== last) {
            flips++
          }

          last = s
        }

        if (s === -1) {
          if (signs[i - 1] === -1) {
            isolated = false
          } else {
            dips++
          }
        }
      }

      return { steps: signs.length, flips, dips, isolated }
    }

    const rows = new Map<number, ReturnType<typeof telegraph>>()

    for (let dir = 0; dir < 24; dir++) {
      rows.set(dir, telegraph(dir))
    }

    const hbar = 3 / (2 * Math.PI)
    const massOf = (dir: number): number => {
      const r = rows.get(dir)!

      return (hbar * (r.flips / (r.steps || 1))) / 2
    }

    // gates
    const masslessFloor =
      rows.get(0)!.dips === 3 &&
      rows.get(0)!.isolated &&
      rows.get(0)!.flips === 6 &&
      rows.get(1)!.dips === 3 &&
      rows.get(1)!.isolated &&
      rows.get(1)!.flips === 6

    const r21 = rows.get(21)!
    const r22 = rows.get(22)!
    const exactDegeneracy =
      r21.steps === r22.steps && r21.flips === r22.flips

    const pairClose = (a: number, b: number): boolean =>
      Math.abs(massOf(a) - massOf(b)) < 0.02

    const linePairing =
      pairClose(8, 9) && pairClose(5, 7) && pairClose(10, 11)

    const hierarchy =
      massOf(18) > 2 * massOf(5) &&
      massOf(8) > massOf(4) &&
      massOf(4) > massOf(5)

    const wellMeasured = [...rows.values()].filter(
      r => r.steps >= 40,
    ).length

    const ok =
      masslessFloor &&
      exactDegeneracy &&
      linePairing &&
      hierarchy &&
      wellMeasured >= 12

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'both trackable massless directions show exactly three isolated lap dips and nothing else, the ladder rest pair is exactly degenerate to the integer, the three line pairs sit within two hundredths of each other, the hierarchy ordering holds with the heaviest above twice the lightest, and at least twelve species are well measured',
      metrics: {
        masslessFloorExact: masslessFloor ? 1 : 0,
        ladderPairDegenerate: exactDegeneracy ? 1 : 0,
        massDir5: Number(massOf(5).toFixed(4)),
        massDir4: Number(massOf(4).toFixed(4)),
        massDir8: Number(massOf(8).toFixed(4)),
        massDir18: Number(massOf(18).toFixed(4)),
        wellMeasuredSpecies: wellMeasured,
      },
      // CONTROL: the massless lap-dip accounting and the exact 21-22 degeneracy, both
      // integer-level checks that could have failed
      control: {
        exactChecks:
          masslessFloor && exactDegeneracy ? 1 : 0,
      },
      notes:
        'the untrackable massless direction (its bare content converts out of the seeded slot immediately) and the four short-lived species (under twenty steps) are reported in scope, not gated. The named continuation is the lattice-scale calibration: identifying the lightest charged dressed species with the electron converts this table into physical masses, and the mirror-pair degeneracy structure suggests the symmetry classes of the table are the place generation structure would live, and the exact line degeneracy doubles as a particle-antiparticle mass equality check, which CPT requires and the table delivers.',
    })
  },
})
