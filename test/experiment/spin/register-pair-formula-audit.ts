// IS THE REFERENCE FORMULA MISSING A FIRST-ORDER TERM? (E-SPN-0209, OPEN-MOT-01). The light register pair's R_full is
// compared with E-SPN-0155's static formula plus E-SPN-0169's Darwin exchange, R = (2 tan m + (5/3) E_b - (8/3) E_b S)
// / (2m - E_b) per beat, whose limit is the lone member's tan m / m. E-SPN-0208 found the excess left after removing the
// light's contact well falls only as about 1/a_B (R_full - tan m / m 0.158 at a_B 8, 0.107 at a_B 12), first order in
// the coupling at fixed member mass. Before any new physics, this file audits the formula for a term of that order.
//
// THE AUDIT, ANALYTIC (before any number below was computed). Write the pair's band at total momentum K as the members'
// exact bands averaged over the level's relative-momentum density, plus whatever the binding carries:
//   a = (1/4) < E_m''_xx(p) >   (code/measure/lattice-pair-inertia), R = c*^2 / (2 a E)
//   1. THE BAND'S NON-QUADRATIC TERMS. The formula takes E_m = sqrt(m^2 + p^2) to first order in p^2. The member's
//      exact band differs from that at order p^2 (its own curvature of curvature, and the lattice's cubic anisotropy
//      at order p^4), so the correction to a is of relative order <p^2> ~ 1 / a^2: SECOND order in the coupling.
//   2. THE REGISTER. The band above is the register member's own (E-SPN-0160's Dirac phase), partner included, so the
//      register adds nothing beyond item 1.
//   3. RECOIL. The members are equal, each carries K / 2; the formula's 2 tan m already counts both. No term.
//   4. THE BINDING'S SHARE OF INERTIA. E_b enters numerator and denominator, and E_b ~ 1 / a_B^2: second order. The
//      formula's virial T = E_b differs from the level's true kinetic energy where the binding is not Coulombic (the
//      levels bind 1.6 to 2.2 times hydrogen's), but T and E_b are both of order 1 / a_B^2: still second order.
//   5. THE DARWIN EXCHANGE, (8/3) E_b S, is second order by the same count.
//   So every term of the static-plus-Darwin class is even in the relative momentum and of order 1 / a_B^2 or higher.
//   A term of order 1 / a_B needs an expectation FIRST order in the pull times a lattice-scale factor, an inertia the
//   pull itself carries (its own momentum, retardation, the pair and its light as one dynamics), which the static class
//   omits by construction. PREDICTION: the audit finds no first-order term; the exact-band correction (item 1, computed)
//   moves the prediction by under 0.01 at a_B 8 and 12, fails the 0.02 gate, and leaves the remainder's exponent at
//   -1 +- 0.5.
//
// THE CORRECTED FORMULA (pre-registered). For each recorded level (cycle phase E, Darwin S, both from its saved read):
//   E_b = 2 M0 - E (cycle); radius a = 1 / sqrt(2 mu E_b) (the hydrogenic radius of the level's own binding)
//   a_kin = latticePairCurvature(M0, a) ; R_kin = c*^2 / (2 a_kin E)
//   R_full,pred = R_kin - (8/3) e_b S / (2m - e_b), e_b = E_b / 2 per beat (E-SPN-0169's Darwin term, unchanged)
// and the current prediction it replaces, R_full,old = darwinR(m, e_b, S, 1).
//
// GATES (fixed before the comparison). The four points: the rule's count at a_B 8 and 12 (E-SPN-0200, tmp/track-a8.json
// and track-a12.json) and the contact well removed at a_B 8 and 12 (E-SPN-0206 and E-SPN-0208, tmp/spn-core-soften-a8
// and -a12.json). The current gap at each is |R_full,recorded - R_full,old|.
//   PASS     |R_full,pred - R_full,recorded| <= 0.02 at all four
//   PARTIAL  |R_full,pred - R_full,recorded| <= half the current gap at all four
//   FAIL     otherwise
//   INSTRUMENT (not hard): with the radius 1000 the quadrature's a equals the member's a / 2 (setup's aMember) within
//   1e-4 relative; the grid doubled (800 radial points, 400 directions) moves every R_kin by under 1e-4.
//   READ: the same at the reference's radius a_B; the rule's a_B 6 point; the remainder's exponent, the log slope of
//   R_full,recorded - R_full,pred from a_B 8 to 12 on the softened count (predicted -1 +- 0.5).
//
// FIRST RUN (2026-10-20, tmp/spn-0209-run1.log, 5.3 s): FAIL, as predicted. No gate moved and none was rerun.
//  - Instrument holds: at radius 1000 the quadrature's a is the member's a / 2 to 1.5e-6; the doubled grid moves no
//    R_kin by 1e-4.
//  - The exact band raises the reference R_full from 1.0671 to 1.0819 (rule a_B 8), 1.0661 to 1.0719 (rule a_B 12),
//    1.0670 to 1.0811 (softened a_B 8), 1.0661 to 1.0718 (softened a_B 12), against the recorded 1.4758, 1.2347,
//    1.2237, 1.1730. The gaps go 0.409 to 0.394, 0.169 to 0.163, 0.157 to 0.143, 0.107 to 0.101: no point within
//    0.02 and none within half its old gap. The shift is 0.0148 at a_B 8 and 0.0057 at a_B 12, falling as about
//    a_B^-2.3: second order, as the audit derived (its size at a_B 8 is above the predicted 0.01; the order is not).
//  - Read: the rule's a_B 6 point moves from 1.069 to 1.098 against the recorded 2.611; at the reference's radius a_B
//    (a looser density) the shifts are smaller still (1.059 to 1.065).
//  - The remainder, recorded minus corrected on the softened count, is 0.1426 and 0.1012: exponent -0.85, inside the
//    predicted -1 +- 0.5.
// MEANING. The static-plus-Darwin formula is not missing a first-order term: every piece of the static class, the
// band's non-quadratic terms and the register included, is second order, and the exact band changes the reference by
// 1% or less. The remainder that falls as about 1/a_B is inertia the static class leaves out by construction, carried
// by the binding itself, which points at the pair and its light as one dynamics (the Darwin term's linear response
// is the only place the light's momentum enters now).
//
// Depth L2 (a formula audit on recorded levels; no engine run). DETERMINISM: a fixed quadrature, no random numbers.

import { readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { darwinR } from '@/code/measure/darwin-exchange'
import {
  bindingRadius,
  latticePairCurvature,
  pairR,
} from '@/code/measure/lattice-pair-inertia'
import { setup } from '@/code/measure/register-track'

const TMP =
  '/Users/lancepollard/base/crew/cluesurf/deck/vibe.worktree/experiment/moving-matter/tmp'
const PASS_BAND = 0.02
const INSTRUMENT = 1e-4

type Point = { name: string; aB: number; file: string; gated: boolean }

const POINTS: readonly Point[] = [
  { name: 'rule_a6', aB: 6, file: 'track-a6.json', gated: false },
  { name: 'rule_a8', aB: 8, file: 'track-a8.json', gated: true },
  { name: 'rule_a12', aB: 12, file: 'track-a12.json', gated: true },
  { name: 'soften_a8', aB: 8, file: 'spn-core-soften-a8.json', gated: true },
  { name: 'soften_a12', aB: 12, file: 'spn-core-soften-a12.json', gated: true },
]

export default experiment({
  id: 'spin/register-pair-formula-audit',
  code: 'E-SPN-0209',
  title:
    "explores whether the register pair's reference formula (static inertia plus the Darwin exchange) misses a term first order in the coupling: the member's exact band averaged over each recorded level, against R_full at a_B 8 and 12",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const su = setup()
    const metrics: Record<string, number> = {}
    const far = latticePairCurvature({ M0: su.M0, radius: 1000 })
    const farOk = Math.abs(far.a / (su.aMember / 2) - 1) <= INSTRUMENT

    metrics.instrumentFar = far.a / (su.aMember / 2) - 1

    let instrument = farOk
    let pass = true
    let partial = true
    const rows: string[] = []
    const gapOf: Record<string, number> = {}

    for (const pt of POINTS) {
      const j = JSON.parse(readFileSync(`${TMP}/${pt.file}`, 'utf8'))
      const E: number = j.motion.tracked.E
      const S: number = j.zero.darwinS
      const recorded: number = j.motion.Rfull
      const Eb = 2 * su.M0 - E
      const eb = Eb / 2
      const radius = bindingRadius(su.mu, Eb)
      const darwin = ((8 / 3) * eb * S) / (2 * su.m - eb)
      const kin = latticePairCurvature({ M0: su.M0, radius })
      const fine = latticePairCurvature({
        M0: su.M0,
        radius,
        radial: 800,
        directions: 400,
      })
      const atAB = latticePairCurvature({ M0: su.M0, radius: pt.aB })
      const Rkin = pairR(kin.a, E)
      const pred = Rkin - darwin
      const old = darwinR(su.m, eb, S, 1)
      const predAB = pairR(atAB.a, E) - darwin
      const gapNew = Math.abs(pred - recorded)
      const gapOld = Math.abs(recorded - old)

      if (Math.abs(pairR(fine.a, E) / Rkin - 1) > INSTRUMENT) {
        instrument = false
      }

      if (pt.gated) {
        pass = pass && gapNew <= PASS_BAND
        partial = partial && gapNew <= gapOld / 2
      }

      gapOf[pt.name] = recorded - pred
      metrics[`${pt.name}_recorded`] = recorded
      metrics[`${pt.name}_old`] = old
      metrics[`${pt.name}_pred`] = pred
      metrics[`${pt.name}_predAtAB`] = predAB
      metrics[`${pt.name}_radius`] = radius
      metrics[`${pt.name}_meanP2`] = kin.meanP2
      rows.push(
        `${pt.name}: E ${E.toFixed(7)}, E_b ${Eb.toFixed(5)} (radius ${radius.toFixed(3)}), S ${S.toFixed(4)}; recorded R_full ${recorded.toFixed(4)}, old ${old.toFixed(4)} (gap ${gapOld.toFixed(4)}), corrected ${pred.toFixed(4)} (gap ${gapNew.toFixed(4)}; R_kin ${Rkin.toFixed(4)}, Darwin ${darwin.toFixed(4)}), at the radius a_B ${predAB.toFixed(4)}`,
      )
    }

    const exponent =
      Math.log(gapOf.soften_a12! / gapOf.soften_a8!) / Math.log(12 / 8)

    metrics.remainderExponent = exponent
    metrics.instrument = instrument ? 1 : 0
    metrics.seconds = (Date.now() - started) / 1000

    const status = pass ? 'pass' : partial ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `the member's exact band over each level's momentum density moves the reference R_full to ${POINTS.filter(p => p.gated).map(p => `${metrics[`${p.name}_pred`]!.toFixed(4)} (${p.name}, recorded ${metrics[`${p.name}_recorded`]!.toFixed(4)}, old ${metrics[`${p.name}_old`]!.toFixed(4)})`).join(', ')}: the static-plus-Darwin class holds no first-order term, and the remainder recorded minus corrected falls as a_B^${exponent.toFixed(2)} on the softened count`,
      metrics,
      control: { instrumentFar: metrics.instrumentFar! },
      notes: `L2, an audit on recorded levels. Instrument ${instrument}. ${rows.join('. ')}.`,
    })
  },
})
