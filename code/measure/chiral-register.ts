// CHIRALITY ON THE CLIFFORD REGISTER (E-FRC-0258). E-SPN-0160's member carries Cl+(4) = wedge^0 + wedge^2 + wedge^4 =
// H + H. Right Clifford multiplication by the volume element vol = e0 e1 e2 e3 is an involution J on it (J^2 = 1, trace
// 0) that commutes with every left multiplication, so with every gamma_i^T gamma_j and with both of E-SPN-0160's
// projectors; W(F4), acting by minors, satisfies g J = det(g) J g. So the two eigenspaces of J, the self-dual and the
// anti-self-dual halves, are kept by the 576 rotations of W(F4) and swapped by its 576 reflections. This file builds
// that chirality and the pieces that act on one half only.
//
//   volumeRight         J as an 8 x 8 integer matrix [row][col] on the EVEN blades
//   det4                an exact determinant of a W(F4) element (an integer, +-1)
//   chirality2          2 P+ = 1 (x) (1 + J) on the 192 modes (an integer matrix)
//   chiralPiece         P = X (1 + (u+ - 1) q+ + (u- - 1) q-): a mixer on two commuting projectors, after the swap coin
//   SECTOR_BASIS        an orthonormal eigenbasis of J (the first four columns +1, the last four -1)
//   sectorBlock         a 192-mode piece in the register basis rotated to SECTOR_BASIS, cut to one sector's 96 modes
//                       (exact block structure is checked, not assumed: the off-block weight is returned)
//   molien              the number of invariant polynomials of each degree, 1 / |G| sum 1 / det(1 - t g), in exact
//                       integers (each det(1 - t g) is an integer polynomial with constant 1)
//   frameOf             which of the three 8-root cross-polytopes (the pair partitions 01|23, 02|13, 03|12) a root is in
//   mixedCensus         E-SPN-0159's pair census for a pair with ONE MEMBER IN EACH SECTOR, the threshold M+ + M-, each
//                       sector's bands tracked in its own frame
//   trimaximal          the 3 x 3 Fourier mixing omega^(jk) / sqrt(-3) over Z[omega][1/3], exactly, and its Jarlskog
//                       invariant
//
// DETERMINISM: no random numbers. EXACT where it says so: J, the lifted projectors and the group are integer or dyadic
// matrices; the Eisenstein arithmetic is in BigInt. Floats elsewhere, as measurement.

import {
  EVEN,
  MODES,
  type GroupElement,
} from '@/code/measure/spinor-register'
import { wrap, type CMatrix } from '@/code/measure/dock-mixer'
import { type Census, type Frame } from '@/code/measure/two-beat'
import { trackedEpsN } from '@/code/measure/spinor-register'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { eisConj, eisMul, type Eis } from '@/code/measure/swap-cone'

type Roots = readonly (readonly number[])[]

const REG = 8
const SLOTS = 24

export const SECTOR_MODES = SLOTS * 4

// ---- the volume element ----

// the Euclidean Clifford product of two sorted blades: the sign and the sorted blade
function clifford(
  a: readonly number[],
  b: readonly number[],
): { sign: number; blade: number[] } {
  const w = [...a, ...b]

  let sign = 1

  for (let i = 0; i < w.length; i++) {
    for (let j = 0; j < w.length - 1 - i; j++) {
      if (w[j]! > w[j + 1]!) {
        ;[w[j], w[j + 1]] = [w[j + 1]!, w[j]!]
        sign = -sign
      }
    }
  }

  const out: number[] = []

  for (const x of w) {
    if (out.length > 0 && out[out.length - 1] === x) {
      out.pop()
    } else {
      out.push(x)
    }
  }

  return { sign, blade: out }
}

const bladeKey = (b: readonly number[]): string => b.join(',')

