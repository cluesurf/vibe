// The husk: the 3D surface where the link field of code/rule/photon-links is read as physical, defined as a
// projection of the 4D bulk.
//
// What the husk is. The {3,4,3,4} honeycomb has ideal vertices: its vertex figure is the cubic honeycomb
// {4,3,4}, a Euclidean tiling, so each vertex sits at infinity and the horosphere round it is tiled exactly
// by cubes (code/measure/cusp-dimension, E-GMT-0002: the cusp is a flat 3D sheet). That cubic horosphere is
// the husk. The gauge experiments run the bulk on the D4 box (code/substrate/d4-box), the flat lattice model
// of the {3,4,3,4} cusp region, whose docks are D4 = {x in Z^4 : sum x even}. Take the depth, the
// direction toward the ideal vertex, along a coordinate axis, e4 (a short root direction of F4; triality
// sends it to (1/2, 1/2, 1/2, 1/2), so every short-root choice is the same). Dropping x4 sends D4 onto all of
// Z^3, and the box's periods L D4 onto L Z^3: the shadow is exactly the cubic lattice, the husk's {4,3,4},
// and each husk dock is a column, the L bulk docks over it along the depth (x4 of one parity, mod 2L). The
// 24 roots cast 12 shadows on the 6 cubic axes, two each (the root's depth +1 or -1, the "two-valued label"
// of E-GMT-0032), and 12 on the face diagonals, one each. So each husk dock has 9 link directions: 3 axes
// of weight 2 and 6 diagonals of weight 1.
//
// The projection is the sum over each column, not a restriction. A husk link carries the sum of the bulk
// links between its two columns: the flux through that face of the husk, and the angle sum. Three reasons,
// each checked in E-FRC-0168:
// - it keeps Gauss's law. No root lies along the depth alone, so every bulk flux either stays inside a
//   column (it cancels) or crosses between columns (it is counted), and the husk divergence is exactly the
//   column's charge. A restriction to one sheet (the docks with x4 in {0, 1}, one per column, each husk link
//   one bulk link) loses the flux that leaves the sheet, and breaks it
// - it keeps the gauge structure: a bulk frame change chi becomes the husk frame change by the column sum
//   of chi, each link weighted by its multiplicity
// - on the torus it is the zero mode of the depth, k4 = 0, the part of the bulk field that does not vary
//   along the depth. A bulk field that is the same all along every column stays so under the rule (the
//   depth translation by 2 e4 is a symmetry of the box and the leapfrog is parallel), so the husk field of
//   such a state is run by an exact 3D rule
// The flat box is a model: in the hyperbolic bulk the columns shrink with depth, and the sum would carry the
// warp factor. That is not modeled here.

import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { buildPhotonLattice, type PhotonLattice } from '@/code/rule/photon-links'
import { hermitianEigen, plaquetteWaveMatrix } from '@/code/measure/photon-modes'
import { d4Vector, d4BoxCoordinates } from '@/code/substrate/d4-box'
import { type Mesh } from '@/code/tool/mesh'

// the husk's 9 link directions: 3 axes, then 6 face diagonals, in the order the first D4 roots cast them
export const HUSK_VECTORS: readonly (readonly number[])[] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 0],
  [1, -1, 0],
  [1, 0, 1],
  [1, 0, -1],
  [0, 1, 1],
  [0, 1, -1],
]

// how many bulk links per column dock cast each husk direction
export const HUSK_WEIGHTS: readonly number[] = [2, 2, 2, 1, 1, 1, 1, 1, 1]

const modulo = (x: number, m: number): number => ((x % m) + m) % m

