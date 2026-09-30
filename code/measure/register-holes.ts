// THE MANY-HOLE ENGINE FOR THE REGISTER RULE (E-FND-0161). E-SPN-0175 runs two holes of the full sea exactly, with the
// whole 192-mode slot-and-register space of each member at every relative dock (36,864 amplitudes a dock). That is what
// stops a third hole: n holes at total momentum 0 there cost (L^4 / 2)^(n - 1) 192^n amplitudes. This module runs the
// same rule on the part of the space that moves, exactly, and nothing else.
//
// WHY THE REDUCTION IS EXACT (derived in the experiment, E-FND-0161):
//   the flats      the free cycle is the identity on F(q), the 176 flat states a momentum, and every sector piece is built
//                  from Q_S (beat 1) and Q_D (beat 2), whose ranges lie in W = range(U - 1) and in its beat-2 image B1 W
//                  (E-SPN-0175). So a flat hole is an exact spectator: it never moves, never meets a sector piece and
//                  never blocks a moving hole, since the two lie in orthogonal one-body spaces. The Fock space of the
//                  holes factors as Fock(F) (x) Fock(W) and the many-body cycle as 1 (x) U_W. Any number of flat holes
//                  rides along for free, and the moving holes are what is run
//   the halves     every piece commutes with J on each member (E-FRC-0258), so each hole's half is conserved; a run
//                  that starts with every hole in one half stays there, and the fiber is 8 a member, not 16
//   the frame      at each momentum the moving states get a basis whose first four (a half) are the sector states
//                  themselves, S in beat 1's frame and D in beat 2's (both momentum independent), so a sector piece reads
//                  a fiber index, and the one-body beats are 16 x 16 (or 8 x 8) matrices A1(q), A2(q)
//   the pairs      the pair piece on members i and j is 1 + (e^(i phi(x_i - x_j)) - 1) Q_i Q_j, and the n-member piece is
//                  the product over pairs (the pieces commute, being diagonal in the sector occupations), the n-hole form
//                  of E-SPN-0175's two-hole piece. It is applied in relative coordinates y_i = x_i - x_n by a Fourier
//                  transform over the D4 torus, which is exact for any total momentum
//
//   holeFrame      the per-momentum bases W(q), W2(q), the transfer matrices A1 = W2^dag B1 W and A2 = W^dag B2 W2, the
//                  band projector, and the checks that the construction holds (sector inside the moving span, unitary
//                  transfers, the halves block diagonal)
//   holeEngine     n holes at a given total momentum: storage (N^(n - 1) momentum tuples) x (f^n fibers), f = 8 or 16,
//                  the one-body beats, the pair phases, the cycle
//   reads          the norm, each member's momentum weights, band weights, half weights, the exchange sectors
//   beta0          the one-body occupation of the uniform ensemble over the conserved sector (the infinite-temperature
//                  prediction), by exact counting
//
// DETERMINISM: no random numbers. FLOATS are measurement on exact pieces, as in register-sea.

import { cycleMatrix } from '@/code/measure/swap-cone'
import { REGISTER_ROOTS } from '@/code/measure/spinor-register'
import { partnerBasis } from '@/code/measure/register-meson'
import { sectorBasis, volumeRight } from '@/code/measure/chiral-register'
import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { hermitianMatrixSign } from '@/code/algebra/linear/eig-hermitian'
import { type CMatrix } from '@/code/measure/dock-mixer'
import {
  MODES,
  movingBlocks,
  type Moving,
  type Torus,
} from '@/code/measure/register-sea'

const REG = 8
const HALF = 8
const SEC = 4

// ---- small complex linear algebra on row-major arrays ----

type Vec = { re: Float64Array; im: Float64Array }

const vec = (n: number): Vec => ({
  re: new Float64Array(n),
  im: new Float64Array(n),
})

// <a|b>
function dot(a: Vec, b: Vec): [number, number] {
  let r = 0
  let i = 0

  for (let k = 0; k < a.re.length; k++) {
    r += a.re[k]! * b.re[k]! + a.im[k]! * b.im[k]!
    i += a.re[k]! * b.im[k]! - a.im[k]! * b.re[k]!
  }

  return [r, i]
}

const vnorm = (a: Vec): number => Math.sqrt(dot(a, a)[0])

// b -= <a|b> a, a normalized
function removeAlong(a: Vec, b: Vec): void {
  const [r, i] = dot(a, b)

  for (let k = 0; k < a.re.length; k++) {
    b.re[k]! -= r * a.re[k]! - i * a.im[k]!
    b.im[k]! -= r * a.im[k]! + i * a.re[k]!
  }
}

// the residual of v outside span(basis), basis orthonormal (two passes)
function residual(basis: readonly Vec[], v: Vec): number {
  const w: Vec = { re: Float64Array.from(v.re), im: Float64Array.from(v.im) }

  for (let pass = 0; pass < 2; pass++) {
    for (const b of basis) {
      removeAlong(b, w)
    }
  }

  return vnorm(w)
}

// Gram-Schmidt: keep `fixed` (already orthonormal, checked), then append candidates whose residual passes `accept`
function extend(
  fixed: readonly Vec[],
  candidates: readonly Vec[],
  want: number,
  accept: number,
): { basis: Vec[]; accepted: number; rejected: number } {
  const basis = fixed.map(v => ({
    re: Float64Array.from(v.re),
    im: Float64Array.from(v.im),
  }))

  let accepted = Infinity
  let rejected = 0

  for (const c of candidates) {
    const w: Vec = { re: Float64Array.from(c.re), im: Float64Array.from(c.im) }

    for (let pass = 0; pass < 2; pass++) {
      for (const b of basis) {
        removeAlong(b, w)
      }
    }

    const n = vnorm(w)

    if (n > accept && basis.length < fixed.length + want) {
      accepted = Math.min(accepted, n)
      basis.push({ re: w.re.map(x => x / n), im: w.im.map(x => x / n) })
    } else {
      rejected = Math.max(rejected, n)
    }
  }

  return { basis, accepted, rejected }
}

// y = M x for a row-major n x n complex matrix
function apply(M: CMatrix, n: number, x: Vec): Vec {
  const y = vec(n)

  for (let i = 0; i < n; i++) {
    let r = 0
    let m = 0

    for (let j = 0; j < n; j++) {
      const ar = M.re[i * n + j]!
      const ai = M.im[i * n + j]!

      r += ar * x.re[j]! - ai * x.im[j]!
      m += ar * x.im[j]! + ai * x.re[j]!
    }

    y.re[i] = r
    y.im[i] = m
  }

  return y
}

