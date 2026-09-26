// The exact 72-index singlet linearization of the bounce knit's two collisions, B P (P first, even beats) and P B (B
// first, odd beats), at a product background with a store law per line (E-RLT-0084, E-RLT-0085). A MEASUREMENT
// (floats), labeled as such. With `collision: 'isometric'` it is the living-pair knit's linearization, and E-RLT-0084
// gates it against code/measure/sparse-living-vacuum orientedLinearization (a different construction) before reading B.
//
// WHY A NEW SUM. The isometric K reads the dock through its twelve line momenta n, which the pair move keeps (a make
// fills an empty line, an unmake empties a full one, both at n = 0), so the existing linearization sums over 3^12
// values of n. B also reads WHICH lines are full, so it needs each line's OCCUPATION CLASS (empty, first slot only,
// second slot only, full), and P changes that class. The sum here is over the 4^12 classes, read after P for B P and
// before P for P B.
//
// THE CONSTRUCTION, exact. Per line j the background makes its first slot, its second slot, its store and the equality
// of its two tokens' points independent (slot: love and fear rho / 2 each; store: the line's law; points equal with
// chance `equal`). Given the twelve classes o, the permutation pi of B (or K) is fixed; it carries line s(t)'s content
// onto line t, reversed or not (phi). So
//   B P: the output on t's slots is s's content after P, reversed by phi; t's store output is t's own store after P;
//   P B: the output on t (slots and store) is P applied to s's content reversed by phi, with t's store and s's point
//        equality.
// Each output then depends on the classes (through pi) and on the details of at most the lines s and t, which are
// independent of the other lines given their classes. With W(o) = prod_j Q_j(o_j) the class chances, the conditional
// expectation of an output under a condition on one variable of line l is
//   sum_o W(o) Q_l^c(o_l) / Q_l(o_l) G(s, o_s, phi)            (l not read)
//   sum_o W(o) / Q_s(o_s) G^c(s, o_s, phi)                     (l = s, the line whose content is read)
// and both sums are accumulated once over the 4^12 classes, per (t, l, o_l, s, o_s, phi) and per (t, s, o_s, phi); the
// conditionings are applied afterwards. The derivative is the conditional difference of code/measure/token-store-
// linearization: A[out, (i, a)] = E[out | i = a] - E[out | i = calm], and for a store E[out | tau = a] - E[out | tau = 0].

import { rootsD4 } from '@/code/algebra/group/root-system'
import { isometricTable, LINE_FIRSTS, LINE_OF, momentumKey, OPPOSITE, SIDE, type MomentumTable } from '@/code/rule/isometric-knit'
import { bounceCollide, type BounceKnit, type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { cloneStoreState } from '@/code/rule/token-store-knit'
import { STORE_N, type Background } from '@/code/measure/token-store-linearization'
import { orientedKroneckerDock, type Law } from '@/code/measure/sparse-living-vacuum'

const ROOTS = rootsD4()
const N = STORE_N
const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)
const VALUES = [1, -1, 0]
const add = (a: Float64Array, i: number, x: number): void => {
  a[i] = (a[i] as number) + x
}

export type BounceMode = 'BP' | 'PB'

// the pair move on one line (the living-pair knit's, with the neutral veto): made pairs share a point
function pairOn(a: number, b: number, tau: number, same: boolean): [number, number, number, boolean] {
  if (tau === 0) return a !== 0 && b === -a && same ? [0, 0, a, same] : [a, b, 0, same]

  return a === 0 && b === 0 ? [tau, -tau, 0, true] : [a, b, tau, same]
}

const classOf = (a: number, b: number): number => (a !== 0 ? (b !== 0 ? 3 : 1) : b !== 0 ? 2 : 0)
const signIndex = (v: number): number => (v === 1 ? 0 : 1)

// one line's variables: first slot, second slot, store, point equality; a condition fixes one of the first three
type Condition = { readonly variable: 0 | 1 | 2; readonly value: number } | undefined

type LineVariables = { a: number; b: number; tau: number; same: boolean; p: number }

function lineVariables(bg: Background, law: Law, c: Condition): LineVariables[] {
  const slot = (v: number): number => (v === 0 ? 1 - bg.rho : bg.rho / 2)
  const store = (v: number): number => (v === 1 ? law[0] : v === -1 ? law[1] : law[2])
  const out: LineVariables[] = []

  for (const a of VALUES) {
    for (const b of VALUES) {
      for (const tau of VALUES) {
        for (const same of [true, false]) {
          let p = (same ? bg.equal : 1 - bg.equal) * (c?.variable === 0 ? (a === c.value ? 1 : 0) : slot(a))

          p *= c?.variable === 1 ? (b === c.value ? 1 : 0) : slot(b)
          p *= c?.variable === 2 ? (tau === c.value ? 1 : 0) : store(tau)

          if (p > 0) out.push({ a, b, tau, same, p })
        }
      }
    }
  }

  return out
}

