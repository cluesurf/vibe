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
// 5. THE REGIME (from probe 1, a reading, not a derivation). At this string the force per unit of V (0.281 a cycle) is
//    comparable to the relative band width (twice a member's 0.458, about 0.92), E-SPN-0162's strong-coupling lattice
//    regime. There a pair in a sloped well is Wannier-Stark localized: a pair set at one length breathes, its spread
//    swinging over about width / force = 3.3 and back while its mean length stays where it was put, rather than falling
//    to the bottom as in the continuum. So the pulled pair swings back into the knot's region and out again, and does not
//    settle. A weak string (E-SPN-0174's 0.0936, radius 13) is where the continuum's fall would show; it is not run here.
//
// PREDICTED: R1 to R3 hold at both pulls; the level and |c_b|^2 are read.
//
// GATES, fixed before the gate run (after probe 1, disclosed below; the first gate plan leaned on the filtered level,
// which the probe showed is not converged at a 128-cycle filter on radius 8, so the level became a read).
//  R1 IT COMES BACK. With the string, from each pull V0 in the plan, the mean knot-region weight W(V <= 4) over cycles 33
//     to 64 is at least RETURN_RATIO times its value at cycle 0.
//  R2 THE PAIR STAYS. With the string, the Gram norm after 64 cycles is at least 0.99 (the ball's edge absorbs, so a pair
//     that separates loses norm).
//  R3 THE FREE PAIR DOES NOT. With tau = 0, from the same pulls, the late mean knot weight is at most 0.1 of the string's,
//     and the norm after 64 cycles is at most 0.5.
// INSTRUMENT (a failure makes the verdict partial). I1 one cycle of a compact start (sStart with ell 1, 1e-10 in amplitude
//  at the ball's edge) keeps the Gram norm to 1e-10 in both engines.
// READ, gating nothing: the filtered level (phase, residual), |c_b|^2 against it, the knot weight and the mean string
//  length every 4 cycles.
// Verdict: fail if R1, R2 or R3 fails; partial if the instrument fails; pass otherwise.
//
// PROBE BEFORE THE GATE RUN, disclosed: tmp/bc-return-probe1.log, radius 8, the same engine. A 128-cycle filter from
//  sStart(2.5) at 1.979 read phase 1.928 with residual 0.032 and a profile peaked at V = 3 (0.43) and 4 (0.35): not the
//  converged level, so the level became a read and R2 no longer uses it. From the pull at V0 = 6 with the string: the
//  knot weight 2.4e-8 at cycle 0, then 0.02 to 0.155 every 4 cycles to cycle 64, the mean length 5.76 to 6.06, the Gram
//  norm 1.0000 to 1.0024; |c_b|^2 against the filtered vector 1.4e-3. At V0 = 7, |c_b|^2 1.9e-4 and the knot weight at
//  cycle 0 2e-17. The gate plan (pulls 5 and 6, R2 on the norm, R3 on the free pair's norm) was fixed then. The probe
//  was stopped there, before the V0 = 7 dynamics and the free pair, to free the machine for the gate run, so R3's
//  thresholds are predictions, not fits.
//
// FIRST RUN (tmp/bc-pulled-gate-run1.log, 1,210 s): FAIL on R3, the free pair. No gate moved and none was rerun.
//  - With the string: V0 = 5, knot weight 8.4e-3 at cycle 0, late mean 0.252, norm after 1.00014; V0 = 6, 2.4e-8 at 0,
//    late mean 0.077, norm 1.0024. The mean length stays at 4.6 to 5.0 and 5.8 to 6.1. R1 and R2 hold.
//  - FREE (tau = 0): V0 = 5, late mean 0.302, norm 0.99991; V0 = 6, late mean 0.313, norm 0.99993, the mean length
//    swinging 5.0 to 6.2. The free pair does NOT leave the radius-8 ball in 64 cycles, and it fills the knot region
//    MORE than the bound one. R3 fails on both clauses.
//  - I1: one cycle of the compact start keeps the norm to 5.5e-13 and 2.2e-14. The filtered level reads 1.9283, residual
//    3.2e-2, knot share 0.963; |c_b|^2 2.5e-2 (V0 5) and 1.4e-3 (V0 6).
//  WHAT IT MEANS (read after the run). Point 3 was wrong: a light register member at m 0.190126 is slow for most
//  momenta (the Dirac band is narrow, 0.458 a cycle, and flat near the 72 zeros of s(K)), so in 64 cycles a free pair
//  set at length 5 or 6 spreads over the ball, inward as much as outward, and never reaches the edge. The string does
//  not pull the pair in: at this strength it Wannier-Stark localizes it at the length it was set (point 5), which keeps
//  it OUT of the knot region more than the free pair is. So on this ball and this time this test cannot tell a part that
//  comes back from a part that merely has not left, and the constraint is not shown. A test with teeth needs the weak
//  string (tau 0.0936) where the continuum's turning point exists, a ball large enough that a free pair leaves it, and
//  cycles enough for it to do so: E-SPN-0174's radius 13 and more.
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
const SHELL_WIDTH = 0.7
const START_ELL = 2.5
const KEPT_NORM = 0.99
const FREE_NORM = 0.5
const FREE_SHARE = 0.1
const FIRST_CYCLE_NORM = 1e-10
const COMPACT_ELL = 1

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
  pulls: [5, 6],
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
    'a register pair pulled apart does not show a part coming back, fail (R3, the free control): with E-SPN-0162 singlet-pair string a pair set at rest at string length 5 or 6 keeps its norm (1.0001, 1.0024) and its knot-region weight rises from 8.4e-3 and 2.4e-8 to late means 0.25 and 0.08, but with no string the same pull also stays in the radius-8 ball for 64 cycles (norm 0.9999) and fills the knot region more (0.30, 0.31), because a light register member is slow over most of its narrow band; the string at this strength Wannier-Stark localizes the pair at its pulled length rather than pulling it in, so the test cannot tell a part that comes back from one that has not left, and needs the weak string on a ball a free pair can leave',
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
  normAfter: number
  firstCycleGap: number
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
    let firstCycleGap = 0

    for (let t = 1; t <= plan.cycles; t++) {
      pairCycle(e, x)

      if (t === 1) {
        firstCycleGap = Math.abs(norm2(e, x) - 1)
      }

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
      normAfter: norm2(e, x),
      firstCycleGap,
    }
  }

  const bound = plan.pulls.map(V0 => run(withString, V0))

  log('with the string')

  const loose = plan.pulls.map(V0 => run(free, V0))

  log('free')

  const R1 = bound.every(b => b.late >= plan.returnRatio * b.start)
  const R2 = bound.every(b => b.normAfter >= KEPT_NORM)
  const R3 = loose.every(
    (l, i) =>
      l.late <= FREE_SHARE * bound[i]!.late && l.normAfter <= FREE_NORM,
  )
  // I1: one cycle of a compact start (exp(-V^1.5), 1e-10 in amplitude at the ball's edge) keeps the Gram norm
  const unitarity = [withString, free].map(e => {
    const s = sStart(ball, COMPACT_ELL)

    normalizePair(e, s)
    pairCycle(e, s)

    return Math.abs(norm2(e, s) - 1)
  })
  const I1 = unitarity.every(g => g <= FIRST_CYCLE_NORM)
  const status = !(R1 && R2 && R3) ? 'fail' : !I1 ? 'partial' : 'pass'
  const line = (t: Trace): string =>
    `V0 ${t.V0}: knot weight at 0 ${t.start.toExponential(3)}, late mean ${t.late.toExponential(3)}, |c_b|^2 ${t.share.toExponential(3)} (floor ${t.floor.toExponential(3)}), norm after ${t.normAfter.toFixed(6)}, first-cycle norm gap ${t.firstCycleGap.toExponential(1)}; every 4 cycles (weight/mean V) ${t.every4.join(' ')}`

  return verdict({
    status,
    claim: `R1 ${R1} R2 ${R2} R3 ${R3}; with the string: ${bound.map(line).join('; ')}; free: ${loose.map(line).join('; ')}; instrument I1 ${I1} (norm gaps ${unitarity.map(g => g.toExponential(1)).join(', ')}); read, the filtered level: phase ${read.phase.toFixed(6)} (E-SPN-0162 ${E_L_0162} on radius 9), residual ${read.residual.toExponential(2)}, knot share ${levelKnot.toFixed(4)}`,
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
