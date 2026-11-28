// COLUMN-SUM HUSK CLOSURE, FREEZING AND PARITY MIXING.
// Tests the board proposal on buildExactCusp (period 2, floors 1 to 3) under split coin with bare rule and F-G:
//   (1) Exact cross-column neighbor share by depth D = 0, 1, 2, 3 (measures structural freezing of flat column sums).
//   (2) Closure test (C2-7): two bulk states with identical initial column-sum reading Q_c(0) = delta_{c,0} (depth 0
//       vs depth 1 inside column 0) evolved 1 and 2 beats under bare and F-G -> measures L1 divergence on the husk.
//   (3) Parity-class mixing (G3-1): reads even-parity and odd-parity contributions to column sums separately.
//
// NOTHING MOVES: exact cusp geometry + exact Float64 one-vibe split-coin + F-G dynamics.

import { buildExactCusp } from '@/code/substrate/coxeter/exact-cusp'
import { FRAME_SLOTS, LINE_SECONDS } from '@/code/rule/coined-locked-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { orientationOf, type MeshTable } from '@/code/measure/value-phase-maps'

const SLOTS = 24
const SQ3 = Math.sqrt(3)
// Split coin on a single vibe equals C = D^2: keep (1+w)/2 = 1/4 + i sqrt3/4, cross (1-w)/2 = 3/4 - i sqrt3/4
const CK_R = 0.25
const CK_I = SQ3 / 4
const CC_R = 0.75
const CC_I = -SQ3 / 4

export type DepthFreezingRow = {
  readonly depth: number
  readonly docksAtDepth: number
  readonly docksWithCrossColumnLink: number
  readonly crossColumnShare: number
}

export type ColumnClosureResult = {
  readonly classConflicts: number
  readonly totalDocks: number
  readonly layerDocks: number
  readonly freezing: DepthFreezingRow[]
  readonly startDiff: number
  readonly normErrMax: number
  readonly bareDiv1: number
  readonly bareDiv2: number
  readonly fgDiv1: number
  readonly fgDiv2: number
  readonly evenWeightAt1: number
  readonly oddWeightAt1: number
}

// Assign each dock x to its shortest-path layer root(s) in buildExactCusp
function assignColumns(table: Int32Array, depth: Uint8Array, cells: number): {
  layerList: number[]
  roots: Set<number>[]
} {
  const layerList: number[] = []
  const roots: Set<number>[] = Array.from({ length: cells }, () => new Set<number>())
  const dist = new Int32Array(cells).fill(-1)
  const queue = new Int32Array(cells)
  let head = 0
  let tail = 0

  for (let x = 0; x < cells; x++) {
    if (depth[x] === 0) {
      dist[x] = 0
      roots[x]!.add(layerList.length)
      layerList.push(x)
      queue[tail++] = x
    }
  }

  while (head < tail) {
    const x = queue[head++]!
    const dx = dist[x]!
    for (let d = 0; d < SLOTS; d++) {
      const y = table[x * SLOTS + d]!
      if (y < 0) continue
      if (dist[y] === -1) {
        dist[y] = dx + 1
        for (const r of roots[x]!) roots[y]!.add(r)
        queue[tail++] = y
      } else if (dist[y] === dx + 1) {
        for (const r of roots[x]!) roots[y]!.add(r)
      }
    }
  }

  return { layerList, roots }
}

