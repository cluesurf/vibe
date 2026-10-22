// DOES THE BOUND REGISTER PAIR HAVE ONE BAND CURVATURE IN EVERY HUSK DIRECTION, READ LINE BY LINE AT SMALL K (E-RLT-0119)?
// For vibe-roadmap-moving-matter-0003: bound matter moves off every line with less than 2% leading-order anisotropy, on
// the candidate rule's swap coin and register.
//
// THE ARGUMENT. The pair's cycle commutes with the 48 signed permutations of the husk coordinates (O_h): code/measure/
// register-reduced's header derives it for the stream, the swap coin, Q_S and Q_D, and its cubicGroup checks the
// overlap covariance C(g r) = rho_e C(r) rho_o^T on all 48 x 24 (element, root) pairs (covariance 0 of 1,152); the
// Coulomb count is read at canonical coordinates, the same on a whole orbit. If the K = 0 level is NOT degenerate, its
// band E(K) = E0 + K_i K_j T_ij + O(K^4) has an O_h-invariant T, and an O_h-invariant symmetric 3 x 3 form is a scalar,
// so the K^2 term is isotropic by symmetry and the first direction-dependent term is K^4, through the cubic harmonic
// sum_i n_i^4. Inversion is in O_h, so the band has no linear term at K = 0. So leading-order isotropy comes down to two
// questions: is the level ONE band (not a multiplet of line branches, which share a K = 0 energy and are warped at K^2
// like a cubic crystal's degenerate holes), and is its curvature finite and nonzero in every direction?
//
// WHY A LINE READ AND NOT A CENTROID. E-RLT-0115 read one K^2 coefficient 0.0183178 in 13 directions (spread 2.3e-6)
// from the filtered level's mean phase. But the twelve line classes (the D4 roots, cast on the husk as the 3 axes and
// the 6 face diagonals) form a 2-design: sum_u (n . u)^2 is the same for every n, so the centroid of twelve line
// branches has the same isotropic K^2 coefficient as one band. A centroid cannot tell them apart. This file reads the
// heaviest LINE of each correlation by filter diagonalization (code/algebra/linear/filter-diagonalization), whose
// position is one eigenphase, not a mean.
//
// THE OBJECT. E-RLT-0115's pair (a_B 3.5, ball 16, pairLevel, E_L 1.6133573497835847, read again here to the bit). For
// each direction n, the autocorrelation x_l, l = 0 .. 8,191, of the K = 0 level unfolded into the sector of n's little
// group and run at K = kappa n, kappa 0.04, 0.08, 0.12, 0.16 (code/measure/band-curvature's bandRun). The directions:
//   axis (1, 0, 0) C4v and face (1, 1, 0) C2v       ON husk lines (the casts of e_a +- e_4 and e_a +- e_b), controls
//   body (1, 1, 1) C3v, built as itself              off every line (not the (1, 1, -1) or (1, -1, 1) sectors, whose
//                                                    tables code/measure/register-reduced is being repaired for)
//   plane (2, 1, 0) {1, sigma_z}                     off every line, on the z mirror
//   generic (1, 2, 3) the identity alone             off every line and every mirror: the sector assumes no symmetry
// The axis K = 0 correlation is read at full length and is the reference; every other sector reads K = 0 to 1,024 lags
// (I3). Two cubic images of the generic direction, (2, 3, 1) (a turn) and (1, 2, -3) (a mirror), are read at kappa 0.16
// to 512 lags in the identity's sector (I6): equal to the generic read lag for lag only if the cycle is cubic at K != 0.
//
// THE READS. Per correlation (filter diagonalization on [E_L - 0.004, E_L + 0.010], basis 60, E-RLT-0116's settings):
//   E0, w0      the heaviest K = 0 line at S 4,096 (and at S 2,048 for the lag check)
//   d(kappa)    the heaviest line's shift from E0 at S 4,096; d2(kappa) the same at S 2,048
//   kept        the heaviest line's weight over w0 (one band keeps the K = 0 line whole)
//   residual    the 6,144-cycle Blackman-Harris filter at E0 + a kappa^2 read in one cycle (E-RLT-0118's observable, a =
//               0.0183178 the centroid coefficient), and the still share, the weight within 2e-4 of E0 over w0
//   CONTROLS    the axis K = 0 correlation with its main line replaced (code/measure/line-mobility's replaceLine) by
//               twelve equal line branches at E0 + 4 a kappa^2 (n . u)^2 (LINES), or by one line at E0 + a kappa^2 + b(n)
//               kappa^4 (BAND), b(n) = -0.0019 - 0.0018 sum_i n_i^4 (the cubic-harmonic form through E-RLT-0115's three
//               K^4 values, -0.0037 axis, -0.0025 body, -0.0028 face, which it fits exactly)
// THE FIT. Per direction, least squares d = A kappa^2 + C kappa^4 over the four kappas (two degrees of freedom), M_dir =
// 1 / (2 A). Its error sigma_A is the quadrature sum of three named parts: FIT the fit's own standard error from its
// residuals; LAG |A - A(d2)|, the same fit on the S 2,048 shifts (the filter length's convergence); GRID |A - A(kappa
// <= 0.12)|, the fit on the three smallest kappas (the K-grid's convergence, the quartic and anything higher).
//
// GATES, fixed here before any K read (the probe that sized the run read only lags 0 .. 64 at K = 0).
//  INSTRUMENTS: W the reference's one-cycle residual within 1% of the level's direct 1.5231e-3; I1 |x_l| <= 1 + 1e-6 in
//   every correlation; I2 the heaviest K = 0 line has |z| within 1e-6 of 1; I3 every sector's K = 0 correlation equals
//   the reference to 1e-9 at every lag it has; I6 each image equals the generic read to 1e-9 at every lag it has; I4
//   LINES >= 3 BAND for the residual at kappa 0.12 and 0.16 in every direction; G3 every sigma_A / A <= 0.005 (so a 2%
//   anisotropy is read at four times its size); every read landed.
//  G1 MOBILE: in every direction A >= 10 sigma_A (M_dir finite), and at the smallest kappa the shift d > 0 and d >= 10
//   |d - d2| (the group velocity 2 A kappa + 4 C kappa^3 is not zero there).
//  G2 ISOTROPIC: max over the five directions of |M_dir / M_mean - 1| < 0.02.
//  G4 ONE BAND, at kappa 0.12 and 0.16 in every direction: MOVES when kept >= 0.9, residual <= BAND + (LINES - BAND) / 3,
//   and, where LINES leaves a still share at least 0.1 above BAND's, still <= BAND + (LINES - BAND) / 3; STUCK when
//   residual >= BAND + 2 (LINES - BAND) / 3 (and still at least that far, where it is used). A direction MOVES (STUCK)
//   when both its reads do.
//  VERDICT: open if an instrument fails; PASS if G1, G2 and every direction MOVES; FAIL if G1 or G2 fails or a direction
//   is STUCK; open otherwise.
//  REPORTED, moving no status: C_dir and the fit C(n) = alpha + beta sum_i n_i^4 with its rms (a cubic K^4 term fits it);
//   whether every shift is above 0 (the band's minimum at K = 0); A against the centroid's 0.0183178; the still shares.
// PREDICTED: pass, A near 0.01831 (E-RLT-0118's line-based body value 0.018313). The risk: the axis level meets a
//  neighbor near K 0.28 (E-RLT-0118), and if that mixing reaches 0.16 the axis reads between the gates or its GRID error
//  fails G3.
//
// THE RUN AND ITS COST, estimated before it from the probe (lags 0 .. 64 at K = 0, 6 native threads, a machine at load
// 20): 0.047, 0.085, 0.053, 0.156 and 0.29 s a lag on 2,488 (axis), 4,616 (face), 3,136 (body), 8,937 (plane) and
// 17,077 (generic) representatives, so three parts run side by side: AXES (axis, face, body) about 6,500 s, PLANE about
// 5,300 s, GENERIC about 10,300 s. Each part is written to test/record/E-RLT-0119/ as each read lands
// (test/record/E-RLT-0119/run/run.ts <part>, which refuses to overwrite a finished part).
//
// Depth L2 (a two-body quantum walk on the husk quotient, exact in its moving block; the controls are synthetic).
// DETERMINISM: no random numbers; the start is placed; the native kernel, byte for byte the JavaScript.

