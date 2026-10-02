// LATTICE-GAS COLLISION TABLES AND THEIR COLLISION INVARIANTS, EXACT (E-FLD-0034). A lattice gas's collision is read as
// a set of transitions n -> n' between occupation vectors of one node. A COLLISION INVARIANT is a vector q with
// q . (n' - n) = 0 for every transition; the invariants are the null space of the stacked difference rows, and their
// dimension is (feature count) - rank. A lattice gas reaches Navier-Stokes (Frisch, Hasslacher, Pomeau 1986; Frisch,
// d'Humieres, Hasslacher, Lallemand, Pomeau, Rivet 1987) when its collision keeps the mass (q = 1) and the momentum
// (q = c, one per axis) and nothing else: any further invariant is spurious.
//
//   exactRank        the rank over Q of integer rows, fraction-free in BigInt, rows deduplicated
//   InvariantTable   rows n' - n collected from transitions, with the per-transition mass and momentum check and the
//                    invariant dimension
//   W(F4)            the 1,152 maps of R^4 that permute the 24 D4 roots, as slot permutations, generated from the 48
//                    F4 root reflections; the stabilizer of a momentum
//   fhpToy           the FHP hexagonal gas (Frisch, Hasslacher, Pomeau 1986) with head-on two-body collisions and the
//                    symmetric three-body one, in the integer hexagonal basis: the instrument's hand-checked toy
//
// DETERMINISM: no random numbers. EXACT: integer rows and BigInt elimination; nothing rounds.

import { rootsD4, rootsF4 } from '@/code/algebra/group/root-system'

const ROOTS = rootsD4()

// ---- exact rank over Q ----

const babs = (x: bigint): bigint => (x < 0n ? -x : x)

const bgcd = (a: bigint, b: bigint): bigint => {
  let x = babs(a)
  let y = babs(b)

  while (y !== 0n) {
    const t = x % y

    x = y
    y = t
  }

  return x
}

// an incremental echelon basis over Q: add() reduces a row against the pivots and keeps it when nonzero
export class ExactEchelon {
  readonly n: number
  readonly rows: bigint[][] = []
  readonly pivots: number[] = []

  constructor(n: number) {
    this.n = n
  }

  reduce(row: readonly (number | bigint)[]): bigint[] {
    const r: bigint[] = row.map(x => BigInt(x))

    for (let k = 0; k < this.rows.length; k++) {
      const p = this.pivots[k]!
      const f = r[p]!

      if (f === 0n) {
        continue
      }

      const b = this.rows[k]!
      const pv = b[p]!

      for (let c = 0; c < this.n; c++) {
        r[c] = r[c]! * pv - b[c]! * f
      }

      let g = 0n

      for (const x of r) {
        g = bgcd(g, x)
      }

      if (g > 1n) {
        for (let c = 0; c < this.n; c++) {
          r[c] = r[c]! / g
        }
      }
    }

    return r
  }

  add(row: readonly (number | bigint)[]): boolean {
    const r = this.reduce(row)
    const p = r.findIndex(x => x !== 0n)

    if (p < 0) {
      return false
    }

    this.rows.push(r)
    this.pivots.push(p)

    return true
  }

  get rank(): number {
    return this.rows.length
  }
}

// ---- a collision table read for its invariants ----

export type TableReading = {
  transitions: number
  // transitions whose n' differs from n
  moving: number
  distinctRows: number
  rank: number
  // feature count minus rank: the dimension of the collision invariants
  invariants: number
  // transitions that change the mass, and that change some momentum component
  massBroken: number
  momentumBroken: number
  // every one of the mass and momentum vectors annihilates every row (counted in massBroken / momentumBroken)
  massMomentumInvariant: boolean
}

export class InvariantTable {
  readonly n: number
  readonly mass: readonly number[]
  readonly momentum: readonly (readonly number[])[]
  private readonly echelon: ExactEchelon
  private readonly seen = new Set<string>()
  transitions = 0
  moving = 0
  massBroken = 0
  momentumBroken = 0

