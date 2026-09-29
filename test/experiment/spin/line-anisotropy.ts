// IF MATTER MOVES ONLY ALONG THE 12 LINE CLASSES, WHAT DOES THE 3D DISPERSION PREDICT, AND IS IT ALREADY EXCLUDED
// (E-SPN-0126)? note/research/vibe/roadmap/remaining-pieces.md, "Six angles on 3d motion", angle 6 ("accept it as a
// prediction"), and section 3b (E-SPN-0110): a 3d state is an average over the twelve line classes.
//
// DERIVED BEFORE THE RUN (code/measure/line-anisotropy, header).
// 1. THE CLASS-AVERAGED BAND. A branch on class u (a unit 4d line direction, n = (x, y, z, 0) on the husk) carries the
//    momentum k = a P . u of a 3d plane wave, a the dock step along a line and c = one dock a beat. Line classes never
//    mix (E-SPN-0098's line law), so a state spread evenly over them has energy and velocity
//      E(P, n) = (1/12) sum_u E_1(a P n . u),   v = (1/12) sum_u u E_1'(a P n . u).
//    With E_1(k) = sum_j e_2j k^2j and M_2j(n) = sum_u (n . u)^2j:
//      E(P, n) = e_2 (aP)^2 M_2/12 + e_4 (aP)^4 M_4/12 + e_6 (aP)^6 M_6(n)/12 + ...
//    The 24 D4 roots are a spherical 5-design: M_2 = 3, M_4 = 3/2 for every n. The first direction-dependent term is
//    ORDER 6 in aP, with the exact angular pattern
//      M_6(n) = 3/4 + (3/2)(x^2 y^2 + y^2 z^2 + z^2 x^2) - 9 x^2 y^2 z^2
//    (axis 3/4, face 9/8, body 11/12, sphere mean 27/28), so the full spread (face minus axis) is e_6 (aP)^6 (3/8)/12.
// 2. THE ONE-LINE BANDS. The lone love (fine coin, E-SPN-0107): cos eps = cos k cos m, m = pi/(3n), E_1 = eps - m, so
//    e_2 = 1/(2 tan m) and, as m -> 0, e_4 -> -1/(8 m^3), e_6 -> 1/(16 m^5): a relativistic band with c_line^2 = m/tan m
//    = 1 - m^2/3 + ... The meson (E-SPN-0115): E_1 = sqrt(E_rest^2 + c_eff^2 k^2) - E_rest, its measured form.
// 3. WHAT THE ORDER HIDES. The series converges only for aP < m, i.e. P < Mc (m = a/lambda_C, the love's rest energy in
//    units of hbar/beat, lambda_C its reduced Compton length). Written in physical units the class average is
//      E(P, n) = M c^2 (1/12) sum_u sqrt(1 + (P n . u / Mc)^2) - M c^2 + O((a/lambda_C)^2),
//    INDEPENDENT OF a. The anisotropy's full spread is M c^2 (P/Mc)^6 / 512, set by the particle's own mass, not by the
//    dock: "order 6 in aP" is order 6 in P/(Mc) with coefficient M c^2. Making the dock smaller does not shrink it.
// 4. TWO ISOTROPIC FAILURES THAT THE 5-DESIGN DOES NOT PREVENT.
//    (a) inertia: v = P a^2/(4 m*) exactly (a 2-design), so the 3d inertia is 4 m*, against a rest energy m: the class
//        average's inertia is 4 m*/m -> 4 times its energy over c_line^2. With c_3 defined by inertia = energy / c_3^2,
//        c_3 = c_line sqrt(m/m*)/2 -> c_line/2.
//    (b) the P^4 term against Lorentz: a Lorentz band with that rest energy and c_3 has
//        e_4,3d = -(e_2/4)^2/(2m). The class average has e_4/8, so the ratio is -4 m e_4/e_2^2 = 2 x (the line's own
//        ratio, -2 m e_4/e_2^2 -> 1): M_4/12 / (M_2/12)^2 = (1/8)/(1/16) = 2, the kurtosis of n . u. So even the
//        isotropic part is not relativistic, at order (P/Mc)^4, at every a.
// 5. THE MASSLESS LIMIT (m << aP << 1). E_1 = |k| exactly for m = 0 (the stream alone), so
//      E/(cP) = (1/12) sum_u |n . u|,
//    which is NOT a polynomial: the 5-design does not reach it and the speed depends on direction at zeroth order:
//    1/(2 sqrt 2) = 0.3536 on an axis, 5/12 = 0.4167 on a face diagonal, 1/sqrt 6 = 0.4082 on a body diagonal.
// 6. BRANCH SPLITTING. For P << Mc the branches' velocities are u (u . P) a^2/m*; their rms spread over the mean drift
//    is sqrt((<x^2> - <x^2>^2)/<x^2>^2) = sqrt((1/4 - 1/16)/(1/16)) = sqrt 3 exactly, for every P, every m and every a
//    (a 2-design statement). The weight on classes with n . u = 0 never moves: 1/2 of it for P along an axis, 1/4
//    along a face diagonal ((1,-1,0,0), (0,0,1,1), (0,0,1,-1)), 1/4 along a body diagonal. (First written here as 1/12
//    for the face; the run's count, 3 classes, corrected the text, no gate reads it.) Branches on different lines are orthogonal (the line tone is
//    conserved), so they never interfere or recombine.
// 7. THE a-DEPENDENT TERMS. What does depend on the dock is each line's own band: c_line(species) = sqrt(m/tan m), so
//    delta = 1 - c_line/c = m^2/6 = (a/lambda_C)^2/6 for a massive species, and exactly 0 for a massless one (the
//    massless walk is the shift: no energy-dependent speed at any order, no helicity term at all).
//
// COMPARISON WITH OBSERVATION (the numbers are the literature's; the arithmetic is below, not gated).
//  - SME-type terms: the average is even in P (each class holds both signs), so no cubic (dimension-5, CPT-odd) term;
//    the quartic term is isotropic but twice the Lorentz value at scale M, not M_Pl; the first anisotropic term is
//    P^6 at scale M. In the E_QG parametrization every coefficient's scale is the particle's mass, not E_Pl.
//  - Fermi GRB 090510 (Abdo et al. 2009, Nature 462, 331: E_QG,1 > 1.2 E_Pl; quadratic E_QG,2 > 1.3e11 GeV, Vasileiou
//    et al. 2013, PRD 87, 122001): the massless line walk has no energy-dependent speed, so these bound nothing about
//    a. Vacuum birefringence (e.g. |xi| < 1e-16 from GRB polarization): the line walk has no helicity-dependent term,
//    so nothing either.
//  - The massless average's speed changes by 20 percent with direction; laboratory isotropy of c holds to about 1e-18
//    (Nagel et al. 2015, Nat. Commun. 6, 8174). Excluded at every a.
//  - The only a-dependent bound: delta_e = (a/lambda_C,e)^2/6 < c_gamma - c_e, from the absence of photon decay
//    gamma -> e+ e- up to E_gamma (threshold 2 m_e c^2 / sqrt(2 delta)): 50 TeV Crab photons give delta < 2e-16
//    (Stecker and Glashow 2001, Astropart. Phys. 16, 97), and the 1.1 PeV Crab photon (LHAASO, Cao et al. 2021, Science
//    373, 425) gives 4.3e-19 by the same threshold (this file's arithmetic, not a published bound).
//
// GATES, fixed before the first run of this file.
//  A1 the leading anisotropic order is >= 4 in aP: for every band (the lone love at n = 1, 2, 4, 8 and E-SPN-0115's
//     meson at n = 4, 8, 16), with D(x) the largest minus the least class-averaged energy over the axis, face and body
//     at aP = x E_scale (E_scale = m for the love, E_rest/c_eff for the meson), both log2 D(2x)/D(x) at x = 0.01, 0.02
//     are at least 4.
//  A2 the implied bound on a, with its source: the per-line delta/m^2 at n = 64 is within 1 percent of 1/6 (the
//     a-dependent term is derived, not assumed), the bound a < lambda_C,e sqrt(6 delta_max) is finite, and the
//     anisotropy's scaled coefficient 16 m^5 e_6 at n = 64 is within 1 percent of 1 (the anisotropy has no a in it).
//  A3 branch splitting is consistent with observation or ruled out, by a stated reason: it is RULED OUT iff the
//     branches' rms spread over the mean drift exceeds 1e-3 at every sampled P (a collimated beam's divergence; perfect
//     crystal neutron interferometers need arcseconds, 5e-6), for the lone love at n = 4096 over aP/m = 1e-3 to 1e3 on
//     the axis, face and body; CONSISTENT iff it is below 1e-3 somewhere. A3 holds when one of the two is decided.
//  CONTROLS. (a) the 5-design moments: M_2 = 3 and M_4 = 3/2 in exact rational arithmetic on six integer directions
//     ((1,0,0), (1,1,0), (1,1,1), (2,3,6), (1,4,8), (3,4,12)), M_6 = 3/4, 9/8, 11/12 exactly on the first three, and
//     the closed form M_6(n) equal to the class sum on a 91 x 91 octant grid within 1e-13. (b) the lone love's 1d band:
//     the stable closed form, code/measure/fine-coin's fineBand and the 2x2 walk's own eigenvalues agree within 1e-14
//     on both bands at n = 1, 2, 4, 8 and K = 0.1, pi/4, pi/2; the series' e_2 is 1/(2 tan m) within 1e-12 (relative);
//     and E-SPN-0107's MEASURED run (128 beats on 1024 docks) is reproduced: top speed over K = pi/4, 3pi/8, pi/2
//     0.50000, 0.86603, 0.96593, 0.99144 within 1e-5 and m*/E_rest 1.65399, 1.10266, 1.02349, 1.00579 within 1e-4.
//     (c) negative: the same A1 reading on line sets that are not 5-designs, the six face diagonals of a cube and its
//     three axes, reads order 4 (log2 ratio within 0.1 of 4), so A1's reading can fail. (d) derivation: D(0.01)/(aP)^6
//     equals e_6 (3/8)/12 within 1e-3 (relative) on every band.
//  Verdict: partial if a control fails; pass if A1, A2 and A3 hold; fail otherwise. A2 and A3 are reporting gates.
// PREDICTED: A1 holds at order 6; A2 gives a < about 1e15 Planck lengths, the only a-dependent bound; A3 ruled out;
// every control holds. So the gates pass and angle 6 is excluded at every dock size.
//
// DISCLOSED PROBE (instrument only): tmp/aniso-probe1.log: M_2 3, M_4 3/2 exactly on (2,3,6) and (1,4,8); D/(aP)^6
// against e_6 (3/8)/12 within 7e-5 at x = 0.01; massless speeds 0.35355, 0.41667, 0.40825 on axis, face, body, and on
// the octant grid 0.3536 to 0.4410 (the largest is off the symmetry axes); spread over drift 1.7320508 at every
// direction.
//
// FIRST RUN (under 1 s, tmp/aniso-run1.log, the record): PASS on A1, A2, A3, every control clean, no gate moved.
//  A1: order 5.9995 to 5.9997 (x 0.01 to 0.02) and 5.9981 to 5.9988 (0.02 to 0.04) on all seven bands; coefficient
//  against e_6 (3/8)/12 within 1.1e-4. Negative: cube faces 3.9997, 3.9990; cube axes 3.9997, 3.9989. A2: delta/m^2
//  0.166673 and 16 m^5 e_6 0.99973 at n = 64; a < 1.34e-20 m = 8.28e14 l_P (Stecker-Glashow), 6.21e-22 m = 3.84e13 l_P
//  (the 1.1 PeV threshold). A3: spread over drift 1.732051 (every direction, aP/m <= 0.1) to 1.870828 (body, aP/m
//  1000); ruled out. Isotropic: inertia/energy 6.62, 4.41, 4.09, 4.02 and class P^4 over Lorentz 2.418, 2.015, 2.001,
//  2.0001 at n = 1, 2, 4, 8 (the line's own 1.209, 1.008, 1.0004, 1.00003). Massless: 0.353553 axis, 0.416667 face,
//  0.408248 body (exact), grid 0.353553 to 0.440959, up to 35.79 degrees off P. Controls: moments exact, pattern
//  2.2e-15, band 1.2e-15 and E-SPN-0107's top speeds and m*/E_rest within 4e-5. Title written after the run.
//
// Depth L1: a derivation and exact numerics of known mathematics (spherical designs, the Dirac walk's band) applied to
// the model's own line classes; the meson's band is E-SPN-0115's measured form (its E(0) and c_eff as recorded), not
// rerun. DETERMINISM: no random numbers; the directions are a fixed grid.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  classAverage,
  designSum,
  lineClasses,
} from '@/code/measure/crossing-lines'
import { fineBand } from '@/code/measure/fine-coin'
import {
  absoluteMoment,
  exactMoment,
  fractionValue,
  lineAverage,
  octantGrid,
  relativisticSeries,
  sixthPattern,
  walkBand,
  walkEigen,
  walkSeries,
  type Series,
} from '@/code/measure/line-anisotropy'

