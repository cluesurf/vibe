// A Q2R-style reversible, energy-conserving spin-1 Blume-Capel rule on any cell graph (plan.md section 3, milestone
// M2-B of vibe/computation/models).
//
// Algebra spin-1: a tone is -1, 0 or +1, read as an integer spin. The energy is
//
//   E = -J sum over edges s_i s_j + Delta sum over cells s_i^2,
//
// with integer J >= 1 and integer Delta. The local energy of tone t at a cell whose neighbours sum to h is
// e(t) = -J t h + Delta t^2, so e(+1) = -J h + Delta, e(-1) = J h + Delta, e(0) = 0.
//
// THE RULE. A cell changes its tone only to another tone of the same local energy, by the transposition of the two
// degenerate tones:
//
//   J h = 0          swap +1 and -1 (the Q2R flip of Vichniac 1984 and Pomeau 1984), 0 stays
//   J h = Delta      swap +1 and 0
//   J h = -Delta     swap -1 and 0
//
// When Delta != 0 the three cases are disjoint. When Delta = 0 and h = 0 all three tones are degenerate; any choice
// that commutes with the negation s -> -s must fix 0 (f(0) = f(-0) = -f(0)), so the C-symmetric rule swaps +-1 and
// fixes 0 and conserves D = sum s^2: a D-changing rule at Delta = 0 has to be chiral (added structure). The local
// map is an involution for every h. Cells of one independent set share no edge, so while that set updates, every
// field h it reads is fixed: the update of one set is a bijection of the whole configuration that leaves E unchanged,
// and its inverse is itself. A round applies the sets in order; the inverse round applies them in the reverse order.
// No randomness: the dynamics is deterministic, exact integer arithmetic throughout.
//
// The schedule (decision 002) is declared added structure: a proper vertex coloring of the cell graph by a greedy
// pass in a canonical order (breadth-first from cell 0, or that order reversed), applied in forward or reversed color
// order. The same construction is used on every graph, so the two sides of a degree-matched pair (decision 001,
// audit-m1 finding F) carry ONE schedule family.
//
// Q = sum s (magnetization) and D = sum s^2 are NOT conserved by this rule (a flip changes Q by 2, a vacancy move D
// by 1); they are book-kept exactly, move by move, and checked against a recount.
//
// Reading equilibrium without a heat bath: in a large microcanonical system a single cell is a canonical subsystem,
// so given its field h its tone should follow P(t | h) ~ exp(-beta e(t)). Counting tones per field over time gives
// two independent estimates of beta, the flip channel ln(n(+1,h) / n(-1,h)) = 2 beta J h and the vacancy channel
// ln(n(+1,h) n(-1,h) / n(0,h)^2) = -2 beta Delta (which reads Delta and nothing else). Agreement across h and across
// the two channels is a falsifiable test that a Boltzmann distribution emerged. The logarithms are a READING, in
// floating point; the dynamics never sees them.

// ---- the model and the graph ----

export type BlumeCapel = {
  // the exchange J, an integer >= 1
  readonly coupling: number
  // the crystal field Delta, an integer
  readonly crystalField: number
}

export type CellGraph = {
  readonly cells: number
  // CSR: neighbours of cell c are adjacency[offsets[c]] .. adjacency[offsets[c + 1] - 1]
  readonly offsets: Int32Array
  readonly adjacency: Int32Array
  readonly maxDegree: number
  readonly minDegree: number
  // undirected edges, each counted once (an entry j in the list of i and i in the list of j is one edge)
  readonly edges: number
}

