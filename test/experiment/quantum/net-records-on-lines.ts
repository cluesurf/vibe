// Net records on lines (E-QTM-0142): the Bell fork's candidate resolution (c), put to the model's own record.
//
// THE FORK (E-QTM-0138). With settings made in the knit, the signed whole violates CHSH (62/27) while every
// deterministic run, the fear-off count, reads at most 2. (a) the signed whole is the physics, with no
// definite single-run outcome; (b) the runs are, which caps CHSH at 2 (the fear-off runs are Gross's
// non-negative discrete Wigner model, a local hidden-variable model). The candidate (c): an outcome is a LINE
// of the grid (E-QTM-0130), fears annihilate loves on each line before a record forms, and a record reads the
// NET count, loves minus fears, landing on its outcome line. Every line sum of the signed weight is a Born
// probability (E-QTM-0130: 0 of 1,105,920 outside [0, 1]), and the model has love-fear annihilation
// (E-SPN-0059). This experiment asks whether the net is formed BY THE MODEL, or only by whoever sums it.
//
// THE MEASUREMENT. Each party measures with the reflection R through the frame direction (E-QTM-0134,
// E-QTM-0135), its apparatus a love-fear pair whose line comes from the apparatus's own history in the knit
// (E-QTM-0138, code/measure/net-records inModelSettings): the record, a love at sr, and the reference, a fear
// stored at sf, meet the system (read as a love) and R moves the three stored points,
// x' = x - r + f, r' = -x + r + f, f' = -x - r. The record's outcome is its label along the setting line's
// direction. The states are E-QTM-0138's: six Bell histories, all 144 line-product starts at the reading beat
// and each history's own start after every meeting, BEATS beats.
//
// A record's NET count on outcome cell (alpha, beta) is the signed weight, in the whole's own units, of the
// joint points whose two records read (alpha, beta). A net count "produced by the model's dynamics" means a
// model step has annihilated the loves and fears of the cell, so that after the record the cell holds no fear.
//
// Predictions, written before the first run:
//   I1 R's table is a permutation of the 729 stored joint points of love, love, fear, and its record point is
//      memberRecord's on every point.
//   I2 every one of the 9 classical members (sr, sf) of each setting line writes the same label for every
//      system point (12 x 9 x 9 = 972 cases, E-QTM-0137), and the points with each label form a line of the
//      setting's class.
//   I3 the states are E-QTM-0138's: 1,222 of them, every one with at least one usable setting.
//   G1 net counts are counts: at every state and every pair of usable settings, every one of the 9 net cells
//      and every party's 3 net marginals is a non-negative integer (in the whole's units).
//   G2 the net count is the Born rule: each net cell over the whole's units equals Tr(rho P_alpha (x) P_beta),
//      P the line's displacement eigenprojector (built without the phase points), within 1e-9.
//   G3 THE (c) CLAIM, the cancellation is dynamical: after the model's record (R with classical members, and
//      with the opened stand-in apparatus on the 6 own reading-beat states), no outcome cell holds a fear, on
//      every state that held one. PREDICTED TO FAIL: R is a permutation of joint points, so the multiset of
//      weights is carried over unchanged and every fear lands, intact, in some outcome cell.
//   G4 the reason, as a count: the record merges no two joint points (0 collisions), and the fears after the
//      record equal the fears before it, exactly, at every state and setting pair (81 times as many with the
//      opened stand-in).
// Readings: the pointwise annihilation the model DOES make, at the fear beat: at each meeting of each own
// start, whether (loves + fears) / units falls (love-fear pairs annihilated at joint points), rises (pairs
// made) or stays; and the whole's units at the states read (the grain, which sets how many records a net
// count names).
//
// Status: pass when every gate holds, partial when I1 to I3, G1, G2 and G4 hold and only G3 fails (the net is
// the Born rule and a count, but it is formed in the reader's sum, not by the model), fail otherwise.
//
// FIRST RUN (2026-09-26, 110 s): fail, on I3's second clause only, a wrong prediction about the apparatus: 49
// of the 1,222 states fall on beats where no apparatus is usable at all (E-QTM-0138 had already found such
// beats; I3 should have allowed them). No gate was moved. Everything else as predicted: R is a permutation
// of the 729 points and matches its formula, all 972 member labels agree; 168,912 setting pairs, 1,520,208
// outcome cells, 0 negative net cells, 0 negative marginals, Born worst 1.7e-15; 0 collisions, fears after =
// fears before on every pair (and 81 times as many with the opened stand-in on 864 checks, 0 collisions); G3
// FAILS as predicted: 958 states keep fears inside outcome cells after the record (973,197 cells, 897,453 of
// them with a positive net), and the opened stand-in leaves fears in 3,078 cells. Readings: at the 358 meeting
// beats of the own starts the fear beat annihilates love-fear pairs pointwise at 126 ((L + F) / N falls),
// makes pairs at 118 and keeps the ratio at 114; the whole's units at the grain run from 9 to 6.6e76, so the
// number of records a net count names is set by the grain, not by the state. A metric was added after this
// run (statesWithFearAndSettings), and the file rerun (SECOND RUN below).
// SECOND RUN (111 s): identical numbers, and 958 of the 958 states with a fear and a usable setting keep a
// fear inside an outcome cell after the record. Status fail on I3's clause only. Read without that clause,
// the result is the one the partial status names: the net is a non-negative count equal to the Born rule,
// and it is formed in the reader's sum over the cell, never by a step of the model.
//
// Depth L2: the knit's own histories, apparatus and R, exact integers; G2 in floating point. The husk is not
// read: every number is a role-grid number, the same on the bulk and the husk.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { wholeLovesAndFears, type Whole } from '@/code/rule/fear-weave'
import { bellHistories, physicalKnot } from '@/code/measure/knot-histories'
import { gridLines } from '@/code/measure/bell-gates'
import { LINES, memberRecord } from '@/code/measure/in-model-apparatus'
import { LINE_CLASSES, lineProjectors, traceProduct } from '@/code/measure/sum-record'
import { operatorFromWigner } from '@/code/measure/qutrit-clifford'
import { phasePointOperators, tensorOperators, type Operator } from '@/code/measure/grid-weights'
import { forEachBellState, inModelSettings, netTable, RECORD, recordLabel, recordedWhole, reflection, settingsAt } from '@/code/measure/net-records'

