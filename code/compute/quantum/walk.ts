// QUANTUM WALKS AND SPATIAL SEARCH, EXACT (Q5).
// Two families of walk, both exact:
//
//   the bare beat U       code/rule/bare-beat on {3,4,3,4} and on the flat {3,4,3,3} (withGeometry). A lone vibe never
//                         leaves its mesh line (Q2), so its spreading, return and hitting are read on that line, and a
//                         marked-dock search under U can only ever collect the weight that starts on the 12 lines
//                         through the marked dock.
//   the Grover walk       the generic coined walk on a cell graph of degree d: the walker sits on an arc (cell, facet),
//                         the coin G = (2/d) J - I mixes the d arcs of a cell, the flip-flop shift sends the arc
//                         (v -> w) to (w -> v). Search marks one cell by the coin -I there (Ambainis-Kempe-Rivosh), from
//                         the uniform state on every arc. G has entries in Z[1/6] exactly when 2/d does (degrees
//                         2^a 3^b: in the lab 2, 3, 4, 6, 8, 24), so {5,4} and {7,3} have no exact Grover walk here.
//
// Exactness. Every Grover amplitude is a rational number x / q^t with x an integer (bigint) and q = d / gcd(2, d): the
// integer coin q G = c J - q I with c = 2 q / d. The uniform start has amplitude 1 on each of the d N arcs, and every
// probability divides by the start weight d N, so the irrational normalization 1 / sqrt(d N) never appears: each
// probability is an exact rational. Bare-U amplitudes are numbers of Z[zeta_9][1/6] (bare-beat Z9 over its den).
// Orders are decided by code/algebra/ninth-real-sign (compareReal), never by a float. Floats are display only.
//
// A ball (an open window cut from the infinite tiling) keeps every cell at degree d: a facet with no cell beyond it is a
// reflecting wall, the arc (v -> outside) maps to itself under the shift. A closed quotient has no wall.
//
//   inSixthRing, groverCoin, coinSquareDefects   which degrees carry an exact Grover coin, and its unitarity
//   arcGraph                                       the arc structure of a cell graph (walls padded), fail-closed
//   cycleNeighbors, hypercubeNeighbors, completeNeighbors, bfsDistances   control graphs and breadth-first distance
//   groverSearch                                   success probability at the marked cell per beat, first maximum
//   dephasedSearch                                 the classical control: |G_ij|^2 walk, marked cell absorbing
//   groverSpread, groverHitting                    a walker started on one cell: second moment, return, hitting
//   bareLoneSpread, bareMonitoredHit               a lone vibe under U: second moment, return, monitored hitting
//   bareLineSearch                                 a marked-dock oracle interleaved with U, on the lines through it
//   displayRational                                a rational Ninth as a JS number, display only
//
// DETERMINISM: no random numbers, no floating point in any decision, no host Math call.

import { type Ninth, ONE, ZERO, add, conj, isZero, mul, ninth, scale } from '@/code/algebra/ninth-field'
import { compareReal } from '@/code/algebra/ninth-real-sign'
import { lineChain, oneExcitationRun } from '@/code/compute/quantum/particles'
import { weightOf } from '@/code/measure/quantum-lab-measures'
import {
  type BeatState,
  type Vibe,
  LINES,
  LINE_OF_SLOT,
  OPPOSITE_SLOT,
  applyBeat,
  basisKet,
  decodeConfig,
  stepDock,
  superpose,
} from '@/code/rule/bare-beat'

function assertExact(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`FAIL: ${message}`)
  }
}

const gcd = (a: bigint, b: bigint): bigint => {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b

  while (y !== 0n) {
    ;[x, y] = [y, x % y]
  }

  return x
}

const rational = (numerator: bigint, denominator: bigint): Ninth => ninth([numerator], denominator)

// A rational Ninth (real, only the constant coordinate) as a JS number: display only, never compared.
export function displayRational(x: Ninth): number {
  assertExact(x.n.slice(1).every(c => c === 0n), 'displayRational of a number that is not rational')

  return Number((x.n[0]! * 10n ** 12n) / x.d) / 1e12
}

