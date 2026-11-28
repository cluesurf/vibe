// THE SELF'S SPECTRUM (report "Self persistence in reversible dynamics",
// experiments 1 and 2). B1's line sector (E-SLF-0182) as a sparse matrix on n loves of one ring of L docks, its
// momentum blocks, and the readings the spectral diagnosis takes: span, participation, the flat phases, the
// invariant subspace of a window.
//
// THE SECTOR. n <= 3 loves on the 2L modes of a ring (mode 2x + 1 the forward label 0 at dock x, 2x the back label 1,
// B1's order), a configuration held as its ascending modes, times the cut trit c when `pieces` (E-SPN-0103's drift
// cost reads the flux c + Q(l)), one state otherwise.
//
// THE BEAT (B1's, coin before): the phase (the cost zeta_14^(-links) under `pieces`, and every full dock's w^2,
// a = 28 of 42), the coin on every dock with one love (keep (1 + w)/2, cross (1 - w)/2), the line block's sign under
// `pieces` (the parity of the stream's reordering), the stream (label 0 one dock forward, label 1 one back), c moved
// by the cut crossings (a forward love leaving dock L - 1 moves it by -1, a back love leaving dock 0 by +1).
// BARE is the same beat with the cost and the sign off (pointBeatWith cost false, sign false): the working rule's
// own line sector on flat links.
//
// THE TRANSLATION T moves every love one dock forward; a love leaving dock L - 1 moves c by -1 (B1's wrapped
// translates), and under `pieces` T takes the reordering's sign. T commutes with the beat (checked, gate E3), so the
// sector splits into L momentum blocks: for an orbit r, T^j r = phi_j d_j, of length p with T^p r = chi r, the Bloch
// vector v_r = p^(-1/2) sum_j lambda^(-j) phi_j d_j lives in block lambda = e^(2 pi i k / L) when lambda^p = chi, and
// the block matrix is M[r_d, r] += sqrt(p_r / p_(r_d)) a_d lambda^(j_d) phi_d over U r = sum_d a_d d.
//
// Measurement only (floats). NOTHING MOVES the rule: every map here is B1's, checked against pointBeatWith and
// code/measure/cold-line by the experiment.

import type { Vec } from '@/code/measure/quantum-ladder'

const SQ3 = Math.sqrt(3)
const KEEP: readonly [number, number] = [0.25, SQ3 / 4]
const CROSS: readonly [number, number] = [0.75, -SQ3 / 4]
const TURN = 42
const COS = Float64Array.from({ length: TURN }, (_, a) => Math.cos((2 * Math.PI * a) / TURN))
const SIN = Float64Array.from({ length: TURN }, (_, a) => Math.sin((2 * Math.PI * a) / TURN))

export type Variant = 'bare' | 'pieces'

export type Sector = {
  readonly L: number
  readonly n: number
  readonly variant: Variant
  readonly cuts: number
  // configurations, n modes each, ascending
  readonly modes: Int32Array
  readonly count: number
  readonly index: Map<number, number>
  readonly size: number
}

const keyOf = (ms: readonly number[]): number => ms.reduce((k, m) => k * 64 + m, 0) * 4 + ms.length

export function sector(L: number, n: number, variant: Variant): Sector {
  if (n < 1 || n > 3 || L > 32) {
    throw new Error(`self-spectrum: L ${L} n ${n} out of range`)
  }

  const out: number[] = []
  const index = new Map<number, number>()
  const pick = (from: number, left: number, acc: number[]): void => {
    if (left === 0) {
      index.set(keyOf(acc), out.length / n)
      out.push(...acc)
      return
    }

    for (let m = from; m < 2 * L; m++) {
      pick(m + 1, left - 1, [...acc, m])
    }
  }

  pick(0, n, [])

  const count = out.length / n
  const cuts = variant === 'pieces' ? 3 : 1

  return { L, n, variant, cuts, modes: Int32Array.from(out), count, index, size: count * cuts }
}

export function configOf(s: Sector, i: number): number[] {
  return Array.from(s.modes.subarray(i * s.n, i * s.n + s.n))
}

