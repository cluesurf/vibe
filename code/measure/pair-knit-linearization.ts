// The exact linearized collision of the pair-making isometric knit (code/rule/pair-making-knit) at the uniform
// background: every slot fear, calm or love with chance 1/3, every line store -1, 0 or +1 with chance 1/3
// (E-RLT-0065).
//
// The one-body space has 72 indices: the 48 of code/coarse/knit-boltzmann (slot d * 2 + (0 love, 1 fear)) and
// 24 store indices, 48 + l * 2 + (0 for tau = +1, 1 for tau = -1). The streaming phase applies to the first
// 48 only: the store does not stream.
//
// WHY IT IS EXACT. The collision P K P reads the dock through its twelve line momenta n (K) and, line by line,
// through each line's two slots and its store (P). P keeps every line momentum, so K applies the coin map w(n)
// of the input's n, and a coin map carries whole lines to whole lines. Given n the lines and the stores are
// independent, and the output on line m (its two slots and its store) depends on exactly two lines: the line
// l = w^-1(m), whose content (after the first P, with its store) K carries onto m, and m itself, whose store the
// first P has already set. So each output reads the inputs (line l, store l, line m, store m), or (line l, store
// l) alone when w carries l onto itself. The tables of those chains depend only on n_l, n_m and whether w
// reverses l, so they are computed once (24 tables) and added with the weight of n. The derivative convention is
// code/measure/line-momentum-linearization's:
//
//   A[out, (v, a)] = 3 (P(v = a, out) - P(v = calm or 0, out)),  a a held value of input v
//
// and an input outside the output's chain enters only through n (its conditional law given n_L), which the sum
// over n carries exactly. Every weight is a product of 2/9, 5/9 and 1/3 factors: exact to rounding.
//
// A sampled estimate (sampledPairLinearization) over Kronecker dock states runs the collision function itself,
// the independent second method.

import { LINE_FIRSTS, LINE_OF, momentumKey, OPPOSITE, SIDE, type MomentumTable } from '@/code/rule/isometric-knit'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { pairDockCollide, type PairKnit } from '@/code/rule/pair-making-knit'
import { weyl } from '@/code/tool/weyl'

const ROOTS = rootsD4()
export const PAIR_N = 72
const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)

// value codes: 0 love (+1), 1 fear (-1), 2 calm or zero
const valueOf = (code: number): number => (code === 0 ? 1 : code === 1 ? -1 : 0)
const codeOf = (v: number): number => (v === 1 ? 0 : v === -1 ? 1 : 2)

// the line states (first, second) as value codes, and their chance given n_l
function lineStates(n: number): { a: number; b: number; p: number }[] {
  const out: { a: number; b: number; p: number }[] = []

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      if ((a !== 2 ? 1 : 0) - (b !== 2 ? 1 : 0) !== n) continue

      out.push({ a, b, p: n === 0 ? 1 / 5 : 1 / 2 })
    }
  }

  return out
}

// the pair move on one line: [first, second, store] values in, out
function move(x: number, y: number, tau: number, on: boolean): [number, number, number] {
  if (!on) return [x, y, tau]

  if (tau === 0) return x !== 0 && y === -x ? [0, 0, x] : [x, y, 0]

  return x === 0 && y === 0 ? [tau, -tau, 0] : [x, y, tau]
}

// A chain table: per local output (0 first love, 1 first fear, 2 second love, 3 second fear of line m, 4 store
// plus, 5 store minus of m) its chance, and its joint chance with each input at each value code. Inputs: 0, 1
// the first and second slot of l, 2 the store of l, 3, 4 the slots of m, 5 the store of m (3 to 5 absent when
// l = m)
type ChainTable = { readonly chance: Float64Array; readonly joint: Float64Array; readonly inputs: number }

