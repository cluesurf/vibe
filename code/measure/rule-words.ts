// WORDS OF THE RULE'S GATES ON SYSTEM AND FRIEND, enumerated exactly.
//
// THE ALPHABET: the rule gates that act on love A (its direction and point, register point 0) and the friend F (point 1)
// alone, 8 letters from code/measure/rule-gates: the coin C; the line of two of A and F on arm R, on arm L, and on both
// (lineOfTwo(0, 1, arm)); the arm phases w and w^2 on arm R and on arm L (armPhase). A word a_1 .. a_m applies a_1 first.
//
// WHY 4 x 4: every point in the circuit is distinct and no letter touches a copy, so a state after the copies is
// sum_g |phi_g>_{AF} |g>, where the copies' tuple g fixes the unordered pair {a, f} that A and F hold (the complement
// of g in the start's points). Each letter keeps that pair and acts on (direction R or L) x (which of the two points A
// holds) the same way in every pair, read off the gate itself on a two-point label. So a word is one exact 4 x 4 matrix
// M over Q(w), and the A-F reduced state is block diagonal by pair. Every reading of a word is then a quadratic form of M
// against a few 4 x 4 blocks of the state, exact.
//
// ENUMERATION: breadth first by length over distinct matrices up to a unit (+-w^n, which no reading sees). A child of a
// duplicate is a duplicate of a child, so the set reached within length m is exactly the set of every word of length 0
// to m, and the first word kept for a class is its shortlex-least word (parents in shortlex order, letters in alphabet
// order).
//
// No float, no rounding, no random number.

import {
  add,
  apply,
  coinGate,
  conj,
  dirOf,
  div,
  isZero,
  lineOfTwo,
  armPhase,
  mul,
  neg,
  ONE,
  pointsOf,
  show,
  start,
  sub,
  wPow,
  ZERO,
  type Gate,
  type Qw,
  type State,
} from '@/code/measure/rule-gates'

export type Letter = { name: string; gate: Gate }

export const ALPHABET: readonly Letter[] = [
  { name: 'C', gate: coinGate },
  { name: 'U_R', gate: lineOfTwo(0, 1, 'R') },
  { name: 'U_L', gate: lineOfTwo(0, 1, 'L') },
  { name: 'U', gate: lineOfTwo(0, 1, null) },
  { name: 'P_R1', gate: armPhase('R', 1) },
  { name: 'P_R2', gate: armPhase('R', 2) },
  { name: 'P_L1', gate: armPhase('L', 1) },
  { name: 'P_L2', gate: armPhase('L', 2) },
]

// the source undo of E-QTM-0162: the line of two on arm R twice, then the coin
export const SOURCE_WORD: readonly number[] = [1, 1, 0]

export const wordName = (word: readonly number[]): string =>
  word.length === 0 ? '(empty)' : word.map(i => ALPHABET[i]!.name).join(' ')

// a 4 x 4 matrix over Q(w), row major; basis index = 2 dir + order (dir R 0, L 1; order 0: A holds the pair's first
// point, F the second; order 1 the other way)
export type Mat4 = Qw[]

const DIRS = ['R', 'L']
// a representative pair: first point 7, second point 8 (any two distinct points act alike)
const PAIR = [7, 8]

const basisPoints = (i: number): number[] => (i % 2 === 0 ? [...PAIR] : [PAIR[1]!, PAIR[0]!])

const basisIndex = (l: string): number => {
  const p = pointsOf(l)
  const d = DIRS.indexOf(dirOf(l))

  if (d < 0 || p.length !== 2) {
    throw new Error(`rule-words: a label outside the basis, ${l}`)
  }

  const order = p[0] === PAIR[0] && p[1] === PAIR[1] ? 0 : p[0] === PAIR[1] && p[1] === PAIR[0] ? 1 : -1

  if (order < 0) {
    throw new Error(`rule-words: a letter changed the pair, ${l}`)
  }

  return 2 * d + order
}

// the 4 x 4 matrix of one gate, read by applying the gate to each basis label
export function letterMatrix(g: Gate): Mat4 {
  const m: Mat4 = Array.from({ length: 16 }, () => ZERO)

  for (let c = 0; c < 4; c++) {
    for (const [l, a] of apply(start(DIRS[c >> 1]!, basisPoints(c)), g)) {
      m[basisIndex(l) * 4 + c] = a
    }
  }

  return m
}

// L M: the letter applied after the word
function times(l: Mat4, m: Mat4): Mat4 {
  const out: Mat4 = Array.from({ length: 16 }, () => ZERO)

  for (let r = 0; r < 4; r++) {
    for (let t = 0; t < 4; t++) {
      const x = l[r * 4 + t]!

      if (isZero(x)) {
        continue
      }

      for (let c = 0; c < 4; c++) {
        const y = m[t * 4 + c]!

        if (!isZero(y)) {
          out[r * 4 + c] = add(out[r * 4 + c]!, mul(x, y))
        }
      }
    }
  }

  return out
}

