// The {3,4,3,4} honeycomb's labelled cell graph in EXACT arithmetic. Every number is an element x + y sqrt 2 of
// Z[sqrt 2], held as a pair of bigints. Nothing is a float, nothing is rounded, and a cell is keyed by its exact
// center, never by a rounded coordinate. This is label-transport.ts (`labelledCoin`, `labelTransports`,
// `buildHyperbolicBall`) made exact, with the same face order, the same slot labels and the same breadth-first
// cell order, so the two agree table for table up to radius 3, where the float version is still safe.
//
// The representation is the geometric one of the Coxeter group [3,4,3,4] on R^5, in the basis of its five simple
// roots a0..a4. B(a_i, a_j) = -cos(pi / m_ij), so 2B has entries 2 (diagonal), -1 (label 3), -sqrt 2 (label 4) and
// 0, and det(2B) = -2. A vector is its coefficient column x (v = sum x_i a_i), and the reflection in a root n is
// x -> x - (n^T 2B x) n, an integer matrix over Z[sqrt 2].
//
// The pieces, all exact:
//
// - H = <s0, s1, s2, s3> = W(F4), the base cell's symmetry group, 1,152 elements.
// - c0 = (2, 4, 3 sqrt 2, 2 sqrt 2, 1), the cell center: fixed by H, with B(c0, c0) = -1 and B(a4, c0) = -1.
// - Z, the point inversion of the cell, x -> -x + 2 x_4 c0 (-1 on the span of a0..a3, the longest element of H).
// - the 24 facet normals n = h a4 (one per coset of B3 = <s0, s1, s2>, in H's breadth-first order), the facet
//   reflections F_a, and the facet directions n - c0, whose Gram is exactly the D4 root Gram.
// - the transports k_a = F_a Z, matched to `rootsD4()` order by that Gram, the antipodal labels that close
//   around every loop (note/honeycomb-transfer-radius.md, Theorem A).
//
// The ball is a breadth-first search over frames g -> g k_a. A cell is keyed by its center g c0. A frame is fixed
// by its center and its image of one chamber point p whose stabilizer in H is trivial (if g c0 = g' c0 then
// g^-1 g' lies in H, and then g p = g' p forces it to be 1), so a step that reaches a known center with a
// different g p is an inconsistent step, the exact form of the float check.
//
// `reduce: { prime, sqrtTwo }` runs the same search over the transports reduced modulo a prime ideal of Z[sqrt 2]
// (sqrt 2 -> s with s^2 = 2 mod p), keyed by the whole reduced frame. With no radius it enumerates the finite
// group the transports generate mod p, the quotient of item vibe-roadmap-honeycomb-0008.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { type Mesh } from '@/code/tool/mesh'

const DIM = 5
const ENTRIES = DIM * DIM
const SLOTS = 24

// An exact matrix: 25 entries, entry (i, j) at 2 (5 i + j) (the rational part) and 2 (5 i + j) + 1 (the sqrt 2 part).
export type ExactMatrix = bigint[]
// An exact vector: 5 entries, the same interleaving.
export type ExactVector = bigint[]

// twice the Gram of the simple roots, as (rational, sqrt 2) parts: 2 on the diagonal, -1 for label 3, -sqrt 2 for
// label 4. The diagram is the path 0 -3- 1 -4- 2 -3- 3 -4- 4.
export const TWICE_GRAM: ExactMatrix = (() => {
  const g = new Array<bigint>(2 * ENTRIES).fill(0n)
  const labels = [3, 4, 3, 4]

  for (let i = 0; i < DIM; i++) {
    g[2 * (i * DIM + i)] = 2n
  }

  labels.forEach((m, i) => {
    const j = i + 1
    const part = m === 3 ? 0 : 1

    g[2 * (i * DIM + j) + part] = -1n
    g[2 * (j * DIM + i) + part] = -1n
  })

  return g
})()

function identityMatrix(): ExactMatrix {
  const m = new Array<bigint>(2 * ENTRIES).fill(0n)

  for (let i = 0; i < DIM; i++) {
    m[2 * (i * DIM + i)] = 1n
  }

  return m
}

export function matrixProduct(a: ExactMatrix, b: ExactMatrix): ExactMatrix {
  const out = new Array<bigint>(2 * ENTRIES)

  for (let i = 0; i < DIM; i++) {
    for (let j = 0; j < DIM; j++) {
      let x = 0n
      let y = 0n

      for (let k = 0; k < DIM; k++) {
        const p = 2 * (i * DIM + k)
        const q = 2 * (k * DIM + j)
        const ax = a[p]!
        const ay = a[p + 1]!
        const bx = b[q]!
        const by = b[q + 1]!

        x += ax * bx + 2n * ay * by
        y += ax * by + ay * bx
      }

      out[2 * (i * DIM + j)] = x
      out[2 * (i * DIM + j) + 1] = y
    }
  }

  return out
}

