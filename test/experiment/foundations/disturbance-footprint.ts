// ONE DISTURBED DOCK: IS THE WORKING RULE LINEAR OVER Z3, AND WHAT DIMENSION DOES ITS FOOTPRINT HAVE? (E-FND-0169, the
// rule's linearity). A linear rule over Z3 started from one disturbed site draws Pascal's triangle mod 3 (in 1 + 1
// dimensions its space-time footprint has box-counting dimension log 6 / log 3 = 1.6309), and superposition holds
// exactly: the run of a sum of two disturbances is the sum of their runs, mod 3. This file runs the current working
// rule from its vacuum with one disturbed dock, measures the footprint's growth, and tests superposition directly.
//
// THE RULE AND THE READING. The working rule as E-SPN-0098 runs it with no mixer: the doublet-locked knit with the pass
// contact, the coin on, the meeting, the no-veto store, on the full-period path key, offset 0 (code/measure/full-key-
// paths keyedRunner; contactFresh side 16, 65,536 docks; wordVacuum, every vibe slot empty and a quarter of the lines
// holding a stored pair at beat 0). A DISTURBANCE adds +1 mod 3 (balanced: 0 -> 1 -> -1 -> 0) to one vibe slot and marks
// it open, the lone love of E-SPN-0098. The state read as trits mod 3 is every vibe slot and every line's store. The
// FOOTPRINT at beat t is the set of docks where the disturbed run differs from the vacuum run (same key, same beats),
// N(t) its size, S(t) = sum over beats 0 .. t of N. SUPERPOSITION, affine since the vacuum is not zero: with D(d) = R(v
// + d) - R(v) mod 3, the DEFECT at a beat is the number of trits where D(d1 + d2) differs from D(d1) + D(d2) mod 3.
// Four pairs: A one slot twice (a love plus a love is a fear), B the two slots of one dock line, C two loves on one mesh
// line two docks apart heading at each other, D two loves on different lines eight docks apart (they never meet).
//
// THE LINEAR EXPECTATION ON THE MESH. The linear rule with the mesh's own neighbor structure takes each dock's next
// value as the sum of its 24 neighbors' values mod 3 (x_(t+1)(p) = sum_r x_t(p - r)); its footprint from one dock is
// the support of P^t, P = sum over the 24 roots of z^r, counted exactly on Z^4 (code/measure/linear-footprint) to beat
// 26 = 3^3 - 1, its dimension D_lin read as log(S(26) / S(8)) / log 3 (one self-similar step) and by a log-log fit over
// beats 8 .. 26. Nothing about it is assumed: it is counted.
//
// HYPOTHESES, written before any run of this file.
//  H1 LINEAR: the defect is 0 at every beat of 48 for pairs A, B and C (the ones whose disturbances meet).
//  H2 THE DIMENSION: the working rule's footprint dimension D (the log-log slope of S(t) over beats 8 .. 48) is within
//     0.1 of D_lin.
//  P  FALSIFIER: any defect above 0 fails H1; |D - D_lin| > 0.1 fails H2.
// PREDICTED (from E-SPN-0098, E-RLT-0105 and E-SPN-0100, before any number here was read): BOTH FAIL. The meeting and
// the coin read occupation (a line half full or full), and the store makes and unmakes pairs: none of that is additive
// mod 3, so the defect is above 0 wherever two disturbances share a dock line. And a lone love stays on its mesh line
// with a bounded wake (at most 16 trits a period, E-RLT-0105), so N(t) stays bounded and S(t) grows like t: D near 1,
// far below D_lin, which is at least 4 if the mesh's linear rule fills space.
//
// CONTROLS (a failure makes the verdict partial). C1 THE BARE STREAM is a permutation of slots, hence linear: the same
// four pairs under the stream alone give defect 0 at every beat, and one disturbance's footprint is exactly 1 dock at
// every beat (D = 1 by the same fit). C2 LOCALITY: for pair D the defect is 0 at every beat at which the two single
// footprints share no dock (the rule is dock-local, so disjoint disturbances cannot fail to add).
// INSTRUMENT (a failure makes the verdict partial). I1 the same counter and fit on Pascal's rule mod 3 in 1 + 1
// dimensions: S(3^k - 1) = 6^k exactly for k = 1 .. 6, and the self-similar dimension log 6 / log 3 to 1e-12. I2 the
// mesh's linear rule obeys Frobenius mod 3: P^3 = P(z^3), so N_lin(1) = N_lin(3) = N_lin(9) = 24. I3 the vacuum run is
// reproducible: two vacuum runs agree on every trit at every beat.
// VERDICT, fixed before the run: FAIL when H1 or H2 fails with the controls and the instrument holding (the predicted
// outcome); PASS when both hold; PARTIAL when a control or the instrument fails.
//
// FIRST RUN (tmp/np-gate-E-FND-0169.log, 40 s): FAIL on H1 and H2, as predicted for both. Every control and the
// instrument held, no gate moved and none was rerun.
//  - H1: the rule is not linear over Z3. Pair A (a love twice, a fear) has a defect at every one of 48 beats, from 3
//    trits at beat 1 to 31; pair B (both slots of one dock line) at every beat, up to 30; pair C (converging on one
//    mesh line) from beat 2, up to 35. The defect grows with the wake, it is not a one-off at the meeting.
//  - H2: the footprint N(t) grows from 1 dock to 15 by beat 23 and then stays between 10 and 15 to beat 48 (the
//    bounded wake). The log-log slope of S(t) over beats 8 .. 48 reads 1.6465, which is NOT a fractal dimension: it is
//    the crossover of a linear rise into a plateau, and with N bounded S(t) grows as t, so the slope tends to 1 as the
//    window lengthens. That it lands near log 6 / log 3 = 1.6309 is a coincidence of the window, and it is reported so
//    that nobody reads it as Pascal's triangle. The mesh's linear rule counts 868,752 docks at beat 26 and has dimension
//    4.24 by one self-similar step (4.17 by the fit), against the rule's 15 docks: off by far more than 0.1.
//  - C1: the bare stream adds exactly (defect 0 on all four pairs) and keeps one dock (fit 0.952 on S = t + 1). C2: pair
//    D (dock 0 and the center, never sharing a dock in 48 beats) has defect 0 throughout. I1: Pascal mod 3 gives S(3^k -
//    1) = 6^k for k = 1 .. 6. I2: N_lin = 24 at beats 1, 3 and 9 (Frobenius). I3: the vacuum run is reproducible.
// WHAT IT MEANS for the rule's linearity: the working rule is local (disjoint disturbances add) but not additive over
// Z3 wherever two disturbances share a dock line, and its one-dock footprint is bounded at about 15 docks, a lineon
// wake, not a spreading fractal. Nothing in it propagates like a linear cellular automaton on the mesh.
//
// Depth L2 (the working rule run and read; the linear expectation is counted). DETERMINISM: no random numbers; the
// path's choices are the key's integer Weyl numbers of (beat, dock, line), the same in every run. NOTHING MOVES: each
// slot takes the value a piece hands it.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { streamInto } from '@/code/measure/doublet-locked-readings'
import { fullPathKey, keyedRunner } from '@/code/measure/full-key-paths'
import { cloneConfiguration, type Configuration } from '@/code/rule/doublet-locked-knit'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { linearFootprint, logSlope, spaceTimeCount } from '@/code/measure/linear-footprint'

