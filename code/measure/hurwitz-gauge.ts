// A NON-ABELIAN LINK REGISTER: THE BINARY TETRAHEDRAL GROUP 2T ON THE D4 MESH (E-SPN-0152). The 24 roots of D4 are the 24
// Hurwitz units (a linear isometry up to the factor 1/sqrt2 sends one set onto the other), and under quaternion
// multiplication they are 2T, a finite subgroup of SU(2). This module holds a 2T value on every link and carries what
// the question needs, each piece general enough to take the other finite subgroups of SU(2) (Q8, 2O, 2I) and the
// abelian reductions (Z2, Z3, the trivial group):
//
//   groups        2T built EXACTLY from the D4 roots (doubled integer coordinates), and Q8, 2O, 2I, Z_N and the trivial
//                 group by closure (floats), each with its product table, inverses and q0 = Re chi_f / d_f
//   characters    2T's seven irreps over Z[w] (1, 1', 1'', 2, 2', 2'', 3), built from the quotient 2T / Q8 = Z3 and the
//                 quaternion trace, never typed in, with exact row orthogonality
//   the beat      the electric piece E = sum_R lambda_R P_R (lambda_R = u^(C_R / 2), C_R the Cayley-graph Laplacian's
//                 eigenvalue on R, the Hamiltonian limit of the Wilson transfer matrix), exact in Z[w][1/42] with an exact
//                 unitarity check; the magnetic piece mu^(2 - chi_2(U_p)) per triangle, diagonal in the link values
//   the member    a colour charge carried as a real quaternion (the spinor 2 twice), moved across a link by left
//                 multiplication with entries in Z[1/2]: exact, and no i is needed (2T has no unitary 2 x 2 form over
//                 Q(w), see the experiment's derivation)
//   loop kernel   E_Haar[q0(holonomy)] of a closed word in independent uniform link values, by exact enumeration of the
//                 repeated variables (a variable used once averages the word to 0)
//   the toy       one triangle's three links as an explicit register (24^3 values) and a coined member on its three docks:
//                 the commutator and Gauss checks, and the reduced state under each piece
//   estimators    deterministic strong- and weak-coupling branches of the free energy (Euclidean, Wilson action) and of
//                 the ground energy (Hamiltonian, Kogut-Susskind form) on a lattice given by its neighbour vectors, their
//                 crossing (the freezing point of a finite group), and the static string's energy per link
//
// DETERMINISM: no random numbers anywhere; test vectors are Weyl sequences. EXACT: the group, its characters and the
// beat's entries are integers or Eisenstein integers over a stated denominator; amplitudes and free energies are float
// measurement. NOTHING MOVES: a link holds a value; the member's colour is rotated by the value of the link it takes.

import { ROOTS } from '@/code/measure/swap-sector'
import {
  eisConj,
  eisMul,
  eisValue,
  type Eis,
} from '@/code/measure/swap-cone'
import { type RingUnit } from '@/code/rule/swap-mixer'
import { rootLink, type WordSpace } from '@/code/measure/link-flux'

// ---- groups ----

export type GaugeGroup = {
  name: string
  order: number
  // table[a * order + b] = index of a b
  table: Int16Array
  inverse: Int16Array
  identity: number
  // Re chi_f(g) / d_f, the Wilson action's variable (the plaquette reads beta q0)
  q0: Float64Array
  // the fundamental's dimension and whether its character is real
  dFund: number
  fundReal: boolean
  // float quaternions for the SU(2) subgroups, null for the abelian reductions
  quat: number[][] | null
}

// the Hamilton product of two quaternions (w, x, y, z)
export const qmul = (
  a: readonly number[],
  b: readonly number[],
): number[] => [
  a[0]! * b[0]! - a[1]! * b[1]! - a[2]! * b[2]! - a[3]! * b[3]!,
  a[0]! * b[1]! + a[1]! * b[0]! + a[2]! * b[3]! - a[3]! * b[2]!,
  a[0]! * b[2]! - a[1]! * b[3]! + a[2]! * b[0]! + a[3]! * b[1]!,
  a[0]! * b[3]! + a[1]! * b[2]! - a[2]! * b[1]! + a[3]! * b[0]!,
]

// the root r of D4 as a doubled Hurwitz unit: 2 q = (r0 + r1, r0 - r1, r2 + r3, r2 - r3), an isometry up to 1/sqrt2
export const rootToDoubled = (r: readonly number[]): number[] => [
  r[0]! + r[1]!,
  r[0]! - r[1]!,
  r[2]! + r[3]!,
  r[2]! - r[3]!,
]

// exact product of doubled quaternions: 2 (a b) = (2a)(2b) / 2, every coordinate even by closure (checked)
function doubledMul(
  a: readonly number[],
  b: readonly number[],
): { q: number[]; exact: boolean } {
  const p = qmul(a, b)
  const exact = p.every(x => Number.isInteger(x) && x % 2 === 0)

  return { q: p.map(x => x / 2), exact }
}

export type HurwitzExact = {
  group: GaugeGroup
  // the doubled integer coordinates of each element (index as in group)
  doubled: number[][]
  // every root maps to a unit (norm 4 doubled), the 24 are distinct, and closure and every product are exact
  fromRoots: boolean
  closed: boolean
  exactProducts: boolean
}

export function hurwitzExact(): HurwitzExact {
  if (
    ROOTS.length !== 24 ||
    ROOTS.some(r => r.reduce((s, x) => s + x * x, 0) !== 2)
  ) {
    throw new Error(
      'hurwitz-gauge: ROOTS are not the 24 norm-2 roots of D4',
    )
  }

  const doubled = ROOTS.map(rootToDoubled)
  const key = (q: readonly number[]): string => q.join(',')
  const index = new Map(doubled.map((q, i) => [key(q), i]))
  const fromRoots =
    doubled.every(q => q.reduce((s, x) => s + x * x, 0) === 4) &&
    index.size === 24
  const n = 24
  const table = new Int16Array(n * n)

  let closed = true
  let exactProducts = true

  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      const { q, exact } = doubledMul(doubled[a]!, doubled[b]!)
      const c = index.get(key(q))

      if (!exact) {
        exactProducts = false
      }

      if (c === undefined) {
        closed = false
        table[a * n + b] = -1
      } else {
        table[a * n + b] = c
      }
    }
  }

  const identity = index.get('2,0,0,0') ?? -1
  const inverse = new Int16Array(n)

  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      if (table[a * n + b] === identity) {
        inverse[a] = b
      }
    }
  }

  const group: GaugeGroup = {
    name: '2T',
    order: n,
    table,
    inverse,
    identity,
    q0: Float64Array.from(doubled.map(q => q[0]! / 2)),
    dFund: 2,
    fundReal: true,
    quat: doubled.map(q => q.map(x => x / 2)),
  }

  return { group, doubled, fromRoots, closed, exactProducts }
}

