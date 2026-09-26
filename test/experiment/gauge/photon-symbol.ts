// Light derived, not fitted. The leapfrog U(1) sector of code/rule/photon-links (E-FRC-0164) linearized about
// the cold vacuum (A = 0, E = 0) and solved in momentum space, as E-CMP-0017 solved the fear walk
// (code/measure/photon-symbol). Where the force is linear, f(B) = kappa B, one beat on a plane wave of wave
// vector k is the symbol
//
//   U(k) = [[ I, I ], [ -kappa M(k), I - kappa M(k) ]],  M(k) = C(k)^dagger C(k), the curl-curl matrix
//
// and on an eigenvector of M with eigenvalue lambda the 2 x 2 block has determinant exactly 1 and trace
// 2 - kappa lambda, so the photon dispersion is exact: 4 sin^2(omega / 2) = kappa lambda(k). The husk (the
// column sum onto the cubic horosphere, code/measure/photon-husk) is the bulk at k4 = 0, where the depth
// reflection x4 -> -x4 is a symmetry of the rule: the column sum P keeps the depth-even vectors and kills the
// depth-odd ones, so the husk dynamics is closed, with its own symbol M_h = P M P^T G^-1 (G the husk weights).
//
// Masslessness from gauge invariance. The flux of a gradient has no curl (every plaquette is a closed loop),
// so M(k) g(k) = 0 at every k, g(k)_a = 2 i sin(k . r_a / 2): the pure-gauge direction costs nothing. At
// k = eps q, g / eps -> i q . r_a, a linear form, so every linear form r_a -> q . r_a lies in ker M(0), for
// every direction q: M(0) has at least d zero eigenvalues (d the dimension). M(k) is continuous and positive
// semidefinite, so d eigenvalues of M(k) tend to 0 with k: one is the gauge direction, exactly 0 at every k,
// and the other d - 1 are the photons, with lambda = O(k^2) because M(k) is smooth and even (M(-k) =
// conj M(k)). Hence omega -> 0 as k -> 0 on the physical branches. The remaining eigenvalues of M(0) are the
// massive lattice branches, and the photon count is d - 1 exactly when ker M(0) is exactly the linear forms.
//
// Gates, fixed before the run. N = 8192, K = 80, kappa = 2 pi K / N (E-FRC-0164).
// A. The symbol read off the rule. With the exactly linear force table f(B) = centered(B) (kappa 1), a unit
//    probe on each link direction of dock 0, (A, E) = (e, 0) and (0, e), run through photonBeatInPlace itself:
//    A1 every entry agrees with U = [[I, I], [-M, I - M]]: 0 mismatches, in integers, on the D4 box side 6
//       and the cubic torus side 6
//    A2 the probed stencil's Fourier transform equals plaquetteWaveMatrix at every one of the side^d modes,
//       and the plaquette-shape symbol at physical k equals both, largest entry gap under 1e-12
// B. The husk symbol, at every husk mode m != 0 of the side-12 husk (1,727 wave vectors), the bulk at (m, 0):
//    B1 closure: |P M - M_h P| under 1e-12
//    B2 the husk spectrum together with the odd block's is the bulk spectrum, under 1e-11
//    B3 counts: bulk 1 gauge (below 1e-12) + 3 photons + 8 massive; husk 1 + 2 + 6; the odd block 0 + 1 + 2.
//       A photon is one of the d - 1 smallest nonzero eigenvalues; the photon band's top lies below the
//       massive band's bottom over the whole sample
// C. Masslessness:
//    C1 |M(k) g(k)| under 1e-12 |g(k)| at every sampled k, bulk (all side-12 bulk modes) and husk
//    C2 M(0): exactly d eigenvalues under 1e-12 (4 bulk, 3 husk), the next above 1; each linear form
//       q . r_a has |M(0) v| under 1e-12
//    C3 the photon eigenvalues at k = eps q: lambda / (eps^2) changes by under 1e-4 from eps = 1e-3 to 1e-4,
//       along six bulk and four husk directions, and all these limits agree within 1e-4 (isotropy at order
//       k^2), and on the husk equal the bulk's
//    C4 stability of the leapfrog at the E-FRC-0164 coupling: kappa lambda_max under 4 over the bulk sample
// D. The husk's lattice Green's function, L G = delta on the 9-direction cubic lattice with axis weight 2
//    and diagonal weight 1, whose continuum limit is -6 laplacian (sum of w_h u_h u_h^T = 6 I), so
//    G(r) -> 1 / (24 pi r):
//    D1 the E-FRC-0169 reference is this Green's function: huskCoulomb's pair energy for +-1 at husk
//       separation r = 1 to 4 on the 12^3 husk equals G_12(0) - G_12(r), relative gap under 1e-8
//    D2 the column sum of the bulk's own Coulomb flux (coulombFlux, the four-dimensional box) for the
//       E-FRC-0169 love and fear placements equals huskCoulomb's flux, largest gap under 1e-7 of the largest
//       entry: the projection of the bulk Coulomb field is the husk lattice Coulomb field, exactly
//    D3 the infinite lattice (2 G_128 - G_64): |24 pi r G(r) - 1| along a husk axis falls from r = 1 through
//       2, 3 and 4, and is under 0.02 at r = 4: the r = 1 core is lattice structure
//
// Depth L2: linear algebra on the rule's own symbol, every formula checked against the rule's beats or its
// solvers. No measurement of a hot field.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { coulombFlux, emptyPhotonState, makePhotonRule, photonLatticeCubic, photonLatticeD4, placePairAlong, type PhotonLattice } from '@/code/rule/photon-links'
import { plaquetteWaveMatrix, waveVector } from '@/code/measure/photon-modes'
import { bulkModeOfHusk, columnSum, huskCoulomb, makeHusk, projectLinks } from '@/code/measure/photon-husk'
import {
  applyNorm,
  curlSymbol,
  eigenvalues,
  gradientVector,
  huskGreen,
  huskSymbol,
  leapfrogBlock,
  matrixGap,
  plaquetteShapes,
  readStencil,
  stencilSymbol,
  type PlaquetteShape,
} from '@/code/measure/photon-symbol'
import { type ComplexMatrix } from '@/code/algebra/linear/dense'

