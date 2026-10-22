// A CP-ODD FLAVOR STRUCTURE ON THE WILSON HALF OF THE ADOPTED RULE R*, AND THE SIZE OF THE DYNAMICAL-LIGHT RUN IT FEEDS
// (E-FRC-0293, moving-matter item 0012). E-SPN-0171 found the wall's member flow an index, 4 per flavor per E . B winding,
// CP-blind, so a net asymmetry needs the windings biased by a dynamical light pushed by CP-odd flavor currents. On one
// half a flavor phase is physical only when the half holds TWO flavor bases (E-FRC-0259 point 2): one basis is removed by
// W = P+ (x) V + P- (x) 1. R*'s Wilson half has two flavor-carrying structures, the mass (Q_S P+ in beat 1, its inverse
// on Q_D P+ in beat 2) and the Wilson mixers (v on Q_S P+ in beat 2, conj v on Q_D P+ in beat 1). This file puts the
// trimaximal V on the mass and the Wilson units diagonal in the weak basis, so the two bases differ, and builds the
// readers that check the piece and the arithmetic of the run the bias needs.
//
//   flavoredHalfSchedule  the two 576-mode pieces of R* with three flavors: beat 1 X (1 + (A+ - 1) Q_S P+ + (A- - 1)
//                         Q_S P- + (Y - 1) Q_D P+), beat 2 X (1 + (A+^dag - 1) Q_D P+ + (A-^dag - 1) Q_D P- + (Wv - 1)
//                         Q_S P+), flavor matrices as given (Y = Wv^dag keeps the S - D pairing; a caller may pass
//                         another Y to give the CPT check teeth)
//   flavorHalfBlock       a 576-mode piece in the register's J eigenbasis, cut to one half's 288 modes (24 slots x 4
//                         register x 3 flavors), with the weight it leaves between the halves
//   flavorHalfPhases      the eigenphases of one half's bulk cycle U = S P2 S P1 at Bloch momentum K (no field), S =
//                         diag(exp(-i K . r_d)) on every register and flavor component of slot d
//   hermitianPart, cpInvariant   exact over Q(w): det[(A + A^dag) / 2, (W + W^dag) / 2], the Jarlskog-type invariant of
//                         two flavor structures, zero exactly when one basis diagonalizes both
//   dynamicalLightCost    the arithmetic of the dynamical-light run on E-SPN-0171's slab: modes, the sea's band states,
//                         the flops a beat and the memory
//
// THE SYMMETRY CENSUS (part 'symmetry', item 0044, decision 009 point 2). A candidate is a signed coordinate map x ->
// signs x (+ a depth shift that keeps the wall profile, + an optional magnetic step along x0), unitary or antiunitary
// (complex conjugation after it), with the stream sent to itself (rev false) or to its inverse (rev true), the two beats
// kept or exchanged (swap). In the real register basis every projector and the swap coin are real, so the only complex
// parts are the flavor units and the stream's phases: the dock part of a candidate is the slot map times one 12 x 12
// operator M on (half register, flavor), which is SOLVED, never assumed.
//   slotMap               the slot each slot goes to: the root of (rev ? -1 : 1) signs r_d
//   dockIntertwiner       the 12 x 12 M with (1 (x) M) X = Y' (1 (x) M) for every pair (X the piece or its conjugate, Y'
//                         the target piece with its slots mapped), from the null space of the 144 x 144 Gram of the
//                         linear map, refined from the direct residual (the Gram alone stops near sqrt(eps): first run
//                         1.9e-8 on the identity), made unitary by its polar part, and gated on the direct residual
//   slabSymmetry          the slab side: the profile kept, every mapped hop landing on the target hop, the phase mismatch
//                         a lattice gradient (its holonomy on every inverse, triangle and square of roots), the momentum
//                         shift dK it carries, the class-gauge residual at test momenta with a uniform A2 sent to +A2
//                         (the drive kept) or -A2 (flipped), and the image of the wall-side depths (N kept, exchanged)
//   dockCycleResidual     the one-dock cycle check |M^ U~(K) - T(K') M^| with K' = sigma signs K, the stream included
//   momentumOrbits        orbits of a transverse grid under momentum maps K -> signs K + dK (mod the slab's reciprocal
//                         lattice)
//
// DETERMINISM: no random numbers. EXACT: the flavor matrices over Q(w) (BigInt), the projectors integer or dyadic; the
// spectra are floats, as measurement.

import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { type CMatrix } from '@/code/measure/dock-mixer'
import { slabStream, type Slab } from '@/code/measure/wilson-register'
import {
  FLAVOR_MODES,
  FLAVORS,
  flavorPiece,
  qw,
  qwAdd,
  qwConj,
  qwDagger,
  qwDet3,
  qwMatMul,
  qwMul,
  qwSub,
  qwToComplex,
  type QW,
  type QWMatrix,
} from '@/code/measure/flavor-register'

type Roots = readonly (readonly number[])[]

const SLOTS = 24
const REG = 8
const HALF_REG = 4
const RF = REG * FLAVORS
const HF = HALF_REG * FLAVORS

/** The modes of one half with three flavors: 24 slots x 4 register x 3 flavors. */
export const HALF_FLAVOR_MODES = SLOTS * HF

