// FD1, resolving the open research question, does a CHAOTIC (configuration-controlled) reversible collision give
// GENUINE diffusion (viscosity)? The coherent richer collision is ballistic (fluids/richer-collision-ballistic).
// The natural next hypothesis is that a configuration-DEPENDENT collision, where each momentum-matched swap fires
// only when a control slot is occupied (a Fredkin-style controlled swap), would scatter the momentum and turn the
// transport diffusive (deterministic chaos). It does not. Measured across wavelengths the decay-time exponent is
// about ONE (ballistic, tau ~ lambda), not two (diffusive, tau ~ lambda^2), the same as the coherent collision,
// even though the swap is now gated on the local configuration and remains mass-conserving, momentum-conserving,
// and reversible. So configuration control does not turn the reversible bulk diffusive. This closes the chaotic
// route, the conclusion is that genuine viscous diffusion on this homogeneous reversible substrate needs the bath
// (irreversibility), not a cleverer per-cell conserving collision.
//
// Deterministic throughout (the shear is a fixed sinusoidal function of the cell coordinate, no random).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { controlledViscousRotate } from '@/code/rule/viscous-collision'
import { makeWill } from '@/code/tone/will'
import { conservesCharge, conservesMomentum, isReversible } from '@/code/check/invariant'
import { shearSetup, shearAmplitudeSeries } from '@/code/measure/hydrodynamics'

export default experiment({
  id: 'fluids/chaotic-collision-ballistic',
  title: 'a configuration-controlled (chaotic) reversible collision is still ballistic, deterministic chaos does not give viscosity',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 20
    const mesh = d4Mesh({ side })
    const directions = rootsD4()
    const collision = controlledViscousRotate({ directions, gateCount: 4 }) // the chaotic / configuration-controlled candidate
    const beats = 30

    const decayTime = (wavelength: number): number => {
      const shear = { gradAxis: 1, momAxis: 0, wavelength, side, directions }
      const will = shearSetup({ mesh, ...shear })
      const series = shearAmplitudeSeries({ will, collision, beats, open: false, ...shear }).map((a) => Math.abs(a))
      for (let t = 1; t < series.length; t++) {
        if (series[t]! < 1 / Math.E) { const prev = series[t - 1]!, cur = series[t]!; return (t - 1) + (prev - 1 / Math.E) / (prev - cur) }
      }
      return NaN
    }

    const wavelengths = [20, 10, 5]
    const logL: number[] = [], logTau: number[] = [], taus: number[] = []
    for (const wavelength of wavelengths) {
      const tau = decayTime(wavelength)
      taus.push(tau)
      if (!Number.isNaN(tau)) { logL.push(Math.log(wavelength)); logTau.push(Math.log(tau)) }
    }
    const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length
    const mL = mean(logL), mT = mean(logTau)
    let num = 0, den = 0
    for (let i = 0; i < logL.length; i++) { num += (logL[i]! - mL) * (logTau[i]! - mT); den += (logL[i]! - mL) ** 2 }
    const exponent = num / den

    // the controlled collision is a valid base-class rule (conserves mass and momentum, reversible)
    const probe = makeWill(mesh)
    for (let i = 0; i < probe.data.length; i++) probe.data[i] = i % 3 === 0 ? 1 : 0
    const validRule = conservesCharge(probe, collision, 15) && conservesMomentum(probe, collision, 15, directions) && isReversible(probe, collision, 15)

    const ballisticNotDiffusive = exponent < 1.5 // ballistic (near 1), not diffusive (near 2)
    const ok = validRule && ballisticNotDiffusive && taus.every((t) => !Number.isNaN(t))

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a configuration-controlled (Fredkin-style) reversible momentum-conserving collision, where each momentum-matched swap fires only when a control slot is occupied so the reshaping depends on the local configuration, still gives BALLISTIC transport (decay-time exponent near one, not the two of genuine diffusion), so deterministic chaos from configuration control does not turn the homogeneous reversible bulk diffusive, and genuine viscous diffusion needs the bath',
      metrics: {
        transportExponentTimes100: Math.round(exponent * 100),
        diffusiveExponentTimes100: 200,
        tauLong: Math.round((taus[0] ?? 0) * 100) / 100,
        tauMid: Math.round((taus[1] ?? 0) * 100) / 100,
        tauShort: Math.round((taus[2] ?? 0) * 100) / 100,
        beats,
        side,
      },
      control: { diffusiveExponentTimes100: 200 },
      notes:
        'resolves the open chaotic-collision research question with a negative. Both the coherent (richer-collision-ballistic) and the configuration-controlled chaotic collision give exponent near 1 (ballistic). The conclusion is that per-cell deterministic reversible momentum-conserving collisions are ballistic on this substrate, genuine viscous diffusion needs the bath (irreversibility), or a fundamentally different dynamics (a block / Margolus partition or stochasticity) outside the per-cell directional rule.',
    })
  },
})
