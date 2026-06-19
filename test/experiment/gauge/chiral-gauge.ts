// P77: chiral gauge theory (the obstruction and its partial resolution).
// P8 gave confinement, the index theorem, and the chiral condensate for a vector gauge theory.
// A genuinely CHIRAL gauge theory, where left-handed and right-handed fermions couple
// differently (as in the weak interaction), is hard on any discrete substrate, by the
// Nielsen-Ninomiya theorem. This experiment is honest about that. It shows the obstruction and
// the route partway around it:
//   1. Fermion doubling. A naive lattice fermion is not one species but 2^d, the extra copies
//      (doublers) sitting at the corners of momentum space, and they come with opposite
//      chiralities that exactly cancel, so a single chiral (Weyl) fermion cannot be isolated.
//   2. The Wilson resolution. A Wilson term gives the doublers a large mass and leaves a single
//      light species, which fixes the VECTOR theory (P8). With the Ginsparg-Wilson and overlap
//      construction this even restores an exact lattice chiral symmetry.
//   3. Open. Coupling only one chirality to the gauge field, with gauge invariance and anomaly
//      cancellation, the genuinely chiral gauge theory, remains open here as it is in the field.
// Run: npx tsx code/experiment/p77-chiral-gauge.ts

import { latticeFermionDoublers } from '@/code/operator/lattice-fermion'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const analyze = latticeFermionDoublers

export function chiralGauge(input: Record<string, never> = {}): {
  byDimension: {
    dimension: number
    naiveSpecies: number
    netChirality: number
    wilsonSpecies: number
  }[]
  doublingShown: boolean
  chiralityCancels: boolean
  wilsonFixesVector: boolean
  solved: boolean
} {
  void input
  const byDimension = [1, 2, 3, 4].map(d => ({
    dimension: d,
    ...analyze(d),
  }))
  const doublingShown = byDimension.every(
    r => r.naiveSpecies === Math.pow(2, r.dimension),
  )
  const chiralityCancels = byDimension.every(r => r.netChirality === 0)
  const wilsonFixesVector = byDimension.every(
    r => r.wilsonSpecies === 1,
  )

  return {
    byDimension,
    doublingShown,
    chiralityCancels,
    wilsonFixesVector,
    // Solved in the partial sense the roadmap allows: the obstruction is shown and the vector
    // resolution works. The fully chiral gauge theory is marked open, not claimed.
    solved: doublingShown && chiralityCancels && wilsonFixesVector,
  }
}

export default experiment({
  id: 'gauge/chiral-gauge',
  title:
    'naive lattice fermions double to 2^d species whose chiralities cancel and a Wilson term leaves one',
  category: 'gauge',
  substrates: 'any',
  depth: 'L0',
  paper: false,
  run() {
    const r = chiralGauge()
    const ok =
      r.solved &&
      r.doublingShown &&
      r.chiralityCancels &&
      r.wilsonFixesVector
    const d4 = r.byDimension.find(x => x.dimension === 4)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the naive lattice fermion has two to the d species whose net chirality cancels by Nielsen-Ninomiya and a Wilson term leaves a single species',
      metrics: {
        naiveSpecies4d: d4?.naiveSpecies ?? 0,
        netChirality4d: d4?.netChirality ?? 0,
        wilsonSpecies4d: d4?.wilsonSpecies ?? 0,
      },
      notes:
        'partial, the obstruction and the vector resolution are shown, a fully chiral gauge theory remains open',
    })
  },
})
