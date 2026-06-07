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
import { gaugeFromAction } from '~/experiment/p23-gauge-from-action'
import { gravitonFromAction } from '~/experiment/p24-graviton-from-action'
import { electroweak } from '~/experiment/p25-electroweak'
import { swerveDiffusion } from '~/experiment/p26-swerves'
import { latticeAnisotropy, lorentzSafety } from '~/experiment/p27-lorentz-violation'
import { minimumInterval } from '~/experiment/p28-singularity-resolution'
import { darkEnergySmeared4D } from '~/experiment/p29-dark-energy-smeared'
import { inflate } from '~/experiment/p30-inflation'
import { quantumFormalism } from '~/experiment/p31-quantum-formalism'
import { bianchiResidual, gravitonSpeed } from '~/experiment/p32-einstein-equations'
import { blackHoleEntropy } from '~/experiment/p33-black-hole'
import { capstone } from '~/experiment/p34-capstone'
import { darkEnergyPrediction, lorentzPrediction } from '~/experiment/p35-contact-with-data'
import { dslDemo } from '~/experiment/p36-dsl'
import { vibe } from '~/model/vibe'
import { propagation } from '~/experiment/p37-one-rule-propagation'
import { sliceDimension } from '~/experiment/p38-emergent-spatial-geometry'
import { deterministicSubstrate } from '~/experiment/p39-deterministic-substrate'
import { nonRandomSubstrates } from '~/experiment/p40-non-random-substrates'
import { margensternTilings } from '~/experiment/p41-margenstern-tilings'
import { fibonacciNavigation } from '~/experiment/p42-fibonacci-navigation'
import { freedomChoice } from '~/experiment/p43-freedom-choice'
import { universality } from '~/experiment/p44-universality'
import { dodecagrid } from '~/experiment/p45-dodecagrid'
import { everpresentDynamical } from '~/experiment/p46-everpresent-dynamical'
import { coxeterUnification } from '~/experiment/p47-coxeter-unification'
import { modularBase } from '~/experiment/p48-modular-base'

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

// 39. P23: the Maxwell (photon) operator is derived from the Wilson gauge action,
// the ratio of the Wilson action to the Maxwell action converging to one as the field
// shrinks.
{
  const r = gaugeFromAction({ side: 4 })
  const last = r.ratios[r.ratios.length - 1] ?? 0
  check({
    name: 'P23: Maxwell operator derived from the Wilson action (small-field limit)',
    ok: last > 0.999 && last < 1.001,
    detail: `Wilson/Maxwell ratio at smallest field ${last.toFixed(5)}`,
  })
}

// 40. P24: the graviton is derived from the linearized Einstein operator. It is
// diffeomorphism-invariant (pure-gauge perturbations annihilated) with exactly two
// massless modes at eigenvalue (1/2)|k|^2.
{
  const r = gravitonFromAction({ k: [1, 1, 1] })
  check({
    name: 'P24: graviton derived from the gravitational action (diffeo-invariant, two modes)',
    ok: r.gravitonModes === 2 && r.diffeoResidual < 1e-10 && Math.abs(r.gravitonEigenvalue - 0.5 * r.k2) < 1e-9,
    detail: `${r.gravitonModes} modes at (1/2)|k|^2 = ${r.gravitonEigenvalue.toFixed(2)}, diffeo residual ${r.diffeoResidual.toExponential(1)}`,
  })
}

// 41. P25: electroweak breaking SU(2) x U(1) -> U(1)_EM gives a massless photon, a
// massive W and Z, and the Weinberg relation m_W = m_Z cos(theta_W).
{
  const r = electroweak({ g: 0.65, gPrime: 0.358, v: 246 })
  check({
    name: 'P25: electroweak breaking gives W, Z mass, massless photon, m_W = m_Z cos(theta_W)',
    ok:
      r.mPhoton < 1e-6 &&
      r.mW > 70 &&
      r.mZ > r.mW &&
      Math.abs(r.ratioCheck - r.cosThetaW) < 1e-3 &&
      r.sin2ThetaW > 0.2 &&
      r.sin2ThetaW < 0.26,
    detail: `W ${r.mW.toFixed(1)}, Z ${r.mZ.toFixed(1)}, photon ${r.mPhoton.toFixed(3)}, sin^2 ${r.sin2ThetaW.toFixed(3)}`,
  })
}

