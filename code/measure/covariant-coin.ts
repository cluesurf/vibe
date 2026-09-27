// Which coins a line of the doublet-locked knit allows (E-SPN-0090): the knit's symmetries computed on a line's
// slot space, the commutant each leaves, the integer coins in Z[omega], and the one conserved law that forbids them.
//
// THE SPACE. A line l of a dock has two slots (the root r and the root -r). Under the lock a vibe on l holds the label
// e0 (the first slot, copied +r), e1 (the second slot, copied -r), or o (the role's scalar line, which no piece writes).
// V_l = span(e0, e1, o).
//
// THE GROUPS, as the knit realizes them (not assumed):
//  - W(F4), all 1,152 elements, act on a dock's 24 slots by PERMUTATION (code/measure/coin-symmetry closes the 48 F4
//    root reflections on the D4 roots). The stabilizer of l keeps r (acts on V_l as the identity) or sends r to -r
//    (swaps e0 and e1, fixes o)
//  - the comoving role frame acts on a vibe's POINT and on the links, never on its slot: the lock's stream reads the
//    slot only (code/rule/doublet-locked-knit's target table has one entry per slot). So on V_l it is the identity
//  - charge conjugation under the adopted convention C: a fear's step table is a love's, so the identity on V_l
//    (under the variant C' it is the swap)
//  - motion reversal T = S R K: R is the -1 map on every dock (the swap on every V_l doublet) and K the complex
//    conjugation. A coin C is T-symmetric when R conj(C) R = C^-1
//  - the lattice momentum P = sum over vibes of the vibe's root. Every piece of the knit keeps it: the stream keeps
//    every slot, the lone-bounce collision fixes P (checked here on all 2^24 dock occupations), the meeting exchanges
//    points, the pair move turns a love and a fear on one line (momentum 0) into a store. So e^(i p . P) is a
//    symmetry for every p, whose generator on V_l is diag(1, -1, 0) (times p . r)
//
// Exact integers throughout: permutation matrices, rational elimination, Eisenstein integers a + b w. The band
// readings at the end (curvature, top speed) are measurement and use floats.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { bouncePermutation, BOUNCE_TABLE } from '@/code/rule/bounce-pair-knit'
import { unitRotations } from '@/code/measure/token-gates'

const ROOTS = rootsD4()

export type IntMatrix = number[][]

// ---- the groups ----

export function weylF4(): number[][] {
  return weylF4DirectionPermutations({ directions: ROOTS })
}

export type LineGroup = { line: number; first: number; second: number; order: number; keep: number; reverse: number; elements: number[][] }

// the stabilizer of each of the twelve lines in W(F4)
export function lineGroups(group: readonly number[][]): LineGroup[] {
  return LINE_FIRSTS.map((first, line) => {
    const second = OPPOSITE[first] as number
    const elements = group.filter(g => g[first] === first || g[first] === second)

    return { line, first, second, order: elements.length, keep: elements.filter(g => g[first] === first).length, reverse: elements.filter(g => g[first] === second).length, elements }
  })
}

// the element's action on V_l = (e0, e1, o)
export function labelMatrix(g: readonly number[], lg: LineGroup): IntMatrix {
  if (g[lg.first] === lg.first) {
    if (g[lg.second] !== lg.second) throw new Error('covariant-coin: a line element keeps r but moves -r')

    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]
  }

  return [
    [0, 1, 0],
    [1, 0, 0],
    [0, 0, 1],
  ]
}

export const SWAP: IntMatrix = [
  [0, 1, 0],
  [1, 0, 0],
  [0, 0, 1],
]
export const MOMENTUM: IntMatrix = [
  [1, 0, 0],
  [0, -1, 0],
  [0, 0, 0],
]
export const IDENTITY3: IntMatrix = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
]

// ---- the commutant, by exact rational elimination ----

