// What splits the three triplet copies, and into what pattern.
//
// E-FRC-0140 measures the three copies of a triplet in the coin exactly degenerate under the triality weave,
// because the weave commutes with the triality that cycles them. A mass hierarchy needs that symmetry
// broken. This measures two ways to break it, by the same instrument (code/measure/generation-copies: a lone
// tone beside the vacuum, per copy its reach after REACH_BEATS beats, the slots it has disturbed at the last
// beat, and where its charge goes):
//
// 1. A rule with no triality: the committed turning weave (E-FRC-0095 keeps none). The lone runs do not
//    depend on a plane, so one set of 48 runs is read against all 16 A2 planes, each with its own triality.
//    Per plane: the count of seeds whose triality image behaves differently, the spread of the per-copy
//    reach and dressing, and the pattern, whether two copies stay equal and one splits off (1 + 2) or all
//    three differ (1 + 1 + 1).
// 2. A condensate that picks one copy: the aligned triality weave (E-FRC-0140) started from a state with a
//    love on the triplet slot and a fear on the antitriplet slot of every copy-0 line, in every cell. The
//    rule still commutes with the triality, the state does not. Lone tones go on the empty copies 1 and 2
//    (a love or a fear on either slot) and are compared with each other: the question is whether the two
//    copies the condensate does not touch stay degenerate. Copy 0 is probed by removing one of its tones, a
//    hole, reported beside them, since a hole is not the same excitation as a tone.
//    Control: the same condensate on all three copies, a state the triality keeps, where holes on the three
//    copies must stay exactly degenerate.
//
// Gates, fixed before the run: the committed rule splits the copies on every one of the 16 planes (at
// least one seed differs from its image); the symmetric condensate keeps them exactly degenerate; and under
// the copy-0 condensate at least one seed on copy 1 or 2 differs from its triality image, which is the
// instrument seeing the breaking. The pattern is reported, not gated.
//
// Result, first run, and the gate that failed. The committed rule splits the copies on all 16 planes, and
// on every one of them all three differ (1 + 1 + 1) in both reach and dressing: a full split, with reach
// spreads of 1.59 to 5.66 cells. The copy-0 condensate does NOT split copies 1 and 2 from each other: every
// seed on copy 1 matches its image on copy 2 exactly, and a lone tone on either behaves exactly as it does
// in the empty vacuum (reach 1.29, support 1, charge never leaving its copy). Only copy 0 is set apart, and
// its holes reach 4.97 and disturb 144 slots. So a condensate on one copy gives the pattern 1 + 2, and the
// reason is dynamical, not a hidden symmetry: under the aligned weave a copy's charge never leaves it
// (E-FRC-0140), and the vertex V fires only on an orbit that is empty or holds the same tone on all three
// lines, which a condensate on one of the three never is, so copies 1 and 2 never meet copy 0 at all. The
// gate that asked for copies 1 and 2 to differ fails, and the failure stands: it is the finding.
//
// A first run also counted 2 exceptions in the symmetric control, where the triality forces none. Both
// were the reach, a length from hypot of two rotated vectors of the same length, equal to 8.9e-16. Reach
// is now compared to 1e-9 (code/measure/generation-copies), and support and charges stay exact integers.
//
// Depth L2: symmetry breaking measured on constructed rules, with a symmetric control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  permutationOrder,
  weylF4DirectionPermutations,
} from '@/code/measure/coin-symmetry'
import {
  colorTriality,
  trialityWeave,
  trialityWeaveLayout,
} from '@/code/rule/triality-weave'
import { turningWeave, type Collision } from '@/code/rule/collision'
import { d4BoxCell, d4BoxMesh } from '@/code/substrate/d4-box'
import {
  alignedLayout,
  circulantDefect,
  copyLayout,
  copyStatistics,
  degeneracyExceptions,
  loneRun,
  memoizedRule,
  vacuumSequence,
  type CopyLayout,
  type LoneRun,
} from '@/code/measure/generation-copies'

const SIDE = 11
const BEATS = 24
const REACH_BEATS = 6

const keyOf = (list: readonly number[]): string =>
  [...list].sort((a, b) => a - b).join(',')
const split = (xs: readonly number[]): number => Math.max(...xs) - Math.min(...xs)

