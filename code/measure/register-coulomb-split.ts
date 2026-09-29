// THE COULOMB PAIR WITH ITS PULL SPLIT AROUND THE STREAM (the experiment spin/register-coulomb-split). E-SPN-0173's
// cycle applies the pull inside the beats: the S S phase with beat 1's mixer, the D D phase with beat 2's, then the two
// cross pieces. This file takes the pull out of the beats as one operator and places it around the free cycle, so the
// splitting can be chosen:
//
//   THE PIECES      P_SS = 1 + (e^(i phi) - 1) Q_S (x) Q_S and P_DD = 1 + (e^(i phi) - 1) Q_D' (x) Q_D' (Q_D' = T Q_D T^dag),
//                   weighted by the site's phase, each the sector-projector piece of register-meson's beat with the
//                   mixer set to 1 (alpha = 0, beta = e^(i phi) - 1). In coordinates P_SS changes block A only,
//                   A += beta (A + C1 X + C2 B + C1 C2 D), and P_DD block D only, D += beta (D + C1^dag B + C2^dag X +
//                   C1^dag C2^dag A). P_SD and P_DS are register-coulomb's cross pieces. Every piece maps into W (x) W and
//                   is the identity on its complement, so W (x) W stays exact
//   THE PULL        V = P_SS P_DS P_SD P_DD (applied P_DD first, P_SS last), the ordering that makes the factored cycle
//                   E-SPN-0173's own cycle conjugated by P_SS (below)
//   THE FREE CYCLE  K = M2' M1, register-meson's pairCycle with every pair phase zero
//   THREE CYCLES    'coulomb' E-SPN-0173's coulombCycle, untouched; 'factored' V K; 'strang' V_h K V_h, V_h the pull at
//                   half the phase (every piece at phi / 2: the count n in steps of the square-root unit, rho^(1/2))
//   THE TRUE DOCKS  dockCounts: each sector's pull at its members' true docks (the S D and D S pull at the mean of G over
//                   one root stencil, the D D pull over two), set into E-SPN-0173's cycle by splitEngine's `dock`
//
// WHY THE FACTORED CYCLE IS E-SPN-0173'S. P_SS commutes with M1 (both are functions of Q_S (x) 1 and 1 (x) Q_S, the
// phase diagonal in the orthonormal S_x) and P_DD with M2', and beat 1's piece is exactly M1 P_SS (its Q_S (x) Q_S
// coefficient is (u - 1)^2 + u^2 (e^(i phi) - 1) = u^2 e^(i phi) - 2 u + 1, register-meson's beta). So U = P_DS P_SD P_DD
// M2' M1 P_SS, and P_SS U = V K P_SS: the factored cycle is U conjugated by P_SS, the same spectrum. WHY THE STRANG CYCLE
// DIFFERS FROM IT ONLY THROUGH THE PIECES' ORDER: V_h K V_h = V_h^(-1) (V_h^2 K) V_h is conjugate to V_h^2 K, so its
// spectrum differs from V K's only as V_h^2 differs from V, which is the commutators of the four pieces with one another
// and never a commutator with the free cycle.
//
// DETERMINISM: no random numbers. FLOATS: measurement on exact pieces; the rule sees only the integer counts.

import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import {
  clonePair,
  axpy,
  blackmanHarris,
  inner,
  norm2,
  pairCycle,
  pairEngine,
  BLOCK,
  type PairEngine,
  type PairState,
  type RelBall,
} from '@/code/measure/register-meson'
import {
  coulombCycle,
  coulombEngine,
  crossPiece,
  type CoulombCount,
  type CoulombEngine,
} from '@/code/measure/register-coulomb'

const SITE = 256
const PAIR = 64
// the roots on the husk quotient's docks (their first three coordinates; the fourth is the depth, which G does not see)
const ROOTS3 = DOCK_ROOTS.map(r => [r[0]!, r[1]!, r[2]!])

// the three placements of the pull: E-SPN-0173's in-beat cycle, the pull after the free cycle, and the pull halved on
// both sides of it
export type SplitForm = 'coulomb' | 'factored' | 'strang'

// the engines one cycle needs: E-SPN-0173's (the 'coulomb' form, and the Gram metric every read uses), the free cycle,
// the whole pull and the half pull (each a CoulombEngine with the mixer 1, so crossPiece reads its e^(i phi) - 1)
export type SplitEngine = {
  form: SplitForm
  coulomb: CoulombEngine
  free: PairEngine
  pull: CoulombEngine
  half: CoulombEngine
}

// a pull-only engine: register-meson's engine with the mixer 1 (its overlaps, half-step phases and scratch), the phase
// phi per site and e^(i phi) - 1 in `cross` (read by crossPiece and by the two in-beat pieces here)
export function pullEngine(
  ball: RelBall,
  K: readonly number[],
  phi: readonly number[],
): CoulombEngine {
  const e = pairEngine(ball, { u: [1, 0], tau: 0, cap: 0, K })
  const cross = new Float64Array(2 * phi.length)

  phi.forEach((ph, i) => {
    cross[2 * i] = Math.cos(ph) - 1
    cross[2 * i + 1] = Math.sin(ph)
  })

  return Object.assign(e, {
    form: 'vector' as const,
    phi: Float64Array.from(phi),
    cross,
  })
}