// J w = w vol, on the even blades
export function volumeRight(): number[][] {
  const index = new Map(EVEN.map((b, k) => [bladeKey(b), k]))
  const J = EVEN.map(() => Array<number>(REG).fill(0))

  EVEN.forEach((B, col) => {
    const p = clifford(B, [0, 1, 2, 3])

    J[index.get(bladeKey(p.blade))!]![col] = p.sign
  })

  return J
}

// the exact determinant of a 4 x 4 matrix with dyadic entries (Gaussian elimination, rounded: W(F4) has det +-1)
export function det4(m: readonly (readonly number[])[]): number {
  const a = m.map(r => [...r])

  let d = 1

  for (let c = 0; c < 4; c++) {
    let p = c

    while (p < 4 && Math.abs(a[p]![c]!) < 1e-12) {
      p++
    }

    if (p === 4) {
      return 0
    }

    if (p !== c) {
      ;[a[p], a[c]] = [a[c]!, a[p]!]
      d = -d
    }

    const piv = a[c]![c]!

    d *= piv

    for (let r = c + 1; r < 4; r++) {
      const f = a[r]![c]! / piv

      for (let k = c; k < 4; k++) {
        a[r]![k]! -= f * a[c]![k]!
      }
    }
  }

  return Math.round(d)
}

// 1 (x) (1 + s J) on the 192 modes, s = +1 or -1: twice the projector on one half (an integer matrix)
export function chirality2(
  J: readonly (readonly number[])[],
  s = 1,
): Float64Array {
  const q = new Float64Array(MODES * MODES)

  for (let d = 0; d < SLOTS; d++) {
    for (let a = 0; a < REG; a++) {
      for (let b = 0; b < REG; b++) {
        q[(d * REG + a) * MODES + d * REG + b] =
          (a === b ? 1 : 0) + s * (J[a] as number[])[b]!
      }
    }
  }

  return q
}

// P = X (1 + (u+ - 1) q+ + (u- - 1) q-), row-major [to][from]; q+ q- = 0 is the caller's (checked in the experiment)
export function chiralPiece(
  qPlus: Float64Array,
  qMinus: Float64Array,
  uPlus: readonly [number, number],
  uMinus: readonly [number, number],
): CMatrix {
  const n = MODES
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    const from = OPPOSITE[Math.floor(i / REG)]! * REG + (i % REG)

    for (let j = 0; j < n; j++) {
      const p = qPlus[from * n + j]!
      const m = qMinus[from * n + j]!

      re[i * n + j] =
        (from === j ? 1 : 0) + (uPlus[0] - 1) * p + (uMinus[0] - 1) * m
      im[i * n + j] = uPlus[1] * p + uMinus[1] * m
    }
  }

  return { re, im }
}

// an orthonormal eigenbasis of the signed involution J: each fixed blade, or each pair (a, b) with J e_a = s e_b as
// (e_a + s e_b) / sqrt 2 (eigenvalue +1) and (e_a - s e_b) / sqrt 2 (eigenvalue -1); columns, the +1 half first
export function sectorBasis(
  J: readonly (readonly number[])[],
): number[][] {
  const plus: number[][] = []
  const minus: number[][] = []
  const seen = new Set<number>()

  for (let a = 0; a < REG; a++) {
    if (seen.has(a)) {
      continue
    }

    const b = (J as number[][]).findIndex(row => row[a] !== 0)
    const s = (J[b] as number[])[a]!

    seen.add(a).add(b)

    if (a === b) {
      const v = Array<number>(REG).fill(0)

      v[a] = 1
      ;(s > 0 ? plus : minus).push(v)
      continue
    }

    const vp = Array<number>(REG).fill(0)
    const vm = Array<number>(REG).fill(0)

    vp[a] = Math.SQRT1_2
    vp[b] = s * Math.SQRT1_2
    vm[a] = Math.SQRT1_2
    vm[b] = -s * Math.SQRT1_2
    plus.push(vp)
    minus.push(vm)
  }

  return [...plus, ...minus]
}

