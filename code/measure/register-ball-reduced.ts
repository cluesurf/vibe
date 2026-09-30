// THE REGISTER PAIR ON THE D4 RELATIVE BALL, REDUCED BY THE SIGNED PERMUTATIONS (E-SPN-0178's engine). code/measure/
// register-meson runs two register members bound by the singlet-pair string over their relative position on a D4 ball,
// 256 states a relative site, at a cost linear in the ball's sites (4.7 R^4 of them: 133,225 at radius 13, 1.55 million
// at radius 24). A pair set at rest with the registers paired by delta and an s-wave profile (sStart, shellStart) lies in
// the sector every signed permutation of the four coordinates keeps, at total momentum K = 0. This file runs the SAME
// cycle on that sector, one representative a signed-permutation orbit, which is about 384 times fewer sites:
//
//   THE GROUP        the 384 signed permutations g of the four coordinates, (g x)_i = sign_i x_(perm_i). Each is an element
//                    of W(F4) (checked against spinor-register's f4Group): it maps the D4 roots to roots, keeps d4Steps, and
//                    acts on the register by minors, which for a signed permutation is a signed permutation of the 8 even
//                    and of the 8 odd blades (code/measure/register-reduced's argument, there for the 48 that keep the
//                    depth coordinate; here for all four coordinates). Covariance C(g r) = rho_e C(r) rho_o^T is counted
//   THE SECTOR       the states with psi(g y) = rho(g) psi(y) for every g, stored at the canonical point of each orbit
//                    (|y| sorted, largest first); a neighbour is read as the signed index permutation rho(g) of its
//                    representative's block, g any element taking the representative to it (every choice agrees on an
//                    invariant state). At K = 0 every g fixes K, and the string phase depends on V = d4Steps alone
//   THE INNER        <a | G b> is the sum over representatives of the orbit size times the local product
//   THE WITNESS      unfoldBall writes a reduced state out on register-meson's relative ball, so a reduced cycle can be
//                    compared entry by entry with the unreduced one (E-SPN-0178's I1)
//
// DETERMINISM: no random numbers. FLOATS: measurement on exact pieces, as in code/measure/register-meson. The sum over the
// 24 roots at a representative runs in register-meson's order, and a neighbour's value is an exact signed permutation of
// its representative's, so the reduced cycle equals the unreduced one to the order of float summation.
//
// SPEED (opt in): ballEngine(s, params, { backend: 'native', threads: 12 }) runs ballCycle, ballGram, ballInner and
// ballFilter on code/kernel (the Rust crate kernel/, built by task/kernel/build.ts), byte for byte the JavaScript below
// at any thread count (task/kernel/check.ts). With no options the engine is this file's JavaScript, unchanged.

import { kernel, type KernelOptions } from '@/code/kernel/index'
import {
  fastBall,
  fastCycle,
  fastFilter,
  fastGram,
  fastInner,
  type FastPair,
} from '@/code/kernel/pair'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import {
  betaOf,
  blackmanHarris,
  newPair,
  overlapMatrices,
  type PairParams,
  type PairState,
  type RelBall,
  type SparseEight,
} from '@/code/measure/register-meson'
import { oddAction } from '@/code/measure/register-reduced'
import { evenAction, f4Group } from '@/code/measure/spinor-register'

const REG = 8
const PAIR = 64
const SITE = 256
const ROOTS = DOCK_ROOTS
const NR = ROOTS.length

const dot = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((s, x, k) => s + x * b[k]!, 0)

const d4Steps = (v: readonly number[]): number =>
  Math.max(
    ...v.map(Math.abs),
    v.reduce((s, x) => s + Math.abs(x), 0) / 2,
  )

// ---- the group ----

export type BallElement = {
  perm: number[]
  sign: number[]
  // per pair type t (0 A even-even, 1 B even-odd, 2 X odd-even, 3 D odd-odd): psi(g y)[k] = sgn[t][k] psi(y)[src[t][k]]
  src: Int16Array[]
  sgn: Int8Array[]
}

export type BallGroup = {
  elements: BallElement[]
  // (perm, sign) key to element index
  index: Map<string, number>
  // (element, root) pairs where C(g r) differs from rho_e C(r) rho_o^T or g r is not the root f4Group names
  covariance: number
  checked: number
}

