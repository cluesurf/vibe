// A CUSP NEIGHBORHOOD of the {3,4,3,4} honeycomb as an instrument for the working rule (item vibe-roadmap-board-0027,
// gates pre-registered in the item's `what` before any rule probe). The mesh is code/substrate/coxeter/exact-cusp.ts:
// the cells near one ideal vertex of the base cell, modulo the label-trivial cusp translations Lambda = 2L Z^3, down to
// a reflecting floor at depth F, all exact in Z[sqrt 2]. What the period and the floor change: note/cusp-neighborhood.md.
//
// G1 structure. The unit translations twist the labels by minus a reflection, so the label-trivial translations are
//    exactly 2 Z^3 (the period is even). Each built mesh: period^3 layer docks of layer degree 6, labels consistent,
//    every dock's Lambda translates on itself, slots facing back or -1 only at the floor, connected, the rule's weave
//    and tables accept it, 18 docks per layer dock at depth 1 and the same depth counts per layer dock at periods 2
//    and 4, the class map mod 2 D4 well defined at period 4, and class(u^2) != 0 on each axis (why a period of 2 mod 4
//    breaks the class map).
// G2 exact against the exact ball, bit for bit. The ball of radius R maps onto the cusp (period 2, floor R) by a
//    covering map with no conflict. With the ball's start, links, layout and store pulled back from the cusp, the two
//    agree after t = 1..R beats at every ball dock within R - t of the base and at depth at most F - t, on the keep and
//    exchange paths with the coin, from the open stand-in vacuum (A) and from one open love in the closed vacuum (B).
//    The compared set is nonempty and changes under (A) at every t, and outside it the two differ at t = R (control).
// G3 reversible over long runs. 96 beats forward and back on period 4, the conserved laws and C every beat, and the
//    superposed lone love back to amplitude 1.
// G4 the floor and the leak. The superposed lone love's weight on the layer, on floor 3 and on the same mesh cut to
//    floors 1 and 2: equal at every t <= F. The leak off the layer at beat 1 is then the honeycomb's own count, not
//    the floor's.
//
// Under keys 3 a dock is a block, never a point: a "center" is the exact vector that addresses the block. Under keys
// 2 the floor is a property of this instrument, never of the present: the present is the whole infinite honeycomb.