export type Husk = {
  readonly bulk: PhotonLattice
  readonly side: number
  // the husk read as a PhotonLattice (no plaquettes), so the mode readers of code/measure/photon-modes apply
  readonly lattice: PhotonLattice
  // the husk dock of each bulk dock, and its depth x4 mod 2 side
  readonly column: Int32Array
  readonly depth: Int32Array
  // the husk direction each bulk link direction casts (always with orientation +1)
  readonly shadow: Int32Array
  // the bulk dock one depth step 2 e4 along: the translation that keeps every column
  readonly along: Int32Array
  // the bulk links of the sheet x4 in {0, 1} whose far end is also in it: exactly one per husk link
  readonly sheet: Uint8Array
}

export function makeHusk(bulk: PhotonLattice): Husk {
  const side = bulk.side
  const f = bulk.firsts.length
  const vector = (x: number): number[] => d4Vector(d4BoxCoordinates({ cell: x, side }))
  const column = new Int32Array(bulk.cells)
  const depth = new Int32Array(bulk.cells)
  const along = new Int32Array(bulk.cells)

  for (let x = 0; x < bulk.cells; x++) {
    const v = vector(x)

    column[x] = modulo(v[0] ?? 0, side) + side * modulo(v[1] ?? 0, side) + side * side * modulo(v[2] ?? 0, side)
    depth[x] = modulo(v[3] ?? 0, 2 * side)
  }

  // the translation by 2 e4 in the box basis: 2 e4 = b4 - b3
  for (let x = 0; x < bulk.cells; x++) {
    const c = d4BoxCoordinates({ cell: x, side })

    along[x] = modulo((c[0] ?? 0), side) + side * modulo(c[1] ?? 0, side) + side * side * modulo((c[2] ?? 0) - 1, side) + side ** 3 * modulo((c[3] ?? 0) + 1, side)
  }

  const shadow = Int32Array.from(bulk.firsts, d => {
    const r = bulk.vectors[d] ?? []
    const s = [r[0] ?? 0, r[1] ?? 0, r[2] ?? 0]
    const h = HUSK_VECTORS.findIndex(u => u.every((x, i) => x === s[i]))

    if (h < 0) {
      throw new Error(`root ${r.join(',')} casts no husk direction with orientation +1`)
    }

    return h
  })

  const sheet = new Uint8Array(bulk.links)

  for (let x = 0; x < bulk.cells; x++) {
    for (let k = 0; k < f; k++) {
      const y = bulk.neighbour[x * bulk.degree + (bulk.firsts[k] ?? 0)] ?? 0

      sheet[x * f + k] = (depth[x] ?? 0) <= 1 && (depth[y] ?? 0) <= 1 ? 1 : 0
    }
  }

  const huskCells = side ** 3
  const at = (a: number, b: number, c: number): number => modulo(a, side) + side * modulo(b, side) + side * side * modulo(c, side)
  const mesh: Mesh = {
    id: `husk-${side}`,
    degree: 2 * HUSK_VECTORS.length,
    cellCount: huskCells,
    neighbour(cell, direction) {
      const u = HUSK_VECTORS[Math.floor(direction / 2)] ?? [0, 0, 0]
      const s = direction % 2 === 0 ? 1 : -1
      const a = cell % side
      const b = Math.floor(cell / side) % side
      const c = Math.floor(cell / (side * side))

      return at(a + s * (u[0] ?? 0), b + s * (u[1] ?? 0), c + s * (u[2] ?? 0))
    },
    opposite(direction) {
      return direction % 2 === 0 ? direction + 1 : direction - 1
    },
  }
  const lattice = buildPhotonLattice({
    id: `husk-${side}`,
    side,
    dimension: 3,
    mesh,
    vectors: Array.from({ length: mesh.degree }, (_, d) => (HUSK_VECTORS[Math.floor(d / 2)] ?? [0, 0, 0]).map(x => (d % 2 === 0 ? x : -x))),
    coordinates: cell => [cell % side, Math.floor(cell / side) % side, Math.floor(cell / (side * side))],
    wave: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    plaquettes: () => ({ size: 3, links: [], signs: [] }),
  })

  return { bulk, side, lattice, column, depth, shadow, along, sheet }
}

