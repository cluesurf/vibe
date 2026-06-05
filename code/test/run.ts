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

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  process.exit(1)
}
