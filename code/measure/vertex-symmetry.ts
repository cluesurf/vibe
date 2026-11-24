// EXACT C, P, CP, T AND CPT VERTEX TABLE ON THE {3,4,3,4} BALL (item vibe-roadmap-board-0020, gaps B-23, B-44).
// Compares four pieces on the exact R = 2 ball (split coin, exact Z[w][1/2], zero floats, zero random numbers):
//   (1) bare working rule
//   (2) adopted ODD value phase (grounding decision 003, k* = 4 W(F4) pseudoscalar read with dock orientation)
//   (3) smallest charge-neutral C-odd P-odd linear dipole phase (sum over docks of orientation(x) * (vibe[D0] - vibe[D0_BACK]))
//   (4) EVEN value phase (control: C-odd, P-even)
// Tested on a neutral 2-vibe pair P2 (love + fear on opposite slots) and a 4-vibe chiral cluster X1.
//
// NOTHING MOVES: exact branch phase arithmetic on the exact ball.

import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  coinedVetoBeat,
  coinedVetoBeatBack,
  currentCoinPlace,
  setCoinPlace,
} from '@/code/rule/coined-locked-knit'
import {
  cloneConfiguration,
  lockedState,
  lockedTables,
  times,
  type Branch,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  chargeConjugate,
  mapState,
  mirrorConfiguration,
  motionReversal,
} from '@/code/measure/locked-parity'
import {
  asMirror,
  labelMap,
  orientationOf,
  sameStateFast,
  type MeshTable,
} from '@/code/measure/value-phase-maps'
import {
  slotGroup,
  valueBeat,
  valueBeatBack,
  type ValuePiece,
} from '@/code/rule/value-phase'
import { lockedFresh } from '@/code/measure/doublet-locked-readings'

const SLOTS = 24
const D0 = LINE_FIRSTS[0]!
const D0_BACK = OPPOSITE[D0]!

export type PieceName = 'bare' | 'odd' | 'dipole' | 'even'

export type VertexSymmetryRow = {
  readonly piece: PieceName
  readonly start: 'P2_neutral' | 'X1_chiral'
  readonly reversible: boolean
  readonly frontierHits: number
  readonly silentVsBare: boolean
  readonly C: boolean
  readonly P_kept: number
  readonly P_total: number
  readonly CP_kept: number
  readonly CP_total: number
  readonly T: boolean
  readonly CPT_kept: number
  readonly CPT_total: number
}

export type VertexTableResult = {
  readonly ballCells: number
  readonly rows: VertexSymmetryRow[]
}

const cloneBranch = (b: Branch): Branch => ({ ...cloneConfiguration(b), a: b.a, b: b.b, k: b.k })

// Multiply branch by zeta6^n (zeta6 = 1 + w, exact unit of Z[w], order 6)
function applyZeta6Power(b: Branch, n: number): void {
  const m = ((n % 6) + 6) % 6
  const lut: readonly [bigint, bigint][] = [
    [1n, 0n],
    [1n, 1n],
    [0n, 1n],
    [-1n, 0n],
    [-1n, -1n],
    [0n, -1n],
  ]
  const [u, v] = lut[m]!
  times(b, u, v)
}

// Smallest charge-neutral C-odd P-odd linear dipole reading on one dock:
//   chi_dipole(x) = orientation(x) * (vibe[x, D0] - vibe[x, D0_BACK])
// Zero net charge on a neutral dock, flips sign under C (tone -> -tone), flips sign under P (D0 <-> D0_BACK or mirror).
// Applied palindromically (before and after the split beat) as zeta6^(chi_dipole), exactly unitary and reversible.
function applyDipolePhase(s: LockedState, ori: Int8Array, cells: number, sign: 1 | -1): LockedState {
  return {
    branches: s.branches.map(br => {
      const b = cloneBranch(br)
      let n = 0
      for (let x = 0; x < cells; x++) {
        const base = x * SLOTS
        const diff = b.vibe[base + D0]! - b.vibe[base + D0_BACK]!
        if (diff !== 0) n += ori[x]! * diff
      }
      if (n !== 0) applyZeta6Power(b, sign * n)
      return b
    }),
  }
}

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

