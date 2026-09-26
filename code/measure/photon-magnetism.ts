// Magnetism in the U(1) link sector of code/rule/photon-links, read on the husk (code/measure/photon-husk).
//
// - Magnetostatics. A steady current J (flux added round a closed loop of links every beat, which is what a
//   ring of vibes each hopping one link per beat does to E) is balanced when the kick cancels it on average,
//   kappa curl^T curl <A> = -J in the linear regime. `magnetostaticAngles` solves that by conjugate gradient
//   on the bulk, the lattice Biot-Savart law the measured field is compared with.
// - The husk's magnetic field. A husk square on two axes has equal link weights (2 bulk links per column
//   dock on each axis), so the circulation of the projected angles round it is invariant under the husk
//   frame change a bulk frame change induces: B on the husk. Read centered mod N.
// - Monopoles (DeGrand and Toussaint 1980). A closed surface of plaquettes has raw flux 0, since every link
//   is counted twice with opposite orientation. With each plaquette's B taken centered in (-N/2, N/2], the
//   sum is a whole multiple of N: the number of Dirac monopoles inside. The bulk's elementary 3-cells are the
//   tetrahedra of the D4 lattice (four docks, every pair a root apart), bounded by 4 triangles. The husk's are
//   its cubes, bounded by 6 axis squares.
// - Aharonov-Bohm. The fear walk (code/rule/fear-walk, E-QTM-0103) run round a closed loop of husk links,
//   each step multiplying the weight by omega^(3 q A / N), A the projected angle of the link crossed in the
//   direction of travel and q the walker's charge. Exact in Eisenstein integers only when every such A is a
//   multiple of N / 3, so N must be divisible by 3.

import { type Eisenstein, type Coin, turn, walkStart, walkBeat, STAY_COIN, type WalkState } from '@/code/rule/fear-walk'
import { photonLink, type PhotonLattice, type PhotonRule } from '@/code/rule/photon-links'
import { HUSK_VECTORS, type Husk } from '@/code/measure/photon-husk'

const modulo = (x: number, m: number): number => ((x % m) + m) % m
const centered = (x: number, n: number): number => {
  const v = modulo(x, n)

  return v > n / 2 ? v - n : v
}

// curl^T curl of a bulk link field (real), by the lattice's plaquettes
export function curlCurl(lattice: PhotonLattice, a: Float64Array, out: Float64Array): void {
  const size = lattice.plaquetteSize

  out.fill(0)

  for (let p = 0; p < lattice.plaquetteCount; p++) {
    let b = 0

    for (let j = 0; j < size; j++) {
      b += (lattice.plaquetteSigns[p * size + j] ?? 0) * (a[lattice.plaquetteLinks[p * size + j] ?? 0] ?? 0)
    }

    for (let j = 0; j < size; j++) {
      const l = lattice.plaquetteLinks[p * size + j] ?? 0

      out[l] = (out[l] ?? 0) + (lattice.plaquetteSigns[p * size + j] ?? 0) * b
    }
  }
}

// the linear static angles of a steady current: kappa curl^T curl A = -J, J per beat in flux units
export function magnetostaticAngles(rule: PhotonRule, current: Float64Array): Float64Array {
  const lattice = rule.lattice
  const kappa = (2 * Math.PI * rule.k) / rule.n
  const b = Float64Array.from(current, j => -j / kappa)
  const x = new Float64Array(lattice.links)
  const r = Float64Array.from(b)
  const p = Float64Array.from(b)
  const ap = new Float64Array(lattice.links)
  const dot = (u: Float64Array, v: Float64Array): number => u.reduce((s, y, i) => s + y * (v[i] ?? 0), 0)
  const bb = dot(b, b)

  let rr = bb

  for (let it = 0; it < 4000 && rr > 1e-24 * bb; it++) {
    curlCurl(lattice, p, ap)

    const alpha = rr / dot(p, ap)

    for (let i = 0; i < x.length; i++) {
      x[i] = (x[i] ?? 0) + alpha * (p[i] ?? 0)
      r[i] = (r[i] ?? 0) - alpha * (ap[i] ?? 0)
    }

    const next = dot(r, r)

    for (let i = 0; i < x.length; i++) {
      p[i] = (r[i] ?? 0) + (next / rr) * (p[i] ?? 0)
    }

    rr = next
  }

  return x
}

