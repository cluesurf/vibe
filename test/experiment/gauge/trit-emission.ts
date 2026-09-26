// Emission on trits (E-FRC-0211): E-FRC-0190's emission rate and E-FRC-0193's stimulated emission rerun with
// the trit-column light (E-FRC-0207) as the field, a moving trit charge (E-FRC-0210) as the emitter where one
// can be, and the linear husk light (photon-links' husk, E-FRC-0179) as the control. The emitters that are not
// the trit charge are STAND-INS (a one-link dimer, the stand-in hydrogen of E-MTR-0001); nothing here is L3.
//
// The derivation, written before any run (code/measure/trit-hop-light):
// - the trit light is the linear husk leapfrog of E-FRC-0179 at kappa = 2 / (2D + 1), read in canonical
//   variables whose energy is (pi / D) times E-FRC-0190's. So every coupling squared carries pi / D: the
//   dipole rate is A = omega^3 |d|^2 / (3 pi eps0 c^3) with eps0 = 6 D / pi, i.e. omega^3 |d|^2 / (18 D c^3),
//   and the ratio of a golden-rule rate to omega^3 |d|^2 / (18 pi c^3) in E-FRC-0190's units is unchanged
// - the stand-in hydrogen in the trit light: Coulomb coefficient C = 1 / (24 D) (E-FRC-0212), mass m = sqrt 3,
//   so a = 1 / (m C) = 24 D / sqrt 3 (152 docks at D = 11, 222 at D = 16), omega(2p -> 1s) = (3/8) m C^2, and
//   the atom's size over its light's wavelength is k a = omega a / c = (3/8) alpha, alpha = C / c. For the
//   continuum 1s and 2p the transverse transition current is exactly the dipole current times (1 + 4 (k a)^2
//   / 9)^(-2) (the longitudinal part does not radiate), so the full-current rate over the dipole rate is
//   R = (1 + alpha^2 / 16)^(-4): 1 - 6.3e-5 at D = 11, 1 - 1.1e-5 at D = 64. THE DIPOLE REGIME HOLDS AT EVERY
//   DEPTH (E-FRC-0190 failed at alpha 0.23 / 0.2023, k a = 0.43, where retardation alone gives R = 0.73)
// - a trit charge hopping forth and back on one link is a square-wave current; its field in the integer rule
//   is the linear leapfrog's (the shadow runs it exactly) plus the response to the counters' carries
//
// Method.
// R  the dimer (a charge on one husk axis link, dipole 1/2) by the golden rule on rays (48 x 96) over the
//    husk symbol at kappa(D), D = 11, 16, 32, 64, omega = 0.01, 0.02, 0.04, and at the committed kappa as the
//    control; the rule's own symbol (tiled trit geometry) checked against E-FRC-0179's stencil symbol first
// H  the stand-in hydrogen at a(D): the closed-form transverse current checked against direct quadrature of
//    the continuum 1s, 2p_z transition current at k a = 0.3, 1, 3; then R(D). The atom is far too large for
//    the lattice stand-in's FFT box (a = 152 to 887 docks), and at a >= 152 the band's departure from p^2 /
//    2m is of order (1 / a)^2 < 5e-5, so the continuum 1s, 2p at the stand-in's mass stand in for the
//    stand-in; the photon at k = omega / c < 1e-4 is the continuum photon to O(k^2) (R measures the lattice
//    photon's departure). LABELED: a stand-in of a stand-in
// M  THE MOVING TRIT CHARGE: one charge hopping forth and back on one husk axis link every 12 beats (period
//    24), side 32, 120 beats (before any front returns across the torus), D = 16, 32, 64, 128, in the integer
//    rule (the fast husk engine; E-FRC-0210 showed the column-summed current alone drives it bit for bit) and
//    in the linear leapfrog with the same current. Read on the flux beyond radius 5 at beat 119: the coherent
//    gain <E~, E_lin> / <E_lin, E_lin> (E~ the shadow flux) and the incoherent remainder |E~ - E_lin|^2 /
//    |E_lin|^2; the linear far energy against the transverse self-energy of the hops (reported)
// S  stimulated emission. S1 the ladder: an integer-rule photon (D 16, side 16, k = (2 pi / 16)(1, 2, 0), the
//    lower photon) at peak |B| 1, 2, 4, 8, 16, frequency on the shadow. S2 the (n + 1) law with the photon modes
//    of the trit light at D = 32 (kappa 2/65), E-FRC-0193's single-excitation method (40^3 torus, the dimer at
//    omega0 = 0.1 with its coupling set so A = omega0 / 50). S3 hard-core modes block it
//
// Gates, fixed before the first run. DISCLOSED: probes ran first (tmp/hop-probe1..6.log): the closed form was
// checked against the quadrature (1e-13), and a single unit impulse in the integer rule was seen to heat the
// shadow (energy 0.05 -> 30 in 120 beats at D = 16 on side 16, 0.012 -> 0.05 at D = 64), which is why M reads
// the coherent part and reports the heating rather than gating the total energy.
// R  |A / (omega^3 |d|^2 / (18 pi c^3)) - 1| <= 0.01 at omega = 0.01 at every D, and the slope of ln A over
//    omega = 0.01 to 0.04 within 0.05 of 3
// H  the closed form within 1e-9 of the quadrature at all three k a, and 1 - R(D) < 1e-3 at every D
// M  the coherent gain within 0.05 of 1 at D = 32, 64 and 128
// S1 the frequency within 1e-4 of the symbol at peaks 4, 8, 16 (peaks 1, 2 reported)
// S2 the decay rate at n = 1, 2, 4 within 3 percent of (n + 1) times the n = 0 rate
// S3 hard-core modes at n = 1 decay under 0.2 of the n = 0 rate
// Status: pass if all pass, partial if R and H pass, fail otherwise.
//
// Depth L2.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { HUSK_KAPPA, goldenRule, hermitianHuskSymbol, huskSymbolizer, readHuskStencil, sphereGrid } from '@/code/measure/husk-emission'
import { HUSK_WEIGHTS } from '@/code/measure/photon-husk'
import { dimerAmplitude, emit, huskPhotonModes } from '@/code/measure/stand-in-light'
import { STAND_IN_MASS } from '@/code/measure/stand-in-atom'
import { sortedEigen } from '@/code/measure/trit-column-light'
import {
  dockAt,
  emptyLinear,
  energyMask,
  fastWave,
  geometrySymbol,
  hydrogenCurrentClosed,
  hydrogenCurrentQuadrature,
  kappaOf,
  lightSpeedOf,
  linearBeat,
  linearEnergy,
  linearFlux,
  retardationFactor,
  shadowEnergy,
  shadowWork,
  transverseSquare,
  huskGreenDifference,
} from '@/code/measure/trit-hop-light'
import { addCurrent, emptyHusk, fastBeat, huskGeometry, makeHuskEngine } from '@/code/rule/trit-husk'

