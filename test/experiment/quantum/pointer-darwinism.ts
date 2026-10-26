// THE POINTER WITH A LARGER ENVIRONMENT, ITS REDUNDANCY, AND CHARGE SUPERSELECTION (E-QTM-0186, OPEN-QTM-05, 06, 14,
// path 4 of note/project/vibe/roadmap/quantum-coverage/paths.md). E-QTM-0166 found on C* (E-FND-0160), with ONE other
// hole as the environment, that a member superposed between pleasure-tone and pain-tone loses 2.0 to 3.2 times more
// coherence a beat than one superposed between two roles. Its named next step is a larger environment of holes. This
// file runs the same question with 1, 2 and 3 environment holes, the most the exact engine carries once every member
// has a role, and adds two reads: which basis the environment records redundantly (quantum Darwinism), and whether a
// superposition of different conserved count decoheres in every environment while same-count ones can survive (charge
// superselection).
//
// WHAT IS RUN.
//  - THE ENGINE. code/measure/role-holes: register-holes' exact n-hole store (the moving states, one half, fiber 8, the
//    pair piece a phase in relative sites, E-FND-0161) times 3^n role amplitudes, with C*'s fear beat as a role kernel
//    at contact (V = 0, both members in the beat's sector): a like pair takes exp(-i s w P_anti), an unlike pair
//    exp(-i s w Phi Phi^dag), w the knit's fear angle 2 pi / 3, s = +1 in beat 1 and -1 in beat 2, as E-QTM-0166's rule.
//    With two holes this is E-QTM-0166's channel construction exactly (I1 a). With three or more the kernels of
//    different pairs do not commute, so the roles are carried in full. The rule is E-SPN-0175's (the member mixers at
//    ringUnit(-1, 4), the sector string ringUnit(-2, 1) a unit of V capped at 8, the sector contact v^2 with v =
//    ringUnit(2, 0), hole angles reversed). Unlike E-QTM-0166 it runs on the moving states of one half, not the full
//    192-mode space, so its numbers are not E-QTM-0166's.
//  - SEVERAL MEMBERS AT ONE DOCK. C* does not say how the fear beat acts when three or more members meet in the sector at
//    one dock, where several pairs are at contact at once and their kernels do not commute. The gated runs take exp(-i s
//    w sum H), which has no order and equals the product whenever the pieces commute. The ordered product is run beside
//    it at L = 2 with two environment holes (READ), and every run reports the weight the pair steps found in such
//    configurations. This is an undefined piece of C*, not a choice of this file's to defend.
//  - THE SYSTEM is member 0, the ENVIRONMENT k = 1, 2, 3 pain-tone members. Branch L: member 0 pleasure-tone
//    (distinguishable from the environment, which is antisymmetrized within itself). Branch F: member 0 pain-tone,
//    every member antisymmetrized. The rule keeps each species' number, so the two branches never mix.
//  - THE SUPERPOSITIONS. Tone: (|L, 0> + |F, 0>), member 0's role |0> in both; its coherence is <Psi_F | Psi_L>, the
//    second-quantized flip's overlap, exactly as E-QTM-0166 point 2. Mixed: (|L, 0> + |F, 1>), the element of member
//    0's tone-and-role state between (L, |0>) and (F, |1>): sum over everything else of Psi_L[0] conj Psi_F[1]. Role:
//    member 0 pleasure-tone in (|a> + |b>) / sqrt 2 for every pair of states of each of the 4 role bases (12 cases),
//    from three runs (member 0 in |0>, |1>, |2>) by linearity. Each coherence is divided by its value at beat 0.
//  - THE STARTS. D: every member on one dock, member i in sector state i (momentum independent), the start of
//    E-QTM-0166's S1. B: member i in the positive-phase band's state i at a momentum class (L = 2, where every class is
//    its own negative: 1, 1 or 0, 1, 1 or 1, 1, 2, 2; L = 4: q, -q or 0, q, -q), delocalized.
//  - THE ENVIRONMENT'S ROLES. E1: the Z states |1>, |2>, |0> (the first k). E2: one state of each of the three other
//    role bases (line states 3, 6, 9), so the environment holds no single frame.
//  - THE BOXES. L = 2 (8 docks) with k = 1, 2, 3; L = 4 (128 docks) with k = 1, 2. Four holes on L = 4 with roles would
//    need 8.6e9 x 81 amplitudes. The largest runs hold 1.7e8 (L = 2, k = 3) and 2.3e8 (L = 4, k = 2) amplitudes a state,
//    three states at once, so they run start D with E2 only.
//  - REDUNDANCY. A fragment is m of the k environment holes' roles (m = 1 .. k), traced over every orbit and the rest.
//    For a pointer basis {|p>} the fragment's record is the Holevo quantity chi = S(mean rho_p) - mean S(rho_p) of the
//    fragment states rho_p left when member 0 starts in |p>, divided by the pointer's entropy (1 bit for the tone, log2 3
//    for a role basis). Quantum Darwinism's plateau is a record that one fragment already holds as well as the whole
//    environment (Zurek 2009, Zwolak, Riedel and Zurek 2014). For the tone a fragment of branch F is m of k + 1
//    identical members, which may include the system itself, so its chi is not 0 at beat 0: the tone's record is read as
//    the growth over beat 0. Fragments carry roles only: the records in positions and fibers are not read (their
//    reduced states are 192 to 3072 dimensional a member).
//
// DERIVED BEFORE THE GATE RUN (L1).
// 1. THE FEAR BEAT OFF SELECTS NOTHING. With no role kernel every piece is role-blind and the same for both species, so
//    U_L = U_F commutes with every member exchange: <U A psi | U psi> = <A psi | psi> and every role state is untouched.
//    Every coherence stays 1.
// 2. A TONE-BLIND, ROLE-READING KERNEL KEEPS THE TONE (the control). The control kernel exp(-i s w (n0_i + n0_j)), n0 the
//    member's count of role |0>, is the same for like and unlike pairs, so again U_L = U_F commutes with every exchange
//    and the tone coherence is 1 exactly, while the kernel is diagonal in Z and dephases role superpositions.
// 3. WHAT IS NOT DERIVABLE is whether the model's own kernels dephase the tone faster than the roles with more holes,
//    whether the gap grows or shrinks with k, and which basis the environment's roles record redundantly.
//
// PROBES BEFORE THE GATES, disclosed (tmp/pd186-probe1.ts, tmp/pd186-probe2.ts; the gates were written after them and
//  none moved after the gate run).
//  - probe1: the engine against the channel construction at two holes, 4.5e-16 (unlike) and 8.4e-16 (like) after 8
//    cycles on L = 2; a beat of four holes on L = 2 took 13 s on 12 threads before the role kernel was made sparse and
//    the small torus's transform a dense matrix, 6.5 s after (nothing moved: the check reran at 4.2e-16 and 8.7e-16).
//  - probe2, the small boxes for 96 beats, every case of the gate run with k <= 2 except none at L = 4 with k = 2:
//    tone against role loss, ratio, D start: L2k1 E1 0.333 / 0.106 (3.14), E2 0.410 / 0.258 (1.59); L4k1 E1 0.486 /
//    0.124 (3.93), E2 0.453 / 0.277 (1.63); L2k2 E1 0.556 / 0.219 (2.54), E2 0.599 / 0.421 (1.42). B start: 3.62, 1.60,
//    4.33, 1.76, 3.52, 1.76. The mixed superposition kept its coherence EXACTLY in every k = 1 E1 case: member 0's |1>
//    in branch F meets an environment member in |1>, where the like kernel's P_anti is 0, and member 0's |0> in branch
//    L meets |1>, where Phi Phi^dag is 0, so neither branch takes a kernel. The fear beat off moved nothing (1.6e-13), the
//    control kept the tone to 1.7e-13 and lost 0.333 on the role, the antisymmetry held to 3e-15. Every beat-1 pair
//    step on L = 2 from start D found all of its weight with three or more members at one dock (the 8-dock box brings
//    them back every cycle), and the ordered product moved L2k2 D E1 from 0.556 / 0.219 to 0.660 / 0.235 (2.81), and the
//    B start by 0.2%. The tone's record in roles read at beats 48, 56, .., 96 equaled its beat-0 value to 4 digits in
//    every E1 case; with E1 at k <= 2 no kernel acts in branch L at all and P_anti keeps branch F's role multiset, so
//    this is structural, but the reads also fall on the L = 2 box's recurrences, so the gate run reads every 3 beats.
//  - Changed after the probes, before the gate run: the mixed superposition was dropped from H1 (it loses less than
//    1.5 times the role in every E2 case: it carries a role change as well as a count change, and the control kernel
//    alone takes 0.61 of it); H2's floor went from 0.05 to 0.01 (the B start on L = 4 loses 0.031 to 0.038 over 96
//    beats because its members rarely meet, which is about meeting, not about which basis is kept); the reads went
//    from every 8 beats to every 3. H1's threshold stayed at E-QTM-0166's 1.5 although probe2 already shows L2k2 D E2
//    at 1.42: the gap closing as the environment grows is the read this file exists for.
//  - smoke (tmp, 4 beats): L = 2 with k = 3 ran every path, 12 s a beat for three states on a loaded machine.
// PREDICTED VERDICT: PARTIAL. H2 fails on the k = 1 E1 mixed case (seen in probe2, structural); H1 is expected to fail
//  on the E2 environments at k >= 2; P1 (1.1) is not expected to fire. B1 is a guess either way.
//
// HYPOTHESES AND GATES. loss_X = the mean over beats 1 .. 96 of 1 - D_X (D_X the coherence over its beat-0 value), for X
//  the tone, the mixed superposition, and the role (mean over the 12 role cases; loss_Rmin the least of the 4 bases'
//  means). A case is a box, a k, a start and an environment.
//  I1 INSTRUMENT. (a) With two holes the engine equals E-QTM-0166's channel construction (two register-holes runs, the
//     contact moved by 0 and 1 fear angles, times the role projectors), like and unlike, on L = 2 and L = 4, within 1e-12
//     after 16 cycles. (b) With three holes and the fear beat off, it equals one register-holes run times the role
//     product within 1e-12 after 8 cycles (L = 2). (c) Every run keeps its norm within 1e-9. (d) The fear beat off: every
//     coherence within 1e-9 of 1 at every beat (L = 2 with k = 1, 2 and L = 4 with k = 1, start D, E1). (e) Branch F
//     stays antisymmetric: every transposition residual at most 1e-9 at the end (L = 2 with k = 1, 2; L = 4 with k = 1).
//  C1 CONTROL. The control kernel of point 2 on L = 2 with k = 1, 2 and L = 4 with k = 1 (start D, E1): the tone within
//     1e-9 of 1 at every beat and loss_R >= 0.05. The other outcome is readable where the coupling makes it.
//  H1 THE POINTER IS THE COUNT. Every case: loss_T >= 1.5 loss_R (E-QTM-0166's threshold, kept).
//  P1 THE FALSIFIER. Some case has loss_T <= 1.1 loss_R.
//  H2 SUPERSELECTION. Every case: loss_T >= 0.01 and loss_M >= 0.01 (a superposition of different count decoheres in
//     every environment), and loss_Rmin <= 0.5 loss_T (some same-count superposition keeps at least half again).
//  H3 THE ENVIRONMENT GROWS. Start D, E2: loss_T at the largest k >= loss_T at k = 1, on both boxes.
//  B1 REDUNDANCY. At the largest environments (L = 2 k = 3, L = 4 k = 2): the tone's record growth in one environment
//     hole (late mean, beats 48 .. 96) is at least half its growth in all k, and at least 0.01; and it exceeds every role
//     basis's record in one hole.
// VERDICT. Fail if P1 fires. Pass if H1, H2, H3, B1, I1 and C1 hold. Partial otherwise.
// READ, gating nothing: every loss and first-beat loss; the per-basis role losses; the ratio's trend with k; the
//  multi-contact weight; the ordered-product runs; every chi at m = 1 .. k, at beat 0 and late.
//
// FIRST RUN 2026-10-24 (tmp/pd186-gate-E-QTM-0186.log in the experiment/moving-matter-next worktree, 7150 s):
// PARTIAL, as predicted. No gate moved and none was rerun. The cases with k <= 2 equal probe2's to every printed digit.
//  - H1 fails, P1 does not fire. Tone against role loss a beat, start D: E1 (environment in the Z frame) 3.14 (L2k1),
//    2.54 (L2k2), 3.93 (L4k1); E2 (environment in three other frames) 1.59, 1.42, 1.28 on L = 2 as k goes 1, 2, 3, and
//    1.63, 1.54 on L = 4 as k goes 1, 2. B start: 3.62, 1.60, 4.33, 1.76, 3.52, 1.76. The least ratio is 1.28 (L2k3 D
//    E2: tone 0.679, role 0.531). The count always dephases faster, but in a frame-mixed environment the gap closes as
//    holes are added: the role catches up, it is not the count that slows.
//  - H2 fails on the k = 1 E1 mixed superposition, which keeps its coherence exactly on both boxes and both starts
//    (structural, see probe2): a superposition of different count survives an environment whose roles make neither
//    branch's kernel act. Every tone superposition lost at least 0.031. H2's role clause (some role basis loses at most
//    half what the tone loses) also fails in every E2 case with k >= 2: the least lossy basis loses 0.364 (L2k2 D), 0.523
//    (L2k3), 0.409 (L4k2) against half the tone's 0.299, 0.340, 0.356, and 0.0545 against 0.0540 for L2k2 B. In a
//    frame-mixed environment of two or three holes no role superposition survives markedly better than the count.
//  - H3 holds: start D E2, tone loss 0.410 -> 0.679 on L = 2 (k 1 -> 3), 0.453 -> 0.713 on L = 4 (k 1 -> 2).
//  - B1 fails on L = 2 only. Tone record growth in roles (bits, late mean minus beat 0): L2k3 0.102, 0.195, 0.263 for
//    m = 1, 2, 3 (one hole holds 0.39 of all three: no plateau); L4k2 0.102, 0.090 for m = 1, 2 (one hole holds all of
//    it: a plateau). The best role basis in one hole: 0.057 (L2k3) and 0.058 (L4k2) of log2 3, against 0.39 and 0.21 in
//    every hole: the roles are recorded mostly in correlations across holes, the count more locally.
//  - The role basis follows the environment's frame: with E1 the Z basis loses 0.188 / 0.224 / 0.385 against 0.079 /
//    0.090 / 0.163 for the other three (L2k1, L4k1, L2k2), and the Z record in one hole is the largest (0.136 / 0.188 /
//    0.088 against 0.112 / 0.093 / 0.071). With E2 the class of the environment's own state leads at k = 1, and at k = 3
//    the three frames it holds read alike (0.523 each, Z 0.556).
//  - C1 holds (tone kept to 1.7e-13, role loss 0.333, 0.441, 0.333); I1 holds (engine 1.8e-15 and 3.3e-16, norms to
//    1.2e-11, fear off 1.7e-13, antisymmetry 3.3e-15).
//  - Reads: the multi-contact weight a pair step is 0.50 on L = 2 from start D (every beat 1), 0.008 from start B, 0.17
//    on L4k2; the ordered product moved L2k2 D E1 to 2.81 from 2.54 and the B start by 0.2%.
//
// WHAT THIS CAN AND CANNOT SHOW. It can show, at L2, whether the count stays the pointer when the environment grows from
// one to three holes, whether the role keeps more coherence than the count in every such environment, and which basis
// the environment's roles copy. It cannot show einselection as a rate (the boxes recur), cannot read records in
// positions, and the charge superposition is put in by hand. Three environment holes are not a bath. C* is not the
// adopted rule, the D4 torus is not the husk, and no ledger row becomes held from it.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  partnerProjector48,
  registerPiece,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import { torus } from '@/code/measure/register-sea'
