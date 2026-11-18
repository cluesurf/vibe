// DOES ANYTHING CARRY CONTENT FROM ONE HUSK DOCK TO THE NEXT? Instruments for running the full superposed rule
// (coin, meetings, pair move, the 'pass' collision with its four-part mixer K, stream; veto 'none', every link the
// identity: the composition of code/rule/coined-locked-knit coinedVetoBeat) on many vibes of the true {3,4,3,4} mesh
// below one cusp, with K on or off, and for reading where the marked (open) content sits on the husk. Written for
// E-HLG-0042; each piece is general.
//
// - compactPatch: the labelled mesh (code/measure/husk-closure buildLazyCuspMesh) seen through a numbering of only the
//   docks that ever hold content. growingPatch (code/measure/husk-content) widens every branch to the whole built mesh,
//   24 docks for each content dock; here a branch holds only content docks, so many filled lines and thousands of
//   branches fit in memory. Before each stream, every occupied slot's link is built (the dock across it joins the
//   patch), so the stream is the infinite mesh's. A dock deeper than `maxLevel` builds no new link: a vibe there whose
//   link is not built turns round onto its line's other slot (a frontier, a permutation like a ball's). Content turned
//   there sits at least log_lambda(maxLevel) links from the husk when every link changes the level by at most
//   lambda = 3 + 2 sqrt 2 (read by linkRatio), so the husk reading is the infinite mesh's for that many beats after
//   the first turn.
// - transferBeat: one beat on a compact patch, the rule's pieces in the rule's order (coinBranch, mergeBranches,
//   meetBranch, then per dock pairPiece and coinPiece in collisionOrder('alternate', beat), then the stream), with K
//   on or off. K off is code/measure/collective-modes lineLocalCollide (on a dock of two or more single lines only the
//   full lines act, every single keeps its slot), E-SPN-0157's control. The tally counts the docks where K acts and
//   those where it moves a vibe onto another line.
// - meshKeys: a state as a map from configuration (written by mesh dock) to reduced amplitude, so a compact patch run
//   and a growingPatch run of coinedVetoBeat compare bit for bit.
// - transferReading: where the open vibes sit: the husk weight by husk dock, its centroid along a husk axis and its
//   spread, the open weight on husk docks other than a given set (content moved along the husk) and off a given set of
//   slots (content moved onto other lines), the husk reach, the horizontal (shadow) centroid of all open weight, and
//   whether every branch kept the start's count and charge.
// - aheadSlots, huskLinks: a husk dock's six husk-link slots, and every husk link among the husk docks near a center.
// - streamStart: lines filled with fear streams (and held loves) on a compact patch; huskFractions: the open weight by
//   husk dock as exact reduced fractions, for comparing two runs.
//
// MEASUREMENT: amplitudes are Eisenstein integers over 2^k; every weight is a whole number over 4^K for the state's
// largest k; floats only in the mesh's frames (checked) and printed ratios. No random numbers.

import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'
import { coinBranch } from '@/code/rule/coined-locked-knit'
import { bouncePermutation, BOUNCE_TABLE } from '@/code/rule/bounce-pair-knit'
import { coinPiece, meetBranch, pairPiece } from '@/code/rule/occupation-veto-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import {
  cloneConfiguration,
  mergeBranches,
  type Branch,
  type Configuration,
  type LockedState,
  type LockedTables,
  type LockedTally,
} from '@/code/rule/doublet-locked-knit'
import { lineLocalCollide } from '@/code/measure/collective-modes'
import { lineCells, type LazyCuspMesh } from '@/code/measure/husk-closure'
import { emptyConfiguration, largestK } from '@/code/measure/husk-content'

const SLOTS = 24
const LINES = 12
const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f]!)

export const LAMBDA = 3 + 2 * Math.SQRT2

// ---- the compact patch ----

