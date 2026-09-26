// The exact linear theory of the leapfrog U(1) sector of code/rule/photon-links, the reference every light
// measurement is calibrated against (E-FRC-0179, E-FRC-0180).
//
// The beat is two shears, A <- A + E mod N, then E <- E - C^T f(C A), C the plaquette incidence (the curl)
// and f the force table. Where f is linear, f(B) = kappa B, a plane wave of wave vector k is carried to a
// plane wave of the same k, and the beat on one mode is the 2F x 2F symbol
//
//   U(k) = [[ I, I ], [ -kappa M(k), I - kappa M(k) ]]
//
// M(k) = C(k)^dagger C(k) the curl-curl matrix, F the link directions. On an eigenvector of M with eigenvalue
// lambda the block is [[1, 1], [-kappa lambda, 1 - kappa lambda]]: determinant exactly 1 (the beat is
// symplectic), trace 2 - kappa lambda, so its eigenvalues are e^(+-i omega) with 4 sin^2(omega / 2) =
// kappa lambda, on the unit circle while kappa lambda <= 4.
//
// This module reads M off the rule itself (a unit probe through photonBeatInPlace with an exactly linear
// force table), builds M(k) at any real k from the plaquette shapes, maps the bulk symbol onto the husk (the
// depth reflection splits the bulk modes at k4 = 0 into an even part the column sum keeps and an odd part it
// kills), runs the exactly linear leapfrog in floating point, and sums the husk's lattice Green's function.

import { makeComplexMatrix, type ComplexMatrix } from '@/code/algebra/linear/dense'
import { emptyPhotonState, makePhotonRule, photonBeatInPlace, type PhotonLattice, type PhotonRule } from '@/code/rule/photon-links'
import { hermitianEigen, waveVector } from '@/code/measure/photon-modes'
import { HUSK_VECTORS, HUSK_WEIGHTS, type Husk } from '@/code/measure/photon-husk'

const modulo = (x: number, m: number): number => ((x % m) + m) % m

// the centered representative of b mod n, in -n/2 < c < n/2, with n/2 itself sent to 0 so the table is odd
export function centered(b: number, n: number): number {
  const c = modulo(b, n)

  if (2 * c === n) {
    return 0
  }

  return 2 * c > n ? c - n : c
}

// f(B) = k times the centered representative of B: the exactly linear (non-compact, Villain at low energy)
// force, an integer table only for integer k
export function linearForceTable(n: number, k: number): Int32Array {
  return Int32Array.from({ length: n }, (_, b) => k * centered(b, n))
}

// f(B) = round(kappa times the centered representative), rounded symmetrically so f is odd
export function roundedLinearForceTable(n: number, kappa: number): Int32Array {
  return Int32Array.from({ length: n }, (_, b) => {
    const x = kappa * centered(b, n)

    return Math.sign(x) * Math.round(Math.abs(x))
  })
}

// a copy of a rule with another force table
export function withForce(rule: PhotonRule, force: Int32Array): PhotonRule {
  return { ...rule, force }
}

// the plaquettes of dock 0, each as its entries: link direction, orientation, and the link's midpoint as a
// physical vector, found by walking the loop from the origin (so a plaquette that wraps the box is unwrapped)
export type PlaquetteShape = { readonly direction: number; readonly sign: number; readonly mid: readonly number[] }[]

export function plaquetteShapes(lattice: PhotonLattice): PlaquetteShape[] {
  const f = lattice.firsts.length
  const size = lattice.plaquetteSize
  const perDock = lattice.plaquetteCount / lattice.cells
  const shapes: PlaquetteShape[] = []

  for (let p = 0; p < perDock; p++) {
    let at = Array<number>(lattice.dimension).fill(0)

    const shape: { direction: number; sign: number; mid: number[] }[] = []

    for (let j = 0; j < size; j++) {
      const l = lattice.plaquetteLinks[p * size + j] ?? 0
      const s = lattice.plaquetteSigns[p * size + j] ?? 0
      const a = l % f
      const r = lattice.vectors[lattice.firsts[a] ?? 0] ?? []
      const step = r.map(x => s * x)

      shape.push({ direction: a, sign: s, mid: at.map((x, i) => x + (step[i] ?? 0) / 2) })
      at = at.map((x, i) => x + (step[i] ?? 0))
    }

    if (at.some(x => Math.abs(x) > 1e-12)) {
      throw new Error(`plaquette ${p} does not close`)
    }

    shapes.push(shape)
  }

  return shapes
}

