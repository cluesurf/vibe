// Conformance for code/algebra/group/root-system: the D4 / B4 / F4 / E8 root
// systems and the lattice / code constructions behind the coin. Every count and
// norm is re-derived from textbook root-system facts:
//   |roots(D_n)| = 2n(n-1),  |roots(B_n)| = 2n^2,  |roots(A_{n-1})| = n(n-1),
//   |roots(F4)| = 48,  |roots(E8)| = 240,  det(Cartan(E8)) = 1.

import { suite, check, equal, ok, notOk } from '@/test/code/harness'
import {
  rootsDn,
  rootsAn,
  rootsD4,
  rootsB4,
  rootsF4,
  rootsE8,
  e8SimpleRoots,
  dotVec,
  reflectRoot,
  isRootSystem,
  standardModelEmbedsInRootSystem,
  spinorWeightsDn,
  hypercubicAxes,
  probeDirections4D,
  icosahedronVertexDirections,
  ternaryShells,
  vectorKey,
  cartanMatrix,
  constructionAMinimalVectors,
  evenWeightCode,
} from '@/code/algebra/group/root-system'

const normSquared = (v: number[]): number => dotVec(v, v)

const distinct = (vectors: number[][]): number =>
  new Set(vectors.map(vectorKey)).size

// Every root must have its negation in the set (root systems are symmetric).
const closedUnderNegation = (roots: number[][]): boolean => {
  const present = new Set(roots.map(vectorKey))

  return roots.every(r => present.has(vectorKey(r.map(x => -x))))
}

// Count roots grouped by squared length.
const byNorm = (roots: number[][]): Map<number, number> => {
  const counts = new Map<number, number>()

  for (const r of roots) {
    const n = normSquared(r)
    counts.set(n, (counts.get(n) ?? 0) + 1)
  }

  return counts
}

// Determinant of a small matrix via Gaussian elimination (rounded to the integer
// it must be for an integer Cartan matrix).
const determinant = (matrix: number[][]): number => {
  const n = matrix.length
  const a: number[][] = matrix.map(row => [...row])

  let sign = 1

  for (let col = 0; col < n; col++) {
    let pivot = col

    while (pivot < n && Math.abs(a[pivot]![col]!) < 1e-12) {
      pivot++
    }

    if (pivot === n) {
      return 0
    }

    if (pivot !== col) {
      const swap = a[col]!
      a[col] = a[pivot]!
      a[pivot] = swap
      sign = -sign
    }

    const pivotRow = a[col]!
    const pivotValue = pivotRow[col]!

    for (let row = col + 1; row < n; row++) {
      const target = a[row]!
      const factor = target[col]! / pivotValue

      for (let k = col; k < n; k++) {
        target[k] = target[k]! - factor * pivotRow[k]!
      }
    }
  }

  let det = sign

  for (let i = 0; i < n; i++) {
    det *= a[i]![i]!
  }

  return Math.round(det)
}

suite('algebra/group/root-system: D4 / B4 / F4 counts and norms', [
  check(
    'D4 has 24 roots, all of norm^2 = 2, closed under negation',
    () => {
      const roots = rootsD4()
      equal(roots.length, 24, '|D4 roots| = 2*4*3 = 24')
      equal(distinct(roots), 24, 'distinct')

      for (const r of roots) {
        equal(normSquared(r), 2, 'each D4 root has norm^2 = 2')
      }

      ok(closedUnderNegation(roots), 'D4 closed under negation')
    },
  ),
  check('rootsDn matches 2n(n-1) for several n', () => {
    equal(rootsDn(3).length, 12, '|D3 roots| = 12')
    equal(rootsDn(4).length, 24, '|D4 roots| = 24')
    equal(rootsDn(5).length, 40, '|D5 roots| = 40')

    for (const r of rootsDn(5)) {
      equal(normSquared(r), 2, 'D_n roots have norm^2 = 2')
    }
  }),
  check(
    'B4 has 32 roots: 24 long (norm^2 2) + 8 short (norm^2 1)',
    () => {
      const roots = rootsB4()
      equal(roots.length, 32, '|B4 roots| = 2*4^2 = 32')

      const counts = byNorm(roots)
      equal(counts.get(2), 24, '24 long roots')
      equal(counts.get(1), 8, '8 short roots')
      ok(closedUnderNegation(roots), 'B4 closed under negation')
    },
  ),
  check(
    'F4 has 48 roots: 24 long (norm^2 2) + 24 short (norm^2 1)',
    () => {
      const roots = rootsF4()
      equal(roots.length, 48, '|F4 roots| = 48')
      equal(distinct(roots), 48, 'distinct')

      const counts = byNorm(roots)
      equal(counts.get(2), 24, '24 long F4 roots')
      equal(
        counts.get(1),
        24,
        '24 short F4 roots (8 axis + 16 half-integer)',
      )
      ok(closedUnderNegation(roots), 'F4 closed under negation')
    },
  ),
  check('A_{n-1} has n(n-1) roots of norm^2 = 2', () => {
    equal(rootsAn(3).length, 6, '|A2 roots| = 6 (su(3))')
    equal(rootsAn(4).length, 12, '|A3 roots| = 12 (su(4))')

    for (const r of rootsAn(3)) {
      equal(normSquared(r), 2, 'A2 root norm^2 = 2')
    }
  }),
])

