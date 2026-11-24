// Exact T = 0 quantum Kogut-Susskind and discrete-time Floquet Z_3-center gauge theory
// on a 2D plaquette ladder (E-FRC-0322).
//
// Why the classical demon rule froze at T = 0 (E-FRC-0110 / E-FRC-0254):
//   At zero demon energy every plaquette sits in the magnetic minimum U_p = 1 with no
//   quantum electric tunneling (g^2 = 0 limit), so links never fluctuate and no confining
//   string forms in the cold vacuum.
//
// Quantum Z_3 center inside Sigma(648):
//   The center of Sigma(648) is Z_3 = {I, omega I, omega^2 I}, living strictly inside
//   Z[omega][1/6] subset Q(zeta_9). Each link carries a qutrit with electric shift E_l
//   and magnetic clock U_l satisfying E_l U_l = omega U_l E_l inside Delta(27) subset Sigma(648).
//
// Exact gauge-invariant Hilbert space on an open L_x-plaquette ladder:
//   Vertices V = 2 (L_x + 1), links E = 3 L_x + 1, plaquettes P = L_x.
//   Gauss law at each vertex s is (div e)_s = q_s (mod 3). Because sum_s (div e)_s = 0 (mod 3),
//   a physical sector exists iff sum_s q_s = 0 (mod 3), with exact cycle rank
//   b_1 = E - (V - 1) = L_x and Hilbert dimension 3^(L_x) (729 at L_x = 6).
//   Every physical state is uniquely labeled by loop-flux numbers phi in Z_3^(L_x):
//     e(phi) = e^(q) + curl^T phi (mod 3).
//
// Hamiltonian:
//   H = g^2 sum_l (1 - Re(E_l)) - (1 / g^2) sum_p Re(U_p)
//
// Discrete-time Floquet unitary:
//   U_dt = exp(-i dt H_E) exp(-i dt H_B)
//   At g^2 = 1 and dt = 4 pi / 9, every entry of both factors lies strictly in Z[zeta_9][1/6].
//
// DETERMINISM: zero random numbers.

import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import { lanczosLowest } from '@/code/algebra/linear/lanczos-lowest'
import { newCx, type Cx } from '@/code/algebra/linear/complex-vector'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import { generateGroup } from '@/code/dynamics/finite-gauge'
import {
  add,
  dagger,
  identityMatrix,
  isUnitary,
  matMul,
  MINUS_I_OVER_ROOT3,
  mul,
  OMEGA,
  ONE,
  sameMatrix,
  scale,
  scaleMatrix,
  sub,
  toComplex,
  trace,
  ZERO,
  zetaPower,
  type Ninth,
  type NinthMatrix,
} from '@/code/algebra/ninth-field'

export type LinkDef = {
  readonly id: number
  readonly from: number
  readonly to: number
}

export type PlaquetteDef = {
  readonly id: number
  // signed link incidences around the counter-clockwise loop: +1 along link, -1 opposite
  readonly links: readonly { readonly id: number; readonly sign: 1 | -1 }[]
}

export type LadderGeometry = {
  readonly lx: number
  readonly vertexCount: number
  readonly linkCount: number
  readonly plaquetteCount: number
  readonly hilbertDim: number
  readonly links: readonly LinkDef[]
  readonly plaquettes: readonly PlaquetteDef[]
  readonly siteIndex: (x: number, y: 0 | 1) => number
}

export type ChargeSite = {
  readonly x: number
  readonly y: 0 | 1
  readonly q: number
}

export type Sigma648CenterAudit = {
  readonly groupOrder: number
  readonly centerOrder: number
  readonly exactCenterCommutesWithAllGenerators: boolean
  readonly exactCenterInZOmegaOneSixth: boolean
  readonly exactWeylAlgebraHolds: boolean
  readonly centerTracesRe: readonly number[]
  readonly centerTracesIm: readonly number[]
}

export type GaussSector = {
  readonly charges: Int8Array
  readonly totalChargeMod3: number
  readonly solvable: boolean
  readonly hilbertDim: number
  readonly backgroundFlux: Int8Array | null
  readonly gaussViolationsAcrossBasis: number
  readonly divCurlZeroMod3: boolean
}

export type GroundStateResult = {
  readonly energy: number
  readonly spectralGap: number
  readonly meanActiveLinks: number
  readonly meanPlaquetteRe: number
  readonly groundVectorRe: Float64Array
}

export type LinearPotentialFit = {
  readonly gSquared: number
  readonly vacuumEnergy: number
  readonly distances: readonly number[]
  readonly potentials: readonly number[]
  readonly sigma: number
  readonly intercept: number
  readonly rSquared: number
  readonly maxLinearResidual: number
  readonly bareStrongSigma: number
  readonly vacuumMeanPlaquetteRe: number
}

export type TrialityAudit = {
  readonly gSquared: number
  readonly baryonSolvable: boolean
  readonly baryonHilbertDim: number
  readonly baryonEnergy: number
  readonly baryonGaussViolations: number
  readonly diquarkSolvable: boolean
  readonly diquarkHilbertDim: number
  readonly diquarkTotalChargeMod3: number
  readonly adjointPotentials: readonly number[]
  readonly adjointSigma: number
  readonly adjointMaxAbsPotential: number
}

export type FloquetAudit = {
  readonly gSquared: number
  readonly dt: number
  readonly exactPlaquetteGateUnitary: boolean
  readonly exactPlaquetteGateInZZeta9OneSixth: boolean
  readonly exactElectricPhasesInZZeta9OneSixth: boolean
  readonly fullUnitarityError: number
  readonly gaussCommutatorMaxError: number
  readonly quantumTunnelingSurvival: number
  readonly quantumPlaquetteShift: number
  readonly frozenControlSurvival: number
  readonly frozenControlPlaquetteShift: number
  readonly frozenControlSigma: number
}

