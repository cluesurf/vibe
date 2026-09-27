// E-MTR-0011. Screening with STAND-INS: the effective charge an outer stand-in electron feels in a stand-in
// atom on the husk, when the inner stand-ins stand between it and the nucleus. Stand-in electrons are charged
// fear-walk tokens (E-FRC-0176), the nucleus a fixed husk charge Z, the potential the husk lattice Coulomb
// potential (E-FRC-0179). The atoms are those of E-MTR-0010 (code/measure/standin-atoms): a0 = 3, a 32^3 box,
// the Fermi-Amaldi mean field.
//
// The measure. An outer stand-in of principal number n bound by I (Koopmans: minus its level) feels
// Z_eff = n sqrt(I / Ry), the charge a hydrogenic level of that n would need. Nature's values from measured
// ionization energies (NIST Atomic Spectra Database), with Ry = 13.605693 eV:
//   He 1s2s 3S (spinless stand-ins, Z = 2: one per orbital puts the second in 2s):  I 4.767772 eV, Z_eff 1.1839
//   Li 2s (two per orbital, by hand, Z = 3):   I 5.391715 eV, Z_eff 1.2590
//   Na 3s (by hand, Z = 11):                   I 5.139076 eV, Z_eff 1.8437
//   K 4s (by hand, Z = 19):                    I 4.340663 eV, Z_eff 2.2593
// The He 2 3S state is the spinless stand-in's own lithium: two stand-ins in two different orbitals, the
// same spatial antisymmetry the triplet has. The others need the factor 2 put in by hand (labeled so).
// Also reported: the screened potential itself, Z_eff(r) = -v(r) / (kappa G(r)) along a husk axis for the
// sodium stand-in, which runs from Z at the nucleus to the far-field charge.
//
// Gates, fixed before the first run:
// 1. CONTROL, NO SCREENING: with the stand-ins independent, the lithium stand-in's outer stand-in (n = 2,
//    2s or 2p, whichever the lattice puts lower) feels Z_eff = 3 within 10 percent (the lattice)
// 2. SCREENING, PARTIAL: with the mean field, 1 < Z_eff < Z for all four atoms
// 3. HOW MUCH: each Z_eff within 15 percent of nature's
// 4. THE TREND: Z_eff grows from Li to Na to K, as nature's does
// Pass: all four. Partial: gates 1 and 2 hold. Fail: otherwise.
//
// Depth L2: a mean-field atom on a lattice with stand-in charges and a chosen coupling. Koopmans' energy is
// not the ionization energy (it leaves out relaxation and correlation): the comparison is at that level.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { greenInfinite, indexOf, standinUnits } from '@/code/measure/standin-chemistry'
import { ATOM_BOX, atom, centerOf, type Atom } from '@/code/measure/standin-atoms'

const NATURE = { heliumTriplet: 1.1839, lithium: 1.259, sodium: 1.8437, potassium: 2.2593 }
const PROFILE_RADII = [1, 2, 3, 6, 9, 12]

const zEffective = (a: Atom): number => a.outer.n * Math.sqrt(Math.max(0, a.ionization))