// closure of unit quaternions under multiplication (floats, keyed at 1e-9), with a cap
export function quaternionGroup(
  name: string,
  generators: readonly (readonly number[])[],
  cap = 240,
): GaugeGroup {
  const key = (q: readonly number[]): string =>
    q.map(x => (Math.abs(x) < 5e-10 ? 0 : x).toFixed(8)).join(',')
  const elements: number[][] = [[1, 0, 0, 0]]
  const index = new Map<string, number>([[key([1, 0, 0, 0]), 0]])

  for (let i = 0; i < elements.length; i++) {
    for (const g of generators) {
      for (const p of [qmul(elements[i]!, g), qmul(g, elements[i]!)]) {
        const k = key(p)

        if (index.has(k)) {
          continue
        }

        index.set(k, elements.length)
        elements.push(p)

        if (elements.length > cap) {
          throw new Error(
            `hurwitz-gauge: ${name} closure passed ${cap}`,
          )
        }
      }
    }
  }

  const n = elements.length
  const table = new Int16Array(n * n)

  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      const c = index.get(key(qmul(elements[a]!, elements[b]!)))

      if (c === undefined) {
        throw new Error(`hurwitz-gauge: ${name} is not closed`)
      }

      table[a * n + b] = c
    }
  }

  const inverse = new Int16Array(n)

  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      if (table[a * n + b] === 0) {
        inverse[a] = b
      }
    }
  }

  return {
    name,
    order: n,
    table,
    inverse,
    identity: 0,
    q0: Float64Array.from(elements.map(q => q[0]!)),
    dFund: 2,
    fundReal: true,
    quat: elements,
  }
}

const PHI = (1 + Math.sqrt(5)) / 2

export const quaternionEight = (): GaugeGroup =>
  quaternionGroup('Q8', [
    [0, 1, 0, 0],
    [0, 0, 1, 0],
  ])

export const binaryOctahedral = (): GaugeGroup => {
  const t = hurwitzExact().group.quat!

  return quaternionGroup('2O', [
    ...t,
    [Math.SQRT1_2, Math.SQRT1_2, 0, 0],
  ])
}

// 2T and 1/2 (phi, 1/phi, 1, 0), an even permutation of the icosian 1/2 (0, 1, 1/phi, phi)
export const binaryIcosahedral = (): GaugeGroup => {
  const t = hurwitzExact().group.quat!

  return quaternionGroup('2I', [...t, [PHI / 2, 1 / PHI / 2, 1 / 2, 0]])
}

export function cyclicGroup(N: number): GaugeGroup {
  const table = new Int16Array(N * N)

  for (let a = 0; a < N; a++) {
    for (let b = 0; b < N; b++) {
      table[a * N + b] = (a + b) % N
    }
  }

  return {
    name: `Z${N}`,
    order: N,
    table,
    inverse: Int16Array.from({ length: N }, (_, a) => (N - a) % N),
    identity: 0,
    q0: Float64Array.from({ length: N }, (_, k) =>
      Math.cos((2 * Math.PI * k) / N),
    ),
    dFund: 1,
    fundReal: N <= 2,
    quat: null,
  }
}

export const trivialGroup = (): GaugeGroup => ({
  ...cyclicGroup(1),
  name: 'trivial',
})

// conjugacy classes (each a sorted list of indices, the identity's first)
export function conjugacyClasses(g: GaugeGroup): number[][] {
  const seen = new Int8Array(g.order)
  const out: number[][] = []

  for (let x = 0; x < g.order; x++) {
    if (seen[x]) {
      continue
    }

    const cls = new Set<number>()

    for (let h = 0; h < g.order; h++) {
      cls.add(
        g.table[g.table[h * g.order + x]! * g.order + g.inverse[h]!]!,
      )
    }

    for (const c of cls) {
      seen[c] = 1
    }

    out.push([...cls].sort((a, b) => a - b))
  }

  return out
}

// the elements nearest the identity (largest q0 below 1): the Cayley generators of the electric Laplacian
export function nearest(g: GaugeGroup): number[] {
  let top = -Infinity

  for (let x = 0; x < g.order; x++) {
    if (x !== g.identity && g.q0[x]! > top) {
      top = g.q0[x]!
    }
  }

  return [...Array(g.order).keys()].filter(
    x => x !== g.identity && Math.abs(g.q0[x]! - top) < 1e-9,
  )
}

// ---- 2T's characters over Z[w] ----

const W: Eis = [0n, 1n]
const W2: Eis = [-1n, -1n]
const ONE: Eis = [1n, 0n]
const eisAdd = (a: Eis, b: Eis): Eis => [a[0] + b[0], a[1] + b[1]]
const eisScale = (a: Eis, k: bigint): Eis => [a[0] * k, a[1] * k]

const eisPowN = (a: Eis, k: number): Eis => {
  let r: Eis = ONE

  for (let i = 0; i < k; i++) {
    r = eisMul(r, a)
  }

  return r
}

export type HurwitzCharacters = {
  names: string[]
  dims: number[]
  // chars[R][g], Eisenstein integers
  chars: Eis[][]
  // sum_g chi_R(g) conj(chi_S(g)) = 24 delta_RS, exactly
  orthogonal: boolean
  // the Z3 label of each element (its coset of Q8), and the order-6 generator used
  z3: number[]
}

