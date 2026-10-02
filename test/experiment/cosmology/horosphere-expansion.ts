// EXPANSION AS HOROSPHERE COUNTING (E-CSM-0060, OPEN-CSM-02, routes I2a, I7a, I12a, I2d). The husk is the cusp layer of
// one ideal vertex of the true {3,4,3,4} mesh, a horosphere (E-CSM-0058). Route I2a reads expansion as the husk stepping
// down one horosphere of the family about that cusp each beat: if the dock count between two fixed bulk geodesics grows
// by a constant ratio R per layer, the husk has a constant Hubble rate H = ln(R) / 3 per beat (a 3d husk, so the count
// is a^3) and w = -1. This file counts the layers exactly.
//
// WHAT IS COUNTED. Two kinds of layer, both read on the same window. The window is one fundamental domain of the cusp's
// translations (one cube of the husk's cubic lattice, horizontal chart coordinates in [-1/2, 1/2)^3), so the docks in
// it are the docks between the fixed vertical bulk geodesics through its corners, which is the route's "count docks
// between two fixed bulk geodesics", made exact by periodicity.
//  (A) THE HOROSPHERES. The level of a cell is -<center, v>, v the cusp's null vector, over the husk's (1 on the husk).
//      The Busemann distance below the husk is ln(level). Layer t is the t-th distinct level of cell centers below the
//      husk, and k_t the window's cells at that level.
//  (B) THE GRAPH DEPTH. Layer d is the cells d steps below the husk (code/substrate/coxeter/labelled-region cuspRegion),
//      n_d per window. These do not lie on one horosphere; they are the rule's own notion of "one beat down".
//  CONTROL. Concentric spheres about a dock: the bulk ball's shells, which grow by the known exponential rate near
//  18.278 (E-GMT-0027, CANONICAL_SHELLS).
//
// DERIVED BEFORE THE GATE RUN.
// 1. NO SYMMETRY MAKES THE LAYERS SELF-SIMILAR. The stabilizer of a cusp in a discrete group of isometries is
//    parabolic (here the {4,3,4} group of the husk): a discrete group cannot hold a loxodromic element fixing a
//    parabolic fixed point. So no isometry of the mesh carries one horosphere about the cusp to another, and nothing in
//    the mesh forces k_{t+1} / k_t to be one constant. A constant ratio could only appear as a limit.
// 2. THE VOLUME LAW. In the upper half-space picture with the cusp at infinity, the window above height z has volume
//    s^3 / (3 z^3), so the cells with level at most L grow as L^3 per window (the mesh's cells all have one volume,
//    4 pi^2 / 3 for the ideal 24-cell). The count is a power of the level, not an exponential, so on layers spaced
//    evenly in level the ratio tends to 1.
// 3. THE TWO READINGS OF A SCALE FACTOR. The horospherical distance between two fixed vertical geodesics on the
//    horosphere at level l is l times its value on the husk, so the geometric scale factor of layer t is its level.
//    The count reading takes a^3 proportional to k_t.
//
// PROBE BEFORE THE GATES, DISCLOSED (tmp/hx-probe1.ts, tmp/hx-probe1.log, 4 s). Levels to 11, window margin 1.5, and
//  the graph depth to 2 at skin 2: the center levels were 1, 3, 5, 7, 9, 11 with window counts 1, 12, 30, 56, 108, 132,
//  and the graph-depth counts 1, 18, 330 (depth 1 at levels 3 and 5, depth 2 at levels 5 to 29). So the probe already
//  showed the route's constant ratio failing on both readings at small depth. The gate run extends the levels to 33
//  and the depth to 3, which the probe did not see, and holds the route to its own words.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: no inconsistent step in any region; every center level within 1e-9 of an integer; the window counts
//     per level to 33 agree between a region of level 33 and margin 1.5 and a region of level 37 and margin 2 (so no
//     cell was missed by the cut); the graph-depth window counts to depth 3 agree between skin 2 and skin 3.
//  C1 CONTROL: the bulk ball's shells to radius 4 are 1, 24, 456, 8376, 153192, and the last ratio is within 1e-3
//     relative of 18.278 (concentric spheres grow by the known exponential rate, and are themselves not one ratio from
//     the start: 24, 19, then 18.37, 18.29).
//  H1 THE ROUTE (I2a): the ratio k_{t+1} / k_t is one constant for the horosphere layers t = 0 .. 8 (levels 1 to the
//     ninth level), and, under reading (B), n_{d+1} / n_d is one constant for d = 0 .. 2. Exact rationals.
//  P  THE FALSIFIER: the ratio varies with depth on the horosphere layers. Expected from points 1 and 2 and seen in the
//     probe.
//  D1 (written from the probe, and disclosed as such): the center levels below the husk are exactly the odd integers
//     1, 3, 5, ..., 33, each occupied. Then the hyperbolic gap between layers t and t + 1 is ln((2t + 3) / (2t + 1)),
//     which falls as 1 / t.
//  H2 THE READING, not gated, stated so it cannot be read into the counts: IF H1 held, H = ln(R) / 3 per beat and
//     w = -1. If H1 fails, the reading is reported as what the counts give: the geometric scale factor of layer t is
//     its level, and under D1 that is 2t + 1, so a grows linearly in beats, H_t = ln((2t + 3) / (2t + 1)) falls as
//     1 / t, and a linear a has w = -1/3 (a coasting universe), not -1; the count reading gives a^3 proportional to
//     k_t, whose growth exponent in t is read.
// VERDICT, fixed before the run: FAIL (as derived) when I1, C1 hold and P holds (H1 fails on the horosphere layers);
//  PASS when I1, C1 and H1 hold; PARTIAL otherwise.
// WHAT THIS CAN AND CANNOT SHOW. H1 is combinatorics of the mesh. H2 is a reading of what a beat of the husk is. The
//  ledger rows move only as far as that reading is accepted, and nothing here runs the rule: a pass would not show that
//  the RULE expands anything, and a fail rules out only the reading "one horosphere of the mesh a beat".
//
// FIRST RUN 2026-10-01 (tmp/hx-csm-run1.log, 257 s): FAIL as derived, every gate as registered, none moved or rerun.
//  I1: 0 inconsistent steps, every level an integer, window counts equal between the 214,893-cell and the 725,816-cell
//  regions to level 33, and between skin 2 (165,107 cells) and skin 3 (412,401) to depth 3. C1: shells 1, 24, 456,
//  8376, 153192, last ratio 18.2894. D1: the levels are exactly the odd integers 1 .. 33. H1 fails on both readings, P
//  holds. Window counts per level: 1, 12, 30, 56, 108, 132, 182, 360, 306, 380, 672, 552, 750, 972, 870, 992, 1584 (not
//  monotone: 360 at 15, 306 at 17); the cumulative count over L^3 falls 1, 0.48, 0.34, ... to 0.2215 at 33; the count
//  grows as t^2.05 over the last half, so the count reading gives a ~ t^0.68, near the dust law t^(2/3), and the
//  geometric reading a = 2t + 1. Hyperbolic gaps between layers 1.0986, 0.5108, 0.3365, ... 0.1112, falling as 1/t.
//  Graph depth: 1, 18, 330, 6034 per cusp cell, ratios 18, 18.333, 18.285, so a constant H = ln(18.28) / 3 = 0.97 per
//  beat appears only as the limit of the graph-depth layers, whose depth-3 cells spread over levels 7 to 169.
//
// Depth L1: exact counts on the true mesh against a derived prediction; no rule is run.
// DETERMINISM: the mesh and its regions are fixed; no start, no random number.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  buildHyperbolicBall,
  labelledCoin,
  type LabelledCoin,
} from '@/code/substrate/coxeter/label-transport'
import {
  buildLabelledRegion,
  cuspRegion,
} from '@/code/substrate/coxeter/labelled-region'
import { horosphericalChart } from '@/code/measure/hyperbolic-lines'
import { identity, matVec } from '@/code/substrate/coxeter/minkowski'
import { CANONICAL_SHELLS } from '@/code/substrate/mesh-unfolding'