const OMEGA2: Ninth = zetaPower(6)
const EPSILON: Ninth = zetaPower(2)

export function mod3(x: number): 0 | 1 | 2 {
  const r = ((x % 3) + 3) % 3

  return r as 0 | 1 | 2
}

function isSixSmooth(d: bigint): boolean {
  let x = d < 0n ? -d : d

  if (x === 0n) {
    return false
  }

  while (x % 2n === 0n) {
    x /= 2n
  }

  while (x % 3n === 0n) {
    x /= 3n
  }

  return x === 1n
}

export function isInZOmegaOneSixth(a: Ninth): boolean {
  return (
    isSixSmooth(a.d) &&
    a.n[1] === 0n &&
    a.n[2] === 0n &&
    a.n[4] === 0n &&
    a.n[5] === 0n
  )
}

export function isInZZeta9OneSixth(a: Ninth): boolean {
  return isSixSmooth(a.d)
}

// ---------------------------------------------------------------------------------------------------------
// 1. Exact verification of the Z_3 center of Sigma(648) inside Z[omega][1/6] subset Q(zeta_9)

export function auditSigma648Center(): Sigma648CenterAudit {
  const clock: NinthMatrix = [
    [ONE, ZERO, ZERO],
    [ZERO, OMEGA, ZERO],
    [ZERO, ZERO, OMEGA2],
  ]
  const shift: NinthMatrix = [
    [ZERO, ONE, ZERO],
    [ZERO, ZERO, ONE],
    [ONE, ZERO, ZERO],
  ]
  const fourier: NinthMatrix = [0, 1, 2].map(j =>
    [0, 1, 2].map(k => mul(MINUS_I_OVER_ROOT3, zetaPower(3 * j * k))),
  )
  const ninthGen: NinthMatrix = [
    [EPSILON, ZERO, ZERO],
    [ZERO, EPSILON, ZERO],
    [ZERO, ZERO, mul(EPSILON, OMEGA)],
  ]
  const generators = [clock, shift, fourier, ninthGen]

  const id3 = identityMatrix(3)
  const centerMatrices = [id3, scaleMatrix(id3, OMEGA), scaleMatrix(id3, OMEGA2)]

  let exactCenterCommutesWithAllGenerators = true
  let exactCenterInZOmegaOneSixth = true

  for (const z of centerMatrices) {
    for (const row of z) {
      for (const entry of row) {
        if (!isInZOmegaOneSixth(entry)) {
          exactCenterInZOmegaOneSixth = false
        }
      }
    }

    for (const gen of generators) {
      if (!sameMatrix(matMul(z, gen), matMul(gen, z))) {
        exactCenterCommutesWithAllGenerators = false
      }
    }
  }

  // Exact qutrit Weyl-Heisenberg algebra for E = CLOCK and U = SHIFT^dagger:
  // E^3 = I, U^3 = I, E U = omega U E
  const electricOp = clock
  const linkOp = dagger(shift)
  const eCubed = matMul(matMul(electricOp, electricOp), electricOp)
  const uCubed = matMul(matMul(linkOp, linkOp), linkOp)
  const lhs = matMul(electricOp, linkOp)
  const rhs = scaleMatrix(matMul(linkOp, electricOp), OMEGA)
  const exactWeylAlgebraHolds =
    sameMatrix(eCubed, id3) &&
    sameMatrix(uCubed, id3) &&
    sameMatrix(lhs, rhs) &&
    isUnitary(electricOp) &&
    isUnitary(linkOp)

  // Verify full finite group closure and center size using SU3_SUBGROUPS.sigma648
  const group = generateGroup({
    generators: [...SU3_SUBGROUPS.sigma648.generators],
  })
  const { order, product } = group
  let centerOrder = 0

  for (let g = 0; g < order; g++) {
    let central = true

    for (let h = 0; h < order && central; h++) {
      central = product[g * order + h] === product[h * order + g]
    }

    if (central) {
      centerOrder++
    }
  }

  const centerTraces = centerMatrices.map(m => toComplex(trace(m)))

  return {
    groupOrder: order,
    centerOrder,
    exactCenterCommutesWithAllGenerators,
    exactCenterInZOmegaOneSixth,
    exactWeylAlgebraHolds,
    centerTracesRe: centerTraces.map(t => t[0]),
    centerTracesIm: centerTraces.map(t => t[1]),
  }
}

// ---------------------------------------------------------------------------------------------------------
// 2. Open 2D plaquette ladder geometry (L_x plaquettes)

export function buildPlaquetteLadder(lx = 6): LadderGeometry {
  const siteIndex = (x: number, y: 0 | 1): number => 2 * x + y
  const vertexCount = 2 * (lx + 1)
  const links: LinkDef[] = []

  // Bottom horizontal links: 0 .. lx - 1
  for (let p = 0; p < lx; p++) {
    links.push({ id: links.length, from: siteIndex(p, 0), to: siteIndex(p + 1, 0) })
  }

  // Top horizontal links: lx .. 2 lx - 1
  for (let p = 0; p < lx; p++) {
    links.push({ id: links.length, from: siteIndex(p, 1), to: siteIndex(p + 1, 1) })
  }

  // Vertical rungs: 2 lx .. 3 lx
  for (let x = 0; x <= lx; x++) {
    links.push({ id: links.length, from: siteIndex(x, 0), to: siteIndex(x, 1) })
  }

  const plaquettes: PlaquetteDef[] = []

  for (let p = 0; p < lx; p++) {
    const bottom = p
    const top = lx + p
    const leftRung = 2 * lx + p
    const rightRung = 2 * lx + p + 1

    plaquettes.push({
      id: p,
      links: [
        { id: bottom, sign: 1 },
        { id: rightRung, sign: 1 },
        { id: top, sign: -1 },
        { id: leftRung, sign: -1 },
      ],
    })
  }

  return {
    lx,
    vertexCount,
    linkCount: links.length,
    plaquetteCount: plaquettes.length,
    hilbertDim: 3 ** lx,
    links,
    plaquettes,
    siteIndex,
  }
}