const DEPTHS = [11, 16, 32, 64]

function decayRate(times: ArrayLike<number>, values: ArrayLike<number>, from: number): number {
  const xs: number[] = []
  const ys: number[] = []

  for (let i = 0; i < times.length; i++) {
    if ((times[i] ?? 0) >= from) {
      xs.push(times[i] ?? 0)
      ys.push(Math.log(values[i] ?? 1))
    }
  }

  const mx = xs.reduce((s, v) => s + v, 0) / xs.length
  const my = ys.reduce((s, v) => s + v, 0) / ys.length

  return -xs.reduce((s, v, i) => s + (v - mx) * ((ys[i] ?? 0) - my), 0) / xs.reduce((s, v) => s + (v - mx) ** 2, 0)
}

function sectionR(): { metrics: Record<string, number>; ok: boolean } {
  const out: Record<string, number> = {}
  const stencil = readHuskStencil(8)
  const symbol = huskSymbolizer(stencil)
  const grid = sphereGrid(48, 96)
  const tiled = huskGeometry(8)
  const tau = (2 * Math.PI) / 8

  // the trit rule's own symbol against E-FRC-0179's
  let symbolGap = 0

  for (const n of [[1, 0, 0], [1, 1, 0], [1, 2, 3]]) {
    const k = n.map(x => x * tau)
    const a = sortedEigen(geometrySymbol(tiled, k)).values
    const b = sortedEigen(hermitianHuskSymbol(stencil, k)).values

    a.forEach((v, i) => (symbolGap = Math.max(symbolGap, Math.abs(v - (b[i] ?? 0)))))
  }

  out.symbolGap = symbolGap

  const rate = (kappa: number, omega: number): number =>
    goldenRule({ symbol, couplings: [[{ x: [0, 0, 0], h: 0, re: 0, im: omega / (2 * (HUSK_WEIGHTS[0] ?? 2)) }]], omega, grid, kappa }).rates[0] ?? 0
  const continuum = (kappa: number, omega: number): number => (omega ** 3 * 0.25) / (18 * Math.PI * Math.sqrt((2 * kappa) / 3) ** 3)

  let ok = symbolGap < 1e-12

  for (const [name, kappa] of [...DEPTHS.map(d => [`D${d}`, kappaOf(d)] as const), ['committed', HUSK_KAPPA] as const]) {
    const rates = [0.01, 0.02, 0.04].map(w => rate(kappa, w))

    ;[0.01, 0.02, 0.04].forEach((w, i) => (out[`r_${name}_w${w}_ratio`] = (rates[i] ?? 0) / continuum(kappa, w)))

    const slope = Math.log((rates[2] ?? 1) / (rates[0] ?? 1)) / Math.log(4)

    out[`r_${name}_slope`] = slope

    if (name !== 'committed') {
      const d = Number(name.slice(1))

      // the trit light's own rate, in its canonical units: times pi / D
      out[`r_${name}_tritRateAt001`] = ((rates[0] ?? 0) * Math.PI) / d
      ok = ok && Math.abs((out[`r_${name}_w0.01_ratio`] ?? 0) - 1) <= 0.01 && Math.abs(slope - 3) <= 0.05
    }
  }

  return { metrics: out, ok }
}