// E-SPN-0173's engine, the free cycle, and the pull at phi(y) = -theta n(y) and at half of it. With `dock`, E-SPN-0173's
// engine instead takes each sector's pull at its members' true docks (dockCounts): S S as before, S D and D S at the
// one-stencil count, D D at the two-stencil count (the 'coulomb' form then runs E-SPN-0173's cycle with those phases)
export function splitEngine(
  ball: RelBall,
  u: readonly [number, number],
  K: readonly number[],
  count: CoulombCount,
  form: SplitForm,
  dock?: DockCounts,
): SplitEngine {
  const phi = Array.from(count.counts, n => -count.theta * n)
  const coulomb = coulombEngine(ball, u, K, count, 'vector')

  if (dock) {
    const [ur, ui] = u

    dock.DD.forEach((n, i) => {
      const b = betaOf(ur, -ui, -count.theta * n)

      coulomb.beta2[2 * i] = b[0]
      coulomb.beta2[2 * i + 1] = b[1]
    })

    dock.SD.forEach((n, i) => {
      coulomb.cross[2 * i] = Math.cos(count.theta * n) - 1
      coulomb.cross[2 * i + 1] = -Math.sin(count.theta * n)
    })
  }

  return {
    form,
    coulomb,
    free: pairEngine(ball, { u, tau: 0, cap: 0, K }),
    pull: pullEngine(ball, K, phi),
    half: pullEngine(
      ball,
      K,
      phi.map(x => x / 2),
    ),
  }
}

// w^2 e^(i phi) - 2 w + 1 (register-meson's beta, re-stated: it is private there)
function betaOf(wr: number, wi: number, phi: number): [number, number] {
  const w2r = wr * wr - wi * wi
  const w2i = 2 * wr * wi
  const c = Math.cos(phi)
  const s = Math.sin(phi)

  return [w2r * c - w2i * s - 2 * wr + 1, w2r * s + w2i * c - 2 * wi]
}

// THE TRUE DOCKS. T D_y's content sits on the neighbors y + r_d of its label with weight |E_d eta|^2, and sum_d r_d
// E_d^T E_d = 0 (the roots come in +- pairs and E_(-d) = -E_d), so its charge centroid IS the label: placing the pull at
// the true dock changes nothing at first order. What it changes is the second moment: the S D pair's charge separation
// is y + r_d (one stencil), the D D pair's y + r_d - r_e (two), and the pull a pair of spread charges feels is the mean
// of G over those. G is the Green's function of the root Laplacian, so the one-stencil mean equals G at every y but
// contact and the two-stencil mean at every y beyond one link: the true-dock pull differs from E-SPN-0173's only at the
// contact site (S D, D S) and within one link of it (D D). Counted as the S S pull is: floor(alpha G / theta).
export type DockCounts = { SD: Int32Array; DD: Int32Array }

export function dockCounts(
  ball: RelBall,
  green: (p: readonly number[]) => number,
  alpha: number,
  theta: number,
): DockCounts {
  const roots = ROOTS3
  const SD = new Int32Array(ball.points.length)
  const DD = new Int32Array(ball.points.length)

  ball.points.forEach((p, i) => {
    const [a, b, c] = p as [number, number, number]

    let one = 0
    let two = 0

    for (const q of roots) {
      one += green([a + q[0]!, b + q[1]!, c + q[2]!])

      for (const w of roots) {
        two += green([
          a + q[0]! - w[0]!,
          b + q[1]! - w[1]!,
          c + q[2]! - w[2]!,
        ])
      }
    }

    SD[i] = Math.floor((alpha * one) / roots.length / theta)
    DD[i] = Math.floor(
      (alpha * two) / (roots.length * roots.length) / theta,
    )
  })

  return { SD, DD }
}

// out = conv of a block (member m, C or C^dag), register-meson's conv re-stated (it is private there)
function conv(
  e: PairEngine,
  srcRe: Float64Array,
  srcIm: Float64Array,
  srcOff: number,
  srcStride: number,
  outRe: Float64Array,
  outIm: Float64Array,
  member: 1 | 2,
  dagger: boolean,
): void {
  const { ball } = e
  const N = ball.points.length
  const NR = e.C.length
  const table = (member === 1) !== dagger ? ball.minus : ball.plus
  const mats = dagger ? e.CT : e.C
  const sgn = dagger ? -1 : 1

  outRe.fill(0)
  outIm.fill(0)

  for (let i = 0; i < N; i++) {
    const oo = i * PAIR

    for (let d = 0; d < NR; d++) {
      const j = table[i * NR + d]!

      if (j < 0) {
        continue
      }

      const pr = e.halfRe[d]!
      const pi = sgn * e.halfIm[d]!
      const so = j * srcStride + srcOff
      const mm = mats[d] as {
        row: Int8Array
        col: Int8Array
        val: Float64Array
      }
      const L = mm.val.length

      for (let q = 0; q < L; q++) {
        const row = mm.row[q]!
        const col = mm.col[q]!
        const v = mm.val[q]!
        const wr = v * pr
        const wi = v * pi

        if (member === 1) {
          const ob = oo + row * 8
          const sb = so + col * 8

          for (let r2 = 0; r2 < 8; r2++) {
            const xr = srcRe[sb + r2]!
            const xi = srcIm[sb + r2]!

            outRe[ob + r2]! += wr * xr - wi * xi
            outIm[ob + r2]! += wr * xi + wi * xr
          }
        } else {
          for (let r1 = 0; r1 < 8; r1++) {
            const xr = srcRe[so + r1 * 8 + col]!
            const xi = srcIm[so + r1 * 8 + col]!

            outRe[oo + r1 * 8 + row]! += wr * xr - wi * xi
            outIm[oo + r1 * 8 + row]! += wr * xi + wi * xr
          }
        }
      }
    }
  }
}

