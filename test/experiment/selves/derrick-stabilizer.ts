// P194: the stabilizer gate. (1) Derrick scaling, in 3D exchange alone COLLAPSES a soliton, exchange+Skyrme
// has a stable MINIMUM (2D is marginal); (2) the soliton prerequisite, the SCALAR tone has no topology (no
// solitons) but the DIRECTIONAL order parameter (a direction field) carries winding (solitons exist).
// Ported from the throwaway probes. Run: npx tsx code/experiment/p194-derrick-stabilizer.ts

import { pathToFileURL } from 'node:url'

export function derrickStabilizer(): { stable3D: boolean; scalarWinds: boolean; directionWinds: boolean } {
  // (1) Derrick: E(lambda) = A*lambda^(d-2) [exchange] + B*lambda^(d-4) [Skyrme]
  const E = (l: number, d: number, A: number, B: number): number => A * l ** (d - 2) + B * l ** (d - 4)
  console.log('P194 (1) Derrick scaling E(lambda), exchange + Skyrme:')
  for (const d of [2, 3]) {
    const exOnly = [0.25, 0.5, 1, 2, 4].map((l) => Math.round(E(l, d, 1, 0) * 100) / 100)
    const exSk = [0.25, 0.5, 1, 2, 4].map((l) => Math.round(E(l, d, 1, 1) * 100) / 100)
    console.log(`  d=${d}: exchange-only ${JSON.stringify(exOnly)}  exchange+Skyrme ${JSON.stringify(exSk)}`)
  }
  // 3D exchange+Skyrme has an interior minimum (stable); 2D exchange is flat (marginal)
  const vals = [0.25, 0.5, 1, 2, 4].map((l) => E(l, 3, 1, 1))
  const minIdx = vals.indexOf(Math.min(...vals))
  const stable3D = minIdx > 0 && minIdx < vals.length - 1
  console.log(`  => 3D needs a Skyrme term, exchange+Skyrme has an interior minimum (stable soliton): ${stable3D}`)
  console.log(`     2D is scale-marginal (exchange alone suffices). The gate, does the rule supply the Skyrme term.\n`)

  // (2) soliton prerequisite: winding of a scalar (none) vs a direction field (yes)
  const N = 21, c = N >> 1
  const winding = (ang: (x: number, y: number) => number): number => {
    const loop: [number, number][] = []
    for (let x = 0; x < N; x++) loop.push([x, 0])
    for (let y = 1; y < N; y++) loop.push([N - 1, y])
    for (let x = N - 2; x >= 0; x--) loop.push([x, N - 1])
    for (let y = N - 2; y > 0; y--) loop.push([0, y])
    let tot = 0
    for (let i = 0; i < loop.length; i++) {
      let dd = ang(loop[(i + 1) % loop.length]![0], loop[(i + 1) % loop.length]![1]) - ang(loop[i]![0], loop[i]![1])
      while (dd > Math.PI) dd -= 2 * Math.PI
      while (dd < -Math.PI) dd += 2 * Math.PI
      tot += dd
    }
    return Math.round(tot / (2 * Math.PI))
  }
  const scalarWind = winding(() => 0) // a scalar has no angle, cannot wind
  const dirWind = winding((x, y) => Math.atan2(y - c, x - c)) // a direction field can (a vortex)
  console.log('P194 (2) soliton prerequisite (does the order parameter carry topology?):')
  console.log(`  scalar tone winding = ${scalarWind} (no topology, NO solitons)`)
  console.log(`  direction field (vortex) winding = ${dirWind} (topology -> solitons exist)`)
  console.log('  => the SCALAR tone cannot host solitons; the DIRECTIONAL order parameter can (vortices in 2D,')
  console.log('     skyrmions/hopfions in 3D). Adopting the directional rule is what enables topological selves.')
  return { stable3D, scalarWinds: scalarWind !== 0, directionWinds: dirWind !== 0 }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = derrickStabilizer()
  console.log(`SOLVED: 3D stable with Skyrme ${r.stable3D}, scalar winds ${r.scalarWinds}, direction winds ${r.directionWinds}`)
}