export function linkDivergence(ladder: LadderGeometry, flux: Int8Array): Int8Array {
  const div = new Int8Array(ladder.vertexCount)

  for (const link of ladder.links) {
    const e = flux[link.id]!

    div[link.from] = mod3(div[link.from]! + e)
    div[link.to] = mod3(div[link.to]! - e)
  }

  return div
}

export function verifyDivCurlZero(ladder: LadderGeometry): boolean {
  for (const plaq of ladder.plaquettes) {
    const flux = new Int8Array(ladder.linkCount)

    for (const edge of plaq.links) {
      flux[edge.id] = mod3(flux[edge.id]! + edge.sign)
    }

    const div = linkDivergence(ladder, flux)

    for (let s = 0; s < ladder.vertexCount; s++) {
      if (div[s] !== 0) {
        return false
      }
    }
  }

  return true
}

export function fluxForBasisState(
  ladder: LadderGeometry,
  backgroundFlux: Int8Array,
  stateIndex: number,
  out?: Int8Array,
): Int8Array {
  const flux = out ?? new Int8Array(ladder.linkCount)

  for (let l = 0; l < ladder.linkCount; l++) {
    flux[l] = backgroundFlux[l]!
  }

  let rem = stateIndex

  for (let p = 0; p < ladder.plaquetteCount; p++) {
    const phi = rem % 3

    rem = (rem - phi) / 3

    if (phi !== 0) {
      const plaq = ladder.plaquettes[p]!

      for (const edge of plaq.links) {
        flux[edge.id] = mod3(flux[edge.id]! + edge.sign * phi)
      }
    }
  }

  return flux
}

// Deterministic spanning-tree solver for (div e)_s = q_s (mod 3).
// Returns solvable = false with hilbertDim = 0 iff total charge mod 3 != 0.
export function buildGaussSector(
  ladder: LadderGeometry,
  chargeSites: readonly ChargeSite[],
): GaussSector {
  const charges = new Int8Array(ladder.vertexCount)

  for (const item of chargeSites) {
    const idx = ladder.siteIndex(item.x, item.y)

    charges[idx] = mod3(charges[idx]! + item.q)
  }

  let total = 0

  for (let s = 0; s < ladder.vertexCount; s++) {
    total += charges[s]!
  }

  const totalChargeMod3 = mod3(total)
  const divCurlZeroMod3 = verifyDivCurlZero(ladder)

  if (totalChargeMod3 !== 0) {
    return {
      charges,
      totalChargeMod3,
      solvable: false,
      hilbertDim: 0,
      backgroundFlux: null,
      gaussViolationsAcrossBasis: 0,
      divCurlZeroMod3,
    }
  }

  // Deterministic BFS spanning tree rooted at vertex 0
  const adjacency: { neighbor: number; linkId: number; outSign: 1 | -1 }[][] = Array.from(
    { length: ladder.vertexCount },
    () => [],
  )

  for (const link of ladder.links) {
    adjacency[link.from]!.push({ neighbor: link.to, linkId: link.id, outSign: 1 })
    adjacency[link.to]!.push({ neighbor: link.from, linkId: link.id, outSign: -1 })
  }

  const visited = new Uint8Array(ladder.vertexCount)
  const parentLink = new Int32Array(ladder.vertexCount).fill(-1)
  const parentOutSign = new Int8Array(ladder.vertexCount)
  const order: number[] = [0]

  visited[0] = 1

  for (let head = 0; head < order.length; head++) {
    const u = order[head]!

    for (const adj of adjacency[u]!) {
      if (!visited[adj.neighbor]) {
        visited[adj.neighbor] = 1
        parentLink[adj.neighbor] = adj.linkId
        // outSign from neighbor u toward parent is -adj.outSign
        parentOutSign[adj.neighbor] = (adj.outSign === 1 ? -1 : 1) as 1 | -1
        order.push(adj.neighbor)
      }
    }
  }

  const backgroundFlux = new Int8Array(ladder.linkCount)
  const residualDiv = new Int8Array(ladder.vertexCount)

  // Solve from leaves up to root
  for (let i = order.length - 1; i >= 1; i--) {
    const u = order[i]!
    const linkId = parentLink[u]!
    const link = ladder.links[linkId]!
    const need = mod3(charges[u]! - residualDiv[u]!)
    // contribution of setting e(linkId) = e to div[u] is parentOutSign[u] * e
    const e = parentOutSign[u] === 1 ? need : mod3(-need)

    backgroundFlux[linkId] = e
    residualDiv[link.from] = mod3(residualDiv[link.from]! + e)
    residualDiv[link.to] = mod3(residualDiv[link.to]! - e)
  }

  // Exhaustively verify Gauss law at all V vertices across all 3^(L_x) basis states
  let gaussViolationsAcrossBasis = 0
  const scratch = new Int8Array(ladder.linkCount)

  for (let state = 0; state < ladder.hilbertDim; state++) {
    fluxForBasisState(ladder, backgroundFlux, state, scratch)

    const div = linkDivergence(ladder, scratch)

    for (let s = 0; s < ladder.vertexCount; s++) {
      if (div[s] !== charges[s]) {
        gaussViolationsAcrossBasis++
      }
    }
  }

  return {
    charges,
    totalChargeMod3,
    solvable: true,
    hilbertDim: ladder.hilbertDim,
    backgroundFlux,
    gaussViolationsAcrossBasis,
    divCurlZeroMod3,
  }
}

// ---------------------------------------------------------------------------------------------------------
// 3. Exact Kogut-Susskind Hamiltonian diagonalization via hermitianEigenRows

