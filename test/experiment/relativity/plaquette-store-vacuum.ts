// PLAQUETTE STORES AS A RULE, AND THEIR VACUUM (E-RLT-0107). The working vacuum (the no-veto two-point store under the
// pass contact with the covariant coin, E-RLT-0105) is a bundle of lines: every mesh line's tone is conserved, every
// knot ring runs along one line, and its entanglement is a volume law (E-GRV-0083). Step-back.md's last proposal: a
// unit of four vibes on roots r, -r, s, -s of one dock has momentum 0, so a dock may also store two lines of one frame
// as one unit ("plaquette stores"), which might join the lines. code/rule/plaquette-store-knit is that rule, with every
// design choice and its why in its header: two lines of one FRAME (covariant, the frame stabilizer acts as S4 on its
// lines); made when exactly two lines of the frame hold a love and a fear with empty line stores; released when its two
// lines are empty and the frame's other lines hold no such pair (so the piece is an involution); stored as the line
// store's own content for each line (pair, orientations, words, open bits); scheduled Q P K on even beats and K P Q on
// odd beats (each beat's collision the previous one's reversed).
//
// THE ARGUMENT THIS TESTS, stated before the run. An involution that stores a released frame must release it onto the
// SAME slots of the SAME dock (it is its own inverse), so no store of this kind can ever take a vibe onto another line.
// A unit is tone 0 on each of its two lines, so every mesh line's tone is kept by Q exactly. If the rule joins lines at
// all, it does so through TIMING: a unit waits until both its lines are empty.
//
// WHAT THE PROBES FOUND, disclosed (tmp/plaq-probe1.log, 2.log, 3.log; no gate was read): every stored vacuum dock holds
// exactly one whole frame of 4 line stores; under the plaquette rule the vacuum makes 2,304 units at beats 2, 8, 14, ...
// and releases them the next beat, exactly when their two line stores would have been released, so read through the
// map "a unit is its two line stores" (code/measure/plaquette-readings unitsAsLineStores) the plaquette vacuum IS the
// line vacuum on 64 of 64 beats on the keep, Born and exchange paths, and so is the vacuum with a lone love; the 6+8
// pair and 8 pairs at Weyl docks make it differ (units made fall from 25,344 to 11,000 to 15,000 with 8 pairs); the
// lone love's wake is the line rule's bit for bit (at most 15 trits); 0 of 6,144 mesh lines change tone.
//
// GATES, fixed before this file's first run. Side 8, 96 beats, the named full-period key (code/measure/full-key-paths
// fullPathKey, offset 0; the registered exchangeAt key repeats every 4 beats on side 8, step-back.md "An instrument
// flaw"), the Born threshold 49,152, the coin on. Starts on the working vacuum: the vacuum, a lone love and a lone fear
// at the center dock's slot 0, the 6+8 pair (a love on slot 6 and a fear on slot 8 of the center dock), 8 such pairs at
// golden Weyl docks.
//  V1 the rule: on every start, 96 beats forward and 96 back return the start bit for bit (points, words, units);
//     charge and count equal beat 0's at every beat; every dock's occupation momentum is the same after the collision
//     as before it at every beat (the coin, which E-SPN-0090 built NOT to keep momentum, acts before the collision and
//     is outside this law), and on the vacuum start the total momentum is constant; C: the run from the conjugate start
//     is the conjugate run at every beat; Q is an involution and the collision reverses on every dock of every beat; and
//     the collision commutes with all 1,152 coin maps and with C on every distinct dock where Q can act (a unit held, or
//     Q changes the dock) on the keep path over 24 beats of every start. 0 failures on each
//  V2 a vacuum exists: from the working vacuum's start, on the keep, Born and exchange paths, the occupation (vibe trits,
//     line store trits, unit codes) returns to beat 0's at beat p for some p <= 96 and repeats at every multiple of p to
//     beat 96; units are made on the cycle (> 0) and made = released over each period. The period is reported
//  V3 a lone vibe stays quiet: the lone love's and the lone fear's wake (slots, line stores and units that differ from
//     the vacuum's run on the same key) is at most 64 trits at every beat of 96 (E-RLT-0105's calibration read at most
//     16 a period on the old key; a scrambled box reads 10^4 and up)
//  V4 lines joined: on some start the tone of some mesh line (6,144 on side 8, code/measure/full-key-paths meshLines)
//     differs from its beat-0 value at some beat. Reported whatever V4 reads: tone and count (vibes, 2 a line store, 2
//     a unit line) broken per start, and the relabeling reading (beats where the plaquette state read through
//     unitsAsLineStores differs from the line rule's on the same start and key, points included)
// Verdict: fail if V1 fails (not a rule) or V4 fails (the change cannot join lines, which is its purpose); pass if V1 to
// V4 hold; partial otherwise. PREDICTED from the argument and the probes: V1, V2, V3 hold, V4 fails: fail.
//
// FIRST RUN (tmp/rlt107-run1.log, 548 s, the record): PASS on the fixed gates, and the prediction was WRONG on V4. No gate
// moved. V1: reversed on 5 of 5 starts over 96 beats, 0 law breaks, 0 dock momentum breaks across the collision, 0 C
// breaks, Q an involution and the collision reversed on every dock, 0 of 28,410 distinct Q docks x 1,152 maps off and 0
// off under C (the total momentum moves on 65 to 96 beats of the seeded starts, the coin's, which is outside the law; 0
// on the vacuum). V2: period 12 on the keep, Born and exchange paths, 4,608 units made and released a period at beats 2,
// 8, 14, 20 mod 24. V3: the lone love's and fear's worst wake 15, the line rule's 15 bit for bit. V4 HOLDS, but read with
// its control it does not show plaquettes joining lines: the mesh-line tone breaks on 40 lines for the 6+8 pair and on
// all 6,144 for 8 pairs, and the LINE rule on the same key breaks it on 12 and 6,144. Two lone vibes in one dock take the
// pass contact's K, which carries vibes across lines (step-back.md, the cluster probes), and 8 pairs scramble side 8 under
// either rule (worst wake 39,621 against 39,600). What the units add is timing: the pair's wake grows to 241 against the
// line rule's 59, and 28 more lines break. Read as its two line stores, the plaquette vacuum IS the line vacuum on 96 of
// 96 beats on every path (0 conflicts), and so are the lone runs; the pair runs differ on 87 and 88 beats. So the gate
// was written too loosely (a line-law break by K counts as "joined"); the answer to the question behind it is no.
//
// DETERMINISM: no random numbers; the key is integer arithmetic; the rule is exact integers. Depth L2: a reversible
// lattice-gas store checked for its laws and symmetries on the rule's own vacuum, with controls that could fail (the
// line rule on the same key, the conjugate and mapped docks). HUSK FIRST is not read here (V4 is the bulk line law).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import {
  THRESHOLD_BORN,
  THRESHOLD_EXCHANGE,
  THRESHOLD_KEEP,
} from '@/code/measure/doublet-locked-readings'
import { centerOf } from '@/code/measure/wall-reading'
import { groupTable } from '@/code/measure/color-isotropy-bound'
import {
  fullPathKey,
  meshLines,
  weylDocks,
} from '@/code/measure/full-key-paths'
import {
  clonePlaquettes,
  collidePlaquetteDock,
  conjugatePlaquettes,
  newPlaquetteTally,
  plaquetteDockKey,
  plaquetteDockOf,
  plaquettePiece,
  sameOccupationPlaquettes,
  samePlaquettes,
  slotMapPlaquetteDock,
  withPlaquettes,
  type PlaquetteConfiguration,
} from '@/code/rule/plaquette-store-knit'
import {
  dockMomentum,
  plaquetteLaws,
  plaquetteLineCharges,
  plaquetteRunner,
  plaquetteTritsApart,
  unitsAsLineStores,
} from '@/code/measure/plaquette-readings'