export function indexOf(s: Sector, ms: readonly number[]): number {
  const sorted = [...ms].sort((a, b) => a - b)
  const i = s.index.get(keyOf(sorted))

  if (i === undefined) {
    throw new Error(`self-spectrum: no configuration ${sorted.join(',')}`)
  }

  return i
}

// the parity of the permutation that sorts `after` (the images of ascending modes, in order)
function reorderSign(after: readonly number[]): number {
  let inv = 0

  for (let i = 0; i < after.length; i++) {
    for (let j = i + 1; j < after.length; j++) {
      if (after[i]! > after[j]!) {
        inv++
      }
    }
  }

  return inv % 2 === 0 ? 1 : -1
}

// span: the docks of the smallest arc holding every love, minus 1
export function spanOf(L: number, ms: readonly number[]): number {
  const docks = [...new Set(ms.map(m => m >> 1))].sort((a, b) => a - b)

  let gap = docks[0]! + L - docks[docks.length - 1]!

  for (let i = 1; i < docks.length; i++) {
    gap = Math.max(gap, docks[i]! - docks[i - 1]!)
  }

  return L - gap
}

// ---- the beat as a sparse matrix, column by column ----

export type Sparse = {
  readonly size: number
  readonly start: Int32Array
  readonly row: Int32Array
  readonly re: Float64Array
  readonly im: Float64Array
}

export function beatMatrix(s: Sector): Sparse {
  const { L, n, cuts } = s
  const pieces = s.variant === 'pieces'
  const start = new Int32Array(s.size + 1)
  const rows: number[] = []
  const res: number[] = []
  const ims: number[] = []

  for (let i = 0; i < s.count; i++) {
    const ms = configOf(s, i)
    const q = new Int32Array(L)

    for (const m of ms) {
      q[m >> 1]!++
    }

    const full = q.reduce((a, v) => a + (v === 2 ? 1 : 0), 0)
    const singles = ms.filter(m => q[m >> 1] === 1)

    for (let c = 0; c < cuts; c++) {
      const col = i * cuts + c

      let links = 0

      if (pieces) {
        let Q = 0

        for (let l = 0; l < L; l++) {
          Q += q[l]!

          if ((c + Q) % 3 !== 0) {
            links++
          }
        }
      }

      const a = ((((pieces ? -3 * links : 0) + 28 * full) % TURN) + TURN) % TURN
      const pr = COS[a]!
      const pi = SIN[a]!
      const entries = new Map<number, [number, number]>()

      for (let f = 0; f < 1 << singles.length; f++) {
        let ar = pr
        let ai = pi
        const flipped = new Set<number>()

        singles.forEach((m, b) => {
          const w = (f >> b) & 1 ? CROSS : KEEP
          const nr = ar * w[0] - ai * w[1]

          ai = ar * w[1] + ai * w[0]
          ar = nr

          if ((f >> b) & 1) {
            flipped.add(m)
          }
        })

        const coined = ms.map(m => (flipped.has(m) ? m ^ 1 : m)).sort((x, y) => x - y)
        const after: number[] = []

        let cut = 0

        for (const m of coined) {
          const x = m >> 1
          const forward = (m & 1) === 1
          const y = forward ? (x + 1) % L : (x - 1 + L) % L

          if (forward && x === L - 1) {
            cut--
          }

          if (!forward && x === 0) {
            cut++
          }

          after.push(forward ? 2 * y + 1 : 2 * y)
        }

        const sign = pieces ? reorderSign(after) : 1
        const c1 = pieces ? (((c + cut) % 3) + 3) % 3 : 0
        const r = indexOf(s, after) * cuts + c1
        const old = entries.get(r) ?? [0, 0]

        entries.set(r, [old[0] + sign * ar, old[1] + sign * ai])
      }

      for (const [r, [er, ei]] of entries) {
        rows.push(r)
        res.push(er)
        ims.push(ei)
      }

      start[col + 1] = rows.length
    }
  }

  return { size: s.size, start, row: Int32Array.from(rows), re: Float64Array.from(res), im: Float64Array.from(ims) }
}

