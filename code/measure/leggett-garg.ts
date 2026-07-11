// The Leggett-Garg temporal inequality on a single qubit (the cell's two-state spin). A dichotomic observable
// Q = sigma_z is measured at three times during a coherent rotation R_y(theta). The macrorealist bound on the
// Leggett-Garg combination K = C12 + C23 - C13 is 1, but quantum coherence reaches 3/2 at theta = pi/3. The
// two-time correlator C(theta) is COMPUTED from the actual unitary and the observable (C = Tr[Z R(theta)^dag Z
// R(theta)] / 2 = cos theta), not plugged in, and the classical bound 1 is computed by brute force over the eight
// sign assignments. Reused by the Leggett-Garg experiment, kept here so the experiment stays thin.

import {
  pauli,
  cmMultiply,
  type ComplexMatrix,
} from '@/code/algebra/group/clifford'
import { complex } from '@/code/algebra/linear/complex'

const Z = pauli()[3]!

// the real rotation R_y(theta) = exp(-i theta sigma_y / 2) as a (real-entried) complex matrix
function rotationY(theta: number): ComplexMatrix {
  const ch = Math.cos(theta / 2)
  const sh = Math.sin(theta / 2)

  return [
    [complex({ re: ch, im: 0 }), complex({ re: -sh, im: 0 })],
    [complex({ re: sh, im: 0 }), complex({ re: ch, im: 0 })],
  ]
}

// the real part of the trace of a 2x2 complex matrix
function traceReal(m: ComplexMatrix): number {
  return m[0]![0]!.re + m[1]![1]!.re
}

// the two-time correlator over a coherent rotation by theta: C(theta) = Tr[Z R(theta)^dag Z R(theta)] / 2.
// R_y is real so its conjugate transpose is R_y(-theta). Computed from the matrices, not assumed to be cos.
export function temporalCorrelator(theta: number): number {
  const r = rotationY(theta)
  const rDagger = rotationY(-theta)
  const m = cmMultiply(cmMultiply(cmMultiply(Z, rDagger), Z), r)

  return traceReal(m) / 2
}

export function leggettGarg(input: { steps?: number } = {}): {
  quantumMax: number
  classicalBound: number
  bestTheta: number
} {
  const steps = input.steps ?? 360

  let quantumMax = -Infinity
  let bestTheta = 0

  for (let i = 1; i < steps; i++) {
    const theta = (Math.PI * i) / steps
    // K = C12 + C23 - C13 with equal gaps theta, so C12 = C23 = C(theta), C13 = C(2 theta)
    const k =
      temporalCorrelator(theta) +
      temporalCorrelator(theta) -
      temporalCorrelator(2 * theta)

    if (k > quantumMax) {
      quantumMax = k
      bestTheta = theta
    }
  }

  // macrorealist bound: brute force over the eight sign assignments of the three measurement values
  let classicalBound = -Infinity

  for (const q1 of [1, -1]) {
    for (const q2 of [1, -1]) {
      for (const q3 of [1, -1]) {
        const k = q1 * q2 + q2 * q3 - q1 * q3

        if (k > classicalBound) classicalBound = k
      }
    }
  }

  return { quantumMax, classicalBound, bestTheta }
}
