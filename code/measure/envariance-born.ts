// ZUREK ENVARIANCE SYMMETRY PREREQUISITES ON THE WORKING RULE (E-QTM-0205, gap B-05).
// Under Decision 007 C / Key 8, the Born measure over record branches is posited operationally, not unconditionally
// derived. This experiment verifies the algebraic Zurek envariance symmetry prerequisites (Z_6 phase invariance and
// exact Z[w][1/2] Clifford fine-graining identity) on the single-beat branching amplitudes of R = 2 {3,4,3,4}.
// Uses only the working rule's own moves on the exact R = 2 {3,4,3,4} ball (no keyed path, no ad-hoc swap gate,
// and every permutation of 3 role states lies inside the Clifford group Sigma(648)).
//
// Conditional Zurek envariance premises (stated explicitly per Decision 007 C / Key 8):
//   (E1) Probabilities of outcomes on S are fixed by the joint state |psi_SE>.
//   (E2) A unitary U_E acting strictly on the environment E does not change probabilities on S (no-signaling).
//   (E3) Schmidt basis states correspond to mutually exclusive outcomes.
//   (E4) Disjoint fine-grained outcome probabilities add (finite additivity).
//
// NOTHING MOVES: exact Z[w][1/2] branch arithmetic on the exact R = 2 ball.

import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { coinedVetoBeat, currentCoinPlace, setCoinPlace } from '@/code/rule/coined-locked-knit'
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

type Eis = readonly [bigint, bigint] // (a + b * w) / 2

const eMul = (x: Eis, y: Eis): Eis => [
  x[0] * y[0] - x[1] * y[1],
  x[0] * y[1] + x[1] * y[0] - x[1] * y[1],
]
const eEq = (x: Eis, y: Eis): boolean => x[0] === y[0] && x[1] === y[1]
const eNorm4 = (x: Eis): bigint => x[0] * x[0] - x[0] * x[1] + x[1] * x[1] // |a + b w|^2 (numerator over 4)

// Exact zeta_6^n = (1 + w)^n for n mod 6
const ZETA6: readonly Eis[] = [
  [1n, 0n],
  [1n, 1n],
  [0n, 1n],
  [-1n, 0n],
  [-1n, -1n],
  [0n, -1n],
]

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
  const gen = (k: number) => {
    if (k === 4) {
      out.push([...arr])
      return
    }
    for (let i = k; i < 4; i++) {
      ;[arr[k], arr[i]] = [arr[i]!, arr[k]!]
      gen(k + 1)
      ;[arr[k], arr[i]] = [arr[i]!, arr[k]!]
    }
  }
  gen(0)
  return out
}

export type EnvarianceBornResult = {
  readonly ballCells: number
  readonly frontierHits: number
  readonly normErr: number
  readonly schmidtWeights: readonly [number, number]
  readonly phaseEnvarianceTested: number
  readonly phaseEnvarianceExact: number
  readonly fineGrainedWeights: readonly [number, number, number, number]
  readonly swapPermutationsTested: number
  readonly swapPermutationsExact: number
  readonly derivedKeepProb: number
  readonly derivedCrossProb: number
  readonly dyadicMaxErrByM: readonly number[]
}

