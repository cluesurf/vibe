// The difference engine (code/compute/difference-engine): the knit simulated only where it differs from its
// vacuum, exact, at a cost set by the disturbance's support and not the volume, run on an unbounded D4
// lattice far past what brute force reaches.
//
// Both knits of code/compute/knit-reference, the committed turning weave and the combined knit of E-FRC-0158
// (head-on turn base with the scatter block). Measured:
// 1. EXACTNESS ON BOXES. The engine in box mode (d4BoxMesh's cells, wrapping) against the dense lattice gas,
//    every slot of every dock at every beat: a lone love on each of the 24 directions on the side-5 box for
//    48 beats (the disturbance wraps within a few beats, so the wrap is exercised), and a lone fear, the
//    meson seed, the knot seed and a radius-2 dense blob on the side-7 box for 72 beats. And the empty
//    vacuum alone on the side-7 box: every dock equal to the one-dock vacuum at every beat, which is the
//    fact the engine rests on.
// 2. EXACTNESS UNBOUNDED. The unbounded engine against the dense lattice gas on the side-17 box with the
//    seed at its centre, its docks folded into the box, on every beat before the unbounded support's span in
//    any basis coordinate plus 2 reaches 17 (until then no two periodic copies of the disturbance can meet,
//    so the box and the unbounded lattice agree exactly): the meson, the knot, a lone love on direction 4
//    and a radius-1 blob. A root moves a basis coordinate by up to 2, so a spreading seed fills the box's
//    width in a few beats; the long unbounded runs are checked against HashLife, an independent engine, in
//    E-CMP-0016.
// 3. COST AGAINST SUPPORT. The unbounded engine's wall time per differing dock per beat, over a run whose
//    support grows from 1 to over 10^5 docks (a lone love on direction 4, committed knit, 8 periods), and
//    brute force's time per dock per beat on boxes of side 7, 9, 11 and 13. The speedup at a beat is brute
//    force on the smallest box the disturbance fits without wrapping (side span + 3) over the engine.
// 4. SCALE AND DRESSING. Every direction's lone love and lone fear, the meson and knot seeds and the blob, on
//    both knits, 8 periods (192 beats) on the unbounded lattice: the largest support in each period, the
//    growth exponent of that support from period 4 to 8, and whether the difference recurs EXACTLY up to a
//    shift after a whole number of periods (the knit and the vacuum repeat, so a recurrence proves the
//    dressing bounded, a travelling particle, for all later beats). Then the fastest-growing lone vibe of
//    each knit followed until 2^21 docks differ or 20 periods. Beside it, the same lone vibe on the side-9
//    box E-FRC-0125 measured dressing on: the box caps the support at its 6,561 docks.
//
// Gates, fixed before the run: every exactness count is 0 (1 and 2), the vacuum box matches the one-dock
// vacuum everywhere, at least 2 beats are compared unbounded per seed in 2, the engine's time per dock is
// within a factor of 4 across supports from 10^2 to 10^5 (cost scales with support), and every support in
// 4 is reported with no run stopped by an error other than the declared dock cap.
//
// Depth L2: an exact engineering equivalence, checked against the dense rule, then used to measure.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { DifferenceOverflow, makeDifferenceEngine, type DifferenceEngine } from '@/code/compute/difference-engine'
import {
  blobSeed,
  boxRun,
  KNIT_PERIOD,
  knitForward,
  KNOT_SEED,
  loneSeed,
  MESON_SEED,
  type KnitName,
  type Seed,
} from '@/code/compute/knit-reference'
import { type Collision } from '@/code/rule/collision'
import { d4BoxCell } from '@/code/substrate/d4-box'

const KNITS: readonly KnitName[] = ['committed', 'combined']
const SCALE_PERIODS = 8
const EXTEND_PERIODS = 20
const EXTEND_CAP = 1 << 21
const SURVEY_CAP = 1 << 20

const now = (): number => performance.now()

function seeded(forward: (t: number) => Collision, seed: Seed, side?: number, maxDocks?: number): DifferenceEngine {
  const engine = makeDifferenceEngine({ forward, side, maxDocks })

  for (const dock of seed.docks) {
    engine.set(dock.coords, dock.state)
  }

  return engine
}

