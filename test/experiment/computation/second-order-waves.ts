// SECOND-ORDER REVERSIBLE Z3 WAVES on every lab geometry (algebra Z3
// cyclic). The rule is code/rule/second-order-z3.ts: s(t+1) = f(s(t) on the cell and its neighbors) - s(t-1) mod 3,
// every cell at once. No pair schedule and no orientation exist here, so a flat tiling and its degree-matched
// hyperbolic control ({4,4}/{4,5}, {6,3}/{6,4}, {3,6}/{3,7}, {3,4,3,3}/{3,4,3,4}) differ ONLY in the
// graph, and the face length p is equal inside each pair: the pair varies the vertex degree q, which is the curvature.
// This answers audit-m1 finding F (matched pairs must hold everything but curvature fixed) by construction.
//
// Laws (declared before the first run): linear f = sum of neighbors (self 0, the Z3 wave of reversible-wave.ts) and
// f = sum of neighbors + own tone (self 1); nonlinear f = sum + own tone^2 (square, self 0). Seed: s(-1) = 0,
// s(0) = +1 at the origin tile (one source) or at two tiles of the first shell at the largest mutual distance (two
// sources, interference). Boundary: exact open balls (chamber tiling for hyperbolic ones), vacuum outside. Every law
// fixes the vacuum and moves a difference at most one hop per step, so a ball of radius R is an exact window for the
// one-source run through step R and for the two-source run through step R - 1 (checked, not assumed: G3).
//
// MEASURES, per geometry and law, at every step t:
//   front speed      r(t)/t, r(t) the largest distance holding a nonzero tone
//   front lit        the share of the shell at distance t that is nonzero at step t
//   wake             the share of the cells strictly inside the front (distance < t) that are nonzero at step t: the
//                    dispersion reading (a dispersionless, Huygens-like wave leaves the inside dark)
//   destructive      among cells where both one-source fields are nonzero, the share where the two-source field is 0
// and on the matched CLOSED quotients (tiling-quotient.ts: equal cell count and degree), the exact period of the
// one-source orbit, the dispersion relation's global fingerprint, against a control of flat tori of several sizes.
//
// CURVATURE CRITERION (declared before the first run): a measure is curvature-sensitive only if, in all four matched
// pairs and under both linear laws, the hyperbolic value differs from the flat value in the same direction, compared at
// the same step (the smaller window of the pair). A closed-quotient period difference counts only if the hyperbolic
// period lies outside the range of the flat control tori of the same degree.
//
// GATES (fail the experiment):
//   G1 exact time reversal: from the last two slices, the step run on the swapped pair returns every earlier slice,
//      for every law (nonlinear included), on every geometry, and on the closed quotients
//   G2 superposition: for both linear laws the two-source field equals the sum of the one-source fields mod 3, every
//      cell, every step
//   G3 window: the support at step t lies within distance t of the sources (the cone), and the run on the radius R - 1
//      sub-ball equals the radius R run on every cell of the sub-ball through step R - 1
//   G4 front theorem: on the shell at distance t the tone at step t is the number of geodesics from the origin mod 3
//      (the leading term A^t of the Chebyshev polynomial U_t, untouched by the self and square terms), every law
//   G5 reference: the linear self-0 and square self-0 steps equal code/dynamics/reversible-wave.ts (modulus 3) cell for
//      cell, and on the line the linear self-0 field is the closed form (+1 on |x| <= t, x = t mod 2, else 0)
//   G6 exhaustive bijectivity: on the radius-2 line and radius-1 {4,4}, {3,6}, {3,7} balls every one of the 3^(2n)
//      slice pairs has a distinct image under every law
//   G7 determinism: two runs give identical bytes, and the rule and this file hold no random draw (scanSource)
// NEGATIVE CONTROLS (each must trip): N1 the first-order rule s(t+1) = f(s(t)) is not injective on a ball where it is
// checked exhaustively; N2 the square law breaks superposition on every geometry; N3 the sub-ball run past its window
// disagrees with the larger ball; N4 the reversal run WITHOUT the swap does not return the earlier slices.
//
// Default sizes: balls of up to 90,000 tiles, under the 10-second budget.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { scanSource } from '@/code/check/determinism'
import { reversibleWaveStep, reversibleWaveStepNonlinear } from '@/code/dynamics/reversible-wave'
import {
  firstOrderZ3Step,
  geodesicCountsMod3,
  secondOrderZ3Back,
  secondOrderZ3Run,
  secondOrderZ3Step,
  type CellNeighbors,
  type SecondOrderZ3Law,
} from '@/code/rule/second-order-z3'
import { labGeometry, type LabGeometryName } from '@/code/substrate/lab-geometry'
import { closedQuotients, squareTorus } from '@/code/substrate/tiling-quotient'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'

