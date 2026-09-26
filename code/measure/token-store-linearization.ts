// The exact linearized collision of the candidate knit (code/rule/token-store-knit, 'returned-neutral': the pair-
// making isometric knit with the store that returns the unmade pair's tokens and the neutral veto) at any product
// background: every slot held with chance rho (love and fear rho / 2 each), every line store +1, -1, 0 with given
// chances, every held token's point uniform and independent (E-RLT-0071, E-RLT-0072).
//
// THE STORE PLACES, and the reduction to 72 indices. With the points, the one-body space is 648 indices: a slot's
// love or fear at each of 9 points (432) and a line's stored unit of either orientation at each of 9 points (216;
// the unit's two tokens share a point, since the veto made them equal and the places never stream). The collision
// reads a point only through the veto, which asks whether two points are EQUAL, so its linearization commutes with
// every permutation of the 9 points, and so does streaming (a link moves points by a grid move, a permutation).
// The 648-index space is then the 72-index singlet (every point alike) plus eight copies of a 72-index color block,
// and the singlet evolves on its own for ANY link field. Charge, energy and momentum, and so every husk scalar, live
// in the singlet. Its matrix is the linearization of the pair-making knit with each unmake allowed only where the two
// held tokens' points agree, which for independent uniform points has chance 1/9, and with a pair made from the
// store always allowed (its two tokens share the stored point). The color block (the nine color densities, which
// flat links conserve one by one) is not built here.
//
// WHY IT IS EXACT: code/measure/pair-knit-linearization's chain argument, unchanged. K reads the dock through its
// twelve line momenta n; given n the lines, stores and points are independent; the output on line m depends on the
// line l = w^-1(m) that K carries onto m (its two slots, its store and whether its two tokens share a point) and on
// m's own store after the first P (which reads m's slots, store and point equality). Everything else enters only
// through n, which the sum over its 3^12 values carries exactly. The derivative is the conditional difference
//   A[out, (i, a)] = E[out | i = a] - E[out | i = calm]   (a slot),   E[out | tau = a] - E[out | tau = 0]   (a store),
// with the calm or zero value absorbing the change, which reduces to code/measure/pair-knit-linearization's formula
// at its uniform background (the X1 check of E-RLT-0071). A store conditional is computed with the store fixed, never
// divided by its chance, so a background with every store at +1 is allowed (E-RLT-0072).
//
// A sampled estimate from the collision function itself (the full token-store rule with tokens, places and points
// from Weyl sequences) is the independent second method.

import { LINE_FIRSTS, LINE_OF, momentumKey, OPPOSITE, SIDE, type MomentumTable } from '@/code/rule/isometric-knit'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { cloneStoreState, storeDockCollide, type StoreVariant, type TokenStoreKnit, type TokenStoreState } from '@/code/rule/token-store-knit'
import { pairIndexPermutation } from '@/code/measure/pair-knit-linearization'
import { weyl } from '@/code/tool/weyl'
import { complexEigenvalues, complexEigenvector } from '@/code/algebra/linear/complex-eigen'
import { periodMap, type Space } from '@/code/measure/store-transport'

const ROOTS = rootsD4()
export const STORE_N = 72
const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)

// value codes: 0 love / store +1, 1 fear / store -1, 2 calm / store 0
const valueOf = (code: number): number => (code === 0 ? 1 : code === 1 ? -1 : 0)

export type Background = {
  // the chance a slot is held
  readonly rho: number
  // the chances of a store +1, -1, 0
  readonly store: readonly [number, number, number]
  // the chance two held tokens share a point (1/9 for the candidate's singlet, 1 without the veto)
  readonly equal: number
}

export const UNIFORM: Background = { rho: 2 / 3, store: [1 / 3, 1 / 3, 1 / 3], equal: 1 / 9 }

function slotChance(bg: Background, code: number): number {
  return code === 2 ? 1 - bg.rho : bg.rho / 2
}

function lineChance(bg: Background, n: number): number {
  return n === 0 ? bg.rho * bg.rho + (1 - bg.rho) * (1 - bg.rho) : bg.rho * (1 - bg.rho)
}

// the line states (first, second) as value codes, and their chance given n_l
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

// the chance of each value code of a slot on a side of a line in state n: [love, fear, calm]
function slotLaw(bg: Background, n: number, side: number): [number, number, number] {
  if (n === 0) {
    const both = (bg.rho * bg.rho) / lineChance(bg, 0)

    return [both / 2, both / 2, 1 - both]
  }

  const held = (n === 1) === (side === 1)

  return held ? [1 / 2, 1 / 2, 0] : [0, 0, 1]
}

// the pair move on one line with the neutral veto: [first, second, store, whether its two tokens share a point]
function move(x: number, y: number, tau: number, same: boolean, on: boolean): [number, number, number, boolean] {
  if (!on) return [x, y, tau, same]

  if (tau === 0) return x !== 0 && y === -x && same ? [0, 0, x, true] : [x, y, 0, same]

  // a pair made from the store: its two tokens hold the stored unit's one point
  return x === 0 && y === 0 ? [tau, -tau, 0, true] : [x, y, tau, same]
}

