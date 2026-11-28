// READING ONE BULK STATE TOWARD ALL 24 CUSPS OF THE BASE DOCK.
// Constructs the exact 24 distinct ideal cusp vertices of the base 24-cell in Z[sqrt 2] as the W(F4) orbit of
// CUSP_VERTEX, then reads four states (present minus empty vacuum V1) evolved on the exact R = 2 ball toward all
// 24 cusps: total charge Q_i, layer-0 weight Q_layer(i), and mean Busemann depth <d>_i.
//
// NOTHING MOVES: exact Coxeter geometry in Z[sqrt 2] + exact Z[w][1/2] working-rule states.

import {
  buildExactBall,
  exactCell,
  matrixVector,
  twiceForm,
  type ExactVector,
} from '@/code/substrate/coxeter/exact-3434'
import { CUSP_VERTEX } from '@/code/substrate/coxeter/exact-cusp'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import {
  coinedVetoBeat,
  currentCoinPlace,
  mixBranch,
  setCoinPlace,
} from '@/code/rule/coined-locked-knit'
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
import { lockedFresh } from '@/code/measure/doublet-locked-readings'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'

const SLOTS = 24
const D0 = LINE_FIRSTS[0]!
const D0_BACK = OPPOSITE[D0]!

const keyOf = (v: ExactVector): string => v.join(',')
const toFloat = ([x, y]: [bigint, bigint]): number => Number(x) + Number(y) * Math.SQRT2
const cloneBranch = (b: Branch): Branch => ({ ...cloneConfiguration(b), a: b.a, b: b.b, k: b.k })

export type CuspOrbitInfo = {
  readonly count: number
  readonly allNull: boolean
  readonly equalBasePairing: boolean
  readonly allSixLayerNeighbors: boolean
  readonly cusps: readonly ExactVector[]
}

export function buildTwentyFourCusps(): CuspOrbitInfo {
  const cell = exactCell()
  const seen = new Set<string>()
  const cusps: ExactVector[] = []

  for (const h of cell.stabilizer) {
    const v = matrixVector(h, CUSP_VERTEX)
    const k = keyOf(v)
    if (!seen.has(k)) {
      seen.add(k)
      cusps.push(v)
    }
  }

  const allNull = cusps.every(v => {
    const [x, y] = twiceForm(v, v)
    return x === 0n && y === 0n
  })

  const basePair0 = twiceForm(cell.center, cusps[0]!)
  const equalBasePairing = cusps.every(v => {
    const [x, y] = twiceForm(cell.center, v)
    return x === basePair0[0] && y === basePair0[1]
  })

  // Check each cusp has exactly 6 layer-0 neighbors of the base cell (and 18 deeper neighbors)
  const neighborCenters = cell.transports.map(t => matrixVector(t, cell.center))
  const allSixLayerNeighbors = cusps.every(v => {
    const [bx, by] = twiceForm(cell.center, v)
    let layer = 0
    for (const nc of neighborCenters) {
      const [nx, ny] = twiceForm(nc, v)
      if (nx === bx && ny === by) layer++
    }
    return layer === 6
  })

  return {
    count: cusps.length,
    allNull,
    equalBasePairing,
    allSixLayerNeighbors,
    cusps,
  }
}

export type StateCuspReading = {
  readonly name: string
  readonly rule: 'bare' | 'fg'
  readonly qMin: number
  readonly qMax: number
  readonly qSpread: number
  readonly qLayerMin: number
  readonly qLayerMax: number
  readonly qLayerSpread: number
  readonly depthMin: number
  readonly depthMax: number
  readonly depthSpread: number
  readonly distinctOrbits: number
}

