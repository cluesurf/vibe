// Spontaneous emission into a propagating quantum light (E-FRC-0233): a STAND-IN atom (an electron hopping across
// rung 0 of the plaquette ladder, its nucleus at b_0, the hop RECORDED by the rung's flux, E-FRC-0227's lattice
// QED) meets the ladder's own light (code/rule/plaquette-ladder, kappa = 2 / (2D + 1) in the drift), not fresh
// registers (E-FRC-0224, 0228's STAND-IN for light leaving). The light carries the quantum away itself.
//
// DERIVED before the first run.
//   (1) the coupling      The drift's rung-0 phase zeta_M^(-c bal(x + R)^2), R = m_(L-1) - m_0 the rung's field,
//                         is zeta_M^(-c x) (the string's own energy, part of the atom) times
//                         e^(-i g x R), g = 4 pi c / M: a dipole coupling of strength g |d|, d = <g|x|e> in the
//                         atom's own states (its bare beat diag(1, zeta^-c) V(z))
//   (2) the golden rule   With the ladder's harmonic one-quantum band (E-FRC-0231) and |<1_k|R|0>|^2 =
//                         (4 sin^2(k/2) / L)(hbar/2) f / sin omega_k (hbar = N / 2 pi), the rate into a long ladder
//                         is Gamma = (2N/pi) g^2 |d|^2 f sin^2(k*/2) / (kappa sin k*), omega(k*) = the gap. This is
//                         the rate the streamed-register results converge to (E-FRC-0228: the collision rate
//                         reaches the golden rule as 1/s^2); the 4^-n of E-FRC-0224 belongs to the fear beat's
//                         strong swap meeting only
//   (3) the box           A ladder of L squares has L one-quantum levels, spaced about 2 pi v_g / L apart. The
//                         golden rule needs that spacing well below Gamma, so L above 2 pi v_g / Gamma, about 25 at
//                         N = 9: the exact rule reaches only L = 6 (N^6 light states), where the atom and its nearest
//                         modes exchange the quantum (vacuum Rabi). What the exact rule CAN be held to is the linear
//                         single-excitation reading of the same box (the atom, the L modes, the coupling as one
//                         rotation per beat, the free phases), and that reading's long-ladder limit is the rate
//   (4) the control       With the force (plaquette) step off, the light's loops never change, the atom's channel is
//                         a mixture of unitaries (unital, E-FRC-0229 R4) and the atom cannot lose its quantum
//
// Gates, fixed before the first run (probes before this file, disclosed in the notes):
// E1 the pure excited atom emits: on L = 6 at N = 9 and 11 (hop set for a gap near k* = pi/2), the exact rule
//    takes P_e from 1 below 0.5 before the quantum can return (beat L / v_g)
// E2 the control: with the force step off, P_e stays at or above 0.9 for 30 beats at N = 9 and 11
// E3 the exact rule is the linear light's emission: |P_e(rule) - P_e(single-excitation box reading)| <= 0.04 at
//    every beat up to 30, at N = 9 and 11
// E4 the rate (the harmonic reading, NOT the rule): on a ring of 4096 squares the single-excitation reading's
//    ln P_e is linear over beats 20 to 80 (largest residual below 0.02) with slope within 0.8 to 1.25 of the
//    golden rule (2), at N = 9 and 11
// Reported: the fresh-register comparison (the loss in one beat from a fresh light vacuum, the STAND-IN stream's
// per-meeting rate); the vacuum's filter residual; the light's excess energy at the antipode after emission.
// Status: pass if E1 to E4 pass; partial if E1 to E3 pass; fail otherwise. A PASS says the rule's emission is the
// linear light's on the box and that light's long-ladder rate is the golden rule; it does NOT say the exact rule
// was run on a ladder long enough to show the exponential itself.
//
// Depth L2: lattice QED spontaneous emission with a STAND-IN atom, Wigner-Weisskopf's single-excitation reading.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { inverseDepthSpec, ladderBeat, ladderKernel, type LadderSpec } from '@/code/rule/plaquette-ladder'
import { atomBare, atomPopulation, atomTimes, goldenRule, ladderVacuum, singleExcitationDecay } from '@/code/measure/quantum-ladder'

