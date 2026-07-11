// Soft radiation WITHOUT real numbers. The per-cell test showed that ternary is too coarse for a soft mode at the
// single-cell level (the smallest excitation is order-1). But softness does not mean small AMPLITUDE, it means
// long WAVELENGTH. A soft mode is a low-frequency COLLECTIVE excitation of many cells, each still order-1. This is
// how real discrete matter works, atoms are discrete yet solids carry soft sound, and Boolean lattice gases
// recover fluid dynamics in the coarse-grained limit.
//
// Here we MEASURE it on the committed {3,4,3,4} substrate. We prepare a coarse-grained charge-density wave of
// wavelength lambda (deterministic, zero net momentum) and watch its contrast oscillate as the momentum-conserving
// gas evolves. The half-period (time to the first minimum) grows LINEARLY with lambda at constant speed, which is
// omega = c * k, a gapless linear dispersion. That is sound, a soft acoustic mode, emergent from discrete ternary
// tones with no real or decimal values anywhere (the wave is built and read by counting).
//
// This is the radiation channel the corrective self needs. The self's identity is base (a topological charge), and
// its agency (radiating a disturbance to the bath) rides on THIS emergent soft mode, the long-wavelength net part
// of a disturbance leaves as sound while the short-wavelength part thermalizes. So the emergent self is consistent
// with a fully discrete base.
//
// Depth L2, an emergent collective property, the soft (gapless) sound mode of the discrete conserving gas.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, type Mesh } from '@/code/tool/mesh'
import { type Will } from '@/code/tone/will'
import { headOnRotate, type Collision } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import {
  coinLines,
  densityWaveAlongAxis,
  stripeContrast,
  firstMinimumTime,
} from '@/code/measure/sound-wave'

export default experiment({
  id: 'selves/emergent-soft-radiation',
  code: 'E-SLF-0045',
  title:
    'a soft (gapless) sound mode emerges from discrete ternary tones: period grows linearly with wavelength, no real numbers',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 12
    const beats = 120
    const mesh: Mesh = d4Mesh({ side })
    const degree = mesh.degree
    const opposite = Array.from({ length: degree }, (_, d) =>
      mesh.opposite(d),
    )

    const rule: Collision = headOnRotate({ opposite })
    const lines = coinLines(opposite)
    const axisOf = (cell: number): number => cell % side
    const table = streamSourceTable(mesh) // precompute the stream gather once, reused for every beat

    const wavelengths = [2, 4, 6, 12]

    // for each wavelength, evolve the density wave and read the half-period (time to first contrast minimum).
    const halfPeriod = (lambda: number): number => {
      let current: Will = densityWaveAlongAxis({
        mesh,
        lambda,
        axisOf,
        highTarget: 9,
        lowTarget: 3,
        lines,
      })

      let scratch: Will = {
        mesh,
        data: new Int8Array(current.data.length),
      }

      const trace: number[] = [
        stripeContrast({ will: current, lambda, axisOf, bins: side }),
      ]

      for (let t = 1; t <= beats; t++) {
        beatInto({ src: current, dst: scratch, table, collision: rule })

        const swap = current

        current = scratch
        scratch = swap
        trace.push(
          stripeContrast({ will: current, lambda, axisOf, bins: side }),
        )
      }

      return firstMinimumTime(trace)
    }

    const periods = wavelengths.map(halfPeriod)
    // speed = lambda / (2 * halfPeriod), constant across wavelengths for a linear (gapless) dispersion.
    const speeds = wavelengths.map((lambda, i) =>
      periods[i]! > 0 ? lambda / (2 * periods[i]!) : 0,
    )

    // the half-period grows with wavelength (the mode is soft, lower frequency at longer wavelength).
    let monotonic = true

    for (let i = 1; i < periods.length; i++) {
      if (periods[i]! < periods[i - 1]!) monotonic = false
    }

    // the speed is constant (a LINEAR, gapless dispersion omega = c k, the hallmark of sound), within a tight band.
    const meanSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length

    let maxSpeedDeviation = 0

    for (const s of speeds) {
      maxSpeedDeviation = Math.max(
        maxSpeedDeviation,
        Math.abs(s - meanSpeed),
      )
    }

    const linearGapless =
      meanSpeed > 0 && maxSpeedDeviation <= meanSpeed * 0.2

    // softness, the longest wavelength is much slower than the shortest (frequency falls toward zero with k).
    const soft = periods[periods.length - 1]! >= periods[0]! * 3

    const ok = monotonic && linearGapless && soft

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a soft radiation field emerges from discrete ternary tones with no real numbers, a coarse-grained charge-density wave on the {3,4,3,4} substrate oscillates as a propagating sound wave whose half-period grows LINEARLY with wavelength at a constant speed, which is the gapless linear dispersion omega equals c times k, so the soft mode is not a small per-cell amplitude (impossible with three tone values) but a long-wavelength collective mode of many tones, exactly as sound exists in discrete-atom matter, this is the emergent radiation channel the corrective self rides on',
      metrics: {
        wavelength2: periods[0]!,
        wavelength4: periods[1]!,
        wavelength6: periods[2]!,
        wavelength12: periods[3]!,
        meanSpeedTimes100: Math.round(meanSpeed * 100),
        maxSpeedDeviationTimes100: Math.round(maxSpeedDeviation * 100),
        monotonic: monotonic ? 1 : 0,
        linearGapless: linearGapless ? 1 : 0,
        soft: soft ? 1 : 0,
        beats,
      },
      control: {
        wavelength2HalfPeriod: periods[0]!,
        wavelength12HalfPeriod: periods[3]!,
      },
      notes:
        'the resolution of the per-cell coarseness obstruction. Softness is long WAVELENGTH, not small amplitude. The emergent sound mode is gapless (linear dispersion, constant speed), built and measured by counting, no real or decimal base values. This is the discrete-matter answer (Boolean lattice gases recover fluid dynamics and sound), and it is the radiation channel for the emergent self, identity is base (topological), agency rides on this emergent soft mode',
    })
  },
})
