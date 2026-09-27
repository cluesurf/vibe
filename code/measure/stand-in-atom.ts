// The stand-in atom's exact solvers (E-MTR-0001 to 0006, E-FRC-0190 to 0194). A STAND-IN: the charge is a
// fear-walk token, which plays an electron the model has not produced, and no result read with it is an L3
// derivation.
//
// THE STAND-IN'S BAND. The fear walk on one line (two slots, the cube-root swap phase) has the band through
// quasi-energy 0, e1(q) = arccos(cos q / 2) - pi / 3 (cos W = cos k / 2, eigenphases pi / 3 -+ W): kinetic
// mass tan(pi / 3) = sqrt 3, top pi / 3 + ... = 2 pi / 3 at q = pi, a gap of 2 pi / 3 to the other band at q = 0.
// The stand-in walks every D4 line, each line's band weighed alike:
//
//   T(k) = (1 / 12) sum over the 24 D4 roots r of e1(k . r)
//
// In the bulk sum_r (k . r)^2 = 12 |k|^2, so T = |k|^2 / (2 sqrt 3) + O(k^4): the mass is sqrt 3, the line's. On
// the husk (k4 = 0) the roots cast the husk directions with weights w = 2 (axes) and 1 (diagonals), so
// T(k) = (1 / 6) sum_h w_h e1(k . u_h), the band E-MTR-0007 to 0012 use, again of mass sqrt 3. T is the band
// of a token taking the lines in turn, in the limit where those substeps commute (the band-projected, Trotter
// limit): a construction, stated as one. The plain cubic control walks the 3 axes, T = sum_i e1(k_i), also of
// mass sqrt 3, so the husk and the control differ only in the lattice.
//
// THE F4 LAW. T is a sum over the D4 roots, so it is invariant under every map that permutes them, W(F4),
// whose invariant degrees are 2, 6, 8, 12 (E-MTH-0008): its only quartic is |k|^4. On the husk T is isotropic
// through relative order k^2 and cubic from relative order k^4 (sum_h w_h (k . u_h)^4 = 6 |k|^4 exactly), where
// the control is cubic from relative order k^2 (sum_i k_i^4). The husk Laplacian obeys the same law.
//
// THE 18-SLOT TOKEN, AND WHY IT IS NOT THE STAND-IN. A single token on the husk with a coin mixing all 18
// directions, U(k) = S(k) C, C = omega + (1 - omega) |s><s|, s_d = sqrt(w_d / 24) (code/measure/stand-in-
// hydrogen, husk18, which is the D4 token with a uniform coin at k4 = 0), has an exact band too. Its beat on a
// dock with slots d (direction r_d, s-weight s_d) is U(k) = S(k) C,
// C = omega + (1 - omega) |s><s|, S_dd = e^(-i k . r_d). C is a rank-one change of a scalar, so an eigenvalue
// e^(i phi) of U(k) solves one real equation. With beta = 2 pi / 3 and theta_d = k . r_d:
//
//   R(phi) = sum_d s_d^2 cot((phi + theta_d - beta) / 2) + 1 / sqrt 3 = 0
//
// (from 1 / (e^(i psi) - omega) = (-i cot((psi - beta) / 2) - 1) / (2 omega), with 1 / (1 - omega) on the
// right). R falls from +infinity to -infinity between consecutive poles phi = beta - theta_d, so there is one
// eigenvalue between each pair of poles: the bands interlace the streamed coin phases. At k = 0 every pole is
// at beta and the one root is phi = 0, the rest eigenvalue 1. The PARTICLE BAND is that root carried out
// along the straight ray from k = 0, and E(k) = -phi (U = e^(-i E)). On two slots this is cos W = cos k / 2
// exactly. Near k = 0 the root is phi = -<K^2> / (2 sqrt 3), <K^2> = sum_d s_d^2 (k . r_d)^2 (the second-order
// expansion of R, cot(-pi / 3) = -1 / sqrt 3, cot' = -4 / 3, cot'' = -8 / (3 sqrt 3)), so with
// sum_d s_d^2 r_d r_d^T = kappa2 I the kinetic mass is m* = sqrt 3 / kappa2: sqrt 3 on the line (kappa2 = 1),
// 2 sqrt 3 on the husk (kappa2 = (2 / 24) sum_h w_h u_h u_h^T = 1/2: the token's mean square step per axis
// per beat is half the line's), 3 sqrt 3 on a cubic 6-slot token (kappa2 = 1/3). Its band obeys the F4 law too
// (U(k) of the D4 token is conjugate to U(R k) for every root permutation R, since C commutes with slot
// permutations). But its bands interlace 18 poles that spread round the whole circle, and the particle band
// carried out along a ray comes back BELOW its own bottom at large k (to E = -1.34 on a side-32 grid,
// tmp/atom-probe1): a bound level at E = -Ry is degenerate with the 18-slot token's own far-zone states, so it
// is a resonance and the token's Hamiltonian is not bounded below near it. E-MTR-0004 measures this.
//
// THE ATOM. H = T(p) + V(x) on a side^3 torus centered on the source dock, T applied by FFT, V the lattice
// Coulomb potential of one unit charge, V = -alpha 24 pi G_husk (far field -alpha / r) or -alpha 4 pi
// G_cubic. The coupling alpha is chosen through the Bohr radius a = 1 / (m alpha), so Ry = m alpha^2 / 2 =
// 1 / (2 m a^2), with m = sqrt 3 derived above, before any level is solved.
//
// THE SECTORS. The husk torus about its center dock has the cubic group O_h (48 signed permutations), and H
// commutes with it. A level is solved in one row of one irrep: a parity pattern under the three reflections,
// a swap constraint, and where two irreps share both, the character projector. The solver is block LOBPCG
// (Knyazev 2001) with the kinetic preconditioner 1 / (E(k) + shift), every block member re-projected into
// its row each iteration so rounding cannot leak a lower level of another irrep in.
//
// Deterministic throughout: no random numbers, every start is a fixed function of position.

