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

    while (d > Math.PI) {
      d -= 2 * Math.PI
    }

    while (d < -Math.PI) {
      d += 2 * Math.PI
    }

    total += d
  }

  return Math.round(total / (2 * Math.PI))
}

// The winding number of a nematic DIRECTOR field on a ring, in units of pi. A
// director is headless (n and -n are identified), so its angle lives mod pi and each
// step difference is folded into (-pi/2, pi/2] before summing. The total advance
// divided by pi is the director winding: a half-integer (1/2) disclination gives 1
// in pi-units, half a vector winding. NOT rounded, so the half-integer charge shows
// up exactly.
export function directorWinding(phi: ReadonlyArray<number>): number {
  const length = phi.length

  let total = 0

  for (let i = 0; i < length; i++) {
    let d = phi[(i + 1) % length]! - phi[i]!

    while (d > Math.PI / 2) {
      d -= Math.PI
    }

    while (d < -Math.PI / 2) {
      d += Math.PI
    }

    total += d
  }

  return total / Math.PI
}
