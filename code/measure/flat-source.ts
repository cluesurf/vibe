// THE SWAP COIN'S FLAT BANDS IN A STATIC LINK FIELD (E-SPN-0161). A member of the swap-mixed rule carries a color
// register (the fundamental of a finite subgroup of SU(2): 2I, 2T, Q8, or the trivial group) and its hop along root d
// from dock x multiplies the color by the link's value g(x, d), with the reverse link holding the inverse,
// g(x + r_d, -d) = g(x, d)^-1. On the side-L husk quotient box (code/measure/husk-meson huskBoxTables) this file builds:
//
//   linkField       a static field: every link a group element as a 2 x 2 matrix, chosen by a Weyl stream (the
//                   trivial field, a Weyl field over a group's elements, a pure gauge h(x + r) h(x)^-1 from a Weyl
//                   choice of h per dock, the central field -1 on every link, and a dilute field: a share of the
//                   links on the elements nearest the identity, the rest the identity)
//   averagedHop     T = (1/24) sum_d S_g(d) restricted to the uniform slot mode: the cN x cN Hermitian matrix
//                   <z_x c| S_g X |z_y c'> (X keeps the uniform vector), whose spectrum lies in [-1, 1]
//   flatCount       THE COUNT. With A = c X (I + beta J) (code/measure/swap-string vibeShape, J the uniform
//                   projector of each dock) the beat is U = c U0 (I + beta J), U0 = S_g X. U0 is an INVOLUTION in
//                   every static field (slot d goes out along d and comes back along -d, meeting g and g^-1), so
//                   P+- = (I +- U0) / 2 are its exact eigenprojectors, each of rank 12 c N. On E+- intersected with
//                   ker J the beat is c U0 = +-c: a flat state. dim(E+- n ker J) = 12 c N - rank(P+- Z) with Z the
//                   c N uniform columns, and the Gram matrix Z^dag P+- Z = (I +- T) / 2, so
//                     flat(+-) = 11 c N + dim ker(I -+ T)      (exact, any group, any static field)
//                   and ker(I - T) is nonzero only for a flat connection (T's top eigenvalue 1 needs every link to
//                   carry one color vector parallel), ker(I + T) only for a connection with a -1 twist
//   beatApply       U v on the whole box (for the residual checks), and involutionGap |U0^2 v - v|
//   flatVector      a vector of E+- n ker J built from a start e: w = P e - P Z (Z^dag P Z)^-1 Z^dag P e
//   pairChecks      THE MOVING PAIR: every T eigenvector y spans an invariant plane (P+ Z y, P- Z y) of the beat, on
//                   which sin w = sin(theta/2) lambda, E-SPN-0143's law with g(K) replaced by T's eigenvalue lambda. So
//                   the member's lightest level in a field is m = pi/2 - arcsin(sin(theta/2) lambda_top): light only
//                   where T's top reaches 1 (an ordered field), heavy in a disordered one, whose T approaches the
//                   24-regular tree's normalized adjacency (spectral radius 2 sqrt 23 / 24 = 0.39965, the Kesten floor
//                   of E-SPN-0150)
//
// WHY IT MATTERS. A member in a flat band is a color charge that bounces on its links and never leaves them, in ANY
// static field: a static source. A string between two members ends on it as on any heavy charge, so the (S, F) channel
// of a string-bound pair is the static-source problem shifted by the flat phase, the same at every total momentum.
//
// DETERMINISM: no random numbers; every field is a Weyl stream on the golden ratio. FLOATS: the group elements are
// floats (2I's entries hold phi), as measurement of an exact algebra. NOTHING MOVES: the coin and the mixer hand a value
// to another slot of one dock; the stream takes each slot's value one dock along, its color turned by the link.

import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import {
  binaryIcosahedral,
  binaryTetrahedral,
  quaternionGroup,
  type Quaternion,
} from '@/code/algebra/group/quaternion'
import { HUSK_STEPS, huskBoxTables } from '@/code/measure/husk-meson'
import { ROOTS } from '@/code/measure/swap-sector'
import type { VibeShape } from '@/code/measure/swap-string'

const N = 24
const GOLDEN = (Math.sqrt(5) - 1) / 2
const DEGENERATE = 1e-9

// the slot of -r_d
export const OPPOSITE_SLOT: readonly number[] = ROOTS.map(r =>
  ROOTS.findIndex(o => o.every((x, k) => x === -r[k]!)),
)

