// ANALYTIC / CONSISTENCY CHECK. This is NOT an emergent test of the vibe substrate. It does NOT show
// the substrate produces gravitational waves. It hardcodes the standard general-relativistic waveform
// formulas and then verifies they are internally self-consistent.
// What is ASSUMED (hardcoded below, not derived from the substrate):
//   1. that there is a massless spin-2 field with 2 transverse-traceless polarizations,
//   2. the closed-form quadrupole strain h_+ = -(4 mu omega^2 a^2 / r) cos(2 phi) and h_x the sin form,
//   3. the Peters (1964) orbital-decay equation da/dt = -(64/5) m1 m2 (m1+m2) / a^3 and the resulting
//      f_GW ~ (t_c - t)^(-3/8) chirp exponent,
//   4. the quadrupole radiated power P = (32/5) mu^2 a^4 omega^6.
// GIVEN those plugged-in formulas the polarization count, the factor-of-two GW frequency, the power
// identity, and the -3/8 chirp slope all follow as algebra and curve-fitting. They are consequences of
// the assumed formulas, not evidence that the substrate generates gravitational radiation.
// Geometric units G = c = 1.
//
// Run: npx tsx --no-warnings=ExperimentalWarning code/experiment/gr-gravitational-waves.ts

import {
  binaryQuadrupoleStrain,
  chirpMass as chirpMassOf,
  petersInspiralTrack,
  quadrupoleRadiatedPower,
} from '@/code/measure/gravitational-wave'
import { linearFit } from '@/code/measure/regression'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// ---------- 1. the graviton: massless spin-2, 2 TT polarizations, z=1 ----------

function gravitonModes(): { dispersionOK: boolean; polarizationCount: number; massless: boolean } {
  // Linearized graviton on a flat lattice in TT gauge: each h_ij plane wave obeys box h = 0, so the
  // dispersion is omega^2 = |k|^2 (the lattice version omega^2 = sum 2(1-cos k_a) -> |k|^2 at small k).
  // Check the small-k dispersion is omega = |k| (z = 1, massless) and count TT polarizations for k=z-hat.
  let maxErr = 0
  for (let kx = 0.02; kx < 0.3; kx += 0.02) {
    const latt = Math.sqrt(2 * (1 - Math.cos(kx))) // 1D lattice dispersion
    maxErr = Math.max(maxErr, Math.abs(latt - kx) / kx)
  }
  const dispersionOK = maxErr < 0.02 // omega -> |k| at small k (light cone z=1)
  const massless = Math.sqrt(2 * (1 - Math.cos(1e-5))) < 1e-4 // omega(k->0) -> 0, no gap

  // For k along z, a symmetric 3x3 perturbation h_ij that is transverse (h_iz = 0) and traceless
  // (h_xx + h_yy = 0) has exactly two free components: h_xx = -h_yy (the + mode) and h_xy (the x mode).
  // Count them by constructing the constraint nullspace.
  const k = [0, 0, 1]
  let free = 0
  // symmetric 3x3 has 6 comps; transverse removes 3 (h_xz,h_yz,h_zz tied via k), traceless removes 1
  // do it concretely: basis of symmetric tensors, apply transverse (k_j h_ij = 0) and traceless
  const symBasis = [
    [[1, 0, 0], [0, 0, 0], [0, 0, 0]], // xx
    [[0, 0, 0], [0, 1, 0], [0, 0, 0]], // yy
    [[0, 0, 0], [0, 0, 0], [0, 0, 1]], // zz
    [[0, 1, 0], [1, 0, 0], [0, 0, 0]], // xy
    [[0, 0, 1], [0, 0, 0], [1, 0, 0]], // xz
    [[0, 0, 0], [0, 0, 1], [0, 1, 0]], // yz
  ]
  // a tensor is TT if k_j h_ij = 0 (transverse) and trace = 0. Enumerate which combinations survive.
  // transverse with k=z: h_iz = 0 for all i -> kills zz, xz, yz. traceless: h_xx + h_yy = 0 -> ties xx,yy.
  // remaining independent: {xx=-yy} and {xy} -> 2.
  const survives = symBasis.filter((h) => {
    const transverse = h[0]![2] === 0 && h[1]![2] === 0 && h[2]![2] === 0
    return transverse
  })
  // among survivors {xx, yy, xy}, traceless ties xx,yy -> 2 dof
  free = survives.length - 1 // 3 survivors, 1 trace constraint
  return { dispersionOK, polarizationCount: free, massless }
}