export function activeLinkCounts(
  ladder: LadderGeometry,
  backgroundFlux: Int8Array,
): Uint8Array {
  const counts = new Uint8Array(ladder.hilbertDim)
  const scratch = new Int8Array(ladder.linkCount)

  for (let state = 0; state < ladder.hilbertDim; state++) {
    fluxForBasisState(ladder, backgroundFlux, state, scratch)

    let active = 0

    for (let l = 0; l < ladder.linkCount; l++) {
      if (scratch[l] !== 0) {
        active++
      }
    }

    counts[state] = active
  }

  return counts
}

export function buildKogutSusskindMatrix(
  ladder: LadderGeometry,
  backgroundFlux: Int8Array,
  gSquared: number,
  electricScale = gSquared,
  magneticCoupling = gSquared > 0 ? 1 / gSquared : 1,
): { re: Float64Array; im: Float64Array; activeCounts: Uint8Array } {
  const dim = ladder.hilbertDim
  const re = new Float64Array(dim * dim)
  const im = new Float64Array(dim * dim)
  const activeCounts = activeLinkCounts(ladder, backgroundFlux)

  // Electric diagonal: g^2 sum_l (1 - Re(E_l)) = (3/2) g^2 * activeLinkCount
  const electricPerLink = 1.5 * electricScale

  for (let state = 0; state < dim; state++) {
    re[state * dim + state] = electricPerLink * activeCounts[state]!
  }

  // Magnetic off-diagonal: -(1 / g^2) sum_p Re(U_p) = -(1 / (2 g^2)) sum_p (U_p + U_p^dag)
  const hop = -0.5 * magneticCoupling
  const pow3 = Array.from({ length: ladder.plaquetteCount }, (_, p) => 3 ** p)

  for (let state = 0; state < dim; state++) {
    let rem = state

    for (let p = 0; p < ladder.plaquetteCount; p++) {
      const digit = rem % 3

      rem = (rem - digit) / 3

      const stride = pow3[p]!
      const plusDigit = (digit + 1) % 3
      const minusDigit = (digit + 2) % 3
      const plusState = state + (plusDigit - digit) * stride
      const minusState = state + (minusDigit - digit) * stride

      re[plusState * dim + state] = (re[plusState * dim + state] ?? 0) + hop
      re[minusState * dim + state] = (re[minusState * dim + state] ?? 0) + hop
    }
  }

  return { re, im, activeCounts }
}

export function solveGroundStateExactDense(
  ladder: LadderGeometry,
  sector: GaussSector,
  gSquared: number,
  electricScale = gSquared,
  magneticCoupling = gSquared > 0 ? 1 / gSquared : 1,
): GroundStateResult {
  if (!sector.solvable || !sector.backgroundFlux) {
    throw new Error('cannot diagonalize an unsolvable Gauss-law sector')
  }

  const dim = ladder.hilbertDim
  const { re, im, activeCounts } = buildKogutSusskindMatrix(
    ladder,
    sector.backgroundFlux,
    gSquared,
    electricScale,
    magneticCoupling,
  )
  const eig = hermitianEigenRows(dim, re, im, 10)
  const energy = eig.values[0]!
  const spectralGap = eig.values[1]! - energy
  const psiRe = eig.vectorsRe.subarray(0, dim)
  const psiIm = eig.vectorsIm.subarray(0, dim)

  // Compute exact <N_flux> and <Re(U_p)> per plaquette in the cold T = 0 ground state
  let meanActiveLinks = 0

  for (let state = 0; state < dim; state++) {
    const prob = psiRe[state]! * psiRe[state]! + psiIm[state]! * psiIm[state]!

    meanActiveLinks += prob * activeCounts[state]!
  }

  let plaquetteSum = 0
  const pow3 = Array.from({ length: ladder.plaquetteCount }, (_, p) => 3 ** p)

  for (let state = 0; state < dim; state++) {
    const ar = psiRe[state]!
    const ai = psiIm[state]!
    let rem = state

    for (let p = 0; p < ladder.plaquetteCount; p++) {
      const digit = rem % 3

      rem = (rem - digit) / 3

      const stride = pow3[p]!
      const plusState = state + (((digit + 1) % 3) - digit) * stride
      const minusState = state + (((digit + 2) % 3) - digit) * stride

      plaquetteSum +=
        0.5 *
        (ar * psiRe[plusState]! +
          ai * psiIm[plusState]! +
          ar * psiRe[minusState]! +
          ai * psiIm[minusState]!)
    }
  }

  return {
    energy,
    spectralGap,
    meanActiveLinks,
    meanPlaquetteRe: plaquetteSum / ladder.plaquetteCount,
    groundVectorRe: Float64Array.from(psiRe),
  }
}

