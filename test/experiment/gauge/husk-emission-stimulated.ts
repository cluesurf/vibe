// E-FRC-0193. Stimulated emission on the husk: an excited STAND-IN emitter in husk light that already holds n
// photons per mode near its line emits at (n + 1) A, because each photon of the EXACTLY LINEAR husk leapfrog (the
// linear rule of E-FRC-0179) is a quantum of a harmonic oscillator. The emitter is a STAND-IN (a one-link dimer);
// nothing here is L3.
//
// THE DERIVATION, written before the first run. The linear leapfrog keeps Q = 1/2 (E^2 + x A^2 + x A E) exactly on
// each mode (x = kappa mu), and the Hamiltonian whose one-beat flow IS the beat is h = (omega / sin omega) Q
// (code/measure/husk-emission): a harmonic oscillator of frequency omega, whatever the amplitude. Quantized, its
// levels are equally spaced by omega and its raising operator carries sqrt(n + 1). So an emitter's coupling into
// a mode holding n photons is g sqrt(n + 1), and the golden rule gives (n + 1) A: n stimulated, 1 spontaneous.
// What the rule itself decides is the harmonic ladder: a mode of the linear rule must oscillate at one frequency
// at every amplitude, the leapfrog's 2 arcsin(sqrt(kappa mu) / 2).
//
// Method: (1) THE LADDER, real space: one photon mode of the linear husk leapfrog on a 16^3 torus (k = (2 pi / 16)
// (1, 2, 0), the lower photon branch of the husk symbol, hermitianEigen), run 256 beats at amplitudes 1e-3 and
// 1e3, its frequency read from the angle's projection on the mode (refineTone); (2) THE RATE, mode space: the
// dimer (omega0 = 0.3, charge 0.6, so that 5 A stays a tenth of omega0) over every photon mode of a 40^3 husk
// torus, modes within 30 A of the line (six times the widest line, at n = 4)
// holding n = 0, 1, 2, 4 photons, the one-flip sector (the emitter's coupling to mode j is g_j sqrt(n_j + 1)),
// decay rate over 5 <= t <= 100. CONTROL: modes that hold at most one quantum (hard-core, coupling g sqrt(1 - n))
// with n = 1 in the band: emission into the band is blocked. No random numbers anywhere.
//
// Gates, fixed before the first run:
// 1. THE LADDER: the mode's normalized motion (its angle's projection on the start, over the start's norm) is
//    the same at both amplitudes at every beat to 1e-12, and its frequency equals 2 arcsin(sqrt(kappa mu) / 2) to
//    1e-6
// 2. STIMULATED: the decay rate at n photons per mode is (n + 1) times the rate at n = 0, within 3 percent, for
//    n = 1, 2, 4
// 3. CONTROL: with hard-core modes at n = 1 the decay rate falls under 0.2 of the n = 0 rate
// Pass: all three. Partial: 1 and 2. Fail: otherwise.
//
// Depth L2: the (n + 1) is the boson algebra of a harmonic oscillator; what the model supplies is that its linear
// light IS one (gate 1), and the rate is then measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { H, HUSK_KAPPA, goldenRule, hermitianHuskSymbol, huskSymbolizer, readHuskStencil, sphereGrid } from '@/code/measure/husk-emission'
import { hermitianEigen } from '@/code/measure/photon-modes'
import { HUSK_VECTORS, HUSK_WEIGHTS } from '@/code/measure/photon-husk'
import { applyHuskCurl, dimerAmplitude, emit, huskPhotonModes, makeRealSpace } from '@/code/measure/stand-in-light'
import { refineTone } from '@/code/measure/stand-in-atom'

const OMEGA0 = 0.3
const CHARGE = 0.6
const SIDE = 40
const BEATS = 100
const OCCUPATIONS = [0, 1, 2, 4]

function decayRate(times: ArrayLike<number>, values: ArrayLike<number>, from: number): number {
  const xs: number[] = []
  const ys: number[] = []

  for (let i = 0; i < times.length; i++) {
    if (times[i]! >= from) {
      xs.push(times[i]!)
      ys.push(Math.log(values[i]!))
    }
  }

  const mx = xs.reduce((s, v) => s + v, 0) / xs.length
  const my = ys.reduce((s, v) => s + v, 0) / ys.length

  return -xs.reduce((s, v, i) => s + (v - mx) * (ys[i]! - my), 0) / xs.reduce((s, v) => s + (v - mx) ** 2, 0)
}

