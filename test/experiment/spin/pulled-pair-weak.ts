// A PART PULLED FROM A KNOT COMES BACK: THE DECISIVE TEST, ON THE WEAK STRING (E-SPN-0178). E-SPN-0177 set a register pair
// at rest at string length 5 or 6 under E-SPN-0162's string (tau 0.2807) and watched the knot region, V <= 4, on a
// radius-8 relative ball for 64 cycles, with the same pull and no string as the control. The control failed: the free pair
// kept its norm (0.9999) and filled the knot region more than the held one, so the test could not tell a part that comes
// back from one that has not left. This file builds the test with teeth.
//
// WHY E-SPN-0177'S CONTROL STAYED (found while deriving this file, probe 1 below). Not because a light member is slow.
// register-meson's ball drops a shift out of it, but in the exact coordinates the truncated cycle is itself nearly unitary
// in the truncated Gram metric: THE EDGE REFLECTS. A free pair on a radius-4 ball keeps its norm to 3.5e-4 over 128
// cycles, and on radius 6 to 1.3e-4 (tmp/pr-edge1.log). So a free pair on a radius-8 ball bounces inside a closed box and
// fills it, the knot region included, which is exactly what E-SPN-0177 read. The members are not slow: the (s, s) part of
// a pulled pair moves at a median of 0.59 in V a cycle (point 2), and crosses a radius-8 ball in about 14 cycles.
//
// THE PIECES (the rule is E-SPN-0162's and E-SPN-0174's, unchanged). Two members at m 0.190126 carrying the Cl+(4)
// register, u = ringUnit(-1, 4), bound by the singlet-pair string u^2 rho^min(V, cap) on S S in beat 1 and its conjugate
// on D D in beat 2, exact inside W (x) W. The string is E-SPN-0174's weakest: rho = ringUnit(-3, 2), tau 0.093556 a unit
// of V, cap 24 (well depth 2.245, every channel closed at every separation, least margin 0.802, E-SPN-0174 H1).
//
// THE ENGINE, a reduction that keeps the test's teeth (code/measure/register-ball-reduced). A pull (both members in S, the
// registers paired by delta, an s-wave shell exp(-((V - V0) / 0.7)^2), K = 0) lies in the sector every signed permutation
// of the four coordinates keeps, and the cycle keeps that sector (384 elements, each in W(F4), covariance counted). The
// reduced engine stores one representative an orbit: radius 32 is 15,336 representatives for 4,464,769 sites (4.8 s a
// cycle, 63 MB a state), where register-meson would need 18 GB a state. Witnessed entry by entry against register-meson.
//
// DERIVED BEFORE ANY GATE RUN (tmp/pr-derive2.log, 4,000 Weyl momenta; per cycle of two beats; V = d4Steps).
// 1. THE FROZEN PART. A free pair at K = 0 with member 1 at q and member 2 at -q takes the phase (pi + s1 E(q)) + (pi + s2
//    E(q)) a cycle, s = +-1 its band. For s1 = -s2 that is 2 pi at every q: the cross-band part of a pair does not move in
//    the relative coordinate at all. The delta-paired S S shell puts 0.324 (V0 8) and 0.309 (V0 10) of its weight there
//    (the band projectors (M - l') / (l - l'), exact to 9e-16, in the Gram metric). That part stays at V0 with or without a
//    string, and never enters the knot region.
// 2. THE MOVING PART, FREE. The rest (0.676, 0.691) moves at the relative group velocity 2 grad E(q): the largest V-rate is
//    0.857 a cycle, the median 0.589 (V0 8) and 0.653 (V0 10), the 10% quantile 0.109 and 0.223. Out of a shell at rest half
//    goes out and half in, through the centre and out. Against an absorbing layer from V 23 (below), the predicted share
//    of the moving part gone by cycle 128 is 0.86 (V0 8) and 0.92 (V0 10), so the free pair's norm must fall to about
//    0.324 + 0.676 x 0.14 = 0.42 and 0.309 + 0.691 x 0.08 = 0.36. With no absorber (E-SPN-0177's ball) it goes nowhere.
// 3. THE MOVING PART, HELD. With the string the (s, s) part obeys tau V + 2 E(q) = const (energy, the phase a cycle), with
//    2 E in [2 M0, 2 Smax], a relative band W = 0.915 wide. So it can rise at most W / tau = 9.78 above V0 (0.99 of it stays
//    within V0 + 9.48 and V0 + 9.43), and it falls toward the knot: a component at rest reaches V0 - (2 Smax - 2 E) / tau.
//    The share of the moving part able to reach the knot region V <= 5 is 0.550 (V0 8) and 0.420 (V0 10). This is the Wannier-Stark swing
//    of E-SPN-0177 point 5, but now W / tau is 9.8 rather than 3.3, so the swing spans the distance back to the knot. Its
//    period is 2 pi / tau = 67.2 cycles along a root and pi / tau = 33.6 along an axis, so 128 cycles hold at least two.
// 4. THE TWO PREDICTIONS DIFFER BY A MARGIN THE GATES SEE. Held: nothing reaches the absorber (V0 + 9.8 <= 19.8 < 23), so
//    the norm stays 1 (every loss would be a failure of the hold), and a finite share keeps coming back into the knot.
//    Free: the norm falls to about 0.4, and the knot region is crossed once by the incoming half and then left. A pair
//    that has merely not left would keep its norm AND not return; one that comes back keeps its norm AND returns.
// 5. THE BALL. The absorber must lie past everything the string can hold (19.8) and have room to be graded: from V 23 to
//    the edge at 32, exp(-0.5 x^2) a cycle, x = (V - 23) / 9. Radius 13 (E-SPN-0174's) cannot hold it: a held pair pulled to
//    8 reaches 17.8. Unreduced, radius 32 is 4,464,769 sites x 256 states: 18 GB a state, 27 GB of scratch fields, so
//    over 60 GB against this machine's 48 GB, and at E-SPN-0174's 76 microseconds a site about 340 s a cycle, 12 hours an
//    arm. It does not fit. Reduced it is 63 MB a state and 4.8 s a cycle, so the five 128-cycle arms and the level take
//    about 1.5 hours of process time.
// 6. THE STRING, AND THE TENSION. E-SPN-0174's weak string is capped at 24. Inside the ball it rises linearly over every
//    length a pulled pair can reach (V0 + 9.8 < 24), and with the cap it holds exactly: every channel is closed at every
//    separation. Uncapped it would meet the D D ladder at V* = (2 pi - E_L - 2 Smax) / tau = 35.8 (E-SPN-0174 H1). So on
//    this test the capped string does both jobs, which is why it is used. It does not remove the tension, it scales it: a
//    held pair can be pulled back from V0 only while V0 + W / tau stays under the cap and the cap under V*, and both
//    lengths go as 1 / tau, so the returnable range is about (2 pi - E_L - 2 Smax - W) / tau = 26 at this string. Any
//    fixed string returns a part only from a finite distance. "From any distance" needs tau -> 0.
//
// PREDICTED: R1 to R3 hold at both pulls; every instrument holds. Verdict pass.
//
// GATES, fixed before the gate run (after probes 1 to 3, disclosed below). Pulls V0 = 8 and 10, 128 cycles, the late
// window cycles 65 to 128, the knot region V <= KNOT (the level's 0.9 point, probe 3), the knot weight the coordinate
// weight there over the pull's own at cycle 0 (E-SPN-0177's measure), V_OUT = V0 + 10.
//  R1 IT COMES BACK. With the string, the late mean knot weight is at least 0.02 and at least 100 times its value at cycle 0.
//  R2 IT IS HELD. With the string, the Gram norm after 128 cycles is at least 0.99, and the weight past V_OUT at most 0.01 at
//     every read (every 4 cycles).
//  R3 THE FREE PAIR LEAVES. With no string, the Gram norm after 128 cycles is at most 0.6, and the late mean knot weight at
//     most a quarter of the held pair's.
// INSTRUMENTS (a failure makes the verdict partial).
//  I0 the 384 signed permutations lie in W(F4), and the overlap is covariant under every one (0 of 9,216 root pairs off).
//  I1 the reduced cycle against register-meson's on radius 8, 4 cycles from the V0 = 5 shell, with the string and without:
//     every entry within 1e-14, and the two Gram norms within 1e-11 (summed over 5.4 million terms in two orders).
//  I2 THE LEVEL CONVERGES (the task E-SPN-0177 could not do). Filtered on the radius-16 sector (filters 64, 256, 512, 1024,
//     2048 from sStart(3.6) at the NR phase 1.3590) and read on the radius-32 ball: |lambda| >= 1 - 1e-6 and residual
//     <= 1e-4. Its knot share and |c_b|^2 against each pull are reads.
//  I3 THE ABSORBER ABSORBS. The free arm at V0 = 8 run again at half the strength: the norm after 128 cycles within 0.03,
//     and the late mean knot weight within 25% (or 1e-3), of the full-strength arm. A reflecting layer would differ.
// READ, gating nothing: the edge reflection itself (the reduced free pair on radius 6 with no absorber, 128 cycles), the
//  traces every 8 cycles (knot weight, mean V, weight past V_OUT), the level's phase and profile, |c_b|^2 and the bound
//  floor |c_b|^2 W_b(knot).
// Verdict: fail if R1, R2 or R3 fails; partial if an instrument fails; pass otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them).
//  tmp/pr-derive1.log, tmp/pr-derive2.log: the numbers of points 1 to 3 (pure momentum-space arithmetic, no dynamics).
//  tmp/pr-edge1.log: probe 1, the reflecting edge (a free pair on radius 4 and 6 with register-meson, 128 cycles).
//  tmp/pr-probe2.log: the reduced engine's covariance (0 of 9,216), the witness on radius 8 (1.6e-17 free, 1.7e-17 with
//   the string over 4 cycles), and its speed (radius 24: 5,401 representatives, 2.1 s a cycle; radius 32: 4.8 s). Stopped
//   before its level filter on radius 24, which was too slow.
//  tmp/pr-probe3.log: the weak level on the radius-16 sector, which fixed KNOT = 5: after the 512 filter it reads phase
//   1.2592139 and residual 5.1e-4 (E-SPN-0174's 1.259214 and 5.1e-4 on the unreduced radius-13 ball), and holds 0.907 of
//   its coordinate weight at V <= 5 (0.752 at V <= 4, 0.969 at V <= 6). Stopped there, before the 1024 and 2048 filters, to
//   free the machine: I2 is first read in the gate run. tmp/pr-smoke.log: every code path on a small plan
//   (radius 12, 16 cycles, gating nothing). No dynamics of a pull was run on the gate ball before the gate run. The smoke showed I1 comparing the
//   two Gram norms at 1e-14 with the entries, which float summation cannot meet (4e-13, 9e-13); the norm gap got its own
//   tolerance, 1e-11, before the gate run.
//
// FIRST RUN (two processes, combined by combine(); tmp/pr-gate-one.log 1,223 s, tmp/pr-gate-two.log 809 s, combined in
//  tmp/pr-exp-run1.log): PASS. Every gate and every instrument holds. No gate moved and none was rerun.
//  - R1, it comes back. Held, V0 8: the knot weight 2.7e-17 at cycle 0, 0.54 at cycle 16, 0.56 at 24, late mean 0.230;
//    V0 10: 5.9e-46 at 0, 0.40 at 24 and 32, late mean 0.102. The mean length falls from 8 to 6.5 and from 10 to 7.6,
//    then swings back out (7.9, 10.1) and in again: the Wannier-Stark swing of point 3, now wide enough to reach the knot.
//  - R2, it is held. Norm after 128 cycles 1 - 1.7e-11 and 1 - 4.4e-10, the most weight past V0 + 10 at any read 7.9e-6
//    and 1.2e-6.
//  - R3, the free pair leaves. Norm 0.384 and 0.389 (point 2 predicted about 0.42 and 0.36), falling from cycle 16 on;
//    late mean knot weight 0.029 and 0.024, 0.13 and 0.24 of the held pair's. Its knot weight peaks once (0.28 and 0.22 at
//    cycle 16, the incoming half passing the centre) and then decays, the mean length drifting out to 13.4 and 13.7.
//  - I0 covariance 0 of 9,216. I1 witness entries 1.6e-17 and 1.7e-17, norms 4.2e-13 and 9.3e-13. I2 the level: phase
//    1.2592028 (E-SPN-0174 1.259214), residual 2.8e-7 on the radius-16 sector and 8.5e-6 on the radius-32 ball, |lambda|
//    1 to 1e-10, knot share 0.907. I3 the half-strength absorber: norm 0.379 against 0.384, late 0.0288 against 0.0290.
//  - READ: |c_b|^2 of the pulls against the level 6.6e-3 and 2.9e-4 (floors 6.0e-3 and 2.6e-4), so the return is NOT the
//    bound level: 30 to 350 times more weight comes back into the knot than the level carries. The part comes back as the
//    swing of a pair in a rising string, not by settling. And the edge reflection, read on the reduced engine: a free pair
//    on radius 6 with no absorber keeps its norm to 1.1e-4 over 128 cycles.
//  WHAT IT MEANS. On the register rule with E-SPN-0174's weak string, a part pulled out of the knot to 8 and 10 comes
//  back into the knot region and keeps coming back, held exactly, while the same pull with no string leaves. E-SPN-0177's
//  control failed because its ball's edge reflected, not because the members are slow. The limit stands (point 6): this
//  string returns a part only from within about 26 of the knot, and a string strong enough to return it from further meets
//  the D D ladder sooner.
//
// DETERMINISM: no random numbers. FLOATS: measurement on exact pieces (code/measure/register-meson). NOTHING MOVES: the
// pieces hand values between slots and register components of one dock, the stream takes each slot's value one dock along,
// the string sets a phase on the pair's singlet sector. The absorber is an instrument outside the region read.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  norm2,
  normalizePair,
  pairCycle,
  pairEngine,
  relBall,
  type PairParams,
} from '@/code/measure/register-meson'
import {
  ballAbsorb,
  ballCycle,
  ballEngine,
  ballFilter,
  ballGroup,
  ballInner,
  ballNorm2,
  ballProfile,
  ballRead,
  ballSector,
  ballStart,
  embedBall,
  normalizeBall,
  unfoldBall,
  type BallGroup,
} from '@/code/measure/register-ball-reduced'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-3, 2]
const CAP = 24
const SHELL_WIDTH = 0.7
const START_ELL = 3.6
const NR_PHASE = 1.359
const WITNESS_RADIUS = 8
const WITNESS_CYCLES = 4
const WITNESS_PULL = 5
const WITNESS_TOLERANCE = 1e-14
const WITNESS_NORM = 1e-11
const LAMBDA = 1e-6
const RESIDUAL = 1e-4
const RETURN_FLOOR = 0.02
const RETURN_RATIO = 100
const KEPT_NORM = 0.99
const OUT_WEIGHT = 0.01
const FREE_NORM = 0.6
const FREE_SHARE = 0.25
const ABSORB_NORM = 0.03
const ABSORB_SHARE = 0.25
const ABSORB_FLOOR = 1e-3
const LEVEL_SHARE = 0.9
const EDGE_RADIUS = 6
const EDGE_PULL = 3

