// The scatter weave: a four-line binary scattering block on top of a color-local weave, so momentum can
// pass between lines (E-FLD-0024, E-FLD-0025).
//
// E-FLD-0022 showed that in the turning weave's family a rule keeps the particle momentum P only by keeping
// each of the twelve line momenta separately: a couple of two lines is too small a block for momentum to
// pass between lines. The smallest block that passes it while leaving P as the only free invariant is four
// lines whose roots satisfy e_u + e_v = e_w + e_x, the lattice-gas binary scattering (FHP, and the D4
// face-centred hypercubic gas of d'Humieres, Lallemand and Frisch). This file adds that block.
//
// THE SCATTERING. Two tones on u and v, with w and x calm, move to w and x (u to w, v to x), and back: an
// involution, so it is reversible. Any two tones scatter, alike or not, so charge is kept, and P is kept
// since every mover counts one. The pairing u to w, v to x is the one that keeps each slot's side (the
// first or second slot of its line), and only scatterings where such a pairing exists are used (144 of
// the 216): the move exchanges slot contents, role point with vibe, so a calm role point moves from w to
// u keeping its side sign, and a dock's color content (E-FRC-0124, calm slots counted by side) is kept.
// Exchanging role points inside a dock commutes with a change of role frame in that dock.
//
// THE SCHEDULE. The 144 lie in 24 quadruples of lines, six to each, and the 24 quadruples split the twelve
// lines three at a time in exactly six ways. In each quadruple the six scatterings fall into three
// slot-disjoint pairs. Beat t's set S_t is one partition (t mod 6) with one pair choice (floor(t / 6) mod 3)
// in each of its three quadruples, six scatterings on disjoint slots, so they commute. Deterministic, with
// the 24-beat period of the base.
//
// THE BEAT. The collision of beat t is S_t after the base collision B_t after S_(c - t), where c is the
// base's CPT mirror phase: N B_t N = B_(c - t)^-1 (N negates every vibe), and S is its own inverse and
// commutes with N, so N (S_t B_t S_(c - t)) N is the inverse of the collision of beat c - t, and CPT holds
// at the same phase. Placing S on both sides is what CPT asks; a single S on one side breaks it. Since
// c - t and t never fall on the same partition (c odd), the two sets differ.
//
// The base is any ColorLocalSpec (code/rule/color-local-weave). The base collision with role points is a
// copy of that file's private collide (the wire's role points swap when the first slot's weight changes
// sign, a couple's exchange trades role points with vibes); E-FLD-0024 checks it bit for bit against
// colorLocalBeat with the scattering switched off.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { BIND_MOVE_FORWARD, type Collision } from '@/code/rule/collision'
import { stream, streamInverse } from '@/code/rule/lattice-gas'
import { type ColorLocalSpec, colorLocalSpec, invertTable, stateKey, type WireTable } from '@/code/rule/color-local-weave'
import { COLOR_TURN, COLOR_TURN_SWAP_ORDER } from '@/code/rule/color-turn-weave'
import { LONE_WITH_CLOCK } from '@/code/rule/momentum-weave'
import { makeVibeWeave, type VibeState, type VibeWeave } from '@/code/rule/vibe-weave'

// The momentum turn weave, the base of the scatter weave: the color turn weave's schedule (its turn and its
// swap order, out and back) with the bind table and the momentum-keeping exchange of E-FLD-0023 (a lone
// tone on either slot against a calm or paired line), so every couple keeps both of its line momenta
export const MOMENTUM_TURN_SPEC: ColorLocalSpec = colorLocalSpec({
  tables: [BIND_MOVE_FORWARD],
  turn: COLOR_TURN,
  swapAt: [...COLOR_TURN_SWAP_ORDER, ...[...COLOR_TURN_SWAP_ORDER].reverse()],
  swapWhen: (line, wire) => LONE_WITH_CLOCK[line * 9 + wire] === 1,
})

// the momentum weave of E-FLD-0023 in the same form (the committed schedule)
export const MOMENTUM_WEAVE_COLOR_SPEC: ColorLocalSpec = colorLocalSpec({
  tables: [BIND_MOVE_FORWARD],
  swapWhen: (line, wire) => LONE_WITH_CLOCK[line * 9 + wire] === 1,
})

