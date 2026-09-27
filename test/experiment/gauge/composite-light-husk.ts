// COMPOSITE LIGHT ON THE HUSK PATCH, AND WHAT WOULD MAKE IT (E-FRC-0247): the love-fear pair of E-FRC-0246 carried to
// the husk's three axes (the palindrome walk x y z z y x of E-FRC-0186, the same coin), and the one construction that
// does give a sharp massless composite. A STAND-IN, read through code/measure/composite-locked-light.
//
// WHY. E-FRC-0246 proves on one husk line that a bound love-fear pair is massive (any separation-dependent binding
// lifts the flat comoving sector to one state with zero slope) and that the only linear feature is a continuum edge.
// Two questions remain for the husk: (1) how many polarizations the lightest bound pair has (light needs two
// transverse ones), and whether the edge is at least a light CONE (isotropic); (2) what, if anything, makes a
// composite of these tokens massless. The standard answer for (2) is a filled sea: particle-hole pairs near a Fermi
// point are a sharp boson in one dimension (Tomonaga) and a broad continuum in three (Landau).
//
// THEORY, derived before any number.
// S1 On the husk det U(p) = det(C)^6 = omega^6 = 1, so the two phases are +- theta(p); every substep's stream obeys
//    sigma_x S(p) sigma_x = S(-p) and [sigma_x, C] = 0, so U(-p) = sigma_x U(p) sigma_x, and the comoving state
//    chi = |e0 e0> - |e1 e1> satisfies (U(p) (x) U(-p)) chi = chi at every p. So on the husk, as on the line, a love
//    and a fear copying together are an exact K = 0 state at EVERY relative displacement, under any binding V(r).
// S2 POLARIZATION COUNT. The label states kept at K = 0 for every relative momentum are the null space of
//    sum_p X_p^dagger X_p, X_p = U(p) (x) U(-p) - det U(p). U (x) U has eigenvalue det on the antisymmetric state
//    (fixed) and on one symmetric combination (which turns with p), so the null space is ONE state, chi: the lightest
//    bound composite has one polarization, where light needs two.
// S3 The edge. The opposite-branch sector is theta(p + K/2) - theta(p - K/2); its edge along K-hat is |K| times the
//    token's top group velocity along K-hat. The token's velocities are not isotropic on the palindrome walk, so the
//    edge is not a light cone.
// S4 The sea, on the line. Fill the token's upper branch to k_F = pi / 2, its inflection point. The particle-hole
//    continuum at K is {E(p + K) - E(p): p in (pi/2 - K, pi/2]}: top 2 arcsin(sin(K/2) / 2) (at p = pi/2 - K/2),
//    bottom arcsin(sin(K) / 2) (the ends), width 3 K^3 / 64 + O(K^5), so width / energy ~ (3/32) K^2 -> 0: a SHARP
//    massless mode with slope exactly v_max = 1/2 (because E'' = 0 at the inflection point, the continuum closes to
//    third order). A hole in the love sea is a charge -1: the mode is a neutral love-antilove pair.
// S5 The sea, on the husk. Near a Fermi SURFACE the particle-hole energies at small K run from near 0 (K tangent to
//    the surface) to v_F K: width / energy stays of order one. No sharp mode without an interaction (Landau's zero
//    sound needs F_0 > 0, a transverse mode needs F_1): the husk sea gives a continuum.
//
// Gates, fixed before the first run:
// S1 on the side-16 torus: |theta_+ + theta_-| and |det U - 1| under 1e-12, |sigma_x U(p) sigma_x - U(-p)| under
//    1e-12, |(U(p) (x) U(-p)) chi - chi| under 1e-12
// S2 over 64 Weyl momenta, on the husk and on the line: the smallest eigenvalue of the averaged sum_p X^dagger X is
//    under 1e-12 and the next above 1e-3 (exactly one polarization)
// S3 in 13 directions (3 axes, 6 face and 4 body diagonals): the edge at |K| = 2e-3 over |K| equals the token's top
//    directional group velocity within 1e-5, and the largest over the smallest of those velocities is at least 1.1
// S4 the line sea: at K = 0.01, 0.05, 0.1 the sampled top and bottom (200,000 samples) equal the closed forms within
//    1e-9; width(0.01) / 0.01^3 is 3/64 within 1 percent; width / top at K = 0.05 is at most 1e-3; top(0.01) / 0.01 is
//    1/2 within 1e-4
// S5 the husk sea (side 48, the upper branch filled below its median, K = 2 pi / 48 along x): (top - bottom) / top
//    is at least 0.5
// Status: pass if S1 to S5 hold; fail otherwise. No Gauss gate: the drift string has no rule off one line yet.
//
// Depth L2: a stand-in walk; S1, S2 and S4 are L1 identities.
//
// DISCLOSED: one timing probe ran before the gates (tmp/composite-probe1.ts: seconds only for this file's pieces).
// FIRST RUN (tmp/composite-frc247-run1.log, 1.5 s, recorded, no gate moved): PASS on S1 to S5. The directional top
// velocities come out as lattice numbers: 1 on the x and z axes, 2 on y (1.9998 found), sqrt 2 and 3 / sqrt 2 on the
// face diagonals, sqrt 3 and 4 / sqrt 3 on the body diagonals, per six-substep beat (E-FRC-0186's finite-K edges
// 0.98, 1.39, 1.70 are these at K > 0). The record run differs from the first only in this paragraph.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { GOLDEN, SILVER, weyl } from '@/code/tool/weyl'
import { commonRestSpectrum, directionalEdge, directionalVmax, huskIdentities, huskSeaSpread, lineSeaSpread, pairEdge, photonC, seaWidth } from '@/code/measure/composite-locked-light'