export type PulledWeakPlan = {
  radius: number
  levelRadius: number
  filters: readonly number[]
  pulls: readonly number[]
  cycles: number
  lateFrom: number
  absorbFrom: number
  strength: number
  knot: number
  reach: number
  normEvery: number
}

export const GATE_PLAN: PulledWeakPlan = {
  radius: 32,
  levelRadius: 16,
  filters: [64, 256, 512, 1024, 2048],
  pulls: [8, 10],
  cycles: 128,
  lateFrom: 65,
  absorbFrom: 23,
  strength: 0.5,
  knot: 5,
  reach: 10,
  normEvery: 16,
}

const flag = (b: boolean): number => (b ? 1 : 0)

const unitValue = (kj: readonly [number, number]): [number, number] => {
  const t = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(t), Math.sin(t)]
}

const params = (tau: number): PairParams => ({
  u: unitValue(LIGHT),
  tau,
  cap: CAP,
  K: [0, 0, 0, 0],
})

const stringTau = (): number => unitAngle(ringUnit(STRING[0], STRING[1]))

const shell =
  (V0: number) =>
  (V: number): number =>
    Math.exp(-(((V - V0) / SHELL_WIDTH) ** 2))

// ---- the instruments and the level ----

export type InstrumentRead = {
  covariance: number
  checked: number
  // per string (free, weak): the worst entry gap, and the Gram norms' gap
  witness: (readonly [number, number])[]
  levelPhase: number
  levelLambda: number
  levelResidual: number
  levelSmallResidual: number
  levelKnot: number
  levelProfile: number[]
  shares: number[]
  edgeNorms: number[]
  I0: boolean
  I1: boolean
  I2: boolean
}

