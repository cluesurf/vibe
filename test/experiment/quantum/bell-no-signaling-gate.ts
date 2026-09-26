// No signaling as a gate on every Bell experiment the fear beat has, and what kind of Bell violation the
// model makes: nonlocal, superdeterministic or signaling.
//
// The histories (code/measure/knot-histories) are E-QTM-0100's two readings (the swap phase, sqrt 7, and its
// color section), E-QTM-0109 (2.55), E-FRC-0159's configurations H (2.55) and HF (2.37), and E-RLT-0055
// (2.55), each rebuilt from its experiment's own code over 480 beats, the same record the experiment's
// knot rides. A party is one token of the two-token knot.
//
// THE MODEL'S OWN SETTINGS (code/measure/bell-gates). A party can apply a grid move to its token and then
// read its role. The images of the role lines under the 216 moves are the 12 lines of the grid in 4 parallel
// families: a setting is a family, an outcome a line. Every correlator is then a signed count of the knot,
// E(a, b) = sum W(x, y) a(x) b(y). A party can also first make its token meet an ancilla token of its own
// (started on a line) through one of the history's meeting kernels, and read either token: settings with
// one local meeting.
//
// STARTS. Every product of two lines, 12 x 12 = 144, the role-basis starts (the experiments' own) among
// them. Each start's knot is run through the whole history.
//
// Gates, fixed before the first run of this file (a probe on E-QTM-0100's reading states only had shown
// the plain-settings CHSH value 2 and the one-meeting value 2.014 on the sqrt 7 state; neither is gated):
//   G1 static: at every beat of every history and every start, each party's outcome counts for each of its 4
//      settings, summed over the other party's outcomes, are the same for all 4 of the other's settings:
//      0 mismatches. This is an identity (the other's 3 lines of any family cover its grid), recorded as
//      the count the roadmap asked for, L1.
//   G2 dynamic, grid moves: at the reading beat (one beat after the first meeting) Bob applies each of the
//      216 grid moves to his token; the history then runs on. Alice's 9-point marginal must equal the
//      no-setting run's at every beat before the two tokens next meet: 0 mismatches over 144 starts, 216
//      moves and 6 histories.
//   G3 dynamic, one local meeting: from the experiment's own start, Bob's token meets an ancilla on each of
//      the 12 lines through each of the history's kernels (both orders for a love-fear kernel), as a
//      three-token knot; Alice's marginal equals the no-setting run's at every beat before the next
//      meeting of the pair: 0 mismatches.
//   G4 contact: after the pair's next meeting, some grid-move setting of Bob's changes Alice's marginal in
//      at least one history (the check sees a dependence where the tokens have met).
//   G5 control, a signaling rule: Bob's setting is whether the history's like kernel acts on the two
//      tokens at the reading beat although they have not met. Alice's marginal changes for at least one
//      start in every history.
// Reported, not gated: the largest CHSH value at the plain settings, over every beat after a meeting of
// the experiment's own start and over all 144 starts at the reading beat (exact, in the knot's units);
// the largest at settings with one local meeting on each side at the reading beat (alternating
// maximization, a lower bound); the see-saw value (all two-outcome measurements, E-QTM-0100's instrument).
//
// First run (2026-09-25, 1,435 s): every gate passed. Its title and claim had said no knot passes CHSH 2 at
// the plain settings, from the reading-state probe; the run's own metric read 2.296 over the histories, so
// the title and claim were corrected to what was measured and per-history plain-settings metrics were added
// (no gate changed), and the file was run again.
//
// Depth L2: the knit's own histories with exact integer knots, against a signaling control. Every number is
// on the role grid, which is the same on the bulk and on the husk: nothing here depends on where the
// tokens are, only on the record of meetings and grid moves they carry, so it is substrate-independent.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { advanceWhole, meetWhole, moveCoordinate, wholeLovesAndFears, type BeatRecord, type Whole } from '@/code/rule/fear-weave'
import { advanceKnot, bellHistories, lineKnot, physicalKnot, type KnotHistory } from '@/code/measure/knot-histories'
import { alternatingChsh, enumeratedChsh, gridLines, marginal, marginalCounts, meetingObservables } from '@/code/measure/bell-gates'
import { roleChsh, roleDensity } from '@/code/measure/role-bell'

