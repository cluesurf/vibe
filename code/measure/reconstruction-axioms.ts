// THE RECONSTRUCTION AXIOMS ON THE MODEL'S QUTRIT LAYER (E-QTM-0185). Exact in Q(w), w = e^(2 pi i / 3): every
// amplitude is an Eisenstein integer pair over one bigint denominator, every probability a rational read with no
// rounding. Floats appear only in the density read (infidelities to probe states) and the Lie rank.
//
// THE THEORY READ. A role is a qutrit. Its reversible moves are the links' Clifford letters X, Z, S, F
// (code/measure/eisenstein-words cliffordGenerators, the 216-element group mod units, E-QTM-0117); two roles also
// meet, by the like meeting U = P_sym + w P_anti (the swap phase) or the love-fear meeting V = 1 + (w - 1) P_Phi (the
// singlet phase), the two forms of the fear beat (code/rule/fear-weave). A reading of a role is a plane reading (one
// of the four stabilizer bases, the Lagrangian coset readings of E-QTM-0142) or an ancilla reading: the role meets a
// fresh role in a stabilizer state, and the fresh role is plane-read (E-QTM-0161's POVM).
//
// THE CONTROLS ARE OTHER GATE SETS AND OTHER FIELDS, run through the same functions:
//   fear beat off: U at phase pi is SWAP and V at phase 0 is the identity, so no meeting entangles
//   stabilizer: SUM in place of the meetings, the full two-qutrit Clifford group
//   real: kets with rational entries only (the real-amplitude restriction), read by projectors onto such kets
//
// NOTHING MOVES: this file reads a gate set already read off the rule; no mesh, no beat, no random number.

import {
  cycAdjoint,
  cycIdentity,
  cycKron,
  cycMul,
  cycReduce,
  cyclotomicRing,
  rootsOfUnityTest,
  type Cyc,
  type CycMatrix,
} from '@/code/algebra/cyclotomic'
import { rankExact } from '@/code/algebra/linear/exact-null-space'
import {
  cliffordGenerators,
  cliffordGroup,
  stabilizerStates,
  type Mat3,
} from '@/code/measure/eisenstein-words'
import { operator, type Operator } from '@/code/measure/grid-weights'

export const EIS = cyclotomicRing(3)

// ---- kets ----

// a ket: Eisenstein entries over one positive denominator
export type Ket = { readonly entries: Cyc[]; readonly den: bigint }

const absBig = (x: bigint): bigint => (x < 0n ? -x : x)

function gcdBig(a: bigint, b: bigint): bigint {
  let x = absBig(a)
  let y = absBig(b)

  while (y !== 0n) {
    ;[x, y] = [y, x % y]
  }

  return x
}

export function reduceKet(k: Ket): Ket {
  let g = k.den

  for (const e of k.entries) {
    for (const x of e) {
      g = gcdBig(g, x)
    }
  }

  if (g <= 1n) {
    return k
  }

  return { entries: k.entries.map(e => e.map(x => x / g)), den: k.den / g }
}

export function basisKet(n: number, index: number): Ket {
  return {
    entries: Array.from({ length: n }, (_, i) =>
      i === index ? EIS.one() : EIS.zero(),
    ),
    den: 1n,
  }
}

export function productKet(a: Ket, b: Ket): Ket {
  const entries: Cyc[] = []

  for (const x of a.entries) {
    for (const y of b.entries) {
      entries.push(EIS.mul(x, y))
    }
  }

  return reduceKet({ entries, den: a.den * b.den })
}

export function applyGate(m: CycMatrix, k: Ket): Ket {
  const n = m.n
  const entries: Cyc[] = []

  for (let i = 0; i < n; i++) {
    let s = EIS.zero()

    for (let j = 0; j < n; j++) {
      const a = m.entries[i * n + j]!
      const b = k.entries[j]!

      if (!EIS.isZero(a) && !EIS.isZero(b)) {
        s = EIS.add(s, EIS.mul(a, b))
      }
    }

    entries.push(s)
  }

  return reduceKet({ entries, den: m.den * k.den })
}

