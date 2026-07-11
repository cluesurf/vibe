// Conformance for code/dynamics/su2-lattice: SU(2) lattice gauge theory on unit quaternions.
// The load-bearing exact check is GROUP MEMBERSHIP: the color matrix U = q0 I + i q.sigma
// built from a unit quaternion is in SU(2), i.e. U U^dagger = I and det U = 1, to ~1e-12.
// We re-derive U as an explicit 2x2 complex matrix (independent of the module's quaternion
// algebra) and verify both. We also pin the cold-lattice observables (average plaquette = 1,
// Wilson loop = 1, Creutz ratio = 0) and the determinism of a Metropolis sweep.

import {
  suite,
  check,
  equal,
  close,
  exactArray,
} from '@/test/code/harness'
import {
  makeSu2Lattice,
  averagePlaquette,
  wilsonLoop,
  creutzRatio,
  metropolisSweep,
  Quat,
} from '@/code/dynamics/su2-lattice'
import { makeRng } from '@/code/tool/rng'

// A complex number as [re, im], and a 2x2 complex matrix as four of them.
type C = [number, number]
type M = [[C, C], [C, C]]

const cmul = (a: C, b: C): C => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]

const cadd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const csub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const conj = (a: C): C => [a[0], -a[1]]

function matMul(x: M, y: M): M {
  const at = (r: 0 | 1, c: 0 | 1): C =>
    cadd(cmul(x[r][0], y[0][c]), cmul(x[r][1], y[1][c]))

  return [
    [at(0, 0), at(0, 1)],
    [at(1, 0), at(1, 1)],
  ]
}

function dagger(x: M): M {
  return [
    [conj(x[0][0]), conj(x[1][0])],
    [conj(x[0][1]), conj(x[1][1])],
  ]
}

// U = q0 I + i (q1 sx + q2 sy + q3 sz)
//   = [[ q0 + i q3,  q2 + i q1 ],
//      [ -q2 + i q1, q0 - i q3 ]]
function colorMatrix(q: Quat): M {
  return [
    [
      [q[0], q[3]],
      [q[2], q[1]],
    ],
    [
      [-q[2], q[1]],
      [q[0], -q[3]],
    ],
  ]
}

const det = (x: M): C =>
  csub(cmul(x[0][0], x[1][1]), cmul(x[0][1], x[1][0]))

function normalizeQuat(q: Quat): Quat {
  const n = Math.hypot(q[0], q[1], q[2], q[3])

  return [q[0] / n, q[1] / n, q[2] / n, q[3] / n]
}

const TOL = 1e-12

// A handful of distinct unit quaternions to exercise the membership check.
const quats: Quat[] = [
  normalizeQuat([1, 2, 3, 4]),
  normalizeQuat([0, 1, 0, 0]),
  normalizeQuat([1, 0, 0, 1]),
  normalizeQuat([2, -1, 0.5, -3]),
]

suite('dynamics/su2-lattice: SU(2) group membership', [
  check('U U^dagger = I for every unit quaternion', () => {
    for (const q of quats) {
      const u = colorMatrix(q)
      const p = matMul(u, dagger(u))

      close(p[0][0][0], 1, TOL, 'Re U U^dag [0,0]')
      close(p[0][0][1], 0, TOL, 'Im U U^dag [0,0]')
      close(p[1][1][0], 1, TOL, 'Re U U^dag [1,1]')
      close(p[1][1][1], 0, TOL, 'Im U U^dag [1,1]')
      close(p[0][1][0], 0, TOL, 'off-diagonal [0,1] re')
      close(p[0][1][1], 0, TOL, 'off-diagonal [0,1] im')
      close(p[1][0][0], 0, TOL, 'off-diagonal [1,0] re')
      close(p[1][0][1], 0, TOL, 'off-diagonal [1,0] im')
    }
  }),
  check('det U = 1 for every unit quaternion', () => {
    for (const q of quats) {
      const d = det(colorMatrix(q))

      close(d[0], 1, TOL, 'Re det U')
      close(d[1], 0, TOL, 'Im det U')
    }
  }),
])

suite('dynamics/su2-lattice: cold-lattice observables', [
  check('average plaquette of an all-identity lattice is 1', () => {
    const lattice = makeSu2Lattice({
      dim: 3,
      length: 2,
      hot: false,
      rng: makeRng({ seed: 1 }),
    })

    close(averagePlaquette({ lattice }), 1, TOL, 'cold plaquette = 1')
  }),
  check('Wilson loops of a cold lattice are 1', () => {
    const lattice = makeSu2Lattice({
      dim: 3,
      length: 3,
      hot: false,
      rng: makeRng({ seed: 1 }),
    })

    close(wilsonLoop({ lattice, r: 1, t: 1 }), 1, TOL, 'W(1,1) = 1')
    close(wilsonLoop({ lattice, r: 2, t: 1 }), 1, TOL, 'W(2,1) = 1')
  }),
  check('Creutz ratio of a cold lattice is 0', () => {
    const lattice = makeSu2Lattice({
      dim: 3,
      length: 3,
      hot: false,
      rng: makeRng({ seed: 1 }),
    })

    close(
      creutzRatio({ lattice, r: 2, t: 2 }),
      0,
      TOL,
      'cold Creutz ratio = 0',
    )
  }),
])

suite('dynamics/su2-lattice: links and determinism', [
  check('a hot lattice has unit-norm links', () => {
    const lattice = makeSu2Lattice({
      dim: 2,
      length: 3,
      hot: true,
      rng: makeRng({ seed: 7 }),
    })

    for (let i = 0; i < lattice.links.length; i += 4) {
      const norm = Math.hypot(
        lattice.links[i] ?? 0,
        lattice.links[i + 1] ?? 0,
        lattice.links[i + 2] ?? 0,
        lattice.links[i + 3] ?? 0,
      )

      close(norm, 1, TOL, `link ${i / 4} must be a unit quaternion`)
    }
  }),
  check(
    'a Metropolis sweep is deterministic under a fixed seed',
    () => {
      const make = (): ReturnType<typeof makeSu2Lattice> =>
        makeSu2Lattice({
          dim: 3,
          length: 2,
          hot: false,
          rng: makeRng({ seed: 11 }),
        })

      const a = make()
      const b = make()
      const accA = metropolisSweep({
        lattice: a,
        beta: 2.3,
        eps: 0.3,
        rng: makeRng({ seed: 99 }),
      })

      const accB = metropolisSweep({
        lattice: b,
        beta: 2.3,
        eps: 0.3,
        rng: makeRng({ seed: 99 }),
      })

      equal(accA, accB, 'acceptance must match across identical seeds')
      exactArray(
        a.links,
        b.links,
        'link buffers must match bit-for-bit',
      )
    },
  ),
])