// Build the CSR graph. Fails closed on a self-loop (a cell next to itself is in no independent set) or an asymmetric
// list (an edge seen from one side only would break the energy bookkeeping).
export function cellGraph(neighbors: readonly (readonly number[])[]): CellGraph {
  const cells = neighbors.length
  const offsets = new Int32Array(cells + 1)

  for (let c = 0; c < cells; c++) {
    offsets[c + 1] = offsets[c]! + neighbors[c]!.length
  }

  const adjacency = new Int32Array(offsets[cells]!)

  let maxDegree = 0
  let minDegree = cells === 0 ? 0 : Number.MAX_SAFE_INTEGER

  for (let c = 0; c < cells; c++) {
    const row = neighbors[c]!

    maxDegree = Math.max(maxDegree, row.length)
    minDegree = Math.min(minDegree, row.length)

    for (let k = 0; k < row.length; k++) {
      const n = row[k]!

      if (!Number.isInteger(n) || n < 0 || n >= cells) {
        throw new Error(`spin-one-q2r: cell ${c} has neighbour ${n} outside the graph`)
      }

      if (n === c) {
        throw new Error(`spin-one-q2r: cell ${c} is its own neighbour`)
      }

      adjacency[offsets[c]! + k] = n
    }
  }

  // symmetry: the multiset of (c, n) equals the multiset of (n, c)
  const count = new Map<string, number>()

  for (let c = 0; c < cells; c++) {
    for (const n of neighbors[c]!) {
      const key = `${c},${n}`

      count.set(key, (count.get(key) ?? 0) + 1)
    }
  }

  for (const [key, k] of count) {
    const [a, b] = key.split(',')

    if (count.get(`${b},${a}`) !== k) {
      throw new Error(`spin-one-q2r: edge ${key} is not symmetric`)
    }
  }

  return { cells, offsets, adjacency, maxDegree, minDegree, edges: adjacency.length / 2 }
}

// Breadth-first order from cell 0 over every component (each new component from its lowest unvisited cell).
export function breadthFirstOrder(graph: CellGraph): Int32Array {
  const order = new Int32Array(graph.cells)
  const seen = new Uint8Array(graph.cells)

  let head = 0
  let tail = 0

  for (let start = 0; start < graph.cells; start++) {
    if (seen[start]) {
      continue
    }

    seen[start] = 1
    order[tail++] = start

    while (head < tail) {
      const c = order[head++]!

      for (let k = graph.offsets[c]!; k < graph.offsets[c + 1]!; k++) {
        const n = graph.adjacency[k]!

        if (!seen[n]) {
          seen[n] = 1
          order[tail++] = n
        }
      }
    }
  }

  return order
}

// ---- the independent-set schedule ----

export type ColoringMethod = 'greedy-bfs' | 'greedy-reverse-bfs'

export type ColorOrder = 'forward' | 'reverse'

export type IndependentSetSchedule = {
  readonly method: ColoringMethod
  readonly colorOrder: ColorOrder
  readonly colors: number
  // classes[k]: the cells of the k-th set applied in a round, ascending
  readonly classes: readonly Int32Array[]
  // colorOf[c]: the index into classes of the set holding c
  readonly colorOf: Int32Array
}

// A greedy proper vertex coloring: cells visited in the method's canonical order, each given the least color none of
// its colored neighbours has. Deterministic, defined the same way on every graph.
export function independentSetSchedule(input: {
  graph: CellGraph
  method: ColoringMethod
  colorOrder: ColorOrder
}): IndependentSetSchedule {
  const { graph } = input
  const bfs = breadthFirstOrder(graph)
  const order = input.method === 'greedy-bfs' ? bfs : Int32Array.from(bfs).reverse()
  const color = new Int32Array(graph.cells).fill(-1)
  const used = new Uint8Array(graph.maxDegree + 2)

  let colors = 0

  for (const c of order) {
    used.fill(0)

    for (let k = graph.offsets[c]!; k < graph.offsets[c + 1]!; k++) {
      const n = color[graph.adjacency[k]!]!

      if (n >= 0) {
        used[n] = 1
      }
    }

    let pick = 0

    while (used[pick]) {
      pick++
    }

    color[c] = pick
    colors = Math.max(colors, pick + 1)
  }

  const raw: number[][] = Array.from({ length: colors }, () => [])

  for (let c = 0; c < graph.cells; c++) {
    raw[color[c]!]!.push(c)
  }

  const sequence = input.colorOrder === 'forward' ? raw : [...raw].reverse()
  const classes = sequence.map(cells => Int32Array.from(cells))
  const colorOf = new Int32Array(graph.cells)

  classes.forEach((cells, k) => {
    for (const c of cells) {
      colorOf[c] = k
    }
  })

  return { method: input.method, colorOrder: input.colorOrder, colors, classes, colorOf }
}

export type ScheduleCheck = {
  // no edge inside one set
  readonly independent: boolean
  // every cell in exactly one set
  readonly covers: boolean
}

