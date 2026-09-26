// Parity on the husk for the doublet-locked knit (code/rule/doublet-locked-knit), E-FRC-0248 and E-FRC-0249.
//
// WHAT P IS. The husk is the column-sum shadow of the D4 box along the depth x4 (code/measure/photon-husk), so a husk
// point map is a signed permutation of the three husk axes, and it lifts to the bulk in two ways that the husk cannot
// tell apart: with the depth kept (x4 -> x4) or reversed (x4 -> -x4). A column sum does not see the order down its
// column, so both lifts read the same on every husk observable. Of the 96 lifts, 48 reverse the husk's orientation (a
// husk parity), and of those 24 are reflections of the bulk (det -1) and 24 are ROTATIONS of the bulk (det +1). Every
// one is a signed coordinate permutation, so it lies in W(B4), inside W(F4), and is an automorphism of the D4 box.
//
// HOW P ACTS ON A CONFIGURATION: a dock x goes to g x, a slot d to g d, a vibe keeps its sign, a stored pair keeps its
// line but its orientation flips where g sends the line's first slot onto the image line's second slot (a store tau
// makes tau on the first slot), and a role point p goes to pi(p) for a chosen bijection pi of the 9 grid points (the
// lift of P to the roles). The links are carried with the dock and conjugated by pi. The amplitudes are untouched: this
// P is LINEAR. Its antilinear companion (the same map with every amplitude conjugated) is also given, because the one
// place the locked rule is complex (the like meeting, (1 + w)/2 and -(1 - w)/2) is exactly where the two differ.
//
// THE READINGS (measurement: exact integers, and exact rationals in bigint for a superposed state):
//  - the husk current of a configuration: per husk column, the sum of the husk shadows of the slots its vibes hold
//    (the direction the stream just copied each one along), counted per vibe (the number current) or signed by the
//    vibe (the charge current);
//  - its helicity H = sum over columns of J . curl J, the curl by central differences on the periodic husk. For any
//    signed axis permutation s of the husk, H of the image field is det(s) H exactly: a parity-odd integer;
//  - the lock's own helicity: each vibe's doublet label read against the step it is copied by (code/rule/
//    locked-token-line stepTable), summed.
//
// THE TOYS (planted, labeled as toys, never the model): after the collision each dock may turn its slots by a husk
// quarter turn that fixes the depth.
//  - the chiral twist: a dock whose occupation momentum casts a husk shadow along one axis n turns by a quarter turn
//    about n, right-handed (sense +1) or left-handed (sense -1). The turn fixes the momentum, so the same dock turns
//    back under the inverse: reversible. It commutes with every husk rotation and is carried by a husk reflection onto
//    the other sense: a rule with a handedness and no preferred direction.
//  - the fixed turn: every dock turns a quarter turn about +x3. Anisotropic, but the husk inversion commutes with it,
//    so it has no handedness under P: the achiral control.
//
// NOTHING MOVES: every map here relabels which slot holds which value; the stream copies.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { LINE_FIRSTS, LINE_OF, SIDE, slotPermutationOf } from '@/code/rule/isometric-knit'
import { boxCellMapDoubled, d4BoxCoordinates, d4Vector } from '@/code/substrate/d4-box'
import { type ColorWeave } from '@/code/rule/color-weave'
import { type GridMoves } from '@/code/rule/vibe-weave'
import { type Configuration, type LockedState, type LockedTables, type Branch, lockedBeat, lockedBeatBack, sameConfiguration, streamConfiguration, norm } from '@/code/rule/doublet-locked-knit'
import { idRun } from '@/code/measure/doublet-locked-readings'
import { stepTable, type Convention } from '@/code/rule/locked-token-line'

const ROOTS = rootsD4()

// ---- the husk point group, lifted ----

export type HuskMap = {
  readonly name: string
  // 4 x 4 integer matrix (rows): v'_i = sum_j m_ij v_j
  readonly matrix: readonly (readonly number[])[]
  readonly slots: Int32Array
  // the husk part's determinant (-1: a husk parity) and the bulk matrix's
  readonly huskDet: number
  readonly bulkDet: number
}

const PERMS3: readonly (readonly number[])[] = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
]
const permSign = (p: readonly number[]): number => {
  let s = 1

  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) if ((p[i] as number) > (p[j] as number)) s = -s

  return s
}