const elementKey = (perm: readonly number[], sign: readonly number[]): string =>
  `${perm.join('')}:${sign.map(s => (s < 0 ? '-' : '+')).join('')}`

// a monomial 8 x 8 matrix [row][col] as (image of each column, its sign); throws if it is not a signed permutation
function monomial(m: readonly (readonly number[])[]): {
  image: number[]
  sign: number[]
} {
  const image: number[] = []
  const sign: number[] = []

  for (let c = 0; c < REG; c++) {
    const rows = [...Array(REG).keys()].filter(
      r => (m[r] as number[])[c]! !== 0,
    )

    if (
      rows.length !== 1 ||
      Math.abs((m[rows[0]!] as number[])[c]!) !== 1
    ) {
      throw new Error(
        'register-ball-reduced: the register action is not a signed permutation',
      )
    }

    image.push(rows[0]!)
    sign.push((m[rows[0]!] as number[])[c]!)
  }

  return { image, sign }
}

function permutations(n: number): number[][] {
  if (n === 1) {
    return [[0]]
  }

  const out: number[][] = []

  for (const p of permutations(n - 1)) {
    for (let k = 0; k <= p.length; k++) {
      out.push([...p.slice(0, k), n - 1, ...p.slice(k)])
    }
  }

  return out
}

export function ballGroup(): BallGroup {
  const f4 = new Map(
    f4Group().map(e => [e.matrix.map(r => r.join(',')).join(';'), e]),
  )
  const { dense } = overlapMatrices()
  const elements: BallElement[] = []
  const index = new Map<string, number>()

  let covariance = 0
  let checked = 0

  for (const perm of permutations(4)) {
    for (let s = 0; s < 16; s++) {
      const sign = [0, 1, 2, 3].map(i => (s & (1 << i) ? -1 : 1))
      const matrix: number[][] = [0, 1, 2, 3].map(i =>
        [0, 1, 2, 3].map(j => (j === perm[i]! ? sign[i]! : 0)),
      )
      const found = f4.get(matrix.map(r => r.join(',')).join(';'))

      if (!found) {
        throw new Error(
          'register-ball-reduced: a signed permutation is not in W(F4)',
        )
      }

      const even = monomial(evenAction(matrix))
      const odd = monomial(oddAction(matrix))
      const src: Int16Array[] = []
      const sgn: Int8Array[] = []

      for (let t = 0; t < 4; t++) {
        const m1 = t & 2 ? odd : even
        const m2 = t & 1 ? odd : even
        const sr = new Int16Array(PAIR)
        const sg = new Int8Array(PAIR)

        for (let r1 = 0; r1 < REG; r1++) {
          for (let r2 = 0; r2 < REG; r2++) {
            const to = m1.image[r1]! * 8 + m2.image[r2]!

            sr[to] = r1 * 8 + r2
            sg[to] = m1.sign[r1]! * m2.sign[r2]!
          }
        }

        src.push(sr)
        sgn.push(sg)
      }

      ROOTS.forEach((r, d) => {
        const gd = found.slots[d]!
        const want = dense[gd]!
        const have = dense[d]!

        let bad = false

        for (let a = 0; a < REG; a++) {
          for (let e = 0; e < REG; e++) {
            const x = have[a]![e]!

            if (x === 0) {
              continue
            }

            if (
              Math.abs(
                want[even.image[a]!]![odd.image[e]!]! -
                  even.sign[a]! * odd.sign[e]! * x,
              ) > 1e-15
            ) {
              bad = true
            }
          }
        }

        const image = [0, 1, 2, 3].map(i => dot(matrix[i]!, r))

        if (image.join(',') !== (ROOTS[gd] as number[]).join(',')) {
          bad = true
        }

        checked++

        if (bad) {
          covariance++
        }
      })

      index.set(elementKey(perm, sign), elements.length)
      elements.push({ perm, sign, src, sgn })
    }
  }

  return { elements, index, covariance, checked }
}

// ---- the sector: canonical representatives and their neighbour tables ----

export type BallSector = {
  group: BallGroup
  radius: number
  // representative coordinates (4 each, |y| sorted, largest first) and their string length
  reps: Int32Array
  V: Int32Array
  orbit: Float64Array
  count: number
  sites: number
  // per representative and root: the neighbour's representative (or -1 outside the ball) and the element g with
  // neighbour = g (representative); plus is y + r_d, minus is y - r_d
  plusRep: Int32Array
  plusG: Int16Array
  minusRep: Int32Array
  minusG: Int16Array
}

