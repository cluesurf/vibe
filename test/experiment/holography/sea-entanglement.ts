// THE SEA'S ENTANGLEMENT, EXACTLY FROM ITS CORRELATION MATRIX: IS THERE AN AREA LAW, AND WHAT G = 1/(4 eta) WOULD IT
// GIVE (E-HLG-0037, routes H3d, H11a, H13b). The knit's coarse entropy grew with volume (E-FND-0155), and its knots ran in
// rings along lines (E-GRV-0083, 0084), so Jacobson's route (an area law for the vacuum's entanglement, then the first
// law, then Einstein's equation, with G = 1/(4 eta)) had nothing to stand on. The register rule has no line law, and its
// sea is a free-fermion state, so its region entropy is exact from the correlation matrix (Peschel 2003): for a region
// A, S(A) = sum over the eigenvalues nu of C_A of h(nu), h(nu) = -nu ln nu - (1 - nu) ln(1 - nu)
// (code/measure/sea-entanglement).
//
// WHICH SEA. DERIVED BEFORE THE RUN (Z). The sea the register rule runs is the REGISTER-FULL sea of E-SPN-0175: every
// one of the 192 modes of every dock filled, one branch, unit amplitude. Its correlation matrix is the identity, so C_A
// = 1 on every region and S(A) = 0 exactly: it is a product state. The other seas a covariant growth law can write are
// the empty sea and the chiral halves (E-FND-0168), each a product over docks: S = 0 again on every region made of
// whole docks. So on the rule's own sea there is no entanglement to have an area law, eta = 0, and G = 1/(4 eta) is
// infinite. That is the route's answer for the rule as it stands, and it needs no run.
// The only GAPPED FILLED BAND that is not a product is the Floquet band sea: the one-body cycle U (two beats, 192 modes a
// dock) has at every momentum 176 flats (U = 1) and 16 moving states, 8 with eigenphase in (-pi, 0) and 8 in (0, pi)
// (tmp/ax-probe1: moving phases within +-(0.74 .. 0.88) pi at L = 4, at least 2.33 from 0 and 0.38 from pi). Filling
// the flats and the negative-energy band and leaving the positive-energy band (phase < 0, E = -phase / 2) empty is the
// band sea, C = 1 - P_band. It is stationary under the rule (checked in real space) and gapped. It is NOT a sea the rule
// writes (E-FND-0168), so its area law, if it has one, says what the route could have if the vacuum were a band sea.
//
// REGIONS. The husk (code/measure/photon-husk) drops x4, the depth: a husk region is a set of whole columns. Read on the
// D4 torus (sides L = 4, 8, 12):
//   husk slabs     x1 in [0, w), every x2, x3, x4: w = 1 .. L (two flat boundaries, 3 L^3 cut links each, L^2 husk
//                  docks each); S against depth at fixed area, and against the transverse size L at fixed depth
//   depth slabs    x4 in [0, w) (bulk only: it cuts the columns), L = 8, read
//   husk bars      x1, x2 in [0, s), every x3, x4: s = 1 .. 4 at L = 8, the boundary grows as the perimeter 4 s and the
//                  volume as s^2
//   husk boxes     x1, x2, x3 in [0, s), every x4: s = 1, 2 at L = 8, read
// C_A splits by the transverse momentum; each block's nonzero spectrum is a Gram matrix of the band's Bloch vectors,
// 8 n square (n the momenta in a class), whatever the region's depth (code/measure/sea-entanglement).
//
// HYPOTHESES, written before any entropy was computed (the probes before this file, tmp/ax-probe1 and tmp/ax-probe3,
// read the band's phases, its construction time and its real-space stationarity, no entropy).
//  H1 (the task's) THE RULE'S SEA HAS AN AREA LAW: S of a region grows with its boundary. Predicted to FAIL by Z: S = 0.
//  On the band sea (B):
//  H1B AREA LAW: (a) depth saturation, husk slabs at L = 12: S(6) - S(5) <= 0.02 S(6); (b) area scaling: the entropy per
//      cut link, eta = S / (2 * 3 L^3), at L = 12 w = 6 and L = 8 w = 4 agree within 5%; (c) shape, husk bars at L = 8:
//      the least-squares fit S = a (4 s) + c has a smaller residual than S = b s^2 + c over s = 1 .. 4.
//  H2B NOT A VOLUME LAW: the slope beta of S(w) over w = 3 .. 6 at L = 12 gives beta * 6 / S(6) <= 0.05.
//  PB FALSIFIER: S grows with depth at fixed area (S(6) - S(5) >= 0.5 (S(2) - S(1)) at L = 12) or the bars' volume fit
//      wins.
// eta is stated with its error, |eta(12) - eta(8)| plus the last depth increment per link, and G = 1/(4 eta) in units of
// one cut link, as a READ, not a gate. PREDICTED: Z exact; H1B and H2B hold (a gapped free-fermion band has a finite
// correlation length, so S saturates in depth: Eisert, Cramer, Plenio 2010).
//
// CONTROLS (a failure makes the verdict partial). CP PRODUCT: a sea of the 8 singlet states of every dock at every
// momentum (a product over docks, like the rule's own seas) gives S <= 1e-10 on every husk slab at L = 8 and on the one-
// column box (Gram and block forms). CG GAPPED CHAIN: a ring of 400 sites with alternating hops 1 and 1/2, half filled:
// the block entropy saturates, |S(100) - S(60)| <= 1e-6. CL GAPLESS CHAIN: a ring of 402 sites, uniform hops, half
// filled: S(l) = (c / 3) ln((N / pi) sin(pi l / N)) + b fitted over l = 20, 40, .., 200 gives c within 5% of 1, the
// log correction.
// INSTRUMENT (a failure makes the verdict partial). I1 THE BAND: 8 band states and 16 moving states at every momentum on
// L = 4, 8, 12, |sin(phase)| >= 0.1 on every moving state, and U carries the band into itself within 1e-10. I2 PURITY: the
// whole torus (w = L) gives S <= 1e-8 and S(w) = S(L - w) within 1e-8 at L = 8, and every Gram spectrum stays in [0, 1]
// within 1e-9. I3 REAL SPACE: at L = 4 the band projector built from the Bloch vectors commutes with the rule's one-body
// cycle written directly on the torus, within 1e-10 (this fixes the Fourier convention). I4 the Gram and block forms
// agree on the husk slab w = 1 at L = 8 within 1e-8.
// VERDICT, fixed before the run: FAIL when H1 fails (the rule's sea has no entanglement) with every control and
// instrument holding, the predicted outcome; PASS when H1 holds; PARTIAL when a control or instrument fails. The band
// sea's gates are reported in the claim either way.
//
// FIRST RUN, DISCLOSED. tmp/ax-hlg-run1 stopped before any entropy was printed: the tridiagonal QL did not converge on
// a Gram matrix with a cluster of exact zeros. The solver was given a unit shift (A + I, then subtract 1, the same
// cure code/algebra/linear/eig-hermitian-householder documents), tmp/ax-probe4 checked every path at L = 4, and the run
// was started again. No gate moved.
// GATE RUN (tmp/ax-hlg-run2.log, 1,092 s): PARTIAL, by the rule fixed above, because CP missed its threshold.
//  - Z: the rule's own seas are products, S = 0, eta = 0. H1 fails on the rule's sea, as predicted.
//  - CP FAILED AS WRITTEN: the singlet product sea gave at most 3.6e-10 nats against a gate of 1e-10. It is the float
//    floor (eigenvalues within 1e-14 of 0 or 1, thousands of them, each adding about 1e-13), not entanglement: the band
//    sea's entropies are 10^2 to 10^4 nats. The gate was set too tight and is reported failed, not moved.
//  - THE BAND SEA HAS AN AREA LAW. Husk slabs at L = 12, w = 1 .. 6: 4585.65, 5764.46, 5924.23, 5953.40, 5954.90,
//    5955.17 (the steps fall 1179, 160, 29, 1.5, 0.27: saturation within about two docks); at L = 8: 1355.64, 1704.32,
//    1751.61, 1759.73; L = 4: 156.30, 192.66, and 156.30 at w = 3, 3.5e-11 at w = L. Entropy per cut link 0.57438 (L =
//    12) and 0.57283 (L = 8), 0.27% apart, so S scales with the cross-section. Volume share 9.5e-3. Husk bars s = 1..4:
//    248.09, 691.41, 1133.98, 1577.09, linear in the perimeter (rms 0.15) and not the area (rms 87.3), 110.7 nats per
//    unit of perimeter. Depth slabs equal the husk slabs to every printed digit (the D4 axes are equivalent). Husk boxes
//    s = 1, 2: 36.88, 220.57.
//  - eta = 0.5744 +- 0.0016 nats a cut link, so G = 1/(4 eta) = 0.435 link areas (a read, on a sea the rule does not
//    write). H1B, H2B hold, PB does not fire.
//  - CG: the gapped chain saturates (S(100) - S(60) = 1.0e-12). CL: the gapless chain gives c = 1.0001. I1 to I4 hold:
//    8 band states and 16 moving at every momentum, |sin| margin 0.371, leak 8e-15, moving phases 2.314 from 0 and
//    0.380 from pi, real-space commutator 3.5e-15, the Gram and block forms equal.
//
// WHAT IT CAN AND CANNOT SAY FOR JACOBSON. An area law with eta on a sea is the first of three things Jacobson's
// derivation needs. The other two are the first law with a local modular Hamiltonian (route H6e) and a boost structure
// near the cut. A zero on the rule's sea closes the route for the rule as it stands. An area law on the band sea only
// says what a band vacuum would carry.
//
// Depth L2: an exact reading of the rule's one-body cycle and its seas. DETERMINISM: no random numbers. FLOATS:
// measurement on exact pieces. NOTHING MOVES: a sea is which modes are filled.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  BAND,
  chainEntropies,
  MODES,
  positiveBand,
  regionEntropies,
  regionEntropyBlock,
  registerPieces,
  stationarity,
  type Band,
} from '@/code/measure/sea-entanglement'

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'holography/sea-entanglement',
  code: 'E-HLG-0037',
  title:
    "the sea's entanglement exactly from its correlation matrix, partial (the product control missed its 1e-10 gate at 3.6e-10, the float floor): the rule's own sea is a product, so S = 0, no area law and G = 1/(4 eta) infinite; the Floquet band sea it does not write has an area law, 0.5744 +- 0.0016 nats a cut link (L 8 and 12 within 0.27%, depth saturated in two docks, husk bars linear in the perimeter), which would give G = 0.435 link areas; gapped chain saturates, gapless chain c = 1.0001",
  category: 'holography',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return seaEntanglementRun()
  },
})