// ---- the halves and the sector states ----

// (1 + s J) / 2 on every slot's register, applied to a 192-vector
function halfOf(J: readonly (readonly number[])[], s: 1 | -1, v: Vec): Vec {
  const out = vec(MODES)

  for (let d = 0; d < 24; d++) {
    for (let a = 0; a < REG; a++) {
      let r = 0
      let m = 0

      for (let b = 0; b < REG; b++) {
        const p = ((a === b ? 1 : 0) + s * J[a]![b]!) / 2

        if (p !== 0) {
          r += p * v.re[d * REG + b]!
          m += p * v.im[d * REG + b]!
        }
      }

      out.re[d * REG + a] = r
      out.im[d * REG + a] = m
    }
  }

  return out
}

// the eight states of a sector (the columns of E, Q = E E^T), rotated so the first four lie in half + and the last four
// in half -
function sectorStates(E: Float64Array, J: readonly (readonly number[])[]): Vec[][] {
  return ([1, -1] as const).map(s => {
    const cand = Array.from({ length: REG }, (_, eta) => {
      const v = vec(MODES)

      for (let m = 0; m < MODES; m++) {
        v.re[m] = E[m * REG + eta]!
      }

      return halfOf(J, s, v)
    })

    return extend([], cand, SEC, 1e-6).basis
  })
}

// the singlet sector's columns (the same as register-sea's singletBasis, rebuilt here to keep this module standalone
// in what it needs)
function singletColumns(): Float64Array {
  const E = new Float64Array(MODES * REG)
  const s = 1 / Math.sqrt(24)

  for (let d = 0; d < 24; d++) {
    for (let a = 0; a < REG; a++) {
      E[(d * REG + a) * REG + a] = s
    }
  }

  return E
}

// ---- the momentum classes and the torus Fourier transform ----

export type TorusFourier = {
  L: number
  N: number
  G: number
  // the class of every grid momentum, the grid index of each class's representative, the grid index of each site
  classOfGrid: Int32Array
  gridOfClass: Int32Array
  gridOfSite: Int32Array
  // integer momenta of the classes (in units of 2 pi / L)
  ints: number[][]
  sum: Int32Array
  neg: Int32Array
  // the site of sites[i] - sites[k]
  diff: Int32Array
  cos: Float64Array
  sin: Float64Array
}

const mod = (x: number, L: number): number => ((x % L) + L) % L

export function torusFourier(t: Torus): TorusFourier {
  const L = t.L
  const N = t.sites.length
  const G = L ** 4
  const half = L / 2
  const grid = (k: readonly number[]): number =>
    ((mod(k[0]!, L) * L + mod(k[1]!, L)) * L + mod(k[2]!, L)) * L +
    mod(k[3]!, L)
  const ints = t.momenta.map(q =>
    q.map(x => Math.round((x * L) / (2 * Math.PI))),
  )
  const classIndex = new Map<string, number>()

  ints.forEach((k, j) => classIndex.set(k.join(','), j))

  const rep = (k: readonly number[]): number[] => {
    const m = k.map(x => mod(x, L))

    return m[3]! >= half ? m.map(x => mod(x - half, L)) : m
  }
  const classOf = (k: readonly number[]): number =>
    classIndex.get(rep(k).join(','))!
  const classOfGrid = new Int32Array(G)

  for (let a = 0; a < L; a++) {
    for (let b = 0; b < L; b++) {
      for (let c = 0; c < L; c++) {
        for (let e = 0; e < L; e++) {
          classOfGrid[grid([a, b, c, e])] = classOf([a, b, c, e])
        }
      }
    }
  }

  const gridOfClass = Int32Array.from(ints.map(k => grid(k)))
  const gridOfSite = Int32Array.from(t.sites.map(p => grid(p)))
  const sum = new Int32Array(N * N)
  const neg = new Int32Array(N)

  for (let j = 0; j < N; j++) {
    neg[j] = classOf(ints[j]!.map(x => -x))

    for (let k = 0; k < N; k++) {
      sum[j * N + k] = classOf(ints[j]!.map((x, i) => x + ints[k]![i]!))
    }
  }

  const diff = new Int32Array(N * N)

  for (let i = 0; i < N; i++) {
    for (let k = 0; k < N; k++) {
      diff[i * N + k] = t.index.get(
        t.sites[i]!.map((x, m) => mod(x - t.sites[k]![m]!, L)).join(','),
      )!
    }
  }

  const cos = new Float64Array(L)
  const sin = new Float64Array(L)

  for (let m = 0; m < L; m++) {
    cos[m] = Math.cos((2 * Math.PI * m) / L)
    sin[m] = Math.sin((2 * Math.PI * m) / L)
  }

  return {
    L,
    N,
    G,
    classOfGrid,
    gridOfClass,
    gridOfSite,
    ints,
    sum,
    neg,
    diff,
    cos,
    sin,
  }
}

// the 4d DFT on the L^4 grid, in place, x(m) <- sum_n x(n) e^(sign 2 pi i m . n / L); scratch of length L
function dft4d(
  f: TorusFourier,
  re: Float64Array,
  im: Float64Array,
  sign: 1 | -1,
  sr: Float64Array,
  si: Float64Array,
): void {
  const L = f.L

  for (let axis = 0; axis < 4; axis++) {
    const st = L ** (3 - axis)
    const outer = L ** axis

    for (let o = 0; o < outer; o++) {
      for (let lo = 0; lo < st; lo++) {
        const base = o * L * st + lo

        if (L === 4) {
          // the radix-4 butterfly: twiddles 1, sign i, -1, -sign i
          const i0 = base
          const i1 = base + st
          const i2 = base + 2 * st
          const i3 = base + 3 * st
          const a0r = re[i0]! + re[i2]!
          const a0i = im[i0]! + im[i2]!
          const a1r = re[i0]! - re[i2]!
          const a1i = im[i0]! - im[i2]!
          const b0r = re[i1]! + re[i3]!
          const b0i = im[i1]! + im[i3]!
          const b1r = re[i1]! - re[i3]!
          const b1i = im[i1]! - im[i3]!

          re[i0] = a0r + b0r
          im[i0] = a0i + b0i
          re[i2] = a0r - b0r
          im[i2] = a0i - b0i
          // m = 1: a1 + sign i b1, m = 3: a1 - sign i b1
          re[i1] = a1r - sign * b1i
          im[i1] = a1i + sign * b1r
          re[i3] = a1r + sign * b1i
          im[i3] = a1i - sign * b1r
          continue
        }

        for (let m = 0; m < L; m++) {
          let r = 0
          let q = 0

          for (let n = 0; n < L; n++) {
            const k = (m * n) % L
            const c = f.cos[k]!
            const s = sign * f.sin[k]!
            const xr = re[base + n * st]!
            const xi = im[base + n * st]!

            r += c * xr - s * xi
            q += c * xi + s * xr
          }

          sr[m] = r
          si[m] = q
        }

        for (let m = 0; m < L; m++) {
          re[base + m * st] = sr[m]!
          im[base + m * st] = si[m]!
        }
      }
    }
  }
}