// the piece in the rotated register basis, cut to one sector's 96 modes (sector 0: the +1 half, 1: the -1 half), and
// the largest weight the rotated piece puts between the sectors (zero for a piece that keeps the halves)
export function sectorBlock(
  P: CMatrix,
  basis: readonly (readonly number[])[],
  sector: 0 | 1,
): { block: CMatrix; leak: number } {
  const n = MODES

  const rot = (x: Float64Array): Float64Array => {
    // (1 (x) O^T) x (1 (x) O), O's columns the basis
    const tmp = new Float64Array(n * n)
    const out = new Float64Array(n * n)

    for (let d = 0; d < SLOTS; d++) {
      for (let e = 0; e < SLOTS; e++) {
        for (let a = 0; a < REG; a++) {
          for (let bp = 0; bp < REG; bp++) {
            let s = 0

            for (let b = 0; b < REG; b++) {
              s +=
                x[(d * REG + a) * n + e * REG + b]! *
                (basis[bp] as number[])[b]!
            }

            tmp[(d * REG + a) * n + e * REG + bp] = s
          }
        }

        for (let ap = 0; ap < REG; ap++) {
          for (let bp = 0; bp < REG; bp++) {
            let s = 0

            for (let a = 0; a < REG; a++) {
              s +=
                (basis[ap] as number[])[a]! *
                tmp[(d * REG + a) * n + e * REG + bp]!
            }

            out[(d * REG + ap) * n + e * REG + bp] = s
          }
        }
      }
    }

    return out
  }

  const re = rot(P.re)
  const im = rot(P.im)
  const m = SECTOR_MODES
  const block: CMatrix = {
    re: new Float64Array(m * m),
    im: new Float64Array(m * m),
  }
  const lo = sector * 4

  let leak = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const inI = i % REG >= lo && i % REG < lo + 4
      const inJ = j % REG >= lo && j % REG < lo + 4
      const w = Math.hypot(re[i * n + j]!, im[i * n + j]!)

      if (inI && inJ) {
        const bi = Math.floor(i / REG) * 4 + ((i % REG) - lo)
        const bj = Math.floor(j / REG) * 4 + ((j % REG) - lo)

        block.re[bi * m + bj] = re[i * n + j]!
        block.im[bi * m + bj] = im[i * n + j]!
      } else if (inI !== inJ) {
        leak = Math.max(leak, w)
      }
    }
  }

  return { block, leak }
}

// g A = B g exactly on the 192 modes (g acting on (slot d, register b) as (slots[d], register[a][b])): with A = B this is
// covariance, with A = 2 P+ and B = 2 P- it says g swaps the halves
export function intertwinesExactly(
  g: GroupElement,
  A: Float64Array,
  B: Float64Array,
): boolean {
  const n = MODES

  for (let d = 0; d < SLOTS; d++) {
    const sd = g.slots[d]!

    for (let e = 0; e < SLOTS; e++) {
      const se = g.slots[e]!

      for (let a = 0; a < REG; a++) {
        for (let c = 0; c < REG; c++) {
          let left = 0
          let right = 0

          for (let b = 0; b < REG; b++) {
            left +=
              g.register[a]![b]! * A[(d * REG + b) * n + e * REG + c]!
          }

          for (let b = 0; b < REG; b++) {
            right +=
              B[(sd * REG + a) * n + se * REG + b]! * g.register[b]![c]!
          }

          if (left !== right) {
            return false
          }
        }
      }
    }
  }

  return true
}

// Z P with Z = 1 + (v - 1) q (q real): a register phase v on the range of q, applied after the piece
export function phaseAfter(
  P: CMatrix,
  q: Float64Array,
  v: readonly [number, number],
): CMatrix {
  const n = MODES
  const qre = new Float64Array(n * n)
  const qim = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const x = q[i * n + k]!

      if (x === 0) {
        continue
      }

      for (let j = 0; j < n; j++) {
        qre[i * n + j]! += x * P.re[k * n + j]!
        qim[i * n + j]! += x * P.im[k * n + j]!
      }
    }
  }

  const a = v[0] - 1
  const b = v[1]

  return {
    re: P.re.map((x, i) => x + a * qre[i]! - b * qim[i]!),
    im: P.im.map((x, i) => x + a * qim[i]! + b * qre[i]!),
  }
}

