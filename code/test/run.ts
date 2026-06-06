// Known-answer tests for the vibe-test library. No external test runner: a tiny
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
import { dimensionFromOrderingFraction } from '~/measure/dimension'
import { chiralCondensateSignal } from '~/operator/overlap-condensate'
import { chiralCondensateSignalSU2 } from '~/operator/overlap-su2'
import { makeDense } from '~/linalg/dense'
import { eigSymmetric } from '~/linalg/eig-jacobi'
import { Graph } from '~/core/graph'
import { cubicLattice, potentialProfile, fitForm } from '~/experiment/p16-newtonian'
import { chainOperators, quantumMsd, classicalMsd } from '~/experiment/p17-quantum-walk'
import { massStudy } from '~/experiment/p14-mass'
import { logLawSlope1D, areaLaw2D } from '~/experiment/p15-entanglement'
import { p12Crossing } from '~/experiment/p12-free-energy'
import { csgCosmology } from '~/experiment/p13-cosmology'
import { wangLandauHeight, crossingBeta, manifoldFractionAt } from '~/dynamics/wang-landau'
import { deSitterExpansion } from '~/experiment/p13-expansion'
import { branchingExpansion } from '~/experiment/p13-growth-expansion'
import { rotationCurve } from '~/experiment/p18-dark-matter'
import { darkEnergy4D } from '~/experiment/p19-dark-energy-4d'
import { photonStudy } from '~/experiment/p20-photon'
import { gravitonStudy } from '~/experiment/p21-graviton'
import { higgsStudy } from '~/experiment/p22-higgs'

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

// 22. Non-Abelian (SU(2)) condensate: zero in the free theory, nonzero in a
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

// 23. Alignment from dynamics: in a natural mesh the CHSH violation decays with
// measurement separation (shared past shrinks), unlike separation-independent QM.
{
  const near = chshShared({ eta: 1, mode: 'aligned', trials: 40000, seed: 1 })
  const far = chshShared({ eta: Math.exp(-4 / 2), mode: 'aligned', trials: 40000, seed: 2 })
  check({
    name: 'natural mesh: CHSH violation decays with separation',
    ok: near > 3.5 && far < 2,
    detail: `near S ${near.toFixed(2)}, far S ${far.toFixed(2)}`,
  })
}

// 24. P6: the stable 2D manifold phase has Myrheim-Meyer dimension near 2.
// Warm-start the correct sampler from a 2D sprinkling and read the dimension off
// the ordering fraction of the stable phase.
{
  const sprinkle = sprinkleMinkowski({ dimension: 2, count: 96, rng: makeRng({ seed: 1 }) })
  const r = sampleUniform({
    size: 96,
    beta: 1,
    epsilon: 0.9,
    steps: 30000,
    rng: makeRng({ seed: 31 }),
    sampleEvery: 48,
    startFuture: sprinkle.future,
  })
  const dim = dimensionFromOrderingFraction(r.meanOrderingFraction)
  check({
    name: 'P6: stable 2D manifold phase has dimension near 2',
    ok: dim > 1.7 && dim < 2.4,
    detail: `MM dimension ${dim.toFixed(2)}`,
  })
}

// 25. P16: the 3D static potential (Green's function of the Laplacian) is
// Newtonian, falling as 1/r better than 1/r^2 or log.
{
  const three = potentialProfile({ lat: cubicLattice(21, 3), side: 21 })
  const inv = fitForm(three.r, three.phi, (r) => 1 / r)
  const invSq = fitForm(three.r, three.phi, (r) => 1 / (r * r))
  const logf = fitForm(three.r, three.phi, (r) => Math.log(r))
  check({
    name: 'P16: 3D static potential is Newtonian (1/r is the best fit)',
    ok: inv.r2 > invSq.r2 && inv.r2 > logf.r2 && inv.r2 > 0.95,
    detail: `1/r R^2 ${inv.r2.toFixed(3)}, 1/r^2 ${invSq.r2.toFixed(3)}, ln ${logf.r2.toFixed(3)}`,
  })
}

// 26. P17: a quantum walk spreads ballistically (width ~ t) while a classical
// walk on the same chain spreads diffusively (width ~ sqrt(t)). Quadrupling the
// time roughly quadruples the quantum width but only doubles the classical one.
{
  const n = 151
  const center = Math.floor(n / 2)
  const ops = chainOperators(n)
  const eigA = eigSymmetric({ matrix: ops.adjacency })
  const eigL = eigSymmetric({ matrix: ops.laplacian })
  const qRatio =
    Math.sqrt(quantumMsd({ eig: eigA, n, center, t: 16 })) /
    Math.sqrt(quantumMsd({ eig: eigA, n, center, t: 4 }))
  const cRatio =
    Math.sqrt(classicalMsd({ eig: eigL, n, center, t: 16 })) /
    Math.sqrt(classicalMsd({ eig: eigL, n, center, t: 4 }))
  check({
    name: 'P17: quantum walk is ballistic, classical walk is diffusive',
    ok: qRatio > 3.5 && cRatio > 1.7 && cRatio < 2.4,
    detail: `4x time: quantum width x${qRatio.toFixed(2)}, classical width x${cRatio.toFixed(2)}`,
  })
}

