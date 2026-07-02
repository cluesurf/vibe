// The root-to-mass campaign, the adversarial scope check it needed: does the mechanism
// over-predict? This is the honest boundary of the whole Koide arc (E-FRC-0057..0062) and a
// falsifiable handle, so it is recorded rather than left implicit.
//
// The sector mechanism (E-FRC-0062) builds the Koide relation from the triality-sector
// geometry of THREE generations. Nothing in that construction singles out charged leptons, so
// it predicts Q = 2/3 for ANY three-generation fermion triple. That is a strong, falsifiable
// claim, and it is tested here against the quarks and against the leptons.
//
// The result is a partial FALSIFICATION of the universal reading, and it is stated plainly:
//   - charged leptons satisfy Q = 2/3 to about one part in a hundred thousand (sharp),
//   - down quarks give Q about 0.73 (off by about 0.065),
//   - up quarks give Q about 0.85 (off by about 0.18, far outside any mass uncertainty).
// So the mechanism as built is NOT generation-universal. Only the charged leptons hit 2/3
// sharply. Either the mechanism is specific to the leptons for a reason the theory has not yet
// supplied, or the leptonic coincidence is partly numerical. This is the honest scope limit of
// the campaign: it realizes the leptonic Koide relation, it does not explain why the leptons
// and not the quarks.
//
// What this is worth: it is the adversarial test of the campaign's own result, and it locates
// the real next question (what distinguishes the lepton sector). It is also a genuine
// falsifiable statement, quarks demonstrably do not obey Q = 2/3, so a universal-Koide theory
// is ruled out, and the surviving claim is the leptonic one plus an open lepton-specificity.
//
// Grade L1: Koide Q computed for all three charged three-generation triples (exact given the
// masses), with the honest finding that only the leptons are sharp. The control is that Q is
// bounded in [1/3, 1] for any positive triple, so hitting 2/3 is nontrivial but the quarks
// landing elsewhere in that range is the real content.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function koideQ(masses: number[]): number {
  const sum = masses.reduce((s, m) => s + m, 0)
  const rootSum = masses.reduce((s, m) => s + Math.sqrt(m), 0)

  return sum / (rootSum * rootSum)
}

// PDG masses in MeV. Charged leptons are pole masses (precise); quark values are MSbar running
// masses with real uncertainty, especially the light quarks, but the up-quark Q is far enough
// from 2/3 that the uncertainty cannot rescue it.
const CHARGED_LEPTONS = [0.51099895, 105.6583755, 1776.86]
const UP_QUARKS = [2.16, 1270, 172690]
const DOWN_QUARKS = [4.67, 93.4, 4180]

export default experiment({
  id: 'gauge/koide-scope-quarks',
  code: 'E-FRC-0063',
  title:
    'the sector Koide mechanism predicts Q = 2/3 for any three-generation triple, but only charged leptons satisfy it sharply (one part in a hundred thousand) while up quarks give 0.85 and down quarks 0.73, so the mechanism is lepton-specific or incomplete, the honest scope limit of the campaign and a falsifiable handle',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const qLeptons = koideQ(CHARGED_LEPTONS)
    const qUp = koideQ(UP_QUARKS)
    const qDown = koideQ(DOWN_QUARKS)

    const leptonDev = Math.abs(qLeptons - 2 / 3)
    const upDev = Math.abs(qUp - 2 / 3)
    const downDev = Math.abs(qDown - 2 / 3)

    // 1. the charged leptons satisfy Q = 2/3 sharply.
    const leptonsSharp = leptonDev < 1e-4

    // 2. the up quarks do NOT (far outside any mass uncertainty).
    const upQuarksFail = upDev > 0.1

    // 3. the down quarks do not hit it sharply either.
    const downQuarksNotSharp = downDev > 0.02

    // the honest claim of the experiment is the SCOPE finding: leptons sharp, quarks not, so
    // the mechanism is not universal. That claim is what must hold for a pass.
    const scopeLimitEstablished =
      leptonsSharp && upQuarksFail && downQuarksNotSharp

    return verdict({
      status: scopeLimitEstablished ? 'pass' : 'fail',
      claim:
        'the sector Koide mechanism, built from three generations with nothing singling out the leptons, predicts Q = 2/3 for any three-generation fermion triple, but only the charged leptons satisfy it sharply (deviation about one part in a hundred thousand) while up quarks give Q about 0.85 and down quarks about 0.73, both outside what mass uncertainty can rescue, so the universal reading is falsified and the mechanism is lepton-specific or incomplete, which is the honest scope boundary of the campaign and locates the real open question of what distinguishes the lepton sector',
      metrics: {
        qChargedLeptons: Number(qLeptons.toFixed(5)),
        qUpQuarks: Number(qUp.toFixed(5)),
        qDownQuarks: Number(qDown.toFixed(5)),
        leptonDeviation: Number(leptonDev.toExponential(2)),
        upQuarkDeviation: Number(upDev.toFixed(4)),
        downQuarkDeviation: Number(downDev.toFixed(4)),
        target: Number((2 / 3).toFixed(5)),
      },
      control: {
        // Q lies in [1/3, 1] for any positive triple, so 2/3 is a nontrivial middle value.
        // The quarks landing at 0.85 and 0.73, NOT at 2/3, is the real content: a universal
        // mechanism would have put them at 2/3 too. That it does not is the falsification.
        qUpQuarks: Number(qUp.toFixed(5)),
        qDownQuarks: Number(qDown.toFixed(5)),
      },
      notes:
        'L1, an honest scope limit and adversarial check on E-FRC-0057..0062. Only the charged leptons hit Q = 2/3 sharply; up quarks (0.85) and down quarks (0.73) do not, ruling out a generation-universal reading of the sector mechanism. The campaign realizes the LEPTONIC Koide relation but does not explain why the leptons and not the quarks, which is the real next question (a lepton-specific ingredient the theory has not supplied). Quark masses carry uncertainty, but the up-quark deviation (0.18) is far outside it. This is a genuine falsifiable statement: a universal-Koide theory is excluded by the quarks. Recorded so the campaign owns its boundary rather than implying a universality it does not have.',
    })
  },
})
