// Spin from a topological defect: a disclination in a director field. A director is an axis with no
// arrow (the tone read as an orientation, n identified with -n). On a loop around a disclination of
// integer winding w, the director angle advances by 2 pi w. The MINIMAL parallel transport around the
// loop composes to a frame rotation by 2 pi w. For the VECTOR that is the identity (a multiple of 2 pi),
// so the vector returns to itself, the defect is invisible to vectors. For the SPINOR the same transport
// is the double-cover lift, exp(-i 2 pi w S_z) = (-1)^w, so an ODD-winding defect flips the spinor sign.
//
// This is the nematic-disclination mechanism: the spinor (-1) holonomy comes from the DEFECT in the
// director field, not from any spinor structure on the substrate links. So a substrate whose coin carries
// no spinor (the 12 directions of {5,3,4}) still hosts spin-half through a topological defect of its tone.

import {
  type ComplexMatrix,
  cmIdentity,
  cmIsScalar,
  cmMultiply,
} from '@/code/algebra/group/clifford'
import {
  cAdd,
  cConj,
  cMul,
  complex,
} from '@/code/algebra/linear/complex'

// The director angles around a loop of `steps` sites enclosing a winding-w disclination: the field
// advances by 2 pi w over the full loop, so the per-step advance is 2 pi w / steps.
export function directorLoop(input: {
  winding: number
  steps: number
}): number[] {
  const { winding, steps } = input
  return Array.from(
    { length: steps },
    (_, k) => (2 * Math.PI * winding * k) / steps,
  )
}

// The SU(2) rotor lifting a frame rotation by angle beta about the z axis: diag(e^{-i beta/2}, e^{i beta/2}).
function spinorZRotor(beta: number): ComplexMatrix {
  const half = beta / 2
  return [
    [
      complex({ re: Math.cos(half), im: -Math.sin(half) }),
      complex({ re: 0, im: 0 }),
    ],
    [
      complex({ re: 0, im: 0 }),
      complex({ re: Math.cos(half), im: Math.sin(half) }),
    ],
  ]
}

// Transport a spinor around the disclination loop by composing the minimal step rotors. The result is
// the holonomy matrix; for a planar winding-w defect it is (-1)^w times the identity, measured here by
// composition, not assumed.
export function spinorHolonomy(input: {
  winding: number
  steps: number
}): ComplexMatrix {
  const { winding, steps } = input
  const stepRotor = spinorZRotor((2 * Math.PI * winding) / steps)
  let holonomy = cmIdentity(2)
  for (let k = 0; k < steps; k++)
    holonomy = cmMultiply(holonomy, stepRotor)
  return holonomy
}

// The disclination holonomy, both reps. spinorScalar is +1 or -1 (the measured spinor double-cover sign),
// vectorReturnsToSelf is whether the composed vector rotation is the identity (the defect is invisible to
// vectors). For a clean planar disclination: spinorScalar = (-1)^winding, vectorReturnsToSelf = true.
export function disclinationHolonomy(input: {
  winding: number
  steps: number
}): {
  spinorIsMinusOne: boolean
  spinorIsPlusOne: boolean
  vectorReturnsToSelf: boolean
} {
  const holonomy = spinorHolonomy(input)
  const spinorIsMinusOne = cmIsScalar(
    holonomy,
    complex({ re: -1, im: 0 }),
  )
  const spinorIsPlusOne = cmIsScalar(
    holonomy,
    complex({ re: 1, im: 0 }),
  )
  // the vector holonomy is a rotation by the total angle 2 pi w, the identity for any integer w
  const total = 2 * Math.PI * input.winding
  const vectorReturnsToSelf =
    Math.abs(Math.cos(total) - 1) < 1e-9 &&
    Math.abs(Math.sin(total)) < 1e-9
  return { spinorIsMinusOne, spinorIsPlusOne, vectorReturnsToSelf }
}

// The overlap of a COLLECTIVE spinor mode with itself after transport around the disclination. A
// collective mode is a delocalized spinor (a superposition of the two components that depends on a mode
// index), not a point probe. The loop holonomy is (-1)^w times the identity, so it multiplies ANY
// collective spinor by (-1)^w. The overlap <chi | H chi> is therefore (-1)^w independent of the mode,
// the mechanism-agnostic, topological spin carried by an extended excitation. Computed from H applied to
// the mode, not asserted.
export function collectiveModeOverlap(input: {
  winding: number
  steps: number
  mode: number
}): number {
  const holonomy = spinorHolonomy(input)
  const angle = (Math.PI * input.mode) / 6 // a mode-dependent superposition of the two spinor components
  const chi = [
    complex({ re: Math.cos(angle), im: 0 }),
    complex({ re: Math.sin(angle), im: 0 }),
  ]
  const hChi0 = cAdd(
    cMul(holonomy[0]![0]!, chi[0]!),
    cMul(holonomy[0]![1]!, chi[1]!),
  )
  const hChi1 = cAdd(
    cMul(holonomy[1]![0]!, chi[0]!),
    cMul(holonomy[1]![1]!, chi[1]!),
  )
  return cMul(cConj(chi[0]!), hChi0).re + cMul(cConj(chi[1]!), hChi1).re
}