// A chain table. chance[o]: the output's chance; joint[(o * 6 + v) * 3 + code]: its joint chance with input v at a
// value code (slot inputs 0, 1 of line l and 3, 4 of line m; store inputs 2 of l and 5 of m); given[(o * 2 + s) * 3 +
// code]: its chance with store input s (0 for l, 1 for m) FIXED at the code (the store's own chance left out)
type ChainTable = { readonly chance: Float64Array; readonly joint: Float64Array; readonly given: Float64Array; readonly self: boolean }

function chainTable(bg: Background, input: { nl: number; nm: number; flip: boolean; self: boolean; pairs: boolean }): ChainTable {
  const { nl, nm, flip, self, pairs } = input
  const chance = new Float64Array(6)
  const joint = new Float64Array(6 * 6 * 3)
  const given = new Float64Array(6 * 2 * 3)
  const mStates = self ? [{ a: 2, b: 2, p: 1 }] : lineStates(bg, nm)
  const mStores = self ? [2] : [0, 1, 2]
  const sameChances: [boolean, number][] = [
    [true, bg.equal],
    [false, 1 - bg.equal],
  ]

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

              // the first P on l, and on m
              const [x1, y1, stl, same1] = move(valueOf(l.a), valueOf(l.b), valueOf(tl), sl, pairs)
              const stm = self ? stl : move(valueOf(m.a), valueOf(m.b), valueOf(tm), sm, pairs)[2]
              // K carries l onto m
              const x = flip ? y1 : x1
              const y = flip ? x1 : y1
              // the second P on m
              const [first, second, tau] = move(x, y, stm, same1, pairs)
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

  return { chance, joint, given, self }
}

// The exact 72-index singlet linearization at the background (pairs false: the isometric knit with an idle store)
export function storeLinearization(input: { table: MomentumTable; background: Background; pairs?: boolean }): Float64Array {
  const bg = input.background
  const pairs = input.pairs ?? true
  const N = STORE_N
  const tables = new Map<number, ChainTable>()
  const tableKey = (nl: number, nm: number, flip: boolean, self: boolean): number => ((nl + 1) * 3 + (nm + 1)) * 4 + (flip ? 1 : 0) * 2 + (self ? 1 : 0)

  for (const nl of [-1, 0, 1]) {
    for (const flip of [false, true]) {
      tables.set(tableKey(nl, 0, flip, true), chainTable(bg, { nl, nm: 0, flip, self: true, pairs }))

      for (const nm of [-1, 0, 1]) tables.set(tableKey(nl, nm, flip, false), chainTable(bg, { nl, nm, flip, self: false, pairs }))
    }
  }

  const pa = [slotChance(bg, 0), slotChance(bg, 1), slotChance(bg, 2)]
  const lawCache = [-1, 0, 1].map(v => [slotLaw(bg, v, 1), slotLaw(bg, v, -1)])
  const lawOf = (v: number, side: number): [number, number, number] => lawCache[v + 1]?.[side === 1 ? 0 : 1] as [number, number, number]
  const nChance = [lineChance(bg, -1), lineChance(bg, 0), lineChance(bg, 1)]
  // g[(out * 12 + L) * 3 + (n_L + 1)]: sum over n of weight * chance(out | n)
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

// ---- the sampled estimate, from the full collision ----

function primes(count: number): number[] {
  const out: number[] = []

  for (let p = 2; out.length < count; p++) if (out.every(q => p % q !== 0)) out.push(p)

  return out
}

const RATES = primes(72).map(q => Math.sqrt(q) - Math.floor(Math.sqrt(q)))

// the m-th Kronecker dock at the background: vibes, stores and points, each by its own Weyl orbit (frac(sqrt q) for
// the first 72 primes), never a draw. Tokens 0..23 on the slots, 24..47 in the places; a stored unit's two tokens
// share a point
export function kroneckerStoreDock(m: number, bg: Background): TokenStoreState {
  const vibe = new Int8Array(24)
  const store = new Int8Array(12)
  const point = new Int8Array(48)
  const u = (k: number): number => weyl(m + 1, RATES[k] as number)

  for (let d = 0; d < 24; d++) {
    const x = u(d)

    vibe[d] = x < bg.rho / 2 ? 1 : x < bg.rho ? -1 : 0
    point[d] = Math.floor(u(36 + d) * 9) % 9
  }

  for (let l = 0; l < 12; l++) {
    const x = u(24 + l)

    store[l] = x < bg.store[0] ? 1 : x < bg.store[0] + bg.store[1] ? -1 : 0

    const p = Math.floor(u(60 + l) * 9) % 9

    point[24 + 2 * l] = p
    point[24 + 2 * l + 1] = p
  }

  return {
    vibe,
    store,
    token: Int32Array.from({ length: 24 }, (_, i) => i),
    place: Int32Array.from({ length: 24 }, (_, i) => 24 + i),
    point,
    label: new Int8Array(48),
  }
}

// the sampled singlet matrix: conditional output frequencies from `samples` Kronecker docks run through the full
// collision (storeDockCollide with the knit's variant), every point summed
export function sampledStoreLinearization(input: { knit: TokenStoreKnit; background: Background; samples: number }): Float64Array {
  const N = STORE_N
  const bg = input.background
  // counts[(input * 3 + code) * N + out] and totals[input * 3 + code]; inputs 0..23 slots, 24..35 stores
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

    storeDockCollide(input.knit, after, 0)

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

// ---- symmetry ----

// the W(F4) average of a 72 x 72 matrix (P_g A P_g^-1 over the coin maps), and the largest entry of what is left, in
// the vibe rows (0..47) and the store rows (48..71) separately, and by block (vibe or store row, vibe or store column)
export function anisotropicPart(
  matrix: Float64Array,
  permutations: readonly (readonly number[])[],
): { vibeRows: number; storeRows: number; blocks: { vv: number; vs: number; sv: number; ss: number }; average: Float64Array } {
  const N = STORE_N
  const average = new Float64Array(N * N)

  for (const g of permutations) {
    const p = pairIndexPermutation(g)

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const index = (p[r] as number) * N + (p[c] as number)

        average[index] = (average[index] as number) + (matrix[r * N + c] as number)
      }
    }
  }

  for (let i = 0; i < N * N; i++) average[i] = (average[i] as number) / permutations.length

  let vibeRows = 0
  let storeRows = 0
  const blocks = { vv: 0, vs: 0, sv: 0, ss: 0 }

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const d = Math.abs((matrix[r * N + c] as number) - (average[r * N + c] as number))

      if (r < 48) vibeRows = Math.max(vibeRows, d)
      else storeRows = Math.max(storeRows, d)

      if (r < 48 && c < 48) blocks.vv = Math.max(blocks.vv, d)
      else if (r < 48) blocks.vs = Math.max(blocks.vs, d)
      else if (c < 48) blocks.sv = Math.max(blocks.sv, d)
      else blocks.ss = Math.max(blocks.ss, d)
    }
  }

  return { vibeRows, storeRows, blocks, average }
}

