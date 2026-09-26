// The Tsirelson bound as a gate on every Bell experiment of the fear beat, why the model reads sqrt 7 and
// 2.55, and whether 2 sqrt 2 is reachable at all.
//
// Tsirelson (1980): for a positive state, no two-outcome measurements on each side give CHSH above
// 2 sqrt 2. A knot is stored as grid weights, and its own purity count (9 sum W^2 = 1, E-QTM-0099) does not
// imply positivity: Hermitian, trace 1 and purity 1 allow the spectrum (2/3, 2/3, -1/3, 0, ...). So the
// bound is not automatic for a weight array. It holds on the knit because every kernel is the Wigner image of
// a unitary, which keeps the spectrum; this experiment measures the spectrum instead of assuming it.
//
// THE PAIRING FORM (code/measure/bell-gates, pureChshBound). For a pure two-qutrit state with Schmidt weights
// p1, p2, p3, pairing two weights into a qubit block reaches max 2 sqrt((pi + pj)^2 + 4 pi pj) + 2 pk. It was
// registered as the maximum; the first run showed it is only a lower bound (see below). After one meeting:
//   the swap phase from |0>|1>: SWAP U |01> = ((1 - omega) / 2) |01> + ((1 + omega) / 2) |10>, with
//     |1 - omega|^2 / 4 = 3/4 and |1 + omega|^2 / 4 = 1/4, so (3/4, 1/4, 0) and 2 sqrt(1 + 3/4) = sqrt 7;
//   the singlet phase from |0>|0bar>: V |00> = |00> + ((omega - 1) / 3) sum_j |jj>, amplitudes (2 + omega) / 3
//     and (omega - 1) / 3 twice, each of squared size 3/9, so (1/3, 1/3, 1/3) and (2 + 4 sqrt 2) / 3.
// Both are norms in Z[omega] (a^2 - ab + b^2 = 3 and 1 over 4, 3 over 9). 2 sqrt 2 needs exactly (1/2, 1/2, 0).
//
// Gates, fixed before the first run (the E-QTM-0100 reading states had been probed: sqrt 7 and 2.5523 by
// both the see-saw and the closed form, spectra non-negative):
//   G1 positivity: on every Bell history (code/measure/knot-histories) from the experiment's own start at
//      every beat after a meeting, and from all 144 line-product starts at the reading beat, the physical
//      density's smallest eigenvalue is at least -1e-9.
//   G2 Tsirelson: on the same states the see-saw CHSH (E-QTM-0100's instrument) and the closed form are at
//      most 2 sqrt 2 + 1e-9.
//   G3 second method: the closed form equals the see-saw within 1e-6 on every one of those states.
//   G4 the readings: E-QTM-0100's swap reading has Schmidt weights 3/4, 1/4, 0 and CHSH sqrt 7, and the
//      color readings of E-QTM-0100, E-QTM-0109, E-FRC-0159 H and E-RLT-0055 have 1/3, 1/3, 1/3 and
//      (2 + 4 sqrt 2) / 3, each within 1e-9; E-FRC-0159 HF's 2.37 is read off its own weights.
//   G5 control: a weight array with trace 1 and the knot's purity count exact in integers but spectrum
//      (2/3, 2/3, -1/3, 0 x 6), the qubit block's Phi+ and |22> at 2/3 and Psi- at -1/3, reads CHSH above
//      2 sqrt 2 on the same see-saw: the gate can fail.
//   G6 reach: a breadth-first search over meeting words (each step one grid move on the second token, then
//      a meeting kernel), per kernel set (the swap phase alone; the color mode with like tokens exchanged;
//      the color mode with them kept), from |0>|1> and |0>|0>, states merged when their sorted weights
//      agree to 1e-9 (a merge can lose a state, never add one), to depth 5 or a frontier of 4,000: no state
//      above 2 sqrt 2 + 1e-9. Reported: the largest closed form per depth, and whether any state reaches
//      Schmidt (1/2, 1/2, 0) within 1e-9.
//
// FIRST RUN (2026-09-25, 797 s): G1, G2, G4 and G5 passed; G3 and G6 failed.
//   G3 failed as physics, and stands: the pairing form is NOT the maximum for a general pure state. The
//   see-saw beats it by up to 0.090 (2.789 against 2.749 on E-QTM-0109's later knots, 2.369 against 2.361 at
//   E-FRC-0159 HF's reading, Schmidt 0.875, 1/9, 0.014). It is exact at (3/4, 1/4, 0) and (1/3, 1/3, 1/3),
//   the two readings, and a lower bound elsewhere. The header's claim that it is the maximum was wrong.
//   G6 failed from an instrument error: the search mixed the like kernel and the love-fear kernel on one
//   pair and read the fear conjugated after a like meeting, a sequence no pair makes (signs are kept for
//   life), so its states were not positive and read up to 3.73. Fixed before the second run: one kernel set
//   per kind of pair (swap = SWAP U, like kept = U, love-fear = the singlet phase), and the search now
//   reports its smallest eigenvalue. The gate itself is unchanged.
//
// SECOND RUN (2026-09-26, 128 s, the first run's log was lost when its rerun was interrupted; this run is
// the record): G1, G2, G4, G5, G6 pass, G3 fails as it did, status fail on G3 alone. 1,222 history states,
// smallest eigenvalue -4e-16, largest see-saw CHSH 2.789 (E-QTM-0109 and E-FRC-0159 H after later meetings),
// all under 2 sqrt 2 = 2.828. The readings: sqrt 7 from (3/4, 1/4, 0) on the swap history, (2 + 4 sqrt 2)/3
// = 2.5523 from (1/3, 1/3, 1/3) on the four color histories, E-FRC-0159 HF 2.369 from (0.875, 1/9, 0.014).
// The reach search, now positive (smallest eigenvalue -7e-16), reads 184,430 states, 0 above 2 sqrt 2 and 0
// at Schmidt (1/2, 1/2, 0), its best 2.6458, 2.7839, 2.8174, 2.8266 at depths 1 to 4: 2 sqrt 2 is
// approached (0.0018 short at depth 4) and never reached.
// WHY THE READINGS ARE NOT 2 sqrt 2, exactly: at both readings each Schmidt weight is the squared size of
// one amplitude, a single norm (a^2 - ab + b^2) / (4^k 9^m) of an Eisenstein integer, and 1/2 would need a
// norm with an odd power of 2.
// The prime 2 is inert in Z[omega] (2 = 2 mod 3), so every norm carries an even power of 2, and 1/2 is not
// a norm. That is why the model's one-meeting readings are sqrt 7 and 2.55 rather than 2 sqrt 2. After
// several meetings a Schmidt weight is a sum of norms and the argument does not apply, which is where the
// search finds 2.8266.
// NO SIGNALING AND NONLOCALITY, from E-QTM-0111: no setting reachable inside the model (a grid move or a
// meeting with the party's own ancilla) changes the other party's counts before the tokens meet again, and
// the model's own plain settings never exceed CHSH 2. The values above 2 are read with measurements chosen
// outside the knit. The model is neither nonlocal (nothing crosses the gap) nor superdeterministic (the
// classical layer never reads the knot, so settings are independent of starts by construction): its Bell
// violation is a property of the signed weight, reached only by readings the knit does not make itself.
//
// Depth: G1 to G4 are L2 on the knit's own histories; G6 is L1 (a search of the kernel group).
// Substrate-independent: every number is on the role grid.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { conjugateSecond, fearKernels, meetingKernel, singletPhase, swapPhase, wholeKernel, type Whole } from '@/code/rule/fear-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import { advanceKnot, bellHistories, lineKnot, physicalKnot } from '@/code/measure/knot-histories'
import { gridLines, hermitianValues, pureChshBound, reducedFirst } from '@/code/measure/bell-gates'
import { roleChsh, roleDensity } from '@/code/measure/role-bell'
import { twoRolePoints } from '@/code/rule/fear-weave'
import { gridWeights, type Operator } from '@/code/measure/grid-weights'

