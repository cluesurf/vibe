// P191: the directional rule carries MOMENTUM and a DIRAC MASS. (1) a charge with a direction (coin) streams
// BALLISTICALLY while a memoryless scalar DIFFUSES, and the collision mixing is the MASS, (2) the emergent
// dispersion is the Dirac relation cos E = cos(theta) cos(k), E(0) = theta (rest mass), E^2 - k^2 = m^2 at
// long wavelength (Lorentz). Ported from the throwaway probes.
// Run: npx tsx code/experiment/p191-directional-rule.ts

import { pathToFileURL } from 'node:url'

// (1) persistent walk (the directional rule for one charge) vs random walk (scalar): displacement vs time
function walk(mix: number, T: number, trials: number, seed: number): number {
  let rng = seed
  const rnd = (): number => { rng = (rng * 1103515245 + 12345) & 0x7fffffff; return rng / 0x7fffffff }
  const dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]
  let tot = 0
  for (let t = 0; t < trials; t++) {
    let x = 0, y = 0, z = 0, d = Math.floor(rnd() * 6)
    for (let s = 0; s < T; s++) {
      if (rnd() < mix) d = Math.floor(rnd() * 6) // collision scrambles direction = mass
      x += dirs[d]![0]!; y += dirs[d]![1]!; z += dirs[d]![2]!
    }
    tot += Math.hypot(x, y, z)
  }
  return tot / trials
}

export function directionalRule(): { ballistic: number; diffusive: number; diracOk: boolean } {
  const T = 64
  const ballistic = walk(0.0, T, 1, 1)
  const small = walk(0.05, T, 400, 7)
  const heavy = walk(0.3, T, 400, 9)
  const diffusive = walk(1.0, T, 400, 11)
  console.log(`P191 (1) directional rule, displacement after ${T} beats (ballistic~${T}, diffusive~${Math.sqrt(T).toFixed(1)}):`)
  console.log(`  coin no-scatter ${ballistic.toFixed(1)}, small mass ${small.toFixed(1)}, heavy ${heavy.toFixed(1)}, scalar ${diffusive.toFixed(1)}`)
  console.log(`  => coin propagates ballistically, scalar diffuses, mixing = mass.\n`)

  // (2) Dirac dispersion cos E = cos(theta) cos(k)
  console.log('P191 (2) Dirac dispersion cos E = cos(m) cos(k):')
  let diracOk = true
  for (const m of [0.0, 0.2, 0.6]) {
    const E0 = Math.acos(Math.cos(m) * Math.cos(0))
    const k = 0.1, Ek = Math.acos(Math.cos(m) * Math.cos(k)), rel = Math.sqrt(m * m + k * k)
    if (Math.abs(E0 - m) > 1e-6 || Math.abs((Ek * Ek - k * k) - m * m) > 1e-2) diracOk = false
    console.log(`  m=${m}: E(0)=${E0.toFixed(3)} (rest mass), E(0.1)^2-k^2=${(Ek * Ek - k * k).toFixed(3)} vs m^2=${(m * m).toFixed(3)}`)
  }
  console.log(`  => rest mass = coin angle, E^2-k^2=m^2 (Lorentz, c=1) at long wavelength: ${diracOk}`)
  return { ballistic, diffusive, diracOk }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = directionalRule()
  console.log(`SOLVED: ballistic ${r.ballistic.toFixed(0)} vs diffusive ${r.diffusive.toFixed(1)}, Dirac ${r.diracOk}`)
}