export type HoroPlan = {
  level: number
  margin: number
  checkLevel: number
  checkMargin: number
  depth: number
  skin: number
  checkSkin: number
  ballRadius: number
  layers: number
}

export const GATE_PLAN: HoroPlan = {
  level: 33,
  margin: 1.5,
  checkLevel: 37,
  checkMargin: 2,
  depth: 3,
  skin: 2,
  checkSkin: 3,
  ballRadius: 4,
  layers: 9,
}

const inWindow = (x: readonly number[]): boolean =>
  x.every(v => v >= -0.5 - 1e-9 && v < 0.5 - 1e-9)

// the window's cells per integer level, from a region of every cell with level at most `level` and horizontal chart
// position within `margin` of the base cell
function levelCounts(
  coin: LabelledCoin,
  level: number,
  margin: number,
): { counts: Map<number, number>; cells: number; inconsistent: number; offInteger: number } {
  const chart = horosphericalChart(coin)
  const c0 = coin.frame.center
  const region = buildLabelledRegion({
    coin,
    seeds: [identity(c0.length)],
    radius: 1_000_000,
    accept: g => {
      const p = matVec(g, c0)

      if (chart.level(p) / chart.layerLevel > level + 1e-9) {
        return false
      }

      return chart.coordinates(p).every(v => Math.abs(v) <= margin)
    },
  })
  const counts = new Map<number, number>()

  let offInteger = 0

  for (const g of region.frames) {
    const p = matVec(g, c0)
    const l = chart.level(p) / chart.layerLevel
    const k = Math.round(l)

    if (Math.abs(l - k) > 1e-9) {
      offInteger++
    }

    if (inWindow(chart.coordinates(p))) {
      counts.set(k, (counts.get(k) ?? 0) + 1)
    }
  }

  return {
    counts,
    cells: region.cells,
    inconsistent: region.inconsistentSteps,
    offInteger,
  }
}

