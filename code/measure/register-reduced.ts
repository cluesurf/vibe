// THE REGISTER PAIR ON THE HUSK QUOTIENT, REDUCED BY THE CUBIC SYMMETRY (the experiment spin/register-coulomb-weak).
// E-SPN-0173 (code/measure/register-coulomb) runs two register members held by the husk light's Coulomb pull in the
// exact coordinates of their moving block, 256 states a relative site, on a husk ball. Its cost grows as the ball's
// volume, and a weak pull (a Bohr radius of tens of docks) needs balls of radius 60 to 120. This file runs the SAME
// cycle on the orbits of a symmetry group instead of on the sites:
//
//   THE GROUP        the 48 signed permutations of the three husk coordinates, the depth coordinate kept (O_h). Each is
//                    an element of W(F4) (checked against spinor-register's f4Group), it maps the D4 roots to roots, the
//                    husk quotient's points to points (a + b + c keeps its parity), and it acts on the register by minors,
//                    which for a signed permutation is itself a signed permutation of the 8 even and of the 8 odd blades
//   THE COORDINATES  a member's S content a_x (even blades) goes to rho_e(g) a at g x, its partner content b_y (odd blades)
//                    to rho_o(g) b at g y: g commutes with the stream (slot d at z steps to z + r_d, and g sends that to
//                    g z + g r_d), with the swap coin, with Q_S (uniform over slots) and with Q_D (gamma(g r)^T rho_o(g)
//                    = rho_e(g) gamma(r)^T, since the minors act on the exterior algebra as automorphisms and gamma(r) is
//                    r ^ + iota_r); so the overlap C(g r) = rho_e C(r) rho_o^T and the whole coordinate cycle commutes
//                    with every element (checked: cubicGroup's covariance count)
//   THE SECTOR       a subgroup G whose elements fix the total momentum K (all 48 at K = 0; the 8 of C4v along an axis;
//                    the 4 of C2v along a face diagonal). The invariant states psi(g y) = rho(g) psi(y) are stored at one
//                    representative per orbit; a neighbour outside the stored set is read as the signed index permutation
//                    rho(g) of its representative's block. Every site-local piece (the mixers, the pair phases, the cross
//                    pieces' own-block update) is the same at a representative as at any image
//   THE INNER        <a | G b> is the sum over representatives of the orbit size times the local product (rho(g) is
//                    orthogonal, so the local product is the same at every image)
//   THE POTENTIAL    the Coulomb count n(y) = floor(alpha G(y) / theta) (register-coulomb) read at the canonical
//                    coordinates (|a| >= |b| >= |c|), so it is exactly the same number on a whole orbit
//   THE DARWIN S     E-SPN-0169's S of the level's density on a side-T husk torus, the density unfolded over its orbits
//                    and the momentum sum taken over the O_h-canonical momenta with their multiplicities
//
// DETERMINISM: no random numbers. FLOATS: measurement on exact pieces. The reduced cycle equals the unreduced one to the
// order of float summation: the sum over the 24 roots at a representative runs in the same order as the unreduced
// engine's at that site, and a neighbour's value is an exact signed permutation of its representative's, so the two
// differ only where the unreduced engine's own images drift apart by rounding (the witness measures it).
//
// SPEED (opt in): reducedEngine(s, u, K, count, form, { backend: 'native', threads: 12 }) runs reducedCycle,
// reducedGram, reducedInner, reducedFilter and autocorrelation on code/kernel (the Rust crate kernel/, built by
// task/kernel/build.ts), byte for byte the JavaScript below at any thread count (task/kernel/check.ts). With no options
// the engine is this file's JavaScript, unchanged.

import { Worker } from 'node:worker_threads'
import { kernel, type KernelOptions } from '@/code/kernel/index'
import {
  fastAutocorrelation,
  fastCycle,
  fastFilter,
  fastGram,
  fastInner,
  fastReduced,
  type FastPair,
} from '@/code/kernel/pair'
import {
  complexEigenvalues,
  complexEigenvector,
} from '@/code/algebra/linear/complex-eigen'
import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import {
  coulombSymbol,
  darwinRatio,
} from '@/code/measure/darwin-exchange'
import {
  greenAt,
  huskPoint,
  type GreenTable,
} from '@/code/measure/husk-meson'
import {
  overlapMatrices,
  blackmanHarris,
  type SparseEight,
} from '@/code/measure/register-meson'
import {
  EVEN,
  ODD,
  evenAction,
  f4Group,
  gammaMatrices,
} from '@/code/measure/spinor-register'
import { fft3 } from '@/code/measure/standin-chemistry'

const REG = 8
const PAIR = 64
const SITE = 256
const ROOTS = DOCK_ROOTS
const NR = ROOTS.length

// every array a worker may read lives on shared memory (a SharedArrayBuffer), so the thread pool below can split a
// convolution's sites across threads without copying; with no pool running these are ordinary typed arrays in use
const sharedF64 = (n: number): Float64Array =>
  new Float64Array(new SharedArrayBuffer(8 * n))
const sharedI32 = (n: number): Int32Array =>
  new Int32Array(new SharedArrayBuffer(4 * n))
const sharedI8 = (n: number): Int8Array =>
  new Int8Array(new SharedArrayBuffer(n))
const sharedI16 = (n: number): Int16Array =>
  new Int16Array(new SharedArrayBuffer(2 * n))

// ---- the cubic group ----

export type CubicElement = {
  // (g q)_i = sign[i] q[perm[i]] for i < 3, the depth coordinate kept
  perm: [number, number, number]
  sign: [number, number, number]
  // the image of slot d
  slots: Int32Array
  // per pair type t (0 A even-even, 1 B even-odd, 2 X odd-even, 3 D odd-odd): psi(g y)[k] = sgn[t][k] psi(y)[src[t][k]]
  src: Int16Array[]
  sgn: Int8Array[]
  inverse: number
}

const dot = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((s, x, k) => s + x * b[k]!, 0)

// the determinant of a minor (rows, cols of equal size 0 to 4)
function minor(
  g: readonly (readonly number[])[],
  rows: readonly number[],
  cols: readonly number[],
): number {
  if (rows.length === 0) {
    return 1
  }

  if (rows.length === 1) {
    return (g[rows[0]!] as number[])[cols[0]!]!
  }

  let s = 0

  cols.forEach((c, k) => {
    s +=
      (k % 2 === 0 ? 1 : -1) *
      (g[rows[0]!] as number[])[c]! *
      minor(
        g,
        rows.slice(1),
        cols.filter((_, j) => j !== k),
      )
  })

  return s
}

// the action on the odd blades by minors (evenAction's odd twin)
export const oddAction = (
  g: readonly (readonly number[])[],
): number[][] =>
  ODD.map(Bp =>
    ODD.map(B => (Bp.length === B.length ? minor(g, Bp, B) : 0)),
  )

// a monomial 8 x 8 matrix [row][col] as (image of each column, its sign); throws if it is not a signed permutation
function monomial(m: readonly (readonly number[])[]): {
  image: number[]
  sign: number[]
} {
  const image: number[] = []
  const sign: number[] = []

  for (let c = 0; c < REG; c++) {
    const rows = [...Array(REG).keys()].filter(
      r => (m[r] as number[])[c]! !== 0,
    )

    if (
      rows.length !== 1 ||
      Math.abs((m[rows[0]!] as number[])[c]!) !== 1
    ) {
      throw new Error(
        'register-reduced: the register action is not a signed permutation',
      )
    }

    image.push(rows[0]!)
    sign.push((m[rows[0]!] as number[])[c]!)
  }

  return { image, sign }
}

export type CubicGroup = {
  elements: CubicElement[]
  covariance: number
  checked: number
}

