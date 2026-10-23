// IS THE REDUCED REGISTER-PAIR ENGINE'S NORM DRIFT THE OPEN EDGE OF THE HUSK BALL (E-SPN-0215)? The symmetry-reduced
// engine (code/measure/register-reduced) behind E-RLT-0115 to E-RLT-0118 runs the register pair on the husk ball of
// radius R, a neighbour outside the ball read as absent. In every body-diagonal sector at R 16 the Gram norm of the
// a_B 3.5 level, run at K 0.32 n, drifts 1.174e-5 over 4,096 cycles (vibe-roadmap-moving-matter-0009), identically in
// the stable (1, 1, 1) sector, so the cycle is not unitary to 1e-12 on the ball. This file asks where that goes.
//
// THE CANDIDATE, stated before the run. Amplitude that steps past the ball's edge is lost. A bound level's density at
// the edge goes as exp(-2R / a_B), about e^(-9.1) = 1.1e-4 at R 16, and its loss per cycle with it. Two predictions
// follow, and a third reading places the loss.
//   (a) THE LAW: on the ball the drift D(R) = 1 - N(4096) / N(0) falls as exp(-2R / a_B), about tenfold per 4 docks.
//   (b) THE CLOSED BOUNDARY: on the torus (the cube [-R, R]^3, each coordinate mod 2R + 1, register-reduced's
//       'torus' boundary, O_h symmetric about 0 and closed) nothing steps out, so the norm holds to rounding.
//   (c) THE PLACE: U^dag G U - G read on states held at one representative per shell is 0 to rounding deep inside the
//       ball and on every torus point, and nonzero on the edge shells.
// If (b) fails, the leak is not the edge: the next suspects are U^dag U - I itself (read by (c) on the torus) and the
// orbit weights of the points the group fixes (read by I_WEIGHT).
//
// THE RUN. The level of E-RLT-0116 and E-RLT-0118: E-SPN-0173's member (ringUnit(-5, 1)), a_B 3.5, the level from the
// hydrogenic start by the filters 128, 512, 2048 on the O_h sector (code/measure/pair-direction's pairLevel), on the
// ball of radius 12, 16, 20 and 24 and on the torus of radius 12 and 16. Each level is unfolded into the sector of
// the little group of K = 0.32 n, n = (1, 1, 1) / sqrt 3 (C3v), run 4,096 cycles at K = 0.32 n, its Gram norm read at
// 256, 512, 1,024, 2,048 and 4,096 (code/measure/reduced-unitarity's normTrack). The same level is also run at K = 0 on
// its O_h sector (read, gating nothing). On the ball and torus of radius 12, the (1, 1, 1) sector at K = 0.32 n, one
// state per shell r = 0 .. 12 (the first representative on it, the pattern's block there made invariant) gives the
// isometry defect <U v | G U v> / <v | G v> - 1.
//
// GATES, fixed before the run.
//  I0 THE WITNESS: the ball's R 16 drift is within 10% of the recorded 1.174e-5 (the same quantity is being read).
//  I_WEIGHT THE ORBIT WEIGHTS: the R 16 ball level, unit norm on its O_h sector, unfolded into the C3v sector and into
//     the sector of the identity alone (every point its own orbit), has Gram norm 1 within 1e-12 in both.
//  I_LOCAL THE PLACE: on the torus every shell's |defect| <= 1e-12; on the ball the largest |defect| over the shells
//     r >= R - 1 is at least 1e-8 (the instrument sees a loss where one is predicted).
//  G_CLOSED (b): on the torus of radius 12 and 16, |N(t) / N(0) - 1| <= 1e-12 at every checkpoint.
//  G_LAW (a): D(12) > D(16) > D(20) > D(24) > 0, and the least-squares slope of ln D against R lies within 25% of
//     -2 / a_B, in [-0.714, -0.429].
//  VERDICT: open if I0, I_WEIGHT or I_LOCAL fails; fail if G_CLOSED fails (a loss that is not the edge); pass if
//   G_CLOSED and G_LAW hold (the edge, by the bound tail's law); partial if G_CLOSED holds and G_LAW fails (the
//   edge, but not as the bound tail).
//  READ, gating nothing: D(4096) / D(2048) per radius (2 for a constant loss rate, 1 for a part that escapes once);
//   the K = 0 level's drift per radius; the innermost ball shell with |defect| > 1e-12.
// PREDICTED: I0, I_WEIGHT, I_LOCAL, G_CLOSED, G_LAW hold. Verdict pass. An instrument check of the engine: L1.
//
// COST, estimated before the run: the C3v sector has about 1,400, 3,100, 5,600 and 9,700 representatives at R 12 to
// 24 (ball) and 2,600 and 6,000 on the torus; at E-SPN-0200's 460 s per 4,096 cycles on 10,000 representatives at 12
// threads, about an hour at 6 native threads in all.
//
// THE RUN (2026-10-22, test/record/E-SPN-0215/edge-run.log and edge.json, 8,405 s at 6 native threads on a machine at
// load 45 to 175). No gate moved. VERDICT: PARTIAL as registered: the loss is the open edge, not the bound tail's law.
//  - I0, I_WEIGHT, I_LOCAL hold. The ball's R 16 drift is 1.17403e-5 (the recorded 1.174e-5). The level's norm is
//    1 - 2e-16 on O_h, 1 - 4e-16 unfolded on C3v and 1 + 1.1e-14 on the identity's sector (17,077 points). The torus's
//    isometry defect is at most 2.3e-15 on all 22 shells (0 to 21); on the ball it is at rounding to shell 5 (1.0e-14),
//    then -4.5e-13, +1.2e-10, +1.1e-7 from shell 6 to 8 and up to 1.3e-4 on the edge shells. It has both signs: the
//    ball's truncated step adds norm to some states as well as losing it.
//  - G_CLOSED HOLDS: on the torus N / N0 - 1 is 7.21e-13 (R 12) and 7.10e-13 (R 16) at 4,096 cycles, growing linearly
//    from 4.4e-14 at 256 (about 1.7e-16 a cycle, the rounding of one cycle). The closed boundary conserves the norm.
//  - G_LAW FAILS: D is 2.94e-4, 1.17e-5, -5.27e-7, -6.69e-7 at R 12, 16, 20, 24. Past R 20 the ball adds norm
//    instead of losing it, and the size stops falling. The K 0.32 n state is the K = 0 level boosted, not an eigenstate
//    at K, so it carries a part that reaches the edge (the 256-cycle dip is 2.5e-5, 4.2e-6, 2.3e-6, 1.5e-6, falling only
//    as about R^-2.5), and the edge's gain and loss on that part set the drift at large R.
//  - READ: the K = 0 level on its own O_h sector (a near-eigenstate) loses 4.22e-4, 1.88e-5, 7.95e-7, 3.18e-8 at R 12
//    to 24, always a loss, 22.5, 23.6 and 25.0 times less per 4 docks: exp(-0.791 R), about exp(-2.77 R / a_B), a
//    tail steeper than the hydrogenic exp(-2R / a_B) the gate assumed. D(4096) / D(2048) is 1.94, 1.88 at R 12 and 16
//    (a nearly constant rate), 0.85 and 1.23 at R 20 and 24 (where the sign has turned).
//  So the norm drift of vibe-roadmap-moving-matter-0009 is the open ball: closed, the cycle conserves the norm to
//  7e-13 over 4,096 cycles in the same sector. It is not the orbit weights (I_WEIGHT) and not U^dag U - I off the
//  edge (I_LOCAL). Its size is set by the part of the state that reaches the edge, which for a bound level falls as
//  exp(-0.79 R).
//
// Depth L1 (an instrument read of the reduced engine; no physics claim). DETERMINISM: no random numbers; the starts
// are placed (the hydrogenic profile, a fixed trigonometric pattern). The native kernel, byte for byte the JavaScript.

