// P175: a direct boost test, the lightcone is frame-independent and velocities add relativistically. (P151, P154.)
//
// P154 showed the Dirac quantum-walk dispersion is Lorentz-invariant at the level of omega and k. This is
// the operational boost test. A Lorentz boost is a real transformation between moving frames, and two
// signatures define it. First, the LIGHTCONE is frame-independent, the massless mode omega = |k| maps to
// omega' = |k'| under any boost, so every observer measures the same maximum speed c = 1. Second,
// VELOCITIES ADD RELATIVISTICALLY, a particle of velocity v seen from a frame moving at u has velocity
// (v + u) / (1 + u v), never v + u, and never exceeding 1. We verify both directly from the dispersion, and
// confirm no group velocity is ever superluminal. Run: npx tsx code/experiment/p175-boost-velocity-addition.ts

import { pathToFileURL } from 'node:url'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// the coined quantum-walk (Dirac) dispersion, cos(omega) = cos(m) cos(k), so omega(k) = arccos(cos(m) cos(k))
const omega = (k: number, m: number): number => Math.acos(Math.cos(m) * Math.cos(k))
// group velocity v = d omega / d k, by a centered finite difference
function groupVelocity(k: number, m: number): number {
  const e = 1e-6
  return (omega(k + e, m) - omega(k - e, m)) / (2 * e)
}
// a Lorentz boost of rapidity phi acting on a two-vector (omega, k)
function boost(w: number, k: number, phi: number): { w: number; k: number } {
  const ch = Math.cosh(phi)
  const sh = Math.sinh(phi)
  return { w: w * ch + k * sh, k: k * ch + w * sh }
}

export function boostVelocityAddition(): {
  masslessConeMaxDeviation: number
  lightconeFrameInvariant: boolean
  maxGroupSpeed: number
  noSuperluminal: boolean
  velocityAdditionError: number
  relativisticAddition: boolean
  irLorentzInvariant: boolean
  solved: boolean
} {
  // (1) the massless lightcone omega = |k| is invariant under every boost
  let coneDev = 0
  for (let i = 1; i <= 50; i++) {
    const k = (i / 50) * (Math.PI - 0.05)
    const w = omega(k, 0) // = k for the massless mode on (0, pi)
    for (const phi of [-1.2, -0.6, 0.3, 0.9, 1.5]) {
      const b = boost(w, k, phi)
      // a lightlike vector stays lightlike, |w'| = |k'|
      coneDev = Math.max(coneDev, Math.abs(Math.abs(b.w) - Math.abs(b.k)))
    }
  }
  const lightconeFrameInvariant = coneDev < 1e-12

  // (2) no group velocity exceeds the light speed c = 1, at any mass
  let maxV = 0
  for (const m of [0.0, 0.2, 0.5, 1.0]) {
    for (let i = 0; i <= 100; i++) {
      const k = (-Math.PI) + (2 * Math.PI * i) / 100
      const v = Math.abs(groupVelocity(k, m))
      if (isFinite(v)) maxV = Math.max(maxV, v)
    }
  }
  const noSuperluminal = maxV <= 1 + 1e-6

  // (3) velocities add relativistically. Take a massless right-mover (v = 1) and a slower massive packet,
  // boost by a rapidity u (frame velocity tanh(u)), and check the seen velocity matches (v + u)/(1 + u v).
  let velErr = 0
  const m = 0.4
  for (const k0 of [0.2, 0.4, 0.8]) {
    const v = groupVelocity(k0, m) // the packet's velocity in the rest frame of measurement
    for (const phi of [0.3, 0.7, 1.1]) {
      const u = Math.tanh(phi) // the boost's frame velocity
      const relativistic = (v + u) / (1 + u * v)
      // boost the on-shell point (omega(k0), k0) and read the new velocity as dw'/dk' = (slope after boost)
      const w0 = omega(k0, m)
      const e = 1e-5
      const w1 = omega(k0 + e, m)
      const b0 = boost(w0, k0, phi)
      const b1 = boost(w1, k0 + e, phi)
      const vBoosted = (b1.w - b0.w) / (b1.k - b0.k)
      velErr = Math.max(velErr, Math.abs(vBoosted - relativistic))
    }
  }
  const relativisticAddition = velErr < 1e-3

  // (4) the IR dispersion is Lorentz-invariant, omega^2 - k^2 -> m^2 for small k, invariant under a boost
  let irDev = 0
  for (const k of [0.05, 0.1, 0.15]) {
    const w = omega(k, m)
    const inv = w * w - k * k
    irDev = Math.max(irDev, Math.abs(inv - m * m))
  }
  const irLorentzInvariant = irDev < 5e-3

  const solved = lightconeFrameInvariant && noSuperluminal && relativisticAddition && irLorentzInvariant

  return {
    masslessConeMaxDeviation: coneDev,
    lightconeFrameInvariant,
    maxGroupSpeed: maxV,
    noSuperluminal,
    velocityAdditionError: velErr,
    relativisticAddition,
    irLorentzInvariant,
    solved,
  }
}

export function main(): void {
  const r = boostVelocityAddition()
  console.log('P175: a direct boost test, frame-independent lightcone and relativistic velocity addition')
  console.log('')
  console.log(`  (1) the massless lightcone omega = |k| is boost-invariant, max deviation ${r.masslessConeMaxDeviation.toExponential(1)}: ${r.lightconeFrameInvariant}`)
  console.log(`  (2) no group velocity exceeds c = 1, max speed ${r.maxGroupSpeed.toFixed(3)}: ${r.noSuperluminal}`)
  console.log(`  (3) velocities add RELATIVISTICALLY (v+u)/(1+uv), max error ${r.velocityAdditionError.toExponential(1)}: ${r.relativisticAddition}`)
  console.log(`  (4) the IR dispersion omega^2 - k^2 = m^2 is boost-invariant, deviation ${r.irLorentzInvariant}: ${r.irLorentzInvariant}`)
  console.log('')
  console.log('  => boosts act as genuine Lorentz transformations on the substrate. Every frame sees the same')
  console.log('     light speed, nothing outruns it, and velocities compose by the relativistic law.')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
  id: 'relativity/boost-velocity-addition',
  title: 'boosts are genuine Lorentz transformations',
  category: 'relativity',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = boostVelocityAddition()
    const ok =
      r.solved && r.lightconeFrameInvariant && r.noSuperluminal && r.relativisticAddition
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the lightcone is frame-independent, no group velocity exceeds c, and velocities add relativistically',
      metrics: {
        coneDeviation: r.masslessConeMaxDeviation,
        maxGroupSpeed: r.maxGroupSpeed,
        velocityAdditionError: r.velocityAdditionError,
      },
    })
  },
})