// 42. P26 swerves: a particle on a causal set undergoes momentum (rapidity)
// diffusion, its variance growing with proper time, an effect impossible in the
// continuum where a free particle keeps its velocity.
{
  const r = swerveDiffusion({ density: 1.2, seed: 1, trajectories: 250 })
  const clean = r.points.filter((p) => p.tau <= 11)
  const grows = clean.length > 2 && (clean[clean.length - 1]?.varRapidity ?? 0) > 2 * (clean[0]?.varRapidity ?? 1)
  check({
    name: 'P26 swerves: momentum diffusion from discreteness (variance grows with proper time)',
    ok: r.slope > 0.01 && grows,
    detail: `rapidity variance slope ${r.slope.toFixed(4)} per unit proper time, grows ${grows}`,
  })
}

// 43. P27 Lorentz violation: a lattice has energy-dependent, directional Lorentz
// violation (group-speed anisotropy grows with energy), while a random sprinkling is
// Lorentz-safe (isotropic link directions, no preferred frame).
{
  const low = latticeAnisotropy(0.2).anisotropy
  const high = latticeAnisotropy(2.6).anisotropy
  const s = lorentzSafety()
  check({
    name: 'P27 Lorentz: lattice violates (energy-dependent), sprinkle is Lorentz-safe',
    ok: high > low && high > 0.1 && low < 0.05 && s.sprinkle < 0.2 && s.lattice > 0.8,
    detail: `lattice anisotropy ${low.toFixed(3)}->${high.toFixed(3)} with energy; link isotropy sprinkle ${s.sprinkle.toFixed(2)} vs lattice ${s.lattice.toFixed(2)}`,
  })
}

// 44. P28 singularity resolution: discreteness gives a minimum causal interval, so
// the curvature (1/length^2) is capped at a finite value that rises with density,
// never infinite.
{
  const a = minimumInterval({ density: 1, seed: 1 })
  const b = minimumInterval({ density: 16, seed: 1 })
  check({
    name: 'P28 singularity resolution: discreteness caps the curvature (finite, density-set)',
    ok:
      b.meanLength < a.meanLength &&
      b.curvatureCap > a.curvatureCap &&
      Number.isFinite(b.curvatureCap) &&
      a.curvatureCap > 0,
    detail: `min length ${a.meanLength.toFixed(3)}->${b.meanLength.toFixed(3)}, curvature cap ${a.curvatureCap.toFixed(1)}->${b.curvatureCap.toFixed(1)} (finite)`,
  })
}

// 45. P29 dark energy: the 4D smeared kernel tames the action fluctuation, pushing the
// implied Lambda exponent below the sharp value (toward the everpresent shrinking).
{
  const r = darkEnergySmeared4D({ sizes: [64, 128, 256, 512], repeats: 20, epsilon: 0.3 })
  check({
    name: 'P29 dark energy: 4D smeared kernel tames the fluctuation (toward everpresent Lambda)',
    ok: r.smearedExponent < r.sharpExponent && Number.isFinite(r.smearedExponent),
    detail: `sharp N^${r.sharpExponent.toFixed(2)}, smeared N^${r.smearedExponent.toFixed(2)} (lower = tamed)`,
  })
}

// 46. P30 inflation: a high early spawn rate gives a burst of rapid expansion (several
// e-folds) with a graceful exit to slow expansion.
{
  const r = inflate({
    generations: 16,
    initialWidth: 2,
    inflationGenerations: 6,
    qInflation: 1.0,
    qNormal: 0.05,
    seed: 1,
  })
  const early = r.ratesPerGen.slice(0, 6).reduce((a, b) => a + b, 0) / 6
  const late = r.ratesPerGen.slice(6).reduce((a, b) => a + b, 0) / Math.max(1, r.ratesPerGen.length - 6)
  check({
    name: 'P30 inflation: rapid early expansion with a graceful exit (time-varying birth rate)',
    ok: early > 1.5 && late < 1.3 && r.inflationEfolds > 3,
    detail: `early rate ${early.toFixed(2)}, ${r.inflationEfolds.toFixed(1)} e-folds, late rate ${late.toFixed(2)}`,
  })
}

// 47. P31 quantum formalism: unitary evolution conserves the Born probability, and
// amplitudes interfere (the cross term is nonzero), the pillars of quantum mechanics.
{
  const r = quantumFormalism({ n: 40 })
  check({
    name: 'P31 quantum formalism: unitarity, the Born rule, and interference of amplitudes',
    ok: r.bornConserved && Math.abs(r.interferenceTerm) > 0.01 && r.quantumSum > r.classicalSum,
    detail: `norm conserved ${r.bornConserved}, interference term ${r.interferenceTerm.toFixed(3)}`,
  })
}