export function hurwitzCharacters(h: HurwitzExact): HurwitzCharacters {
  const g = h.group
  const n = g.order
  const q8 = h.doubled.map(q => q.filter(x => x !== 0).length === 1)
  const g0 = h.doubled.findIndex(q => q.every(x => x === 1))
  const powers = [g.identity, g0, g.table[g0 * n + g0]!]
  const z3 = [...Array(n).keys()].map(x => {
    for (let k = 0; k < 3; k++) {
      if (q8[g.table[x * n + g.inverse[powers[k]!]!]!]) {
        return k
      }
    }

    throw new Error('hurwitz-gauge: an element in no coset of Q8')
  })
  const two = (x: number): Eis => [BigInt(h.doubled[x]![0]!), 0n]
  const one1 = (x: number): Eis => eisPowN(W, z3[x]!)
  const one2 = (x: number): Eis => eisPowN(W2, z3[x]!)
  const three = (x: number): Eis => [
    BigInt(h.doubled[x]![0]! ** 2 - 1),
    0n,
  ]
  const names = ['1', "1'", "1''", '2', "2'", "2''", '3']
  const dims = [1, 1, 1, 2, 2, 2, 3]
  const all = [...Array(n).keys()]
  const chars: Eis[][] = [
    all.map(() => ONE),
    all.map(one1),
    all.map(one2),
    all.map(two),
    all.map(x => eisMul(two(x), one1(x))),
    all.map(x => eisMul(two(x), one2(x))),
    all.map(three),
  ]

  let orthogonal = true

  for (let R = 0; R < 7; R++) {
    for (let S = 0; S < 7; S++) {
      let s: Eis = [0n, 0n]

      for (let x = 0; x < n; x++) {
        s = eisAdd(s, eisMul(chars[R]![x]!, eisConj(chars[S]![x]!)))
      }

      if (s[0] !== (R === S ? 24n : 0n) || s[1] !== 0n) {
        orthogonal = false
      }
    }
  }

  return { names, dims, chars, orthogonal, z3 }
}

// the Cayley-graph Laplacian's eigenvalue on each irrep: C_R = sum over the nearest elements s of (1 - Re chi_R(s) / d_R),
// exact as a rational (numerator over d_R), returned as numbers
export function hurwitzCasimirs(
  h: HurwitzExact,
  c: HurwitzCharacters,
): number[] {
  const S = nearest(h.group)

  return c.chars.map((ch, R) => {
    let s: Eis = [0n, 0n]

    for (const x of S) {
      s = eisAdd(s, ch[x]!)
    }

    // Re(a + b w) = a - b / 2
    return S.length - (Number(s[0]) - Number(s[1]) / 2) / c.dims[R]!
  })
}

// ---- the beat, exact ----

export type ElectricExact = {
  // e(x) numerators over den, the left-convolution kernel: (E psi)(g) = sum_h e(g h^-1) psi(h)
  num: Eis[]
  den: bigint
  exponents: number[]
  classFunction: boolean
  unitary: boolean
  // whether some entry needs 1/3 (a numerator not divisible by 3 in Z[w])
  needsThird: boolean
  float: [number, number][]
}

// E = sum_R u^(n_R) P_R, P_R = (d_R / 24) sum_g conj(chi_R(g)) L_g
export function electricExact(
  h: HurwitzExact,
  c: HurwitzCharacters,
  exponents: readonly number[],
  u: RingUnit,
): ElectricExact {
  const g = h.group
  const n = g.order
  const N = Math.max(...exponents)
  const uNum: Eis = [u.num[0], u.num[1]]
  const lam = exponents.map(k =>
    eisMul(eisPowN(uNum, k), [u.den ** BigInt(N - k), 0n]),
  )
  const den = 24n * u.den ** BigInt(N)
  const num: Eis[] = []

  for (let x = 0; x < n; x++) {
    let s: Eis = [0n, 0n]

    for (let R = 0; R < c.chars.length; R++) {
      s = eisAdd(
        s,
        eisScale(
          eisMul(lam[R]!, eisConj(c.chars[R]![x]!)),
          BigInt(c.dims[R]!),
        ),
      )
    }

    num.push(s)
  }

  let classFunction = true

  for (let x = 0; x < n; x++) {
    for (let k = 0; k < n; k++) {
      const y = g.table[g.table[k * n + x]! * n + g.inverse[k]!]!

      if (num[x]![0] !== num[y]![0] || num[x]![1] !== num[y]![1]) {
        classFunction = false
      }
    }
  }

  // (E E^dagger)_(a, b) = sum_k e(a k^-1) conj(e(b k^-1)) = den^2 delta_ab
  let unitary = true

  for (let a = 0; a < n && unitary; a++) {
    for (let b = 0; b < n; b++) {
      let s: Eis = [0n, 0n]

      for (let k = 0; k < n; k++) {
        s = eisAdd(
          s,
          eisMul(
            num[g.table[a * n + g.inverse[k]!]!]!,
            eisConj(num[g.table[b * n + g.inverse[k]!]!]!),
          ),
        )
      }

      if (s[0] !== (a === b ? den * den : 0n) || s[1] !== 0n) {
        unitary = false
        break
      }
    }
  }

  const needsThird = num.some(e => e[0] % 3n !== 0n || e[1] % 3n !== 0n)

  return {
    num,
    den,
    exponents: [...exponents],
    classFunction,
    unitary,
    needsThird,
    float: num.map(e => eisValue(e, den)),
  }
}

// the magnetic factor mu^(2 - chi_2(U)) for each value U of a face holonomy (chi_2 = 2 q0 an integer on 2T), exact
// numerators over den^4, and the amplitude one face leaves on the E = 0 register: (1 / 24) sum_g mu^(2 - chi_2(g))
export function magneticExact(
  h: HurwitzExact,
  mu: RingUnit,
): {
  num: Eis[]
  den: bigint
  kept: [number, number]
  keptWeight: number
  float: [number, number][]
} {
  const muNum: Eis = [mu.num[0], mu.num[1]]
  const num = h.doubled.map(q => {
    const k = 2 - q[0]!

    return eisMul(eisPowN(muNum, k), [mu.den ** BigInt(4 - k), 0n])
  })
  const den = mu.den ** 4n

  let s: Eis = [0n, 0n]

  for (const e of num) {
    s = eisAdd(s, e)
  }

  const kept = eisValue(s, 24n * den)

  return {
    num,
    den,
    kept,
    keptWeight: kept[0] * kept[0] + kept[1] * kept[1],
    float: num.map(e => eisValue(e, den)),
  }
}

// the member's colour transport: left multiplication by a doubled unit as a 4 x 4 integer matrix (twice the rotation),
// L2(a) L2(b) = 2 L2(ab) and L2 L2^T = 4 I checked over every pair
export function leftDoubled(q: readonly number[]): number[][] {
  const [a, b, c, d] = q as [number, number, number, number]

  return [
    [a, -b, -c, -d],
    [b, a, -d, c],
    [c, d, a, -b],
    [d, -c, b, a],
  ]
}

