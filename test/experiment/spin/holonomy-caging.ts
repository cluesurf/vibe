// DOES THE LINK HOLONOMY CAGE A MEMBER CARRIED AS A ROLE TRIPLET? (E-SPN-0196, moving-matter item 0019, Key 4 of
// idea/keys.md, one-body half; research/charge-one-after-anomaly.md makes it the confinement premise: anomaly matching
// presupposes that a lone +-1/3 member does not move freely). R* with the spinor lift (decision 0006).
//
// THE QUESTION. A lone member's role is a triplet that nearly every loop twists (E-SPN-0132: 399,485 of 401,408
// elementary loops curved on side 8), while the member-antimember delta singlet and the three-member epsilon singlet are
// invariant under every link element. If the holonomy slows the triplet carriage and leaves the trivial one alone, the
// field that makes a member heavy is the confinement the colour singlets need.
//
// THE OBJECT (code/measure/holonomy-caging). The register member of E-SPN-0160 (192 modes a dock), its cycle exactly
// register-link-field memberCycle (the register's 2T field the identity), with a role factor C^k:
//   (T) k = 1, the trivial carriage, the links ignored
//   (C) k = 3, the triplet carriage: the slot crossing link (x, d) turns the role by the link's grid move lifted to
//       Sigma(648) in the defining representation (E-FRC-0278's lift, read here off the phase points). Colour on the rule
//       is the finite Sigma(648); love carries 3 and fear 3-bar (code/measure/role-register, E-FRC-0290 read the
//       conjugacy). A lone member of either tone is caged or not alike: conj U is as twisting as U, so the run carries
//       the 3 (a 3-bar member's run is the complex conjugate field's, read as the second section is not: see READ)
// The links: E-SPN-0132's working field, the colour weave's own integer Weyl start (code/rule/vibe-weave linkStart),
// frozen. Sigma(648) is a non-split central extension of the grid moves, so a lift is a SECTION: which centre element a
// link carries is not fixed by the rule's ASL(2, 3) links. Gated: the first lift in exact-key order ('first'); read:
// an integer Weyl choice of lift per link ('weyl'), a different Z3 centre field on the same moves.
// The packet: a rest-band packet of the lightest branch. At K = 0, C(0) = c0 sum_d gamma(r_d) = 0, so the cycle is the
// scalar u on range Q_S: the slot-uniform register state is the rest level E = M. The start is that state on register
// mode 0, role 0, under a Gaussian envelope exp(-r^2 / (4 sigma^2)) over docks, sigma 1 (Z^4 units; a root is sqrt 2).
// Mixer ringUnit(-1, 4), M 0.380251 a cycle (E-SPN-0180's).
// EXACT: Sigma(648), the lifts, unitarity, det, the delta and epsilon invariants, in Q(zeta_9). That is NOT
// Z[omega, 1/sqrt(-3)]: the SU(3) section of the Hessian group needs zeta_9 (NINTH = diag(e, e, e omega), e = zeta_9^2).
// FLOAT: the run, the exact lifts as floats checked to 1e-12.
//
// THE BOX (the brief's side 8, never smaller). PROBE 1 (tmp/caging-probe-s8, kept in the log entry; side 8, gates
// nothing) found the free member CROSSES the side-8 box by beat 24: rms 2.00, 2.77, 3.73, 4.54, 5.04 at beats 0, 8, 16,
// 24, 32 (sigma 1) against the box's uniform rms 5.30, then falls (4.77, 4.55) and the return probability revives (0.90
// at beat 48 for sigma 2): a torus recurrence. A slope over beats 16 to 64 there reads the free member as nearly still
// and would fire a false KILL. PROBE 2 (tmp/caging-probe-s16.log, side 16, sigma 1): T rms 3.74, 6.03, 8.49, 10.22 at
// beats 16, 32, 48, 64 against the box's 10.55, still saturating by beat 64 (alpha bends); C 3.01, 3.96, 4.71, 5.36,
// return 0.04, 82 s. So the GATED box is side 20 (larger is allowed, smaller is not; box rms about 13.2, T's projected
// rms at 64 about 10.2, 0.77 of it), and side 8 is run as a READ, the brief's box.
//
// GATES, fixed before the gate run (side 20, 64 beats, a beat is one half of memberCycle).
//  G  speed = the least-squares slope of the rms distance on the beat over beats 16 to 64; ratio = speed_C / speed_T.
//     PASS ratio <= 1/3. KILL (fixed 2026-10-08) ratio >= 0.9: the holonomy does not cage the member. Between: partial.
//  A  ALGEBRA, exact over all 648 elements (so over every lifted link): unitary, det 1 (so U x U x U eps = det U eps =
//     eps), (U x conj U) delta = delta, and eps read component by component.
//  C1 CONTROL: the triplet on flat links (every link the identity lift) equals the trivial run, role 0, at every beat to
//     1e-12, and roles 1 and 2 stay 0.
// INSTRUMENT (a failure makes the verdict partial):
//  I1 the closure is Sigma(648) (648, closed), every element permutes the phase points, the 216 grid moves have three
//     lifts each; the exact generators equal su3-subgroups' floats to 1e-12; every float element is unitary to 1e-12; the
//     section keeps a link and its reverse inverse (the reverse move's lifts hold the inverse matrix)
//  I2 the trivial carriage is register-link-field memberCycle (trivial 2T field on the same mesh), 2 cycles, to 1e-13
//  I3 every run keeps the norm to 1e-10
//  S  the free run is not saturated: rms_T rises over every 8-beat window from 16 to 64 and rms_T(64) < 0.85 of the box's
//     uniform rms. Failing S means the box cannot read the free speed: partial, never pass or kill.
// READ, gating nothing: the 'weyl' section's ratio, the log-log slope (rms ~ beat^alpha over 16 to 64: 1 ballistic, 1/2
//  diffusive, 0 caged) of T and C, the return probabilities, and the side-8 ratio.
// On PASS: 'Key 4 pair run ready' goes to the lead (the singlet's kinetic mass against flat, keys.md Key 4).
//
//
// FIRST RUN (tmp/caging.log, 629 s): PASS, narrowly. No gate moved and none was rerun.
//  - G: speed_T 0.15581, speed_C 0.04680 a beat, ratio 0.3004 (pass <= 0.3333). rms T 2.000, 3.738, 6.032, 8.596, 11.098
//    at beats 0, 16, 32, 48, 64; C 2.000, 3.031, 3.964, 4.720, 5.365. alpha T 0.811, C 0.400: the triplet spreads
//    sub-diffusively, the free member nearly ballistically. Return at 64: T 0.010, C 0.033.
//  - A: 648 of 648 unitary, det 1, delta and eps invariant. C1: flat triplet = T exactly (0), roles 1, 2 stay 0.
//  - I1 (generators 5.0e-16, unitary 4.4e-16, reverse exact), I2 (memberCycle 0), I3 (norm 1.6e-12), S (rising, rms_T(64)
//    0.842 of the box) hold.
//  - READ: the 'weyl' centre section ratio 0.2993 (alpha 0.405): the Z3 centre choice does not matter. Side 8 (the brief's
//    box) ratio 2.56, the saturation artefact the probe foresaw (T rms 5.04 at 32, 4.85 at 64, box 5.30).
//  WHAT IT IS NOT. Caging here is diffusion, not localization (C's rms still grows as beat^0.4), so the ratio of a
//  diffusive slope to a ballistic one falls with the window: the margin (0.300 against 0.333) is the window's. T's own fit
//  is a little saturation-biased (alpha 0.81, not 1), which raises the ratio, so the bias works against the pass. The
//  link field is frozen and read in the 4D bulk, not on the husk; the pair (Key 4's second half) is not run.
//
// Depth L2: a lattice-gauge mechanism (strong-coupling caging of non-singlets, Aharonov-Bohm caging) read off the rule's
// own links. DETERMINISM: no random numbers. NOTHING MOVES: a link holds a grid move; the role is turned by the link its
// slot crosses.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import { toComplex, type NinthMatrix } from '@/code/algebra/ninth-field'
import { makeColorWeave } from '@/code/rule/color-weave'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  memberCycle,
  registerGauge,
  type RegisterField,
} from '@/code/measure/register-link-field'
import { type Torus } from '@/code/measure/register-sea'
import {
  cagingBeat,
  cagingEngine,
  cloneState,
  flatRole,
  gridLifts,
  offsetDistances,
  offsetOf,
  restPacket,
  roleLinks,
  SIGMA_GENERATORS_EXACT,
  singletInvariance,
  slope,
  spreadRead,
  trivialRole,
  type CagingState,
  type GridLifts,
  type RoleLinks,
  type SpreadRead,
} from '@/code/measure/holonomy-caging'