// 48. P32 Einstein equations: the Einstein tensor is transverse (k . G = 0, energy-
// momentum conservation built in) and the graviton propagates at the speed of light.
{
  const res = bianchiResidual({ k: [2, 1, 3], samples: 30, seed: 1 })
  const speed = gravitonSpeed(0.5)
  check({
    name: 'P32 Einstein equations: conservation (transverse G) and a c-speed graviton',
    ok: res < 1e-10 && Math.abs(speed - 1) < 1e-6,
    detail: `Bianchi residual ${res.toExponential(1)}, graviton speed ${speed.toFixed(4)}`,
  })
}

// 49. P33 black holes: the entanglement entropy of a region scales with its surface
// area, not its volume (the Bekenstein-Hawking area law).
{
  const r = blackHoleEntropy({ side: 8 })
  const increasing = (r.entropies[0] ?? 0) < (r.entropies[1] ?? 0) && (r.entropies[1] ?? 0) < (r.entropies[2] ?? 0)
  check({
    name: 'P33 black holes: entropy scales with horizon area, not volume (Bekenstein-Hawking)',
    ok: r.areaBeatsVolume && increasing,
    detail: `area residual ${r.areaResidual.toExponential(1)} < volume residual ${r.volumeResidual.toExponential(1)}`,
  })
}

// 50. P34 capstone: the committed model (ternary signed-majority rule on a growing
// random hyperbolic mesh) runs end-to-end, and the key emergent structures all come
// off that one instantiation: Lorentz-safe geometry with exponential reach, ternary
// dynamics converging to stable states, a bounded-below local emergent Hamiltonian,
// and the arrow of accumulation.
{
  const r = capstone({ count: 1000, seed: 1 })
  check({
    name: 'P34 capstone: the committed model runs end-to-end (one mesh, one rule, all structures)',
    ok:
      r.meanDegree > 5 &&
      r.meanDegree < 16 &&
      r.anisotropy < 0.3 &&
      r.reachExponential &&
      r.allTernary &&
      r.dynamicsConverges &&
      r.laplacianBoundedBelow &&
      r.arrowMonotone,
    detail: `degree ${r.meanDegree.toFixed(1)}, anisotropy ${r.anisotropy.toFixed(2)}, reach ${r.reachExponential}, ternary converges ${r.dynamicsConverges}, H>=0 ${r.laplacianBoundedBelow}, arrow ${r.arrowMonotone}`,
  })
}

// 51. P35 contact with data: the everpresent-Lambda prediction matches the observed
// dark energy to order of magnitude, and the framework predicts no linear Lorentz
// violation, which gamma-ray-burst timing confirms.
{
  const de = darkEnergyPrediction()
  const liv = lorentzPrediction()
  check({
    name: 'P35 contact with data: dark-energy magnitude matches, no linear Lorentz violation',
    ok: de.ratio > 0.1 && de.ratio < 10 && liv.frameworkLinearLIV === false && liv.gribBoundInPlanck > 1,
    detail: `Lambda predicted/observed ratio ${de.ratio.toFixed(2)} (order-of-magnitude match), framework linear LIV ${liv.frameworkLinearLIV}`,
  })
}

// 52. P36 the model DSL: vibe() builds the committed model (Lorentz-safe, exponential
// reach, bounded-below Hamiltonian, a non-trivial stable tone pattern), and swapping
// the mesh to a lattice expresses the Lorentz-violating alternative.
{
  const d = dslDemo()
  const describesModel = vibe().describe().includes('signed-majority')
  check({
    name: 'P36 model DSL: vibe() builds the committed model and expresses variants',
    ok:
      describesModel &&
      d.committedAnisotropy < 0.2 &&
      d.committedReach &&
      d.committedBoundedBelow &&
      d.toneMix &&
      d.latticeAnisotropy > 0.8,
    detail: `committed anisotropy ${d.committedAnisotropy.toFixed(2)} vs lattice ${d.latticeAnisotropy.toFixed(2)}, reach ${d.committedReach}, H>=0 ${d.committedBoundedBelow}`,
  })
}

