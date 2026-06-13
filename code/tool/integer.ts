// Small integer helpers shared across the substrate, the operators, and the
// finite-field arithmetic.

// The non-negative remainder of value modulo modulus, the representative in
// [0, modulus). The language's % keeps the sign of the dividend, so a negative
// value needs this extra fold. Used for torus wrap on periodic lattices and for
// reduction in a prime field.
export function modulo(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus
}