function chainTable(input: { nl: number; nm: number; flip: boolean; self: boolean; pairs: boolean }): ChainTable {
  const { nl, nm, flip, self, pairs } = input
  const inputs = self ? 3 : 6
  const chance = new Float64Array(6)
  const joint = new Float64Array(6 * 6 * 3)
  const mStates = self ? [{ a: 2, b: 2, p: 1 }] : lineStates(nm)
  const mStores = self ? [2] : [0, 1, 2]

  for (const l of lineStates(nl)) {
    for (let tl = 0; tl < 3; tl++) {
      for (const m of mStates) {
        for (const tm of mStores) {
          const weight = (l.p / 3) * (self ? 1 : m.p / 3)
          // the first P on l, and on m
          const [x1, y1, sl] = move(valueOf(l.a), valueOf(l.b), valueOf(tl), pairs)
          const sm = self ? sl : move(valueOf(m.a), valueOf(m.b), valueOf(tm), pairs)[2]
          // K carries l onto m
          const x = flip ? y1 : x1
          const y = flip ? x1 : y1
          // the second P on m
          const [first, second, tau] = move(x, y, sm, pairs)
          const outs: number[] = []

          if (first !== 0) outs.push(first === 1 ? 0 : 1)
          if (second !== 0) outs.push(second === 1 ? 2 : 3)
          if (tau !== 0) outs.push(tau === 1 ? 4 : 5)

          const codes = [l.a, l.b, tl, m.a, m.b, tm]

          for (const o of outs) {
            chance[o] = (chance[o] as number) + weight

            for (let v = 0; v < inputs; v++) {
              const index = (o * 6 + v) * 3 + (codes[v] as number)

              joint[index] = (joint[index] as number) + weight
            }
          }
        }
      }
    }
  }

  return { chance, joint, inputs }
}

export type PairLinearization = { readonly matrix: Float64Array; readonly acting: number }

// the chance of each value code of a slot on a line in state n: [love, fear, calm]
function slotLaw(n: number, side: number): [number, number, number] {
  if (n === 0) return [2 / 5, 2 / 5, 1 / 5]

  const held = (n === 1) === (side === 1)

  return held ? [1 / 2, 1 / 2, 0] : [0, 0, 1]
}

