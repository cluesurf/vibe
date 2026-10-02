// MATTER'S WEYL PAIR ON A RING, AND THE CONTINUUM LIMIT OF THE COLUMN'S PAIR (E-QTM-0167, OPEN-QTM-02, which blocks
// OPEN-QTM-03). Routes file quantum-relativity-light-computation.md, section "A · canonical commutation", rows
// "matter's Weyl pair first" (line 102) and "the continuum limit" (line 105). The ledger holds canonical commutation
// partial: the Weyl pair holds on a column (E-FRC-0230) and not yet on the whole husk.
//
// Row 102 reads: the lone vibe on its line is the fear walk bit for bit (E-QTM-0157). On a ring of L docks its position
// phase U and the ring's translation by one dock V are a clock and shift pair, U V = e^(2 pi i/L) V U, and the beat must
// commute with the translation; that is [x, p] in Weyl form for matter. Test: the Weyl relation and the beat's
// commutation with translation on rings L = 3, 6, 9, 27, exact, on 17 starts. Kill: the beat fails to commute with
// translation on starts whose ring holonomy is not trivial, as E-QTM-0157's after-wrap L1 0.30 suggests; then read it
// with the holonomy as a twisted boundary.
// Row 105 reads: Schwinger's Weyl pairs give [x, p] = i as N grows, with sqrt N spacing. Read the column as N = 2D + 1
// and the scaled commutator on low-lying states, D = 4 to 64, lowest 5 levels. Kill: the low levels' commutator does
// not approach i with an error falling as a power of N.
//
// WHAT IS RUN.
// (a) The lone vibe's one-beat map B on its line, read off the working rule itself (code/rule/coined-locked-knit
//     coinedVetoBeat, veto 'none', tables on the pass contact, the empty box, as E-QTM-0157), on the 18 L states of the
//     line: dock j = 0 .. L - 1 along slot 0 from the box's center, direction (slot 0 or its opposite), and the
//     vibe's point p = 0 .. 8 (the 9 role points the links move, E-QTM-0117). The box is the D4 weave of side L, whose
//     slot-0 line is a ring of exactly L docks (probe 1). For L = 3, 6, 9 every column of B is read off the rule at
//     beats 0 and 1. For L = 27 (531,441 docks, 1.7 s a beat) and the side-16 box B is assembled from the rule's own
//     stream tables (target, move) and the coin's two coefficients, and checked against the rule's beat on 9 (L = 27)
//     or 18 (side 16) columns per start. Amplitudes are Eisenstein integers over 2, exact.
// (b) Two translations by one dock: the plain shift T0 (j, d, p) -> (j + 1, d, p), and the transported shift
//     T (j, d, p) -> (j + 1, d, m_j p) with m_j the grid move of the slot-0 link leaving dock j (the parallel
//     transport the rule itself applies to a vibe crossing that link). The clock U = diag(zeta_L^j). The holonomy H is
//     the product of the slot-0 links round the ring, read at dock 0, a permutation of the 9 points.
// (c) The column of E-FRC-0230 as Schwinger's pair: N = 2D + 1, x = s m (m = -D .. D), p = F^-1 diag(s b) F, s =
//     sqrt(2 pi / N), and the finite oscillator H = (x^2 + p^2)/2, which commutes with the quarter turn F, so its
//     levels are the column's rungs. Read c_n = -i <n|[x, p]|n> for n = 0 .. 4 and D = 4 .. 64 (floats, Householder
//     tridiagonal + QL, code/measure/quantum-ladder symmetricEigen).
//
// DERIVED BEFORE THE GATE RUN.
// - The coin copies the vibe's point unchanged and is the same on every dock; the stream moves a slot-0 vibe from dock
//   j to j + 1 applying m_j, and a back-slot vibe from dock j to j - 1 applying the back link l_j. If every back link
//   undoes the forward link it pairs with, l_(j+1) m_j = 1 (probe 1: true on every start and side tried), then on
//   right movers B T and T B both give (j + 2, m_(j+1) m_j p), and on left movers both give (j, p). So [B, T] = 0 on
//   every start whatever the holonomy, and [B, T0] = 0 only if the links along the line are all one move. The route's
//   kill, read on T, cannot fire if the links pair up; read on T0, it fires on every start with non-uniform links,
//   holonomy or not (control C1b separates the two).
// - U T = zeta_L T U holds for any shift by one dock (it is j + 1 - j = 1 mod L, including the wrap). It is kinematic.
// - T^L = H at each dock, so the strict pair of Z_L (V^L = 1, Stone-von Neumann's irreducible clock and shift) holds only
//   where H = 1. Where H has a cycle of length c, T's orbit through those c points has length L c: on that orbit T is
//   the plain shift of a ring of L c docks, the covering ring. So the pair is the Z_(L c) Weyl pair of the covering
//   ring, with clock zeta_(L c) (the twisted boundary of the route's kill text, a flux 2 pi k / c).
// - Hence the lone vibe started on point 0 is the fear walk on the covering ring of L c_0 docks, c_0 the length of
//   point 0's cycle under H, bit for bit at every beat, folded onto the L docks. On the side-16 box this predicts
//   E-QTM-0157's after-wrap number: the L1 at beat 16 between the folded covering walk and the ring-16 walk is
//   1,304,279,928 / 4^16 = 0.303676 whenever c_0 >= 2 (the covering walk has not wrapped by beat 16, so every c_0 >= 2
//   gives the same) and 0 when c_0 = 1 (probe 4). E-QTM-0157 logged 0.3037 on 16 starts and 0 on integer+13.
// - Continuum: on low rungs, localized well inside the column, x and p act as the continuum operators up to tails of
//   a Gaussian, so c_n - 1 falls like e^(-a N), faster than any power; tr [x, p] = 0 exactly, so the mean of c_n over
//   all N rungs is 0 and the top rungs are far from 1.
// - Exactness: B is exact in Z[w] over 2. zeta_L lies in Z[w] for L = 3 and 6 only; for 9 and 27 the clock needs
//   Z[zeta_27], which holds Z[w] (zeta_27^9 = w); the Weyl relation is checked as exponents mod L, exactly.
//
// PROBES BEFORE THE GATES, DISCLOSED (tmp/wy-probe1.ts to tmp/wy-probe5.ts, each under 25 s).
// - probe 1 (sides 3, 4, 6, 9, 16, 17 starts): the slot-0 line from the center is a ring of exactly side docks; every
//   back link undoes its forward link (l_(j+1) m_j = 1) on all; the forward links are never all one move; the full
//   holonomy is never the identity. On side 16 the holonomy fixes point 0 only on integer+13, the start where
//   E-QTM-0157 read 0 after the wrap.
// - probe 2: the rule's beat on one vibe, sides 3, 9, 27: two branches, keep (1 + w)/2 on the next dock's same slot and
//   (1 - w)/2 on the previous dock's opposite slot, points moved by the links; the same at beats 0 and 1. Side 27: 6.6 s
//   to build the weave, 1.7 s a beat (so the full rule read of 486 columns on 17 starts is out of the time budget).
// - probe 3: the column oscillator: c_n - 1 at D = 4 is -2e-5, 2e-4, -7e-3, 2e-2, -0.57 for n = 0 .. 4, at D = 8
//   -9e-11 .. -3e-5, at D = 12 below 6e-10, and at the float floor (1e-14) from D = 16 to 64; sum of c_n over all
//   rungs 1e-14 to 6e-13; top rung c = 9.6 (D = 4) to 211 (D = 64).
// - probe 4: the fear walk on rings 16 c folded onto 16 against ring 16 at beat 16: L1 0 for c = 1 and 1,304,279,928 /
//   4^16 for c = 2, 3, 4, 6.
// - probe 5 (tmp/wy-probe5.ts, written after the gates below, to check this file runs): this file with one start
//   (integer+0), rings 3 and 6 and D up to 8. It ran (22 s); on that start I1, C1a to C1d, C2, H1 and H2 read true, and
//   H3 and H4 false only by the cut (integer+13 absent; D = 8 taken as the last D). No gate was changed after it.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
// I1 (instrument) for L = 3, 6, 9 on 17 starts: B read off the rule equals B assembled from the tables, column for
//    column, at beat 0 and at beat 1; for side 16 (18 columns) and L = 27 (9 columns) the rule's beat equals the table
//    B on every sampled column; on every ring and start B stays on the line and is exactly unitary (B^dagger B = 1 in
//    Z[w] over 4).
// C1 (controls, L = 9, every column read off the rule, links replaced on the line only):
//    C1a trivial links: [B, T0] = 0, H = 1, T = T0
//    C1b pure gauge links m_j = g_(j+1) g_j^-1 (g_j spread by the golden Weyl sequence, back links their inverses):
//        [B, T0] != 0, [B, T] = 0, H = 1, every T orbit of length 9
//    C1c one move g of order 4 on every forward link, its inverse on every back link: [B, T0] = 0, H = g^9 = g != 1,
//        T orbits of lengths 9 times g's cycle lengths
//    C1d one back link broken (it undoes its forward link and then shifts the role grid by a translation): [B, T] != 0,
//        so the instrument can read the failure
// C2 (control, continuum): for every D, |sum over all N rungs of c_n| <= 1e-9 and the top rung has |c - 1| > 0.5
// H1 (row 102, commutation and Weyl relation): on 17 of 17 starts at each of L = 3, 6, 9, 27, [B, T] = 0 exactly
//    (0 mismatching columns) and U T = zeta_L T U exactly
// H2 (the twisted boundary): on 17 of 17 starts at each L, T^L is H at every dock, T's orbits on each direction have
//    lengths L times H's cycle lengths, and the lone vibe started at dock 0, slot 0, point 0 equals the fear walk on
//    the covering ring of L c_0 docks bit for bit at every beat 1 .. L c_0 + 1 (B iterated: B is the rule's beat, I1)
// H3 (E-QTM-0157's after-wrap number): on the side-16 box, 17 starts, the table B iterated 16 beats from the center,
//    slot 0, point 0, gives an occupation whose L1 against the ring-16 fear walk equals, exactly, the L1 between the
//    walk on ring 16 c_0 folded and the walk on ring 16; it is 1,304,279,928 / 4^16 (0.3037 to 4 places, as logged)
//    on the starts with c_0 >= 2 and 0 on the starts with c_0 = 1, and those are integer+13 alone
// H4 (row 105): for every D = 8 .. 64 and n = 0 .. 4, |c_n - 1| <= 10 / N^2, and at D = 64 every |c_n - 1| <= 1e-10
// P1 (falsifier, row 102's kill read on the transported translation): some start at some L with H != 1 where
//    [B, T] != 0. P2 (row 105's kill): H4's bound missed at some D >= 8 for some n <= 4.
// Predicted alongside, not a kill: [B, T0] != 0 on 17 of 17 starts at every L (the links are never uniform), and H != 1
// on 17 of 17 at L = 3, 6, 9 (probe 1; L = 27 not probed), so the strict Z_L pair (T^L = 1) holds on none of those.
//
// VERDICT, fixed before the run: fail if I1, C1 or C2 fails (the instrument) or P1 or P2 fires; pass if I1, C1, C2,
// H1, H2, H3, H4 hold; partial otherwise (including H4 or C2 missed only at the float floor).
//
// WHAT THIS CAN AND CANNOT SHOW. It shows on the rule itself which translation the lone vibe's beat commutes with and
// what the Weyl pair of matter on a ring is once the link holonomy is counted. It does not reach the whole husk: one
// line, one vibe, the empty box (no vacuum, no meeting), love only. The Weyl relation U T = zeta T U is kinematic; the
// content is the commutation and the covering. The continuum part is floats on a known construction (Schwinger 1960);
// it shows the column's low rungs reach [x, p] = i, not that the rule's light does.
//
// DETERMINISM: no random number; starts are E-MTH-0028's family; the gauge of C1b is the golden Weyl sequence
// (code/tool/weyl). Depth L2: the matter half is exact algebra in Z[w] over 2; the continuum half is floats.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { symmetricEigen } from '@/code/measure/quantum-ladder'
import { weyl } from '@/code/tool/weyl'
import {
  makeColorWeave,
  type ColorWeave,
} from '@/code/rule/color-weave'
import {
  lockedState,
  lockedTables,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { coinedVetoBeat } from '@/code/rule/coined-locked-knit'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import {
  FEAR_COIN,
  norm as eNorm,
  times as eTimes,
  walkBeat,
  walkStart,
  type Eisenstein,
  type WalkState,
} from '@/code/rule/fear-walk'

const SLOT = 0
const BACK = OPPOSITE[SLOT]!
const DIRS = [SLOT, BACK] as const
const RINGS = [3, 6, 9, 27]
const FULL_RULE = new Set([3, 6, 9])
const SAMPLE: Record<number, number> = { 16: 18, 27: 9 }
const E_SIDE = 16
const LOGGED_AFTER_WRAP = 0.3037
const D_MIN = 4
const D_MAX = 64
const LEVELS = 5

// ---- the line and its basis ----

type Ring = {
  L: number
  cells: number[]
  index: Map<number, number>
  backOk: boolean
}

function ringOf(weave: ColorWeave, center: number): Ring {
  const cells: number[] = []

  let x = center

  do {
    cells.push(x)
    x = weave.mesh.neighbour(x, SLOT)
  } while (x !== center && cells.length < 4096)

  const L = cells.length
  const index = new Map(cells.map((c, j) => [c, j]))

  let backOk = x === center

  for (let j = 0; j < L; j++) {
    backOk &&=
      weave.mesh.neighbour(cells[(j + 1) % L]!, BACK) === cells[j]
  }

  return { L, cells, index, backOk }
}

const idx = (j: number, dir: number, p: number): number =>
  (j * 2 + dir) * 9 + p
const jOf = (i: number): number => Math.floor(i / 18)
const dirOf = (i: number): number => Math.floor(i / 9) % 2
const pOf = (i: number): number => i % 9

// an operator column: entries (row, amplitude (a + b w) / 2), sorted by row
type Entry = { row: number; a: bigint; b: bigint }
type Op = Entry[][]

const sortCol = (c: Entry[]): Entry[] => c.sort((x, y) => x.row - y.row)

function sameCol(x: Entry[], y: Entry[]): boolean {
  return (
    x.length === y.length &&
    x.every(
      (e, n) =>
        e.row === y[n]!.row && e.a === y[n]!.a && e.b === y[n]!.b,
    )
  )
}

// B assembled from the rule's tables: the coin (keep 1 + w, cross 1 - w, over 2), then the stream
function tableBeat(
  t: LockedTables,
  ring: Ring,
): { op: Op; closed: boolean } {
  const n = ring.L * 18
  const op: Op = []

  let closed = true

  for (let i = 0; i < n; i++) {
    const j = jOf(i)
    const dir = dirOf(i)
    const p = pOf(i)
    const col: Entry[] = []

    for (const [toDir, a, b] of [
      [dir, 1n, 1n],
      [1 - dir, 1n, -1n],
    ] as const) {
      const slot = ring.cells[j]! * 24 + DIRS[toDir]!
      const to = t.target[slot]!
      const jj = ring.index.get(Math.floor(to / 24))

      if (jj === undefined || to % 24 !== DIRS[toDir]) {
        closed = false
        continue
      }

      col.push({ row: idx(jj, toDir, t.move[slot * 9 + p]!), a, b })
    }

    op.push(sortCol(col))
  }

  return { op, closed }
}

// one column of B read off the rule's beat
function ruleColumn(
  t: LockedTables,
  ring: Ring,
  base: Configuration,
  i: number,
  beat: number,
): Entry[] | undefined {
  const slot = ring.cells[jOf(i)]! * 24 + DIRS[dirOf(i)]!

  base.vibe[slot] = 1
  base.open[slot] = 1
  base.point[slot] = pOf(i)

  const s = coinedVetoBeat('none', t, lockedState(base), beat)

  base.vibe[slot] = 0
  base.open[slot] = 0
  base.point[slot] = 0

  const col: Entry[] = []

  for (const br of s.branches) {
    const occupied: number[] = []

    br.vibe.forEach((v, k) => {
      if (v !== 0) {
        occupied.push(k)
      }
    })

    if (occupied.length !== 1 || br.k > 1) {
      return undefined
    }

    const at = occupied[0]!
    const jj = ring.index.get(Math.floor(at / 24))
    const d = at % 24
    const dir = d === SLOT ? 0 : d === BACK ? 1 : -1

    if (jj === undefined || dir < 0) {
      return undefined
    }

    const scale = 1n << BigInt(1 - br.k)

    col.push({
      row: idx(jj, dir, br.point[at]!),
      a: br.a * scale,
      b: br.b * scale,
    })
  }

  return sortCol(col)
}

function emptyBox(cells: number): Configuration {
  return {
    vibe: new Int8Array(cells * 24),
    point: new Int8Array(cells * 24),
    open: new Uint8Array(cells * 24),
    store: new Int8Array(cells * 12),
    spoint: new Int8Array(cells * 12),
    sopen: new Uint8Array(cells * 12),
  }
}

// columns where B P != P B, P a permutation of the basis
function commutatorColumns(op: Op, perm: Int32Array): number {
  let bad = 0

  for (let i = 0; i < op.length; i++) {
    const left = op[perm[i]!]!
    const right = sortCol(
      op[i]!.map(e => ({ ...e, row: perm[e.row]! })),
    )

    if (!sameCol(left, right)) {
      bad++
    }
  }

  return bad
}

// B^dagger B = 1 exactly: every column of norm 4 over 4, distinct columns orthogonal
function unitary(op: Op): boolean {
  const rows = new Map<number, { col: number; e: Eisenstein }[]>()

  op.forEach((col, c) => {
    for (const e of col) {
      const list = rows.get(e.row) ?? []

      list.push({ col: c, e: [e.a, e.b] })
      rows.set(e.row, list)
    }
  })

  const gram = new Map<string, Eisenstein>()

  for (const list of rows.values()) {
    for (const x of list) {
      for (const y of list) {
        // conj(a + b w) = (a - b) - b w
        const v = eTimes([x.e[0] - x.e[1], -x.e[1]], y.e)
        const key = `${x.col}:${y.col}`
        const g = gram.get(key) ?? [0n, 0n]

        gram.set(key, [g[0] + v[0], g[1] + v[1]])
      }
    }
  }

  for (let c = 0; c < op.length; c++) {
    const d = gram.get(`${c}:${c}`)

    if (d?.[0] !== 4n || d[1] !== 0n) {
      return false
    }
  }

  for (const [key, v] of gram) {
    const [x, y] = key.split(':')

    if (x !== y && (v[0] !== 0n || v[1] !== 0n)) {
      return false
    }
  }

  return true
}

// ---- translations, holonomy, orbits ----

function plainShift(L: number): Int32Array {
  const perm = new Int32Array(L * 18)

  for (let i = 0; i < perm.length; i++) {
    perm[i] = idx((jOf(i) + 1) % L, dirOf(i), pOf(i))
  }

  return perm
}

function transportedShift(t: LockedTables, ring: Ring): Int32Array {
  const perm = new Int32Array(ring.L * 18)

  for (let i = 0; i < perm.length; i++) {
    const j = jOf(i)
    const slot = ring.cells[j]! * 24 + SLOT

    perm[i] = idx(
      (j + 1) % ring.L,
      dirOf(i),
      t.move[slot * 9 + pOf(i)]!,
    )
  }

  return perm
}

const power = (perm: Int32Array, k: number, i: number): number => {
  let x = i

  for (let n = 0; n < k; n++) {
    x = perm[x]!
  }

  return x
}

// T^L at every dock and direction is one point permutation per dock; returns the dock-0 holonomy, and whether T^L is a
// point permutation at every dock (it keeps dock and direction)
function holonomyOf(
  perm: Int32Array,
  L: number,
): { h: number[]; keepsDock: boolean; perDock: number[][] } {
  let keepsDock = true

  const perDock: number[][] = []

  for (let j = 0; j < L; j++) {
    const hj: number[] = []

    for (let dir = 0; dir < 2; dir++) {
      for (let p = 0; p < 9; p++) {
        const y = power(perm, L, idx(j, dir, p))

        keepsDock &&= jOf(y) === j && dirOf(y) === dir

        if (dir === 0) {
          hj.push(pOf(y))
        } else {
          keepsDock &&= pOf(y) === hj[p]
        }
      }
    }

    perDock.push(hj)
  }

  return { h: perDock[0]!, keepsDock, perDock }
}

function cycleLengths(h: readonly number[]): number[] {
  const seen = new Set<number>()
  const out: number[] = []

  for (let p = 0; p < h.length; p++) {
    if (seen.has(p)) {
      continue
    }

    let q = p
    let c = 0

    do {
      seen.add(q)
      q = h[q]!
      c++
    } while (q !== p)

    out.push(c)
  }

  return out.sort((x, y) => x - y)
}

function orbitLengths(perm: Int32Array): number[] {
  const seen = new Uint8Array(perm.length)
  const out: number[] = []

  for (let i = 0; i < perm.length; i++) {
    if (seen[i]) {
      continue
    }

    let x = i
    let c = 0

    do {
      seen[x] = 1
      x = perm[x]!
      c++
    } while (x !== i)

    out.push(c)
  }

  return out.sort((x, y) => x - y)
}

// U P = zeta_L P U as exponents mod L: the clock's exponent rises by exactly 1 on every basis vector
function weylRelation(perm: Int32Array, L: number): boolean {
  for (let i = 0; i < perm.length; i++) {
    if ((jOf(perm[i]!) - jOf(i) - 1 + 2 * L) % L !== 0) {
      return false
    }
  }

  return true
}

const sameList = (x: number[], y: number[]): boolean =>
  x.length === y.length && x.every((v, n) => v === y[n])

// ---- iterating B, and the covering walk ----

type Vec = Map<number, Eisenstein>

function apply(op: Op, v: Vec): Vec {
  const out: Vec = new Map()

  for (const [i, x] of v) {
    for (const e of op[i]!) {
      const y = eTimes([e.a, e.b], x)
      const z = out.get(e.row) ?? [0n, 0n]

      out.set(e.row, [z[0] + y[0], z[1] + y[1]])
    }
  }

  for (const [i, x] of out) {
    if (x[0] === 0n && x[1] === 0n) {
      out.delete(i)
    }
  }

  return out
}

function coveringMatch(
  op: Op,
  shift: Int32Array,
  L: number,
  c0: number,
): { ok: boolean; beats: number } {
  const ring = L * c0
  const beats = ring + 1
  const right: number[] = []
  const left: number[] = []

  for (let n = 0; n < ring; n++) {
    right.push(power(shift, n, idx(0, 0, 0)))
    left.push(power(shift, n, idx(0, 1, 0)))
  }

  let v: Vec = new Map([[idx(0, 0, 0), [1n, 0n] as Eisenstein]])
  let walk: WalkState = walkStart(ring, 0, true)
  let ok = true

  for (let t = 1; t <= beats && ok; t++) {
    v = apply(op, v)
    walk = walkBeat(walk, () => FEAR_COIN)

    let seen = 0

    for (let n = 0; n < ring; n++) {
      for (const [pos, w] of [
        [right[n]!, walk.right[n]!],
        [left[n]!, walk.left[n]!],
      ] as const) {
        const x = v.get(pos) ?? [0n, 0n]

        if (x[0] !== w[0] || x[1] !== w[1]) {
          ok = false
        }

        if (x[0] !== 0n || x[1] !== 0n) {
          seen++
        }
      }
    }

    ok &&= seen === v.size
  }

  return { ok, beats }
}

// the occupation (dock, direction; points summed) of B^16 from dock 0, slot 0, point 0, against the ring walk, over 4^T
function afterWrapL1(op: Op, L: number, T: number): bigint {
  let v: Vec = new Map([[idx(0, 0, 0), [1n, 0n] as Eisenstein]])

  for (let t = 0; t < T; t++) {
    v = apply(op, v)
  }

  let walk = walkStart(L, 0, true)

  for (let t = 0; t < T; t++) {
    walk = walkBeat(walk, () => FEAR_COIN)
  }

  const occ = new Array<bigint>(2 * L).fill(0n)

  for (const [i, x] of v) {
    occ[jOf(i) * 2 + dirOf(i)]! += eNorm(x)
  }

  let sum = 0n

  for (let j = 0; j < L; j++) {
    const a = occ[j * 2]! - eNorm(walk.right[j]!)
    const b = occ[j * 2 + 1]! - eNorm(walk.left[j]!)

    sum += (a < 0n ? -a : a) + (b < 0n ? -b : b)
  }

  return sum
}

// the walk on ring L c folded onto L, against the walk on ring L, at beat T (the derived prediction), over 4^T
function foldedL1(L: number, c: number, T: number): bigint {
  const run = (n: number): WalkState => {
    let w = walkStart(n, 0, true)

    for (let t = 0; t < T; t++) {
      w = walkBeat(w, () => FEAR_COIN)
    }

    return w
  }

  const small = run(L)
  const big = run(L * c)

  const fold = (xs: readonly Eisenstein[]): bigint[] => {
    const out = new Array<bigint>(L).fill(0n)

    xs.forEach((x, n) => {
      out[n % L]! += eNorm(x)
    })

    return out
  }

  const [br, bl] = [fold(big.right), fold(big.left)]

  let sum = 0n

  for (let j = 0; j < L; j++) {
    const a = br[j]! - eNorm(small.right[j]!)
    const b = bl[j]! - eNorm(small.left[j]!)

    sum += (a < 0n ? -a : a) + (b < 0n ? -b : b)
  }

  return sum
}

// ---- one ring on one start ----

type RingReading = {
  L: number
  ruleMatch: boolean
  ruleColumns: number
  closed: boolean
  backOk: boolean
  unitary: boolean
  commuteT: number
  commuteT0: number
  weylT: boolean
  weylT0: boolean
  keepsDock: boolean
  holonomy: string
  trivial: boolean
  cycles: number[]
  orbitsOk: boolean
  c0: number
  covering: boolean
  coveringBeats: number
  afterWrap?: bigint
  predicted?: bigint
}

function readRing(
  side: number,
  links: ((w: ColorWeave, r: Ring) => Int16Array) | undefined,
  rule: 'full' | number,
  extra: boolean,
): RingReading {
  const weave = makeColorWeave({ side, table: 'bind' })
  const ring0 = ringOf(weave, centerOf(side))
  const t = lockedTables(
    weave,
    'pass',
    links ? links(weave, ring0) : undefined,
  )
  const ring = ring0
  const { op, closed } = tableBeat(t, ring)
  const base = emptyBox(weave.mesh.cellCount)
  const n = ring.L * 18

  let ruleMatch = true
  let ruleColumns = 0

  const cols: number[] =
    rule === 'full'
      ? Array.from({ length: n }, (_, i) => i)
      : Array.from({ length: rule }, (_, k) =>
          idx((k * 7) % ring.L, k % 2, k % 9),
        )

  for (const beat of rule === 'full' ? [0, 1] : [0]) {
    for (const i of cols) {
      const col = ruleColumn(t, ring, base, i, beat)

      ruleColumns++
      ruleMatch &&= col !== undefined && sameCol(col, op[i]!)
    }
  }

  const tShift = transportedShift(t, ring)
  const t0Shift = plainShift(ring.L)
  const hol = holonomyOf(tShift, ring.L)
  const cycles = cycleLengths(hol.h)
  const expectedOrbits = [
    ...cycles.map(c => c * ring.L),
    ...cycles.map(c => c * ring.L),
  ].sort((x, y) => x - y)
  const c0 = (() => {
    let q = hol.h[0]!
    let c = 1

    while (q !== 0) {
      q = hol.h[q]!
      c++
    }

    return c
  })()
  const cov = coveringMatch(op, tShift, ring.L, c0)
  const out: RingReading = {
    L: ring.L,
    ruleMatch,
    ruleColumns,
    closed,
    backOk: ring.backOk,
    unitary: unitary(op),
    commuteT: commutatorColumns(op, tShift),
    commuteT0: commutatorColumns(op, t0Shift),
    weylT: weylRelation(tShift, ring.L),
    weylT0: weylRelation(t0Shift, ring.L),
    keepsDock: hol.keepsDock,
    holonomy: hol.h.join(''),
    trivial: hol.h.every((v, p) => v === p),
    cycles,
    orbitsOk: sameList(orbitLengths(tShift), expectedOrbits),
    c0,
    covering: cov.ok,
    coveringBeats: cov.beats,
  }

  if (extra) {
    out.afterWrap = afterWrapL1(op, ring.L, ring.L)
    out.predicted = foldedL1(ring.L, c0, ring.L)
  }

  return out
}

// ---- controls: links replaced on the line ----

type Moves = ColorWeave['moves']

function orderOf(moves: Moves, g: number): number {
  let x = g
  let k = 1

  while (x !== moves.identity) {
    x = moves.compose(g, x)
    k++
  }

  return k
}

function isTranslation(moves: Moves, g: number): boolean {
  const s = moves.act[g]![0]!

  if (s === 0) {
    return false
  }

  for (let p = 0; p < 9; p++) {
    const want =
      (((p % 3) + (s % 3)) % 3) +
      3 * ((Math.floor(p / 3) + Math.floor(s / 3)) % 3)

    if (moves.act[g]![p] !== want) {
      return false
    }
  }

  return true
}

function lineLinks(
  w: ColorWeave,
  r: Ring,
  forward: (j: number) => number,
): Int16Array {
  const links = Int16Array.from(w.links)

  for (let j = 0; j < r.L; j++) {
    const m = forward(j)

    links[r.cells[j]! * 24 + SLOT] = m
    links[r.cells[(j + 1) % r.L]! * 24 + BACK] = w.moves.inverse[m]!
  }

  return links
}

// ---- the continuum: Schwinger's pair on a column of N = 2D + 1 ----

type ColumnReading = {
  D: number
  N: number
  errors: number[]
  traceSum: number
  top: number
}

function column(D: number): ColumnReading {
  const N = 2 * D + 1
  const s = Math.sqrt((2 * Math.PI) / N)
  // p = i P with P real antisymmetric: P_mm' = (s / N) sum_b b sin(2 pi b (m - m') / N)
  const P = new Float64Array(N * N)

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      let im = 0

      for (let b = -D; b <= D; b++) {
        im += b * Math.sin((2 * Math.PI * b * (i - j)) / N)
      }

      P[i * N + j] = (s * im) / N
    }
  }

  const H = new Float64Array(N * N)

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      let pp = 0

      for (let k = 0; k < N; k++) {
        pp += P[i * N + k]! * P[k * N + j]!
      }

      H[i * N + j] = -pp / 2 + (i === j ? (s * (i - D)) ** 2 / 2 : 0)
    }
  }

  const { vectors } = symmetricEigen(N, H)
  const c: number[] = []

  for (let n = 0; n < N; n++) {
    // -i <v|[x, p]|v> with [x, p]_ij = s (i - j) p_ij = i s (i - j) P_ij
    let sum = 0

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        sum +=
          vectors[i * N + n]! *
          vectors[j * N + n]! *
          s *
          (i - j) *
          P[i * N + j]!
      }
    }

    c.push(sum)
  }

  return {
    D,
    N,
    errors: c.slice(0, LEVELS).map(x => x - 1),
    traceSum: c.reduce((a, b) => a + b, 0),
    top: c[N - 1]!,
  }
}