// the circulation of projected angles round the husk square at dock y on axes u and v (0, 1, 2), in the order
// y -> y + u -> y + u + v -> y + v -> y; centered mod n when n is given, raw otherwise
export function huskSquare(husk: Husk, angle: ArrayLike<number>, y: number, u: number, v: number, n?: number): number {
  const h = HUSK_VECTORS.length
  const step = (z: number, axis: number): number => husk.lattice.neighbour[z * husk.lattice.degree + 2 * axis] ?? 0
  const yu = step(y, u)
  const yv = step(y, v)
  const raw = (angle[y * h + u] ?? 0) + (angle[yu * h + v] ?? 0) - (angle[yv * h + u] ?? 0) - (angle[y * h + v] ?? 0)

  return n === undefined ? raw : centered(raw, n)
}

// monopoles in every husk cube: sum over its 6 faces (outward) of the centered square flux, divided by N
export function huskMonopoles(husk: Husk, angle: ArrayLike<number>, n: number): { total: number; cubes: number } {
  const cells = husk.lattice.cells
  const step = (z: number, axis: number): number => husk.lattice.neighbour[z * husk.lattice.degree + 2 * axis] ?? 0

  let total = 0

  for (let y = 0; y < cells; y++) {
    // faces normal to each axis w, with the square on the other two in cyclic order (u, v, w)
    let flux = 0

    for (const [u, v, w] of [
      [0, 1, 2],
      [1, 2, 0],
      [2, 0, 1],
    ] as const) {
      flux += huskSquare(husk, angle, step(y, w), u, v, n) - huskSquare(husk, angle, y, u, v, n)
    }

    total += Math.abs(Math.round(flux / n))
  }

  return { total, cubes: cells }
}

export type Tetrahedra = { readonly count: number; readonly faces: Int32Array; readonly signs: Int8Array }

// the tetrahedra of the D4 box: docks x, x + a, x + b, x + c with every difference a root, each kept once;
// each face is a triangle of three link steps, stored as (link, orientation) x 3, the four faces oriented
// as the boundary [123] - [023] + [013] - [012]
export function d4Tetrahedra(lattice: PhotonLattice): Tetrahedra {
  const roots = lattice.vectors
  const find = (v: readonly number[]): number => roots.findIndex(r => r.every((x, i) => x === v[i]))
  const sub = (p: readonly number[], q: readonly number[]): number[] => p.map((x, i) => x - (q[i] ?? 0))
  const shapes: number[][][] = []
  const seen = new Set<string>()

  // shapes up to translation: vertex sets {0, a, b, c}, canonical by sorted vertex list after shifting the
  // lexicographically smallest vertex to 0
  for (let a = 0; a < roots.length; a++) {
    for (let b = a + 1; b < roots.length; b++) {
      for (let c = b + 1; c < roots.length; c++) {
        const vs = [[0, 0, 0, 0], roots[a] ?? [], roots[b] ?? [], roots[c] ?? []]
        const ok = [
          [1, 2],
          [1, 3],
          [2, 3],
        ].every(([i = 0, j = 0]) => find(sub(vs[j] ?? [], vs[i] ?? [])) >= 0)

        if (!ok) {
          continue
        }

        const sorted = [...vs].sort((p, q) => {
          for (let i = 0; i < 4; i++) {
            if ((p[i] ?? 0) !== (q[i] ?? 0)) {
              return (p[i] ?? 0) - (q[i] ?? 0)
            }
          }

          return 0
        })
        const base = sorted[0] ?? [0, 0, 0, 0]
        const shape = sorted.map(v => sub(v, base))
        const key = shape.map(v => v.join(',')).join(';')

        if (!seen.has(key)) {
          seen.add(key)
          shapes.push(shape)
        }
      }
    }
  }

  const faces: number[] = []
  const signs: number[] = []
  const boundary: [number[], number][] = [
    [[1, 2, 3], 1],
    [[0, 2, 3], -1],
    [[0, 1, 3], 1],
    [[0, 1, 2], -1],
  ]

  for (let x = 0; x < lattice.cells; x++) {
    for (const shape of shapes) {
      // the docks of the shape from x: walk each vertex from x by roots (each vertex of the shape is a root
      // from vertex 0 except vertex 0 itself)
      const dock = shape.map(v => {
        if (v.every(c => c === 0)) {
          return x
        }

        return lattice.neighbour[x * lattice.degree + find(v)] ?? 0
      })

      for (const [[i = 0, j = 0, k = 0], sign] of boundary) {
        // the triangle i -> j -> k -> i
        for (const [from, to] of [
          [i, j],
          [j, k],
          [k, i],
        ] as const) {
          const d = find(sub(shape[to] ?? [], shape[from] ?? []))
          const [l, s] = photonLink(lattice, dock[from] ?? 0, d)

          faces.push(l)
          signs.push(s * sign)
        }
      }
    }
  }

  return { count: faces.length / 12, faces: Int32Array.from(faces), signs: Int8Array.from(signs) }
}

