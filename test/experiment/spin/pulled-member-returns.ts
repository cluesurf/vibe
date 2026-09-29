// CAN A PART PULLED FROM A KNOT COME BACK TO IT? (E-SPN-0177). The constraint "a part pulled from a knot can come back to
// it" is broken on the knit, for two reasons. Under the turning weave's orientation a lone vibe stays in a half-space and
// drifts one way (E-FRC-0130). On the adopted knit a lone vibe goes straight along its root (E-RLT-0069), and two vibes
// cost exactly 2 over the vacuum at every separation (E-SPN-0068), so nothing pulls a part back.
//
// DIAGNOSIS (the causes, on the knit). (1) A classical lone vibe keeps its root: its velocity is its momentum, so a part
// moving away keeps moving away. (2) Nothing depends on the separation: with a flat energy there is no force to turn it
// round. A part comes back only if it can move in every direction and something ties it to its partner.
//
// THE CHANGE, the smallest the notes hold. The register rule (E-SPN-0160) fixes (1): a member is a quantum walker whose
// amplitude spreads in every direction (the Dirac band, isotropic). The singlet-pair string of E-SPN-0162 fixes (2): a
// phase u^2 rho^min(V, 8) on the S S pair in beat 1 and its conjugate on the D D pair in beat 2, rho = ringUnit(-9, 6),
// exact in Z[w][1/42], which keeps the pair exactly inside W (x) W (256 states a relative site) and holds a light bound
// level (E_L 1.978945, E-SPN-0162).
//
// DERIVED BEFORE THE RUN.
// 1. A PULL. Set the pair at string length V0 past the level's own size (mean V 3.9, profile peaked at V = 4, E-SPN-0162), at rest:
//    an s-wave shell exp(-((V - V0) / 0.7)^2) with both members in S and the registers paired (shellStart). The knot's
//    region is V <= 4, where the level holds 0.95 of its coordinate weight.
// 2. WHAT STAYS IS THE BOUND PART. Write the pulled state as c_b b + r, b the bound level and r orthogonal to it (in the
//    Gram metric). b only turns its phase. The long-time average of the knot-region weight is then at least |c_b|^2
//    W_b(V <= 4) minus cross terms that average out, and the rest of r leaves through the ball's edge (it absorbs) or
//    stays in other bound levels, which only adds. So a pulled pair with |c_b|^2 W_b above its own starting knot weight
//    comes BACK: its knot-region weight rises from where the pull left it.
// 3. WITHOUT THE STRING NOTHING STAYS. With tau = 0 the pair has no bound level: its weight leaves the knot region and the
//    ball, as two free members do.
// 4. THE LIMIT, WHICH THIS FILE DOES NOT MOVE. The string is capped at V = 8: past the cap every channel is flat, so a pair
//    pulled past it with more than the well's depth separates (a finite well, not confinement). Uncapped, the D D band
//    crosses the level at V* = 9.37 (E-SPN-0162 H1) and the pair leaks there, long-lived but not exact; any string that
//    keeps rising meets that ladder (E-SPN-0161). So "comes back from any distance" and "holds exactly" pull against each
//    other on this rule: a real tension, measured in E-SPN-0161 and E-SPN-0162, not removed here.
//
// PREDICTED: R1 to R3 hold at the pulls where |c_b|^2 W_b exceeds the starting knot weight; the level reads as E-SPN-0162's.
//
// GATES, fixed before the gate run (after probe 1, disclosed below).
//  R1 IT COMES BACK. With the string, from each pull V0 in the plan, the mean knot-region weight W(V <= 4) over cycles 33
//     to 64 is at least RETURN_RATIO times its value at cycle 0.
//  R2 THE BOUND PART STAYS. That mean is at least 0.9 |c_b|^2 W_b(V <= 4), the level's share of the pull (point 2).
//  R3 THE FREE PAIR DOES NOT COME BACK. With tau = 0, from the same pulls, the same mean is at most 0.1 of the string's and
//     below its own value at cycle 0.
// INSTRUMENT (a failure makes the verdict partial). I1 the level, filtered from E-SPN-0162's start at its phase, reads a
//  phase within 0.02 of E-SPN-0162's 1.978945 with residual at most 2e-2 (a smaller ball, radius 8 against 9).
// READ, gating nothing: |c_b|^2, the knot weight and the mean string length every 4 cycles, the norm the edge absorbs.
// Verdict: fail if R1, R2 or R3 fails; partial if the instrument fails; pass otherwise.
//
// DETERMINISM: no random numbers. FLOATS: measurement on exact pieces (code/measure/register-meson). NOTHING MOVES: the
// pieces hand values between slots and register components of one dock, and the stream takes each slot's value one dock
// along.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  clonePair,
  filterPair,
  inner,
  normalizePair,
  norm2,
  pairCycle,
  pairEngine,
  profile,
  readLevel,
  relBall,
  sStart,
  type PairEngine,
} from '@/code/measure/register-meson'
import {
  meanLength,
  shellStart,
  totalWeight,
  weightWithin,
} from '@/code/measure/pulled-pair'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-9, 6]
const CAP = 8
const KNOT = 4
const E_L_0162 = 1.978945
const LEVEL_PHASE_TOLERANCE = 0.02
const LEVEL_RESIDUAL = 2e-2
const SHELL_WIDTH = 0.7
const START_ELL = 2.5
const STAY_SHARE = 0.9
const FREE_SHARE = 0.1

export type PulledPlan = {
  radius: number
  pulls: readonly number[]
  cycles: number
  lateFrom: number
  filter: number
  returnRatio: number
}