export default experiment({
  id: 'quantum/weyl-pair',
  code: 'E-QTM-0167',
  title: 'matter and the column as Weyl pairs',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const family = startFamily(16)

    // ---- the route's rings and the side-16 box, every start ----
    const perStart = family.map(member =>
      withStart(member, () => {
        const rings = RINGS.map(L =>
          readRing(
            L,
            undefined,
            FULL_RULE.has(L) ? 'full' : SAMPLE[L]!,
            false,
          ),
        )
        const box = readRing(E_SIDE, undefined, SAMPLE[E_SIDE]!, true)

        log(`start ${member.name}`)

        return { name: member.name, rings, box }
      }),
    )

    // ---- controls on L = 9 (committed start for the off-line links, which the lone vibe never reads) ----
    const controls = withStart(family[0]!, () => {
      const moves = makeColorWeave({ side: 3, table: 'bind' }).moves
      const gauge = (j: number): number => Math.floor(216 * weyl(j + 1))
      const order4 = moves.act.findIndex(
        (_, g) => orderOf(moves, g) === 4,
      )
      const shift = moves.act.findIndex((_, g) =>
        isTranslation(moves, g),
      )
      const L = 9

      const trivial = readRing(
        L,
        (w, r) => lineLinks(w, r, () => moves.identity),
        'full',
        false,
      )
      const pure = readRing(
        L,
        (w, r) =>
          lineLinks(w, r, j =>
            moves.compose(
              gauge((j + 1) % r.L),
              moves.inverse[gauge(j)]!,
            ),
          ),
        'full',
        false,
      )
      const uniform = readRing(
        L,
        (w, r) => lineLinks(w, r, () => order4),
        'full',
        false,
      )
      const broken = readRing(
        L,
        (w, r) => {
          const links = lineLinks(w, r, j => gauge(j))

          links[r.cells[1]! * 24 + BACK] = moves.compose(
            shift,
            moves.inverse[gauge(0)]!,
          )

          return links
        },
        'full',
        false,
      )
      const g9 = (() => {
        let x = moves.identity

        for (let k = 0; k < L; k++) {
          x = moves.compose(order4, x)
        }

        return x
      })()

      return {
        trivial,
        pure,
        uniform,
        broken,
        g9,
        order4,
        shift,
        moves,
      }
    })

    log('controls')

    // ---- the continuum ----
    const columns: ColumnReading[] = []

    for (let D = D_MIN; D <= D_MAX; D++) {
      columns.push(column(D))
    }

    log('continuum')

    // ---- gates ----
    type S = (typeof perStart)[number]

    const allRings = (test: (r: RingReading) => boolean): boolean =>
      perStart.every(p => p.rings.every(test))
    const countAt = (
      L: number,
      test: (r: RingReading) => boolean,
    ): number =>
      perStart.filter(p => test(p.rings.find(r => r.L === L)!)).length
    const ct = controls
    const uniformCycles = cycleLengths(
      Array.from(ct.moves.act[ct.order4]!),
    )
    const g = {
      I1:
        allRings(
          r => r.ruleMatch && r.closed && r.backOk && r.unitary,
        ) &&
        perStart.every(p =>
          sameList(
            p.rings.map(r => r.L),
            RINGS,
          ),
        ) &&
        perStart.every(
          p =>
            p.box.ruleMatch &&
            p.box.closed &&
            p.box.backOk &&
            p.box.unitary &&
            p.box.L === E_SIDE,
        ),
      C1a:
        ct.trivial.ruleMatch &&
        ct.trivial.commuteT0 === 0 &&
        ct.trivial.trivial &&
        ct.trivial.commuteT === 0,
      C1b:
        ct.pure.ruleMatch &&
        ct.pure.commuteT0 > 0 &&
        ct.pure.commuteT === 0 &&
        ct.pure.trivial &&
        ct.pure.orbitsOk &&
        ct.pure.cycles.every(c => c === 1),
      C1c:
        ct.uniform.ruleMatch &&
        ct.uniform.commuteT0 === 0 &&
        ct.g9 === ct.order4 &&
        !ct.uniform.trivial &&
        ct.uniform.holonomy ===
          Array.from(ct.moves.act[ct.order4]!).join('') &&
        ct.uniform.orbitsOk &&
        sameList(ct.uniform.cycles, uniformCycles),
      C1d: ct.broken.ruleMatch && ct.broken.commuteT > 0,
      C2: columns.every(
        c => Math.abs(c.traceSum) <= 1e-9 && Math.abs(c.top - 1) > 0.5,
      ),
    }
    const h = {
      H1: allRings(r => r.commuteT === 0 && r.weylT),
      H2: allRings(r => r.keepsDock && r.orbitsOk && r.covering),
      H3:
        perStart.every(
          p =>
            p.box.afterWrap === p.box.predicted &&
            (p.box.c0 === 1
              ? p.box.afterWrap === 0n
              : Math.abs(
                  Number(p.box.afterWrap) / 4 ** E_SIDE -
                    LOGGED_AFTER_WRAP,
                ) < 5e-5),
        ) &&
        perStart
          .filter(p => p.box.c0 === 1)
          .map(p => p.name)
          .join(',') === 'integer+13',
      H4: columns.every(
        c =>
          c.D < 8 ||
          (c.errors.every(e => Math.abs(e) <= 10 / c.N ** 2) &&
            (c.D !== D_MAX ||
              c.errors.every(e => Math.abs(e) <= 1e-10))),
      ),
    }
    const P1 = perStart.some(p =>
      p.rings.some(r => !r.trivial && r.commuteT !== 0),
    )
    const P2 = !h.H4
    const instrument = Object.values(g).every(Boolean)
    const status =
      !instrument || P1 || P2
        ? 'fail'
        : Object.values(h).every(Boolean)
          ? 'pass'
          : 'partial'

    const metrics: Record<string, number> = { starts: family.length }

    for (const [k, v] of Object.entries({ ...g, ...h })) {
      metrics[`gate_${k}`] = v ? 1 : 0
    }

    metrics.P1 = P1 ? 1 : 0

    for (const L of RINGS) {
      metrics[`L${L}_commuteT_starts`] = countAt(
        L,
        r => r.commuteT === 0,
      )

      metrics[`L${L}_commuteT0_starts`] = countAt(
        L,
        r => r.commuteT0 === 0,
      )
      metrics[`L${L}_trivialHolonomy`] = countAt(L, r => r.trivial)
      metrics[`L${L}_c0max`] = Math.max(
        ...perStart.map(p => p.rings.find(r => r.L === L)!.c0),
      )
    }

    metrics.boxAfterWrapC0Above1 = perStart.filter(
      p => p.box.c0 > 1,
    ).length

    metrics.afterWrapL1 = Math.max(
      ...perStart.map(p => Number(p.box.afterWrap ?? 0n) / 4 ** E_SIDE),
    )

    metrics.continuumWorstD8 = Math.max(
      ...columns.find(c => c.D === 8)!.errors.map(Math.abs),
    )

    metrics.continuumWorstD64 = Math.max(
      ...columns.find(c => c.D === D_MAX)!.errors.map(Math.abs),
    )

    metrics.continuumRateN0 =
      Math.log(
        Math.abs(columns[0]!.errors[0]!) /
          Math.abs(columns[4]!.errors[0]!),
      ) /
      (columns[4]!.N - columns[0]!.N)
    metrics.seconds = (Date.now() - started) / 1000

    const ringLine = (p: S): string =>
      p.rings
        .map(
          r =>
            `L${r.L} [B,T] ${r.commuteT} [B,T0] ${r.commuteT0} H ${r.holonomy} cycles ${r.cycles.join('')} c0 ${r.c0} covering ${r.covering}/${r.coveringBeats} rule ${r.ruleMatch}/${r.ruleColumns}`,
        )
        .join('; ')

    return verdict({
      status,
      claim: `the lone vibe's beat commutes exactly with the transported shift by one dock on ${RINGS.map(L => `${countAt(L, r => r.commuteT === 0)}`).join(', ')} of ${family.length} starts at L = ${RINGS.join(', ')}, and with the plain shift on ${RINGS.map(L => `${countAt(L, r => r.commuteT0 === 0)}`).join(', ')}; U T = zeta_L T U on all; the holonomy is trivial on ${RINGS.map(L => `${countAt(L, r => r.trivial)}`).join(', ')}; the lone vibe is the fear walk on the covering ring of L c0 docks bit for bit (${allRings(r => r.covering)}); side 16 after-wrap L1 ${metrics.afterWrapL1.toFixed(6)} as E-QTM-0157 logged (${h.H3}); the column's low rungs reach [x, p] = i (worst |c - 1| ${metrics.continuumWorstD8.toExponential(2)} at D = 8, ${metrics.continuumWorstD64.toExponential(2)} at D = 64)`,
      metrics,
      control: {
        trivialLinksPlainCommutes: ct.trivial.commuteT0 === 0 ? 1 : 0,
        pureGaugePlainColumns: ct.pure.commuteT0,
        pureGaugeTransportedColumns: ct.pure.commuteT,
        uniformOrder4PlainColumns: ct.uniform.commuteT0,
        brokenTransportedColumns: ct.broken.commuteT,
        continuumMaxTraceSum: Math.max(
          ...columns.map(c => Math.abs(c.traceSum)),
        ),
        continuumMinTopDeviation: Math.min(
          ...columns.map(c => Math.abs(c.top - 1)),
        ),
      },
      notes: `L2. Gates ${Object.entries({ ...g, ...h })
        .map(([k, v]) => `${k} ${v}`)
        .join(
          ', ',
        )}; P1 ${P1}, P2 ${P2}. Controls (L = 9): trivial [B,T0] ${ct.trivial.commuteT0}; pure gauge [B,T0] ${ct.pure.commuteT0} [B,T] ${ct.pure.commuteT} H ${ct.pure.holonomy}; uniform order-4 move ${ct.order4} [B,T0] ${ct.uniform.commuteT0} H ${ct.uniform.holonomy} cycles ${ct.uniform.cycles.join('')}; broken (translation move ${ct.shift}) [B,T] ${ct.broken.commuteT}. Continuum |c_n - 1|, n = 0..4: ${columns
        .filter(c => [4, 5, 6, 8, 12, 16, 32, 64].includes(c.D))
        .map(
          c =>
            `D ${c.D}: ${c.errors.map(e => Math.abs(e).toExponential(1)).join(' ')} (sum ${c.traceSum.toExponential(1)}, top ${c.top.toFixed(2)})`,
        )
        .join(
          '; ',
        )}; rate a (n = 0, D 4 to 8) ${metrics.continuumRateN0.toFixed(3)} a unit of N. Per start: ${perStart
        .map(
          p =>
            `${p.name}: ${ringLine(p)}; box c0 ${p.box.c0} afterWrap ${p.box.afterWrap}/4^16 predicted ${p.box.predicted} rule ${p.box.ruleMatch}`,
        )
        .join(
          ' | ',
        )}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