import { fft3, greenInfinite } from '@/code/measure/standin-chemistry'
import { HUSK_VECTORS, HUSK_WEIGHTS } from '@/code/measure/photon-husk'
import { eigenSymmetricSmall } from '@/code/measure/husk-emission'
import { line2, type SlotSet } from '@/code/measure/stand-in-hydrogen'

const BETA = (2 * Math.PI) / 3
const COT_BETA_HALF = 1 / Math.sqrt(3)

// the cubic Madelung constant of point charges in a neutralizing background
const MADELUNG = 2.837297479

// ---------------------------------------------------------------------------------------------------------
// the particle band

// R(phi) and dR/dphi for the slots at wave vector angles theta
function secular(phi: number, theta: Float64Array, s2: Float64Array): [number, number] {
  let r = COT_BETA_HALF
  let dr = 0

  for (let d = 0; d < theta.length; d++) {
    const x = (phi + theta[d]! - BETA) / 2
    const sn = Math.sin(x)
    const cs = Math.cos(x)

    r += (s2[d]! * cs) / sn
    dr -= s2[d]! / (2 * sn * sn)
  }

  return [r, dr]
}

const TWO_PI = 2 * Math.PI
const wrap = (x: number): number => x - TWO_PI * Math.floor(x / TWO_PI)

// the root of R between the two poles that bracket `guess`
function rootNear(guess: number, theta: Float64Array, s2: Float64Array): number {
  let up = TWO_PI
  let down = TWO_PI

  for (let d = 0; d < theta.length; d++) {
    const pole = BETA - theta[d]!
    const above = wrap(pole - guess)

    if (above > 0 && above < up) {
      up = above
    }

    const below = wrap(guess - pole)

    if (below > 0 && below < down) {
      down = below
    }
  }

  let lo = guess - down
  let hi = guess + up
  // shrink off the poles
  const pad = 1e-14 * (hi - lo)

  lo += pad
  hi -= pad

  let x = Math.min(Math.max(guess, lo + 1e-3 * (hi - lo)), hi - 1e-3 * (hi - lo))

  for (let it = 0; it < 200; it++) {
    const [r, dr] = secular(x, theta, s2)

    if (r > 0) {
      lo = x
    } else {
      hi = x
    }

    let next = x - r / dr

    if (!(next > lo && next < hi)) {
      next = (lo + hi) / 2
    }

    if (Math.abs(next - x) < 1e-15 * (1 + Math.abs(x)) || hi - lo < 1e-15) {
      return next
    }

    x = next
  }

  return x
}

// E(k) of the particle band: the root carried from phi = 0 at k = 0 along the ray, in `steps` steps
export function particleBand(slots: SlotSet, k: readonly number[], steps?: number): number {
  const n = slots.directions.length
  const s2 = Float64Array.from(slots.s, x => x * x)
  const theta = new Float64Array(n)
  const size = Math.hypot(...k)
  const count = steps ?? Math.max(8, Math.ceil(size / 0.02))
  let phi = 0

  for (let step = 1; step <= count; step++) {
    const t = step / count

    for (let d = 0; d < n; d++) {
      const r = slots.directions[d] ?? []
      let v = 0

      for (let a = 0; a < r.length; a++) {
        v += (r[a] ?? 0) * (k[a] ?? 0) * t
      }

      theta[d] = v
    }

    phi = rootNear(phi, theta, s2)
  }

  return -phi
}

// the band on the FFT grid of a side^3 torus (index mx + side (my + side mz), k = 2 pi m / side with m taken in
// [-side / 2, side / 2)), computed once per cubic orbit (the band is O_h-invariant for husk18 and cubic6)
export function bandGrid(slots: SlotSet, side: number): Float64Array {
  const out = new Float64Array(side ** 3)
  const memo = new Map<number, number>()
  const h = side / 2
  const signed = (m: number): number => (m >= h ? m - side : m)

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const c = [Math.abs(signed(x)), Math.abs(signed(y)), Math.abs(signed(z))].sort((p, q) => q - p)
        const key = c[0]! + (side + 1) * (c[1]! + (side + 1) * c[2]!)
        let e = memo.get(key)

        if (e === undefined) {
          e = particleBand(
            slots,
            c.map(m => (2 * Math.PI * m) / side),
          )
          memo.set(key, e)
        }

        out[x + side * (y + side * z)] = e
      }
    }
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the lattice Coulomb potential

export type Lattice = 'husk' | 'cubic'

export type AtomKind = {
  readonly lattice: Lattice
  // the stand-in's band T(k)
  readonly band: (k: readonly number[]) => number
  // the kinetic mass, derived (sqrt 3 for both kinds)
  readonly mass: number
  // 4 pi times the Laplacian's long-wave coefficient: G -> 1 / (norm r)
  readonly norm: number
}

// the fear walk's band through quasi-energy 0 on one line: cos W = cos q / 2, phase pi / 3 - W
export function fearBand(q: number): number {
  return Math.acos(Math.cos(q) / 2) - Math.PI / 3
}

// the husk stand-in's band, (1 / 6) sum_h w_h e1(k . u_h) = (1 / 12) sum over D4 roots at k4 = 0
export function huskBand(k: readonly number[]): number {
  let sum = 0

  for (let h = 0; h < HUSK_VECTORS.length; h++) {
    const u = HUSK_VECTORS[h]!

    sum += HUSK_WEIGHTS[h]! * fearBand(u[0]! * (k[0] ?? 0) + u[1]! * (k[1] ?? 0) + u[2]! * (k[2] ?? 0))
  }

  return sum / 6
}

// the bulk stand-in's band, (1 / 12) sum over the 24 D4 roots, for the bulk reading beside the husk one
export function bulkBand(k: readonly number[]): number {
  let sum = 0

  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      sum += fearBand((k[i] ?? 0) + (k[j] ?? 0)) + fearBand((k[i] ?? 0) - (k[j] ?? 0))
    }
  }

  // each line (r, -r) is counted once above and e1 is even, so the 24-root sum is twice this
  return (2 * sum) / 12
}

// the cubic control's band, the fear walk along the 3 axes
export function cubicBand(k: readonly number[]): number {
  return fearBand(k[0] ?? 0) + fearBand(k[1] ?? 0) + fearBand(k[2] ?? 0)
}

