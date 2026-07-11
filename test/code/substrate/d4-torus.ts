// Conformance for code/substrate/d4-torus and the D4 roots it steps along. These are the
// load-bearing facts of the {3,4,3,4} substrate: the 24 D4 roots, each of norm-squared 2,
// closed under negation and under reflection (a true root system), with negation acting as
// a fixed-point-free involution (every direction has a distinct opposite). On the finite
// torus every cell then has degree exactly 24 with symmetric adjacency. All of this is
// integer, so every assertion is EXACT.

import { suite, check, equal, ok, notOk } from '@/test/code/harness'
import {
  rootsD4,
  dotVec,
  vecEqExact,
  isRootSystem,
} from '@/code/algebra/group/root-system'
import { buildD4Torus } from '@/code/substrate/d4-torus'

const negate = (v: number[]): number[] => v.map(x => -x)

// The index of -v among the roots: the opposite-direction map.
function oppositeIndex(roots: number[][], i: number): number {
  const target = negate(roots[i]!)

  return roots.findIndex(r => vecEqExact(r, target))
}

suite('substrate/d4-torus: the 24 D4 roots', [
  check('there are exactly 24 roots', () => {
    equal(rootsD4().length, 24, 'D4 root count')
  }),
  check('every root has norm squared 2', () => {
    for (const r of rootsD4())
      equal(dotVec(r, r), 2, `|${String(r)}|^2`)
  }),
  check('the roots are closed under negation', () => {
    const roots = rootsD4()

    for (const r of roots) {
      ok(
        roots.some(s => vecEqExact(s, negate(r))),
        `-(${String(r)}) must be a root`,
      )
    }
  }),
  check('the roots form a reflection-closed root system', () => {
    ok(isRootSystem(rootsD4()), 'closed under reflection in each root')
  }),
  check(
    'opposite is a fixed-point-free involution on the 24 directions',
    () => {
      const roots = rootsD4()

      for (let i = 0; i < roots.length; i++) {
        const o = oppositeIndex(roots, i)

        ok(o >= 0, `root ${i} must have an opposite in the set`)
        notOk(o === i, `root ${i} is not its own opposite`)
        equal(oppositeIndex(roots, o), i, 'opposite is an involution')
        ok(
          vecEqExact(roots[o]!, negate(roots[i]!)),
          'opposite is negation',
        )
      }
    },
  ),
])

suite('substrate/d4-torus: the M=4 finite torus', [
  check('the even-sum cells number M^4 / 2 = 128', () => {
    const torus = buildD4Torus(4)

    equal(torus.cells.length, 128, 'cell count')
    equal(torus.index.size, 128, 'index size')
  }),
  check('the torus steps along the 24 roots', () => {
    equal(buildD4Torus(4).roots.length, 24, 'step directions')
  }),
  check(
    'every cell has degree exactly 24 with no repeated neighbour',
    () => {
      const torus = buildD4Torus(4)

      for (let i = 0; i < torus.cells.length; i++) {
        const row = torus.neigh[i]!

        equal(row.length, 24, `degree of cell ${i}`)
        equal(new Set(row).size, 24, `distinct neighbours of cell ${i}`)
      }
    },
  ),
  check('every neighbour index is a valid in-lattice cell', () => {
    const torus = buildD4Torus(4)
    const n = torus.cells.length

    for (const row of torus.neigh) {
      for (const j of row) {
        ok(
          Number.isInteger(j) && j >= 0 && j < n,
          `neighbour ${j} in range`,
        )
      }
    }
  }),
  check('adjacency is symmetric and has no self-loops', () => {
    const torus = buildD4Torus(4)
    const sets = torus.neigh.map(row => new Set(row))

    for (let i = 0; i < torus.cells.length; i++) {
      notOk(sets[i]!.has(i), `cell ${i} has no self-loop`)

      for (const j of torus.neigh[i]!)
        ok(sets[j]!.has(i), `edge ${i}-${j} must be mutual`)
    }
  }),
])