export function pairLinearization(input: { table: MomentumTable; pairs?: boolean }): PairLinearization {
  const pairs = input.pairs ?? true
  const N = PAIR_N
  const tables = new Map<string, ChainTable>()

  for (const nl of [-1, 0, 1]) {
    for (const flip of [false, true]) {
      tables.set(`${nl},self,${flip}`, chainTable({ nl, nm: 0, flip, self: true, pairs }))

      for (const nm of [-1, 0, 1]) tables.set(`${nl},${nm},${flip}`, chainTable({ nl, nm, flip, self: false, pairs }))
    }
  }

  // G[o][L][v]: sum over n of weight * chance(o | n) with n_L = v (index v + 1)
  const g = new Float64Array(N * 12 * 3)
  // corrections on the chain's own slot inputs: weight * (joint - chance * law), per value code
  const correction = new Float64Array(N * N)
  const correctionCalm = new Float64Array(N * N)
  // the store columns, whole: weight * 3 * (joint(value) - joint(zero))
  const storeColumns = new Float64Array(N * N)
  const n = new Int8Array(12)
  const lineImage = new Int32Array(12)
  const lineFlip = new Uint8Array(12)
  const outChance = new Float64Array(N)
  let acting = 0

  for (let code = 0; code < 3 ** 12; code++) {
    let rest = code
    let weight = 1
    const p = [0, 0, 0, 0]

    for (let l = 0; l < 12; l++) {
      const value = (rest % 3) - 1
      const r = ROOTS[LINE_FIRSTS[l] as number] as number[]

      rest = Math.floor(rest / 3)
      n[l] = value
      weight *= value === 0 ? 5 / 9 : 2 / 9

      if (value !== 0) for (let k = 0; k < 4; k++) p[k] = (p[k] as number) + value * (r[k] as number)
    }

    const w = input.table[momentumKey(p)]

    if (w && w.some((e, d) => e !== d)) acting += weight

    for (let l = 0; l < 12; l++) {
      const e = w ? (w[LINE_FIRSTS[l] as number] as number) : (LINE_FIRSTS[l] as number)

      lineImage[l] = LINE_OF[e] as number
      lineFlip[l] = SIDE[e] === -1 ? 1 : 0
    }

    outChance.fill(0)

    for (let l = 0; l < 12; l++) {
      const m = lineImage[l] as number
      const self = m === l
      const table = tables.get(self ? `${n[l]},self,${lineFlip[l] === 1}` : `${n[l]},${n[m]},${lineFlip[l] === 1}`) as ChainTable
      const fm = LINE_FIRSTS[m] as number
      const sm = LINE_SECONDS[m] as number
      const globalOut = [fm * 2, fm * 2 + 1, sm * 2, sm * 2 + 1, 48 + m * 2, 48 + m * 2 + 1]
      // the slot inputs: [input index, slot, law]; the store inputs: [input index, line]
      const slots: [number, number, [number, number, number]][] = [
        [0, LINE_FIRSTS[l] as number, slotLaw(n[l] as number, 1)],
        [1, LINE_SECONDS[l] as number, slotLaw(n[l] as number, -1)],
      ]
      const stores: [number, number][] = [[2, l]]

      if (!self) {
        slots.push([3, fm, slotLaw(n[m] as number, 1)], [4, sm, slotLaw(n[m] as number, -1)])
        stores.push([5, m])
      }

      for (let o = 0; o < 6; o++) {
        const out = globalOut[o] as number
        const c = table.chance[o] as number

        outChance[out] = c

        if (c === 0) continue

        for (const [index, slot, law] of slots) {
          for (let v = 0; v < 2; v++) {
            const j = table.joint[(o * 6 + index) * 3 + v] as number

            correction[out * N + slot * 2 + v] = (correction[out * N + slot * 2 + v] as number) + weight * (j - c * (law[v] as number))
          }

          const jc = table.joint[(o * 6 + index) * 3 + 2] as number

          correctionCalm[out * N + slot * 2] = (correctionCalm[out * N + slot * 2] as number) + weight * (jc - c * law[2])
        }

        for (const [index, line] of stores) {
          const j0 = table.joint[(o * 6 + index) * 3 + 2] as number

          for (let v = 0; v < 2; v++) {
            const j = table.joint[(o * 6 + index) * 3 + v] as number
            const column = 48 + line * 2 + v

            storeColumns[out * N + column] = (storeColumns[out * N + column] as number) + weight * 3 * (j - j0)
          }
        }
      }
    }

    for (let out = 0; out < N; out++) {
      const c = outChance[out] as number

      if (c === 0) continue

      for (let L = 0; L < 12; L++) {
        const index = (out * 12 + L) * 3 + ((n[L] as number) + 1)

        g[index] = (g[index] as number) + weight * c
      }
    }
  }

  const matrix = new Float64Array(N * N)

  for (let out = 0; out < N; out++) {
    for (let d = 0; d < 24; d++) {
      const L = LINE_OF[d] as number
      const side = SIDE[d] as number

      for (let a = 0; a < 2; a++) {
        let value = 0

        for (let v = -1; v <= 1; v++) {
          const law = slotLaw(v, side)

          value += (g[(out * 12 + L) * 3 + (v + 1)] as number) * ((law[a] as number) - law[2])
        }

        value += (correction[out * N + d * 2 + a] as number) - (correctionCalm[out * N + d * 2] as number)
        matrix[out * N + d * 2 + a] = 3 * value
      }
    }

    for (let c = 48; c < N; c++) matrix[out * N + c] = storeColumns[out * N + c] as number
  }

  return { matrix, acting }
}

const SLOT_PRIMES = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
]
const RATES = SLOT_PRIMES.map(q => Math.sqrt(q) - Math.floor(Math.sqrt(q)))

