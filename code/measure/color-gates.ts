// THE TWO COLOUR GATES ON A STATIC Sigma(648) FIELD (moving-matter item 0055, decision 012 point 4, the MVP of route 2:
// colour with an action). A field is one Sigma(648) element per directed link of R*'s 24 D4 links, a link's reverse its
// inverse. Three reads, each on the box its reference experiment used:
//
//   W  the walls: the coloured chiral slab 8^3 x L (code/measure/color-slab, E-FRC-0294) at L 8 and 12, every level within
//      0.2 of pi (a Chebyshev-filtered block resolved on U, confirmed by Lanczos only when its window is empty), each level's
//      weight on the two six-class wall windows, and the count within 0.1 with that weight at least 0.9; plus the side-8
//      bulk box (no walls, Wilson set and plain set): its levels within 0.2 and its nearest level
//   C  the caging: E-SPN-0196's read exactly (code/measure/holonomy-caging): side 20, 64 beats, the rest-band packet
//      (sigma 1, register mode 0, role 0), mixer ringUnit(-1, 4), speed = the rms slope over beats 16 to 64, ratio =
//      speed of the triplet carriage on the field over the trivial carriage's, caged below 0.9
//   P  the mean triangle plaquette Re Tr U / 3 over every D4 triangle (roots a, b with a + b = c a root: the holonomy
//      R(x, c)^-1 R(x + r_a, b) R(x, a)), with the histogram of its Sigma(648) conjugacy class
//
// The field is given as a function of the box (each box has its own link numbering), so a rule-made field (R*'s lifted
// hash), the identity, a gauge transform or a heat-bath sample are all one shape. Elements are indices into gridLifts()
// (holonomy-caging), so the group algebra (products, inverses, classes) is read from an index table built once.
//
// DETERMINISM: no random numbers. A gauge transform's elements are an integer Weyl stream (vibe-weave linkStart). FLOAT:
// the exact Q(zeta_9) lifts as floats; the product table is matched to the element list (gap reported).

import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { linkStart } from '@/code/rule/vibe-weave'
import { makeColorWeave, type ColorWeave } from '@/code/rule/color-weave'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { chiralSlab } from '@/code/measure/anomaly-matching-walls'
import {
  bulkBox,
  colorClusterU,
  colorLevelsNearPi,
  colorOp,
  colorPieces,
  depthShare,
  dockWeights,
  linksOf,
  slabBox,
  slabWeave,
  wallWindows,
  type ClusterOptions,
  type ClusterPassU,
  type ColorBox,
  type ColorOp,
  type ColorPieces,
} from '@/code/measure/color-slab'
import {
  cagingBeat,
  cagingEngine,
  cloneState,
  gridLifts,
  offsetDistances,
  offsetOf,
  restPacket,
  roleLinks,
  slope,
  spreadRead,
  trivialRole,
  type GridLifts,
  type RoleLinks,
  type Section,
  type SpreadRead,
} from '@/code/measure/holonomy-caging'

const SLOTS = 24
const ORDER = 648

// ---- the group as an index table ----

export type SigmaTable = {
  lifts: GridLifts
  // mul[a * 648 + b]: the index of elements[a] elements[b]
  mul: Int16Array
  inverse: Int32Array
  identity: number
  // Re Tr / 3 of each element
  reTr: Float64Array
  // the conjugacy class of each element, and each class's order, size and trace
  classOf: Int16Array
  classes: { order: number; size: number; re: number; im: number }[]
  // the largest float gap of a product against the element it was matched to
  tableGap: number
}

let table: SigmaTable | undefined

const keyOf = (m: Float64Array, o = 0): string =>
  Array.from({ length: 18 }, (_, i) => Math.round(m[o + i]! * 1e6) / 1e6 + 0).join(',')