// the kinetic mass read from a band's curvature at k = 0 along a direction, by a symmetric difference
export function bandMass(band: (k: readonly number[]) => number, direction: readonly number[], step = 1e-3): number {
  const n = Math.hypot(...direction)
  const e = band(direction.map(x => (x / n) * step))

  return (step * step) / (2 * e)
}

// the kinetic mass sqrt 3 / kappa2 with sum_d s_d^2 r_d r_d^T = kappa2 I, and the tensor's largest departure
// from isotropy
export function massOf(slots: SlotSet): { mass: number; anisotropy: number } {
  const n = slots.dimension
  const m = Array.from({ length: n }, () => new Array<number>(n).fill(0))

  slots.directions.forEach((r, d) => {
    const s2 = (slots.s[d] ?? 0) ** 2

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        m[i]![j] = m[i]![j]! + s2 * (r[i] ?? 0) * (r[j] ?? 0)
      }
    }
  })

  const kappa2 = m.reduce((s, row, i) => s + row[i]!, 0) / n
  let anisotropy = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      anisotropy = Math.max(anisotropy, Math.abs(m[i]![j]! - (i === j ? kappa2 : 0)) / kappa2)
    }
  }

  return { mass: Math.sqrt(3) / kappa2, anisotropy }
}

// the fear walk's own mass: the line's slot set, s = (1, 1) / sqrt 2, directions +-1, gives sqrt 3
export const STAND_IN_MASS = massOf(line2()).mass

export const HUSK_ATOM: AtomKind = { lattice: 'husk', band: huskBand, mass: STAND_IN_MASS, norm: 24 * Math.PI }
export const CUBIC_ATOM: AtomKind = { lattice: 'cubic', band: cubicBand, mass: STAND_IN_MASS, norm: 4 * Math.PI }

// the band of a kind on the FFT grid of a side^3 torus (index mx + side (my + side mz), k = 2 pi m / side)
export function kindBandGrid(kind: AtomKind, side: number): Float64Array {
  const out = new Float64Array(side ** 3)
  const step = (2 * Math.PI) / side

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        out[x + side * (y + side * z)] = kind.band([x * step, y * step, z * step])
      }
    }
  }

  return out
}

// the lattice Laplacian symbol
export function laplacianSymbol(lattice: Lattice, k: readonly number[]): number {
  if (lattice === 'cubic') {
    return 6 - 2 * Math.cos(k[0] ?? 0) - 2 * Math.cos(k[1] ?? 0) - 2 * Math.cos(k[2] ?? 0)
  }

  let sum = 0

  for (let h = 0; h < HUSK_VECTORS.length; h++) {
    const u = HUSK_VECTORS[h] ?? [0, 0, 0]

    sum += (HUSK_WEIGHTS[h] ?? 0) * (2 - 2 * Math.cos((u[0] ?? 0) * (k[0] ?? 0) + (u[1] ?? 0) * (k[1] ?? 0) + (u[2] ?? 0) * (k[2] ?? 0)))
  }

  return sum
}

const GREEN_TORUS = 64
const GREEN_BLEND = 12
const GREENS = new Map<Lattice, Float64Array>()

// the cubic lattice's own Green's function (the husk one is read from code/measure/standin-chemistry's
// 128 torus, and this one is checked against it at M = 64): G_M on the M^3 torus with the image terms removed,
// G = G_M + MADELUNG / (norm M) - r^2 / (6 c M^3), c = norm / (4 pi); the continuum 1 / (norm r) past GREEN_BLEND
export function greenOf(lattice: Lattice, dx: number, dy: number, dz: number, torus = GREEN_TORUS): number {
  const norm = lattice === 'husk' ? 24 * Math.PI : 4 * Math.PI
  const c = norm / (4 * Math.PI)
  const r = Math.hypot(dx, dy, dz)

  if (r > GREEN_BLEND) {
    return 1 / (norm * r)
  }

  const key = `${lattice}` as Lattice
  let table = torus === GREEN_TORUS ? GREENS.get(key) : undefined

  if (!table) {
    const re = new Float64Array(torus ** 3)
    const im = new Float64Array(torus ** 3)
    const step = (2 * Math.PI) / torus

    for (let z = 0; z < torus; z++) {
      for (let y = 0; y < torus; y++) {
        for (let x = 0; x < torus; x++) {
          if (x + y + z > 0) {
            re[x + torus * (y + torus * z)] = 1 / laplacianSymbol(lattice, [x * step, y * step, z * step])
          }
        }
      }
    }

    fft3(re, im, torus, true)
    table = re

    if (torus === GREEN_TORUS) {
      GREENS.set(key, table)
    }
  }

  const m = torus
  const w = (x: number): number => ((x % m) + m) % m

  return (table[w(dx) + m * (w(dy) + m * w(dz))] ?? 0) + MADELUNG / (norm * m) - (r * r) / (6 * c * m ** 3)
}

// the potential energy of the stand-in (charge -1) at every dock of a side^3 torus centered on a unit source,
// V = -alpha norm G, minimum image; the husk uses the 128-torus greenInfinite of standin-chemistry
export function coulombBox(kind: AtomKind, side: number, alpha: number): Float64Array {
  const v = new Float64Array(side ** 3)
  const h = side / 2
  const memo = new Map<number, number>()

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const c = [Math.abs(x - h), Math.abs(y - h), Math.abs(z - h)].sort((p, q) => q - p)
        const key = c[0]! + (side + 1) * (c[1]! + (side + 1) * c[2]!)
        let g = memo.get(key)

        if (g === undefined) {
          g = kind.lattice === 'husk' ? greenInfinite(c[0]!, c[1]!, c[2]!) : greenOf('cubic', c[0]!, c[1]!, c[2]!)
          memo.set(key, g)
        }

        v[x + side * (y + side * z)] = -alpha * kind.norm * g
      }
    }
  }

  return v
}

// ---------------------------------------------------------------------------------------------------------
// the cubic group O_h on the torus, and its sectors

// the 48 signed permutations: image axis perm[i] with sign sign[i], x'_(perm[i]) = sign[i] x_i
export type Signed = { readonly perm: readonly number[]; readonly sign: readonly number[] }

