// Shared information on the QUANTUM state of the working vacuum (E-GRV-0068, E-GRV-0069). A pure READING: nothing in
// the rule is changed or added. E-GRV-0064 read shared information on the classical gas and found a product state; this
// file reads it on the superposed state the coined no-veto store already produces (code/rule/coined-locked-knit
// coinedVetoBeat, the rule E-RLT-0104 and E-RLT-0105 check).
//
// THE STATE. The rule's state is a sum of configurations (branches), each with an exact amplitude (a + b w) / 2^k in
// Z[w][1/2], w = exp(2 pi i / 3). Its weight is norm(a, b) / 4^k. Nothing is sampled: the state is held term by term.
//
// THE REGIONS. A husk column (code/measure/causal-components boxHusk): every dock whose husk position is that column, at
// every depth, with the slots of those docks (vibe, point, open) and the stores of their lines (store, stored pair word,
// open bits). A region's CONTENT on a branch is that list of values.
//
// THE REDUCED STATE of a region A is the partial trace of the pure state over everything outside A:
//   rho_A[x, x'] = sum over branches n, m that agree outside A, with A content x on n and x' on m, of alpha_n conj(alpha_m)
// The von Neumann entropy S(A) = -tr rho_A log2 rho_A, and the quantum mutual information of two regions is
// I(A : B) = S(A) + S(B) - S(A u B), in bits. Two regions that differ on no branch are pure and share nothing.
//
// HOW IT IS COMPUTED, exactly as defined: only ACTIVE columns (whose content differs between some two branches) can
// carry entropy. For every pair of branches the list of active columns where they differ is found once; a pair of
// branches contributes to rho_A only if that list lies inside A (so to rho_A u B only if it lies inside {A, B}). The
// eigenvalues come from the Hermitian matrix's real 2n x 2n embedding (each eigenvalue twice), cyclic Jacobi.
//
// THE ALL-OPEN VACUUM (every stored pair open, 'the physical rule' of code/measure/doublet-locked-readings). Its state is
// too large to hold as branches: 480 unequal-point like meetings at beat 1 on side 4 (7,680 on side 8), each splitting
// every term in two, so 2^480 terms after one beat. It is read EXACTLY without being held, while the only splits are
// that first layer: under the no-veto store no piece reads a point (E-RLT-0100 T2 read for 'none': the pair move reads
// trits, the collision reads held-or-not, the stream reads nothing), so the occupation and the path of every register
// are one classical history, and after one layer of disjoint meetings the state is the product over the met pairs of
// the pair state (1 + w)/2 |p, q> - (1 - w)/2 |q, p> (Schmidt weights 1/4 and 3/4, E-RLT-0103's knot) with one definite
// configuration of everything else. So I(A : B) = 2 h(1/4) bits for every pair whose two registers lie in A and in B,
// summed over pairs. `pairColumns` finds where each pair's two registers sit by marking one register at a time with
// its open bit and running the rule's own keep path; nothing is re-implemented.
//
// Reals appear only here, in the readers. DETERMINISM: the start family, no draw. NOTHING MOVES: the stream takes its
// neighbor's value; every reading compares values the rule wrote.