// one in-beat piece in place: 'SS' A += beta (A + C1 X + C2 B + C1 C2 D), 'DD' D += beta (D + C1^dag B + C2^dag X +
// C1^dag C2^dag A), beta = e^(i phi) - 1 per site
export function sectorPiece(
  e: CoulombEngine,
  s: PairState,
  kind: 'SS' | 'DD',
): void {
  const N = e.ball.points.length
  const [t1r, t1i, t2r, t2i, t3r, t3i, t4r, t4i] = e.t as [
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
  ]
  const dagger = kind === 'DD'
  const own = kind === 'SS' ? BLOCK.A : BLOCK.D
  const far = kind === 'SS' ? BLOCK.D : BLOCK.A

  // t1 = C1 X or C1^dag B, t2 = C2 B or C2^dag X, t4 = C1 C2 D or C1^dag C2^dag A
  conv(
    e,
    s.re,
    s.im,
    kind === 'SS' ? BLOCK.X : BLOCK.B,
    SITE,
    t1r,
    t1i,
    1,
    dagger,
  )

  conv(
    e,
    s.re,
    s.im,
    kind === 'SS' ? BLOCK.B : BLOCK.X,
    SITE,
    t2r,
    t2i,
    2,
    dagger,
  )
  conv(e, s.re, s.im, far, SITE, t3r, t3i, 2, dagger)
  conv(e, t3r, t3i, 0, PAIR, t4r, t4i, 1, dagger)

  for (let i = 0; i < N; i++) {
    const br = e.cross[2 * i]!
    const bi = e.cross[2 * i + 1]!

    if (br === 0 && bi === 0) {
      continue
    }

    for (let k = 0; k < PAIR; k++) {
      const c = i * PAIR + k
      const o = i * SITE + own + k
      const pr = s.re[o]! + t1r[c]! + t2r[c]! + t4r[c]!
      const pi = s.im[o]! + t1i[c]! + t2i[c]! + t4i[c]!

      s.re[o]! += br * pr - bi * pi
      s.im[o]! += br * pi + bi * pr
    }
  }
}

// the whole pull V = P_SS P_DS P_SD P_DD in place (P_DD first)
export function applyPull(e: CoulombEngine, s: PairState): void {
  sectorPiece(e, s, 'DD')
  crossPiece(e, s, 'SD')
  crossPiece(e, s, 'DS')
  sectorPiece(e, s, 'SS')
}

// one cycle in the engine's form
export function splitCycle(e: SplitEngine, s: PairState): void {
  if (e.form === 'coulomb') {
    coulombCycle(e.coulomb, s)
  } else if (e.form === 'factored') {
    pairCycle(e.free, s)
    applyPull(e.pull, s)
  } else {
    applyPull(e.half, s)
    pairCycle(e.free, s)
    applyPull(e.half, s)
  }
}

// the filter and the level read on the chosen cycle (register-coulomb's coulombFilter and coulombRead)
export function splitFilter(
  e: SplitEngine,
  psi: PairState,
  phase: number,
  S: number,
): PairState {
  const out: PairState = {
    re: new Float64Array(psi.re.length),
    im: new Float64Array(psi.im.length),
  }
  const s = clonePair(psi)

  for (let k = 0; k < S; k++) {
    const w = blackmanHarris(k, S)

    axpy(out, s, w * Math.cos(-phase * k), w * Math.sin(-phase * k))
    splitCycle(e, s)
  }

  return out
}

export function splitRead(
  e: SplitEngine,
  v: PairState,
): { lambda: [number, number]; phase: number; residual: number } {
  const n = norm2(e.free, v)
  const Uv = clonePair(v)

  splitCycle(e, Uv)

  const [lr, li] = inner(e.free, v, Uv).map(x => x / n) as [
    number,
    number,
  ]
  const r = clonePair(Uv)

  axpy(r, v, -lr, -li)

  return {
    lambda: [lr, li],
    phase: Math.atan2(li, lr),
    residual: Math.sqrt(norm2(e.free, r) / n),
  }
}
