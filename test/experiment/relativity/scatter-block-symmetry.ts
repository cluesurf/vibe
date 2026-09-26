// Does the four-line scatter block open the fork? The combined knit will be the head-on turn weave
// (code/rule/scatter-weave HEAD_TURN_SPEC) with the momentum-exchange block of E-FLD-0024 on top: each
// beat runs a set of scatterings on quadruples of lines, then the base collision, then another set
// (S_(c-t), B_t, S_t, with c the base's CPT mirror phase). A quadruple is a larger block than a couple,
// so it might admit beat symmetries the couple census of E-RLT-0048 forbids. Measured four ways.
//
// 1. THE SCATTER KNIT ITSELF. The full ledger (1152 coin maps, 6 tone maps, every shift and mirror
//    phase): its glides, its reversals (CPT), its period group and whether that acts irreducibly.
// 2. BEAT BY BEAT. Each of the 24 beats' own stabilizer with the scatter sets, against the same beat of
//    the head-on base alone, both tested on states that make the beat's scatterings fire
//    (moveFiringStates: the dense fills almost never do, so a ledger without them is blind to the
//    block), and, for each symmetry, whether it carries the beat's two scatter sets to themselves
//    (code/measure/glide-group invariantScatterSets). If the block admitted new symmetries, some
//    composite stabilizer would leave its base's.
// 3. THE ARCHITECTURE. A scatter set is added on top of a beat's couples, so a map that keeps each part
//    of the composite beat keeps its base beat: every composite beat's stabilizer lies inside its base
//    beat's, and the block can only remove symmetry. The base beat shapes are the head-on one ('headOn':
//    index orientation, one swap couple whose condition reads the same both ways) and its relaxation
//    ('headOnOrbit': free orientation, swaps on whole orbits of couples). For both, the period-group search
//    of E-RLT-0049 (glides and reversals, every subgroup of every beat stabilizer) finds whether any
//    irreducible period group exists. The one assumption, stated: a symmetry of the composite that keeps
//    neither part alone is not counted by the bound; part 2 is the direct check that on the actual knit no
//    such symmetry exists.
// 4. THE RESPONSE. The long-wave kernel of E-RLT-0045 at sides 9 and 13 on the torus.
//
// Gates: the scatter knit keeps CPT (a reversal with the identity coin map and charge conjugation); its
// period group is reducible; every beat's stabilizer lies inside its base beat's and every one of its
// symmetries keeps both scatter sets (the assumption of part 3, checked on the knit); the search finds no
// irreducible period group for either head-on shape; and the
// response stays anisotropic, above 0.4 at both sides (ten times the worst streaming floor of E-RLT-0045,
// 0.04, which a symmetry-forced isotropy would sit at).
//
// Depth L2: the combined knit measured directly, and an exhaustive bound for its whole architecture.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  permutationOrder,
  weylF4DirectionPermutations,
} from '@/code/measure/coin-symmetry'
import { linearMapOf } from '@/code/substrate/d4-box'
import {
  HEAD_TURN_SPEC,
  scatterCollision,
  scatterSchedule,
  type ScatterWeaveSpec,
} from '@/code/rule/scatter-weave'
import { colorLocalCollision } from '@/code/rule/color-local-weave'
import {
  CHARGE_CONJUGATION,
  moveFiringStates,
  symmetryLedger,
} from '@/code/measure/rule-symmetry-ledger'
import {
  chargeWaveResponse,
  curveSpread,
  forcedIsotropySpread,
  kernelParts,
  responseKernel,
  unitSamples,
} from '@/code/measure/coarse-modes'
import {
  invariantScatterSets,
  matrixGroupClosure,
  periodGroupSearch,
  type Matrix4,
} from '@/code/measure/glide-group'

const PERIOD = 24
const MIRROR = 23
const SIDES = [9, 13]
const FLOOR_MULTIPLE = 10
const STREAMING_FLOOR = 0.04
const GENERIC = [0.31, -0.74, 0.52, 0.29]
const AXES = [0, 1, 2, 3].map(a => [0, 1, 2, 3].map(k => (k === a ? 1 : 0)))

