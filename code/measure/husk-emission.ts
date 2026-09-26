// Light meets matter on the husk: the exactly linear husk U(1) leapfrog of E-FRC-0179 in real space and in
// momentum space, and the golden-rule emission rate of a transition current into its photons (E-FRC-0190 to
// E-FRC-0194).
//
// The linear rule. The husk is the depth-even, k4 = 0 part of the bulk leapfrog (code/measure/photon-husk,
// code/measure/photon-symbol). On husk link fields (9 directions per dock, weights w = 2 on the 3 axes and 1
// on the 6 face diagonals) one beat is
//
//   a <- a + e,   e <- e - kappa M_h a,   M_h = P M P^T G^(-1)
//
// with G = diag(w). This module reads M_h in real space as a stencil, straight off the bulk rule's own
// beats: readStencil (E-FRC-0179) gives the bulk curl-curl column of each link direction of one dock, and
// the husk column of direction h is the column sum of the bulk columns that cast h, each divided by w_h (a
// unit husk field lifted to the bulk as P^T G^(-1), one depth layer). The stencil's Fourier transform is
// checked against E-FRC-0179's husk symbol.
//
// The energy. The bulk energy per depth layer of a depth-even field is 1/2 e G^(-1) e + 1/2 kappa a G^(-1)
// M_h a, so the canonical pair is (a, G^(-1) e) and in the Hermitian frame (a~, p~) = (G^(-1/2) a, G^(-1/2) e)
// the beat is the plain leapfrog a~ <- a~ + p~, p~ <- p~ - kappa H a~, with H(k) = G^(-1/2) M_h(k) G^(1/2)
// Hermitian. On an eigenvector of H with eigenvalue mu, x = kappa mu, the block [[1, 1], [-x, 1 - x]] keeps
// Q = 1/2 (E^2 + x A^2 + x A E) exactly, and its eigenvalues are e^(-+i omega), 4 sin^2(omega / 2) = x.
// Q generates the block as a flow of rate sin(omega), so the Hamiltonian whose unit-time flow IS the beat is
// h = (omega / sin omega) Q. Quantized, h = omega (b^dagger b + 1/2) and the vacuum variance of the angle is
// <A^2> = 1 / (2 sin omega), the leapfrog's lattice correction to the continuum's 1 / (2 omega). A photon
// is one quantum of h.
//
// The coupling. A charge q hopping along husk link (x, h) picks up the Peierls phase q a / w_h (a husk axis
// link is two bulk routes, each holding half the column-summed angle). Its hop is -t w (e^(-i theta) |y><x|
// + h.c.), theta = q a / w, so dH / da = i t q (|y><x| - |x><y|) at a = 0: F = <g| dH/da |e> on each link.
// Emission of one photon into mode (k, b) has amplitude sum over links F sqrt(w) conj(u_b(k)_h) e^(-i k . mid)
// / sqrt(2 V sin omega), u the unit eigenvector of H(k) and mid the link's midpoint, so the golden rule is
//
//   J(omega) = 2 pi int d^3k / (2 pi)^3 sum_b |g_b(k)|^2 / (2 sin omega_b) delta(omega - omega_b(k))
//
// evaluated here on rays: for each direction of a Gauss-Legendre (cos theta) by uniform (phi) grid, the
// radius where omega_b = omega is found by bisection on the eigenvalue itself, and the delta contributes s^2
// / |d omega / ds|. Nothing is sampled at random.

import { HUSK_VECTORS, HUSK_WEIGHTS, makeHusk, projectLinks } from '@/code/measure/photon-husk'
import { curlSymbol, huskSymbol, plaquetteShapes, readStencil } from '@/code/measure/photon-symbol'
import { photonLatticeD4, type PhotonLattice } from '@/code/rule/photon-links'
import { makeComplexMatrix, type ComplexMatrix } from '@/code/algebra/linear/dense'
import { hermitianEigen } from '@/code/measure/photon-modes'

// the E-FRC-0164 coupling, the one the rule runs at: kappa = 2 pi K / N
export const HUSK_N = 8192
export const HUSK_K = 80
export const HUSK_KAPPA = (2 * Math.PI * HUSK_K) / HUSK_N