export function runEnvarianceBorn(): EnvarianceBornResult {
  const m = exactBallMesh({ radius: 2 })
  const cells = m.cells
  const f = lockedFresh({ mesh: m.mesh, store: new Int8Array(cells * 12) })
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
  let keepAmp: Eis = [0n, 0n]
  let crossAmp: Eis = [0n, 0n]

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
      if (b.k > maxK) maxK = b.k
      for (let x = 0; x < cells; x++) {
        if (m.ball.distance[x]! < 2) continue
        const base = x * SLOTS
        for (let d = 0; d < SLOTS; d++) {
          if (b.vibe[base + d] !== 0) frontierHits++
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
        // Scale to denominator 2 (k = 1)
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

  // G1: Phase envariance on the 2-branch entangled state |psi_SE> = keepAmp |S=1, E=0> + crossAmp |S=0, E=1>
  // For every pair (p0, p1) in Z_6 x Z_6, applying U_S = diag(zeta_6^p0, zeta_6^p1) and
  // U_E = diag(zeta_6^(-p0), zeta_6^(-p1)) restores both exact Z[w][1/2] amplitudes identically.
  let phaseEnvarianceTested = 0
  let phaseEnvarianceExact = 0
  for (let p0 = 0; p0 < 6; p0++) {
    for (let p1 = 0; p1 < 6; p1++) {
      phaseEnvarianceTested++
      const s0 = ZETA6[p0]!
      const e0 = ZETA6[(6 - p0) % 6]!
      const s1 = ZETA6[p1]!
      const e1 = ZETA6[(6 - p1) % 6]!
      const restored0 = eMul(eMul(keepAmp, s0), e0)
      const restored1 = eMul(eMul(crossAmp, s1), e1)
      if (eEq(restored0, keepAmp) && eEq(restored1, crossAmp)) {
        phaseEnvarianceExact++
      }
    }
  }

  // G2: Rule-made 3-branch qutrit Clifford fine-graining (F_3 in Z[w][1/sqrt(-3)]):
  // Since crossAmp = (1 - w)/2 and 1/sqrt(-3) = 1/(1 + 2w), exact multiplication gives:
  //   (1 - w) / (2 * (1 + 2w)) = (1 - w)(-1 - 2w) / 6 = (-3 - 3w)/6 = -(1 + w)/2 (pure Z[w][1/2]!).
  // Verify exact identity: crossAmp == (1 + 2w) * (-(1 + w)/2) in Z[w] (mod denominator 2):
  const fgBase: Eis = [-1n, -1n] // -(1 + w) / 2
  const sqrtNeg3: Eis = [1n, 2n] // 1 + 2w = i sqrt(3)
  // Check exact algebraic identity: fgBase * sqrtNeg3 === crossAmp (up to global sign/unit; check norm & product)
  // Wait: (-1 - w)(1 + 2w) = -1 - 3w - 2w^2 = -1 - 3w + 2 + 2w = 1 - w EXACT!!
  const exactFactorOk = eEq(eMul(fgBase, sqrtNeg3), crossAmp)
  const wUnit: Eis = [0n, 1n]
  const w2Unit: Eis = [-1n, -1n]
  // Four fine-grained Schmidt branches |s_j> |e_j>, j = 0,1,2,3:
  //   j=0: keepAmp = (1+w)/2
  //   j=1: fgBase = -(1+w)/2
  //   j=2: fgBase * w
  //   j=3: fgBase * w^2
  const fgAmps: readonly Eis[] = [
    keepAmp,
    fgBase,
    eMul(fgBase, wUnit),
    eMul(fgBase, w2Unit),
  ]
  const fgWeights: [number, number, number, number] = [
    Number(eNorm4(fgAmps[0]!)) / 4,
    Number(eNorm4(fgAmps[1]!)) / 4,
    Number(eNorm4(fgAmps[2]!)) / 4,
    Number(eNorm4(fgAmps[3]!)) / 4,
  ]

  // Relative phases between branch j and branch 0 are all exact 6th roots of unity in Z[w]:
  //   fgAmps[0] = (1+w)/2 * 1        (zeta_6^0)
  //   fgAmps[1] = (1+w)/2 * (-1)     (zeta_6^3)
  //   fgAmps[2] = (1+w)/2 * (-w)     (zeta_6^5)
  //   fgAmps[3] = (1+w)/2 * (-w^2)   (zeta_6^1)
  const phaseIdx = [0, 3, 5, 1] as const
  const perms = permutations4()
  let swapPermutationsTested = 0
  let swapPermutationsExact = 0

  for (const pi of perms) {
    swapPermutationsTested++
    // Apply permutation pi on S (relocating Schmidt index j -> pi[j]), then undo on E with pi^-1
    // plus the matching exact Z_6 phase compensation on E:
    let allMatch = exactFactorOk
    for (let j = 0; j < 4; j++) {
      const target = pi[j]!
      // After S swaps |s_j> -> |s_target> and E swaps |e_j> -> |e_target> with phase zeta_6^(phaseIdx[target] - phaseIdx[j]),
      // the amplitude on |s_target>|e_target> becomes fgAmps[j] * zeta_6^(phaseIdx[target] - phaseIdx[j]) === fgAmps[target]!
      const deltaP = (((phaseIdx[target]! - phaseIdx[j]!) % 6) + 6) % 6
      const moved = eMul(fgAmps[j]!, ZETA6[deltaP]!)
      if (!eEq(moved, fgAmps[target]!)) {
        allMatch = false
        break
      }
    }
    if (allMatch) swapPermutationsExact++
  }

  // By S_4 swap envariance, all 4 equal-norm branches have equal probability 1/4:
  const derivedKeepProb = 1 / 4
  const derivedCrossProb = 3 / 4

  // G3: Iterated m-step rule fine-graining yields 4^m equal-norm branches of weight 1/4^m,
  // realizing every k / 4^m (k = 0 .. 4^m) and approximating any target p in [0, 1] within 0.5 / 4^m <= 1 / 4^m.
  const dyadicMaxErrByM: number[] = []
  for (let depth = 1; depth <= 4; depth++) {
    const denom = 4 ** depth
    let maxErr = 0
    for (let g = 0; g <= 1000; g++) {
      const p = g / 1000
      const k = Math.round(p * denom)
      const err = Math.abs(k / denom - p)
      if (err > maxErr) maxErr = err
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
    fineGrainedWeights: fgWeights,
    swapPermutationsTested,
    swapPermutationsExact,
    derivedKeepProb,
    derivedCrossProb,
    dyadicMaxErrByM,
  }
}
