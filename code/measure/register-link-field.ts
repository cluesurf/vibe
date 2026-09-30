// A CURVED LINK FIELD ON THE REGISTER RULE THAT KEEPS THE MEMBER LIGHT (E-SPN-0180, E-FRC-0270). E-SPN-0161 found that a
// link field that is not flat makes the swap-coin member heavy: its rest level is the TOP of the averaged hop T, and a
// disordered field pulls T's top in to the Kesten radius. The register member (E-SPN-0160) rests somewhere else. Its
// cycle is U = V (1 + (conj u - 1) Q_D) V (1 + (u - 1) Q_S), V = stream x swap coin an involution in every static field,
// so by Jordan's lemma on the two projectors Q_S and P = V Q_D V the moving spectrum is fixed by the eigenvalues mu of
// Q_S P Q_S on range(Q_S), in ANY static field:
//
//     cos E = cos M - 2 cos^2(M / 2) mu,        mu = eig(C^dag C),  C = Q_D V Q_S
//
// with E read from the midpoint pi and M the free mass. C is the covariant Clifford hop, c0 sum_d gamma(r_d) G_d T_d,
// c0 = 1 / (2 sqrt 288): a naive lattice Dirac operator on the D4 roots from the even register to the odd. So the
// member's lightest level is E(mu_min) >= M, with M reached exactly at a ZERO of the covariant Dirac hop. A zero sits in
// the middle of a chiral spectrum, which disorder fills (Banks and Casher), where the scalar member's rest sits at an
// edge, which disorder pulls in (Kesten). This module builds the field and those operators.
//
//   registerGauge    2T as the 24 Hurwitz units (code/measure/hurwitz-gauge, exact from the D4 roots) acting on the
//                    register by RIGHT multiplication on half + only: Gamma(q) = P- + P+ (w + x A1 + y A2 + z A3), A_k a
//                    signed right multiplication by e_0k, the choice found by search so that q -> Gamma(q) is an exact
//                    homomorphism of the group table. 4 Gamma is an integer matrix. A right multiplication commutes with
//                    every piece of the register rule (E-FRC-0268), so this is an SU(2)+ gauge field with values in 2T
//   registerField    a static field on the L-torus of code/measure/register-sea: link[x * 24 + d] a group element, the
//                    reverse link its inverse; trivial, a Weyl stream over the group, a pure gauge, a dilute field (a share
//                    of links on the nearest elements), the central -1 field, and any field gauge-transformed
//   diracHalf        H = (C b)^T (C b) on half + (b an orthonormal basis of the +1 eigenspace of J), real, 4 N x 4 N
//   hopHalf          the averaged hop T = b^T (1 / 24) sum_d Gamma(g) b on half +, E-SPN-0161's operator in this field
//   roleDirac        the same Clifford hop with a link matrix on a separate internal factor (the role qutrit of C*,
//                    E-FND-0160), complex, and roleHop its averaged hop
//   memberCycle      the one-member cycle on the torus with the field (the law's check and the covariance check)
//
// DETERMINISM: no random numbers; every field and start is a golden-ratio Weyl stream. EXACT: the group, 4 Gamma, J, the
// gammas and the projectors are integer matrices; spectra and amplitudes are float measurement. NOTHING MOVES: a link
// holds a value, and a member's register is turned by the link its slot crosses.

import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import {
  hurwitzExact,
  nearest,
  type GaugeGroup,
  type HurwitzExact,
} from '@/code/measure/hurwitz-gauge'
import {
  evenBlade,
  leftMultiplication,
  rightMultiplication,
} from '@/code/measure/register-symmetry'
import { volumeRight } from '@/code/measure/chiral-register'
import { EVEN, gammaMatrices } from '@/code/measure/spinor-register'
import { partnerBasis } from '@/code/measure/register-meson'
import { type Torus } from '@/code/measure/register-sea'
import { hermitianEigenvaluesTridiagonal } from '@/code/algebra/linear/eig-hermitian-tridiagonal'

const SLOTS = 24
const REG = 8
const MODES = SLOTS * REG
const GOLDEN = (Math.sqrt(5) - 1) / 2
export const C0 = 1 / (2 * Math.sqrt(288))
// below this |P s|^2 the plane check reads the line case (mu = 0 to rounding)
const ZERO_PLANE = 1e-20

type Int8x8 = number[][]

const mul = (a: Int8x8, b: Int8x8): Int8x8 =>
  a.map(row =>
    Array.from({ length: REG }, (_, j) =>
      row.reduce((s, x, k) => s + x * b[k]![j]!, 0),
    ),
  )
const same = (a: Int8x8, b: Int8x8, k = 1): boolean =>
  a.every((row, i) => row.every((x, j) => x === k * b[i]![j]!))
const eye = (): Int8x8 =>
  Array.from({ length: REG }, (_, i) =>
    Array.from({ length: REG }, (__, j) => (i === j ? 1 : 0)),
  )

// ---- 2T on half + ----

export type RegisterGauge = {
  hurwitz: HurwitzExact
  group: GaugeGroup
  // 4 Gamma(g), integer 8 x 8, index as in group
  gamma4: Int8x8[]
  // the three signed right multiplications A_k (integer), and J
  units: Int8x8[]
  J: Int8x8
  // the choice the search found, and whether the map is an exact homomorphism of the group table
  perm: number[]
  signs: number[]
  conjugate: boolean
  homomorphism: boolean
}

const PERMS = [
  [1, 2, 3],
  [1, 3, 2],
  [2, 1, 3],
  [2, 3, 1],
  [3, 1, 2],
  [3, 2, 1],
]