export function spinorExact(h: HurwitzExact): {
  homomorphism: boolean
  orthogonal: boolean
} {
  const mm = (x: number[][], y: number[][]): number[][] =>
    x.map(r =>
      [0, 1, 2, 3].map(j =>
        r.reduce((s, v, k) => s + v * y[k]![j]!, 0),
      ),
    )
  const n = h.group.order

  let homomorphism = true
  let orthogonal = true

  for (let a = 0; a < n; a++) {
    const A = leftDoubled(h.doubled[a]!)
    const AT = A.map((_, i) => A.map(r => r[i]!))

    if (
      mm(A, AT).some((r, i) =>
        r.some((v, j) => v !== (i === j ? 4 : 0)),
      )
    ) {
      orthogonal = false
    }

    for (let b = 0; b < n; b++) {
      const P = mm(A, leftDoubled(h.doubled[b]!))
      const C = leftDoubled(h.doubled[h.group.table[a * n + b]!]!)

      if (P.some((r, i) => r.some((v, j) => v !== 2 * C[i]![j]!))) {
        homomorphism = false
      }
    }
  }

  return { homomorphism, orthogonal }
}

// ---- the loop kernel ----

// a closed word: letters (variable, inverted), read left to right as the path order
export type Letter = { v: number; inv: boolean }

// free and cyclic reduction
export function reduceLoop(word: readonly Letter[]): Letter[] {
  const out: Letter[] = []

  for (const l of word) {
    const top = out[out.length - 1]

    if (top?.v === l.v && top.inv !== l.inv) {
      out.pop()
    } else {
      out.push(l)
    }
  }

  while (out.length >= 2) {
    const a = out[0]!
    const b = out[out.length - 1]!

    if (a.v === b.v && a.inv !== b.inv) {
      out.shift()
      out.pop()
    } else {
      break
    }
  }

  return out
}

// E over independent uniform link values of q0 of the word's product: 0 when a variable appears once (E[g] = 0 in every
// nontrivial irrep), else by exact enumeration of the repeated variables (at most `maxVars`)
export function loopKernel(
  g: GaugeGroup,
  word0: readonly Letter[],
  cache: Map<string, number>,
  maxVars = 4,
): number {
  if (g.order === 1) {
    return 1
  }

  const word = reduceLoop(word0)

  if (word.length === 0) {
    return 1
  }

  const label = new Map<number, number>()

  for (const l of word) {
    if (!label.has(l.v)) {
      label.set(l.v, label.size)
    }
  }

  const letters = word.map(l => ({ v: label.get(l.v)!, inv: l.inv }))
  const key = letters.map(l => `${l.v}${l.inv ? '-' : '+'}`).join('')
  const hit = cache.get(key)

  if (hit !== undefined) {
    return hit
  }

  const count = new Array(label.size).fill(0)

  for (const l of letters) {
    count[l.v]++
  }

  let value = 0

  if (!count.some(x => x === 1)) {
    const k = label.size

    if (k > maxVars) {
      throw new Error(
        `hurwitz-gauge: a loop with ${k} repeated variables`,
      )
    }

    const n = g.order
    const total = n ** k
    const x = new Array(k).fill(0)

    let s = 0

    for (let t = 0; t < total; t++) {
      let r = t

      for (let i = 0; i < k; i++) {
        x[i] = r % n
        r = Math.floor(r / n)
      }

      let p = g.identity

      for (const l of letters) {
        const e = l.inv
          ? g.inverse[x[l.v] as number]!
          : (x[l.v] as number)

        p = g.table[p * n + e]!
      }

      s += g.q0[p]!
    }

    value = s / total
  }

  cache.set(key, value)

  return value
}

// ---- a tied member averaged over a uniform (strong-coupling, E = 0) register ----
//
// The member's state in a fixed background U is sum over reduced words w of a(w, d) W_U(w) c: the coin and stream are
// colour-blind, a word is a path with its backtracks removed (a backtrack's holonomy is 1 in any group), so the tree
// amplitudes a (link-flux treeBeat at sigma 0) carry every group at once. Averaged over the E = 0 register (uniform on
// every link) with the colour averaged too, the dock distribution is
//     P(x) = sum_d sum_(w, w' -> x) Re[a(w, d) conj(a(w', d))] E[q0(W(w'^-1 w))]
// The kernel is the group's: 1 on every loop for the trivial group (the free D4 walk), 1 only on loops whose every link
// winds 0 mod 3 for Z3 (the tree of E-SPN-0150), and for 2T also on loops a Z3 register erases, such as a triangle run
// twice (E[q0(g^2)] = -1/2).

export function wordLoopLetters(
  s: WordSpace,
  i: number,
): { letters: Letter[]; key: string } {
  const letters: Letter[] = []
  const x = [0, 0, 0, 0]

  for (let k = 0; k < s.length[i]!; k++) {
    const d = s.letters[i * s.maxLength + k]!
    const { link, sign } = rootLink(x, d)

    letters.push({ v: link, inv: sign < 0 })

    for (let a = 0; a < 4; a++) {
      x[a] = x[a]! + ROOTS[d]![a]!
    }
  }

  return { letters, key: x.join(',') }
}

export function memberDistribution(
  s: WordSpace,
  re: Float64Array,
  im: Float64Array,
  g: GaugeGroup,
  cache: Map<string, number>,
): {
  P: Map<string, number>
  pairs: number
  tree: Map<string, number>
} {
  const byDock = new Map<string, { i: number; letters: Letter[] }[]>()

  for (let i = 0; i < s.words; i++) {
    let live = false

    for (let d = 0; d < 24; d++) {
      if (re[i * 24 + d] !== 0 || im[i * 24 + d] !== 0) {
        live = true
        break
      }
    }

    if (!live) {
      continue
    }

    const { letters, key } = wordLoopLetters(s, i)
    const list = byDock.get(key) ?? []

    list.push({ i, letters })
    byDock.set(key, list)
  }

  const P = new Map<string, number>()
  const tree = new Map<string, number>()

  let pairs = 0

  for (const [key, list] of byDock) {
    let total = 0
    let diag = 0

    for (let p = 0; p < list.length; p++) {
      const A = list[p] as { i: number; letters: Letter[] }

      for (let q = p; q < list.length; q++) {
        const B = list[q] as { i: number; letters: Letter[] }

        let dr = 0

        for (let d = 0; d < 24; d++) {
          const ar = re[A.i * 24 + d]!
          const ai = im[A.i * 24 + d]!
          const br = re[B.i * 24 + d]!
          const bi = im[B.i * 24 + d]!

          dr += ar * br + ai * bi
        }

        if (p === q) {
          total += dr
          diag += dr
          continue
        }

        pairs++

        if (dr === 0) {
          continue
        }

        // the loop: w, then w' back (reversed, each link inverted)
        const loop = [
          ...A.letters,
          ...[...B.letters]
            .reverse()
            .map(l => ({ v: l.v, inv: !l.inv })),
        ]

        total += 2 * dr * loopKernel(g, loop, cache)
      }
    }

    P.set(key, total)
    tree.set(key, diag)
  }

  return { P, pairs, tree }
}