import {
  bandVectors,
  holeCycle,
  holeEngine,
  holeFrame,
  newHoles,
  pairAngles,
  type HoleFrame,
  type Holes,
} from '@/code/measure/register-holes'
import {
  exchangeResidual,
  holevoBits,
  pairChannel,
  roleEngine,
  roleLines,
  roleStart,
  type RoleEngine,
  type RoleKernelForm,
  type RoleMember,
  type RoleState3,
} from '@/code/measure/role-holes'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const VERTEX: readonly [number, number] = [2, 0]
const FEAR: readonly [number, number] = [0, 2]
const CAP = 8
const ENGINE_TOL = 1e-12
const NORM_TOL = 1e-9
const OFF_TOL = 1e-9
const ANTI_TOL = 1e-9
const CONTROL_TONE_TOL = 1e-9
const CONTROL_ROLE_LOSS = 0.05
const H1_RATIO = 1.5
const P1_RATIO = 1.1
const H2_LOSS = 0.01
const H2_KEEP = 0.5
const B1_PLATEAU = 0.5
const B1_FLOOR = 0.01
const LOG3 = Math.log2(3)

type StartName = 'D' | 'B'
type EnvName = 'E1' | 'E2'

export type DarwinPlan = {
  beats: number
  readEvery: number
  lateFrom: number
  threads: number
  checkCycles: number
  configs: {
    L: number
    k: number
    starts: StartName[]
    envs: EnvName[]
    // run the fear beat off and the control kernel (start D, E1), the antisymmetry check, the ordered product
    checks: boolean
    product: boolean
  }[]
}