export function solveGroundState(
  ladder: LadderGeometry,
  sector: GaussSector,
  gSquared: number,
  electricScale = gSquared,
  magneticCoupling = gSquared > 0 ? 1 / gSquared : 1,
): GroundStateResult {
  if (!sector.solvable || !sector.backgroundFlux) {
    throw new Error('cannot diagonalize an unsolvable Gauss-law sector')
  }

  const dim = ladder.hilbertDim
  const activeCounts = activeLinkCounts(ladder, sector.backgroundFlux)
  const electricPerLink = 1.5 * electricScale
  const hop = -0.5 * magneticCoupling
  const pow3 = Array.from({ length: ladder.plaquetteCount }, (_, p) => 3 ** p)

  const apply = (x: Cx, out: Cx): void => {
    const xr = x.re
    const xi = x.im
    const or = out.re
    const oi = out.im

    for (let state = 0; state < dim; state++) {
      const diag = electricPerLink * activeCounts[state]!
      let sr = diag * xr[state]!
      let si = diag * xi[state]!
      let rem = state

      for (let p = 0; p < ladder.plaquetteCount; p++) {
        const digit = rem % 3

        rem = (rem - digit) / 3

        const stride = pow3[p]!
        const plusState = state + (((digit + 1) % 3) - digit) * stride
        const minusState = state + (((digit + 2) % 3) - digit) * stride

        sr += hop * (xr[plusState]! + xr[minusState]!)
        si += hop * (xi[plusState]! + xi[minusState]!)
      }

      or[state] = sr
      oi[state] = si
    }
  }

  const start = newCx(dim)

  start.re.fill(1)

  const res = lanczosLowest({
    dimension: dim,
    apply,
    start,
    tolerance: 1e-14,
    maxSteps: 160,
    check: 5,
    vector: true,
  })

  const psiRe = res.vector!.re
  const psiIm = res.vector!.im
  let meanActiveLinks = 0

  for (let state = 0; state < dim; state++) {
    const prob = psiRe[state]! * psiRe[state]! + psiIm[state]! * psiIm[state]!

    meanActiveLinks += prob * activeCounts[state]!
  }

  return {
    energy: res.value,
    spectralGap: 0,
    meanActiveLinks,
    meanPlaquetteRe: meanPlaquetteReOfState(ladder.lx, psiRe, psiIm),
    groundVectorRe: Float64Array.from(psiRe),
  }
}

export function verifyDenseVsLanczos(
  ladder: LadderGeometry,
  gSquared: number,
): {
  vacuumDenseEnergy: number
  pairR3DenseEnergy: number
  maxAbsError: number
} {
  const vacSector = buildGaussSector(ladder, [])
  const pairSector = buildGaussSector(ladder, [
    { x: 0, y: 0, q: 1 },
    { x: 3, y: 0, q: 2 },
  ])
  const vacDense = solveGroundStateExactDense(ladder, vacSector, gSquared)
  const vacFast = solveGroundState(ladder, vacSector, gSquared)
  const pairDense = solveGroundStateExactDense(ladder, pairSector, gSquared)
  const pairFast = solveGroundState(ladder, pairSector, gSquared)
  const maxAbsError = Math.max(
    Math.abs(vacDense.energy - vacFast.energy),
    Math.abs(pairDense.energy - pairFast.energy),
  )

  return {
    vacuumDenseEnergy: vacDense.energy,
    pairR3DenseEnergy: pairDense.energy,
    maxAbsError,
  }
}

export function fitLinearPotential(
  distances: readonly number[],
  potentials: readonly number[],
): {
  sigma: number
  intercept: number
  rSquared: number
  maxLinearResidual: number
} {
  const n = distances.length
  let meanR = 0
  let meanV = 0

  for (let i = 0; i < n; i++) {
    meanR += distances[i]!
    meanV += potentials[i]!
  }

  meanR /= n
  meanV /= n

  let srr = 0
  let srv = 0

  for (let i = 0; i < n; i++) {
    const dr = distances[i]! - meanR
    const dv = potentials[i]! - meanV

    srr += dr * dr
    srv += dr * dv
  }

  const sigma = srr > 0 ? srv / srr : 0
  const intercept = meanV - sigma * meanR
  let ssRes = 0
  let ssTot = 0
  let maxLinearResidual = 0

  for (let i = 0; i < n; i++) {
    const predicted = sigma * distances[i]! + intercept
    const res = Math.abs(potentials[i]! - predicted)
    const dv = potentials[i]! - meanV

    ssRes += res * res
    ssTot += dv * dv

    if (res > maxLinearResidual) {
      maxLinearResidual = res
    }
  }

  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 1

  return { sigma, intercept, rSquared, maxLinearResidual }
}

export function measureStaticPotentialCurve(
  ladder: LadderGeometry,
  gSquared: number,
  distances: readonly number[] = [1, 2, 3, 4, 5],
): LinearPotentialFit {
  const vacuumSector = buildGaussSector(ladder, [])
  const vacuum = solveGroundState(ladder, vacuumSector, gSquared)
  const potentials: number[] = []

  for (const r of distances) {
    const pairSector = buildGaussSector(ladder, [
      { x: 0, y: 0, q: 1 },
      { x: r, y: 0, q: 2 },
    ])
    const ground = solveGroundState(ladder, pairSector, gSquared)

    potentials.push(ground.energy - vacuum.energy)
  }

  const fit = fitLinearPotential(distances, potentials)

  return {
    gSquared,
    vacuumEnergy: vacuum.energy,
    distances,
    potentials,
    sigma: fit.sigma,
    intercept: fit.intercept,
    rSquared: fit.rSquared,
    maxLinearResidual: fit.maxLinearResidual,
    bareStrongSigma: 1.5 * gSquared,
    vacuumMeanPlaquetteRe: vacuum.meanPlaquetteRe,
  }
}

// ---------------------------------------------------------------------------------------------------------
// 4. Triality audit: baryon (+1, +1, +1), unpaired diquark (+1, +1), adjoint (q = 0 mod 3)

