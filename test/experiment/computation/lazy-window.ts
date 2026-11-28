// Lazy open windows for the M1 lab (item vibe-computation-models-0028, decision 003's limit). No materialized ball
// reaches the a-priori window c T + r0 on a hyperbolic tiling (shells grow 1.6 to 18 times per hop), so the harness reads
// the open cells on the infinite tiling itself, grown only where a run's excitation is: right-angled tile groups by
// Foata normal forms ({5,4}, {6,4}, {3,4,3,4}, right-angled-tiling.ts) and the flat lattices of their degree-matched
// controls ({6,3} as A2, {3,4,3,3} as D4, lazy-lattice.ts), with the schedule defined on the infinite tiling (the
// generators of the tile group, the step parities of the lattice), so it needs no finite ball. This experiment proves
// that machinery before E-CMP-0027 reads with it.
//
// Gates, each able to fail:
// - tiling: the lazy ball of each right-angled tile group equals the exact chamber-tiling ball (E-CMP-0029) at the
//   radius the harness uses ({5,4} 10, {6,4} 8, {3,4,3,4} 3): the generator-labelled breadth-first map from the exact
//   ball's slot table onto lazy tiles is a bijection that keeps every slot edge, and the shells agree; its growth
//   series (cliques of commuting generators) equals Steinberg's (system-growth.ts) and the ball shells. Lattices:
//   breadth-first distances on the lazy ball equal the closed forms, ball sizes equal the closed forms and the float
//   lattice's shells (lab-geometry.ts).
// - schedule: on every materialized ball each color is a matching, the colors cover every edge once, every cell inside
//   the shell is matched in every color (a perfect matching of the infinite tiling), and every pair's first cell is the
//   shorter tile (groups) or the -r end (lattices).
// - lazy equals dense: for every vacuum-fixing rule, both color orders, every seed the ball holds and every open damage
//   start, the lazy run and the dense run on the ball (with the same schedule restricted to it) hold the same state,
//   cell for cell, at every round the dense run calls exact; seed tracks agree byte for byte over those rounds.
// - light cone: no lazy run reaches a cell beyond r0 + c t, and a 24-round full-swap run from one cell holds under 1% of
//   the ball of radius c T (it holds about c T cells, its own path and the partners it looked up).
// - two runs give identical bytes, and no file draws a random number.
// Negative controls the gates must reject: a {5,4} group with one commuting pair made free (the tiling gate), a D4
// coloring split by a coordinate where the step is even (the matching gate), a lazy run with its last color dropped and
// one with its colors in reversed order against the forward dense schedule (the equality gate). No orientation control:
// every vacuum-fixing rule commutes with the swap, so no open run can see the orientation.

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
import {
  LazyRun,
  LazySpace,
  latticeSpace,
  rightAngledSpace,
  spaceBall,
} from '@/code/compute/lab/lazy-space'
import { pairRuleCensus } from '@/code/rule/pair-rule'
import { checkSchedule } from '@/code/rule/partition-schedule'
import { tilingSystem, ChamberComplex } from '@/code/substrate/coxeter/chamber-tiling'
import { latticeBall } from '@/code/substrate/coxeter/lazy-lattice'
import { rightAngledGrowth } from '@/code/substrate/coxeter/right-angled-tiling'
import { systemGrowthSeries } from '@/code/substrate/coxeter/system-growth'
import { labGeometry } from '@/code/substrate/lab-geometry'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const LAB_FILES = [
  'code/substrate/coxeter/right-angled-tiling.ts',
  'code/substrate/coxeter/lazy-lattice.ts',
  'code/compute/lab/lazy-space.ts',
  'code/compute/lab/harness.ts',
  'test/experiment/computation/lazy-window.ts',
]
const GROWTH_TERMS = 40

// ---- tiling ----

type TilingCheck = { name: string; radius: number; cells: number; ok: boolean; why: string }