const N = 8192
const K = 80
const KAPPA = (2 * Math.PI * K) / N
const SIDE = 12
const ZERO = 1e-12

const BULK_DIRECTIONS = [
  [1, 0, 0, 0],
  [1, 1, 0, 0],
  [1, 1, 1, 1],
  [1, 2, 3, 0],
  [0, 0, 0, 1],
  [1, 0, 0, 1],
]
const HUSK_DIRECTIONS = [
  [1, 0, 0],
  [1, 1, 0],
  [1, 1, 1],
  [1, 2, 3],
]

const unit = (v: readonly number[]): number[] => {
  const s = Math.hypot(...v)

  return v.map(x => x / s)
}

// every integer mode of a side^d box
function modes(side: number, dimension: number): number[][] {
  return Array.from({ length: side ** dimension }, (_, i) => Array.from({ length: dimension }, (_, j) => Math.floor(i / side ** j) % side))
}

function sectionA(): Record<string, number> & { ok: number } {
  const out: Record<string, number> = {}

  let ok = true

  for (const [name, lattice] of [
    ['D4', photonLatticeD4({ side: 6 })],
    ['Cubic', photonLatticeCubic({ side: 6 })],
  ] as [string, PhotonLattice][]) {
    const stencil = readStencil(lattice, N)
    const shapes = plaquetteShapes(lattice)

    let gapStencil = 0
    let gapShape = 0

    for (const n of modes(lattice.side, lattice.dimension)) {
      const reference = plaquetteWaveMatrix(lattice, n)

      gapStencil = Math.max(gapStencil, matrixGap(stencilSymbol(lattice, stencil, n), reference))
      gapShape = Math.max(gapShape, matrixGap(curlSymbol(lattice, shapes, waveVector(lattice, n)), reference))
    }

    out[`a${name}ProbeMismatches`] = stencil.mismatches
    out[`a${name}ProbeEntries`] = stencil.compared
    out[`a${name}StencilLinksPerColumn`] = stencil.columns[0]?.length ?? 0
    out[`a${name}StencilDiagonal`] = stencil.columns[0]?.find(([l]) => l === 0)?.[1] ?? 0
    out[`a${name}StencilSymbolGap`] = gapStencil
    out[`a${name}ShapeSymbolGap`] = gapShape
    ok = ok && stencil.mismatches === 0 && gapStencil < ZERO && gapShape < ZERO
  }

  // the E-FRC-0164 force table itself: its dead zone about the cold vacuum
  const rule = makePhotonRule({ lattice: photonLatticeCubic({ side: 2 }), n: N, k: K, capacity: 0 })
  const first = Array.from(rule.force).findIndex(f => f !== 0)

  out['aKappa'] = KAPPA
  out['aForceDeadZoneTop'] = first - 1
  out['aForceFirstNonzeroAt'] = first

  return { ...out, ok: ok ? 1 : 0 }
}