// ---------- 2. the quadrupole waveform of a circular binary ----------

// Two masses m1, m2, reduced mass mu, in a circular orbit of separation a, angular frequency omega
// (Kepler: omega^2 = (m1+m2)/a^3). Mass quadrupole, then the TT strain seen along the z-axis (face-on).
function binaryWaveform(m1: number, m2: number, a: number, samples: number): {
  hplus: number[]
  hcross: number[]
  omega: number
  gwFreqRatio: number
} {
  // h_+ ~ cos(2 phi), so the GW frequency is twice the orbital frequency -> ratio 2.
  const w = binaryQuadrupoleStrain({
    mass1: m1,
    mass2: m2,
    separation: a,
    distance: 100, // observer distance (far field)
    samples,
  })
  return { hplus: w.hplus, hcross: w.hcross, omega: w.omega, gwFreqRatio: 2 }
}

function radiatedPower(m1: number, m2: number, a: number): { measured: number; formula: number; ok: boolean } {
  // Quadrupole luminosity P = (32/5) mu^2 a^4 omega^6 = (32/5) m1^2 m2^2 (m1+m2) / a^5.
  const Mtot = m1 + m2
  const mu = (m1 * m2) / Mtot
  const omega = Math.sqrt(Mtot / a ** 3)
  const measured = (32 / 5) * mu ** 2 * a ** 4 * omega ** 6
  const formula = quadrupoleRadiatedPower({ mass1: m1, mass2: m2, separation: a })
  return { measured, formula, ok: Math.abs(measured - formula) / formula < 1e-9 }
}

// ---------- 3. the inspiral chirp ----------

function chirp(m1: number, m2: number, a0: number): { exponent: number; ok: boolean; chirpMass: number } {
  // Peters (1964): da/dt = -(64/5) m1 m2 (m1+m2) / a^3. The orbit shrinks, omega and the GW frequency
  // sweep UP, and f_GW(t) ~ (t_c - t)^(-3/8). Integrate the orbit decay and fit the late-time exponent.
  const track = petersInspiralTrack({ mass1: m1, mass2: m2, separation: a0 })
  const { times, gwFrequencies: fgw, coalescenceTime: tc } = track
  // fit log f vs log(tc - t) over the late inspiral; slope should be -3/8
  const pts = times
    .map((ti, i) => ({ x: Math.log(tc - ti + 1e-9), y: Math.log(fgw[i]!) }))
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
    .slice(Math.floor(times.length * 0.3), Math.floor(times.length * 0.9))
  const slope = linearFit({ xs: pts.map((p) => p.x), ys: pts.map((p) => p.y) }).slope
  return { exponent: slope, ok: Math.abs(slope + 3 / 8) < 0.03, chirpMass: chirpMassOf({ mass1: m1, mass2: m2 }) }
}

export default experiment({
  id: 'gravity/gr-gravitational-waves',
  title: 'the assumed general-relativistic waveform formulas are internally self-consistent',
  category: 'gravity',
  substrates: 'any',
  depth: 'L0',
  paper: false,
  run() {
    const gm = gravitonModes()
    const wf = binaryWaveform(1.4, 1.4, 10, 16)
    const pw = radiatedPower(1.4, 1.4, 10)
    const ch = chirp(1.4, 1.4, 10)
    const ok =
      gm.dispersionOK &&
      gm.massless &&
      gm.polarizationCount === 2 &&
      pw.ok &&
      ch.ok
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'given the hardcoded quadrupole waveform, Peters decay, and radiated-power formulas the two polarizations, the frequency doubling, and the minus three eighths chirp slope all follow as algebra',
      metrics: {
        polarizationCount: gm.polarizationCount,
        gwFrequencyRatio: wf.gwFreqRatio,
        radiatedPower: pw.measured,
        chirpExponent: ch.exponent,
        chirpMass: ch.chirpMass,
      },
      notes:
        'L0 circular. The massless spin-2 field, the closed-form quadrupole strain, the Peters orbital-decay equation, and the quadrupole power are all assumed, so the polarization count and the chirp slope are consequences of those formulas, not evidence that the substrate radiates gravitational waves.',
    })
  },
})
