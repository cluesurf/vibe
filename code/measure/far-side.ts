// THE WILSON FAR SIDE MOVED OFF ZERO (E-SPN-0172). E-SPN-0168 found the Wilson far-side walk (D <-> T S) resting at
// phase 0 with half-width |arg v|, so two far-side quanta meet the wall member pair's 2 m_w modulo 2 pi (a Floquet
// resonance), open for every light wall member. This file builds the construction that moves that walk off 0 without
// moving the member, and reads the slab census with the flats wherever the construction puts them.
//
//   farProjector      Q_F = 1 - Q_S - Q_D, the dock's modes outside the member's two sectors (covariant: both are)
//   centeredSchedule  E-SPN-0166's schedule with a phase w on Q_F in BOTH beats and the member units compensated:
//                     beat 1: u w* on Q_S, y w on Q_D, w on Q_F; beat 2: ubar w* on Q_D, v w on Q_S, w on Q_F (y = conj v;
//                     v = 1 is the E-SPN-0160 side). At rest (T = 1) S carries u v and D y ubar, as without w; at the
//                     half-periods (c(K) = 0) the member S, T D carries u, ubar and the far walk D, T S carries y w^2,
//                     v w^2: the member stays centered at pi everywhere, and the far walk and the flats move rigidly to
//                     psi = 2 arg w. Optionally the Wilson and far mixers act on one chiral half only (times P+)
//   slabEpsAt         every level of a slab at K as eps = -wrap(phase - pi) (the member's frame): the reduced cycle's
//                     levels, then the flats at the phase the construction puts them (psi), not at 0
//   farCensus         E-SPN-0168's wall census on those levels, with the member / far split at a given |eps| cut (a far
//                     level is one with |eps| >= cut) instead of pi / 2, since the far side now sits at eps near pi - psi
//   covarianceGap,    E-SPN-0168's covariance reading of a 192 piece under one W(F4) element, and a piece's distance
//   unitarityGap      from unitary
//
// DETERMINISM: no random numbers. EXACT: every unit is a ring unit of Z[omega][1/42] (products of ring units); the
// projectors are integer or dyadic; the spectra are floats, as measurement.

import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { wrap, type CMatrix } from '@/code/measure/dock-mixer'
import { MODES, matMul, type GroupElement } from '@/code/measure/spinor-register'
import { cmulUnit, conjUnit, mixerPiece, slabReduced, type HalfSet, type Mixer, type Slab } from '@/code/measure/wilson-register'
import type { ChannelCount } from '@/code/measure/wall-face'

type Roots = readonly (readonly number[])[]
type C = readonly [number, number]

/** Q_F = 1 - Q_S - Q_D (192 x 192). */
export function farProjector(qS: Float64Array, qD: Float64Array): Float64Array {
  const n = MODES
  const q = new Float64Array(n * n)

  for (let i = 0; i < n * n; i++) q[i] = (i % (n + 1) === 0 ? 1 : 0) - (qS[i] as number) - (qD[i] as number)

  return q
}

export type CenteredOptions = {
  /** The Wilson unit v on Q_S in beat 2 (y = conj v on Q_D in beat 1); null for the E-SPN-0160 side (v = 1). */
  v: C | null
  /** The far phase w (on Q_F in both beats, compensated on Q_S and Q_D); null for none. */
  w: C | null
  /** When given, the Wilson and far mixers act on this chiral half only (the projector P+). */
  half?: Float64Array
}