// u, v, w, x: slot u exchanges with w and v with x
export type Scattering = readonly [number, number, number, number]

export type ScatterQuad = {
  readonly lines: readonly number[]
  readonly scatterings: readonly Scattering[]
  // the three slot-disjoint pairs of the six scatterings
  readonly pairs: readonly (readonly [Scattering, Scattering])[]
}

const ROOTS = rootsD4()
const OPPOSITE = ROOTS.map(r => ROOTS.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))
const LINE_OF: number[] = []

{
  let count = 0

  ROOTS.forEach((_, d) => {
    if (d < (OPPOSITE[d] ?? d)) {
      LINE_OF[d] = count
      LINE_OF[OPPOSITE[d] ?? d] = count
      count++
    }
  })
}

// +1 for the first slot of its line, -1 for the second
export const SIDE: readonly number[] = ROOTS.map((_, d) => (d < (OPPOSITE[d] ?? d) ? 1 : -1))

export const lineOfSlot = (d: number): number => LINE_OF[d] ?? -1

// every binary scattering of the dock: e_u + e_v = e_w + e_x on four distinct lines, with the flag of
// whether a side-keeping pairing exists (then u and w, v and x share a side)
export function allScatterings(): { scattering: Scattering; sideKept: boolean }[] {
  const out: { scattering: Scattering; sideKept: boolean }[] = []

  for (let u = 0; u < 24; u++) {
    for (let v = u + 1; v < 24; v++) {
      for (let w = u + 1; w < 24; w++) {
        for (let x = w + 1; x < 24; x++) {
          if (new Set([LINE_OF[u], LINE_OF[v], LINE_OF[w], LINE_OF[x]]).size !== 4) {
            continue
          }

          const sums = [0, 1, 2, 3].every(k => (ROOTS[u]?.[k] ?? 0) + (ROOTS[v]?.[k] ?? 0) === (ROOTS[w]?.[k] ?? 0) + (ROOTS[x]?.[k] ?? 0))

          if (!sums) {
            continue
          }

          const sideKept = (SIDE[u] ?? 0) + (SIDE[v] ?? 0) === (SIDE[w] ?? 0) + (SIDE[x] ?? 0)
          const scattering: Scattering = SIDE[u] === SIDE[w] ? [u, v, w, x] : [u, v, x, w]

          out.push({ scattering, sideKept })
        }
      }
    }
  }

  return out
}

export function scatterQuads(): ScatterQuad[] {
  const byQuad = new Map<string, Scattering[]>()

  for (const { scattering, sideKept } of allScatterings()) {
    if (!sideKept) {
      continue
    }

    const key = scattering
      .map(d => LINE_OF[d] ?? 0)
      .sort((a, b) => a - b)
      .join(',')

    byQuad.set(key, [...(byQuad.get(key) ?? []), scattering])
  }

  return [...byQuad].map(([key, scatterings]) => {
    const pairs: [Scattering, Scattering][] = []
    const used = new Set<number>()

    scatterings.forEach((a, i) => {
      if (used.has(i)) {
        return
      }

      const j = scatterings.findIndex((b, k) => k > i && !used.has(k) && b.every(d => !a.includes(d)))

      if (j >= 0) {
        used.add(i)
        used.add(j)
        pairs.push([a, scatterings[j] ?? a])
      }
    })

    return { lines: key.split(',').map(Number), scatterings, pairs }
  })
}

// the partitions of the twelve lines into three hosting quadruples, as quad indices
export function scatterPartitions(quads: readonly ScatterQuad[]): number[][] {
  const out: number[][] = []

  for (let a = 0; a < quads.length; a++) {
    for (let b = a + 1; b < quads.length; b++) {
      for (let c = b + 1; c < quads.length; c++) {
        const lines = new Set([...(quads[a]?.lines ?? []), ...(quads[b]?.lines ?? []), ...(quads[c]?.lines ?? [])])

        if (lines.size === 12) {
          out.push([a, b, c])
        }
      }
    }
  }

  return out
}