// the six units +-w^j
const UNIT_POWERS: Cyc[] = [0, 1, 2].flatMap(j => [
  EIS.root(j),
  EIS.scale(EIS.root(j), -1n),
])

// a key for a ket up to a global unit (the only global phases Q(w) holds on a normalized ket of the theory)
export function ketKey(k: Ket): string {
  let best = ''

  for (const u of UNIT_POWERS) {
    const key = `${k.den}|${k.entries.map(e => EIS.mul(e, u).join(',')).join(';')}`

    if (best === '' || key < best) {
      best = key
    }
  }

  return best
}

// <a|b> as a Q(w) number: numerator and denominator
export function inner(a: Ket, b: Ket): { num: Cyc; den: bigint } {
  let s = EIS.zero()

  a.entries.forEach((x, i) => {
    s = EIS.add(s, EIS.mul(EIS.conj(x), b.entries[i]!))
  })

  return { num: s, den: a.den * b.den }
}

// <k|k>, a rational
export function normSquared(k: Ket): { num: bigint; den: bigint } {
  const { num, den } = inner(k, k)

  return { num: realPart(num), den }
}

// a Q(w) number known to be rational: its rational coordinate, after checking the w coordinate is zero
export function realPart(c: Cyc): bigint {
  if (c[1] !== 0n) {
    throw new Error('reconstruction-axioms: expected a rational, found a w part')
  }

  return c[0]!
}

// ---- operators ----

export function fromMat3(m: Mat3): CycMatrix {
  return cycReduce({
    n: 3,
    entries: m.num.map(([a, b]) => [BigInt(a), BigInt(b)]),
    den: 3n ** BigInt(m.den3),
  })
}

export const onFirst = (m: CycMatrix): CycMatrix =>
  cycKron(EIS, m, cycIdentity(EIS, 3))
export const onSecond = (m: CycMatrix): CycMatrix =>
  cycKron(EIS, cycIdentity(EIS, 3), m)

// P_sym + c P_anti = ((1 + c) 1 + (1 - c) SWAP) / 2 on two roles, index 3 i + j: c = w the like meeting, c = -1 SWAP
export function swapPhaseGate(c: Cyc): CycMatrix {
  const plus = EIS.add(EIS.one(), c)
  const minus = EIS.sub(EIS.one(), c)
  const entries: Cyc[] = Array.from({ length: 81 }, () => EIS.zero())

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const row = 3 * i + j

      entries[row * 9 + row] = EIS.add(entries[row * 9 + row]!, plus)
      entries[row * 9 + 3 * j + i] = EIS.add(
        entries[row * 9 + 3 * j + i]!,
        minus,
      )
    }
  }

  return cycReduce({ n: 9, entries, den: 2n })
}

// 1 + (c - 1) P_Phi, P_Phi = |Phi><Phi|, Phi = sum_j |j j> / sqrt 3: c = w the love-fear meeting, c = 1 the identity
export function singletPhaseGate(c: Cyc): CycMatrix {
  const t = EIS.sub(c, EIS.one())
  const entries: Cyc[] = Array.from({ length: 81 }, (_, i) =>
    Math.floor(i / 9) === i % 9 ? EIS.scale(EIS.one(), 3n) : EIS.zero(),
  )

  for (let j = 0; j < 3; j++) {
    for (let k = 0; k < 3; k++) {
      const at = 4 * j * 9 + 4 * k

      entries[at] = EIS.add(entries[at]!, t)
    }
  }

  return cycReduce({ n: 9, entries, den: 3n })
}

// SUM |a b> = |a, a + b>
export function sumGate(): CycMatrix {
  const entries: Cyc[] = Array.from({ length: 81 }, () => EIS.zero())

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      entries[(3 * a + ((a + b) % 3)) * 9 + 3 * a + b] = EIS.one()
    }
  }

  return { n: 9, entries, den: 1n }
}

