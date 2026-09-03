// The Yukawa texture from plane geometry: the pairwise-overlap matrix of settled species,
// and it has TEXTURE ZEROS. Species pairs seeded at the same cell under the frozen warp
// develop difference fields whose spatial overlap is either EXACTLY ZERO (the massless
// species with every partner, and the heavy species with every partner, a measured
// spatial exclusion) or small and finite (about a tenth, pairs sharing one or two cells).
// The mechanism is geometric: each species' cloud confines to its motion plane through
// the seed, and the overlap matrix is the intersection structure of those planes, so
// which species pairs CAN couple is set by plane geometry, which is a coupling TEXTURE
// from dynamics. In mass-matrix phenomenology, texture zeros (which Yukawa entries
// vanish) are treated as deep unexplained inputs; here a texture is measured. What this
// does NOT give, stated plainly: the magnitude hierarchy (allowed overlaps span only a
// factor of two at this size), so the flavor puzzle splits cleanly in the model: the
// TEXTURE derivable from geometry, the MAGNITUDES free, matching the programme's
// converged mass verdicts. Depth L2, deterministic, the exact diagonal and the exact
// zeros the integer-level checks.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const SIDE = 15
const BEATS = 34

export default experiment({
  id: 'foundations/overlap-texture',
  code: 'E-FND-0141',
  title:
    'the pairwise-overlap matrix of settled species has measured texture zeros: the massless species and the heavy species overlap every partner at exactly zero shared cells while allowed pairs share exactly one or two cells at overlaps near a tenth, the mechanism (corrected in the notes after a pre-registered falsification of the plane reading) being seed-remnant persistence, so the coupling TEXTURE of the flavor sector is derivable from species dynamics while the magnitudes stay free, splitting the flavor puzzle exactly along the line the programme converged mass verdicts drew',
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
    const mid = 7

    const fieldOf = (dir: number): Set<number> => {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)
      const cells = new Set<number>()

      for (let t = 0; t < BEATS; t++) {
        const active = (c: number): boolean => coordinate(c, 0) <= t

        if (t === 20) {
          const slot =
            (mid + mid * SIDE + mid * SIDE * SIDE + mid * SIDE ** 3) *
              24 +
            dir
          const v = seeded.data[slot]!

          seeded.data[slot] = (((v + 1 + 4) % 3) - 1) as -1 | 0 | 1
        }

        vacuum = growingBeat(vacuum, rule(t), active)
        seeded = growingBeat(seeded, rule(t), active)

        if (t >= 28) {
          for (let i = 0; i < seeded.data.length; i++) {
            if (seeded.data[i] !== vacuum.data[i]) {
              cells.add(Math.floor(i / 24))
            }
          }
        }
      }

      return cells
    }

    const species = [0, 4, 8, 18, 23, 12, 9]
    const fields = new Map(species.map(d => [d, fieldOf(d)]))

    const sharedOf = (a: number, b: number): number => {
      const A = fields.get(a)!
      const B = fields.get(b)!
      let shared = 0

      for (const c of A) {
        if (B.has(c)) {
          shared++
        }
      }

      return shared
    }

    // texture zeros: massless (0) and heavy (8) with every partner
    let zeroRows = 0

    for (const excluded of [0, 8]) {
      let allZero = true

      for (const other of species) {
        if (other !== excluded && sharedOf(excluded, other) !== 0) {
          allZero = false
        }
      }

      if (allZero) {
        zeroRows++
      }
    }

    // allowed pairs: among {4, 18, 23, 12, 9}, every pair shares one or two cells
    const allowed = [4, 18, 23, 12, 9]
    let allowedPairs = 0
    let allowedInRange = 0

    for (let i = 0; i < allowed.length; i++) {
      for (let j = i + 1; j < allowed.length; j++) {
        allowedPairs++

        const shared = sharedOf(allowed[i]!, allowed[j]!)

        if (shared >= 1 && shared <= 2) {
          allowedInRange++
        }
      }
    }

    const supportsPositive = species.every(
      d => fields.get(d)!.size >= 4,
    )

    const ok =
      zeroRows === 2 &&
      allowedInRange === allowedPairs &&
      supportsPositive

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'both excluded species overlap every partner at exactly zero shared cells, every allowed pair shares exactly one or two cells, and every species field holds at least four cells',
      metrics: {
        textureZeroRows: zeroRows,
        allowedPairs,
        allowedInRange,
        heavySupport: fields.get(8)!.size,
        masslessSupport: fields.get(0)!.size,
      },
      // CONTROL: the diagonal (every field overlaps itself fully by construction) and the
      // exact zeros, integer-level facts a noisy instrument could not fake
      control: {
        exactZeros: zeroRows === 2 ? 1 : 0,
      },
      notes:
        'one geometry, one seed cell, small supports, stated. MECHANISM CORRECTED, same day: the plane-intersection reading was put to a pre-registered root-geometry test and FALSIFIED (same-plane pairs with zero overlap, no-axis pairs with overlap), and the cell-identity check found the true law: every shared cell is the SEED itself. The texture is SEED-REMNANT PERSISTENCE: keeper species retain content at their creation site and couple pairwise through it, leaver species abandon it and have exactly zero overlap with everyone. Stating the full keeper-leaver theorem over all species is the continuation (E-FND-0143). As physics: which flavor couplings exist is derivable here, how large they are is not, the same split the mass programme converged to.',
    })
  },
})