import { jacobiEigenvalues } from '@/code/algebra/linear/eig-jacobi'
import {
  cloneConfiguration,
  type Branch,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { THRESHOLD_KEEP } from '@/code/measure/doublet-locked-readings'
import { vetoPathRunner } from '@/code/measure/occupation-veto-readings'
import { meshDistance } from '@/code/measure/shared-distance'

const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(
  f => OPPOSITE[f] ?? f,
)
const ROOT3 = Math.sqrt(3) / 2

// the entropy of one of the pair state's registers, h(1/4), in bits
export const PAIR_HALF_ENTROPY = -(
  0.25 * Math.log2(0.25) +
  0.75 * Math.log2(0.75)
)

export function amplitude(b: Branch): [number, number] {
  const scale = 2 ** -b.k
  const a = Number(b.a)
  const w = Number(b.b)

  return [(a - w / 2) * scale, w * ROOT3 * scale]
}

// ---- the husk geometry ----

export type HuskGeometry = {
  readonly side: number
  readonly columns: number
  readonly column: Int32Array
  readonly docksOf: number[][]
}

export function huskGeometry(
  side: number,
  column: Int32Array,
): HuskGeometry {
  const columns = side ** 3
  const docksOf: number[][] = Array.from({ length: columns }, () => [])

  column.forEach((c, x) => docksOf[c]!.push(x))

  return { side, columns, column, docksOf }
}

// the minimal-image displacement of column b from column a
export function displacement(
  g: HuskGeometry,
  a: number,
  b: number,
): number[] {
  const s = g.side
  const ca = [a % s, ((a / s) | 0) % s, (a / (s * s)) | 0]
  const cb = [b % s, ((b / s) | 0) % s, (b / (s * s)) | 0]

  return ca.map((v, k) => {
    const d = (((cb[k]! - v) % s) + s) % s

    return d > s / 2 ? d - s : d
  })
}

export type ClassName = {
  family: 'axis' | 'face' | 'body' | 'other'
  k: number
  mesh: number
}

export function classOf(d: readonly number[]): ClassName {
  const a = d.map(Math.abs).sort((x, y) => y - x)
  const mesh = meshDistance(d)

  if (a[1] === 0) {
    return { family: 'axis', k: a[0]!, mesh }
  }

  if (a[2] === 0 && a[0] === a[1]) {
    return { family: 'face', k: a[0]!, mesh }
  }

  if (a[0] === a[1] && a[1] === a[2]) {
    return { family: 'body', k: a[0]!, mesh }
  }

  return { family: 'other', k: 0, mesh }
}

export const classLabel = (c: ClassName): string =>
  c.family === 'other' ? `other-mesh${c.mesh}` : `${c.family}${c.k}`

// ---- the reduced states of husk columns ----

function contentKey(
  c: Configuration,
  docks: readonly number[],
): string {
  const out: number[] = []

  for (const x of docks) {
    for (let d = 0; d < 24; d++) {
      const i = x * 24 + d

      out.push(
        c.vibe[i]!,
        c.vibe[i] !== 0 ? c.point[i]! : 0,
        c.vibe[i] !== 0 ? c.open[i]! : 0,
      )
    }

    for (let l = 0; l < 12; l++) {
      const i = x * 12 + l

      out.push(
        c.store[i]!,
        c.store[i] !== 0 ? c.spoint[i]! : 0,
        c.store[i] !== 0 ? c.sopen[i]! : 0,
      )
    }
  }

  return out.join(',')
}

// the von Neumann entropy (bits) of a Hermitian density matrix given as real and imaginary parts
export function vonNeumann(re: number[][], im: number[][]): number {
  const n = re.length

  if (n === 1) {
    return 0
  }

  const big: number[][] = Array.from({ length: 2 * n }, () =>
    new Array<number>(2 * n).fill(0),
  )

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      big[i]![j] = re[i]![j]!
      big[i + n]![j + n] = re[i]![j]!
      big[i]![j + n] = -im[i]![j]!
      big[i + n]![j] = im[i]![j]!
    }
  }

  let s = 0

  for (const l of jacobiEigenvalues(big, 200, 1e-30)) {
    if (l > 1e-15) {
      s -= l * Math.log2(l)
    }
  }

  return s / 2
}

export type QuantumReader = {
  readonly active: number[]
  readonly entropy: (a: number) => number
  readonly information: (a: number, b: number) => number
  readonly total: number
}

// the reader of one superposed state on the husk columns
export function quantumReader(
  branches: readonly Branch[],
  g: HuskGeometry,
): QuantumReader {
  const n = branches.length
  const amp = branches.map(amplitude)
  const total = amp.reduce((s, [x, y]) => s + x * x + y * y, 0)
  const b0 = branches[0]!
  const activeSet = new Set<number>()

  for (let m = 1; m < n; m++) {
    const b = branches[m]!

    for (let i = 0; i < b.vibe.length; i++) {
      if (
        b.vibe[i] !== b0.vibe[i] ||
        (b.vibe[i] !== 0 &&
          (b.point[i] !== b0.point[i] || b.open[i] !== b0.open[i]))
      ) {
        activeSet.add(g.column[(i / 24) | 0]!)
      }
    }

    for (let i = 0; i < b.store.length; i++) {
      if (
        b.store[i] !== b0.store[i] ||
        (b.store[i] !== 0 &&
          (b.spoint[i] !== b0.spoint[i] || b.sopen[i] !== b0.sopen[i]))
      ) {
        activeSet.add(g.column[(i / 12) | 0]!)
      }
    }
  }

  const active = [...activeSet].sort((x, y) => x - y)
  const where = new Map(active.map((c, k) => [c, k]))
  const keys = branches.map(b =>
    active.map(c => contentKey(b, g.docksOf[c]!)),
  )
  // branch pairs differing on exactly one or exactly two active columns
  const one = new Map<number, [number, number][]>()
  const two = new Map<string, [number, number][]>()

  for (let p = 0; p < n; p++) {
    for (let q = p + 1; q < n; q++) {
      const diff: number[] = []

      for (let k = 0; k < active.length && diff.length <= 2; k++) {
        if (keys[p]![k] !== keys[q]![k]) {
          diff.push(k)
        }
      }

      if (diff.length === 1) {
        const list = one.get(diff[0]!) ?? []

        list.push([p, q])
        one.set(diff[0]!, list)
      } else if (diff.length === 2) {
        const tag = `${diff[0]},${diff[1]}`
        const list = two.get(tag) ?? []

        list.push([p, q])
        two.set(tag, list)
      }
    }
  }

  // the entropy of the region made of the active columns `ks`
  const regionEntropy = (ks: readonly number[]): number => {
    const label = (m: number): string =>
      ks.map(k => keys[m]![k]).join('|')
    const index = new Map<string, number>()
    const of = branches.map((_, m) => {
      const l = label(m)

      if (!index.has(l)) {
        index.set(l, index.size)
      }

      return index.get(l)!
    })
    const size = index.size

    if (size === 1) {
      return 0
    }

    const re: number[][] = Array.from({ length: size }, () =>
      new Array<number>(size).fill(0),
    )
    const im: number[][] = Array.from({ length: size }, () =>
      new Array<number>(size).fill(0),
    )

    const add = (p: number, q: number): void => {
      const [xr, xi] = amp[p]!
      const [yr, yi] = amp[q]!
      const r = (xr * yr + xi * yi) / total
      const i = (xi * yr - xr * yi) / total
      const u = of[p]!
      const v = of[q]!

      re[u]![v]! += r
      im[u]![v]! += i
      re[v]![u]! += r
      im[v]![u]! -= i
    }

    for (let m = 0; m < n; m++) {
      const [xr, xi] = amp[m]!

      re[of[m]!]![of[m]!]! += (xr * xr + xi * xi) / total
    }

    for (const k of ks) {
      for (const [p, q] of one.get(k) ?? []) {
        add(p, q)
      }
    }

    if (ks.length === 2) {
      for (const [p, q] of two.get(`${ks[0]},${ks[1]}`) ?? []) {
        add(p, q)
      }
    }

    return vonNeumann(re, im)
  }

  const single = new Map<number, number>()

  const entropy = (c: number): number => {
    const k = where.get(c)

    if (k === undefined) {
      return 0
    }

    if (!single.has(k)) {
      single.set(k, regionEntropy([k]))
    }

    return single.get(k)!
  }

  const information = (a: number, b: number): number => {
    const ka = where.get(a)
    const kb = where.get(b)

    if (ka === undefined || kb === undefined || a === b) {
      return 0
    }

    const pair = ka < kb ? [ka, kb] : [kb, ka]

    return entropy(a) + entropy(b) - regionEntropy(pair)
  }

  return { active, entropy, information, total }
}