export type CagingPlan = {
  side: number
  readSide: number
  beats: number
  fitFrom: number
  sigma: number
}

export const CAGING_PLAN: CagingPlan = {
  side: 20,
  readSide: 8,
  beats: 64,
  fitFrom: 16,
  sigma: 1,
}

const PASS_RATIO = 1 / 3
const KILL_RATIO = 0.9
const FLAT_TOL = 1e-12
const FLOAT_TOL = 1e-12
const CYCLE_TOL = 1e-13
const NORM_TOL = 1e-10
const SATURATION = 0.85

export default experiment({
  id: 'spin/holonomy-caging',
  code: 'E-SPN-0196',
  title:
    "the link holonomy cages a register member carried as a Sigma(648) role triplet, pass narrowly: on side 20 in E-SPN-0132's frozen working links the triplet's rms spread grows 0.0468 a beat over beats 16 to 64 against the trivial carriage's 0.1558 (ratio 0.300, pass at 1/3), sub-diffusively (rms ~ beat^0.40 against 0.81), the same under a second Z3 centre section (0.299), with the flat triplet equal to the trivial run exactly and every one of the 648 lifts keeping the delta and epsilon singlets exactly; the brief's side-8 box saturates the free member by beat 24 and reads 2.56",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return holonomyCagingRun(CAGING_PLAN)
  },
})

