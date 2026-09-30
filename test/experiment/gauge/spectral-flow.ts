// THE LIGHT'S SPLIT BY SPECTRAL FLOW FROM THE IDENTITY (E-FRC-0275). Follow-up to E-FRC-0269 and 0270 for
// OPEN-LGT-02 and OPEN-LGT-12. The husk light's split is down to two readings of one set of fills, the average
// (0.4613818) and the worst register (0.4146386), and the ladder's exact quantum light is asked which one Planck picks.
// E-FRC-0270 found the Planck departure is a function of rho alone but jitters, because each level's whole turns are
// read from its eigenvector's harmonic energy and a seam level flips its turn. The pieces note ("Two exact reductions",
// part B) derived a replacement: scale both exponents from 0, U(t) = F(t f) D(t s), and follow every phase from
// U(0) = 1, so each level's turns are an integer read from U alone, and gate it on the per-sector trace identity.
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE BLOCKS. The beat commutes with the translation, the charge mirror C (m to -m) and, on three squares, the
//    reflection P (square p to -p). N_D and N_F are constant on every orbit of these, so on a basis built from orbits
//    the beat is Y^dag diag(e^(-i pi f N_F / N)) Y diag(e^(-i pi s N_D / N)) with Y the Fourier transform restricted,
//    and det U = e^(-i (pi / N)(s Tr N_D + f Tr N_F)) block by block, integer traces (code/measure/spectral-flow).
//    Levels of different blocks cross freely. That is the rule for exact crossings, stated in advance: track by
//    block, never across blocks.
// 2. THE STEP IS EXACT, THE MATCH IS NOT. A level's phase moves at -<A> - <B> (Hellmann-Feynman for a product), so
//    its increment lies in a known window and is unique once the window is under 2 pi. What remains is the match, and
//    here the note's claim fails in one case. Two levels of one block meet on the circle when their lifted difference
//    crosses a multiple of 2 pi. At a LINE meeting (the multiple 0) either match gives the same lifted multiset. At a
//    TURN meeting (2 pi m, m != 0) the two matches differ by a whole turn moved between the pair, and the sum is the
//    same, so THE TRACE IDENTITY CANNOT SEE A SWAP AT A TURN MEETING. It catches a miscounted increment, not a swap.
// 3. THE EXACT CONTINUATION IS THE CYCLIC LIFT (a theorem). Inside one block two levels generically never meet on a
//    path: they avoid. So the exact continuation keeps the levels' cyclic order from t = 0, where all sit at phase 0,
//    and the lifted phases stay d consecutive points of the 2 pi-periodic set {phase + 2 pi k}. The trace identity
//    fixes which ones. So the exact lift needs no path at all: one spectrum and one integer per block, continuous in
//    rho, independent of path and step by construction, and EVERY BLOCK SPANS LESS THAN ONE TURN. A lift that spans
//    more (the harmonic reading spans about 4 turns, E-FRC-0270) has crossed avoided meetings diabatically, which it
//    does only where the step is too coarse to resolve the gap, so it depends on the step and the path.
// 4. SO THE EXACT LIFT IS NOT AN ENERGY. Each block's levels above one turn fold back inside one turn. A block of d
//    levels holds one turn at a mean spacing 2 pi / d, far below the lowest photon omega_min (d is 16 to 366 here),
//    so folded levels land inside the vacuum gap, where no harmonic level lies. Their Boltzmann weight is then of
//    order one instead of e^(-2 pi / T), and the count of such levels grows with N. So the prediction, frozen here:
//    the exact lift fails the energy gate (E below) on every box, the tracked lifts that keep more than a turn fail
//    step or path independence, and the Planck criterion cannot be read on a branch-free lift at any N. The Planck
//    statistics below are still computed on the exact lift, as the note's gates ask, to report what they do.
// 5. THE FINITE-N SHIFT, AND WHAT SEPARATION NEEDS. The readings differ by ln(6/5) in R = rho*(3) / rho*(2), so R is
//    decided when its error is under ln(6/5) / 2 = 0.0912 (0270's criterion, kept). The Gaussian-tail model
//    (code/measure/ratio-balance tailOptimum) puts R under the worst-register truth at 0.92 to 1.00 on N = 9, 11 and
//    at 0.907 (x = 1) and 0.953 (x = 2) on N = 13, against the log midpoint sqrt(5/6) = 0.9129. So at every reachable
//    pair but (13, x = 1) even a perfect statistic under the worst-register truth reads nearer 1, and a pick of the
//    average there discriminates nothing. Stated here: a pick of the average counts only at a pair where the model's
//    R is below sqrt(5/6), a pick of the worst register counts anywhere (the shift biases against it). If nothing
//    discriminates the result is "undecided at reachable N".
// 6. WHAT IS FREE: nothing. The ratio grid, sub-grid stride 10 and median width 5 are E-FRC-0270's, so the spread is
//    comparable. A perfectly smooth departure puts that statistic's spread at its sub-grid quantization, about
//    0.040 / sqrt 12 = 0.0115, which is under the separation need. The temperatures (x = 1, 2 gated, 4 read), the
//    boxes (2 squares at N = 9, 11, 13, 17, 21, 25, 29, 3 squares at N = 9, 11, 13), the check ratios (grid indices 60,
//    120, 180, 240), the tracker settings (coarse: window pi/2, overlap 0.75, quarter: window pi/8, fine: window pi/32,
//    overlap 0.999, floor 2^-24) are fixed here. 137, 3/8 and 9/20 appear nowhere.
//
// GATES, fixed before the gate run:
// A1 CORRECT: on every box the blocks hold N^L levels with their copies. The block beat's spectrum equals the
//    ladder's own beat (code/measure/quantum-ladder sectorBlock of code/measure/ratio-balance ratioSpec) within 1e-9 at
//    rho = 3 on (9, 2) and (9, 3). The trace identity holds within 1e-9 at every accepted step of every tracked path
//    (the note's gate), and the exact lift's window integer within 1e-9 at every ratio of every box.
// A2 THE EXACT CONTINUATION (added: point 3 is the lift the rest reads, so a second method must reproduce it): on
//    (9, 2) and (11, 2) at the check ratio 120, every block the fine tracker resolves (no turn meeting crossed, no
//    forced match) equals its cyclic lift within 1e-8, and each box has at least one resolved block. A block the
//    tracker cannot resolve (a gap under its floor, or an exact meeting from a symmetry missed in point 1, which it
//    cannot tell apart) is counted and not compared.
// E  AN ENERGY (added: point 4, a Planck criterion needs a lift that is an energy): at every ratio of every box the
//    exact lift has no level but the vacuum below E_vac + min(band omega) - 1e-9. CONTROL that could fail the other
//    way: E-FRC-0270's harmonic reading passes it at the check ratio 120 on (9, 2) and (9, 3).
// C  THE 2-SQUARE CONTROL (the note's): on N = 9, 11, 13 at each gated x, |ln rho*(2) - ln 3| <= 2 S_2.
// S  THE SPREAD (0270's Q2, the deliverable): at each gated x the fit ln S_2 = a + b ln N over the seven 2-square boxes
//    has b < 0, or every S_2 is under S* = ln(6/5) / (4 sqrt(1 + lambda^2)), lambda the largest S_3 / S_2 (at least 1).
// R  PICKS ONE (the note's): every pair (N = 9, 11, 13, gated x) separates, 2 sqrt(S_3^2 + S_2^2) < ln(6/5) / 2, and
//    all are nearer the same reading in log distance.
// Status: pass if A1, A2, E, C, S and R hold and the pick discriminates (point 5). partial if A1, A2 and E hold and the
// rest do not (branch-free, an energy, undecided at reachable N). fail otherwise: A1 or A2 fails (the method), or E
// fails (the branch-free lift is not an energy, so the Planck criterion cannot be read on it), the frozen prediction.
// READ: per box and x, rho*(L), S, the raw argmin's spread, the least departure, the largest jump of the departure
// between neighboring ratios (0270's jumps reached 2.4 times), R per pair with the model's R, N_sep as 0270 computed
// it, the least N at which the model's R falls under sqrt(5/6); the levels folded into the vacuum gap at the check
// ratio 120; and on the four smallest boxes, the COARSE and QUARTER tracked lifts at the check ratio 120: their gap to
// each other (step), to a coarse ray to 60 carried to 120 (path), to the cyclic lift, their turn meetings crossed,
// their spans in turns and whether they pass E.
//
// Depth L2: exact Floquet spectra and their continuation for the model's quantum loop light on finite ladder boxes,
// thermal sums in doubles. The 3D quantum light of OPEN-LGT-12 is not built.
//
// PROBES, disclosed (N = 7 only, outside every gated box, and timings). tmp/sf-probe1.log: on (7, 2) and (7, 3) the
// block beat equals the ladder's to 1e-15, the trace holds to 3e-13 on every path, and yet a coarse ray to rho = 3 and
// a ray to 2 carried to 3 differ by 0.23 and 1.30 radians, a quarter-window ray by 1.00 and 1.30, and the coarse lift
// puts levels 0.0065 and 0.14 above the vacuum on (7, 3) where the harmonic reading's first is 0.789.
// tmp/sf-probe2.log: on (7, 2) the tracked lift approaches the cyclic lift as the step resolves more (turn meetings
// crossed 19, 14, 10, 11, 6, 0) and equals it to 1.8e-15 at window pi/32, overlap 0.999, with every block spanning
// 0.86 to 0.94 turns. That is point 3 seen before it was gated (A2's boxes are larger). No Planck optimum, spread or
// R was computed before the gate run.
//
// FIRST RUN 2026-09-30 (tmp/sf-gate-run1.log, 1,771 s): FAIL, as frozen in point 4, no gate moved. A1 held: the block
// beat equals the ladder's to 1.8e-15, the trace identity holds to 1.8e-12 on every tracked step of every path, the
// cyclic window integer to 3.4e-13. A2 held on (9, 2) (the 2 blocks the fine tracker resolved equal the cyclic lift to
// 1.8e-15) and failed on (11, 2): at window pi/32 and overlap 0.999 the tracker still crossed 1 to 11 turn meetings in
// every block, so no block was resolved and none could be compared. The gaps there are under any step it can take,
// which is point 3's mechanism, not a missed symmetry (none was forced). E failed on every box, as predicted: the
// cyclic lift puts 7 to 136 levels inside the vacuum gap at ratio 120 (least excitation less least omega -5.39 to
// -6.26), while the harmonic reading's control gives 0 on (9, 2) and (9, 3). The tracked lifts are not branch-free
// either: coarse against quarter step differs by 1.25, 2.20, 1.03 and 2.86 radians on (9, 2), (11, 2), (13, 2), (9, 3),
// and a coarse ray against a ray carried from ratio 60 by 0.74, 1.95, 1.29, 0.92, with 86 to 1,731 turn meetings crossed
// a ray and the trace identity exact on all of them. On (9, 3) the coarse lift also folds 247 levels into the gap.
// READ, on the exact lift (it is not an energy, so these are not a Planck criterion): the least departure is 1.9 to
// 25.5 (a thermal energy 3 to 26 times Planck's), the neighbor jumps reach 5.8e5, and the 2-square spreads are 0.012,
// 0.012, 0.060, 0.015, 0.021, 0.335, 0.359 at x = 1 (0.012 is the sub-grid floor), fit slope +2.7: they do not fall.
// C failed (rho*(2) 3.18 at N 9, 2.53 at N 11, 3.91 at N 13, each 0.012 to 0.060 wide). R: 0.872 (N 9) and 0.862
// (N 11), both separated and nearer 5/6 at x = 1 and 2, and 0.63 with error 0.38 at N 13, so R failed. Those two
// separated picks are of a folded spectrum's departure of order 10, not of Planck's law, and are not read as evidence.
// The model's R under the worst-register truth first falls under sqrt(5/6) at N = 13 (x = 1) and 23 (x = 2).

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  carryLift,
  cyclicLift,
  emptyStats,
  flowBlock,
  flowSystem,
  identityState,
  liftGap,
  liftPlanck,
  liftSpans,
  rayLift,
  splitAt,
  blockUnitary,
  FLOW_DEFAULTS,
  type FlowLift,
  type FlowOptions,
  type FlowSystem,
} from '@/code/measure/spectral-flow'
import {
  meanOf,
  offsetOptima,
  powerFit,
  ratioGrid,
  ratioSpec,
  runningMedian,
  standardDeviation,
  tailOptimum,
} from '@/code/measure/ratio-balance'
import { ladderOmegaMin } from '@/code/measure/quantum-balance'
import {
  ladderKernel,
  oneQuantumBand,
  sectorBasis,
  sectorBlock,
  sectorsOf,
  unitaryEigen,
  unwrapped,
} from '@/code/measure/quantum-ladder'

