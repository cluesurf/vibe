// E-MTR-0010. Shells with STAND-INS: N stand-in electrons (charged fear-walk tokens, E-FRC-0176) in one fixed
// stand-in nucleus of charge Z = N on the husk, filled in their own mean field. Nature fills 1s 2s 2p 3s 3p
// 4s 3d 4p by the Madelung n + l rule and closes shells at 2, 10, 18, 36, because each orbital holds two
// electrons (spin) and the inner electrons screen the nucleus unevenly by l. The stand-in has no spin, so
// the degeneracy factor is stated, never assumed: it is run twice, and the two runs are labeled.
//   spinless: one stand-in per orbital. This is what the model has. Nature's closures halve: 1, 5, 9, 18
//   by hand: two stand-ins per orbital, a two-valued label PUT IN BY HAND to compare with the periodic table.
//     Nothing in the model supplies it (E-SPN-0044: no double cover; E-MTR-0012 for the role)
//
// Method. A periodic 32^3 husk box, the nucleus at its center dock, a0 = 3 husk spacings, the Fermi-Amaldi
// mean field (the stand-ins' density scaled by (N - 1) / N, so an outer stand-in sees the right far field),
// self-consistent with Pulay mixing, open shells filled as an average of configuration (a degenerate level
// shares what reaches it). Each atom is started from the one before (code/measure/standin-atoms). Orbitals
// are labeled s, p, d by their character about the nucleus. Ionization energies are Koopmans', minus the
// highest occupied level. The machine ran at a load near 560 when this was written, so the by-hand series is
// the atoms each gate needs, not every Z: 1, 2, 3, 4, 9, 10, 11, 12, 17, 18, 19, 20.
//
// Gates, fixed before the first run of this file (they were rewritten, before any run, after a one-stand-in
// hydrogen probe of the solver showed the husk lattice core binds a0 = 3 hydrogen at -1.55 Ry, and the
// machine load forced the reduced series):
// 1. CONTROL, NO REPULSION: with the stand-ins independent (a charge Z = 4 well), the 14 lowest levels split
//    at their two largest gaps into groups of 1, 4 and 9: the n^2 shells of the Coulomb well, closures 1, 5,
//    14 spinless and 2, 10, 28 with the factor 2, the 2 n^2 rule
// 2. MADELUNG, BY HAND: two per orbital, the occupied shells are 1s 2s at Z = 4, 1s 2s 2p at Z = 10, include 3s
//    and not 3p at Z = 12, are 1s 2s 2p 3s 3p at Z = 18, and include 4s and not 3d at Z = 19 and 20
// 3. CLOSURES, BY HAND: the ionization energy has local maxima at Z = 2, 10 and 18
// 4. SPINLESS: one per orbital, Z = 1 to 10, the three largest local maxima of the ionization energy over
//    Z = 1 to 9 fall at 1, 5 and 9, and the tenth stand-in enters 4s, not 3d
// Pass: all four. Partial: gate 1 and at least one of gates 2 to 4. Fail: otherwise.
// Reported: every ionization energy, the occupied shells, the 3d crystal-field splitting the cubic husk makes
// (e_g against t_2g), 4s against 3d, and the deepest potential against the band gap 2 pi / 3 (a deep core is a
// lattice core, and past the gap it is outside what the walk would do).
//
// Depth L2: a mean-field atom on a lattice with stand-in charges and a chosen coupling.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { BAND_TOP, externalPotential, lowestStates, makeGrid, standinUnits } from '@/code/measure/standin-chemistry'
import { ATOM_BOX, atomSeries, centerOf, closures, fillingOrder, isLocalMaximum, type Atom } from '@/code/measure/standin-atoms'

const CONTROL_CHARGE = 4
const BY_HAND = [1, 2, 3, 4, 9, 10, 11, 12, 17, 18, 19, 20]
const SPINLESS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const shellsAt = (rows: readonly Atom[], z: number): string[] => rows.find(r => r.z === z)?.occupied ?? []
const same = (a: readonly string[], b: readonly string[]): boolean => a.length === b.length && a.every(x => b.includes(x))

