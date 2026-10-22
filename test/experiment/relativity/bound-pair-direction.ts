// DOES BOUND MATTER ON THE CANDIDATE RULE MOVE THE SAME IN EVERY HUSK DIRECTION, AND OFF EVERY LINE (E-RLT-0115)? Open
// problem 1 of the readme: on the working rule every vibe is a lineon (E-SPN-0098), line-only matter is anisotropic at
// leading order (E-SPN-0126), and no composite of lineons gains a direction (E-RLT-0114). E-FND-0177 found that of 144
// variants of the candidate rule only the swap coin's one-beat walk and the Cl+(4) register keep R = tan m / m, K^2
// isotropy and one light speed, but it read LONE members only. This file reads a BOUND pair on the surviving variant.
//
// WHICH COIN THE BOUND-PAIR ENGINE RUNS (read from the code before anything was computed). Every bound-pair run on record
// (E-SPN-0162 to E-SPN-0214, E-MTR-0028 to 0031) runs code/measure/register-meson's coordinates or their reduction
// (code/measure/register-reduced, code/measure/register-track): two members carrying the Cl+(4) register, whose cycle is
// the dock mixer on the singlet sector Q_S, then the partner sector Q_D conjugated by the stream, with the swap coin built
// in (register-meson's full rule, against which every engine is witnessed, applies "the pieces, the swap coin X, the
// stream"). That is exactly E-FND-0177's register variant ("the swap coin built in, so the register is read at the swap
// coin and one schedule only"), one of the 26 survivors, at every mass. So no kernel change is needed: the engine
// already runs the surviving variant. The other survivor, the swap coin's one-beat walk on the 24 bare slots, has no
// bound pair to read: every binding tried on it leaks through its flat bands (E-SPN-0146 to 0161), which is why the
// register exists.
//
// THE OBJECT. The light register pair under the husk light's Coulomb count (E-SPN-0173's construction), on the husk
// quotient, reduced exactly by the cubic group (code/measure/register-reduced; E-SPN-0183 witnessed the reduction
// against E-SPN-0173 to 1e-15). Member m 0.427 (ringUnit(-5, 1), below pi/6 and below the swap coin's leak).
//
// DERIVED BEFORE THE RUN.
// 1. K^2 IS ISOTROPIC BY SYMMETRY FOR ONE LEVEL. The pair's cycle commutes with the 48 elements of O_h (the Coulomb count
//    breaks W(F4) to the cube's group). A K^2 coefficient is a symmetric rank-2 tensor, and the only one O_h keeps is a
//    multiple of the identity, so a NONDEGENERATE O_h-trivial level (A1g, the tracked level) has one curvature a in
//    every direction. So G1 is predicted to hold, to the read's own precision (E-SPN-0162 read 5e-7 and E-SPN-0173 2e-6
//    on two directions each). A level in a multiplet (E-SPN-0183 found them at weak pulls) could split anisotropically,
//    which is what G1 can catch.
// 2. WHY K^2 ISOTROPY ALONE DOES NOT ESCAPE THE LINE LAW. Twelve lineon branches averaged with equal weight also have an
//    isotropic K^2 (and K^4) term: the D4 roots are a spherical 5-design (E-SPN-0126). So a curvature read cannot tell a
//    3d band from a class average of line branches. What tells them apart is that the branches are separate states
//    with separate energies: at K = kappa n branch u sits at E_L + 4 a kappa^2 (n . u)^2 (a the averaged curvature), whose
//    rms spread over the twelve is 4 a kappa^2 sqrt(<(n . u)^4> - <(n . u)^2>^2) = 4 a kappa^2 sqrt(1/8 - 1/16) = a
//    kappa^2 in every direction (the 4-design moments). A filter far wider than that spread passes all twelve, so the
//    filtered state's one-cycle residual |U v - lambda v| / |v| is a kappa^2 for a lineon composite, and the residual
//    floor of a single band (no growth with kappa) for a 3d band. At kappa 0.16 and a 0.0183 (E-SPN-0173's R 8.46)
//    the lineon value is 4.7e-4, against a 2048-cycle Blackman-Harris filter whose main lobe is 4 x 2 pi / 2048 = 0.012
//    wide, which is about 26 times the splitting (so it cannot resolve the branches) and narrower than the pair's
//    other levels (about 0.07 away), so it removes them.
// 3. THE CONTROL'S NUMBERS (code/measure/lineon-branches, exact). The working rule's lone love, the fine coin of half-gap
//    m = pi/3, as twelve branches, read on the husk:
//    - massless (m = pi/3e6, E-SPN-0126's): group speed (1/12)|sum_u sign(n . u) u| = 0.35355 on an axis, 5/12 =
//      0.41667 on a face diagonal, 1/sqrt 6 = 0.40825 on a body diagonal, spread (max - min) / mean 0.158 over the 13
//      husk directions and about 0.22 over the octant grid (E-SPN-0126 printed 0.354 to 0.441, which is 20% of the
//      maximum and 22% of the mean: the "about 22%" of the readme);
//    - massive at leading order (kappa 1e-4): the drift is isotropic (a 2-design) but the branches' mean speed
//      (1/12) sum_u |v_u| runs 0.3190, 0.3679, 0.3485 of 2 e_2 kappa (axis, face, body), spread 0.139 over the 13; a
//      branch is aligned with a body diagonal for none of the twelve (each moves along a line's shadow, at least 35
//      degrees off it), and half the weight of an axis beam never moves;
//    - the branch residual over its own a kappa^2 is 1 in every direction (point 2).
//
// GATES, fixed before the run.
//  STAGE 1, the smallest cheap case: E-SPN-0173's point, a_B 3.5 on the husk ball of radius 16, the rule's own count.
//   W1 THE WITNESS: the axis read of this file's code (E-SPN-0173's filters 128, 512, 2048 for the level, 256 at K 0,
//      0.02, 0.04) gives R = c*^2 / (2 a E(0)) within 1e-6 (relative) of E-SPN-0173's recorded 8.459326179870311.
//   I1 THE MEMBER: its 16 phases equal the derived Dirac band at 5 momenta to 1e-12, and its R equals tan m / m to 1e-6
//      (code/measure/register-track's memberInstrument).
//   I2 ONE QUADRATIC LINE IN EVERY DIRECTION: at each of the 13 husk directions (3 axes, 6 face diagonals, 4 body
//      diagonals, each read in its own little group's sector) and one generic direction (0.29, 0.52, 0.8), d(0.04) /
//      d(0.02) within 0.1 of 4 and a > 0.
//   G1 LEADING-ORDER ISOTROPY: the spread (max - min) / mean of a over those 14 directions below 0.02.
//   G2 OFF EVERY LINE, AS ONE BAND: at kappa 0.16 along each body diagonal and the generic direction (no line casts any
//      of them), with the K read and its base both filtered 2048 cycles, the residual at most 0.1 a kappa^2 (a tenth of
//      what twelve line branches of the same curvature would leave), and the phase shift d(0.16) > 0.
//  STAGE 2, a lighter and weaker-bound level, run only after stage 1: E-SPN-0200's a_B 6 point (ball 27, N 8192, the
//   level tracked by its overlap with the hydrogenic reference, code/measure/register-track's readZero and readMotion),
//   read along one axis (1, 0, 0), one face diagonal (1, 1, 0) and one body diagonal (1, 1, 1) (stage 1 reads all 13; by
//   O_h the rest are images of these three).
//   W2 THE WITNESS: the axis read gives E-SPN-0200's recorded R 2.7194742442590423 within 1e-9 (relative): the kernel's
//      bytes do not depend on the thread count.
//   I3 the tracked line has a continuation at K and K / 2 in every direction, quadratic (ratio within 0.1 of 4).
//   G1' the spread of a over the three directions below 0.02.
//  CONTROL (the working rule's lineon, point 3): C1 the massless group speed on the axis, face and body equals 1 /
//   (2 sqrt 2), 5/12 and 1/sqrt 6 to 1e-6, and its spread is at least 0.1 over the 13 and over the octant grid (91 x
//   91); C2 at leading order the massive drift's spread over the 13 is below 1e-6 and the branch speed's at least 0.1;
//   C3 the aligned weight on every body diagonal (within 1 degree) is 0, and the branch residual over a kappa^2 at kappa
//   0.16 is within 0.05 of 1 in every direction. The control shows the instrument can read anisotropy and line
//   branching where they exist.
//  VERDICT: open if W1, I1, I2 or a control fails (or, once stage 2 runs, W2 or I3); fail (stuck on lines) if along some
//   body diagonal or the generic direction d(0.16) <= 0 or the residual is at least 0.5 a kappa^2 (lineon-like
//   branching); pass if G1, G2 and (when run) G1' hold; partial if G2 holds and G1 or G1' fails (mobile but
//   anisotropic); open otherwise (G2's residual between the two bounds).
//  READ, gating nothing: b(n) = 4 (d(0.04) - 4 d(0.02)) / (3 kappa^4), the K^4 coefficient, and its spread over the 14
//   directions (O_h allows a K^4 cubic anisotropy, n_x^4 + n_y^4 + n_z^4, which W(F4) would forbid; it is the pair's first
//   direction-dependent term, so it is reported, not predicted); every residual; the sectors' sizes.
// PREDICTED: W1, I1, I2 hold; G1 holds at the read's precision (below 1e-5); G2 holds (the members are 3d Dirac bands
//  under the dock mixer, E-SPN-0140 and E-SPN-0145, so the pair is one band); stage 2 the same. Verdict pass. This is a
//  confirmation that matter bound on the register rule inherits its members' isotropy and mobility, not an emergent
//  result: L2.
//
// THE RUN AND ITS COST, estimated before the run (from E-SPN-0200's logs: a C4v K read of 4,096 cycles on about 10,000
//  representatives took 460 s at 12 threads): stage 1 about 45 minutes and stage 2 about 2 hours at 6 threads, on a
//  loaded machine possibly twice that. The run stops at 8 hours with what has landed.
//
// FIRST RUN, STAGE 1 (2026-10-21, test/record/E-RLT-0115/rlt115-one.log and .json, 4,638 s at 6 native threads). No gate moved; one
// instrument check (I4) was added after the run and is disclosed here.
//  - W1, I1, I2 hold. The level reads E_L 1.6133573497835847 and the axis R 8.459326019 (recorded 8.459326180, 1.9e-8),
//    bit for bit E-SPN-0200's reduced read of the same point. Every one of the 14 directions holds one quadratic line
//    (ratios 3.9990 to 3.9993).
//  - G1 HOLDS: a runs 0.0183178024 to 0.0183178442 over the 3 axes, 6 face diagonals, 4 body diagonals and the generic
//    direction, spread 2.3e-6, against the lineon control's 0.158 (massless group speed over the same 13) and 0.139
//    (the massive lineon's branch speed). Equivalent directions agree to 1e-12.
//  - G2 COULD NOT BE READ. Its residual floor was mis-estimated: the level's own one-cycle residual at K = 0 is 1.5e-3
//    after the 2048 filter (and 1.0e-3 at kappa 0.16 on the axis, where a line is cast), three times the 4.7e-4 a
//    twelve-branch split would add, so the residual cannot see branching. Worse, two of the four body diagonals,
//    (1, 1, -1) and (1, -1, 1), read their K = 0 base at phase -0.055 instead of E_L (shifts 1.38e-3 and -1.90e-3),
//    while (1, 1, 1), (1, -1, -1) and the generic direction read 4.01e-4, 4.01e-4, 4.03e-4. A probe after the run
//    (test/record/E-RLT-0115/rlt115-probe.log, -probe2.log) found why: the reduced engine's sector of the little group of (1, 1, -1)
//    (elements 0, 14, 16, 30, 37, 45: the 3-cycles and transpositions with two sign flips) is unstable, its norm 1 for
//    512 cycles and then 2.8e11 at 1,024 and 2.9e152 at 4,096, while the sectors of (1, 0, 0), (1, 1, 0), (1, -1, 0)
//    and (1, 1, 1) stay at 1 over 4,096. The 256-cycle reads behind G1 lie inside the stable window (they match their
//    stable partners to 1e-12); the 2,048-cycle reads do not. As registered the verdict would be FAIL (stuck), which a
//    broken instrument cannot support, so I4 (the far reads' K = 0 bases agree within 1e-6) was added after the run,
//    and with it failing the verdict is OPEN. The mobility question goes to E-RLT-0116, with a line-resolving
//    instrument on the stable sectors.
//  - READ: the K^4 coefficient b is -0.0037 on the axes, -0.0028 on the face diagonals, -0.0025 on the body diagonals
//    (spread about 0.4 of its mean): the pair's first direction-dependent term is at K^4, the cubic harmonic O_h allows.
//  - The control holds (C1, C2, C3). Its grid spread is 0.199 (mean-normalized), not the 0.22 the header guessed;
//    E-SPN-0126's "20 percent" is the same range over its maximum, and 22% is it over the midrange.
//  STAGE 2 was started at 3 threads beside E-RLT-0116, stopped after its first K read when the cost showed it would
//    pass the 8-hour stop, and restarted with each direction written as it lands, in the order axis, body, face
//    (test/record/E-RLT-0115/rlt115-two.log and .json, 19,338 s at 3 threads). All three landed. W2 holds: the axis R is
//    2.7194742442590423, E-SPN-0200's to the bit at 3 threads against its 12. I3 holds (ratios 3.978, 3.973, 3.969).
//    G1' HOLDS: R 2.71947, 2.71794, 2.71535 on the axis, body and face diagonals, a spread of 1.5e-3 against 0.02.
//    That is 650 times stage 1's spread, as expected of the harmonic-inversion track (the ratios sit 0.02 to 0.03
//    below 4, so the K^4 term and the level's neighbors enter at that size), and it is still 100 times below the
//    lineon's 0.158.
//  VERDICT: OPEN, by I4. Leading-order isotropy holds at both points (G1, G1'). Mobility off lines is not read here.
//
// REDO AFTER THE ENGINE FIX (2026-10-21, vibe-roadmap-moving-matter-0008; test/record/E-RLT-0115/rrfix-rlt115.log, test/record/E-RLT-0115/rlt115-one-fixed.json,
// test/record/E-RLT-0115/rrfix-verdict115.log). The instability was in code/measure/register-reduced, not in the pair: at representatives
// with a stabilizer the reduced engine also stores a part no invariant state has, and for the tables sector() built
// directly for (1, 1, -1) and (1, -1, 1) the cycle amplified that part about 5% a cycle from rounding. Those two sectors
// are now built as the images of (1, 1, 1)'s under the flip of one coordinate, which commutes with the cycle; every other
// sector's tables are unchanged bit for bit (tmp/rrfix-tables.ts: 72 of 78 sector fingerprints identical, the 6 changed
// being these two at three radii). The redo read directions 10 and 11 again and spliced them into the recorded stage 1
// (stageOneRedo); the level, the axis read and the face read (1, 1, 0) reproduced the record to the bit. No gate moved.
//  - The two reads now equal their stable partners: a 0.0183178024, ratio 3.99935, and far bases 1.613341371278834 on
//    all four body diagonals and the axis (I4 holds, spread 2.2e-16), shifts 4.013e-4 on each body diagonal.
//  - As registered the verdict is FAIL: every off-line residual (9.84e-4 on the body diagonals, 9.96e-4 generic) is above
//    0.5 a kappa^2 = 2.34e-4, so "stuck" fires. That residual is the floor this header already disclosed: the level's own
//    one-cycle residual at K = 0 is 1.52e-3, and the axis far read (where a line is cast) leaves 1.03e-3, more than the
//    off-line reads. So the fail reads the instrument's floor, not twelve line branches; the line-resolving reads of
//    E-RLT-0116 and E-RLT-0117 found no weight left at rest on the body diagonal. Whether G2 should count as an instrument
//    failure is filed as a decision, not settled here.
//
// Depth L2 (a two-body quantum walk on the husk quotient, exact in its moving block; the lineon control is closed
// form). DETERMINISM: no random numbers; the starts are placed; the native kernel, byte for byte the JavaScript.

