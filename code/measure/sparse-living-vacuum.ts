// The sparse living vacuum: the living-pair knit (code/rule/living-pair-knit, schedule 'alternate', the neutral veto,
// unchanged) on a hot vacuum that stores a unit on only SOME lines of each dock (E-RLT-0077 to E-RLT-0079). The rule is
// the same W(F4)-covariant rule; only the vacuum STATE differs, so the state, not the rule, breaks the symmetry
// (E-RLT-0064's theorem: no covariant rule makes a pair from a W(F4)-fixed vacuum).
//
// WHICH SPARSE PATTERNS RUN AS A LIVING VACUUM, derived. A pattern is a set of units (x, l): dock x stores +1 on line
// l, in the line's own orientation, and nothing else. Write r_l for line l's root (its first slot f_l), s_l its second
// slot (-r_l). The period-6 cycle of E-RLT-0074 carries over unit by unit provided every collision a unit's vibes meet
// is the -1 coin map. Beat 0 (P, then K): each unit makes its pair (love on f_l, fear on s_l); the dock then holds
// only pairs, so its occupation momentum is 0 and K = -1 (the isometric table at momentum 0), turning each vibe round;
// the stream copies the love to x - r_l (slot s_l) and the fear to x + r_l (slot f_l). Beat 1 (K, then P): dock y holds
// a vibe on f_l exactly when a unit (y - r_l, l) exists and on s_l exactly when (y + r_l, l) exists. For every vibe to
// be turned round and copied home, K must be -1 at y, which is momentum 0:
//      (Z)  sum_l r_l ( [ (y - r_l, l) is a unit ] - [ (y + r_l, l) is a unit ] ) = 0     for every dock y.
// The P after K then sees, on a line with both slots held, a love and a fear of two DIFFERENT units, which the neutral
// veto must refuse: condition (A) of living-pair-knit, needed only on lines where both units exist. On a line with one
// slot held the store is 0 (the dock's own unit, if any, emptied it at beat 0) and P does nothing. Beat 2 (P, then K):
// each unit's own love and fear are home on their own line with their points restored (a link, then its inverse), and
// P unmakes them. Beats 3 to 5 repeat it with the love going the other way; beat 4's docks hold the same occupation
// as beat 1's, so (Z) and (A) again suffice. Hence:
//      a pattern runs the exact period-6 cycle (every unit made on beats 0 and 3 mod 6, unmade on 2 and 5, the store
//      pattern back after each) if (Z) and (A) hold; if (Z) fails at a dock, K there is not -1 and some vibe does not
//      return; if (A) fails, two units' members pair off across the vacuum.
// Every translation-invariant pattern (the same set of lines on every dock) satisfies (Z) term by term. On an odd box
// (every box here: sides 3 to 13), a line's units must then close along the whole line: invariance under 2 r_l is
// invariance under r_l, since 2 is invertible mod the side. So a pattern thinner than one unit per dock on a line
// needs a transverse sublattice whose index divides the side, a box-dependent choice, or momentum cancellation between
// different lines at every dock. THE SIMPLEST PATTERN is one line, the same on every dock: ONE_LINE, line 0.
//
// WHY NO VACUUM PAIR MAKES FEAR ON ITS OWN, derived (E-RLT-0078). On a (Z) vacuum every vacuum vibe stays on its own
// line (K = -1 keeps the line) and returns home each three beats through a link and its inverse, so every vacuum token
// has identity net transport over a period, and two tokens on different lines never meet (a meeting is two slots of
// one line). A two-token whole therefore evolves each period by one fixed map, a product of love-fear kernels each read
// at a fixed transport: for a unit's own two tokens, the same kernel twice (beats 2 and 5), for two neighbouring units'
// tokens one conjugated kernel (beat 1 or 4). The love-fear kernel is I + (omega - 1) P with P a rank-one projector
// (code/rule/fear-kernel-exact), whose cube is I, so every two-token vacuum whole cycles with period dividing 3
// periods. A whole of MORE tokens along a line meets overlapping pairs at different beats (a ring of two neighbouring
// units meets six times a period through four kernels on overlapping pairs), which need not commute.
//
// NO ROUNDING, NO CONTINUITY in the rule: this file builds states and reads them. The linearization at the end is a
// measurement (floats), labeled as such.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { type ColorWeave } from '@/code/rule/color-weave'
import { LINE_FIRSTS, LINE_OF, momentumKey, OPPOSITE, SIDE, type MomentumTable } from '@/code/rule/isometric-knit'
import { livingCollide, livingState, type LivingKnit } from '@/code/rule/living-pair-knit'
import { cloneStoreState, type TokenStoreState } from '@/code/rule/token-store-knit'
import { livingRunner, tritDifference, type KernelTally, type LivingKernel, type Reduced } from '@/code/measure/living-pair-kernel'
import { kroneckerStoreDock, STORE_N, type Background } from '@/code/measure/token-store-linearization'
import { weyl } from '@/code/tool/weyl'