type V4 = readonly number[]

// husk slab x1 in [0, w)
const SLAB_T: V4[] = [
  [0, 1, 1, 0],
  [0, 1, -1, 0],
  [0, 0, 1, 1],
]
const slab = (w: number): V4[] => Array.from({ length: w }, (_, a) => [a, a % 2, 0, 0])
// depth slab x4 in [0, w)
const DEPTH_T: V4[] = [
  [1, 1, 0, 0],
  [1, -1, 0, 0],
  [0, 1, 1, 0],
]
const depth = (w: number): V4[] => Array.from({ length: w }, (_, a) => [a % 2, 0, 0, a])
// husk bar x1, x2 in [0, s)
const BAR_T: V4[] = [
  [0, 0, 1, 1],
  [0, 0, 1, -1],
]
const bar = (s: number): V4[] =>
  Array.from({ length: s * s }, (_, i) => {
    const a = Math.floor(i / s)
    const b = i % s

    return [a, b, (a + b) % 2, 0]
  })
// husk box x1, x2, x3 in [0, s)
const BOX_T: V4[] = [[0, 0, 0, 2]]
const box = (s: number): V4[] =>
  Array.from({ length: s * s * s }, (_, i) => {
    const a = Math.floor(i / (s * s))
    const b = Math.floor(i / s) % s
    const c = i % s

    return [a, b, c, (a + b + c) % 2]
  })