const repKey = (R: number, v: readonly number[]): number =>
  v[0]! + (R + 2) * (v[1]! + (R + 2) * (v[2]! + (R + 2) * v[3]!))

// the canonical point of y's orbit and the element g with g (canonical) = y
export function canonicalOf(
  group: BallGroup,
  y: readonly number[],
): { rep: number[]; g: number } {
  const order = [0, 1, 2, 3].sort(
    (i, j) => Math.abs(y[j]!) - Math.abs(y[i]!) || i - j,
  )
  const rep = order.map(i => Math.abs(y[i]!))
  const perm = [0, 0, 0, 0]
  const sign = [1, 1, 1, 1]

  order.forEach((i, k) => {
    perm[i] = k
    sign[i] = y[i]! < 0 ? -1 : 1
  })

  return { rep, g: group.index.get(elementKey(perm, sign))! }
}

// the number of distinct signed permutations of a canonical point
const orbitSize = (v: readonly number[]): number => {
  const fact = [1, 1, 2, 6, 24]
  const counts = new Map<number, number>()

  for (const x of v) {
    counts.set(x, (counts.get(x) ?? 0) + 1)
  }

  let perms = 24

  for (const c of counts.values()) {
    perms /= fact[c]!
  }

  return perms * 2 ** v.filter(x => x !== 0).length
}

export function ballSector(group: BallGroup, radius: number): BallSector {
  const reps: number[] = []
  const Vs: number[] = []
  const orbit: number[] = []
  const at = new Map<number, number>()

  for (let a = 0; a <= radius; a++) {
    for (let b = 0; b <= a; b++) {
      for (let c = 0; c <= b; c++) {
        for (let e = 0; e <= c; e++) {
          const v = [a, b, c, e]

          if ((a + b + c + e) % 2 !== 0 || d4Steps(v) > radius) {
            continue
          }

          at.set(repKey(radius, v), reps.length / 4)
          reps.push(a, b, c, e)
          Vs.push(d4Steps(v))
          orbit.push(orbitSize(v))
        }
      }
    }
  }

  const count = reps.length / 4
  const plusRep = new Int32Array(count * NR)
  const plusG = new Int16Array(count * NR)
  const minusRep = new Int32Array(count * NR)
  const minusG = new Int16Array(count * NR)

  for (let i = 0; i < count; i++) {
    const y = [0, 1, 2, 3].map(k => reps[4 * i + k]!)

    ROOTS.forEach((r, d) => {
      for (const [s, repOut, gOut] of [
        [1, plusRep, plusG],
        [-1, minusRep, minusG],
      ] as const) {
        const q = y.map((x, k) => x + s * r[k]!)

        if (d4Steps(q) > radius) {
          repOut[i * NR + d] = -1
          gOut[i * NR + d] = -1
        } else {
          const c = canonicalOf(group, q)

          repOut[i * NR + d] = at.get(repKey(radius, c.rep))!
          gOut[i * NR + d] = c.g
        }
      }
    })
  }

  return {
    group,
    radius,
    reps: Int32Array.from(reps),
    V: Int32Array.from(Vs),
    orbit: Float64Array.from(orbit),
    count,
    sites: orbit.reduce((s, x) => s + x, 0),
    plusRep,
    plusG,
    minusRep,
    minusG,
  }
}

// ---- the engine ----

export type BallState = { re: Float64Array; im: Float64Array }

export type BallEngine = {
  s: BallSector
  params: PairParams
  halfRe: Float64Array
  halfIm: Float64Array
  beta1: Float64Array
  beta2: Float64Array
  C: SparseEight[]
  CT: SparseEight[]
  t: Float64Array[]
  tmpRe: Float64Array
  tmpIm: Float64Array
  // present only when a kernel backend was asked for: the cycle, Gram, inner and filter then run on it
  fast?: FastPair
}