export type FlavoredHalf = {
  /** Q_S P+, Q_S P-, Q_D P+, Q_D P- (192 x 192 projectors). */
  qSPlus: Float64Array
  qSMinus: Float64Array
  qDPlus: Float64Array
  qDMinus: Float64Array
  /** The mass of the + half (beat 1 on Q_S P+) and of the - half (beat 1 on Q_S P-). */
  aPlus: QWMatrix
  aMinus: QWMatrix
  /** The Wilson unit matrix on Q_S P+ in beat 2. */
  wv: QWMatrix
  /** The Wilson unit matrix on Q_D P+ in beat 1; omitted, Wv^dag. */
  y?: QWMatrix
}

export function flavoredHalfSchedule(h: FlavoredHalf): CMatrix[] {
  const y = h.y ?? qwDagger(h.wv)

  return [
    flavorPiece([
      { q: h.qSPlus, F: qwToComplex(h.aPlus) },
      { q: h.qSMinus, F: qwToComplex(h.aMinus) },
      { q: h.qDPlus, F: qwToComplex(y) },
    ]),
    flavorPiece([
      { q: h.qDPlus, F: qwToComplex(qwDagger(h.aPlus)) },
      { q: h.qDMinus, F: qwToComplex(qwDagger(h.aMinus)) },
      { q: h.qSPlus, F: qwToComplex(h.wv) },
    ]),
  ]
}

// (1 (x) O^T (x) 1) P (1 (x) O (x) 1) on (slot, register, flavor), O's columns the basis (the + half first), cut to one
// half; leak the largest weight between the halves
export function flavorHalfBlock(
  P: CMatrix,
  basis: readonly (readonly number[])[],
  half: 0 | 1,
): { block: CMatrix; leak: number } {
  const n = FLAVOR_MODES
  const m = HALF_FLAVOR_MODES
  const lo = half * HALF_REG
  const block: CMatrix = {
    re: new Float64Array(m * m),
    im: new Float64Array(m * m),
  }

  let leak = 0

  const tRe = new Float64Array(REG * REG)
  const tIm = new Float64Array(REG * REG)

  for (let d = 0; d < SLOTS; d++) {
    for (let e = 0; e < SLOTS; e++) {
      for (let f = 0; f < FLAVORS; f++) {
        for (let g = 0; g < FLAVORS; g++) {
          // the 8 x 8 register block of (d, f) <- (e, g)
          let any = false

          for (let a = 0; a < REG; a++) {
            for (let b = 0; b < REG; b++) {
              const k = ((d * REG + a) * FLAVORS + f) * n + (e * REG + b) * FLAVORS + g

              tRe[a * REG + b] = P.re[k]!
              tIm[a * REG + b] = P.im[k]!
              any = any || P.re[k] !== 0 || P.im[k] !== 0
            }
          }

          if (!any) {
            continue
          }

          for (let ap = 0; ap < REG; ap++) {
            for (let bp = 0; bp < REG; bp++) {
              let sr = 0
              let si = 0

              for (let a = 0; a < REG; a++) {
                const oa = (basis[ap] as number[])[a]!

                if (oa === 0) {
                  continue
                }

                for (let b = 0; b < REG; b++) {
                  const ob = (basis[bp] as number[])[b]!

                  if (ob === 0) {
                    continue
                  }

                  sr += oa * tRe[a * REG + b]! * ob
                  si += oa * tIm[a * REG + b]! * ob
                }
              }

              const inI = ap >= lo && ap < lo + HALF_REG
              const inJ = bp >= lo && bp < lo + HALF_REG

              if (inI && inJ) {
                const bi = (d * HALF_REG + (ap - lo)) * FLAVORS + f
                const bj = (e * HALF_REG + (bp - lo)) * FLAVORS + g

                block.re[bi * m + bj] = sr
                block.im[bi * m + bj] = si
              } else if (inI !== inJ) {
                leak = Math.max(leak, Math.hypot(sr, si))
              }
            }
          }
        }
      }
    }
  }

  return { block, leak }
}

function cmulInto(a: CMatrix, b: CMatrix, n: number): CMatrix {
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ar = a.re[i * n + k]!
      const ai = a.im[i * n + k]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let j = 0; j < n; j++) {
        const br = b.re[k * n + j]!
        const bi = b.im[k * n + j]!

        re[i * n + j]! += ar * br - ai * bi
        im[i * n + j]! += ar * bi + ai * br
      }
    }
  }

  return { re, im }
}

// S P: row i of P multiplied by the stream phase of i's slot
function streamed(P: CMatrix, K: readonly number[], roots: Roots, per: number): CMatrix {
  const n = SLOTS * per
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    const r = roots[Math.floor(i / per)]!
    const ph = -(K[0]! * r[0]! + K[1]! * r[1]! + K[2]! * r[2]! + K[3]! * r[3]!)
    const c = Math.cos(ph)
    const s = Math.sin(ph)

    for (let j = 0; j < n; j++) {
      const pr = P.re[i * n + j]!
      const pi = P.im[i * n + j]!

      re[i * n + j] = c * pr - s * pi
      im[i * n + j] = c * pi + s * pr
    }
  }

  return { re, im }
}

/** The cycle S P2 S P1 of one half (per = modes a slot: 4 one flavor, 12 three) at K, and its eigenphases. */
export function halfCycleAt(
  pieces: readonly CMatrix[],
  K: readonly number[],
  roots: Roots,
  per: number,
): { U: CMatrix; n: number } {
  const n = SLOTS * per

  let U = streamed(pieces[0]!, K, roots, per)

  for (let b = 1; b < pieces.length; b++) {
    U = cmulInto(streamed(pieces[b]!, K, roots, per), U, n)
  }

  return { U, n }
}

