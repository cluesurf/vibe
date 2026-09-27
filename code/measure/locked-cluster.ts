// Spin and statistics of a role cluster when every role is LOCKED into its spinor doublet (E-SPN-0071).
//
// A role is a qutrit. The 2 pi turn of the model's double cover 2T acts on it as R = -P (P the parity |j> -> |-j>),
// which is -1 on the parity-even doublet D (spanned by e0 = |0> and e1 = (|1> + |2>) / sqrt 2) and +1 on the
// parity-odd line (o = (|1> - |2>) / sqrt 2). So R = (-1)^(Pi_D) on one role, and on a cluster of n roles and m
// antiroles (an antirole transforms by the conjugate, and -P is real)
//
//   R_cluster = (-1)^N,   N = sum over roles of Pi_D - sum over antiroles of Pi_D,
//
// N being the model's own fermion number read about the turn's center (E-SPN-0059: a doublet is N = 1, the line
// N = 0). This is an operator identity. The 2 pi sign of any cluster state is the parity of its doublet count, not
// of its vibe count n - m: they differ by the number of roles on the line.
//
// When every role is locked into the doublet (E-SPN-0066: a moving token is a spinor by force), N = n - m on every
// state, so the 2 pi sign is (-1)^(n - m) for every state of the cluster, and a charge-one cluster (n - m = 3) is
// spinorial whatever binds it. Which spin the lightest level has is then a Young-diagram question on D (x) ... (x) D,
// whose role irreps have at most two rows (Schur-Weyl for a two-dimensional space).
//
// This module supplies: the order-2 turn against -P, the identity R = (-1)^N checked on every doublet-basis product
// vector, the distribution of N on each joint (2T, S_n) channel of the UNLOCKED neutral space (the E-SPN-0067
// grounds), and the joint (2T, S_n) content of the LOCKED cluster D^(x n) (x) conj(D)^(x m) by characters (the
// cluster at one common own point; the color frame's translations move that point, so each translation orbit is
// one copy of this space, and the center requires n - m = 0 mod 3). Measurement code: characters and traces in
// floats. It holds no rule of the model.

import { type ComplexMatrix, complexMultiply } from '@/code/algebra/linear/complex-matrix'
import { applyToCluster, binaryTetrahedralCharacters, cycleType, heisenbergGroup, permutations, spinTurns, type Complex } from '@/code/algebra/role-cluster'
import { parityMatrix, traceOf } from '@/code/algebra/weil-representation'
import { irrepsOf, partitionName } from '@/code/measure/pauli-cluster'

type Vec = { re: Float64Array; im: Float64Array }

const H = Math.SQRT1_2

// the doublet basis e0, e1 and the line o, as columns (real): component j of basis vector k is BASIS[k][j]
export const DOUBLET_BASIS: readonly (readonly number[])[] = [
  [1, 0, 0],
  [0, H, H],
  [0, H, -H],
]

// which basis vectors are in the doublet
export const IN_DOUBLET: readonly boolean[] = [true, true, false]

function projector(which: 'doublet' | 'line'): ComplexMatrix {
  const p = parityMatrix(3)
  const re = new Float64Array(9)

  for (let i = 0; i < 9; i++) re[i] = ((i % 4 === 0 ? 1 : 0) + (which === 'doublet' ? 1 : -1) * (p.re[i] as number)) / 2

  return { re, im: new Float64Array(9), n: 3 }
}

export const doubletProjector = (): ComplexMatrix => projector('doublet')
export const lineProjector = (): ComplexMatrix => projector('line')

// the order-2 turn of the Weil lift against -P: the largest entry gap
export function centralTurnGap(): { gap: number; trace: Complex } {
  const { turns } = spinTurns()
  const central = turns.find(t => t.order === 2)

  if (!central) throw new Error('no order-2 turn')

  const p = parityMatrix(3)
  let gap = 0

  for (let i = 0; i < 9; i++) gap = Math.max(gap, Math.hypot((central.unitary.re[i] as number) + (p.re[i] as number), central.unitary.im[i] as number))

  return { gap, trace: traceOf(central.unitary) as Complex }
}

// the product vector of doublet-basis labels (roles first), in the computational basis of (C^3)^(n + m)
function productVector(labels: readonly number[]): Vec {
  const total = labels.length
  const size = 3 ** total
  const re = new Float64Array(size)

  for (let i = 0; i < size; i++) {
    let c = i
    let amp = 1

    for (let f = total - 1; f >= 0; f--) {
      const digit = c % 3

      c = Math.floor(c / 3)
      amp *= DOUBLET_BASIS[labels[f] as number]![digit] as number
    }

    re[i] = amp
  }

  return { re, im: new Float64Array(size) }
}