type Check = { name: string; ok: boolean }

type LawName = 'linear0' | 'linear1' | 'square0'

const LAWS: readonly { name: LawName; law: SecondOrderZ3Law; linear: boolean }[] = [
  { name: 'linear0', law: { kind: 'linear', self: 0 }, linear: true },
  { name: 'linear1', law: { kind: 'linear', self: 1 }, linear: true },
  { name: 'square0', law: { kind: 'square', self: 0 }, linear: false },
]

// the open-ball radius per geometry: the largest exact ball near 90,000 tiles that builds in well under a second
const OPEN: readonly { name: LabGeometryName; radius: number }[] = [
  { name: 'line', radius: 40 },
  { name: '{4,4}', radius: 40 },
  { name: '{6,3}', radius: 40 },
  { name: '{3,6}', radius: 40 },
  { name: '{5,4}', radius: 10 },
  { name: '{7,3}', radius: 9 },
  { name: '{8,3}', radius: 7 },
  { name: '{3,4,3,4}', radius: 3 },
  { name: '{4,5}', radius: 11 },
  { name: '{6,4}', radius: 8 },
  { name: '{3,7}', radius: 20 },
  { name: '{3,4,3,3}', radius: 6 },
]

const PAIRS: readonly [LabGeometryName, LabGeometryName][] = [
  ['{4,4}', '{4,5}'],
  ['{6,3}', '{6,4}'],
  ['{3,6}', '{3,7}'],
  ['{3,4,3,3}', '{3,4,3,4}'],
]

const MEASURES = ['frontLit', 'meanFrontLit', 'wake', 'meanWake', 'destructive', 'frontSpeed'] as const

type MeasureName = (typeof MEASURES)[number]

type LawSeries = {
  // index t = 0..T of the one-source run
  frontLit: number[]
  wake: number[]
  frontRadius: number[]
  // index t = 0..T - 1 of the two-source run (-1 where no overlap)
  destructive: number[]
}

type GeometryResult = {
  name: LabGeometryName
  radius: number
  cells: number
  laws: Record<LawName, LawSeries>
}

function zeros(n: number): Uint8Array {
  return new Uint8Array(n)
}

function delta(n: number, cells: readonly number[]): Uint8Array {
  const s = zeros(n)

  for (const c of cells) {
    s[c] = 1
  }

  return s
}

function equalSlices(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}

function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? -1 : numerator / denominator
}

// G1 and N4: walk back from the last two slices and compare every earlier slice
function reversalHolds(neighbors: CellNeighbors, slices: Uint8Array[], law: SecondOrderZ3Law, swap: boolean): boolean {
  let next = slices[slices.length - 1]!
  let current = slices[slices.length - 2]!

  for (let k = slices.length - 3; k >= 0; k--) {
    const earlier = swap
      ? secondOrderZ3Back({ neighbors, current, next, law })
      : secondOrderZ3Step({ neighbors, previous: current, current: next, law })

    if (!equalSlices(earlier, slices[k]!)) {
      return false
    }

    next = current
    current = earlier
  }

  return true
}

// the sub-ball of cells at distance <= r (a prefix: cells are numbered in BFS order)
function subBall(neighbors: CellNeighbors, distance: Int32Array, r: number): number[][] {
  let size = 0

  while (size < distance.length && distance[size]! <= r) {
    size++
  }

  for (let i = size; i < distance.length; i++) {
    if (distance[i]! <= r) {
      throw new Error('second-order-waves: ball cells are not in BFS order')
    }
  }

  return neighbors.slice(0, size).map(row => row.filter(w => w < size))
}

function bfs(neighbors: CellNeighbors, origin: number): Int32Array {
  const distance = new Int32Array(neighbors.length).fill(-1)
  const queue = [origin]

  distance[origin] = 0

  for (const u of queue) {
    for (const w of neighbors[u] ?? []) {
      if (distance[w] === -1) {
        distance[w] = distance[u]! + 1
        queue.push(w)
      }
    }
  }

  return distance
}

