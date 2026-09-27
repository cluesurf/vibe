// The smallest change that makes the role's fermion number exact on live links: the fear beat read in each token's
// own frame.
//
// E-SPN-0059 found a U(1) fermion number in the role, N_i = <Q_(x_i)> about each token's own role point x_i, kept by
// every link and by every meeting where the two tokens' points coincide, broken at the others; on a pure-gauge field
// every meeting coincides. So the breaking is the color field's holonomy, and the fear beat is where it acts: the
// swap phase compares the two roles as written, in a frame each token's history has turned differently.
//
// THE CHANGE. Read the meeting in the tokens' own frames: displace each role to its own point first, meet, displace
// back,
//
//   U'(a, b) = T (SWAP U) T^dagger,   T = D(a) (x) D(b),
//
// with a and b the two tokens' points (for a love meeting a fear, V'(a, y) = (D(a) (x) D(y)) V (...)^dagger, y the
// fear's own point). Its Wigner kernel is the model's kernel with both coordinates translated (code/measure/
// comoving-parity translatedKernel), still in quarters, still one integer table per pair of points. The meeting
// needs only what the two tokens hold at the dock: their roles and their own points.
//
// PREDICTIONS, written before any run.
// P1 U'(a, b) commutes with Q_a (x) 1 + 1 (x) Q_b for all 81 pairs, since T carries Q_0 (x) 1 + 1 (x) Q_0 to it and
//    SWAP U commutes with that; it IS the model's SWAP U when a = b (T commutes with a function of SWAP there). V'(a, y)
//    commutes with Q_a (x) 1 - 1 (x) Q_y.
// P2 It is gauge covariant: a frame change M at the dock (M on a love, M* on a fear, the points moved by M's action)
//    carries U'(a, b) to U'(g a, g b) exactly, with no phase, because M D(x) = D(g x) V_L up to a phase and V_L (x)
//    V_L commutes with SWAP U; likewise V'. So the change adds no preferred frame.
// P3 On the E-SPN-0059 histories (live links) the pair sum is kept at EVERY meeting, and every token's own number on
//    every meeting-free beat, while the fear share still changes at meetings (the beat still makes and spends
//    magic) and the numbers still trade. Every swap-phase whole stays a pure state (a unitary conjugated by a
//    Clifford is unitary).
// P4 On pure-gauge links the comoving beat and the model's beat give the same whole on every beat (the points
//    always coincide).
//
// Gates, fixed before the first run:
// G1 [U'(a, b), Q_a (x) 1 + 1 (x) Q_b] and [V'(a, y), Q_a (x) 1 - 1 (x) Q_y] under 1e-12 on all 81 pairs; U'(a, a) =
//    SWAP U to 1e-12 on all 9; the quarter kernel of U'(a, b) equals translatedKernel(meetingKernel(U), a, b) entry for
//    entry on all 81
// G2 for all 648 elements of Sigma(648) and all 81 pairs, (M (x) M) U'(a, b) (M (x) M)^dagger = U'(g a, g b) and (M (x)
//    M*) V'(a, y) (M (x) M*)^dagger = V'(g a, g' y) to 1e-12, g and g' read from how M and M* move the phase-point
//    operators
// G3 the comoving law on E-SPN-0059's live-link histories: 0 changes of the pair sum at meetings, 0 changes of a
//    token's own number on meeting-free beats, more than 0 meetings changing the fear share, more than 0 trading
//    the numbers, every final whole pure (top eigenvalue 1, the rest 0, to 1e-9)
// G4 control: the model's own law on the same histories changes the pair sum at more than 0 meetings
// G5 on pure-gauge links (vacuum) the comoving and the model's law give identical weights on every beat of every run
//
// Depth L2: a constructed change to a constructed rule. It shows that a conserved fermion number costs one thing,
// a meeting read in the tokens' own frames, and says nothing about whether the model makes that choice.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { type ComplexMatrix, complexIdentity, complexMultiply } from '@/code/algebra/linear/complex-matrix'
import {
  closeGroup,
  conjugateMatrix,
  daggerMatrix,
  displacementMatrix,
  kronecker,
  liftOf,
  matrixDistance,
  phasePointMatrix,
  scaleMatrix,
  weilLifts,
} from '@/code/algebra/weil-representation'
import { makeColorWeave } from '@/code/rule/color-weave'
import {
  advanceWhole,
  exchangeOperator,
  meetingKernel,
  quarterKernel,
  singletPhase,
  swapPhase,
  wholeLovesAndFears,
  wholeUnits,
  type Whole,
} from '@/code/rule/fear-weave'
import { classicalRecords, meetingPairs, pairRecords, runWhole, vacuumBackground, weylBackground, type RoleState } from '@/code/measure/knit-magic'
import { phaseOfGrid, productWholeAt, pureGaugeLinks, readComoving, sameRatio, trackPoints, translatedKernel } from '@/code/measure/comoving-parity'
import { phasePointOperators } from '@/code/measure/grid-weights'
import { hermitianSpectrum, operatorFromWigner } from '@/code/measure/qutrit-clifford'