// ---- the all-open vacuum after its first layer of meetings ----

// the unequal-point like meetings of a configuration (every vibe open): the slot pairs a term splits on
export function unequalMeetings(
  c: Configuration,
  cells: number,
): [number, number][] {
  const out: [number, number][] = []

  for (let x = 0; x < cells; x++) {
    for (let l = 0; l < 12; l++) {
      const i = x * 24 + LINE_FIRSTS[l]!
      const j = x * 24 + LINE_SECONDS[l]!

      if (
        c.vibe[i] !== 0 &&
        c.vibe[i] === c.vibe[j] &&
        c.point[i] !== c.point[j]
      ) {
        out.push([i, j])
      }
    }
  }

  return out
}

// where the two registers of each met pair sit, by husk column, at the end of each of `beats` beats from the meeting's
// beat `t` on (the meeting's own beat first), read by marking ONE register at a time with the open bit on the keep path
// from `c` (the configuration at the start of beat t), every other open bit 0. The open bit rides with its register
// through the stream, the collision and the store (sopen), and on the keep path nothing reads it but the coin, which
// splits nothing in the vacuum (checked as C0). The point cannot mark: the stream transforms it (tables.move). Returns,
// per beat, per pair, the two columns, or -1 where the mark was not found exactly once.
export function pairColumns(
  tables: LockedTables,
  c: Configuration,
  t: number,
  pairs: readonly [number, number][],
  beats: number,
  column: Int32Array,
): [number, number][][] {
  const out: [number, number][][] = Array.from({ length: beats }, () =>
    pairs.map((): [number, number] => [-1, -1]),
  )

  pairs.forEach((pair, n) => {
    pair.forEach((slot, side) => {
      const marked = cloneConfiguration(c)

      marked.open.fill(0)
      marked.sopen.fill(0)
      marked.open[slot] = 1

      const run = vetoPathRunner(
        'none',
        tables,
        marked,
        THRESHOLD_KEEP,
        t,
        true,
      )

      for (let s = 0; s < beats; s++) {
        run.beat()

        const now = run.state()

        let seen = 0
        let found = -1

        for (let i = 0; i < now.vibe.length; i++) {
          if (now.vibe[i] !== 0 && now.open[i]) {
            seen++
            found = column[(i / 24) | 0]!
          }
        }

        for (let i = 0; i < now.store.length; i++) {
          if (now.store[i] === 0) {
            continue
          }

          const o = now.sopen[i]!

          seen += (o & 1) + (o >> 1)

          if (o !== 0) {
            found = column[(i / 12) | 0]!
          }
        }

        out[s]![n]![side] = seen === 1 ? found : -1
      }
    })
  })

  return out
}