// ---- the toy: one triangle with an explicit register and a coined member ----
//
// Docks A, B, C (0, 1, 2); links AB, BC, CA (0, 1, 2), link k the transporter from dock k to dock k + 1, with the gauge
// transformation U_k -> h_(k+1) U_k h_k^-1. The register value r = U_AB + 24 U_BC + 576 U_CA. The member: dock x, slot
// s (0 forward, 1 back), a real quaternion colour i (4); the amplitude complex. One beat: the rule's coin 2C = (1 + w) I
// + (1 - w) X on the slot, the stream (slot 0 to x + 1 across link x, colour L(U_x) c; slot 1 to x - 1 across link x - 1
// backward, colour L(U_(x-1)^-1) c), then the magnetic piece (a phase on r, from the face holonomy U_CA U_BC U_AB) and the
// electric piece (the class-function convolution on link AB), each when given.

export const TOY_REGISTER = 24 * 24 * 24
export const TOY_SIZE = TOY_REGISTER * 3 * 2 * 4

export type ToyPieces = {
  magnetic?: [number, number][]
  electric?: [number, number][]
}

export type Toy = {
  group: GaugeGroup
  left: number[][][]
  holonomy: Int16Array
}

export function toyTriangle(h: HurwitzExact): Toy {
  const g = h.group
  const n = g.order
  const left = h.doubled.map(q =>
    leftDoubled(q).map(r => r.map(x => x / 2)),
  )
  const holonomy = new Int16Array(TOY_REGISTER)

  for (let r = 0; r < TOY_REGISTER; r++) {
    const a = r % 24
    const b = Math.floor(r / 24) % 24
    const c = Math.floor(r / 576)

    holonomy[r] = g.table[g.table[c * n + b]! * n + a]!
  }

  return { group: g, left, holonomy }
}

const at = (r: number, x: number, s: number, i: number): number =>
  ((r * 3 + x) * 2 + s) * 4 + i

const COIN_A: [number, number] = [(1 + -0.5) / 2, Math.sqrt(3) / 4]
const COIN_B: [number, number] = [(1 + 0.5) / 2, -Math.sqrt(3) / 4]

export function toyWalk(
  t: Toy,
  re: Float64Array,
  im: Float64Array,
): { re: Float64Array; im: Float64Array } {
  const ore = new Float64Array(TOY_SIZE)
  const oim = new Float64Array(TOY_SIZE)
  const g = t.group

  for (let r = 0; r < TOY_REGISTER; r++) {
    const u = [r % 24, Math.floor(r / 24) % 24, Math.floor(r / 576)]

    for (let x = 0; x < 3; x++) {
      for (let i = 0; i < 4; i++) {
        const a0r = re[at(r, x, 0, i)]!
        const a0i = im[at(r, x, 0, i)]!
        const a1r = re[at(r, x, 1, i)]!
        const a1i = im[at(r, x, 1, i)]!
        // the coin
        const f: [number, number] = [
          COIN_A[0] * a0r -
            COIN_A[1] * a0i +
            COIN_B[0] * a1r -
            COIN_B[1] * a1i,
          COIN_A[0] * a0i +
            COIN_A[1] * a0r +
            COIN_B[0] * a1i +
            COIN_B[1] * a1r,
        ]
        const b: [number, number] = [
          COIN_B[0] * a0r -
            COIN_B[1] * a0i +
            COIN_A[0] * a1r -
            COIN_A[1] * a1i,
          COIN_B[0] * a0i +
            COIN_B[1] * a0r +
            COIN_A[0] * a1i +
            COIN_A[1] * a1r,
        ]
        // forward across link x
        const Lf = t.left[u[x]!]!
        const xf = (x + 1) % 3
        // back across link x - 1, inverted
        const kb = (x + 2) % 3
        const Lb = t.left[g.inverse[u[kb]!]!]!

        for (let j = 0; j < 4; j++) {
          const cf = Lf[j]![i]!
          const cb = Lb[j]![i]!

          if (cf !== 0) {
            ore[at(r, xf, 0, j)] = ore[at(r, xf, 0, j)]! + cf * f[0]
            oim[at(r, xf, 0, j)] = oim[at(r, xf, 0, j)]! + cf * f[1]
          }

          if (cb !== 0) {
            ore[at(r, kb, 1, j)] = ore[at(r, kb, 1, j)]! + cb * b[0]
            oim[at(r, kb, 1, j)] = oim[at(r, kb, 1, j)]! + cb * b[1]
          }
        }
      }
    }
  }

  return { re: ore, im: oim }
}

export function toyMagnetic(
  t: Toy,
  phase: readonly [number, number][],
  re: Float64Array,
  im: Float64Array,
): { re: Float64Array; im: Float64Array } {
  const ore = new Float64Array(TOY_SIZE)
  const oim = new Float64Array(TOY_SIZE)

  for (let r = 0; r < TOY_REGISTER; r++) {
    const [c, s] = phase[t.holonomy[r]!]!

    for (let k = r * 24; k < r * 24 + 24; k++) {
      ore[k] = re[k]! * c - im[k]! * s
      oim[k] = re[k]! * s + im[k]! * c
    }
  }

  return { re: ore, im: oim }
}

export function toyElectric(
  t: Toy,
  kernel: readonly [number, number][],
  re: Float64Array,
  im: Float64Array,
): { re: Float64Array; im: Float64Array } {
  const ore = new Float64Array(TOY_SIZE)
  const oim = new Float64Array(TOY_SIZE)
  const g = t.group
  const n = g.order

  for (let rest = 0; rest < 576; rest++) {
    for (let a = 0; a < 24; a++) {
      const r = a + 24 * rest

      for (let b = 0; b < 24; b++) {
        const [kr, ki] = kernel[g.table[a * n + g.inverse[b]!]!]!

        if (kr === 0 && ki === 0) {
          continue
        }

        const src = (b + 24 * rest) * 24

        for (let m = 0; m < 24; m++) {
          const xr = re[src + m]!
          const xi = im[src + m]!

          ore[r * 24 + m] = ore[r * 24 + m]! + kr * xr - ki * xi
          oim[r * 24 + m] = oim[r * 24 + m]! + kr * xi + ki * xr
        }
      }
    }
  }

  return { re: ore, im: oim }
}

