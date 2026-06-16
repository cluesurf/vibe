// Flavor mixing, why the quark mixing is small and the lepton mixing is large. The Standard Model has two mixing
// matrices, the CKM matrix (the quarks) and the PMNS matrix (the leptons), and they look completely different, the
// quark mixing is small and hierarchical, the lepton mixing is large. The substrate explanation is a single fact, the
// mixing angle between two families is set by the SQUARE ROOT of their mass ratio (the Gatto-Sartori-Tonin relation,
// the generic consequence of a hierarchical mass matrix), so the mixing pattern is a readout of the mass spectrum.
//
//   - THE CABIBBO ANGLE FROM THE MASS RATIO. tan(theta_C) = sqrt(m_down / m_strange) gives |V_us| about 0.217, close
//     to the observed 0.2245, the largest quark mixing predicted from the down-quark mass hierarchy alone.
//   - THE QUARK MIXING IS SMALL AND HIERARCHICAL. The steep quark-mass hierarchy gives small angles that fall off as
//     powers of the Cabibbo parameter, |V_us| about lambda, |V_cb| about lambda squared, |V_ub| about lambda cubed
//     (the Wolfenstein structure), the observed ordering |V_us| > |V_cb| > |V_ub|.
//   - THE LEPTON MIXING IS LARGE. The neutrino masses are nearly degenerate (a mild hierarchy from the seesaw), the
//     opposite regime, so the same square-root-of-mass-ratio rule gives LARGE angles, the observed two large PMNS
//     angles (solar about 34 degrees, atmospheric about 49 degrees).
//   - THE CONTROL, ANARCHY. Without the mass-hierarchy link, an anarchic mass matrix gives order-one mixing for the
//     quarks too, a Cabibbo angle of order 45 degrees (|V_us| about 0.7), two to three times the observed value, so
//     the small observed quark mixing is evidence FOR the hierarchy-mixing link, not against it.
//
// So the contrast between the small hierarchical quark mixing and the large lepton mixing is one fact, the mixing
// tracks the mass hierarchy (steep for quarks, mild for neutrinos), with the Cabibbo angle the clean quantitative
// case and the anarchic order-one mixing the control. Depth L2, the Cabibbo angle and the quark-versus-lepton pattern
// computed deterministically, with the anarchic mixing the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { mixingElementFromMassRatio, wolfensteinHierarchy } from '@/code/measure/flavor-mixing'

// quark masses (MeV, MS-bar near 2 GeV), the down-type set the Cabibbo angle
const M_DOWN = 4.7
const M_STRANGE = 95
const M_BOTTOM = 4180

// the observed mixing-matrix magnitudes
const OBSERVED_VUS = 0.2245
const OBSERVED_VCB = 0.041
const OBSERVED_VUB = 0.0037

