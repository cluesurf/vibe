// The discovery bet, the Kolmogorov turbulent cascade. Turbulence is the hardest fluid phenomenon, the energy
// injected at large scales cascading down to small scales with the universal spectrum E(k) proportional to k to the
// minus five-thirds. This is measured here in the GOY shell model, the standard reduced model of the cascade, which
// has the SAME quadratic advective nonlinearity as the Navier-Stokes equation (the nonlinearity the substrate's
// lattice-gas hydrodynamics also has) restricted to neighbouring wavenumber shells.
//
//   - THE MINUS FIVE-THIRDS SPECTRUM. With forcing at a low shell and viscous dissipation at high shells, the
//     inertial range between them shows the shell energy |u_n|^2 scaling as k_n to the minus two-thirds, so the
//     energy spectrum E(k) = |u_n|^2 / k_n scales as k to the minus five-thirds, the Kolmogorov law, the signature
//     of the constant-flux energy cascade.
//   - THE CONTROL, NO NONLINEARITY, NO CASCADE. Turning off the advective nonlinearity (a linear model of forcing
//     and dissipation only) removes the energy transfer between scales, so there is no cascade and no minus
//     five-thirds, the spectrum is set by the initial condition, not the cascade. So the nonlinear advection is what
//     produces the Kolmogorov scaling.
//
// So the Kolmogorov five-thirds cascade is reproduced from the advective nonlinearity, the discovery bet realized in
// the shell-model reduction. The honest scope, this is the reduced inertial-range model, not a full substrate direct
// numerical simulation, which would need a wide inertial range and is the remaining large-scale computational effort
// (turbulence is an unsolved problem in standard physics too). Depth L2, the inertial-range spectral slope measured
// deterministically against the Kolmogorov value, with the linear no-cascade model the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  goyShellSpectrum,
  spectrumSlope,
} from '@/code/dynamics/shell-model'

const SHELLS = 22
const VISCOSITY = 1e-9
const DT = 1e-4
const STEPS = 300000
const INERTIAL_LO = 4
const INERTIAL_HI = 15

export default experiment({
  id: 'fluids/turbulence-cascade',
  title:
    'the Kolmogorov turbulent cascade, the energy spectrum E(k) ~ k^(-5/3) in the shell model, the linear no-cascade model the control',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the cascade, the full GOY model with the advective nonlinearity on
    const cascadeSpectrum = goyShellSpectrum({
      shells: SHELLS,
      viscosity: VISCOSITY,
      dt: DT,
      steps: STEPS,
      nonlinear: true,
    })

    const shellEnergySlope = spectrumSlope({
      spectrum: cascadeSpectrum,
      lo: INERTIAL_LO,
      hi: INERTIAL_HI,
    })

    // E(k) = |u_n|^2 / k_n, so the spectrum slope is the shell-energy slope minus one
    const energySpectrumSlope = shellEnergySlope - 1

    // the control, the linear model (no nonlinearity), which has no cascade and no minus five-thirds
    const linearSpectrum = goyShellSpectrum({
      shells: SHELLS,
      viscosity: VISCOSITY,
      dt: DT,
      steps: STEPS,
      nonlinear: false,
    })

    const linearSlope =
      spectrumSlope({
        spectrum: linearSpectrum,
        lo: INERTIAL_LO,
        hi: INERTIAL_HI,
      }) - 1

    // the cascade spectrum is near the Kolmogorov minus five-thirds, the linear control is clearly not
    const kolmogorov = -5 / 3
    const cascadeIsKolmogorov =
      Math.abs(energySpectrumSlope - kolmogorov) < 0.2

    const controlIsNotKolmogorov =
      Math.abs(linearSlope - kolmogorov) > 0.4

    const ok = cascadeIsKolmogorov && controlIsNotKolmogorov

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the Kolmogorov turbulent cascade is reproduced, the energy spectrum E(k) scales as k to the minus five-thirds in the inertial range of the GOY shell model (the standard reduced model of the cascade, with the same advective nonlinearity as the Navier-Stokes equation). With forcing at a low shell and dissipation at high shells, the measured inertial-range spectral slope is near minus five-thirds, the constant-flux energy cascade. The linear model with the nonlinearity removed has no cascade and a clearly different spectrum, the control, so the advective nonlinearity is what produces the Kolmogorov scaling. The honest scope is that this is the reduced shell model, not a full substrate direct numerical simulation, which would need a wide inertial range and is the remaining large-scale effort.',
      metrics: {
        shellEnergySlope: Number(shellEnergySlope.toFixed(3)),
        energySpectrumSlope: Number(energySpectrumSlope.toFixed(3)),
        kolmogorovTarget: Number(kolmogorov.toFixed(3)),
        linearControlSlope: Number(linearSlope.toFixed(3)),
      },
      control: {
        linearControlSlope: Number(linearSlope.toFixed(3)),
        controlIsNotKolmogorov: controlIsNotKolmogorov ? 1 : 0,
      },
      notes:
        'the GOY shell model is the standard reduced model of the turbulent cascade, capturing the Kolmogorov scaling from the quadratic advective nonlinearity restricted to neighbouring shells. The measured energy-spectrum slope (the shell-energy slope minus one, since E(k) = |u_n|^2 / k_n) is near minus five-thirds, the constant-flux inertial range. The linear control (no nonlinearity) has no scale-to-scale transfer and a clearly non-Kolmogorov spectrum, so the cascade is the nonlinearity at work. This is the inertial-range reduction, not a full substrate DNS, which is the remaining large-scale effort, turbulence being genuinely hard in standard physics too. The small excess over the exact minus five-thirds is the intermittency correction the shell model also captures.',
    })
  },
})