// one sector's modes: 4 register components a slot
export const SECTOR_ROOTS = (roots: Roots): Roots =>
  Array.from(
    { length: SECTOR_MODES },
    (_, i) => roots[Math.floor(i / 4)]!,
  )

// ---- invariant theory ----

export function molien(
  G: readonly GroupElement[],
  N: number,
): bigint[] {
  const total = Array<bigint>(N + 1).fill(0n)

  for (const e of G) {
    const m = e.matrix
    const c1 = m.reduce((s, r, i) => s + r[i]!, 0)

    let c2 = 0

    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        c2 += m[i]![i]! * m[j]![j]! - m[i]![j]! * m[j]![i]!
      }
    }

    // for an orthogonal g the sum of the principal 3-minors is det(g) trace(g)
    const d = det4(m)
    const cs = [c1, c2, d * c1, d].map(x => BigInt(Math.round(x)))
    const a: bigint[] = [1n]

    for (let k = 1; k <= N; k++) {
      a.push(
        cs[0]! * (a[k - 1] ?? 0n) -
          cs[1]! * (a[k - 2] ?? 0n) +
          cs[2]! * (a[k - 3] ?? 0n) -
          cs[3]! * (a[k - 4] ?? 0n),
      )
    }

    for (let k = 0; k <= N; k++) {
      total[k]! += a[k]!
    }
  }

  return total.map(x => {
    if (x % BigInt(G.length) !== 0n) {
      return -1n
    }

    return x / BigInt(G.length)
  })
}

// the three frames: the pair partitions of the four axes
export function frameOf(r: readonly number[]): number {
  const s = r
    .map((x, i) => (x !== 0 ? i : -1))
    .filter(i => i >= 0)
    .join('')

  return s === '01' || s === '23' ? 0 : s === '02' || s === '13' ? 1 : 2
}

// ---- the mixed pair census ----

// one member in each sector: d = wrap(M+ + M- - eps_a - eps_b) over a in the + bands and b in the - bands, each sector
// tracked in its own frame (eps signed so its singlet rests at +M); a crossing is a sign change of d along a path
export function mixedCensus(
  A: readonly CMatrix[],
  fa: Frame,
  B: readonly CMatrix[],
  fb: Frame,
  paths: readonly (readonly (readonly number[])[])[],
  roots: Roots,
  tol = 1e-9,
): Census {
  const threshold = fa.M + fb.M

  let Bstar = Math.PI
  let at: number[] = []
  let pair: [number, number] = [NaN, NaN]
  let crossings = 0
  let first: Census['first'] = { q: Infinity, pair: [NaN, NaN] }

  for (const path of paths) {
    const ea = trackedEpsN(A, fa, path, roots)
    const eb = trackedEpsN(B, fb, path, roots)
    const na = ea[0]!.length
    const nb = eb[0]!.length
    const last = new Float64Array(na * nb).fill(NaN)

    path.forEach((q, s) => {
      const x = ea[s]!
      const y = eb[s]!

      for (let a = 0; a < na; a++) {
        for (let b = 0; b < nb; b++) {
          const v = wrap(threshold - x[a]! - y[b]!)
          const w = last[a * nb + b]!

          if (v > tol && v < Bstar) {
            Bstar = v
            at = [...q]
            pair = [x[a]!, y[b]!]
          }

          if (Math.abs(v) <= tol) {
            continue
          }

          if (Math.abs(v) >= 1) {
            last[a * nb + b] = NaN
            continue
          }

          if (!Number.isNaN(w) && w > 0 !== v > 0) {
            crossings++

            const r = Math.hypot(...q)

            if (r < first.q) {
              first = { q: r, pair: [x[a]!, y[b]!] }
            }
          }

          last[a * nb + b] = v
        }
      }
    })
  }

  return {
    M: threshold / 2,
    Bstar: crossings > 0 ? 0 : Bstar,
    crossings,
    at,
    pair,
    first,
  }
}