export function flavorHalfPhases(
  pieces: readonly CMatrix[],
  K: readonly number[],
  roots: Roots,
  per: number = HF,
): number[] {
  const { U, n } = halfCycleAt(pieces, K, roots, per)
  const e = complexEigenvalues({ re: U.re, im: U.im, n })

  return e.re.map((x, i) => Math.atan2(e.im[i]!, x))
}

/** The largest |P P^dag - 1| entry of an n x n complex matrix. */
export function unitarityGap(P: CMatrix, n: number): number {
  let worst = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < n; k++) {
        const ar = P.re[i * n + k]!
        const ai = P.im[i * n + k]!
        const br = P.re[j * n + k]!
        const bi = -P.im[j * n + k]!

        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }

      worst = Math.max(worst, Math.hypot(sr - (i === j ? 1 : 0), si))
    }
  }

  return worst
}

// ---- exact flavor algebra over Q(w) ----

const HALF_Q: QW = qw(1n, 0n, 2n)

export const hermitianPart = (A: QWMatrix): QWMatrix => {
  const D = qwDagger(A)

  return A.map((row, i) => row.map((x, j) => qwMul(qwAdd(x, D[i]![j]!), HALF_Q)))
}

/** det[(A + A^dag) / 2, (W + W^dag) / 2], exact. */
export function cpInvariant(A: QWMatrix, W: QWMatrix): QW {
  const H1 = hermitianPart(A)
  const H2 = hermitianPart(W)
  const p = qwMatMul(H1, H2)
  const q = qwMatMul(H2, H1)

  return qwDet3(p.map((row, i) => row.map((x, j) => qwSub(x, q[i]![j]!))))
}

/** Re (a + b w) / d = (a - b / 2) / d, so a real part of exactly zero is 2 a = b. */
export const qwRealIsZero = (x: QW): boolean => 2n * x.a === x.b

/** The complex conjugate of every entry. */
export const qwConjugate = (A: QWMatrix): QWMatrix =>
  A.map(row => row.map(qwConj))

// ---- the dynamical-light run, by arithmetic ----

export type LightCost = {
  /** Modes of one half on the slab, per transverse momentum: L depth x qa supercell x 24 slots x 4 register x flavors. */
  modes: number
  /** The sea's band states a transverse momentum (the lower band; the flats frozen and counted apart). */
  bandStates: number
  /** Flops for one beat of the whole sea over the transverse grid (dense dock blocks, the stream free). */
  flopsPerBeat: number
  /** Flops for the run (beats x flopsPerBeat). */
  flops: number
  /** Bytes to hold the sea's band states over the grid (complex doubles). */
  bytes: number
}

export function dynamicalLightCost(plan: {
  L: number
  qa: number
  flavors: number
  transverse: number
  beats: number
}): LightCost {
  const dock = HALF_REG * SLOTS * plan.flavors
  const docks = plan.L * plan.qa
  const modes = dock * docks
  // the band is 8 of every 96 modes per flavor (4 + 4 on pi +- E, E-FRC-0259 B2); the sea fills the lower 4
  const bandStates = Math.round((modes * 4) / 96)
  // two beats, each a dense dock block applied at every dock: 2 x docks x dock^2 complex multiply-adds (8 flops)
  const perVector = 2 * docks * dock * dock * 8
  const flopsPerBeat = perVector * bandStates * plan.transverse

  return {
    modes,
    bandStates,
    flopsPerBeat,
    flops: flopsPerBeat * plan.beats,
    bytes: modes * bandStates * plan.transverse * 16,
  }
}

// ---- the symmetry census of the driven slab (part 'symmetry', item 0044) ----

const SM = HF
const SM2 = SM * SM
const TWO_PI = 2 * Math.PI

const wrapPhase = (x: number): number => x - TWO_PI * Math.round(x / TWO_PI)

export type Signs = readonly [number, number, number, number]

export type Candidate = {
  name: string
  signs: Signs
  /** Complex conjugation after the map. */
  anti: boolean
  /** The stream sent to its inverse (slot d to the slot of -signs r_d). */
  rev: boolean
  /** The two beats exchanged. */
  swap: boolean
  /** A magnetic step along x0 (0 for a point map). */
  shift0: number
}

export function slotMap(roots: Roots, signs: Signs, rev: boolean): Int32Array {
  const key = (r: readonly number[]): string => r.map(x => x + 0).join(',')
  const index = new Map(roots.map((r, d) => [key(r), d]))
  const t = rev ? -1 : 1

  return Int32Array.from(roots, r => {
    const d = index.get(key(r.map((x, k) => t * signs[k]! * x)))

    if (d === undefined) {
      throw new Error('slotMap: the image of a root is not a root')
    }

    return d
  })
}

export const cConj = (P: CMatrix): CMatrix => ({
  re: P.re,
  im: P.im.map(x => -x),
})

export function cDagger(P: CMatrix, n: number): CMatrix {
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      re[j * n + i] = P.re[i * n + j]!
      im[j * n + i] = -P.im[i * n + j]!
    }
  }

  return { re, im }
}

// ---- 12 x 12 complex helpers ----