export const OH: readonly Signed[] = (() => {
  const perms = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ]
  const out: Signed[] = []

  for (const perm of perms) {
    for (let s = 0; s < 8; s++) {
      out.push({ perm, sign: [s & 1 ? -1 : 1, s & 2 ? -1 : 1, s & 4 ? -1 : 1] })
    }
  }

  return out
})()

// the 3 x 3 matrix of a signed permutation
function matrixOf(g: Signed): number[][] {
  const m = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]

  for (let i = 0; i < 3; i++) {
    m[g.perm[i]!]![i] = g.sign[i]!
  }

  return m
}

function det3(m: number[][]): number {
  const [a, b, c] = m as [number[], number[], number[]]

  return a[0]! * (b[1]! * c[2]! - b[2]! * c[1]!) - a[1]! * (b[0]! * c[2]! - b[2]! * c[0]!) + a[2]! * (b[0]! * c[1]! - b[1]! * c[0]!)
}

export type Irrep = 'A1g' | 'A2g' | 'Eg' | 'T1g' | 'T2g' | 'A1u' | 'A2u' | 'Eu' | 'T1u' | 'T2u'

export const IRREP_DIMENSION: Record<Irrep, number> = { A1g: 1, A2g: 1, Eg: 2, T1g: 3, T2g: 3, A1u: 1, A2u: 1, Eu: 2, T1u: 3, T2u: 3 }

// characters of O on its classes [E, 8 C3, 3 C2 = C4^2, 6 C4, 6 C2']
const O_CHARACTERS: Record<string, number[]> = {
  A1: [1, 1, 1, 1, 1],
  A2: [1, 1, 1, -1, -1],
  E: [2, -1, 2, 0, 0],
  T1: [3, 0, -1, 1, -1],
  T2: [3, 0, -1, -1, 1],
}

// the O_h character of g in the irrep
export function character(irrep: Irrep, g: Signed): number {
  const m = matrixOf(g)
  const det = det3(m)
  const r = det > 0 ? m : m.map(row => row.map(x => -x))
  const trace = r[0]![0]! + r[1]![1]! + r[2]![2]!
  const diagonal = r[0]![1] === 0 && r[0]![2] === 0 && r[1]![0] === 0 && r[1]![2] === 0 && r[2]![0] === 0 && r[2]![1] === 0
  const cls = trace === 3 ? 0 : trace === 0 ? 1 : trace === 1 ? 3 : diagonal ? 2 : 4
  const base = irrep.slice(0, -1)
  const odd = irrep.endsWith('u')

  return (O_CHARACTERS[base]?.[cls] ?? 0) * (odd ? det : 1)
}

// g acting on a field: (g v)(x) = v(g^-1 x), on the side^3 torus about its center dock
export function actOn(g: Signed, v: Float64Array, side: number, out: Float64Array): void {
  const h = side / 2
  const c = [0, 0, 0]
  const img = [0, 0, 0]

  for (let z = 0; z < side; z++) {
    c[2] = z - h

    for (let y = 0; y < side; y++) {
      c[1] = y - h

      for (let x = 0; x < side; x++) {
        c[0] = x - h

        for (let i = 0; i < 3; i++) {
          img[g.perm[i]!] = g.sign[i]! * c[i]!
        }

        const wx = ((img[0]! + h) % side + side) % side
        const wy = ((img[1]! + h) % side + side) % side
        const wz = ((img[2]! + h) % side + side) % side

        // out at the image dock gets v at x, so out(g x) = v(x)
        out[wx + side * (wy + side * wz)] = v[x + side * (y + side * z)]!
      }
    }
  }
}

// A row of an irrep. O_h is the 8 reflections x_i -> -x_i (a normal subgroup) extended by S3, the axis
// permutations. A row is fixed by its parity under each reflection, then by how it transforms under the
// permutations that keep that parity pattern: for the patterns (+,+,+) and (-,-,-) all of S3 ('trivial', 'sign',
// or 'standard', which is symmetric under the swap of axes 0 and 1 with the trivial part removed); for a
// pattern with one odd or one even axis, the swap of the other two ('swap', its sign). Every row below holds
// exactly one irrep, which projectRow's check on the characters confirms (rowCheck)
export type PermutationRule =
  | { readonly kind: 'none' }
  | { readonly kind: 'trivial' }
  | { readonly kind: 'sign' }
  | { readonly kind: 'standard' }
  | { readonly kind: 'swap'; readonly axes: readonly [number, number]; readonly sign: number }

export type Row = {
  readonly irrep: Irrep
  // +1 even, -1 odd under x_i -> -x_i
  readonly parity: readonly [number, number, number]
  readonly permutation: PermutationRule
  // a start function's angular factor
  readonly angular: (x: number, y: number, z: number) => number
}

export const ROWS: Record<string, Row> = {
  A1g: { irrep: 'A1g', parity: [1, 1, 1], permutation: { kind: 'trivial' }, angular: () => 1 },
  A2g: { irrep: 'A2g', parity: [1, 1, 1], permutation: { kind: 'sign' }, angular: (x, y, z) => (x * x - y * y) * (y * y - z * z) * (z * z - x * x) },
  Eg: { irrep: 'Eg', parity: [1, 1, 1], permutation: { kind: 'standard' }, angular: (x, y, z) => 2 * z * z - x * x - y * y },
  T1g: { irrep: 'T1g', parity: [1, -1, -1], permutation: { kind: 'swap', axes: [1, 2], sign: -1 }, angular: (x, y, z) => y * z * (y * y - z * z) },
  T2g: { irrep: 'T2g', parity: [1, -1, -1], permutation: { kind: 'swap', axes: [1, 2], sign: 1 }, angular: (x, y, z) => y * z },
  A1u: { irrep: 'A1u', parity: [-1, -1, -1], permutation: { kind: 'sign' }, angular: (x, y, z) => x * y * z * (x * x - y * y) * (y * y - z * z) * (z * z - x * x) },
  A2u: { irrep: 'A2u', parity: [-1, -1, -1], permutation: { kind: 'trivial' }, angular: (x, y, z) => x * y * z },
  Eu: { irrep: 'Eu', parity: [-1, -1, -1], permutation: { kind: 'standard' }, angular: (x, y, z) => x * y * z * (2 * z * z - x * x - y * y) },
  T1u: { irrep: 'T1u', parity: [-1, 1, 1], permutation: { kind: 'swap', axes: [1, 2], sign: 1 }, angular: x => x },
  T2u: { irrep: 'T2u', parity: [-1, 1, 1], permutation: { kind: 'swap', axes: [1, 2], sign: -1 }, angular: (x, y, z) => x * (y * y - z * z) },
}