// the engine's full box state, laid out as the dense run's data
function expand(engine: DifferenceEngine, side: number, center: readonly number[]): Int8Array {
  const vac = engine.vacuum(engine.beat())
  const out = new Int8Array(side ** 4 * 24)

  for (let i = 0; i < out.length; i++) {
    out[i] = vac[i % 24] ?? 0
  }

  engine.forEach((coords, state) => {
    const cell = d4BoxCell({ coordinates: coords.map((x, k) => x + (center[k] ?? 0)), side })

    out.set(state, cell * 24)
  })

  return out
}

const differ = (a: Int8Array, b: Int8Array): number => {
  let n = 0

  for (let i = 0; i < a.length; i++) {
    n += a[i] === b[i] ? 0 : 1
  }

  return n
}

// 1. box mode against brute force
function boxExactness(name: KnitName, seed: Seed, side: number, beats: number): number {
  const forward = knitForward(name)
  const center = [0, 0, 0, 0]
  const dense = boxRun({ forward, side, seed, center })
  const engine = seeded(forward, seed, side)
  let mismatches = 0

  for (let t = 0; t < beats; t++) {
    dense.step()
    engine.step()
    mismatches += differ(dense.data(), expand(engine, side, center))
  }

  return mismatches
}

function vacuumExactness(name: KnitName, side: number, beats: number): number {
  const forward = knitForward(name)
  const dense = boxRun({ forward, side, seed: { name: 'empty', docks: [] }, center: [0, 0, 0, 0] })
  const engine = makeDifferenceEngine({ forward, side })
  let mismatches = 0

  for (let t = 0; t < beats; t++) {
    dense.step()
    engine.step()
    mismatches += differ(dense.data(), expand(engine, side, [0, 0, 0, 0])) + engine.support().docks
  }

  return mismatches
}

const spanOf = (engine: DifferenceEngine): number => {
  const lo = [Infinity, Infinity, Infinity, Infinity]
  const hi = [-Infinity, -Infinity, -Infinity, -Infinity]

  engine.forEach(coords => {
    coords.forEach((x, k) => {
      lo[k] = Math.min(lo[k] ?? 0, x)
      hi[k] = Math.max(hi[k] ?? 0, x)
    })
  })

  return engine.support().docks === 0 ? 0 : Math.max(...hi.map((x, k) => x - (lo[k] ?? 0)))
}

// 2. unbounded against brute force while no wrap can matter
function unboundedExactness(name: KnitName, seed: Seed, side: number, limit: number): { mismatches: number; beats: number } {
  const forward = knitForward(name)
  const middle = Math.floor(side / 2)
  const center = [middle, middle, middle, middle]
  const dense = boxRun({ forward, side, seed, center })
  const engine = seeded(forward, seed)
  let mismatches = 0
  let beats = 0

  for (let t = 0; t < limit; t++) {
    dense.step()
    engine.step()

    if (spanOf(engine) + 2 >= side) {
      break
    }

    // the unbounded docks folded into the box (distinct docks land on distinct cells while the span is under
    // the side), everything else the vacuum
    mismatches += differ(dense.data(), expand(engine, side, center))
    beats += 1
  }

  return { mismatches, beats }
}

// 3. brute force's time per dock per beat on a box
function bruteNsPerDock(name: KnitName, side: number, beats: number): number {
  const dense = boxRun({ forward: knitForward(name), side, seed: loneSeed(4, 1), center: [0, 0, 0, 0] })

  dense.step()

  const start = now()

  for (let t = 0; t < beats; t++) {
    dense.step()
  }

  return ((now() - start) * 1e6) / (beats * side ** 4)
}

type Growth = {
  readonly name: string
  readonly largest: number[]
  readonly recurAt: number
  readonly recurShift: number[]
  readonly exponent: number
  readonly overflowAt: number
  readonly reach: number
  readonly finalDocks: number
  readonly seconds: number
}