// the chance of each class of the line (after P for B P, before P for P B)
function classChances(vars: readonly LineVariables[], mode: BounceMode): Float64Array {
  const q = new Float64Array(4)

  for (const v of vars) {
    const [a, b] = mode === 'BP' ? pairOn(v.a, v.b, v.tau, v.same) : [v.a, v.b]

    q[classOf(a, b)] = (q[classOf(a, b)] as number) + v.p
  }

  return q
}

// B P, the source line s's content after P, reversed by phi, read on t's two slots: joint with the class,
// [k][phi][slot][sign] (slot 0 first, 1 second; sign 0 love, 1 fear)
function contentJoint(vars: readonly LineVariables[]): Float64Array {
  const out = new Float64Array(4 * 2 * 2 * 2)

  for (const v of vars) {
    const [a, b] = pairOn(v.a, v.b, v.tau, v.same)
    const k = classOf(a, b)

    for (let phi = 0; phi < 2; phi++) {
      const first = phi === 1 ? b : a
      const second = phi === 1 ? a : b

      if (first !== 0) add(out, ((k * 2 + phi) * 2 + 0) * 2 + signIndex(first), v.p)
      if (second !== 0) add(out, ((k * 2 + phi) * 2 + 1) * 2 + signIndex(second), v.p)
    }
  }

  return out
}

// B P, the line's own store after P: [sign]
function storeAfter(vars: readonly LineVariables[]): Float64Array {
  const out = new Float64Array(2)

  for (const v of vars) {
    const tau = pairOn(v.a, v.b, v.tau, v.same)[2]

    if (tau !== 0) add(out, signIndex(tau), v.p)
  }

  return out
}

// P B, target t's six outputs (first +/-, second +/-, store +/-) from the source's variables with class k and the
// target's store law `tauLaw` ([+1, -1, 0] chances), the content reversed by phi
function pbOutputs(vars: readonly LineVariables[], k: number, phi: number, tauLaw: readonly number[]): Float64Array {
  const out = new Float64Array(6)

  for (const v of vars) {
    if (classOf(v.a, v.b) !== k) continue

    const x = phi === 1 ? v.b : v.a
    const y = phi === 1 ? v.a : v.b

    for (let i = 0; i < 3; i++) {
      const pt = tauLaw[i] as number

      if (pt === 0) continue

      const [a, b, tau] = pairOn(x, y, VALUES[i] as number, v.same)
      const w = v.p * pt

      if (a !== 0) add(out, signIndex(a), w)
      if (b !== 0) add(out, 2 + signIndex(b), w)
      if (tau !== 0) add(out, 4 + signIndex(tau), w)
    }
  }

  return out
}