/** A 12 x 12 complex matrix on (half register, flavor), row-major. */
export type Small = { re: Float64Array; im: Float64Array }

const small = (): Small => ({
  re: new Float64Array(SM2),
  im: new Float64Array(SM2),
})

function blockOf(P: CMatrix, d: number, e: number, out: Small): boolean {
  const n = HALF_FLAVOR_MODES

  let any = false

  for (let i = 0; i < SM; i++) {
    for (let j = 0; j < SM; j++) {
      const k = (d * SM + i) * n + e * SM + j
      const r = P.re[k]!
      const m = P.im[k]!

      out.re[i * SM + j] = r
      out.im[i * SM + j] = m
      any = any || r !== 0 || m !== 0
    }
  }

  return any
}

// a b, or a b^dag when bDagger
function smallMul(a: Small, b: Small, bDagger = false): Small {
  const out = small()

  for (let i = 0; i < SM; i++) {
    for (let k = 0; k < SM; k++) {
      const ar = a.re[i * SM + k]!
      const ai = a.im[i * SM + k]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let j = 0; j < SM; j++) {
        const br = bDagger ? b.re[j * SM + k]! : b.re[k * SM + j]!
        const bi = bDagger ? -b.im[j * SM + k]! : b.im[k * SM + j]!

        out.re[i * SM + j]! += ar * br - ai * bi
        out.im[i * SM + j]! += ar * bi + ai * br
      }
    }
  }

  return out
}

// the unitary polar part M (M^dag M)^(-1/2), or null when M is singular
function polar(M: Small): Small | null {
  const H = small()
  const D = small()

  // H = M^dag M
  for (let i = 0; i < SM; i++) {
    for (let j = 0; j < SM; j++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < SM; k++) {
        const ar = M.re[k * SM + i]!
        const ai = -M.im[k * SM + i]!
        const br = M.re[k * SM + j]!
        const bi = M.im[k * SM + j]!

        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }

      H.re[i * SM + j] = sr
      H.im[i * SM + j] = si
    }
  }

  const mat = makeComplexMatrix({ rows: SM, cols: SM })

  mat.re.set(H.re)
  mat.im.set(H.im)

  const e = eigHermitian({ matrix: mat })
  const top = Math.max(...Array.from(e.values))

  if (!(e.values[0]! > 1e-12 * top)) {
    return null
  }

  // D = V diag(1 / sqrt(lambda)) V^dag
  for (let i = 0; i < SM; i++) {
    for (let j = 0; j < SM; j++) {
      let sr = 0
      let si = 0

      for (let q = 0; q < SM; q++) {
        const w = 1 / Math.sqrt(e.values[q]!)
        const vr = e.vectorsRe[i * SM + q]!
        const vi = e.vectorsIm[i * SM + q]!
        const ur = e.vectorsRe[j * SM + q]!
        const ui = -e.vectorsIm[j * SM + q]!

        sr += w * (vr * ur - vi * ui)
        si += w * (vr * ui + vi * ur)
      }

      D.re[i * SM + j] = sr
      D.im[i * SM + j] = si
    }
  }

  return smallMul(M, D)
}

export type DockPair = {
  /** The source piece (conjugated for an antiunitary), 288 x 288. */
  x: CMatrix
  /** The target piece, 288 x 288, in the target's own slots. */
  y: CMatrix
}

export type Intertwiner = {
  /** The dimension of the solution space (Gram eigenvalues at most 1e-10 of the largest). */
  nullity: number
  /** The smallest Gram eigenvalue over the largest. */
  lowest: number
  /** The unitary 12 x 12 operator on (half register, flavor), row-major, or null. */
  M: Small | null
  /** max |(1 (x) M) X - Y' (1 (x) M)| over every pair and slot block. */
  residual: number
  /** max |M M^dag - 1|. */
  unitarity: number
}

function intertwinerResidual(
  pairs: readonly DockPair[],
  slot: Int32Array,
  M: Small,
): number {
  const A = small()
  const B = small()

  let worst = 0

  for (const { x, y } of pairs) {
    for (let d = 0; d < SLOTS; d++) {
      for (let e = 0; e < SLOTS; e++) {
        const anyA = blockOf(x, d, e, A)
        const anyB = blockOf(y, slot[d]!, slot[e]!, B)

        if (!anyA && !anyB) {
          continue
        }

        const l = smallMul(M, A)
        const r = smallMul(B, M)

        for (let k = 0; k < SM2; k++) {
          worst = Math.max(
            worst,
            Math.hypot(l.re[k]! - r.re[k]!, l.im[k]! - r.im[k]!),
          )
        }
      }
    }
  }

  return worst
}