export default experiment({
  id: 'gauge/husk-emission-stimulated',
  code: 'E-FRC-0193',
  title:
    'stimulated emission on the husk: each mode of the exactly linear husk leapfrog oscillates at one frequency at every amplitude, a harmonic oscillator, so a stand-in emitter in light holding n photons per mode near its line decays at (n + 1) times its spontaneous rate, where modes that hold one quantum at most block it',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const stencil = readHuskStencil(8)

    // (1) the ladder
    const side = 16
    const space = makeRealSpace(stencil, side)
    const k = [(2 * Math.PI) / side, (4 * Math.PI) / side, 0]
    const e = hermitianEigen(hermitianHuskSymbol(stencil, k))
    const order = Array.from(e.values, (_, j) => j).sort((p, q) => e.values[p]! - e.values[q]!)
    const column = order[1]!
    const mu = e.values[column]!
    const predicted = 2 * Math.asin(Math.sqrt(HUSK_KAPPA * mu) / 2)
    const series = [1e-3, 1e3].map(amplitude => {
      const links = side ** 3 * H
      const a = new Float64Array(links)
      const flux = new Float64Array(links)
      const scratch = new Float64Array(links)
      // the angle a_h(x) = Re(sqrt(w_h) u_h e^(i k . (x + u_h / 2))), the Hermitian frame's vector lifted
      const projection: number[] = []

      for (let z = 0; z < side; z++) {
        for (let y = 0; y < side; y++) {
          for (let x = 0; x < side; x++) {
            for (let h = 0; h < H; h++) {
              const ur = e.vectorsRe[h * H + column]!
              const ui = e.vectorsIm[h * H + column]!
              const u = HUSK_VECTORS[h]!
              // the link's midpoint x + u_h / 2
              const phase = k[0]! * (x + u[0]! / 2) + k[1]! * (y + u[1]! / 2) + k[2]! * (z + u[2]! / 2)

              // the physical angle is G^(1/2) times the Hermitian frame's vector (an eigenvector of M_h itself)
              a[(x + side * (y + side * z)) * H + h] = amplitude * Math.sqrt(HUSK_WEIGHTS[h]!) * (ur * Math.cos(phase) - ui * Math.sin(phase))
            }
          }
        }
      }

      const reference = Float64Array.from(a)
      const norm = reference.reduce((s, v) => s + v * v, 0)

      for (let t = 0; t < 256; t++) {
        for (let i = 0; i < links; i++) {
          a[i] = a[i]! + flux[i]!
        }

        applyHuskCurl(space, a, scratch)

        for (let i = 0; i < links; i++) {
          flux[i] = flux[i]! - space.kappa * scratch[i]!
        }

        projection.push(a.reduce((s, v, i) => s + v * reference[i]!, 0) / norm)
      }

      return projection
    })
    const frequencies = series.map(p => refineTone(p, predicted * 0.98, predicted * 1.02).omega)

    metrics.ladderMu = mu
    metrics.ladderPredicted = predicted
    metrics.ladderSmallAmplitude = frequencies[0]!
    metrics.ladderLargeAmplitude = frequencies[1]!
    // the normalized motion at the two amplitudes, beat by beat: identical for a linear rule
    metrics.ladderAmplitudeShift = Math.max(...series[0]!.map((v, t) => Math.abs(v - series[1]![t]!)))
    metrics.ladderMiss = Math.abs(frequencies[0]! / predicted - 1)

    // (2) the rate
    const symbol = huskSymbolizer(stencil)
    const f = (CHARGE * OMEGA0) / 4
    const golden = goldenRule({ symbol, couplings: [[{ x: [0, 0, 0], h: 0, re: 0, im: f }]], omega: OMEGA0, grid: sphereGrid(24, 48) }).rates[0]!
    const modes = huskPhotonModes({ stencil, side: SIDE, amplitude: dimerAmplitude(0, f) })
    const band = Float64Array.from(modes.omega, w => (Math.abs(w - OMEGA0) < 30 * golden ? 1 : 0))
    const rates = OCCUPATIONS.map(n => {
      const run = emit({ modes, omega0: OMEGA0, beats: BEATS, dt: 0.25, every: 1, occupation: Float64Array.from(band, b => b * n) })

      return decayRate(run.times, run.excited, 5)
    })

    OCCUPATIONS.forEach((n, i) => {
      metrics[`n${n}_decayRate`] = rates[i]!
      metrics[`n${n}_overSpontaneousTimesNPlusOne`] = rates[i]! / (rates[0]! * (n + 1))
    })
    metrics.goldenRuleA = golden
    metrics.spontaneousOverGolden = rates[0]! / golden

    // the hard-core control: coupling g sqrt(1 - n), n = 1 in the band, written as occupation -n
    const blocked = emit({ modes, omega0: OMEGA0, beats: BEATS, dt: 0.25, every: 1, occupation: Float64Array.from(band, b => -b) })
    const blockedRate = decayRate(blocked.times, blocked.excited, 5)

    metrics.hardCoreDecayOverSpontaneous = blockedRate / rates[0]!

    const gate1 = metrics.ladderAmplitudeShift <= 1e-12 && metrics.ladderMiss <= 1e-6
    const gate2 = OCCUPATIONS.slice(1).every((n, i) => Math.abs(rates[i + 1]! / (rates[0]! * (n + 1)) - 1) <= 0.03)
    const gate3 = blockedRate / rates[0]! < 0.2
    const status = gate1 && gate2 && gate3 ? 'pass' : gate1 && gate2 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `a photon mode of the exactly linear husk leapfrog oscillates at ${frequencies[0]!.toFixed(10)} (the leapfrog's ${predicted.toFixed(10)}) with the same normalized motion at amplitude 1e-3 and 1e3 to ${metrics.ladderAmplitudeShift.toExponential(1)}, a harmonic ladder, and a stand-in emitter in light holding n = ${OCCUPATIONS.slice(1).join(', ')} photons per mode decays at ${OCCUPATIONS.slice(1).map((n, i) => (rates[i + 1]! / rates[0]!).toFixed(4)).join(', ')} times its spontaneous rate, while hard-core modes block it to ${(blockedRate / rates[0]!).toFixed(4)}`,
      metrics: {
        ...metrics,
        gateLadder: gate1 ? 1 : 0,
        gateStimulated: gate2 ? 1 : 0,
        gateHardCoreControl: gate3 ? 1 : 0,
      },
      notes:
        'L2, a STAND-IN emitter in the LINEAR rule. The (n + 1) enters through the boson algebra of the quantized modes; the model supplies that each mode is a harmonic oscillator (gate 1, exact linearity of the rule), which the integer rule of E-FRC-0180 is not (its dead zone freezes a wave below |B| = 9). The one-flip sector keeps every state that one emission reaches. Husk only.',
    })
  },
})