const OMEGA_ANGLE = (2 * Math.PI) / 3
const SIDE = 3
const BEATS = 480
const MATTER_SCALE = 2.11
const EXACT = 1e-12
const MATCH = 1e-9
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
const conjugateBy = (u: ComplexMatrix, m: ComplexMatrix): ComplexMatrix => complexMultiply(complexMultiply(u, m), daggerMatrix(u))
const displacement = (p: number): ComplexMatrix => displacementMatrix(3, Math.floor(p / 3), p % 3)
const shareOf = (w: Whole): number => {
  const { loves, fears } = wholeLovesAndFears(w)

  return Number(fears) / Number(loves + fears)
}

export default experiment({
  id: 'spin/comoving-fear-beat',
  code: 'E-SPN-0062',
  title:
    'the fear beat read in each token\'s own frame, U\' = T (SWAP U) T^dagger with T the displacements to the two tokens\' own points: gauge covariant with no phase, equal to the model\'s beat wherever the points coincide, and on live links it keeps the role\'s fermion number at every meeting while still making and spending fear, so an exactly conserved fermion number costs one choice, a meeting read in the tokens\' own frames',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const identity3 = complexIdentity(3)
    const phasePoints = Array.from({ length: 9 }, (_, p) => phasePointMatrix(3, Math.floor(p / 3), p % 3))
    const q = phasePoints.map(a => scaleMatrix(combine(identity3, 1, a, 1), [0.5, 0]))
    const u = swapPhase(OMEGA_ANGLE) as ComplexMatrix
    const uToken = complexMultiply(exchangeOperator() as ComplexMatrix, u)
    const v = singletPhase(OMEGA_ANGLE) as ComplexMatrix
    const kernel = meetingKernel(swapPhase(OMEGA_ANGLE)) ?? []
    const likeAt = (a: number, b: number): ComplexMatrix => conjugateBy(kronecker(displacement(a), displacement(b)), uToken)
    const unlikeAt = (a: number, y: number): ComplexMatrix => conjugateBy(kronecker(displacement(a), displacement(y)), v)
    const sumAt = (a: number, b: number): ComplexMatrix => combine(kronecker(q[a] as ComplexMatrix, identity3), 1, kronecker(identity3, q[b] as ComplexMatrix), 1)
    const differenceAt = (a: number, b: number): ComplexMatrix => combine(kronecker(q[a] as ComplexMatrix, identity3), 1, kronecker(identity3, q[b] as ComplexMatrix), -1)

    // G1
    let conservationGap = 0
    let diagonalGap = 0
    let kernelMismatches = 0
    const like: ComplexMatrix[] = []
    const unlike: ComplexMatrix[] = []

    for (let a = 0; a < 9; a++) {
      for (let b = 0; b < 9; b++) {
        const l = likeAt(a, b)
        const w = unlikeAt(a, b)

        like.push(l)
        unlike.push(w)
        conservationGap = Math.max(conservationGap, commutatorGap(l, sumAt(a, b)), commutatorGap(w, differenceAt(a, b)))

        if (a === b) {
          diagonalGap = Math.max(diagonalGap, matrixDistance(l, uToken))
        }

        const own = quarterKernel(l)
        const translated = translatedKernel(kernel, a, b)

        if (!own) {
          kernelMismatches += 81 * 81
        } else {
          for (let r = 0; r < 81; r++) {
            for (let c = 0; c < 81; c++) {
              kernelMismatches += (own[r]?.[c] ?? 0) === (translated[r]?.[c] ?? 0) ? 0 : 1
            }
          }
        }
      }
    }

    const g1 = conservationGap < EXACT && diagonalGap < EXACT && kernelMismatches === 0

    // G2: covariance under Sigma(648)
    const lift = weilLifts(3)[0]
    const s = lift ? liftOf(lift, [0, 2, 1, 0]) ?? identity3 : identity3
    const t = lift ? liftOf(lift, [1, 1, 0, 1]) ?? identity3 : identity3
    const sigma = closeGroup([s, t, displacementMatrix(3, 1, 0), displacementMatrix(3, 0, 1)], 5000) ?? []
    const pointMap = (m: ComplexMatrix): number[] =>
      phasePoints.map(a => {
        const moved = conjugateBy(m, a)

        return phasePoints.findIndex(b => matrixDistance(moved, b) < MATCH)
      })
    let covarianceGap = 0
    let unmatched = 0

    for (const m of sigma) {
      const mStar = conjugateMatrix(m)
      const g = pointMap(m)
      const gStar = pointMap(mStar)

      unmatched += [...g, ...gStar].filter(x => x < 0).length

      const both = kronecker(m, m)
      const mixed = kronecker(m, mStar)

      for (let a = 0; a < 9; a++) {
        for (let b = 0; b < 9; b++) {
          const ga = g[a] ?? 0
          const gb = g[b] ?? 0
          const gy = gStar[b] ?? 0

          covarianceGap = Math.max(
            covarianceGap,
            matrixDistance(conjugateBy(both, like[9 * a + b] as ComplexMatrix), like[9 * ga + gb] as ComplexMatrix),
            matrixDistance(conjugateBy(mixed, unlike[9 * a + b] as ComplexMatrix), unlike[9 * ga + gy] as ComplexMatrix),
          )
        }
      }
    }

    const g2 = sigma.length === 648 && unmatched === 0 && covarianceGap < EXACT

    // G3, G4: live-link histories
    const weave = makeColorWeave({ side: SIDE, table: 'pair' })
    const slots = weave.mesh.cellCount * 24
    const dock0 = Array.from({ length: 24 }, (_, d) => d)
    const points2 = phasePointOperators(2)
    const kernelCache = new Map<number, number[][]>()
    const kernelAt = (a: number, b: number): number[][] => {
      const key = 9 * a + b
      const known = kernelCache.get(key)

      if (known) {
        return known
      }

      const made = translatedKernel(kernel, a, b)

      kernelCache.set(key, made)

      return made
    }
    // one run of the comoving law along a pair's records, the tokens' own points tracked beside it
    const comovingRun = (input: { records: ReturnType<typeof pairRecords>; tokens: [number, number]; start: Whole; before: readonly (readonly [number, number])[] }): Whole[] => {
      let whole: Whole | null = input.start
      const out: Whole[] = []

      input.records.forEach((record, beat) => {
        const pts = input.before[beat] ?? [0, 0]
        const phaseOf = (tk: number): number => phaseOfGrid(tk === input.tokens[0] ? (pts[0] ?? 0) : (pts[1] ?? 0))

        whole = advanceWhole({
          weave,
          whole: whole as Whole,
          record,
          kernel4: kernel,
          fixed: false,
          forward: true,
          kernelOf: (ta, tb) => ({ kernel: kernelAt(phaseOf(ta), phaseOf(tb)), divisor: 4, order: [ta, tb] as const }),
        })

        if (!whole) {
          throw new Error('the comoving law refused a grain-mode whole, which advanceWhole never does')
        }

        out.push(whole)
      })

      return out
    }

    const live = { runs: 0, meetings: 0, sumChanges: 0, freeOwnChanges: 0, shareChanges: 0, trades: 0, pure: 0, modelSumChanges: 0 }

    for (const background of [vacuumBackground(slots), weylBackground({ slots, scale: MATTER_SCALE })]) {
      const records = classicalRecords({ weave, links: weave.links, background, open: dock0, beats: BEATS })

      for (const { a, b } of meetingPairs(records)) {
        const mine = pairRecords(records, a, b)
        const startGrid: [number, number] = [background.point[a] ?? 0, background.point[b] ?? 0]
        const track = trackPoints({ weave, records: mine, tokens: [a, b], start: startGrid })
        const startPhase: [number, number] = [phaseOfGrid(startGrid[0]), phaseOfGrid(startGrid[1])]

        for (const states of STARTS) {
          const start = productWholeAt({ tokens: [a, b], states, points: startPhase })
          const comoving = comovingRun({ records: mine, tokens: [a, b], start, before: track.before })
          // the control is the fixed-frame beat, the model's before the user adopted this change (2026-09-26)
          const model = runWhole({ weave, start, records: mine, kernel4: kernel, comoving: false }).map(x => x.whole)

          live.runs++

          for (const [law, wholes] of [
            ['comoving', comoving],
            ['model', model],
          ] as const) {
            let before = start

            wholes.forEach((after, beat) => {
              const r0 = readComoving(before, (track.before[beat] ?? [0, 0]).map(phaseOfGrid) as [number, number])
              const r1 = readComoving(after, (track.after[beat] ?? [0, 0]).map(phaseOfGrid) as [number, number])
              const met = (mine[beat]?.meetings.length ?? 0) > 0
              const sumKept = sameRatio(r0.own[0] + r0.own[1], r0.units, r1.own[0] + r1.own[1], r1.units)

              if (law === 'model') {
                live.modelSumChanges += met && !sumKept ? 1 : 0
              } else if (met) {
                live.meetings++
                live.sumChanges += sumKept ? 0 : 1
                live.shareChanges += Math.abs(shareOf(after) - shareOf(before)) > 1e-12 ? 1 : 0
                live.trades += sameRatio(r0.own[0], r0.units, r1.own[0], r1.units) ? 0 : 1
              } else {
                live.freeOwnChanges += sameRatio(r0.own[0], r0.units, r1.own[0], r1.units) && sameRatio(r0.own[1], r0.units, r1.own[1], r1.units) ? 0 : 1
              }

              before = after
            })
          }

          const last = comoving[comoving.length - 1] ?? start
          const units = Number(wholeUnits(last))
          const spectrum = hermitianSpectrum(operatorFromWigner(last.weight.map(w => Number(w) / units), points2))
          const top = spectrum[spectrum.length - 1] ?? 0
          const rest = Math.max(...spectrum.slice(0, -1).map(Math.abs))

          live.pure += Math.abs(top - 1) < 1e-9 && rest < 1e-9 ? 1 : 0
        }
      }
    }

    const g3 = live.sumChanges === 0 && live.freeOwnChanges === 0 && live.shareChanges > 0 && live.trades > 0 && live.pure === live.runs
    const g4 = live.modelSumChanges > 0

    // G5: pure-gauge links, the two laws side by side
    const flatLinks = pureGaugeLinks(weave)
    const vacuum = vacuumBackground(slots)
    const flatRecords = classicalRecords({ weave, links: flatLinks, background: vacuum, open: dock0, beats: BEATS })
    let flatBeats = 0
    let flatDifferences = 0

    for (const { a, b } of meetingPairs(flatRecords)) {
      const mine = pairRecords(flatRecords, a, b)
      const track = trackPoints({ weave, records: mine, tokens: [a, b], start: [0, 0] })

      for (const states of STARTS) {
        const start = productWholeAt({ tokens: [a, b], states, points: [0, 0] })
        const comoving = comovingRun({ records: mine, tokens: [a, b], start, before: track.before })
        const model = runWhole({ weave, start, records: mine, kernel4: kernel, comoving: false }).map(x => x.whole)

        comoving.forEach((w, beat) => {
          flatBeats++
          flatDifferences += w.weight.every((x, i) => x === model[beat]?.weight[i]) ? 0 : 1
        })
      }
    }

    const g5 = flatBeats > 0 && flatDifferences === 0

    const ok = g1 && g2 && g3 && g4 && g5

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the comoving beat keeps the sum (like) and the difference (love-fear) of the two tokens' own numbers on all 81 pairs of points (gap ${conservationGap.toExponential(1)}), is the model's beat where the points coincide (${diagonalGap.toExponential(1)}), and its quarter kernel is the model's translated to the two points (${kernelMismatches} mismatches); under all ${sigma.length} frame changes of Sigma(648) it is covariant with no phase (gap ${covarianceGap.toExponential(1)}); on ${live.runs} live-link histories the pair sum changes at ${live.sumChanges} of ${live.meetings} meetings (the model's beat: ${live.modelSumChanges}), a token's own number on ${live.freeOwnChanges} meeting-free beats, while the fear share changes at ${live.shareChanges} meetings and the numbers trade at ${live.trades}, and ${live.pure} of ${live.runs} final wholes are pure; on pure-gauge links the two laws differ on ${flatDifferences} of ${flatBeats} beats`,
      metrics: {
        conservationGap,
        diagonalGap,
        kernelMismatches,
        linkGroupOrder: sigma.length,
        unmatchedPointMaps: unmatched,
        covarianceGap,
        liveRuns: live.runs,
        liveMeetings: live.meetings,
        liveSumChanges: live.sumChanges,
        liveFreeOwnChanges: live.freeOwnChanges,
        liveShareChanges: live.shareChanges,
        liveTrades: live.trades,
        livePureFinals: live.pure,
        flatBeats,
        flatDifferences,
      },
      control: {
        modelLawSumChanges: live.modelSumChanges,
      },
      notes:
        'L2. The fermion number of E-SPN-0059, F = sum over loves of <Q_(x_i)> minus sum over fears, becomes exact on live links with one change: the fear beat reads the two roles in their own frames. The change is local (the meeting uses the two tokens\' own points, data the knit already carries at the dock), exact (one integer kernel per pair of points, 81 in all, still quarters) and gauge covariant with no phase, so it adds no preferred frame; where the points coincide it IS the model\'s beat, and on a pure-gauge field the two rules are the same rule. It keeps the fear beat\'s job: fear is still made and spent at meetings, and the numbers still trade between tokens, so the beat is not frozen into a superselected corner. What it costs is universality across sectors: every generator now keeps F, so the pair\'s dynamics splits into F sectors, which is what a conserved fermion number means. The singlet form is covered as algebra (G1, G2); its histories need E-QTM-0123\'s frame bookkeeping and were not run. Whether the model should make this choice is not a measurement: it is a design decision this file prices, and until it is made the model has the number only on pure-gauge links (E-SPN-0059).',
    })
  },
})
