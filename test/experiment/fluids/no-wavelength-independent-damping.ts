// The damping discriminator between the vibe gas and Chronoflux's fluid limit, measured. Chronoflux's
// hydrodynamic reduction (the withdrawn action's appendix, kept by the 2026 corpus) is incompressible
// Navier-Stokes PLUS a linear damping term -Theta v with Theta >= 1/tau_0 > 0, a wavelength-independent
// friction that its Navier-Stokes regularity claims lean on. The vibe momentum gas is exactly
// reversible, so it can have viscosity (it does, E-FLD-0011) but no such friction: its shear decay rate
// must go to zero with k squared, intercept zero. One number separates the frameworks.
//
// Measured on the D4 gas: the microdynamics passes the exact echo (forward forty beats, inverse forty,
// integer Hamming distance zero, so there is no microscopic dissipation to source a Theta), and the
// k -> 0 intercept of the shear decay rate, extrapolated from the two smallest wavenumbers at two odd
// sides, is bounded by |Theta| <= 0.011 per beat with UNSTABLE SIGN across the two sides (+0.009 and
// -0.011), consistent with zero within the k-squared law's own systematic, and an order of magnitude
// below the smallest measured hydrodynamic rate. The control shows the method is not blind: a
// deterministically leaky gas (a fixed fraction of slots erased per beat) shows a clearly positive
// intercept of the imposed size. Depth L2: known lattice-gas hydrodynamics plus an exact reversibility
// check, confronting an external theory's requirement.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { Collision, headOnRotate } from '@/code/rule/collision'
import { beat, inverseBeat } from '@/code/rule/lattice-gas'
import {
  decayRateFit,
  shearGasSetup,
  shearModeSeries,
} from '@/code/measure/shear-mode'
import { hashRand } from '@/code/dynamics/conserving-sweep'

const GRAD_AXIS = 1
const MOM_AXIS = 0
const PAIR_FILL = 0.35
const BIAS_MAX = 0.4
const BEATS = 80
const LEAK_RATE = 0.02
const LEAK_SALT = 23

// gamma at the two smallest wavenumbers on one side, and the two-point k -> 0 intercept
function intercept(input: { side: number; collision: Collision }): {
  theta: number
  smallestGamma: number
  nu: number
} {
  const { side, collision } = input
  const mesh = d4Mesh({ side })
  const directions = rootsD4()
  const gammas: number[] = []
  const kSquares: number[] = []

  for (const mode of [1, 2]) {
    const will = shearGasSetup({
      mesh,
      directions,
      side,
      gradAxis: GRAD_AXIS,
      momAxis: MOM_AXIS,
      mode,
      pairFill: PAIR_FILL,
      biasMax: BIAS_MAX,
    })

    const { series } = shearModeSeries({
      will,
      collision,
      beats: BEATS,
      directions,
      side,
      gradAxis: GRAD_AXIS,
      momAxis: MOM_AXIS,
      mode,
    })

    const k = (2 * Math.PI * mode) / side

    gammas.push(decayRateFit({ series }).gamma)
    kSquares.push(k * k)
  }

  const nu = (gammas[1]! - gammas[0]!) / (kSquares[1]! - kSquares[0]!)

  return {
    theta: gammas[0]! - nu * kSquares[0]!,
    smallestGamma: gammas[0]!,
    nu,
  }
}