// 53. P37 one rule, propagation: the ternary rule itself carries a strict causal
// light-cone (a disturbance never outruns one hop per beat) and the front advances.
{
  const r = propagation({ count: 600, beats: 8, seed: 1 })
  check({
    name: 'P37 one rule: causal light-cone from the rule itself (finite-speed propagation)',
    ok: r.lightConeHolds && r.frontAdvances,
    detail: `front radius ${r.frontRadius.join(',')}, light-cone ${r.lightConeHolds}`,
  })
}

// 54. P38 emergent spatial geometry: a coexisting slice has a definite spatial dimension
// below the spacetime dimension, rising by about one from 2D to 3D (the d-1 trend).
{
  const two = sliceDimension({ dimension: 2, count: 5000, seed: 1 })
  const three = sliceDimension({ dimension: 3, count: 11000, seed: 1 })
  check({
    name: 'P38 emergent spatial geometry: slice dimension below spacetime, rising by ~1 (d-1 trend)',
    ok:
      three.spatialDimension > two.spatialDimension &&
      two.spatialDimension < 2 &&
      three.spatialDimension < 3 &&
      three.spatialDimension - two.spatialDimension > 0.4,
    detail: `2D slice dim ${two.spatialDimension.toFixed(2)}, 3D slice dim ${three.spatialDimension.toFixed(2)}, rise ${(three.spatialDimension - two.spatialDimension).toFixed(2)}`,
  })
}

// 55. P39 deterministic substrate: the golden-angle sunflower is as Lorentz-safe as the
// random sprinkle (anisotropy in the same low band) with exponential reach, no rng.
{
  const r = deterministicSubstrate({ count: 1200, seed: 1 })
  check({
    name: 'P39 deterministic substrate: non-random sunflower is as Lorentz-safe as the random sprinkle',
    ok: r.deterministicIsSafe && r.sunflower.anisotropy < 0.15 && r.sunflower.reach,
    detail: `sunflower anisotropy ${r.sunflower.anisotropy.toFixed(3)} vs random ${r.random.anisotropy.toFixed(3)}, reach ${r.sunflower.reach}`,
  })
}

// 56. P40 non-random substrates: every hyperbolic substrate (random, sunflower, halton,
// and the regular {7,3} and {5,4} tilings) is Lorentz-safe, while the flat lattice is
// not. Regularity does not break Lorentz invariance once the space is curved.
{
  const r = nonRandomSubstrates({ seed: 1 })
  const hyperbolicSafe = ['random sprinkle', 'sunflower (golden angle)', 'halton (2,3) disc', 'tiling {7,3}', 'tiling {5,4}'].every(
    (k) => r[k]?.lorentzSafe === true,
  )
  const latticeUnsafe = r['flat lattice (control)']?.lorentzSafe === false
  const tilingsIsotropic = (r['tiling {7,3}']?.anisotropy ?? 1) < 0.1 && (r['tiling {5,4}']?.anisotropy ?? 1) < 0.1
  check({
    name: 'P40 non-random substrates: hyperbolic tilings and sequences are Lorentz-safe, flat lattice is not',
    ok: hyperbolicSafe && latticeUnsafe && tilingsIsotropic,
    detail: `{7,3} anisotropy ${(r['tiling {7,3}']?.anisotropy ?? 0).toFixed(3)}, {5,4} ${(r['tiling {5,4}']?.anisotropy ?? 0).toFixed(3)}, lattice ${(r['flat lattice (control)']?.anisotropy ?? 0).toFixed(3)}`,
  })
}

// 57. P41 Margenstern tilings: both families ({p,4} and {p,3}) are Lorentz-safe across
// the board, with small anisotropy and exponential reach.
{
  const r = margensternTilings({ seed: 2 })
  const all = Object.values(r)
  const allSafe = all.every((e) => e.lorentzSafe && e.anisotropy < 0.12 && e.reach)
  check({
    name: 'P41 Margenstern tilings: all {p,4} and {p,3} tilings are Lorentz-safe',
    ok: all.length === 6 && allSafe,
    detail: `max anisotropy ${Math.max(...all.map((e) => e.anisotropy)).toFixed(3)} across ${all.length} tilings`,
  })
}

// 58. P42 Fibonacci navigation: routing by tree-address arithmetic on the heptagrid
// delivers every signal exactly, efficiently (low stretch), with exponential ring growth.
{
  const r = fibonacciNavigation({ pairs: 1000, seed: 1 })
  check({
    name: 'P42 Fibonacci navigation: exact addressed routing on the heptagrid, efficient',
    ok: r.deliveryRate === 1 && r.meanStretch < 3 && r.levelGrowthRatio > 1.1 && r.meanHops < 2 * r.treeDepth + 1,
    detail: `delivery ${(100 * r.deliveryRate).toFixed(0)}%, mean hops ${r.meanHops.toFixed(1)}, stretch ${r.meanStretch.toFixed(2)}, ring growth ${r.levelGrowthRatio.toFixed(2)}`,
  })
}

