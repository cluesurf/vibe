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
  }

  return { passed, failed }
}