export type TwentyFourCuspsResult = {
  readonly cuspInfo: Omit<CuspOrbitInfo, 'cusps'>
  readonly readings: StateCuspReading[]
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

// Compute expected charge per dock x in a LockedState (exact weights converted once to float)
function expectedChargePerDock(s: LockedState, cells: number): Float64Array {
  const out = new Float64Array(cells)
  let topK = 0
  for (const b of s.branches) {
    if (b.k > topK) topK = b.k
  }
  const unit = Number(1n << BigInt(2 * topK))
  for (const b of s.branches) {
    const w = Number(norm(b.a, b.b) * (1n << BigInt(2 * (topK - b.k)))) / unit
    for (let x = 0; x < cells; x++) {
      let q = 0
      const base = x * SLOTS
      for (let d = 0; d < SLOTS; d++) {
        q += b.vibe[base + d]!
      }
      if (q !== 0) out[x] = out[x]! + w * q
    }
  }
  return out
}

export function runTwentyFourCusps(): TwentyFourCuspsResult {
  const info = buildTwentyFourCusps()
  const cell = exactCell()
  const ball = buildExactBall({ radius: 2 })
  const m = exactBallMesh({ radius: 2 })
  const cells = m.cells
  const f = lockedFresh({ mesh: m.mesh, store: new Int8Array(cells * 12) })
  const tables: LockedTables = lockedTables(
    f.weave,
    'pass',
    new Int16Array(cells * 24).fill(f.weave.moves.identity),
  )

  // Precompute exact cell centers for all 481 docks of B(0, 2) via BFS along cell.transports
  const centers: ExactVector[] = new Array(cells)
  const frames: (typeof cell.transports[number])[] = new Array(cells)
  const id5 = cell.stabilizer[0]!
  frames[0] = id5
  centers[0] = cell.center
  const visited = new Uint8Array(cells)
  visited[0] = 1
  const queue = new Int32Array(cells)
  queue[0] = 0
  let head = 0
  let tail = 1
  // Use matrixProduct from exact-3434 via direct import? Let's compute centers from exactBall's table!
  // Actually buildExactBall ALREADY builds exact frames internally, let's compute exact pairings using
  // B(g c0, v) cleanly by importing matrixProduct!
  const b0 = toFloat(twiceForm(cell.center, info.cusps[0]!))

  // Compute exact centers via BFS on ball.table using cell.transports
  // Wait: each step across slot d multiplies frame g on the right by cell.transports[d]!
  // Let's compute centers with exact 5x5 multiplication inline-free? No, import matrixProduct!
  return runWithBall(info, cell, m, tables, b0)
}

import { matrixProduct, type ExactMatrix } from '@/code/substrate/coxeter/exact-3434'

function runWithBall(
  info: CuspOrbitInfo,
  cell: ReturnType<typeof exactCell>,
  m: ReturnType<typeof exactBallMesh>,
  tables: LockedTables,
  b0: number,
): TwentyFourCuspsResult {
  const cells = m.cells
  const frames: ExactMatrix[] = new Array(cells)
  const centers: ExactVector[] = new Array(cells)

  // Identity 5x5 matrix over Z[sqrt 2]
  const id5: ExactMatrix = new Array<bigint>(50).fill(0n)
  for (let i = 0; i < 5; i++) id5[2 * (i * 5 + i)] = 1n

  frames[0] = id5
  centers[0] = cell.center
  const seen = new Uint8Array(cells)
  seen[0] = 1
  const queue = new Int32Array(cells)
  let head = 0
  let tail = 1

  while (head < tail) {
    const x = queue[head++]!
    const gx = frames[x]!
    for (let d = 0; d < SLOTS; d++) {
      const y = m.ball.table[x * SLOTS + d]!
      if (y < 0 || seen[y]) continue
      seen[y] = 1
      const gy = matrixProduct(gx, cell.transports[d]!)
      frames[y] = gy
      centers[y] = matrixVector(gy, cell.center)
      queue[tail++] = y
    }
  }

  // Precompute Busemann depth ln(B(c_x, v_i) / B(c0, v_i)) and layer-0 flag for every (cusp i, dock x)
  const isLayer: Uint8Array[] = []
  const busemann: Float64Array[] = []

  for (let i = 0; i < info.cusps.length; i++) {
    const v = info.cusps[i]!
    const [bx, by] = twiceForm(cell.center, v)
    const lay = new Uint8Array(cells)
    const dep = new Float64Array(cells)
    for (let x = 0; x < cells; x++) {
      const [px, py] = twiceForm(centers[x]!, v)
      lay[x] = px === bx && py === by ? 1 : 0
      const ratio = toFloat([px, py]) / b0
      dep[x] = Math.log(Math.max(1e-12, ratio))
    }
    isLayer.push(lay)
    busemann.push(dep)
  }

  // Build 4 starts on dock 0
  const s0Config = emptyConfig(cells)
  for (let d = 0; d < SLOTS; d++) {
    s0Config.vibe[d] = 1
    s0Config.open[d] = 1
  }

  const s1Config = emptyConfig(cells)
  s1Config.vibe[D0] = 1
  s1Config.open[D0] = 1

  const s2Config = emptyConfig(cells)
  s2Config.vibe[D0] = 1
  s2Config.open[D0] = 1
  s2Config.vibe[D0_BACK] = 1
  s2Config.point[D0_BACK] = 1
  s2Config.open[D0_BACK] = 1

  const s3Config = emptyConfig(cells)
  for (const [d, open] of [[0, 1], [1, 0], [4, 0], [16, 0]] as const) {
    s3Config.vibe[d] = 1
    s3Config.open[d] = open
  }

  const starts: readonly [string, Configuration][] = [
    ['S0_star24', s0Config],
    ['S1_lone', s1Config],
    ['S2_pairK', s2Config],
    ['S3_chiralX1', s3Config],
  ]

  const readings: StateCuspReading[] = []
  const prevPlace = currentCoinPlace()

  try {
    setCoinPlace('split')
    for (const [name, c0] of starts) {
      for (const rule of ['bare', 'fg'] as const) {
        let s = lockedState(c0)
        // Evolve 1 beat (stays strictly inside B(0, 1) -> 0 frontier hits; S0 has 24 vibes so 1 beat is exact & instant!)
        if (rule === 'fg') {
          const mixed = mergeBranches(s.branches.flatMap(b => mixBranch(cells, cloneBranch(b))))
          s = coinedVetoBeat('none', tables, { branches: mixed }, 0)
        } else {
          s = coinedVetoBeat('none', tables, s, 0)
        }

        const qDock = expectedChargePerDock(s, cells)
        const qTotals: number[] = []
        const qLayers: number[] = []
        const depths: number[] = []

        for (let i = 0; i < info.cusps.length; i++) {
          const lay = isLayer[i]!
          const dep = busemann[i]!
          let qt = 0
          let ql = 0
          let dSum = 0
          for (let x = 0; x < cells; x++) {
            const qx = qDock[x]!
            if (qx === 0) continue
            qt += qx
            if (lay[x]) ql += qx
            dSum += qx * dep[x]!
          }
          qTotals.push(qt)
          qLayers.push(ql)
          depths.push(qt !== 0 ? dSum / qt : 0)
        }

        const qMin = Math.min(...qTotals)
        const qMax = Math.max(...qTotals)
        const qLayerMin = Math.min(...qLayers)
        const qLayerMax = Math.max(...qLayers)
        const depthMin = Math.min(...depths)
        const depthMax = Math.max(...depths)

        // Count distinct (qLayer, depth) profiles rounded to 1e-6
        const profs = new Set<string>()
        for (let i = 0; i < info.cusps.length; i++) {
          profs.add(`${qLayers[i]!.toFixed(5)}|${depths[i]!.toFixed(5)}`)
        }

        readings.push({
          name,
          rule,
          qMin,
          qMax,
          qSpread: qMax - qMin,
          qLayerMin,
          qLayerMax,
          qLayerSpread: qLayerMax - qLayerMin,
          depthMin,
          depthMax,
          depthSpread: depthMax - depthMin,
          distinctOrbits: profs.size,
        })
      }
    }
  } finally {
    setCoinPlace(prevPlace)
  }

  return {
    cuspInfo: {
      count: info.count,
      allNull: info.allNull,
      equalBasePairing: info.equalBasePairing,
      allSixLayerNeighbors: info.allSixLayerNeighbors,
    },
    readings,
  }
}
