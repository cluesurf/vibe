// THE REFLECTION R AS A STEP OF THE SUPERPOSED RULE (E-QTM-0197, solutions section 5, OPEN-QTM-05 and 06). No piece of the
// rule picks a pointer basis: the fear beat selects none (E-QTM-0114), SUM selects the role basis but is not a covariant
// move (E-QTM-0128), and a frame-covariant dynamics with a frame-invariant environment depolarizes every basis at one rate
// (E-QTM-0154). E-QTM-0186 found the conserved count the favored pointer on C*'s environment of one to three holes, with
// a role basis picked only by an environment that holds one frame. Solutions section 5 names two candidates; this file
// settles the second: the reflection through the frame direction, R = 2 q^(-1) 1 w^T - 1 (E-QTM-0134), the one
// covariant meeting of three tokens that is not a permutation, made a step of the rule. Four questions, each read exactly:
// (1) is the step still unitary, (2) is it covariant under the rule's symmetries, (3) which basis does an environment
// dephase under the new step, with one and two environment holes, (4) is the record of that basis redundant (one of two
// environment holes holding it, a plateau).
//
// WHAT IS RUN.
//  - R ON ROLES (code/measure/role-reflection reflectionLift): the Weil lift of R on three members' role qutrits, a
//    pleasure-tone member carrying the frame as C and a pain-tone member as C* (the convention under which C*'s two
//    kernels are covariant). On C* (code/measure/role-holes, RoleRule.reflect) R acts on a contact group of exactly three
//    members whose charge is not 0 mod 3, after the fear kernel, at every pair step ('every', the gated rule) or in beat
//    1 only ('first', a read). A pair never takes R: two tokens of unlike sign admit only the identity (E-QTM-0134), and
//    two like tokens only the swap. A knot of three (three pain-tone members) admits only permutations, so it never takes
//    R either. The system and environment are E-QTM-0186's (code/measure/role-pointer, its case moved unchanged): member 0
//    pleasure-tone (branch L, the triple LFF, which takes R) or pain-tone (branch F, FFF, which does not), k = 1, 2 pain-
//    tone environment holes, environments E1 (Z states) and E2 (one state of each of three other bases), starts D (one
//    dock) and B (bands), boxes L = 2 (k = 1, 2) and L = 4 (k = 1 all four cases, k = 2 start D E2 only, as E-QTM-0186),
//    96 beats, reads every 3 beats, late from beat 48, 12 threads.
//  - R ON THE KNIT (code/measure/role-reflection knitReflection): the step that applies R to the stored points of the
//    three vibes at every dock holding exactly three off a knot, before the working beat of E-QTM-0184
//    (code/measure/qca-axioms, the flat D4 box of side 5). It is read for unitarity and for the 52 symmetries of E-QTM-0184
//    (4 translations and 48 W(F4) reflections) on 255 starts at the center dock: slot 0 and every slot pair (e, f), 1 <= e
//    < f <= 23, love-love-fear when e + f is even and love-fear-fear when odd, points (0, 4, 1); and the two knots LLL and
//    FFF on slots 0, 1, 2.
//
// DERIVED BEFORE THE GATE RUN (L1).
// 1. R IS AN INVOLUTION AND MONOMIAL. A^T W A = W gives W A W = A^(-T), so the physical map is A on the role coordinate
//    and A^(-T) on the tilt: its lift permutes the Z basis states, |x> -> |A x>, up to phases. R^2 = 1. So the step is a
//    reversible classical gate on roles in the Z frame, and by covariance in every frame at once (relative to the other
//    members): x0' = -x1 - x2, x1' = x0 + x1 - x2 ... on LFF, a role ADDED into another member's role, the kind of meeting
//    that copies.
// 2. UNITARITY. Each kernel is a product of unitaries (the fear kernel, then R) on a contact group, and the one-body
//    pieces are unchanged, so the beat stays unitary. The knit step permutes configurations and is its own inverse.
// 3. COVARIANCE. R commutes with every frame change on its triple (E-QTM-0134 G6), and the step depends only on which
//    members share a dock, so it commutes with every map of the mesh that keeps docks (translations, W(F4)) and with any
//    gauge of grid moves. The knit's mesh symmetries carry slot contents and never change a vibe's sign, and R is symmetric
//    in tokens of one sign, so the slot order never enters.
// 4. NO BASIS OF ITS OWN. By 3, the step with a frame-rotated environment equals the rotated step: whatever basis it
//    dephases is carried with the environment's frame. E-QTM-0154's theorem applies to it unchanged: R cannot pick a
//    basis that the environment does not already hold.
// 5. AT k = 1 R NEVER ACTS (no triple), so the rule with R equals the rule without it bit for bit.
// 6. WHAT IS NOT DERIVABLE is how much more each basis dephases with R, whether R makes a role basis lose more than the
//    count, and whether its record sits in one hole.
//
// PROBE BEFORE THE GATES, disclosed (tmp/rs197-probe1.ts, the lift only, no dynamics): on LFF, LLF and FLL the lift is
// unitary to 4.4e-16, monomial (27 nonzeros), R^2 = 1 to 4.4e-16, commutes with all 648 frame changes to 5.3e-15 in
// either assignment (L as C or as C*), fails the all-C assignment (1.73), and commutes with the swap of its like pair
// (0); LLL and FFF have no lift. C*'s like and unlike kernels commute with the frame in this convention (0, 4.4e-16).
// SMOKE AFTER THE GATES WERE WRITTEN, disclosed (tmp/rs197-smoke.ts, 6 beats, gating nothing, no gate moved): every path
// ran; the k = 1 runs with and without R agreed in every digit; at 6 beats the R rule raised L2k2 D E2's role loss above
// the tone's; the 'first' mode equaled 'every' in every digit although the beat-2 kernels differ (by 1.0), so no
// triple contact carried weight in a beat-2 pair step there; R commutes with the fear kernel of a full triple (7e-16);
// the knit read 52 of 52 on both link fields, 0 of 216 moves failing, SUM failing 192 moves and 30 of 48 reflections.
// One read was added after the smoke: modesBeat2Difference.
// PREDICTED VERDICT: FAIL (the candidate closes): U and C hold, H3 does not fire (point 4), H4 unknown.
//
// HYPOTHESES AND GATES, fixed before the gate run. loss_X as E-QTM-0186 (the mean over beats 1 .. 96 of 1 - |coherence|
//  over its beat-0 value); loss_c the mean loss of role basis c (c = 0 the Z basis); a record is the Holevo quantity of the
//  fragment over the pointer's entropy, late mean minus beat 0, for m = 1 and m = k environment holes.
//  INSTRUMENT
//  I1 REPRODUCTION. The rule without R reproduces E-QTM-0186's printed loss_T, loss_M and loss_R in all 13 shared cases,
//     and its printed records in L2k2 D E2 and L4k2 D E2, within 1e-4 (they are printed to 4 digits).
//  I2 k = 1. Every k = 1 case with R equals the same case without R: every loss and record within 1e-12.
//  K1 CONTROL. R's lift fails to commute with some frame change in the all-C assignment (g (x) g (x) g) by more than 1e-3.
//  K2 CONTROL. The knit's SUM x 1 in slot order fails the uniform grid-move check for some move, and fails to commute with
//     some W(F4) reflection on trivial links.
//  (1) UNITARITY
//  U1 The lift (LFF and LLF) is unitary within 1e-12 and R^2 = 1 within 1e-12.
//  U2 Every kernel of the rule with R (n = 3, both modes, both branches, both signs, every contact mask of L = 2) is
//     unitary within 1e-12.
//  U3 Every run with R keeps its norm within 1e-9, and the three orthogonal pass-A starts stay orthogonal within 1e-9.
//  U4 The knit step is an involution on every start; the images of the 255 starts under R then the beat have badNorms 0
//     and badPairs 0 on trivial and committed links at beats 0 and 1; the beat back then R returns every start exactly.
//  (2) COVARIANCE
//  C1 The lift commutes with all 648 frame changes (LFF and LLF) within 1e-12, and every kernel of U2 commutes with the
//     frame on its members within 1e-12.
//  C2 The lift commutes with the swap of its like pair within 1e-12, and every k = 2 run with R keeps both branches'
//     antisymmetry within 1e-9.
//  C3 On C* (L = 2, k = 2, start D, E1 and E2, R every step), for each of the 4 generators g of Sigma(648): rotating the
//     start's roles by g (C on member 0, C* on the environment) and running 16 beats equals running and then rotating,
//     within 1e-9 at the end.
//  C4 The knit with R: all 52 symmetries commute with no gauge on trivial links, all 52 carry U_l to U_(S l) on the
//     committed links, at beats 0 and 1 on every start; and the step commutes with all 216 uniform grid moves on every
//     start.
//  (3) THE BASIS
//  H3 R PICKS A BASIS. In some k = 2 E2 case (an environment that holds no single frame), with R: the role basis that loses
//     most loses at least 1.25 times the next, and more than the count (loss_c > loss_T).
//  (4) THE RECORD
//  H4 REDUNDANT RECORD. In both k = 2 D E2 cases (L = 2, 4), with R: for the basis that loses most (the count or a role
//     basis), its record in one environment hole is at least 0.5 of its record in both and at least 0.01, and exceeds the
//     same record without R by at least 0.01.
// VERDICT. Fail if any of I1, I2, K1, K2 fails (the instrument) or any of U1 to U4 or C1 to C4 fails (R is not an
//  admissible step). Otherwise pass if H3 and H4 hold, partial if one holds, fail if neither (R is admissible but picks no
//  pointer and adds no redundant record: the candidate closes).
// READ, gating nothing: every loss and record with and without R; the per-basis losses; the 'first' mode on L = 2, k = 2;
//  the commutator of R with the fear kernel of a full triple; the multi-contact weight.
//
// FIRST RUN 2026-10-27 (test/record/E-QTM-0197/run-gate.log, 6,375 s): FAIL, as predicted. No gate moved, none rerun.
//  - I1, I2, K1, K2 hold: without R all 13 shared cases and both record sets equal E-QTM-0186 (largest gap 4.9e-5, the
//    4-digit rounding); with R every k = 1 case equals the plain one exactly (0); R fails the all-C frame (1.73); SUM in
//    slot order fails 192 of 216 moves and 30 of 48 reflections.
//  - (1) UNITARY, all hold: lift 4.4e-16, R^2 = 1 to 4.4e-16, 24 kernels unitary to 1.3e-15, norms to 1.2e-11, pass-A
//    overlaps to 9e-15; the knit step moves 253 of 255 starts (keeps both knots), is an involution, Gram 0 bad norms and
//    0 bad pairs (100 overlapping pairs) on both link fields and beats, the inverse returns every start.
//  - (2) COVARIANT, all hold: 648 of 648 frame changes on the lift (5.3e-15) and on every kernel (5.3e-15), the like swap
//    (0) and antisymmetry (3.3e-15), the engine with a rotated start (3.7e-16 after 16 beats, 8 runs), and on the knit
//    52 of 52 on trivial links with no gauge, 52 of 52 carried on the committed links, 0 of 216 moves failing.
//  - (3) H3 fails: R makes a role basis lose more than the count in the frame-mixed environment at L = 2 (role mean
//    0.610 against tone 0.574, from 0.421 against 0.599 without R) but picks none: the bases lose 0.657 / 0.592 / 0.599 /
//    0.592 (the most 1.10 times the next); on L = 4 k = 2 all bases rise (0.575 / 0.436 / 0.409 / 0.433 to 0.733 /
//    0.655 / 0.678 / 0.650) and the count stays ahead (0.757). With E1 the Z basis (the environment's frame) leads, as
//    without R (0.561 against 0.258). R adds dephasing in every basis at once, as covariance demands.
//  - (4) H4 fails: the most-lost basis's record sits in correlations, not in one hole: L2k2 D E2 Z basis 0.050 in one
//    hole against 0.511 in both (0.071 without R); L4k2 D E2 count 0.091 in one hole (0.102 without R). R lowers the
//    one-hole record of every basis it touches.
//  - Reads: 'first' equals 'every' at every digit on start D and differs on start B (L2k2 B E1 role 0.0357 'every',
//    0.0338 'first' = no R): triple contact carries beat-2 weight only from start B. R commutes with the fear kernel of a
//    full triple (7.2e-16).
//
// WHAT THIS CAN AND CANNOT SHOW. It decides whether R, as defined by E-QTM-0134 and placed after the fear kernel at
// triple contact, is an admissible rule step and whether it makes a pointer on C*'s environment of one and two holes. It
// does not read three or more environment holes (a group of four admits other covariant meetings, E-QTM-0134), a bath, or
// another placement of R (before the fear kernel, at a distance). The knit read covers starts at one dock. C* is not the
// adopted rule, the D4 torus is not the husk, and no ledger row becomes held from it.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  commutatorSize,
  sigma648Elements,
} from '@/code/measure/frame-covariant-meeting'
import { multiplyOperators, type Operator } from '@/code/measure/grid-weights'
import { operatorFrom3 } from '@/code/measure/qutrit-clifford'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import { roleEngine, roleKernels, roleStart, type RoleRule } from '@/code/measure/role-holes'
import {
  applyRoles,
  asOperator,
  frameOnRoles,
  knitReflection,
  knitSlotSum,
  reflectionLift,
  roleSwap,
  signOfSpecies,
  stateDistance,
  unitarityResidual,
} from '@/code/measure/role-reflection'
import {
  envRoles,
  LINES,
  pointerCase,
  pointerMembers,
  pointerSetup,
  type EnvName,
  type PointerCase,
  type PointerPlan,
  type PointerSetup,
  type StartName,
} from '@/code/measure/role-pointer'
import { centerOf } from '@/code/measure/wall-reading'
import { makeColorWeave } from '@/code/rule/color-weave'
import type { Branch, Configuration, LockedState } from '@/code/rule/doublet-locked-knit'
import {
  applySymmetry,
  basisState,
  carriedLinks,
  emptyConfiguration,
  f4BoxSymmetries,
  gramReading,
  mapState,
  mapThen,
  sameState,
  stateAmplitudes,
  symmetryCommutes,
  tablesWith,
  thenMap,
  translationOf,
  workingBeats,
  type Beat,
  type MeshSymmetry,
} from '@/code/measure/qca-axioms'

