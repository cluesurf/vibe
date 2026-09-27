// Bell on net records (E-QTM-0143): CHSH computed from the NET record counts of the two parties' in-model
// apparatus, the Bell fork's candidate resolution (c) (see E-QTM-0142 for the fork and the measurement).
//
// Under (c) a record reads the net count, loves minus fears, landing on its outcome line. For each pair of
// settings (Alice's line la, Bob's lb, both usable at the beat read, E-QTM-0138) the net counts form a table
// n(alpha, beta) over the 9 outcome pairs. If every such table is a non-negative count and the tables violate
// CHSH, then (c) reproduces the violation with non-negative outcome statistics at every setting pair, and
// Bell's theorem is escaped only because the joint points underneath (the hidden variables: one joint point
// fixes every record of every setting, locally) carry signed weight. That is the negative-probability
// loophole, and it is a known one: a local model with signed weights exists for every non-signaling box
// (Al-Safi and Short 2013), and Fine (1982) showed CHSH <= 2 is exactly the existence of a non-negative joint
// distribution over the four observables.
//
// States, settings and R are E-QTM-0138's (code/measure/net-records). The runs are the fear-off histories.
//
// Predictions, written before the first run:
//   I1 the states are E-QTM-0138's: 1,222.
//   G1 the net tables are counts: every cell of every setting pair's table is a non-negative integer.
//   G2 the net tables violate CHSH: the largest CHSH computed from them alone is 62/27 exactly (E-QTM-0138's
//      value, qtm0100-color), and on every state at a beat where all 4 line classes are usable it equals
//      E-QTM-0111's plain-settings CHSH exactly (numerator and units).
//   G3 no signaling on net records: static, Alice's net marginal for each of her settings is the same for
//      every Bob setting usable at that beat, and Bob's likewise; dynamic, Bob's R at the reading beat (which
//      moves his token by his apparatus's color content, one of 8 nonzero translations) leaves Alice's net
//      records unchanged at every beat before the pair meets again (0 mismatches), while some translation
//      changes them after contact.
//   G4 no setting dependence: an apparatus run in the same lattice as E-QTM-0100's system tokens reaches the
//      same points and validity for all 81 system points (0 differences, 60 beats).
//   G5 the net records are local: Alice's net marginal read from the model's two-party record (both parties'
//      R applied, recordedWhole) equals the one read from her coordinate alone with Bob unmeasured, at every
//      state and setting pair; and every one of the 9 members of each setting line writes the same label
//      (972 cases).
//   G6 the runs cannot: the fear-off net tables are non-negative on every state and their CHSH never passes 2.
//
// Status pass when every gate holds, fail otherwise.
//
// FIRST RUN (2026-09-26, 135 s): fail, on two clauses, both about what the rule now is rather than about net
// records. G2's value clause: the largest CHSH from the net tables is 57872731498738 / 22876792454961 =
// 2.5298 (rlt0055, beat 78), not 62/27. E-QTM-0138's 62/27 was measured before the comoving fear beat was
// adopted; a probe (tmp/qtm143-probe.ts) reads each own start's largest in-model CHSH with the comoving beat
// and without: rlt0055 2.5298 against 2.2942, the other five histories identical (2.1944 and four at 62/27).
// So the adoption RAISED the love-fear pair's in-model violation, and 62/27 still stands on qtm0100-color.
// G2's other clause holds: the net-table CHSH equals E-QTM-0111's plain value on all 1,173 full-class states.
// G3's control clause: Bob's translation changes Alice's net records after contact 0 times (E-QTM-0138 saw
// 6,128 under the fixed-frame beat). Under the comoving beat a translation that moves the coordinate's own
// point is a frame change the next meeting reads through, so it never reaches Alice at all: the sensitivity
// control cannot fire. Its no-signaling clause holds (0 mismatches in 168,912 static and 36,864 dynamic
// checks). A reading was added after this run, disclosed: the same kick with Bob's own point left in place
// (a translation of the weights alone), counted before and after contact, to show the check can see an
// influence. Every other gate held as predicted: 0 negative net cells in 168,912 setting pairs, 972 in-situ
// runs with 0 differences, 0 of 168,912 locality mismatches through both parties' R, fear-off CHSH at most
// exactly 2 and never negative. No gate was moved.
// SECOND RUN (with the added reading): the same numbers, and the weights-only kick changes Alice's net
// records 0 times before contact and in 6,128 cases after it (E-QTM-0138's count), so the no-signaling check
// can see an influence, and the comoving frame change is simply not one. Per history: qtm0100-swap 2.1944,
// qtm0100-color, qtm0109, frc0159-H and frc0159-HF 62/27, rlt0055 2.5298.
//
// Depth L2: the knit's own histories and apparatus, exact integers. The husk is not read.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { addPoints } from '@/code/measure/frame-covariant-meeting'
import { CONJUGATE_POINT, movePhaseCoordinate, wholeLovesAndFears, type Whole } from '@/code/rule/fear-weave'
import { advanceKnot, bellHistories, lineKnot, physicalKnot } from '@/code/measure/knot-histories'
import { enumeratedChsh, gridLines } from '@/code/measure/bell-gates'
import { LINES } from '@/code/measure/in-model-apparatus'
import {
  fearOff,
  inModelSettings,
  netChsh,
  netTable,
  nextMeeting,
  RECORD,
  recordLabel,
  recordedWhole,
  settingsAt,
  situIndependence,
} from '@/code/measure/net-records'

