// THE QUANTUM CELLULAR AUTOMATON AXIOMS READ ON THE SUPERPOSED RULE (E-QTM-0184). D'Ariano, Perinotti and Bisio derive
// the Weyl, Dirac and Maxwell walks from a unitary, local, homogeneous and isotropic evolution on a Cayley graph. This
// module holds the exact instruments that read each axiom off a beat that acts on a sum of configurations (the knit's
// state, code/rule/doublet-locked-knit): amplitudes in Z[w][1/2], no float anywhere.
//
//   unitarity     the Gram matrix of the images of a set of basis configurations, exact: every image of norm 1 and
//                 every two images orthogonal (gramReading)
//   light cone    the commutator of a local operator evolved n beats (U^-n A_x U^n) with a local operator B_y at dock
//                 y, applied to a state: zero for every y outside the cone is a strict Lieb-Robinson cone
//                 (heisenbergCommutes)
//   homogeneity   and isotropy: the beat commutes with a symmetry of the mesh (a dock map and a slot map) composed
//                 with a gauge (one grid move per dock applied to every point there, the local unitary on the
//                 internal points): symmetryCommutes. gaugeFor finds the gauge that carries a link field onto its
//                 image under a mesh symmetry, or reports that none exists
//
// The symmetries: the box's translations (translationOf) and the W(F4) maps that fix a dock (f4BoxSymmetries), each as
// a dock permutation and a slot permutation. A slot map that sends a line's first slot to the second of its image
// line flips the line: a stored pair's trit is negated, its two points swap and its open bits swap.
//
// Deterministic, no seeds. Nothing here is a verdict: the experiment sets the gates.

