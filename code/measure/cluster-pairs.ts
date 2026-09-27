// What the fear beat's meetings see inside a role cluster (E-SPN-0070): for each joint (2T, S_n) channel of the
// translation-neutral space of n roles and m antiroles, the share of a love pair that is role-antisymmetric (the
// part the like meeting U = P_sym + omega P_anti turns by omega) and the share of a love-fear pair that is the
// meson singlet Phi (the part the unlike meeting V = 1 + (omega - 1) Phi Phi^+ turns by omega).
//
// The neutral space is built as an orthonormal basis (the range of the color projector, code/algebra/role-cluster),
// and each channel's share is a trace against the channel's isotypic projector,
//   share = tr(P_rho,mu A) / tr(P_rho,mu),  P_rho,mu = (d_rho d_mu / |2T| |S_n|) sum conj(chi_rho(e)) chi_mu(s) s R(e),
// with A the love pair's antisymmetrizer (roles 0 and 1) or the singlet projector on (role 0, antirole n). Both
// commute with the color group, so they keep the neutral space. Measurement code.

import { type ComplexMatrix } from '@/code/algebra/linear/complex-matrix'
import { applyToCluster, binaryTetrahedralCharacters, cycleType, heisenbergGroup, permutations, spinTurns } from '@/code/algebra/role-cluster'
import { irrepsOf, partitionName } from '@/code/measure/pauli-cluster'

type Vec = { re: Float64Array; im: Float64Array }

export type ChannelShare = { readonly spin: string; readonly twoPiSign: number; readonly partition: string; readonly dimension: number; readonly antisymmetricShare: number; readonly singletShare: number }

const inner = (a: Vec, b: Vec): [number, number] => {
  let re = 0
  let im = 0

  for (let i = 0; i < a.re.length; i++) {
    re += (a.re[i] as number) * (b.re[i] as number) + (a.im[i] as number) * (b.im[i] as number)
    im += (a.re[i] as number) * (b.im[i] as number) - (a.im[i] as number) * (b.re[i] as number)
  }

  return [re, im]
}

// the vector with its role factors permuted: factor k of the output holds factor perm^-1(k) of the input, so that
// (s v)(x_(s(0)), ...) = v(x_0, ...)
function permuteRoles(v: Vec, perm: readonly number[], total: number): Vec {
  const out = { re: new Float64Array(v.re.length), im: new Float64Array(v.re.length) }
  const digits = new Array<number>(total).fill(0)
  const moved = new Array<number>(total).fill(0)

  for (let i = 0; i < v.re.length; i++) {
    let c = i

    for (let f = total - 1; f >= 0; f--) {
      digits[f] = c % 3
      c = Math.floor(c / 3)
    }

    for (let f = 0; f < total; f++) moved[f] = digits[f] as number

    for (let f = 0; f < perm.length; f++) moved[perm[f] as number] = digits[f] as number

    const j = moved.reduce((s, d) => 3 * s + d, 0)

    out.re[j] = v.re[i] as number
    out.im[j] = v.im[i] as number
  }

  return out
}

