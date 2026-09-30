// THE PULLED PAIR COMES BACK WITH THE FEAR BEAT ON (E-SPN-0179): the fourth of R*'s held results gated on C*, E-FND-0160's
// register rule with roles, a tone and the fear beat. E-SPN-0178 showed that on R* a register pair pulled from its knot to
// string length 8 or 10 swings back into the knot under E-SPN-0174's weak string and stays held, while the same pull with
// no string leaves through an absorbing layer. C* adds a role to each member and the fear beat at contact. This file asks
// whether that breaks the return.
//
// THE REDUCTION, derived before the run (note/research/vibe/roadmap/remaining-pieces.md, "Roles and a tone on the
// register rule"). E-SPN-0178's pair is two distinguishable members, which on C* is an UNLIKE pair: one love-tone and one
// fear-tone member. The unlike kernel V = 1 + (w - 1) Phi Phi^dag acts only at V = 0 with both members in the beat's sector,
// and every other piece is role-blind. So the pair's role space splits into the singlet Phi and its complement:
//  - on Phi-perp the kernel is the identity, and the run IS E-SPN-0178's, entry for entry (the same engine and the same
//    parameters)
//  - on Phi the S S pair at V = 0 takes a further e^(i w_F) in beat 1 and the D D pair e^(-i w_F) in beat 2, w_F = 2 pi / 3
//    (ringUnit(0, 2)), as the string's own phase is placed (code/measure/role-register fearBallEngine)
// So C*'s pulled pair returns if and only if both channels return, and only the Phi channel needs new runs. A phase at
// V = 0 alone cannot hold a pair, so the free control is unchanged in kind.
//
// PREDICTED: the Phi channel returns and is held as E-SPN-0178's pair is, and its free arm leaves. The fear beat moves
// only a phase in the knot's core (V = 0 is one site of the ball), so the knot weight should change by a modest amount,
// in either direction. Verdict pass.
//
// GATES, fixed before the gate run (E-SPN-0178's gates, unchanged, applied to the Phi channel). Pulls V0 = 8 and 10, 128
// cycles, the radius-32 reduced ball, absorber from V 23 at strength 0.5, knot region V <= 5, late window cycles 65 to 128,
// V_OUT = V0 + 10.
//  R1 IT COMES BACK. On Phi with the string, the late mean knot weight is at least 0.02 and at least 100 times its value at
//     cycle 0.
//  R2 IT IS HELD. On Phi with the string, the Gram norm after 128 cycles is at least 0.99, and the weight past V_OUT at most
//     0.01 at every read (every 4 cycles).
//  R3 THE FREE PAIR LEAVES. On Phi with the fear beat and no string, the Gram norm after 128 cycles is at most 0.6, and the
//     late mean knot weight at most a quarter of the held Phi pair's.
// INSTRUMENT (a failure makes the verdict partial). E THE PHI-PERP CHANNEL IS E-SPN-0178. Run in lockstep with Phi, its late
//  mean knot weight equals E-SPN-0178's recorded value (0.23013090836559863 at V0 8, 0.10193202924267739 at V0 10) within
//  1e-10, and the engine differs from E-SPN-0178's at exactly the V = 0 representatives (1).
// READ, gating nothing: g = <phi_perp | G phi_Phi> every 8 cycles, and from it the role state of the held pair for the role
//  start |0>|+> (code/measure/role-register reducedRole): its CHSH by see-saw, its least Wigner weight and least context
//  sum; the Phi channel's knot weight against Phi-perp's.
// Verdict: fail if R1, R2 or R3 fails; partial if E fails; pass otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed. None on the gate ball. tmp/rt-pull-smoke.log ran every code path on a small plan
//  (radius 12, pull 5, 16 cycles, absorber from 9, gating nothing; its gates are not the gate ball's and it read fail on
//  R2, R3 and E there, as a ball that small must): |g| 0.99 at cycle 8 and 0.88 at 16, the Phi and Phi-perp knot weights
//  0.397 and 0.395 at cycle 16, the role state's CHSH up to 2.015.
//
// FIRST RUN (two processes, tmp/rt-pull-part-8.log 793 s and tmp/rt-pull-part-10.log about 900 s, combined by
//  tmp/rt-pull-combine.ts into tmp/rt-pull-combine.log): PASS. Every gate and the instrument hold. No gate moved.
//  - R1, it comes back. On Phi the late mean knot weight is 0.187 (V0 8) and 0.095 (V0 10), from 3e-17 and 6e-46.
//  - R2, it is held. Norm 1 - 1.7e-11 and 1 - 4.4e-10, the most past V0 + 10 7.9e-6 and 1.2e-6.
//  - R3, the free pair leaves. Norm 0.387 and 0.392, late knot 0.019 and 0.020, 0.10 and 0.21 of the held Phi pair's. At
//    V0 10 the ratio is within 16% of the gate's quarter: the fear beat lowers the held return there more than the free.
//  - E: the Phi-perp channel reads 0.23013090836559863 and 0.10193202924267739, E-SPN-0178's values to the last digit,
//    and the fear engine differs from E-SPN-0178's at exactly 1 representative.
//  - READ: the fear beat lowers the late return by 19% (V0 8, 0.187 against 0.230) and 7% (V0 10). |g| falls to 0.850 and
//    0.965 as the pair keeps returning through V = 0, and the role state from |0>|+> grows steadily entangled and
//    contextual: CHSH 2.023 and 2.005, least context sum 3.849 and 3.968. A pair that keeps coming back keeps meeting.
//  THE AUDIT. The return is E-SPN-0178's mechanism (the swing in the rising string), unchanged in kind by a phase in the
//  core. What this adds is that C*'s fear beat, the only new piece a pulled pair meets, does not break it, and the
//  splitting into channels makes Phi-perp an exact reproduction. L2, two members, the 4d ball, not the husk.
//
// DETERMINISM: no random numbers. FLOATS: measurement on exact pieces (code/measure/register-meson).

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { type PairParams } from '@/code/measure/register-meson'
import {
  ballAbsorb,
  ballCycle,
  ballEngine,
  ballGroup,
  ballInner,
  ballNorm2,
  ballProfile,
  ballSector,
  ballStart,
  normalizeBall,
  type BallEngine,
  type BallGroup,
  type BallState,
} from '@/code/measure/register-ball-reduced'
import {
  contextSums,
  fearBallEngine,
  negativity,
  productRole,
  reducedRole,
  twoRoleWigner,
} from '@/code/measure/role-register'
import { roleChsh } from '@/code/measure/role-bell'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-3, 2]
const FEAR: readonly [number, number] = [0, 2]
const CAP = 24
const SHELL_WIDTH = 0.7
const RETURN_FLOOR = 0.02
const RETURN_RATIO = 100
const KEPT_NORM = 0.99
const OUT_WEIGHT = 0.01
const FREE_NORM = 0.6
const FREE_SHARE = 0.25
const SAME = 1e-10
const RECORDED: Record<number, number> = {
  8: 0.23013090836559863,
  10: 0.10193202924267739,
}
const G_EVERY = 8

