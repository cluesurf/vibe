import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { dispersionAnisotropyAtScale } from '@/code/measure/dispersion'
import {
  coordinateAxes,
  probeDirections,
} from '@/code/measure/probe-directions'

// The discrete-to-continuous bridge. The base is DISCRETE, the 24 directions of {3,4,3,4}
// have the finite symmetry F4, not the continuous rotation group SO(4). Yet at long wavelength
// the dispersion's anisotropy VANISHES, so continuous rotational symmetry is RESTORED in the
// infrared. We measure the anisotropy of the lattice dispersion as a function of the
// wavelength, and show it falls toward zero as the momentum goes to zero, faster for the 24 D4
// directions than for a coarser 8-direction cubic set. Continuity is emergent, not assumed.

const anisotropyAtScale = (
  scale: number,
  dirs: number[][],
  probes: number[][],
): number =>
  dispersionAnisotropyAtScale({ directions: dirs, probes, scale })

export default experiment({
  id: 'relativity/symmetry-restoration-3434',
  title:
    'discrete F4 restores to continuous rotational isotropy in the infrared on {3,4,3,4}',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const d4 = rootsD4()
    const cubic = coordinateAxes(4)
    const probes = probeDirections({ count: 600, dimension: 4 })
    const scales = [0.8, 0.4, 0.2, 0.1, 0.05]

    const d4Anisotropy = scales.map(scale =>
      anisotropyAtScale(scale, d4, probes),
    )

    const cubicAnisotropy = scales.map(scale =>
      anisotropyAtScale(scale, cubic, probes),
    )

    // (1) the anisotropy vanishes toward the infrared, continuous symmetry is restored
    const restoresInIR = d4Anisotropy.every(
      (value, index) => index === 0 || value < d4Anisotropy[index - 1]!,
    )

    const irAnisotropy = d4Anisotropy[d4Anisotropy.length - 1]!
    const uvAnisotropy = d4Anisotropy[0]!
    const irNearIsotropic = irAnisotropy < 0.02

    // (2) the 24 D4 directions restore FASTER than the 8 cubic directions (more symmetry, higher order)
    const d4BeatsCubic = d4Anisotropy.every(
      (value, index) => value < cubicAnisotropy[index]!,
    )

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
      control: {
        cubicUvAnisotropy: cubicAnisotropy[0]!,
        cubicIrAnisotropy: cubicAnisotropy[cubicAnisotropy.length - 1]!,
      },
      notes:
        'The base is discrete (finite F4). Continuity (the continuous rotation group) is EMERGENT in the infrared, the lattice anisotropy is a high-order ultraviolet effect that vanishes at long wavelength. This is the discrete-to-continuous bridge, measured.',
    })
  },
})
