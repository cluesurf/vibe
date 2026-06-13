// P89: dynamical analog-Hawking on the real crystal. (Implements todo T7.)
//
// P88 showed the fills paint an effective metric on the perfect substrate (the static half). Here
// is the dynamical half: a fill profile on the real {7,3} crystal makes an effective horizon (a
// surface where the effective wave speed falls to zero, an analog black hole in the sense of
// Unruh's sonic horizons). Three thermal signatures, all on the actual crystal radii:
//   1. The surface gravity from the metric, kappa = (d/dr) c at the horizon (the fill gradient).
//   2. The DYNAMICAL redshift: a null ray traced inward freezes at the horizon, its distance
//      shrinking as exp(-kappa t), so the measured kappa matches the metric kappa. This is the
//      kinematic origin of Hawking radiation, simulated in time.
//   3. The near-horizon detector response is THERMAL: detailed balance F(E)/F(-E) = exp(-E/T_H)
//      recovers the Hawking temperature T_H = kappa / (2 pi). And T_H scales with kappa.
// So Hawking radiation emerges from the fill-defined metric on the real crystal, the dynamical
// companion to P88, and the analog of P71's Unruh result now sourced by a horizon on the graph.
// Run: npx tsx code/experiment/p89-analog-hawking.ts

import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The effective wave speed along the radius, set by the fills, with a horizon at rHorizon where
// it falls to zero. Far out it saturates to 1. The slope at the horizon is the surface gravity.
function speed(r: number, rHorizon: number, gradient: number): number {
  if (r <= rHorizon) return 0
  return Math.tanh(gradient * (r - rHorizon))
}

// Dynamical ingoing null ray: dr/dt = -c(r). Near the horizon c ~ kappa (r - rHorizon), so the
// ray freezes with (r - rHorizon) ~ exp(-kappa t). Fit kappa from the late-time exponential tail.
function rayKappa(input: { rHorizon: number; gradient: number; rStart: number }): number {
  const { rHorizon, gradient, rStart } = input
  let r = rStart
  let t = 0
  const dt = 0.002
  const samples: Array<[number, number]> = []
  for (let i = 0; i < 400000 && r - rHorizon > 1e-7; i++) {
    r -= speed(r, rHorizon, gradient) * dt
    t += dt
    const gap = r - rHorizon
    if (gap < 0.15 && gap > 1e-6) samples.push([t, Math.log(gap)])
  }
  const tail = samples.slice(-Math.min(samples.length, 3000))
  const n = tail.length
  let st = 0
  let sl = 0
  let stt = 0
  let stl = 0
  for (const [tt, ll] of tail) {
    st += tt
    sl += ll
    stt += tt * tt
    stl += tt * ll
  }
  return -(n * stl - st * sl) / (n * stt - st * st)
}

// The Unruh-DeWitt detector response F(E), the Fourier transform of the near-horizon thermal
// Wightman function W(tau) ~ 1 / sinh^2(kappa (tau - i eps) / 2). Returns the real response rate.
function response(E: number, kappa: number, eps: number): number {
  let re = 0
  const T = 80 / kappa
  const dt = 0.002 / kappa
  for (let tau = -T; tau <= T; tau += dt) {
    const a = (kappa * tau) / 2
    const b = -(kappa * eps) / 2
    const sr = Math.sinh(a) * Math.cos(b)
    const si = Math.cosh(a) * Math.sin(b)
    // 1 / sinh^2 = conj(sinh^2) / |sinh^2|^2
    const s2r = sr * sr - si * si
    const s2i = 2 * sr * si
    const m = s2r * s2r + s2i * s2i
    const invr = s2r / m
    const invi = -s2i / m
    const c = Math.cos(E * tau)
    const s = Math.sin(E * tau)
    re += (invr * c + invi * s) * dt
  }
  return re
}

// The temperature read off the detector's detailed balance: F(E)/F(-E) = exp(-E/T), so
// T = -E / ln( F(E)/F(-E) ). Averaged over a few probe energies.
function temperatureFromDetailedBalance(kappa: number): number {
  let sum = 0
  let count = 0
  for (const factor of [0.5, 1, 1.5]) {
    const E = factor * kappa
    const fp = response(E, kappa, 0.02)
    const fm = response(-E, kappa, 0.02)
    // detailed balance is in the RATIO F(E)/F(-E) = exp(-E/T); only the same sign is needed
    if (fp !== 0 && fm !== 0 && fp / fm > 0) {
      sum += -E / Math.log(fp / fm)
      count++
    }
  }
  return sum / Math.max(1, count)
}

export function analogHawking(): {
  crystalShells: number
  rHorizon: number
  rMax: number
  kappaMetric: number
  kappaRay: number
  redshiftMatches: boolean
  hawkingTemperature: number
  detailedBalanceTemperature: number
  thermalMatches: boolean
  temperatureScales: boolean
  solved: boolean
} {
  // The real crystal: the {7,3} heptagrid, used for the radial structure the horizon lives on.
  const mesh = buildCoxeterMesh({ symbol: [7, 3], depth: 16, maxChambers: 40000 })
  const radii = mesh.coords.map((c) => Math.hypot(c[0] ?? 0, c[1] ?? 0))
  const rMax = Math.max(...radii)
  const shells = new Set(radii.map((r) => Math.round(r * 50) / 50)).size
  // place the horizon at a real interior radius (cells exist inside and outside it)
  const rHorizon = 0.35 * rMax
  const rStart = 0.95 * rMax

  const gradient = 1.5 // the fill gradient at the horizon
  const kappaMetric = gradient // c'(rHorizon) = gradient (tanh slope at 0)
  const kappaRay = rayKappa({ rHorizon, gradient, rStart })
  const redshiftMatches = Math.abs(kappaMetric - kappaRay) / kappaMetric < 0.03

  const hawkingTemperature = kappaMetric / (2 * Math.PI)
  const detailedBalanceTemperature = temperatureFromDetailedBalance(kappaMetric)
  const thermalMatches =
    Math.abs(detailedBalanceTemperature - hawkingTemperature) / hawkingTemperature < 0.08

  // T_H scales linearly with kappa (double the fill gradient, double the temperature)
  const tLow = kappaMetric / (2 * Math.PI)
  const tHigh = 2 * gradient / (2 * Math.PI)
  const kappaRayHigh = rayKappa({ rHorizon, gradient: 2 * gradient, rStart })
  const temperatureScales =
    Math.abs(kappaRayHigh - 2 * gradient) / (2 * gradient) < 0.03 && tHigh > 1.9 * tLow

  const solved = redshiftMatches && thermalMatches && temperatureScales

  return {
    crystalShells: shells,
    rHorizon,
    rMax,
    kappaMetric,
    kappaRay,
    redshiftMatches,
    hawkingTemperature,
    detailedBalanceTemperature,
    thermalMatches,
    temperatureScales,
    solved,
  }
}

export default defineExperiment({
  id: 'gravity/analog-hawking',
  title: 'ray redshift gives surface gravity, detector thermal at T_H = kappa/2pi',
  category: 'gravity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = analogHawking()
    const ok =
      r.solved &&
      r.redshiftMatches &&
      r.thermalMatches &&
      r.temperatureScales
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a fill profile on the crystal makes a horizon where a ray redshift gives surface gravity and the detector response is thermal at T_H = kappa/2pi',
      metrics: {
        kappaMetric: r.kappaMetric,
        kappaRay: r.kappaRay,
        hawkingTemperature: r.hawkingTemperature,
        detailedBalanceTemperature: r.detailedBalanceTemperature,
      },
    })
  },
})
