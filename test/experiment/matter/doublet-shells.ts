// E-MTR-0020. Shells with STAND-IN electrons that carry the doublet label, at a0 = 8: a redo of E-MTR-0010, whose
// shells failed from the husk lattice core at a0 = 3, now with two per orbital supplied by the model's label count
// instead of put in by hand.
//
// E-MTR-0010 filled stand-ins two per orbital BY HAND and found the ionization maxima at 2 and 10 but not 18, every
// s level fallen out of its shell from the lattice core (a0 = 3 husk spacings). E-MTR-0012 showed the role, the
// model's three-valued label, fills three per orbital (closures at 3 and 15). E-MTR-0018 measured the moving token's
// label, the doublet: its antisymmetric counts are C(2, k) = 2, 1, 0, so at most two per orbital, and with the label
// turned by the motion the slot keeps every antisymmetric state; its own slot reading also removes some antisymmetric
// states at contact, a contact term this mean field cannot see. So the capacity here is 2, and its source is the
// doublet's count, stated, not a choice.
//
// Method (code/measure/standin-atoms, unchanged): one fixed stand-in nucleus of charge Z at the center dock of the
// periodic 64^3 husk box, a0 = 8 husk spacings (where one stand-in hydrogen's 1s reads -1.0445 Ry, E-MTR-0007's
// follow-up probe), Z stand-ins in their own Fermi-Amaldi mean field, two per orbital, each atom started from the one
// before; ionization energies are Koopmans'. The series is the atoms the gates need: Z = 1, 2, 3, 9, 10, 11, 17, 18,
// 19.
//
// Gates, fixed before the first run:
// G1 CONTROL, NO REPULSION: in a charge 4 well the 14 lowest levels split at their two largest gaps into groups of 1,
//    4 and 9 (the n^2 shells)
// G2 MADELUNG: the occupied shells are 1s 2s 2p at Z = 10 and 1s 2s 2p 3s 3p at Z = 18, and Z = 19 holds 4s and not 3d
// G3 CLOSURES: the ionization energy has local maxima at Z = 2, 10 and 18
// Pass: all three. Partial: G1 and one of G2 and G3. Fail: otherwise.
// Reported: every ionization energy, the occupied shells, convergence, the deepest potential against the band gap
// 2 pi / 3, and E-MTR-0010's a0 = 3 closures (2 and 10, not 18) beside these.
//
// Depth L2: a mean-field atom on a lattice with stand-in charges, a chosen coupling, and the doublet's count.
//
// The first run, recorded as it came out (1,447 s, tmp/mtr0020.log): fail by the status rule, G1 failing and G2 and
// G3 holding. G1: the charge-4 well still has the lattice core in its s levels at a0 = 8 (a0 / Z = 2 husk spacings):
// over Z^2 Ry, 1s -3.42 and 2s -0.508 against 2p -0.2560 (exactly threefold), so the largest gaps fall after 1 and 2,
// not 1 and 5. G2: 1s 2s 2p at Z = 10, 1s 2s 2p 3s 3p at Z = 18, 4s and no 3d at Z = 19. G3: ionization maxima at 2
// (2.125 Ry against 1.045 and 0.705), 10 (1.0383 against 0.8710 and 1.0371) and 18 (0.7824 against 0.6018 and 0.6771),
// where E-MTR-0010 at a0 = 3 had no maximum at 18. Z = 10 over Z = 11 is a KNIFE EDGE (0.1 percent), and Z = 9, 10
// and 17 missed the density tolerance in 40 cycles, so the closure at 10 is not robust; the box raises the alkali
// levels, which favors all three maxima (see the notes). The deepest potential passes the band gap from Z = 10.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { BAND_TOP, externalPotential, lowestStates, makeGrid, standinUnits } from '@/code/measure/standin-chemistry'
import { atomSeries, centerOf, isLocalMaximum, type Atom, type AtomBox } from '@/code/measure/standin-atoms'
import { antisymmetricLabels } from '@/code/measure/moving-exclusion'

const BOX: AtomBox = { side: 64, a0: 8 }
const CONTROL_CHARGE = 4
const CHARGES = [1, 2, 3, 9, 10, 11, 17, 18, 19]