  // mass: the per-feature mass; momentum: one per-feature vector per axis
  constructor(
    mass: readonly number[],
    momentum: readonly (readonly number[])[],
  ) {
    this.n = mass.length
    this.mass = mass
    this.momentum = momentum
    this.echelon = new ExactEchelon(this.n)
  }

  add(before: ArrayLike<number>, after: ArrayLike<number>): void {
    this.transitions++

    const d = new Array<number>(this.n)

    let nonzero = false

    for (let c = 0; c < this.n; c++) {
      d[c] = (after[c] ?? 0) - (before[c] ?? 0)

      if (d[c] !== 0) {
        nonzero = true
      }
    }

    if (!nonzero) {
      return
    }

    this.moving++

    let dm = 0

    for (let c = 0; c < this.n; c++) {
      dm += this.mass[c]! * d[c]!
    }

    if (dm !== 0) {
      this.massBroken++
    }

    if (
      this.momentum.some(m => {
        let s = 0

        for (let c = 0; c < this.n; c++) {
          s += m[c]! * d[c]!
        }

        return s !== 0
      })
    ) {
      this.momentumBroken++
    }

    const key = d.join(',')

    if (this.seen.has(key)) {
      return
    }

    this.seen.add(key)
    this.echelon.add(d)
  }

  reading(): TableReading {
    return {
      transitions: this.transitions,
      moving: this.moving,
      distinctRows: this.seen.size,
      rank: this.echelon.rank,
      invariants: this.n - this.echelon.rank,
      massBroken: this.massBroken,
      momentumBroken: this.momentumBroken,
      massMomentumInvariant:
        this.massBroken === 0 && this.momentumBroken === 0,
    }
  }
}

// the D4 slot features: mass 1 on each slot, momentum the root's coordinates
export const SLOT_MASS: readonly number[] = ROOTS.map(() => 1)
export const SLOT_MOMENTUM: readonly (readonly number[])[] = [
  0, 1, 2, 3,
].map(a => ROOTS.map(r => r[a]!))

// the occupation momentum of a 24-slot occupation
export function occupationMomentum(n: ArrayLike<number>): number[] {
  const p = [0, 0, 0, 0]

  for (let d = 0; d < 24; d++) {
    const v = n[d]!

    if (v !== 0) {
      for (let a = 0; a < 4; a++) {
        p[a]! += v * ROOTS[d]![a]!
      }
    }
  }

  return p
}

// ---- W(F4) as slot permutations ----

const ROOT_INDEX = new Map(ROOTS.map((r, i) => [r.join(','), i]))

// the slot permutation of the reflection in an F4 root v: x -> x - 2 (x . v) / (v . v) v
function reflectionPermutation(v: readonly number[]): Int32Array {
  const vv = v.reduce((s, x) => s + x * x, 0)
  const out = new Int32Array(24)

  for (let d = 0; d < 24; d++) {
    const r = ROOTS[d]!
    const rv = r.reduce((s, x, k) => s + x * v[k]!, 0)
    const img = r.map((x, k) => x - ((2 * rv) / vv) * v[k]!)
    const e = ROOT_INDEX.get(img.join(','))

    if (e === undefined) {
      throw new Error('fchc-tables: a reflection left the D4 roots')
    }

    out[d] = e
  }

  return out
}

// every element of W(F4) as a slot permutation (out[d] is the slot d is carried to), by closure of the 48 reflections
export function weylF4Slots(): Int32Array[] {
  const gens = rootsF4().map(reflectionPermutation)
  const id = Int32Array.from({ length: 24 }, (_, d) => d)
  const seen = new Set<string>([id.join(',')])
  const out: Int32Array[] = [id]

  // the array iterator reads the length at every step, so elements pushed during the walk are visited too
  for (const g of out) {
    for (const s of gens) {
      const h = new Int32Array(24)

      for (let d = 0; d < 24; d++) {
        h[d] = s[g[d]!]!
      }

      const key = h.join(',')

      if (!seen.has(key)) {
        seen.add(key)
        out.push(h)
      }
    }
  }

  return out
}