const PLAN: DarwinPlan = {
  beats: 96,
  // 3 is prime to the L = 2 box's recurrences (8 and 24 beats), which a read every 8 beats sampled in the probes
  readEvery: 3,
  lateFrom: 48,
  threads: 12,
  checkCycles: 16,
  configs: [
    { L: 2, k: 1, starts: ['D', 'B'], envs: ['E1', 'E2'], checks: true, product: false },
    { L: 4, k: 1, starts: ['D', 'B'], envs: ['E1', 'E2'], checks: true, product: false },
    { L: 2, k: 2, starts: ['D', 'B'], envs: ['E1', 'E2'], checks: true, product: true },
    { L: 2, k: 3, starts: ['D'], envs: ['E2'], checks: false, product: false },
    { L: 4, k: 2, starts: ['D'], envs: ['E2'], checks: false, product: false },
  ],
}

// ---- complex helpers on 3 x 3 and D x D role matrices ----

type CM = { re: Float64Array; im: Float64Array }

const LINES = roleLines()
const CLASS_PAIRS: readonly [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 2],
]

// sum over r, r' of chi_r conj(chi_r') X[r][r'] for D x D matrices X[r][r'] (X[r'][r] = X[r][r']^dag)
function combine(X: CM[][], chi: RoleState3, D: number): CM {
  const out = { re: new Float64Array(D * D), im: new Float64Array(D * D) }

  for (let r = 0; r < 3; r++) {
    for (let q = 0; q < 3; q++) {
      // c = chi_r conj(chi_q)
      const cr = chi.re[r]! * chi.re[q]! + chi.im[r]! * chi.im[q]!
      const ci = chi.im[r]! * chi.re[q]! - chi.re[r]! * chi.im[q]!

      if (cr === 0 && ci === 0) {
        continue
      }

      const M = X[r]![q]!

      for (let k = 0; k < D * D; k++) {
        out.re[k]! += cr * M.re[k]! - ci * M.im[k]!
        out.im[k]! += cr * M.im[k]! + ci * M.re[k]!
      }
    }
  }

  return out
}

