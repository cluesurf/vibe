// THE REGISTER MEMBER'S FLAT MODES IN A LINK FIELD (E-FRC-0284). E-SPN-0160's register member has 192 modes a dock; the
// chiral register (E-FRC-0258) splits them into two halves of 96, each 4 + 4 moving and 88 flat at phase 0. The cycle is
// U = V2 (1 + (conj u - 1) Q_D) V1 (1 + (u - 1) Q_S), with V the swap coin and the stream; the light rides V as a
// register-blind Peierls phase e^(i theta) (E-SPN-0169) and the SU(2)+ field as Gamma(g), a right multiplication on half +
// (E-SPN-0180, E-FRC-0271). This module builds that cycle on the L-torus with both fields, per half, with a mass per half.
//
//   linkField        a static field: theta per link (the reverse link -theta) and an optional 2T element per link
//                    (the reverse its inverse); a Weyl stream, a gauge function, a uniform potential A . r_d
//   streamField      V: slot d of dock x + r_d takes e^(i theta(x, d)) Gamma(g(x, d)) times slot -d of dock x
//   cycleField       one cycle with the beat-1 field f1 and the beat-2 field f2 (equal for a static field), the mixer u+ on
//                    half + and u- on half -
//   halfBases        orthonormal bases of range(Q_S P_h) and range(Q_D P_h) on one dock, 192 x 4 each
//   hopBlock         B = E_S^dag V E_D on one half, 4N x 4N complex: the covariant Clifford hop between the two sectors;
//                    mu = eig(B^dag B) fixes the moving spectrum (Jordan's lemma), cos E = cos M - 2 cos^2(M / 2) mu
//   movingWeight     |Pi_W psi|^2 for W = range(E_S) + range(V E_D), by conjugate gradients on the Gram matrix
//                    [[1, B], [B^dag, 1]]: the weight of psi on the moving modes of the static field
//
// DETERMINISM: no random numbers; fields and starts are golden-ratio Weyl streams. FLOATS: measurement on exact pieces
// (the projectors are integer matrices over 24 and 48, 4 Gamma is an integer matrix, the units are ring units).

import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { partnerBasis } from '@/code/measure/register-meson'
import { volumeRight } from '@/code/measure/chiral-register'
import { type Torus } from '@/code/measure/register-sea'
import { type RegisterGauge } from '@/code/measure/register-link-field'

const SLOTS = 24
const REG = 8
const MODES = SLOTS * REG
const GOLDEN = (Math.sqrt(5) - 1) / 2

export type CVec = { re: Float64Array; im: Float64Array }

export const newVec = (n: number): CVec => ({
  re: new Float64Array(n),
  im: new Float64Array(n),
})

export const weylValue = (n: number, offset: number): number =>
  (((offset + n * GOLDEN) % 1) + 1) % 1

export type LinkField = {
  t: Torus
  nb: Int32Array
  // theta[x * 24 + d], theta of the reverse link is minus it
  theta: Float64Array
  // 2T element per link (index into G.gamma4), or null for none
  link: Int16Array | null
}

// a field from a theta rule and a link rule, reverse links set to the negative and the inverse
export function linkField(
  t: Torus,
  nb: Int32Array,
  thetaOf: (x: number, d: number, k: number) => number,
  G: RegisterGauge | null,
  linkOf: ((x: number, d: number, k: number) => number) | null,
): LinkField {
  const N = t.sites.length
  const theta = new Float64Array(N * SLOTS)
  const link = linkOf && G ? new Int16Array(N * SLOTS) : null

  let k = 0

  for (let x = 0; x < N; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const back = nb[x * SLOTS + d]! * SLOTS + OPPOSITE[d]!

      if (back < x * SLOTS + d) {
        continue
      }

      const th = thetaOf(x, d, k)

      theta[x * SLOTS + d] = th
      theta[back] = -th

      if (link && linkOf && G) {
        const v = linkOf(x, d, k)

        link[x * SLOTS + d] = v
        link[back] = G.group.inverse[v]!
      }

      k++
    }
  }

  return { t, nb, theta, link }
}