// the solutions M (n x n) of M g = g M for every g: the null space of the stacked linear system in the n^2 entries,
// computed with fraction-free integer elimination (entries stay small here). Returns its dimension and a basis.
export function commutant(mats: readonly IntMatrix[], n: number): { dimension: number; basis: IntMatrix[] } {
  const rows: bigint[][] = []

  for (const g of mats) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        // (M g - g M)_ij = sum_k M_ik g_kj - g_ik M_kj
        const row = new Array<bigint>(n * n).fill(0n)

        for (let k = 0; k < n; k++) {
          row[i * n + k] = (row[i * n + k] as bigint) + BigInt(g[k]![j]!)
          row[k * n + j] = (row[k * n + j] as bigint) - BigInt(g[i]![k]!)
        }

        if (row.some(x => x !== 0n)) rows.push(row)
      }
    }
  }

  const m = n * n
  const pivots: number[] = []
  let r = 0

  for (let c = 0; c < m && r < rows.length; c++) {
    const p = rows.findIndex((row, k) => k >= r && row[c] !== 0n)

    if (p < 0) continue

    ;[rows[r], rows[p]] = [rows[p]!, rows[r]!]

    const pr = rows[r]!

    for (let k = 0; k < rows.length; k++) {
      if (k === r || rows[k]![c] === 0n) continue

      const f = rows[k]![c]!
      const e = pr[c]!

      rows[k] = rows[k]!.map((x, t) => x * e - (pr[t] as bigint) * f)

      const gg = rows[k]!.reduce((a, x) => gcd(a, x < 0n ? -x : x), 0n)

      if (gg > 1n) rows[k] = rows[k]!.map(x => x / gg)
    }

    pivots.push(c)
    r++
  }

  const free = Array.from({ length: m }, (_, c) => c).filter(c => !pivots.includes(c))
  const basis: IntMatrix[] = free.map(f => {
    // set the free variable f to the lcm of the pivots, solve for each pivot
    const lcm = pivots.reduce((a, c, k) => lcmOf(a, abs(rows[k]![c]!)), 1n)
    const x = new Array<bigint>(m).fill(0n)

    x[f] = lcm
    pivots.forEach((c, k) => {
      x[c] = -((rows[k]![f] as bigint) * lcm) / (rows[k]![c] as bigint)
    })

    const gg = x.reduce((a, v) => gcd(a, abs(v)), 0n)

    return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => Number((x[i * n + j] as bigint) / (gg || 1n))))
  })

  return { dimension: free.length, basis }
}

const abs = (x: bigint): bigint => (x < 0n ? -x : x)

function gcd(a: bigint, b: bigint): bigint {
  let x = a
  let y = b

  while (y !== 0n) [x, y] = [y, x % y]

  return x
}

const lcmOf = (a: bigint, b: bigint): bigint => (a === 0n || b === 0n ? a || b : (a / gcd(a, b)) * b)

export const multiply = (a: IntMatrix, b: IntMatrix): IntMatrix => a.map(row => b[0]!.map((_, j) => row.reduce((s, v, k) => s + v * b[k]![j]!, 0)))

export const commutes = (a: IntMatrix, b: IntMatrix): boolean => {
  const x = multiply(a, b)
  const y = multiply(b, a)

  return x.every((row, i) => row.every((v, j) => v === y[i]![j]))
}

// does a commutant basis element move weight between the doublet and o (entries (0|1, 2) or (2, 0|1))?
export const mixesRest = (m: IntMatrix): boolean => m[0]![2] !== 0 || m[1]![2] !== 0 || m[2]![0] !== 0 || m[2]![1] !== 0

// does it mix e0 and e1 (an off-diagonal doublet entry)?
export const mixesDoublet = (m: IntMatrix): boolean => m[0]![1] !== 0 || m[1]![0] !== 0

// ---- the 24-slot dock: W(F4)'s commutant by orbitals, and with the momentum ----