// a 2 x 2 complex matrix, row major, [re, im] interleaved: [a, b; c, d]
export type SU2 = Float64Array

// q = w + x i + y j + z k -> w I - i (x sx + y sy + z sz), a homomorphism of the unit quaternions onto SU(2)
export function su2Of(q: Quaternion): SU2 {
  return Float64Array.from([q.w, -q.z, -q.y, -q.x, q.y, -q.x, q.w, q.z])
}

export function su2Mul(a: SU2, b: SU2): SU2 {
  const out = new Float64Array(8)

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < 2; k++) {
        const ar = a[2 * (2 * i + k)]!
        const ai = a[2 * (2 * i + k) + 1]!
        const br = b[2 * (2 * k + j)]!
        const bi = b[2 * (2 * k + j) + 1]!

        re += ar * br - ai * bi
        im += ar * bi + ai * br
      }

      out[2 * (2 * i + j)] = re
      out[2 * (2 * i + j) + 1] = im
    }
  }

  return out
}

// the conjugate transpose (the inverse, for a unitary)
export function su2Dagger(a: SU2): SU2 {
  return Float64Array.from([
    a[0]!,
    -a[1]!,
    a[4]!,
    -a[5]!,
    a[2]!,
    -a[3]!,
    a[6]!,
    -a[7]!,
  ])
}

const IDENTITY: SU2 = Float64Array.from([1, 0, 0, 0, 0, 0, 1, 0])
const MINUS: SU2 = Float64Array.from([-1, 0, 0, 0, 0, 0, -1, 0])

export type GroupName = 'trivial' | 'Q8' | '2T' | '2I'

export function groupElements(name: GroupName): SU2[] {
  if (name === 'trivial') {
    return [IDENTITY]
  }

  if (name === 'Q8') {
    return quaternionGroup().map(su2Of)
  }

  if (name === '2T') {
    return binaryTetrahedral().map(su2Of)
  }

  return binaryIcosahedral().map(su2Of)
}

// the n-th term of the golden Weyl stream in [0, 1)
const weyl = (n: number, offset: number): number =>
  (((offset + n * GOLDEN) % 1) + 1) % 1

export type FieldKind =
  | 'trivial'
  | 'weyl'
  | 'pure-gauge'
  | 'minus'
  | 'dilute'

// the elements nearest the identity (largest real trace), other than the identity itself: for 2I the 12 of trace
// 2 cos(pi/5) = phi
export function nearestElements(elements: readonly SU2[]): SU2[] {
  const trace = (g: SU2): number => g[0]! + g[6]!
  const others = elements.filter(g => trace(g) < 2 - 1e-12)
  const top = Math.max(...others.map(trace))

  return others.filter(g => trace(g) > top - 1e-12)
}

// a static link field on the side-L quotient box: link[x * 24 + d] the value on the link from dock x along root d. A
// link and its reverse are one link: the canonical end is the lower (x, d) index, the other end holds the inverse
export type LinkField = {
  L: number
  cells: number
  link: SU2[]
  kind: FieldKind
  group: GroupName
}

// `density` (kind 'dilute' only): the share of links holding a nearest element (chosen by a second Weyl stream), the
// rest the identity: a field ordered at short range, disordered more as the density grows
export function linkField(
  L: number,
  group: GroupName,
  kind: FieldKind,
  offset = 0.5,
  density = 0,
): LinkField {
  const tab = huskBoxTables(L)
  const cells = tab.cells
  const elements = groupElements(group)
  const near = nearestElements(elements)
  const link: SU2[] = Array(cells * N)
  const pick = (n: number): SU2 =>
    elements[
      Math.floor(weyl(n, offset) * elements.length) % elements.length
    ]!
  const dilute = (n: number): SU2 =>
    near.length > 0 && weyl(n, offset) < density
      ? near[
          Math.floor(weyl(n, offset + 0.37) * near.length) % near.length
        ]!
      : IDENTITY
  const gauge: SU2[] = Array.from({ length: cells }, (_, x) =>
    pick(7919 + x),
  )

  let n = 0

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < N; d++) {
      const to = Math.floor(tab.target[x * N + d]! / N)
      const back = to * N + OPPOSITE_SLOT[d]!

      if (back < x * N + d) {
        continue
      }

      const g =
        kind === 'trivial'
          ? IDENTITY
          : kind === 'minus'
            ? MINUS
            : kind === 'weyl'
              ? pick(n++)
              : kind === 'dilute'
                ? dilute(n++)
                : su2Mul(gauge[to]!, su2Dagger(gauge[x]!))

      link[x * N + d] = g
      link[back] = su2Dagger(g)
    }
  }

  return { L, cells, link, kind, group }
}

