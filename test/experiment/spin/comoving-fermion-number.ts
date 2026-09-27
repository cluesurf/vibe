// A fermion number measured about each token's own role point: does the model's dynamics keep it?
//
// E-SPN-0054 found no conserved fermion number in the link sector: the 2 pi turn of a role is -P, the parity about
// one point, and every link with a translation carries it to the parity about another point. But the links are
// exactly covariant, U A(x) U^dagger = A(g x), and every token already carries a point the links move by that same
// g: its classical role point (code/rule/fear-weave's Lattice.point, which a closed token updates at every
// crossing). This file measures the 2 pi sign about THAT point.
//
// THE NUMBER. About the point x the spinor (the parity-even doublet, R_x = -1) is the range of Q_x = (1 + A(x)) / 2,
// so a token's spinor number is N = <Q_x> = (1 + 3 W(x)) / 2, W its Wigner weight at its own point: a love at its
// own point is a fermion, a fear there a boson (E-SPN-0051's W(x) = -<R_x> / 3).
//
// PREDICTIONS, written before any run.
// P1 Links keep every token's own N exactly, whatever the link: covariance moves the weight and the point together.
// P2 The like-vibe fear beat, the swap phase U = P_sym + omega P_anti (and SWAP U, the kernel on exchanged tokens),
//    is a function of SWAP, so it commutes with every symmetric operator, in particular with Q_x (x) 1 + 1 (x) Q_x:
//    two like tokens meeting at ONE point keep the SUM of their numbers, a U(1) count and not only a parity, and
//    trade it between them (a fermion and a boson can swap). With two different points, Q_x (x) 1 + 1 (x) Q_y is not
//    symmetric and U does not keep it.
// P3 The love-fear fear beat, the singlet phase V = 1 + (omega - 1) |Phi><Phi|, keeps the DIFFERENCE Q_x (x) 1 - 1 (x)
//    Q_(x-bar) (since (Q_x (x) 1) Phi = (1 (x) Q_x^T) Phi and Q_x^T = Q_(x-bar)), not the sum: a love is a fermion and a
//    fear an antifermion, and V annihilates a fermion pair into a boson pair: about the origin Phi = (|00> + |ee> +
//    |oo>) / sqrt 3 (e, o the even and odd states of |1> and |2>), so <oo|V|ee> = (omega - 1) / 3, chance 1/3, and
//    the largest chance over the fermion-pair block is |omega - 1|^2 (1/3)(2/3) = 2/3, from (|00> + |ee>) / sqrt 2.
//    The swap phase never does (it keeps the fermion-pair block).
// P4 So in the model's histories the pair sum is kept at every meeting where the two tokens' own points coincide,
//    and broken at some where they differ. On live links the points of two tokens that meet are those of two
//    different paths, so they coincide only by chance (about 1 in 9 if the points were unrelated).
// P5 On a pure-gauge link field (every loop carrying the identity, code/measure/comoving-parity pureGaugeLinks), two
//    tokens that start at one point carry one point at every dock, so every meeting coincides and the number is kept
//    on every beat. The obstruction on live links is the holonomy of the loop the two paths close: the color field.
//
// Gates, fixed before the first run:
// G1 [U, Q_x (x) 1 + 1 (x) Q_x] and [SWAP U, same] under 1e-12 at all 9 points; [U, Q_x (x) 1 + 1 (x) Q_y] over 0.1
//    for all 72 pairs x != y; U never maps the fermion pair block Q_x (x) Q_x into the boson pair block (norm under
//    1e-12) and does trade fermion and boson (norm of (Q (x) (1 - Q)) U ((1 - Q) (x) Q) over 0.1), at all 9 points
// G2 [V, Q_x (x) 1 - 1 (x) Q_(x-bar)] under 1e-12 and [V, Q_x (x) 1 + 1 (x) Q_(x-bar)] over 0.1 at all 9 points; the
//    largest chance V moves the fermion pair block into the boson pair block is 2/3 to 1e-12 at all 9 points, and
//    <oo|V|ee> about the origin has chance 1/3 to 1e-12
// G3 histories (the committed turning weave, pair table, side 3, live links, the vacuum and the golden fill of
//    E-QTM-0119, 480 beats, every pair of dock-0 tokens that meets, four starts displaced to the tokens' own points:
//    |0>|0>, Strange |0>, Strange Strange and |1>|1>, the swap-phase law): on every meeting-free beat each token's own
//    N is unchanged, exactly (0 changes), over more than 0 beats with a non-identity link crossing; the control, N
//    about each token's START point, changes on more than 0 of them. Every final whole's numbers read from rho =
//    sum W A (x) A agree with the marginal formula to 1e-9
// G4 at meetings in those histories: 0 changes of the pair sum and 0 of the joint sign where the points coincide,
//    more than 0 changes of the pair sum where they differ
// G5 on pure-gauge links (vacuum): every meeting coincides and the pair sum changes on 0 beats, while the fear share
//    changes at more than 0 meetings (the fear beat is live)
//
// Depth L2: exact algebra on the model's own fear beat, then the constructed fear weave's histories in exact
// integers. It finds the conserved number the role can carry and the one thing that breaks it.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { type ComplexMatrix, complexIdentity, complexMultiply } from '@/code/algebra/linear/complex-matrix'
import { daggerMatrix, kronecker, matrixDistance, phasePointMatrix, scaleMatrix } from '@/code/algebra/weil-representation'
import { makeColorWeave } from '@/code/rule/color-weave'
import {
  CONJUGATE_POINT,
  exchangeOperator,
  meetingKernel,
  singletPhase,
  swapPhase,
  wholeLovesAndFears,
  wholeUnits,
  type Whole,
} from '@/code/rule/fear-weave'
import { classicalRecords, meetingPairs, pairRecords, runWhole, vacuumBackground, weylBackground, type Background, type RoleState } from '@/code/measure/knit-magic'
import { phaseOfGrid, productWholeAt, pureGaugeLinks, readComoving, sameRatio, trackPoints } from '@/code/measure/comoving-parity'
import { phasePointOperators } from '@/code/measure/grid-weights'
import { hermitianSpectrum, operatorFromWigner } from '@/code/measure/qutrit-clifford'