export function matrixVector(m: ExactMatrix, v: ExactVector): ExactVector {
  const out = new Array<bigint>(2 * DIM)

  for (let i = 0; i < DIM; i++) {
    let x = 0n
    let y = 0n

    for (let k = 0; k < DIM; k++) {
      const p = 2 * (i * DIM + k)
      const mx = m[p]!
      const my = m[p + 1]!
      const vx = v[2 * k]!
      const vy = v[2 * k + 1]!

      x += mx * vx + 2n * my * vy
      y += mx * vy + my * vx
    }

    out[2 * i] = x
    out[2 * i + 1] = y
  }

  return out
}

// 2 B(u, v) = u^T (2B) v, an element of Z[sqrt 2] as [rational, sqrt 2]
export function twiceForm(u: ExactVector, v: ExactVector): [bigint, bigint] {
  const w = matrixVector(TWICE_GRAM, v)
  let x = 0n
  let y = 0n

  for (let i = 0; i < DIM; i++) {
    const ux = u[2 * i]!
    const uy = u[2 * i + 1]!
    const wx = w[2 * i]!
    const wy = w[2 * i + 1]!

    x += ux * wx + 2n * uy * wy
    y += ux * wy + uy * wx
  }

  return [x, y]
}

// the reflection in the root n: x -> x - (n^T 2B x) n, so its matrix is I - n (2B n)^T
export function reflectionIn(n: ExactVector): ExactMatrix {
  const row = matrixVector(TWICE_GRAM, n) // (2B n), and 2B is symmetric
  const m = identityMatrix()

  for (let i = 0; i < DIM; i++) {
    for (let j = 0; j < DIM; j++) {
      const nx = n[2 * i]!
      const ny = n[2 * i + 1]!
      const rx = row[2 * j]!
      const ry = row[2 * j + 1]!
      const p = 2 * (i * DIM + j)

      m[p] = m[p]! - (nx * rx + 2n * ny * ry)
      m[p + 1] = m[p + 1]! - (nx * ry + ny * rx)
    }
  }

  return m
}

function unitVector(i: number): ExactVector {
  const v = new Array<bigint>(2 * DIM).fill(0n)

  v[2 * i] = 1n

  return v
}

const keyOf = (values: bigint[]): string => values.join(',')

const sameValues = (a: bigint[], b: bigint[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i])

export type ExactCell = {
  // the five simple reflections s0..s4
  readonly reflections: ExactMatrix[]
  // H = <s0..s3>, in breadth-first order (left multiplication by s0..s3), as frame.ts builds it
  readonly stabilizer: ExactMatrix[]
  readonly center: ExactVector
  // the chamber point whose stabilizer in H is trivial
  readonly chamberPoint: ExactVector
  // how many elements of H fix the chamber point (must be 1)
  readonly chamberStabilizer: number
  // the point inversion Z, and whether it is in H and central there
  readonly inversion: ExactMatrix
  readonly inversionInStabilizer: boolean
  readonly inversionCentral: boolean
  // 2 B(c0, c0) and 2 B(n, c0) for every facet normal, which must be -2 and -2
  readonly twiceCenterNorm: [bigint, bigint]
  readonly facetsMeetCenterAlike: boolean
  // the facet normals in H's orbit order (frame.ts), and faceOfLabel[k] the facet carrying rootsD4()[k]
  readonly normals: ExactVector[]
  readonly faceOfLabel: number[]
  readonly opposite: number[]
  // every entry of the labelled facet-direction Gram equals the D4 root dot product, exactly
  readonly gramExact: boolean
  // the facet reflections and the transports k_a = F_a Z, one per label in rootsD4() order
  readonly faces: ExactMatrix[]
  readonly transports: ExactMatrix[]
  // Z F_a Z = F_{-a} for every label
  readonly inversionExchangesAntipodes: boolean
}

