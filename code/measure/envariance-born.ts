// ZUREK ENVARIANCE SYMMETRY PREREQUISITES ON THE WORKING RULE (E-QTM-0205).
// Under Key 8, the Born measure over record branches is posited operationally, not unconditionally
// derived. This experiment verifies the algebraic Zurek envariance symmetry prerequisites on an explicit bipartite
// state vector |Psi_SE> in H_S (x) H_E built from the actual single-beat branching amplitudes of R = 2 {3,4,3,4}:
//   (1) 2-branch Z_6 x Z_6 phase envariance verified entry-by-entry on the 4-component bipartite vector
//       |Psi_2> in H_S^(2) (x) H_E^(2) under explicit exact unitary matrices U_S (x) U_E.
//   (2) 4-branch equal-modulus Schmidt state |Psi_4> in H_S^(6) (x) H_E^(6) (path(2) (x) role(3) on both S and E)
//       constructed by applying the actual exact 3x3 qutrit Fourier fine-graining gate Z_3 F_3 in Sigma(648)
//       (explicitly a Tier-B Sigma(648) Clifford extension beyond bare single-excitation U) on the cross-branch
//       role register followed by exact controlled environment-role entanglement, verifying exact reduction from
//       Z[w][1/6] into Z[w][1/2], exact equality of all 4 branch squared moduli directly from |Psi_4>, and exact
//       invariance under all 24/24 explicit 6x6 permutation-and-phase unitary pairs U_S(pi) (x) U_E(pi) for pi in S_4.
//   (3) Branch-count symmetry weights derived directly from the verified equal-modulus Schmidt branch counts
//       (keepCount / totalEqualBranches, crossCount / totalEqualBranches) without hardcoded literals.
//
// Conditional Zurek envariance premises (stated explicitly per Key 8):
//   (E1) Probabilities of outcomes on S are fixed by the joint state |psi_SE>.
//   (E2) A unitary U_E acting strictly on the environment E does not change probabilities on S (no-signaling).
//   (E3) Schmidt basis states correspond to mutually exclusive outcomes.
//   (E4) Disjoint fine-grained outcome probabilities add (finite additivity).
//
// NOTHING MOVES: exact Z[w][1/6] bipartite matrix-vector arithmetic on the exact R = 2 ball.

import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  coinedVetoBeat,
  currentCoinPlace,
  setCoinPlace,
} from '@/code/rule/coined-locked-knit'
import {
  lockedState,
  lockedTables,
  norm,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { lockedFresh } from '@/code/measure/doublet-locked-readings'

const SLOTS = 24
const D0 = LINE_FIRSTS[0]!

type Eis = readonly [bigint, bigint] // a + b * w (w^2 + w + 1 = 0)

const E_ZERO: Eis = [0n, 0n]
const E_ONE: Eis = [1n, 0n]
const E_W: Eis = [0n, 1n]
const E_W2: Eis = [-1n, -1n]
const E_OMEGA_POW: readonly Eis[] = [E_ONE, E_W, E_W2]

const eAdd = (x: Eis, y: Eis): Eis => [x[0] + y[0], x[1] + y[1]]
const eConj = (x: Eis): Eis => [x[0] - x[1], -x[1]]
const eMul = (x: Eis, y: Eis): Eis => [
  x[0] * y[0] - x[1] * y[1],
  x[0] * y[1] + x[1] * y[0] - x[1] * y[1],
]
const eEq = (x: Eis, y: Eis): boolean => x[0] === y[0] && x[1] === y[1]
const eIsZero = (x: Eis): boolean => x[0] === 0n && x[1] === 0n
const eNormSq = (x: Eis): bigint =>
  x[0] * x[0] - x[0] * x[1] + x[1] * x[1]

// Exact zeta_6^n = (1 + w)^n for n mod 6
const ZETA6: readonly Eis[] = [
  [1n, 0n],
  [1n, 1n],
  [0n, 1n],
  [-1n, 0n],
  [-1n, -1n],
  [0n, -1n],
]

type EisMatrix = readonly (readonly Eis[])[]

function emptyConfig(cells: number): Configuration {
  return {
    vibe: new Int8Array(cells * 24),
    point: new Int8Array(cells * 24),
    open: new Uint8Array(cells * 24),
    store: new Int8Array(cells * 12),
    spoint: new Int8Array(cells * 12),
    sopen: new Uint8Array(cells * 12),
  }
}

function permutations4(): number[][] {
  const out: number[][] = []
  const arr = [0, 1, 2, 3]

  const gen = (k: number): void => {
    if (k === 4) {
      out.push([...arr])

      return
    }

    for (let i = k; i < 4; i++) {
      const tmp = arr[k]!

      arr[k] = arr[i]!
      arr[i] = tmp
      gen(k + 1)
      arr[i] = arr[k]!
      arr[k] = tmp
    }
  }

  gen(0)

  return out
}

// Verify exact scaled unitarity M^dag M = scaleSq * I_dim over Z[w].
function isExactScaledUnitary(
  mat: EisMatrix,
  scaleSq: bigint,
): boolean {
  const dim = mat.length

  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      let acc = E_ZERO

      for (let k = 0; k < dim; k++) {
        acc = eAdd(acc, eMul(eConj(mat[k]![i]!), mat[k]![j]!))
      }

      const target: Eis = i === j ? [scaleSq, 0n] : E_ZERO

      if (!eEq(acc, target)) {
        return false
      }
    }
  }

  return true
}