function openGeometry(name: LabGeometryName, radius: number, checks: Check[], negatives: Check[]): GeometryResult {
  const geometry = labGeometry({ name, boundary: 'openBall', radius, exact: true, maxCells: 90000 })
  const neighbors: number[][] = geometry.graph.neighbors.map(row => Array.from(row))
  const distance = geometry.distance
  const n = neighbors.length
  const steps = radius
  const geodesics = geodesicCountsMod3({ neighbors, distance, origin: 0 })
  const shell = (d: number): number => geometry.shellSizes[d] ?? 0
  const inner = subBall(neighbors, distance, radius - 1)
  const innerSize = inner.length

  // two sources: the first first-shell tile and the first-shell tile farthest from it (lowest index on a tie)
  const sourceA = 1
  const fromA = bfs(neighbors, sourceA)

  let sourceB = -1

  for (let c = 1; c < n && distance[c] === 1; c++) {
    if (sourceB === -1 || fromA[c]! > fromA[sourceB]!) {
      sourceB = c
    }
  }

  const laws = {} as Record<LawName, LawSeries>

  for (const { name: lawName, law, linear } of LAWS) {
    const tag = `${name} ${lawName}`
    const slices = secondOrderZ3Run({ neighbors, previous: zeros(n), current: delta(n, [0]), law, steps })

    // G1, N4
    checks.push({ name: `G1 ${tag}: exact reversal through ${steps} steps`, ok: reversalHolds(neighbors, slices, law, true) })
    negatives.push({ name: `N4 ${tag}: reversal without the swap fails`, ok: !reversalHolds(neighbors, slices, law, false) })

    // G3 cone, G4 front theorem, measures
    let cone = true
    let front = true

    const series: LawSeries = { frontLit: [], wake: [], frontRadius: [], destructive: [] }

    for (let t = 0; t <= steps; t++) {
      const s = slices[t + 1]!

      let litFront = 0
      let litInside = 0
      let insideCells = 0
      let reach = -1

      for (let c = 0; c < n; c++) {
        const d = distance[c]!
        const v = s[c]!

        if (v !== 0) {
          reach = Math.max(reach, d)

          if (d > t) {
            cone = false
          }
        }

        if (d === t) {
          if (v !== geodesics[c]) {
            front = false
          }

          if (v !== 0) {
            litFront++
          }
        } else if (d < t) {
          insideCells++

          if (v !== 0) {
            litInside++
          }
        }
      }

      series.frontLit.push(ratio(litFront, shell(t)))
      series.wake.push(ratio(litInside, insideCells))
      series.frontRadius.push(reach)
    }

    checks.push({ name: `G3 ${tag}: support within the one-hop cone`, ok: cone })
    checks.push({ name: `G4 ${tag}: front tone = geodesic count mod 3 on every shell`, ok: front })

    // G3 window: the sub-ball run equals the ball run on the sub-ball through step radius - 1; N3 past it, they differ
    const innerSlices = secondOrderZ3Run({
      neighbors: inner,
      previous: zeros(innerSize),
      current: delta(innerSize, [0]),
      law,
      steps: steps + 2,
    })

    let windowHolds = true

    for (let t = 0; t <= steps - 1; t++) {
      if (!equalSlices(innerSlices[t + 1]!, slices[t + 1]!.subarray(0, innerSize))) {
        windowHolds = false
      }
    }

    checks.push({ name: `G3 ${tag}: radius ${radius - 1} sub-ball equals the ball through step ${steps - 1}`, ok: windowHolds })

    // past the window the larger ball must also run further: extend it two steps (it is exact only through `steps`,
    // so compare at steps + 1 where the sub-ball is already wrong and the ball still exact)
    const longer = secondOrderZ3Run({ neighbors, previous: zeros(n), current: delta(n, [0]), law, steps: steps + 1 })

    negatives.push({
      name: `N3 ${tag}: the sub-ball run past its window differs at step ${steps + 1}`,
      ok: !equalSlices(innerSlices[steps + 2]!, longer[steps + 2]!.subarray(0, innerSize)),
    })

    // G5 reference against reversible-wave.ts
    if (lawName === 'linear0' || lawName === 'square0') {
      let same = true

      for (let t = 1; t < slices.length - 1; t++) {
        const next = new Uint8Array(n)

        if (lawName === 'linear0') {
          reversibleWaveStep({ neighbors, previous: slices[t - 1]!, current: slices[t]!, next, modulus: 3 })
        } else {
          reversibleWaveStepNonlinear({ neighbors, previous: slices[t - 1]!, current: slices[t]!, next, modulus: 3, selfCoupling: 1 })
        }

        if (!equalSlices(next, slices[t + 1]!)) {
          same = false
        }
      }

      checks.push({ name: `G5 ${tag}: equals reversible-wave.ts mod 3`, ok: same })
    }

    if (name === 'line' && lawName === 'linear0') {
      let closedForm = true

      for (let t = 0; t <= steps; t++) {
        for (let c = 0; c < n; c++) {
          const d = distance[c]!
          const expected = d <= t && (t - d) % 2 === 0 ? 1 : 0

          if (slices[t + 1]![c] !== expected) {
            closedForm = false
          }
        }
      }

      checks.push({ name: 'G5 line linear0: closed form +1 on |x| <= t, x = t mod 2', ok: closedForm })
    }

    // two sources: superposition (G2) and interference
    const twoSteps = steps - 1
    const runA = secondOrderZ3Run({ neighbors, previous: zeros(n), current: delta(n, [sourceA]), law, steps: twoSteps })
    const runB = secondOrderZ3Run({ neighbors, previous: zeros(n), current: delta(n, [sourceB]), law, steps: twoSteps })
    const runAB = secondOrderZ3Run({ neighbors, previous: zeros(n), current: delta(n, [sourceA, sourceB]), law, steps: twoSteps })

    let mismatches = 0

    for (let t = 0; t <= twoSteps; t++) {
      const a = runA[t + 1]!
      const b = runB[t + 1]!
      const ab = runAB[t + 1]!

      let overlap = 0
      let destroyed = 0

      for (let c = 0; c < n; c++) {
        if (ab[c] !== (a[c]! + b[c]!) % 3) {
          mismatches++
        }

        if (a[c] !== 0 && b[c] !== 0) {
          overlap++

          if (ab[c] === 0) {
            destroyed++
          }
        }
      }

      series.destructive.push(ratio(destroyed, overlap))
    }

    if (linear) {
      checks.push({ name: `G2 ${tag}: two-source field is the sum, every cell, every step`, ok: mismatches === 0 })
    } else {
      negatives.push({ name: `N2 ${tag}: the square law breaks superposition (${mismatches} cell-steps)`, ok: mismatches > 0 })
    }

    laws[lawName] = series
  }

  return { name, radius, cells: n, laws }
}

