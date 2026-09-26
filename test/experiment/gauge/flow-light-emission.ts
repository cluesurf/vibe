// Spontaneous emission into the flow light (E-FRC-0228), on E-FRC-0227's exact lattice QED.
//
// THE QUESTION. E-FRC-0224 made a pure excited stand-in decay only through a light of streamed vibe registers met
// by the swap phase, which is no flow light; E-FRC-0226 proved that a Gauss-safe meeting with fresh flow
// registers at a fixed dock is unital, so it can never make anything decay. E-FRC-0226's way out was memory: the
// light's own step turning flow into angle between two reads. Lattice QED has exactly that: the plaquette term.
//
// THE SETUP (two husk squares sharing a rung, code/rule/lattice-qed and code/measure/flow-light-emission). The
// first square holds the STAND-IN atom: a static charge at dock 0, one electron crossing the square's four links
// (the flow records every crossing), and the square's own loop m_A. The second square's loop m_B is the light
// register. The only factor that reads both is the rung's electric phase zeta^(-c bal(m_A - m_B)^2): the
// coupling, diagonal in both. Each COLLISION runs K beats of the exact rule with a fresh register in the lowest
// state of its own generator, then the register is traced out: the stream copies it away (a STAND-IN for light
// propagating off, as E-FRC-0224's registers). N = 3, 5, 7; the beat's phases are zeta_M powers with M = 48 N
// (s = 8, so every beat is small and energies are those of the generator the beat approximates, no Floquet wrap);
// the hop z = zeta_M^(2N), c = r = 1.
//
// DERIVED before the first run.
//   the record light   With the register's plaquette step off, the register is only read (the rung phase is
//                      diagonal in m_B, nothing changes m_B): each register value picks one unitary on the atom,
//                      so the atom's channel is a mixture of unitaries, UNITAL, exactly (E-FRC-0229 R4 proves the
//                      block structure exactly). It can dephase and scramble the atom, never cool it
//   the flow light     With the plaquette step on, the register is read, turned (flow to angle), and read again
//                      within one collision: memory, so the channel may be non-unital, and with the register in
//                      its lowest state, energy can flow from the atom into the register and leave with it
//   the golden rule    For a short collision the transfer e -> g is second order in the coupling. "The golden
//                      rule of this small system" is the first-order (Born) amplitude summed over the register's
//                      final states, read as a derivative of the rule with the rung's coupling scaled by lambda
//                      (measurement only; lambda = 1 is the rule). Exact / Born -> 1 as the collision shortens
//   the semiclassical  The mean-field rule keeps the joint state a product and lets each side see the other's
//       rule           average (Hartree): it acts on the atom by a unitary, so a pure atom stays pure and cannot
//                      decay into a mixture. The atom is DRESSED by the register vacuum's static field (the rung
//                      energy averaged over the vacuum is part of the atom's generator, the coupling left over has
//                      zero mean), so the mean-field atom moves only through the register's response
//
// DISCLOSED: four probes ran before this file (tmp/lqed-probe3.log to tmp/lqed-probe6.log). They showed that a
// one-beat collision with the zero-field register |B = 0> dephases the atom as fast as the unital control and
// cools it by only 1e-5 per collision (a hot, broadband register); that quasi-energies wrap at M = 6N; that with
// the register's lowest state and a contact of 16 or 32 beats the atom cools (undressed atom: ground population
// after 40 collisions 0.57 and 0.82 at N = 5, 7, against 0.15 and 0.16 for the record control); that for a
// 4-beat collision exact / Born for e -> g is 0.915 to 1.008 at s = 8 and 0.978 to 1.001 at s = 16 (undressed);
// and that the UNDRESSED mean-field atom stays pure but gains ground population coherently (up to 0.24). The
// dressing was chosen after that probe; no dressed configuration ran before these gates were written.
//
// Gates, fixed before the first run (the emission run: s = 8, K = 32, 40 collisions; the golden rule: K = 4 at
// s = 8 and s = 16):
// E0 the float measurement is the exact rule: at N = 3, s = 8, one 4-beat collision from 3 joint basis states,
//    the float state equals the exact Z[zeta_M] state to 1e-12
// E1 emission: at N = 5 and 7, from the first excited atom state the ground population after 40 collisions is at
//    least 0.3 and at least twice the record control's; from the maximally mixed atom the flow light lowers the
//    atom's energy by at least a quarter of the gap between its infinite-temperature mean and its ground energy,
//    while the record control changes it by at most 1e-9; the register leaving the first collision from the
//    excited state carries more energy than it came with (at every N)
// E2 semiclassical: over 40 mean-field collisions from the first excited state the atom's purity stays above
//    1 - 1e-9 (every N), and at N = 5 and 7 its ground population never exceeds 0.1
// E3 the golden rule: for the 4-beat collision, exact / Born for the e -> g transfer lies in [0.95, 1.05] at
//    s = 16 for N = 3, 5, 7, and |ratio - 1| at s = 16 is at most its value at s = 8 for each N
// E4 the record light is unital: sum K K^dag = 1 to 1e-12 for the record control at every N and every contact,
//    and the flow light misses it by more than 1e-6
// Reported: exact / Born for the long (32-beat) collision, the per-collision loss from the excited state, the
// zero-field register's cooling, N = 3's emission numbers.
// Status: pass if E0 to E4 pass; partial if E0, E3 and E4 pass; fail otherwise.
//
// Depth L2: Kogut-Susskind QED on two plaquettes with STAND-IN matter, a collision model of the light's escape
// (a STAND-IN for propagation), time-dependent perturbation theory and channel theory; husk squares only.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { weyl } from '@/code/tool/weyl'
import { exactBasis, exactToFloat, runExact, type BeatSpec } from '@/code/rule/lattice-qed'
import {
  applyChannel,
  bornTransfer,
  collide,
  collisionBeat,
  collisionKraus,
  emissionSetup,
  expectation,
  meanFieldCollision,
  population,
  projector,
  purity,
  unitalDefect,
  zeroMatrix,
  type Matrix,
  type Vector,
} from '@/code/measure/flow-light-emission'

