// What exact local color costs a knit whose symmetry forces rotation isotropy (E-RLT-0051).
//
// Local color (E-FRC-0124) weighs a calm slot by its side sign: +1 on the first slot of its line, -1 on the
// second. A collision keeps a dock's color exactly (role points carried slot for slot, calm ones paired by
// side) exactly when it keeps the side sum D = sum_d side(d) |s_d| = sum_l n_l, the n_l = |first| - |second|
// being the twelve line momenta. If a knit's period group G (glides, and reversals, whose beats are beat
// inverses) acts on the coin, every beat also keeps D o g for g in G. With the particle momentum P = sum_l
// n_l e_l, the forced invariants are the span of P and G . D, a space of linear forms on the line momenta.
//
// This module answers three questions about that span, exhaustively over W(F4) (1152 coin maps as
// permutations of the 24 D4 roots):
// - which side choices (4,096 sign vectors on the lines) any irreducible group keeps, up to sign: the full
//   signed stabilizer of every one (sideStabilizerCensus)
// - the least rank the span can have for an irreducible G: if it were 7 or less, the span would be
//   spanned by P, D and at most two images of D, G would lie in its stabilizer, and that stabilizer would be
//   irreducible; so it is enough that every such subspace has a reducible stabilizer (forcedRankBound)
// - every irreducible group with the least rank: every one lies in the stabilizer of a dimension-8 space
//   spanned by P, D and three images, so the subgroups of the irreducible stabilizers of those are all of
//   them (leastRankGroups), with their tone twists (the homomorphisms to +-1 a symmetry's charge
//   conjugation follows) and the oriented couple partitions they keep

import { rootsD4 } from '@/code/algebra/group/root-system'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { linearMapOf } from '@/code/substrate/d4-box'
import { forcedIsotropySpread, unitSamples } from '@/code/measure/coarse-modes'

export type GroupTable = {
  readonly permutations: readonly (readonly number[])[]
  readonly multiply: Int32Array
  readonly identity: number
  readonly minus: number
  readonly inverse: readonly number[]
  readonly opposite: readonly number[]
  readonly side: readonly number[]
  readonly lineOf: readonly number[]
  readonly firsts: readonly number[]
  readonly spread: (members: readonly number[]) => number
}

const GENERIC = [0.31, -0.74, 0.52, 0.29]

export function groupTable(): GroupTable {
  const roots = rootsD4()
  const permutations = weylF4DirectionPermutations({ directions: roots })
  const n = permutations.length
  const key = (p: readonly number[]): string => p.join(',')
  const index = new Map(permutations.map((p, i) => [key(p), i]))
  const multiply = new Int32Array(n * n)

  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      const pa = permutations[a] ?? []

      multiply[a * n + b] = index.get(key((permutations[b] ?? []).map(d => pa[d] ?? 0))) ?? -1
    }
  }

  const opposite = roots.map(r => roots.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))
  const identity = index.get(key(roots.map((_, i) => i))) ?? 0
  const minus = index.get(key(opposite)) ?? -1
  const inverse = Array.from({ length: n }, (_, a) => {
    for (let b = 0; b < n; b++) if (multiply[a * n + b] === identity) return b

    return -1
  })
  const side = roots.map((_, d) => (d < (opposite[d] ?? d) ? 1 : -1))
  const lineOf: number[] = []
  const firsts: number[] = []

  roots.forEach((_, d) => {
    if (d < (opposite[d] ?? d)) {
      lineOf[d] = firsts.length
      lineOf[opposite[d] ?? d] = firsts.length
      firsts.push(d)
    }
  })

  const matrices = permutations.map(p => linearMapOf(p) ?? [])
  const samples = unitSamples(64)

  return {
    permutations,
    multiply,
    identity,
    minus,
    inverse,
    opposite,
    side,
    lineOf,
    firsts,
    spread: members => forcedIsotropySpread({ group: members.map(i => matrices[i] ?? []), rank: 2, generic: GENERIC, samples }),
  }
}

export function closure(table: GroupTable, gens: readonly number[]): number[] {
  const n = table.permutations.length
  const seen = new Set<number>([table.identity])
  const queue = [table.identity]

  while (queue.length > 0) {
    const x = queue.pop() ?? 0

    for (const g of gens) {
      const y = table.multiply[g * n + x] ?? 0

      if (!seen.has(y)) {
        seen.add(y)
        queue.push(y)
      }
    }
  }

  return [...seen].sort((a, b) => a - b)
}

