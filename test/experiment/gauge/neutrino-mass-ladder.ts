// The neutrinos on the honeycomb shell ladder, why their hierarchy is mild and their mixing is large. The charged
// fermions sit on the {3,4,3,4} shell ladder with steep spacing, each generation about one to two shells (factors of
// the growth rate lambda about 18.4) below the next (`gauge/mass-hierarchy-localization`). This experiment places the
// neutrinos on the same ladder and finds they are the MILDEST sector, which is the geometric origin of the large
// lepton (PMNS) mixing.
//
//   - THE NEUTRINO LADDER IS SUB-SHELL. From the measured mass-squared splittings (solar and atmospheric), the
//     neutrino mass ratio m3 / m2 is about 5.9, which in shell units is lambda to the power about 0.6, LESS than one
//     shell. Every charged sector has its third-to-second generation spacing wider than one shell-ish (the tau-to-muon
//     about one shell, the top-to-charm about 1.7, the bottom-to-strange about 1.3), so the neutrinos are uniquely
//     mild, the most degenerate generations.
//   - THE MILDNESS IS THE LARGE MIXING. The mixing angle between two families scales as the square root of their mass
//     ratio (the hierarchy-mixing link, `gauge/flavor-mixing-pattern`), so the mild (sub-shell) neutrino ladder gives
//     LARGE mixing, while the steep quark ladder gives small mixing. The observed pattern, large PMNS mixing and small
//     CKM mixing, is the neutrinos sitting low on the shell ladder and the quarks spread wide.
//   - THE CONTROL. If the neutrinos had the charged-fermion steepness (more than one shell per generation), their
//     mixing would be small like the quark (CKM) mixing. The observed sub-shell spacing is what makes the lepton
//     mixing large, so the mild ladder and the large mixing are the same fact.
//
// So the neutrinos are the mildest sector on the {3,4,3,4} shell ladder (sub-shell spacing, lambda to the power about
// 0.6 between the heaviest two), and that mildness is the geometric origin of the large PMNS mixing, with the
// hypothetical steep-neutrino case (small mixing) the control. HONESTLY this is a Tier-B consistency check, it uses
// the measured neutrino mass splittings, and the full largeness of the mixing needs the seesaw and the texture beyond
// the naive square-root-of-ratio estimate, but the qualitative link (mild ladder, large mixing) is robust and
// geometric. Depth L2, the neutrino shell spacing computed from the measured splittings and the geometric lambda, with
// the steep-neutrino hypothetical the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildAddressing } from '@/code/substrate/coxeter/addressing-3434'
import { growthRatioFromShellCounts, shellCountsFromGraph, shellSeparationExponent } from '@/code/measure/shell-growth'

// the measured neutrino mass-squared splittings (eV^2), normal ordering, the lightest mass taken near zero
const SOLAR_SPLITTING = 7.5e-5
const ATMOSPHERIC_SPLITTING = 2.5e-3
// the charged-sector third-to-second generation mass ratios (for comparison), observed masses (MeV)
const TAU_OVER_MUON = 1776.9 / 105.66
const TOP_OVER_CHARM = 172690 / 1270
const BOTTOM_OVER_STRANGE = 4180 / 93.4

