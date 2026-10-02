// THE SECTOR WEIGHTS OF A REGISTER PAIR (E-GRV-0152). Gravity's count field under the register rule is sourced by the
// sector counts at each beat's stage (E-GRV-0146, 0147): the weight in Q_S at the start of beat 1 and the weight in the
// carried partner sector T D at the start of beat 2. For a pair held in its exact moving block W (x) W
// (code/measure/register-meson's coordinates: blocks A = S (x) S, B = S (x) T D, X = T D (x) S, D = T D (x) T D) this file
// writes the four one-member projectors in coordinates, as exact orthogonal projectors in the Gram metric:
//   Q_S on member 1:  A <- A + C1 X,  B <- B + C1 D,  X, D <- 0
//   Q_S on member 2:  A <- A + C2 B,  X <- X + C2 D,  B, D <- 0
//   Q_D on member 1:  X <- X + C1^dag A,  D <- D + C1^dag B,  A, B <- 0
//   Q_D on member 2:  B <- B + C2^dag A,  D <- D + C2^dag X,  A, X <- 0
// (a member in W is S a + T D b; its S part is S (a + C b) and its T D part T D (b + C^dag a)), and beat 1 and beat 2
// from them: beat 1 = 1 + alpha (Q_S1 + Q_S2) + beta1(V) Q_S1 Q_S2, beat 2 the same on Q_D with beta2. The convolution
// is register-meson's, copied (it is not exported there).
//
// DETERMINISM: no random numbers. FLOATS: measurement on exact pieces.

import {
  BLOCK,
  inner,
  type PairEngine,
  type PairState,
} from '@/code/measure/register-meson'

const PAIR = 64
const SITE = 256

const newLike = (s: PairState): PairState => ({
  re: new Float64Array(s.re.length),
  im: new Float64Array(s.im.length),
})

// register-meson's conv: out (a block field) = C or C^dag on member 1 or 2 applied to a source block
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
  const NR = e.halfRe.length
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
      const m = mats[d]!
      const L = m.val.length

      for (let q = 0; q < L; q++) {
        const row = m.row[q]!
        const col = m.col[q]!
        const v = m.val[q]!
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

export type Sector = 'S' | 'D'

// the one-member projector Q_S or Q_D (carried) on member 1 or 2, applied to s (a new state)
export function projectMember(
  e: PairEngine,
  s: PairState,
  sector: Sector,
  member: 1 | 2,
): PairState {
  const N = e.ball.points.length
  const out = newLike(s)
  const tr = new Float64Array(N * PAIR)
  const ti = new Float64Array(N * PAIR)
  // [kept block, block fed through C into it] for the two kept blocks
  const plan: [number, number][] =
    sector === 'S'
      ? member === 1
        ? [
            [BLOCK.A, BLOCK.X],
            [BLOCK.B, BLOCK.D],
          ]
        : [
            [BLOCK.A, BLOCK.B],
            [BLOCK.X, BLOCK.D],
          ]
      : member === 1
        ? [
            [BLOCK.X, BLOCK.A],
            [BLOCK.D, BLOCK.B],
          ]
        : [
            [BLOCK.B, BLOCK.A],
            [BLOCK.D, BLOCK.X],
          ]

  for (const [keep, from] of plan) {
    conv(e, s.re, s.im, from, SITE, tr, ti, member, sector === 'D')

    for (let i = 0; i < N; i++) {
      for (let k = 0; k < PAIR; k++) {
        const o = i * SITE + keep + k
        const c = i * PAIR + k

        out.re[o] = s.re[o]! + tr[c]!
        out.im[o] = s.im[o]! + ti[c]!
      }
    }
  }

  return out
}

// one beat from the projectors: s + alpha (Q1 s + Q2 s) + beta(V) Q1 Q2 s, alpha = w - 1 (w = u in beat 1, conj u in
// beat 2), beta the engine's beta1 or beta2 a site
export function beatFromProjectors(
  e: PairEngine,
  s: PairState,
  beat: 1 | 2,
): PairState {
  const sector: Sector = beat === 1 ? 'S' : 'D'
  const [ur, ui] = e.params.u
  const ar = ur - 1
  const ai = beat === 1 ? ui : -ui
  const beta = beat === 1 ? e.beta1 : e.beta2
  const q1 = projectMember(e, s, sector, 1)
  const q2 = projectMember(e, s, sector, 2)
  const q12 = projectMember(e, q2, sector, 1)
  const out: PairState = {
    re: Float64Array.from(s.re),
    im: Float64Array.from(s.im),
  }
  const N = e.ball.points.length

  for (let i = 0; i < N; i++) {
    const br = beta[2 * i]!
    const bi = beta[2 * i + 1]!

    for (let k = 0; k < SITE; k++) {
      const o = i * SITE + k
      const xr = q1.re[o]! + q2.re[o]!
      const xi = q1.im[o]! + q2.im[o]!
      const yr = q12.re[o]!
      const yi = q12.im[o]!

      out.re[o]! += ar * xr - ai * xi + br * yr - bi * yi
      out.im[o]! += ar * xi + ai * xr + br * yi + bi * yr
    }
  }

  return out
}

export type SectorWeights = {
  // per member: [member 1, member 2]
  s: [number, number]
  d: [number, number]
  // sigma_S = s1 + s2 (the S count at the start of beat 1), sigma_D = d1 + d2 (the D count at the start of beat 2)
  sigmaS: number
  sigmaD: number
  // the projector check: |<psi|Q psi> - <Q psi|Q psi>| over the four readings, relative to the norm
  projector: number
}

// the sector counts of a pair state psi at the start of beat 1: Q_S weights on psi, Q_D weights on the state after beat
// 1 (`afterBeat1`, given by the caller, so a cycle with extra pieces is read at its own stage)
export function sectorWeights(
  e: PairEngine,
  psi: PairState,
  afterBeat1: PairState,
): SectorWeights {
  const read = (
    x: PairState,
    sector: Sector,
    member: 1 | 2,
  ): [number, number] => {
    const n = inner(e, x, x)[0]
    const q = projectMember(e, x, sector, member)
    const w = inner(e, q, q)[0] / n
    const v = inner(e, x, q)[0] / n

    return [w, Math.abs(v - w)]
  }

  const s1 = read(psi, 'S', 1)
  const s2 = read(psi, 'S', 2)
  const d1 = read(afterBeat1, 'D', 1)
  const d2 = read(afterBeat1, 'D', 2)

  return {
    s: [s1[0], s2[0]],
    d: [d1[0], d2[0]],
    sigmaS: s1[0] + s2[0],
    sigmaD: d1[0] + d2[0],
    projector: Math.max(s1[1], s2[1], d1[1], d2[1]),
  }
}