// register-meson's pairEngine on the sector (params.K must be 0: the sector is the one every signed permutation keeps);
// options.backend puts the heavy loops on a kernel (absent: this file's JavaScript)
export function ballEngine(
  s: BallSector,
  params: PairParams,
  options?: KernelOptions,
): BallEngine {
  if (params.K.some(k => k !== 0)) {
    throw new Error(
      'register-ball-reduced: the reduced sector needs total momentum 0',
    )
  }

  const { sparse, sparseT } = overlapMatrices()
  const N = s.count
  const beta1 = new Float64Array(2 * N)
  const beta2 = new Float64Array(2 * N)
  const [ur, ui] = params.u

  for (let i = 0; i < N; i++) {
    const V = Math.min(s.V[i]!, params.cap)
    const b1 = betaOf(ur, ui, params.tau * V)
    const b2 = betaOf(ur, -ui, -params.tau * V)

    beta1[2 * i] = b1[0]
    beta1[2 * i + 1] = b1[1]
    beta2[2 * i] = b2[0]
    beta2[2 * i + 1] = b2[1]
  }

  const e: BallEngine = {
    s,
    params,
    halfRe: new Float64Array(NR).fill(1),
    halfIm: new Float64Array(NR),
    beta1,
    beta2,
    C: sparse,
    CT: sparseT,
    t: Array.from({ length: 12 }, () => new Float64Array(N * PAIR)),
    tmpRe: new Float64Array(PAIR),
    tmpIm: new Float64Array(PAIR),
  }

  if (options?.backend) {
    e.fast = fastBall(e, kernel(options.backend, options.threads ?? 1))
  }

  return e
}

export const newBall = (s: BallSector): BallState => ({
  re: new Float64Array(s.count * SITE),
  im: new Float64Array(s.count * SITE),
})

export const cloneBall = (x: BallState): BallState => ({
  re: Float64Array.from(x.re),
  im: Float64Array.from(x.im),
})

// out = conv of a source block (type t) on member m with C (dagger false) or C^dag, the neighbour read through rho(g):
// register-meson's conv, with the source at a neighbour read from its representative
function conv(
  e: BallEngine,
  srcRe: Float64Array,
  srcIm: Float64Array,
  srcOff: number,
  srcStride: number,
  t: number,
  outRe: Float64Array,
  outIm: Float64Array,
  member: 1 | 2,
  dagger: boolean,
): void {
  const s = e.s
  const N = s.count
  const usePlus = !((member === 1) !== dagger)
  const repT = usePlus ? s.plusRep : s.minusRep
  const gT = usePlus ? s.plusG : s.minusG
  const mats = dagger ? e.CT : e.C
  const sg = dagger ? -1 : 1
  const tr = e.tmpRe
  const ti = e.tmpIm
  const els = s.group.elements

  outRe.fill(0)
  outIm.fill(0)

  for (let i = 0; i < N; i++) {
    const oo = i * PAIR

    for (let d = 0; d < NR; d++) {
      const j = repT[i * NR + d]!

      if (j < 0) {
        continue
      }

      const el = els[gT[i * NR + d]!]!
      const src = el.src[t]!
      const sgn = el.sgn[t]!
      const so = j * srcStride + srcOff

      for (let k = 0; k < PAIR; k++) {
        const f = sgn[k]!
        const at = so + src[k]!

        tr[k] = f * srcRe[at]!
        ti[k] = f * srcIm[at]!
      }

      const pr = e.halfRe[d]!
      const pi = sg * e.halfIm[d]!
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
          const sb = col * 8

          for (let r2 = 0; r2 < 8; r2++) {
            const xr = tr[sb + r2]!
            const xi = ti[sb + r2]!

            outRe[ob + r2]! += wr * xr - wi * xi
            outIm[ob + r2]! += wr * xi + wi * xr
          }
        } else {
          for (let r1 = 0; r1 < 8; r1++) {
            const xr = tr[r1 * 8 + col]!
            const xi = ti[r1 * 8 + col]!

            outRe[oo + r1 * 8 + row]! += wr * xr - wi * xi
            outIm[oo + r1 * 8 + row]! += wr * xi + wi * xr
          }
        }
      }
    }
  }
}

const A = 0
const B = 64
const X = 128
const D = 192

