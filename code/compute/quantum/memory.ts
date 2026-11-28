// QUANTUM MEMORY UNDER THE BARE BEAT U (Q4).
// Exact tools to ask whether a logical qutrit kept in a code survives T beats of the bare beat U
// (code/rule/bare-beat.ts), and which of the beat's layers leave the code space invariant.
//
//   the embedding       one physical qutrit per facet slot (dock, slot): the value x in F_3 is the tone of the slot,
//                       0 -> empty, 1 -> +1, 2 -> -1, every role 0. U never changes a role when all roles are equal (the
//                       meeting only swaps unequal roles), so the role-0 Fock space is this qutrit space. The charge
//                       sum of tones is x summed mod 3, so Z on every slot is omega^(charge)
//   qutrit Paulis       omega^phase X^x Z^z with X|v> = |v + 1>, Z|v> = omega^v |v>, Z X = omega X Z; a product's phase
//                       picks up z_p . x_q (pauliMul). Every phase is a residue mod 3: exact
//   stabilizer states   the joint +1 eigenvector of n commuting independent Paulis: support y + A (A the span of the
//                       X parts, dim r), amplitude 3^(-r/2) omega^k on it (amplitudePhase gives k); the Hamming weights of
//                       the support by duality over A^perp (supportWeightCounts), so no 3^r enumeration
//   [[24,1,8]]_3        hcBulk23 of Vibe/HolographicCode.lean (X^24, Z^24, W_9^(6), L_V-^(6)) and its frame logicals,
//                       on the 24 slots of one dock; the line and frame tables are bare-beat's own (ROOTS, LINES)
//   line gates          a per-line beat layer read off bare-beat as a 9 x 9 matrix on the two slots of a line
//   stabilizer test     <psi| V^dag g V |psi> for a product V of line gates and a Pauli g, through the marginal of psi on
//                       the lines g touches (stabilizerExpectation): = 1 exactly when g still stabilizes V|psi>
//   role sectors        the decoherence-free subspace reading: the weight of a state on total role spin S, the role
//                       words of every spatial pattern projected by the Casimir 4 S(S + 1) (spinSectorWeight)
//
// DETERMINISM: no random numbers, no floating point, no host Math call. Every check throws 'FAIL: ...' (fail-closed).

import { type Ninth, ONE, ZERO, add, conj, equals, isZero, mul, ninth, scale, sub, zetaPower } from '@/code/algebra/ninth-field'
import {
  type BeatState,
  type LayerOp,
  type Vibe,
  LINES,
  ROOTS,
  basisKet,
  decodeConfig,
  stateToNinth,
  superpose,
} from '@/code/rule/bare-beat'

function assertExact(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`FAIL: ${message}`)
  }
}

// =================================================================================================
// 1. F_3 and the qutrit Pauli group
// =================================================================================================

export const mod3 = (v: number): number => ((v % 3) + 3) % 3

const dot3 = (a: readonly number[], b: readonly number[]): number => mod3(a.reduce((s, x, i) => s + x * b[i]!, 0))

export type Pauli3 = {
  readonly phase: number
  readonly x: readonly number[]
  readonly z: readonly number[]
}

export const pauli3 = (x: readonly number[], z: readonly number[], phase = 0): Pauli3 => ({
  phase: mod3(phase),
  x: x.map(mod3),
  z: z.map(mod3),
})

export const identityPauli = (n: number): Pauli3 => pauli3(Array<number>(n).fill(0), Array<number>(n).fill(0))

// (omega^p X^a Z^b)(omega^q X^c Z^d) = omega^(p + q + b.c) X^(a + c) Z^(b + d)
export const pauliMul = (p: Pauli3, q: Pauli3): Pauli3 => ({
  phase: mod3(p.phase + q.phase + dot3(p.z, q.x)),
  x: p.x.map((v, i) => mod3(v + q.x[i]!)),
  z: p.z.map((v, i) => mod3(v + q.z[i]!)),
})

export function pauliPow(p: Pauli3, k: number): Pauli3 {
  let out = identityPauli(p.x.length)

  for (let i = 0; i < mod3(k); i++) {
    out = pauliMul(out, p)
  }

  return out
}

// the symplectic form: P Q = omega^(symplectic(P, Q)) Q P
export const symplectic = (p: Pauli3, q: Pauli3): number => mod3(dot3(p.z, q.x) - dot3(p.x, q.z))

export const pauliWeight = (p: Pauli3): number => p.x.filter((v, i) => v !== 0 || p.z[i] !== 0).length

