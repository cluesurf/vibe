// The exact linearized collisions of the living-pair knit (code/rule/living-pair-knit): the two collisions K P (P
// first, even beats) and P K (K first, odd beats), each on the 72-index singlet at a product background, for
// E-RLT-0075's husk transport. It is code/measure/token-store-linearization's chain construction with the order of the
// pieces a parameter ('PKP' reproduces that file's matrix, the X check).
//
// WHY THE CHAIN STILL CLOSES. K reads the dock through its twelve line momenta n, and P keeps every n_l (a pair and a
// calm line both read 0), so K reads the same n before or after P. The output on line m then depends only on the line
// l = w^-1(m) that K carries onto m and on m's own store: with P first, on l's slots, store and point equality after P
// on l, and m's store after P on m; with K first, on l's slots and point equality, carried onto m, and m's store as it
// was, which the P after K reads. Everything else enters only through n, which the sum over its 3^12 values carries
// exactly. The derivative formulas are the file's, unchanged.
//
// The two-beat period map is S(k) A_KP then S(k) A_PK (code/measure/store-transport's periodMap with the matrices in
// beat order), and the Boltzmann closure between beats is E-RLT-0065's.

import { LINE_FIRSTS, LINE_OF, momentumKey, OPPOSITE, SIDE, type MomentumTable } from '@/code/rule/isometric-knit'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { cloneStoreState } from '@/code/rule/token-store-knit'
import { livingCollide, type LivingKnit } from '@/code/rule/living-pair-knit'
import { kroneckerStoreDock, STORE_N, type Background } from '@/code/measure/token-store-linearization'

const ROOTS = rootsD4()
const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)

export type CollisionMode = 'PKP' | 'PK' | 'KP'

const valueOf = (code: number): number => (code === 0 ? 1 : code === 1 ? -1 : 0)

function slotChance(bg: Background, code: number): number {
  return code === 2 ? 1 - bg.rho : bg.rho / 2
}

function lineChance(bg: Background, n: number): number {
  return n === 0 ? bg.rho * bg.rho + (1 - bg.rho) * (1 - bg.rho) : bg.rho * (1 - bg.rho)
}

function lineStates(bg: Background, n: number): { a: number; b: number; p: number }[] {
  const out: { a: number; b: number; p: number }[] = []
  const total = lineChance(bg, n)

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      if ((a !== 2 ? 1 : 0) - (b !== 2 ? 1 : 0) !== n) continue

      out.push({ a, b, p: (slotChance(bg, a) * slotChance(bg, b)) / total })
    }
  }

  return out
}

function slotLaw(bg: Background, n: number, side: number): [number, number, number] {
  if (n === 0) {
    const both = (bg.rho * bg.rho) / lineChance(bg, 0)

    return [both / 2, both / 2, 1 - both]
  }

  const held = (n === 1) === (side === 1)

  return held ? [1 / 2, 1 / 2, 0] : [0, 0, 1]
}

function move(x: number, y: number, tau: number, same: boolean): [number, number, number, boolean] {
  if (tau === 0) return x !== 0 && y === -x && same ? [0, 0, x, true] : [x, y, 0, same]

  return x === 0 && y === 0 ? [tau, -tau, 0, true] : [x, y, tau, same]
}

type ChainTable = { readonly chance: Float64Array; readonly joint: Float64Array; readonly given: Float64Array }

