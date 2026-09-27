// The low-excitation restriction held to the exact rule (E-FRC-0236): a STAND-IN atom (an electron whose hop
// around the closed strip's circumference is recorded by rung 0's winding flux, code/rule/loop-ring) on the
// massless ring of E-FRC-0235, run two ways on the same six-square box: the exact rule on the full register
// space (every loop register a Z_N column, 2 N^6 states), and the restriction of code/measure/few-quanta (the
// harmonic reading, the light held to at most two quanta, the coupling's matrix elements exact within that
// sector, no rotating-wave cut).
//
// DERIVED before the first run.
//   (1) the restriction   The light alone keeps its number of quanta exactly in the harmonic reading (its beat
//                         is metaplectic, its Fock states are eigenstates), so the only approximations are the
//                         harmonic reading (the finite column, E-FRC-0231) and the weight the coupling
//                         e^(-i g x R) would send to three quanta. From the pure excited atom and the vacuum the
//                         three-quanta weight arises at third order in g |u| per beat, g |u| about 0.05 here
//   (2) agreement         So the restricted P_e(t) must follow the exact rule's to the harmonic reading's
//                         accuracy on this box (the vacuum's filter residual and the finite column): E-FRC-0233's
//                         cruder single-excitation reading followed the exact ladder within 0.013 to 0.022
//   (3) the control       With the force step off, the light's loops never change, the atom's channel is a mixture
//                         of unitaries and it cannot give its quantum away (E-FRC-0233 E2)
// The atom: hop = round(omega* M / 2 pi), omega* = the ring symbol at k = pi / 3, so the gap sits inside the
// massless band; split f / s near 1 (E-FRC-0234's rule on the ring, one link per square).
//
// Gates, fixed before the first run (no probe of this dynamics before this file):
// R1 agreement: at N = 9 and 11 on the six-square ring, |P_e(exact rule) - P_e(restriction)| <= 0.03 at every beat
//    t = 0 .. 40
// R2 the sector holds: the restriction's norm stays within 1e-4 of 1 over the 40 beats at N = 9 and 11
// R3 the control: with the force step off, the exact rule's P_e stays at or above 0.9 for 40 beats at N = 9 and 11
// Reported: the gap and dipole, the two-quanta weight, P_e at beats 10, 20, 40 both ways, the vacuum's filter
// residual, the golden-rule rate of the long ring for scale.
// Status: pass if R1 to R3 pass; partial if R2 and R3 pass and R1 passes at N = 11; fail otherwise.
//
// Depth L2: Wigner-Weisskopf beyond the rotating wave, in the model's column registers, with a STAND-IN atom.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { loopBeat, loopKernel, loopSplit, ringCurl, ringOmega, type LoopSpec } from '@/code/rule/loop-ring'
import { atomBare, atomPopulation, atomTimes } from '@/code/measure/quantum-ladder'
import { ringVacuum } from '@/code/measure/loop-spectrum'
import { fewQuanta, fewQuantaBeat, fewQuantaRead, fewQuantaRun, fewQuantaStart, ringAtomSpec, stripGoldenRule, stripModes } from '@/code/measure/few-quanta'

const NS = [9, 11]
const L = 6
const BEATS = 40
const AGREE = 0.03
const SECTOR = 1e-4

const ladderShape = (spec: LoopSpec) => ({ n: spec.n, plaquettes: spec.squares, root: spec.root, drift: spec.drift, force: spec.force, hop: spec.hop! })