const MODULI = [3, 5, 7]
const COLLISIONS = 40
const LONG = 32
const SHORT = 4

const specOf = (n: number, s: number): BeatSpec => ({ m: 6 * n * s, hop: 2 * n, electric: 1, magnetic: 1 })

function reducedRegister(joint: { re: Float64Array; im: Float64Array }, n: number): Matrix {
  const d = joint.re.length / n
  const rho = zeroMatrix(n)

  for (let f = 0; f < n; f++) {
    for (let g = 0; g < n; g++) {
      let re = 0
      let im = 0

      for (let a = 0; a < d; a++) {
        const xr = joint.re[a * n + f]!
        const xi = joint.im[a * n + f]!
        const yr = joint.re[a * n + g]!
        const yi = joint.im[a * n + g]!

        re += xr * yr + xi * yi
        im += xi * yr - xr * yi
      }

      rho.re[f * n + g] = re
      rho.im[f * n + g] = im
    }
  }

  return rho
}

export default experiment({
  id: 'gauge/flow-light-emission',
  code: 'E-FRC-0228',
  title:
    'spontaneous emission into the flow light: in exact lattice QED on two husk squares, a STAND-IN atom meeting fresh plaquette registers (STAND-IN for the light leaving) decays toward its ground state and cools from the maximally mixed state only when the register has its plaquette step (memory, flow turned to angle between two reads); the record light (plaquette step off) is exactly unital, the mean-field rule keeps the atom pure, and short collisions follow the first-order (golden-rule) transfer',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}

    // E0
    let e0Deviation = 0
    {
      const n = 3
      const spec = specOf(n, 8)
      const set = emissionSetup(n, spec)
      const steps = collisionBeat(set.sector, spec)

      for (let k = 1; k <= 3; k++) {
        const i = Math.floor(weyl(k) * set.sector.size)
        const exact = exactToFloat(runExact(steps, exactBasis(spec.m, i), SHORT), set.sector.size)
        const atom: Vector = { re: new Float64Array(set.atomSector.size), im: new Float64Array(set.atomSector.size) }
        const register: Vector = { re: new Float64Array(n), im: new Float64Array(n) }

        atom.re[Math.floor(i / n)] = 1
        register.re[i % n] = 1

        const float = collide(steps, spec, SHORT, atom, register)

        for (let j = 0; j < float.re.length; j++) e0Deviation = Math.max(e0Deviation, Math.abs(float.re[j]! - exact.re[j]!), Math.abs(float.im[j]! - exact.im[j]!))
      }
    }

    metrics.exactFloatDeviation = e0Deviation

    let e1 = true
    let e2 = true
    let e3 = true
    let e4 = true

    for (const n of MODULI) {
      const spec = specOf(n, 8)
      const set = emissionSetup(n, spec)
      const d = set.atomSector.size
      const g = set.atom.vectors[0]!
      const e = set.atom.vectors[1]!
      const vacuum = set.register.vectors[0]!
      const flow = collisionBeat(set.sector, spec)
      const record = collisionBeat(set.sector, spec, { registerMagnetic: false })
      const flowKraus = collisionKraus(flow, spec, LONG, d, vacuum)
      const recordKraus = collisionKraus(record, spec, LONG, d, vacuum)
      const mixed = zeroMatrix(d)

      for (let i = 0; i < d; i++) mixed.re[i * d + i] = 1 / d

      let fromE = projector(e)
      let fromERecord = projector(e)
      let fromMixed = mixed
      let fromMixedRecord = mixed
      const lossFirst = 1 - population(applyChannel(flowKraus, fromE), e)

      for (let c = 0; c < COLLISIONS; c++) {
        fromE = applyChannel(flowKraus, fromE)
        fromERecord = applyChannel(recordKraus, fromERecord)
        fromMixed = applyChannel(flowKraus, fromMixed)
        fromMixedRecord = applyChannel(recordKraus, fromMixedRecord)
      }

      const ground = set.atom.values[0]!
      const hot = expectation(mixed, set.atomH)
      const groundFlow = population(fromE, g)
      const groundRecord = population(fromERecord, g)
      const coolFlow = hot - expectation(fromMixed, set.atomH)
      const coolRecord = hot - expectation(fromMixedRecord, set.atomH)
      // the register's energy after the first collision from e
      const joint = collide(flow, spec, LONG, e, vacuum)
      const registerGain = expectation(reducedRegister(joint, n), set.registerH) - set.register.values[0]!

      // E2: mean field
      let atom = e
      let minPurity = 1
      let maxGround = 0

      for (let c = 0; c < COLLISIONS; c++) {
        atom = meanFieldCollision(flow, spec, LONG, atom, vacuum).atom

        const p = projector(atom)

        minPurity = Math.min(minPurity, purity(p))
        maxGround = Math.max(maxGround, population(p, g))
      }

      // E3: the golden rule for short collisions, and the long one reported
      const ratios: number[] = []

      // s = 32 and 64 ADDED AFTER THE FIRST RUN, a reading only (E3 reads ratios[0] and ratios[1], s = 8 and 16)
      for (const s of [8, 16, 32, 64]) {
        const specS = specOf(n, s)
        const setS = emissionSetup(n, specS)
        const eS = setS.atom.vectors[1]!
        const gS = setS.atom.vectors[0]!
        const vacS = setS.register.vectors[0]!
        const kraus = collisionKraus(collisionBeat(setS.sector, specS), specS, SHORT, d, vacS)
        const exact = population(applyChannel(kraus, projector(eS)), gS)
        const born = bornTransfer(setS.sector, specS, SHORT, eS, vacS, gS, setS.mean)

        ratios.push(exact / born)
        metrics[`goldenRuleExactN${n}S${s}`] = exact
        metrics[`goldenRuleBornN${n}S${s}`] = born
      }

      const longExact = population(applyChannel(flowKraus, projector(e)), g)
      const longBorn = bornTransfer(set.sector, spec, LONG, e, vacuum, g, set.mean)

      // E4
      const defects = [SHORT, LONG].map(K => [unitalDefect(collisionKraus(record, spec, K, d, vacuum)), unitalDefect(collisionKraus(flow, spec, K, d, vacuum))])

      // reading: the zero-field register
      const zero: Vector = { re: new Float64Array(n).fill(1 / Math.sqrt(n)), im: new Float64Array(n) }
      let zeroMixed = mixed
      const zeroKraus = collisionKraus(flow, spec, LONG, d, zero)

      for (let c = 0; c < COLLISIONS; c++) zeroMixed = applyChannel(zeroKraus, zeroMixed)

      Object.assign(metrics, {
        [`groundFromExcitedFlowN${n}`]: groundFlow,
        [`groundFromExcitedRecordN${n}`]: groundRecord,
        [`coolingFlowN${n}`]: coolFlow,
        [`coolingRecordN${n}`]: coolRecord,
        [`hotMinusGroundN${n}`]: hot - ground,
        [`registerEnergyGainN${n}`]: registerGain,
        [`lossFirstCollisionN${n}`]: lossFirst,
        [`meanFieldMinPurityN${n}`]: minPurity,
        [`meanFieldMaxGroundN${n}`]: maxGround,
        [`goldenRuleRatioN${n}S8`]: ratios[0]!,
        [`goldenRuleRatioN${n}S16`]: ratios[1]!,
        [`goldenRuleRatioN${n}S32`]: ratios[2]!,
        [`goldenRuleRatioN${n}S64`]: ratios[3]!,
        [`longCollisionRatioN${n}`]: longExact / longBorn,
        [`recordUnitalDefectN${n}`]: Math.max(defects[0]![0]!, defects[1]![0]!),
        [`flowUnitalDefectN${n}`]: Math.min(defects[0]![1]!, defects[1]![1]!),
        [`zeroFieldCoolingN${n}`]: hot - expectation(zeroMixed, set.atomH),
        [`atomGapN${n}`]: set.atom.values[1]! - ground,
      })

      if (n !== 3) {
        e1 &&= groundFlow >= 0.3 && groundFlow >= 2 * groundRecord && coolFlow >= 0.25 * (hot - ground) && Math.abs(coolRecord) <= 1e-9
        e2 &&= maxGround <= 0.1
      }

      e1 &&= registerGain > 0
      e2 &&= minPurity >= 1 - 1e-9
      e3 &&= ratios[1]! >= 0.95 && ratios[1]! <= 1.05 && Math.abs(ratios[1]! - 1) <= Math.abs(ratios[0]! - 1)
      e4 &&= defects.every(([r, f]) => r! <= 1e-12 && f! > 1e-6)
    }

    const gates = { E0: e0Deviation <= 1e-12, E1: e1, E2: e2, E3: e3, E4: e4 }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = Object.values(gates).every(v => v) ? 'pass' : gates.E0 && gates.E3 && gates.E4 ? 'partial' : 'fail'
    const f = (x: number | undefined, k = 3): string => (x ?? NaN).toFixed(k)

    return verdict({
      status,
      claim: `a STAND-IN atom on one husk square meeting fresh plaquette registers of Z_N lattice QED (N = 3, 5, 7, 32-beat collisions, 40 of them): with the register's plaquette step the ground population from the first excited state reaches ${f(metrics.groundFromExcitedFlowN3)}, ${f(metrics.groundFromExcitedFlowN5)}, ${f(metrics.groundFromExcitedFlowN7)} (record light ${f(metrics.groundFromExcitedRecordN3)}, ${f(metrics.groundFromExcitedRecordN5)}, ${f(metrics.groundFromExcitedRecordN7)}) and the maximally mixed atom loses ${f(metrics.coolingFlowN5, 2)} and ${f(metrics.coolingFlowN7, 2)} of energy at N = 5, 7 (of ${f(metrics.hotMinusGroundN5, 2)}, ${f(metrics.hotMinusGroundN7, 2)} above ground; record light ${Math.max(Math.abs(metrics.coolingRecordN5!), Math.abs(metrics.coolingRecordN7!)).toExponential(1)}, exactly unital to ${Math.max(metrics.recordUnitalDefectN3!, metrics.recordUnitalDefectN5!, metrics.recordUnitalDefectN7!).toExponential(1)}), the leaving register carrying ${f(metrics.registerEnergyGainN7, 2)} (N = 7); the mean-field rule keeps the atom pure (${f(1 - Math.min(metrics.meanFieldMinPurityN3!, metrics.meanFieldMinPurityN5!, metrics.meanFieldMinPurityN7!), 12)} lost) with ground population at most ${f(Math.max(metrics.meanFieldMaxGroundN5!, metrics.meanFieldMaxGroundN7!))}; a 4-beat collision transfers e -> g at ${f(metrics.goldenRuleRatioN3S16, 4)}, ${f(metrics.goldenRuleRatioN5S16, 4)}, ${f(metrics.goldenRuleRatioN7S16, 4)} of the first-order golden rule at s = 16 (${f(metrics.goldenRuleRatioN3S8, 4)}, ${f(metrics.goldenRuleRatioN5S8, 4)}, ${f(metrics.goldenRuleRatioN7S8, 4)} at s = 8), outside E3's band of 0.95 to 1.05, so E3 fails; the ratio falls to 1 as 1/s^2 (${f(metrics.goldenRuleRatioN3S64, 4)}, ${f(metrics.goldenRuleRatioN5S64, 4)}, ${f(metrics.goldenRuleRatioN7S64, 4)} at s = 64, a reading added after the first run); the long collision runs at ${f(metrics.longCollisionRatioN5)}, ${f(metrics.longCollisionRatioN7)} of it (strong coupling); at N = 3 the Z_3 light does not cool the excited atom (ground ${f(metrics.groundFromExcitedFlowN3)} against the record light's ${f(metrics.groundFromExcitedRecordN3)})`,
      metrics,
      control: {
        groundFromExcitedRecordN7: metrics.groundFromExcitedRecordN7!,
        coolingRecordN7: metrics.coolingRecordN7!,
        recordUnitalDefectN7: metrics.recordUnitalDefectN7!,
      },
      notes:
        'L2. FIRST RUN 2026-09-26 (tmp/frc0228.log), FAIL on E3 only, 0.6 s; FINAL RUN (tmp/frc0228-final.log) reproduces every number. SECOND RUN (tmp/frc0228-second.log), same verdict, with golden-rule readings at s = 32 and 64 ADDED AFTER THE FIRST RUN (no gate changed; the claim text rewritten to state the failure). Probes before the file are disclosed in the header; the dressing of the atom by the register vacuum\'s static field was chosen after the undressed probe, and E3\'s band was set from undressed probe numbers (0.978 to 1.001 at s = 16), which the dressed split does not reproduce: that band is the gate that failed. E0: the float collision equals the exact Z[zeta_M] rule to 7.8e-16. E1 (N = 5, 7): from the first excited state the ground population after 40 collisions is 0.575 and 0.828 with the flow light against 0.153 and 0.159 for the record light (plaquette step off); from the maximally mixed atom the flow light removes 13.13 and 21.63 of energy (of 24.09 and 44.88 above ground), the record light 7.9e-12 and 1.6e-11 (unital); the register leaving the first collision carries 0.003, 0.21, 0.86 more energy than it came with at N = 3, 5, 7. E2: the mean-field atom stays pure to 2e-12 and its ground population never exceeds 0.006, 0.010, 0.087. E3: exact / Born for a 4-beat collision 28.67, 6.56, 2.32, 1.33 at N = 3; 1.49, 1.12, 1.031, 1.008 at N = 5; 1.19, 1.050, 1.013, 1.003 at N = 7 for s = 8, 16, 32, 64: the first-order golden rule is reached as 1/s^2 (the second-order correction per collision falls as the square of the per-collision coupling), slowly at N = 3, where the dressed e -> g element nearly vanishes and two-step transfer dominates. E4: the record light is unital to 2.4e-14, the flow light misses by 1.4e-4 to 3.0e-3. Readings: the long collision transfers at 14.5, 0.556, 0.707 of first order (strong coupling); the zero-field register |B = 0> also cools the mixed atom (1.93, 3.71, 6.60) but the probes before this file found it dephasing-dominated at short contact; at N = 3 the Z_3 light does not cool the excited atom (ground 0.015 against 0.041 for the record light), because its register is too coarse. KEY: SPONTANEOUS EMISSION INTO THE FLOW LIGHT EXISTS in exact Gauss-safe lattice QED: a STAND-IN excited atom relaxes toward its ground state and the maximally mixed atom cools, only when the light register has its plaquette step (memory); a record light is exactly unital and cannot; the mean-field rule keeps the atom pure and nearly still. E-FRC-0226\'s unital obstruction is lifted by exactly its predicted route (c), the plaquette term. The escape of the light is a STAND-IN (fresh registers), and the golden-rule band gate failed on the dressed split.',
    })
  },
})