import { existsSync, readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import type { KernelOptions } from '@/code/kernel/index'
import { pairLevel } from '@/code/measure/pair-direction'
import {
  isometryDefect,
  localState,
  normTrack,
  stabilizers,
  type NormPoint,
} from '@/code/measure/reduced-unitarity'
import {
  littleGroup,
  normalizeState,
  reducedCounts,
  reducedEngine,
  reducedNorm2,
  sector,
  unfold,
  type Boundary,
} from '@/code/measure/register-reduced'
import { setup } from '@/code/measure/register-track'

const AB = 3.5
const KAPPA = 0.32
const BODY: readonly number[] = [1, 1, 1].map(x => x / Math.sqrt(3))
const CHECKPOINTS: readonly number[] = [256, 512, 1024, 2048, 4096]
const BALL_RADII: readonly number[] = [12, 16, 20, 24]
const TORUS_RADII: readonly number[] = [12, 16]
const LOCAL_R = 12
const RECORDED_DRIFT = 1.174e-5
const WITNESS = 0.1
const ROUNDING = 1e-12
const SEEN = 1e-8
const LAW_SLOPE = -2 / AB
const LAW_TOLERANCE = 0.25

export const NATIVE: KernelOptions = { backend: 'native', threads: 6 }

const along = (k: number): number[] => [k * BODY[0]!, k * BODY[1]!, k * BODY[2]!, 0]

export type DriftRead = {
  R: number
  boundary: Boundary
  reps: number
  EL: number
  moved: NormPoint[]
  zero: NormPoint[]
}

export type LocalRead = {
  boundary: Boundary
  R: number
  shells: { shell: number; rep: number; defect: number }[]
}

export type EdgePart = {
  drift: DriftRead[]
  local: LocalRead[]
  weight: { oh: number; body: number; identity: number }
  seconds: number
}

// one radius and boundary: the level, its K = 0 track on O_h and its K = 0.32 n track on C3v
export function driftRead(input: {
  R: number
  boundary: Boundary
  opts: KernelOptions
  log?: (what: string) => void
}): DriftRead {
  const { R, boundary, opts } = input
  const log = input.log ?? (() => {})
  const su = setup()
  const level = pairLevel({ su, aB: AB, R, opts, boundary })
  const ez = reducedEngine(
    level.s,
    su.u,
    [0, 0, 0, 0],
    reducedCounts(level.s, su.table, level.alpha, su.theta),
    'vector',
    opts,
  )
  const zero = normTrack(ez, level.v, CHECKPOINTS).points
  const sk = sector(su.group, littleGroup(su.group, along(KAPPA)), R, boundary)
  const vk = unfold(level.s, level.v, sk)
  const ek = reducedEngine(
    sk,
    su.u,
    along(KAPPA),
    reducedCounts(sk, su.table, level.alpha, su.theta),
    'vector',
    opts,
  )

  normalizeState(ek, vk)

  const moved = normTrack(ek, vk, CHECKPOINTS, w => log(`${boundary} R ${R} ${w}`)).points

  return { R, boundary, reps: sk.count, EL: level.EL, moved, zero }
}

// the isometry defect of one invariant state per shell, (1, 1, 1) sector at K = 0.32 n
export function localRead(input: {
  R: number
  boundary: Boundary
  opts: KernelOptions
}): LocalRead {
  const { R, boundary, opts } = input
  const su = setup()
  const level = pairLevel({ su, aB: AB, R, opts, boundary })
  const sk = sector(su.group, littleGroup(su.group, along(KAPPA)), R, boundary)
  const ek = reducedEngine(
    sk,
    su.u,
    along(KAPPA),
    reducedCounts(sk, su.table, level.alpha, su.theta),
    'vector',
    opts,
  )
  const stab = stabilizers(sk)
  const top = Math.max(...sk.shell)
  const shells: LocalRead['shells'] = []

  for (let r = 0; r <= top; r++) {
    const rep = sk.shell.findIndex(x => x === r)

    if (rep < 0) {
      continue
    }

    shells.push({ shell: r, rep, defect: isometryDefect(ek, localState(sk, rep, stab)) })
  }

  return { boundary, R, shells }
}

// the R 16 ball level's Gram norm on O_h, unfolded into C3v and into the identity's sector
export function weightRead(opts: KernelOptions): EdgePart['weight'] {
  const su = setup()
  const R = 16
  const level = pairLevel({ su, aB: AB, R, opts })
  const counts = (s: typeof level.s) => reducedCounts(s, su.table, level.alpha, su.theta)
  const norm = (members: number[]): number => {
    const s = sector(su.group, members, R)
    const e = reducedEngine(s, su.u, [0, 0, 0, 0], counts(s), 'vector', opts)

    return reducedNorm2(e, unfold(level.s, level.v, s))
  }
  const eo = reducedEngine(level.s, su.u, [0, 0, 0, 0], counts(level.s), 'vector', opts)

  return {
    oh: reducedNorm2(eo, level.v),
    body: norm(littleGroup(su.group, along(KAPPA))),
    identity: norm([0]),
  }
}

export function edgeRun(input: {
  opts: KernelOptions
  log?: (what: string) => void
  // called after each read with the part so far (a long run keeps what has landed)
  landed?: (part: EdgePart) => void
  // a part already landed: its reads are kept, not redone
  from?: EdgePart
}): EdgePart {
  const started = Date.now()
  const log = input.log ?? (() => {})
  const part: EdgePart = input.from ?? {
    drift: [],
    local: [],
    weight: { oh: NaN, body: NaN, identity: NaN },
    seconds: 0,
  }
  const before = part.seconds
  const land = (): void => {
    part.seconds = before + (Date.now() - started) / 1000
    input.landed?.(part)
  }

  if (Number.isNaN(part.weight.oh)) {
    part.weight = weightRead(input.opts)
    log(`weight ${JSON.stringify(part.weight)}`)
    land()
  }

  for (const boundary of ['torus', 'ball'] as const) {
    if (!part.local.some(l => l.boundary === boundary)) {
      part.local.push(localRead({ R: LOCAL_R, boundary, opts: input.opts }))
      log(`local ${boundary} ${JSON.stringify(part.local.at(-1)!.shells)}`)
      land()
    }
  }

  const plan: { R: number; boundary: Boundary }[] = [
    ...TORUS_RADII.map(R => ({ R, boundary: 'torus' as const })),
    ...BALL_RADII.map(R => ({ R, boundary: 'ball' as const })),
  ]

  for (const p of plan) {
    if (part.drift.some(d => d.R === p.R && d.boundary === p.boundary)) {
      continue
    }

    part.drift.push(driftRead({ ...p, opts: input.opts, log }))
    land()
  }

  land()

  return part
}

const flag = (b: boolean): number => (b ? 1 : 0)
const last = (ps: NormPoint[]): number => ps.at(-1)!.ratio
const at = (ps: NormPoint[], c: number): number => ps.find(p => p.cycle === c)!.ratio

// least-squares slope of y against x
const slope = (x: number[], y: number[]): number => {
  const mx = x.reduce((a, b) => a + b, 0) / x.length
  const my = y.reduce((a, b) => a + b, 0) / y.length

  let sxy = 0
  let sxx = 0

  x.forEach((v, i) => {
    sxy += (v - mx) * (y[i]! - my)
    sxx += (v - mx) ** 2
  })

  return sxy / sxx
}

export function edgeCombine(part: EdgePart): Verdict {
  const ball = BALL_RADII.map(R => part.drift.find(d => d.boundary === 'ball' && d.R === R)!)
  const torus = TORUS_RADII.map(R => part.drift.find(d => d.boundary === 'torus' && d.R === R)!)
  const D = ball.map(d => 1 - last(d.moved))
  const D16 = D[BALL_RADII.indexOf(16)]!
  const I0 = Math.abs(D16 / RECORDED_DRIFT - 1) <= WITNESS
  const I_WEIGHT =
    Math.abs(part.weight.body / part.weight.oh - 1) <= ROUNDING &&
    Math.abs(part.weight.identity / part.weight.oh - 1) <= ROUNDING
  const localTorus = part.local.find(l => l.boundary === 'torus')!
  const localBall = part.local.find(l => l.boundary === 'ball')!
  const torusDefect = Math.max(...localTorus.shells.map(s => Math.abs(s.defect)))
  const edgeDefect = Math.max(
    ...localBall.shells.filter(s => s.shell >= localBall.R - 1).map(s => Math.abs(s.defect)),
  )
  const I_LOCAL = torusDefect <= ROUNDING && edgeDefect >= SEEN
  const closedWorst = Math.max(...torus.flatMap(d => d.moved.map(p => Math.abs(p.ratio - 1))))
  const G_CLOSED = closedWorst <= ROUNDING
  const falling = D.every((x, i) => x > 0 && (i === 0 || x < D[i - 1]!))
  const s = falling ? slope([...BALL_RADII], D.map(Math.log)) : NaN
  const G_LAW =
    falling &&
    s >= LAW_SLOPE * (1 + LAW_TOLERANCE) &&
    s <= LAW_SLOPE * (1 - LAW_TOLERANCE)
  const innermost = localBall.shells.find(x => Math.abs(x.defect) > ROUNDING)?.shell ?? NaN
  const rate = ball.map(d => (1 - at(d.moved, 4096)) / (1 - at(d.moved, 2048)))
  const zeroDrift = ball.map(d => 1 - last(d.zero))
  const status: Verdict['status'] = !(I0 && I_WEIGHT && I_LOCAL)
    ? 'open'
    : !G_CLOSED
      ? 'fail'
      : G_LAW
        ? 'pass'
        : 'partial'
  const e = (x: number, d = 3): string => x.toExponential(d)

  return verdict({
    status,
    claim: `the reduced engine's norm drift over 4,096 cycles of the a_B 3.5 level at K 0.32 n (C3v): on the ball D = ${D.map(x => e(x)).join(', ')} at R ${BALL_RADII.join(', ')} (slope of ln D ${Number.isNaN(s) ? 'unread' : s.toFixed(4)} per dock against -2 / a_B = ${LAW_SLOPE.toFixed(4)}, G_LAW ${G_LAW}); on the closed torus the largest |N / N0 - 1| is ${e(closedWorst, 2)} at R ${TORUS_RADII.join(', ')} (G_CLOSED ${G_CLOSED}); the isometry defect of states held on one shell is at most ${e(torusDefect, 2)} on the torus and ${e(edgeDefect, 2)} on the ball's edge shells, nonzero from shell ${innermost} of ${localBall.R} out (I_LOCAL ${I_LOCAL}); the R 16 drift ${e(D16)} against the recorded ${RECORDED_DRIFT} (I0 ${I0}); orbit weights: the level's norm ${part.weight.oh} on O_h, ${part.weight.body} unfolded on C3v, ${part.weight.identity} on the identity (I_WEIGHT ${I_WEIGHT})`,
    metrics: {
      I0: flag(I0),
      I_WEIGHT: flag(I_WEIGHT),
      I_LOCAL: flag(I_LOCAL),
      G_CLOSED: flag(G_CLOSED),
      G_LAW: flag(G_LAW),
      ...Object.fromEntries(BALL_RADII.map((R, i) => [`drift${R}`, D[i]!])),
      ...Object.fromEntries(BALL_RADII.map((R, i) => [`zeroDrift${R}`, zeroDrift[i]!])),
      ...Object.fromEntries(BALL_RADII.map((R, i) => [`rate${R}`, rate[i]!])),
      slope: s,
      closedWorst,
      torusDefect,
      edgeDefect,
      innermost,
      seconds: part.seconds,
    },
    control: {
      lawSlope: LAW_SLOPE,
      recordedDrift: RECORDED_DRIFT,
    },
    notes: `L1. Tracks (cycle: N / N0) at K 0.32 n: ${part.drift.map(d => `${d.boundary} R ${d.R} (${d.reps} reps, E_L ${d.EL}) ${d.moved.map(p => `${p.cycle}: ${(p.ratio - 1).toExponential(3)}`).join(' ')}`).join('; ')}. K = 0 on O_h: ${part.drift.map(d => `${d.boundary} R ${d.R} ${(last(d.zero) - 1).toExponential(3)}`).join('; ')}. Isometry defect per shell, ball: ${localBall.shells.map(x => `${x.shell} ${x.defect.toExponential(2)}`).join(', ')}; torus: ${localTorus.shells.map(x => `${x.shell} ${x.defect.toExponential(2)}`).join(', ')}. ${part.seconds.toFixed(0)} s.`,
  })
}

export const PART = `${import.meta.dirname}/../../record/E-SPN-0215/edge.json`

export default experiment({
  id: 'spin/reduced-edge-leak',
  code: 'E-SPN-0215',
  title:
    "the reduced register-pair engine's norm drift is the open husk ball's edge, partial as registered (gates fixed before the run): on a closed torus boundary the a_B 3.5 level at K 0.32 n keeps its Gram norm to 7.1e-13 over 4,096 cycles at R 12 and 16, against the ball's 1.17e-5 at R 16, and a state held on one shell loses or gains norm only within 6 docks of the ball's edge (at most 2.3e-15 anywhere on the torus); but the ball's drift does not follow the bound tail's exp(-2R / a_B): it is 2.9e-4 and 1.2e-5 at R 12 and 16, then turns to a gain of 5e-7 to 7e-7 at R 20 and 24, set by the part of the boosted state that reaches the edge; the K = 0 level alone loses 4.2e-4 to 3.2e-8 from R 12 to 24, as exp(-0.79 R)",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const part = existsSync(PART)
      ? (JSON.parse(readFileSync(PART, 'utf8')) as EdgePart)
      : edgeRun({ opts: NATIVE })

    return edgeCombine(part)
  },
})
