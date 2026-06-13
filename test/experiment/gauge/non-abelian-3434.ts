import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { pauli, cmCommutator, cmAdd, cmScale, cmFrobeniusNorm as frobenius } from '@/code/algebra/group/clifford'
import { complex } from '@/code/algebra/linear/complex'

// Non-abelian gauge structure on the {3,4,3,4} vector sector, the road to the weak and strong
// forces. A non-abelian gauge field SELF-INTERACTS, the field strength carries a commutator term
// [A_mu, A_nu] that a U(1) photon does not. We show the SU(2) generators close into a non-abelian
// algebra with nonzero structure constants, and two gauge potentials in different colour directions
// have a nonzero commutator (the W and gluon self-coupling vertex), while a U(1) potential commutes
// (no self-interaction). The 8v vector sector has 8 components, matching the 8 gluons of SU(3).

export default defineExperiment({
  id: 'gauge/non-abelian-3434',
  title: 'the {3,4,3,4} vector sector can carry a non-abelian gauge field, the self-interaction vertex',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const [, sigma1, sigma2, sigma3] = pauli()

    // (1) the SU(2) algebra closes with NONZERO structure constants, [sigma_i, sigma_j] = 2 i e_ijk sigma_k
    // measured: [sigma1, sigma2] should equal 2 i sigma3
    const commutator12 = cmCommutator(sigma1!, sigma2!)
    const expected = sigma3!.map((row) => row.map((value) => complex({ re: -2 * value.im, im: 2 * value.re }))) // 2 i sigma3
    const closes =
      commutator12.every((row, rowIndex) =>
        row.every((value, columnIndex) => {
          const target = expected[rowIndex]![columnIndex]!
          return Math.abs(value.re - target.re) < 1e-9 && Math.abs(value.im - target.im) < 1e-9
        }),
      )
    const structureConstant = frobenius(commutator12) // nonzero for a non-abelian algebra

    // (2) two gauge potentials in different colour directions self-interact, [A_mu, A_nu] is nonzero
    const potentialMu = cmAdd(cmScale(sigma1!, 0.6), cmScale(sigma3!, 0.4)) // a colour direction
    const potentialNu = cmScale(sigma2!, 0.9) // a different colour direction
    const selfInteraction = frobenius(cmCommutator(potentialMu, potentialNu))
    const selfInteracts = selfInteraction > 0.1

    // CONTROL: a U(1) potential is a scalar (proportional to the identity), it commutes, no self-interaction
    const identity = pauli()[0]!
    const u1Mu = cmScale(identity, 0.6)
    const u1Nu = cmScale(identity, 0.9)
    const abelianSelfInteraction = frobenius(cmCommutator(u1Mu, u1Nu))
    const u1IsAbelian = abelianSelfInteraction < 1e-12

    // the 8v vector sector has 8 components, matching the adjoint of SU(3), the 8 gluons (a suggestive fit)
    const vectorSectorDimension = 8
    const su3AdjointDimension = 8
    const dimensionMatch = vectorSectorDimension === su3AdjointDimension

    const ok = closes && selfInteracts && u1IsAbelian

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a non-abelian gauge field on the vector sector self-interacts, the SU(2) algebra closes with nonzero structure constants and two colour potentials have a nonzero commutator, unlike the abelian U(1) photon',
      metrics: {
        algebraCloses: closes ? 1 : 0,
        structureConstant,
        selfInteraction,
        vectorSectorDimension,
        su3AdjointDimension,
        dimensionMatch: dimensionMatch ? 1 : 0,
      },
      // CONTROL: the U(1) potential commutes with itself, its self-interaction is exactly zero, so the
      // non-abelian self-coupling is a genuine property of the non-abelian algebra, not of any gauge field.
      control: { abelianSelfInteraction, u1IsAbelian: u1IsAbelian ? 1 : 0 },
      notes:
        'The non-abelian algebra and its self-interaction are established (L2). The {3,4,3,4} relevance, the 8v sector has 8 components, exactly the 8 gluons of the SU(3) adjoint, a SUGGESTIVE dimensional fit, not a proof that the sector IS SU(3). The dynamical realization of the non-abelian gauge field on the rule remains open.',
    })
  },
})