function mul3(a: Float64Array, b: Float64Array): Float64Array {
  const out = new Float64Array(18)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let r = 0
      let m = 0

      for (let l = 0; l < 3; l++) {
        const xr = a[2 * (3 * i + l)]!
        const xi = a[2 * (3 * i + l) + 1]!
        const yr = b[2 * (3 * l + j)]!
        const yi = b[2 * (3 * l + j) + 1]!

        r += xr * yr - xi * yi
        m += xr * yi + xi * yr
      }

      out[2 * (3 * i + j)] = r
      out[2 * (3 * i + j) + 1] = m
    }
  }

  return out
}

export function sigmaTable(): SigmaTable {
  if (table) {
    return table
  }

  const lifts = gridLifts()
  const f = lifts.floats
  const index = new Map(f.map((m, i) => [keyOf(m), i]))
  const mul = new Int16Array(ORDER * ORDER)

  let tableGap = 0

  for (let a = 0; a < ORDER; a++) {
    for (let b = 0; b < ORDER; b++) {
      const p = mul3(f[a]!, f[b]!)
      const e = index.get(keyOf(p))

      if (e === undefined) {
        throw new Error(`sigmaTable: product ${a} ${b} is not an element`)
      }

      for (let i = 0; i < 18; i++) {
        tableGap = Math.max(tableGap, Math.abs(p[i]! - f[e]![i]!))
      }

      mul[a * ORDER + b] = e
    }
  }

  const identity = f.findIndex(m =>
    m.every((v, i) => Math.abs(v - ([0, 8, 16].includes(i) ? 1 : 0)) < 1e-12),
  )
  const reTr = Float64Array.from(f, m => (m[0]! + m[8]! + m[16]!) / 3)
  const classOf = new Int16Array(ORDER).fill(-1)
  const classes: SigmaTable['classes'] = []
  const inverse = lifts.inverse

  for (let e = 0; e < ORDER; e++) {
    if (classOf[e]! >= 0) {
      continue
    }

    const c = classes.length
    let size = 0

    for (let g = 0; g < ORDER; g++) {
      const h = mul[mul[g * ORDER + e]! * ORDER + inverse[g]!]!

      if (classOf[h]! < 0) {
        classOf[h] = c
        size++
      }
    }

    let order = 1
    let p = e

    while (p !== identity) {
      p = mul[p * ORDER + e]!
      order++
    }

    const m = f[e]!

    classes.push({ order, size, re: m[0]! + m[8]! + m[16]!, im: m[1]! + m[9]! + m[17]! })
  }

  table = { lifts, mul, inverse, identity, reTr, classOf, classes, tableGap }

  return table
}

// ---- the fields ----

// 'slab' the 8^3 x L slab (slabBox), 'bulk' a side^4 box (bulkBox, the weave's own box: W's bulk read and C's box)
export type BoxKind = 'slab' | 'bulk'

export type ColorField = {
  name: string
  // the element index (into gridLifts().elements) of every directed link slot x * 24 + d, reverse = inverse
  on: (box: ColorBox, kind: BoxKind) => Int32Array
}

const sideOf = (box: ColorBox): number => Math.round(box.cells ** 0.25)

export const identityField: ColorField = {
  name: 'identity',
  on: box => new Int32Array(box.cells * SLOTS).fill(sigmaTable().identity),
}

// R*'s own lifted hash: the weave's integer Weyl link start (vibe-weave linkStart) lifted to Sigma(648) by a section,
// E-SPN-0132's field as E-SPN-0196 (side^4 boxes) and E-FRC-0294 (the slab) read it
export function ruleField(section: Section): ColorField {
  return {
    name: `rule-${section}`,
    on: (box, kind) => {
      const { lifts } = sigmaTable()

      if (kind === 'bulk') {
        const weave = makeColorWeave({ side: sideOf(box), table: 'bind' })

        return roleLinks(weave, weave.links, lifts, section).link
      }

      const w = slabWeave(box)

      return roleLinks(w as unknown as ColorWeave, w.links, lifts, section).link
    },
  }
}