const LIFT_TOL = 1e-12
const RUN_TOL = 1e-9
const REPRO_TOL = 1e-4
const SAME_TOL = 1e-12
const CONTROL_MIN = 1e-3
const H3_MARGIN = 1.25
const H4_PLATEAU = 0.5
const H4_FLOOR = 0.01
const H4_GAIN = 0.01
const SIDE_LENGTH = 5
const KNIT_BEATS = [0, 1]

export type ReflectionPlan = PointerPlan & {
  configs: { L: number; k: number; starts: StartName[]; envs: EnvName[]; first: boolean }[]
  covarianceBeats: number
  knit: boolean
}

const PLAN: ReflectionPlan = {
  beats: 96,
  readEvery: 3,
  lateFrom: 48,
  threads: 12,
  covarianceBeats: 16,
  knit: true,
  configs: [
    { L: 2, k: 1, starts: ['D', 'B'], envs: ['E1', 'E2'], first: false },
    { L: 4, k: 1, starts: ['D', 'B'], envs: ['E1', 'E2'], first: false },
    { L: 2, k: 2, starts: ['D', 'B'], envs: ['E1', 'E2'], first: true },
    { L: 4, k: 2, starts: ['D'], envs: ['E2'], first: false },
  ],
}

// E-QTM-0186's printed values (tmp/pd186-gate-E-QTM-0186.log of the experiment/moving-matter-next worktree)
const E186: Record<string, { T: number; M: number; R: number; chiT0?: number[]; chiT?: number[]; chiR?: number[][] }> = {
  L2k1DE1: { T: 0.3333, M: 0.0, R: 0.106 },
  L2k1DE2: { T: 0.4101, M: 0.3095, R: 0.2584 },
  L2k1BE1: { T: 0.0614, M: 0.0, R: 0.017 },
  L2k1BE2: { T: 0.0553, M: 0.0415, R: 0.0345 },
  L4k1DE1: { T: 0.4859, M: 0.0, R: 0.1236 },
  L4k1DE2: { T: 0.4529, M: 0.3427, R: 0.2775 },
  L4k1BE1: { T: 0.0379, M: 0.0, R: 0.0088 },
  L4k1BE2: { T: 0.031, M: 0.0239, R: 0.0176 },
  L2k2DE1: { T: 0.5556, M: 0.4108, R: 0.2185 },
  L2k2DE2: {
    T: 0.5987,
    M: 0.6204,
    R: 0.4212,
    chiT0: [0.045, 0.2416],
    chiT: [0.1588, 0.414],
    chiR: [
      [0.0714, 0.3098],
      [0.0776, 0.3128],
      [0.0714, 0.3098],
      [0.0776, 0.3128],
    ],
  },
  L2k2BE1: { T: 0.1189, M: 0.0643, R: 0.0338 },
  L2k2BE2: { T: 0.1079, M: 0.0825, R: 0.0612 },
  L4k2DE2: {
    T: 0.7129,
    M: 0.634,
    R: 0.4633,
    chiT0: [0.045, 0.2416],
    chiT: [0.1473, 0.332],
    chiR: [
      [0.051, 0.164],
      [0.0575, 0.2142],
      [0.051, 0.164],
      [0.0575, 0.2142],
    ],
  },
}