// the number of W(F4) orbits on ordered slot pairs (the commutant dimension of the permutation representation,
// Burnside: (1 / |G|) sum fix(g)^2), and the orbitals named by the two roots' inner product
export function dockOrbitals(group: readonly number[][]): { burnside: number; orbitals: { inner: number; pairs: number }[] } {
  let sum = 0

  for (const g of group) {
    let fix = 0

    for (let d = 0; d < 24; d++) if (g[d] === d) fix++

    sum += fix * fix
  }

  const orbit = new Map<string, number>()

  for (let d = 0; d < 24; d++) {
    for (let e = 0; e < 24; e++) {
      let key = ''

      for (const g of group) {
        const k = `${g[d]},${g[e]}`

        if (key === '' || k < key) key = k
      }

      orbit.set(key, (orbit.get(key) ?? 0) + 1)
    }
  }

  const inner = (d: number, e: number): number => ROOTS[d]!.reduce((s, x, k) => s + x * ROOTS[e]![k]!, 0)
  const orbitals = [...orbit.keys()].map(key => {
    const [d, e] = key.split(',').map(Number) as [number, number]

    return { inner: inner(d, e), pairs: orbit.get(key) ?? 0 }
  })

  return { burnside: sum / group.length, orbitals: orbitals.sort((a, b) => b.inner - a.inner) }
}

// ---- the momentum, exhaustively: the lone-bounce collision keeps P on every dock occupation ----

export function collisionKeepsMomentum(): { occupations: number; broken: number; acting: number } {
  const vibe = new Int8Array(24)
  const out = new Int32Array(24)
  const r0 = Int32Array.from(ROOTS, r => r[0]!)
  const r1 = Int32Array.from(ROOTS, r => r[1]!)
  const r2 = Int32Array.from(ROOTS, r => r[2]!)
  const r3 = Int32Array.from(ROOTS, r => r[3]!)
  let broken = 0
  let acting = 0

  for (let mask = 0; mask < 1 << 24; mask++) {
    for (let d = 0; d < 24; d++) vibe[d] = (mask >> d) & 1

    const kind = bouncePermutation(BOUNCE_TABLE, 'lone', vibe, 0, out)

    if (kind === 0) continue

    acting++

    let p0 = 0
    let p1 = 0
    let p2 = 0
    let p3 = 0

    for (let d = 0; d < 24; d++) {
      if (!vibe[d]) continue

      const t = out[d] as number

      p0 += (r0[t] as number) - (r0[d] as number)
      p1 += (r1[t] as number) - (r1[d] as number)
      p2 += (r2[t] as number) - (r2[d] as number)
      p3 += (r3[t] as number) - (r3[d] as number)
    }

    if (p0 !== 0 || p1 !== 0 || p2 !== 0 || p3 !== 0) broken++
  }

  return { occupations: 1 << 24, broken, acting }
}

// ---- Eisenstein integers a + b w, w^2 = -1 - w ----

export type Eis = readonly [number, number]

export const eMul = (x: Eis, y: Eis): Eis => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0] - x[1] * y[1]]
export const eAdd = (x: Eis, y: Eis): Eis => [x[0] + y[0], x[1] + y[1]]
export const eSub = (x: Eis, y: Eis): Eis => [x[0] - y[0], x[1] - y[1]]
// conj(a + b w) = a + b w^2 = (a - b) - b w
export const eConj = (x: Eis): Eis => [x[0] - x[1], -x[1]]
export const eZero = (x: Eis): boolean => x[0] === 0 && x[1] === 0
export const eEq = (x: Eis, y: Eis): boolean => x[0] === y[0] && x[1] === y[1]

// the six units, with their angle in units of pi / 3
export const UNITS: readonly { value: Eis; sixths: number; name: string }[] = [
  { value: [1, 0], sixths: 0, name: '1' },
  { value: [1, 1], sixths: 1, name: '-w^2' },
  { value: [0, 1], sixths: 2, name: 'w' },
  { value: [-1, 0], sixths: 3, name: '-1' },
  { value: [-1, -1], sixths: 4, name: 'w^2' },
  { value: [0, -1], sixths: 5, name: '-w' },
]

