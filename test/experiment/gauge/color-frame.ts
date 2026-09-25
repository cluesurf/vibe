// Can the color frame be chosen place by place, and how thin is the set a triality fixes. Two of
// the alternatives for color in note/experiment/gauge/what-the-base-needs.md.
//
// A twisted box: glue space with a triality twist, so a colored tone returns rotated after going
// round, and color flux is a twist. The twist is a seam nobody can see only if a triality rotation
// applied to part of space is invisible. In the coin reading a tone's color is its direction, so
// rotating color in a region also rotates where its tones move, and streaming can tell. So the
// measurable question is: rotate each cell's 24 slots by sigma on half the box, keep the cells where
// they are, and ask whether the evolution notices.
// - On the vacuum it cannot notice when every cell's vacuum state is left alone by sigma. Predicted
//   before the run: true for the triality weave, which respects sigma beat by beat and starts from
//   the empty state, false for the committed turning weave, which respects no triality. Measured as
//   the number of the 24 moments at which "rotate half, then run to beat 24" differs from "run to
//   beat 24". A first version rotated only at beat 12 and read no wall for the committed rule:
//   its vacuum is left alone by sigma on 2 of its 24 beats, and beat 12 is one of them.
// - On a dense background it notices for every rule, since rotating slots is not a symmetry of
//   streaming. Reported as the same difference. That is the finding: geometric color has a global
//   frame and no local one, so a local color gauge freedom needs color carried apart from
//   direction (a color trit, E-FRC-0100).
//
// The fixed set: a rule that is the same in every cell and symmetric about one point is symmetric
// about every point, since moving the center is a translation. So escaping E-FRC-0112 by keeping the
// triality only where it fixes cells means a rule that differs from place to place. How thin that
// place is: the cells the triality fixes, on boxes of side 5, 7 and 9.
//
// The glide weave (E-FRC-0114) is measured beside the other two, with the same instruments.
//
// Depth L2: symmetry measurements of constructed rules.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { meshOpposites } from '@/code/tool/mesh'
import { turningWeave, type Collision } from '@/code/rule/collision'
import {
  colorTriality,
  trialityWeave,
  trialityWeaveLayout,
} from '@/code/rule/triality-weave'
import { glideWeave } from '@/code/rule/glide-weave'
import { beat } from '@/code/rule/lattice-gas'
import { makeWill, type Will } from '@/code/tone/will'
import {
  boxCellMap,
  d4BoxCoordinates,
  d4BoxMesh,
  linearMapOf,
} from '@/code/substrate/d4-box'

const SIDE = 5
const GOLDEN = (Math.sqrt(5) - 1) / 2