export function toyBeat(
  t: Toy,
  p: ToyPieces,
  re: Float64Array,
  im: Float64Array,
): { re: Float64Array; im: Float64Array } {
  let s = toyWalk(t, re, im)

  if (p.magnetic) {
    s = toyMagnetic(t, p.magnetic, s.re, s.im)
  }

  if (p.electric) {
    s = toyElectric(t, p.electric, s.re, s.im)
  }

  return s
}

// the gauge transformation at dock v by element k: the link into v left-multiplied, the link out of v right-multiplied
// by k^-1, the member's colour at v rotated by L(k)
export function toyGauge(
  t: Toy,
  v: number,
  k: number,
  re: Float64Array,
  im: Float64Array,
): { re: Float64Array; im: Float64Array } {
  const g = t.group
  const n = g.order
  const ore = new Float64Array(TOY_SIZE)
  const oim = new Float64Array(TOY_SIZE)
  const into = (v + 2) % 3
  const out = v
  const L = t.left[k]!

  for (let r = 0; r < TOY_REGISTER; r++) {
    const u = [r % 24, Math.floor(r / 24) % 24, Math.floor(r / 576)]

    u[into] = g.table[k * n + u[into]!]!
    u[out] = g.table[u[out]! * n + g.inverse[k]!]!

    const r2 = u[0]! + 24 * u[1]! + 576 * u[2]!

    for (let x = 0; x < 3; x++) {
      for (let s = 0; s < 2; s++) {
        for (let i = 0; i < 4; i++) {
          if (x !== v) {
            ore[at(r2, x, s, i)] = re[at(r, x, s, i)]!
            oim[at(r2, x, s, i)] = im[at(r, x, s, i)]!
            continue
          }

          for (let j = 0; j < 4; j++) {
            const c = L[j]![i]!

            if (c === 0) {
              continue
            }

            ore[at(r2, x, s, j)] =
              ore[at(r2, x, s, j)]! + c * re[at(r, x, s, i)]!

            oim[at(r2, x, s, j)] =
              oim[at(r2, x, s, j)]! + c * im[at(r, x, s, i)]!
          }
        }
      }
    }
  }

  return { re: ore, im: oim }
}

// the member's reduced state (24 x 24: dock, slot, colour), the register traced out, as re and im
export function toyReduced(
  re: Float64Array,
  im: Float64Array,
): Float64Array {
  const out = new Float64Array(1152)

  for (let r = 0; r < TOY_REGISTER; r++) {
    const o = r * 24

    for (let a = 0; a < 24; a++) {
      const ar = re[o + a]!
      const ai = im[o + a]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let b = 0; b < 24; b++) {
        const br = re[o + b]!
        const bi = im[o + b]!

        out[a * 24 + b] = out[a * 24 + b]! + ar * br + ai * bi
        out[576 + a * 24 + b] =
          out[576 + a * 24 + b]! + ai * br - ar * bi
      }
    }
  }

  return out
}

// a deterministic Weyl vector (n alpha mod 1, alpha = sqrt2 and sqrt3, centred), normalized
export function weylVector(size: number): {
  re: Float64Array
  im: Float64Array
} {
  const re = new Float64Array(size)
  const im = new Float64Array(size)

  let s = 0

  for (let k = 0; k < size; k++) {
    re[k] = (((k + 1) * Math.SQRT2) % 1) - 0.5
    im[k] = (((k + 1) * Math.sqrt(3)) % 1) - 0.5
    s += re[k]! ** 2 + im[k]! ** 2
  }

  const f = 1 / Math.sqrt(s)

  for (let k = 0; k < size; k++) {
    re[k] = re[k]! * f
    im[k] = im[k]! * f
  }

  return { re, im }
}

export const vectorGap = (
  a: { re: Float64Array; im: Float64Array },
  b: { re: Float64Array; im: Float64Array },
): number => {
  let s = 0

  for (let k = 0; k < a.re.length; k++) {
    s += (a.re[k]! - b.re[k]!) ** 2 + (a.im[k]! - b.im[k]!) ** 2
  }

  return Math.sqrt(s)
}

// ---- lattices given by their neighbour vectors ----

export type PlaquetteLattice = {
  name: string
  // per dock
  links: number
  plaquettes: number
  // the plaquettes on a link, per link class (a class: the links along one neighbour vector up to sign), and the number
  // of links of each class per dock
  classes: { vector: number[]; perLink: number; count: number }[]
  perimeter: number
  // Euclidean strong coupling: the smallest closed surfaces (faces F), how many per plaquette, and the decorations of
  // one plaquette of a planar minimal surface (a surface that replaces 1 face by F - 1 others), with its weight power
  closedFaces: number
  closedPerPlaquette: number
  decorations: number
  decorationPower: number
}

const vdot = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((s, x, k) => s + x * b[k]!, 0)
const vsub = (a: readonly number[], b: readonly number[]): number[] =>
  a.map((x, k) => x - b[k]!)
const vkey = (v: readonly number[]): string => v.join(',')

