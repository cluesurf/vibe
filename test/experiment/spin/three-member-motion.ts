// THE CHARGE-ONE, SPIN-HALF THREE-MEMBER STATE BOUND AND BOOSTED OFF THE HUSK AXES (E-SPN-0193, OPEN-MAT-01; moving-matter
// item 0004, spec row B2). RULE: the candidate (register) rule, so the result is provisional until the rule is adopted
// (moving-matter item 0006).
//
// E-SPN-0192 found that three like-tone register members on one level carry Q = -1 with J = 1/2 (10 doublets per tone; in
// one half, n+ = 3, all of Lambda^3 of the half's four register states is J = 1/2). This file asks whether the rule binds
// such a triple and whether the bound triple moves in any 3d direction.
//
// DERIVED BEFORE THE GATE RUN (code/measure/three-member-motion on E-FND-0161's engine).
// 1. THE STATE (L1). Three holes of one sea (like tone, so 3Q = -3 by E-SPN-0189's vibe count), all in half + (each hole
//    keeps its half, E-FND-0161), started on one site in the beat-1 sector, antisymmetric in the fiber: one state of
//    Lambda^3 of the half's sector, J = 1/2 by E-SPN-0192. Every piece of the rule keeps the tone, the halves and the
//    rotations, so the charge and the spin of anything this start becomes are the start's. They are not re-read here.
// 2. THE BOOST (L1). The engine runs at a total momentum. A boundary twist delta on every hole (each Bloch momentum shifted
//    by delta) gives the three holes K = 3 delta; the pair piece depends only on the relative sites and is periodic there,
//    so it is unchanged, and only the one-body beats move to the shifted momenta. So K takes any value on the L = 4 box,
//    which the engine holds exactly for three holes, and the box is never shrunk. The husk is coordinates 0, 1, 2 (the
//    depth is e_3, E-SPN-0127), so a boost along husk direction d is K = kappa d / |d| with K_3 = 0.
// 3. THE BOUND LEVEL AND ITS VELOCITY (L1). A Hann filter phi = sum_t w(t) e^(i E0 t) U^t psi0 over T cycles projects the
//    start onto the levels within the main lobe (half width 4 pi / T) of E0; the Rayleigh quotient E = -arg <phi|U phi>
//    reads the level to second order in what leaks through, and the purity |<phi|U phi>| / |phi|^2 = 1 - sigma_E^2 / 2
//    reads how many lines it holds. The group velocity is v = grad_K E, here by central differences at K +- h e_i on the
//    three husk axes. A bound level of the translation-invariant rule is an eigenvector at its K: the rule never moves
//    weight out of it, so the start's bound weight w_b(K) = |phi|^2 / |G(E0 - E)|^2 (G the filter's gain) holds at every
//    time, for any number of crossing times. What a boost can do is lower it, by moving the level into a continuum.
// 4. THE SIGN OF THE MASS. v = grad E with E read from U = e^(-i E). A level whose E falls with |K| moves against its
//    momentum, so a boost along d is given by K along -d. The direction gate reads the angle between v and the LINE of d
//    (the smaller of the angles to d and to -d), fixed here before any K run, and the sign is read.
//
// PROBE BEFORE THE GATES, DISCLOSED (tmp/motion-probe-*.log, K = 0, 256 cycles): the contact start keeps a contact share
//  (contact weight over the all-sector weight) of 0.40 to 0.94 under the rule, beating with period near 42 cycles, and 0.001
//  to 0.61 free (refocusing on the small torus). Its strongest line under the rule is 3.4054 a cycle with weight 0.565, the
//  next 3.5558 (0.076), outside the Hann lobe; the lines at 3.347 and 3.464 are the strongest line's own Hann sidelobes. One
//  cycle costs 0.32 to 0.59 s on the native kernel. The thresholds of BND (0.5, 3x) were set after this probe, from E-FND-0166's
//  B0 (0.8 and 0.4 for two holes), and are disclosed as such. The pass and kill thresholds of VEL and BF are the spec's.
//
// GATES, fixed before the gate run (L = 4 D4 torus, one half, E-SPN-0175's rule as in E-FND-0161 to 0166: member mixers at
// ringUnit(-1, 4), sector string ringUnit(-2, 1) a unit of V with cap 8, sector contact v^2 with v = ringUnit(2, 0), hole
// angles reversed; T = 256; kappa = pi / 4; h = pi / 32).
//  BND BOUND BEYOND THE FINITE-SIZE ERROR, at K = 0: the late mean contact share (reads every 8 cycles over cycles 128 to
//     255) under the coupling is at least 0.5 and at least 3 times the free rule's (the free value is the box's own
//     refocusing, the read's finite-size error). Tested couplings: the rule, and the contact alone (string 0).
//  VEL MOVES IN EVERY DIRECTION: at |K| = kappa along d = (1,0,0), (1,1,0), (1,1,1), (1,2,3), the husk group velocity lies
//     within 5 degrees of the line of d.
//  BF STAYS BOUND: f(K) = w_b(K) / w_b(0) at least 0.9 for every d (held for all time by item 3).
//  KILL (spec row B2): unbound at every tested coupling (BND fails for both), or a velocity more than 15 degrees off its
//     line (read only when I3 resolves the velocity; unresolved is partial), or f under 0.5. FAIL.
// CONTROL (must fail the gate): the free rule, three free members, fails BND's 0.5 bar.
// INSTRUMENT (a failure makes the verdict partial at best): I1 every run keeps its norm within 1e-10; I2 every twisted
//  frame passes E-FND-0161's V1 tolerances (sector and transfer residuals and unitarity within 1e-12, 4 complements a half);
//  I3 every filtered level is one line within the FD resolution: |E - E0| below 2 pi / T, and the Rayleigh error bound
//  sigma_E^2 / (4 pi / T) (the leaked weight's pull on E: |sum p_n (E_n - E)| <= sigma_E^2 / gap, every line nearer than
//  the lobe's half width 4 pi / T counted as the level) at most a tenth of the smallest |E(K + h e_i) - E(K - h e_i)| that
//  the velocity's largest component is read from.
//  DISCLOSED CORRECTION, made after the smoke (T = 16, tmp/motion-smoke.log) and before the gate run: I3 first compared
//  sigma_E itself with the FD difference, but item 3's Rayleigh quotient errs at second order, sigma_E^2 / gap, not
//  sigma_E. The smoke's numbers were not gate numbers (T = 16, sigma_E 0.08); no other gate or threshold moved.
// PASS: BND (the rule), VEL, BF, the control failing BND, I1 to I3. PARTIAL otherwise, the gap named.
// READ, gating nothing: |v| in docks a cycle, the crossing time 4 / |v| of the L = 4 box and how many of them the run spans,
//  the sign of the mass, the components across d, the contact share of the filtered level, the bound line E(K) per K;
//  and WHETHER THE STATE IS LIGHT (asked after E-FRC-0289, which rules out a massless-limit three-member electron by 't
//  Hooft matching but not a massive bound state): the kinetic energy E(K) - E(0) at |K| = kappa against the binding scale
//  (the gap from the bound line to the start's next line at K = 0), and the band mass kappa / |v|.
//
// WHAT THIS CAN AND CANNOT SHOW. The 4d torus of side 4 (the only box the exact three-hole engine holds), one half (n+ = 3,
// the two doublets outside SU(2)+'s Gauss law; the n+ = 2 doublets need both halves, 6.7e7 amplitudes), one tone, the
// register rule. The velocity is the band's, read on the bulk torus at K_3 = 0, not on the true husk (E-SPN-0181: the
// register member does not travel on the true screen). Depth L2 at most.
//
// FIRST RUN 2026-10-08 (tmp/motion-gate.log, 3,889 s): PASS. No gate moved after it and none was rerun.
//  - BND: late contact share 0.712 (rule), 0.430 (contact alone, under the 0.5 bar), 0.118 free (CT holds). Lines at K = 0:
//    3.4054 (0.565), 3.5550 (0.076), 3.8066, 5.8406; the binding gap to the next line is 0.150 a cycle.
//  - VEL: (1,0,0) 0.00 deg, (1,1,0) 0.00, (1,1,1) 0.00 (exact by the cubic symmetry, transverse parts 1e-13), (1,2,3) 4.01
//    deg, the one generic direction, inside 5 but near it. |v| 2.34e-3, 2.78e-3, 2.93e-3, 2.79e-3 docks a cycle: the
//    speed at fixed |K| is 25 percent anisotropic (axis against body diagonal), which is what turns (1,2,3).
//  - BF: f 1.004 to 1.006. I1 3.2e-12; I2 holds on 29 frames; I3 the Rayleigh pull 5e-8 to 1.7e-7 against FD differences
//    3.3e-4 to 4.6e-4.
//  - LIGHT OR HEAVY (asked after E-FRC-0289): heavy. The kinetic energy at |K| = pi/4 is 1.24e-3 a cycle, 0.8 percent of
//    the binding gap, and the band mass is 268. The crossing time of the L = 4 box is 1,360 to 1,710 cycles, so the run's 256
//    cycles span 0.15 to 0.19 of a crossing; the ten crossings rest on item 3's exact conservation, not on the run.
//    E-FRC-0289 rules out only a light, massless-limit three-member electron, so this massive bound state is the form
//    the three-member electron can still take on this rule.
//
// DETERMINISM: no random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { torus } from '@/code/measure/register-sea'
import { holeEngine, holeFrame, type HoleFrame } from '@/code/measure/register-holes'
import {
  contactStart,
  couplingRule,
  filtered,
  hann,
  lineSpectrum,
  rayleigh,
  ruleSetup,
  sectorContact,
  strongestLines,
  twistedTorus,
  type Coupling,
} from '@/code/measure/three-member-motion'