// the largest |g(x + r, -d) g(x, d) - I| over the links (the reverse-link rule)
export function reverseGap(f: LinkField): number {
  const tab = huskBoxTables(f.L)

  let gap = 0

  for (let x = 0; x < f.cells; x++) {
    for (let d = 0; d < N; d++) {
      const to = Math.floor(tab.target[x * N + d]! / N)
      const p = su2Mul(
        f.link[to * N + OPPOSITE_SLOT[d]!]!,
        f.link[x * N + d]!,
      )

      for (let i = 0; i < 8; i++) {
        gap = Math.max(gap, Math.abs(p[i]! - IDENTITY[i]!))
      }
    }
  }

  return gap
}

// THE AVERAGED HOP: T[(x, a), (y, b)] = (1/24) sum over d with y + r_d = x of g(y, d)[a][b], as a 2 cells x 2 cells
// complex matrix (re, im row major)
export function averagedHop(f: LinkField): {
  n: number
  re: Float64Array
  im: Float64Array
} {
  const tab = huskBoxTables(f.L)
  const n = 2 * f.cells
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let y = 0; y < f.cells; y++) {
    for (let d = 0; d < N; d++) {
      const x = Math.floor(tab.target[y * N + d]! / N)
      const g = f.link[y * N + d]!

      for (let a = 0; a < 2; a++) {
        for (let b = 0; b < 2; b++) {
          re[(2 * x + a) * n + 2 * y + b]! += g[2 * (2 * a + b)]! / N
          im[(2 * x + a) * n + 2 * y + b]! +=
            g[2 * (2 * a + b) + 1]! / N
        }
      }
    }
  }

  return { n, re, im }
}

// the largest |T - T^dag| entry (T is Hermitian by the reverse-link rule)
export function hermitianGap(T: {
  n: number
  re: Float64Array
  im: Float64Array
}): number {
  let gap = 0

  for (let i = 0; i < T.n; i++) {
    for (let j = 0; j < T.n; j++) {
      gap = Math.max(
        gap,
        Math.abs(T.re[i * T.n + j]! - T.re[j * T.n + i]!),
        Math.abs(T.im[i * T.n + j]! + T.im[j * T.n + i]!),
      )
    }
  }

  return gap
}

// THE COUNT from T's spectrum: the eigenvalues within tol of +1 and of -1, their extremes, and the predicted flat
// counts 11 c N + dim ker(I -+ T) at the beat's +c and -c (c = 2 colors)
export type FlatCount = {
  cells: number
  top: number
  bottom: number
  atPlus: number
  atMinus: number
  plus: number
  minus: number
  gapPlus: number
  gapMinus: number
}

export function flatCount(f: LinkField, tol: number): FlatCount {
  const T = averagedHop(f)
  const values = [
    ...complexEigenvalues({ re: T.re, im: T.im, n: T.n }).re,
  ].sort((a, b) => a - b)
  const atPlus = values.filter(v => Math.abs(v - 1) <= tol).length
  const atMinus = values.filter(v => Math.abs(v + 1) <= tol).length
  const off = values.filter(
    v => Math.abs(v - 1) > tol && Math.abs(v + 1) > tol,
  )

  return {
    cells: f.cells,
    top: values[values.length - 1]!,
    bottom: values[0]!,
    atPlus,
    atMinus,
    plus: 22 * f.cells + atPlus,
    minus: 22 * f.cells + atMinus,
    gapPlus: off.length
      ? Math.min(...off.map(v => Math.abs(v - 1)))
      : Infinity,
    gapMinus: off.length
      ? Math.min(...off.map(v => Math.abs(v + 1)))
      : Infinity,
  }
}

// ---- the beat on the whole box: a state is cells x 24 slots x 2 colors, complex ----

export type BoxVector = { re: Float64Array; im: Float64Array }

export const boxSize = (f: LinkField): number => f.cells * N * 2