export function apply(U: Sparse, v: Vec): Vec {
  const out = { re: new Float64Array(U.size), im: new Float64Array(U.size) }

  for (let c = 0; c < U.size; c++) {
    const vr = v.re[c]!
    const vi = v.im[c]!

    if (vr === 0 && vi === 0) {
      continue
    }

    for (let e = U.start[c]!; e < U.start[c + 1]!; e++) {
      const r = U.row[e]!

      out.re[r]! += U.re[e]! * vr - U.im[e]! * vi
      out.im[r]! += U.re[e]! * vi + U.im[e]! * vr
    }
  }

  return out
}

// max |U^dag U - 1| over the column pairs that share a row
export function columnOrthonormality(U: Sparse): number {
  const byRow: [number, number, number][][] = Array.from({ length: U.size }, () => [])

  for (let c = 0; c < U.size; c++) {
    for (let e = U.start[c]!; e < U.start[c + 1]!; e++) {
      byRow[U.row[e]!]!.push([c, U.re[e]!, U.im[e]!])
    }
  }

  let worst = 0

  for (let c = 0; c < U.size; c++) {
    const acc = new Map<number, [number, number]>()

    for (let e = U.start[c]!; e < U.start[c + 1]!; e++) {
      const ar = U.re[e]!
      const ai = -U.im[e]!

      for (const [d, br, bi] of byRow[U.row[e]!]!) {
        const o = acc.get(d) ?? [0, 0]

        acc.set(d, [o[0] + ar * br - ai * bi, o[1] + ar * bi + ai * br])
      }
    }

    for (const [d, [r, i]] of acc) {
      worst = Math.max(worst, Math.hypot(r - (d === c ? 1 : 0), i))
    }

    if (acc.size === 0) {
      worst = Math.max(worst, 1)
    }
  }

  return worst
}

// ---- the translation ----

export type Translation = { readonly target: Int32Array; readonly sign: Int8Array }

export function translation(s: Sector): Translation {
  const { L, cuts } = s
  const target = new Int32Array(s.size)
  const sign = new Int8Array(s.size)

  for (let i = 0; i < s.count; i++) {
    const ms = configOf(s, i)
    const after = ms.map(m => (m + 2) % (2 * L))
    const wrapped = ms.filter(m => m >> 1 === L - 1).length
    const sg = s.variant === 'pieces' ? reorderSign(after) : 1
    const j = indexOf(s, after)

    for (let c = 0; c < cuts; c++) {
      const c1 = s.variant === 'pieces' ? (((c - wrapped) % 3) + 3) % 3 : 0

      target[i * cuts + c] = j * cuts + c1
      sign[i * cuts + c] = sg
    }
  }

  return { target, sign }
}

export function translate(T: Translation, v: Vec): Vec {
  const out = { re: new Float64Array(v.re.length), im: new Float64Array(v.re.length) }

  for (let u = 0; u < v.re.length; u++) {
    out.re[T.target[u]!] = T.sign[u]! * v.re[u]!
    out.im[T.target[u]!] = T.sign[u]! * v.im[u]!
  }

  return out
}

// |TU - UT| on every column (the max entry) and whether T^L is the identity
export function translationGates(s: Sector, U: Sparse, T: Translation): { commutator: number; periodic: boolean } {
  let commutator = 0

  // column c: T U e_c against U T e_c = sign_c U e_(T c)
  for (let c = 0; c < s.size; c++) {
    const diff = new Map<number, [number, number]>()
    const add = (r: number, x: number, y: number): void => {
      const o = diff.get(r) ?? [0, 0]

      diff.set(r, [o[0] + x, o[1] + y])
    }

    for (let e = U.start[c]!; e < U.start[c + 1]!; e++) {
      const r = U.row[e]!

      add(T.target[r]!, T.sign[r]! * U.re[e]!, T.sign[r]! * U.im[e]!)
    }

    const tc = T.target[c]!
    const sc = T.sign[c]!

    for (let e = U.start[tc]!; e < U.start[tc + 1]!; e++) {
      add(U.row[e]!, -sc * U.re[e]!, -sc * U.im[e]!)
    }

    for (const [x, y] of diff.values()) {
      commutator = Math.max(commutator, Math.hypot(x, y))
    }
  }

  let periodic = true

  for (let c = 0; c < s.size; c++) {
    let x = c
    let ph = 1

    for (let j = 0; j < s.L; j++) {
      ph *= T.sign[x]!
      x = T.target[x]!
    }

    if (x !== c || ph !== 1) {
      periodic = false
    }
  }

  return { commutator, periodic }
}