// row echelon basis
export function rowBasis(rows: readonly (readonly number[])[]): number[][] {
  const m = rows.map(r => [...r])
  const cols = m[0]?.length ?? 0
  let r = 0

  for (let c = 0; c < cols && r < m.length; c++) {
    let pivot = -1

    for (let i = r; i < m.length; i++) {
      if (Math.abs(m[i]?.[c] ?? 0) > 1e-9) {
        pivot = i
        break
      }
    }

    if (pivot < 0) continue

    const tmp = m[r] ?? []

    m[r] = m[pivot] ?? []
    m[pivot] = tmp

    const lead = m[r]?.[c] ?? 1

    m[r] = (m[r] ?? []).map(x => x / lead)

    for (let i = 0; i < m.length; i++) {
      if (i === r) continue

      const f = m[i]?.[c] ?? 0

      if (Math.abs(f) > 1e-12) m[i] = (m[i] ?? []).map((x, k) => x - f * (m[r]?.[k] ?? 0))
    }

    r++
  }

  return m.slice(0, r)
}

// D o x as a form on the line momenta
export const sideImage = (table: GroupTable, x: number): number[] => table.firsts.map(d => table.side[table.permutations[x]?.[d] ?? 0] ?? 0)

export const momentumRows = (table: GroupTable): number[][] => {
  const roots = rootsD4()

  return [0, 1, 2, 3].map(k => table.firsts.map(d => roots[d]?.[k] ?? 0))
}

// a basis of the forced forms of a group: P and D o g
export function forcedForms(table: GroupTable, group: readonly number[]): number[][] {
  const distinct = new Map<string, number[]>()

  for (const x of group) distinct.set(sideImage(table, x).join(','), sideImage(table, x))

  return rowBasis([...momentumRows(table), ...distinct.values()])
}

// every half-set (a sign on each line against index orientation): its signed stabilizer and whether that
// acts irreducibly
export function sideStabilizerCensus(table: GroupTable): { irreducible: number; largest: number } {
  let irreducible = 0
  let largest = 0

  for (let m = 0; m < 4096; m++) {
    const s = table.side.map((x, d) => ((m >> (table.lineOf[d] ?? 0)) & 1 ? -x : x))
    const stab: number[] = []

    table.permutations.forEach((p, g) => {
      let plus = true
      let minus = true

      for (let d = 0; d < 24; d++) {
        const image = s[p[d] ?? 0] ?? 0

        plus = plus && image === s[d]
        minus = minus && image === -(s[d] ?? 0)
      }

      if (plus || minus) stab.push(g)
    })

    largest = Math.max(largest, stab.length)

    if (table.spread(stab) < 1e-9) irreducible++
  }

  return { irreducible, largest }
}

const composeForm = (table: GroupTable, f: readonly number[], g: number): number[] =>
  table.firsts.map(d => {
    const e = table.permutations[g]?.[d] ?? 0

    return (table.side[e] ?? 1) * (f[table.lineOf[e] ?? 0] ?? 0)
  })

function stabilizerOf(table: GroupTable, basis: readonly number[][]): number[] {
  const out: number[] = []

  for (let g = 0; g < table.permutations.length; g++) {
    if (basis.every(f => rowBasis([...basis, composeForm(table, f, g)]).length === basis.length)) out.push(g)
  }

  return out
}

function imagesOfD(table: GroupTable): number[][] {
  const orbit = new Map<string, number[]>()

  for (let x = 0; x < table.permutations.length; x++) orbit.set(sideImage(table, x).join(','), sideImage(table, x))

  return [...orbit.values()]
}

const keyOf = (basis: readonly number[][]): string => basis.map(r => r.map(x => Math.round(x * 1e6) / 1e6).join(',')).join(';')

// every subspace of dimension at most 7 spanned by P, D and two images of D, and how many have an
// irreducible stabilizer (0 proves every irreducible group forces at least 8 forms)
export function forcedRankBound(table: GroupTable): { images: number; subspaces: number; irreducible: number } {
  const vectors = imagesOfD(table)
  const base = rowBasis([...momentumRows(table), table.firsts.map(() => 1)])
  const subspaces = new Map<string, number[][]>()

  for (let i = 0; i < vectors.length; i++) {
    for (let j = i; j < vectors.length; j++) {
      const basis = rowBasis([...base, vectors[i] ?? [], vectors[j] ?? []])

      if (basis.length <= 7) subspaces.set(keyOf(basis), basis)
    }
  }

  let irreducible = 0

  for (const basis of subspaces.values()) {
    if (table.spread(stabilizerOf(table, basis)) < 1e-9) irreducible++
  }

  return { images: vectors.length, subspaces: subspaces.size, irreducible }
}

