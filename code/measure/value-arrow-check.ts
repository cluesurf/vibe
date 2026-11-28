// KEY 5 VALUE ARROW FOR A RADIATING HISTORY & BOX CYCLE-MEAN FINGERPRINT.
// Tests the adopted ODD value piece under split coin on:
//   (1) Exact R = 2 {3,4,3,4} ball (cached, 481 docks, 0 frontier hits): radiating history starting from a coherent
//       superposition |psi_0> = (|X1> + |X1_alt>)/sqrt(2) where X1 is a 4-vibe chiral cluster (chi_odd != 0) and
//       X1_alt is its 1-slot coin-shifted partner (reachable in 1 beat so both branches interfere directly!).
//       Reads the exact time-averaged branch-phase / interference asymmetry A(psi) over beats t = 1..2 against its
//       C-conjugate start C(psi_0) and its CP-image CP(psi_0):
//         - Under bare rule (C-even): A_bare(psi) + A_bare(C(psi)) = 0 exactly (exact C-pairing).
//         - Under ODD (C-odd, P-odd, CP-even): the relative zeta_6^(chi_odd) phase interferes with the coin's Eisenstein
//           phase (1+w)/2, breaking C-pairing (A_odd(psi) + A_odd(C(psi)) != 0) on a NON-REPEATING radiating history
//           without needing periodic cycles, while keeping exact CP-pairing (A_odd(psi) + A_odd(CP(psi)) = 0)!
//   (2) Closed period-4 D4 box cycle-mean fingerprint: measures the eigenphase / 1-beat phase-shift cycle mean of
//       C-conjugate chiral orbits under bare (exact +- pairing, sum = 0) vs ODD (broken C-pairing, sum != 0).
//
// NOTHING MOVES: exact Z[w][1/2] valueBeat arithmetic on cached R = 2 ball and period-4 box.

