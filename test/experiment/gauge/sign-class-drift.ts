// Can a lone color return to its partner? The half-space theorem behind moving binding on the D4 lattice.
//
// E-FRC-0124 made color local by counting a calm slot's role as color signed by its side of the line:
// +1 on the slot where calm puts the love, -1 on the other. Every color-local move then keeps each lone
// vibe in its sign class: a move that puts a charge onto a calm slot of the other sign changes the cell's
// color content (the hop, excluded by that search), and the only moves that carry a charge across are the
// pair's flip and annihilation, which need an opposite charge on the same line. So a lone vibe only ever
// moves along the 12 directions of its class.
//
// If those 12 directions lie in an open half-space (some c with c . r > 0 for all of them), every beat
// increases c . position, and a lone vibe drifts one way forever: it can never come back to its partner,
// so no rule that keeps color local can bind a moving part, however it pays for its string. If instead
// some positive combination of the class's directions sums to zero (a closed walk inside the class, the
// smallest being a zero-sum triangle), a lone vibe can return.
//
// Which side is the love's is fixed per line by the collision table, so there are 2^12 = 4,096
// orientations. This counts, exactly:
// - for the committed orientation (the love on each line's lower-indexed direction), whether its plus
//   class lies in an open half-space, with a witness c
// - over all 4,096 orientations, how many classes lie in an open half-space, and how many hold a closed
//   walk (a zero-sum triangle, or failing that any positive dependency found by the half-space search)
// Half-space membership is decided by searching c over every integer vector in [-4, 4]^4 (6,561 of them),
// which contains a witness for any open half-space of D4 roots. Gates: the committed orientation's class
// is a half-space, the half-space and returning counts add to 4,096, and at least one orientation returns.
//
// Depth L1: exact enumeration.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { zeroSumTriangles } from '@/code/measure/collision-anatomy'
import { d4BoxMesh } from '@/code/substrate/d4-box'

const RANGE = 4

export default experiment({
  id: 'gauge/sign-class-drift',
  code: 'E-FRC-0130',
  title:
    "a lone color cannot return to its partner under the committed orientation: color-local moves keep a lone vibe in its sign class, and the committed class of 12 directions lies in an open half-space, so it drifts one way forever, while some of the 4,096 orientations of the lines hold closed walks and would let a part come back",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const roots = rootsD4()
    const mesh = d4BoxMesh({ side: 3 })
    const lines: [number, number][] = []

    for (let d = 0; d < 24; d++) {
      if (d < mesh.opposite(d)) {
        lines.push([d, mesh.opposite(d)])
      }
    }

    const candidates: number[][] = []

    for (let k = 0; k < (2 * RANGE + 1) ** 4; k++) {
      candidates.push([0, 1, 2, 3].map(i => (Math.floor(k / (2 * RANGE + 1) ** i) % (2 * RANGE + 1)) - RANGE))
    }

    const witness = (plus: number[]): number[] | null =>
      candidates.find(c => plus.every(d => (roots[d] ?? []).reduce((s, x, i) => s + x * (c[i] ?? 0), 0) > 0)) ?? null

    const triangles = zeroSumTriangles({ directions: roots })
    const hasTriangle = (plus: Set<number>): boolean => triangles.some(t => t.every(d => plus.has(d)))

    const committed = lines.map(([d]) => d)
    const committedWitness = witness(committed)

    let halfSpace = 0
    let returning = 0
    let returningWithTriangle = 0

    for (let mask = 0; mask < 4096; mask++) {
      const plus = lines.map(([d, o], k) => ((mask >> k) & 1 ? o : d))

      if (witness(plus)) {
        halfSpace += 1
      } else {
        returning += 1
        returningWithTriangle += hasTriangle(new Set(plus)) ? 1 : 0
      }
    }

    const ok = committedWitness !== null && halfSpace + returning === 4096 && returning > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the committed orientation puts the 12 directions of a sign class in an open half-space (a witness c exists), so under any color-local rule a lone vibe drifts one way and never returns, while of the 4,096 orientations of the lines some hold a closed walk inside the class and would let a part return',
      metrics: {
        committedClassIsHalfSpace: committedWitness ? 1 : 0,
        orientations: 4096,
        halfSpaceOrientations: halfSpace,
        returningOrientations: returning,
        returningWithTriangle,
      },
      control: {
        ...Object.fromEntries((committedWitness ?? [Number.NaN, Number.NaN, Number.NaN, Number.NaN]).map((x, i) => [`witnessC${i + 1}`, x])),
        searchedVectors: candidates.length,
      },
      notes:
        'L1, exact. The sign class of a lone vibe is kept by every color-local move (E-FRC-0124): changing it needs a charge moved onto a calm slot of the other sign, which changes the cell\'s color, or an opposite charge on the same line (the flip, annihilation). So in the committed orientation a lone part can only come back by meeting and flipping with an opposite charge, and moving binding needs either a returning orientation, which changes the collision table on some lines and would need the acceptance battery again, or a slot where matter can wait (E-FRC-0129).',
    })
  },
})