// 27. P14: a mass term opens a spectral gap equal to m and a relativistic
// dispersion omega^2 = a*k^2 + b with a near 1 and b near m^2.
{
  const s = massStudy({ m: 0.3 })
  check({
    name: 'P14: mass gives gap = m and relativistic dispersion (b ~ m^2)',
    ok: Math.abs(s.gap - 0.3) < 0.01 && Math.abs(s.b - 0.09) < 0.02 && s.a > 0.9 && s.a < 1.05,
    detail: `gap ${s.gap.toFixed(3)}, a ${s.a.toFixed(3)}, b ${s.b.toFixed(3)}`,
  })
}

// 28. P15: free-fermion entanglement follows the 1D conformal log law (slope near
// c/3 = 1/3 for c = 1) and a 2D area law (boundary beats volume).
{
  const slope1D = logLawSlope1D({ n: 120 })
  const two = areaLaw2D({ side: 12 })
  check({
    name: 'P15: 1D conformal log law (c ~ 1) and 2D entanglement area law',
    ok: slope1D > 0.25 && slope1D < 0.42 && two.areaBeatsVolume && two.boundaryFit > 0,
    detail: `1D slope ${slope1D.toFixed(3)} (c/3=0.33), 2D area beats volume ${two.areaBeatsVolume}`,
  })
}

// 29. P12: the smeared action favors the manifold phase extensively, so a finite
// free-energy crossing exists and the manifold (spacetime) phase dominates above it.
{
  const r = p12Crossing({ size: 32 })
  check({
    name: 'P12: action favors manifold extensively, giving a finite free-energy crossing',
    ok: r.dS > 10 && r.betaStar !== null && (r.betaStar ?? -1) >= 0 && (r.betaStar ?? 99) < 1,
    detail: `action gap ${r.dS.toFixed(1)}, beta* ${r.betaStar === null ? 'none' : r.betaStar.toFixed(3)}`,
  })
}

// 30. P13: classical sequential growth gives a monotone arrow of time (relations
// only accumulate) and a finite recovered dimension.
{
  const r = csgCosmology({ size: 200, p: 0.08, seed: 1 })
  check({
    name: 'P13: growth gives a monotone arrow of time and a finite dimension',
    ok: r.arrowMonotone && r.dimension > 0 && r.dimension < 4,
    detail: `arrow monotone ${r.arrowMonotone}, dimension ${r.dimension.toFixed(2)}`,
  })
}

// 31. P12 refinement: Wang-Landau measures the free-energy crossing directly. The
// equilibrium manifold fraction rises from near zero (layered dominates) through a
// finite beta-star to one (manifold dominates), the measured first-order crossing.
{
  const wl = wangLandauHeight({
    size: 20,
    epsilon: 0.9,
    minHeight: 2,
    maxHeight: 9,
    rng: makeRng({ seed: 20 }),
    maxSteps: 3_000_000,
    coverThreshold: 1200,
    burnInFraction: 0.5,
  })
  const betaStar = crossingBeta(wl, 8)
  const f0 = manifoldFractionAt(wl, 0)
  const f1 = manifoldFractionAt(wl, 1)
  check({
    name: 'P12 Wang-Landau: a measured finite free-energy crossing (layered to manifold)',
    ok: betaStar !== null && (betaStar ?? -1) > 0 && (betaStar ?? 9) < 1 && f0 < 0.4 && f1 > 0.8,
    detail: `beta* ${betaStar === null ? 'none' : betaStar.toFixed(3)}, manifold fraction ${f0.toFixed(2)} -> ${f1.toFixed(2)}`,
  })
}

// 32. P13 refinement: a causal set sprinkled into an expanding de Sitter universe
// expands, its intrinsic spatial slices growing with proper time (the opposite of
// plain percolation), with a finite manifold-like dimension.
{
  const r = deSitterExpansion({ count: 500, hubble: 1, seed: 1 })
  check({
    name: 'P13 de Sitter: expanding geometry gives an expanding causal order',
    ok: r.expands && r.lateWidth > 1.5 * r.earlyWidth && r.dimension > 0 && r.dimension < 6,
    detail: `slice width ${r.earlyWidth.toFixed(1)} -> ${r.lateWidth.toFixed(1)}, dimension ${r.dimension.toFixed(2)}`,
  })
}

// 33. P13 deepest edge: expansion emerges from a pure local growth rule. With net
// birth one (q = 0) the spatial front is static; with net birth above one (q = 0.3)
// it grows on its own at rate about 1 + q, with a manifold-like dimension and no
// imposed metric.
{
  const stat = branchingExpansion({ spawnProb: 0, seed: 1 })
  const grow = branchingExpansion({ spawnProb: 0.3, seed: 1 })
  check({
    name: 'P13 growth rule: net-positive birth gives emergent expansion (static control at q=0)',
    ok:
      !stat.expands &&
      Math.abs(stat.rate - 1) < 0.05 &&
      grow.expands &&
      grow.rate > 1.2 &&
      grow.rate < 1.45 &&
      grow.dimension > 1 &&
      grow.dimension < 3,
    detail: `q=0 rate ${stat.rate.toFixed(2)} (static); q=0.3 rate ${grow.rate.toFixed(2)}, dim ${grow.dimension.toFixed(2)}`,
  })
}

