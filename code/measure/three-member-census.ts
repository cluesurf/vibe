// THE CENSUS OF FEW-MEMBER STATES ON ONE REGISTER LEVEL BY THE RULE'S OWN CHARGE AND SPIN (E-SPN-0192, OPEN-MAT-01).
// A member of the register rule is one hole of a full sea (E-SPN-0163): one of 16 modes, a register component (8, the
// even Clifford algebra Cl+(4), E-SPN-0160) times a tone (love or fear, a species label every piece leaves alone,
// E-FND-0160, E-SPN-0189). This file puts n members on one level (one orbital, so the spatial part is symmetric and the
// whole exchange symmetry falls on register (x) tone) and decomposes the n-member space by
//
//   charge     the vibe count of E-SPN-0189: love mode +1, fear mode -1, Q = (love - fear) / 3 of the seas with the holes,
//              minus that of the full seas (0). Read from the counts, never a table: a love-sea hole reads 3Q = -1
//   spin       the register's own rotation action: a rotation by angle t in the husk plane e_i e_j acts on a member as
//              L(exp(t e_ij / 2)) (register-symmetry's untwisted rotation, left multiplication), so the generator is
//              L(e_ij) / 2 times i. The husk planes are 01, 02, 12 (depth along e_3, husk-reading). The Casimir is
//              4 J^2 = - sum (A_01^2 + A_02^2 + A_12^2) over the total A = sum over members of L(e_ij), an INTEGER
//              matrix, and the multiplicity of 2J = s is the nullity of 4 J^2 - s (s + 2), by exact BigInt elimination
//   chirality  the half of each member, J = right multiplication by the volume element (chiral-register volumeRight),
//              an involution: n+ is the number of members in the J = +1 half
//   exchange   'fermi' (wedges, strictly increasing mode tuples), 'bose' (monomials, nondecreasing) or 'none'
//              (distinguishable members, ordered tuples: the exchange projection dropped)
//
// The register splits into the two J halves by the integer vectors e_B + s e_B' and e_B - s e_B' (J e_B = s e_B'), 4 per
// half. Every left multiplication commutes with J (a right multiplication), so it maps a half to itself; in this basis it
// is an integer 4 x 4 matrix per half, checked by exact reconstruction. Every rotation generator keeps each member's
// (half, tone), so a sector is fixed by the (ordered or sorted) tuple of member labels, and the Casimir is block diagonal
// on sectors of at most 64 states.
//
//   halfBasis          the 4 + 4 integer half vectors
//   onHalf             the integer 4 x 4 action of an 8 x 8 register operator on one half (null if it leaves the half)
//   rotationGenerators the three husk generators per half: L(e_ij) ('untwisted', the spinor action), or L(e_ij) - R(e_ij)
//                      ('twisted', conjugation, the lattice's genuine representation, for the control)
//   su2Closure         A_k^2 per half and [A_i, A_j] = +-2 A_k, exactly
//   holeCharge3        3Q of a set of holes, by the vibe count
//   census             the rows (3Q, n+, 2J, states, multiplets, like-tone) of the n-member space
//
// DETERMINISM: no random numbers. EXACT: every matrix is integer, every rank a BigInt elimination.

import { EVEN } from '@/code/measure/spinor-register'
import {
  evenBlade,
  leftMultiplication,
  rightMultiplication,
} from '@/code/measure/register-symmetry'
import { volumeRight } from '@/code/measure/chiral-register'

const REG = 8
const HALF = 4

export type Exchange = 'fermi' | 'bose' | 'none'
export type Rotation = 'untwisted' | 'twisted'
type Int = number[][]

export const HUSK_PLANES: readonly (readonly [number, number])[] = [
  [0, 1],
  [0, 2],
  [1, 2],
]

const mul = (a: Int, b: Int): Int =>
  a.map(r =>
    b[0]!.map((_, j) => r.reduce((s, x, k) => s + x * b[k]![j]!, 0)),
  )

const apply = (M: Int, v: readonly number[]): number[] =>
  M.map(r => r.reduce((a, x, k) => a + x * v[k]!, 0))

// ---- the two J halves ----