const GRID = ratioGrid(1.6, 4.2, 240)
const STRIDE = 10
const WIDTH = 5
const GATED_X = [1, 2]
const READ_X = [4]
const TWO_SQUARE = [9, 11, 13, 17, 21, 25, 29]
const THREE_SQUARE = [9, 11, 13]
const CHECK = [60, 120, 180, 240]
const MID = 120
const HALF_GAP = Math.log(6 / 5) / 2
const MIDPOINT = Math.sqrt(5 / 6)

const COARSE: FlowOptions = FLOW_DEFAULTS
const QUARTER: FlowOptions = { window: Math.PI / 8, clean: 0.75, floor: 2 ** -20 }
const FINE: FlowOptions = { window: Math.PI / 32, clean: 0.999, floor: 2 ** -24 }

const wrap = (x: number): number =>
  x - 2 * Math.PI * Math.round(x / (2 * Math.PI))

/** The least excitation above the vacuum less the least band omega: negative when a level sits in the vacuum gap. */
function vacuumGap(energies: readonly number[], omegas: readonly number[]): {
  gap: number
  inside: number
} {
  const sorted = [...energies].sort((a, b) => a - b)
  const e0 = sorted[0]!
  const w = Math.min(...omegas)

  return {
    gap: sorted[1]! - e0 - w,
    inside: sorted.slice(1).filter(e => e - e0 < w - 1e-9).length,
  }
}