export function registerGauge(): RegisterGauge {
  const hurwitz = hurwitzExact()
  const group = hurwitz.group
  const n = group.order
  const J = volumeRight()
  const I = eye()
  const R = [1, 2, 3].map(k =>
    rightMultiplication(
      evenBlade(EVEN.findIndex(b => b.join(',') === `0,${k}`)),
    ),
  )
  const plus = I.map((row, i) => row.map((x, j) => x + J[i]![j]!))
  const minus2 = I.map((row, i) => row.map((x, j) => 2 * (x - J[i]![j]!)))

  const build = (
    perm: readonly number[],
    signs: readonly number[],
    conjugate: boolean,
  ): { gamma4: Int8x8[]; units: Int8x8[] } => {
    const units = perm.map((p, k) =>
      R[p - 1]!.map(row => row.map(x => signs[k]! * x)),
    )
    const gamma4 = hurwitz.doubled.map(q => {
      const c = conjugate ? [q[0]!, -q[1]!, -q[2]!, -q[3]!] : q
      const inner = I.map((row, i) =>
        row.map(
          (x, j) =>
            c[0]! * x +
            c[1]! * units[0]![i]![j]! +
            c[2]! * units[1]![i]![j]! +
            c[3]! * units[2]![i]![j]!,
        ),
      )
      const p = mul(plus, inner)

      return p.map((row, i) => row.map((x, j) => x + minus2[i]![j]!))
    })

    return { gamma4, units }
  }

  const isHom = (gamma4: Int8x8[]): boolean => {
    for (let a = 0; a < n; a++) {
      for (let b = 0; b < n; b++) {
        if (
          !same(
            mul(gamma4[a]!, gamma4[b]!),
            gamma4[group.table[a * n + b]!]!,
            4,
          )
        ) {
          return false
        }
      }
    }

    return true
  }

  for (const conjugate of [false, true]) {
    for (const perm of PERMS) {
      for (let s = 0; s < 8; s++) {
        const signs = [0, 1, 2].map(k => ((s >> k) & 1 ? -1 : 1))
        const { gamma4, units } = build(perm, signs, conjugate)

        if (isHom(gamma4)) {
          return {
            hurwitz,
            group,
            gamma4,
            units,
            J,
            perm,
            signs,
            conjugate,
            homomorphism: true,
          }
        }
      }
    }
  }

  const { gamma4, units } = build([1, 2, 3], [1, 1, 1], false)

  return {
    hurwitz,
    group,
    gamma4,
    units,
    J,
    perm: [1, 2, 3],
    signs: [1, 1, 1],
    conjugate: false,
    homomorphism: false,
  }
}

// an orthonormal basis of the +1 eigenspace of J on the even blades, 8 rows x 4 columns, row-major [row * 4 + col]
export function halfBasis(J: Int8x8, sign = 1): Float64Array {
  const cols: number[][] = []

  for (let c = 0; c < REG; c++) {
    let v = Array.from(
      { length: REG },
      (_, i) => ((i === c ? 1 : 0) + sign * J[i]![c]!) / 2,
    )

    for (const e of cols) {
      const d = v.reduce((s, x, i) => s + x * e[i]!, 0)

      v = v.map((x, i) => x - d * e[i]!)
    }

    const nrm = Math.hypot(...v)

    if (nrm > 1e-9) {
      cols.push(v.map(x => x / nrm))
    }
  }

  if (cols.length !== 4) {
    throw new Error(`register-link-field: half has ${cols.length} states`)
  }

  const b = new Float64Array(REG * 4)

  cols.forEach((v, col) => v.forEach((x, i) => (b[i * 4 + col] = x)))

  return b
}

// ---- the torus's neighbours and the field ----

export function neighbors(t: Torus): Int32Array {
  const nb = new Int32Array(t.sites.length * SLOTS)
  const mod = (x: number): number => ((x % t.L) + t.L) % t.L

  t.sites.forEach((p, x) => {
    DOCK_ROOTS.forEach((r, d) => {
      nb[x * SLOTS + d] = t.index.get(p.map((c, k) => mod(c + r[k]!)).join(','))!
    })
  })

  return nb
}

export type FieldKind = 'trivial' | 'weyl' | 'pure-gauge' | 'dilute' | 'minus'

export type RegisterField = {
  t: Torus
  nb: Int32Array
  // link[x * 24 + d]: the group element carried from dock x to dock x + r_d
  link: Int16Array
  kind: FieldKind | 'gauged'
}

const weyl = (n: number, offset: number): number =>
  (((offset + n * GOLDEN) % 1) + 1) % 1

// the index of the doubled unit (a, b, c, d)
const elementOf = (h: HurwitzExact, q: readonly number[]): number =>
  h.doubled.findIndex(x => x.every((y, k) => y === q[k]))

export function gaugeFunction(
  count: number,
  order: number,
  offset: number,
): Int16Array {
  return Int16Array.from({ length: count }, (_, x) =>
    Math.floor(weyl(7919 + x, offset) * order) % order,
  )
}

export function registerField(
  t: Torus,
  nb: Int32Array,
  G: RegisterGauge,
  kind: FieldKind,
  offset = 0.5,
  density = 0,
): RegisterField {
  const g = G.group
  const n = g.order
  const N = t.sites.length
  const link = new Int16Array(N * SLOTS)
  const near = nearest(g)
  const minusOne = elementOf(G.hurwitz, [-2, 0, 0, 0])
  const h = gaugeFunction(N, n, offset)

  let k = 0

  for (let x = 0; x < N; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const to = nb[x * SLOTS + d]!
      const back = to * SLOTS + OPPOSITE[d]!

      if (back < x * SLOTS + d) {
        continue
      }

      let v = g.identity

      if (kind === 'weyl') {
        v = Math.floor(weyl(k++, offset) * n) % n
      } else if (kind === 'dilute') {
        const w = weyl(k, offset)
        const pick = Math.floor(weyl(k, offset + 0.37) * near.length) % near.length

        k++
        v = w < density ? near[pick]! : g.identity
      } else if (kind === 'minus') {
        v = minusOne
      } else if (kind === 'pure-gauge') {
        v = g.table[h[to]! * n + g.inverse[h[x]!]!]!
      }

      link[x * SLOTS + d] = v
      link[back] = g.inverse[v]!
    }
  }

  return { t, nb, link, kind }
}

