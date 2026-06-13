// Topological winding of a phase field on a ring. The winding number is the total
// signed phase advance around the loop divided by 2*pi, an integer that counts how
// many times the phase wraps. It is the conserved topological charge of a defect:
// a defect and an anti-defect have opposite winding and can annihilate, two like
// defects cannot. Each step difference is folded into (-pi, pi] before summing so a
// smooth ramp is not miscounted.

// The integer winding number of a periodic array of phase angles (radians).
export function phaseWinding(theta: ReadonlyArray<number>): number {
  const length = theta.length
  let total = 0
  for (let i = 0; i < length; i++) {
    let d = theta[(i + 1) % length]! - theta[i]!
    while (d > Math.PI) d -= 2 * Math.PI
    while (d < -Math.PI) d += 2 * Math.PI
    total += d
  }
  return Math.round(total / (2 * Math.PI))
}
