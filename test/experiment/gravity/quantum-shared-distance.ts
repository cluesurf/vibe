// Distance as shared information, read on the QUANTUM state of the working vacuum (E-GRV-0068). E-GRV-0064 read the
// classical gas and found a product state on the husk. solutions.md section 10 ("What the four together say", item 1)
// asks the same of the superposed state the coined no-veto store already makes: with the coin, a lone vibe's position is
// in superposition (E-RLT-0105). Nothing in the rule is changed or added: this is a reading.
//
// THE STATES READ, each the rule's own (code/rule/coined-locked-knit coinedVetoBeat, veto 'none', pass contact: the
// working vacuum chosen 2026-09-26 and checked by E-RLT-0104, 0105), held exactly as its sum of terms in Z[w][1/2]:
//  S1 THE WORKING VACUUM AS THE MODEL RUNS IT (E-RLT-0105's vacuum: every stored pair closed), side 8, 48 beats. Its
//     vibes are never alone on a line, so the coin never splits it, and no open vibe meets: predicted ONE term at every
//     beat, a single configuration, whose every region is pure. Then I = 0 exactly at every separation.
//  S2 THE ALL-OPEN VACUUM (every stored pair open, 'the physical rule' of code/measure/doublet-locked-readings), side 4,
//     read at the end of beats 1, 2 and 3. TOO LARGE TO HOLD AS TERMS: the probe counted 480 unequal-point like meetings
//     at beat 1 on side 4 and 7,680 on side 8, each splitting every term, so 2^480 terms after one beat on the smallest
//     box. It is read EXACTLY without being held, through its factorization (code/measure/quantum-shared-distance
//     header): under the no-veto store no piece reads a point, so after one layer of disjoint meetings the state is the
//     product of the met pairs' states (Schmidt 1/4, 3/4) with one definite configuration. The next layer of meetings
//     (beat 4) joins pairs into clusters, and the reading stops before it: beats 1 to 3 are the largest honest window.
//     Side 4, not 8, because the pair registers are located by marking one register per keep-path run (15,360 runs of 3
//     beats on side 8 per start, 960 on side 4); the side is disclosed as a cost choice.
//  S3 A LONE LOVE ON THE WORKING VACUUM, the only superposition S1 carries (E-RLT-0105 Q4b's state, 105 to 124
//     occupations by beat 16 on side 4), side 8, 16 beats, one open love at the center dock on the first slot of line
//     (member index mod 12), so the 17 members cover all 12 lines. Its terms are held and read exactly.
//
// THE READING (code/measure/quantum-shared-distance): regions are husk columns, full depth, slots and stores. The reduced
// state of a region is the partial trace of the pure state; I(A : B) = S(A) + S(B) - S(A u B) in bits, von Neumann. Per
// start, I summed over ordered column pairs by the class of their minimal-image displacement; the class mean divides by
// the number of ordered pairs in that class times the members. Errors: jackknife over the 17 members. Classes: axis
// (k, 0, 0), face (k, k, 0), body (k, k, k), with mesh distances k, k, ceil(3k / 2) (code/measure/shared-distance).
//
// Gates, fixed before the first run of this file:
//  W0 the reader, calibrated on the rule's own knot (integer+0, side 8): the like pair of E-RLT-0103 (likePairStart,
//     both open, vacuum closed) at the end of its first split beat: the two open vibes' columns read
//     I = 2 h(1/4) = 1.62256 bits within 1e-9, and every other active column pair at most 1e-9
//  C0 the states are exact and as stated, on all 17 starts: S1 one term at every one of 48 beats; S3 norm exact at every
//     beat; S2 factorizes: on the all-open keep path the coin splits 0 at beats 0 to 3, like meetings occur at beat 1
//     and at no other of beats 0, 2, 3, and every met pair's two registers are found exactly once at every read beat
//  per state read (S2 at each of its three read beats, side 4; S3 at beat 16, side 8), with "far" the classes of mesh
//  distance at least side / 2 and "the calibration set" the classes of mesh distance at most side / 2 (the three
//  families only):
//  C3 falls with separation: I(axis 1) is above 3 errors and above 1e-12, and exceeds the I of every far class by more
//     than 3 errors of the difference and by more than 1e-12
//  C4 the calibration: every class of the calibration set has I above 3 errors and above 1e-12, and at least one of the
//     two forms of E-GRV-0064 (power d = sqrt(I(axis 1) / I); log d = 1 + ln(I(axis 1) / I) / kappa, kappa the
//     least-squares rate) gives a distance within 25% of the mesh distance on every class of the set
// Verdict: partial if W0 or C0 fails; pass if C3 and C4 hold on S3, or on S2 at some read beat; fail otherwise.
// Reported, never gated: I per class for every state, the active columns, term counts, the S1 zero reading.
//
// PREDICTED, before any run: fail. S1 is one term, so I = 0 everywhere. S2 holds correlation only where a met pair's
// two registers sit, one displacement per pair's line, so most classes read 0 and C4 fails. S3's correlation lies along
// the walk's line (axis and face diagonal projections only), so body classes read near 0 and C4 fails.
//
// PROBES before this file, disclosed: tmp/grv68-probe1 (integer+0, pass): S1 one term over 48 beats on sides 4 and 8;
// the all-open keep path's like meetings (480 at beats 1, 4, 7 on side 4, all unequal at beat 1, none between); the lone
// love's terms (side 8: 130 at beat 15, 3.4 s). No mutual information was read before this file.
//
// FIRST RUN (78 s, tmp/grv68-run1.log): partial, on C0 only, a READER bug: pairColumns marked registers by their point,
// and the stream transforms a point (tables.move), so no mark was found and "pairs found" read 0 of 17. Located by
// tmp/grv68-probe2 (disclosed). The reader was changed to mark one register at a time by its open bit (inert on the keep
// path, as its header says); no gate, threshold or state changed. Every other reading of run 1 is identical in run 2.
//
// SECOND RUN (39 s, tmp/grv68-run2.log): fail, as predicted, no gate moved. W0 holds (the like knot reads 1.622556
// bits, 2 h(1/4), others 0). C0 holds on 17 of 17. S1: the working vacuum is ONE term at every one of 48 beats with 0
// active columns, so every husk region is pure and I = 0 exactly at every separation, as on the classical gas. S2: the
// all-open vacuum is 2^480 terms after beat 1 on side 4 (480 met pairs, 0 coin splits, like meetings only at beat 1 of
// beats 0 to 3), too large to hold, read exactly through its factorization: each pair's two registers sit at mesh
// distance 2 after beats 1 and 2 (axis 2 or face 2, 4.056 bits per class mean, every other class 0) and back in one
// column after beat 3 (the side-4 torus wraps a separation of 4 to 0), so its correlation is a light-cone shell at the
// pair's own separation, not a profile falling from neighbors: I(axis 1) = 0, C3 and C4 fail at every read beat. S3: a
// lone love (16 to 130 terms, 4 to 8 active columns of 512, all on its own line) carries I of order 1e-3 bits on axis
// and face classes that does not fall with separation (axis 1 8.3e-4 +- 5.8e-4, axis 2 1.4e-3, axis 4 1.4e-3, face 4
// 2.4e-3) and exactly 0 on every body diagonal, so C3 and C4 fail. Title written after the run.
//
// DETERMINISM: no random numbers; the start family; the lone vibe's line is fixed by the member index. The rule is exact
// in Z[w]; entropies are floats (measurement). Depth L2: a reading of the rule's own superposed state on the husk,
// calibrated on the rule's own knot. NOTHING MOVES: the stream takes its neighbor's value.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { boxHusk } from '@/code/measure/causal-components'
import { centerOf } from '@/code/measure/wall-reading'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { cloneConfiguration, lockedNorm, lockedState, newTally, type LockedState } from '@/code/rule/doublet-locked-knit'
import { toWords } from '@/code/rule/occupation-veto-knit'
import { coinBranch, coinedVetoBeat, newCoinTally } from '@/code/rule/coined-locked-knit'
import { newPathTally, vacuumConfiguration, THRESHOLD_KEEP } from '@/code/measure/doublet-locked-readings'
import { contactFresh, likePairStart, vetoPathRunner } from '@/code/measure/occupation-veto-readings'
import { jackknife } from '@/code/measure/shared-distance'
import { classLabel, classOf, displacement, huskGeometry, pairColumns, quantumReader, unequalMeetings, PAIR_HALF_ENTROPY, type ClassName, type HuskGeometry } from '@/code/measure/quantum-shared-distance'