export function checkIndependentSchedule(graph: CellGraph, schedule: IndependentSetSchedule): ScheduleCheck {
  const hits = new Int32Array(graph.cells)

  let independent = true

  schedule.classes.forEach((cells, k) => {
    for (const c of cells) {
      hits[c]!++

      if (schedule.colorOf[c] !== k) {
        independent = false
      }

      for (let j = graph.offsets[c]!; j < graph.offsets[c + 1]!; j++) {
        if (schedule.colorOf[graph.adjacency[j]!] === k) {
          independent = false
        }
      }
    }
  })

  return { independent, covers: hits.every(h => h === 1) }
}

// ---- the local map ----

// The involution of the tones degenerate in local energy at field h (see the header). Exact integers.
export function q2rMove(tone: number, field: number, model: BlumeCapel): number {
  const jh = model.coupling * field
  const delta = model.crystalField

  if (tone !== 0) {
    if (jh === 0) {
      return -tone
    }

    // e(tone) = -tone jh + delta equals e(0) = 0
    if (-tone * jh + delta === 0) {
      return 0
    }

    return tone
  }

  if (jh === 0) {
    return 0
  }

  if (-jh + delta === 0) {
    return 1
  }

  if (jh + delta === 0) {
    return -1
  }

  return 0
}

export type LocalMove = (tone: number, field: number, model: BlumeCapel) => number

export function localEnergy(tone: number, field: number, model: BlumeCapel): number {
  return -model.coupling * tone * field + model.crystalField * tone * tone
}

// ---- configurations ----

export function fieldsOf(graph: CellGraph, state: Int8Array): Int32Array {
  const field = new Int32Array(graph.cells)

  for (let c = 0; c < graph.cells; c++) {
    let h = 0

    for (let k = graph.offsets[c]!; k < graph.offsets[c + 1]!; k++) {
      h += state[graph.adjacency[k]!]!
    }

    field[c] = h
  }

  return field
}

// The energy recounted from scratch: -J sum over edges s_i s_j + Delta sum s_i^2, the edge sum as (sum_i s_i h_i) / 2.
export function totalEnergy(graph: CellGraph, model: BlumeCapel, state: Int8Array): number {
  const field = fieldsOf(graph, state)

  let bond = 0
  let squares = 0

  for (let c = 0; c < graph.cells; c++) {
    bond += state[c]! * field[c]!
    squares += state[c]! * state[c]!
  }

  if (bond % 2 !== 0) {
    throw new Error('spin-one-q2r: odd doubled bond sum, the graph is not symmetric')
  }

  return -model.coupling * (bond / 2) + model.crystalField * squares
}

export function chargeOf(state: Int8Array): { q: number; d: number } {
  let q = 0
  let d = 0

  for (const s of state) {
    q += s
    d += s * s
  }

  return { q, d }
}

// The ground energy of a z-regular closed graph: the lower of all +1 (-J edges + Delta N) and all 0 (0). On a
// z-regular graph the two cross at Delta = z J / 2 exactly, the T = 0 end of the Blume-Capel phase boundary.
export function groundEnergy(graph: CellGraph, model: BlumeCapel): number {
  return Math.min(-model.coupling * graph.edges + model.crystalField * graph.cells, 0)
}

// ---- structured initial states (no randomness) ----

function fibonacciAbove(n: number): [number, number] {
  let a = 1
  let b = 2

  while (b < n) {
    ;[a, b] = [b, a + b]
  }

  return [a, b]
}

export type ToneFractions = {
  // fraction of cells at -1, as [numerator, denominator]
  readonly minus: readonly [number, number]
  // fraction at 0
  readonly zero: readonly [number, number]
}

// The Fibonacci (Sturmian) pattern: the cell of breadth-first rank r reads v(r) = r F_{k-1} mod F_k (F_k the first
// Fibonacci number >= N), a quasi-periodic low-discrepancy sequence, and takes -1 when v < minus F_k, 0 when
// v < (minus + zero) F_k, +1 otherwise. Integer comparisons only. A structured state, not a random one.
export function fibonacciState(graph: CellGraph, fractions: ToneFractions): Int8Array {
  const [prev, fib] = fibonacciAbove(graph.cells)
  const order = breadthFirstOrder(graph)
  const state = new Int8Array(graph.cells)
  const [mn, md] = fractions.minus
  const [zn, zd] = fractions.zero

  for (let r = 0; r < graph.cells; r++) {
    const v = (r * prev) % fib
    // v / fib < mn / md  <=>  v md < mn fib
    const c = order[r]!

    if (v * md < mn * fib) {
      state[c] = -1
    } else if (v * md * zd < (mn * zd + zn * md) * fib) {
      state[c] = 0
    } else {
      state[c] = 1
    }
  }

  return state
}

