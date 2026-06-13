import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildCoxeterMatrixMesh } from '@/code/substrate/coxeter/matrix-group'
import { streamCoxeterMeshGas, collideCoxeterMeshGas, countCoxeterMeshGas } from '@/code/operator/coxeter-mesh-gas'

// The 5D pentacomb as a working MESH with the directional rule running on the ACTUAL generated cell graph, the
// dynamical side of substrate-survey/pentacomb-spin-curvature. We generate the pentacomb {3,4,3,3,4} cell
// graph from its Coxeter reflections (BFS over the reflection group, each cell a group element, adjacency by a
// generator), confirm it grows faster than a flat honeycomb (the curvature signature, the rigorous
// hyperbolicity being the Lorentzian Gram signature of the companion experiment), and run the reversible
// charge-conserving lattice-gas rule directly ON THE GENERATED MESH ADJACENCY. So the substrate that carries
// spin AND curvature also runs the bare rule on its real geometry. The control is a EUCLIDEAN Coxeter mesh,
// which grows more slowly.

const RANK = 6 // {3,4,3,3,4} has 6 reflection generators

const growthRatio = (shells: number[]): number => {
  const count = shells.length
  if (count < 4) return 1
  return shells[count - 2]! / shells[count - 3]!
}

export default defineExperiment({
  id: 'substrate-survey/pentacomb-mesh-rule',
  title: 'the 5D pentacomb is a curved mesh that runs the reversible conserving rule on its real generated geometry',
  category: 'substrate-survey',
  substrates: ['53334'],
  depth: 'L2',
  paper: true,
  run() {
    // (1) build the pentacomb mesh, confirm it grows FASTER than flat (the curvature signature)
    const penta = buildCoxeterMatrixMesh([3, 4, 3, 3, 4], 3000)
    const pentaRatio = growthRatio(penta.shells)
    const adjacency = penta.adjacency
    const cells = adjacency.length

    // (2) run the reversible charge-conserving lattice gas ON THE GENERATED MESH. Occupations on the 6
    // generator directions per cell. Streaming moves each occupation across its generator to the neighbour, or
    // reflects in place at the mesh boundary (neighbour -1). Because each generator is an involution
    // (neighbour of the neighbour is the cell itself), streaming per direction is an involution, hence a
    // bijection: charge-conserving and exactly reversible. A collision (a fixed cyclic permutation of the 6
    // directions per cell) makes the dynamics non-trivial while staying reversible and conserving.
    // the reversible charge-conserving lattice-gas rule on the generated mesh adjacency lives in
    // code/operator/coxeter-mesh-gas.
    const stream = (state: number[][]): number[][] => streamCoxeterMeshGas({ state, adjacency, rank: RANK })
    const collide = (state: number[][], forward: boolean): number[][] => collideCoxeterMeshGas({ state, rank: RANK, forward })
    // a deterministic initial charge pattern (no randomness): occupy direction (cell mod 6) at each cell
    let occupation: number[][] = Array.from({ length: cells }, (_, cell) => Array.from({ length: RANK }, (_, d) => (d === cell % RANK ? 1 : 0)))
    const initial = occupation.map((slots) => [...slots])
    const count = countCoxeterMeshGas
    const charge0 = count(occupation)

    const steps = 30
    let conservedThroughout = true
    for (let t = 0; t < steps; t++) { occupation = stream(collide(occupation, true)); if (count(occupation) !== charge0) conservedThroughout = false }
    const moved = occupation.some((slots, cell) => slots.some((value, d) => value !== initial[cell]![d])) // the rule did something
    for (let t = 0; t < steps; t++) occupation = collide(stream(occupation), false) // exact inverse, reversed order
    const reversible = occupation.every((slots, cell) => slots.every((value, d) => value === initial[cell]![d]))

    const ranOnRealMesh = cells > 1000 && conservedThroughout && reversible && moved

    // CONTROL: a EUCLIDEAN Coxeter mesh ({3,4,3,3}) grows more slowly (lower ratio), so the pentacomb's faster
    // growth is genuine negative curvature
    const euclid = buildCoxeterMatrixMesh([3, 4, 3, 3], 3000)
    const euclidRatio = growthRatio(euclid.shells)
    const growsFasterThanFlat = pentaRatio > 1.5 && pentaRatio > euclidRatio + 0.2

    const ok = growsFasterThanFlat && ranOnRealMesh

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the reversible charge-conserving lattice-gas rule runs directly on the generated 5D pentacomb cell graph (which grows faster than the flat 24-cell honeycomb), conserving charge and exactly reversing over thousands of cells, so the substrate carrying the 24-cell D4 spinor directions on a curved bulk also runs the bare rule on its real geometry',
      metrics: {
        meshCells: cells,
        pentacombGrowthRatio: pentaRatio,
        chargeConserved: conservedThroughout ? 1 : 0,
        reversible: reversible ? 1 : 0,
        dynamicsNonTrivial: moved ? 1 : 0,
      },
      // CONTROL: the Euclidean {3,4,3,3} mesh grows more slowly, so the pentacomb's faster growth is curvature.
      control: { euclideanGrowthRatio: euclidRatio, pentacombAboveEuclidean: growsFasterThanFlat ? 1 : 0 },
      notes:
        'Gap closed, the rule now runs on the ACTUAL generated pentacomb mesh adjacency (thousands of cells), not an abstract patch. Streaming is an exact involution per generator (reflective at the boundary), so charge is conserved and the run reverses exactly, and the cyclic collision makes the dynamics non-trivial. With the spinor directions (the companion experiment) this completes spin plus curvature plus a working rule on real geometry.',
    })
  },
})
