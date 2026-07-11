// Balanced ternary, base three with digits {-1, 0, +1}, which is exactly the tone alphabet. A number stored in
// K balanced-ternary digits is a STACK OF K TONES, the ternary-native way to hold a small signed integer (a
// gravity potential, say) without any binary. K digits cover the integers in [-(3^K - 1)/2, (3^K - 1)/2], so
// one trit covers [-1, 1], two cover [-4, 4], three cover [-13, 13]. The lean (the order -1 < 0 < +1) is the
// same order that makes a tone a signed charge, so the digits ARE tones.

// The largest magnitude K balanced-ternary digits can represent, (3^K - 1) / 2.
export function balancedTernaryCap(digits: number): number {
  return (3 ** digits - 1) / 2
}

// The K balanced-ternary digits of a value, little-endian, each in {-1, 0, +1}. Values outside the K-digit
// range are clamped to the nearest representable number.
export function toBalancedTernary(
  value: number,
  digits: number,
): number[] {
  const cap = balancedTernaryCap(digits)

  let v = value < -cap ? -cap : value > cap ? cap : value

  const out: number[] = []

  for (let i = 0; i < digits; i++) {
    let remainder = ((v % 3) + 3) % 3 // 0, 1, or 2

    if (remainder === 2) {
      remainder = -1
    }
    // balance: 2 becomes -1 with a carry

    out.push(remainder)
    v = Math.round((v - remainder) / 3)
  }

  return out
}

// The integer value of a list of balanced-ternary digits (little-endian, each in {-1, 0, +1}).
export function fromBalancedTernary(digits: readonly number[]): number {
  let value = 0

  for (let i = digits.length - 1; i >= 0; i--) {
    value = value * 3 + digits[i]!
  }

  return value
}

// Whether every value in an integer field is representable in K balanced-ternary digits (within the cap), the
// check that a potential field is genuinely a K-trit ternary field, each cell a stack of K tones.
export function isBalancedTernaryField(
  values: ArrayLike<number>,
  digits: number,
): boolean {
  const cap = balancedTernaryCap(digits)

  // eslint-disable-next-line @typescript-eslint/prefer-for-of -- ArrayLike<number> is not iterable, so for-of would be a type error
  for (let i = 0; i < values.length; i++) {
    const v = values[i]!

    if (v < -cap || v > cap) {
      return false
    }

    if (fromBalancedTernary(toBalancedTernary(v, digits)) !== v) {
      return false
    }
  }

  return true
}