// out = S_g X v (U0), v not aliased by out
export function involutionApply(
  f: LinkField,
  target: Int32Array,
  v: BoxVector,
  out: BoxVector,
): void {
  out.re.fill(0)
  out.im.fill(0)

  for (let x = 0; x < f.cells; x++) {
    for (let t = 0; t < N; t++) {
      // X: slot t takes the value of slot -t; the stream takes slot t along root t
      const from = (x * N + OPPOSITE_SLOT[t]!) * 2
      const to = Math.floor(target[x * N + t]! / N)
      const g = f.link[x * N + t]!
      const at = (to * N + t) * 2

      for (let a = 0; a < 2; a++) {
        let re = 0
        let im = 0

        for (let b = 0; b < 2; b++) {
          const gr = g[2 * (2 * a + b)]!
          const gi = g[2 * (2 * a + b) + 1]!
          const vr = v.re[from + b]!
          const vi = v.im[from + b]!

          re += gr * vr - gi * vi
          im += gr * vi + gi * vr
        }

        out.re[at + a] = re
        out.im[at + a] = im
      }
    }
  }
}

// out = U v = c U0 (I + beta J) v, J the uniform projector of each dock and color (J v = 1 1^T v / 1, as in applyVibe:
// the rank-one change adds beta times the slot sum to every slot)
export function beatApply(
  f: LinkField,
  target: Int32Array,
  shape: VibeShape,
  v: BoxVector,
  out: BoxVector,
): void {
  const w: BoxVector = {
    re: Float64Array.from(v.re),
    im: Float64Array.from(v.im),
  }
  const [b0, b1] = shape.beta
  const [c0, c1] = shape.c

  for (let x = 0; x < f.cells; x++) {
    for (let a = 0; a < 2; a++) {
      let sr = 0
      let si = 0

      for (let d = 0; d < N; d++) {
        sr += v.re[(x * N + d) * 2 + a]!
        si += v.im[(x * N + d) * 2 + a]!
      }

      for (let d = 0; d < N; d++) {
        w.re[(x * N + d) * 2 + a]! += b0 * sr - b1 * si
        w.im[(x * N + d) * 2 + a]! += b0 * si + b1 * sr
      }
    }
  }

  involutionApply(f, target, w, out)

  for (let i = 0; i < out.re.length; i++) {
    const r = out.re[i]!
    const m = out.im[i]!

    out.re[i] = c0 * r - c1 * m
    out.im[i] = c0 * m + c1 * r
  }
}

export const boxNorm = (v: BoxVector): number => {
  let s = 0

  for (let i = 0; i < v.re.length; i++) {
    s += v.re[i]! ** 2 + v.im[i]! ** 2
  }

  return Math.sqrt(s)
}

// a Weyl start on the box
export function weylVector(size: number, offset: number): BoxVector {
  return {
    re: Float64Array.from(
      { length: size },
      (_, i) => weyl(i, offset) - 0.5,
    ),
    im: Float64Array.from(
      { length: size },
      (_, i) => weyl(i, offset + 0.25) - 0.5,
    ),
  }
}

// |U0^2 v - v| / |v| for a start v
export function involutionGap(f: LinkField, v: BoxVector): number {
  const tab = huskBoxTables(f.L)
  const size = boxSize(f)
  const a: BoxVector = {
    re: new Float64Array(size),
    im: new Float64Array(size),
  }
  const b: BoxVector = {
    re: new Float64Array(size),
    im: new Float64Array(size),
  }

  involutionApply(f, tab.target, v, a)
  involutionApply(f, tab.target, a, b)

  let s = 0

  for (let i = 0; i < size; i++) {
    s += (b.re[i]! - v.re[i]!) ** 2 + (b.im[i]! - v.im[i]!) ** 2
  }

  return Math.sqrt(s) / boxNorm(v)
}

// the uniform components Z^dag v: for each dock and color the slot sum over sqrt 24
function uniformPart(
  cells: number,
  v: BoxVector,
): { re: Float64Array; im: Float64Array } {
  const re = new Float64Array(cells * 2)
  const im = new Float64Array(cells * 2)
  const s = 1 / Math.sqrt(N)

  for (let x = 0; x < cells; x++) {
    for (let a = 0; a < 2; a++) {
      for (let d = 0; d < N; d++) {
        re[2 * x + a]! += v.re[(x * N + d) * 2 + a]! * s
        im[2 * x + a]! += v.im[(x * N + d) * 2 + a]! * s
      }
    }
  }

  return { re, im }
}