const ROOTS = rootsD4()
const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)

// a store pattern the same on every dock: one trit per line
export type StorePattern = readonly number[]

export const patternOf = (lines: readonly number[]): StorePattern => Array.from({ length: 12 }, (_, l) => (lines.includes(l) ? 1 : 0))
export const ONE_LINE: StorePattern = patternOf([0])
export const ALL_LINES: StorePattern = patternOf([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])

// the store of a whole box, the pattern on every dock
export function boxStore(cells: number, pattern: StorePattern): Int8Array {
  const store = new Int8Array(cells * 12)

  for (let x = 0; x < cells; x++) for (let l = 0; l < 12; l++) store[x * 12 + l] = pattern[l] as number

  return store
}

// A full state (tokens, places, points): the given vibes and points, the given store per line of every dock, both place
// tokens of a line at the layout's point, a stored unit's place tokens labeled by its orientation (0 where nothing is
// stored)
export function sparseLivingState(input: { vibe: Int8Array; point: Int8Array; store: Int8Array; layout: Int8Array }): TokenStoreState {
  const s = livingState({ vibe: input.vibe, point: input.point, tau: 1, layout: input.layout })
  const slots = input.vibe.length
  const lines = input.store.length

  for (let i = 0; i < lines; i++) {
    const tau = input.store[i] as number
    const x = Math.floor(i / 12)
    const l = i % 12

    s.store[i] = tau
    s.label[slots + x * 24 + 2 * l] = tau
    s.label[slots + x * 24 + 2 * l + 1] = -tau
  }

  return s
}

export function sparseReduced(fill: { vibe: Int8Array; point: Int8Array }, store: Int8Array, layout: Int8Array): Reduced {
  return { vibe: Int8Array.from(fill.vibe), point: Int8Array.from(fill.point), store: Int8Array.from(store), spoint: Int8Array.from(layout) }
}

// ---- conditions (Z) and (A) ----

export type Conditions = { units: number; momentumDocks: number; bothLines: number; vetoFailures: number }

// the docks where (Z) fails, the (dock, line) places where both neighbouring units exist, and those among them where
// (A) fails for the layout
export function sparseConditions(weave: ColorWeave, store: Int8Array, layout: Int8Array): Conditions {
  const { mesh, moves, links } = weave
  const cells = mesh.cellCount
  let units = 0
  let momentumDocks = 0
  let bothLines = 0
  let vetoFailures = 0

  for (let i = 0; i < store.length; i++) units += store[i] !== 0 ? 1 : 0

  for (let y = 0; y < cells; y++) {
    const p = [0, 0, 0, 0]

    for (let l = 0; l < 12; l++) {
      const f = LINE_FIRSTS[l] as number
      const s = LINE_SECONDS[l] as number
      const below = mesh.neighbour(y, s)
      const above = mesh.neighbour(y, f)
      const fromBelow = store[below * 12 + l] !== 0
      const fromAbove = store[above * 12 + l] !== 0
      const r = ROOTS[f] as number[]
      const n = (fromBelow ? 1 : 0) - (fromAbove ? 1 : 0)

      for (let k = 0; k < 4; k++) p[k] = (p[k] as number) + n * (r[k] as number)

      if (fromBelow && fromAbove) {
        bothLines++

        // (A) at the unit x = below: link(x, f) p(x) != link(x + 2r, s) p(x + 2r)
        const left = moves.act[links[below * 24 + f] ?? moves.identity]?.[layout[below * 12 + l] as number]
        const right = moves.act[links[above * 24 + s] ?? moves.identity]?.[layout[above * 12 + l] as number]

        vetoFailures += left === right ? 1 : 0
      }
    }

    momentumDocks += p.some(v => v !== 0) ? 1 : 0
  }

  return { units, momentumDocks, bothLines, vetoFailures }
}