// the field transformed by a gauge function h: g(x, d) -> h(x + r_d) g(x, d) h(x)^-1
export function gaugedField(
  f: RegisterField,
  G: RegisterGauge,
  h: Int16Array,
): RegisterField {
  const g = G.group
  const n = g.order
  const link = new Int16Array(f.link.length)

  for (let x = 0; x < f.t.sites.length; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const to = f.nb[x * SLOTS + d]!

      link[x * SLOTS + d] =
        g.table[g.table[h[to]! * n + f.link[x * SLOTS + d]!]! * n + g.inverse[h[x]!]!]!
    }
  }

  return { t: f.t, nb: f.nb, link, kind: 'gauged' }
}

// the reverse rule, exactly: g(x + r_d, -d) g(x, d) = 1 on every link
export function reverseExact(f: RegisterField, G: RegisterGauge): boolean {
  const g = G.group

  for (let x = 0; x < f.t.sites.length; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const to = f.nb[x * SLOTS + d]!
      const back = f.link[to * SLOTS + OPPOSITE[d]!]!

      if (g.table[back * g.order + f.link[x * SLOTS + d]!] !== g.identity) {
        return false
      }
    }
  }

  return true
}

// ---- the operators on half + ----

// block (8 odd rows x 4 half columns) c0 gamma(r_d) Gamma(g) b, per (d, element)
function hopBlocks(G: RegisterGauge, b: Float64Array): Float64Array[] {
  const gam = gammaMatrices()

  return DOCK_ROOTS.flatMap(r => {
    const gr = Array.from({ length: REG }, (_, i) =>
      Array.from({ length: REG }, (__, j) =>
        [0, 1, 2, 3].reduce((s, k) => s + r[k]! * gam[k]![i]![j]!, 0),
      ),
    )

    return G.gamma4.map(M => {
      const out = new Float64Array(REG * 4)

      for (let i = 0; i < REG; i++) {
        for (let c = 0; c < 4; c++) {
          let s = 0

          for (let k = 0; k < REG; k++) {
            let m = 0

            for (let l = 0; l < REG; l++) {
              m += (M[k]![l]! / 4) * b[l * 4 + c]!
            }

            s += gr[i]![k]! * m
          }

          out[i * 4 + c] = C0 * s
        }
      }

      return out
    })
  })
}

// H = (C b)^T (C b), 4 N x 4 N, real symmetric, row-major
export function diracHalf(
  f: RegisterField,
  G: RegisterGauge,
  b: Float64Array,
): Float64Array {
  const N = f.t.sites.length
  const n = 4 * N
  const H = new Float64Array(n * n)
  const blocks = hopBlocks(G, b)
  const order = G.group.order
  // incoming[x]: the (y, block) pairs whose hop lands on x
  const incoming: { y: number; B: Float64Array }[][] = Array.from(
    { length: N },
    () => [],
  )

  for (let y = 0; y < N; y++) {
    for (let d = 0; d < SLOTS; d++) {
      incoming[f.nb[y * SLOTS + d]!]!.push({
        y,
        B: blocks[d * order + f.link[y * SLOTS + d]!]!,
      })
    }
  }

  for (const list of incoming) {
    for (const a of list) {
      for (const c of list) {
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            let s = 0

            for (let k = 0; k < REG; k++) {
              s += a.B[k * 4 + i]! * c.B[k * 4 + j]!
            }

            H[(4 * a.y + i) * n + 4 * c.y + j]! += s
          }
        }
      }
    }
  }

  return H
}

// T = b^T (1 / 24) sum_d Gamma(g(y, d)) b from y to y + r_d, 4 N x 4 N, real symmetric by the reverse rule
export function hopHalf(
  f: RegisterField,
  G: RegisterGauge,
  b: Float64Array,
): Float64Array {
  const N = f.t.sites.length
  const n = 4 * N
  const T = new Float64Array(n * n)
  const small = G.gamma4.map(M => {
    const out = new Float64Array(16)

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let s = 0

        for (let k = 0; k < REG; k++) {
          for (let l = 0; l < REG; l++) {
            s += b[k * 4 + i]! * (M[k]![l]! / 4) * b[l * 4 + j]!
          }
        }

        out[i * 4 + j] = s / SLOTS
      }
    }

    return out
  })

  for (let y = 0; y < N; y++) {
    for (let d = 0; d < SLOTS; d++) {
      const x = f.nb[y * SLOTS + d]!
      const B = small[f.link[y * SLOTS + d]!]!

      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          T[(4 * x + i) * n + 4 * y + j]! += B[i * 4 + j]!
        }
      }
    }
  }

  return T
}

// ---- a link on a separate internal factor (the role of C*) ----

export type ComplexLinks = {
  k: number
  // mats[e]: a k x k complex matrix, [2 (k i + j)] re, [2 (k i + j) + 1] im
  mats: Float64Array[]
  // link[x * 24 + d]: the matrix index carried from x to x + r_d; the reverse holds its inverse
  link: Int32Array
  inverse: Int32Array
}