// The class sums over the 4^12 line classes: A[t][l][k][s][ks][phi] = sum W(o) / (Q_l(k) Q_s(ks)) over the classes o
// with o_l = k, pi carrying line s (class ks, reversed by phi) onto t, and l != s; B[t][s][ks][phi] = sum W(o) / Q_s(ks)
function classSums(input: { table: MomentumTable; kind: CollisionKind; q: readonly Float64Array[] }): { A: Float64Array; B: Float64Array } {
  const { table, kind, q } = input
  const A = new Float64Array(12 * 12 * 4 * 12 * 4 * 2)
  const B = new Float64Array(12 * 12 * 4 * 2)
  const inverse = q.map(row => Float64Array.from(row, x => (x > 0 ? 1 / x : 0)))
  const qFlat = new Float64Array(48)
  const invFlat = new Float64Array(48)
  const o = new Int32Array(12)
  const source = new Int32Array(12)
  const flip = new Int32Array(12)
  const r = [0, 1, 2, 3].map(k => Int32Array.from(ROOTS, x => x[k] ?? 0))
  const lineOf = Int32Array.from(LINE_OF)
  const side = Int32Array.from(SIDE)
  const firsts = Int32Array.from(LINE_FIRSTS)
  const seconds = Int32Array.from(LINE_SECONDS)

  for (let l = 0; l < 12; l++) {
    for (let k = 0; k < 4; k++) {
      qFlat[l * 4 + k] = q[l]?.[k] ?? 0
      invFlat[l * 4 + k] = inverse[l]?.[k] ?? 0
    }
  }

  for (let code = 0; code < 4 ** 12; code++) {
    let rest = code
    let weight = 1
    let p0 = 0
    let p1 = 0
    let p2 = 0
    let p3 = 0
    let full = 0
    let singles = 0

    for (let l = 0; l < 12; l++) {
      const k = rest & 3

      rest >>= 2
      o[l] = k
      weight *= qFlat[l * 4 + k] as number

      if (k === 3) full |= 1 << l
      else if (k !== 0) {
        singles++

        const d = k === 1 ? (firsts[l] as number) : (seconds[l] as number)

        p0 += r[0]![d] as number
        p1 += r[1]![d] as number
        p2 += r[2]![d] as number
        p3 += r[3]![d] as number
      }
    }

    if (weight === 0) continue

    const w = table[momentumKey([p0, p1, p2, p3])]
    const bounces = kind === 'bounce' || (kind === 'lone' && singles <= 1)
    let keeps = !bounces

    if (bounces && w) {
      keeps = true

      for (let l = 0; l < 12 && keeps; l++) if ((full >> l) & 1) keeps = ((full >> (lineOf[w[firsts[l] as number] as number] as number)) & 1) === 1
    }

    for (let t = 0; t < 12; t++) {
      if (bounces && (full >> t) & 1) {
        source[t] = t
        flip[t] = 1
      } else if (w && keeps) {
        // w is an involution: the slot copied onto t's first slot is w(first t)
        const u = w[firsts[t] as number] as number

        source[t] = lineOf[u] as number
        flip[t] = side[u] === 1 ? 0 : 1
      } else {
        source[t] = t
        flip[t] = 0
      }
    }

    for (let t = 0; t < 12; t++) {
      const s = source[t] as number
      const ks = o[s] as number
      const phi = flip[t] as number
      const ws = weight * (invFlat[s * 4 + ks] as number)
      const tail = (s * 4 + ks) * 2 + phi

      add(B, ((t * 12 + s) * 4 + ks) * 2 + phi, ws)

      for (let l = 0; l < 12; l++) {
        if (l === s) continue

        const kl = o[l] as number

        add(A, ((t * 12 + l) * 4 + kl) * 96 + tail, ws * (invFlat[l * 4 + kl] as number))
      }
    }
  }

  return { A, B }
}

