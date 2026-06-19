// P4 / P8 Stage D: the chirality wall.
// Compare the naive, Wilson, and overlap lattice Dirac operators in 2D momentum
// space on the species count (doublers) and the Ginsparg-Wilson residual (exact
// lattice chiral symmetry). The naive operator has 2^2 = 4 doublers. Wilson cuts
// it to 1 but breaks chiral symmetry. The overlap operator gives 1 species AND a
// zero GW residual: a single fermion with exact lattice chiral symmetry, the
// ideal resolution of Nielsen-Ninomiya. See note/questions/p4-chirality-spec.md.
// Run: npx tsx code/experiment/p4-chirality.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  naiveDirac2D,
  wilsonDirac2D,
  overlapDirac2D,
  scanBrillouin,
} from '@/code/operator/lattice-fermion'

export default experiment({
  id: 'spin/chirality',
  title:
    'the overlap lattice Dirac operator gives one species with exact lattice chiral symmetry',
  category: 'spin',
  substrates: ['any'],
  depth: 'L2',
  paper: true,
  run() {
    const gridSize = 12
    const r = 1
    const m0 = 1

    const naive = scanBrillouin({
      operator: ({ k1, k2 }) => naiveDirac2D({ k1, k2 }),
      gridSize,
    })

    const wilson = scanBrillouin({
      operator: ({ k1, k2 }) => wilsonDirac2D({ k1, k2, m: 0, r }),
      gridSize,
    })

    const overlap = scanBrillouin({
      operator: ({ k1, k2 }) => overlapDirac2D({ k1, k2, m0, r }),
      gridSize,
    })

    const naiveDoubled = naive.species === 4
    const wilsonOne = wilson.species === 1
    const wilsonBroken = wilson.gwResidualMax > 1e-3
    const overlapOne = overlap.species === 1
    const overlapChiral = overlap.gwResidualMax < 1e-9

    const ok =
      naiveDoubled &&
      wilsonOne &&
      wilsonBroken &&
      overlapOne &&
      overlapChiral

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'in 2D momentum space the naive lattice Dirac operator has four doublers, the Wilson operator cuts it to one species but breaks chiral symmetry, and the overlap operator gives one species with a zero Ginsparg-Wilson residual, the exact-chiral resolution of Nielsen-Ninomiya',
      metrics: {
        naiveSpecies: naive.species,
        wilsonSpecies: wilson.species,
        wilsonGwResidual: wilson.gwResidualMax,
        overlapSpecies: overlap.species,
        overlapGwResidual: overlap.gwResidualMax,
      },
      control: {
        // the naive and Wilson operators are the negative controls: doublers present,
        // or chiral symmetry broken. Only the overlap operator achieves both one
        // species and a vanishing GW residual.
        naiveDoublers: naive.species,
        wilsonChiralBroken: wilsonBroken ? 1 : 0,
      },
      notes:
        'L2, known physics (lattice fermions, the Ginsparg-Wilson and overlap construction). The naive and Wilson operators are real negative controls (doublers, broken chirality). This reproduces a textbook lattice-QCD result in 2D momentum space, it is not specific to the vibe coin, so the substrate is any.',
    })
  },
})