export function dockIntertwiner(
  pairs: readonly DockPair[],
  slot: Int32Array,
): Intertwiner {
  const SAr = new Float64Array(SM2)
  const SAi = new Float64Array(SM2)
  const SBr = new Float64Array(SM2)
  const SBi = new Float64Array(SM2)
  const Cr = new Float64Array(SM2 * SM2)
  const Ci = new Float64Array(SM2 * SM2)
  const A = small()
  const B = small()

  for (const { x, y } of pairs) {
    for (let d = 0; d < SLOTS; d++) {
      for (let e = 0; e < SLOTS; e++) {
        const anyA = blockOf(x, d, e, A)
        const anyB = blockOf(y, slot[d]!, slot[e]!, B)

        if (anyA) {
          // SA += conj(A) A^T: [j, l] = sum_k conj(A_jk) A_lk
          for (let j = 0; j < SM; j++) {
            for (let l = 0; l < SM; l++) {
              let sr = 0
              let si = 0

              for (let k = 0; k < SM; k++) {
                const ar = A.re[j * SM + k]!
                const ai = -A.im[j * SM + k]!
                const br = A.re[l * SM + k]!
                const bi = A.im[l * SM + k]!

                sr += ar * br - ai * bi
                si += ar * bi + ai * br
              }

              SAr[j * SM + l]! += sr
              SAi[j * SM + l]! += si
            }
          }
        }

        if (anyB) {
          // SB += B^dag B: [i, k] = sum_j conj(B_ji) B_jk
          for (let i = 0; i < SM; i++) {
            for (let k = 0; k < SM; k++) {
              let sr = 0
              let si = 0

              for (let j = 0; j < SM; j++) {
                const ar = B.re[j * SM + i]!
                const ai = -B.im[j * SM + i]!
                const br = B.re[j * SM + k]!
                const bi = B.im[j * SM + k]!

                sr += ar * br - ai * bi
                si += ar * bi + ai * br
              }

              SBr[i * SM + k]! += sr
              SBi[i * SM + k]! += si
            }
          }
        }

        if (anyA && anyB) {
          // C += B (x) conj(A): [(i, j), (k, l)] = B_ik conj(A_jl)
          for (let i = 0; i < SM; i++) {
            for (let k = 0; k < SM; k++) {
              const br = B.re[i * SM + k]!
              const bi = B.im[i * SM + k]!

              if (br === 0 && bi === 0) {
                continue
              }

              for (let j = 0; j < SM; j++) {
                const row = (i * SM + j) * SM2 + k * SM

                for (let l = 0; l < SM; l++) {
                  const ar = A.re[j * SM + l]!
                  const ai = -A.im[j * SM + l]!

                  Cr[row + l]! += br * ar - bi * ai
                  Ci[row + l]! += br * ai + bi * ar
                }
              }
            }
          }
        }
      }
    }
  }

  // G = 1 (x) SA - C - C^dag + SB (x) 1
  const G = makeComplexMatrix({ rows: SM2, cols: SM2 })

  for (let i = 0; i < SM; i++) {
    for (let j = 0; j < SM; j++) {
      const r = i * SM + j

      for (let k = 0; k < SM; k++) {
        for (let l = 0; l < SM; l++) {
          const c = k * SM + l

          let gr = -Cr[r * SM2 + c]! - Cr[c * SM2 + r]!
          let gi = -Ci[r * SM2 + c]! + Ci[c * SM2 + r]!

          if (i === k) {
            gr += SAr[j * SM + l]!
            gi += SAi[j * SM + l]!
          }

          if (j === l) {
            gr += SBr[i * SM + k]!
            gi += SBi[i * SM + k]!
          }

          G.re[r * SM2 + c] = gr
          G.im[r * SM2 + c] = gi
        }
      }
    }
  }

  const e = eigHermitian({ matrix: G })
  const top = Math.max(...Array.from(e.values, Math.abs))
  const nullity = Array.from(e.values).filter(v => v <= 1e-10 * top).length
  const lowest = e.values[0]! / top
  const use = Math.max(1, nullity)
  const M0 = small()

  for (let q = 0; q < use; q++) {
    const w = 1 / (q + 1)

    for (let a = 0; a < SM2; a++) {
      M0.re[a]! += w * e.vectorsRe[a * SM2 + q]!
      M0.im[a]! += w * e.vectorsIm[a * SM2 + q]!
    }
  }

  let M = polar(M0)

  // iterative refinement: the Gram squares the conditioning, so its null vectors carry about sqrt(eps). Each step
  // computes g = L^dag (L m) = sum (R A^dag - B^dag R) from the DIRECT residual R = M A - B M and removes its part on
  // the non-null eigenvectors, m <- m - sum v (v^dag g) / lambda; the polar part after each round
  const refine = (Min: Small): Small => {
    const g = small()

    for (const { x, y } of pairs) {
      for (let d = 0; d < SLOTS; d++) {
        for (let f = 0; f < SLOTS; f++) {
          const anyA = blockOf(x, d, f, A)
          const anyB = blockOf(y, slot[d]!, slot[f]!, B)

          if (!anyA && !anyB) {
            continue
          }

          const l = smallMul(Min, A)
          const r = smallMul(B, Min)
          const R = small()

          for (let k = 0; k < SM2; k++) {
            R.re[k] = l.re[k]! - r.re[k]!
            R.im[k] = l.im[k]! - r.im[k]!
          }

          const t1 = smallMul(R, A, true)
          // B^dag R
          const Bd = small()

          for (let i = 0; i < SM; i++) {
            for (let j = 0; j < SM; j++) {
              Bd.re[i * SM + j] = B.re[j * SM + i]!
              Bd.im[i * SM + j] = -B.im[j * SM + i]!
            }
          }

          const t2 = smallMul(Bd, R)

          for (let k = 0; k < SM2; k++) {
            g.re[k]! += t1.re[k]! - t2.re[k]!
            g.im[k]! += t1.im[k]! - t2.im[k]!
          }
        }
      }
    }

    const out: Small = { re: Float64Array.from(Min.re), im: Float64Array.from(Min.im) }

    for (let q = nullity; q < SM2; q++) {
      const lambda = e.values[q]!

      // v^dag g
      let cr = 0
      let ci = 0

      for (let a = 0; a < SM2; a++) {
        const vr = e.vectorsRe[a * SM2 + q]!
        const vi = e.vectorsIm[a * SM2 + q]!

        cr += vr * g.re[a]! + vi * g.im[a]!
        ci += vr * g.im[a]! - vi * g.re[a]!
      }

      for (let a = 0; a < SM2; a++) {
        const vr = e.vectorsRe[a * SM2 + q]!
        const vi = e.vectorsIm[a * SM2 + q]!

        out.re[a]! -= (vr * cr - vi * ci) / lambda
        out.im[a]! -= (vr * ci + vi * cr) / lambda
      }
    }

    return out
  }

  if (M && nullity > 0) {
    for (let it = 0; it < 4 && M; it++) {
      M = polar(refine(refine(M)))
    }
  }

  if (!M) {
    return { nullity, lowest, M: null, residual: Infinity, unitarity: Infinity }
  }

  const MM = smallMul(M, M, true)

  let unitarity = 0

  for (let i = 0; i < SM; i++) {
    for (let j = 0; j < SM; j++) {
      unitarity = Math.max(
        unitarity,
        Math.hypot(MM.re[i * SM + j]! - (i === j ? 1 : 0), MM.im[i * SM + j]!),
      )
    }
  }

  return {
    nullity,
    lowest,
    M,
    residual: intertwinerResidual(pairs, slot, M),
    unitarity,
  }
}

