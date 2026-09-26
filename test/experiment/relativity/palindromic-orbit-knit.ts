// Can a palindrome buy back CPT without losing the isotropy? E-RLT-0048 built the orbit knit, whose
// glide group acts irreducibly on R^4 so its glide-averaged long-wave response is isotropic, and found
// that no irreducible glide group has a CPT partner. The committed knit gets its CPT from a palindrome,
// not from a glide normalizer (E-FND-0117), so the escape to try is a palindrome of the orbit knit: its
// beats g^u B_j g^-u forward, then the same beats backward (code/rule/orbit-knit palindromicSchedule).
//
// 1. THE PALINDROMIC ORBIT KNIT. The full ledger over 1152 coin maps, 6 tone maps and every shift and
//    mirror phase (code/measure/rule-symmetry-ledger): the reversals (CPT) and the glides that survive,
//    and its period group, every coin part of either kind, and whether that acts irreducibly
//    (code/measure/coarse-modes forcedIsotropySpread at rank 2). Reversal and charge on the D4 box, the
//    vacuum period. The long-wave response of E-RLT-0045 averaged over 8 start phases spread across the
//    period, against the glide orbit knit averaged over its glide cycle and the committed knit averaged
//    the same way, all on the D4 box at side 9.
// 2. WHAT THE THEOREM COVERS HERE. E-RLT-0048's argument is about glide groups: shifts only. A
//    palindrome's symmetries are glides AND reversals, so its period group is different, and the
//    argument does not reach it. What does: a reversal carries every glide to its inverse (up to a beat
//    symmetry that acts with the plain tone map), a reversal squared is a shift of zero, and every glide
//    and reversal keeps the sign with which each beat symmetry acts. So the period group of any schedule
//    is <K, g, q> with K a common beat symmetry group, g one glide and q one reversal under those
//    constraints (code/measure/glide-group periodGroupCandidates), whatever its motif, walk or period.
//    The search runs over K = every subgroup of the full stabilizer of every beat a relaxation admits,
//    under every orientation choice (periodGroupSearch), for all five beat shapes: the committed one,
//    the head-on turn weave's (a swap condition that reads the same both ways), free orientations,
//    swaps on orbits of couples, and both relaxations together. The tone maps are the identity and
//    charge conjugation, the only ones that keep calm (a tone map that moves calm turns the empty dock
//    into a charged one).
//
// Gates: the palindrome keeps CPT (a reversal with the identity coin map and charge conjugation), its
// period group is reducible, echo and charge are exact, its vacuum is periodic; its period-averaged
// anisotropy is more than twice the glide orbit knit's (the isotropy the glide bought is lost with it);
// and the search finds no irreducible period group, palindrome alone or with a glide, for any of the five
// beat shapes.
//
// Depth L2: a constructed knit measured, and an exhaustive group-theoretic search.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  permutationOrder,
  weylF4DirectionPermutations,
} from '@/code/measure/coin-symmetry'
import {
  d4BoxCoordinates,
  d4BoxMesh,
  d4Vector,
  linearMapOf,
} from '@/code/substrate/d4-box'
import { Collision, turningWeave } from '@/code/rule/collision'
import { meshOpposites } from '@/code/tool/mesh'
import {
  denseCellStates,
  loneCellStates,
  symmetryLedger,
  CHARGE_CONJUGATION,
} from '@/code/measure/rule-symmetry-ledger'
import { vacuumCellTrajectory } from '@/code/measure/chiral-response'
import {
  chargeWaveResponse,
  curveSpread,
  forcedIsotropySpread,
  kernelParts,
  responseKernel,
  unitSamples,
} from '@/code/measure/coarse-modes'
import {
  beatStabilizerCensus,
  conjugacyClasses,
  irreducibleGlideCandidates,
  matrixGroupClosure,
  periodGroupSearch,
  type Matrix4,
  type Relaxation,
} from '@/code/measure/glide-group'
import {
  bestBeatPair,
  orbitBeatFor,
  orbitKnit,
  orbitKnitPeriod,
  palindromicSchedule,
} from '@/code/rule/orbit-knit'
import { makeWill, Will } from '@/code/tone/will'
import { collide, stream, streamInverse } from '@/code/rule/lattice-gas'
import { goldenFill } from '@/code/measure/slot-statistics'

const SIDE = 9
const PHASES = 8
const WARM = 48
const GENERIC = [0.31, -0.74, 0.52, 0.29]
const AXES = [0, 1, 2, 3].map(a => [0, 1, 2, 3].map(k => (k === a ? 1 : 0)))
const RELAXATIONS: Relaxation[] = ['index', 'headOn', 'free', 'orbit', 'headOnOrbit']

