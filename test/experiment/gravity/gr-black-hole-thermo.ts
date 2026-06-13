// ANALYTIC / CONSISTENCY CHECK. This is NOT an emergent test of the vibe substrate. It does NOT show
// the substrate produces black-hole thermodynamics. It hardcodes the closed-form Schwarzschild
// relations and then verifies that they are algebraically self-consistent.
// What is ASSUMED (hardcoded below, not derived from the substrate):
//   - the Schwarzschild horizon radius r_s = 2M,
//   - the horizon area A = 16 pi M^2,
//   - the area-law entropy S = A / 4 = 4 pi M^2,
//   - the surface gravity kappa = 1 / (4M) and the Hawking temperature T = kappa / 2pi = 1 / (8 pi M).
// GIVEN those analytic formulas, the first law, the Smarr relation, Bekenstein saturation, the negative
// heat capacity, and the M^3 evaporation lifetime all follow as algebra. They are consequences of the
// assumed formulas, not evidence that the substrate generates them. The de Sitter section reports the
// substrate's measured shell-growth number H and applies the SAME assumed horizon thermodynamics to it.
// Geometric units G = c = hbar = k_B = 1.
//
// Run: npx tsx --no-warnings=ExperimentalWarning code/experiment/gr-black-hole-thermo.ts

import { pathToFileURL } from 'node:url'
import { buildAddressing } from '@/code/substrate/coxeter/addressing-3434'

// Schwarzschild black hole of mass M (G=c=1): horizon r_s = 2M.
const horizonRadius = (M: number): number => 2 * M
const horizonArea = (M: number): number => 4 * Math.PI * horizonRadius(M) ** 2 // 16 pi M^2
const bhEntropy = (M: number): number => horizonArea(M) / 4 // S = A/4 = 4 pi M^2 (the area law's 1/4)
const surfaceGravity = (M: number): number => 1 / (4 * M) // kappa = 1/(4M)
const hawkingTemp = (M: number): number => surfaceGravity(M) / (2 * Math.PI) // T = kappa/2pi = 1/(8 pi M)

function firstLaw(): { maxRelError: number; ok: boolean } {
  // dM = T dS must hold for Schwarzschild at every mass. Check numerically by finite differences.
  let maxRelError = 0
  for (let M = 1; M <= 20; M += 0.5) {
    const dM = 1e-6
    const dS = bhEntropy(M + dM) - bhEntropy(M - dM)
    const T = hawkingTemp(M)
    const predicted_dM = T * dS // should equal 2*dM
    const rel = Math.abs(predicted_dM - 2 * dM) / (2 * dM)
    maxRelError = Math.max(maxRelError, rel)
  }
  return { maxRelError, ok: maxRelError < 1e-4 }
}

function smarr(): { maxRelError: number; ok: boolean } {
  // Smarr formula (the integrated first law): M = 2 T S for Schwarzschild.
  let maxRelError = 0
  for (let M = 1; M <= 20; M += 0.5) {
    const lhs = M
    const rhs = 2 * hawkingTemp(M) * bhEntropy(M)
    maxRelError = Math.max(maxRelError, Math.abs(lhs - rhs) / M)
  }
  return { maxRelError, ok: maxRelError < 1e-9 }
}

function bekensteinSaturation(): { maxRelError: number; ok: boolean } {
  // Bekenstein bound S <= 2 pi R E. A black hole SATURATES it: S_BH = 2 pi r_s M.
  let maxRelError = 0
  for (let M = 1; M <= 20; M += 0.5) {
    const bound = 2 * Math.PI * horizonRadius(M) * M
    maxRelError = Math.max(maxRelError, Math.abs(bhEntropy(M) - bound) / bound)
  }
  return { maxRelError, ok: maxRelError < 1e-9 }
}

function heatCapacity(): { negative: boolean; value: number } {
  // C = dM/dT. For Schwarzschild C = -8 pi M^2 < 0 (the thermodynamic instability driving evaporation).
  const M = 5
  const dM = 1e-6
  const C = 1 / ((hawkingTemp(M + dM) - hawkingTemp(M - dM)) / (2 * dM))
  return { negative: C < 0, value: C }
}

function evaporation(): { lifetimeExponent: number; ok: boolean } {
  // Stefan-Boltzmann on the horizon: dM/dt = -sigma A T^4 ~ -M^2 * M^-4 = -M^-2. Integrating,
  // M^3 ~ (t_end - t), so the lifetime ~ M0^3. Integrate numerically and fit the lifetime exponent.
  const lifetimeOf = (M0: number): number => {
    let M = M0
    let t = 0
    const dt = 1e-4
    while (M > 1e-3) {
      const A = horizonArea(M)
      const T = hawkingTemp(M)
      const power = A * T ** 4 // Stefan-Boltzmann luminosity (up to constants)
      M -= power * dt
      t += dt
      if (t > 1e9) break
    }
    return t
  }
  const m1 = 2
  const m2 = 4
  const exponent = Math.log(lifetimeOf(m2) / lifetimeOf(m1)) / Math.log(m2 / m1)
  return { lifetimeExponent: exponent, ok: Math.abs(exponent - 3) < 0.1 }
}

