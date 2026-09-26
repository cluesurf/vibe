// Mana on the knit: is the magic of a whole exactly unchanged by every link move and changed only where the
// fear beat acts?
//
// Mana (Veitch, Mousavian, Gottesman and Emerson 2014) is M = ln sum |W|, the log of the Wigner norm. For a
// whole of love units L and fear units F with L - F = N, sum |W| = (L + F) / N, so, as an identity,
//
//   M = ln((L + F) / (L - F)) = -ln(1 - 2 f),   f = F / (L + F) the fear share.
//
// Mana is a function of the fear share alone: fear share IS magic, in the resource theory's own measure.
// E-QTM-0117 found every link move is a single-qutrit Clifford, which permutes the nine points of its role,
// so it permutes the whole's weights and cannot change L or F. E-QTM-0118 found both forms of the fear beat
// are non-Clifford. The prediction: along every knit history, mana is constant on every beat with no
// meeting, whatever links the tokens cross, and moves only at meetings.
//
// Histories (code/measure/knit-magic): the committed turning weave (pair table) on the side-3 D4 box, live
// links, the vacuum and a golden-ratio matter fill (scale 2.11, as E-QTM-0099), 480 beats; every pair of
// dock-0 tokens that meets, from three starts, |0>|1> (mana 0), Strange x |0> (ln 5/3) and Strange x
// Strange (2 ln 5/3); under the swap phase (every meeting) and under the color law (swap phase for like
// vibes, singlet phase where a love meets a fear).
//
// Measured:
// - on beats with no meeting: the multiset of the whole's weights, exactly (BigInt), before and after, and so
//   L, F and mana. Counted: beats, beats with at least one non-identity link move
// - at meetings: how many raise mana, lower it, keep it
// - every one of the 216 grid moves, as moveCoordinate, on both coordinates of every final whole: L and F
//   exactly unchanged
// - the wholes are states: under the swap phase, each final whole rebuilt as rho = sum W A is pure (top
//   eigenvalue 1 and the rest 0, to 1e-9)
// Controls:
// - the fear beat off (swap phase at pi, color law at (pi, 0)): mana constant on every beat, meetings included
// - a non-Clifford one-role move, the first element of Sigma(1080) that is not classical on the grid, applied
//   through its Wigner kernel to one coordinate of each final whole: mana must change on at least one
//
// Gates, fixed before the first run: 0 weight-multiset changes on meeting-free beats in both laws, with more
// than 0 non-identity link moves among them; 0 changes under the 216 x 2 moves on every final whole; at
// least one meeting changes mana in each law; every swap-phase final whole pure; the fear-off control
// changes mana on 0 beats; the non-Clifford control changes it on at least one whole.
//
// First run, 2026-09-25: every gate passed as fixed. 28 meeting pairs, 84 runs per law, 37,938 meeting-free
// beats per law, every one with link moves and none changing a weight multiset. Under the swap phase 1,044
// meetings raised mana, 1,011 lowered it, 327 kept it; under the color law 622, 627 and 1,133. The largest
// mana reached is 2 ln(5/3) = 1.0217, the Strange x Strange start's, fear share 0.32. Found afterwards by the
// probe for E-QTM-0120 (tmp/probe-color-validity.ts): the color law's wholes are not always states (299 of
// 2,016 sampled have a negative eigenvalue under every fixed reading of the fear convention), so under the
// color law ln sum |W| is the norm of a quasi-probability, not the mana of a state. The constancy result holds
// for it all the same, since it is about permutations of weights. The swap-phase wholes are states (84 of 84
// finals pure, gated).
//
// Depth L2: the fear weave is a constructed rule, and the constancy between meetings follows from E-QTM-0117
// by a theorem; what is measured is that the rule's histories obey it with no exception, and how often the
// fear beat raises or lowers magic.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import {
  fearKernels,
  meetingKernel,
  moveCoordinate,
  swapPhase,
  wholeLovesAndFears,
  wholeUnits,
  type Whole,
} from '@/code/rule/fear-weave'
import {
  classicalRecords,
  meetingPairs,
  pairRecords,
  productWhole,
  runWhole,
  vacuumBackground,
  weylBackground,
  type RoleState,
} from '@/code/measure/knit-magic'
import { generateGroup } from '@/code/dynamics/finite-gauge'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import { phasePoint, phaseSpaceAction } from '@/code/measure/qutrit-phase-space'
import { phasePointOperators } from '@/code/measure/grid-weights'
import { conjugate, hermitianSpectrum, innerProduct, mana, manaOfCounts, operatorFrom3, operatorFromWigner } from '@/code/measure/qutrit-clifford'

const OMEGA = (2 * Math.PI) / 3
const SIDE = 3
const BEATS = 480
const MATTER_SCALE = 2.11
const STARTS: readonly (readonly [RoleState, RoleState])[] = [
  ['basis0', 'basis1'],
  ['strange', 'basis0'],
  ['strange', 'strange'],
]

