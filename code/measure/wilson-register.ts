// A WILSON MASS ON THE CLIFFORD REGISTER, AND THE HUSK AS A DOMAIN WALL (E-SPN-0166). E-SPN-0165 proved that at
// E-SPN-0160's uniform mass the bulk's second Chern number is 0 (the Dirac vector's 72 zeros have indices summing to 0,
// and the band's mass is the same M at every one), and named the escape: a mass that depends on the momentum, larger in
// magnitude and of the other sign at every zero but K = 0 (Wilson's), makes C2 = +-1 and puts one Weyl species per half
// on a boundary. This file builds that mass from pieces the rule already has, and the geometry to see its boundary.
//
// THE CONSTRUCTION. The two-beat cycle is U = T P2 T P1 with P = X G, and because X T X = T^dag and X commutes with Q_S
// and Q_D, U = T G2 T^dag G1 exactly (E-SPN-0159 point 1). E-SPN-0160 has G1 = 1 + (u - 1) Q_S, G2 = 1 + (conj u - 1) Q_D.
// A mixer v on Q_S placed in BEAT 2 sits between T^dag and T, so the singlet sees it only through the stream: at a zero
// of the Dirac vector the singlet's return amplitude is c(K) = <S| T |S> = (1 / 24) sum_r cos(K . r) = 1 - W(K) / 24,
// W the Wilson count. A mixer y on Q_D placed in BEAT 1 is seen by the partner the same way (in the conjugate cycle
// G1 T G2 T^dag), with the same factor: at a zero, Q_D T Q_D restricted to D is tr(J) / 48 = 1 - W / 24, J = sum eps r
// r^T. So v and y are a Wilson term: fully present at K = 0, absent at the twelve half-periods where W = 24, and
// weighted by c = -1/3, -1/6, -1/8 at the other doublers (W = 32, 28, 27).
//
//   mixerPiece          P = X (1 + sum_k (u_k - 1) q_k) for mutually orthogonal projectors q_k: the ring mixer on several
//                       sectors at once, after the swap coin (E-FRC-0258's chiralPiece is the two-sector case)
//   wilsonSchedule      beat 1: u on Q_S, y = u^2 on Q_D; beat 2: conj u on Q_D, v = conj u^2 on Q_S. At K = 0 the
//                       singlet then carries conj u and the partner u: the two exchange places, the mass inverted
//                       exactly; at the W = 24 half-periods they sit where E-SPN-0160 put them. Optionally the Wilson
//                       mixers act on one chiral half only (q times P+), covariant under the rotations alone
//   unitaryEigen        eigenphases and orthonormal eigenvectors of a unitary, by the Cayley map to a Hermitian matrix
//                       with the pole placed in the largest gap of the spectrum (degenerate eigenspaces come out
//                       orthonormal and complete, which inverse iteration does not give)
//
// DETERMINISM: no random numbers. EXACT: the projectors are integer or dyadic matrices and u, u^2, conj u^2 are ring
// units of Z[omega][1/42]; the spectra are floats, as measurement.

import { complexEigenvalues, complexEigenvector } from '@/code/algebra/linear/complex-eigen'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { wrap, type CMatrix } from '@/code/measure/dock-mixer'
import { MODES, matMul } from '@/code/measure/spinor-register'
import { OPPOSITE } from '@/code/rule/isometric-knit'

const REG = 8

export type Unit = readonly [number, number]
export type Mixer = { q: Float64Array; unit: Unit }

export const cmulUnit = (a: Unit, b: Unit): [number, number] => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
export const conjUnit = (a: Unit): [number, number] => [a[0], -a[1]]

// P = X (1 + sum_k (u_k - 1) q_k), row-major [to][from]; the q_k are the caller's (orthogonal projectors, checked in the
// experiment)
export function mixerPiece(mixers: readonly Mixer[]): CMatrix {
  const n = MODES
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    const from = (OPPOSITE[Math.floor(i / REG)] as number) * REG + (i % REG)

    re[i * n + from] = 1
    for (const m of mixers) {
      const a = m.unit[0] - 1
      const b = m.unit[1]

      for (let j = 0; j < n; j++) {
        const x = m.q[from * n + j] as number

        if (x === 0) continue
        re[i * n + j]! += a * x
        im[i * n + j]! += b * x
      }
    }
  }

  return { re, im }
}