const dagger = (M: CM, D: number): CM => {
  const re = new Float64Array(D * D)
  const im = new Float64Array(D * D)

  for (let i = 0; i < D; i++) {
    for (let j = 0; j < D; j++) {
      re[i * D + j] = M.re[j * D + i]!
      im[i * D + j] = -M.im[j * D + i]!
    }
  }

  return { re, im }
}

// <a| rho |b> on a 3 x 3 rho
function sandwich(rho: CM, a: RoleState3, b: RoleState3): [number, number] {
  let sr = 0
  let si = 0

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      // conj(a_i) rho_ij b_j
      const pr = rho.re[i * 3 + j]! * b.re[j]! - rho.im[i * 3 + j]! * b.im[j]!
      const pi = rho.re[i * 3 + j]! * b.im[j]! + rho.im[i * 3 + j]! * b.re[j]!

      sr += a.re[i]! * pr + a.im[i]! * pi
      si += a.re[i]! * pi - a.im[i]! * pr
    }
  }

  return [sr, si]
}

const superpose = (a: RoleState3, b: RoleState3): RoleState3 => ({
  re: a.re.map((x, i) => (x + b.re[i]!) * Math.SQRT1_2),
  im: a.im.map((x, i) => (x + b.im[i]!) * Math.SQRT1_2),
})

const mean = (x: readonly number[]): number =>
  x.reduce((s, y) => s + y, 0) / x.length

// ---- the setup ----

type Setup = {
  fear: number
  frames: Map<number, HoleFrame>
  angles: Map<number, Float64Array>
  angleAt: (L: number, ch: number) => Float64Array
}

function setup(): Setup {
  const unitOf = (kj: readonly [number, number]): [number, number] => {
    const th = unitAngle(ringUnit(kj[0], kj[1]))

    return [Math.cos(th), Math.sin(th)]
  }

  const u = unitOf(LIGHT)
  const sAng = unitAngle(ringUnit(STRING[0], STRING[1]))
  const vAng = unitAngle(ringUnit(VERTEX[0], VERTEX[1]))
  const fear = unitAngle(ringUnit(FEAR[0], FEAR[1]))
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const Ps = [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])]
  const frames = new Map<number, HoleFrame>()
  const angles = new Map<number, Float64Array>()

  for (const L of [2, 4]) {
    const t = torus(L)

    frames.set(L, holeFrame(t, Ps, 8))
    angles.set(L, pairAngles(t, -sAng, CAP, -2 * vAng))
  }

  return {
    fear,
    frames,
    angles,
    angleAt: (L, ch) =>
      pairAngles(frames.get(L)!.t, -sAng, CAP, -2 * vAng - ch * fear),
  }
}

function envRoles(env: EnvName, k: number): RoleState3[] {
  const pick = env === 'E1' ? [1, 2, 0] : [3, 6, 9]

  return pick.slice(0, k).map(i => LINES[i]!)
}

function startMomenta(fr: HoleFrame, n: number): number[] {
  const F = fr.fourier

  // on L = 2 every class is its own negative
  if (fr.t.L === 2) {
    return n === 3 ? [0, 1, 1] : [1, 1, 2, 2].slice(0, n)
  }

  const a = 1
  const b = 2

  if (n === 2) {
    return [a, F.neg[a]!]
  }

  if (n === 3) {
    return [0, a, F.neg[a]!]
  }

  return [a, F.neg[a]!, b, F.neg[b]!]
}

function members(
  fr: HoleFrame,
  start: StartName,
  roles: readonly RoleState3[],
): RoleMember[] {
  const n = roles.length

  if (start === 'D') {
    return roles.map((role, i) => ({ role, fiber: i }))
  }

  const js = startMomenta(fr, n)

  return roles.map((role, i) => ({
    role,
    momentum: js[i]!,
    vector: bandVectors(fr, js[i]!).up[i]!,
  }))
}