// husk link directions per dock
export const H = HUSK_VECTORS.length

const modulo = (x: number, m: number): number => ((x % m) + m) % m

// ---------------------------------------------------------------------------------------------------------
// the real-space stencil of M_h

// one entry of the husk curl-curl: (M_h a)(x + shift, to) += value * a(x, from)
export type StencilEntry = { readonly to: number; readonly from: number; readonly shift: readonly [number, number, number]; readonly value: number }

export type HuskStencil = {
  readonly entries: readonly StencilEntry[]
  // the bulk box side the stencil was read on
  readonly side: number
}

// Read M_h off the bulk rule: the bulk curl-curl columns of dock 0 (readStencil, through photonBeatInPlace in
// integers), lifted and summed onto the husk
export function readHuskStencil(side = 8): HuskStencil {
  const bulk = photonLatticeD4({ side })
  const husk = makeHusk(bulk)
  const stencil = readStencil(bulk, HUSK_N)
  const f = bulk.firsts.length

  if (stencil.mismatches !== 0) {
    throw new Error(`the bulk stencil disagrees with the linear symbol on ${stencil.mismatches} entries`)
  }

  const entries: StencilEntry[] = []
  const origin = husk.column[0] ?? 0
  const ox = origin % side
  const oy = Math.floor(origin / side) % side
  const oz = Math.floor(origin / (side * side))

  for (let h = 0; h < H; h++) {
    const field = new Float64Array(bulk.links)

    for (let a = 0; a < f; a++) {
      if ((husk.shadow[a] ?? -1) !== h) {
        continue
      }

      for (const [l, m] of stencil.columns[a] ?? []) {
        field[l] = (field[l] ?? 0) + m / (HUSK_WEIGHTS[h] ?? 1)
      }
    }

    const projected = projectLinks(husk, field)

    for (let t = 0; t < projected.length; t++) {
      const value = projected[t] ?? 0

      if (Math.abs(value) < 1e-12) {
        continue
      }

      const y = Math.floor(t / H)
      const to = t % H
      const centered = (c: number): number => {
        const m = modulo(c, side)

        return m >= side / 2 ? m - side : m
      }

      entries.push({
        to,
        from: h,
        shift: [centered((y % side) - ox), centered((Math.floor(y / side) % side) - oy), centered(Math.floor(y / (side * side)) - oz)],
        value,
      })
    }
  }

  return { entries, side }
}

// M_h(k) from the stencil: S_(to, from) = sum value e^(-i k . (shift + u_to / 2 - u_from / 2)), the matrix a
// plane wave c_h e^(i k . (x + u_h / 2)) is multiplied by
export function stencilHuskSymbol(stencil: HuskStencil, k: readonly number[]): ComplexMatrix {
  const m = makeComplexMatrix({ rows: H, cols: H })

  for (const { to, from, shift, value } of stencil.entries) {
    const ut = HUSK_VECTORS[to] ?? [0, 0, 0]
    const uf = HUSK_VECTORS[from] ?? [0, 0, 0]
    let phi = 0

    for (let i = 0; i < 3; i++) {
      phi += (k[i] ?? 0) * ((shift[i] ?? 0) + ((ut[i] ?? 0) - (uf[i] ?? 0)) / 2)
    }

    m.re[to * H + from] = (m.re[to * H + from] ?? 0) + value * Math.cos(phi)
    m.im[to * H + from] = (m.im[to * H + from] ?? 0) - value * Math.sin(phi)
  }

  return m
}

// the Hermitian frame: G^(-1/2) S G^(1/2)
export function hermitianHuskSymbol(stencil: HuskStencil, k: readonly number[]): ComplexMatrix {
  const s = stencilHuskSymbol(stencil, k)

  for (let i = 0; i < H; i++) {
    for (let j = 0; j < H; j++) {
      const r = Math.sqrt((HUSK_WEIGHTS[j] ?? 1) / (HUSK_WEIGHTS[i] ?? 1))

      s.re[i * H + j] = (s.re[i * H + j] ?? 0) * r
      s.im[i * H + j] = (s.im[i * H + j] ?? 0) * r
    }
  }

  return s
}

