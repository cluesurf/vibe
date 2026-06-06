// Known-answer tests for the vibe-sim library. No external test runner: a tiny
// assert harness, runnable with `npx tsx code/test/run.ts`. Exits nonzero on
// failure. The science is only as trustworthy as these checks.

import { makeRng } from '~/core/rng'
import { makeBitMatrix, setBit, getBit, popcountRow } from '~/core/bitset'
import { makePosetFromRelation, relationCount } from '~/core/poset'
import { longestChain } from '~/measure/distance'
import { sprinkleMinkowski } from '~/substrate/sprinkle-minkowski'
import { lattice } from '~/substrate/lattice'
import { myrheimMeyerDimension } from '~/measure/dimension'
import { lorentzIsotropy } from '~/measure/lorentz'
import { chsh } from '~/measure/bell'
import { laplacian, laplacianSpectrum } from '~/operator/laplacian'
import { cellComplexOf, diracSpectrum } from '~/operator/dirac'
import {
  makeSu2Lattice,
  metropolisSweep,
  averagePlaquette,
} from '~/dynamics/su2-lattice'
import {
  naiveDirac2D,
  overlapDirac2D,
  scanBrillouin,
} from '~/operator/lattice-fermion'
import { overlapIndex } from '~/operator/gauge-index'
import { kleitmanRothschildOrder } from '~/substrate/layered-order'
import { posetHeight } from '~/measure/order-stats'
import { hamiltonianMatrix, pauliLocalityProfile } from '~/operator/ca-hamiltonian'
import { commutingBlockHamiltonian, cnotGate } from '~/operator/block-ca'
import { eigHermitian } from '~/linalg/eig-hermitian'
import { hyperbolicGraph } from '~/substrate/hyperbolic-graph'
import { chshShared } from '~/experiment/p7-naturalness'
import { measureChshAndDependence } from '~/experiment/p7-alignment'
import { parallelTempering } from '~/dynamics/parallel-tempering'
import { smearedBenincasaDowker } from '~/dynamics/action'
import { orderStatistics } from '~/measure/order-stats'
import { exactCausalSetAverages } from '~/dynamics/exact-enumeration'
import { sampleUniform } from '~/dynamics/uniform-sampler'
import { chiralCondensateSignal } from '~/operator/overlap-condensate'
import { makeDense } from '~/linalg/dense'
import { eigSymmetric } from '~/linalg/eig-jacobi'
import { Graph } from '~/core/graph'

let passed = 0
let failed = 0

function check(input: { name: string; ok: boolean; detail?: string }): void {
  if (input.ok) {
    passed++
    console.log(`  ok   ${input.name}`)
  } else {
    failed++
    console.log(`  FAIL ${input.name}${input.detail ? `  (${input.detail})` : ''}`)
  }
}

function allFinite(xs: ArrayLike<number>): boolean {
  for (let i = 0; i < xs.length; i++) {
    if (!Number.isFinite(xs[i] ?? NaN)) {
      return false
    }
  }
  return true
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

// 15. The quantum link: a full shared past with ALIGNED correlation reaches the
// algebraic CHSH maximum, but a GENERIC (random) shared past stays near classical.
{
  const aligned = chshShared({ eta: 1, mode: 'aligned', trials: 40000, seed: 7 })
  const random = chshShared({ eta: 1, mode: 'random', trials: 40000, seed: 8 })
  check({
    name: 'aligned shared past violates (S~4), generic shared past does not (S<2)',
    ok: aligned > 3.5 && random < 2,
    detail: `aligned S ${aligned.toFixed(2)}, random S ${random.toFixed(2)}`,
  })
}

// 16. The emergent-mesh Hamiltonian resolves the P1 trilemma: the graph Laplacian
// on a ring is bounded below (positive semidefinite, with a zero mode) and local
// by construction, the way out of the local/bounded/propagating obstruction.
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

// 17. Aligned bits, not bits: at full sharing, aligned and misaligned measurement
// dependence are equal (~1 bit) yet only aligned violates CHSH. Bell's currency is
// aligned dependence, not raw dependence.
{
  const aligned = measureChshAndDependence({ eta: 1, mode: 'aligned', trials: 60000, seed: 11 })
  const misaligned = measureChshAndDependence({ eta: 1, mode: 'misaligned', trials: 60000, seed: 12 })
  check({
    name: 'same measurement-dependence, different violation (alignment is the currency)',
    ok:
      aligned.s > 3.5 &&
      misaligned.s < 1.5 &&
      Math.abs(aligned.mutualInfo - misaligned.mutualInfo) < 0.05,
    detail: `aligned S ${aligned.s.toFixed(2)} (${aligned.mutualInfo.toFixed(2)} bit), misaligned S ${misaligned.s.toFixed(2)} (${misaligned.mutualInfo.toFixed(2)} bit)`,
  })
}

// 18. Parallel tempering runs with swaps and equilibrates the causal-set sampler:
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

// 19. Exact enumeration: on the true measure the smeared action drives the
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

// 20. The correct uniform-measure sampler reproduces exact enumeration: at N=6,
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

// 21. The Schwinger condensate: the chiral condensate signal is zero in the free
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

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  process.exit(1)
}