// the 96 signed permutations of the husk axes, each with the depth kept or reversed
export function huskMaps(): HuskMap[] {
  const out: HuskMap[] = []

  for (const perm of PERMS3) {
    for (let signs = 0; signs < 8; signs++) {
      for (const depth of [1, -1]) {
        const s = [0, 1, 2].map(k => ((signs >> k) & 1 ? -1 : 1))
        const matrix = [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => (i < 3 ? (j === perm[i] ? (s[i] as number) : 0) : j === 3 ? depth : 0)))
        const slots = slotPermutationOf(matrix)

        if (!slots) throw new Error('a husk map does not permute the D4 roots')

        const huskDet = permSign(perm) * (s[0] as number) * (s[1] as number) * (s[2] as number)

        out.push({ name: `[${perm.map((p, i) => `${(s[i] as number) < 0 ? '-' : '+'}x${p + 1}`).join(',')},${depth < 0 ? '-' : '+'}x4]`, matrix, slots, huskDet, bulkDet: huskDet * depth })
      }
    }
  }

  return out
}

// the husk inversion x -> -x on the three husk axes, with the depth kept (a bulk reflection) or reversed (the bulk
// inversion -1, a bulk rotation)
export function huskInversion(depthReversed: boolean): HuskMap {
  const found = huskMaps().find(m => m.matrix.every((row, i) => row.every((v, j) => v === (i === j ? (i < 3 ? -1 : depthReversed ? -1 : 1) : 0))))

  if (!found) throw new Error('no husk inversion')

  return found
}

// ---- the lift to the roles: a bijection of the 9 grid points (p = x + 3 y) ----

export const IDENTITY_POINTS: Int8Array = Int8Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8])

// (x, y) -> (x, -y): determinant -1, the anti-symplectic lift (it reverses the grid's orientation, as a reflection
// reverses the husk's)
export const FLIP_POINTS: Int8Array = Int8Array.from({ length: 9 }, (_, p) => (p % 3) + 3 * ((3 - Math.floor(p / 3)) % 3))

export type Mirror = { readonly map: HuskMap; readonly cells: Int32Array; readonly points: Int8Array }

export function mirrorOf(map: HuskMap, side: number, points: Int8Array = IDENTITY_POINTS): Mirror {
  const cells = boxCellMapDoubled({ doubled: map.matrix.map(row => row.map(v => 2 * v)), side })

  if (!cells) throw new Error(`${map.name} is not an automorphism of the side-${side} box`)

  return { map, cells: Int32Array.from(cells), points }
}

// the motion reversal's slot part: every slot to its opposite, on the same dock (the -1 coin map R)
export function reversalMirror(cells: number): Mirror {
  const minus = huskInversion(true)

  return { map: minus, cells: Int32Array.from({ length: cells }, (_, x) => x), points: IDENTITY_POINTS }
}

export function mirrorConfiguration(m: Mirror, c: Configuration): Configuration {
  const g = m.map.slots
  const pi = m.points
  const out: Configuration = {
    vibe: new Int8Array(c.vibe.length),
    point: new Int8Array(c.point.length),
    open: new Uint8Array(c.open.length),
    store: new Int8Array(c.store.length),
    spoint: new Int8Array(c.spoint.length),
    sopen: new Uint8Array(c.sopen.length),
  }

  for (let x = 0; x < m.cells.length; x++) {
    const y = m.cells[x] as number

    for (let d = 0; d < 24; d++) {
      const from = x * 24 + d
      const to = y * 24 + (g[d] as number)

      out.vibe[to] = c.vibe[from] as number
      out.point[to] = pi[c.point[from] as number] as number
      out.open[to] = c.open[from] as number
    }

    for (let l = 0; l < 12; l++) {
      const image = g[LINE_FIRSTS[l] as number] as number
      const k = LINE_OF[image] as number
      const flip = SIDE[image] === -1
      const o = c.sopen[x * 12 + l] as number

      out.store[y * 12 + k] = (flip ? -1 : 1) * (c.store[x * 12 + l] as number)
      out.spoint[y * 12 + k] = pi[c.spoint[x * 12 + l] as number] as number
      out.sopen[y * 12 + k] = flip ? ((o & 1) << 1) | ((o >> 1) & 1) : o
    }
  }

  return out
}

