// Lazy open windows for every tiling, q odd included. {7,3}, {8,3}, {4,5} and {3,7}
// have no right-angled tile group, so the Foata forms of E-CMP-0032 do not reach them; here a tile is a coset of the
// cell subgroup of the (2, p, q) triangle group, named by the exact matrix of its minimal representative over
// Z[2cos(pi/m)], with facet distance read off a canonical parent chain (proven by folding, coset-tiling.ts), ball sizes
// from the Brink-Howlett small-root automaton (small-roots.ts), and a proper p-edge-coloring lifted from a finite
// quotient (lifted-coloring.ts). The flat partners {4,4} and {3,6} run on the same machinery, so every matched pair is
// read on lazy windows. This experiment proves that machinery before E-CMP-0027 reads with it.
//
// Gates, each able to fail:
// - tiling: for {7,3}, {8,3}, {4,5}, {3,7} at the radius the harness uses, and {4,4}, {3,6} at radius 30, the exact
//   chamber complex of the same Coxeter group (chamber-tiling.ts, integer residue walks, E-CMP-0029) is mapped onto
//   coset tiles by walking its chambers with the matrices: a bijection that keeps every facet edge, with equal
//   distances and shells.
// - growth: the small-root automaton's minimal coset representatives by length equal Steinberg's W(t) / W_J(t) (40
//   terms), and its tile shells equal the shells of every ball built (and the flat closed forms 2r^2 + 2r + 1 and
//   1 + 3r(r + 1)/2).
// - cross-check: the coset tilings of {5,4} and {6,4} are isomorphic, as oriented tilings and with equal distances, to
//   the Foata tilings of E-CMP-0032 (radius 10 and 8).
// - schedule: on every lazy ball each color is a matching, the colors cover every edge once, every cell inside the
//   shell is matched in every color, and every pair's first cell is the shorter tile or, at equal distance, the
//   canonically lower one.
// - lazy equals dense: for every vacuum-fixing rule, both color orders, every seed the ball holds and every open damage
//   start, the lazy run and the dense run on the ball (same schedule) hold the same state cell for cell at every round
//   the dense run calls exact; seed tracks agree byte for byte over those rounds.
// - light cone: no lazy run reaches a cell beyond r0 + c t, and a 24-round full-swap run holds under 1% of the ball.
// - two runs give identical bytes, and no file draws a random number.
// Negative controls the gates must reject: a coset tiling of {7,4} mapped against the exact {7,3} complex (tiling gate),
// a coloring shifted by one color on tiles of odd chamber length (matching gate), a lazy run with its last color dropped
// and one with reversed colors against the forward dense schedule (equality gate), and the automaton of {7,4} against
// the shells of {7,3} (growth gate).

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import {
  COSET_LAZY_GEOMETRIES,
  ColorOrder,
  COLOR_ORDERS,
  HarnessRule,
  LabInstance,
  SEEDS,
  SEED_ROUNDS,
  SparseRun,
  chain,
  harnessReading,
  harnessRule,
  lazyContext,
  lazyDamageStarts,
  lazyRun,
  lazySeedCells,
  openInstances,
} from '@/code/compute/lab/harness'
import { LazyRun, LazySpace, spaceBall } from '@/code/compute/lab/lazy-space'
import { pairRuleCensus } from '@/code/rule/pair-rule'
import { checkSchedule } from '@/code/rule/partition-schedule'
import { ChamberComplex, tilingSystem } from '@/code/substrate/coxeter/chamber-tiling'
import { CosetTiling } from '@/code/substrate/coxeter/coset-tiling'
import { liftedColoring } from '@/code/substrate/coxeter/lifted-coloring'
import { RightAngledTiling } from '@/code/substrate/coxeter/right-angled-tiling'
import { CosetGrowth } from '@/code/substrate/coxeter/small-roots'
import { systemGrowthSeries } from '@/code/substrate/coxeter/system-growth'
import { LabGeometryName } from '@/code/substrate/lab-geometry'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const LAB_FILES = [
  'code/substrate/coxeter/cosine-ring.ts',
  'code/substrate/coxeter/coset-tiling.ts',
  'code/substrate/coxeter/small-roots.ts',
  'code/substrate/coxeter/lifted-coloring.ts',
  'code/compute/lab/lazy-space.ts',
  'code/compute/lab/harness.ts',
  'test/experiment/computation/coset-window.ts',
]
const GROWTH_TERMS = 40
const FLAT_EXACT_RADIUS = 30

