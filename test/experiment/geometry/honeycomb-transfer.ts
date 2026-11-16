// The {3,4,3,4} honeycomb in exact arithmetic, and how far a flat-box result transfers to it
// (note/honeycomb-transfer-radius.md). The cell graph is built in Z[sqrt 2] with bigints by
// code/substrate/coxeter/exact-3434.ts: Coxeter reflections with 2B entries 2, -1, -sqrt 2, the transports
// k_a = F_a Z (the facet reflection, then the cell's point inversion), each dock's 24 slots on the D4 roots in
// rootsD4() order, and every cell keyed by its exact center. Nothing is rounded.
//
// Gates, all exact:
//
// 1. the cell: |H| = 1,152, Z in H and central, 24 facets, the facet-direction Gram equal to the D4 root Gram,
//    Z F_a Z = F_{-a}, and a chamber point with trivial stabilizer (so a center and one more image fix a frame)
// 2. shells 1, 24, 456, 8,376 (radius 3), and 153,192 (radius 4, the M3 run)
// 3. 0 inconsistent steps (the antipodal labels close on every loop), and neighbour(neighbour(c, a), -a) = c
// 4. the exact table equals label-transport.ts's float buildHyperbolicBall at radius 3, cell for cell and slot
//    for slot (the same breadth-first order), so the float version was right where it was used
// 5. no triangle anywhere in the ball (no two neighbours share a neighbour), and at every interior dock (distance
//    at most R - 2) all 192 walks (a, -b, a, -b) with a.b = 1 close and none of the 192 walks (a, b - a, -b)
// 6. the class map k_a -> a mod 2 D4 is well defined on every edge of the ball (0 conflicts)
// 7. the transports reduced mod (3 + sqrt 2) keep the group's relations, k_a k_{-a} = 1 and (k_a k_{-b})^2 = 1
//    for a.b = 1, the input of the finite quotient (item 0008)
//
// CONTROLS: the flat D4 box (side 8) reads shell 2 = 144 and closes all 192 triangle walks and no square walk at
// every dock, the opposite of the honeycomb. And the translation transport (parallel transport, float) is
// inconsistent by radius 2 (192 steps), so the closure of the antipodal labels is a fact about the group, not about
// the check.
//
// Under keys 3 a mesh unit is a dock, a block, never a point: "center" here is the exact vector a cell's frame
// carries, the address that identifies the block, not a claim that the block is a point.

import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  buildExactBall,
  exactCell,
  matrixProduct,
  reduceMatrix,
  reducedProduct,
  type ExactBall,
} from '@/code/substrate/coxeter/exact-3434'
import {
  buildHyperbolicBall,
  labelledCoin,
} from '@/code/substrate/coxeter/label-transport'
import { buildD4Torus } from '@/code/substrate/d4-torus'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'

const SHELLS = [1, 24, 456, 8376, 153192]
const FULL_RADIUS = 4
const SLOTS = 24

const roots = rootsD4()
const dot = (a: number[], b: number[]): number =>
  a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0)
const negative = roots.map(r =>
  roots.findIndex(o => o.every((v, i) => v === -(r[i] ?? 0))),
)
const difference = (a: number, b: number): number =>
  roots.findIndex(r => r.every((v, i) => v === roots[b]![i]! - roots[a]![i]!))
// the 192 ordered pairs of roots with a.b = 1
const adjacentPairs: [number, number][] = []

for (let a = 0; a < SLOTS; a++) {
  for (let b = 0; b < SLOTS; b++) {
    if (dot(roots[a]!, roots[b]!) === 1) {
      adjacentPairs.push([a, b])
    }
  }
}

// closing walks at one dock on a mesh given by its neighbour function (-1 off the mesh)
function walksAt(
  n: (c: number, k: number) => number,
  dock: number,
): { squares: number; triangles: number } {
  const step = (c: number, k: number): number => (c < 0 ? -1 : n(c, k))

  let squares = 0
  let triangles = 0

  for (const [a, b] of adjacentPairs) {
    const s = step(step(step(step(dock, a), negative[b]!), a), negative[b]!)
    const t = step(step(step(dock, a), difference(a, b)), negative[b]!)

    if (s === dock) {
      squares++
    }

    if (t === dock) {
      triangles++
    }
  }

  return { squares, triangles }
}