import { existsSync, readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import type { KernelOptions } from '@/code/kernel/index'
import { HUSK_DIRECTIONS } from '@/code/measure/composite-mobility'
import { lineClasses } from '@/code/measure/crossing-lines'
import {
  directionSpread,
  huskUnit,
  lineonBranches,
} from '@/code/measure/lineon-branches'
import { octantGrid, walkBand } from '@/code/measure/line-anisotropy'
import {
  pairAlong,
  pairLevel,
  quarticOf,
  type DirectionRead,
  type PairLevel,
} from '@/code/measure/pair-direction'
import {
  littleGroup,
  normalizeState,
  reducedCounts,
  reducedEngine,
  reducedFilter,
  reducedRead,
  sector,
  unfold,
} from '@/code/measure/register-reduced'
import {
  memberInstrument,
  readMotion,
  readZero,
  RECORDED,
  setup,
  TRACK_PLAN,
  type MotionRead,
  type Setup,
} from '@/code/measure/register-track'

const C_STAR2 = 0.5
const GENERIC: readonly number[] = [0.29, 0.52, 0.8]
const DIRECTIONS: readonly (readonly number[])[] = [...HUSK_DIRECTIONS, GENERIC]
const OFF_LINE: readonly number[] = [9, 10, 11, 12, 13]
const STAGE_ONE = { aB: 3.5, R: 16 } as const
const KAPPA = 0.04
const FAR = 0.16
const FAR_FILTER = 2048
const W1_TOLERANCE = 1e-6
const W2_RECORDED = 2.7194742442590423
const W2_TOLERANCE = 1e-9
const QUADRATIC = 0.1
const ISOTROPY = 0.02
const ONE_BAND = 0.1
const LINEON_LIKE = 0.5
const EXACT = 1e-6
const ANISOTROPIC = 0.1
const ALIGN = Math.PI / 180
const BRANCH_RESIDUAL = 0.05
const FAR_AGREE = 1e-6
const WORKING_M = Math.PI / 3
const MASSLESS_M = Math.PI / 3e6
const MASSLESS_KAPPA = 0.1
const LEADING_KAPPA = 1e-4
const GRID = 90
const STAGE_TWO_DIRECTIONS: readonly (readonly [number, number, number])[] = [
  [1, 0, 0],
  [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3)],
  [Math.SQRT1_2, Math.SQRT1_2, 0],
]