// The exact chamber ball (J empty, so its slot table labels every edge by its generator) mapped onto a lazy space by
// breadth-first search along generators: a bijection keeping every slot edge proves the two graphs equal.
function groupAgainstExact(input: {
  name: string
  coxeter: readonly (readonly number[])[]
  exactCoxeter: readonly (readonly number[])[]
  symbol: readonly number[]
  radius: number
}): TilingCheck {
  const system = tilingSystem(input.symbol, 'tile')!
  const complex = new ChamberComplex({ system: { ...system, coxeter: input.exactCoxeter } })
  const ball = complex.tileBall({ radius: input.radius })
  const slots = complex.slotTable(ball)
  const rank = system.coxeter.length
  const space = rightAngledSpace({ name: input.name, coxeter: input.coxeter })
  const n = ball.tiles.length
  const map = new Int32Array(n).fill(-1)
  const used = new Map<number, number>()
  const queue = [0]
  const fail = (why: string): TilingCheck => ({
    name: input.name,
    radius: input.radius,
    cells: n,
    ok: false,
    why,
  })

  map[0] = 0
  used.set(0, 0)

  for (const i of queue) {
    for (let g = 0; g < rank; g++) {
      const j = slots[i * rank + g]!

      if (j < 0) {
        continue
      }

      const lazy = space.partner(g, map[i]!)

      if (map[j]! < 0) {
        if (used.has(lazy)) {
          return fail(`two exact tiles map to one lazy tile (${j})`)
        }

        map[j] = lazy
        used.set(lazy, j)
        queue.push(j)
      } else if (map[j] !== lazy) {
        return fail(`slot ${g} of exact tile ${i} leads elsewhere on the lazy side`)
      }
    }
  }

  if (queue.length !== n) {
    return fail('the map does not reach every exact tile')
  }

  const lazyBall = spaceBall(space, input.radius, Number.POSITIVE_INFINITY)!
  const shells: number[] = []

  for (const d of lazyBall.distance) {
    shells[d] = (shells[d] ?? 0) + 1
  }

  if (lazyBall.cells.length !== n || shells.join(',') !== ball.shellSizes.join(',')) {
    return fail(`shells ${shells.join(',')} against ${ball.shellSizes.join(',')}`)
  }

  for (let i = 0; i < n; i++) {
    if (space.distance(map[i]!) !== ball.distance[i]) {
      return fail(`tile ${i}: word length ${space.distance(map[i]!)} against distance ${ball.distance[i]}`)
    }
  }

  const growth = rightAngledGrowth(input.coxeter, GROWTH_TERMS)
  const steinberg = systemGrowthSeries(input.coxeter, GROWTH_TERMS)

  if (growth.join(',') !== steinberg.join(',')) {
    return fail('the clique growth series differs from Steinberg')
  }

  if (shells.some((s, r) => BigInt(s) !== growth[r])) {
    return fail('the ball shells differ from the growth series')
  }

  return { name: input.name, radius: input.radius, cells: n, ok: true, why: '' }
}