const flag = (b: boolean): number => (b ? 1 : 0)
const caseKey = (r: PointerCase): string => `L${r.L}k${r.k}${r.start}${r.env}`

// ---- the lift and the kernels ----

function liftChecks(group: readonly Operator[]): Record<string, number> {
  const out: Record<string, number> = {}

  for (const [name, signs] of [
    ['LFF', [1, -1, -1]],
    ['LLF', [1, 1, -1]],
  ] as const) {
    const u = asOperator(reflectionLift(signs)!)
    const uu = multiplyOperators(u, u)

    let square = 0

    for (let r = 0; r < 27; r++) {
      for (let c = 0; c < 27; c++) {
        square = Math.max(square, Math.hypot(uu.re[r * 27 + c]! - (r === c ? 1 : 0), uu.im[r * 27 + c]!))
      }
    }

    const odd = signs.findIndex(s => signs.filter(x => x === s).length === 1)
    const [i, j] = [0, 1, 2].filter(k => k !== odd)

    out[`${name}_unitarity`] = unitarityResidual(u)
    out[`${name}_square`] = square
    out[`${name}_frame`] = Math.max(...group.map(g => commutatorSize(u, frameOnRoles(g, signs))))
    out[`${name}_frameAllC`] = Math.max(...group.map(g => commutatorSize(u, frameOnRoles(g, [1, 1, 1]))))
    out[`${name}_likeSwap`] = commutatorSize(u, roleSwap(3, i!, j!))
  }

  return out
}