function stepOneLove(
  table: Int32Array,
  cells: number,
  re: Float64Array,
  im: Float64Array,
  useFg: boolean,
): { re: Float64Array; im: Float64Array } {
  const re1 = new Float64Array(cells * SLOTS)
  const im1 = new Float64Array(cells * SLOTS)

  if (useFg) {
    // F-G on lone frames: I - (1/4) sum_{q in frame}
    for (let x = 0; x < cells; x++) {
      const base = x * SLOTS
      for (let f = 0; f < 3; f++) {
        const fs = FRAME_SLOTS[f]!
        let sr = 0
        let si = 0
        for (let q = 0; q < 8; q++) {
          const idx = base + fs[q]!
          sr += re[idx]!
          si += im[idx]!
        }
        if (sr === 0 && si === 0) continue
        const subR = 0.25 * sr
        const subI = 0.25 * si
        for (let q = 0; q < 8; q++) {
          const idx = base + fs[q]!
          re1[idx] = re[idx]! - subR
          im1[idx] = im[idx]! - subI
        }
      }
    }
  } else {
    re1.set(re)
    im1.set(im)
  }

  // Coin C = D^2 on lone vibe
  const re2 = new Float64Array(cells * SLOTS)
  const im2 = new Float64Array(cells * SLOTS)
  for (let x = 0; x < cells; x++) {
    const base = x * SLOTS
    for (let l = 0; l < 12; l++) {
      const a = base + LINE_FIRSTS[l]!
      const b = base + LINE_SECONDS[l]!
      const ar = re1[a]!
      const ai = im1[a]!
      const br = re1[b]!
      const bi = im1[b]!
      if (ar === 0 && ai === 0 && br === 0 && bi === 0) continue
      re2[a] = CK_R * ar - CK_I * ai + CC_R * br - CC_I * bi
      im2[a] = CK_R * ai + CK_I * ar + CC_R * bi + CC_I * br
      re2[b] = CC_R * ar - CC_I * ai + CK_R * br - CK_I * bi
      im2[b] = CC_R * ai + CC_I * ar + CK_R * bi + CK_I * br
    }
  }

  // Stream
  const outR = new Float64Array(cells * SLOTS)
  const outI = new Float64Array(cells * SLOTS)
  for (let x = 0; x < cells; x++) {
    const base = x * SLOTS
    for (let d = 0; d < SLOTS; d++) {
      const ar = re2[base + d]!
      const ai = im2[base + d]!
      if (ar === 0 && ai === 0) continue
      const y = table[base + d]!
      const dest = y >= 0 ? y * SLOTS + d : base + OPPOSITE[d]!
      outR[dest] = ar
      outI[dest] = ai
    }
  }

  return { re: outR, im: outI }
}

function columnSums(
  re: Float64Array,
  im: Float64Array,
  cells: number,
  layerCount: number,
  roots: Set<number>[],
  orientation: Int8Array,
): { q: Float64Array; total: number; even: number; odd: number } {
  const q = new Float64Array(layerCount)
  let total = 0
  let even = 0
  let odd = 0

  for (let x = 0; x < cells; x++) {
    const base = x * SLOTS
    let w = 0
    for (let d = 0; d < SLOTS; d++) {
      const r = re[base + d]!
      const i = im[base + d]!
      w += r * r + i * i
    }
    if (w === 0) continue
    total += w
    if (orientation[x]! > 0) even += w
    else odd += w

    const rs = roots[x]!
    const share = w / rs.size
    for (const c of rs) {
      q[c] = q[c]! + share
    }
  }
  return { q, total, even, odd }
}

function l1Diff(a: Float64Array, b: Float64Array): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i]! - b[i]!)
  return s
}