function latticeAgainstForms(kind: 'a2' | 'd4', column: '{6,3}' | '{3,4,3,3}', radius: number): TilingCheck {
  const space = latticeSpace({ name: kind, kind })
  const ball = spaceBall(space, radius, Number.POSITIVE_INFINITY)!
  const n = ball.cells.length
  const dist = new Int32Array(n).fill(-1)
  const queue = [0]
  const fail = (why: string): TilingCheck => ({ name: kind, radius, cells: n, ok: false, why })

  dist[0] = 0

  for (const u of queue) {
    for (const w of ball.neighbors[u]!) {
      if (dist[w]! < 0) {
        dist[w] = dist[u]! + 1
        queue.push(w)
      }
    }
  }

  for (let i = 0; i < n; i++) {
    if (dist[i] !== ball.distance[i]) {
      return fail(`cell ${i}: breadth-first ${dist[i]} against the closed form ${ball.distance[i]}`)
    }
  }

  for (let r = 0; r <= radius; r++) {
    const inside = Array.from(ball.distance).filter(d => d <= r).length

    if (inside !== latticeBall(kind, r) || inside !== space.ballSize(r)) {
      return fail(`ball ${r}: ${inside} cells against ${latticeBall(kind, r)}`)
    }
  }

  // the float lattice's own shells (the D4 ball is a large build, so a smaller radius)
  const floatRadius = kind === 'a2' ? radius : Math.min(radius, 4)
  const floatShells = labGeometry({ name: column, radius: floatRadius }).shellSizes

  for (let r = 0; r <= floatRadius; r++) {
    if (latticeBall(kind, r) - (r > 0 ? latticeBall(kind, r - 1) : 0) !== floatShells[r]) {
      return fail(`shell ${r}: closed form against the float lattice ${floatShells[r]}`)
    }
  }

  return { name: kind, radius, cells: n, ok: true, why: '' }
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
      matched[m[k]!] = 1
      matched[m[k + 1]!] = 1

      // groups: the shorter tile first (lattice pairs run along +r, which the equality gate reads)
      if (
        inst.curvature === 'hyperbolic' &&
        inst.distance[m[k]!]! >= inst.distance[m[k + 1]!]!
      ) {
        out.push(`${inst.name}: color ${c} pair ${m[k]} ${m[k + 1]} first is farther`)
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

// A D4 coloring split by a coordinate where the step is even: both ends share the parity, so a cell can sit in two pairs.
function brokenD4Coloring(): boolean {
  const space = latticeSpace({ name: 'd4', kind: 'd4' })
  const ball = spaceBall(space, 3, Number.POSITIVE_INFINITY)!
  const r = [1, 1, 0, 0]
  const at = new Map(ball.cells.map((c, i) => [space.address(c), i]))
  const flat: number[] = []

  ball.cells.forEach((c, i) => {
    const x = space.address(c).split(',').map(Number)

    if (((x[2]! % 2) + 2) % 2 === 0) {
      const j = at.get(x.map((v, k) => v + r[k]!).join(','))

      if (j !== undefined) {
        flat.push(i, j)
      }
    }
  })

  const check = checkSchedule({
    schedule: {
      size: ball.cells.length,
      matchings: [Int32Array.from(flat)],
      method: 'generator-coloring',
      colorCount: 1,
      colorOrder: [0],
      orientation: 'broken',
    },
    neighbors: ball.neighbors,
  })

  return !check.everyColorIsMatching
}

// ---- lazy equals dense ----

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
  // a sabotage for the negative controls
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

  // seed tracks of the readings, byte for byte over the dense exact rounds
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

export type LazyWindowRun = {
  tiling: TilingCheck[]
  negativeTiling: TilingCheck
  scheduleFailures: string[]
  brokenColoringCaught: boolean
  comparison: Comparison
  droppedColorCaught: boolean
  reversedOrderCaught: boolean
  lightCone: { name: string; reach: number; held: number; ball: number }[]
  serialized: string
}

export function lazyWindow(): LazyWindowRun {
  const tiling: TilingCheck[] = []

  for (const [symbol, radius] of [
    [[5, 4], 10],
    [[6, 4], 8],
    [[3, 4, 3, 4], 3],
  ] as const) {
    const system = tilingSystem(symbol, 'tile')!

    tiling.push(
      groupAgainstExact({
        name: system.name,
        coxeter: system.coxeter,
        exactCoxeter: system.coxeter,
        symbol,
        radius,
      }),
    )
  }

  tiling.push(latticeAgainstForms('a2', '{6,3}', 40), latticeAgainstForms('d4', '{3,4,3,3}', 7))

  // negative control: one commuting pair of {5,4} made free
  const five = tilingSystem([5, 4], 'tile')!
  const broken = five.coxeter.map((row, i) =>
    row.map((m, j) => ((i === 0 && j === 1) || (i === 1 && j === 0) ? Number.POSITIVE_INFINITY : m)),
  )
  const negativeTiling = groupAgainstExact({
    name: 'broken {5,4}',
    coxeter: broken,
    exactCoxeter: five.coxeter,
    symbol: [5, 4],
    radius: 4,
  })

  // the coset tilings (q odd, ties in the orientation) have their own gate, E-CMP-0035
  const instances = openInstances().filter(i => i.lazy && !COSET_LAZY_GEOMETRIES.has(i.column))
  const scheduleFailures = instances.flatMap(scheduleCheck)
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

  // negative controls of the equality gate, on {5,4}
  const five54 = instances.find(i => i.column === '{5,4}')!
  // every vacuum-fixing rule commutes with the swap (plan 1.1), so no open run sees the orientation; the second
  // control is a color-order mismatch instead, on an interacting class
  const interacting = rules.find(r => r.name === 'id.ABC.swap')!
  const swap = rules.find(r => r.name === 'swap.CBA.swap')!
  const dropped: Comparison = { rounds: 0, runs: 0, failures: [], coneExcess: 0, trackRounds: 0 }

  compareRuns({ inst: five54, rule: swap, order: 'forward', colors: c => c.slice(0, -1), out: dropped })

  const reversed: Comparison = { rounds: 0, runs: 0, failures: [], coneExcess: 0, trackRounds: 0 }

  compareRuns({
    inst: five54,
    rule: interacting,
    order: 'forward',
    colors: c => [...c].reverse(),
    out: reversed,
  })

  // light cone: cells a 24-round seed run holds against the ball of radius r0 + c T
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

  const serialized = JSON.stringify({
    tiling,
    comparison: { rounds: comparison.rounds, runs: comparison.runs, failures: comparison.failures },
    lightCone,
  })

  return {
    tiling,
    negativeTiling,
    scheduleFailures,
    brokenColoringCaught: brokenD4Coloring(),
    comparison,
    droppedColorCaught: dropped.failures.length > 0,
    reversedOrderCaught: reversed.failures.length > 0,
    lightCone,
    serialized,
  }
}

export default experiment({
  id: 'computation/lazy-window',
  code: 'E-CMP-0032',
  title:
    'lazy exact open windows: right-angled tile groups and flat lattices grown where the excitation is, with a schedule defined on the infinite tiling',
  category: 'computation',
  substrates: ['{5,4}', '{6,4}', '{3,4,3,4}', '{6,3}', '{3,4,3,3}'],
  depth: 'L2',
  paper: false,
  run() {
    const r = lazyWindow()
    const again = lazyWindow()
    const identicalBytes = r.serialized === again.serialized
    const findings = LAB_FILES.flatMap(f => scanSource(f, readFileSync(resolve(BASE, f), 'utf8')))
    const tilingOk = r.tiling.every(t => t.ok)
    const lightConeOk = r.comparison.coneExcess <= 0 && r.lightCone.every(x => x.held < x.ball / 100)
    const ok =
      tilingOk &&
      !r.negativeTiling.ok &&
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
        'the lazy open windows are exact: the right-angled tile groups of {5,4}, {6,4} and {3,4,3,4} grown by Foata normal forms equal the exact chamber-tiling balls and Steinberg growth, the A2 and D4 lattices equal their closed forms, the generator and step-parity colorings are perfect matchings of the infinite tiling, every lazy run equals the dense run on the ball cell for cell over every exact round for the 8 vacuum-fixing rules under both color orders, and no run leaves its light cone',
      metrics: {
        tilings: r.tiling.length,
        tilingsExact: r.tiling.filter(t => t.ok).length,
        tilesCompared: r.tiling.reduce((s, t) => s + t.cells, 0),
        scheduleFailures: r.scheduleFailures.length,
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
        brokenColoringRejected: r.brokenColoringCaught ? 1 : 0,
        droppedColorRejected: r.droppedColorCaught ? 1 : 0,
        reversedOrderRejected: r.reversedOrderCaught ? 1 : 0,
      },
      notes:
        `L2 infrastructure gate (item vibe-computation-models-0028): the M1 harness reads open cells of these geometries on the lazy tilings. Light cone, cells held by one 24-round full-swap run against the ball of radius c T: ${r.lightCone.map(x => `${x.name} ${x.held} of ${x.ball.toExponential(2)}`).join(', ')}. {7,3}, {8,3}, {4,5}, {3,7} (q odd) and the flat partners {4,4}, {3,6} have no right-angled tile group here and read on the coset lazy windows E-CMP-0035 gates. This gate builds the dense ball from the same lazy space, so it proves the sparse loop equals the dense loop on one schedule; adjacency is checked against the chamber complex, orientation and the coloring choice are not (M1 audit, minor 4). The ball-size check against the closed form compares latticeBall with the space ballSize, which is latticeBall itself (minor 7), so only the tile count against the closed form is independent. ${ok ? '' : `Failures: ${failures.slice(0, 12).join('; ')}`}`.trim(),
    })
  },
})
