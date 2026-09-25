// What could make the coin choose a colour plane by itself? Read as SU(3) weights, the 24 D4 coin
// directions split around any zero-sum triangle (an A2, the root system of SU(3)) into the 6 roots of
// that A2 (the charged gluons) and 18 directions whose shadows on the A2 plane are the weights of a
// triplet and an antitriplet, three times over. There are 16 such A2s, so colour read this way needs
// something to pick one. This measures what does.
//
// 1. The geometry. For every A2 the 18 other directions project onto the plane orthogonal to it as six
//    points, each hit by exactly three directions, the three triplet copies at points 120 degrees
//    apart and the antitriplets opposite. The orthogonal plane holds no direction at all.
// 2. The selector. Of the 80 elements of order three in W(F4), the coin's symmetry group, exactly 32
//    fix six directions, and those six are always an A2. The other 48 fix none. All 32 lie outside
//    W(D4), so they are triality rotations. They pair off one A2 each (g and g^-1), so choosing a
//    triality rotation chooses the colour plane, and the same rotation cycles the three copies.
// 3. Which rules carry one. The previous committed knit (one 9-state table on every line) keeps
//    exactly two order-three symmetries, with no tone relabelling, and their fixed set is one A2: the
//    orientation of its lines (which end leads) selects a colour plane and keeps the triality that
//    cycles the copies. The committed turning weave keeps neither (E-FRC-0095), and its own special
//    directions are a coordinate split instead: the four directions at rest are the four roots of one
//    coordinate plane, and the three massless directions do not close a triangle.
//
// Controls: the 48 fixed-point-free order-three elements, and a direction set that is not an A2 (the
// committed rule's rest set) tested by the same A2 test.
//
// Depth L2: exact structural measurements of the coin and of two rules, no random numbers, no run
// through beat except for the speed of a lone tone on each direction (8 beats, as in E-FND-0129).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { pairCollision, turningWeave } from '@/code/rule/collision'
import { makeWill, type Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { zeroSumTriangles } from '@/code/measure/collision-anatomy'
import {
  permutationOrder,
  scheduleAnatomy,
  scheduleSymmetries,
  weylF4DirectionPermutations,
} from '@/code/measure/coin-symmetry'
import { lineRelabellings } from '@/code/check/tone-permutation-symmetry'

const SPEED_SIDE = 17
const SPEED_BEATS = 8

const dot = (a: readonly number[], b: readonly number[]): number => a.reduce((s, x, k) => s + x * (b[k] ?? 0), 0)
const keyOf = (list: readonly number[]): string => [...list].sort((a, b) => a - b).join(',')

// a W(D4) element acts as a signed coordinate permutation with an even number of sign flips
function inWeylD4(permutation: readonly number[], roots: readonly (readonly number[])[]): boolean {
  const orders: number[][] = []
  const build = (prefix: number[]): void => {
    if (prefix.length === 4) {
      orders.push(prefix)

      return
    }

    for (const axis of [0, 1, 2, 3]) {
      if (!prefix.includes(axis)) {
        build([...prefix, axis])
      }
    }
  }

  build([])

  for (const order of orders) {
    for (let signs = 0; signs < 16; signs++) {
      const sign = [0, 1, 2, 3].map(k => ((signs >> k) & 1 ? -1 : 1))
      const matches = roots.every((root, d) => {
        const target = roots[permutation[d] ?? 0] ?? []

        return [0, 1, 2, 3].every(k => (sign[k] ?? 1) * (root[order[k] ?? 0] ?? 0) === target[k])
      })

      if (matches) {
        return sign.filter(s => s < 0).length % 2 === 0
      }
    }
  }

  return false
}

// the shadows of the 18 non-A2 directions on the plane orthogonal to an A2, as counts per point
function complementShadows(roots: readonly (readonly number[])[], a: readonly number[], b: readonly number[]): number[] {
  const counts = new Map<string, number>()

  for (const root of roots) {
    // remove the component in span(a, b), keep the rest, which lies in the orthogonal plane
    const gaa = dot(a, a)
    const gab = dot(a, b)
    const gbb = dot(b, b)
    const det = gaa * gbb - gab * gab
    const x = (gbb * dot(root, a) - gab * dot(root, b)) / det
    const y = (gaa * dot(root, b) - gab * dot(root, a)) / det
    const rest = root.map((value, k) => value - x * (a[k] ?? 0) - y * (b[k] ?? 0))

    if (Math.hypot(...rest) < 1e-9) {
      continue
    }

    const key = rest.map(v => v.toFixed(6)).join(',')

    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return [...counts.values()]
}

function directionSpeeds(opposite: number[]): number[] {
  const mesh = d4Mesh({ side: SPEED_SIDE })
  const rule = turningWeave({ opposite })
  const mid = (SPEED_SIDE - 1) / 2
  const center = mid * (1 + SPEED_SIDE + SPEED_SIDE ** 2 + SPEED_SIDE ** 3)
  const coordinate = (cell: number, axis: number): number => Math.floor(cell / SPEED_SIDE ** axis) % SPEED_SIDE
  const wrap = (d: number): number => (d > SPEED_SIDE / 2 ? d - SPEED_SIDE : d < -SPEED_SIDE / 2 ? d + SPEED_SIDE : d)

  return Array.from({ length: 24 }, (_, direction) => {
    let vacuum: Will = makeWill(mesh)
    let seeded: Will = makeWill(mesh)

    seeded.data[center * 24 + direction] = 1

    for (let t = 0; t < SPEED_BEATS; t++) {
      vacuum = beat(vacuum, rule(t))
      seeded = beat(seeded, rule(t))
    }

    const cells = new Set<number>()

    for (let i = 0; i < seeded.data.length; i++) {
      if (seeded.data[i] !== vacuum.data[i]) {
        cells.add(Math.floor(i / 24))
      }
    }

    const sum = [0, 0, 0, 0]

    for (const cell of cells) {
      for (let axis = 0; axis < 4; axis++) {
        sum[axis] = (sum[axis] ?? 0) + wrap(coordinate(cell, axis) - mid)
      }
    }

    const n = cells.size || 1

    return Math.hypot(...sum.map(v => v / n / SPEED_BEATS)) / Math.SQRT2
  })
}

export default experiment({
  id: 'gauge/colour-plane-selection',
  code: 'E-FRC-0106',
  title:
    'each of the 16 A2 planes of the coin splits the other 18 directions into three triplet and antitriplet copies 120 degrees apart, exactly 32 of the 80 order-three coin symmetries fix exactly one A2 (all triality rotations, one pair per plane), and the previous knit keeps one such pair, so an orientation of the lines selects a colour plane and a triality that cycles the copies, which the committed turning weave does not keep',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const opposite = meshOpposites(d4Mesh({ side: 3 }))
    const triangles = zeroSumTriangles({ directions: roots })
    const planeOf = (triangle: readonly number[]): string =>
      keyOf([...triangle, ...triangle.map(d => opposite[d] ?? d)])
    const planes = new Set(triangles.map(planeOf))

    // 1. the geometry, over every A2
    const shadowsRegular = triangles.every(triangle => {
      const [i, j] = triangle
      const shadows = complementShadows(roots, roots[i ?? 0] ?? [], roots[j ?? 0] ?? [])

      return shadows.length === 6 && shadows.every(count => count === 3)
    })
    const emptyComplement = triangles.every(triangle => {
      const [i, j] = triangle

      return roots.every(
        root => !(Math.abs(dot(root, roots[i ?? 0] ?? [])) < 1e-9 && Math.abs(dot(root, roots[j ?? 0] ?? [])) < 1e-9),
      )
    })

    // 2. the selector
    const permutations = weylF4DirectionPermutations({ directions: roots })
    const orderThree = permutations.filter(p => permutationOrder({ permutation: p }) === 3)
    const fixedSets = orderThree.map(p => p.map((image, d) => (image === d ? d : -1)).filter(d => d >= 0))
    const selectors = orderThree.filter((_, k) => (fixedSets[k] ?? []).length === 6 && planes.has(keyOf(fixedSets[k] ?? [])))
    const fixedPointFree = fixedSets.filter(set => set.length === 0).length
    const selectorsOutsideD4 = selectors.filter(p => !inWeylD4(p, roots)).length
    const planesSelected = new Set(
      selectors.map(p => keyOf(p.map((image, d) => (image === d ? d : -1)).filter(d => d >= 0))),
    ).size

    // 3. which rules keep one
    const selectorsOf = (collision: ReturnType<typeof pairCollision>): number =>
      scheduleSymmetries({
        anatomy: scheduleAnatomy({ schedule: () => collision, period: 1, degree: 24 }),
        permutations,
        opposite,
        relabellings: lineRelabellings(),
      }).filter(symmetry => {
        const fixed = symmetry.permutation.map((image, d) => (image === d ? d : -1)).filter(d => d >= 0)

        return permutationOrder({ permutation: symmetry.permutation }) === 3 && planes.has(keyOf(fixed))
      }).length
    const previousKnitSelectors = selectorsOf(pairCollision({ opposite }))
    const speeds = directionSpeeds(meshOpposites(d4Mesh({ side: SPEED_SIDE })))
    const rest = speeds.map((s, d) => (s < 1e-9 ? d : -1)).filter(d => d >= 0)
    const massless = speeds.map((s, d) => (Math.abs(s - 1) < 1e-9 ? d : -1)).filter(d => d >= 0)
    const restIsCoordinatePlane =
      rest.length === 4 && rest.every(d => (roots[d] ?? []).filter(x => x !== 0).length === 2) &&
      new Set(rest.map(d => (roots[d] ?? []).map(x => (x === 0 ? 0 : 1)).join())).size === 1
    const restIsA2 = planes.has(keyOf(rest))
    const masslessClose = triangles.some(t => keyOf(t) === keyOf(massless))

    const geometry = shadowsRegular && emptyComplement && planes.size === 16
    const selector =
      orderThree.length === 80 &&
      selectors.length === 32 &&
      fixedPointFree === 48 &&
      selectorsOutsideD4 === 32 &&
      planesSelected === 16
    const rules = previousKnitSelectors === 2 && restIsCoordinatePlane && !restIsA2 && !masslessClose
    const ok = geometry && selector && rules

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'for all 16 A2 planes of the coin the 18 other directions cast six shadows of three on the orthogonal plane, which holds no direction, so they are three triplet and three antitriplet copies. Of the 80 order-three elements of W(F4), 32 fix exactly an A2 and 48 fix nothing, all 32 are triality rotations outside W(D4), and they select each of the 16 planes once as a pair. The previous knit keeps 2 of them with no tone relabelling, one colour plane and its triality, while the committed turning weave keeps none and singles out a coordinate plane (4 directions at rest) instead of an A2',
      metrics: {
        a2Planes: planes.size,
        orderThreeElements: orderThree.length,
        a2Selectors: selectors.length,
        selectorsOutsideWeylD4: selectorsOutsideD4,
        planesSelected,
        previousKnitSelectors,
        committedRestDirections: rest.length,
        committedMasslessDirections: massless.length,
      },
      control: {
        fixedPointFreeOrderThree: fixedPointFree,
        committedRestIsA2: restIsA2 ? 1 : 0,
        committedMasslessCloseATriangle: masslessClose ? 1 : 0,
        committedRuleSelectors: 0,
      },
      notes:
        'L2, exact. The reading of a direction as a colour weight is its shadow on an A2 plane, and it needs a choice of plane. The measured answer to what makes the choice: an order-three triality rotation of the coin, whose fixed directions are the colour plane (the long roots of the G2 that triality fixes, G2 containing SU(3)) and which cycles the three copies, the shape three generations would have. An orientation of every line, which end leads, is what the previous knit carries, and it keeps exactly one such rotation, so an arrow on the lines is enough to select colour. The committed turning weave, adopted for other reasons, breaks it. The committed rule counted in the control keeps no selector by E-FRC-0095, which tested every order-three candidate. This does not show the committed rule conserves colour: it conserves charge and not momentum (E-FLD-0020), so the shadow of motion on the colour plane is not a conserved colour charge under it.',
    })
  },
})