// a site-wise gauge transform R'(x, d) = g(x + r_d) R(x, d) g(x)^-1, g(x) element linkStart(x, 648, offset)
export function gaugeField(base: ColorField, offset: number): ColorField {
  return {
    name: `${base.name}-gauge-${offset}`,
    on: (box, kind) => {
      const t = sigmaTable()
      const link = base.on(box, kind)
      const out = new Int32Array(link.length)
      const g = (x: number): number => linkStart(x, ORDER, offset)

      for (let x = 0; x < box.cells; x++) {
        const gi = t.inverse[g(x)]!

        for (let d = 0; d < SLOTS; d++) {
          const l = x * SLOTS + d
          const left = t.mul[g(box.nb[l]!) * ORDER + link[l]!]!

          out[l] = t.mul[left * ORDER + gi]!
        }
      }

      return out
    },
  }
}

// the largest reverse-is-inverse failure of a field on a box (an index check, exact)
export function reverseGap(box: ColorBox, link: Int32Array): number {
  const t = sigmaTable()

  let bad = 0

  for (let x = 0; x < box.cells; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const l = x * SLOTS + d

      if (t.mul[link[box.nb[l]! * SLOTS + OPPOSITE[d]!]! * ORDER + link[l]!] !== t.identity) {
        bad++
      }
    }
  }

  return bad
}

// ---- P: the triangle plaquette ----

// (a, b, c) slots with r_a + r_b = r_c
export const TRIANGLES: readonly (readonly [number, number, number])[] = (() => {
  const out: [number, number, number][] = []

  for (let a = 0; a < SLOTS; a++) {
    for (let b = 0; b < SLOTS; b++) {
      const s = DOCK_ROOTS[a]!.map((v, i) => v + DOCK_ROOTS[b]![i]!)
      const c = DOCK_ROOTS.findIndex(r => r.every((v, i) => v === s[i]))

      if (c >= 0) {
        out.push([a, b, c])
      }
    }
  }

  return out
})()

export type PlaquetteRead = {
  // the mean of Re Tr U / 3 over every oriented triangle (each unoriented triangle 6 times, the same value each)
  mean: number
  triangles: number
  // counts per conjugacy class index (sigmaTable().classes)
  histogram: number[]
}

export function plaquetteRead(box: ColorBox, link: Int32Array): PlaquetteRead {
  const t = sigmaTable()
  const histogram = Array<number>(t.classes.length).fill(0)

  let sum = 0
  let n = 0

  for (let x = 0; x < box.cells; x++) {
    for (const [a, b, c] of TRIANGLES) {
      const la = link[x * SLOTS + a]!
      const lb = link[box.nb[x * SLOTS + a]! * SLOTS + b]!
      const lc = link[x * SLOTS + c]!
      const h = t.mul[t.inverse[lc]! * ORDER + t.mul[lb * ORDER + la]!]!

      sum += t.reTr[h]!
      histogram[t.classOf[h]!]!++
      n++
    }
  }

  return { mean: sum / n, triangles: n, histogram }
}

// ---- W: the walls ----

export type GatesPlan = {
  side: number
  Ls: number[]
  near: number
  far: number
  wallShare: number
  pairs: number
  krylov: number
  cluster: Omit<ClusterOptions, 'window'>
  cage: { side: number; beats: number; fitFrom: number; sigma: number }
  cagedBelow: number
}

export const GATES_PLAN: GatesPlan = {
  side: 8,
  Ls: [8, 12],
  near: 0.1,
  far: 0.2,
  wallShare: 0.9,
  pairs: 24,
  krylov: 160,
  cluster: { block: 32, degree: 40, cut: 0.4, maxPasses: 4, tol: 1e-11 },
  cage: { side: 20, beats: 64, fitFrom: 16, sigma: 1 },
  cagedBelow: 0.9,
}

type Shared = { pieces: ColorPieces; profile: (L: number) => number[] }

let shared: Shared | undefined

function sharedOf(): Shared {
  if (!shared) {
    const cs = chiralSlab(8)

    shared = {
      pieces: colorPieces(cs.sets[0]!, cs.ranges[0]!.sR, cs.ranges[0]!.dR),
      profile: L => [...chiralSlab(L).slab.profile],
    }
  }

  return shared
}