type Scan = {
  /** [temperature][ratio] signed departure */
  departures: number[][]
  integerGap: number
  energyGap: number
  foldedAtMid: number
  spanAtMid: number
}

function scanExact(system: FlowSystem, temperatures: readonly number[]): Scan {
  const n = system.n
  const departures = temperatures.map(() => [] as number[])

  let integerGap = 0
  let energyGap = Infinity
  let foldedAtMid = 0
  let spanAtMid = 0

  GRID.forEach((rho, i) => {
    const lift = cyclicLift(system, splitAt(n, rho))
    const p = liftPlanck(system, lift, temperatures)
    const v = vacuumGap(p.energies, p.omegas)

    integerGap = Math.max(integerGap, lift.stats.traceGap)
    energyGap = Math.min(energyGap, v.gap)
    p.ratios.forEach((r, j) => departures[j]!.push(r - 1))

    if (i === MID) {
      foldedAtMid = v.inside
      spanAtMid = Math.max(...liftSpans(lift))
    }
  })

  return { departures, integerGap, energyGap, foldedAtMid, spanAtMid }
}

function optimaOf(d: readonly number[]): {
  smooth: number[]
  raw: number[]
  least: number
  jump: number
} {
  let least = Infinity

  for (let o = 0; o < STRIDE; o++) {
    const sub: number[] = []

    for (let i = o; i < d.length; i += STRIDE) {
      sub.push(Math.abs(d[i]!))
    }

    least = Math.min(least, ...runningMedian(sub, WIDTH))
  }

  let jump = 1

  for (let i = 0; i + 1 < d.length; i++) {
    const a = Math.abs(d[i]!)
    const b = Math.abs(d[i + 1]!)

    if (Math.min(a, b) > 0) {
      jump = Math.max(jump, Math.max(a, b) / Math.min(a, b))
    }
  }

  return {
    smooth: offsetOptima(d, STRIDE, WIDTH).map(i => Math.log(GRID[i]!)),
    raw: offsetOptima(d, STRIDE, 1).map(i => Math.log(GRID[i]!)),
    least,
    jump,
  }
}

