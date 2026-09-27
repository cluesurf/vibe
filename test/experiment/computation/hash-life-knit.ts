// HashLife for the knit (code/compute/hash-life): Gosper's memoized space-time blocks on the 24-direction D4
// lattice gas, with the schedule's phase in every key, run exactly on an unbounded lattice.
//
// Both knits of code/compute/knit-reference (committed, combined). Measured:
// 1. THE PERIOD the memo keys assume: each knit's collision at beat t and t + 24 agree on 400 dock states for
//    every t (and every exactness check below would fail if they did not).
// 2. EXACT AGAINST BRUTE FORCE. Advances of 1, 1, 2, 2 and 4 beats (to beat 10) against the dense lattice gas
//    on the side-17 box with the seed at its centre, every slot of every dock of the box (HashLife's docks
//    folded into it), on the beats where the disturbance's span in basis coordinates plus 2 is under 17 (no
//    wrap can matter): a lone love on direction 4, the meson, the knot and a radius-1 blob.
// 3. EXACT AGAINST THE DIFFERENCE ENGINE (E-CMP-0015) on the unbounded lattice, every differing dock at beats
//    1, 3, 7, 15, 31, 63 and 127 (advances of 2^0 to 2^6): lone loves on directions 4 and 7 and a lone fear
//    on 4, the meson, the knot, a radius-2 blob; a dense cube (side 8, 2,048 docks, golden fill) and a
//    crystal (side 16, one 4^4 tile repeated, 32,768 docks) to beat 15.
// 4. SCALE. A lone travelling love (direction 0, a particle on both knits) advanced by doubling steps to beat
//    2^40 - 1, about 10^12 beats, in a root whose side reaches 2^41 points; exact there by the particle's own
//    recurrence: its difference at that beat must be its difference at beat 24 + r (r = beat mod 24) moved by
//    the per-period shift the difference engine measures, times the number of periods.
// 5. MEMO HIT RATES AND SPEED against brute force (its measured ns per dock per beat on the side-9 box, times
//    the docks of every root advanced times the beats) and against the difference engine: the traveller; the
//    growing dressing of a lone love on direction 4 (committed) to beat 127; the dense cube, and the crystal
//    at side 16 and at side 256 (2^31 docks, where neither brute force nor the difference engine can go),
//    to beat 15.
//
// Gates, fixed before the run: 1, 2 and 3 zero mismatches with at least 2 beats compared per seed in 2; 4 the
// recurrence prediction met exactly on both knits; 5 the traveller's memo hit rate over 0.9, and the dense
// cube's hit rate below the traveller's (a dense disturbance defeats memoization, which is the limit stated
// in the engine's header).
//
// Depth L2: an exact engineering equivalence checked against the dense rule and an independent engine, then
// used to measure.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { HashLifeOverflow, makeHashLife, type Fill, type HashLife, type Universe } from '@/code/compute/hash-life'
import { DifferenceOverflow, makeDifferenceEngine, type DifferenceEngine } from '@/code/compute/difference-engine'
import { blobSeed, boxRun, KNIT_PERIOD, knitForward, KNOT_SEED, loneSeed, MESON_SEED, type KnitName, type Seed } from '@/code/compute/knit-reference'
import { d4BoxCell, d4Coordinates, d4Vector } from '@/code/substrate/d4-box'

const KNITS: readonly KnitName[] = ['committed', 'combined']
const GOLDEN = (Math.sqrt(5) - 1) / 2
const TRAVEL_DOUBLINGS = 40

const now = (): number => performance.now()

const seedDocks = (seed: Seed): { vector: number[]; state: Int8Array }[] => seed.docks.map(d => ({ vector: d4Vector(d.coords), state: d.state }))

function engineFor(name: KnitName, seed: Seed, fill?: Fill): DifferenceEngine {
  const engine = makeDifferenceEngine({ forward: knitForward(name), maxDocks: 1 << 21 })

  for (const d of seed.docks) {
    engine.set(d.coords, d.state)
  }

  if (fill) {
    forEachFill(fill, (vector, state) => engine.set(d4Coordinates(vector), state))
  }

  return engine
}