export type LineScratch = {
  gr: Float64Array
  gi: Float64Array
  sr: Float64Array
  si: Float64Array
}

export const lineScratch = (f: TorusFourier): LineScratch => ({
  gr: new Float64Array(f.G),
  gi: new Float64Array(f.G),
  sr: new Float64Array(f.L),
  si: new Float64Array(f.L),
})

// classes to sites, unitary: psi(y) = (1 / sqrt N) sum_q e^(i q . y) c(q), in place on an N-vector
export function toSites(
  f: TorusFourier,
  xr: Float64Array,
  xi: Float64Array,
  s: LineScratch,
): void {
  for (let g = 0; g < f.G; g++) {
    const j = f.classOfGrid[g]!

    s.gr[g] = xr[j]!
    s.gi[g] = xi[j]!
  }

  dft4d(f, s.gr, s.gi, 1, s.sr, s.si)

  const k = 1 / (2 * Math.sqrt(f.N))

  for (let i = 0; i < f.N; i++) {
    const g = f.gridOfSite[i]!

    xr[i] = s.gr[g]! * k
    xi[i] = s.gi[g]! * k
  }
}

// sites to classes, unitary: c(q) = (1 / sqrt N) sum_y e^(-i q . y) psi(y), in place on an N-vector
export function toClasses(
  f: TorusFourier,
  xr: Float64Array,
  xi: Float64Array,
  s: LineScratch,
): void {
  s.gr.fill(0)
  s.gi.fill(0)

  for (let i = 0; i < f.N; i++) {
    const g = f.gridOfSite[i]!

    s.gr[g] = xr[i]!
    s.gi[g] = xi[i]!
  }

  dft4d(f, s.gr, s.gi, -1, s.sr, s.si)

  const k = 1 / Math.sqrt(f.N)

  for (let j = 0; j < f.N; j++) {
    const g = f.gridOfClass[j]!

    xr[j] = s.gr[g]! * k
    xi[j] = s.gi[g]! * k
  }
}

// ---- the frame ----

export type HoleFrame = {
  t: Torus
  fourier: TorusFourier
  // the fiber per member: 16 (both halves: half + is 0..7, half - 8..15) or 8 (half + only)
  fiber: number
  // per momentum: the basis columns (192 x fiber, row-major [m * fiber + b]) in beat 1's frame (W) and beat 2's (W2)
  W: Vec[]
  W2: Vec[]
  // per momentum: the fiber x fiber transfers of beat 1 and beat 2 and the cycle's positive-phase band projector
  A1: CMatrix[]
  A2: CMatrix[]
  up: CMatrix[]
  // fiber index -> in the beat's sector, and -> half (0 for +, 1 for -)
  sector: Uint8Array
  half: Uint8Array
  checks: {
    // the largest residual of a sector state outside the moving span (W for S, B1 W for D)
    sectorOutside: number
    // the smallest accepted and largest rejected Gram-Schmidt residual for the complements (a clean rank has a gap)
    accepted: number
    rejected: number
    // the largest residual of B1 W outside W2 and of B2 W2 outside W (the transfers are complete)
    transferOutside: number
    // max |A A^dag - 1| over the momenta and both beats
    unitary: number
    // the largest transfer entry between the halves (0: each hole's half is kept)
    offHalf: number
    // the complement count found in each half at each momentum (4 expected)
    minComplement: number
    maxComplement: number
  }
  moving: Moving
}