const sortedKey = (w: readonly bigint[]): string => [...w].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)).join(',')

function manaOfWhole(whole: Whole): number {
  return manaOfCounts(wholeLovesAndFears(whole))
}

export default experiment({
  id: 'quantum/mana-moves-only-at-the-fear-beat',
  code: 'E-QTM-0119',
  title:
    'mana moves only at the fear beat: along every knit history of a two-role whole, under the swap phase and under the color law, the weights are exactly permuted on every beat without a meeting whatever links are crossed, so mana, ln((love + fear) / (love - fear)) = -ln(1 - 2 x fear share), is constant there, and every change of magic happens at a meeting',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const weave = makeColorWeave({ side: SIDE, table: 'pair' })
    const slots = weave.mesh.cellCount * 24
    const links = weave.links
    const kThird = meetingKernel(swapPhase(OMEGA)) ?? []
    const kOff = meetingKernel(swapPhase(Math.PI)) ?? []
    const colorOn = fearKernels({ like: OMEGA, unlike: OMEGA }) ?? undefined
    const colorOff = fearKernels({ like: Math.PI, unlike: 0 }) ?? undefined
    const dock0 = Array.from({ length: 24 }, (_, d) => d)
    const backgrounds = [vacuumBackground(slots), weylBackground({ slots, scale: MATTER_SCALE })]
    const points2 = phasePointOperators(2)

    type Law = { name: string; kernel4: readonly (readonly number[])[]; color?: typeof colorOn }
    const laws: Law[] = [
      { name: 'swap', kernel4: kThird },
      { name: 'color', kernel4: [], color: colorOn },
    ]
    const offLaws: Law[] = [
      { name: 'swapOff', kernel4: kOff },
      { name: 'colorOff', kernel4: [], color: colorOff },
    ]

    const tally = {
      swap: { beats: 0, meetingFree: 0, withMoves: 0, changed: 0, up: 0, down: 0, same: 0, maxMana: 0, maxShare: 0, runs: 0 },
      color: { beats: 0, meetingFree: 0, withMoves: 0, changed: 0, up: 0, down: 0, same: 0, maxMana: 0, maxShare: 0, runs: 0 },
    }
    let offChanged = 0
    let offBeats = 0
    let gridMoveChanges = 0
    let gridMoveChecks = 0
    let pureWholes = 0
    let swapFinals = 0
    let pairsTotal = 0
    const finals: Whole[] = []

    for (const background of backgrounds) {
      const records = classicalRecords({ weave, links, background, open: dock0, beats: BEATS })
      const pairs = meetingPairs(records)

      pairsTotal += pairs.length

      for (const { a, b } of pairs) {
        const mine = pairRecords(records, a, b)

        for (const start of STARTS) {
          const startWhole = productWhole([a, b], start)

          for (const law of laws) {
            const t = tally[law.name as 'swap' | 'color']
            const steps = runWhole({ weave, start: startWhole, records: mine, kernel4: law.kernel4, color: law.color })
            let before = startWhole
            let beforeMana = manaOfWhole(startWhole)

            t.runs++

            for (const step of steps) {
              const after = step.whole
              const afterMana = manaOfWhole(after)
              const { loves, fears } = wholeLovesAndFears(after)
              const share = Number(fears) / Number(loves + fears)

              t.beats++
              t.maxMana = Math.max(t.maxMana, afterMana)
              t.maxShare = Math.max(t.maxShare, share)

              if (step.meetings === 0) {
                t.meetingFree++
                t.withMoves += step.moves > 0 ? 1 : 0

                // compare after dividing out the grain: reduceWhole may rescale at a meeting only
                const scaleBefore = wholeUnits(before)
                const scaleAfter = wholeUnits(after)
                const same = scaleBefore === scaleAfter ? sortedKey(before.weight) === sortedKey(after.weight) : false

                t.changed += same ? 0 : 1
              } else {
                const delta = afterMana - beforeMana

                if (delta > 1e-12) {
                  t.up++
                } else if (delta < -1e-12) {
                  t.down++
                } else {
                  t.same++
                }
              }

              before = after
              beforeMana = afterMana
            }

            const last = steps[steps.length - 1]?.whole ?? startWhole

            finals.push(last)

            // every grid move on both coordinates of the final whole
            const counts = wholeLovesAndFears(last)

            for (let c = 0; c < 2; c++) {
              for (const table of weave.moves.act) {
                const moved = wholeLovesAndFears(moveCoordinate(last, c, table))

                gridMoveChecks++
                gridMoveChanges += moved.loves === counts.loves && moved.fears === counts.fears ? 0 : 1
              }
            }

            if (law.name === 'swap') {
              swapFinals++

              const units = Number(wholeUnits(last))
              const rho = operatorFromWigner(
                last.weight.map(w => Number(w) / units),
                points2,
              )
              const spectrum = hermitianSpectrum(rho)
              const top = spectrum[spectrum.length - 1] ?? 0
              const rest = Math.max(...spectrum.slice(0, -1).map(Math.abs))

              pureWholes += Math.abs(top - 1) < 1e-9 && rest < 1e-9 ? 1 : 0
            }
          }

          for (const law of offLaws) {
            const steps = runWhole({ weave, start: startWhole, records: mine, kernel4: law.kernel4, color: law.color })
            const m0 = manaOfWhole(startWhole)

            for (const step of steps) {
              offBeats++
              offChanged += Math.abs(manaOfWhole(step.whole) - m0) > 1e-12 ? 1 : 0
            }
          }
        }
      }
    }

    // the non-Clifford control: a one-role Wigner kernel of an element of Sigma(1080) that is not classical
    const sigma1080 = generateGroup({ generators: SU3_SUBGROUPS.sigma1080.generators, limit: 4000 })
    const g = sigma1080.matrices.find(m => phaseSpaceAction({ unitary: m }) === undefined)
    const gOp = operatorFrom3(g ?? new Float64Array(18))
    const onePoints = [0, 1, 2].flatMap(a => [0, 1, 2].map(b => operatorFrom3(phasePoint(a, b))))
    // K(x, y) = Tr(A(x) g A(y) g^dagger) / 3
    const kernel = onePoints.map(ax => onePoints.map(ay => innerProduct(ax, conjugate(gOp, ay))[0] / 3))
    let controlChanged = 0

    for (const whole of finals) {
      const units = Number(wholeUnits(whole))
      const w = whole.weight.map(x => Number(x) / units)
      const moved = new Array<number>(81).fill(0)

      for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
          let s = 0

          for (let x0 = 0; x0 < 9; x0++) {
            s += (kernel[x]?.[x0] ?? 0) * (w[x0 * 9 + y] ?? 0)
          }

          moved[x * 9 + y] = s
        }
      }

      controlChanged += Math.abs(mana(moved) - mana(w)) > 1e-9 ? 1 : 0
    }

    const ok =
      tally.swap.changed === 0 &&
      tally.color.changed === 0 &&
      tally.swap.withMoves > 0 &&
      tally.color.withMoves > 0 &&
      gridMoveChanges === 0 &&
      tally.swap.up + tally.swap.down > 0 &&
      tally.color.up + tally.color.down > 0 &&
      pureWholes === swapFinals &&
      offChanged === 0 &&
      controlChanged > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on every knit history tried, the weights of a two-role whole are exactly permuted on every beat without a meeting, links crossed or not, under the swap phase and the color law, and every one of the 216 grid moves keeps love and fear on every final whole, so mana changes only at meetings; there it rises and falls; the swap-phase wholes are pure states; with the fear beat off mana never moves, and a non-Clifford one-role move changes it',
      metrics: {
        pairsMeeting: pairsTotal,
        swapRuns: tally.swap.runs,
        swapBeats: tally.swap.beats,
        swapMeetingFreeBeats: tally.swap.meetingFree,
        swapMeetingFreeBeatsWithLinkMoves: tally.swap.withMoves,
        swapMeetingFreeChanges: tally.swap.changed,
        swapMeetingsRaisingMana: tally.swap.up,
        swapMeetingsLoweringMana: tally.swap.down,
        swapMeetingsKeepingMana: tally.swap.same,
        swapMaxMana: tally.swap.maxMana,
        swapMaxFearShare: tally.swap.maxShare,
        colorRuns: tally.color.runs,
        colorBeats: tally.color.beats,
        colorMeetingFreeBeats: tally.color.meetingFree,
        colorMeetingFreeBeatsWithLinkMoves: tally.color.withMoves,
        colorMeetingFreeChanges: tally.color.changed,
        colorMeetingsRaisingMana: tally.color.up,
        colorMeetingsLoweringMana: tally.color.down,
        colorMeetingsKeepingMana: tally.color.same,
        colorMaxMana: tally.color.maxMana,
        colorMaxFearShare: tally.color.maxShare,
        gridMoveChecks,
        gridMoveChanges,
        swapFinalWholes: swapFinals,
        swapFinalWholesPure: pureWholes,
        manaBoundLn3: Math.log(3),
      },
      control: {
        fearOffBeats: offBeats,
        fearOffManaChanges: offChanged,
        nonCliffordControlWholes: finals.length,
        nonCliffordControlChanged: controlChanged,
      },
      notes:
        'L2, exact integers (BigInt) for every weight; mana compared in floating point to 1e-12 only at meetings and in the controls. Mana = ln((L + F) / (L - F)) = -ln(1 - 2 f) is an identity for a whole, so the fear share and mana are one number; a pure two-role whole has sum W^2 = 1/9, which bounds sum |W| by 3 (Cauchy-Schwarz), mana by ln 3 and the fear share by 1/3 (E-QTM-0099, E-FRC-0122). Histories: every pair of dock-0 tokens that meets in 480 beats, in the vacuum and in a golden-ratio matter fill, each from three product starts.',
    })
  },
})