// A deterministic quench to a target energy: sweeps in breadth-first order, each cell set to the tone of least local
// energy (a tie keeps the current tone, then prefers the lower tone), stopping the moment E <= target. Returns null
// when a full sweep lowers nothing and E is still above the target. This prepares a state; it is not the dynamics.
export function quenchToEnergy(input: {
  graph: CellGraph
  model: BlumeCapel
  state: Int8Array
  target: number
}): { state: Int8Array; energy: number } | null {
  const { graph, model } = input
  const state = Int8Array.from(input.state)
  const field = fieldsOf(graph, state)
  const order = breadthFirstOrder(graph)

  let energy = totalEnergy(graph, model, state)

  while (energy > input.target) {
    let changed = false

    for (const c of order) {
      const s = state[c]!
      const h = field[c]!

      let best = s
      let bestEnergy = localEnergy(s, h, model)

      for (const t of [-1, 0, 1]) {
        const e = localEnergy(t, h, model)

        if (e < bestEnergy) {
          best = t
          bestEnergy = e
        }
      }

      if (best !== s) {
        energy += bestEnergy - localEnergy(s, h, model)
        state[c] = best
        changed = true

        for (let k = graph.offsets[c]!; k < graph.offsets[c + 1]!; k++) {
          field[graph.adjacency[k]!]! += best - s
        }

        if (energy <= input.target) {
          return { state, energy }
        }
      }
    }

    if (!changed) {
      return null
    }
  }

  return { state, energy }
}

// ---- the dynamics ----

export type RunCounts = {
  // tone-per-field counts: index (tone + 1) * width + (field + maxDegree), width = 2 maxDegree + 1
  readonly counts: Float64Array
  readonly width: number
  readonly maxDegree: number
}

export function emptyCounts(graph: CellGraph): RunCounts {
  const width = 2 * graph.maxDegree + 1

  return { counts: new Float64Array(3 * width), width, maxDegree: graph.maxDegree }
}

export class SpinOneQ2r {
  readonly graph: CellGraph
  readonly model: BlumeCapel
  readonly schedule: IndependentSetSchedule
  readonly state: Int8Array
  readonly field: Int32Array
  readonly move: LocalMove
  // book-kept move by move
  q: number
  d: number
  // the sum of local energy changes of every applied move (zero for the rule)
  energyChange: number
  moves: number

  constructor(input: {
    graph: CellGraph
    model: BlumeCapel
    schedule: IndependentSetSchedule
    state: Int8Array
    // the local map, q2rMove unless a negative control swaps it
    move?: LocalMove
  }) {
    if (!Number.isInteger(input.model.coupling) || input.model.coupling < 1) {
      throw new Error('spin-one-q2r: J must be an integer >= 1')
    }

    if (!Number.isInteger(input.model.crystalField)) {
      throw new Error('spin-one-q2r: Delta must be an integer')
    }

    if (input.state.length !== input.graph.cells || input.state.some(s => s < -1 || s > 1)) {
      throw new Error('spin-one-q2r: a state is one tone in {-1, 0, +1} per cell')
    }

    this.graph = input.graph
    this.model = input.model
    this.schedule = input.schedule
    this.state = Int8Array.from(input.state)
    this.field = fieldsOf(input.graph, this.state)
    this.move = input.move ?? q2rMove

    const { q, d } = chargeOf(this.state)

    this.q = q
    this.d = d
    this.energyChange = 0
    this.moves = 0
  }

  private applySet(cells: Int32Array): void {
    const { state, field, graph, model, move } = this
    const { offsets, adjacency } = graph

    for (const c of cells) {
      const s = state[c]!
      const h = field[c]!
      const t = move(s, h, model)

      if (t === s) {
        continue
      }

      state[c] = t
      this.q += t - s
      this.d += t * t - s * s
      this.energyChange += localEnergy(t, h, model) - localEnergy(s, h, model)
      this.moves++

      const delta = t - s

      for (let k = offsets[c]!; k < offsets[c + 1]!; k++) {
        field[adjacency[k]!]! += delta
      }
    }
  }