// the 48 elements, each checked to be in W(F4); covariance counts the (element, root) pairs where C(g r) differs from
// rho_e C(r) rho_o^T (0 when the coordinates are covariant)
export function cubicGroup(): CubicGroup {
  const f4 = new Map(
    f4Group().map(e => [e.matrix.map(r => r.join(',')).join(';'), e]),
  )
  const perms: [number, number, number][] = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ]
  const { dense } = overlapMatrices()
  const elements: CubicElement[] = []

  let covariance = 0
  let checked = 0

  for (const perm of perms) {
    for (let s = 0; s < 8; s++) {
      const sign: [number, number, number] = [
        s & 1 ? -1 : 1,
        s & 2 ? -1 : 1,
        s & 4 ? -1 : 1,
      ]
      const matrix: number[][] = [0, 1, 2, 3].map(i =>
        [0, 1, 2, 3].map(j =>
          i === 3 ? (j === 3 ? 1 : 0) : j === perm[i]! ? sign[i]! : 0,
        ),
      )
      const found = f4.get(matrix.map(r => r.join(',')).join(';'))

      if (!found) {
        throw new Error(
          'register-reduced: a cubic element is not in W(F4)',
        )
      }

      const even = monomial(evenAction(matrix))
      const odd = monomial(oddAction(matrix))
      const src: Int16Array[] = []
      const sgn: Int8Array[] = []

      // column r of rho has its one entry at row image[r] with sign sign[r]: psi'(image[r1], image[r2]) = s1 s2 psi(r1, r2)
      for (let t = 0; t < 4; t++) {
        const m1 = t & 2 ? odd : even
        const m2 = t & 1 ? odd : even
        const sr = new Int16Array(PAIR)
        const sg = new Int8Array(PAIR)

        for (let r1 = 0; r1 < REG; r1++) {
          for (let r2 = 0; r2 < REG; r2++) {
            const to = m1.image[r1]! * 8 + m2.image[r2]!

            sr[to] = r1 * 8 + r2
            sg[to] = m1.sign[r1]! * m2.sign[r2]!
          }
        }

        src.push(sr)
        sgn.push(sg)
      }

      // covariance of the overlap: C(g r)[a'][eta'] = sum rho_e[a'][a] C(r)[a][eta] rho_o[eta'][eta]
      ROOTS.forEach((r, d) => {
        const gd = found.slots[d]!
        const want = dense[gd]!
        const have = dense[d]!

        let bad = false

        for (let a = 0; a < REG; a++) {
          for (let e = 0; e < REG; e++) {
            const x = have[a]![e]!

            if (x === 0) {
              continue
            }

            const a2 = even.image[a]!
            const e2 = odd.image[e]!
            const y = even.sign[a]! * odd.sign[e]! * x

            if (Math.abs(want[a2]![e2]! - y) > 1e-15) {
              bad = true
            }
          }
        }

        // the root map itself
        const image = [0, 1, 2, 3].map(i => dot(matrix[i]!, r))

        if (image.join(',') !== (ROOTS[gd] as number[]).join(',')) {
          bad = true
        }

        checked++

        if (bad) {
          covariance++
        }
      })

      elements.push({
        perm,
        sign,
        slots: found.slots,
        src,
        sgn,
        inverse: -1,
      })
    }
  }

  // inverses
  const apply = (e: CubicElement, q: readonly number[]): number[] =>
    [0, 1, 2].map(i => e.sign[i]! * q[e.perm[i]!]!)
  const probe = [1, 2, 3]

  elements.forEach(e => {
    const img = apply(e, probe)

    e.inverse = elements.findIndex(
      f => apply(f, img).join(',') === probe.join(','),
    )
  })

  return { elements, covariance, checked }
}

export const applyCubic = (
  e: CubicElement,
  a: number,
  b: number,
  c: number,
): [number, number, number] => {
  const q = [a, b, c]

  return [
    e.sign[0] * q[e.perm[0]]!,
    e.sign[1] * q[e.perm[1]]!,
    e.sign[2] * q[e.perm[2]]!,
  ]
}

// the elements of the group that fix a total momentum K (its first three components; the depth component must be 0)
export function littleGroup(
  group: CubicGroup,
  K: readonly number[],
): number[] {
  const out: number[] = []

  group.elements.forEach((e, i) => {
    const g = applyCubic(e, K[0]!, K[1]!, K[2]!)

    if (
      Math.abs(g[0] - K[0]!) < 1e-15 &&
      Math.abs(g[1] - K[1]!) < 1e-15 &&
      Math.abs(g[2] - K[2]!) < 1e-15
    ) {
      out.push(i)
    }
  })

  return out
}

// ---- the sector: representatives, orbits, neighbour tables ----

export type Sector = {
  group: CubicGroup
  members: number[]
  R: number
  // representative coordinates (3 each) and their shell (rounded radius)
  reps: Int32Array
  shell: Int32Array
  orbit: Float64Array
  count: number
  // per representative and root: the neighbour's representative (or -1 outside the ball) and the element g with
  // neighbour = g (representative); plus is y + r_d, minus is y - r_d
  plusRep: Int32Array
  plusG: Int8Array
  minusRep: Int32Array
  minusG: Int8Array
  // every ball point's representative and element (the cube [-R, R]^3, -1 outside the ball), for unfolding
  pointRep: Int32Array
  pointG: Int8Array
  sites: number
}

const cubeIndex = (
  R: number,
  a: number,
  b: number,
  c: number,
): number => a + R + (2 * R + 1) * (b + R + (2 * R + 1) * (c + R))

// the sector of subgroup `members` on the husk ball of radius R (a^2 + b^2 + c^2 <= R^2)
export function sector(
  group: CubicGroup,
  members: readonly number[],
  R: number,
): Sector {
  const side = 2 * R + 1
  const pointRep = new Int32Array(side * side * side).fill(-1)
  const pointG = new Int8Array(side * side * side).fill(-1)
  const R2 = R * R
  const reps: number[] = []
  const repIndex = new Map<number, number>()
  const orbitCount: number[] = []
  const els = members.map(i => group.elements[i]!)
  const key = (q: readonly number[]): number =>
    cubeIndex(R, q[0]!, q[1]!, q[2]!)

  let sites = 0

  for (let c = -R; c <= R; c++) {
    for (let b = -R; b <= R; b++) {
      for (let a = -R; a <= R; a++) {
        if (a * a + b * b + c * c > R2) {
          continue
        }

        sites++

        // the representative: the image h q with the least cube index; then q = h^-1 (rep)
        let best = Infinity
        let bestH = -1

        els.forEach((h, j) => {
          const k = key(applyCubic(h, a, b, c))

          if (k < best) {
            best = k
            bestH = j
          }
        })

        let r = repIndex.get(best)

        if (r === undefined) {
          r = reps.length / 3
          repIndex.set(best, r)

          const hq = applyCubic(els[bestH]!, a, b, c)

          reps.push(hq[0], hq[1], hq[2])
          orbitCount.push(0)
        }

        orbitCount[r]!++

        // the element g in `members` with g (rep) = q: the inverse of h, as an index into members
        const inv = els[bestH]!.inverse
        const gIndex = members.indexOf(inv)

        if (gIndex < 0) {
          throw new Error(
            'register-reduced: the subgroup is not closed under inverses',
          )
        }

        pointRep[key([a, b, c])] = r
        pointG[key([a, b, c])] = gIndex
      }
    }
  }

  const count = reps.length / 3
  const plusRep = sharedI32(count * NR)
  const plusG = sharedI8(count * NR)
  const minusRep = sharedI32(count * NR)
  const minusG = sharedI8(count * NR)
  const shell = new Int32Array(count)

  for (let i = 0; i < count; i++) {
    const a = reps[3 * i]!
    const b = reps[3 * i + 1]!
    const c = reps[3 * i + 2]!

    shell[i] = Math.round(Math.hypot(a, b, c))

    for (let d = 0; d < NR; d++) {
      const r = ROOTS[d] as number[]

      for (const [s, repOut, gOut] of [
        [1, plusRep, plusG],
        [-1, minusRep, minusG],
      ] as const) {
        const q = [a + s * r[0]!, b + s * r[1]!, c + s * r[2]!]

        if (q[0]! ** 2 + q[1]! ** 2 + q[2]! ** 2 > R2) {
          repOut[i * NR + d] = -1
          gOut[i * NR + d] = -1
        } else {
          repOut[i * NR + d] = pointRep[key(q)]!
          gOut[i * NR + d] = pointG[key(q)]!
        }
      }
    }
  }

  const orbit = Float64Array.from(orbitCount)

  return {
    group,
    members: [...members],
    R,
    reps: Int32Array.from(reps),
    shell,
    orbit,
    count,
    plusRep,
    plusG,
    minusRep,
    minusG,
    pointRep,
    pointG,
    sites,
  }
}