// the triangle 2-complex of a lattice whose neighbour set R is closed under negation: triangles {x, x + u, x + v} with
// u, v, v - u in R; tetrahedra (four docks pairwise neighbours) are its closed surfaces
export function triangleLattice(
  name: string,
  R: readonly (readonly number[])[],
): PlaquetteLattice {
  const has = new Set(R.map(vkey))

  let ordered = 0

  for (const u of R) {
    for (const v of R) {
      if (has.has(vkey(vsub(v, u)))) {
        ordered++
      }
    }
  }

  const plaquettes = ordered / 6
  const classes: {
    vector: number[]
    perLink: number
    count: number
  }[] = []
  const seen = new Set<string>()

  for (const r of R) {
    const neg = r.map(x => -x)

    if (seen.has(vkey(neg))) {
      continue
    }

    seen.add(vkey(r))

    const perLink = R.filter(b => has.has(vkey(vsub(b, r)))).length
    const same = classes.find(
      c =>
        c.perLink === perLink &&
        vdot(c.vector, c.vector) === vdot(r, r),
    )

    if (same) {
      same.count++
    } else {
      classes.push({ vector: [...r], perLink, count: 1 })
    }
  }

  // tetrahedra on a triangle {0, u, v}: y in R with y - u, y - v in R; the same for every triangle (checked)
  const tets = new Set<number>()

  for (const u of R) {
    for (const v of R) {
      if (!has.has(vkey(vsub(v, u)))) {
        continue
      }

      tets.add(
        R.filter(
          y => has.has(vkey(vsub(y, u))) && has.has(vkey(vsub(y, v))),
        ).length,
      )
    }
  }

  // (NaN when triangles differ: the Euclidean branches are then not defined for this lattice)
  const perTriangle = tets.size === 1 ? [...tets][0]! : NaN

  return {
    name,
    links: R.length / 2,
    plaquettes,
    classes,
    perimeter: 3,
    closedFaces: 4,
    closedPerPlaquette: perTriangle / 4,
    decorations: perTriangle,
    decorationPower: 2,
  }
}

export function hypercubicLattice(d: number): PlaquetteLattice {
  const choose3 = (d * (d - 1) * (d - 2)) / 6
  const choose2 = (d * (d - 1)) / 2

  return {
    name: `hypercubic ${d}d`,
    links: d,
    plaquettes: choose2,
    classes: [
      {
        vector: [1, ...new Array(d - 1).fill(0)],
        perLink: 2 * (d - 1),
        count: d,
      },
    ],
    perimeter: 4,
    closedFaces: 6,
    closedPerPlaquette: choose3 / choose2,
    decorations: 2 * (d - 2),
    decorationPower: 4,
  }
}

// the husk's link directions: the 6 cubic axes and the 12 face diagonals (code/measure/photon-husk), each one link
export function huskVectors(): number[][] {
  const out: number[][] = []

  for (let a = 0; a < 3; a++) {
    for (const s of [-1, 1]) {
      const v = [0, 0, 0]

      v[a] = s
      out.push(v)
    }
  }

  for (let a = 0; a < 3; a++) {
    for (let b = a + 1; b < 3; b++) {
      for (const s of [-1, 1]) {
        for (const t of [-1, 1]) {
          const v = [0, 0, 0]

          v[a] = s
          v[b] = t
          out.push(v)
        }
      }
    }
  }

  return out
}

// ---- Euclidean branches (Wilson action S = -beta sum_p q0(U_p), Haar-normalized) ----

// a_0 = (1 / |G|) sum_g e^(beta q0) and u = <q0> in that weight (= a_f / (d_f a_0) for a real fundamental)
export function characterWeights(
  g: GaugeGroup,
  beta: number,
): { a0: number; u: number; top: number } {
  let top = -Infinity

  for (let x = 0; x < g.order; x++) {
    top = Math.max(top, beta * g.q0[x]!)
  }

  let s = 0
  let m = 0

  for (let x = 0; x < g.order; x++) {
    const w = Math.exp(beta * g.q0[x]! - top)

    s += w
    m += w * g.q0[x]!
  }

  return { a0: s / g.order, u: m / s, top }
}

// f^{*F}(1) / a_0^F = sum_R d_R^(2 - F) (a_R / a_0)^F: a closed genus-0 surface of F faces, by F-fold convolution on
// the group (no character table needed)
export function sphereSum(
  g: GaugeGroup,
  beta: number,
  F: number,
): number {
  const n = g.order
  const { top, a0 } = characterWeights(g, beta)
  const f = Float64Array.from(
    g.q0,
    q => Math.exp(beta * q - top) / (n * a0),
  )

  let c = Float64Array.from(f)

  for (let k = 1; k < F; k++) {
    const next = new Float64Array(n)

    for (let x = 0; x < n; x++) {
      const cx = c[x]!

      if (cx === 0) {
        continue
      }

      for (let y = 0; y < n; y++) {
        next[g.table[x * n + y]!] =
          next[g.table[x * n + y]!]! + cx * f[y]!
      }
    }

    c = next
  }

  // c is the F-fold convolution of f / a0 as a probability measure; its value at 1 times |G| is the sphere sum
  return c[g.identity]! * n
}

// ln Z per plaquette on each branch
export function euclideanBranches(
  g: GaugeGroup,
  L: PlaquetteLattice,
  beta: number,
): {
  strong: number
  weak: number
  strongCorrection: number
  weakCorrection: number
} {
  const { a0, top } = characterWeights(g, beta)
  const strongCorrection =
    L.closedPerPlaquette * Math.log(sphereSum(g, beta, L.closedFaces))
  const strong = Math.log(a0) + top + strongCorrection
  // one link set to x in a gauge-fixed frozen field changes every plaquette on it by beta (1 - q0(x))
  const perLink =
    L.classes.reduce((s, c) => s + c.count * c.perLink, 0) / L.links

  let z = 0

  for (let x = 0; x < g.order; x++) {
    z += Math.exp(-perLink * beta * (1 - g.q0[x]!))
  }

  const weakCorrection = (L.links / L.plaquettes) * Math.log(z)
  const weak =
    beta -
    ((L.links - 1) / L.plaquettes) * Math.log(g.order) +
    weakCorrection

  return { strong, weak, strongCorrection, weakCorrection }
}

// the freezing point: the crossing of the two branches where both expansions hold best. Each branch crosses the other
// again where it is out of its range: the weak branch's independent-link gas counts every link as free at small beta,
// and the strong branch's independent closed surfaces add (closed per plaquette) ln |G| at large beta, where every
// sphere sum reaches |G|. So every sign change of (weak - strong) on the scan is found by bisection, and the one whose
// larger correction, max(|strong correction|, |weak correction|), is least is returned, with that correction as the
// estimator's own validity figure. The plaquette on each branch there (d lnZ / d beta, a symmetric difference) and u.
export type EuclideanCrossing = {
  beta: number
  u: number
  plaquetteStrong: number
  plaquetteWeak: number
  sigmaLead: number
  sigmaCorrection: number
  correction: number
  roots: number
}