export default experiment({
  id: 'quantum/standin-screening',
  code: 'E-MTR-0011',
  title:
    'screening with stand-ins: the effective charge an outer stand-in electron feels in a stand-in atom on the husk, read from its level, against helium 2 3S, lithium, sodium and potassium, with the independent stand-ins as the unscreened control',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const units = standinUnits(ATOM_BOX.a0)
    const control = atom({ box: ATOM_BOX, z: 3, capacity: 2, field: 'none' })
    const heliumTriplet = atom({ box: ATOM_BOX, z: 2, capacity: 1 })
    const lithium = atom({ box: ATOM_BOX, z: 3, capacity: 2 })
    const sodium = atom({ box: ATOM_BOX, z: 11, capacity: 2, start: lithium.scf.block })
    const potassium = atom({ box: ATOM_BOX, z: 19, capacity: 2, start: sodium.scf.block })
    const measured = { heliumTriplet, lithium, sodium, potassium }
    const metrics: Record<string, number> = {}
    const center = centerOf(ATOM_BOX)

    for (const [name, a] of Object.entries(measured)) {
      metrics[`${name}ZEffective`] = zEffective(a)
      metrics[`${name}Nature`] = NATURE[name as keyof typeof NATURE]
      metrics[`${name}Ratio`] = zEffective(a) / NATURE[name as keyof typeof NATURE]
      metrics[`${name}OuterN`] = a.outer.n
      metrics[`${name}OuterL`] = a.outer.l
      metrics[`${name}IonizationRydberg`] = a.ionization
      metrics[`${name}Converged`] = a.scf.converged ? 1 : 0
    }

    // the screened potential of the sodium stand-in along +x
    for (const r of PROFILE_RADII) {
      const v = sodium.scf.potential[indexOf(ATOM_BOX.side, [center[0] + r, center[1], center[2]])] ?? 0

      metrics[`sodiumScreenedChargeAtR${(r / ATOM_BOX.a0).toFixed(3)}`] = -v / (units.kappa * greenInfinite(r, 0, 0))
    }

    const controlZ = zEffective(control)
    const gate1 = Math.abs(controlZ / 3 - 1) < 0.1 && control.outer.n === 2
    const gate2 = Object.values(measured).every(a => zEffective(a) > 1 && zEffective(a) < a.z)
    const gate3 = Object.entries(measured).every(([name, a]) => Math.abs(zEffective(a) / NATURE[name as keyof typeof NATURE] - 1) < 0.15)
    const gate4 = zEffective(lithium) < zEffective(sodium) && zEffective(sodium) < zEffective(potassium)
    const status = gate1 && gate2 && gate3 && gate4 ? 'pass' : gate1 && gate2 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `an outer stand-in feels a screened charge: Z_eff ${zEffective(heliumTriplet).toFixed(3)} in the spinless helium (1s 2s, nature 1.184), ${zEffective(lithium).toFixed(3)} in lithium (1.259), ${zEffective(sodium).toFixed(3)} in sodium (1.844) and ${zEffective(potassium).toFixed(3)} in potassium (2.259), against ${controlZ.toFixed(3)} for lithium with the screening off`,
      metrics: {
        ...metrics,
        controlLithiumZEffective: controlZ,
        gateControl: gate1 ? 1 : 0,
        gatePartialScreening: gate2 ? 1 : 0,
        gateAgainstNature: gate3 ? 1 : 0,
        gateTrend: gate4 ? 1 : 0,
      },
      control: { unscreenedLithiumZEffective: controlZ },
      notes: `L2, stand-ins throughout, band-projected stand-in band, Fermi-Amaldi mean field, Koopmans levels. Outer shells: helium ${heliumTriplet.outer.name}, lithium ${lithium.outer.name}, sodium ${sodium.outer.name}, potassium ${potassium.outer.name}. The factor 2 for lithium, sodium and potassium is put in by hand; the spinless helium 1s 2s is the model's own case. The far-field charge of the screened potential is 1 by the Fermi-Amaldi construction, so only Z_eff of the level is gated, not the tail. First run, 2026-09-25, status fail, and every failure stands. The control fails: with the screening off the lithium 2s reads Z_eff 4.565, not 3, because the husk lattice core pulls every s level down (a quantum defect: the Z = 4 well of E-MTR-0010 puts 2s at -0.546 Z^2 Ry against 2p at -0.288). Screening is real and partial (1 < Z_eff < Z in all four), and the screened charge of sodium falls from 4.22 at 1/3 a0 to 1.25 at 2 a0 and 1.03 at 4 a0, but Z_eff is 31 to 50 percent above nature for helium 1s 2s, lithium and sodium, the same s-level defect, and potassium\'s outer stand-in is in 3p, not 4s (its level is 0.98 of nature\'s number by coincidence, its SCF unconverged), so the trend gate fails. What was measured is the lattice core, not the screening: a0 = 3 husk spacings is too coarse.`,
    })
  },
})
