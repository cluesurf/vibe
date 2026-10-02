// ONE REGISTER MEMBER IN A FIXED STATIC FIELD (the experiment spin/register-member-h2plus, E-SPN-0190). A single member carrying
// E-SPN-0160's Cl+(4) register runs in the exact coordinates of its moving block (code/measure/register-meson: W = S + T D,
// a member in W is sum_x S_x a_x + sum_y T D_y b_y, a_x and b_y in C^8, 16 states a dock) on the HUSK QUOTIENT (docks
// Z^3, code/measure/register-coulomb's huskRelBall), with fixed sources in place of a partner. This is
// register-coulomb's pair engine cut to one body:
//
//   THE BEATS        beat 1 is 1 + (w1(x) - 1) Q_S, beat 2 is 1 + (w2(y) - 1) Q_D' (Q_D' = T Q_D T^dag), with the dock
//                    phases w1(x) = u e^(i phi(x)) and w2(y) = conj(u) e^(i phi(y)): the VECTOR form, the same phase on
//                    both sectors (a potential moves every sector's eps the same way, register-coulomb point 'vector').
//                    For one member there are no cross sectors, so the two beats carry the whole vector coupling. Each
//                    beat is 1 plus a sum of mutually orthogonal projectors (the S_x orthonormal, the T D_y
//                    orthonormal) times a phase minus 1, so it is unitary, maps W into W and is the identity on its
//                    complement: the member stays exactly in W.
//   IN COORDINATES   Q_S (a, b) = (a + C b, 0) and Q_D' (a, b) = (0, b + C^dag a), with (C b)_x = sum_d C(r_d) b_(x - r_d)
//                    and (C^dag a)_y = sum_d C(r_d)^T a_(y + r_d) (C(r) = c0 gamma(r)^T is real). So beat 1: a <- w1 a +
//                    (w1 - 1) C b; beat 2: b <- w2 b + (w2 - 1) C^dag a. At phi = 0 on a Bloch state this is
//                    register-meson's memberCycle(u, K) exactly (the instrument gate reads it)
//   THE METRIC       <v | G w> = a_v^dag a_w + b_v^dag b_w + a_v^dag (C b_w) + b_v^dag (C^dag a_w)
//   THE EDGE         a shift out of the ball is dropped (the edge absorbs); capsuleBall gives the docks near a segment
//
// DETERMINISM: no random numbers. FLOATS: measurement on exact pieces (the overlap's c0 is irrational only through the
// normalization; the field's phases are floats).

import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { huskPoint } from '@/code/measure/husk-meson'
import { C0, type RelBall } from '@/code/measure/register-meson'
import { gammaMatrices } from '@/code/measure/spinor-register'

const REG = 8
const SITE = 16
const NR = DOCK_ROOTS.length

export type MemberState = { re: Float64Array; im: Float64Array }

export type MemberEngine = {
  ball: RelBall
  u: readonly [number, number]
  // w1 and w2 per dock, interleaved re, im
  w1: Float64Array
  w2: Float64Array
  // each root's two nonzero components and their signs
  comp: Int32Array
  sign: Int8Array
  // c0 gamma_i^T as (row a, column i * 8 + eta, value) entries over the four i
  gRow: Int32Array
  gCol: Int32Array
  gVal: Float64Array
  // c0 gamma_i as (row eta, column i * 8 + a) entries, the same values
  hRow: Int32Array
  hCol: Int32Array
  // scratch
  tRe: Float64Array
  tIm: Float64Array
  bRe: Float64Array
  bIm: Float64Array
}

export const newMember = (ball: RelBall): MemberState => ({
  re: new Float64Array(ball.points.length * SITE),
  im: new Float64Array(ball.points.length * SITE),
})

export const cloneMember = (s: MemberState): MemberState => ({
  re: Float64Array.from(s.re),
  im: Float64Array.from(s.im),
})