// Ps: the two beats' one-body pieces (register-sea's registerPiece on Q_S at u and on Q_D at conj u)
export function holeFrame(
  t: Torus,
  Ps: readonly CMatrix[],
  fiber: 8 | 16,
): HoleFrame {
  const fourier = torusFourier(t)
  const mv = movingBlocks(t, Ps)
  const J = volumeRight()
  const S = sectorStates(singletColumns(), J)
  const D = sectorStates(partnerBasis(), J)
  const halves = fiber === 16 ? ([0, 1] as const) : ([0] as const)
  const W: Vec[] = []
  const W2: Vec[] = []
  const A1: CMatrix[] = []
  const A2: CMatrix[] = []
  const up: CMatrix[] = []

  let sectorOutside = 0
  let accepted = Infinity
  let rejected = 0
  let transferOutside = 0
  let unitary = 0
  let offHalf = 0
  let minComplement = Infinity
  let maxComplement = 0

  const column = (B: Vec, k: number, col: number, n: number): Vec => {
    const v = vec(n)

    for (let i = 0; i < n; i++) {
      v.re[i] = B.re[i * k + col]!
      v.im[i] = B.im[i * k + col]!
    }

    return v
  }
  const pack = (cols: readonly Vec[]): Vec => {
    const k = cols.length
    const out = vec(MODES * k)

    cols.forEach((c, col) => {
      for (let i = 0; i < MODES; i++) {
        out.re[i * k + col] = c.re[i]!
        out.im[i * k + col] = c.im[i]!
      }
    })

    return out
  }
  // X^dag M Y for 192 x k bases X, Y and a 192 x 192 M
  const sandwich = (X: Vec, M: CMatrix, Y: Vec, k: number): CMatrix => {
    const out = { re: new Float64Array(k * k), im: new Float64Array(k * k) }

    for (let col = 0; col < k; col++) {
      const y = apply(M, MODES, column(Y, k, col, MODES))

      for (let row = 0; row < k; row++) {
        const x = column(X, k, row, MODES)
        const [r, i] = dot(x, y)

        out.re[row * k + col] = r
        out.im[row * k + col] = i
      }
    }

    return out
  }

  for (let j = 0; j < t.momenta.length; j++) {
    const q = t.momenta[j]!
    const k = mv.rank[j]!
    const moving = Array.from({ length: k }, (_, c) =>
      column({ re: mv.re[j]!, im: mv.im[j]! }, k, c, MODES),
    )
    const movingOrtho = extend([], moving, k, 1e-9).basis
    const B1 = cycleMatrix([Ps[0]!], REGISTER_ROOTS, q)
    const B2 = cycleMatrix([Ps[1]!], REGISTER_ROOTS, q)
    const image = moving.map(v => apply(B1, MODES, v))
    const imageOrtho = extend([], image, k, 1e-9).basis
    const colsW: Vec[] = []
    const colsW2: Vec[] = []

    for (const h of halves) {
      const s = h === 0 ? 1 : -1

      for (const v of S[h]!) {
        sectorOutside = Math.max(sectorOutside, residual(movingOrtho, v))
      }

      for (const v of D[h]!) {
        sectorOutside = Math.max(sectorOutside, residual(imageOrtho, v))
      }

      const w = extend(
        S[h]!,
        moving.map(v => halfOf(J, s as 1 | -1, v)),
        HALF - SEC,
        1e-6,
      )
      const w2 = extend(
        D[h]!,
        image.map(v => halfOf(J, s as 1 | -1, v)),
        HALF - SEC,
        1e-6,
      )

      accepted = Math.min(accepted, w.accepted, w2.accepted)
      rejected = Math.max(rejected, w.rejected, w2.rejected)
      minComplement = Math.min(
        minComplement,
        w.basis.length - SEC,
        w2.basis.length - SEC,
      )
      maxComplement = Math.max(
        maxComplement,
        w.basis.length - SEC,
        w2.basis.length - SEC,
      )
      colsW.push(...w.basis)
      colsW2.push(...w2.basis)
    }

    // completeness of the transfers (both halves, even when one is run: the fiber's half must be closed)
    for (const v of colsW) {
      transferOutside = Math.max(
        transferOutside,
        residual(colsW2, apply(B1, MODES, v)),
      )
    }

    for (const v of colsW2) {
      transferOutside = Math.max(
        transferOutside,
        residual(colsW, apply(B2, MODES, v)),
      )
    }

    const Wj = pack(colsW)
    const W2j = pack(colsW2)
    const a1 = sandwich(W2j, B1, Wj, fiber)
    const a2 = sandwich(Wj, B2, W2j, fiber)

    for (const A of [a1, a2]) {
      for (let r = 0; r < fiber; r++) {
        for (let c = 0; c < fiber; c++) {
          let sr = 0
          let si = 0

          for (let m = 0; m < fiber; m++) {
            // (A A^dag)[r][c] = sum_m A[r][m] conj(A[c][m])
            const ar = A.re[r * fiber + m]!
            const ai = A.im[r * fiber + m]!
            const br = A.re[c * fiber + m]!
            const bi = -A.im[c * fiber + m]!

            sr += ar * br - ai * bi
            si += ar * bi + ai * br
          }

          unitary = Math.max(
            unitary,
            Math.hypot(sr - (r === c ? 1 : 0), si),
          )

          if (fiber === 16 && r >> 3 !== c >> 3) {
            offHalf = Math.max(
              offHalf,
              Math.hypot(A.re[r * fiber + c]!, A.im[r * fiber + c]!),
            )
          }
        }
      }
    }

    // the cycle U = A2 A1 and its positive-phase band: (1 + sign((U - U^dag) / 2i)) / 2
    const U = { re: new Float64Array(fiber * fiber), im: new Float64Array(fiber * fiber) }

    for (let r = 0; r < fiber; r++) {
      for (let c = 0; c < fiber; c++) {
        let sr = 0
        let si = 0

        for (let m = 0; m < fiber; m++) {
          const ar = a2.re[r * fiber + m]!
          const ai = a2.im[r * fiber + m]!
          const br = a1.re[m * fiber + c]!
          const bi = a1.im[m * fiber + c]!

          sr += ar * br - ai * bi
          si += ar * bi + ai * br
        }

        U.re[r * fiber + c] = sr
        U.im[r * fiber + c] = si
      }
    }

    const Sm = makeComplexMatrix({ rows: fiber, cols: fiber })

    for (let r = 0; r < fiber; r++) {
      for (let c = 0; c < fiber; c++) {
        // (U - U^dag) / 2i: entry (a - conj b) / 2i with a = U[r][c], b = U[c][r]
        const dr = U.re[r * fiber + c]! - U.re[c * fiber + r]!
        const di = U.im[r * fiber + c]! + U.im[c * fiber + r]!

        Sm.re[r * fiber + c] = di / 2
        Sm.im[r * fiber + c] = -dr / 2
      }
    }

    const sg = hermitianMatrixSign({ matrix: Sm })
    const P = {
      re: sg.re.map((x, i) => (x + (i % (fiber + 1) === 0 ? 1 : 0)) / 2),
      im: sg.im.map(x => x / 2),
    }

    W.push(Wj)
    W2.push(W2j)
    A1.push(a1)
    A2.push(a2)
    up.push(P)
  }

  const sector = new Uint8Array(fiber)
  const half = new Uint8Array(fiber)

  for (let b = 0; b < fiber; b++) {
    sector[b] = b % HALF < SEC ? 1 : 0
    half[b] = b >= HALF ? 1 : 0
  }

  return {
    t,
    fourier,
    fiber,
    W,
    W2,
    A1,
    A2,
    up,
    sector,
    half,
    checks: {
      sectorOutside,
      accepted,
      rejected,
      transferOutside,
      unitary,
      offHalf,
      minComplement,
      maxComplement,
    },
    moving: mv,
  }
}

// ---- the engine ----

export type Holes = {
  n: number
  // the total momentum's class
  total: number
  re: Float64Array
  im: Float64Array
}

export type HoleRule = {
  // the pair angle at each relative site (null: the free rule, the one-body pieces alone). Beat 1 takes e^(+i angle),
  // beat 2 e^(-i angle), E-SPN-0175's reversal
  angle: Float64Array | null
  // a separate table for beat 2 (it takes e^(-i angle2)); absent, beat 2 uses `angle`. Used only by controls
  angle2?: Float64Array | null
  // which member pairs the pair piece acts on, [i][j] for i < j (default: every pair). Used only by the engine's own
  // reduction checks
  pairs?: boolean[][]
}

export const holeSize = (fr: HoleFrame, n: number): number =>
  fr.fourier.N ** (n - 1) * fr.fiber ** n

export const newHoles = (fr: HoleFrame, n: number, total: number): Holes => ({
  n,
  total,
  re: new Float64Array(holeSize(fr, n)),
  im: new Float64Array(holeSize(fr, n)),
})

export const copyHoles = (s: Holes): Holes => ({
  n: s.n,
  total: s.total,
  re: Float64Array.from(s.re),
  im: Float64Array.from(s.im),
})