const BEATS = 480
const ANCILLA = -1

// the kernels a history's knot meets through, as { kernel, divisor } on (first, second), with a love-fear
// kernel in both orders
function kernelsOf(history: KnotHistory): { kernel: number[][]; divisor: number }[] {
  if (history.kernels.mode === 'swap') {
    return [{ kernel: history.kernels.kernel4, divisor: 4 }]
  }

  const { like, likeDivisor, unlike, unlikeDivisor } = history.kernels.color
  const flip = (k: readonly (readonly number[])[]): number[][] =>
    Array.from({ length: 81 }, (_, r) => Array.from({ length: 81 }, (__, c) => k[(r % 9) * 9 + Math.floor(r / 9)]?.[(c % 9) * 9 + Math.floor(c / 9)] ?? 0))

  return [
    { kernel: like.map(r => [...r]), divisor: likeDivisor },
    { kernel: unlike.map(r => [...r]), divisor: unlikeDivisor },
    { kernel: flip(unlike), divisor: unlikeDivisor },
  ]
}

// the first beat at or after `from` where the pair meets
const nextMeeting = (records: readonly BeatRecord[], from: number): number => {
  for (let t = from; t < records.length; t++) {
    if ((records[t]?.meetings.length ?? 0) > 0) {
      return t
    }
  }

  return records.length
}

const same = (a: readonly bigint[], ua: bigint, b: readonly bigint[], ub: bigint): boolean => a.every((x, i) => x * ub === (b[i] ?? 0n) * ua)
const unitsOf = (w: Whole): bigint => w.weight.reduce((s, x) => s + x, 0n)

// Alice's marginal of a knot of 2 or 3 tokens, Alice the first coordinate
function aliceMarginal(w: Whole): bigint[] {
  const out = new Array<bigint>(9).fill(0n)
  const stride = 9 ** (w.tokens.length - 1)

  w.weight.forEach((x, i) => {
    const p = Math.floor(i / stride)

    out[p] = (out[p] ?? 0n) + x
  })

  return out
}