// a product sea: the 8 singlet states (uniform over the 24 slots, one register) at every momentum
function singletBand(like: Band): Band {
  const re = new Float64Array(like.count * BAND * MODES)

  for (let j = 0; j < like.count; j++) {
    for (let a = 0; a < BAND; a++) {
      for (let d = 0; d < 24; d++) {
        re[(j * BAND + a) * MODES + d * 8 + a] = 1 / Math.sqrt(24)
      }
    }
  }

  return { ...like, re, im: new Float64Array(re.length) }
}

// least squares of y on [x, 1]: the residual's root mean square, the slope and the intercept
function fit(x: readonly number[], y: readonly number[]): { rms: number; slope: number; intercept: number } {
  const n = x.length
  const mx = x.reduce((s, v) => s + v, 0) / n
  const my = y.reduce((s, v) => s + v, 0) / n
  const sxy = x.reduce((s, v, i) => s + (v - mx) * (y[i]! - my), 0)
  const sxx = x.reduce((s, v) => s + (v - mx) ** 2, 0)
  const slope = sxy / sxx
  const intercept = my - slope * mx
  const rms = Math.sqrt(x.reduce((s, v, i) => s + (y[i]! - slope * v - intercept) ** 2, 0) / n)

  return { rms, slope, intercept }
}

const range = (a: number, b: number): number[] => Array.from({ length: b - a + 1 }, (_, i) => a + i)