import { existsSync, readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import type { KernelOptions } from '@/code/kernel/index'
import {
  curvatureFit,
  harmonicFit,
  quarticHarmonic,
  type BandPart,
  type BandPlan,
} from '@/code/measure/band-curvature'
import { branchShifts } from '@/code/measure/lineon-branches'
import {
  filteredRead,
  heaviestLine,
  lineSolve,
  replaceLine,
  stillShare,
  type Correlation,
} from '@/code/measure/line-mobility'

export const STAGE = { aB: 3.5, R: 16 } as const
const LAGS = 8191
const ZERO_SHORT = 1024
const IMAGE_LAGS = 512
const KAPPAS: readonly number[] = [0.04, 0.08, 0.12, 0.16]
const IMAGE_KAPPA = 0.16

export const PARTS: Record<string, readonly BandPlan[]> = {
  axes: [
    { name: 'axis', n: [1, 0, 0], zeroLags: LAGS, kappas: KAPPAS, lags: LAGS, images: [] },
    { name: 'face', n: [1, 1, 0], zeroLags: ZERO_SHORT, kappas: KAPPAS, lags: LAGS, images: [] },
    { name: 'body', n: [1, 1, 1], zeroLags: ZERO_SHORT, kappas: KAPPAS, lags: LAGS, images: [] },
  ],
  plane: [{ name: 'plane', n: [2, 1, 0], zeroLags: ZERO_SHORT, kappas: KAPPAS, lags: LAGS, images: [] }],
  generic: [
    {
      name: 'generic',
      n: [1, 2, 3],
      zeroLags: ZERO_SHORT,
      kappas: KAPPAS,
      lags: LAGS,
      images: [
        { name: 'generic-turn', n: [2, 3, 1], kappa: IMAGE_KAPPA, lags: IMAGE_LAGS },
        { name: 'generic-mirror', n: [1, 2, -3], kappa: IMAGE_KAPPA, lags: IMAGE_LAGS },
      ],
    },
  ],
}

export const NATIVE: KernelOptions = { backend: 'native', threads: 6 }

const PLANS = Object.values(PARTS).flat()
const REFERENCE = 'axis'
const A_CENTROID = 0.018317802430121526
const LEVEL_RESIDUAL = 0.0015231080722836088
const S_RESIDUAL = 6144
const S_LINES = 4096
const S_CHECK = 2048
const J = 60
const BELOW = 0.004
const ABOVE = 0.01
const NEAR = 2e-4
const BOUNDED = 1e-6
const MODULUS = 1e-6
const SAME = 1e-9
const WITNESS = 0.01
const RESOLVE = 3
const PRECISION = 0.005
const SIGNIFICANT = 10
const ISOTROPY = 0.02
const KEPT = 0.9
const STILL_USED = 0.1
const GATE_KAPPAS: readonly number[] = [0.12, 0.16]
const GRID_MAX = 0.12
// b(n) = B0 + B4 sum_i n_i^4 through E-RLT-0115's K^4 values (axis -0.0037, body -0.0025, face -0.0028)
const B0 = -0.0019
const B4 = -0.0018

const flag = (b: boolean): number => (b ? 1 : 0)
const third = (lo: number, hi: number, k: number): number => lo + (k * (hi - lo)) / 3
const gap = (x: Correlation, y: Correlation): number => {
  let m = 0
  const n = Math.min(x.re.length, y.re.length)

  for (let l = 0; l < n; l++) {
    m = Math.max(m, Math.hypot(x.re[l]! - y.re[l]!, x.im[l]! - y.im[l]!))
  }

  return m
}
const bounded = (x: Correlation): boolean => {
  for (let l = 0; l < x.re.length; l++) {
    if (Math.hypot(x.re[l]!, x.im[l]!) > 1 + BOUNDED) {
      return false
    }
  }

  return true
}

// the parts as recorded, merged (every part reads the same level)
export function mergeParts(parts: readonly BandPart[]): BandPart {
  return {
    EL: parts[0]!.EL,
    zero: Object.assign({}, ...parts.map(p => p.zero)),
    moved: parts.flatMap(p => p.moved),
    image: parts.flatMap(p => p.image),
    reps: Object.assign({}, ...parts.map(p => p.reps)),
    seconds: parts.reduce((s, p) => s + p.seconds, 0),
  }
}

export function bandCombine(part: BandPart, levels: readonly number[]): Verdict {
  const { EL } = part
  const solve = (x: Correlation, S: number) => lineSolve({ x, lo: EL - BELOW, hi: EL + ABOVE, basis: J, S })
  const ref = part.zero[REFERENCE]!
  const h0 = heaviestLine(solve(ref, S_LINES))!
  const h0c = heaviestLine(solve(ref, S_CHECK))!
  const E0 = h0.E
  const w0 = h0.weight
  const witness = Math.sqrt(1 - ref.re[1]! ** 2 - ref.im[1]! ** 2)
  const sameLevel = levels.every(l => l === EL)
  const sectorGap = Math.max(
    ...PLANS.filter(p => p.name !== REFERENCE && part.zero[p.name]).map(p => gap(part.zero[p.name]!, ref)),
  )
  const imageGaps = part.image.map(g => {
    const of = part.moved.find(m => m.name === g.of && m.kappa === g.kappa)

    return { name: g.name, gap: of ? gap(g.x, of.x) : NaN }
  })
  const complete =
    PLANS.every(
      p => part.zero[p.name] && p.kappas.every(k => part.moved.some(m => m.name === p.name && m.kappa === k)),
    ) && PLANS.every(p => p.images.every(g => part.image.some(m => m.name === g.name)))
  const reads = part.moved.map(m => {
    const plan = PLANS.find(p => p.name === m.name)!
    const lines = solve(m.x, S_LINES)
    const h = heaviestLine(lines)
    const hc = heaviestLine(solve(m.x, S_CHECK))
    const phase = E0 + A_CENTROID * m.kappa ** 2

    return {
      name: m.name,
      kappa: m.kappa,
      shift: (h?.E ?? NaN) - E0,
      shiftCheck: (hc?.E ?? NaN) - h0c.E,
      kept: (h?.weight ?? NaN) / w0,
      residual: filteredRead({ x: m.x, phase, S: S_RESIDUAL }).residual,
      still: stillShare({ lines, E0, w0, near: NEAR }),
      bounded: bounded(m.x),
      lines: lines.filter(l => l.weight >= 1e-3).map(l => `${(l.E - E0).toExponential(4)}:${l.weight.toFixed(4)}`),
      n: plan.n,
    }
  })
  // the controls at the gate's kappas, from the reference K = 0 correlation
  const controls = PLANS.flatMap(p =>
    GATE_KAPPAS.map(kappa => {
      const phase = E0 + A_CENTROID * kappa ** 2
      const b = B0 + B4 * quarticHarmonic(p.n)
      const xl = replaceLine({
        x: ref,
        E0,
        w0,
        energies: branchShifts({ direction: p.n, kappa, a: A_CENTROID }).map(s => E0 + s),
      })
      const xb = replaceLine({ x: ref, E0, w0, energies: [E0 + A_CENTROID * kappa ** 2 + b * kappa ** 4] })
      const still = (y: Correlation): number => stillShare({ lines: solve(y, S_LINES), E0, w0, near: NEAR })
      const lineResidual = filteredRead({ x: xl, phase, S: S_RESIDUAL }).residual
      const bandResidual = filteredRead({ x: xb, phase, S: S_RESIDUAL }).residual
      const lineStill = still(xl)
      const bandStill = still(xb)

      return {
        name: p.name,
        kappa,
        lineResidual,
        bandResidual,
        lineStill,
        bandStill,
        resolved: lineResidual >= RESOLVE * bandResidual,
        stillUsed: lineStill - bandStill >= STILL_USED,
      }
    }),
  )
  const gateReads = controls.map(c => {
    const r = reads.find(x => x.name === c.name && x.kappa === c.kappa)

    if (!r) {
      return { ...c, moves: false, stuck: false, read: undefined }
    }

    const stillMoves = !c.stillUsed || r.still <= third(c.bandStill, c.lineStill, 1)
    const stillStuck = !c.stillUsed || r.still >= third(c.bandStill, c.lineStill, 2)

    return {
      ...c,
      read: r,
      moves: r.kept >= KEPT && r.residual <= third(c.bandResidual, c.lineResidual, 1) && stillMoves,
      stuck: r.residual >= third(c.bandResidual, c.lineResidual, 2) && stillStuck,
    }
  })
  const perDirection = PLANS.map(p => {
    const own = reads.filter(r => r.name === p.name).sort((x, y) => x.kappa - y.kappa)
    const kappas = own.map(r => r.kappa)
    const fit = curvatureFit({ kappas, shifts: own.map(r => r.shift) })
    const lag = curvatureFit({ kappas, shifts: own.map(r => r.shiftCheck) })
    const small = own.filter(r => r.kappa <= GRID_MAX + 1e-12)
    const grid = curvatureFit({ kappas: small.map(r => r.kappa), shifts: small.map(r => r.shift) })
    const sigmaFit = Number.isFinite(fit.sigmaA) ? fit.sigmaA : 0
    const sigmaLag = Math.abs(fit.A - lag.A)
    const sigmaGrid = Math.abs(fit.A - grid.A)
    const sigmaA = Math.hypot(sigmaFit, sigmaLag, sigmaGrid)
    const first = own[0]
    const dMin = first?.shift ?? NaN
    const dMinErr = first ? Math.abs(first.shift - first.shiftCheck) : NaN
    const kMin = first?.kappa ?? NaN
    const own4 = gateReads.filter(g => g.name === p.name)

    return {
      name: p.name,
      n: p.n,
      reps: part.reps[p.name] ?? NaN,
      A: fit.A,
      C: fit.C,
      rss: fit.rss,
      sigmaFit,
      sigmaLag,
      sigmaGrid,
      sigmaA,
      M: 1 / (2 * fit.A),
      sigmaM: sigmaA / (2 * fit.A ** 2),
      precise: sigmaA / fit.A <= PRECISION,
      mobile: fit.A >= SIGNIFICANT * sigmaA && dMin > 0 && dMin >= SIGNIFICANT * dMinErr,
      velocity: 2 * fit.A * kMin + 4 * fit.C * kMin ** 3,
      dMin,
      dMinErr,
      positive: own.every(r => r.shift > 0),
      moves: own4.length === GATE_KAPPAS.length && own4.every(g => g.moves),
      stuck: own4.length === GATE_KAPPAS.length && own4.every(g => g.stuck),
    }
  })
  const Mmean = perDirection.reduce((s, d) => s + d.M, 0) / perDirection.length
  const anisotropy = Math.max(...perDirection.map(d => Math.abs(d.M / Mmean - 1)))
  const W = Math.abs(witness / LEVEL_RESIDUAL - 1) <= WITNESS
  const I1 = bounded(ref) && PLANS.every(p => !part.zero[p.name] || bounded(part.zero[p.name]!)) &&
    reads.every(r => r.bounded) && part.image.every(g => bounded(g.x))
  const I2 = Math.abs(h0.modulus - 1) <= MODULUS
  const I3 = sameLevel && sectorGap <= SAME
  const I6 = imageGaps.length > 0 && imageGaps.every(g => g.gap <= SAME)
  const I4 = controls.every(c => c.resolved)
  const G3 = perDirection.every(d => d.precise)
  const instruments = complete && W && I1 && I2 && I3 && I4 && I6 && G3
  const G1 = perDirection.every(d => d.mobile)
  const G2 = anisotropy < ISOTROPY
  const moves = perDirection.every(d => d.moves)
  const stuck = perDirection.some(d => d.stuck)
  const status: Verdict['status'] = !instruments
    ? 'open'
    : G1 && G2 && moves
      ? 'pass'
      : !G1 || !G2 || stuck
        ? 'fail'
        : 'open'
  const harmonic = harmonicFit({ ns: perDirection.map(d => d.n), Cs: perDirection.map(d => d.C) })
  const minimumAtRest = reads.length > 0 && reads.every(r => r.shift > 0) && perDirection.every(d => d.A > 0)
  const e = (x: number, d = 3): string => x.toExponential(d)

  return verdict({
    status,
    claim: `${complete ? '' : `${reads.length} of ${PLANS.length * KAPPAS.length} reads landed; `}W ${W} (${e(witness, 4)} against ${e(LEVEL_RESIDUAL, 4)}), I1 ${I1}, I2 ${I2}, I3 ${I3} (sectors agree with the reference to ${e(sectorGap, 2)}), I6 ${I6} (cubic images ${imageGaps.map(g => `${g.name} ${e(g.gap, 2)}`).join(', ')}), I4 ${I4}, G3 ${G3}; per direction M = 1 / (2A) +- sigma (FIT, LAG, GRID parts of sigma_A): ${perDirection.map(d => `${d.name} ${d.M.toFixed(4)} +- ${e(d.sigmaM, 2)} (A ${d.A.toFixed(7)}; ${e(d.sigmaFit, 1)}, ${e(d.sigmaLag, 1)}, ${e(d.sigmaGrid, 1)}), C ${d.C.toFixed(5)}, ${d.moves ? 'MOVES' : d.stuck ? 'STUCK' : 'between'}`).join('; ')}; G1 ${G1} (smallest-kappa shifts ${perDirection.map(d => `${e(d.dMin, 3)} +- ${e(d.dMinErr, 1)}`).join(', ')}), G2 ${G2} (max |M / M_mean - 1| ${e(anisotropy, 2)}, M_mean ${Mmean.toFixed(4)}); the K^4 term C(n) = ${harmonic.alpha.toFixed(5)} + ${harmonic.beta.toFixed(5)} sum n_i^4, rms ${e(harmonic.rms, 1)}; minimum at K 0 ${minimumAtRest}`,
    metrics: {
      W: flag(W),
      I1: flag(I1),
      I2: flag(I2),
      I3: flag(I3),
      I4: flag(I4),
      I6: flag(I6),
      G1: flag(G1),
      G2: flag(G2),
      G3: flag(G3),
      moves: flag(moves),
      stuck: flag(stuck),
      reads: reads.length,
      EL,
      E0,
      w0,
      witness,
      sectorGap,
      imageGap: Math.max(...imageGaps.map(g => g.gap)),
      anisotropy,
      Mmean,
      ...Object.fromEntries(perDirection.flatMap(d => [
        [`${d.name}M`, d.M],
        [`${d.name}SigmaM`, d.sigmaM],
        [`${d.name}A`, d.A],
        [`${d.name}C`, d.C],
      ])),
      harmonicAlpha: harmonic.alpha,
      harmonicBeta: harmonic.beta,
      harmonicRms: harmonic.rms,
      minimumAtRest: flag(minimumAtRest),
      centroidOffset: Math.max(...perDirection.map(d => Math.abs(d.A / A_CENTROID - 1))),
      seconds: part.seconds,
    },
    control: Object.fromEntries(
      controls.flatMap(c => [
        [`${c.name}${c.kappa}LineResidual`, c.lineResidual],
        [`${c.name}${c.kappa}BandResidual`, c.bandResidual],
        [`${c.name}${c.kappa}LineStill`, c.lineStill],
        [`${c.name}${c.kappa}BandStill`, c.bandStill],
      ]),
    ),
    notes: `L2. Reference K 0 line E0 - E_L ${e(E0 - EL)}, w0 ${w0.toFixed(4)}, |z| - 1 ${e(h0.modulus - 1, 1)}. Representatives: ${perDirection.map(d => `${d.name} ${d.reps}`).join(', ')}. Per read (direction kappa: shift at S 4096, at S 2048, kept, residual, still; lines as shift from E0 : weight): ${reads.map(r => `${r.name} ${r.kappa}: ${e(r.shift, 6)}, ${e(r.shiftCheck, 6)}, ${r.kept.toFixed(4)}, ${e(r.residual, 2)}, ${r.still.toFixed(4)} [${r.lines.join(' ')}]`).join('; ')}. Gate reads (direction kappa: residual against moves-at-most and stuck-at-least, still used): ${gateReads.map(g => `${g.name} ${g.kappa}: ${g.read ? e(g.read.residual, 2) : 'none'} (${e(third(g.bandResidual, g.lineResidual, 1), 2)}, ${e(third(g.bandResidual, g.lineResidual, 2), 2)}), ${g.stillUsed} ${g.moves ? 'MOVES' : g.stuck ? 'STUCK' : 'between'}`).join('; ')}. Group velocity at the smallest kappa: ${perDirection.map(d => `${d.name} ${e(d.velocity, 3)}`).join(', ')}. A against the centroid 0.0183178: ${perDirection.map(d => `${d.name} ${e(d.A / A_CENTROID - 1, 2)}`).join(', ')}. ${part.seconds.toFixed(0)} s.`,
  })
}

const RECORD = `${import.meta.dirname}/../../record/E-RLT-0119`

export const partPath = (name: string): string => `${RECORD}/rlt119-${name}.json`

export default experiment({
  id: 'relativity/bound-pair-band-isotropy',
  code: 'E-RLT-0119',
  title:
    "explores whether the bound register pair's band has one curvature in every husk direction at small K, read line by line (running)",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const names = Object.keys(PARTS)
    const parts = names.filter(n => existsSync(partPath(n))).map(n => JSON.parse(readFileSync(partPath(n), 'utf8')) as BandPart)

    if (parts.length === 0) {
      return verdict({ status: 'open', claim: 'no part recorded yet', metrics: { reads: 0 } })
    }

    return bandCombine(mergeParts(parts), parts.map(p => p.EL))
  },
})