export function euclideanFreezing(
  g: GaugeGroup,
  L: PlaquetteLattice,
  betaMax = 20,
  step = 0.01,
): EuclideanCrossing | null {
  const diff = (b: number): number => {
    const r = euclideanBranches(g, L, b)

    return r.weak - r.strong
  }

  const roots: number[] = []

  let prev = diff(step)

  for (let k = 2; k * step <= betaMax; k++) {
    const b = k * step
    const cur = diff(b)

    if (prev < 0 !== cur < 0) {
      let a = b - step
      let c = b

      const sa = prev < 0

      for (let i = 0; i < 80; i++) {
        const m = (a + c) / 2

        if (diff(m) < 0 === sa) {
          a = m
        } else {
          c = m
        }
      }

      roots.push((a + c) / 2)
    }

    prev = cur
  }

  if (roots.length === 0) {
    return null
  }

  const worst = (b: number): number => {
    const r = euclideanBranches(g, L, b)

    return Math.max(
      Math.abs(r.strongCorrection),
      Math.abs(r.weakCorrection),
    )
  }

  const lo = roots.reduce(
    (best, b) => (worst(b) < worst(best) ? b : best),
    roots[0]!,
  )
  const h = 1e-5
  const ds =
    (euclideanBranches(g, L, lo + h).strong -
      euclideanBranches(g, L, lo - h).strong) /
    (2 * h)
  const dw =
    (euclideanBranches(g, L, lo + h).weak -
      euclideanBranches(g, L, lo - h).weak) /
    (2 * h)
  const { u } = characterWeights(g, lo)

  return {
    beta: lo,
    u,
    plaquetteStrong: ds,
    plaquetteWeak: dw,
    sigmaLead: -Math.log(u),
    sigmaCorrection: L.decorations * u ** L.decorationPower,
    correction: worst(lo),
    roots: roots.length,
  }
}

// ---- Hamiltonian branches (Kogut-Susskind form, electric in units of the fundamental's Laplacian eigenvalue) ----
//
// H = sum_links C(R_l) / C_f - y sum_p Re chi_f(U_p). Strong coupling (the E = 0 register): E_0 = -y^2 E[(Re chi_f)^2] /
// perimeter per plaquette at second order. Frozen (every U_p = 1, gauge-symmetrized): E = -y d_f P + sum_links (|S| /
// C_f - sum_s C_f^-2 / (n_p y (d_f - Re chi_f(s)))), the second order from one link moved to a nearest element s, which
// turns its n_p plaquettes. The static string (fundamental on a straight run of links, SU(2) subgroups): a plaquette on
// a string link sends it to 2 x 2 = 1 + 3 with weights 1/4 and 3/4 at energies perimeter - 2 and perimeter - 2 + C_3/C_2
// against the vacuum's one excitation at the perimeter, so its energy per link is 1 - y^2 n_p (1/4 / E_1 + 3/4 / E_3 -
// 1 / perimeter).

export type HamiltonianData = {
  S: number[]
  C2: number
  C3: number
  meanSquare: number
  tensorOk: boolean
}

export function hamiltonianData(g: GaugeGroup): HamiltonianData {
  const S = nearest(g)
  const chi = (x: number): number => g.dFund * g.q0[x]!
  const C2 = S.reduce((s, x) => s + 1 - chi(x) / g.dFund, 0)
  const chi3 = (x: number): number => 4 * g.q0[x]! ** 2 - 1
  const C3 = S.reduce((s, x) => s + 1 - chi3(x) / 3, 0)

  let ms = 0
  let m23 = 0
  let m33 = 0

  for (let x = 0; x < g.order; x++) {
    ms += chi(x) ** 2
    m23 += chi(x) ** 2 * chi3(x)
    m33 += chi3(x) ** 2
  }

  // for an SU(2) subgroup: 3 appears once in 2 x 2 and is irreducible
  const tensorOk =
    g.dFund === 2 &&
    Math.abs(m23 / g.order - 1) < 1e-9 &&
    Math.abs(m33 / g.order - 1) < 1e-9

  // E_Haar[(Re chi_f)^2]: 1 for a real fundamental, 1/2 for a complex one (chi and its conjugate each excite once)
  return { S, C2, C3, meanSquare: ms / g.order, tensorOk }
}

export function hamiltonianBranches(
  g: GaugeGroup,
  H: HamiltonianData,
  L: PlaquetteLattice,
  y: number,
): {
  confined: number
  frozen: number
  frozenSecond: number
  frozenElectric: number
} {
  const confined = (-L.plaquettes * y * y * H.meanSquare) / L.perimeter

  let frozenElectric = 0
  let frozenSecond = 0

  for (const c of L.classes) {
    frozenElectric += (c.count * H.S.length) / H.C2

    for (const s of H.S) {
      frozenSecond -=
        c.count /
        (H.C2 * H.C2 * c.perLink * y * (g.dFund - g.dFund * g.q0[s]!))
    }
  }

  return {
    confined,
    frozen: -y * g.dFund * L.plaquettes + frozenElectric + frozenSecond,
    frozenSecond,
    frozenElectric,
  }
}

// the least y (in the range where the frozen branch's second order is under half its zeroth-order electric energy) at
// which the frozen branch's energy falls below the confined one's
export function hamiltonianFreezing(
  g: GaugeGroup,
  H: HamiltonianData,
  L: PlaquetteLattice,
  yMax = 20,
  step = 1e-3,
): { y: number; yValid: number } | null {
  const diff = (y: number): number => {
    const b = hamiltonianBranches(g, H, L, y)

    return b.frozen - b.confined
  }

  let yValid = step

  while (yValid < yMax) {
    const b = hamiltonianBranches(g, H, L, yValid)

    if (-b.frozenSecond <= b.frozenElectric / 2) {
      break
    }

    yValid += step
  }

  if (diff(yValid) <= 0) {
    return { y: NaN, yValid }
  }

  for (let y = yValid; y <= yMax; y += step) {
    if (diff(y) <= 0) {
      let a = y - step
      let c = y

      for (let i = 0; i < 80; i++) {
        const m = (a + c) / 2

        if (diff(m) <= 0) {
          c = m
        } else {
          a = m
        }
      }

      return { y: (a + c) / 2, yValid }
    }
  }

  return null
}

// the static string's energy per link at second order along a link of the class with n_p plaquettes: 1 - s y^2
export function stringSlope(
  H: HamiltonianData,
  perimeter: number,
  perLink: number,
): number {
  const E1 = perimeter - 2
  const E3 = perimeter - 2 + H.C3 / H.C2

  return perLink * (0.25 / E1 + 0.75 / E3 - H.meanSquare / perimeter)
}