export type CompactPatch = {
  readonly mesh: LazyCuspMesh
  readonly maxLevel: number
  // patch dock -> mesh dock, and back
  readonly docks: number[]
  readonly index: Map<number, number>
  // the largest level ratio over the links this patch built, and the frontier turns so far
  linkRatio: number
  turns: number
}

export function compactPatch(mesh: LazyCuspMesh, maxLevel: number): CompactPatch {
  return { mesh, maxLevel, docks: [], index: new Map(), linkRatio: 1, turns: 0 }
}

export function patchDock(p: CompactPatch, meshDock: number): number {
  const known = p.index.get(meshDock)

  if (known !== undefined) {
    return known
  }

  const x = p.docks.length

  p.docks.push(meshDock)
  p.index.set(meshDock, x)

  return x
}

const cloneBranch = (b: Branch): Branch => ({ ...cloneConfiguration(b), a: b.a, b: b.b, k: b.k })

export function widenBranch(b: Branch, cells: number): Branch {
  if (b.vibe.length === cells * SLOTS) {
    return b
  }

  const grow = <T extends Int8Array | Uint8Array>(a: T, per: number, make: (n: number) => T): T => {
    const out = make(cells * per)

    out.set(a)

    return out
  }

  return {
    vibe: grow(b.vibe, SLOTS, n => new Int8Array(n)),
    point: grow(b.point, SLOTS, n => new Int8Array(n)),
    open: grow(b.open, SLOTS, n => new Uint8Array(n)),
    store: grow(b.store, LINES, n => new Int8Array(n)),
    spoint: grow(b.spoint, LINES, n => new Int8Array(n)),
    sopen: grow(b.sopen, LINES, n => new Uint8Array(n)),
    a: b.a,
    b: b.b,
    k: b.k,
  }
}

// the tables the collision pieces read (cells and the contact); the stream is the patch's own
const pieceTables = (cells: number): LockedTables => ({
  cells,
  collision: 'pass',
  veto: true,
  target: new Int32Array(0),
  source: new Int32Array(0),
  move: new Int8Array(0),
  back: new Int8Array(0),
})

export type TransferTally = {
  // (branch, dock) pairs where K acts (two or more single lines and the isometric map defined, or with K off where
  // it would), and where it carries some vibe onto another line
  kDocks: number
  lineMoves: number
}

export const newTransferTally = (): TransferTally => ({ kDocks: 0, lineMoves: 0 })

function singleLines(c: Configuration, base: number): number {
  let n = 0

  for (let l = 0; l < LINES; l++) {
    if ((c.vibe[base + LINE_FIRSTS[l]!] !== 0) !== (c.vibe[base + LINE_SECONDS[l]!] !== 0)) {
      n++
    }
  }

  return n
}

const PERM = new Int32Array(SLOTS)

// the rule's collision (collideVeto 'none' on the 'pass' contact, piece by piece), counting K: a dock of two or more
// single lines where the isometric map is defined, and among those the ones where some vibe changes line
function ruleCollide(t: LockedTables, c: Configuration, beat: number, tally?: TransferTally, locked?: LockedTally): void {
  const order = collisionOrder('alternate', beat)

  for (let x = 0; x < t.cells; x++) {
    for (const piece of order) {
      if (piece === 'P') {
        pairPiece('none', c, x, locked)
        continue
      }

      const base = x * SLOTS

      if (tally && singleLines(c, base) > 1 && bouncePermutation(BOUNCE_TABLE, t.collision, c.vibe, base, PERM) === 1) {
        tally.kDocks++

        for (let d = 0; d < SLOTS; d++) {
          if (c.vibe[base + d] !== 0 && LINE_OF[PERM[d]!] !== LINE_OF[d]) {
            tally.lineMoves++
            break
          }
        }
      }

      coinPiece(t, c, x)
    }
  }
}

