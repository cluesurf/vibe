// COMPOSITE LIGHT ON THE LOCKED WALK (E-FRC-0246): is the lightest love-fear pair of the doublet-locked token a
// massless band at the token's own top speed? A STAND-IN (locked tokens on one husk line, code/rule/locked-token-line
// and code/rule/drift-cost-line), read through code/measure/composite-locked-light.
//
// WHY. A token that copies its whole value never shares the photon's c = sqrt(2 kappa / 3) (E-MTR-0023), and a
// covariant lock cannot be lazy (Schur, E-RLT-0097). Candidate from note/research/vibe/roadmap/solutions.md section 3:
// build the photon from the SAME walk as matter, a love and a fear, so light and matter share one cone by
// construction. E-FRC-0186 found two free walks give only a continuum. The question here is whether the pair of
// LOCKED tokens, with the binding the model already has (the drift phase of E-SPN-0086), carries a massless bound
// branch whose slope is the token's top group velocity.
//
// THEORY, derived before any number (proofs in code/measure/composite-locked-light's header, each clause checked).
// T1 The token. U(k) = S(k) C has tr U = e^(i pi / 3) cos k and det U = omega, so its phases are pi / 3 +- E(k),
//    cos E = cos(k) / 2. THE DET IDENTITY: the two phases add to arg omega = 2 pi / 3 at every k. The top group
//    velocity is v_max = 1/2 = |C_00|, at k = pi / 2, an inflection point of E.
// T2 The free pair. The love-fear meeting under C is the identity (helicity suppression: a head-on love and fear pass
//    without meeting), so the pair's beat at total momentum K is block diagonal in the relative momentum q and its
//    spectrum is the sum set theta_s(K - q) + theta_s'(q). By the det identity the opposite-branch sector is
//    arg omega + E(q') - E(q' - K): at K = 0 it is EXACTLY FLAT (every q), and at K it is E-FRC-0186's particle-hole
//    continuum shifted by arg omega. Its edge is max_q [E(q + K/2) - E(q - K/2)] = 2 arcsin(sin(K/2) / 2), reached at
//    the inflection point, slope exactly v_max = 1/2 at K -> 0. The only linear thing in the free pair is the edge of
//    a continuum whose width is twice the edge: Pryce's objection, on the locked walk.
// T3 The comoving state chi_r = (|e0 e0> - |e1 e1>) / sqrt 2 at separation r (both copy forward, minus both back) is
//    an exact eigenstate at K = 0 with eigenvalue omega for EVERY r, and under ANY separation-dependent binding
//    phase V(r) it stays one, at omega e^(-i V(r)). With the drift cost (V = pi |r| / N, 2N-periodic) the K = 0
//    phase arg omega is held by chi_0 and by its wrap replicas chi_(+-2N m) and by nothing else.
// T4 THE NO. The branch through chi_0 (the lightest neutral pair: no string, rest phase arg omega exactly) has zero
//    slope at K = 0. Hellmann-Feynman: d omega / dK = <s(love)>, and chi_r has <s> = 0; the first-order splitting
//    matrix on the degenerate K = 0 space vanishes, because every chi_r has zero mean copy and the replicas lie 2N >
//    2 docks apart while a beat moves r by at most 2. So omega(K) = omega(0) + K^2 / (2 m) with m finite: a MASS.
//    Parity (x -> -x with sigma_x on each label, [sigma_x, C] = 0) makes the band even in K. Generally: a linear
//    band at K = 0 needs a degeneracy there with a nonzero first-order splitting; the free pair has one (the whole
//    flat sector, split by K v(q) into the continuum), and ANY binding that depends on separation lifts it to the
//    single chi_0. Binding and masslessness exclude each other in the two-body sector.
//
// PREDICTION, written before the run: the hypothesis H FAILS at every depth, the theorem clauses hold.
//
// Gates, fixed before the first run:
// T1 at 64 Weyl k: the line token's phases are pi / 3 +- E(k), cos E = cos(k) / 2, within 1e-12, and they add to
//    2 pi / 3 within 1e-12; the closed-form velocity sin k / sqrt(4 - cos^2 k) peaks at k = pi / 2 at 1/2 within 1e-8
//    on a grid of 20,000
// T2 the free pair on a ring of 64 at K = 2 pi 2 / 64: its 256 phases equal the sum set within 1e-10; at K = 0 the
//    phase arg omega has multiplicity exactly 128 (tolerance 1e-9); at K the 128 phases within 0.5 of arg omega reach
//    exactly pairEdge(K) within 1e-10; on the continuum the edge found by maximizing equals 2 arcsin(sin(K/2) / 2)
//    within 1e-10 at K = 1e-3, 0.1, 1, 2, 3, and edge(1e-3) / 1e-3 is 1/2 within 1e-6
// T3 exact over Z[zeta_K] (code/rule/drift-cost-line): 17 Weyl combinations sum_r w_r chi_r (r = 0 .. 7, ring 16,
//    D = 2 and 3 alternating): one beat returns 4 omega zeta_(2N)^(-r) times each component, the inverse beat 16 times
//    the start, and Gauss holds on every start register
// G  the rule over the 17-start family (ring 16, D = 2 and 3 alternating, x1 = 3 + floor(10 weyl), separation in
//    -2 .. 2, labels by Weyl): exact against the float runner over 3 beats within 1e-12, the norm identity, exact
//    reversal and Gauss on every supported register over 10 beats
// B  the box (measurement): at K = 0 the phase arg omega has multiplicity exactly 3 on the relative ring 6N and 5 on
//    10N (chi_0 and its replicas), D = 1 .. 8; for D = 3 .. 8 the chi_0 branch at K = 1e-3 and 0.1 agrees between the
//    two boxes within 1e-9 in phase and in velocity, residuals under 1e-10
// H  THE HYPOTHESIS (composite light is massless at the token's speed): at every D = 1 .. 8, on the box 6N, the
//    branch through chi_0 has |d omega / dK| within 5 percent of v_max = 1/2 at K = 1e-3 and at K = 2e-3
// P4 THE THEOREM'S PREDICTION (reported beside H, not in the status): at every D = 1 .. 8 |v(1e-3)| <= 0.005 and
//    v(2e-3) / v(1e-3) and v(4e-3) / v(2e-3) lie in [1.95, 2.05] (a quadratic band), or |v| <= 1e-12 at all three
// Status: pass if H, T1, T2, T3, G and B hold; fail otherwise.
// REPORTED: the chi_0 branch's mass m = K / v at K = 1e-3, its top velocity over K in (0, pi] (64 steps, followed),
// its share on chi and mean string, the nearest other K = 0 level, v_max against the photon's c(D) for D = 1 .. 16.
// HUSK: one husk line, every number a husk number. THE FEAR'S SIGN: C.
//
// Depth L2: a stand-in pair on locked tokens; the no-go (T4) is an L1 theorem of the two-body sector.
//
// DISCLOSED: one timing probe ran before the gates (tmp/composite-probe1.ts: seconds, unitarity 3e-16 and one
// residual, no energy or velocity printed).
//
// FIRST RUN (tmp/composite-frc246-run1.log, 19.5 s, recorded, no gate moved): FAIL, on H as predicted and on B.
// T1, T2, T3 and G pass (det identity 8.9e-16, sum set 4.9e-15, rest multiplicity 128 of 128, edge 2.4e-16, the
// comoving identity exact over Z[zeta_K] on 17 of 17 starts, Gauss, norm and reversal on 17 of 17). H fails at every
// depth: the chi_0 branch's velocity at K = 1e-3 is 1.4e-9 to 1.5e-3 against the 0.5 H needs. B FAILS ON A WRONG
// PREDICTION: arg omega at K = 0 has multiplicity 5 on the box 6N and 9 on 10N at every D, not 3 and 5. A post-run
// diagnosis (tmp/composite-probe2.ts, D = 3 and 6, disclosed) finds the extra states centered at string length
// N (2m + 1), where the cost is exactly half a turn: they are the SECOND flat opposite-branch state (the symmetric
// one, labels 01 and 10 about half), whose Wannier-Stark ladder on the ramp sits half a turn from chi's. So T3's
// "and by nothing else" is wrong; T4 is untouched, since those states lie N >= 3 docks from chi_0 and a beat moves
// r by at most 2. B's box clause also fails at D = 1 to 6 (worst 1.3e-2 in velocity at D = 2, 5.7e-9 at D = 6): the
// K = 0 levels nearest chi_0 lie 3.8e-2 down to 4.5e-7 away and mix with it at K ~ 1e-3 differently on each box.
// P4 fails at D = 1 (v grows as K^3: the curvature vanishes, the band is quartic), D = 4 and D = 5 (a near level
// mixes in); at D = 2, 3 and 6 to 8 the band is quadratic (ratio 2.000), mass K / v = 8.3, 5.3, 0.87, 0.75, 0.65.
// The record run adds, as reported numbers only, each depth's velocity at K = 1e-3 on the box 10N.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { GOLDEN, SILVER, weyl } from '@/code/tool/weyl'
import { driftExactCheck } from '@/code/measure/drift-cost-exact'
import {
  comovingExact,
  edgeByMaximum,
  freeSumSet,
  lightestBranch,
  lightN,
  linePhases,
  OMEGA_PHASE,
  pairEdge,
  pairMatrix,
  photonC,
  restCount,
  tokenBand,
  tokenVelocity,
  V_MAX,
  wrap,
} from '@/code/measure/composite-locked-light'