const NS = [9, 11]
const L = 6
const BEATS = 30
const RING = 4096
const FIT = [20, 80] as const

function atomSpec(n: number): LadderSpec {
  const light = inverseDepthSpec(n, L, 'drift')
  const kappa = 2 / n
  const hop = Math.round((Math.acos(1 - 2 * kappa) * light.root) / (2 * Math.PI))

  return inverseDepthSpec(n, L, 'drift', hop)
}

export default experiment({
  id: 'gauge/ladder-emission',
  code: 'E-FRC-0233',
  title:
    'spontaneous emission into a propagating quantum light, a STAND-IN atom on the plaquette ladder: the pure excited atom gives its quantum to the ladder where the force-off light cannot take it, the exact rule follows the linear single-excitation light on a six-square box, and that light on a long ladder decays at the golden-rule rate',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    let e1 = true
    let e2 = true
    let e3 = true
    let e4 = true

    for (const n of NS) {
      const spec = atomSpec(n)
      const light = ladderKernel(inverseDepthSpec(n, L, 'drift'))
      const vac = ladderVacuum(light)
      const bare = atomBare(spec)
      const gr = goldenRule(spec, bare.gap, bare.dipole)
      const returnBeat = L / gr.velocity
      const model = singleExcitationDecay(spec, bare.gap, bare.dipole, L, BEATS)

      metrics[`vacuumResidualN${n}`] = vac.residual
      metrics[`gapN${n}`] = bare.gap
      metrics[`dipoleN${n}`] = bare.dipole
      metrics[`goldenRuleN${n}`] = gr.rate
      metrics[`returnBeatN${n}`] = returnBeat

      for (const forceOff of [false, true]) {
        const kernel = ladderKernel(spec, { forceOff })
        const v = atomTimes(bare.excited, vac.vacuum)
        const p: number[] = []

        for (let t = 0; t <= BEATS; t++) {
          p.push(atomPopulation(bare.excited, v))

          if (t === 1 && !forceOff) metrics[`freshRegisterLossN${n}`] = 1 - p[1]!

          ladderBeat(kernel, v.re, v.im)
        }

        if (forceOff) {
          const low = Math.min(...p)

          metrics[`forceOffLowestN${n}`] = low
          e2 &&= low >= 0.9
        } else {
          let crossing = -1

          for (let t = 0; t <= BEATS; t++) {
            if (p[t]! < 0.5) {
              crossing = t
              break
            }
          }

          let worst = 0

          for (let t = 0; t <= BEATS; t++) worst = Math.max(worst, Math.abs(p[t]! - model[t]!))

          metrics[`halfBeatN${n}`] = crossing
          metrics[`lowestN${n}`] = Math.min(...p)
          metrics[`ruleMinusModelN${n}`] = worst
          metrics[`populationAt10N${n}`] = p[10]!
          metrics[`populationAt20N${n}`] = p[20]!
          e1 &&= crossing >= 0 && crossing < returnBeat
          e3 &&= worst <= 0.04
        }
      }

      // E4: the long ladder, harmonic reading
      const long = singleExcitationDecay(spec, bare.gap, bare.dipole, RING, FIT[1])
      let sx = 0
      let sy = 0
      let sxx = 0
      let sxy = 0
      let count = 0

      for (let t = FIT[0]; t <= FIT[1]; t++) {
        const y = Math.log(long[t]!)

        sx += t
        sy += y
        sxx += t * t
        sxy += t * y
        count++
      }

      const slope = (count * sxy - sx * sy) / (count * sxx - sx * sx)
      const intercept = (sy - slope * sx) / count
      let residual = 0

      for (let t = FIT[0]; t <= FIT[1]; t++) residual = Math.max(residual, Math.abs(Math.log(long[t]!) - (intercept + slope * t)))

      metrics[`longRateN${n}`] = -slope
      metrics[`longRateOverGoldenN${n}`] = -slope / gr.rate
      metrics[`longFitResidualN${n}`] = residual
      e4 &&= residual < 0.02 && -slope / gr.rate >= 0.8 && -slope / gr.rate <= 1.25
    }

    const gates = { E1: e1, E2: e2, E3: e3, E4: e4 }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = Object.values(gates).every(v => v) ? 'pass' : e1 && e2 && e3 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `a pure excited STAND-IN atom on rung 0 gives its quantum to the ladder's own light: P_e falls below 1/2 at beat ${metrics.halfBeatN9} and ${metrics.halfBeatN11} (N = 9, 11; the quantum can return only after ${metrics.returnBeatN9!.toFixed(1)} and ${metrics.returnBeatN11!.toFixed(1)}) to ${metrics.lowestN9!.toFixed(3)} and ${metrics.lowestN11!.toFixed(3)}, while with the force step off it stays at ${metrics.forceOffLowestN9!.toFixed(3)} and ${metrics.forceOffLowestN11!.toFixed(3)} or above; the exact rule follows the linear single-excitation light of the same six-square box within ${metrics.ruleMinusModelN9!.toFixed(3)} and ${metrics.ruleMinusModelN11!.toFixed(3)} for ${BEATS} beats, and that light on ${RING} squares decays exponentially at ${metrics.longRateOverGoldenN9!.toFixed(3)} and ${metrics.longRateOverGoldenN11!.toFixed(3)} of the golden rule (${metrics.goldenRuleN9!.toFixed(4)}, ${metrics.goldenRuleN11!.toFixed(4)} per beat); the exact rule itself reaches only the box's vacuum Rabi exchange, not the exponential`,
      metrics,
      control: {
        forceOffLowestN9: metrics.forceOffLowestN9!,
        forceOffLowestN11: metrics.forceOffLowestN11!,
      },
      notes:
        "L2. FIRST RUN 2026-09-26 (tmp/frc0233.log, 263 s), PARTIAL: E1 to E3 pass, E4 fails on its linearity clause. No gate moved. E1: the pure excited atom's P_e falls below 1/2 at beats 10 and 13 (N = 9, 11), long before the quantum can return (22.3, 25.5), to 0.319 and 0.368. E2: with the force step off it never falls below 0.961 and 0.972. E3: the exact rule follows the linear single-excitation light of the same six-square box within 0.022 and 0.013 over 30 beats (the atom's gap 0.972 and 0.884, dipole 0.499; vacuum filter residuals 1.1e-2 and 3.4e-3). E4: on 4,096 squares the single-excitation reading loses its quantum at 0.904 and 0.866 of the golden rule over beats 20 to 80 (inside the 0.8 to 1.25 band), but ln P_e is NOT linear there (largest residual 1.22 and 0.43 against 0.02). DIAGNOSED AFTER THE RUN (tmp/qlad-probe11.ts): the decay comes in steps with a period of about 20 beats (N = 9: P_e 0.325, 0.311 at beats 15, 20; 0.028, 0.032 at 50, 60; 0.0068, 0.012 at 70, 80), which is 2 pi / (gap - omega_min): the atom sits 0.29 (N = 9) above the lower edge of the ladder's narrow waveguide band (0.68 to 1.36), and the band edge beats against the exponential, a non-Markovian structured-continuum effect the golden rule leaves out. An exponential needs the gap well inside a band wider than the ladder's, the husk's massless branch rather than the ladder's waveguide band. Fresh-register comparison (reported): one beat of a fresh light vacuum takes 0.0094 and 0.0056 of the quantum, the rate a stream of one-beat registers would give, eight to nine times below the ladder's, because a fresh register cannot build up the resonance a propagating light does. The streamed-register results' 4^-n (E-FRC-0224) is the fear beat's strong swap meeting and does not apply to this weak dipole. Probes before this file (tmp/qlad-probe6.ts, 8.ts, disclosed): the box's P_e at N = 9 and the single-excitation reading's agreement (0.022) and long-ring rate (0.904) were seen before the gates were written.",
    })
  },
})