// M(k) = sum over the plaquettes of dock 0 of c^dagger c, c_a = sum of orientation e^(i k . mid) over the
// plaquette's links on direction a, at any real wave vector k (physical units)
export function curlSymbol(lattice: PhotonLattice, shapes: readonly PlaquetteShape[], k: readonly number[]): ComplexMatrix {
  const f = lattice.firsts.length
  const m = makeComplexMatrix({ rows: f, cols: f })
  const re = new Float64Array(f)
  const im = new Float64Array(f)

  for (const shape of shapes) {
    re.fill(0)
    im.fill(0)

    for (const { direction, sign, mid } of shape) {
      const phi = mid.reduce((s, x, i) => s + x * (k[i] ?? 0), 0)

      re[direction] = (re[direction] ?? 0) + sign * Math.cos(phi)
      im[direction] = (im[direction] ?? 0) + sign * Math.sin(phi)
    }

    for (let b = 0; b < f; b++) {
      for (let a = 0; a < f; a++) {
        m.re[b * f + a] = (m.re[b * f + a] ?? 0) + (re[b] ?? 0) * (re[a] ?? 0) + (im[b] ?? 0) * (im[a] ?? 0)
        m.im[b * f + a] = (m.im[b * f + a] ?? 0) + (re[b] ?? 0) * (im[a] ?? 0) - (im[b] ?? 0) * (re[a] ?? 0)
      }
    }
  }

  return m
}

// the pure-gauge vector at k: the flux of the gradient of e^(i k . x), read at link midpoints, 2 i sin(k . r_a / 2)
export function gradientVector(lattice: PhotonLattice, k: readonly number[]): { re: Float64Array; im: Float64Array } {
  const im = Float64Array.from(lattice.firsts, d => 2 * Math.sin((lattice.vectors[d] ?? []).reduce((s, x, i) => s + x * (k[i] ?? 0), 0) / 2))

  return { re: new Float64Array(lattice.firsts.length), im }
}

// |M v| for a complex vector v
export function applyNorm(m: ComplexMatrix, v: { re: ArrayLike<number>; im: ArrayLike<number> }): number {
  const n = m.rows

  let sum = 0

  for (let i = 0; i < n; i++) {
    let re = 0
    let im = 0

    for (let j = 0; j < n; j++) {
      const a = m.re[i * n + j] ?? 0
      const b = m.im[i * n + j] ?? 0

      re += a * (v.re[j] ?? 0) - b * (v.im[j] ?? 0)
      im += a * (v.im[j] ?? 0) + b * (v.re[j] ?? 0)
    }

    sum += re * re + im * im
  }

  return Math.sqrt(sum)
}

// the largest entry of |a - b|
export function matrixGap(a: ComplexMatrix, b: ComplexMatrix): number {
  let gap = 0

  for (let i = 0; i < a.re.length; i++) {
    gap = Math.max(gap, Math.hypot((a.re[i] ?? 0) - (b.re[i] ?? 0), (a.im[i] ?? 0) - (b.im[i] ?? 0)))
  }

  return gap
}

export function eigenvalues(m: ComplexMatrix): number[] {
  return Array.from(hermitianEigen(m).values).sort((a, b) => a - b)
}

export type Stencil = {
  // for each link direction a of dock 0, the links and values of the column M e_(0, a)
  readonly columns: readonly (readonly [number, number])[][]
  // entries where the two unit probes disagree with U = [[I, I], [-M, I - M]]
  readonly mismatches: number
  // entries compared
  readonly compared: number
}