// the element of the sector's group by its index in members
const elementOf = (s: Sector, g: number): CubicElement =>
  s.group.elements[s.members[g]!]!

// ---- the Coulomb count at canonical coordinates ----

// the canonical coordinates of a husk offset: |a| >= |b| >= |c| >= 0 (one point per O_h orbit)
export const canonical = (
  a: number,
  b: number,
  c: number,
): [number, number, number] => {
  const v = [Math.abs(a), Math.abs(b), Math.abs(c)].sort(
    (x, y) => y - x,
  )

  return [v[0]!, v[1]!, v[2]!]
}

// G(y) = G(0) - D(y) read at the canonical coordinates, so every orbit carries one value
export const canonicalGreen = (
  table: GreenTable,
  a: number,
  b: number,
  c: number,
): number => {
  const [x, y, z] = canonical(a, b, c)

  return table.g0 - greenAt(table, x, y, z)
}

export type ReducedCount = {
  counts: Int32Array
  nearest: number
  top: number
  alpha: number
  theta: number
}

export function reducedCounts(
  s: Sector,
  table: GreenTable,
  alpha: number,
  theta: number,
): ReducedCount {
  const counts = new Int32Array(s.count)

  let nearest = Infinity
  let top = 0

  for (let i = 0; i < s.count; i++) {
    const x =
      (alpha *
        canonicalGreen(
          table,
          s.reps[3 * i]!,
          s.reps[3 * i + 1]!,
          s.reps[3 * i + 2]!,
        )) /
      theta
    const n = Math.floor(x)

    counts[i] = n
    top = Math.max(top, n)
    nearest = Math.min(nearest, x - n, n + 1 - x)
  }

  return { counts, nearest, top, alpha, theta }
}

// ---- the reduced engine ----

export type RState = { re: Float64Array; im: Float64Array }
export type Form = 'scalar' | 'vector'

export type ReducedEngine = {
  s: Sector
  u: readonly [number, number]
  K: readonly number[]
  form: Form
  halfRe: Float64Array
  halfIm: Float64Array
  beta1: Float64Array
  beta2: Float64Array
  cross: Float64Array
  C: SparseEight[]
  CT: SparseEight[]
  t: Float64Array[]
  tmpRe: Float64Array
  tmpIm: Float64Array
  // the engine's tables flattened on shared memory for the thread pool: the members' index maps (member, type, 64),
  // the sparse overlaps per root (offsets into row / col / val), C then C^dag
  id: number
  flat: {
    src: Int16Array
    sgn: Int8Array
    off: Int32Array
    row: Int8Array
    col: Int8Array
    val: Float64Array
    offT: Int32Array
    rowT: Int8Array
    colT: Int8Array
    valT: Float64Array
    halfRe: Float64Array
    halfIm: Float64Array
  }
  // present only when a kernel backend was asked for: the cycle, Gram, inner, filter and autocorrelation then run on it
  fast?: FastPair
}

let engineCounter = 0

// the engine's tables on shared memory (what a worker needs besides the sector's neighbour tables)
function flatten(
  s: Sector,
  C: SparseEight[],
  CT: SparseEight[],
  halfRe: Float64Array,
  halfIm: Float64Array,
): ReducedEngine['flat'] {
  const M = s.members.length
  const src = sharedI16(M * 4 * PAIR)
  const sgn = sharedI8(M * 4 * PAIR)

  s.members.forEach((gi, g) => {
    const el = s.group.elements[gi]!

    for (let t = 0; t < 4; t++) {
      src.set(el.src[t]!, (g * 4 + t) * PAIR)
      sgn.set(el.sgn[t]!, (g * 4 + t) * PAIR)
    }
  })

  const pack = (
    mats: SparseEight[],
  ): {
    off: Int32Array
    row: Int8Array
    col: Int8Array
    val: Float64Array
  } => {
    const off = sharedI32(NR + 1)

    let n = 0

    mats.forEach((m, d) => {
      off[d] = n
      n += m.val.length
    })
    off[NR] = n

    const row = sharedI8(n)
    const col = sharedI8(n)
    const val = sharedF64(n)

    mats.forEach((m, d) => {
      row.set(m.row, off[d])
      col.set(m.col, off[d])
      val.set(m.val, off[d])
    })

    return { off, row, col, val }
  }

  const a = pack(C)
  const b = pack(CT)
  const hr = sharedF64(NR)
  const hi = sharedF64(NR)

  hr.set(halfRe)
  hi.set(halfIm)

  return {
    src,
    sgn,
    off: a.off,
    row: a.row,
    col: a.col,
    val: a.val,
    offT: b.off,
    rowT: b.row,
    colT: b.col,
    valT: b.val,
    halfRe: hr,
    halfIm: hi,
  }
}

// ---- the thread pool ----
//
// A convolution's output at a representative depends only on the source, so the representatives are split into equal
// ranges, one a worker, each computed exactly as the single-threaded loop does (the same order of every sum): the pooled
// result is bit for bit the single-threaded one. The worker's kernel is the conv loop below, restated in plain
// JavaScript (it runs as an eval'd worker with no imports).

const KERNEL = `
const { parentPort } = require('node:worker_threads')
const engines = new Map()
parentPort.on('message', m => {
  if (m.kind === 'engine') { engines.set(m.id, m); return }
  const e = engines.get(m.id)
  const PAIR = 64, NR = 24
  const repT = m.usePlus ? e.plusRep : e.minusRep
  const gT = m.usePlus ? e.plusG : e.minusG
  const off = m.dagger ? e.offT : e.off, row = m.dagger ? e.rowT : e.row, col = m.dagger ? e.colT : e.col, val = m.dagger ? e.valT : e.val
  const sg = m.dagger ? -1 : 1
  const srcRe = m.srcRe, srcIm = m.srcIm, outRe = m.outRe, outIm = m.outIm
  const tr = new Float64Array(PAIR), ti = new Float64Array(PAIR)
  outRe.fill(0, m.start * PAIR, m.end * PAIR)
  outIm.fill(0, m.start * PAIR, m.end * PAIR)
  for (let i = m.start; i < m.end; i++) {
    const oo = i * PAIR
    for (let d = 0; d < NR; d++) {
      const j = repT[i * NR + d]
      if (j < 0) continue
      const base = (gT[i * NR + d] * 4 + m.t) * PAIR
      const so = j * m.srcStride + m.srcOff
      for (let k = 0; k < PAIR; k++) {
        const f = e.sgn[base + k]
        const at = so + e.src[base + k]
        tr[k] = f * srcRe[at]
        ti[k] = f * srcIm[at]
      }
      const pr = e.halfRe[d]
      const pi = sg * e.halfIm[d]
      for (let q = off[d]; q < off[d + 1]; q++) {
        const r = row[q], c = col[q], v = val[q]
        const wr = v * pr, wi = v * pi
        if (m.member === 1) {
          const ob = oo + r * 8, sb = c * 8
          for (let r2 = 0; r2 < 8; r2++) {
            const xr = tr[sb + r2], xi = ti[sb + r2]
            outRe[ob + r2] += wr * xr - wi * xi
            outIm[ob + r2] += wr * xi + wi * xr
          }
        } else {
          for (let r1 = 0; r1 < 8; r1++) {
            const xr = tr[r1 * 8 + c], xi = ti[r1 * 8 + c]
            outRe[oo + r1 * 8 + r] += wr * xr - wi * xi
            outIm[oo + r1 * 8 + r] += wr * xi + wi * xr
          }
        }
      }
    }
  }
  Atomics.sub(m.sync, 0, 1)
  Atomics.notify(m.sync, 0)
})
`

type Pool = {
  workers: Worker[]
  known: Set<number>[]
  sync: Int32Array
  threshold: number
}

let pool: Pool | null = null