const fieldLinks = (box: ColorBox, link: Int32Array) =>
  linksOf(box, { k: 3, mats: sigmaTable().lifts.floats, link })

export type WindowLevel = { offset: number; wall: number }

export type SlabWallRead = {
  L: number
  // every level within `far`, with its wall-window weight
  levels: WindowLevel[]
  // within `near` with wall weight >= wallShare; within `far` (any weight)
  near: number
  far: number
  // the nearest level's distance from pi (the least |offset| when a level is in the window, else Lanczos's top Ritz)
  nearest: number
  nearestResidual: number
  blockCount: number
  krylovCount: number | undefined
  complete: boolean
  eigenResidual: number
  plaquette: PlaquetteRead
  reverseBad: number
  seconds: number
  // the block read on U (color-slab colorClusterU, item 0072): its passes, guard (least |offset| outside the window),
  // window residual and per-pass history
  passes: number
  guard: number
  blockResidual: number
  history: ClusterPassU[]
}

function wallShareOf(op: ColorOp, L: number, v: Parameters<typeof dockWeights>[1]): number {
  const w = wallWindows(L)

  return depthShare(op, dockWeights(op, v), new Set([...w.a, ...w.b]))
}

export function slabWallRead(field: ColorField, plan: GatesPlan, L: number): SlabWallRead {
  const started = Date.now()
  const { pieces, profile } = sharedOf()
  const box = slabBox(plan.side, L)
  const link = field.on(box, 'slab')
  const op = colorOp(box, fieldLinks(box, link), pieces, profile(L))
  const cl = colorClusterU(op, { ...plan.cluster, window: plan.far })

  // the block is resolved on U (item 0072): a non-empty complete block is complete whatever its count. Lanczos (on A,
  // blind inside a cluster near pi: traps.md 2026-10-09) runs only to confirm an EMPTY block window, which passes the
  // block's residual test vacuously (color-slab traps)
  const blockOk = cl.complete
  const kr = cl.levels.length > 0 ? undefined : colorLevelsNearPi(op, plan.far, plan.krylov)
  const levelsRaw = kr ? kr.levels : cl.levels
  const levels = levelsRaw
    .map(l => ({ offset: l.offset, wall: wallShareOf(op, L, l.vector) }))
    .sort((a, b) => Math.abs(a.offset) - Math.abs(b.offset))
  // an empty block window is complete only when Lanczos also finds none
  const complete = kr ? kr.complete && kr.levels.length === 0 && kr.eigenResidual <= 1e-9 : blockOk

  return {
    L,
    levels,
    near: levels.filter(l => Math.abs(l.offset) < plan.near && l.wall >= plan.wallShare).length,
    far: levels.length,
    nearest: levels.length > 0 ? Math.abs(levels[0]!.offset) : kr!.nearest,
    nearestResidual: levels.length > 0 ? (kr ? kr.eigenResidual : cl.eigenResidual) : kr!.nearestResidual,
    blockCount: cl.levels.length,
    krylovCount: kr?.levels.length,
    complete,
    eigenResidual: kr ? kr.eigenResidual : cl.eigenResidual,
    plaquette: plaquetteRead(box, link),
    reverseBad: reverseGap(box, link),
    seconds: (Date.now() - started) / 1000,
    passes: cl.passes,
    guard: cl.guard,
    blockResidual: cl.eigenResidual,
    history: cl.history,
  }
}

export type BulkWallRead = {
  // per set (plain, Wilson): levels within `far`, the nearest distance and its residual
  sets: { set: 'plain' | 'wilson'; count: number; nearest: number; nearestResidual: number; complete: boolean }[]
  nearest: number
  count: number
  plaquette: PlaquetteRead
  reverseBad: number
  seconds: number
}

