// P230 (derive the Dirac walk FROM the discrete rule, by simulation, not the analytic formula): the directional
// rule's single-particle sector is a 2-component (left/right mover) walk. We SIMULATE the discrete rule and
// MEASURE its dispersion E(k) (the oscillation frequency of a real plane wave, by DFT). Discreteness, the
// MASSLESS case is EXACTLY a discrete shift (a permutation), giving E(k) = k, the relativistic LIGHT CONE with
// no continuity at all. The MASS is the emergent coarse-grained mixing (discrete direction-flips at a rate),
// and with it the measured dispersion is the Dirac relation cos E = cos(m) cos(k). So the base is the discrete
// shift + discrete flips, the Dirac equation is the emergent description. Run: npx tsx code/experiment/p230-dirac-from-discrete.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const LX = 256

// simulate the 2-component discrete walk, return the measured frequency E for a given wavenumber index kIdx
function measureE(kIdx: number, mass: number, T: number): number {
  const k = (2 * Math.PI * kIdx) / LX
  // real plane-wave right-mover seed
  let R = new Float64Array(LX), L = new Float64Array(LX)
  for (let x = 0; x < LX; x++) { R[x] = Math.cos(k * x); L[x] = 0 }
  const series = new Float64Array(T)
  const Rn = new Float64Array(LX), Ln = new Float64Array(LX)
  const cm = Math.cos(mass), sm = Math.sin(mass)
  for (let t = 0; t < T; t++) {
    series[t] = R[0]! // track one cell's right-mover component
    // SHIFT (exactly discrete, a permutation): R moves +1, L moves -1
    for (let x = 0; x < LX; x++) { Rn[x] = R[(x - 1 + LX) % LX]!; Ln[x] = L[(x + 1) % LX]! }
    // COIN / MASS (emergent coarse-grained mixing; massless = identity = pure discrete shift)
    if (mass === 0) { R.set(Rn); L.set(Ln) }
    else { for (let x = 0; x < LX; x++) { const r = Rn[x]!, l = Ln[x]!; R[x] = cm * r - sm * l; L[x] = sm * r + cm * l } }
  }
  // DFT: find the dominant frequency bin
  let bestF = 0, bestP = -1
  for (let f = 1; f < T / 2; f++) {
    let re = 0, im = 0
    for (let t = 0; t < T; t++) { const ph = (-2 * Math.PI * f * t) / T; re += series[t]! * Math.cos(ph); im += series[t]! * Math.sin(ph) }
    const p = re * re + im * im
    if (p > bestP) { bestP = p; bestF = f }
  }
  return (2 * Math.PI * bestF) / T
}

export function diracFromDiscrete(): { masslessOk: boolean; massiveOk: boolean } {
  const T = 512
  console.log('P230 Dirac dispersion measured FROM the simulated discrete walk:')
  // (1) MASSLESS = exactly the discrete shift -> E(k) = k (the light cone), no continuity
  console.log('  (1) massless (pure discrete shift, a permutation), measured E(k) vs k:')
  let masslessOk = true
  for (const kIdx of [8, 16, 32, 48]) {
    const k = (2 * Math.PI * kIdx) / LX, E = measureE(kIdx, 0, T)
    const ok = Math.abs(E - k) < 0.05
    if (!ok) masslessOk = false
    console.log(`    k=${k.toFixed(3)}: measured E=${E.toFixed(3)} (expect E=k for the light cone) ${ok ? 'OK' : 'X'}`)
  }
  console.log(`  => the massless relativistic LIGHT CONE (E=k) is EXACTLY the discrete shift: ${masslessOk}`)
  // (2) MASSIVE (emergent mixing rate m) -> cos E = cos(m) cos(k), the Dirac relation
  const m = 0.6
  console.log(`  (2) massive (emergent mixing m=${m}), check cos E = cos(m) cos(k):`)
  let massiveOk = true
  for (const kIdx of [8, 24, 48]) {
    const k = (2 * Math.PI * kIdx) / LX, E = measureE(kIdx, m, T)
    const lhs = Math.cos(E), rhs = Math.cos(m) * Math.cos(k)
    const ok = Math.abs(lhs - rhs) < 0.05
    if (!ok) massiveOk = false
    console.log(`    k=${k.toFixed(3)}: cos E=${lhs.toFixed(3)} vs cos(m)cos(k)=${rhs.toFixed(3)} ${ok ? 'OK' : 'X'}; rest mass E(0)~m: E(k=0 limit)`)
  }
  const E0 = measureE(2, m, T)
  console.log(`    near k=0: E=${E0.toFixed(3)} (rest mass = m = ${m})`)
  console.log(`  => the massive DIRAC dispersion cos E = cos(m) cos(k) emerges, with mass = the coarse-grained mixing: ${massiveOk}`)
  console.log('  HONEST: the massless light cone is EXACTLY discrete (a permutation). The mass m is EMERGENT (the')
  console.log('  coarse-grained rate of discrete direction-flips). The Dirac equation and its complex amplitudes are')
  console.log('  the emergent description of the real discrete walk\'s oscillation modes. Base discrete, Dirac emergent.')
  return { masslessOk, massiveOk }
}

export default defineExperiment({
  id: 'relativity/dirac-from-discrete',
  title: 'the discrete walk dispersion measured by DFT, massless light cone and massive Dirac',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = diracFromDiscrete()
    const mass = 0.6
    const massCheckK = (2 * Math.PI * 24) / 256
    const massE = measureE(24, mass, 512)
    const ok = r.masslessOk && r.massiveOk
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the dispersion measured by DFT from the simulated two-component discrete walk is the light cone E = k when massless and the Dirac relation cos E = cos(m) cos(k) when massive',
      metrics: {
        measuredCosE: Math.cos(massE),
        expectedCosEMassive: Math.cos(mass) * Math.cos(massCheckK),
      },
      notes:
        'L2, the Dirac quantum walk reproduced on the discrete shift. The dispersion is MEASURED (the dominant DFT frequency of the real plane wave), not assumed. The massless case is an exact permutation giving E = k, which is the control against the massive Dirac branch. The mass is the emergent coarse-grained direction-flip rate. No random seeds, the walk is deterministic from a fixed plane-wave start.',
    })
  },
})