// one beat of the rule on the compact patch; kOff replaces K by lineLocalCollide
export function transferBeat(input: {
  patch: CompactPatch
  state: LockedState
  beat: number
  kOff: boolean
  tally?: TransferTally
  locked?: LockedTally
}): LockedState {
  const { patch, state, beat, kOff, tally, locked } = input
  const cells = patch.docks.length
  const t = pieceTables(cells)
  const coined: Branch[] = []

  for (const br of state.branches) {
    coined.push(...coinBranch(cells, cloneBranch(br), false))
  }

  const offTally = { kDocks: 0 }
  const collideOff = lineLocalCollide(offTally)
  const collided: Branch[] = []

  for (const br of mergeBranches(coined)) {
    for (const b of meetBranch(cloneBranch(br), cells, false, locked)) {
      if (kOff) {
        collideOff(t, b, beat)
      } else {
        ruleCollide(t, b, beat, tally, locked)
      }

      collided.push(b)
    }
  }

  if (kOff && tally) {
    tally.kDocks += offTally.kDocks
  }

  // build every occupied slot's link (above the frontier) and take the dock across into the patch
  const { mesh } = patch

  for (const b of collided) {
    for (let i = 0; i < b.vibe.length; i++) {
      if (b.vibe[i] === 0) {
        continue
      }

      const m = patch.docks[(i / SLOTS) | 0]!
      const d = i % SLOTS
      const lx = mesh.level(m)
      const y = lx <= patch.maxLevel ? mesh.neighbour(m, d) : mesh.linked(m, d)

      if (y >= 0) {
        const ly = mesh.level(y)

        patch.linkRatio = Math.max(patch.linkRatio, ly / lx, lx / ly)
        patchDock(patch, y)
      }
    }
  }

  const n = patch.docks.length
  const streamed: Branch[] = []

  for (const b0 of collided) {
    const b = widenBranch(b0, n)
    const vibe = new Int8Array(b.vibe.length)
    const point = new Int8Array(b.point.length)
    const open = new Uint8Array(b.open.length)

    for (let i = 0; i < b.vibe.length; i++) {
      const v = b.vibe[i]!

      if (v === 0) {
        continue
      }

      const x = (i / SLOTS) | 0
      const d = i % SLOTS
      const y = mesh.linked(patch.docks[x]!, d)
      const py = y >= 0 ? patch.index.get(y) : undefined

      let to: number

      if (py === undefined) {
        to = x * SLOTS + OPPOSITE[d]!
        patch.turns++
      } else {
        to = py * SLOTS + d
      }

      if (vibe[to] !== 0) {
        throw new Error('husk-transfer: two vibes streamed into one slot')
      }

      vibe[to] = v
      point[to] = b.point[i]!
      open[to] = b.open[i]!
    }

    streamed.push({ ...b, vibe, point, open })
  }

  return { branches: mergeBranches(streamed) }
}

// ---- configurations by mesh dock ----

const reduce = (a: bigint, b: bigint, k: number): readonly [bigint, bigint, number] => {
  if (a === 0n && b === 0n) {
    return [0n, 0n, 0]
  }

  while (k > 0 && a % 2n === 0n && b % 2n === 0n) {
    a /= 2n
    b /= 2n
    k--
  }

  return [a, b, k]
}

export function configurationKey(c: Configuration, dockOf: (x: number) => number): string {
  const parts: string[] = []

  for (let i = 0; i < c.vibe.length; i++) {
    if (c.vibe[i] !== 0) {
      parts.push(`v${dockOf((i / SLOTS) | 0)}.${i % SLOTS}:${c.vibe[i]}:${c.open[i]}:${c.point[i]}`)
    }
  }

  for (let i = 0; i < c.store.length; i++) {
    if (c.store[i] !== 0) {
      parts.push(`s${dockOf((i / LINES) | 0)}.${i % LINES}:${c.store[i]}:${c.spoint[i]}:${c.sopen[i]}`)
    }
  }

  return parts.sort().join(',')
}