const SIDE = 8
const OPEN_SIDE = 4
const VACUUM_BEATS = 48
const LONE_BEATS = 16
const OPEN_READS = 3
const SEARCH = 12

type Classes = { labels: string[]; names: ClassName[]; count: Float64Array; index: (a: number, b: number) => number }

function classesOf(g: HuskGeometry): Classes {
  const labels: string[] = []
  const names: ClassName[] = []
  const at = new Map<string, number>()
  const table = new Int32Array(g.columns * g.columns).fill(-1)
  const counts: number[] = []

  for (let a = 0; a < g.columns; a++) {
    for (let b = 0; b < g.columns; b++) {
      if (a === b) continue

      const c = classOf(displacement(g, a, b))
      const l = classLabel(c)

      if (!at.has(l)) {
        at.set(l, labels.length)
        labels.push(l)
        names.push(c)
        counts.push(0)
      }

      const k = at.get(l) as number

      table[a * g.columns + b] = k
      counts[k]!++
    }
  }

  return { labels, names, count: Float64Array.from(counts), index: (a, b) => table[a * g.columns + b] as number }
}

// per-member sums: one entry per class, then the member count
const newSums = (c: Classes): Float64Array => {
  const s = new Float64Array(c.labels.length + 1)

  s[c.labels.length] = 1

  return s
}