// the tone twists of a group: homomorphisms to +-1, constant on cosets of its squares and commutators
export function twists(table: GroupTable, group: readonly number[]): Map<number, number>[] {
  const n = table.permutations.length
  const gens: number[] = []

  for (const a of group) {
    gens.push(table.multiply[a * n + a] ?? 0)

    for (const b of group) {
      gens.push(table.multiply[(table.multiply[(table.multiply[a * n + b] ?? 0) * n + (table.inverse[a] ?? 0)] ?? 0) * n + (table.inverse[b] ?? 0)] ?? 0)
    }
  }

  const kernel = new Set(closure(table, [...new Set(gens)]))
  const basis: number[] = []
  let span = new Set(kernel)

  for (const a of group) {
    if (span.has(a)) continue

    basis.push(a)

    const next = new Set(span)

    for (const x of span) next.add(table.multiply[a * n + x] ?? 0)

    span = next
  }

  const out: Map<number, number>[] = []

  for (let mask = 0; mask < 1 << basis.length; mask++) {
    const tau = new Map<number, number>()

    for (const x of kernel) tau.set(x, 1)

    basis.forEach((b, i) => {
      const sign = (mask >> i) & 1 ? -1 : 1

      for (const [x, v] of [...tau]) {
        const y = table.multiply[b * n + x] ?? 0

        if (!tau.has(y)) tau.set(y, v * sign)
      }
    })

    out.push(tau)
  }

  return out
}

// every subgroup of a group, by adjoining one element at a time
export function subgroupsOf(table: GroupTable, host: readonly number[]): number[][] {
  const found = new Map<string, number[]>()
  const trivial = closure(table, [])
  const queue: { group: number[]; gens: number[] }[] = [{ group: trivial, gens: [] }]

  found.set(trivial.join(','), trivial)

  while (queue.length > 0) {
    const { group, gens } = queue.pop() ?? { group: trivial, gens: [] }
    const inside = new Set(group)

    for (const h of host) {
      if (inside.has(h)) continue

      const next = closure(table, [...gens, h])
      const id = next.join(',')

      if (!found.has(id)) {
        found.set(id, next)
        queue.push({ group: next, gens: [...gens, h] })
      }
    }
  }

  return [...found.values()]
}

// every irreducible group of forced rank 8: the subgroups of the irreducible stabilizers of the
// dimension-8 spaces spanned by P, D and three images of D
export function leastRankGroups(table: GroupTable): { spaces: number; hosts: number[]; groups: number[][] } {
  const vectors = imagesOfD(table)
  const base = rowBasis([...momentumRows(table), table.firsts.map(() => 1)])
  const spaces = new Map<string, number[][]>()

  for (let i = 0; i < vectors.length; i++) {
    const bi = rowBasis([...base, vectors[i] ?? []])

    if (bi.length !== 6) continue

    for (let j = i + 1; j < vectors.length; j++) {
      const bj = rowBasis([...bi, vectors[j] ?? []])

      if (bj.length !== 7) continue

      for (let k = j + 1; k < vectors.length; k++) {
        const bk = rowBasis([...bj, vectors[k] ?? []])

        if (bk.length === 8) spaces.set(keyOf(bk), bk)
      }
    }
  }

  const hosts = [...spaces.values()].map(b => stabilizerOf(table, b)).filter(s => table.spread(s) < 1e-9)
  const groups = new Map<string, number[]>()

  for (const host of hosts) {
    for (const g of subgroupsOf(table, host)) {
      if (table.spread(g) < 1e-9 && forcedForms(table, g).length === 8) groups.set(g.join(','), g)
    }
  }

  return { spaces: spaces.size, hosts: hosts.map(h => h.length), groups: [...groups.values()] }
}

function* orientedPartitions(rest: readonly number[]): Generator<[number, number][]> {
  if (rest.length === 0) {
    yield []
    return
  }

  const [a, ...others] = rest

  for (let i = 0; i < others.length; i++) {
    const b = others[i] ?? 0
    const remaining = others.filter((_, j) => j !== i)

    for (const tail of orientedPartitions(remaining)) {
      yield [[a ?? 0, b], ...tail]
      yield [[b, a ?? 0], ...tail]
    }
  }
}

// how many oriented couple partitions [plus line, minus line] a group keeps under a twist: g carries a
// couple's plus line to a plus line when its twist is +1 and to a minus line when it is -1
export function keptCouplePartitions(table: GroupTable, group: readonly number[], tau: ReadonlyMap<number, number>, limit = Infinity): number {
  const lineImage = (x: number, l: number): number => table.lineOf[table.permutations[x]?.[table.firsts[l] ?? 0] ?? 0] ?? 0
  let kept = 0

  for (const part of orientedPartitions(Array.from({ length: 12 }, (_, l) => l))) {
    const plusOf = new Array<number>(12).fill(-1)

    for (const [p, m] of part) plusOf[p] = m

    const ok = group.every(x => {
      const t = tau.get(x) ?? 1

      return part.every(([p, m]) => {
        const gp = lineImage(x, p)
        const gm = lineImage(x, m)

        return t === 1 ? plusOf[gp] === gm : plusOf[gm] === gp
      })
    })

    if (ok && ++kept >= limit) return kept
  }

  return kept
}