// =================================================================================================
// 2. Linear algebra over F_3
// =================================================================================================

const inverse3 = (v: number): number => (mod3(v) === 1 ? 1 : 2)

// reduced row echelon form; returns the rows and the pivot columns
export function rrefF3(rows: readonly (readonly number[])[], cols: number): { rows: number[][]; pivots: number[] } {
  const m = rows.map(r => r.map(mod3))
  const pivots: number[] = []

  let top = 0

  for (let c = 0; c < cols && top < m.length; c++) {
    let pivot = -1

    for (let r = top; r < m.length; r++) {
      if (m[r]![c] !== 0) {
        pivot = r
        break
      }
    }

    if (pivot < 0) {
      continue
    }

    ;[m[top], m[pivot]] = [m[pivot]!, m[top]!]

    const inv = inverse3(m[top]![c]!)

    m[top] = m[top]!.map(v => mod3(v * inv))

    for (let r = 0; r < m.length; r++) {
      if (r !== top && m[r]![c] !== 0) {
        const f = m[r]![c]!

        m[r] = m[r]!.map((v, j) => mod3(v - f * m[top]![j]!))
      }
    }

    pivots.push(c)
    top++
  }

  return { rows: m.slice(0, top), pivots }
}

export const rankF3 = (rows: readonly (readonly number[])[], cols: number): number => rrefF3(rows, cols).pivots.length

// a basis of { v : rows . v = 0 }
export function nullspaceF3(rows: readonly (readonly number[])[], cols: number): number[][] {
  const { rows: r, pivots } = rrefF3(rows, cols)
  const free = Array.from({ length: cols }, (_, c) => c).filter(c => !pivots.includes(c))

  return free.map(f => {
    const v = Array<number>(cols).fill(0)

    v[f] = 1
    pivots.forEach((p, i) => {
      v[p] = mod3(-r[i]![f]!)
    })

    return v
  })
}

// one solution of rows . v = rhs, or undefined
export function solveF3(rows: readonly (readonly number[])[], rhs: readonly number[], cols: number): number[] | undefined {
  const augmented = rows.map((r, i) => [...r, rhs[i]!])
  const { rows: r, pivots } = rrefF3(augmented, cols + 1)

  if (pivots.includes(cols)) {
    return undefined
  }

  const v = Array<number>(cols).fill(0)

  pivots.forEach((p, i) => {
    v[p] = r[i]![cols]!
  })

  return v
}

// every vector of the span of `basis` (3^k of them), in a fixed lexicographic order of the coefficients
export function spanElements(basis: readonly (readonly number[])[], cols: number): number[][] {
  let out: number[][] = [Array<number>(cols).fill(0)]

  for (const b of basis) {
    out = out.flatMap(v => [0, 1, 2].map(t => v.map((x, i) => mod3(x + t * b[i]!))))
  }

  return out
}

// =================================================================================================
// 3. The [[24,1,8]]_3 holographic code: hcBulk23 of Vibe/HolographicCode.lean on the 24 slots of one dock
// =================================================================================================

export const DOCK_SLOTS = 24

// [p, line, value]: p = 0 the X part, p = 1 the Z part; W_9^(6) puts the value on both slots of the line
const W9_ROWS: readonly (readonly (readonly [number, number, number])[])[] = [
  [[0, 0, 1], [0, 1, 2], [1, 10, 2], [1, 11, 1]],
  [[0, 2, 1], [0, 3, 2], [1, 8, 2], [1, 9, 1]],
  [[0, 4, 1], [0, 5, 2], [1, 6, 2], [1, 7, 1]],
  [[0, 6, 1], [0, 7, 2], [1, 5, 2], [1, 6, 2], [1, 7, 2]],
  [[0, 8, 1], [0, 9, 2], [1, 3, 2], [1, 8, 2], [1, 9, 2]],
  [[0, 10, 1], [0, 11, 2], [1, 1, 2], [1, 10, 2], [1, 11, 2]],
  [[1, 0, 1], [1, 1, 1], [1, 10, 2], [1, 11, 2]],
  [[1, 2, 1], [1, 3, 1], [1, 8, 2], [1, 9, 2]],
  [[1, 4, 1], [1, 5, 1], [1, 6, 2], [1, 7, 2]],
]