function chainTable(bg: Background, mode: CollisionMode, input: { nl: number; nm: number; flip: boolean; self: boolean }): ChainTable {
  const { nl, nm, flip, self } = input
  const chance = new Float64Array(6)
  const joint = new Float64Array(6 * 6 * 3)
  const given = new Float64Array(6 * 2 * 3)
  const mStates = self ? [{ a: 2, b: 2, p: 1 }] : lineStates(bg, nm)
  const mStores = self ? [2] : [0, 1, 2]
  const sameChances: [boolean, number][] = [
    [true, bg.equal],
    [false, 1 - bg.equal],
  ]
  const pFirst = mode !== 'KP'
  const pSecond = mode !== 'PK'

  for (const l of lineStates(bg, nl)) {
    for (let tl = 0; tl < 3; tl++) {
      const pl = bg.store[tl] as number

      for (const [sl, ql] of sameChances) {
        for (const m of mStates) {
          for (const tm of mStores) {
            const pm = self ? 1 : (bg.store[tm] as number)

            for (const [sm, qm] of self ? ([[true, 1]] as [boolean, number][]) : sameChances) {
              const rest = l.p * ql * (self ? 1 : m.p * qm)

              if (rest === 0) continue

              // the first P on l and on m, when P acts first
              const [x1, y1, stl, same1] = pFirst ? move(valueOf(l.a), valueOf(l.b), valueOf(tl), sl) : [valueOf(l.a), valueOf(l.b), valueOf(tl), sl]
              const stm = self ? stl : pFirst ? move(valueOf(m.a), valueOf(m.b), valueOf(tm), sm)[2] : valueOf(tm)
              // K carries l onto m
              const x = flip ? y1 : x1
              const y = flip ? x1 : y1
              // the second P on m, when P acts after K
              const [first, second, tau] = pSecond ? move(x, y, stm, same1) : [x, y, stm]
              const outs: number[] = []

              if (first !== 0) outs.push(first === 1 ? 0 : 1)
              if (second !== 0) outs.push(second === 1 ? 2 : 3)
              if (tau !== 0) outs.push(tau === 1 ? 4 : 5)

              const codes = [l.a, l.b, tl, m.a, m.b, tm]
              const weight = rest * pl * pm

              for (const o of outs) {
                chance[o] = (chance[o] as number) + weight

                for (let v = 0; v < (self ? 3 : 6); v++) {
                  const index = (o * 6 + v) * 3 + (codes[v] as number)

                  joint[index] = (joint[index] as number) + weight
                }

                given[(o * 2 + 0) * 3 + tl] = (given[(o * 2 + 0) * 3 + tl] as number) + rest * pm

                if (!self) given[(o * 2 + 1) * 3 + tm] = (given[(o * 2 + 1) * 3 + tm] as number) + rest * pl
              }
            }
          }
        }
      }
    }
  }

  return { chance, joint, given }
}

