// Compact counters (E-FRC-0219): the shaped light's counters held in balanced ternary instead of thermometers.
//
// E-FRC-0214 made a hopping trit charge radiate the linear light exactly with three levels of carry shaping,
// at 2 L + 1 = 7 counters per husk triangle, each a thermometer column of D trits: 1.34 times the trits the
// bulk holds. A thermometer holds 2D + 1 values in D trits; balanced ternary holds 3^D, exactly.
//
// THE ARGUMENT, written before any run (code/rule/trit-compact's header). A column may take a positional code
// only if nothing in the bulk reads one of its trits alone. The angle (a bulk triangle's angle sum is its own
// plaquette), the string (a crossing flips one string trit, and Gauss holds dock by dock) and the potential
// (the bulk flux s - C^T u reads each triangle's own u, so a weight 3^i at depth i would enter its own bulk
// link with weight one and the husk flux with weight 3^i) are read trit by trit: they stay unit-weight column
// sums, paid by a thermometer front. A counter is read only through its whole column's value, in the floor
// step that already reads whole columns (E-FRC-0207), so any bijective code is allowed, and the densest is
// balanced ternary: k = ceil(log3(2D + 1)) trits per counter, a change paid by a carry chain down its digits.
//
// PREDICTIONS (fixed before the first run):
//   the ternary rule equals the thermometer rule bit for bit, because both decode to the same husk integers
//   and the floor sees only values; it is reversible for the same reason; Gauss's law is untouched because no
//   counter enters the flux. Three levels take 7 k trits of the 3 D counter trits every husk triangle's
//   column already holds, which fits for every D >= 7 (21 of 21 at D = 7, 28 of 48 at D = 16), so the whole
//   three-level light needs NO trit beyond the bulk's present ones: per husk dock 32 D (potentials) + 140 k
//   (counters) of 128 D, 0.52 at D = 16 and falling toward 1/4.
//
// DISCLOSED: tmp/compact-probe1.log ran the carry census at D = 7, 13, 16, 40, the budget, and the exactness
// harness on side 4 at D = 7 and 8 for 40 beats (0 mismatches everywhere) before these gates were written.
//
// Gates:
// A  THE GATE, exactness: from a golden-Weyl start (integer Weyl w(i) = (i + 1) 40503 mod 2^16: angles, every
//    counter of every level and the potentials hot, 16 love-fear pairs one link apart) with the gas of E-FRC-0210
//    hopping every beat, the ternary rule and the thermometer rule agree on every vibe, angle, string and
//    potential trit and every decoded counter at every beat, and both decode to the husk shaped rule (three
//    levels, code/rule/trit-husk-shaped) at every beat: 0 mismatches, on side 4 at D = 7 (the tightest fit)
//    and D = 13 (q = 27 = 3^3, no unused pattern), 200 beats, and side 8 at D = 16, 120 beats
// R  both codes run the same beats back to every trit of the start: 0 mismatches
// G  Gauss's law in the bulk (every dock) and on the husk (every column) at every beat, both codes: 0
// C  the code, exhaustively: for every D from 7 to 64 the balanced code is a bijection of -D .. D into
//    k-trit patterns, and the carry chain turns the code of v into the code of v' for all (2D + 1)^2 pairs
// B  the budget: 7 k <= 3 D for every D from 7 to 128 (the counters fit the counter trits each husk triangle's
//    column already holds), and per husk dock the ternary need is under the bulk's trits at every such D,
//    where the thermometer need is 1.34 times them
// K  the control for the argument: the same trits read with positional potential columns break the column
//    sum identity (the column sum of the bulk flux against S - C^T U) on a nonzero number of husk links,
//    and the unit-weight reading holds it on all
// Reported: counter trit flips per beat in each code, the carry reach, and the carry census means.
// Status: pass if every gate passes, partial if A and R pass, fail otherwise.
//
// Depth L2: a construction whose equality to the husk rule is an identity of codes, checked exhaustively on
// the code and bit for bit on the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { budget, carryCensus, exactRun, weylStart } from '@/code/measure/trit-compact-light'
import { makeTritLight } from '@/code/rule/trit-column'
import { geometryOfBulk } from '@/code/rule/trit-husk'
import { emptyShaped } from '@/code/rule/trit-husk-shaped'
import { columnSumIdentityMismatches, emptyCompact, makeCompactLight } from '@/code/rule/trit-compact'

