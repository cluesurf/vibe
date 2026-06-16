// The conformance battery. These are unit tests of the code/* primitives
// themselves (the bitset, the poset, the Laplacian, the lattice fermions, the
// causal-set samplers), not emergent physics claims, so they do not live in the
// experiment registry. They are the floor the science stands on: if the linear
// algebra or the sampler is wrong, every experiment above is suspect. Lifted
// verbatim out of the old monolithic driver.

import { makeRng } from '@/code/tool/rng'
import { makeBitMatrix, setBit, getBit, popcountRow } from '@/code/tool/bitset'
import { makePosetFromRelation, relationCount } from '@/code/tool/poset'
import { longestChain } from '@/code/measure/distance'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { lattice } from '@/code/substrate/lattice'
import { myrheimMeyerDimension } from '@/code/measure/dimension'
import { lorentzIsotropy } from '@/code/measure/lorentz'
import { chsh } from '@/code/measure/bell'
import { laplacian, laplacianSpectrum } from '@/code/operator/laplacian'
import { cellComplexOf, diracSpectrum } from '@/code/operator/dirac'
import { makeSu2Lattice, metropolisSweep, averagePlaquette } from '@/code/dynamics/su2-lattice'
import { naiveDirac2D, overlapDirac2D, scanBrillouin } from '@/code/operator/lattice-fermion'
import { overlapIndex } from '@/code/operator/gauge-index'
import { kleitmanRothschildOrder } from '@/code/substrate/layered-order'
import { posetHeight } from '@/code/measure/order-stats'
import { hamiltonianMatrix, pauliLocalityProfile } from '@/code/operator/ca-hamiltonian'
import { commutingBlockHamiltonian, cnotGate } from '@/code/operator/block-ca'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { hyperbolicGraph } from '@/code/substrate/hyperbolic-graph'
import { parallelTempering } from '@/code/dynamics/parallel-tempering'
import { smearedBenincasaDowker } from '@/code/dynamics/action'
import { orderStatistics } from '@/code/measure/order-stats'
import { exactCausalSetAverages } from '@/code/dynamics/exact-enumeration'
import { sampleUniform } from '@/code/dynamics/uniform-sampler'
import { chiralCondensateSignal } from '@/code/operator/overlap-condensate'
import { chiralCondensateSignalSU2 } from '@/code/operator/overlap-su2'
import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { Graph } from '@/code/tool/graph'
import { buildDodecagrid, buildDodecagridFast } from '@/code/substrate/coxeter/cell-scale'
import { allFinite } from '@/test/scaffold/numeric'
import { dot as vdot, norm as vnorm, sub as vsub, normalize as vnormalize, innerJ } from '@/code/algebra/vector'
import { bfsShells, geodesicBall } from '@/code/measure/shells'
import { toCsr } from '@/code/tool/graph'
import { pack as packTone, currentOf, previousOf, signedTone } from '@/code/tone/pack'
import {
  octonionMultiply,
  octonionUnit,
  octonionNormSquared,
  octonionEquals,
} from '@/code/algebra/octonion'
import {
  hermitianOctonionDimension,
  maxJordanIdentityResidual,
  diagonalJordanFrame,
  isJordanIdempotent,
  areJordanOrthogonal,
  permutations,
  isJordanAutomorphism,
  permutationConjugate,
  octonionMatrixEquals,
} from '@/code/algebra/jordan'
import { diracLandauHamiltonian, scalarLandauSquared } from '@/code/operator/landau'
import { runCoupledSchwinger } from '@/code/dynamics/schwinger-coupled'
import { returnProbability } from '@/code/measure/localization'
import { disclinationHolonomy, collectiveModeOverlap } from '@/code/algebra/group/disclination'
import { ryuTakayanagiScaling } from '@/code/measure/holography'
import { kahlerDiracReturn } from '@/code/measure/fermion-propagation'
import { buildCoxeterMatrixMesh } from '@/code/substrate/coxeter/matrix-group'
import { measureTessellation } from '@/code/measure/tessellation-battery'
import { TESSELLATIONS } from '@/code/substrate/tessellation-catalog'
import { diracGamma5, diracHamiltonian, cmCommutator, cmMaxAbs } from '@/code/algebra/group/clifford'
import { buildCellGraph as buildCellGraphForConformance } from '@/code/substrate/coxeter/cell-direct'
import {
  toZeckendorf as margensternToZeckendorf,
  fromZeckendorf as margensternFromZeckendorf,
  sectorGeneration as margensternSectorGeneration,
} from '@/code/substrate/margenstern/zeckendorf'
import {
  SplittingTree as MargensternSplittingTree,
  childrenOf as margensternChildrenOf,
  parentOf as margensternParentOf,
  preferredSon as margensternPreferredSon,
} from '@/code/substrate/margenstern/splitting-tree'
import { buildMargensternGrid } from '@/code/substrate/margenstern/grid'
import { father as margensternFather, sons as margensternSons, route as margensternRoute } from '@/code/substrate/margenstern/fibonacci-tree'
import { makeNumeration, recurrenceBasis } from '@/code/substrate/margenstern/numeration'
import { applyModel as applyProjectionModel } from '@/code/render/geometry/projection'
import { buildTilingFaces } from '@/code/render/geometry/tiling-faces'
import { buildTilingScene, buildSphericalScene, buildEuclideanScene } from '@/code/render/geometry/honeycomb'
import { truncateScene } from '@/code/render/geometry/truncate'
import { reversibleWaveStep } from '@/code/dynamics/reversible-wave'
import { buildTilingExact } from '@/code/substrate/coxeter/exact-modular'
import { buildPentagridPure } from '@/code/substrate/margenstern/pentagrid'
import { patternClass, patternClassCount } from '@/code/render/geometry/pattern'
import { routeSwitch, runRailway, type RailSwitch, type RailInstruction } from '@/code/compute/railway'
import { compileToRailway } from '@/code/compute/ts-to-railway'
import { compileMachine, runMachine } from '@/code/compute/compile'
import { PENTAGRID_RULES, buildPentagridRuleTable, pentagridNext } from '@/code/compute/margenstern-pentagrid'
import { pentagrid3State } from '@/code/compute/margenstern-pentagrid-3state'
import { pentagrid2State } from '@/code/compute/margenstern-pentagrid-2state'
import { heptagrid4State } from '@/code/compute/margenstern-heptagrid'
import { dodecagrid5State } from '@/code/compute/margenstern-dodecagrid'
import { DODECAGRID_TOTALISTIC_RULES, dodecagridTotalisticNext } from '@/code/compute/margenstern-dodecagrid-totalistic'
import { makeTrackLoop, makeRailwayCa, makeGrowingTrackCa, makeBinaryCounter, makeSelfExtendingCounter } from '@/code/compute/railway-ca'