function sectionH(): { metrics: Record<string, number>; ok: boolean } {
  const out: Record<string, number> = {}

  let worst = 0

  for (const ka of [0.3, 1, 3]) {
    const n = [Math.sin(1), 0, Math.cos(1)]
    const k = n.map(x => x * ka)
    const closed = transverseSquare(hydrogenCurrentClosed(1, k), n)
    const quad = transverseSquare(hydrogenCurrentQuadrature(1, k), n)
    const full = hydrogenCurrentClosed(1, [0, 0, 0])
    const r = closed / transverseSquare(full, n)

    out[`h_ka${ka}_closedOverQuadrature`] = closed / quad
    out[`h_ka${ka}_transverseOverDipole`] = r
    out[`h_ka${ka}_predicted`] = retardationFactor(ka)
    worst = Math.max(worst, Math.abs(closed / quad - 1), Math.abs(r / retardationFactor(ka) - 1))
  }

  out.hClosedFormWorst = worst

  let ok = worst < 1e-9
  const m = STAND_IN_MASS

  for (const d of DEPTHS) {
    const c = lightSpeedOf(d)
    const coulomb = 1 / (24 * d)
    const a = 1 / (m * coulomb)
    const omega = (3 / 8) * m * coulomb ** 2
    const ka = (omega * a) / c
    const r = retardationFactor(ka)
    const dipole = ((128 * Math.SQRT2) / 243) * a
    const rate = ((omega ** 3 * dipole ** 2) / (18 * d * c ** 3)) * r

    out[`h_D${d}_bohrRadius`] = a
    out[`h_D${d}_omega`] = omega
    out[`h_D${d}_alpha`] = coulomb / c
    out[`h_D${d}_ka`] = ka
    out[`h_D${d}_fullOverDipole`] = r
    out[`h_D${d}_oneMinusRatio`] = 1 - r
    out[`h_D${d}_rate`] = rate
    out[`h_D${d}_lifetimeBeats`] = 1 / rate
    out[`h_D${d}_bandCorrectionBound`] = 1 / (a * a)
    ok = ok && 1 - r < 1e-3
  }

  // E-FRC-0190's regime, the control: its stand-in at a = 2.5 with c = 0.2023
  const a0 = 2.5
  const omega0 = 3 / (8 * m * a0 * a0)
  const ka0 = (omega0 * a0) / Math.sqrt((2 * HUSK_KAPPA) / 3)

  out.h_e0190_ka = ka0
  out.h_e0190_retardationOnly = retardationFactor(ka0)

  return { metrics: out, ok }
}

