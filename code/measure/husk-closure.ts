// IS THE HUSK CLOSED UNDER THE SUPERPOSED RULE? Instruments for one vibe of the rule's one-body sector on the true
// {3,4,3,4} mesh below one cusp, read on the husk. Written for E-HLG-0039; each piece is general.
//
// - buildLazyCuspMesh: the labelled {3,4,3,4} mesh grown on demand from the base dock (a husk dock, Busemann level 1)
//   by the antipodal label transport (code/substrate/coxeter/label-transport), so every dock carries its TRUE labels.
//   The cusp quotient of code/measure/cusp-green is a graph only: its cubic translations do not carry the labels (a
//   husk neighbour's frame differs from the translated frame by a label permutation), so a stream read off it is not
//   the rule's. A dock is found by its center (pointKey), every new link is checked both ways (the far dock's facet -d
//   must lead back), and every level must be an integer to 1e-7.
// - oneBodyBeat: one beat of the rule's lone-vibe sector, exact in Z[w][1/2]. On a lone vibe the coin acts on the two
//   slots of its line, keep (1 + w)/2 and reverse (1 - w)/2 (code/rule/fear-walk FEAR_COIN, the rule's lone vibe bit
//   for bit by E-QTM-0157), the meetings and the collision leave it alone, and the stream carries slot d of a dock into
//   slot d of the dock across facet d. Three modes: open (no floor), a floor (a vibe streaming into a dock deeper than
//   the floor leaves the patch and its weight is tallied as absorbed), and husk-only (every link off the husk is cut,
//   and a vibe whose link is cut turns round onto its line's other slot, the reflecting wall that keeps the map a
//   permutation). The beat also returns the weight crossing from husk docks to bulk docks and back.
// - huskReading: the husk weight, the husk docks reached, their largest husk distance from the start, the deepest level.
// - lineCells and onLine: the start's mesh line traced both ways, and whether a state lies on it (the line law).
// - lineWalk: the same sector on one line, the line's docks indexed by whole numbers and its husk docks given, with no
//   floor at all: exact for any number of beats, where the lazy mesh's float frames are good only to a depth of about
//   nine docks.
// - basisGram: the exact Gram matrix of one beat's images of a set of one-vibe basis states (unitarity).
// - huskGraphDistances: breadth-first distances on the cusp quotient's graph (which needs no labels) from a husk dock to
//   far husk docks, against the husk-only distance: the strict cone of one dock a beat, through the bulk.
//
// MEASUREMENT: weights are Eisenstein integers over 2^t, chances whole numbers over 4^t; floats appear only in the
// mesh's frames (dock identity and levels, checked) and in printed ratios. No random numbers.

import {
  labelledCoin,
  labelTransports,
} from '@/code/substrate/coxeter/label-transport'
import { horosphericalChart } from '@/code/measure/hyperbolic-lines'
import {
  identity,
  matMul,
  matVec,
  pointKey,
  type Mat,
} from '@/code/substrate/coxeter/minkowski'
import { OPPOSITE, LINE_FIRSTS } from '@/code/rule/isometric-knit'
import {
  FEAR_COIN,
  norm,
  plus,
  times,
  ZERO,
  type Coin,
  type Eisenstein,
} from '@/code/rule/fear-walk'
import type { CuspQuotient } from '@/code/measure/cusp-green'

const SLOTS = 24
const LEVEL_TOLERANCE = 1e-7

export type LazyCuspMesh = {
  readonly base: number
  readonly size: () => number
  readonly level: (dock: number) => number
  // the husk chart's horizontal position of the dock's center, in husk lattice units
  readonly position: (dock: number) => readonly number[]
  readonly neighbour: (dock: number, slot: number) => number
  // the dock across facet `slot` when that link is built, else -1 (builds nothing)
  readonly linked: (dock: number, slot: number) => number
  readonly health: () => {
    reciprocityMisses: number
    offInteger: number
    deepestLevel: number
  }
}