export type WilsonOptions = {
  /** Put the Wilson mixers (y on Q_D in beat 1, v on Q_S in beat 2). Off, the schedule is E-SPN-0160's. */
  wilson: boolean
  /** When given, the Wilson mixers act on this chiral half only (the projector P+ or P-, a real matrix). */
  half?: Float64Array
  /**
   * The Wilson unit v on Q_S in beat 2 (y = conj v on Q_D in beat 1). Omitted, v = conj u^2, which inverts the rest
   * mass to exactly -M. In general the rest mass is m0 = -(M + arg v) (inverted when arg v < -M) while the doublers
   * keep M: Wilson's recipe, heavy doublers and a light member.
   */
  v?: Unit
}

// the two pieces of the schedule; u the member's ring unit (as a complex number)
export function wilsonSchedule(qS: Float64Array, qD: Float64Array, u: Unit, options: WilsonOptions): CMatrix[] {
  const ubar = conjUnit(u)

  if (!options.wilson) return [mixerPiece([{ q: qS, unit: u }]), mixerPiece([{ q: qD, unit: ubar }])]

  const v = options.v ? ([options.v[0], options.v[1]] as [number, number]) : cmulUnit(ubar, ubar)
  const y = conjUnit(v)
  const wS = options.half ? matMul(qS, options.half) : qS
  const wD = options.half ? matMul(qD, options.half) : qD

  if (!options.half) {
    return [
      mixerPiece([
        { q: qS, unit: u },
        { q: qD, unit: y },
      ]),
      mixerPiece([
        { q: qD, unit: ubar },
        { q: qS, unit: v },
      ]),
    ]
  }

  // on one half: Q_S and Q_D keep their E-SPN-0160 units, and the Wilson units multiply them on the half's part,
  // G1 = 1 + (u - 1) Q_S + (y - 1) Q_D P, G2 = 1 + (conj u - 1) Q_D + (v - 1) Q_S P; Q_S and Q_D P are orthogonal
  // projectors (P commutes with both), and so are Q_D and Q_S P
  return [
    mixerPiece([
      { q: qS, unit: u },
      { q: wD, unit: y },
    ]),
    mixerPiece([
      { q: qD, unit: ubar },
      { q: wS, unit: v },
    ]),
  ]
}

// ---- dense complex helpers ----

export type Dense = { re: Float64Array; im: Float64Array }

export function denseMul(a: Dense, b: Dense, n: number): Dense {
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ar = a.re[i * n + k] as number
      const ai = a.im[i * n + k] as number

      if (ar === 0 && ai === 0) continue
      for (let j = 0; j < n; j++) {
        const br = b.re[k * n + j] as number
        const bi = b.im[k * n + j] as number

        re[i * n + j]! += ar * br - ai * bi
        im[i * n + j]! += ar * bi + ai * br
      }
    }
  }

  return { re, im }
}

// X = A^-1 B for n x n complex matrices, Gaussian elimination with partial pivoting
export function denseSolve(A: Dense, B: Dense, n: number): Dense {
  const w = 2 * n
  const mr = new Float64Array(n * w)
  const mi = new Float64Array(n * w)

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      mr[r * w + c] = A.re[r * n + c] as number
      mi[r * w + c] = A.im[r * n + c] as number
      mr[r * w + n + c] = B.re[r * n + c] as number
      mi[r * w + n + c] = B.im[r * n + c] as number
    }
  }

  for (let c = 0; c < n; c++) {
    let p = c

    for (let r = c + 1; r < n; r++) if (Math.hypot(mr[r * w + c] as number, mi[r * w + c] as number) > Math.hypot(mr[p * w + c] as number, mi[p * w + c] as number)) p = r
    if (p !== c) {
      for (let k = 0; k < w; k++) {
        const tr = mr[c * w + k] as number
        const ti = mi[c * w + k] as number

        mr[c * w + k] = mr[p * w + k] as number
        mi[c * w + k] = mi[p * w + k] as number
        mr[p * w + k] = tr
        mi[p * w + k] = ti
      }
    }

    const pr = mr[c * w + c] as number
    const pi = mi[c * w + c] as number
    const den = pr * pr + pi * pi

    for (let r = 0; r < n; r++) {
      if (r === c) continue

      const ar = mr[r * w + c] as number
      const ai = mi[r * w + c] as number

      if (ar === 0 && ai === 0) continue

      const fr = (ar * pr + ai * pi) / den
      const fi = (ai * pr - ar * pi) / den

      for (let k = c; k < w; k++) {
        const xr = mr[c * w + k] as number
        const xi = mi[c * w + k] as number

        mr[r * w + k]! -= fr * xr - fi * xi
        mi[r * w + k]! -= fr * xi + fi * xr
      }
    }
  }

  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let r = 0; r < n; r++) {
    const pr = mr[r * w + r] as number
    const pi = mi[r * w + r] as number
    const den = pr * pr + pi * pi

    for (let c = 0; c < n; c++) {
      const xr = mr[r * w + n + c] as number
      const xi = mi[r * w + n + c] as number

      re[r * n + c] = (xr * pr + xi * pi) / den
      im[r * n + c] = (xi * pr - xr * pi) / den
    }
  }

  return { re, im }
}

