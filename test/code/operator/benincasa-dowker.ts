// Conformance for code/operator/benincasa-dowker: the smeared Benincasa-Dowker d'Alembertian
// on a 2D causal set. The continuum d'Alembertian is recovered only in the MEAN over a
// sprinkling ensemble (a statistical statement, tested at the experiment level), so here we
// pin down what the OPERATOR itself owns and what is exactly checkable on a fixed causal set:
//   - Linearity: B_eps is linear in phi (B[a u + b v] = a B[u] + b B[v]).
//   - Formula assembly: B_eps phi(x) = 4 eps rho ( -1/2 phi(x) + eps sum_{y prec x} f phi(y) )
//     with the causal-past filter (dt>0 and timelike-or-null) and the order-interval cardinality
//     n_yx. We re-derive this sum independently of the operator (the smeared layer weight f and
//     interval size come from their own modules, tested separately) and require an exact match.

import { suite, check, close } from '@/test/code/harness'
import { benincasaDowkerDalembertian } from '@/code/operator/benincasa-dowker'
import { smearedKernel2D } from '@/code/dynamics/action'
import { makePosetFromRelation, pastMatrix, intervalSize } from '@/code/tool/poset'

// A fixed 2D Minkowski causal set (t, x). Points are time-ordered.
const points: [number, number][] = [
  [0, 0],
  [1, 0],
  [1.5, 0.5],
  [2, 0],
  [2.5, -0.4],
  [3, 0.2],
]

const coords = Float64Array.from(points.flat())

const causal = (a: number, b: number): boolean => {
  const dt = (points[b]![0] ?? 0) - (points[a]![0] ?? 0)
  const dx = (points[b]![1] ?? 0) - (points[a]![1] ?? 0)

  return dt > 0 && dt * dt - dx * dx >= 0
}

const poset = makePosetFromRelation({
  size: points.length,
  precedes: ({ a, b }) => causal(a, b),
})

const past = pastMatrix(poset)
const density = 1.3
const epsilon = 0.25

// Independent re-derivation of the documented formula at a point.
function expected(phi: (t: number, x: number) => number, index: number): number {
  const tx = coords[index * 2] ?? 0
  const xx = coords[index * 2 + 1] ?? 0

  let s = 0
  for (let y = 0; y < points.length; y++) {
    if (y === index) continue

    const dt = tx - (coords[y * 2] ?? 0)
    const dx = xx - (coords[y * 2 + 1] ?? 0)

    if (dt <= 0 || dt * dt - dx * dx < 0) continue

    const n = intervalSize(poset, { a: y, b: index, past })
    s += smearedKernel2D({ n, epsilon }) * phi(coords[y * 2] ?? 0, coords[y * 2 + 1] ?? 0)
  }

  return 4 * epsilon * density * (-0.5 * phi(tx, xx) + epsilon * s)
}

const apply = (phi: (t: number, x: number) => number, index: number): number =>
  benincasaDowkerDalembertian({ phi, coords, poset, past, index, density, epsilon })

suite('operator/benincasa-dowker: formula assembly', [
  check('the operator matches its documented formula at every point', () => {
    const phi = (t: number, x: number): number => 1 + 0.5 * t - 0.3 * x + 0.1 * t * x
    for (let i = 0; i < points.length; i++) {
      close(apply(phi, i), expected(phi, i), 1e-12, `B_eps at point ${i}`)
    }
  }),
  check('a constant test function reduces to the prefactor sum', () => {
    // for phi = 1, B_eps(x) = 4 eps rho ( -1/2 + eps sum_{y prec x} f(n) ).
    const one = (): number => 1
    for (let i = 0; i < points.length; i++) {
      close(apply(one, i), expected(one, i), 1e-12, `constant phi at ${i}`)
    }
  }),
])

suite('operator/benincasa-dowker: linearity', [
  check('B_eps[a u + b v] = a B_eps[u] + b B_eps[v]', () => {
    const u = (t: number, x: number): number => t * t - x
    const v = (t: number, x: number): number => Math.cos(t) + x * x
    const a = 2.5
    const b = -1.7
    const combo = (t: number, x: number): number => a * u(t, x) + b * v(t, x)
    for (let i = 0; i < points.length; i++) {
      close(apply(combo, i), a * apply(u, i) + b * apply(v, i), 1e-12, `linearity at ${i}`)
    }
  }),
])
