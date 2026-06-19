// FD1, the corrected result. A richer momentum-mixing collision DAMPS a shear, but the transport is BALLISTIC, not
// diffusive, so it is NOT a genuine bulk viscosity. The committed headOnRotate is inviscid (it reshapes only
// zero-momentum pairs, fluids/no-bulk-viscosity). A richer collision (code/rule/viscous-collision) reshapes
// net-momentum configurations too, and under it a shear DOES damp, which at first looks like viscosity. The
// decisive test is the SCALING of the decay time with wavelength, a genuine viscosity is diffusive with decay time
// tau ~ lambda^2 (the k^2 law, a constant viscosity nu), whereas ballistic transport gives tau ~ lambda. Measured
// across wavelengths the exponent is about ONE (ballistic), not two (diffusive), and the apparent nu grows with
// wavelength rather than being constant. So the richer collision mixes momentum but carries it away ballistically,
// it is NOT a genuine viscosity. This matches the deeper finding, a homogeneous reversible momentum-conserving rule
// gives ballistic momentum transport, and genuine viscous DIFFUSION needs the bath (irreversibility), so viscosity
// is bath-driven like all dissipation in the model.
//
// Deterministic throughout (the shear is a fixed sinusoidal function of the cell coordinate, no random). This
// corrects an earlier premature reading of the richer collision as viscous, the scaling test is what settles it.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { headOnRotate } from '@/code/rule/collision'
import { viscousRotate } from '@/code/rule/viscous-collision'
import { makeWill } from '@/code/tone/will'
import {
  conservesCharge,
  conservesMomentum,
  isReversible,
} from '@/code/check/invariant'
import {
  shearSetup,
  shearAmplitudeSeries,
} from '@/code/measure/hydrodynamics'

export default experiment({
  id: 'fluids/richer-collision-ballistic',
  title:
    'a richer collision damps a shear but BALLISTICALLY (decay time scales as wavelength, not wavelength squared), so it is not a genuine viscosity',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 20
    const mesh = d4Mesh({ side })
    const directions = rootsD4()
    const opposite: number[] = []
    for (let d = 0; d < mesh.degree; d++) {
      opposite.push(mesh.opposite(d))
    }

    const viscous = viscousRotate({ directions })
    const committed = headOnRotate({ opposite })
    const beats = 30

    // the first time (interpolated) the shear amplitude drops below 1/e, the decay time tau
    const decayTime = (
      collision: typeof viscous,
      wavelength: number,
    ): number => {
      const shear = {
        gradAxis: 1,
        momAxis: 0,
        wavelength,
        side,
        directions,
      }
      const will = shearSetup({ mesh, ...shear })
      const series = shearAmplitudeSeries({
        will,
        collision,
        beats,
        open: false,
        ...shear,
      }).map(a => Math.abs(a))
      for (let t = 1; t < series.length; t++) {
        if (series[t]! < 1 / Math.E) {
          const prev = series[t - 1]!,
            cur = series[t]!

          return t - 1 + (prev - 1 / Math.E) / (prev - cur)
        }
      }

      return NaN
    }

    // measure the scaling of tau with wavelength under the richer collision
    const wavelengths = [20, 10, 5]
    const logL: number[] = [],
      logTau: number[] = []
    const taus: number[] = []
    for (const wavelength of wavelengths) {
      const tau = decayTime(viscous, wavelength)
      taus.push(tau)
      if (!Number.isNaN(tau)) {
        logL.push(Math.log(wavelength))
        logTau.push(Math.log(tau))
      }
    }

    // least-squares slope of log(tau) vs log(lambda), the transport exponent (1 ballistic, 2 diffusive)
    const mean = (a: number[]) =>
      a.reduce((s, x) => s + x, 0) / a.length
    const mL = mean(logL),
      mT = mean(logTau)
    let num = 0,
      den = 0
    for (let i = 0; i < logL.length; i++) {
      num += (logL[i]! - mL) * (logTau[i]! - mT)
      den += (logL[i]! - mL) ** 2
    }

    const exponent = num / den

    // the shear does damp under the richer collision (mixing happens), the committed one is inviscid (control)
    const viscousDamps = !Number.isNaN(taus[0]!) // the richer collision damps the shear within the run
    const committedInviscid = Number.isNaN(decayTime(committed, side)) // the committed shear never drops below 1/e

    // the richer collision is a valid base-class rule
    const probe = makeWill(mesh)
    for (let i = 0; i < probe.data.length; i++) {
      probe.data[i] = i % 2 === 0 ? 1 : 0
    }

    const validRule =
      conservesCharge(probe, viscous, 20) &&
      conservesMomentum(probe, viscous, 20, directions) &&
      isReversible(probe, viscous, 20)

    // the result, the transport is ballistic (exponent near 1), NOT diffusive (would be near 2), so not a viscosity
    const ballisticNotDiffusive = exponent < 1.5
    const ok =
      viscousDamps &&
      committedInviscid &&
      validRule &&
      ballisticNotDiffusive

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a richer momentum-mixing collision (conserving mass and the full momentum, reversible) damps a transverse shear, but the decay time scales as the wavelength (transport exponent near one, ballistic) not as the wavelength squared (exponent two, diffusive), so the apparent viscosity is not constant and it is NOT a genuine bulk viscosity, the momentum is mixed and carried away ballistically, and genuine viscous diffusion requires the bath, so viscosity is bath-driven like all dissipation, while the committed headOnRotate does not damp the shear at all (inviscid)',
      metrics: {
        transportExponentTimes100: Math.round(exponent * 100),
        diffusiveExponentTimes100: 200,
        tauLong: Math.round((taus[0] ?? 0) * 100) / 100,
        tauMid: Math.round((taus[1] ?? 0) * 100) / 100,
        tauShort: Math.round((taus[2] ?? 0) * 100) / 100,
        beats,
        side,
      },
      control: {
        committedShearDampsBelow1OverE: committedInviscid ? 0 : 1,
      },
      notes:
        'the decisive metric is the transport exponent, measured near 1 (ballistic), a genuine viscosity would give 2 (diffusive). The committed collision is the inviscid control (its shear never drops below 1/e). This corrects an earlier premature reading of the richer collision as viscous. Genuine viscous diffusion, and hence turbulence, needs the bath (irreversibility), not a reversible bulk collision.',
    })
  },
})