// ONE CYCLE (two beats), register-meson's pairCycle on the sector, in place
export function ballCycle(e: BallEngine, st: BallState): void {
  if (e.fast) {
    fastCycle(e.fast, st)

    return
  }

  const N = e.s.count
  const [ur, ui] = e.params.u
  const [t1r, t1i, t2r, t2i, er, ei, , , fr, fi, gr, gi] = e.t as [
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
  ]

  // ---- beat 1 ----
  {
    const alr = ur - 1
    const ali = ui

    conv(e, st.re, st.im, X, SITE, 2, t1r, t1i, 1, false)
    conv(e, st.re, st.im, B, SITE, 1, t2r, t2i, 2, false)
    conv(e, st.re, st.im, D, SITE, 3, er, ei, 2, false)
    conv(e, er, ei, 0, PAIR, 2, fr, fi, 1, false)
    conv(e, st.re, st.im, D, SITE, 3, gr, gi, 1, false)

    for (let i = 0; i < N; i++) {
      const b1r = e.beta1[2 * i]!
      const b1i = e.beta1[2 * i + 1]!

      for (let k = 0; k < PAIR; k++) {
        const c = i * PAIR + k
        const Ai = i * SITE + A + k
        const Bi = i * SITE + B + k
        const Xi = i * SITE + X + k
        const aR = st.re[Ai]!
        const aI = st.im[Ai]!
        const p1r = aR + t1r[c]!
        const p1i = aI + t1i[c]!
        const p2r = aR + t2r[c]!
        const p2i = aI + t2i[c]!
        const psr = p1r + t2r[c]! + fr[c]!
        const psi = p1i + t2i[c]! + fi[c]!

        st.re[Ai] =
          aR +
          alr * (p1r + p2r) -
          ali * (p1i + p2i) +
          b1r * psr -
          b1i * psi

        st.im[Ai] =
          aI +
          alr * (p1i + p2i) +
          ali * (p1r + p2r) +
          b1r * psi +
          b1i * psr

        const bR = st.re[Bi]!
        const bI = st.im[Bi]!
        const qbr = bR + gr[c]!
        const qbi = bI + gi[c]!

        st.re[Bi] = bR + alr * qbr - ali * qbi
        st.im[Bi] = bI + alr * qbi + ali * qbr

        const xR = st.re[Xi]!
        const xI = st.im[Xi]!
        const qxr = xR + er[c]!
        const qxi = xI + ei[c]!

        st.re[Xi] = xR + alr * qxr - ali * qxi
        st.im[Xi] = xI + alr * qxi + ali * qxr
      }
    }
  }

  // ---- beat 2 ----
  {
    const alr = ur - 1
    const ali = -ui

    conv(e, st.re, st.im, B, SITE, 1, t1r, t1i, 1, true)
    conv(e, st.re, st.im, X, SITE, 2, t2r, t2i, 2, true)
    conv(e, st.re, st.im, A, SITE, 0, er, ei, 2, true)
    conv(e, er, ei, 0, PAIR, 1, fr, fi, 1, true)
    conv(e, st.re, st.im, A, SITE, 0, gr, gi, 1, true)

    for (let i = 0; i < N; i++) {
      const b2r = e.beta2[2 * i]!
      const b2i = e.beta2[2 * i + 1]!

      for (let k = 0; k < PAIR; k++) {
        const c = i * PAIR + k
        const Di = i * SITE + D + k
        const Bi = i * SITE + B + k
        const Xi = i * SITE + X + k
        const dR = st.re[Di]!
        const dI = st.im[Di]!
        const p1r = dR + t1r[c]!
        const p1i = dI + t1i[c]!
        const p2r = dR + t2r[c]!
        const p2i = dI + t2i[c]!
        const pdr = p1r + t2r[c]! + fr[c]!
        const pdi = p1i + t2i[c]! + fi[c]!

        st.re[Di] =
          dR +
          alr * (p1r + p2r) -
          ali * (p1i + p2i) +
          b2r * pdr -
          b2i * pdi

        st.im[Di] =
          dI +
          alr * (p1i + p2i) +
          ali * (p1r + p2r) +
          b2r * pdi +
          b2i * pdr

        const bR = st.re[Bi]!
        const bI = st.im[Bi]!
        const qbr = bR + er[c]!
        const qbi = bI + ei[c]!

        st.re[Bi] = bR + alr * qbr - ali * qbi
        st.im[Bi] = bI + alr * qbi + ali * qbr

        const xR = st.re[Xi]!
        const xI = st.im[Xi]!
        const qxr = xR + gr[c]!
        const qxi = xI + gi[c]!

        st.re[Xi] = xR + alr * qxr - ali * qxi
        st.im[Xi] = xI + alr * qxi + ali * qxr
      }
    }
  }
}

