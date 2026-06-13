// P30: inflation from slow-roll, derived (not a hardcoded two-phase rate).
// The earlier version simply hardcoded a high spawn rate for the first few generations and a low one
// after, so the two phases were the two inputs and the WHY of inflation was never addressed. This
// version derives inflation from a slow-rolling inflaton field, the standard mechanism, by
// integrating its equations of motion:
//   H = sqrt( (1/2 phidot^2 + V(phi)) / 3 ),   phiddot = -3 H phidot - V'(phi),   dln a/dt = H,
// with V(phi) = 1/2 m^2 phi^2 (units 8 pi G = 1). Nothing about the two phases is put in. While the
// field is large it slow-rolls, the potential dominates, and the universe inflates with equation of
// state w near -1 (accelerating). Inflation ENDS by itself, a graceful exit, when the field rolls
// down to where the slow-roll parameter epsilon = (1/2)(V'/V)^2 reaches 1, after which the kinetic
// energy dominates and the expansion decelerates. The number of e-folds comes out as phi0^2/4,
// computed from the integration, not assigned.
// Run: npx tsx code/experiment/p30-inflation.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function inflate(input: { phi0: number; m?: number }): {
  efolds: number
  efoldsAnalytic: number
  wDuringInflation: number
  acceleratesDuringInflation: boolean
  gracefulExit: boolean
  enoughEfolds: boolean
  efoldsMatchesAnalytic: boolean
} {
  const m = input.m ?? 1
  const V = (p: number): number => 0.5 * m * m * p * p
  const Vp = (p: number): number => m * m * p
  const dt = 0.0005

  let phi = input.phi0
  let phid = 0 // start on the slow-roll attractor
  let lnA = 0
  let efoldsAtExit = 0
  let exited = false
  let wDuringInflation = 0
  let minAccelAfterExit = Infinity
  let sampledW = false

  for (let i = 0; i < 600000; i++) {
    const H = Math.sqrt(Math.max(0, (0.5 * phid * phid + V(phi)) / 3))
    // acceleration: a''/a = (V - phidot^2) / 3 (positive while the potential dominates).
    const accel = (V(phi) - phid * phid) / 3
    const eps = 0.5 * (Vp(phi) / Math.max(1e-30, V(phi))) ** 2
    if (i === 500 && !sampledW) {
      wDuringInflation = (0.5 * phid * phid - V(phi)) / Math.max(1e-30, 0.5 * phid * phid + V(phi))
      sampledW = true
    }
    if (!exited && eps >= 1) {
      efoldsAtExit = lnA
      exited = true
    }
    if (exited) minAccelAfterExit = Math.min(minAccelAfterExit, accel)
    // RK4 step on (phi, phid); lnA by H dt.
    const deriv = (p: number, pd: number): { dp: number; dpd: number } => {
      const h = Math.sqrt(Math.max(0, (0.5 * pd * pd + V(p)) / 3))
      return { dp: pd, dpd: -3 * h * pd - Vp(p) }
    }
    const k1 = deriv(phi, phid)
    const k2 = deriv(phi + 0.5 * dt * k1.dp, phid + 0.5 * dt * k1.dpd)
    const k3 = deriv(phi + 0.5 * dt * k2.dp, phid + 0.5 * dt * k2.dpd)
    const k4 = deriv(phi + dt * k3.dp, phid + dt * k3.dpd)
    phi += (dt / 6) * (k1.dp + 2 * k2.dp + 2 * k3.dp + k4.dp)
    phid += (dt / 6) * (k1.dpd + 2 * k2.dpd + 2 * k3.dpd + k4.dpd)
    lnA += H * dt
    if (exited && Math.abs(phi) < 0.1 && Math.abs(phid) < 0.1) break
  }

  const efoldsAnalytic = (input.phi0 * input.phi0) / 4
  return {
    efolds: efoldsAtExit,
    efoldsAnalytic,
    wDuringInflation,
    // During slow-roll the potential dominates, so the expansion accelerates (w near -1).
    acceleratesDuringInflation: wDuringInflation < -1 / 3,
    // After the field exits slow-roll, the kinetic energy makes the expansion decelerate.
    gracefulExit: exited && minAccelAfterExit < 0,
    enoughEfolds: efoldsAtExit >= 60,
    efoldsMatchesAnalytic: Math.abs(efoldsAtExit - efoldsAnalytic) / efoldsAnalytic < 0.05,
  }
}

export default defineExperiment({
  id: 'cosmology/inflation',
  title: 'slow-roll derived (w ~ -1, e-folds = phi0^2/4 computed, graceful exit emerges)',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = inflate({ phi0: 16 })
    const ok = r.acceleratesDuringInflation && r.enoughEfolds && r.efoldsMatchesAnalytic && r.gracefulExit
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'integrating the slow-roll inflaton gives an accelerating phase of e-folds phi0^2/4 with a graceful exit, nothing put in by hand',
      metrics: {
        wDuringInflation: r.wDuringInflation,
        efolds: r.efolds,
        efoldsAnalytic: r.efoldsAnalytic,
      },
    })
  },
})