type Gate = { c3: boolean; c4: boolean; kappa: number; table: string; axis1: number }

function gates(c: Classes, sums: readonly Float64Array[], side: number): Gate {
  const m = c.labels.length
  const mean = (total: Float64Array, k: number): number => (total[k] as number) / ((c.count[k] as number) * (total[m] as number))
  const info = (k: number) => jackknife(sums, total => mean(total, k))
  const gap = (i: number, k: number) => jackknife(sums, total => mean(total, i) - mean(total, k))
  const three = (k: number): boolean => c.names[k]!.family !== 'other'
  const axis1 = c.labels.indexOf('axis1')
  const far = c.names.map((n, k) => k).filter(k => three(k) && c.names[k]!.mesh >= side / 2)
  const calibration = c.names.map((n, k) => k).filter(k => three(k) && c.names[k]!.mesh <= side / 2)
  const above = (x: { value: number; error: number }): boolean => x.value > 3 * x.error && x.value > 1e-12
  const i1 = info(axis1)
  const c3 = above(i1) && far.every(k => above(gap(axis1, k)))
  const power = (k: number): number => {
    const v = info(k).value

    return v > 0 && i1.value > 0 ? Math.sqrt(i1.value / v) : Infinity
  }
  const logRatio = (k: number): number => {
    const v = info(k).value

    return v > 0 && i1.value > 0 ? Math.log(i1.value / v) : Infinity
  }
  const fit = calibration.filter(k => c.names[k]!.mesh > 1 && Number.isFinite(logRatio(k)))
  const kappa = fit.length > 0 ? fit.reduce((a, k) => a + logRatio(k) * (c.names[k]!.mesh - 1), 0) / fit.reduce((a, k) => a + (c.names[k]!.mesh - 1) ** 2, 0) : 0
  const logDistance = (k: number): number => (kappa > 0 ? 1 + logRatio(k) / kappa : Infinity)
  const within = (d: number, mesh: number): boolean => Number.isFinite(d) && Math.abs(d / mesh - 1) <= 0.25
  const c4 = calibration.every(k => above(info(k))) && (calibration.every(k => within(power(k), c.names[k]!.mesh)) || calibration.every(k => within(logDistance(k), c.names[k]!.mesh)))
  const e = (v: number): string => (Number.isFinite(v) ? v.toExponential(3) : 'inf')
  const table = c.names
    .map((n, k) => ({ n, k }))
    .filter(x => three(x.k))
    .map(x => `${c.labels[x.k]} (mesh ${x.n.mesh}): I ${e(info(x.k).value)} +- ${e(info(x.k).error)}, d power ${e(power(x.k))}, d log ${e(logDistance(x.k))}`)
    .join('; ')

  return { c3, c4, kappa, table, axis1: i1.value }
}