// ---- the eigenvectors of a unitary ----

export type UnitaryEigen = { phases: number[]; vre: Float64Array; vim: Float64Array; n: number; cut: number }

// the midpoint of the largest gap between the sorted eigenphases
export function largestGapMidpoint(phases: readonly number[]): number {
  const s = [...phases].sort((a, b) => a - b)
  let best = -1
  let mid = 0

  for (let i = 0; i < s.length; i++) {
    const a = s[i] as number
    const b = i + 1 < s.length ? (s[i + 1] as number) : (s[0] as number) + 2 * Math.PI
    const g = b - a

    if (g > best) {
      best = g
      mid = a + g / 2
    }
  }

  return wrap(mid)
}

// eigenphases and eigenvectors (columns: vector k is [a * n + k]) of a unitary U, by the Cayley map H = i (1 - V) (1 +
// V)^-1, V = exp(-i (cut - pi)) U, whose pole is at the eigenphase `cut` (placed in the largest gap). H is Hermitian and
// commutes with U; its eigenvalue lambda gives the phase cut - pi + 2 atan(lambda)
export function unitaryEigen(U: Dense, n: number): UnitaryEigen {
  const e = complexEigenvalues({ re: U.re, im: U.im, n })
  const cut = largestGapMidpoint(e.re.map((x, i) => Math.atan2(e.im[i] as number, x)))
  const phi0 = cut - Math.PI
  const c = Math.cos(phi0)
  const s = Math.sin(phi0)
  // V = exp(-i phi0) U
  const Vre = new Float64Array(n * n)
  const Vim = new Float64Array(n * n)

  for (let i = 0; i < n * n; i++) {
    const ur = U.re[i] as number
    const ui = U.im[i] as number

    Vre[i] = c * ur + s * ui
    Vim[i] = c * ui - s * ur
  }

  // H = i (1 - V) (1 + V)^-1: solve (1 + V)^T-free form: H = i (1 + V)^-1 (1 - V) (they commute)
  const onePlus: Dense = { re: Vre.map((x, i) => x + (i % (n + 1) === 0 ? 1 : 0)), im: Vim.slice() }
  const oneMinus: Dense = { re: Vre.map((x, i) => -x + (i % (n + 1) === 0 ? 1 : 0)), im: Vim.map(x => -x) }
  const X = denseSolve(onePlus, oneMinus, n)
  const M = makeComplexMatrix({ rows: n, cols: n })

  // H = i X, symmetrized
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const hr = -(X.im[i * n + j] as number)
      const hi = X.re[i * n + j] as number
      const hrT = -(X.im[j * n + i] as number)
      const hiT = X.re[j * n + i] as number

      M.re[i * n + j] = (hr + hrT) / 2
      M.im[i * n + j] = (hi - hiT) / 2
    }
  }

  const eig = eigHermitian({ matrix: M })
  const phases = Array.from(eig.values, lam => wrap(phi0 + 2 * Math.atan(lam)))

  return { phases, vre: eig.vectorsRe, vim: eig.vectorsIm, n, cut }
}

// the weight <v| Q |v> of eigenvector k on a real symmetric projector Q
export function weightOn(e: UnitaryEigen, k: number, Q: Float64Array): number {
  const n = e.n
  let s = 0

  for (let i = 0; i < n; i++) {
    const xr = e.vre[i * n + k] as number
    const xi = e.vim[i * n + k] as number

    for (let j = 0; j < n; j++) {
      const q = Q[i * n + j] as number

      if (q === 0) continue
      s += q * (xr * (e.vre[j * n + k] as number) + xi * (e.vim[j * n + k] as number))
    }
  }

  return s
}

export type PhaseCluster = { phase: number; size: number; weight: number }