const SIDE = 16
const BEATS = 48
const FIT_FROM = 8
const LINEAR_BEATS = 26
const PASCAL_BEATS = 3 ** 6 - 1
const DIMENSION_TOLERANCE = 0.1

const flag = (b: boolean): number => (b ? 1 : 0)
const mod3 = (x: number): number => ((((x + 1) % 3) + 3) % 3) - 1

export default experiment({
  id: 'foundations/disturbance-footprint',
  code: 'E-FND-0169',
  title:
    "one disturbed dock in the working vacuum: the rule is not linear over Z3 and its footprint is bounded, fail on both as predicted: superposition mod 3 fails at every beat for two disturbances on one slot (up to 31 trits), one dock line (30) and one mesh line (35), while two disturbances that never share a dock add exactly and the bare stream adds exactly; a lone love's footprint grows to 15 docks by beat 23 and stays at 10 to 15 through beat 48, so its space-time count grows as t; the log-log slope over beats 8 to 48 reads 1.65, a crossover into the plateau and not a fractal dimension, whatever its nearness to Pascal's log 6 / log 3; the linear rule with the mesh's 24 neighbors fills 868,752 docks by beat 26 with dimension 4.24",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return disturbanceRun()
  },
})

type Disturbance = { slot: number }[]

// the trits of a configuration: every vibe slot, then every line's store
const trits = (c: Configuration): Int8Array => {
  const out = new Int8Array(c.vibe.length + c.store.length)

  out.set(c.vibe)
  out.set(c.store, c.vibe.length)

  return out
}

function disturbed(vacuum: Configuration, d: Disturbance): Configuration {
  const c = cloneConfiguration(vacuum)

  for (const { slot } of d) {
    c.vibe[slot] = mod3(c.vibe[slot]! + 1)
    c.open[slot] = c.vibe[slot] !== 0 ? 1 : 0
  }

  return c
}

type Runner = { state: () => Configuration; beat: () => void }

const ruleRunner = (tables: ReturnType<typeof contactFresh>['tables'], start: Configuration): Runner =>
  keyedRunner(tables, start, { key: fullPathKey(0) })

