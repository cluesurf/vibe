import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'

// The discrete-to-continuous bridge. The base is DISCRETE, the 24 directions of {3,4,3,4}
// have the finite symmetry F4, not the continuous rotation group SO(4). Yet at long wavelength
// the dispersion's anisotropy VANISHES, so continuous rotational symmetry is RESTORED in the
// infrared. We measure the anisotropy of the lattice dispersion as a function of the
// wavelength, and show it falls toward zero as the momentum goes to zero, faster for the 24 D4
// directions than for a coarser 8-direction cubic set. Continuity is emergent, not assumed.

const eightAxes = (): number[][] => {
  const axes: number[][] = []
  for (let index = 0; index < 4; index++) {
    for (const sign of [1, -1]) {
      const axis = [0, 0, 0, 0]
      axis[index] = sign
      axes.push(axis)
    }
  }
  return axes
}

// a deterministic, well-spread set of probe directions on the unit 3-sphere (additive recurrence,
// no random seed), used to measure how isotropic the dispersion is at a given momentum scale.
const probeDirections = (count: number): number[][] => {
  const alpha = [0.7548776662466927, 0.5698402909980532, 0.4301597090019468, 0.3247179572447458]
  const directions: number[][] = []
  for (let index = 1; index <= count; index++) {
    const raw = alpha.map((a) => ((index * a) % 1) - 0.5)
    const norm = Math.hypot(...raw)
    directions.push(raw.map((value) => value / norm))
  }
  return directions
}

const dot = (a: number[], b: number[]): number => a.reduce((sum, value, index) => sum + value * b[index]!, 0)

// the lattice dispersion on a direction set: omega(k) = sqrt(sum over directions of (1 - cos(k . dir)))
const dispersion = (wave: number[], dirs: number[][]): number =>
  Math.sqrt(dirs.reduce((sum, dir) => sum + (1 - Math.cos(dot(wave, dir))), 0))

// the anisotropy of the dispersion at a momentum scale: the spread of the speed omega/|k| over directions
const anisotropyAtScale = (scale: number, dirs: number[][], probes: number[][]): number => {
  const speeds = probes.map((probe) => dispersion(probe.map((value) => value * scale), dirs) / scale)
  const mean = speeds.reduce((sum, value) => sum + value, 0) / speeds.length
  const variance = speeds.reduce((sum, value) => sum + (value - mean) ** 2, 0) / speeds.length
  return Math.sqrt(variance) / mean
}

export default defineExperiment({
  id: 'relativity/symmetry-restoration-3434',
  title: 'discrete F4 restores to continuous rotational isotropy in the infrared on {3,4,3,4}',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const d4 = rootsD4()
    const cubic = eightAxes()
    const probes = probeDirections(600)
    const scales = [0.8, 0.4, 0.2, 0.1, 0.05]

    const d4Anisotropy = scales.map((scale) => anisotropyAtScale(scale, d4, probes))
    const cubicAnisotropy = scales.map((scale) => anisotropyAtScale(scale, cubic, probes))

    // (1) the anisotropy vanishes toward the infrared, continuous symmetry is restored
    const restoresInIR = d4Anisotropy.every((value, index) => index === 0 || value < d4Anisotropy[index - 1]!)
    const irAnisotropy = d4Anisotropy[d4Anisotropy.length - 1]!
    const uvAnisotropy = d4Anisotropy[0]!
    const irNearIsotropic = irAnisotropy < 0.02

    // (2) the 24 D4 directions restore FASTER than the 8 cubic directions (more symmetry, higher order)
    const d4BeatsCubic = d4Anisotropy.every((value, index) => value < cubicAnisotropy[index]!)

    const ok = restoresInIR && irNearIsotropic && d4BeatsCubic

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the discrete F4 symmetry of the 24 directions yields a dispersion whose anisotropy vanishes in the infrared, so continuous rotational symmetry is emergent, restored at long wavelength',
      metrics: {
        uvAnisotropy,
        irAnisotropy,
        restoresInIR: restoresInIR ? 1 : 0,
        d4BeatsCubic: d4BeatsCubic ? 1 : 0,
        ratioUvToIr: uvAnisotropy / irAnisotropy,
      },
      // CONTROL: the coarser 8-direction cubic set has LARGER anisotropy at every scale, fewer
      // directions restore continuous symmetry more slowly, so the restoration is a real property
      // of the rich 24-direction symmetry, not an artifact of the measurement.
      control: { cubicUvAnisotropy: cubicAnisotropy[0]!, cubicIrAnisotropy: cubicAnisotropy[cubicAnisotropy.length - 1]! },
      notes:
        'The base is discrete (finite F4). Continuity (the continuous rotation group) is EMERGENT in the infrared, the lattice anisotropy is a high-order ultraviolet effect that vanishes at long wavelength. This is the discrete-to-continuous bridge, measured.',
    })
  },
})
