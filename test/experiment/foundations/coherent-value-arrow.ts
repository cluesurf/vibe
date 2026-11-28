// COHERENT KEY 5 VALUE ARROW ACROSS DISTINCT chi_odd BRANCHES (E-FND-0184, follow-up to E-FND-0183).
// E-FND-0183 discovered that a superposition of branches sharing equal chi_odd keeps exact C-pairing under ODD (global phase).
// Here we construct two 4-vibe configurations on dock 0 of the cached exact R = 2 {3,4,3,4} ball that mix directly
// under 1 beat of the split coin while carrying DISTINCT chi_odd values (chi_odd(X1) != chi_odd(X0) = 0), and verify:
//   (1) Bare rule keeps exact C-pairing (|bare(psi) + bare(C(psi))| = 0).
//   (2) Adopted ODD produces a large, exact, NONZERO occupation-level C-asymmetry on a 1-beat non-repeating radiating
//       history (|odd(psi) + odd(C(psi))| > 0.05) while keeping exact CP-pairing (|odd(psi) + odd(CP(psi))| = 0)!
//
// Depth L2: exact Z[w][1/2] valueBeat arithmetic on cached R = 2 ball. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { currentCoinPlace, setCoinPlace } from '@/code/rule/coined-locked-knit'
import {
  cloneConfiguration,
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
import { chiOf, slotGroup, valueBeat, valueBeatBack, type ValuePiece } from '@/code/rule/value-phase'
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

function cOddReading(s: LockedState, yA: number, yB: number): number {
  let maxK = 0
  for (const b of s.branches) if (b.k > maxK) maxK = b.k
  const unit = Number(1n << BigInt(2 * maxK))
  let val = 0
  for (const b of s.branches) {
    const p = Number(norm(b.a, b.b) << BigInt(2 * (maxK - b.k))) / unit
    let qA = 0
    let qB = 0
    for (let d = 0; d < SLOTS; d++) {
      qA += b.vibe[yA * SLOTS + d]!
      qB += b.vibe[yB * SLOTS + d]!
    }
    val += p * (qA - qB)
  }
  return val / 2
}

export default experiment({
  id: 'foundations/coherent-value-arrow',
  code: 'E-FND-0184',
  title:
    'Coherent interference between distinct chi_odd branches produces a large nonzero Key 5 C-asymmetry arrow under ODD on a non-repeating radiating history while keeping exact CP-pairing',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
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

    // Find a 4-vibe configuration X1 on dock 0 (1 open love on slot s0, 3 closed loves on s1,s2,s3) such that
    // flipping s0 -> OPPOSITE[s0] changes chi_odd (chi_odd(X1) != chi_odd(X1_alt))!
    // Deterministic scan over small triples (s1, s2, s3) with s0 = 0:
    let bestSlots: [number, number, number, number] | undefined
    let chi1 = 0
    let chi2 = 0
    const s0 = 0
    const s0Opp = OPPOSITE[s0]!
    const probeA = new Int8Array(SLOTS)
    const probeB = new Int8Array(SLOTS)

    outer: for (let s1 = 1; s1 < SLOTS; s1++) {
      if (s1 === s0Opp) continue
      for (let s2 = s1 + 1; s2 < SLOTS; s2++) {
        if (s2 === s0Opp) continue
        for (let s3 = s2 + 1; s3 < SLOTS; s3++) {
          if (s3 === s0Opp) continue
          probeA.fill(0)
          probeB.fill(0)
          probeA[s0] = 1
          probeA[s1] = 1
          probeA[s2] = 1
          probeA[s3] = 1
          probeB[s0Opp] = 1
          probeB[s1] = 1
          probeB[s2] = 1
          probeB[s3] = 1
          const slotsA = [s0, s1, s2, s3].sort((a, b) => a - b)
          const slotsB = [s0Opp, s1, s2, s3].sort((a, b) => a - b)
          const tones4 = [1, 1, 1, 1]
          const vA = chiOf('odd', slotsA, tones4, d => probeA[d]!)
          const vB = chiOf('odd', slotsB, tones4, d => probeB[d]!)
          if (vA !== vB && (vA !== 0 || vB !== 0)) {
            bestSlots = [s0, s1, s2, s3]
            chi1 = vA
            chi2 = vB
            break outer
          }
        }
      }
    }
    if (!bestSlots) throw new Error('coherent-value-arrow: no distinct chi_odd pair found')

    const xA = emptyConfig(cells)
    const xB = emptyConfig(cells)
    xA.vibe[bestSlots[0]] = 1
    xA.open[bestSlots[0]] = 1
    xB.vibe[s0Opp] = 1
    xB.open[s0Opp] = 1
    for (const s of [bestSlots[1], bestSlots[2], bestSlots[3]]) {
      xA.vibe[s] = 1
      xB.vibe[s] = 1
    }

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
    if (!mirrorP) throw new Error('coherent-value-arrow: no det -1 mirror found')

    const makeSup = (c1: Configuration, c2: Configuration): LockedState => ({
      branches: mergeBranches([
        { ...cloneConfiguration(c1), a: 1n, b: 0n, k: 0 } as Branch,
        { ...cloneConfiguration(c2), a: 1n, b: 0n, k: 0 } as Branch,
      ]),
    })

    const psi0 = makeSup(xA, xB)
    const cPsi0 = mapState(psi0, chargeConjugate)
    const cpPsi0 = mapState(cPsi0, c => mirrorConfiguration(mirrorP!, c))

    const yA = m.mesh.neighbour(0, s0)
    const yB = m.mesh.neighbour(0, s0Opp)
    const pyA = mirrorP.cells[yA]!
    const pyB = mirrorP.cells[yB]!

    const prevPlace = currentCoinPlace()
    let reversible = true
    let bareX = 0
    let bareCX = 0
    let oddX = 0
    let oddCX = 0
    let oddCPX = 0

    try {
      setCoinPlace('split')
      const evalOne = (piece: ValuePiece, s: LockedState, a: number, b: number) => {
        const s1 = valueBeat(piece, tables, s, 0)
        const back = valueBeatBack(piece, tables, s1, 0)
        if (!sameStateFast(back, s)) reversible = false
        return cOddReading(s1, a, b)
      }
      bareX = evalOne(barePiece, psi0, yA, yB)
      bareCX = evalOne(barePiece, cPsi0, yA, yB)
      oddX = evalOne(oddPiece, psi0, yA, yB)
      oddCX = evalOne(oddPiece, cPsi0, yA, yB)
      oddCPX = evalOne(oddPiece, cpPsi0, pyA, pyB)
    } finally {
      setCoinPlace(prevPlace)
    }

    const bareSum = bareX + bareCX
    const oddSum = oddX + oddCX
    const oddCPSum = oddX + oddCPX
    const ok =
      reversible &&
      chi1 !== chi2 &&
      Math.abs(bareSum) <= 1e-13 &&
      Math.abs(oddSum) > 0.05 &&
      Math.abs(oddCPSum) <= 1e-13

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Distinct-chi_odd pair on cached exact R = 2 ball (slots [${bestSlots.join(',')}], chi_odd=${chi1} vs ${chi2}, ` +
        `reversible=${reversible ? 1 : 0}): bare rule keeps exact C-pairing (${bareX.toFixed(6)} + ${bareCX.toFixed(6)} = ` +
        `${bareSum.toExponential(2)}); adopted ODD breaks C-pairing strongly on a 1-beat non-repeating radiating history ` +
        `(odd(psi)=${oddX.toFixed(6)}, odd(C(psi))=${oddCX.toFixed(6)}, C-asymmetry sum=${oddSum.toFixed(6)}) while ` +
        `keeping exact CP-pairing (sum=${oddCPSum.toExponential(2)})`,
      metrics: {
        reversible: reversible ? 1 : 0,
        chi1,
        chi2,
        bareX,
        bareCX,
        bareSum,
        oddX,
        oddCX,
        oddSum,
        oddCPSum,
      },
    })
  },
})