// ---- spectral symmetry readings ----

// two multisets of phases (mod 2 pi) compared. Unshifted: the largest distance in the best circular matching of the
// sorted lists. Shifted (equal up to a common rephasing e^(i delta)): the circular GAP sequences compared under the best
// rotation, which is exactly shift invariant; zero iff the multisets agree up to some shift, and every other value is a
// lower bound's witness (no shift can do better than half the largest gap mismatch)
export function phaseMismatch(
  a: readonly number[],
  b: readonly number[],
  shift: boolean,
): number {
  const sortC = (x: readonly number[]): number[] =>
    x.map(v => wrap(v)).sort((p, q) => p - q)
  const A = sortC(a)
  const B = sortC(b)
  const n = A.length

  if (n !== B.length) {
    return Infinity
  }

  const gaps = (x: readonly number[]): number[] =>
    x.map((v, i) =>
      i === n - 1 ? x[0]! + 2 * Math.PI - v : x[i + 1]! - v,
    )
  const X = shift ? gaps(A) : A
  const Y = shift ? gaps(B) : B

  let best = Infinity

  for (let r = 0; r < n; r++) {
    let worst = 0

    for (let i = 0; i < n; i++) {
      const d = shift
        ? Math.abs(X[i]! - Y[(i + r) % n]!)
        : Math.abs(wrap(X[i]! - Y[(i + r) % n]!))

      worst = Math.max(worst, d)

      if (worst >= best) {
        break
      }
    }

    best = Math.min(best, worst)

    if (best === 0) {
      break
    }
  }

  return best
}

// ---- the trimaximal mixing ----

// Eisenstein numbers a + b w, w = e^(2 pi i / 3); V_jk = w^(jk) rho with rho = 1 / sqrt(-3) = -(1 + 2 w) / 3
export type EisQ = { num: Eis; den: bigint }

const W_POW: Eis[] = [
  [1n, 0n],
  [0n, 1n],
  [-1n, -1n],
]

export function trimaximal(): EisQ[][] {
  const rho: Eis = [-1n, -2n]

  return [0, 1, 2].map(j =>
    [0, 1, 2].map(k => ({
      num: eisMul(W_POW[(j * k) % 3]!, rho),
      den: 3n,
    })),
  )
}

// V V^dag = 1 exactly
export function unitaryExact(V: readonly (readonly EisQ[])[]): boolean {
  for (let i = 0; i < 3; i++) {
    for (let l = 0; l < 3; l++) {
      let s: Eis = [0n, 0n]
      let den = 1n

      for (let k = 0; k < 3; k++) {
        const x = (V[i] as EisQ[])[k]!
        const y = (V[l] as EisQ[])[k]!
        const p = eisMul(x.num, eisConj(y.num))

        // all denominators equal (3 * 3 = 9)
        den = x.den * y.den
        s = [s[0] + p[0], s[1] + p[1]]
      }

      if (
        i === l
          ? !(s[0] === den && s[1] === 0n)
          : !(s[0] === 0n && s[1] === 0n)
      ) {
        return false
      }
    }
  }

  return true
}

// J = Im(V00 V11 conj(V01) conj(V10)) as (num a + b w) / den; its imaginary part is b sqrt(3) / 2 / den
export function jarlskog(V: readonly (readonly EisQ[])[]): {
  num: Eis
  den: bigint
  value: number
} {
  const v = (j: number, k: number): EisQ => (V[j] as EisQ[])[k]!
  const num = eisMul(
    eisMul(v(0, 0).num, v(1, 1).num),
    eisMul(eisConj(v(0, 1).num), eisConj(v(1, 0).num)),
  )
  const den = v(0, 0).den * v(1, 1).den * v(0, 1).den * v(1, 0).den

  return {
    num,
    den,
    value: (Number(num[1]) * Math.sqrt(3)) / 2 / Number(den),
  }
}