export type HalfBasis = {
  // vectors[h][k] an integer 8-vector, h = 0 the J = +1 half
  vectors: number[][][]
  // J v = (+1 or -1) v on every vector, exactly
  eigenExact: boolean
}

export function halfBasis(): HalfBasis {
  const J = volumeRight()
  const vectors: number[][][] = [[], []]
  const used = new Set<number>()

  for (let b = 0; b < REG; b++) {
    if (used.has(b)) {
      continue
    }

    const col = J.map(r => r[b]!)
    const bp = col.findIndex(x => x !== 0)
    const s = col[bp]!

    used.add(b)
    used.add(bp)

    for (const [h, sign] of [
      [0, 1],
      [1, -1],
    ] as const) {
      const v = Array<number>(REG).fill(0)

      v[b]! += 1
      v[bp]! += sign * s
      vectors[h]!.push(v)
    }
  }

  const eigenExact =
    vectors.every(vs => vs.length === HALF) &&
    vectors.every((vs, h) =>
      vs.every(v =>
        apply(J, v).every((x, i) => x === (h === 0 ? 1 : -1) * v[i]!),
      ),
    )

  return { vectors, eigenExact }
}

export function onHalf(M: Int, basis: HalfBasis, h: 0 | 1): Int | null {
  const vs = basis.vectors[h]!
  const out: Int = Array.from({ length: HALF }, () =>
    Array<number>(HALF).fill(0),
  )

  for (let c = 0; c < HALF; c++) {
    const w = apply(M, vs[c]!)

    for (let r = 0; r < HALF; r++) {
      const dot = w.reduce((a, x, k) => a + x * vs[r]![k]!, 0)
      const norm = vs[r]!.reduce((a, x) => a + x * x, 0)

      if (dot % norm !== 0) {
        return null
      }

      out[r]![c] = dot / norm
    }

    const back = Array<number>(REG).fill(0)

    for (let r = 0; r < HALF; r++) {
      for (let k = 0; k < REG; k++) {
        back[k]! += out[r]![c]! * vs[r]![k]!
      }
    }

    if (back.some((x, k) => x !== w[k])) {
      return null
    }
  }

  return out
}

export type Generators = {
  // gen[k][h]: the k-th husk generator on half h, integer 4 x 4
  gen: Int[][]
  // the halves are exact eigenspaces and every generator kept each half, as an integer matrix
  halvesKept: boolean
}

export function rotationGenerators(rotation: Rotation): Generators {
  const basis = halfBasis()
  let halvesKept = basis.eigenExact

  const gen = HUSK_PLANES.map(p => {
    const e = evenBlade(EVEN.findIndex(b => b.join(',') === p.join(',')))
    const L = leftMultiplication(e)
    const R = rightMultiplication(e)
    const M =
      rotation === 'untwisted'
        ? L
        : L.map((r, i) => r.map((x, j) => x - R[i]![j]!))

    return ([0, 1] as const).map(h => {
      const A = onHalf(M, basis, h)

      if (!A) {
        halvesKept = false

        return Array.from({ length: HALF }, () =>
          Array<number>(HALF).fill(0),
        )
      }

      return A
    })
  })

  return { gen, halvesKept }
}

export function su2Closure(g: Generators): {
  // -A_k^2 when it is a multiple of the identity, else NaN, per half and generator
  squares: number[]
  closes: boolean
} {
  const squares: number[] = []
  let closes = true

  for (const h of [0, 1]) {
    const A = g.gen.map(x => x[h]!)

    for (const a of A) {
      const s = mul(a, a)
      const c = s[0]![0]!
      const scalar = s.every((r, i) =>
        r.every((x, j) => x === (i === j ? c : 0)),
      )

      squares.push(scalar ? -c : Number.NaN)
    }

    for (const [i, j, k] of [
      [0, 1, 2],
      [1, 2, 0],
      [0, 2, 1],
    ] as const) {
      const ij = mul(A[i]!, A[j]!)
      const ji = mul(A[j]!, A[i]!)
      const c = ij.map((r, x) => r.map((v, y) => v - ji[x]![y]!))
      const plus = c.every((r, x) =>
        r.every((v, y) => v === 2 * A[k]![x]![y]!),
      )
      const minus = c.every((r, x) =>
        r.every((v, y) => v === -2 * A[k]![x]![y]!),
      )

      closes = closes && (plus || minus)
    }
  }

  return { squares, closes }
}