export function auditTriality(
  ladder: LadderGeometry,
  gSquared: number,
  distances: readonly number[] = [1, 2, 3, 4, 5],
): TrialityAudit {
  const vacuumSector = buildGaussSector(ladder, [])
  const vacuum = solveGroundState(ladder, vacuumSector, gSquared)

  // Color-neutral baryon Y-string: three q = +1 charges at (1, 0), (3, 1), (5, 0)
  const baryonSector = buildGaussSector(ladder, [
    { x: 1, y: 0, q: 1 },
    { x: 3, y: 1, q: 1 },
    { x: 5, y: 0, q: 1 },
  ])
  const baryonGround = solveGroundState(ladder, baryonSector, gSquared)

  // Unpaired diquark: two like charges (+1, +1) with no third partner -> total charge = 2 mod 3
  const diquarkSector = buildGaussSector(ladder, [
    { x: 1, y: 0, q: 1 },
    { x: 4, y: 0, q: 1 },
  ])

  // Adjoint (Z_3-neutral, q = +3 = 0 mod 3 and q = -3 = 0 mod 3) control across R = 1..5
  const adjointPotentials: number[] = []
  let adjointMaxAbsPotential = 0

  for (const r of distances) {
    const adjSector = buildGaussSector(ladder, [
      { x: 0, y: 0, q: 3 },
      { x: r, y: 0, q: -3 },
    ])
    const adjGround = solveGroundState(ladder, adjSector, gSquared)
    const v = adjGround.energy - vacuum.energy

    adjointPotentials.push(v)

    if (Math.abs(v) > adjointMaxAbsPotential) {
      adjointMaxAbsPotential = Math.abs(v)
    }
  }

  const adjFit = fitLinearPotential(distances, adjointPotentials)

  return {
    gSquared,
    baryonSolvable: baryonSector.solvable,
    baryonHilbertDim: baryonSector.hilbertDim,
    baryonEnergy: baryonGround.energy - vacuum.energy,
    baryonGaussViolations: baryonSector.gaussViolationsAcrossBasis,
    diquarkSolvable: diquarkSector.solvable,
    diquarkHilbertDim: diquarkSector.hilbertDim,
    diquarkTotalChargeMod3: diquarkSector.totalChargeMod3,
    adjointPotentials,
    adjointSigma: adjFit.sigma,
    adjointMaxAbsPotential,
  }
}

// ---------------------------------------------------------------------------------------------------------
// 5. Discrete-time Floquet unitary U_dt = exp(-i dt H_E) exp(-i dt H_B) in Z[zeta_9][1/6]

// Exact 3 x 3 single-plaquette magnetic step u_B = exp(i (4 pi k_B / 9) Re(U_p))
// = zeta_9^(-k_B) (I + (omega^(k_B) - 1) (I + U_p + U_p^dag) / 3)
export function exactSinglePlaquetteGate(kB = 1): NinthMatrix {
  const globalPhase = zetaPower(-kB)
  const omegaK = zetaPower(3 * kB)
  const diagCoeff = mul(globalPhase, scale(add(scale(ONE, 2), omegaK), 1, 3))
  const offCoeff = mul(globalPhase, scale(sub(omegaK, ONE), 1, 3))

  return [
    [diagCoeff, offCoeff, offCoeff],
    [offCoeff, diagCoeff, offCoeff],
    [offCoeff, offCoeff, diagCoeff],
  ]
}

function applyPlaquetteTensorProduct(
  lx: number,
  alpha: readonly [number, number],
  beta: readonly [number, number],
  inRe: Float64Array,
  inIm: Float64Array,
): { re: Float64Array; im: Float64Array } {
  const dim = inRe.length
  let curRe = Float64Array.from(inRe)
  let curIm = Float64Array.from(inIm)
  let nextRe = new Float64Array(dim)
  let nextIm = new Float64Array(dim)

  const ar = alpha[0]
  const ai = alpha[1]
  const br = beta[0]
  const bi = beta[1]

  for (let p = 0; p < lx; p++) {
    const stride = 3 ** p
    const block = 3 * stride

    for (let base = 0; base < dim; base += block) {
      for (let off = 0; off < stride; off++) {
        const i0 = base + off
        const i1 = i0 + stride
        const i2 = i1 + stride
        const r0 = curRe[i0]!
        const m0 = curIm[i0]!
        const r1 = curRe[i1]!
        const m1 = curIm[i1]!
        const r2 = curRe[i2]!
        const m2 = curIm[i2]!

        const s12r = r1 + r2
        const s12i = m1 + m2
        const s02r = r0 + r2
        const s02i = m0 + m2
        const s01r = r0 + r1
        const s01i = m0 + m1

        nextRe[i0] = ar * r0 - ai * m0 + br * s12r - bi * s12i
        nextIm[i0] = ar * m0 + ai * r0 + br * s12i + bi * s12r

        nextRe[i1] = ar * r1 - ai * m1 + br * s02r - bi * s02i
        nextIm[i1] = ar * m1 + ai * r1 + br * s02i + bi * s02r

        nextRe[i2] = ar * r2 - ai * m2 + br * s01r - bi * s01i
        nextIm[i2] = ar * m2 + ai * r2 + br * s01i + bi * s01r
      }
    }

    const tmpR = curRe
    const tmpI = curIm

    curRe = nextRe
    curIm = nextIm
    nextRe = tmpR
    nextIm = tmpI
  }

  return { re: curRe, im: curIm }
}

function meanPlaquetteReOfState(
  lx: number,
  psiRe: Float64Array,
  psiIm: Float64Array,
): number {
  const dim = psiRe.length
  const pow3 = Array.from({ length: lx }, (_, p) => 3 ** p)
  let total = 0

  for (let state = 0; state < dim; state++) {
    const ar = psiRe[state]!
    const ai = psiIm[state]!
    let rem = state

    for (let p = 0; p < lx; p++) {
      const digit = rem % 3

      rem = (rem - digit) / 3

      const stride = pow3[p]!
      const plusState = state + (((digit + 1) % 3) - digit) * stride
      const minusState = state + (((digit + 2) % 3) - digit) * stride

      total +=
        0.5 *
        (ar * psiRe[plusState]! +
          ai * psiIm[plusState]! +
          ar * psiRe[minusState]! +
          ai * psiIm[minusState]!)
    }
  }

  return total / lx
}

// High-precision float64 projection for elements of Q(omega) subset Q(zeta_9)
// (avoids 2-ulp drift in Math.cos(2 pi / 3) while matching toComplex to < 1e-15).
const HALF_ROOT3 = Math.sqrt(3) / 2