// 59. P43 freedom and choice: a choice is determined (reproduces, not random) yet jointly
// authored by self and urge, with agency scaling by self-structure, and irreducible.
{
  const r = freedomChoice({ n: 80, seed: 1 })
  check({
    name: 'P43 freedom and choice: determined yet self-authored, not predetermined by any part, irreducible',
    ok: r.deterministic && r.selfDiversity > 0.05 && r.urgeCanFlip && r.agencyMonotone && r.irreducible,
    detail: `deterministic ${r.deterministic}, self-diversity ${r.selfDiversity.toFixed(2)}, agency monotone ${r.agencyMonotone}, settling ${r.meanSettlingBeats.toFixed(1)} beats`,
  })
}

// 60. P44 universality: the rule realizes NAND (functionally complete), builds a correct
// full adder, and expresses the universal Rule 110, so the substrate is computation-universal.
{
  const r = universality()
  check({
    name: 'P44 universality: the rule is functionally complete (NAND, adder, Rule 110)',
    ok: r.nandCorrect && r.adderCorrect && r.rule110Expressible && r.rule110Evolves,
    detail: `NAND ${r.nandCorrect}, adder ${r.adderCorrect}, Rule 110 ${r.rule110Expressible}, evolves ${r.rule110Evolves}`,
  })
}

// 61. P45 dodecagrid: the 3D hyperbolic honeycomb {5,3,4} is Lorentz-safe (curvature
// scrambles direction in 3D too), while a flat cubic lattice is not.
{
  const r = dodecagrid({ seed: 2 })
  check({
    name: 'P45 dodecagrid {5,3,4}: the 3D hyperbolic honeycomb is Lorentz-safe, flat cubic lattice is not',
    ok: r.honeycomb.lorentzSafe && r.honeycomb.anisotropy < 0.2 && r.honeycomb.reach && r.flatLattice.lorentzSafe === false,
    detail: `dodecagrid anisotropy ${r.honeycomb.anisotropy.toFixed(3)} (safe), cubic lattice ${r.flatLattice.anisotropy.toFixed(3)} (unsafe)`,
  })
}

// 62. P46 everpresent Lambda: the conjugate-volume (dynamical) model gives the everpresent
// delta-Lambda ~ V^-0.5, closing the dark-energy direction the static action only approached.
{
  const r = everpresentDynamical({ volumes: [1e2, 1e3, 1e4, 1e5, 1e6], repeats: 20000, seed: 1 })
  check({
    name: 'P46 everpresent Lambda: conjugate-volume model gives the V^-0.5 everpresent scaling',
    ok: r.exponent < -0.45 && r.exponent > -0.55,
    detail: `delta-Lambda ~ V^${r.exponent.toFixed(3)} (everpresent prediction -0.5)`,
  })
}

// 63. P47 Coxeter unification: {7,3}, {5,4}, and {5,3,4} all come from one generator by
// changing the Schlafli symbol, and all are Lorentz-safe.
{
  const r = coxeterUnification({ seed: 2 })
  const all = Object.values(r)
  check({
    name: 'P47 Coxeter unification: one machine yields all the tessellations, all Lorentz-safe',
    ok: all.length === 5 && all.every((e) => e.lorentzSafe) && all.some((e) => e.dimension === 3),
    detail: `${all.length} tessellations from one generator, max anisotropy ${Math.max(...all.map((e) => e.anisotropy)).toFixed(3)}`,
  })
}

// 64. P48 modular base: the parameter-free modular tessellation is Lorentz-safe, the
// Stern-Brocot automaton addresses every rational by its continued fraction, and the
// golden ratio is its central geodesic (Fibonacci convergents reach phi).
{
  const r = modularBase({ seed: 2 })
  check({
    name: 'P48 modular base: parameter-free, Lorentz-safe, continued-fraction addressed, golden-ratio central',
    ok: r.lorentzSafe && r.addressingExact && r.goldenError < 1e-4,
    detail: `anisotropy ${r.anisotropy.toFixed(3)}, addressing exact ${r.addressingExact}, golden error ${r.goldenError.toExponential(1)}`,
  })
}

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  process.exit(1)
}