function sectionM(): { metrics: Record<string, number>; ok: boolean } {
  const out: Record<string, number> = {}
  const side = 32
  const g = huskGeometry(side)
  const center = dockAt(side, 0, 0, 0)
  const all = energyMask(g, center, -1)
  const far = energyMask(g, center, 5)
  const flux = new Int32Array(g.huskLinks)
  const work = shadowWork(g)
  const scratch = new Float64Array(g.huskLinks)
  const next = new Float64Array(g.huskLinks)
  const period = 24
  const beats = 120

  let ok = true

  for (const d of [16, 32, 64, 128]) {
    const engine = makeHuskEngine(g, d)
    const s = emptyHusk(engine)
    const lin = emptyLinear(g)
    let hops = 0

    for (let t = 0; t < beats; t++) {
      const j = t % period === 0 ? 1 : t % period === period / 2 ? -1 : 0

      if (j !== 0) {
        addCurrent(s, center * 9, j)
        lin.string[center * 9] = (lin.string[center * 9] ?? 0) - j
        hops++
      }

      fastBeat(engine, s)
      linearBeat(engine, lin, scratch)
    }

    const intAll = shadowEnergy(engine, s, all, flux, work)
    const intFar = shadowEnergy(engine, s, far, flux, work)
    const shadowE = Float64Array.from(work[1] ?? [])
    const linAll = linearEnergy(engine, lin, all, scratch, next)
    const linFar = linearEnergy(engine, lin, far, scratch, next)

    linearFlux(g, lin, scratch)

    let dot = 0
    let norm = 0
    let rest = 0

    for (let l = 0; l < g.huskLinks; l++) {
      if (!far.links[l]) continue

      const w = 1 / (l % 9 < 3 ? 2 : 1)
      const x = shadowE[l] ?? 0
      const y = scratch[l] ?? 0

      dot += w * x * y
      norm += w * y * y
      rest += w * (x - y) ** 2
    }

    const gain = dot / norm

    out[`m_D${d}_gain`] = gain
    out[`m_D${d}_incoherentOverSignal`] = rest / norm
    out[`m_D${d}_linearTotal`] = linAll
    out[`m_D${d}_linearFar`] = linFar
    out[`m_D${d}_integerTotal`] = intAll
    out[`m_D${d}_integerFar`] = intFar
    out[`m_D${d}_integerOverLinearTotal`] = intAll / linAll
    out[`m_D${d}_hops`] = hops

    // the transverse self-energy of one axis hop: (pi / D) 1/2 (1/g - 2 (G(0) - G(e1))), the energy a hop puts
    // into the transverse field (on the side-32 torus)
    const transverse = (Math.PI / d) * 0.5 * (0.5 - 2 * huskGreenDifference(side, [1, 0, 0]))

    out[`m_D${d}_transverseSelfEnergyPerHop`] = transverse
    out[`m_D${d}_linearFarOverHopsTimesTransverse`] = linFar / (hops * transverse)

    if (d >= 32) ok = ok && Math.abs(gain - 1) <= 0.05
  }

  return { metrics: out, ok }
}

