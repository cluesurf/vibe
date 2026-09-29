// E-FRC-0264: A BOUND PAIR DRIVEN BY THE LIGHT: DOES IT IONIZE ONLY ABOVE ITS BINDING ENERGY (THE PHOTOELECTRIC
// THRESHOLD)?
//
// THE QUESTION. E-SPN-0169's coupling is the shift of each member's Bloch momentum by the light's link angle, K -> K + qA
// (exact, 2.2e-15). E-SPN-0155's heavy love-fear pair is held by the husk Coulomb law in an isolated, isotropic, exactly
// held level (a_c 3.5: E-SPN-0155 C1). Driven by a long-wave photon at frequency w, does it come apart only when w exceeds
// the binding energy, at first order, as Einstein's photoelectric law says, with the rate the model's own golden rule
// gives (proportional to the field's intensity)?
//
// DERIVATION (written before the gate run; probes 2 and 4, disclosed below, were read first).
//
// 1. THE MODEL. E-SPN-0155's single-channel Floquet model of the heavy pair (code/measure/husk-meson floquetSpace): two
//    S-band members (ringUnit(1, 4), m 0.857072) in their relative coordinate on an N^3 husk torus, the kinetic band T(q)
//    = eps(q) + eps(-q) and the exact lattice Coulomb phase a beat, W = e^(-iV/2) e^(-iT) e^(-iV/2). A STAND-IN, as
//    E-SPN-0155 states: the potential is the static Green's function applied as a phase, and the flipped channels are left
//    out (the heavy member's channels are closed, E-SPN-0155 point 6, so leaving them out is exact for the bound state).
// 2. THE DRIVE. A uniform field A(t) along x shifts each member's momentum. The pair has opposite charges, so the
//    relative momentum shifts by A and the total by 0: T(q) -> T(q + A) = T + A dT/dq_x + (A^2 / 2) d^2T/dq_x^2 + O(A^3)
//    (the band's Taylor expansion, error 1e-6 at A 0.02, probe 2; the drive's A0 <= 0.01 keeps it under 1.3e-7). Total
//    momentum stays 0: the uniform field only moves the relative coordinate, which is the dipole approximation, exact
//    here because the field is uniform.
// 3. THE THRESHOLD. The bound level sits at E = 2m - E_b; the continuum at total K = 0 starts at 2m (the SS channel's
//    bottom). At first order a photon of frequency w carries the level to E + w, so it reaches the continuum only for
//    w > E_b. THE GOLDEN RULE: the first-order rate is Gamma(w) = 2 pi (A0 / 2)^2 |<k|dT/dq_x|b>|^2 rho(E + w), zero
//    for w < E_b, proportional to A0^2 above. Below threshold the pair can still ionize by two or more photons, at order
//    A0^4 and higher. PREDICTED: at A0 5e-3, the rate at w = 0.8 E_b is at least 100 times below the rate at 1.25 E_b;
//    doubling A0 multiplies the rate by 4 above threshold and by at least 12 below it.
// 4. THE READING. An absorbing shell beyond r 44 removes what leaves; the level's own tail beyond 44 is 4.8e-11 and its
//    loss undriven 1.4e-12 a beat (probe 4). The rate is the steady loss -ln(n_end / n_mid) / (t_end - t_mid) over the
//    run's second half, after a cosine ramp of 400 beats (its spectrum ends near 0.008, far below E_b 0.0474).
//
// GATES (pre-registered; tolerances set after probes 2 and 4, disclosed):
//   P1 threshold    rate(0.8 E_b) / rate(1.25 E_b) <= 1e-2 at A0 5e-3
//   P2 above        rate > 1e-7 a beat at 1.1, 1.25, 1.6 and 2.2 E_b at A0 5e-3 (open above threshold)
//   P3 first order  rate(A0 1e-2) / rate(A0 5e-3) at 1.25 E_b in [3.6, 4.4] (intensity)
//   P4 higher order rate(A0 1e-2) / rate(A0 5e-3) at 0.8 E_b >= 12 (not first order below threshold)
// CONTROLS:
//   C1 undriven     A0 = 0: rate <= 1e-11 a beat
//   C2 static field the same ramp to a static A0 5e-3 (a uniform static A is a gauge shift): rate <= 1e-9 a beat
//   C3 E-SPN-0155   the Floquet level reproduces E-SPN-0155's recorded a_c 3.5 energy E 1.66677892 to 1e-6 (its model at N 64)
//   C4 the model    the heavy pair's channels (E-SPN-0155 point 6): the level's distance to every open channel > 0.2
//
// PREDICTED VERDICT: PARTIAL. The first-order threshold is at the binding energy, the rate grows with intensity above it,
// and below it only higher orders act, as Einstein's law says. Partial because the pair is E-SPN-0155's static stand-in
// (a potential applied as a phase, the heavy swap-coin member, flipped channels omitted) and a uniform field (the photon's
// wave number neglected), not the register pair held by the dynamical light; and the golden-rule rate is compared in its
// form (zero below, A0^2 above), not its absolute value.
//
// PROBES, disclosed: tmp/cmp-probe2.log (N 64: the level E 1.66677892, E_b 0.047365; the absorber at r 20 ate the level's
// tail, 6.5e-4 lost per 250 beats undriven; the drive at 0.6 E_b lost more than undriven at A0 0.02, which is the
// two-photon channel; at 1.5 E_b the loss grew with A0); tmp/cmp-probe4.log (N 128, absorber r 44: tail 4.8e-11, undriven
// loss 1.4e-12 a beat, one beat 0.28 s). The box, the absorber, the frequencies and the tolerances were set from them.
//
// SMOKE (tmp/pe-smoke.log, 5 s, N 32, absorber r 12): every code path ran; the gates failed as expected on that box, the
// absorber eating 1.3e-2 of the level's tail (2.8e-4 a beat undriven, swamping every drive). Nothing changed after it.
//
// FIRST RUN (tmp/pe-exp-run1.log, 4,328 s): FAIL on P1 and P4, every control held. The level E 1.6667789236 (C3, recorded
// 1.66677892), E_b 0.047365, tail beyond r 44 4.8e-11, nearest open channel 0.239. Above threshold the drive ionizes at
// first order: 7.73e-6, 6.61e-6, 2.83e-6, 6.51e-6 a beat at 1.1, 1.25, 1.6, 2.2 E_b (P2), and doubling A0 at 1.25 E_b
// gives 3.990 (P3, the intensity). BELOW threshold, at 0.8 E_b, the loss is 3.97e-7 a beat, 0.060 of the rate at 1.25 E_b
// (P1 wanted <= 0.01), and it too scales as the intensity (4.11; P4 wanted >= 12): a FIRST-ORDER loss below the binding
// energy. The derivation's step 3 counted only the continuum; hydrogen also absorbs at its bound-bound lines, (1 - 1/n^2)
// E_b = 0.75, 0.889, ... E_b, and a line's excited state, diffuse, reaches the absorber. That reading is probe 5's, after
// the run (below); the fail stands. Undriven 1.42e-12, static field 1.25e-11 (C1, C2).
//
// PROBE 5, AFTER THE RUN (tmp/pe-probe5.log; moves no gate): at 0.5 E_b, below every bound-bound line, the rate is
// 1.5e-9 a beat, 4,300 times below the rate at 1.25 E_b. At 0.8 E_b with NO absorber, 2.4% of the ground level's weight
// has moved out of it after 1,200 beats (overlap^2 0.9758) while the norm is kept: a large bound-bound excitation, of
// which the absorber took only about 1.6e-4 in the run's window. So the below-threshold loss is the light exciting the
// pair's own excited levels near 0.8 E_b, the tails of which reach r 44, not ionization; the continuum threshold is at E_b,
// as derived, with the bound-bound lines below it as in hydrogen's absorption spectrum. (The probe's shell histogram
// overflowed its array and printed NaN; the overlap and the 0.5 E_b rate are unaffected.)

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { wrap } from '@/code/measure/dock-mixer'
import { coulombModel, floquetLevel, floquetSpace, huskGreenTable, pairChannels, channelGap } from '@/code/measure/husk-meson'
import { infiniteGreenZero } from '@/code/measure/husk-coulomb'
import { beyondRadius, photoDrive, photoSpace } from '@/code/measure/light-matter'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'

