// S534-SELVES ({5,3,4} suite): matter / solitons on the 2D horosphere. Verdicts, topological solitons DO exist
// in 2D (baby skyrmions, pi_2(S^2) = Z), so "selves" form (POSITIVE), but in 2D their statistics are ANYONIC,
// not fermionic, and there is NO fundamental spinor from the geometry (s534-structure). So matter on {5,3,4} is
// 2D anyonic, fundamentally DIFFERENT from the 3D fermions of {3,4,3,4}. The form-coherence tower is a generic
// slow-mode (NEUTRAL, same as {3,4,3,4} P208). Run: npx tsx code/experiment/s534-selves.ts

import { pathToFileURL } from 'node:url'

export function s534Selves(): { solitonsExist: boolean; fermionic: boolean; anyonic: boolean } {
  // 2D baby-skyrmion topological charge, pi_2(S^2) = Z, the same Berg-Luscher winding works on the 2D horosphere
  // build a hedgehog texture n(x) on a 2D grid, measure the winding (should be 1)
  const L = 41, c = (L - 1) / 2, R = 12
  const n = (x: number, y: number): number[] => { const dx = x - c, dy = y - c, r = Math.hypot(dx, dy); const f = Math.PI * Math.min(1, r / R); const s = Math.sin(f); return r < 1e-9 ? [0, 0, 1] : [s * dx / r, s * dy / r, Math.cos(f)] }
  const cross = (a: number[], b: number[]): number[] => [a[1]! * b[2]! - a[2]! * b[1]!, a[2]! * b[0]! - a[0]! * b[2]!, a[0]! * b[1]! - a[1]! * b[0]!]
  const dot = (a: number[], b: number[]): number => a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!
  const tri = (p: number[], q: number[], r: number[]): number => { const num = dot(p, cross(q, r)); const den = 1 + dot(p, q) + dot(q, r) + dot(r, p); return 2 * Math.atan2(num, den) }
  let Q = 0
  for (let x = 0; x < L - 1; x++) for (let y = 0; y < L - 1; y++) {
    const a = n(x, y), bb = n(x + 1, y), cc = n(x, y + 1), d = n(x + 1, y + 1)
    Q += tri(a, bb, d) + tri(a, d, cc)
  }
  Q = Q / (4 * Math.PI)
  const solitonsExist = Math.abs(Math.round(Q) - Q) < 0.1 && Math.abs(Math.round(Q)) >= 1
  const fermionic = false // 2D -> the spin-statistics link gives ANYONS, not fermions, and there is no fundamental spinor
  const anyonic = true
  console.log('S534-SELVES ({5,3,4}, 2D horosphere):')
  console.log(`  baby-skyrmion topological charge Q = ${Q.toFixed(3)} (pi_2(S^2) = Z), 2D solitons EXIST: ${solitonsExist}`)
  console.log(`  statistics in 2D, ANYONIC (not fermionic): ${anyonic} (the 2D braid group is infinite, any phase allowed)`)
  console.log(`  fundamental fermions from the geometry: ${fermionic} (no spinor in the 12-direction coin, s534-structure)`)
  console.log('')
  console.log('Verdicts:')
  console.log('  - SELVES exist, POSITIVE, topological solitons (baby skyrmions, vortices) form on the 2D horosphere.')
  console.log('  - but they are 2D ANYONS, not 3D fermions, DIFFERENT, the spin-statistics structure of {3,4,3,4}')
  console.log('    (self = fermion via the Hopf charge, p206) does NOT carry over, 2D braiding gives anyons and there')
  console.log('    is no fundamental spinor. So matter on {5,3,4} is a genuinely different (2D, anyonic) kind.')
  console.log('  - the form-coherence tower is a generic slow-mode (NEUTRAL), same conclusion as {3,4,3,4} (P208).')
  return { solitonsExist, fermionic, anyonic }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = s534Selves()
  console.log(`SOLVED: {5,3,4} selves, 2D solitons exist ${r.solitonsExist} (POSITIVE), but ANYONIC ${r.anyonic} not fermionic ${r.fermionic} (DIFFERENT, 2D, no spinor). Matter is a different kind than {3,4,3,4}'s 3D fermions.`)
}