export function memberEngine(
  ball: RelBall,
  u: readonly [number, number],
  phi: ArrayLike<number>,
): MemberEngine {
  const n = ball.points.length
  const w1 = new Float64Array(2 * n)
  const w2 = new Float64Array(2 * n)
  const [ur, ui] = u

  for (let i = 0; i < n; i++) {
    const c = Math.cos(phi[i]!)
    const s = Math.sin(phi[i]!)

    w1[2 * i] = ur * c - ui * s
    w1[2 * i + 1] = ur * s + ui * c
    w2[2 * i] = ur * c + ui * s
    w2[2 * i + 1] = ur * s - ui * c
  }

  const comp = new Int32Array(2 * NR)
  const sign = new Int8Array(2 * NR)

  DOCK_ROOTS.forEach((r, d) => {
    const nz = [0, 1, 2, 3].filter(i => r[i] !== 0)

    if (nz.length !== 2 || nz.some(i => Math.abs(r[i]!) !== 1)) {
      throw new Error(
        'register-member-field: a root is not +-e_i +- e_j',
      )
    }

    nz.forEach((i, h) => {
      comp[2 * d + h] = i
      sign[2 * d + h] = r[i]! > 0 ? 1 : -1
    })
  })

  // C(r)[a][eta] = c0 sum_i r_i g[i][eta][a]
  const g = gammaMatrices()
  const gr: number[] = []
  const gc: number[] = []
  const gv: number[] = []
  const hr: number[] = []
  const hc: number[] = []

  for (let i = 0; i < 4; i++) {
    for (let a = 0; a < REG; a++) {
      for (let eta = 0; eta < REG; eta++) {
        const x = g[i]![eta]![a]!

        if (x !== 0) {
          gr.push(a)
          gc.push(i * REG + eta)
          gv.push(C0 * x)
          hr.push(eta)
          hc.push(i * REG + a)
        }
      }
    }
  }

  return {
    ball,
    u,
    w1,
    w2,
    comp,
    sign,
    gRow: Int32Array.from(gr),
    gCol: Int32Array.from(gc),
    gVal: Float64Array.from(gv),
    hRow: Int32Array.from(hr),
    hCol: Int32Array.from(hc),
    tRe: new Float64Array(n * REG),
    tIm: new Float64Array(n * REG),
    bRe: new Float64Array(4 * REG),
    bIm: new Float64Array(4 * REG),
  }
}

// t_x = sum_d C(r_d) b_(x - r_d) (dagger false), or t_y = sum_d C(r_d)^T a_(y + r_d) (dagger true). C(r) = c0
// gamma(r)^T is linear in r, so t = sum_i c0 gamma_i^T B_i with B_i(x) = sum_d (r_d)_i b_(x - r_d) (a root has two
// nonzero components, each +-1): the root sums are additions, and the four gammas act once a dock
function convolve(
  e: MemberEngine,
  s: MemberState,
  dagger: boolean,
): void {
  const { ball, tRe, tIm, comp, sign, gRow, gCol, gVal, bRe, bIm } = e
  // the transposed entries share gVal
  const n = ball.points.length
  const table = dagger ? ball.plus : ball.minus
  const srcOff = dagger ? 0 : REG
  const rows = dagger ? e.hRow : gRow
  const cols = dagger ? e.hCol : gCol
  const sr = s.re
  const si = s.im

  for (let i = 0; i < n; i++) {
    bRe.fill(0)
    bIm.fill(0)

    for (let d = 0; d < NR; d++) {
      const j = table[i * NR + d]!

      if (j < 0) {
        continue
      }

      const so = j * SITE + srcOff

      for (let h = 0; h < 2; h++) {
        const c = comp[2 * d + h]! * REG
        const sg = sign[2 * d + h]!

        if (sg > 0) {
          for (let q = 0; q < REG; q++) {
            bRe[c + q]! += sr[so + q]!
            bIm[c + q]! += si[so + q]!
          }
        } else {
          for (let q = 0; q < REG; q++) {
            bRe[c + q]! -= sr[so + q]!
            bIm[c + q]! -= si[so + q]!
          }
        }
      }
    }

    const o = i * REG

    for (let q = 0; q < REG; q++) {
      tRe[o + q] = 0
      tIm[o + q] = 0
    }

    for (let k = 0; k < gVal.length; k++) {
      const t = o + rows[k]!
      const c = cols[k]!
      const v = gVal[k]!

      tRe[t]! += v * bRe[c]!
      tIm[t]! += v * bIm[c]!
    }
  }
}