// ---------------------------------------------------------------------------------------------------------------------
// 1. The Grover coin and the ring
// ---------------------------------------------------------------------------------------------------------------------

// Whether numerator / denominator lies in Z[1/6]: its reduced denominator has no prime factor but 2 and 3.
export function inSixthRing(numerator: bigint, denominator: bigint): boolean {
  assertExact(denominator !== 0n, 'a zero denominator')

  let d = denominator / gcd(numerator, denominator)

  d = d < 0n ? -d : d

  for (const p of [2n, 3n]) {
    while (d % p === 0n) {
      d /= p
    }
  }

  return d === 1n
}

export type GroverCoin = {
  readonly degree: number
  // whether G = (2/d) J - I has entries in Z[1/6]
  readonly exact: boolean
  // the integer coin q G = c J - q I
  readonly q: bigint
  readonly c: bigint
}

export function groverCoin(degree: number): GroverCoin {
  assertExact(Number.isInteger(degree) && degree >= 2, `a Grover coin needs degree >= 2 (got ${degree})`)

  const d = BigInt(degree)
  const g = gcd(2n, d)
  const q = d / g

  return { degree, exact: inSixthRing(2n, d), q, c: 2n / g }
}

// Entries of (c J - q I)^2 that differ from q^2 I, over the d x d matrix (0 for a unitary coin). A wrong c fails.
export function coinSquareDefects(coin: GroverCoin): number {
  const d = coin.degree

  let defects = 0

  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      let sum = 0n

      for (let k = 0; k < d; k++) {
        const a = coin.c - (i === k ? coin.q : 0n)
        const b = coin.c - (k === j ? coin.q : 0n)

        sum += a * b
      }

      if (sum !== (i === j ? coin.q * coin.q : 0n)) {
        defects++
      }
    }
  }

  return defects
}

// ---------------------------------------------------------------------------------------------------------------------
// 2. Arc graphs and control graphs
// ---------------------------------------------------------------------------------------------------------------------

export type ArcGraph = {
  readonly cells: number
  readonly degree: number
  // head[v * degree + j]: the cell across facet j of v, or v itself on a wall
  readonly head: Int32Array
  // reverse[a]: the arc the shift sends a to, (w -> v) for a = (v -> w), a itself on a wall
  readonly reverse: Int32Array
  readonly walls: number
}

// The arc structure of a cell graph whose every cell has at most `degree` neighbours. Fails closed on a self-loop, a
// repeated neighbour, an asymmetric adjacency or a cell above the degree. Missing facets become walls.
export function arcGraph(neighbors: readonly (readonly number[])[], degree: number): ArcGraph {
  const cells = neighbors.length
  const head = new Int32Array(cells * degree)
  const reverse = new Int32Array(cells * degree)

  let walls = 0

  for (let v = 0; v < cells; v++) {
    const row = neighbors[v]!

    assertExact(row.length <= degree, `cell ${v} has ${row.length} neighbours, above degree ${degree}`)
    assertExact(new Set(row).size === row.length, `cell ${v} repeats a neighbour`)

    for (let j = 0; j < degree; j++) {
      const a = v * degree + j

      if (j >= row.length) {
        head[a] = v
        reverse[a] = a
        walls++
        continue
      }

      const w = row[j]!

      assertExact(w !== v, `cell ${v} is its own neighbour`)

      const back = neighbors[w]!.indexOf(v)

      assertExact(back >= 0, `cell ${w} does not list its neighbour ${v}`)
      head[a] = w
      reverse[a] = w * degree + back
    }
  }

  return { cells, degree, head, reverse, walls }
}

export const cycleNeighbors = (n: number): number[][] =>
  Array.from({ length: n }, (_, v) => [(v + 1) % n, (v + n - 1) % n])

export const hypercubeNeighbors = (dimension: number): number[][] =>
  Array.from({ length: 1 << dimension }, (_, v) => Array.from({ length: dimension }, (_, i) => v ^ (1 << i)))