type Counts = { zero: number; photon: number; massive: number; photonTop: number; massiveBottom: number }

function count(values: readonly number[], photons: number): Counts {
  const zero = values.filter(v => Math.abs(v) < ZERO).length
  const rest = values.filter(v => Math.abs(v) >= ZERO)

  return {
    zero,
    photon: Math.min(photons, rest.length),
    massive: Math.max(0, rest.length - photons),
    photonTop: rest[photons - 1] ?? 0,
    massiveBottom: rest[photons] ?? Number.POSITIVE_INFINITY,
  }
}

function sectionB(): Record<string, number> & { ok: number } {
  const bulk = photonLatticeD4({ side: SIDE })
  const husk = makeHusk(bulk)

  let intertwining = 0
  let unionGap = 0
  let countsOk = true
  let photonTop = 0
  let massiveBottom = Number.POSITIVE_INFINITY
  let huskPhotonTop = 0
  let huskMassiveBottom = Number.POSITIVE_INFINITY
  let lambdaMax = 0
  let sampled = 0

  for (const m of modes(SIDE, 3)) {
    if (m.every(x => x === 0)) {
      continue
    }

    const matrix = plaquetteWaveMatrix(bulk, bulkModeOfHusk(m))
    const symbol = huskSymbol(husk, matrix)
    const all = eigenvalues(matrix)
    const onHusk = eigenvalues(symbol.hermitian)
    const odd = eigenvalues(symbol.odd)
    const union = [...onHusk, ...odd].sort((a, b) => a - b)
    const cb = count(all, 3)
    const ch = count(onHusk, 2)
    const co = count(odd, 1)

    intertwining = Math.max(intertwining, symbol.intertwining)
    unionGap = Math.max(unionGap, ...union.map((v, i) => Math.abs(v - (all[i] ?? 0))))
    countsOk =
      countsOk &&
      cb.zero === 1 &&
      cb.photon === 3 &&
      cb.massive === 8 &&
      ch.zero === 1 &&
      ch.photon === 2 &&
      ch.massive === 6 &&
      co.zero === 0 &&
      co.photon === 1 &&
      co.massive === 2
    photonTop = Math.max(photonTop, cb.photonTop)
    massiveBottom = Math.min(massiveBottom, cb.massiveBottom)
    huskPhotonTop = Math.max(huskPhotonTop, ch.photonTop)
    huskMassiveBottom = Math.min(huskMassiveBottom, ch.massiveBottom)
    lambdaMax = Math.max(lambdaMax, all[all.length - 1] ?? 0)
    sampled += 1
  }

  // the dispersion on the husk along an axis and at (2, 2, 1), bare kappa
  const out: Record<string, number> = {}

  for (const m of [
    [1, 0, 0],
    [2, 0, 0],
    [3, 0, 0],
    [4, 0, 0],
    [6, 0, 0],
    [2, 2, 1],
  ]) {
    const values = eigenvalues(huskSymbol(husk, plaquetteWaveMatrix(bulk, bulkModeOfHusk(m))).hermitian)
    const k = Math.hypot(...waveVector(husk.lattice, m))
    const tag = m.join('')

    out[`bHuskLambdaPhotonM${tag}`] = values[1] ?? 0
    out[`bHuskLambdaPhoton2M${tag}`] = values[2] ?? 0
    out[`bHuskOmegaM${tag}`] = leapfrogBlock(KAPPA, values[1] ?? 0).omega
    out[`bHuskPhaseSpeedM${tag}`] = leapfrogBlock(KAPPA, values[1] ?? 0).omega / k
  }

  // the group speed at m1 from the symbol, by a central difference in k along the axis
  const shapes = plaquetteShapes(bulk)
  const omegaAt = (kx: number): number => leapfrogBlock(KAPPA, eigenvalues(huskSymbol(husk, curlSymbol(bulk, shapes, [kx, 0, 0, 0])).hermitian)[1] ?? 0).omega
  const k1 = (2 * Math.PI) / SIDE

  out['bHuskGroupSpeedM100'] = (omegaAt(k1 + 1e-5) - omegaAt(k1 - 1e-5)) / 2e-5

  const ok =
    intertwining < ZERO &&
    unionGap < 1e-11 &&
    countsOk &&
    photonTop < massiveBottom &&
    huskPhotonTop < huskMassiveBottom

  return {
    ...out,
    bSampled: sampled,
    bIntertwining: intertwining,
    bUnionGap: unionGap,
    bCountsOk: countsOk ? 1 : 0,
    bBulkPhotonTop: photonTop,
    bBulkMassiveBottom: massiveBottom,
    bHuskPhotonTop: huskPhotonTop,
    bHuskMassiveBottom: huskMassiveBottom,
    bLambdaMaxOnHuskPlane: lambdaMax,
    ok: ok ? 1 : 0,
  }
}