// E-FRC-0179's husk symbol at the same k (k4 = 0), for the cross-check
export function referenceHuskSymbol(k: readonly number[]): { husk: ComplexMatrix; hermitian: ComplexMatrix } {
  const bulk = referenceBulk()
  const symbol = huskSymbol(referenceHuskOf(), curlSymbol(bulk, referenceShapes(), [k[0] ?? 0, k[1] ?? 0, k[2] ?? 0, 0]))

  return { husk: symbol.husk, hermitian: symbol.hermitian }
}

let REFERENCE: { bulk: PhotonLattice; husk: ReturnType<typeof makeHusk>; shapes: ReturnType<typeof plaquetteShapes> } | undefined

function reference(): NonNullable<typeof REFERENCE> {
  if (!REFERENCE) {
    const bulk = photonLatticeD4({ side: 6 })

    REFERENCE = { bulk, husk: makeHusk(bulk), shapes: plaquetteShapes(bulk) }
  }

  return REFERENCE
}

export function referenceBulk(): PhotonLattice {
  return reference().bulk
}

export function referenceShapes(): ReturnType<typeof plaquetteShapes> {
  return reference().shapes
}

function referenceHuskOf(): ReturnType<typeof makeHusk> {
  return reference().husk
}

// ---------------------------------------------------------------------------------------------------------
// a small Hermitian eigensolver: cyclic complex Jacobi, eigenvalues ascending, eigenvectors as columns

export type SmallEigen = { readonly values: Float64Array; readonly re: Float64Array; readonly im: Float64Array }