export const completeNeighbors = (n: number): number[][] =>
  Array.from({ length: n }, (_, v) => Array.from({ length: n - 1 }, (_, i) => (i < v ? i : i + 1)))

export function bfsDistances(neighbors: readonly (readonly number[])[], source: number): Int32Array {
  const distance = new Int32Array(neighbors.length).fill(-1)
  const queue: number[] = [source]

  distance[source] = 0

  // the array iterator sees cells pushed during the loop, so this is breadth first
  for (const v of queue) {
    for (const w of neighbors[v]!) {
      if (distance[w] === -1) {
        distance[w] = distance[v]! + 1
        queue.push(w)
      }
    }
  }

  return distance
}

// ---------------------------------------------------------------------------------------------------------------------
// 3. Grover search
// ---------------------------------------------------------------------------------------------------------------------

function exactCoin(graph: ArcGraph): GroverCoin {
  const coin = groverCoin(graph.degree)

  assertExact(coin.exact, `degree ${graph.degree} has no exact Grover coin: 2/${graph.degree} is not in Z[1/6]`)

  return coin
}

// One beat of the integer walk: coin on every cell (c J - q I, or -q I on the marked cell), then the flip-flop shift.
function groverBeat(graph: ArcGraph, coin: GroverCoin, x: readonly bigint[], marked: number | null): bigint[] {
  const d = graph.degree
  const out = new Array<bigint>(x.length).fill(0n)

  for (let v = 0; v < graph.cells; v++) {
    const base = v * d

    if (v === marked) {
      for (let j = 0; j < d; j++) {
        out[graph.reverse[base + j]!] = -coin.q * x[base + j]!
      }

      continue
    }

    let s = 0n

    for (let j = 0; j < d; j++) {
      s += x[base + j]!
    }

    const cs = coin.c * s

    for (let j = 0; j < d; j++) {
      out[graph.reverse[base + j]!] = cs - coin.q * x[base + j]!
    }
  }

  return out
}

const sumSquares = (x: readonly bigint[]): bigint => x.reduce((s, v) => s + v * v, 0n)

function cellWeight(graph: ArcGraph, x: readonly bigint[], cell: number): bigint {
  let w = 0n

  for (let j = 0; j < graph.degree; j++) {
    const v = x[cell * graph.degree + j]!

    w += v * v
  }

  return w
}

export type SearchReading = {
  readonly cells: number
  readonly degree: number
  readonly marked: number | null
  readonly beats: number
  // probability at the marked cell (cell 0 when unmarked) after t beats, t = 0..beats
  readonly probability: readonly Ninth[]
  // beats whose total weight is not exactly q^(2t) d N
  readonly unitaryDefects: number
  // the first maximum: the running maximum when the probability first falls below half of it, once that maximum has
  // reached 2/N; null when that never happens within the run
  readonly firstMaximumBeat: number | null
  readonly firstMaximum: Ninth | null
  readonly windowMaximumBeat: number
  readonly windowMaximum: Ninth
  readonly stoppedBy: 'firstMaximum' | 'cap'
}

// The first-maximum cap: 4 isqrt(N log2 N) + 16 beats (integer), past every peak the walks here have.
export function searchCap(cells: number): number {
  const bits = cells.toString(2).length
  const target = cells * bits

  let r = 0

  while ((r + 1) * (r + 1) <= target) {
    r++
  }

  return 4 * r + 16
}