// P+- v = (v +- U0 v) / 2
function projectSign(
  f: LinkField,
  target: Int32Array,
  v: BoxVector,
  sign: 1 | -1,
): BoxVector {
  const u: BoxVector = {
    re: new Float64Array(v.re.length),
    im: new Float64Array(v.re.length),
  }

  involutionApply(f, target, v, u)

  return {
    re: v.re.map((x, i) => (x + sign * u.re[i]!) / 2),
    im: v.im.map((x, i) => (x + sign * u.im[i]!) / 2),
  }
}

// solve (I +- T) / 2 y = r for y by conjugate gradients (the Gram matrix Z^dag P Z, Hermitian positive when ker(I -+ T)
// is trivial); T applied densely
function gramSolve(
  T: { n: number; re: Float64Array; im: Float64Array },
  sign: 1 | -1,
  r: { re: Float64Array; im: Float64Array },
): { re: Float64Array; im: Float64Array } {
  const n = T.n

  const apply = (x: {
    re: Float64Array
    im: Float64Array
  }): { re: Float64Array; im: Float64Array } => {
    const re = new Float64Array(n)
    const im = new Float64Array(n)

    for (let i = 0; i < n; i++) {
      let sr = 0
      let si = 0

      for (let j = 0; j < n; j++) {
        const tr = T.re[i * n + j]!
        const ti = T.im[i * n + j]!

        sr += tr * x.re[j]! - ti * x.im[j]!
        si += tr * x.im[j]! + ti * x.re[j]!
      }

      re[i] = (x.re[i]! + sign * sr) / 2
      im[i] = (x.im[i]! + sign * si) / 2
    }

    return { re, im }
  }

  const dot = (
    a: { re: Float64Array; im: Float64Array },
    b: { re: Float64Array; im: Float64Array },
  ): number => {
    let s = 0

    for (let i = 0; i < n; i++) {
      s += a.re[i]! * b.re[i]! + a.im[i]! * b.im[i]!
    }

    return s
  }

  const x = { re: new Float64Array(n), im: new Float64Array(n) }
  const res = {
    re: Float64Array.from(r.re),
    im: Float64Array.from(r.im),
  }
  const p = { re: Float64Array.from(r.re), im: Float64Array.from(r.im) }

  let rr = dot(res, res)

  for (let k = 0; k < 4 * n && rr > 1e-30; k++) {
    const Ap = apply(p)
    const alpha = rr / dot(p, Ap)

    for (let i = 0; i < n; i++) {
      x.re[i]! += alpha * p.re[i]!
      x.im[i]! += alpha * p.im[i]!
      res.re[i]! -= alpha * Ap.re[i]!
      res.im[i]! -= alpha * Ap.im[i]!
    }

    const next = dot(res, res)

    for (let i = 0; i < n; i++) {
      p.re[i] = res.re[i]! + (next / rr) * p.re[i]!
      p.im[i] = res.im[i]! + (next / rr) * p.im[i]!
    }

    rr = next
  }

  return x
}