// start n workers (the process keeps running only while the main thread has work: the workers are unref'd); a
// convolution over fewer than `threshold` representatives stays on the main thread
export function startPool(n: number, threshold = 2000): void {
  const workers = Array.from({ length: n }, () => {
    const w = new Worker(KERNEL, { eval: true })

    w.unref()

    return w
  })

  pool = {
    workers,
    known: workers.map(() => new Set<number>()),
    sync: sharedI32(1),
    threshold,
  }
}

export function stopPool(): void {
  if (!pool) {
    return
  }

  for (const w of pool.workers) {
    void w.terminate()
  }

  pool = null
}

export const poolSize = (): number => (pool ? pool.workers.length : 0)

function pooledConv(
  e: ReducedEngine,
  srcRe: Float64Array,
  srcIm: Float64Array,
  srcOff: number,
  srcStride: number,
  t: number,
  outRe: Float64Array,
  outIm: Float64Array,
  member: 1 | 2,
  dagger: boolean,
  usePlus: boolean,
): void {
  const p = pool!
  const s = e.s
  const n = p.workers.length
  const N = s.count

  Atomics.store(p.sync, 0, n)
  p.workers.forEach((w, k) => {
    if (!p.known[k]!.has(e.id)) {
      w.postMessage({
        kind: 'engine',
        id: e.id,
        plusRep: s.plusRep,
        minusRep: s.minusRep,
        plusG: s.plusG,
        minusG: s.minusG,
        ...e.flat,
      })
      p.known[k]!.add(e.id)
    }

    w.postMessage({
      kind: 'conv',
      id: e.id,
      srcRe,
      srcIm,
      srcOff,
      srcStride,
      t,
      outRe,
      outIm,
      member,
      dagger,
      usePlus,
      start: Math.floor((k * N) / n),
      end: Math.floor(((k + 1) * N) / n),
      sync: p.sync,
    })
  })

  for (;;) {
    const left = Atomics.load(p.sync, 0)

    if (left === 0) {
      break
    }

    Atomics.wait(p.sync, 0, left)
  }
}

function betaOf(wr: number, wi: number, phi: number): [number, number] {
  const w2r = wr * wr - wi * wi
  const w2i = 2 * wr * wi
  const c = Math.cos(phi)
  const s = Math.sin(phi)

  return [w2r * c - w2i * s - 2 * wr + 1, w2r * s + w2i * c - 2 * wi]
}

// the engine with pair phase phi = -theta n per representative (register-coulomb's coulombEngine, reduced)
export function reducedEngine(
  s: Sector,
  u: readonly [number, number],
  K: readonly number[],
  count: ReducedCount,
  form: Form = 'vector',
  options?: KernelOptions,
): ReducedEngine {
  const { sparse, sparseT } = overlapMatrices()
  const halfRe = new Float64Array(NR)
  const halfIm = new Float64Array(NR)
  const N = s.count
  const beta1 = new Float64Array(2 * N)
  const beta2 = new Float64Array(2 * N)
  const cross = new Float64Array(2 * N)
  const [ur, ui] = u

  ROOTS.forEach((r, d) => {
    const ph = -dot(K, r) / 2

    halfRe[d] = Math.cos(ph)
    halfIm[d] = Math.sin(ph)
  })

  for (let i = 0; i < N; i++) {
    const ph = -count.theta * count.counts[i]!
    const b1 = betaOf(ur, ui, ph)
    const b2 = betaOf(ur, -ui, form === 'scalar' ? -ph : ph)

    beta1[2 * i] = b1[0]
    beta1[2 * i + 1] = b1[1]
    beta2[2 * i] = b2[0]
    beta2[2 * i + 1] = b2[1]
    cross[2 * i] = Math.cos(ph) - 1
    cross[2 * i + 1] = Math.sin(ph)
  }

  const e: ReducedEngine = {
    s,
    u,
    K,
    form,
    halfRe,
    halfIm,
    beta1,
    beta2,
    cross,
    C: sparse,
    CT: sparseT,
    t: Array.from({ length: 12 }, () => sharedF64(N * PAIR)),
    tmpRe: new Float64Array(PAIR),
    tmpIm: new Float64Array(PAIR),
    id: engineCounter++,
    flat: flatten(s, sparse, sparseT, halfRe, halfIm),
  }

  if (options?.backend) {
    e.fast = fastReduced(e, kernel(options.backend, options.threads ?? 1))
  }

  return e
}

export const newState = (s: Sector): RState => ({
  re: sharedF64(s.count * SITE),
  im: sharedF64(s.count * SITE),
})

export const cloneState = (x: RState): RState => {
  const re = sharedF64(x.re.length)
  const im = sharedF64(x.im.length)

  re.set(x.re)
  im.set(x.im)

  return { re, im }
}

// out = conv of a source block (type t) on member m with C (dagger false) or C^dag, the neighbour read through rho(g)
function conv(
  e: ReducedEngine,
  srcRe: Float64Array,
  srcIm: Float64Array,
  srcOff: number,
  srcStride: number,
  t: number,
  outRe: Float64Array,
  outIm: Float64Array,
  member: 1 | 2,
  dagger: boolean,
): void {
  const s = e.s
  const N = s.count
  const usePlus = !((member === 1) !== dagger)

  if (
    pool &&
    N >= pool.threshold &&
    srcRe.buffer instanceof SharedArrayBuffer &&
    outRe.buffer instanceof SharedArrayBuffer
  ) {
    pooledConv(
      e,
      srcRe,
      srcIm,
      srcOff,
      srcStride,
      t,
      outRe,
      outIm,
      member,
      dagger,
      usePlus,
    )

    return
  }

  const repT = usePlus ? s.plusRep : s.minusRep
  const gT = usePlus ? s.plusG : s.minusG
  const mats = dagger ? e.CT : e.C
  const sg = dagger ? -1 : 1
  const tr = e.tmpRe
  const ti = e.tmpIm

  outRe.fill(0)
  outIm.fill(0)

  for (let i = 0; i < N; i++) {
    const oo = i * PAIR

    for (let d = 0; d < NR; d++) {
      const j = repT[i * NR + d]!

      if (j < 0) {
        continue
      }

      const el = elementOf(s, gT[i * NR + d]!)
      const src = el.src[t]!
      const sgn = el.sgn[t]!
      const so = j * srcStride + srcOff

      for (let k = 0; k < PAIR; k++) {
        const f = sgn[k]!
        const at = so + src[k]!

        tr[k] = f * srcRe[at]!
        ti[k] = f * srcIm[at]!
      }

      const pr = e.halfRe[d]!
      const pi = sg * e.halfIm[d]!
      const m = mats[d]!
      const L = m.val.length

      for (let q = 0; q < L; q++) {
        const row = m.row[q]!
        const col = m.col[q]!
        const v = m.val[q]!
        const wr = v * pr
        const wi = v * pi

        if (member === 1) {
          const ob = oo + row * 8
          const sb = col * 8

          for (let r2 = 0; r2 < 8; r2++) {
            const xr = tr[sb + r2]!
            const xi = ti[sb + r2]!

            outRe[ob + r2]! += wr * xr - wi * xi
            outIm[ob + r2]! += wr * xi + wi * xr
          }
        } else {
          for (let r1 = 0; r1 < 8; r1++) {
            const xr = tr[r1 * 8 + col]!
            const xi = ti[r1 * 8 + col]!

            outRe[oo + r1 * 8 + row]! += wr * xr - wi * xi
            outIm[oo + r1 * 8 + row]! += wr * xi + wi * xr
          }
        }
      }
    }
  }
}

const A = 0
const B = 64
const X = 128
const D = 192

