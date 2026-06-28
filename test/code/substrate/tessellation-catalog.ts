// Conformance for code/substrate/tessellation-catalog: the enumerated regular hyperbolic
// tessellations. The internal-consistency facts are exact: a buildable entry's display
// symbol must read back its Schlafli integers, its dimension equals the Schlafli rank, and
// `buildable` is exactly "has integer Schlafli". The VERTEX FIGURE of a regular {p,q,r,...}
// is, by definition, {q,r,...} (drop the first symbol). Where that tail is a finite,
// well-named polytope we assert the stored vertexFigure string equals that name.
//
// HEADS UP: four of these assertions are EXPECTED TO FAIL because the catalog strings are
// wrong (the audit flagged them). The check asserts the mathematically correct name, so the
// failure is the report:
//   {3,5,3}   tail {5,3}   -> dodecahedron (stored "icosahedron")
//   {4,4,3}   tail {4,3}   -> cube         (stored "octahedron")
//   {5,3,3,4} tail {3,3,4} -> 16-cell      (stored "tesseract")
//   {5,3,3,5} tail {3,3,5} -> 600-cell     (stored "120-cell")
// A fifth entry, {4,4,3,3} tail {4,3,3} -> tesseract (stored "5-cell"), also fails by the
// same rule; reported below as a candidate beyond the four the audit named.

import { suite, check, equal, ok } from '@/test/code/harness'
import { TESSELLATIONS } from '@/code/substrate/tessellation-catalog'
import {
  rootsD4,
  icosahedronVertexDirections,
} from '@/code/algebra/group/root-system'

const buildable = TESSELLATIONS.filter(t => t.buildable)

// The canonical name of a finite regular polytope by its Schlafli tail. Only finite figures
// are listed; Euclidean / hyperbolic tilings (apeirotopes) carry freeform catalog names and
// are skipped, so no false positives.
const FINITE_FIGURE: Record<string, string> = {
  '3': 'triangle',
  '4': 'square',
  '5': 'pentagon',
  '6': 'hexagon',
  '7': 'heptagon',
  '8': 'octagon',
  '3,3': 'tetrahedron',
  '3,4': 'octahedron',
  '4,3': 'cube',
  '3,5': 'icosahedron',
  '5,3': 'dodecahedron',
  '3,3,3': '5-cell',
  '3,3,4': '16-cell',
  '4,3,3': 'tesseract',
  '3,4,3': '24-cell',
  '3,3,5': '600-cell',
  '5,3,3': '120-cell',
}

suite('substrate/tessellation-catalog: internal consistency', [
  check('buildable is exactly "has an integer Schlafli symbol"', () => {
    for (const t of TESSELLATIONS) {
      equal(t.buildable, t.schlafli.length > 0, `${t.symbol} buildable flag`)
    }
  }),
  check('the display symbol reads back the Schlafli integers', () => {
    for (const t of buildable) {
      equal(t.symbol, `{${t.schlafli.join(',')}}`, `${t.symbol} symbol`)
    }
  }),
  check('every Schlafli entry is an integer >= 3', () => {
    for (const t of buildable) {
      for (const value of t.schlafli) {
        ok(
          Number.isInteger(value) && value >= 3,
          `${t.symbol} entry ${value}`,
        )
      }
    }
  }),
  check('the dimension equals the Schlafli rank', () => {
    for (const t of buildable) {
      equal(t.dimension, t.schlafli.length, `${t.symbol} dimension`)
    }
  }),
])

suite(
  'substrate/tessellation-catalog: vertex figure of {p,q,r,...} is {q,r,...}',
  buildable
    .map(t => ({ t, tail: t.schlafli.slice(1).join(',') }))
    .filter(({ tail }) => tail in FINITE_FIGURE)
    .map(({ t, tail }) =>
      check(`${t.symbol} vertex figure should be ${FINITE_FIGURE[tail]}`, () => {
        equal(
          t.vertexFigure.trim().toLowerCase(),
          FINITE_FIGURE[tail]!,
          `${t.symbol} vertex figure (tail {${tail}})`,
        )
      }),
    ),
)

suite('substrate/tessellation-catalog: the vibe coin degrees', [
  check('the {5,3,4} cell (dodecahedron) gives a 12-direction coin', () => {
    const entry = TESSELLATIONS.find(t => t.symbol === '{5,3,4}')!
    equal(entry.cells, 'dodecahedra', 'cell type')
    // A dodecahedron has 12 faces, independently the 12 icosahedral coin directions.
    equal(icosahedronVertexDirections().length, 12, '{5,3,4} coin degree')
  }),
  check('the {3,4,3,4} cell (24-cell) gives a 24-direction coin', () => {
    const entry = TESSELLATIONS.find(t => t.symbol === '{3,4,3,4}')!
    equal(entry.cells, '24-cells', 'cell type')
    // A 24-cell has 24 octahedral facets, independently the 24 D4 roots.
    equal(rootsD4().length, 24, '{3,4,3,4} coin degree')
  }),
])