const OMEGA_ANGLE = (2 * Math.PI) / 3
const SIDE = 3
const BEATS = 480
const MATTER_SCALE = 2.11
const EXACT = 1e-12
const APART = 0.1
const STARTS: readonly (readonly [RoleState, RoleState])[] = [
  ['basis0', 'basis0'],
  ['strange', 'basis0'],
  ['strange', 'strange'],
  ['basis1', 'basis1'],
]

const combine = (a: ComplexMatrix, s: number, b: ComplexMatrix, t: number): ComplexMatrix => ({
  re: a.re.map((x, i) => s * x + t * (b.re[i] ?? 0)),
  im: a.im.map((x, i) => s * x + t * (b.im[i] ?? 0)),
  n: a.n,
})
const commutatorGap = (a: ComplexMatrix, b: ComplexMatrix): number => matrixDistance(complexMultiply(a, b), complexMultiply(b, a))
// the largest squared singular value of a 9 x 9 matrix
const largestChance = (m: ComplexMatrix): number => {
  const gram = complexMultiply(daggerMatrix(m), m)

  return Math.max(...hermitianSpectrum({ n: gram.n, re: Float64Array.from(gram.re), im: Float64Array.from(gram.im) }))
}
const shareOf = (w: Whole): number => {
  const { loves, fears } = wholeLovesAndFears(w)

  return Number(fears) / Number(loves + fears)
}

