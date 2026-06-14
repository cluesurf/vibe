// P71: Hawking/Unruh radiation, with thermality DERIVED, not plugged in.
// The earlier version plugged in the Bogoliubov mixing tanh r = exp(-pi w / kappa) (the answer) and
// hardcoded a triangular Page curve. This version derives both:
//
//   1. Thermal spectrum from the Unruh detector response. A uniformly accelerated detector (the
//      equivalence-principle stand-in for a horizon of surface gravity kappa = a) couples to the
//      field correlator along its worldline. The 4D massless Wightman function on that worldline
//      depends only on the proper-time gap, W(dtau) ~ 1 / sinh^2(a(dtau - i eps)/2). The detector
//      response is its Fourier transform F(E) = integral dtau e^{-iE dtau} W(dtau). We compute F(E)
//      NUMERICALLY and find detailed balance F(E)/F(-E) = exp(-2 pi E / a): the thermal factor
//      emerges from the transform, it is not put in. So the temperature T = a/(2 pi) = kappa/(2 pi)
//      is read off, not assumed.
//   2. T ~ 1/M follows from the Schwarzschild surface gravity kappa = 1/(4M) and the derived
//      T = kappa/(2 pi): computing T at several masses and fitting gives T ~ M^-1.
//   3. The Page curve from random-state entanglement (Page 1993). For a black hole plus radiation in
//      a random pure state, the radiation's average entanglement entropy S(m,n) rises while the
//      radiation is the smaller subsystem and falls once it is larger, turning over at the Page time.
//      Computed from the entropy formula, it is a genuine turnover, not a drawn triangle.
// Run: npx tsx code/experiment/p71-hawking.ts

import { unruhDetectorResponse, temperatureFromDetailedBalance } from '@/code/measure/unruh'
import { pageAverageEntropy } from '@/code/measure/entanglement'
import { logLogSlope } from '@/code/measure/regression'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The Unruh detector response F(E): the magnitude of the transform of the worldline field correlator.
function unruhResponse(input: { E: number; a: number; eps: number; samples: number }): number {
  const f = unruhDetectorResponse({
    energy: input.E,
    kappa: input.a,
    eps: input.eps,
    halfWindow: 30,
    step: (2 * (30 / input.a)) / input.samples,
    prefactor: -1 / (4 * Math.PI * Math.PI),
  })
  return Math.hypot(f.real, f.imaginary)
}

// Temperature read off the detailed balance F(E)/F(-E) = exp(-E/T), averaged over several E.
function temperatureFromResponse(a: number, samples: number): number {
  return temperatureFromDetailedBalance({
    kappa: a,
    response: (E) => unruhResponse({ E, a, eps: 0.01 / a, samples }),
  })
}

export function hawking(input: Record<string, never> = {}): {
  fittedTemperature: number
  expectedTemperature: number
  thermalResidual: number
  spectrumThermal: boolean
  temperatureExponent: number
  pageCurveTurnsOver: boolean
  pagePeakFraction: number
  solved: boolean
} {
  void input
  const samples = 60000

  // 1. Thermal spectrum: detailed balance at a = 1 gives T = 1/(2 pi). Check the ratio matches the
  // thermal factor across several E (the residual is how far the emergent ratio is from exp(-2pi E)).
  const a = 1
  let thermalResidual = 0
  for (const E of [0.5, 1.0, 1.5, 2.0]) {
    const fp = unruhResponse({ E, a, eps: 0.01, samples })
    const fm = unruhResponse({ E: -E, a, eps: 0.01, samples })
    const ratio = fp / fm
    const expected = Math.exp((-2 * Math.PI * E) / a)
    thermalResidual = Math.max(thermalResidual, Math.abs(ratio - expected) / expected)
  }
  const fittedTemperature = temperatureFromResponse(a, samples)
  const expectedTemperature = a / (2 * Math.PI)
  const spectrumThermal = thermalResidual < 0.05 && Math.abs(fittedTemperature - expectedTemperature) < 0.02

  // 2. T ~ 1/M: Schwarzschild surface gravity kappa = 1/(4M), and the derived T = kappa/(2 pi).
  const masses = [1, 2, 4]
  const temps = masses.map((M) => temperatureFromResponse(1 / (4 * M), samples))
  // fit log T vs log M
  const temperatureExponent = logLogSlope(masses, temps)

  // 3. Page curve from random-state entanglement.
  const totalQubits = 12
  let peak = 0
  let peakFraction = 0
  const curve: number[] = []
  for (let q = 1; q < totalQubits; q++) {
    const s = pageAverageEntropy({ dimA: Math.pow(2, q), dimB: Math.pow(2, totalQubits - q) }) / Math.log(2)
    curve.push(s)
    if (s > peak) {
      peak = s
      peakFraction = q / totalQubits
    }
  }
  const pageCurveTurnsOver = (curve[0] ?? 0) < peak && (curve[curve.length - 1] ?? 0) < peak

  return {
    fittedTemperature,
    expectedTemperature,
    thermalResidual,
    spectrumThermal,
    temperatureExponent,
    pageCurveTurnsOver,
    pagePeakFraction: peakFraction,
    solved: spectrumThermal && Math.abs(temperatureExponent + 1) < 0.05 && pageCurveTurnsOver,
  }
}

export default experiment({
  id: 'gravity/hawking',
  title: 'thermal spectrum derived from the Unruh response, T = kappa/2pi, Page curve turns over',
  category: 'gravity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = hawking()
    const ok =
      r.solved &&
      r.spectrumThermal &&
      r.thermalResidual < 0.05 &&
      Math.abs(r.temperatureExponent + 1) < 0.05 &&
      r.pageCurveTurnsOver
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'detailed balance in the Unruh detector response gives a thermal spectrum at T = kappa/2pi with T scaling as 1/M and a turning Page curve',
      metrics: {
        fittedTemperature: r.fittedTemperature,
        expectedTemperature: r.expectedTemperature,
        thermalResidual: r.thermalResidual,
        temperatureExponent: r.temperatureExponent,
        pagePeakFraction: r.pagePeakFraction,
      },
    })
  },
})