// C = c0 sum_d gamma(r_d) b (x) G, register half + times the factor; H = C^dag C, complex 4 k N square
export function roleDirac(
  t: Torus,
  nb: Int32Array,
  links: ComplexLinks,
  b: Float64Array,
): { n: number; re: Float64Array; im: Float64Array } {
  const N = t.sites.length
  const k = links.k
  const w = 4 * k
  const n = w * N
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)
  const gam = gammaMatrices()
  // the real register part per direction: 8 x 4
  const regPart = DOCK_ROOTS.map(r => {
    const out = new Float64Array(REG * 4)

    for (let i = 0; i < REG; i++) {
      for (let c = 0; c < 4; c++) {
        let s = 0

        for (let a = 0; a < REG; a++) {
          const g = [0, 1, 2, 3].reduce((z, q) => z + r[q]! * gam[q]![i]![a]!, 0)

          s += g * b[a * 4 + c]!
        }

        out[i * 4 + c] = C0 * s
      }
    }

    return out
  })
  const incoming: { y: number; d: number; m: number }[][] = Array.from(
    { length: N },
    () => [],
  )

  for (let y = 0; y < N; y++) {
    for (let d = 0; d < SLOTS; d++) {
      incoming[nb[y * SLOTS + d]!]!.push({ y, d, m: links.link[y * SLOTS + d]! })
    }
  }

  // (C^dag C)[(y1, c1, p1), (y2, c2, p2)] = sum over the shared x of sum_i R1[i][c1] R2[i][c2] sum_q conj(G1[q][p1]) G2[q][p2]
  for (const list of incoming) {
    for (const a of list) {
      const Ra = regPart[a.d]!
      const Ga = links.mats[a.m]!

      for (const c of list) {
        const Rc = regPart[c.d]!
        const Gc = links.mats[c.m]!
        const rr = new Float64Array(16)
        const gr = new Float64Array(k * k)
        const gi = new Float64Array(k * k)

        for (let c1 = 0; c1 < 4; c1++) {
          for (let c2 = 0; c2 < 4; c2++) {
            let s = 0

            for (let i = 0; i < REG; i++) {
              s += Ra[i * 4 + c1]! * Rc[i * 4 + c2]!
            }

            rr[c1 * 4 + c2] = s
          }
        }

        for (let p1 = 0; p1 < k; p1++) {
          for (let p2 = 0; p2 < k; p2++) {
            let sr = 0
            let si = 0

            for (let q = 0; q < k; q++) {
              const ar = Ga[2 * (k * q + p1)]!
              const ai = -Ga[2 * (k * q + p1) + 1]!
              const br = Gc[2 * (k * q + p2)]!
              const bi = Gc[2 * (k * q + p2) + 1]!

              sr += ar * br - ai * bi
              si += ar * bi + ai * br
            }

            gr[p1 * k + p2] = sr
            gi[p1 * k + p2] = si
          }
        }

        for (let c1 = 0; c1 < 4; c1++) {
          for (let p1 = 0; p1 < k; p1++) {
            const row = (w * a.y + c1 * k + p1) * n + w * c.y

            for (let c2 = 0; c2 < 4; c2++) {
              const x = rr[c1 * 4 + c2]!

              if (x === 0) {
                continue
              }

              for (let p2 = 0; p2 < k; p2++) {
                re[row + c2 * k + p2]! += x * gr[p1 * k + p2]!
                im[row + c2 * k + p2]! += x * gi[p1 * k + p2]!
              }
            }
          }
        }
      }
    }
  }

  return { n, re, im }
}

// T = (1 / 24) sum_d G from y to y + r_d, complex k N square (E-SPN-0161's averaged hop on the factor)
export function roleHop(
  t: Torus,
  nb: Int32Array,
  links: ComplexLinks,
): { n: number; re: Float64Array; im: Float64Array } {
  const N = t.sites.length
  const k = links.k
  const n = k * N
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let y = 0; y < N; y++) {
    for (let d = 0; d < SLOTS; d++) {
      const x = nb[y * SLOTS + d]!
      const M = links.mats[links.link[y * SLOTS + d]!]!

      for (let i = 0; i < k; i++) {
        for (let j = 0; j < k; j++) {
          re[(k * x + i) * n + k * y + j]! += M[2 * (k * i + j)]! / SLOTS
          im[(k * x + i) * n + k * y + j]! += M[2 * (k * i + j) + 1]! / SLOTS
        }
      }
    }
  }

  return { n, re, im }
}

// a Weyl field over a list of matrices with inverses: link and reverse
export function complexWeylLinks(
  t: Torus,
  nb: Int32Array,
  mats: Float64Array[],
  inverse: Int32Array,
  identity: number,
  kind: 'trivial' | 'weyl',
  offset = 0.5,
): ComplexLinks {
  const N = t.sites.length
  const link = new Int32Array(N * SLOTS)
  const k = Math.round(Math.sqrt(mats[0]!.length / 2))

  let c = 0

  for (let x = 0; x < N; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const to = nb[x * SLOTS + d]!
      const back = to * SLOTS + OPPOSITE[d]!

      if (back < x * SLOTS + d) {
        continue
      }

      const v =
        kind === 'weyl'
          ? Math.floor(weyl(c++, offset) * mats.length) % mats.length
          : identity

      link[x * SLOTS + d] = v
      link[back] = inverse[v]!
    }
  }

  return { k, mats, link, inverse }
}

// the eigenvalues of a Hermitian matrix, ascending, by code/algebra/linear/eig-hermitian-tridiagonal on H + shift (the
// QL test is relative, so a cluster of exact zeros never converges unshifted; the shift makes it absolute)
export function spectrum(
  n: number,
  re: Float64Array,
  im?: Float64Array,
  shift = 1,
): number[] {
  const a = Float64Array.from(re)

  for (let i = 0; i < n; i++) {
    a[i * n + i]! += shift
  }

  return hermitianEigenvaluesTridiagonal(n, a, im ?? new Float64Array(n * n))
    .map(x => x - shift)
    .sort((x, y) => x - y)
}

// ---- the masses ----

// the register member's lightest level at the eigenvalue mu of C^dag C, M the free mass (from the midpoint pi)
export const registerMass = (M: number, mu: number): number =>
  Math.acos(
    Math.max(-1, Math.min(1, Math.cos(M) - 2 * Math.cos(M / 2) ** 2 * mu)),
  )

// E-SPN-0161's swap-coin member at the averaged hop's extreme lambda, with its bare mass m0 (sin(theta / 2) = cos m0)
export const scalarMass = (m0: number, lambda: number): number =>
  Math.PI / 2 - Math.asin(Math.cos(m0) * lambda)