// the two pieces; u the member's ring unit. With half, E-SPN-0166's one-half recipe: Q_S and Q_D keep their E-SPN-0160
// units on the other half, and the extra units (Wilson and far) multiply them on the half's part only
export function centeredSchedule(qS: Float64Array, qD: Float64Array, qF: Float64Array, u: C, options: CenteredOptions): CMatrix[] {
  const one: C = [1, 0]
  const ubar = conjUnit(u)
  const v = options.v ?? one
  const y = conjUnit(v)
  const w = options.w ?? one
  const wb = conjUnit(w)

  if (!options.half) {
    return [
      mixerPiece([
        { q: qS, unit: cmulUnit(u, wb) },
        { q: qD, unit: cmulUnit(y, w) },
        { q: qF, unit: w },
      ]),
      mixerPiece([
        { q: qD, unit: cmulUnit(ubar, wb) },
        { q: qS, unit: cmulUnit(v, w) },
        { q: qF, unit: w },
      ]),
    ]
  }

  // one half: Q_S, Q_D carry u, ubar on the whole register and the extras (v w, w*; y w, w*; w on Q_F) on the half's
  // part; mixerPiece takes mutually orthogonal projectors, so each sector splits into its half part and the rest
  const P = options.half
  const sH = matMul(qS, P)
  const dH = matMul(qD, P)
  const fH = matMul(qF, P)
  const sOff = qS.map((x, i) => x - (sH[i] as number))
  const dOff = qD.map((x, i) => x - (dH[i] as number))
  const beat1: Mixer[] = [
    { q: sOff, unit: u },
    { q: sH, unit: cmulUnit(u, wb) },
    { q: dOff, unit: one },
    { q: dH, unit: cmulUnit(y, w) },
    { q: fH, unit: w },
  ]
  const beat2: Mixer[] = [
    { q: dOff, unit: ubar },
    { q: dH, unit: cmulUnit(ubar, wb) },
    { q: sOff, unit: one },
    { q: sH, unit: cmulUnit(v, w) },
    { q: fH, unit: w },
  ]

  return [mixerPiece(beat1.filter(m => m.unit[0] !== 1 || m.unit[1] !== 0)), mixerPiece(beat2.filter(m => m.unit[0] !== 1 || m.unit[1] !== 0))]
}

// the largest |g P - P g| entry of a 192 piece under one W(F4) element g (slots permuted, register by minors): E-SPN-
// 0168's covariance reading for a single element
export function covarianceGap(P: CMatrix, g: GroupElement): number {
  const n = MODES
  let worst = 0

  for (let d = 0; d < 24; d++) {
    for (let e = 0; e < 24; e++) {
      const sd = g.slots[d] as number
      const se = g.slots[e] as number

      for (let a = 0; a < 8; a++) {
        for (let c = 0; c < 8; c++) {
          let lr = 0
          let li = 0
          let rr = 0
          let ri = 0

          for (let b = 0; b < 8; b++) {
            const ga = (g.register[a] as number[])[b] as number
            const gc = (g.register[b] as number[])[c] as number

            lr += ga * (P.re[(d * 8 + b) * n + e * 8 + c] as number)
            li += ga * (P.im[(d * 8 + b) * n + e * 8 + c] as number)
            rr += (P.re[(sd * 8 + a) * n + se * 8 + b] as number) * gc
            ri += (P.im[(sd * 8 + a) * n + se * 8 + b] as number) * gc
          }
          worst = Math.max(worst, Math.abs(lr - rr), Math.abs(li - ri))
        }
      }
    }
  }

  return worst
}

// the largest |P P^dag - 1| entry of a 192 piece
export function unitarityGap(P: CMatrix): number {
  const n = MODES
  let worst = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let r = 0
      let m = 0

      for (let k = 0; k < n; k++) {
        const ar = P.re[i * n + k] as number
        const ai = P.im[i * n + k] as number
        const br = P.re[j * n + k] as number
        const bi = P.im[j * n + k] as number

        r += ar * br + ai * bi
        m += ai * br - ar * bi
      }
      worst = Math.max(worst, Math.abs(r - (i === j ? 1 : 0)), Math.abs(m))
    }
  }

  return worst
}

/** The phase of the flats of a construction: 2 arg w (w in both beats). */
export const flatPhase = (w: C | null): number => (w ? wrap(2 * Math.atan2(w[1], w[0])) : 0)