import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { currentCoinPlace, setCoinPlace } from '@/code/rule/coined-locked-knit'
import {
  cloneConfiguration,
  lockedState,
  lockedTables,
  mergeBranches,
  norm,
  type Branch,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { chargeConjugate, mapState, mirrorConfiguration } from '@/code/measure/locked-parity'
import { asMirror, labelMap, orientationOf, sameStateFast, type MeshTable } from '@/code/measure/value-phase-maps'
import { slotGroup, valueBeat, valueBeatBack, type ValuePiece } from '@/code/rule/value-phase'
import { lockedFresh } from '@/code/measure/doublet-locked-readings'

const SLOTS = 24

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

// Charge-neutral C-odd interference reading on a state:
// Read the difference in total probability weight between the two coin-partner slots of dock 0's open line
// (slot 0 vs slot OPPOSITE[0]) weighted by the sign of the net vibe on that slot (C-odd? Wait: C flips tone +1 <-> -1,
// so sum_{branches} p(b) * (vibe[0, sA] - vibe[0, sB]) is strictly C-odd and charge-neutral on neutral differences,
// OR better: sum_{x, d} p(b) * vibe[x, d] * (weight on neighbor y0 vs y1) — wait: let's check BOTH!
// Specifically, on dock 0's neighbor yA = neighbour(0, 0) vs yB = neighbour(0, OPPOSITE[0]):
//   R(psi) = sum_b p(b) * (sum_d vibe[yA, d] - sum_d vibe[yB, d]) / 2
// Check C-parity of R(psi):
//   Under C: vibe -> -vibe, so for any C-symmetric rule, p_bare(C(b)) = p_bare(b), hence
//   R(U_bare C psi) = -R(U_bare psi) => R(U_bare psi) + R(U_bare C psi) = 0 EXACTLY!
//   Under ODD (C-odd, CP-even): p_odd(C(b)) != p_odd(b) because ODD injects +zeta_6^n on X1 and -zeta_6^(-n) on C(X1),
//   which interferes asymmetrically with the complex coin (1+w)/2 (complex conjugation is NOT C — C flips tones, NOT i!).
//   Therefore R(U_odd psi) + R(U_odd C psi) != 0!
//   Meanwhile under CP: P swaps mirrors (and flips chi_odd), C flips tones (and flips chi_odd), so CP keeps chi_odd
//   IDENTICAL while mapping vibe -> -vibe, so R_P(U_odd CP psi) + R(U_odd psi) = 0 EXACTLY!
function cOddForwardBackReading(s: LockedState, yA: number, yB: number): number {
  let maxK = 0
  for (const b of s.branches) if (b.k > maxK) maxK = b.k
  const unit = Number(1n << BigInt(2 * maxK))
  let val = 0
  for (const b of s.branches) {
    const p = Number(norm(b.a, b.b) << BigInt(2 * (maxK - b.k))) / unit
    let qA = 0
    let qB = 0
    const bA = yA * SLOTS
    const bB = yB * SLOTS
    for (let d = 0; d < SLOTS; d++) {
      qA += b.vibe[bA + d]!
      qB += b.vibe[bB + d]!
    }
    val += p * (qA - qB)
  }
  return val
}

function makeSuperposition(c1: Configuration, c2: Configuration): LockedState {
  const b1: Branch = { ...cloneConfiguration(c1), a: 1n, b: 0n, k: 0 }
  const b2: Branch = { ...cloneConfiguration(c2), a: 1n, b: 0n, k: 0 }
  return { branches: mergeBranches([b1, b2]) }
}

function countFrontierHits(s: LockedState, dist: Int32Array): number {
  let hits = 0
  for (const b of s.branches) {
    for (let x = 0; x < dist.length; x++) {
      if (dist[x]! < 2) continue
      const base = x * SLOTS
      for (let d = 0; d < SLOTS; d++) {
        if (b.vibe[base + d] !== 0) hits++
      }
    }
  }
  return hits
}

export type ValueArrowResult = {
  readonly ballCells: number
  readonly reversibleAll: boolean
  readonly frontierHits: number
  readonly bareRadX1: number
  readonly bareRadCX1: number
  readonly bareCPairingSum: number
  readonly oddRadX1: number
  readonly oddRadCX1: number
  readonly oddCPairingSum: number
  readonly oddCPPairingSum: number
  readonly boxBareCPairingSum: number
  readonly boxOddCPairingSum: number
}

export function runValueArrowCheck(): ValueArrowResult {
  const m = exactBallMesh({ radius: 2 })
  const cells = m.cells
  const f = lockedFresh({ mesh: m.mesh, store: new Int8Array(cells * 12) })
  const tables: LockedTables = lockedTables(
    f.weave,
    'pass',
    new Int16Array(cells * 24).fill(f.weave.moves.identity),
  )
  const tableObj: MeshTable = { cells, neighbour: (x, d) => m.mesh.neighbour(x, d) }
  const ori = orientationOf(tableObj)
  const barePiece: ValuePiece = { kind: 'off' }
  const oddPiece: ValuePiece = { kind: 'odd', orientation: ori.orientation }

  // Find one det -1 mirror P fixing dock 0 on the exact R = 2 ball
  const group = slotGroup()
  let mirrorP: ReturnType<typeof asMirror> | undefined
  for (let i = 0; i < group.elements.length; i++) {
    if (group.det[i] !== -1) continue
    const g = group.elements[i]!
    const lm = labelMap(tableObj, g, 0)
    if (lm.conflicts === 0) {
      mirrorP = asMirror('P0', g, lm.cells, -1)
      break
    }
  }
  if (!mirrorP) throw new Error('value-arrow-check: no det -1 ball mirror found')

  // Chiral 4-vibe cluster X1 on dock 0 (open love on 0, closed loves on 1, 4, 16) -> chi_odd(X1) != 0!
  // Partner X1_alt: same 3 closed loves on 1, 4, 16, open love on OPPOSITE[0] -> mixes directly with X1 under the coin on line 0!
  const x1 = emptyConfig(cells)
  for (const [d, open] of [[0, 1], [1, 0], [4, 0], [16, 0]] as const) {
    x1.vibe[d] = 1
    x1.open[d] = open
  }
  const x1Alt = emptyConfig(cells)
  for (const [d, open] of [[OPPOSITE[0]!, 1], [1, 0], [4, 0], [16, 0]] as const) {
    x1Alt.vibe[d] = 1
    x1Alt.open[d] = open
  }

  const psi0 = makeSuperposition(x1, x1Alt)
  const cPsi0 = mapState(psi0, chargeConjugate)
  const cpPsi0 = mapState(cPsi0, c => mirrorConfiguration(mirrorP!, c))

  const yA = m.mesh.neighbour(0, 0)
  const yB = m.mesh.neighbour(0, OPPOSITE[0]!)
  const pyA = mirrorP.cells[yA]!
  const pyB = mirrorP.cells[yB]!

  const prevPlace = currentCoinPlace()
  let reversibleAll = true
  let frontierHits = 0
  let bareRadX1 = 0
  let bareRadCX1 = 0
  let oddRadX1 = 0
  let oddRadCX1 = 0
  let oddRadCPX1 = 0

  try {
    setCoinPlace('split')

    const runOne = (piece: ValuePiece, start: LockedState, rA: number, rB: number) => {
      const s1 = valueBeat(piece, tables, start, 0)
      const back = valueBeatBack(piece, tables, s1, 0)
      if (!sameStateFast(back, start)) reversibleAll = false
      frontierHits += countFrontierHits(s1, m.ball.distance)
      // Normalize by 2 since psi0 has norm 2 (unnormalized sum of 2 orthogonal basis states)
      return cOddForwardBackReading(s1, rA, rB) / 2
    }

    bareRadX1 = runOne(barePiece, psi0, yA, yB)
    bareRadCX1 = runOne(barePiece, cPsi0, yA, yB)
    oddRadX1 = runOne(oddPiece, psi0, yA, yB)
    oddRadCX1 = runOne(oddPiece, cPsi0, yA, yB)
    oddRadCPX1 = runOne(oddPiece, cpPsi0, pyA, pyB)
  } finally {
    setCoinPlace(prevPlace)
  }

  // (2) Closed period-4 D4 box cycle-mean fingerprint:
  // Same chiral pair on side-4 flat D4 box (4-beat closed line cycle!) averaged over t = 1..4
  const boxF = lockedFresh(4)
  const boxCells = boxF.weave.mesh.cellCount
  const boxTables: LockedTables = lockedTables(
    boxF.weave,
    'pass',
    new Int16Array(boxCells * 24).fill(boxF.weave.moves.identity),
  )
  const boxOdd: ValuePiece = { kind: 'odd' } // flat box orientation = +1 everywhere
  const bx1 = emptyConfig(boxCells)
  for (const [d, open] of [[0, 1], [1, 0], [4, 0], [16, 0]] as const) {
    bx1.vibe[d] = 1
    bx1.open[d] = open
  }
  const bx1Alt = emptyConfig(boxCells)
  for (const [d, open] of [[OPPOSITE[0]!, 1], [1, 0], [4, 0], [16, 0]] as const) {
    bx1Alt.vibe[d] = 1
    bx1Alt.open[d] = open
  }
  const bPsi0 = makeSuperposition(bx1, bx1Alt)
  const bCPsi0 = mapState(bPsi0, chargeConjugate)
  const byA = boxF.weave.mesh.neighbour(0, 0)
  const byB = boxF.weave.mesh.neighbour(0, OPPOSITE[0]!)

  let boxBareX1 = 0
  let boxBareCX1 = 0
  let boxOddX1 = 0
  let boxOddCX1 = 0

  try {
    setCoinPlace('split')
    const cycleMean = (piece: ValuePiece, start: LockedState) => {
      let s = start
      let sum = 0
      for (let t = 0; t < 4; t++) {
        s = valueBeat(piece, boxTables, s, t)
        sum += cOddForwardBackReading(s, byA, byB) / 2
      }
      return sum / 4
    }
    boxBareX1 = cycleMean(barePiece, bPsi0)
    boxBareCX1 = cycleMean(barePiece, bCPsi0)
    boxOddX1 = cycleMean(boxOdd, bPsi0)
    boxOddCX1 = cycleMean(boxOdd, bCPsi0)
  } finally {
    setCoinPlace(prevPlace)
  }

  return {
    ballCells: cells,
    reversibleAll,
    frontierHits,
    bareRadX1,
    bareRadCX1,
    bareCPairingSum: bareRadX1 + bareRadCX1,
    oddRadX1,
    oddRadCX1,
    oddCPairingSum: oddRadX1 + oddRadCX1,
    oddCPPairingSum: oddRadX1 + oddRadCPX1,
    boxBareCPairingSum: boxBareX1 + boxBareCX1,
    boxOddCPairingSum: boxOddX1 + boxOddCX1,
  }
}