const flag = (b: boolean): number => (b ? 1 : 0)

type Track = { reads: SpreadRead[] }

type Box = {
  side: number
  weave: ReturnType<typeof makeColorWeave>
  r2: Float64Array
  boxRms: number
  dockOffset: Int32Array
}

function boxOf(side: number): Box {
  const weave = makeColorWeave({ side, table: 'bind' })
  const r2 = offsetDistances(side)
  const boxRms = Math.sqrt(r2.reduce((a, b) => a + b, 0) / r2.length)
  const dockOffset = Int32Array.from({ length: weave.mesh.cellCount }, (_, x) =>
    offsetOf(side, x, 0),
  )

  return { side, weave, r2, boxRms, dockOffset }
}

// one carriage's run from the rest packet, reads at every beat
function track(
  box: Box,
  role: RoleLinks,
  u: readonly [number, number],
  plan: CagingPlan,
  roleStart = 0,
): Track {
  const k = role.k
  const E = cagingEngine(box.weave, role, u)
  const start = restPacket({
    side: box.side,
    k,
    x0: 0,
    sigma: plan.sigma,
    register: 0,
    role: roleStart,
    r2: box.r2,
  })
  const reads: SpreadRead[] = []

  let s = cloneState(start)

  for (let b = 0; b <= plan.beats; b++) {
    reads.push(
      spreadRead({ side: box.side, k, x0: 0, r2: box.r2, start, s, dockOffset: box.dockOffset }),
    )

    if (b < plan.beats) {
      s = cagingBeat(E, s, b)
    }
  }

  return { reads }
}