function depthCounts(
  coin: LabelledCoin,
  skin: number,
  depth: number,
): { counts: number[]; levels: Map<number, number>[]; cells: number; inconsistent: number } {
  const r = cuspRegion({ coin, skin, depth })
  const counts = new Array<number>(depth + 1).fill(0)
  const levels = Array.from({ length: depth + 1 }, () => new Map<number, number>())

  for (let x = 0; x < r.cells; x++) {
    if (!inWindow(r.husk[x]!)) {
      continue
    }

    const d = r.depth[x]!
    const k = Math.round(r.levelRatio[x]!)

    counts[d] = (counts[d] ?? 0) + 1
    levels[d]!.set(k, (levels[d]!.get(k) ?? 0) + 1)
  }

  return { counts, levels, cells: r.cells, inconsistent: r.inconsistentSteps }
}

// a / b = c / d as integers
const sameRatio = (a: number, b: number, c: number, d: number): boolean =>
  BigInt(a) * BigInt(d) === BigInt(b) * BigInt(c)

export function horosphereExpansionRun(plan: HoroPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const coin = labelledCoin()

  // ---- C1: concentric spheres ----
  const ball = buildHyperbolicBall({ coin, radius: plan.ballRadius })
  const shells = new Array<number>(plan.ballRadius + 1).fill(0)

  for (const d of ball.distance) {
    shells[d] = (shells[d] ?? 0) + 1
  }

  const shellRatios = shells.slice(1).map((n, i) => n / shells[i]!)
  const lastShellRatio = shellRatios[shellRatios.length - 1]!
  const c1 =
    shells.every((n, r) => n === CANONICAL_SHELLS[r]) &&
    Math.abs(lastShellRatio / 18.278 - 1) < 1e-3

  log('ball')

  // ---- (A) horosphere layers ----
  const main = levelCounts(coin, plan.level, plan.margin)

  log('levels')

  const check = levelCounts(coin, plan.checkLevel, plan.checkMargin)

  log('levels check')

  const levels = [...main.counts.keys()].sort((a, b) => a - b)
  const levelsAgree = levels.every(
    l => l > plan.level || main.counts.get(l) === check.counts.get(l),
  )
  const odd = Array.from({ length: (plan.level + 1) / 2 }, (_, i) => 2 * i + 1)
  const d1 =
    levels.length === odd.length && levels.every((l, i) => l === odd[i])
  const k = levels.map(l => main.counts.get(l)!)

  // ---- (B) graph depth ----
  const depth = depthCounts(coin, plan.skin, plan.depth)

  log('depth')

  const depthCheck = depthCounts(coin, plan.checkSkin, plan.depth)

  log('depth check')

  const depthAgree = depth.counts.every((n, d) => n === depthCheck.counts[d])

  const i1 =
    main.inconsistent === 0 &&
    check.inconsistent === 0 &&
    depth.inconsistent === 0 &&
    depthCheck.inconsistent === 0 &&
    main.offInteger === 0 &&
    check.offInteger === 0 &&
    levelsAgree &&
    depthAgree

  // ---- H1 ----
  const kLayers = k.slice(0, plan.layers)
  const horoConstant = kLayers
    .slice(2)
    .every((_, i) => sameRatio(kLayers[i + 2]!, kLayers[i + 1]!, kLayers[1]!, kLayers[0]!))
  const n = depth.counts
  const depthConstant = n
    .slice(2)
    .every((_, i) => sameRatio(n[i + 2]!, n[i + 1]!, n[1]!, n[0]!))
  const h1 = horoConstant && depthConstant
  const p = !horoConstant

  const status = i1 && c1 && p ? 'fail' : i1 && c1 && h1 ? 'pass' : 'partial'

  // ---- READ ----
  const ratios = k.slice(1).map((v, i) => v / k[i]!)
  const depthRatios = n.slice(1).map((v, i) => v / n[i]!)

  let cumulative = 0

  const cubic = levels.map((l, i) => {
    cumulative += k[i]!

    return cumulative / l ** 3
  })
  // the count reading: a^3 ~ k_t, fit k_t ~ t^e on the last half of the layers
  const half = Math.floor(levels.length / 2)
  const xs = levels.slice(half).map((_, i) => Math.log(half + i))
  const ys = k.slice(half).map(v => Math.log(v))
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length
  const my = ys.reduce((a, b) => a + b, 0) / ys.length
  const exponent =
    xs.reduce((a, x, i) => a + (x - mx) * (ys[i]! - my), 0) /
    xs.reduce((a, x) => a + (x - mx) ** 2, 0)
  const hubble = levels.slice(0, plan.layers).map((l, i) =>
    i + 1 < levels.length ? Math.log(levels[i + 1]! / l) : NaN,
  )

  const metrics: Record<string, number> = {
    gate_I1: i1 ? 1 : 0,
    gate_C1: c1 ? 1 : 0,
    gate_H1: h1 ? 1 : 0,
    gate_P: p ? 1 : 0,
    gate_D1: d1 ? 1 : 0,
    horoConstant: horoConstant ? 1 : 0,
    depthConstant: depthConstant ? 1 : 0,
    levelCells: main.cells,
    levelCheckCells: check.cells,
    depthCells: depth.cells,
    depthCheckCells: depthCheck.cells,
    countExponent: exponent,
    lastShellRatio,
    ...Object.fromEntries(levels.map((l, i) => [`k_level${l}`, k[i]!])),
    ...Object.fromEntries(n.map((v, d) => [`n_depth${d}`, v])),
    ...Object.fromEntries(levels.map((l, i) => [`cumOverL3_level${l}`, cubic[i]!])),
    seconds: (Date.now() - started) / 1000,
  }

  return verdict({
    status,
    claim: `${p ? 'the husk does not step down a constant-ratio family of horospheres' : 'the horosphere layers were counted'}: below a cusp of the true {3,4,3,4} mesh the cell centers lie on the horospheres at levels ${levels.slice(0, 6).join(', ')}, ..., ${levels[levels.length - 1]} (${d1 ? 'exactly the odd integers' : 'not the odd integers'}), with ${k.slice(0, plan.layers).join(', ')} docks per cusp cell on the first ${plan.layers}, ratios ${ratios.slice(0, plan.layers - 1).map(r => r.toFixed(3)).join(', ')}, falling toward 1 as the level grows (the cumulative count is ${cubic[cubic.length - 1]!.toFixed(4)} L^3 at level ${levels[levels.length - 1]}), while the graph-depth layers hold ${n.join(', ')} per cusp cell (ratios ${depthRatios.map(r => r.toFixed(4)).join(', ')}) and the concentric control ${shells.join(', ')}; so "one horosphere of the mesh a beat" gives a scale factor growing as the level, 2t + 1, H falling as 1 / t and w = -1/3, not a constant H and w = -1, and a constant ratio appears only for a fixed Busemann step chosen by hand or asymptotically on the graph-depth layers, which are not horospheres`,
    metrics,
    control: {
      shellsCanonical: c1 ? 1 : 0,
      lastShellRatio,
      firstShellRatio: shellRatios[0]!,
    },
    notes: `L1. Gates I1 ${i1}, C1 ${c1}, H1 ${h1} (horosphere ${horoConstant}, depth ${depthConstant}), P ${p}, D1 ${d1}. Regions: level ${plan.level} margin ${plan.margin}, ${main.cells} cells; level ${plan.checkLevel} margin ${plan.checkMargin}, ${check.cells} cells (window counts agree to level ${plan.level}: ${levelsAgree}); depth ${plan.depth} at skin ${plan.skin}, ${depth.cells} cells, and skin ${plan.checkSkin}, ${depthCheck.cells} cells (agree: ${depthAgree}). Per level (level x count, ratio to the previous): ${levels.map((l, i) => `${l}x${k[i]}${i ? ` (${(k[i]! / k[i - 1]!).toFixed(4)})` : ''}`).join(', ')}. Hyperbolic gap between successive layers ln(l_{t+1} / l_t): ${hubble.filter(Number.isFinite).map(h => h.toFixed(4)).join(', ')}. Count reading: k_t grows as t^${exponent.toFixed(3)} over the last half (a^3 ~ k_t). Graph depth levels: ${depth.levels.map((m, d) => `d${d}: ${[...m.entries()].sort((a, b) => a[0] - b[0]).map(([l, c]) => `${l}x${c}`).join(' ')}`).join('; ')}. Bulk shell ratios ${shellRatios.map(r => r.toFixed(4)).join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'cosmology/horosphere-expansion',
  code: 'E-CSM-0060',
  title:
    'expansion as horosphere counting below a cusp of the true {3,4,3,4} mesh, fail as derived: the cell centers lie on the horospheres at exactly the odd levels 1, 3, 5, ..., 33, with 1, 12, 30, 56, 108, 132, 182, 360, 306 docks per cusp cell on the first nine (ratios 12 to 0.85, not one constant, and not even monotone), growing as t^2.05 with the cumulative count 0.22 L^3, as the volume law says; so one horosphere a beat gives a scale factor 2t + 1, H falling as 1/t and w = -1/3, not constant H and w = -1; the graph-depth layers (1, 18, 330, 6034, ratios 18, 18.33, 18.28) approach the bulk rate 18.28 but are not horospheres, and the concentric control reproduces 1, 24, 456, 8376, 153192',
  category: 'cosmology',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return horosphereExpansionRun(GATE_PLAN)
  },
})