// the eigenphases grouped into clusters (neighbors within tol, on the circle), each with the total weight of a projector
// Q summed over the cluster's eigenvectors: a basis-free reading, since inside a degenerate eigenspace any orthonormal
// basis gives the same sum
export function clusterWeights(e: UnitaryEigen, Q: Float64Array, tol = 1e-8): PhaseCluster[] {
  const order = e.phases.map((p, k) => ({ p, k })).sort((a, b) => a.p - b.p)
  const out: { phase: number; size: number; weight: number; ks: number[] }[] = []

  for (const { p, k } of order) {
    const last = out[out.length - 1]

    if (last && Math.abs(wrap(p - (last.phase as number))) <= tol) {
      last.ks.push(k)
      last.size++
    } else out.push({ phase: p, size: 1, weight: 0, ks: [k] })
  }

  // join the last cluster to the first across the cut at +-pi
  if (out.length > 1) {
    const first = out[0] as { phase: number; size: number; ks: number[] }
    const last = out[out.length - 1] as { phase: number; size: number; ks: number[] }

    if (Math.abs(wrap(first.phase - last.phase)) <= tol) {
      first.ks.push(...last.ks)
      first.size += last.size
      out.pop()
    }
  }

  return out.map(c => ({ phase: c.phase, size: c.size, weight: c.ks.reduce((s, k) => s + weightOn(e, k, Q), 0) }))
}

// ---- the slab: a supercell along the depth x3, with an optional magnetic supercell along x0 ----
//
// Classes (a, c): a = x0 mod qa, c = x3 mod L. The class representative is (a, (a + c) mod 2, 0, c), a D4 point. A hop
// by the root r from class (a, c) lands in ((a + r0) mod qa, (c + r3) mod L) and carries the Bloch phase exp(-i K .
// (rep + r - rep')) on the translation sublattice {t in D4 : t0 = 0 mod qa, t3 = 0 mod L}, and the Peierls phase of the
// uniform field F01 = B = 2 pi p / qa in the Landau gauge A1 = B x0, B r1 (a + r0 / 2) (E-SPN-0165's). Each depth class
// uses one of several piece sets (the profile), so a slab can be half one schedule and half another: two domain walls.
//
// THE REDUCTION. U = T P2 T P1 = T G2 T^dag G1, and every G acts only on Q_S and Q_D of each class, so a vector
// orthogonal to S, D, T S and T D (every class) is fixed: U y = y. So U is the identity on the complement of W =
// span{S_c, D_c, T S_c, T D_c}, and W is invariant; the whole non-flat spectrum is U restricted to W, at most 16
// dimensions a class in a half. The leak |(1 - B B^dag) U B| is returned and gated.

const SLOTS = 24
const HALF_REG = 4
const HALF_MODES = SLOTS * HALF_REG

export type Slab = {
  /** Depth classes along x3 (the supercell's period in x3). */
  L: number
  /** Classes along x0 (1 with no magnetic field). */
  qa: number
  /** The flux count p of F01 = 2 pi p / qa. */
  p: number
  /** Which piece set each depth class uses (an index into the piece sets), length L. */
  profile: readonly number[]
  /** A pure-gauge phase per class (index a * L + c), or none: the control that a gauge change moves no level. */
  chi?: readonly number[]
}

export type HalfSet = { pieces: readonly CMatrix[] }

type Roots = readonly (readonly number[])[]

export const slabClasses = (s: Slab): number => s.qa * s.L

const rep = (a: number, c: number): number[] => [a, (a + c) % 2, 0, c]
const dot4 = (a: readonly number[], b: readonly number[]): number => a.reduce((s, x, k) => s + x * (b[k] as number), 0)

// the stream on the slab: every mode's target and phase (a permutation with phases)
export function slabStream(s: Slab, K: readonly number[], roots: Roots): { to: Int32Array; re: Float64Array; im: Float64Array } {
  const nc = slabClasses(s)
  const N = nc * HALF_MODES
  const B = (2 * Math.PI * s.p) / s.qa
  const to = new Int32Array(N)
  const re = new Float64Array(N)
  const im = new Float64Array(N)

  for (let a = 0; a < s.qa; a++) {
    for (let c = 0; c < s.L; c++) {
      const cls = a * s.L + c
      const p0 = rep(a, c)

      for (let d = 0; d < SLOTS; d++) {
        const r = roots[d] as readonly number[]
        const a2 = ((((a + (r[0] as number)) % s.qa) + s.qa) % s.qa) as number
        const c2 = ((((c + (r[3] as number)) % s.L) + s.L) % s.L) as number
        const p1 = rep(a2, c2)
        const disp = [0, 1, 2, 3].map(k => (p0[k] as number) + (r[k] as number) - (p1[k] as number))
        const cls2 = a2 * s.L + c2
        const gauge = s.chi ? (s.chi[cls2] as number) - (s.chi[cls] as number) : 0
        const phase = B * (r[1] as number) * (a + (r[0] as number) / 2) - dot4(K, disp) + gauge

        for (let x = 0; x < HALF_REG; x++) {
          const from = cls * HALF_MODES + d * HALF_REG + x

          to[from] = cls2 * HALF_MODES + d * HALF_REG + x
          re[from] = Math.cos(phase)
          im[from] = Math.sin(phase)
        }
      }
    }
  }

  return { to, re, im }
}