// ---- the slab side ----

const SLAB_HALF_MODES = SLOTS * HALF_REG

type SlabHops = { theta: Float64Array; dst: Int32Array }

function slabHops(s: Slab, K: readonly number[], roots: Roots): SlabHops {
  const st = slabStream(s, K, roots)
  const nc = s.qa * s.L
  const theta = new Float64Array(nc * SLOTS)
  const dst = new Int32Array(nc * SLOTS)

  for (let c = 0; c < nc; c++) {
    for (let d = 0; d < SLOTS; d++) {
      const from = c * SLAB_HALF_MODES + d * HALF_REG

      theta[c * SLOTS + d] = Math.atan2(st.im[from]!, st.re[from]!)
      dst[c * SLOTS + d] = Math.floor(st.to[from]! / SLAB_HALF_MODES)
    }
  }

  return { theta, dst }
}

const mod = (x: number, m: number): number => ((x % m) + m) % m

/** The class image of a candidate: x0 -> signs0 x0 + shift0, x3 -> signs3 x3 (+ L / 2 - 1 when reversed, the profile kept). */
export function classMap(s: Slab, c: Candidate): Int32Array {
  const s3 = c.signs[3] < 0 ? s.L / 2 - 1 : 0

  return Int32Array.from({ length: s.qa * s.L }, (_, cls) => {
    const a = Math.floor(cls / s.L)
    const z = cls % s.L

    return (
      mod(c.signs[0] * a + c.shift0, s.qa) * s.L + mod(c.signs[3] * z + s3, s.L)
    )
  })
}

// the phase mismatch of every hop (source class, slot): sigma theta - the target's phase on the mapped hop; landing false
// when a mapped hop does not land where the target hop lands
function mismatch(
  src: SlabHops,
  tgt: SlabHops,
  c: Candidate,
  G: Int32Array,
  slot: Int32Array,
): { delta: Float64Array; landing: boolean } {
  const n = src.theta.length
  const delta = new Float64Array(n)
  const sigma = c.anti ? -1 : 1

  let landing = true

  for (let h = 0; h < n; h++) {
    const cls = Math.floor(h / SLOTS)
    const d = h % SLOTS
    const g = G[cls]!
    const gd = G[src.dst[h]!]!
    const q = slot[d]!

    if (!c.rev) {
      landing = landing && tgt.dst[g * SLOTS + q] === gd
      delta[h] = sigma * src.theta[h]! - tgt.theta[g * SLOTS + q]!
    } else {
      landing = landing && tgt.dst[gd * SLOTS + q] === g
      delta[h] = sigma * src.theta[h]! + tgt.theta[gd * SLOTS + q]!
    }
  }

  return { delta, landing }
}

// the worst residual of delta as a class gauge chi(dst) - chi(src), by breadth-first assignment from class 0
function classGaugeResidual(delta: Float64Array, dst: Int32Array, nc: number): number {
  const chi = new Float64Array(nc).fill(NaN)
  const queue = [0]

  chi[0] = 0

  let worst = 0

  for (let head = 0; head < queue.length; head++) {
    const cls = queue[head]!

    for (let d = 0; d < SLOTS; d++) {
      const h = cls * SLOTS + d
      const to = dst[h]!
      const want = chi[cls]! + delta[h]!

      if (Number.isNaN(chi[to]!)) {
        chi[to] = want
        queue.push(to)
      } else {
        worst = Math.max(worst, Math.abs(wrapPhase(want - chi[to]!)))
      }
    }
  }

  return queue.length === nc ? worst : Infinity
}

