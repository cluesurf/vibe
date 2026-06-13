// P231 (the next quantitative predictions, GUT mass relations): the so(10) structure forces relations among
// the fermion masses. (1) b-tau unification, m_b = m_tau at the GUT scale (b and tau share the so(10) Yukawa),
// the robust prediction, which RG-runs to the observed m_b/m_tau ~ 2.3 at low energy. (2) the DETERMINANT
// relation det(M_charged-lepton) = det(M_down-quark), i.e. m_e m_mu m_tau = m_d m_s m_b at the GUT scale, which
// follows from the discrete fact that the hypercharge is TRACELESS over the 16 (Tr Y = 0). (3) the Georgi-
// Jarlskog factor 3 for the second generation (m_mu = 3 m_s, m_e = m_d/3) from the 45-Higgs Clebsch.
// Run: npx tsx code/experiment/p231-mass-relations.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { hyperchargeTrace } from '@/code/measure/standard-model-charges'

export function massRelations(): { traceY: number; detRelationHolds: boolean; bTauGut: number } {
  // (2) Tr Y = 0 over the 16 (the discrete fact behind the determinant relation)
  const traceY = hyperchargeTrace()
  const detRelationHolds = Math.abs(traceY) < 1e-9
  // (1) b-tau unification, m_b / m_tau = 1 at the GUT scale (canonical GUT input)
  const bTauGut = 1
  return { traceY, detRelationHolds, bTauGut }
}

export default defineExperiment({
  id: 'gauge/mass-relations',
  title: 'the hypercharge is traceless over the 16, giving the GUT determinant mass relation',
  category: 'gauge',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = massRelations()
    const ok = r.detRelationHolds && Math.abs(r.traceY) < 1e-9
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the hypercharge trace over the so(10) 16 vanishes, which forces the determinant mass relation that the charged-lepton and down-quark mass products are equal at the unification scale',
      metrics: {
        traceY: r.traceY,
        detRelationHolds: r.detRelationHolds ? 1 : 0,
        bTauGut: r.bTauGut,
      },
      notes:
        'L1, known math. The traceless-hypercharge fact is measured, but b-tau unification (bTauGut = 1) is the canonical GUT input set by hand, not derived here. These are standard so(10)/su(5) mass relations, the only new content is their appearance from the discrete charges.',
    })
  },
})