export type CVec = { re: Float64Array; im: Float64Array }

const newVec = (N: number): CVec => ({ re: new Float64Array(N), im: new Float64Array(N) })

function applyStreamTo(st: { to: Int32Array; re: Float64Array; im: Float64Array }, v: CVec): CVec {
  const out = newVec(v.re.length)

  for (let i = 0; i < v.re.length; i++) {
    const j = st.to[i] as number
    const cr = st.re[i] as number
    const ci = st.im[i] as number
    const xr = v.re[i] as number
    const xi = v.im[i] as number

    out.re[j] = cr * xr - ci * xi
    out.im[j] = cr * xi + ci * xr
  }

  return out
}

// the piece of each class (the class's depth c picks the set), applied block by block
function applyPiecesTo(s: Slab, sets: readonly HalfSet[], beat: number, v: CVec): CVec {
  const out = newVec(v.re.length)
  const m = HALF_MODES

  for (let a = 0; a < s.qa; a++) {
    for (let c = 0; c < s.L; c++) {
      const P = (sets[s.profile[c] as number] as HalfSet).pieces[beat] as CMatrix
      const off = (a * s.L + c) * m

      for (let i = 0; i < m; i++) {
        let yr = 0
        let yi = 0

        for (let j = 0; j < m; j++) {
          const pr = P.re[i * m + j] as number
          const pi = P.im[i * m + j] as number

          if (pr === 0 && pi === 0) continue

          const xr = v.re[off + j] as number
          const xi = v.im[off + j] as number

          yr += pr * xr - pi * xi
          yi += pr * xi + pi * xr
        }

        out.re[off + i] = yr
        out.im[off + i] = yi
      }
    }
  }

  return out
}

// U v = S P2 S P1 v, the class's own pieces
export function slabApply(s: Slab, sets: readonly HalfSet[], st: { to: Int32Array; re: Float64Array; im: Float64Array }, v: CVec): CVec {
  let x = v

  for (let beat = 0; beat < 2; beat++) x = applyStreamTo(st, applyPiecesTo(s, sets, beat, x))

  return x
}

export type SlabReduced = { U: Dense; d: number; basis: CVec[]; leak: number; N: number }

// the orthonormal basis of W (modified Gram-Schmidt, twice, dropping residuals below 1e-9) and U restricted to it
export function slabReduced(s: Slab, sets: readonly HalfSet[], K: readonly number[], roots: Roots, sRange: readonly (readonly number[])[], dRange: readonly (readonly number[])[]): SlabReduced {
  const nc = slabClasses(s)
  const N = nc * HALF_MODES
  const st = slabStream(s, K, roots)
  const gens: CVec[] = []

  for (let cls = 0; cls < nc; cls++) {
    for (const col of [...sRange, ...dRange]) {
      const v = newVec(N)

      col.forEach((x, i) => {
        v.re[cls * HALF_MODES + i] = x
      })
      gens.push(v)
      gens.push(applyStreamTo(st, v))
    }
  }

  const basis: CVec[] = []

  for (const g of gens) {
    const v = { re: Float64Array.from(g.re), im: Float64Array.from(g.im) }

    for (let pass = 0; pass < 2; pass++) {
      for (const b of basis) {
        let cr = 0
        let ci = 0

        for (let i = 0; i < N; i++) {
          const br = b.re[i] as number
          const bi = b.im[i] as number
          const xr = v.re[i] as number
          const xi = v.im[i] as number

          cr += br * xr + bi * xi
          ci += br * xi - bi * xr
        }

        if (cr === 0 && ci === 0) continue
        for (let i = 0; i < N; i++) {
          const br = b.re[i] as number
          const bi = b.im[i] as number

          v.re[i]! -= cr * br - ci * bi
          v.im[i]! -= cr * bi + ci * br
        }
      }
    }

    let norm = 0

    for (let i = 0; i < N; i++) norm += (v.re[i] as number) ** 2 + (v.im[i] as number) ** 2
    norm = Math.sqrt(norm)
    if (norm < 1e-9) continue
    for (let i = 0; i < N; i++) {
      v.re[i]! /= norm
      v.im[i]! /= norm
    }
    basis.push(v)
  }

  const d = basis.length
  const UB = basis.map(b => slabApply(s, sets, st, b))
  const U: Dense = { re: new Float64Array(d * d), im: new Float64Array(d * d) }
  let leak = 0

  for (let j = 0; j < d; j++) {
    const y = UB[j] as CVec
    const res = { re: Float64Array.from(y.re), im: Float64Array.from(y.im) }

    for (let i = 0; i < d; i++) {
      const b = basis[i] as CVec
      let cr = 0
      let ci = 0

      for (let k = 0; k < N; k++) {
        const br = b.re[k] as number
        const bi = b.im[k] as number
        const xr = y.re[k] as number
        const xi = y.im[k] as number

        cr += br * xr + bi * xi
        ci += br * xi - bi * xr
      }

      U.re[i * d + j] = cr
      U.im[i * d + j] = ci
      for (let k = 0; k < N; k++) {
        res.re[k]! -= cr * (b.re[k] as number) - ci * (b.im[k] as number)
        res.im[k]! -= cr * (b.im[k] as number) + ci * (b.re[k] as number)
      }
    }

    let r2 = 0

    for (let k = 0; k < N; k++) r2 += (res.re[k] as number) ** 2 + (res.im[k] as number) ** 2
    leak = Math.max(leak, Math.sqrt(r2))
  }

  return { U, d, basis, leak, N }
}