// ---- one case ----

type CaseResult = {
  name: string
  L: number
  k: number
  start: StartName
  env: EnvName
  form: RoleKernelForm
  compose: 'sum' | 'product'
  lossT: number
  lossM: number
  lossR: number
  lossRByClass: number[]
  firstT: number
  firstM: number
  firstR: number
  toneOff: number
  allOff: number
  normResidual: number
  antiResidual: number
  multi: number
  chiT0: number[]
  chiTLate: number[]
  chiR0: number[][]
  chiRLate: number[][]
  reads: Record<string, number>
}

function runCase(input: {
  S: Setup
  plan: DarwinPlan
  L: number
  k: number
  start: StartName
  env: EnvName
  form: RoleKernelForm
  compose: 'sum' | 'product'
  darwin: boolean
  anti: boolean
  log: (s: string) => void
}): CaseResult {
  const { S, plan, L, k, start, env, form, compose, darwin, anti, log } = input
  const n = k + 1
  const fr = S.frames.get(L)!
  const name = `L${L}k${k}${start}${env}${form === 'model' ? '' : form}${compose === 'sum' ? '' : 'Product'}`
  const species = [0, ...new Array<number>(k).fill(1)]
  const e: RoleEngine = roleEngine({
    frame: fr,
    n,
    total: 0,
    angle: S.angles.get(L)!,
    fear: S.fear,
    rules: [
      { form, species, compose },
      { form, species: new Array<number>(n).fill(1), compose },
    ],
    states: 3,
    threads: plan.threads,
  })
  const envR = envRoles(env, k)
  const groupL = [Array.from({ length: k }, (_, i) => i + 1)]
  const groupF = [Array.from({ length: n }, (_, i) => i)]
  const readBeats = new Set<number>()

  for (let b = 0; b <= plan.beats; b += plan.readEvery) {
    readBeats.add(b)
  }

  let normResidual = 0
  let allOff = 0

  // ---------------- pass A: member 0 pleasure-tone in |0>, |1>, |2> ----------------
  for (let r = 0; r < 3; r++) {
    roleStart({
      engine: e,
      x: r,
      members: members(fr, start, [LINES[r]!, ...envR]),
      groups: groupL,
    })
  }

  const roleCases = [0, 1, 2, 3].flatMap(c =>
    CLASS_PAIRS.map(([p, q]) => ({
      c,
      a: LINES[3 * c + p]!,
      b: LINES[3 * c + q]!,
    })),
  )
  const firstMatrices = (): CM[][] => {
    const X: CM[][] = [[], [], []]

    for (let r = 0; r < 3; r++) {
      for (let q = r; q < 3; q++) {
        const m = e.crossFirst(r, q)

        X[r]![q] = m

        if (q !== r) {
          X[q]![r] = dagger(m, 3)
        }
      }
    }

    return X
  }
  const roleCoherence = (X: CM[][]): [number, number][] =>
    roleCases.map(rc => sandwich(combine(X, superpose(rc.a, rc.b), 3), rc.a, rc.b))
  const fragmentRecords = (): number[][] => {
    // F[r][q][m - 1]
    const F: CM[][][] = [[], [], []]

    for (let r = 0; r < 3; r++) {
      for (let q = r; q < 3; q++) {
        const ms = e.crossFragments(r, q)

        F[r]![q] = ms

        if (q !== r) {
          F[q]![r] = ms.map((M, i) => dagger(M, 3 ** (i + 1)))
        }
      }
    }

    return [0, 1, 2, 3].map(c =>
      Array.from({ length: k }, (_, i) => {
        const D = 3 ** (i + 1)
        const X = F.map(row => row.map(ms => ms[i]!))
        const states = [0, 1, 2].map(j => combine(X, LINES[3 * c + j]!, D))

        return holevoBits(states, D) / LOG3
      }),
    )
  }

  const role0 = roleCoherence(firstMatrices())
  const roleLossBeats: number[][] = []
  const chiR0 = darwin ? fragmentRecords() : []
  const chiRLate: number[][] = [0, 1, 2, 3].map(() => new Array<number>(k).fill(0))

  let lateReads = 0

  for (let beat = 1; beat <= plan.beats; beat++) {
    const bb: 1 | 2 = beat % 2 === 1 ? 1 : 2

    for (let r = 0; r < 3; r++) {
      e.beat(r, 0, bb)
    }

    const now = roleCoherence(firstMatrices())
    const D = now.map((x, i) => Math.hypot(x[0], x[1]) / Math.hypot(role0[i]![0], role0[i]![1]))

    roleLossBeats.push(D.map(x => 1 - x))

    if (form === 'off') {
      for (const x of D) {
        allOff = Math.max(allOff, Math.abs(x - 1))
      }
    }

    if (darwin && readBeats.has(beat) && beat >= plan.lateFrom) {
      const rec = fragmentRecords()

      rec.forEach((row, c) => row.forEach((x, i) => {
        chiRLate[c]![i]! += x
      }))
      lateReads++
    }
  }

  if (darwin) {
    chiRLate.forEach(row => row.forEach((_, i) => {
      row[i]! /= lateReads
    }))
  }

  for (let r = 0; r < 3; r++) {
    normResidual = Math.max(normResidual, Math.abs(e.norm(r) - 1))
  }

  const multiA = e.takeMulti()

  log(`${name} pass A done: multi ${(multiA.weight / multiA.steps).toFixed(4)} norm ${normResidual.toExponential(2)} seconds ${JSON.stringify(e.seconds)}`)

  // ---------------- pass B: L |0>, F |0>, F |1> ----------------
  roleStart({ engine: e, x: 0, members: members(fr, start, [LINES[0]!, ...envR]), groups: groupL })
  roleStart({ engine: e, x: 1, members: members(fr, start, [LINES[0]!, ...envR]), groups: groupF })
  roleStart({ engine: e, x: 2, members: members(fr, start, [LINES[1]!, ...envR]), groups: groupF })

  const tone = (): [number, number] => {
    const m = e.crossFirst(0, 1)

    return [m.re[0]! + m.re[4]! + m.re[8]!, m.im[0]! + m.im[4]! + m.im[8]!]
  }
  const mixed = (): [number, number] => {
    const m = e.crossFirst(0, 2)

    return [m.re[1]!, m.im[1]!]
  }
  const toneRecords = (): number[] => {
    const a = e.crossFragments(0, 0)
    const b = e.crossFragments(1, 1)

    return a.map((M, i) => holevoBits([M, b[i]!], 3 ** (i + 1)))
  }

  const t0 = tone()
  const m0 = mixed()
  const chiT0 = darwin ? toneRecords() : []
  const chiTLate = new Array<number>(k).fill(0)
  const toneLoss: number[] = []
  const mixedLoss: number[] = []

  let toneOff = 0

  lateReads = 0

  for (let beat = 1; beat <= plan.beats; beat++) {
    const bb: 1 | 2 = beat % 2 === 1 ? 1 : 2

    e.beat(0, 0, bb)
    e.beat(1, 1, bb)
    e.beat(2, 1, bb)

    const t = tone()
    const m = mixed()
    const dT = Math.hypot(t[0], t[1]) / Math.hypot(t0[0], t0[1])
    const dM = Math.hypot(m[0], m[1]) / Math.hypot(m0[0], m0[1])

    toneLoss.push(1 - dT)
    mixedLoss.push(1 - dM)
    toneOff = Math.max(toneOff, Math.abs(dT - 1))

    if (form === 'off') {
      allOff = Math.max(allOff, Math.abs(dT - 1), Math.abs(dM - 1))
    }

    if (darwin && readBeats.has(beat) && beat >= plan.lateFrom) {
      toneRecords().forEach((x, i) => {
        chiTLate[i]! += x
      })
      lateReads++
    }
  }

  if (darwin) {
    chiTLate.forEach((_, i) => {
      chiTLate[i]! /= lateReads
    })
  }

  for (let x = 0; x < 3; x++) {
    normResidual = Math.max(normResidual, Math.abs(e.norm(x) - 1))
  }

  const antiResidual = anti ? exchangeResidual({ engine: e, x: 1, groups: groupF }) : 0
  const multiB = e.takeMulti()

  e.close()

  const lossRByClass = [0, 1, 2, 3].map(c =>
    mean(roleLossBeats.map(row => mean(row.filter((_, i) => roleCases[i]!.c === c)))),
  )
  const result: CaseResult = {
    name,
    L,
    k,
    start,
    env,
    form,
    compose,
    lossT: mean(toneLoss),
    lossM: mean(mixedLoss),
    lossR: mean(roleLossBeats.map(mean)),
    lossRByClass,
    firstT: toneLoss[0]!,
    firstM: mixedLoss[0]!,
    firstR: mean(roleLossBeats[0]!),
    toneOff,
    allOff,
    normResidual,
    antiResidual,
    multi: (multiA.weight + multiB.weight) / (multiA.steps + multiB.steps),
    chiT0,
    chiTLate,
    chiR0,
    chiRLate,
    reads: {
      toneB8: 1 - toneLoss[Math.min(7, toneLoss.length - 1)]!,
      roleB8: 1 - mean(roleLossBeats[Math.min(7, toneLoss.length - 1)]!),
      toneB24: 1 - toneLoss[Math.min(23, toneLoss.length - 1)]!,
      roleB24: 1 - mean(roleLossBeats[Math.min(23, toneLoss.length - 1)]!),
      toneLast: 1 - toneLoss[toneLoss.length - 1]!,
      roleLast: 1 - mean(roleLossBeats[roleLossBeats.length - 1]!),
      toneMin: 1 - Math.max(...toneLoss),
    },
  }

  log(
    `${name}: loss tone ${result.lossT.toFixed(4)} mixed ${result.lossM.toFixed(4)} role ${result.lossR.toFixed(4)} (by basis ${lossRByClass.map(x => x.toFixed(4)).join(' ')}) ratio ${(result.lossT / result.lossR).toFixed(2)}; first ${result.firstT.toFixed(4)} ${result.firstM.toFixed(4)} ${result.firstR.toFixed(4)}; multi ${result.multi.toFixed(4)}; norm ${normResidual.toExponential(2)} anti ${antiResidual.toExponential(2)} off ${allOff.toExponential(2)} toneOff ${toneOff.toExponential(2)}${darwin ? `; chiT0 ${chiT0.map(x => x.toFixed(4)).join(' ')} chiT ${chiTLate.map(x => x.toFixed(4)).join(' ')} chiR ${chiRLate.map(r => r.map(x => x.toFixed(4)).join('/')).join(' ')}` : ''}`,
  )

  return result
}