// the Rayleigh quotient of the linear form r_a -> r_a . e2 at k = 1e-4 e1, over k^2: the naive continuum
// embedding (A_a = a . r_a at the link midpoint), an upper bound on the transverse photon's lambda / k^2
function rayleighLinearForm(bulk: PhotonLattice, shapes: readonly PlaquetteShape[]): number {
  const f = bulk.firsts.length
  const v = Float64Array.from(bulk.firsts, d => bulk.vectors[d]?.[1] ?? 0)
  const matrix: ComplexMatrix = curlSymbol(bulk, shapes, [1e-4, 0, 0, 0])

  let num = 0
  let den = 0

  for (let a = 0; a < f; a++) {
    for (let b = 0; b < f; b++) {
      num += (v[a] ?? 0) * (matrix.re[a * f + b] ?? 0) * (v[b] ?? 0)
    }

    den += (v[a] ?? 0) ** 2
  }

  return num / den / 1e-8
}

function sectionC(): Record<string, number> & { ok: number } {
  const bulk = photonLatticeD4({ side: SIDE })
  const husk = makeHusk(bulk)
  const shapes: PlaquetteShape[] = plaquetteShapes(bulk)

  // C1 the gauge direction, over every bulk mode of the side-12 box and every husk mode
  let gauge = 0
  let lambdaMax = 0

  for (const n of modes(SIDE, 4)) {
    const k = waveVector(bulk, n)
    const g = gradientVector(bulk, k)
    const norm = Math.hypot(...g.im)
    const matrix = curlSymbol(bulk, shapes, k)

    if (norm > 0) {
      gauge = Math.max(gauge, applyNorm(matrix, g) / norm)
    }

    const values = eigenvalues(matrix)

    lambdaMax = Math.max(lambdaMax, values[values.length - 1] ?? 0)
  }

  let huskGauge = 0

  for (const m of modes(SIDE, 3)) {
    const k = [...waveVector(husk.lattice, m), 0]
    const g = gradientVector(bulk, k)
    // P g: the husk gauge vector, w_h 2 i sin(k . u_h / 2)
    const pg = { re: new Float64Array(9), im: new Float64Array(9) }

    g.im.forEach((x, a) => (pg.im[husk.shadow[a] ?? 0] = (pg.im[husk.shadow[a] ?? 0] ?? 0) + x))

    const norm = Math.hypot(...pg.im)

    if (norm > 0) {
      huskGauge = Math.max(huskGauge, applyNorm(huskSymbol(husk, curlSymbol(bulk, shapes, k)).husk, pg) / norm)
    }
  }

  // C2 M(0)
  const zero = curlSymbol(bulk, shapes, [0, 0, 0, 0])
  const values0 = eigenvalues(zero)
  const kernel = values0.filter(v => Math.abs(v) < ZERO).length
  const huskValues0 = eigenvalues(huskSymbol(husk, zero).hermitian)
  const huskKernel = huskValues0.filter(v => Math.abs(v) < ZERO).length

  let linearForms = 0

  for (let q = 0; q < 4; q++) {
    const v = { re: Float64Array.from(bulk.firsts, d => bulk.vectors[d]?.[q] ?? 0), im: new Float64Array(bulk.firsts.length) }

    linearForms = Math.max(linearForms, applyNorm(zero, v))
  }

  // C3 the photon limit
  const photonLimit = (k: number[], rank: number, onHusk: boolean): number[] => {
    const matrix = curlSymbol(bulk, shapes, k)
    const values = onHusk ? eigenvalues(huskSymbol(husk, matrix).hermitian) : eigenvalues(matrix)

    return values.slice(1, 1 + rank)
  }

  const limits: number[] = []
  const huskLimits: number[] = []

  let convergence = 0

  for (const q of BULK_DIRECTIONS) {
    const u = unit(q)
    const coarse = photonLimit(u.map(x => 1e-3 * x), 3, false).map(v => v / 1e-6)
    const fine = photonLimit(u.map(x => 1e-4 * x), 3, false).map(v => v / 1e-8)

    convergence = Math.max(convergence, ...fine.map((v, i) => Math.abs(v / (coarse[i] ?? 1) - 1)))
    limits.push(...fine)
  }

  for (const q of HUSK_DIRECTIONS) {
    const u = [...unit(q), 0]
    const coarse = photonLimit(u.map(x => 1e-3 * x), 2, true).map(v => v / 1e-6)
    const fine = photonLimit(u.map(x => 1e-4 * x), 2, true).map(v => v / 1e-8)

    convergence = Math.max(convergence, ...fine.map((v, i) => Math.abs(v / (coarse[i] ?? 1) - 1)))
    huskLimits.push(...fine)
  }

  const alpha = limits.reduce((a, b) => a + b, 0) / limits.length
  const spread = Math.max(...[...limits, ...huskLimits].map(v => Math.abs(v / alpha - 1)))

  const rayleigh = rayleighLinearForm(bulk, shapes)

  // at k = 0 exactly: the photon eigenvalues
  const photonAtZero = Math.max(...values0.slice(0, 4).map(Math.abs))
  const huskPhotonAtZero = Math.max(...huskValues0.slice(0, 3).map(Math.abs))

  const ok =
    gauge < ZERO &&
    huskGauge < ZERO &&
    kernel === 4 &&
    (values0[4] ?? 0) > 1 &&
    huskKernel === 3 &&
    (huskValues0[3] ?? 0) > 1 &&
    linearForms < ZERO &&
    convergence < 1e-4 &&
    spread < 1e-4 &&
    KAPPA * lambdaMax < 4

  return {
    cGaugeResidual: gauge,
    cHuskGaugeResidual: huskGauge,
    cKernelAtZero: kernel,
    cFirstMassiveAtZero: values0[4] ?? 0,
    cLargestAtZero: values0[values0.length - 1] ?? 0,
    cHuskKernelAtZero: huskKernel,
    cHuskFirstMassiveAtZero: huskValues0[3] ?? 0,
    cLinearFormResidual: linearForms,
    cPhotonEigenvalueAtZero: photonAtZero,
    cHuskPhotonEigenvalueAtZero: huskPhotonAtZero,
    cAlpha: alpha,
    cAlphaSpread: spread,
    cAlphaConvergence: convergence,
    cRayleighLinearForm: rayleigh,
    cSpeedSquared: KAPPA * alpha,
    cSpeed: Math.sqrt(KAPPA * alpha),
    cLambdaMax: lambdaMax,
    cKappaLambdaMax: KAPPA * lambdaMax,
    ok: ok ? 1 : 0,
  }
}