// ONE CYCLE, the two beats (register-meson's pairCycle, reduced), in place
function beats(e: ReducedEngine, st: RState): void {
  const N = e.s.count
  const [ur, ui] = e.u
  const [t1r, t1i, t2r, t2i, er, ei, , , fr, fi, gr, gi] = e.t as [
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
  ]

  {
    const alr = ur - 1
    const ali = ui

    conv(e, st.re, st.im, X, SITE, 2, t1r, t1i, 1, false)
    conv(e, st.re, st.im, B, SITE, 1, t2r, t2i, 2, false)
    conv(e, st.re, st.im, D, SITE, 3, er, ei, 2, false)
    conv(e, er, ei, 0, PAIR, 2, fr, fi, 1, false)
    conv(e, st.re, st.im, D, SITE, 3, gr, gi, 1, false)

    for (let i = 0; i < N; i++) {
      const b1r = e.beta1[2 * i]!
      const b1i = e.beta1[2 * i + 1]!

      for (let k = 0; k < PAIR; k++) {
        const c = i * PAIR + k
        const Ai = i * SITE + A + k
        const Bi = i * SITE + B + k
        const Xi = i * SITE + X + k
        const aR = st.re[Ai]!
        const aI = st.im[Ai]!
        const p1r = aR + t1r[c]!
        const p1i = aI + t1i[c]!
        const p2r = aR + t2r[c]!
        const p2i = aI + t2i[c]!
        const psr = p1r + t2r[c]! + fr[c]!
        const psi = p1i + t2i[c]! + fi[c]!

        st.re[Ai] =
          aR +
          alr * (p1r + p2r) -
          ali * (p1i + p2i) +
          b1r * psr -
          b1i * psi

        st.im[Ai] =
          aI +
          alr * (p1i + p2i) +
          ali * (p1r + p2r) +
          b1r * psi +
          b1i * psr

        const bR = st.re[Bi]!
        const bI = st.im[Bi]!
        const qbr = bR + gr[c]!
        const qbi = bI + gi[c]!

        st.re[Bi] = bR + alr * qbr - ali * qbi
        st.im[Bi] = bI + alr * qbi + ali * qbr

        const xR = st.re[Xi]!
        const xI = st.im[Xi]!
        const qxr = xR + er[c]!
        const qxi = xI + ei[c]!

        st.re[Xi] = xR + alr * qxr - ali * qxi
        st.im[Xi] = xI + alr * qxi + ali * qxr
      }
    }
  }

  {
    const alr = ur - 1
    const ali = -ui

    conv(e, st.re, st.im, B, SITE, 1, t1r, t1i, 1, true)
    conv(e, st.re, st.im, X, SITE, 2, t2r, t2i, 2, true)
    conv(e, st.re, st.im, A, SITE, 0, er, ei, 2, true)
    conv(e, er, ei, 0, PAIR, 1, fr, fi, 1, true)
    conv(e, st.re, st.im, A, SITE, 0, gr, gi, 1, true)

    for (let i = 0; i < N; i++) {
      const b2r = e.beta2[2 * i]!
      const b2i = e.beta2[2 * i + 1]!

      for (let k = 0; k < PAIR; k++) {
        const c = i * PAIR + k
        const Di = i * SITE + D + k
        const Bi = i * SITE + B + k
        const Xi = i * SITE + X + k
        const dR = st.re[Di]!
        const dI = st.im[Di]!
        const p1r = dR + t1r[c]!
        const p1i = dI + t1i[c]!
        const p2r = dR + t2r[c]!
        const p2i = dI + t2i[c]!
        const pdr = p1r + t2r[c]! + fr[c]!
        const pdi = p1i + t2i[c]! + fi[c]!

        st.re[Di] =
          dR +
          alr * (p1r + p2r) -
          ali * (p1i + p2i) +
          b2r * pdr -
          b2i * pdi

        st.im[Di] =
          dI +
          alr * (p1i + p2i) +
          ali * (p1r + p2r) +
          b2r * pdi +
          b2i * pdr

        const bR = st.re[Bi]!
        const bI = st.im[Bi]!
        const qbr = bR + er[c]!
        const qbi = bI + ei[c]!

        st.re[Bi] = bR + alr * qbr - ali * qbi
        st.im[Bi] = bI + alr * qbi + ali * qbr

        const xR = st.re[Xi]!
        const xI = st.im[Xi]!
        const qxr = xR + gr[c]!
        const qxi = xI + gi[c]!

        st.re[Xi] = xR + alr * qxr - ali * qxi
        st.im[Xi] = xI + alr * qxi + ali * qxr
      }
    }
  }
}

// the projected field of a cross piece (register-coulomb's crossProjection, reduced)
function crossProjection(
  e: ReducedEngine,
  st: RState,
  kind: 'SD' | 'DS',
): { re: Float64Array; im: Float64Array } {
  const N = e.s.count
  const [t1r, t1i, t2r, t2i, t3r, t3i, t4r, t4i] = e.t as [
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
  ]
  const outRe = new Float64Array(N * PAIR)
  const outIm = new Float64Array(N * PAIR)
  const own = kind === 'SD' ? B : X

  if (kind === 'SD') {
    conv(e, st.re, st.im, D, SITE, 3, t1r, t1i, 1, false)
    conv(e, st.re, st.im, A, SITE, 0, t2r, t2i, 2, true)
    conv(e, st.re, st.im, X, SITE, 2, t3r, t3i, 1, false)
    conv(e, t3r, t3i, 0, PAIR, 0, t4r, t4i, 2, true)
  } else {
    conv(e, st.re, st.im, A, SITE, 0, t1r, t1i, 1, true)
    conv(e, st.re, st.im, D, SITE, 3, t2r, t2i, 2, false)
    conv(e, st.re, st.im, B, SITE, 1, t3r, t3i, 1, true)
    conv(e, t3r, t3i, 0, PAIR, 3, t4r, t4i, 2, false)
  }

  for (let i = 0; i < N; i++) {
    for (let k = 0; k < PAIR; k++) {
      const c = i * PAIR + k

      outRe[c] =
        st.re[i * SITE + own + k]! + t1r[c]! + t2r[c]! + t4r[c]!

      outIm[c] =
        st.im[i * SITE + own + k]! + t1i[c]! + t2i[c]! + t4i[c]!
    }
  }

  return { re: outRe, im: outIm }
}

function crossPiece(
  e: ReducedEngine,
  st: RState,
  kind: 'SD' | 'DS',
): void {
  const N = e.s.count
  const p = crossProjection(e, st, kind)
  const own = kind === 'SD' ? B : X

  for (let i = 0; i < N; i++) {
    const cr = e.cross[2 * i]!
    const ci = e.cross[2 * i + 1]!

    if (cr === 0 && ci === 0) {
      continue
    }

    for (let k = 0; k < PAIR; k++) {
      const c = i * PAIR + k
      const xr = p.re[c]!
      const xi = p.im[c]!

      st.re[i * SITE + own + k]! += cr * xr - ci * xi
      st.im[i * SITE + own + k]! += cr * xi + ci * xr
    }
  }
}

// one Coulomb cycle: the two beats, then (vector form) P_SD and P_DS
export function reducedCycle(e: ReducedEngine, st: RState): void {
  if (e.fast) {
    fastCycle(e.fast, st)

    return
  }

  beats(e, st)

  if (e.form === 'vector') {
    crossPiece(e, st, 'SD')
    crossPiece(e, st, 'DS')
  }
}

// G st: member 1 then member 2, (a, b) -> (a + C b, b + C^dag a)
export function reducedGram(e: ReducedEngine, st: RState): RState {
  if (e.fast) {
    return fastGram(e.fast, st)
  }

  const N = e.s.count
  const [xr, xi, yr, yi] = e.t as [
    Float64Array,
    Float64Array,
    Float64Array,
    Float64Array,
  ]

  const add = (
    out: RState,
    off: number,
    fr: Float64Array,
    fi: Float64Array,
  ): void => {
    for (let i = 0; i < N; i++) {
      for (let k = 0; k < PAIR; k++) {
        out.re[i * SITE + off + k]! += fr[i * PAIR + k]!
        out.im[i * SITE + off + k]! += fi[i * PAIR + k]!
      }
    }
  }

  const g1 = cloneState(st)

  conv(e, st.re, st.im, X, SITE, 2, xr, xi, 1, false)
  add(g1, A, xr, xi)
  conv(e, st.re, st.im, D, SITE, 3, xr, xi, 1, false)
  add(g1, B, xr, xi)
  conv(e, st.re, st.im, A, SITE, 0, xr, xi, 1, true)
  add(g1, X, xr, xi)
  conv(e, st.re, st.im, B, SITE, 1, xr, xi, 1, true)
  add(g1, D, xr, xi)

  const g2 = cloneState(g1)

  conv(e, g1.re, g1.im, B, SITE, 1, yr, yi, 2, false)
  add(g2, A, yr, yi)
  conv(e, g1.re, g1.im, D, SITE, 3, yr, yi, 2, false)
  add(g2, X, yr, yi)
  conv(e, g1.re, g1.im, A, SITE, 0, yr, yi, 2, true)
  add(g2, B, yr, yi)
  conv(e, g1.re, g1.im, X, SITE, 2, yr, yi, 2, true)
  add(g2, D, yr, yi)

  return g2
}