function kernelChecks(S: PointerSetup, group: readonly Operator[]): Record<string, number> {
  const fr = S.frames.get(2)!
  const e = roleEngine({
    frame: fr,
    n: 3,
    total: 0,
    angle: S.angles.get(2)!,
    fear: S.fear,
    rules: [{ form: 'model', species: [0, 1, 1], compose: 'sum' }],
    states: 1,
    threads: 1,
  })
  const masks = e.masks
  const pairs = e.pairs

  e.close()

  let unitary = 0
  let frame = 0
  let count = 0
  let withFear = 0

  const rules: RoleRule[] = [
    { form: 'model', species: [0, 1, 1], compose: 'sum', reflect: 'every' },
    { form: 'model', species: [0, 1, 1], compose: 'sum', reflect: 'first' },
    { form: 'model', species: [1, 1, 1], compose: 'sum', reflect: 'every' },
  ]

  for (const rule of rules) {
    const signs = rule.species.map(signOfSpecies)
    const frames = group.map(g => frameOnRoles(g, signs))
    const tables = roleKernels({ n: 3, pairs, rule, fear: S.fear, masks })

    for (const K of tables.values()) {
      const op = asOperator(K)

      unitary = Math.max(unitary, unitarityResidual(op))
      frame = Math.max(frame, ...frames.map(v => commutatorSize(op, v)))
      count++
    }
  }

  // the commutator of R with the fear kernel of a full triple (read)
  const full = (1 << pairs.length) - 1
  const plain = roleKernels({
    n: 3,
    pairs,
    rule: { form: 'model', species: [0, 1, 1], compose: 'sum' },
    fear: S.fear,
    masks: [full],
  }).get(full)!

  withFear = commutatorSize(asOperator(reflectionLift([1, -1, -1])!), asOperator(plain))

  // how far the beat-2 kernels of the two modes differ (the modes differ only there)
  const every = roleKernels({ n: 3, pairs, rule: rules[0]!, fear: S.fear, masks })
  const once = roleKernels({ n: 3, pairs, rule: rules[1]!, fear: S.fear, masks })
  const M = 1 << pairs.length

  let modes = 0

  for (const mask of masks) {
    const a = every.get(M + mask)!
    const b = once.get(M + mask)!

    for (let i = 0; i < a.re.length; i++) {
      modes = Math.max(modes, Math.hypot(a.re[i]! - b.re[i]!, a.im[i]! - b.im[i]!))
    }
  }

  return { kernelCount: count, kernelMasks: masks.length, kernelUnitarity: unitary, kernelFrame: frame, liftFearCommutator: withFear, modesBeat2Difference: modes }
}