// the links a mirror carries: the link on (x, d) goes to (g x, g d), its grid move conjugated by the point lift
export function mirrorLinks(m: Mirror, links: Int16Array, moves: GridMoves): Int16Array {
  const index = new Map(moves.act.map((table, i) => [table.join(','), i]))
  const inverse = new Int8Array(9)

  m.points.forEach((q, p) => {
    inverse[q] = p
  })

  const conjugate = moves.act.map(table => {
    const image = Int8Array.from({ length: 9 }, (_, q) => m.points[table[inverse[q] as number] as number] as number)
    const found = index.get(image.join(','))

    if (found === undefined) throw new Error('the point lift does not normalize the grid moves')

    return found
  })
  const out = new Int16Array(links.length)

  for (let x = 0; x < m.cells.length; x++) {
    for (let d = 0; d < 24; d++) out[(m.cells[x] as number) * 24 + (m.map.slots[d] as number)] = conjugate[links[x * 24 + d] as number] as number
  }

  return out
}

// ---- maps on a superposed state ----

const cloneBranchWith = (b: Branch, c: Configuration): Branch => ({ ...c, a: b.a, b: b.b, k: b.k })

export function mapState(s: LockedState, f: (c: Configuration) => Configuration): LockedState {
  return { branches: s.branches.map(b => cloneBranchWith(b, f(b))) }
}

// conj(a + b w) = (a - b) - b w
export function conjugateState(s: LockedState): LockedState {
  return { branches: s.branches.map(b => ({ ...b, a: b.a - b.b, b: -b.b })) }
}

export function chargeConjugate(c: Configuration): Configuration {
  return { vibe: Int8Array.from(c.vibe, v => -v), point: Int8Array.from(c.point), open: Uint8Array.from(c.open), store: Int8Array.from(c.store, v => -v), spoint: Int8Array.from(c.spoint), sopen: Uint8Array.from(c.sopen) }
}

// the motion reversal T = K S R: every slot to its opposite on its dock, one stream, every amplitude conjugated
export function motionReversal(tables: LockedTables, s: LockedState): LockedState {
  const r = reversalMirror(tables.cells)

  return conjugateState(
    mapState(s, c => {
      const out = mirrorConfiguration(r, c)

      streamConfiguration(tables, out, false)

      return out
    }),
  )
}

// the same, with no conjugation (the linear motion reversal, which the complex meeting must refuse)
export function linearMotionReversal(tables: LockedTables, s: LockedState): LockedState {
  return conjugateState(motionReversal(tables, s))
}

// equal states: the same configurations with equal amplitudes, (a + b w) / 2^k compared exactly
export function sameState(x: LockedState, y: LockedState): boolean {
  if (x.branches.length !== y.branches.length) return false

  const used = new Uint8Array(y.branches.length)

  for (const b of x.branches) {
    let hit = -1

    for (let j = 0; j < y.branches.length && hit < 0; j++) {
      const o = y.branches[j] as Branch

      if (used[j] || !sameConfiguration(b, o)) continue

      const k = Math.max(b.k, o.k)
      const s1 = 1n << BigInt(k - b.k)
      const s2 = 1n << BigInt(k - o.k)

      if (b.a * s1 === o.a * s2 && b.b * s1 === o.b * s2) hit = j
    }

    if (hit < 0) return false
    used[hit] = 1
  }

  return true
}

// ---- the toys: a husk quarter turn after the collision ----

const cross = (a: readonly number[], b: readonly number[]): number[] => [(a[1] as number) * (b[2] as number) - (a[2] as number) * (b[1] as number), (a[2] as number) * (b[0] as number) - (a[0] as number) * (b[2] as number), (a[0] as number) * (b[1] as number) - (a[1] as number) * (b[0] as number)]

// the quarter turn about the husk unit n (sense +1 right-handed, -1 left), the depth fixed, as a slot permutation
export function quarterTurn(n: readonly number[], sense: number): Int32Array {
  const columns = [0, 1, 2, 3].map(j => {
    const e = [0, 0, 0, 0]

    e[j] = 1

    if (j === 3) return e

    const h = e.slice(0, 3)
    const dot = h.reduce((s, v, k) => s + v * (n[k] as number), 0)
    const c = cross(n, h)

    return [0, 1, 2].map(k => (n[k] as number) * dot + sense * (c[k] as number)).concat([0])
  })
  const matrix = [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => columns[j]?.[i] as number))
  const slots = slotPermutationOf(matrix)

  if (!slots) throw new Error('a quarter turn does not permute the roots')

  return slots
}

export type DockTurn = (c: Configuration, x: number) => void

function turnDock(c: Configuration, x: number, perm: Int32Array): void {
  const base = x * 24
  const v = c.vibe.slice(base, base + 24)
  const p = c.point.slice(base, base + 24)
  const o = c.open.slice(base, base + 24)

  for (let d = 0; d < 24; d++) {
    const to = base + (perm[d] as number)

    c.vibe[to] = v[d] as number
    c.point[to] = p[d] as number
    c.open[to] = o[d] as number
  }
}

