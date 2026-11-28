// M2-B: a Q2R-style reversible, energy-conserving spin-1
// Blume-Capel rule on every lab geometry. Does an equilibrium magnetization and energy curve emerge from
// deterministic reversible dynamics alone, with no heat bath and no randomness, and does anything differ between flat
// and degree-matched hyperbolic geometries under one schedule family? Code: code/rule/spin-one-q2r.ts.
//
// Algebra spin-1, energy E = -J sum s_i s_j + Delta sum s_i^2 with integer J, Delta. A cell moves only between two
// tones of equal local energy (Q2R flip at J h = 0, vacancy moves at J h = +-Delta), one independent set at a time,
// so every round conserves E exactly and its inverse is the sets in reverse order. Schedule (declared structure):
// a greedy vertex coloring in breadth-first order ('greedy-bfs') or its reverse
// ('greedy-reverse-bfs'), the SAME family on both sides of every matched pair (audit-m1 finding F). Boundary: closed
// (rings, flat tori, the closed quotients of tiling-quotient.ts), so E is conserved with no exchange at all.
// Microcanonical: every run starts from a structured state at a fixed energy (an integer Fibonacci-Kronecker tone
// pattern, quenched deterministically down to the target energy), never from a draw.
//
// Temperature is READ, never imposed: given its field h a cell's tones should follow exp(-beta e(t)), so the flip
// channel ln(n(+,h)/n(-,h)) = 2 beta J h and the vacancy channel ln(n(+,h) n(-,h)/n(0,h)^2) = -2 beta Delta give beta
// per field. A run is EQUILIBRATED when it moves, the flip channel has two or more fields agreeing within
// 0.05 + 0.05 beta, and (when vacancies and spins coexist) the vacancy channel agrees within 0.05 + 0.1 beta across
// fields and within 0.03 + 0.05 beta with the flip channel. These thresholds were fixed after one probe of the square
// torus (tmp/q2r-probe.ts) and not changed after.
//
// GATES (fail the experiment):
// G1 exhaustive, on every state of a ring of 8, the 3 x 3 square torus and the Petersen graph (cubic), for six
//    crystal fields and two schedules: a round conserves E, is a bijection, and the inverse round restores the state;
//    at Delta = 0 the C-symmetric rule conserves D on every state.
// G2 every schedule is a proper coloring covering every cell; every run conserves E (recount every 250 rounds and
//    the summed local energy changes are 0) and its book-kept Q, D and fields equal a recount.
// G3 inverse restores: on every geometry and crystal field, 300 rounds forward then 300 back return the start.
// G4 determinism: the positive-control Blume-Capel sweep run twice gives identical bytes.
// G5 the Ising limit (|Delta| > z J, no vacancy) on an odd-degree graph never moves (h is odd, never 0): a theorem
//    the run must reproduce.
// POSITIVE CONTROL, the square torus 32 x 32 (the checkerboard Q2R of Vichniac 1984, Pomeau 1984, Herrmann 1986):
// P1 Ising limit: on equilibrated runs the read beta equals Onsager's beta(e) (1944) within 3 percent;
// P2 Ising limit: |m| equals Yang's spontaneous magnetization (1952) at Onsager's beta(e) within 0.04 where
//    beta(e) >= beta_c + 0.02;
// P3 Ising limit: |m| crosses 1/2 at a read temperature within 2 percent of T_c = 2 / ln(1 + sqrt 2);
// P4 Blume-Capel Delta = 1: |m| crosses 1/2 within 5 percent of T_c(Delta = 1) = 1.398 (Zierenberg, Fytas, Weigel,
//    Janke, Malakis, Eur. Phys. J. Special Topics 226, 789 (2017), Table 1: Beale 1.398, Malakis et al. 1.398(2));
// P5 Blume-Capel Delta = 1: every run with read beta below 1 / 1.398 is equilibrated, so the flip and vacancy
//    channels agree: the crystal field Delta is read back from the dynamics;
// P6 Blume-Capel Delta = 3 > z J / 2 = 2 (paramagnetic at every T on the phase diagram): |m| <= 0.05 at every energy
//    and the lowest energy has occupation D / N <= 0.1.
// NEGATIVE CONTROLS (each must trip): N1 a synchronous update of every cell changes E on some state of the 3 x 3
// torus and is not a bijection; N2 a local map that merges -1 into +1 at h = 0 is not a bijection and its inverse
// fails; N3 a crystal field with Delta / J not an integer (J = 2, Delta = 3) has no vacancy move, so D is frozen and no
// run on the square torus is equilibrated; N4 the start of every positive-control run that reads below T_c, read as
// one snapshot, is not equilibrated (the reading is not satisfied by construction). Lightly quenched starts sit at
// high temperature, where tones nearly independent of the field pass the reading; they are counted, not gated (4 of
// all starts and then 3 of the warm-quenched ones passed in the first two runs, which is why the control is scoped to
// runs below T_c).
//
// FINDINGS (reported, not gated): which runs equilibrate on every geometry, the curves |m|, D / N and e against the
// read beta, and per matched pair and crystal field, under EACH schedule family separately, the beta interval that
// holds the |m| = 1/2 crossing on each side: 'differs' when the intervals are disjoint the same way under both
// families, 'agrees' when they overlap under both, else 'unresolved' (a side without equilibrated runs, or families
// that disagree). The |m| gap between the curves and the spread between the two schedules are reported beside it.