import { performance } from 'node:perf_hooks'
import {
  exactCell,
  matrixProduct,
  type ExactMatrix,
} from '@/code/substrate/coxeter/exact-3434'
import {
  buildExactCusp,
  coverBall,
  cuspTranslations,
  restrictTable,
  type ExactCusp,
} from '@/code/substrate/coxeter/exact-cusp'
import {
  exactBallMesh,
  SLOT_CLASS,
} from '@/code/substrate/coxeter/exact-ball-mesh'
import { makeColorWeave, type ColorWeave } from '@/code/rule/color-weave'
import {
  lockedNorm,
  lockedState,
  lockedTables,
  norm,
  sameConfiguration,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { separatedLayout } from '@/code/rule/living-pair-knit'
import { toWords } from '@/code/rule/occupation-veto-knit'
import {
  coinedVetoBeat,
  coinedVetoBeatBack,
} from '@/code/rule/coined-locked-knit'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import {
  baseHub,
  classOf as boxClassOf,
  storeOfKind,
} from '@/code/measure/dense-hub'
import {
  laws,
  vacuumConfiguration,
  THRESHOLD_EXCHANGE,
  THRESHOLD_KEEP,
} from '@/code/measure/doublet-locked-readings'
import { vetoPathRunner } from '@/code/measure/occupation-veto-readings'
import { type Mesh } from '@/code/tool/mesh'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'

const SLOTS = 24
const LINES = 12
const PATHS = [
  ['keep', THRESHOLD_KEEP],
  ['exchange', THRESHOLD_EXCHANGE],
] as const

// ---- the rule's pieces on a mesh ----

type Instrument = {
  readonly mesh: Mesh
  readonly cells: number
  readonly weave: ColorWeave
  readonly links: Int16Array
  readonly tables: LockedTables
  readonly layout: Int8Array
  readonly store: Int8Array
  readonly bijective: boolean
}

function bijectionOf(tables: LockedTables): boolean {
  const seen = new Uint8Array(tables.target.length)

  let ok = true

  for (let i = 0; i < tables.target.length; i++) {
    const t = tables.target[i]!

    ok &&= seen[t] === 0 && tables.source[t] === i
    seen[t] = 1
  }

  return ok
}

// the held (class, line) keys of the box's union store relative to its hub (tmp/union-store-class-probe.ts): the
// stand-in store is that held pattern with every sign +1, read through a dock's class
function standInStore(classOf: Uint8Array): Int8Array {
  const side = 4
  const hub = baseHub(side, 0)
  const boxStore = storeOfKind('union', side, hub)
  const held = new Uint8Array(16 * LINES)

  for (let x = 0; x < side ** 4; x++) {
    const c = boxClassOf(x, side, hub)

    for (let l = 0; l < LINES; l++) {
      if (boxStore[x * LINES + l] !== 0) {
        held[c * LINES + l] = 1
      }
    }
  }

  const baseClass = SLOT_CLASS[LINE_FIRSTS[0]!]!
  const store = new Int8Array(classOf.length * LINES)

  for (let x = 0; x < classOf.length; x++) {
    const c = classOf[x]! ^ baseClass

    for (let l = 0; l < LINES; l++) {
      store[x * LINES + l] = held[c * LINES + l] ? 1 : 0
    }
  }

  return store
}

function instrumentOn(mesh: Mesh, store: Int8Array): Instrument {
  const weave = makeColorWeave({ mesh, table: 'bind' })
  const tables = lockedTables(weave, 'pass')

  return {
    mesh,
    cells: mesh.cellCount,
    weave,
    links: weave.links,
    tables,
    layout: separatedLayout(weave),
    store,
    bijective: bijectionOf(tables),
  }
}

// the instrument on a smaller mesh whose dock c stands for dock oldOf[c] of `big`: the same links (identity on a slot
// that faces out of the smaller mesh), layout and store
function pulledBack(big: Instrument, mesh: Mesh, oldOf: Int32Array): Instrument {
  const weave = makeColorWeave({ mesh, table: 'bind' })
  const cells = mesh.cellCount
  const links = new Int16Array(cells * SLOTS)
  const layout = new Int8Array(cells * LINES)
  const store = new Int8Array(cells * LINES)

  for (let c = 0; c < cells; c++) {
    const o = oldOf[c]!

    for (let d = 0; d < SLOTS; d++) {
      links[c * SLOTS + d] =
        mesh.neighbour(c, d) < 0
          ? weave.moves.identity
          : big.links[o * SLOTS + d]!
    }

    for (let l = 0; l < LINES; l++) {
      layout[c * LINES + l] = big.layout[o * LINES + l]!
      store[c * LINES + l] = big.store[o * LINES + l]!
    }
  }

  const tables = lockedTables(weave, 'pass', links)

  return {
    mesh,
    cells,
    weave,
    links,
    tables,
    layout,
    store,
    bijective: bijectionOf(tables),
  }
}

function pullConfiguration(c: Configuration, oldOf: Int32Array): Configuration {
  const cells = oldOf.length
  const slot = <T extends Int8Array | Uint8Array>(from: T, make: (n: number) => T): T => {
    const out = make(cells * SLOTS)

    for (let x = 0; x < cells; x++) {
      out.set(from.subarray(oldOf[x]! * SLOTS, oldOf[x]! * SLOTS + SLOTS), x * SLOTS)
    }

    return out
  }
  const line = <T extends Int8Array | Uint8Array>(from: T, make: (n: number) => T): T => {
    const out = make(cells * LINES)

    for (let x = 0; x < cells; x++) {
      out.set(from.subarray(oldOf[x]! * LINES, oldOf[x]! * LINES + LINES), x * LINES)
    }

    return out
  }

  return {
    vibe: slot(c.vibe, n => new Int8Array(n)),
    point: slot(c.point, n => new Int8Array(n)),
    open: slot(c.open, n => new Uint8Array(n)),
    store: line(c.store, n => new Int8Array(n)),
    spoint: line(c.spoint, n => new Int8Array(n)),
    sopen: line(c.sopen, n => new Uint8Array(n)),
  }
}

// dock x of a and dock y of b hold the same state, as sameConfiguration reads it
function sameDock(a: Configuration, x: number, b: Configuration, y: number): boolean {
  for (let d = 0; d < SLOTS; d++) {
    const i = x * SLOTS + d
    const j = y * SLOTS + d
    const v = a.vibe[i]!

    if (v !== b.vibe[j]) {
      return false
    }

    if (v !== 0 && (a.point[i] !== b.point[j] || a.open[i] !== b.open[j])) {
      return false
    }
  }

  for (let l = 0; l < LINES; l++) {
    const i = x * LINES + l
    const j = y * LINES + l
    const v = a.store[i]!

    if (v !== b.store[j]) {
      return false
    }

    if (v !== 0 && (a.spoint[i] !== b.spoint[j] || a.sopen[i] !== b.sopen[j])) {
      return false
    }
  }

  return true
}

const openVacuum = (f: Instrument): Configuration =>
  toWords(vacuumConfiguration({ cells: f.cells, store: f.store, layout: f.layout }, 'all'))

function loneLove(f: Instrument): Configuration {
  const c = toWords(vacuumConfiguration({ cells: f.cells, store: f.store, layout: f.layout }, 'none'))

  c.vibe[0] = 1
  c.open[0] = 1

  return c
}

// ---- G1: the class of u^2 on each axis, from the exact frames ----

function axisClasses(): { squareClass: number[]; found: boolean } {
  const cell = exactCell()
  const t = cuspTranslations(cell)
  const same = (a: ExactMatrix, b: ExactMatrix): boolean => a.every((v, i) => v === b[i])
  let found = true
  const squareClass = t.axes.map(({ translation }) => {
    const u2 = matrixProduct(translation, translation)

    for (let a = 0; a < SLOTS; a++) {
      for (let b = 0; b < SLOTS; b++) {
        if (same(matrixProduct(cell.transports[a]!, cell.transports[b]!), u2)) {
          return SLOT_CLASS[a]! ^ SLOT_CLASS[b]!
        }
      }
    }

    found = false

    return -1
  })

  return { squareClass, found }
}

// ---- G4: the exact open-vibe weight on the layer, as a fraction over 4^K ----

function layerWeight(
  s: LockedState,
  onLayer: (dock: number) => boolean,
): { num: bigint; den: bigint; oddBranches: number } {
  const K = Math.max(0, ...s.branches.map(b => b.k))

  let num = 0n
  let oddBranches = 0

  for (const b of s.branches) {
    let open = 0
    let layer = 0

    for (let i = 0; i < b.vibe.length; i++) {
      if (b.vibe[i] !== 0 && b.open[i]) {
        open++
        layer += onLayer(Math.floor(i / SLOTS)) ? 1 : 0
      }
    }

    oddBranches += open === 1 ? 0 : 1
    num += BigInt(layer) * norm(b.a, b.b) * (1n << BigInt(2 * (K - b.k)))
  }

  return { num, den: 1n << BigInt(2 * K), oddBranches }
}

const sameFraction = (p: { num: bigint; den: bigint }, q: { num: bigint; den: bigint }): boolean =>
  p.num * q.den === q.num * p.den

const asNumber = (p: { num: bigint; den: bigint }): number =>
  Number((p.num * 1000000000n) / p.den) / 1e9

// ---- the run ----

export type CuspOptions = {
  // the ball of G2 (the floor is the same), 3 on the laptop and 4 on the M3
  radius: number
  // the floor of G3's period-4 run, 2 on the laptop and 3 on the M3
  reversalFloor: number
  // G3's superposed lone love (laptop size only)
  superposed: boolean
  beats: number
}

export const LAPTOP: CuspOptions = { radius: 3, reversalFloor: 2, superposed: true, beats: 96 }
export const FULL: CuspOptions = { radius: 4, reversalFloor: 3, superposed: false, beats: 96 }

export function cuspNeighborhood(options: CuspOptions): Verdict {
  const started = performance.now()
  const seconds = (): number => Number(((performance.now() - started) / 1000).toFixed(1))
  const log = (line: string): void => console.error(`${line} (${seconds()} s)`)
  const R = options.radius

  // ---- G1 ----
  const translations = cuspTranslations()
  const translationsOk = Object.values(translations.gates).every(Boolean)
  const { squareClass, found } = axisClasses()
  const squareClassesNonzero = found && squareClass.every(c => c > 0)
  const cusp2 = buildExactCusp({ period: 2, floor: R })

  log(`cusp period 2 floor ${R}: ${cusp2.cells} docks, depth counts ${cusp2.depthCounts.join(', ')}, margin ${cusp2.margin.toExponential(2)}`)

  const cusp4 = buildExactCusp({ period: 4, floor: options.reversalFloor })

  log(`cusp period 4 floor ${options.reversalFloor}: ${cusp4.cells} docks, depth counts ${cusp4.depthCounts.join(', ')}, class conflicts ${cusp4.classConflicts}`)

  const perLayer = (c: ExactCusp): number[] => c.depthCounts.map(n => n / c.period ** 3)
  const p2 = perLayer(cusp2)
  const p4 = perLayer(cusp4)
  const depthCountsAgree = p4.every((v, d) => v === p2[d])
  const depthOne = p2[1] === 18 && p4[1] === 18
  const meshGates = [cusp2, cusp4].every(c => Object.values(c.gates).every(Boolean))

  const big = instrumentOn(cusp2.mesh, standInStore(cusp2.classOf))
  const four = instrumentOn(cusp4.mesh, standInStore(cusp4.classOf))

  log(`instruments built: bijective ${big.bijective} ${four.bijective}`)

  const g1 =
    translationsOk &&
    squareClassesNonzero &&
    meshGates &&
    depthCountsAgree &&
    depthOne &&
    cusp4.classConflicts === 0 &&
    big.bijective &&
    four.bijective

  // ---- G2 ----
  const ball = exactBallMesh({ radius: R })
  const cover = coverBall(ball.ball.table, cusp2.table)
  const pi = cover.pi
  const ballDistance = ball.ball.distance
  const small = pulledBack(big, ball.mesh, pi)
  const compared: number[][] = []

  for (let t = 1; t <= R; t++) {
    const set: number[] = []

    for (let c = 0; c < ball.cells; c++) {
      if (ballDistance[c]! <= R - t && cusp2.depth[pi[c]!]! <= R - t) {
        set.push(c)
      }
    }

    compared.push(set)
  }

  log(`ball R=${R}: ${ball.cells} docks, cover conflicts ${cover.conflicts}, missing ${cover.missing}, compared sets ${compared.map(s => s.length).join(', ')}`)

  let mismatches = 0
  let unchangedBeats = 0
  let controlOutside = 0
  const g2Rows: string[] = []

  for (const [startName, startOf] of [
    ['A', openVacuum],
    ['B', loneLove],
  ] as const) {
    const cuspStart = startOf(big)
    const ballStart = pullConfiguration(cuspStart, pi)

    for (const [name, threshold] of PATHS) {
      const onCusp = vetoPathRunner('none', big.tables, cuspStart, threshold, 0, true)
      const onBall = vetoPathRunner('none', small.tables, ballStart, threshold, 0, true)

      for (let t = 1; t <= R; t++) {
        onCusp.beat()
        onBall.beat()

        const s = onCusp.state()
        const b = onBall.state()
        const set = compared[t - 1]!

        let off = 0
        let changed = 0

        for (const c of set) {
          off += sameDock(b, c, s, pi[c]!) ? 0 : 1
          changed += sameDock(cuspStart, pi[c]!, s, pi[c]!) ? 0 : 1
        }

        mismatches += off

        if (startName === 'A' && changed === 0) {
          unchangedBeats++
        }

        if (startName === 'A' && t === R) {
          for (let c = 0; c < ball.cells; c++) {
            controlOutside += sameDock(b, c, s, pi[c]!) ? 0 : 1
          }
        }

        g2Rows.push(`${startName}/${name} t=${t}: ${off} of ${set.length} off, ${changed} changed`)
      }
    }
  }

  log(`G2: ${g2Rows.join('; ')}; control (A, t=${R}, whole ball) ${controlOutside} docks differ`)

  const g2 =
    cover.conflicts === 0 &&
    cover.missing === 0 &&
    compared.every(s => s.length > 0) &&
    mismatches === 0 &&
    unchangedBeats === 0 &&
    controlOutside > 0 &&
    small.bijective

  // ---- G3 ----
  let lawBreaks = 0
  let cBreaks = 0
  let notBack = 0
  const beatSeconds: number[] = []

  for (const [, threshold] of PATHS) {
    const vacuum = openVacuum(four)
    const conjugate = toWords(
      vacuumConfiguration(
        { cells: four.cells, store: Int8Array.from(four.store, v => -v), layout: four.layout },
        'all',
      ),
    )
    const run = vetoPathRunner('none', four.tables, vacuum, threshold, 0, true)
    const crun = vetoPathRunner('none', four.tables, conjugate, threshold, 0, true)
    const l0 = laws(vacuum)
    const t0 = performance.now()

    for (let t = 0; t < options.beats; t++) {
      run.beat()
      crun.beat()

      const s = run.state()
      const c = crun.state()
      const l = laws(s)

      lawBreaks += l[0] !== l0[0] || l[1] !== l0[1] ? 1 : 0

      let off = 0

      for (let i = 0; i < s.vibe.length && off === 0; i++) {
        off +=
          s.vibe[i] !== -c.vibe[i]! || (s.vibe[i] !== 0 && s.point[i] !== c.point[i]) ? 1 : 0
      }

      for (let i = 0; i < s.store.length && off === 0; i++) {
        off +=
          s.store[i] !== -c.store[i]! || (s.store[i] !== 0 && s.spoint[i] !== c.spoint[i]) ? 1 : 0
      }

      cBreaks += off > 0 ? 1 : 0
    }

    beatSeconds.push((performance.now() - t0) / 1000 / options.beats / 2)

    for (let t = 0; t < options.beats; t++) {
      run.back()
    }

    notBack += sameConfiguration(run.state(), vacuum) ? 0 : 1
  }

  log(`G3 paths on period 4 floor ${options.reversalFloor}, ${options.beats} beats: law breaks ${lawBreaks}, C breaks ${cBreaks}, not back ${notBack}, s per beat ${beatSeconds.map(s => s.toFixed(3)).join(' ')}`)

  let superposedOk = true
  let superposedTerms = 0

  if (options.superposed) {
    const start = loneLove(four)
    const s0 = lockedState(start)
    let s = s0
    let normExact = true

    for (let t = 0; t < 6; t++) {
      s = coinedVetoBeat('none', four.tables, s, t)

      const n = lockedNorm(s)

      normExact &&= n.total === n.unit
      superposedTerms = Math.max(superposedTerms, s.branches.length)
    }

    for (let t = 5; t >= 0; t--) {
      s = coinedVetoBeatBack('none', four.tables, s, t)
    }

    const b0 = s.branches[0]

    superposedOk =
      normExact &&
      s.branches.length === 1 &&
      !!b0 &&
      b0.a === 1n &&
      b0.b === 0n &&
      b0.k === 0 &&
      sameConfiguration(b0, start)

    log(`G3 superposed lone love 6 beats: most terms ${superposedTerms}, back to amplitude 1 and norm exact ${superposedOk}`)
  }

  const g3 = lawBreaks === 0 && cBreaks === 0 && notBack === 0 && four.bijective && superposedOk

  // ---- G4: floors 1, 2, 3 on period 2 ----
  const leakCusp = R === 3 ? cusp2 : buildExactCusp({ period: 2, floor: 3 })
  const leakBig = R === 3 ? big : instrumentOn(leakCusp.mesh, standInStore(leakCusp.classOf))
  const weights: { num: bigint; den: bigint }[][] = []
  let oddBranches = 0

  for (const floor of [1, 2, 3]) {
    const cut =
      floor === 3
        ? undefined
        : restrictTable(leakCusp.table, x => leakCusp.depth[x]! <= floor)
    const f = cut ? pulledBack(leakBig, cut.mesh, cut.oldOf) : leakBig
    const depthOf = (x: number): number => leakCusp.depth[cut ? cut.oldOf[x]! : x]!
    let s = lockedState(loneLove(f))
    const row: { num: bigint; den: bigint }[] = []

    for (let t = 0; t < 6; t++) {
      s = coinedVetoBeat('none', f.tables, s, t)

      const w = layerWeight(s, x => depthOf(x) === 0)

      oddBranches += w.oddBranches
      row.push(w)
    }

    weights.push(row)
  }

  let floorDifferences = 0
  const departs: number[] = []

  for (const [i, floor] of [1, 2].entries()) {
    let first = 0

    for (let t = 1; t <= 6; t++) {
      const same = sameFraction(weights[i]![t - 1]!, weights[2]![t - 1]!)

      if (t <= floor && !same) {
        floorDifferences++
      }

      if (!same && first === 0) {
        first = t
      }
    }

    departs.push(first)
  }

  const layerSeries = weights[2]!.map(asNumber)

  log(`G4 layer weight on floor 3: ${layerSeries.join(', ')}; floor 1 ${weights[0]!.map(asNumber).join(', ')}; floor 2 ${weights[1]!.map(asNumber).join(', ')}; differences at t <= F ${floorDifferences}; departs at ${departs.join(', ')} (0: never within 6)`)

  const g4 = floorDifferences === 0

  const solved = g1 && g2 && g3 && g4

  return verdict({
    status: solved ? 'pass' : 'fail',
    claim: `a cusp neighborhood of the {3,4,3,4} honeycomb, exact in Z[sqrt 2], runs the working rule: the unit cusp translations twist the labels by minus a reflection, so only 2 Z^3 keeps them and the period is even (a multiple of 4 also keeps the class map mod 2 D4), the quotient by 2L Z^3 down to a reflecting floor at depth F is a 24-slot mesh the rule accepts with a bijective stream, it equals the exact ball bit for bit on every dock at depth at most F - t for t up to ${R} on the keep and exchange paths with the coin from the open vacuum and from a lone love, it runs ${options.beats} beats forward and back exactly with charge, count and C kept, and the lone love's weight on the layer does not depend on the floor while t <= F, so the layer's leak into depth is the honeycomb's own, not the floor's`,
    metrics: {
      docksPerLayerDockDepth0: p2[0] ?? 0,
      docksPerLayerDockDepth1: p2[1] ?? 0,
      docksPerLayerDockDepth2: p2[2] ?? 0,
      docksPerLayerDockDepth3: p2[3] ?? 0,
      docksPerLayerDockDepth4: p2[4] ?? 0,
      cuspPeriod2Docks: cusp2.cells,
      cuspPeriod4Docks: cusp4.cells,
      period4Floor: options.reversalFloor,
      period4ClassConflicts: cusp4.classConflicts,
      period2ClassConflicts: cusp2.classConflicts,
      squareClassAxis0: squareClass[0] ?? -1,
      squareClassAxis1: squareClass[1] ?? -1,
      squareClassAxis2: squareClass[2] ?? -1,
      boxMargin: cusp2.margin,
      ballRadius: R,
      ballDocks: ball.cells,
      coverConflicts: cover.conflicts,
      coverMissing: cover.missing,
      comparedAtLastBeat: compared[R - 1]!.length,
      comparedAtFirstBeat: compared[0]!.length,
      g2Mismatches: mismatches,
      g2UnchangedBeats: unchangedBeats,
      reversalBeats: options.beats,
      lawBreaks,
      cBreaks,
      notBack,
      superposedTerms,
      secondsPerBeatPeriod4: Number(Math.max(...beatSeconds).toFixed(4)),
      layerWeightBeat1: layerSeries[0] ?? -1,
      layerWeightBeat2: layerSeries[1] ?? -1,
      layerWeightBeat3: layerSeries[2] ?? -1,
      layerWeightBeat6: layerSeries[5] ?? -1,
      floor1Departs: departs[0] ?? -1,
      floor2Departs: departs[1] ?? -1,
      floorDifferences,
      leakOddBranches: oddBranches,
      seconds: seconds(),
    },
    control: {
      ballDocksDifferingOutsideComparedSet: controlOutside,
      period2ClassConflicts: cusp2.classConflicts,
    },
    notes:
      'L1 (an instrument, exact). Gates pre-registered in vibe-roadmap-board-0027 before any rule probe. The period is exact for every beat on Lambda-periodic states (the quotient is the honeycomb run on the periodic lift), the floor reflects, so a dock at depth d reads the infinite honeycomb only for t <= F - d. The stand-in store (held pattern of the union store, signs +1) is not the working vacuum (item vibe-roadmap-honeycomb-0002). Period 2 is used for the ball comparison since equality holds for any period; its class map is not defined (period 2 mod 4), so its store is the breadth-first class pattern, pulled back to the ball unchanged. See note/cusp-neighborhood.md.',
  })
}

export default experiment({
  id: 'geometry/cusp-neighborhood',
  code: 'E-GMT-0041',
  title:
    'a cusp neighborhood of the {3,4,3,4} honeycomb in exact Z[sqrt 2]: the cusp translations twist the labels unless even, the quotient by 2L Z^3 above a reflecting floor runs the working rule exactly reversibly and equals the exact ball bit for bit while t <= F - depth, and the layer leak does not depend on the floor',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return cuspNeighborhood(FULL)
  },
})