// a slot permutation applied to an occupation: the content of slot d moves to slot g[d]
export function permuteOccupation(
  g: Int32Array,
  n: ArrayLike<number>,
): number[] {
  const out = new Array<number>(24).fill(0)

  for (let d = 0; d < 24; d++) {
    out[g[d]!] = n[d]!
  }

  return out
}

// the elements of a group (slot permutations) that fix a momentum p
export function stabilizerOf(
  group: readonly Int32Array[],
  p: readonly number[],
): Int32Array[] {
  return group.filter(g => {
    // g p = p, with g's matrix read from the images of four independent roots
    const img = [0, 0, 0, 0]
    const m = matrixOfSlots(g)

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        img[i]! += m[i]![j]! * p[j]!
      }
    }

    return img.every((x, i) => Math.abs(x - p[i]!) < 1e-9)
  })
}

// the 4 x 4 matrix of a slot permutation, read from the images of four independent roots (exact on half-integers)
export function matrixOfSlots(g: Int32Array): number[][] {
  // basis roots e1+e2, e1-e2, e3+e4, e3-e4 give e1 = (r_a + r_b) / 2 and so on
  const pick = (v: readonly number[]): number =>
    ROOT_INDEX.get(v.join(','))!
  const a = pick([1, 1, 0, 0])
  const b = pick([1, -1, 0, 0])
  const c = pick([0, 0, 1, 1])
  const e = pick([0, 0, 1, -1])
  const R = (d: number): readonly number[] => ROOTS[g[d]!]!
  const cols = [
    R(a).map((x, k) => (x + R(b)[k]!) / 2),
    R(a).map((x, k) => (x - R(b)[k]!) / 2),
    R(c).map((x, k) => (x + R(e)[k]!) / 2),
    R(c).map((x, k) => (x - R(e)[k]!) / 2),
  ]

  return [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => cols[j]![i]!))
}

// ---- the FHP toy ----

// the six FHP velocities in the integer hexagonal basis (e0 = (1, 0), e1 = (0, 1), e1 - e0, -e0, -e1, e0 - e1)
export const FHP_VELOCITIES: readonly (readonly number[])[] = [
  [1, 0],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [0, -1],
  [1, -1],
]

// the FHP collision as transitions on 6-bit occupations: head-on pairs {k, k + 3} to both rotations, and (when
// `triple`) the symmetric triples {0, 2, 4} <-> {1, 3, 5}
export function fhpToy(triple: boolean): TableReading {
  const t = new InvariantTable(
    FHP_VELOCITIES.map(() => 1),
    [0, 1].map(a => FHP_VELOCITIES.map(v => v[a]!)),
  )

  const occ = (bits: readonly number[]): number[] => {
    const n = new Array<number>(6).fill(0)

    for (const b of bits) {
      n[b] = 1
    }

    return n
  }

  for (let k = 0; k < 3; k++) {
    const from = occ([k, k + 3])

    t.add(from, occ([(k + 1) % 6, (k + 4) % 6]))
    t.add(from, occ([(k + 2) % 6, (k + 5) % 6]))
  }

  if (triple) {
    t.add(occ([0, 2, 4]), occ([1, 3, 5]))
    t.add(occ([1, 3, 5]), occ([0, 2, 4]))
  }

  return t.reading()
}

// every k-subset of 0 .. n - 1, in lexicographic order
export function subsets(n: number, k: number): number[][] {
  const out: number[][] = []
  const cur: number[] = []

  const go = (start: number): void => {
    if (cur.length === k) {
      out.push([...cur])

      return
    }

    for (let i = start; i < n; i++) {
      cur.push(i)
      go(i + 1)
      cur.pop()
    }
  }

  go(0)

  return out
}
