// The linearized Einstein operator on a periodic 4D lattice, the discrete graviton. Acting on a
// symmetric rank-2 perturbation h_{mu nu}(x) it returns
//   G[h]_{mu nu} = -1/2 ( box h_{mu nu} - d_mu d^a h_{a nu} - d_nu d^a h_{a mu} + d_mu d_nu h
//                         - eta_{mu nu} box h + eta_{mu nu} d^a d^b h_{ab} )
// with all derivatives central differences on the periodic lattice and indices raised with the
// Minkowski metric eta. It is gauge-invariant (it annihilates pure-gauge h = d xi + (d xi)^T), has no
// mass term (it is built entirely from derivatives), and on a transverse-traceless plane wave its
// eigenvalue is proportional to k^2. The defining properties of a massless spin-2 field.

import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

export const GRAVITON_DIMENSION = 4
const D = GRAVITON_DIMENSION
const ETA = [-1, 1, 1, 1] // Minkowski signature, diagonal

// A periodic 4D lattice of symmetric rank-2 tensors h_{mu nu}(x). data[site][mu*D+nu].
export interface TensorField {
  L: number
  data: Float64Array[]
}

export function gravitonSiteIndex(coords: number[], L: number): number {
  let idx = 0
  for (let a = D - 1; a >= 0; a--) idx = idx * L + (coords[a] ?? 0)
  return idx
}

export function gravitonCoordsOf(idx: number, L: number): number[] {
  const c: number[] = []
  let r = idx
  for (let a = 0; a < D; a++) {
    c.push(r % L)
    r = Math.floor(r / L)
  }
  return c
}

export function gravitonShift(
  coords: number[],
  axis: number,
  delta: number,
  L: number,
): number[] {
  const c = coords.slice()
  c[axis] = ((c[axis] ?? 0) + delta + L) % L
  return c
}

export function makeTensorField(L: number): TensorField {
  const n = Math.pow(L, D)
  return {
    L,
    data: Array.from({ length: n }, () => new Float64Array(D * D)),
  }
}

export function tensorFieldMaxAbs(f: TensorField): number {
  let m = 0
  for (const row of f.data)
    for (const v of row) m = Math.max(m, Math.abs(v))
  return m
}

