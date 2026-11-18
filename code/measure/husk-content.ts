// WHAT CONTENT DOES THE RULE KEEP ON THE HUSK? Instruments for running the full superposed rule (code/rule/
// coined-locked-knit coinedVetoBeat, veto 'none', the pass contact, every link the identity) on a few vibes of the true
// {3,4,3,4} mesh below one cusp, and on one mesh line for long times, and for reading the husk part of the state.
// Written for E-HLG-0040; each piece is general.
//
// - growingPatch: the rule on the labelled mesh grown on demand (code/measure/husk-closure buildLazyCuspMesh), with
//   no frontier. Before every beat each dock holding content in any branch gets all 24 of its links built, the stream
//   tables are rebuilt over every dock built so far (a slot whose link is not built streams into the opposite slot of
//   its own dock, as on a ball's frontier, which only empty slots ever use), and every branch is widened to the new
//   dock count. So a run equals the rule on the infinite mesh exactly, for as long as the float frames hold dock
//   identity (the mesh's health counts).
// - lineTube: the rule's tables on a ring of `length` docks along one slot, every other slot turning round in its own
//   dock. By the line law (E-SPN-0098, E-SPN-0156) content on one line never leaves it, so a tube run is the line's own
//   dynamics, equal to the infinite line until the content wraps the ring.
// - placeOnLine: line content (vibes on the line's two slots, stored pairs on its dock line) placed by position.
// - lineKeys and restrictedMarginal: a branch written as line content by position (with the count of entries off the
//   line), so a patch run and a tube run can be compared bit for bit, or by their Born weights on a zone of positions.
// - huskContent: the husk reading of a superposed state: the husk share of the conserved count (vibes plus two per
//   stored pair), the husk weight of the open vibe (an open slot or an open stored pair), the husk docks holding
//   content, whether every branch kept the start's count, and the coherence of the husk's reduced state (the bulk
//   traced out) between husk configurations of different husk count and between ones of the same count.
//
// MEASUREMENT: the rule's amplitudes are Eisenstein integers over 2^k; every weight here is a whole number over 4^K
// for the state's largest k, and the coherences are exact norms; floats appear only in printed ratios and in the
// mesh's frames (checked). No random numbers.

import { LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'
import { coinedVetoBeat } from '@/code/rule/coined-locked-knit'
import {
  type Branch,
  type Configuration,
  type LockedState,
  type LockedTables,
  type LockedTally,
} from '@/code/rule/doublet-locked-knit'
import type { LazyCuspMesh } from '@/code/measure/husk-closure'

const SLOTS = 24
const LINES = 12

export function emptyConfiguration(cells: number): Configuration {
  return {
    vibe: new Int8Array(cells * SLOTS),
    point: new Int8Array(cells * SLOTS),
    open: new Uint8Array(cells * SLOTS),
    store: new Int8Array(cells * LINES),
    spoint: new Int8Array(cells * LINES),
    sopen: new Uint8Array(cells * LINES),
  }
}

// the pass-contact tables of a slot map: `target(x, d)` the dock slot d of dock x streams into, or -1 to turn round
function streamTables(
  cells: number,
  next: (x: number, d: number) => number,
): LockedTables {
  const slots = cells * SLOTS
  const target = new Int32Array(slots)
  const source = new Int32Array(slots).fill(-1)
  const move = new Int8Array(slots * 9)
  const back = new Int8Array(slots * 9)

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const slot = x * SLOTS + d
      const n = next(x, d)
      const to = n >= 0 ? n * SLOTS + d : x * SLOTS + OPPOSITE[d]!

      target[slot] = to
      source[to] = slot

      for (let p = 0; p < 9; p++) {
        move[slot * 9 + p] = p
        back[slot * 9 + p] = p
      }
    }
  }

  if (source.some(s => s < 0)) {
    throw new Error('husk-content: the stream is not a bijection')
  }

  return { cells, collision: 'pass', veto: true, target, source, move, back }
}

