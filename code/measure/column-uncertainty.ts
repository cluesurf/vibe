// Uncertainty on the lone vibe's line, read with the Weyl pair of E-QTM-0167 (OPEN-QTM-03). The line is the slot-0
// line through the box's center, a ring of L docks; a basis state is (dock j, direction, point p), index (j 2 + dir) 9 + p.
//
//   lineRing          the ring of docks along slot 0 from a dock, and whether every back slot returns
//   lineBeat          the lone vibe's one-beat map B assembled from the rule's tables (coin keep (1 + w)/2, cross
//                     (1 - w)/2, then the stream with the links' grid moves), exact, sparse columns
//   lineRuleColumn    one column of B read off the rule's own beat (coinedVetoBeat, veto 'none'), the instrument check
//   transportedShift  T: (j, d, p) -> (j + 1, d, m_j p), m_j the slot-0 link's move (the translation the beat commutes with)
//   commutatorColumns how many columns of B P and P B differ, P a basis permutation
//   unitaryLine       B^dagger B = 1 exactly (Z[w] over 4)
//   applyLine         B on a sparse vector of Eisenstein amplitudes (one factor 1/2 a beat left implicit)
//   orbitOf           T^n s for n = 0 .. M - 1, M the orbit length (L c, c the holonomy cycle through s's point)
//   coveringAmplitudes the state on the covering ring: psi(n, dir) = <T^n s_dir | psi>, and whether it is all there
//   flatAutocorrelation sum over dir and n of conj psi(n) psi(n + d) for every d, exact (zero for d != 0 iff the
//                     T-momentum distribution is flat)
//   shannon, ringMoments the entropies and the Schwinger pair x = s m, p = F^-1 diag(s b) F on Z_M (floats) with the
//                     Robertson and Schrodinger-Robertson sides
//   ringOscillatorGround the ground state of (x^2 + p^2)/2 on Z_M (the control that Robertson can be met in this pair)
//
// EXACT: B, T, the occupations (norms over 4^t), the autocorrelation. FLOAT: entropies, the momentum distribution by a
// discrete Fourier sum, Robertson moments. DETERMINISM: no random numbers.

import { coinedVetoBeat } from '@/code/rule/coined-locked-knit'
import { type ColorWeave } from '@/code/rule/color-weave'
import {
  lockedState,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { times as eTimes, type Eisenstein } from '@/code/rule/fear-walk'
import { symmetricEigen } from '@/code/measure/quantum-ladder'

export const LINE_SLOT = 0
export const LINE_BACK = OPPOSITE[LINE_SLOT]!
const DIRS = [LINE_SLOT, LINE_BACK] as const

export type LineRing = {
  L: number
  cells: number[]
  index: Map<number, number>
  backOk: boolean
}

export function lineRing(weave: ColorWeave, from: number): LineRing {
  const cells: number[] = []

  let x = from

  do {
    cells.push(x)
    x = weave.mesh.neighbour(x, LINE_SLOT)
  } while (x !== from && cells.length < 4096)

  const L = cells.length
  const index = new Map(cells.map((c, j) => [c, j]))

  let backOk = x === from

  for (let j = 0; j < L; j++) {
    backOk &&=
      weave.mesh.neighbour(cells[(j + 1) % L]!, LINE_BACK) === cells[j]
  }

  return { L, cells, index, backOk }
}

export const lineIndex = (j: number, dir: number, p: number): number =>
  (j * 2 + dir) * 9 + p
export const dockOf = (i: number): number => Math.floor(i / 18)
export const dirOf = (i: number): number => Math.floor(i / 9) % 2
export const pointOf = (i: number): number => i % 9

// an operator column: entries (row, amplitude (a + b w) / 2), sorted by row
export type LineEntry = { row: number; a: bigint; b: bigint }
export type LineOp = LineEntry[][]

const sortCol = (c: LineEntry[]): LineEntry[] =>
  c.sort((x, y) => x.row - y.row)

export function sameColumn(x: LineEntry[], y: LineEntry[]): boolean {
  return (
    x.length === y.length &&
    x.every(
      (e, n) =>
        e.row === y[n]!.row && e.a === y[n]!.a && e.b === y[n]!.b,
    )
  )
}

export function lineBeat(
  t: LockedTables,
  ring: LineRing,
): { op: LineOp; closed: boolean } {
  const op: LineOp = []

  let closed = true

  for (let i = 0; i < ring.L * 18; i++) {
    const j = dockOf(i)
    const dir = dirOf(i)
    const p = pointOf(i)
    const col: LineEntry[] = []

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

      col.push({
        row: lineIndex(jj, toDir, t.move[slot * 9 + p]!),
        a,
        b,
      })
    }

    op.push(sortCol(col))
  }

  return { op, closed }
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

// one column of B read off the rule's beat; undefined if the beat leaves the line or makes more than one vibe
export function lineRuleColumn(
  t: LockedTables,
  ring: LineRing,
  base: Configuration,
  i: number,
  beat: number,
): LineEntry[] | undefined {
  const slot = ring.cells[dockOf(i)]! * 24 + DIRS[dirOf(i)]!

  base.vibe[slot] = 1
  base.open[slot] = 1
  base.point[slot] = pointOf(i)

  const s = coinedVetoBeat('none', t, lockedState(base), beat)

  base.vibe[slot] = 0
  base.open[slot] = 0
  base.point[slot] = 0

  const col: LineEntry[] = []

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
    const dir = d === LINE_SLOT ? 0 : d === LINE_BACK ? 1 : -1

    if (jj === undefined || dir < 0) {
      return undefined
    }

    const scale = 1n << BigInt(1 - br.k)

    col.push({
      row: lineIndex(jj, dir, br.point[at]!),
      a: br.a * scale,
      b: br.b * scale,
    })
  }

  return sortCol(col)
}