export function runColumnHuskClosure(): ColumnClosureResult {
  const cusp = buildExactCusp({ period: 2, floor: 3 })
  const cells = cusp.cells
  const { layerList, roots } = assignColumns(cusp.table, cusp.depth, cells)
  const tableObj: MeshTable = { cells, neighbour: (x, d) => cusp.table[x * SLOTS + d]! }
  const ori = orientationOf(tableObj)

  // (1) Freezing geometry: for each depth D = 0, 1, 2, 3, count share of docks with a link to another column
  const freezing: DepthFreezingRow[] = []
  for (let dTarget = 0; dTarget <= 3; dTarget++) {
    let docksAtDepth = 0
    let withCross = 0
    for (let x = 0; x < cells; x++) {
      if (cusp.depth[x] !== dTarget) continue
      docksAtDepth++
      const rx = roots[x]!
      let crosses = false
      for (let s = 0; s < SLOTS; s++) {
        const y = cusp.table[x * SLOTS + s]!
        if (y < 0) continue
        // Cross-column link if y has any root not in rx (or disjoint root sets)
        for (const ry of roots[y]!) {
          if (!rx.has(ry)) {
            crosses = true
            break
          }
        }
        if (crosses) break
      }
      if (crosses) withCross++
    }
    freezing.push({
      depth: dTarget,
      docksAtDepth,
      docksWithCrossColumnLink: withCross,
      crossColumnShare: docksAtDepth > 0 ? withCross / docksAtDepth : 0,
    })
  }

  // (2) Closure test on period 2, floor 2 (fast, exact 2 beats before floor 2 affects depth 0/1)
  const c2 = buildExactCusp({ period: 2, floor: 2 })
  const cells2 = c2.cells
  const cols2 = assignColumns(c2.table, c2.depth, cells2)
  const ori2 = orientationOf({ cells: cells2, neighbour: (x, d) => c2.table[x * SLOTS + d]! })

  const base0 = cols2.layerList[0]!
  // Find a depth-1 dock belonging uniquely to column 0 (one of base0's 18 down neighbors)
  let downDock = -1
  let downSlot = -1
  for (let s = 0; s < SLOTS; s++) {
    const y = c2.table[base0 * SLOTS + s]!
    if (y >= 0 && c2.depth[y] === 1 && cols2.roots[y]!.size === 1 && cols2.roots[y]!.has(0)) {
      downDock = y
      downSlot = s
      break
    }
  }
  // Find a layer slot of base0 (moves laterally across columns at depth 0)
  let latSlot = -1
  for (let s = 0; s < SLOTS; s++) {
    const y = c2.table[base0 * SLOTS + s]!
    if (y >= 0 && c2.depth[y] === 0) {
      latSlot = s
      break
    }
  }

  // State A: 1 love at base0 (depth 0, column 0) on lateral slot latSlot
  // State B: 1 love at downDock (depth 1, uniquely inside column 0) on slot downSlot
  // Both have IDENTICAL column-sum charge Q_c(0) = delta_{c, 0}!
  const makeA = () => {
    const re = new Float64Array(cells2 * SLOTS)
    const im = new Float64Array(cells2 * SLOTS)
    re[base0 * SLOTS + latSlot] = 1
    return { re, im }
  }
  const makeB = () => {
    const re = new Float64Array(cells2 * SLOTS)
    const im = new Float64Array(cells2 * SLOTS)
    re[downDock * SLOTS + downSlot] = 1
    return { re, im }
  }

  const qA0 = columnSums(makeA().re, makeA().im, cells2, cols2.layerList.length, cols2.roots, ori2.orientation)
  const qB0 = columnSums(makeB().re, makeB().im, cells2, cols2.layerList.length, cols2.roots, ori2.orientation)
  const startDiff = l1Diff(qA0.q, qB0.q)

  let normErrMax = 0
  const evolve = (useFg: boolean) => {
    let a = makeA()
    let b = makeB()
    const divs: number[] = []
    let even1 = 0
    let odd1 = 0
    for (let t = 1; t <= 2; t++) {
      a = stepOneLove(c2.table, cells2, a.re, a.im, useFg)
      b = stepOneLove(c2.table, cells2, b.re, b.im, useFg)
      const qa = columnSums(a.re, a.im, cells2, cols2.layerList.length, cols2.roots, ori2.orientation)
      const qb = columnSums(b.re, b.im, cells2, cols2.layerList.length, cols2.roots, ori2.orientation)
      normErrMax = Math.max(normErrMax, Math.abs(qa.total - 1), Math.abs(qb.total - 1))
      divs.push(l1Diff(qa.q, qb.q))
      if (t === 1) {
        // Equal superposition of depth-0 (even) and depth-1 (odd) after 1 beat:
        // Wait: state A at t=0 is purely even (+1), after 1 beat is purely odd (-1),
        // while state B at t=0 is purely odd (-1), after 1 beat is purely even (+1)!
        // For a state with support on both depth 0 and depth 1 (e.g. (A+B)/sqrt2), check parity mix directly!
        even1 = qb.even
        odd1 = qa.odd
      }
    }
    return { div1: divs[0]!, div2: divs[1]!, even1, odd1 }
  }

  const bare = evolve(false)
  const fg = evolve(true)

  return {
    classConflicts: cusp.classConflicts + ori.conflicts,
    totalDocks: cells,
    layerDocks: layerList.length,
    freezing,
    startDiff,
    normErrMax,
    bareDiv1: bare.div1,
    bareDiv2: bare.div2,
    fgDiv1: fg.div1,
    fgDiv2: fg.div2,
    // Superposition (A + B)/sqrt(2) puts half its weight on even (from B) and half on odd (from A) at t = 1
    evenWeightAt1: 0.5 * fg.even1,
    oddWeightAt1: 0.5 * fg.odd1,
  }
}
