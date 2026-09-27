// Fits of a Bogoliubov spectrum |beta / alpha|^2 (omega) read by exact projection (code/measure/headroom-bogoliubov):
// the Planck form a - ln(e^(omega / T) - 1) and the power law ln r = a + p ln omega. Used by E-GRV-0134's register scan;
// E-GRV-0132 holds the same Planck fit inline (its file predates this module). Real numbers, measurement only.

import { linearFit } from '@/code/measure/regression'

// `edge` is true when the minimum sits at the search's end, so the fit is a bound and not a value
export type PlanckFit = { readonly temperature: number; readonly offset: number; readonly residual: number; readonly edge: boolean }

// the least-squares Planck fit ln r = a - ln(e^(omega / T) - 1): for each T the best a is the mean residual, and T is
// found by golden section on ln T over a decade each side of `guess` (200 steps, far below any quoted digit)
export function planckFit(omegas: readonly number[], ratios: readonly number[], guess: number): PlanckFit {
  if (omegas.length !== ratios.length || omegas.length < 2) throw new Error('planckFit: two or more matched points')
  if (!ratios.every(r => r > 0 && Number.isFinite(r))) throw new Error('planckFit: every ratio positive and finite')

  const ys = ratios.map(Math.log)
  const at = (t: number): { a: number; rms: number } => {
    const shape = omegas.map(w => -Math.log(Math.expm1(w / t)))
    const a = ys.reduce((s, y, i) => s + y - shape[i]!, 0) / ys.length
    const rms = Math.sqrt(ys.reduce((s, y, i) => s + (y - a - shape[i]!) ** 2, 0) / ys.length)

    return { a, rms }
  }
  let lo = Math.log(guess / 10)
  let hi = Math.log(guess * 10)
  const phi = (Math.sqrt(5) - 1) / 2

  for (let i = 0; i < 200; i++) {
    const m1 = hi - phi * (hi - lo)
    const m2 = lo + phi * (hi - lo)

    if (at(Math.exp(m1)).rms < at(Math.exp(m2)).rms) hi = m2
    else lo = m1
  }

  const temperature = Math.exp((lo + hi) / 2)
  const best = at(temperature)
  const edge = Math.abs(Math.log(temperature / guess)) > Math.log(10) - 1e-6

  return { temperature, offset: best.a, residual: best.rms, edge }
}

// the Planck fit's value at omega
export const planckAt = (fit: PlanckFit, omega: number): number => Math.exp(fit.offset - Math.log(Math.expm1(omega / fit.temperature)))

// the power law ln r = a + p ln omega by least squares: p (negative for a falling spectrum) and the rms of ln r about it
export function powerLaw(omegas: readonly number[], ratios: readonly number[]): { exponent: number; residual: number } {
  const xs = omegas.map(Math.log)
  const ys = ratios.map(Math.log)
  const f = linearFit({ xs, ys })
  const residual = Math.sqrt(ys.reduce((s, y, i) => s + (y - f.intercept - f.slope * xs[i]!) ** 2, 0) / ys.length)

  return { exponent: f.slope, residual }
}