// edges whose two ends share a neighbour, over the whole ball
function triangleEdges(ball: ExactBall): number {
  const mark = new Int32Array(ball.cells).fill(-1)

  let count = 0

  for (let c = 0; c < ball.cells; c++) {
    for (let k = 0; k < SLOTS; k++) {
      const m = ball.table[c * SLOTS + k]!

      if (m >= 0) {
        mark[m] = c
      }
    }

    for (let k = 0; k < SLOTS; k++) {
      const m = ball.table[c * SLOTS + k]!

      if (m < 0) {
        continue
      }

      for (let j = 0; j < SLOTS; j++) {
        const x = ball.table[m * SLOTS + j]!

        if (x >= 0 && mark[x] === c) {
          count++
        }
      }
    }
  }

  return count
}

// v in D4 lies in 2 D4 when every coordinate is even and the halved sum is even
const inTwoD4 = (v: number[]): boolean =>
  v.every(x => x % 2 === 0) &&
  ((v.reduce((s, x) => s + x / 2, 0) % 2) + 2) % 2 === 0

function classConflicts(ball: ExactBall): { checked: number; conflicts: number } {
  const cls: (number[] | undefined)[] = new Array(ball.cells)

  cls[0] = [0, 0, 0, 0]

  let checked = 0
  let conflicts = 0

  // breadth-first order, so every cell's class is set before it is read
  for (let c = 0; c < ball.cells; c++) {
    const v = cls[c]!

    for (let k = 0; k < SLOTS; k++) {
      const m = ball.table[c * SLOTS + k]!

      if (m < 0) {
        continue
      }

      const w = v.map((x, i) => x + roots[k]![i]!)

      if (cls[m] === undefined) {
        cls[m] = w
      } else {
        checked++

        if (!inTwoD4(cls[m]!.map((x, i) => x - w[i]!))) {
          conflicts++
        }
      }
    }
  }

  return { checked, conflicts }
}