// L_V-^(6): the value v on the line's lower slot and 2v on its upper slot
const LVM_ROWS: readonly (readonly (readonly [number, number, number])[])[] = [
  [[0, 0, 1], [0, 5, 2], [0, 9, 2], [0, 10, 2], [0, 11, 1]],
  [[0, 1, 1], [0, 5, 2], [0, 9, 1]],
  [[0, 2, 1], [0, 5, 2], [0, 10, 2]],
  [[0, 3, 1], [0, 5, 2], [0, 11, 1]],
  [[0, 4, 1], [0, 5, 2], [0, 10, 2], [0, 11, 1]],
  [[0, 6, 1], [0, 9, 2], [0, 10, 2]],
  [[0, 7, 1], [0, 9, 2], [0, 11, 1]],
  [[0, 8, 1], [0, 9, 2], [0, 10, 2], [0, 11, 1]],
  [[1, 0, 1], [1, 3, 1], [1, 5, 1], [1, 7, 1], [1, 9, 1], [1, 10, 2]],
  [[1, 1, 1], [1, 3, 1], [1, 5, 1], [1, 6, 2], [1, 8, 2], [1, 10, 2]],
  [[1, 2, 1], [1, 3, 2], [1, 6, 1], [1, 7, 2], [1, 10, 1], [1, 11, 1]],
  [[1, 4, 1], [1, 5, 2], [1, 8, 1], [1, 9, 2], [1, 10, 1], [1, 11, 2]],
]

// the triality frame of a D_4 root: 0 for the coordinate pairs {01, 23}, 1 for {02, 13}, 2 for {03, 12}
export const FRAME_OF_SLOT: readonly number[] = ROOTS.map(r => {
  const n = r.map(c => c !== 0n)

  return (n[0] && n[1]) || (n[2] && n[3]) ? 0 : (n[0] && n[2]) || (n[1] && n[3]) ? 1 : 2
})

function rowPauli(entries: readonly (readonly [number, number, number])[], twist: boolean): Pauli3 {
  const x = Array<number>(DOCK_SLOTS).fill(0)
  const z = Array<number>(DOCK_SLOTS).fill(0)

  for (const [p, l, v] of entries) {
    const [a, b] = LINES[l]!
    const target = p === 0 ? x : z

    target[a] = v
    target[b] = twist ? mod3(2 * v) : v
  }

  return pauli3(x, z)
}

export type HolographicCode = {
  readonly stabilizers: readonly Pauli3[]
  readonly logicalX: Pauli3
  readonly logicalZ: Pauli3
}

export function holographicCode(): HolographicCode {
  const ones = Array<number>(DOCK_SLOTS).fill(1)
  const zeros = Array<number>(DOCK_SLOTS).fill(0)
  const frameDiff = FRAME_OF_SLOT.map(f => (f === 0 ? 1 : f === 1 ? 2 : 0))

  return {
    stabilizers: [
      pauli3(ones, zeros),
      pauli3(zeros, ones),
      ...W9_ROWS.map(r => rowPauli(r, false)),
      ...LVM_ROWS.map(r => rowPauli(r, true)),
    ],
    logicalX: pauli3(frameDiff, zeros),
    logicalZ: pauli3(zeros, frameDiff),
  }
}

// the code's structure, exactly: commuting, independent, logicals in the normalizer and outside the stabilizer
export function verifyCodeStructure(code: HolographicCode): {
  readonly isotropic: boolean
  readonly rank: number
  readonly logicalsCommute: boolean
  readonly logicalPairing: number
  readonly logicalsOutside: boolean
} {
  const rows = (ps: readonly Pauli3[]): number[][] => ps.map(p => [...p.x, ...p.z])
  const s = code.stabilizers
  const isotropic = s.every(p => s.every(q => symplectic(p, q) === 0))
  const rank = rankF3(rows(s), 2 * DOCK_SLOTS)
  const logicalsCommute = s.every(p => symplectic(p, code.logicalX) === 0 && symplectic(p, code.logicalZ) === 0)
  const logicalsOutside =
    rankF3(rows([...s, code.logicalX]), 2 * DOCK_SLOTS) === rank + 1 &&
    rankF3(rows([...s, code.logicalZ]), 2 * DOCK_SLOTS) === rank + 1

  return { isotropic, rank, logicalsCommute, logicalPairing: symplectic(code.logicalX, code.logicalZ), logicalsOutside }
}