export default experiment({
  id: 'relativity/scatter-block-symmetry',
  code: 'E-RLT-0050',
  title:
    'the four-line scatter block does not open the fork: on the head-on turn base every beat keeps exactly the symmetries its base beat has (2 on twenty beats, 4 on four) and every base symmetry keeps the beat\'s scatter sets, so the block adds none and removes none; the combined knit keeps CPT with a period group of order 2 (reducible) and a long-wave anisotropy of 0.84 and 0.81 at sides 9 and 13; and for the head-on beat shape and its free-orientation, orbit-swap relaxation no irreducible period group exists over every subgroup of every beat stabilizer, so a block added on top of those beats cannot make one',
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
    const sets = scatterSchedule('pair')
    const spec: ScatterWeaveSpec = { base: HEAD_TURN_SPEC, mirror: MIRROR, sets }
    const forward = scatterCollision({ spec, opposite })
    const inverse = scatterCollision({ spec, opposite, forward: false })
    const baseForward = colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite })
    const baseInverse = colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite, forward: false })

    // 1. the knit's own symmetry, tested also on states that make every scattering fire (the dense fills
    // alone almost never do: a scattering needs two lone tones going into two wholly calm lines)
    const allMoves = sets.flat()
    const ledger = symmetryLedger({
      forward,
      inverse,
      period: PERIOD,
      permutations,
      degree: 24,
      quickDense: 32,
      thoroughDense: 512,
      extraStates: moveFiringStates({ moves: allMoves, degree: 24 }),
    })
    const identityIndex = permutations.findIndex(p => p.every((x, i) => x === i))
    const cpt = ledger.filter(
      e => e.kind === 'reversal' && e.p === identityIndex && e.tau === CHARGE_CONJUGATION,
    )
    const periodGroup = matrixGroupClosure(ledger.map(e => matrices[e.p] ?? []))
    const periodSpread = spread(periodGroup)

    // 2. beat by beat, each beat tested on the states that fire its own scatterings
    const stabilizerOf = (
      beat: ReturnType<typeof forward>,
      back: ReturnType<typeof forward>,
      moves: readonly (readonly [number, number, number, number])[],
    ) =>
      symmetryLedger({
        forward: () => beat,
        inverse: () => back,
        period: 1,
        permutations,
        degree: 24,
        quickDense: 32,
        thoroughDense: 256,
        extraStates: moveFiringStates({ moves, degree: 24 }),
      }).filter(e => e.kind === 'forward')
    const beats = Array.from({ length: PERIOD }, (_, t) => {
      const before = sets[(((MIRROR - t) % PERIOD) + PERIOD) % PERIOD] ?? []
      const after = sets[t] ?? []
      const moves = [...before, ...after]
      const composite = stabilizerOf(forward(t), inverse(t), moves)
      const base = stabilizerOf(baseForward(t), baseInverse(t), moves)
      const baseKeys = new Set(base.map(e => `${e.p}:${e.tau}`))
      const keeps = (p: number): boolean =>
        invariantScatterSets({ permutation: permutations[p] ?? [], sets: [before, after] })
          .length === 2

      return {
        composite: composite.length,
        base: base.length,
        insideBase: composite.every(e => baseKeys.has(`${e.p}:${e.tau}`)),
        compositeKeepsSets: composite.every(e => keeps(e.p)),
        baseBreakingSets: base.filter(e => !keeps(e.p)).length,
      }
    })
    const insideBase = beats.every(b => b.insideBase)
    const compositeKeepsSets = beats.every(b => b.compositeKeepsSets)

    // 3. the architecture
    const searches = (['headOn', 'headOnOrbit'] as const).map(relaxation => ({
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
    const noneAnywhere = searches.every(s => s.palindromeGroups === 0 && s.glideGroups === 0)

    // 4. the response
    const responses = SIDES.map(side => {
      const mesh = d4Mesh({ side })
      const records = chargeWaveResponse({
        mesh,
        side,
        schedule: scatterCollision({ spec, opposite: meshOpposites(mesh) }),
        directions: roots,
        modes: AXES,
        epsilon: 0.1,
        warm: 48,
        beats: 2 * side,
      })
      const parts = kernelParts(responseKernel(records))

      return {
        side,
        anisotropy: parts.anisotropic / parts.isotropic,
        axisSpread: curveSpread(records.map(r => r.relaxation)),
        ratio: parts.selfDual / parts.antiSelfDual,
      }
    })
    const anisotropic = responses.every(r => r.anisotropy > FLOOR_MULTIPLE * STREAMING_FLOOR)

    const ok =
      cpt.length > 0 &&
      periodSpread > 1e-6 &&
      insideBase &&
      compositeKeepsSets &&
      noneAnywhere &&
      anisotropic

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the scatter knit keeps CPT and has a reducible period group, every beat\'s stabilizer (tested on states that fire its scatterings) lies inside its base beat\'s and keeps both of the beat\'s scatter sets, no irreducible period group exists for the head-on beat shape or its relaxation, and the response stays above 0.4 at sides 9 and 13',
      metrics: {
        ledgerEntries: ledger.length,
        glides: ledger.filter(e => e.kind === 'forward').length,
        reversals: ledger.filter(e => e.kind === 'reversal').length,
        cptMirrorPhase: cpt[0]?.phase ?? -1,
        periodGroupOrder: periodGroup.length,
        periodGroupForcedSpread: Number(periodSpread.toFixed(4)),
        largestBeatStabilizer: Math.max(...beats.map(b => b.composite)),
        beatsWhereBlockRemovedSymmetry: beats.filter(b => b.composite < b.base).length,
        baseSymmetriesTheBlockBreaks: beats.reduce((s, b) => s + b.baseBreakingSets, 0),
        baseSymmetriesTheBlockRemoves: beats.reduce((s, b) => s + (b.base - b.composite), 0),
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
        ...Object.fromEntries(
          responses.flatMap(r => [
            [`anisotropySide${r.side}`, Number(r.anisotropy.toFixed(4))],
            [`axisSpreadSide${r.side}`, Number(r.axisSpread.toFixed(4))],
            [`selfDualRatioSide${r.side}`, Number(r.ratio.toFixed(4))],
          ]),
        ),
      },
      control: {
        anisotropyThreshold: FLOOR_MULTIPLE * STREAMING_FLOOR,
        baseLargestBeatStabilizer: Math.max(...beats.map(b => b.base)),
      },
      notes:
        'L2. The two symmetries the combined knit keeps are the identity and the point inversion with charge conjugation (the head-on condition and the lone scattering condition both read the same with every line reversed and every tone negated); its reversals are CPT at the base\'s mirror phase. The four beats with a stabilizer of 4 add an order-2 map the head-on swap admits and the committed swap does not; they are still far from an irreducible group, and the search shows no subgroup of any head-on beat stabilizer, even with free orientations and orbit swaps (stabilizers up to 16), extends to an irreducible period group with a CPT reversal. A composite symmetry that keeps neither part alone is outside the bound; part 2 finds none on the actual knit, where every composite stabilizer equals its base\'s. A differently designed block (one that replaces the couples instead of sitting on them) is outside this experiment.',
    })
  },
})