export function instrumentPart(
  plan: PulledWeakPlan,
  log: (what: string) => void = () => undefined,
): InstrumentRead {
  const group = ballGroup()
  const tau = stringTau()

  // I1: the witness
  const wBall = relBall(WITNESS_RADIUS)
  const wSec = ballSector(group, WITNESS_RADIUS)
  const witness = [0, tau].map(t => {
    const re = ballEngine(wSec, params(t))
    const ue = pairEngine(wBall, params(t))
    const rs = ballStart(wSec, shell(WITNESS_PULL))

    normalizeBall(re, rs)

    const us = unfoldBall(wSec, rs, wBall)

    let worst = 0

    for (let c = 1; c <= WITNESS_CYCLES; c++) {
      ballCycle(re, rs)
      pairCycle(ue, us)

      const back = unfoldBall(wSec, rs, wBall)

      for (let k = 0; k < us.re.length; k++) {
        worst = Math.max(
          worst,
          Math.abs(back.re[k]! - us.re[k]!),
          Math.abs(back.im[k]! - us.im[k]!),
        )
      }
    }

    return [worst, Math.abs(norm2(ue, us) - ballNorm2(re, rs))] as const
  })

  log(`witness ${witness.map(x => x.map(y => y.toExponential(2)).join('/')).join(' ')}`)

  // I2: the level
  const small = ballSector(group, plan.levelRadius)
  const es = ballEngine(small, params(tau))

  let v = ballStart(small, V => Math.exp(-((V / START_ELL) ** 1.5)))

  normalizeBall(es, v)

  let phase = NR_PHASE
  let smallResidual = 1

  for (const S of plan.filters) {
    v = ballFilter(es, v, phase, S)
    normalizeBall(es, v)

    const r = ballRead(es, v)

    phase = r.phase
    smallResidual = r.residual
    log(`filter ${S} phase ${phase} residual ${r.residual.toExponential(3)}`)
  }

  const big = ballSector(group, plan.radius)
  const eb = ballEngine(big, params(tau))
  const level = embedBall(small, v, big)

  normalizeBall(eb, level)

  const read = ballRead(eb, level)
  const lp = ballProfile(eb, level)
  const lt = lp.reduce((a, x) => a + x, 0)
  const levelKnot =
    lp.slice(0, plan.knot + 1).reduce((a, x) => a + x, 0) / lt

  // |c_b|^2 of each pull against the level
  const shares = plan.pulls.map(V0 => {
    const s = ballStart(big, shell(V0))

    normalizeBall(eb, s)

    const [a, b] = ballInner(eb, level, s)

    return a * a + b * b
  })

  log(`level on radius ${plan.radius}: residual ${read.residual.toExponential(3)}`)

  // READ: the reflecting edge, a reduced free pair with no absorber
  const edge = ballSector(group, EDGE_RADIUS)
  const ee = ballEngine(edge, params(0))
  const es0 = ballStart(edge, shell(EDGE_PULL))

  normalizeBall(ee, es0)

  const edgeNorms: number[] = []

  for (let t = 1; t <= 128; t++) {
    ballCycle(ee, es0)

    if (t % 32 === 0) {
      edgeNorms.push(ballNorm2(ee, es0))
    }
  }

  return {
    covariance: group.covariance,
    checked: group.checked,
    witness,
    levelPhase: read.phase,
    levelLambda: Math.hypot(...read.lambda),
    levelResidual: read.residual,
    levelSmallResidual: smallResidual,
    levelKnot,
    levelProfile: lp.map(x => x / lt),
    shares,
    edgeNorms,
    I0: group.covariance === 0 && group.elements.length === 384,
    I1: witness.every(
      w => w[0] <= WITNESS_TOLERANCE && w[1] <= WITNESS_NORM,
    ),
    I2:
      Math.hypot(...read.lambda) >= 1 - LAMBDA &&
      read.residual <= RESIDUAL,
  }
}