// ---- the one-member cycle with the field ----

export type Member = { re: Float64Array; im: Float64Array }

export const newMember = (N: number): Member => ({
  re: new Float64Array(N * MODES),
  im: new Float64Array(N * MODES),
})

const ED = partnerBasis()

// psi <- (1 + (w - 1) Q) psi at every dock, Q = Q_S or Q_D
function sectorMix(
  s: Member,
  N: number,
  w: readonly [number, number],
  sector: 'S' | 'D',
): void {
  const ar = w[0] - 1
  const ai = w[1]

  for (let x = 0; x < N; x++) {
    const o = x * MODES
    const cr = new Float64Array(REG)
    const ci = new Float64Array(REG)

    if (sector === 'S') {
      for (let d = 0; d < SLOTS; d++) {
        for (let a = 0; a < REG; a++) {
          cr[a]! += s.re[o + d * REG + a]! / SLOTS
          ci[a]! += s.im[o + d * REG + a]! / SLOTS
        }
      }

      for (let d = 0; d < SLOTS; d++) {
        for (let a = 0; a < REG; a++) {
          s.re[o + d * REG + a]! += ar * cr[a]! - ai * ci[a]!
          s.im[o + d * REG + a]! += ar * ci[a]! + ai * cr[a]!
        }
      }

      continue
    }

    for (let m = 0; m < MODES; m++) {
      for (let e = 0; e < REG; e++) {
        const v = ED[m * REG + e]!

        cr[e]! += v * s.re[o + m]!
        ci[e]! += v * s.im[o + m]!
      }
    }

    for (let m = 0; m < MODES; m++) {
      let pr = 0
      let pi = 0

      for (let e = 0; e < REG; e++) {
        const v = ED[m * REG + e]!

        pr += v * cr[e]!
        pi += v * ci[e]!
      }

      s.re[o + m]! += ar * pr - ai * pi
      s.im[o + m]! += ar * pi + ai * pr
    }
  }
}

// V: the swap coin and the stream, slot d of dock x + r_d takes Gamma(g(x, d)) times slot -d of dock x
export function streamApply(
  f: RegisterField,
  G: RegisterGauge,
  s: Member,
): Member {
  const N = f.t.sites.length
  const out = newMember(N)

  for (let x = 0; x < N; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const to = f.nb[x * SLOTS + d]!
      const M = G.gamma4[f.link[x * SLOTS + d]!]!
      const src = x * MODES + OPPOSITE[d]! * REG
      const dst = to * MODES + d * REG

      for (let i = 0; i < REG; i++) {
        let r = 0
        let m = 0

        for (let j = 0; j < REG; j++) {
          const c = M[i]![j]!

          if (c !== 0) {
            r += c * s.re[src + j]!
            m += c * s.im[src + j]!
          }
        }

        out.re[dst + i] = r / 4
        out.im[dst + i] = m / 4
      }
    }
  }

  return out
}

export function memberCycle(
  f: RegisterField,
  G: RegisterGauge,
  u: readonly [number, number],
  s: Member,
): Member {
  const N = f.t.sites.length
  const a: Member = { re: Float64Array.from(s.re), im: Float64Array.from(s.im) }

  sectorMix(a, N, u, 'S')

  const b = streamApply(f, G, a)

  sectorMix(b, N, [u[0], -u[1]], 'D')

  return streamApply(f, G, b)
}

// Q_D applied at every dock (for the plane check)
export function partnerApply(s: Member, N: number): Member {
  const out: Member = { re: Float64Array.from(s.re), im: Float64Array.from(s.im) }

  // (1 + (w - 1) Q) with w = 2 gives 1 + Q; subtract the identity
  sectorMix(out, N, [2, 0], 'D')

  for (let k = 0; k < out.re.length; k++) {
    out.re[k]! -= s.re[k]!
    out.im[k]! -= s.im[k]!
  }

  return out
}

// the local gauge transformation: register at dock x turned by Gamma(h[x]), every slot
export function gaugeApply(
  G: RegisterGauge,
  h: Int16Array,
  s: Member,
): Member {
  const N = h.length
  const out = newMember(N)

  for (let x = 0; x < N; x++) {
    const M = G.gamma4[h[x]!]!

    for (let d = 0; d < SLOTS; d++) {
      const o = x * MODES + d * REG

      for (let i = 0; i < REG; i++) {
        let r = 0
        let m = 0

        for (let j = 0; j < REG; j++) {
          r += M[i]![j]! * s.re[o + j]!
          m += M[i]![j]! * s.im[o + j]!
        }

        out.re[o + i] = r / 4
        out.im[o + i] = m / 4
      }
    }
  }

  return out
}

export function weylMember(N: number, offset: number): Member {
  const s = newMember(N)
  const a = Math.SQRT2
  const c = Math.sqrt(3)

  let nrm = 0

  for (let k = 0; k < s.re.length; k++) {
    s.re[k] = (((offset + (k + 1) * a) % 1) + 1) % 1 - 0.5
    s.im[k] = (((offset + (k + 1) * c) % 1) + 1) % 1 - 0.5
    nrm += s.re[k]! ** 2 + s.im[k]! ** 2
  }

  nrm = Math.sqrt(nrm)

  for (let k = 0; k < s.re.length; k++) {
    s.re[k]! /= nrm
    s.im[k]! /= nrm
  }

  return s
}

export const memberNorm = (s: Member): number => {
  let n = 0

  for (let k = 0; k < s.re.length; k++) {
    n += s.re[k]! ** 2 + s.im[k]! ** 2
  }

  return n
}

export function memberDistance(a: Member, b: Member): number {
  let worst = 0

  for (let k = 0; k < a.re.length; k++) {
    worst = Math.max(worst, Math.hypot(a.re[k]! - b.re[k]!, a.im[k]! - b.im[k]!))
  }

  return worst
}