export function eigenSmall(matrix: ComplexMatrix, vectors = true): SmallEigen {
  const n = matrix.rows

  // a real symmetric matrix (the husk symbol is real at every k: the rule is even under x -> -x and the
  // phases sit at link midpoints) goes through Householder and QL, several times faster
  let imag = 0
  let norm = 0

  for (let i = 0; i < n * n; i++) {
    imag = Math.max(imag, Math.abs(matrix.im[i] ?? 0))
    norm = Math.max(norm, Math.abs(matrix.re[i] ?? 0))
  }

  if (imag <= 1e-14 * Math.max(norm, 1e-300)) {
    const real = eigenSymmetricSmall(matrix.re, n, vectors)

    return { values: real.values, re: real.vectors, im: new Float64Array(n * n) }
  }

  const ar = Float64Array.from(matrix.re)
  const ai = Float64Array.from(matrix.im)
  const vr = new Float64Array(n * n)
  const vi = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    vr[i * n + i] = 1
    ar[i * n + i] = ar[i * n + i] ?? 0
    ai[i * n + i] = 0
  }

  let scale = 0

  for (let i = 0; i < n * n; i++) {
    scale += (ar[i] ?? 0) ** 2 + (ai[i] ?? 0) ** 2
  }

  // stop when the off-diagonal weight is at the rounding floor of the matrix: sum |A_pq|^2 under (1e-15)^2
  // of the Frobenius norm squared
  const floor = 1e-30 * Math.max(scale, 1e-300)

  for (let sweep = 0; sweep < 30; sweep++) {
    let off = 0

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        off += (ar[p * n + q] ?? 0) ** 2 + (ai[p * n + q] ?? 0) ** 2
      }
    }

    if (off <= floor) {
      break
    }

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const xr = ar[p * n + q] ?? 0
        const xi = ai[p * n + q] ?? 0
        const r = Math.hypot(xr, xi)

        if (r === 0 || r * r <= floor * 1e-6) {
          continue
        }

        // A_pq = r e^(i phi); D = diag(1, e^(-i phi)) makes it real, then a real rotation zeroes it
        const cphi = xr / r
        const sphi = xi / r
        const app = ar[p * n + p] ?? 0
        const aqq = ar[q * n + q] ?? 0
        const tau = (aqq - app) / (2 * r)
        const t = (tau >= 0 ? 1 : -1) / (Math.abs(tau) + Math.sqrt(1 + tau * tau))
        const c = 1 / Math.sqrt(1 + t * t)
        const s = t * c
        // U = D R, R = [[c, s], [-s, c]]: U_pp = c, U_pq = s, U_qp = -s e^(-i phi), U_qq = c e^(-i phi)
        const uqpr = -s * cphi
        const uqpi = s * sphi
        const uqqr = c * cphi
        const uqqi = -c * sphi

        // A <- A U (columns p, q)
        for (let k = 0; k < n; k++) {
          const kpr = ar[k * n + p] ?? 0
          const kpi = ai[k * n + p] ?? 0
          const kqr = ar[k * n + q] ?? 0
          const kqi = ai[k * n + q] ?? 0

          ar[k * n + p] = kpr * c + (kqr * uqpr - kqi * uqpi)
          ai[k * n + p] = kpi * c + (kqr * uqpi + kqi * uqpr)
          ar[k * n + q] = kpr * s + (kqr * uqqr - kqi * uqqi)
          ai[k * n + q] = kpi * s + (kqr * uqqi + kqi * uqqr)
        }

        // A <- U^dagger A (rows p, q): row p' = conj(U_pp) row p + conj(U_qp) row q, row q' = conj(U_pq) row p
        // + conj(U_qq) row q
        for (let k = 0; k < n; k++) {
          const pkr = ar[p * n + k] ?? 0
          const pki = ai[p * n + k] ?? 0
          const qkr = ar[q * n + k] ?? 0
          const qki = ai[q * n + k] ?? 0

          ar[p * n + k] = c * pkr + (uqpr * qkr + uqpi * qki)
          ai[p * n + k] = c * pki + (uqpr * qki - uqpi * qkr)
          ar[q * n + k] = s * pkr + (uqqr * qkr + uqqi * qki)
          ai[q * n + k] = s * pki + (uqqr * qki - uqqi * qkr)
        }

        ai[p * n + p] = 0
        ai[q * n + q] = 0
        ar[p * n + q] = 0
        ai[p * n + q] = 0
        ar[q * n + p] = 0
        ai[q * n + p] = 0

        if (vectors) {
          for (let k = 0; k < n; k++) {
            const kpr = vr[k * n + p] ?? 0
            const kpi = vi[k * n + p] ?? 0
            const kqr = vr[k * n + q] ?? 0
            const kqi = vi[k * n + q] ?? 0

            vr[k * n + p] = kpr * c + (kqr * uqpr - kqi * uqpi)
            vi[k * n + p] = kpi * c + (kqr * uqpi + kqi * uqpr)
            vr[k * n + q] = kpr * s + (kqr * uqqr - kqi * uqqi)
            vi[k * n + q] = kpi * s + (kqr * uqqi + kqi * uqqr)
          }
        }
      }
    }
  }

  const order = Array.from({ length: n }, (_, i) => i).sort((x, y) => (ar[x * n + x] ?? 0) - (ar[y * n + y] ?? 0))
  const values = Float64Array.from(order, i => ar[i * n + i] ?? 0)
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  if (vectors) {
    order.forEach((col, j) => {
      for (let k = 0; k < n; k++) {
        re[k * n + j] = vr[k * n + col] ?? 0
        im[k * n + j] = vi[k * n + col] ?? 0
      }
    })
  }

  return { values, re, im }
}