// the nontrivial Paulis supported on the two slots of a line that commute with every stabilizer (empty when no line
// operator is a stabilizer or a logical: then every line operator O acts on the code as tr(O) / 9, Knill-Laflamme)
export function lineNormalizerElements(code: HolographicCode, line: number): Pauli3[] {
  const [a, b] = LINES[line]!
  const found: Pauli3[] = []

  for (let k = 1; k < 81; k++) {
    const x = Array<number>(DOCK_SLOTS).fill(0)
    const z = Array<number>(DOCK_SLOTS).fill(0)

    x[a] = k % 3
    z[a] = ((k - (k % 3)) / 3) % 3
    x[b] = ((k - (k % 9)) / 9) % 3
    z[b] = ((k - (k % 27)) / 27) % 3

    const p = pauli3(x, z)

    if (code.stabilizers.every(g => symplectic(g, p) === 0)) {
      found.push(p)
    }
  }

  return found
}

// =================================================================================================
// 4. Stabilizer states
// =================================================================================================

export type StabilizerState = {
  readonly n: number
  // the defining commuting generators, each with eigenvalue +1 on the state
  readonly generators: readonly Pauli3[]
  // the generators reduced so that their X parts are in reduced echelon form with pivots `pivots` (r of them)
  readonly xGenerators: readonly Pauli3[]
  readonly pivots: readonly number[]
  // one configuration of the support
  readonly seed: readonly number[]
}

export function stabilizerState(generators: readonly Pauli3[]): StabilizerState {
  const n = generators[0]!.x.length

  assertExact(generators.length === n, `a stabilizer state on ${n} qutrits needs ${n} generators`)
  assertExact(
    generators.every(p => generators.every(q => symplectic(p, q) === 0)),
    'stabilizer generators do not commute',
  )
  assertExact(rankF3(generators.map(p => [...p.x, ...p.z]), 2 * n) === n, 'stabilizer generators are dependent')

  // Gaussian elimination on the X parts with group products, so phases stay exact
  const work = [...generators]
  const pivots: number[] = []

  let top = 0

  for (let c = 0; c < n && top < work.length; c++) {
    const pivot = work.findIndex((p, i) => i >= top && p.x[c] !== 0)

    if (pivot < 0) {
      continue
    }

    ;[work[top], work[pivot]] = [work[pivot]!, work[top]!]
    work[top] = pauliPow(work[top]!, inverse3(work[top]!.x[c]!))

    for (let r = 0; r < work.length; r++) {
      if (r !== top && work[r]!.x[c] !== 0) {
        work[r] = pauliMul(work[r]!, pauliPow(work[top]!, mod3(-work[r]!.x[c]!)))
      }
    }

    pivots.push(c)
    top++
  }

  const xGenerators = work.slice(0, top)
  const zOnly = work.slice(top)

  // a Z-only element omega^p Z^b has eigenvalue omega^(p + b.y) on |y>: the support solves b.y = -p
  const seed = solveF3(
    zOnly.map(p => [...p.z]),
    zOnly.map(p => mod3(-p.phase)),
    n,
  )

  assertExact(seed !== undefined, 'the stabilizer group holds a nontrivial scalar')

  return { n, generators, xGenerators, pivots, seed: seed! }
}

export const supportDimension = (s: StabilizerState): number => s.xGenerators.length

// the amplitude of |x> is 3^(-r/2) omega^k on the support (k returned) and 0 off it (undefined)
export function amplitudePhase(s: StabilizerState, x: readonly number[]): number | undefined {
  const d = x.map((v, i) => mod3(v - s.seed[i]!))

  let g = identityPauli(s.n)

  s.xGenerators.forEach((p, i) => {
    g = pauliMul(g, pauliPow(p, d[s.pivots[i]!]!))
  })

  if (!g.x.every((v, i) => v === d[i])) {
    return undefined
  }

  // g |y> = omega^(phase + z.y) |y + x(g)>, and the state is 3^(-r/2) sum over the group of g |y>
  return mod3(g.phase + dot3(g.z, s.seed))
}