// Apply the gauge-invariant linearized Einstein operator. All derivatives are central differences on
// the periodic lattice, indices raised with eta. Equal-axis second differences use the
// central-difference-squared stencil (D0 . D0) so the operator composes exactly with the central first
// differences used to build pure-gauge perturbations, making gauge invariance exact on the lattice.
export function linearizedEinstein(h: TensorField): TensorField {
  const L = h.L
  const n = h.data.length
  const out = makeTensorField(L)
  const at = (site: number, mu: number, nu: number): number =>
    h.data[site]![mu * D + nu] ?? 0
  const d2 = (
    coords: number[],
    alpha: number,
    beta: number,
    mu: number,
    nu: number,
  ): number => {
    if (alpha === beta) {
      const pp = gravitonSiteIndex(
        gravitonShift(coords, alpha, 2, L),
        L,
      )
      const mm = gravitonSiteIndex(
        gravitonShift(coords, alpha, -2, L),
        L,
      )
      const c = gravitonSiteIndex(coords, L)
      return (at(pp, mu, nu) - 2 * at(c, mu, nu) + at(mm, mu, nu)) / 4
    }
    const pp = gravitonSiteIndex(
      gravitonShift(gravitonShift(coords, alpha, 1, L), beta, 1, L),
      L,
    )
    const pm = gravitonSiteIndex(
      gravitonShift(gravitonShift(coords, alpha, 1, L), beta, -1, L),
      L,
    )
    const mp = gravitonSiteIndex(
      gravitonShift(gravitonShift(coords, alpha, -1, L), beta, 1, L),
      L,
    )
    const mm = gravitonSiteIndex(
      gravitonShift(gravitonShift(coords, alpha, -1, L), beta, -1, L),
      L,
    )
    return (
      (at(pp, mu, nu) -
        at(pm, mu, nu) -
        at(mp, mu, nu) +
        at(mm, mu, nu)) /
      4
    )
  }
  for (let site = 0; site < n; site++) {
    const coords = gravitonCoordsOf(site, L)
    const traceAt = (s: number): number => {
      let t = 0
      for (let a = 0; a < D; a++)
        t += (ETA[a] ?? 1) * (h.data[s]![a * D + a] ?? 0)
      return t
    }
    const d2trace = (alpha: number, beta: number): number => {
      if (alpha === beta) {
        const pp = gravitonSiteIndex(
          gravitonShift(coords, alpha, 2, L),
          L,
        )
        const mm = gravitonSiteIndex(
          gravitonShift(coords, alpha, -2, L),
          L,
        )
        const c = gravitonSiteIndex(coords, L)
        return (traceAt(pp) - 2 * traceAt(c) + traceAt(mm)) / 4
      }
      const pp = gravitonSiteIndex(
        gravitonShift(gravitonShift(coords, alpha, 1, L), beta, 1, L),
        L,
      )
      const pm = gravitonSiteIndex(
        gravitonShift(gravitonShift(coords, alpha, 1, L), beta, -1, L),
        L,
      )
      const mp = gravitonSiteIndex(
        gravitonShift(gravitonShift(coords, alpha, -1, L), beta, 1, L),
        L,
      )
      const mm = gravitonSiteIndex(
        gravitonShift(gravitonShift(coords, alpha, -1, L), beta, -1, L),
        L,
      )
      return (traceAt(pp) - traceAt(pm) - traceAt(mp) + traceAt(mm)) / 4
    }
    let boxTrace = 0
    let divdiv = 0
    for (let a = 0; a < D; a++) {
      boxTrace += (ETA[a] ?? 1) * d2trace(a, a)
      for (let b = 0; b < D; b++)
        divdiv += (ETA[a] ?? 1) * (ETA[b] ?? 1) * d2(coords, a, b, a, b)
    }
    for (let mu = 0; mu < D; mu++) {
      for (let nu = mu; nu < D; nu++) {
        let boxH = 0
        for (let a = 0; a < D; a++)
          boxH += (ETA[a] ?? 1) * d2(coords, a, a, mu, nu)
        let divMu = 0
        let divNu = 0
        for (let a = 0; a < D; a++) {
          divMu += (ETA[a] ?? 1) * d2(coords, mu, a, a, nu)
          divNu += (ETA[a] ?? 1) * d2(coords, nu, a, a, mu)
        }
        const ddTrace = d2trace(mu, nu)
        const etaMuNu = mu === nu ? (ETA[mu] ?? 1) : 0
        const g =
          -0.5 *
          (boxH -
            divMu -
            divNu +
            ddTrace -
            etaMuNu * boxTrace +
            etaMuNu * divdiv)
        out.data[site]![mu * D + nu] = g
        out.data[site]![nu * D + mu] = g
      }
    }
  }
  return out
}

// The ten independent components of a symmetric 4x4 tensor, the orthonormal symmetric-tensor basis
// the graviton operator is assembled in.
const GRAVITON_PAIRS: Array<[number, number]> = [
  [0, 0],
  [1, 1],
  [2, 2],
  [3, 3],
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
  [2, 3],
]

// One symmetric-tensor plane-wave basis mode: component `comp` of the orthonormal basis, modulated
// by cos(kz * z) along the z axis. The probe used to assemble the operator's momentum-space matrix.
function gravitonBasisField(
  L: number,
  comp: number,
  kz: number,
): TensorField {
  const [a, b] = GRAVITON_PAIRS[comp] ?? [0, 0]
  const amp = a === b ? 1 : Math.SQRT1_2 // orthonormal symmetric-tensor basis
  const h = makeTensorField(L)
  for (let site = 0; site < h.data.length; site++) {
    const c = gravitonCoordsOf(site, L)
    const phase = Math.cos(kz * (c[3] ?? 0))
    h.data[site]![a * D + b] = amp * phase
    h.data[site]![b * D + a] = amp * phase
  }
  return h
}

// Project a tensor field back onto the ten symmetric-tensor plane-wave modes (k along z), the
// coefficients of the operator's action in the orthonormal basis.
function gravitonProjectOntoMode(g: TensorField, kz: number): number[] {
  const out: number[] = []
  for (let r = 0; r < GRAVITON_PAIRS.length; r++) {
    const [a, b] = GRAVITON_PAIRS[r] ?? [0, 0]
    const amp = a === b ? 1 : Math.SQRT2 // inner product weight (off-diagonal counted twice)
    let num = 0
    let den = 0
    for (let site = 0; site < g.data.length; site++) {
      const c = gravitonCoordsOf(site, g.L)
      const phase = Math.cos(kz * (c[3] ?? 0))
      num += amp * (g.data[site]![a * D + b] ?? 0) * phase
      den += phase * phase
    }
    out.push(den > 0 ? num / den : 0)
  }
  return out
}