const DIRECTIONS: readonly (readonly number[])[] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 0],
  [1, -1, 0],
  [1, 0, 1],
  [1, 0, -1],
  [0, 1, 1],
  [0, 1, -1],
  [1, 1, 1],
  [1, 1, -1],
  [1, -1, 1],
  [-1, 1, 1],
]

export default experiment({
  id: 'gauge/composite-light-husk',
  code: 'E-FRC-0247',
  title:
    "composite light on the husk patch, and what would make it, a STAND-IN: the love-fear comoving state is exact at K = 0 for every displacement but carries ONE polarization, the pair's only linear feature (the continuum edge) moves at the token's top directional velocity, which is anisotropic, and a filled sea makes a sharp massless composite only on a line (width 3K^3/64 at the inflection point, slope 1/2), never on the husk",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const metrics: Record<string, number> = {}

    // ---- S1 ----
    const id = huskIdentities(16)
    const s1 = id.detGap <= 1e-12 && id.parityGap <= 1e-12 && id.comovingGap <= 1e-12

    metrics.s1DetGap = id.detGap
    metrics.s1ParityGap = id.parityGap
    metrics.s1ComovingGap = id.comovingGap
    log('s1')

    // ---- S2 ----
    const husk = Array.from({ length: 64 }, (_, s) => [0, 1, 2].map(j => 2 * Math.PI * (weyl(3 * s + j + 1, GOLDEN) - 0.5)))
    const line = Array.from({ length: 64 }, (_, s) => [2 * Math.PI * (weyl(s + 1, SILVER) - 0.5), 0, 0])
    const huskSpec = commonRestSpectrum(husk)
    const lineSpec = commonRestSpectrum(line, [0])
    const s2 = [huskSpec, lineSpec].every(v => Math.abs(v[0]!) <= 1e-12 && v[1]! >= 1e-3)

    huskSpec.forEach((v, i) => (metrics[`s2HuskEigen${i}`] = v))
    lineSpec.forEach((v, i) => (metrics[`s2LineEigen${i}`] = v))
    log('s2')

    // ---- S3 ----
    const dirs = DIRECTIONS.map(d => ({ d, vmax: directionalVmax(d, 24), edge: directionalEdge(d, 2e-3, 24) }))
    const s3Gap = Math.max(...dirs.map(x => Math.abs(x.edge - x.vmax)))
    const anisotropy = Math.max(...dirs.map(x => x.vmax)) / Math.min(...dirs.map(x => x.vmax))
    const s3 = s3Gap <= 1e-5 && anisotropy >= 1.1

    dirs.forEach(x => {
      metrics[`s3Vmax_${x.d.join('_')}`] = x.vmax
      metrics[`s3Edge_${x.d.join('_')}`] = x.edge
    })
    metrics.s3EdgeGap = s3Gap
    metrics.s3Anisotropy = anisotropy
    log('s3')

    // ---- S4 ----
    const seaKs = [0.01, 0.05, 0.1]
    const seas = seaKs.map(K => ({ K, ...lineSeaSpread(K, 200000) }))
    const s4Closed = Math.max(...seas.map(s => Math.max(Math.abs(s.top - pairEdge(s.K)), Math.abs(s.bottom - Math.asin(Math.sin(s.K) / 2)))))
    const cubic = seaWidth(0.01) / 0.01 ** 3
    const sharp = seaWidth(0.05) / pairEdge(0.05)
    const slope = pairEdge(0.01) / 0.01
    const s4 = s4Closed <= 1e-9 && Math.abs(cubic / (3 / 64) - 1) <= 0.01 && sharp <= 1e-3 && Math.abs(slope - 0.5) <= 1e-4

    metrics.s4ClosedGap = s4Closed
    metrics.s4WidthOverK3 = cubic
    metrics.s4WidthOverTop_K0_05 = sharp
    metrics.s4Slope = slope
    seas.forEach(s => {
      metrics[`s4Top_K${s.K}`] = s.top
      metrics[`s4Bottom_K${s.K}`] = s.bottom
    })
    log('s4')

    // ---- S5 ----
    const hs = huskSeaSpread(48)
    const s5 = hs.ratio >= 0.5

    metrics.s5Top = hs.top
    metrics.s5Bottom = hs.bottom
    metrics.s5Ratio = hs.ratio
    metrics.s5Pairs = hs.pairs
    metrics.s5K = hs.K
    log('s5')

    for (const [name, ok] of Object.entries({ S1: s1, S2: s2, S3: s3, S4: s4, S5: s5 })) metrics[`gate${name}`] = ok ? 1 : 0

    metrics.seconds = (Date.now() - started) / 1000

    const f = (x: number): string => x.toExponential(2)
    const axis = dirs.slice(0, 3).map(x => x.vmax)
    const face = dirs.slice(3, 9).map(x => x.vmax)
    const body = dirs.slice(9).map(x => x.vmax)

    return verdict({
      status: s1 && s2 && s3 && s4 && s5 ? 'pass' : 'fail',
      claim: `husk first: det U = 1 and U(-p) = sigma_x U(p) sigma_x at every point (${f(id.detGap)}, ${f(id.parityGap)}), so the comoving love-fear state is exact at K = 0 on the husk (${f(id.comovingGap)}); the label states kept at every relative momentum are ONE (eigenvalues ${huskSpec.map(f).join(', ')} on the husk, ${lineSpec.map(f).join(', ')} on the line), so the lightest bound composite has one polarization, not two; the pair's edge moves at the token's top directional velocity (${f(s3Gap)}): axes ${axis.map(v => v.toFixed(4)).join(', ')}, face diagonals ${Math.min(...face).toFixed(4)} to ${Math.max(...face).toFixed(4)}, body diagonals ${Math.min(...body).toFixed(4)} to ${Math.max(...body).toFixed(4)} docks per beat, anisotropy ${anisotropy.toFixed(3)}, not a cone; a line sea filled to the inflection point is a sharp massless mode (width ${cubic.toFixed(5)} K^3 against 3/64 = ${(3 / 64).toFixed(5)}, width/energy ${f(sharp)} at K = 0.05, slope ${slope.toFixed(6)}), the husk sea is a continuum ((top - bottom)/top = ${hs.ratio.toFixed(3)} at K = ${hs.K.toFixed(4)})`,
      metrics,
      control: {
        photonHuskC_D2: photonC(2),
        photonHuskC_D3: photonC(3),
        lineTokenVmax: 0.5,
      },
      notes: `L2, a STAND-IN walk (the E-FRC-0186 palindrome with the locked coin); S1, S2, S4 are L1 identities. Gates S1 ${s1}, S2 ${s2}, S3 ${s3}, S4 ${s4}, S5 ${s5}. Directional top velocity against edge: ${dirs.map(x => `(${x.d.join(',')}) ${x.vmax.toFixed(6)} / ${x.edge.toFixed(6)}`).join(', ')}. The photon's husk c is isotropic (E-MTR-0023 S1, 1e-6), c = ${photonC(2).toFixed(4)} at D = 2 and ${photonC(3).toFixed(4)} at D = 3, per beat of the photon's leapfrog; the palindrome walk's beat is six substeps, so its velocities are per six copies and are compared with each other here, not with c. Husk sea: ${hs.pairs} particle-hole pairs, energies ${hs.bottom.toFixed(5)} to ${hs.top.toFixed(5)}. No Gauss gate: the drift string has no rule off one husk line. FIRST RUN 2026-09-26 (tmp/composite-frc247-run1.log): PASS, no gate moved.`,
    })
  },
})