// ---- C3: the engine with R against a frame change of the start ----

function engineCovariance(S: PointerSetup, plan: ReflectionPlan, log: (s: string) => void): number {
  const fr = S.frames.get(2)!
  const generators = SU3_SUBGROUPS.sigma648.generators.map(operatorFrom3)
  const signs = [1, -1, -1]

  let worst = 0

  for (const env of ['E1', 'E2'] as const) {
    for (const g of generators) {
      const e = roleEngine({
        frame: fr,
        n: 3,
        total: 0,
        angle: S.angles.get(2)!,
        fear: S.fear,
        rules: [{ form: 'model', species: [0, 1, 1], compose: 'sum', reflect: 'every' }],
        states: 2,
        threads: plan.threads,
      })
      const members = pointerMembers(fr, 'D', [LINES[4]!, ...envRoles(env, 2)])
      const G = frameOnRoles(g, signs)

      roleStart({ engine: e, x: 0, members, groups: [[1, 2]] })
      roleStart({ engine: e, x: 1, members, groups: [[1, 2]] })
      applyRoles(e, 1, G)

      for (let b = 1; b <= plan.covarianceBeats; b++) {
        const bb: 1 | 2 = b % 2 === 1 ? 1 : 2

        e.beat(0, 0, bb)
        e.beat(1, 0, bb)
      }

      applyRoles(e, 0, G)

      const d = stateDistance(e, 0, 1)

      worst = Math.max(worst, d)
      e.close()
    }
  }

  log(`C3 engine covariance ${worst.toExponential(2)}`)

  return worst
}

// ---- the knit ----

type Vibe = { d: number; v: number; p: number }

function knitStart(cells: number, c: number, vibes: readonly Vibe[]): LockedState {
  const conf: Configuration = emptyConfiguration(cells)

  for (const { d, v, p } of vibes) {
    conf.vibe[c * 24 + d] = v
    conf.point[c * 24 + d] = p
    conf.open[c * 24 + d] = 1
  }

  return basisState(conf)
}