// The labelled exact cell. The face order and the labelling search are those of frame.ts and labelledCoin, so the
// labels agree with the float version (a group element's place in a breadth-first enumeration does not depend on
// the representation).
export function exactCell(): ExactCell {
  const reflections = Array.from({ length: DIM }, (_, i) =>
    reflectionIn(unitVector(i)),
  )
  const cellMirrors = reflections.slice(0, 4)

  const stabilizer: ExactMatrix[] = [identityMatrix()]
  const seen = new Set<string>([keyOf(stabilizer[0]!)])

  // a for-of over a growing array visits the elements pushed during the loop, a breadth-first closure
  for (const element of stabilizer) {
    for (const mirror of cellMirrors) {
      const g = matrixProduct(mirror, element)
      const key = keyOf(g)

      if (!seen.has(key)) {
        seen.add(key)
        stabilizer.push(g)
      }
    }
  }

  // c0 = (2, 4, 3 sqrt 2, 2 sqrt 2, 1)
  const center: ExactVector = [2n, 0n, 4n, 0n, 0n, 3n, 0n, 2n, 1n, 0n]
  const twiceCenterNorm = twiceForm(center, center)

  // Z x = -x + 2 x_4 c0
  const inversion = new Array<bigint>(2 * ENTRIES).fill(0n)

  for (let i = 0; i < DIM; i++) {
    inversion[2 * (i * DIM + i)] = -1n
    inversion[2 * (i * DIM + 4)] =
      inversion[2 * (i * DIM + 4)]! + 2n * center[2 * i]!
    inversion[2 * (i * DIM + 4) + 1] =
      inversion[2 * (i * DIM + 4) + 1]! + 2n * center[2 * i + 1]!
  }

  const inversionCentral = cellMirrors.every(s =>
    sameValues(matrixProduct(s, inversion), matrixProduct(inversion, s)),
  )

  // the chamber point: the first (1, k, k^2, k^3, k^4) that no element of H but 1 fixes
  let chamberPoint: ExactVector = []
  let chamberStabilizer = 0

  for (let k = 2n; k < 64n; k++) {
    const p: ExactVector = [1n, 0n, k, 0n, k * k, 0n, k ** 3n, 0n, k ** 4n, 0n]
    const fixing = stabilizer.filter(h =>
      sameValues(matrixVector(h, p), p),
    ).length

    if (fixing === 1) {
      chamberPoint = p
      chamberStabilizer = fixing
      break
    }
  }

  // the facet normals, the H-orbit of a4 in H's order
  const normals: ExactVector[] = []
  const normalSeen = new Set<string>()

  for (const h of stabilizer) {
    const n = matrixVector(h, unitVector(4))
    const key = keyOf(n)

    if (!normalSeen.has(key)) {
      normalSeen.add(key)
      normals.push(n)
    }
  }

  const facetsMeetCenterAlike = normals.every(n => {
    const [x, y] = twiceForm(n, center)

    return x === -2n && y === 0n
  })

  // facet directions d = n - c0 (the step to the neighbour's center, projected off c0, over 2). Their Gram is
  // B(n_a, n_b) + 1; twice it is 2B(n_a, n_b) + 2, which must be twice a D4 dot product with no sqrt 2 part.
  const directions = normals.map(n => n.map((v, i) => v - center[i]!))
  const twiceGram = normals.map(a =>
    normals.map(b => {
      const [x, y] = twiceForm(a, b)

      return y === 0n ? Number(x + 2n) : Number.NaN
    }),
  )

  const roots = rootsD4()
  const dot = (a: number[], b: number[]): number =>
    a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0)
  const opposite = roots.map(root =>
    roots.findIndex(other => other.every((v, i) => v === -(root[i] ?? 0))),
  )
  const basisRoots = [
    [1, 1, 0, 0],
    [1, -1, 0, 0],
    [0, 0, 1, 1],
    [0, 0, 1, -1],
  ]
  const basis = basisRoots.map(b =>
    roots.findIndex(r => r.every((v, i) => v === b[i])),
  )
  // twice each root's coefficients on that orthogonal basis of norm 2, integers
  const twiceCoefficients = roots.map(r => basisRoots.map(b => dot(r, b)))

  let faceOfLabel: number[] = []
  const chosen: number[] = []

  const complete = (): boolean => {
    const map: number[] = []

    for (let k = 0; k < roots.length; k++) {
      const c = twiceCoefficients[k]!
      const target = directions[0]!.map((_, i) =>
        chosen.reduce(
          (s, face, j) => s + BigInt(c[j] ?? 0) * directions[face]![i]!,
          0n,
        ),
      )
      const match = directions.findIndex(d =>
        d.every((v, i) => 2n * v === target[i]),
      )

      if (match < 0 || map.includes(match)) {
        return false
      }

      map.push(match)
    }

    faceOfLabel = map

    return true
  }

  const search = (depth: number): boolean => {
    if (depth === basis.length) {
      return complete()
    }

    for (let face = 0; face < normals.length; face++) {
      if (chosen.includes(face) || twiceGram[face]![face] !== 4) {
        continue
      }

      const fits = chosen.every(
        (other, i) =>
          twiceGram[face]![other] ===
          2 * dot(roots[basis[depth]!]!, roots[basis[i]!]!),
      )

      if (!fits) {
        continue
      }

      chosen.push(face)

      if (search(depth + 1)) {
        return true
      }

      chosen.pop()
    }

    return false
  }

  const found = search(0)
  const gramExact =
    found &&
    faceOfLabel.every((fa, k) =>
      faceOfLabel.every(
        (fb, l) => twiceGram[fa]![fb] === 2 * dot(roots[k]!, roots[l]!),
      ),
    )

  const allFaces = normals.map(n => reflectionIn(n))
  const faces = faceOfLabel.map(face => allFaces[face]!)
  const transports = faces.map(f => matrixProduct(f, inversion))
  const inversionExchangesAntipodes = faces.every((f, k) =>
    sameValues(
      matrixProduct(matrixProduct(inversion, f), inversion),
      faces[opposite[k]!]!,
    ),
  )

  return {
    reflections,
    stabilizer,
    center,
    chamberPoint,
    chamberStabilizer,
    inversion,
    inversionInStabilizer: seen.has(keyOf(inversion)),
    inversionCentral,
    twiceCenterNorm,
    facetsMeetCenterAlike,
    normals,
    faceOfLabel,
    opposite,
    gramExact,
    faces,
    transports,
    inversionExchangesAntipodes,
  }
}