// a ring of `length` docks along `slot`: dock i streams slot into i + 1 and its opposite into i - 1
export function lineTube(input: {
  slot: number
  length: number
}): LockedTables {
  const { slot, length } = input
  const back = OPPOSITE[slot]!

  return streamTables(length, (x, d) =>
    d === slot ? (x + 1) % length : d === back ? (x + length - 1) % length : -1,
  )
}

export type LineVibe = {
  readonly position: number
  readonly forward: boolean
  readonly value: 1 | -1
  readonly open: boolean
  readonly point?: number
}

export type LineStore = {
  readonly position: number
  readonly tau: 1 | -1
  readonly spoint?: number
  readonly sopen?: number
}

export type LineContent = {
  readonly vibes: readonly LineVibe[]
  readonly stores: readonly LineStore[]
}

export function placeOnLine(input: {
  configuration: Configuration
  dockAt: (position: number) => number
  slot: number
  content: LineContent
}): void {
  const { configuration: c, dockAt, slot, content } = input
  const back = OPPOSITE[slot]!
  const line = LINE_OF[slot]!

  for (const v of content.vibes) {
    const i = dockAt(v.position) * SLOTS + (v.forward ? slot : back)

    if (c.vibe[i] !== 0) {
      throw new Error('husk-content: a slot holds one vibe')
    }

    c.vibe[i] = v.value
    c.open[i] = v.open ? 1 : 0
    c.point[i] = v.point ?? 0
  }

  for (const s of content.stores) {
    const l = dockAt(s.position) * LINES + line

    c.store[l] = s.tau
    c.spoint[l] = s.spoint ?? 0
    c.sopen[l] = s.sopen ?? 0
  }
}

// ---- the growing patch ----

export type GrowingPatch = {
  readonly mesh: LazyCuspMesh
  readonly cells: () => number
  readonly beat: (
    state: LockedState,
    beat: number,
    tally?: LockedTally,
  ) => LockedState
  // widen a state to the patch's present dock count (a start placed before docks were added)
  readonly widen: (state: LockedState) => LockedState
}

