// E-MTR-0012. The role as the electron's label, tested with STAND-INS. The model has one internal label that
// carries exclusion: the role, a point of the qutrit (E-SPN-0045: two fermions on the role grid are 72 loves
// and 18 fears, with zero chance of a shared role). If a stand-in electron (a charged fear-walk token,
// E-FRC-0176) carried the role as its internal label, in place of the spin it lacks (E-SPN-0044: no double
// cover), how many would one orbital hold, and would the shells close where nature's do?
//
// The count is algebra. k fermions in one orbital need a totally antisymmetric label state, and the space of
// those has dimension C(d, k) for a d-valued label: tr of the antisymmetrizer,
// (1 / k!) sum over permutations of sgn(p) d^(cycles of p), computed here by enumerating the permutations.
// For spin (d = 2) it is 2, 1, 0 for k = 1, 2, 3: two per orbital. For the role (d = 3) it is 3, 3, 1, 0: three
// per orbital, the third one in the color singlet. Three-per-orbital is how quarks fill, not electrons.
//
// The consequence is then measured, not assumed: the stand-in atoms of E-MTR-0010 (code/measure/standin-
// atoms: a0 = 3, a 32^3 husk box, the Fermi-Amaldi mean field) filled three per orbital, their closures read
// off the Koopmans ionization energy. The machine ran at a load near 560, so only the atoms the gates need are
// computed: Z = 1, 2, 3, 4, 14, 15, 16, 26, 27, 28.
//
// Gates, fixed before the first run of this file (rewritten before any run, after a solver probe on one
// stand-in hydrogen, to the reduced list of atoms):
// 1. THE COUNT: dim of the antisymmetric part of k labels is 2, 1, 0 for d = 2 and 3, 3, 1, 0 for d = 3
//    (k = 1 to 4, k = 4 only for d = 3), exactly
// 2. THE MEASURED SHELLS: three per orbital, the ionization energy has local maxima at Z = 3, 15 and 27 (the
//    Madelung shells 1s, 2s 2p, 3s 3p, times 3)
// 3. THE HYPOTHESIS: the role reproduces nature's first closure, a local maximum at Z = 2
// Status is the hypothesis's: fail if gate 3 fails (nature's first closure is absent, so the role cannot be
// the electron's label, and 10 and 18 need not be run); open if it holds, since 10 and 18 are then owed.
//
// Depth L1 for the count, L2 for the atoms. A stand-in result: it says what the role would do as the
// electron's label, not what the electron is.
//
// The first run, 2026-09-26, recorded as it came out (667.4 s, tmp/standin-runs/standin-role-label.log): fail,
// on the hypothesis, as the status rule says. Gate 1 holds exactly: spin 2, 1, 0 and role 3, 3, 1, 0. Filled
// three per orbital, the ionization energies read 1.55, 4.47, 6.36 Ry at Z = 1, 2, 3, then 0.96 at Z = 4 (the
// fourth stand-in into 2s): the first closure is at 3, not 2, so Z = 2 is not a maximum and gate 3 fails.
// Gate 2 holds at 3 and 15 (1.50 Ry, against 1.34 at 14 and 0.67 at 16) and fails at 27 (0.58 against 0.51 at 26
// and 0.69 at 28), where the fourth shell's order is the same husk-core defect E-MTR-0010 found (Z 28 puts its
// last stand-ins in 3d before 3p) and 26, 27, 28 missed the density tolerance. The role fills like quarks, three
// per orbital, and so cannot stand where spin stands.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { BAND_TOP } from '@/code/measure/standin-chemistry'
import { ATOM_BOX, atomSeries, isLocalMaximum } from '@/code/measure/standin-atoms'

const ROLE_CAPACITY = 3
const CHARGES = [1, 2, 3, 4, 14, 15, 16, 26, 27, 28]

// every permutation of 0 .. k - 1
function permutations(k: number): number[][] {
  if (k === 0) {
    return [[]]
  }

  return permutations(k - 1).flatMap(p => Array.from({ length: k }, (_, i) => [...p.slice(0, i), k - 1, ...p.slice(i)]))
}

