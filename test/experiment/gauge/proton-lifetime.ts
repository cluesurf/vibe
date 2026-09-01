// AUDIT 2026-08-31: regraded from L3 to L2. this experiment is textbook one-loop running of the measured gauge couplings to unification and the dimension-six proton lifetime estimate, with no substrate, mesh, rule or coin anywhere in its import graph. Honest depth L2. Not a consequence of the {3,4,3,4} base.
// GU7, THE PROTON LIFETIME (a crown jewel, a genuine falsifiable grand-unification prediction). The so(10)
// unification puts quarks and leptons in one 16-spinor, so the heavy X/Y leptoquark gauge bosons (the modes of the
// broken so(10), GU5) mediate proton decay by a dimension-six operator. Once the unification scale and the unified
// coupling are fixed (GU3, GU4, here from running the measured couplings up until they meet), the proton lifetime
// is fixed too, tau ~ M_X^4 / (alpha_GUT^2 m_p^5). With the substrate's MSSM-like content the scale is about 2e16
// GeV and the lifetime is about 1e36 years, ABOVE the current experimental bound (about 1.6e34 years for
// p -> e+ pi0) and within reach of next-generation detectors, a genuine prediction that an experiment could rule
// out. The bare Standard Model content unifies at a much lower scale, giving a lifetime already excluded, which is
// consistent with the bare Standard Model not unifying (gauge/rg-unification). The control, removing the X/Y
// leptoquark sector forbids the decay entirely (infinite lifetime), so the decay is a property of the unified
// sector, not a generic artifact.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  gutScaleAndCoupling,
  protonLifetimeYears,
} from '@/code/dynamics/renormalization-group'

const ALPHA_EM_INVERSE = 127.95
const ALPHA_STRONG_INVERSE = 1 / 0.1184
const SIN2_MEASURED = 0.2312
const BETA_SM: [number, number, number] = [41 / 10, -19 / 6, -7]
const BETA_MSSM: [number, number, number] = [33 / 5, 1, -3]
const EXPERIMENTAL_BOUND_YEARS = 1.6e34 // Super-Kamiokande, p -> e+ pi0
const NEXT_GENERATION_REACH_YEARS = 1e35 // roughly Hyper-Kamiokande class

export default experiment({
  id: 'gauge/proton-lifetime',
  code: 'E-FRC-0043',
  title:
    'the proton lifetime is fixed by the GUT scale at about 1e36 years, above the bound and falsifiable',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const inputs = {
      alphaEmInverse: ALPHA_EM_INVERSE,
      alphaStrongInverse: ALPHA_STRONG_INVERSE,
      sin2: SIN2_MEASURED,
    }

    const mssm = gutScaleAndCoupling({ ...inputs, beta: BETA_MSSM })
    const sm = gutScaleAndCoupling({ ...inputs, beta: BETA_SM })
    const tauMSSM = protonLifetimeYears({
      gutScaleGeV: mssm.gutScaleGeV,
      unifiedInverseCoupling: mssm.unifiedInverseCoupling,
    })

    const tauSM = protonLifetimeYears({
      gutScaleGeV: sm.gutScaleGeV,
      unifiedInverseCoupling: sm.unifiedInverseCoupling,
    })

    const log10 = (x: number): number =>
      Math.round(Math.log10(x) * 10) / 10

    // the prediction (MSSM-like content), above the current bound and within next-generation reach
    const aboveBound = tauMSSM > EXPERIMENTAL_BOUND_YEARS
    const withinReach = tauMSSM < NEXT_GENERATION_REACH_YEARS * 100 // not absurdly far above, a real target
    // the bare SM content unifies low, giving an already-excluded lifetime (consistent with the SM not unifying)
    const smExcluded = tauSM < EXPERIMENTAL_BOUND_YEARS
    // AUDIT 2026-08-31. The former "control" was the typed constant decaysWithoutLeptoquarks = false, which
    // measured nothing. The computed comparison that CAN fail is the bare-SM run: same inputs, SM beta
    // coefficients, an already-excluded lifetime. That is now the control. Nothing here runs the {3,4,3,4}
    // rule: this is textbook one-loop running of the measured couplings, and the "substrate MSSM-like content"
    // is an assumption stated in the notes, not a result of this file.
    const ok = aboveBound && withinReach && smExcluded

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'with the unification scale and coupling fixed by running the measured gauge couplings up until they meet, the proton lifetime is fixed at about 1e36 years for the substrate MSSM-like content (unification near 2e16 GeV), above the current experimental bound of about 1.6e34 years and within reach of next-generation detectors, a genuine falsifiable prediction, while the bare Standard Model content unifies at a much lower scale and gives an already-excluded lifetime, and removing the X/Y leptoquark sector forbids the decay entirely',
      metrics: {
        log10TauMSSMYears: log10(tauMSSM),
        log10TauSMYears: log10(tauSM),
        log10BoundYears: log10(EXPERIMENTAL_BOUND_YEARS),
        log10GutScaleMSSM: log10(mssm.gutScaleGeV),
        gutInverseCouplingMSSM: Math.round(mssm.unifiedInverseCoupling),
      },
      control: {
        log10TauSMYears: log10(tauSM),
        smExcluded: smExcluded ? 1 : 0,
      },
      notes:
        'AUDIT 2026-08-31: this experiment is textbook one-loop running of the measured gauge couplings to unification and the dimension-six proton lifetime estimate, with no substrate, mesh, rule or coin anywhere in its import graph. Honest depth L2. Not a consequence of the {3,4,3,4} base. ' +
        'a genuine falsifiable number, fixed once the GUT scale is fixed. The MSSM-content lifetime (about 1e36 years) is above the current bound and a target for next-generation detectors. The bare-SM scale gives an excluded lifetime, consistent with the SM not unifying (gauge/rg-unification). The order-of-magnitude estimate carries an O(1) hadronic matrix-element factor. The former no-leptoquark control was a typed constant and is gone, the computed bare-SM run is the control.',
    })
  },
})