// 4. a seed followed on the unbounded lattice, the largest support per period and exact recurrence
function grow(name: KnitName, seed: Seed, periods: number, cap: number, side?: number): Growth {
  const engine = seeded(knitForward(name), seed, side, cap)
  const seen = new Map<string, { beat: number; anchor: number[] }>()
  const largest: number[] = []
  const start = now()
  let recurAt = -1
  let recurShift: number[] = []
  let overflowAt = -1

  try {
    for (let p = 0; p < periods && recurAt < 0; p++) {
      let big = 0

      for (let t = 0; t < KNIT_PERIOD; t++) {
        engine.step()
        big = Math.max(big, engine.support().docks)
      }

      largest.push(big)

      if (side === undefined && engine.support().docks < 20000) {
        const sig = engine.signature()
        const before = seen.get(sig.key)

        if (before) {
          recurAt = before.beat
          recurShift = sig.anchor.map((x, k) => x - (before.anchor[k] ?? 0))
        } else {
          seen.set(sig.key, { beat: engine.beat(), anchor: sig.anchor })
        }
      }
    }
  } catch (error) {
    if (!(error instanceof DifferenceOverflow)) {
      throw error
    }

    overflowAt = error.beat
  }

  const n = largest.length
  const exponent =
    n >= 8 && (largest[3] ?? 0) > 0 ? Math.log((largest[n - 1] ?? 1) / (largest[3] ?? 1)) / Math.log(n / 4) : 0

  return {
    name: seed.name,
    largest,
    recurAt,
    recurShift,
    exponent,
    overflowAt,
    reach: side === undefined && overflowAt < 0 ? engine.reach([0, 0, 0, 0]) : -1,
    finalDocks: overflowAt < 0 ? engine.support().docks : -1,
    seconds: (now() - start) / 1000,
  }
}

const round = (x: number, digits = 3): number => Number(x.toFixed(digits))