// the exact singlet matrix of one collision (row = output index, column = input index, 72 x 72)
export function bounceLinearization(input: { table?: MomentumTable; kind: CollisionKind; background: Background; mode: BounceMode; laws: readonly Law[] }): Float64Array {
  const bg = input.background
  const table = input.table ?? isometricTable()
  const mode = input.mode
  const conditions: Condition[] = [undefined]

  for (const variable of [0, 1, 2] as const) for (const value of VALUES) conditions.push({ variable, value })

  // per line and condition: variables, class chances, and the B P tables
  const vars = input.laws.map(law => conditions.map(c => lineVariables(bg, law, c)))
  const Q = vars.map(row => row.map(v => classChances(v, mode)))
  const content = mode === 'BP' ? vars.map(row => row.map(contentJoint)) : []
  const stores = mode === 'BP' ? vars.map(row => row.map(storeAfter)) : []
  const baseQ = Q.map(row => row[0] as Float64Array)
  const { A, B } = classSums({ table, kind: input.kind, q: baseQ })
  const lawOf = (l: number): number[] => {
    const law = input.laws[l] as Law

    return [law[0], law[1], law[2]]
  }
  const pointLaw = (value: number): number[] => [value === 1 ? 1 : 0, value === -1 ? 1 : 0, value === 0 ? 1 : 0]

  // the expected outputs under condition index ci on line l: out[72]
  const expected = (l: number, ci: number): Float64Array => {
    const out = new Float64Array(N)
    const c = conditions[ci]

    for (let t = 0; t < 12; t++) {
      const ft = LINE_FIRSTS[t] as number
      const st = LINE_SECONDS[t] as number
      const rows = [ft * 2, ft * 2 + 1, st * 2, st * 2 + 1, 48 + t * 2, 48 + t * 2 + 1]
      const tauT = l === t && c?.variable === 2 ? pointLaw(c.value) : lawOf(t)
      const acc = new Float64Array(6)

      for (let s = 0; s < 12; s++) {
        for (let ks = 0; ks < 4; ks++) {
          for (let phi = 0; phi < 2; phi++) {
            const tail = (s * 4 + ks) * 2 + phi
            // the weight of (s, ks, phi) under the condition: through l's class when l != s, directly when l = s
            let weight = 0

            if (s === l) weight = B[((t * 12 + s) * 4 + ks) * 2 + phi] as number
            else for (let kl = 0; kl < 4; kl++) weight += (A[((t * 12 + l) * 4 + kl) * 96 + tail] as number) * ((Q[l]?.[ci] as Float64Array)[kl] as number)

            if (weight === 0) continue

            if (mode === 'BP') {
              // the joint holds the class chance Q_s(ks), which the weight's 1 / Q_s(ks) cancels
              const joint = content[s]?.[s === l ? ci : 0] as Float64Array

              for (let slot = 0; slot < 2; slot++) {
                for (let sign = 0; sign < 2; sign++) add(acc, slot * 2 + sign, weight * (joint[((ks * 2 + phi) * 2 + slot) * 2 + sign] as number))
              }
            } else {
              const o6 = pbOutputs(vars[s]?.[s === l ? ci : 0] ?? [], ks, phi, tauT)

              for (let i = 0; i < 6; i++) add(acc, i, weight * (o6[i] as number))
            }
          }
        }
      }

      if (mode === 'BP') {
        const own = stores[t]?.[l === t ? ci : 0] as Float64Array

        acc[4] = own[0] as number
        acc[5] = own[1] as number
      }

      for (let i = 0; i < 6; i++) out[rows[i] as number] = acc[i] as number
    }

    return out
  }

  const matrix = new Float64Array(N * N)

  for (let l = 0; l < 12; l++) {
    // condition indices: 1 + variable * 3 + value index (value order +1, -1, 0)
    for (const variable of [0, 1, 2]) {
      const calm = expected(l, 1 + variable * 3 + 2)

      for (let v = 0; v < 2; v++) {
        const given = expected(l, 1 + variable * 3 + v)
        const column = variable === 2 ? 48 + l * 2 + v : (variable === 0 ? (LINE_FIRSTS[l] as number) : (LINE_SECONDS[l] as number)) * 2 + v

        for (let row = 0; row < N; row++) matrix[row * N + column] = (given[row] as number) - (calm[row] as number)
      }
    }
  }

  return matrix
}

// The sampled matrix of beat t's collision from the full bounce rule on `samples` oriented Kronecker docks (the
// independent second method: code/measure/sparse-living-vacuum's sampler with the collision swapped)
export function sampledBounceLinearization(input: { knit: BounceKnit; background: Background; laws: readonly Law[]; samples: number; t: number }): Float64Array {
  const counts = new Float64Array(36 * 3 * N)
  const totals = new Float64Array(36 * 3)
  const outs = new Int32Array(36)
  const codes = new Int8Array(36)
  const codeOf = (v: number): number => (v === 1 ? 0 : v === -1 ? 1 : 2)

  for (let m = 0; m < input.samples; m++) {
    const dock = orientedKroneckerDock(m, input.background, input.laws)

    for (let d = 0; d < 24; d++) codes[d] = codeOf(dock.vibe[d] as number)
    for (let l = 0; l < 12; l++) codes[24 + l] = codeOf(dock.store[l] as number)

    const after = cloneStoreState(dock)

    bounceCollide(input.knit, after, 0, input.t)

    let k = 0

    for (let d = 0; d < 24; d++) if (after.vibe[d] !== 0) outs[k++] = d * 2 + (after.vibe[d] === 1 ? 0 : 1)
    for (let l = 0; l < 12; l++) if (after.store[l] !== 0) outs[k++] = 48 + l * 2 + (after.store[l] === 1 ? 0 : 1)

    for (let i = 0; i < 36; i++) {
      const c = codes[i] as number
      const base = (i * 3 + c) * N

      add(totals, i * 3 + c, 1)

      for (let j = 0; j < k; j++) add(counts, base + (outs[j] as number), 1)
    }
  }

  const matrix = new Float64Array(N * N)

  for (let i = 0; i < 36; i++) {
    const zero = totals[i * 3 + 2] as number

    for (let v = 0; v < 2; v++) {
      const column = i < 24 ? i * 2 + v : 48 + (i - 24) * 2 + v
      const count = totals[i * 3 + v] as number

      if (count === 0 || zero === 0) continue

      for (let out = 0; out < N; out++) matrix[out * N + column] = (counts[(i * 3 + v) * N + out] as number) / count - (counts[(i * 3 + 2) * N + out] as number) / zero
    }
  }

  return matrix
}