suite('algebra/group/root-system: reflection and root-system axiom', [
  check('reflecting a root in itself negates it', () => {
    for (const a of rootsD4()) {
      const reflected = reflectRoot(a, a)

      for (let i = 0; i < a.length; i++) {
        equal(reflected[i]!, -a[i]!, 's_a(a) = -a')
      }
    }
  }),
  check('reflection is an involution on D4 roots', () => {
    const roots = rootsD4()

    for (const a of roots) {
      const v = roots[0]!
      const twice = reflectRoot(reflectRoot(v, a), a)

      for (let i = 0; i < v.length; i++) {
        equal(twice[i]!, v[i]!, 's_a(s_a(v)) = v')
      }
    }
  }),
  check('D4, B4, F4, A2 are reflection-closed root systems', () => {
    ok(isRootSystem(rootsD4()), 'D4 is a root system')
    ok(isRootSystem(rootsB4()), 'B4 is a root system')
    ok(isRootSystem(rootsF4()), 'F4 is a root system')
    ok(isRootSystem(rootsAn(3)), 'A2 is a root system')
  }),
])

suite('algebra/group/root-system: Standard Model embedding logic', [
  check('A2 alone has no orthogonal A1, so SM does not embed', () => {
    // The A2 roots are coplanar; no root is orthogonal to two independent A2 roots.
    notOk(
      standardModelEmbedsInRootSystem(rootsAn(3)),
      'A2 by itself lacks the commuting su(2)',
    )
  }),
  check('an explicit A2 (+) A1 system does embed', () => {
    // A2 in the first three coordinates, plus an A1 along the fourth axis.
    const a2 = rootsAn(3).map(r => [...r, 0])
    const a1 = [
      [0, 0, 0, 1],
      [0, 0, 0, -1],
    ]

    ok(
      standardModelEmbedsInRootSystem([...a2, ...a1]),
      'A2 (+) A1 contains su(3) x su(2) orthogonally',
    )
  }),
])

suite('algebra/group/root-system: spinor weights and E8', [
  check(
    'D_n has 2^(n-1) even-parity spinor weights, norm^2 = n/4',
    () => {
      const w4 = spinorWeightsDn(4)
      equal(w4.length, 8, '|spinor(D4)| = 8')

      for (const w of w4) {
        ok(
          Math.abs(normSquared(w) - 1) < 1e-12,
          'D4 spinor weight norm^2 = 1',
        )
        equal(
          w.filter(x => x < 0).length % 2,
          0,
          'even number of minus signs',
        )
      }

      const w5 = spinorWeightsDn(5)
      equal(w5.length, 16, '|spinor(D5)| = 16 (the so(10) generation)')

      for (const w of w5) {
        ok(
          Math.abs(normSquared(w) - 1.25) < 1e-12,
          'D5 spinor weight norm^2 = 5/4',
        )
      }
    },
  ),
  check('E8 has 8 simple roots of norm^2 = 2', () => {
    const simple = e8SimpleRoots()
    equal(simple.length, 8, '8 simple roots')

    for (const r of simple) {
      ok(
        Math.abs(normSquared(r) - 2) < 1e-12,
        'E8 simple root norm^2 = 2',
      )
    }
  }),
  check(
    'the E8 Cartan matrix is a valid Dynkin diagram with det = 1',
    () => {
      const cartan = cartanMatrix(e8SimpleRoots())

      // diagonal all 2, off-diagonal in {0, -1}, symmetric, 7 edges (a tree on 8 nodes)
      let edges = 0

      for (let i = 0; i < 8; i++) {
        equal(cartan[i]![i]!, 2, 'Cartan diagonal = 2')

        for (let j = 0; j < 8; j++) {
          if (i !== j) {
            ok(
              (cartan[i]![j]!) === 0 || (cartan[i]![j]!) === -1,
              'off-diag in {0,-1}',
            )
            equal(
              cartan[i]![j]!,
              cartan[j]![i]!,
              'Cartan symmetric (simply laced)',
            )

            if (i < j && (cartan[i]![j]!) === -1) {
              edges++
            }
          }
        }
      }

      equal(edges, 7, 'E8 Dynkin diagram is a tree with 7 edges')
      equal(determinant(cartan), 1, 'det(Cartan(E8)) = 1')
    },
  ),
  check(
    'E8 has 240 roots, all of norm^2 = 2, closed under negation',
    () => {
      const roots = rootsE8()
      equal(roots.length, 240, '|E8 roots| = 240')

      for (const r of roots) {
        ok(Math.abs(normSquared(r) - 2) < 1e-12, 'E8 root norm^2 = 2')
      }

      ok(closedUnderNegation(roots), 'E8 closed under negation')
    },
  ),
])