// ---- one arm: a pull, with or without the string, under the absorber ----

export type Arm = {
  V0: number
  held: boolean
  strength: number
  start: number
  late: number
  normAfter: number
  outMax: number
  norms: string[]
  every8: string[]
}

export function armPart(
  plan: PulledWeakPlan,
  V0: number,
  held: boolean,
  strength: number,
  group: BallGroup = ballGroup(),
): Arm {
  const sec = ballSector(group, plan.radius)
  const e = ballEngine(sec, params(held ? stringTau() : 0))
  const x = ballStart(sec, shell(V0))

  normalizeBall(e, x)

  const p0 = ballProfile(e, x)
  const reference = p0.reduce((a, y) => a + y, 0)
  const knotOf = (p: number[]): number =>
    p.slice(0, plan.knot + 1).reduce((a, y) => a + y, 0) / reference
  const outOf = (p: number[]): number =>
    p.slice(V0 + plan.reach + 1).reduce((a, y) => a + y, 0) / reference
  const start = knotOf(p0)
  const every8: string[] = []
  const norms: string[] = []

  let late = 0
  let outMax = outOf(p0)

  for (let t = 1; t <= plan.cycles; t++) {
    ballCycle(e, x)
    ballAbsorb(sec, x, plan.absorbFrom, strength)

    const p = ballProfile(e, x)
    const w = knotOf(p)

    if (t >= plan.lateFrom) {
      late += w / (plan.cycles - plan.lateFrom + 1)
    }

    if (t % 4 === 0) {
      outMax = Math.max(outMax, outOf(p))
    }

    if (t % 8 === 0) {
      const mean =
        p.reduce((a, y, V) => a + V * y, 0) / p.reduce((a, y) => a + y, 0)

      every8.push(
        `${t}:${w.toExponential(2)}/${mean.toFixed(2)}/${outOf(p).toExponential(1)}`,
      )
    }

    if (t % plan.normEvery === 0 && t < plan.cycles) {
      norms.push(`${t}:${ballNorm2(e, x).toFixed(4)}`)
    }
  }

  return {
    V0,
    held,
    strength,
    start,
    late,
    normAfter: ballNorm2(e, x),
    outMax,
    norms,
    every8,
  }
}