// Read the curl-curl stencil off the rule. With the exactly linear table f(B) = centered(B) (kappa 1), a
// beat from (A, E) = (e, 0) gives (e, -M e), and from (0, e) gives (e, e - M e), for e a unit on one link:
// both probes run through photonBeatInPlace itself, in integers
export function readStencil(lattice: PhotonLattice, n: number): Stencil {
  const base = makePhotonRule({ lattice, n, k: 0, capacity: 0, hop: false })
  const rule = withForce(base, linearForceTable(n, 1))
  const f = lattice.firsts.length
  const columns: (readonly [number, number])[][] = []

  let mismatches = 0
  let compared = 0

  for (let a = 0; a < f; a++) {
    const fromAngle = emptyPhotonState(rule)
    const fromFlux = emptyPhotonState(rule)

    fromAngle.angle[a] = 1
    fromFlux.flux[a] = 1
    photonBeatInPlace(rule, fromAngle, 0)
    photonBeatInPlace(rule, fromFlux, 0)

    const column: (readonly [number, number])[] = []

    for (let l = 0; l < lattice.links; l++) {
      const unit = l === a ? 1 : 0
      const m = -(fromAngle.flux[l] ?? 0)

      if (m !== 0) {
        column.push([l, m])
      }

      mismatches += centered(fromAngle.angle[l] ?? 0, n) === unit ? 0 : 1
      mismatches += centered(fromFlux.angle[l] ?? 0, n) === unit ? 0 : 1
      mismatches += (fromFlux.flux[l] ?? 0) === unit - m ? 0 : 1
      compared += 3
    }

    columns.push(column)
  }

  return { columns, mismatches, compared }
}

// the Fourier transform of a stencil at the integer mode n: M_ba = sum over the column of (0, b) of the
// entries on direction a, each times e^(i k . (mid - mid of (0, b)))
export function stencilSymbol(lattice: PhotonLattice, stencil: Stencil, n: readonly number[]): ComplexMatrix {
  const f = lattice.firsts.length
  const k = waveVector(lattice, n)
  const half = lattice.firsts.map(d => (lattice.vectors[d] ?? []).reduce((s, e, i) => s + e * (k[i] ?? 0), 0) / 2)
  const m = makeComplexMatrix({ rows: f, cols: f })

  for (let b = 0; b < f; b++) {
    for (const [l, value] of stencil.columns[b] ?? []) {
      const x = Math.floor(l / f)
      const a = l % f

      let s = 0

      for (let i = 0; i < lattice.dimension; i++) {
        s += (n[i] ?? 0) * (lattice.coordinates[x * lattice.dimension + i] ?? 0)
      }

      const phi = (2 * Math.PI * s) / lattice.side + (half[a] ?? 0) - (half[b] ?? 0)

      m.re[b * f + a] = (m.re[b * f + a] ?? 0) + value * Math.cos(phi)
      m.im[b * f + a] = (m.im[b * f + a] ?? 0) + value * Math.sin(phi)
    }
  }

  return m
}

// the depth reflection x4 -> -x4 on the bulk's first link directions
export function depthMirror(husk: Husk): number[] {
  const bulk = husk.bulk

  return bulk.firsts.map(d => {
    const r = bulk.vectors[d] ?? []
    const image = [r[0] ?? 0, r[1] ?? 0, r[2] ?? 0, -(r[3] ?? 0)]
    const e = bulk.firsts.findIndex(g => (bulk.vectors[g] ?? []).every((x, i) => x === image[i]))

    if (e < 0) {
      throw new Error('the depth reflection leaves the first directions')
    }

    return e
  })
}

export type HuskSymbol = {
  // G^(-1/2) P M P^T G^(-1/2), Hermitian, G = diag(husk weights): the husk's curl-curl in its own metric
  readonly hermitian: ComplexMatrix
  // M_h = P M P^T G^(-1), the husk's curl-curl acting on husk fields
  readonly husk: ComplexMatrix
  // O^dagger M O on the depth-odd bulk vectors (e_a - e_sigma(a)) / sqrt 2, which the column sum kills
  readonly odd: ComplexMatrix
  // the largest entry of |P M - M_h P|: zero when the husk dynamics is closed
  readonly intertwining: number
  // the depth-odd pairs (a, sigma(a)), a < sigma(a)
  readonly pairs: readonly (readonly [number, number])[]
}