// <a | G b>, the orbit-weighted sum
export function reducedInner(
  e: ReducedEngine,
  a: RState,
  b: RState,
): [number, number] {
  if (e.fast) {
    return fastInner(e.fast, a, b)
  }

  const gb = reducedGram(e, b)

  let re = 0
  let im = 0

  for (let i = 0; i < e.s.count; i++) {
    const w = e.s.orbit[i]!

    let sr = 0
    let si = 0

    for (let k = i * SITE; k < (i + 1) * SITE; k++) {
      const xr = a.re[k]!
      const xi = a.im[k]!
      const yr = gb.re[k]!
      const yi = gb.im[k]!

      sr += xr * yr + xi * yi
      si += xr * yi - xi * yr
    }

    re += w * sr
    im += w * si
  }

  return [re, im]
}

export const reducedNorm2 = (e: ReducedEngine, st: RState): number =>
  reducedInner(e, st, st)[0]

export function axpyState(
  y: RState,
  x: RState,
  fr: number,
  fi: number,
): void {
  for (let i = 0; i < y.re.length; i++) {
    const r = x.re[i]!
    const m = x.im[i]!

    y.re[i]! += fr * r - fi * m
    y.im[i]! += fr * m + fi * r
  }
}

export function scaleState(st: RState, f: number): void {
  for (let i = 0; i < st.re.length; i++) {
    st.re[i]! *= f
    st.im[i]! *= f
  }
}

export function normalizeState(e: ReducedEngine, st: RState): void {
  scaleState(st, 1 / Math.sqrt(reducedNorm2(e, st)))
}

// the filter v = sum_s w(s) e^(-i phase s) U^s psi (Blackman-Harris over S cycles)
export function reducedFilter(
  e: ReducedEngine,
  psi: RState,
  phase: number,
  S: number,
): RState {
  if (e.fast) {
    return fastFilter(e.fast, psi, phase, S)
  }

  const out = newState(e.s)
  const st = cloneState(psi)

  for (let k = 0; k < S; k++) {
    const w = blackmanHarris(k, S)

    axpyState(
      out,
      st,
      w * Math.cos(-phase * k),
      w * Math.sin(-phase * k),
    )
    reducedCycle(e, st)
  }

  return out
}

export function reducedRead(
  e: ReducedEngine,
  v: RState,
): { lambda: [number, number]; phase: number; residual: number } {
  const n = reducedNorm2(e, v)
  const Uv = cloneState(v)

  reducedCycle(e, Uv)

  const [lr, li] = reducedInner(e, v, Uv).map(x => x / n) as [
    number,
    number,
  ]
  const r = cloneState(Uv)

  axpyState(r, v, -lr, -li)

  return {
    lambda: [lr, li],
    phase: Math.atan2(li, lr),
    residual: Math.sqrt(reducedNorm2(e, r) / n),
  }
}

// ---- the lines of a state: harmonic inversion of its autocorrelation ----
//
// The filtered level is not one eigenvector: the phase reducedRead gives is the weighted mean of every line left in it,
// and when a line of the same sector sits closer than the filter resolves, the mean moves with K through the weights as
// well as through the lines (the drift E-SPN-0175's probe 6 measured). The lines themselves come from the autocorrelation
// c_l = <v | G U^l v>, l = 0 .. N, one inner product a cycle and no stored vectors: U is unitary in the Gram metric, so
// <U^n v | G U^m v> = c_(m - n), with c_(-l) the conjugate of c_l. On the filter basis Phi_j = sum_(n = 0 .. N - 1)
// e^(-i phi_j n) U^n v at L phases phi_j across a window, the matrices S_p = <Phi_j | G U^p Phi_k> (p = 0, 1) are sums of
// the c's, and S_1 b = u S_0 b gives every line u = e^(i E) inside the window (filter diagonalization, Wall and Neuhauser
// 1995), exactly when v holds no more lines there than the basis has phases. Each line's weight in v is |<psi | G v>|^2 /
// c_0, psi its normalized eigenvector.

export type Line = { E: number; modulus: number; weight: number }

export function autocorrelation(
  e: ReducedEngine,
  v: RState,
  N: number,
): { re: Float64Array; im: Float64Array } {
  if (e.fast) {
    return fastAutocorrelation(e.fast, v, N)
  }

  const re = new Float64Array(N + 1)
  const im = new Float64Array(N + 1)
  const st = cloneState(v)

  for (let l = 0; l <= N; l++) {
    const [r, i] = reducedInner(e, v, st)

    re[l] = r
    im[l] = i

    if (l < N) {
      reducedCycle(e, st)
    }
  }

  return { re, im }
}

export function harmonicLines(
  c: { re: Float64Array; im: Float64Array },
  center: number,
  L: number,
  spacing: number,
  keep = 1e-11,
): Line[] {
  const N = c.re.length - 1
  const M = N - 1
  const phi = Array.from(
    { length: L },
    (_, j) => center + (j - (L - 1) / 2) * spacing,
  )
  const lag = (t: number): [number, number] =>
    t >= 0 ? [c.re[t]!, c.im[t]!] : [c.re[-t]!, -c.im[-t]!]
  const S0 = makeComplexMatrix({ rows: L, cols: L })
  const S1 = makeComplexMatrix({ rows: L, cols: L })

  for (let j = 0; j < L; j++) {
    for (let k = 0; k < L; k++) {
      const d = phi[j]! - phi[k]!

      let a0r = 0
      let a0i = 0
      let a1r = 0
      let a1i = 0

      for (let l = -M; l <= M; l++) {
        const lo = Math.max(0, -l)
        const hi = Math.min(M, M - l)

        // sum over n = lo .. hi of e^(i d n)
        let gr: number
        let gi: number

        if (Math.abs(d) < 1e-14) {
          gr = hi - lo + 1
          gi = 0
        } else {
          const nr = Math.cos(d * lo) - Math.cos(d * (hi + 1))
          const ni = Math.sin(d * lo) - Math.sin(d * (hi + 1))
          const dr = 1 - Math.cos(d)
          const di = -Math.sin(d)
          const den = dr * dr + di * di

          gr = (nr * dr + ni * di) / den
          gi = (ni * dr - nr * di) / den
        }

        // times e^(-i phi_k l)
        const ph = -phi[k]! * l
        const tr = gr * Math.cos(ph) - gi * Math.sin(ph)
        const ti = gr * Math.sin(ph) + gi * Math.cos(ph)
        const [c0r, c0i] = lag(l)
        const [c1r, c1i] = lag(l + 1)

        a0r += tr * c0r - ti * c0i
        a0i += tr * c0i + ti * c0r
        a1r += tr * c1r - ti * c1i
        a1i += tr * c1i + ti * c1r
      }

      S0.re[j * L + k] = a0r
      S0.im[j * L + k] = a0i
      S1.re[j * L + k] = a1r
      S1.im[j * L + k] = a1i
    }
  }

  // S_0 is Hermitian and positive: whiten on its well-conditioned range
  const eig = eigHermitian({ matrix: S0 })
  const top = Math.max(...eig.values)
  const kept = [...eig.values.keys()].filter(
    i => eig.values[i]! > keep * top,
  )
  const r = kept.length
  const Qr = new Float64Array(L * r)
  const Qi = new Float64Array(L * r)

  kept.forEach((i, col) => {
    const s = 1 / Math.sqrt(eig.values[i]!)

    for (let a = 0; a < L; a++) {
      Qr[a * r + col] = eig.vectorsRe[a * L + i]! * s
      Qi[a * r + col] = eig.vectorsIm[a * L + i]! * s
    }
  })

  // A = Q^dagger S_1 Q
  const Tr = new Float64Array(L * r)
  const Ti = new Float64Array(L * r)

  for (let j = 0; j < L; j++) {
    for (let s = 0; s < r; s++) {
      let xr = 0
      let xi = 0

      for (let k = 0; k < L; k++) {
        const pr = S1.re[j * L + k]!
        const pi = S1.im[j * L + k]!
        const qr = Qr[k * r + s]!
        const qi = Qi[k * r + s]!

        xr += pr * qr - pi * qi
        xi += pr * qi + pi * qr
      }

      Tr[j * r + s] = xr
      Ti[j * r + s] = xi
    }
  }

  const Ar = new Float64Array(r * r)
  const Ai = new Float64Array(r * r)

  for (let q = 0; q < r; q++) {
    for (let s = 0; s < r; s++) {
      let xr = 0
      let xi = 0

      for (let j = 0; j < L; j++) {
        const qr = Qr[j * r + q]!
        const qi = -Qi[j * r + q]!
        const tr = Tr[j * r + s]!
        const ti = Ti[j * r + s]!

        xr += qr * tr - qi * ti
        xi += qr * ti + qi * tr
      }

      Ar[q * r + s] = xr
      Ai[q * r + s] = xi
    }
  }

  // <Phi_k | G v> = sum_n e^(i phi_k n) conj(c_n)
  const h = phi.map(p => {
    let xr = 0
    let xi = 0

    for (let n = 0; n <= M; n++) {
      const cr = c.re[n]!
      const ci = -c.im[n]!
      const wr = Math.cos(p * n)
      const wi = Math.sin(p * n)

      xr += wr * cr - wi * ci
      xi += wr * ci + wi * cr
    }

    return [xr, xi] as const
  })
  const values = complexEigenvalues({ re: Ar, im: Ai, n: r })

  return values.re
    .map((ur, idx) => {
      const ui = values.im[idx]!
      const y = complexEigenvector({
        re: Ar,
        im: Ai,
        n: r,
        value: [ur, ui],
      })

      // b = Q y, unit in the S_0 metric
      let pr = 0
      let pi = 0

      for (let k = 0; k < L; k++) {
        let br = 0
        let bi = 0

        for (let s = 0; s < r; s++) {
          const qr = Qr[k * r + s]!
          const qi = Qi[k * r + s]!
          const yr = y.re[s]!
          const yi = y.im[s]!

          br += qr * yr - qi * yi
          bi += qr * yi + qi * yr
        }

        const [hr, hi] = h[k]!

        pr += br * hr + bi * hi
        pi += br * hi - bi * hr
      }

      return {
        E: Math.atan2(ui, ur),
        modulus: Math.hypot(ur, ui),
        weight: (pr * pr + pi * pi) / c.re[0]!,
      }
    })
    .sort((a, b) => b.weight - a.weight)
}