const triangle = (p: number, q: number): number[][] => [
  [1, p, 2],
  [p, 1, q],
  [2, q, 1],
]

// ---- tiling ----

type TilingCheck = { name: string; radius: number; cells: number; ok: boolean; why: string }

// The exact chamber ball mapped onto coset tiles: walk each exact tile's 2p chambers with the matrix of the first, and
// cross every s_2 panel.
function cosetAgainstExact(input: {
  name: string
  symbol: readonly [number, number]
  radius: number
  // a different Coxeter matrix for the coset side: the negative control
  cosetCoxeter?: readonly (readonly number[])[]
}): TilingCheck {
  const [p, q] = input.symbol
  const system = tilingSystem(input.symbol, 'chamber')!
  const complex = new ChamberComplex({ system })
  const ball = complex.tileBall({ radius: input.radius })
  const n = ball.tiles.length
  const index = new Map<number, number>()

  ball.tiles.forEach((t, i) => index.set(t, i))

  const tiling = new CosetTiling({
    p,
    q,
    ...(input.cosetCoxeter ? { coxeter: input.cosetCoxeter } : {}),
  })
  const map = new Int32Array(n).fill(-1)
  const chamberOf = new Int32Array(n).fill(-1)
  const matrixOf: bigint[][] = []
  const used = new Map<number, number>()
  const fail = (why: string): TilingCheck => ({
    name: input.name,
    radius: input.radius,
    cells: n,
    ok: false,
    why,
  })

  map[0] = 0
  chamberOf[0] = 0
  matrixOf[0] = [...tiling.matrix(0)]
  used.set(0, 0)

  const queue = [0]

  for (const i of queue) {
    let c = chamberOf[i]!

    const m = [...matrixOf[i]!]

    for (let t = 0; t < 2 * p; t++) {
      const across = complex.neighbor(c, 2)
      const j = index.get(complex.tile(across))

      if (j !== undefined) {
        const step = [...m]

        tiling.rightMultiply(step, 2)

        const lazy = tiling.tileOf([...step]).tile

        if (map[j]! < 0) {
          if (used.has(lazy)) {
            return fail(`two exact tiles map to one coset tile (${j})`)
          }

          map[j] = lazy
          chamberOf[j] = across
          matrixOf[j] = step
          used.set(lazy, j)
          queue.push(j)
        } else if (map[j] !== lazy) {
          return fail(`an edge of exact tile ${i} leads elsewhere on the coset side`)
        }
      }

      const s = t % 2 === 0 ? 0 : 1

      c = complex.neighbor(c, s)
      tiling.rightMultiply(m, s)
    }

    if (c !== chamberOf[i]) {
      return fail(`the walk around exact tile ${i} did not close`)
    }
  }

  if (queue.length !== n) {
    return fail('the map does not reach every exact tile')
  }

  for (let i = 0; i < n; i++) {
    if (tiling.distance(map[i]!) !== ball.distance[i]) {
      return fail(`tile ${i}: coset distance ${tiling.distance(map[i]!)} against ${ball.distance[i]}`)
    }
  }

  // the coset ball itself: same size
  const seen = new Set([0])
  const bfs = [0]

  for (const u of bfs) {
    if (tiling.distance(u) >= input.radius) {
      continue
    }

    for (let k = 0; k < p; k++) {
      const w = tiling.neighbor(u, k)

      if (!seen.has(w)) {
        seen.add(w)
        bfs.push(w)
      }
    }
  }

  if (bfs.length !== n) {
    return fail(`coset ball of ${bfs.length} tiles against ${n}`)
  }

  return { name: input.name, radius: input.radius, cells: n, ok: true, why: '' }
}

// ---- growth ----

type GrowthCheck = { name: string; ok: boolean; why: string; states: number; smallRoots: number }

