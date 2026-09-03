// Two-path coherence, re-demonstrated and correctly scoped, the reframe the phase-number
// locking result required. E-FND-0140 found a dressed packet's phase cannot be steered
// without number cost, and the programme's prose briefly over-read that as an absence of
// coherence. This experiment pins the correct split with one clean measurement on the
// committed rule: ONE species, two spatially separated branches, a kick slab in one
// branch's path only.
//
//   - ALIGNED: with no kick, the joint clock amplitude is EXACTLY twice root three at one
//     hundred fifty, the branches adding as parallel complex numbers.
//   - KICKED: with the slab kicking one branch a single clock unit, the joint amplitude is
//     EXACTLY root three at ninety, the sixty-degree-cosine destructive sum of one
//     hundred fifty and thirty.
//
// So single-particle two-path interference coherence EXISTS and is exact on the substrate.
// What the locking law forbids is different and narrower: steering a composite's phase
// independently of its number. Coherence between paths, yes, exactly; independent phase
// control of a dressed composite, no. Both statements now sit in the record with their
// own experiments. Depth L2, deterministic, the aligned configuration the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'
import {
  clockAmplitude,
  phaseDegrees,
} from '@/code/measure/clock-amplitude'
import { pairSub } from '@/code/algebra/linear/complex-pair'

const SIDE = 13

export default experiment({
  id: 'foundations/two-path-coherence',
  code: 'E-FND-0142',
  title:
    'single-particle two-path coherence exists and is exact on the committed rule, correctly scoped against the locking law: two branches of one species sum to exactly twice root three at one hundred fifty when aligned and exactly root three at ninety when one branch is kicked a single clock unit, so interference coherence between paths is exact while what the phase-number locking forbids is only the independent phase steering of a dressed composite, both statements now carried by their own experiments',
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
    const mid = 6

    const wall = new Set<number>()

    for (let c = 0; c < mesh.cellCount; c++) {
      if (coordinate(c, 0) === 4) {
        wall.add(c)
      }
    }

    const run = (
      seeds: number[][],
      kick: boolean,
    ): { re: number[]; im: number[] } => {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)
      const re: number[] = []
      const im: number[] = []

      for (let t = 0; t < 18; t++) {
        if (t === 3) {
          for (const cell of seeds) {
            const slot = cellAt(cell) * 24 + 0
            const v = seeded.data[slot]!

            seeded.data[slot] = (((v + 1 + 4) % 3) - 1) as -1 | 0 | 1
          }
        }

        const active = (c: number): boolean =>
          kick && wall.has(c) ? t >= 7 : true

        vacuum = growingBeat(vacuum, rule(t), active)
        seeded = growingBeat(seeded, rule(t), active)

        const d = pairSub(clockAmplitude(seeded), clockAmplitude(vacuum))

        re.push(d[0])
        im.push(d[1])
      }

      return { re, im }
    }

    const branchA = [8, 8, 2, 2]
    const branchB = [1, 0, mid, mid]
    const aligned = run([branchA, branchB], false)
    const kicked = run([branchA, branchB], true)
    const ROOT3 = Math.sqrt(3)

    let alignedExact = 0
    let kickedExact = 0

    for (const t of [14, 15, 16, 17]) {
      const mA = Math.hypot(aligned.re[t]!, aligned.im[t]!)
      const pA = Math.round(
        phaseDegrees([aligned.re[t]!, aligned.im[t]!]),
      )

      if (Math.abs(mA - 2 * ROOT3) < 1e-9 && pA === 150) {
        alignedExact++
      }

      const mK = Math.hypot(kicked.re[t]!, kicked.im[t]!)
      const pK = Math.round(
        phaseDegrees([kicked.re[t]!, kicked.im[t]!]),
      )

      if (Math.abs(mK - ROOT3) < 1e-9 && pK === 90) {
        kickedExact++
      }
    }

    const ok = alignedExact === 4 && kickedExact === 4

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the aligned joint amplitude is exactly twice root three at one hundred fifty and the kicked joint amplitude exactly root three at ninety, at all four checked beats',
      metrics: {
        alignedExactBeats: alignedExact,
        kickedExactBeats: kickedExact,
      },
      // CONTROL: the aligned configuration, the identical instrument reading the parallel
      // sum where no phase difference exists
      control: {
        alignedControl: alignedExact === 4 ? 1 : 0,
      },
      notes:
        'this restates the interference results (E-FND-0112, E-FND-0118) in the exact configuration needed to scope the locking law (E-FND-0140), whose notes and the frontier-arcs note now carry the corrected split: coherence between paths exact, independent phase steering of composites forbidden, and the number-organized visibility floor prediction applies to the composite-steering channel specifically.',
    })
  },
})