// one cycle: beat 1 on the S coordinates, then beat 2 on the D coordinates with the updated a
export function memberFieldCycle(
  e: MemberEngine,
  s: MemberState,
): void {
  const n = e.ball.points.length

  convolve(e, s, false)

  for (let i = 0; i < n; i++) {
    const wr = e.w1[2 * i]!
    const wi = e.w1[2 * i + 1]!
    const mr = wr - 1

    for (let p = 0; p < REG; p++) {
      const k = i * SITE + p
      const ar = s.re[k]!
      const ai = s.im[k]!
      const tr = e.tRe[i * REG + p]!
      const ti = e.tIm[i * REG + p]!

      s.re[k] = wr * ar - wi * ai + mr * tr - wi * ti
      s.im[k] = wr * ai + wi * ar + mr * ti + wi * tr
    }
  }

  convolve(e, s, true)

  for (let i = 0; i < n; i++) {
    const wr = e.w2[2 * i]!
    const wi = e.w2[2 * i + 1]!
    const mr = wr - 1

    for (let p = 0; p < REG; p++) {
      const k = i * SITE + REG + p
      const br = s.re[k]!
      const bi = s.im[k]!
      const tr = e.tRe[i * REG + p]!
      const ti = e.tIm[i * REG + p]!

      s.re[k] = wr * br - wi * bi + mr * tr - wi * ti
      s.im[k] = wr * bi + wi * br + mr * ti + wi * tr
    }
  }
}

// <v | G w>
export function memberInner(
  e: MemberEngine,
  v: MemberState,
  w: MemberState,
): [number, number] {
  const n = e.ball.points.length

  let xr = 0
  let xi = 0

  for (let k = 0; k < n * SITE; k++) {
    xr += v.re[k]! * w.re[k]! + v.im[k]! * w.im[k]!
    xi += v.re[k]! * w.im[k]! - v.im[k]! * w.re[k]!
  }

  // a_v^dag (C b_w)
  convolve(e, w, false)

  for (let i = 0; i < n; i++) {
    for (let p = 0; p < REG; p++) {
      const k = i * SITE + p
      const tr = e.tRe[i * REG + p]!
      const ti = e.tIm[i * REG + p]!

      xr += v.re[k]! * tr + v.im[k]! * ti
      xi += v.re[k]! * ti - v.im[k]! * tr
    }
  }

  // b_v^dag (C^dag a_w)
  convolve(e, w, true)

  for (let i = 0; i < n; i++) {
    for (let p = 0; p < REG; p++) {
      const k = i * SITE + REG + p
      const tr = e.tRe[i * REG + p]!
      const ti = e.tIm[i * REG + p]!

      xr += v.re[k]! * tr + v.im[k]! * ti
      xi += v.re[k]! * ti - v.im[k]! * tr
    }
  }

  return [xr, xi]
}

export const memberNorm2 = (e: MemberEngine, s: MemberState): number =>
  memberInner(e, s, s)[0]

export function scaleMember(s: MemberState, f: number): void {
  for (let k = 0; k < s.re.length; k++) {
    s.re[k]! *= f
    s.im[k]! *= f
  }
}

// G w as a state: (a + C b, b + C^dag a)
export function memberGram(
  e: MemberEngine,
  w: MemberState,
): MemberState {
  const n = e.ball.points.length
  const out = cloneMember(w)

  convolve(e, w, false)

  for (let i = 0; i < n; i++) {
    for (let p = 0; p < REG; p++) {
      out.re[i * SITE + p]! += e.tRe[i * REG + p]!
      out.im[i * SITE + p]! += e.tIm[i * REG + p]!
    }
  }

  convolve(e, w, true)

  for (let i = 0; i < n; i++) {
    for (let p = 0; p < REG; p++) {
      out.re[i * SITE + REG + p]! += e.tRe[i * REG + p]!
      out.im[i * SITE + REG + p]! += e.tIm[i * REG + p]!
    }
  }

  return out
}