function sectionD(): Record<string, number> & { ok: number } {
  const out: Record<string, number> = {}
  const axis = [1, 2, 3, 4, 5, 6].map(r => [r, 0, 0])

  // D1 huskCoulomb against the torus Green's function
  const bulk = photonLatticeD4({ side: SIDE })
  const husk = makeHusk(bulk)
  const g12 = huskGreen(SIDE, [[0, 0, 0], ...axis.slice(0, 4)])

  let d1 = 0

  for (let r = 1; r <= 4; r++) {
    const charge = new Float64Array(SIDE ** 3)

    charge[0] = 1
    charge[r] = -1

    const energy = huskCoulomb(husk, charge).energy
    const green = (g12[0] ?? 0) - (g12[r] ?? 0)

    out[`dR${r}HuskCoulombEnergy`] = energy
    out[`dR${r}GreenEnergy`] = green
    d1 = Math.max(d1, Math.abs(energy / green - 1))
  }

  // D2 the bulk Coulomb field, projected, against the husk's
  const rule = makePhotonRule({ lattice: bulk, n: N, k: K, capacity: 0, hop: false, charge: 64 })
  const root = (v: number[]): number => bulk.vectors.findIndex(r => r.every((x, i) => x === v[i]))
  const up = root([1, 0, 0, 1])
  const down = root([1, 0, 0, -1])

  let d2 = 0

  for (let r = 1; r <= 4; r++) {
    const s = emptyPhotonState(rule)

    placePairAlong(rule, s, 0, Array.from({ length: r }, (_, i) => (i % 2 === 0 ? up : down)), 1)

    const projected = projectLinks(husk, coulombFlux(rule, s.vibe))
    const reference = huskCoulomb(
      husk,
      Float64Array.from(columnSum(husk, s.vibe), q => q * 64),
    ).flux
    const top = Math.max(...Array.from(reference, Math.abs))
    const gap = Math.max(...Array.from(projected, (v, i) => Math.abs(v - (reference[i] ?? 0))))

    out[`dR${r}ProjectedCoulombGap`] = gap / top
    d2 = Math.max(d2, gap / top)
  }

  // D3 the infinite lattice
  const points = [[0, 0, 0], ...axis, ...[1, 2, 3].map(r => [r, r, 0]), ...[1, 2].map(r => [r, r, r])]
  const g64 = huskGreen(64, points)
  const g128 = huskGreen(128, points)
  const green = g128.map((v, i) => 2 * v - (g64[i] ?? 0))
  const deviation = (i: number): number => 24 * Math.PI * Math.hypot(...(points[i] ?? [])) * (green[i] ?? 0) - 1

  out['dGreenAtZero'] = green[0] ?? 0
  out['dGreenAtZeroTimes24Pi'] = 24 * Math.PI * (green[0] ?? 0)
  axis.forEach((_, i) => {
    out[`dAxisR${i + 1}Deviation`] = deviation(i + 1)
    out[`dAxisR${i + 1}PairEnergy`] = (green[0] ?? 0) - (green[i + 1] ?? 0)
    out[`dAxisR${i + 1}PairEnergyContinuum`] = (green[0] ?? 0) - 1 / (24 * Math.PI * (i + 1))
  })
  ;[1, 2, 3].forEach((r, i) => (out[`dFaceR${r}Deviation`] = deviation(1 + axis.length + i)))
  ;[1, 2].forEach((r, i) => (out[`dBodyR${r}Deviation`] = deviation(1 + axis.length + 3 + i)))
  out['dTorus12AgainstInfiniteR1'] = (g12[0] ?? 0) - (g12[1] ?? 0) - ((green[0] ?? 0) - (green[1] ?? 0))
  out['dTorus12AgainstInfiniteR4'] = (g12[0] ?? 0) - (g12[4] ?? 0) - ((green[0] ?? 0) - (green[4] ?? 0))

  const a = [1, 2, 3, 4].map(i => Math.abs(deviation(i)))
  const ok = d1 < 1e-8 && d2 < 1e-7 && (a[0] ?? 0) > (a[1] ?? 0) && (a[1] ?? 0) > (a[2] ?? 0) && (a[2] ?? 0) > (a[3] ?? 0) && (a[3] ?? 1) < 0.02

  return { ...out, dHuskCoulombAgainstGreen: d1, dProjectedCoulombGap: d2, ok: ok ? 1 : 0 }
}