function quotientSeries(p: number, q: number, count: number): bigint[] {
  const w = systemGrowthSeries(triangle(p, q), count)
  const wj = [1n, ...Array.from({ length: p - 1 }, () => 2n), 1n]
  const out: bigint[] = []

  for (let n = 0; n < count; n++) {
    let v = w[n]!

    for (let i = 1; i < wj.length && i <= n; i++) {
      v -= wj[i]! * out[n - i]!
    }

    out.push(v)
  }

  return out
}

function growthCheck(input: {
  name: string
  p: number
  q: number
  // shells of a built ball to compare with
  shells: readonly number[]
  closedForm?: (r: number) => number
  // an automaton of another matrix: the negative control
  growthCoxeter?: readonly (readonly number[])[]
}): GrowthCheck {
  const growth = new CosetGrowth({
    p: input.p,
    q: input.q,
    ...(input.growthCoxeter ? { coxeter: input.growthCoxeter } : {}),
  })
  const done = (ok: boolean, why: string): GrowthCheck => ({
    name: input.name,
    ok,
    why,
    states: growth.stateCount,
    smallRoots: growth.automaton.roots.length,
  })

  if (!input.growthCoxeter) {
    const steinberg = quotientSeries(input.p, input.q, GROWTH_TERMS)
    const automaton = growth.lengthSeries(GROWTH_TERMS)

    if (steinberg.join(',') !== automaton.join(',')) {
      return done(false, 'the automaton length series differs from W(t) / W_J(t)')
    }
  }

  let ball = 0

  for (let d = 0; d < input.shells.length; d++) {
    if (growth.shell(d) !== BigInt(input.shells[d]!)) {
      return done(false, `shell ${d}: automaton ${growth.shell(d)} against ${input.shells[d]}`)
    }

    ball += input.shells[d]!

    if (input.closedForm && input.closedForm(d) !== ball) {
      return done(false, `ball ${d}: ${ball} against the closed form ${input.closedForm(d)}`)
    }
  }

  return done(true, '')
}

// ---- cross-check against the Foata tilings ----

// Oriented isomorphism of two tilings given by their cyclic neighbour slots and orientation parities: map the origins,
// try every alignment of the origin's slots, propagate.
function orientedIsomorphic(input: {
  p: number
  radius: number
  a: { neighbor: (t: number, k: number) => number; parity: (t: number) => number; distance: (t: number) => number }
  b: { neighbor: (t: number, k: number) => number; parity: (t: number) => number; distance: (t: number) => number }
}): { ok: boolean; cells: number } {
  const { p, a, b, radius } = input
  const mod = (x: number): number => ((x % p) + p) % p
  const geo = (side: typeof a, t: number, i: number): number => side.neighbor(t, side.parity(t) === 0 ? mod(i) : mod(-i))

  const back = (side: typeof a, t: number, from: number): number => {
    for (let i = 0; i < p; i++) {
      if (geo(side, t, i) === from) {
        return i
      }
    }

    return -1
  }

  for (const sigma of [1, -1]) {
    for (let o0 = 0; o0 < p; o0++) {
      const map = new Map<number, number>([[0, 0]])
      const offset = new Map<number, number>([[0, o0]])
      const used = new Set([0])
      const queue = [0]

      let ok = true

      for (const x of queue) {
        if (!ok) {
          break
        }

        const y = map.get(x)!
        const o = offset.get(x)!

        if (a.distance(x) !== b.distance(y)) {
          ok = false
          break
        }

        if (a.distance(x) >= radius) {
          continue
        }

        for (let i = 0; i < p; i++) {
          const x2 = geo(a, x, i)
          const y2 = geo(b, y, sigma * i + o)
          const o2 = mod(back(b, y2, y) - sigma * back(a, x2, x))

          if (!map.has(x2)) {
            if (used.has(y2)) {
              ok = false
              break
            }

            map.set(x2, y2)
            offset.set(x2, o2)
            used.add(y2)
            queue.push(x2)
          } else if (map.get(x2) !== y2 || offset.get(x2) !== o2) {
            ok = false
            break
          }
        }
      }

      if (ok) {
        return { ok: true, cells: map.size }
      }
    }
  }

  return { ok: false, cells: 0 }
}