export function isUnitary(m: CycMatrix): boolean {
  const p = cycMul(EIS, cycAdjoint(EIS, m), m)
  const id = cycIdentity(EIS, m.n)

  return p.entries.every((x, i) =>
    EIS.equal(x, EIS.scale(id.entries[i]!, p.den)),
  )
}

export function wordMatrix(
  letters: readonly CycMatrix[],
  word: readonly number[],
): CycMatrix {
  return word.reduce(
    (acc, g) => cycMul(EIS, letters[g]!, acc),
    cycIdentity(EIS, letters[0]!.n),
  )
}

// every eigenvalue a root of unity (finite order), by Kronecker's test on the exact characteristic polynomial
export const finiteOrder = (m: CycMatrix): boolean =>
  rootsOfUnityTest(EIS, m).finite

export function toOperator(m: CycMatrix): Operator {
  const out = operator(m.n)
  const d = Number(m.den)

  m.entries.forEach((e, i) => {
    const [re, im] = EIS.toComplex(e)

    out.re[i] = re / d
    out.im[i] = im / d
  })

  return out
}

// ---- the one-role group, its states and its readings ----

export type GateSet = {
  name: string
  letters: CycMatrix[]
  names: string[]
}

export const cliffordLetters = (): CycMatrix[] =>
  cliffordGenerators().map(fromMat3)

export const oneRoleGroup = (): CycMatrix[] => cliffordGroup().map(fromMat3)

// the twelve stabilizer kets of a role
export function stabilizerKets(): Ket[] {
  return stabilizerStates(cliffordGroup()).map(s =>
    reduceKet({
      entries: s.num.map(([a, b]) => [BigInt(a), BigInt(b)]),
      den: 3n ** BigInt(s.den3),
    }),
  )
}

// a list of kets split into orthonormal bases (each ket orthogonal to the others in its basis)
export function splitBases(kets: readonly Ket[]): Ket[][] {
  const bases: Ket[][] = []

  for (const k of kets) {
    const home = bases.find(b =>
      b.every(x => EIS.isZero(inner(x, k).num)),
    )

    if (home) {
      home.push(k)
    } else {
      bases.push([k])
    }
  }

  return bases
}

export function projector(k: Ket): CycMatrix {
  const n = k.entries.length
  const ns = normSquared(k)
  const entries: Cyc[] = []

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      entries.push(
        EIS.scale(EIS.mul(k.entries[i]!, EIS.conj(k.entries[j]!)), ns.den),
      )
    }
  }

  return cycReduce({ n, entries, den: k.den * k.den * ns.num })
}

// a reading: its effects, which a causal reading makes sum to the identity
export type Reading = { name: string; effects: CycMatrix[] }

export const planeReading = (name: string, basis: readonly Ket[]): Reading => ({
  name,
  effects: basis.map(projector),
})

// a role B meets a fresh role C prepared in `fresh` by the two-role gate G (B first), and C is read in `basis`:
// the Kraus operator for outcome c is M_c = (1 x <c|) G (1 x |fresh>), the effect M_c^dagger M_c
export function ancillaReading(input: {
  name: string
  gate: CycMatrix
  fresh: Ket
  basis: readonly Ket[]
}): Reading {
  const { gate, fresh, basis } = input
  const effects = basis.map(c => {
    const entries: Cyc[] = []

    for (let b2 = 0; b2 < 3; b2++) {
      for (let b = 0; b < 3; b++) {
        let s = EIS.zero()

        for (let j2 = 0; j2 < 3; j2++) {
          for (let j = 0; j < 3; j++) {
            const g = gate.entries[(3 * b2 + j2) * 9 + 3 * b + j]!

            if (EIS.isZero(g)) {
              continue
            }

            s = EIS.add(
              s,
              EIS.mul(
                EIS.mul(EIS.conj(c.entries[j2]!), g),
                fresh.entries[j]!,
              ),
            )
          }
        }

        entries.push(s)
      }
    }

    const m = cycReduce({ n: 3, entries, den: gate.den * c.den * fresh.den })

    return cycMul(EIS, cycAdjoint(EIS, m), m)
  })

  return { name: input.name, effects }
}