const shellsAt = (rows: readonly Atom[], z: number): string[] => rows.find(r => r.z === z)?.occupied ?? []
const same = (a: readonly string[], b: readonly string[]): boolean => a.length === b.length && a.every(x => b.includes(x))

export default experiment({
  id: 'matter/doublet-shells',
  code: 'E-MTR-0020',
  title:
    'shells with stand-in electrons that carry the doublet label, at a0 = 8: two per orbital from the doublet\'s count, filled in their own mean field in one husk Coulomb well, against the n^2 shells, the Madelung order and the closures at 2, 10 and 18',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const capacity = [1, 2, 3].map(k => antisymmetricLabels(2, k)).filter(v => v > 0).length
    const grid = makeGrid(BOX.side)
    const units = standinUnits(BOX.a0)
    const metrics: Record<string, number> = { capacityFromDoublet: capacity }
    const control = lowestStates({ grid, potential: externalPotential({ grid, units, nuclei: [{ at: centerOf(BOX), charge: CONTROL_CHARGE }] }), count: 16, extra: 6, tolerance: 1e-6, maxIterations: 400 })
    const levels = control.values.slice(0, 14)
    const largest = levels
      .slice(1)
      .map((e, i) => ({ after: i + 1, gap: e - (levels[i] ?? 0) }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 2)
      .map(g => g.after)
      .sort((a, b) => a - b)
    const g1 = largest[0] === 1 && largest[1] === 5

    levels.forEach((e, i) => (metrics[`controlLevel${i + 1}OverZ2Rydberg`] = e / (CONTROL_CHARGE ** 2 * units.rydberg)))

    const rows = atomSeries({ box: BOX, charges: CHARGES, capacity })
    const at = (z: number): string[] => shellsAt(rows, z)
    const g2 = same(at(10), ['1s', '2s', '2p']) && same(at(18), ['1s', '2s', '2p', '3s', '3p']) && at(19).includes('4s') && !at(19).includes('3d')
    const maxima = [2, 10, 18].filter(z => isLocalMaximum(rows, z))
    const g3 = maxima.length === 3
    const status = g1 && g2 && g3 ? 'pass' : g1 && (g2 || g3) ? 'partial' : 'fail'

    rows.forEach(r => {
      metrics[`z${r.z}IonizationRydberg`] = r.ionization
      metrics[`z${r.z}OuterN`] = r.outer.n
      metrics[`z${r.z}OuterL`] = r.outer.l
      metrics[`z${r.z}Converged`] = r.scf.converged ? 1 : 0
      metrics[`z${r.z}Cycles`] = r.scf.cycles
      metrics[`z${r.z}DeepestOverBandGap`] = -r.scf.deepest / BAND_TOP
    })

    return verdict({
      status,
      claim: `stand-ins with the doublet's two per orbital in one husk Coulomb well at a0 = 8: independent, the levels split after ${largest.join(' and ')}; in their own mean field they fill ${rows.map(r => `Z ${r.z}: ${r.occupied.join(' ')}`).join('; ')}, and the ionization energy has local maxima at ${maxima.join(', ') || 'none'} of 2, 10, 18 (E-MTR-0010 at a0 = 3: 2 and 10, not 18)`,
      metrics: {
        ...metrics,
        controlSplitAfterFirst: largest[0] ?? -1,
        controlSplitAfterSecond: largest[1] ?? -1,
        gateShells: g1 ? 1 : 0,
        gateMadelung: g2 ? 1 : 0,
        gateClosures: g3 ? 1 : 0,
      },
      control: { splitAfterFirst: largest[0] ?? -1, splitAfterSecond: largest[1] ?? -1 },
      notes: `L2, stand-ins throughout (the husk stand-in electron, a fixed husk charge Z, alpha chosen through a0 = 8, the Fermi-Amaldi mean field, Koopmans levels), the capacity ${capacity} from the doublet's antisymmetric counts (E-MTR-0018). The contact term of the model's slot reading is not in a mean field. The 64^3 box is the largest this machine holds: the 2p of one stand-in hydrogen at a0 = 8 is squeezed by it (E-MTR-0007's probe read -0.041 Ry against -0.25), so the alkali atoms' diffuse outer shell is raised by the box, which lowers their ionization energy and favors the maxima; the rare gases' outer shells sit well inside it.`,
    })
  },
})
