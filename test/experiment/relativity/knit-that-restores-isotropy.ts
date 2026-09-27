// Which knit restores rotation symmetry at coarse scale? A group acting irreducibly on R^4 forces every
// symmetric rank-2 invariant to be isotropic, and the time shifts of a glide cost nothing, so a knit
// whose glide symmetry acts irreducibly gets coarse rank-2 isotropy for free (averaged over a glide
// cycle). E-RLT-0045 found the committed knit anisotropic at every scale. This asks why, and what the
// smallest fix is.
//
// 1. THE CANDIDATES. The committed turning weave, the color turn weave (E-FRC-0136), the momentum
//    weave (E-FLD-0023) and the round robin folded into the 24-beat palindrome on the color turn spec
//    (E-FRC-0152): the full ledger, forward (every time shift, the glides) and reversal
//    (code/measure/rule-symmetry-ledger), the group the glides' coin parts generate and whether it
//    acts irreducibly (code/measure/coarse-modes forcedIsotropySpread at rank 2), every beat's own
//    stabilizer, the vacuum period, the mean creation arrow (the current a beat makes from an empty
//    dock, averaged over the period), and the long-wave response of E-RLT-0045 at sides 9 and 13.
// 2. WHY NOT. code/measure/glide-group beatStabilizerCensus: over every conjugacy class of W(F4), both
//    orientation signs and all 665,280 ordered couple partitions with a swap couple, which non-central
//    coin maps leave some beat of the committed architecture invariant. If only one class does, and
//    no product of two, every beat's stabilizer has order at most 2, every glide group is a central
//    extension of a cyclic group, hence abelian, hence reducible: NO schedule of this architecture
//    restores isotropy, the round robin included.
// 3. THE SMALLEST CHANGE. The same census with the beat relaxed in two ways: each line carries its own
//    orientation, then the swap may run on a whole orbit of couples. Then every irreducible group
//    <k, g> with k an admissible beat symmetry and g normalizing it (glide-group
//    irreducibleGlideCandidates), its Schur type and invariant two-forms (whether chirality can coexist
//    with isotropy), and whether any coin map could be its CPT partner (reversalPartners).
// 4. THE ORBIT KNIT. The first candidate built as a knit (code/rule/orbit-knit): the pair of k-invariant
//    beats whose swaps, carried by g, connect all twelve lines and whose couples meet the most line
//    pairs, run as beat t = 2u + j: g^u B_j g^-u. Its ledger, reversal and charge on the D4 box, vacuum
//    period, and the long-wave response averaged over one glide cycle of start phases (8 phases, two
//    beats apart) at sides 9 and 13 on the D4 box, against the committed knit averaged the same way at
//    side 9. The averaged kernel is split into the part the glide group allows and the part it forbids.
//
// Gates: every candidate's glide group reducible, beat stabilizers of order at most 2; the index census
// finds exactly one admissible class; the relaxed census finds irreducible groups, none with a CPT
// partner; the orbit knit's glide group irreducible, reversal exact, charge exact, its vacuum periodic
// at its period, its swaps connected, its phase-averaged anisotropy under half the committed knit's and
// its axis-shell spread under 0.1 at side 9; and the round robin cannot be had with it: the most line
// pairs any set of its invariant beats can couple is under 66.
//
// Depth L2: exhaustive group theory and measured responses of constructed knits.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
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
import { colorTurnWeave, COLOR_TURN_SPEC } from '@/code/rule/color-turn-weave'
import { MOMENTUM_WEAVE, momentumWeave } from '@/code/rule/momentum-weave'
import { foldRoundRobin } from '@/code/rule/steered-knit'
import { colorLocalCollision } from '@/code/rule/color-local-weave'
import {
  denseCellStates,
  loneCellStates,
  symmetryLedger,
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
  allowedAndForbidden,
  beatStabilizerCensus,
  conjugacyClasses,
  irreducibleGlideCandidates,
  matrixGroupClosure,
  reversalPartners,
  type Matrix4,
} from '@/code/measure/glide-group'
import {
  bestBeatPair,
  carriedStructure,
  orbitBeatFor,
  orbitKnit,
  orbitKnitPeriod,
} from '@/code/rule/orbit-knit'
import { makeWill, Will } from '@/code/tone/will'
import { collide, stream, streamInverse } from '@/code/rule/lattice-gas'
import { goldenFill } from '@/code/measure/slot-statistics'