import { performance } from 'node:perf_hooks'
import {
  cellGraph,
  checkIndependentSchedule,
  chargeOf,
  energySweep,
  fingerprint,
  independentSetSchedule,
  inverseRestores,
  ISING_BETA_CRITICAL,
  onsagerBetaOfEnergy,
  q2rMove,
  SpinOneQ2r,
  sweepStarts,
  synchronousStep,
  totalEnergy,
  yangMagnetization,
  type BlumeCapel,
  type CellGraph,
  type ColoringMethod,
  type LocalMove,
  type SweepPoint,
} from '@/code/rule/spin-one-q2r'
import {
  closedQuotients,
  findRotaryMap,
  referenceTiling,
  squareTorus,
  triangleTorus,
} from '@/code/substrate/tiling-quotient'
import { torusGrid } from '@/code/substrate/torus-grid'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'

type Check = { name: string; ok: boolean }

const METHODS: readonly ColoringMethod[] = ['greedy-bfs', 'greedy-reverse-bfs']

// ---- the equilibrium reading ----

function equilibrated(point: SweepPoint, model: BlumeCapel): boolean {
  const t = point.temperature
  const b = Math.abs(t.betaFlip)
  const flip = t.flipPoints.length >= 2 && t.flipSpread <= 0.05 + 0.05 * b
  const mixed = model.crystalField !== 0 && point.run.occupation < 1
  const vacancy =
    !mixed ||
    (t.vacancyPoints.length >= 1 &&
      t.vacancySpread <= 0.05 + 0.1 * b &&
      Math.abs(t.betaFlip - t.betaVacancy) <= 0.03 + 0.05 * b)

  return point.run.moves > 0 && flip && vacancy
}

// the same reading on the quenched start (one snapshot)
function startEquilibrated(point: SweepPoint, model: BlumeCapel): boolean {
  return equilibrated({ ...point, temperature: point.startTemperature, run: { ...point.run, moves: 1 } }, model)
}

// beta where |m| crosses 1/2 along the sweep (energy order), linear in beta; NaN when it never crosses
function halfCrossing(points: readonly SweepPoint[]): number {
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!
    const b = points[i]!
    const ma = a.run.absMagnetization
    const mb = b.run.absMagnetization

    if (ma >= 0.5 && mb < 0.5 && Number.isFinite(a.temperature.betaFlip) && Number.isFinite(b.temperature.betaFlip)) {
      const f = (ma - 0.5) / (ma - mb)

      return a.temperature.betaFlip + f * (b.temperature.betaFlip - a.temperature.betaFlip)
    }
  }

  return Number.NaN
}

// ---- G1 and N1, N2: exhaustive checks on small graphs ----

function petersen(): number[][] {
  const n: number[][] = Array.from({ length: 10 }, () => [])

  const edge = (a: number, b: number): void => {
    n[a]!.push(b)
    n[b]!.push(a)
  }

  for (let i = 0; i < 5; i++) {
    edge(i, (i + 1) % 5)
    edge(i, i + 5)
    edge(i + 5, ((i + 2) % 5) + 5)
  }

  return n
}

function decode(index: number, cells: number, out: Int8Array): void {
  let x = index

  for (let c = 0; c < cells; c++) {
    out[c] = (x % 3) - 1
    x = Math.floor(x / 3)
  }
}

function encode(state: Int8Array): number {
  let x = 0

  for (let c = state.length - 1; c >= 0; c--) {
    x = x * 3 + state[c]! + 1
  }

  return x
}

type Exhaustive = { states: number; energyKept: boolean; bijective: boolean; inverseRestores: boolean; dKept: boolean }