export function runVertexSymmetryTable(): VertexTableResult {
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

  const oddPiece: ValuePiece = { kind: 'odd', orientation: ori.orientation }
  const evenPiece: ValuePiece = { kind: 'even', orientation: ori.orientation }

  // Select 8 det -1 cell mirrors fixing dock 0 (exact automorphisms of the R = 2 ball!)
  const group = slotGroup()
  const pMirrors: ReturnType<typeof asMirror>[] = []
  for (let i = 0; i < group.elements.length && pMirrors.length < 8; i++) {
    if (group.det[i] !== -1) continue
    const g = group.elements[i]!
    const lm = labelMap(tableObj, g, 0)
    if (lm.conflicts === 0) {
      pMirrors.push(asMirror(`P${pMirrors.length}`, g, lm.cells, -1))
    }
  }

  // Starts:
  // (1) P2_neutral: love on D0, fear on D0_BACK (net charge 0, neutral 2-vibe pair, dipole = +2)
  const p2 = emptyConfig(cells)
  p2.vibe[D0] = 1
  p2.open[D0] = 1
  p2.vibe[D0_BACK] = -1
  p2.open[D0_BACK] = 1

  // (2) X1_chiral: 4-vibe chiral dock cluster (open love on 0, closed loves on 1, 4, 16)
  const x1 = emptyConfig(cells)
  for (const [d, open] of [[0, 1], [1, 0], [4, 0], [16, 0]] as const) {
    x1.vibe[d] = 1
    x1.open[d] = open
  }

  const starts: readonly ['P2_neutral' | 'X1_chiral', Configuration][] = [
    ['P2_neutral', p2],
    ['X1_chiral', x1],
  ]

  const stepOf = (piece: PieceName, s: LockedState): LockedState => {
    if (piece === 'bare') return coinedVetoBeat('none', tables, s, 0)
    if (piece === 'odd') return valueBeat(oddPiece, tables, s, 0)
    if (piece === 'even') return valueBeat(evenPiece, tables, s, 0)
    // Dipole applied palindromically around the split beat
    const p1 = applyDipolePhase(s, ori.orientation, cells, 1)
    const mid = coinedVetoBeat('none', tables, p1, 0)
    return applyDipolePhase(mid, ori.orientation, cells, 1)
  }

  const backOf = (piece: PieceName, s: LockedState): LockedState => {
    if (piece === 'bare') return coinedVetoBeatBack('none', tables, s, 0)
    if (piece === 'odd') return valueBeatBack(oddPiece, tables, s, 0)
    if (piece === 'even') return valueBeatBack(evenPiece, tables, s, 0)
    const p1 = applyDipolePhase(s, ori.orientation, cells, -1)
    const mid = coinedVetoBeatBack('none', tables, p1, 0)
    return applyDipolePhase(mid, ori.orientation, cells, -1)
  }

  const rows: VertexSymmetryRow[] = []
  const prevPlace = currentCoinPlace()

  try {
    setCoinPlace('split')
    for (const [startName, c0] of starts) {
      const s0 = lockedState(c0)
      const bare1 = stepOf('bare', s0)

      for (const piece of ['bare', 'odd', 'dipole', 'even'] as const) {
        const s1 = stepOf(piece, s0)
        const sBack = backOf(piece, s1)
        const reversible = sameStateFast(sBack, s0)
        const frontierHits = countFrontierHits(s1, m.ball.distance)
        const silentVsBare = sameStateFast(s1, bare1)

        const opC = (s: LockedState) => mapState(s, chargeConjugate)
        const keepC = sameStateFast(stepOf(piece, opC(s0)), opC(s1))
        const keepT = sameStateFast(
          backOf(piece, motionReversal(tables, s0)),
          motionReversal(tables, s1),
        )

        let pKept = 0
        let cpKept = 0
        let cptKept = 0

        for (const pm of pMirrors) {
          const opP = (s: LockedState) => mapState(s, c => mirrorConfiguration(pm, c))
          const opCP = (s: LockedState) => opP(opC(s))
          if (sameStateFast(stepOf(piece, opP(s0)), opP(s1))) pKept++
          if (sameStateFast(stepOf(piece, opCP(s0)), opCP(s1))) cpKept++
          if (
            sameStateFast(
              backOf(piece, opCP(motionReversal(tables, s0))),
              opCP(motionReversal(tables, s1)),
            )
          ) {
            cptKept++
          }
        }

        rows.push({
          piece,
          start: startName,
          reversible,
          frontierHits,
          silentVsBare,
          C: keepC,
          P_kept: pKept,
          P_total: pMirrors.length,
          CP_kept: cpKept,
          CP_total: pMirrors.length,
          T: keepT,
          CPT_kept: cptKept,
          CPT_total: pMirrors.length,
        })
      }
    }
  } finally {
    setCoinPlace(prevPlace)
  }

  return { ballCells: cells, rows }
}