export type PulledFearPlan = {
  radius: number
  pulls: readonly number[]
  cycles: number
  lateFrom: number
  absorbFrom: number
  strength: number
  knot: number
  reach: number
}

export const GATE_PLAN: PulledFearPlan = {
  radius: 32,
  pulls: [8, 10],
  cycles: 128,
  lateFrom: 65,
  absorbFrom: 23,
  strength: 0.5,
  knot: 5,
  reach: 10,
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
const fearAngle = (): number => unitAngle(ringUnit(FEAR[0], FEAR[1]))

const shell =
  (V0: number) =>
  (V: number): number =>
    Math.exp(-(((V - V0) / SHELL_WIDTH) ** 2))

const ZERO: [number, number][] = [
  [1, 0],
  [0, 0],
  [0, 0],
]
const PLUS: [number, number][] = [
  [1 / Math.sqrt(3), 0],
  [1 / Math.sqrt(3), 0],
  [1 / Math.sqrt(3), 0],
]

// one channel's run: the knot weight over its own start weight, the late mean, the most past V_OUT, the norm
type Track = {
  start: number
  late: number
  outMax: number
  normAfter: number
  every8: string[]
}

type Walker = {
  e: BallEngine
  x: BallState
  reference: number
  track: Track
}

function walker(
  plan: PulledFearPlan,
  e: BallEngine,
  V0: number,
): Walker {
  const x = ballStart(e.s, shell(V0))

  normalizeBall(e, x)

  const p0 = ballProfile(e, x)
  const reference = p0.reduce((a, y) => a + y, 0)
  const start = p0.slice(0, plan.knot + 1).reduce((a, y) => a + y, 0) / reference

  return {
    e,
    x,
    reference,
    track: { start, late: 0, outMax: 0, normAfter: 0, every8: [] },
  }
}

function step(plan: PulledFearPlan, w: Walker, V0: number, t: number): void {
  ballCycle(w.e, w.x)
  ballAbsorb(w.e.s, w.x, plan.absorbFrom, plan.strength)

  const p = ballProfile(w.e, w.x)
  const knot = p.slice(0, plan.knot + 1).reduce((a, y) => a + y, 0) / w.reference
  const out = p.slice(V0 + plan.reach + 1).reduce((a, y) => a + y, 0) / w.reference

  if (t >= plan.lateFrom) {
    w.track.late += knot / (plan.cycles - plan.lateFrom + 1)
  }

  if (t % 4 === 0) {
    w.track.outMax = Math.max(w.track.outMax, out)
  }

  if (t % 8 === 0) {
    const mean =
      p.reduce((a, y, V) => a + V * y, 0) / p.reduce((a, y) => a + y, 0)

    w.track.every8.push(`${t}:${knot.toExponential(2)}/${mean.toFixed(2)}`)
  }
}

export type PullPart = {
  V0: number
  held: Track
  heldPerp: Track
  free: Track
  changedSites: number
  // |g| and arg g every G_EVERY cycles, and the role readings from |0>|+>
  gAbs: number[]
  gArg: number[]
  chsh: number[]
  leastW: number[]
  leastS: number[]
}

// one pull: the Phi channel held and free, and the Phi-perp channel held in lockstep with Phi (for E and for g)
export function pullPart(
  plan: PulledFearPlan,
  V0: number,
  group: BallGroup = ballGroup(),
  log: (what: string) => void = () => undefined,
): PullPart {
  const sec = ballSector(group, plan.radius)
  const tau = stringTau()
  const plain = ballEngine(sec, params(tau))
  const fear = fearBallEngine({ sector: sec, params: params(tau), angle: fearAngle() })
  const fearFree = fearBallEngine({ sector: sec, params: params(0), angle: fearAngle() })

  let changedSites = 0

  for (let i = 0; i < sec.count; i++) {
    if (
      plain.beta1[2 * i] !== fear.beta1[2 * i] ||
      plain.beta1[2 * i + 1] !== fear.beta1[2 * i + 1] ||
      plain.beta2[2 * i] !== fear.beta2[2 * i] ||
      plain.beta2[2 * i + 1] !== fear.beta2[2 * i + 1]
    ) {
      changedSites++
    }
  }

  const phi = walker(plan, fear, V0)
  const perp = walker(plan, plain, V0)
  const free = walker(plan, fearFree, V0)
  const chi = productRole(ZERO, PLUS)
  const out: PullPart = {
    V0,
    held: phi.track,
    heldPerp: perp.track,
    free: free.track,
    changedSites,
    gAbs: [],
    gArg: [],
    chsh: [],
    leastW: [],
    leastS: [],
  }

  for (let t = 1; t <= plan.cycles; t++) {
    step(plan, phi, V0, t)
    step(plan, perp, V0, t)
    step(plan, free, V0, t)

    if (t % G_EVERY === 0) {
      const g = ballInner(plain, perp.x, phi.x)
      const rho = reducedRole(chi, g)
      const W = twoRoleWigner(rho)

      out.gAbs.push(Math.hypot(g[0], g[1]))
      out.gArg.push(Math.atan2(g[1], g[0]))
      out.chsh.push(roleChsh(rho))
      out.leastW.push(negativity(W).least)
      out.leastS.push(Math.min(...contextSums(W)))
      log(`V0 ${V0} cycle ${t}: g ${out.gAbs[out.gAbs.length - 1]!.toFixed(5)} arg ${out.gArg[out.gArg.length - 1]!.toFixed(4)} knot phi ${phi.track.every8[phi.track.every8.length - 1]} perp ${perp.track.every8[perp.track.every8.length - 1]} free ${free.track.every8[free.track.every8.length - 1]}`)
    }
  }

  phi.track.normAfter = ballNorm2(fear, phi.x)
  perp.track.normAfter = ballNorm2(plain, perp.x)
  free.track.normAfter = ballNorm2(fearFree, free.x)

  return out
}

export function combine(plan: PulledFearPlan, parts: PullPart[]): Verdict {
  const R1 = parts.every(
    p => p.held.late >= RETURN_FLOOR && p.held.late >= RETURN_RATIO * p.held.start,
  )
  const R2 = parts.every(
    p => p.held.normAfter >= KEPT_NORM && p.held.outMax <= OUT_WEIGHT,
  )
  const R3 = parts.every(
    p => p.free.normAfter <= FREE_NORM && p.free.late <= FREE_SHARE * p.held.late,
  )
  const E = parts.every(
    p =>
      Math.abs(p.heldPerp.late - (RECORDED[p.V0] ?? NaN)) <= SAME &&
      p.changedSites === 1,
  )
  const status = !(R1 && R2 && R3) ? 'fail' : !E ? 'partial' : 'pass'
  const line = (p: PullPart): string =>
    `V0 ${p.V0}: Phi held knot at 0 ${p.held.start.toExponential(2)}, late ${p.held.late.toFixed(4)} (Phi-perp ${p.heldPerp.late.toFixed(4)}), norm ${p.held.normAfter.toFixed(8)}, most past V_OUT ${p.held.outMax.toExponential(2)}; Phi free norm ${p.free.normAfter.toFixed(4)}, late ${p.free.late.toFixed(4)}; |g| ${Math.min(...p.gAbs).toFixed(4)} to ${Math.max(...p.gAbs).toFixed(4)}, role CHSH from |0>|+> up to ${Math.max(...p.chsh).toFixed(4)}, least W ${Math.min(...p.leastW).toFixed(5)}, least S ${Math.min(...p.leastS).toFixed(4)}; every 8 (knot/mean V) Phi ${p.held.every8.join(' ')}`
  const metrics: Record<string, number> = {
    R1: flag(R1),
    R2: flag(R2),
    R3: flag(R3),
    E: flag(E),
  }

  for (const p of parts) {
    metrics[`late_${p.V0}`] = p.held.late
    metrics[`start_${p.V0}`] = p.held.start
    metrics[`norm_${p.V0}`] = p.held.normAfter
    metrics[`out_${p.V0}`] = p.held.outMax
    metrics[`perpLate_${p.V0}`] = p.heldPerp.late
    metrics[`freeNorm_${p.V0}`] = p.free.normAfter
    metrics[`freeLate_${p.V0}`] = p.free.late
    metrics[`gAbsMin_${p.V0}`] = Math.min(...p.gAbs)
    metrics[`chshMax_${p.V0}`] = Math.max(...p.chsh)
    metrics[`leastW_${p.V0}`] = Math.min(...p.leastW)
    metrics[`leastS_${p.V0}`] = Math.min(...p.leastS)
    metrics[`changedSites_${p.V0}`] = p.changedSites
  }

  return verdict({
    status,
    claim: `R1 ${R1} R2 ${R2} R3 ${R3} E ${E}; ${parts.map(line).join('; ')}`,
    metrics,
    control: {
      R3: flag(R3),
      freeNorm: Math.max(...parts.map(p => p.free.normAfter)),
      E: flag(E),
    },
    notes: `L2. C* (E-FND-0160) on E-SPN-0178's reduced ball: weak string tau ${stringTau().toFixed(6)} cap ${CAP}, fear angle ${fearAngle().toFixed(6)} on the singlet channel at V = 0, radius ${plan.radius}, absorber from V ${plan.absorbFrom} at ${plan.strength}, knot V <= ${plan.knot}, late window ${plan.lateFrom} to ${plan.cycles}. An unlike pair (one love-tone, one fear-tone member); the Phi-perp channel is E-SPN-0178's run.`,
  })
}

export function pulledFearRun(plan: PulledFearPlan): Verdict {
  const group = ballGroup()

  return combine(
    plan,
    plan.pulls.map(V0 => pullPart(plan, V0, group)),
  )
}

export default experiment({
  id: 'spin/pulled-pair-fear',
  code: 'E-SPN-0179',
  title:
    "a register pair pulled from its knot still comes back with roles and the fear beat on (C*, E-FND-0160), pass: a love-fear pair's role space splits into the singlet, where the fear beat adds a phase at V = 0, and its complement, which is E-SPN-0178's run to the last digit; on the singlet channel the pair pulled to 8 or 10 swings back into the knot region (late means 0.187 and 0.095, against 0.230 and 0.102 without the fear beat) and stays held (norm to 4e-10, 8e-6 past V0 + 10), while the same pull with no string leaves (norm 0.387 and 0.392, late 0.019 and 0.020); the returning pair's roles grow entangled and contextual as it keeps meeting (|g| to 0.850, CHSH 2.023, least context sum 3.849)",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return pulledFearRun(GATE_PLAN)
  },
})