export type MotionPlan = {
  L: number
  T: number
  kappa: number
  h: number
  threads: number
}

export const GATE_PLAN: MotionPlan = {
  L: 4,
  T: 256,
  kappa: Math.PI / 4,
  h: Math.PI / 32,
  threads: 8,
}

export const DIRECTIONS: readonly (readonly [number, number, number])[] = [
  [1, 0, 0],
  [1, 1, 0],
  [1, 1, 1],
  [1, 2, 3],
]

const FRAME_TOL = 1e-12
const NORM_TOL = 1e-10
const SHARE_BAR = 0.5
const SHARE_RATIO = 3
const PASS_DEG = 5
const KILL_DEG = 15
const PASS_BF = 0.9
const KILL_BF = 0.5

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'spin/three-member-motion',
  code: 'E-SPN-0193',
  title:
    'three like-tone register holes (charge one, spin one half) bind at contact and the bound triple moves in every tested 3d direction, pass on the register rule (provisional): on the L = 4 torus the rule keeps a late contact share of 0.712 against 0.118 free, its bound line holds 0.565 of the contact start, and boosted to |K| = pi/4 along (1,0,0), (1,1,0), (1,1,1), (1,2,3) by a boundary twist its group velocity lies 0, 0, 0 and 4.0 degrees off the requested line with the bound weight kept (f 1.004 to 1.006); but it is heavy, with a band mass of 268 and a kinetic energy 0.8 percent of its binding gap, a massive bound state, which is all that E-FRC-0289 still allows',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return threeMemberMotionRun(GATE_PLAN)
  },
})

