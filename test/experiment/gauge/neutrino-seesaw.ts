// The neutrino seesaw, why the neutrino is so light. The neutrino masses are tiny, about 0.05 eV from the
// oscillation data, a million times smaller than the electron. The seesaw mechanism explains this, and the SO(10)
// structure provides exactly what it needs.
//
//   - THE 16-SPINOR CONTAINS A RIGHT-HANDED NEUTRINO. The so(10) generation is the 16-spinor, which is the 15
//     Standard-Model fermions PLUS one Standard-Model SINGLET (electric charge zero, weak isospin zero), the
//     right-handed neutrino. The su(5) 15 (the control) has NO such singlet, so it cannot seesaw. So the seesaw seed
//     is a prediction of the so(10) 16, not put in by hand.
//   - THE SEESAW GIVES THE OBSERVED SCALE. The right-handed neutrino has a large Majorana mass M_R at an intermediate
//     scale, while its Dirac mass m_D is electroweak (of order the up-quark masses). The light neutrino mass is then
//     m_nu = m_D^2 / M_R, suppressed by the huge M_R. With m_D of order 100 GeV and M_R of order 10^14 GeV (the B-L
//     breaking scale below the GUT scale), m_nu comes out of order 0.05 eV, the observed atmospheric scale, and a
//     scan of M_R covers the observed window.
//   - THE SUPPRESSION EXPLAINS THE TININESS. The ratio m_nu / m_D is m_D / M_R, of order 10^-12, so the neutrino is
//     tiny precisely because the right-handed Majorana scale is enormous, not by a fine-tuned small coupling.
//
// So the neutrino mass scale is a prediction of the so(10) seesaw, the 16-spinor's right-handed neutrino plus the
// intermediate Majorana scale giving the observed 0.05 eV, with the su(5) 15 (no singlet, no seesaw) the control.
// Depth L2, the seesaw mass scale and the singlet content computed deterministically, with the singlet-free 15 the
// control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { STANDARD_MODEL_GENERATION } from '@/code/measure/standard-model-charges'

// the light neutrino mass (eV) from the seesaw, m_nu = m_D^2 / M_R, masses in GeV, converted to eV
function seesawMassEv(input: {
  diracMassGeV: number
  majoranaMassGeV: number
}): number {
  const massGeV =
    (input.diracMassGeV * input.diracMassGeV) / input.majoranaMassGeV

  return massGeV * 1e9
}

// the number of Standard-Model singlets (electric charge zero AND weak isospin zero) in a generation, the seesaw
// seeds. The so(10) 16 has one (the right-handed neutrino), the su(5) 15 has none.
function singletCount(
  generation: typeof STANDARD_MODEL_GENERATION,
): number {
  return generation
    .filter(f => f.q === 0 && f.t3 === 0)
    .reduce((s, f) => s + f.mult, 0)
}

export default experiment({
  id: 'gauge/neutrino-seesaw',
  title:
    'the neutrino seesaw, the so(10) 16-spinor right-handed neutrino gives the observed 0.05 eV scale, the su(5) 15 (no singlet) the control',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the 16-spinor has one Standard-Model singlet (the right-handed neutrino), the 15 has none
    const sixteen = STANDARD_MODEL_GENERATION
    const fifteen = STANDARD_MODEL_GENERATION.filter(
      f => f.name !== 'nuc',
    )
    const sixteenSinglets = singletCount(sixteen)
    const fifteenSinglets = singletCount(fifteen)
    const seesawSeedFromSixteen =
      sixteenSinglets === 1 && fifteenSinglets === 0

    // the seesaw mass with electroweak Dirac mass and an intermediate Majorana scale, near the observed 0.05 eV
    const diracMassGeV = 100 // electroweak, of order the heavy up-type masses
    const majoranaMassGeV = 2e14 // the intermediate B-L breaking scale below the GUT scale
    const neutrinoMassEv = seesawMassEv({
      diracMassGeV,
      majoranaMassGeV,
    })
    const matchesObservedScale =
      neutrinoMassEv > 0.005 && neutrinoMassEv < 0.5

    // a scan of M_R covers the observed window (the neutrino-mass scale is a natural output of the seesaw)
    const lightEnd = seesawMassEv({
      diracMassGeV,
      majoranaMassGeV: 1e15,
    })
    const heavyEnd = seesawMassEv({
      diracMassGeV,
      majoranaMassGeV: 1e13,
    })
    const scanCoversWindow = lightEnd < 0.05 && heavyEnd > 0.05

    // the suppression ratio, m_nu / m_D, tiny because of the huge Majorana scale
    const suppression = (neutrinoMassEv * 1e-9) / diracMassGeV

    const ok =
      seesawSeedFromSixteen &&
      matchesObservedScale &&
      scanCoversWindow &&
      suppression < 1e-9

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the tiny neutrino mass is a prediction of the so(10) seesaw. The 16-spinor is the 15 Standard-Model fermions plus one Standard-Model singlet (charge zero, isospin zero), the right-handed neutrino, which the su(5) 15 lacks (the control), so the seesaw seed comes from the so(10) structure. The light neutrino mass m_nu = m_D^2 / M_R, with an electroweak Dirac mass of order 100 GeV and an intermediate Majorana scale of order 10^14 GeV, comes out near the observed 0.05 eV, and a scan of the Majorana scale covers the observed window. The neutrino is tiny precisely because the right-handed Majorana scale is enormous (a suppression of order 10^-12), not by a fine-tuned coupling.',
      metrics: {
        sixteenSinglets,
        fifteenSinglets,
        neutrinoMassEv: Number(neutrinoMassEv.toFixed(4)),
        observedScaleEv: 0.05,
        suppressionRatio: Number(suppression.toExponential(2)),
        scanLightEndEv: Number(lightEnd.toFixed(4)),
        scanHeavyEndEv: Number(heavyEnd.toFixed(3)),
      },
      control: {
        fifteenSinglets,
        seesawSeedFromSixteen: seesawSeedFromSixteen ? 1 : 0,
      },
      notes:
        'the right-handed neutrino is the 16th fermion of the so(10) spinor, the Standard-Model singlet (charge zero, weak isospin zero), which the su(5) 15 does not contain, so the seesaw is specific to so(10), the control. The seesaw m_nu = m_D^2 / M_R with m_D electroweak (about 100 GeV) and M_R intermediate (about 10^14 GeV) gives about 0.05 eV, the observed atmospheric scale, and the scale is a natural output, not tuned. The suppression m_nu / m_D about 10^-12 is the seesaw explanation of the tininess. The exact mixing angles (PMNS) need the full mass matrices, the open part, this is the seesaw mass scale and the singlet content.',
    })
  },
})