function sectionS(): { metrics: Record<string, number>; ok1: boolean; ok2: boolean; ok3: boolean } {
  const out: Record<string, number> = {}
  const g = huskGeometry(16)
  const engine = makeHuskEngine(g, 16)
  const k = [(2 * Math.PI) / 16, (4 * Math.PI) / 16, 0]
  let ok1 = true

  for (const peak of [1, 2, 4, 8, 16]) {
    let rel = Number.NaN

    try {
      rel = fastWave(engine, g, k, 1, peak, 400, s => fastBeat(engine, s)).relative
    } catch {
      rel = Number.NaN
    }

    out[`s1_peak${peak}_relative`] = Number.isFinite(rel) ? rel : -1

    if (peak >= 4) ok1 = ok1 && Number.isFinite(rel) && Math.abs(rel) < 1e-4
  }

  // (n + 1) at D = 32
  const stencil = readHuskStencil(8)
  const kappa = kappaOf(32)
  const omega0 = 0.1
  const unit = goldenRule({ symbol: huskSymbolizer(stencil), couplings: [[{ x: [0, 0, 0], h: 0, re: 0, im: 1 }]], omega: omega0, grid: sphereGrid(24, 48), kappa }).rates[0] ?? 0
  const f = Math.sqrt(omega0 / 50 / unit)
  const golden = unit * f * f
  const modes = huskPhotonModes({ stencil, side: 40, kappa, amplitude: dimerAmplitude(0, f) })
  const band = Float64Array.from(modes.omega, w => (Math.abs(w - omega0) < 30 * golden ? 1 : 0))
  const beats = Math.ceil(0.6 / golden)
  const rates = [0, 1, 2, 4].map(n => {
    const run = emit({ modes, omega0, beats, dt: 0.25, every: 1, occupation: Float64Array.from(band, b => b * n) })

    return decayRate(run.times, run.excited, beats / 20)
  })
  const blocked = emit({ modes, omega0, beats, dt: 0.25, every: 1, occupation: Float64Array.from(band, b => -b) })
  const blockedRate = decayRate(blocked.times, blocked.excited, beats / 20)

  out.s2Golden = golden
  out.s2SpontaneousOverGolden = (rates[0] ?? 0) / golden
  ;[1, 2, 4].forEach((n, i) => (out[`s2_n${n}_overNPlusOne`] = (rates[i + 1] ?? 0) / ((rates[0] ?? 1) * (n + 1))))
  out.s3HardCoreOverSpontaneous = blockedRate / (rates[0] ?? 1)

  const ok2 = [1, 2, 4].every(n => Math.abs((out[`s2_n${n}_overNPlusOne`] ?? 0) - 1) <= 0.03)
  const ok3 = (out.s3HardCoreOverSpontaneous ?? 1) < 0.2

  return { metrics: out, ok1, ok2, ok3 }
}