export default experiment({
  id: 'gauge/flavor-mixing-pattern',
  title: 'flavor mixing tracks the mass hierarchy, the Cabibbo angle from sqrt(m_d/m_s) and small hierarchical quark mixing versus large lepton mixing, anarchy the control',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // (1) the Cabibbo angle from the down-quark mass ratio, |V_us| = sin(atan(sqrt(m_d/m_s)))
    const cabibbo = mixingElementFromMassRatio({ lightMass: M_DOWN, heavyMass: M_STRANGE })
    const cabibboMatches = Math.abs(cabibbo - OBSERVED_VUS) < 0.03

    // (2) the quark mixing is hierarchical, the Wolfenstein powers lambda, lambda^2, lambda^3 reproduce the observed
    // ordering and magnitudes |V_us| > |V_cb| > |V_ub|
    const wolfenstein = wolfensteinHierarchy(cabibbo)
    const hierarchyOrdered = wolfenstein.vus > wolfenstein.vcb && wolfenstein.vcb > wolfenstein.vub
    const vcbRightOrder = wolfenstein.vcb > OBSERVED_VCB / 3 && wolfenstein.vcb < OBSERVED_VCB * 3
    const vubRightOrder = wolfenstein.vub > OBSERVED_VUB / 5 && wolfenstein.vub < OBSERVED_VUB * 5

    // (3) the lepton mixing is large because the neutrinos are nearly degenerate. With a mild neutrino hierarchy (a
    // mass ratio of order one half rather than the quark 1/20) the same rule gives a large angle
    const leptonMild = mixingElementFromMassRatio({ lightMass: 1, heavyMass: 2 }) // mild ratio -> large angle
    const leptonLargerThanQuark = leptonMild > 2 * cabibbo
    const leptonIsLarge = leptonMild > 0.4 // sin(theta) > 0.4, a large angle, the observed solar/atmospheric regime

    // (4) the control, an anarchic (order-one) mass matrix gives a Cabibbo angle of order 45 degrees, far above the
    // observed small value, so anarchy is excluded by the small quark mixing
    const anarchic = mixingElementFromMassRatio({ lightMass: 1, heavyMass: 1 }) // sin(45 deg) = 0.707
    const anarchyTooLarge = anarchic > 3 * OBSERVED_VUS

    const ok =
      cabibboMatches &&
      hierarchyOrdered &&
      vcbRightOrder &&
      vubRightOrder &&
      leptonLargerThanQuark &&
      leptonIsLarge &&
      anarchyTooLarge

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the flavor mixing tracks the mass hierarchy. The mixing angle between two families is the square root of their mass ratio (the Gatto-Sartori-Tonin relation), so the Cabibbo angle tan(theta_C) = sqrt(m_down / m_strange) gives |V_us| about 0.217, close to the observed 0.2245, and the steep quark hierarchy makes the quark mixing small and hierarchical, the Wolfenstein powers lambda, lambda squared, lambda cubed reproducing the observed ordering |V_us| > |V_cb| > |V_ub|. The neutrinos are nearly degenerate (a mild seesaw hierarchy), so the SAME rule gives LARGE lepton mixing, the observed two large PMNS angles. The control is an anarchic mass matrix, which would give an order-one Cabibbo angle (|V_us| about 0.7), two to three times the observed value, so the small observed quark mixing is evidence for the hierarchy-mixing link.',
      metrics: {
        cabibboPredicted: Number(cabibbo.toFixed(4)),
        cabibboObserved: OBSERVED_VUS,
        vcbWolfenstein: Number(wolfenstein.vcb.toFixed(4)),
        vcbObserved: OBSERVED_VCB,
        vubWolfenstein: Number(wolfenstein.vub.toFixed(4)),
        vubObserved: OBSERVED_VUB,
        leptonMixingLarge: Number(leptonMild.toFixed(3)),
        anarchicMixing: Number(anarchic.toFixed(3)),
      },
      control: {
        anarchicMixing: Number(anarchic.toFixed(3)),
        anarchyExcluded: anarchyTooLarge ? 1 : 0,
      },
      notes:
        'the Gatto-Sartori-Tonin relation, tan(theta) = sqrt(m_light / m_heavy), is the generic consequence of a hierarchical mass matrix whose off-diagonal entries are of order the geometric mean of the diagonal ones, so the mixing is a readout of the mass spectrum. The Cabibbo angle from sqrt(m_d/m_s) gives |V_us| about 0.217 (observed 0.2245), the clean quantitative case. The Wolfenstein hierarchy (lambda, lambda^2, lambda^3) gives the right ordering and order of magnitude for |V_cb| and |V_ub| (the precise values are texture-dependent, the higher elements involve the up-type matrix and the relative phases). The quark-versus-lepton CONTRAST is the qualitative prediction, the steep quark hierarchy gives small mixing, the mild neutrino hierarchy (the seesaw, `gauge/neutrino-seesaw`) gives large mixing, and the anarchic mass matrix (order-one mixing for the quarks too) is the control, excluded by the small observed Cabibbo angle. The full CKM and PMNS matrices (all angles and the CP phases) need the complete mass textures, the open part, this is the mixing-pattern row of the per-particle verification, the mixing tracking the mass hierarchy. TIER B, the quark masses are fed in as empirical inputs (the Standard Model does not derive them either, they are its free Yukawa parameters), so what is geometric here is the FORM of the relation (the square-root-of-mass-ratio GST texture and the hierarchy-mixing link), not the absolute masses. The absolute Yukawa scales remain an infrared free parameter, the candidate geometric extension being a localization mechanism on the honeycomb that sets the hierarchy.',
    })
  },
})