const BEATS = 480
const OMEGA = (2 * Math.PI) / 3
const TSIRELSON = 2 * Math.SQRT2
const DEPTH = 5
const FRONTIER = 4000

type Reading = { minEig: number; seesaw: number; closed: number; schmidt: number[] }

function readState(p: Whole): Reading {
  const rho = roleDensity(p)
  const values = hermitianValues(rho)
  const schmidt = hermitianValues(reducedFirst(rho)).reverse()

  return { minEig: values[0] ?? 0, seesaw: roleChsh(rho), closed: pureChshBound(schmidt), schmidt }
}

// the density of a float weight array on two roles
function densityOfFloat(weight: readonly number[]): Operator {
  const points = twoRolePoints()
  const rho: Operator = { n: 9, re: new Float64Array(81), im: new Float64Array(81) }

  weight.forEach((w, x) => {
    if (w === 0) {
      return
    }

    const a = points[x]!

    for (let k = 0; k < 81; k++) {
      rho.re[k] = (rho.re[k] ?? 0) + w * (a.re[k] ?? 0)
      rho.im[k] = (rho.im[k] ?? 0) + w * (a.im[k] ?? 0)
    }
  })

  return rho
}

export default experiment({
  id: 'quantum/bell-tsirelson-gate',
  code: 'E-QTM-0112',
  title:
    'the Tsirelson bound as a gate on every Bell experiment of the fear beat: every knot the six histories reach is positive and under 2 sqrt 2, the readings are sqrt 7 from Schmidt weights (3/4, 1/4, 0) and (2 + 4 sqrt 2)/3 from (1/3, 1/3, 1/3), both Z[omega] norms, and a weight array with the knot\'s own purity count but one negative eigenvalue breaks the bound',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const histories = bellHistories(BEATS)
    const { lines } = gridLines()
    let states = 0
    let minEig = Number.POSITIVE_INFINITY
    let maxSeesaw = Number.NEGATIVE_INFINITY
    let maxClosed = Number.NEGATIVE_INFINITY
    let worstAgreement = 0
    const readings: Record<string, number> = {}
    const take = (r: Reading): void => {
      states++
      minEig = Math.min(minEig, r.minEig)
      maxSeesaw = Math.max(maxSeesaw, r.seesaw)
      maxClosed = Math.max(maxClosed, r.closed)
      worstAgreement = Math.max(worstAgreement, Math.abs(r.closed - r.seesaw))
    }
    let readingsOk = true

    for (const h of histories) {
      const first = h.records.findIndex(r => r.meetings.length > 0)
      const reading = first + 1
      const own = lineKnot(
        h.tokens,
        [0, 1, 2].map(k => 3 * (h.start[0] ?? 0) + k),
        [0, 1, 2].map(k => 3 * (h.start[1] ?? 0) + k),
      )
      let w = own
      let historyMax = Number.NEGATIVE_INFINITY

      for (let t = 0; t < BEATS; t++) {
        w = advanceKnot(h, w, h.records[t]!)

        if ((h.records[t]?.meetings.length ?? 0) > 0) {
          const r = readState(physicalKnot(h, w))

          take(r)
          historyMax = Math.max(historyMax, r.seesaw)
        }

        if (t === reading) {
          const r = readState(physicalKnot(h, w))
          const s = r.schmidt

          readings[`${h.name}_readingChsh`] = r.seesaw
          readings[`${h.name}_readingClosedForm`] = r.closed
          readings[`${h.name}_schmidt1`] = s[0] ?? -1
          readings[`${h.name}_schmidt2`] = s[1] ?? -1
          readings[`${h.name}_schmidt3`] = s[2] ?? -1

          if (h.name === 'qtm0100-swap') {
            readingsOk = readingsOk && Math.abs((s[0] ?? 0) - 3 / 4) < 1e-9 && Math.abs((s[1] ?? 0) - 1 / 4) < 1e-9 && Math.abs(r.seesaw - Math.sqrt(7)) < 1e-9
          } else if (h.name !== 'frc0159-HF') {
            readingsOk = readingsOk && s.every(x => Math.abs(x - 1 / 3) < 1e-9) && Math.abs(r.seesaw - (2 + 4 * Math.SQRT2) / 3) < 1e-9
          }
        }
      }

      readings[`${h.name}_chshMaxOverHistory`] = historyMax

      // all 144 line-product starts at the reading beat
      for (const a of lines) {
        for (const b of lines) {
          let x = lineKnot(h.tokens, a, b)

          for (let t = 0; t <= reading; t++) {
            x = advanceKnot(h, x, h.records[t]!)
          }

          take(readState(physicalKnot(h, x)))
        }
      }
    }

    // G5, the control: rho = 2/3 Phi+ + 2/3 |22><22| - 1/3 Psi-, as grid weights in whole units
    const amplitude = (pairs: [number, number, number][]): { re: number[]; im: number[] } => {
      const re = new Array<number>(9).fill(0)

      for (const [i, j, a] of pairs) {
        re[3 * i + j] = a
      }

      return { re, im: new Array<number>(9).fill(0) }
    }
    const s2 = Math.SQRT1_2
    const parts: [number, { re: number[]; im: number[] }][] = [
      [2 / 3, amplitude([[0, 0, s2], [1, 1, s2]])],
      [2 / 3, amplitude([[2, 2, 1]])],
      [-1 / 3, amplitude([[0, 1, s2], [1, 0, -s2]])],
    ]
    const points = twoRolePoints()
    const fake = new Array<number>(81).fill(0)

    for (const [c, v] of parts) {
      gridWeights({ ...v, points }).forEach((x, i) => {
        fake[i] = (fake[i] ?? 0) + c * x
      })
    }

    let fakeUnits = 0

    for (let n = 1; n <= 1000 && fakeUnits === 0; n++) {
      if (fake.every(x => Math.abs(n * x - Math.round(n * x)) < 1e-9)) {
        fakeUnits = n
      }
    }

    const fakeInts = fake.map(x => BigInt(Math.round(fakeUnits * x)))
    const fakeSum = fakeInts.reduce((s, x) => s + x, 0n)
    const fakePurityCount = 9n * fakeInts.reduce((s, x) => s + x * x, 0n) === fakeSum * fakeSum && fakeSum === BigInt(fakeUnits)
    const fakeRho = densityOfFloat(fakeInts.map(x => Number(x) / fakeUnits))
    const fakeValues = hermitianValues(fakeRho)
    const fakeChsh = roleChsh(fakeRho)

    // G6, the reach search
    const moves = gridMoves()
    const kThird = meetingKernel(swapPhase(OMEGA)) ?? []
    const kept = fearKernels({ like: OMEGA, unlike: OMEGA, likeExchanged: false })!
    // A pair's tokens keep their signs for life (E-QTM-0109), so a like pair only ever meets by the like
    // kernel and a love-fear pair only by the love-first singlet phase, with the fear stored conjugated.
    // 'swap' is E-QTM-0100's SWAP U, which is also the color mode's like kernel with the tokens exchanged.
    const sets: { name: string; conjugated: boolean; kernels: { k: number[][]; d: number }[] }[] = [
      { name: 'swap', conjugated: false, kernels: [{ k: kThird, d: 4 }] },
      { name: 'likeKept', conjugated: false, kernels: [{ k: kept.like.map(r => [...r]), d: kept.likeDivisor }] },
      { name: 'loveFear', conjugated: true, kernels: [{ k: kept.unlike.map(r => [...r]), d: kept.unlikeDivisor }] },
    ]
    const conj = (w: readonly number[]): number[] => w.map((_, i) => w[Math.floor(i / 9) * 9 + (3 * Math.floor((i % 9) / 3) + ((3 - (i % 3)) % 3))] ?? 0)
    const reach: Record<string, number> = {}
    let reachAbove = 0
    let reachStates = 0
    let reachedHalfHalf = 0
    let reachBest = 0
    let reachMinEig = Number.POSITIVE_INFINITY

    for (const set of sets) {
      const startOf = (a: number, b: number): number[] => Array.from({ length: 81 }, (_, i) => (Math.floor(Math.floor(i / 9) / 3) === a && Math.floor((i % 9) / 3) === b ? 1 / 9 : 0))
      const keyOf = (w: readonly number[]): string =>
        [...w]
          .map(x => Math.round(x * 1e9))
          .sort((a, b) => a - b)
          .join(',')
      const seen = new Set<string>()
      let frontier: number[][] = [startOf(0, 1), startOf(0, 0)]

      frontier.forEach(w => seen.add(keyOf(w)))

      for (let depth = 1; depth <= DEPTH && frontier.length > 0 && frontier.length <= FRONTIER; depth++) {
        const next: number[][] = []
        let best = 0
        let closest = Number.POSITIVE_INFINITY

        for (const s of frontier) {
          for (let g = 0; g < moves.act.length; g++) {
            const act = moves.act[g]!
            const moved = new Array<number>(81).fill(0)

            for (let i = 0; i < 81; i++) {
              moved[Math.floor(i / 9) * 9 + (act[i % 9] ?? 0)] = s[i] ?? 0
            }

            for (const { k, d } of set.kernels) {
              const child = new Array<number>(81).fill(0)

              for (let r = 0; r < 81; r++) {
                const row = k[r]!
                let sum = 0

                for (let c = 0; c < 81; c++) {
                  const kv = row[c] ?? 0

                  if (kv !== 0) {
                    sum += kv * (moved[c] ?? 0)
                  }
                }

                child[r] = sum / d
              }

              const key = keyOf(child)

              if (seen.has(key)) {
                continue
              }

              seen.add(key)
              next.push(child)

              const rho = densityOfFloat(set.conjugated ? conj(child) : child)
              const schmidt = hermitianValues(reducedFirst(rho)).reverse()
              const closed = pureChshBound(schmidt)

              reachStates++
              reachMinEig = Math.min(reachMinEig, hermitianValues(rho)[0] ?? 0)
              best = Math.max(best, closed)
              reachBest = Math.max(reachBest, closed)
              reachAbove += closed > TSIRELSON + 1e-9 ? 1 : 0

              const distance = Math.abs((schmidt[0] ?? 0) - 0.5) + Math.abs((schmidt[1] ?? 0) - 0.5) + Math.abs(schmidt[2] ?? 0)

              closest = Math.min(closest, distance)
              reachedHalfHalf += distance < 1e-9 ? 1 : 0
            }
          }
        }

        reach[`${set.name}_depth${depth}_newStates`] = next.length
        reach[`${set.name}_depth${depth}_bestChsh`] = best
        reach[`${set.name}_depth${depth}_closestToHalfHalf`] = closest
        frontier = next
      }
    }

    const gates = {
      G1: states > 0 && minEig >= -1e-9,
      G2: maxSeesaw <= TSIRELSON + 1e-9 && maxClosed <= TSIRELSON + 1e-9,
      G3: worstAgreement <= 1e-6,
      G4: readingsOk,
      G5: fakePurityCount && (fakeValues[0] ?? 0) < -0.3 && fakeChsh > TSIRELSON + 1e-6,
      G6: reachStates > 0 && reachAbove === 0,
    }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'every knot the six Bell histories reach, from the experiments\' own starts at every meeting and from all 144 line products at the reading beat, is positive and reads CHSH at most 2 sqrt 2 (the pairing form over Schmidt weights is only a lower bound, beaten by the see-saw by up to 0.09 away from the readings); sqrt 7 and (2 + 4 sqrt 2)/3 are the Schmidt weights (3/4, 1/4, 0) and (1/3, 1/3, 1/3) that one swap phase and one singlet phase make; a weight array that passes the knot\'s own purity count with one negative eigenvalue breaks the bound, so positivity, not the count, is what holds it',
      metrics: {
        states,
        minEigenvalue: minEig,
        maxChshSeeSaw: maxSeesaw,
        maxChshClosedForm: maxClosed,
        worstClosedFormAgreement: worstAgreement,
        tsirelson: TSIRELSON,
        ...readings,
        reachStates,
        reachAboveTsirelson: reachAbove,
        reachBestChsh: reachBest,
        reachMinEigenvalue: reachMinEig,
        reachStatesAtHalfHalf: reachedHalfHalf,
        ...reach,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      control: {
        fakeUnits,
        fakePurityCountExact: fakePurityCount ? 1 : 0,
        fakeMinEigenvalue: fakeValues[0] ?? 0,
        fakeChsh,
      },
      notes:
        'Exact BigInt knots on the histories; the see-saw and eigenvalues in floating point. The reach search merges states by their sorted weights, which a grid move on either token keeps, so it explores local classes of the kernel group; it can merge two classes that share a weight multiset and so under-explore, never over-report.',
    })
  },
})