function toComplexExact(a: Ninth): [number, number] {
  if (isInZOmegaOneSixth(a)) {
    const c0 = Number(a.n[0]!)
    const c3 = Number(a.n[3]!)
    const d = Number(a.d)

    return [(c0 - 0.5 * c3) / d, (HALF_ROOT3 * c3) / d]
  }

  return toComplex(a)
}

// Verify discrete-time unitary Floquet evolution at g^2 = 1, dt = 4 pi / 9 (k_E = 3, k_B = 1)
// where BOTH exp(-i dt H_E) and exp(-i dt H_B) live strictly in Z[zeta_9][1/6],
// and compare against the frozen classical g^2 = 0 control (H_E = 0).
export function auditFloquetUnitary(ladder: LadderGeometry): FloquetAudit {
  const gSquared = 1.0
  const kB = 1
  const kE = 3
  const dt = (4 * Math.PI) / 9

  const uBExact = exactSinglePlaquetteGate(kB)
  const exactPlaquetteGateUnitary = isUnitary(uBExact)
  let exactPlaquetteGateInZZeta9OneSixth = true

  for (const row of uBExact) {
    for (const entry of row) {
      if (!isInZZeta9OneSixth(entry)) {
        exactPlaquetteGateInZZeta9OneSixth = false
      }
    }
  }

  const alpha = toComplex(uBExact[0]![0]!)
  const beta = toComplex(uBExact[0]![1]!)

  // Work in a nontrivial charge sector (quark-antiquark at R = 3) to prove Gauss conservation
  const sector = buildGaussSector(ladder, [
    { x: 0, y: 0, q: 1 },
    { x: 3, y: 0, q: 2 },
  ])
  const bg = sector.backgroundFlux!
  const activeCounts = activeLinkCounts(ladder, bg)
  const dim = ladder.hilbertDim

  // Check exact electric phase membership in Z[zeta_9][1/6]
  let exactElectricPhasesInZZeta9OneSixth = true
  const electricPhaseRe = new Float64Array(dim)
  const electricPhaseIm = new Float64Array(dim)

  for (let state = 0; state < dim; state++) {
    const exactPhase = zetaPower(-kE * activeCounts[state]!)

    if (!isInZZeta9OneSixth(exactPhase)) {
      exactElectricPhasesInZZeta9OneSixth = false
    }

    const [pr, pi] = toComplexExact(exactPhase)

    electricPhaseRe[state] = pr
    electricPhaseIm[state] = pi
  }

  // Build exact Z[zeta_9][1/6] tensor-product amplitudes alpha^(lx - d) * beta^d
  // for Hamming distance d = 0 .. lx in ninth-field exact arithmetic before single float64 projection
  const alphaExact = uBExact[0]![0]!
  const betaExact = uBExact[0]![1]!
  const tensorEntryRe = new Float64Array(ladder.lx + 1)
  const tensorEntryIm = new Float64Array(ladder.lx + 1)

  for (let d = 0; d <= ladder.lx; d++) {
    let entry: Ninth = ONE

    for (let i = 0; i < ladder.lx - d; i++) {
      entry = mul(entry, alphaExact)
    }

    for (let i = 0; i < d; i++) {
      entry = mul(entry, betaExact)
    }

    if (!isInZZeta9OneSixth(entry)) {
      exactPlaquetteGateInZZeta9OneSixth = false
    }

    const [er, ei] = toComplexExact(entry)

    tensorEntryRe[d] = er
    tensorEntryIm[d] = ei
  }

  // Precompute base-3 digits of all 729 states
  const digits = new Uint8Array(dim * ladder.lx)

  for (let state = 0; state < dim; state++) {
    let rem = state

    for (let p = 0; p < ladder.lx; p++) {
      const digit = rem % 3

      digits[state * ladder.lx + p] = digit
      rem = (rem - digit) / 3
    }
  }

  // Build full 729 x 729 Floquet matrix U_dt = U_E U_B directly from exact entries
  const uRe = new Float64Array(dim * dim)
  const uIm = new Float64Array(dim * dim)

  for (let row = 0; row < dim; row++) {
    const pr = electricPhaseRe[row]!
    const pi = electricPhaseIm[row]!
    const rowOff = row * ladder.lx

    for (let col = 0; col < dim; col++) {
      const colOff = col * ladder.lx
      let dist = 0

      for (let p = 0; p < ladder.lx; p++) {
        if (digits[rowOff + p] !== digits[colOff + p]) {
          dist++
        }
      }

      const br = tensorEntryRe[dist]!
      const bi = tensorEntryIm[dist]!

      uRe[row * dim + col] = pr * br - pi * bi
      uIm[row * dim + col] = pr * bi + pi * br
    }
  }

  // Full unitarity error ||U^dag U - I||_max across all 729 x 729 entries (Kahan compensated)
  let fullUnitarityError = 0

  for (let i = 0; i < dim; i++) {
    for (let j = i; j < dim; j++) {
      let sr = 0
      let cr = 0
      let si = 0
      let ci = 0

      for (let k = 0; k < dim; k++) {
        const ki = k * dim + i
        const kj = k * dim + j
        const ar = uRe[ki]!
        const ai = uIm[ki]!
        const br = uRe[kj]!
        const bi = uIm[kj]!

        const tr = ar * br + ai * bi - cr
        const nr = sr + tr

        cr = nr - sr - tr
        sr = nr

        const ti = ar * bi - ai * br - ci
        const ni = si + ti

        ci = ni - si - ti
        si = ni
      }

      const target = i === j ? 1 : 0
      const err = Math.hypot(sr - target, si)

      if (err > fullUnitarityError) {
        fullUnitarityError = err
      }
    }
  }

  // Explicit Gauss-law commutator check ||[U_dt, G_s]||_max across all vertices s
  // Every basis state |phi> in the sector has exact eigenvalue omega^(div e(phi)_s),
  // computed directly from the 19 link fluxes e(phi) (without assuming conservation).
  const vertexPhaseRe = Array.from({ length: ladder.vertexCount }, () => new Float64Array(dim))
  const vertexPhaseIm = Array.from({ length: ladder.vertexCount }, () => new Float64Array(dim))
  const scratch = new Int8Array(ladder.linkCount)
  const omegaC: readonly [number, number][] = [
    [1, 0],
    [-0.5, Math.sqrt(3) / 2],
    [-0.5, -Math.sqrt(3) / 2],
  ]

  for (let state = 0; state < dim; state++) {
    fluxForBasisState(ladder, bg, state, scratch)

    const div = linkDivergence(ladder, scratch)

    for (let s = 0; s < ladder.vertexCount; s++) {
      const [wr, wi] = omegaC[div[s]!]!

      vertexPhaseRe[s]![state] = wr
      vertexPhaseIm[s]![state] = wi
    }
  }

  let gaussCommutatorMaxError = 0

  for (let s = 0; s < ladder.vertexCount; s++) {
    const gr = vertexPhaseRe[s]!
    const gi = vertexPhaseIm[s]!

    for (let row = 0; row < dim; row++) {
      const rGr = gr[row]!
      const rGi = gi[row]!

      for (let col = 0; col < dim; col++) {
        const idx = row * dim + col
        const ur = uRe[idx]!
        const ui = uIm[idx]!
        const cGr = gr[col]!
        const cGi = gi[col]!

        // (U G - G U)_{row, col} = U_{row, col} (G_{col} - G_{row})
        const dr = cGr - rGr
        const di = cGi - rGi
        const cr = ur * dr - ui * di
        const ci = ur * di + ui * dr
        const err = Math.hypot(cr, ci)

        if (err > gaussCommutatorMaxError) {
          gaussCommutatorMaxError = err
        }
      }
    }
  }

  // Compare quantum Floquet evolution (g^2 = 1) vs frozen classical limit (g^2 = 0, U_E = I)
  // starting from the classical T = 0 frozen magnetic vacuum |U_p = 1> = uniform superposition over phi
  const norm = 1 / Math.sqrt(dim)
  const frozenInitRe = new Float64Array(dim).fill(norm)
  const frozenInitIm = new Float64Array(dim)
  const initPlaquetteRe = meanPlaquetteReOfState(ladder.lx, frozenInitRe, frozenInitIm)

  // Step under quantum U_dt = U_E U_B (in vacuum sector)
  const vacSector = buildGaussSector(ladder, [])
  const vacActive = activeLinkCounts(ladder, vacSector.backgroundFlux!)
  const afterB = applyPlaquetteTensorProduct(ladder.lx, alpha, beta, frozenInitRe, frozenInitIm)
  const qStepRe = new Float64Array(dim)
  const qStepIm = new Float64Array(dim)

  for (let state = 0; state < dim; state++) {
    const [pr, pi] = toComplex(zetaPower(-kE * vacActive[state]!))
    const br = afterB.re[state]!
    const bi = afterB.im[state]!

    qStepRe[state] = pr * br - pi * bi
    qStepIm[state] = pr * bi + pi * br
  }

  let qOverlapRe = 0
  let qOverlapIm = 0

  for (let state = 0; state < dim; state++) {
    qOverlapRe += frozenInitRe[state]! * qStepRe[state]! + frozenInitIm[state]! * qStepIm[state]!
    qOverlapIm += frozenInitRe[state]! * qStepIm[state]! - frozenInitIm[state]! * qStepRe[state]!
  }

  const quantumTunnelingSurvival = qOverlapRe * qOverlapRe + qOverlapIm * qOverlapIm
  const quantumPlaquetteShift = Math.abs(
    meanPlaquetteReOfState(ladder.lx, qStepRe, qStepIm) - initPlaquetteRe,
  )

  // Frozen classical control (g^2 = 0 -> U_E = I, pure U_B): |U_p = 1> is an exact eigenstate
  let fOverlapRe = 0
  let fOverlapIm = 0

  for (let state = 0; state < dim; state++) {
    fOverlapRe += frozenInitRe[state]! * afterB.re[state]! + frozenInitIm[state]! * afterB.im[state]!
    fOverlapIm += frozenInitRe[state]! * afterB.im[state]! - frozenInitIm[state]! * afterB.re[state]!
  }

  const frozenControlSurvival = fOverlapRe * fOverlapRe + fOverlapIm * fOverlapIm
  const frozenControlPlaquetteShift = Math.abs(
    meanPlaquetteReOfState(ladder.lx, afterB.re, afterB.im) - initPlaquetteRe,
  )

  // Static potential in the frozen g^2 = 0 limit (H_E = 0, H_B = -sum_p Re(U_p))
  const frozenVac = solveGroundState(ladder, vacSector, 0, 0, 1)
  const distances = [1, 2, 3, 4, 5]
  const frozenPotentials: number[] = []

  for (const r of distances) {
    const pairSector = buildGaussSector(ladder, [
      { x: 0, y: 0, q: 1 },
      { x: r, y: 0, q: 2 },
    ])
    const ground = solveGroundState(ladder, pairSector, 0, 0, 1)

    frozenPotentials.push(ground.energy - frozenVac.energy)
  }

  const frozenFit = fitLinearPotential(distances, frozenPotentials)

  return {
    gSquared,
    dt,
    exactPlaquetteGateUnitary,
    exactPlaquetteGateInZZeta9OneSixth,
    exactElectricPhasesInZZeta9OneSixth,
    fullUnitarityError,
    gaussCommutatorMaxError,
    quantumTunnelingSurvival,
    quantumPlaquetteShift,
    frozenControlSurvival,
    frozenControlPlaquetteShift,
    frozenControlSigma: frozenFit.sigma,
  }
}
