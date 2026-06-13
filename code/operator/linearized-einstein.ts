// The linearized Einstein operator on a periodic 4D lattice, the discrete graviton. Acting on a
// symmetric rank-2 perturbation h_{mu nu}(x) it returns
//   G[h]_{mu nu} = -1/2 ( box h_{mu nu} - d_mu d^a h_{a nu} - d_nu d^a h_{a mu} + d_mu d_nu h
//                         - eta_{mu nu} box h + eta_{mu nu} d^a d^b h_{ab} )
// with all derivatives central differences on the periodic lattice and indices raised with the
// Minkowski metric eta. It is gauge-invariant (it annihilates pure-gauge h = d xi + (d xi)^T), has no
// mass term (it is built entirely from derivatives), and on a transverse-traceless plane wave its
// eigenvalue is proportional to k^2. The defining properties of a massless spin-2 field.

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

export function gravitonShift(coords: number[], axis: number, delta: number, L: number): number[] {
  const c = coords.slice()
  c[axis] = ((c[axis] ?? 0) + delta + L) % L
  return c
}

export function makeTensorField(L: number): TensorField {
  const n = Math.pow(L, D)
  return { L, data: Array.from({ length: n }, () => new Float64Array(D * D)) }
}

export function tensorFieldMaxAbs(f: TensorField): number {
  let m = 0
  for (const row of f.data) for (const v of row) m = Math.max(m, Math.abs(v))
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
  const at = (site: number, mu: number, nu: number): number => h.data[site]![mu * D + nu] ?? 0
  const d2 = (coords: number[], alpha: number, beta: number, mu: number, nu: number): number => {
    if (alpha === beta) {
      const pp = gravitonSiteIndex(gravitonShift(coords, alpha, 2, L), L)
      const mm = gravitonSiteIndex(gravitonShift(coords, alpha, -2, L), L)
      const c = gravitonSiteIndex(coords, L)
      return (at(pp, mu, nu) - 2 * at(c, mu, nu) + at(mm, mu, nu)) / 4
    }
    const pp = gravitonSiteIndex(gravitonShift(gravitonShift(coords, alpha, 1, L), beta, 1, L), L)
    const pm = gravitonSiteIndex(gravitonShift(gravitonShift(coords, alpha, 1, L), beta, -1, L), L)
    const mp = gravitonSiteIndex(gravitonShift(gravitonShift(coords, alpha, -1, L), beta, 1, L), L)
    const mm = gravitonSiteIndex(gravitonShift(gravitonShift(coords, alpha, -1, L), beta, -1, L), L)
    return (at(pp, mu, nu) - at(pm, mu, nu) - at(mp, mu, nu) + at(mm, mu, nu)) / 4
  }
  for (let site = 0; site < n; site++) {
    const coords = gravitonCoordsOf(site, L)
    const traceAt = (s: number): number => {
      let t = 0
      for (let a = 0; a < D; a++) t += (ETA[a] ?? 1) * (h.data[s]![a * D + a] ?? 0)
      return t
    }
    const d2trace = (alpha: number, beta: number): number => {
      if (alpha === beta) {
        const pp = gravitonSiteIndex(gravitonShift(coords, alpha, 2, L), L)
        const mm = gravitonSiteIndex(gravitonShift(coords, alpha, -2, L), L)
        const c = gravitonSiteIndex(coords, L)
        return (traceAt(pp) - 2 * traceAt(c) + traceAt(mm)) / 4
      }
      const pp = gravitonSiteIndex(gravitonShift(gravitonShift(coords, alpha, 1, L), beta, 1, L), L)
      const pm = gravitonSiteIndex(gravitonShift(gravitonShift(coords, alpha, 1, L), beta, -1, L), L)
      const mp = gravitonSiteIndex(gravitonShift(gravitonShift(coords, alpha, -1, L), beta, 1, L), L)
      const mm = gravitonSiteIndex(gravitonShift(gravitonShift(coords, alpha, -1, L), beta, -1, L), L)
      return (traceAt(pp) - traceAt(pm) - traceAt(mp) + traceAt(mm)) / 4
    }
    let boxTrace = 0
    let divdiv = 0
    for (let a = 0; a < D; a++) {
      boxTrace += (ETA[a] ?? 1) * d2trace(a, a)
      for (let b = 0; b < D; b++) divdiv += (ETA[a] ?? 1) * (ETA[b] ?? 1) * d2(coords, a, b, a, b)
    }
    for (let mu = 0; mu < D; mu++) {
      for (let nu = mu; nu < D; nu++) {
        let boxH = 0
        for (let a = 0; a < D; a++) boxH += (ETA[a] ?? 1) * d2(coords, a, a, mu, nu)
        let divMu = 0
        let divNu = 0
        for (let a = 0; a < D; a++) {
          divMu += (ETA[a] ?? 1) * d2(coords, mu, a, a, nu)
          divNu += (ETA[a] ?? 1) * d2(coords, nu, a, a, mu)
        }
        const ddTrace = d2trace(mu, nu)
        const etaMuNu = mu === nu ? (ETA[mu] ?? 1) : 0
        const g = -0.5 * (boxH - divMu - divNu + ddTrace - etaMuNu * boxTrace + etaMuNu * divdiv)
        out.data[site]![mu * D + nu] = g
        out.data[site]![nu * D + mu] = g
      }
    }
  }
  return out
}