export function spectralFlowRun(): Verdict {
  const started = Date.now()
  const metrics: Record<string, number> = {}
  const xs = [...GATED_X, ...READ_X]

  // ---------------------------------------------------------------- A1: the blocks and the beat
  let countsOk = true
  const systems = new Map<string, FlowSystem>()
  const system = (n: number, L: number): FlowSystem => {
    const key = `${n}/${L}`

    if (!systems.has(key)) {
      const sys = flowSystem(n, L)

      systems.set(key, sys)
      countsOk &&=
        sys.blocks.reduce((a, b) => a + b.dim * b.copies, 0) === n ** L
    }

    return systems.get(key)!
  }

  let beatGap = 0

  for (const [n, L] of [
    [9, 2],
    [9, 3],
  ] as const) {
    const sys = system(n, L)
    const [s, f] = splitAt(n, 3)
    const mine: number[] = []

    for (const b of sys.blocks) {
      const u = blockUnitary(b, n, s, f)
      const phases = unitaryEigen(b.dim, u.re, u.im).phases

      for (let c = 0; c < b.copies; c++) {
        mine.push(...phases)
      }
    }

    const spec = ratioSpec(n, L, 3)
    const kernel = ladderKernel(spec)
    const sectors = sectorsOf(spec)
    const theirs: number[] = []

    for (let q = 0; q < L; q++) {
      const basis = sectorBasis(spec, sectors, q)
      const block = sectorBlock(kernel, sectors, basis, q)

      theirs.push(...unitaryEigen(basis.length, block.re, block.im).phases)
    }

    mine.sort((a, b) => a - b)
    theirs.sort((a, b) => a - b)
    mine.forEach((v, i) => {
      beatGap = Math.max(beatGap, Math.abs(wrap(v - theirs[i]!)))
    })
  }

  metrics.beatGap = beatGap

  // ---------------------------------------------------------------- A2 and the tracked reads, on the small boxes
  let traceGap = 0
  let a2 = true
  const trackedBoxes: readonly (readonly [number, number])[] = [
    [9, 2],
    [11, 2],
    [13, 2],
    [9, 3],
  ]

  for (const [n, L] of trackedBoxes) {
    const sys = system(n, L)
    const tag = `N${n}_L${L}`
    const at = splitAt(n, GRID[MID]!)
    const cyc = cyclicLift(sys, at)
    const w0 = ladderOmegaMin(n)

    if (L === 2 && n <= 11) {
      let resolved = 0
      let gap = 0

      sys.blocks.forEach((b, i) => {
        const stats = emptyStats()
        const fine = flowBlock(b, n, identityState(b), [0, 0], at, FINE, stats)

        traceGap = Math.max(traceGap, stats.traceGap)

        if (stats.turnPassings === 0 && stats.forced === 0) {
          resolved++

          const x = [...fine.theta].sort((u, v) => u - v)
          const y = [...cyc.states[i]!.theta].sort((u, v) => u - v)

          x.forEach((v, j) => {
            gap = Math.max(gap, Math.abs(v - y[j]!))
          })
        }

        metrics[`fineTurns_${tag}_b${i}`] = stats.turnPassings
        metrics[`fineForced_${tag}_b${i}`] = stats.forced
        metrics[`fineSteps_${tag}_b${i}`] = stats.steps
      })

      metrics[`fineResolved_${tag}`] = resolved
      metrics[`fineBlocks_${tag}`] = sys.blocks.length
      metrics[`fineGap_${tag}`] = gap
      a2 &&= resolved >= 1 && gap <= 1e-8
    }

    // the coarse and quarter tracked lifts (read)
    const coarse = rayLift(sys, at, COARSE)
    const quarter = rayLift(sys, at, QUARTER)
    const early = splitAt(n, GRID[60]!)
    const carried = carryLift(sys, rayLift(sys, early, COARSE), early, at, COARSE)

    traceGap = Math.max(
      traceGap,
      coarse.stats.traceGap,
      quarter.stats.traceGap,
      carried.stats.traceGap,
    )

    const read = (name: string, lift: FlowLift): void => {
      const p = liftPlanck(sys, lift, [w0])
      const v = vacuumGap(p.energies, p.omegas)

      metrics[`${name}Turns_${tag}`] = lift.stats.turnPassings
      metrics[`${name}Forced_${tag}`] = lift.stats.forced
      metrics[`${name}Span_${tag}`] = Math.max(...liftSpans(lift))
      metrics[`${name}ToCyclic_${tag}`] = liftGap(lift, cyc)
      metrics[`${name}EnergyGap_${tag}`] = v.gap
      metrics[`${name}Folded_${tag}`] = v.inside
    }

    read('coarse', coarse)
    read('quarter', quarter)
    metrics[`stepGap_${tag}`] = liftGap(coarse, quarter)
    metrics[`pathGap_${tag}`] = liftGap(coarse, carried)
    metrics[`pathTurns_${tag}`] = carried.stats.turnPassings
  }

  // ---------------------------------------------------------------- E's control: the harmonic reading
  let controlGap = Infinity

  for (const [n, L] of [
    [9, 2],
    [9, 3],
  ] as const) {
    const { band, levels } = oneQuantumBand(ratioSpec(n, L, GRID[MID]!))
    const { energies } = unwrapped(levels)
    const v = vacuumGap(
      energies,
      band.map(b => b.omega),
    )

    metrics[`harmonicEnergyGap_N${n}_L${L}`] = v.gap
    controlGap = Math.min(controlGap, v.gap)
  }

  const eControl = controlGap >= -1e-9

  // ---------------------------------------------------------------- the exact lift on every box
  const boxes = new Map<string, ReturnType<typeof optimaOf>[]>()
  let integerGap = 0
  let energyGap = Infinity

  const study = (n: number, L: number): void => {
    const sys = system(n, L)
    const w0 = ladderOmegaMin(n)
    const scan = scanExact(
      sys,
      xs.map(x => x * w0),
    )
    const tag = `N${n}_L${L}`

    integerGap = Math.max(integerGap, scan.integerGap)
    energyGap = Math.min(energyGap, scan.energyGap)
    metrics[`energyGap_${tag}`] = scan.energyGap
    metrics[`folded_${tag}`] = scan.foldedAtMid
    metrics[`span_${tag}`] = scan.spanAtMid
    boxes.set(tag, scan.departures.map(optimaOf))

    xs.forEach((x, j) => {
      const o = boxes.get(tag)![j]!
      const t = `${tag}_x${x}`

      metrics[`rhoStar_${t}`] = Math.exp(meanOf(o.smooth))
      metrics[`spread_${t}`] = standardDeviation(o.smooth)
      metrics[`rhoStarRaw_${t}`] = Math.exp(meanOf(o.raw))
      metrics[`spreadRaw_${t}`] = standardDeviation(o.raw)
      metrics[`leastDeparture_${t}`] = o.least
      metrics[`jump_${t}`] = o.jump
      metrics[`modelRhoStar_${t}`] = tailOptimum(n, L, x * w0)
    })
  }

  for (const n of TWO_SQUARE) {
    study(n, 2)
  }

  for (const n of THREE_SQUARE) {
    study(n, 3)
  }

  metrics.traceGap = traceGap
  metrics.integerGap = integerGap
  metrics.energyGap = energyGap
  metrics.controlGap = controlGap

  const a1 =
    countsOk && beatGap <= 1e-9 && traceGap <= 1e-9 && integerGap <= 1e-9
  const e = energyGap >= -1e-9

  // ---------------------------------------------------------------- C, S, R
  let lambda = 1

  for (const n of THREE_SQUARE) {
    for (const x of GATED_X) {
      const s2 = metrics[`spread_N${n}_L2_x${x}`]!
      const s3 = metrics[`spread_N${n}_L3_x${x}`]!

      if (s2 > 0) {
        lambda = Math.max(lambda, s3 / s2)
      }
    }
  }

  const target = Math.log(6 / 5) / (4 * Math.sqrt(1 + lambda * lambda))

  metrics.lambda = lambda
  metrics.targetSpread = target

  let c = true
  let sGate = true
  let nSep = Infinity

  for (const x of GATED_X) {
    for (const n of THREE_SQUARE) {
      const t = `N${n}_L2_x${x}`

      c &&=
        Math.abs(Math.log(metrics[`rhoStar_${t}`]!) - Math.log(3)) <=
        2 * metrics[`spread_${t}`]!
    }

    const ss = TWO_SQUARE.map(n =>
      Math.max(metrics[`spread_N${n}_L2_x${x}`]!, 1e-6),
    )
    const { a, b } = powerFit(TWO_SQUARE, ss)
    const sep = b < 0 ? (target * Math.exp(-a)) ** (1 / b) : Infinity

    metrics[`fitA_x${x}`] = a
    metrics[`fitB_x${x}`] = b
    metrics[`nSep_x${x}`] = Number.isFinite(sep) ? sep : -1
    sGate &&= b < 0 || ss.every(v => v < target)
    nSep = Math.min(nSep, sep)

    // the least odd N at which the model's R falls under sqrt(5/6)
    let nModel = -1

    for (let n = 9; n <= 401; n += 2) {
      const T = x * ladderOmegaMin(n)

      if (tailOptimum(n, 3, T) / tailOptimum(n, 2, T) < MIDPOINT) {
        nModel = n
        break
      }
    }

    metrics[`nModel_x${x}`] = nModel
  }

  metrics.nSep = Number.isFinite(nSep) ? nSep : -1

  let everySeparates = true
  const picks: string[] = []
  let discriminates = false

  for (const n of THREE_SQUARE) {
    for (const x of xs) {
      const t2 = `N${n}_L2_x${x}`
      const t3 = `N${n}_L3_x${x}`
      const R = metrics[`rhoStar_${t3}`]! / metrics[`rhoStar_${t2}`]!
      const err =
        2 * Math.hypot(metrics[`spread_${t3}`]!, metrics[`spread_${t2}`]!)
      const separates = err < HALF_GAP
      const nearerWorst =
        Math.abs(Math.log(R) - Math.log(5 / 6)) < Math.abs(Math.log(R))
      const T = x * ladderOmegaMin(n)
      const modelR = tailOptimum(n, 3, T) / tailOptimum(n, 2, T)

      metrics[`R_N${n}_x${x}`] = R
      metrics[`Rraw_N${n}_x${x}`] =
        metrics[`rhoStarRaw_${t3}`]! / metrics[`rhoStarRaw_${t2}`]!
      metrics[`Rerror_N${n}_x${x}`] = err
      metrics[`separates_N${n}_x${x}`] = separates ? 1 : 0
      metrics[`nearerWorst_N${n}_x${x}`] = nearerWorst ? 1 : 0
      metrics[`modelR_N${n}_x${x}`] = modelR

      if (GATED_X.includes(x)) {
        everySeparates &&= separates

        if (separates) {
          picks.push(nearerWorst ? 'worst' : 'average')
          discriminates ||= nearerWorst || modelR < MIDPOINT
        }
      }
    }
  }

  const r = everySeparates && picks.every(p => p === picks[0])
  const picked = r ? picks[0]! : 'none'

  metrics.picksWorst = picks.filter(p => p === 'worst').length
  metrics.picksAverage = picks.filter(p => p === 'average').length

  const gates = { A1: a1, A2: a2, E: e, C: c, S: sGate, R: r }

  for (const [k, v] of Object.entries(gates)) {
    metrics[`gate${k}`] = v ? 1 : 0
  }

  metrics.gateEControl = eControl ? 1 : 0
  metrics.discriminates = discriminates ? 1 : 0
  metrics.seconds = (Date.now() - started) / 1000

  const branchFree = a1 && a2
  const status =
    branchFree && e && c && sGate && r && discriminates
      ? 'pass'
      : branchFree && e
        ? 'partial'
        : 'fail'

  const spreads = GATED_X.map(
    x =>
      `x ${x}: ${TWO_SQUARE.map(n => metrics[`spread_N${n}_L2_x${x}`]!.toFixed(3)).join(', ')}`,
  ).join('; ')
  const rs = THREE_SQUARE.flatMap(n =>
    GATED_X.map(
      x =>
        `N ${n} x ${x}: ${metrics[`R_N${n}_x${x}`]!.toFixed(3)} (error ${metrics[`Rerror_N${n}_x${x}`]!.toFixed(3)}, model ${metrics[`modelR_N${n}_x${x}`]!.toFixed(3)})`,
    ),
  ).join(', ')

  return verdict({
    status,
    claim: `the exact spectral flow of the ladder's quantum light from the identity is the cyclic lift (the fine tracker reproduces it to ${metrics.fineGap_N11_L2!.toExponential(1)}, trace identity to ${traceGap.toExponential(1)} on every tracked step, window integer to ${integerGap.toExponential(1)}), which keeps every symmetry block within one turn, so it ${e ? 'passes' : 'fails'} the energy gate (least excitation less the least band omega ${energyGap.toFixed(3)}, against ${controlGap.toFixed(3)} for the harmonic reading); tracked lifts that span more than a turn differ by step and path (coarse against quarter ${metrics.stepGap_N9_L3!.toFixed(3)}, against a carried path ${metrics.pathGap_N9_L3!.toFixed(3)} radians on (9, 3)); on the exact lift the spread of the Planck-optimal ratio on 2 squares is ${spreads}, R is ${rs}, ${r ? `picking the ${picked === 'worst' ? 'worst register' : 'average'}${discriminates ? '' : ', a pick the finite-N shift already gives'}` : 'no consistent pick'}`,
    metrics,
    control: {
      harmonicEnergyGap: controlGap,
      beatGap,
    },
    notes: `L2, deterministic (exact Floquet spectra and their continuation, 241 real ratios per box, no draw). Gates: ${JSON.stringify(gates)}, E control ${eControl}. The 3D quantum light is not built.`,
  })
}

export default experiment({
  id: 'gauge/spectral-flow',
  code: 'E-FRC-0275',
  title:
    "the light's split by spectral flow from the identity: each level of the ladder's quantum light followed from U(0) = 1 with the trace identity gated at every step, the exact continuation as the cyclic lift, whether it is an energy, and whether its Planck-optimal split separates the worst register from the average",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return spectralFlowRun()
  },
})