export function buildLazyCuspMesh(): LazyCuspMesh {
  const coin = labelledCoin()
  const chart = horosphericalChart(coin)
  const tau = labelTransports({ coin, kind: 'antipodal' })
  const c0 = coin.frame.center
  const frames: Mat[] = []
  const levels: number[] = []
  const positions: number[][] = []
  const links: Int32Array[] = []
  const index = new Map<string, number>()

  let reciprocityMisses = 0
  let offInteger = 0
  let deepestLevel = 0

  const add = (g: Mat): number => {
    const p = matVec(g, c0)
    const key = pointKey(p)
    const known = index.get(key)

    if (known !== undefined) {
      return known
    }

    const l = chart.level(p) / chart.layerLevel
    const k = Math.round(l)

    if (Math.abs(l - k) > LEVEL_TOLERANCE * Math.max(1, l)) {
      offInteger++
    }

    deepestLevel = Math.max(deepestLevel, k)

    const a = frames.length

    frames.push(g)
    levels.push(k)
    positions.push(chart.coordinates(p))
    links.push(new Int32Array(SLOTS).fill(-1))
    index.set(key, a)

    return a
  }

  const base = add(identity(c0.length))

  const neighbour = (a: number, d: number): number => {
    const known = links[a]![d]!

    if (known >= 0) {
      return known
    }

    const g = matMul(frames[a]!, tau[d]!)
    const b = add(g)
    const here = matVec(frames[a]!, c0)
    const back = matVec(matMul(g, tau[OPPOSITE[d]!]!), c0)
    const scale = Math.max(1, ...here.map(Math.abs))

    if (here.some((v, i) => Math.abs(v - back[i]!) > 1e-9 * scale)) {
      reciprocityMisses++
    }

    links[a]![d] = b
    links[b]![OPPOSITE[d]!] = a

    return b
  }

  return {
    base,
    size: () => frames.length,
    level: a => levels[a]!,
    position: a => positions[a]!,
    neighbour,
    linked: (a, d) => links[a]![d]!,
    health: () => ({ reciprocityMisses, offInteger, deepestLevel }),
  }
}

// a one-vibe state: the weight of each (dock, slot), key dock * 24 + slot, over 2^t
export type OneBodyState = {
  readonly weight: ReadonlyMap<number, Eisenstein>
  readonly t: number
}

export type OneBodyMode =
  | { readonly form: 'open'; readonly floor: number }
  | { readonly form: 'husk-only' }

export type OneBodyFlow = {
  // whole numbers over 4^(t + 1), t the beat's start
  readonly out: bigint
  readonly back: bigint
  readonly absorbed: bigint
}

export function oneVibe(input: {
  dock: number
  slot: number
}): OneBodyState {
  return {
    weight: new Map([[input.dock * SLOTS + input.slot, [1n, 0n]]]),
    t: 0,
  }
}

const isZero = (z: Eisenstein): boolean => z[0] === 0n && z[1] === 0n

export function oneBodyBeat(input: {
  mesh: LazyCuspMesh
  state: OneBodyState
  mode: OneBodyMode
  coin?: Coin
}): { state: OneBodyState; flow: OneBodyFlow } {
  const { mesh, state, mode } = input
  const [keep, reverse] = input.coin ?? FEAR_COIN
  const docks = new Set<number>()

  for (const k of state.weight.keys()) {
    docks.add(Math.floor(k / SLOTS))
  }

  const next = new Map<number, Eisenstein>()

  let out = 0n
  let back = 0n
  let absorbed = 0n

  const deposit = (key: number, z: Eisenstein): void => {
    const sum = plus(next.get(key) ?? ZERO, z)

    if (isZero(sum)) {
      next.delete(key)
    } else {
      next.set(key, sum)
    }
  }

  const send = (x: number, d: number, z: Eisenstein): void => {
    if (isZero(z)) {
      return
    }

    const y = mesh.neighbour(x, d)
    const fromHusk = mesh.level(x) === 1
    const toHusk = mesh.level(y) === 1

    if (mode.form === 'husk-only' && !toHusk) {
      deposit(x * SLOTS + OPPOSITE[d]!, z)

      return
    }

    if (mode.form === 'open' && mesh.level(y) > mode.floor) {
      absorbed += norm(z)

      if (fromHusk) {
        out += norm(z)
      }

      return
    }

    if (fromHusk && !toHusk) {
      out += norm(z)
    } else if (!fromHusk && toHusk) {
      back += norm(z)
    }

    deposit(y * SLOTS + d, z)
  }

  for (const x of docks) {
    for (const f of LINE_FIRSTS) {
      const s = OPPOSITE[f]!
      const r = state.weight.get(x * SLOTS + f) ?? ZERO
      const l = state.weight.get(x * SLOTS + s) ?? ZERO

      if (isZero(r) && isZero(l)) {
        continue
      }

      send(x, f, plus(times(keep, r), times(reverse, l)))
      send(x, s, plus(times(reverse, r), times(keep, l)))
    }
  }

  return {
    state: { weight: next, t: state.t + 1 },
    flow: { out, back, absorbed },
  }
}

export type HuskReading = {
  // whole numbers over 4^t
  readonly husk: bigint
  readonly total: bigint
  readonly huskDocks: number
  readonly huskDockIds: readonly number[]
  readonly docks: number
  // the largest husk-chart distance of a husk dock holding weight from the start dock
  readonly huskReach: number
  readonly deepestLevel: number
}

