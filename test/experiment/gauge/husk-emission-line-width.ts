// E-FRC-0192. The natural line width on the husk: a STAND-IN emitter decays at the golden-rule rate A, and the
// light it leaves has a Lorentzian line of full width A. The light is the EXACTLY LINEAR husk leapfrog of
// E-FRC-0179 (the linear rule); the emitter is a STAND-IN (a charge hopping on one husk link); nothing here is L3.
//
// PREDICTION, written before the first run: Wigner and Weisskopf (1930). An excited level coupled to a continuum of
// modes with golden-rule rate A decays as e^(-A t) and leaves each mode j with |b_j|^2 = |g_j|^2 / ((omega_j -
// omega0')^2 + A^2 / 4): a Lorentzian of full width A. So the width read from the light equals the decay rate read
// from the emitter, and both equal the golden-rule A of E-FRC-0190; the width scales as the charge squared.
//
// Method, two independent routes to the same emitter (a dimer on a husk axis link, omega0 = 0.3, charge q = 1.6):
//   QUANTUM, mode space: every photon mode (k, b) of a 40^3 husk torus, its frequency and eigenvector from the
//     linear husk symbol (hermitianEigen), coupled to the dimer with g = amplitude / sqrt(2 V sin omega); the
//     single-excitation dynamics in the rotating wave (code/measure/stand-in-light emit), RK4 at a quarter beat,
//     to 150 beats (the first light the torus returns to the emitter needs about 200)
//   SEMICLASSICAL, real space: the dimer and the linear husk leapfrog on a 40^3 torus, beat by beat, the dimer
//     feeling the husk angle through its Peierls phase q a / w and the flux taking exactly the charge that moved
//     (Gauss's law exact), started with 1e-4 of the excited level; a weakly excited emitter's radiation reaction
//     damps it at A
// The decay rate is the least-squares slope of ln P_e over 5 <= t <= 120 (20 <= t <= 120 in real space, past the
// dressing transient, P_e read in the dimer's current Peierls phase); the line width is a Lorentzian fitted
// to |b_j|^2 / |g_j|^2 over the modes within 5 A of the line. No random numbers anywhere.
//
// Gates, fixed before the first run. A machinery probe (tmp/atom-emit-probe.ts, disclosed) ran the real-space
// dimer first, at charge 1.2 on a 32^3 torus, and found what the plan had not foreseen: the point dimer is
// strongly dressed by its own near field (the flux its moving charge leaves on its own link and neighbors, the
// lattice Coulomb self-energy). Its bare excited level loses 45 percent in the first 4 beats, its line moves 2.7
// percent down, and the dressed level then decays at 0.74 of the golden-rule A. The golden rule counts only the
// photon branches, so for a point charge at the strengths a box can time, the bare-emitter comparison is not a
// clean one; the real-space rate is therefore REPORTED beside A with no tolerance, and gate 4 keeps what the
// real-space run is for, Gauss's law:
// 1. DECAY = A: the mode-space decay rate within 5 percent of the golden-rule A (24 x 48 rays)
// 2. WIDTH = DECAY: the fitted line width within 3 percent of the mode-space decay rate
// 3. CHARGE SQUARED: at q / sqrt 2 the decay rate is half, within 3 percent
// 4. GAUSS: in the real-space run the husk divergence of the flux equals the charge at every dock and every
//    tenth beat to 1e-12
// Pass: all four. Partial: 1 and 2. Fail: otherwise.
//
// Depth L2: Wigner-Weisskopf on a chosen stand-in emitter in the model's exact linear light.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { H, goldenRule, huskSymbolizer, readHuskStencil, sphereGrid } from '@/code/measure/husk-emission'
import { dimerAmplitude, dimerBeat, emit, huskPhotonModes, linkDivergence, makeRealSpace, type DimerState, type PhotonModes } from '@/code/measure/stand-in-light'

const OMEGA0 = 0.3
const CHARGE = 1.6
const SIDE = 40
const BEATS = 150
const FIT_FROM = 5
const FIT_TO = 120

// the least-squares slope of ln y against t over [from, to], negated
function decayRate(times: ArrayLike<number>, values: ArrayLike<number>, from: number, to: number): number {
  const xs: number[] = []
  const ys: number[] = []

  for (let i = 0; i < times.length; i++) {
    if (times[i]! >= from && times[i]! <= to) {
      xs.push(times[i]!)
      ys.push(Math.log(values[i]!))
    }
  }

  const mx = xs.reduce((s, v) => s + v, 0) / xs.length
  const my = ys.reduce((s, v) => s + v, 0) / ys.length

  return -xs.reduce((s, v, i) => s + (v - mx) * (ys[i]! - my), 0) / xs.reduce((s, v) => s + (v - mx) ** 2, 0)
}