export const NATIVE: KernelOptions = { backend: 'native', threads: 6 }

const flag = (b: boolean): number => (b ? 1 : 0)
const HUSK_LINES = lineClasses()

// ---- the control: the working rule's lineon ----

export type ControlRead = {
  massless: number[]
  masslessGrid: { min: number; max: number; spread: number }
  masslessSpread: number
  driftSpread: number
  branchSpeeds: number[]
  branchSpread: number
  bodyAligned: number
  axisStill: number
  branchResidual: number[]
  C1: boolean
  C2: boolean
  C3: boolean
}

// the rms spread of the twelve branch energies at kappa over the class average's own a kappa^2
function branchResidual(input: {
  direction: readonly number[]
  kappa: number
  m: number
}): number {
  const n = huskUnit(input.direction)
  const shifts = HUSK_LINES.map(
    u => walkBand(input.m, input.kappa * u.reduce((s, x, c) => s + x * n[c]!, 0)).energy,
  )
  const mean = shifts.reduce((a, b) => a + b, 0) / shifts.length
  const rms = Math.sqrt(
    shifts.reduce((a, x) => a + (x - mean) ** 2, 0) / shifts.length,
  )

  return rms / mean
}

export function controlRead(): ControlRead {
  const massless = (d: readonly number[]): number =>
    lineonBranches({
      direction: d,
      kappa: MASSLESS_KAPPA,
      band: k => walkBand(MASSLESS_M, k),
      tolerance: ALIGN,
    }).groupSpeed
  const masslessValues = HUSK_DIRECTIONS.map(massless)
  const grid = octantGrid(GRID).map(n => massless(n.slice(0, 3)))
  const gridSpread = directionSpread(grid)
  const leading = HUSK_DIRECTIONS.map(d =>
    lineonBranches({
      direction: d,
      kappa: LEADING_KAPPA,
      band: k => walkBand(WORKING_M, k),
      tolerance: ALIGN,
    }),
  )
  const scale = (x: number): number => x / LEADING_KAPPA
  const driftSpread = directionSpread(leading.map(r => scale(r.groupSpeed))).spread
  const branchSpeeds = leading.map(r => scale(r.branchSpeed))
  const branchSpread = directionSpread(branchSpeeds).spread
  const bodyAligned = Math.max(...[9, 10, 11, 12].map(i => leading[i]!.aligned))
  const axisStill = leading[0]!.still
  const residuals = HUSK_DIRECTIONS.map(d =>
    branchResidual({ direction: d, kappa: FAR, m: WORKING_M }),
  )
  const masslessSpread = directionSpread(masslessValues).spread
  const C1 =
    Math.abs(masslessValues[0]! - 1 / (2 * Math.SQRT2)) <= EXACT &&
    Math.abs(masslessValues[3]! - 5 / 12) <= EXACT &&
    Math.abs(masslessValues[9]! - 1 / Math.sqrt(6)) <= EXACT &&
    masslessSpread >= ANISOTROPIC &&
    gridSpread.spread >= ANISOTROPIC
  const C2 = driftSpread <= EXACT && branchSpread >= ANISOTROPIC
  const C3 =
    bodyAligned === 0 &&
    residuals.every(r => Math.abs(r - 1) <= BRANCH_RESIDUAL)

  return {
    massless: masslessValues,
    masslessGrid: { min: gridSpread.min, max: gridSpread.max, spread: gridSpread.spread },
    masslessSpread,
    driftSpread,
    branchSpeeds,
    branchSpread,
    bodyAligned,
    axisStill,
    branchResidual: residuals,
    C1,
    C2,
    C3,
  }
}