// ---- the instrument checks against register-holes ----

function engineChecks(S: Setup, plan: DarwinPlan, log: (s: string) => void): { channel: number; off: number } {
  let channel = 0

  for (const L of [2, 4]) {
    const fr = S.frames.get(L)!

    for (const like of [false, true]) {
      const species = like ? [1, 1] : [0, 1]
      const e = roleEngine({
        frame: fr,
        n: 2,
        total: 0,
        angle: S.angles.get(L)!,
        fear: S.fear,
        rules: [{ form: 'model', species, compose: 'sum' }],
        states: 1,
        threads: Math.min(4, plan.threads),
      })
      const chi1 = LINES[4]!
      const chi2 = LINES[1]!

      roleStart({ engine: e, x: 0, members: [{ role: chi1, fiber: 0 }, { role: chi2, fiber: 1 }], groups: [] })

      const he = holeEngine(fr, 2, 0)
      const runs: { h: Holes; angle: Float64Array }[] = [0, 1].map(ch => {
        const h = newHoles(fr, 2, 0)
        const tuples = he.mom.length / 2

        for (let T = 0; T < tuples; T++) {
          h.re[T * 64 + 1] = 1 / Math.sqrt(fr.fourier.N)
        }

        return { h, angle: S.angleAt(L, ch) }
      })
      const H = pairChannel('model', like)
      const chi = Array.from({ length: 9 }, (_, a) => {
        const i = Math.floor(a / 3)
        const j = a % 3

        return [
          chi1.re[i]! * chi2.re[j]! - chi1.im[i]! * chi2.im[j]!,
          chi1.re[i]! * chi2.im[j]! + chi1.im[i]! * chi2.re[j]!,
        ] as const
      })
      const p1 = chi.map((_, a) => {
        let r = 0
        let i = 0

        for (let b = 0; b < 9; b++) {
          r += H[a * 9 + b]! * chi[b]![0]
          i += H[a * 9 + b]! * chi[b]![1]
        }

        return [r, i] as const
      })
      const p0 = chi.map((c, a) => [c[0] - p1[a]![0], c[1] - p1[a]![1]] as const)

      for (let c = 0; c < plan.checkCycles; c++) {
        e.beat(0, 0, 1)
        e.beat(0, 0, 2)

        for (const r of runs) {
          holeCycle(he, { angle: r.angle }, r.h)
        }
      }

      const s = e.states[0]!

      for (let q = 0; q < runs[0]!.h.re.length; q++) {
        for (let a = 0; a < 9; a++) {
          let er = 0
          let ei = 0

          for (const [ch, p] of [[0, p0], [1, p1]] as const) {
            const hr = runs[ch]!.h.re[q]!
            const hi = runs[ch]!.h.im[q]!

            er += hr * p[a]![0] - hi * p[a]![1]
            ei += hr * p[a]![1] + hi * p[a]![0]
          }

          channel = Math.max(channel, Math.hypot(s.re[q * 9 + a]! - er, s.im[q * 9 + a]! - ei))
        }
      }

      e.close()
    }
  }

  // three holes, the fear beat off, against one register-holes run times the role product
  const fr = S.frames.get(2)!
  const roles = [LINES[4]!, LINES[1]!, LINES[8]!]
  const e = roleEngine({
    frame: fr,
    n: 3,
    total: 0,
    angle: S.angles.get(2)!,
    fear: S.fear,
    rules: [{ form: 'off', species: [0, 1, 1], compose: 'sum' }],
    states: 1,
    threads: Math.min(4, plan.threads),
  })

  roleStart({ engine: e, x: 0, members: roles.map((role, i) => ({ role, fiber: i })), groups: [] })

  const he = holeEngine(fr, 3, 0)
  const h = newHoles(fr, 3, 0)
  const tuples = he.mom.length / 3
  const fb = (0 * 8 + 1) * 8 + 2

  for (let T = 0; T < tuples; T++) {
    h.re[T * 512 + fb] = 1 / fr.fourier.N
  }

  for (let c = 0; c < 8; c++) {
    e.beat(0, 0, 1)
    e.beat(0, 0, 2)
    holeCycle(he, { angle: S.angles.get(2)! }, h)
  }

  const s = e.states[0]!

  let off = 0

  for (let q = 0; q < h.re.length; q++) {
    for (let r = 0; r < 27; r++) {
      const r0 = Math.floor(r / 9)
      const r1 = Math.floor(r / 3) % 3
      const r2 = r % 3
      let pr = 1
      let pi = 0

      for (const [v, d] of [[roles[0]!, r0], [roles[1]!, r1], [roles[2]!, r2]] as const) {
        const nr = pr * v.re[d]! - pi * v.im[d]!

        pi = pr * v.im[d]! + pi * v.re[d]!
        pr = nr
      }

      const er = h.re[q]! * pr - h.im[q]! * pi
      const ei = h.re[q]! * pi + h.im[q]! * pr

      off = Math.max(off, Math.hypot(s.re[q * 27 + r]! - er, s.im[q * 27 + r]! - ei))
    }
  }

  e.close()
  log(`I1 engine: channel ${channel.toExponential(3)} off ${off.toExponential(3)}`)

  return { channel, off }
}