// the projection of a bulk link field onto the husk: each husk link the sum of the bulk links between its
// two columns
export function projectLinks(husk: Husk, field: ArrayLike<number>): Float64Array {
  const f = husk.bulk.firsts.length
  const h = HUSK_VECTORS.length
  const out = new Float64Array(husk.side ** 3 * h)

  for (let l = 0; l < husk.bulk.links; l++) {
    const x = Math.floor(l / f)
    const target = (husk.column[x] ?? 0) * h + (husk.shadow[l % f] ?? 0)

    out[target] = (out[target] ?? 0) + (field[l] ?? 0)
  }

  return out
}

// The warp (E-FRC-0177). In the hyperbolic bulk the columns shrink with depth: a shell of the {3,4,3,4} ball
// holds lambda = 18.2787 times the one inside it (E-GMT-0003, E-GMT-0031), so the boundary shell holds
// (lambda - 1) / lambda of the ball and a shell j steps in holds lambda^-j of it (E-HLG-0032). The flat
// box has no bottom, so depth is read both ways from the sheet (x4 in {0, 1}): the layer of a bulk dock is
// j = min(m, L - m), m its fibre steps from its column's sheet dock. A bulk link weighs lambda^(-s j) at
// the shallower of its two docks: s = 0 is the flat column sum, s = 1 weighs each layer by its shell's share
// of the ball, and s = 1/3 by its shell's linear size
export function huskLayers(husk: Husk): Int32Array {
  const side = husk.side
  const sheetDepth = new Int32Array(side ** 3)

  for (let x = 0; x < husk.bulk.cells; x++) {
    if ((husk.depth[x] ?? 0) <= 1) {
      sheetDepth[husk.column[x] ?? 0] = husk.depth[x] ?? 0
    }
  }

  return Int32Array.from({ length: husk.bulk.cells }, (_, x) => {
    const m = modulo(((husk.depth[x] ?? 0) - (sheetDepth[husk.column[x] ?? 0] ?? 0)) / 2, side)

    return Math.min(m, side - m)
  })
}

export function warpWeights(husk: Husk, lambda: number, s: number): Float64Array {
  const layers = huskLayers(husk)
  const f = husk.bulk.firsts.length

  return Float64Array.from({ length: husk.bulk.links }, (_, l) => {
    const x = Math.floor(l / f)
    const y = husk.bulk.neighbour[x * husk.bulk.degree + (husk.bulk.firsts[l % f] ?? 0)] ?? 0

    return lambda ** (-s * Math.min(layers[x] ?? 0, layers[y] ?? 0))
  })
}

// the column sum with each bulk link weighed
export function projectLinksWeighted(husk: Husk, field: ArrayLike<number>, weight: ArrayLike<number>): Float64Array {
  const f = husk.bulk.firsts.length
  const h = HUSK_VECTORS.length
  const out = new Float64Array(husk.side ** 3 * h)

  for (let l = 0; l < husk.bulk.links; l++) {
    const x = Math.floor(l / f)
    const target = (husk.column[x] ?? 0) * h + (husk.shadow[l % f] ?? 0)

    out[target] = (out[target] ?? 0) + (weight[l] ?? 0) * (field[l] ?? 0)
  }

  return out
}

// the projection of the angles, mod N
export function projectAngles(husk: Husk, angle: ArrayLike<number>, n: number): Int32Array {
  return Int32Array.from(projectLinks(husk, angle), v => modulo(v, n))
}

// the restriction to the sheet x4 in {0, 1}: each husk link the one bulk link of the sheet that casts it
export function restrictLinks(husk: Husk, field: ArrayLike<number>): Float64Array {
  const f = husk.bulk.firsts.length
  const h = HUSK_VECTORS.length
  const out = new Float64Array(husk.side ** 3 * h)

  for (let l = 0; l < husk.bulk.links; l++) {
    if (husk.sheet[l] === 1) {
      const x = Math.floor(l / f)

      out[(husk.column[x] ?? 0) * h + (husk.shadow[l % f] ?? 0)] = field[l] ?? 0
    }
  }

  return out
}

