// THE WALL FACE READ AS THE SCREEN (E-SPN-0168). E-SPN-0166 made the husk a domain wall of the Wilson-mass register
// rule and read its Weyl cones, but its binding census and inertia were read on the 4d bulk's bands (the projector). On a
// domain wall the physical particle is the wall mode, so this file reads the wall itself: the in-gap levels of a slab
// (Wilson side, E-SPN-0160 side), the pair channels of two wall members, and the wall's spectral flow in an exact field.
//
//   slabLevels        every level of a slab at husk momentum k: the reduced cycle (E-SPN-0166's W space, dense) plus
//                     the flat complement (phase 0), as eps = -wrap(phase - pi), the member's frame
//   wallCensus        E-SPN-0160's pair census on the slab's levels: along radial husk paths, the pair energy 2 m_w -
//                     eps_a - eps_b of every pair of tracked levels, a crossing a sign change; B* the least positive
//                     room when none crosses
//   applyUdag         the adjoint of E-SPN-0166's slabApply, U^dag = P1^dag S^dag P2^dag S^dag, matrix-free
//   levelsNearPi      the eigenphases of the full slab cycle nearest pi and their eigenvectors, matrix-free: Lanczos
//                     with full reorthogonalization on A = -(U + U^dag) / 2 (Hermitian, eigenvalue cos(phase - pi),
//                     so its top is the levels nearest pi), in deflated rounds (a single Krylov space sees a degenerate
//                     level once), each accepting only Ritz vectors whose TRUE residual is below 1e-9, until a round
//                     finds nothing above the threshold (the completeness certificate); then Rayleigh-Ritz on U inside
//                     the found span (A cannot tell pi + d from pi - d; U can). For slabs too large for the dense
//                     reduction
//   wallFlow          the levels near pi along a closed loop in k2, each labeled by its wall (depth weight above 1/2),
//                     and the crossings of pi counted per wall (E-SPN-0166's wallCrossings)
//
// DETERMINISM: no random numbers. The Lanczos start vector is a fixed trigonometric pattern. EXACT: the pieces are ring
// units of Z[omega][1/42]; the field's Peierls phases are roots of unity of order 2 qa (see the experiment); the
// spectra are floats, as measurement.

import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { wrap, type CMatrix } from '@/code/measure/dock-mixer'
import { slabApply, slabClasses, slabReduced, slabStream, unitaryEigen, wallCrossings, type CVec, type Dense, type FlowCount, type HalfSet, type Slab } from '@/code/measure/wilson-register'

type Roots = readonly (readonly number[])[]
type Stream = { to: Int32Array; re: Float64Array; im: Float64Array }

const HALF_MODES = 96

// ---- the dense slab: every level ----

// eps = -wrap(phase - pi) of every level of the slab at K (the reduced cycle's d levels, then N - d flats at phase 0)
export function slabLevels(s: Slab, sets: readonly HalfSet[], K: readonly number[], roots: Roots, sR: readonly (readonly number[])[], dR: readonly (readonly number[])[], flats: boolean): { eps: number[]; leak: number } {
  const red = slabReduced(s, sets, K, roots, sR, dR)
  const e = complexEigenvalues({ re: red.U.re, im: red.U.im, n: red.d })
  const eps = e.re.map((x, i) => -wrap(Math.atan2(e.im[i] as number, x) - Math.PI))

  if (flats) eps.push(-wrap(0 - Math.PI))

  return { eps, leak: red.leak }
}

// a crossing's channel: M a level of the member's side of the quasienergy circle (|eps| < pi / 2, near the phase pi the
// member rests at), F a level of the far side (near phase 0, where E-SPN-0160's flats sit). MM is two members or a member
// and a bulk band; FF two far-side levels whose total quasienergy is the member pair's modulo 2 pi (a Floquet resonance)
export type ChannelCount = { MM: number; MF: number; FF: number }
export type WallCensus = { M: number; Bstar: number; crossings: number; channels: ChannelCount; first: { q: number; pair: [number, number] }; levels: number; leak: number }

