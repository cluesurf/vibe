// Conformance for code/dynamics/director-relaxation: nematic director heat flow on a ring (mod-pi).
// Invariants:
//   - a UNIFORM director is a fixed point (no neighbour difference, no change).
//   - SMOOTHING: relaxation reduces the maximum nearest-neighbour angle gradient of a perturbed field.
//   - DETERMINISM.

import { suite, check, close, ok, equal } from '@/test/code/harness'
import { relaxDirector } from '@/code/dynamics/director-relaxation'

// the maximum mod-pi-folded nearest-neighbour angle difference around the ring
function maxGradient(phi: readonly number[]): number {
  const n = phi.length
  let m = 0
  for (let i = 0; i < n; i++) {
    let d = phi[(i + 1) % n]! - phi[i]!
    while (d > Math.PI / 2) d -= Math.PI
    while (d < -Math.PI / 2) d += Math.PI
    m = Math.max(m, Math.abs(d))
  }
  return m
}

suite('dynamics/director-relaxation: uniform fixed point', [
  check('a uniform director field is unchanged', () => {
    const uniform = new Array<number>(24).fill(0.4)
    const out = relaxDirector({ phi: uniform, steps: 100, dt: 0.1 })
    for (let i = 0; i < out.length; i++) close(out[i]!, 0.4, 1e-12, `cell ${i}`)
  }),
])

suite('dynamics/director-relaxation: smoothing', [
  check('relaxation reduces the maximum gradient of a perturbed field', () => {
    const n = 40
    const phi = Array.from({ length: n }, (_, i) => ((i * 37) % 100) / 100 * Math.PI)
    const g0 = maxGradient(phi)
    const out = relaxDirector({ phi, steps: 300, dt: 0.1 })
    ok(maxGradient(out) < g0, 'smoother after relaxation')
  }),
])

suite('dynamics/director-relaxation: determinism', [
  check('two relaxations agree', () => {
    const phi = Array.from({ length: 20 }, (_, i) => (i / 20) * Math.PI)
    const a = relaxDirector({ phi, steps: 50, dt: 0.1 })
    const b = relaxDirector({ phi, steps: 50, dt: 0.1 })
    for (let i = 0; i < a.length; i++) equal(a[i]!, b[i]!, `cell ${i}`)
  }),
])