import {
  coinedVetoBeat,
  coinedVetoBeatBack,
} from '@/code/rule/coined-locked-knit'
import {
  lockedTables,
  mergeBranches,
  times,
  type Branch,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { vetoBeat, type VetoKind } from '@/code/rule/occupation-veto-knit'
import {
  LINE_FIRSTS,
  LINE_OF,
  OPPOSITE,
  SIDE,
} from '@/code/rule/isometric-knit'
import { type ColorWeave } from '@/code/rule/color-weave'
import { type GridMoves } from '@/code/rule/vibe-weave'
import { rootsD4 } from '@/code/algebra/group/integer-roots'
import {
  doubledClosure,
  doubledReflection,
  f4Roots,
} from '@/code/algebra/group/hurwitz-f4'
import {
  boxCellMapDoubled,
  d4BoxCell,
  d4BoxCoordinates,
} from '@/code/substrate/d4-box-integer'

const ROOTS = rootsD4()

export type Beat = (s: LockedState, beat: number) => LockedState

// ---- the beats ----

// the working rule (the coin, then the no-veto beat: meetings, collision, stream) and its exact inverse
export function workingBeats(
  t: LockedTables,
  kind: VetoKind = 'none',
): { forward: Beat; back: Beat } {
  return {
    forward: (s, beat) => coinedVetoBeat(kind, t, s, beat),
    back: (s, beat) => coinedVetoBeatBack(kind, t, s, beat),
  }
}

// a CONTROL that is not unitary: the coin cut to its keep term ((1 + w)/2 on every half-full open line, the cross
// branch dropped), then the same no-veto beat
export function keepOnlyBeat(t: LockedTables, kind: VetoKind = 'none'): Beat {
  return (s, beat) => {
    const kept: Branch[] = s.branches.map(br => {
      const b = cloneBranch(br)

      for (let x = 0; x < t.cells; x++) {
        for (const f of LINE_FIRSTS) {
          const i = x * 24 + f
          const j = x * 24 + OPPOSITE[f]!
          const hi = b.vibe[i] !== 0
          const hj = b.vibe[j] !== 0

          if (hi !== hj && b.open[hi ? i : j]) {
            times(b, 1n, 1n)
            b.k++
          }
        }
      }

      return b
    })

    return vetoBeat(kind, t, { branches: mergeBranches(kept) }, beat)
  }
}

// a beat followed by a configuration map (a permutation or a phase applied to every branch), and its inverse
export function thenMap(
  beat: Beat,
  map: (b: Branch) => Branch,
): Beat {
  return (s, t) => mapState(beat(s, t), map)
}

export function mapThen(
  map: (b: Branch) => Branch,
  beat: Beat,
): Beat {
  return (s, t) => beat(mapState(s, map), t)
}

// ---- states, exactly ----

export function cloneBranch(b: Branch): Branch {
  return {
    vibe: Int8Array.from(b.vibe),
    point: Int8Array.from(b.point),
    open: Uint8Array.from(b.open),
    store: Int8Array.from(b.store),
    spoint: Int8Array.from(b.spoint),
    sopen: Uint8Array.from(b.sopen),
    a: b.a,
    b: b.b,
    k: b.k,
  }
}

export function emptyConfiguration(cells: number): Configuration {
  return {
    vibe: new Int8Array(cells * 24),
    point: new Int8Array(cells * 24),
    open: new Uint8Array(cells * 24),
    store: new Int8Array(cells * 12),
    spoint: new Int8Array(cells * 12),
    sopen: new Uint8Array(cells * 12),
  }
}

export function basisState(c: Configuration): LockedState {
  return {
    branches: [
      {
        vibe: Int8Array.from(c.vibe),
        point: Int8Array.from(c.point),
        open: Uint8Array.from(c.open),
        store: Int8Array.from(c.store),
        spoint: Int8Array.from(c.spoint),
        sopen: Uint8Array.from(c.sopen),
        a: 1n,
        b: 0n,
        k: 0,
      },
    ],
  }
}

export function mapState(
  s: LockedState,
  map: (b: Branch) => Branch,
): LockedState {
  return { branches: mergeBranches(s.branches.map(b => map(b))) }
}

// the configuration of a branch as a string key (every held slot and every stored line)
export function configurationKey(c: Configuration): string {
  const parts: string[] = []

  for (let i = 0; i < c.vibe.length; i++) {
    if (c.vibe[i] !== 0) {
      parts.push(`${i}:${c.vibe[i]}:${c.point[i]}:${c.open[i]}`)
    }
  }

  for (let i = 0; i < c.store.length; i++) {
    if (c.store[i] !== 0) {
      parts.push(`s${i}:${c.store[i]}:${c.spoint[i]}:${c.sopen[i]}`)
    }
  }

  return parts.join(',')
}

export type Amplitude = { a: bigint; b: bigint; k: number }

// a state as a compact map from configuration key to its exact amplitude, coincident terms added and every amplitude
// reduced (a + b w over 2^k with k as small as it can be); the state's arrays are not kept
export function stateAmplitudes(s: LockedState): Map<string, Amplitude> {
  const out = new Map<string, Amplitude>()

  for (const br of s.branches) {
    const key = configurationKey(br)
    const twin = out.get(key)

    if (!twin) {
      out.set(key, { a: br.a, b: br.b, k: br.k })
      continue
    }

    const k = Math.max(twin.k, br.k)

    twin.a = twin.a * (1n << BigInt(k - twin.k)) + br.a * (1n << BigInt(k - br.k))
    twin.b = twin.b * (1n << BigInt(k - twin.k)) + br.b * (1n << BigInt(k - br.k))
    twin.k = k
  }

  for (const [key, v] of out) {
    while (v.k > 0 && v.a % 2n === 0n && v.b % 2n === 0n) {
      v.a /= 2n
      v.b /= 2n
      v.k--
    }

    if (v.a === 0n && v.b === 0n) {
      out.delete(key)
    }
  }

  return out
}

const amplitudes = stateAmplitudes

// two states equal as sums of configurations with exact amplitudes
export function sameState(x: LockedState, y: LockedState): boolean {
  const ax = amplitudes(x)
  const ay = amplitudes(y)

  if (ax.size !== ay.size) {
    return false
  }

  for (const [key, u] of ax) {
    const v = ay.get(key)

    if (!v || v.a !== u.a || v.b !== u.b || v.k !== u.k) {
      return false
    }
  }

  return true
}

// conj(u) v for Eisenstein integers: conj(a + b w) = (a - b) - b w
function conjTimes(
  u: { a: bigint; b: bigint },
  v: { a: bigint; b: bigint },
): [bigint, bigint] {
  const x = u.a - u.b
  const y = -u.b

  return [x * v.a - y * v.b, x * v.b + y * v.a - y * v.b]
}

export type GramReading = {
  states: number
  // images whose squared norm is not exactly 1
  badNorms: number
  // pairs of images whose inner product is not exactly 0
  badPairs: number
  // pairs of images that share a configuration (where orthogonality is a real test)
  overlapping: number
  // the largest denominator exponent met
  maxK: number
}

// the exact Gram matrix of a list of states (images of distinct basis configurations under a beat, each given as its
// stateAmplitudes map): all inner products are accumulated through the configurations two images share, so only
// overlapping pairs cost anything
export function gramReading(
  maps: readonly Map<string, Amplitude>[],
): GramReading {
  const images = maps
  const maxK = Math.max(
    0,
    ...maps.flatMap(m => [...m.values()].map(v => v.k)),
  )
  const byKey = new Map<string, { i: number; v: Amplitude }[]>()

  maps.forEach((m, i) => {
    for (const [key, v] of m) {
      const list = byKey.get(key)

      if (list) {
        list.push({ i, v })
      } else {
        byKey.set(key, [{ i, v }])
      }
    }
  })

  const gram = new Map<number, [bigint, bigint]>()
  const n = images.length

  for (const list of byKey.values()) {
    for (const x of list) {
      for (const y of list) {
        if (y.i < x.i) {
          continue
        }

        const [re, im] = conjTimes(x.v, y.v)
        const scale = 1n << BigInt(2 * maxK - x.v.k - y.v.k)
        const key = x.i * n + y.i
        const g = gram.get(key) ?? [0n, 0n]

        gram.set(key, [g[0] + re * scale, g[1] + im * scale])
      }
    }
  }

  const unit = 1n << BigInt(2 * maxK)

  let badNorms = 0
  let badPairs = 0
  let overlapping = 0

  for (let i = 0; i < n; i++) {
    const d = gram.get(i * n + i)

    if (!d || d[0] !== unit || d[1] !== 0n) {
      badNorms++
    }
  }

  for (const [key, g] of gram) {
    const i = Math.floor(key / n)
    const j = key % n

    if (i === j) {
      continue
    }

    overlapping++

    if (g[0] !== 0n || g[1] !== 0n) {
      badPairs++
    }
  }

  return { states: n, badNorms, badPairs, overlapping, maxK }
}

// ---- local operators ----

// the diagonal phase w^m at dock x, m = sum over its held slots of (1 + slot mod 2) times the trit, mod 3: a unitary
// that reads every slot of the dock (a lone vibe on any slot gives a phase other than 1)
export function dockPhase(x: number): (b: Branch) => Branch {
  return b => {
    const out = cloneBranch(b)

    let m = 0

    for (let d = 0; d < 24; d++) {
      m += (1 + (d % 2)) * out.vibe[x * 24 + d]!
    }

    m = ((m % 3) + 3) % 3

    for (let r = 0; r < m; r++) {
      times(out, 0n, 1n)
    }

    return out
  }
}

// the permutation at dock y that carries every slot's content (trit, point, open bit) to the next slot, d -> d + 1
// mod 24; the dock's stores stay. A bijection of configurations, so a unitary
export function dockRotation(y: number): (b: Branch) => Branch {
  return b => {
    const out = cloneBranch(b)

    for (let d = 0; d < 24; d++) {
      const from = y * 24 + d
      const to = y * 24 + ((d + 1) % 24)

      out.vibe[to] = b.vibe[from]!
      out.point[to] = b.point[from]!
      out.open[to] = b.open[from]!
    }

    return out
  }
}

// the swap of every slot and store of two docks, a nonlocal permutation (a CONTROL)
export function dockSwap(x: number, y: number): (b: Branch) => Branch {
  return b => {
    const out = cloneBranch(b)

    for (const [p, q] of [
      [x, y],
      [y, x],
    ] as const) {
      for (let d = 0; d < 24; d++) {
        out.vibe[q * 24 + d] = b.vibe[p * 24 + d]!
        out.point[q * 24 + d] = b.point[p * 24 + d]!
        out.open[q * 24 + d] = b.open[p * 24 + d]!
      }

      for (let l = 0; l < 12; l++) {
        out.store[q * 12 + l] = b.store[p * 12 + l]!
        out.spoint[q * 12 + l] = b.spoint[p * 12 + l]!
        out.sopen[q * 12 + l] = b.sopen[p * 12 + l]!
      }
    }

    return out
  }
}

// a phase w on every configuration holding a vibe at dock z (a local, not homogeneous, CONTROL)
export function dockMarkPhase(z: number): (b: Branch) => Branch {
  return b => {
    const out = cloneBranch(b)

    for (let d = 0; d < 24; d++) {
      if (out.vibe[z * 24 + d] !== 0) {
        times(out, 0n, 1n)
        break
      }
    }

    return out
  }
}

// a phase w for every vibe on slot `slot` of any dock (homogeneous, not isotropic, a CONTROL)
export function slotPhase(
  cells: number,
  slot: number,
): (b: Branch) => Branch {
  return b => {
    const out = cloneBranch(b)

    for (let x = 0; x < cells; x++) {
      if (out.vibe[x * 24 + slot] !== 0) {
        times(out, 0n, 1n)
      }
    }

    return out
  }
}

// U^-n A U^n B psi against B U^-n A U^n psi, exact: true when they agree
export function heisenbergCommutes(input: {
  forward: Beat
  back: Beat
  beats: number
  a: (b: Branch) => Branch
  b: (b: Branch) => Branch
  psi: LockedState
}): boolean {
  const { forward, back, beats, a, b, psi } = input

  const evolved = (s: LockedState): LockedState => {
    let x = s

    for (let t = 0; t < beats; t++) {
      x = forward(x, t)
    }

    x = mapState(x, a)

    for (let t = beats - 1; t >= 0; t--) {
      x = back(x, t)
    }

    return x
  }

  return sameState(evolved(mapState(psi, b)), mapState(evolved(psi), b))
}

// mesh graph distance from a dock, by breadth-first search over the 24 directions
export function dockDistances(
  weave: ColorWeave,
  from: number,
): Int32Array {
  const n = weave.mesh.cellCount
  const dist = new Int32Array(n).fill(-1)

  let frontier = [from]

  dist[from] = 0

  while (frontier.length > 0) {
    const next: number[] = []

    for (const x of frontier) {
      for (let d = 0; d < 24; d++) {
        const y = weave.mesh.neighbour(x, d)

        if (dist[y]! < 0) {
          dist[y] = dist[x]! + 1
          next.push(y)
        }
      }
    }

    frontier = next
  }

  return dist
}

// ---- mesh symmetries with a gauge ----

export type MeshSymmetry = {
  name: string
  // dock x goes to cellMap[x], slot d to slotMap[d]
  cellMap: Int32Array
  slotMap: Int32Array
}

// the translation of the box by basis coordinates `shift`
export function translationOf(
  side: number,
  shift: readonly number[],
): MeshSymmetry {
  const cells = side ** 4
  const cellMap = new Int32Array(cells)

  for (let x = 0; x < cells; x++) {
    const c = d4BoxCoordinates({ cell: x, side })

    cellMap[x] = d4BoxCell({
      coordinates: c.map((v, k) => v + (shift[k] ?? 0)),
      side,
    })
  }

  return {
    name: `translate ${shift.join(',')}`,
    cellMap,
    slotMap: Int32Array.from({ length: 24 }, (_, d) => d),
  }
}

// the W(F4) maps of the box that fix dock 0, from doubled matrices: the 48 reflections (which generate the group) or
// the whole group of 1,152. Each keeps the D4 roots and so the box
export function f4BoxSymmetries(input: {
  side: number
  whole: boolean
}): MeshSymmetry[] {
  const reflections = f4Roots().map(doubledReflection)
  const matrices = input.whole
    ? [...doubledClosure(reflections).values()]
    : reflections
  const out: MeshSymmetry[] = []

  matrices.forEach((m, n) => {
    const rows = [0, 1, 2, 3].map(i =>
      [0, 1, 2, 3].map(j => m[i * 4 + j]!),
    )
    const slotMap = new Int32Array(24)

    for (let d = 0; d < 24; d++) {
      const image = rows.map(
        row => row.reduce((s, x, k) => s + x * ROOTS[d]![k]!, 0) / 2,
      )

      slotMap[d] = ROOTS.findIndex(r => r.every((x, k) => x === image[k]))
    }

    const cellMap = boxCellMapDoubled({ doubled: rows, side: input.side })

    if (!cellMap || slotMap.some(s => s < 0)) {
      throw new Error(`qca-axioms: W(F4) element ${n} does not keep the box`)
    }

    out.push({
      name: `${input.whole ? 'element' : 'reflection'} ${n}`,
      cellMap: Int32Array.from(cellMap),
      slotMap,
    })
  })

  return out
}

// the symmetry applied to a branch, with a gauge (gauge[x]: the grid move applied to every point at dock x before it is
// carried to cellMap[x]); no gauge is the identity move
export function applySymmetry(input: {
  symmetry: MeshSymmetry
  moves: GridMoves
  gauge?: Int16Array
}): (b: Branch) => Branch {
  const { symmetry, moves, gauge } = input
  const { cellMap, slotMap } = symmetry

  return b => {
    const out = cloneBranch(b)

    out.vibe.fill(0)
    out.point.fill(0)
    out.open.fill(0)
    out.store.fill(0)
    out.spoint.fill(0)
    out.sopen.fill(0)

    const cells = cellMap.length

    for (let x = 0; x < cells; x++) {
      const act = moves.act[gauge ? gauge[x]! : moves.identity]!
      const y = cellMap[x]!

      for (let d = 0; d < 24; d++) {
        const v = b.vibe[x * 24 + d]!

        if (v === 0) {
          continue
        }

        const to = y * 24 + slotMap[d]!

        out.vibe[to] = v
        out.point[to] = act[b.point[x * 24 + d]!]!
        out.open[to] = b.open[x * 24 + d]!
      }

      for (let l = 0; l < 12; l++) {
        const tau = b.store[x * 12 + l]!

        if (tau === 0) {
          continue
        }

        const first = slotMap[LINE_FIRSTS[l]!]!
        const flip = SIDE[first] === -1
        const to = y * 12 + LINE_OF[first]!
        const word = b.spoint[x * 12 + l]!
        const s = act[Math.floor(word / 9)]!
        const q = act[word % 9]!
        const o = b.sopen[x * 12 + l]!

        out.store[to] = flip ? -tau : tau
        out.spoint[to] = flip ? 9 * q + s : 9 * s + q
        out.sopen[to] = flip ? ((o & 1) << 1) | ((o >> 1) & 1) : o
      }
    }

    return out
  }
}

// S U psi against U S psi at one beat, exact
export function symmetryCommutes(input: {
  beatOf: Beat
  beatAfter?: Beat
  map: (b: Branch) => Branch
  psi: LockedState
  beat: number
}): boolean {
  const { beatOf, map, psi, beat } = input
  const after = input.beatAfter ?? beatOf

  return sameState(
    mapState(beatOf(psi, beat), map),
    after(mapState(psi, map), beat),
  )
}

// the gauge that makes a symmetry commute with the stream on a link field: h(nbr(x, d)) l(x, d) = l(sx, sd) h(x) for
// every dock and direction. Fixes h at dock 0 to each of the moves in turn, propagates along the mesh and checks every
// link; returns the first consistent gauge, or undefined when none exists
export function gaugeFor(input: {
  weave: ColorWeave
  links: Int16Array
  symmetry: MeshSymmetry
}): Int16Array | undefined {
  const { weave, links, symmetry } = input
  const { moves, mesh } = weave
  const cells = mesh.cellCount
  const { cellMap, slotMap } = symmetry

  for (let g = 0; g < moves.act.length; g++) {
    const h = new Int16Array(cells).fill(-1)
    const queue = [0]

    h[0] = g

    let ok = true

    while (queue.length > 0 && ok) {
      const x = queue.pop()!

      for (let d = 0; d < 24 && ok; d++) {
        const y = mesh.neighbour(x, d)
        const image = links[cellMap[x]! * 24 + slotMap[d]!]!
        const want = moves.compose(
          moves.compose(image, h[x]!),
          moves.inverse[links[x * 24 + d]!]!,
        )

        if (h[y] === -1) {
          h[y] = want
          queue.push(y)
        } else if (h[y] !== want) {
          ok = false
        }
      }
    }

    if (ok) {
      return h
    }
  }

  return undefined
}

// the link field carried by a symmetry: l'(sx, sd) = l(x, d), so that S U_l = U_l' S when the local rule is covariant
export function carriedLinks(
  links: Int16Array,
  symmetry: MeshSymmetry,
): Int16Array {
  const out = new Int16Array(links.length)

  for (let x = 0; x < symmetry.cellMap.length; x++) {
    for (let d = 0; d < 24; d++) {
      out[symmetry.cellMap[x]! * 24 + symmetry.slotMap[d]!] =
        links[x * 24 + d]!
    }
  }

  return out
}

// the tables of the working rule on a weave with a given link field (collision 'pass', as E-QTM-0157 and E-QTM-0167;
// the 'none' veto reads no table flag)
export function tablesWith(
  weave: ColorWeave,
  links?: Int16Array,
): LockedTables {
  return lockedTables(weave, 'pass', links)
}