// Apply (U_S (x) U_E) to a bipartite state vector of length dimS * dimE, indexed as s * dimE + e.
function applyBipartiteUnitary(
  uS: EisMatrix,
  uE: EisMatrix,
  vec: readonly Eis[],
): Eis[] {
  const dimS = uS.length
  const dimE = uE.length
  // Step 1: (U_S (x) I_E) |psi>
  const mid: Eis[] = new Array<Eis>(dimS * dimE).fill(E_ZERO)

  for (let sOut = 0; sOut < dimS; sOut++) {
    for (let e = 0; e < dimE; e++) {
      let acc = E_ZERO

      for (let sIn = 0; sIn < dimS; sIn++) {
        const entry = vec[sIn * dimE + e]!

        if (!eIsZero(entry)) {
          acc = eAdd(acc, eMul(uS[sOut]![sIn]!, entry))
        }
      }

      mid[sOut * dimE + e] = acc
    }
  }

  // Step 2: (I_S (x) U_E) mid
  const out: Eis[] = new Array<Eis>(dimS * dimE).fill(E_ZERO)

  for (let s = 0; s < dimS; s++) {
    for (let eOut = 0; eOut < dimE; eOut++) {
      let acc = E_ZERO

      for (let eIn = 0; eIn < dimE; eIn++) {
        const entry = mid[s * dimE + eIn]!

        if (!eIsZero(entry)) {
          acc = eAdd(acc, eMul(uE[eOut]![eIn]!, entry))
        }
      }

      out[s * dimE + eOut] = acc
    }
  }

  return out
}

function vecEq(a: readonly Eis[], b: readonly Eis[]): boolean {
  if (a.length !== b.length) {
    return false
  }

  for (let i = 0; i < a.length; i++) {
    if (!eEq(a[i]!, b[i]!)) {
      return false
    }
  }

  return true
}

function zeroMat(dim: number): Eis[][] {
  return Array.from({ length: dim }, () =>
    Array.from({ length: dim }, () => E_ZERO),
  )
}

function identityMat(dim: number, scale = 1n): Eis[][] {
  const m = zeroMat(dim)

  for (let i = 0; i < dim; i++) {
    m[i]![i] = [scale, 0n]
  }

  return m
}

// Build 6x6 fine-graining unitary 3 * diag(I_3, Z_3 F_3) on path(2) (x) role(3),
// where F_3 = (1 / (i sqrt(3))) [w^(r*c)] = ((-1 - 2w) / 3) [w^(r*c)] and Z_3 = diag(1, w, w^2)
// lie in the Tier-B qutrit Clifford group Sigma(648) over Z[w][1/3].
function buildFineGrainUnitaryScaled3(): Eis[][] {
  const invISqrt3Times3: Eis = [-1n, -2n] // 3 / (1 + 2w) = -1 - 2w since (1 + 2w)(-1 - 2w) = 3
  const m = zeroMat(6)

  for (let r = 0; r < 3; r++) {
    m[r]![r] = [3n, 0n]
  }

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const phase = E_OMEGA_POW[(r * (c + 1)) % 3]!

      m[3 + r]![3 + c] = eMul(invISqrt3Times3, phase)
    }
  }

  return m
}