// a Lorentzian 1 / ((x - x0)^2 + G^2 / 4) fitted to (detuning, |b|^2 / |g|^2) by least squares on its reciprocal,
// which is the quadratic x^2 - 2 x0 x + x0^2 + G^2 / 4 over the scale c
function lorentzianWidth(modes: PhotonModes, bRe: Float64Array, bIm: Float64Array, window: number): { width: number; center: number } {
  const rows: [number, number][] = []

  for (let j = 0; j < modes.omega.length; j++) {
    const detune = modes.omega[j]! - OMEGA0
    const g2 = modes.gRe[j]! ** 2 + modes.gIm[j]! ** 2

    if (Math.abs(detune) < window && g2 > 0) {
      rows.push([detune, g2 / (bRe[j]! ** 2 + bIm[j]! ** 2)])
    }
  }

  // y = p0 + p1 x + p2 x^2 (y = 1 / Lorentzian, times the scale)
  const m = [0, 1, 2].map(() => [0, 0, 0])
  const r = [0, 0, 0]

  for (const [x, y] of rows) {
    const b = [1, x, x * x]
    // weight by the Lorentzian itself, so the tails do not dominate
    const w = 1 / (y * y)

    for (let i = 0; i < 3; i++) {
      r[i] = r[i]! + w * b[i]! * y

      for (let k = 0; k < 3; k++) {
        m[i]![k] = m[i]![k]! + w * b[i]! * b[k]!
      }
    }
  }

  // solve the 3 x 3 system
  const det = (q: number[][]): number => q[0]![0]! * (q[1]![1]! * q[2]![2]! - q[1]![2]! * q[2]![1]!) - q[0]![1]! * (q[1]![0]! * q[2]![2]! - q[1]![2]! * q[2]![0]!) + q[0]![2]! * (q[1]![0]! * q[2]![1]! - q[1]![1]! * q[2]![0]!)
  const d = det(m)
  const solve = (col: number): number => det(m.map((row, i) => row.map((v, k) => (k === col ? r[i]! : v)))) / d
  const p0 = solve(0)
  const p1 = solve(1)
  const p2 = solve(2)
  const center = -p1 / (2 * p2)
  const quarter = p0 / p2 - center * center

  return { width: 2 * Math.sqrt(Math.max(0, quarter)), center }
}

