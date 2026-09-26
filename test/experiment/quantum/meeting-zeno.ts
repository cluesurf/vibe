// Quantum Zeno on the fear weave: does checking a pair's roles often freeze the transfer its meetings make?
//
// E-QTM-0100's vacuum pair on flat links, from |0>|1>, swap phase at every meeting: the chance of reading
// (1, 0) goes 1/4, 3/4, 1 over its first three meetings ((SWAP U)^3 = SWAP), the full transfer. A record is
// coupled every n beats, n = 1 to 24, and never:
//   the ideal record (a STAND-IN, not a rule of the model): the pair's roles read and kept, the knot
//     dephased in the role basis, E-QTM-0100's dephased stand-in;
//   the model's record: token A meets a fresh ancilla token on role line 0 through the same swap-phase
//     kernel, and the ancilla is traced out (the collision step of E-QTM-0114).
// Measured: the chance of (1, 0) right after the third pair meeting, and its mean over 480 beats.
//
// Zeno freezing needs the evolution between checks to start quadratically in time, so that n checks in a
// fixed time leave a total change that falls like 1 / n. A meeting is not a small rotation: it moves a
// finite 1/4 of the chance at once, and between meetings nothing moves. So the prediction, written before
// the first run: records every beat do not freeze the transfer, they turn the coherent 1/4, 3/4, 1 into the
// stochastic 1/4, 3/8, 7/16 (E-QTM-0100's stand-in) and a mean of 1/2, and the transfer at the third
// meeting falls from 1 as records get denser but stays at or above 7/16, never toward 0.
//
// Gates, fixed before the first run:
//   G1 no record: the chances after the first three meetings are 1/4, 3/4, 1 exactly.
//   G2 ideal record every beat: 1/4, 3/8, 7/16 exactly.
//   G3 no freeze: for every n and both records, the chance of (1, 0) after the third meeting is at least
//      7/16 - 1e-12 (the hypothesis of a Zeno freeze is that it falls toward 0 as n falls).
//   G4 the model's record every beat stays a state: weights sum to the units and the purity is at most 1.
// Reported: both curves against n.
//
// FIRST RUN (2026-09-26, 12 s): G1, G2, G4 pass, G3 FAILS, so the prediction was wrong for the model's
// record. The ideal record behaves as predicted (7/16 at every n up to 4, 5/8 at 6 and 12, 1 at 24). The
// model's record takes the transfer at the third meeting to 0.165, 0.061, 0.049 for n = 1, 2, 3, and the
// mean chance of (1, 0) over 480 beats to 0.006 at n = 1 against 0.526 with no record: the transfer is
// suppressed, more the denser the records. Whether that is a Zeno freeze or a reset is not decided by the
// gates: the model's record is a partial swap with a fresh ancilla on role line 0, which could pull token A
// toward role 0 whatever it held. Readings added after the run, gates unchanged: the mean chance of the
// start reading (0, 1), and the model record with its ancilla on role lines 1 and 2. A freeze keeps the
// start whatever the ancilla holds; a reset follows the ancilla.
// SECOND RUN, readings only, same gate values: it is a RESET. With a record every beat the time-mean
// chance of the start (0, 1) is 0.112, 0.006, 0.006 for ancillas on roles 0, 1, 2 (0.474 with no record),
// and the pair sits at (r, r), the ancilla's role on both tokens: 0.882 at (0, 0), 0.986 at (1, 1), 0.874 at
// (2, 2). The model's record is not a measurement. It is the fear beat with a fresh token, a partial swap
// that writes the ancilla's role into token A, and A's meetings with B carry it on. Dense records pump the
// pair to the ancilla's state, which suppresses the transfer for a reason that has nothing to do with
// Zeno. The model has no rule that reads a role without writing one, and the ideal record that does
// (a stand-in) shows no freeze.
//
// Depth L2 (the knit's own meeting record and kernel). Substrate-independent.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { meetWhole, type Whole } from '@/code/rule/fear-weave'
import { advanceKnot, lineKnot, qtm0100Histories } from '@/code/measure/knot-histories'

const BEATS = 480
const INTERVALS = [1, 2, 3, 4, 6, 8, 12, 24, 0]

const readingOf = (i: number): number => Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3)
// the chance of one reading (role of the first token times 3 plus role of the second), exact to 1e-15
const chanceOf = (w: Whole, reading: number): number => {
  const units = w.weight.reduce((s, x) => s + x, 0n)

  return Number((w.weight.reduce((s, x, i) => (readingOf(i) === reading ? s + x : s), 0n) * 10n ** 15n) / units) / 1e15
}
const chance10 = (w: Whole): number => chanceOf(w, 3)

function dephase(w: Whole): Whole {
  const role = new Array<bigint>(9).fill(0n)

  w.weight.forEach((x, i) => {
    role[readingOf(i)] = (role[readingOf(i)] ?? 0n) + x
  })

  return { tokens: w.tokens, weight: w.weight.map((_, i) => role[readingOf(i)] ?? 0n) }
}