export function meshKeys(state: LockedState, dockOf: (x: number) => number): Map<string, string> {
  const sums = new Map<string, { a: bigint; b: bigint; k: number }>()

  for (const br of state.branches) {
    const key = configurationKey(br, dockOf)
    const prev = sums.get(key)

    if (!prev) {
      sums.set(key, { a: br.a, b: br.b, k: br.k })
    } else {
      const k = Math.max(prev.k, br.k)

      sums.set(key, {
        a: (prev.a << BigInt(k - prev.k)) + (br.a << BigInt(k - br.k)),
        b: (prev.b << BigInt(k - prev.k)) + (br.b << BigInt(k - br.k)),
        k,
      })
    }
  }

  const out = new Map<string, string>()

  for (const [key, s] of sums) {
    const [a, b, k] = reduce(s.a, s.b, s.k)

    if (a !== 0n || b !== 0n) {
      out.set(key, `${a},${b},${k}`)
    }
  }

  return out
}

// ---- the reading ----

export type TransferReading = {
  readonly K: number
  readonly branches: number
  // whole numbers over 4^K
  readonly weight: bigint
  readonly openTotal: bigint
  readonly openHusk: bigint
  // open weight on husk docks outside `home` (moved along the husk), and on slots outside `startSlots` (moved off
  // the start lines, husk or bulk)
  readonly openMoved: bigint
  readonly openOffLine: bigint
  // the part of openOffLine on husk docks
  readonly openOffLineHusk: bigint
  // open weight by husk mesh dock, over 4^K
  readonly huskOpen: ReadonlyMap<number, bigint>
  // the husk open weight's centroid along `axis` (from `origin`) and its rms spread about its own centroid, in husk
  // lattice units; the largest husk distance of a husk dock holding open weight from the nearest of `starts`
  readonly centroid: number
  readonly spread: number
  readonly reach: number
  // the centroid along `axis` of ALL open weight by horizontal (shadow) position, husk and bulk
  readonly shadowCentroid: number
  readonly countKept: boolean
  readonly chargeKept: boolean
  // count (vibes plus two per stored pair) on husk docks outside `home`, over the count on the husk (both over 4^K)
  readonly countHusk: bigint
  readonly countMoved: bigint
}