// ---- the momentum blocks ----

export type Orbits = {
  // per state: its orbit's representative, j and phi with T^j rep = phi state
  readonly rep: Int32Array
  readonly step: Int32Array
  readonly phi: Int8Array
  // per representative: the orbit's states in order (T^j rep = phi_j d_j), its length and chi
  readonly reps: readonly number[]
  readonly members: Map<number, { d: Int32Array; phi: Int8Array; chi: number }>
}

export function orbits(s: Sector, T: Translation): Orbits {
  const rep = new Int32Array(s.size).fill(-1)
  const step = new Int32Array(s.size)
  const phi = new Int8Array(s.size)
  const reps: number[] = []
  const members = new Map<number, { d: Int32Array; phi: Int8Array; chi: number }>()

  for (let r = 0; r < s.size; r++) {
    if (rep[r] !== -1) {
      continue
    }

    const ds: number[] = []
    const ps: number[] = []

    let x = r
    let ph = 1

    do {
      rep[x] = r
      step[x] = ds.length
      phi[x] = ph
      ds.push(x)
      ps.push(ph)
      ph *= T.sign[x]!
      x = T.target[x]!
    } while (x !== r)

    reps.push(r)
    members.set(r, { d: Int32Array.from(ds), phi: Int8Array.from(ps), chi: ph })
  }

  return { rep, step, phi, reps, members }
}

export type Block = {
  readonly k: number
  readonly lambda: [number, number]
  readonly reps: Int32Array
  readonly dim: number
  readonly re: Float64Array
  readonly im: Float64Array
}

const cpow = (lr: number, li: number, p: number): [number, number] => {
  const a = Math.atan2(li, lr) * p

  return [Math.cos(a), Math.sin(a)]
}

export function blockReps(s: Sector, o: Orbits, k: number): Int32Array {
  const [lr, li] = [Math.cos((2 * Math.PI * k) / s.L), Math.sin((2 * Math.PI * k) / s.L)]

  return Int32Array.from(
    o.reps.filter(r => {
      const m = o.members.get(r)!
      const [pr, pi] = cpow(lr, li, m.d.length)

      return Math.hypot(pr - m.chi, pi) < 1e-9
    }),
  )
}

export function block(s: Sector, U: Sparse, o: Orbits, k: number): Block {
  const lr = Math.cos((2 * Math.PI * k) / s.L)
  const li = Math.sin((2 * Math.PI * k) / s.L)
  const reps = blockReps(s, o, k)
  const dim = reps.length
  const at = new Map<number, number>()

  reps.forEach((r, i) => at.set(r, i))

  const re = new Float64Array(dim * dim)
  const im = new Float64Array(dim * dim)

  for (let col = 0; col < dim; col++) {
    const r = reps[col]!
    const pr = o.members.get(r)!.d.length

    for (let e = U.start[r]!; e < U.start[r + 1]!; e++) {
      const d = U.row[e]!
      const rd = o.rep[d]!
      const row = at.get(rd)

      if (row === undefined) {
        continue
      }

      const pd = o.members.get(rd)!.d.length
      const [xr, xi] = cpow(lr, li, o.step[d]!)
      const f = Math.sqrt(pr / pd) * o.phi[d]!
      const ar = U.re[e]!
      const ai = U.im[e]!

      re[row * dim + col]! += f * (ar * xr - ai * xi)
      im[row * dim + col]! += f * (ar * xi + ai * xr)
    }
  }

  return { k, lambda: [lr, li], reps, dim, re, im }
}