// A prime ideal of Z[sqrt 2]: entries go mod `prime` with sqrt 2 -> `sqrtTwo`, where sqrtTwo^2 = 2 mod prime. The
// default is the larger root, which for 7 is 4, the ideal (3 + sqrt 2).
export type ExactReduction = { prime: number; sqrtTwo?: number }

export function reductionRoot(reduce: ExactReduction): number {
  const { prime } = reduce

  if (!Number.isInteger(prime) || prime < 3 || prime > 1 << 25) {
    throw new Error(`reduce.prime must be an odd prime below 2^25: ${prime}`)
  }

  if (reduce.sqrtTwo !== undefined) {
    if ((reduce.sqrtTwo * reduce.sqrtTwo) % prime !== 2 % prime) {
      throw new Error(`${reduce.sqrtTwo}^2 is not 2 mod ${prime}`)
    }

    return reduce.sqrtTwo
  }

  for (let s = prime - 1; s > 0; s--) {
    if ((s * s) % prime === 2) {
      return s
    }
  }

  throw new Error(`2 is not a square mod ${prime}`)
}

// An exact matrix reduced mod the ideal: 25 residues in [0, prime).
export function reduceMatrix(m: ExactMatrix, reduce: ExactReduction): number[] {
  const p = BigInt(reduce.prime)
  const s = BigInt(reductionRoot(reduce))
  const out: number[] = []

  for (let e = 0; e < ENTRIES; e++) {
    const v = (m[2 * e]! + m[2 * e + 1]! * s) % p

    out.push(Number(v < 0n ? v + p : v))
  }

  return out
}

export function reducedProduct(a: number[], b: number[], prime: number): number[] {
  const out = new Array<number>(ENTRIES)

  for (let i = 0; i < DIM; i++) {
    for (let j = 0; j < DIM; j++) {
      let x = 0

      for (let k = 0; k < DIM; k++) {
        x = (x + a[i * DIM + k]! * b[k * DIM + j]!) % prime
      }

      out[i * DIM + j] = x
    }
  }

  return out
}

export type ExactBall = {
  // the ball's cells only: neighbour(c, a) is -1 when the neighbour lies outside the ball
  readonly mesh: Mesh
  readonly cells: number
  readonly radius: number
  readonly distance: Int32Array
  // cells * 24 entries, -1 for a missing neighbour, slots in rootsD4() order
  readonly table: Int32Array
  // cells by distance from the base cell
  readonly shells: number[]
  // exact mode: steps reaching a known center with a different frame (0 when the labels close)
  readonly inconsistentSteps: number
  // neighbour(neighbour(c, a), -a) = c wherever both are in the ball
  readonly returnsExactly: boolean
  // the frames, when keepFrames was set (exact matrices, or reduced residues in reduce mode)
  readonly frames?: (ExactMatrix | number[])[]
}