// how many support configurations carry each number of excitations (nonzero qutrits), by duality:
// 1_{y + A}(x) = 3^(r - n) sum_{u in A^perp} omega^(u.(x - y)), and sum_x z^wt(x) omega^(u.x) = (1 + 2z)^(n - wt u) (1 - z)^wt u
export function supportWeightCounts(s: StabilizerState): bigint[] {
  const n = s.n
  const r = supportDimension(s)
  const dual = nullspaceF3(
    s.xGenerators.map(p => [...p.x]),
    n,
  )

  assertExact(dual.length === n - r, 'the dual of the support has the wrong dimension')
  assertExact(n - r <= 12, `the dual has 3^${n - r} elements, past the enumeration cap`)

  // byWeight[w][e]: elements u of weight w with omega^(-u.y) = omega^e
  const byWeight = Array.from({ length: n + 1 }, () => [0n, 0n, 0n])

  for (const u of spanElements(dual, n)) {
    const w = u.filter(v => v !== 0).length

    byWeight[w]![mod3(-dot3(u, s.seed))]! += 1n
  }

  const counts = Array<bigint>(n + 1).fill(0n)

  for (let w = 0; w <= n; w++) {
    const [c0, c1, c2] = byWeight[w]!

    // c0 + c1 omega + c2 omega^2 is rational only when c1 = c2, and is then c0 - c1
    assertExact(c1 === c2, 'a weight class of the dual sums to a non-rational number')

    const coefficient = c0! - c1!

    if (coefficient === 0n) {
      continue
    }

    // (1 + 2z)^(n - w) (1 - z)^w
    let poly = [1n]

    for (let i = 0; i < n - w; i++) {
      poly = [...poly, 0n].map((c, j) => c + 2n * (poly[j - 1] ?? 0n))
    }

    for (let i = 0; i < w; i++) {
      poly = [...poly, 0n].map((c, j) => c - (poly[j - 1] ?? 0n))
    }

    poly.forEach((c, j) => {
      counts[j]! += coefficient * c
    })
  }

  const scaleDown = 3n ** BigInt(n - r)

  return counts.map(c => {
    assertExact(c % scaleDown === 0n && c >= 0n, 'a support weight count is not a nonnegative integer')

    return c / scaleDown
  })
}

// the first support configuration (after the seed, in base-3 counter order of the coefficients on the reduced X
// generators) that `accept` takes, with how many were visited; undefined past `cap`. Each counter digit that moves,
// wrap included, adds its generator's X part once, since 3 a = 0.
export function firstSupportConfig(
  s: StabilizerState,
  accept: (x: readonly number[]) => boolean,
  cap: number,
): { config: number[]; visited: number } | undefined {
  const r = supportDimension(s)
  const digits = Array<number>(r).fill(0)
  const x = [...s.seed]

  for (let visited = 1; visited <= cap; visited++) {
    let i = 0

    while (i < r) {
      const a = s.xGenerators[i]!.x

      for (let j = 0; j < s.n; j++) {
        x[j] = mod3(x[j]! + a[j]!)
      }

      digits[i] = mod3(digits[i]! + 1)

      if (digits[i] !== 0) {
        break
      }

      i++
    }

    if (i === r) {
      return undefined
    }

    if (accept(x)) {
      return { config: [...x], visited }
    }
  }

  return undefined
}

// <x| P |psi> for a Pauli P = omega^p X^a Z^b: omega^(p + b.(x - a)) psi(x - a)
export function pauliShiftedPhase(s: StabilizerState, p: Pauli3, x: readonly number[]): number | undefined {
  const source = x.map((v, i) => mod3(v - p.x[i]!))
  const k = amplitudePhase(s, source)

  return k === undefined ? undefined : mod3(k + p.phase + dot3(p.z, source))
}

// =================================================================================================
// 5. The beat's per-line layers as qutrit gates
// =================================================================================================

// qutrit value -> tone of the slot (0 empty, 1 -> +1, 2 -> -1)
export const TONE_OF_QUTRIT: readonly (-1 | 0 | 1)[] = [0, 1, -1]

const qutritOfTone = (tone: number): number => (tone === 0 ? 0 : tone === 1 ? 1 : 2)

// the dock-0 configuration of a qutrit string on the slots `slots` (role 0)
export function configOfQutrits(slots: readonly number[], values: readonly number[], dock = 0): Vibe[] {
  const vibes: Vibe[] = []

  slots.forEach((slot, i) => {
    const tone = TONE_OF_QUTRIT[mod3(values[i]!)]!

    if (tone !== 0) {
      vibes.push([dock, slot, tone, 0])
    }
  })

  return vibes
}