// 34. P18 dark matter: a nonlocal (infrared-enhanced) gravitational kinetic term
// flattens the rotation curve. Local gravity declines (Keplerian, ratio below one),
// the nonlocal one stays flat or rises (ratio at or above one), with no dark particle.
{
  const local = rotationCurve({ side: 19, nonlocal: 0 })
  const nonlocal = rotationCurve({ side: 19, nonlocal: 1.5 })
  check({
    name: 'P18 dark matter: nonlocal gravity flattens the rotation curve (no dark particle)',
    ok: local.flatnessRatio < 0.7 && nonlocal.flatnessRatio > 0.95 && nonlocal.flatnessRatio > local.flatnessRatio,
    detail: `local ratio ${local.flatnessRatio.toFixed(2)} (falls), nonlocal ratio ${nonlocal.flatnessRatio.toFixed(2)} (flat/rising)`,
  })
}

// 35. P19 dark energy: the 4D action fluctuation is measured and grows with volume
// (the sharp-action fluctuation problem; the everpresent shrinking needs smearing).
{
  const r = darkEnergy4D({ sizes: [64, 128, 256], repeats: 10 })
  const increasing = (r.stds[0] ?? 0) < (r.stds[1] ?? 0) && (r.stds[1] ?? 0) < (r.stds[2] ?? 0)
  check({
    name: 'P19 dark energy: the 4D action fluctuation scaling is measured',
    ok: increasing && r.actionExponent > 0.5 && r.actionExponent < 2,
    detail: `std(S) ~ N^${r.actionExponent.toFixed(2)} (sharp 4D action fluctuation problem)`,
  })
}

// 36. P20 photon: the free U(1) gauge field is massless and gauge-invariant. About
// one third of modes are exact gauge zero modes, the physical spectrum is gapless
// (min omega^2 shrinks with L), and a mass term gives a fixed gap.
{
  const a = photonStudy({ side: 3 })
  const b = photonStudy({ side: 5 })
  const gaugeFraction = a.gauge / a.dof
  check({
    name: 'P20 photon: massless, gauge-invariant U(1) field (two transverse polarizations)',
    ok:
      gaugeFraction > 0.25 &&
      gaugeFraction < 0.42 &&
      b.minPhysicalOmega2 < a.minPhysicalOmega2 &&
      a.massiveMinOmega2 > 0.9 &&
      a.massiveMinOmega2 < 1.1,
    detail: `gauge fraction ${gaugeFraction.toFixed(2)}, min omega^2 ${a.minPhysicalOmega2.toFixed(2)}->${b.minPhysicalOmega2.toFixed(2)} (massless), massive gap ${a.massiveMinOmega2.toFixed(2)}`,
  })
}

// 37. P21 graviton: the massless graviton is spin-2 with exactly two transverse-
// traceless polarizations (a massive spin-2 has five), and a massless dispersion.
{
  const r = gravitonStudy()
  const massless = r.masslessPolarizations.every((p) => p === 2)
  const shrinks = (r.dispersion[r.dispersion.length - 1]?.omega2 ?? 9) < (r.dispersion[0]?.omega2 ?? 0)
  check({
    name: 'P21 graviton: massless spin-2, two transverse-traceless polarizations (massive has five)',
    ok: massless && r.massivePolarizations === 5 && shrinks,
    detail: `TT polarizations ${r.masslessPolarizations.join('/')}, massive ${r.massivePolarizations}, dispersion shrinks ${shrinks}`,
  })
}

// 38. P22 Higgs: spontaneous symmetry breaking gives a nonzero vacuum value, and the
// photon eats the Goldstone mode and becomes massive with gap (g v)^2 (massless in
// the symmetric phase).
{
  const r = higgsStudy({ side: 4, coupling: 1 })
  check({
    name: 'P22 Higgs: symmetry breaking generates a photon mass (gv)^2 (massless when unbroken)',
    ok:
      Math.abs(r.vevSymmetric) < 1e-9 &&
      r.vevBroken > 0.5 &&
      Math.abs(r.photonGapSymmetric) < 1e-3 &&
      r.photonGapBroken > 0.5 &&
      Math.abs(r.photonGapBroken - r.expectedGapBroken) < 1e-3 &&
      r.higgsMassBroken > 0,
    detail: `v ${r.vevSymmetric.toFixed(2)}->${r.vevBroken.toFixed(2)}, photon gap ${r.photonGapSymmetric.toFixed(2)}->${r.photonGapBroken.toFixed(2)}, Higgs mass ${r.higgsMassBroken.toFixed(2)}`,
  })
}

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  process.exit(1)
}