export default experiment({
  id: 'spin/comoving-fermion-number',
  code: 'E-SPN-0059',
  title:
    'a fermion number about each token\'s own role point: every link keeps it exactly, the like-vibe fear beat keeps the sum of two tokens\' numbers and the love-fear beat keeps their difference (a love a fermion, a fear an antifermion, pair annihilation at chance up to 2/3), but only where the two tokens\' points coincide; on live links that is a minority of meetings and the number breaks at the rest, on pure-gauge links it is every meeting and the number is exact, so the color field\'s holonomy is what breaks it',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const identity3 = complexIdentity(3)
    const q = Array.from({ length: 9 }, (_, p) => scaleMatrix(combine(identity3, 1, phasePointMatrix(3, Math.floor(p / 3), p % 3), 1), [0.5, 0]))
    const notQ = q.map(m => combine(identity3, 1, m, -1))
    const u = swapPhase(OMEGA_ANGLE) as ComplexMatrix
    const uToken = complexMultiply(exchangeOperator() as ComplexMatrix, u)
    const v = singletPhase(OMEGA_ANGLE) as ComplexMatrix
    const sumAt = (x: number, y: number): ComplexMatrix => combine(kronecker(q[x] as ComplexMatrix, identity3), 1, kronecker(identity3, q[y] as ComplexMatrix), 1)
    const differenceAt = (x: number, y: number): ComplexMatrix => combine(kronecker(q[x] as ComplexMatrix, identity3), 1, kronecker(identity3, q[y] as ComplexMatrix), -1)

    // G1: the like-vibe beat
    let likeSameGap = 0
    let likeApartLeast = Infinity
    let likeAnnihilation = 0
    let likeTradeLeast = Infinity

    for (let x = 0; x < 9; x++) {
      likeSameGap = Math.max(likeSameGap, commutatorGap(u, sumAt(x, x)), commutatorGap(uToken, sumAt(x, x)))

      for (let y = 0; y < 9; y++) {
        if (y !== x) {
          likeApartLeast = Math.min(likeApartLeast, commutatorGap(u, sumAt(x, y)))
        }
      }

      const fermions = kronecker(q[x] as ComplexMatrix, q[x] as ComplexMatrix)
      const bosons = kronecker(notQ[x] as ComplexMatrix, notQ[x] as ComplexMatrix)

      likeAnnihilation = Math.max(likeAnnihilation, Math.sqrt(largestChance(complexMultiply(complexMultiply(bosons, u), fermions))))
      likeTradeLeast = Math.min(
        likeTradeLeast,
        Math.sqrt(largestChance(complexMultiply(complexMultiply(kronecker(q[x] as ComplexMatrix, notQ[x] as ComplexMatrix), u), kronecker(notQ[x] as ComplexMatrix, q[x] as ComplexMatrix)))),
      )
    }

    const g1 = likeSameGap < EXACT && likeApartLeast > APART && likeAnnihilation < EXACT && likeTradeLeast > APART

    // G2: the love-fear beat
    let unlikeDifferenceGap = 0
    let unlikeSumLeast = Infinity
    let annihilationLow = Infinity
    let annihilationHigh = 0

    for (let x = 0; x < 9; x++) {
      const bar = CONJUGATE_POINT[x] ?? 0

      unlikeDifferenceGap = Math.max(unlikeDifferenceGap, commutatorGap(v, differenceAt(x, bar)))
      unlikeSumLeast = Math.min(unlikeSumLeast, commutatorGap(v, sumAt(x, bar)))

      const chance = largestChance(complexMultiply(complexMultiply(kronecker(notQ[x] as ComplexMatrix, notQ[bar] as ComplexMatrix), v), kronecker(q[x] as ComplexMatrix, q[bar] as ComplexMatrix)))

      annihilationLow = Math.min(annihilationLow, chance)
      annihilationHigh = Math.max(annihilationHigh, chance)
    }

    // <oo|V|ee> about the origin, e = (|1> + |2>) / sqrt 2, o = (|1> - |2>) / sqrt 2
    const r = Math.SQRT1_2
    const e = [0, r, r]
    const o = [0, r, -r]
    let amplitudeRe = 0
    let amplitudeIm = 0

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const bra = (o[Math.floor(i / 3)] ?? 0) * (o[i % 3] ?? 0)
        const ket = (e[Math.floor(j / 3)] ?? 0) * (e[j % 3] ?? 0)

        amplitudeRe += bra * (v.re[i * 9 + j] ?? 0) * ket
        amplitudeIm += bra * (v.im[i * 9 + j] ?? 0) * ket
      }
    }

    const eeToOo = amplitudeRe * amplitudeRe + amplitudeIm * amplitudeIm
    const g2 =
      unlikeDifferenceGap < EXACT &&
      unlikeSumLeast > APART &&
      Math.abs(annihilationLow - 2 / 3) < EXACT &&
      Math.abs(annihilationHigh - 2 / 3) < EXACT &&
      Math.abs(eeToOo - 1 / 3) < EXACT

    // G3, G4: histories on live links
    const weave = makeColorWeave({ side: SIDE, table: 'pair' })
    const slots = weave.mesh.cellCount * 24
    const kernel = meetingKernel(swapPhase(OMEGA_ANGLE)) ?? []
    const dock0 = Array.from({ length: 24 }, (_, d) => d)
    const points2 = phasePointOperators(2)
    const tally = {
      pairs: 0,
      runs: 0,
      freeBeats: 0,
      freeBeatsWithMoves: 0,
      freeOwnChanges: 0,
      freeFixedChanges: 0,
      meetings: 0,
      coincident: 0,
      coincidentSumChanges: 0,
      coincidentJointChanges: 0,
      coincidentTrades: 0,
      apartSumChanges: 0,
      apartMeetings: 0,
      rhoCheckGap: 0,
    }
    const histories = (input: { background: Background; links: Int16Array }) => {
      const records = classicalRecords({ weave, links: input.links, background: input.background, open: dock0, beats: BEATS })

      return { records, pairs: meetingPairs(records) }
    }

    for (const background of [vacuumBackground(slots), weylBackground({ slots, scale: MATTER_SCALE })]) {
      const { records, pairs } = histories({ background, links: weave.links })

      tally.pairs += pairs.length

      for (const { a, b } of pairs) {
        const mine = pairRecords(records, a, b)
        const startGrid: [number, number] = [background.point[a] ?? 0, background.point[b] ?? 0]
        const track = trackPoints({ weave, records: mine, tokens: [a, b], start: startGrid })
        const startPhase: [number, number] = [phaseOfGrid(startGrid[0]), phaseOfGrid(startGrid[1])]

        for (const states of STARTS) {
          const start = productWholeAt({ tokens: [a, b], states, points: startPhase })
          // the model's beat as it stood when this was registered: the fixed-frame beat, not the comoving one the
          // user adopted from this line of work on 2026-09-26
          const steps = runWhole({ weave, start, records: mine, kernel4: kernel, comoving: false })
          let before = start

          tally.runs++

          steps.forEach((step, t) => {
            const pointsBefore = (track.before[t] ?? [0, 0]).map(phaseOfGrid) as [number, number]
            const pointsAfter = (track.after[t] ?? [0, 0]).map(phaseOfGrid) as [number, number]
            const r0 = readComoving(before, pointsBefore)
            const r1 = readComoving(step.whole, pointsAfter)

            if (step.meetings === 0) {
              tally.freeBeats++
              tally.freeBeatsWithMoves += step.moves > 0 ? 1 : 0
              tally.freeOwnChanges += sameRatio(r0.own[0], r0.units, r1.own[0], r1.units) && sameRatio(r0.own[1], r0.units, r1.own[1], r1.units) ? 0 : 1

              const f0 = readComoving(before, startPhase)
              const f1 = readComoving(step.whole, startPhase)

              tally.freeFixedChanges += sameRatio(f0.own[0], f0.units, f1.own[0], f1.units) && sameRatio(f0.own[1], f0.units, f1.own[1], f1.units) ? 0 : 1
            } else {
              tally.meetings++

              const sumKept = sameRatio(r0.own[0] + r0.own[1], r0.units, r1.own[0] + r1.own[1], r1.units)

              if (pointsBefore[0] === pointsBefore[1]) {
                tally.coincident++
                tally.coincidentSumChanges += sumKept ? 0 : 1
                tally.coincidentJointChanges += sameRatio(r0.joint, r0.units, r1.joint, r1.units) ? 0 : 1
                tally.coincidentTrades += sameRatio(r0.own[0], r0.units, r1.own[0], r1.units) ? 0 : 1
              } else {
                tally.apartMeetings++
                tally.apartSumChanges += sumKept ? 0 : 1
              }
            }

            before = step.whole
          })

          // the marginal formula against rho = sum W A (x) A on the final whole
          const units = Number(wholeUnits(before))
          const rho = operatorFromWigner(
            before.weight.map(w => Number(w) / units),
            points2,
          ) as ComplexMatrix
          const last = (track.after[track.after.length - 1] ?? startGrid).map(phaseOfGrid) as [number, number]
          const reading = readComoving(before, last)
          const fromRho = (m: ComplexMatrix): number => {
            let s = 0

            for (let i = 0; i < 9; i++) {
              for (let j = 0; j < 9; j++) {
                s += (rho.re[i * 9 + j] ?? 0) * (m.re[j * 9 + i] ?? 0) - (rho.im[i * 9 + j] ?? 0) * (m.im[j * 9 + i] ?? 0)
              }
            }

            return s
          }
          const na = fromRho(kronecker(q[last[0]] as ComplexMatrix, identity3))
          const nb = fromRho(kronecker(identity3, q[last[1]] as ComplexMatrix))

          tally.rhoCheckGap = Math.max(
            tally.rhoCheckGap,
            Math.abs(na - (1 + (3 * Number(reading.own[0])) / units) / 2),
            Math.abs(nb - (1 + (3 * Number(reading.own[1])) / units) / 2),
          )
        }
      }
    }

    const g3 = tally.freeOwnChanges === 0 && tally.freeBeatsWithMoves > 0 && tally.freeFixedChanges > 0 && tally.rhoCheckGap < 1e-9
    const g4 = tally.coincidentSumChanges === 0 && tally.coincidentJointChanges === 0 && tally.apartSumChanges > 0

    // G5: pure-gauge links in the vacuum
    const flatLinks = pureGaugeLinks(weave)
    const flat = { meetings: 0, coincident: 0, sumChanges: 0, shareChanges: 0, beats: 0 }
    const vacuum = vacuumBackground(slots)
    const flatHistories = histories({ background: vacuum, links: flatLinks })

    for (const { a, b } of flatHistories.pairs) {
      const mine = pairRecords(flatHistories.records, a, b)
      const track = trackPoints({ weave, records: mine, tokens: [a, b], start: [0, 0] })

      for (const states of STARTS) {
        const start = productWholeAt({ tokens: [a, b], states, points: [0, 0] })
        const steps = runWhole({ weave, start, records: mine, kernel4: kernel, comoving: false })
        let before = start

        steps.forEach((step, t) => {
          const pointsBefore = (track.before[t] ?? [0, 0]).map(phaseOfGrid) as [number, number]
          const pointsAfter = (track.after[t] ?? [0, 0]).map(phaseOfGrid) as [number, number]
          const r0 = readComoving(before, pointsBefore)
          const r1 = readComoving(step.whole, pointsAfter)

          flat.beats++
          flat.sumChanges += sameRatio(r0.own[0] + r0.own[1], r0.units, r1.own[0] + r1.own[1], r1.units) ? 0 : 1

          if (step.meetings > 0) {
            flat.meetings++
            flat.coincident += pointsBefore[0] === pointsBefore[1] ? 1 : 0
            flat.shareChanges += Math.abs(shareOf(step.whole) - shareOf(before)) > 1e-12 ? 1 : 0
          }

          before = step.whole
        })
      }
    }

    const g5 = flat.meetings > 0 && flat.coincident === flat.meetings && flat.sumChanges === 0 && flat.shareChanges > 0

    const ok = g1 && g2 && g3 && g4 && g5

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the swap phase keeps Q_x (x) 1 + 1 (x) Q_x at all 9 points (gap ${likeSameGap.toExponential(1)}) and misses it for two different points by at least ${likeApartLeast.toFixed(3)}, never annihilates a fermion pair (${likeAnnihilation.toExponential(1)}) and trades a fermion with a boson (${likeTradeLeast.toFixed(3)}); the singlet phase keeps the difference Q_x (x) 1 - 1 (x) Q_(x-bar) (gap ${unlikeDifferenceGap.toExponential(1)}), misses the sum by ${unlikeSumLeast.toFixed(3)}, and annihilates a fermion-antifermion pair into two bosons with chance up to ${annihilationHigh.toFixed(12)} (${eeToOo.toFixed(12)} from |ee>); along ${tally.runs} histories on live links every token's own number is kept on all ${tally.freeBeats} meeting-free beats (${tally.freeOwnChanges} changes, ${tally.freeBeatsWithMoves} with link moves) while the number about the start point changes on ${tally.freeFixedChanges}; of ${tally.meetings} meetings ${tally.coincident} have coinciding points, where the pair sum changes ${tally.coincidentSumChanges} times and the joint sign ${tally.coincidentJointChanges} (the numbers trade on ${tally.coincidentTrades}), and at the ${tally.apartMeetings} others the pair sum changes ${tally.apartSumChanges} times; on pure-gauge links ${flat.coincident} of ${flat.meetings} meetings coincide, the pair sum changes on ${flat.sumChanges} of ${flat.beats} beats and the fear share at ${flat.shareChanges} meetings`,
      metrics: {
        likeSameGap,
        likeApartLeast,
        likeAnnihilation,
        likeTradeLeast,
        unlikeDifferenceGap,
        unlikeSumLeast,
        annihilationChanceLow: annihilationLow,
        annihilationChanceHigh: annihilationHigh,
        annihilationChanceFromEE: eeToOo,
        meetingPairs: tally.pairs,
        runs: tally.runs,
        meetingFreeBeats: tally.freeBeats,
        meetingFreeBeatsWithMoves: tally.freeBeatsWithMoves,
        meetingFreeOwnChanges: tally.freeOwnChanges,
        meetings: tally.meetings,
        coincidentMeetings: tally.coincident,
        coincidentFraction: tally.coincident / Math.max(1, tally.meetings),
        coincidentSumChanges: tally.coincidentSumChanges,
        coincidentJointChanges: tally.coincidentJointChanges,
        coincidentTrades: tally.coincidentTrades,
        apartMeetings: tally.apartMeetings,
        apartSumChanges: tally.apartSumChanges,
        rhoCheckGap: tally.rhoCheckGap,
        flatMeetings: flat.meetings,
        flatCoincident: flat.coincident,
        flatBeats: flat.beats,
        flatSumChanges: flat.sumChanges,
        flatShareChanges: flat.shareChanges,
      },
      control: {
        meetingFreeStartPointChanges: tally.freeFixedChanges,
      },
      notes:
        'L2, exact integers along the histories. First run, every gate as fixed. The rough "about 1 in 9" of P4 (not a gate) was wrong: 980 of 3,176 meetings (0.31) have coinciding points, more than unrelated points would give; the cause (repeat meetings of one pair, the vacuum\'s common start point) is not measured here. A fermion number EXISTS in the role once it is read about the token\'s own point: N_i = (1 + 3 W_i(x_i)) / 2, x_i the classical role point the knit already carries, and F = sum over loves of N minus sum over fears of N. Links keep every N_i, the like fear beat keeps a sum and the love-fear beat keeps a difference, so F is a U(1) number, not only a parity, and the love-fear beat is where a fermion pair annihilates into two bosons (chance 1/3 from |ee>, 2/3 at most). The spinor it counts is the parity-even doublet about the token\'s own point, so if this number is the electron\'s, the electron\'s spin is that doublet. What breaks it is not the translations E-SPN-0054 blamed (the comoving point absorbs them) but a meeting of two tokens whose points differ, which on live links is most meetings. On a pure-gauge field every meeting coincides and F is exact, so the breaking is the holonomy of the loop the two tokens\' paths close: the color field strength. E-SPN-0062 asks for the smallest change to the fear beat that closes it on live links. Scope: the histories run the swap-phase law only; the love-fear law is tested as algebra (G2), since its histories need the frame bookkeeping of E-QTM-0123.',
    })
  },
})