// G6 and N1: exhaustive injectivity on small balls
function exhaustive(checks: Check[], negatives: Check[], metrics: Record<string, number>): void {
  const balls: { name: LabGeometryName; radius: number }[] = [
    { name: 'line', radius: 2 },
    { name: '{4,4}', radius: 1 },
    { name: '{3,6}', radius: 1 },
    { name: '{3,7}', radius: 1 },
  ]

  let firstOrderCollapses = 0

  for (const { name, radius } of balls) {
    const geometry = labGeometry({ name, boundary: 'openBall', radius, exact: true, maxCells: 90000 })
    const neighbors: number[][] = geometry.graph.neighbors.map(row => Array.from(row))
    const n = neighbors.length
    const states = 3 ** n

    const decode = (code: number): Uint8Array => {
      const s = new Uint8Array(n)

      let k = code

      for (let i = 0; i < n; i++) {
        s[i] = k % 3
        k = Math.floor(k / 3)
      }

      return s
    }

    const encode = (s: Uint8Array): number => {
      let code = 0

      for (let i = n - 1; i >= 0; i--) {
        code = code * 3 + s[i]!
      }

      return code
    }

    for (const { name: lawName, law } of LAWS) {
      const seen = new Uint8Array(states * states)

      let distinct = 0

      for (let p = 0; p < states; p++) {
        const previous = decode(p)

        for (let c = 0; c < states; c++) {
          const next = secondOrderZ3Step({ neighbors, previous, current: decode(c), law })
          const image = c * states + encode(next)

          if (seen[image] === 0) {
            seen[image] = 1
            distinct++
          }
        }
      }

      checks.push({ name: `G6 ${name} r${radius} ${lawName}: all ${states * states} slice pairs have distinct images`, ok: distinct === states * states })

      const images = new Uint8Array(states)

      let firstDistinct = 0

      for (let c = 0; c < states; c++) {
        const image = encode(firstOrderZ3Step({ neighbors, current: decode(c), law }))

        if (images[image] === 0) {
          images[image] = 1
          firstDistinct++
        }
      }

      metrics[`exhaustive.${name}.r${radius}.${lawName}.firstOrderImages`] = firstDistinct
      metrics[`exhaustive.${name}.r${radius}.states`] = states

      if (firstDistinct < states) {
        firstOrderCollapses++
      }
    }
  }

  negatives.push({ name: `N1 the first-order rule is not injective on ${firstOrderCollapses} of 12 exhaustive ball-law cases (needs >= 1)`, ok: firstOrderCollapses >= 1 })
}