function foataCrossCheck(symbol: readonly [number, number], radius: number): TilingCheck {
  const [p, q] = symbol
  const coset = new CosetTiling({ p, q })
  const system = tilingSystem(symbol, 'tile')!
  const foata = new RightAngledTiling(system.coxeter)
  const r = orientedIsomorphic({
    p,
    radius,
    a: {
      neighbor: (t, k) => coset.neighbor(t, k),
      parity: t => coset.chamberLength(t) % 2,
      distance: t => coset.distance(t),
    },
    b: {
      neighbor: (t, k) => foata.neighbor(t, k),
      parity: t => foata.length(t) % 2,
      distance: t => foata.length(t),
    },
  })

  return {
    name: `${system.name} against {${p},${q}}/coset`,
    radius,
    cells: r.cells,
    ok: r.ok,
    why: r.ok ? '' : 'no oriented isomorphism keeps the distances',
  }
}

// ---- schedule ----

function scheduleCheck(inst: LabInstance): string[] {
  const out: string[] = []
  const s = inst.schedules.forward.schedule
  const check = checkSchedule({ schedule: s, neighbors: inst.neighbors })

  if (!check.everyColorIsMatching || !check.coversEveryEdgeOnce) {
    out.push(`${inst.name}: not a proper coloring`)
  }

  s.matchings.forEach((m, c) => {
    const matched = new Uint8Array(inst.size)

    for (let k = 0; k < m.length; k += 2) {
      const i = m[k]!
      const j = m[k + 1]!

      matched[i] = 1
      matched[j] = 1

      // ball cells are numbered in the canonical order, so a tie goes to the lower index
      if (inst.distance[i]! > inst.distance[j]! || (inst.distance[i] === inst.distance[j] && i > j)) {
        out.push(`${inst.name}: color ${c} pair ${i} ${j} is oriented against the rule`)
      }
    }

    for (let v = 0; v < inst.size; v++) {
      if (inst.distance[v]! < inst.radius && !matched[v]) {
        out.push(`${inst.name}: color ${c} leaves interior cell ${v} unmatched`)
        break
      }
    }
  })

  return out
}

// A {7,3} coloring shifted by one color on tiles of odd chamber length: two tiles can then claim one edge in two colors.
function brokenColoring(): boolean {
  const tiling = new CosetTiling({ p: 7, q: 3 })
  const coloring = liftedColoring(tiling)
  const p = 7
  const radius = 4
  const seen = new Map<number, number>([[0, 0]])
  const cells = [0]

  for (const u of cells) {
    if (tiling.distance(u) >= radius) {
      continue
    }

    for (let k = 0; k < p; k++) {
      const w = tiling.neighbor(u, k)

      if (!seen.has(w)) {
        seen.set(w, cells.length)
        cells.push(w)
      }
    }
  }

  const neighbors = cells.map(c =>
    Array.from({ length: p }, (_, k) => seen.get(tiling.neighbor(c, k))).filter((x): x is number => x !== undefined),
  )

  const slotOf = (c: number, color: number): number => {
    const key = tiling
      .matrix(c)
      .map(x => {
        const l = BigInt(coloring.modulus)

        return (((x % l) + l) % l).toString()
      })
      .join(',')
    const g = coloring.elementIndex.get(key)!
    const shifted = tiling.chamberLength(c) % 2 === 1 ? (color + 1) % p : color

    return coloring.slotOfColor[g * p + shifted]!
  }

  const matchings = Array.from({ length: p }, (_, color) => {
    const flat: number[] = []

    cells.forEach((c, i) => {
      const j = seen.get(tiling.neighbor(c, slotOf(c, color)))

      if (j !== undefined && i < j) {
        flat.push(i, j)
      }
    })

    return Int32Array.from(flat)
  })
  const check = checkSchedule({
    schedule: {
      size: cells.length,
      matchings,
      method: 'generator-coloring',
      colorCount: p,
      colorOrder: matchings.map((_, c) => c),
      orientation: 'broken',
    },
    neighbors,
  })

  return !check.everyColorIsMatching || !check.coversEveryEdgeOnce
}

// ---- lazy equals dense (as E-CMP-0032) ----