// Count the physical graviton polarizations from the SPECTRUM of the lattice operator (not by hand).
// Assemble the operator's 10x10 momentum-space matrix by probing linearizedEinstein with the ten
// symmetric-tensor plane-wave basis modes at a spatial wavevector along z, diagonalize, and classify:
// gauge modes are the exact zero eigenvalues (the 4 diffeomorphisms in 4D), and the physical
// (radiative) polarizations are the transverse-traceless modes confirmed to be propagating
// eigenvectors (M v = lambda v with lambda > 0). For a massless spin-2 this returns physical = 2,
// gauge = 4.
export function gravitonPolarizationsFromSpectrum(input: {
  side: number
  mode: number
}): { physical: number; gauge: number; eigenvalues: number[] } {
  const L = input.side
  const kn = input.mode
  const kz = (2 * Math.PI * kn) / L
  const M = makeDense({
    rows: GRAVITON_PAIRS.length,
    cols: GRAVITON_PAIRS.length,
  })
  for (let comp = 0; comp < GRAVITON_PAIRS.length; comp++) {
    const g = linearizedEinstein(gravitonBasisField(L, comp, kz))
    const col = gravitonProjectOntoMode(g, kz)
    for (let r = 0; r < GRAVITON_PAIRS.length; r++)
      M.data[r * GRAVITON_PAIRS.length + comp] = col[r] ?? 0
  }
  // symmetrize (the EH operator is self-adjoint; tiny asymmetry is lattice roundoff)
  for (let i = 0; i < GRAVITON_PAIRS.length; i++) {
    for (let j = i + 1; j < GRAVITON_PAIRS.length; j++) {
      const avg =
        0.5 *
        ((M.data[i * GRAVITON_PAIRS.length + j] ?? 0) +
          (M.data[j * GRAVITON_PAIRS.length + i] ?? 0))
      M.data[i * GRAVITON_PAIRS.length + j] = avg
      M.data[j * GRAVITON_PAIRS.length + i] = avg
    }
  }
  const eig = eigSymmetric({ matrix: M })
  const eigenvalues = Array.from(eig.values).sort((a, b) => a - b)
  const scale = Math.max(...eigenvalues.map(v => Math.abs(v)), 1e-12)
  const tol = 1e-6 * scale
  let gauge = 0
  for (const v of eigenvalues) if (Math.abs(v) < tol) gauge += 1

  const apply = (v: number[]): number[] => {
    const out = new Array<number>(GRAVITON_PAIRS.length).fill(0)
    for (let r = 0; r < GRAVITON_PAIRS.length; r++) {
      let s = 0
      for (let c = 0; c < GRAVITON_PAIRS.length; c++)
        s += (M.data[r * GRAVITON_PAIRS.length + c] ?? 0) * (v[c] ?? 0)
      out[r] = s
    }
    return out
  }
  const isPropagatingEigenvector = (v: number[]): boolean => {
    const norm = Math.sqrt(v.reduce((a, b) => a + b * b, 0))
    if (norm < 1e-12) return false
    const Mv = apply(v)
    let vMv = 0
    for (let i = 0; i < v.length; i++) vMv += (v[i] ?? 0) * (Mv[i] ?? 0)
    const lambda = vMv / (norm * norm)
    let res = 0
    for (let i = 0; i < v.length; i++)
      res += ((Mv[i] ?? 0) - lambda * (v[i] ?? 0)) ** 2
    return lambda > tol && Math.sqrt(res) < 1e-6 * scale
  }
  // TT modes for k along z (axis 3): h_xx = -h_yy (index 1, 2), and h_xy (index 7).
  const ttPlus = new Array<number>(GRAVITON_PAIRS.length).fill(0)
  ttPlus[1] = 1
  ttPlus[2] = -1
  const ttCross = new Array<number>(GRAVITON_PAIRS.length).fill(0)
  ttCross[7] = 1
  let physical = 0
  for (const mode of [ttPlus, ttCross])
    if (isPropagatingEigenvector(mode)) physical += 1

  return { physical, gauge, eigenvalues }
}