// the sum of a dock field over each column
export function columnSum(husk: Husk, field: ArrayLike<number>): Float64Array {
  const out = new Float64Array(husk.side ** 3)

  for (let x = 0; x < husk.bulk.cells; x++) {
    out[husk.column[x] ?? 0] = (out[husk.column[x] ?? 0] ?? 0) + (field[x] ?? 0)
  }

  return out
}

// the divergence of a husk link field at every husk dock
export function huskDivergence(husk: Husk, flux: ArrayLike<number>): Float64Array {
  const { lattice } = husk
  const h = HUSK_VECTORS.length
  const out = new Float64Array(lattice.cells)

  for (let y = 0; y < lattice.cells; y++) {
    for (let k = 0; k < h; k++) {
      const z = lattice.neighbour[y * lattice.degree + 2 * k] ?? 0
      const e = flux[y * h + k] ?? 0

      out[y] = (out[y] ?? 0) + e
      out[z] = (out[z] ?? 0) - e
    }
  }

  return out
}

// husk docks where the divergence is not the charge
export function huskGaussViolations(husk: Husk, flux: ArrayLike<number>, charge: ArrayLike<number>): number {
  const div = huskDivergence(husk, flux)

  let violations = 0

  for (let y = 0; y < div.length; y++) {
    violations += Math.abs((div[y] ?? 0) - (charge[y] ?? 0)) > 1e-9 ? 1 : 0
  }

  return violations
}

// the husk frame change a bulk frame change induces: angle + w_h (X_z - X_y) on each husk link y -> z, mod N
export function changeHuskFrame(husk: Husk, angle: ArrayLike<number>, frame: ArrayLike<number>, n: number): Int32Array {
  const { lattice } = husk
  const h = HUSK_VECTORS.length
  const out = new Int32Array(lattice.cells * h)

  for (let y = 0; y < lattice.cells; y++) {
    for (let k = 0; k < h; k++) {
      const z = lattice.neighbour[y * lattice.degree + 2 * k] ?? 0

      out[y * h + k] = modulo((angle[y * h + k] ?? 0) + (HUSK_WEIGHTS[k] ?? 0) * ((frame[z] ?? 0) - (frame[y] ?? 0)), n)
    }
  }

  return out
}

// the husk's own Coulomb flux for column charges q: w_h (phi_y - phi_z) on each husk link y -> z, with the
// weighted Laplacian (weights HUSK_WEIGHTS) of phi equal to q; and its energy 1/2 sum E^2 / w
export function huskCoulomb(husk: Husk, charge: ArrayLike<number>): { flux: Float64Array; energy: number } {
  const { lattice } = husk
  const h = HUSK_VECTORS.length
  const cells = lattice.cells
  const apply = (v: Float64Array, out: Float64Array): void => {
    out.fill(0)

    for (let y = 0; y < cells; y++) {
      for (let k = 0; k < h; k++) {
        const z = lattice.neighbour[y * lattice.degree + 2 * k] ?? 0
        const e = (HUSK_WEIGHTS[k] ?? 0) * ((v[y] ?? 0) - (v[z] ?? 0))

        out[y] = (out[y] ?? 0) + e
        out[z] = (out[z] ?? 0) - e
      }
    }
  }
  const b = Float64Array.from({ length: cells }, (_, y) => charge[y] ?? 0)
  const mean = b.reduce((s, v) => s + v, 0) / cells
  const phi = new Float64Array(cells)
  const r = Float64Array.from(b, v => v - mean)
  const p = Float64Array.from(r)
  const ap = new Float64Array(cells)
  const dot = (u: Float64Array, v: Float64Array): number => u.reduce((s, x, i) => s + x * (v[i] ?? 0), 0)

  let rr = dot(r, r)

  for (let it = 0; it < 10 * cells && rr > 1e-26 * Math.max(1, dot(b, b)); it++) {
    apply(p, ap)

    const alpha = rr / dot(p, ap)

    for (let i = 0; i < cells; i++) {
      phi[i] = (phi[i] ?? 0) + alpha * (p[i] ?? 0)
      r[i] = (r[i] ?? 0) - alpha * (ap[i] ?? 0)
    }

    const next = dot(r, r)

    for (let i = 0; i < cells; i++) {
      p[i] = (r[i] ?? 0) + (next / rr) * (p[i] ?? 0)
    }

    rr = next
  }

  const flux = new Float64Array(cells * h)

  let energy = 0

  for (let y = 0; y < cells; y++) {
    for (let k = 0; k < h; k++) {
      const z = lattice.neighbour[y * lattice.degree + 2 * k] ?? 0
      const e = (HUSK_WEIGHTS[k] ?? 0) * ((phi[y] ?? 0) - (phi[z] ?? 0))

      flux[y * h + k] = e
      energy += (e * e) / (2 * (HUSK_WEIGHTS[k] ?? 1))
    }
  }

  return { flux, energy }
}