const flag = (b: boolean): number => (b ? 1 : 0)

export function pointerDarwinismRun(plan: DarwinPlan = PLAN): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const S = setup()
  const checks = engineChecks(S, plan, log)
  const model: CaseResult[] = []
  const offs: CaseResult[] = []
  const controls: CaseResult[] = []
  const products: CaseResult[] = []

  for (const cfg of plan.configs) {
    const anti = cfg.checks
    const big = !cfg.checks

    for (const start of cfg.starts) {
      for (const env of cfg.envs) {
        model.push(runCase({ S, plan, L: cfg.L, k: cfg.k, start, env, form: 'model', compose: 'sum', darwin: true, anti, log }))
      }
    }

    if (cfg.checks) {
      offs.push(runCase({ S, plan, L: cfg.L, k: cfg.k, start: 'D', env: 'E1', form: 'off', compose: 'sum', darwin: false, anti: false, log }))
      controls.push(runCase({ S, plan, L: cfg.L, k: cfg.k, start: 'D', env: 'E1', form: 'control', compose: 'sum', darwin: false, anti: false, log }))
    }

    if (cfg.product) {
      for (const start of cfg.starts) {
        products.push(runCase({ S, plan, L: cfg.L, k: cfg.k, start, env: 'E1', form: 'model', compose: 'product', darwin: false, anti: false, log }))
      }
    }

    void big
  }

  const largestK = (L: number): number =>
    Math.max(...model.filter(r => r.L === L).map(r => r.k))
  const at = (L: number, k: number, start: StartName, env: EnvName): CaseResult | undefined =>
    model.find(r => r.L === L && r.k === k && r.start === start && r.env === env)

  const I1 =
    checks.channel <= ENGINE_TOL &&
    checks.off <= ENGINE_TOL &&
    [...model, ...offs, ...controls, ...products].every(r => r.normResidual <= NORM_TOL) &&
    offs.every(r => r.allOff <= OFF_TOL) &&
    model.every(r => r.antiResidual <= ANTI_TOL)
  const C1 = controls.length > 0 && controls.every(r => r.toneOff <= CONTROL_TONE_TOL && r.lossR >= CONTROL_ROLE_LOSS)
  const H1 = model.every(r => r.lossT >= H1_RATIO * r.lossR)
  const P1 = model.some(r => r.lossT <= P1_RATIO * r.lossR)
  const H2 = model.every(
    r => r.lossT >= H2_LOSS && r.lossM >= H2_LOSS && Math.min(...r.lossRByClass) <= H2_KEEP * r.lossT,
  )
  const H3 = [2, 4].every(L => {
    const big = at(L, largestK(L), 'D', 'E2')
    const one = at(L, 1, 'D', 'E2')

    return Boolean(big && one && big.lossT >= one.lossT)
  })
  const largest = [2, 4].map(L => at(L, largestK(L), 'D', 'E2')).filter((r): r is CaseResult => Boolean(r))
  const growth = (r: CaseResult, m: number): number => r.chiTLate[m - 1]! - r.chiT0[m - 1]!
  const B1 =
    largest.length === 2 &&
    largest.every(r => {
      const g1 = growth(r, 1)
      const gk = growth(r, r.k)
      const roleBest = Math.max(...r.chiRLate.map(row => row[0]!))

      return gk >= B1_FLOOR && g1 >= B1_PLATEAU * gk && g1 > roleBest
    })
  const status = P1 ? 'fail' : H1 && H2 && H3 && B1 && I1 && C1 ? 'pass' : 'partial'
  const metrics: Record<string, number> = {
    I1: flag(I1),
    C1: flag(C1),
    H1: flag(H1),
    P1: flag(P1),
    H2: flag(H2),
    H3: flag(H3),
    B1: flag(B1),
    engineChannel: checks.channel,
    engineOff: checks.off,
  }

  for (const r of [...model, ...offs, ...controls, ...products]) {
    const p = r.name

    metrics[`${p}_lossT`] = r.lossT
    metrics[`${p}_lossM`] = r.lossM
    metrics[`${p}_lossR`] = r.lossR
    metrics[`${p}_ratio`] = r.lossT / r.lossR
    metrics[`${p}_firstT`] = r.firstT
    metrics[`${p}_firstM`] = r.firstM
    metrics[`${p}_firstR`] = r.firstR
    metrics[`${p}_multi`] = r.multi
    metrics[`${p}_norm`] = r.normResidual
    metrics[`${p}_toneOff`] = r.toneOff
    r.lossRByClass.forEach((x, c) => {
      metrics[`${p}_lossRBasis${c}`] = x
    })

    if (r.form === 'off') {
      metrics[`${p}_allOff`] = r.allOff
    }

    if (r.antiResidual > 0) {
      metrics[`${p}_anti`] = r.antiResidual
    }

    r.chiT0.forEach((x, i) => {
      metrics[`${p}_chiT0_m${i + 1}`] = x
      metrics[`${p}_chiT_m${i + 1}`] = r.chiTLate[i]!
    })
    r.chiRLate.forEach((row, c) => row.forEach((x, i) => {
      metrics[`${p}_chiR${c}_m${i + 1}`] = x
    }))

    for (const [k, v] of Object.entries(r.reads)) {
      metrics[`${p}_${k}`] = v
    }
  }

  metrics.seconds = (Date.now() - started) / 1000

  const line = model
    .map(r => `${r.name} tone ${r.lossT.toFixed(3)} mixed ${r.lossM.toFixed(3)} role ${r.lossR.toFixed(3)} (x${(r.lossT / r.lossR).toFixed(2)})`)
    .join('; ')

  return verdict({
    status,
    claim: `H1 ${H1}, P1 ${P1}, H2 ${H2}, H3 ${H3}, B1 ${B1}, C1 ${C1}, I1 ${I1}: ${line}`,
    metrics,
    control: {
      C1: flag(C1),
      ...Object.fromEntries(controls.map(r => [`${r.name}_lossR`, r.lossR])),
      ...Object.fromEntries(controls.map(r => [`${r.name}_toneOff`, r.toneOff])),
    },
    notes: `L2. C* (E-FND-0160) on register-holes' exact store with roles carried in full (code/measure/role-holes), D4 torus L 2 and 4, 1 to 3 environment holes, ${plan.beats} beats. Several members meeting at one dock take exp(-i s w sum H), an undefined piece of C*; the ordered product is read beside it. Fragments read roles only. The superpositions of tone are put in by hand. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'quantum/pointer-darwinism',
  code: 'E-QTM-0186',
  title:
    "the conserved pleasure-pain count stays the favored pointer as C*'s environment grows to three holes, but the gap closes and superselection is not structural, partial: the count's superposition loses 1.28 to 4.33 times what a role superposition loses a beat over 14 cases (L = 2 and 4, 1 to 3 environment holes); in an environment spread over three role frames the ratio falls 1.59, 1.42, 1.28 on L = 2 as holes are added (1.63, 1.54 on L = 4), while an environment in one frame keeps it at 2.5 to 4.3 and dephases that frame's role basis most; a pleasure-to-pain superposition that also changes role keeps its coherence exactly when the environment's roles leave both kernels idle; one environment hole's roles hold 0.10 bit of the count's record, against 0.06 of log2 3 for the best role basis, a plateau on L = 4 but not on L = 2; the tone-blind control keeps the tone to 1.7e-13, the fear beat off moves nothing",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return pointerDarwinismRun()
  },
})