export default experiment({
  id: 'gauge/trit-emission',
  code: 'E-FRC-0211',
  title:
    'emission on trits: in the trit-column light a stand-in dimer decays at the husk dipole rate at every depth, the stand-in hydrogen at the coupling the depth sets (alpha about 1/77 at D = 16) sits deep in the dipole regime, its full-current rate (1 + alpha^2 / 16)^-4 of the dipole rate, a moving trit charge radiates the linear light\'s coherent field, and stimulated emission goes as n + 1',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = sectionR()
    const h = sectionH()
    const m = sectionM()
    const s = sectionS()
    const metrics: Record<string, number> = { ...r.metrics, ...h.metrics, ...m.metrics, ...s.metrics }
    const gates = { R: r.ok, H: h.ok, M: m.ok, S1: s.ok1, S2: s.ok2, S3: s.ok3 }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = Object.values(gates).every(x => x) ? 'pass' : gates.R && gates.H ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `in the trit-column light the dimer's rate over omega^3 |d|^2 / (18 pi c^3) is ${DEPTHS.map(d => (metrics[`r_D${d}_w0.01_ratio`] ?? 0).toFixed(4)).join(', ')} at D = ${DEPTHS.join(', ')} (omega 0.01), the stand-in hydrogen's full-current 2p -> 1s rate is 1 - ${DEPTHS.map(d => (metrics[`h_D${d}_oneMinusRatio`] ?? 0).toExponential(1)).join(', ')} of its dipole rate (k a = 3 alpha / 8), a trit charge hopping on one link radiates a far field whose coherent gain against the linear light is ${[16, 32, 64, 128].map(d => (metrics[`m_D${d}_gain`] ?? 0).toFixed(3)).join(', ')} at D = 16, 32, 64, 128 with incoherent remainders ${[16, 32, 64, 128].map(d => (metrics[`m_D${d}_incoherentOverSignal`] ?? 0).toFixed(2)).join(', ')}, and emission into n photons per mode runs at ${[1, 2, 4].map(n => ((metrics[`s2_n${n}_overNPlusOne`] ?? 0) * (n + 1)).toFixed(3)).join(', ')} times spontaneous`,
      metrics,
      control: {
        committedRatioAt001: metrics['r_committed_w0.01_ratio'] ?? 0,
        e0190RetardationOnly: metrics.h_e0190_retardationOnly ?? 0,
      },
      notes:
        'L2, STAND-IN emitters except in M. FIRST RUN 2026-09-26 (tmp/frc0211.log, 333 s), FAIL: R and M fail, no gate moved. R: the rule\'s tiled symbol equals E-FRC-0179\'s to 2.4e-14; the dimer ratio at omega 0.01 is 1.0004, 1.0033, 1.0130, 1.0050 at D = 11, 16, 32, 64 (committed kappa 1.0046), slopes 3.002, 3.001, 2.995, 3.005: the omega^3 law holds at every depth, but D = 32 misses the 1 percent gate by 0.3 percent; the other omegas scatter by the same size (0.996 to 1.013) with no trend in D or omega, the ray-quadrature error E-FRC-0190 already saw on a coarser grid, so the gate was a knife edge a second time. In trit units the rate is these times pi / D. H: the closed form matches the quadrature to 5e-14 at k a = 0.3, 1, 3 (transverse over dipole 0.8548, 0.2297, 0.0016, each equal to (1 + 4 (k a)^2 / 9)^-4), and the stand-in hydrogen at the depth-set coupling has a = 152, 222, 443, 887 docks, k a = 3 alpha / 8 = 0.0059 to 0.0024, full-current rate 1 - 6.2e-5 to 1 - 1.0e-5 of the dipole rate: DEEP IN THE DIPOLE REGIME at every depth, as predicted (lifetime 2.6e11 beats at D = 11, 1.0e12 at D = 16). E-FRC-0190\'s own regime (k a 0.43) gives 0.73 from retardation alone, its lattice atom 0.43. M, THE MOVING TRIT CHARGE, FAILS AND IS THE FINDING: a trit charge hopping forth and back (10 hops, 120 beats, side 32) in the integer rule does not radiate the linear light\'s field at the depths tried. The shadow flux beyond radius 5 has coherent gain 0.88, 0.21, 0.54, 0.56 against the linear field at D = 16, 32, 64, 128 and an incoherent remainder 94, 16, 2.6, 2.2 times the signal; the integer rule\'s total energy is 61, 15, 1.6, 1.05 times the linear rule\'s. The cause: one unit of flux dropped on one link is a field whose transverse part is fractional everywhere but at the link (the transverse self-energy per hop is 0.041 at D = 16), below the integer rule\'s resolution, and the integer rule heats after it (the likely mechanism is the counters\' carries, not isolated here) (a single impulse probe: shadow energy 0.05 to 30 in 120 beats at D = 16 on side 16, 0.012 to 0.05 at D = 64). The heating falls steeply with depth, so a single charge radiates cleanly only when the column is deep (the energy ratio reaches 1.05 at D = 128), which is where alpha is small. A wave of the integer rule is clean at every depth (S1: within 4.3e-6 of the symbol at peaks 1 to 16), so the heating comes with the impulse\'s broadband content (every branch up to the band top at once), not with small amplitude as such; which branch carries it is not yet measured. The far-energy readings are not comparable across D (the front has reached radius 5 to 17 depending on c), reported only. S: the (n + 1) law holds on the trit light\'s modes at D = 32 (2.017, 3.045, 5.134 times spontaneous, within 0.9, 1.5, 2.7 percent), hard-core modes block it (-0.005), spontaneous over golden 0.970. OWED: the M failure is the next problem for moving matter, a charge whose hop is spread over the column (a thermometer front of vibes, not one trit) or a smoother current, and a rerun of R on a finer ray grid.',
    })
  },
})