const PERIOD = 24
const SIDES = [9, 13]
const ORBIT_SIDES = [9, 13]
const PHASES = 8
const WARM = 48
const GENERIC = [0.31, -0.74, 0.52, 0.29]
const AXES = [0, 1, 2, 3].map(a => [0, 1, 2, 3].map(k => (k === a ? 1 : 0)))

type Knit = {
  forward: (t: number) => Collision
  inverse: (t: number) => Collision
  period: number
}

function vacuumPeriod(schedule: (t: number) => Collision, period: number): number {
  const vacuum = vacuumCellTrajectory({ schedule, beats: 3 * period + 48, degree: 24 })

  for (let p = 1; p <= 2 * period; p++) {
    if (
      vacuum
        .slice(0, period)
        .every((v, t) => v.every((x, i) => x === vacuum[t + p]?.[i]))
    ) {
      return p
    }
  }

  return -1
}

// the long-wave kernel of E-RLT-0045 on the axis waves, averaged over `phases` start phases `step`
// beats apart, on the torus or the D4 box
function phaseAveragedKernel(input: {
  side: number
  schedule: (t: number) => Collision
  phases: number
  step: number
  box: boolean
}): { kernel: number[][][]; axisSpread: number } {
  const { side, schedule, phases, step, box } = input
  const mesh = box ? d4BoxMesh({ side }) : d4Mesh({ side })
  const positionOf = box
    ? (dock: number): number[] => d4Vector(d4BoxCoordinates({ cell: dock, side }))
    : undefined
  let sum: number[][][] | undefined
  let curves: number[][] | undefined

  for (let j = 0; j < phases; j++) {
    const records = chargeWaveResponse({
      mesh,
      side,
      schedule,
      directions: rootsD4(),
      modes: AXES,
      epsilon: 0.1,
      warm: WARM + step * j,
      beats: 2 * side,
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

  return {
    kernel: (sum ?? []).map(m => m.map(row => row.map(x => x / phases))),
    axisSpread: curveSpread((curves ?? []).map(c => c.map(x => x / phases))),
  }
}

export default experiment({
  id: 'relativity/knit-that-restores-isotropy',
  code: 'E-RLT-0048',
  title:
    'no schedule of the committed architecture can restore rotation symmetry, since only one non-central coin map (minus a reflection) leaves any of its beats invariant, so every glide group is abelian and reducible, as measured for the committed, color turn, momentum and round-robin knits; letting each line carry its own orientation and the swap run on an orbit of couples admits 24 irreducible glide groups of order 24, each of complex type with one invariant two-form of one handedness (chirality allowed beside isotropy), none with a CPT partner; the orbit knit built from one keeps reversal, charge and a periodic vacuum and its glide-averaged long-wave response is isotropic within the noise where the committed knit\'s is not, but it has no CPT and can couple at most 54 of the 66 line pairs, so isotropy by symmetry pulls against both CPT and the round robin',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const opposite = meshOpposites(d4Mesh({ side: 5 }))
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

    // 1. the candidates
    const candidates: Record<string, Knit> = {
      committed: {
        forward: turningWeave({ opposite }),
        inverse: turningWeave({ opposite, forward: false }),
        period: PERIOD,
      },
      colorTurn: {
        forward: colorTurnWeave({ opposite }),
        inverse: colorTurnWeave({ opposite, forward: false }),
        period: PERIOD,
      },
      momentum: {
        forward: momentumWeave({ spec: MOMENTUM_WEAVE, opposite }),
        inverse: momentumWeave({ spec: MOMENTUM_WEAVE, opposite, forward: false }),
        period: PERIOD,
      },
      roundRobin: {
        forward: colorLocalCollision({ spec: foldRoundRobin(COLOR_TURN_SPEC), opposite }),
        inverse: colorLocalCollision({
          spec: foldRoundRobin(COLOR_TURN_SPEC),
          opposite,
          forward: false,
        }),
        period: PERIOD,
      },
    }
    const candidateRows = Object.entries(candidates).map(([name, knit]) => {
      const ledger = symmetryLedger({
        forward: knit.forward,
        inverse: knit.inverse,
        period: knit.period,
        permutations,
        degree: 24,
        quickDense: 32,
        thoroughDense: 512,
      })
      const glides = ledger.filter(e => e.kind === 'forward')
      const group = matrixGroupClosure(glides.map(e => matrices[e.p] ?? []))
      const stabilizers = Array.from({ length: knit.period }, (_, t) => {
        const beat = knit.forward(t)
        const back = knit.inverse(t)

        return symmetryLedger({
          forward: () => beat,
          inverse: () => back,
          period: 1,
          permutations,
          degree: 24,
          quickDense: 32,
          thoroughDense: 256,
        }).filter(e => e.kind === 'forward').length
      })
      const arrow = [0, 0, 0, 0]

      for (let t = 0; t < knit.period; t++) {
        const dock = new Int8Array(24)

        knit.forward(t)(dock, 0, 24)
        dock.forEach((tone, d) => {
          for (let a = 0; a < 4; a++) {
            arrow[a] = (arrow[a] ?? 0) + (tone * (roots[d]?.[a] ?? 0)) / knit.period
          }
        })
      }

      const responses = SIDES.map(side => {
        const { kernel } = phaseAveragedKernel({
          side,
          schedule: knit.forward,
          phases: 1,
          step: 0,
          box: false,
        })
        const parts = kernelParts(kernel)

        return {
          anisotropy: parts.anisotropic / parts.isotropic,
          ratio: parts.selfDual / parts.antiSelfDual,
        }
      })

      return {
        name,
        glides: glides.length,
        reversals: ledger.length - glides.length,
        groupOrder: group.length,
        forcedSpread: spread(group),
        largestBeatStabilizer: Math.max(...stabilizers),
        vacuumPeriod: vacuumPeriod(knit.forward, knit.period),
        arrow: Math.hypot(...arrow),
        responses,
      }
    })
    const candidatesReducible = candidateRows.every(
      r => r.forcedSpread > 1e-6 && r.largestBeatStabilizer <= 2,
    )

    // 2. why not: the census of the committed architecture
    const census = (relaxation: 'index' | 'free' | 'orbit') =>
      beatStabilizerCensus({ permutations, opposite, traceOf, orderOf, relaxation })
    const indexRows = census('index').filter(r => r.invariantBeats > 0)
    const freeRows = census('free').filter(r => r.invariantBeats > 0)
    const orbitRows = census('orbit').filter(r => r.invariantBeats > 0)
    const onlyOneClass = new Set(indexRows.map(r => r.classIndex)).size === 1

    // 3. the smallest change: irreducible glide groups under the orbit relaxation
    const { classOf } = conjugacyClasses(permutations)
    const admissible = new Set(
      orbitRows.filter(r => r.eta === 1).map(r => r.classIndex),
    )
    const glideGroups = irreducibleGlideCandidates({
      matrices,
      permutations,
      admissible: i => admissible.has(classOf[i] ?? -1),
      forcedSpread: spread,
      maxOrder: 96,
    })
    const partners = glideGroups.map(c =>
      reversalPartners({
        permutations,
        k: permutations[c.k] ?? [],
        g: permutations[c.g] ?? [],
      }),
    )
    const coverage = glideGroups.map(c => {
      const beats = orbitBeatFor({
        k: permutations[c.k] ?? [],
        glide: permutations[c.g] ?? [],
        opposite,
        limit: 1_000_000,
        components: 12,
      })
      const union = new Set<number>()

      for (const s of carriedStructure({
        beats,
        glide: permutations[c.g] ?? [],
        opposite,
        powers: 8,
      })) {
        for (const p of s.pairs) {
          union.add(p)
        }
      }

      return { beats, pairs: union.size }
    })

    // 4. the orbit knit from the first candidate
    const first = glideGroups[0]
    const k = permutations[first?.k ?? 0] ?? []
    const g = permutations[first?.g ?? 0] ?? []
    const pair = bestBeatPair({
      beats: coverage[0]?.beats ?? [],
      glide: g,
      opposite,
      powers: 8,
    })
    const states = [
      ...loneCellStates(24),
      ...denseCellStates({ count: 64, offset: 0, degree: 24 }),
    ]
    const powers = pair
      ? Math.max(
          orbitKnitPeriod({ beat: pair.first, glide: g, opposite, states }),
          orbitKnitPeriod({ beat: pair.second, glide: g, opposite, states }),
        )
      : 1
    const orbitPeriod = 2 * powers
    const beats = pair ? [pair.first, pair.second] : []
    const orbit: Knit = {
      forward: orbitKnit({ beat: beats, glide: g, period: orbitPeriod, opposite }),
      inverse: orbitKnit({ beat: beats, glide: g, period: orbitPeriod, opposite, forward: false }),
      period: orbitPeriod,
    }
    const orbitLedger = symmetryLedger({
      forward: orbit.forward,
      inverse: orbit.inverse,
      period: orbit.period,
      permutations,
      degree: 24,
      quickDense: 32,
      thoroughDense: 512,
    })
    const orbitGlides = orbitLedger.filter(e => e.kind === 'forward')
    const orbitGroup = matrixGroupClosure(orbitGlides.map(e => matrices[e.p] ?? []))
    const orbitReversals = orbitLedger.length - orbitGlides.length

    // reversal and charge on the D4 box
    const boxSide = ORBIT_SIDES[0] ?? 9
    let will: Will = makeWill(d4BoxMesh({ side: boxSide }))

    goldenFill({ will, love: 0.3, fear: 0.3 })

    const start = Int8Array.from(will.data)
    const charge = (d: Int8Array): number => d.reduce((a, b) => a + b, 0)

    for (let t = 0; t < 2 * orbit.period; t++) {
      collide(will, orbit.forward(t))
      will = stream(will)
    }

    const chargeDrift = charge(will.data) - charge(start)

    for (let t = 2 * orbit.period - 1; t >= 0; t--) {
      will = streamInverse(will)
      collide(will, orbit.inverse(t))
    }

    const echo = will.data.reduce((a, x, i) => a + (x !== start[i] ? 1 : 0), 0)
    const orbitVacuum = vacuumPeriod(orbit.forward, orbit.period)
    const swapParent = Array.from({ length: 12 }, (_, i) => i)
    const findSwap = (x: number): number =>
      swapParent[x] === x ? x : (swapParent[x] = findSwap(swapParent[x] ?? x))

    for (const s of carriedStructure({ beats, glide: g, opposite, powers })) {
      for (const [a, b] of s.swapEdges) {
        swapParent[findSwap(a)] = findSwap(b)
      }
    }

    const swapsConnected =
      new Set(Array.from({ length: 12 }, (_, l) => findSwap(l))).size === 1

    // the glide-averaged response, and its allowed and forbidden parts
    const averaged = ORBIT_SIDES.map(side => {
      const { kernel, axisSpread } = phaseAveragedKernel({
        side,
        schedule: orbit.forward,
        phases: PHASES,
        step: 2,
        box: true,
      })
      const parts = kernelParts(kernel)
      let allowedAnti = 0
      let forbiddenAnti = 0
      let allowedSelfDual = 0
      let allowedAntiSelfDual = 0

      for (const m of kernel) {
        const split = allowedAndForbidden({ group: orbitGroup, response: m })

        allowedAnti += split.antisymmetricAllowed ** 2
        forbiddenAnti += split.antisymmetricForbidden ** 2
        allowedSelfDual += split.allowedSelfDual ** 2
        allowedAntiSelfDual += split.allowedAntiSelfDual ** 2
      }

      return {
        side,
        anisotropy: parts.anisotropic / parts.isotropic,
        axisSpread,
        antisymmetricOverIsotropic:
          Math.hypot(parts.selfDual, parts.antiSelfDual) / parts.isotropic,
        allowedAnti: Math.sqrt(allowedAnti) / parts.isotropic,
        forbiddenAnti: Math.sqrt(forbiddenAnti) / parts.isotropic,
        allowedSelfDual: Math.sqrt(allowedSelfDual),
        allowedAntiSelfDual: Math.sqrt(allowedAntiSelfDual),
      }
    })
    const committedAveraged = (() => {
      const { kernel, axisSpread } = phaseAveragedKernel({
        side: ORBIT_SIDES[0] ?? 9,
        schedule: turningWeave({ opposite: meshOpposites(d4BoxMesh({ side: ORBIT_SIDES[0] ?? 9 })) }),
        phases: PHASES,
        step: 2,
        box: true,
      })
      const parts = kernelParts(kernel)

      return { anisotropy: parts.anisotropic / parts.isotropic, axisSpread }
    })()
    const small = averaged[0]
    const orbitIsotropic =
      !!small &&
      small.anisotropy < 0.5 * committedAveraged.anisotropy &&
      small.axisSpread < 0.1

    const ok =
      candidatesReducible &&
      onlyOneClass &&
      glideGroups.length > 0 &&
      partners.every(n => n === 0) &&
      spread(orbitGroup) < 1e-12 &&
      orbitReversals === 0 &&
      echo === 0 &&
      chargeDrift === 0 &&
      orbitVacuum > 0 &&
      orbit.period % orbitVacuum === 0 &&
      swapsConnected &&
      orbitIsotropic &&
      coverage.every(c => c.pairs < 66)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the four candidate knits have reducible glide groups and beat stabilizers of order at most 2; the committed architecture admits exactly one class of non-central beat symmetry; the relaxed beat admits irreducible glide groups, none with a CPT partner; the orbit knit built from the first has an irreducible glide group, no reversal symmetry, exact echo and charge, a periodic vacuum and connected swaps, and its glide-averaged long-wave anisotropy is under half the committed knit\'s with an axis spread under 0.1 at side 9; and no set of its invariant beats couples all 66 line pairs',
      metrics: {
        ...Object.fromEntries(
          candidateRows.flatMap(r => [
            [`${r.name}Glides`, r.glides],
            [`${r.name}GlideGroupOrder`, r.groupOrder],
            [`${r.name}ForcedSpread`, Number(r.forcedSpread.toFixed(4))],
            [`${r.name}LargestBeatStabilizer`, r.largestBeatStabilizer],
            [`${r.name}VacuumPeriod`, r.vacuumPeriod],
            [`${r.name}Arrow`, Number(r.arrow.toFixed(4))],
            ...r.responses.flatMap((x, k) => [
              [`${r.name}AnisotropySide${SIDES[k]}`, Number(x.anisotropy.toFixed(4))],
              [`${r.name}SelfDualRatioSide${SIDES[k]}`, Number(x.ratio.toFixed(4))],
            ]),
          ]),
        ),
        indexClassesWithInvariantBeats: indexRows.length,
        freeClassesWithInvariantBeats: freeRows.length,
        orbitClassesWithInvariantBeats: orbitRows.length,
        irreducibleGlideGroups: glideGroups.length,
        irreducibleGlideGroupOrder: first?.order ?? -1,
        commutantDimension: first?.commutant ?? -1,
        invariantTwoForms: first?.twoForms.total ?? -1,
        groupsWithSelfDualForm: glideGroups.filter(c => c.twoForms.selfDual > 0).length,
        groupsWithAntiSelfDualForm: glideGroups.filter(c => c.twoForms.antiSelfDual > 0).length,
        groupsWithCptPartner: partners.filter(n => n > 0).length,
        mostLinePairsCoupled: Math.max(...coverage.map(c => c.pairs)),
        orbitPeriod: orbit.period,
        orbitVacuumPeriod: orbitVacuum,
        orbitGlides: orbitGlides.length,
        orbitGlideGroupOrder: orbitGroup.length,
        orbitForcedSpread: Number(spread(orbitGroup).toExponential(2)),
        orbitReversals,
        orbitEcho: echo,
        orbitChargeDrift: chargeDrift,
        orbitLinePairsCoupled: pair?.pairs ?? -1,
        ...Object.fromEntries(
          averaged.flatMap(a => [
            [`orbitAveragedAnisotropySide${a.side}`, Number(a.anisotropy.toFixed(4))],
            [`orbitAveragedAxisSpreadSide${a.side}`, Number(a.axisSpread.toFixed(4))],
            [`orbitAntisymmetricOverIsotropicSide${a.side}`, Number(a.antisymmetricOverIsotropic.toFixed(4))],
            [`orbitAllowedAntisymmetricSide${a.side}`, Number(a.allowedAnti.toFixed(4))],
            [`orbitForbiddenAntisymmetricSide${a.side}`, Number(a.forbiddenAnti.toFixed(4))],
            [`orbitAllowedSelfDualSide${a.side}`, Number(a.allowedSelfDual.toFixed(4))],
            [`orbitAllowedAntiSelfDualSide${a.side}`, Number(a.allowedAntiSelfDual.toFixed(4))],
          ]),
        ),
      },
      control: {
        committedAveragedAnisotropySide9: Number(committedAveraged.anisotropy.toFixed(4)),
        committedAveragedAxisSpreadSide9: Number(committedAveraged.axisSpread.toFixed(4)),
        indexAdmissibleClass: indexRows[0]?.classIndex ?? -1,
        indexAdmissibleTrace: indexRows[0]?.trace ?? 99,
        indexAdmissibleEta: indexRows[0]?.eta ?? 0,
      },
      notes: `L2. Beat stabilizer sizes and reversal counts are exact over the 1152 coin maps and six tone maps. The obstruction is in the beat, not the schedule: a calm-moving table read in index orientation plus a slot-for-slot swap leave room for one non-central symmetry at most, minus a root reflection with charge conjugation, which only a swap condition symmetric under reversing a line can keep. The point inversion with charge conjugation is the other possible beat symmetry, central and useless for irreducibility, and the momentum weave's beats keep exactly it (stabilizer 2 on every beat); the two can never stand together, since their product is a plain reflection, which leaves no beat invariant, so every beat's stabilizer has order at most 2. So no reordering of partitions, no walk and no round robin can make a glide group irreducible. The fix changes the beat, and it costs two things the committed rule has. CPT: a reversal must carry the glide into its inverse, and for every irreducible group found no coin map does, so an isotropic knit of this kind is not CPT symmetric, whatever its tone maps. The round robin: the invariant beats of such a group couple at most ${Math.max(...coverage.map(c => c.pairs))} of the 66 line pairs, so every line cannot meet every other. Chirality: every irreducible group found is of complex type with exactly one invariant two-form, of one handedness, so isotropy and a single-handed transverse response are compatible in principle, which is the shape of the weak pattern; the orbit knit does not realize it measurably: its allowed (anti-self-dual) antisymmetric part is 0.104 and 0.055 of the isotropic part at sides 9 and 13, below the forbidden part (0.140 and 0.149), which is noise by construction, and the allowed self-dual part is exactly zero as the group demands. The same noise sets the floor of the isotropy: the averaged kernel\'s traceless part (0.23 and 0.21) is all forbidden and matches the forbidden antisymmetric part scaled to nine components rather than six, and it does not fall from side 9 to 13, the background-to-background variation E-RLT-0046 found, not a lattice term. Averaging over start phases alone does not make a response isotropic: the committed knit keeps its anisotropy after the same average. The orbit knit runs on the D4 box, since its glide is a triality-type element that the integer torus does not carry.`,
    })
  },
})
