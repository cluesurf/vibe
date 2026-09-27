// Triples on a triangle, spin. The hypothesis of E-FRC-0170 reads a fermion as three vibes on the three
// lines of a zero-sum triangle. A fermion carries the double cover: a 2 pi turn gives -1. Does a triple?
// A turn of the triple by 2 pi / 3 carries each of its three directions to the next, so three of them
// are a whole turn, and the question is what that whole turn lifts to. Measured four ways, with the
// instruments of E-SPN-0044:
//
// 1. THE TORSOR LIFT. The 24 coin directions are a 2T torsor under left multiplication (E-SPN-0044): every
//    direction is g u for exactly one g in 2T. So a turn carrying e1 to e2 has exactly one lift g with
//    g e1 = e2, and the whole turn lifts to g^3. On each of the 32 triangles: the elements of 2T that cycle
//    its directions, their orders and cubes, and the elements that carry it onto its antitriangle (the
//    same three lines, the other slots), whose cube is -1 exactly when their order is 6.
// 2. THE SO(4) LIFT. Every rotation in W(F4) (determinant +1) that cycles a triangle, factored as
//    x -> l x conj(r) in SU(2)_L x SU(2)_R, with its two rotation angles (the A2 plane turns by 120 degrees,
//    the orthogonal plane by beta). The lift a continuous turn from the identity reaches is the pair with
//    a + b <= pi (a, b the half-angles of l and r); its cube is what a whole turn gives in each chiral half.
//    A reflection that cycles a triangle has no lift in Spin(4) and is counted apart.
// 3. THE ROLE GRID. SL(2, 3) = 2T acts on the role grid (E-FRC-0118); its elements of order 3 cube to 1 and
//    those of order 6 cube to -1, which moves 8 of the 9 points. Counted, to say what a lift through the
//    grid would have to choose.
// 4. THE DYNAMICS. Whether any knit keeps a triangle-cycling element as a symmetry (committed, combined,
//    cold; every tone relabelling and time shift, forward and reversed; forward only for the cold weave).
//    If none does, the turn of a triple is not an operation the knit respects, and there is no dynamical
//    holonomy to read. And the classical state itself: a colorless triple (three alike) is carried onto
//    itself, slot for slot, by the 1/3 turn, so the state has nowhere to hold a sign.
//
// Gates fixed before the run (the hypothesis, that a triple carries the double cover):
// - S1 the torsor lift of the whole turn is -1 on at least one triangle
// - S2 at least one knit keeps a triangle-cycling element as a symmetry
// PASS only if both hold. The SO(4) lift distribution and the grid counts are reported.
//
// Depth L2: exact group arithmetic on the coin and an exact symmetry search of three constructed rules.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { a2Planes, coldSpec, cyclingElements, OPPOSITE, ROOTS, TRIPLES, tripleDock } from '@/code/measure/rishon-triples'
import { binaryTetrahedralGroup, quaternionMultiply, quaternionsClose, type Quaternion } from '@/code/algebra/binary-tetrahedral'
import { isoclinicFactors, quaternionOrder } from '@/code/measure/chiral-response'
import { linearMapOf } from '@/code/substrate/d4-box'
import { determinant } from '@/code/algebra/linear/dense'
import { symmetryLedger } from '@/code/measure/rule-symmetry-ledger'
import { turningWeave, type Collision } from '@/code/rule/collision'
import { combinedCollision, COMBINED_DEFAULT } from '@/code/rule/combined-knit'
import { coldDockCollide, makeColdWeave } from '@/code/rule/cold-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import { d4BoxMesh } from '@/code/substrate/d4-box'

function power(q: readonly number[], n: number): Quaternion {
  let out: Quaternion = [1, 0, 0, 0]

  for (let k = 0; k < n; k++) {
    out = quaternionMultiply(out, [q[0] ?? 0, q[1] ?? 0, q[2] ?? 0, q[3] ?? 0])
  }

  return out
}

// +1 or -1 when q is that scalar, 0 otherwise
function scalarSign(q: Quaternion): number {
  if (quaternionsClose(q, [1, 0, 0, 0])) return 1
  if (quaternionsClose(q, [-1, 0, 0, 0])) return -1

  return 0
}