// x^dag y, the plain coordinate dot product
export function memberDot(
  x: MemberState,
  y: MemberState,
): [number, number] {
  let xr = 0
  let xi = 0

  for (let k = 0; k < x.re.length; k++) {
    xr += x.re[k]! * y.re[k]! + x.im[k]! * y.im[k]!
    xi += x.re[k]! * y.im[k]! - x.im[k]! * y.re[k]!
  }

  return [xr, xi]
}

// c_l = <G v | U^l v>, l = 0 .. N: G v formed once (G is self-adjoint on the ball, and U is unitary in G away from the
// absorbing edge, so this is <v | G U^l v> wherever the state has no weight at the edge), one dot product a cycle
export function memberAutocorrelation(
  e: MemberEngine,
  v: MemberState,
  N: number,
): { re: Float64Array; im: Float64Array } {
  const re = new Float64Array(N + 1)
  const im = new Float64Array(N + 1)
  const st = cloneMember(v)
  const gv = memberGram(e, v)

  for (let l = 0; l <= N; l++) {
    const [r, i] = memberDot(gv, st)

    re[l] = r
    im[l] = i

    if (l < N) {
      memberFieldCycle(e, st)
    }
  }

  return { re, im }
}

// the start: the S coordinates carry profile(x) times the register unit vector e_reg, the D coordinates nothing
export function memberStart(
  ball: RelBall,
  profile: (p: readonly number[]) => number,
  reg = 0,
): MemberState {
  const s = newMember(ball)

  ball.points.forEach((p, i) => {
    s.re[i * SITE + reg] = profile(p)
  })

  return s
}

// the coordinate weight a dock carries (|a|^2 + |b|^2, a profile: the metric's cross terms spread it over neighbours)
export function memberSiteWeights(
  ball: RelBall,
  s: MemberState,
): Float64Array {
  const n = ball.points.length
  const w = new Float64Array(n)

  for (let i = 0; i < n; i++) {
    let x = 0

    for (let k = 0; k < SITE; k++) {
      const c = i * SITE + k

      x += s.re[c]! * s.re[c]! + s.im[c]! * s.im[c]!
    }

    w[i] = x
  }

  return w
}

// the husk docks within distance rho of the segment between two points on the x axis (x0 <= x1), as a RelBall (the
// root shifts reduced to the quotient's representative, a shift out of the region dropped; V unused, 0)
export function capsuleBall(
  x0: number,
  x1: number,
  rho: number,
): RelBall {
  const points: number[][] = []
  const r = Math.ceil(rho)
  const key = (a: number, b: number, c: number): string =>
    huskPoint(a, b, c).join(',')

  for (let a = Math.floor(x0 - rho); a <= Math.ceil(x1 + rho); a++) {
    const dx = a < x0 ? a - x0 : a > x1 ? a - x1 : 0

    for (let b = -r; b <= r; b++) {
      for (let c = -r; c <= r; c++) {
        if (Math.hypot(dx, b, c) <= rho) {
          points.push(huskPoint(a, b, c))
        }
      }
    }
  }

  const index = new Map(points.map((p, i) => [p.join(','), i]))
  const plus = new Int32Array(points.length * NR)
  const minus = new Int32Array(points.length * NR)

  points.forEach((p, i) => {
    DOCK_ROOTS.forEach((q, d) => {
      plus[i * NR + d] =
        index.get(key(p[0]! + q[0]!, p[1]! + q[1]!, p[2]! + q[2]!)) ??
        -1

      minus[i * NR + d] =
        index.get(key(p[0]! - q[0]!, p[1]! - q[1]!, p[2]! - q[2]!)) ??
        -1
    })
  })

  return {
    radius: r,
    points,
    index,
    plus,
    minus,
    V: new Int32Array(points.length),
  }
}
