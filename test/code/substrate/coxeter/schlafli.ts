// Conformance for code/substrate/coxeter/schlafli: the Gram matrix, geometry classification, dihedral
// angles, and honeycomb taxonomy. The Gram off-diagonal is -cos(pi/p); geometry follows the eigenvalue
// signature; the dihedral of {p,q} is 2 asin(cos(pi/q)/sin(pi/p)) (cube 90, tetra ~70.53, dodeca ~116.57);
// and exactly four compact regular hyperbolic honeycombs exist in H^3. Counts EXACT, angles to tolerance.

import {
  suite,
  check,
  equal,
  ok,
  notOk,
  close,
} from '@/test/code/harness'
import {
  gramMatrix,
  classifyGeometry,
  honeycombCell,
  honeycombVertexFigure,
  isCompactHoneycomb,
  isIdealFiniteCellHoneycomb,
  enumerateCompactHoneycombs,
  dihedralAngleDegrees,
  edgeRegime,
} from '@/code/substrate/coxeter/schlafli'

suite('substrate/coxeter/schlafli: Gram matrix and geometry', [
  check('the Gram off-diagonal is -cos(pi/p)', () => {
    const g = gramMatrix([4])
    equal(g[0]![0], 1, 'diagonal')
    equal(g[1]![1], 1, 'diagonal')
    close(g[0]![1]!, -Math.cos(Math.PI / 4), 1e-12, 'off-diagonal {4}')

    const g3 = gramMatrix([3, 4, 3])
    close(g3[0]![1]!, -Math.cos(Math.PI / 3), 1e-12, 'edge 0')
    close(g3[1]![2]!, -Math.cos(Math.PI / 4), 1e-12, 'edge 1')
    equal(g3[0]![2], 0, 'non-adjacent mirrors are perpendicular')
  }),
  check(
    'classifyGeometry separates spherical, euclidean, hyperbolic',
    () => {
      for (const s of [
        [3, 3],
        [4, 3],
        [5, 3],
        [3, 3, 3],
      ]) {
        equal(classifyGeometry(s), 'spherical', `{${String(s)}}`)
      }

      for (const s of [
        [4, 4],
        [3, 6],
        [6, 3],
        [4, 3, 4],
      ]) {
        equal(classifyGeometry(s), 'euclidean', `{${String(s)}}`)
      }

      for (const s of [
        [7, 3],
        [5, 3, 4],
        [3, 5, 3],
        [3, 4, 3, 4],
      ]) {
        equal(classifyGeometry(s), 'hyperbolic', `{${String(s)}}`)
      }
    },
  ),
  check('cell and vertex figure drop the last/first entry', () => {
    equal(honeycombCell([5, 3, 4]).join(','), '5,3', 'cell')
    equal(
      honeycombVertexFigure([5, 3, 4]).join(','),
      '3,4',
      'vertex figure',
    )
  }),
])

suite('substrate/coxeter/schlafli: honeycomb taxonomy', [
  check('{5,3,4} is compact; {3,4,3,4} is ideal-finite-cell', () => {
    ok(isCompactHoneycomb([5, 3, 4]), '{5,3,4} compact')
    notOk(isCompactHoneycomb([3, 4, 3, 4]), '{3,4,3,4} not compact')
    ok(
      isIdealFiniteCellHoneycomb([3, 4, 3, 4]),
      '{3,4,3,4} ideal finite cell',
    )
    notOk(isIdealFiniteCellHoneycomb([5, 3, 4]), '{5,3,4} not ideal')
  }),
  check(
    'exactly four compact regular hyperbolic honeycombs exist in H^3',
    () => {
      const found = enumerateCompactHoneycombs({
        dimension: 3,
        maxEntry: 5,
      })

      equal(found.length, 4, 'four compact H^3 honeycombs')

      const set = new Set(found.map(s => s.join(',')))

      for (const s of ['5,3,4', '4,3,5', '3,5,3', '5,3,5']) {
        ok(set.has(s), `contains {${s}}`)
      }
    },
  ),
])

suite('substrate/coxeter/schlafli: dihedral angles and edge regime', [
  check('dihedral angles match the Platonic solids', () => {
    close(dihedralAngleDegrees({ p: 4, q: 3 }), 90, 1e-6, 'cube')
    close(
      dihedralAngleDegrees({ p: 3, q: 3 }),
      70.528779,
      1e-4,
      'tetrahedron',
    )
    close(
      dihedralAngleDegrees({ p: 5, q: 3 }),
      116.565051,
      1e-4,
      'dodecahedron',
    )
  }),
  check('edge regime: cubic honeycomb is flat, others curve', () => {
    equal(
      edgeRegime({ p: 4, q: 3, r: 4 }).regime,
      'euclidean',
      '{4,3,4} flat',
    )
    equal(
      edgeRegime({ p: 4, q: 3, r: 3 }).regime,
      'spherical',
      '{4,3,3} tesseract',
    )
    equal(
      edgeRegime({ p: 5, q: 3, r: 4 }).regime,
      'hyperbolic',
      '{5,3,4}',
    )
    // r copies of the cube (90 deg each) close at exactly 360 for r=4.
    close(
      edgeRegime({ p: 4, q: 3, r: 4 }).totalAngleDegrees,
      360,
      1e-6,
      '4*90',
    )
  }),
])
