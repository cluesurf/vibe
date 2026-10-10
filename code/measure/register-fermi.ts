// THE FERMI HALF OF OPEN-CSM-14 ON A THIN LEVEL (item 0031 of moving-matter, decision 001). E-FND-0165 read a Gibbs
// form for three holes on the L = 6 torus, but at a filling of 1.2e-3 a mode Fermi-Dirac and Gibbs agree to O(f). The
// decision: make the level thin, not the holes many. A level of ONE momentum class holds 4 up-band modes, so three
// holes can fill it to 0.75. This module looks for such a level (stage 0). The fixed-N, fixed-P laws a run would be
// read against are not written here: stage 0 found no one-class extreme level (E-FND-0175), so no run is allowed.
//
//   box            the D4 torus with sides L_0..L_3 (each even, so L_i e_i lies in D4 and the box closes), its
//                  prod L_i / 2 Bloch classes q = 2 pi n_i / L_i with n ~ n + (L_0 / 2, .., L_3 / 2) (q ~ q + pi (1, 1,
//                  1, 1) agrees on every D4 point), the representative with n_3 < L_3 / 2, as register-sea's torus(L)
//                  takes it when every side is L, and the class sum and negative
//   levels         the one-hole band level E(q) of register-holes' bandLevels at any list of momenta: holeFrame's own
//                  per-momentum pieces (A1, A2, the up projector) depend on q alone, so they are built for the list
//                  through a stand-in torus that carries the momenta and no sites (the frame's Fourier part, which is
//                  cubic, is not read). Checked against bandLevels on torus(4) to the bit
//   extremes       per box: the bottom and top levels (E to 6 decimals, as every level read so far), their class
//                  counts, the gap to the next level, and the 3-hole sorted store's rows at P = 3 k0
//   storeRows      the multisets {a, b, c} of classes with a + b + c = P, the rows of E-FND-0163's store
//   thinLevelProbe the whole stage 0 over every candidate box, with its three checks
//
// DETERMINISM: no random numbers. FLOATS are measurement on exact pieces, as in register-holes.

import { type CMatrix } from '@/code/measure/dock-mixer'
import { allPerms, bandLevels, holeFrame } from '@/code/measure/register-holes'
import { type Torus } from '@/code/measure/register-sea'

export type Box = {
  sides: number[]
  N: number
  // the integer momenta of each class (in units of 2 pi / L_i), and the momenta themselves
  ints: number[][]
  momenta: number[][]
  // the class of a + b, and of -a
  sum: (a: number, b: number) => number
  neg: Int32Array
}

const mod = (x: number, L: number): number => ((x % L) + L) % L

export function box(sides: readonly number[]): Box {
  if (sides.length !== 4 || sides.some(L => L % 2 !== 0 || L < 2)) {
    throw new Error(`register-fermi: four even sides, got ${sides.join(',')}`)
  }

  const [L0, L1, L2, L3] = sides as [number, number, number, number]
  const h3 = L3 / 2
  const rep = (n: readonly number[]): number[] => {
    const m = n.map((x, i) => mod(x, sides[i]!))

    return m[3]! >= h3 ? m.map((x, i) => mod(x - sides[i]! / 2, sides[i]!)) : m
  }
  const code = (m: readonly number[]): number => ((m[0]! * L1 + m[1]!) * L2 + m[2]!) * h3 + m[3]!
  const ints: number[][] = []

  for (let a = 0; a < L0; a++) {
    for (let b = 0; b < L1; b++) {
      for (let c = 0; c < L2; c++) {
        for (let e = 0; e < h3; e++) {
          ints.push([a, b, c, e])
        }
      }
    }
  }

  // ints are generated in code order, so the class of a representative is its code
  const N = ints.length
  const sum = (a: number, b: number): number => code(rep(ints[a]!.map((x, i) => x + ints[b]![i]!)))
  const neg = Int32Array.from(ints, n => code(rep(n.map(x => -x))))
  const momenta = ints.map(n => n.map((x, i) => (2 * Math.PI * x) / sides[i]!))

  return { sides: [...sides], N, ints, momenta, sum, neg }
}