// T and the flat triplet in lockstep: the worst amplitude gap of role 0 against T, and the worst role 1, 2 amplitude
function flatLockstep(
  box: Box,
  L: GridLifts,
  u: readonly [number, number],
  plan: CagingPlan,
): { T: Track; gap: number; leak: number } {
  const cells = box.weave.mesh.cellCount
  const ET = cagingEngine(box.weave, trivialRole(cells), u)
  const EF = cagingEngine(box.weave, flatRole(cells, L), u)
  const startT = restPacket({ side: box.side, k: 1, x0: 0, sigma: plan.sigma, register: 0, role: 0, r2: box.r2 })
  const startF = restPacket({ side: box.side, k: 3, x0: 0, sigma: plan.sigma, register: 0, role: 0, r2: box.r2 })
  const reads: SpreadRead[] = []

  let t = cloneState(startT)
  let f = startF
  let gap = 0
  let leak = 0

  for (let b = 0; b <= plan.beats; b++) {
    reads.push(
      spreadRead({ side: box.side, k: 1, x0: 0, r2: box.r2, start: startT, s: t, dockOffset: box.dockOffset }),
    )

    for (let i = 0; i < t.re.length; i++) {
      gap = Math.max(gap, Math.hypot(t.re[i]! - f.re[3 * i]!, t.im[i]! - f.im[3 * i]!))
      leak = Math.max(
        leak,
        Math.hypot(f.re[3 * i + 1]!, f.im[3 * i + 1]!),
        Math.hypot(f.re[3 * i + 2]!, f.im[3 * i + 2]!),
      )
    }

    if (b < plan.beats) {
      t = cagingBeat(ET, t, b)
      f = cagingBeat(EF, f, b)
    }
  }

  return { T: { reads }, gap, leak }
}

const beatsFrom = (plan: CagingPlan): number[] =>
  Array.from({ length: plan.beats - plan.fitFrom + 1 }, (_, i) => plan.fitFrom + i)

const speedOf = (t: Track, plan: CagingPlan): number => {
  const xs = beatsFrom(plan)

  return slope(xs, xs.map(b => t.reads[b]!.rms))
}

const alphaOf = (t: Track, plan: CagingPlan): number => {
  const xs = beatsFrom(plan)

  return slope(xs.map(Math.log), xs.map(b => Math.log(t.reads[b]!.rms)))
}

const normDrift = (t: Track): number =>
  Math.max(...t.reads.map(r => Math.abs(r.norm - 1)))

const floatGap3 = (exact: NinthMatrix, m: Float64Array): number =>
  Math.max(
    ...exact.flatMap((row, i) =>
      row.map((x, j) => {
        const [re, im] = toComplex(x)

        return Math.hypot(re - m[2 * (3 * i + j)]!, im - m[2 * (3 * i + j) + 1]!)
      }),
    ),
  )

const unitaryGap = (m: Float64Array): number => {
  let worst = 0

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let re = 0
      let im = 0

      for (let q = 0; q < 3; q++) {
        const ar = m[2 * (3 * i + q)]!
        const ai = m[2 * (3 * i + q) + 1]!
        const br = m[2 * (3 * j + q)]!
        const bi = -m[2 * (3 * j + q) + 1]!

        re += ar * br - ai * bi
        im += ar * bi + ai * br
      }

      worst = Math.max(worst, Math.hypot(re - (i === j ? 1 : 0), im))
    }
  }

  return worst
}