// a full-sector vector's coordinates in a block: <v_r | psi>
export function project(o: Orbits, b: Block, psi: Vec): Vec {
  const out = { re: new Float64Array(b.dim), im: new Float64Array(b.dim) }
  const [lr, li] = b.lambda

  b.reps.forEach((r, i) => {
    const m = o.members.get(r)!
    const p = m.d.length

    let sr = 0
    let si = 0

    for (let j = 0; j < p; j++) {
      const [xr, xi] = cpow(lr, li, j)
      const vr = psi.re[m.d[j]!]! * m.phi[j]!
      const vi = psi.im[m.d[j]!]! * m.phi[j]!

      sr += xr * vr - xi * vi
      si += xr * vi + xi * vr
    }

    out.re[i] = sr / Math.sqrt(p)
    out.im[i] = si / Math.sqrt(p)
  })

  return out
}

// max |M^dag M - 1|
export function denseUnitarity(n: number, re: Float64Array, im: Float64Array): number {
  let worst = 0

  for (let a = 0; a < n; a++) {
    for (let b = a; b < n; b++) {
      let sr = 0
      let si = 0

      for (let r = 0; r < n; r++) {
        const xr = re[r * n + a]!
        const xi = -im[r * n + a]!
        const yr = re[r * n + b]!
        const yi = im[r * n + b]!

        sr += xr * yr - xi * yi
        si += xr * yi + xi * yr
      }

      worst = Math.max(worst, Math.hypot(sr - (a === b ? 1 : 0), si))
    }
  }

  return worst
}

// max |<v_a | v_b> - delta|
export function orthonormality(vs: readonly Vec[]): number {
  let worst = 0

  for (let a = 0; a < vs.length; a++) {
    for (let b = a; b < vs.length; b++) {
      let sr = 0
      let si = 0
      const u = vs[a]!
      const v = vs[b]!

      for (let x = 0; x < u.re.length; x++) {
        sr += u.re[x]! * v.re[x]! + u.im[x]! * v.im[x]!
        si += u.re[x]! * v.im[x]! - u.im[x]! * v.re[x]!
      }

      worst = Math.max(worst, Math.hypot(sr - (a === b ? 1 : 0), si))
    }
  }

  return worst
}

export function dense(U: Sparse): { re: Float64Array; im: Float64Array } {
  const n = U.size
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let c = 0; c < n; c++) {
    for (let e = U.start[c]!; e < U.start[c + 1]!; e++) {
      re[U.row[e]! * n + c] = U.re[e]!
      im[U.row[e]! * n + c] = U.im[e]!
    }
  }

  return { re, im }
}

// ---- a window of docks: the invariant subspace and the restricted step ----

// the states with every love in docks [from, to] and c = 0
export function windowStates(s: Sector, from: number, to: number): Int32Array {
  const out: number[] = []

  for (let i = 0; i < s.count; i++) {
    if (configOf(s, i).every(m => (m >> 1) >= from && (m >> 1) <= to)) {
      out.push(i * s.cuts)
    }
  }

  return Int32Array.from(out)
}

// k columns of N_P rows, column-major: column a at [a * N .. a * N + N)
type Columns = { N: number; k: number; re: Float64Array; im: Float64Array }

// the null space of a matrix given by its columns (rows any length), from the Hermitian A^dag A: eigenvectors with
// eigenvalue at most `floor`, as coefficient columns
function nullSpace(
  k: number,
  gram: (a: number, b: number) => [number, number],
  floor: number,
  eigen: (n: number, re: Float64Array, im: Float64Array) => { values: Float64Array; vectorsRe: Float64Array; vectorsIm: Float64Array },
): Columns {
  const re = new Float64Array(k * k)
  const im = new Float64Array(k * k)

  for (let a = 0; a < k; a++) {
    for (let b = a; b < k; b++) {
      const [r, i] = gram(a, b)

      re[a * k + b] = r
      im[a * k + b] = i
      re[b * k + a] = r
      im[b * k + a] = -i
    }
  }

  const h = eigen(k, re, im)
  const keep: number[] = []

  for (let i = 0; i < k; i++) {
    if (h.values[i]! <= floor) {
      keep.push(i)
    }
  }

  const out = { N: k, k: keep.length, re: new Float64Array(k * keep.length), im: new Float64Array(k * keep.length) }

  keep.forEach((v, a) => {
    for (let x = 0; x < k; x++) {
      out.re[a * k + x] = h.vectorsRe[v * k + x]!
      out.im[a * k + x] = h.vectorsIm[v * k + x]!
    }
  })

  return out
}