export default experiment({
  id: 'gravity/quantum-shared-distance',
  code: 'E-GRV-0068',
  title:
    'no distance from shared information on the quantum state of the working vacuum either, fail on C3 and C4: the von Neumann mutual information of husk columns, read on the coined no-veto store\'s own superposed state (reader calibrated on the like knot, 1.622556 bits = 2 h(1/4)), is exactly 0 on the vacuum as run, which is one term at every one of 48 beats (side 8, 17 starts); the all-open vacuum (2^480 terms after one beat on side 4, too large to hold, read exactly through its product of 480 met pairs) correlates each pair only at its own separation, mesh distance 2, with 0 bits at axis 1; a lone love in superposition (16 to 130 terms) correlates only the 4 to 8 columns of its own line, about 1e-3 bits that do not fall from axis 1 to axis 4 and exactly 0 on every body diagonal; so neither form of emergent distance gives back the mesh distance',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const family = startFamily(16)

    // W0, integer+0, side 8
    const w0 = withStart(family[0]!, () => {
      const f = contactFresh(SIDE, 'pass')
      const g = huskGeometry(SIDE, boxHusk(f.weave.mesh, SIDE).column)
      const pick = likePairStart('none', f.tables, toWords(vacuumConfiguration(f, 'none')), SEARCH)

      if (!pick) return { ok: false, reading: -1, others: -1, found: false }

      const tally = newTally()
      let s: LockedState = lockedState(pick.start)

      for (let t = 0; t < 48 && tally.splitMeetings === 0; t++) s = coinedVetoBeat('none', f.tables, s, t, tally, newCoinTally())

      const b0 = s.branches[0]!
      const open: number[] = []

      for (let i = 0; i < b0.vibe.length; i++) if (b0.vibe[i] !== 0 && b0.open[i]) open.push(g.column[(i / 24) | 0] as number)

      const r = quantumReader(s.branches, g)
      const reading = open.length === 2 ? r.information(open[0]!, open[1]!) : -1
      let others = 0

      for (const a of r.active) for (const b of r.active) if (a < b && !(open.includes(a) && open.includes(b))) others = Math.max(others, Math.abs(r.information(a, b)))

      return { ok: Math.abs(reading - 2 * PAIR_HALF_ENTROPY) <= 1e-9 && others <= 1e-9, reading, others, found: true }
    })

    log('W0')

    const g8 = { geometry: undefined as HuskGeometry | undefined }
    const g4 = { geometry: undefined as HuskGeometry | undefined }
    let classes8: Classes | undefined
    let classes4: Classes | undefined

    const perStart = family.map((member, index) =>
      withStart(member, () => {
        const f = contactFresh(SIDE, 'pass')

        g8.geometry = huskGeometry(SIDE, boxHusk(f.weave.mesh, SIDE).column)
        classes8 = classes8 ?? classesOf(g8.geometry)

        // S1
        let s: LockedState = lockedState(toWords(vacuumConfiguration(f, 'none')))
        let vacuumTerms = 1

        for (let t = 0; t < VACUUM_BEATS; t++) {
          s = coinedVetoBeat('none', f.tables, s, t, newTally(), newCoinTally())
          vacuumTerms = Math.max(vacuumTerms, s.branches.length)
        }

        const s1Active = quantumReader(s.branches, g8.geometry).active.length

        // S3
        const center = centerOf(SIDE)
        const start = toWords(vacuumConfiguration(f, 'none'))
        const slot = center * 24 + (LINE_FIRSTS[index % 12] as number)

        start.vibe[slot] = 1
        start.open[slot] = 1

        let lone: LockedState = lockedState(start)
        let normExact = true

        for (let t = 0; t < LONE_BEATS; t++) {
          lone = coinedVetoBeat('none', f.tables, lone, t, newTally(), newCoinTally())

          const n = lockedNorm(lone)

          normExact = normExact && n.total === n.unit
        }

        const reader = quantumReader(lone.branches, g8.geometry)
        const loneSums = newSums(classes8)

        for (const a of reader.active) {
          for (const b of reader.active) {
            if (a >= b) continue

            const i = reader.information(a, b)

            loneSums[classes8.index(a, b)]! += i
            loneSums[classes8.index(b, a)]! += i
          }
        }

        // S2, side 4
        const f4 = contactFresh(OPEN_SIDE, 'pass')

        g4.geometry = huskGeometry(OPEN_SIDE, boxHusk(f4.weave.mesh, OPEN_SIDE).column)
        classes4 = classes4 ?? classesOf(g4.geometry)

        const run = vetoPathRunner('none', f4.tables, toWords(vacuumConfiguration(f4, 'all')), THRESHOLD_KEEP, 0, true)
        const likes: number[] = []
        let coinSplits = 0
        let beatOne: ReturnType<typeof cloneConfiguration> | undefined

        for (let t = 0; t <= OPEN_READS; t++) {
          const c = run.state()
          const coins = newCoinTally()

          coinBranch(f4.cells, { ...cloneConfiguration(c), a: 1n, b: 0n, k: 0 }, false, coins)
          coinSplits += coins.splits
          if (t === 1) beatOne = cloneConfiguration(c)

          const tally = newPathTally()

          run.beat(tally)
          likes.push(tally.likeMeetings)
        }

        const pairs = unequalMeetings(beatOne!, f4.cells)
        const located = pairColumns(f4.tables, beatOne!, 1, pairs, OPEN_READS, g4.geometry.column)
        const allFound = located.every(beat => beat.every(([a, b]) => a >= 0 && b >= 0))
        const openSums = located.map(beat => {
          const sums = newSums(classes4!)

          for (const [a, b] of beat) {
            if (a < 0 || b < 0 || a === b) continue

            sums[classes4!.index(a, b)]! += 2 * PAIR_HALF_ENTROPY
            sums[classes4!.index(b, a)]! += 2 * PAIR_HALF_ENTROPY
          }

          return sums
        })
        const sameColumn = located.map(beat => beat.filter(([a, b]) => a >= 0 && a === b).length)
        const factorizes = coinSplits === 0 && likes[0] === 0 && (likes[1] ?? 0) > 0 && likes[2] === 0 && likes[3] === 0 && allFound

        log(`start ${member.name}: S1 terms ${vacuumTerms}, S3 terms ${lone.branches.length} active ${reader.active.length}, S2 pairs ${pairs.length}`)

        return { name: member.name, vacuumTerms, s1Active, normExact, loneTerms: lone.branches.length, loneActive: reader.active.length, loneSums, pairs: pairs.length, likes, coinSplits, allFound, factorizes, openSums, sameColumn }
      }),
    )

    const c8 = classes8!
    const c4 = classes4!
    const gW0 = w0.ok
    const gC0 = perStart.every(p => p.vacuumTerms === 1 && p.normExact && p.factorizes)
    const lone = gates(c8, perStart.map(p => p.loneSums), SIDE)
    const open = Array.from({ length: OPEN_READS }, (_, s) =>
      gates(
        c4,
        perStart.map(p => p.openSums[s]!),
        OPEN_SIDE,
      ),
    )
    const s3Holds = lone.c3 && lone.c4
    const s2Holds = open.some(x => x.c3 && x.c4)
    const status = !gW0 || !gC0 ? 'partial' : s3Holds || s2Holds ? 'pass' : 'fail'
    const range = (xs: number[]): string => (Math.min(...xs) === Math.max(...xs) ? `${Math.min(...xs)}` : `${Math.min(...xs)} to ${Math.max(...xs)}`)

    return verdict({
      status,
      claim: `reader calibrated ${gW0} (the like knot reads ${w0.reading.toFixed(6)} bits against 2 h(1/4) = ${(2 * PAIR_HALF_ENTROPY).toFixed(6)}); states exact and as stated ${gC0}; S1 the working vacuum as run: ${range(perStart.map(p => p.vacuumTerms))} term(s), so I = 0 at every separation; S2 the all-open vacuum (2^${range(perStart.map(p => p.pairs))} terms after beat 1 on side 4, read through its factorization) C3/C4 at beats 1, 2, 3: ${open.map(x => `${x.c3}/${x.c4}`).join(', ')}; S3 a lone love (side 8, beat 16, ${range(perStart.map(p => p.loneTerms))} terms): C3 ${lone.c3}, C4 ${lone.c4}`,
      metrics: {
        gate_W0: gW0 ? 1 : 0,
        gate_C0: gC0 ? 1 : 0,
        gate_S3_C3: lone.c3 ? 1 : 0,
        gate_S3_C4: lone.c4 ? 1 : 0,
        ...Object.fromEntries(open.flatMap((x, s) => [
          [`gate_S2_beat${s + 1}_C3`, x.c3 ? 1 : 0],
          [`gate_S2_beat${s + 1}_C4`, x.c4 ? 1 : 0],
        ])),
        w0Reading: w0.reading,
        w0Others: w0.others,
        s1TermsMax: Math.max(...perStart.map(p => p.vacuumTerms)),
        s1ActiveMax: Math.max(...perStart.map(p => p.s1Active)),
        s2PairsMin: Math.min(...perStart.map(p => p.pairs)),
        s2PairsMax: Math.max(...perStart.map(p => p.pairs)),
        s2CoinSplitsMax: Math.max(...perStart.map(p => p.coinSplits)),
        s3TermsMin: Math.min(...perStart.map(p => p.loneTerms)),
        s3TermsMax: Math.max(...perStart.map(p => p.loneTerms)),
        s3ActiveMax: Math.max(...perStart.map(p => p.loneActive)),
        s3Axis1: lone.axis1,
        seconds: (Date.now() - started) / 1000,
      },
      control: { s1TermsMax: Math.max(...perStart.map(p => p.vacuumTerms)) },
      notes: `L2. W0 ${JSON.stringify(w0)}. C0: S1 terms ${range(perStart.map(p => p.vacuumTerms))}, S1 active columns ${range(perStart.map(p => p.s1Active))}; S3 norm exact on ${perStart.filter(p => p.normExact).length} of ${perStart.length}; S2 like meetings at beats 0 to 3 ${JSON.stringify(perStart.map(p => p.likes))}, coin splits ${range(perStart.map(p => p.coinSplits))}, pairs found on ${perStart.filter(p => p.allFound).length}, pairs with both registers in one column per read beat ${JSON.stringify(perStart.map(p => p.sameColumn))}. S3 per start (terms, active columns): ${perStart.map(p => `${p.name} ${p.loneTerms}, ${p.loneActive}`).join('; ')}. S3 classes (kappa ${lone.kappa.toFixed(3)}): ${lone.table}. ${open.map((x, s) => `S2 beat ${s + 1} classes (kappa ${x.kappa.toFixed(3)}): ${x.table}`).join('. ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