export function honeycombTransfer(radius: number): Verdict {
  const started = Date.now()
  const cell = exactCell()
  const cellExact =
    cell.stabilizer.length === 1152 &&
    cell.inversionInStabilizer &&
    cell.inversionCentral &&
    cell.chamberStabilizer === 1 &&
    cell.twiceCenterNorm[0] === -2n &&
    cell.twiceCenterNorm[1] === 0n &&
    cell.facetsMeetCenterAlike &&
    cell.normals.length === SLOTS &&
    cell.gramExact &&
    cell.inversionExchangesAntipodes

  const ball = buildExactBall({ radius, cell })
  const shellsExact = SHELLS.slice(0, radius + 1).every(
    (s, i) => ball.shells[i] === s,
  )

  // 4. against the float ball at radius 3
  const near = radius === 3 ? ball : buildExactBall({ radius: 3, cell })
  const float = buildHyperbolicBall({ coin: labelledCoin(), radius: 3 })
  let floatMismatches = float.cells === near.cells ? 0 : 1

  for (let c = 0; c < Math.min(float.cells, near.cells); c++) {
    for (let k = 0; k < SLOTS; k++) {
      const f = float.mesh.neighbour(c, k)
      const expected = f === float.phantom ? -1 : f

      if (near.table[c * SLOTS + k] !== expected) {
        floatMismatches++
      }
    }
  }

  // 5. triangles and squares
  const triangles = triangleEdges(ball)
  let interior = 0
  let squaresShort = 0
  let triangleWalks = 0

  for (let c = 0; c < ball.cells; c++) {
    if (ball.distance[c]! > radius - 2) {
      continue
    }

    interior++

    const walks = walksAt((x, k) => ball.table[x * SLOTS + k]!, c)

    if (walks.squares !== adjacentPairs.length) {
      squaresShort++
    }

    triangleWalks += walks.triangles
  }

  // 6. the class map
  const classes = classConflicts(ball)

  // 7. the relations mod (3 + sqrt 2)
  const reduction = { prime: 7, sqrtTwo: 4 }
  const one = reduceMatrix(matrixProduct(cell.inversion, cell.inversion), reduction)
  const isOne = (m: number[]): boolean =>
    m.every((v, e) => v === (e % 6 === 0 ? 1 : 0))
  const reduced = cell.transports.map(k => reduceMatrix(k, reduction))
  let relationFailures = isOne(one) ? 0 : 1

  for (let a = 0; a < SLOTS; a++) {
    if (!isOne(reducedProduct(reduced[a]!, reduced[negative[a]!]!, 7))) {
      relationFailures++
    }
  }

  for (const [a, b] of adjacentPairs) {
    const half = reducedProduct(reduced[a]!, reduced[negative[b]!]!, 7)

    if (!isOne(reducedProduct(half, half, 7))) {
      relationFailures++
    }
  }

  // controls: the flat box, and the translation transport
  const torus = buildD4Torus(8)
  const torusShells = [0, 0, 0]
  {
    const dist = new Int32Array(torus.cells.length).fill(-1)
    const queue = [0]

    dist[0] = 0

    for (let h = 0; h < queue.length; h++) {
      const c = queue[h]!

      if (dist[c]! >= 2) {
        continue
      }

      for (const m of torus.neigh[c]!) {
        if (dist[m] === -1) {
          dist[m] = dist[c]! + 1
          queue.push(m)
        }
      }
    }

    for (const d of dist) {
      if (d >= 0 && d <= 2) {
        torusShells[d]!++
      }
    }
  }
  const boxWalks = walksAt((c, k) => torus.neigh[c]![k]!, 0)
  const translation = buildHyperbolicBall({
    coin: labelledCoin(),
    radius: 2,
    kind: 'translation',
  })

  const controlHolds =
    torusShells[2] === 144 &&
    boxWalks.triangles === 192 &&
    boxWalks.squares === 0 &&
    translation.inconsistentSteps > 0

  const solved =
    cellExact &&
    shellsExact &&
    ball.inconsistentSteps === 0 &&
    ball.returnsExactly &&
    floatMismatches === 0 &&
    triangles === 0 &&
    interior > 0 &&
    squaresShort === 0 &&
    triangleWalks === 0 &&
    classes.conflicts === 0 &&
    relationFailures === 0 &&
    controlHolds

  const shellMetrics: Record<string, number> = {}

  ball.shells.forEach((s, i) => {
    shellMetrics[`shell${i}`] = s
  })

  return verdict({
    status: solved ? 'pass' : 'fail',
    claim: `the {3,4,3,4} cell graph built in exact Z[sqrt 2] arithmetic (no float, no rounded key) gives shells ${ball.shells.join(', ')} to radius ${radius}, its antipodal slot labels close on every loop (0 inconsistent steps, every slot a faces slot -a), it equals the float label-transport ball at radius 3 cell for cell, no two neighbouring docks share a neighbour (no triangle) while every interior dock closes all 192 squares (a, -b, a, -b), and the class map k_a -> a mod 2 D4 has no conflict, where the flat D4 box closes 192 triangles and no square at each dock`,
    metrics: {
      ...shellMetrics,
      cells: ball.cells,
      stabilizerOrder: cell.stabilizer.length,
      gramExact: cell.gramExact ? 1 : 0,
      inversionExchangesAntipodes: cell.inversionExchangesAntipodes ? 1 : 0,
      inconsistentSteps: ball.inconsistentSteps,
      returnsExactly: ball.returnsExactly ? 1 : 0,
      floatMismatches,
      triangleEdges: triangles,
      interiorDocks: interior,
      interiorDocksMissingSquares: squaresShort,
      interiorTriangleWalks: triangleWalks,
      classEdgesChecked: classes.checked,
      classConflicts: classes.conflicts,
      relationFailuresMod3PlusSqrt2: relationFailures,
      seconds: Number(((Date.now() - started) / 1000).toFixed(1)),
    },
    control: {
      boxShell2: torusShells[2]!,
      boxTriangleWalks: boxWalks.triangles,
      boxSquareWalks: boxWalks.squares,
      translationInconsistentSteps: translation.inconsistentSteps,
    },
    notes:
      'L2, exact. The ball has a frontier: the outermost shell lacks its outward neighbours (-1), so the walk counts are read only at docks within R - 2 of the base cell, where every walk of length 4 stays inside. The labels are antipodal (F_a Z), which reverse orientation at each step relative to parallel transport, so directions across docks are compared by parallel transport, never by label. The float ball is compared only at radius 3, where its rounded keys are safe. Absorbs tmp/honeycomb-transfer-probe.ts. Radius 4 (153,192 in shell 4) is the M3 run.',
  })
}

export default experiment({
  id: 'geometry/honeycomb-transfer',
  code: 'E-GMT-0040',
  title:
    'the {3,4,3,4} honeycomb in exact Z[sqrt 2]: shells 1, 24, 456, 8376, 153192, antipodal slot labels that close on every loop, equal to the float ball at radius 3, no triangle and 192 closing squares per dock, a conflict-free class map mod 2 D4, against the flat box with 192 triangles and no square',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return honeycombTransfer(FULL_RADIUS)
  },
})
