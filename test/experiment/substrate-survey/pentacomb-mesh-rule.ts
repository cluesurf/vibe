import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The 5D pentacomb as a working MESH with the directional rule running on the ACTUAL generated cell graph, the
// dynamical side of substrate-survey/pentacomb-spin-curvature. We generate the pentacomb {3,4,3,3,4} cell
// graph from its Coxeter reflections (BFS over the reflection group, each cell a group element, adjacency by a
// generator), confirm it grows faster than a flat honeycomb (the curvature signature, the rigorous
// hyperbolicity being the Lorentzian Gram signature of the companion experiment), and run the reversible
// charge-conserving lattice-gas rule directly ON THE GENERATED MESH ADJACENCY. So the substrate that carries
// spin AND curvature also runs the bare rule on its real geometry. The control is a EUCLIDEAN Coxeter mesh,
// which grows more slowly.

const RANK = 6 // {3,4,3,3,4} has 6 reflection generators

// the reflection matrices of a linear Coxeter symbol, in the simple-root basis
const reflections = (symbol: number[]): number[][][] => {
  const n = symbol.length + 1
  const gram: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
  for (let edge = 0; edge < symbol.length; edge++) {
    const value = -Math.cos(Math.PI / symbol[edge]!)
    gram[edge]![edge + 1] = value
    gram[edge + 1]![edge] = value
  }
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, k) => Array.from({ length: n }, (_, j) => (k === i ? (j === i ? 1 : 0) - 2 * gram[i]![j]! : k === j ? 1 : 0))),
  )
}

const multiply = (a: number[][], b: number[][]): number[][] =>
  a.map((row) => b[0]!.map((_, j) => row.reduce((sum, value, k) => sum + value * b[k]![j]!, 0)))

const key = (matrix: number[][]): string => matrix.flat().map((value) => Math.round(value * 1e5)).join(',')

// BFS the cell graph and return the shell sizes AND the adjacency (for each cell, the index of its neighbour
// across each generator, or -1 if that neighbour is outside the truncated mesh).
const buildMesh = (symbol: number[], maxCells: number): { shells: number[]; adjacency: number[][] } => {
  const generators = reflections(symbol)
  const degree = generators.length
  const n = symbol.length + 1
  const identity: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
  const index = new Map<string, number>([[key(identity), 0]])
  const matrices: number[][][] = [identity]
  let frontier = [0]
  const shells = [1]
  while (index.size < maxCells && frontier.length > 0) {
    const next: number[] = []
    for (const cell of frontier) {
      for (let g = 0; g < degree; g++) {
        const neighbour = multiply(matrices[cell]!, generators[g]!)
        const id = key(neighbour)
        if (!index.has(id)) { index.set(id, matrices.length); matrices.push(neighbour); next.push(index.get(id)!) }
      }
      if (index.size >= maxCells) break
    }
    if (next.length > 0) shells.push(next.length)
    frontier = next
  }
  // resolve the adjacency now that all cells are known
  const adjacency = matrices.map((matrix) =>
    generators.map((generator) => index.get(key(multiply(matrix, generator))) ?? -1),
  )
  return { shells, adjacency }
}

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
    const penta = buildMesh([3, 4, 3, 3, 4], 3000)
    const pentaRatio = growthRatio(penta.shells)
    const adjacency = penta.adjacency
    const cells = adjacency.length

    // (2) run the reversible charge-conserving lattice gas ON THE GENERATED MESH. Occupations on the 6
    // generator directions per cell. Streaming moves each occupation across its generator to the neighbour, or
    // reflects in place at the mesh boundary (neighbour -1). Because each generator is an involution
    // (neighbour of the neighbour is the cell itself), streaming per direction is an involution, hence a
    // bijection: charge-conserving and exactly reversible. A collision (a fixed cyclic permutation of the 6
    // directions per cell) makes the dynamics non-trivial while staying reversible and conserving.
    const stream = (state: number[][]): number[][] => {
      const out = Array.from({ length: cells }, () => new Array(RANK).fill(0))
      for (let cell = 0; cell < cells; cell++) for (let d = 0; d < RANK; d++) {
        const target = adjacency[cell]![d]! === -1 ? cell : adjacency[cell]![d]!
        out[target]![d] = state[cell]![d]!
      }
      return out
    }
    const collide = (state: number[][], forward: boolean): number[][] =>
      state.map((slots) => slots.map((_, d) => slots[forward ? (d + RANK - 1) % RANK : (d + 1) % RANK]!))
    // a deterministic initial charge pattern (no randomness): occupy direction (cell mod 6) at each cell
    let occupation = Array.from({ length: cells }, (_, cell) => Array.from({ length: RANK }, (_, d) => (d === cell % RANK ? 1 : 0)))
    const initial = occupation.map((slots) => [...slots])
    const count = (state: number[][]): number => state.reduce((sum, slots) => sum + slots.reduce((s, v) => s + v, 0), 0)
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
    const euclid = buildMesh([3, 4, 3, 3], 3000)
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