// the chiral twist: turn about the husk axis of the dock's occupation momentum, when that shadow lies on one axis
export function chiralTwist(sense: number): DockTurn {
  const turns = [0, 1, 2].map(a => [1, -1].map(s => quarterTurn([0, 1, 2].map(k => (k === a ? s : 0)), sense)))

  return (c, x) => {
    const base = x * 24
    const p = [0, 0, 0]

    for (let d = 0; d < 24; d++) {
      if (c.vibe[base + d] === 0) continue

      const r = ROOTS[d] as number[]

      p[0]! += r[0] as number
      p[1]! += r[1] as number
      p[2]! += r[2] as number
    }

    const axes = p.filter(v => v !== 0).length

    if (axes !== 1) return

    const a = p.findIndex(v => v !== 0)

    turnDock(c, x, turns[a]?.[(p[a] as number) > 0 ? 0 : 1] as Int32Array)
  }
}

// the fixed turn about +x3 on every dock
export function fixedTurn(sense: number): DockTurn {
  const perm = quarterTurn([0, 0, 1], sense)

  return (c, x) => turnDock(c, x, perm)
}

// a toy beat: the locked beat with the dock turn applied between the collision and the stream (S T C M, built as
// S T S^-1 after the rule's own beat), and its exact inverse (the turn inverted by the other sense)
export function toyBeat(tables: LockedTables, s: LockedState, t: number, turn: DockTurn): LockedState {
  const next = lockedBeat(tables, s, t)

  for (const b of next.branches) {
    streamConfiguration(tables, b, true)
    for (let x = 0; x < tables.cells; x++) turn(b, x)
    streamConfiguration(tables, b, false)
  }

  return next
}

export function toyBeatBack(tables: LockedTables, s: LockedState, t: number, inverseTurn: DockTurn): LockedState {
  const copy = mapState(s, c => ({ vibe: Int8Array.from(c.vibe), point: Int8Array.from(c.point), open: Uint8Array.from(c.open), store: Int8Array.from(c.store), spoint: Int8Array.from(c.spoint), sopen: Uint8Array.from(c.sopen) }))

  for (const b of copy.branches) {
    streamConfiguration(tables, b, true)
    for (let x = 0; x < tables.cells; x++) inverseTurn(b, x)
    streamConfiguration(tables, b, false)
  }

  return lockedBeatBack(tables, copy, t)
}

// ---- the husk current and its helicity ----

export type HuskFrame = { readonly side: number; readonly column: Int32Array }

const modulo = (v: number, n: number): number => ((v % n) + n) % n

export function huskFrame(side: number): HuskFrame {
  const column = Int32Array.from({ length: side ** 4 }, (_, x) => {
    const v = d4Vector(d4BoxCoordinates({ cell: x, side }))

    return modulo(v[0] as number, side) + side * modulo(v[1] as number, side) + side * side * modulo(v[2] as number, side)
  })

  return { side, column }
}

// the husk current: 3 integers per column; `signed` weights each vibe by its sign (the charge current)
export function huskCurrent(frame: HuskFrame, c: Configuration, signed: boolean): Int32Array {
  const j = new Int32Array(frame.side ** 3 * 3)

  for (let slot = 0; slot < c.vibe.length; slot++) {
    const v = c.vibe[slot] as number

    if (v === 0) continue

    const w = signed ? v : 1
    const X = frame.column[(slot / 24) | 0] as number
    const r = ROOTS[slot % 24] as number[]

    j[X * 3] = (j[X * 3] as number) + w * (r[0] as number)
    j[X * 3 + 1] = (j[X * 3 + 1] as number) + w * (r[1] as number)
    j[X * 3 + 2] = (j[X * 3 + 2] as number) + w * (r[2] as number)
  }

  return j
}