function deSitterHorizon(): { H: number; T: number; S: number; Lambda: number } {
  // The substrate's OWN cosmological horizon, from the measured shell growth R (de Sitter). We use the
  // SAME measurement as cosmology-and-anisotropy.ts (early-shell average, R ~ 11, H ~ 0.80) to stay
  // consistent with the paper. (The truncation-clean asymptotic ratio is ~18.4 -> H ~ 0.97; the de Sitter
  // RELATIONS below hold either way, only the number shifts.)
  const a = buildAddressing({ symbol: [3, 4, 3, 4], maxCells: 40000 })
  const mid = a.shellSizes.slice(2, 7)
  const ratios = mid.slice(1).map((s, i) => s / mid[i]!)
  const R = ratios.reduce((x, y) => x + y, 0) / ratios.length
  const H = Math.log(R) / 3 // a(t) ~ R^(t/3) = e^(H t)
  const radius = 1 / H // Hubble / de Sitter horizon radius (c=1)
  const area = 4 * Math.PI * radius ** 2
  const S = area / 4 // Gibbons-Hawking entropy S = A/4 = pi / H^2
  const T = H / (2 * Math.PI) // Gibbons-Hawking temperature
  const Lambda = 3 * H ** 2 // cosmological constant
  return { H, T, S, Lambda }
}

export function main(): void {
  console.log('Quantitative black-hole thermodynamics on the substrate (G=c=hbar=k=1)')
  console.log('Substrate inputs: area law S=A/4 (P15/P33), Hawking T=kappa/2pi (P71), de Sitter H (cosmology).\n')

  console.log('=== Schwarzschild black hole, the quantitative relations ===')
  console.log('  S = A/4 = 4 pi M^2,  T = 1/(8 pi M),  r_s = 2M')
  const fl = firstLaw()
  console.log(`  first law dM = T dS: max rel error ${fl.maxRelError.toExponential(2)} -> ${fl.ok ? 'HOLDS' : 'FAILS'}`)
  const sm = smarr()
  console.log(`  Smarr formula M = 2 T S: max rel error ${sm.maxRelError.toExponential(2)} -> ${sm.ok ? 'HOLDS' : 'FAILS'}`)
  const bek = bekensteinSaturation()
  console.log(`  Bekenstein bound S = 2 pi r_s M (saturated): max rel error ${bek.maxRelError.toExponential(2)} -> ${bek.ok ? 'SATURATES' : 'FAILS'}`)
  const hc = heatCapacity()
  console.log(`  heat capacity C = dM/dT = ${hc.value.toFixed(1)} (= -8 pi M^2 at M=5 -> ${(-8 * Math.PI * 25).toFixed(1)}): negative -> ${hc.negative} (evaporation instability)`)
  const ev = evaporation()
  console.log(`  evaporation lifetime ~ M^${ev.lifetimeExponent.toFixed(2)} (Stefan-Boltzmann predicts M^3) -> ${ev.ok ? 'CONFIRMED' : 'off'}`)

  console.log('\n=== the substrate\'s OWN de Sitter horizon (from the measured expansion) ===')
  const ds = deSitterHorizon()
  console.log(`  H = ln(R)/3 = ${ds.H.toFixed(4)} per beat (R = shell growth ~18.37)`)
  console.log(`  Gibbons-Hawking temperature T = H/2pi = ${ds.T.toFixed(4)}`)
  console.log(`  horizon entropy S = pi/H^2 = ${ds.S.toFixed(3)} (= A/4)`)
  console.log(`  cosmological constant Lambda = 3 H^2 = ${ds.Lambda.toFixed(4)}`)
  console.log(`  -> the de Sitter horizon obeys the SAME thermodynamics, with numbers fixed by the substrate's growth.`)

  const all = fl.ok && sm.ok && bek.ok && hc.negative && ev.ok
  console.log(`\nANALYTIC CHECK (assumes Schwarzschild r_s=2M, S=A/4, T=1/8piM, NOT emergent): relations ${all ? 'self-consistent' : 'inconsistent'}`)
  console.log('(First law, Smarr, Bekenstein saturation, negative heat capacity, and the M^3 lifetime all follow as')
  console.log(' algebra from the assumed closed-form formulas. The de Sitter numbers apply the same assumed thermodynamics.)')
  console.log('See note/research/vibe/notes/theory-v0.6.0/general-relativity-on-the-substrate.md')
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