// ---- the verdict ----

export function combine(
  plan: PulledWeakPlan,
  inst: InstrumentRead,
  arms: Arm[],
): Verdict {
  const find = (V0: number, held: boolean, strength: number): Arm =>
    arms.find(
      a => a.V0 === V0 && a.held === held && a.strength === strength,
    )!
  const heldArms = plan.pulls.map(V0 => find(V0, true, plan.strength))
  const freeArms = plan.pulls.map(V0 => find(V0, false, plan.strength))
  const halfArm = find(plan.pulls[0]!, false, plan.strength / 2)
  const R1 = heldArms.every(
    a => a.late >= RETURN_FLOOR && a.late >= RETURN_RATIO * a.start,
  )
  const R2 = heldArms.every(
    a => a.normAfter >= KEPT_NORM && a.outMax <= OUT_WEIGHT,
  )
  const R3 = freeArms.every(
    (a, i) =>
      a.normAfter <= FREE_NORM && a.late <= FREE_SHARE * heldArms[i]!.late,
  )
  const full = freeArms[0]!
  const I3 =
    Math.abs(halfArm.normAfter - full.normAfter) <= ABSORB_NORM &&
    Math.abs(halfArm.late - full.late) <=
      Math.max(ABSORB_SHARE * full.late, ABSORB_FLOOR)
  const status = !(R1 && R2 && R3)
    ? 'fail'
    : !(inst.I0 && inst.I1 && inst.I2 && I3)
      ? 'partial'
      : 'pass'
  const line = (a: Arm): string =>
    `V0 ${a.V0} ${a.held ? 'held' : 'free'}${a.strength !== plan.strength ? ' (half absorber)' : ''}: knot weight at 0 ${a.start.toExponential(3)}, late mean ${a.late.toExponential(3)}, norm after ${a.normAfter.toFixed(6)}, most past V_OUT ${a.outMax.toExponential(2)}; norms ${a.norms.join(' ')}; every 8 cycles (knot/mean V/past V_OUT) ${a.every8.join(' ')}`
  const floors = inst.shares.map(s => s * inst.levelKnot)

  return verdict({
    status,
    claim: `R1 ${R1} R2 ${R2} R3 ${R3}; ${[...heldArms, ...freeArms, halfArm].map(line).join('; ')}; instruments I0 ${inst.I0} (covariance ${inst.covariance} of ${inst.checked}) I1 ${inst.I1} (witness entries ${inst.witness.map(w => w[0].toExponential(2)).join(', ')}, norms ${inst.witness.map(w => w[1].toExponential(2)).join(', ')}) I2 ${inst.I2} (level phase ${inst.levelPhase.toFixed(8)}, |lambda| ${inst.levelLambda.toFixed(10)}, residual ${inst.levelResidual.toExponential(2)} on radius ${plan.radius}, ${inst.levelSmallResidual.toExponential(2)} on radius ${plan.levelRadius}) I3 ${I3}; read: the level's knot share ${inst.levelKnot.toFixed(4)}, |c_b|^2 ${inst.shares.map(s => s.toExponential(3)).join(', ')} (floors ${floors.map(f => f.toExponential(2)).join(', ')}), a free pair with no absorber on radius ${EDGE_RADIUS} keeps its norm ${inst.edgeNorms.map(n => n.toFixed(5)).join(', ')} at cycles 32 to 128`,
    metrics: {
      R1: flag(R1),
      R2: flag(R2),
      R3: flag(R3),
      I0: flag(inst.I0),
      I1: flag(inst.I1),
      I2: flag(inst.I2),
      I3: flag(I3),
      levelPhase: inst.levelPhase,
      levelResidual: inst.levelResidual,
      levelKnot: inst.levelKnot,
      witness: Math.max(...inst.witness.map(w => w[0])),
      ...Object.fromEntries(
        heldArms.flatMap(a => [
          [`start_${a.V0}`, a.start],
          [`late_${a.V0}`, a.late],
          [`norm_${a.V0}`, a.normAfter],
          [`out_${a.V0}`, a.outMax],
        ]),
      ),
      ...Object.fromEntries(
        freeArms.flatMap(a => [
          [`freeLate_${a.V0}`, a.late],
          [`freeNorm_${a.V0}`, a.normAfter],
        ]),
      ),
      ...Object.fromEntries(
        inst.shares.map((s, i) => [`share_${plan.pulls[i]}`, s]),
      ),
      halfNorm: halfArm.normAfter,
      halfLate: halfArm.late,
    },
    control: {
      R3: flag(R3),
      freeNorm: Math.max(...freeArms.map(a => a.normAfter)),
      I3: flag(I3),
    },
    notes: `L2. Weak string rho ringUnit(${STRING.join(', ')}) tau ${stringTau().toFixed(6)} cap ${CAP}, u ringUnit(${LIGHT.join(', ')}); the reduced sector of radius ${plan.radius} (${ballSector(ballGroup(), plan.radius).count} representatives); absorber from V ${plan.absorbFrom}, strength ${plan.strength}; knot region V <= ${plan.knot}; V_OUT = V0 + ${plan.reach}; late window cycles ${plan.lateFrom} to ${plan.cycles}. The level's profile by V: ${inst.levelProfile.slice(0, 17).map(x => x.toExponential(2)).join(' ')}.`,
  })
}