export function transferReading(input: {
  state: LockedState
  dockOf: (x: number) => number
  mesh: LazyCuspMesh
  origin: readonly number[]
  axis: readonly number[]
  // the open vibes' start docks (mesh docks), from which reach is measured
  starts: readonly number[]
  home: ReadonlySet<number>
  // mesh dock * 24 + slot of every slot of the start lines
  startSlots: ReadonlySet<number>
  count: number
  charge: number
}): TransferReading {
  const { state, dockOf, mesh, origin, axis, starts, home, startSlots, count, charge } = input
  const K = largestK(state)
  const huskOpen = new Map<number, bigint>()
  const isHusk = (m: number): boolean => mesh.level(m) === 1
  const along = (m: number): number => mesh.position(m).reduce((s, v, c) => s + (v - origin[c]!) * axis[c]!, 0)

  let weight = 0n
  let openTotal = 0n
  let openHusk = 0n
  let openMoved = 0n
  let openOffLine = 0n
  let openOffLineHusk = 0n
  let countHusk = 0n
  let countMoved = 0n
  let countKept = true
  let chargeKept = true
  let shadowSum = 0

  for (const br of state.branches) {
    const s = BigInt(K - br.k)
    const a = br.a << s
    const b = br.b << s
    const w = a * a - a * b + b * b

    weight += w

    let n = 0
    let q = 0

    const openAt = (m: number, offLine: boolean): void => {
      openTotal += w
      shadowSum += Number(w) * along(m)

      if (offLine) {
        openOffLine += w
      }

      if (isHusk(m)) {
        openHusk += w
        huskOpen.set(m, (huskOpen.get(m) ?? 0n) + w)

        if (offLine) {
          openOffLineHusk += w
        }

        if (!home.has(m)) {
          openMoved += w
        }
      }
    }

    const countAt = (m: number, units: number): void => {
      if (isHusk(m)) {
        countHusk += w * BigInt(units)

        if (!home.has(m)) {
          countMoved += w * BigInt(units)
        }
      }
    }

    for (let i = 0; i < br.vibe.length; i++) {
      const v = br.vibe[i]!

      if (v === 0) {
        continue
      }

      const m = dockOf((i / SLOTS) | 0)

      n++
      q += v
      countAt(m, 1)

      if (br.open[i]) {
        openAt(m, !startSlots.has(m * SLOTS + (i % SLOTS)))
      }
    }

    for (let i = 0; i < br.store.length; i++) {
      if (br.store[i] === 0) {
        continue
      }

      const m = dockOf((i / LINES) | 0)
      const l = i % LINES

      n += 2
      countAt(m, 2)

      if (br.sopen[i]) {
        openAt(m, !startSlots.has(m * SLOTS + LINE_FIRSTS[l]!))
      }
    }

    countKept &&= n === count
    chargeKept &&= q === charge
  }

  let cw = 0n
  let c1 = 0
  let reach = 0

  for (const [m, w] of huskOpen) {
    cw += w
    c1 += Number(w) * along(m)
    const p = mesh.position(m)

    reach = Math.max(
      reach,
      Math.min(...starts.map(s => Math.hypot(...p.map((v, c) => v - mesh.position(s)[c]!)))),
    )
  }

  const centroid = cw === 0n ? Number.NaN : c1 / Number(cw)
  const mean = mesh.position(dockOf(0)).map(() => 0)

  if (cw > 0n) {
    for (const [m, w] of huskOpen) {
      mesh.position(m).forEach((v, c) => (mean[c] = mean[c]! + (Number(w) * (v - origin[c]!)) / Number(cw)))
    }
  }

  let spread2 = 0

  for (const [m, w] of huskOpen) {
    spread2 += (Number(w) / Number(cw)) * mesh.position(m).reduce((s, v, c) => s + (v - origin[c]! - mean[c]!) ** 2, 0)
  }

  return {
    K,
    branches: state.branches.length,
    weight,
    openTotal,
    openHusk,
    openMoved,
    openOffLine,
    openOffLineHusk,
    huskOpen,
    centroid,
    spread: Math.sqrt(spread2),
    reach,
    shadowCentroid: openTotal === 0n ? Number.NaN : shadowSum / Number(openTotal),
    countKept,
    chargeKept,
    countHusk,
    countMoved,
  }
}

// ---- husk geometry and stream starts ----

// the husk docks a slot's line meets at positions -2..2 from `dock`, as a sorted list ('0,1' a husk link ahead)
export function huskPositions(mesh: LazyCuspMesh, dock: number, slot: number): string {
  const out: number[] = []

  for (const [x, p] of lineCells({ mesh, dock, slot, reach: 2 })) {
    if (mesh.level(x) === 1) {
      out.push(p)
    }
  }

  return out.sort((a, b) => a - b).join(',')
}

// the slots of a husk dock whose line runs to a husk neighbour (the six husk links)
export function aheadSlots(mesh: LazyCuspMesh, dock: number): number[] {
  return Array.from({ length: SLOTS }, (_, s) => s).filter(s => huskPositions(mesh, dock, s) === '0,1')
}

export type StreamLine = {
  readonly dock: number
  readonly slot: number
  // an open love at `dock` on `slot`, with a closed fear on the opposite slot of every other dock of the line; or
  // (false) a closed fear on the opposite slot of every dock of the line
  readonly love: boolean
}