// the husk's own symbol at the bulk mode M, taken at a wave vector with k4 = 0
export function huskSymbol(husk: Husk, m: ComplexMatrix): HuskSymbol {
  const f = husk.bulk.firsts.length
  const h = HUSK_VECTORS.length
  const shadow = husk.shadow
  const weight = (i: number): number => HUSK_WEIGHTS[i] ?? 1
  const pm = makeComplexMatrix({ rows: h, cols: f })

  // P M: row i the sum of the rows of M whose direction casts i
  for (let a = 0; a < f; a++) {
    const i = shadow[a] ?? 0

    for (let b = 0; b < f; b++) {
      pm.re[i * f + b] = (pm.re[i * f + b] ?? 0) + (m.re[a * f + b] ?? 0)
      pm.im[i * f + b] = (pm.im[i * f + b] ?? 0) + (m.im[a * f + b] ?? 0)
    }
  }

  // P M P^T
  const pmp = makeComplexMatrix({ rows: h, cols: h })

  for (let i = 0; i < h; i++) {
    for (let b = 0; b < f; b++) {
      const j = shadow[b] ?? 0

      pmp.re[i * h + j] = (pmp.re[i * h + j] ?? 0) + (pm.re[i * f + b] ?? 0)
      pmp.im[i * h + j] = (pmp.im[i * h + j] ?? 0) + (pm.im[i * f + b] ?? 0)
    }
  }

  const hermitian = makeComplexMatrix({ rows: h, cols: h })
  const onHusk = makeComplexMatrix({ rows: h, cols: h })

  for (let i = 0; i < h; i++) {
    for (let j = 0; j < h; j++) {
      const s = 1 / Math.sqrt(weight(i) * weight(j))

      hermitian.re[i * h + j] = (pmp.re[i * h + j] ?? 0) * s
      hermitian.im[i * h + j] = (pmp.im[i * h + j] ?? 0) * s
      onHusk.re[i * h + j] = (pmp.re[i * h + j] ?? 0) / weight(j)
      onHusk.im[i * h + j] = (pmp.im[i * h + j] ?? 0) / weight(j)
    }
  }

  // P M - M_h P, entry (i, b): (P M)_ib - (M_h)_(i, shadow b)
  let intertwining = 0

  for (let i = 0; i < h; i++) {
    for (let b = 0; b < f; b++) {
      const j = shadow[b] ?? 0

      intertwining = Math.max(intertwining, Math.hypot((pm.re[i * f + b] ?? 0) - (onHusk.re[i * h + j] ?? 0), (pm.im[i * f + b] ?? 0) - (onHusk.im[i * h + j] ?? 0)))
    }
  }

  const mirror = depthMirror(husk)
  const pairs = mirror.flatMap((e, a) => (a < e ? [[a, e] as const] : []))
  const odd = makeComplexMatrix({ rows: pairs.length, cols: pairs.length })

  pairs.forEach(([a, a2], i) =>
    pairs.forEach(([b, b2], j) => {
      odd.re[i * pairs.length + j] = ((m.re[a * f + b] ?? 0) - (m.re[a * f + b2] ?? 0) - (m.re[a2 * f + b] ?? 0) + (m.re[a2 * f + b2] ?? 0)) / 2
      odd.im[i * pairs.length + j] = ((m.im[a * f + b] ?? 0) - (m.im[a * f + b2] ?? 0) - (m.im[a2 * f + b] ?? 0) + (m.im[a2 * f + b2] ?? 0)) / 2
    }),
  )

  return { hermitian, husk: onHusk, odd, intertwining, pairs }
}

// a bulk vector from a husk eigenvector u of the Hermitian husk symbol: v = P^T G^(-1/2) u, depth-even, unit
export function liftEven(husk: Husk, re: ArrayLike<number>, im: ArrayLike<number>): { re: Float64Array; im: Float64Array } {
  const f = husk.bulk.firsts.length

  return {
    re: Float64Array.from({ length: f }, (_, a) => (re[husk.shadow[a] ?? 0] ?? 0) / Math.sqrt(HUSK_WEIGHTS[husk.shadow[a] ?? 0] ?? 1)),
    im: Float64Array.from({ length: f }, (_, a) => (im[husk.shadow[a] ?? 0] ?? 0) / Math.sqrt(HUSK_WEIGHTS[husk.shadow[a] ?? 0] ?? 1)),
  }
}

// a bulk vector from an eigenvector of the odd block: sum of u_i (e_a - e_sigma(a)) / sqrt 2, depth-odd, unit
export function liftOdd(husk: Husk, pairs: readonly (readonly [number, number])[], re: ArrayLike<number>, im: ArrayLike<number>): { re: Float64Array; im: Float64Array } {
  const f = husk.bulk.firsts.length
  const outRe = new Float64Array(f)
  const outIm = new Float64Array(f)

  pairs.forEach(([a, b], i) => {
    outRe[a] = (re[i] ?? 0) / Math.SQRT2
    outIm[a] = (im[i] ?? 0) / Math.SQRT2
    outRe[b] = -(re[i] ?? 0) / Math.SQRT2
    outIm[b] = -(im[i] ?? 0) / Math.SQRT2
  })

  return { re: outRe, im: outIm }
}