  round(): void {
    for (const cells of this.schedule.classes) {
      this.applySet(cells)
    }
  }

  // The inverse of round() for an involutive local map: the sets in reverse order.
  inverseRound(): void {
    for (let k = this.schedule.classes.length - 1; k >= 0; k--) {
      this.applySet(this.schedule.classes[k]!)
    }
  }

  accumulate(counts: RunCounts): void {
    const { state, field } = this

    for (let c = 0; c < state.length; c++) {
      counts.counts[(state[c]! + 1) * counts.width + field[c]! + counts.maxDegree]!++
    }
  }
}

// A synchronous step (every cell reads the old fields at once), the negative control for the schedule: it is not
// energy-conserving, because neighbours that both move each read a field the other changes.
export function synchronousStep(graph: CellGraph, model: BlumeCapel, state: Int8Array): Int8Array {
  const field = fieldsOf(graph, state)

  return Int8Array.from(state, (s, c) => q2rMove(s, field[c]!, model))
}

// ---- one microcanonical run ----

export type MicrocanonicalRun = {
  readonly cells: number
  readonly energy: number
  readonly energyPerCell: number
  readonly rounds: number
  readonly moves: number
  // mean |Q| / N and D / N over the measured rounds, and |Q| / N over each half
  readonly absMagnetization: number
  readonly occupation: number
  readonly firstHalfAbsMagnetization: number
  readonly secondHalfAbsMagnetization: number
  readonly counts: RunCounts
  // exact gates of the run
  readonly energyConserved: boolean
  readonly bookkeepingExact: boolean
  readonly finalState: Int8Array
}

export function runMicrocanonical(input: {
  graph: CellGraph
  model: BlumeCapel
  schedule: IndependentSetSchedule
  state: Int8Array
  burn: number
  measure: number
  // a full energy and charge recount every this many rounds (and at the end)
  checkEvery?: number
}): MicrocanonicalRun {
  const { graph, model } = input
  const run = new SpinOneQ2r({ graph, model, schedule: input.schedule, state: input.state })
  const energy = totalEnergy(graph, model, input.state)
  const counts = emptyCounts(graph)
  const checkEvery = input.checkEvery ?? 250

  let energyConserved = true
  let bookkeepingExact = true
  let absM = 0
  let occ = 0
  let firstHalf = 0
  let secondHalf = 0

  const half = Math.floor(input.measure / 2)

  const check = (): void => {
    if (totalEnergy(graph, model, run.state) !== energy || run.energyChange !== 0) {
      energyConserved = false
    }

    const recount = chargeOf(run.state)

    if (recount.q !== run.q || recount.d !== run.d) {
      bookkeepingExact = false
    }

    const field = fieldsOf(graph, run.state)

    for (let c = 0; c < graph.cells; c++) {
      if (field[c] !== run.field[c]) {
        bookkeepingExact = false
        break
      }
    }
  }

  const total = input.burn + input.measure

  for (let t = 1; t <= total; t++) {
    run.round()

    if (t % checkEvery === 0) {
      check()
    }

    if (t > input.burn) {
      const m = Math.abs(run.q) / graph.cells

      absM += m
      occ += run.d / graph.cells

      if (t - input.burn <= half) {
        firstHalf += m
      } else {
        secondHalf += m
      }

      run.accumulate(counts)
    }
  }

  check()

  return {
    cells: graph.cells,
    energy,
    energyPerCell: energy / graph.cells,
    rounds: total,
    moves: run.moves,
    absMagnetization: absM / input.measure,
    occupation: occ / input.measure,
    firstHalfAbsMagnetization: firstHalf / Math.max(half, 1),
    secondHalfAbsMagnetization: secondHalf / Math.max(input.measure - half, 1),
    counts,
    energyConserved,
    bookkeepingExact,
    finalState: Int8Array.from(run.state),
  }
}

// Forward `rounds` rounds then the same number of inverse rounds: true when the start comes back cell for cell.
export function inverseRestores(input: {
  graph: CellGraph
  model: BlumeCapel
  schedule: IndependentSetSchedule
  state: Int8Array
  rounds: number
  move?: LocalMove
}): boolean {
  const run = new SpinOneQ2r(input)

  for (let t = 0; t < input.rounds; t++) {
    run.round()
  }

  for (let t = 0; t < input.rounds; t++) {
    run.inverseRound()
  }

  return run.state.every((s, c) => s === input.state[c])
}