// ---- stage 1 ----

export type FarRead = {
  direction: number[]
  base: number
  phase: number
  shift: number
  residual: number
}

// the level at kappa n and at 0 in the same little group's sector, both filtered S cycles
function farRead(input: {
  su: Setup
  level: PairLevel
  direction: readonly number[]
  kappa: number
  S: number
  opts: KernelOptions
}): FarRead {
  const { su, level, kappa, S, opts } = input
  const n = huskUnit(input.direction)
  const along = (k: number): number[] => [k * n[0]!, k * n[1]!, k * n[2]!, 0]
  const sk = sector(su.group, littleGroup(su.group, along(kappa)), level.R)
  const vk = unfold(level.s, level.v, sk)
  const countK = reducedCounts(sk, su.table, level.alpha, su.theta)
  const at = (k: number): { phase: number; residual: number } => {
    const ek = reducedEngine(sk, su.u, along(k), countK, 'vector', opts)
    const f = reducedFilter(ek, vk, level.EL, S)

    normalizeState(ek, f)

    return reducedRead(ek, f)
  }
  const base = at(0)
  const far = at(kappa)

  return {
    direction: n.slice(0, 3),
    base: base.phase,
    phase: far.phase,
    shift: far.phase - base.phase,
    residual: far.residual,
  }
}