// a beat layer on the two slots of line `line` of dock 0, as a 9 x 9 matrix (index 3 x_a + x_b, a < b the line's
// slots); fails closed if the layer moves anything off the line or changes a role
export function lineGate(layer: LayerOp, line: number): Ninth[][] {
  const [a, b] = LINES[line]!
  const columns: Ninth[][] = []

  for (let col = 0; col < 9; col++) {
    const xa = (col - (col % 3)) / 3
    const xb = col % 3
    const image = stateToNinth(layer(basisKet(configOfQutrits([a, b], [xa, xb])), false))
    const column = Array<Ninth>(9).fill(ZERO)

    for (const [key, amp] of image) {
      const vibes = decodeConfig(key)

      let ya = 0
      let yb = 0

      for (const [dock, slot, tone, role] of vibes) {
        assertExact(dock === 0 && role === 0 && (slot === a || slot === b), `layer left line ${line}: ${key}`)

        if (slot === a) {
          ya = qutritOfTone(tone)
        } else {
          yb = qutritOfTone(tone)
        }
      }

      column[3 * ya + yb] = amp
    }

    columns.push(column)
  }

  return Array.from({ length: 9 }, (_, row) => columns.map(c => c[row]!))
}

export const traceOf = (m: readonly (readonly Ninth[])[]): Ninth => m.reduce((s, row, i) => add(s, row[i]!), ZERO)

export const absSquare = (x: Ninth): Ninth => mul(conj(x), x)

// =================================================================================================
// 6. The stabilizer test for a product of line gates
// =================================================================================================

// the 9 x 9 matrix of X^xa Z^za (x) X^xb Z^zb (global phase left out), index 3 v_a + v_b
export function twoQutritPauli(xa: number, za: number, xb: number, zb: number): Ninth[][] {
  return Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (__, col) => {
      const va = (col - (col % 3)) / 3
      const vb = col % 3

      if (row !== 3 * mod3(va + xa) + mod3(vb + xb)) {
        return ZERO
      }

      return zetaPower(3 * mod3(za * va + zb * vb))
    }),
  )
}

const matMul9 = (p: readonly (readonly Ninth[])[], q: readonly (readonly Ninth[])[]): Ninth[][] =>
  p.map(row =>
    q[0]!.map((_, j) =>
      row.reduce((s, x, k) => (isZero(x) || isZero(q[k]![j]!) ? s : add(s, mul(x, q[k]![j]!))), ZERO),
    ),
  )

const dagger9 = (m: readonly (readonly Ninth[])[]): Ninth[][] => m.map((row, i) => row.map((_, j) => conj(m[j]![i]!)))

export const linesOfPauli = (p: Pauli3): number[] =>
  LINES.flatMap(([a, b], l) => (p.x[a] || p.z[a] || p.x[b] || p.z[b] ? [l] : []))

// <psi| V^dag g V |psi> for V = product over lines of gates[line] and psi the stabilizer state of `state`. Only the lines
// g touches matter (V^dag V = I elsewhere); psi enters through its marginal there, 3^(-|Q|) times the sum of the
// group elements supported on those slots Q. Equals 1 exactly when g stabilizes V |psi>.
export function stabilizerExpectation(
  state: StabilizerState,
  g: Pauli3,
  gates: readonly (readonly (readonly Ninth[])[])[],
): { value: Ninth; lines: number; groupElements: number } {
  const lines = linesOfPauli(g)
  const inside = new Set(lines.flatMap(l => [...LINES[l]!]))
  const outside = Array.from({ length: state.n }, (_, i) => i).filter(i => !inside.has(i))
  const gens = state.generators
  const constraints = outside.flatMap(i => [gens.map(p => p.x[i]!), gens.map(p => p.z[i]!)])
  const kernel = nullspaceF3(constraints, gens.length)

  assertExact(kernel.length <= 12, `3^${kernel.length} group elements on ${lines.length} lines, past the cap`)

  const basis = kernel.map(c => c.reduce((acc, k, i) => pauliMul(acc, pauliPow(gens[i]!, k)), identityPauli(state.n)))

  // per line: O_l = v^dag g_l v, and tr(P O_l) for each of the 81 line Paulis P
  const tables = lines.map(l => {
    const [a, b] = LINES[l]!
    const v = gates[l]!
    const o = matMul9(dagger9(v), matMul9(twoQutritPauli(g.x[a]!, g.z[a]!, g.x[b]!, g.z[b]!), v))
    const table = new Map<string, Ninth>()

    for (let k = 0; k < 81; k++) {
      const xa = k % 3
      const za = ((k - xa) / 3) % 3
      const xb = ((k - (k % 9)) / 9) % 3
      const zb = ((k - (k % 27)) / 27) % 3

      table.set(`${xa}${za}${xb}${zb}`, traceOf(matMul9(twoQutritPauli(xa, za, xb, zb), o)))
    }

    return { a, b, table }
  })

  let elements = [identityPauli(state.n)]

  for (const h of basis) {
    elements = elements.flatMap(e => [e, pauliMul(e, h), pauliMul(pauliMul(e, h), h)])
  }

  let sum = ZERO

  for (const h of elements) {
    let term = zetaPower(3 * mod3(h.phase + g.phase))

    for (const { a, b, table } of tables) {
      term = mul(term, table.get(`${h.x[a]}${h.z[a]}${h.x[b]}${h.z[b]}`)!)

      if (isZero(term)) {
        break
      }
    }

    sum = add(sum, term)
  }

  return { value: scale(sum, 1, 3n ** BigInt(2 * lines.length)), lines: lines.length, groupElements: elements.length }
}