const UNITS: Qw[] = [0, 1, 2].flatMap(n => [wPow(n), neg(wPow(n))])

// a key of the matrix's class up to a unit: the least of the six unit multiples' printed forms
function classKey(m: Mat4): string {
  let best: string | null = null

  for (const u of UNITS) {
    const key = m.map(x => show(mul(u, x))).join(';')

    if (best === null || key < best) {
      best = key
    }
  }

  return best!
}

export type WordClass = {
  // the shortlex-least word of the class, letters as indices into ALPHABET
  word: number[]
  matrix: Mat4
}

export type WordClasses = {
  classes: WordClass[]
  // the number of distinct classes first reached at each length 0 .. maxLength, and the words of each length (8^m)
  newAt: number[]
  wordsAt: number[]
  // the class of a word (by its matrix)
  classOf: (word: readonly number[]) => number
}

export function wordClasses(maxLength: number): WordClasses {
  const letters = ALPHABET.map(x => letterMatrix(x.gate))
  const identity: Mat4 = Array.from({ length: 16 }, (_, i) => (i % 5 === 0 ? ONE : ZERO))
  const index = new Map<string, number>()
  const classes: WordClass[] = [{ word: [], matrix: identity }]

  index.set(classKey(identity), 0)

  const newAt = [1]
  const wordsAt = [1]
  let frontier = [0]

  for (let m = 1; m <= maxLength; m++) {
    const next: number[] = []

    for (const p of frontier) {
      const parent = classes[p]!

      for (let a = 0; a < letters.length; a++) {
        const matrix = times(letters[a]!, parent.matrix)
        const key = classKey(matrix)

        if (!index.has(key)) {
          index.set(key, classes.length)
          next.push(classes.length)
          classes.push({ word: [...parent.word, a], matrix })
        }
      }
    }

    newAt.push(next.length)
    wordsAt.push(letters.length ** m)
    frontier = next
  }

  const classOf = (word: readonly number[]): number => {
    let matrix = identity

    for (const a of word) {
      matrix = times(letters[a]!, matrix)
    }

    const found = index.get(classKey(matrix))

    if (found === undefined) {
      throw new Error(`rule-words: the word ${wordName(word)} is longer than the enumeration`)
    }

    return found
  }

  return { classes, newAt, wordsAt, classOf }
}

// ---- the state's A-F blocks ----

export type AFBlocks = {
  // the no-friend final A-F state, on the pair {0, 1} with A at 0 and F at 1 as order 0
  target: Qw[]
  // the A-F reduced state on the pair {0, 1} (order 0: A 0, F 1)
  rho01: Mat4
  // the sum of the A-F blocks of every pair holding F's memory point 1, oriented so order 0 has F at 1
  sigma: Mat4
  // the sum of every pair's block (order 0: F at 1 where the pair holds 1, else A holds the smaller point)
  total: Mat4
  // the A-F reduced state's block on each pair reached (orientation as total)
  byPair: Mat4[]
}

// the basis index of (dir, a, f) in the pair {a, f}
function oriented(dir: string, a: number, f: number): number {
  const d = DIRS.indexOf(dir)

  if (a === f) {
    throw new Error('rule-words: A and F hold the same point')
  }

  const order = f === 1 ? 0 : a === 1 ? 1 : a < f ? 0 : 1

  return 2 * d + order
}

// s: the state after the copies (labels: direction, then A, F, G_1 .. G_k); noFriendAF: the no-friend final state's
// A-F amplitudes keyed 'dir,a,f' (code/measure/record-copies part over registers 0, 1, 2)
export function afBlocks(s: State, noFriendAF: Map<string, Qw>): AFBlocks {
  const target: Qw[] = [ZERO, ZERO, ZERO, ZERO]

  for (const [key, a] of noFriendAF) {
    const [dir, pa, pf] = key.split(',')

    if (pa !== '0' || pf !== '1') {
      throw new Error(`rule-words: the no-friend state leaves the pair {0, 1}, ${key}`)
    }

    target[oriented(dir!, 0, 1)] = a
  }

  // phi_g: the A-F vector of each copies' tuple, and its pair
  const byRest = new Map<string, { pair: [number, number]; v: Qw[] }>()

  for (const [l, a] of s) {
    const p = pointsOf(l)
    const rest = p.slice(2).join(',')
    const pa = p[0]!
    const pf = p[1]!
    const pair: [number, number] = pa < pf ? [pa, pf] : [pf, pa]
    const entry = byRest.get(rest) ?? { pair, v: [ZERO, ZERO, ZERO, ZERO] }

    if (entry.pair[0] !== pair[0] || entry.pair[1] !== pair[1]) {
      throw new Error('rule-words: one copies tuple with two A-F pairs')
    }

    const i = oriented(dirOf(l), pa, pf)

    entry.v[i] = add(entry.v[i]!, a)
    byRest.set(rest, entry)
  }

  const zero = (): Mat4 => Array.from({ length: 16 }, () => ZERO)
  const rho01 = zero()
  const sigma = zero()
  const total = zero()
  const byPair = new Map<string, Mat4>()

  for (const { pair, v } of byRest.values()) {
    const key = pair.join(',')

    if (!byPair.has(key)) {
      byPair.set(key, zero())
    }

    const blocks = [total, byPair.get(key)!]

    if (pair[0] === 0 && pair[1] === 1) {
      blocks.push(rho01)
    }

    if (pair[0] === 1 || pair[1] === 1) {
      blocks.push(sigma)
    }

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const x = mul(v[i]!, conj(v[j]!))

        if (isZero(x)) {
          continue
        }

        for (const b of blocks) {
          b[i * 4 + j] = add(b[i * 4 + j]!, x)
        }
      }
    }
  }

  return { target, rho01, sigma, total, byPair: [...byPair.values()] }
}