// A real symmetric eigensolver: Householder tridiagonalization then implicit QL (the tred2 and tql2 of the
// EISPACK line, as in JAMA). Eigenvalues ascending, eigenvectors as columns (vectors[row * n + column]).
// Symmetrized from the upper and lower triangles first.
export function eigenSymmetricSmall(input: ArrayLike<number>, n: number, wantVectors = true): { values: Float64Array; vectors: Float64Array } {
  const v = new Float64Array(n * n)
  const d = new Float64Array(n)
  const e = new Float64Array(n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      v[i * n + j] = ((input[i * n + j] ?? 0) + (input[j * n + i] ?? 0)) / 2
    }
  }

  // tred2
  for (let j = 0; j < n; j++) {
    d[j] = v[(n - 1) * n + j]!
  }

  for (let i = n - 1; i > 0; i--) {
    let scale = 0
    let h = 0

    for (let k = 0; k < i; k++) {
      scale += Math.abs(d[k]!)
    }

    if (scale === 0) {
      e[i] = d[i - 1]!

      for (let j = 0; j < i; j++) {
        d[j] = v[(i - 1) * n + j]!
        v[i * n + j] = 0
        v[j * n + i] = 0
      }
    } else {
      for (let k = 0; k < i; k++) {
        d[k] = d[k]! / scale
        h += d[k]! * d[k]!
      }

      let f = d[i - 1]!
      let g = Math.sqrt(h)

      if (f > 0) {
        g = -g
      }

      e[i] = scale * g
      h -= f * g
      d[i - 1] = f - g

      for (let j = 0; j < i; j++) {
        e[j] = 0
      }

      for (let j = 0; j < i; j++) {
        f = d[j]!
        v[j * n + i] = f
        g = e[j]! + v[j * n + j]! * f

        for (let k = j + 1; k <= i - 1; k++) {
          g += v[k * n + j]! * d[k]!
          e[k] = e[k]! + v[k * n + j]! * f
        }

        e[j] = g
      }

      f = 0

      for (let j = 0; j < i; j++) {
        e[j] = e[j]! / h
        f += e[j]! * d[j]!
      }

      const hh = f / (h + h)

      for (let j = 0; j < i; j++) {
        e[j] = e[j]! - hh * d[j]!
      }

      for (let j = 0; j < i; j++) {
        f = d[j]!
        g = e[j]!

        for (let k = j; k <= i - 1; k++) {
          v[k * n + j] = v[k * n + j]! - (f * e[k]! + g * d[k]!)
        }

        d[j] = v[(i - 1) * n + j]!
        v[i * n + j] = 0
      }
    }

    d[i] = h
  }

  for (let i = 0; i < n - 1; i++) {
    v[(n - 1) * n + i] = v[i * n + i]!
    v[i * n + i] = 1

    const h = d[i + 1]!

    if (h !== 0) {
      for (let k = 0; k <= i; k++) {
        d[k] = v[k * n + i + 1]! / h
      }

      for (let j = 0; j <= i; j++) {
        let g = 0

        for (let k = 0; k <= i; k++) {
          g += v[k * n + i + 1]! * v[k * n + j]!
        }

        for (let k = 0; k <= i; k++) {
          v[k * n + j] = v[k * n + j]! - g * d[k]!
        }
      }
    }

    for (let k = 0; k <= i; k++) {
      v[k * n + i + 1] = 0
    }
  }

  for (let j = 0; j < n; j++) {
    d[j] = v[(n - 1) * n + j]!
    v[(n - 1) * n + j] = 0
  }

  v[(n - 1) * n + n - 1] = 1
  e[0] = 0

  // tql2
  for (let i = 1; i < n; i++) {
    e[i - 1] = e[i]!
  }

  e[n - 1] = 0

  let f = 0
  let tst1 = 0
  const eps = 2 ** -52

  for (let l = 0; l < n; l++) {
    tst1 = Math.max(tst1, Math.abs(d[l]!) + Math.abs(e[l]!))

    let m = l

    while (m < n) {
      if (Math.abs(e[m]!) <= eps * tst1) {
        break
      }

      m++
    }

    if (m > l) {
      let iter = 0

      do {
        iter += 1

        let g = d[l]!
        let p = (d[l + 1]! - g) / (2 * e[l]!)
        let r = Math.hypot(p, 1)

        if (p < 0) {
          r = -r
        }

        d[l] = e[l]! / (p + r)
        d[l + 1] = e[l]! * (p + r)

        const dl1 = d[l + 1]!
        let h = g - d[l]!

        for (let i = l + 2; i < n; i++) {
          d[i] = d[i]! - h
        }

        f += h
        p = d[m]!

        let c = 1
        let c2 = c
        let c3 = c
        const el1 = e[l + 1]!
        let s = 0
        let s2 = 0

        for (let i = m - 1; i >= l; i--) {
          c3 = c2
          c2 = c
          s2 = s
          g = c * e[i]!
          h = c * p
          r = Math.hypot(p, e[i]!)
          e[i + 1] = s * r
          s = e[i]! / r
          c = p / r
          p = c * d[i]! - s * g
          d[i + 1] = h + s * (c * g + s * d[i]!)

          if (wantVectors) {
            for (let k = 0; k < n; k++) {
              const t = v[k * n + i + 1]!

              v[k * n + i + 1] = s * v[k * n + i]! + c * t
              v[k * n + i] = c * v[k * n + i]! - s * t
            }
          }
        }

        p = (-s * s2 * c3 * el1 * e[l]!) / dl1
        e[l] = s * p
        d[l] = c * p
      } while (Math.abs(e[l]!) > eps * tst1 && iter < 60)
    }

    d[l] = d[l]! + f
    e[l] = 0
  }

  const order = Array.from({ length: n }, (_, i) => i).sort((x, y) => d[x]! - d[y]!)
  const values = Float64Array.from(order, i => d[i]!)
  const vectors = new Float64Array(n * n)

  if (wantVectors) {
    order.forEach((col, j) => {
      for (let k = 0; k < n; k++) {
        vectors[k * n + j] = v[k * n + col]!
      }
    })
  }

  return { values, vectors }
}