type Comparison = {
  rounds: number
  runs: number
  failures: string[]
  coneExcess: number
  trackRounds: number
}

function sameState(dense: SparseRun, lazy: LazyRun, index: Map<string, number>): boolean {
  if (dense.count !== lazy.state.size) {
    return false
  }

  for (const [cell, tone] of lazy.state) {
    const i = index.get(lazy.space.address(cell))

    if (i === undefined || dense.state[i] !== tone) {
      return false
    }
  }

  return true
}

function compareRuns(input: {
  inst: LabInstance
  rule: HarnessRule
  order: ColorOrder
  colors?: (colors: number[]) => number[]
  out: Comparison
}): void {
  const { inst, rule, order, out } = input
  const s = inst.schedules[order]
  const index = new Map(inst.lazy!.addresses.map((a, i) => [a, i]))
  const ctx = lazyContext(inst, order)

  if (input.colors) {
    ctx.colors = input.colors(ctx.colors)
  }

  const space: LazySpace = ctx.space
  const at = (cell: number): number => index.get(space.address(cell)) ?? -1
  const pairs: { label: string; dense: SparseRun; lazy: LazyRun }[] = []

  for (const seed of SEEDS) {
    if (!rule.vacuumFixing && seed.background === 0) {
      continue
    }

    const denseCells = seed.positions.map(p => chain(inst, 0)[p])

    if (denseCells.some(c => c === undefined || inst.distance[c]! > inst.radius - 2)) {
      continue
    }

    const lazyCells = lazySeedCells(space, seed, 0)

    if (lazyCells.some((c, k) => at(c) !== denseCells[k])) {
      out.failures.push(`${inst.name}/${rule.name}/${order}: seed ${seed.key} placed differently`)
      continue
    }

    const dense = new SparseRun(inst.size, seed.background, inst.shell)
    const lazy = lazyRun(ctx, seed.background)

    denseCells.forEach((c, k) => dense.set(c!, seed.values[k]!))
    lazyCells.forEach((c, k) => lazy.set(c, seed.values[k]!))
    pairs.push({ label: `seed ${seed.key}`, dense, lazy })
  }

  const starts = lazyDamageStarts(ctx)
  const densePatch = Array.from(inst.distance.keys()).filter(v => inst.distance[v]! <= inst.patchRadius)

  if (starts.patch.map(at).join(',') !== densePatch.join(',')) {
    out.failures.push(`${inst.name}: the damage patch differs`)
  } else {
    starts.tones.forEach((tones, k) => {
      for (const site of starts.sites) {
        const at0 = starts.patch.indexOf(site)

        for (const delta of [1, 2]) {
          const dense = new SparseRun(inst.size, 0, inst.shell)
          const lazy = lazyRun(ctx, 0)

          starts.patch.forEach((c, i) => {
            if (tones[i] !== 0) {
              dense.set(at(c), tones[i]!)
              lazy.set(c, tones[i]!)
            }
          })

          const flipped = ((tones[at0]! + 1 + delta) % 3) - 1

          dense.set(at(site), flipped)
          lazy.set(site, flipped)
          pairs.push({ label: `damage ${k}:${site}:${delta}`, dense, lazy })
        }
      }
    })
  }

  for (const p of pairs) {
    out.runs++

    for (let t = 1; t <= SEED_ROUNDS; t++) {
      p.dense.round(rule, s)
      p.lazy.round(rule)

      if (p.dense.broken) {
        break
      }

      out.rounds++

      if (!sameState(p.dense, p.lazy, index)) {
        out.failures.push(`${inst.name}/${rule.name}/${order}: ${p.label} differs at round ${t}`)
        break
      }
    }

    out.coneExcess = Math.max(out.coneExcess, p.lazy.coneExcess)
  }

  if (!input.colors && rule.vacuumFixing) {
    const dense = harnessReading({ rule, instance: inst, order, dense: true })
    const lazy = harnessReading({ rule, instance: inst, order })
    const lazyByKey = new Map(lazy.seeds.map(x => [x.key, x]))

    for (const d of dense.seeds) {
      const l = lazyByKey.get(d.key)!
      const slice = (x: number[]): string => JSON.stringify(x.slice(0, d.exact + 1))

      out.trackRounds += d.exact

      if (
        slice(d.track.count) !== slice(l.track.count) ||
        slice(d.track.radius) !== slice(l.track.radius) ||
        slice(d.track.innerRadius) !== slice(l.track.innerRadius) ||
        slice(d.track.fill) !== slice(l.track.fill)
      ) {
        out.failures.push(`${inst.name}/${rule.name}/${order}: seed track ${d.key} differs`)
      }
    }
  }
}