// the long-wave kernel on the D4 box, averaged over start phases `step` beats apart
function averagedResponse(input: {
  schedule: (t: number) => Collision
  step: number
}): { anisotropy: number; axisSpread: number } {
  const mesh = d4BoxMesh({ side: SIDE })
  const positionOf = (dock: number): number[] =>
    d4Vector(d4BoxCoordinates({ cell: dock, side: SIDE }))
  let sum: number[][][] | undefined
  let curves: number[][] | undefined

  for (let j = 0; j < PHASES; j++) {
    const records = chargeWaveResponse({
      mesh,
      side: SIDE,
      schedule: input.schedule,
      directions: rootsD4(),
      modes: AXES,
      epsilon: 0.1,
      warm: WARM + input.step * j,
      beats: 2 * SIDE,
      positionOf,
    })
    const kernel = responseKernel(records)

    sum = sum
      ? sum.map((m, t) => m.map((row, i) => row.map((x, k) => x + (kernel[t]?.[i]?.[k] ?? 0))))
      : kernel
    curves = curves
      ? curves.map((c, m) => c.map((x, t) => x + (records[m]?.relaxation[t] ?? 0)))
      : records.map(r => [...r.relaxation])
  }

  const parts = kernelParts((sum ?? []).map(m => m.map(row => row.map(x => x / PHASES))))

  return {
    anisotropy: parts.anisotropic / parts.isotropic,
    axisSpread: curveSpread((curves ?? []).map(c => c.map(x => x / PHASES))),
  }
}