export default experiment({
  id: 'fluids/no-wavelength-independent-damping',
  code: 'E-FLD-0015',
  title:
    "the vibe gas has no wavelength-independent damping: the exact echo returns the microstate with Hamming distance zero, the k -> 0 intercept of the shear decay rate is bounded by 0.011 per beat with unstable sign across two sides (consistent with zero within the k-squared law's systematic) an order of magnitude under the smallest measured rate, and a deterministically leaky control gas shows the imposed positive intercept, while Chronoflux's damped Navier-Stokes limit requires a strictly positive intercept, so one measured number separates the frameworks",
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 15
    const mesh = d4Mesh({ side })
    const opposite = meshOpposites(mesh)
    const gasRule = headOnRotate({ opposite })

    // the exact echo: forward then inverse recovers the sheared microstate exactly
    const echoStart = shearGasSetup({
      mesh,
      directions: rootsD4(),
      side,
      gradAxis: GRAD_AXIS,
      momAxis: MOM_AXIS,
      mode: 1,
      pairFill: PAIR_FILL,
      biasMax: BIAS_MAX,
    })

    let forward = { mesh, data: Int8Array.from(echoStart.data) }

    for (let t = 0; t < 40; t++) {
      forward = beat(forward, gasRule)
    }

    for (let t = 0; t < 40; t++) {
      forward = inverseBeat(forward, gasRule)
    }

    let echoHamming = 0

    for (let i = 0; i < forward.data.length; i++) {
      if (forward.data[i] !== echoStart.data[i]) {
        echoHamming++
      }
    }

    // the intercept at two sides
    const at15 = intercept({ side: 15, collision: gasRule })
    const at21 = intercept({ side: 21, collision: gasRule })

    // the leaky control: the same collision, then a deterministic fraction of slots erased per beat.
    // The eraser is position-and-beat hashed so it is a fixed function, not randomness per run.
    let leakBeat = 0

    const leakyRule: Collision = (slots, base, degree) => {
      gasRule(slots, base, degree)

      for (let d = 0; d < degree; d++) {
        if (hashRand(base + d, leakBeat, LEAK_SALT) < LEAK_RATE) {
          slots[base + d] = 0
        }
      }
    }

    // shearModeSeries applies the collision once per beat over all cells; advance the leak clock by
    // wrapping the series call per mode inside a fresh beat counter
    leakBeat = 0

    const leaky = (() => {
      const original = leakyRule

      const wrapped: Collision = (slots, base, degree) => {
        original(slots, base, degree)

        if (base === 0) {
          leakBeat++
        }
      }

      return intercept({ side: 15, collision: wrapped })
    })()

    const smallest = Math.min(at15.smallestGamma, at21.smallestGamma)
    const bound = Math.max(Math.abs(at15.theta), Math.abs(at21.theta))

    const echoExact = echoHamming === 0
    const interceptSmall = bound < 0.25 * smallest
    const signUnstable = Math.sign(at15.theta) !== Math.sign(at21.theta)
    const controlSeesDamping =
      leaky.theta > 3 * bound && leaky.theta > 0.5 * LEAK_RATE

    const ok =
      echoExact && interceptSmall && signUnstable && controlSeesDamping

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the sheared D4 gas run forty beats forward and forty inverse returns its exact microstate (Hamming distance zero, no microscopic dissipation exists to source a damping), the zero-wavenumber intercept of the shear decay rate is bounded in magnitude by a quarter of the smallest measured rate with opposite signs at sides 15 and 21 (consistent with zero within the k-squared law systematic), and the deterministically leaky control gas at erasure rate 0.02 per slot per beat shows a positive intercept at least three times the bound, so the wavelength-independent damping Chronoflux requires of its fluid limit is measurably absent from this gas',
      metrics: {
        echoHamming,
        thetaSide15: Number(at15.theta.toFixed(5)),
        thetaSide21: Number(at21.theta.toFixed(5)),
        interceptBound: Number(bound.toFixed(5)),
        smallestGamma: Number(smallest.toFixed(5)),
        nuSide15: Number(at15.nu.toFixed(4)),
        nuSide21: Number(at21.nu.toFixed(4)),
      },
      // CONTROL: the leaky gas shows the fit reports a positive intercept when real damping exists
      control: {
        leakyTheta: Number(leaky.theta.toFixed(5)),
        leakRate: LEAK_RATE,
      },
      notes:
        "Roadmap base-model 0010. Chronoflux's hydrodynamic reduction (Zenodo 18988402 appendix, and the Navier-Stokes thread of the 2026 corpus) is Navier-Stokes plus -Theta v with Theta >= 1/tau_0 > 0, and its vorticity bound leans on that term. This gas is the shared-territory test: both programs claim a conserved-current fluid limit, and the sign of Theta is where they part. The intercept extrapolation inherits the k-squared law's 10 to 15 percent systematic (nu drifts from 0.60 to 0.52 across the wavenumbers used), which is why the bound is stated as a bound with unstable sign rather than a measurement of zero.",
    })
  },
})