const PERMUTATIONS: readonly (readonly number[])[] = [
  [0, 1, 2],
  [1, 2, 0],
  [2, 0, 1],
  [1, 0, 2],
  [0, 2, 1],
  [2, 1, 0],
]

// project v into the row, in place (scratch arrays of the same size are passed in)
export function projectRow(row: Row, v: Float64Array, side: number, scratch: Float64Array, sum: Float64Array): void {
  // the parities: v <- (v + p_i sigma_i v) / 2 for each axis
  for (let axis = 0; axis < 3; axis++) {
    const g: Signed = { perm: [0, 1, 2], sign: [axis === 0 ? -1 : 1, axis === 1 ? -1 : 1, axis === 2 ? -1 : 1] }
    const p = row.parity[axis]!

    // 0: the row keeps no parity on this axis (a field that breaks the reflection)
    if (p === 0) {
      continue
    }

    actOn(g, v, side, scratch)

    for (let i = 0; i < v.length; i++) {
      v[i] = (v[i]! + p * scratch[i]!) / 2
    }
  }

  const rule = row.permutation
  const swapInto = (axes: readonly [number, number], sign: number): void => {
    const perm = [0, 1, 2]

    perm[axes[0]] = axes[1]
    perm[axes[1]] = axes[0]
    actOn({ perm, sign: [1, 1, 1] }, v, side, scratch)

    for (let i = 0; i < v.length; i++) {
      v[i] = (v[i]! + sign * scratch[i]!) / 2
    }
  }

  if (rule.kind === 'none') {
    return
  }

  if (rule.kind === 'swap') {
    swapInto(rule.axes, rule.sign)

    return
  }

  // the S3 average with the trivial or the sign character
  const average = (signed: boolean): void => {
    sum.fill(0)

    PERMUTATIONS.forEach((perm, j) => {
      const chi = signed && j >= 3 ? -1 : 1

      actOn({ perm, sign: [1, 1, 1] }, v, side, scratch)

      for (let i = 0; i < v.length; i++) {
        sum[i] = sum[i]! + chi * scratch[i]!
      }
    })

    for (let i = 0; i < v.length; i++) {
      sum[i] = sum[i]! / 6
    }
  }

  if (rule.kind === 'trivial' || rule.kind === 'sign') {
    average(rule.kind === 'sign')
    v.set(sum)

    return
  }

  // standard: symmetric under the swap of axes 0 and 1 (which removes the sign part), then the trivial part
  // removed
  swapInto([0, 1], 1)
  average(false)

  for (let i = 0; i < v.length; i++) {
    v[i] = v[i]! - sum[i]!
  }
}

// how much of v lies in the irrep by the full character projector (1 for a vector in the row), the check
// that a row's rule holds exactly one irrep
export function irrepWeight(irrep: Irrep, v: Float64Array, side: number): number {
  const scratch = new Float64Array(v.length)
  const sum = new Float64Array(v.length)
  const d = IRREP_DIMENSION[irrep]

  for (const g of OH) {
    const chi = character(irrep, g)

    if (chi === 0) {
      continue
    }

    actOn(g, v, side, scratch)

    for (let i = 0; i < v.length; i++) {
      sum[i] = sum[i]! + ((d / 48) * chi) * scratch[i]!
    }
  }

  return dot(sum, v) / dot(v, v)
}

// ---------------------------------------------------------------------------------------------------------
// the Hamiltonian and its solver

export type Atom = {
  readonly kind: AtomKind
  readonly side: number
  // the Bohr radius in docks, and the coupling and Rydberg it sets
  readonly a: number
  readonly alpha: number
  readonly rydberg: number
  readonly band: Float64Array
  readonly potential: Float64Array
  // FFT scratch
  readonly re: Float64Array
  readonly im: Float64Array
}

const BANDS = new Map<string, Float64Array>()

// the height of the spherical wall, far above the band top (4 pi / 3 on the husk, 2 pi on the control)
export const WALL_HEIGHT = 40

// an atom on a side^3 torus; with `wall`, every dock farther than `wall` from the source is raised to
// WALL_HEIGHT, a spherical cavity whose only anisotropy is the lattice sphere's own, so that a confinement
// shift is the same for every row of one l, where the torus's cube is not
export function makeAtom(input: { kind: AtomKind; side: number; a: number; potential?: Float64Array; wall?: number }): Atom {
  const { kind, side, a } = input
  const alpha = 1 / (kind.mass * a)
  const key = `${kind.lattice}:${side}`
  let band = BANDS.get(key)

  if (!band) {
    band = kindBandGrid(kind, side)
    BANDS.set(key, band)
  }

  const potential = input.potential ?? coulombBox(kind, side, alpha)

  if (input.wall !== undefined) {
    const h = side / 2

    for (let z = 0; z < side; z++) {
      for (let y = 0; y < side; y++) {
        for (let x = 0; x < side; x++) {
          if (Math.hypot(x - h, y - h, z - h) > input.wall) {
            potential[x + side * (y + side * z)] = WALL_HEIGHT
          }
        }
      }
    }
  }

  return {
    kind,
    side,
    a,
    alpha,
    rydberg: 1 / (2 * kind.mass * a * a),
    band,
    potential,
    re: new Float64Array(side ** 3),
    im: new Float64Array(side ** 3),
  }
}

// out = f(p) x and out2 = f(p) y for a real even multiplier f on the FFT grid, two real vectors at once
function applyMultiplier(atom: Atom, f: (i: number) => number, x: Float64Array, y: Float64Array | undefined, out: Float64Array, out2: Float64Array | undefined): void {
  const { re, im, side } = atom

  re.set(x)

  if (y) {
    im.set(y)
  } else {
    im.fill(0)
  }

  fft3(re, im, side, false)

  for (let i = 0; i < re.length; i++) {
    const m = f(i)

    re[i] = re[i]! * m
    im[i] = im[i]! * m
  }

  fft3(re, im, side, true)
  out.set(re)

  if (out2) {
    out2.set(im)
  }
}