function exhaustive(input: {
  graph: CellGraph
  model: BlumeCapel
  method: ColoringMethod
  move?: LocalMove
  synchronous?: boolean
}): Exhaustive {
  const { graph, model } = input
  const schedule = independentSetSchedule({ graph, method: input.method, colorOrder: 'forward' })
  const total = 3 ** graph.cells
  const seen = new Uint8Array(total)
  const state = new Int8Array(graph.cells)

  let energyKept = true
  let bijective = true
  let restores = true
  let dKept = true

  for (let i = 0; i < total; i++) {
    decode(i, graph.cells, state)

    const e = totalEnergy(graph, model, state)
    const d = chargeOf(state).d

    let image: Int8Array

    if (input.synchronous) {
      image = synchronousStep(graph, model, state)
    } else {
      const run = new SpinOneQ2r({ graph, model, schedule, state, ...(input.move ? { move: input.move } : {}) })

      run.round()
      image = Int8Array.from(run.state)
      run.inverseRound()

      if (!run.state.every((s, c) => s === state[c])) {
        restores = false
      }
    }

    if (totalEnergy(graph, model, image) !== e) {
      energyKept = false
    }

    if (chargeOf(image).d !== d) {
      dKept = false
    }

    const j = encode(image)

    if (seen[j]) {
      bijective = false
    }

    seen[j] = 1
  }

  return { states: total, energyKept, bijective, inverseRestores: restores, dKept }
}

// ---- geometries ----

type Geometry = {
  name: string
  symbol: string
  curvature: 'flat' | 'hyperbolic'
  graph: CellGraph
  // the degree-matched partner of equal cell count, by name
  partner: string | null
}

function geometries(): Geometry[] {
  const out: Geometry[] = [
    {
      name: 'ring-512',
      symbol: 'line',
      curvature: 'flat',
      graph: cellGraph(torusGrid(1, 512).map(r => Array.from(r))),
      partner: null,
    },
  ]

  // the catalog: every hyperbolic surface with its flat partner, and the {3,4,3,4} level of 2048 docks with the D4
  // torus (level 5, 16384 docks, has no flat partner and is left to a larger run)
  for (const e of closedQuotients()) {
    const q = e.quotient

    if (q.cells > 4096) {
      continue
    }

    out.push({
      name: q.name,
      symbol: `{${q.symbol.join(',')}}`,
      curvature: q.curvature,
      graph: cellGraph(q.neighbors),
      partner: q.partner,
    })
  }

  // larger matched pairs for the two smallest (30 and 56 cells): {4,5} in PGL(2,11) (330 tiles, systole 4) against
  // the 15 x 22 square torus, and {3,7} in PGL(2,13) (364 tiles, systole 6) against the 13 x 14 triangle torus
  for (const [p, q, modulus, flat] of [
    [4, 5, 11, squareTorus(15, 22)],
    [3, 7, 13, triangleTorus(13, 14)],
  ] as const) {
    const rotary = findRotaryMap({ p, q, moduli: [modulus], reference: referenceTiling([p, q], 6000), minSystole: 1 })

    if (!rotary) {
      throw new Error(`spin-one-q2r: no {${p},${q}} map mod ${modulus}`)
    }

    const hyperbolic = `surface-${p}-${q}-genus-${rotary.analysis.genus}`
    const flatName = `torus-${flat.p}-${flat.q}-genus-1-${flat.sides.join('x')}`

    out.push(
      { name: hyperbolic, symbol: `{${p},${q}}`, curvature: 'hyperbolic', graph: cellGraph(rotary.analysis.neighbors), partner: flatName },
      { name: flatName, symbol: `{${flat.p},${flat.q}}`, curvature: 'flat', graph: cellGraph(flat.analysis.neighbors), partner: hyperbolic },
    )
  }

  return out
}

// the crystal fields read on a degree-z graph: the Ising limit, one below z J / 2 and one above it, each with a
// vacancy move (an integer field h = +-Delta exists, |Delta| <= z)
function crystalFields(z: number): { label: 'ising' | 'low' | 'high'; delta: number }[] {
  return [
    { label: 'ising', delta: -(z + 1) },
    { label: 'low', delta: Math.max(1, Math.floor(z / 4)) },
    { label: 'high', delta: Math.ceil((3 * z) / 4) },
  ]
}

const roundsFor = (cells: number): number => Math.min(40000, Math.max(2000, Math.ceil(4e6 / cells)))

// |m| at beta by linear interpolation over equilibrated points (sorted by beta), NaN outside their range
function curveAt(points: readonly { beta: number; m: number }[], beta: number): number {
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!
    const b = points[i]!

    if (beta >= a.beta && beta <= b.beta) {
      return b.beta === a.beta ? (a.m + b.m) / 2 : a.m + ((beta - a.beta) / (b.beta - a.beta)) * (b.m - a.m)
    }
  }

  return Number.NaN
}