// ---- a fixed state's lines: the reference correlation, filtered afterwards (spin/register-coulomb-track) ----
//
// A filtered level's line weights are the start's overlaps times every filter's transfer at each line, and a filter
// centered on the level's mean phase favors the lines near that mean (E-SPN-0175's weak-pull gate read its "main line" so).
// To follow ONE level across couplings by its overlap with a fixed reference r (normalized in the Gram metric), read r's
// own correlation x_l = <r | G U^l r>, one plain inner product a cycle against G r formed once (G is self-adjoint, so
// <r | G b> = <G r | b>). Any Blackman-Harris filter F of length S at phase p is then applied afterwards, exactly:
// c_l = <F r | G U^l F r> = sum_d A_d e^(-i p d) x_(l + d), A_d = sum_s w_s w_(s + d), x_(-m) the conjugate of x_m (U is
// unitary in the Gram metric). A line's overlap with r is its weight in F r times c_0 / |F(E)|^2, so no filter biases it.

export function referenceCorrelation(
  e: ReducedEngine,
  r: RState,
  n: number,
): { re: Float64Array; im: Float64Array } {
  const N = e.s.count
  const gr = reducedGram(e, r)
  const st = cloneState(r)
  const re = new Float64Array(n + 1)
  const im = new Float64Array(n + 1)
  const partRe = new Float64Array(N)
  const partIm = new Float64Array(N)

  for (let l = 0; l <= n; l++) {
    if (e.fast) {
      e.fast.k.blockInner(gr.re, gr.im, st.re, st.im, partRe, partIm)
    } else {
      for (let i = 0; i < N; i++) {
        let sr = 0
        let si = 0

        for (let k = i * SITE; k < (i + 1) * SITE; k++) {
          const xr = gr.re[k]!
          const xi = gr.im[k]!
          const yr = st.re[k]!
          const yi = st.im[k]!

          sr += xr * yr + xi * yi
          si += xr * yi - xi * yr
        }

        partRe[i] = sr
        partIm[i] = si
      }
    }

    let sr = 0
    let si = 0

    for (let i = 0; i < N; i++) {
      const w = e.s.orbit[i]!

      sr += w * partRe[i]!
      si += w * partIm[i]!
    }

    re[l] = sr
    im[l] = si

    if (l < n) {
      reducedCycle(e, st)
    }
  }

  return { re, im }
}

// |F(E)|^2 for the Blackman-Harris filter of length S at phase p: |sum_s w_s e^(i (E - p) s)|^2
export function filterTransfer(E: number, p: number, S: number): number {
  let r = 0
  let i = 0

  for (let s = 0; s < S; s++) {
    const w = blackmanHarris(s, S)

    r += w * Math.cos((E - p) * s)
    i += w * Math.sin((E - p) * s)
  }

  return r * r + i * i
}

// c_l, l = 0 .. n, of F r from r's correlation x (which must reach lag n + S - 1)
export function filteredCorrelation(
  x: { re: Float64Array; im: Float64Array },
  p: number,
  S: number,
  n: number,
): { re: Float64Array; im: Float64Array } {
  if (x.re.length < n + S) {
    throw new Error('register-reduced: the correlation is too short for this filter')
  }

  const w = Array.from({ length: S }, (_, s) => blackmanHarris(s, S))
  // A_d e^(-i p d) for d = -(S - 1) .. S - 1, stored at d + S - 1
  const kr = new Float64Array(2 * S - 1)
  const ki = new Float64Array(2 * S - 1)

  for (let d = -(S - 1); d <= S - 1; d++) {
    let a = 0

    for (let s = Math.max(0, -d); s < Math.min(S, S - d); s++) {
      a += w[s]! * w[s + d]!
    }

    kr[d + S - 1] = a * Math.cos(-p * d)
    ki[d + S - 1] = a * Math.sin(-p * d)
  }

  const lag = (t: number): [number, number] =>
    t >= 0 ? [x.re[t]!, x.im[t]!] : [x.re[-t]!, -x.im[-t]!]
  const re = new Float64Array(n + 1)
  const im = new Float64Array(n + 1)

  for (let l = 0; l <= n; l++) {
    let sr = 0
    let si = 0

    for (let d = -(S - 1); d <= S - 1; d++) {
      const [xr, xi] = lag(l + d)
      const ar = kr[d + S - 1]!
      const ai = ki[d + S - 1]!

      sr += ar * xr - ai * xi
      si += ar * xi + ai * xr
    }

    re[l] = sr
    im[l] = si
  }

  return { re, im }
}

// every line of r in the window (L phases 2 pi / n apart around `center`), read from F r's correlation over n lags, with
// its overlap |<psi | G r>|^2 / <r | G r> (the filter's transfer divided out)
export type RefLine = Line & { transfer: number; overlap: number }

export function referenceLines(
  x: { re: Float64Array; im: Float64Array },
  n: number,
  center: number,
  L: number,
  p: number,
  S: number,
): RefLine[] {
  const c = filteredCorrelation(x, p, S, n)
  const c0 = c.re[0]!
  const x0 = x.re[0]!

  return harmonicLines(c, center, L, (2 * Math.PI) / n).map(l => {
    const transfer = filterTransfer(l.E, p, S)

    return { ...l, transfer, overlap: (l.weight * c0) / transfer / x0 }
  })
}