export type Invariant = {
  // the window's states, the subspace's dimension and its orthonormal columns over them
  readonly states: Int32Array
  readonly Q: Columns
  readonly rounds: number
  // |(1 - P) U Q| and |(1 - Pi_Q) U Q| (max column norms), and Q^dag U Q on the subspace
  readonly leak: number
  readonly drift: number
  readonly hre: Float64Array
  readonly him: Float64Array
}

// the largest U-invariant subspace of the window: V_0 = null((1 - P) U P), V_(t+1) = {v in V_t : U v in V_t}
export function invariantInWindow(
  s: Sector,
  U: Sparse,
  states: Int32Array,
  eigen: (n: number, re: Float64Array, im: Float64Array) => { values: Float64Array; vectorsRe: Float64Array; vectorsIm: Float64Array },
  floor = 1e-13,
): Invariant {
  const N = states.length
  const at = new Map<number, number>()

  states.forEach((u, i) => at.set(u, i))

  // U on each window state: its part inside (dense over the window) and outside (sparse)
  const insideRe = new Float64Array(N * N)
  const insideIm = new Float64Array(N * N)
  const outside: Map<number, [number, number]>[] = []

  for (let j = 0; j < N; j++) {
    const c = states[j]!
    const out = new Map<number, [number, number]>()

    for (let e = U.start[c]!; e < U.start[c + 1]!; e++) {
      const r = U.row[e]!
      const i = at.get(r)

      if (i === undefined) {
        out.set(r, [U.re[e]!, U.im[e]!])
      } else {
        insideRe[j * N + i] = U.re[e]!
        insideIm[j * N + i] = U.im[e]!
      }
    }

    outside.push(out)
  }

  // U applied to a column over the window: [inside, outside]
  const applyColumn = (cre: Float64Array, cim: Float64Array, off: number): { inRe: Float64Array; inIm: Float64Array; out: Map<number, [number, number]> } => {
    const inRe = new Float64Array(N)
    const inIm = new Float64Array(N)
    const out = new Map<number, [number, number]>()

    for (let j = 0; j < N; j++) {
      const vr = cre[off + j]!
      const vi = cim[off + j]!

      if (vr === 0 && vi === 0) {
        continue
      }

      for (let i = 0; i < N; i++) {
        const ur = insideRe[j * N + i]!
        const ui = insideIm[j * N + i]!

        if (ur !== 0 || ui !== 0) {
          inRe[i]! += ur * vr - ui * vi
          inIm[i]! += ur * vi + ui * vr
        }
      }

      for (const [r, [ur, ui]] of outside[j]!) {
        const o = out.get(r) ?? [0, 0]

        out.set(r, [o[0] + ur * vr - ui * vi, o[1] + ur * vi + ui * vr])
      }
    }

    return { inRe, inIm, out }
  }

  // V_0 from the outside parts of the window's basis
  const byRow = new Map<number, [number, number, number][]>()

  outside.forEach((m, j) => {
    for (const [r, [x, y]] of m) {
      const list = byRow.get(r) ?? []

      list.push([j, x, y])
      byRow.set(r, list)
    }
  })

  const g0re = new Float64Array(N * N)
  const g0im = new Float64Array(N * N)

  for (const list of byRow.values()) {
    for (const [a, ar, ai] of list) {
      for (const [b, br, bi] of list) {
        g0re[a * N + b]! += ar * br + ai * bi
        g0im[a * N + b]! += ar * bi - ai * br
      }
    }
  }

  let Q = nullSpace(N, (a, b) => [g0re[a * N + b]!, g0im[a * N + b]!], floor, eigen)
  let rounds = 1

  while (Q.k > 0) {
    // B = (1 - Q Q^dag) U Q over the window
    const k = Q.k
    const Bre = new Float64Array(N * k)
    const Bim = new Float64Array(N * k)

    for (let a = 0; a < k; a++) {
      const { inRe, inIm } = applyColumn(Q.re, Q.im, a * N)

      for (let i = 0; i < N; i++) {
        Bre[a * N + i] = inRe[i]!
        Bim[a * N + i] = inIm[i]!
      }

      for (let b = 0; b < k; b++) {
        let sr = 0
        let si = 0

        for (let i = 0; i < N; i++) {
          const qr = Q.re[b * N + i]!
          const qi = -Q.im[b * N + i]!

          sr += qr * inRe[i]! - qi * inIm[i]!
          si += qr * inIm[i]! + qi * inRe[i]!
        }

        for (let i = 0; i < N; i++) {
          const qr = Q.re[b * N + i]!
          const qi = Q.im[b * N + i]!

          Bre[a * N + i]! -= qr * sr - qi * si
          Bim[a * N + i]! -= qr * si + qi * sr
        }
      }
    }

    const Y = nullSpace(
      k,
      (a, b) => {
        let sr = 0
        let si = 0

        for (let i = 0; i < N; i++) {
          const xr = Bre[a * N + i]!
          const xi = -Bim[a * N + i]!
          const yr = Bre[b * N + i]!
          const yi = Bim[b * N + i]!

          sr += xr * yr - xi * yi
          si += xr * yi + xi * yr
        }

        return [sr, si]
      },
      floor,
      eigen,
    )

    rounds++

    if (Y.k === k) {
      break
    }

    const next = { N, k: Y.k, re: new Float64Array(N * Y.k), im: new Float64Array(N * Y.k) }

    for (let a = 0; a < Y.k; a++) {
      for (let b = 0; b < k; b++) {
        const yr = Y.re[a * k + b]!
        const yi = Y.im[a * k + b]!

        for (let i = 0; i < N; i++) {
          const qr = Q.re[b * N + i]!
          const qi = Q.im[b * N + i]!

          next.re[a * N + i]! += qr * yr - qi * yi
          next.im[a * N + i]! += qr * yi + qi * yr
        }
      }
    }

    Q = next
  }

  // the checks and Q^dag U Q
  const k = Q.k
  const hre = new Float64Array(k * k)
  const him = new Float64Array(k * k)

  let leak = 0
  let drift = 0

  for (let a = 0; a < k; a++) {
    const { inRe, inIm, out } = applyColumn(Q.re, Q.im, a * N)

    let o = 0

    for (const [x, y] of out.values()) {
      o += x * x + y * y
    }

    leak = Math.max(leak, Math.sqrt(o))

    const rr = Float64Array.from(inRe)
    const ri = Float64Array.from(inIm)

    for (let b = 0; b < k; b++) {
      let sr = 0
      let si = 0

      for (let i = 0; i < N; i++) {
        const qr = Q.re[b * N + i]!
        const qi = -Q.im[b * N + i]!

        sr += qr * inRe[i]! - qi * inIm[i]!
        si += qr * inIm[i]! + qi * inRe[i]!
      }

      hre[b * k + a] = sr
      him[b * k + a] = si

      for (let i = 0; i < N; i++) {
        rr[i]! -= Q.re[b * N + i]! * sr - Q.im[b * N + i]! * si
        ri[i]! -= Q.re[b * N + i]! * si + Q.im[b * N + i]! * sr
      }
    }

    let d = 0

    for (let i = 0; i < N; i++) {
      d += rr[i]! ** 2 + ri[i]! ** 2
    }

    drift = Math.max(drift, Math.sqrt(d))
  }

  return { states, Q, rounds, leak, drift, hre, him }
}

// the weight of psi (a full-sector vector) on the subspace's columns
export function weightOn(inv: Invariant, psi: Vec): number {
  const { Q, states } = inv
  const N = states.length

  let w = 0

  for (let a = 0; a < Q.k; a++) {
    let sr = 0
    let si = 0

    for (let i = 0; i < N; i++) {
      const qr = Q.re[a * N + i]!
      const qi = -Q.im[a * N + i]!
      const pr = psi.re[states[i]!]!
      const pi = psi.im[states[i]!]!

      sr += qr * pr - qi * pi
      si += qr * pi + qi * pr
    }

    w += sr * sr + si * si
  }

  return w
}