export type EnvarianceBornResult = {
  readonly ballCells: number
  readonly frontierHits: number
  readonly normErr: number
  readonly schmidtWeights: readonly [number, number]
  readonly phaseEnvarianceTested: number
  readonly phaseEnvarianceExact: number
  readonly fineGrainingUnitaryExact: boolean
  readonly fineGrainedInZOmegaHalf: boolean
  readonly fineGrainedWeights: readonly [number, number, number, number]
  readonly swapPermutationsTested: number
  readonly swapPermutationsExact: number
  readonly equalBranchCounts: readonly [number, number]
  readonly derivedKeepProb: number
  readonly derivedCrossProb: number
  readonly dyadicMaxErrByM: readonly number[]
}

export function runEnvarianceBorn(): EnvarianceBornResult {
  const m = exactBallMesh({ radius: 2 })
  const cells = m.cells
  const f = lockedFresh({
    mesh: m.mesh,
    store: new Int8Array(cells * 12),
  })
  const tables: LockedTables = lockedTables(
    f.weave,
    'pass',
    new Int16Array(cells * 24).fill(f.weave.moves.identity),
  )

  const prevPlace = currentCoinPlace()

  let frontierHits = 0
  let keepW = 0
  let crossW = 0
  let totalNormNum = 0n
  let totalNormDen = 1n
  let keepAmp: Eis = E_ZERO
  let crossAmp: Eis = E_ZERO

  try {
    setCoinPlace('before')

    const start = emptyConfig(cells)

    start.vibe[D0] = 1
    start.open[D0] = 1

    const after1 = coinedVetoBeat('none', tables, lockedState(start), 0)
    const yKeep = m.mesh.neighbour(0, D0)
    const yCross = m.mesh.neighbour(0, OPPOSITE[D0]!)

    let maxK = 0

    for (const b of after1.branches) {
      if (b.k > maxK) {
        maxK = b.k
      }

      for (let x = 0; x < cells; x++) {
        if (m.ball.distance[x]! < 2) {
          continue
        }

        const base = x * SLOTS

        for (let d = 0; d < SLOTS; d++) {
          if (b.vibe[base + d] !== 0) {
            frontierHits++
          }
        }
      }
    }

    totalNormDen = 1n << BigInt(2 * maxK)

    for (const b of after1.branches) {
      const nVal = norm(b.a, b.b) << BigInt(2 * (maxK - b.k))

      totalNormNum += nVal

      const wFloat = Number(nVal) / Number(totalNormDen)

      if (b.vibe[yKeep * SLOTS + D0] === 1) {
        keepW = wFloat
        keepAmp = [b.a, b.b]
      } else if (b.vibe[yCross * SLOTS + OPPOSITE[D0]!] === 1) {
        crossW = wFloat
        crossAmp = [b.a, b.b]
      }
    }
  } finally {
    setCoinPlace(prevPlace)
  }

  const normErr = Math.abs(Number(totalNormNum - totalNormDen))

  // G1: Explicit 2-branch bipartite state vector |Psi_2> in H_S^(2) (x) H_E^(2) (denominator 2):
  //   |Psi_2> = keepAmp |0>_S|0>_E + crossAmp |1>_S|1>_E.
  // Test all 36 phase-swap unitary matrix pairs U_S(p0,p1) (x) U_E(-p0,-p1) entry-by-entry on |Psi_2>.
  const psi2: readonly Eis[] = [keepAmp, E_ZERO, E_ZERO, crossAmp]

  let phaseEnvarianceTested = 0
  let phaseEnvarianceExact = 0

  for (let p0 = 0; p0 < 6; p0++) {
    for (let p1 = 0; p1 < 6; p1++) {
      phaseEnvarianceTested++

      const uS: EisMatrix = [
        [ZETA6[p0]!, E_ZERO],
        [E_ZERO, ZETA6[p1]!],
      ]
      const uE: EisMatrix = [
        [ZETA6[(6 - p0) % 6]!, E_ZERO],
        [E_ZERO, ZETA6[(6 - p1) % 6]!],
      ]
      const unitaryOk =
        isExactScaledUnitary(uS, 1n) && isExactScaledUnitary(uE, 1n)
      const evolved = applyBipartiteUnitary(uS, uE, psi2)

      if (unitaryOk && vecEq(evolved, psi2)) {
        phaseEnvarianceExact++
      }
    }
  }

  // G2: Explicit 36-component bipartite state |Psi_4> in H_S^(6) (x) H_E^(6) where dim = path(2) x role(3).
  // Basis index on S or E: 3 * path + role (path 0 = keep, path 1 = cross; role in {0, 1, 2}).
  // Initial 2-branch bipartite state embedded at role = 0 (denominator 2):
  const psi6Init: Eis[] = new Array<Eis>(36).fill(E_ZERO)

  psi6Init[0 * 6 + 0] = keepAmp // |keep, r=0>_S |keep, r=0>_E
  psi6Init[3 * 6 + 3] = crossAmp // |cross, r=0>_S |cross, r=0>_E

  // Apply actual exact 6x6 unitary U_fine = diag(I_3, Z_3 F_3) in Sigma(648) on S (denominator 2 * 3 = 6):
  const uFineScaled3 = buildFineGrainUnitaryScaled3()
  const uEye6 = identityMat(6, 1n)
  const fineGrainingUnitaryExact = isExactScaledUnitary(
    uFineScaled3,
    9n,
  )
  const psiAfterFineScaled6 = applyBipartiteUnitary(
    uFineScaled3,
    uEye6,
    psi6Init,
  )

  // Entangle the fine-grained cross role on S into E's role register via exact controlled-add permutation
  // unitary U_copy: on (pathS=1, roleS=r; pathE=1, roleE=eR) -> eR' = (eR + r) mod 3 (bijection on 36 states).
  const psi4Scaled6: Eis[] = new Array<Eis>(36).fill(E_ZERO)

  for (let s = 0; s < 6; s++) {
    const sPath = Math.floor(s / 3)
    const sRole = s % 3

    for (let e = 0; e < 6; e++) {
      const ePath = Math.floor(e / 3)
      const eRole = e % 3
      const nextERole =
        sPath === 1 && ePath === 1 ? (eRole + sRole) % 3 : eRole
      const nextE = ePath * 3 + nextERole

      psi4Scaled6[s * 6 + nextE] = psiAfterFineScaled6[s * 6 + e]!
    }
  }

  // Verify every entry of psi4Scaled6 is divisible by 3, reducing exact denominator 6 -> 2 in Z[w][1/2]!
  const fineGrainedInZOmegaHalf = psi4Scaled6.every(
    z => z[0] % 3n === 0n && z[1] % 3n === 0n,
  )
  const psi4: Eis[] = fineGrainedInZOmegaHalf
    ? psi4Scaled6.map(z => [z[0] / 3n, z[1] / 3n])
    : psi4Scaled6
  const psi4Den: bigint = fineGrainedInZOmegaHalf ? 2n : 6n
  const psi4DenSq = psi4Den * psi4Den

  // Scan the actual computed 36-component vector |Psi_4> to extract its nonzero Schmidt support and norms:
  const activeSchmidt: {
    readonly s: number
    readonly e: number
    readonly amp: Eis
    readonly normSqNum: bigint
  }[] = []

  let psi4TotalNormNum = 0n

  for (let s = 0; s < 6; s++) {
    for (let e = 0; e < 6; e++) {
      const amp = psi4[s * 6 + e]!

      if (!eIsZero(amp)) {
        const nSq = eNormSq(amp)

        psi4TotalNormNum += nSq
        activeSchmidt.push({ s, e, amp, normSqNum: nSq })
      }
    }
  }

  const isExact4BranchDiagonalSchmidt =
    psi4TotalNormNum === psi4DenSq &&
    activeSchmidt.length === 4 &&
    activeSchmidt.every(b => b.s === b.e)

  const baseNormSqNum = activeSchmidt[0]?.normSqNum ?? 0n
  const allEqualModulus =
    isExact4BranchDiagonalSchmidt &&
    baseNormSqNum > 0n &&
    activeSchmidt.every(b => b.normSqNum === baseNormSqNum)

  const fgWeights: [number, number, number, number] = [
    Number(activeSchmidt[0]?.normSqNum ?? 0n) / Number(psi4DenSq),
    Number(activeSchmidt[1]?.normSqNum ?? 0n) / Number(psi4DenSq),
    Number(activeSchmidt[2]?.normSqNum ?? 0n) / Number(psi4DenSq),
    Number(activeSchmidt[3]?.normSqNum ?? 0n) / Number(psi4DenSq),
  ]

  // Verify all 24/24 S_4 permutations as explicit 6x6 unitary matrices U_S(pi) (x) U_E(pi) on |Psi_4>:
  const perms = permutations4()

  let swapPermutationsTested = 0
  let swapPermutationsExact = 0

  if (allEqualModulus) {
    const activeIndices = activeSchmidt.map(b => b.s)
    const activeSet = new Set(activeIndices)

    for (const pi of perms) {
      swapPermutationsTested++

      const uS = zeroMat(6)
      const uE = zeroMat(6)

      // Fix inactive basis indices on both S and E
      for (let idx = 0; idx < 6; idx++) {
        if (!activeSet.has(idx)) {
          uS[idx]![idx] = E_ONE
          uE[idx]![idx] = E_ONE
        }
      }

      // On active Schmidt indices: U_S maps |s_j> -> |s_{pi[j]}>,
      // and U_E maps |e_j> -> (amp[pi[j]] / amp[j]) |e_{pi[j]}> (ratio computed directly from |Psi_4>!).
      let phasesIntegral = true

      for (let j = 0; j < 4; j++) {
        const src = activeIndices[j]!
        const dst = activeIndices[pi[j]!]!
        const srcAmp = activeSchmidt[j]!.amp
        const dstAmp = activeSchmidt[pi[j]!]!.amp
        const ratioNum = eMul(dstAmp, eConj(srcAmp))

        if (
          ratioNum[0] % baseNormSqNum !== 0n ||
          ratioNum[1] % baseNormSqNum !== 0n
        ) {
          phasesIntegral = false
          break
        }

        const phase: Eis = [
          ratioNum[0] / baseNormSqNum,
          ratioNum[1] / baseNormSqNum,
        ]

        uS[dst]![src] = E_ONE
        uE[dst]![src] = phase
      }

      if (
        phasesIntegral &&
        isExactScaledUnitary(uS, 1n) &&
        isExactScaledUnitary(uE, 1n)
      ) {
        const swapped = applyBipartiteUnitary(uS, uE, psi4)

        if (vecEq(swapped, psi4)) {
          swapPermutationsExact++
        }
      }
    }
  } else {
    swapPermutationsTested = perms.length
  }

  // Derive keep/cross probabilities directly from the verified equal-modulus Schmidt branch counts!
  const keepBranchCount = activeSchmidt.filter(b => b.s < 3).length
  const crossBranchCount = activeSchmidt.filter(b => b.s >= 3).length
  const totalEqualBranches = activeSchmidt.length
  const envarianceValid =
    fineGrainingUnitaryExact &&
    allEqualModulus &&
    swapPermutationsExact === perms.length &&
    totalEqualBranches > 0

  const derivedKeepProb = envarianceValid
    ? keepBranchCount / totalEqualBranches
    : 0
  const derivedCrossProb = envarianceValid
    ? crossBranchCount / totalEqualBranches
    : 0

  // Internal diagnostic only (not a headline envariance error): dyadic-4 grid resolution at m = 1..4.
  const dyadicMaxErrByM: number[] = []

  for (let depth = 1; depth <= 4; depth++) {
    const denom = 4 ** depth

    let maxErr = 0

    for (let g = 0; g <= 1000; g++) {
      const p = g / 1000
      const k = Math.round(p * denom)
      const err = Math.abs(k / denom - p)

      if (err > maxErr) {
        maxErr = err
      }
    }

    dyadicMaxErrByM.push(maxErr)
  }

  return {
    ballCells: cells,
    frontierHits,
    normErr,
    schmidtWeights: [crossW, keepW],
    phaseEnvarianceTested,
    phaseEnvarianceExact,
    fineGrainingUnitaryExact,
    fineGrainedInZOmegaHalf,
    fineGrainedWeights: fgWeights,
    swapPermutationsTested,
    swapPermutationsExact,
    equalBranchCounts: [crossBranchCount, keepBranchCount],
    derivedKeepProb,
    derivedCrossProb,
    dyadicMaxErrByM,
  }
}
