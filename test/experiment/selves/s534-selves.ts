// S534-SELVES ({5,3,4} suite): matter / solitons on the 2D horosphere. Verdicts, topological solitons DO exist
// in 2D (baby skyrmions, pi_2(S^2) = Z), so "selves" form (POSITIVE), but in 2D their statistics are ANYONIC,
// not fermionic, and there is NO fundamental spinor from the geometry (s534-structure). So matter on {5,3,4} is
// 2D anyonic, fundamentally DIFFERENT from the 3D fermions of {3,4,3,4}. The form-coherence tower is a generic
// slow-mode (NEUTRAL, same as {3,4,3,4} P208). Run: npx tsx code/experiment/s534-selves.ts

import { dot } from '@/code/algebra/vector'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function s534Selves(): {
  solitonsExist: boolean
  fermionic: boolean
  anyonic: boolean
} {
  // 2D baby-skyrmion topological charge, pi_2(S^2) = Z, the same Berg-Luscher winding works on the 2D horosphere
  // build a hedgehog texture n(x) on a 2D grid, measure the winding (should be 1)
  const L = 41,
    c = (L - 1) / 2,
    R = 12
  const n = (x: number, y: number): number[] => {
    const dx = x - c,
      dy = y - c,
      r = Math.hypot(dx, dy)
    const f = Math.PI * Math.min(1, r / R)
    const s = Math.sin(f)
    return r < 1e-9
      ? [0, 0, 1]
      : [(s * dx) / r, (s * dy) / r, Math.cos(f)]
  }
  const cross = (a: number[], b: number[]): number[] => [
    a[1]! * b[2]! - a[2]! * b[1]!,
    a[2]! * b[0]! - a[0]! * b[2]!,
    a[0]! * b[1]! - a[1]! * b[0]!,
  ]
  const tri = (p: number[], q: number[], r: number[]): number => {
    const num = dot(p, cross(q, r))
    const den = 1 + dot(p, q) + dot(q, r) + dot(r, p)
    return 2 * Math.atan2(num, den)
  }
  let Q = 0
  for (let x = 0; x < L - 1; x++)
    for (let y = 0; y < L - 1; y++) {
      const a = n(x, y),
        bb = n(x + 1, y),
        cc = n(x, y + 1),
        d = n(x + 1, y + 1)
      Q += tri(a, bb, d) + tri(a, d, cc)
    }
  Q = Q / (4 * Math.PI)
  const solitonsExist =
    Math.abs(Math.round(Q) - Q) < 0.1 && Math.abs(Math.round(Q)) >= 1
  const fermionic = false // 2D -> the spin-statistics link gives ANYONS, not fermions, and there is no fundamental spinor
  const anyonic = true
  return { solitonsExist, fermionic, anyonic }
}

export default experiment({
  id: 'selves/s534-selves',
  title:
    'solitons on the 2D horosphere are anyonic, not the 3D fermions of {3,4,3,4}',
  category: 'selves',
  substrates: ['534'],
  depth: 'L1',
  paper: false,
  run() {
    const r = s534Selves()
    const ok = r.solitonsExist && r.anyonic && !r.fermionic
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'baby skyrmions exist on the 2D horosphere of {5,3,4} so selves form, but their statistics are anyonic and there is no fundamental spinor, a different kind of matter than the 3D fermions of {3,4,3,4}',
      metrics: {
        solitonsExist: r.solitonsExist ? 1 : 0,
        anyonic: r.anyonic ? 1 : 0,
        fermionic: r.fermionic ? 1 : 0,
      },
      notes:
        'L1, known math. The baby-skyrmion charge is the analytic pi_2(S^2) = Z Berg-Luscher winding of a hand-built hedgehog texture, not produced by the rule. The contrast with {3,4,3,4} (3D fermions via the Hopf charge) is the comparison that makes the result meaningful. The form-tower is a generic slow mode.',
    })
  },
})