export type StageOne = {
  EL: number
  levelResidual: number
  reps: number
  instrument: ReturnType<typeof memberInstrument>
  reads: DirectionRead[]
  far: FarRead[]
  seconds: number
}

export function stageOne(
  opts: KernelOptions,
  log: (what: string) => void = () => {},
): StageOne {
  const started = Date.now()
  const su = setup()
  const instrument = memberInstrument(su)
  const level = pairLevel({ su, aB: STAGE_ONE.aB, R: STAGE_ONE.R, opts })

  log(`stage 1 level ${level.EL} residual ${level.residual}`)

  const reads = DIRECTIONS.map(d => {
    const r = pairAlong({ su, level, direction: d, kappa: KAPPA, opts })

    log(`stage 1 ${d.join(',')}: little ${r.little}, reps ${r.reps}, a ${r.a}, ratio ${r.ratio}, residual ${r.residual}`)

    return r
  })
  const far = [0, ...OFF_LINE].map(i => {
    const r = farRead({
      su,
      level,
      direction: DIRECTIONS[i]!,
      kappa: FAR,
      S: FAR_FILTER,
      opts,
    })

    log(`stage 1 far ${DIRECTIONS[i]!.join(',')}: shift ${r.shift}, residual ${r.residual}`)

    return r
  })

  return {
    EL: level.EL,
    levelResidual: level.residual,
    reps: level.s.count,
    instrument,
    reads,
    far,
    seconds: (Date.now() - started) / 1000,
  }
}