// the 24 scattering sets of the schedule: partition t mod 6, pair choice floor(t / 6) mod 3
export function scatterSchedule(): Scattering[][] {
  const quads = scatterQuads()
  const partitions = scatterPartitions(quads)

  return Array.from({ length: 24 }, (_, t) => {
    const partition = partitions[t % partitions.length] ?? []
    const choice = Math.floor(t / partitions.length) % 3

    return partition.flatMap(q => [...(quads[q]?.pairs[choice] ?? [])])
  })
}

export type ScatterWeaveSpec = {
  readonly base: ColorLocalSpec
  // the base's CPT mirror phase, measured on the base
  readonly mirror: number
  // the scattering set of each beat of the period; empty sets switch the block off
  readonly sets: readonly (readonly Scattering[])[]
  // only lone tones scatter, into lines that are wholly calm (the default); false lets any two tones
  // scatter into two calm slots, pair members of the vacuum included
  readonly lone?: boolean
}

const at = (list: readonly number[], t: number): number => list[((t % list.length) + list.length) % list.length] ?? 0
const mod = (t: number, n: number): number => ((t % n) + n) % n

type Built = {
  readonly lines: readonly (readonly [number, number])[]
  readonly positions: readonly (readonly (readonly [number, number])[])[]
  readonly forwardTables: readonly WireTable[]
  readonly inverseTables: readonly WireTable[]
  readonly fires: Uint8Array
  readonly sets: readonly Int32Array[]
}

function build(spec: ScatterWeaveSpec, opposite: readonly number[]): Built {
  const base = spec.base
  const lines: [number, number][] = []

  for (let d = 0; d < opposite.length; d++) {
    const o = opposite[d] ?? d

    if (d < o) {
      lines.push([d, o])
    }
  }

  const norm = (a: number, b: number): readonly [number, number] => (a < b ? [a, b] : [b, a])
  const positions: (readonly [number, number])[][] = []

  let current = base.couplesZero.map(([a, b]) => norm(a, b))

  for (let i = 0; i < 12; i++) {
    positions.push(current)
    current = current.map(([a, b]) => norm(base.turn[a] ?? a, base.turn[b] ?? b))
  }

  const fires = new Uint8Array(81)

  for (let l = 0; l < 9; l++) {
    for (let w = 0; w < 9; w++) {
      fires[l * 9 + w] = base.swapWhen(l, w) || base.swapWhen(w, l) ? 1 : 0
    }
  }

  return {
    lines,
    positions,
    forwardTables: base.tables,
    inverseTables: base.tables.map(invertTable),
    fires,
    sets: spec.sets.map(set => Int32Array.from(set.flatMap(s => [...s]))),
  }
}

// the scattering set, in place: two tones on u, v with w, x calm move to w, x, and back. With `lone`, only
// lone tones scatter (the opposite slots of all four calm), so the head-on pairs of the vacuum never do
function scatter(vibe: Int8Array, role: Int8Array | undefined, base: number, set: Int32Array, lone: boolean): void {
  for (let k = 0; k < set.length; k += 4) {
    const u = base + (set[k] ?? 0)
    const v = base + (set[k + 1] ?? 0)
    const w = base + (set[k + 2] ?? 0)
    const x = base + (set[k + 3] ?? 0)

    if (
      lone &&
      (vibe[base + (OPPOSITE[set[k] ?? 0] ?? 0)] !== 0 ||
        vibe[base + (OPPOSITE[set[k + 1] ?? 0] ?? 0)] !== 0 ||
        vibe[base + (OPPOSITE[set[k + 2] ?? 0] ?? 0)] !== 0 ||
        vibe[base + (OPPOSITE[set[k + 3] ?? 0] ?? 0)] !== 0)
    ) {
      continue
    }

    const here = vibe[u] !== 0 && vibe[v] !== 0 && vibe[w] === 0 && vibe[x] === 0
    const there = vibe[w] !== 0 && vibe[x] !== 0 && vibe[u] === 0 && vibe[v] === 0

    if (!here && !there) {
      continue
    }

    for (const [i, j] of [
      [u, w],
      [v, x],
    ] as const) {
      const a = vibe[i] ?? 0

      vibe[i] = vibe[j] ?? 0
      vibe[j] = a

      if (role) {
        const r = role[i] ?? 0

        role[i] = role[j] ?? 0
        role[j] = r
      }
    }
  }
}