// the energy of a husk flux in the husk's own metric, 1/2 sum E^2 / w
export function huskEnergy(flux: ArrayLike<number>): number {
  const h = HUSK_VECTORS.length

  let energy = 0

  for (let i = 0; i < flux.length; i++) {
    energy += (flux[i] ?? 0) ** 2 / (2 * (HUSK_WEIGHTS[i % h] ?? 1))
  }

  return energy
}

// the bulk mode n of the D4 box with the husk wave vector (2 pi / side)(m, 0): n_j = b_j . (m, 0)
export function bulkModeOfHusk(m: readonly number[]): number[] {
  const [a = 0, b = 0, c = 0] = m

  return [a - b, b - c, c, c]
}

export type Survival = {
  // eigenvalues of the Gram matrix of the projected bulk photon subspace, descending: how much of each
  // photon polarization reaches the husk
  photonGram: number[]
  // the part of the killed photon polarization that is odd under the depth reflection x4 -> -x4
  killedOdd: number
  // its overlap with the depth-polarized plane wave, e_a . e4 on each bulk link
  killedDepthOverlap: number
  // how many of the 8 massive bulk branches reach the husk (Gram eigenvalues above 1e-9 of the largest)
  massiveRank: number
}

// which bulk polarizations the projection keeps, at the husk wave vector m: the bulk curl-curl eigenvectors
// at (m, 0), mapped by the projection matrix (each bulk link direction to its husk direction, weight 1)
export function polarizationSurvival(husk: Husk, m: readonly number[]): Survival {
  const bulk = husk.bulk
  const f = bulk.firsts.length
  const h = HUSK_VECTORS.length
  const eig = hermitianEigen(plaquetteWaveMatrix(bulk, bulkModeOfHusk(m)))
  const order = Array.from(eig.values, (v, i) => [v, i] as const).sort((a, b) => a[0] - b[0])
  const column = (i: number): [Float64Array, Float64Array] => [
    Float64Array.from({ length: f }, (_, a) => eig.vectorsRe[a * f + i] ?? 0),
    Float64Array.from({ length: f }, (_, a) => eig.vectorsIm[a * f + i] ?? 0),
  ]
  const project = ([re, im]: [Float64Array, Float64Array]): [Float64Array, Float64Array] => {
    const pr = new Float64Array(h)
    const pi = new Float64Array(h)

    for (let a = 0; a < f; a++) {
      pr[husk.shadow[a] ?? 0] = (pr[husk.shadow[a] ?? 0] ?? 0) + (re[a] ?? 0)
      pi[husk.shadow[a] ?? 0] = (pi[husk.shadow[a] ?? 0] ?? 0) + (im[a] ?? 0)
    }

    return [pr, pi]
  }
  const gram = (vectors: [Float64Array, Float64Array][]): { values: number[]; vectorsRe: Float64Array; vectorsIm: Float64Array } => {
    const projected = vectors.map(project)
    const g = makeComplexMatrix({ rows: vectors.length, cols: vectors.length })

    projected.forEach(([ar, ai], i) =>
      projected.forEach(([br, bi], j) => {
        let re = 0
        let im = 0

        for (let k = 0; k < h; k++) {
          // conj(a) . b
          re += (ar[k] ?? 0) * (br[k] ?? 0) + (ai[k] ?? 0) * (bi[k] ?? 0)
          im += (ar[k] ?? 0) * (bi[k] ?? 0) - (ai[k] ?? 0) * (br[k] ?? 0)
        }

        g.re[i * vectors.length + j] = re
        g.im[i * vectors.length + j] = im
      }),
    )

    const e = hermitianEigen(g)

    return { values: Array.from(e.values), vectorsRe: e.vectorsRe, vectorsIm: e.vectorsIm }
  }

  const photons = order.slice(1, 4).map(([, i]) => column(i))
  const g = gram(photons)
  const smallest = g.values.indexOf(Math.min(...g.values))
  // the killed polarization: sum_j c_j photon_j, c the Gram eigenvector of the smallest value
  const killedRe = new Float64Array(f)
  const killedIm = new Float64Array(f)

  photons.forEach(([re, im], j) => {
    const cr = g.vectorsRe[j * photons.length + smallest] ?? 0
    const ci = g.vectorsIm[j * photons.length + smallest] ?? 0

    for (let a = 0; a < f; a++) {
      killedRe[a] = (killedRe[a] ?? 0) + cr * (re[a] ?? 0) - ci * (im[a] ?? 0)
      killedIm[a] = (killedIm[a] ?? 0) + cr * (im[a] ?? 0) + ci * (re[a] ?? 0)
    }
  })

  // the depth reflection x4 -> -x4 sends the root (i, 4, s) to (i, 4, -s) and fixes the others
  const mirror = bulk.firsts.map(d => {
    const r = bulk.vectors[d] ?? []
    const image = [r[0] ?? 0, r[1] ?? 0, r[2] ?? 0, -(r[3] ?? 0)]

    return bulk.firsts.findIndex(e => (bulk.vectors[e] ?? []).every((x, i) => x === image[i]))
  })

  let norm = 0
  let odd = 0

  for (let a = 0; a < f; a++) {
    const b = mirror[a] ?? a

    norm += (killedRe[a] ?? 0) ** 2 + (killedIm[a] ?? 0) ** 2
    odd += (((killedRe[a] ?? 0) - (killedRe[b] ?? 0)) / 2) ** 2 + (((killedIm[a] ?? 0) - (killedIm[b] ?? 0)) / 2) ** 2
  }

  const depth = bulk.firsts.map(d => bulk.vectors[d]?.[3] ?? 0)
  const depthNorm = Math.sqrt(depth.reduce((s, x) => s + x * x, 0))

  let or = 0
  let oi = 0

  for (let a = 0; a < f; a++) {
    or += ((depth[a] ?? 0) / depthNorm) * (killedRe[a] ?? 0)
    oi += ((depth[a] ?? 0) / depthNorm) * (killedIm[a] ?? 0)
  }

  const massive = gram(order.slice(4).map(([, i]) => column(i)))
  const top = Math.max(...massive.values)

  return {
    photonGram: [...g.values].sort((a, b) => b - a),
    killedOdd: odd / norm,
    killedDepthOverlap: Math.sqrt((or * or + oi * oi) / norm),
    massiveRank: massive.values.filter(v => v > 1e-9 * top).length,
  }
}