suite('algebra/group/root-system: ternary shells and code lattice', [
  check('the {-1,0,1}^4 shells are the regular 4-polytopes', () => {
    const shells = ternaryShells(4)
    // shell of norm^2 = k has exactly C(4,k) 2^k vectors (k nonzero +-1 coords).
    equal(shells.get(1)!.length, 8, 'norm^2=1: the 16-cell, 4*2 = 8')
    equal(shells.get(2)!.length, 24, 'norm^2=2: the 24-cell, 6*4 = 24')
    equal(shells.get(3)!.length, 32, 'norm^2=3: 4*8 = 32')
    equal(
      shells.get(4)!.length,
      16,
      'norm^2=4: the tesseract, 1*16 = 16',
    )
  }),
  check('the norm-2 ternary shell is exactly the 24 D4 roots', () => {
    const shell = new Set(ternaryShells(4).get(2)!.map(vectorKey))
    const d4 = new Set(rootsD4().map(vectorKey))
    equal(shell.size, 24, 'shell size')
    equal(d4.size, 24, 'D4 size')
    ok(
      [...d4].every(k => shell.has(k)),
      'D4 roots = norm-2 ternary shell',
    )
  }),
  check('the even-weight code has 2^(n-1) words', () => {
    equal(evenWeightCode(4).length, 8, '[4,3,2] even-weight code')
    equal(evenWeightCode(5).length, 16, '[5,4,2] even-weight code')
  }),
  check(
    'Construction A on the even-weight code rebuilds the 24 D4 minimal vectors',
    () => {
      const minimal = constructionAMinimalVectors(evenWeightCode(4), 4)
      equal(minimal.length, 24, '24 minimal vectors of the D4 lattice')

      const d4 = new Set(rootsD4().map(vectorKey))
      ok(
        minimal.every(v => d4.has(vectorKey(v))),
        'every minimal vector is a D4 root',
      )
    },
  ),
])

suite('algebra/group/root-system: probe and lattice direction sets', [
  check('hypercubicAxes(d) gives 2d unit axis vectors', () => {
    for (const d of [3, 4, 5]) {
      const axes = hypercubicAxes(d)
      equal(axes.length, 2 * d, '2d axis directions')

      for (const a of axes) {
        equal(normSquared(a), 1, 'unit axis vector')
      }
    }
  }),
  check('the 4D probe directions are 7 unit vectors', () => {
    const probes = probeDirections4D()
    equal(probes.length, 7, '7 probe directions')

    for (const p of probes) {
      ok(Math.abs(normSquared(p) - 1) < 1e-12, 'probe is normalized')
    }
  }),
  check(
    'the 12 icosahedron directions are unit and negation-closed',
    () => {
      const directions = icosahedronVertexDirections()
      equal(directions.length, 12, '12 icosahedron vertex directions')

      for (const d of directions) {
        ok(Math.abs(normSquared(d) - 1) < 1e-12, 'unit direction')
      }

      ok(
        closedUnderNegation(directions),
        '12 directions form 6 antipodal axes',
      )
    },
  ),
])