export function huskReading(input: {
  mesh: LazyCuspMesh
  state: OneBodyState
  start: number
}): HuskReading {
  const { mesh, state, start } = input
  const origin = mesh.position(start)
  const huskDocks = new Set<number>()
  const docks = new Set<number>()

  let husk = 0n
  let total = 0n
  let huskReach = 0
  let deepestLevel = 0

  for (const [k, z] of state.weight) {
    const x = Math.floor(k / SLOTS)
    const w = norm(z)

    total += w
    docks.add(x)
    deepestLevel = Math.max(deepestLevel, mesh.level(x))

    if (mesh.level(x) === 1) {
      husk += w
      huskDocks.add(x)

      const p = mesh.position(x)

      huskReach = Math.max(
        huskReach,
        Math.hypot(...p.map((v, c) => v - origin[c]!)),
      )
    }
  }

  return {
    husk,
    total,
    huskDocks: huskDocks.size,
    huskDockIds: [...huskDocks],
    docks: docks.size,
    huskReach,
    deepestLevel,
  }
}

// the docks of the line through `dock` along `slot`, index 0 the dock itself, positive along `slot`
export function lineCells(input: {
  mesh: LazyCuspMesh
  dock: number
  slot: number
  reach: number
}): Map<number, number> {
  const { mesh, dock, slot, reach } = input
  const out = new Map<number, number>([[dock, 0]])

  for (const [d, sign] of [
    [slot, 1],
    [OPPOSITE[slot]!, -1],
  ] as const) {
    let x = dock

    for (let s = 1; s <= reach; s++) {
      x = mesh.neighbour(x, d)
      out.set(x, sign * s)
    }
  }

  return out
}

// whether every weight of the state lies on the line's docks and on the line's two slots
export function onLine(input: {
  state: OneBodyState
  line: ReadonlyMap<number, number>
  slot: number
}): boolean {
  const { state, line, slot } = input

  for (const k of state.weight.keys()) {
    const x = Math.floor(k / SLOTS)
    const d = k % SLOTS

    if (!line.has(x) || (d !== slot && d !== OPPOSITE[slot])) {
      return false
    }
  }

  return true
}

// the line sector: the weight on the slot moving toward + (right) and toward - (left) at each whole-number position
export type LineWalkState = {
  readonly right: ReadonlyMap<number, Eisenstein>
  readonly left: ReadonlyMap<number, Eisenstein>
  readonly t: number
}

export function lineWalkStart(rightMoving: boolean): LineWalkState {
  const one: Eisenstein = [1n, 0n]

  return {
    right: new Map(rightMoving ? [[0, one]] : []),
    left: new Map(rightMoving ? [] : [[0, one]]),
    t: 0,
  }
}

export function lineWalkBeat(input: {
  state: LineWalkState
  husk: ReadonlySet<number>
  coin?: Coin
}): { state: LineWalkState; flow: OneBodyFlow } {
  const { state, husk } = input
  const [keep, reverse] = input.coin ?? FEAR_COIN
  const right = new Map<number, Eisenstein>()
  const left = new Map<number, Eisenstein>()
  const positions = new Set([...state.right.keys(), ...state.left.keys()])

  let out = 0n
  let back = 0n

  const tally = (from: number, to: number, z: Eisenstein): void => {
    if (husk.has(from) && !husk.has(to)) {
      out += norm(z)
    } else if (!husk.has(from) && husk.has(to)) {
      back += norm(z)
    }
  }

  for (const x of positions) {
    const r = state.right.get(x) ?? ZERO
    const l = state.left.get(x) ?? ZERO
    const toRight = plus(times(keep, r), times(reverse, l))
    const toLeft = plus(times(reverse, r), times(keep, l))

    if (!isZero(toRight)) {
      right.set(x + 1, toRight)
      tally(x, x + 1, toRight)
    }

    if (!isZero(toLeft)) {
      left.set(x - 1, toLeft)
      tally(x, x - 1, toLeft)
    }
  }

  return {
    state: { right, left, t: state.t + 1 },
    flow: { out, back, absorbed: 0n },
  }
}

// the husk weight of a line state, over 4^t
export function lineHuskWeight(input: {
  state: LineWalkState
  husk: ReadonlySet<number>
}): bigint {
  let w = 0n

  for (const x of input.husk) {
    w +=
      norm(input.state.right.get(x) ?? ZERO) +
      norm(input.state.left.get(x) ?? ZERO)
  }

  return w
}