export function channelShares(input: { roles: number; antiroles: number }): { shares: ChannelShare[]; rank: number } {
  const { roles, antiroles } = input
  const total = roles + antiroles
  const size = 3 ** total
  const group = heisenbergGroup()
  const { turns, lambda } = spinTurns()
  const characters = binaryTetrahedralCharacters({ turns, lambda })
  const central = turns.findIndex(t => t.order === 2)
  const perms = permutations(roles)

  // the neutral basis
  const basis: Vec[] = []

  for (let i = 0; i < size && basis.length < size; i++) {
    const e = { re: new Float64Array(size), im: new Float64Array(size) }

    e.re[i] = 1

    const p = { re: new Float64Array(size), im: new Float64Array(size) }

    for (const h of group) {
      const hv = applyToCluster({ vector: e, unitary: h, roles, antiroles })

      for (let k = 0; k < size; k++) {
        p.re[k] = (p.re[k] as number) + (hv.re[k] as number) / group.length
        p.im[k] = (p.im[k] as number) + (hv.im[k] as number) / group.length
      }
    }

    for (const b of basis) {
      const [cr, ci] = inner(b, p)

      for (let k = 0; k < size; k++) {
        const br = b.re[k] as number
        const bi = b.im[k] as number

        p.re[k] = (p.re[k] as number) - (cr * br - ci * bi)
        p.im[k] = (p.im[k] as number) - (cr * bi + ci * br)
      }
    }

    const n = Math.sqrt(inner(p, p)[0])

    if (n > 1e-9) basis.push({ re: p.re.map(x => x / n), im: p.im.map(x => x / n) })
  }

  // A: the antisymmetrizer on roles 0 and 1, and the singlet projector on role 0 and the first antirole
  const antisym = (v: Vec): Vec => {
    const s = permuteRoles(v, [1, 0, ...Array.from({ length: roles - 2 }, (_, k) => k + 2)], total)

    return { re: v.re.map((x, k) => (x - (s.re[k] as number)) / 2), im: v.im.map((x, k) => (x - (s.im[k] as number)) / 2) }
  }
  const singlet = (v: Vec): Vec => {
    const out = { re: new Float64Array(size), im: new Float64Array(size) }

    if (antiroles === 0) return out

    const s0 = 3 ** (total - 1)
    const sa = 3 ** (total - 1 - roles)

    for (let i = 0; i < size; i++) {
      const d0 = Math.floor(i / s0) % 3
      const da = Math.floor(i / sa) % 3

      if (d0 !== da) continue

      // (P v)_(jj) = (1/3) sum_k v_(kk) with the other factors fixed
      const base = i - d0 * s0 - da * sa

      let sr = 0
      let si = 0

      for (let k = 0; k < 3; k++) {
        sr += v.re[base + k * s0 + k * sa] as number
        si += v.im[base + k * s0 + k * sa] as number
      }

      out.re[i] = sr / 3
      out.im[i] = si / 3
    }

    return out
  }

  // M(e, s) = sum_j <b_j | s R(e) A b_j>, for A = identity, antisym, singlet
  const traces = (a: (v: Vec) => Vec): [number, number][][] => {
    const out: [number, number][][] = turns.map(() => perms.map(() => [0, 0] as [number, number]))

    for (const b of basis) {
      const w = a(b)

      turns.forEach((t, ei) => {
        const rw = applyToCluster({ vector: w, unitary: t.unitary as ComplexMatrix, roles, antiroles })

        perms.forEach((p, si) => {
          const srw = permuteRoles(rw, p, total)
          const [cr, ci] = inner(b, srw)
          const cell = out[ei]![si]!

          cell[0] += cr
          cell[1] += ci
        })
      })
    }

    return out
  }
  const tOne = traces(v => v)
  const tAnti = traces(antisym)
  const tSinglet = traces(singlet)
  const shares: ChannelShare[] = []

  for (const c of characters) {
    for (const mu of irrepsOf(roles)) {
      const project = (t: [number, number][][]): number => {
        let s = 0

        turns.forEach((_, ei) => {
          const chi = c.values[ei] ?? [0, 0]

          perms.forEach((p, si) => {
            const x = mu.values[cycleType(p).join(',')] ?? 0
            const m = t[ei]![si]!

            // Re(conj(chi) m) x
            s += x * (chi[0] * m[0] + chi[1] * m[1])
          })
        })

        return (s * c.dimension * mu.dimension) / (turns.length * perms.length)
      }
      const dimension = project(tOne)

      if (dimension < 0.5) continue

      const at1 = c.values[turns.findIndex(t => t.order === 1)]?.[0] ?? 1
      const at2 = c.values[central]?.[0] ?? 1

      shares.push({ spin: c.name, twoPiSign: Math.sign(at2 / at1), partition: partitionName(mu.partition), dimension, antisymmetricShare: project(tAnti) / dimension, singletShare: project(tSinglet) / dimension })
    }
  }

  return { shares, rank: basis.length }
}