// ---- hydrodynamic modes picked by their overlap with the invariants ----

export const STORE_SPACE: Space = { n: STORE_N, roots: Array.from({ length: STORE_N }, (_, i) => (i < 48 ? ROOTS[i >> 1] : undefined)) }

export type HydroMode = { readonly gamma: number; readonly omega: number; readonly overlap: number; readonly family: string; readonly share: number }

// The `count` eigenmodes of the period map whose right eigenvectors lie most in the span of the left invariants
// (orthonormal). At k = 0 a mode with eigenvalue not 1 is orthogonal to every left invariant (l M = l gives
// (1 - lambda) l x = 0), so at small k the overlap picks the hydrodynamic modes even when a flat band of store modes
// sits nearer the unit circle, which is what the oriented background has (E-RLT-0069). Families as store-transport's.
export function hydroModes(input: {
  matrices: readonly Float64Array[]
  wave: readonly number[]
  invariants: readonly Float64Array[]
  families: Record<string, Float64Array[]>
  count: number
}): HydroMode[] {
  const N = STORE_N
  const period = input.matrices.length
  const map = periodMap(STORE_SPACE, input.matrices, input.wave)
  const ev = complexEigenvalues({ re: map.re, im: map.im, n: N })
  const modes: HydroMode[] = []

  for (let i = 0; i < N; i++) {
    const re = ev.re[i] ?? 0
    const im = ev.im[i] ?? 0

    // only modes near the unit circle can be hydrodynamic at small k
    if (Math.hypot(re, im) < 0.9) continue

    const x = complexEigenvector({ re: map.re, im: map.im, n: N, value: [re, im] })
    let norm = 0

    for (let j = 0; j < N; j++) norm += (x.re[j] ?? 0) ** 2 + (x.im[j] ?? 0) ** 2

    const project = (list: readonly Float64Array[]): number => {
      let w = 0

      for (const l of list) {
        let sr = 0
        let si = 0

        for (let j = 0; j < N; j++) {
          sr += (l[j] ?? 0) * (x.re[j] ?? 0)
          si += (l[j] ?? 0) * (x.im[j] ?? 0)
        }

        w += sr * sr + si * si
      }

      return w
    }

    const overlap = project(input.invariants) / norm
    const weights = Object.entries(input.families).map(([name, list]) => [name, project(list)] as [string, number])
    const total = weights.reduce((s, [, w]) => s + w, 0)
    const [family, weight] = weights.reduce((best, e) => (e[1] > best[1] ? e : best), ['none', -1] as [string, number])

    modes.push({ gamma: -Math.log(Math.hypot(re, im)) / period, omega: Math.abs(Math.atan2(im, re)) / period, overlap, family, share: total > 0 ? weight / total : 0 })
  }

  return modes.sort((a, b) => b.overlap - a.overlap).slice(0, input.count)
}