export default experiment({
  id: 'relativity/palindromic-orbit-knit',
  code: 'E-RLT-0049',
  title:
    'a palindrome buys CPT back and loses the isotropy: folding the orbit knit into a palindrome gives exact CPT at the mirror phase with the identity coin map, but the glide goes with the fold, its period group shrinks to the 3 beat symmetries (reducible), and its period-averaged long-wave anisotropy rises from 0.23 to 0.63; extended from glides to period groups (glides and reversals together, any motif, any period) and to every subgroup of every beat stabilizer of five beat shapes, including the head-on swap and free orientations, no irreducible period group exists, so the fork between CPT and isotropy by symmetry survives the palindrome',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const opposite = meshOpposites(d4BoxMesh({ side: 5 }))
    const permutations = weylF4DirectionPermutations({ directions: roots })
    const matrices: Matrix4[] = permutations.map(p => linearMapOf(p) ?? [])
    const samples = unitSamples(64)
    const spread = (group: readonly Matrix4[]): number =>
      forcedIsotropySpread({ group, rank: 2, generic: GENERIC, samples })
    const traceOf = (p: readonly number[]): number => {
      const m = linearMapOf(p) ?? []

      return [0, 1, 2, 3].reduce((s, i) => s + (m[i]?.[i] ?? 0), 0)
    }
    const orderOf = (p: readonly number[]): number =>
      permutationOrder({ permutation: p })

    // the orbit knit of E-RLT-0048, rebuilt the same way
    const { classOf } = conjugacyClasses(permutations)
    const admissible = new Set(
      beatStabilizerCensus({ permutations, opposite, relaxation: 'orbit', traceOf, orderOf })
        .filter(r => r.invariantBeats > 0 && r.eta === 1)
        .map(r => r.classIndex),
    )
    const first = irreducibleGlideCandidates({
      matrices,
      permutations,
      admissible: i => admissible.has(classOf[i] ?? -1),
      forcedSpread: spread,
      maxOrder: 96,
    })[0]
    const k = permutations[first?.k ?? 0] ?? []
    const g = permutations[first?.g ?? 0] ?? []
    const pair = bestBeatPair({
      beats: orbitBeatFor({ k, glide: g, opposite, limit: 1_000_000, components: 12 }),
      glide: g,
      opposite,
      powers: 8,
    })
    const states = [
      ...loneCellStates(24),
      ...denseCellStates({ count: 64, offset: 0, degree: 24 }),
    ]
    const beats = pair ? [pair.first, pair.second] : []
    const powers = pair
      ? Math.max(
          orbitKnitPeriod({ beat: pair.first, glide: g, opposite, states }),
          orbitKnitPeriod({ beat: pair.second, glide: g, opposite, states }),
        )
      : 1
    const n = 2 * powers
    const glideForward = orbitKnit({ beat: beats, glide: g, period: n, opposite })
    const glideInverse = orbitKnit({ beat: beats, glide: g, period: n, opposite, forward: false })
    const forward = palindromicSchedule({ schedule: glideForward, n })
    const inverse = palindromicSchedule({ schedule: glideInverse, n })
    const period = 2 * n

    // 1. the ledger and the period group
    const ledger = symmetryLedger({
      forward,
      inverse,
      period,
      permutations,
      degree: 24,
      quickDense: 32,
      thoroughDense: 512,
    })
    const glides = ledger.filter(e => e.kind === 'forward')
    const reversals = ledger.filter(e => e.kind === 'reversal')
    const identityIndex = permutations.findIndex(p => p.every((x, i) => x === i))
    const cpt = reversals.filter(
      e => e.p === identityIndex && e.tau === CHARGE_CONJUGATION,
    )
    const periodGroup = matrixGroupClosure(ledger.map(e => matrices[e.p] ?? []))
    const periodSpread = spread(periodGroup)

    // reversal and charge on the D4 box, and the vacuum
    let will: Will = makeWill(d4BoxMesh({ side: SIDE }))

    goldenFill({ will, love: 0.3, fear: 0.3 })

    const start = Int8Array.from(will.data)
    const charge = (d: Int8Array): number => d.reduce((a, b) => a + b, 0)

    for (let t = 0; t < period; t++) {
      collide(will, forward(t))
      will = stream(will)
    }

    const chargeDrift = charge(will.data) - charge(start)

    for (let t = period - 1; t >= 0; t--) {
      will = streamInverse(will)
      collide(will, inverse(t))
    }

    const echo = will.data.reduce((a, x, i) => a + (x !== start[i] ? 1 : 0), 0)
    const vacuum = vacuumCellTrajectory({ schedule: forward, beats: 3 * period + 48, degree: 24 })
    const vacuumPeriod =
      Array.from({ length: 2 * period }, (_, p) => p + 1).find(p =>
        vacuum
          .slice(0, period)
          .every((v, t) => v.every((x, i) => x === vacuum[t + p]?.[i])),
      ) ?? -1

    // the responses
    const palindrome = averagedResponse({ schedule: forward, step: period / PHASES })
    const glide = averagedResponse({ schedule: glideForward, step: 2 })
    const committed = averagedResponse({
      schedule: turningWeave({ opposite: meshOpposites(d4BoxMesh({ side: SIDE })) }),
      step: 2,
    })

    // 2. the period-group search
    const searches = RELAXATIONS.map(relaxation => ({
      relaxation,
      ...periodGroupSearch({
        relaxation,
        permutations,
        matrices,
        opposite,
        forcedSpread: spread,
        traceOf,
        orderOf,
      }),
    }))
    const noneAnywhere = searches.every(
      s => s.palindromeGroups === 0 && s.glideGroups === 0,
    )

    const ok =
      cpt.length > 0 &&
      periodSpread > 1e-6 &&
      echo === 0 &&
      chargeDrift === 0 &&
      vacuumPeriod > 0 &&
      palindrome.anisotropy > 2 * glide.anisotropy &&
      noneAnywhere

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the palindromic orbit knit has CPT with the identity coin map and charge conjugation, a reducible period group, exact echo and charge and a periodic vacuum, and a period-averaged anisotropy more than twice the glide orbit knit\'s; and no irreducible period group, palindrome alone or with a glide, exists for any subgroup of any beat stabilizer of the five beat shapes',
      metrics: {
        palindromePeriod: period,
        palindromeGlides: glides.length,
        palindromeGlideShifts: new Set(glides.map(e => e.phase)).size,
        palindromeReversals: reversals.length,
        palindromeCptMirrorPhase: cpt[0]?.phase ?? -1,
        periodGroupOrder: periodGroup.length,
        periodGroupForcedSpread: Number(periodSpread.toFixed(4)),
        echo,
        chargeDrift,
        vacuumPeriod,
        palindromeAveragedAnisotropy: Number(palindrome.anisotropy.toFixed(4)),
        palindromeAveragedAxisSpread: Number(palindrome.axisSpread.toFixed(4)),
        ...Object.fromEntries(
          searches.flatMap(s => [
            [`${s.relaxation}Beats`, s.beats],
            [`${s.relaxation}Stabilizers`, s.stabilizers],
            [`${s.relaxation}LargestStabilizer`, s.largestStabilizer],
            [`${s.relaxation}Subgroups`, s.subgroups],
            [`${s.relaxation}IrreduciblePalindromeGroups`, s.palindromeGroups],
            [`${s.relaxation}IrreducibleGlideAndReversalGroups`, s.glideGroups],
          ]),
        ),
      },
      control: {
        glideOrbitAveragedAnisotropy: Number(glide.anisotropy.toFixed(4)),
        glideOrbitAveragedAxisSpread: Number(glide.axisSpread.toFixed(4)),
        committedAveragedAnisotropy: Number(committed.anisotropy.toFixed(4)),
        committedAveragedAxisSpread: Number(committed.axisSpread.toFixed(4)),
      },
      notes:
        'L2. The fold keeps the beats and their order but not the glide: g carries the forward half two beats on and the backward half two beats back, which is no single shift, so only the beat symmetries survive as glides and the period group is the order-3 group they form, with the identity reversal. The palindrome\'s axis-shell spread stays small (0.034, against 0.030 for the glide orbit knit and 0.252 for the committed knit) while its kernel anisotropy returns to 0.63, so what comes back is mostly off-diagonal; why the diagonal stays balanced is not measured here. The average sits between the glide orbit knit\'s noise floor (0.23) and the committed knit (1.20). The search is the theorem extended to palindromes: every symmetry of a schedule is a glide or a reversal, reversals carry glides to inverses and square to beat symmetries of the plain tone map, and every glide and reversal keeps the sign each beat symmetry acts with, so the period group is <K, g, q> under those constraints, and K is a subgroup of every beat\'s stabilizer. Its first version omitted the sign condition and the plain-tone condition, and found candidates that the ledger of the knit built from them refuted; the conditions were then derived from the refutation, and the ledger is what the search now reproduces (no candidate survives). The tone maps searched are the identity and charge conjugation; the scatter block\'s quadruples are the subject of E-RLT-0050.',
    })
  },
})