export function sumOfEffects(r: Reading): CycMatrix {
  return r.effects.reduce((acc, e) => {
    const entries = acc.entries.map((x, i) =>
      EIS.add(EIS.scale(x, e.den), EIS.scale(e.entries[i]!, acc.den)),
    )

    return cycReduce({ n: acc.n, entries, den: acc.den * e.den })
  })
}

export function isIdentity(m: CycMatrix): boolean {
  return m.entries.every((x, i) =>
    Math.floor(i / m.n) === i % m.n
      ? x[0] === m.den && x[1] === 0n
      : EIS.isZero(x),
  )
}

// ---- probabilities ----

// a rational as numerator over positive denominator
export type Rational = { num: bigint; den: bigint }

export const rational = (num: bigint, den: bigint): Rational => {
  const g = gcdBig(num, den) || 1n

  return den < 0n
    ? { num: -num / g, den: -den / g }
    : { num: num / g, den: den / g }
}

export const sameRational = (a: Rational, b: Rational): boolean =>
  a.num * b.den === b.num * a.den

export const addRational = (a: Rational, b: Rational): Rational =>
  rational(a.num * b.den + b.num * a.den, a.den * b.den)

export const sumRationals = (xs: readonly Rational[]): Rational =>
  xs.reduce(addRational, rational(0n, 1n))

// the chances of one party's outcomes (its conditional operators, one per outcome) given that another reading gave
// the outcome whose effect is `kept`: a post-selection, renormalized; null when that outcome has chance 0
export function postSelected(
  conditionals: readonly CycMatrix[],
  kept: CycMatrix,
): Rational[] | null {
  const parts = conditionals.map(s =>
    rational(traceNumerator(kept, s), kept.den * s.den),
  )
  const total = sumRationals(parts)

  if (total.num === 0n) {
    return null
  }

  return parts.map(x => rational(x.num * total.den, x.den * total.num))
}

// some two lists of chances differ
export const chancesDiffer = (
  lists: readonly (readonly Rational[])[],
): boolean =>
  lists.some(l => l.some((x, a) => !sameRational(x, lists[0]![a]!)))

// <k| E |k> without the denominators: the integer whose ratio to den(k)^2 den(E) is the probability
export function expectationNumerator(k: Ket, e: CycMatrix): bigint {
  const n = e.n

  let s = EIS.zero()

  for (let i = 0; i < n; i++) {
    const ci = EIS.conj(k.entries[i]!)

    if (EIS.isZero(ci)) {
      continue
    }

    for (let j = 0; j < n; j++) {
      const x = e.entries[i * n + j]!

      if (!EIS.isZero(x) && !EIS.isZero(k.entries[j]!)) {
        s = EIS.add(s, EIS.mul(EIS.mul(ci, x), k.entries[j]!))
      }
    }
  }

  return realPart(s)
}

export function probability(k: Ket, e: CycMatrix): Rational {
  const ns = normSquared(k)

  // <k|E|k> / <k|k> = (num / (dk^2 dE)) / (ns.num / dk^2)
  return rational(expectationNumerator(k, e), e.den * ns.num)
}

// ---- reduced states ----

// the reduced density of role `keep` (0 or 1) of a two-role ket, exact, reduced (a canonical key with matrixKey)
export function reducedRole(k: Ket, keep: 0 | 1): CycMatrix {
  const entries: Cyc[] = []
  const at = (a: number, b: number): Cyc =>
    keep === 0 ? k.entries[3 * a + b]! : k.entries[3 * b + a]!

  for (let i = 0; i < 3; i++) {
    for (let i2 = 0; i2 < 3; i2++) {
      let s = EIS.zero()

      for (let j = 0; j < 3; j++) {
        s = EIS.add(s, EIS.mul(at(i, j), EIS.conj(at(i2, j))))
      }

      entries.push(s)
    }
  }

  const ns = normSquared(k)

  return cycReduce({
    n: 3,
    entries: entries.map(e => EIS.scale(e, ns.den)),
    den: k.den * k.den * ns.num,
  })
}