export function groverSearch(input: {
  graph: ArcGraph
  marked: number | null
  cap: number
  // keep going to the cap after the first maximum
  runToCap?: boolean
}): SearchReading {
  const { graph, marked, cap } = input
  const coin = exactCoin(graph)
  const arcs = graph.cells * graph.degree
  const startWeight = BigInt(arcs)
  const reader = marked ?? 0
  const twoOverN = rational(2n, BigInt(graph.cells))
  const probability: Ninth[] = [rational(1n, BigInt(graph.cells))]

  let x = new Array<bigint>(arcs).fill(1n)
  let scaleSquared = 1n
  let unitaryDefects = 0
  let runningMax = probability[0]!
  let runningMaxBeat = 0
  let windowMax = probability[0]!
  let windowMaxBeat = 0
  let firstMaximumBeat: number | null = null
  let firstMaximum: Ninth | null = null
  let beats = 0

  for (let t = 1; t <= cap; t++) {
    x = groverBeat(graph, coin, x, marked)
    scaleSquared *= coin.q * coin.q
    beats = t

    if (sumSquares(x) !== scaleSquared * startWeight) {
      unitaryDefects++
    }

    const p = rational(cellWeight(graph, x, reader), scaleSquared * startWeight)

    probability.push(p)

    if (compareReal(p, windowMax) > 0) {
      windowMax = p
      windowMaxBeat = t
    }

    if (firstMaximumBeat === null) {
      if (compareReal(p, runningMax) > 0) {
        runningMax = p
        runningMaxBeat = t
      } else if (compareReal(runningMax, twoOverN) >= 0 && compareReal(scale(p, 2), runningMax) < 0) {
        firstMaximumBeat = runningMaxBeat
        firstMaximum = runningMax

        if (input.runToCap !== true) {
          break
        }
      }
    }
  }

  return {
    cells: graph.cells,
    degree: graph.degree,
    marked,
    beats,
    probability,
    unitaryDefects,
    firstMaximumBeat,
    firstMaximum,
    windowMaximumBeat: windowMaxBeat,
    windowMaximum: windowMax,
    stoppedBy: firstMaximumBeat !== null && input.runToCap !== true ? 'firstMaximum' : 'cap',
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// 4. The classical control: the dephased walk with the marked cell absorbing
// ---------------------------------------------------------------------------------------------------------------------

export type ClassicalReading = {
  readonly beats: number
  // probability that the walker has stood on the marked cell at some beat 0..t
  readonly found: readonly Ninth[]
  // beats where found_t > (t + 1) / N (the union bound over a stationary uniform walk; 0 unless the code is wrong)
  readonly unionBoundViolations: number
  // beats where the kept and absorbed mass do not add up to 1 exactly
  readonly massDefects: number
  // whether |G_ij|^2 is doubly stochastic: (c - q)^2 + (d - 1) c^2 = q^2
  readonly stochastic: boolean
}

// The dephased Grover walk (|G_ij|^2: stay on the arc it came in by (1 - 2/d)^2, every other 4/d^2, then the shift),
// from the uniform distribution on arcs, the marked cell absorbing. Integer mass y / q^(2t).
export function dephasedSearch(input: { graph: ArcGraph; marked: number; beats: number }): ClassicalReading {
  const { graph, marked, beats } = input
  const coin = exactCoin(graph)
  const d = graph.degree
  const arcs = graph.cells * d
  const total = BigInt(arcs)
  const cc = coin.c * coin.c
  const diag = (coin.c - coin.q) * (coin.c - coin.q) - cc
  const q2 = coin.q * coin.q
  const stochastic = (coin.c - coin.q) * (coin.c - coin.q) + BigInt(d - 1) * cc === q2
  const n = BigInt(graph.cells)

  let y = new Array<bigint>(arcs).fill(1n)
  let absorbed = 0n
  let scaleSquared = 1n

  const absorb = (): void => {
    for (let j = 0; j < d; j++) {
      absorbed += y[marked * d + j]!
      y[marked * d + j] = 0n
    }
  }

  absorb()

  const found: Ninth[] = [rational(absorbed, total)]

  let unionBoundViolations = 0
  let massDefects = 0

  for (let t = 1; t <= beats; t++) {
    const out = new Array<bigint>(arcs).fill(0n)

    for (let v = 0; v < graph.cells; v++) {
      const base = v * d

      let s = 0n

      for (let j = 0; j < d; j++) {
        s += y[base + j]!
      }

      for (let j = 0; j < d; j++) {
        out[graph.reverse[base + j]!] = cc * s + diag * y[base + j]!
      }
    }

    y = out
    absorbed *= q2
    scaleSquared *= q2
    absorb()

    if (y.reduce((s, v) => s + v, 0n) + absorbed !== scaleSquared * total) {
      massDefects++
    }

    const f = rational(absorbed, scaleSquared * total)

    found.push(f)

    if (compareReal(f, rational(BigInt(t + 1), n)) > 0) {
      unionBoundViolations++
    }
  }

  return { beats, found, unionBoundViolations, massDefects, stochastic }
}

// ---------------------------------------------------------------------------------------------------------------------
// 5. A walker started on one cell: spreading, return, hitting
// ---------------------------------------------------------------------------------------------------------------------

export type SpreadReading = {
  readonly beats: number
  // sum over cells of distance^2 * probability, t = 1..beats
  readonly secondMoment: readonly Ninth[]
  // probability on the start cell, t = 1..beats
  readonly returnProbability: readonly Ninth[]
  readonly supportRadius: readonly number[]
  // weight found farther than t hops after t beats (0: the one-hop cone holds)
  readonly coneExcess: number
  readonly unitaryDefects: number
}

function checkWindow(graph: ArcGraph, distance: Int32Array, beats: number): void {
  let radius = 0

  for (const r of distance) {
    radius = r > radius ? r : radius
  }

  assertExact(beats <= radius, `a localized run of ${beats} beats needs a ball of radius >= ${beats} (got ${radius})`)

  for (let v = 0; v < graph.cells; v++) {
    if (distance[v]! < radius) {
      for (let j = 0; j < graph.degree; j++) {
        assertExact(graph.reverse[v * graph.degree + j] !== v * graph.degree + j, `interior cell ${v} has a wall`)
      }
    }
  }
}

// The walker starts on cell `origin` (distance 0) with amplitude 1 on each of its d arcs (normalization d). The ball
// must have radius >= beats, so no wall is ever reached and the run is the infinite tiling's.
export function groverSpread(input: { graph: ArcGraph; distance: Int32Array; beats: number }): SpreadReading {
  const { graph, distance, beats } = input
  const coin = exactCoin(graph)
  const d = graph.degree
  const origin = distance.indexOf(0)

  checkWindow(graph, distance, beats)

  let x = new Array<bigint>(graph.cells * d).fill(0n)

  for (let j = 0; j < d; j++) {
    x[origin * d + j] = 1n
  }

  let scaleSquared = 1n
  let coneExcess = 0
  let unitaryDefects = 0

  const secondMoment: Ninth[] = []
  const returnProbability: Ninth[] = []
  const supportRadius: number[] = []

  for (let t = 1; t <= beats; t++) {
    x = groverBeat(graph, coin, x, null)
    scaleSquared *= coin.q * coin.q

    const norm = scaleSquared * BigInt(d)

    if (sumSquares(x) !== norm) {
      unitaryDefects++
    }

    let moment = 0n
    let radius = 0

    for (let v = 0; v < graph.cells; v++) {
      const w = cellWeight(graph, x, v)

      if (w === 0n) {
        continue
      }

      const r = distance[v]!

      radius = r > radius ? r : radius
      moment += BigInt(r * r) * w

      if (r > t) {
        coneExcess++
      }
    }

    secondMoment.push(rational(moment, norm))
    returnProbability.push(rational(cellWeight(graph, x, origin), norm))
    supportRadius.push(radius)
  }

  return { beats, secondMoment, returnProbability, supportRadius, coneExcess, unitaryDefects }
}

export type HitReading = {
  readonly beats: number
  // probability of first arriving on the target at beat t (monitored every beat), t = 1..beats
  readonly hit: readonly Ninth[]
  readonly cumulative: Ninth
  // beats before the target's distance with a nonzero hit (0: the cone holds)
  readonly earlyHits: number
}

// Monitored hitting: after every beat the target cell is measured; its weight is the first-arrival probability at that
// beat, and the walk continues from the rest (unnormalized, so the probabilities add up).
export function groverHitting(input: {
  graph: ArcGraph
  distance: Int32Array
  target: number
  beats: number
}): HitReading {
  const { graph, distance, target, beats } = input
  const coin = exactCoin(graph)
  const d = graph.degree
  const origin = distance.indexOf(0)

  checkWindow(graph, distance, beats)

  let x = new Array<bigint>(graph.cells * d).fill(0n)

  for (let j = 0; j < d; j++) {
    x[origin * d + j] = 1n
  }

  let scaleSquared = 1n
  let cumulative = ZERO
  let earlyHits = 0

  const hit: Ninth[] = []

  for (let t = 1; t <= beats; t++) {
    x = groverBeat(graph, coin, x, null)
    scaleSquared *= coin.q * coin.q

    const h = rational(cellWeight(graph, x, target), scaleSquared * BigInt(d))

    for (let j = 0; j < d; j++) {
      x[target * d + j] = 0n
    }

    hit.push(h)
    cumulative = add(cumulative, h)

    if (t < distance[target]! && !isZero(h)) {
      earlyHits++
    }
  }

  return { beats, hit, cumulative, earlyHits }
}

// ---------------------------------------------------------------------------------------------------------------------
// 6. The bare beat U
// ---------------------------------------------------------------------------------------------------------------------

export type BareLineReading = {
  readonly beats: number
  // sum over the line of k^2 * weight (k the line coordinate), t = 1..beats
  readonly secondMoment: readonly Ninth[]
  // weight on the start dock (both slots of the line)
  readonly dockReturn: readonly Ninth[]
  // weight on the start basis state (Q2's return probability)
  readonly basisReturn: readonly Ninth[]
  readonly supportRadius: readonly number[]
}

// A lone vibe on (dock 0, slot, tone, role) under U on the current mesh (Q2's line run).
export function bareLoneSpread(slot: number, tone: 1 | -1, role: number, beats: number): BareLineReading {
  const run = oneExcitationRun(slot, tone, role, beats)

  return {
    beats,
    secondMoment: run.map(r => r.secondMoment),
    dockReturn: run.map(r =>
      r.entries.filter(([k]) => k === 0).reduce((s, [, , a]) => add(s, mul(conj(a), a)), ZERO),
    ),
    basisReturn: run.map(r => r.returnProbability),
    supportRadius: run.map(r => r.supportRadius),
  }
}

function stateWeightOnDock(state: BeatState, dock: number): Ninth {
  let w = ZERO

  for (const [key, z] of state.amp) {
    if (decodeConfig(key).some(([d]) => d === dock)) {
      w = add(w, weightOf(z, state.den))
    }
  }

  return w
}

function withoutDock(state: BeatState, dock: number): BeatState {
  const amp = new Map(state.amp)

  for (const key of state.amp.keys()) {
    if (decodeConfig(key).some(([d]) => d === dock)) {
      amp.delete(key)
    }
  }

  return { amp, den: state.den }
}

function negateDock(state: BeatState, dock: number): BeatState {
  const amp = new Map(state.amp)

  for (const [key, z] of state.amp) {
    if (decodeConfig(key).some(([d]) => d === dock)) {
      amp.set(key, [-z[0], -z[1], -z[2], -z[3], -z[4], -z[5]])
    }
  }

  return { amp, den: state.den }
}

// Monitored hitting of a lone vibe on (dock 0, slot, tone, role) at `target`: after every beat the target dock is
// measured and its weight removed.
export function bareMonitoredHit(input: {
  slot: number
  tone: 1 | -1
  role: number
  target: number
  beats: number
  // the target's hop distance from dock 0: a hit before that beat breaks the one-hop cone
  targetDistance: number
}): HitReading {
  let state = basisKet([[0, input.slot, input.tone, input.role]])
  let cumulative = ZERO
  let earlyHits = 0

  const hit: Ninth[] = []

  for (let t = 1; t <= input.beats; t++) {
    state = applyBeat(state)

    const h = stateWeightOnDock(state, input.target)

    state = withoutDock(state, input.target)
    hit.push(h)
    cumulative = add(cumulative, h)

    if (t < input.targetDistance && !isZero(h)) {
      earlyHits++
    }
  }

  return { beats: input.beats, hit, cumulative, earlyHits }
}

export type BareSearchReading = {
  readonly radius: number
  readonly beats: number
  readonly oracle: boolean
  // basis states in the start (amplitude 1 each, so the start weight)
  readonly startStates: number
  // unnormalized weight on the marked dock after t beats, t = 0..beats (the ball-normalized probability divides by
  // 96 |B_R|, the number of one-excitation states of the ball)
  readonly markedWeight: readonly Ninth[]
  // terms found off the line of their slot through the marked dock (0: U and the oracle keep every lone vibe on its line)
  readonly offLineTerms: number
  // the total weight after t beats minus the start weight, nonzero beats (0: exact unitarity of oracle and U)
  readonly normDefects: number
}

// The marked dock is dock 0. The start holds every lone vibe (4 species) on the 12 lines through dock 0 out to line
// coordinate |k| <= radius, with both slots of its line (at dock 0 all 24 slots), amplitude 1 each: 96 (1 + 2 R)
// states. With `offLines` the start is instead every lone vibe on the 11 lines through the neighbour across slot 0
// that do not pass dock 0 (out to |k| <= radius): a negative control whose weight at dock 0 must stay exactly 0.
// Each beat: the oracle (sign -1 on every configuration with an excitation on dock 0) when on, then U.
export function bareLineSearch(input: {
  radius: number
  beats: number
  oracle: boolean
  offLines?: boolean
}): BareSearchReading {
  const { radius, beats } = input
  const reach = radius + beats + 1
  const center = input.offLines === true ? stepDock(0, 0) : 0
  const species: readonly (readonly [1 | -1, number])[] = [
    [1, 0],
    [1, 1],
    [-1, 0],
    [-1, 1],
  ]
  const lineDocks = new Map<number, Map<number, number>>()
  const terms: [Vibe[], Ninth][] = []

  LINES.forEach(([slotA, slotB], line) => {
    const chain = lineChain(center, slotA, reach)

    lineDocks.set(line, chain)

    if (input.offLines === true && line === LINE_OF_SLOT[0]) {
      return
    }

    for (const [dock, k] of chain) {
      if (k === 0 || (k < 0 ? -k : k) > radius) {
        continue
      }

      for (const s of [slotA, slotB]) {
        for (const [tone, role] of species) {
          terms.push([[[dock, s, tone, role]], ONE])
        }
      }
    }

    for (const s of [slotA, slotB]) {
      for (const [tone, role] of species) {
        if (input.offLines !== true) {
          terms.push([[[center, s, tone, role]], ONE])
        }
      }
    }
  })

  if (input.offLines === true) {
    // the neighbour itself on its 11 other lines
    LINES.forEach(([slotA, slotB], line) => {
      if (line === LINE_OF_SLOT[0]) {
        return
      }

      for (const s of [slotA, slotB]) {
        for (const [tone, role] of species) {
          terms.push([[[center, s, tone, role]], ONE])
        }
      }
    })
  }

  assertExact(OPPOSITE_SLOT.length === 24, 'the dock has 24 slots')

  let state = superpose(terms)

  const startWeight = BigInt(terms.length)
  const markedWeight: Ninth[] = [stateWeightOnDock(state, 0)]

  let offLineTerms = 0
  let normDefects = 0

  for (let t = 1; t <= beats; t++) {
    if (input.oracle) {
      state = negateDock(state, 0)
    }

    state = applyBeat(state)

    let total = ZERO

    for (const [key, z] of state.amp) {
      const vibes = decodeConfig(key)

      assertExact(vibes.length === 1, 'a lone vibe split into several excitations')

      const [dock, slot] = vibes[0]!

      if (!lineDocks.get(LINE_OF_SLOT[slot]!)!.has(dock)) {
        offLineTerms++
      }

      total = add(total, weightOf(z, state.den))
    }

    if (compareReal(total, rational(startWeight, 1n)) !== 0) {
      normDefects++
    }

    markedWeight.push(stateWeightOnDock(state, 0))
  }

  return {
    radius,
    beats,
    oracle: input.oracle,
    startStates: terms.length,
    markedWeight,
    offLineTerms,
    normDefects,
  }
}