const BEATS = 480
const TOLERANCE = 1e-9

export default experiment({
  id: 'quantum/net-records-on-lines',
  code: 'E-QTM-0142',
  title:
    'net records on lines: with the model\'s own covariant record and in-model settings, the net count of each outcome line is a non-negative count equal to the Born rule on every state, but the record is a permutation of joint points, so every fear survives it intact in some outcome cell: the cancellation that makes the count non-negative happens in the sum over the cell, not in the dynamics',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // I1: R's table
    const r = reflection()
    const imageSeen = new Uint8Array(729)
    let formulaBad = 0

    for (let j = 0; j < 729; j++) {
      imageSeen[r[j] ?? 0] = 1
      formulaBad += Math.floor((r[j] ?? 0) / 9) % 9 === memberRecord(Math.floor(j / 81), Math.floor(j / 9) % 9, j % 9).record ? 0 : 1
    }

    const permutation = imageSeen.every(v => v === 1)

    // I2: members agree, and each label's points are a line of the setting's class
    let memberBad = 0
    let labelLineBad = 0
    const lineOfLabel = LINES.map((l, li) =>
      [0, 1, 2].map(alpha => {
        const points = Array.from({ length: 9 }, (_, x) => x).filter(x => RECORD[li]![x] === alpha)

        return LINES.findIndex(m => m.c === l.c && m.points.length === points.length && m.points.every((p, i) => p === points[i]))
      }),
    )

    LINES.forEach((l, li) => {
      for (const sr of l.points) {
        for (const sf of l.points) {
          for (let x = 0; x < 9; x++) {
            memberBad += recordLabel(li, x, sr, sf) === RECORD[li]![x] ? 0 : 1
          }
        }
      }

      labelLineBad += lineOfLabel[li]!.filter(k => k < 0).length
    })

    // the Born projectors of the 12 lines, matched by the one-point reading, and their 144 products
    const one = phasePointOperators(1)
    const two = phasePointOperators(2)
    const projector: Operator[] = LINES.map(l => {
      const candidates = lineProjectors(LINE_CLASSES[l.c]!.direction)

      return candidates.find(p => Math.abs(l.points.reduce((s, q) => s + traceProduct(p, one[q]!) / 3, 0) - 1) < TOLERANCE)!
    })
    const product = projector.flatMap(pa => projector.map(pb => tensorOperators(pa, pb)))

    const settings = inModelSettings(BEATS)
    const { lines } = gridLines()
    const counts = {
      states: 0,
      statesWithoutSettings: 0,
      statesWithFear: 0,
      statesWithFearAndSettings: 0,
      settingPairs: 0,
      cellsRead: 0,
      netNegative: 0,
      marginalNegative: 0,
      bornWorst: 0,
      recordCollisions: 0,
      fearsCarriedBad: 0,
      settingPairsWithFearInACell: 0,
      statesWithFearInACell: 0,
      cellsWithFear: 0,
      cellsWithNetPositiveAndFear: 0,
      openedChecks: 0,
      openedCollisions: 0,
      openedFearsBad: 0,
      openedCellsWithFear: 0,
      meetingsRead: 0,
      meetingsAnnihilate: 0,
      meetingsCreate: 0,
      meetingsKeep: 0,
    }
    let unitsMin = -1n
    let unitsMax = 0n

    const fearsOf = (w: readonly bigint[]): bigint => w.reduce((s, x) => (x < 0n ? s - x : s), 0n)

    forEachBellState(bellHistories(BEATS), lines, BEATS, s => {
      const physical = physicalKnot(s.h, s.whole)
      const weight = physical.weight
      const units = weight.reduce((t, x) => t + x, 0n)
      const fears = fearsOf(weight)
      const S = settingsAt(settings, s.t)
      const rho = operatorFromWigner(weight.map(x => Number(x) / Number(units)), two)
      const born = product.map(p => traceProduct(rho, p))
      let stateFearInACell = false

      counts.states++
      counts.statesWithoutSettings += S.length === 0 ? 1 : 0
      counts.statesWithFear += fears > 0n ? 1 : 0
      counts.statesWithFearAndSettings += fears > 0n && S.length > 0 ? 1 : 0
      unitsMin = unitsMin < 0n || units < unitsMin ? units : unitsMin
      unitsMax = units > unitsMax ? units : unitsMax

      for (const la of S) {
        for (const lb of S) {
          const n = netTable(weight, la, lb)

          counts.settingPairs++

          for (let k = 0; k < 9; k++) {
            const cell = n[k] ?? 0n
            const lineA = lineOfLabel[la]![Math.floor(k / 3)] ?? 0
            const lineB = lineOfLabel[lb]![k % 3] ?? 0

            counts.cellsRead++
            counts.netNegative += cell < 0n ? 1 : 0
            counts.bornWorst = Math.max(counts.bornWorst, Math.abs(Number(cell) / Number(units) - (born[12 * lineA + lineB] ?? 0)))
          }

          for (let alpha = 0; alpha < 3; alpha++) {
            const alice = (n[3 * alpha] ?? 0n) + (n[3 * alpha + 1] ?? 0n) + (n[3 * alpha + 2] ?? 0n)
            const bob = (n[alpha] ?? 0n) + (n[3 + alpha] ?? 0n) + (n[6 + alpha] ?? 0n)

            counts.marginalNegative += (alice < 0n ? 1 : 0) + (bob < 0n ? 1 : 0)
          }

          // the model's record: R for each party, member at the line's first two points
          const la0 = LINES[la]!
          const lb0 = LINES[lb]!
          const rec = recordedWhole(weight, { l: la, sr: la0.points[0] ?? 0, sf: la0.points[1] ?? 0 }, { l: lb, sr: lb0.points[0] ?? 0, sf: lb0.points[1] ?? 0 })
          const cellFears = new Array<bigint>(9).fill(0n)
          const cellNet = new Array<bigint>(9).fill(0n)

          counts.recordCollisions += rec.collisions

          for (let i = 0; i < 81; i++) {
            const w = weight[i] ?? 0n
            const c = rec.cells[i] ?? 0

            cellNet[c] = (cellNet[c] ?? 0n) + w
            cellFears[c] = (cellFears[c] ?? 0n) + (w < 0n ? -w : 0n)
          }

          const after = cellFears.reduce((t, x) => t + x, 0n)
          const withFear = cellFears.filter(x => x > 0n).length

          counts.fearsCarriedBad += after === fears && cellNet.every((x, k) => x === n[k]) ? 0 : 1
          counts.cellsWithFear += withFear
          counts.cellsWithNetPositiveAndFear += cellFears.filter((x, k) => x > 0n && (cellNet[k] ?? 0n) > 0n).length
          counts.settingPairsWithFearInACell += withFear > 0 ? 1 : 0
          stateFearInACell = stateFearInACell || withFear > 0

          // the opened stand-in (weight 1 on each of the 9 members of each party's line) on the own reading states
          if (s.own && s.t === s.reading) {
            const images = new Set<number>()
            const openFears = new Array<bigint>(9).fill(0n)
            let collisions = 0

            for (const asr of la0.points) {
              for (const asf of la0.points) {
                for (const bsr of lb0.points) {
                  for (const bsf of lb0.points) {
                    const o = recordedWhole(weight, { l: la, sr: asr, sf: asf }, { l: lb, sr: bsr, sf: bsf })

                    for (let i = 0; i < 81; i++) {
                      const key = o.images[i] ?? 0
                      const w = weight[i] ?? 0n

                      if (images.has(key)) {
                        collisions++
                      }

                      images.add(key)
                      openFears[o.cells[i] ?? 0] = (openFears[o.cells[i] ?? 0] ?? 0n) + (w < 0n ? -w : 0n)
                    }
                  }
                }
              }
            }

            counts.openedChecks++
            counts.openedCollisions += collisions
            counts.openedFearsBad += openFears.reduce((t, x) => t + x, 0n) === 81n * fears ? 0 : 1
            counts.openedCellsWithFear += openFears.filter(x => x > 0n).length
          }
        }
      }

      counts.statesWithFearInACell += stateFearInACell ? 1 : 0

      // the pointwise annihilation of the fear beat, on the own start's meeting beats
      if (s.own && (s.h.records[s.t]?.meetings.length ?? 0) > 0) {
        const lf = (w: Whole): { size: bigint; units: bigint } => {
          const { loves, fears: f } = wholeLovesAndFears(w)

          return { size: loves + f, units: loves - f }
        }
        const b0 = lf(s.before)
        const b1 = lf(s.whole)
        const lhs = b1.size * b0.units
        const rhs = b0.size * b1.units

        counts.meetingsRead++
        counts.meetingsAnnihilate += lhs < rhs ? 1 : 0
        counts.meetingsCreate += lhs > rhs ? 1 : 0
        counts.meetingsKeep += lhs === rhs ? 1 : 0
      }
    })

    const gates = {
      I1: permutation && formulaBad === 0,
      I2: memberBad === 0 && labelLineBad === 0,
      I3: counts.states === 1222 && counts.statesWithoutSettings === 0,
      G1: counts.netNegative === 0 && counts.marginalNegative === 0 && counts.cellsRead > 0,
      G2: counts.bornWorst < TOLERANCE,
      G3: counts.statesWithFearInACell === 0 && counts.openedCellsWithFear === 0,
      G4: counts.recordCollisions === 0 && counts.fearsCarriedBad === 0 && counts.openedCollisions === 0 && counts.openedFearsBad === 0 && counts.openedChecks > 0,
    }
    const base = gates.I1 && gates.I2 && gates.I3 && gates.G1 && gates.G2 && gates.G4
    const status = base && gates.G3 ? 'pass' : base ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `${gates.I3 ? '' : `${status} on I3's second clause only (${counts.statesWithoutSettings} states fall on beats with no usable apparatus, a wrong prediction); `}with R and in-model settings on ${counts.states.toLocaleString()} states (${counts.settingPairs.toLocaleString()} setting pairs, ${counts.cellsRead.toLocaleString()} outcome cells), every net cell is a non-negative count (${counts.netNegative} negative) equal to the Born rule (worst ${counts.bornWorst.toExponential(1)}); but the record merges no joint points (${counts.recordCollisions} collisions) and carries every fear through intact (${counts.fearsCarriedBad} mismatches), so ${counts.statesWithFearInACell.toLocaleString()} of the ${counts.statesWithFearAndSettings.toLocaleString()} states with a fear and a setting keep fears inside outcome cells after the record (${counts.cellsWithFear.toLocaleString()} cells), ${counts.cellsWithNetPositiveAndFear.toLocaleString()} of them cells whose net count is positive: the cancellation is the reader's sum over the cell, not a step of the model`,
      metrics: {
        rTablePermutation: permutation ? 1 : 0,
        rFormulaMismatches: formulaBad,
        memberLabelMismatches: memberBad,
        labelNotALine: labelLineBad,
        apparatusStarts: settings.apparatusStarts,
        ...counts,
        unitsMin: Number(unitsMin),
        unitsMax: Number(unitsMax),
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes:
        'L2, exact BigInt wholes and integer tables, no random numbers: apparatus starts, states and settings are enumerated. G2 in floating point. The one stand-in carried from E-QTM-0138: when the system meets its apparatus is the beat read, not scheduled by the knit. The model does annihilate loves with fears pointwise, inside the fear beat (the whole is stored as one net integer per joint point); a record is a Clifford move, a permutation of joint points, and cannot.',
    })
  },
})