// eps = -wrap(phase - pi) of every level of the slab at K: the reduced cycle's d levels, then (when flats) one flat at
// the construction's flat phase
export function slabEpsAt(s: Slab, sets: readonly HalfSet[], K: readonly number[], roots: Roots, sR: readonly (readonly number[])[], dR: readonly (readonly number[])[], flat: number | null): { eps: number[]; leak: number; d: number } {
  const red = slabReduced(s, sets, K, roots, sR, dR)
  const e = complexEigenvalues({ re: red.U.re, im: red.U.im, n: red.d })
  const eps = e.re.map((x, i) => -wrap(Math.atan2(e.im[i] as number, x) - Math.PI))

  if (flat !== null) eps.push(-wrap(flat - Math.PI))

  return { eps, leak: red.leak, d: red.d }
}

export type FarCensus = { M: number; Bstar: number; crossings: number; channels: ChannelCount; first: { q: number; pair: [number, number] }; levels: number; leak: number }

// E-SPN-0168's wallCensus (bands tracked by greedy nearest matching along each path; each pair's room x = wrap(2M -
// eps_a - eps_b) followed for a sign change; |x| >= 1 the wrap region, resetting the pair), with the flats at `flat` and
// a level counted FAR when |eps| >= farCut
export function farCensus(s: Slab, sets: readonly HalfSet[], M: number, paths: readonly (readonly (readonly number[])[])[], roots: Roots, sR: readonly (readonly number[])[], dR: readonly (readonly number[])[], flat: number, farCut: number, tol = 1e-9): FarCensus {
  let Bstar = Math.PI
  let crossings = 0
  const channels: ChannelCount = { MM: 0, MF: 0, FF: 0 }
  let first: FarCensus['first'] = { q: Infinity, pair: [NaN, NaN] }
  let leak = 0
  let levels = 0

  for (const path of paths) {
    let prev: number[] | null = null
    let last: Float64Array | null = null

    for (const q of path) {
      const r = slabEpsAt(s, sets, q, roots, sR, dR, flat)

      leak = Math.max(leak, r.leak)

      const raw = r.eps
      const N = raw.length
      let cur: number[]

      levels = N
      if (!prev) cur = [...raw].sort((a, b) => a - b)
      else {
        const cand: { i: number; j: number; d: number }[] = []

        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) cand.push({ i, j, d: Math.abs(wrap((raw[j] as number) - (prev[i] as number))) })
        cand.sort((a, b) => a.d - b.d)

        const next = Array<number>(N).fill(NaN)
        const used = new Uint8Array(N)

        for (const c of cand) {
          if (!Number.isNaN(next[c.i] as number) || used[c.j]) continue
          next[c.i] = raw[c.j] as number
          used[c.j] = 1
        }
        cur = next
      }

      const d = new Float64Array(N * N)

      for (let a = 0; a < N; a++) {
        for (let b = a; b < N; b++) {
          const x = wrap(2 * M - (cur[a] as number) - (cur[b] as number))

          d[a * N + b] = x
          if (x > tol && x < Bstar) Bstar = x
        }
      }

      if (last) {
        for (let a = 0; a < N; a++) {
          for (let b = a; b < N; b++) {
            const y = d[a * N + b] as number
            const x = last[a * N + b] as number

            if (Math.abs(y) <= tol) continue
            if (Math.abs(y) >= 1) {
              d[a * N + b] = NaN
              continue
            }
            if (!Number.isNaN(x) && Math.abs(x) > tol && x > 0 !== y > 0) {
              crossings++

              const far = (Math.abs(cur[a] as number) >= farCut ? 1 : 0) + (Math.abs(cur[b] as number) >= farCut ? 1 : 0)

              if (far === 0) channels.MM++
              else if (far === 1) channels.MF++
              else channels.FF++

              const qr = Math.hypot(...q)

              if (qr < first.q) first = { q: qr, pair: [cur[a] as number, cur[b] as number] }
            }
          }
        }
      }

      prev = cur
      last = d
    }
  }

  return { M, Bstar: crossings > 0 ? 0 : Bstar, crossings, channels, first, levels, leak }
}