// ---- modes: (half, register-in-half, tone), index h * 8 + r * 2 + t; t = 0 love, 1 fear ----

export const MODE_COUNT = 16

const modeHalf = (m: number): number => m >> 3
const modeReg = (m: number): number => (m >> 1) & 3
const modeTone = (m: number): number => m & 1
const modeOf = (h: number, r: number, t: number): number =>
  h * 8 + r * 2 + t

// the vibe of a mode: love +1, fear -1 (E-FRC-0243's count)
const modeVibe = (m: number): number => (modeTone(m) === 0 ? 1 : -1)

// 3Q of a state with these holes: the seas' vibe count with the holes removed, minus the full seas'
export function holeCharge3(holes: readonly number[]): number {
  let full = 0

  for (let m = 0; m < MODE_COUNT; m++) {
    full += modeVibe(m)
  }

  let left = full

  for (const m of holes) {
    left -= modeVibe(m)
  }

  return left - full
}

// ---- the n-member space ----

function tuples(n: number, exchange: Exchange): number[][] {
  const out: number[][] = []
  const walk = (prefix: number[]): void => {
    if (prefix.length === n) {
      out.push(prefix)

      return
    }

    const last = prefix[prefix.length - 1]
    const from =
      exchange === 'none' || last === undefined
        ? 0
        : exchange === 'fermi'
          ? last + 1
          : last

    for (let m = from; m < MODE_COUNT; m++) {
      walk([...prefix, m])
    }
  }

  walk([])

  return out
}

// sort a tuple, with the sign of the permutation for fermi; null when two modes coincide under fermi
function canonical(
  t: number[],
  exchange: Exchange,
): { tuple: number[]; sign: number } | null {
  if (exchange === 'none') {
    return { tuple: t, sign: 1 }
  }

  const w = t.slice()
  let sign = 1

  for (let i = 0; i < w.length; i++) {
    for (let j = 0; j < w.length - 1 - i; j++) {
      if (w[j]! > w[j + 1]!) {
        ;[w[j], w[j + 1]] = [w[j + 1]!, w[j]!]
        sign = -sign
      }
    }
  }

  if (exchange === 'fermi') {
    for (let i = 1; i < w.length; i++) {
      if (w[i] === w[i - 1]) {
        return null
      }
    }

    return { tuple: w, sign }
  }

  return { tuple: w, sign: 1 }
}

// the rank of an integer matrix, by fraction-free (Bareiss) elimination in BigInt
export function rankExact(M: readonly (readonly number[])[]): number {
  const a = M.map(r => r.map(x => BigInt(x)))
  const rows = a.length
  const cols = rows > 0 ? a[0]!.length : 0
  let rank = 0
  let prev = 1n

  for (let c = 0; c < cols && rank < rows; c++) {
    let p = -1

    for (let r = rank; r < rows; r++) {
      if (a[r]![c] !== 0n) {
        p = r
        break
      }
    }

    if (p < 0) {
      continue
    }

    ;[a[rank], a[p]] = [a[p]!, a[rank]!]

    for (let r = rank + 1; r < rows; r++) {
      for (let k = c + 1; k < cols; k++) {
        a[r]![k] =
          (a[rank]![c]! * a[r]![k]! - a[r]![c]! * a[rank]![k]!) / prev
      }

      a[r]![c] = 0n
    }

    prev = a[rank]![c]!
    rank++
  }

  return rank
}

export type CensusRow = {
  members: number
  exchange: Exchange
  charge3: number
  nPlus: number
  twoJ: number
  states: number
  multiplets: number
  likeTone: boolean
}

export type Census = {
  rows: CensusRow[]
  dimension: number
  // every sector's Casimir nullities summed to its dimension (no eigenvalue outside s (s + 2))
  complete: boolean
  // every multiplicity divisible by 2J + 1
  wholeMultiplets: boolean
  sectors: number
}