// H v for one or two vectors
export function applyH(atom: Atom, x: Float64Array, out: Float64Array, y?: Float64Array, out2?: Float64Array): void {
  const band = atom.band

  applyMultiplier(atom, i => band[i]!, x, y, out, out2)

  const v = atom.potential

  for (let i = 0; i < x.length; i++) {
    out[i] = out[i]! + v[i]! * x[i]!
  }

  if (y && out2) {
    for (let i = 0; i < y.length; i++) {
      out2[i] = out2[i]! + v[i]! * y[i]!
    }
  }
}

export function dot(a: Float64Array, b: Float64Array): number {
  let s = 0

  for (let i = 0; i < a.length; i++) {
    s += a[i]! * b[i]!
  }

  return s
}

export type Levels = {
  readonly values: number[]
  readonly vectors: Float64Array[]
  readonly residuals: number[]
  readonly iterations: number
}

// the lowest `count` levels of H in one row, by block LOBPCG with the kinetic preconditioner. Starts are
// r^j e^(-r / (scale a)) times the row's angular factor, j = 0, 1, ..., fixed functions of position
export function lowestLevels(input: {
  atom: Atom
  row: Row
  count: number
  extra?: number
  tolerance?: number
  maxIterations?: number
  scale?: number
  onIteration?: (iteration: number, values: number[], residuals: number[]) => void
}): Levels {
  const { atom, row, count } = input
  const extra = input.extra ?? 2
  const b = count + extra
  const tolerance = input.tolerance ?? 1e-7
  const maxIterations = input.maxIterations ?? 400
  const side = atom.side
  const size = side ** 3
  const h = side / 2
  const scratch = new Float64Array(size)
  const sum = new Float64Array(size)
  const shift = Math.max(atom.rydberg, 1e-4)
  const precondition = (i: number): number => 1 / (atom.band[i]! + shift)

  let X: Float64Array[] = []

  for (let j = 0; j < b; j++) {
    const v = new Float64Array(size)
    const scale = (input.scale ?? 1.5) * atom.a * (1 + j)

    for (let z = 0; z < side; z++) {
      for (let y = 0; y < side; y++) {
        for (let x = 0; x < side; x++) {
          const r = Math.hypot(x - h, y - h, z - h)

          v[x + side * (y + side * z)] = row.angular(x - h, y - h, z - h) * r ** j * Math.exp(-r / scale)
        }
      }
    }

    projectRow(row, v, side, scratch, sum)
    X.push(v)
  }

  X = orthonormal(X)

  const apply = (vs: Float64Array[]): Float64Array[] => {
    const out = vs.map(() => new Float64Array(size))

    for (let j = 0; j < vs.length; j += 2) {
      applyH(atom, vs[j]!, out[j]!, vs[j + 1], out[j + 1])
    }

    return out
  }

  let HX = apply(X)
  let P: Float64Array[] = []
  let HP: Float64Array[] = []
  let values: number[] = []
  let residuals: number[] = []
  let iterations = 0

  for (let it = 0; it < maxIterations; it++) {
    iterations = it + 1

    // Rayleigh-Ritz on X alone gives the current values
    values = X.map((x, j) => dot(x, HX[j]!))

    const R = X.map((x, j) => {
      const r = new Float64Array(size)
      const hx = HX[j]!
      const lambda = values[j]!

      for (let i = 0; i < size; i++) {
        r[i] = hx[i]! - lambda * x[i]!
      }

      return r
    })

    residuals = R.map(r => Math.sqrt(dot(r, r)))
    input.onIteration?.(iterations, values, residuals)

    if (residuals.slice(0, count).every(r => r < tolerance)) {
      break
    }

    // precondition and re-project the residuals
    const W: Float64Array[] = []

    for (let j = 0; j < b; j += 2) {
      const w1 = new Float64Array(size)
      const w2 = new Float64Array(size)

      applyMultiplier(atom, precondition, R[j]!, R[j + 1], w1, j + 1 < b ? w2 : undefined)
      projectRow(row, w1, side, scratch, sum)
      W.push(w1)

      if (j + 1 < b) {
        projectRow(row, w2, side, scratch, sum)
        W.push(w2)
      }
    }

    // unit W and P columns keep the trial space's Gram matrix well conditioned as the residuals shrink
    for (const v of [...W, ...P]) {
      const n = Math.sqrt(dot(v, v))

      if (n > 0) {
        const f = 1 / n

        for (let i = 0; i < size; i++) {
          v[i] = v[i]! * f
        }

        const j = P.indexOf(v)

        if (j >= 0) {
          const hp = HP[j]!

          for (let i = 0; i < size; i++) {
            hp[i] = hp[i]! * f
          }
        }
      }
    }

    const HW = apply(W)
    const S = [...X, ...W, ...P]
    const HS = [...HX, ...HW, ...HP]
    const m = S.length
    // the Gram and H matrices of the trial space
    const gram = new Float64Array(m * m)
    const ham = new Float64Array(m * m)

    for (let i = 0; i < m; i++) {
      for (let j = i; j < m; j++) {
        const g = dot(S[i]!, S[j]!)
        const hh = (dot(S[i]!, HS[j]!) + dot(S[j]!, HS[i]!)) / 2

        gram[i * m + j] = g
        gram[j * m + i] = g
        ham[i * m + j] = hh
        ham[j * m + i] = hh
      }
    }

    // orthonormal basis of the trial space from the Gram eigen decomposition, dropping near-null directions
    const ge = eigenSymmetricSmall(gram, m)
    const top = Math.max(...Array.from(ge.values))
    const keep: number[] = []

    for (let c = 0; c < m; c++) {
      if (ge.values[c]! > 1e-12 * top) {
        keep.push(c)
      }
    }

    const k = keep.length
    const B = new Float64Array(m * k)

    keep.forEach((c, a) => {
      const f = 1 / Math.sqrt(ge.values[c]!)

      for (let i = 0; i < m; i++) {
        B[i * k + a] = ge.vectors[i * m + c]! * f
      }
    })

    const reduced = new Float64Array(k * k)

    for (let a = 0; a < k; a++) {
      for (let c = 0; c < k; c++) {
        let s = 0

        for (let i = 0; i < m; i++) {
          for (let j = 0; j < m; j++) {
            s += B[i * k + a]! * ham[i * m + j]! * B[j * k + c]!
          }
        }

        reduced[a * k + c] = s
      }
    }

    const re = eigenSymmetricSmall(reduced, k)
    // coefficients of the lowest b Ritz vectors in terms of S
    const coef = new Float64Array(m * b)

    for (let col = 0; col < b; col++) {
      for (let i = 0; i < m; i++) {
        let s = 0

        for (let a = 0; a < k; a++) {
          s += B[i * k + a]! * re.vectors[a * k + col]!
        }

        coef[i * b + col] = s
      }
    }

    const combine = (vs: Float64Array[], from: number, col: number): Float64Array => {
      const out = new Float64Array(size)

      for (let i = from; i < m; i++) {
        const c = coef[i * b + col]!

        if (c === 0) {
          continue
        }

        const v = vs[i]!

        for (let x = 0; x < size; x++) {
          out[x] = out[x]! + c * v[x]!
        }
      }

      return out
    }

    const newX: Float64Array[] = []
    const newHX: Float64Array[] = []
    const newP: Float64Array[] = []
    const newHP: Float64Array[] = []

    for (let col = 0; col < b; col++) {
      newX.push(combine(S, 0, col))
      newHX.push(combine(HS, 0, col))
      newP.push(combine(S, b, col))
      newHP.push(combine(HS, b, col))
    }

    X = newX
    HX = newHX
    P = newP
    HP = newHP

    // renormalize (the Ritz vectors are orthonormal in exact arithmetic)
    for (let j = 0; j < b; j++) {
      const n = Math.sqrt(dot(X[j]!, X[j]!))

      for (let i = 0; i < size; i++) {
        X[j]![i] = X[j]![i]! / n
        HX[j]![i] = HX[j]![i]! / n
      }
    }
  }

  const order = values.map((v, j) => j).sort((p, q) => values[p]! - values[q]!)

  return {
    values: order.slice(0, count).map(j => values[j]!),
    vectors: order.slice(0, count).map(j => X[j]!),
    residuals: order.slice(0, count).map(j => residuals[j]!),
    iterations,
  }
}