// every husk link among the husk docks within `radius` of `center` (in the plane of the first two husk axes through
// `center` when `plane`), each once, oriented from the dock found first
export function huskLinks(input: {
  mesh: LazyCuspMesh
  center: number
  radius: number
  plane: boolean
}): { dock: number; slot: number; other: number }[] {
  const { mesh, center, radius, plane } = input
  const c = mesh.position(center)
  const inside = (y: number): boolean => {
    const p = mesh.position(y)

    return Math.hypot(...p.map((v, k) => v - c[k]!)) <= radius + 1e-6 && (!plane || Math.abs(p[2]! - c[2]!) < 1e-6)
  }
  const docks = [center]
  const known = new Set(docks)

  for (let i = 0; i < docks.length; i++) {
    for (const s of aheadSlots(mesh, docks[i]!)) {
      const y = mesh.neighbour(docks[i]!, s)

      if (!known.has(y) && inside(y)) {
        known.add(y)
        docks.push(y)
      }
    }
  }

  const seen = new Set<string>()
  const out: { dock: number; slot: number; other: number }[] = []

  for (const x of docks) {
    for (const s of aheadSlots(mesh, x)) {
      const y = mesh.neighbour(x, s)
      const key = x < y ? `${x}-${y}` : `${y}-${x}`

      if (known.has(y) && !seen.has(key)) {
        seen.add(key)
        out.push({ dock: x, slot: s, other: y })
      }
    }
  }

  return out
}

export type StreamStart = {
  readonly configuration: Configuration
  readonly count: number
  readonly charge: number
  // the love lines' slots (mesh dock * 24 + slot), start docks, and husk docks
  readonly startSlots: ReadonlySet<number>
  readonly starts: readonly number[]
  readonly home: ReadonlySet<number>
  readonly deepestLevel: number
}

// the lines filled to positions -fill..fill on a compact patch (its docks added); a slot taken twice throws
export function streamStart(input: {
  patch: CompactPatch
  lines: readonly StreamLine[]
  fill: number
}): StreamStart {
  const { patch, lines, fill } = input
  const { mesh } = patch
  const placed = new Map<number, { v: 1 | -1; open: boolean }>()
  const startSlots = new Set<number>()
  const starts: number[] = []
  const home = new Set<number>()

  let deepestLevel = 0

  for (const L of lines) {
    for (const [m, p] of lineCells({ mesh, dock: L.dock, slot: L.slot, reach: fill })) {
      patchDock(patch, m)
      deepestLevel = Math.max(deepestLevel, mesh.level(m))

      const love = L.love && p === 0
      const key = m * SLOTS + (love ? L.slot : OPPOSITE[L.slot]!)

      if (placed.has(key)) {
        throw new Error('husk-transfer: two stream lines fill one slot')
      }

      placed.set(key, love ? { v: 1, open: true } : { v: -1, open: false })

      if (L.love) {
        startSlots.add(m * SLOTS + L.slot)
        startSlots.add(m * SLOTS + OPPOSITE[L.slot]!)

        if (mesh.level(m) === 1) {
          home.add(m)
        }
      }
    }

    if (L.love) {
      starts.push(L.dock)
    }
  }

  const configuration = emptyConfiguration(patch.docks.length)

  for (const [key, s] of placed) {
    const i = patch.index.get(Math.floor(key / SLOTS))! * SLOTS + (key % SLOTS)

    configuration.vibe[i] = s.v
    configuration.open[i] = s.open ? 1 : 0
  }

  return {
    configuration,
    count: placed.size,
    charge: [...placed.values()].reduce((q, s) => q + s.v, 0),
    startSlots,
    starts,
    home,
    deepestLevel,
  }
}

// the open weight on each husk dock as a reduced fraction "n/k" (n over 4^k), for comparing two runs exactly
export function huskFractions(r: TransferReading): Map<number, string> {
  const out = new Map<number, string>()

  for (const [m, w] of r.huskOpen) {
    let n = w
    let k = r.K

    while (k > 0 && n % 4n === 0n) {
      n /= 4n
      k--
    }

    out.set(m, `${n}/${k}`)
  }

  return out
}

// a ratio of whole numbers, to 12 digits
export const share = (n: bigint, d: bigint): number => (d === 0n ? Number.NaN : Number((n * 10n ** 12n) / d) / 1e12)
