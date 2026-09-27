// E-FRC-0201. A deuteron once the vacuum makes pairs? Two compact color singlets (STAND-INS for nucleons) of the
// paid Z3 string on the D4 box, at contact, with pair making on and off.
//
// E-FRC-0198 found no deuteron without pair making: zero binding energy by theorem (E-FRC-0195) and two mesons in
// contact 1.013 times as often as an ideal gas. E-FRC-0188 derived that pair making lets one string join two
// singlets, and on the line the static mesons then attract at every gap (3.35e-4 at contact, x = 1/30, y = 1/10).
// The zero-temperature theorem still holds with pairs (a pair only adds mass, and two singlets apart are already at
// their least string), so any deuteron here is held by the free energy of the pair-dressed string, not by energy.
// This file reads that free energy's sign at contact.
//
// The runs are E-FRC-0200's (code/measure/pair-string PAIR_VACUUM: mass 2, tension 3, side-9 D4 box, capacity 14
// against the control's 6, 24 mesons and 4 baryon pairs seeded, 40,000 beats read every 4th). The contact window is
// every midpoint shell of two compact mesons below R = 2 that two such mesons can occupy without sharing a dock; g is
// real pairs over mixed events (250 reads back).
//
// Gates, fixed before the first run:
// G0 both runs exact (energy, Gauss, kernel), pairs made and unmade in the pair run and never in the control
// G1 ATTRACTION AT CONTACT: the pair run's pooled g - 1 over the contact window (bulk) is positive at more than 3 errors
// G2 SET BY THE PAIRS: it exceeds the control's by more than 3 combined errors
// Pass: all three. Fail: otherwise.
// Reported: every contact shell, the husk contact window, the joined two-meson pieces (two loves and two fears on one
// string) per read, E-FRC-0198's 1.013.
//
// Depth L2: a constructed rule's dynamics, stand-in nucleons (color singlets, no three quarks, no spin). A thermal
// contact excess is an attraction in the free energy, not a quantum bound state, and is named that way.
//
// The first run, recorded as it came out (55.0 s, tmp/frc0201.log): fail. G0 fails because the control makes pairs
// too (642 charges against 72 seeded: the pair move breaks a flux-2 string for 2 mass - tension = 1, below any
// capacity; E-FRC-0200's header). G1 holds: contact g = 1.0409 +- 0.0077 with the capacity at 14 (5.3 errors), every
// contact shell above 1 (1.076 at R = 1). G2 fails: the capacity-6 run reads 1.0261 +- 0.0075, so the capacity adds
// 0.015 +- 0.011 (1.4 errors). A weak contact attraction exists in both runs, about three times E-FRC-0198's 1.013
// without string breaking, and the pair from calm does not raise it measurably. No deuteron in energy (theorem).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { correlationShells, pairVacuumPair, PAIR_VACUUM, type PairVacuum } from '@/code/measure/pair-string'

const CONTACT = 2
const SIGMAS = 3

function contact(run: PairVacuum, which: 'bulk' | 'husk'): { pooled: number; error: number; shells: { r: number; g: number; sigma: number }[] } {
  const shells = correlationShells(run.mesonPairs, which).filter(s => s.r < CONTACT - 1e-9)
  const weight = shells.reduce((a, s) => a + 1 / s.sigma ** 2, 0)

  return {
    pooled: shells.reduce((a, s) => a + (s.g - 1) / s.sigma ** 2, 0) / Math.max(1e-300, weight),
    error: 1 / Math.sqrt(Math.max(1e-300, weight)),
    shells,
  }
}

export default experiment({
  id: 'gauge/pair-string-deuteron',
  code: 'E-FRC-0201',
  title:
    'a deuteron once the vacuum makes pairs: two compact color singlets (stand-ins for nucleons) of the paid Z3 string on the D4 box at contact, against mixed events, with pair making on and off',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const { paired, control } = pairVacuumPair()
    const seeded = 2 * PAIR_VACUUM.mesons + 6 * PAIR_VACUUM.baryons
    const bulk = contact(paired, 'bulk')
    const husk = contact(paired, 'husk')
    const controlBulk = contact(control, 'bulk')
    const controlHusk = contact(control, 'husk')
    const g0 =
      paired.exact && paired.agrees && control.exact && control.agrees && paired.fewestCharges !== paired.mostCharges && control.fewestCharges === seeded && control.mostCharges === seeded
    const g1 = bulk.pooled > SIGMAS * bulk.error
    const g2 = bulk.pooled - controlBulk.pooled > SIGMAS * Math.hypot(bulk.error, controlBulk.error)
    const status = g0 && g1 && g2 ? 'pass' : 'fail'
    const metrics: Record<string, number> = {
      beta: paired.beta,
      x: paired.x,
      y: paired.y,
      compactMesonsPerRead: paired.compactMesonsPerRead,
      twoTwoPiecesPerRead: paired.twoTwoPerRead,
      contactBulkPooled: bulk.pooled,
      contactBulkError: bulk.error,
      contactHuskPooled: husk.pooled,
      contactHuskError: husk.error,
      controlContactBulkPooled: controlBulk.pooled,
      controlContactBulkError: controlBulk.error,
      controlContactHuskPooled: controlHusk.pooled,
      controlContactHuskError: controlHusk.error,
      controlCompactMesonsPerRead: control.compactMesonsPerRead,
      controlTwoTwoPiecesPerRead: control.twoTwoPerRead,
      controlBeta: control.beta,
      gateExact: g0 ? 1 : 0,
      gateContactAttraction: g1 ? 1 : 0,
      gateSetByPairs: g2 ? 1 : 0,
    }

    bulk.shells.forEach(s => (metrics[`pairedContactGR${s.r.toFixed(3)}`] = s.g))
    controlBulk.shells.forEach(s => (metrics[`controlContactGR${s.r.toFixed(3)}`] = s.g))

    return verdict({
      status,
      claim: `two compact singlets at contact (bulk midpoint shells below R = 2) are ${(1 + bulk.pooled).toFixed(4)} +- ${bulk.error.toFixed(4)} times as frequent as mixed events with the vacuum making pairs, and ${(1 + controlBulk.pooled).toFixed(4)} +- ${controlBulk.error.toFixed(4)} without (E-FRC-0198: 1.013); the husk contact reads ${(1 + husk.pooled).toFixed(4)} and ${(1 + controlHusk.pooled).toFixed(4)}; ${paired.twoTwoPerRead.toFixed(3)} joined two-meson pieces per read with pairs, ${control.twoTwoPerRead.toFixed(3)} without`,
      metrics,
      control: { controlCapacity: PAIR_VACUUM.controlCapacity, seededCharges: seeded },
      notes:
        'L2, stand-ins (color singlets for nucleons). Exact integers and Weyl starts, no random numbers. The contact window holds every bulk midpoint shell below R = 2 that two compact mesons sharing no dock can occupy; the reference is mixed events, which carry the box\'s geometry exactly. Zero-temperature binding is 0 with or without pairs (E-FRC-0195\'s bounds, and a pair adds 2 mass), so a contact excess is a free-energy attraction.',
    })
  },
})