type ClosedRow = { name: string; curvature: string; cells: number; degree: number; partner: string | null; periods: Record<LawName, number>; cap: number }

// the exact one-source orbit period on a closed graph, -1 when it passes the cap
function orbitPeriod(neighbors: CellNeighbors, law: SecondOrderZ3Law, cap: number): number {
  const n = neighbors.length
  const p0 = zeros(n)
  const c0 = delta(n, [0])

  let previous = p0
  let current = c0

  for (let t = 1; t <= cap; t++) {
    const next = secondOrderZ3Step({ neighbors, previous, current, law })

    previous = current
    current = next

    if (equalSlices(previous, p0) && equalSlices(current, c0)) {
      return t
    }
  }

  return -1
}

function closedRows(checks: Check[]): { rows: ClosedRow[]; tori: ClosedRow[] } {
  const rows: ClosedRow[] = []

  for (const e of closedQuotients()) {
    const q = e.quotient

    if (q.partner === null) {
      continue
    }

    const cap = Math.max(2000, Math.floor(1.2e7 / (q.cells * q.degree)))
    const periods = {} as Record<LawName, number>

    for (const { name: lawName, law } of LAWS) {
      periods[lawName] = orbitPeriod(q.neighbors, law, cap)

      // G1 on the closed quotient: 40 steps forward and back
      const slices = secondOrderZ3Run({ neighbors: q.neighbors, previous: zeros(q.cells), current: delta(q.cells, [0]), law, steps: 40 })

      checks.push({ name: `G1 ${q.name} ${lawName}: exact reversal on the closed quotient`, ok: reversalHolds(q.neighbors, slices, law, true) })
    }

    rows.push({ name: q.name, curvature: q.curvature, cells: q.cells, degree: q.degree, partner: q.partner, periods, cap })
  }

  // control: flat square tori of several sizes, to show how much a flat period moves with the quotient's arithmetic alone
  const tori: ClosedRow[] = []

  for (const [a, b] of [
    [5, 5],
    [5, 6],
    [6, 6],
    [6, 7],
    [7, 7],
    [8, 8],
  ] as const) {
    const neighbors = squareTorus(a, b).analysis.neighbors
    const cap = Math.max(2000, Math.floor(1.2e7 / (neighbors.length * 4)))
    const periods = {} as Record<LawName, number>

    for (const { name: lawName, law } of LAWS) {
      periods[lawName] = lawName === 'square0' ? 0 : orbitPeriod(neighbors, law, cap)
    }

    tori.push({ name: `square-torus-${a}x${b}`, curvature: 'flat', cells: neighbors.length, degree: 4, partner: null, periods, cap })
  }

  return { rows, tori }
}

type Comparison = { pair: string; law: LawName; step: number; flat: Record<MeasureName, number>; hyperbolic: Record<MeasureName, number> }

function measuresAt(series: LawSeries, step: number): Record<MeasureName, number> {
  const mean = (values: number[], from: number, to: number): number => {
    let sum = 0
    let count = 0

    for (let t = from; t <= to; t++) {
      if (values[t]! >= 0) {
        sum += values[t]!
        count++
      }
    }

    return count === 0 ? -1 : sum / count
  }

  return {
    frontLit: series.frontLit[step]!,
    meanFrontLit: mean(series.frontLit, 1, step),
    wake: series.wake[step]!,
    meanWake: mean(series.wake, 1, step),
    destructive: series.destructive[step - 1]!,
    frontSpeed: series.frontRadius[step]! / step,
  }
}

