// The momentum weave against the committed rule's acceptance battery, with its momentum and its color.
//
// E-FLD-0022 found the members of the committed rule's family that conserve particle momentum and passed
// every distinct negation-symmetric one through the committed gates. The member run here
// (code/rule/momentum-weave MOMENTUM_WEAVE) is the committed rule with two changes and nothing else: the
// wire table is the hop-free bind table (the create, flip, annihilate cycle kept, the hop removed), and
// the palindromic exchange's condition is widened from "a lone tone on the line's away slot, the other
// line calm" to "a lone tone on either slot of one line, the other line calm or holding a pair". The
// schedule is the committed one.
//
// Measured, each item on the momentum weave and on the committed rule by the same code
// (code/measure/weave-acceptance, the E-FRC-0125 items):
// 1. the battery: reversal and charge, CPT at a mirror phase, the vacuum's period, line-graph components
//    on the vacuum and on a dense background, travel, exact superposition, sheet-quantized walls, and the
//    dressing of a lone love and a lone fear over four periods;
// 2. momentum: the particle momentum P and every one of the twelve line momenta over two periods on a
//    dense state and on a lone love (side 5), exact; the committed rule is the control that breaks both;
// 3. color: the same vibe rule with roles (code/rule/color-local-weave, E-FRC-0124's law) leaks no color
//    from any cell on any beat over 48 beats of a dense side-3 state and runs back exactly; the committed
//    pair table is the control that leaks. The two implementations of the vibe rule are checked equal bit
//    for bit first.
// Gates, fixed before the run: at least as good as the committed rule on every item E-FRC-0125 gates
// except dressing (reversal, charge, CPT, a vacuum period, no more line components on the vacuum or on a
// dense background, exact superposition, quantized walls), at least the committed 12 of 24 directions
// travelling, momentum exact, color exact. Dressing is reported beside the committed rule's and not
// gated, since E-FRC-0136 found no hop-free rule of the family dresses as little as the committed one.
//
// Depth L2: a constructed rule measured against stated gates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { beat } from '@/code/rule/lattice-gas'
import { BIND_MOVE_FORWARD } from '@/code/rule/collision'
import { makeWill, type Will } from '@/code/tone/will'
import { d4BoxCell, d4BoxMesh } from '@/code/substrate/d4-box'
import { meshOpposites } from '@/code/tool/mesh'
import { acceptance, type Acceptance, type ScheduledRule } from '@/code/measure/weave-acceptance'
import {
  colorLocalBeat,
  colorLocalBeatBack,
  colorLocalCollision,
  colorLocalLeaks,
  colorLocalSpec,
  makeColorLocalWeave,
  PAIR_TABLE,
  type ColorLocalSpec,
} from '@/code/rule/color-local-weave'
import { type VibeState } from '@/code/rule/vibe-weave'
import {
  COMMITTED_SPEC,
  lineMomenta,
  momentumOf,
  momentumWeave,
  MOMENTUM_WEAVE,
  type MomentumWeaveSpec,
} from '@/code/rule/momentum-weave'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const BEATS = 48
const SIDE = 5

const ruleOf =
  (spec: MomentumWeaveSpec): ScheduledRule =>
  (opposite, forward) =>
    momentumWeave({ spec, opposite, forward })

const colorSpecOf = (spec: MomentumWeaveSpec, table: typeof PAIR_TABLE): ColorLocalSpec =>
  colorLocalSpec({ tables: [table], swapWhen: (l, w) => spec.fires[l * 9 + w] === 1, palindrome: spec.palindrome })

function dense(mesh: ReturnType<typeof d4BoxMesh>): Will {
  const will = makeWill(mesh)

  for (let i = 0; i < will.data.length; i++) {
    const u = ((i + 1) * GOLDEN * 1.37) % 1

    will.data[i] = u < 0.2 ? -1 : u < 0.8 ? 0 : 1
  }

  return will
}

// the largest drift of P and of any line momentum over BEATS beats
function momentumDrift(spec: MomentumWeaveSpec, start: Will): { p: number; line: number } {
  const opposite = meshOpposites(start.mesh)
  const run = momentumWeave({ spec, opposite })
  const p0 = momentumOf(start.data).p
  const n0 = lineMomenta(start.data, opposite)

  let will = start
  let p = 0
  let line = 0

  for (let t = 0; t < BEATS; t++) {
    will = beat(will, run(t))
    p = Math.max(p, ...momentumOf(will.data).p.map((x, k) => Math.abs(x - (p0[k] ?? 0))))
    line = Math.max(line, ...lineMomenta(will.data, opposite).map((x, L) => Math.abs(x - (n0[L] ?? 0))))
  }

  return { p, line }
}