// THE REDO after code/measure/register-reduced's fix (vibe-roadmap-moving-matter-0008): the sectors of (1, 1, -1) and
// (1, -1, 1) are now built as images of (1, 1, 1)'s, and every other sector's tables are unchanged bit for bit
// (tmp/rrfix-tables.ts), so only those two directions' reads (DIRECTIONS 10 and 11, far reads 2 and 3) can move. The
// redo reads them again on the same level and splices them into the recorded stage, and reads the axis (0) and the face
// diagonal (1, 1, 0) (3) again as witnesses that must equal the recorded ones to the bit.
export const REDO = [10, 11] as const
export const REDO_WITNESS = [0, 3] as const

export function stageOneRedo(
  old: StageOne,
  opts: KernelOptions,
  log: (what: string) => void = () => {},
): { one: StageOne; witness: { index: number; same: boolean }[]; level: boolean } {
  const started = Date.now()
  const su = setup()
  const level = pairLevel({ su, aB: STAGE_ONE.aB, R: STAGE_ONE.R, opts })
  const along = (i: number): DirectionRead =>
    pairAlong({ su, level, direction: DIRECTIONS[i]!, kappa: KAPPA, opts })
  const witness = REDO_WITNESS.map(i => {
    const r = along(i)

    log(`redo witness ${i}: a ${r.a}, recorded ${old.reads[i]!.a}`)

    return { index: i, same: JSON.stringify(r) === JSON.stringify(old.reads[i]) }
  })
  const reads = [...old.reads]
  const far = [...old.far]

  for (const i of REDO) {
    reads[i] = along(i)
    log(`redo ${i}: a ${reads[i]!.a}, ratio ${reads[i]!.ratio}`)

    const at = [0, ...OFF_LINE].indexOf(i)

    far[at] = farRead({ su, level, direction: DIRECTIONS[i]!, kappa: FAR, S: FAR_FILTER, opts })
    log(`redo far ${i}: base ${far[at]!.base}, shift ${far[at]!.shift}, residual ${far[at]!.residual}`)
  }

  return {
    one: { ...old, reads, far, seconds: old.seconds + (Date.now() - started) / 1000 },
    witness,
    level: level.EL === old.EL,
  }
}

// ---- stage 2 ----

export type StageTwo = {
  EL: number
  overlap: number
  motions: MotionRead[]
  seconds: number
}

export function stageTwo(
  opts: KernelOptions,
  log: (what: string) => void = () => {},
  // called after each direction with the stage so far (a long run keeps what has landed)
  landed: (partial: StageTwo) => void = () => {},
): StageTwo {
  const started = Date.now()
  const su = setup()
  const p = TRACK_PLAN.find(x => x.name === 'a6')!
  const zero = readZero(su, p, opts, log)
  const motions: MotionRead[] = []
  const now = (): StageTwo => ({
    EL: zero.tracked.E,
    overlap: zero.tracked.overlap,
    motions: [...motions],
    seconds: (Date.now() - started) / 1000,
  })

  for (const d of STAGE_TWO_DIRECTIONS) {
    motions.push(readMotion(su, p, zero, opts, log, undefined, d))
    landed(now())
  }

  return now()
}

// ---- the verdict ----