// the weight of the full vector B y on the depth classes in `depths`, for coefficient columns k of an eigen solution
export function depthWeight(s: Slab, red: SlabReduced, e: UnitaryEigen, k: number, depths: ReadonlySet<number>): number {
  const d = red.d
  let total = 0

  for (let a = 0; a < s.qa; a++) {
    for (const c of depths) {
      const off = (a * s.L + c) * HALF_MODES

      for (let i = 0; i < HALF_MODES; i++) {
        let xr = 0
        let xi = 0

        for (let j = 0; j < d; j++) {
          const yr = e.vre[j * d + k] as number
          const yi = e.vim[j * d + k] as number
          const b = red.basis[j] as CVec
          const br = b.re[off + i] as number
          const bi = b.im[off + i] as number

          xr += br * yr - bi * yi
          xi += br * yi + bi * yr
        }

        total += xr * xr + xi * xi
      }
    }
  }

  return total
}

// ---- the walls' Weyl content ----

export type WallReading = { states: number; chirality: number; speeds: number[]; split: number[] }

type Small = { re: number[]; im: number[] }

const innerFull = (a: CVec, b: CVec): [number, number] => {
  let r = 0
  let i = 0

  for (let k = 0; k < a.re.length; k++) {
    r += (a.re[k] as number) * (b.re[k] as number) + (a.im[k] as number) * (b.im[k] as number)
    i += (a.re[k] as number) * (b.im[k] as number) - (a.im[k] as number) * (b.re[k] as number)
  }

  return [r, i]
}

function smallMul(a: Small, b: Small, n: number): Small {
  const re = Array<number>(n * n).fill(0)
  const im = Array<number>(n * n).fill(0)

  for (let i = 0; i < n; i++) for (let k = 0; k < n; k++) for (let j = 0; j < n; j++) {
    re[i * n + j]! += (a.re[i * n + k] as number) * (b.re[k * n + j] as number) - (a.im[i * n + k] as number) * (b.im[k * n + j] as number)
    im[i * n + j]! += (a.re[i * n + k] as number) * (b.im[k * n + j] as number) + (a.im[i * n + k] as number) * (b.re[k * n + j] as number)
  }

  return { re, im }
}