// the band level E(q) at each momentum of the list, through holeFrame's own pieces (fiber 8, half +)
export function levelsAt(Ps: readonly CMatrix[], momenta: readonly number[][]): Float64Array {
  const stand: Torus = {
    L: 2,
    sites: [[0, 0, 0, 0]],
    index: new Map([['0,0,0,0', 0]]),
    origin: 0,
    move: new Int32Array(576),
    neg: new Int32Array(1),
    V: new Int32Array(1),
    momenta: momenta.map(q => [...q]),
    negMomentum: new Int32Array(momenta.length),
  }
  const fr = holeFrame(stand, Ps, 8)

  return bandLevels({ ...fr, fourier: { ...fr.fourier, N: momenta.length } })
}

// the reduced-fraction key of a class's momentum (n_i / L_i), shared by every box that holds that momentum
export const momentumKey = (b: Box, j: number): string =>
  b.ints[j]!.map((n, i) => {
    const L = b.sides[i]!
    let x = n
    let y = L

    while (y) {
      ;[x, y] = [y, x % y]
    }

    return `${n / x}/${L / x}`
  }).join(',')

// the rows of the 3-hole sorted store at total class P: multisets {a <= b <= c} with a + b + c = P
export function storeRows(b: Box, P: number): number {
  let rows = 0

  for (let a = 0; a < b.N; a++) {
    const rest = b.sum(P, b.neg[a]!)

    for (let c = a; c < b.N; c++) {
      // the middle member is rest - c
      const m = b.sum(rest, b.neg[c]!)

      if (m >= a && m <= c) {
        rows++
      }
    }
  }

  return rows
}

export type Extreme = {
  // the level's E, its classes, and the distance to the next level inward
  E: number
  classes: number[]
  gap: number
}

// the bottom and top levels of a box's band levels E (one per class), levels grouped to 6 decimals
export function extremes(E: ArrayLike<number>): { bottom: Extreme; top: Extreme; levels: number } {
  const keys = [...new Set(Array.from(E, x => x.toFixed(6)))].map(Number).sort((a, b) => a - b)
  const of = (k: number): number[] => {
    const out: number[] = []

    for (let j = 0; j < E.length; j++) {
      if (Number(E[j]!.toFixed(6)) === k) {
        out.push(j)
      }
    }

    return out
  }
  const lo = keys[0]!
  const hi = keys[keys.length - 1]!

  return {
    bottom: { E: lo, classes: of(lo), gap: (keys[1] ?? lo) - lo },
    top: { E: hi, classes: of(hi), gap: hi - (keys[keys.length - 2] ?? hi) },
    levels: keys.length,
  }
}

// bytes of one sorted 3-hole state (fiber 8: 512 complex doubles a row)
export const storeBytes = (rows: number): number => rows * 512 * 16

// ---- stage 0: the probe ----

export type ProbeRow = {
  sides: number[]
  N: number
  levels: number
  bottom: Extreme & { rows: number; bytes: number }
  top: Extreme & { rows: number; bytes: number }
}

export type Probe = {
  // the stand-in frame's levels against bandLevels on the real torus(4), the L = 6 level table, and the largest change
  // of E under the 384 coordinate permutations and sign flips on the L = 6 grid
  standIn: number
  table6: { levels: number[]; counts: number[] }
  symmetry: number
  rows: ProbeRow[]
  // the smallest store under the limit whose bottom or top level is one class, or null
  pick: { sides: number[]; end: 'bottom' | 'top'; bytes: number } | null
}

// the boxes a probe reads: nondecreasing even sides from 6 whose store could be under 1.15 times the limit (the rows
// are about N^2 / 6; every candidate's rows are then counted exactly). Nondecreasing is enough when E is symmetric
// under coordinate permutations (Probe.symmetry)
export function probeBoxes(limit: number, most = 24): number[][] {
  const out: number[][] = []

  for (let a = 6; a <= most; a += 2) {
    for (let b = a; b <= most; b += 2) {
      for (let c = b; c <= most; c += 2) {
        for (let d = c; d <= most; d += 2) {
          const N = (a * b * c * d) / 2

          if (storeBytes((N * N) / 6) <= 1.15 * limit) {
            out.push([a, b, c, d])
          }
        }
      }
    }
  }

  return out
}