// the reverse rule: theta(x + r_d, -d) = -theta(x, d) and g(x + r_d, -d) g(x, d) = 1
export function reverseHolds(
  f: LinkField,
  G: RegisterGauge | null,
): boolean {
  const N = f.t.sites.length

  for (let x = 0; x < N; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const back = f.nb[x * SLOTS + d]! * SLOTS + OPPOSITE[d]!

      if (f.theta[back] !== -f.theta[x * SLOTS + d]!) {
        return false
      }

      if (f.link && G) {
        const p =
          G.group.table[
            f.link[back]! * G.group.order + f.link[x * SLOTS + d]!
          ]!

        if (p !== G.group.identity) {
          return false
        }
      }
    }
  }

  return true
}

// V: slot d of dock x + r_d takes e^(i theta) Gamma(g) times slot -d of dock x
export function streamField(
  f: LinkField,
  G: RegisterGauge | null,
  s: CVec,
): CVec {
  const N = f.t.sites.length
  const out = newVec(N * MODES)

  for (let x = 0; x < N; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const to = f.nb[x * SLOTS + d]!
      const th = f.theta[x * SLOTS + d]!
      const c = Math.cos(th)
      const sn = Math.sin(th)
      const src = x * MODES + OPPOSITE[d]! * REG
      const dst = to * MODES + d * REG

      if (f.link && G) {
        const M = G.gamma4[f.link[x * SLOTS + d]!]!

        for (let i = 0; i < REG; i++) {
          let r = 0
          let m = 0

          for (let j = 0; j < REG; j++) {
            const v = M[i]![j]!

            if (v !== 0) {
              r += v * s.re[src + j]!
              m += v * s.im[src + j]!
            }
          }

          r /= 4
          m /= 4
          out.re[dst + i] = c * r - sn * m
          out.im[dst + i] = c * m + sn * r
        }
      } else {
        for (let i = 0; i < REG; i++) {
          const r = s.re[src + i]!
          const m = s.im[src + i]!

          out.re[dst + i] = c * r - sn * m
          out.im[dst + i] = c * m + sn * r
        }
      }
    }
  }

  return out
}

// ---- the sector bases per half ----

export type HalfBases = {
  // 192 x 4 real, row-major [mode * 4 + col]
  S: Float64Array
  D: Float64Array
}

function orthonormalColumns(cols: number[][]): number[][] {
  const out: number[][] = []

  for (const c of cols) {
    let v = [...c]

    for (const e of out) {
      const dt = v.reduce((a, x, i) => a + x * e[i]!, 0)

      v = v.map((x, i) => x - dt * e[i]!)
    }

    const n = Math.hypot(...v)

    if (n > 1e-9) {
      out.push(v.map(x => x / n))
    }
  }

  return out
}

// range(Q_S P_h) and range(Q_D P_h), h = +1 or -1, 4 columns each
export function halfBases(sign: number): HalfBases {
  const J = volumeRight()
  const ED = partnerBasis()
  const P = (v: readonly number[]): number[] =>
    Array.from({ length: MODES }, (_, m) => {
      const d = Math.floor(m / REG)
      const a = m % REG

      let s = v[m]!

      for (let b = 0; b < REG; b++) {
        s += sign * J[a]![b]! * v[d * REG + b]!
      }

      return s / 2
    })
  const sCols: number[][] = []
  const dCols: number[][] = []

  for (let a = 0; a < REG; a++) {
    sCols.push(
      P(
        Array.from({ length: MODES }, (_, m) =>
          m % REG === a ? 1 / Math.sqrt(SLOTS) : 0,
        ),
      ),
    )

    dCols.push(
      P(Array.from({ length: MODES }, (_, m) => ED[m * REG + a]!)),
    )
  }

  const S = orthonormalColumns(sCols)
  const D = orthonormalColumns(dCols)

  if (S.length !== 4 || D.length !== 4) {
    throw new Error(`flat-bands: half bases ${S.length}, ${D.length}`)
  }

  const pack = (cs: number[][]): Float64Array => {
    const out = new Float64Array(MODES * 4)

    cs.forEach((c, j) => c.forEach((x, m) => (out[m * 4 + j] = x)))

    return out
  }

  return { S: pack(S), D: pack(D) }
}

// coordinates E^dag psi at every dock (4 per dock) and E c back
function coords(E: Float64Array, s: CVec, N: number): CVec {
  const out = newVec(N * 4)

  for (let x = 0; x < N; x++) {
    for (let m = 0; m < MODES; m++) {
      const r = s.re[x * MODES + m]!
      const i = s.im[x * MODES + m]!

      if (r === 0 && i === 0) {
        continue
      }

      for (let j = 0; j < 4; j++) {
        const e = E[m * 4 + j]!

        out.re[x * 4 + j]! += e * r
        out.im[x * 4 + j]! += e * i
      }
    }
  }

  return out
}