// The ball of cells within `radius` facet steps of the base cell. Exact by default. With `reduce`, the search runs
// mod a prime ideal, and an omitted radius enumerates the whole finite group.
export function buildExactBall(input: {
  radius?: number
  reduce?: ExactReduction
  keepFrames?: boolean
  cell?: ExactCell
}): ExactBall {
  const cell = input.cell ?? exactCell()
  const radius = input.radius ?? Number.POSITIVE_INFINITY

  if (input.reduce === undefined && !Number.isFinite(radius)) {
    throw new Error('an exact ball needs a finite radius')
  }

  const distance: number[] = [0]
  const rows: Int32Array[] = []
  const keep = input.keepFrames === true
  const kept: (ExactMatrix | number[])[] = []

  let inconsistentSteps = 0

  if (input.reduce === undefined) {
    // the step images of c0 and of the chamber point, k_a c0 and k_a p
    const stepCenter = cell.transports.map(k => matrixVector(k, cell.center))
    const stepChamber = cell.transports.map(k =>
      matrixVector(k, cell.chamberPoint),
    )
    // a frame is needed only until its cell is expanded, so it is dropped after
    const frames: (ExactMatrix | undefined)[] = [identityMatrix()]
    const chamberKeys: string[] = [keyOf(cell.chamberPoint)]
    const index = new Map<string, number>([[keyOf(cell.center), 0]])

    for (let head = 0; head < frames.length; head++) {
      const g = frames[head]!
      const row = new Int32Array(SLOTS).fill(-1)
      const here = distance[head]!

      for (let k = 0; k < SLOTS; k++) {
        const key = keyOf(matrixVector(g, stepCenter[k]!))
        const chamber = keyOf(matrixVector(g, stepChamber[k]!))
        let id = index.get(key)

        if (id === undefined && here < radius) {
          id = frames.length
          index.set(key, id)
          frames.push(matrixProduct(g, cell.transports[k]!))
          chamberKeys.push(chamber)
          distance.push(here + 1)
        } else if (id !== undefined && chamberKeys[id] !== chamber) {
          inconsistentSteps++
        }

        row[k] = id ?? -1
      }

      rows.push(row)

      if (keep) {
        kept.push(g)
      }

      frames[head] = undefined
    }
  } else {
    const prime = input.reduce.prime
    const transports = cell.transports.map(k => reduceMatrix(k, input.reduce!))
    const one = reduceMatrix(identityMatrix(), input.reduce)
    const frames: (number[] | undefined)[] = [one]
    const index = new Map<string, number>([[one.join(','), 0]])

    for (let head = 0; head < frames.length; head++) {
      const g = frames[head]!
      const row = new Int32Array(SLOTS).fill(-1)
      const here = distance[head]!

      for (let k = 0; k < SLOTS; k++) {
        const next = reducedProduct(g, transports[k]!, prime)
        const key = next.join(',')
        let id = index.get(key)

        if (id === undefined && here < radius) {
          id = frames.length
          index.set(key, id)
          frames.push(next)
          distance.push(here + 1)
        }

        row[k] = id ?? -1
      }

      rows.push(row)

      if (keep) {
        kept.push(g)
      }

      frames[head] = undefined
    }
  }

  const cells = rows.length
  const table = new Int32Array(cells * SLOTS)

  rows.forEach((row, c) => table.set(row, c * SLOTS))

  let returnsExactly = true

  for (let c = 0; c < cells; c++) {
    for (let k = 0; k < SLOTS; k++) {
      const n = table[c * SLOTS + k]!

      if (n >= 0) {
        const back = table[n * SLOTS + cell.opposite[k]!]!

        if (back >= 0 && back !== c) {
          returnsExactly = false
        }
      }
    }
  }

  const shells: number[] = []

  for (const d of distance) {
    shells[d] = (shells[d] ?? 0) + 1
  }

  const opposite = cell.opposite
  const id = input.reduce
    ? `exact-3434-mod-${input.reduce.prime}-${reductionRoot(input.reduce)}${Number.isFinite(radius) ? `-ball-${radius}` : ''}`
    : `exact-3434-ball-${radius}`

  return {
    mesh: {
      id,
      degree: SLOTS,
      cellCount: cells,
      neighbour(c, direction) {
        return table[c * SLOTS + direction] ?? -1
      },
      opposite(direction) {
        return opposite[direction] ?? direction
      },
    },
    cells,
    radius,
    distance: Int32Array.from(distance),
    table,
    shells,
    inconsistentSteps,
    returnsExactly,
    ...(keep ? { frames: kept } : {}),
  }
}