export const matrixKey = (m: CycMatrix): string =>
  `${m.den}|${m.entries.map(e => e.join(',')).join(';')}`

// Tr(rho^2) of a reduced density, rational
export function purity(m: CycMatrix): Rational {
  let s = EIS.zero()

  for (let i = 0; i < m.n; i++) {
    for (let j = 0; j < m.n; j++) {
      s = EIS.add(s, EIS.mul(m.entries[i * m.n + j]!, m.entries[j * m.n + i]!))
    }
  }

  return rational(realPart(s), m.den * m.den)
}

// a two-role ket is a product exactly when its 3 x 3 amplitude matrix has rank one: every 2 x 2 minor vanishes
export function isProduct(k: Ket): boolean {
  const at = (a: number, b: number): Cyc => k.entries[3 * a + b]!

  for (let r1 = 0; r1 < 3; r1++) {
    for (let r2 = r1 + 1; r2 < 3; r2++) {
      for (let c1 = 0; c1 < 3; c1++) {
        for (let c2 = c1 + 1; c2 < 3; c2++) {
          const d = EIS.sub(
            EIS.mul(at(r1, c1), at(r2, c2)),
            EIS.mul(at(r1, c2), at(r2, c1)),
          )

          if (!EIS.isZero(d)) {
            return false
          }
        }
      }
    }
  }

  return true
}

// Tr(A B) of two operators' numerators, a rational coordinate (both Hermitian): the probability is it over den(A) den(B)
export function traceNumerator(a: CycMatrix, b: CycMatrix): bigint {
  const n = a.n

  let s = EIS.zero()

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = a.entries[i * n + j]!
      const y = b.entries[j * n + i]!

      if (!EIS.isZero(x) && !EIS.isZero(y)) {
        s = EIS.add(s, EIS.mul(x, y))
      }
    }
  }

  return realPart(s)
}

export const traceRational = (a: CycMatrix, b: CycMatrix): Rational =>
  rational(traceNumerator(a, b), a.den * b.den)

// the density |k><k| / <k|k>
export const densityOf = (k: Ket): CycMatrix => projector(k)

// B's conditional operator after A's effect E: Tr_A[(E x 1) |k><k|], unnormalized (its trace is P(E) <k|k>)
export function conditionalSecond(k: Ket, e: CycMatrix): CycMatrix {
  const entries: Cyc[] = []

  for (let b = 0; b < 3; b++) {
    for (let b2 = 0; b2 < 3; b2++) {
      let s = EIS.zero()

      for (let a = 0; a < 3; a++) {
        for (let a2 = 0; a2 < 3; a2++) {
          const x = e.entries[a2 * 3 + a]!

          if (EIS.isZero(x)) {
            continue
          }

          // <a2 b2| ... : sum E_(a2 a) psi(a, b) conj psi(a2, b2)
          s = EIS.add(
            s,
            EIS.mul(
              x,
              EIS.mul(
                k.entries[3 * a + b]!,
                EIS.conj(k.entries[3 * a2 + b2]!),
              ),
            ),
          )
        }
      }

      entries.push(s)
    }
  }

  return cycReduce({ n: 3, entries, den: k.den * k.den * e.den })
}

// one row of the local table P(k, E_a x F_b) as integers: B's conditional operator is kept over the fixed
// denominator den(k)^2 den(E) (no reduction), so an entry differs from the probability by a row factor and a column
// factor only, and the rank is the table's
export function localTableRow(
  k: Ket,
  effectsA: readonly CycMatrix[],
  effectsB: readonly CycMatrix[],
): bigint[] {
  const out: bigint[] = []

  for (const e of effectsA) {
    const entries: Cyc[] = []

    for (let b = 0; b < 3; b++) {
      for (let b2 = 0; b2 < 3; b2++) {
        let s = EIS.zero()

        for (let a = 0; a < 3; a++) {
          for (let a2 = 0; a2 < 3; a2++) {
            const x = e.entries[a2 * 3 + a]!

            if (!EIS.isZero(x)) {
              s = EIS.add(
                s,
                EIS.mul(
                  x,
                  EIS.mul(
                    k.entries[3 * a + b]!,
                    EIS.conj(k.entries[3 * a2 + b2]!),
                  ),
                ),
              )
            }
          }
        }

        entries.push(s)
      }
    }

    const sigma: CycMatrix = { n: 3, entries, den: 1n }

    for (const f of effectsB) {
      out.push(traceNumerator(f, sigma))
    }
  }

  return out
}