export type CosetWindowRun = {
  tiling: TilingCheck[]
  negativeTiling: TilingCheck
  growth: GrowthCheck[]
  negativeGrowth: GrowthCheck
  crossCheck: TilingCheck[]
  colorings: { name: string; modulus: number; groupOrder: number; quotientTiles: number; rejected: number }[]
  scheduleFailures: string[]
  brokenColoringCaught: boolean
  comparison: Comparison
  droppedColorCaught: boolean
  reversedOrderCaught: boolean
  lightCone: { name: string; reach: number; held: number; ball: number }[]
  ties: number
  serialized: string
}

export function cosetWindow(): CosetWindowRun {
  const instances = openInstances().filter(i => i.lazy && COSET_LAZY_GEOMETRIES.has(i.column))
  const radiusOf = new Map(instances.map(i => [i.column, i.radius]))
  const tiling: TilingCheck[] = []
  const growth: GrowthCheck[] = []

  for (const symbol of [
    [7, 3],
    [8, 3],
    [4, 5],
    [3, 7],
    [4, 4],
    [3, 6],
  ] as const) {
    const name = `{${symbol[0]},${symbol[1]}}` as LabGeometryName
    const flat = (symbol[0] - 2) * (symbol[1] - 2) === 4
    const radius = flat ? FLAT_EXACT_RADIUS : radiusOf.get(name)!

    tiling.push(cosetAgainstExact({ name, symbol, radius }))
  }

  const closedForms: Record<string, (r: number) => number> = {
    '{4,4}': r => 2 * r * r + 2 * r + 1,
    '{3,6}': r => 1 + (3 * r * (r + 1)) / 2,
  }

  for (const inst of instances) {
    const [p, q] = inst.column.slice(1, -1).split(',').map(Number) as [number, number]
    const shells: number[] = []

    for (const d of inst.distance) {
      shells[d] = (shells[d] ?? 0) + 1
    }

    growth.push(
      growthCheck({
        name: inst.column,
        p,
        q,
        shells,
        ...(closedForms[inst.column] ? { closedForm: closedForms[inst.column]! } : {}),
      }),
    )
  }

  for (const [p, q] of [
    [5, 4],
    [6, 4],
  ] as const) {
    growth.push(growthCheck({ name: `{${p},${q}}`, p, q, shells: [] }))
  }

  const seventhree = instances.find(i => i.column === '{7,3}')!
  const sevenShells: number[] = []

  for (const d of seventhree.distance) {
    sevenShells[d] = (sevenShells[d] ?? 0) + 1
  }

  const negativeGrowth = growthCheck({
    name: '{7,4} automaton against {7,3}',
    p: 7,
    q: 3,
    shells: sevenShells,
    growthCoxeter: triangle(7, 4),
  })
  const negativeTiling = cosetAgainstExact({
    name: '{7,4} cosets against {7,3}',
    symbol: [7, 3],
    radius: 4,
    cosetCoxeter: triangle(7, 4),
  })
  const crossCheck = [foataCrossCheck([5, 4], 10), foataCrossCheck([6, 4], 8)]
  const colorings = instances.map(inst => {
    const [p, q] = inst.column.slice(1, -1).split(',').map(Number) as [number, number]
    const c = liftedColoring(new CosetTiling({ p, q }))

    return {
      name: inst.column,
      modulus: c.modulus,
      groupOrder: c.groupOrder,
      quotientTiles: c.quotientTiles,
      rejected: c.rejected.length,
    }
  })
  const scheduleFailures = instances.flatMap(scheduleCheck)

  // edges whose two tiles lie at one distance (q odd), oriented by the canonical order
  let ties = 0

  for (const inst of instances) {
    const m = inst.schedules.forward.schedule.matchings

    for (const flat of m) {
      for (let k = 0; k < flat.length; k += 2) {
        if (inst.distance[flat[k]!] === inst.distance[flat[k + 1]!]) {
          ties++
        }
      }
    }
  }

  const rules = pairRuleCensus().rules.map(r => harnessRule(r))
  const comparison: Comparison = {
    rounds: 0,
    runs: 0,
    failures: [],
    coneExcess: Number.NEGATIVE_INFINITY,
    trackRounds: 0,
  }

  for (const inst of instances) {
    for (const rule of rules.filter(r => r.vacuumFixing)) {
      for (const order of COLOR_ORDERS) {
        compareRuns({ inst, rule, order, out: comparison })
      }
    }
  }

  const interacting = rules.find(r => r.name === 'id.ABC.swap')!
  const swap = rules.find(r => r.name === 'swap.CBA.swap')!
  const dropped: Comparison = { rounds: 0, runs: 0, failures: [], coneExcess: 0, trackRounds: 0 }

  compareRuns({ inst: seventhree, rule: swap, order: 'forward', colors: c => c.slice(0, -1), out: dropped })

  const reversed: Comparison = { rounds: 0, runs: 0, failures: [], coneExcess: 0, trackRounds: 0 }

  compareRuns({
    inst: seventhree,
    rule: interacting,
    order: 'forward',
    colors: c => [...c].reverse(),
    out: reversed,
  })

  const lightCone = instances.map(inst => {
    const ctx = lazyContext(inst, 'forward')
    const run = lazyRun(ctx, 0)

    run.set(0, 1)

    for (let t = 0; t < SEED_ROUNDS; t++) {
      run.round(swap)
    }

    const reach = ctx.colors.length * SEED_ROUNDS

    return {
      name: inst.name,
      reach,
      held: ctx.space.cells(),
      ball: ctx.space.ballSize(reach),
    }
  })

  // the instance balls agree with a ball rebuilt from a fresh space (the canonical order does not depend on history)
  for (const inst of instances) {
    const space = inst.lazy!.makeSpace()

    space.neighbors(0)
    space.fromAddress(inst.lazy!.addresses[inst.size - 1]!)

    const ball = spaceBall(space, inst.radius, Number.POSITIVE_INFINITY)!

    if (ball.cells.map(c => space.address(c)).join('|') !== inst.lazy!.addresses.join('|')) {
      scheduleFailures.push(`${inst.name}: the canonical order depends on the order tiles were made`)
    }
  }

  const serialized = JSON.stringify({
    tiling,
    growth,
    crossCheck,
    colorings,
    comparison: { rounds: comparison.rounds, runs: comparison.runs, failures: comparison.failures },
    lightCone,
    ties,
  })

  return {
    tiling,
    negativeTiling,
    growth,
    negativeGrowth,
    crossCheck,
    colorings,
    scheduleFailures,
    brokenColoringCaught: brokenColoring(),
    comparison,
    droppedColorCaught: dropped.failures.length > 0,
    reversedOrderCaught: reversed.failures.length > 0,
    lightCone,
    ties,
    serialized,
  }
}