// an orthonormal basis of the multiplet a level's vector spans under O_h: the 48 images, Gram-Schmidt with
// the images already in the span dropped (its size is the irrep's dimension)
export function multipletBasis(v: Float64Array, side: number): Float64Array[] {
  const out: Float64Array[] = []
  const image = new Float64Array(v.length)

  for (const g of OH) {
    actOn(g, v, side, image)

    const w = Float64Array.from(image)

    for (let pass = 0; pass < 2; pass++) {
      for (const u of out) {
        const c = dot(u, w)

        for (let i = 0; i < w.length; i++) {
          w[i] = w[i]! - c * u[i]!
        }
      }
    }

    const n = Math.sqrt(dot(w, w))

    if (n > 1e-6) {
      for (let i = 0; i < w.length; i++) {
        w[i] = w[i]! / n
      }

      out.push(w)
    }
  }

  return out
}

// Gram-Schmidt, twice
export function orthonormal(vs: Float64Array[]): Float64Array[] {
  const out: Float64Array[] = []

  for (const v0 of vs) {
    const v = Float64Array.from(v0)

    for (let pass = 0; pass < 2; pass++) {
      for (const u of out) {
        const c = dot(u, v)

        for (let i = 0; i < v.length; i++) {
          v[i] = v[i]! - c * u[i]!
        }
      }
    }

    const n = Math.sqrt(dot(v, v))

    for (let i = 0; i < v.length; i++) {
      v[i] = v[i]! / n
    }

    out.push(v)
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// observables

// <r> and <r^2> of a state about the source, and the chance beyond radius `edge`
export function radial(side: number, v: Float64Array, edge = side / 2 - 2): { meanR: number; meanR2: number; beyond: number } {
  const h = side / 2
  let total = 0
  let r1 = 0
  let r2 = 0
  let beyond = 0

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const p = v[x + side * (y + side * z)]! ** 2
        const r = Math.hypot(x - h, y - h, z - h)

        total += p
        r1 += p * r
        r2 += p * r * r

        if (r > edge) {
          beyond += p
        }
      }
    }
  }

  return { meanR: r1 / total, meanR2: r2 / total, beyond: beyond / total }
}

// <u | x_axis | v> about the source
export function positionElement(side: number, u: Float64Array, v: Float64Array, axis: number): number {
  const h = side / 2
  let s = 0

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const i = x + side * (y + side * z)
        const c = axis === 0 ? x - h : axis === 1 ? y - h : z - h

        s += u[i]! * c * v[i]!
      }
    }
  }

  return s
}

// ---------------------------------------------------------------------------------------------------------
// the band stand-in's own beat: psi <- e^(-i T(p)) e^(-i V(x)) psi, the band-projected token run in time (the
// kinetic step by FFT, exact per beat; the potential's phase at every dock)

export type BandWalk = {
  readonly side: number
  readonly kineticCos: Float64Array
  readonly kineticSin: Float64Array
  readonly potentialCos: Float64Array
  readonly potentialSin: Float64Array
}

export function makeBandWalk(input: { kind: AtomKind; side: number; potential: Float64Array }): BandWalk {
  const band = kindBandGrid(input.kind, input.side)

  return {
    side: input.side,
    kineticCos: Float64Array.from(band, Math.cos),
    kineticSin: Float64Array.from(band, e => -Math.sin(e)),
    potentialCos: Float64Array.from(input.potential, Math.cos),
    potentialSin: Float64Array.from(input.potential, v => -Math.sin(v)),
  }
}