function coldVibeCollision(forward: boolean): (t: number) => Collision {
  const weave = makeColdWeave({ mesh: d4BoxMesh({ side: 3 }), spec: coldSpec() })

  return t => (slots, base) => {
    const a = { vibe: Int8Array.from(slots.subarray(base, base + 24)), store: new Int32Array(24), demon: new Int32Array(12), role: undefined }

    coldDockCollide(weave, a, 0, t, forward)
    slots.set(a.vibe, base)
  }
}

export default experiment({
  id: 'spin/rishon-spin',
  code: 'E-FRC-0172',
  title:
    'triples on a triangle, spin: the whole turn of a triple on its triangle lifts through the 2T torsor to +1 on all 32 triangles, the -1 appears only on the turns that also carry the triangle to its antitriangle, the SO(4) lifts split by the orthogonal angle, and no knit keeps any triangle turn as a symmetry, so a triple carries no double cover',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const planes = a2Planes()
    const triangles = planes.flatMap(p => [p.triangle, p.anti])
    const antiOf = triangles.map((t, i) => triangles[i % 2 === 0 ? i + 1 : i - 1] ?? t)

    // 1. the torsor lift
    const group = binaryTetrahedralGroup()
    const unit = (d: number): Quaternion => (ROOTS[d] ?? []).map(x => x * Math.SQRT1_2) as Quaternion
    const indexOf = (q: Quaternion): number => ROOTS.findIndex((_, d) => quaternionsClose(unit(d), q))
    const left = group.map(g => ROOTS.map((_, d) => indexOf(quaternionMultiply(g, unit(d)))))
    const setOf = (t: readonly number[]): string => [...t].sort((a, b) => a - b).join(',')
    const torsor = triangles.map((t, ti) => {
      const cyclers = group.filter((_, gi) => setOf(t.map(d => left[gi]?.[d] ?? -1)) === setOf(t) && t.every(d => left[gi]?.[d] !== d))
      const toAnti = group.filter((_, gi) => setOf(t.map(d => left[gi]?.[d] ?? -1)) === setOf(antiOf[ti] ?? []))
      // a lift of e1 -> e2 is unique: g = unit(e2) unit(e1)^-1
      const e1 = unit(t[0] ?? 0)
      const e2 = unit(t[1] ?? 0)
      const g = quaternionMultiply(e2, [e1[0], -e1[1], -e1[2], -e1[3]])

      return {
        cyclers: cyclers.length,
        cyclerOrders: cyclers.map(q => quaternionOrder(q)),
        cyclerCubes: cyclers.map(q => scalarSign(power(q, 3))),
        liftOrder: quaternionOrder(g),
        liftCube: scalarSign(power(g, 3)),
        toAnti: toAnti.length,
        toAntiOrders: toAnti.map(q => quaternionOrder(q)),
        toAntiCubes: toAnti.map(q => scalarSign(power(q, 3))),
      }
    })
    const s1 = torsor.some(t => t.liftCube === -1)

    // 2. the SO(4) lift of every W(F4) rotation that cycles a triangle
    const cycling = cyclingElements()
    const lifts = cycling.map(({ permutation, triangle }) => {
      const matrix = linearMapOf(permutation) ?? []
      const det = Math.round(determinant(matrix))

      if (det !== 1) {
        return { triangle, rotation: false, beta: NaN, left: 0, right: 0, order: 0 }
      }

      const factors = isoclinicFactors(matrix)

      if (!factors) {
        return { triangle, rotation: false, beta: NaN, left: 0, right: 0, order: 0 }
      }

      let l = factors.left
      let r = factors.right
      const a = Math.acos(Math.max(-1, Math.min(1, l[0])))
      const b = Math.acos(Math.max(-1, Math.min(1, r[0])))

      if (a + b > Math.PI + 1e-9) {
        l = [-l[0], -l[1], -l[2], -l[3]]
        r = [-r[0], -r[1], -r[2], -r[3]]
      }

      const trace = matrix.reduce((s, row, i) => s + (row[i] ?? 0), 0)
      // tr = 2 cos(120) + 2 cos(beta)
      const beta = Math.round((Math.acos(Math.max(-1, Math.min(1, trace / 2 + 0.5))) * 180) / Math.PI)
      const ambiguous = Math.abs(a + b - Math.PI) < 1e-9

      return {
        triangle,
        rotation: true,
        beta,
        left: ambiguous ? 0 : scalarSign(power(l, 3)),
        right: ambiguous ? 0 : scalarSign(power(r, 3)),
        order: Math.max(quaternionOrder(l), quaternionOrder(r)),
      }
    })
    const rotations = lifts.filter(x => x.rotation)
    const reflections = lifts.length - rotations.length
    const byBeta = new Map<string, number>()

    for (const x of rotations) {
      const key = `beta ${x.beta}: lift cubes (${x.left}, ${x.right})`

      byBeta.set(key, (byBeta.get(key) ?? 0) + 1)
    }

    // 3. the role grid: SL(2, 3) as the linear grid moves fixing the origin, orders and cubes
    const moves = gridMoves()
    const linear = moves.act.map((table, g) => ({ table, g })).filter(({ table }) => table[0] === 0)
    const orderOf = (g: number): number => {
      let h = g

      for (let n = 1; n <= 12; n++) {
        if (h === moves.identity) return n

        h = moves.compose(h, g)
      }

      return 0
    }
    const orders = linear.map(({ g }) => orderOf(g))
    const minusOne = linear.find(({ table }) => table.every((p, i) => p === ((3 - (i % 3)) % 3) + 3 * ((3 - Math.floor(i / 3)) % 3)))
    const minusOneMoved = minusOne ? Array.from(minusOne.table).filter((p, i) => p !== i).length : -1

    // 4. the dynamics
    const unique = [...new Map(cycling.map(c => [c.permutation.join(','), c.permutation])).values()]
    const opposite = [...OPPOSITE]
    const ledger = (forward: (t: number) => Collision, inverse: (t: number) => Collision, forwardOnly: boolean): number =>
      symmetryLedger({ forward, inverse, period: 24, permutations: unique, degree: 24 }).filter(e => !forwardOnly || e.kind === 'forward').length
    const committed = ledger(turningWeave({ opposite }), turningWeave({ opposite, forward: false }), false)
    const combined = ledger(combinedCollision({ spec: COMBINED_DEFAULT, opposite }), combinedCollision({ spec: COMBINED_DEFAULT, opposite, forward: false }), false)
    const cold = ledger(coldVibeCollision(true), coldVibeCollision(false), true)
    const s2 = committed + combined + cold > 0

    // the classical state under the 1/3 turn: a triple of three alike returns slot for slot, one with two
    // alike and one odd does not (its odd vibe moves to the next line)
    let alikeFixed = 0
    let alikeCases = 0
    let coloredFixed = 0
    let coloredCases = 0

    for (const { permutation, triangle } of cycling) {
      const t = triangles[triangle] ?? []

      for (const x of TRIPLES) {
        const seed = tripleDock(t, x.vibes)
        const image = new Int8Array(24)

        seed.forEach((v, d) => {
          image[permutation[d] ?? d] = v
        })

        const same = image.every((v, d) => v === seed[d])

        if (x.arrangements === 1) {
          alikeCases += 1
          alikeFixed += same ? 1 : 0
        } else {
          coloredCases += 1
          coloredFixed += same ? 1 : 0
        }
      }
    }

    const ok = s1 && s2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the torsor lift of a triple's whole turn is ${torsor.every(t => t.liftCube === 1) ? '+1 on all' : 'not +1 on all'} ${triangles.length} triangles (each lift of order ${[...new Set(torsor.map(t => t.liftOrder))].join('/')}), the -1 appears only among the ${torsor[0]?.toAnti} left turns that carry a triangle to its antitriangle (orders ${[...new Set(torsor.flatMap(t => t.toAntiOrders))].join('/')}); of ${lifts.length} W(F4) elements cycling a triangle ${rotations.length} are rotations and ${reflections} reflections, whose continuous lifts cube to ${[...byBeta.entries()].map(([k, n]) => `${k} (${n})`).join(', ')}; and no knit keeps a triangle turn (committed ${committed}, combined ${combined}, cold ${cold}), so S1 ${s1 ? 'holds' : 'fails'} and S2 ${s2 ? 'holds' : 'fails'}`,
      metrics: {
        triangles: triangles.length,
        torsorCyclersPerTriangleMin: Math.min(...torsor.map(t => t.cyclers)),
        torsorCyclersPerTriangleMax: Math.max(...torsor.map(t => t.cyclers)),
        torsorLiftOrderMax: Math.max(...torsor.map(t => t.liftOrder)),
        torsorWholeTurnPlusOne: torsor.filter(t => t.liftCube === 1).length,
        torsorWholeTurnMinusOne: torsor.filter(t => t.liftCube === -1).length,
        torsorCyclerCubesPlusOne: torsor.reduce((s, t) => s + t.cyclerCubes.filter(c => c === 1).length, 0),
        torsorCyclerCubesMinusOne: torsor.reduce((s, t) => s + t.cyclerCubes.filter(c => c === -1).length, 0),
        leftTurnsToAntiPerTriangle: torsor[0]?.toAnti ?? 0,
        leftTurnsToAntiCubeMinusOne: torsor.reduce((s, t) => s + t.toAntiCubes.filter(c => c === -1).length, 0),
        leftTurnsToAntiCubePlusOne: torsor.reduce((s, t) => s + t.toAntiCubes.filter(c => c === 1).length, 0),
        leftTurnsToAntiOrderMax: Math.max(...torsor.flatMap(t => t.toAntiOrders)),
        leftTurnsToAntiOrderMin: Math.min(...torsor.flatMap(t => t.toAntiOrders)),
        cyclingElements: lifts.length,
        cyclingRotations: rotations.length,
        cyclingReflections: reflections,
        rotationsLiftMinusOneBoth: rotations.filter(x => x.left === -1 && x.right === -1).length,
        rotationsLiftMinusOneLeftOnly: rotations.filter(x => x.left === -1 && x.right === 1).length,
        rotationsLiftMinusOneRightOnly: rotations.filter(x => x.left === 1 && x.right === -1).length,
        rotationsLiftPlusOneBoth: rotations.filter(x => x.left === 1 && x.right === 1).length,
        rotationsLiftAmbiguous: rotations.filter(x => x.left === 0 || x.right === 0).length,
        gridSl23Elements: linear.length,
        gridOrderThree: orders.filter(o => o === 3).length,
        gridOrderSix: orders.filter(o => o === 6).length,
        gridMinusOneMovesPoints: minusOneMoved,
        committedCyclingSymmetries: committed,
        combinedCyclingSymmetries: combined,
        coldCyclingForwardSymmetries: cold,
        colorlessTriplesFixedByThirdTurn: alikeFixed,
        colorlessTripleCases: alikeCases,
        coloredTriplesFixedByThirdTurn: coloredFixed,
        coloredTripleCases: coloredCases,
        s1TorsorMinusOne: s1 ? 1 : 0,
        s2KnitKeepsATurn: s2 ? 1 : 0,
      },
      control: {
        rotationAnglePairs: byBeta.size,
      },
      notes: `L2, exact. On the coin a left turn by a unit quaternion of angle theta turns every plane through 1 by theta, with no half angle, so the unique torsor lift of the 1/3 turn is an element of order 3 and the whole turn is +1. The -1 of 2T is the point inversion (E-SPN-0044), which carries the triangle to its antitriangle: the order-6 lifts are the 1/3 turn joined to that inversion, so a -1 on the whole turn comes only with the triple moved to the other slots of its lines. Through SO(4) the answer depends on the rotation, not on the triple: a continuous whole turn of the A2 plane alone (beta 0) is -1 in both chiral halves, as any 2 pi turn is in Spin(4), and one that also turns the orthogonal plane by 120 degrees (isoclinic, the torsor's own kind of turn) is +1 in both; the triple does not choose between them, since both kinds carry its three directions the same way, and half of the elements that cycle a triangle are reflections, which have no lift at all. Disclosed: the first run printed the antitriangle turns' orders as 0 (quaternionOrder was mapped with the array index as its limit); the orders are now computed with the default limit, and no gate read them. SL(2, 3) on the grid has ${orders.filter(o => o === 3).length} elements of order 3 and ${orders.filter(o => o === 6).length} of order 6, and nothing in any knit pairs a triangle turn with one of them. No knit keeps a triangle turn (0 of ${unique.length} candidate elements with every tone relabelling and time shift), so the arrangement colors are not moved into one another by the dynamics, and a triple's turn has no holonomy to measure. The classical state holds no amplitude: a colorless triple is fixed slot for slot by its 1/3 turn (${alikeFixed} of ${alikeCases}), a colored one is carried to another arrangement (${coloredFixed} of ${coloredCases} fixed). Spinor signs in this program live in the signed weights of the fear beat (E-SPN-0045), which this experiment does not run. Physics is read on the husk; everything here is the bulk coin and its rules.`,
    })
  },
})