const SIDE = 8
const BEATS = 96
const COVARIANCE_BEATS = 24
const WAKE_BOUND = 64
const KEY = fullPathKey(0)

type Start = {
  name: string
  place: (s: PlaquetteConfiguration, cells: number) => void
}

const pair = (s: PlaquetteConfiguration, x: number): void => {
  s.vibe[x * 24 + 6] = 1
  s.open[x * 24 + 6] = 1
  s.vibe[x * 24 + 8] = -1
  s.open[x * 24 + 8] = 1
}

const STARTS: readonly Start[] = [
  { name: 'vacuum', place: () => undefined },
  {
    name: 'lone love',
    place: s => (
      (s.vibe[centerOf(SIDE) * 24] = 1),
      (s.open[centerOf(SIDE) * 24] = 1)
    ),
  },
  {
    name: 'lone fear',
    place: s => (
      (s.vibe[centerOf(SIDE) * 24] = -1),
      (s.open[centerOf(SIDE) * 24] = 1)
    ),
  },
  { name: '6+8 pair', place: s => pair(s, centerOf(SIDE)) },
  {
    name: '8 pairs',
    place: (s, cells) => weylDocks(cells, 8).forEach(x => pair(s, x)),
  },
]

type RuleReading = {
  reversed: boolean
  lawBreaks: number
  momentumBreaks: number
  totalMomentumBreaks: number
  cBreaks: number
  involution: number
  dockInverse: number
  unitsMade: number
  unitsReleased: number
}