export function memberInner(a: Member, b: Member): [number, number] {
  let re = 0
  let im = 0

  for (let k = 0; k < a.re.length; k++) {
    re += a.re[k]! * b.re[k]! + a.im[k]! * b.im[k]!
    im += a.re[k]! * b.im[k]! - a.im[k]! * b.re[k]!
  }

  return [re, im]
}

// ---- exact checks ----

// the same construction with LEFT multiplication by e_0k (a control: left multiplications are not symmetries of the rule,
// E-FRC-0268's C2), 4 Gamma_L as integers
export function leftGauge(G: RegisterGauge): Int8x8[] {
  const J = G.J
  const I = eye()
  const Lk = [1, 2, 3].map(k =>
    leftMultiplication(
      evenBlade(EVEN.findIndex(b => b.join(',') === `0,${k}`)),
    ),
  )
  const plus = I.map((row, i) => row.map((x, j) => x + J[i]![j]!))

  return G.hurwitz.doubled.map(q => {
    const inner = I.map((row, i) =>
      row.map(
        (x, j) =>
          q[0]! * x +
          q[1]! * Lk[0]![i]![j]! +
          q[2]! * Lk[1]![i]![j]! +
          q[3]! * Lk[2]![i]![j]!,
      ),
    )

    return mul(plus, inner).map((row, i) =>
      row.map((x, j) => x + 2 * ((i === j ? 1 : 0) - J[i]![j]!)),
    )
  })
}

// the exact determinant of an integer matrix (Bareiss, fraction-free; every division exact)
export function integerDeterminant(m: Int8x8): number {
  const a = m.map(r => r.map(x => BigInt(x)))
  const n = a.length

  let prev = 1n
  let sign = 1n

  for (let k = 0; k < n - 1; k++) {
    if (a[k]![k] === 0n) {
      const p = a.findIndex((r, i) => i > k && r[k] !== 0n)

      if (p < 0) {
        return 0
      }

      ;[a[k], a[p]] = [a[p]!, a[k]!]
      sign = -sign
    }

    for (let i = k + 1; i < n; i++) {
      for (let j = k + 1; j < n; j++) {
        a[i]![j] = (a[i]![j]! * a[k]![k]! - a[i]![k]! * a[k]![j]!) / prev
      }
    }

    prev = a[k]![k]!
  }

  return Number(sign * a[n - 1]![n - 1]!)
}

export type ExactGauge = {
  homomorphism: boolean
  // 4 Gamma (4 Gamma)^T = 16 I for all 24, and det(4 Gamma) = 4^8
  orthogonal: boolean
  unitDeterminant: boolean
  // Gamma is the identity on half -: (4 Gamma - 4) (1 - J) = 0
  halfMinusIdentity: boolean
  // Gamma commutes with J
  commutesJ: boolean
  // the largest commutator entry of 4 Gamma(h) with each rule projector (24 Q_S, 48 Q_D, 96 Q_D P+, 48 Q_S P+, 2 P+),
  // over the 24 elements (0 for a symmetry)
  projectorGaps: number[]
  // the same with the left-multiplication control on 48 Q_D (nonzero: the check has teeth)
  leftGap: number
  // the trace of 4 Gamma(h) equals 16 + 8 chi_2(h) (chi_2 = the doubled real part), so the register carries 4 trivial and
  // 2 doublets; the multiplicities from the character sums
  traceLaw: boolean
  doublets: number
  singlets: number
  // sum over the group of Gamma(h) X_1 Gamma(h)^-1 (X_1 = A_1 P+, the isospin generator), exactly 0: the direction
  // averages away under 2T
  averagedGenerator: number
}

export function exactGauge(
  G: RegisterGauge,
  projectors: readonly Float64Array[],
  registerGap: (
    q: Float64Array,
    slots: Int32Array,
    m: readonly (readonly number[])[],
  ) => number,
  identitySlots: Int32Array,
): ExactGauge {
  const I = eye()
  const J = G.J
  const oneMinus = I.map((row, i) => row.map((x, j) => x - J[i]![j]!))
  const four = I.map(row => row.map(x => 4 * x))
  const transpose = (m: Int8x8): Int8x8 => m.map((_, i) => m.map(r => r[i]!))

  let orthogonal = true
  let unitDeterminant = true
  let halfMinusIdentity = true
  let commutesJ = true
  let traceLaw = true
  let doubletSum = 0
  let singletSum = 0

  const avg = eye().map(row => row.map(() => 0))

  G.gamma4.forEach((M, h) => {
    if (!same(mul(M, transpose(M)), I, 16)) {
      orthogonal = false
    }

    if (integerDeterminant(M) !== 4 ** 8) {
      unitDeterminant = false
    }

    const diff = M.map((row, i) => row.map((x, j) => x - four[i]![j]!))

    if (!mul(diff, oneMinus).every(row => row.every(x => x === 0))) {
      halfMinusIdentity = false
    }

    if (!same(mul(M, J), mul(J, M))) {
      commutesJ = false
    }

    const tr = M.reduce((s, row, i) => s + row[i]!, 0)
    const chi2 = G.hurwitz.doubled[h]![0]!

    if (tr !== 16 + 8 * chi2) {
      traceLaw = false
    }

    // (tr / 4) chi_2 and (tr / 4), summed; divided by 24 below
    doubletSum += tr * chi2
    singletSum += tr

    // 2 X_1 = A_1 (1 + J), the generator on half + only
    const x1 = mul(
      G.units[0]!,
      I.map((row, i) => row.map((x, j) => x + J[i]![j]!)),
    )
    const conj = mul(mul(M, x1), transpose(M))

    conj.forEach((row, i) => row.forEach((x, j) => (avg[i]![j]! += x)))
  })

  const projectorGaps = projectors.map(q =>
    Math.max(...G.gamma4.map(M => registerGap(q, identitySlots, M))),
  )
  const left = leftGauge(G)
  const leftGap = Math.max(
    ...left.map(M => registerGap(projectors[1]!, identitySlots, M)),
  )

  return {
    homomorphism: G.homomorphism,
    orthogonal,
    unitDeterminant,
    halfMinusIdentity,
    commutesJ,
    projectorGaps,
    leftGap,
    traceLaw,
    // <chi, chi_2> = (1 / 24) sum (tr / 4) chi_2, and <chi, 1> = (1 / 24) sum tr / 4; chi_2 is real on 2T
    doublets: doubletSum / 4 / 24,
    singlets: singletSum / 4 / 24,
    averagedGenerator: Math.max(...avg.flat().map(Math.abs)),
  }
}