// the exact 72-index singlet linearization of one collision at the background
export function livingLinearization(input: { table: MomentumTable; background: Background; mode: CollisionMode }): Float64Array {
  const bg = input.background
  const N = STORE_N
  const tables = new Map<number, ChainTable>()
  const tableKey = (nl: number, nm: number, flip: boolean, self: boolean): number => ((nl + 1) * 3 + (nm + 1)) * 4 + (flip ? 1 : 0) * 2 + (self ? 1 : 0)

  for (const nl of [-1, 0, 1]) {
    for (const flip of [false, true]) {
      tables.set(tableKey(nl, 0, flip, true), chainTable(bg, input.mode, { nl, nm: 0, flip, self: true }))

      for (const nm of [-1, 0, 1]) tables.set(tableKey(nl, nm, flip, false), chainTable(bg, input.mode, { nl, nm, flip, self: false }))
    }
  }

  const pa = [slotChance(bg, 0), slotChance(bg, 1), slotChance(bg, 2)]
  const lawCache = [-1, 0, 1].map(v => [slotLaw(bg, v, 1), slotLaw(bg, v, -1)])
  const lawOf = (v: number, side: number): [number, number, number] => lawCache[v + 1]?.[side === 1 ? 0 : 1] as [number, number, number]
  const nChance = [lineChance(bg, -1), lineChance(bg, 0), lineChance(bg, 1)]
  const g = new Float64Array(N * 12 * 3)
  const correction = new Float64Array(N * N)
  const correctionCalm = new Float64Array(N * N)
  const storeColumns = new Float64Array(N * N)
  const n = new Int8Array(12)
  const lineImage = new Int32Array(12)
  const lineFlip = new Uint8Array(12)
  const outChance = new Float64Array(N)

  for (let code = 0; code < 3 ** 12; code++) {
    let rest = code
    let weight = 1
    let p0 = 0
    let p1 = 0
    let p2 = 0
    let p3 = 0

    for (let l = 0; l < 12; l++) {
      const value = (rest % 3) - 1
      const r = ROOTS[LINE_FIRSTS[l] as number] as number[]

      rest = Math.floor(rest / 3)
      n[l] = value
      weight *= nChance[value + 1] as number

      if (value !== 0) {
        p0 += value * (r[0] as number)
        p1 += value * (r[1] as number)
        p2 += value * (r[2] as number)
        p3 += value * (r[3] as number)
      }
    }

    if (weight === 0) continue

    const w = input.table[momentumKey([p0, p1, p2, p3])]

    for (let l = 0; l < 12; l++) {
      const e = w ? (w[LINE_FIRSTS[l] as number] as number) : (LINE_FIRSTS[l] as number)

      lineImage[l] = LINE_OF[e] as number
      lineFlip[l] = SIDE[e] === -1 ? 1 : 0
    }

    outChance.fill(0)

    for (let l = 0; l < 12; l++) {
      const m = lineImage[l] as number
      const self = m === l
      const table = tables.get(tableKey(n[l] as number, self ? 0 : (n[m] as number), lineFlip[l] === 1, self)) as ChainTable
      const fm = LINE_FIRSTS[m] as number
      const sm = LINE_SECONDS[m] as number
      const globalOut = [fm * 2, fm * 2 + 1, sm * 2, sm * 2 + 1, 48 + m * 2, 48 + m * 2 + 1]
      const slots: [number, number, [number, number, number]][] = [
        [0, LINE_FIRSTS[l] as number, lawOf(n[l] as number, 1)],
        [1, LINE_SECONDS[l] as number, lawOf(n[l] as number, -1)],
      ]
      const stores: [number, number][] = [[0, l]]

      if (!self) {
        slots.push([3, fm, lawOf(n[m] as number, 1)], [4, sm, lawOf(n[m] as number, -1)])
        stores.push([1, m])
      }

      for (let o = 0; o < 6; o++) {
        const out = globalOut[o] as number
        const c = table.chance[o] as number

        outChance[out] = c

        for (const [index, slot, law] of slots) {
          for (let v = 0; v < 2; v++) {
            const j = table.joint[(o * 6 + index) * 3 + v] as number

            correction[out * N + slot * 2 + v] = (correction[out * N + slot * 2 + v] as number) + (weight * (j - c * (law[v] as number))) / (pa[v] as number)
          }

          const jc = table.joint[(o * 6 + index) * 3 + 2] as number

          correctionCalm[out * N + slot * 2] = (correctionCalm[out * N + slot * 2] as number) + (weight * (jc - c * law[2])) / (pa[2] as number)
        }

        for (const [s, line] of stores) {
          const zero = table.given[(o * 2 + s) * 3 + 2] as number

          for (let v = 0; v < 2; v++) {
            const column = 48 + line * 2 + v

            storeColumns[out * N + column] = (storeColumns[out * N + column] as number) + weight * ((table.given[(o * 2 + s) * 3 + v] as number) - zero)
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
          const law = lawOf(v, side)

          value += (g[(out * 12 + L) * 3 + (v + 1)] as number) * ((law[a] as number) / (pa[a] as number) - law[2] / (pa[2] as number))
        }

        value += (correction[out * N + d * 2 + a] as number) - (correctionCalm[out * N + d * 2] as number)
        matrix[out * N + d * 2 + a] = value
      }
    }

    for (let c = 48; c < N; c++) matrix[out * N + c] = storeColumns[out * N + c] as number
  }

  return matrix
}

// the sampled singlet matrix of beat t's collision from the full rule (tokens, places, points), `samples` Kronecker
// docks
export function sampledLivingLinearization(input: { knit: LivingKnit; background: Background; samples: number; t: number }): Float64Array {
  const N = STORE_N
  const bg = input.background
  const counts = new Float64Array(36 * 3 * N)
  const totals = new Float64Array(36 * 3)
  const outs = new Int32Array(36)
  const codes = new Int8Array(36)
  const codeOf = (v: number): number => (v === 1 ? 0 : v === -1 ? 1 : 2)

  for (let m = 0; m < input.samples; m++) {
    const dock = kroneckerStoreDock(m, bg)

    for (let d = 0; d < 24; d++) codes[d] = codeOf(dock.vibe[d] as number)
    for (let l = 0; l < 12; l++) codes[24 + l] = codeOf(dock.store[l] as number)

    const after = cloneStoreState(dock)

    livingCollide(input.knit, after, 0, input.t)

    let k = 0

    for (let d = 0; d < 24; d++) if (after.vibe[d] !== 0) outs[k++] = d * 2 + (after.vibe[d] === 1 ? 0 : 1)
    for (let l = 0; l < 12; l++) if (after.store[l] !== 0) outs[k++] = 48 + l * 2 + (after.store[l] === 1 ? 0 : 1)

    for (let i = 0; i < 36; i++) {
      const c = codes[i] as number
      const base = (i * 3 + c) * N

      totals[i * 3 + c] = (totals[i * 3 + c] as number) + 1

      for (let j = 0; j < k; j++) counts[base + (outs[j] as number)] = (counts[base + (outs[j] as number)] as number) + 1
    }
  }

  const matrix = new Float64Array(N * N)

  for (let i = 0; i < 36; i++) {
    const zero = totals[i * 3 + 2] as number

    for (let v = 0; v < 2; v++) {
      const column = i < 24 ? i * 2 + v : 48 + (i - 24) * 2 + v
      const count = totals[i * 3 + v] as number

      if (count === 0 || zero === 0) continue

      for (let out = 0; out < N; out++) {
        matrix[out * N + column] = (counts[(i * 3 + v) * N + out] as number) / count - (counts[(i * 3 + 2) * N + out] as number) / zero
      }
    }
  }

  return matrix
}