export function bulkWallRead(field: ColorField, plan: GatesPlan): BulkWallRead {
  const started = Date.now()
  const { pieces } = sharedOf()
  const box = bulkBox(plan.side)
  const link = field.on(box, 'bulk')
  const links = fieldLinks(box, link)
  const sets = (['plain', 'wilson'] as const).map((set, i) => {
    const r = colorLevelsNearPi(colorOp(box, links, pieces, [i]), plan.far, plan.krylov)
    const nearest =
      r.levels.length > 0 ? Math.min(...r.levels.map(l => Math.abs(l.offset))) : r.nearest

    return {
      set,
      count: r.levels.length,
      nearest,
      nearestResidual: r.levels.length > 0 ? r.eigenResidual : r.nearestResidual,
      complete: r.complete,
    }
  })

  return {
    sets,
    nearest: Math.min(...sets.map(s => s.nearest)),
    count: sets.reduce((t, s) => t + s.count, 0),
    plaquette: plaquetteRead(box, link),
    reverseBad: reverseGap(box, link),
    seconds: (Date.now() - started) / 1000,
  }
}

// ---- C: the caging ----

export type CageRead = {
  speedT: number
  speedC: number
  ratio: number
  alphaC: number
  rmsT: number[]
  rmsC: number[]
  boxRms: number
  // the free run unsaturated (E-SPN-0196's S): rising over every 8-beat window and below 0.85 of the box rms at the end
  unsaturated: boolean
  normDrift: number
  // the ratio with the probability summed over the three role starts (the role trace: exactly gauge invariant)
  ratioRoleTrace?: number
  plaquette: PlaquetteRead
  reverseBad: number
  meshMatch: boolean
  seconds: number
}

type CageBox = {
  box: ColorBox
  weave: ColorWeave
  r2: Float64Array
  boxRms: number
  dockOffset: Int32Array
  meshMatch: boolean
}

const cageBoxes = new Map<number, CageBox>()

function cageBoxOf(side: number): CageBox {
  if (!cageBoxes.has(side)) {
    const box = bulkBox(side)
    const weave = makeColorWeave({ side, table: 'bind' })
    const r2 = offsetDistances(side)
    let meshMatch = weave.mesh.cellCount === box.cells

    for (let x = 0; x < box.cells && meshMatch; x++) {
      for (let d = 0; d < SLOTS; d++) {
        if (weave.mesh.neighbour(x, d) !== box.nb[x * SLOTS + d]) {
          meshMatch = false
        }
      }
    }

    cageBoxes.set(side, {
      box,
      weave,
      r2,
      boxRms: Math.sqrt(r2.reduce((a, b) => a + b, 0) / r2.length),
      dockOffset: Int32Array.from({ length: box.cells }, (_, x) => offsetOf(side, x, 0)),
      meshMatch,
    })
  }

  return cageBoxes.get(side)!
}

const memberU = (): [number, number] => {
  const th = unitAngle(ringUnit(-1, 4))

  return [Math.cos(th), Math.sin(th)]
}

// one carriage's rms per beat, summed over the given role starts' probabilities
function track(cb: CageBox, role: RoleLinks, plan: GatesPlan, starts: readonly number[]): { rms: number[]; drift: number } {
  const u = memberU()
  const E = cagingEngine(cb.weave, role, u)
  const m2 = Array<number>(plan.cage.beats + 1).fill(0)
  const norm = Array<number>(plan.cage.beats + 1).fill(0)

  for (const r of starts) {
    const start = restPacket({
      side: sideOf(cb.box),
      k: role.k,
      x0: 0,
      sigma: plan.cage.sigma,
      register: 0,
      role: r,
      r2: cb.r2,
    })

    let s = cloneState(start)

    for (let b = 0; b <= plan.cage.beats; b++) {
      const read: SpreadRead = spreadRead({
        side: sideOf(cb.box),
        k: role.k,
        x0: 0,
        r2: cb.r2,
        start,
        s,
        dockOffset: cb.dockOffset,
      })

      m2[b]! += read.rms ** 2 * read.norm
      norm[b]! += read.norm

      if (b < plan.cage.beats) {
        s = cagingBeat(E, s, b)
      }
    }
  }

  return {
    rms: m2.map((v, b) => Math.sqrt(v / norm[b]!)),
    drift: Math.max(...norm.map(v => Math.abs(v / starts.length - 1))),
  }
}