// I2: two beats of the trivial carriage against register-link-field memberCycle on the same mesh, trivial 2T field
function cycleInstrument(box: Box, u: readonly [number, number], plan: CagingPlan): number {
  const G = registerGauge()
  const cells = box.weave.mesh.cellCount
  const nb = new Int32Array(cells * 24)

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < 24; d++) {
      nb[x * 24 + d] = box.weave.mesh.neighbour(x, d)
    }
  }

  // memberCycle reads only the site count, nb and the links of the field
  const f: RegisterField = {
    t: { sites: Array.from({ length: cells }, () => []) } as unknown as Torus,
    nb,
    link: new Int16Array(cells * 24).fill(G.group.identity),
    kind: 'trivial',
  }
  const E = cagingEngine(box.weave, trivialRole(cells), u)
  const start = restPacket({ side: box.side, k: 1, x0: 0, sigma: plan.sigma, register: 0, role: 0, r2: box.r2 })

  let a: CagingState = cloneState(start)
  let m = { re: Float64Array.from(start.re), im: Float64Array.from(start.im) }

  for (let c = 0; c < 2; c++) {
    a = cagingBeat(E, a, 0)
    a = cagingBeat(E, a, 1)
    m = memberCycle(f, G, u, m)
  }

  let gap = 0

  for (let i = 0; i < a.re.length; i++) {
    gap = Math.max(gap, Math.hypot(a.re[i]! - m.re[i]!, a.im[i]! - m.im[i]!))
  }

  return gap
}