export default experiment({
  id: 'quantum/meeting-zeno',
  code: 'E-QTM-0116',
  title:
    'quantum Zeno on the fear weave: an ideal role record never freezes the vacuum pair\'s transfer below the stochastic 7/16, because a meeting moves a finite quarter of the chance at once, while the model\'s own record, a fear-beat meeting with a fresh ancilla, suppresses the transfer by resetting the pair to the ancilla\'s role, not by freezing it',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const [live] = qtm0100Histories(BEATS)
    const h = { ...live!, records: live!.records.map(r => ({ ...r, crossings: r.crossings.map(([tk]) => [tk, live!.weave.moves.identity] as const) })) }
    const kernel = h.kernels.mode === 'swap' ? h.kernels.kernel4 : []
    const start = lineKnot(h.tokens, [0, 1, 2].map(k => 3 * (h.start[0] ?? 0) + k), [0, 1, 2].map(k => 3 * (h.start[1] ?? 0) + k))
    let stateBad = 0

    const runWith = (n: number, record: 'ideal' | 'model', ancillaRole = 0): { third: number; mean: number; firstThree: number[]; startMean: number; readingMeans: number[] } => {
      let startSum = 0
      const readingSums = new Array<number>(9).fill(0)
      let w = start
      const firstThree: number[] = []
      let sum = 0

      for (let t = 0; t < BEATS; t++) {
        const r = h.records[t]!

        w = advanceKnot(h, w, r)

        if (r.meetings.length > 0 && firstThree.length < 3) {
          firstThree.push(chance10(w))
        }

        if (n > 0 && (t + 1) % n === 0) {
          if (record === 'ideal') {
            w = dephase(w)
          } else {
            const opened: Whole = { tokens: [...w.tokens, -1], weight: Array.from({ length: 729 }, (_, i) => (Math.floor((i % 9) / 3) === ancillaRole ? (w.weight[Math.floor(i / 9)] ?? 0n) : 0n)) }
            const met = meetWhole({ whole: opened, a: 0, b: 2, kernel4: kernel, divisor: 4, fixed: false })!
            const traced = new Array<bigint>(81).fill(0n)

            met.weight.forEach((x, i) => {
              traced[Math.floor(i / 9)] = (traced[Math.floor(i / 9)] ?? 0n) + x
            })
            w = { tokens: w.tokens, weight: traced }

            const units = Number(traced.reduce((s, x) => s + x, 0n))
            const purity = 9 * traced.reduce((s, x) => s + (Number(x) / units) ** 2, 0)

            stateBad += units > 0 && purity <= 1 + 1e-12 ? 0 : 1
          }
        }

        sum += chance10(w)
        startSum += chanceOf(w, 3 * (h.start[0] ?? 0) + (h.start[1] ?? 0))

        for (let k = 0; k < 9; k++) {
          readingSums[k] = (readingSums[k] ?? 0) + chanceOf(w, k)
        }
      }

      return { third: firstThree[2] ?? -1, mean: sum / BEATS, firstThree, startMean: startSum / BEATS, readingMeans: readingSums.map(x => x / BEATS) }
    }

    // readings added after the first run (see the header): the mean chance of the start reading, and the
    // model record with its ancilla on role lines 1 and 2, to tell a freeze from a reset toward the ancilla
    const afterFirstRun: Record<string, number> = {}

    for (const role of [0, 1, 2]) {
      for (const n of [1, 3, 24]) {
        const r = runWith(n, 'model', role)

        afterFirstRun[`modelAncillaRole${role}_every${n}_meanChance10`] = r.mean
        afterFirstRun[`modelAncillaRole${role}_every${n}_meanChanceOfStart`] = r.startMean
      }
    }

    // where the weight goes under a record every beat: the time-mean chance of each of the 9 readings
    for (const role of [0, 1, 2]) {
      runWith(1, 'model', role).readingMeans.forEach((x, k) => {
        afterFirstRun[`modelAncillaRole${role}_every1_meanReading${Math.floor(k / 3)}${k % 3}`] = x
      })
    }

    afterFirstRun.ideal_every1_meanChanceOfStart = runWith(1, 'ideal').startMean
    afterFirstRun.none_meanChanceOfStart = runWith(0, 'ideal').startMean

    const none = runWith(0, 'ideal')
    const everyBeat = runWith(1, 'ideal')
    const curves: Record<string, number> = {}
    let lowest = Number.POSITIVE_INFINITY

    for (const n of INTERVALS) {
      for (const kind of ['ideal', 'model'] as const) {
        const r = runWith(n, kind)
        const tag = `${kind}_every${n === 0 ? 'Never' : n}`

        curves[`${tag}_afterThirdMeeting`] = r.third
        curves[`${tag}_meanOver480`] = r.mean
        lowest = Math.min(lowest, r.third)
      }
    }

    const exact = (x: number, y: number): boolean => Math.abs(x - y) < 1e-12
    const gates = {
      G1: exact(none.firstThree[0] ?? 0, 1 / 4) && exact(none.firstThree[1] ?? 0, 3 / 4) && exact(none.firstThree[2] ?? 0, 1),
      G2: exact(everyBeat.firstThree[0] ?? 0, 1 / 4) && exact(everyBeat.firstThree[1] ?? 0, 3 / 8) && exact(everyBeat.firstThree[2] ?? 0, 7 / 16),
      G3: lowest >= 7 / 16 - 1e-12,
      G4: stateBad === 0,
    }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'an ideal role record every n beats (a stand-in) turns the vacuum pair\'s coherent transfer 1/4, 3/4, 1 into the stochastic 1/4, 3/8, 7/16 and never below: no Zeno freeze, since a meeting is a finite step; the model\'s own record, the fear beat with a fresh ancilla, takes the transfer at the third meeting down to 0.049 and its time mean to 0.006, failing the no-freeze gate, but it is a reset and not a freeze: the pair is pumped to the ancilla\'s role on both tokens (0.88, 0.99, 0.87 for roles 0, 1, 2) and leaves its start as fast',
      metrics: {
        lowestAfterThirdMeeting: lowest,
        ...curves,
        ...afterFirstRun,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes:
        'L2, exact BigInt knots, flat links. The ideal record is a stand-in (a dephasing the model has no rule for), labeled as one; the model record is the collision step of E-QTM-0114. A Zeno freeze would need a rule whose step between checks is small; the fear beat\'s step is fixed at the cube-root phase.',
    })
  },
})