export type CoinClass = {
  // alpha on e0 + e1, beta on e0 - e1 (alpha = 1 fixes the overall phase); 2C = (alpha + beta) I + (alpha - beta) X
  alpha: Eis
  beta: Eis
  name: string
  // the angle of alpha / beta, in units of pi / 3, in (-3, 3]
  theta: number
  twoC: Eis[][]
  unitary: boolean
  timeSymmetric: boolean
  commutesSwap: boolean
  commutesMomentum: boolean
  mixes: boolean
  classical: boolean
}

// 2x2 Eisenstein matrices
const mul2 = (a: Eis[][], b: Eis[][]): Eis[][] => [0, 1].map(i => [0, 1].map(j => eAdd(eMul(a[i]![0]!, b[0]![j]!), eMul(a[i]![1]!, b[1]![j]!))))
const dag2 = (a: Eis[][]): Eis[][] => [0, 1].map(i => [0, 1].map(j => eConj(a[j]![i]!)))
const conj2 = (a: Eis[][]): Eis[][] => a.map(r => r.map(eConj))
const eq2 = (a: Eis[][], b: Eis[][]): boolean => a.every((r, i) => r.every((v, j) => eEq(v, b[i]![j]!)))
const X2: Eis[][] = [
  [
    [0, 0],
    [1, 0],
  ],
  [
    [1, 0],
    [0, 0],
  ],
]
const P2: Eis[][] = [
  [
    [1, 0],
    [0, 0],
  ],
  [
    [0, 0],
    [-1, 0],
  ],
]

// every coin alpha P+ + beta P- with alpha, beta units of Z[w], up to the overall phase (alpha = 1): six classes
export function coinClasses(): CoinClass[] {
  return UNITS.map(u => {
    const alpha: Eis = [1, 0]
    // beta = alpha / u = conj(u) for a unit
    const beta = eConj(u.value)
    const sum = eAdd(alpha, beta)
    const diff = eSub(alpha, beta)
    const twoC: Eis[][] = [
      [sum, diff],
      [diff, sum],
    ]
    const four: Eis[][] = mul2(twoC, dag2(twoC))
    const unitary = eq2(four, [
      [
        [4, 0],
        [0, 0],
      ],
      [
        [0, 0],
        [4, 0],
      ],
    ])
    // T: X conj(C) X = C^-1 = C^dag (C unitary); on 2C: X conj(2C) X = dag(2C)
    const timeSymmetric = eq2(mul2(mul2(X2, conj2(twoC)), X2), dag2(twoC))
    const commutesSwap = eq2(mul2(twoC, X2), mul2(X2, twoC))
    const commutesMomentum = eq2(mul2(twoC, P2), mul2(P2, twoC))
    const mixes = !eZero(diff)
    // a monomial 2C (one nonzero entry per column) maps a slot to one slot: a permutation, a classical coin
    const classical = eZero(sum) || eZero(diff)
    const theta = u.sixths > 3 ? u.sixths - 6 : u.sixths

    return { alpha, beta, name: `alpha / beta = ${u.name}`, theta, twoC, unitary, timeSymmetric, commutesSwap, commutesMomentum, mixes, classical }
  })
}

// ---- the band of one coined vibe on its line (measurement): U(k) = S(k) C, S(k) = diag(e^-ik, e^ik) ----