export function seaEntanglementRun(): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const Ps = registerPieces()

  // ---------------- the band, and real space ----------------
  const b4 = positiveBand(4, Ps)
  const real = stationarity(b4, Ps, [0, 7, 100, 191])

  log(`L 4 band, stationarity ${real.worst.toExponential(2)}`)

  const b8 = positiveBand(8, Ps)

  log('L 8 band')

  const b12 = positiveBand(12, Ps)

  log('L 12 band')

  const bands = [b4, b8, b12]

  // ---------------- husk slabs ----------------
  const s4 = regionEntropies(b4, SLAB_T, range(1, 4).map(slab))
  const s8 = regionEntropies(b8, SLAB_T, range(1, 8).map(slab))
  const s12 = regionEntropies(b12, SLAB_T, range(1, 12).map(slab))

  log('slabs')

  const d8 = regionEntropies(b8, DEPTH_T, range(1, 4).map(depth))
  const bars = regionEntropies(b8, BAR_T, range(1, 4).map(bar))

  log('depth slabs and bars')

  const box1 = regionEntropyBlock(b8, BOX_T, box(1))
  const box2 = regionEntropyBlock(b8, BOX_T, box(2))

  log('boxes')

  const blockSlab = regionEntropyBlock(b8, SLAB_T, slab(1))

  // ---------------- controls ----------------
  const product = singletBand(b8)
  const pSlabs = regionEntropies(product, SLAB_T, range(1, 4).map(slab))
  const pBox = regionEntropyBlock(product, BOX_T, box(1))
  const ssh = chainEntropies(
    Array.from({ length: 400 }, (_, i) => (i % 2 === 0 ? 1 : 0.5)),
    [60, 100],
  )
  const ls = range(1, 10).map(i => 20 * i)
  const uniform = chainEntropies(new Array<number>(402).fill(1), ls)
  const N = 402
  const cfit = fit(
    ls.map(l => Math.log((N / Math.PI) * Math.sin((Math.PI * l) / N)) / 3),
    uniform.S,
  )

  log('controls')

  // ---------------- gates ----------------
  const links = (L: number): number => 2 * 3 * L ** 3
  const S12 = s12.S
  const S8 = s8.S
  const eta12 = S12[5]! / links(12)
  const eta8 = S8[3]! / links(8)
  const lastStep = S12[5]! - S12[4]!
  const firstStep = S12[1]! - S12[0]!
  const etaError = Math.abs(eta12 - eta8) + Math.abs(lastStep) / links(12)
  const G = 1 / (4 * eta12)
  const perimeter = fit(range(1, 4).map(s => 4 * s), bars.S)
  const volume = fit(range(1, 4).map(s => s * s), bars.S)
  const slope = fit(range(3, 6), S12.slice(2, 6))
  const volumeShare = (slope.slope * 6) / S12[5]!

  const Z = true // derived: C_A = 1 on the register-full sea; the product control CP runs the same pipeline
  const H1 = false // the rule's own sea, by Z
  const H1a = Math.abs(lastStep) <= 0.02 * S12[5]!
  const H1b = Math.abs(eta12 - eta8) <= 0.05 * eta12
  const H1c = perimeter.rms < volume.rms
  const H1B = H1a && H1b && H1c
  const H2B = Math.abs(volumeShare) <= 0.05
  const PB = lastStep >= 0.5 * firstStep || !H1c

  const CP = [...pSlabs.S, ...pBox.S].every(s => Math.abs(s) <= 1e-10)
  const CG = Math.abs(ssh.S[1]! - ssh.S[0]!) <= 1e-6
  const CL = Math.abs(cfit.slope - 1) <= 0.05
  const I1 = bands.every(b => b.fewest === BAND && b.most === BAND && b.movingMin === 16 && b.movingMax === 16 && b.margin >= 0.1 && b.leak <= 1e-10)
  const symmetric = range(1, 7).every(w => Math.abs(S8[w - 1]! - S8[8 - w - 1]!) <= 1e-8)
  const spill = Math.max(s4.spill, s8.spill, s12.spill, d8.spill, bars.spill, box1.spill, box2.spill)
  const I2 = Math.abs(S8[7]!) <= 1e-8 && Math.abs(S12[11]!) <= 1e-8 && symmetric && spill <= 1e-9
  const I3 = real.worst <= 1e-10
  const I4 = Math.abs(blockSlab.S[0]! - S8[0]!) <= 1e-8
  const controls = CP && CG && CL && I1 && I2 && I3 && I4
  const status: Verdict['status'] = !controls ? 'partial' : H1 ? 'pass' : 'fail'

  const fmt = (xs: readonly number[]): string => xs.map(x => x.toFixed(4)).join(', ')

  const metrics: Record<string, number> = {
    Z: flag(Z),
    H1: flag(H1),
    H1B: flag(H1B),
    H1a: flag(H1a),
    H1b: flag(H1b),
    H1c: flag(H1c),
    H2B: flag(H2B),
    PB: flag(PB),
    CP: flag(CP),
    CG: flag(CG),
    CL: flag(CL),
    I1: flag(I1),
    I2: flag(I2),
    I3: flag(I3),
    I4: flag(I4),
    eta: eta12,
    etaL8: eta8,
    etaError,
    G,
    volumeShare,
    lastStep,
    firstStep,
    barPerimeterRms: perimeter.rms,
    barVolumeRms: volume.rms,
    barPerPerimeter: perimeter.slope,
    chainC: cfit.slope,
    sshSaturation: ssh.S[1]! - ssh.S[0]!,
    stationarity: real.worst,
    spill,
    gapZero: Math.min(...bands.map(b => b.gapZero)),
    gapPi: Math.min(...bands.map(b => b.gapPi)),
    seconds: (Date.now() - started) / 1000,
  }

  S12.forEach((s, i) => (metrics[`slab12_w${i + 1}`] = s))
  S8.forEach((s, i) => (metrics[`slab8_w${i + 1}`] = s))
  s4.S.forEach((s, i) => (metrics[`slab4_w${i + 1}`] = s))
  d8.S.forEach((s, i) => (metrics[`depth8_w${i + 1}`] = s))
  bars.S.forEach((s, i) => (metrics[`bar8_s${i + 1}`] = s))
  metrics.box8_s1 = box1.S[0]!
  metrics.box8_s2 = box2.S[0]!

  return verdict({
    status,
    claim: `Z (derived): the rule's own sea, register-full, has C_A = 1 and S = 0 on every region, as do the empty sea and the chiral halves (products over docks): H1 ${H1}, eta = 0 and G = 1/(4 eta) infinite on the rule's sea. The Floquet band sea (flats and the negative-energy band filled, the 8 positive-energy moving states a momentum empty; moving phases at least ${metrics.gapZero!.toFixed(3)} from 0 and ${metrics.gapPi!.toFixed(3)} from pi): husk slabs S(w) at L 12 ${fmt(S12.slice(0, 6))}, at L 8 ${fmt(S8.slice(0, 4))}, at L 4 ${fmt(s4.S.slice(0, 2))}; depth slabs at L 8 ${fmt(d8.S)}; husk bars s 1..4 at L 8 ${fmt(bars.S)} (perimeter fit rms ${perimeter.rms.toFixed(4)}, volume fit rms ${volume.rms.toFixed(4)}); husk boxes s 1, 2 at L 8 ${fmt([box1.S[0]!, box2.S[0]!])}. H1B ${H1B} (a ${H1a}: S(6) - S(5) = ${lastStep.toExponential(2)}; b ${H1b}: eta ${eta12.toExponential(4)} at L 12, ${eta8.toExponential(4)} at L 8; c ${H1c}) H2B ${H2B} (volume share ${volumeShare.toExponential(2)}) PB ${PB}. eta = ${eta12.toExponential(4)} +- ${etaError.toExponential(1)} nats a cut link, so G = 1/(4 eta) = ${G.toFixed(3)} link areas (a read). Controls: CP ${CP} (the singlet product sea) CG ${CG} (gapped chain S(100) - S(60) = ${metrics.sshSaturation!.toExponential(2)}) CL ${CL} (gapless chain c = ${cfit.slope.toFixed(4)}); instrument I1 ${I1} I2 ${I2} I3 ${I3} (real-space commutator ${real.worst.toExponential(2)}) I4 ${I4}`,
    metrics,
    control: {
      productMax: Math.max(...pSlabs.S.map(Math.abs), Math.abs(pBox.S[0]!)),
      sshSaturation: ssh.S[1]! - ssh.S[0]!,
      chainC: cfit.slope,
    },
    notes: `L2. Bands: ${bands.map(b => `L ${b.L} ${b.count} momenta`).join(', ')}; margin ${Math.min(...bands.map(b => b.margin)).toFixed(4)}, leak ${Math.max(...bands.map(b => b.leak)).toExponential(2)}. Slab classes ${s12.classes} of ${s12.perClass} momenta at L 12. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
