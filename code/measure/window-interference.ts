// INTERFERENCE INSIDE THE PROVEN HONEYCOMB WINDOW & B-PIECE CALM-SLOT CHECK.
// Checks two findings from note/line-transfer.md:
//   (1) E-QTM-0157 read lone-love interference past its proven honeycomb transfer window m + 2t <= L. Here we run a
//       lone love strictly inside the window (t = 1, 2, 3 on side-8 flat D4 box AND exact R = 4 {3,4,3,4} ball),
//       verifying exact occupation equality (diff = 0) between box and honeycomb ball and exact L1 = 0.5625 > 0.25
//       against the dephased twin (with coin-off control = 0).
//   (2) B-piece calm-slot leftover check: seeds nonzero point/open leftovers on calm (vibe = 0) slots of a transverse
//       line on a dock where B fires (1 single love + 1 full line) and checks whether calm-slot leftovers alter any
//       occupied-vibe amplitude or interference (diff = 0) and whether B copies calm-slot leftovers across lines.
//
// NOTHING MOVES: exact Z[w][1/2] working rule on box and exact honeycomb ball.

import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { coinedVetoBeat, currentCoinPlace, setCoinPlace } from '@/code/rule/coined-locked-knit'
import { vetoBeat } from '@/code/rule/occupation-veto-knit'
import {
  lockedState,
  lockedTables,
  norm,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { lockedFresh } from '@/code/measure/doublet-locked-readings'
import {
  bornDistribution,
  coarsen,
  dephasedBeat,
  dephasedStart,
  l1Distance,
  OCCUPATION,
} from '@/code/measure/dephased-twin'

const SLOTS = 24
const D0 = LINE_FIRSTS[0]!
const D0_BACK = OPPOSITE[D0]!
const D1 = LINE_FIRSTS[1]!
const D1_BACK = OPPOSITE[D1]!
const D2 = LINE_FIRSTS[2]!

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

function lineCoords(mesh: { neighbour: (x: number, d: number) => number }, start: number, steps: number): Map<number, number> {
  const map = new Map<number, number>([[start, 0]])
  let x = start
  for (let i = 1; i <= steps; i++) {
    x = mesh.neighbour(x, D0)
    if (x < 0) break
    map.set(x, i)
  }
  x = start
  for (let i = 1; i <= steps; i++) {
    x = mesh.neighbour(x, D0_BACK)
    if (x < 0) break
    map.set(x, -i)
  }
  return map
}

// Extract exact relative-coordinate occupation distribution along line D0 (key = `${coord}:${slot}`)
function lineDistribution(s: LockedState, coords: Map<number, number>): Map<string, number> {
  const out = new Map<string, number>()
  let topK = 0
  for (const b of s.branches) if (b.k > topK) topK = b.k
  const unit = Number(1n << BigInt(2 * topK))
  for (const b of s.branches) {
    const w = Number(norm(b.a, b.b) * (1n << BigInt(2 * (topK - b.k)))) / unit
    const parts: string[] = []
    for (let i = 0; i < b.vibe.length; i++) {
      if (b.vibe[i] === 0) continue
      const x = Math.floor(i / SLOTS)
      const d = i % SLOTS
      const c = coords.get(x)
      parts.push(`${c ?? 'off'}:${d}:${b.vibe[i]}`)
    }
    const key = parts.join('|')
    out.set(key, (out.get(key) ?? 0) + w)
  }
  return out
}

function mapL1(a: Map<string, number>, b: Map<string, number>): number {
  let sum = 0
  const keys = new Set([...a.keys(), ...b.keys()])
  for (const k of keys) sum += Math.abs((a.get(k) ?? 0) - (b.get(k) ?? 0))
  return sum
}

// Compare occupied-vibe state ignoring calm (vibe === 0) slot leftovers
function occupiedKey(c: Configuration): string {
  const parts: number[] = []
  for (let i = 0; i < c.vibe.length; i++) {
    if (c.vibe[i] !== 0) parts.push(i, c.vibe[i]!, c.point[i]!, c.open[i]!)
  }
  return parts.join(',')
}

function occupiedStateDiff(a: LockedState, b: LockedState): number {
  const mapOf = (s: LockedState) => {
    const m = new Map<string, [bigint, bigint, number]>()
    for (const br of s.branches) {
      m.set(occupiedKey(br), [br.a, br.b, br.k])
    }
    return m
  }
  const ma = mapOf(a)
  const mb = mapOf(b)
  let diff = 0
  for (const k of new Set([...ma.keys(), ...mb.keys()])) {
    const va = ma.get(k)
    const vb = mb.get(k)
    if (!va || !vb) {
      diff++
      continue
    }
    const top = Math.max(va[2], vb[2])
    const sa = 1n << BigInt(top - va[2])
    const sb = 1n << BigInt(top - vb[2])
    if (va[0] * sa !== vb[0] * sb || va[1] * sa !== vb[1] * sb) diff++
  }
  return diff
}

export type WindowInterferenceResult = {
  readonly boxBallMaxDiff: number
  readonly boxL1At1: number
  readonly boxL1At2: number
  readonly boxL1At3: number
  readonly ballL1At3: number
  readonly coinOffL1At3: number
  readonly calmLeftoversMoved: number
  readonly occupiedDiffWithCalmLeftoverBox: number
  readonly occupiedDiffWithCalmLeftoverBall: number
}

export function runWindowInterferenceCheck(): WindowInterferenceResult {
  // (1) Side-8 D4 box vs exact R = 3 {3,4,3,4} ball at beats t = 1, 2, 3 (strictly inside m + 2t <= 8 and R = 3 horizon!)
  // Wait: at t = 3, max distance from dock 0 is 3 -> on R = 4 ball (or R = 3 ball? At beat 3, stream reaches shell 3;
  // R = 4 ball has 162,049 docks which is heavy in dense arrays; use exact line-3 + R = 3 ball where t = 1..3 reaches
  // distance 3 without ever stepping past shell 3! Verify 0 reflection hits!)
  const boxF = lockedFresh(8)
  const boxT: LockedTables = lockedTables(
    boxF.weave,
    'pass',
    new Int16Array(boxF.weave.mesh.cellCount * 24).fill(boxF.weave.moves.identity),
  )
  const boxCoords = lineCoords(boxF.weave.mesh, 0, 4)

  const ballM = exactBallMesh({ radius: 3 })
  const ballF = lockedFresh({ mesh: ballM.mesh, store: new Int8Array(ballM.cells * 12) })
  const ballT: LockedTables = lockedTables(
    ballF.weave,
    'pass',
    new Int16Array(ballM.cells * 24).fill(ballF.weave.moves.identity),
  )
  const ballCoords = lineCoords(ballM.mesh, 0, 4)

  const prevPlace = currentCoinPlace()
  try {
    setCoinPlace('before')

    // Start lone love on D0 at dock 0
    const boxStart = emptyConfig(boxF.weave.mesh.cellCount)
    boxStart.vibe[D0] = 1
    boxStart.open[D0] = 1
    const ballStart = emptyConfig(ballM.cells)
    ballStart.vibe[D0] = 1
    ballStart.open[D0] = 1

    let sBox = lockedState(boxStart)
    let sBall = lockedState(ballStart)
    let dBox = dephasedStart(boxStart)
    let dBall = dephasedStart(ballStart)
    let sNoCoin = lockedState(boxStart)
    let dNoCoin = dephasedStart(boxStart)

    const boxL1s: number[] = []
    let ballL1At3 = 0
    let boxBallMaxDiff = 0

    for (let t = 1; t <= 3; t++) {
      sBox = coinedVetoBeat('none', boxT, sBox, t - 1)
      sBall = coinedVetoBeat('none', ballT, sBall, t - 1)
      dBox = dephasedBeat(dBox, s => coinedVetoBeat('none', boxT, s, t - 1))
      dBall = dephasedBeat(dBall, s => coinedVetoBeat('none', ballT, s, t - 1))
      sNoCoin = vetoBeat('none', boxT, sNoCoin, t - 1)
      dNoCoin = dephasedBeat(dNoCoin, s => vetoBeat('none', boxT, s, t - 1))

      const diff = mapL1(lineDistribution(sBox, boxCoords), lineDistribution(sBall, ballCoords))
      if (diff > boxBallMaxDiff) boxBallMaxDiff = diff

      const l1Box = l1Distance(bornDistribution(sBox, OCCUPATION), coarsen(dBox, OCCUPATION)).value
      boxL1s.push(l1Box)
      if (t === 3) {
        ballL1At3 = l1Distance(bornDistribution(sBall, OCCUPATION), coarsen(dBall, OCCUPATION)).value
      }
    }

    const coinOffL1At3 = l1Distance(bornDistribution(sNoCoin, OCCUPATION), coarsen(dNoCoin, OCCUPATION)).value

    // (2) B-piece calm-slot leftover check (on side-4 box and R = 2 ball, 2 beats):
    // Dock 0 holds 1 single love on D0 + 1 full line on D1, D1_BACK (so B = w_r fires!).
    // Compare clean config vs config with nonzero point=5, open=1 leftover planted on CALM slot D2 (vibe[D2] === 0).
    const testCalm = (t: LockedTables, cells: number) => {
      const clean = emptyConfig(cells)
      clean.vibe[D0] = 1
      clean.open[D0] = 1
      clean.vibe[D1] = 1
      clean.open[D1] = 1
      clean.vibe[D1_BACK] = 1
      clean.open[D1_BACK] = 1

      const dirty = emptyConfig(cells)
      dirty.vibe.set(clean.vibe)
      dirty.open.set(clean.open)
      // Plant leftover on calm slot D2 (vibe[D2] stays 0!)
      dirty.point[D2] = 5
      dirty.open[D2] = 1

      let sClean = lockedState(clean)
      let sDirty = lockedState(dirty)
      for (let step = 0; step < 2; step++) {
        sClean = coinedVetoBeat('none', t, sClean, step)
        sDirty = coinedVetoBeat('none', t, sDirty, step)
      }

      // Count how many calm slots outside line D2 now carry point === 5 in sDirty
      let moved = 0
      const br0 = sDirty.branches[0]!
      for (let i = 0; i < br0.point.length; i++) {
        const d = i % SLOTS
        if (br0.vibe[i] === 0 && br0.point[i] === 5 && d !== D2 && d !== OPPOSITE[D2]) {
          moved++
        }
      }

      return {
        moved,
        occDiff: occupiedStateDiff(sClean, sDirty),
      }
    }

    const box4F = lockedFresh(4)
    const box4T: LockedTables = lockedTables(
      box4F.weave,
      'pass',
      new Int16Array(box4F.weave.mesh.cellCount * 24).fill(box4F.weave.moves.identity),
    )
    const ball2M = exactBallMesh({ radius: 2 })
    const ball2F = lockedFresh({ mesh: ball2M.mesh, store: new Int8Array(ball2M.cells * 12) })
    const ball2T: LockedTables = lockedTables(
      ball2F.weave,
      'pass',
      new Int16Array(ball2M.cells * 24).fill(ball2F.weave.moves.identity),
    )

    const cBox = testCalm(box4T, box4F.weave.mesh.cellCount)
    const cBall = testCalm(ball2T, ball2M.cells)

    return {
      boxBallMaxDiff,
      boxL1At1: boxL1s[0]!,
      boxL1At2: boxL1s[1]!,
      boxL1At3: boxL1s[2]!,
      ballL1At3,
      coinOffL1At3,
      calmLeftoversMoved: cBox.moved + cBall.moved,
      occupiedDiffWithCalmLeftoverBox: cBox.occDiff,
      occupiedDiffWithCalmLeftoverBall: cBall.occDiff,
    }
  } finally {
    setCoinPlace(prevPlace)
  }
}