// the momentum class of each member for tuple index T: members 0 .. n - 2 are the digits, member n - 1 is the rest
export function memberMomenta(fr: HoleFrame, n: number, total: number): Int32Array {
  const N = fr.fourier.N
  const tuples = N ** (n - 1)
  const out = new Int32Array(tuples * n)

  for (let T = 0; T < tuples; T++) {
    let rest = T
    let acc = total

    for (let i = n - 2; i >= 0; i--) {
      const j = rest % N

      rest = Math.floor(rest / N)
      out[T * n + i] = j
      acc = fr.fourier.sum[acc * N + fr.fourier.neg[j]!]!
    }

    out[T * n + n - 1] = acc
  }

  return out
}

// one member's fiber index times A (the member's momentum j_i), for every entry
function oneBody(
  fr: HoleFrame,
  s: Holes,
  mom: Int32Array,
  As: readonly CMatrix[],
): void {
  const f = fr.fiber
  const n = s.n
  const block = f ** n
  const tuples = s.re.length / block
  const xr = new Float64Array(f)
  const xi = new Float64Array(f)

  for (let T = 0; T < tuples; T++) {
    const off = T * block

    for (let i = 0; i < n; i++) {
      const A = As[mom[T * n + i]!]!
      const st = f ** (n - 1 - i)
      const outer = f ** i

      for (let hi = 0; hi < outer; hi++) {
        for (let lo = 0; lo < st; lo++) {
          const base = off + hi * f * st + lo

          for (let k = 0; k < f; k++) {
            xr[k] = s.re[base + k * st]!
            xi[k] = s.im[base + k * st]!
          }

          for (let r = 0; r < f; r++) {
            let yr = 0
            let yi = 0
            const ro = r * f

            for (let k = 0; k < f; k++) {
              const ar = A.re[ro + k]!
              const ai = A.im[ro + k]!

              if (ar === 0 && ai === 0) {
                continue
              }

              yr += ar * xr[k]! - ai * xi[k]!
              yi += ar * xi[k]! + ai * xr[k]!
            }

            s.re[base + r * st] = yr
            s.im[base + r * st] = yi
          }
        }
      }
    }
  }
}

// the pair phases: for every fiber with at least two members in the sector, transform the member momenta 0 .. n - 2 to
// relative sites, multiply by e^(i sign sum over in-sector pairs of angle(separation)), and transform back
function pairPhases(
  fr: HoleFrame,
  s: Holes,
  rule: HoleRule,
  sign: 1 | -1,
): void {
  if (!rule.angle) {
    return
  }

  const F = fr.fourier
  const N = F.N
  const f = fr.fiber
  const n = s.n
  const block = f ** n
  const tuples = N ** (n - 1)
  const axes = n - 1
  const br = new Float64Array(tuples)
  const bi = new Float64Array(tuples)
  const lr = new Float64Array(N)
  const li = new Float64Array(N)
  const scratch = lineScratch(F)
  const angle = rule.angle
  const allowed = (i: number, j: number): boolean =>
    rule.pairs ? Boolean(rule.pairs[i]?.[j]) : true
  // the relative site of each member for a site tuple (member n - 1 at the origin of its own frame)
  const siteOf = new Int32Array(n)

  for (let fb = 0; fb < block; fb++) {
    // which members are in the sector
    const inSector: number[] = []

    for (let i = 0; i < n; i++) {
      const b = Math.floor(fb / f ** (n - 1 - i)) % f

      if (fr.sector[b]) {
        inSector.push(i)
      }
    }

    const active: [number, number][] = []

    for (let a = 0; a < inSector.length; a++) {
      for (let c = a + 1; c < inSector.length; c++) {
        if (allowed(inSector[a]!, inSector[c]!)) {
          active.push([inSector[a]!, inSector[c]!])
        }
      }
    }

    if (active.length === 0) {
      continue
    }

    for (let T = 0; T < tuples; T++) {
      br[T] = s.re[T * block + fb]!
      bi[T] = s.im[T * block + fb]!
    }

    // to sites, axis by axis
    for (let a = 0; a < axes; a++) {
      transformAxis(F, br, bi, axes, a, lr, li, scratch, 1)
    }

    for (let T = 0; T < tuples; T++) {
      let rest = T

      for (let i = n - 2; i >= 0; i--) {
        siteOf[i] = rest % N
        rest = Math.floor(rest / N)
      }

      siteOf[n - 1] = -1

      let phi = 0

      for (const [i, j] of active) {
        const si = siteOf[i]!
        const sj = siteOf[j]!
        // the separation y_i - y_j (i < j), with member n - 1 at relative site 0 (its own origin); the angle depends
        // on V, which is even, so the orientation does not enter
        const sep = sj < 0 ? si : F.diff[si * N + sj]!

        phi += angle[sep]!
      }

      if (phi !== 0) {
        const c = Math.cos(sign * phi)
        const sn = Math.sin(sign * phi)
        const xr = br[T]!
        const xi = bi[T]!

        br[T] = c * xr - sn * xi
        bi[T] = c * xi + sn * xr
      }
    }

    for (let a = 0; a < axes; a++) {
      transformAxis(F, br, bi, axes, a, lr, li, scratch, -1)
    }

    for (let T = 0; T < tuples; T++) {
      s.re[T * block + fb] = br[T]!
      s.im[T * block + fb] = bi[T]!
    }
  }
}

// transform one axis of an N^axes block between classes (dir -1: sites to classes) and sites (dir +1)
function transformAxis(
  F: TorusFourier,
  br: Float64Array,
  bi: Float64Array,
  axes: number,
  a: number,
  lr: Float64Array,
  li: Float64Array,
  scratch: LineScratch,
  dir: 1 | -1,
): void {
  const N = F.N
  const st = N ** (axes - 1 - a)
  const outer = N ** a

  for (let o = 0; o < outer; o++) {
    for (let lo = 0; lo < st; lo++) {
      const base = o * N * st + lo

      for (let k = 0; k < N; k++) {
        lr[k] = br[base + k * st]!
        li[k] = bi[base + k * st]!
      }

      if (dir === 1) {
        toSites(F, lr, li, scratch)
      } else {
        toClasses(F, lr, li, scratch)
      }

      for (let k = 0; k < N; k++) {
        br[base + k * st] = lr[k]!
        bi[base + k * st] = li[k]!
      }
    }
  }
}

export type HoleEngine = {
  frame: HoleFrame
  mom: Int32Array
  n: number
  total: number
}

export const holeEngine = (fr: HoleFrame, n: number, total: number): HoleEngine => ({
  frame: fr,
  mom: memberMomenta(fr, n, total),
  n,
  total,
})