const BEATS = 480
const SITU_BEATS = 60

// Alice's net records: for each of her 12 settings, the net count on each label
function aliceNet(weight: readonly bigint[]): bigint[] {
  const out = new Array<bigint>(36).fill(0n)

  for (let i = 0; i < 81; i++) {
    const w = weight[i] ?? 0n

    if (w !== 0n) {
      for (let l = 0; l < 12; l++) {
        const k = 3 * l + (RECORD[l]![Math.floor(i / 9)] ?? 0)

        out[k] = (out[k] ?? 0n) + w
      }
    }
  }

  return out
}

const greater = (a: { numerator: bigint; units: bigint }, b: { numerator: bigint; units: bigint }): boolean => a.numerator * b.units > b.numerator * a.units

export default experiment({
  id: 'quantum/bell-on-net-records',
  code: 'E-QTM-0143',
  title:
    'Bell on net records: the net record counts of the two parties\' in-model apparatus are non-negative counts at every setting pair, local and non-signaling, with no setting dependence, and they violate CHSH up to 2.5298 on the comoving beat (62/27 on four histories), while the fear-off runs never pass 2: the violation is carried by signed hidden joint points under non-negative outcome statistics, the known negative-probability loophole',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const settings = inModelSettings(BEATS)
    const situ = situIndependence(SITU_BEATS)
    const classesAt = (t: number): number => new Set(settingsAt(settings, t).map(l => LINES[l]!.c)).size
    const { lines } = gridLines()

    // G5, the members
    let memberBad = 0

    LINES.forEach((l, li) => {
      for (const sr of l.points) {
        for (const sf of l.points) {
          for (let x = 0; x < 9; x++) {
            memberBad += recordLabel(li, x, sr, sf) === RECORD[li]![x] ? 0 : 1
          }
        }
      }
    })

    const counts = {
      states: 0,
      settingPairs: 0,
      netNegative: 0,
      statesAllClasses: 0,
      netVsPlainBad: 0,
      statesAbove2: 0,
      staticChecks: 0,
      staticBad: 0,
      dynamicChecks: 0,
      dynamicBad: 0,
      contactChanges: 0,
      kickedBeforeContactBad: 0,
      kickedContactChanges: 0,
      localChecks: 0,
      localBad: 0,
      runsNegative: 0,
      runsAbove2: 0,
    }
    let best = { numerator: 0n, units: 1n, history: '', beat: -1, loves: 0n, fears: 0n }
    let runsBest = { numerator: 0n, units: 1n }
    const perHistoryBest: Record<string, number> = {}

    const examine = (hName: string, t: number, physical: Whole, offPhysical: Whole): void => {
      const weight = physical.weight
      const S = settingsAt(settings, t)
      const chsh = netChsh(weight, S)

      counts.states++

      if (classesAt(t) === 4) {
        const plain = enumeratedChsh(weight)

        counts.statesAllClasses++
        counts.netVsPlainBad += chsh.numerator === plain.numerator && chsh.units === plain.units ? 0 : 1
      }

      counts.statesAbove2 += chsh.numerator > 2n * chsh.units ? 1 : 0
      perHistoryBest[`${hName}_chshNetMax`] = Math.max(perHistoryBest[`${hName}_chshNetMax`] ?? 0, Number(chsh.numerator) / Number(chsh.units))

      if (greater(chsh, best)) {
        const { loves, fears } = wholeLovesAndFears(physical)

        best = { ...chsh, history: hName, beat: t, loves, fears }
      }

      const direct = aliceNet(weight)

      for (const la of S) {
        const bobs = S.map(lb => netTable(weight, la, lb))

        for (const [bi, n] of bobs.entries()) {
          const lb = S[bi]!

          counts.settingPairs++
          counts.netNegative += n.filter(x => x < 0n).length

          // static: Alice's net marginal the same whatever Bob's setting, and Bob's whatever Alice's
          const aliceMarginal = [0, 1, 2].map(alpha => (n[3 * alpha] ?? 0n) + (n[3 * alpha + 1] ?? 0n) + (n[3 * alpha + 2] ?? 0n))
          const first = bobs[0]!
          const firstMarginal = [0, 1, 2].map(alpha => (first[3 * alpha] ?? 0n) + (first[3 * alpha + 1] ?? 0n) + (first[3 * alpha + 2] ?? 0n))
          const bobMarginal = [0, 1, 2].map(beta => (n[beta] ?? 0n) + (n[3 + beta] ?? 0n) + (n[6 + beta] ?? 0n))
          const bobAlone = netTable(weight, lb, lb)
          const bobAloneMarginal = [0, 1, 2].map(beta => (bobAlone[beta] ?? 0n) + (bobAlone[3 + beta] ?? 0n) + (bobAlone[6 + beta] ?? 0n))

          counts.staticChecks++
          counts.staticBad += aliceMarginal.every((x, k) => x === firstMarginal[k]) && bobMarginal.every((x, k) => x === bobAloneMarginal[k]) ? 0 : 1

          // G5: Alice's net marginal through both parties' R, against her coordinate alone
          const la0 = LINES[la]!
          const lb0 = LINES[lb]!
          const rec = recordedWhole(weight, { l: la, sr: la0.points[0] ?? 0, sf: la0.points[1] ?? 0 }, { l: lb, sr: lb0.points[0] ?? 0, sf: lb0.points[1] ?? 0 })
          const viaRecord = [0n, 0n, 0n]

          for (let i = 0; i < 81; i++) {
            const alpha = Math.floor((rec.cells[i] ?? 0) / 3)

            viaRecord[alpha] = (viaRecord[alpha] ?? 0n) + (weight[i] ?? 0n)
          }

          counts.localChecks++
          counts.localBad += viaRecord.every((x, alpha) => x === direct[3 * la + alpha]) ? 0 : 1
        }
      }

      // G6, the runs
      const runs = netChsh(offPhysical.weight, S)

      counts.runsNegative += S.some(la => S.some(lb => netTable(offPhysical.weight, la, lb).some(x => x < 0n))) ? 1 : 0
      counts.runsAbove2 += runs.numerator > 2n * runs.units ? 1 : 0
      runsBest = greater(runs, runsBest) ? runs : runsBest
    }

    for (const h of bellHistories(BEATS)) {
      const off = fearOff(h)
      const reading = nextMeeting(h, 0) + 1
      const after = nextMeeting(h, reading + 1)

      for (const a of lines) {
        for (const b of lines) {
          const own = a.every(p => Math.floor(p / 3) === h.start[0]) && b.every(p => Math.floor(p / 3) === h.start[1])
          let w = lineKnot(h.tokens, a, b)
          let o = lineKnot(h.tokens, a, b)
          let atReading: Whole | undefined

          for (let t = 0; t < (own ? BEATS : reading + 1); t++) {
            w = advanceKnot(h, w, h.records[t]!)
            o = advanceKnot(off, o, h.records[t]!)

            if (t === reading) {
              atReading = w
            }

            if (t === reading || (own && (h.records[t]?.meetings.length ?? 0) > 0)) {
              examine(h.name, t, physicalKnot(h, w), physicalKnot(off, o))
            }
          }

          // dynamic no signaling: Bob's R at the reading beat moves his token by a translation v
          if (!atReading) {
            continue
          }

          const baseline: bigint[][] = []
          const units: bigint[] = []
          let run = atReading

          for (let t = reading + 1; t < Math.min(BEATS, after + 2); t++) {
            run = advanceKnot(h, run, h.records[t]!)
            baseline[t] = aliceNet(physicalKnot(h, run).weight)
            units[t] = run.weight.reduce((s, x) => s + x, 0n)
          }

          for (let v = 1; v < 9; v++) {
            const frame = atReading.frame?.[1] ?? 0
            const stored = frame === -1 || (frame === 0 && h.conjugated) ? (CONJUGATE_POINT[v] ?? 0) : v
            let moved = movePhaseCoordinate(atReading, 1, Array.from({ length: 9 }, (_, s) => addPoints(s, stored)))
            let changed = false

            for (let t = reading + 1; t < Math.min(BEATS, after + 2); t++) {
              moved = advanceKnot(h, moved, h.records[t]!)

              const mine = aliceNet(physicalKnot(h, moved).weight)
              const u = moved.weight.reduce((s, x) => s + x, 0n)
              const same = mine.every((x, k) => x * (units[t] ?? 1n) === (baseline[t]?.[k] ?? 0n) * u)

              if (t < after) {
                counts.dynamicChecks++
                counts.dynamicBad += same ? 0 : 1
              } else if (!same) {
                changed = true
              }
            }

            counts.contactChanges += changed ? 1 : 0

            // reading added after the first run: the same kick with Bob's own point left where it was (a
            // translation of the weights alone, not a frame change), to show the check can see an influence
            let kicked: Whole = { ...movePhaseCoordinate(atReading, 1, Array.from({ length: 9 }, (_, s) => addPoints(s, stored))), own: atReading.own }
            let kickedChanged = false

            for (let t = reading + 1; t < Math.min(BEATS, after + 2); t++) {
              kicked = advanceKnot(h, kicked, h.records[t]!)

              const mine = aliceNet(physicalKnot(h, kicked).weight)
              const u = kicked.weight.reduce((s, x) => s + x, 0n)
              const same = mine.every((x, k) => x * (units[t] ?? 1n) === (baseline[t]?.[k] ?? 0n) * u)

              if (t < after) {
                counts.kickedBeforeContactBad += same ? 0 : 1
              } else if (!same) {
                kickedChanged = true
              }
            }

            counts.kickedContactChanges += kickedChanged ? 1 : 0
          }
        }
      }
    }

    const bestValue = Number(best.numerator) / Number(best.units)
    const gates = {
      I1: counts.states === 1222,
      G1: counts.netNegative === 0 && counts.settingPairs > 0,
      G2: best.numerator * 27n === 62n * best.units && counts.netVsPlainBad === 0 && counts.statesAllClasses > 0,
      G3: counts.staticBad === 0 && counts.dynamicBad === 0 && counts.dynamicChecks > 0 && counts.contactChanges > 0,
      G4: situ.differences === 0 && situ.runs > 0,
      G5: counts.localBad === 0 && memberBad === 0 && counts.localChecks > 0,
      G6: counts.runsNegative === 0 && counts.runsAbove2 === 0,
    }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `${ok ? '' : `fail on ${[gates.G2 ? '' : "G2's 62/27 clause (the comoving beat raises rlt0055)", gates.G3 ? '' : "G3's after-contact control (a comoving translation is a frame change and never reaches Alice)"].filter(Boolean).join(' and ')}${Object.entries(gates).some(([k, v]) => !v && k !== 'G2' && k !== 'G3') ? ' and other gates' : ''}: `}on ${counts.states.toLocaleString()} states and ${counts.settingPairs.toLocaleString()} in-model setting pairs every net record table is a non-negative count (${counts.netNegative} negative cells), and CHSH computed from the tables alone reaches ${best.numerator}/${best.units} = ${bestValue.toFixed(4)} (${best.history}, beat ${best.beat}; above 2 on ${counts.statesAbove2} states), equal to E-QTM-0111's plain value on all ${counts.statesAllClasses.toLocaleString()} full-class states; no signaling (${counts.staticChecks.toLocaleString()} static, ${counts.dynamicChecks.toLocaleString()} dynamic checks, ${counts.staticBad + counts.dynamicBad} mismatches, ${counts.contactChanges} changes after contact), no setting dependence (${situ.runs} in-situ runs, ${situ.differences} differences), and each party's net record is read from its own coordinate (${counts.localBad} of ${counts.localChecks.toLocaleString()} mismatches through both parties' R); the fear-off runs are non-negative and never pass 2 (largest ${(Number(runsBest.numerator) / Number(runsBest.units)).toFixed(4)})`,
      metrics: {
        apparatusStarts: settings.apparatusStarts,
        situRuns: situ.runs,
        situDifferences: situ.differences,
        memberLabelMismatches: memberBad,
        ...counts,
        chshNetMax: bestValue,
        chshNetMaxNumerator: Number(best.numerator),
        chshNetMaxUnits: Number(best.units),
        chshNetMaxBeat: best.beat,
        chshNetMaxLoves: Number(best.loves),
        chshNetMaxFears: Number(best.fears),
        // the signed-model bound CHSH <= 2 (L + F) / (L - F) at the best state
        chshSignedBoundAtBest: (2 * Number(best.loves + best.fears)) / Number(best.loves - best.fears),
        chshRunsMax: Number(runsBest.numerator) / Number(runsBest.units),
        ...perHistoryBest,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes: `L2, exact BigInt wholes, no random numbers: apparatus starts, system starts and translations are enumerated. The best state is ${best.history} at beat ${best.beat}. The joint point is a local deterministic hidden variable (it fixes every record of every setting through each party's own coordinate), so a violation needs signed weight on it; the net tables are the four setting pairs' non-negative marginals of that signed measure, which by Fine's theorem have no non-negative joint distribution once CHSH passes 2.`,
    })
  },
})