// ---------------------------------------------------------------------------------------------------------
// the leapfrog on one mode

// omega from 4 sin^2(omega / 2) = kappa mu
export function leapfrogOmega(kappa: number, mu: number): number {
  const x = kappa * Math.max(0, mu)

  return 2 * Math.asin(Math.min(1, Math.sqrt(x) / 2))
}

// mu from omega
export function leapfrogMu(kappa: number, omega: number): number {
  return (4 * Math.sin(omega / 2) ** 2) / kappa
}

// ---------------------------------------------------------------------------------------------------------
// Gauss-Legendre nodes on [-1, 1]

export function gaussLegendre(n: number): { nodes: Float64Array; weights: Float64Array } {
  const nodes = new Float64Array(n)
  const weights = new Float64Array(n)

  for (let i = 0; i < n; i++) {
    let x = Math.cos((Math.PI * (i + 0.75)) / (n + 0.5))
    let dp = 1

    for (let it = 0; it < 100; it++) {
      let p0 = 1
      let p1 = x

      for (let j = 2; j <= n; j++) {
        const p2 = ((2 * j - 1) * x * p1 - (j - 1) * p0) / j

        p0 = p1
        p1 = p2
      }

      const pn = n === 0 ? 1 : n === 1 ? x : p1
      const pm = n === 1 ? 1 : p0

      dp = (n * (x * pn - pm)) / (x * x - 1)

      const dx = pn / dp

      x -= dx

      if (Math.abs(dx) < 1e-16) {
        break
      }
    }

    nodes[i] = x
    weights[i] = 2 / ((1 - x * x) * dp * dp)
  }

  return { nodes, weights }
}

// ---------------------------------------------------------------------------------------------------------
// the golden rule on rays

// a transition current: on each husk link (dock x, direction h), F = <g| dH/da |e>
export type CouplingLink = { readonly x: readonly [number, number, number]; readonly h: number; readonly re: number; readonly im: number }
export type Coupling = readonly CouplingLink[]

// a symbol: the Hermitian matrix at k, its dimension, the directions' weights, and the link geometry
export type Symbolizer = {
  readonly dimension: number
  readonly size: number
  matrix(k: readonly number[]): ComplexMatrix
  // weight of link direction h (sqrt(w) enters the coupling)
  weight(h: number): number
  // link direction h's vector, whose half is the midpoint offset
  vector(h: number): readonly number[]
  // the largest radius a ray in direction r stays inside the Brillouin zone
  exit(r: readonly number[]): number
  // the first photon index in the sorted spectrum and the number of photon branches
  readonly first: number
  readonly photons: number
}

export function huskSymbolizer(stencil: HuskStencil): Symbolizer {
  return {
    dimension: 3,
    size: H,
    matrix: k => hermitianHuskSymbol(stencil, k),
    weight: h => HUSK_WEIGHTS[h] ?? 1,
    vector: h => HUSK_VECTORS[h] ?? [0, 0, 0],
    exit: r => Math.PI / Math.max(...r.map(Math.abs)),
    first: 1,
    photons: 2,
  }
}