// color leaks over BEATS beats on a dense side-3 box with roles, and whether running back restores it
function colorCheck(spec: ColorLocalSpec): { leaks: number; reverses: boolean } {
  const weave = makeColorLocalWeave({ side: 3, spec })
  const slots = weave.mesh.cellCount * 24
  const start: VibeState = { vibe: new Int8Array(slots), role: new Int8Array(slots), flow: new Int32Array(slots) }

  for (let i = 0; i < slots; i++) {
    const u = ((i + 1) * GOLDEN * 1.37) % 1

    start.vibe[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
    start.role[i] = Math.floor(((i + 3) * GOLDEN * 1.37 * 9) % 9)
  }

  let s = start
  let leaks = 0

  for (let t = 0; t < BEATS; t++) {
    leaks += colorLocalLeaks(weave, s, t)
    s = colorLocalBeat(weave, s, t)
  }

  for (let t = BEATS - 1; t >= 0; t--) {
    s = colorLocalBeatBack(weave, s, t)
  }

  return {
    leaks,
    reverses:
      s.vibe.every((v, i) => v === start.vibe[i]) && s.role.every((v, i) => v === start.role[i]) && s.flow.every((v, i) => v === start.flow[i]),
  }
}

const flat = (prefix: string, a: Acceptance): Record<string, number> => ({
  [`${prefix}Reverses`]: a.reverses ? 1 : 0,
  [`${prefix}ChargeKept`]: a.chargeKept ? 1 : 0,
  [`${prefix}CptMirrorPhase`]: a.cptPhase,
  [`${prefix}VacuumPeriod`]: a.vacuumPeriod,
  [`${prefix}VacuumLineComponents`]: a.vacuumComponents,
  [`${prefix}DenseLineComponents`]: a.denseComponents,
  [`${prefix}AdditivityWorst`]: a.additivityWorst,
  [`${prefix}WallQuantized`]: a.wallQuantized ? 1 : 0,
  [`${prefix}WallSettledMax`]: a.wallMax,
  [`${prefix}Travellers`]: a.travellers,
  [`${prefix}MeanReach`]: a.meanReach,
  [`${prefix}ProtectedSpecies`]: a.love.protectedSpecies,
  ...Object.fromEntries(a.love.periodLargest.map((x, p) => [`${prefix}LoveSupportPeriod${p + 1}`, x])),
  ...Object.fromEntries(a.fear.periodLargest.map((x, p) => [`${prefix}FearSupportPeriod${p + 1}`, x])),
})

export default experiment({
  id: 'fluids/momentum-weave-acceptance',
  code: 'E-FLD-0023',
  title:
    'the momentum weave, the committed rule with the hop removed and the palindromic exchange widened to a lone tone against a calm or paired line, conserves particle momentum and each of the twelve line momenta exactly and keeps color an exact local law, and does at least as well as the committed rule on every structural acceptance item (reversal, charge, CPT, the vacuum period, one line-graph component on the vacuum and on a dense background against the committed 3 and 1, superposition, walls) with more directions travelling (20 of 24 against 12), at the price of a dressing that spreads the disturbance of a lone tone over most of the box (1,725 slots in the first period and 108,080 of 157,464 in the fourth, against the committed 33 and 1,508)',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the two implementations of the vibe rule agree
    const mesh = d4BoxMesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const mine = momentumWeave({ spec: MOMENTUM_WEAVE, opposite })
    const theirs = colorLocalCollision({ spec: colorSpecOf(MOMENTUM_WEAVE, BIND_MOVE_FORWARD), opposite })

    let a = dense(mesh)
    let b = dense(mesh)
    let identical = true

    for (let t = 0; t < BEATS; t++) {
      a = beat(a, mine(t))
      b = beat(b, theirs(t))
      identical = identical && a.data.every((x, i) => x === b.data[i])
    }

    const weave = acceptance(ruleOf(MOMENTUM_WEAVE))
    const committed = acceptance(ruleOf(COMMITTED_SPEC))

    const lone = (): Will => {
      const will = makeWill(mesh)

      will.data[d4BoxCell({ coordinates: [2, 2, 2, 2], side: SIDE }) * 24 + 5] = 1

      return will
    }
    const weaveDense = momentumDrift(MOMENTUM_WEAVE, dense(mesh))
    const weaveLone = momentumDrift(MOMENTUM_WEAVE, lone())
    const committedDense = momentumDrift(COMMITTED_SPEC, dense(mesh))
    const committedLone = momentumDrift(COMMITTED_SPEC, lone())

    const color = colorCheck(colorSpecOf(MOMENTUM_WEAVE, BIND_MOVE_FORWARD))
    const colorControl = colorCheck(colorSpecOf(COMMITTED_SPEC, PAIR_TABLE))

    const atLeast = (ok: boolean, reference: boolean): boolean => ok || !reference
    const structural =
      atLeast(weave.reverses, committed.reverses) &&
      atLeast(weave.chargeKept, committed.chargeKept) &&
      atLeast(weave.cptPhase >= 0, committed.cptPhase >= 0) &&
      atLeast(weave.vacuumPeriod > 0, committed.vacuumPeriod > 0) &&
      weave.vacuumComponents <= committed.vacuumComponents &&
      weave.denseComponents <= committed.denseComponents &&
      atLeast(weave.additivityWorst < 1e-9, committed.additivityWorst < 1e-9) &&
      atLeast(weave.wallQuantized && weave.wallMax > 0, committed.wallQuantized && committed.wallMax > 0) &&
      weave.travellers >= committed.travellers
    const momentumExact = weaveDense.p === 0 && weaveDense.line === 0 && weaveLone.p === 0 && weaveLone.line === 0
    const controlBreaks = committedDense.p > 0 && committedLone.p > 0
    const colorExact = color.leaks === 0 && color.reverses && colorControl.leaks > 0
    const dressedMore = weave.love.periodLargest.some((x, p) => x > (committed.love.periodLargest[p] ?? 0))

    const ok = identical && structural && momentumExact && controlBreaks && colorExact && dressedMore

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the two implementations agree bit for bit; the momentum weave is at least as good as the committed rule on reversal, charge, CPT, the vacuum period, both line-graph component counts, superposition and walls, and moves at least as many directions; its particle momentum and all twelve line momenta drift by zero on a dense state and a lone love where the committed rule drifts; color leaks from no cell on any beat and the run reverses, where the committed table leaks; and it dresses a lone love more than the committed rule in some period',
      metrics: {
        implementationsIdentical: identical ? 1 : 0,
        ...flat('weave', weave),
        weaveDenseMomentumDrift: weaveDense.p,
        weaveDenseLineMomentumDrift: weaveDense.line,
        weaveLoneMomentumDrift: weaveLone.p,
        weaveLoneLineMomentumDrift: weaveLone.line,
        weaveColorLeaks: color.leaks,
        weaveColorReverses: color.reverses ? 1 : 0,
      },
      control: {
        ...flat('committed', committed),
        committedDenseMomentumDrift: committedDense.p,
        committedDenseLineMomentumDrift: committedDense.line,
        committedLoneMomentumDrift: committedLone.p,
        committedColorLeaks: colorControl.leaks,
      },
      notes:
        'L2, exact, no random numbers. The momentum weave keeps P because every couple's whole action keeps both of its line momenta (the first exchange alone does not, and E-FLD-0021 books it moving out and back in equal measure): the bind table never hops, and the widened exchange always fires twice around the clock (the clock class is closed under the bind table), so a lone tone is never moved off its line. That is also its limit, shown in E-FLD-0022 for the whole family: momentum is conserved line by line, so it is never exchanged between lines, and the rule has momentum but no momentum transport between directions (no viscosity of the E-FLD-0011 kind is possible here). Color is local because the table has no hop and the exchange trades lines first slot to first slot (E-FRC-0124). What the widened exchange does, on the swap couple: when one line holds a lone tone and the other is calm or paired, the pair clock runs on the line without the tone if the tone sits on the wire, and does not run at all if the tone sits on the line. The dressing is the cost, as for every hop-free member (E-FRC-0125, E-FRC-0136).',
    })
  },
})