// one cycle: beat 1 (the pair phases on S, then A1: the mixer, the swap coin and the stream), beat 2 (the pair phases on
// D, reversed, then A2)
export function holeCycle(e: HoleEngine, rule: HoleRule, s: Holes): void {
  pairPhases(e.frame, s, rule, 1)
  oneBody(e.frame, s, e.mom, e.frame.A1)
  pairPhases(
    e.frame,
    s,
    rule.angle2 === undefined ? rule : { ...rule, angle: rule.angle2 },
    -1,
  )
  oneBody(e.frame, s, e.mom, e.frame.A2)
}

// the angle at each relative site for E-SPN-0175's rule: string min(V, cap), plus contact at V = 0
export function pairAngles(
  t: Torus,
  string: number,
  cap: number,
  contact: number,
): Float64Array {
  return Float64Array.from(t.sites.map((_, i) => {
    const V = t.V[i]!

    return string * Math.min(V, cap) + (V === 0 ? contact : 0)
  }))
}

// ---- reads ----

export function holeNorm(s: Holes): number {
  let x = 0

  for (let k = 0; k < s.re.length; k++) {
    x += s.re[k]! ** 2 + s.im[k]! ** 2
  }

  return x
}

// every member's weight at every momentum class, [member * N + j]
export function momentumWeights(e: HoleEngine, s: Holes): Float64Array {
  const N = e.frame.fourier.N
  const block = e.frame.fiber ** s.n
  const tuples = s.re.length / block
  const out = new Float64Array(s.n * N)

  for (let T = 0; T < tuples; T++) {
    let w = 0

    for (let k = T * block; k < (T + 1) * block; k++) {
      w += s.re[k]! ** 2 + s.im[k]! ** 2
    }

    for (let i = 0; i < s.n; i++) {
      out[i * N + e.mom[T * s.n + i]!]! += w
    }
  }

  return out
}

// every member's weight in the cycle's positive-phase band at each momentum, [member * N + j] (read at cycle
// boundaries, where the frame is W)
export function bandWeights(e: HoleEngine, s: Holes): Float64Array {
  const fr = e.frame
  const N = fr.fourier.N
  const f = fr.fiber
  const n = s.n
  const block = f ** n
  const tuples = s.re.length / block
  const out = new Float64Array(n * N)
  const yr = new Float64Array(f)
  const yi = new Float64Array(f)

  for (let T = 0; T < tuples; T++) {
    const off = T * block

    for (let i = 0; i < n; i++) {
      const j = e.mom[T * n + i]!
      const P = fr.up[j]!
      const st = f ** (n - 1 - i)
      const outer = f ** i

      let w = 0

      for (let hi = 0; hi < outer; hi++) {
        for (let lo = 0; lo < st; lo++) {
          const base = off + hi * f * st + lo

          for (let r = 0; r < f; r++) {
            let ar = 0
            let ai = 0

            for (let k = 0; k < f; k++) {
              const pr = P.re[r * f + k]!
              const pi = P.im[r * f + k]!
              const xr = s.re[base + k * st]!
              const xi = s.im[base + k * st]!

              ar += pr * xr - pi * xi
              ai += pr * xi + pi * xr
            }

            yr[r] = ar
            yi[r] = ai
          }

          // <x|P|x> = |P x|^2 for a projector
          for (let r = 0; r < f; r++) {
            w += yr[r]! ** 2 + yi[r]! ** 2
          }
        }
      }

      out[i * N + j]! += w
    }
  }

  return out
}

// every member's weight in half + and in the beat-1 sector (read at cycle boundaries)
export function fiberWeights(
  e: HoleEngine,
  s: Holes,
): { half: Float64Array; sector: Float64Array } {
  const f = e.frame.fiber
  const n = s.n
  const block = f ** n
  const half = new Float64Array(n)
  const sector = new Float64Array(n)

  for (let k = 0; k < s.re.length; k++) {
    const w = s.re[k]! ** 2 + s.im[k]! ** 2

    if (w === 0) {
      continue
    }

    const fb = k % block

    for (let i = 0; i < n; i++) {
      const b = Math.floor(fb / f ** (n - 1 - i)) % f

      if (e.frame.half[b] === 0) {
        half[i]! += w
      }

      if (e.frame.sector[b]) {
        sector[i]! += w
      }
    }
  }

  return { half, sector }
}

// the member permutation perm (member i's momentum and fiber go to member perm[i]), as a new state
export function permuteHoles(e: HoleEngine, s: Holes, perm: readonly number[]): Holes {
  const fr = e.frame
  const N = fr.fourier.N
  const f = fr.fiber
  const n = s.n
  const block = f ** n
  const tuples = N ** (n - 1)
  const out = newHoles(fr, n, s.total)
  const mom = new Int32Array(n)
  const bits = new Int32Array(n)

  for (let T = 0; T < tuples; T++) {
    for (let i = 0; i < n; i++) {
      mom[perm[i]!] = e.mom[T * n + i]!
    }

    // the target tuple: members 0 .. n - 2 of the permuted momenta
    let T2 = 0

    for (let i = 0; i < n - 1; i++) {
      T2 = T2 * N + mom[i]!
    }

    for (let fb = 0; fb < block; fb++) {
      const k = T * block + fb
      const xr = s.re[k]!
      const xi = s.im[k]!

      if (xr === 0 && xi === 0) {
        continue
      }

      for (let i = 0; i < n; i++) {
        bits[perm[i]!] = Math.floor(fb / f ** (n - 1 - i)) % f
      }

      let fb2 = 0

      for (let i = 0; i < n; i++) {
        fb2 = fb2 * f + bits[i]!
      }

      out.re[T2 * block + fb2] = xr
      out.im[T2 * block + fb2] = xi
    }
  }

  return out
}

const PERMS3: readonly (readonly number[])[] = [
  [0, 1, 2],
  [1, 0, 2],
  [0, 2, 1],
  [2, 1, 0],
  [1, 2, 0],
  [2, 0, 1],
]

const permSign = (p: readonly number[]): number => {
  let s = 1

  for (let i = 0; i < p.length; i++) {
    for (let j = i + 1; j < p.length; j++) {
      if (p[i]! > p[j]!) {
        s = -s
      }
    }
  }

  return s
}

export function allPerms(n: number): number[][] {
  if (n === 3) {
    return PERMS3.map(p => [...p])
  }

  if (n === 2) {
    return [
      [0, 1],
      [1, 0],
    ]
  }

  const out: number[][] = []
  const rec = (pre: number[], rest: number[]): void => {
    if (rest.length === 0) {
      out.push(pre)
      return
    }

    rest.forEach((x, i) =>
      rec([...pre, x], [...rest.slice(0, i), ...rest.slice(i + 1)]),
    )
  }

  rec([], Array.from({ length: n }, (_, i) => i))

  return out
}