const NS: readonly number[] = [1, 2, 4, 8]
const MESON_NS: readonly number[] = [4, 8, 16]
// E-SPN-0115's recorded meson levels E(0) (test/experiment/spin/meson-crossing, RECORDED_ENERGY) and c_eff (its RUN 1)
const MESON_E0: Record<number, number> = {
  4: 0.10386658008071757,
  8: 0.05213891233226967,
  16: 0.026185373288082,
}
const MESON_C: Record<number, number> = {
  4: 0.9874,
  8: 0.9969,
  16: 0.9992,
}
// E-SPN-0107's measured run (test/experiment/spin/fine-coin, FIRST RUN)
const RECORDED_TOP: Record<number, number> = {
  1: 0.5,
  2: 0.86603,
  4: 0.96593,
  8: 0.99144,
}
const RECORDED_RATIO: Record<number, number> = {
  1: 1.65399,
  2: 1.10266,
  4: 1.02349,
  8: 1.00579,
}
const XS: readonly number[] = [0.01, 0.02, 0.04]
const ORDER_FLOOR = 4
const NEG_ORDER = 4
const NEG_TOL = 0.1
const EXACT = 1e-14
const SERIES_SAME = 1e-12
const GRID_SAME = 1e-13
const TOP_SAME = 1e-5
const RATIO_SAME = 1e-4
const COEFF_SAME = 1e-3
const LIMIT_N = 64
const LIMIT_TOL = 0.01
const GRID = 90
const SPLIT_N = 4096
const SPLIT_XS: readonly number[] = [1e-3, 1e-2, 1e-1, 1, 10, 100, 1000]
const COLLIMATED = 1e-3
const ORDER = 10
// physical constants for the report (CODATA 2018), and the literature's bounds on c_gamma - c_e
const LAMBDA_E = 3.8615926796e-13
const PLANCK = 1.616255e-35
const ME_EV = 0.51099895e6
const STECKER = 2e-16
const LHAASO_EV = 1.1e15

