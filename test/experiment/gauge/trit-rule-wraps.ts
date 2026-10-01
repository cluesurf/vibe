// THE TRIT RULE'S OWN WRAPS (E-FRC-0265). OPEN-LGT-02 asks which split the husk's light has: 3/8 (E-FRC-0242's
// count of bulk registers, 12 links over 32 triangles), 9/20 (the bare husk count) or 0.4614 (E-FRC-0262's exact
// equipartition of the husk light read with its own column weights). E-FRC-0262 favored 3/8 on an argument, "the
// capacities that wrap are the bulk's", and said settling it needs the trit rule's own wraps, run, instead of the
// exact equipartition of the linear light. This file runs them.
//
// DERIVED BEFORE THE GATE RUN. No probe of any gated quantity was run. The code was typechecked before the run.
// 1. WHAT A BALANCE NEEDS. E-FRC-0234's balance is a statement about two kinds of seam: the link columns (holding
//    e) and the plaquette columns (holding B) reach their seams at one temperature exactly when f / s is the
//    balance. It needs a seam on each side. The quantum loop light has both: its drift reads bal(e) and its force
//    reads bal(B), each a Z_N register.
// 2. THE TRIT RULE HAS FOUR WRAPS, AND ONE OF THEM IS A SEAM (code/rule/trit-column, code/measure/trit-wraps):
//    - the angle A_l cycles in its window (4D on an axis, 2D on a diagonal). The force reads B = C W A mod 4D, and
//      w A moves by exactly 4D when A wraps (w = 1 on an axis, 2 on a diagonal). So an angle wrap changes no B, no
//      flux and no counter. It is bookkeeping: the rule with every angle window doubled runs the same flux,
//      fields and counters forever
//    - the plaquette field B_P is centered mod 4D with its seam at 2D, the compact U(1) seam (E-FRC-0244, 0245).
//      Moving that seam (the plaquette modulus doubled with the windows) changes the run: a control
//    - the potential U_P cycles in -n_P D .. n_P D. The rule reads U only through the flux e = S - C^T U, and C^T
//      has a kernel (the four triangles of the flat tetrahedron on docks 0, x, y, x + y: the square's two cuts
//      bound the same loop). Two starts that differ by a kernel vector g have the same flux, fields and counters,
//      so the rule runs them identically until a potential wraps in one and not the other, and then the flux
//      jumps by (2 n_P D + 1) C^T on that triangle in one run only. The timing of a potential wrap is set by a part
//      of U that no other reading sees. It is a finite register's overflow, not a seam of e
//    - the counter's wrap is the unit of force, by design
//    So THE ELECTRIC SIDE HAS NO SEAM: the drift reads e raw (|e| runs past D, where a Z_N light of this depth has
//    its seam, without any wrap tied to it). The trit rule is compact U(1) in Villain's form, compact on the
//    magnetic side only.
// 3. THE BULK TRITS ARE NOT REGISTERS. A column is kept in the thermometer code, so every bulk trit is a function
//    of its column's sum: re-encoding the husk integers read off the trits gives back every trit, every beat. And
//    a bulk trit's fill falls with its depth position in its column (the trit at position i is nonzero exactly
//    when |A| > i). The 3/8 reading assumed each bulk link and bulk triangle is a register of its own that fills
//    like every other; in the rule they are not independent, they do not fill alike, and a wrap rewrites a
//    whole column.
// 4. WHAT FOLLOWS, derived, not gated:
//    - the trit rule cannot choose the split. It has seams on one side, so E-FRC-0234's balance is not defined
//      for it, and its split never enters its dynamics (it fixes only kappa, E-FRC-0207, 0261). Its own wraps
//      are run here and they are silent on 3/8 against 0.4614
//    - they do exclude 3/8's premise. The registers that wrap are husk columns, one wrap per column, and the light
//      the rule runs is the husk light (the bulk's depth zero mode), whose equipartition is over husk modes
//      (8 per husk dock), not over the bulk's (11 per bulk dock). 3/8 is the balance of a 4D bulk light the model
//      does not run
//    - the split lives only in a quantum light with a seam on each side, which is not built in 3D (OPEN-LGT-12).
//      Built as a Z_N gauge theory on the husk columns, every register carries one N (a gauge group is one
//      group), and E-FRC-0262's equal-capacity reading applies: 0.4614. That is an argument about a light not
//      yet built, and 0.4614 was not measured blind, so nothing here settles the split
//
// GATES, fixed before the gate run. Lattices: side 4, depth 4 (the least stable depth at p = 1, 2D + 1 >= 8) and
// side 8, depth 8, wave form, p = 1. Starts: the Kronecker streams 0, 1, 2 (code/tool/weyl), every angle and
// potential uniform over its whole window and every counter over -D .. D (hot: every kind of wrap occurs).
// T1 WITNESS: on side 4, depth 4, the trit rule's column sums equal the husk integer rule on every value of
//    every beat, 200 beats, all three starts, 0 mismatches, with angle wraps and potential wraps each counted
//    more than 0 by the trit rule's own tally
// T2 THE TRITS ARE A FUNCTION OF THE COLUMNS: on the same runs, writing the husk integers read off the trits
//    into an empty trit state (strings and charges copied) reproduces every trit, every beat, 0 mismatches
// T3 FILL FALLS WITH DEPTH: on the same runs, the occupancy of the angle columns' positions (mean |trit| over
//    links and beats) is non-increasing down the column for both axis and diagonal columns, and the top
//    position's occupancy is at least twice the bottom's
// T4 ANGLE WRAPS ARE BOOKKEEPING: the husk rule with every angle window doubled, from the same start, 400 beats,
//    both lattices, all starts: the flux, the three counters and every centered plaquette field equal the
//    rule's at every beat, every angle congruent modulo its original window, and the rule's own angle wraps
//    more than the doubled rule's (which are more than 0 or 0)
// T5 POTENTIAL WRAPS ARE NOT A SEAM: starts S (potentials 0 on the kernel's four triangles) and S + g (g the
//    kernel vector found in code), 400 beats, both lattices, all starts: the first beat at which the flux or a
//    counter differs is exactly the first beat at which a potential wrapped in one run and not the other, and
//    that beat exists (a wrap difference occurs within 400 beats)
// T6 THE ELECTRIC SIDE HAS NO SEAM AT +-D: over the T4 runs of the rule, some link-beats carry |e| > D
// C1 CONTROL, THE MAGNETIC SEAM IS PHYSICAL: the rule with its angle windows AND its plaquette modulus doubled
//    (the seam moved from 2D to 4D), from the same start, departs from the rule's flux or counters within 400
//    beats on every lattice and start (so T4's equality is not a test that cannot fail)
// READ: per class, angle wraps (axis, diagonal), potential wraps and plaquette seam crossings (n_P = 1, 2) per
// register per beat on the T4 runs; the fraction of link-beats with |e| > D and the largest |e|; the occupancy
// profiles; the kernel vector's support.
// Status: partial if every gate holds (the rule's wraps answer what they can: one seam side, husk-column
// registers, 3/8's premise false, the split undetermined by the rule); fail otherwise.
//
// FIRST RUN 2026-09-29 (in the experiment/light-balance worktree, tmp/trit-wraps-run1.log, 181 s): PARTIAL as
// predicted, all seven gates held, no gate moved, no probe before it. Trit rule against the husk integers: 0
// mismatches in 600 beats with about 73,000 angle wraps and 15,000 potential wraps per start; 0 re-encoding
// mismatches; axis occupancy 0.939 at the top of the column down to 0.062 at the bottom. Doubled angle windows: 0
// differences in flux, counters and fields over 400 beats on every lattice and start (the rule wraps 147,132 angles
// against the doubled rule's 91,650 on L4 s0). Seam moved: departs at beat 1 everywhere. Kernel vector: 4
// triangles, all with n_P = 2; the first flux difference equals the first wrap difference at beats 37, 18, 14 (L4)
// and 41, 39, 122 (L8). |e| > D on 65 to 67 percent of link-beats (largest 52 at D 4, 111 at D 8). READ at this
// temperature (every register past its seam): plaquette seam crossings 1.61 to 1.63 a beat on n_P = 1 triangles
// and 1.50 to 1.53 on n_P = 2 at L4 (1.56 and 1.49 at L8); potential wraps 0.062 and 0.056 a beat (0.035 and
// 0.030 at L8); angle wraps 0.58 (axis) and 0.66 (diagonal).
//
// Depth L2: the model's own light rule run bit for bit, hot, with structural claims about its registers; no
// equipartition and no float enters a gate. No start family beyond three streams: every claim is about the
// rule's construction and is checked on every start run.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  copyHuskLight,
  emptyTally,
  emptyTritState,
  huskLightBeat,
  makeTritLight,
  readHusk,
  tritLightBeat,
  writeHusk,
  type TritLight,
} from '@/code/rule/trit-column'
import {
  angleOccupancy,
  compareRuns,
  hotHuskStart,
  kernelPotential,
  sameTrits,
  tallyRun,
  tritMatchesHusk,
  widenedLight,
} from '@/code/measure/trit-wraps'