// the weight of the totally antisymmetric part, (1 / n!) sum_p sgn(p) P_p, and of the rest
export function exchangeWeights(
  e: HoleEngine,
  s: Holes,
): { antisymmetric: number; other: number } {
  const perms = allPerms(s.n)
  const acc = newHoles(e.frame, s.n, s.total)

  for (const p of perms) {
    const t = permuteHoles(e, s, p)
    const sg = permSign(p) / perms.length

    for (let k = 0; k < acc.re.length; k++) {
      acc.re[k]! += sg * t.re[k]!
      acc.im[k]! += sg * t.im[k]!
    }
  }

  const a = holeNorm(acc)

  return { antisymmetric: a, other: holeNorm(s) - a }
}

// the antisymmetrized, normalized state of n holes, member i in momentum class js[i] with fiber vector vs[i]; the
// momenta must sum to the total
export function slaterStart(
  e: HoleEngine,
  js: readonly number[],
  vs: readonly Vec[],
  antisymmetric = true,
): Holes {
  const fr = e.frame
  const N = fr.fourier.N
  const f = fr.fiber
  const n = e.n
  const block = f ** n
  const out = newHoles(fr, n, e.total)
  const perms = antisymmetric ? allPerms(n) : [Array.from({ length: n }, (_, i) => i)]

  let acc = e.total

  for (const j of js) {
    acc = fr.fourier.sum[acc * N + fr.fourier.neg[j]!]!
  }

  // the class of the zero momentum is 0 (the first in register-sea's list)
  if (acc !== 0) {
    throw new Error('register-holes: the start momenta do not sum to the total')
  }

  for (const p of perms) {
    const sg = antisymmetric ? permSign(p) : 1
    // member i holds particle p[i]
    let T = 0

    for (let i = 0; i < n - 1; i++) {
      T = T * N + js[p[i]!]!
    }

    const idx = new Int32Array(n)

    for (let fb = 0; fb < block; fb++) {
      let rest = fb

      for (let i = n - 1; i >= 0; i--) {
        idx[i] = rest % f
        rest = Math.floor(rest / f)
      }

      let r = 1
      let m = 0

      for (let i = 0; i < n; i++) {
        const v = vs[p[i]!]!
        const xr = v.re[idx[i]!]!
        const xi = v.im[idx[i]!]!
        const nr = r * xr - m * xi

        m = r * xi + m * xr
        r = nr
      }

      out.re[T * block + fb]! += sg * r
      out.im[T * block + fb]! += sg * m
    }
  }

  const nrm = Math.sqrt(holeNorm(out))

  for (let k = 0; k < out.re.length; k++) {
    out.re[k]! /= nrm
    out.im[k]! /= nrm
  }

  return out
}

// the eigenvectors of the cycle at momentum j in the fiber (the band basis), from the band projector: the columns of
// P e_b and (1 - P) e_b orthonormalized, the positive-phase band first
export function bandVectors(fr: HoleFrame, j: number): { up: Vec[]; down: Vec[] } {
  const f = fr.fiber
  const P = fr.up[j]!
  const col = (sign: 1 | -1, b: number): Vec => {
    const v = vec(f)

    for (let r = 0; r < f; r++) {
      const pr = P.re[r * f + b]!
      const pi = P.im[r * f + b]!

      v.re[r] = sign > 0 ? pr : (r === b ? 1 : 0) - pr
      v.im[r] = sign > 0 ? pi : -pi
    }

    return v
  }
  const up = extend([], Array.from({ length: f }, (_, b) => col(1, b)), f / 2, 1e-6).basis
  const down = extend([], Array.from({ length: f }, (_, b) => col(-1, b)), f / 2, 1e-6).basis

  return { up, down }
}

// the one-hole band level E(q) at every momentum class, from the positive-phase band: tr(U P_up) = (f / 2) e^(i (pi -
// E)) when the band is degenerate (the free band is, E-SPN-0160). Also the largest departure of |tr(U P_up)| from f / 2,
// which is 0 exactly when every level in the band has one phase
export function bandLevels(fr: HoleFrame): Float64Array & { spread?: number } {
  const f = fr.fiber
  const out = new Float64Array(fr.fourier.N) as Float64Array & { spread?: number }

  let spread = 0

  for (let j = 0; j < fr.fourier.N; j++) {
    const a1 = fr.A1[j]!
    const a2 = fr.A2[j]!
    const P = fr.up[j]!
    // tr(A2 A1 P) = sum over r, m, k of A2[r][m] A1[m][k] P[k][r]
    let tr = 0
    let ti = 0

    for (let r = 0; r < f; r++) {
      for (let m = 0; m < f; m++) {
        const xr = a2.re[r * f + m]!
        const xi = a2.im[r * f + m]!

        for (let k = 0; k < f; k++) {
          const yr = a1.re[m * f + k]! * P.re[k * f + r]! - a1.im[m * f + k]! * P.im[k * f + r]!
          const yi = a1.re[m * f + k]! * P.im[k * f + r]! + a1.im[m * f + k]! * P.re[k * f + r]!

          tr += xr * yr - xi * yi
          ti += xr * yi + xi * yr
        }
      }
    }

    out[j] = Math.PI - Math.atan2(ti, tr)
    spread = Math.max(spread, Math.abs(Math.hypot(tr, ti) - f / 2))
  }

  out.spread = spread

  return out
}

// one hole's fiber vector at momentum j through one free cycle (A2 A1), in place: a Slater determinant's orbitals under
// the free rule, the reference the n-hole free run must equal
export function orbitalCycle(fr: HoleFrame, j: number, v: Vec): void {
  const f = fr.fiber

  for (const A of [fr.A1[j]!, fr.A2[j]!]) {
    const y = apply(A, f, v)

    v.re.set(y.re)
    v.im.set(y.im)
  }
}

// ---- the bridge to E-SPN-0175's dense pair ----