function solve4(A: number[][], b: number[]): number[] {
  const m = A.map((row, i) => [...row, b[i]!])

  for (let c = 0; c < 4; c++) {
    let p = c

    for (let r = c + 1; r < 4; r++) {
      if (Math.abs(m[r]![c]!) > Math.abs(m[p]![c]!)) {
        p = r
      }
    }

    ;[m[c], m[p]] = [m[p]!, m[c]!]

    for (let r = 0; r < 4; r++) {
      if (r === c) {
        continue
      }

      const f = m[r]![c]! / m[c]![c]!

      for (let k = c; k < 5; k++) {
        m[r]![k]! -= f * m[c]![k]!
      }
    }
  }

  return m.map((row, i) => row[4]! / row[i]!)
}

/** The translation sublattice of the slab: {t in D4 : t0 = 0 mod qa, t3 = 0 mod L} (qa odd, L even). */
export const slabPeriods = (s: Slab): number[][] => [
  [s.qa, s.qa % 2, 0, 0],
  [0, 1, 1, 0],
  [0, 1, -1, 0],
  [0, 0, 0, s.L],
]

// a path of roots summing to t (greedy: the root with the largest overlap)
function rootPath(t: readonly number[], roots: Roots): number[] {
  const left = [...t]
  const path: number[] = []

  while (left.some(x => x !== 0)) {
    let best = 0
    let score = -Infinity

    roots.forEach((r, d) => {
      const v = r.reduce((s, x, k) => s + x * left[k]!, 0)

      if (v > score) {
        score = v
        best = d
      }
    })

    path.push(best)
    roots[best]!.forEach((x, k) => {
      left[k]! -= x
    })

    if (path.length > 1000) {
      throw new Error('rootPath: no path')
    }
  }

  return path
}

export type SlabSymmetry = {
  profileKept: boolean
  landing: boolean
  /** The worst holonomy of the mismatch on every inverse, triangle and square of roots (radians, mod 2 pi). */
  holonomy: number
  /** The momentum shift the map carries: K -> sigma signs K + dK. */
  dK: number[]
  /** The class-gauge residual at the test momenta, the drive sent to +A2 (kept) and to -A2 (flipped). */
  driveKept: number
  driveFlipped: number
  /** The image of the wall-side depths. */
  nMap: 'kept' | 'exchanged' | 'other'
}

export function slabSymmetry(
  s: Slab,
  c: Candidate,
  roots: Roots,
  slot: Int32Array,
  momenta: readonly (readonly number[])[],
  drives: readonly number[],
  depths: ReadonlySet<number>,
): SlabSymmetry {
  const G = classMap(s, c)
  const nc = s.qa * s.L
  const s3 = c.signs[3] < 0 ? s.L / 2 - 1 : 0
  const profileKept = Array.from({ length: s.L }, (_, z) => z).every(
    z => s.profile[mod(c.signs[3] * z + s3, s.L)] === s.profile[z],
  )
  const zero = slabHops(s, [0, 0, 0, 0], roots)
  const { delta, landing } = mismatch(zero, zero, c, G, slot)
  const at = (cls: number, d: number): number => delta[cls * SLOTS + d]!
  const step = (cls: number, d: number): number => zero.dst[cls * SLOTS + d]!
  const opp = slotMap(roots, [-1, -1, -1, -1], false)
  const key = (r: readonly number[]): string => r.join(',')
  const rootIndex = new Map(roots.map((r, d) => [key(r), d]))

  let holonomy = 0

  for (let cls = 0; cls < nc; cls++) {
    for (let d1 = 0; d1 < SLOTS; d1++) {
      const c1 = step(cls, d1)

      holonomy = Math.max(
        holonomy,
        Math.abs(wrapPhase(at(cls, d1) + at(c1, opp[d1]!))),
      )

      for (let d2 = d1 + 1; d2 < SLOTS; d2++) {
        const c2 = step(cls, d2)

        holonomy = Math.max(
          holonomy,
          Math.abs(
            wrapPhase(at(cls, d1) + at(c1, d2) - at(cls, d2) - at(c2, d1)),
          ),
        )

        const sum = roots[d1]!.map((x, k) => x + roots[d2]![k]!)
        const d3 = rootIndex.get(key(sum))

        if (d3 !== undefined) {
          holonomy = Math.max(
            holonomy,
            Math.abs(wrapPhase(at(cls, d1) + at(c1, d2) - at(cls, d3))),
          )
        }
      }
    }
  }

  // dK from the mismatch summed along a root path for each period t: dK . (signs t) = -sum
  const periods = slabPeriods(s)
  const rhs = periods.map(t => {
    let cls = 0
    let sum = 0

    for (const d of rootPath(t, roots)) {
      sum += at(cls, d)
      cls = step(cls, d)
    }

    return wrapPhase(-sum)
  })
  const dK = solve4(
    periods.map(t => t.map((x, k) => c.signs[k]! * x)),
    rhs,
  ).map(x => x + 0)
  const sigma = c.anti ? -1 : 1
  const residualFor = (driveSign: number): number => {
    let worst = 0

    for (const K of momenta) {
      for (const A2 of drives) {
        const Ks = [K[0]!, K[1]!, K[2]! + A2, K[3]!]
        const Kt = K.map(
          (x, k) => sigma * c.signs[k]! * x + dK[k]! + (k === 2 ? driveSign * A2 : 0),
        )
        const hs = slabHops(s, Ks, roots)
        const m = mismatch(hs, slabHops(s, Kt, roots), c, G, slot)

        worst = Math.max(
          worst,
          m.landing ? classGaugeResidual(m.delta, hs.dst, nc) : Infinity,
        )
      }
    }

    return worst
  }
  const image = new Set([...depths].map(z => mod(c.signs[3] * z + s3, s.L)))
  const same = [...image].every(z => depths.has(z))
  const complement = [...image].every(z => !depths.has(z))

  return {
    profileKept,
    landing,
    holonomy,
    dK,
    driveKept: residualFor(1),
    driveFlipped: residualFor(-1),
    nMap: same ? 'kept' : complement ? 'exchanged' : 'other',
  }
}