function knitChecks(log: (s: string) => void): Record<string, number> {
  const weave = makeColorWeave({ side: SIDE_LENGTH, table: 'bind' })
  const { moves } = weave
  const cells = weave.mesh.cellCount
  const c = centerOf(SIDE_LENGTH)
  const trivialLinks = new Int16Array(cells * 24).fill(moves.identity)
  const startLinks = weave.links
  const starts: LockedState[] = []

  for (let e = 1; e < 24; e++) {
    for (let f = e + 1; f < 24; f++) {
      const third = (e + f) % 2 === 0 ? 1 : -1

      starts.push(knitStart(cells, c, [
        { d: 0, v: 1, p: 0 },
        { d: e, v: third === 1 ? 1 : -1, p: 4 },
        { d: f, v: -1, p: 1 },
      ]))
    }
  }

  const knots = [1, -1].map(v => knitStart(cells, c, [0, 1, 2].map((d, i) => ({ d, v, p: [0, 4, 1][i]! }))))

  starts.push(...knots)

  const R = knitReflection(cells)
  const SUM = knitSlotSum(cells)
  const out: Record<string, number> = { knitStarts: starts.length }

  // the step acts: starts whose image differs, and the knots it leaves
  out.knitMoved = starts.filter(s => !sameState(mapState(s, R), s)).length
  out.knitKnotsKept = knots.filter(s => sameState(mapState(s, R), s)).length
  out.knitInvolutionMisses = starts.filter(s => !sameState(mapState(mapState(s, R), R), s)).length

  // U4: Gram of the images and the inverse
  let badNorms = 0
  let badPairs = 0
  let overlapping = 0
  let inverseMisses = 0

  for (const [field, links] of [
    ['trivial', trivialLinks],
    ['start', startLinks],
  ] as const) {
    const b = workingBeats(tablesWith(weave, links))
    const forward = mapThen(R, b.forward)
    const back = thenMap(b.back, R)

    for (const beat of KNIT_BEATS) {
      const images = starts.map(s => {
        const image = forward(s, beat)

        inverseMisses += sameState(back(image, beat), s) ? 0 : 1

        return stateAmplitudes(image)
      })
      const gram = gramReading(images)

      badNorms += gram.badNorms
      badPairs += gram.badPairs
      overlapping += gram.overlapping
      log(`U4 ${field} beat ${beat}: badNorms ${gram.badNorms} badPairs ${gram.badPairs} overlapping ${gram.overlapping}`)
    }
  }

  out.knitBadNorms = badNorms
  out.knitBadPairs = badPairs
  out.knitOverlapping = overlapping
  out.knitInverseMisses = inverseMisses

  // C4: the 216 uniform grid moves
  const identitySymmetry: MeshSymmetry = {
    name: 'identity',
    cellMap: Int32Array.from({ length: cells }, (_, x) => x),
    slotMap: Int32Array.from({ length: 24 }, (_, d) => d),
  }
  const moveFails = (step: (b: Branch) => Branch): number =>
    moves.act.filter((_, g) => {
      const G = applySymmetry({ symmetry: identitySymmetry, moves, gauge: new Int16Array(cells).fill(g) })

      return starts.some(s => !sameState(mapState(mapState(s, step), G), mapState(mapState(s, G), step)))
    }).length

  out.knitMoveFailures = moveFails(R)
  out.knitSumMoveFailures = moveFails(SUM)
  log(`C4 moves: R fails ${out.knitMoveFailures} of 216, SUM fails ${out.knitSumMoveFailures}`)

  // C4: the 52 symmetries
  const translations = [0, 1, 2, 3].map(k =>
    translationOf(SIDE_LENGTH, [0, 1, 2, 3].map(j => (j === k ? 1 : 0))),
  )
  const reflections = f4BoxSymmetries({ side: SIDE_LENGTH, whole: false })
  const symmetries = [...translations, ...reflections]
  const commuting = (input: {
    list: readonly MeshSymmetry[]
    beatOf: Beat
    beatAfter?: (s: MeshSymmetry) => Beat
  }): number =>
    input.list.filter(symmetry => {
      const map = applySymmetry({ symmetry, moves })
      const after = input.beatAfter?.(symmetry)

      return KNIT_BEATS.every(beat =>
        starts.every(psi => symmetryCommutes({ beatOf: input.beatOf, beatAfter: after, map, psi, beat })),
      )
    }).length

  const trivial = workingBeats(tablesWith(weave, trivialLinks))
  const working = workingBeats(tablesWith(weave, startLinks))

  out.knitTrivialCommuting = commuting({ list: symmetries, beatOf: mapThen(R, trivial.forward) })
  log(`C4 trivial: ${out.knitTrivialCommuting} of 52`)
  out.knitCarried = commuting({
    list: symmetries,
    beatOf: mapThen(R, working.forward),
    beatAfter: s => mapThen(R, workingBeats(tablesWith(weave, carriedLinks(startLinks, s))).forward),
  })
  log(`C4 carried: ${out.knitCarried} of 52`)
  out.knitSumReflectionsCommuting = commuting({ list: reflections, beatOf: mapThen(SUM, trivial.forward) })
  log(`K2 SUM reflections commuting: ${out.knitSumReflectionsCommuting} of 48`)

  return out
}

// ---- the run ----