// 1 + 2 when exactly two of three values agree, 1 + 1 + 1 when none do, 3 when all do
function pattern(xs: readonly number[]): string {
  const [a = 0, b = 0, c = 0] = xs
  const equal = [a === b, b === c, a === c].filter(Boolean).length

  return equal === 3 ? '3' : equal === 1 ? '1+2' : '1+1+1'
}

export default experiment({
  id: 'gauge/generation-splitting',
  code: 'E-FRC-0141',
  title:
    'what splits the three triplet copies: the committed turning weave, which keeps no triality, splits all three apart on all 16 A2 planes, while under the triality weave a condensate on one copy sets only that copy apart and leaves the other two exactly degenerate (1 + 2), and the same condensate on all three keeps all three degenerate',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const box = d4BoxMesh({ side: SIDE })
    const opposite = meshOpposites(box)
    const mid = Math.floor(SIDE / 2)
    const cell = d4BoxCell({ coordinates: [mid, mid, mid, mid], side: SIDE })

    const record = (input: {
      rule: (t: number) => Collision
      lines: CopyLayout['lines']
      start?: Int8Array
    }): (LoneRun | undefined)[][] => {
      const { lines, start } = input
      // the lookup form of the rule, checked equal to the rule itself in E-FRC-0140
      const rule = memoizedRule(input.rule)
      const vacuum = vacuumSequence({ mesh: box, rule, beats: BEATS, start })

      return Array.from({ length: 24 }, (_, direction) =>
        ([1, -1] as const).map(tone => {
          const present = start?.[cell * 24 + direction] ?? 0

          // a tone on an empty slot, or a hole where the slot holds the opposite tone
          if (present === tone) {
            return undefined
          }

          return loneRun({
            mesh: box,
            side: SIDE,
            rule,
            vacuum,
            cell,
            direction,
            tone,
            lines,
            reachBeats: REACH_BEATS,
            start,
          })
        }),
      )
    }

    // 1. the committed rule against all 16 planes
    const selectors = weylF4DirectionPermutations({ directions: roots }).filter(
      p =>
        permutationOrder({ permutation: p }) === 3 &&
        p.filter((image, d) => image === d).length === 6,
    )
    const perPlane = new Map<string, readonly number[]>()

    for (const p of selectors) {
      const key = keyOf(p.map((image, d) => (image === d ? d : -1)).filter(d => d >= 0))

      if (!perPlane.has(key)) {
        perPlane.set(key, p)
      }
    }

    const anyLayout = copyLayout({ roots, opposite, triality: selectors[0] ?? [] })
    const committedRuns = record({ rule: turningWeave({ opposite }), lines: anyLayout.lines })
    const planes = [...perPlane.values()].map(sigma => {
      const copies = copyLayout({ roots, opposite, triality: sigma })
      const stats = copyStatistics({ layout: copies, runs: committedRuns })

      return {
        exceptions: degeneracyExceptions({ copies, sigma, runs: committedRuns }),
        reachSplit: split(stats.reach),
        supportSplit: split(stats.finalSupport),
        circulantDefect: circulantDefect(stats.mixing),
        reachPattern: pattern(stats.reach),
        supportPattern: pattern(stats.finalSupport),
        kept: stats.mixing.map((row, g) => row[g] ?? 0),
      }
    })
    const everyPlaneSplits = planes.length === 16 && planes.every(p => p.exceptions > 0)
    const count = (f: (p: (typeof planes)[number]) => boolean): number => planes.filter(f).length

    // 2. the aligned triality weave with a condensate
    const sigma = colorTriality({ opposite })
    const copies = copyLayout({ roots, opposite, triality: sigma })
    const layout = alignedLayout({ layout: trialityWeaveLayout({ opposite, triality: sigma }), copies })
    const rule = trialityWeave({ layout })
    const condensate = (onCopy: (g: number) => boolean): Int8Array => {
      const state = new Int8Array(box.cellCount * 24)

      copies.lines.forEach(([p, q], l) => {
        const g = copies.copy[l] ?? -1
        const t = copies.triplet[l] ?? -1

        if (g < 0 || !onCopy(g)) {
          return
        }

        const anti = t === p ? q : p

        for (let c = 0; c < box.cellCount; c++) {
          state[c * 24 + t] = 1
          state[c * 24 + anti] = -1
        }
      })

      return state
    }

    const oneCopy = condensate(g => g === 0)
    const allCopies = condensate(() => true)
    const oneRuns = record({ rule, lines: copies.lines, start: oneCopy })
    const allRuns = record({ rule, lines: copies.lines, start: allCopies })
    const oneStats = copyStatistics({ layout: copies, runs: oneRuns })
    const allStats = copyStatistics({ layout: copies, runs: allRuns })
    // the two empty copies: seeds on copy 1 against their triality images on copy 2
    const oneExceptions = degeneracyExceptions({ copies, sigma, runs: oneRuns, onCopy: 1 })
    const allExceptions = degeneracyExceptions({ copies, sigma, runs: allRuns })
    const symmetricDegenerate =
      allExceptions === 0 &&
      split(allStats.reach) < 1e-9 &&
      split(allStats.finalSupport) === 0 &&
      circulantDefect(allStats.mixing) < 1e-12
    const oneBreaks = oneExceptions > 0

    const ok = everyPlaneSplits && symmetricDegenerate && oneBreaks

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the committed turning weave, with no triality, splits the three triplet copies on every one of the 16 A2 planes, all three apart (1 + 1 + 1) in reach and dressing, and the same condensate on all three copies keeps them exactly degenerate under the triality weave, but a condensate on one copy does not split the other two: they stay exactly degenerate and blind to it, the pattern 1 + 2, so the gate asking for a split between them fails',
      metrics: {
        planes: planes.length,
        committedPlanesSplit: count(p => p.exceptions > 0),
        committedFewestExceptions: Math.min(...planes.map(p => p.exceptions)),
        committedReachSplitSmallest: Math.min(...planes.map(p => p.reachSplit)),
        committedReachSplitLargest: Math.max(...planes.map(p => p.reachSplit)),
        committedSupportSplitSmallest: Math.min(...planes.map(p => p.supportSplit)),
        committedSupportSplitLargest: Math.max(...planes.map(p => p.supportSplit)),
        committedReachPattern3: count(p => p.reachPattern === '3'),
        committedReachPattern1plus2: count(p => p.reachPattern === '1+2'),
        committedReachPattern1plus1plus1: count(p => p.reachPattern === '1+1+1'),
        committedSupportPattern3: count(p => p.supportPattern === '3'),
        committedSupportPattern1plus2: count(p => p.supportPattern === '1+2'),
        committedSupportPattern1plus1plus1: count(p => p.supportPattern === '1+1+1'),
        committedCirculantDefectSmallest: Math.min(...planes.map(p => p.circulantDefect)),
        committedCirculantDefectLargest: Math.max(...planes.map(p => p.circulantDefect)),
        condensateExceptionsCopy1Against2: oneExceptions,
        condensateHoleReachCopy0: oneStats.reach[0] ?? 0,
        condensateReachCopy1: oneStats.reach[1] ?? 0,
        condensateReachCopy2: oneStats.reach[2] ?? 0,
        condensateHoleSupportCopy0: oneStats.finalSupport[0] ?? 0,
        condensateSupportCopy1: oneStats.finalSupport[1] ?? 0,
        condensateSupportCopy2: oneStats.finalSupport[2] ?? 0,
        condensateKeptCopy1: oneStats.mixing[1]?.[1] ?? 0,
        condensateKeptCopy2: oneStats.mixing[2]?.[2] ?? 0,
        condensateCopy1ToCopy0: oneStats.mixing[1]?.[0] ?? 0,
        condensateCopy1ToCopy2: oneStats.mixing[1]?.[2] ?? 0,
        condensateCopy2ToCopy0: oneStats.mixing[2]?.[0] ?? 0,
        condensateCopy2ToCopy1: oneStats.mixing[2]?.[1] ?? 0,
      },
      control: {
        symmetricExceptions: allExceptions,
        symmetricHoleReach: allStats.reach[0] ?? 0,
        symmetricHoleReachSplit: split(allStats.reach),
        symmetricHoleSupport: allStats.finalSupport[0] ?? 0,
        symmetricSupportSplit: split(allStats.finalSupport),
        symmetricCirculantDefect: circulantDefect(allStats.mixing),
        side: SIDE,
        beats: BEATS,
      },
      notes:
        'L2, exact, no random numbers. A split here is a difference in how far a lone tone travels, how much it disturbs and where its charge goes, per copy. It is not a mass: neither triality weave has a free traveller (E-FRC-0111), and the committed rule has one protected species, so no dispersion relation is fitted and no hierarchy of masses is claimed. The condensate is a chosen starting state, not a vacuum the rule selects, so this shows what a copy-selecting background would do, not that the base has one.',
    })
  },
})