export default experiment({
  id: 'gauge/husk-emission-line-width',
  code: 'E-FRC-0192',
  title:
    'the natural line width on the husk: a stand-in emitter in the exactly linear husk light decays at the golden-rule rate A and leaves a Lorentzian line of full width A, in the quantum single-excitation dynamics over every photon mode of a husk torus and in a semiclassical real-space run with Gauss law exact',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const stencil = readHuskStencil(8)
    const symbol = huskSymbolizer(stencil)
    const grid = sphereGrid(24, 48)
    const f = (CHARGE * OMEGA0) / 4
    const golden = goldenRule({ symbol, couplings: [[{ x: [0, 0, 0], h: 0, re: 0, im: f }]], omega: OMEGA0, grid }).rates[0]!
    const modes = huskPhotonModes({ stencil, side: SIDE, amplitude: dimerAmplitude(0, f) })
    const run = emit({ modes, omega0: OMEGA0, beats: BEATS, dt: 0.25, every: 1 })
    const decay = decayRate(run.times, run.excited, FIT_FROM, FIT_TO)
    const line = lorentzianWidth(modes, run.bRe, run.bIm, 5 * golden)
    const halfModes = huskPhotonModes({ stencil, side: SIDE, amplitude: dimerAmplitude(0, f / Math.SQRT2) })
    const halfRun = emit({ modes: halfModes, omega0: OMEGA0, beats: BEATS, dt: 0.25, every: 1 })
    const halfDecay = decayRate(halfRun.times, halfRun.excited, FIT_FROM, FIT_TO)

    metrics.goldenRuleA = golden
    metrics.modeCount = modes.omega.length
    metrics.decayRate = decay
    metrics.decayOverGolden = decay / golden
    metrics.lineWidth = line.width
    metrics.lineCenterShift = line.center
    metrics.widthOverDecay = line.width / decay
    metrics.halfChargeDecayRatio = halfDecay / decay
    metrics.excitedLeftAtEnd = run.excited[run.excited.length - 1]!
    metrics.normDrift = run.normDrift

    // the semiclassical real-space run
    const space = makeRealSpace(stencil, SIDE)
    const links = SIDE ** 3 * H
    const dimer = { space, dock: 0, h: 0, omega0: OMEGA0, charge: CHARGE, scratch: new Float64Array(links) }
    const chi = 0.01
    const state: DimerState = {
      a: new Float64Array(links),
      e: new Float64Array(links),
      c0r: Math.cos(chi) / Math.SQRT2,
      c0i: Math.sin(chi) / Math.SQRT2,
      c1r: Math.cos(chi) / Math.SQRT2,
      c1i: -Math.sin(chi) / Math.SQRT2,
    }
    const times: number[] = []
    const excited: number[] = []
    let gauss = 0
    const neighbor = 1

    for (let t = 1; t <= FIT_TO; t++) {
      dimerBeat(dimer, state)

      // the excited level of the dimer in its current Peierls phase: (|0> - e^(-i theta) |1>) / sqrt 2
      const theta = (CHARGE * state.a[0]!) / 2
      const xr = Math.cos(theta) * state.c1r - Math.sin(theta) * state.c1i
      const xi = Math.cos(theta) * state.c1i + Math.sin(theta) * state.c1r

      times.push(t)
      excited.push(((state.c0r - xr) ** 2 + (state.c0i - xi) ** 2) / 2)

      if (t % 10 === 0) {
        const div = linkDivergence(SIDE, state.e)
        const rho0 = CHARGE * (state.c0r ** 2 + state.c0i ** 2 - 0.5)
        const rho1 = CHARGE * (state.c1r ** 2 + state.c1i ** 2 - 0.5)

        for (let i = 0; i < div.length; i++) {
          gauss = Math.max(gauss, Math.abs(div[i]! - (i === 0 ? rho0 : i === neighbor ? rho1 : 0)))
        }
      }
    }

    // past the dressing transient
    const semiclassical = decayRate(times, excited, 20, FIT_TO)

    metrics.semiclassicalLeftAfter4Beats = excited[3]! / Math.sin(chi) ** 2
    metrics.semiclassicalDecay = semiclassical
    metrics.semiclassicalOverGolden = semiclassical / golden
    metrics.gaussWorst = gauss

    const gate1 = Math.abs(decay / golden - 1) <= 0.05
    const gate2 = Math.abs(line.width / decay - 1) <= 0.03
    const gate3 = Math.abs(halfDecay / decay - 0.5) <= 0.015
    const gate4 = gauss <= 1e-12
    const status = gate1 && gate2 && gate3 && gate4 ? 'pass' : gate1 && gate2 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `a one-link stand-in emitter in the exactly linear husk light decays at ${decay.toFixed(5)} per beat over every mode of a 40^3 husk torus against the golden-rule A = ${golden.toFixed(5)} (${((decay / golden - 1) * 100).toFixed(2)} percent), leaves a line of full width ${line.width.toFixed(5)} (${((line.width / decay - 1) * 100).toFixed(2)} percent from its decay rate), decays ${(halfDecay / decay).toFixed(4)} as fast at charge / sqrt 2, and in a semiclassical real-space run decays at ${semiclassical.toFixed(5)} with Gauss law held to ${gauss.toExponential(1)}`,
      metrics: {
        ...metrics,
        gateDecayIsA: gate1 ? 1 : 0,
        gateWidthIsDecay: gate2 ? 1 : 0,
        gateChargeSquared: gate3 ? 1 : 0,
        gateSemiclassical: gate4 ? 1 : 0,
      },
      notes:
        'L2, a STAND-IN emitter (one-link dimer) in the LINEAR rule. The mode-space run is the rotating-wave single-excitation sector (every photon branch of the husk symbol kept; the massive branches are left out, the dimer line lying below them); the real-space run keeps everything the linear leapfrog carries, massive branches and near field included. Husk only. FIRST RUN (2026-09-26), status fail. The line is a Lorentzian whose width equals the emitter\'s decay rate to 1.5 percent (gate 2 passed), and Gauss\'s law held to 1.8e-14 in real space (gate 4 passed). But the decay rate is 0.0382 against the golden-rule 0.0449 (-15 percent) and halves only to 0.543 at charge / sqrt 2: the emitter was chosen too strong (A / omega0 = 0.15, so that the decay fits before the torus returns the light), outside the weak-coupling regime where Wigner-Weisskopf equals the golden rule. The semiclassical real-space decay read 0.0264 (0.59 of A), past the near-field dressing the probe found.',
    })
  },
})
