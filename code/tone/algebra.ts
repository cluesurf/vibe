// The three algebras the symbols {-1, 0, +1} can carry. The same three tones mean different things in each, so
// every computation-lab result names the one it uses.
//
//   spin-one          integers, magnetization Q = sum s, excitation D = sum s^2, Blume-Capel energy
//   z3                residues mod 3, addition is rotation, sum mod 3 and linearity are the structure
//   balanced-ternary  positional numbers (value = sum s_k 3^k) and Kleene logic (neg, min, max)
//
// The measures below are plain integer readings of a configuration. None is read as pain or pleasure: the valence
// V is a signed count, and an experience reading needs its own argument.

export type ToneAlgebra = 'spin-one' | 'z3' | 'balanced-ternary'

// a configuration of tones, one per cell
export type Tones = Int8Array | readonly number[]

export const TONES = [-1, 0, 1] as const

// ---- spin-one ----

// Q, the magnetization (the valence V of the lab measures)
export function spinCharge(state: Tones): number {
  let q = 0

  for (const s of state) {
    q += s
  }

  return q
}

// D, the excitation count (the number of cells off the vacuum tone)
export function spinExcitation(state: Tones): number {
  let d = 0

  for (const s of state) {
    d += s * s
  }

  return d
}

// Blume-Capel energy -J sum_edges s_i s_j + delta sum_i s_i^2, J and delta integers so the energy is exact
export function blumeCapelEnergy(input: {
  state: Tones
  edges: readonly (readonly [number, number])[]
  coupling: number
  anisotropy: number
}): number {
  let bond = 0

  for (const [i, j] of input.edges) {
    bond += input.state[i]! * input.state[j]!
  }

  return (
    -input.coupling * bond +
    input.anisotropy * spinExcitation(input.state)
  )
}

// T, the tension: sum over edges of (s_i - s_j)^2
export function spinTension(input: {
  state: Tones
  edges: readonly (readonly [number, number])[]
}): number {
  let t = 0

  for (const [i, j] of input.edges) {
    const d = input.state[i]! - input.state[j]!

    t += d * d
  }

  return t
}

// ---- z3 ----

// the residue of a tone, -1 -> 2, 0 -> 0, +1 -> 1
export function toZ3(tone: number): number {
  return ((tone % 3) + 3) % 3
}

// the tone of a residue, 2 -> -1
export function fromZ3(residue: number): number {
  const r = ((residue % 3) + 3) % 3

  return r === 2 ? -1 : r
}

export function z3Add(a: number, b: number): number {
  return fromZ3(toZ3(a) + toZ3(b))
}

export function z3Sum(state: Tones): number {
  let r = 0

  for (const s of state) {
    r = (r + toZ3(s)) % 3
  }

  return r
}

// ---- balanced-ternary ----

// the number a trit string denotes, least significant trit first
export function balancedTernaryValue(trits: Tones): number {
  let value = 0
  let weight = 1

  for (const t of trits) {
    value += t * weight
    weight *= 3
  }

  return value
}

export function kleeneNeg(a: number): number {
  return -a
}

export function kleeneMin(a: number, b: number): number {
  return Math.min(a, b)
}

export function kleeneMax(a: number, b: number): number {
  return Math.max(a, b)
}