// =================================================================================================
// 7. Decoherence-free subspaces: total role spin
// =================================================================================================

// <a|b> over configuration keys
export function overlap(a: ReadonlyMap<string, Ninth>, b: ReadonlyMap<string, Ninth>): Ninth {
  let s = ZERO

  for (const [key, x] of a) {
    const y = b.get(key)

    if (y !== undefined) {
      s = add(s, mul(conj(x), y))
    }
  }

  return s
}

export const normSquared = (a: ReadonlyMap<string, Ninth>): Ninth => overlap(a, a)

// the words of length n over {0, 1} with exactly k ones, as strings, in lexicographic order
export function wordsWithOnes(n: number, k: number): string[] {
  if (n === 0) {
    return k === 0 ? [''] : []
  }

  return [
    ...(k <= n - 1 ? wordsWithOnes(n - 1, k).map(w => `0${w}`) : []),
    ...(k >= 1 ? wordsWithOnes(n - 1, k - 1).map(w => `1${w}`) : []),
  ]
}

// the weight of a state on total role spin S (twiceS = 2S), every role 0 or 1 (spin 1/2). The roles of each spatial
// pattern (the configuration without roles) form one vector over role words; the Casimir is 4 S(S+1) =
// -n(n - 4) + 4 sum_{p<q} P_pq, and the projector the Lagrange product over the spins present with the same count k of
// role-1 excitations.
export function spinSectorWeight(state: ReadonlyMap<string, Ninth>, twiceS: number): Ninth {
  const groups = new Map<string, Map<string, Ninth>>()

  for (const [key, amp] of state) {
    const vibes = decodeConfig(key)
    const roles = vibes.map(v => v[3])

    assertExact(
      roles.every(r => r === 0 || r === 1),
      'spinSectorWeight reads roles 0 and 1 only',
    )

    const k = roles.filter(r => r === 1).length
    const pattern = `${vibes.map(([d, s, t]) => `${d}:${s}:${t}`).join(';')}|${k}`
    const words = groups.get(pattern) ?? new Map<string, Ninth>()

    words.set(roles.join(''), amp)
    groups.set(pattern, words)
  }

  let total = ZERO

  for (const [pattern, words] of groups) {
    const k = Number(pattern.slice(pattern.indexOf('|') + 1))
    const n = [...words.keys()][0]!.length
    const low = n - 2 * k < 0 ? 2 * k - n : n - 2 * k

    if (twiceS < low || twiceS > n || (twiceS - low) % 2 !== 0) {
      continue
    }

    const casimirValue = (t: number): number => t * (t + 2)
    // every word of length n with k ones: the Casimir maps this set into itself
    const allWords = wordsWithOnes(n, k)

    const applyCasimir = (v: Map<string, Ninth>): Map<string, Ninth> => {
      const out = new Map<string, Ninth>()

      for (const w of allWords) {
        let s = scale(v.get(w) ?? ZERO, -n * (n - 4))

        for (let p = 0; p < n; p++) {
          for (let q = p + 1; q < n; q++) {
            const swapped = [...w]

            ;[swapped[p], swapped[q]] = [swapped[q]!, swapped[p]!]

            const y = v.get(swapped.join(''))

            if (y !== undefined) {
              s = add(s, scale(y, 4))
            }
          }
        }

        if (!isZero(s)) {
          out.set(w, s)
        }
      }

      return out
    }

    let projected = new Map(words)
    let denominator = 1

    for (let other = low; other <= n; other += 2) {
      if (other === twiceS) {
        continue
      }

      const c = applyCasimir(projected)
      const next = new Map<string, Ninth>()

      for (const w of allWords) {
        const x = sub(c.get(w) ?? ZERO, scale(projected.get(w) ?? ZERO, casimirValue(other)))

        if (!isZero(x)) {
          next.set(w, x)
        }
      }

      projected = next
      denominator *= casimirValue(twiceS) - casimirValue(other)
    }

    for (const [w, x] of words) {
      total = add(total, scale(mul(conj(x), projected.get(w) ?? ZERO), 1, denominator))
    }
  }

  return total
}