export default experiment({
  id: 'quantum/standin-shells',
  code: 'E-MTR-0010',
  title:
    'shells with stand-ins: stand-in electrons in one fixed stand-in nucleus on the husk, filled in their own Fermi-Amaldi mean field, one per orbital (the model has no spin) and two per orbital by hand, against the 2 n^2 rule, the Madelung n + l order and the closures at 2, 10 and 18',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const grid = makeGrid(ATOM_BOX.side)
    const units = standinUnits(ATOM_BOX.a0)
    const metrics: Record<string, number> = {}
    // 1. the independent stand-ins in a charge-4 well
    const control = lowestStates({ grid, potential: externalPotential({ grid, units, nuclei: [{ at: centerOf(ATOM_BOX), charge: CONTROL_CHARGE }] }), count: 16, extra: 6, tolerance: 1e-6 })
    const levels = control.values.slice(0, 14)
    const gaps = levels.slice(1).map((e, i) => ({ after: i + 1, gap: e - (levels[i] ?? 0) }))
    const largest = [...gaps]
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 2)
      .map(g => g.after)
      .sort((a, b) => a - b)
    const gate1 = largest[0] === 1 && largest[1] === 5

    levels.forEach((e, i) => (metrics[`controlLevel${i + 1}OverZ2Rydberg`] = e / (CONTROL_CHARGE ** 2 * units.rydberg)))

    // 2 and 3. two per orbital, by hand
    const byHand = atomSeries({ box: ATOM_BOX, charges: BY_HAND, capacity: 2 })
    const at = (z: number): string[] => shellsAt(byHand, z)
    const gate2 =
      same(at(4), ['1s', '2s']) &&
      same(at(10), ['1s', '2s', '2p']) &&
      at(12).includes('3s') &&
      !at(12).includes('3p') &&
      same(at(18), ['1s', '2s', '2p', '3s', '3p']) &&
      [19, 20].every(z => at(z).includes('4s') && !at(z).includes('3d'))
    const gate3 = [2, 10, 18].every(z => isLocalMaximum(byHand, z))

    // 4. one per orbital, spinless
    const spinless = atomSeries({ box: ATOM_BOX, charges: SPINLESS, capacity: 1 })
    const spinlessClosures = closures(spinless, 1, 9)
    const entered = shellsAt(spinless, 10).filter(s => !shellsAt(spinless, 9).includes(s))
    const gate4 = [1, 5, 9].every(z => spinlessClosures.slice(0, 3).includes(z)) && entered.length === 1 && entered[0] === '4s'

    const series = (rows: Atom[], name: string): void =>
      rows.forEach(r => {
        metrics[`${name}Z${r.z}IonizationRydberg`] = r.ionization
        metrics[`${name}Z${r.z}OuterN`] = r.outer.n
        metrics[`${name}Z${r.z}OuterL`] = r.outer.l
        metrics[`${name}Z${r.z}Converged`] = r.scf.converged ? 1 : 0
        metrics[`${name}Z${r.z}DeepestOverBandGap`] = -r.scf.deepest / BAND_TOP
      })

    series(byHand, 'byHand')
    series(spinless, 'spinless')

    // the 3d levels at Z = 19 and 20 by hand: the cubic crystal field, and 4s against 3d
    for (const z of [19, 20]) {
      const row = byHand.find(r => r.z === z)
      const d = (row?.shells ?? []).map((s, j) => ({ s, e: row?.scf.values[j] ?? 0 })).filter(x => x.s.name === '3d')
      const s4 = (row?.shells ?? []).findIndex(s => s.name === '4s')

      metrics[`byHandZ${z}ThreeDLevelsFound`] = d.length
      metrics[`byHandZ${z}ThreeDSplittingRydberg`] = d.length > 0 ? (Math.max(...d.map(x => x.e)) - Math.min(...d.map(x => x.e))) / units.rydberg : Number.NaN
      metrics[`byHandZ${z}FourSMinusLowestThreeDRydberg`] = d.length > 0 && s4 >= 0 ? ((row?.scf.values[s4] ?? 0) - Math.min(...d.map(x => x.e))) / units.rydberg : Number.NaN
    }

    const status = gate1 && gate2 && gate3 && gate4 ? 'pass' : gate1 && (gate2 || gate3 || gate4) ? 'partial' : 'fail'
    const occupiedText = (rows: Atom[]): string => rows.map(r => `Z ${r.z}: ${r.occupied.join(' ')}`).join('; ')

    return verdict({
      status,
      claim: `stand-ins in one husk Coulomb well: independent, their levels split after ${largest.join(' and ')} (n^2 shells); two per orbital by hand, in their own mean field, they fill ${fillingOrder(byHand).join(' ')} with ionization maxima at 2, 10, 18 ${gate3 ? 'present' : 'not all present'}; spinless, one per orbital, their largest maxima are at ${spinlessClosures.slice(0, 3).join(', ')} and the tenth enters ${entered.join(' ') || 'no new shell'}`,
      metrics: {
        ...metrics,
        controlSplitAfterFirst: largest[0] ?? -1,
        controlSplitAfterSecond: largest[1] ?? -1,
        gateNoRepulsionShells: gate1 ? 1 : 0,
        gateMadelungByHand: gate2 ? 1 : 0,
        gateClosuresByHand: gate3 ? 1 : 0,
        gateSpinless: gate4 ? 1 : 0,
      },
      control: { splitAfterFirst: largest[0] ?? -1, splitAfterSecond: largest[1] ?? -1 },
      notes: `L2, stand-ins throughout (charged fear-walk electrons, a fixed husk charge Z, alpha chosen through a0 = 3), band-projected stand-in band, Fermi-Amaldi mean field, Koopmans ionization energies. Occupied shells by hand: ${occupiedText(byHand)}. Spinless: ${occupiedText(spinless)}. Spinless maxima, largest first: ${spinlessClosures.join(', ')}. The factor 2 is put in by hand and labeled so; the model supplies no two-valued label (E-SPN-0044), and its three-valued role is E-MTR-0012. First run, 2026-09-25, status fail, and every failure stands. The control fails on the husk lattice core, not on the counting: the charge-4 well's levels over Z^2 Ry are 1s -4.000, 2s -0.546, 2p -0.288 (3), 3s -0.193, 3p -0.128 (3), 3d as e_g -0.119 (2) and t_2g -0.118 (3), so the n^2 = 4 and 9 degeneracies survive for l > 0 (p exactly threefold, d split 2 + 3 by the cubic husk by 0.001) but every s level falls out of its shell (a quantum defect, 24 pi G(0) = 3.98), and the gap 2s to 2p outgrows 2p to 3s. The mean-field series fails the same way: the s levels are deep, the by-hand atoms put a d-labeled level among the occupied from Z = 17, potassium and calcium end in 3p rather than 4s, the ionization energy peaks at 2 and 10 but not at 18, and 9 of the 22 atoms missed the density tolerance in 40 cycles; the deepest potential passes the band gap 2 pi / 3 from Z = 4 spinless and Z = 9 by hand, where the band-projected stand-in stops being what the walk would do. The spinless series peaks at 1 and 5 and its tenth stand-in enters 4s, but 9 is not a maximum (Z = 7 put a stand-in in 4s before 3p). A shell test needs a0 well above 3 husk spacings.`,
    })
  },
})