export default experiment({
  id: 'quantum/bell-no-signaling-gate',
  code: 'E-QTM-0111',
  title:
    'no signaling on every Bell experiment of the fear beat: over 144 starts and every beat, no setting of one party, a grid move or a meeting with its own ancilla, moves the other party\'s counts before the two tokens meet again, while a kernel acting across the gap does; at the model\'s own settings (grid move, then read the role) the reading states stay at CHSH 2, and later knots pass it only by their fears, up to 62/27 = 2.296 as a signed count',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const histories = bellHistories(BEATS)
    const { lines } = gridLines()
    const moves = histories[0]!.weave.moves
    let staticChecks = 0
    let staticMismatch = 0
    let gridChecks = 0
    let gridMismatch = 0
    let meetingChecks = 0
    let meetingMismatch = 0
    let contactChanges = 0
    let plainMax = Number.NEGATIVE_INFINITY
    let plainMaxAllStarts = Number.NEGATIVE_INFINITY
    const perHistory: Record<string, number> = {}
    let controlAll = true

    for (const h of histories) {
      const first = nextMeeting(h.records, 0)
      const reading = first + 1
      const after = nextMeeting(h.records, reading + 1)
      const run = (start: Whole, from: number, to: number, visit: (w: Whole, t: number) => void): Whole => {
        let w = start

        for (let t = from; t < to && t < h.records.length; t++) {
          w = advanceKnot(h, w, h.records[t]!)
          visit(w, t)
        }

        return w
      }
      let controlStarts = 0
      let historyGrid = 0
      let historyContact = 0
      let historyPlainMax = Number.NEGATIVE_INFINITY
      let historyPlainAbove = 0
      let historyOwnMeetings = 0
      let historyPlainBest = { value: Number.NEGATIVE_INFINITY, numerator: 0, units: 0, beat: -1, fears: 0 }

      for (const a of lines) {
        for (const b of lines) {
          const start = lineKnot(h.tokens, a, b)
          const own = a.every(p => Math.floor(p / 3) === h.start[0]) && b.every(p => Math.floor(p / 3) === h.start[1])
          const trail: Whole[] = []

          // G1 over the whole history, and the plain CHSH value at every beat after a meeting (own start)
          run(start, 0, BEATS, (w, t) => {
            trail.push(w)

            const p = physicalKnot(h, w)

            for (const side of [0, 1] as const) {
              const counts = marginalCounts(p.weight, side)

              for (const mine of counts) {
                staticChecks++
                staticMismatch += mine.every(o => o.every((c, k) => c === mine[0]?.[k])) ? 0 : 1
              }
            }

            if (own && (h.records[t]?.meetings.length ?? 0) > 0) {
              const e = enumeratedChsh(p.weight)

              plainMax = Math.max(plainMax, e.value)
              historyPlainMax = Math.max(historyPlainMax, e.value)
              historyPlainAbove += e.value > 2 + 1e-12 ? 1 : 0
              historyOwnMeetings++

              if (e.value > historyPlainBest.value) {
                historyPlainBest = { value: e.value, numerator: Number(e.numerator), units: Number(e.units), beat: t, fears: Number(wholeLovesAndFears(p).fears) }
              }
            }
          })

          const atReading = trail[reading] ?? start

          plainMaxAllStarts = Math.max(plainMaxAllStarts, enumeratedChsh(physicalKnot(h, atReading).weight).value)

          // G2 and G4: each of Bob's 216 grid moves at the reading beat
          const baseline = trail.map(w => ({ m: aliceMarginal(physicalKnot(h, w)), u: unitsOf(w) }))

          for (let g = 0; g < moves.act.length; g++) {
            const moved = moveCoordinate(atReading, 1, moves.act[g] ?? [])
            let changedAfterContact = false

            run(moved, reading + 1, Math.min(BEATS, after + 2), (w, t) => {
              const m = aliceMarginal(physicalKnot(h, w))
              const ok = same(m, unitsOf(w), baseline[t]?.m ?? [], baseline[t]?.u ?? 1n)

              if (t < after) {
                gridChecks++
                gridMismatch += ok ? 0 : 1
                historyGrid += ok ? 0 : 1
              } else if (!ok) {
                changedAfterContact = true
              }
            })

            contactChanges += changedAfterContact ? 1 : 0
            historyContact += changedAfterContact ? 1 : 0
          }

          // G5: the like kernel across the gap at the reading beat
          const kernel = kernelsOf(h)[0]!
          const across = meetWhole({ whole: atReading, a: 0, b: 1, kernel4: kernel.kernel, divisor: kernel.divisor, fixed: false })

          if (across && !same(aliceMarginal(physicalKnot(h, across)), unitsOf(across), baseline[reading]?.m ?? [], baseline[reading]?.u ?? 1n)) {
            controlStarts++
          }

          // G3 from the experiment's own start: Bob meets an ancilla on each line through each kernel
          if (own) {
            for (const { kernel: k, divisor } of kernelsOf(h)) {
              for (const line of lines) {
                const three: Whole = {
                  tokens: [...h.tokens, ANCILLA],
                  weight: Array.from({ length: 729 }, (_, i) => (line.includes(i % 9) ? (atReading.weight[Math.floor(i / 9)] ?? 0n) : 0n)),
                }
                const met = meetWhole({ whole: three, a: 1, b: 2, kernel4: k, divisor, fixed: false })

                if (!met) {
                  meetingMismatch++
                  continue
                }

                let w = met

                for (let t = reading + 1; t < after && t < BEATS; t++) {
                  w =
                    h.kernels.mode === 'swap'
                      ? advanceWhole({ weave: h.weave, whole: w, record: h.records[t]!, kernel4: h.kernels.kernel4, fixed: false, forward: true })!
                      : advanceWhole({ weave: h.weave, whole: w, record: h.records[t]!, kernel4: [], color: h.kernels.color, fixed: false, forward: true })!

                  // Alice's marginal in the physical convention: Alice is the first token, never conjugated
                  meetingChecks++
                  meetingMismatch += same(aliceMarginal(w), unitsOf(w), baseline[t]?.m ?? [], baseline[t]?.u ?? 1n) ? 0 : 1
                }
              }
            }
          }
        }
      }

      controlAll = controlAll && controlStarts > 0

      // the reading state of the experiment's own start: fears, see-saw, and one-meeting settings
      let own: Whole = lineKnot(
        h.tokens,
        [0, 1, 2].map(k => 3 * (h.start[0] ?? 0) + k),
        [0, 1, 2].map(k => 3 * (h.start[1] ?? 0) + k),
      )

      for (let t = 0; t <= reading; t++) {
        own = advanceKnot(h, own, h.records[t]!)
      }

      const physical = physicalKnot(h, own)
      const units = Number(unitsOf(physical))
      const observables = meetingObservables(kernelsOf(h))
      const oneMeeting = alternatingChsh({ weight: physical.weight.map(x => Number(x) / units), alice: observables, bob: observables })

      perHistory[`${h.name}_firstMeeting`] = first
      perHistory[`${h.name}_nextMeeting`] = after
      perHistory[`${h.name}_fearsAtReading`] = Number(wholeLovesAndFears(physical).fears)
      perHistory[`${h.name}_chshSeeSaw`] = roleChsh(roleDensity(physical))
      perHistory[`${h.name}_chshPlainSettings`] = enumeratedChsh(physical.weight).value
      perHistory[`${h.name}_chshOneLocalMeeting`] = oneMeeting.value
      perHistory[`${h.name}_chshPlainMaxOverHistory`] = historyPlainMax
      perHistory[`${h.name}_chshPlainMaxNumerator`] = historyPlainBest.numerator
      perHistory[`${h.name}_chshPlainMaxUnits`] = historyPlainBest.units
      perHistory[`${h.name}_chshPlainMaxBeat`] = historyPlainBest.beat
      perHistory[`${h.name}_chshPlainMaxFears`] = historyPlainBest.fears
      perHistory[`${h.name}_meetingsAbove2AtPlainSettings`] = historyPlainAbove
      perHistory[`${h.name}_ownStartMeetings`] = historyOwnMeetings
      perHistory[`${h.name}_gridMismatchBeforeContact`] = historyGrid
      perHistory[`${h.name}_settingsChangingAliceAfterContact`] = historyContact
      perHistory[`${h.name}_signalingControlStarts`] = controlStarts
    }

    const gates = {
      G1: staticChecks > 0 && staticMismatch === 0,
      G2: gridChecks > 0 && gridMismatch === 0,
      G3: meetingChecks > 0 && meetingMismatch === 0,
      G4: contactChanges > 0,
      G5: controlAll,
    }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the six Bell histories (E-QTM-0100 swap and color, E-QTM-0109, E-FRC-0159 H and HF, E-RLT-0055) and all 144 line-product starts, no party\'s setting, a grid move or a meeting with its own ancilla, changes the other party\'s counts at any beat before the two tokens meet again, while a kernel acting across the gap does in every history; at the reading beats the knots read exactly 2 at the model\'s own settings, so the reported violations there need measurements outside them, while after more meetings the knots of E-QTM-0109, E-FRC-0159 and E-RLT-0055 pass 2 at the model\'s own settings, carried by fear (a non-negative knot at these settings is a local hidden-variable model and reads at most 2)',
      metrics: {
        staticChecks,
        staticMismatch,
        gridChecks,
        gridMismatch,
        meetingChecks,
        meetingMismatch,
        contactChanges,
        chshPlainMaxOwnStartEveryMeeting: plainMax,
        chshPlainMaxAllStartsAtReading: plainMaxAllStarts,
        ...perHistory,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      control: {
        signalingControlEveryHistory: controlAll ? 1 : 0,
      },
      notes:
        "RERUN 2026-09-26 under the adopted comoving fear beat: status pass as before; the largest plain CHSH over the own starts 2.2963 -> 2.5298 (rlt0055, beat 57 -> 78), meetings above 2 at the plain settings on rlt0055 43 -> 85, every no-signaling count unchanged. " + ('L2, exact BigInt knots, no random numbers: starts are the 144 products of grid lines, settings the 216 grid moves and the 12 x kernels one-meeting ancillas. Superdeterminism does not arise: the classical layer never reads the knot (fearBeat, combinedBeat and the cold beat take no whole), so every setting is independent of every start by construction, and the settings here are chosen outside the knit. The plain-settings CHSH is exact; the one-meeting value is a lower bound (alternating maximization from the 676 plain pairs).'),
    })
  },
})