// the coupling amplitude of one mode: sum F sqrt(w) conj(u_h) e^(-i k . (x + v_h / 2)), per unit volume
export function modeCoupling(input: { symbol: Symbolizer; coupling: Coupling; k: readonly number[]; ure: ArrayLike<number>; uim: ArrayLike<number>; column: number }): [number, number] {
  const { symbol, coupling, k, ure, uim, column } = input
  const n = symbol.size

  let re = 0
  let im = 0

  for (const link of coupling) {
    const v = symbol.vector(link.h)
    let phi = 0

    for (let i = 0; i < symbol.dimension; i++) {
      phi += (k[i] ?? 0) * ((link.x[i] ?? 0) + (v[i] ?? 0) / 2)
    }

    const sw = Math.sqrt(symbol.weight(link.h))
    const ur = ure[link.h * n + column] ?? 0
    const ui = -(uim[link.h * n + column] ?? 0)
    // F sqrt(w) conj(u) e^(-i phi)
    const cr = Math.cos(phi)
    const ci = -Math.sin(phi)
    const pr = ur * cr - ui * ci
    const pi = ur * ci + ui * cr

    re += sw * (link.re * pr - link.im * pi)
    im += sw * (link.re * pi + link.im * pr)
  }

  return [re, im]
}

export type RayGrid = { readonly directions: readonly (readonly number[])[]; readonly weights: Float64Array }

// the 3D direction grid: Gauss-Legendre in cos theta by uniform phi, weights summing to 4 pi
export function sphereGrid(ntheta: number, nphi: number): RayGrid {
  const gl = gaussLegendre(ntheta)
  const directions: number[][] = []
  const weights: number[] = []

  for (let i = 0; i < ntheta; i++) {
    const ct = gl.nodes[i] ?? 0
    const st = Math.sqrt(Math.max(0, 1 - ct * ct))

    for (let j = 0; j < nphi; j++) {
      // a quarter-step offset in phi keeps the grid off the cube's mirror planes
      const phi = (2 * Math.PI * (j + 0.25)) / nphi

      directions.push([st * Math.cos(phi), st * Math.sin(phi), ct])
      weights.push(((gl.weights[i] ?? 0) * 2 * Math.PI) / nphi)
    }
  }

  return { directions, weights: Float64Array.from(weights) }
}

// the 4D direction grid on S^3: r = (sin chi sin theta cos phi, sin chi sin theta sin phi, sin chi cos theta,
// cos chi), measure sin^2 chi sin theta, weights summing to 2 pi^2
export function hypersphereGrid(nchi: number, ntheta: number, nphi: number): RayGrid {
  const gc = gaussLegendre(nchi)
  const gt = gaussLegendre(ntheta)
  const directions: number[][] = []
  const weights: number[] = []

  for (let a = 0; a < nchi; a++) {
    const chi = (Math.PI * ((gc.nodes[a] ?? 0) + 1)) / 2
    const wc = ((gc.weights[a] ?? 0) * Math.PI) / 2

    for (let i = 0; i < ntheta; i++) {
      const ct = gt.nodes[i] ?? 0
      const st = Math.sqrt(Math.max(0, 1 - ct * ct))

      for (let j = 0; j < nphi; j++) {
        const phi = (2 * Math.PI * (j + 0.25)) / nphi

        directions.push([Math.sin(chi) * st * Math.cos(phi), Math.sin(chi) * st * Math.sin(phi), Math.sin(chi) * ct, Math.cos(chi)])
        weights.push(wc * Math.sin(chi) ** 2 * (gt.weights[i] ?? 0) * ((2 * Math.PI) / nphi))
      }
    }
  }

  return { directions, weights: Float64Array.from(weights) }
}

export type GoldenRule = {
  // J(omega) for each coupling, in the continuous-time golden rule
  readonly rates: number[]
  // crossings found over all rays and branches
  readonly crossings: number
  // rays with more than one crossing on some branch
  readonly multiple: number
}

