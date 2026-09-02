// The antiparticle of the committed rule is tone minus one, and charge conjugation is exact
// precisely where the theory needs it broken. Three measurements close the statement:
//
//   - FREE SECTOR, EXACT CONJUGATION: for a ballistic matter defect (clock couple and swap couple
//     both), the tone minus-one run's difference field is the exact slotwise mod-three negation of
//     the tone plus-one run's at every beat, and the clock amplitudes are exact conjugates, root
//     three at plus one hundred fifty degrees against root three at minus one hundred fifty.
//   - INTERACTING SECTOR, C VIOLATION: the radiating swap-wire mode is NOT conjugation-symmetric,
//     dozens of slots differ between the particle and antiparticle wakes. Charge conjugation
//     violation lives exactly in the interacting sector, matching the rule's committed CPT
//     fingerprint (CPT exact, C and CP broken) and localizing WHERE the breaking happens.
//   - PAIR ARITHMETIC: a separated particle-antiparticle pair carries net clock amplitude exactly
//     three at one hundred eighty degrees at every beat, which is exactly the complex sum of root
//     three at plus and minus one hundred fifty. Amplitudes of conjugate species add as complex
//     numbers, nothing cancels by fiat.
//
// Exclusion is structural and worth stating with the spectrum: a slot holds one tone of {-1, 0, 1},
// so two same-mode excitations cannot coexist, only a changed value. The free-sector rows are the
// controls for the C-violation row (the same instrument reads exact zero there). Depth L2 on the
// committed rule, deterministic, window-rule safe.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { lineWeave } from '@/code/rule/collision'
import { linesOf } from '@/task/palindrome-hunt'
import {
  clockAmplitude,
  phaseDegrees,
} from '@/code/measure/clock-amplitude'
import {
  ComplexPair,
  pairSub,
} from '@/code/algebra/linear/complex-pair'

const SIDE = 13
const BEATS = 12

export default experiment({
  id: 'foundations/weave-antiparticle-conjugation',
  code: 'E-FND-0115',
  title:
    'tone minus one is the exact antiparticle of the committed rule where the field is free (the antiparticle run is the exact slotwise negation of the particle run at every beat, clock amplitudes exact conjugates at plus and minus one hundred fifty degrees) and charge conjugation is violated exactly where the field interacts (the radiating swap-wire wake differs from its conjugate in dozens of slots), while a separated particle-antiparticle pair carries net amplitude exactly three at one hundred eighty degrees, the complex sum of the conjugate amplitudes',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const rule = lineWeave({ opposite })
    const lines = linesOf(opposite)
    const mid = Math.floor(SIDE / 2)
    const center =
      mid + mid * SIDE + mid * SIDE * SIDE + mid * SIDE ** 3

    const evolve = (
      seeds: [number, number, number][],
    ): { diffs: Int8Array[]; amps: ComplexPair[] } => {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      for (const [c, d, v] of seeds) {
        seeded.data[c * 24 + d] = v
      }

      const diffs: Int8Array[] = []
      const amps: ComplexPair[] = []

      for (let t = 1; t <= BEATS; t++) {
        vacuum = growingBeat(vacuum, rule, () => true)
        seeded = growingBeat(seeded, rule, () => true)

        const diff = new Int8Array(seeded.data.length)

        for (let i = 0; i < seeded.data.length; i++) {
          diff[i] = (seeded.data[i]! - vacuum.data[i]! + 3) % 3
        }

        diffs.push(diff)
        amps.push(
          pairSub(clockAmplitude(seeded), clockAmplitude(vacuum)),
        )
      }

      return { diffs, amps }
    }

    const conjugationMismatch = (dir: number): number => {
      const one = evolve([[center, dir, 1]])
      const two = evolve([[center, dir, -1]])
      let worst = 0

      for (let t = 0; t < BEATS; t++) {
        let bad = 0

        for (let i = 0; i < one.diffs[t]!.length; i++) {
          if (two.diffs[t]![i] !== (3 - one.diffs[t]![i]!) % 3) {
            bad++
          }
        }

        worst = Math.max(worst, bad)
      }

      return worst
    }

    const clockMatterMismatch = conjugationMismatch(lines[2]![0]!)
    const swapMatterMismatch = conjugationMismatch(lines[0]![0]!)
    const radiatingMismatch = conjugationMismatch(lines[3]![0]!)

    // conjugate phases on the free species
    const particle = evolve([[center, lines[2]![0]!, 1]])
    const antiparticle = evolve([[center, lines[2]![0]!, -1]])
    let phasesConjugate = true

    for (let t = 0; t < BEATS; t++) {
      const p = particle.amps[t]!
      const a = antiparticle.amps[t]!

      if (
        Math.abs(Math.hypot(p[0], p[1]) - Math.sqrt(3)) > 1e-9 ||
        Math.abs(Math.hypot(a[0], a[1]) - Math.sqrt(3)) > 1e-9 ||
        Math.round(phaseDegrees(p)) !== 150 ||
        Math.round(phaseDegrees(a)) !== -150
      ) {
        phasesConjugate = false
      }
    }

    // the separated pair: net amplitude exactly three at one hundred eighty
    const pair = evolve([
      [center, lines[2]![0]!, 1],
      [center + 4, lines[2]![0]!, -1],
    ])
    let pairExact = true

    for (let t = 0; t < BEATS; t++) {
      const p = pair.amps[t]!

      if (
        Math.abs(Math.hypot(p[0], p[1]) - 3) > 1e-9 ||
        Math.round(Math.abs(phaseDegrees(p))) !== 180
      ) {
        pairExact = false
      }
    }

    const ok =
      clockMatterMismatch === 0 &&
      swapMatterMismatch === 0 &&
      radiatingMismatch > 10 &&
      phasesConjugate &&
      pairExact

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'conjugation is exact in both free matter runs and violated by more than ten slots in the radiating interacting mode, the free phases are exact conjugates at plus and minus one hundred fifty degrees, and the pair sum is exactly three at one hundred eighty',
      metrics: {
        clockMatterMismatch,
        swapMatterMismatch,
        radiatingMismatch,
      },
      // CONTROL: the two free-sector rows, where the identical instrument reads exact zero
      control: {
        freeSectorExact:
          clockMatterMismatch === 0 && swapMatterMismatch === 0
            ? 1
            : 0,
      },
      notes:
        'C violation localizes to the interacting sector: the same conjugation test that reads exact zero on both free matter species reads dozens of differing slots on the radiating swap-wire mode. This is the committed CPT fingerprint (CPT exact, C and CP broken) pinned to WHERE the physics interacts, which is also where the weak interaction breaks it in nature.',
    })
  },
})