const DIRS = {
  axis: [1, 0, 0, 0],
  face: [Math.SQRT1_2, Math.SQRT1_2, 0, 0],
  body: [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3), 0],
}
const DIR_LIST = Object.values(DIRS)

type Band = {
  name: string
  series: Series
  scale: number
  band: (k: number) => { energy: number; slope: number }
}

// the largest minus the least class-averaged energy over axis, face and body
const spreadOver = (
  average: (n: readonly number[], K: number) => number,
  K: number,
): number => {
  const es = DIR_LIST.map(n => average(n, K))

  return Math.max(...es) - Math.min(...es)
}

const orders = (
  average: (n: readonly number[], K: number) => number,
  scale: number,
): { d: number[]; p: number[] } => {
  const d = XS.map(x => spreadOver(average, x * scale))

  return { d, p: d.slice(1).map((x, i) => Math.log2(x / d[i]!)) }
}

export default experiment({
  id: 'spin/line-anisotropy',
  code: 'E-SPN-0126',
  title:
    "motion only along the twelve line classes, taken as a prediction, is excluded at every dock size, pass on every gate: a 3d state averaged over the classes has its first direction-dependent energy at order 6 in aP (measured 5.998 to 6.000 on the lone love at n = 1, 2, 4, 8 and the meson at n = 4, 8, 16; a cube's face diagonals or axes read 4.000), pattern M_6 = 3/4 + (3/2)(x^2y^2 + y^2z^2 + z^2x^2) - 9x^2y^2z^2 (axis 3/4, face 9/8, body 11/12, exact), coefficient e_6 (3/8)/12 to 1.1e-4; but the series runs in P/Mc, not Pa: the spread is Mc^2 (P/Mc)^6/512 (16 m^5 e_6 = 0.9997 at n = 64), with no dock length in it, and the isotropic part fails too, inertia 4.02 times the rest energy and a P^4 term 2.0001 times Lorentz at n = 8; a massless average moves at 0.354 to 0.441 c by direction (20 percent, velocity up to 36 degrees off P, against 1e-18 measured) and its branches separate at 1.732 to 1.871 times the mean drift at every aP/m from 1e-3 to 1e3 with half the weight of an axis beam never moving, which every collimated beam and interferometer excludes; the only term that shrinks with the dock is each line's own speed deficit (a/lambda_C)^2/6, massless walks have none, so Fermi's GRB 090510 and birefringence bounds constrain nothing, and c_gamma - c_e < 2e-16 gives a < 1.3e-20 m, 8.3e14 Planck lengths (3.8e13 from the 1.1 PeV Crab photon); moments exact, the band equals the 2x2 walk and E-SPN-0107's measured run to 1e-5",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const f4 = (x: number): string => x.toFixed(4)
    const f6 = (x: number): string => x.toFixed(6)
    const e2 = (x: number): string => x.toExponential(2)
    const e4 = (x: number): string => x.toExponential(4)
    const half = (n: number): number => Math.PI / (3 * n)

    // ---- control (a): the 5-design moments, exact ----
    const integerDirs = [
      [1, 0, 0],
      [1, 1, 0],
      [1, 1, 1],
      [2, 3, 6],
      [1, 4, 8],
      [3, 4, 12],
    ]
    const momentRows = integerDirs.map(p => ({
      p,
      m2: exactMoment(p, 2),
      m4: exactMoment(p, 4),
      m6: exactMoment(p, 6),
      m8: exactMoment(p, 8),
    }))
    const lowIsotropic = momentRows.every(
      r =>
        r.m2.num === 3n &&
        r.m2.den === 1n &&
        r.m4.num === 3n &&
        r.m4.den === 2n,
    )
    const sixthExact = [
      [3n, 4n],
      [9n, 8n],
      [11n, 12n],
    ].every(
      ([num, den], i) =>
        momentRows[i]!.m6.num === num && momentRows[i]!.m6.den === den,
    )
    const grid = octantGrid(GRID)
    const patternOff = Math.max(
      ...grid.map(n => Math.abs(sixthPattern(n) - designSum(n, 6))),
    )
    const rationalOff = Math.max(
      ...momentRows.map(r =>
        Math.abs(
          fractionValue(r.m6) -
            sixthPattern(r.p.map(x => x / Math.hypot(...r.p))),
        ),
      ),
    )
    const controlMoments =
      lowIsotropic &&
      sixthExact &&
      patternOff <= GRID_SAME &&
      rationalOff <= GRID_SAME
    const m6Grid = grid.map(n => sixthPattern(n))

    // ---- control (b): the lone love's 1d band ----
    const bandRows = NS.map(n => {
      const m = half(n)
      const off = Math.max(
        ...[0.1, Math.PI / 4, Math.PI / 2].flatMap(K => {
          const a = walkBand(m, K)
          const b = fineBand(n, K)
          const u = fineBand(n, K, true)
          const e = walkEigen(m, K)

          return [
            Math.abs(a.energy - b.energy),
            Math.abs(a.slope - b.slope),
            Math.abs(e[0] - b.energy),
            Math.abs(e[1] - u.energy),
          ]
        }),
      )
      const series = walkSeries(m, ORDER)
      const e2Off = Math.abs(series[2]! * 2 * Math.tan(m) - 1)
      const top = Math.max(
        ...[Math.PI / 4, (3 * Math.PI) / 8, Math.PI / 2].map(K =>
          Math.abs(walkBand(m, K).slope),
        ),
      )
      const ratio = 1 / (2 * series[2]!) / m

      return {
        n,
        m,
        off,
        series,
        e2Off,
        top,
        ratio,
        topOff: Math.abs(top - RECORDED_TOP[n]!),
        ratioOff: Math.abs(ratio - RECORDED_RATIO[n]!),
      }
    })
    const controlBand = bandRows.every(
      r =>
        r.off <= EXACT &&
        r.e2Off <= SERIES_SAME &&
        r.topOff <= TOP_SAME &&
        r.ratioOff <= RATIO_SAME,
    )

    // ---- the bands ----
    const bands: Band[] = [
      ...bandRows.map(r => ({
        name: `love${r.n}`,
        series: r.series,
        scale: r.m,
        band: (k: number) => walkBand(r.m, k),
      })),
      ...MESON_NS.map(n => {
        const rest = 2 * half(n) + MESON_E0[n]!
        const c = MESON_C[n]!

        const band = (k: number) => {
          const e = Math.hypot(rest, c * k)

          return {
            energy: (c * c * k * k) / (e + rest),
            slope: (c * c * k) / e,
          }
        }

        return {
          name: `meson${n}`,
          series: relativisticSeries(rest, c, ORDER),
          scale: rest / c,
          band,
        }
      }),
    ]

    // ---- A1 and control (d) ----
    const aniso = bands.map(b => {
      const { d, p } = orders(
        (n, K) => classAverage(n, K, b.band).energy,
        b.scale,
      )
      const K0 = XS[0]! * b.scale
      const predicted = (b.series[6]! * 3) / 8 / 12
      const measured = d[0]! / K0 ** 6

      return {
        name: b.name,
        d,
        p,
        predicted,
        measured,
        coeffOff: Math.abs(measured / predicted - 1),
      }
    })
    const A1 = aniso.every(a => a.p.every(p => p >= ORDER_FLOOR))
    const controlDerivation = aniso.every(a => a.coeffOff <= COEFF_SAME)

    // ---- control (c): line sets that are not 5-designs ----
    const s = Math.SQRT1_2
    const cubeFaces = [
      [s, s, 0, 0],
      [s, -s, 0, 0],
      [s, 0, s, 0],
      [s, 0, -s, 0],
      [0, s, s, 0],
      [0, s, -s, 0],
    ]
    const cubeAxes = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
    ]
    const negLove = bandRows[3]!
    const negatives = [
      { name: 'cube faces', dirs: cubeFaces },
      { name: 'cube axes', dirs: cubeAxes },
    ].map(set => ({
      name: set.name,
      ...orders(
        (n, K) =>
          lineAverage(set.dirs, n, K, k => walkBand(negLove.m, k)),
        negLove.m,
      ),
    }))
    const controlNegative = negatives.every(x =>
      x.p.every(p => Math.abs(p - NEG_ORDER) <= NEG_TOL),
    )

    // ---- the isotropic failures (measurement) ----
    const isotropic = bandRows.map(r => {
      const e2c = r.series[2]!
      const e4c = r.series[4]!

      return {
        n: r.n,
        inertiaOverEnergy: 2 / (e2c * r.m),
        c3: Math.sqrt(r.m * 2 * e2c) / 2,
        lineQuartic: (-2 * r.m * e4c) / (e2c * e2c),
        classQuartic: (-4 * r.m * e4c) / (e2c * e2c),
      }
    })

    // ---- the massless limit (measurement) ----
    const tiny = half(1e6)
    const masslessK = 0.1
    const massless = (n: readonly number[]) =>
      classAverage(n, masslessK, k => walkBand(tiny, k))
    const masslessDirs = Object.fromEntries(
      Object.entries(DIRS).map(([k, n]) => [
        k,
        {
          phase: massless(n).energy / masslessK,
          group: Math.hypot(...massless(n).velocity),
          exact: absoluteMoment(n),
        },
      ]),
    )
    const masslessGrid = grid.map(n => {
      const r = massless(n)
      const speed = Math.hypot(...r.velocity)
      const cos =
        r.velocity.reduce((t, x, c) => t + x * n[c]!, 0) / speed

      return {
        speed,
        phase: r.energy / masslessK,
        angle: Math.acos(Math.min(1, cos)),
      }
    })
    const groupMin = Math.min(...masslessGrid.map(g => g.speed))
    const groupMax = Math.max(...masslessGrid.map(g => g.speed))
    const phaseMin = Math.min(...masslessGrid.map(g => g.phase))
    const phaseMax = Math.max(...masslessGrid.map(g => g.phase))
    const angleMax = Math.max(...masslessGrid.map(g => g.angle))
    const speedAnisotropy = (groupMax - groupMin) / groupMax

    // ---- A2 ----
    const limitM = half(LIMIT_N)
    const limitSeries = walkSeries(limitM, ORDER)
    const deltaOverM2 =
      (1 - Math.sqrt(limitM / Math.tan(limitM))) / limitM ** 2
    const scaledSixth = limitSeries[6]! * 16 * limitM ** 5
    const lhaasoDelta = 2 * (ME_EV / LHAASO_EV) ** 2
    const boundOf = (delta: number): number =>
      LAMBDA_E * Math.sqrt(6 * delta)
    const bound = boundOf(STECKER)
    const boundLhaaso = boundOf(lhaasoDelta)
    const A2 =
      Math.abs(deltaOverM2 * 6 - 1) <= LIMIT_TOL &&
      Math.abs(scaledSixth - 1) <= LIMIT_TOL &&
      Number.isFinite(bound) &&
      bound > 0

    // ---- A3 ----
    const splitM = half(SPLIT_N)
    const splits = SPLIT_XS.map(x =>
      DIR_LIST.map(n => {
        const r = classAverage(n, x * splitM, k => walkBand(splitM, k))

        return r.spread / Math.hypot(...r.velocity)
      }),
    )
    const splitMin = Math.min(...splits.flat())
    const splitMax = Math.max(...splits.flat())
    const ruledOut = splitMin > COLLIMATED
    const consistent = splits.flat().some(x => x < COLLIMATED)
    const A3 = ruledOut !== consistent
    const still = DIR_LIST.map(
      n =>
        lineClasses().filter(
          u =>
            Math.abs(u.reduce((t, x, c) => t + x * n[c]!, 0)) < 1e-12,
        ).length / 12,
    )

    const control =
      controlMoments &&
      controlBand &&
      controlNegative &&
      controlDerivation
    const status = !control
      ? 'partial'
      : A1 && A2 && A3
        ? 'pass'
        : 'fail'

    const metrics: Record<string, number> = {
      gate_A1: A1 ? 1 : 0,
      gate_A2: A2 ? 1 : 0,
      gate_A3: A3 ? 1 : 0,
      ruledOut: ruledOut ? 1 : 0,
      control: control ? 1 : 0,
      controlMoments: controlMoments ? 1 : 0,
      controlBand: controlBand ? 1 : 0,
      controlNegative: controlNegative ? 1 : 0,
      controlDerivation: controlDerivation ? 1 : 0,
      patternOff,
      rationalOff,
      sixthAxis: fractionValue(momentRows[0]!.m6),
      sixthFace: fractionValue(momentRows[1]!.m6),
      sixthBody: fractionValue(momentRows[2]!.m6),
      sixthGridMin: Math.min(...m6Grid),
      sixthGridMax: Math.max(...m6Grid),
      masslessGroupMin: groupMin,
      masslessGroupMax: groupMax,
      masslessPhaseMin: phaseMin,
      masslessPhaseMax: phaseMax,
      masslessAngleMax: angleMax,
      masslessSpeedAnisotropy: speedAnisotropy,
      deltaOverM2,
      scaledSixth,
      boundMeters: bound,
      boundPlanck: bound / PLANCK,
      boundLhaasoMeters: boundLhaaso,
      boundLhaasoPlanck: boundLhaaso / PLANCK,
      lhaasoDelta,
      splitMin,
      splitMax,
      stillAxis: still[0]!,
      stillFace: still[1]!,
      stillBody: still[2]!,
    }

    for (const a of aniso) {
      a.p.forEach((p, i) => (metrics[`${a.name}_order${i}`] = p))
      metrics[`${a.name}_coefficient`] = a.measured
      metrics[`${a.name}_coefficientDerived`] = a.predicted
    }

    for (const r of bandRows) {
      metrics[`love${r.n}_bandOff`] = r.off
      metrics[`love${r.n}_top`] = r.top
      metrics[`love${r.n}_ratio`] = r.ratio
      metrics[`love${r.n}_scaledSixth`] = r.series[6]! * 16 * r.m ** 5
    }

    for (const x of negatives) {
      x.p.forEach(
        (p, i) =>
          (metrics[`${x.name.replace(' ', '_')}_order${i}`] = p),
      )
    }

    for (const i of isotropic) {
      metrics[`love${i.n}_inertiaOverEnergy`] = i.inertiaOverEnergy
      metrics[`love${i.n}_c3`] = i.c3
      metrics[`love${i.n}_lineQuartic`] = i.lineQuartic
      metrics[`love${i.n}_classQuartic`] = i.classQuartic
    }

    for (const [k, v] of Object.entries(masslessDirs)) {
      metrics[`massless_${k}_phase`] = v.phase
      metrics[`massless_${k}_group`] = v.group
      metrics[`massless_${k}_exact`] = v.exact
    }

    return verdict({
      status,
      claim: `a 3d state spread over the twelve line classes: its band's first direction-dependent term is order ${aniso.map(a => f4(Math.min(...a.p))).join(', ')} in aP (lone love n = ${NS.join(', ')}, meson n = ${MESON_NS.join(', ')}; A1 ${A1}), pattern M_6 = 3/4 + (3/2)q - 9r (axis 3/4, face 9/8, body 11/12, exact), coefficient e_6 (3/8)/12 to ${e2(Math.max(...aniso.map(a => a.coeffOff)))}, and 16 m^5 e_6 = ${f6(scaledSixth)} at n = ${LIMIT_N}: the anisotropy is M c^2 (P/Mc)^6/512, with no a in it; the isotropic part is not Lorentz either (inertia ${isotropic.map(i => f4(i.inertiaOverEnergy)).join(', ')} times the energy, P^4 term ${isotropic.map(i => f4(i.classQuartic)).join(', ')} times Lorentz); massless, the speed runs ${f4(groupMin)} to ${f4(groupMax)} c with direction (${f4(100 * speedAnisotropy)} percent, velocity up to ${f4((angleMax * 180) / Math.PI)} degrees off P); the only a-dependent term is delta = (a/lambda_C)^2/6 (${f6(deltaOverM2)} m^2), which with c_gamma - c_e < 2e-16 gives a < ${e2(bound)} m = ${e2(bound / PLANCK)} Planck lengths (A2 ${A2}); branches separate at ${f6(splitMin)} to ${f6(splitMax)} times the drift at every aP/m from 1e-3 to 1e3, ruled out ${ruledOut} (A3 ${A3}); controls moments ${controlMoments}, band ${controlBand}, negative ${controlNegative}, derivation ${controlDerivation}`,
      metrics,
      control: {
        moments: controlMoments ? 1 : 0,
        band: controlBand ? 1 : 0,
        negative: controlNegative ? 1 : 0,
        derivation: controlDerivation ? 1 : 0,
      },
      notes: `L1. A1 ${A1}, A2 ${A2}, A3 ${A3} (ruled out ${ruledOut}). Moments (exact, m = 2, 4, 6, 8): ${momentRows.map(r => `(${r.p.join(',')}) ${[r.m2, r.m4, r.m6, r.m8].map(f => `${f.num}/${f.den}`).join(' ')}`).join('; ')}; closed form against the class sum on the grid ${e2(patternOff)}, on the rational directions ${e2(rationalOff)}; M_6 on the grid ${f4(Math.min(...m6Grid))} to ${f4(Math.max(...m6Grid))}. Bands: ${bandRows
        .map(
          r =>
            `n ${r.n} m ${f6(r.m)} off ${e2(r.off)} e_2 off ${e2(r.e2Off)} top ${r.top.toFixed(6)} (recorded ${RECORDED_TOP[r.n]}) m*/E_rest ${r.ratio.toFixed(6)} (recorded ${RECORDED_RATIO[r.n]}) series ${r.series
              .filter((_, j) => j % 2 === 0 && j > 0)
              .map(e4)
              .join(' ')}`,
        )
        .join(
          '; ',
        )}. Anisotropy D at x = ${XS.join(', ')}: ${aniso.map(a => `${a.name} ${a.d.map(e4).join(' ')} order ${a.p.map(f4).join(' ')} coefficient ${e4(a.measured)} (derived ${e4(a.predicted)})`).join('; ')}. Not 5-designs (love n 8): ${negatives.map(x => `${x.name} D ${x.d.map(e4).join(' ')} order ${x.p.map(f4).join(' ')}`).join('; ')}. Isotropic: ${isotropic.map(i => `n ${i.n} inertia/energy ${f4(i.inertiaOverEnergy)} c_3 ${f4(i.c3)} line quartic ${f4(i.lineQuartic)} class quartic ${f4(i.classQuartic)}`).join('; ')}. Massless (m = pi/3e6, aP = ${masslessK}): ${Object.entries(
        masslessDirs,
      )
        .map(
          ([k, v]) =>
            `${k} phase ${f6(v.phase)} group ${f6(v.group)} exact ${f6(v.exact)}`,
        )
        .join(
          '; ',
        )}; grid group ${f6(groupMin)} to ${f6(groupMax)}, phase ${f6(phaseMin)} to ${f6(phaseMax)}, largest angle v to P ${f4((angleMax * 180) / Math.PI)} degrees. A2: delta/m^2 ${deltaOverM2} at n ${LIMIT_N}, 16 m^5 e_6 ${scaledSixth}; bound from c_gamma - c_e < ${STECKER} (Stecker and Glashow 2001): a < ${e2(bound)} m = ${e2(bound / PLANCK)} l_P; from the 1.1 PeV Crab photon by the same threshold (delta < ${e2(lhaasoDelta)}): a < ${e2(boundLhaaso)} m = ${e2(boundLhaaso / PLANCK)} l_P. A3: spread over drift ${splits.map((row, i) => `aP/m ${SPLIT_XS[i]} ${row.map(f6).join(' ')}`).join('; ')}; weight that never moves: axis ${f4(still[0]!)}, face ${f4(still[1]!)}, body ${f4(still[2]!)}.`,
    })
  },
})