export function holonomyCagingRun(plan: CagingPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${((Date.now() - started) / 1000).toFixed(1)}s`)
  const th = unitAngle(ringUnit(-1, 4))
  const u: [number, number] = [Math.cos(th), Math.sin(th)]
  const M = Math.acos(-Math.cos(th))

  // ---- exact ----
  const L = gridLifts()
  const algebra = singletInvariance(L.elements)
  const A =
    algebra.unitary === 648 &&
    algebra.detOne === 648 &&
    algebra.delta === 648 &&
    algebra.epsilon === 648
  const genGap = Math.max(
    ...SIGMA_GENERATORS_EXACT.map((g, i) => floatGap3(g, SU3_SUBGROUPS.sigma648.generators[i]!)),
  )
  const unitGap = Math.max(...L.floats.map(unitaryGap))

  log('exact')

  // ---- the read box (side 8) and I2 there ----
  const small = boxOf(plan.readSide)
  const cycleGap = cycleInstrument(small, u, plan)
  const smallT = track(small, trivialRole(small.weave.mesh.cellCount), u, plan)
  const smallC = track(small, roleLinks(small.weave, small.weave.links, L, 'first'), u, plan)

  log('side 8')

  // ---- the gated box ----
  const box = boxOf(plan.side)
  const flat = flatLockstep(box, L, u, plan)
  const T = flat.T

  log('T and flat')

  const first = roleLinks(box.weave, box.weave.links, L, 'first')
  const C = track(box, first, u, plan)

  log('C first')

  const second = roleLinks(box.weave, box.weave.links, L, 'weyl')
  const W = track(box, second, u, plan)

  log('C weyl')

  // ---- gates ----
  const vT = speedOf(T, plan)
  const vC = speedOf(C, plan)
  const vW = speedOf(W, plan)
  const ratio = vC / vT
  const ratioW = vW / vT
  const svT = speedOf(smallT, plan)
  const svC = speedOf(smallC, plan)
  const C1 = flat.gap <= FLAT_TOL && flat.leak <= FLAT_TOL
  const I1 =
    L.liftsRead &&
    L.elements.length === 648 &&
    genGap <= FLOAT_TOL &&
    unitGap <= FLOAT_TOL &&
    first.reverseExact &&
    second.reverseExact
  const I2 = cycleGap <= CYCLE_TOL
  const drift = Math.max(...[T, C, W, smallT, smallC].map(normDrift))
  const I3 = drift <= NORM_TOL
  const windows = beatsFrom(plan).filter(b => (b - plan.fitFrom) % 8 === 0 && b + 8 <= plan.beats)
  const rising = windows.every(b => T.reads[b + 8]!.rms > T.reads[b]!.rms)
  const tEnd = T.reads[plan.beats]!.rms
  const S = rising && tEnd < SATURATION * box.boxRms
  const trusted = A && C1 && I1 && I2 && I3 && S
  const status: Verdict['status'] = !trusted
    ? 'partial'
    : ratio <= PASS_RATIO
      ? 'pass'
      : ratio >= KILL_RATIO
        ? 'fail'
        : 'partial'
  const word =
    status === 'pass' ? 'PASS' : status === 'fail' ? 'KILL' : trusted ? 'PARTIAL (between the gates)' : 'PARTIAL (a check failed)'
  const row = (t: Track): string =>
    [0, 16, 32, 48, 64]
      .filter(b => b <= plan.beats)
      .map(b => `${b}:${t.reads[b]!.rms.toFixed(3)}`)
      .join(' ')
  const ret = (t: Track): string =>
    `${t.reads[plan.beats]!.returned.toExponential(2)} (mean over 16 to 64 ${(
      beatsFrom(plan).reduce((s, b) => s + t.reads[b]!.returned, 0) / beatsFrom(plan).length
    ).toExponential(2)})`

  return verdict({
    status,
    claim: `holonomy caging on R*, side ${plan.side}, ${word}: speed_T ${vT.toFixed(5)}, speed_C ${vC.toFixed(5)} a beat (rms fit over beats ${plan.fitFrom} to ${plan.beats}), ratio ${ratio.toFixed(4)} against pass <= ${PASS_RATIO.toFixed(4)} and kill >= ${KILL_RATIO}; alpha T ${alphaOf(T, plan).toFixed(3)} C ${alphaOf(C, plan).toFixed(3)}; rms T ${row(T)}, C ${row(C)} (box ${box.boxRms.toFixed(3)}); return at ${plan.beats} T ${ret(T)} C ${ret(C)}; algebra A ${A} (unitary ${algebra.unitary}, det 1 ${algebra.detOne}, delta ${algebra.delta}, eps ${algebra.epsilon} of 648); control C1 ${C1} (flat triplet vs T ${flat.gap.toExponential(1)}, roles 1 and 2 ${flat.leak.toExponential(1)}); instrument I1 ${I1} (generators ${genGap.toExponential(1)}, unitary ${unitGap.toExponential(1)}) I2 ${I2} (memberCycle ${cycleGap.toExponential(1)}) I3 ${I3} (norm ${drift.toExponential(1)}) S ${S} (rising ${rising}, rms_T(64)/box ${(tEnd / box.boxRms).toFixed(3)}); READ weyl section ratio ${ratioW.toFixed(4)} (speed ${vW.toFixed(5)}, alpha ${alphaOf(W, plan).toFixed(3)}); side ${plan.readSide} ratio ${(svC / svT).toFixed(4)} (speed_T ${svT.toFixed(5)}, speed_C ${svC.toFixed(5)}, rms T ${row(smallT)}, C ${row(smallC)}, box ${small.boxRms.toFixed(3)})`,
    metrics: {
      ratio,
      speedT: vT,
      speedC: vC,
      alphaT: alphaOf(T, plan),
      alphaC: alphaOf(C, plan),
      returnT: T.reads[plan.beats]!.returned,
      returnC: C.reads[plan.beats]!.returned,
      ratioWeyl: ratioW,
      ratioSide8: svC / svT,
      algebra: flag(A),
      flatGap: flat.gap,
      cycleGap,
      normDrift: drift,
      saturation: tEnd / box.boxRms,
      M,
      seconds: (Date.now() - started) / 1000,
    },
    control: { flatGap: flat.gap, flatLeak: flat.leak, speedT: vT },
    notes: `Opposite slots agree with the weave: ${box.weave.opposite.every((o, d) => o === OPPOSITE[d])}. A 3-bar (fear) member runs on the complex-conjugate links: conj U is a Sigma(648) element's conjugate with the same twisting, not run here. Not shown: the pair (the singlet's kinetic mass, Key 4's second half), a dynamical link field, the husk read.`,
  })
}