// ---- the temperature reading ----

export type ChannelPoint = { field: number; beta: number; samples: number }

export type TemperatureReading = {
  // pooled beta of each channel, NaN when the channel has no usable field
  readonly betaFlip: number
  readonly betaVacancy: number
  readonly flipPoints: readonly ChannelPoint[]
  readonly vacancyPoints: readonly ChannelPoint[]
  // the largest |beta_h - pooled| over the used fields of each channel, NaN when unused
  readonly flipSpread: number
  readonly vacancySpread: number
}

// Read beta from tone-per-field counts. A field enters a channel only when each count it needs is at least
// minCount. Points are pooled with inverse-variance weights of independent counts (a weighting, not an error bar:
// samples are correlated in time and space).
export function readTemperature(input: {
  counts: RunCounts
  model: BlumeCapel
  minCount: number
}): TemperatureReading {
  const { counts, model, minCount } = input
  const at = (tone: number, h: number): number => counts.counts[(tone + 1) * counts.width + h + counts.maxDegree]!
  const flipPoints: ChannelPoint[] = []
  const vacancyPoints: ChannelPoint[] = []

  let flipW = 0
  let flipSum = 0
  let vacW = 0
  let vacSum = 0

  for (let h = -counts.maxDegree; h <= counts.maxDegree; h++) {
    const plus = at(1, h)
    const minus = at(-1, h)
    const zero = at(0, h)

    if (h !== 0 && plus >= minCount && minus >= minCount) {
      const scale = 2 * model.coupling * h
      const beta = Math.log(plus / minus) / scale
      const w = (scale * scale) / (1 / plus + 1 / minus)

      flipPoints.push({ field: h, beta, samples: plus + minus })
      flipW += w
      flipSum += w * beta
    }

    if (model.crystalField !== 0 && plus >= minCount && minus >= minCount && zero >= minCount) {
      const scale = -2 * model.crystalField
      const beta = Math.log((plus * minus) / (zero * zero)) / scale
      const w = (scale * scale) / (1 / plus + 1 / minus + 4 / zero)

      vacancyPoints.push({ field: h, beta, samples: plus + minus + zero })
      vacW += w
      vacSum += w * beta
    }
  }

  const betaFlip = flipW > 0 ? flipSum / flipW : Number.NaN
  const betaVacancy = vacW > 0 ? vacSum / vacW : Number.NaN
  const spread = (points: ChannelPoint[], pooled: number): number =>
    points.length === 0 ? Number.NaN : Math.max(...points.map(p => Math.abs(p.beta - pooled)))

  return {
    betaFlip,
    betaVacancy,
    flipPoints,
    vacancyPoints,
    flipSpread: spread(flipPoints, betaFlip),
    vacancySpread: spread(vacancyPoints, betaVacancy),
  }
}

// ---- an energy sweep: one structured start per target energy ----

export type SweepPoint = {
  // the target step k of `steps` between the ground energy and the hot start's energy
  readonly step: number
  readonly target: number
  readonly start: 'warm' | 'hot'
  readonly run: MicrocanonicalRun
  readonly temperature: TemperatureReading
  readonly startTemperature: TemperatureReading
  // the reading's minimum count, max(100, samples / 1000)
  readonly minCount: number
}

export type SweepStarts = {
  // magnetized, quenched down to targets at or below its energy
  readonly warm: ToneFractions
  // unmagnetized, quenched down to every higher target
  readonly hot: ToneFractions
}

// The Ising limit has no vacancy at the start; with |Delta| > z J no vacancy move exists, so none ever appears.
export function sweepStarts(isingLimit: boolean): SweepStarts {
  return isingLimit
    ? { warm: { minus: [3, 10], zero: [0, 1] }, hot: { minus: [1, 2], zero: [0, 1] } }
    : { warm: { minus: [1, 5], zero: [1, 5] }, hot: { minus: [1, 3], zero: [1, 3] } }
}