// monopoles in every tetrahedron: sum of the 4 faces' centered B (oriented), divided by N
export function bulkMonopoles(tetrahedra: Tetrahedra, angle: ArrayLike<number>, n: number): number {
  let total = 0

  for (let t = 0; t < tetrahedra.count; t++) {
    let flux = 0

    for (let face = 0; face < 4; face++) {
      let b = 0

      // each step's sign carries the link's orientation times the face's boundary sign
      for (let e = 0; e < 3; e++) {
        const idx = t * 12 + face * 3 + e

        b += (tetrahedra.signs[idx] ?? 0) * (angle[tetrahedra.faces[idx] ?? 0] ?? 0)
      }

      flux += centered(b, n)
    }

    total += Math.abs(Math.round(flux / n))
  }

  return total
}

// the fear walk round a closed husk loop: `steps` the loop's husk links as (husk link, orientation along the
// loop), the swap phase at cell 0 and free streaming elsewhere, each crossing weighted by omega^(3 q A / N)
// for a walker of charge q (its conjugate going backward). Returns the walk after `beats` beats. Throws unless
// every crossed angle is a multiple of N / 3
export function loopWalk(input: {
  steps: readonly (readonly [number, number])[]
  angle: ArrayLike<number>
  n: number
  charge: number
  splitter: Coin
  beats: number
}): WalkState {
  const { steps, angle, n, charge } = input
  const cells = steps.length
  const turns = steps.map(([l, s]) => {
    const third = (3 * modulo(s * (angle[l] ?? 0), n)) / n

    if (!Number.isInteger(third)) {
      throw new Error(`angle ${angle[l]} is not a multiple of N / 3`)
    }

    return modulo(charge * third, 3)
  })

  let state = walkStart(cells, 0, true)

  for (let t = 0; t < input.beats; t++) {
    state = walkBeat(state, x => (x === 0 ? input.splitter : STAY_COIN))
    // after streaming, the right-moving weight at x crossed step x - 1 forward, the left-moving weight at x
    // crossed step x backward
    state = {
      ...state,
      right: state.right.map((w: Eisenstein, x) => turn(w, turns[modulo(x - 1, cells)] ?? 0)),
      left: state.left.map((w: Eisenstein, x) => turn(w, -(turns[x] ?? 0))),
    }
  }

  return state
}