// ---- starts, unfolding, readings ----

// both members in S, the hydrogenic profile exp(-r / a), the registers paired by delta (invariant under every element)
export function reducedHydrogenStart(s: Sector, a: number): RState {
  const st = newState(s)

  for (let i = 0; i < s.count; i++) {
    const f = Math.exp(
      -Math.hypot(
        s.reps[3 * i]!,
        s.reps[3 * i + 1]!,
        s.reps[3 * i + 2]!,
      ) / a,
    )

    for (let r = 0; r < REG; r++) {
      st.re[i * SITE + A + r * 8 + r] = f
    }
  }

  return st
}

// the value at a ball point (a, b, c) of an invariant state: rho(g) of its representative's 256 components
export function valueAt(
  s: Sector,
  st: RState,
  a: number,
  b: number,
  c: number,
  outRe: Float64Array,
  outIm: Float64Array,
): boolean {
  if (Math.abs(a) > s.R || Math.abs(b) > s.R || Math.abs(c) > s.R) {
    return false
  }

  const k = cubeIndex(s.R, a, b, c)
  const r = s.pointRep[k]!

  if (r < 0) {
    return false
  }

  const el = elementOf(s, s.pointG[k]!)

  for (let t = 0; t < 4; t++) {
    const src = el.src[t]!
    const sgn = el.sgn[t]!

    for (let q = 0; q < PAIR; q++) {
      outRe[t * PAIR + q] =
        sgn[q]! * st.re[r * SITE + t * PAIR + src[q]!]!

      outIm[t * PAIR + q] =
        sgn[q]! * st.im[r * SITE + t * PAIR + src[q]!]!
    }
  }

  return true
}

// an invariant state of one sector written into another sector of the same ball (the target's group a subgroup of the
// source's), or into the full site list of an unreduced ball ('points' in the order given)
export function unfold(from: Sector, st: RState, to: Sector): RState {
  const out = newState(to)
  const re = new Float64Array(SITE)
  const im = new Float64Array(SITE)

  for (let i = 0; i < to.count; i++) {
    if (
      !valueAt(
        from,
        st,
        to.reps[3 * i]!,
        to.reps[3 * i + 1]!,
        to.reps[3 * i + 2]!,
        re,
        im,
      )
    ) {
      continue
    }

    out.re.set(re, i * SITE)
    out.im.set(im, i * SITE)
  }

  return out
}

export function unfoldToPoints(
  from: Sector,
  st: RState,
  points: readonly (readonly number[])[],
): RState {
  const out = {
    re: new Float64Array(points.length * SITE),
    im: new Float64Array(points.length * SITE),
  }
  const re = new Float64Array(SITE)
  const im = new Float64Array(SITE)

  points.forEach((p, i) => {
    if (!valueAt(from, st, p[0]!, p[1]!, p[2]!, re, im)) {
      return
    }

    out.re.set(re, i * SITE)
    out.im.set(im, i * SITE)
  })

  return out
}

// the coordinate weight per representative (the whole orbit's is orbit times it)
export function repWeights(s: Sector, st: RState): Float64Array {
  const w = new Float64Array(s.count)

  for (let i = 0; i < s.count; i++) {
    let x = 0

    for (let k = i * SITE; k < (i + 1) * SITE; k++) {
      x += st.re[k]! ** 2 + st.im[k]! ** 2
    }

    w[i] = x
  }

  return w
}

// shells of the coordinate weight, the mean radius, and the outermost shell's share
export function reducedShells(
  s: Sector,
  w: Float64Array,
): { shells: number[]; mean: number; edge: number } {
  const out = new Array<number>(s.R + 1).fill(0)

  let t = 0
  let m = 0

  for (let i = 0; i < s.count; i++) {
    const x = w[i]! * s.orbit[i]!
    const r = Math.hypot(
      s.reps[3 * i]!,
      s.reps[3 * i + 1]!,
      s.reps[3 * i + 2]!,
    )

    out[s.shell[i]!]! += x
    t += x
    m += x * r
  }

  return {
    shells: out.map(x => x / t),
    mean: m / t,
    edge: out[s.R]! / t,
  }
}

export function reducedShares(s: Sector, st: RState): number[] {
  const out = [0, 0, 0, 0]

  for (let i = 0; i < s.count; i++) {
    for (let b = 0; b < 4; b++) {
      let x = 0

      for (let k = 0; k < PAIR; k++) {
        x +=
          st.re[i * SITE + b * PAIR + k]! ** 2 +
          st.im[i * SITE + b * PAIR + k]! ** 2
      }

      out[b]! += s.orbit[i]! * x
    }
  }

  const t = out.reduce((x, y) => x + y, 0)

  return out.map(x => x / t)
}

// <G(y)> over the level's density
export function reducedMeanGreen(
  s: Sector,
  table: GreenTable,
  w: Float64Array,
): number {
  let t = 0
  let g = 0

  for (let i = 0; i < s.count; i++) {
    const x = w[i]! * s.orbit[i]!

    t += x
    g +=
      x *
      canonicalGreen(
        table,
        s.reps[3 * i]!,
        s.reps[3 * i + 1]!,
        s.reps[3 * i + 2]!,
      )
  }

  return g / t
}

// E-SPN-0169's S of the density on the side-T husk torus: the density unfolded over its orbits (minimum image), the
// momentum sum over the O_h-canonical torus momenta with their multiplicities
export function reducedS(
  s: Sector,
  w: Float64Array,
  T: number,
): { S: number; meanK2: number; wrapped: number; momenta: number } {
  const re = new Float64Array(T * T * T)
  const im = new Float64Array(T * T * T)
  const m = (x: number): number => ((x % T) + T) % T

  let wrapped = 0
  let total = 0

  for (let c = -s.R; c <= s.R; c++) {
    for (let b = -s.R; b <= s.R; b++) {
      for (let a = -s.R; a <= s.R; a++) {
        const k = cubeIndex(s.R, a, b, c)
        const r = s.pointRep[k]!

        if (r < 0) {
          continue
        }

        const x = w[r]!

        total += x

        if (
          Math.abs(a) >= T / 2 ||
          Math.abs(b) >= T / 2 ||
          Math.abs(c) >= T / 2
        ) {
          wrapped += x
        }

        re[m(a) + T * m(b) + T * T * m(c)]! += x
      }
    }
  }

  fft3(re, im, T, false)

  const step = (2 * Math.PI) / T
  const signed = (x: number): number => (x > T / 2 ? x - T : x)

  let num = 0
  let den = 0
  let k2 = 0
  let momenta = 0

  // canonical momenta: indices i >= j >= l >= 0 on the signed range [0, T / 2]; multiplicity = the orbit size
  for (let i = 0; i <= T / 2; i++) {
    for (let j = 0; j <= i; j++) {
      for (let l = 0; l <= j; l++) {
        if (i === 0) {
          continue
        }

        // the orbit of (i, j, l) under signed permutations, on the torus (T / 2 is its own negative)
        const seen = new Set<string>()
        const v = [i, j, l]

        for (const p of [
          [0, 1, 2],
          [0, 2, 1],
          [1, 0, 2],
          [1, 2, 0],
          [2, 0, 1],
          [2, 1, 0],
        ]) {
          for (let sgn = 0; sgn < 8; sgn++) {
            const q = p.map((pi, idx) =>
              m(((sgn >> idx) & 1 ? -1 : 1) * v[pi]!),
            )

            seen.add(q.join(','))
          }
        }

        const mult = seen.size
        const rho = re[i + T * j + T * T * l]!
        const kv = [
          signed(i) * step,
          signed(j) * step,
          signed(l) * step,
        ]
        const eps = coulombSymbol(kv)
        const weight = (mult * rho) / eps
        const { X } = darwinRatio(kv)

        num += X * weight
        den += weight
        k2 += (kv[0]! ** 2 + kv[1]! ** 2 + kv[2]! ** 2) * weight
        momenta += mult
      }
    }
  }

  return {
    S: num / den,
    meanK2: k2 / den,
    wrapped: wrapped / total,
    momenta,
  }
}

export { huskPoint, gammaMatrices, EVEN }