// the m-th Kronecker dock with its store: 24 slots and 12 store trits, each by thirds of its own Weyl orbit
// (frac(sqrt q) for the first 36 primes, independent over the rationals by Besicovitch), never a draw
export function kroneckerPairDock(m: number): { vibe: Int8Array; store: Int8Array } {
  const trit = (k: number): number => {
    const u = weyl(m + 1, RATES[k] as number)

    return u < 1 / 3 ? -1 : u < 2 / 3 ? 0 : 1
  }

  return { vibe: Int8Array.from({ length: 24 }, (_, d) => trit(d)), store: Int8Array.from({ length: 12 }, (_, l) => trit(24 + l)) }
}

// A sampled estimate of the same matrix from the collision function: `samples` Kronecker docks, joint frequencies
export function sampledPairLinearization(input: { knit: PairKnit; samples: number }): Float64Array {
  const N = PAIR_N
  // counts[(input * 3 + value code) * N + out]; inputs 0..23 slots, 24..35 stores
  const counts = new Float64Array(36 * 3 * N)
  const outs = new Int32Array(36)
  const before = new Int8Array(36)

  for (let m = 0; m < input.samples; m++) {
    const dock = kroneckerPairDock(m)

    before.set(dock.vibe, 0)
    before.set(dock.store, 24)
    pairDockCollide(input.knit, dock, 0)

    let k = 0

    for (let d = 0; d < 24; d++) if (dock.vibe[d] !== 0) outs[k++] = d * 2 + (dock.vibe[d] === 1 ? 0 : 1)
    for (let l = 0; l < 12; l++) if (dock.store[l] !== 0) outs[k++] = 48 + l * 2 + (dock.store[l] === 1 ? 0 : 1)

    for (let i = 0; i < 36; i++) {
      const base = (i * 3 + codeOf(before[i] as number)) * N

      for (let j = 0; j < k; j++) counts[base + (outs[j] as number)] = (counts[base + (outs[j] as number)] as number) + 1
    }
  }

  const matrix = new Float64Array(N * N)

  for (let i = 0; i < 36; i++) {
    for (let v = 0; v < 2; v++) {
      const column = i < 24 ? i * 2 + v : 48 + (i - 24) * 2 + v

      for (let out = 0; out < N; out++) {
        const joint = (counts[(i * 3 + v) * N + out] as number) / input.samples
        const calm = (counts[(i * 3 + 2) * N + out] as number) / input.samples

        matrix[out * N + column] = 3 * (joint - calm)
      }
    }
  }

  return matrix
}

// the permutation of the 72 indices a coin map g induces (slots permuted, store lines permuted with their sign)
export function pairIndexPermutation(g: readonly number[]): Int32Array {
  const out = new Int32Array(PAIR_N)

  for (let d = 0; d < 24; d++) {
    out[d * 2] = (g[d] as number) * 2
    out[d * 2 + 1] = (g[d] as number) * 2 + 1
  }

  for (let l = 0; l < 12; l++) {
    const image = g[LINE_FIRSTS[l] as number] as number
    const m = LINE_OF[image] as number
    const flip = SIDE[image] === -1

    out[48 + l * 2] = 48 + m * 2 + (flip ? 1 : 0)
    out[48 + l * 2 + 1] = 48 + m * 2 + (flip ? 0 : 1)
  }

  return out
}

// the largest change of a 72 x 72 matrix under conjugation by the given coin maps
export function pairEquivarianceDefect(matrix: Float64Array, permutations: readonly (readonly number[])[]): number {
  const N = PAIR_N
  let worst = 0

  for (const g of permutations) {
    const p = pairIndexPermutation(g)

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        worst = Math.max(worst, Math.abs((matrix[(p[r] as number) * N + (p[c] as number)] as number) - (matrix[r * N + c] as number)))
      }
    }
  }

  return worst
}