function expand(E: Float64Array, c: CVec, N: number): CVec {
  const out = newVec(N * MODES)

  for (let x = 0; x < N; x++) {
    for (let m = 0; m < MODES; m++) {
      let r = 0
      let i = 0

      for (let j = 0; j < 4; j++) {
        const e = E[m * 4 + j]!

        r += e * c.re[x * 4 + j]!
        i += e * c.im[x * 4 + j]!
      }

      out.re[x * MODES + m] = r
      out.im[x * MODES + m] = i
    }
  }

  return out
}

// psi <- psi + sum_h E_h ((w_h - 1) E_h^dag psi)
function mix(
  s: CVec,
  N: number,
  bases: readonly HalfBases[],
  ws: readonly (readonly [number, number])[],
  which: 'S' | 'D',
): void {
  bases.forEach((b, h) => {
    const E = which === 'S' ? b.S : b.D
    const c = coords(E, s, N)
    const ar = ws[h]![0] - 1
    const ai = ws[h]![1]

    for (let k = 0; k < c.re.length; k++) {
      const r = c.re[k]!
      const i = c.im[k]!

      c.re[k] = ar * r - ai * i
      c.im[k] = ar * i + ai * r
    }

    const back = expand(E, c, N)

    for (let k = 0; k < s.re.length; k++) {
      s.re[k]! += back.re[k]!
      s.im[k]! += back.im[k]!
    }
  })
}

export type HalfMasses = {
  plus: readonly [number, number]
  minus: readonly [number, number]
}

// one cycle: the S mixer, V1, the D mixer (conjugate units), V2
export function cycleField(
  f1: LinkField,
  f2: LinkField,
  G: RegisterGauge | null,
  bases: { plus: HalfBases; minus: HalfBases },
  u: HalfMasses,
  s: CVec,
): CVec {
  const N = f1.t.sites.length
  const a: CVec = {
    re: Float64Array.from(s.re),
    im: Float64Array.from(s.im),
  }
  const bs = [bases.plus, bases.minus]

  mix(a, N, bs, [u.plus, u.minus], 'S')

  const b = streamField(f1, G, a)

  mix(
    b,
    N,
    bs,
    [
      [u.plus[0], -u.plus[1]],
      [u.minus[0], -u.minus[1]],
    ],
    'D',
  )

  return streamField(f2, G, b)
}

// ---- the hop block and the moving weight on one half ----

export type HopBlock = { n: number; re: Float64Array; im: Float64Array }

// B[(x, a), (y, e)] = <E_S(x, a)| V |E_D(y, e)>, n = 4N
export function hopBlock(
  f: LinkField,
  G: RegisterGauge | null,
  b: HalfBases,
): HopBlock {
  const N = f.t.sites.length
  const n = 4 * N
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let y = 0; y < N; y++) {
    for (let e = 0; e < 4; e++) {
      // V E_D(y, e): supported on the 24 neighbours, slot d of y + r_d takes the transported slot -d of y
      for (let d = 0; d < SLOTS; d++) {
        const to = f.nb[y * SLOTS + d]!
        const th = f.theta[y * SLOTS + d]!
        const c = Math.cos(th)
        const sn = Math.sin(th)
        const src = OPPOSITE[d]! * REG
        const v = new Float64Array(REG)

        if (f.link && G) {
          const M = G.gamma4[f.link[y * SLOTS + d]!]!

          for (let i = 0; i < REG; i++) {
            let r = 0

            for (let j = 0; j < REG; j++) {
              r += M[i]![j]! * b.D[(src + j) * 4 + e]!
            }

            v[i] = r / 4
          }
        } else {
          for (let i = 0; i < REG; i++) {
            v[i] = b.D[(src + i) * 4 + e]!
          }
        }

        for (let a = 0; a < 4; a++) {
          let dt = 0

          for (let i = 0; i < REG; i++) {
            dt += b.S[(d * REG + i) * 4 + a]! * v[i]!
          }

          const row = to * 4 + a
          const col = y * 4 + e

          re[row * n + col]! += c * dt
          im[row * n + col]! += sn * dt
        }
      }
    }
  }

  return { n, re, im }
}