export function census(
  n: number,
  exchange: Exchange,
  rotation: Rotation = 'untwisted',
): Census {
  const { gen } = rotationGenerators(rotation)
  // one-member generators on the 16 modes, as sparse columns: one[k][m] = [[m', coefficient], ...]
  const one = gen.map(perHalf =>
    Array.from({ length: MODE_COUNT }, (_, m) => {
      const h = modeHalf(m)
      const r = modeReg(m)
      const t = modeTone(m)
      const out: [number, number][] = []

      for (let rp = 0; rp < HALF; rp++) {
        const c = perHalf[h]![rp]![r]!

        if (c !== 0) {
          out.push([modeOf(h, rp, t), c])
        }
      }

      return out
    }),
  )

  const basis = tuples(n, exchange)
  const sectors = new Map<string, number[][]>()

  for (const t of basis) {
    const labels = t.map(m => modeHalf(m) * 2 + modeTone(m))
    const key = (exchange === 'none' ? labels : labels.slice().sort()).join(
      ',',
    )
    const list = sectors.get(key) ?? []

    list.push(t)
    sectors.set(key, list)
  }

  const tally = new Map<string, CensusRow>()
  let complete = true
  let wholeMultiplets = true

  for (const states of sectors.values()) {
    const d = states.length
    const index = new Map(states.map((t, i) => [t.join(','), i]))
    const A = one.map(a1 => {
      const M: Int = Array.from({ length: d }, () =>
        Array<number>(d).fill(0),
      )

      states.forEach((t, col) => {
        for (let p = 0; p < n; p++) {
          for (const [mp, c] of a1[t[p]!]!) {
            const nt = t.slice()

            nt[p] = mp

            const can = canonical(nt, exchange)

            if (!can) {
              continue
            }

            const row = index.get(can.tuple.join(','))

            if (row === undefined) {
              throw new Error('a generator left its sector')
            }

            M[row]![col]! += can.sign * c
          }
        }
      })

      return M
    })
    // 4 J^2 = - sum A_k^2
    const C: Int = Array.from({ length: d }, () => Array<number>(d).fill(0))

    for (const M of A) {
      const S = mul(M, M)

      for (let i = 0; i < d; i++) {
        for (let j = 0; j < d; j++) {
          C[i]![j]! -= S[i]![j]!
        }
      }
    }

    const t0 = states[0]!
    const charge3 = holeCharge3(t0)
    const nPlus = t0.filter(m => modeHalf(m) === 0).length
    const likeTone = t0.every(m => modeTone(m) === modeTone(t0[0]!))
    let found = 0

    for (let s = 0; s <= 2 * n; s++) {
      const lambda = s * (s + 2)
      const shifted = C.map((r, i) =>
        r.map((x, j) => x - (i === j ? lambda : 0)),
      )
      const nullity = d - rankExact(shifted)

      if (nullity === 0) {
        continue
      }

      found += nullity

      if (nullity % (s + 1) !== 0) {
        wholeMultiplets = false
      }

      const key = `${charge3}|${nPlus}|${s}`
      const row = tally.get(key) ?? {
        members: n,
        exchange,
        charge3,
        nPlus,
        twoJ: s,
        states: 0,
        multiplets: 0,
        likeTone,
      }

      row.states += nullity
      row.multiplets = row.states / (s + 1)
      tally.set(key, row)
    }

    if (found !== d) {
      complete = false
    }
  }

  const rows = [...tally.values()].sort(
    (a, b) => a.charge3 - b.charge3 || a.twoJ - b.twoJ || b.nPlus - a.nPlus,
  )

  return {
    rows,
    dimension: basis.length,
    complete,
    wholeMultiplets,
    sectors: sectors.size,
  }
}

// states per (3Q, 2J), summed over n+
export function byChargeSpin(c: Census): Map<string, number> {
  const out = new Map<string, number>()

  for (const r of c.rows) {
    const k = `${r.charge3}|${r.twoJ}`

    out.set(k, (out.get(k) ?? 0) + r.states)
  }

  return out
}

export const formatRow = (r: CensusRow): string =>
  `Q ${r.charge3 === 0 ? '0' : `${r.charge3}/3`} J ${r.twoJ % 2 === 0 ? r.twoJ / 2 : `${r.twoJ}/2`} n+ ${r.nPlus}: ${r.multiplets} multiplets (${r.states} states)`