// the determinant of a 4 x 4 matrix over Q(w), by elimination (exact)
export function det4(m0: Mat4): Qw {
  const m = [...m0]
  let d = ONE

  for (let c = 0; c < 4; c++) {
    let pivot = -1

    for (let r = c; r < 4; r++) {
      if (!isZero(m[r * 4 + c]!)) {
        pivot = r
        break
      }
    }

    if (pivot < 0) {
      return ZERO
    }

    if (pivot !== c) {
      for (let t = 0; t < 4; t++) {
        const x = m[c * 4 + t]!

        m[c * 4 + t] = m[pivot * 4 + t]!
        m[pivot * 4 + t] = x
      }

      d = neg(d)
    }

    const p = m[c * 4 + c]!

    d = mul(d, p)

    for (let r = c + 1; r < 4; r++) {
      const f = div(m[r * 4 + c]!, p)

      if (isZero(f)) {
        continue
      }

      for (let t = c; t < 4; t++) {
        m[r * 4 + t] = sub(m[r * 4 + t]!, mul(f, m[c * 4 + t]!))
      }
    }
  }

  return d
}

// whether lambda is an exact eigenvalue of the A-F reduced state: det(B - lambda I) = 0 on some pair's block (the
// reduced state is block diagonal by pair)
export function isExactEigenvalue(blocks: AFBlocks, lambda: Qw): boolean {
  return blocks.byPair.some(b => isZero(det4(b.map((x, i) => (i % 5 === 0 ? sub(x, lambda) : x)))))
}

// ---- a word's readings ----

export type WordReading = {
  // the fidelity of A and F with the no-friend final state
  f: Qw
  // P(F reads 1)
  p: Qw
  // the total weight after the word
  weight: Qw
}

// sum_ij conj(u_i) B_ij u_j
function form(u: readonly Qw[], b: Mat4): Qw {
  let total = ZERO

  for (let i = 0; i < 4; i++) {
    if (isZero(u[i]!)) {
      continue
    }

    const ci = conj(u[i]!)

    for (let j = 0; j < 4; j++) {
      const x = b[i * 4 + j]!

      if (!isZero(x) && !isZero(u[j]!)) {
        total = add(total, mul(ci, mul(x, u[j]!)))
      }
    }
  }

  return total
}

// the column vector conj(row e of M): (M B M^dag)_ee = form(conj(row), B)
const conjRow = (m: Mat4, e: number): Qw[] => [0, 1, 2, 3].map(c => conj(m[e * 4 + c]!))

export function readWord(m: Mat4, blocks: AFBlocks): WordReading {
  // F = <t| M rho M^dag |t> = form(M^dag t, rho)
  const u = [0, 1, 2, 3].map(c => {
    let x = ZERO

    for (let r = 0; r < 4; r++) {
      if (!isZero(blocks.target[r]!)) {
        x = add(x, mul(conj(m[r * 4 + c]!), blocks.target[r]!))
      }
    }

    return x
  })
  const f = form(u, blocks.rho01)
  // F at 1: order 0 in a pair holding 1, both directions
  const p = add(form(conjRow(m, 0), blocks.sigma), form(conjRow(m, 2), blocks.sigma))
  let weight = ZERO

  for (let e = 0; e < 4; e++) {
    weight = add(weight, form(conjRow(m, e), blocks.total))
  }

  return { f, p, weight }
}

// apply a word's gates to a whole state (the direct path, for a check against readWord)
export function applyWord(s: State, word: readonly number[]): State {
  let t = s

  for (const a of word) {
    t = apply(t, ALPHABET[a]!.gate)
  }

  return t
}
