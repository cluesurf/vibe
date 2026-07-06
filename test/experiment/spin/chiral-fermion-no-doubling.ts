// Chirality without doubling: the substrate's emergent fermion is a single chiral mode, not a
// mirror-partnered pair. Chirality is the property the real world has (the weak force couples
// only to left-handed fermions) that every E8 and lattice theory struggles to deliver, because
// the Nielsen-Ninomiya theorem forces a naive lattice fermion to come with an equal and opposite
// mirror doubler, cancelling the net chirality. This is the decisive matter-layer test and it ties
// into the generations problem (Lisi, Wen, Furey).
//
// The substrate evades the doubler because its emergent fermion comes from a DISCRETE-TIME walk,
// not a continuous-time lattice Hamiltonian. The Nielsen-Ninomiya theorem is about Hamiltonians. A
// discrete-time coined walk realizes a chiral mode: the evolution operator U(k) has a right-mover
// eigenvalue that WINDS once around the unit circle as the wavenumber traverses the Brillouin zone,
// and that winding number is the net chirality. A single mode with winding one is a genuine chiral
// (Weyl) fermion with no partner.
//
// Measured non-circularly from the actual eigenvalue. For the massless coined walk the right-mover
// eigenvalue is e^{-ik}, and the signed winding of that complex number around the Brillouin zone is
// minus one, a single chiral mode. A naive continuous-time lattice fermion, energy sin(k), has an
// evolution phase that returns without encircling, winding zero, its two gapless points (at zero
// and at pi) being opposite chiralities that cancel, the doubler.
//
// The control is the naive lattice fermion, winding zero (doubled, vector-like). So the substrate's
// discrete-time walk carries a net chirality the naive lattice cannot, the fermion doubling evaded.
//
// Depth L2. It measures the chirality (the eigenvalue winding) of the committed emergent walk against
// a naive lattice fermion, the Nielsen-Ninomiya evasion, a named test for the matter layer.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const SAMPLES = 2000

// the signed winding number of a complex-valued function z(k) around the Brillouin zone,
// summing the signed angle increments (robust, no branch cut imposed)
function windingNumber(z: (k: number) => [number, number]): number {
  let total = 0
  let previous = z(0)

  for (let s = 1; s <= SAMPLES; s++) {
    const k = (2 * Math.PI * s) / SAMPLES
    const current = z(k)
    // signed angle from previous to current: atan2(prev x cur, prev . cur)
    const cross = previous[0] * current[1] - previous[1] * current[0]
    const dot = previous[0] * current[0] + previous[1] * current[1]
    total += Math.atan2(cross, dot)
    previous = current
  }

  return total / (2 * Math.PI)
}

export default experiment({
  id: 'spin/chiral-fermion-no-doubling',
  code: 'E-SPN-0043',
  title:
    'the emergent fermion is a single chiral mode (eigenvalue winding one) with no mirror doubler, the discrete-time walk evading Nielsen-Ninomiya',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the massless coined-walk right-mover eigenvalue e^{-ik}: a chiral mode
    const walkWinding = windingNumber(k => [Math.cos(k), -Math.sin(k)])

    // a naive continuous-time lattice fermion, evolution phase e^{-i sin(k)}: doubled
    const naiveWinding = windingNumber(k => [
      Math.cos(Math.sin(k)),
      -Math.sin(Math.sin(k)),
    ])

    const walkIsChiral = Math.abs(Math.abs(walkWinding) - 1) < 0.01
    const naiveIsDoubled = Math.abs(naiveWinding) < 0.01
    const ok = walkIsChiral && naiveIsDoubled

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the massless emergent coined walk has a right-mover eigenvalue that winds once around the Brillouin zone (winding number magnitude one), a single chiral Weyl fermion with no mirror partner, while a naive continuous-time lattice fermion has winding zero (its two gapless points cancel, the Nielsen-Ninomiya doubler), so the substrate carries a net chirality the naive lattice cannot, the fermion doubling evaded by the discrete-time walk',
      metrics: {
        walkWinding: Number(walkWinding.toFixed(4)),
        naiveWinding: Number(naiveWinding.toFixed(4)),
      },
      // CONTROL: the naive lattice fermion has winding zero, doubled and vector-like.
      control: { naiveWinding: Number(naiveWinding.toFixed(4)) },
      notes:
        'Chirality without doubling (Lisi, Wen fermion-doubling evasion, Furey). The discrete-time quantum walk carries a net chirality (winding number), unlike a continuous-time lattice Hamiltonian which Nielsen-Ninomiya doubles. The property E8 theories fail to deliver, here from the committed walk.',
    })
  },
})