// =================================================================================================
// 8. The logical qutrit of four like-sign excitations (total role spin 1)
// =================================================================================================

// Four like-sign (+1) excitations on the slots of two lines of one dock, one in role 1. The words with the role-1
// excitation at site i span spin 2 (their sum) and spin 1 (sums with zero total): the spin-1 multiplicity is a logical
// qutrit kept in a decoherence-free subspace of collective role noise. Basis (normalized, rational):
// |j> = (1/2) sum_i h_j(i) |e_i>, h = (+ + - -), (+ - + -), (+ - - +) over the sites (a, a', b, b').
export const QUTRIT_DFS_SIGNS: readonly (readonly number[])[] = [
  [1, 1, -1, -1],
  [1, -1, 1, -1],
  [1, -1, -1, 1],
]

export function dfsSites(lineA: number, lineB: number): number[] {
  return [...LINES[lineA]!, ...LINES[lineB]!]
}

// sum_i c_i |role 1 at site i>, tone +1 on every site, dock 0
export function roleOneState(sites: readonly number[], coefficients: readonly Ninth[]): BeatState {
  return superpose(
    sites.map((_, i) => [sites.map((slot, j) => [0, slot, 1, j === i ? 1 : 0] as const), coefficients[i]!] as const),
  )
}

export function dfsQutritBasis(lineA: number, lineB: number): BeatState[] {
  const sites = dfsSites(lineA, lineB)

  return QUTRIT_DFS_SIGNS.map(h => roleOneState(sites, h.map(s => ninth([s], 2))))
}

// the three Fourier states sum_j omega^(jk) |j> (norm^2 3, left unnormalized: every fidelity divides by norms)
export function dfsQutritFourier(lineA: number, lineB: number): BeatState[] {
  const sites = dfsSites(lineA, lineB)

  return [0, 1, 2].map(k =>
    roleOneState(
      sites,
      sites.map((_, i) =>
        QUTRIT_DFS_SIGNS.reduce((s, h, j) => add(s, mul(zetaPower(3 * mod3(j * k)), ninth([h[i]!], 2))), ZERO),
      ),
    ),
  )
}

// W12's four logical kets (two 3-excitation DFS qubits, Q1's S = 1 sector of six excitations): |0> ~ e_1 - e_0,
// |1> ~ 2 e_2 - e_1 - e_0 on the sites (0, 1, 2), the same on (3, 4, 5); the six sites are three full lines
export function w12Kets(lines: readonly [number, number, number]): BeatState[] {
  const sites = lines.flatMap(l => [...LINES[l]!])
  const qubit: readonly (readonly (readonly [number, number])[])[] = [
    [
      [1, 1],
      [0, -1],
    ],
    [
      [2, 2],
      [1, -1],
      [0, -1],
    ],
  ]

  return qubit.flatMap(left =>
    qubit.map(right =>
      superpose(
        left.flatMap(([i, ci]) =>
          right.map(
            ([j, cj]) =>
              [
                sites.map((slot, s) => [0, slot, 1, s === i || s === 3 + j ? 1 : 0] as const),
                ninth([ci * cj]),
              ] as const,
          ),
        ),
      ),
    ),
  )
}

// fidelity |<a|b>|^2 / (<a|a> <b|b>), exact
export function fidelity(a: ReadonlyMap<string, Ninth>, b: ReadonlyMap<string, Ninth>): Ninth {
  const o = overlap(a, b)
  const na = normSquared(a)
  const nb = normSquared(b)

  assertExact(!isZero(na) && !isZero(nb), 'fidelity of a zero vector')

  return mul(absSquare(o), inverseRational(mul(na, nb)))
}

// 1 / x for a positive rational x of Q(zeta_9)
export function inverseRational(x: Ninth): Ninth {
  assertExact(
    x.n.every((c, k) => k === 0 || c === 0n) && x.n[0] !== 0n,
    'inverseRational needs a nonzero rational',
  )

  return ninth([x.d], x.n[0])
}

export const isRationalNinth = (x: Ninth): boolean => x.n.every((c, k) => k === 0 || c === 0n)

export const isOne = (x: Ninth): boolean => equals(x, ONE)