// A FLAT VECTOR from a start e: w = P e - P Z y with (Z^dag P Z) y = Z^dag P e, so Z^dag w = 0 and U0 w = +-w. Returns
// w normalized, its uniform part |Z^dag w| and the beat residual |U w -+ c w| (c the shape's phase)
export function flatVector(
  f: LinkField,
  shape: VibeShape,
  sign: 1 | -1,
  e: BoxVector,
): { uniform: number; residual: number; norm: number } {
  const tab = huskBoxTables(f.L)
  const T = averagedHop(f)
  const Pe = projectSign(f, tab.target, e, sign)
  const y = gramSolve(T, sign, uniformPart(f.cells, Pe))
  const Zy: BoxVector = {
    re: new Float64Array(Pe.re.length),
    im: new Float64Array(Pe.re.length),
  }
  const s = 1 / Math.sqrt(N)

  for (let x = 0; x < f.cells; x++) {
    for (let a = 0; a < 2; a++) {
      for (let d = 0; d < N; d++) {
        Zy.re[(x * N + d) * 2 + a] = y.re[2 * x + a]! * s
        Zy.im[(x * N + d) * 2 + a] = y.im[2 * x + a]! * s
      }
    }
  }

  const PZy = projectSign(f, tab.target, Zy, sign)
  const w: BoxVector = {
    re: Pe.re.map((v, i) => v - PZy.re[i]!),
    im: Pe.im.map((v, i) => v - PZy.im[i]!),
  }
  const norm = boxNorm(w)

  for (let i = 0; i < w.re.length; i++) {
    w.re[i] = w.re[i]! / norm
    w.im[i] = w.im[i]! / norm
  }

  const z = uniformPart(f.cells, w)
  const uniform = Math.sqrt(
    [...z.re, ...z.im].reduce((acc, v) => acc + v * v, 0),
  )
  const Uw: BoxVector = {
    re: new Float64Array(w.re.length),
    im: new Float64Array(w.re.length),
  }

  beatApply(f, tab.target, shape, w, Uw)

  let r = 0

  for (let i = 0; i < w.re.length; i++) {
    const er = sign * (shape.c[0] * w.re[i]! - shape.c[1] * w.im[i]!)
    const ei = sign * (shape.c[0] * w.im[i]! + shape.c[1] * w.re[i]!)

    r += (Uw.re[i]! - er) ** 2 + (Uw.im[i]! - ei) ** 2
  }

  return { uniform, residual: Math.sqrt(r), norm }
}

// ---- the moving pair over T's spectrum ----

// THE MOVING PAIR LAW. For T y = lambda y (|y| = 1) and zhat = Z y, a = P+ zhat and b = P- zhat span an invariant plane
// of U (P_Z a = p zhat, P_Z b = q zhat, p, q = (1 +- lambda) / 2), where U = c [[1 + (u - 1) p, (u - 1) q], [-(u - 1) p,
// -1 - (u - 1) q]] in the basis (a, b), u = 1 + 24 beta = e^(-i theta). With U = c sqrt(u) nu: nu^2 + 2 i sin(theta/2)
// lambda nu - 1 = 0, so nu = e^(-i w), sin w = sin(theta/2) lambda, w and pi - w: E-SPN-0143's law with g(K) replaced
// by lambda. The pair's half gap from its midpoint is m(lambda) = pi/2 - arcsin(sin(theta/2) lambda)
export const pairMass = (theta: number, lambda: number): number =>
  Math.PI / 2 - Math.asin(Math.sin(theta / 2) * lambda)

// the predicted pair phases for lambda: arg(c) - theta/2 - w, arg(c) - theta/2 - (pi - w)
export function pairPhases(
  shape: VibeShape,
  lambda: number,
): [number, number] {
  const u: [number, number] = [
    1 + 24 * shape.beta[0],
    24 * shape.beta[1],
  ]
  const theta = -Math.atan2(u[1], u[0])
  const w = Math.asin(Math.sin(theta / 2) * lambda)
  const base = Math.atan2(shape.c[1], shape.c[0]) - theta / 2

  return [base - w, base - (Math.PI - w)]
}

export const mixerTheta = (shape: VibeShape): number =>
  -Math.atan2(24 * shape.beta[1], 1 + 24 * shape.beta[0])

const wrapPhase = (x: number): number =>
  Math.atan2(Math.sin(x), Math.cos(x))

// the plane of T's eigenvector `index` (ascending) compressed through the explicit beat: the two eigenphases of the 2 x 2
// compression, the plane's closure residual |U v - (proj) v| over its two basis vectors, and the law's gap
export type PairCheck = {
  lambda: number
  phases: [number, number]
  closure: number
  lawGap: number
}

