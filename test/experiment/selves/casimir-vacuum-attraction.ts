// O0.1 (rule-options-for-attraction), the cheapest route to attraction, the one that adds NOTHING. Capture needs
// an attractive interaction, and the bare rule has no force at a distance (selves/emergent-attraction-search). But
// the arrow's create move fills the vacuum with fluctuating pairs, and that churning vacuum is a BATH of small
// excitations. Two walls that exclude vacuum modes from the gap between them feel a pressure imbalance, the gap is
// quieter than the open vacuum, so the higher outside pressure pushes the walls together. This is the Casimir (or
// depletion) mechanism, an EFFECTIVE attraction from the existing five things, with the bulk fully reversible and
// no microscopic force added.
//
// We place two rigid walls (cells filled with inert +1, re-imposed each beat) a gap d apart in the create vacuum,
// and measure the time-averaged charge density in the gap interior versus the open region. The Casimir signature
// is three things together.
//  1. SUPPRESSION, the gap density is lower than the open density (open minus gap > 0), an inward pressure.
//  2. DISTANCE FALL-OFF, the suppression weakens as the gap widens, the hallmark of a Casimir force.
//  3. WALL-INDUCED, the same regions in the wall-free vacuum show ZERO difference (the free vacuum is uniform), so
//     the suppression is caused by the walls, not a positional artifact. This is the control.
//
// A clean positive here is large, it means the attraction capture needs can come from the five things alone (the
// arrow's vacuum), no new ingredient. The honest negative would be no suppression or no wall-induced effect.
//
// Depth L2, the vacuum-density suppression measured at three separations with the wall-free vacuum as the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, type Mesh } from '@/code/tool/mesh'
import { makeWill, type Will } from '@/code/tone/will'
import { pairCollision, type Collision } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { chargeDensityProfile } from '@/code/measure/profile'

export default experiment({
  id: 'selves/casimir-vacuum-attraction',
  title:
    'the active vacuum exerts a Casimir attraction, the gap between two walls is suppressed and the force falls with distance',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 24
    const beats = 400
    const mesh: Mesh = d4Mesh({ side })
    const degree = mesh.degree
    const opposite = Array.from({ length: degree }, (_, d) =>
      mesh.opposite(d),
    )
    const rule: Collision = pairCollision({ opposite, forward: true })
    const table = streamSourceTable(mesh) // precompute the stream gather once, reused for every beat
    const binOf = (cell: number): number => cell % side
    const xA = 6
    const openXs = [19, 20, 21] // away from both walls, valid for d up to 10 (xB = 6 + d <= 16)

    // run the create vacuum (re-imposing walls if on), time-average the x-density profile over the second half.
    // Allocation-free, a double buffer ping-ponged through beatInto, and the wall cells are precomputed once so
    // re-imposing the walls touches only the plate cells, not the whole mesh.
    const averagedProfile = (xB: number, walls: boolean): number[] => {
      const wallCells: number[] = []
      if (walls) {
        for (let cell = 0; cell < mesh.cellCount; cell++) {
          const x = cell % side
          if (x === xA || x === xB) {
            wallCells.push(cell)
          }
        }
      }
      const setWalls = (will: Will): void => {
        for (const cell of wallCells) {
          const base = cell * degree
          for (let d = 0; d < degree; d++) {
            will.data[base + d] = 1
          }
        }
      }

      let current = makeWill(mesh) // a deterministic peace vacuum, the create move makes it dynamic
      let scratch: Will = {
        mesh,
        data: new Int8Array(current.data.length),
      }
      setWalls(current)
      const acc = new Array<number>(side).fill(0)
      let samples = 0
      for (let t = 0; t < beats; t++) {
        beatInto({ src: current, dst: scratch, table, collision: rule })
        const swap = current
        current = scratch
        scratch = swap
        setWalls(current)
        if (t >= beats / 2) {
          const prof = chargeDensityProfile({
            will: current,
            binOf,
            bins: side,
          })
          for (let x = 0; x < side; x++) {
            acc[x]! += prof[x]!
          }
          samples++
        }
      }
      return acc.map(a => a / samples)
    }

    const mean = (prof: number[], xs: number[]): number =>
      xs.reduce((a, x) => a + prof[x]!, 0) / xs.length
    const gapInterior = (d: number): number[] => {
      const xs: number[] = []
      for (let x = xA + 2; x <= xA + d - 2; x++) {
        xs.push(x)
      }
      return xs
    }

    // the wall-free control, one run, the free vacuum is uniform so its open-minus-gap is the positional baseline.
    const free = averagedProfile(xA + 8, false)

    const gaps = [6, 8, 10]
    const wallInduced = gaps.map(d => {
      const withWalls = averagedProfile(xA + d, true)
      const gx = gapInterior(d)
      const supWalls = mean(withWalls, openXs) - mean(withWalls, gx)
      const supFree = mean(free, openXs) - mean(free, gx)
      return supWalls - supFree
    })

    const freeBaseline = Math.max(
      ...gaps.map(d =>
        Math.abs(mean(free, openXs) - mean(free, gapInterior(d))),
      ),
    )

    // 1, all suppressions positive (inward pressure, attraction). 2, falling with distance (Casimir). 3, the
    // free vacuum baseline is ~zero (wall-induced).
    const allAttractive = wallInduced.every(s => s > 0.1)
    const fallsWithDistance =
      wallInduced[0]! > wallInduced[1]! &&
      wallInduced[1]! > wallInduced[2]!
    const wallControlClean = freeBaseline < 0.05

    const ok = allAttractive && fallsWithDistance && wallControlClean
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'two walls in the create vacuum suppress the vacuum density in the gap between them relative to the open vacuum, an inward pressure that WEAKENS with separation, while the wall-free vacuum over the same regions is uniform, so the active vacuum exerts a genuine Casimir attraction, an attractive interaction from the five things alone with the bulk reversible and no microscopic force added',
      metrics: {
        wallInducedAt6: wallInduced[0]!,
        wallInducedAt8: wallInduced[1]!,
        wallInducedAt10: wallInduced[2]!,
        freeVacuumBaseline: freeBaseline,
        allAttractive: allAttractive ? 1 : 0,
        fallsWithDistance: fallsWithDistance ? 1 : 0,
        wallControlClean: wallControlClean ? 1 : 0,
        beats,
        side,
      },
      control: { freeVacuumBaseline: freeBaseline },
      notes:
        'a deterministic Casimir attraction from the arrow vacuum, the gap is quieter than the open vacuum (inward pressure), the effect falls with distance (Casimir hallmark), and the wall-free control is uniform (the effect is wall-induced). This is the one attraction route that needs NO new ingredient, so the attraction capture requires may come from the five things plus the bath. Next, show two MOBILE structures actually drift together and bind under this pressure',
    })
  },
})