export default experiment({
  id: 'gauge/photon-symbol',
  code: 'E-FRC-0179',
  title:
    "light derived exactly: the leapfrog U(1) sector linearized about the cold vacuum has the symbol [[I, I], [-kappa M, I - kappa M]], read off the rule's own beats, so 4 sin^2(omega / 2) = kappa lambda(k) exactly; gauge invariance puts every linear form in the kernel of M(0) and makes the photon massless; the husk is the depth-even part of the bulk at k4 = 0, a closed system with 2 photons, and its love-fear reference is the husk lattice's own Green's function, whose r = 1 core departs from 1 / (24 pi r) as lattice structure",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const a = sectionA()
    const b = sectionB()
    const c = sectionC()
    const d = sectionD()
    const sections = [a.ok, b.ok, c.ok, d.ok]
    const strip = (r: Record<string, number>): Record<string, number> => Object.fromEntries(Object.entries(r).filter(([key]) => key !== 'ok'))

    return verdict({
      status: sections.every(x => x === 1) ? 'pass' : sections.some(x => x === 1) ? 'partial' : 'fail',
      claim:
        "the symbol read off the rule is exactly [[I, I], [-M, I - M]] at unit coupling, in integers, and its transform is the curl-curl matrix at every mode; the husk symbol P M P^T G^-1 intertwines exactly with the bulk at k4 = 0, with 1 gauge, 2 photon and 6 massive branches; the gauge direction is annihilated at every k and the kernel of M(0) is exactly the linear forms, so the photons are massless with an isotropic lambda / k^2; the E-FRC-0169 love-fear reference is exactly the husk lattice Green's function and the projection of the bulk Coulomb field, and the r = 1 core departs from the continuum as lattice structure",
      metrics: { ...strip(a), ...strip(b), ...strip(c), ...strip(d), sectionA: a.ok, sectionB: b.ok, sectionC: c.ok, sectionD: d.ok },
      notes:
        'L2, exact where the rule is integer, machine precision elsewhere. The symbol is read at unit coupling because an integer table can only be linear with an integer slope; the rule enters the force only through the table, so the symbol at any kappa is the same matrices with M scaled by kappa. About the cold vacuum the E-FRC-0164 table (N = 8192, K = 80) is not linear: round(K sin(2 pi B / N)) is zero for |B| up to 8, so a field whose every plaquette stays in that dead zone feels no force and does not oscillate. The symbol is the rule\'s linear response where the staircase averages to kappa B, 1 / kappa << |B| << N / (2 pi).',
    })
  },
})