// Targets E_k = E_ground + k (E_hot - E_ground) / steps for k = 1 .. steps - 1, each prepared by a quench of the warm
// start (when E_k is at or below its energy) or of the hot start, then run microcanonically. A target the quench
// cannot reach is left out (reported by the caller from the step numbers).
export function energySweep(input: {
  graph: CellGraph
  model: BlumeCapel
  schedule: IndependentSetSchedule
  starts: SweepStarts
  steps: number
  burn: number
  measure: number
}): SweepPoint[] {
  const { graph, model } = input
  const warm = fibonacciState(graph, input.starts.warm)
  const hot = fibonacciState(graph, input.starts.hot)
  const ground = groundEnergy(graph, model)
  const hotEnergy = totalEnergy(graph, model, hot)
  const warmEnergy = totalEnergy(graph, model, warm)
  const points: SweepPoint[] = []
  const minCount = Math.max(100, Math.floor((graph.cells * input.measure) / 1000))

  for (let k = 1; k < input.steps; k++) {
    const target = ground + Math.round(((hotEnergy - ground) * k) / input.steps)
    const useWarm = target <= warmEnergy
    const start = quenchToEnergy({ graph, model, state: useWarm ? warm : hot, target })

    if (!start) {
      continue
    }

    const run = runMicrocanonical({
      graph,
      model,
      schedule: input.schedule,
      state: start.state,
      burn: input.burn,
      measure: input.measure,
    })
    const startCounts = emptyCounts(graph)

    new SpinOneQ2r({ graph, model, schedule: input.schedule, state: start.state }).accumulate(startCounts)

    points.push({
      step: k,
      target,
      start: useWarm ? 'warm' : 'hot',
      run,
      temperature: readTemperature({ counts: run.counts, model, minCount }),
      startTemperature: readTemperature({ counts: startCounts, model, minCount: 20 }),
      minCount,
    })
  }

  return points
}

// ---- the exact square-lattice Ising reference (the positive control's comparison, floating point) ----

// The complete elliptic integral of the first kind K(k) by the arithmetic-geometric mean.
function ellipticK(k: number): number {
  let a = 1
  let b = Math.sqrt(1 - k * k)

  for (let i = 0; i < 60 && Math.abs(a - b) > 1e-15; i++) {
    ;[a, b] = [(a + b) / 2, Math.sqrt(a * b)]
  }

  return Math.PI / (2 * a)
}

// Onsager (1944): the energy per site of the square-lattice Ising model at coupling J = 1, inverse temperature beta,
// e = -coth(2 beta) [1 + (2 / pi) (2 tanh^2(2 beta) - 1) K(k)], k = 2 sinh(2 beta) / cosh^2(2 beta).
export function onsagerEnergy(beta: number): number {
  const t = 2 * beta
  const k = (2 * Math.sinh(t)) / Math.cosh(t) ** 2
  const kk = Math.min(k, 1 - 1e-15)

  return -(1 / Math.tanh(t)) * (1 + (2 / Math.PI) * (2 * Math.tanh(t) ** 2 - 1) * ellipticK(kk))
}

// Yang (1952): the spontaneous magnetization (1 - sinh(2 beta)^-4)^(1/8) above beta_c = ln(1 + sqrt 2) / 2, else 0.
export function yangMagnetization(beta: number): number {
  const s = Math.sinh(2 * beta)

  return s > 1 ? (1 - s ** -4) ** 0.125 : 0
}

export const ISING_BETA_CRITICAL = Math.log(1 + Math.SQRT2) / 2

// The inverse of onsagerEnergy on (0, infinity), by bisection (the energy rises monotonically with temperature).
export function onsagerBetaOfEnergy(energy: number): number {
  let lo = 1e-6
  let hi = 20

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2

    // larger beta, lower energy
    if (onsagerEnergy(mid) > energy) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return (lo + hi) / 2
}

// ---- a byte fingerprint for the determinism gate ----

export function fingerprint(parts: readonly (Int8Array | Float64Array | number)[]): string {
  let h = 0x811c9dc5

  const mix = (x: number): void => {
    h ^= x & 0xff
    h = Math.imul(h, 0x01000193) >>> 0
  }

  for (const part of parts) {
    if (typeof part === 'number') {
      for (const ch of String(part)) {
        mix(ch.charCodeAt(0))
      }

      mix(0x2c)
      continue
    }

    for (const x of part) {
      for (const ch of String(x)) {
        mix(ch.charCodeAt(0))
      }

      mix(0x2c)
    }
  }

  return h.toString(16).padStart(8, '0')
}