// H = sum_X J(X) . curl J(X), the curl by central differences (twice the lattice curl, to stay in integers)
export function helicity(frame: HuskFrame, j: Int32Array): number {
  const L = frame.side
  const at = (x: number, y: number, z: number, k: number): number => j[(modulo(x, L) + L * modulo(y, L) + L * L * modulo(z, L)) * 3 + k] as number
  let h = 0

  for (let z = 0; z < L; z++) {
    for (let y = 0; y < L; y++) {
      for (let x = 0; x < L; x++) {
        const cx = at(x, y + 1, z, 2) - at(x, y - 1, z, 2) - (at(x, y, z + 1, 1) - at(x, y, z - 1, 1))
        const cy = at(x, y, z + 1, 0) - at(x, y, z - 1, 0) - (at(x + 1, y, z, 2) - at(x - 1, y, z, 2))
        const cz = at(x + 1, y, z, 1) - at(x - 1, y, z, 1) - (at(x, y + 1, z, 0) - at(x, y - 1, z, 0))

        h += at(x, y, z, 0) * cx + at(x, y, z, 1) * cy + at(x, y, z, 2) * cz
      }
    }
  }

  return h
}

// the expectation of an integer reading over a superposed state, exactly: numerator over 4^K
export type Exact = { num: bigint; den: bigint }

export function expectation(s: LockedState, read: (c: Configuration) => number): Exact {
  const K = Math.max(0, ...s.branches.map(b => b.k))
  let num = 0n
  let den = 0n

  for (const b of s.branches) {
    const w = norm(b.a, b.b) * (1n << BigInt(2 * (K - b.k)))

    num += w * BigInt(read(b))
    den += w
  }

  return { num, den }
}

export const addExact = (x: Exact, y: Exact): Exact => ({ num: x.num * y.den + y.num * x.den, den: x.den * y.den })
export const exactZero = (x: Exact): boolean => x.num === 0n
export const exactFloat = (x: Exact): number => Number(x.num) / Number(x.den)

// ---- the lock's label read along the motion ----

// for a vibe of sign v on slot d: the doublet eigenvalue of its label along its line's first root (+1 on the first
// slot, which holds e0, -1 on the second, which holds e1) times the step that label is copied by (stepTable)
export function labelAlongMotion(v: number, d: number, convention: Convention = 'C'): number {
  const side = SIDE[d] as number

  return side * (stepTable(v > 0 ? 'love' : 'fear', convention)[side === 1 ? 0 : 1] as number)
}

// the AXIAL reading of the same label: a fear holds the conjugate representation, whose spin is -conj(sigma), so its
// spin along the line is minus its label's eigenvalue
export function axialAlongMotion(v: number, d: number, convention: Convention = 'C'): number {
  return (v > 0 ? 1 : -1) * labelAlongMotion(v, d, convention)
}

// ---- a superposing start: two vacuum vibes that meet with different points, opened (E-RLT-0097's L8 pick) ----

export function superposingStart(tables: LockedTables, weave: ColorWeave, vacuum: Configuration): Configuration | undefined {
  const all = new Map<number, [number, number]>()

  for (let line = 0; line < vacuum.store.length; line++) if (vacuum.store[line] !== 0) all.set(line, [2 * line, 2 * line + 1])

  const r = idRun(tables, weave, vacuum, all)
  let pick: [number, number] | undefined

  for (let t = 0; t < 12 && !pick; t++) {
    const c = r.state()
    const ids = r.ids()

    for (let x = 0; x < tables.cells && !pick; x++) {
      for (let l = 0; l < 12 && !pick; l++) {
        const i = x * 24 + (LINE_FIRSTS[l] as number)
        const j = x * 24 + oppositeOf(LINE_FIRSTS[l] as number)

        if (c.vibe[i] !== 0 && c.vibe[i] === c.vibe[j] && c.point[i] !== c.point[j] && (ids[i] as number) >= 0 && (ids[j] as number) >= 0) pick = [ids[i] as number, ids[j] as number]
      }
    }

    r.beat()
  }

  if (!pick) return undefined

  const start: Configuration = { vibe: Int8Array.from(vacuum.vibe), point: Int8Array.from(vacuum.point), open: Uint8Array.from(vacuum.open), store: Int8Array.from(vacuum.store), spoint: Int8Array.from(vacuum.spoint), sopen: Uint8Array.from(vacuum.sopen) }

  for (const id of pick) start.sopen[id >> 1] = (start.sopen[id >> 1] as number) | (1 << (id & 1))

  return start
}

const OPP: readonly number[] = ROOTS.map(r => ROOTS.findIndex(o => o.every((x, k) => x === -(r[k] as number))))
const oppositeOf = (d: number): number => OPP[d] as number

// the first slot whose root casts a husk axis (depth +-1, one husk coordinate): where a lone love is placed
export function axisSlot(): number {
  const d = ROOTS.findIndex(r => r[3] !== 0 && [0, 1, 2].filter(k => r[k] !== 0).length === 1)

  if (d < 0) throw new Error('no axis root')

  return d
}