// the stream's covariance, link by link and exactly: 4 Gamma(g^h(x, d)) 4 Gamma(h(x)) = 4 Gamma(h(x + r_d)) 4 Gamma(g(x, d))
export function covariantExact(
  f: RegisterField,
  fh: RegisterField,
  G: RegisterGauge,
  h: Int16Array,
): boolean {
  for (let x = 0; x < f.t.sites.length; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const to = f.nb[x * SLOTS + d]!
      const a = mul(G.gamma4[fh.link[x * SLOTS + d]!]!, G.gamma4[h[x]!]!)
      const b = mul(G.gamma4[h[to]!]!, G.gamma4[f.link[x * SLOTS + d]!]!)

      if (!same(a, b)) {
        return false
      }
    }
  }

  return true
}

// ---- the band law, checked on the explicit cycle ----

// y an eigenvector of diracHalf's H (length 4 N, unit) at eigenvalue mu: s = E_S b y and p = V Q_D V s span an invariant
// plane of the cycle, whose two phases, read from pi, are both registerMass(M, mu). Returns the closure (the largest
// residual of U s, U p outside the plane) and the law's gap
export function planeCheck(input: {
  f: RegisterField
  G: RegisterGauge
  u: readonly [number, number]
  M: number
  b: Float64Array
  y: Float64Array
  mu: number
}): { closure: number; lawGap: number; overlap: number } {
  const { f, G, u, M, b, y, mu } = input
  const N = f.t.sites.length
  const s = newMember(N)

  for (let x = 0; x < N; x++) {
    for (let a = 0; a < REG; a++) {
      let v = 0

      for (let c = 0; c < 4; c++) {
        v += b[a * 4 + c]! * y[4 * x + c]!
      }

      for (let d = 0; d < SLOTS; d++) {
        s.re[x * MODES + d * REG + a] = v / Math.sqrt(SLOTS)
      }
    }
  }

  const p = streamApply(f, G, partnerApply(streamApply(f, G, s), N))
  const ov = memberInner(s, p)

  // at a zero of the hop the plane is a line (P s = 0): s is an eigenvector with the mixer's own unit, phase M from pi
  if (memberNorm(p) < ZERO_PLANE) {
    const us = memberCycle(f, G, u, s)
    const c = memberInner(s, us)
    const r = {
      re: us.re.map((x, k) => x - (c[0] * s.re[k]! - c[1] * s.im[k]!)),
      im: us.im.map((x, k) => x - (c[0] * s.im[k]! + c[1] * s.re[k]!)),
    }

    return {
      closure: Math.sqrt(memberNorm(r)),
      lawGap: Math.abs(
        Math.PI - Math.abs(Math.atan2(c[1], c[0])) - registerMass(M, mu),
      ),
      overlap: Math.abs(ov[0] - mu) + Math.abs(ov[1]),
    }
  }

  // p_perp = p - <s|p> s, normalized
  for (let k = 0; k < p.re.length; k++) {
    p.re[k]! -= ov[0] * s.re[k]! - ov[1] * s.im[k]!
    p.im[k]! -= ov[0] * s.im[k]! + ov[1] * s.re[k]!
  }

  const pn = Math.sqrt(memberNorm(p))

  for (let k = 0; k < p.re.length; k++) {
    p.re[k]! /= pn
    p.im[k]! /= pn
  }

  const basis = [s, p]
  const images = basis.map(v => memberCycle(f, G, u, v))
  const A = images.map(w => basis.map(v => memberInner(v, w)))

  let closure = 0

  images.forEach((w, j) => {
    const r = { re: Float64Array.from(w.re), im: Float64Array.from(w.im) }

    basis.forEach((v, i) => {
      const [cr, ci] = A[j]![i]!

      for (let k = 0; k < r.re.length; k++) {
        r.re[k]! -= cr * v.re[k]! - ci * v.im[k]!
        r.im[k]! -= cr * v.im[k]! + ci * v.re[k]!
      }
    })

    closure = Math.max(closure, Math.sqrt(memberNorm(r)))
  })

  // the 2 x 2 matrix m[i][j] = <basis i | U basis j> = A[j][i]; its eigenvalues
  const a = A[0]![0]!
  const bb = A[1]![0]!
  const c = A[0]![1]!
  const d = A[1]![1]!
  const tr: [number, number] = [a[0] + d[0], a[1] + d[1]]
  const det: [number, number] = [
    a[0] * d[0] - a[1] * d[1] - (bb[0] * c[0] - bb[1] * c[1]),
    a[0] * d[1] + a[1] * d[0] - (bb[0] * c[1] + bb[1] * c[0]),
  ]
  // disc = tr^2 / 4 - det
  const dr = (tr[0] * tr[0] - tr[1] * tr[1]) / 4 - det[0]
  const di = (2 * tr[0] * tr[1]) / 4 - det[1]
  const mod = Math.hypot(dr, di)
  const sr = Math.sqrt((mod + dr) / 2)
  const si = (di >= 0 ? 1 : -1) * Math.sqrt(Math.max(0, (mod - dr) / 2))
  const eig = [
    [tr[0] / 2 + sr, tr[1] / 2 + si],
    [tr[0] / 2 - sr, tr[1] / 2 - si],
  ]
  const want = registerMass(M, mu)
  const lawGap = Math.max(
    ...eig.map(([x, z]) => {
      const phi = Math.atan2(z!, x!)

      return Math.abs(Math.PI - Math.abs(phi) - want)
    }),
  )

  return { closure, lawGap, overlap: Math.abs(ov[0] - mu) + Math.abs(ov[1]) }
}