// E-SPN-0160's census (spinor-register pairCensusN), on the slab's levels: bands tracked along each path by greedy
// nearest matching, and every pair a <= b's room x = wrap(2M - eps_a - eps_b) followed for a sign change; |x| >= 1 is
// the wrap region and resets the pair, x within tol of 0 is the threshold itself and is skipped
export function wallCensus(s: Slab, sets: readonly HalfSet[], M: number, paths: readonly (readonly (readonly number[])[])[], roots: Roots, sR: readonly (readonly number[])[], dR: readonly (readonly number[])[], tol = 1e-9): WallCensus {
  let Bstar = Math.PI
  let crossings = 0
  const channels: ChannelCount = { MM: 0, MF: 0, FF: 0 }
  let first: WallCensus['first'] = { q: Infinity, pair: [NaN, NaN] }
  let leak = 0
  let levels = 0

  for (const path of paths) {
    let prev: number[] | null = null
    let last: Float64Array | null = null

    for (const q of path) {
      const r = slabLevels(s, sets, q, roots, sR, dR, true)

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

              const far = (Math.abs(cur[a] as number) >= Math.PI / 2 ? 1 : 0) + (Math.abs(cur[b] as number) >= Math.PI / 2 ? 1 : 0)

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

// ---- matrix-free: the adjoint cycle ----

function streamAdjoint(st: Stream, v: CVec): CVec {
  const n = v.re.length
  const out: CVec = { re: new Float64Array(n), im: new Float64Array(n) }

  // S e_i = c_i e_to[i], so (S^dag v)_i = conj(c_i) v_to[i]
  for (let i = 0; i < n; i++) {
    const j = st.to[i] as number
    const cr = st.re[i] as number
    const ci = st.im[i] as number
    const xr = v.re[j] as number
    const xi = v.im[j] as number

    out.re[i] = cr * xr + ci * xi
    out.im[i] = cr * xi - ci * xr
  }

  return out
}

function piecesAdjoint(s: Slab, sets: readonly HalfSet[], beat: number, v: CVec): CVec {
  const n = v.re.length
  const out: CVec = { re: new Float64Array(n), im: new Float64Array(n) }
  const m = HALF_MODES

  for (let a = 0; a < s.qa; a++) {
    for (let c = 0; c < s.L; c++) {
      const P = (sets[s.profile[c] as number] as HalfSet).pieces[beat] as CMatrix
      const off = (a * s.L + c) * m

      for (let j = 0; j < m; j++) {
        const xr = v.re[off + j] as number
        const xi = v.im[off + j] as number

        if (xr === 0 && xi === 0) continue
        for (let i = 0; i < m; i++) {
          const pr = P.re[j * m + i] as number
          const pi = P.im[j * m + i] as number

          if (pr === 0 && pi === 0) continue
          // (P^dag)_ij = conj(P_ji)
          out.re[off + i]! += pr * xr + pi * xi
          out.im[off + i]! += pr * xi - pi * xr
        }
      }
    }
  }

  return out
}

// U^dag v, with U = S P2 S P1 (slabApply: beat 0 then beat 1, each pieces then stream)
export function applyUdag(s: Slab, sets: readonly HalfSet[], st: Stream, v: CVec): CVec {
  let x = streamAdjoint(st, v)

  x = piecesAdjoint(s, sets, 1, x)
  x = streamAdjoint(st, x)

  return piecesAdjoint(s, sets, 0, x)
}

// ---- matrix-free: the levels nearest pi ----

const dotC = (a: CVec, b: CVec): [number, number] => {
  let r = 0
  let i = 0

  for (let k = 0; k < a.re.length; k++) {
    const ar = a.re[k] as number
    const ai = a.im[k] as number
    const br = b.re[k] as number
    const bi = b.im[k] as number

    r += ar * br + ai * bi
    i += ar * bi - ai * br
  }

  return [r, i]
}

function axpyC(y: CVec, cr: number, ci: number, x: CVec): void {
  for (let k = 0; k < y.re.length; k++) {
    const xr = x.re[k] as number
    const xi = x.im[k] as number

    y.re[k]! += cr * xr - ci * xi
    y.im[k]! += cr * xi + ci * xr
  }
}

export type NearPi = { levels: { offset: number; vector: CVec }[]; steps: number; ritzResidual: number; subspace: number; eigenResidual: number; unconverged: number; rounds: number; complete: boolean }

// the most Lanczos rounds per momentum (each deflated against the last); a round that finds nothing above the threshold
// ends the search, and `complete` reports whether one did
const MAX_ROUNDS = 24
// rounds in a row that find Ritz values above the threshold and accept none, after which the search stops incomplete
const MAX_STALLED = 3
// the Krylov residual below which a round's space counts as exhausted
const BREAKDOWN = 1e-8

// the eigenphases of the slab cycle within `window` of pi, with eigenvectors: Lanczos on A = -(U + U^dag) / 2 for
// `steps` steps (full reorthogonalization), the Ritz vectors with Ritz value above cos(window) and residual below
// `accept`, then U diagonalized on their span. `ritzResidual` is the worst accepted Ritz residual and `eigenResidual`
// the worst |U x - e^(i phi) x| of the returned levels (both gated by the caller)
export function levelsNearPi(s: Slab, sets: readonly HalfSet[], K: readonly number[], roots: Roots, window: number, steps: number, accept = 1e-9): NearPi {
  const st = slabStream(s, K, roots)
  const N = slabClasses(s) * HALF_MODES
  const applyA = (x: CVec): CVec => {
    const u = slabApply(s, sets, st, x)
    const w = applyUdag(s, sets, st, x)
    const out: CVec = { re: new Float64Array(N), im: new Float64Array(N) }

    for (let k = 0; k < N; k++) {
      out.re[k] = -((u.re[k] as number) + (w.re[k] as number)) / 2
      out.im[k] = -((u.im[k] as number) + (w.im[k] as number)) / 2
    }

    return out
  }
  const threshold = Math.cos(window)
  // A commutes with U, so the span of the Ritz vectors found so far is (to the Ritz residual) invariant, and so is its
  // complement. A single-vector Krylov space sees each distinct eigenvalue once, so a degenerate level (the register's
  // right-SU(2) doublets) shows its multiplicity only through rounding. So the search runs in rounds, each Krylov space
  // kept orthogonal to everything found before (deflation), until a round finds no Ritz value above the threshold
  const found: CVec[] = []
  const deflate = (w: CVec): void => {
    for (let pass = 0; pass < 2; pass++) {
      for (const b of found) {
        const [cr, ci] = dotC(b, w)

        axpyC(w, -cr, -ci, b)
      }
    }
  }
  let ritzResidual = 0
  let unconverged = 0
  let totalSteps = 0
  let rounds = 0
  let complete = false
  let stalled = 0

  for (let round = 0; round < MAX_ROUNDS; round++) {
    rounds++

    // the fixed start vector, a different pattern each round, deflated
    let v: CVec = { re: new Float64Array(N), im: new Float64Array(N) }

    for (let k = 0; k < N; k++) {
      v.re[k] = Math.cos((1.3 + 0.17 * round) * k + 0.7) + 0.5 * Math.sin((0.37 + 0.05 * round) * k)
      v.im[k] = Math.sin((2.1 - 0.13 * round) * k + 0.2) - 0.3 * Math.cos(0.91 * k)
    }
    deflate(v)

    const nrm = Math.sqrt(dotC(v, v)[0])

    for (let k = 0; k < N; k++) {
      v.re[k]! /= nrm
      v.im[k]! /= nrm
    }

    const basis: CVec[] = []
    const alpha: number[] = []
    const beta: number[] = []
    // the residual norm after the last step: a Ritz pair's residual is |finalBeta| times its last component
    let finalBeta = 0

    for (let j = 0; j < steps; j++) {
      basis.push(v)

      const w = applyA(v)
      const a = dotC(v, w)[0]

      alpha.push(a)
      deflate(w)
      // full reorthogonalization, twice
      for (let pass = 0; pass < 2; pass++) {
        for (const b of basis) {
          const [cr, ci] = dotC(b, w)

          axpyC(w, -cr, -ci, b)
        }
      }

      const bj = Math.sqrt(dotC(w, w)[0])

      finalBeta = bj
      // a small residual means the deflated Krylov space is exhausted (an invariant subspace): normalizing it would turn
      // rounding noise into a basis vector (the flaw of the first deflated version, which gave Ritz values above 1)
      if (j === steps - 1 || bj < BREAKDOWN) break
      beta.push(bj)
      v = { re: w.re.map(x => x / bj), im: w.im.map(x => x / bj) }
    }

    const k = alpha.length

    totalSteps += k

    const T = makeComplexMatrix({ rows: k, cols: k })

    for (let i = 0; i < k; i++) {
      T.re[i * k + i] = alpha[i] as number
      if (i + 1 < k) {
        T.re[i * k + i + 1] = beta[i] as number
        T.re[(i + 1) * k + i] = beta[i] as number
      }
    }

    const te = eigHermitian({ matrix: T })
    let above = 0
    let pending = 0
    let accepted = 0

    for (let c = 0; c < k; c++) {
      const theta = te.values[c] as number

      // |A| <= 1, so a Ritz value above 1 is noise, never a level
      if (theta <= threshold || theta > 1 + 1e-9) continue
      above++

      // the Ritz vector y_c = sum_j basis_j T_jc, its TRUE residual |A y - theta y| read with one more apply (the
      // Lanczos estimate is exact only in exact arithmetic, and the trace of the first version showed it tiny for
      // vectors 0.3 away from any eigenvector)
      const y: CVec = { re: new Float64Array(N), im: new Float64Array(N) }

      for (let j = 0; j < k; j++) axpyC(y, te.vectorsRe[j * k + c] as number, te.vectorsIm[j * k + c] as number, basis[j] as CVec)
      deflate(y)

      const yn = Math.sqrt(dotC(y, y)[0])

      if (yn < 1e-8) continue
      for (let q = 0; q < N; q++) {
        y.re[q]! /= yn
        y.im[q]! /= yn
      }

      const Ay = applyA(y)
      let r2 = 0

      for (let q = 0; q < N; q++) r2 += ((Ay.re[q] as number) - theta * (y.re[q] as number)) ** 2 + ((Ay.im[q] as number) - theta * (y.im[q] as number)) ** 2

      const res = Math.sqrt(r2)

      // only a converged Ritz vector joins `found` (a deflation against an inexact vector poisons every later round)
      if (res > accept) {
        pending++
        continue
      }
      ritzResidual = Math.max(ritzResidual, res)
      found.push(y)
      accepted++
    }

    unconverged = pending
    // a round with nothing above the threshold certifies the search complete (the Krylov space of a deflated start
    // vector holds a component of every remaining eigenvector, so a missing level would show as a Ritz value here)
    if (above === 0) {
      complete = true
      break
    }
    if (accepted === 0) {
      stalled++
      if (stalled >= MAX_STALLED) break
    }
  }

  const Y = found
  const m = Y.length

  if (m === 0) return { levels: [], steps: totalSteps, ritzResidual, subspace: 0, eigenResidual: 0, unconverged, rounds, complete }

  // U on the span: G_ab = <y_a| U |y_b>
  const UY = Y.map(y => slabApply(s, sets, st, y))
  const G: Dense = { re: new Float64Array(m * m), im: new Float64Array(m * m) }

  for (let a = 0; a < m; a++) {
    for (let b = 0; b < m; b++) {
      const [r, i] = dotC(Y[a] as CVec, UY[b] as CVec)

      G.re[a * m + b] = r
      G.im[a * m + b] = i
    }
  }

  const e = unitaryEigen(G, m)
  let eigenResidual = 0
  const levels = e.phases.map((ph, c) => {
    const x: CVec = { re: new Float64Array(N), im: new Float64Array(N) }

    for (let a = 0; a < m; a++) axpyC(x, e.vre[a * m + c] as number, e.vim[a * m + c] as number, Y[a] as CVec)

    const Ux = slabApply(s, sets, st, x)
    const cr = Math.cos(ph)
    const ci = Math.sin(ph)
    let r2 = 0

    for (let q = 0; q < N; q++) {
      const xr = x.re[q] as number
      const xi = x.im[q] as number

      r2 += ((Ux.re[q] as number) - (cr * xr - ci * xi)) ** 2 + ((Ux.im[q] as number) - (cr * xi + ci * xr)) ** 2
    }
    eigenResidual = Math.max(eigenResidual, Math.sqrt(r2))

    return { offset: wrap(ph - Math.PI), vector: x }
  })

  return { levels, steps: totalSteps, ritzResidual, subspace: m, eigenResidual, unconverged, rounds, complete }
}

// the weight of a full vector on the depth classes in `depths`
export function weightOnDepths(s: Slab, x: CVec, depths: ReadonlySet<number>): number {
  let w = 0

  for (let a = 0; a < s.qa; a++) {
    for (const c of depths) {
      const off = (a * s.L + c) * HALF_MODES

      for (let i = 0; i < HALF_MODES; i++) w += (x.re[off + i] as number) ** 2 + (x.im[off + i] as number) ** 2
    }
  }

  return w
}

export type FlowStep = { k2: number; levels: { offset: number; wallA: number }[]; ritzResidual: number; eigenResidual: number; subspace: number; unconverged: number; complete: boolean }
export type WallFlow = { steps: FlowStep[]; A: FlowCount; B: FlowCount; netA: number; netB: number; worstRitz: number; worstEigen: number; ambiguous: number }

// the levels near pi along the closed loop k2 = k2Start + 2 pi t, t = 0 .. 1 (steps + 1 samples, the last equal to the
// first up to a reciprocal vector), each labeled wall A (weight on `aDepths` above 1/2) or B, and the crossings of pi per
// wall. `ambiguous` counts levels whose wall weight lies in (0.2, 0.8): at an avoided crossing between the walls
export function wallFlow(s: Slab, sets: readonly HalfSet[], k0: number, k1: number, k2Start: number, loopSteps: number, roots: Roots, aDepths: ReadonlySet<number>, window: number, lanczosSteps: number, reach: number): WallFlow {
  const steps: FlowStep[] = []

  for (let t = 0; t <= loopSteps; t++) {
    const k2 = k2Start + (2 * Math.PI * t) / loopSteps
    const r = levelsNearPi(s, sets, [k0, k1, k2, 0], roots, window, lanczosSteps)

    steps.push({
      k2,
      levels: r.levels.map(l => ({ offset: l.offset, wallA: weightOnDepths(s, l.vector, aDepths) })),
      ritzResidual: r.ritzResidual,
      eigenResidual: r.eigenResidual,
      subspace: r.subspace,
      unconverged: r.unconverged,
      complete: r.complete,
    })
  }

  const sum = (a: FlowCount, b: FlowCount): FlowCount => ({ up: a.up + b.up, down: a.down + b.down, entries: a.entries + b.entries, exits: a.exits + b.exits, unmatched: 0 })
  let A: FlowCount = { up: 0, down: 0, entries: 0, exits: 0, unmatched: 0 }
  let B: FlowCount = { up: 0, down: 0, entries: 0, exits: 0, unmatched: 0 }
  let ambiguous = 0

  for (let t = 0; t < loopSteps; t++) {
    const before = steps[t] as FlowStep
    const after = steps[t + 1] as FlowStep
    const pick = (x: FlowStep, onA: boolean): number[] => x.levels.filter(l => (l.wallA > 0.5) === onA).map(l => Math.PI + l.offset)

    A = sum(A, wallCrossings(pick(before, true), pick(after, true), Math.PI, reach))
    B = sum(B, wallCrossings(pick(before, false), pick(after, false), Math.PI, reach))
    ambiguous += after.levels.filter(l => l.wallA > 0.2 && l.wallA < 0.8).length
  }

  return {
    steps,
    A,
    B,
    netA: A.up - A.down,
    netB: B.up - B.down,
    worstRitz: Math.max(...steps.map(x => x.ritzResidual)),
    worstEigen: Math.max(...steps.map(x => x.eigenResidual)),
    ambiguous,
  }
}