// E-SPN-0175's pair (psi(y)[m1][m2] on every relative dock, total momentum 0) in this engine's two-hole coordinates:
// c(j)[b1][b2] = (1 / sqrt N) sum over m1, m2 of conj(W(q)[m1][b1]) conj(W(-q)[m2][b2]) M(q)[m1][m2], M = pairAt. Also the
// pair's weight outside W (x) W, which the reduction drops (N_F-like: 0 for a moving start)
export function fromDensePair(
  e: HoleEngine,
  pairAtJ: (j: number) => { re: Float64Array; im: Float64Array },
): { holes: Holes; outside: number } {
  const fr = e.frame
  const N = fr.fourier.N
  const f = fr.fiber
  const out = newHoles(fr, 2, 0)
  const k = 1 / Math.sqrt(N)
  const tr = new Float64Array(f * MODES)
  const ti = new Float64Array(f * MODES)

  let total = 0

  for (let j = 0; j < N; j++) {
    const M = pairAtJ(j)
    const A = fr.W[j]!
    const B = fr.W[fr.fourier.neg[j]!]!

    for (let x = 0; x < M.re.length; x++) {
      total += M.re[x]! ** 2 + M.im[x]! ** 2
    }

    // T[b1][m2] = sum_m1 conj(A[m1][b1]) M[m1][m2]
    tr.fill(0)
    ti.fill(0)

    for (let m1 = 0; m1 < MODES; m1++) {
      for (let b1 = 0; b1 < f; b1++) {
        const ar = A.re[m1 * f + b1]!
        const ai = -A.im[m1 * f + b1]!

        if (ar === 0 && ai === 0) {
          continue
        }

        for (let m2 = 0; m2 < MODES; m2++) {
          const xr = M.re[m1 * MODES + m2]!
          const xi = M.im[m1 * MODES + m2]!

          tr[b1 * MODES + m2]! += ar * xr - ai * xi
          ti[b1 * MODES + m2]! += ar * xi + ai * xr
        }
      }
    }

    for (let b1 = 0; b1 < f; b1++) {
      for (let b2 = 0; b2 < f; b2++) {
        let r = 0
        let m = 0

        for (let m2 = 0; m2 < MODES; m2++) {
          const br = B.re[m2 * f + b2]!
          const bi = -B.im[m2 * f + b2]!
          const xr = tr[b1 * MODES + m2]!
          const xi = ti[b1 * MODES + m2]!

          r += xr * br - xi * bi
          m += xr * bi + xi * br
        }

        out.re[j * f * f + b1 * f + b2] = r * k
        out.im[j * f * f + b1 * f + b2] = m * k
      }
    }
  }

  return { holes: out, outside: total / N - holeNorm(out) }
}

// the largest amplitude difference between two states of one shape
export function holeGap(a: Holes, b: Holes): number {
  let g = 0

  for (let k = 0; k < a.re.length; k++) {
    g = Math.max(g, Math.hypot(a.re[k]! - b.re[k]!, a.im[k]! - b.im[k]!))
  }

  return g
}

// ---- the free energy shell ----

const upsOf = (ss: Int32Array, n: number): number => {
  let u = 0

  for (let i = 0; i < n; i++) {
    u += ss[i]! < 0 ? 1 : 0
  }

  return u
}

// the free n-hole states in one half at a total momentum, counted exactly: each hole a momentum class and a band (s = -1
// the positive-phase band, +1 the other), fiber / 2 states a band a momentum, distinct modes. Each configuration carries
// its band energy delta = sum s E(q) (the total phase is n pi + delta). Returned for a window |delta - delta0| <= window:
// the number of states, the mean upper-band fraction, and the mean holes at each momentum class
export function freeShell(
  fr: HoleFrame,
  E: Float64Array,
  n: number,
  total: number,
  delta0: number,
  window: number,
  // keep only configurations with this many holes in the positive-phase band (the band ensemble); absent, all
  ups?: number,
): { states: number; up: number; occupation: Float64Array } {
  const F = fr.fourier
  const N = F.N
  const m = fr.fiber / 2
  const occ = new Float64Array(N)
  const js = new Int32Array(n)
  const ss = new Int32Array(n)
  const tuples = N ** (n - 1)

  let W = 0
  let U = 0

  for (let T = 0; T < tuples; T++) {
    let rest = T
    let acc = total

    for (let i = n - 2; i >= 0; i--) {
      js[i] = rest % N
      rest = Math.floor(rest / N)
      acc = F.sum[acc * N + F.neg[js[i]!]!]!
    }

    js[n - 1] = acc

    for (let b = 0; b < 1 << n; b++) {
      let d = 0
      let ways = 1
      let ups = 0

      for (let i = 0; i < n; i++) {
        ss[i] = (b >> i) & 1 ? 1 : -1
        d += ss[i]! * E[js[i]!]!

        let taken = 0

        for (let k = 0; k < i; k++) {
          if (js[k] === js[i] && ss[k] === ss[i]) {
            taken++
          }
        }

        ways *= m - taken
        ups += ss[i]! < 0 ? 1 : 0
      }

      if (
        ways <= 0 ||
        Math.abs(d - delta0) > window ||
        (ups !== undefined && ups !== upsOf(ss, n))
      ) {
        continue
      }

      W += ways
      U += ways * ups

      for (let i = 0; i < n; i++) {
        occ[js[i]!]! += ways
      }
    }
  }

  // ordered tuples of distinct modes count every state n! times; ratios are unaffected
  let fact = 1

  for (let i = 2; i <= n; i++) {
    fact *= i
  }

  return {
    states: W / fact,
    up: W > 0 ? U / W / n : 0,
    occupation: occ.map(x => (W > 0 ? x / W : 0)),
  }
}

// ---- the infinite-temperature prediction ----

// the one-body momentum occupation of the uniform ensemble over n antisymmetric holes in the fiber's modes (m a
// momentum) at the given total momentum: n(q) = E[number of holes at q], by exact counting of ordered tuples of
// distinct modes (m (m - 1) ... over repeated momenta)
export function beta0Momentum(fr: HoleFrame, n: number, total: number): Float64Array {
  const F = fr.fourier
  const N = F.N
  const m = fr.fiber
  const tuples = N ** (n - 1)
  const occ = new Float64Array(N)
  const js = new Int32Array(n)

  let totalCount = 0

  for (let T = 0; T < tuples; T++) {
    let rest = T
    let acc = total

    for (let i = n - 2; i >= 0; i--) {
      js[i] = rest % N
      rest = Math.floor(rest / N)
      acc = F.sum[acc * N + F.neg[js[i]!]!]!
    }

    js[n - 1] = acc

    // ordered choices of distinct modes: the i-th member has m minus the earlier members at its momentum
    let ways = 1

    for (let i = 0; i < n; i++) {
      let taken = 0

      for (let k = 0; k < i; k++) {
        if (js[k] === js[i]) {
          taken++
        }
      }

      ways *= m - taken
    }

    if (ways <= 0) {
      continue
    }

    totalCount += ways

    for (let i = 0; i < n; i++) {
      occ[js[i]!]! += ways
    }
  }

  return occ.map(x => x / totalCount)
}

export { PERMS3, permSign, type Vec, vec }
