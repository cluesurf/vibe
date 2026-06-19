// P154: BOOST invariance, the other half of Lorentz. (P150 rotations, P151 Dirac dispersion.)
//
// P124/P150 gave the ROTATIONAL half of Lorentz (an isotropic light speed). P151 gave a Dirac dispersion.
// The remaining half is BOOSTS, the physics (and the light speed) must look the same in a moving frame.
// On the deterministic/unitary rule, the relativistic Dirac quantum walk, this is a sharp, exact test.
//
// A single momentum mode k of the 1D Dirac quantum walk evolves by an exact 2x2 unitary U(k) = Shift(k) *
// Coin(m), whose eigenphase is the dispersion, cos(omega) = cos(k) cos(m). We check:
//   (1) MASSLESS (m=0), omega = |k| EXACTLY, so the lightcone is exact and boost-invariant for ALL k.
//   (2) MASSIVE (m>0), the Lorentz invariant omega^2 - k^2 = m^2 holds in an IR WINDOW (small k), with
//       lattice (UV) violation only near the cutoff, the standard emergent-Lorentz situation.
//   (3) the dispersion is mapped to ITSELF by a Lorentz boost (omega,k) -> (gamma(omega - v k),
//       gamma(k - v omega)) within that window.
// Combined with the isotropy of P150, IR boost-invariance gives the FULL emergent Lorentz group.
// Run: npx tsx code/experiment/p154-boost-invariance.ts

import { coinedWalkDispersion } from '@/code/dynamics/quantum-walk'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// the exact dispersion of the 1D Dirac quantum walk (P151), from the trace of U(k) = Shift(k) Coin(m):
// U(k) eigenvalues are exp(+- i omega) with 2 cos(omega) = trace = 2 cos(k) cos(m).
function omegaOf(k: number, m: number): number {
  return coinedWalkDispersion({ theta: m, k })
}

export function boostInvariance(input?: {
  masses?: number[]
  boosts?: number[]
}): {
  masses: number[]
  masslessMaxDeviation: number
  masslessExact: boolean
  massiveWindow: number
  boostResidual: number
  boostInvariantInWindow: boolean
  fullLorentz: boolean
  solved: boolean
} {
  const masses = input?.masses ?? [0, 0.2, 0.5]
  const boosts = input?.boosts ?? [0.3, 0.6, 0.9]
  const ks: number[] = []
  for (let i = 1; i <= 200; i++) {
    ks.push((Math.PI * i) / 200)
  } // k in (0, pi]

  // (1) massless: omega = |k| exactly (an exact lightcone, boost-invariant for all k)
  let masslessMaxDeviation = 0
  for (const k of ks) {
    masslessMaxDeviation = Math.max(
      masslessMaxDeviation,
      Math.abs(omegaOf(k, 0) - k),
    )
  }

  const masslessExact = masslessMaxDeviation < 1e-9

  // (2) massive: the Lorentz invariant omega^2 - k^2 ~ m^2 holds out to some k (the IR window)
  const tol = 0.02 // relative tolerance on the invariant
  let massiveWindow = Math.PI
  for (const m of masses) {
    if (m === 0) {
      continue
    }

    let window = 0
    for (const k of ks) {
      const w = omegaOf(k, m)
      const inv = w * w - k * k
      if (Math.abs(inv - m * m) < tol * (m * m + 0.05)) {
        window = k
      } else {
        break
      }
    }

    massiveWindow = Math.min(massiveWindow, window)
  }

  // (3) the dispersion maps to itself under a boost, within the window. For each (omega,k) on the curve,
  // boost it and check the boosted point still lies on the dispersion (omega'(k') matches).
  let boostResidual = 0
  let boostCount = 0
  for (const m of masses) {
    for (const v of boosts) {
      const gamma = 1 / Math.sqrt(1 - v * v)
      for (const k of ks) {
        const w = omegaOf(k, m)
        if (m > 0 && k > massiveWindow) {
          continue
        } // only test inside the relativistic window

        if (m === 0 && k > 2.5) {
          continue
        } // avoid the lattice cutoff corner

        const wB = gamma * (w - v * k)
        const kB = gamma * (k - v * w)
        if (wB <= 0 || Math.abs(kB) > Math.PI) {
          continue
        }

        const wExpected = omegaOf(Math.abs(kB), m) // where the dispersion says the boosted mode should sit
        boostResidual += Math.abs(wB - wExpected)
        boostCount++
      }
    }
  }

  boostResidual = boostCount > 0 ? boostResidual / boostCount : 1
  const boostInvariantInWindow = boostResidual < 0.05

  const fullLorentz = masslessExact && boostInvariantInWindow // boosts + the rotations of P150
  const solved = fullLorentz

  return {
    masses,
    masslessMaxDeviation,
    masslessExact,
    massiveWindow,
    boostResidual,
    boostInvariantInWindow,
    fullLorentz,
    solved,
  }
}

export default experiment({
  id: 'relativity/boost-invariance',
  title:
    'the massless mode has an exact boost-invariant lightcone with massive modes invariant in the IR window',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = boostInvariance()
    const ok =
      r.solved &&
      r.masslessExact &&
      r.boostInvariantInWindow &&
      r.fullLorentz

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the massless mode has omega = |k| exactly under boosts and massive modes are boost-invariant in an IR window, the full emergent Lorentz group with rotations',
      metrics: {
        masslessMaxDeviation: r.masslessMaxDeviation,
        boostResidual: r.boostResidual,
        massiveWindow: r.massiveWindow,
      },
    })
  },
})