export function combine(input: {
  one: StageOne
  two: StageTwo | null
  control: ControlRead
}): Verdict {
  const { one, two, control } = input
  const as = one.reads.map(r => r.a)
  const axis = one.reads[0]!
  const R1 = C_STAR2 / (2 * axis.a * axis.base)
  const W1 = Math.abs(R1 / RECORDED.Rstatic - 1) <= W1_TOLERANCE
  const I1 = one.instrument.I1 && one.instrument.I2
  const I2 = one.reads.every(
    r => Math.abs(r.ratio - 4) <= QUADRATIC && r.a > 0,
  )
  const spread1 = directionSpread(as)
  const G1 = spread1.spread < ISOTROPY
  const aMean = spread1.mean
  const lineonResidual = aMean * FAR ** 2
  const offLine = one.far.slice(1)
  const G2 = offLine.every(
    f => f.shift > 0 && f.residual <= ONE_BAND * lineonResidual,
  )
  const stuck = offLine.some(
    f => f.shift <= 0 || f.residual >= LINEON_LIKE * lineonResidual,
  )
  const quartics = one.reads.map(r => r.b)
  const quarticSpread = directionSpread(quartics)

  let W2 = true
  let I3 = true
  let G1b = true
  let spread2 = NaN
  let a2: number[] = []
  let R2 = NaN
  let quartic2: number[] = []

  if (two) {
    const tracked = two.motions.map(m => m.tracked)

    I3 = tracked.every(t => t !== null && Math.abs(t.ratio - 4) <= QUADRATIC)
    a2 = tracked.map(t => (t ? t.a : NaN))
    R2 = tracked[0]?.R ?? NaN
    W2 = Math.abs(R2 / W2_RECORDED - 1) <= W2_TOLERANCE
    spread2 = directionSpread(a2).spread
    G1b = spread2 < ISOTROPY
    quartic2 = two.motions.map((m, i) =>
      tracked[i] ? quarticOf({ d1: tracked[i]!.d1, d2: tracked[i]!.d2, kappa: m.kappa }) : NaN,
    )
  }

  // I4, added AFTER the first run and disclosed in the header: the far reads' bases, all at K = 0 in sectors of one O_h
  // orbit or containing it, must agree; they did not, so G2 is an instrument failure, not a reading of the pair
  const bases = one.far.map(x => x.base)
  const I4 = Math.max(...bases) - Math.min(...bases) <= FAR_AGREE
  const instruments = W1 && I1 && I2 && W2 && I3 && I4
  const controls = control.C1 && control.C2 && control.C3
  // with G2's instrument failed (I4) the mobility off lines is unread here, so the verdict is open whatever G1 reads
  // (E-RLT-0116 reads it with an instrument that resolves lines)
  const status: Verdict['status'] = !instruments || !controls
    ? 'open'
    : stuck
      ? 'fail'
      : G2 && G1 && G1b
        ? 'pass'
        : G2
          ? 'partial'
          : 'open'
  const e = (x: number): string => x.toExponential(2)
  const f = (x: number, d = 6): string => x.toFixed(d)

  return verdict({
    status,
    claim: `stage 1 (a_B 3.5, R 16, E_L ${f(one.EL, 9)}): I4 ${I4} (far bases spread ${e(Math.max(...bases) - Math.min(...bases))}), W1 ${W1} (axis R ${f(R1, 9)} against ${RECORDED.Rstatic}), I1 ${I1}, I2 ${I2} (ratios ${f(Math.min(...one.reads.map(r => r.ratio)), 4)} to ${f(Math.max(...one.reads.map(r => r.ratio)), 4)}); a over the 13 husk directions and one generic ${f(spread1.min, 10)} to ${f(spread1.max, 10)}, spread ${e(spread1.spread)} (G1 ${G1}); at kappa ${FAR} off every line (4 body diagonals, generic) shifts ${offLine.map(x => e(x.shift)).join(' ')}, residuals ${offLine.map(x => e(x.residual)).join(' ')} against a kappa^2 ${e(lineonResidual)} for twelve line branches (G2 ${G2}, stuck ${stuck}); K^4 coefficient ${f(quarticSpread.min, 4)} to ${f(quarticSpread.max, 4)}, spread ${f(quarticSpread.spread, 4)}; stage 2 ${two ? `(a_B 6) W2 ${W2} (axis R ${f(R2, 10)}), I3 ${I3}, a ${a2.map(x => f(x, 9)).join(' ')} (axis, body, face, as landed), spread ${e(spread2)} (G1' ${G1b})` : 'not run'}; control lineon: massless group speed ${control.massless.slice(0, 1).concat(control.massless[3]!, control.massless[9]!).map(x => f(x, 5)).join(', ')} (axis, face, body), spread ${f(control.masslessSpread, 4)} over the 13 and ${f(control.masslessGrid.spread, 4)} over the grid (${f(control.masslessGrid.min, 4)} to ${f(control.masslessGrid.max, 4)}), massive drift spread ${e(control.driftSpread)} but branch speed spread ${f(control.branchSpread, 4)}, body-aligned weight ${control.bodyAligned}, axis weight still ${f(control.axisStill, 4)}, branch residual over a kappa^2 ${f(Math.min(...control.branchResidual), 4)} to ${f(Math.max(...control.branchResidual), 4)} (C1 ${control.C1}, C2 ${control.C2}, C3 ${control.C3})`,
    metrics: {
      W1: flag(W1),
      I4: flag(I4),
      farBaseSpread: Math.max(...bases) - Math.min(...bases),
      I1: flag(I1),
      I2: flag(I2),
      G1: flag(G1),
      G2: flag(G2),
      stuck: flag(stuck),
      W2: flag(W2),
      I3: flag(I3),
      G1b: flag(G1b),
      stageTwoRun: flag(two !== null),
      stageTwoDirections: two?.motions.length ?? 0,
      EL: one.EL,
      levelResidual: one.levelResidual,
      R1,
      aMin: spread1.min,
      aMax: spread1.max,
      isotropy: spread1.spread,
      lineonResidual,
      offLineResidualMax: Math.max(...offLine.map(x => x.residual)),
      offLineShiftMin: Math.min(...offLine.map(x => x.shift)),
      axisFarResidual: one.far[0]!.residual,
      quarticMin: quarticSpread.min,
      quarticMax: quarticSpread.max,
      quarticSpread: quarticSpread.spread,
      R2,
      isotropyTwo: spread2,
      seconds: one.seconds + (two?.seconds ?? 0),
    },
    control: {
      C1: flag(control.C1),
      C2: flag(control.C2),
      C3: flag(control.C3),
      masslessSpread: control.masslessSpread,
      masslessGridSpread: control.masslessGrid.spread,
      branchSpread: control.branchSpread,
      driftSpread: control.driftSpread,
      bodyAligned: control.bodyAligned,
    },
    notes: `L2. Stage 1: ${one.reps} O_h representatives, level residual ${e(one.levelResidual)}; per direction (little group, representatives, a, ratio, b, residual): ${one.reads.map(r => `${r.direction.map(x => f(x, 3)).join(',')} ${r.little} ${r.reps} ${f(r.a, 10)} ${f(r.ratio, 4)} ${f(r.b, 4)} ${e(r.residual)}`).join('; ')}. Far reads at kappa ${FAR}, filter ${FAR_FILTER}: ${one.far.map(x => `${x.direction.map(y => f(y, 3)).join(',')} shift ${e(x.shift)} residual ${e(x.residual)}`).join('; ')}. Stage 2 K^4: ${quartic2.map(x => f(x, 4)).join(' ')}. Control branch speeds over the 13 (per unit kappa): ${control.branchSpeeds.map(x => f(x, 5)).join(' ')}. ${f(one.seconds + (two?.seconds ?? 0), 0)} s.`,
  })
}

// the recorded parts (written by a runner of stageOne and stageTwo), else the run itself
const PARTS = 'tmp/rlt115'

const readPart = <T>(path: string): T | null =>
  existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as T) : null

