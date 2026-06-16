// Numerology density, a refutation tool. A famous game is to hit a physical constant (like the fine-structure
// inverse 137.036) with a simple closed-form expression in pi and small integers, and claim significance. This
// measures how MANY simple formulas hit a target, so a target can be compared to a random control. If a target is
// hit by no more simple formulas than a random nearby number, then hitting it carries no information, the formula is
// a coincidence, not a derivation. The family is a pi^3 + b pi^2 + c pi + d with small integer coefficients (the
// family that contains the famous 4 pi^3 + pi^2 + pi = 137.036).

// the number of formulas a pi^3 + b pi^2 + c pi + d (integer coefficients in the given ranges) that land within
// `epsilon` of `target`
export function closedFormHitCount(input: {
  target: number
  epsilon: number
  maxCoefficient: number
  maxConstant: number
}): number {
  const { target, epsilon, maxCoefficient: k, maxConstant: m } = input
  const pi = Math.PI
  const p3 = pi * pi * pi
  const p2 = pi * pi
  let hits = 0
  for (let a = -k; a <= k; a++) {
    for (let b = -k; b <= k; b++) {
      for (let c = -k; c <= k; c++) {
        const base = a * p3 + b * p2 + c * pi
        for (let d = -m; d <= m; d++) {
          if (Math.abs(base + d - target) < epsilon) hits++
        }
      }
    }
  }
  return hits
}