// H = B^dag B, Hermitian, n x n
export function hopGram(B: HopBlock): {
  re: Float64Array
  im: Float64Array
} {
  const n = B.n
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      const ar = B.re[k * n + i]!
      const ai = -B.im[k * n + i]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let j = 0; j < n; j++) {
        const br = B.re[k * n + j]!
        const bi = B.im[k * n + j]!

        re[i * n + j]! += ar * br - ai * bi
        im[i * n + j]! += ar * bi + ai * br
      }
    }
  }

  return { re, im }
}

function matVec(
  n: number,
  re: Float64Array,
  im: Float64Array,
  x: CVec,
  adjoint: boolean,
): CVec {
  const out = newVec(n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const ar = adjoint ? re[j * n + i]! : re[i * n + j]!
      const ai = adjoint ? -im[j * n + i]! : im[i * n + j]!

      if (ar === 0 && ai === 0) {
        continue
      }

      out.re[i]! += ar * x.re[j]! - ai * x.im[j]!
      out.im[i]! += ar * x.im[j]! + ai * x.re[j]!
    }
  }

  return out
}

const dotC = (a: CVec, b: CVec): { re: number; im: number } => {
  let re = 0
  let im = 0

  for (let k = 0; k < a.re.length; k++) {
    re += a.re[k]! * b.re[k]! + a.im[k]! * b.im[k]!
    im += a.re[k]! * b.im[k]! - a.im[k]! * b.re[k]!
  }

  return { re, im }
}

export const normSq = (a: CVec): number => dotC(a, a).re

// |Pi_W psi|^2 and the CG residual, W = range(E_S) + range(V E_D) on one half
export function movingWeight(
  f: LinkField,
  G: RegisterGauge | null,
  b: HalfBases,
  B: HopBlock,
  psi: CVec,
  tol = 1e-15,
  maxIter = 4000,
): { weight: number; residual: number; iterations: number } {
  const N = f.t.sites.length
  const n = B.n
  const rhsS = coords(b.S, psi, N)
  const rhsD = coords(b.D, streamField(f, G, psi), N)

  const apply = (v: CVec): CVec => {
    const s = newVec(n)
    const dd = newVec(n)
    const al: CVec = {
      re: v.re.subarray(0, n),
      im: v.im.subarray(0, n),
    }
    const be: CVec = { re: v.re.subarray(n), im: v.im.subarray(n) }
    const Bb = matVec(n, B.re, B.im, be, false)
    const Ba = matVec(n, B.re, B.im, al, true)

    for (let k = 0; k < n; k++) {
      s.re[k] = al.re[k]! + Bb.re[k]!
      s.im[k] = al.im[k]! + Bb.im[k]!
      dd.re[k] = be.re[k]! + Ba.re[k]!
      dd.im[k] = be.im[k]! + Ba.im[k]!
    }

    const out = newVec(2 * n)

    out.re.set(s.re, 0)
    out.re.set(dd.re, n)
    out.im.set(s.im, 0)
    out.im.set(dd.im, n)

    return out
  }

  const rhs = newVec(2 * n)

  rhs.re.set(rhsS.re, 0)
  rhs.re.set(rhsD.re, n)
  rhs.im.set(rhsS.im, 0)
  rhs.im.set(rhsD.im, n)

  const x = newVec(2 * n)
  const r: CVec = {
    re: Float64Array.from(rhs.re),
    im: Float64Array.from(rhs.im),
  }
  const p: CVec = {
    re: Float64Array.from(r.re),
    im: Float64Array.from(r.im),
  }
  const r0 = Math.sqrt(normSq(rhs))

  let rr = normSq(r)
  let it = 0

  while (it < maxIter && Math.sqrt(rr) > tol * Math.max(r0, 1e-300)) {
    const Ap = apply(p)
    const pAp = dotC(p, Ap).re
    const a = rr / pAp

    for (let k = 0; k < x.re.length; k++) {
      x.re[k]! += a * p.re[k]!
      x.im[k]! += a * p.im[k]!
      r.re[k]! -= a * Ap.re[k]!
      r.im[k]! -= a * Ap.im[k]!
    }

    const rn = normSq(r)
    const beta = rn / rr

    for (let k = 0; k < x.re.length; k++) {
      p.re[k] = r.re[k]! + beta * p.re[k]!
      p.im[k] = r.im[k]! + beta * p.im[k]!
    }

    rr = rn
    it++
  }

  // |Pi_W psi|^2 = <rhs, x>
  return {
    weight: dotC(rhs, x).re,
    residual: r0 > 0 ? Math.sqrt(rr) / r0 : 0,
    iterations: it,
  }
}