// J(omega) = 2 pi int d^dk / (2 pi)^d sum_b |g_b|^2 / (2 sin omega) delta(omega - omega_b), for several
// couplings at once. Each ray is scanned in `scan` steps to its zone exit (or to `cap` times omega / c0 when a
// cap is given), every sign change of mu_b - mu* is refined by bisection, and d omega / ds comes from a central
// difference of mu_b
export function goldenRule(input: { symbol: Symbolizer; couplings: readonly Coupling[]; omega: number; grid: RayGrid; kappa?: number; scan?: number; cap?: { c0: number; factor: number } }): GoldenRule {
  const { symbol, couplings, omega, grid } = input
  const kappa = input.kappa ?? HUSK_KAPPA
  const scan = input.scan ?? 48
  const target = leapfrogMu(kappa, omega)
  const n = symbol.size
  const d = symbol.dimension
  const rates = couplings.map(() => 0)

  let crossings = 0
  let multiple = 0

  const muAt = (r: readonly number[], s: number, b: number): number => eigenSmall(symbol.matrix(r.map(x => x * s)), false).values[b] ?? 0

  grid.directions.forEach((r, ray) => {
    const top = input.cap ? Math.min(symbol.exit(r), (input.cap.factor * omega) / input.cap.c0) : symbol.exit(r)
    const step = top / scan
    // the whole spectrum at each scan point, shared by the branches
    const table = Array.from({ length: scan + 1 }, (_, i) => (i === 0 ? null : eigenSmall(symbol.matrix(r.map(x => x * i * step)), false).values))

    for (let b = symbol.first; b < symbol.first + symbol.photons; b++) {
      let previous = -target
      let found = 0

      for (let i = 1; i <= scan; i++) {
        const value = (table[i]?.[b] ?? 0) - target

        if ((previous < 0) !== (value < 0)) {
          // a crossing, rising or (where the band folds back) falling, each with its own measure
          found += 1

          const rising = previous < 0

          let lo = (i - 1) * step
          let hi = i * step

          for (let it = 0; it < 60 && hi - lo > 1e-15 * hi; it++) {
            const mid = (lo + hi) / 2

            if ((muAt(r, mid, b) < target) === rising) {
              lo = mid
            } else {
              hi = mid
            }
          }

          const s = (lo + hi) / 2
          const h = 1e-6 * s
          const slope = (muAt(r, s + h, b) - muAt(r, s - h, b)) / (2 * h)
          const domega = (kappa / (2 * Math.sin(omega))) * slope
          const k = r.map(x => x * s)
          // the photon eigenvector from hermitianEigen (the degenerate-safe solver, E-FRC-0178), its columns
          // put in ascending order of value
          const eig = hermitianEigen(symbol.matrix(k))
          const order = Array.from(eig.values, (_, j) => j).sort((p, q) => (eig.values[p] ?? 0) - (eig.values[q] ?? 0))
          const measure = ((grid.weights[ray] ?? 0) * s ** (d - 1)) / Math.abs(domega)

          couplings.forEach((coupling, c) => {
            const [gr, gi] = modeCoupling({ symbol, coupling, k, ure: eig.vectorsRe, uim: eig.vectorsIm, column: order[b] ?? b })

            rates[c] = (rates[c] ?? 0) + (measure * (gr * gr + gi * gi)) / (2 * Math.sin(omega))
          })
          crossings += 1
        }

        previous = value
      }

      if (found > 1) {
        multiple += 1
      }
    }
  })

  const norm = (2 * Math.PI) / (2 * Math.PI) ** d

  return { rates: rates.map(v => v * norm), crossings, multiple }
}

// ---------------------------------------------------------------------------------------------------------
// the continuum answer, for a husk of photon speed c and field energy density 3 |E|^2 (sum of w_h u_h u_h^T
// = 6 I): a transition with dipole matrix element d = q <g|X|e> emits at A = omega^3 |d|^2 / (3 pi eps0 c^3)
// with eps0 = 6, that is omega^3 |d|^2 / (18 pi c^3)
export const HUSK_EPSILON = 6

export function continuumRate(input: { omega: number; dipole: number; c: number }): number {
  return (input.omega ** 3 * input.dipole ** 2) / (3 * Math.PI * HUSK_EPSILON * input.c ** 3)
}

// the photon speed of the linear husk: lambda / k^2 -> 2/3 (E-FRC-0179), so c^2 = 2 kappa / 3
export const HUSK_SPEED = Math.sqrt((2 * HUSK_KAPPA) / 3)