export default experiment({
  id: 'gauge/neutrino-mass-ladder',
  title: 'the neutrinos are the mildest sector on the {3,4,3,4} shell ladder (sub-shell spacing), the geometric origin of the large PMNS mixing, the steep-neutrino case the control',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the derived geometric growth rate lambda from the honeycomb cell-shell counts
    const addressing = buildAddressing({ maxCells: 60000 })
    const shellCounts = shellCountsFromGraph({
      neighbors: addressing.graph.neighbors,
      cellCount: addressing.graph.cellCount,
    })
    const lambda = growthRatioFromShellCounts(shellCounts).ratio

    // the neutrino masses from the splittings (m1 about 0), m2 = sqrt(solar), m3 = sqrt(atmospheric + solar)
    const m2 = Math.sqrt(SOLAR_SPLITTING)
    const m3 = Math.sqrt(ATMOSPHERIC_SPLITTING + SOLAR_SPLITTING)
    const neutrinoSpacing = shellSeparationExponent({ ratio: m3 / m2, growthRate: lambda })

    // the charged-sector spacings, for comparison
    const leptonSpacing = shellSeparationExponent({ ratio: TAU_OVER_MUON, growthRate: lambda })
    const upSpacing = shellSeparationExponent({ ratio: TOP_OVER_CHARM, growthRate: lambda })
    const downSpacing = shellSeparationExponent({ ratio: BOTTOM_OVER_STRANGE, growthRate: lambda })

    // the neutrino spacing is sub-shell (less than one) and the mildest of all sectors
    const neutrinoSubShell = neutrinoSpacing < 1
    const neutrinoMildest =
      neutrinoSpacing < leptonSpacing && neutrinoSpacing < upSpacing && neutrinoSpacing < downSpacing

    // the hierarchy-mixing link, the mixing scales as the square root of the mass ratio, so the mild neutrino ladder
    // gives a large angle and a steep ladder a small angle (the control)
    const neutrinoMixingScale = Math.sqrt(m2 / m3) // sqrt of the inverse ratio, the mixing magnitude
    const steepHypotheticalMixing = Math.sqrt(1 / (lambda * lambda)) // if neutrinos were two shells apart (steep)
    const mildGivesLargerMixing = neutrinoMixingScale > 5 * steepHypotheticalMixing

    const ok = neutrinoSubShell && neutrinoMildest && mildGivesLargerMixing

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the neutrinos are the mildest sector on the {3,4,3,4} shell ladder, and that mildness is the geometric origin of the large lepton mixing. From the measured splittings the neutrino mass ratio m3 / m2 is about 5.9, which is lambda to the power about 0.6, less than one shell, milder than every charged sector (the charged third-to-second spacings are about one to 1.7 shells). Because the mixing angle scales as the square root of the mass ratio, the mild (sub-shell) neutrino ladder gives large PMNS mixing while the steep quark ladder gives small CKM mixing. The control is a hypothetical steep neutrino ladder (more than one shell per generation), which would give small mixing like the quarks, so the observed sub-shell spacing and the large mixing are the same fact.',
      metrics: {
        growthRateLambda: Number(lambda.toFixed(3)),
        neutrinoSpacing: Number(neutrinoSpacing.toFixed(3)),
        leptonSpacing: Number(leptonSpacing.toFixed(3)),
        upSpacing: Number(upSpacing.toFixed(3)),
        downSpacing: Number(downSpacing.toFixed(3)),
        neutrinoMassRatio: Number((m3 / m2).toFixed(3)),
        neutrinoMixingScale: Number(neutrinoMixingScale.toFixed(3)),
        steepHypotheticalMixing: Number(steepHypotheticalMixing.toFixed(4)),
      },
      control: {
        steepHypotheticalMixing: Number(steepHypotheticalMixing.toFixed(4)),
        mildGivesLargerMixing: mildGivesLargerMixing ? 1 : 0,
      },
      notes:
        'the neutrino masses from the measured splittings (m1 near zero) give m2 about 0.009 eV and m3 about 0.05 eV, so m3 / m2 about 5.9, which is lambda to the power 0.6 (sub-shell). The charged sectors are steeper, tau-to-muon about 0.97 shells, top-to-charm about 1.69, bottom-to-strange about 1.31, so the neutrinos are uniquely mild. The hierarchy-mixing link (mixing about the square root of the mass ratio, `gauge/flavor-mixing-pattern`) then gives the neutrinos large mixing and the quarks small mixing, the observed PMNS-versus-CKM pattern. TIER B, it uses the measured neutrino splittings, and the full largeness of the mixing (PMNS angles are even larger than the naive square-root-of-ratio estimate) needs the seesaw structure and the textures, so this is the qualitative geometric link (mild shell ladder, large mixing), not the precise angles. The steep-neutrino hypothetical (small mixing) is the control.',
    })
  },
})