// G st: member 1 then member 2, (a, b) -> (a + C b, b + C^dag a), register-meson's gram
export function ballGram(e: BallEngine, st: BallState): BallState {
  if (e.fast) {
    return fastGram(e.fast, st)
  }

  const N = e.s.count
  const [xr, xi, yr, yi] = e.t as [
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
  ]

  const add = (
    out: BallState,
    off: number,
    fr: Float64Array,
    fi: Float64Array,
  ): void => {
    for (let i = 0; i < N; i++) {
      for (let k = 0; k < PAIR; k++) {
        out.re[i * SITE + off + k]! += fr[i * PAIR + k]!
        out.im[i * SITE + off + k]! += fi[i * PAIR + k]!
      }
    }
  }

  const g1 = cloneBall(st)

  conv(e, st.re, st.im, X, SITE, 2, xr, xi, 1, false)
  add(g1, A, xr, xi)
  conv(e, st.re, st.im, D, SITE, 3, xr, xi, 1, false)
  add(g1, B, xr, xi)
  conv(e, st.re, st.im, A, SITE, 0, xr, xi, 1, true)
  add(g1, X, xr, xi)
  conv(e, st.re, st.im, B, SITE, 1, xr, xi, 1, true)
  add(g1, D, xr, xi)

  const g2 = cloneBall(g1)

  conv(e, g1.re, g1.im, B, SITE, 1, yr, yi, 2, false)
  add(g2, A, yr, yi)
  conv(e, g1.re, g1.im, D, SITE, 3, yr, yi, 2, false)
  add(g2, X, yr, yi)
  conv(e, g1.re, g1.im, A, SITE, 0, yr, yi, 2, true)
  add(g2, B, yr, yi)
  conv(e, g1.re, g1.im, X, SITE, 2, yr, yi, 2, true)
  add(g2, D, yr, yi)

  return g2
}

// <a | G b>, the orbit-weighted sum
export function ballInner(
  e: BallEngine,
  a: BallState,
  b: BallState,
): [number, number] {
  if (e.fast) {
    return fastInner(e.fast, a, b)
  }

  const gb = ballGram(e, b)

  let re = 0
  let im = 0

  for (let i = 0; i < e.s.count; i++) {
    const w = e.s.orbit[i]!

    let sr = 0
    let si = 0

    for (let k = i * SITE; k < (i + 1) * SITE; k++) {
      const xr = a.re[k]!
      const xi = a.im[k]!
      const yr = gb.re[k]!
      const yi = gb.im[k]!

      sr += xr * yr + xi * yi
      si += xr * yi - xi * yr
    }

    re += w * sr
    im += w * si
  }

  return [re, im]
}

export const ballNorm2 = (e: BallEngine, st: BallState): number =>
  ballInner(e, st, st)[0]

export function axpyBall(
  y: BallState,
  x: BallState,
  fr: number,
  fi: number,
): void {
  for (let i = 0; i < y.re.length; i++) {
    const r = x.re[i]!
    const m = x.im[i]!

    y.re[i]! += fr * r - fi * m
    y.im[i]! += fr * m + fi * r
  }
}

export function scaleBall(st: BallState, f: number): void {
  for (let i = 0; i < st.re.length; i++) {
    st.re[i]! *= f
    st.im[i]! *= f
  }
}

export function normalizeBall(e: BallEngine, st: BallState): void {
  scaleBall(st, 1 / Math.sqrt(ballNorm2(e, st)))
}

// the filter v = sum_s w(s) e^(-i phase s) U^s psi (Blackman-Harris over S cycles), register-meson's filterPair
export function ballFilter(
  e: BallEngine,
  psi: BallState,
  phase: number,
  S: number,
): BallState {
  if (e.fast) {
    return fastFilter(e.fast, psi, phase, S)
  }

  const out = newBall(e.s)
  const st = cloneBall(psi)

  for (let k = 0; k < S; k++) {
    const w = blackmanHarris(k, S)

    axpyBall(out, st, w * Math.cos(-phase * k), w * Math.sin(-phase * k))
    ballCycle(e, st)
  }

  return out
}

// lambda = <v | G U v> / <v | G v> and the residual |U v - lambda v|_G / |v|_G, register-meson's readLevel
export function ballRead(
  e: BallEngine,
  v: BallState,
): { lambda: [number, number]; phase: number; residual: number } {
  const n = ballNorm2(e, v)
  const Uv = cloneBall(v)

  ballCycle(e, Uv)

  const [lr, li] = ballInner(e, v, Uv).map(x => x / n) as [number, number]
  const r = cloneBall(Uv)

  axpyBall(r, v, -lr, -li)

  return {
    lambda: [lr, li],
    phase: Math.atan2(li, lr),
    residual: Math.sqrt(ballNorm2(e, r) / n),
  }
}