// the largest |m| gap between two curves at the betas of either inside both ranges; NaN when they share fewer than two
function curveGap(a: readonly { beta: number; m: number }[], b: readonly { beta: number; m: number }[]): number {
  let gap = Number.NaN
  let shared = 0

  for (const beta of [...a, ...b].map(p => p.beta)) {
    const ma = curveAt(a, beta)
    const mb = curveAt(b, beta)

    if (Number.isFinite(ma) && Number.isFinite(mb)) {
      shared++
      gap = Number.isNaN(gap) ? Math.abs(ma - mb) : Math.max(gap, Math.abs(ma - mb))
    }
  }

  return shared >= 2 ? gap : Number.NaN
}

// The beta interval that holds the |m| = 1/2 crossing of an equilibrated curve: from the largest beta read below 1/2
// to the smallest read at or above it (ordered as an interval when noise inverts them), open-ended on a side with no
// point. Null with no point at all.
function halfBracket(points: readonly { beta: number; m: number }[]): { lo: number; hi: number } | null {
  if (points.length === 0) {
    return null
  }

  const below = points.filter(p => p.m < 0.5).map(p => p.beta)
  const above = points.filter(p => p.m >= 0.5).map(p => p.beta)
  const a = below.length > 0 ? Math.max(...below) : Number.NEGATIVE_INFINITY
  const b = above.length > 0 ? Math.min(...above) : Number.POSITIVE_INFINITY

  return { lo: Math.min(a, b), hi: Math.max(a, b) }
}

const fmt = (x: number, d = 3): string => (Number.isFinite(x) ? x.toFixed(d) : '-')