export const localTableRank = (
  kets: readonly Ket[],
  effectsA: readonly CycMatrix[],
  effectsB: readonly CycMatrix[],
): number => rankOf(kets.map(k => localTableRow(k, effectsA, effectsB)))

// P rho P for a projector P (the Lueders update of a plane reading's outcome), unnormalized
export const luders = (p: CycMatrix, rho: CycMatrix): CycMatrix =>
  cycMul(EIS, cycMul(EIS, p, rho), p)

// the real coordinates of a Hermitian operator's numerators (the denominator is a positive row scale)
export function operatorCoordinates(m: CycMatrix): bigint[] {
  const n = m.n
  const out: bigint[] = []

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const x = m.entries[i * n + j]!

      if (i === j) {
        out.push(realPart(x))
      } else {
        out.push(x[0]!, x[1]!)
      }
    }
  }

  return out
}

// the two factors of a product ket (each up to a Q(w) scale): a nonzero column and a nonzero row of its amplitudes
export function productFactors(k: Ket): [Ket, Ket] {
  if (!isProduct(k)) {
    throw new Error('reconstruction-axioms: not a product ket')
  }

  const at = (a: number, b: number): Cyc => k.entries[3 * a + b]!

  let i0 = 0
  let j0 = 0

  outer: for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      if (!EIS.isZero(at(a, b))) {
        i0 = a
        j0 = b
        break outer
      }
    }
  }

  return [
    reduceKet({ entries: [0, 1, 2].map(a => at(a, j0)), den: 1n }),
    reduceKet({ entries: [0, 1, 2].map(b => at(i0, b)), den: 1n }),
  ]
}

// ---- reachable states ----

export type Reached = { ket: Ket; depth: number }

// every ket reached from `start` by words of `letters` up to `depth`, each once (up to a unit), with its first depth
export function reachKets(input: {
  letters: readonly CycMatrix[]
  start: Ket
  depth: number
}): Reached[] {
  const { letters, start, depth } = input
  const seen = new Set<string>([ketKey(start)])
  const out: Reached[] = [{ ket: start, depth: 0 }]

  let frontier: Ket[] = [start]

  for (let d = 1; d <= depth; d++) {
    const next: Ket[] = []

    for (const k of frontier) {
      for (const g of letters) {
        const m = applyGate(g, k)
        const key = ketKey(m)

        if (!seen.has(key)) {
          seen.add(key)
          next.push(m)
          out.push({ ket: m, depth: d })
        }
      }
    }

    frontier = next
  }

  return out
}

// the least key over a group's images of a ket: two kets share it exactly when a group element carries one to the
// other up to a unit
export function orbitKey(k: Ket, group: readonly CycMatrix[]): string {
  let best = ''

  for (const g of group) {
    const key = ketKey(applyGate(g, k))

    if (best === '' || key < best) {
      best = key
    }
  }

  return best
}

// every word over `alphabet` letters of length 1 to `length`, in lexicographic order by length, that holds the letter
// `must`
export function wordsWith(input: {
  alphabet: number
  length: number
  must: number
}): number[][] {
  const out: number[][] = []

  for (let len = 1; len <= input.length; len++) {
    for (let code = 0; code < input.alphabet ** len; code++) {
      const w = Array.from(
        { length: len },
        (_, i) => Math.floor(code / input.alphabet ** i) % input.alphabet,
      )

      if (w.includes(input.must)) {
        out.push(w)
      }
    }
  }

  return out
}

// ---- spans and probability tables ----