export function runConformance(): { passed: number; failed: number } {
  let passed = 0
  let failed = 0
  const check = (input: { name: string; ok: boolean; detail?: string }): void => {
    if (input.ok) {
      passed++
      console.log(`  ok       conformance/${input.name}`)
    } else {
      failed++
      console.log(
        `  FAIL     conformance/${input.name}${input.detail ? `  (${input.detail})` : ''}`,
      )
    }
  }

  // 1. bitset basics
  {
    const m = makeBitMatrix({ rows: 2, cols: 40 })
    setBit(m, { row: 0, col: 3 })
    setBit(m, { row: 0, col: 35 })
    check({
      name: 'bitset set/get across word boundary',
      ok: getBit(m, { row: 0, col: 3 }) && getBit(m, { row: 0, col: 35 }) && !getBit(m, { row: 0, col: 4 }),
    })
    check({ name: 'bitset popcountRow', ok: popcountRow(m, { row: 0 }) === 2 })
  }

  // 2. poset on a total order of 4 elements
  {
    const p = makePosetFromRelation({
      size: 4,
      precedes: ({ a, b }) => a < b,
    })
    check({
      name: 'poset total order relation count is 6',
      ok: relationCount(p) === 6,
      detail: `got ${relationCount(p)}`,
    })
    check({
      name: 'poset longest chain 0..3 is 3',
      ok: longestChain({ poset: p, from: 0, to: 3 }) === 3,
      detail: `got ${longestChain({ poset: p, from: 0, to: 3 })}`,
    })
  }

  // 3. sprinkle Minkowski recovers dimension near 2
  {
    const rng = makeRng({ seed: 1 })
    const poset = sprinkleMinkowski({ dimension: 2, count: 1500, rng })
    const d = myrheimMeyerDimension({ poset })
    check({
      name: 'sprinkle M^2 recovers dimension near 2',
      ok: d > 1.3 && d < 2.9,
      detail: `got ${d.toFixed(3)}`,
    })
  }

  // 4. lattice singles out a frame, sprinkling does not (needs >= 2 spatial axes,
  //    so use 3D Minkowski: a 2D spatial slice where a square lattice is 4-fold
  //    anisotropic and a sprinkling is rotationally uniform).
  {
    const rng = makeRng({ seed: 2 })
    const latIso = lorentzIsotropy({
      substrate: lattice({ dimension: 3, extent: 9, signature: 'lorentzian' }),
      samples: 400,
      rng,
    })
    const sprIso = lorentzIsotropy({
      substrate: sprinkleMinkowski({ dimension: 3, count: 1200, rng }),
      samples: 400,
      rng,
    })
    check({
      name: 'lattice is more anisotropic than a sprinkling',
      ok: latIso.anisotropy > sprIso.anisotropy + 0.2,
      detail: `lattice ${latIso.anisotropy.toFixed(3)} vs sprinkle ${sprIso.anisotropy.toFixed(3)}`,
    })
  }

  // 5. CHSH with independent settings respects the classical bound
  {
    const rng = makeRng({ seed: 4 })
    const r = chsh({
      drawHidden: ({ rng: r2 }) => r2.next() * Math.PI,
      settingCorrelation: 0,
      angles: { a: 0, aPrime: Math.PI / 2, b: Math.PI / 4, bPrime: -Math.PI / 4 },
      trials: 40000,
      rng,
    })
    check({
      name: 'CHSH classical bound at independence (|S| <= 2)',
      ok: Math.abs(r.s) <= 2.06,
      detail: `S = ${r.s.toFixed(3)}`,
    })
  }

  // 6. Laplacian of a connected mesh has a near-zero lowest eigenvalue
  {
    const g = lattice({ dimension: 2, extent: 8, signature: 'riemannian' })
    const lap = laplacian({ substrate: g })
    const spec = laplacianSpectrum({ substrate: g, count: 3 })
    check({
      name: 'laplacian builds and has finite spectrum',
      ok: lap.rows === g.size && allFinite(spec) && spec.length > 0,
    })
    check({
      name: 'connected Laplacian lowest eigenvalue near 0',
      ok: Math.abs(spec[0] ?? 1) < 1e-3,
      detail: `lambda0 = ${(spec[0] ?? NaN).toFixed(5)}`,
    })
  }

  // 7. Kahler-Dirac spectrum is finite and non-empty
  {
    const g = lattice({ dimension: 2, extent: 8, signature: 'riemannian' })
    const complex = cellComplexOf({ substrate: g, maxGrade: 2 })
    const spec = diracSpectrum({ complex, count: 8 })
    check({
      name: 'Kahler-Dirac spectrum is finite and non-empty',
      ok: spec.length > 0 && allFinite(spec),
    })
  }

  // 8. SU(2) gauge: a cold lattice is ordered (plaquette 1); strong coupling
  // disorders it (plaquette toward 0). Validates the non-Abelian gauge machinery.
  {
    const rng = makeRng({ seed: 6 })
    const lat = makeSu2Lattice({ dim: 3, length: 4, hot: false, rng })
    const cold = averagePlaquette({ lattice: lat })
    for (let s = 0; s < 100; s++) {
      metropolisSweep({ lattice: lat, beta: 0.3, eps: 0.5, rng })
    }
    const disordered = averagePlaquette({ lattice: lat })
    check({
      name: 'SU(2) cold is ordered, strong coupling disorders it',
      ok: cold > 0.999 && disordered < 0.3,
      detail: `cold ${cold.toFixed(3)}, disordered ${disordered.toFixed(3)}`,
    })
  }

  // 9. The chirality wall: the naive lattice fermion has 4 doublers; the overlap
  // operator has 1 species with exact (Ginsparg-Wilson) chiral symmetry.
  {
    const naive = scanBrillouin({
      operator: ({ k1, k2 }) => naiveDirac2D({ k1, k2 }),
      gridSize: 12,
    })
    const overlap = scanBrillouin({
      operator: ({ k1, k2 }) => overlapDirac2D({ k1, k2, m0: 1, r: 1 }),
      gridSize: 12,
    })
    check({
      name: 'naive lattice fermion has 4 doublers (2D)',
      ok: naive.species === 4,
      detail: `species ${naive.species}`,
    })
    check({
      name: 'overlap: 1 species with exact chiral symmetry (GW ~ 0)',
      ok: overlap.species === 1 && overlap.gwResidualMax < 1e-9,
      detail: `species ${overlap.species}, GW ${overlap.gwResidualMax.toExponential(1)}`,
    })
  }

  // 10. The lattice index theorem: the overlap fermion's index equals the gauge
  // topological charge (index = -Q here), so the chiral fermion sees gauge topology.
  {
    const i0 = overlapIndex({ length: 5, charge: 0 })
    const i1 = overlapIndex({ length: 5, charge: 1 })
    const i2 = overlapIndex({ length: 5, charge: 2 })
    check({
      name: 'lattice index theorem: overlap index = -Q (gauge topology)',
      ok:
        Math.round(i0.index) === 0 &&
        Math.round(i1.index) === -1 &&
        Math.round(i2.index) === -2 &&
        i1.hermiticityError < 1e-9,
      detail: `index(0,1,2) = ${i0.index.toFixed(2)}, ${i1.index.toFixed(2)}, ${i2.index.toFixed(2)}`,
    })
  }

  // 11. A Kleitman-Rothschild layered order has height exactly 3 (three layers),
  // the non-manifold phase used as a warm start in the P2 transition study.
  {
    const kr = kleitmanRothschildOrder({ size: 72 })
    const height = posetHeight({ poset: kr })
    check({
      name: 'Kleitman-Rothschild order has height 3 (layered)',
      ok: height === 3,
      detail: `height ${height}`,
    })
  }

  // 12. Hamiltonian locality: the measure detects a range-1 H (single-cell flip
  // gives locality length 1), validating the Pauli-expansion locality profile.
  {
    const cells = 6
    const n = 1 << cells
    const perm = new Int32Array(n)
    for (let s = 0; s < n; s++) {
      perm[s] = s ^ 1
    }
    const profile = pauliLocalityProfile({
      matrix: hamiltonianMatrix({ perm }),
      cells,
    })
    check({
      name: 'Hamiltonian locality measure: single-cell flip is range 1',
      ok: Math.abs(profile.localityLength - 1) < 1e-6,
      detail: `locality length ${profile.localityLength.toFixed(3)}`,
    })
  }

  // 13. An expanding hyperbolic mesh stays Lorentz-safe: a grown snapshot (the
  // both-worlds substrate at a larger radius) keeps low anisotropy.
  {
    const rng = makeRng({ seed: 4800 })
    const graph = hyperbolicGraph({ count: 800, radius: 6.39, connectThreshold: 3.0, rng })
    const iso = lorentzIsotropy({ substrate: graph, samples: 200, rng })
    check({
      name: 'expanding hyperbolic mesh stays Lorentz-safe (anisotropy < 0.25)',
      ok: iso.anisotropy < 0.25,
      detail: `anisotropy ${iso.anisotropy.toFixed(3)}`,
    })
  }

  // 14. The local branch exists: a disjoint commuting-gate layer has a local
  // (bounded locality length) AND bounded-below Hamiltonian.
  {
    const h = commutingBlockHamiltonian({ cells: 6, blockSize: 2, gate: cnotGate })
    const length = pauliLocalityProfile({ matrix: h, cells: 6 }).localityLength
    const eig = eigHermitian({ matrix: h })
    let lo = Infinity
    for (let i = 0; i < eig.values.length; i++) {
      lo = Math.min(lo, eig.values[i] ?? 0)
    }
    check({
      name: 'commuting-gate rule has a local, bounded-below Hamiltonian',
      ok: length < 2 && lo > -1e-9,
      detail: `locality length ${length.toFixed(2)}, min energy ${lo.toFixed(3)}`,
    })
  }

  // 15. The emergent-mesh Hamiltonian: the graph Laplacian on a ring is bounded
  // below (positive semidefinite, with a zero mode) and local by construction.
  {
    const cells = 12
    const ring = lattice({ dimension: 1, extent: cells, signature: 'riemannian' }) as Graph
    const m = makeDense({ rows: cells, cols: cells })
    for (let i = 0; i < cells; i++) {
      const row = ring.neighbors[i] ?? new Uint32Array(0)
      m.data[i * cells + i] = row.length
      for (let k = 0; k < row.length; k++) {
        m.data[i * cells + (row[k] ?? 0)] = -1
      }
    }
    const eig = eigSymmetric({ matrix: m })
    let lo = Infinity
    for (let i = 0; i < eig.values.length; i++) {
      lo = Math.min(lo, eig.values[i] ?? 0)
    }
    check({
      name: 'emergent Laplacian is bounded below (PSD with a zero mode)',
      ok: lo > -1e-9 && lo < 1e-6,
      detail: `min eigenvalue ${lo.toExponential(1)}`,
    })
  }

  // 16. Parallel tempering runs with swaps and equilibrates the causal-set sampler:
  // under the smeared action the cold replica is manifold-like (height ratio > 1).
  {
    const result = parallelTempering({
      size: 24,
      betas: [0.2, 0.6, 1.0, 1.6],
      action: smearedBenincasaDowker({ epsilon: 0.9, dimension: 2 }),
      sweeps: 150,
      movesPerSweep: 15,
      observe: ({ poset }) => orderStatistics({ poset }).heightRatio,
      rng: makeRng({ seed: 3 }),
    })
    const cold = result.samplesByBeta[3] ?? []
    const meanCold = cold.length > 0 ? cold.reduce((a, b) => a + b, 0) / cold.length : 0
    check({
      name: 'parallel tempering swaps and gives a manifold-like cold replica',
      ok: result.swapAcceptance > 0 && result.swapAcceptance <= 1 && meanCold > 0.8,
      detail: `swap ${(result.swapAcceptance * 100).toFixed(0)}%, cold mean hr ${meanCold.toFixed(2)}`,
    })
  }

  // 17. Exact enumeration: on the true measure the smeared action drives the
  // ensemble toward manifold-like orders (manifold fraction rises with beta), with
  // no sampling bias.
  {
    const action = smearedBenincasaDowker({ epsilon: 0.9, dimension: 2 })
    const result = exactCausalSetAverages({
      size: 5,
      betas: [0, 2],
      action,
      observers: [({ poset }) => (orderStatistics({ poset }).heightRatio > 1 ? 1 : 0)],
    })
    const fracCold = result.means[1]?.[0] ?? 0
    const fracHot = result.means[0]?.[0] ?? 0
    check({
      name: 'exact: smeared action raises manifold fraction on the true measure',
      ok: result.count > 0 && fracCold > fracHot,
      detail: `${result.count} causal sets, manifold fraction ${fracHot.toFixed(2)} (beta 0) -> ${fracCold.toFixed(2)} (beta 2)`,
    })
  }

  // 18. The correct uniform-measure sampler reproduces exact enumeration: at N=6,
  // beta=0, the manifold fraction matches the exact value (about 72 percent),
  // confirming the single-pair toggle samples the uniform measure.
  {
    const r = sampleUniform({ size: 6, beta: 0, epsilon: 0.9, steps: 200000, rng: makeRng({ seed: 6 }) })
    check({
      name: 'uniform-measure sampler matches exact enumeration (N=6, ~72%)',
      ok: r.manifoldFraction > 0.65 && r.manifoldFraction < 0.79,
      detail: `manifold fraction ${(r.manifoldFraction * 100).toFixed(0)}% (exact 72%)`,
    })
  }

  // 19. The Schwinger condensate: the chiral condensate signal is zero in the free
  // theory and nonzero in a gauge background (the anomaly-induced condensate).
  {
    const free = chiralCondensateSignal({ length: 5, disorder: 0, configs: 4, rng: makeRng({ seed: 1 }) })
    const gauged = chiralCondensateSignal({ length: 5, disorder: 0.6, configs: 6, rng: makeRng({ seed: 2 }) })
    check({
      name: 'chiral condensate: zero in free theory, nonzero with gauge field',
      ok: free.nearZeroDensity < 0.005 && gauged.nearZeroDensity > free.nearZeroDensity,
      detail: `free ${free.nearZeroDensity.toFixed(4)}, gauged ${gauged.nearZeroDensity.toFixed(4)}`,
    })
  }

  // 20. Non-Abelian (SU(2)) condensate: zero in the free theory, nonzero in a
  // dynamical SU(2) field (the rung below chiral gauge theory).
  {
    const free = chiralCondensateSignalSU2({ length: 4, disorder: 0, configs: 3, rng: makeRng({ seed: 1 }) })
    const gauged = chiralCondensateSignalSU2({ length: 4, disorder: 0.4, configs: 5, rng: makeRng({ seed: 2 }) })
    check({
      name: 'SU(2) condensate: zero free, nonzero in a dynamical non-Abelian field',
      ok: free.nearZeroDensity < 0.005 && gauged.nearZeroDensity > free.nearZeroDensity,
      detail: `free ${free.nearZeroDensity.toFixed(4)}, gauged ${gauged.nearZeroDensity.toFixed(4)}`,
    })
  }

  // 21. The fast dodecagrid engine (flat typed dedup) produces byte-for-byte the
  // same adjacency as the simple engine, facet degree 12, scaling about 10x further.
  {
    const a = buildDodecagrid({ maxCells: 2000 })
    const b = buildDodecagridFast({ maxCells: 2000 })
    let identical = a.cellCount === b.cellCount && a.facetCount === b.facetCount && b.facetCount === 12
    for (let i = 0; i < a.cellCount && identical; i++) {
      const sa = new Set<number>()
      for (let p = a.offsets[i]!; p < a.offsets[i + 1]!; p++) sa.add(a.adj[p]!)
      const sb = new Set<number>()
      for (let p = b.offsets[i]!; p < b.offsets[i + 1]!; p++) sb.add(b.adj[p]!)
      if (sa.size !== sb.size) identical = false
      else for (const x of sa) if (!sb.has(x)) { identical = false; break }
    }
    check({
      name: 'fast engine (flat typed dedup): identical exact adjacency to the simple engine, facet 12 (scales ~10x further, to tens of millions)',
      ok: identical,
      detail: `${b.cellCount} cells, facet ${b.facetCount}, adjacency identical ${identical}`,
    })
  }

  // refactor primitives: the reusable kit extracted from the experiments
  {
    // vector ops
    check({ name: 'vector dot/norm', ok: vdot([1, 2, 2], [1, 2, 2]) === 9 && vnorm([3, 4]) === 5 })
    check({ name: 'vector sub/normalize', ok: vsub([5, 5], [1, 1])[0] === 4 && Math.abs(vnorm(vnormalize([3, 4])) - 1) < 1e-12 })
    check({ name: 'vector innerJ (Minkowski)', ok: innerJ([1, 1, 1], [1, 1, 1], [1, 1, -1]) === 1 })

    // bfs shells on a 1D path graph (shells of size 1 from an end, branching ~1)
    const path = Array.from({ length: 6 }, (_, i) => [i - 1, i + 1].filter((j) => j >= 0 && j < 6))
    const sh = bfsShells({ neighbors: path, root: 0 })
    check({ name: 'bfsShells path graph', ok: sh.shellCounts.length === 6 && sh.shellCounts.every((c) => c === 1) && sh.depth[5] === 5 })
    const ball = geodesicBall({ neighbors: path, root: 0, radius: 2 })
    check({ name: 'geodesicBall radius 2', ok: ball.length === 3 })

    // csr round-trip
    const csr = toCsr([[1, 2], [0], [0]])
    check({ name: 'toCsr offsets/adj', ok: csr.offsets[0] === 0 && csr.offsets[1] === 2 && csr.offsets[3] === 4 && csr.adj.length === 4 })

    // tone pack round-trip and signed mapping
    const pk = packTone({ current: 1, previous: 2 })
    check({ name: 'tone pack/unpack', ok: currentOf(pk) === 1 && previousOf(pk) === 2 && signedTone(1) === 1 && signedTone(2) === -1 && signedTone(0) === 0 })

    // octonions: the Fano table (e1 e2 = e3, e2 e1 = -e3) and the multiplicative norm
    const e1e2 = octonionMultiply(octonionUnit(1), octonionUnit(2))
    const e2e1 = octonionMultiply(octonionUnit(2), octonionUnit(1))
    check({ name: 'octonion Fano product', ok: octonionEquals(e1e2, octonionUnit(3)) && octonionEquals(e2e1, octonionUnit(3).map((x) => -x)) })
    const ox = [1, 2, 0, -1, 0, 3, 0, 1]
    const oy = [0, 1, -2, 0, 1, 0, 1, 2]
    const normMultiplicative = Math.abs(octonionNormSquared(octonionMultiply(ox, oy)) - octonionNormSquared(ox) * octonionNormSquared(oy)) < 1e-9
    check({ name: 'octonion norm multiplicative', ok: normMultiplicative })

    // the exceptional Jordan algebra J3(O): dimension 27, a rank-three frame, and the
    // Jordan identity holding at n <= 3 but failing at n = 4 (octonion non-associativity)
    check({ name: 'jordan H3(O) dimension 27', ok: hermitianOctonionDimension(3) === 27 })
    const frame = diagonalJordanFrame(3)
    const frameOk = frame.length === 3 && frame.every(isJordanIdempotent) && areJordanOrthogonal(frame[0]!, frame[1]!) && areJordanOrthogonal(frame[0]!, frame[2]!) && areJordanOrthogonal(frame[1]!, frame[2]!)
    check({ name: 'jordan rank-3 frame', ok: frameOk })
    check({ name: 'jordan identity holds at n<=3', ok: maxJordanIdentityResidual(2) < 1e-9 && maxJordanIdentityResidual(3) < 1e-9 })
    check({ name: 'jordan identity fails at n=4 (control)', ok: maxJordanIdentityResidual(4) > 1e-3 })
    // the S3 family symmetry: all 6 slot permutations are Jordan automorphisms, the cyclic one
    // permutes the frame E0 -> E1 -> E2 (the candidate generation triality)
    const s3 = permutations(3)
    const frame3 = diagonalJordanFrame(3)
    check({ name: 'jordan S3 all automorphisms', ok: s3.length === 6 && s3.every((p) => isJordanAutomorphism(p)) })
    check({ name: 'jordan cyclic permutes frame', ok: octonionMatrixEquals(permutationConjugate(frame3[0]!, [1, 2, 0]), frame3[1]!) })

    // Landau levels: the Dirac operator in a uniform field has a relativistic zero mode at
    // E^2 = m^2 (the g=2 fingerprint), the spinless scalar's lowest level is m^2 + qB (no mode)
    const landauN = 24
    const landauB = 0.2
    const landauM = 0.5
    const diracVals = eigHermitian({ matrix: diracLandauHamiltonian({ levels: landauN, fieldStrength: landauB, mass: landauM }) }).values
    const diracLowSquared = Math.min(...Array.from(diracVals).map((x) => x * x))
    const scalarLowSquared = Math.min(...Array.from(eigSymmetric({ matrix: scalarLandauSquared({ levels: landauN, fieldStrength: landauB, mass: landauM }) }).values))
    check({ name: 'landau Dirac zero mode at m^2 (g=2)', ok: Math.abs(diracLowSquared - landauM * landauM) < 1e-3 })
    check({ name: 'landau scalar lowest at m^2+qB (no zero mode, control)', ok: Math.abs(scalarLowSquared - (landauM * landauM + landauB)) < 1e-3 })
    check({ name: 'landau g-factor reads 2', ok: Math.abs((2 * (scalarLowSquared - diracLowSquared)) / landauB - 2) < 1e-3 })

    // the coupled Schwinger evolution: at e=0 the sectors decouple (no field sourced), at e>0 the
    // moving charge sources a field. This is the engine the co-emergence and coupling experiments share.
    const schwingerArgs = { sites: 64, mass: 0.25, flavors: 1, backgroundField: 0, momentumStart: 0.9, steps: 40, dt: 0.1 }
    const decoupled = runCoupledSchwinger({ ...schwingerArgs, coupling: 0 })
    const coupled = runCoupledSchwinger({ ...schwingerArgs, coupling: 0.5 })
    check({ name: 'schwinger e=0 sources no field (decoupled)', ok: decoupled.fieldEnergy < 1e-12 })
    check({ name: 'schwinger e>0 sources a field', ok: coupled.fieldEnergy > 1e-6 })

    // return probability: a hopping chain spreads (low return), a coupling-free diagonal traps (return ~ 1)
    const chainSize = 41
    const hopping = {
      size: chainSize,
      apply: ({ x }: { x: Float64Array }) => {
        const y = new Float64Array(chainSize)
        for (let i = 0; i < chainSize; i++) y[i] = (x[i - 1] ?? 0) + (x[i + 1] ?? 0)
        return y
      },
    }
    const diagonalOnly = {
      size: chainSize,
      apply: ({ x }: { x: Float64Array }) => x.map((v) => 2 * v) as Float64Array,
    }
    const spread = returnProbability({ operator: hopping, source: 20, steps: 120, dt: 0.1, sampleEvery: 10 })
    const trapped = returnProbability({ operator: diagonalOnly, source: 20, steps: 120, dt: 0.1, sampleEvery: 10 })
    check({ name: 'return probability: hopping spreads (low return)', ok: spread.timeAverage < 0.5 && spread.normDrift < 0.05 })
    check({ name: 'return probability: no hopping traps (return ~ 1)', ok: trapped.timeAverage > 0.99 })

    // disclination holonomy: odd winding flips the spinor (-1), even returns it (+1), vector always blind
    const disc1 = disclinationHolonomy({ winding: 1, steps: 24 })
    const disc2 = disclinationHolonomy({ winding: 2, steps: 24 })
    check({ name: 'disclination: odd winding gives spinor -1, vector +1', ok: disc1.spinorIsMinusOne && disc1.vectorReturnsToSelf })
    check({ name: 'disclination: even winding gives spinor +1 (Z2 control)', ok: disc2.spinorIsPlusOne && disc2.vectorReturnsToSelf })
    // collective mode: an odd disclination flips a delocalized mode (overlap -1) regardless of the mode index
    const coll1 = collectiveModeOverlap({ winding: 1, steps: 24, mode: 3 })
    const coll2 = collectiveModeOverlap({ winding: 2, steps: 24, mode: 5 })
    check({ name: 'collective spinor: odd disclination flips any mode (-1)', ok: Math.abs(coll1 + 1) < 1e-9 && Math.abs(coll2 - 1) < 1e-9 })

    // Ryu-Takayanagi: the boundary geodesic grows logarithmically with the interval on a hyperbolic tiling
    const rtTiling = buildCellGraphForConformance({ symbol: [7, 3], maxCells: 2000 })
    const rt = ryuTakayanagiScaling({ neighbors: rtTiling.neighbors, coords: rtTiling.coords })
    check({ name: 'Ryu-Takayanagi: {7,3} boundary geodesic is logarithmic', ok: rt.isLogarithmic && rt.logResidual < rt.linearResidual })

    // Kahler-Dirac propagation: the fermion on the pentacomb mesh spreads (low clean return) while disorder traps it
    const pentaMesh = buildCoxeterMatrixMesh([3, 4, 3, 3, 4], 1200)
    const pentaReturn = kahlerDiracReturn({ neighbors: pentaMesh.adjacency })
    check({ name: 'fermion propagation: pentacomb spreads, disorder localizes', ok: pentaReturn.clean < 0.2 && pentaReturn.localized > 2 * pentaReturn.clean && pentaReturn.normDrift < 0.05 })

    // gamma5: a massive Dirac Hamiltonian couples the chiralities ([H,gamma5] != 0), a massless one does not
    const g5 = diracGamma5()
    const massive = diracHamiltonian({ px: 1, py: 1, pz: 1, mass: 0.7 })
    const massless = diracHamiltonian({ px: 1, py: 1, pz: 1, mass: 0 })
    check({ name: 'gamma5: mass couples chiralities, massless conserves (Weyl)', ok: Math.abs(cmMaxAbs(cmCommutator(massive, g5)) / 2 - 0.7) < 1e-9 && cmMaxAbs(cmCommutator(massless, g5)) < 1e-12 })

    // tessellation battery: the catalog builds, {5,3,4} is hyperbolic with no spinor coin, {3,4,3,4} has the coin
    const dodeca = measureTessellation({ schlafli: [5, 3, 4], maxCells: 1200 })
    const icositetra = measureTessellation({ schlafli: [3, 4, 3, 4], maxCells: 1200 })
    check({ name: 'tessellation battery: {5,3,4} hyperbolic, no spinor coin', ok: dodeca.hyperbolic && !dodeca.spinorHook && dodeca.cells > 500 })
    check({ name: 'tessellation battery: {3,4,3,4} has the 24-cell spinor coin', ok: icositetra.hyperbolic && icositetra.spinorHook })
    check({ name: 'tessellation catalog has 45 entries, 42 buildable', ok: TESSELLATIONS.length === 45 && TESSELLATIONS.filter((t) => t.buildable).length === 42 })

    // Margenstern exact addressing: Zeckendorf coordinates and the splitting tree for the pentagrid {5,4}
    // (and, by the twin theorem, the heptagrid {7,3}). The exact integer alternative to float cell keys.
    let zeckRoundTrips = true
    let zeckNo11 = true
    for (let n = 1; n <= 5000; n++) {
      const z = margensternToZeckendorf(n)
      if (margensternFromZeckendorf(z) !== n) zeckRoundTrips = false
      if (z.includes('11')) zeckNo11 = false
    }
    check({ name: 'Margenstern: Zeckendorf round-trips 1..5000 with no "11"', ok: zeckRoundTrips && zeckNo11 })
    const splitGen = [0, 1, 2, 3, 4, 5].map(margensternSectorGeneration).join(',')
    check({ name: 'Margenstern: sector growth is 1,3,8,21,55,144 (phi^2 rate)', ok: splitGen === '1,3,8,21,55,144', detail: splitGen })
    const splitTree = new MargensternSplittingTree()
    splitTree.grow(5000)
    let splitLegal = true
    let splitPreferred = true
    let splitParent = true
    const splitCoords = new Set<number>()
    for (let id = 0; id < splitTree.size; id++) {
      const a = splitTree.address(id)
      const co = splitTree.coordinate(id)
      if (splitCoords.has(co)) splitLegal = false
      splitCoords.add(co)
      const kids = margensternChildrenOf(a)
      if (kids.filter((k) => k === margensternPreferredSon(a)).length !== 1) splitPreferred = false
      if (id !== splitTree.root) {
        const p = margensternParentOf(a)
        if (p === null || margensternChildrenOf(p).indexOf(a) < 0) splitParent = false
      }
    }
    check({ name: 'Margenstern: 5000 tiles have distinct exact coordinates, parent inverts the rewrite', ok: splitLegal && splitParent, detail: `${splitCoords.size} cells` })
    check({ name: 'Margenstern: every tile has a unique preferred son (+00 continuator)', ok: splitPreferred })

    // Margenstern-addressed walkable grid, derived from the true geometry, works in any dimension. Each tile
    // gets an exact integer coordinate and address-only routing, in 2D ({5,4},{7,3}), 3D ({5,3,4}), and 4D.
    for (const gridSymbol of [[5, 4], [7, 3], [5, 3, 4], [4, 3, 3, 5]]) {
      const grid = buildMargensternGrid({ symbol: gridSymbol, maxCells: 2000 })
      const gridCoords = new Set<number>()
      for (let c = 0; c < grid.size; c++) gridCoords.add(grid.coordinate(c))
      const target = Math.min(900, grid.size - 1)
      const gridPath = grid.route(grid.origin, target)
      let gridRouteValid = gridPath[0] === grid.origin && gridPath[gridPath.length - 1] === target
      for (let i = 0; i + 1 < gridPath.length; i++) {
        let adjacent = false
        for (let s = 0; s < grid.degree(gridPath[i]!); s++) if (grid.step(gridPath[i]!, s).cell === gridPath[i + 1]!) adjacent = true
        if (!adjacent) gridRouteValid = false
      }
      const tag = gridSymbol.join(',')
      check({ name: `Margenstern grid {${tag}} (${gridSymbol.length}D): exact distinct coordinates, address-only route valid along edges`, ok: gridCoords.size === grid.size && gridRouteValid, detail: `${grid.size} cells, route len ${gridPath.length}` })
    }

    // pure-arithmetic tree navigation (no geometry): the father formula generates the standard Fibonacci tree,
    // and a route is a valid father/son walk
    let fibFatherOk = true
    let fibRouteOk = true
    for (let nn = 1; nn <= 4000; nn++) for (const s of margensternSons(nn)) if (margensternFather(s) !== nn) fibFatherOk = false
    for (let i = 0; i < 60; i++) {
      const a = 2 + ((i * 37) % 900)
      const b = 2 + ((i * 53) % 900)
      const p = margensternRoute(a, b)
      if (p[0] !== a || p[p.length - 1] !== b) fibRouteOk = false
      for (let j = 0; j + 1 < p.length; j++) if (margensternFather(p[j]!) !== p[j + 1]! && margensternFather(p[j + 1]!) !== p[j]!) fibRouteOk = false
    }
    check({ name: 'Margenstern pure arithmetic: father formula generates the tree, routes are valid father/son walks', ok: fibFatherOk && fibRouteOk })

    // the growth-basis numeration is exact (round-trips) in Fibonacci (2D), the {p,4} bigger alphabet, and any
    // grid's measured shell growth (3D, 4D)
    const fibNum = makeNumeration({ basis: recurrenceBasis({ coefficients: [1, 1], seeds: [1, 2], terms: 40 }) })
    const sixFour = makeNumeration({ basis: recurrenceBasis({ coefficients: [4, -1], seeds: [1, 4], terms: 30 }) })
    let numOk = true
    for (let n = 1; n <= 8000; n++) if (fibNum.decode(fibNum.encode(n)) !== n || sixFour.decode(sixFour.encode(n)) !== n) numOk = false
    check({ name: 'Margenstern numeration: Fibonacci and {6,4} growth bases round-trip exactly', ok: numOk })

    // projection models, the same hyperboloid point seen many ways. Poincare is the identity, Klein lands inside
    // the unit disk (gnomonic), and the models give genuinely different plane coordinates.
    const ballPoint = [0.4, 0.25]
    const poincarePoint = applyProjectionModel(ballPoint, 'poincare')
    const kleinPoint = applyProjectionModel(ballPoint, 'klein')
    const kleinNorm = Math.hypot(kleinPoint[0]!, kleinPoint[1]!)
    const poincareIdentity = Math.hypot(poincarePoint[0]! - ballPoint[0]!, poincarePoint[1]! - ballPoint[1]!) < 1e-12
    const modelsDiffer = ['klein', 'gans', 'half-plane', 'band', 'azimuthal-equidistant', 'equal-area', 'inverted', 'hemisphere', 'two-point-equidistant'].every((m) => {
      const p = applyProjectionModel(ballPoint, m as never)
      return Math.hypot(p[0]! - poincarePoint[0]!, p[1]! - poincarePoint[1]!) > 1e-6
    })
    check({ name: 'projection models: Poincare is identity, Klein stays in the disk, all models differ', ok: poincareIdentity && kleinNorm < 1 && modelsDiffer, detail: `klein norm ${kleinNorm.toFixed(3)}` })

    // cell faces + CA: the face geometry aligns with the cell graph (one polygon per cell, each at least p
    // sided), and the reversible wave that colors them is exactly reversible
    const tiling = buildTilingFaces({ symbol: [5, 4], maxCells: 800 })
    const facesAligned = tiling.polygons.length === tiling.cellCount && tiling.neighbors.length === tiling.cellCount
    let polygonsWellFormed = true
    for (const poly of tiling.polygons) if (poly.length < 5) polygonsWellFormed = false
    check({ name: 'cell faces: one polygon per cell, each at least p-sided, aligned with the graph', ok: facesAligned && polygonsWellFormed, detail: `${tiling.cellCount} cells` })

    const waveN = tiling.cellCount
    const q = 6
    const prev0 = new Uint8Array(waveN)
    const cur0 = new Uint8Array(waveN)
    cur0[0] = q - 1
    prev0[3 % waveN] = 2
    const fwd = new Uint8Array(waveN)
    reversibleWaveStep({ neighbors: tiling.neighbors, previous: prev0, current: cur0, next: fwd, modulus: q })
    // the reverse step, roles of previous and current swapped, recovers the earlier slice
    const back = new Uint8Array(waveN)
    reversibleWaveStep({ neighbors: tiling.neighbors, previous: fwd, current: cur0, next: back, modulus: q })
    let reversible = true
    for (let i = 0; i < waveN; i++) if (back[i] !== prev0[i]) reversible = false
    check({ name: 'cell faces: the reversible wave coloring the faces is exactly reversible', ok: reversible })

    // geometry dispatcher: one builder covers all three constant-curvature 2D geometries. Spherical {p,q} are
    // the Platonic solids (exact vertex/edge/face counts), Euclidean are flat patches (nonzero straight edges),
    // hyperbolic are the Poincare-disk tilings. Verified by the Platonic Euler data the spherical builder must
    // reproduce, V - E + F = 2.
    const PLATONIC: { symbol: number[]; faces: number; edges: number }[] = [
      { symbol: [4, 3], faces: 6, edges: 12 }, // cube
      { symbol: [3, 4], faces: 8, edges: 12 }, // octahedron
      { symbol: [5, 3], faces: 12, edges: 30 }, // dodecahedron
      { symbol: [3, 5], faces: 20, edges: 30 }, // icosahedron
    ]
    let platonicOk = true
    for (const { symbol, faces, edges } of PLATONIC) {
      const s = buildSphericalScene({ symbol, maxCells: 400 })
      if (s.cellCount !== faces || s.edges.length !== edges) platonicOk = false
    }
    check({ name: 'geometry: the spherical builder reproduces the Platonic solids (exact faces and edges)', ok: platonicOk })

    const euclid44 = buildEuclideanScene({ symbol: [4, 4], maxCells: 400 })
    const euclid36 = buildEuclideanScene({ symbol: [3, 6], maxCells: 400 })
    const flatOk =
      euclid44.dim === 2 && euclid44.edges.length > 300 && euclid44.edges.every((e) => e.a.length === 2) &&
      euclid36.dim === 2 && euclid36.edges.length > 300
    check({ name: 'geometry: the Euclidean builder makes flat 2D tiling patches ({4,4}, {3,6})', ok: flatOk, detail: `${euclid44.edges.length}, ${euclid36.edges.length} edges` })

    const dispatched = [
      buildTilingScene({ symbol: [4, 3] }), // -> spherical
      buildTilingScene({ symbol: [4, 4], maxCells: 400 }), // -> euclidean
      buildTilingScene({ symbol: [7, 3], maxCells: 600 }), // -> hyperbolic
    ]
    check({ name: 'geometry: buildTilingScene routes every signature to a non-empty Scene', ok: dispatched.every((s) => s.edges.length > 0) })

    // tiling variants: truncation cuts every vertex, turning a regular {p,q} into a two-face tiling. The
    // truncated and rectified Scenes have strictly more edges than the regular one, and the transform is closed
    // (a valid Scene back out), the hyperbolic analogue of the Archimedean / Goldberg families.
    const regular73 = buildTilingScene({ symbol: [7, 3], maxCells: 400 })
    const truncated73 = truncateScene(regular73, { fraction: 1 / 3 })
    const rectified73 = truncateScene(regular73, { fraction: 1 / 2 })
    const truncOk =
      truncated73.edges.length > regular73.edges.length &&
      rectified73.edges.length > regular73.edges.length &&
      truncated73.edges.every((e) => e.a.length === 2 && e.b.length === 2)
    check({ name: 'variants: vertex truncation of {7,3} yields a richer valid Scene (truncated and rectified)', ok: truncOk, detail: `${regular73.edges.length} -> ${truncated73.edges.length}` })

    // pure-address pentagrid (Theorem 5), geometry-free integer neighbour stepping for {5,4}, the closed form.
    // The arithmetic graph is 5-regular, symmetric, and grows like the pentagrid (1,5,15,40,105,...).
    const pure = buildPentagridPure({ maxCells: 4000 })
    let pureSymmetric = true
    let pureInterior = 0
    for (let i = 0; i < pure.cellCount; i++) {
      if (pure.neighbors[i]!.length !== 5) continue
      pureInterior++
      if (!pure.neighbors[i]!.every((j) => pure.neighbors[j]!.includes(i))) pureSymmetric = false
    }
    check({ name: 'pentagrid pure address (Theorem 5): 5-regular, symmetric, geometry-free', ok: pureSymmetric && pureInterior > 800, detail: `${pureInterior} interior cells` })

    // exact modular (geometry-free) neighbour stepping via roots of unity, works for ANY label. {7,3} (the
    // cubic cos(pi/7)) is handled exactly by the 14th root of unity. Matches the float graph cell-for-cell.
    for (const exactSymbol of [[5, 4], [7, 3], [6, 4]]) {
      const exact = buildTilingExact({ symbol: exactSymbol, maxCells: 1500 })
      const floatGraph = buildCellGraphForConformance({ symbol: exactSymbol, maxCells: 1500 })
      const histOf = (nb: number[][]): string => {
        const h: Record<number, number> = {}
        for (const r of nb) h[r.length] = (h[r.length] ?? 0) + 1
        return JSON.stringify(Object.entries(h).sort())
      }
      let exactSymmetric = true
      for (let i = 0; i < exact.cellCount; i++) for (const j of exact.neighbors[i]!) if (!exact.neighbors[j]!.includes(i)) exactSymmetric = false
      const matches = exact.cellCount === floatGraph.cellCount && histOf(exact.neighbors) === histOf(floatGraph.neighbors)
      check({ name: `exact modular {${exactSymbol.join(',')}}: integer-exact graph matches float and is symmetric`, ok: matches && exactSymmetric, detail: `${exact.cellCount} cells, facet ${exact.facetCount}` })
    }

    // pattern labels + the computation capstone: pattern classes are coherent (the center is sector 0 and there
    // are p sectors around it), and an address-only route is a valid walk along edges (the signal's path)
    const patGrid = buildMargensternGrid({ symbol: [7, 3], maxCells: 1500 })
    const sectorCount = patternClassCount(patGrid, 'sector')
    const centerIsSector0 = patternClass(patGrid, patGrid.origin, 'sector') === 0
    const nodeClasses = patternClassCount(patGrid, 'node')
    const routePath = patGrid.route(patGrid.origin, Math.floor(patGrid.size * 0.7))
    let routeWalk = routePath.length > 1
    for (let i = 0; i + 1 < routePath.length; i++) {
      let adjacent = false
      for (let s = 0; s < patGrid.degree(routePath[i]!); s++) if (patGrid.step(routePath[i]!, s).cell === routePath[i + 1]!) adjacent = true
      if (!adjacent) routeWalk = false
    }
    check({ name: 'pattern labels coherent (center + p sectors), node classes <= 3', ok: centerIsSector0 && sectorCount === 8 && nodeClasses <= 3, detail: `${sectorCount} sectors` })
    check({ name: 'computation capstone: address-route signal path is a valid edge walk', ok: routeWalk, detail: `path length ${routePath.length}` })

    // Margenstern's RAILWAY universal model (Vol II Ch 4), the engine of his weakly universal hyperbolic CAs.
    // The three switch types behave correctly, and a register machine (universal by Minsky) on the rails
    // computes arithmetic, the locomotive multiplies.
    const flipFlop: RailSwitch = { kind: 'flip-flop', active: 1 }
    const ffA = routeSwitch(flipFlop, 0); const ffActiveAfter = flipFlop.active
    const memSwitch: RailSwitch = { kind: 'memory', active: 1 }
    routeSwitch(memSwitch, 2)
    const switchesOk = ffA === 1 && ffActiveAfter === 2 && memSwitch.active === 2 && routeSwitch(memSwitch, 0) === 2
    check({ name: 'railway switches: flip-flop flips, memory remembers, exact semantics', ok: switchesOk })
    const mulCode: RailInstruction[] = [
      { op: 'dec', reg: 0, next: 1, zero: 8 }, { op: 'dec', reg: 1, next: 2, zero: 4 },
      { op: 'inc', reg: 2, next: 3 }, { op: 'inc', reg: 3, next: 1 },
      { op: 'dec', reg: 3, next: 5, zero: 0 }, { op: 'inc', reg: 1, next: 4 },
      { op: 'halt' }, { op: 'halt' }, { op: 'halt' },
    ]
    let railwayUniversal = true
    for (const pair of [[3, 4], [0, 5], [6, 7]]) {
      const a = pair[0]!
      const b = pair[1]!
      const out = runRailway({ registers: 4, capacity: 400, code: mulCode }, [a, b, 0, 0])
      if (out.registers[2] !== a * b) railwayUniversal = false
    }
    check({ name: 'railway register machine computes (universal): the locomotive multiplies on the rails', ok: railwayUniversal })

    // the TypeScript -> railway compiler: a Fibonacci function written in TS lowers to register-machine IR that
    // the railway runs, and computing fib(1..10) on the compiled machine gives the right sequence.
    const fibCompiled = compileToRailway(`
function fib(n) { let a = 0; let b = 1; let t = 0; while (n !== 0) { n--; t = a; t += b; a = b; b = t } return a }
`)
    const fibValues: number[] = []
    for (let m = 1; m <= 10; m++) {
      const init = new Array<number>(fibCompiled.program.registers).fill(0)
      init[0] = m
      fibValues.push(runRailway(fibCompiled.program, init).registers[fibCompiled.returnRegister]!)
    }
    const fibOk = fibValues.join(',') === '1,1,2,3,5,8,13,21,34,55'
    check({ name: 'TypeScript -> railway compiler: fib(1..10) computed by the compiled register machine', ok: fibOk, detail: fibValues.join(' ') })

    // the BINARY backend (the modern-CPU representation) computes the same answers, and its per-term cost is
    // CONSTANT (a fixed 64-bit word per op) where the unary backend's per-term cost grows with the value.
    const FIB_SRC = `function fib(n){ let a=0; let b=1; let t=0; while(n!==0){ n--; t=a; t+=b; a=b; b=t } return a }`
    const bin = compileMachine(FIB_SRC) // default backend is binary
    const una = compileMachine(FIB_SRC, { backend: 'unary' })
    const binVals: string[] = []
    const binCost: number[] = []
    const unaCost: number[] = []
    for (let m = 1; m <= 10; m++) {
      binVals.push(runMachine(bin, [m]).result.toString())
      binCost.push(runMachine(bin, [m]).cost)
      unaCost.push(runMachine(una, [m]).cost)
    }
    const binCorrect = binVals.join(',') === '1,1,2,3,5,8,13,21,34,55'
    // binary per-term deltas are equal (flat); unary per-term deltas strictly increase (grow with the value)
    const binDelta = binCost[9]! - binCost[8]!
    const binFlat = binCost[8]! - binCost[7]! === binDelta && binCost[5]! - binCost[4]! === binDelta
    const unaGrows = unaCost[9]! - unaCost[8]! > unaCost[2]! - unaCost[1]!
    check({ name: 'binary backend: same answers, constant per-term cost (modern-CPU 64-bit), vs unary growing', ok: binCorrect && binFlat && unaGrows, detail: `binary +${binDelta}/term flat, unary grows` })

    // Margenstern's actual 5-state pentagrid universal CA, the 236-rule table transcribed from arXiv:1403.2373.
    // It compiles (rotation-invariant, no conflicts), uses exactly the 5 states, and fires its documented rules.
    const caTable = buildPentagridRuleTable()
    const alpha = new Set<string>()
    for (const r of PENTAGRID_RULES) for (const ch of r) alpha.add(ch)
    const fivState = [...alpha].sort().join('') === 'BGRWY'
    const faithful = pentagridNext(caTable, 'W', ['W', 'G', 'B', 'W', 'B']) === 'G' // rule 34
      && pentagridNext(caTable, 'G', ['W', 'W', 'B', 'W', 'B']) === 'W' // rule 46
      && pentagridNext(caTable, 'W', ['B', 'W', 'B', 'W', 'G']) === 'G' // rule 34 rotated
      && pentagridNext(caTable, 'W', ['W', 'W', 'W', 'W', 'W']) === 'W' // vacuum stable
    check({ name: 'Margenstern pentagrid CA: 236 rules transcribed, 5 states, no conflicts, documented rules fire', ok: PENTAGRID_RULES.length === 236 && fivState && faithful, detail: `${caTable.size} configurations` })

    // the other transcribed Margenstern CAs (from the arXiv papers in land/text/papers/more-5): pentagrid
    // 3-state and 2-state, the heptagrid 4-state, and the dodecagrid 5-state (3D). Each loads with its exact
    // state alphabet; the planar ones are conflict-free, the 3D dodecagrid has the one documented snapshot
    // collision it needs out-of-snapshot context to resolve.
    check({ name: 'Margenstern pentagrid 3-state: 352 rules, {B,R,W}, conflict-free', ok: pentagrid3State.ruleCount === 352 && pentagrid3State.states.join('') === 'BRW' && pentagrid3State.conflicts === 0 })
    check({ name: 'Margenstern pentagrid 2-state: 352 rules, {B,W}, conflict-free', ok: pentagrid2State.ruleCount === 352 && pentagrid2State.states.join('') === 'BW' && pentagrid2State.conflicts === 0 })
    check({ name: 'Margenstern heptagrid 4-state: 1168 rules, {B,G,R,W}, conflict-free', ok: heptagrid4State.ruleCount === 1168 && heptagrid4State.states.join('') === 'BGRW' && heptagrid4State.conflicts === 0 })
    check({ name: 'Margenstern dodecagrid 5-state (3D): 261 rules, {B,G,R,W,Y} loaded', ok: dodecagrid5State.ruleCount === 261 && dodecagrid5State.states.join('') === 'BGRWY' })

    // Margenstern's 4-state OUTER TOTALISTIC dodecagrid CA (arXiv:2108.13094): 34 (state, weight) entries, the
    // new state depends only on the cell and the sum of neighbour ranks.
    const totalisticOk = DODECAGRID_TOTALISTIC_RULES.length === 34
      && dodecagridTotalisticNext('W', Array<string>(12).fill('W')) === 'W' // vacuum stable
      && dodecagridTotalisticNext('W', Array<string>(7).fill('B')) === 'R' // weight 7
      && dodecagridTotalisticNext('W', Array<string>(10).fill('B')) === 'G' // weight 10
    check({ name: 'Margenstern dodecagrid 4-state totalistic: 34 entries, documented weights fire', ok: totalisticOk })

    // a UNIFORM tiling-agnostic universal railway CA (NOT in Margenstern, who built one automaton per tiling):
    // the locomotive circles a track loop forward, and the three switch types route and update correctly. With
    // the universal register machine (railway.ts) this makes ONE CA universal on every regular tiling.
    const loopCa = makeTrackLoop([0, 1, 2, 3, 4, 5, 6, 7], 8)
    const seen = new Set<number>()
    for (let t = 0; t < 8; t++) { loopCa.step(); seen.add(loopCa.headAt()) }
    const loopOk = loopCa.headAt() === 1 && seen.size === 8 // returned to start, visited every cell (forward)
    const ffCa = makeRailwayCa([
      { role: 'track', links: [4, 1], state: 'H' },
      { role: 'switch', links: [0, 2, 3], switchType: 'flip-flop', active: 1, state: 'C' },
      { role: 'track', links: [1, 2], state: 'C' },
      { role: 'track', links: [1, 3], state: 'C' },
      { role: 'track', links: [4, 0], state: 'A' },
    ])
    ffCa.step(); ffCa.step()
    const switchOk = ffCa.headAt() === 2 && ffCa.cells[1]!.active === 2 // routed to active branch, flipped
    check({ name: 'uniform railway CA (tiling-agnostic, new): locomotive loops forward and a flip-flop routes+flips', ok: loopOk && switchOk })

    // strong-universality ingredient: from a finite seed the track BUILDS itself outward, never traps, and on a
    // finite patch halts only at the boundary, so it never halts on the infinite tiling. Checked on {5,3,4}.
    {
      const g = buildMargensternGrid({ symbol: [5, 3, 4], maxCells: 4000 })
      const gnb: number[][] = []
      const gdepth: number[] = []
      let maxDepth = 0
      for (let c = 0; c < g.size; c++) {
        const row: number[] = []
        for (let s = 0; s < g.degree(c); s++) row.push(g.step(c, s).cell)
        gnb.push(row)
        gdepth.push(g.depth(c))
        maxDepth = Math.max(maxDepth, g.depth(c))
      }
      const builder = makeGrowingTrackCa({ graphNeighbors: gnb, depth: gdepth, start: g.origin })
      let monotone = true
      let prev = g.depth(builder.headAt())
      let built = 0
      for (let t = 0; t < 2000; t++) {
        if (!builder.step()) break
        built++
        const d = g.depth(builder.headAt())
        if (d !== prev + 1) monotone = false
        prev = d
      }
      const haltedAtEdge = g.depth(builder.headAt()) === maxDepth && built === maxDepth
      check({ name: 'strongly-universal track builder: finite seed grows strictly outward, halts only at the patch edge', ok: monotone && haltedAtEdge, detail: `built ${built} cells to depth ${maxDepth}` })
    }

    // end-to-end: a physical register (a binary ripple counter) computed by the single railway-ca locomotive
    const counter = makeBinaryCounter(5)
    let counterOk = true
    for (let k = 1; k <= 20; k++) { const reached = counter.increment(); if (!reached || counter.count() !== k) counterOk = false }
    check({ name: 'railway CA computes a register end to end: a binary counter counts 1..20 by the locomotive', ok: counterOk })

    // strong universality: a self-extending counter starts from a ONE-bit finite seed and counts without bound,
    // building new bits on overflow (the memory grows on demand, like the vibe mesh growing a ring each beat)
    const sec = makeSelfExtendingCounter()
    const seedWidth = sec.width()
    let secOk = true
    for (let k = 1; k <= 100; k++) { sec.increment(); if (sec.count() !== k) secOk = false }
    check({ name: 'strongly-universal memory: a one-bit seed counts 1..100, the counter builds its own bits', ok: secOk && seedWidth === 1 && sec.width() === 7, detail: `seed ${seedWidth} bit -> ${sec.width()} bits, ${sec.builds()} self-builds` })

    // the railway primitives run on the actual cell graph of each tested tiling, the Order-5 cubic honeycomb
    // {4,3,5} included. The locomotive traverses a real cycle and a flip-flop routes on real cells.
    for (const railSymbol of [[8, 3], [5, 3, 4], [4, 3, 5]]) {
      const rg = buildMargensternGrid({ symbol: railSymbol, maxCells: 1500 })
      const rnb: number[][] = []
      for (let c = 0; c < rg.size; c++) { const row: number[] = []; for (let s = 0; s < rg.degree(c); s++) row.push(rg.step(c, s).cell); rnb.push(row) }
      // a fundamental cycle from a non-tree edge
      const N = rnb.length, par = new Int32Array(N).fill(-2)
      par[0] = -1
      let fr = [0]
      let cyc: number[] = []
      while (fr.length && cyc.length === 0) {
        const nx: number[] = []
        for (const u of fr) for (const v of rnb[u]!) {
          if (par[v] === -2) { par[v] = u; nx.push(v) }
          else if (v !== par[u] && cyc.length === 0) {
            const up: number[] = []; let x = u; while (x !== -1) { up.push(x); x = par[x]! }
            const vp: number[] = []; let y = v; while (y !== -1) { vp.push(y); y = par[y]! }
            const sx = new Set(up); let lca = -1; for (const z of vp) if (sx.has(z)) { lca = z; break }
            if (lca < 0) continue
            const aa: number[] = []; for (const z of up) { aa.push(z); if (z === lca) break }
            const bb: number[] = []; for (const z of vp) { if (z === lca) break; bb.push(z) }
            const c2 = [...aa, ...bb.reverse()]; if (c2.length >= 4) cyc = c2
          }
        }
        fr = nx
      }
      const rca = makeTrackLoop(cyc, N)
      const vis = new Set<number>()
      for (let t = 0; t < cyc.length; t++) { rca.step(); vis.add(rca.headAt()) }
      check({ name: `railway CA runs on {${railSymbol.join(',')}}: locomotive traverses a real cycle`, ok: cyc.length >= 4 && rca.headAt() === cyc[1] && vis.size === cyc.length, detail: `cycle ${cyc.length}` })
    }
  }

  return { passed, failed }
}