// R_cluster v = (-1)^N v on every doublet-basis product vector of n roles and m antiroles: the largest gap
export function twoPiIdentityGap(input: { roles: number; antiroles: number }): { gap: number; vectors: number } {
  const { roles, antiroles } = input
  const total = roles + antiroles
  const { turns } = spinTurns()
  const central = turns.find(t => t.order === 2)!
  let gap = 0
  let vectors = 0

  for (let code = 0; code < 3 ** total; code++) {
    const labels: number[] = []
    let c = code

    for (let f = 0; f < total; f++) {
      labels.push(c % 3)
      c = Math.floor(c / 3)
    }

    const v = productVector(labels)
    const rv = applyToCluster({ vector: v, unitary: central.unitary, roles, antiroles })
    let n = 0

    labels.forEach((l, f) => {
      if (IN_DOUBLET[l]) n += f < roles ? 1 : -1
    })

    const sign = n % 2 === 0 ? 1 : -1

    for (let i = 0; i < v.re.length; i++) gap = Math.max(gap, Math.hypot((rv.re[i] as number) - sign * (v.re[i] as number), rv.im[i] as number))

    vectors++
  }

  return { gap, vectors }
}

const inner = (a: Vec, b: Vec): [number, number] => {
  let re = 0
  let im = 0

  for (let i = 0; i < a.re.length; i++) {
    re += (a.re[i] as number) * (b.re[i] as number) + (a.im[i] as number) * (b.im[i] as number)
    im += (a.re[i] as number) * (b.im[i] as number) - (a.im[i] as number) * (b.re[i] as number)
  }

  return [re, im]
}

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

// the doublet count N of each computational-basis index is not defined (N is diagonal in the doublet basis), so
// the distribution is read by expanding a vector in the doublet product basis
function numberWeights(v: Vec, roles: number, antiroles: number): Map<number, number> {
  const total = roles + antiroles
  const out = new Map<number, number>()

  for (let code = 0; code < 3 ** total; code++) {
    const labels: number[] = []
    let c = code

    for (let f = 0; f < total; f++) {
      labels.push(c % 3)
      c = Math.floor(c / 3)
    }

    const [re, im] = inner(productVector(labels), v)
    let n = 0

    labels.forEach((l, f) => {
      if (IN_DOUBLET[l]) n += f < roles ? 1 : -1
    })

    out.set(n, (out.get(n) ?? 0) + re * re + im * im)
  }

  return out
}

export type NumberChannel = { readonly spin: string; readonly twoPiSign: number; readonly partition: string; readonly dimension: number; readonly weights: Map<number, number> }

// for each joint (2T, S_n) channel of the UNLOCKED neutral space of n roles and m antiroles: its dimension and the
// distribution of the doublet count N in the channel's maximally mixed state
export function numberDistribution(input: { roles: number; antiroles: number }): NumberChannel[] {
  const { roles, antiroles } = input
  const total = roles + antiroles
  const size = 3 ** total
  const group = heisenbergGroup()
  const { turns, lambda } = spinTurns()
  const characters = binaryTetrahedralCharacters({ turns, lambda })
  const central = turns.findIndex(t => t.order === 2)
  const identity = turns.findIndex(t => t.order === 1)
  const perms = permutations(roles)
  const neutral: Vec[] = []

  for (let i = 0; i < size; i++) {
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

    orthonormalInto(neutral, p)
  }

  const out: NumberChannel[] = []

  for (const c of characters) {
    for (const mu of irrepsOf(roles)) {
      const channel: Vec[] = []

      for (const b of neutral) {
        const p = { re: new Float64Array(size), im: new Float64Array(size) }

        turns.forEach((t, ei) => {
          const chi = c.values[ei] ?? [0, 0]
          const rb = applyToCluster({ vector: b, unitary: t.unitary as ComplexMatrix, roles, antiroles })

          perms.forEach(perm => {
            const x = mu.values[cycleType(perm).join(',')] ?? 0

            if (x === 0) return

            const s = permuteRoles(rb, perm, total)
            // coefficient conj(chi) x d_rho d_mu / (|2T| |S_n|)
            const f = (c.dimension * mu.dimension) / (turns.length * perms.length)
            const cr = f * x * chi[0]
            const ci = -f * x * chi[1]

            for (let k = 0; k < size; k++) {
              p.re[k] = (p.re[k] as number) + cr * (s.re[k] as number) - ci * (s.im[k] as number)
              p.im[k] = (p.im[k] as number) + cr * (s.im[k] as number) + ci * (s.re[k] as number)
            }
          })
        })
        orthonormalInto(channel, p)
      }

      if (channel.length === 0) continue

      const weights = new Map<number, number>()

      for (const v of channel) {
        for (const [n, w] of numberWeights(v, roles, antiroles)) weights.set(n, (weights.get(n) ?? 0) + w / channel.length)
      }

      const at1 = c.values[identity]?.[0] ?? 1
      const at2 = c.values[central]?.[0] ?? 1

      out.push({ spin: c.name, twoPiSign: Math.sign(at2 / at1), partition: partitionName(mu.partition), dimension: channel.length, weights })
    }
  }

  return out
}