export function transportedShift(
  t: LockedTables,
  ring: LineRing,
): Int32Array {
  const perm = new Int32Array(ring.L * 18)

  for (let i = 0; i < perm.length; i++) {
    const j = dockOf(i)
    const slot = ring.cells[j]! * 24 + LINE_SLOT

    perm[i] = lineIndex(
      (j + 1) % ring.L,
      dirOf(i),
      t.move[slot * 9 + pointOf(i)]!,
    )
  }

  return perm
}

export function commutatorColumns(op: LineOp, perm: Int32Array): number {
  let bad = 0

  for (let i = 0; i < op.length; i++) {
    const left = op[perm[i]!]!
    const right = sortCol(
      op[i]!.map(e => ({ ...e, row: perm[e.row]! })),
    )

    if (!sameColumn(left, right)) {
      bad++
    }
  }

  return bad
}

export function unitaryLine(op: LineOp): boolean {
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

export type LineVector = Map<number, Eisenstein>

export function applyLine(op: LineOp, v: LineVector): LineVector {
  const out: LineVector = new Map()

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

export function orbitOf(perm: Int32Array, start: number): number[] {
  const out: number[] = []

  let x = start

  do {
    out.push(x)
    x = perm[x]!
  } while (x !== start)

  return out
}

// psi(n, dir) on the covering ring, from the right orbit (dir 0) and the left orbit (dir 1); `complete` is false if the
// vector has weight off the two orbits
export function coveringAmplitudes(
  v: LineVector,
  right: readonly number[],
  left: readonly number[],
): { amp: Eisenstein[][]; complete: boolean } {
  const M = right.length
  const amp: Eisenstein[][] = [right, left].map(orbit =>
    orbit.map(i => v.get(i) ?? [0n, 0n]),
  )

  let seen = 0

  for (const row of amp) {
    for (const x of row) {
      if (x[0] !== 0n || x[1] !== 0n) {
        seen++
      }
    }
  }

  return { amp, complete: seen === v.size && left.length === M }
}

const conjE = (x: Eisenstein): Eisenstein => [x[0] - x[1], -x[1]]

// sum over dir and n of conj psi(n) psi(n + d), d = 0 .. M - 1, exact in Z[w]
export function flatAutocorrelation(
  amp: readonly (readonly Eisenstein[])[],
): Eisenstein[] {
  const M = amp[0]!.length
  const out: Eisenstein[] = []

  for (let d = 0; d < M; d++) {
    let s: Eisenstein = [0n, 0n]

    for (const row of amp) {
      for (let n = 0; n < M; n++) {
        const x = row[n]!
        const y = row[(n + d) % M]!

        if ((x[0] === 0n && x[1] === 0n) || (y[0] === 0n && y[1] === 0n)) {
          continue
        }

        const z = eTimes(conjE(x), y)

        s = [s[0] + z[0], s[1] + z[1]]
      }
    }

    out.push(s)
  }

  return out
}

export const shannon = (p: readonly number[]): number =>
  -p.reduce((s, x) => (x > 1e-300 ? s + x * Math.log(x) : s), 0)

// (a + b w) / 2^t as a complex float
export function eisensteinFloat(x: Eisenstein, t: number): [number, number] {
  const scale = 2 ** -t

  return [
    (Number(x[0]) - Number(x[1]) / 2) * scale,
    ((Number(x[1]) * Math.sqrt(3)) / 2) * scale,
  ]
}

// the centered representative of n on Z_M
export const centered = (n: number, M: number): number =>
  n <= Math.floor((M - 1) / 2) ? n : n - M

export type RingMoments = {
  // distributions over the covering position n, the T-momentum k, the dock j = n mod L
  fine: number[]
  momentum: number[]
  dock: number[]
  varX: number
  varP: number
  // <[x, p]> = i comm, comm real; cov = Re <x p> - <x><p>
  comm: number
  cov: number
}

// psi as floats re[dir][n], im[dir][n] on Z_M; L the dock count (n mod L is the dock)
export function ringMoments(
  re: readonly Float64Array[],
  im: readonly Float64Array[],
  M: number,
  L: number,
): RingMoments {
  const s = Math.sqrt((2 * Math.PI) / M)
  const fine = new Array<number>(M).fill(0)
  const momentum = new Array<number>(M).fill(0)
  const dock = new Array<number>(L).fill(0)
  const cos = new Float64Array(M)
  const sin = new Float64Array(M)

  for (let r = 0; r < M; r++) {
    cos[r] = Math.cos((2 * Math.PI * r) / M)
    sin[r] = Math.sin((2 * Math.PI * r) / M)
  }

  let xp = [0, 0]

  for (let dir = 0; dir < re.length; dir++) {
    const a = re[dir]!
    const b = im[dir]!
    // hat psi(k) = M^(-1/2) sum_n e^(-2 pi i k n / M) psi(n)
    const hr = new Float64Array(M)
    const hi = new Float64Array(M)

    for (let n = 0; n < M; n++) {
      const w = a[n]! * a[n]! + b[n]! * b[n]!

      fine[n]! += w
      dock[n % L]! += w
    }

    for (let k = 0; k < M; k++) {
      let x = 0
      let y = 0

      for (let n = 0; n < M; n++) {
        if (a[n] === 0 && b[n] === 0) {
          continue
        }

        const r = (k * n) % M

        x += a[n]! * cos[r]! + b[n]! * sin[r]!
        y += b[n]! * cos[r]! - a[n]! * sin[r]!
      }

      hr[k] = x / Math.sqrt(M)
      hi[k] = y / Math.sqrt(M)
      momentum[k]! += hr[k]! ** 2 + hi[k]! ** 2
    }

    // (p psi)(n) = M^(-1/2) sum_k e^(2 pi i k n / M) s b_k hat psi(k)
    for (let n = 0; n < M; n++) {
      if (centered(n, M) === 0) {
        continue
      }

      let x = 0
      let y = 0

      for (let k = 0; k < M; k++) {
        const r = (k * n) % M
        const bk = s * centered(k, M)

        x += bk * (hr[k]! * cos[r]! - hi[k]! * sin[r]!)
        y += bk * (hr[k]! * sin[r]! + hi[k]! * cos[r]!)
      }

      x /= Math.sqrt(M)
      y /= Math.sqrt(M)

      // conj psi(n) x(n) (p psi)(n)
      const xm = s * centered(n, M)

      xp = [
        xp[0]! + xm * (a[n]! * x + b[n]! * y),
        xp[1]! + xm * (a[n]! * y - b[n]! * x),
      ]
    }
  }

  const mean = (dist: readonly number[], f: (k: number) => number): number =>
    dist.reduce((acc, w, k) => acc + w * f(k), 0)
  const mx = mean(fine, n => s * centered(n, M))
  const mx2 = mean(fine, n => (s * centered(n, M)) ** 2)
  const mp = mean(momentum, k => s * centered(k, M))
  const mp2 = mean(momentum, k => (s * centered(k, M)) ** 2)

  return {
    fine,
    momentum,
    dock,
    varX: mx2 - mx * mx,
    varP: mp2 - mp * mp,
    comm: 2 * xp[1]!,
    cov: xp[0]! - mx * mp,
  }
}

// the ground state of (x^2 + p^2) / 2 on Z_M (M odd), real, as one direction's amplitudes
export function ringOscillatorGround(M: number): Float64Array {
  const D = (M - 1) / 2
  const s = Math.sqrt((2 * Math.PI) / M)
  const P = new Float64Array(M * M)

  for (let i = 0; i < M; i++) {
    for (let j = 0; j < M; j++) {
      let v = 0

      for (let b = -D; b <= D; b++) {
        v += b * Math.sin((2 * Math.PI * b * (i - j)) / M)
      }

      P[i * M + j] = (s * v) / M
    }
  }

  const H = new Float64Array(M * M)

  for (let i = 0; i < M; i++) {
    for (let j = 0; j < M; j++) {
      let pp = 0

      for (let k = 0; k < M; k++) {
        pp += P[i * M + k]! * P[k * M + j]!
      }

      H[i * M + j] = -pp / 2 + (i === j ? (s * (i - D)) ** 2 / 2 : 0)
    }
  }

  const { vectors } = symmetricEigen(M, H)
  const out = new Float64Array(M)

  // index i is m = i - D; place it at n = m mod M
  for (let i = 0; i < M; i++) {
    out[(i - D + M) % M] = vectors[i * M]!
  }

  return out
}