// ---- the vacuum run: is it the exact period-6 cycle ----

export type VacuumCycle = { exact: boolean; period: number; tallies: string; made: number; unmade: number; vetoed: number }

// the vacuum of a store on the kernel's box, 24 beats: exact when every beat's make, unmake and veto counts are the
// derived ones (units made on beats 0, 3 mod 6, unmade on 2, 5, the vetoes on 1, 4 equal to the lines with both
// neighbours), the box calm with the store back after beats 2 and 5 mod 6, and the period 6
export function vacuumCycle(kernel: LivingKernel, store: Int8Array, layout: Int8Array, bothLines: number): VacuumCycle {
  const cells = kernel.cells
  const units = store.reduce((s, v) => s + (v !== 0 ? 1 : 0), 0)
  const run = livingRunner(kernel, { vibe: new Int8Array(cells * 24), point: new Int8Array(cells * 24), store: Int8Array.from(store), spoint: Int8Array.from(layout) })
  const states: Reduced[] = []
  const seen: string[] = []
  let exact = true
  let made = 0
  let unmade = 0
  let vetoed = 0

  for (let t = 0; t < 24; t++) {
    const s = run.state()

    states.push({ vibe: Int8Array.from(s.vibe), point: Int8Array.from(s.point), store: Int8Array.from(s.store), spoint: Int8Array.from(s.spoint) })

    const tally: KernelTally = { made: 0, unmade: 0, vetoed: 0 }

    run.beat(tally)
    made += tally.made
    unmade += tally.unmade
    vetoed += tally.vetoed

    const phase = t % 3
    const expected = phase === 0 ? [units, 0, 0] : phase === 1 ? [0, 0, bothLines] : [0, units, 0]

    exact = exact && tally.made === expected[0] && tally.unmade === expected[1] && tally.vetoed === expected[2]

    if (phase === 2) {
      const after = run.state()

      exact = exact && after.vibe.every(v => v === 0) && after.store.every((v, i) => v === store[i])
    }

    if (t < 6) seen.push(`${tally.made}/${tally.unmade}/${tally.vetoed}`)
  }

  const same = (a: Reduced, b: Reduced): boolean => tritDifference(a, b).trits === 0 && a.vibe.every((v, i) => v === 0 || a.point[i] === b.point[i])
  let period = 0

  for (let p = 1; p <= 12 && period === 0; p++) if (states.every((x, t) => t + p >= states.length || same(x, states[t + p] as Reduced))) period = p

  return { exact: exact && period === 6, period, tallies: seen.join(' '), made, unmade, vetoed }
}

// ---- the lone vibe's wake on a sparse vacuum ----

// the wake per beat (trits off the vacuum run) of a lone vibe of the given tone on the given slot, `beats` beats
export function wakeSeries(kernel: LivingKernel, store: Int8Array, layout: Int8Array, slot: number, tone: number, beats: number): number[] {
  const cells = kernel.cells
  const empty = (): Reduced => ({ vibe: new Int8Array(cells * 24), point: new Int8Array(cells * 24), store: Int8Array.from(store), spoint: Int8Array.from(layout) })
  const vac = livingRunner(kernel, empty())
  const start = empty()

  start.vibe[slot] = tone

  const run = livingRunner(kernel, start)
  const out: number[] = []

  for (let t = 0; t < beats; t++) {
    vac.beat()
    run.beat()
    out.push(tritDifference(run.state(), vac.state()).trits)
  }

  return out
}

// the class of a direction against a line: |r_d . r_l| (0 orthogonal, 1 at 60 or 120 degrees, 2 along)
export function angleClass(direction: number, line: number): number {
  const a = ROOTS[direction] as number[]
  const b = ROOTS[LINE_FIRSTS[line] as number] as number[]

  return Math.abs(a.reduce((s, x, k) => s + x * (b[k] as number), 0))
}

// ---- the oriented linearization (a measurement) ----
//
// E-RLT-0075's exact 72-index singlet linearization (code/measure/living-pair-linearization) with a store law PER
// LINE: a product background whose stored lines carry one law and the others another, so the sparse vacuum's
// orientation enters the linear transport. The chain construction is that file's, unchanged but for the law read on
// each of the two lines l and m a chain touches; with every line on one law it is that file's matrix (E-RLT-0079's
// instrument check).