// the eigenvector of a Hermitian matrix at sorted position `rank` (0 the smallest)
export function eigenvector(m: ComplexMatrix, rank: number): { value: number; re: Float64Array; im: Float64Array } {
  const e = hermitianEigen(m)
  const n = m.rows
  const order = Array.from(e.values, (v, i) => [v, i] as const).sort((a, b) => a[0] - b[0])
  const [value, i] = order[rank] ?? [0, 0]

  return {
    value,
    re: Float64Array.from({ length: n }, (_, a) => e.vectorsRe[a * n + i] ?? 0),
    im: Float64Array.from({ length: n }, (_, a) => e.vectorsIm[a * n + i] ?? 0),
  }
}

// the leapfrog block of one eigenvalue: its trace and determinant, and omega from 4 sin^2(omega / 2) = kappa
// lambda (NaN past stability), and the growth per beat past it
export function leapfrogBlock(kappa: number, lambda: number): { trace: number; determinant: number; omega: number; growth: number } {
  const x = kappa * lambda
  const trace = 2 - x
  const determinant = 1 * (1 - x) - 1 * -x
  const omega = x <= 4 && x >= 0 ? 2 * Math.asin(Math.sqrt(x) / 2) : Number.NaN
  const growth = Math.abs(trace) > 2 ? (Math.abs(trace) + Math.sqrt(trace * trace - 4)) / 2 : 1

  return { trace, determinant, omega, growth }
}

export type LinearLeapfrog = { readonly kappa: number; beat(angle: Float64Array, flux: Float64Array): void }

// the exactly linear leapfrog in floating point: A <- A + E, then E <- E - kappa C^T C A, no modulus
export function makeLinearLeapfrog(lattice: PhotonLattice, kappa: number): LinearLeapfrog {
  const size = lattice.plaquetteSize
  const count = lattice.plaquetteCount
  const links = lattice.plaquetteLinks
  const signs = lattice.plaquetteSigns

  return {
    kappa,
    beat(angle, flux) {
      for (let l = 0; l < angle.length; l++) {
        angle[l] = (angle[l] ?? 0) + (flux[l] ?? 0)
      }

      for (let p = 0; p < count; p++) {
        let b = 0

        for (let j = 0; j < size; j++) {
          b += (signs[p * size + j] ?? 0) * (angle[links[p * size + j] ?? 0] ?? 0)
        }

        const force = kappa * b

        for (let j = 0; j < size; j++) {
          const l = links[p * size + j] ?? 0

          flux[l] = (flux[l] ?? 0) - (signs[p * size + j] ?? 0) * force
        }
      }
    },
  }
}

// the husk Laplacian's symbol: sum over the 9 directions of w_h (2 - 2 cos k . u_h)
export function huskLaplacianSymbol(k: readonly number[]): number {
  return HUSK_VECTORS.reduce((s, u, h) => s + (HUSK_WEIGHTS[h] ?? 0) * (2 - 2 * Math.cos(u.reduce((t, x, i) => t + x * (k[i] ?? 0), 0))), 0)
}

// the husk's lattice Green's function on the side^3 torus with the zero mode removed, L G = delta - 1 / V,
// at each displacement
export function huskGreen(side: number, points: readonly (readonly number[])[]): number[] {
  const out = new Float64Array(points.length)
  const step = (2 * Math.PI) / side

  for (let a = 0; a < side; a++) {
    for (let b = 0; b < side; b++) {
      for (let c = 0; c < side; c++) {
        if (a === 0 && b === 0 && c === 0) {
          continue
        }

        const k = [a * step, b * step, c * step]
        const inverse = 1 / huskLaplacianSymbol(k)

        points.forEach((r, i) => {
          out[i] = (out[i] ?? 0) + Math.cos(k[0]! * (r[0] ?? 0) + k[1]! * (r[1] ?? 0) + k[2]! * (r[2] ?? 0)) * inverse
        })
      }
    }
  }

  return Array.from(out, v => v / side ** 3)
}