export function reflectionStepRun(plan: ReflectionPlan = PLAN): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const S = pointerSetup([...new Set(plan.configs.map(c => c.L))])
  const group = sigma648Elements()
  const lift = liftChecks(group)
  const kernels = kernelChecks(S, group)

  log(`lift ${JSON.stringify(lift)} kernels ${JSON.stringify(kernels)}`)

  const c3 = engineCovariance(S, plan, log)
  const plain: PointerCase[] = []
  const withR: PointerCase[] = []
  const first: PointerCase[] = []

  for (const cfg of plan.configs) {
    for (const start of cfg.starts) {
      for (const env of cfg.envs) {
        const base = { S, plan, L: cfg.L, k: cfg.k, start, env, form: 'model' as const, darwin: true, log }

        plain.push(pointerCase({ ...base, anti: false }))
        withR.push(pointerCase({ ...base, reflect: 'every', anti: cfg.k >= 2 && cfg.L === 2 }))

        if (cfg.first) {
          first.push(pointerCase({ ...base, reflect: 'first', anti: false }))
        }
      }
    }
  }

  const knit = plan.knit ? knitChecks(log) : {}

  // ---- gates ----
  let repro = 0
  let reproCases = 0

  for (const r of plain) {
    const want = E186[caseKey(r)]

    if (!want) {
      continue
    }

    reproCases++
    repro = Math.max(repro, Math.abs(r.lossT - want.T), Math.abs(r.lossM - want.M), Math.abs(r.lossR - want.R))

    if (want.chiT0) {
      want.chiT0.forEach((x, i) => {
        repro = Math.max(repro, Math.abs(r.chiT0[i]! - x), Math.abs(r.chiTLate[i]! - want.chiT![i]!))
      })
      want.chiR!.forEach((row, c) =>
        row.forEach((x, i) => {
          repro = Math.max(repro, Math.abs(r.chiRLate[c]![i]! - x))
        }),
      )
    }
  }

  const pairOf = (r: PointerCase): PointerCase => plain.find(p => caseKey(p) === caseKey(r))!
  let sameK1 = 0

  for (const r of withR.filter(x => x.k === 1)) {
    const p = pairOf(r)
    const vals = (x: PointerCase): number[] => [
      x.lossT,
      x.lossM,
      x.lossR,
      ...x.lossRByClass,
      ...x.chiT0,
      ...x.chiTLate,
      ...x.chiRLate.flat(),
    ]
    const a = vals(r)
    const b = vals(p)

    sameK1 = Math.max(sameK1, ...a.map((x, i) => Math.abs(x - b[i]!)))
  }

  const I1 = reproCases === 13 && repro <= REPRO_TOL
  const I2 = withR.some(r => r.k === 1) && sameK1 <= SAME_TOL
  const K1 = lift.LFF_frameAllC! > CONTROL_MIN && lift.LLF_frameAllC! > CONTROL_MIN
  const K2 = !plan.knit || ((knit.knitSumMoveFailures ?? 0) > 0 && (knit.knitSumReflectionsCommuting ?? 48) < 48)
  const U1 = ['LFF', 'LLF'].every(n => lift[`${n}_unitarity`]! <= LIFT_TOL && lift[`${n}_square`]! <= LIFT_TOL)
  const U2 = kernels.kernelUnitarity! <= LIFT_TOL && kernels.kernelCount! > 0
  const U3 = [...withR, ...first].every(r => r.normResidual <= RUN_TOL && r.overlapResidual <= RUN_TOL)
  const U4 =
    !plan.knit ||
    (knit.knitInvolutionMisses === 0 &&
      knit.knitBadNorms === 0 &&
      knit.knitBadPairs === 0 &&
      knit.knitInverseMisses === 0 &&
      (knit.knitMoved ?? 0) > 0)
  const C1 = ['LFF', 'LLF'].every(n => lift[`${n}_frame`]! <= LIFT_TOL) && kernels.kernelFrame! <= LIFT_TOL
  const C2 =
    ['LFF', 'LLF'].every(n => lift[`${n}_likeSwap`]! <= LIFT_TOL) &&
    withR.filter(r => r.k === 2 && r.L === 2).every(r => r.antiResidual <= RUN_TOL)
  const C3 = c3 <= RUN_TOL
  const C4 =
    !plan.knit ||
    (knit.knitTrivialCommuting === 52 && knit.knitCarried === 52 && knit.knitMoveFailures === 0)
  const sorted = (r: PointerCase): number[] => [...r.lossRByClass].sort((a, b) => b - a)
  const H3 = withR
    .filter(r => r.k === 2 && r.env === 'E2')
    .some(r => {
      const s = sorted(r)

      return s[0]! >= H3_MARGIN * s[1]! && s[0]! > r.lossT
    })
  const record = (r: PointerCase, m: number): { basis: string; value: number } => {
    const roleMax = Math.max(...r.lossRByClass)

    if (r.lossT >= roleMax) {
      return { basis: 'count', value: r.chiTLate[m - 1]! - r.chiT0[m - 1]! }
    }

    const c = r.lossRByClass.indexOf(roleMax)

    return { basis: `role ${c}`, value: r.chiRLate[c]![m - 1]! - r.chiR0[c]![m - 1]! }
  }
  const recordOfBasis = (r: PointerCase, basis: string, m: number): number =>
    basis === 'count'
      ? r.chiTLate[m - 1]! - r.chiT0[m - 1]!
      : r.chiRLate[Number(basis.slice(5))]![m - 1]! - r.chiR0[Number(basis.slice(5))]![m - 1]!
  const h4Cases = withR.filter(r => r.k === 2 && r.start === 'D' && r.env === 'E2')
  const H4 =
    h4Cases.length === 2 &&
    h4Cases.every(r => {
      const one = record(r, 1)
      const all = record(r, r.k)
      const before = recordOfBasis(pairOf(r), one.basis, 1)

      return all.value >= H4_FLOOR && one.value >= H4_PLATEAU * all.value && one.value >= before + H4_GAIN
    })
  const instrument = I1 && I2 && K1 && K2
  const admissible = U1 && U2 && U3 && U4 && C1 && C2 && C3 && C4
  const status = !instrument || !admissible ? 'fail' : H3 && H4 ? 'pass' : H3 || H4 ? 'partial' : 'fail'
  const metrics: Record<string, number> = {
    I1: flag(I1),
    I2: flag(I2),
    K1: flag(K1),
    K2: flag(K2),
    U1: flag(U1),
    U2: flag(U2),
    U3: flag(U3),
    U4: flag(U4),
    C1: flag(C1),
    C2: flag(C2),
    C3: flag(C3),
    C4: flag(C4),
    H3: flag(H3),
    H4: flag(H4),
    reproductionResidual: repro,
    reproductionCases: reproCases,
    k1Difference: sameK1,
    engineCovariance: c3,
    ...lift,
    ...kernels,
    ...knit,
  }

  for (const r of [...plain, ...withR, ...first]) {
    const p = r.name

    metrics[`${p}_lossT`] = r.lossT
    metrics[`${p}_lossM`] = r.lossM
    metrics[`${p}_lossR`] = r.lossR
    metrics[`${p}_norm`] = r.normResidual
    metrics[`${p}_overlap`] = r.overlapResidual
    metrics[`${p}_multi`] = r.multi
    r.lossRByClass.forEach((x, c) => {
      metrics[`${p}_lossRBasis${c}`] = x
    })

    if (r.antiResidual > 0) {
      metrics[`${p}_anti`] = r.antiResidual
    }

    r.chiT0.forEach((x, i) => {
      metrics[`${p}_chiT0_m${i + 1}`] = x
      metrics[`${p}_chiT_m${i + 1}`] = r.chiTLate[i]!
    })
    r.chiRLate.forEach((row, c) =>
      row.forEach((x, i) => {
        metrics[`${p}_chiR${c}_m${i + 1}`] = x
      }),
    )
  }

  const h4Line = h4Cases
    .map(r => {
      const one = record(r, 1)
      const all = record(r, r.k)

      return `${r.name} ${one.basis} one hole ${one.value.toFixed(4)} both ${all.value.toFixed(4)} without R ${recordOfBasis(pairOf(r), one.basis, 1).toFixed(4)}`
    })
    .join('; ')
  const line = withR
    .filter(r => r.k === 2)
    .map(r => {
      const p = pairOf(r)

      return `${caseKey(r)} tone ${p.lossT.toFixed(3)} -> ${r.lossT.toFixed(3)}, role by basis ${p.lossRByClass.map(x => x.toFixed(3)).join('/')} -> ${r.lossRByClass.map(x => x.toFixed(3)).join('/')}`
    })
    .join('; ')

  metrics.seconds = (Date.now() - started) / 1000

  return verdict({
    status,
    claim: `I1 ${I1}, I2 ${I2}, K1 ${K1}, K2 ${K2}, U1 ${U1}, U2 ${U2}, U3 ${U3}, U4 ${U4}, C1 ${C1}, C2 ${C2}, C3 ${C3}, C4 ${C4}, H3 ${H3}, H4 ${H4}: ${line}. Records: ${h4Line}`,
    metrics,
    control: {
      K1: flag(K1),
      K2: flag(K2),
      LFF_frameAllC: lift.LFF_frameAllC!,
      knitSumMoveFailures: knit.knitSumMoveFailures ?? -1,
      knitSumReflectionsCommuting: knit.knitSumReflectionsCommuting ?? -1,
    },
    notes: `L2. R (E-QTM-0134) as a step of C* (E-FND-0160) on role-holes' exact store, after the fear kernel at a contact triple off a knot, k = 1 and 2 environment holes, ${plan.beats} beats; and as a step of the working knit (E-QTM-0184) on the D4 box of side 5. The rule without R is E-QTM-0186's case moved to code/measure/role-pointer. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'quantum/reflection-step',
  code: 'E-QTM-0197',
  title:
    "explores whether the reflection R through the frame direction, made a step of the superposed rule, picks a pointer basis, fail (the candidate closes): R is an admissible step (unitary and an involution, covariant under all 648 frame changes, the like swap, and on the knit all 52 W(F4) and translation symmetries plus 216 grid moves) but picks no basis: on C* with two environment holes it raises every role basis's loss together (frame-mixed L = 2: 0.657 / 0.592 / 0.599 / 0.592 from 0.518 / 0.403 / 0.364 / 0.400, L = 4: 0.733 / 0.655 / 0.678 / 0.650) and lowers the one-hole record of the basis lost most (0.050 of 0.511 in both holes at L = 2, count 0.091 from 0.102 at L = 4), so no plateau; at one environment hole it never acts; without R E-QTM-0186 is reproduced to 4.9e-5",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return reflectionStepRun()
  },
})