export default experiment({
  id: 'gauge/color-frame',
  code: 'E-FRC-0115',
  title:
    'geometric color has one global frame and no local one: rotating the color of half the box is invisible on the triality weave vacuum and a visible wall on the committed rule vacuum, and visible for every rule on a dense background, and the cells a color triality fixes are a thin sheet',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const box = d4BoxMesh({ side: SIDE })
    const opposite = meshOpposites(box)
    const sigma = colorTriality({ opposite })
    const layout = trialityWeaveLayout({ opposite, triality: sigma })
    const rules: [string, (t: number) => Collision][] = [
      ['committed', turningWeave({ opposite: [...opposite] })],
      ['triality', trialityWeave({ layout })],
      ['glide', glideWeave({ layout })],
    ]
    const inHalf = (cell: number): boolean =>
      (d4BoxCoordinates({ cell, side: SIDE })[0] ?? 0) < (SIDE - 1) / 2

    // rotate every cell's slots by sigma, in the half only, cells stay put
    const rotateHalf = (data: Int8Array): Int8Array => {
      const out = Int8Array.from(data)

      for (let cell = 0; cell < box.cellCount; cell++) {
        if (!inHalf(cell)) {
          continue
        }

        for (let d = 0; d < 24; d++) {
          out[cell * 24 + (sigma[d] ?? 0)] = data[cell * 24 + d] ?? 0
        }
      }

      return out
    }

    const run = (
      rule: (t: number) => Collision,
      start: Will,
      from: number,
      to: number,
    ): Will => {
      let w: Will = { mesh: box, data: Int8Array.from(start.data) }

      for (let t = from; t < to; t++) {
        w = beat(w, rule(t))
      }

      return w
    }

    const count = (a: Int8Array, b: Int8Array): number =>
      a.reduce((sum, x, i) => sum + (x === b[i] ? 0 : 1), 0)

    const denseStart = (): Will => {
      const will = makeWill(box)

      for (let i = 0; i < will.data.length; i++) {
        const u = ((i + 1) * GOLDEN * 1.37) % 1

        will.data[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
      }

      return will
    }

    const seam = rules.map(([name, rule]) => {
      // the vacuum: is each cell's state left alone by sigma at every beat
      let vacuum: Will = makeWill(box)
      let vacuumFixedBeats = 0

      for (let t = 0; t < 24; t++) {
        vacuum = beat(vacuum, rule(t))

        const cell = vacuum.data.subarray(0, 24)

        vacuumFixedBeats += sigma.every(
          (image, d) => cell[image] === cell[d],
        )
          ? 1
          : 0
      }

      // rotate half at every beat of the period, run to beat 24, count the moments that leave a wall
      let vacuumWallBeats = 0
      let vacuumWall = 0

      for (let at = 0; at < 24; at++) {
        const vacuumAt = run(rule, makeWill(box), 0, at)
        const wall = count(
          run(
            rule,
            { mesh: box, data: rotateHalf(vacuumAt.data) },
            at,
            24,
          ).data,
          run(rule, vacuumAt, at, 24).data,
        )

        vacuumWallBeats += wall > 0 ? 1 : 0
        vacuumWall = Math.max(vacuumWall, wall)
      }

      const denseAt12 = run(rule, denseStart(), 0, 12)
      const denseWall = count(
        run(
          rule,
          { mesh: box, data: rotateHalf(denseAt12.data) },
          12,
          24,
        ).data,
        rotateHalf(run(rule, denseAt12, 12, 24).data),
      )

      return {
        name,
        vacuumFixedBeats,
        vacuumWallBeats,
        vacuumWall,
        denseWall,
      }
    })

    // the cells the triality fixes
    const matrix = linearMapOf(sigma)
    const fixedCells = [5, 7, 9].map(side => {
      const map =
        matrix === undefined ? undefined : boxCellMap({ matrix, side })

      return {
        side,
        fixed:
          map === undefined
            ? -1
            : map.filter((image, x) => image === x).length,
        cells: side ** 4,
      }
    })

    const byName = (name: string): (typeof seam)[number] | undefined =>
      seam.find(s => s.name === name)
    const ok =
      byName('triality')?.vacuumWallBeats === 0 &&
      (byName('committed')?.vacuumWallBeats ?? 0) > 0 &&
      seam.every(s => s.denseWall > 0) &&
      fixedCells.every(f => f.fixed > 0 && f.fixed < f.cells)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'rotating the slots of half the box by the color triality leaves the triality weave vacuum unchanged and makes a wall in the committed rule vacuum, is visible on a dense background for every rule measured, and the triality fixes a thin set of cells',
      metrics: {
        ...Object.fromEntries(
          seam.flatMap(s => [
            [`${s.name}VacuumFixedBeats`, s.vacuumFixedBeats],
            [`${s.name}VacuumWallBeats`, s.vacuumWallBeats],
            [`${s.name}VacuumWallMax`, s.vacuumWall],
            [`${s.name}DenseWall`, s.denseWall],
          ]),
        ),
        ...Object.fromEntries(
          fixedCells.map(f => [`fixedCellsSide${f.side}`, f.fixed]),
        ),
      },
      control: {
        slots: box.cellCount * 24,
        ...Object.fromEntries(
          fixedCells.map(f => [`cellsSide${f.side}`, f.cells]),
        ),
      },
      notes:
        'L2, exact, no random numbers. The dense comparison is rotate-then-run against run-then-rotate, over 12 beats. The vacuum comparison is rotate-then-run against run, since a vacuum left alone by sigma is its own rotation. The fixed cells are the box points sigma sends to themselves, the lattice points of its fixed plane.',
    })
  },
})