// psi with its moving part removed: psi - Pi_W psi, by the same solve
export function flatPart(
  f: LinkField,
  G: RegisterGauge | null,
  b: HalfBases,
  B: HopBlock,
  psi: CVec,
  tol = 1e-15,
  maxIter = 4000,
): CVec {
  const N = f.t.sites.length
  const n = B.n
  const rhsS = coords(b.S, psi, N)
  const rhsD = coords(b.D, streamField(f, G, psi), N)

  // solve [[1, B], [B^dag, 1]] [al; be] = [rhsS; rhsD] by CG
  const apply = (al: CVec, be: CVec): [CVec, CVec] => {
    const Bb = matVec(n, B.re, B.im, be, false)
    const Ba = matVec(n, B.re, B.im, al, true)
    const s = newVec(n)
    const dd = newVec(n)

    for (let k = 0; k < n; k++) {
      s.re[k] = al.re[k]! + Bb.re[k]!
      s.im[k] = al.im[k]! + Bb.im[k]!
      dd.re[k] = be.re[k]! + Ba.re[k]!
      dd.im[k] = be.im[k]! + Ba.im[k]!
    }

    return [s, dd]
  }

  const join = (a: CVec, c: CVec): CVec => {
    const out = newVec(2 * n)

    out.re.set(a.re, 0)
    out.re.set(c.re, n)
    out.im.set(a.im, 0)
    out.im.set(c.im, n)

    return out
  }

  const split = (v: CVec): [CVec, CVec] => [
    { re: v.re.slice(0, n), im: v.im.slice(0, n) },
    { re: v.re.slice(n), im: v.im.slice(n) },
  ]
  const rhs = join(rhsS, rhsD)
  const x = newVec(2 * n)
  const r: CVec = {
    re: Float64Array.from(rhs.re),
    im: Float64Array.from(rhs.im),
  }
  const p: CVec = {
    re: Float64Array.from(r.re),
    im: Float64Array.from(r.im),
  }
  const r0 = Math.sqrt(normSq(rhs))

  let rr = normSq(r)
  let it = 0

  while (it < maxIter && Math.sqrt(rr) > tol * Math.max(r0, 1e-300)) {
    const [pa, pb] = split(p)
    const Ap = join(...apply(pa, pb))
    const a = rr / dotC(p, Ap).re

    for (let k = 0; k < x.re.length; k++) {
      x.re[k]! += a * p.re[k]!
      x.im[k]! += a * p.im[k]!
      r.re[k]! -= a * Ap.re[k]!
      r.im[k]! -= a * Ap.im[k]!
    }

    const rn = normSq(r)
    const beta = rn / rr

    for (let k = 0; k < x.re.length; k++) {
      p.re[k] = r.re[k]! + beta * p.re[k]!
      p.im[k] = r.im[k]! + beta * p.im[k]!
    }

    rr = rn
    it++
  }

  const [al, be] = split(x)
  const partS = expand(b.S, al, N)
  const partD = streamField(f, G, expand(b.D, be, N))
  const out = newVec(psi.re.length)

  for (let k = 0; k < out.re.length; k++) {
    out.re[k] = psi.re[k]! - partS.re[k]! - partD.re[k]!
    out.im[k] = psi.im[k]! - partS.im[k]! - partD.im[k]!
  }

  return out
}

// the half projector P_h = (1 + h J) / 2 on the register of every slot
export function halfProject(s: CVec, sign: number): CVec {
  const J = volumeRight()
  const out = newVec(s.re.length)

  for (let o = 0; o < s.re.length; o += REG) {
    for (let a = 0; a < REG; a++) {
      let r = s.re[o + a]!
      let i = s.im[o + a]!

      for (let b = 0; b < REG; b++) {
        r += sign * J[a]![b]! * s.re[o + b]!
        i += sign * J[a]![b]! * s.im[o + b]!
      }

      out.re[o + a] = r / 2
      out.im[o + a] = i / 2
    }
  }

  return out
}

// a deterministic start: Weyl values on every mode
export function weylStart(n: number, offset: number): CVec {
  const s = newVec(n)

  for (let k = 0; k < n; k++) {
    s.re[k] = weylValue(2 * k, offset) - 0.5
    s.im[k] = weylValue(2 * k + 1, offset + 0.31) - 0.5
  }

  return s
}

export const rootDot = (A: readonly number[], d: number): number =>
  DOCK_ROOTS[d]!.reduce((s, r, k) => s + r * A[k]!, 0)