export type Law = readonly [number, number, number]
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

function chainTable(bg: Background, mode: CollisionMode, input: { nl: number; nm: number; flip: boolean; self: boolean; lawL: Law; lawM: Law }): ChainTable {
  const { nl, nm, flip, self, lawL, lawM } = input
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
      const pl = lawL[tl] as number

      for (const [sl, ql] of sameChances) {
        for (const m of mStates) {
          for (const tm of mStores) {
            const pm = self ? 1 : (lawM[tm] as number)

            for (const [sm, qm] of self ? ([[true, 1]] as [boolean, number][]) : sameChances) {
              const rest = l.p * ql * (self ? 1 : m.p * qm)

              if (rest === 0) continue

              const [x1, y1, stl, same1] = pFirst ? move(valueOf(l.a), valueOf(l.b), valueOf(tl), sl) : [valueOf(l.a), valueOf(l.b), valueOf(tl), sl]
              const stm = self ? stl : pFirst ? move(valueOf(m.a), valueOf(m.b), valueOf(tm), sm)[2] : valueOf(tm)
              const x = flip ? y1 : x1
              const y = flip ? x1 : y1
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

// the exact 72-index singlet linearization of one collision at the background, with line l's store law laws[l]
export function orientedLinearization(input: { table: MomentumTable; background: Background; mode: CollisionMode; laws: readonly Law[] }): Float64Array {
  const bg = input.background
  const N = STORE_N
  const distinct: Law[] = []
  const lawIndex = input.laws.map(law => {
    const i = distinct.findIndex(d => d.every((v, k) => v === law[k]))

    if (i >= 0) return i

    distinct.push(law)

    return distinct.length - 1
  })
  const D = distinct.length
  const tables = new Map<number, ChainTable>()
  const tableKey = (nl: number, nm: number, flip: boolean, self: boolean, il: number, im: number): number =>
    (((((nl + 1) * 3 + (nm + 1)) * 4 + (flip ? 1 : 0) * 2 + (self ? 1 : 0)) * D + il) * D) + im

  for (const nl of [-1, 0, 1]) {
    for (const flip of [false, true]) {
      for (let il = 0; il < D; il++) {
        tables.set(tableKey(nl, 0, flip, true, il, il), chainTable(bg, input.mode, { nl, nm: 0, flip, self: true, lawL: distinct[il] as Law, lawM: distinct[il] as Law }))

        for (let im = 0; im < D; im++) {
          for (const nm of [-1, 0, 1]) {
            tables.set(tableKey(nl, nm, flip, false, il, im), chainTable(bg, input.mode, { nl, nm, flip, self: false, lawL: distinct[il] as Law, lawM: distinct[im] as Law }))
          }
        }
      }
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
      const table = tables.get(tableKey(n[l] as number, self ? 0 : (n[m] as number), lineFlip[l] === 1, self, lawIndex[l] as number, self ? (lawIndex[l] as number) : (lawIndex[m] as number))) as ChainTable
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

// the store of the m-th Kronecker dock with a per-line law (vibes and points are kroneckerStoreDock's; each line's
// store from its own Weyl orbit, frac(sqrt q) for the primes 401 to 461, never a draw)
const STORE_RATES = [401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463].map(q => Math.sqrt(q) - Math.floor(Math.sqrt(q)))

export function orientedKroneckerDock(m: number, bg: Background, laws: readonly Law[]): TokenStoreState {
  const dock = kroneckerStoreDock(m, bg)

  for (let l = 0; l < 12; l++) {
    const x = weyl(m + 1, STORE_RATES[l] as number)
    const law = laws[l] as Law

    dock.store[l] = x < law[0] ? 1 : x < law[0] + law[1] ? -1 : 0
  }

  return dock
}

// the sampled singlet matrix of beat t's collision from the full rule on `samples` oriented Kronecker docks
// (living-pair-linearization's sampler with the per-line store law)
export function sampledOrientedLinearization(input: { knit: LivingKnit; background: Background; laws: readonly Law[]; samples: number; t: number }): Float64Array {
  const N = STORE_N
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