export default experiment({
  id: 'relativity/bound-pair-direction',
  code: 'E-RLT-0115',
  title:
    "a bound register pair on the candidate rule moves the same in all 13 husk directions, fail as registered on its off-line residual: on the swap coin built into the Cl+(4) register (E-FND-0177's surviving variant, which every bound-pair engine already runs) E-SPN-0173's pair at a_B 3.5 has one K^2 coefficient 0.0183178 over the 3 axes, 6 face and 4 body diagonals and a generic direction, spread 2.3e-6, against 0.158 for the working rule's lineon over the same 13 (0.199 on a grid), and the lighter-bound a_B 6 pair (R 2.72, E-SPN-0200's axis read reproduced to the bit) agrees on an axis, a body and a face diagonal to 1.5e-3; its first direction-dependent term is K^4 (-0.0037 on the axes to -0.0025 on the body diagonals); after the reduced engine's fix (the (1, 1, -1) and (1, -1, 1) sectors built as images of (1, 1, 1)'s, every other sector bit for bit unchanged) all four body diagonals read the same base and shift 4.01e-4 at kappa 0.16, but their residual 9.84e-4 is above the 2.3e-4 the registered gate calls stuck, and it is the level's own floor (1.5e-3 at K 0, 1.0e-3 on the axis), not line branching, so mobility off lines is read in E-RLT-0116 and E-RLT-0117",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // stage 1 as redone after the reduced engine's fix (test/record/E-RLT-0115/run/rrfix-rlt115.ts, stageOneRedo); the first run's part is kept
    const one =
      readPart<StageOne>(`${PARTS}-one-fixed.json`) ??
      readPart<StageOne>(`${PARTS}-one.json`) ??
      stageOne(NATIVE)
    const two = readPart<StageTwo>(`${PARTS}-two.json`) ?? stageTwo(NATIVE)

    return combine({ one, two, control: controlRead() })
  },
})