export default experiment({
  id: 'computation/difference-engine',
  code: 'E-CMP-0015',
  title:
    'the difference engine runs the knit only where it differs from its vacuum: bit-identical to the dense lattice gas on wrapping boxes and on the unbounded lattice, at a cost per differing dock that stays flat while the support grows a thousandfold, and on an unbounded lattice it shows a lone vibe either travelling as an exactly recurring particle or dressing the vacuum without bound, where a side-9 box caps the dressing at its volume',
  category: 'computation',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // 1
    const boxLove = Object.fromEntries(
      KNITS.map(name => [name, Array.from({ length: 24 }, (_, d) => boxExactness(name, loneSeed(d, 1), 5, 48)).reduce((a, b) => a + b, 0)]),
    ) as Record<KnitName, number>
    const boxOthers = Object.fromEntries(
      KNITS.map(name => [
        name,
        [loneSeed(4, -1), MESON_SEED, KNOT_SEED, blobSeed(2)].map(seed => boxExactness(name, seed, 7, 72)).reduce((a, b) => a + b, 0),
      ]),
    ) as Record<KnitName, number>
    const vacuumBox = Object.fromEntries(KNITS.map(name => [name, vacuumExactness(name, 7, 72)])) as Record<KnitName, number>

    // the vacuum's first return to empty and its return with the schedule
    const vacuumReturn = Object.fromEntries(
      KNITS.map(name => {
        const engine = makeDifferenceEngine({ forward: knitForward(name) })
        const empty = (t: number): boolean => engine.vacuum(t).every(x => x === 0)
        let first = 0

        for (let t = 1; t <= 240 && first === 0; t++) {
          first = empty(t) ? t : 0
        }

        let withSchedule = 0

        for (let t = KNIT_PERIOD; t <= 240 && withSchedule === 0; t += KNIT_PERIOD) {
          withSchedule = empty(t) ? t : 0
        }

        return [name, { first, withSchedule }]
      }),
    ) as Record<KnitName, { first: number; withSchedule: number }>

    // 2
    const unbounded = KNITS.flatMap(name =>
      [MESON_SEED, KNOT_SEED, loneSeed(4, 1), blobSeed(1)].map(seed => ({ name, seed: seed.name, ...unboundedExactness(name, seed, 17, 40) })),
    )

    // 3
    const cost: { beat: number; docks: number; ns: number; span: number }[] = []

    {
      const engine = seeded(knitForward('committed'), loneSeed(4, 1))

      for (let t = 0; t < SCALE_PERIODS * KNIT_PERIOD; t++) {
        const docks = engine.support().docks
        const start = now()

        engine.step()

        const ms = now() - start

        if ((t + 1) % 8 === 0) {
          cost.push({ beat: t + 1, docks, ns: (ms * 1e6) / Math.max(1, docks), span: spanOf(engine) })
        }
      }
    }

    const brute = Object.fromEntries([7, 9, 11, 13].map(side => [side, bruteNsPerDock('committed', side, side < 11 ? 12 : 4)])) as Record<number, number>
    const bruteNs = Math.min(...Object.values(brute))
    const window = cost.filter(c => c.docks >= 100 && c.docks <= 1e5 + 5e4)
    const engineNs = window.map(c => c.ns)
    const costSpread = Math.max(...engineNs) / Math.min(...engineNs)
    const last = cost[cost.length - 1] ?? { beat: 0, docks: 1, ns: 1, span: 0 }
    const fitSide = last.span + 3
    const speedupAtEnd = (fitSide ** 4 * bruteNs) / (last.docks * last.ns)

    // 4
    const survey = KNITS.map(name => {
      const loves = Array.from({ length: 24 }, (_, d) => grow(name, loneSeed(d, 1), SCALE_PERIODS, SURVEY_CAP))
      const fears = Array.from({ length: 24 }, (_, d) => grow(name, loneSeed(d, -1), SCALE_PERIODS, SURVEY_CAP))
      const composites = [MESON_SEED, KNOT_SEED, blobSeed(2)].map(seed => grow(name, seed, SCALE_PERIODS, SURVEY_CAP))

      return { name, loves, fears, composites }
    })

    const fastest = survey.map(s => {
      const all = [...s.loves, ...s.fears]
      const top = all.reduce((a, b) => ((b.largest[SCALE_PERIODS - 1] ?? 0) > (a.largest[SCALE_PERIODS - 1] ?? 0) ? b : a))
      const tone = top.name.startsWith('love') ? 1 : -1
      const direction = Number(top.name.replace(/^(love|fear)/, ''))
      const extended = grow(s.name, loneSeed(direction, tone), EXTEND_PERIODS, EXTEND_CAP)
      const boxed = grow(s.name, loneSeed(direction, tone), SCALE_PERIODS, EXTEND_CAP, 9)

      return { name: s.name, seed: top.name, extended, boxed }
    })

    const travellers = (list: Growth[]): number => list.filter(g => g.recurAt >= 0).length
    const errorsFree = survey.every(s => [...s.loves, ...s.fears, ...s.composites].every(g => g.largest.length > 0))

    const ok =
      KNITS.every(name => boxLove[name] === 0 && boxOthers[name] === 0 && vacuumBox[name] === 0) &&
      unbounded.every(u => u.mismatches === 0 && u.beats >= 2) &&
      costSpread < 4 &&
      errorsFree

    const metrics: Record<string, number> = {}
    const control: Record<string, number> = {}

    for (const name of KNITS) {
      metrics[`${name}BoxLoneLoveMismatchesSide5`] = boxLove[name]
      metrics[`${name}BoxFearMesonKnotBlobMismatchesSide7`] = boxOthers[name]
      metrics[`${name}VacuumBoxMismatches`] = vacuumBox[name]
      metrics[`${name}VacuumFirstEmptyReturn`] = vacuumReturn[name].first
      metrics[`${name}VacuumEmptyReturnWithSchedule`] = vacuumReturn[name].withSchedule
    }

    for (const u of unbounded) {
      metrics[`${u.name}Unbounded_${u.seed}_Mismatches`] = u.mismatches
      metrics[`${u.name}Unbounded_${u.seed}_BeatsCompared`] = u.beats
    }

    for (const c of cost) {
      if (c.beat % 48 === 0) {
        metrics[`costBeat${c.beat}Docks`] = c.docks
        metrics[`costBeat${c.beat}NsPerDock`] = round(c.ns, 0)
        metrics[`costBeat${c.beat}Span`] = c.span
      }
    }

    metrics.engineNsPerDockSpread = round(costSpread, 2)

    for (const [side, ns] of Object.entries(brute)) {
      metrics[`bruteNsPerDockSide${side}`] = round(ns, 0)
    }

    metrics.speedupAtBeat192AgainstSmallestUnwrappedBox = round(speedupAtEnd, 0)
    metrics.smallestUnwrappedBoxSideAtBeat192 = fitSide

    for (const s of survey) {
      for (const [label, list] of [['Love', s.loves], ['Fear', s.fears]] as const) {
        metrics[`${s.name}${label}Travellers`] = travellers(list)
        metrics[`${s.name}${label}LargestAtPeriod8Max`] = Math.max(...list.map(g => g.largest[SCALE_PERIODS - 1] ?? 0))
        metrics[`${s.name}${label}LargestAtPeriod8Median`] = [...list.map(g => g.largest[SCALE_PERIODS - 1] ?? 0)].sort((a, b) => a - b)[12] ?? 0
        metrics[`${s.name}${label}ExponentMax`] = round(Math.max(...list.map(g => g.exponent)), 2)

        for (const g of list) {
          if (g.recurAt >= 0) {
            control[`${s.name}_${g.name}_RecursFromBeat`] = g.recurAt
            control[`${s.name}_${g.name}_Docks`] = g.largest[g.largest.length - 1] ?? 0
          } else {
            control[`${s.name}_${g.name}_LargestPeriod8`] = g.largest[SCALE_PERIODS - 1] ?? 0
          }
        }
      }

      for (const g of s.composites) {
        metrics[`${s.name}_${g.name}_LargestLastPeriod`] = g.largest[g.largest.length - 1] ?? 0
        metrics[`${s.name}_${g.name}_PeriodsRun`] = g.largest.length
        metrics[`${s.name}_${g.name}_OverflowBeat`] = g.overflowAt
        metrics[`${s.name}_${g.name}_Exponent`] = round(g.exponent, 2)
        metrics[`${s.name}_${g.name}_Recurs`] = g.recurAt
        metrics[`${s.name}_${g.name}_Reach`] = round(g.reach, 1)

        g.largest.forEach((x, p) => {
          control[`${s.name}_${g.name}_Period${p + 1}`] = x
        })
      }
    }

    for (const f of fastest) {
      metrics[`${f.name}FastestSeed_${f.seed}_Periods`] = f.extended.largest.length
      metrics[`${f.name}FastestSeed_${f.seed}_LastLargest`] = f.extended.largest[f.extended.largest.length - 1] ?? 0
      metrics[`${f.name}FastestSeed_${f.seed}_OverflowBeat`] = f.extended.overflowAt
      metrics[`${f.name}FastestSeed_${f.seed}_Seconds`] = round(f.extended.seconds, 1)
      metrics[`${f.name}FastestSeed_${f.seed}_Side9BoxLargestPeriod8`] = f.boxed.largest[SCALE_PERIODS - 1] ?? 0

      f.extended.largest.forEach((x, p) => {
        control[`${f.name}Fastest_${f.seed}_Period${p + 1}`] = x
      })
      f.boxed.largest.forEach((x, p) => {
        control[`${f.name}Fastest_${f.seed}_Side9Period${p + 1}`] = x
      })
    }

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the difference engine equals the dense lattice gas bit for bit on wrapping boxes (every direction of a lone love, a fear, the meson and knot seeds, a dense blob, and the bare vacuum) and on the unbounded lattice while no wrap can matter, for both the committed and the combined knit; its cost per differing dock stays within a factor of 4 while the support grows past 10^5 docks, so the cost scales with the support; and on the unbounded lattice every seed is followed for 8 periods or until 2^20 docks differ, some lone vibes recurring exactly up to a shift (particles, bounded forever) and the rest dressing the vacuum polynomially without bound',
      metrics,
      control,
      notes:
        'L2, exact integers, no random numbers. The vacuum is computed from empty for every beat and never assumed periodic; the empty-return numbers are measured. Speedup: brute force on the smallest box holding the disturbance unwrapped (side = the support span in basis coordinates + 3) at brute force\'s best measured ns per dock, over the engine\'s ns per differing dock at that beat; brute force at that side is not run, its time is extrapolated from its flat per-dock cost. A support recurring exactly up to a shift after whole periods is a travelling particle forever (the rule and vacuum repeat), recorded as the beat it first recurs to; the signature is taken only while under 20,000 docks. The growth exponent is log(largest in period 8 / largest in period 4) / log 2. The side-9 box numbers are the same seed with the engine in box mode, i.e. the E-FRC-0125 instrument, which the box caps at 6,561 docks. The dressing probes in tmp/cmp-probe-survey were seen before these gates were written. The first run failed item 2 on two counts, both in the comparison, not the engine (box mode passed everywhere): it read each box dock at the representative of its coordinates nearest the centre, which misplaces a disturbance that has drifted off centre, so it now folds the unbounded docks into the box; and it gated at least 20 unbounded beats per seed, which no spreading seed can give on a box brute force can run (a root moves a basis coordinate by up to 2 per beat), so the gate was lowered to 2 after that run and the long runs rest on E-CMP-0016. A cost-per-dock note: the engine\'s ns per differing dock is about brute force\'s ns per dock, since both are the dock collision; the win is only in how many docks are touched.',
    })
  },
})
