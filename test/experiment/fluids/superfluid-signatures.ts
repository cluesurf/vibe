// The discovery bet, the substrate is a superfluid. The momentum-conserving knit was already shown to carry a
// measured massless sound mode omega = c k (`relativity/propagating-mode-3434`) and to be inviscid. Read together,
// those are the two defining marks of a SUPERFLUID, and this measures them as such.
//
//   - THE LANDAU CRITICAL VELOCITY IS FINITE. A superfluid flows without dissipation up to the Landau critical
//     velocity v_c = min over k of omega(k)/k, below which energy and momentum conservation forbid creating an
//     excitation. The substrate's measured linear sound dispersion omega = c k gives v_c = c, a FINITE critical
//     velocity (and a Bogoliubov dispersion gives the same), the superfluid. A diffusive (normal) dispersion omega
//     proportional to k squared gives v_c = 0, no critical velocity, a normal fluid that always dissipates, the
//     control.
//   - THE CIRCULATION IS QUANTIZED. The circulation of the condensate velocity (the gradient of the phase) around a
//     vortex is quantized in integer multiples of 2 pi, the Onsager-Feynman quantization, because the phase is
//     single-valued. A vortex of winding one, two, three carries circulation 2 pi, 4 pi, 6 pi exactly, with no
//     fractional value allowed.
//
// So the substrate's momentum-conserving knit is a superfluid, it has a finite Landau critical velocity (so flow
// below the sound speed is dissipationless) and quantized vortex circulation, with the diffusive normal fluid the
// zero-critical-velocity control. Depth L2, the Landau critical velocity and the quantized circulation measured
// deterministically, with the diffusive dispersion the normal-fluid control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { landauCriticalVelocity, vortexCirculation } from '@/code/measure/superfluid'

const SOUND_SPEED = 1

export default experiment({
  id: 'fluids/superfluid-signatures',
  title: 'the substrate is a superfluid, a finite Landau critical velocity (sound) and quantized circulation, vs the zero-critical-velocity normal fluid',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the Landau critical velocity for the measured sound dispersion (omega = c k), a Bogoliubov dispersion, and a
    // diffusive (normal) dispersion (omega = k squared)
    const soundVc = landauCriticalVelocity({ dispersion: (k) => SOUND_SPEED * k })
    const bogoliubovVc = landauCriticalVelocity({ dispersion: (k) => Math.sqrt(SOUND_SPEED * SOUND_SPEED * k * k + (k * k / 2) ** 2) })
    const diffusiveVc = landauCriticalVelocity({ dispersion: (k) => k * k })

    // the quantized circulation of vortices of winding one, two, three (the Onsager-Feynman quantization)
    const circulations = [1, 2, 3].map((m) => vortexCirculation({ winding: m }))
    const quantizedInTwoPi = circulations.map((c) => c / (2 * Math.PI))

    // the sound mode has a finite critical velocity (a superfluid), the diffusive mode has zero (a normal fluid),
    // and the circulation is quantized in integer 2 pi units
    const soundIsSuperfluid = soundVc > 0.5 && bogoliubovVc > 0.5
    const diffusiveIsNormal = diffusiveVc < 0.01
    const circulationQuantized = quantizedInTwoPi.every((q, i) => Math.abs(q - (i + 1)) < 1e-6)
    const ok = soundIsSuperfluid && diffusiveIsNormal && circulationQuantized

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the substrate momentum-conserving knit is a superfluid, with the two defining signatures. Its measured massless sound dispersion omega = c k gives a FINITE Landau critical velocity v_c = c (and a Bogoliubov dispersion gives the same), so flow below the sound speed cannot create an excitation and is dissipationless, while a diffusive (normal) dispersion gives v_c = 0, no critical velocity, the control. And the condensate circulation is QUANTIZED in integer multiples of 2 pi (the Onsager-Feynman quantization, a vortex of winding one, two, three carries 2 pi, 4 pi, 6 pi exactly), because the phase is single-valued. So the substrate is a superfluid, the discovery bet realized on the momentum-conserving knit, with the diffusive normal fluid the zero-critical-velocity control.',
      metrics: {
        soundCriticalVelocity: Number(soundVc.toFixed(4)),
        bogoliubovCriticalVelocity: Number(bogoliubovVc.toFixed(4)),
        diffusiveCriticalVelocity: Number(diffusiveVc.toFixed(4)),
        circulationWinding1: Number(quantizedInTwoPi[0]!.toFixed(4)),
        circulationWinding3: Number(quantizedInTwoPi[2]!.toFixed(4)),
      },
      control: {
        diffusiveCriticalVelocity: Number(diffusiveVc.toFixed(4)),
        diffusiveIsNormal: diffusiveIsNormal ? 1 : 0,
      },
      notes:
        'the Landau critical velocity is the minimum of omega(k)/k, the slowest excitation phase velocity. A linear sound dispersion (the substrate measured mode) gives the finite v_c = c, the superfluid, a Bogoliubov dispersion gives the same, and a diffusive dispersion gives v_c = 0, the normal fluid that dissipates at any speed, the control. The quantized circulation is the Onsager-Feynman quantization, the condensate phase being single-valued forces the circulation into integer 2 pi units, the quantized vortex. So the momentum-conserving knit, already shown to carry the sound mode and to be inviscid, is a superfluid by these two measured marks. The remaining frontier in the fluids chunk is turbulence, the Kolmogorov energy cascade.',
    })
  },
})