const LEVELS = 3

const RUNS = [
  { side: 4, depth: 7, beats: 200 },
  { side: 4, depth: 13, beats: 200 },
  { side: 8, depth: 16, beats: 120 },
] as const

// K: the potential columns read positionally (weight 3^i at depth position i) against unit weights
function positionalControl(): { unit: number; positional: number } {
  const light = makeTritLight({ side: 4, depth: 8 })
  const c = makeCompactLight(light, LEVELS, 'ternary')
  const s = emptyCompact(c)

  weylStart(c, s, emptyShaped(geometryOfBulk(light.bulk), LEVELS), 12, 5)

  const b = light.bulk
  const read = (positional: boolean) => (p: number): number => {
    let v = 0
    let w = 1

    for (let k = b.triColumnStart[p]!; k < b.triColumnStart[p + 1]!; k++) {
      v += (positional ? w : 1) * b.triColumnSign[k]! * s.potential[b.triColumn[k]!]!
      if (positional) w *= 3
    }

    return v
  }

  return { unit: columnSumIdentityMismatches(c, s, read(false)), positional: columnSumIdentityMismatches(c, s, read(true)) }
}

export default experiment({
  id: 'gauge/trit-compact-counters',
  code: 'E-FRC-0219',
  title:
    'compact counters: the shaped light\'s counters held in balanced ternary run bit for bit with the thermometer rule and the husk rule, reversibly and with Gauss exact, and three levels then fit the trits the bulk already holds (7 counters of k = ceil(log3(2D + 1)) trits in each husk triangle\'s 3D counter trits); the angle, string and potential columns stay thermometers because the bulk reads them trit by trit',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    let okA = true
    let okR = true
    let okG = true

    for (const r of RUNS) {
      const light = makeTritLight({ side: r.side, depth: r.depth })
      const x = exactRun({ light, levels: LEVELS, beats: r.beats, pairs: 16, salt: 1 })
      const key = `a_side${r.side}_D${r.depth}`

      metrics[`${key}_tritMismatches`] = x.tritMismatches
      metrics[`${key}_counterMismatches`] = x.counterMismatches
      metrics[`${key}_ternaryHuskMismatches`] = x.ternaryHuskMismatches
      metrics[`${key}_thermometerHuskMismatches`] = x.thermometerHuskMismatches
      metrics[`${key}_ternaryReversal`] = x.ternaryReversal
      metrics[`${key}_thermometerReversal`] = x.thermometerReversal
      metrics[`${key}_bulkGauss`] = x.bulkGauss
      metrics[`${key}_huskGauss`] = x.huskGauss
      metrics[`${key}_crossings`] = x.hops.crossings
      metrics[`${key}_refused`] = x.hops.refused
      metrics[`${key}_potentialWraps`] = x.ternaryTally.potentialWraps
      metrics[`${key}_ternaryCounterFlipsPerBeat`] = x.ternaryTally.counterFlips / r.beats
      metrics[`${key}_thermometerCounterFlipsPerBeat`] = x.thermometerTally.counterFlips / r.beats
      metrics[`${key}_ternaryCounterReach`] = x.ternaryTally.counterReach
      metrics[`${key}_thermometerCounterReach`] = x.thermometerTally.counterReach

      okA = okA && x.tritMismatches === 0 && x.counterMismatches === 0 && x.ternaryHuskMismatches === 0 && x.thermometerHuskMismatches === 0
      okR = okR && x.ternaryReversal === 0 && x.thermometerReversal === 0
      okG = okG && x.bulkGauss === 0 && x.huskGauss === 0
    }

    let okC = true
    let chainCases = 0

    for (let d = 7; d <= 64; d++) {
      const census = carryCensus(d)

      chainCases += census.cases
      okC = okC && census.encodeFailures === 0 && census.chainFailures === 0

      if ([7, 13, 16, 40, 64].includes(d)) {
        metrics[`c_D${d}_digits`] = census.digits
        metrics[`c_D${d}_unusedPatterns`] = census.unused
        metrics[`c_D${d}_meanReach`] = census.meanReach
        metrics[`c_D${d}_meanFlips`] = census.meanFlips
        metrics[`c_D${d}_thermometerMeanFlips`] = census.thermometerMeanFlips
      }
    }

    metrics.c_chainCases = chainCases

    let okB = true

    for (let d = 7; d <= 128; d++) {
      const t = budget(d, LEVELS, 'ternary')

      okB = okB && t.perTriangleNeed <= t.perTriangleHave && t.ratio < 1
    }

    for (const d of [7, 11, 16, 32, 64, 128]) {
      const t = budget(d, LEVELS, 'ternary')
      const m = budget(d, LEVELS, 'thermometer')

      metrics[`b_D${d}_counterTritsNeed`] = t.perTriangleNeed
      metrics[`b_D${d}_counterTritsHave`] = t.perTriangleHave
      metrics[`b_D${d}_ternaryNeedOverHave`] = t.ratio
      metrics[`b_D${d}_thermometerNeedOverHave`] = m.ratio
    }

    const k = positionalControl()

    metrics.k_unitMismatches = k.unit
    metrics.k_positionalMismatches = k.positional

    const gates = { A: okA, R: okR, G: okG, C: okC, B: okB, K: k.unit === 0 && k.positional > 0 }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = Object.values(gates).every(v => v) ? 'pass' : gates.A && gates.R ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `with the three-level light's 7 counters per husk triangle in balanced ternary (k = 3 trits at D = 7 and 13, 4 at D = 16), the rule agrees with the thermometer rule and the husk shaped rule on every trit and counter (mismatches ${RUNS.map(r => metrics[`a_side${r.side}_D${r.depth}_ternaryHuskMismatches`]).join(', ')} at side ${RUNS.map(r => `${r.side} D ${r.depth}`).join(', ')}, with ${RUNS.map(r => metrics[`a_side${r.side}_D${r.depth}_crossings`]).join(', ')} gas crossings), reverses to ${metrics[`a_side8_D16_ternaryReversal`]} mismatches, keeps Gauss exact, and fits the counter trits each husk triangle already holds: ${metrics.b_D16_counterTritsNeed} of ${metrics.b_D16_counterTritsHave} at D = 16, the whole light ${(metrics.b_D16_ternaryNeedOverHave ?? 0).toFixed(3)} of the bulk's trits against ${(metrics.b_D16_thermometerNeedOverHave ?? 0).toFixed(3)} as thermometers; a positional potential column breaks the column-sum identity on ${k.positional} husk links`,
      metrics,
      control: { thermometerNeedOverHaveD16: metrics.b_D16_thermometerNeedOverHave ?? 0, positionalPotentialMismatches: k.positional },
      notes:
        'L2, exact integers in the rule, deterministic (integer Weyl starts). FIRST RUN 2026-09-26 (tmp/frc0219.log, 13.5 s), PASS on every gate, no gate moved. A: the ternary rule, the thermometer rule and the husk shaped rule agree on every trit and every counter at every beat, 0 mismatches at side 4 D 7 (200 beats, 5,403 gas crossings), side 4 D 13 (200 beats, 5,584) and side 8 D 16 (120 beats, 3,689), from hot starts that wrap potentials thousands of times (8,388, 3,496, 10,822). R: both codes return to every trit (0). G: Gauss exact in bulk and husk at every beat (0). C: the balanced code is a bijection and the carry chain equals re-encoding on all 365,690 pairs over D = 7 .. 64; a change reaches 2.95 digits on average at D = 16 (4 at most), flipping 3.07 trits against 10.99 for a thermometer front. B: 7 counters take 21 of 21 counter trits per husk triangle at D = 7, 28 of 48 at D = 16, 42 of 384 at D = 128; the whole light takes 0.719, 0.523, 0.387, 0.301 of the bulk\'s trits at D = 7, 16, 32, 128, against 1.344 as thermometers at every D. K: read positionally, the potential columns break the column-sum identity on 573 husk links (unit weights: 0). On the rule the ternary code flips half to a quarter of the thermometer\'s counter trits (22,292 against 44,652 per beat at D = 7, 220,324 against 789,250 at D = 16, hot starts). STRUCTURAL: at D = 13 and 40 (q = 3^3, 3^4) every trit pattern of a counter is a counter.',
    })
  },
})