// the coordinate weight by string length V (register-meson's profile: the diagonal of the Gram metric), orbit-weighted
export function ballProfile(e: BallEngine, st: BallState): number[] {
  const out = Array<number>(e.s.radius + 1).fill(0)

  for (let i = 0; i < e.s.count; i++) {
    let w = 0

    for (let k = i * SITE; k < (i + 1) * SITE; k++) {
      w += st.re[k]! ** 2 + st.im[k]! ** 2
    }

    out[e.s.V[i]!]! += e.s.orbit[i]! * w
  }

  return out
}

// AN ABSORBING LAYER (an instrument, not part of the rule). register-meson's ball drops a shift out of it, but in the
// exact coordinates that truncation is itself nearly unitary in the truncated Gram metric, so the edge REFLECTS: a free pair
// on a radius-4 ball keeps its norm to 3.5e-4 over 128 cycles (E-SPN-0178's probe). This multiplies every amplitude at
// string length V > from by exp(-strength ((V - from) / (radius - from))^2) once a cycle, a graded mask that takes a
// wave out without a wall to reflect from. A pair that never reaches V = from is untouched by it.
export function ballAbsorb(
  s: BallSector,
  st: BallState,
  from: number,
  strength: number,
): void {
  for (let i = 0; i < s.count; i++) {
    const V = s.V[i]!

    if (V <= from) {
      continue
    }

    const f = Math.exp(-strength * ((V - from) / (s.radius - from)) ** 2)

    for (let k = i * SITE; k < (i + 1) * SITE; k++) {
      st.re[k]! *= f
      st.im[k]! *= f
    }
  }
}

// both members in S, the registers paired by delta, the relative profile f(V) (register-meson's sStart and pulled-pair's
// shellStart, on the sector)
export function ballStart(
  s: BallSector,
  f: (V: number) => number,
): BallState {
  const st = newBall(s)

  for (let i = 0; i < s.count; i++) {
    const x = f(s.V[i]!)

    for (let a = 0; a < REG; a++) {
      st.re[i * SITE + A + a * REG + a] = x
    }
  }

  return st
}

// a state on a smaller sector placed on a larger one, rep by rep (zero past the smaller radius): a level filtered on a
// small ball is read on the gate ball this way
export function embedBall(
  from: BallSector,
  st: BallState,
  to: BallSector,
): BallState {
  const out = newBall(to)
  const at = new Map<number, number>()

  for (let i = 0; i < to.count; i++) {
    at.set(repKey(to.radius, [0, 1, 2, 3].map(k => to.reps[4 * i + k]!)), i)
  }

  for (let i = 0; i < from.count; i++) {
    const j = at.get(
      repKey(to.radius, [0, 1, 2, 3].map(k => from.reps[4 * i + k]!)),
    )!

    out.re.set(st.re.subarray(i * SITE, (i + 1) * SITE), j * SITE)
    out.im.set(st.im.subarray(i * SITE, (i + 1) * SITE), j * SITE)
  }

  return out
}

// the reduced state written out on register-meson's relative ball of the same radius: psi(g y) = rho(g) psi(y)
export function unfoldBall(
  s: BallSector,
  st: BallState,
  ball: RelBall,
): PairState {
  const out = newPair(ball)
  const at = new Map<number, number>()

  for (let i = 0; i < s.count; i++) {
    at.set(
      repKey(s.radius, [0, 1, 2, 3].map(k => s.reps[4 * i + k]!)),
      i,
    )
  }

  ball.points.forEach((p, n) => {
    const c = canonicalOf(s.group, p)
    const r = at.get(repKey(s.radius, c.rep))!
    const el = s.group.elements[c.g]!

    for (let t = 0; t < 4; t++) {
      for (let k = 0; k < PAIR; k++) {
        const from = r * SITE + t * PAIR + el.src[t]![k]!

        out.re[n * SITE + t * PAIR + k] = el.sgn[t]![k]! * st.re[from]!
        out.im[n * SITE + t * PAIR + k] = el.sgn[t]![k]! * st.im[from]!
      }
    }
  })

  return out
}
