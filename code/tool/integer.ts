// Small integer helpers shared across the substrate, the operators, and the
// finite-field arithmetic.

// The non-negative remainder of value modulo modulus, the representative in
// [0, modulus). The language's % keeps the sign of the dividend, so a negative
// value needs this extra fold. Used for torus wrap on periodic lattices and for
// reduction in a prime field.
export function modulo(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus
}

// A deterministic integer scramble, the same value for the same input on every run and every machine.
// This is NOT a random source. It is a fixed bijection-like mix used when a test needs a labelling of
// cells that carries no geometric meaning, so that a claim shown to hold under it cannot be leaning on
// coordinates or distance. Knuth's multiplicative constant, kept in 32-bit unsigned arithmetic.
const MIX_MULTIPLIER = 2654435761

export function integerMix(value: number): number {
  return Math.imul(value, MIX_MULTIPLIER) >>> 0
}