export function pulledWeakRun(plan: PulledWeakPlan): Verdict {
  const group = ballGroup()
  const inst = instrumentPart(plan)
  const arms: Arm[] = [
    ...plan.pulls.flatMap(V0 => [
      armPart(plan, V0, true, plan.strength, group),
      armPart(plan, V0, false, plan.strength, group),
    ]),
    armPart(plan, plan.pulls[0]!, false, plan.strength / 2, group),
  ]

  return combine(plan, inst, arms)
}

export default experiment({
  id: 'spin/pulled-pair-weak',
  code: 'E-SPN-0178',
  title:
    "a register pair pulled from its knot comes back under the weak string and leaves without it, pass: with E-SPN-0174's string (tau 0.0936, cap 24, held exactly) a pair set at rest at string length 8 or 10 swings back into the knot region V <= 5 (knot weight from 3e-17 and 6e-46 to late means 0.23 and 0.10 over cycles 65 to 128) and keeps its norm to 4e-10 with nothing past V0 + 10, while the same pull with no string leaves through an absorbing layer (norm 0.38 and 0.39, late knot weight 0.03 and 0.02), on a radius-32 ball run exactly on its signed-permutation sector; E-SPN-0177's free pair stayed because its ball's edge reflects; the return is the pair's swing in the rising string, not the bound level (|c_b|^2 7e-3), and a fixed string returns a part only from a finite distance (about 26 here) before its cap or the D D ladder",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return pulledWeakRun(GATE_PLAN)
  },
})
