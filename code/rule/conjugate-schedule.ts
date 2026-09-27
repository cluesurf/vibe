// A knit made by cycling one collision through its conjugates g C g^-1, one per beat, g running over a
// transversal of W(F4) over the collision's stabilizer (E-RLT-0062).
//
// THE IDEA. If every coset of the stabilizer appears once per period, every direction of the group is
// visited equally, and one might hope the period's transport is the group average of the beat's, which a
// W(F4)-averaged matrix makes isotropic through k^4 (E-RLT-0059). What the schedule's own symmetry is, and
// whether it keeps CPT, is exact combinatorics on the cosets: two beats are the same collision exactly when
// their elements lie in the same left coset g Stab, so
//
//   a glide h (shift s):     h g_T Stab = g_(T + s) Stab for every beat T
//   a reversal h (mirror m): h g_T Stab = g_(m - T) Stab for every beat T
//
// (for a beat that is an involution commuting with charge conjugation, as every beat here is, a reversal
// with coin map h and either tone map is exactly this). The period group is every such h.
//
// THE PALINDROME. A beat C_T = g_T C g_T^-1 of an involution C that commutes with charge conjugation keeps
// CPT beat by beat: C_c C_T C_c = C_T = C_T^-1. The ledger's CPT asks more, C_c C_T C_c = C_(m - T)^-1 for
// one mirror m and every T, so C_T = C_(m - T): the order must read the same backward. A transversal visits
// each coset once, so it cannot, and its CPT is broken over the period while every beat keeps it; running
// the transversal forward then backward (period 2N, mirror 2N - 1) restores it exactly, at the cost of
// visiting each coset twice.

import { type GroupTable } from '@/code/measure/color-isotropy-bound'
import { type LineMomentumRule, LINE_FIRSTS, momentumKey } from '@/code/rule/isometric-knit'
import { matrixOfPermutation } from '@/code/measure/husk-transport-symmetry'
import { rootsD4 } from '@/code/algebra/group/root-system'

const ROOTS = rootsD4()

// every occupation momentum a dock can hold, with a line-momentum vector that gives it (as a key map)
export function reachableMomenta(): Map<number, Int8Array> {
  const out = new Map<number, Int8Array>()
  const n = new Int8Array(12)

  for (let code = 0; code < 3 ** 12; code++) {
    let rest = code
    const p = [0, 0, 0, 0]

    for (let l = 0; l < 12; l++) {
      const value = (rest % 3) - 1
      const r = ROOTS[LINE_FIRSTS[l] ?? 0] ?? []

      rest = Math.floor(rest / 3)
      n[l] = value

      for (let k = 0; k < 4; k++) p[k] = (p[k] ?? 0) + value * (r[k] ?? 0)
    }

    const key = momentumKey(p)

    if (!out.has(key)) out.set(key, Int8Array.from(n))
  }

  return out
}

// The stabilizer of a momentum-only rule (w a function of P alone): every g with w_(gP) = g w_P g^-1 at every
// reachable momentum, exhaustively. `rule` is called with the representative line momenta of each momentum.
export function momentumRuleStabilizer(input: { rule: LineMomentumRule; table: GroupTable }): number[] {
  const { rule, table } = input
  const reachable = [...reachableMomenta().entries()].map(([key, n]) => {
    const p = [0, 1, 2, 3].map(k => (Math.floor(key / 13 ** k) % 13) - 6)

    return { p, w: rule(n, p) }
  })
  const byKey = new Map(reachable.map(r => [momentumKey(r.p), r.w]))
  const out: number[] = []

  table.permutations.forEach((g, index) => {
    const m = matrixOfPermutation(g)
    const inverse = new Int32Array(24)

    g.forEach((image, d) => {
      inverse[image] = d
    })

    const keeps = reachable.every(({ p, w }) => {
      const gp = [0, 1, 2, 3].map(i => Math.round([0, 1, 2, 3].reduce((s, j) => s + (m[i * 4 + j] ?? 0) * (p[j] ?? 0), 0)))
      const target = byKey.get(momentumKey(gp))

      if (!w || !target) return !w && !target

      // g w g^-1 at slot e is g(w(g^-1 e))
      for (let e = 0; e < 24; e++) {
        if ((g[w[inverse[e] ?? 0] ?? 0] ?? 0) !== target[e]) return false
      }

      return true
    })

    if (keeps) out.push(index)
  })

  return out
}

// one element of each left coset g Stab, in the order of the permutation list, and the coset of every element
export function leftTransversal(input: { table: GroupTable; stabilizer: readonly number[] }): { representatives: number[]; cosetOf: Int32Array } {
  const { table, stabilizer } = input
  const n = table.permutations.length
  const cosetOf = new Int32Array(n).fill(-1)
  const representatives: number[] = []

  for (let g = 0; g < n; g++) {
    if ((cosetOf[g] ?? -1) >= 0) continue

    for (const s of stabilizer) cosetOf[table.multiply[g * n + s] ?? 0] = representatives.length

    representatives.push(g)
  }

  return { representatives, cosetOf }
}

// the forward-then-backward order of a list: period 2N, reading the same backward
export function palindrome<T>(list: readonly T[]): T[] {
  return [...list, ...[...list].reverse()]
}

export type PeriodGroup = {
  // elements with some shift s (glides) and with some mirror m (reversals); the union is the period group
  readonly glides: number[]
  readonly reversals: number[]
  // the mirrors at which the identity is a reversal (CPT phases, for an involution that commutes with C)
  readonly identityMirrors: number[]
}

// the period group of a schedule of cosets (beat T is the coset `schedule[T]`), exhaustively
export function cosetPeriodGroup(input: { table: GroupTable; schedule: readonly number[]; cosetOf: Int32Array }): PeriodGroup {
  const { table, schedule, cosetOf } = input
  const n = table.permutations.length
  const period = schedule.length
  // a representative element of each scheduled coset, to multiply
  const glides: number[] = []
  const reversals: number[] = []
  const identityMirrors: number[] = []
  const repOf = new Map<number, number>()

  for (let g = 0; g < n; g++) if (!repOf.has(cosetOf[g] ?? -1)) repOf.set(cosetOf[g] ?? -1, g)

  const image = (h: number, T: number): number => cosetOf[table.multiply[h * n + (repOf.get(schedule[T] ?? 0) ?? 0)] ?? 0] ?? -1

  for (let h = 0; h < n; h++) {
    let glide = false
    let reversal = false

    for (let s = 0; s < period && !glide; s++) {
      let holds = true

      for (let T = 0; T < period && holds; T++) holds = image(h, T) === schedule[(T + s) % period]

      glide = holds
    }

    for (let m = 0; m < period; m++) {
      let holds = true

      for (let T = 0; T < period && holds; T++) holds = image(h, T) === schedule[(((m - T) % period) + period) % period]

      if (holds) {
        reversal = true

        if (h === table.identity) identityMirrors.push(m)
        else break
      }
    }

    if (glide) glides.push(h)
    if (reversal) reversals.push(h)
  }

  return { glides, reversals, identityMirrors }
}