// the sign and the number of cycles of a permutation
function cycles(p: readonly number[]): { count: number; sign: number } {
  const seen = p.map(() => false)

  let count = 0
  let sign = 1

  for (let i = 0; i < p.length; i++) {
    if (!seen[i]) {
      let length = 0
      let j = i

      while (!seen[j]) {
        seen[j] = true
        j = p[j] ?? 0
        length++
      }

      count++
      sign *= length % 2 === 0 ? -1 : 1
    }
  }

  return { count, sign }
}

// dim of the totally antisymmetric part of k d-valued labels, exactly, as tr of the antisymmetrizer
export function antisymmetricDimension(d: number, k: number): number {
  const all = permutations(k)
  const sum = all.reduce((s, p) => {
    const c = cycles(p)

    return s + c.sign * d ** c.count
  }, 0)

  return sum / all.length
}

export default experiment({
  id: 'quantum/standin-role-label',
  code: 'E-MTR-0012',
  title:
    'the role as the electron\'s label, tested with stand-ins: a three-valued label lets three fermions share an orbital (the antisymmetric dimensions 3, 3, 1), and stand-in atoms on the husk filled three per orbital are read for their closures against nature\'s first, at Z = 2',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const spin = [1, 2, 3].map(k => antisymmetricDimension(2, k))
    const role = [1, 2, 3, 4].map(k => antisymmetricDimension(3, k))
    const gate1 = spin.join(',') === '2,1,0' && role.join(',') === '3,3,1,0'
    const rows = atomSeries({ box: ATOM_BOX, charges: CHARGES, capacity: ROLE_CAPACITY })
    const top = [2, 3, 15, 27].filter(z => isLocalMaximum(rows, z))
    const gate2 = [3, 15, 27].every(z => isLocalMaximum(rows, z))
    const gate3 = isLocalMaximum(rows, 2)
    const metrics: Record<string, number> = {}

    spin.forEach((v, i) => (metrics[`spinAntisymmetricK${i + 1}`] = v))
    role.forEach((v, i) => (metrics[`roleAntisymmetricK${i + 1}`] = v))
    rows.forEach(r => {
      metrics[`roleZ${r.z}IonizationRydberg`] = r.ionization
      metrics[`roleZ${r.z}OuterN`] = r.outer.n
      metrics[`roleZ${r.z}OuterL`] = r.outer.l
      metrics[`roleZ${r.z}Converged`] = r.scf.converged ? 1 : 0
      metrics[`roleZ${r.z}DeepestOverBandGap`] = -r.scf.deepest / BAND_TOP
    })
    top.forEach((z, i) => (metrics[`localMaximum${i + 1}`] = z))

    return verdict({
      status: gate3 ? 'open' : 'fail',
      claim: `${gate3 ? 'the role keeps nature\'s first closure, and 10 and 18 are owed' : 'the role cannot be the electron\'s label'}: the antisymmetric states of k role labels number ${role.join(', ')} for k = 1 to 4 (spin: ${spin.join(', ')} for k = 1 to 3), so three stand-ins share an orbital, and of Z = 2, 3, 15, 27 the stand-in atoms filled three per orbital have ionization maxima at ${top.join(', ') || 'none'}, where nature's first closure is at 2`,
      metrics: {
        ...metrics,
        gateCount: gate1 ? 1 : 0,
        gateRoleShells: gate2 ? 1 : 0,
        gateNatureClosures: gate3 ? 1 : 0,
      },
      control: { spinCapacity: spin.filter(v => v > 0).length, roleCapacity: role.filter(v => v > 0).length },
      notes: `L1 for the label count, L2 for the atoms (stand-ins: charged fear-walk electrons, a fixed husk charge, alpha chosen through a0 = 3, Fermi-Amaldi mean field, Koopmans levels). Occupied shells three per orbital: ${rows.map(r => `Z ${r.z}: ${r.occupied.join(' ')}`).join('; ')}. A negative for the role as the electron's internal label: the electron needs a two-valued label the model has not produced (E-SPN-0044), which is the same missing double cover that blocks spin one half.`,
    })
  },
})