const trivialTracks = new Map<string, { rms: number[]; drift: number }>()

function trivialTrack(cb: CageBox, plan: GatesPlan): { rms: number[]; drift: number } {
  const key = `${plan.cage.side}-${plan.cage.beats}-${plan.cage.sigma}`

  if (!trivialTracks.has(key)) {
    trivialTracks.set(key, track(cb, trivialRole(cb.box.cells), plan, [0]))
  }

  return trivialTracks.get(key)!
}

const fitBeats = (plan: GatesPlan): number[] =>
  Array.from({ length: plan.cage.beats - plan.cage.fitFrom + 1 }, (_, i) => plan.cage.fitFrom + i)

export function cageRead(field: ColorField, plan: GatesPlan, roleTrace = false): CageRead {
  const started = Date.now()
  const cb = cageBoxOf(plan.cage.side)
  const link = field.on(cb.box, 'bulk')
  const role: RoleLinks = { k: 3, mats: sigmaTable().lifts.floats, link }
  const T = trivialTrack(cb, plan)
  const C = track(cb, role, plan, [0])
  const xs = fitBeats(plan)
  const speedT = slope(xs, xs.map(b => T.rms[b]!))
  const speedC = slope(xs, xs.map(b => C.rms[b]!))
  const windows = xs.filter(b => (b - plan.cage.fitFrom) % 8 === 0 && b + 8 <= plan.cage.beats)
  const rising = windows.every(b => T.rms[b + 8]! > T.rms[b]!)
  const RT = roleTrace ? track(cb, role, plan, [0, 1, 2]) : undefined

  return {
    speedT,
    speedC,
    ratio: speedC / speedT,
    alphaC: slope(xs.map(Math.log), xs.map(b => Math.log(C.rms[b]!))),
    rmsT: T.rms,
    rmsC: C.rms,
    boxRms: cb.boxRms,
    unsaturated: rising && T.rms[plan.cage.beats]! < 0.85 * cb.boxRms,
    normDrift: Math.max(T.drift, C.drift, RT ? RT.drift : 0),
    ratioRoleTrace: RT ? slope(xs, xs.map(b => RT.rms[b]!)) / speedT : undefined,
    plaquette: plaquetteRead(cb.box, link),
    reverseBad: reverseGap(cb.box, link),
    meshMatch: cb.meshMatch,
    seconds: (Date.now() - started) / 1000,
  }
}

// ---- the two gates ----

export type WallVerdict = 'hold' | 'fail' | 'between' | 'incomplete'

export type ColorGates = {
  field: string
  slabs: SlabWallRead[]
  bulk: BulkWallRead
  cage: CageRead
  // decision 012 point 4: W-PASS the near count equals the colour-free 24 at every L; W-FAIL no slab level within `far`
  // at any L and no bulk level there; between: 0053's pump decides
  W: WallVerdict
  // the cage ratio under cagedBelow
  caged: boolean
  // the bulk box's mean triangle plaquette
  P: number
  seconds: number
}

export function wallVerdict(plan: GatesPlan, slabs: readonly SlabWallRead[], bulk: BulkWallRead): WallVerdict {
  if (slabs.some(s => !s.complete) || bulk.sets.some(s => !s.complete)) {
    return 'incomplete'
  }

  if (slabs.every(s => s.near === plan.pairs)) {
    return 'hold'
  }

  if (slabs.every(s => s.far === 0) && bulk.count === 0) {
    return 'fail'
  }

  return 'between'
}

export function colorGates(field: ColorField, plan: GatesPlan = GATES_PLAN): ColorGates {
  const started = Date.now()
  const slabs = plan.Ls.map(L => slabWallRead(field, plan, L))
  const bulk = bulkWallRead(field, plan)
  const cage = cageRead(field, plan)

  return {
    field: field.name,
    slabs,
    bulk,
    cage,
    W: wallVerdict(plan, slabs, bulk),
    caged: cage.ratio < plan.cagedBelow,
    P: bulk.plaquette.mean,
    seconds: (Date.now() - started) / 1000,
  }
}