export function pairChecks(
  f: LinkField,
  shape: VibeShape,
  indices: readonly number[],
): PairCheck[] {
  const tab = huskBoxTables(f.L)
  const T = averagedHop(f)
  const n = T.n
  const m = makeComplexMatrix({ rows: n, cols: n })

  m.re.set(T.re)
  m.im.set(T.im)

  const eig = eigHermitian({ matrix: m })
  const size = boxSize(f)
  const s = 1 / Math.sqrt(N)

  return indices.map(k => {
    const lambda = eig.values[k]!
    const zhat: BoxVector = {
      re: new Float64Array(size),
      im: new Float64Array(size),
    }

    for (let x = 0; x < f.cells; x++) {
      for (let c = 0; c < 2; c++) {
        const yr = eig.vectorsRe[(2 * x + c) * n + k]!
        const yi = eig.vectorsIm[(2 * x + c) * n + k]!

        for (let d = 0; d < N; d++) {
          zhat.re[(x * N + d) * 2 + c] = yr * s
          zhat.im[(x * N + d) * 2 + c] = yi * s
        }
      }
    }

    // at lambda = +-1 one projection vanishes and the plane is a line (the rest level alone)
    const basis = ([1, -1] as const)
      .map(sign => projectSign(f, tab.target, zhat, sign))
      .filter(v => boxNorm(v) > DEGENERATE)
      .map(v => {
        const norm = boxNorm(v)

        return {
          re: v.re.map(x => x / norm),
          im: v.im.map(x => x / norm),
        }
      })
    const images = basis.map(v => {
      const out: BoxVector = {
        re: new Float64Array(size),
        im: new Float64Array(size),
      }

      beatApply(f, tab.target, shape, v, out)

      return out
    })

    const inner = (a: BoxVector, b: BoxVector): [number, number] => {
      let re = 0
      let im = 0

      for (let i = 0; i < size; i++) {
        re += a.re[i]! * b.re[i]! + a.im[i]! * b.im[i]!
        im += a.re[i]! * b.im[i]! - a.im[i]! * b.re[i]!
      }

      return [re, im]
    }

    // M[i][j] = <basis i | U basis j>
    const M = basis.map(a => images.map(b => inner(a, b)))

    let closure = 0

    images.forEach((img, j) => {
      let r = 0

      for (let i = 0; i < size; i++) {
        let er = img.re[i]!
        let ei = img.im[i]!

        basis.forEach((b, l) => {
          const [mr, mi] = M[l]![j]!

          er -= mr * b.re[i]! - mi * b.im[i]!
          ei -= mr * b.im[i]! + mi * b.re[i]!
        })
        r += er * er + ei * ei
      }

      closure = Math.max(closure, Math.sqrt(r))
    })

    const law = pairPhases(shape, lambda)

    if (basis.length === 1) {
      const [mr, mi] = M[0]![0]!
      const phase = Math.atan2(mi, mr)

      return {
        lambda,
        phases: [phase, phase],
        closure,
        lawGap: Math.min(
          Math.abs(wrapPhase(phase - law[0])),
          Math.abs(wrapPhase(phase - law[1])),
        ),
      }
    }

    // the 2 x 2 eigenvalues
    const [a, b] = M[0] as [[number, number], [number, number]]
    const [c, d] = M[1] as [[number, number], [number, number]]
    const tr: [number, number] = [a[0] + d[0], a[1] + d[1]]
    const det: [number, number] = [
      a[0] * d[0] - a[1] * d[1] - (b[0] * c[0] - b[1] * c[1]),
      a[0] * d[1] + a[1] * d[0] - (b[0] * c[1] + b[1] * c[0]),
    ]
    const disc: [number, number] = [
      tr[0] * tr[0] - tr[1] * tr[1] - 4 * det[0],
      2 * tr[0] * tr[1] - 4 * det[1],
    ]
    const mod = Math.hypot(disc[0], disc[1])
    const root: [number, number] = [
      Math.sqrt((mod + disc[0]) / 2),
      Math.sign(disc[1] || 1) *
        Math.sqrt(Math.max(0, (mod - disc[0]) / 2)),
    ]
    const phases: [number, number] = [
      Math.atan2((tr[1] + root[1]) / 2, (tr[0] + root[0]) / 2),
      Math.atan2((tr[1] - root[1]) / 2, (tr[0] - root[0]) / 2),
    ]
    const direct = Math.max(
      Math.abs(wrapPhase(phases[0] - law[0])),
      Math.abs(wrapPhase(phases[1] - law[1])),
    )
    const crossed = Math.max(
      Math.abs(wrapPhase(phases[0] - law[1])),
      Math.abs(wrapPhase(phases[1] - law[0])),
    )

    return {
      lambda,
      phases,
      closure,
      lawGap: Math.min(direct, crossed),
    }
  })
}

// the husk steps agree with the ROOTS the rule reads (both are rootsD4)
export const stepsAgree = (): boolean =>
  ROOTS.every((r, d) =>
    [0, 1, 2].every(k => HUSK_STEPS[d]![k] === r[k]),
  )