// THE WALLS' WEYL CONTENT at husk k = 0. The in-gap states (|phase - pi| < window) are lifted to the full space and split
// between the walls by diagonalizing the depth projector on `aDepths` inside their span (eigenvalue above 1/2: wall A).
// For each wall, H_j = dH/dk_j along x0, x1, x2 by symmetric differences of H(k) = (M' - M'^dag) / 2i, M' = -<z| U(k) |z>
// (the phase measured from pi), U(k) the full slab cycle. The net chirality is Im tr(H0 H1 H2) / (2 v0 v1 v2), v_j the
// largest |eigenvalue| of H_j: for n copies of sigma . V k with V isotropic it is n sign det V, and it is basis-free
export function wallChirality(s: Slab, sets: readonly HalfSet[], roots: Roots, sRange: readonly (readonly number[])[], dRange: readonly (readonly number[])[], aDepths: ReadonlySet<number>, kStep: number, window: number): { inGap: number; weights: number[]; walls: WallReading[] } {
  const red = slabReduced(s, sets, [0, 0, 0, 0], roots, sRange, dRange)
  const e = unitaryEigen(red.U, red.d)
  const gapIdx = e.phases.map((p, k) => ({ p, k })).filter(x => Math.abs(wrap(x.p - Math.PI)) < window)
  const N = red.N
  const lift = (k: number): CVec => {
    const x: CVec = { re: new Float64Array(N), im: new Float64Array(N) }

    for (let j = 0; j < red.d; j++) {
      const yr = e.vre[j * red.d + k] as number
      const yi = e.vim[j * red.d + k] as number
      const b = red.basis[j] as CVec

      for (let i = 0; i < N; i++) {
        x.re[i]! += (b.re[i] as number) * yr - (b.im[i] as number) * yi
        x.im[i]! += (b.re[i] as number) * yi + (b.im[i] as number) * yr
      }
    }

    return x
  }
  const vecs = gapIdx.map(g => lift(g.k))
  const m = vecs.length
  const G = makeComplexMatrix({ rows: m, cols: m })
  const onA = (x: CVec): CVec => {
    const y: CVec = { re: new Float64Array(N), im: new Float64Array(N) }

    for (let a = 0; a < s.qa; a++) {
      for (const c of aDepths) {
        const off = (a * s.L + c) * HALF_MODES

        for (let i = 0; i < HALF_MODES; i++) {
          y.re[off + i] = x.re[off + i] as number
          y.im[off + i] = x.im[off + i] as number
        }
      }
    }

    return y
  }

  for (let a = 0; a < m; a++) {
    for (let b = 0; b < m; b++) {
      const [r, i] = innerFull(vecs[a] as CVec, onA(vecs[b] as CVec))

      G.re[a * m + b] = r
      G.im[a * m + b] = i
    }
  }

  const g = m > 0 ? eigHermitian({ matrix: G }) : { values: new Float64Array(0), vectorsRe: new Float64Array(0), vectorsIm: new Float64Array(0) }
  const groups: CVec[][] = [[], []]

  for (let c = 0; c < m; c++) {
    const z: CVec = { re: new Float64Array(N), im: new Float64Array(N) }

    for (let a = 0; a < m; a++) {
      const cr = g.vectorsRe[a * m + c] as number
      const ci = g.vectorsIm[a * m + c] as number
      const x = vecs[a] as CVec

      for (let i = 0; i < N; i++) {
        z.re[i]! += (x.re[i] as number) * cr - (x.im[i] as number) * ci
        z.im[i]! += (x.re[i] as number) * ci + (x.im[i] as number) * cr
      }
    }
    ;(groups[(g.values[c] as number) > 0.5 ? 0 : 1] as CVec[]).push(z)
  }

  const walls = groups.map(zs => {
    const n = zs.length

    if (n === 0) return { states: 0, chirality: 0, speeds: [0, 0, 0], split: [] }

    const H = (K: number[]): Small => {
      const st = slabStream(s, K, roots)
      const Uz = zs.map(z => slabApply(s, sets, st, z))
      const out: Small = { re: Array<number>(n * n).fill(0), im: Array<number>(n * n).fill(0) }

      for (let a = 0; a < n; a++) {
        for (let b = 0; b < n; b++) {
          const [r1, i1] = innerFull(zs[a] as CVec, Uz[b] as CVec)
          const [r2, i2] = innerFull(zs[b] as CVec, Uz[a] as CVec)

          // M' = -M; H = (M' - M'^dag) / 2i: M'_ab = -(r1 + i i1), conj(M'_ba) = -(r2 - i i2)
          const dr = -r1 + r2
          const di = -i1 - i2

          out.re[a * n + b] = di / 2
          out.im[a * n + b] = -dr / 2
        }
      }

      return out
    }
    const Hd = [0, 1, 2].map(j => {
      const Kp = [0, 0, 0, 0]
      const Km = [0, 0, 0, 0]

      Kp[j] = kStep
      Km[j] = -kStep

      const a = H(Kp)
      const b = H(Km)

      return { re: a.re.map((x, i) => (x - (b.re[i] as number)) / (2 * kStep)), im: a.im.map((x, i) => (x - (b.im[i] as number)) / (2 * kStep)) }
    })
    const P = smallMul(smallMul(Hd[0] as Small, Hd[1] as Small, n), Hd[2] as Small, n)
    let trIm = 0

    for (let a = 0; a < n; a++) trIm += P.im[a * n + a] as number

    const speeds = Hd.map(h => {
      const Hm = makeComplexMatrix({ rows: n, cols: n })

      h.re.forEach((x, i) => {
        Hm.re[i] = x
      })
      h.im.forEach((x, i) => {
        Hm.im[i] = x
      })

      return Math.max(...[...eigHermitian({ matrix: Hm }).values].map(Math.abs))
    })

    return { states: n, chirality: trIm / (2 * (speeds[0] as number) * (speeds[1] as number) * (speeds[2] as number)), speeds, split: [] }
  })

  return { inGap: m, weights: [...g.values], walls }
}