function exchange(vibe: Int8Array, role: Int8Array | undefined, base: number, line: readonly [number, number], wire: readonly [number, number], fires: Uint8Array): void {
  const l = stateKey(vibe[base + line[0]] ?? 0, vibe[base + line[1]] ?? 0)
  const w = stateKey(vibe[base + wire[0]] ?? 0, vibe[base + wire[1]] ?? 0)

  if (fires[l * 9 + w] !== 1) {
    return
  }

  for (let s = 0; s < 2; s++) {
    const i = base + (line[s] ?? 0)
    const j = base + (wire[s] ?? 0)
    const v = vibe[i] ?? 0

    vibe[i] = vibe[j] ?? 0
    vibe[j] = v

    if (role) {
      const r = role[i] ?? 0

      role[i] = role[j] ?? 0
      role[j] = r
    }
  }
}

function clock(vibe: Int8Array, role: Int8Array | undefined, base: number, wire: readonly [number, number], table: WireTable): void {
  const i = base + wire[0]
  const j = base + wire[1]
  const a = vibe[i] ?? 0
  const b = vibe[j] ?? 0
  const image = table[stateKey(a, b)] ?? [a, b]

  vibe[i] = image[0]
  vibe[j] = image[1]

  if (role && (a !== 0 ? a : 1) !== (image[0] !== 0 ? image[0] : 1)) {
    const r = role[i] ?? 0

    role[i] = role[j] ?? 0
    role[j] = r
  }
}

// the base collision of beat t on one dock, with role points when given (a copy of color-local-weave's)
function baseCollide(spec: ColorLocalSpec, built: Built, vibe: Int8Array, role: Int8Array | undefined, base: number, t: number, forward: boolean): void {
  const tables = forward ? built.forwardTables : built.inverseTables
  const tableIndex = at(spec.tableAt, t)
  const couples = built.positions[at(spec.positionAt, t)] ?? []
  const swapIndex = at(spec.swapAt, t)

  for (let k = 0; k < couples.length; k++) {
    const table =
      (k === swapIndex && spec.swapTable !== undefined
        ? tables[spec.swapTable]
        : tables[(tableIndex + (spec.coupleTable?.[k] ?? 0)) % tables.length]) ?? []
    const line = built.lines[couples[k]?.[0] ?? 0] ?? [0, 0]
    const wire = built.lines[couples[k]?.[1] ?? 0] ?? [0, 0]

    if (k !== swapIndex) {
      clock(vibe, role, base, wire, table)
    } else if (spec.palindrome) {
      exchange(vibe, role, base, line, wire, built.fires)
      clock(vibe, role, base, wire, table)
      exchange(vibe, role, base, line, wire, built.fires)
    } else if (forward) {
      exchange(vibe, role, base, line, wire, built.fires)
      clock(vibe, role, base, wire, table)
    } else {
      clock(vibe, role, base, wire, table)
      exchange(vibe, role, base, line, wire, built.fires)
    }
  }
}

// the whole dock collision of beat t: S_t after B_t after S_(c - t), or its inverse
function dockCollide(spec: ScatterWeaveSpec, built: Built, vibe: Int8Array, role: Int8Array | undefined, base: number, t: number, forward: boolean): void {
  const n = built.sets.length
  const first = n > 0 ? built.sets[mod(spec.mirror - t, n)] : undefined
  const last = n > 0 ? built.sets[mod(t, n)] : undefined

  const lone = spec.lone ?? true

  if (forward) {
    if (first) scatter(vibe, role, base, first, lone)
    baseCollide(spec.base, built, vibe, role, base, t, true)
    if (last) scatter(vibe, role, base, last, lone)
  } else {
    if (last) scatter(vibe, role, base, last, lone)
    baseCollide(spec.base, built, vibe, role, base, t, false)
    if (first) scatter(vibe, role, base, first, lone)
  }
}