export const GATE_PLAN: PulledPlan = {
  radius: 8,
  pulls: [6],
  cycles: 64,
  lateFrom: 33,
  filter: 128,
  returnRatio: 2,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'spin/pulled-member-returns',
  code: 'E-SPN-0177',
  title:
    'a register member pulled from its partner comes back: on the register rule a member walks in every direction, and with E-SPN-0162 singlet-pair string a pair set at rest at string length 6 around a knot of size 4 has its knot-region weight rise from where the pull left it and stay, held by the bound level, while with no string the same pull leaves; the string is capped, so the well is finite and a pair pulled past it with enough energy separates, and uncapped it meets the D D ladder at V* 9.37, so coming back from any distance and holding exactly still pull against each other',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return pulledMemberRun(GATE_PLAN)
  },
})

const unitValue = (kj: readonly [number, number]): [number, number] => {
  const t = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(t), Math.sin(t)]
}

type Trace = {
  V0: number
  start: number
  late: number
  share: number
  floor: number
  every4: string[]
  normLost: number
}

export function pulledMemberRun(plan: PulledPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const u = unitValue(LIGHT)
  const tau = unitAngle(ringUnit(STRING[0], STRING[1]))
  const ball = relBall(plan.radius)
  const withString = pairEngine(ball, {
    u,
    tau,
    cap: CAP,
    K: [0, 0, 0, 0],
  })
  const free = pairEngine(ball, { u, tau: 0, cap: CAP, K: [0, 0, 0, 0] })

  // ---- the level (I1) ----
  const seed = sStart(ball, START_ELL)

  normalizePair(withString, seed)

  const level = filterPair(withString, seed, E_L_0162, plan.filter)

  normalizePair(withString, level)

  const read = readLevel(withString, level)
  const lp = profile(withString, level)
  const lpTotal = lp.reduce((a, x) => a + x, 0)
  const levelKnot =
    lp.slice(0, KNOT + 1).reduce((a, x) => a + x, 0) / lpTotal
  const I1 =
    Math.abs(read.phase - E_L_0162) <= LEVEL_PHASE_TOLERANCE &&
    read.residual <= LEVEL_RESIDUAL

  log('level')

  // ---- the pulls ----
  const run = (e: PairEngine, V0: number): Trace => {
    const s = shellStart(ball, V0, SHELL_WIDTH)

    normalizePair(e, s)

    const reference = totalWeight(e, s)
    const start = weightWithin(e, s, KNOT, reference)
    const ov = inner(withString, level, s)
    const share = ov[0] ** 2 + ov[1] ** 2
    const x = clonePair(s)
    const every4: string[] = []

    let late = 0

    for (let t = 1; t <= plan.cycles; t++) {
      pairCycle(e, x)

      const w = weightWithin(e, x, KNOT, reference)

      if (t >= plan.lateFrom) {
        late += w / (plan.cycles - plan.lateFrom + 1)
      }

      if (t % 4 === 0) {
        every4.push(
          `${t}:${w.toExponential(2)}/${meanLength(e, x).toFixed(2)}`,
        )
      }
    }

    return {
      V0,
      start,
      late,
      share,
      floor: share * levelKnot,
      every4,
      normLost: 1 - norm2(e, x),
    }
  }

  const bound = plan.pulls.map(V0 => run(withString, V0))

  log('with the string')

  const loose = plan.pulls.map(V0 => run(free, V0))

  log('free')

  const R1 = bound.every(b => b.late >= plan.returnRatio * b.start)
  const R2 = bound.every(b => b.late >= STAY_SHARE * b.floor)
  const R3 = loose.every(
    (l, i) => l.late <= FREE_SHARE * bound[i]!.late && l.late < l.start,
  )
  const status = !(R1 && R2 && R3) ? 'fail' : !I1 ? 'partial' : 'pass'
  const line = (t: Trace): string =>
    `V0 ${t.V0}: knot weight at 0 ${t.start.toExponential(3)}, late mean ${t.late.toExponential(3)}, |c_b|^2 ${t.share.toExponential(3)}, floor ${t.floor.toExponential(3)}, norm lost ${t.normLost.toExponential(2)}; every 4 cycles (weight/mean V) ${t.every4.join(' ')}`

  return verdict({
    status,
    claim: `R1 ${R1} R2 ${R2} R3 ${R3}; with the string: ${bound.map(line).join('; ')}; free: ${loose.map(line).join('; ')}; instrument I1 ${I1} (level phase ${read.phase.toFixed(6)}, residual ${read.residual.toExponential(2)}, knot share ${levelKnot.toFixed(4)})`,
    metrics: {
      R1: flag(R1),
      R2: flag(R2),
      R3: flag(R3),
      I1: flag(I1),
      levelPhase: read.phase,
      levelResidual: read.residual,
      levelKnot,
      ...Object.fromEntries(
        bound.flatMap(b => [
          [`start_${b.V0}`, b.start],
          [`late_${b.V0}`, b.late],
          [`share_${b.V0}`, b.share],
        ]),
      ),
      ...Object.fromEntries(loose.map(l => [`freeLate_${l.V0}`, l.late])),
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      I1: flag(I1),
      R3: flag(R3),
    },
    notes: `L2. Ball radius ${plan.radius} (${ball.points.length} sites), u ringUnit(${LIGHT.join(', ')}), rho ringUnit(${STRING.join(', ')}) tau ${tau.toFixed(6)}, cap ${CAP}, knot region V <= ${KNOT}, late window cycles ${plan.lateFrom} to ${plan.cycles}, filter ${plan.filter}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