export default experiment({
  id: 'computation/coset-window',
  code: 'E-CMP-0035',
  title:
    'lazy exact open windows for every tiling, q odd included: tiles as cosets named by exact matrices, distance by a canonical parent chain, a coloring lifted from a finite quotient',
  category: 'computation',
  substrates: ['{7,3}', '{8,3}', '{4,5}', '{3,7}', '{4,4}', '{3,6}'],
  depth: 'L2',
  paper: false,
  run() {
    const r = cosetWindow()
    const again = cosetWindow()
    const identicalBytes = r.serialized === again.serialized
    const findings = LAB_FILES.flatMap(f => scanSource(f, readFileSync(resolve(BASE, f), 'utf8')))
    const lightConeOk = r.comparison.coneExcess <= 0 && r.lightCone.every(x => x.held < x.ball / 100)
    const ok =
      r.tiling.every(t => t.ok) &&
      !r.negativeTiling.ok &&
      r.growth.every(g => g.ok) &&
      !r.negativeGrowth.ok &&
      r.crossCheck.every(t => t.ok) &&
      r.scheduleFailures.length === 0 &&
      r.brokenColoringCaught &&
      r.comparison.failures.length === 0 &&
      r.comparison.rounds > 0 &&
      r.droppedColorCaught &&
      r.reversedOrderCaught &&
      lightConeOk &&
      identicalBytes &&
      findings.length === 0
    const failures = [
      ...r.tiling.filter(t => !t.ok).map(t => `${t.name}: ${t.why}`),
      ...(r.negativeTiling.ok ? ['negative tiling passed'] : []),
      ...r.growth.filter(g => !g.ok).map(g => `${g.name}: ${g.why}`),
      ...(r.negativeGrowth.ok ? ['negative growth passed'] : []),
      ...r.crossCheck.filter(t => !t.ok).map(t => `${t.name}: ${t.why}`),
      ...r.scheduleFailures,
      ...(r.brokenColoringCaught ? [] : ['broken coloring passed']),
      ...r.comparison.failures,
      ...(r.droppedColorCaught ? [] : ['dropped color passed']),
      ...(r.reversedOrderCaught ? [] : ['reversed color order passed']),
      ...(lightConeOk ? [] : ['light cone']),
      ...(identicalBytes ? [] : ['bytes differ']),
      ...findings.map(f => `${f.file}:${f.line}`),
    ]

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the coset tilings are exact lazy windows: for {7,3}, {8,3}, {4,5}, {3,7}, {4,4} and {3,6} the tiles named by exact minimal-representative matrices equal the exact chamber balls tile for tile with equal distances, the small-root automaton matches Steinberg growth and every ball shell, {5,4} and {6,4} built this way are the Foata tilings, the lifted colorings are perfect matchings of the infinite tiling, every lazy run equals the dense run on the ball cell for cell over every exact round for the 8 vacuum-fixing rules under both color orders, and no run leaves its light cone',
      metrics: {
        tilings: r.tiling.length,
        tilingsExact: r.tiling.filter(t => t.ok).length,
        tilesCompared: r.tiling.reduce((s, t) => s + t.cells, 0),
        growthChecks: r.growth.length,
        growthExact: r.growth.filter(g => g.ok).length,
        foataTilesCompared: r.crossCheck.reduce((s, t) => s + t.cells, 0),
        scheduleFailures: r.scheduleFailures.length,
        tiedPairs: r.ties,
        runsCompared: r.comparison.runs,
        roundsCompared: r.comparison.rounds,
        trackRoundsCompared: r.comparison.trackRounds,
        equalityFailures: r.comparison.failures.length,
        coneExcess: r.comparison.coneExcess,
        maxHeld: Math.max(...r.lightCone.map(x => x.held)),
        identicalBytes: identicalBytes ? 1 : 0,
        randomFindings: findings.length,
      },
      control: {
        brokenTilingRejected: r.negativeTiling.ok ? 0 : 1,
        brokenGrowthRejected: r.negativeGrowth.ok ? 0 : 1,
        brokenColoringRejected: r.brokenColoringCaught ? 1 : 0,
        droppedColorRejected: r.droppedColorCaught ? 1 : 0,
        reversedOrderRejected: r.reversedOrderCaught ? 1 : 0,
      },
      notes:
        `L2 infrastructure gate: the M1 harness reads open cells of these geometries on the coset tilings. Exact balls compared: ${r.tiling.map(t => `${t.name} r${t.radius} ${t.cells}`).join(', ')}. Colorings lifted from quotients: ${r.colorings.map(c => `${c.name} mod ${c.modulus} order ${c.groupOrder} (${c.quotientTiles} tiles)`).join(', ')}. Automaton states: ${r.growth.map(g => `${g.name} ${g.states} (${g.smallRoots} small roots)`).join(', ')}. Light cone, cells held by one 24-round full-swap run against the ball of radius c T: ${r.lightCone.map(x => `${x.name} ${x.held} of ${x.ball.toExponential(2)}`).join(', ')}. ${ok ? '' : `Failures: ${failures.slice(0, 12).join('; ')}`}`.trim(),
    })
  },
})