function round(x: number): number {
  return Math.round(x * 10000) / 10000
}

type WavesResult = {
  geometries: GeometryResult[]
  comparisons: Comparison[]
  closed: ClosedRow[]
  tori: ClosedRow[]
  checks: Check[]
  negatives: Check[]
  metrics: Record<string, number>
  serialized: string
}

function secondOrderWaves(): WavesResult {
  const checks: Check[] = []
  const negatives: Check[] = []
  const metrics: Record<string, number> = {}
  const geometries = OPEN.map(({ name, radius }) => openGeometry(name, radius, checks, negatives))
  const byName = new Map(geometries.map(g => [g.name, g]))

  for (const g of geometries) {
    metrics[`${g.name}.radius`] = g.radius
    metrics[`${g.name}.cells`] = g.cells

    for (const { name: lawName } of LAWS) {
      const m = measuresAt(g.laws[lawName], g.radius)

      for (const key of MEASURES) {
        metrics[`${g.name}.${lawName}.${key}`] = round(m[key])
      }
    }
  }

  const comparisons: Comparison[] = []

  for (const [flatName, hyperName] of PAIRS) {
    const flat = byName.get(flatName)!
    const hyper = byName.get(hyperName)!
    const step = Math.min(flat.radius, hyper.radius)

    for (const { name: lawName } of LAWS) {
      comparisons.push({
        pair: `${flatName}/${hyperName}`,
        law: lawName,
        step,
        flat: measuresAt(flat.laws[lawName], step),
        hyperbolic: measuresAt(hyper.laws[lawName], step),
      })
    }
  }

  exhaustive(checks, negatives, metrics)

  const { rows, tori } = closedRows(checks)

  for (const r of [...rows, ...tori]) {
    for (const { name: lawName } of LAWS) {
      if (r.periods[lawName] !== 0) {
        metrics[`closed.${r.name}.${lawName}.period`] = r.periods[lawName]
      }
    }
  }

  const serialized = JSON.stringify({ geometries, comparisons, rows, tori, metrics })

  return { geometries, comparisons, closed: rows, tori, checks, negatives, metrics, serialized }
}

// the declared criterion: same nonzero sign of (hyperbolic - flat) in all four pairs under both linear laws
function curvatureVerdict(comparisons: Comparison[]): Record<MeasureName, -1 | 0 | 1> {
  const out = {} as Record<MeasureName, -1 | 0 | 1>

  for (const key of MEASURES) {
    const signs = comparisons
      .filter(c => c.law !== 'square0')
      .map(c => Math.sign(round(c.hyperbolic[key]) - round(c.flat[key])))
    const first = signs[0] ?? 0

    out[key] = first !== 0 && signs.every(s => s === first) ? (first as -1 | 1) : 0
  }

  return out
}