// one beat in place on (re, im)
export function bandBeat(walk: BandWalk, re: Float64Array, im: Float64Array): void {
  const { potentialCos: pc, potentialSin: ps, kineticCos: kc, kineticSin: ks } = walk

  for (let i = 0; i < re.length; i++) {
    const r = re[i]!
    const m = im[i]!

    re[i] = r * pc[i]! - m * ps[i]!
    im[i] = r * ps[i]! + m * pc[i]!
  }

  fft3(re, im, walk.side, false)

  for (let i = 0; i < re.length; i++) {
    const r = re[i]!
    const m = im[i]!

    re[i] = r * kc[i]! - m * ks[i]!
    im[i] = r * ks[i]! + m * kc[i]!
  }

  fft3(re, im, walk.side, true)
}

// the chance-weighted mean offset from the torus center of a complex field
export function centerOf(side: number, re: Float64Array, im: Float64Array): number[] {
  const h = side / 2
  const out = [0, 0, 0]
  let total = 0

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const i = x + side * (y + side * z)
        const p = re[i]! ** 2 + im[i]! ** 2

        total += p
        out[0] = out[0]! + p * (x - h)
        out[1] = out[1]! + p * (y - h)
        out[2] = out[2]! + p * (z - h)
      }
    }
  }

  return out.map(v => v / total)
}

// the gradient of a band at any k, by a symmetric difference
export function bandGradientAt(band: (k: readonly number[]) => number, k: readonly number[], step = 1e-5): number[] {
  return k.map((_, a) => {
    const up = k.map((x, b) => (a === b ? x + step : x))
    const down = k.map((x, b) => (a === b ? x - step : x))

    return (band(up) - band(down)) / (2 * step)
  })
}

// One tone in a series: the least-squares fit of y(t) = c + d t + A cos(W t) + B sin(W t), W by golden-section
// search in [low, high] on the residual. Returns W, the amplitude sqrt(A^2 + B^2) and the rms residual
export function refineTone(series: ArrayLike<number>, low: number, high: number): { omega: number; amplitude: number; residual: number } {
  const n = series.length
  const fit = (w: number): { amplitude: number; residual: number } => {
    // normal equations for [1, t, cos, sin]
    const basis = (t: number): number[] => [1, t / n, Math.cos(w * t), Math.sin(w * t)]
    const m = [0, 1, 2, 3].map(() => [0, 0, 0, 0])
    const r = [0, 0, 0, 0]

    for (let t = 0; t < n; t++) {
      const b = basis(t)

      for (let i = 0; i < 4; i++) {
        r[i] = r[i]! + b[i]! * (series[t] ?? 0)

        for (let j = 0; j < 4; j++) {
          m[i]![j] = m[i]![j]! + b[i]! * b[j]!
        }
      }
    }

    // Gaussian elimination
    for (let i = 0; i < 4; i++) {
      let pivot = i

      for (let j = i + 1; j < 4; j++) {
        if (Math.abs(m[j]![i]!) > Math.abs(m[pivot]![i]!)) {
          pivot = j
        }
      }

      ;[m[i], m[pivot]] = [m[pivot]!, m[i]!]
      ;[r[i], r[pivot]] = [r[pivot]!, r[i]!]

      for (let j = i + 1; j < 4; j++) {
        const f = m[j]![i]! / m[i]![i]!

        for (let k = i; k < 4; k++) {
          m[j]![k] = m[j]![k]! - f * m[i]![k]!
        }

        r[j] = r[j]! - f * r[i]!
      }
    }

    const x = [0, 0, 0, 0]

    for (let i = 3; i >= 0; i--) {
      let s = r[i]!

      for (let k = i + 1; k < 4; k++) {
        s -= m[i]![k]! * x[k]!
      }

      x[i] = s / m[i]![i]!
    }

    let residual = 0

    for (let t = 0; t < n; t++) {
      const b = basis(t)
      const e = (series[t] ?? 0) - b.reduce((s, v, i) => s + v * x[i]!, 0)

      residual += e * e
    }

    return { amplitude: Math.hypot(x[2]!, x[3]!), residual: Math.sqrt(residual / n) }
  }

  let a = low
  let b = high
  const g = (Math.sqrt(5) - 1) / 2

  for (let it = 0; it < 80; it++) {
    const c = b - g * (b - a)
    const d = a + g * (b - a)

    if (fit(c).residual < fit(d).residual) {
      b = d
    } else {
      a = c
    }
  }

  const omega = (a + b) / 2

  return { omega, ...fit(omega) }
}

// the continuum hydrogen energy of shell n in Rydbergs
export function hydrogenLevel(n: number): number {
  return -1 / (n * n)
}

// THE FIRST LATTICE CORRECTION, derived. The line's band is e1(q) = q^2 / (2 sqrt 3) - q^4 / (12 sqrt 3) + O(q^6)
// (expand cos(pi / 3 + e) = cos(q) / 2 twice), and on the husk (1/6) sum_h w_h (k . u_h)^4 = |k|^4 exactly, so
// T(k) = k^2 / (2 m) - k^4 / (12 sqrt 3): the relativistic -p^4 / (8 m^3 c^2) with m = sqrt 3 and c^2 = 1/2.
// First order in it, with hydrogen's <p^4>, gives the fine-structure form (no spin)
//   Delta E_nl / Ry = -(4 n / (l + 1/2) - 3) / (6 a^2 n^4)
// The lattice Coulomb potential's first correction is a contact term (1 / lambda(k) = (1 / 6k^2)(1 + k^2 / 12
// + ...) on the husk: a delta function), which moves only l = 0. So for l >= 1 this is the whole first-order
// prediction, with no fitted number in it
export function kineticShift(n: number, l: number, a: number): number {
  return -((4 * n) / (l + 0.5) - 3) / (6 * a * a * n ** 4)
}

// the continuum mean radius <r>_nl = (a / 2)(3 n^2 - l (l + 1))
export function hydrogenRadius(n: number, l: number, a: number): number {
  return (a / 2) * (3 * n * n - l * (l + 1))
}

// the quantum defect of a level: E = -Ry / (n - delta)^2
export function quantumDefect(n: number, energyOverRydberg: number): number {
  return n - 1 / Math.sqrt(-energyOverRydberg)
}