// ---- the one-dock cycle with its stream ----

function streamDiag(K: readonly number[], roots: Roots): Small {
  // one phase a slot, kept as re/im of length SLOTS in the first entries
  const re = new Float64Array(SLOTS)
  const im = new Float64Array(SLOTS)

  roots.forEach((r, d) => {
    const ph = -(K[0]! * r[0]! + K[1]! * r[1]! + K[2]! * r[2]! + K[3]! * r[3]!)

    re[d] = Math.cos(ph)
    im[d] = Math.sin(ph)
  })

  return { re, im }
}

// diag(S) P: row i scaled by the phase of its slot
function rowScaled(S: Small, P: CMatrix): CMatrix {
  const n = HALF_FLAVOR_MODES
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    const c = S.re[Math.floor(i / SM)]!
    const s = S.im[Math.floor(i / SM)]!

    for (let j = 0; j < n; j++) {
      const pr = P.re[i * n + j]!
      const pi = P.im[i * n + j]!

      re[i * n + j] = c * pr - s * pi
      im[i * n + j] = c * pi + s * pr
    }
  }

  return { re, im }
}

// P diag(S): column j scaled by the phase of its slot
function colScaled(P: CMatrix, S: Small): CMatrix {
  const n = HALF_FLAVOR_MODES
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const c = S.re[Math.floor(j / SM)]!
      const s = S.im[Math.floor(j / SM)]!
      const pr = P.re[i * n + j]!
      const pi = P.im[i * n + j]!

      re[i * n + j] = c * pr - s * pi
      im[i * n + j] = c * pi + s * pr
    }
  }

  return { re, im }
}

/** max |M^ U~(K) - T(K') M^| on one dock, K' = sigma signs K, for one region's pieces [P1, P2]. */
export function dockCycleResidual(
  pieces: readonly CMatrix[],
  c: Candidate,
  slot: Int32Array,
  M: Small,
  K: readonly number[],
  roots: Roots,
): number {
  const n = HALF_FLAVOR_MODES
  const sigma = c.anti ? -1 : 1
  const Kp = K.map((x, k) => sigma * c.signs[k]! * x)
  const S = streamDiag(K, roots)
  const Sp = streamDiag(Kp, roots)
  const [P1, P2] = [pieces[0]!, pieces[1]!]
  const U = cmulInto(rowScaled(S, P2), rowScaled(S, P1), n)
  const src = c.anti ? cConj(U) : U
  const [a, b] = c.swap ? [P2, P1] : [P1, P2]
  // rev false: S' b S' a; rev true: (a S' b S')^dag
  const T = !c.rev
    ? cmulInto(rowScaled(Sp, b), rowScaled(Sp, a), n)
    : cDagger(cmulInto(colScaled(a, Sp), colScaled(b, Sp), n), n)
  const Mh: CMatrix = {
    re: new Float64Array(n * n),
    im: new Float64Array(n * n),
  }

  for (let d = 0; d < SLOTS; d++) {
    for (let i = 0; i < SM; i++) {
      for (let j = 0; j < SM; j++) {
        Mh.re[(slot[d]! * SM + i) * n + d * SM + j] = M.re[i * SM + j]!
        Mh.im[(slot[d]! * SM + i) * n + d * SM + j] = M.im[i * SM + j]!
      }
    }
  }

  const l = cmulInto(Mh, src, n)
  const r = cmulInto(T, Mh, n)

  let worst = 0

  for (let k = 0; k < n * n; k++) {
    worst = Math.max(worst, Math.hypot(l.re[k]! - r.re[k]!, l.im[k]! - r.im[k]!))
  }

  return worst
}

// ---- orbits of the transverse grid ----

export type MomentumMap = { signs: Signs; dK: readonly number[] }

/** Orbits of the grid under the maps, equality mod the reciprocal lattice of the periods; closed false if a map leaves it. */
export function momentumOrbits(
  grid: readonly (readonly number[])[],
  maps: readonly MomentumMap[],
  periods: readonly (readonly number[])[],
): { orbits: number; closed: boolean } {
  const parent = grid.map((_, i) => i)
  const find = (i: number): number => {
    while (parent[i] !== i) {
      i = parent[i]!
    }

    return i
  }
  const same = (a: readonly number[], b: readonly number[]): boolean =>
    periods.every(t => {
      const x = t.reduce((s, v, k) => s + v * (a[k]! - b[k]!), 0) / TWO_PI

      return Math.abs(x - Math.round(x)) <= 1e-9
    })

  let closed = true

  for (const m of maps) {
    grid.forEach((K, i) => {
      const image = K.map((x, k) => m.signs[k]! * x + m.dK[k]!)
      const j = grid.findIndex(G => same(G, image))

      if (j < 0) {
        closed = false

        return
      }

      parent[find(i)] = find(j)
    })
  }

  return {
    orbits: new Set(grid.map((_, i) => find(i))).size,
    closed,
  }
}