export function spinOneQ2rRun(): Verdict {
  const started = performance.now()
  const seconds = (): number => Number(((performance.now() - started) / 1000).toFixed(1))
  const log = (line: string): void => console.error(`${line} (${seconds()} s)`)
  const checks: Check[] = []
  const controls: Check[] = []
  const metrics: Record<string, number> = {}

  const add = (list: Check[], name: string, ok: boolean): void => {
    list.push({ name, ok })
  }

  // ---- G1 exhaustive ----
  const small = [
    { name: 'ring-8', graph: cellGraph(torusGrid(1, 8).map(r => Array.from(r))) },
    { name: 'square-3x3', graph: cellGraph(squareTorus(3, 3).analysis.neighbors) },
    { name: 'petersen', graph: cellGraph(petersen()) },
  ]

  let exhaustiveStates = 0

  for (const s of small) {
    const z = s.graph.maxDegree
    const models: BlumeCapel[] = [
      { coupling: 1, crystalField: -(z + 1) },
      { coupling: 1, crystalField: 0 },
      { coupling: 1, crystalField: 1 },
      { coupling: 1, crystalField: 2 },
      { coupling: 1, crystalField: z },
      { coupling: 2, crystalField: 3 },
    ]

    for (const model of models) {
      for (const method of METHODS) {
        const r = exhaustive({ graph: s.graph, model, method })
        const tag = `G1 ${s.name} J ${model.coupling} Delta ${model.crystalField} ${method}`

        exhaustiveStates += r.states
        add(checks, `${tag}: E kept on all ${r.states} states`, r.energyKept)
        add(checks, `${tag}: round is a bijection`, r.bijective)
        add(checks, `${tag}: inverse round restores`, r.inverseRestores)

        if (model.crystalField === 0) {
          add(checks, `${tag}: C-symmetric rule keeps D`, r.dKept)
        }
      }
    }
  }

  metrics['exhaustive.states'] = exhaustiveStates
  log(`G1 exhaustive: ${exhaustiveStates} states`)

  // ---- N1, N2 ----
  const torus3 = small[1]!.graph
  const bc1: BlumeCapel = { coupling: 1, crystalField: 1 }
  const sync = exhaustive({ graph: torus3, model: bc1, method: 'greedy-bfs', synchronous: true })

  add(controls, 'N1 synchronous update changes E on some state', !sync.energyKept)
  add(controls, 'N1 synchronous update is not a bijection', !sync.bijective)

  const merge: LocalMove = (s, h, model) => (h === 0 && s === -1 ? 1 : h === 0 && s === 1 ? 1 : q2rMove(s, h, model))
  const merged = exhaustive({ graph: torus3, model: bc1, method: 'greedy-bfs', move: merge })

  add(controls, 'N2 merging map is not a bijection', !merged.bijective)
  add(controls, 'N2 merging map: the inverse round fails', !merged.inverseRestores)

  // ---- positive control: the square torus 32 x 32 ----
  const square = cellGraph(squareTorus(32, 32).analysis.neighbors)
  const checker = independentSetSchedule({ graph: square, method: 'greedy-bfs', colorOrder: 'forward' })
  const squareRun = (model: BlumeCapel): SweepPoint[] =>
    energySweep({
      graph: square,
      model,
      schedule: checker,
      starts: sweepStarts(model.crystalField < -square.maxDegree),
      steps: 10,
      burn: 4000,
      measure: 4000,
    })

  add(checks, 'G2 square torus checkerboard: 2 colors, proper', checker.colors === 2 && checkIndependentSchedule(square, checker).independent)

  const isingModel: BlumeCapel = { coupling: 1, crystalField: -5 }
  const ising = squareRun(isingModel)
  const isingRows: string[] = []

  let p1Points = 0
  let p1Worst = 0
  let p2Points = 0
  let p2Worst = 0

  for (const p of ising) {
    const e = p.run.energyPerCell - isingModel.crystalField
    const exact = onsagerBetaOfEnergy(e)
    const yang = yangMagnetization(exact)
    const eq = equilibrated(p, isingModel)

    if (eq) {
      p1Points++
      p1Worst = Math.max(p1Worst, Math.abs(p.temperature.betaFlip - exact) / exact)
    }

    if (exact >= ISING_BETA_CRITICAL + 0.02) {
      p2Points++
      p2Worst = Math.max(p2Worst, Math.abs(p.run.absMagnetization - yang))
    }

    isingRows.push(`e ${fmt(e)} beta ${fmt(p.temperature.betaFlip)} (Onsager ${fmt(exact)}) |m| ${fmt(p.run.absMagnetization)} (Yang ${fmt(yang)})${eq ? '' : ' not equilibrated'}`)
    add(checks, `G2 square Ising step ${p.step}: E conserved, bookkeeping exact`, p.run.energyConserved && p.run.bookkeepingExact)
  }

  const isingCross = halfCrossing(ising)

  add(checks, `P1 Ising: read beta within 3% of Onsager on ${p1Points} equilibrated runs (worst ${fmt(p1Worst * 100, 2)}%)`, p1Points >= 5 && p1Worst <= 0.03)
  add(checks, `P2 Ising: |m| within 0.04 of Yang on ${p2Points} ordered runs (worst ${fmt(p2Worst)})`, p2Points >= 2 && p2Worst <= 0.04)
  add(checks, `P3 Ising: |m| = 1/2 at T = ${fmt(1 / isingCross)} within 2% of 2.269`, Math.abs(1 / isingCross / (1 / ISING_BETA_CRITICAL) - 1) <= 0.02)
  metrics['control.ising.equilibrated'] = p1Points
  metrics['control.ising.betaWorstRelative'] = p1Worst
  metrics['control.ising.magnetizationWorst'] = p2Worst
  metrics['control.ising.crossingTemperature'] = 1 / isingCross
  log(`positive control Ising: ${isingRows.join('; ')}`)

  const bcModel: BlumeCapel = { coupling: 1, crystalField: 1 }
  const bc = squareRun(bcModel)
  const bcAgain = squareRun(bcModel)
  const bcCross = halfCrossing(bc)
  const bcRows: string[] = []

  let p5Points = 0
  let p5Fails = 0

  for (const p of bc) {
    const eq = equilibrated(p, bcModel)

    if (p.temperature.betaFlip < 1 / 1.398) {
      p5Points++
      p5Fails += eq ? 0 : 1
    }

    bcRows.push(`e ${fmt(p.run.energyPerCell)} beta ${fmt(p.temperature.betaFlip)}/${fmt(p.temperature.betaVacancy)} |m| ${fmt(p.run.absMagnetization)} D/N ${fmt(p.run.occupation)}${eq ? '' : ' not equilibrated'}`)
    add(checks, `G2 square BC Delta 1 step ${p.step}: E conserved, bookkeeping exact`, p.run.energyConserved && p.run.bookkeepingExact)
  }

  const print = (points: readonly SweepPoint[]): string =>
    fingerprint(points.flatMap(p => [p.run.finalState, p.run.counts.counts, p.run.moves]))

  add(checks, 'G4 determinism: the Delta 1 sweep twice gives identical bytes', print(bc) === print(bcAgain))
  add(checks, `P4 BC Delta 1: |m| = 1/2 at T = ${fmt(1 / bcCross)} within 5% of 1.398`, Math.abs(1 / bcCross / 1.398 - 1) <= 0.05)
  add(checks, `P5 BC Delta 1: all ${p5Points} runs above T_c equilibrated, flip and vacancy channels agree (${p5Fails} not)`, p5Points >= 3 && p5Fails === 0)
  metrics['control.bc1.crossingTemperature'] = 1 / bcCross
  metrics['control.bc1.paramagneticRuns'] = p5Points
  log(`positive control BC Delta 1: ${bcRows.join('; ')}`)

  const bc3Model: BlumeCapel = { coupling: 1, crystalField: 3 }
  const bc3 = squareRun(bc3Model)
  const bc3MaxM = Math.max(...bc3.map(p => p.run.absMagnetization))
  const bc3Equilibrated = bc3.filter(p => equilibrated(p, bc3Model)).length

  add(checks, `P6 BC Delta 3: |m| <= 0.05 at every energy (max ${fmt(bc3MaxM)}) and D/N <= 0.1 at the lowest (${fmt(bc3[0]?.run.occupation ?? 1)})`, bc3.length >= 5 && bc3MaxM <= 0.05 && (bc3[0]?.run.occupation ?? 1) <= 0.1)
  metrics['control.bc3.maxAbsMagnetization'] = bc3MaxM
  metrics['control.bc3.equilibrated'] = bc3Equilibrated
  log(`positive control BC Delta 3: ${bc3.map(p => `e ${fmt(p.run.energyPerCell)} beta ${fmt(p.temperature.betaFlip)}/${fmt(p.temperature.betaVacancy)} |m| ${fmt(p.run.absMagnetization)} D/N ${fmt(p.run.occupation)}${equilibrated(p, bc3Model) ? '' : ' not equilibrated'}`).join('; ')}`)

  // ---- N3, N4 ----
  const frozenModel: BlumeCapel = { coupling: 2, crystalField: 3 }
  const frozen = squareRun(frozenModel)
  const frozenEq = frozen.filter(p => equilibrated(p, frozenModel)).length
  const dFrozen = frozen.every(p => p.run.moves === 0 || Math.abs(p.run.occupation - p.run.finalState.reduce((a, s) => a + s * s, 0) / square.cells) < 1e-12)

  add(controls, `N3 J 2 Delta 3 (no vacancy move, D frozen): 0 of ${frozen.length} runs equilibrated (${frozenEq})`, frozen.length >= 5 && frozenEq === 0 && dFrozen)

  // a lightly quenched structured start already sits at high temperature, where tones nearly independent of the field
  // pass the reading; the control is the starts whose run reads below T_c (beta above beta_c: Ising ln(1 + sqrt 2) / 2,
  // Delta = 1 1 / 1.398), where the quench did the work, and every start is counted for the record
  const starts = [
    ...ising.map(p => ({ p, model: isingModel, cold: p.temperature.betaFlip > ISING_BETA_CRITICAL })),
    ...bc.map(p => ({ p, model: bcModel, cold: p.temperature.betaFlip > 1 / 1.398 })),
  ]
  const coldStarts = starts.filter(s => s.cold)
  const coldStartsEq = coldStarts.filter(s => startEquilibrated(s.p, s.model)).length
  const passingStarts = starts.filter(s => startEquilibrated(s.p, s.model))

  add(controls, `N4 starts of runs below T_c read as one snapshot: 0 of ${coldStarts.length} equilibrated (${coldStartsEq})`, coldStarts.length >= 4 && coldStartsEq === 0)
  metrics['control.startsEquilibrated'] = passingStarts.length
  metrics['control.starts'] = starts.length
  log(`N4 starts reading equilibrated: ${passingStarts.map(s => `Delta ${s.model.crystalField} step ${s.p.step} run beta ${fmt(s.p.temperature.betaFlip)} start beta ${fmt(s.p.startTemperature.betaFlip)}`).join('; ') || 'none'}`)

  // ---- every geometry ----
  const geoms = geometries()
  const byName = new Map(geoms.map(g => [g.name, g]))

  type Curve = { beta: number; m: number; occupation: number; energy: number }

  const curves = new Map<string, Curve[]>()
  const rows: string[] = []

  let totalRuns = 0
  let totalEquilibrated = 0

  log(`geometries: ${geoms.map(g => `${g.name} (${g.graph.cells}, z ${g.graph.maxDegree})`).join(', ')}`)

  for (const g of geoms) {
    const z = g.graph.maxDegree

    add(checks, `G2 ${g.name}: ${z}-regular`, g.graph.minDegree === z)

    const rounds = roundsFor(g.graph.cells)

    for (const method of METHODS) {
      const schedule = independentSetSchedule({ graph: g.graph, method, colorOrder: 'forward' })
      const sc = checkIndependentSchedule(g.graph, schedule)

      add(checks, `G2 ${g.name} ${method}: ${schedule.colors} colors, proper, covering`, sc.independent && sc.covers)

      for (const { label, delta } of crystalFields(z)) {
        const model: BlumeCapel = { coupling: 1, crystalField: delta }
        const points = energySweep({
          graph: g.graph,
          model,
          schedule,
          starts: sweepStarts(label === 'ising'),
          steps: 8,
          burn: rounds,
          measure: rounds,
        })
        const key = `${g.name}|${method}|${label}`
        const eqPoints = points.filter(p => equilibrated(p, model))

        totalRuns += points.length
        totalEquilibrated += eqPoints.length
        add(checks, `G2 ${key}: every run conserves E and keeps exact books`, points.every(p => p.run.energyConserved && p.run.bookkeepingExact))

        if (label === 'ising' && z % 2 === 1) {
          add(checks, `G5 ${key}: the odd-degree Ising limit never moves`, points.every(p => p.run.moves === 0))
        }

        const mid = points[Math.floor(points.length / 2)]

        if (mid && method === 'greedy-bfs') {
          // the start state is rebuilt by the sweep; the run's final state is as good a start for the inverse gate
          add(checks, `G3 ${key}: 300 rounds forward and back restore`, inverseRestores({ graph: g.graph, model, schedule, state: mid.run.finalState, rounds: 300 }))
        }

        curves.set(
          key,
          eqPoints
            .map(p => ({ beta: p.temperature.betaFlip, m: p.run.absMagnetization, occupation: p.run.occupation, energy: p.run.energyPerCell }))
            .sort((a, b) => a.beta - b.beta),
        )
        metrics[`${g.name}.${method}.${label}.runs`] = points.length
        metrics[`${g.name}.${method}.${label}.equilibrated`] = eqPoints.length
        rows.push(
          `${key} (N ${g.graph.cells}, z ${z}, c ${schedule.colors}, Delta ${delta}, ${rounds}+${rounds} rounds): ${eqPoints.length}/${points.length} equilibrated; ${points
            .map(p => `[${fmt(p.run.energyPerCell, 2)}: b ${fmt(p.temperature.betaFlip)}${label === 'ising' ? '' : `/${fmt(p.temperature.betaVacancy)}`} m ${fmt(p.run.absMagnetization, 2)} q ${fmt(p.run.occupation, 2)}${equilibrated(p, model) ? '' : ' x'}]`)
            .join(' ')}`,
        )
      }
    }

    log(`geometry ${g.name} done`)
  }

  metrics['geometry.runs'] = totalRuns
  metrics['geometry.equilibrated'] = totalEquilibrated

  for (const row of rows) {
    console.error(row)
  }

  // ---- curvature: matched pairs, one schedule family on both sides ----
  const pairRows: string[] = []
  const verdicts: Record<string, number> = { differs: 0, agrees: 0, unresolved: 0 }

  let hyperbolicHotter = 0

  for (const h of geoms.filter(g => g.curvature === 'hyperbolic' && g.partner)) {
    const f = byName.get(h.partner!)

    if (f?.graph.cells !== h.graph.cells || f.graph.maxDegree !== h.graph.maxDegree) {
      add(checks, `pair ${h.name} / ${h.partner}: equal cells and degree`, false)
      continue
    }

    for (const label of ['ising', 'low', 'high'] as const) {
      const get = (g: Geometry, m: ColoringMethod): Curve[] => curves.get(`${g.name}|${m}|${label}`) ?? []
      const gaps = METHODS.map(m => curveGap(get(h, m), get(f, m)))
      const spreads = [h, f].map(g => curveGap(get(g, METHODS[0]!), get(g, METHODS[1]!)))
      const gap = Math.min(...gaps.map(x => (Number.isFinite(x) ? x : Number.POSITIVE_INFINITY)))
      const spread = Math.max(...spreads.map(s => (Number.isFinite(s) ? s : 0)))
      // per schedule family: the beta interval holding the |m| = 1/2 crossing on each side, then disjoint or not
      const relations = METHODS.map(m => {
        const a = halfBracket(get(h, m))
        const b = halfBracket(get(f, m))

        if (!a || !b) {
          return 'unresolved'
        }

        if (a.hi < b.lo) {
          return 'hyperbolicHotter'
        }

        if (b.hi < a.lo) {
          return 'flatHotter'
        }

        return 'overlap'
      })
      const result = relations.every(r => r === 'overlap')
        ? 'agrees'
        : relations.every(r => r === relations[0]) && relations[0] !== 'unresolved'
          ? 'differs'
          : 'unresolved'
      const crossings = [h, f].map(g =>
        METHODS.map(m => {
          const b = halfBracket(get(g, m))

          return b ? `${fmt(b.lo)}..${fmt(b.hi)}` : '-'
        }).join(' / '),
      )

      verdicts[result]!++

      if (result === 'differs' && relations[0] === 'hyperbolicHotter') {
        hyperbolicHotter++
      }

      metrics[`pair.${h.name}.${label}.verdict`] = result === 'differs' ? 1 : result === 'agrees' ? 0 : -1
      metrics[`pair.${h.name}.${label}.hyperbolicHotter`] = relations.filter(r => r === 'hyperbolicHotter').length
      metrics[`pair.${h.name}.${label}.gap`] = Number.isFinite(gap) ? gap : -1
      metrics[`pair.${h.name}.${label}.scheduleSpread`] = spread
      pairRows.push(`${h.symbol} ${h.name} / ${f.symbol} ${f.name} (${h.graph.cells} cells, z ${h.graph.maxDegree}) ${label}: ${result} [${relations.join(', ')}], beta of |m| = 1/2 (greedy-bfs / greedy-reverse-bfs) hyperbolic ${crossings[0]} flat ${crossings[1]}; |m| gap ${fmt(gap)} [${gaps.map(x => fmt(x)).join(', ')}], schedule spread ${fmt(spread)}`)
    }
  }

  for (const row of pairRows) {
    console.error(`curvature: ${row}`)
  }

  metrics['curvature.differs'] = verdicts.differs!
  metrics['curvature.agrees'] = verdicts.agrees!
  metrics['curvature.unresolved'] = verdicts.unresolved!
  metrics['curvature.differsHyperbolicHotter'] = hyperbolicHotter

  // ---- verdict ----
  const failed = [...checks, ...controls].filter(c => !c.ok)

  for (const c of failed) {
    log(`FAILED ${c.name}`)
  }

  metrics.gates = checks.length
  metrics.controls = controls.length
  metrics.failed = failed.length
  metrics.seconds = seconds()

  return verdict({
    status: failed.length === 0 ? 'pass' : 'fail',
    claim: `a Q2R-style reversible spin-1 Blume-Capel rule conserves E exactly on every state and every geometry; on the 32 x 32 square torus its read temperature matches Onsager within ${fmt(p1Worst * 100, 1)}%, |m| matches Yang within ${fmt(p2Worst, 3)} and crosses 1/2 at T = ${fmt(1 / isingCross, 3)} (2.269), at Delta = 1 at T = ${fmt(1 / bcCross, 3)} (1.398) with the crystal field read back from the dynamics, and at Delta = 3 stays paramagnetic; ${totalEquilibrated} of ${totalRuns} runs on ${geoms.length} closed geometries equilibrate; matched pair readings (pair x crystal field) under each schedule family: ${verdicts.differs} differ (${hyperbolicHotter} with the hyperbolic quotient ordering at the higher temperature), ${verdicts.agrees} agree, ${verdicts.unresolved} unresolved`,
    metrics,
    control: {
      onsagerBetaWorstRelative: p1Worst,
      yangMagnetizationWorst: p2Worst,
      isingCrossingTemperature: 1 / isingCross,
      blumeCapelCrossingTemperature: 1 / bcCross,
      negativesTripped: controls.filter(c => c.ok).length,
    },
    notes:
      'L2. Algebra spin-1, closed boundaries, schedule a greedy vertex coloring (breadth-first or reversed) applied set by set: declared structure, the same family on both sides of every pair (audit-m1 F). Equilibrium is read, not imposed: beta from tone-per-field counts, thresholds fixed after one square-torus probe. Starts are an integer Fibonacci-Kronecker tone pattern quenched to the target energy, never a draw. Deep in the ordered phase and at Delta > z J / 2 the reading fails: isolated defects with no degenerate site are frozen, and a vacancy move needs |h| = Delta, rare there, so those runs do not equilibrate within the budget. The odd-degree Ising limit never moves. At Delta = 0 every C-symmetric rule fixes the vacancy, so D is conserved and only a chiral rule could change it. A curvature verdict is about these closed quotients of equal cell count and degree, which also differ in systole and genus; it is not a statement about the infinite tilings.',
  })
}

export default experiment({
  id: 'computation/spin-one-q2r',
  code: 'E-CMP-0044',
  title:
    'M2-B: a Q2R-style reversible energy-conserving spin-1 Blume-Capel rule on every closed lab geometry, equilibrium read from tone-per-field counts with no randomness, against Onsager, Yang and the square-lattice Blume-Capel phase diagram, flat against degree-matched hyperbolic under one schedule family',
  category: 'computation',
  substrates: ['line', '{4,4}', '{6,3}', '{3,6}', '{5,4}', '{7,3}', '{8,3}', '{4,5}', '{6,4}', '{3,7}', '{3,4,3,3}', '{3,4,3,4}'],
  depth: 'L2',
  paper: false,
  run() {
    return spinOneQ2rRun()
  },
})