// the real coordinates of |k><k| (times its denominators): the diagonal, then each upper entry's two coordinates
export function hermitianCoordinates(k: Ket): bigint[] {
  const n = k.entries.length
  const out: bigint[] = []

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const x = EIS.mul(k.entries[i]!, EIS.conj(k.entries[j]!))

      if (i === j) {
        out.push(realPart(x))
      } else {
        out.push(x[0]!, x[1]!)
      }
    }
  }

  return out
}

function transpose(rows: readonly (readonly bigint[])[]): bigint[][] {
  const cols = rows[0]?.length ?? 0

  return Array.from({ length: cols }, (_, j) => rows.map(r => r[j]!))
}

// the rank over Q of an integer matrix, eliminating along the shorter side
export function rankOf(rows: readonly (readonly bigint[])[]): number {
  if (rows.length === 0) {
    return 0
  }

  return rows.length > (rows[0]?.length ?? 0)
    ? rankExact(transpose(rows))
    : rankExact(rows)
}

// the dimension of the real span of the states' density matrices
export const stateSpan = (kets: readonly Ket[]): number =>
  rankOf(kets.map(hermitianCoordinates))

// the rank of the table P(state, effect): rows states, columns effects (a column scale does not change it)
export function tableRank(
  kets: readonly Ket[],
  effects: readonly CycMatrix[],
): number {
  return rankOf(kets.map(k => effects.map(e => expectationNumerator(k, e))))
}

// the same for density operators (mixed states) as rows
export function densityTableRank(
  rhos: readonly CycMatrix[],
  effects: readonly CycMatrix[],
): number {
  return rankOf(rhos.map(r => effects.map(e => traceNumerator(r, e))))
}

export const densitySpan = (rhos: readonly CycMatrix[]): number =>
  rankOf(rhos.map(operatorCoordinates))

export function kronEffects(
  a: readonly CycMatrix[],
  b: readonly CycMatrix[],
): CycMatrix[] {
  return a.flatMap(x => b.map(y => cycKron(EIS, x, y)))
}

// ---- complex or real ----

// the Bargmann invariant <a|b><b|c><c|a>, a Q(w) number (numerator, denominator); it is real for real kets in any
// basis, and a unitary or antiunitary change of basis keeps it or conjugates it
export function bargmann(a: Ket, b: Ket, c: Ket): { num: Cyc; den: bigint } {
  const x = inner(a, b)
  const y = inner(b, c)
  const z = inner(c, a)

  return {
    num: EIS.mul(EIS.mul(x.num, y.num), z.num),
    den: x.den * y.den * z.den,
  }
}

export const isReal = (c: Cyc): boolean => c[1] === 0n

// every nonzero real ket of n entries in {-1, 0, 1}, one per sign pair
export function realKets(n: number): Ket[] {
  const out: Ket[] = []

  for (let code = 1; code < 3 ** n; code++) {
    const v = Array.from(
      { length: n },
      (_, i) => (Math.floor(code / 3 ** i) % 3) - 1,
    )
    const lead = v.find(x => x !== 0)

    if (lead === 1) {
      out.push({ entries: v.map(x => [BigInt(x), 0n]), den: 1n })
    }
  }

  return out
}

// ---- floats for the density read ----

export type FloatKet = { re: Float64Array; im: Float64Array }

export function floatKet(k: Ket): FloatKet {
  const n = k.entries.length
  const re = new Float64Array(n)
  const im = new Float64Array(n)
  const ns = normSquared(k)
  const scale = Math.sqrt(Number(ns.num) / Number(ns.den)) * Number(k.den)

  k.entries.forEach((e, i) => {
    const [x, y] = EIS.toComplex(e)

    re[i] = x / scale
    im[i] = y / scale
  })

  return { re, im }
}

// 1 - |<a|b>|^2 for unit kets
export function infidelity(a: FloatKet, b: FloatKet): number {
  let re = 0
  let im = 0

  for (let i = 0; i < a.re.length; i++) {
    re += a.re[i]! * b.re[i]! + a.im[i]! * b.im[i]!
    im += a.re[i]! * b.im[i]! - a.im[i]! * b.re[i]!
  }

  return 1 - (re * re + im * im)
}