// stage 0 of decision 001: the one-hole levels on every candidate box, the extreme levels' class counts and gaps, and
// the 3-hole store at P = 3 k0 (k0 the level's first class)
export function thinLevelProbe(
  Ps: readonly CMatrix[],
  limit: number,
  realLevels4: ArrayLike<number>,
  momenta4: readonly number[][],
  log: (s: string) => void = () => {},
): Probe {
  const mine = levelsAt(Ps, momenta4)
  let standIn = 0

  for (let j = 0; j < mine.length; j++) {
    standIn = Math.max(standIn, Math.abs(mine[j]! - realLevels4[j]!))
  }

  const cache = new Map<string, number>()
  const fill = (b: Box): Float64Array => {
    const want: number[] = []

    for (let j = 0; j < b.N; j++) {
      if (!cache.has(momentumKey(b, j))) {
        want.push(j)
      }
    }

    for (let s = 0; s < want.length; s += 512) {
      const chunk = want.slice(s, s + 512)
      const E = levelsAt(Ps, chunk.map(j => b.momenta[j]!))

      chunk.forEach((j, i) => cache.set(momentumKey(b, j), E[i]!))
    }

    return Float64Array.from({ length: b.N }, (_, j) => cache.get(momentumKey(b, j))!)
  }

  const b6 = box([6, 6, 6, 6])
  const E6 = fill(b6)
  const keys = [...new Set(Array.from(E6, x => x.toFixed(6)))].map(Number).sort((a, b) => a - b)
  const table6 = {
    levels: keys,
    counts: keys.map(k => Array.from(E6).filter(x => Number(x.toFixed(6)) === k).length),
  }
  const index = new Map(b6.ints.map((n, j) => [n.join(','), j]))
  const classOf6 = (n: readonly number[]): number => {
    const m = n.map(x => mod(x, 6))
    const r = m[3]! >= 3 ? m.map(x => (x + 3) % 6) : m

    return index.get(r.join(','))!
  }
  const all = allPerms(4)
  let symmetry = 0

  for (const perm of all) {
    for (let flips = 0; flips < 16; flips++) {
      for (let j = 0; j < b6.N; j++) {
        const n = b6.ints[j]!
        const g = perm.map((p, i) => ((flips >> i) & 1 ? -n[p]! : n[p]!))

        symmetry = Math.max(symmetry, Math.abs(E6[j]! - E6[classOf6(g)]!))
      }
    }
  }

  log(`stand-in ${standIn.toExponential(2)}, L = 6 classes ${table6.counts.join(',')}, symmetry ${symmetry.toExponential(2)} over ${all.length * 16}`)

  const rows: ProbeRow[] = []
  let pick: Probe['pick'] = null

  for (const sides of probeBoxes(limit)) {
    const b = box(sides)
    const x = extremes(fill(b))
    const sized = (end: 'bottom' | 'top', ex: Extreme): Extreme & { rows: number; bytes: number } => {
      const k0 = ex.classes[0]!
      const n = storeRows(b, b.sum(b.sum(k0, k0), k0))
      const bytes = storeBytes(n)

      if (ex.classes.length === 1 && bytes < limit && (!pick || bytes < pick.bytes)) {
        pick = { sides, end, bytes }
      }

      return { ...ex, rows: n, bytes }
    }
    const row: ProbeRow = { sides, N: b.N, levels: x.levels, bottom: sized('bottom', x.bottom), top: sized('top', x.top) }

    rows.push(row)
    log(probeLine(row))
  }

  return { standIn, table6, symmetry, rows, pick }
}

export const probeLine = (r: ProbeRow): string => {
  const end = (name: string, x: ProbeRow['bottom']): string =>
    `${name} E ${x.E.toFixed(6)} ${x.classes.length} classes gap ${x.gap.toFixed(6)} store ${x.rows} rows ${(x.bytes / 1e9).toFixed(2)} GB`

  return `${r.sides.join('x')} N ${r.N}, ${r.levels} levels: ${end('bottom', r.bottom)}; ${end('top', r.top)}`
}