function forEachFill(fill: Fill, visit: (vector: number[], state: ArrayLike<number>) => void): void {
  const n = fill.side

  for (let i = 0; i < n ** 4; i++) {
    const v = [i % n, Math.floor(i / n) % n, Math.floor(i / n ** 2) % n, Math.floor(i / n ** 3)].map((x, a) => x + (fill.lo[a] ?? 0))

    if (v.reduce((s, x) => s + x, 0) % 2 === 0) {
      visit(v, fill.state(v))
    }
  }
}

const goldenState = (n: number): Int8Array => {
  const state = new Int8Array(24)

  for (let d = 0; d < 24; d++) {
    const u = ((n * 24 + d + 1) * GOLDEN * 1.37) % 1

    state[d] = u < 0.25 ? -1 : u < 0.75 ? 0 : 1
  }

  return state
}

// a dense cube: every dock its own golden state
const denseFill = (side: number): Fill => ({
  lo: [-side / 2, -side / 2, -side / 2, -side / 2],
  side,
  state: v => goldenState(v.reduce((s, x, a) => s * 1009 + x + 500 * (a + 1), 0) % 100003),
})

// a crystal: one 4^4 tile repeated
const crystalFill = (side: number): Fill => ({
  lo: [-side / 2, -side / 2, -side / 2, -side / 2],
  side,
  period: 4,
  state: v => goldenState(v.reduce((s, x) => s * 4 + (((x % 4) + 4) % 4), 0)),
})

// the differences of both engines agree exactly
function agree(life: HashLife, u: Universe, engine: DifferenceEngine): number {
  const fromLife = life.differences(u)
  const fromEngine = new Map<string, string>()

  engine.forEach((coords, state) => fromEngine.set(d4Vector(coords).join(','), state.join(',')))

  let mismatches = Math.abs(fromLife.length - fromEngine.size)

  for (const d of fromLife) {
    mismatches += fromEngine.get(d.vector.join(',')) === d.state.join(',') ? 0 : 1
  }

  return mismatches
}

const spanOf = (life: HashLife, u: Universe): number => {
  const coords = life.differences(u).map(d => d4Coordinates(d.vector))

  if (coords.length === 0) {
    return 0
  }

  return Math.max(...[0, 1, 2, 3].map(a => Math.max(...coords.map(c => c[a] ?? 0)) - Math.min(...coords.map(c => c[a] ?? 0))))
}

type Measure = { beats: number; seconds: number; hitRate: number; nodes: number; bruteDockBeats: number; rootLevel: number }

// advance through `steps` (log2 beats), counting brute force's equivalent work and the memo's hits
function measured(life: HashLife, start: Universe, steps: readonly number[], check?: (u: Universe) => void): { u: Universe; m: Measure } {
  const before = life.stats()
  const t0 = now()
  let u = start
  let bruteDockBeats = 0

  for (const j of steps) {
    const next = life.advance(u, j)

    // the root the advance ran on had level next.level + 1
    bruteDockBeats += 2 ** (4 * (next.level + 1) - 1) * 2 ** j
    u = next
    check?.(u)
  }

  const seconds = (now() - t0) / 1000
  const after = life.stats()
  const calls = after.resultCalls - before.resultCalls + (after.baseCalls - before.baseCalls)
  const misses = after.resultMisses - before.resultMisses + (after.baseMisses - before.baseMisses)

  return { u, m: { beats: u.beat - start.beat, seconds, hitRate: calls > 0 ? 1 - misses / calls : 1, nodes: after.nodes, bruteDockBeats, rootLevel: u.level } }
}

const round = (x: number, digits = 3): number => Number(x.toPrecision(digits))