// ---- spectral flow through a reference phase, wall by wall ----

export type WindowLevel = { phase: number; wallA: number }

// the levels of the reduced cycle within `window` of `ref`, each with its weight on the depth classes `depths` (from its
// eigenvector by inverse iteration; a degenerate pair gives a vector in its span, and both members of the register's
// right-SU(2) doublet sit on the same wall, so the span's weight is each member's)
export function windowLevels(s: Slab, red: SlabReduced, phases: readonly number[], ref: number, window: number, depths: ReadonlySet<number>): WindowLevel[] {
  const d = red.d
  const out: WindowLevel[] = []

  for (const ph of phases) {
    if (Math.abs(wrap(ph - ref)) >= window) continue

    const vec = complexEigenvector({ re: red.U.re, im: red.U.im, n: d, value: [Math.cos(ph), Math.sin(ph)] })
    const e: UnitaryEigen = { phases: [ph], vre: new Float64Array(d * d), vim: new Float64Array(d * d), n: d, cut: 0 }

    // a one-column eigen solution: column 0 of a d x 1 layout read by depthWeight as [j * d + 0]
    for (let j = 0; j < d; j++) {
      e.vre[j * d] = vec.re[j] as number
      e.vim[j * d] = vec.im[j] as number
    }
    out.push({ phase: ph, wallA: depthWeight(s, red, e, 0, depths) })
  }

  return out
}

export type FlowCount = { up: number; down: number; entries: number; exits: number; unmatched: number }

// crossings of `ref` between two steps by the levels of one wall: each level at step s + 1 is matched to the nearest
// unused level of step s within `reach` (greedy, nearest first); a matched pair whose offset from ref changes sign is a
// crossing, up or down. Unmatched levels are entries or exits at the window's edges (never crossings)
export function wallCrossings(before: readonly number[], after: readonly number[], ref: number, reach: number): FlowCount {
  const pairs: { i: number; j: number; dist: number }[] = []

  before.forEach((a, i) => after.forEach((b, j) => pairs.push({ i, j, dist: Math.abs(wrap(b - a)) })))
  pairs.sort((x, y) => x.dist - y.dist)

  const usedA = new Set<number>()
  const usedB = new Set<number>()
  let up = 0
  let down = 0

  for (const p of pairs) {
    if (p.dist > reach || usedA.has(p.i) || usedB.has(p.j)) continue
    usedA.add(p.i)
    usedB.add(p.j)

    const x = wrap((before[p.i] as number) - ref)
    const y = wrap((after[p.j] as number) - ref)

    if (x < 0 && y >= 0) up++
    else if (x >= 0 && y < 0) down++
  }

  return { up, down, entries: after.length - usedB.size, exits: before.length - usedA.size, unmatched: 0 }
}

// the largest |U v - e^(i phi) v| over the eigenpairs: the decomposition's residual
export function eigenResidual(U: Dense, e: UnitaryEigen): number {
  const n = e.n
  let worst = 0

  for (let k = 0; k < n; k++) {
    const c = Math.cos(e.phases[k] as number)
    const s = Math.sin(e.phases[k] as number)
    let r2 = 0

    for (let i = 0; i < n; i++) {
      let yr = 0
      let yi = 0

      for (let j = 0; j < n; j++) {
        const ur = U.re[i * n + j] as number
        const ui = U.im[i * n + j] as number
        const xr = e.vre[j * n + k] as number
        const xi = e.vim[j * n + k] as number

        yr += ur * xr - ui * xi
        yi += ur * xi + ui * xr
      }

      const vr = e.vre[i * n + k] as number
      const vi = e.vim[i * n + k] as number

      r2 += (yr - (c * vr - s * vi)) ** 2 + (yi - (c * vi + s * vr)) ** 2
    }

    worst = Math.max(worst, Math.sqrt(r2))
  }

  return worst
}
