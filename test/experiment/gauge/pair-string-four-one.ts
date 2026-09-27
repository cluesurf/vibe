// E-FRC-0202. Does the pair-making vacuum bind the (4, 1) electron cluster, (3, 0) + (1, 1)? A compact baryon and a
// compact meson of the paid Z3 string on the D4 box, the STAND-IN for E-SPN-0060's four roles and one antirole.
//
// E-SPN-0060 found that four roles and one antirole hold the natural spin one half twice and cannot fall apart at
// rest; E-SPN-0061 found that nothing in the knit binds them: on the line the (4, 1) knot costs exactly its parts,
// (3, 0) + (1, 1), at every separation. E-FRC-0188 then showed the line's static baryon is inert (its three cells
// multiply to x^2 times the identity), so on the line the residual is exactly 0 even with pairs, and the question is
// a D4 one. In D4 a compact baryon (three loves or three fears on two paid links) is not inert, and with pair making
// one string can join it to a meson (E-FRC-0188's field).
//
// The runs are E-FRC-0200's (code/measure/pair-string PAIR_VACUUM, 4 baryon pairs seeded, the vacuum making more).
// g(R) of a compact baryon's middle dock against a compact meson's midpoint, real over mixed events.
//
// Gates, fixed before the first run:
// G0 both runs exact (energy, Gauss, kernel), pairs made and unmade in the pair run and never in the control, and at
//    least 0.5 compact baryons per read in each run
// G1 ATTRACTION: the pair run's pooled g - 1 over the contact window (bulk R below 2.5) is positive at more than 3
//    errors
// G2 CONTROL: without pairs the same pooled excess is within 3 errors of 0 (E-SPN-0061's binding 0)
// Pass: all three. Partial: G0 and G1 with G2 failing. Fail: otherwise.
// Reported: the shells, the husk window, the joined (4, 1) pieces (four of one charge and one of the other on one
// string) per read with pairs and without.
//
// Depth L2: a constructed rule's dynamics; the baryon and meson are stand-ins, and the (4, 1) cluster's spin is
// E-SPN-0060's, not carried by this rule.
//
// The first run, recorded as it came out (54.8 s, tmp/frc0202.log): fail. G0 fails on the control, which makes pairs
// by string breaking (642 charges against 72 seeded; E-FRC-0200's header); baryons were there in both (1.97 and 2.01
// compact per read). G1 fails: baryon-meson g within R 2.5 is 1.029 +- 0.016 (1.8 errors). G2 holds: 1.036 +- 0.016
// in the capacity-6 run. Joined (4, 1) pieces: 4.670 and 4.682 per read, the same. Nothing binds (3, 0) to (1, 1) at
// this resolution, with or without the pair from calm.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { correlationShells, pairVacuumPair, PAIR_VACUUM, type PairVacuum } from '@/code/measure/pair-string'

const CONTACT = 2.5
const SIGMAS = 3
const BARYONS_PER_READ = 0.5

function window(run: PairVacuum, which: 'bulk' | 'husk'): { pooled: number; error: number; shells: { r: number; g: number; sigma: number }[] } {
  const shells = correlationShells(run.baryonMeson, which).filter(s => s.r < CONTACT - 1e-9)
  const weight = shells.reduce((a, s) => a + 1 / s.sigma ** 2, 0)

  return {
    pooled: shells.reduce((a, s) => a + (s.g - 1) / s.sigma ** 2, 0) / Math.max(1e-300, weight),
    error: 1 / Math.sqrt(Math.max(1e-300, weight)),
    shells,
  }
}

export default experiment({
  id: 'gauge/pair-string-four-one',
  code: 'E-FRC-0202',
  title:
    'does the pair-making vacuum bind the (4, 1) cluster: a compact baryon and a compact meson (stand-ins for E-SPN-0060\'s four roles and one antirole) of the paid Z3 string on the D4 box, at contact against mixed events, with pair making on and off',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const { paired, control } = pairVacuumPair()
    const seeded = 2 * PAIR_VACUUM.mesons + 6 * PAIR_VACUUM.baryons
    const bulk = window(paired, 'bulk')
    const husk = window(paired, 'husk')
    const controlBulk = window(control, 'bulk')
    const controlHusk = window(control, 'husk')
    const g0 =
      paired.exact &&
      paired.agrees &&
      control.exact &&
      control.agrees &&
      paired.fewestCharges !== paired.mostCharges &&
      control.fewestCharges === seeded &&
      control.mostCharges === seeded &&
      paired.compactBaryonsPerRead >= BARYONS_PER_READ &&
      control.compactBaryonsPerRead >= BARYONS_PER_READ
    const g1 = bulk.pooled > SIGMAS * bulk.error
    const g2 = Math.abs(controlBulk.pooled) < SIGMAS * controlBulk.error
    const status = g0 && g1 && g2 ? 'pass' : g0 && g1 ? 'partial' : 'fail'
    const metrics: Record<string, number> = {
      beta: paired.beta,
      x: paired.x,
      y: paired.y,
      compactBaryonsPerRead: paired.compactBaryonsPerRead,
      compactMesonsPerRead: paired.compactMesonsPerRead,
      fourOnePiecesPerRead: paired.fourOnePerRead,
      windowBulkPooled: bulk.pooled,
      windowBulkError: bulk.error,
      windowHuskPooled: husk.pooled,
      windowHuskError: husk.error,
      controlCompactBaryonsPerRead: control.compactBaryonsPerRead,
      controlCompactMesonsPerRead: control.compactMesonsPerRead,
      controlFourOnePiecesPerRead: control.fourOnePerRead,
      controlWindowBulkPooled: controlBulk.pooled,
      controlWindowBulkError: controlBulk.error,
      controlWindowHuskPooled: controlHusk.pooled,
      controlWindowHuskError: controlHusk.error,
      gateExact: g0 ? 1 : 0,
      gateAttraction: g1 ? 1 : 0,
      gateControl: g2 ? 1 : 0,
    }

    bulk.shells.forEach(s => (metrics[`pairedBaryonMesonGR${s.r.toFixed(3)}`] = s.g))
    controlBulk.shells.forEach(s => (metrics[`controlBaryonMesonGR${s.r.toFixed(3)}`] = s.g))

    return verdict({
      status,
      claim: `a compact baryon and a compact meson within R 2.5 (bulk) are ${(1 + bulk.pooled).toFixed(4)} +- ${bulk.error.toFixed(4)} times as frequent as mixed events with the vacuum making pairs and ${(1 + controlBulk.pooled).toFixed(4)} +- ${controlBulk.error.toFixed(4)} without (husk ${(1 + husk.pooled).toFixed(4)} and ${(1 + controlHusk.pooled).toFixed(4)}); joined (4, 1) pieces number ${paired.fourOnePerRead.toFixed(4)} per read with pairs and ${control.fourOnePerRead.toFixed(4)} without`,
      metrics,
      control: { controlCapacity: PAIR_VACUUM.controlCapacity, seededCharges: seeded },
      notes:
        'L2, stand-ins: the compact baryon (three like charges on two paid links, read at its middle dock) and the compact meson stand for the (3, 0) and (1, 1) of E-SPN-0060\'s cluster, whose spin this rule does not carry. On the line the static baryon is inert exactly (E-FRC-0188), so this is the first place the question can be answered in the rule. Zero-temperature binding stays 0 (the least string of four loves and a fear is the sum of its parts, and a pair adds 2 mass); a contact excess is a free-energy attraction.',
    })
  },
})