// the two quasi-energies at k (E = -phase), of the coin with alpha = 1, beta = e^(-i theta pi / 3)
export function coinBand(thetaSixths: number, k: number): [number, number] {
  const th = (thetaSixths * Math.PI) / 3
  const a: [number, number] = [(1 + Math.cos(-th)) / 2, Math.sin(-th) / 2]
  const b: [number, number] = [(1 - Math.cos(-th)) / 2, -Math.sin(-th) / 2]
  const cm = (x: [number, number], y: [number, number]): [number, number] => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]]
  const s0: [number, number] = [Math.cos(-k), Math.sin(-k)]
  const s1: [number, number] = [Math.cos(k), Math.sin(k)]
  const m = [cm(s0, a), cm(s0, b), cm(s1, b), cm(s1, a)]
  const tr: [number, number] = [m[0]![0] + m[3]![0], m[0]![1] + m[3]![1]]
  const det: [number, number] = [cm(m[0]!, m[3]!)[0] - cm(m[1]!, m[2]!)[0], cm(m[0]!, m[3]!)[1] - cm(m[1]!, m[2]!)[1]]
  const disc: [number, number] = [cm(tr, tr)[0] - 4 * det[0], cm(tr, tr)[1] - 4 * det[1]]
  const md = Math.hypot(disc[0], disc[1])
  const ag = Math.atan2(disc[1], disc[0])
  const root: [number, number] = [Math.sqrt(md) * Math.cos(ag / 2), Math.sqrt(md) * Math.sin(ag / 2)]
  const l1: [number, number] = [(tr[0] + root[0]) / 2, (tr[1] + root[1]) / 2]
  const l2: [number, number] = [(tr[0] - root[0]) / 2, (tr[1] - root[1]) / 2]

  return [-Math.atan2(l1[1], l1[0]), -Math.atan2(l2[1], l2[0])]
}

// E'(k): half the arc between the two quasi-energies, in [0, pi / 2] (the band measured from its middle, folded at
// pi / 2). Its value at k = 0 is half the rest gap, its second difference there the curvature, and its steepest
// central difference over a grid of k the top group speed
export function halfArc(thetaSixths: number, k: number): number {
  const [e1, e2] = coinBand(thetaSixths, k)
  let d = Math.abs(e1 - e2) % (2 * Math.PI)

  if (d > Math.PI) d = 2 * Math.PI - d

  return d / 2
}

export function bandReading(thetaSixths: number): { gap: number; curvature: number; topSpeed: number } {
  const h = 1e-4
  const gap = 2 * halfArc(thetaSixths, 0)
  const curvature = (halfArc(thetaSixths, h) - 2 * halfArc(thetaSixths, 0) + halfArc(thetaSixths, -h)) / (h * h)
  let topSpeed = 0

  for (let i = 1; i < 2000; i++) {
    const k = (Math.PI * i) / 2000

    topSpeed = Math.max(topSpeed, Math.abs(halfArc(thetaSixths, k + h) - halfArc(thetaSixths, k - h)) / (2 * h))
  }

  return { gap, curvature, topSpeed }
}

// ---- the stand-in's spin units (E-RLT-0097 L9's group), for comparison: the twirl of the doublet swap ----

// the average of U X U^dag over the units keeping a husk axis, U the 2 x 2 spin matrix: 0 when the doublet is
// irreducible under them (Schur), X itself when X commutes with every one
export function spinTwirlOfSwap(axis: number): number {
  const units = unitRotations().filter(u => Math.abs(Math.abs(u.rotation.matrix[3 * axis + axis]!) - 1) < 1e-9)
  const acc = [0, 0, 0, 0, 0, 0, 0, 0]

  for (const { rotation } of units) {
    const s = rotation.spin as unknown as [number, number][]
    // U X U^dag, X = [[0, 1], [1, 0]]
    const ux = [s[1]!, s[0]!, s[3]!, s[2]!]
    const dag = [
      [s[0]![0], -s[0]![1]],
      [s[2]![0], -s[2]![1]],
      [s[1]![0], -s[1]![1]],
      [s[3]![0], -s[3]![1]],
    ] as [number, number][]

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        let re = 0
        let im = 0

        for (let k = 0; k < 2; k++) {
          const p = ux[i * 2 + k]!
          const q = dag[k * 2 + j]!

          re += p[0] * q[0] - p[1] * q[1]
          im += p[0] * q[1] + p[1] * q[0]
        }

        acc[2 * (i * 2 + j)] = acc[2 * (i * 2 + j)]! + re / units.length
        acc[2 * (i * 2 + j) + 1] = acc[2 * (i * 2 + j) + 1]! + im / units.length
      }
    }
  }

  return Math.hypot(...acc)
}