function orthonormalInto(basis: Vec[], p: Vec): void {
  for (const b of basis) {
    const [cr, ci] = inner(b, p)

    for (let k = 0; k < p.re.length; k++) {
      const br = b.re[k] as number
      const bi = b.im[k] as number

      p.re[k] = (p.re[k] as number) - (cr * br - ci * bi)
      p.im[k] = (p.im[k] as number) - (cr * bi + ci * br)
    }
  }

  const n = Math.sqrt(inner(p, p)[0])

  if (n > 1e-9) basis.push({ re: p.re.map(x => x / n), im: p.im.map(x => x / n) })
}

export type LockedEntry = { readonly spin: string; readonly spinDimension: number; readonly twoPiSign: number; readonly partition: readonly number[]; readonly multiplicity: number }

// the joint (2T, S_n) content of the locked cluster (every role and antirole in its doublet, at one own point):
// chi(e, s) = prod over cycles c of s of tr(U_e^|c| Pi) x conj(tr(U_e Pi))^m, Pi the doublet (or, as a control,
// the line) projector, decomposed against the 2T and S_n characters
export function lockedJointContent(input: { roles: number; antiroles: number; subspace?: 'doublet' | 'line' }): { entries: LockedEntry[]; wholeGap: number; dimension: number; single: { spin: string; multiplicity: number }[] } {
  const { roles, antiroles } = input
  const pi = projector(input.subspace ?? 'doublet')
  const { turns, lambda } = spinTurns()
  const characters = binaryTetrahedralCharacters({ turns, lambda })
  const identity = turns.findIndex(t => t.order === 1)
  const central = turns.findIndex(t => t.order === 2)
  const perms = permutations(roles)
  // tr(U^k Pi) for k = 1..roles
  const powerTraces = turns.map(t => {
    const out: Complex[] = []
    let u = t.unitary

    for (let k = 1; k <= Math.max(1, roles); k++) {
      out.push(traceOf(complexMultiply(u, pi)) as Complex)
      u = complexMultiply(u, t.unitary)
    }

    return out
  })
  const cmul = (a: Complex, b: Complex): Complex => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
  const chiOf = (ei: number, cycles: readonly number[]): Complex => {
    const tr = powerTraces[ei]!
    let v: Complex = [1, 0]

    for (let k = 0; k < antiroles; k++) v = cmul(v, [tr[0]![0], -tr[0]![1]])

    for (const c of cycles) v = cmul(v, tr[c - 1]!)

    return v
  }
  const entries: LockedEntry[] = []
  let wholeGap = 0
  let dimension = 0

  for (const c of characters) {
    for (const s of irrepsOf(roles)) {
      let re = 0
      let im = 0

      for (const p of perms) {
        const key = cycleType(p)
        const x = s.values[key.join(',')] ?? 0

        turns.forEach((_, ei) => {
          const a = chiOf(ei, key)
          const b = c.values[ei] ?? [0, 0]

          re += x * (a[0] * b[0] + a[1] * b[1])
          im += x * (a[1] * b[0] - a[0] * b[1])
        })
      }

      re /= perms.length * turns.length
      im /= perms.length * turns.length
      wholeGap = Math.max(wholeGap, Math.abs(re - Math.round(re)), Math.abs(im))

      const m = Math.round(re)

      if (m !== 0) {
        const at1 = c.values[identity]?.[0] ?? 1
        const at2 = c.values[central]?.[0] ?? 1

        entries.push({ spin: c.name, spinDimension: c.dimension, twoPiSign: Math.sign(at2 / at1), partition: s.partition, multiplicity: m })
        dimension += m * c.dimension * s.dimension
      }
    }
  }

  // the one-role subspace itself as a 2T representation
  const single = characters
    .map(c => {
      let re = 0

      turns.forEach((_, ei) => {
        const a = powerTraces[ei]![0]!
        const b = c.values[ei] ?? [0, 0]

        re += a[0] * b[0] + a[1] * b[1]
      })

      return { spin: c.name, multiplicity: Math.round(re / turns.length) }
    })
    .filter(x => x.multiplicity !== 0)

  return { entries, wholeGap, dimension, single }
}