export default experiment({
  id: 'computation/hash-life-knit',
  code: 'E-CMP-0016',
  title:
    "HashLife on the knit: memoized space-time blocks on the D4 lattice gas, keyed by the schedule's phase, equal the dense lattice gas and the difference engine bit for bit on both knits, carry a travelling vibe exactly to beat 2^40 - 1 in a root 2^41 docks on a side, and pay off where space-time repeats (the vacuum, a crystal) while a dense disturbance defeats the memo",
  category: 'computation',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const control: Record<string, number> = {}
    let exactFailures = 0

    // 1
    for (const name of KNITS) {
      const forward = knitForward(name)
      let mismatches = 0

      for (let t = 0; t < KNIT_PERIOD; t++) {
        const a = forward(t)
        const b = forward(t + KNIT_PERIOD)

        for (let n = 0; n < 400; n++) {
          const v = goldenState(n * 31 + t)
          const w = Int8Array.from(v)

          a(v, 0, 24)
          b(w, 0, 24)
          mismatches += v.every((x, d) => x === w[d]) ? 0 : 1
        }
      }

      metrics[`${name}PeriodMismatches`] = mismatches
      exactFailures += mismatches
    }

    // 2
    for (const name of KNITS) {
      for (const seed of [loneSeed(4, 1), MESON_SEED, KNOT_SEED, blobSeed(1)]) {
        const life = makeHashLife({ forward: knitForward(name), period: KNIT_PERIOD })
        const side = 17
        const center = [8, 8, 8, 8]
        const dense = boxRun({ forward: knitForward(name), side, seed, center })
        let u = life.universe({ docks: seedDocks(seed), beat: 0 })
        let mismatches = 0
        let compared = 0

        for (const j of [0, 0, 1, 1, 2]) {
          u = life.advance(u, j)

          while (dense.beat() < u.beat) {
            dense.step()
          }

          if (spanOf(life, u) + 2 >= side) {
            break
          }

          // HashLife's differing docks folded into the box, the vacuum everywhere else
          const data = dense.data()
          const expected = new Int8Array(data.length)
          const vac = life.vacuum(u.beat)

          for (let i = 0; i < expected.length; i++) {
            expected[i] = vac[i % 24] ?? 0
          }

          for (const d of life.differences(u)) {
            const cell = d4BoxCell({ coordinates: d4Coordinates(d.vector).map((x, a) => x + (center[a] ?? 0)), side })

            expected.set(d.state, cell * 24)
          }

          for (let i = 0; i < data.length; i++) {
            mismatches += data[i] === expected[i] ? 0 : 1
          }

          compared += 1
        }

        metrics[`${name}Brute_${seed.name}_Mismatches`] = mismatches
        metrics[`${name}Brute_${seed.name}_BeatsCompared`] = compared
        exactFailures += mismatches + (compared >= 2 ? 0 : 1)
      }
    }

    // 3
    const exactAgainstEngine = (name: KnitName, label: string, seed: Seed, fill: Fill | undefined, doublings: number): number => {
      const life = makeHashLife({ forward: knitForward(name), period: KNIT_PERIOD })
      const engine = engineFor(name, seed, fill)
      let u = life.universe({ docks: seedDocks(seed), fill, beat: 0 })
      let mismatches = 0
      let checkpoints = 0

      try {
        for (let j = 0; j < doublings; j++) {
          u = life.advance(u, j)

          while (engine.beat() < u.beat) {
            engine.step()
          }

          mismatches += agree(life, u, engine)
          checkpoints += 1
        }
      } catch (error) {
        if (!(error instanceof HashLifeOverflow) && !(error instanceof DifferenceOverflow)) {
          throw error
        }

        metrics[`${name}Engine_${label}_CapReachedAfterBeat`] = u.beat
      }

      metrics[`${name}Engine_${label}_Mismatches`] = mismatches
      control[`${name}Engine_${label}_LastBeatCompared`] = u.beat
      control[`${name}Engine_${label}_LastDocks`] = engine.support().docks

      // at least beats 1, 3, 7, 15 and 31
      return mismatches + (checkpoints >= Math.min(5, doublings) ? 0 : 1)
    }

    for (const name of KNITS) {
      for (const seed of [loneSeed(4, 1), loneSeed(7, 1), loneSeed(4, -1), MESON_SEED, KNOT_SEED, blobSeed(2)]) {
        exactFailures += exactAgainstEngine(name, seed.name, seed, undefined, 7)
      }

      exactFailures += exactAgainstEngine(name, 'dense8', { name: 'none', docks: [] }, denseFill(8), 4)
      exactFailures += exactAgainstEngine(name, 'crystal16', { name: 'none', docks: [] }, crystalFill(16), 4)
    }

    // brute force's cost per dock per beat, side 9
    const bruteNs = Object.fromEntries(
      KNITS.map(name => {
        const dense = boxRun({ forward: knitForward(name), side: 9, seed: loneSeed(4, 1), center: [4, 4, 4, 4] })

        dense.step()

        const t0 = now()

        for (let t = 0; t < 12; t++) {
          dense.step()
        }

        return [name, ((now() - t0) * 1e6) / (12 * 9 ** 4)]
      }),
    ) as Record<KnitName, number>

    const report = (label: string, m: Measure, name: KnitName): void => {
      metrics[`${label}Beats`] = m.beats
      metrics[`${label}Seconds`] = round(m.seconds)
      metrics[`${label}MemoHitRate`] = round(m.hitRate, 6)
      metrics[`${label}Nodes`] = m.nodes
      metrics[`${label}RootLevel`] = m.rootLevel
      metrics[`${label}BruteForceDockBeats`] = round(m.bruteDockBeats)
      metrics[`${label}EffectiveSpeedup`] = round((m.bruteDockBeats * (bruteNs[name] ?? 1) * 1e-9) / Math.max(m.seconds, 1e-6))
    }

    // 4 and 5: the traveller
    const travellerRates: number[] = []

    for (const name of KNITS) {
      const seed = loneSeed(0, 1)
      // its recurrence, from the difference engine
      const engine = engineFor(name, seed)
      const signatures: { key: string; anchor: number[] }[] = []

      for (let t = 0; t < 3 * KNIT_PERIOD; t++) {
        engine.step()

        if ((t + 1) % KNIT_PERIOD === 0) {
          signatures.push(engine.signature())
        }
      }

      const recurs = signatures[1]?.key === signatures[0]?.key && signatures[2]?.key === signatures[1]?.key
      const shift = (signatures[1]?.anchor ?? []).map((x, a) => x - (signatures[0]?.anchor[a] ?? 0))
      const life = makeHashLife({ forward: knitForward(name), period: KNIT_PERIOD })
      const start = life.universe({ docks: seedDocks(seed), beat: 0 })
      const { u, m } = measured(life, start, Array.from({ length: TRAVEL_DOUBLINGS }, (_, j) => j))
      // the prediction: the difference at beat 24 + r, moved by shift * periods
      const r = u.beat % KNIT_PERIOD
      const periods = (u.beat - KNIT_PERIOD - r) / KNIT_PERIOD
      const reference = engineFor(name, seed)

      while (reference.beat() < KNIT_PERIOD + r) {
        reference.step()
      }

      const predicted = new Map<string, string>()

      reference.forEach((coords, state) => predicted.set(d4Vector(coords.map((x, a) => x + (shift[a] ?? 0) * periods)).join(','), state.join(',')))

      const found = life.differences(u)
      const recurrenceMismatches = Math.abs(found.length - predicted.size) + found.filter(d => predicted.get(d.vector.join(',')) !== d.state.join(',')).length

      metrics[`${name}TravellerRecurs`] = recurs ? 1 : 0
      metrics[`${name}TravellerFinalBeat`] = u.beat
      metrics[`${name}TravellerRecurrenceMismatches`] = recurrenceMismatches
      metrics[`${name}TravellerDisplacement`] = round(Math.hypot(...(found[0]?.vector ?? [0, 0, 0, 0])), 6)
      metrics[`${name}TravellerRootSide`] = 2 ** (u.level + 1)
      exactFailures += recurrenceMismatches + (recurs ? 0 : 1)
      report(`${name}Traveller`, m, name)
      travellerRates.push(m.hitRate)
    }

    // the growing dressing, against the difference engine's time
    {
      const seed = loneSeed(4, 1)
      const life = makeHashLife({ forward: knitForward('committed'), period: KNIT_PERIOD })
      const { m } = measured(life, life.universe({ docks: seedDocks(seed), beat: 0 }), [0, 1, 2, 3, 4, 5, 6])
      const engine = engineFor('committed', seed)
      const t0 = now()

      while (engine.beat() < m.beats) {
        engine.step()
      }

      report('committedGrowingLove4', m, 'committed')
      metrics.committedGrowingLove4DifferenceEngineSeconds = round((now() - t0) / 1000)
      metrics.committedGrowingLove4Docks = engine.support().docks
    }

    // dense and crystal
    let denseRate = 1

    for (const [label, fill, doublings] of [
      ['dense8', denseFill(8), 4],
      ['crystal16', crystalFill(16), 4],
      ['crystal256', crystalFill(256), 4],
    ] as const) {
      const life = makeHashLife({ forward: knitForward('committed'), period: KNIT_PERIOD })
      const t0 = now()
      const start = life.universe({ fill, beat: 0 })
      const built = (now() - t0) / 1000
      const { u, m } = measured(life, start, Array.from({ length: doublings }, (_, j) => j))

      report(`committed_${label}`, m, 'committed')
      metrics[`committed_${label}BuildSeconds`] = round(built)
      metrics[`committed_${label}DocksDiffering`] = life.differenceCount(u)

      if (label === 'dense8') {
        denseRate = m.hitRate

        const engine = engineFor('committed', { name: 'none', docks: [] }, fill)
        const t1 = now()

        while (engine.beat() < m.beats) {
          engine.step()
        }

        metrics.committed_dense8DifferenceEngineSeconds = round((now() - t1) / 1000)
      }
    }

    for (const name of KNITS) {
      metrics[`${name}BruteNsPerDockSide9`] = round(bruteNs[name] ?? 0)
    }

    const ok = exactFailures === 0 && travellerRates.every(r => r > 0.9) && denseRate < Math.min(...travellerRates)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'HashLife on the knit equals the dense lattice gas on the side-17 box and the difference engine on the unbounded lattice bit for bit, for lone vibes, the meson and knot seeds, blobs, a dense cube and a crystal, on both knits; it carries a travelling vibe to beat 2^40 - 1 exactly (its recurrence predicts every slot there) with a memo hit rate over 0.9, and a dense cube defeats the memo, its hit rate below the traveller\'s',
      metrics,
      control,
      notes:
        'L2, exact integers, no random numbers. Brute-force equivalent work: for every advance, the docks of the root it ran on (half the points of a cube of side 2^level) times the beats advanced; the effective speedup is that work at brute force\'s measured ns per dock per beat (side-9 box) over HashLife\'s wall time, so it counts the vacuum brute force would have to run and says nothing about work that matters. The memo hit rate counts result and base-case calls. What HashLife cannot do: the dense cube and the growing dressing make new space-time blocks at every scale, so there the difference engine is faster (both times are printed), and a periodic wrapping D4 box is not a cube of Z^4, so HashLife runs only the unbounded lattice. Memory is capped at 2^22 nodes: the radius-2 blob reaches it after beat 63 on both knits, so its comparison stops there (recorded as CapReachedAfterBeat). Reversibility is not used. The two knits\' brute-force costs differ tenfold because the committed turning weave builds its swap and clock closures inside every dock call and the combined knit runs prebuilt tables. The traveller probe (tmp/cmp-probe-life) was seen before these gates were written.',
    })
  },
})