// the bare stream alone, the control
function streamRunner(tables: ReturnType<typeof contactFresh>['tables'], start: Configuration): Runner {
  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)

  return {
    state: () => a,
    beat() {
      streamInto(tables, a, b)

      const s = a

      a = b
      b = s
    },
  }
}

// the docks where two trit arrays differ (vibe slot i is dock floor(i / 24), store line j is dock floor(j / 12))
function footprint(a: Int8Array, b: Int8Array, slots: number): Set<number> {
  const docks = new Set<number>()

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      docks.add(i < slots ? Math.floor(i / 24) : Math.floor((i - slots) / 12))
    }
  }

  return docks
}

type PairReading = {
  name: string
  defect: number[]
  disjointDefect: number
  overlapBeats: number
}

export function disturbanceRun(): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const center = centerOf(SIDE)
  const f = contactFresh(SIDE, 'pass', center)
  const tables = f.tables
  const vacuum = wordVacuum(f, f.store)
  const slots = vacuum.vibe.length

  // the pairs' slots
  const step = (slot: number, n: number): number => {
    let s = slot

    for (let k = 0; k < n; k++) {
      s = tables.target[s]!
    }

    return s
  }

  const s0 = center * 24
  const ahead = step(s0, 2)
  const towards = Math.floor(ahead / 24) * 24 + OPPOSITE[0]!
  const far = Math.floor(step(center * 24 + 4, 8) / 24) * 24
  const singles: Record<string, Disturbance> = {
    a: [{ slot: s0 }],
    b: [{ slot: center * 24 + OPPOSITE[0]! }],
    c: [{ slot: towards }],
    d: [{ slot: far }],
  }
  const pairs: { name: string; first: Disturbance; second: Disturbance }[] = [
    { name: 'A one slot twice', first: singles.a!, second: singles.a! },
    { name: 'B one dock line', first: singles.a!, second: singles.b! },
    { name: 'C one mesh line, converging', first: singles.a!, second: singles.c! },
    { name: 'D different lines, apart', first: singles.a!, second: singles.d! },
  ]

  // every run in lockstep, beat by beat, so no history is stored
  const read = (make: (start: Configuration) => Runner): {
    readings: PairReading[]
    footprintA: number[]
    reproducible: boolean
  } => {
    const base = make(vacuum)
    const again = make(vacuum)
    const single = new Map<string, Runner>()

    for (const [k, d] of Object.entries(singles)) {
      single.set(k, make(disturbed(vacuum, d)))
    }

    const nameOf = (d: Disturbance): string => Object.entries(singles).find(([, v]) => v === d)![0]
    const both = pairs.map(p => make(disturbed(vacuum, [...p.first, ...p.second])))
    const readings: PairReading[] = pairs.map(p => ({ name: p.name, defect: [], disjointDefect: 0, overlapBeats: 0 }))
    const footprintA: number[] = []

    let reproducible = true

    for (let t = 0; t < BEATS; t++) {
      base.beat()
      again.beat()
      single.forEach(r => r.beat())
      both.forEach(r => r.beat())

      const v = trits(base.state())
      const w = trits(again.state())

      reproducible &&= v.every((x, i) => x === w[i])

      const one = new Map([...single].map(([k, r]) => [k, trits(r.state())]))

      footprintA.push(footprint(one.get('a')!, v, slots).size)

      pairs.forEach((p, j) => {
        const sum = trits(both[j]!.state())
        const x = one.get(nameOf(p.first))!
        const y = one.get(nameOf(p.second))!

        let n = 0

        for (let i = 0; i < v.length; i++) {
          const lhs = mod3(sum[i]! - v[i]!)
          const rhs = mod3(x[i]! - v[i]! + y[i]! - v[i]!)

          n += lhs !== rhs ? 1 : 0
        }

        const r = readings[j]!

        r.defect.push(n)

        const f1 = footprint(x, v, slots)
        const f2 = footprint(y, v, slots)

        if ([...f1].some(d => f2.has(d))) {
          r.overlapBeats++
        } else {
          r.disjointDefect = Math.max(r.disjointDefect, n)
        }
      })
    }

    return { readings, footprintA, reproducible }
  }

  const rule = read(start => ruleRunner(tables, start))

  log('the rule')

  const bare = read(start => streamRunner(tables, start))

  log('the stream')

  // ---------------- the footprint ----------------
  const N = [1, ...rule.footprintA]
  const S = spaceTimeCount(N)
  const beatsFit = Array.from({ length: BEATS - FIT_FROM + 1 }, (_, i) => FIT_FROM + i)
  const D = logSlope(beatsFit, beatsFit.map(t => S[t]!))
  const Nbare = [1, ...bare.footprintA]
  const Sbare = spaceTimeCount(Nbare)
  const Dbare = logSlope(beatsFit, beatsFit.map(t => Sbare[t]!))

  // ---------------- the linear expectation ----------------
  const lin = linearFootprint(DOCK_ROOTS, LINEAR_BEATS)
  const Slin = spaceTimeCount(lin)
  const DlinStep = Math.log(Slin[26]! / Slin[8]!) / Math.log(3)
  const linFit = Array.from({ length: LINEAR_BEATS - FIT_FROM + 1 }, (_, i) => FIT_FROM + i)
  const DlinFit = logSlope(linFit, linFit.map(t => Slin[t]!))

  log('the linear rule')

  // ---------------- instrument ----------------
  const pascal = spaceTimeCount(linearFootprint([[0], [1]], PASCAL_BEATS))
  const I1 =
    [1, 2, 3, 4, 5, 6].every(k => pascal[3 ** k - 1] === 6 ** k) &&
    Math.abs(Math.log(pascal[3 ** 6 - 1]! / pascal[3 ** 5 - 1]!) / Math.log(3) - Math.log(6) / Math.log(3)) <= 1e-12
  const I2 = lin[1] === 24 && lin[3] === 24 && lin[9] === 24
  const I3 = rule.reproducible && bare.reproducible

  // ---------------- gates ----------------
  const meeting = rule.readings.slice(0, 3)
  const H1 = meeting.every(r => r.defect.every(x => x === 0))
  const H2 = Math.abs(D - DlinStep) <= DIMENSION_TOLERANCE
  const C1 = bare.readings.every(r => r.defect.every(x => x === 0)) && Nbare.every(x => x === 1)
  const C2 = rule.readings[3]!.disjointDefect === 0

  const controls = C1 && C2 && I1 && I2 && I3
  const status: Verdict['status'] = !controls ? 'partial' : H1 && H2 ? 'pass' : 'fail'
  const defectLine = (r: PairReading): string =>
    `${r.name}: largest ${Math.max(...r.defect)}, first nonzero at beat ${r.defect.findIndex(x => x > 0) + 1}, beats with a defect ${r.defect.filter(x => x > 0).length} of ${BEATS}, footprints shared on ${r.overlapBeats} beats`

  const metrics: Record<string, number> = {
    H1: flag(H1),
    H2: flag(H2),
    C1: flag(C1),
    C2: flag(C2),
    I1: flag(I1),
    I2: flag(I2),
    I3: flag(I3),
    D,
    Dbare,
    DlinStep,
    DlinFit,
    footprintMax: Math.max(...N),
    footprintLast: N[N.length - 1]!,
    spaceTimeLast: S[S.length - 1]!,
    linearAt26: lin[26]!,
    linearSpaceTime26: Slin[26]!,
    seconds: (Date.now() - started) / 1000,
  }

  rule.readings.forEach((r, i) => {
    metrics[`defectMax_${'ABCD'[i]}`] = Math.max(...r.defect)
    metrics[`defectBeats_${'ABCD'[i]}`] = r.defect.filter(x => x > 0).length
  })

  return verdict({
    status,
    claim: `H1 ${H1} (${meeting.map(defectLine).join('; ')}); H2 ${H2} (the rule's footprint dimension ${D.toFixed(4)} from S(t) over beats ${FIT_FROM} .. ${BEATS}, N(t) at most ${Math.max(...N)} docks; the mesh's linear rule ${DlinStep.toFixed(4)} by one self-similar step, ${DlinFit.toFixed(4)} by the fit over ${FIT_FROM} .. ${LINEAR_BEATS}); controls C1 ${C1} (the bare stream: defects ${bare.readings.map(r => Math.max(...r.defect)).join(', ')}, footprint 1 dock every beat, D ${Dbare.toFixed(4)}) C2 ${C2} (${defectLine(rule.readings[3]!)}, defect on disjoint beats ${rule.readings[3]!.disjointDefect}); instrument I1 ${I1} (Pascal mod 3: S(3^k - 1) = 6^k for k 1 .. 6) I2 ${I2} (N_lin(1, 3, 9) = ${lin[1]}, ${lin[3]}, ${lin[9]}) I3 ${I3}`,
    metrics,
    control: { Dbare, DlinStep, DlinFit, pascal729: pascal[3 ** 6 - 1]! },
    notes: `L2. Side ${SIDE}, ${f.tables.cells} docks, ${BEATS} beats, full key offset 0. Disturbed slots: A/B/C/D first ${s0} (center ${center}, slot 0); B ${singles.b![0]!.slot}; C ${towards} (two docks ahead on slot 0's mesh line, the opposite slot); D ${far}. Footprint N(t), beats 0 .. ${BEATS}: ${N.join(' ')}. Defect per beat: ${rule.readings.map(r => `${r.name}: ${r.defect.join(' ')}`).join(' | ')}. The mesh's linear rule N_lin(t), t 0 .. ${LINEAR_BEATS}: ${lin.join(' ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