const frameOk = (fr: HoleFrame): boolean => {
  const c = fr.checks

  return (
    c.sectorOutside <= FRAME_TOL &&
    c.transferOutside <= FRAME_TOL &&
    c.unitary <= FRAME_TOL &&
    c.minComplement === 4 &&
    c.maxComplement === 4
  )
}

// |sum_t w(t) e^(i x t)|: the filter's gain at an offset x from its center
function gain(x: number, T: number): number {
  let r = 0
  let i = 0

  for (let t = 0; t < T; t++) {
    r += hann(t, T) * Math.cos(x * t)
    i += hann(t, T) * Math.sin(x * t)
  }

  return Math.hypot(r, i)
}

const wrap = (x: number): number => {
  const y = ((x + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)

  return y - Math.PI
}

export function threeMemberMotionRun(plan: MotionPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const { Ps } = ruleSetup()
  const base = torus(plan.L)
  const options = { backend: 'native' as const, threads: plan.threads }
  const T = plan.T
  let normDrift = 0
  let framesOk = true

  const at = (K: readonly number[]): { fr: HoleFrame } => {
    const t = twistedTorus(base, [K[0]! / 3, K[1]! / 3, K[2]! / 3, 0])
    const fr = holeFrame(t, Ps, 8)

    framesOk = framesOk && frameOk(fr)

    return { fr }
  }

  // ---------------- BND and the control, K = 0 ----------------
  const fr0 = holeFrame(base, Ps, 8)

  framesOk = framesOk && frameOk(fr0)

  const e0 = holeEngine(fr0, 3, 0, options)
  const psi00 = contactStart(fr0)
  const lateShare = (reads: { cycle: number; share: number }[]): number => {
    const late = reads.filter(r => r.cycle >= T / 2)

    return late.reduce((s, r) => s + r.share, 0) / late.length
  }
  const share: Record<Coupling, number> = { rule: 0, contact: 0, free: 0 }
  let ruleLines: { E: number; height: number }[] = []

  for (const c of ['rule', 'contact', 'free'] as const) {
    const run = filtered(e0, couplingRule(base, c), psi00, T, null, 8)

    normDrift = Math.max(normDrift, run.normDrift)
    share[c] = lateShare(run.reads)

    if (c === 'rule') {
      ruleLines = strongestLines(lineSpectrum(run.cRe, run.cIm, 8192), 4, 1e-3)
    }

    log(`BND ${c} late share ${share[c].toFixed(4)} (${run.seconds.toFixed(0)} s)`)
  }

  const bound = (c: Coupling): boolean =>
    share[c] >= SHARE_BAR && share[c] >= SHARE_RATIO * share.free
  const BND = bound('rule')
  const anyBound = BND || bound('contact')
  const CT = !bound('free')
  const E0 = ruleLines[0]!.E

  log(`lines ${JSON.stringify(ruleLines)}`)

  // ---------------- the bound level at K ----------------
  const rule0 = couplingRule(base, 'rule')
  const level = (K: readonly number[]): { E: number; sigma: number; wb: number; share: number } => {
    const { fr } = at(K)
    const e = holeEngine(fr, 3, 0, options)
    const run = filtered(e, rule0, contactStart(fr), T, E0, T)
    const r = rayleigh(e, rule0, run.phi)
    const sc = sectorContact(fr, run.phi)
    const g = gain(wrap(E0 - r.E), T)

    normDrift = Math.max(normDrift, run.normDrift)

    return {
      E: r.E,
      sigma: Math.sqrt(Math.max(0, 2 * (1 - r.purity))),
      wb: r.norm / (g * g),
      share: sc.contact / sc.sector,
    }
  }

  const rest = level([0, 0, 0])

  log(`rest E ${rest.E.toFixed(6)} sigma ${rest.sigma.toExponential(2)} wb ${rest.wb.toFixed(4)}`)

  type Row = {
    d: readonly number[]
    K: number[]
    E: number
    v: number[]
    angle: number
    sign: number
    speed: number
    f: number
    sigma: number
    minDiff: number
    offE: number
    share: number
  }
  const rows: Row[] = []

  for (const d of DIRECTIONS) {
    const n = Math.hypot(...d)
    const K = d.map(x => (plan.kappa * x) / n)
    const mid = level(K)
    const v: number[] = []
    const diffs: number[] = []
    let sigma = mid.sigma
    let offE = Math.abs(wrap(mid.E - E0))

    for (let i = 0; i < 3; i++) {
      const plus = level(K.map((x, j) => (j === i ? x + plan.h : x)))
      const minus = level(K.map((x, j) => (j === i ? x - plan.h : x)))
      const diff = wrap(plus.E - minus.E)

      v.push(diff / (2 * plan.h))
      diffs.push(Math.abs(diff))
      sigma = Math.max(sigma, plus.sigma, minus.sigma)
      offE = Math.max(offE, Math.abs(wrap(plus.E - E0)), Math.abs(wrap(minus.E - E0)))
    }

    const speed = Math.hypot(...v)
    const cos = v.reduce((s, x, i) => s + x * d[i]!, 0) / (speed * n)
    const angle = (Math.acos(Math.min(1, Math.abs(cos))) * 180) / Math.PI
    const big = v.reduce((b, x, i) => (Math.abs(x) > Math.abs(v[b]!) ? i : b), 0)

    rows.push({
      d,
      K,
      E: mid.E,
      v,
      angle,
      sign: Math.sign(cos),
      speed,
      f: mid.wb / rest.wb,
      sigma,
      minDiff: diffs[big]!,
      offE,
      share: mid.share,
    })

    log(`d ${d.join(',')} v ${v.map(x => x.toExponential(3)).join(',')} angle ${angle.toFixed(2)} f ${(mid.wb / rest.wb).toFixed(4)} sigma ${sigma.toExponential(2)}`)
  }

  const VEL = rows.every(r => r.angle <= PASS_DEG)
  const BF = rows.every(r => r.f >= PASS_BF)
  const I1 = normDrift <= NORM_TOL
  const I2 = framesOk
  const lobe = (4 * Math.PI) / T
  const pull = (s: number): number => (s * s) / lobe
  const I3 =
    pull(rest.sigma) <= 0.1 * Math.min(...rows.map(r => r.minDiff)) &&
    rows.every(r => r.offE < (2 * Math.PI) / T && pull(r.sigma) <= 0.1 * r.minDiff)
  // light or heavy: the kinetic energy at kappa against the binding scale, and the band mass
  const bindingGap = ruleLines.length > 1 ? Math.abs(wrap(ruleLines[1]!.E - E0)) : NaN
  const kinetic = Math.max(...rows.map(r => Math.abs(wrap(r.E - rest.E))))
  const bandMass = plan.kappa / Math.max(...rows.map(r => r.speed))
  // an angle is read only when I3 resolves the velocity: an unresolved one makes the verdict partial, never a kill
  const killed =
    !anyBound ||
    (I3 && rows.some(r => !(r.angle <= KILL_DEG))) ||
    rows.some(r => !(r.f >= KILL_BF))
  const status: Verdict['status'] = killed
    ? 'fail'
    : BND && VEL && BF && CT && I1 && I2 && I3
      ? 'pass'
      : 'partial'
  const seconds = (Date.now() - started) / 1000
  const metrics: Record<string, number> = {
    BND: flag(BND),
    VEL: flag(VEL),
    BF: flag(BF),
    CT: flag(CT),
    I1: flag(I1),
    I2: flag(I2),
    I3: flag(I3),
    shareRule: share.rule,
    shareContact: share.contact,
    shareFree: share.free,
    E0,
    restE: rest.E,
    restWb: rest.wb,
    restSigma: rest.sigma,
    restShare: rest.share,
    bindingGap,
    kinetic,
    kineticOverBinding: kinetic / bindingGap,
    bandMass,
    normDrift,
    seconds,
  }

  rows.forEach(r => {
    const k = r.d.join('')

    metrics[`angle_${k}`] = r.angle
    metrics[`speed_${k}`] = r.speed
    metrics[`f_${k}`] = r.f
    metrics[`sign_${k}`] = r.sign
    metrics[`sigma_${k}`] = r.sigma
    metrics[`pull_${k}`] = pull(r.sigma)
    metrics[`minDiff_${k}`] = r.minDiff
    metrics[`crossings_${k}`] = (T * r.speed) / plan.L
  })

  return verdict({
    status,
    claim: `three like-tone register holes (Q = -1, J = 1/2) at contact on the L = ${plan.L} torus: late contact share ${share.rule.toFixed(3)} under the rule, ${share.contact.toFixed(3)} with the contact alone, ${share.free.toFixed(3)} free (BND ${BND}); the bound line ${E0.toFixed(4)} a cycle holds ${rest.wb.toFixed(3)} of the start; boosted to |K| = ${plan.kappa.toFixed(3)}: ${rows
      .map(r => `(${r.d.join(',')}) ${r.angle.toFixed(2)} deg off its line, |v| ${r.speed.toExponential(2)}, f ${r.f.toFixed(3)}`)
      .join('; ')} (VEL ${VEL}, BF ${BF}); control CT ${CT}, instruments I1 ${I1} I2 ${I2} I3 ${I3}`,
    metrics,
    control: { CT: flag(CT), freeShare: share.free },
    notes: `Register rule, provisional until moving-matter item 0006. Lines at K = 0: ${ruleLines
      .map(l => `${l.E.toFixed(4)} (${l.height.toFixed(3)})`)
      .join(', ')}. Per direction: ${rows
      .map(r => `(${r.d.join(',')}) v ${r.v.map(x => x.toExponential(3)).join(' ')}, E ${r.E.toFixed(6)}, sign ${r.sign}, sigma ${r.sigma.toExponential(2)} against the FD difference ${r.minDiff.toExponential(2)}, level contact share ${r.share.toFixed(3)}, crossing time ${(plan.L / r.speed).toExponential(2)} cycles`)
      .join('; ')}. Light or heavy: the kinetic energy at |K| = ${plan.kappa.toFixed(3)} is ${kinetic.toExponential(2)} a cycle against a binding gap of ${bindingGap.toFixed(4)} (ratio ${(kinetic / bindingGap).toExponential(2)}), band mass ${bandMass.toExponential(2)}. ${seconds.toFixed(0)} s.`,
  })
}
