// The Born discriminator: is the substrate detector quadratic or counting, tested with
// phase-CONTROLLED configurations on the adopted rule. Co-moving defect pairs are prepared
// with aligned phases (both tone plus one: net clock amplitude twice root three) and with
// conjugate phases (plus one and minus one: net amplitude three at one hundred eighty, a
// smaller wave), and both hit the same offset-slab detector. A quadratic detector reads the
// squared net amplitude and must tell them apart (twelve against nine). A counting detector
// reads the number of excitations and must NOT. The measurement is exact and unambiguous:
//
//   - the solo baselines respond identically for particle and antiparticle (five each),
//   - the aligned pair responds at EXACTLY twice solo (ten),
//   - the conjugate pair responds at EXACTLY the same ten, phase-blind to the slot,
//   - four defects respond at exactly twenty whether all aligned or two plus two conjugate,
//     while the prepared net amplitudes verify the phases really differed (six point nine
//     against six point zero).
//
// So at the substrate level the Born weight is NOT quadratic: detection weighs by NUMBER.
// This extends the counting law (E-FND-0119) and the step-not-weight canon to
// phase-superposed configurations under the committed rule, and it is the coarse-bridge
// programme's boundary condition: if the quadratic weight of observed quantum mechanics
// emerges anywhere in this model, it must emerge from coarse dynamics and statistics, not
// from the detector, which is measured here to be exactly phase-blind. Depth L2,
// deterministic, the amplitude verification the control that the phases genuinely differed.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'
import { clockAmplitude } from '@/code/measure/clock-amplitude'
import { pairSub } from '@/code/algebra/linear/complex-pair'

const SIDE = 13

export default experiment({
  id: 'foundations/born-discriminator',
  code: 'E-FND-0123',
  title:
    'the substrate detector is exactly phase-blind counting, measured with phase-controlled configurations on the adopted rule: conjugate-phase defect pairs whose net clock amplitude is verifiably smaller than the aligned pairs (three against twice root three, six against six point nine at four defects) produce EXACTLY the same slab response as the aligned ones (ten and twenty, exact multiples of the solo baseline), so the Born weight is not quadratic at the substrate and the coarse-bridge programme inherits its boundary condition: the observed squared-amplitude rule must emerge from coarse dynamics and statistics or not at all, never from detection',
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

    const slab = new Set<number>()

    for (let c = 0; c < mesh.cellCount; c++) {
      const x = coordinate(c, 0)

      if (x >= 4 && x <= 6) {
        slab.add(c)
      }
    }

    const respond = (
      seeds: [number, number, number][],
    ): { max: number; amplitude: number } => {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)
      let max = 0
      let amplitude = 0

      for (let t = 0; t < 22; t++) {
        if (t === 3) {
          for (const [c, d, v] of seeds) {
            seeded.data[c * 24 + d] = v
          }
        }

        const active = (c: number): boolean =>
          slab.has(c) ? t >= 2 : true

        vacuum = growingBeat(vacuum, rule(t), active)
        seeded = growingBeat(seeded, rule(t), active)

        let support = 0

        for (let i = 0; i < seeded.data.length; i++) {
          if (seeded.data[i] !== vacuum.data[i]) {
            support++
          }
        }

        max = Math.max(max, support)

        if (t === 4) {
          const d = pairSub(
            clockAmplitude(seeded),
            clockAmplitude(vacuum),
          )

          amplitude = Math.hypot(d[0], d[1])
        }
      }

      return { max, amplitude }
    }

    const a = cellAt([1, 2, 2, 2])
    const b = cellAt([1, 3, 3, 2])
    const c1 = cellAt([1, 5, 5, 2])
    const d1 = cellAt([1, 6, 6, 2])

    const solo = respond([[a, 0, 1]])
    const soloMinus = respond([[a, 0, -1]])
    const aligned = respond([
      [a, 0, 1],
      [b, 0, 1],
    ])
    const conjugate = respond([
      [a, 0, 1],
      [b, 0, -1],
    ])
    const fourAligned = respond([
      [a, 0, 1],
      [b, 0, 1],
      [c1, 0, 1],
      [d1, 0, 1],
    ])
    const twoPlusTwo = respond([
      [a, 0, 1],
      [b, 0, 1],
      [c1, 0, -1],
      [d1, 0, -1],
    ])

    const ROOT3 = Math.sqrt(3)
    const phasesDiffered =
      Math.abs(aligned.amplitude - 2 * ROOT3) < 1e-9 &&
      Math.abs(conjugate.amplitude - 3) < 1e-9 &&
      Math.abs(fourAligned.amplitude - 4 * ROOT3) < 1e-9 &&
      Math.abs(twoPlusTwo.amplitude - 6) < 1e-9

    const ok =
      solo.max === soloMinus.max &&
      solo.max >= 3 &&
      aligned.max === 2 * solo.max &&
      conjugate.max === aligned.max &&
      fourAligned.max === 4 * solo.max &&
      twoPlusTwo.max === fourAligned.max &&
      phasesDiffered

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'particle and antiparticle baselines respond identically, pairs respond at exactly twice and quadruples at exactly four times the baseline regardless of phase composition, and the prepared amplitudes verify the aligned and conjugate configurations genuinely differed',
      metrics: {
        soloResponse: solo.max,
        alignedPairResponse: aligned.max,
        conjugatePairResponse: conjugate.max,
        fourAlignedResponse: fourAligned.max,
        twoPlusTwoResponse: twoPlusTwo.max,
        alignedAmplitude: Number(aligned.amplitude.toFixed(3)),
        conjugateAmplitude: Number(conjugate.amplitude.toFixed(3)),
      },
      // CONTROL: the amplitude verification, proving the phase preparation was real while
      // the detector could not see it
      control: {
        phasesVerifiablyDiffered: phasesDiffered ? 1 : 0,
      },
      notes:
        'a quadratic detector would read the conjugate pair at three quarters of the aligned one (nine against twelve in squared-amplitude units) and the two-plus-two quadruple lower still. The measured equality at exact integer multiples of the baseline is the counting law extended to phase-superposed configurations. The coarse-bridge question is now sharp: derive whether coarse statistics over many such counting events reproduces the observed squared-amplitude weighting, and if it cannot, the model predicts amplitude-independent counting signatures at scale, the quantum-computing stake in the predictions folder.',
    })
  },
})