const DEPTHS = [1, 2, 3, 4, 5, 6, 7, 8] as const

export default experiment({
  id: 'gauge/composite-locked-light',
  code: 'E-FRC-0246',
  title:
    "composite light on the doublet-locked walk, a STAND-IN on one husk line: the love-fear pair's only massless feature is the edge of a continuum (slope exactly the token's top group velocity 1/2, edge 2 arcsin(sin(K/2)/2)), and any binding that depends on separation, the drift phase included, turns the exact comoving rest state into a MASSIVE branch (zero slope at K = 0, a quadratic band), so a bound composite photon cannot be massless",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const metrics: Record<string, number> = {}

    // ---- T1 ----
    let t1Band = 0
    let t1Det = 0

    for (let s = 0; s < 64; s++) {
      const k = 2 * Math.PI * (weyl(s + 1, GOLDEN) - 0.5)
      const [a, b] = linePhases(k)
      const E = tokenBand(k)
      const want = [wrap(Math.PI / 3 - E), wrap(Math.PI / 3 + E)].sort(
        (x, y) => x - y,
      )

      t1Band = Math.max(
        t1Band,
        Math.abs(wrap(a - want[0]!)),
        Math.abs(wrap(b - want[1]!)),
      )
      t1Det = Math.max(t1Det, Math.abs(wrap(a + b - OMEGA_PHASE)))
    }

    let vTop = 0
    let kTop = 0

    for (let i = 1; i < 20000; i++) {
      const k = (Math.PI * i) / 20000
      const v = tokenVelocity(k)

      if (v > vTop) {
        vTop = v
        kTop = k
      }
    }

    metrics.t1BandGap = t1Band
    metrics.t1DetGap = t1Det
    metrics.t1TopVelocity = vTop
    metrics.t1TopMomentum = kTop

    const t1 =
      t1Band <= 1e-12 &&
      t1Det <= 1e-12 &&
      Math.abs(vTop - V_MAX) <= 1e-8 &&
      Math.abs(kTop - Math.PI / 2) <= 1e-3

    log('t1')

    // ---- T2 ----
    const free = freeSumSet(64, 2)
    const edgeKs = [1e-3, 0.1, 1, 2, 3]
    const edgeGaps = edgeKs.map(K =>
      Math.abs(edgeByMaximum(K) - pairEdge(K)),
    )
    const edgeSlope = pairEdge(1e-3) / 1e-3

    metrics.t2SumSetGap = free.gap
    metrics.t2RestMultiplicity = free.restMultiplicity
    metrics.t2OppositeCount = free.oppositeCount
    metrics.t2EdgeRing = free.edge
    metrics.t2EdgeClosed = free.edgeClosed
    metrics.t2EdgeMaxGap = Math.max(...edgeGaps)
    metrics.t2EdgeSlope = edgeSlope

    const t2 =
      free.gap <= 1e-10 &&
      free.restMultiplicity === 128 &&
      free.oppositeCount === 128 &&
      Math.abs(free.edge - free.edgeClosed) <= 1e-10 &&
      Math.max(...edgeGaps) <= 1e-10 &&
      Math.abs(edgeSlope - 0.5) <= 1e-6

    log('t2')

    // ---- T3 ----
    const comov = Array.from({ length: 17 }, (_, s) => {
      const weights = Array.from({ length: 8 }, (_, r) =>
        BigInt(Math.floor(7 * weyl(8 * s + r + 1, GOLDEN)) - 3),
      )

      return comovingExact(2 + (s % 2), 16, weights)
    })
    const t3 = comov.every(c => c.exact && c.back && c.gauss)

    metrics.t3Starts = comov.length
    metrics.t3Exact = comov.filter(c => c.exact).length
    metrics.t3Back = comov.filter(c => c.back).length
    metrics.t3Gauss = comov.filter(c => c.gauss).length
    metrics.t3RegistersMax = Math.max(...comov.map(c => c.registers))

    log('t3')

    // ---- G ----
    const family = Array.from({ length: 17 }, (_, s) => {
      const D = 2 + (s % 2)
      const N = lightN(D)
      const x1 = 3 + Math.floor(10 * weyl(s + 1, GOLDEN))
      const sep = Math.floor(5 * weyl(s + 1, SILVER)) - 2
      const j1 = Math.floor(2 * weyl(2 * s + 1, GOLDEN))
      const j2 = Math.floor(2 * weyl(2 * s + 2, SILVER))

      return driftExactCheck(
        {
          ring: 16,
          kinds: ['love', 'fear'],
          convention: 'C',
          unlike: 'knit',
          cost: N,
          root: 2 * N * N,
        },
        [{ x: [x1, x1 + sep], j: [j1, j2], amp: [1, 0] }],
        3,
        10,
      )
    })
    const g = family.every(
      f => f.gap <= 1e-12 && f.norm && f.reverses && f.gauss,
    )

    metrics.gStarts = family.length
    metrics.gGapWorst = Math.max(...family.map(f => f.gap))
    metrics.gNorm = family.filter(f => f.norm).length
    metrics.gReverses = family.filter(f => f.reverses).length
    metrics.gGauss = family.filter(f => f.gauss).length

    log('g')

    // ---- B, H, P4 and the reports, per depth ----
    const rows = DEPTHS.map(D => {
      const N = lightN(D)
      const M6 = 6 * N
      const M10 = 10 * N
      const rest6 = restCount(pairMatrix(M6, 0, N), 1e-9)
      const rest10 = restCount(pairMatrix(M10, 0, N), 1e-9)
      const small = lightestBranch(
        M6,
        N,
        [0, 1e-3, 2e-3, 4e-3, 0.1],
        true,
      )
      const big = lightestBranch(M10, N, [1e-3, 0.1], true)
      const grid = lightestBranch(
        M6,
        N,
        Array.from({ length: 65 }, (_, i) => (Math.PI * i) / 64),
        false,
      )
      const at = (K: number): (typeof small)[number] =>
        small.find(p => p.K === K)!
      const boxTheta = Math.max(
        Math.abs(wrap(at(1e-3).theta - big[0]!.theta)),
        Math.abs(wrap(at(0.1).theta - big[1]!.theta)),
      )
      const boxVelocity = Math.max(
        Math.abs(at(1e-3).velocity - big[0]!.velocity),
        Math.abs(at(0.1).velocity - big[1]!.velocity),
      )
      const residual = Math.max(
        ...small.map(p => p.residual),
        ...big.map(p => p.residual),
      )
      const v1 = Math.abs(at(1e-3).velocity)
      const v2 = Math.abs(at(2e-3).velocity)
      const v4 = Math.abs(at(4e-3).velocity)
      const top = Math.max(...grid.map(p => Math.abs(p.velocity)))
      const gridResidual = Math.max(...grid.map(p => p.residual))

      log(`D ${D}`)

      return {
        D,
        N,
        rest6,
        rest10,
        small,
        big,
        grid,
        at,
        boxTheta,
        boxVelocity,
        residual,
        v1,
        v2,
        v4,
        top,
        gridResidual,
      }
    })

    const b =
      rows.every(r => r.rest6.count === 3 && r.rest10.count === 5) &&
      rows
        .filter(r => r.D >= 3)
        .every(
          r =>
            r.boxTheta <= 1e-9 &&
            r.boxVelocity <= 1e-9 &&
            r.residual <= 1e-10,
        )
    const h = rows.every(
      r =>
        Math.abs(r.v1 - V_MAX) <= 0.05 * V_MAX &&
        Math.abs(r.v2 - V_MAX) <= 0.05 * V_MAX,
    )
    const p4 = rows.every(
      r =>
        (r.v1 <= 1e-12 && r.v2 <= 1e-12 && r.v4 <= 1e-12) ||
        (r.v1 <= 0.005 &&
          r.v2 / r.v1 >= 1.95 &&
          r.v2 / r.v1 <= 2.05 &&
          r.v4 / r.v2 >= 1.95 &&
          r.v4 / r.v2 <= 2.05),
    )

    for (const r of rows) {
      metrics[`D${r.D}_rest6`] = r.rest6.count
      metrics[`D${r.D}_rest10`] = r.rest10.count
      metrics[`D${r.D}_nearestOtherRest`] = r.rest6.nearestOther
      metrics[`D${r.D}_restOffset`] = r.at(0).offset
      metrics[`D${r.D}_velocity_K1e-3`] = r.at(1e-3).velocity
      metrics[`D${r.D}_velocity_K2e-3`] = r.at(2e-3).velocity
      metrics[`D${r.D}_velocity_K4e-3`] = r.at(4e-3).velocity
      metrics[`D${r.D}_velocityRatio21`] = r.v2 / r.v1
      metrics[`D${r.D}_velocityRatio42`] = r.v4 / r.v2
      metrics[`D${r.D}_mass`] = 1e-3 / r.v1
      metrics[`D${r.D}_velocity10N_K1e-3`] = r.big[0]!.velocity
      metrics[`D${r.D}_offset_K1e-3`] = r.at(1e-3).offset
      metrics[`D${r.D}_boxTheta`] = r.boxTheta
      metrics[`D${r.D}_boxVelocity`] = r.boxVelocity
      metrics[`D${r.D}_residual`] = r.residual
      metrics[`D${r.D}_topVelocity`] = r.top
      metrics[`D${r.D}_topOverVmax`] = r.top / V_MAX
      metrics[`D${r.D}_topOverPhotonC`] = r.top / photonC(r.D)
      metrics[`D${r.D}_gridResidual`] = r.gridResidual
      metrics[`D${r.D}_chiShare_K0.1`] = r.at(0.1).chiShare
      metrics[`D${r.D}_meanString_K0.1`] = r.at(0.1).meanString
      metrics[`D${r.D}_chiShare_Kpi`] = r.grid[64]!.chiShare
      metrics[`D${r.D}_meanString_Kpi`] = r.grid[64]!.meanString
    }

    for (let D = 1; D <= 16; D++) {
      metrics[`vmaxOverPhotonC_D${D}`] = V_MAX / photonC(D)
    }

    for (const [name, ok] of Object.entries({
      T1: t1,
      T2: t2,
      T3: t3,
      G: g,
      B: b,
      H: h,
      P4: p4,
    })) {
      metrics[`gate${name}`] = ok ? 1 : 0
    }

    metrics.seconds = (Date.now() - started) / 1000

    const status = h && t1 && t2 && t3 && g && b ? 'pass' : 'fail'
    const f = (x: number): string => x.toExponential(2)

    return verdict({
      status,
      claim: `husk line: the locked token's phases are pi/3 +- E(k), cos E = cos(k)/2, adding to 2 pi/3 at every k (${f(t1Det)}), top group velocity ${vTop.toFixed(9)} at k = pi/2; the free love-fear pair (its meeting the identity) is exactly the sum set (${f(free.gap)}), its opposite-branch sector is flat at K = 0 (multiplicity ${free.restMultiplicity} of 128) and at K a continuum whose edge is 2 arcsin(sin(K/2)/2) (${f(Math.max(...edgeGaps))}), slope ${edgeSlope.toFixed(7)}; the comoving state is an exact eigenstate of the integer rule on ${comov.filter(c => c.exact).length} of 17 starts, Gauss and reversal exact on the 17-start family (${family.filter(x => x.gauss && x.reverses && x.norm).length} of 17); with the drift phase the lightest neutral pair (through chi_0) has velocity ${rows.map(r => f(r.v1)).join(', ')} at K = 1e-3 for D = 1 to 8 (hypothesis needs 0.5), ratios v(2K)/v(K) ${rows.map(r => (r.v2 / r.v1).toFixed(3)).join(', ')}: a quadratic band, mass ${rows.map(r => (1e-3 / r.v1).toFixed(3)).join(', ')}, top velocity over K ${rows.map(r => r.top.toFixed(3)).join(', ')}`,
      metrics,
      control: {
        freeEdgeSlope: edgeSlope,
        tokenTopVelocity: vTop,
        photonC_D2: photonC(2),
        photonC_D3: photonC(3),
      },
      notes: `L2, a STAND-IN (locked tokens on one husk line); T4 is an L1 theorem of the two-body sector. Gates T1 ${t1}, T2 ${t2}, T3 ${t3}, G ${g}, B ${b}, H ${h}; the theorem's prediction P4 ${p4}. Per depth (box 6N): ${rows.map(r => `D ${r.D}: rest multiplicity ${r.rest6.count} (6N) ${r.rest10.count} (10N), nearest other K = 0 level ${r.rest6.nearestOther.toFixed(4)}, v ${f(r.at(1e-3).velocity)} / ${f(r.at(2e-3).velocity)} / ${f(r.at(4e-3).velocity)}, box gaps ${f(r.boxTheta)} ${f(r.boxVelocity)}, top velocity ${r.top.toFixed(4)} (${(r.top / photonC(r.D)).toFixed(3)} c), chi share at K = 0.1 ${r.at(0.1).chiShare.toFixed(4)}, at pi ${r.grid[64]!.chiShare.toFixed(4)}, mean string at pi ${r.grid[64]!.meanString.toFixed(3)}, followed-grid residual ${f(r.gridResidual)}`).join('; ')}. THE TOKEN AGAINST THE PHOTON: v_max = 1/2 against c(D) = sqrt(4 / (3 (2D + 1))): v_max / c = ${[1, 2, 3, 4, 8, 16].map(D => `${(V_MAX / photonC(D)).toFixed(4)} at D = ${D}`).join(', ')}; v_max = c needs 2D + 1 = 16/3, no depth. THE BOX is measurement (a relative ring, the ring distance standing for the string length); the rule has none. FIRST RUN 2026-09-26 (tmp/composite-frc246-run1.log): FAIL on H as predicted and on B, whose count prediction was wrong: arg omega at K = 0 also holds the second (symmetric) flat opposite-branch state's Wannier-Stark levels at string length N (2m + 1), where the cost is half a turn (post-run diagnosis tmp/composite-probe2.ts at D = 3 and 6, disclosed); they lie N docks from chi_0, so the zero slope (T4) stands. The box clause fails at D = 1 to 6 through near levels (3.8e-2 down to 4.5e-7 from the rest phase) that mix with chi_0 at K ~ 1e-3; on the box 10N the velocity at K = 1e-3 is ${rows.map(r => f(r.big[0]!.velocity)).join(', ')} (D = 1 to 8), against the 0.5 H needs. P4 fails at D = 1 (quartic band), 4 and 5 (a near level). No gate moved; the record run adds only the 10N velocities and this sentence.`,
    })
  },
})