export default experiment({
  id: 'relativity/plaquette-store-vacuum',
  code: 'E-RLT-0107',
  title:
    "plaquette stores (two lines of one frame stored as one unit) are a reversible, covariant, lawful rule whose vacuum is the working vacuum relabeled, pass on the fixed gates but not the joining the change was for: exact reversal on 5 of 5 starts over 96 beats, charge, count and every dock's momentum kept across the collision, C, and 0 of 28,410 distinct unit docks x 1,152 coin maps off; the vacuum keeps its 12-beat cycle on the keep, Born and exchange paths with 4,608 units made and released a period, and read as their two line stores it is the line vacuum on 96 of 96 beats; a lone love or fear has the line rule's wake bit for bit (15); V4 holds only because two lone vibes in one dock take the pass contact's K across lines, which the line rule does too (tone broken on 40 lines for a 6+8 pair against 12, all 6,144 for 8 pairs under both): an involutive store gives each vibe back to the slot it took it from, so units add timing (the pair's wake 241 against 59), never a new line",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const f = contactFresh(SIDE, 'pass')
    const tables = f.tables
    const cells = tables.cells
    const vacuum = withPlaquettes(wordVacuum(f, f.store))
    const lines = meshLines(tables)
    const perms = groupTable().permutations

    const startOf = (s: Start): PlaquetteConfiguration => {
      const c = withPlaquettes(vacuum)

      s.place(c, cells)

      return c
    }

    // ---- V1 ----
    const rule: Record<string, RuleReading> = {}

    for (const s of STARTS) {
      const start = startOf(s)
      const laws0 = plaquetteLaws(start)
      const out: RuleReading = {
        reversed: false,
        lawBreaks: 0,
        momentumBreaks: 0,
        totalMomentumBreaks: 0,
        cBreaks: 0,
        involution: 0,
        dockInverse: 0,
        unitsMade: 0,
        unitsReleased: 0,
      }
      const before: string[] = new Array<string>(cells)
      const tally = newPlaquetteTally()
      const run = plaquetteRunner(tables, start, {
        key: KEY,
        threshold: THRESHOLD_BORN,
        watch: (c, t, after) => {
          for (let x = 0; x < cells; x++) {
            if (!after) {
              before[x] = dockMomentum(c, x)

              const d = plaquetteDockOf(c, x)
              const twice = clonePlaquettes(d)

              plaquettePiece(twice, 0)
              plaquettePiece(twice, 0)
              out.involution += samePlaquettes(twice, d) ? 0 : 1
              out.dockInverse += samePlaquettes(
                collidePlaquetteDock(
                  tables,
                  collidePlaquetteDock(tables, d, t, false),
                  t,
                  true,
                ),
                d,
              )
                ? 0
                : 1
            } else if (dockMomentum(c, x) !== before[x]) {
              out.momentumBreaks++
            }
          }
        },
      })
      const conj = plaquetteRunner(tables, conjugatePlaquettes(start), {
        key: KEY,
        threshold: THRESHOLD_BORN,
      })

      for (let t = 0; t < BEATS; t++) {
        run.beat(tally)
        conj.beat()

        const laws = plaquetteLaws(run.state())

        out.lawBreaks +=
          laws.charge !== laws0.charge || laws.count !== laws0.count
            ? 1
            : 0

        out.totalMomentumBreaks +=
          laws.momentum !== laws0.momentum ? 1 : 0

        out.cBreaks += samePlaquettes(
          conjugatePlaquettes(run.state()),
          conj.state(),
        )
          ? 0
          : 1
      }

      for (let t = 0; t < BEATS; t++) {
        run.back()
      }

      out.reversed = samePlaquettes(run.state(), start)
      out.unitsMade = tally.plaquettesUnmade
      out.unitsReleased = tally.plaquettesMade
      rule[s.name] = out
      log(`V1 ${s.name}`)
    }

    // covariance on the docks where Q can act, keep path, 24 beats of every start
    const distinct = new Map<
      string,
      { dock: PlaquetteConfiguration; beat: number }
    >()

    for (const s of STARTS) {
      const run = plaquetteRunner(tables, startOf(s), {
        key: KEY,
        threshold: THRESHOLD_KEEP,
        watch: (c, t, after) => {
          if (after) {
            return
          }

          for (let x = 0; x < cells; x++) {
            const d = plaquetteDockOf(c, x)
            const q = clonePlaquettes(d)

            plaquettePiece(q, 0)

            if (d.punit.every(u => u === 0) && samePlaquettes(q, d)) {
              continue
            }

            distinct.set(`${t % 2}|${plaquetteDockKey(d)}`, {
              dock: d,
              beat: t,
            })
          }
        },
      })

      for (let t = 0; t < COVARIANCE_BEATS; t++) {
        run.beat()
      }
    }

    let covariance = 0
    let conjugation = 0

    for (const { dock, beat } of distinct.values()) {
      const r = collidePlaquetteDock(tables, dock, beat, false)

      for (const g of perms) {
        covariance +=
          plaquetteDockKey(
            collidePlaquetteDock(
              tables,
              slotMapPlaquetteDock(dock, g),
              beat,
              false,
            ),
          ) === plaquetteDockKey(slotMapPlaquetteDock(r, g))
            ? 0
            : 1
      }

      conjugation +=
        plaquetteDockKey(
          collidePlaquetteDock(
            tables,
            conjugatePlaquettes(dock),
            beat,
            false,
          ),
        ) === plaquetteDockKey(conjugatePlaquettes(r))
          ? 0
          : 1
    }

    log(`covariance ${distinct.size} docks`)

    const ruleAll = Object.values(rule)
    const v1 =
      ruleAll.every(
        r =>
          r.reversed &&
          r.lawBreaks === 0 &&
          r.momentumBreaks === 0 &&
          r.cBreaks === 0 &&
          r.involution === 0 &&
          r.dockInverse === 0,
      ) &&
      rule.vacuum!.totalMomentumBreaks === 0 &&
      covariance === 0 &&
      conjugation === 0 &&
      distinct.size > 0

    // ---- V2 ----
    const paths: [string, number][] = [
      ['keep', THRESHOLD_KEEP],
      ['born', THRESHOLD_BORN],
      ['exchange', THRESHOLD_EXCHANGE],
    ]
    const vacuumPaths = paths.map(([name, threshold]) => {
      const run = plaquetteRunner(tables, vacuum, {
        key: KEY,
        threshold,
      })
      const line = plaquetteRunner(tables, vacuum, {
        key: KEY,
        threshold,
        plaquettes: false,
      })
      const back: number[] = []
      const made: number[] = []
      const released: number[] = []

      let relabelDiffer = 0
      let conflicts = 0

      for (let t = 0; t < BEATS; t++) {
        const tally = newPlaquetteTally()

        run.beat(tally)
        line.beat()
        made.push(tally.plaquettesUnmade)
        released.push(tally.plaquettesMade)

        if (sameOccupationPlaquettes(run.state(), vacuum)) {
          back.push(t + 1)
        }

        const read = unitsAsLineStores(run.state())

        conflicts += read.conflicts
        relabelDiffer += samePlaquettes(read.out, line.state()) ? 0 : 1
      }

      const period = back[0] ?? -1
      const periodic =
        period > 0 &&
        back.length === Math.floor(BEATS / period) &&
        back.every((b, k) => b === period * (k + 1))
      const perPeriod =
        period > 0
          ? Array.from({ length: Math.floor(BEATS / period) }, (_, k) =>
              made
                .slice(k * period, (k + 1) * period)
                .reduce((a, b) => a + b, 0),
            )
          : []
      const balanced =
        period > 0 &&
        perPeriod.every(
          (m, k) =>
            m ===
            released
              .slice(k * period, (k + 1) * period)
              .reduce((a, b) => a + b, 0),
        )
      const madeBeats = made
        .map((m, t) => (m > 0 ? t : -1))
        .filter(t => t >= 0 && t < 24)

      return {
        name,
        period,
        periodic,
        perPeriod,
        balanced,
        madeBeats,
        relabelDiffer,
        conflicts,
        made: made.reduce((a, b) => a + b, 0),
      }
    })
    const v2 = vacuumPaths.every(
      p => p.periodic && p.balanced && p.made > 0,
    )

    log('V2')

    // ---- V3, V4 ----
    type Wake = {
      name: string
      worst: number
      worstLine: number
      toneBroken: number
      countBroken: number
      toneBrokenLine: number
      countBrokenLine: number
      relabelDiffer: number
      wakeSeries: number[]
    }

    const wakes: Wake[] = STARTS.filter(s => s.name !== 'vacuum').map(
      s => {
        const start = startOf(s)

        const readOne = (
          plaquettes: boolean,
        ): {
          worst: number
          series: number[]
          tone: number
          count: number
          states: PlaquetteConfiguration[]
        } => {
          const run = plaquetteRunner(tables, start, {
            key: KEY,
            threshold: THRESHOLD_BORN,
            plaquettes,
          })
          const vac = plaquetteRunner(tables, vacuum, {
            key: KEY,
            threshold: THRESHOLD_BORN,
            plaquettes,
          })
          const q0 = plaquetteLineCharges(
            lines.lineOf,
            lines.count,
            start,
          )
          const tone = new Uint8Array(lines.count)
          const count = new Uint8Array(lines.count)
          const series: number[] = []
          const states: PlaquetteConfiguration[] = []

          let worst = 0

          for (let t = 0; t < BEATS; t++) {
            run.beat()
            vac.beat()

            const w = plaquetteTritsApart(run.state(), vac.state())

            worst = Math.max(worst, w)
            series.push(w)
            states.push(clonePlaquettes(run.state()))

            const q = plaquetteLineCharges(
              lines.lineOf,
              lines.count,
              run.state(),
            )

            for (let k = 0; k < lines.count; k++) {
              if (q.tone[k] !== q0.tone[k]) {
                tone[k] = 1
              }

              if (q.count[k] !== q0.count[k]) {
                count[k] = 1
              }
            }
          }

          return {
            worst,
            series,
            tone: tone.reduce((a, b) => a + b, 0),
            count: count.reduce((a, b) => a + b, 0),
            states,
          }
        }

        const on = readOne(true)
        const off = readOne(false)
        const relabelDiffer = on.states.reduce(
          (n, c, t) =>
            n +
            (samePlaquettes(unitsAsLineStores(c).out, off.states[t]!)
              ? 0
              : 1),
          0,
        )

        log(`V3/V4 ${s.name}`)

        return {
          name: s.name,
          worst: on.worst,
          worstLine: off.worst,
          toneBroken: on.tone,
          countBroken: on.count,
          toneBrokenLine: off.tone,
          countBrokenLine: off.count,
          relabelDiffer,
          wakeSeries: on.series.filter((_, t) => t % 8 === 7),
        }
      },
    )
    const lone = wakes.filter(w => w.name.startsWith('lone'))
    const v3 = lone.every(w => w.worst <= WAKE_BOUND)
    const v4 = wakes.some(w => w.toneBroken > 0)
    const status = !v1 || !v4 ? 'fail' : v2 && v3 ? 'pass' : 'partial'
    const metrics: Record<string, number> = {
      gate_V1: v1 ? 1 : 0,
      gate_V2: v2 ? 1 : 0,
      gate_V3: v3 ? 1 : 0,
      gate_V4: v4 ? 1 : 0,
      covarianceDocks: distinct.size,
      covarianceOff: covariance,
      conjugationOff: conjugation,
      meshLines: lines.count,
      seconds: (Date.now() - started) / 1000,
    }

    for (const [name, r] of Object.entries(rule)) {
      const k = name.replace(/[^a-z0-9]/g, '')

      metrics[`${k}_reversed`] = r.reversed ? 1 : 0
      metrics[`${k}_lawBreaks`] = r.lawBreaks
      metrics[`${k}_momentumBreaks`] = r.momentumBreaks
      metrics[`${k}_totalMomentumBreaks`] = r.totalMomentumBreaks
      metrics[`${k}_cBreaks`] = r.cBreaks
      metrics[`${k}_involutionOff`] = r.involution
      metrics[`${k}_dockInverseOff`] = r.dockInverse
      metrics[`${k}_unitsMade`] = r.unitsMade
      metrics[`${k}_unitsReleased`] = r.unitsReleased
    }

    for (const p of vacuumPaths) {
      metrics[`vacuum_${p.name}_period`] = p.period
      metrics[`vacuum_${p.name}_unitsMade`] = p.made
      metrics[`vacuum_${p.name}_relabelDiffer`] = p.relabelDiffer
      metrics[`vacuum_${p.name}_conflicts`] = p.conflicts
    }

    for (const w of wakes) {
      const k = w.name.replace(/[^a-z0-9]/g, '')

      metrics[`${k}_worstWake`] = w.worst
      metrics[`${k}_worstWakeLineRule`] = w.worstLine
      metrics[`${k}_toneBroken`] = w.toneBroken
      metrics[`${k}_countBroken`] = w.countBroken
      metrics[`${k}_toneBrokenLineRule`] = w.toneBrokenLine
      metrics[`${k}_countBrokenLineRule`] = w.countBrokenLine
      metrics[`${k}_relabelDiffer`] = w.relabelDiffer
    }

    return verdict({
      status,
      claim: `V1 the rule ${v1} (reversed on ${ruleAll.filter(r => r.reversed).length} of ${ruleAll.length} starts over ${BEATS} beats, law breaks ${ruleAll.reduce((a, r) => a + r.lawBreaks, 0)}, dock momentum breaks across the collision ${ruleAll.reduce((a, r) => a + r.momentumBreaks, 0)}, C breaks ${ruleAll.reduce((a, r) => a + r.cBreaks, 0)}, Q not an involution on ${ruleAll.reduce((a, r) => a + r.involution, 0)} docks, collision not reversed on ${ruleAll.reduce((a, r) => a + r.dockInverse, 0)}, covariance ${covariance} and C ${conjugation} off over ${distinct.size} distinct Q docks x ${perms.length} maps); V2 a vacuum ${v2} (${vacuumPaths.map(p => `${p.name}: period ${p.period}, units made ${p.made} (${p.perPeriod[0] ?? 0} a period, at beats ${p.madeBeats.join(', ')}), balanced ${p.balanced}`).join('; ')}); V3 lone quiet ${v3} (${lone.map(w => `${w.name} worst wake ${w.worst}, line rule ${w.worstLine}`).join('; ')}, bound ${WAKE_BOUND}); V4 lines joined ${v4} (mesh-line tone broken ${wakes.map(w => `${w.name} ${w.toneBroken}`).join(', ')} of ${lines.count}; line count broken ${wakes.map(w => `${w.name} ${w.countBroken}`).join(', ')}, the line rule ${wakes.map(w => `${w.countBrokenLine}`).join(', ')}); read as its two line stores, the plaquette vacuum differs from the line vacuum on ${vacuumPaths.map(p => `${p.relabelDiffer}`).join(', ')} of ${BEATS} beats (keep, Born, exchange), and the seeded runs on ${wakes.map(w => `${w.name} ${w.relabelDiffer}`).join(', ')}`,
      metrics,
      control: {
        lineRuleWakeLove: wakes[0]!.worstLine,
        lineRuleToneBroken: wakes.reduce(
          (a, w) => a + w.toneBrokenLine,
          0,
        ),
      },
      notes: `L2. Gates V1 ${v1}, V2 ${v2}, V3 ${v3}, V4 ${v4}. Rule per start: ${Object.entries(
        rule,
      )
        .map(([n, r]) => `${n}: ${JSON.stringify(r)}`)
        .join(
          '; ',
        )}. Vacuum per path: ${vacuumPaths.map(p => `${p.name}: period ${p.period}, periodic ${p.periodic}, per period ${p.perPeriod.join('/')}, relabel differs ${p.relabelDiffer}, conflicts ${p.conflicts}`).join('; ')}. Wakes every 8 beats: ${wakes.map(w => `${w.name} ${w.wakeSeries.join(' ')}`).join('; ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