const STARTS = [0, 1, 2]
const WITNESS_BEATS = 200
const RUN_BEATS = 400
const LATTICES: readonly { side: number; depth: number }[] = [
  { side: 4, depth: 4 },
  { side: 8, depth: 8 },
]

const lightOf = (side: number, depth: number): TritLight =>
  makeTritLight({ side, depth, p: 1, form: 'wave' })

export function tritRuleWrapsRun(): Verdict {
  const started = Date.now()
  const metrics: Record<string, number> = {}

  // T1, T2, T3 on the trit rule itself
  const small = lightOf(4, 4)

  let t1 = true
  let t2 = true
  let t3 = true
  let t1Mismatches = 0
  let t2Mismatches = 0

  for (const start of STARTS) {
    const husk = hotHuskStart(small, start, 1)
    const trits = emptyTritState(small)

    writeHusk(small, trits, husk)

    const tally = emptyTally()
    const axis = new Array<number>(2 * small.bulk.depth).fill(0)
    const diagonal = new Array<number>(small.bulk.depth).fill(0)

    for (let t = 0; t < WITNESS_BEATS; t++) {
      tritLightBeat(small, trits, tally)
      huskLightBeat(small, husk)

      if (!tritMatchesHusk(small, trits, husk)) {
        t1Mismatches++
      }

      const again = emptyTritState(small)

      again.vibe.set(trits.vibe)
      again.string.set(trits.string)
      writeHusk(small, again, readHusk(small, trits))

      if (!sameTrits(again, trits)) {
        t2Mismatches++
      }

      const occupancy = angleOccupancy(small, trits)

      occupancy.axis.forEach((x, i) => (axis[i] = (axis[i] ?? 0) + x))
      occupancy.diagonal.forEach(
        (x, i) => (diagonal[i] = (diagonal[i] ?? 0) + x),
      )
    }

    metrics[`witness_s${start}_angleWraps`] = tally.wraps
    metrics[`witness_s${start}_potentialWraps`] = tally.potentialWraps
    t1 &&= tally.wraps > 0 && tally.potentialWraps > 0

    const profile = (xs: number[]): boolean =>
      xs.every((x, i) => i === 0 || x <= xs[i - 1]!) &&
      xs[0]! >= 2 * xs[xs.length - 1]!

    const ax = axis.map(x => x / WITNESS_BEATS)
    const di = diagonal.map(x => x / WITNESS_BEATS)

    ax.forEach((x, i) => (metrics[`occupancy_s${start}_axis_${i}`] = x))
    di.forEach((x, i) => (metrics[`occupancy_s${start}_diagonal_${i}`] = x))
    t3 &&= profile(ax) && profile(di)
  }

  t1 &&= t1Mismatches === 0
  t2 = t2Mismatches === 0
  metrics.witnessMismatches = t1Mismatches
  metrics.reencodeMismatches = t2Mismatches

  // T4, T5, T6, C1 on the husk integer rule
  let t4 = true
  let t5 = true
  let t6 = true
  let c1 = true

  for (const { side, depth } of LATTICES) {
    const light = lightOf(side, depth)
    const wide = widenedLight(light, 2, 1)
    const seamless = widenedLight(light, 2, 2)
    const g = kernelPotential(light)
    const support = Array.from(g, (x, p) => (x !== 0 ? p : -1)).filter(
      p => p >= 0,
    )
    const tag = `L${side}D${depth}`

    metrics[`kernelSupport_${tag}`] = support.length
    metrics[`kernelSupportOne_${tag}`] = support.filter(
      p => light.bulk.multiplicity[p] === 1,
    ).length

    for (const start of STARTS) {
      const s = hotHuskStart(light, start, 1)
      const key = `${tag}_s${start}`

      // T4
      const doubled = compareRuns(light, s, wide, s, RUN_BEATS)

      metrics[`angle_${key}_firstDynamical`] = doubled.firstDynamical
      metrics[`angle_${key}_firstField`] = doubled.firstField
      metrics[`angle_${key}_firstIncongruent`] = doubled.firstAngleIncongruent
      metrics[`angle_${key}_wrapsRule`] = doubled.angleWrapsA
      metrics[`angle_${key}_wrapsDoubled`] = doubled.angleWrapsB
      t4 &&=
        doubled.firstDynamical < 0 &&
        doubled.firstField < 0 &&
        doubled.firstAngleIncongruent < 0 &&
        doubled.angleWrapsA > doubled.angleWrapsB

      // C1
      const moved = compareRuns(light, s, seamless, s, RUN_BEATS)

      metrics[`seam_${key}_firstDynamical`] = moved.firstDynamical
      c1 &&= moved.firstDynamical > 0

      // T5
      const base = copyHuskLight(s)

      for (const p of support) {
        base.potential[p] = 0
      }

      const shifted = copyHuskLight(base)

      for (const p of support) {
        shifted.potential[p] = (base.potential[p] ?? 0) + (g[p] ?? 0)
      }

      const gauge = compareRuns(light, base, light, shifted, RUN_BEATS)

      metrics[`potential_${key}_firstWrapDifference`] =
        gauge.firstWrapDifference
      metrics[`potential_${key}_firstDynamical`] = gauge.firstDynamical
      metrics[`potential_${key}_firstField`] = gauge.firstField
      metrics[`potential_${key}_wrapsA`] = gauge.potentialWrapsA
      metrics[`potential_${key}_wrapsB`] = gauge.potentialWrapsB
      t5 &&=
        gauge.firstWrapDifference > 0 &&
        gauge.firstDynamical === gauge.firstWrapDifference

      // T6 and the reads
      const tally = tallyRun(light, s, RUN_BEATS)
      const perLink = tally.links * RUN_BEATS
      const axisLinks = light.bulk.huskDocks * 3 * RUN_BEATS
      const diagonalLinks = light.bulk.huskDocks * 6 * RUN_BEATS
      const oneBeats = tally.trianglesOne * RUN_BEATS
      const twoBeats = tally.trianglesTwo * RUN_BEATS

      metrics[`read_${key}_angleAxisRate`] = tally.angleAxis / axisLinks
      metrics[`read_${key}_angleDiagonalRate`] =
        tally.angleDiagonal / diagonalLinks
      metrics[`read_${key}_potentialOneRate`] = tally.potentialOne / oneBeats
      metrics[`read_${key}_potentialTwoRate`] = tally.potentialTwo / twoBeats
      metrics[`read_${key}_seamOneRate`] = tally.seamOne / oneBeats
      metrics[`read_${key}_seamTwoRate`] = tally.seamTwo / twoBeats
      metrics[`read_${key}_fluxBeyondFraction`] = tally.fluxBeyond / perLink
      metrics[`read_${key}_fluxLargest`] = tally.fluxLargest
      metrics[`read_${key}_classedMatchesRule`] =
        tally.angleAxis + tally.angleDiagonal === tally.ruleAngleWraps &&
        tally.potentialOne + tally.potentialTwo === tally.rulePotentialWraps
          ? 1
          : 0
      t6 &&= tally.fluxBeyond > 0
    }
  }

  const gates = { T1: t1, T2: t2, T3: t3, T4: t4, T5: t5, T6: t6, C1: c1 }

  for (const [k, v] of Object.entries(gates)) {
    metrics[`gate${k}`] = v ? 1 : 0
  }

  metrics.seconds = (Date.now() - started) / 1000

  const f = (x: number | undefined, digits = 4): string =>
    (x ?? Number.NaN).toFixed(digits)

  return verdict({
    status: Object.values(gates).every(Boolean) ? 'partial' : 'fail',
    claim: `the trit rule's own wraps, run hot (side 4 depth 4 on trits, sides 4 and 8 on the husk integers, three starts): the trit rule equals the husk integer rule on every value (${t1Mismatches} mismatches in ${STARTS.length * WITNESS_BEATS} beats, every kind of wrap present), every bulk trit is a function of its column (${t2Mismatches} re-encoding mismatches) and a trit's fill falls down its column (axis ${f(metrics.occupancy_s0_axis_0, 3)} at the top to ${f(metrics[`occupancy_s0_axis_${2 * small.bulk.depth - 1}`], 3)} at the bottom), so the bulk trits are not registers that fill alike; angle wraps change nothing the rule reads (doubled windows run identically for ${RUN_BEATS} beats) while moving the plaquette seam does; a potential wrap is set by a kernel part of U that no reading sees (the first flux difference is the first wrap difference, beat ${metrics.potential_L4D4_s0_firstWrapDifference}), and |e| runs past D on ${f((metrics.read_L4D4_s0_fluxBeyondFraction ?? 0) * 100, 1)} percent of link-beats (largest ${metrics.read_L4D4_s0_fluxLargest}); so the rule is compact on the magnetic side only, has no electric seam, and its wraps cannot choose a split: 3/8's premise (bulk registers filling alike) is false in the rule, and the split waits on a quantum light with both seams`,
    metrics,
    control: {
      seamMovedDeparts: c1 ? 1 : 0,
      witnessMismatches: t1Mismatches,
    },
    notes: `L2, deterministic (Kronecker starts, integers only). Gates: ${JSON.stringify(gates)}. The balance question needs a seam on each side (E-FRC-0234); the trit rule has one, the plaquette's. Argued, not gated: a Z_N quantum light on the husk columns carries one N on every register, which is E-FRC-0262's equal-capacity reading (0.4614), a value measured after a probe, so the split is not settled.`,
  })
}

export default experiment({
  id: 'gauge/trit-rule-wraps',
  code: 'E-FRC-0265',
  title:
    "the trit rule's own wraps, run hot: only the plaquette wrap is a seam (angle wraps change nothing, a potential wrap is timed by a kernel part of U no reading sees, the flux has no window), every bulk trit is a function of its column and fills by its depth position, so the rule's wraps cannot choose the light's split and 3/8's premise of bulk registers filling alike is false in the rule",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return tritRuleWrapsRun()
  },
})