// ---- the breaking sea of E-FND-0159 under the field ----

// the weight a start in the +i eigenspace of X_1 (half +) leaves there after one cycle: 1 - |Pi U Pi psi|^2, Pi = (P+ -
// i X_1) / 2. In a flat field U commutes with X_1 and this is 0
export function breakingLeak(
  f: RegisterField,
  G: RegisterGauge,
  u: readonly [number, number],
  start: Member,
): number {
  const N = f.t.sites.length
  const J = G.J
  // X_1 = A_1 P+ (floats), P+ = (1 + J) / 2
  const Pp = eye().map((row, i) => row.map((x, j) => (x + J[i]![j]!) / 2))
  const X1 = G.units[0]!.map(row =>
    Array.from({ length: REG }, (_, j) =>
      row.reduce((s, x, k) => s + x * Pp[k]![j]!, 0),
    ),
  )
  const project = (s: Member): Member => {
    const out = newMember(N)

    for (let o = 0; o < s.re.length; o += REG) {
      for (let i = 0; i < REG; i++) {
        let r = 0
        let m = 0

        for (let j = 0; j < REG; j++) {
          // (P+ - i X_1) / 2 applied to (re + i im)
          const p = Pp[i]![j]! / 2
          const x = X1[i]![j]! / 2

          r += p * s.re[o + j]! + x * s.im[o + j]!
          m += p * s.im[o + j]! - x * s.re[o + j]!
        }

        out.re[o + i] = r
        out.im[o + i] = m
      }
    }

    return out
  }

  const psi = project(start)
  const n0 = memberNorm(psi)

  for (let k = 0; k < psi.re.length; k++) {
    psi.re[k]! /= Math.sqrt(n0)
    psi.im[k]! /= Math.sqrt(n0)
  }

  const kept = project(memberCycle(f, G, u, psi))

  return 1 - memberNorm(kept)
}

// THE BREAKING SEA'S GAUSS WEIGHT PER DOCK, exactly. The sea B of E-FND-0159 holds, at every dock, holes filling the X_1 =
// +i space of half + (24 slots x 2 = 48 modes). A local move h acts there as (w + i x) times the identity, so the Slater
// overlap <B | G_x(h) | B> is (w + i x)^48, and B's weight in the dock's Gauss sector (the 2T invariants) is (1 / 24)
// sum_h (w + i x)^48. Returned as an exact rational (numerator, denominator) with (w, x) the halved doubled coordinates
// of each unit, and the float check that Pi Gamma(h) Pi = (w + i x) Pi for every h
export function breakingGaussWeight(G: RegisterGauge): {
  numerator: bigint
  denominator: bigint
  value: number
  blockGap: number
} {
  let sr = 0n
  let si = 0n

  for (const q of G.hurwitz.doubled) {
    // (W + i X)^48 with W, X the doubled coordinates, over 2^48
    let zr = 1n
    let zi = 0n
    const a = BigInt(q[0]!)
    const c = BigInt(q[1]!)

    for (let k = 0; k < 48; k++) {
      ;[zr, zi] = [zr * a - zi * c, zr * c + zi * a]
    }

    sr += zr
    si += zi
  }

  const J = G.J
  const Pp = eye().map((row, i) => row.map((x, j) => (x + J[i]![j]!) / 2))
  const X1 = G.units[0]!.map(row =>
    Array.from({ length: REG }, (_, j) =>
      row.reduce((s, x, k) => s + x * Pp[k]![j]!, 0),
    ),
  )
  // Pi = (P+ - i X_1) / 2 as re and im parts
  const Pr = Pp.map(row => row.map(x => x / 2))
  const Pi = X1.map(row => row.map(x => -x / 2))
  const cmul = (
    ar: number[][],
    ai: number[][],
    br: number[][],
    bi: number[][],
  ): [number[][], number[][]] => [
    ar.map((row, i) =>
      Array.from({ length: REG }, (_, j) =>
        row.reduce((s, x, k) => s + x * br[k]![j]! - ai[i]![k]! * bi[k]![j]!, 0),
      ),
    ),
    ar.map((row, i) =>
      Array.from({ length: REG }, (_, j) =>
        row.reduce((s, x, k) => s + x * bi[k]![j]! + ai[i]![k]! * br[k]![j]!, 0),
      ),
    ),
  ]
  const zero = eye().map(row => row.map(() => 0))

  let blockGap = 0

  G.gamma4.forEach((M, h) => {
    const g = M.map(row => row.map(x => x / 4))
    const [ar, ai] = cmul(Pr, Pi, g, zero)
    const [br, bi] = cmul(ar, ai, Pr, Pi)
    const w = G.hurwitz.doubled[h]![0]! / 2
    const x = G.hurwitz.doubled[h]![1]! / 2

    for (let i = 0; i < REG; i++) {
      for (let j = 0; j < REG; j++) {
        const er = w * Pr[i]![j]! - x * Pi[i]![j]!
        const ei = w * Pi[i]![j]! + x * Pr[i]![j]!

        blockGap = Math.max(
          blockGap,
          Math.abs(br[i]![j]! - er),
          Math.abs(bi[i]![j]! - ei),
        )
      }
    }
  })

  const denominator = 24n * 2n ** 48n

  return {
    numerator: si === 0n ? sr : sr,
    denominator,
    value: Number(sr) / Number(denominator),
    blockGap: si === 0n ? blockGap : Infinity,
  }
}

export { MODES, SLOTS, REG, mul as mul8i, same as same8i }