function widenBranch(b: Branch, cells: number): Branch {
  const old = b.vibe.length / SLOTS

  if (old === cells) {
    return b
  }

  const grow = <T extends Int8Array | Uint8Array>(
    a: T,
    per: number,
    make: (n: number) => T,
  ): T => {
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

// the docks holding any content in a branch
export function contentDocks(c: Configuration): number[] {
  const out = new Set<number>()

  for (let i = 0; i < c.vibe.length; i++) {
    if (c.vibe[i] !== 0) {
      out.add((i / SLOTS) | 0)
    }
  }

  for (let i = 0; i < c.store.length; i++) {
    if (c.store[i] !== 0) {
      out.add((i / LINES) | 0)
    }
  }

  return [...out]
}

export function growingPatch(mesh: LazyCuspMesh): GrowingPatch {
  let tables: LockedTables | undefined

  const rebuild = (): LockedTables => {
    const cells = mesh.size()

    if (!tables || tables.cells !== cells) {
      tables = streamTables(cells, (x, d) => mesh.linked(x, d))
    }

    return tables
  }

  const widen = (state: LockedState): LockedState => {
    const cells = mesh.size()

    return { branches: state.branches.map(b => widenBranch(b, cells)) }
  }

  return {
    mesh,
    cells: () => mesh.size(),
    widen,
    beat(state, beat, tally) {
      for (const b of state.branches) {
        for (const x of contentDocks(b)) {
          for (let d = 0; d < SLOTS; d++) {
            mesh.neighbour(x, d)
          }
        }
      }

      // building a link can add docks whose own links are unbuilt; they hold no content, so they turn round
      const t = rebuild()

      return coinedVetoBeat('none', t, widen(state), beat, tally)
    },
  }
}

// the largest k of a state's branches (a loop: a state can hold more branches than a spread allows)
export function largestK(state: LockedState): number {
  let K = 0

  for (const b of state.branches) {
    K = Math.max(K, b.k)
  }

  return K
}

// ---- line content by position ----

const reduce = (
  a: bigint,
  b: bigint,
  k: number,
): readonly [bigint, bigint, number] => {
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

export type LineEntry = { readonly position: number; readonly text: string }

// a branch's content as line entries by position; `positionOf` gives a dock's line position or undefined off the line
export function lineEntries(input: {
  branch: Configuration
  positionOf: (dock: number) => number | undefined
  slot: number
}): { entries: LineEntry[]; offLine: number } {
  const { branch: c, positionOf, slot } = input
  const back = OPPOSITE[slot]!
  const line = LINE_OF[slot]!
  const entries: LineEntry[] = []

  let offLine = 0

  for (let i = 0; i < c.vibe.length; i++) {
    if (c.vibe[i] === 0) {
      continue
    }

    const p = positionOf((i / SLOTS) | 0)
    const d = i % SLOTS

    if (p === undefined || (d !== slot && d !== back)) {
      offLine++
      continue
    }

    entries.push({
      position: p,
      text: `v${p}${d === slot ? 'f' : 'b'}:${c.vibe[i]}:${c.open[i]}:${c.point[i]}`,
    })
  }

  for (let i = 0; i < c.store.length; i++) {
    if (c.store[i] === 0) {
      continue
    }

    const p = positionOf((i / LINES) | 0)

    if (p === undefined || i % LINES !== line) {
      offLine++
      continue
    }

    entries.push({
      position: p,
      text: `s${p}:${c.store[i]}:${c.spoint[i]}:${c.sopen[i]}`,
    })
  }

  return { entries, offLine }
}

// the state as a map from line key to reduced amplitude "a,b,k"; off-line entries counted
export function lineKeys(input: {
  state: LockedState
  positionOf: (dock: number) => number | undefined
  slot: number
}): { keys: Map<string, string>; offLine: number } {
  const sums = new Map<string, { a: bigint; b: bigint; k: number }>()

  let offLine = 0

  for (const br of input.state.branches) {
    const e = lineEntries({ branch: br, positionOf: input.positionOf, slot: input.slot })

    offLine += e.offLine

    const key = e.entries.map(x => x.text).sort().join(',')
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

  const keys = new Map<string, string>()

  for (const [key, s] of sums) {
    const [a, b, k] = reduce(s.a, s.b, s.k)

    if (a !== 0n || b !== 0n) {
      keys.set(key, `${a},${b},${k}`)
    }
  }

  return { keys, offLine }
}

export function sameKeys(
  x: ReadonlyMap<string, string>,
  y: ReadonlyMap<string, string>,
): boolean {
  return x.size === y.size && [...x].every(([k, v]) => y.get(k) === v)
}

// the Born weight of each content pattern on the positions |p| <= zone, as "numerator/4^K" strings reduced
export function restrictedMarginal(input: {
  state: LockedState
  positionOf: (dock: number) => number | undefined
  slot: number
  zone: number
}): Map<string, string> {
  const K = largestK(input.state)
  const sums = new Map<string, bigint>()

  for (const br of input.state.branches) {
    const e = lineEntries({ branch: br, positionOf: input.positionOf, slot: input.slot })
    const key = e.entries
      .filter(x => Math.abs(x.position) <= input.zone)
      .map(x => x.text)
      .sort()
      .join(',')
    const w = (br.a * br.a - br.a * br.b + br.b * br.b) << BigInt(2 * (K - br.k))

    sums.set(key, (sums.get(key) ?? 0n) + w)
  }

  const out = new Map<string, string>()

  for (const [key, w] of sums) {
    let n = w
    let k = K

    while (k > 0 && n % 4n === 0n) {
      n /= 4n
      k--
    }

    if (n !== 0n) {
      out.set(key, `${n}/${k}`)
    }
  }

  return out
}

// least squares slope of log y against log t over beats from..series.length - 1 with y > 0 (NaN with fewer than 2)
export function powerOfSeries(series: readonly number[], from: number): number {
  const xs: number[] = []
  const ys: number[] = []

  for (let t = Math.max(1, from); t < series.length; t++) {
    if (series[t]! > 0) {
      xs.push(Math.log(t))
      ys.push(Math.log(series[t]!))
    }
  }

  if (xs.length < 2) {
    return Number.NaN
  }

  const mx = xs.reduce((a, b) => a + b, 0) / xs.length
  const my = ys.reduce((a, b) => a + b, 0) / ys.length

  let sxy = 0
  let sxx = 0

  for (let i = 0; i < xs.length; i++) {
    sxy += (xs[i]! - mx) * (ys[i]! - my)
    sxx += (xs[i]! - mx) ** 2
  }

  return sxy / sxx
}

// ---- the husk reading ----

export type HuskContent = {
  // whole numbers over 4^K
  readonly K: number
  readonly weight: bigint
  readonly countTotal: bigint
  readonly countHusk: bigint
  readonly openTotal: bigint
  readonly openHusk: bigint
  // ratios
  readonly countShare: number
  readonly openShare: number
  // whether every branch holds exactly `count` (vibes plus two per stored pair)
  readonly countKept: boolean
  readonly huskDocks: readonly number[]
  readonly reach: number
  readonly branches: number
  // the husk's reduced state, the bulk traced out: husk configurations, and coherence between pairs of them as
  // sum |rho_ij|^2 / sum rho_ii rho_jj over pairs of different husk count and over pairs of one count (NaN: no pair)
  readonly huskConfigurations: number
  readonly coherenceCount: number
  readonly coherenceRole: number
  // environments (distinct bulk configurations)
  readonly environments: number
}

const countOf = (c: Configuration, docks?: (x: number) => boolean): number => {
  let n = 0

  for (let i = 0; i < c.vibe.length; i++) {
    if (c.vibe[i] !== 0 && (!docks || docks((i / SLOTS) | 0))) {
      n++
    }
  }

  for (let i = 0; i < c.store.length; i++) {
    if (c.store[i] !== 0 && (!docks || docks((i / LINES) | 0))) {
      n += 2
    }
  }

  return n
}

// the docks of a branch's open vibes: open slots and open stored pairs
function openDocks(c: Configuration): number[] {
  const out: number[] = []

  for (let i = 0; i < c.vibe.length; i++) {
    if (c.vibe[i] !== 0 && c.open[i]) {
      out.push((i / SLOTS) | 0)
    }
  }

  for (let i = 0; i < c.store.length; i++) {
    if (c.store[i] !== 0 && c.sopen[i]) {
      out.push((i / LINES) | 0)
    }
  }

  return out
}

// a branch split into its husk part and its bulk part, as keys
function splitKeys(
  c: Configuration,
  husk: (x: number) => boolean,
): { husk: string; bulk: string; huskCount: number } {
  const h: string[] = []
  const b: string[] = []

  let huskCount = 0

  for (let i = 0; i < c.vibe.length; i++) {
    if (c.vibe[i] === 0) {
      continue
    }

    const text = `v${i}:${c.vibe[i]}:${c.open[i]}:${c.point[i]}`

    if (husk((i / SLOTS) | 0)) {
      h.push(text)
      huskCount++
    } else {
      b.push(text)
    }
  }

  for (let i = 0; i < c.store.length; i++) {
    if (c.store[i] === 0) {
      continue
    }

    const text = `s${i}:${c.store[i]}:${c.spoint[i]}:${c.sopen[i]}`

    if (husk((i / LINES) | 0)) {
      h.push(text)
      huskCount += 2
    } else {
      b.push(text)
    }
  }

  return { husk: h.join(','), bulk: b.join(','), huskCount }
}

type Eis = readonly [bigint, bigint]

const eisTimesConj = (x: Eis, y: Eis): Eis => {
  // x * conj(y), conj(m + n w) = (m - n) - n w
  const u = y[0] - y[1]
  const v = -y[1]

  return [x[0] * u - x[1] * v, x[0] * v + x[1] * u - x[1] * v]
}

const eisNorm = (x: Eis): bigint => x[0] * x[0] - x[0] * x[1] + x[1] * x[1]

export function huskContent(input: {
  state: LockedState
  isHusk: (dock: number) => boolean
  distance: (dock: number) => number
  count: number
}): HuskContent {
  const { state, isHusk, distance, count } = input
  const K = largestK(state)
  const docks = new Set<number>()

  let weight = 0n
  let countTotal = 0n
  let countHusk = 0n
  let openTotal = 0n
  let openHusk = 0n
  let countKept = true

  // amplitudes by (husk key, bulk key), scaled to 2^K
  const amp = new Map<string, Map<string, [bigint, bigint]>>()
  const huskCountOf = new Map<string, number>()
  const bulkKeys = new Set<string>()

  for (const br of state.branches) {
    const s = BigInt(K - br.k)
    const a = br.a << s
    const b = br.b << s
    const w = eisNorm([a, b])
    const n = countOf(br)
    const split = splitKeys(br, isHusk)

    weight += w
    countTotal += w * BigInt(n)
    countHusk += w * BigInt(split.huskCount)
    countKept &&= n === count

    const open = openDocks(br)

    if (open.length > 0) {
      openTotal += w * BigInt(open.length)
      openHusk += w * BigInt(open.filter(isHusk).length)
    }

    for (const x of contentDocks(br)) {
      if (isHusk(x)) {
        docks.add(x)
      }
    }

    const row = amp.get(split.husk) ?? new Map<string, [bigint, bigint]>()
    const prev = row.get(split.bulk) ?? [0n, 0n]

    row.set(split.bulk, [prev[0] + a, prev[1] + b])
    amp.set(split.husk, row)
    huskCountOf.set(split.husk, split.huskCount)
    bulkKeys.add(split.bulk)
  }

  // the reduced husk state
  const hs = [...amp.keys()]
  const diag = hs.map(h =>
    [...amp.get(h)!.values()].reduce((s, z) => s + eisNorm(z), 0n),
  )

  let countNum = 0n
  let countDen = 0n
  let roleNum = 0n
  let roleDen = 0n

  for (let i = 0; i < hs.length; i++) {
    for (let j = i + 1; j < hs.length; j++) {
      const ri = amp.get(hs[i]!)!
      const rj = amp.get(hs[j]!)!

      let sum: [bigint, bigint] = [0n, 0n]

      for (const [env, z] of ri) {
        const y = rj.get(env)

        if (y) {
          const p = eisTimesConj(z, y)

          sum = [sum[0] + p[0], sum[1] + p[1]]
        }
      }

      const num = eisNorm(sum)
      const den = diag[i]! * diag[j]!

      if (huskCountOf.get(hs[i]!) !== huskCountOf.get(hs[j]!)) {
        countNum += num
        countDen += den
      } else {
        roleNum += num
        roleDen += den
      }
    }
  }

  const ratio = (n: bigint, d: bigint): number =>
    d === 0n ? Number.NaN : Number((n * 10n ** 12n) / d) / 1e12

  return {
    K,
    weight,
    countTotal,
    countHusk,
    openTotal,
    openHusk,
    countShare: ratio(countHusk, countTotal),
    openShare: openTotal === 0n ? Number.NaN : ratio(openHusk, openTotal),
    countKept,
    huskDocks: [...docks],
    reach: Math.max(0, ...[...docks].map(distance)),
    branches: state.branches.length,
    huskConfigurations: hs.length,
    coherenceCount: ratio(countNum, countDen),
    coherenceRole: ratio(roleNum, roleDen),
    environments: bulkKeys.size,
  }
}
