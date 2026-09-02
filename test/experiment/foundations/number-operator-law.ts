// The number-operator law: the substrate detector reads excitation NUMBER exactly linearly
// and exactly phase-blind, at every tested occupancy. N co-moving defects on parallel lanes
// (N from two to ten), prepared either all-aligned (net amplitude root three times N) or
// phase-balanced (net amplitude three halves times N, verifiably smaller), produce a slab
// response of EXACTLY five N in every case. The detector is the number operator of this
// field theory, which is also what a laboratory photodetector is: photon counters are
// phase-insensitive too, and the Born statistics of real experiments appear only when an
// interferometer first converts phase differences into number differences at its output
// ports. That conversion is therefore the coarse bridge's remaining load-bearing question,
// stated sharply by this measurement: at the bare two-defect level the model's branches
// superpose without redistributing each other (exact superposition, E-FND-0117), so port
// redistribution must arise, if it arises, in the DRESSED many-defect sector, and deriving
// or refuting it there decides the Born question and the quantum-computing stake. Depth L2,
// deterministic, the amplitude verification the control that the preparations differed.

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
  id: 'foundations/number-operator-law',
  code: 'E-FND-0124',
  title:
    'the substrate detector is the number operator: N co-moving defects produce a slab response of exactly five N at every occupancy from two to ten, identically for all-aligned and phase-balanced preparations whose net amplitudes verifiably differ (root three N against three halves N), so detection is exactly linear in number and exactly blind to phase, the same character as a laboratory photon counter, and the coarse-bridge question sharpens to whether the dressed sector converts phase differences into number differences the way an interferometer port does, which is now the single load-bearing derivation between the model and the Born rule',
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

    const lanes: number[] = []

    for (let y = 2; y <= 11; y++) {
      lanes.push(cellAt([1, y, (y * 3) % SIDE, 2]))
    }

    const solo = respond([[lanes[0]!, 0, 1]])
    const ROOT3 = Math.sqrt(3)
    let linearExact = true
    let phaseBlind = true
    let amplitudesVerified = true
    const responses: number[] = []

    for (const N of [2, 4, 6, 8, 10]) {
      const aligned: [number, number, number][] = []
      const balanced: [number, number, number][] = []

      for (let i = 0; i < N; i++) {
        aligned.push([lanes[i]!, 0, 1])
        balanced.push([lanes[i]!, 0, i % 2 === 0 ? 1 : -1])
      }

      const ra = respond(aligned)
      const rb = respond(balanced)

      responses.push(ra.max)

      if (ra.max !== N * solo.max || rb.max !== N * solo.max) {
        linearExact = false
      }

      if (ra.max !== rb.max) {
        phaseBlind = false
      }

      if (
        Math.abs(ra.amplitude - ROOT3 * N) > 1e-9 ||
        Math.abs(rb.amplitude - 1.5 * N) > 1e-9
      ) {
        amplitudesVerified = false
      }
    }

    const ok =
      solo.max >= 3 && linearExact && phaseBlind && amplitudesVerified

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the response is exactly N times the solo baseline at every occupancy for both preparations, aligned and balanced responses are identical, and the prepared amplitudes verify as root three N and three halves N',
      metrics: {
        soloResponse: solo.max,
        responseAtTen: responses[4]!,
        linearExact: linearExact ? 1 : 0,
        phaseBlind: phaseBlind ? 1 : 0,
      },
      // CONTROL: the amplitude verification, the preparations genuinely differed while the
      // detector could not tell
      control: {
        amplitudesVerified: amplitudesVerified ? 1 : 0,
      },
      notes:
        'together with E-FND-0123 this closes the substrate half of the Born question: detection weighs by number, exactly and always. The remaining half is the interferometer half, whether the dressed sector converts phase to number the way output ports do, and that single derivation now stands between the model and the observed quantum statistics. Either outcome is decisive: derivation reproduces the Born rule from counting, refutation predicts number-organized deviations at scale (the quantum-computing stake in note/prediction/intelligence.md).',
    })
  },
})