// whether a mesh state equals a line state bit for bit, the line indexed by lineCells with `slot` moving toward +
export function sameAsLine(input: {
  state: OneBodyState
  line: ReadonlyMap<number, number>
  slot: number
  walk: LineWalkState
}): boolean {
  const { state, line, slot, walk } = input
  const at = new Map<number, number>()

  for (const [x, s] of line) {
    at.set(s, x)
  }

  const count = walk.right.size + walk.left.size

  if (count !== state.weight.size) {
    return false
  }

  const same = (side: ReadonlyMap<number, Eisenstein>, d: number): boolean =>
    [...side].every(([s, z]) => {
      const x = at.get(s)
      const m = x === undefined ? undefined : state.weight.get(x * SLOTS + d)

      return m !== undefined && m[0] === z[0] && m[1] === z[1]
    })

  return same(walk.right, slot) && same(walk.left, OPPOSITE[slot]!)
}

// <u, v> for Eisenstein vectors, conj(m + n w) = (m - n) - n w
function inner(
  u: ReadonlyMap<number, Eisenstein>,
  v: ReadonlyMap<number, Eisenstein>,
): Eisenstein {
  let sum: Eisenstein = ZERO

  for (const [k, a] of u) {
    const b = v.get(k)

    if (b !== undefined) {
      sum = plus(sum, times([a[0] - a[1], -a[1]], b))
    }
  }

  return sum
}

// the exact Gram matrix of one beat's images of the one-vibe basis states on `docks`, every slot: unitary when every
// image has norm 4 (over 4) and every pair is orthogonal
export function basisGram(input: {
  mesh: LazyCuspMesh
  docks: readonly number[]
  mode: OneBodyMode
}): { states: number; badNorms: number; badPairs: number; pairs: number } {
  const images = input.docks.flatMap(dock =>
    Array.from(
      { length: SLOTS },
      (_, slot) =>
        oneBodyBeat({
          mesh: input.mesh,
          state: oneVibe({ dock, slot }),
          mode: input.mode,
        }).state.weight,
    ),
  )

  let badNorms = 0
  let badPairs = 0
  let pairs = 0

  for (let i = 0; i < images.length; i++) {
    const n = inner(images[i]!, images[i]!)

    if (n[0] !== 4n || n[1] !== 0n) {
      badNorms++
    }

    for (let j = i + 1; j < images.length; j++) {
      const z = inner(images[i]!, images[j]!)

      pairs++

      if (!isZero(z)) {
        badPairs++
      }
    }
  }

  return { states: images.length, badNorms, badPairs, pairs }
}

// breadth-first graph distances on the cusp quotient unfolded over a box of husk windows, from the husk dock of window
// (0, 0, 0) to the husk dock of each target window; -1 when not reached inside the box
export function huskGraphDistances(input: {
  quotient: CuspQuotient
  low: readonly [number, number, number]
  high: readonly [number, number, number]
  targets: readonly (readonly [number, number, number])[]
}): number[] {
  const { quotient: q, low, high } = input
  const span = [0, 1, 2].map(c => high[c]! - low[c]! + 1)
  const windows = span[0]! * span[1]! * span[2]!
  const n = windows * q.cells
  const husk = Array.from(q.level).indexOf(1)
  const id = (a: number, w: readonly number[]): number =>
    (((w[0]! - low[0]) * span[1]! + (w[1]! - low[1])) * span[2]! +
      (w[2]! - low[2])) *
      q.cells +
    a
  const inside = (w: readonly number[]): boolean =>
    w.every((v, c) => v >= low[c]! && v <= high[c]!)
  const distance = new Int32Array(n).fill(-1)
  const queue = new Int32Array(n)

  let head = 0
  let tail = 0

  const source = id(husk, [0, 0, 0])

  distance[source] = 0
  queue[tail++] = source

  while (head < tail) {
    const u = queue[head++]!
    const a = u % q.cells
    const wi = Math.floor(u / q.cells)
    const w = [
      Math.floor(wi / (span[1]! * span[2]!)) + low[0],
      (Math.floor(wi / span[2]!) % span[1]!) + low[1],
      (wi % span[2]!) + low[2],
    ]

    for (let d = 0; d < SLOTS; d++) {
      const e = SLOTS * a + d
      const b = q.neighbour[e]!

      if (b < 0) {
        continue
      }

      const v = w.map((x, c) => x + q.shift[3 * e + c]!)

      if (!inside(v)) {
        continue
      }

      const j = id(b, v)

      if (distance[j]! < 0) {
        distance[j] = distance[u]! + 1
        queue[tail++] = j
      }
    }
  }

  return input.targets.map(t => distance[id(husk, t)]!)
}