export default experiment({
  id: 'gauge/few-quanta-restriction',
  code: 'E-FRC-0236',
  title:
    "the low-excitation restriction of the atom-light rule, held to the exact rule: on a six-square closed strip a STAND-IN atom's emission under the full register rule and under the light held to at most two quanta (the coupling's matrix elements exact, no rotating-wave cut) agree, the sector leaks nothing measurable, and the force-off light takes nothing",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    let r1 = true
    let r2 = true
    let r3 = true
    let r1at11 = true

    for (const n of NS) {
      const spec = ringAtomSpec(n, L)
      const { f, kappa } = loopSplit(spec)
      const bare = atomBare(ladderShape(spec))
      const vac = ringVacuum(spec)
      const g = (4 * Math.PI * spec.drift) / spec.root

      metrics[`gapN${n}`] = bare.gap
      metrics[`dipoleN${n}`] = bare.dipole
      metrics[`hopN${n}`] = spec.hop!
      metrics[`splitRatioN${n}`] = spec.force / spec.drift
      metrics[`vacuumResidualN${n}`] = vac.residual

      const exact: number[] = []
      const off: number[] = []

      for (const forceOff of [false, true]) {
        const kernel = loopKernel(spec, { forceOff })
        const v = atomTimes(bare.excited, vac.vacuum)

        for (let t = 0; t <= BEATS; t++) {
          ;(forceOff ? off : exact).push(atomPopulation(bare.excited, v))

          if (t < BEATS) loopBeat(kernel, v.re, v.im)
        }
      }

      const modes = stripModes({ n, squares: L, f, js: [1, 2, 3, 4, 5], omegaOf: k => ringOmega(kappa, k) })
      const q = fewQuanta({ omega: modes.omega, u: modes.u, g, hop: spec.hop!, drift: spec.drift, root: spec.root })
      const run = fewQuantaRun(q)
      const restricted: number[] = []
      let normWorst = 0
      let twoMax = 0

      fewQuantaStart(q, run, bare.excited)

      for (let t = 0; t <= BEATS; t++) {
        const read = fewQuantaRead(q, run, bare.excited)

        restricted.push(read.population)
        normWorst = Math.max(normWorst, Math.abs(read.norm - 1))
        twoMax = Math.max(twoMax, read.two)

        if (t < BEATS) fewQuantaBeat(q, run)
      }

      let worst = 0

      for (let t = 0; t <= BEATS; t++) worst = Math.max(worst, Math.abs(exact[t]! - restricted[t]!))

      metrics[`ruleMinusRestrictionN${n}`] = worst
      metrics[`sectorNormDriftN${n}`] = normWorst
      metrics[`twoQuantaWeightMaxN${n}`] = twoMax
      metrics[`forceOffLowestN${n}`] = Math.min(...off)

      for (const t of [10, 20, 40]) {
        metrics[`ruleP${t}N${n}`] = exact[t]!
        metrics[`restrictionP${t}N${n}`] = restricted[t]!
      }

      metrics[`ruleLowestN${n}`] = Math.min(...exact)
      metrics[`goldenRuleN${n}`] = stripGoldenRule({ n, f, kappa, g, dipole: bare.dipole, gap: bare.gap, curl: ringCurl, curlSlope: k => 2 * Math.sin(k) }).rate

      r1 &&= worst <= AGREE
      r2 &&= normWorst <= SECTOR
      r3 &&= Math.min(...off) >= 0.9

      if (n === 11) r1at11 = worst <= AGREE
    }

    const gates = { R1: r1, R2: r2, R3: r3 }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = r1 && r2 && r3 ? 'pass' : r2 && r3 && r1at11 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `on the six-square closed strip a pure excited STAND-IN atom (gap ${metrics.gapN9!.toFixed(4)} and ${metrics.gapN11!.toFixed(4)}, dipole ${metrics.dipoleN9!.toFixed(3)} and ${metrics.dipoleN11!.toFixed(3)} at N = 9, 11) loses its quantum under the exact register rule to P_e ${metrics.ruleLowestN9!.toFixed(3)} and ${metrics.ruleLowestN11!.toFixed(3)} within 40 beats, and the restriction to at most two quanta follows it within ${metrics.ruleMinusRestrictionN9!.toFixed(4)} and ${metrics.ruleMinusRestrictionN11!.toFixed(4)} at every beat, its norm within ${Math.max(metrics.sectorNormDriftN9!, metrics.sectorNormDriftN11!).toExponential(1)} of 1 (two-quanta weight at most ${Math.max(metrics.twoQuantaWeightMaxN9!, metrics.twoQuantaWeightMaxN11!).toExponential(1)}); with the force step off P_e stays at ${metrics.forceOffLowestN9!.toFixed(3)} and ${metrics.forceOffLowestN11!.toFixed(3)} or above`,
      metrics,
      control: { forceOffLowestN9: metrics.forceOffLowestN9!, forceOffLowestN11: metrics.forceOffLowestN11! },
      notes:
        "L2. FIRST RUN 2026-09-26 (tmp/frc0236.log, 346 s), FAIL on all three gates. No gate moved. The exact register rule does show emission into the massless light: P_e falls to 0.376, 0.066 at beats 10, 20 (N = 9) and 0.455, 0.107 (N = 11), then the six-square box gives it back (0.892 and 0.553 at beat 40), the box's vacuum Rabi exchange. R1: the two-quantum restriction follows the rule at first (0.404 and 0.035 against 0.376 and 0.066 at N = 9, 0.473 and 0.112 against 0.455 and 0.107 at N = 11), but misses by 0.232 and 0.133 at worst, late in the run. R2: its norm drifts by 0.263 and 0.185 (the two-quanta weight reaches 0.121 and 0.110), so a quarter of the state leaves the sector: the restriction is NOT the rule here. DIAGNOSED AFTER THE RUN (arithmetic from the run's own numbers, disclosed): derivation (1) assumed a weak coupling (g |u| about 0.05), but with the column-balanced split at these shallow columns g = 4 pi c / M = 0.31 and 0.23, and the rung's summed mode amplitude sqrt(sum |u_k|^2) is about 1.0, so the per-beat displacement on the x = 1 branch is about 0.3: a STRONG coupling, whose counter-rotating and dressing terms fill two quanta within a few beats and three quanta after that. The balanced split raises the charge's coupling (g grows with c, E-FRC-0230's remark that the split bears on alpha), and at N = 9 and 11 that puts the atom outside the regime any few-quanta restriction can hold. R3: with the force step off P_e dips to 0.813 and 0.830, under the 0.9 gate. The gate's derivation (3), carried from E-FRC-0233 E2, was WRONG: a mixture of unitaries is unital, and a unital channel can lower P_e toward 1/2, just never below. It cannot give its quantum away, only dephase it, and 0.81 is that dephasing under g |u| about 0.3 (the ladder's 0.96 in E-FRC-0233 came from its weaker drift-carried coupling). So this file fails, and what it establishes is a limit: the two-quantum restriction is validated nowhere at the columns the exact rule can reach (N <= 11 on six squares). E-FRC-0237's long-ring runs at N = 25 and 49 therefore rest on the harmonic reading and the restriction without an exact-rule check at their own coupling.",
    })
  },
})