// the vibe collision of beat t, forward or inverse, for the lattice-gas engine
export function scatterCollision(input: { spec: ScatterWeaveSpec; opposite: readonly number[]; forward?: boolean }): (t: number) => Collision {
  const built = build(input.spec, input.opposite)
  const forward = input.forward ?? true

  return t => (slots, base) => dockCollide(input.spec, built, slots, undefined, base, t, forward)
}

export type ScatterWeave = VibeWeave & {
  readonly spec: ScatterWeaveSpec
  readonly built: Built
}

export function makeScatterWeave(input: { side: number; spec: ScatterWeaveSpec }): ScatterWeave {
  const weave = makeVibeWeave({ side: input.side })

  return { ...weave, spec: input.spec, built: build(input.spec, weave.opposite) }
}

// one beat with role points and flows, as colorLocalBeat: collide every dock, then stream
export function scatterBeat(weave: ScatterWeave, state: VibeState, t: number): VibeState {
  const { mesh, moves, links } = weave
  const vibe = Int8Array.from(state.vibe)
  const role = Int8Array.from(state.role)
  const flow = Int32Array.from(state.flow)

  for (let x = 0; x < mesh.cellCount; x++) {
    dockCollide(weave.spec, weave.built, vibe, role, x * 24, t, true)
  }

  const moved = new Int8Array(role.length)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      const slot = x * 24 + d

      moved[mesh.neighbour(x, d) * 24 + d] = moves.act[links[slot] ?? moves.identity]?.[role[slot] ?? 0] ?? 0
      flow[slot] = (flow[slot] ?? 0) + (vibe[slot] ?? 0)
    }
  }

  return { vibe: stream({ mesh, data: vibe }).data, role: moved, flow }
}

export function scatterBeatBack(weave: ScatterWeave, state: VibeState, t: number): VibeState {
  const { mesh, moves, links, opposite } = weave
  const vibe = streamInverse({ mesh, data: Int8Array.from(state.vibe) }).data
  const role = new Int8Array(state.role.length)
  const flow = Int32Array.from(state.flow)

  for (let y = 0; y < mesh.cellCount; y++) {
    for (let d = 0; d < 24; d++) {
      const x = mesh.neighbour(y, opposite[d] ?? d)
      const slot = x * 24 + d

      role[slot] = moves.act[moves.inverse[links[slot] ?? moves.identity] ?? moves.identity]?.[state.role[y * 24 + d] ?? 0] ?? 0
      flow[slot] = (flow[slot] ?? 0) - (vibe[slot] ?? 0)
    }
  }

  for (let x = 0; x < mesh.cellCount; x++) {
    dockCollide(weave.spec, weave.built, vibe, role, x * 24, t, false)
  }

  return { vibe, role, flow }
}

const mod3 = (x: number): number => ((x % 3) + 3) % 3

// a dock's color content [weight, x, y] mod 3, the weight of a slot its vibe or, calm, its side sign
export function dockColor(vibe: Int8Array, role: Int8Array, x: number): string {
  let w = 0
  let qx = 0
  let qy = 0

  for (let d = 0; d < 24; d++) {
    const v = vibe[x * 24 + d] ?? 0
    const weight = v !== 0 ? v : (SIDE[d] ?? 1)
    const p = role[x * 24 + d] ?? 0

    w += weight
    qx += weight * (p % 3)
    qy += weight * Math.floor(p / 3)
  }

  return `${mod3(w)},${mod3(qx)},${mod3(qy)}`
}

// how many docks the collision of beat t changes the color content of
export function scatterLeaks(weave: ScatterWeave, state: VibeState, t: number): number {
  const vibe = Int8Array.from(state.vibe)
  const role = Int8Array.from(state.role)

  let leaks = 0

  for (let x = 0; x < weave.mesh.cellCount; x++) {
    const before = dockColor(vibe, role, x)

    dockCollide(weave.spec, weave.built, vibe, role, x * 24, t, true)
    leaks += dockColor(vibe, role, x) === before ? 0 : 1
  }

  return leaks
}
