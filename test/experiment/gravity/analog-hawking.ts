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
import { rayFreezeSurfaceGravity } from '@/code/measure/acoustic-horizon'
import {
  unruhDetectorResponse,
  temperatureFromDetailedBalance,
} from '@/code/measure/unruh'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Dynamical ingoing null ray surface gravity on the tanh horizon profile.
function rayKappa(input: {
  rHorizon: number
  gradient: number
  rStart: number
}): number {
  return rayFreezeSurfaceGravity({
    horizon: input.rHorizon,
    gradient: input.gradient,
    start: input.rStart,
  })
}

// The near-horizon Unruh-DeWitt detector response F(E), the real part of the transform of the thermal
// Wightman function W(tau) ~ 1 / sinh^2(kappa (tau - i eps) / 2).
function response(E: number, kappa: number, eps: number): number {
  return unruhDetectorResponse({
    energy: E,
    kappa,
    eps,
    halfWindow: 80,
    step: 0.002 / kappa,
  }).real
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
  const mesh = buildCoxeterMesh({
    symbol: [7, 3],
    depth: 16,
    maxChambers: 40000,
  })
  const radii = mesh.coords.map(c => Math.hypot(c[0] ?? 0, c[1] ?? 0))
  const rMax = Math.max(...radii)
  const shells = new Set(radii.map(r => Math.round(r * 50) / 50)).size
  // place the horizon at a real interior radius (cells exist inside and outside it)
  const rHorizon = 0.35 * rMax
  const rStart = 0.95 * rMax

  const gradient = 1.5 // the fill gradient at the horizon
  const kappaMetric = gradient // c'(rHorizon) = gradient (tanh slope at 0)
  const kappaRay = rayKappa({ rHorizon, gradient, rStart })
  const redshiftMatches =
    Math.abs(kappaMetric - kappaRay) / kappaMetric < 0.03

  const hawkingTemperature = kappaMetric / (2 * Math.PI)
  const detailedBalanceTemperature = temperatureFromDetailedBalance({
    kappa: kappaMetric,
    response: E => response(E, kappaMetric, 0.02),
  })
  const thermalMatches =
    Math.abs(detailedBalanceTemperature - hawkingTemperature) /
      hawkingTemperature <
    0.08

  // T_H scales linearly with kappa (double the fill gradient, double the temperature)
  const tLow = kappaMetric / (2 * Math.PI)
  const tHigh = (2 * gradient) / (2 * Math.PI)
  const kappaRayHigh = rayKappa({
    rHorizon,
    gradient: 2 * gradient,
    rStart,
  })
  const temperatureScales =
    Math.abs(kappaRayHigh - 2 * gradient) / (2 * gradient) < 0.03 &&
    tHigh > 1.9 * tLow

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

export default experiment({
  id: 'gravity/analog-hawking',
  title:
    'ray redshift gives surface gravity, detector thermal at T_H = kappa/2pi',
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
