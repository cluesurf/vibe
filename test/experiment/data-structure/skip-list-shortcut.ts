import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildCoxeterMatrixMesh } from '@/code/substrate/coxeter/matrix-group'

// DS9 and SS9 (experiments/16 and 17). Skip-list / small-world shortcut. The radial bulk is a set of built-in
// long-range links, so any two cells are joined by a short path through the bulk, the diameter is logarithmic.
// We measure the bulk radius (the BFS depth to enumerate the cells, a proxy for the diameter) of the hyperbolic
// {7,3} against the flat {4,4} at the same cell count. The hyperbolic radius is logarithmic, the flat one is
// polynomial (square-root in 2D), so the bulk gives logarithmic-reach shortcuts. Reference, Krioukov et al. 2010.

export default defineExperiment({
  id: 'data-structure/skip-list-shortcut',
  title: 'DS9: the bulk diameter is logarithmic, every cell is a short path away (the skip-list shortcut)',
  category: 'data-structure',
  substrates: ['73'],
  depth: 'L2',
  paper: true,
  run() {
    const maxCells = 4000
    const hyperbolic = buildCoxeterMatrixMesh([7, 3], maxCells)
    const flat = buildCoxeterMatrixMesh([4, 4], maxCells)
    const hyperbolicRadius = hyperbolic.shells.length
    const flatRadius = flat.shells.length
    const hyperbolicCells = hyperbolic.adjacency.length
    const flatCells = flat.adjacency.length

    // the hyperbolic radius is logarithmic in the cells, and far below the flat polynomial radius
    const logarithmicRadius = hyperbolicRadius <= 4 * Math.log2(hyperbolicCells)
    const muchShorterThanFlat = hyperbolicRadius < flatRadius * 0.7

    const ok = logarithmicRadius && muchShorterThanFlat

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the hyperbolic bulk has a logarithmic radius, so any two cells are a short path apart through the bulk, the skip-list shortcut, while the flat tiling has a polynomial (square-root) radius',
      metrics: { hyperbolicCells, hyperbolicRadius, logarithmicRadius: logarithmicRadius ? 1 : 0, muchShorterThanFlat: muchShorterThanFlat ? 1 : 0 },
      // CONTROL: the flat {4,4} square tiling has radius growing as the square root of the cell count, far larger.
      control: { flatCells, flatRadius },
      notes: 'DS9 of experiments/16 and SS9 of experiments/17. The radial shortcut is the same axis as the heap (SS4) and the LSM levels (SS5).',
    })
  },
})