const HEAVY: readonly [number, number] = [1, 4]
const A_C = 3.5
const E_RECORDED = 1.66677892

export type PhotoPlan = { N: number; rAbs: number; beats: number; ramp: number; filter: number; lanczos: number; recordTolerance: number }

export const GATE_PLAN: PhotoPlan = { N: 128, rAbs: 44, beats: 1200, ramp: 400, filter: 512, lanczos: 200, recordTolerance: 1e-6 }

export const SMOKE_PLAN: PhotoPlan = { N: 32, rAbs: 12, beats: 120, ramp: 40, filter: 64, lanczos: 60, recordTolerance: 1 }

const flag = (b: boolean): number => (b ? 1 : 0)

export function photoelectricRun(plan: PhotoPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const m = wrap(unitAngle(ringUnit(HEAVY[0], HEAVY[1])) - Math.PI) / 2
  const alpha = (24 * Math.PI) / (Math.tan(m) * A_C)
  const G0 = infiniteGreenZero('husk', 64).value
  const table = huskGreenTable(64, 16, G0)
  const N = plan.N
  const ham = coulombModel({ m, alpha, table, N, K: [0, 0, 0], steps: plan.lanczos, start: A_C })
  const fs = floquetSpace({ m, alpha, table, N, K: [0, 0, 0] })
  const lv = floquetLevel(fs, ham.psi, new Float64Array(N * N * N), ham.E, plan.filter, 2)
  const E = lv.eps - alpha * G0
  const Eb = 2 * m - E
  const p = photoSpace(fs, m, plan.rAbs, 0.01)
  const tail = beyondRadius(p, lv.vr, lv.vi, plan.rAbs)

  log('level')

  const half = Math.round((plan.beats + plan.ramp) / 2)
  const rate = (A0: number, omega: number, still = false): number => {
    const [mid, end] = photoDrive({ p, vr: lv.vr, vi: lv.vi, A0, omega, beats: plan.beats, ramp: plan.ramp, marks: [half, plan.beats], still }) as [number, number]

    return -Math.log((1 - end) / (1 - mid)) / (plan.beats - half)
  }
  const at = (x: number, A0: number): number => rate(A0, x * Eb)
  const reads: Record<string, number> = {}
  const read = (name: string, v: number): number => {
    reads[name] = v
    log(name)
    return v
  }
  const below = read('rate_0.8_A5e-3', at(0.8, 5e-3))
  const below2 = read('rate_0.8_A1e-2', at(0.8, 1e-2))
  const above = read('rate_1.25_A5e-3', at(1.25, 5e-3))
  const above2 = read('rate_1.25_A1e-2', at(1.25, 1e-2))
  const open = [1.1, 1.6, 2.2].map(x => read(`rate_${x}_A5e-3`, at(x, 5e-3)))
  const undriven = read('rate_undriven', rate(0, 0.3))
  const still = read('rate_static', rate(5e-3, 0, true))

  const P1 = below / above <= 1e-2
  const P2 = [above, ...open].every(r => r > 1e-7)
  const P3 = above2 / above >= 3.6 && above2 / above <= 4.4
  const P4 = below2 / below >= 12
  const C1 = undriven <= 1e-11
  const C2 = still <= 1e-9
  const C3 = Math.abs(E - E_RECORDED) <= plan.recordTolerance
  const channels = pairChannels(m)
  const gap = Math.min(channelGap(E, channels, ['SS']).distance, channelGap(E + Math.PI, channels).distance)
  const C4 = gap > 0.2

  const gates = { P1, P2, P3, P4 }
  const controls = { C1, C2, C3, C4 }
  const all = Object.values(gates).every(Boolean) && Object.values(controls).every(Boolean)
  const e = (x: number): string => x.toExponential(2)

  return verdict({
    status: all ? 'partial' : 'fail',
    claim: `E-SPN-0155's heavy love-fear pair (E_b ${E_b(Eb)}) driven by a uniform light field, the coupling the shift of the relative momentum: above its binding energy it ionizes at first order (${[above, ...open].map(e).join(', ')} a beat at 1.25, 1.1, 1.6, 2.2 E_b), the rate growing as the intensity (doubling A0 gives ${(above2 / above).toFixed(3)}); at 0.8 E_b it loses ${e(below / above)} of that rate, scaling as the intensity too (${(below2 / below).toFixed(2)}), so a first-order loss below threshold ${P1 && P4 ? 'is absent' : 'is present'}; no loss undriven (${e(undriven)}) or under a static field (${e(still)}); a static stand-in pair and a uniform field`,
    metrics: { P1: flag(P1), P2: flag(P2), P3: flag(P3), P4: flag(P4), m, alpha, E, Eb, residual: lv.residual, tail, ...reads, belowOverAbove: below / above, aboveScaling: above2 / above, belowScaling: below2 / below },
    control: { C1: flag(C1), C2: flag(C2), C3: flag(C3), C4: flag(C4), gap },
    notes: `L2, deterministic (a placed Lanczos start, fixed frequencies; no draw). Gates ${JSON.stringify(gates)}, controls ${JSON.stringify(controls)}. Plan ${JSON.stringify(plan)}. Level E ${E.toFixed(10)} (recorded ${E_RECORDED}), residual ${e(lv.residual)}, tail beyond r ${plan.rAbs} ${e(tail)}, nearest open channel ${gap.toFixed(4)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

const E_b = (x: number): string => x.toFixed(6)

export default experiment({
  id: 'gauge/photoelectric-threshold',
  code: 'E-FRC-0264',
  title:
    "a Coulomb-bound pair driven by the light, fail on the first-order threshold gate: E-SPN-0155's heavy love-fear pair, the coupling the shift of its relative momentum, ionizes at first order above its binding energy with the rate growing as the field's intensity (doubling A0 gives 3.99), but at 0.8 E_b it also loses norm at first order, 0.06 of the above-threshold rate, which the derivation did not allow (it counted only the continuum; the bound-bound lines at (1 - 1/n^2) E_b are the candidate); a static stand-in pair in a uniform field",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return photoelectricRun(GATE_PLAN)
  },
})