export function secondOrderWavesRun(): Verdict {
  const started = performance.now()
  const seconds = (): number => Number(((performance.now() - started) / 1000).toFixed(1))
  const log = (line: string): void => console.error(`${line} (${seconds()} s)`)

  const r = secondOrderWaves()
  const again = secondOrderWaves()
  const checks = [...r.checks]
  const negatives = [...r.negatives]
  const metrics = { ...r.metrics }

  checks.push({ name: 'G7 two runs give identical bytes', ok: r.serialized === again.serialized })

  const root = join(import.meta.dirname, '..', '..', '..')
  const findings = ['code/rule/second-order-z3.ts', 'test/experiment/computation/second-order-waves.ts'].flatMap(file =>
    scanSource(file, readFileSync(join(root, file), 'utf8')),
  )

  checks.push({ name: `G7 no random draw in the rule or the experiment (${findings.length} findings)`, ok: findings.length === 0 })

  for (const g of r.geometries) {
    const m = measuresAt(g.laws.linear0, g.radius)

    log(`${g.name} R=${g.radius} cells=${g.cells} linear0 at t=${g.radius}: speed ${round(m.frontSpeed)} frontLit ${round(m.frontLit)} meanFrontLit ${round(m.meanFrontLit)} wake ${round(m.wake)} meanWake ${round(m.meanWake)} destructive ${round(m.destructive)}`)
  }

  for (const c of r.comparisons) {
    log(`pair ${c.pair} ${c.law} t=${c.step}: ${MEASURES.map(k => `${k} ${round(c.flat[k])}/${round(c.hyperbolic[k])}`).join(', ')}`)
  }

  for (const row of [...r.closed, ...r.tori]) {
    log(`closed ${row.name} (${row.curvature}, ${row.cells} cells, degree ${row.degree}): periods ${LAWS.map(l => `${l.name} ${row.periods[l.name]}`).join(', ')} (cap ${row.cap})`)
  }

  const sensitivity = curvatureVerdict(r.comparisons)

  for (const key of MEASURES) {
    metrics[`curvature.${key}`] = sensitivity[key]
  }

  // closed-quotient criterion: the hyperbolic period outside the flat control range (square tori, degree 4 pair only)
  const torusPeriods = r.tori.map(t => t.periods.linear0).filter(p => p > 0)
  const h45 = r.closed.find(c => c.name.startsWith('surface-4-5'))?.periods.linear0 ?? -1
  const torusMin = Math.min(...torusPeriods)
  const torusMax = Math.max(...torusPeriods)
  const closedSurvives = h45 > 0 && torusPeriods.length === r.tori.length && (h45 < torusMin || h45 > torusMax)

  metrics['closed.control.squareTorus.minPeriod'] = torusMin
  metrics['closed.control.squareTorus.maxPeriod'] = torusMax
  metrics['closed.curvature.4-5.periodOutsideFlatRange'] = closedSurvives ? 1 : 0

  const failed = [...checks, ...negatives].filter(c => !c.ok)

  for (const c of failed) {
    log(`FAILED ${c.name}`)
  }

  metrics.gates = checks.length
  metrics.controls = negatives.length
  metrics.failed = failed.length
  metrics.seconds = seconds()

  const surviving = MEASURES.filter(k => sensitivity[k] !== 0)
  const curvatureSentence =
    surviving.length === 0
      ? 'no measure differs in one direction across all four degree-matched pairs'
      : `${surviving.map(k => `${k} (${sensitivity[k] > 0 ? 'higher' : 'lower'} on the hyperbolic side)`).join(', ')} differ in one direction in all four degree-matched pairs under both linear laws; ${MEASURES.filter(k => sensitivity[k] === 0).join(', ')} do not`

  return verdict({
    status: failed.length === 0 ? 'pass' : 'fail',
    claim: `second-order reversible Z3 waves s(t+1) = f(neighbors) - s(t-1) on every lab geometry, one update for every cell at once (no schedule), exact: time reversal by swapping the two slices, superposition for the linear laws, a front at one hop per step whose tone is the geodesic count mod 3; ${curvatureSentence}; closed-quotient periods ${closedSurvives ? 'separate' : 'do not separate'} {4,5} from the range of flat square tori`,
    metrics,
    control: {
      negativesTripped: negatives.filter(c => c.ok).length,
      negatives: negatives.length,
      squareTorusMinPeriod: torusMin,
      squareTorusMaxPeriod: torusMax,
    },
    notes:
      'L2, exact integers mod 3. Each matched pair holds the face length p and the update fixed and varies only the vertex degree q (the curvature), so schedule and orientation cannot confound it (audit-m1 F). Windows are exact by the one-hop cone and checked against a sub-ball. The front tone is the geodesic count mod 3 (G4), so front lit reads how many shortest paths reach a tile: binomial on flat tilings (Lucas holes mod 3), few on hyperbolic ones. {3,4,3,4} has only a radius-3 window (8857 tiles) under the 90,000 cap, so its pair is compared at step 3. Closed-quotient periods are global arithmetic of the quotient (they move by large factors between flat tori of one degree), reported, and credited to curvature only by the declared range criterion.',
  })
}

export default experiment({
  id: 'computation/second-order-waves',
  code: 'E-CMP-0041',
  title:
    'second-order reversible Z3 waves on every lab geometry: dispersion (wake), front speed and front structure, interference, flat against degree-matched hyperbolic with no schedule to confound the pair',
  category: 'computation',
  substrates: ['line', '{4,4}', '{6,3}', '{3,6}', '{5,4}', '{7,3}', '{8,3}', '{3,4,3,4}', '{4,5}', '{6,4}', '{3,7}', '{3,4,3,3}'],
  depth: 'L2',
  paper: false,
  run() {
    return secondOrderWavesRun()
  },
})
