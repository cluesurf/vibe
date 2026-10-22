// ONE MEMBER'S PAIR READ WITH THE CONTACT WELL REMOVED, AND ITS CORRECTED REFERENCE (E-SPN-0211, E-SPN-0212).
//
// softenedRead runs the tracked scan (code/measure/register-track readZero and readMotion, the axis read) for the
// member of ring unit `unit` at Bohr radius aB on the count with n(0) softened (code/measure/contact-core). The corrected
// reference is E-SPN-0209's: the member's exact band averaged over the hydrogenic density of the level's own binding
// radius (code/measure/lattice-pair-inertia), minus E-SPN-0169's Darwin exchange.

import type { KernelOptions } from '@/code/kernel/index'
import { softenContact } from '@/code/measure/contact-core'
import {
  bindingRadius,
  latticePairCurvature,
  pairR,
} from '@/code/measure/lattice-pair-inertia'
import {
  readMotion,
  readZero,
  setupFor,
  TRACK_PLAN,
  type MotionRead,
  type Setup,
  type ZeroRead,
} from '@/code/measure/register-track'

export type SoftenedRead = { zero: ZeroRead; motion: MotionRead }

export function softenedRead(
  unit: readonly [number, number],
  aB: number,
  opts: KernelOptions,
  log: (what: string) => void = () => {},
): SoftenedRead {
  const su = setupFor(unit)
  const p = TRACK_PLAN.find(x => x.aB === aB)!
  const zero = readZero(su, p, opts, log, 1, softenContact)

  return { zero, motion: readMotion(su, p, zero, opts, log, softenContact) }
}

export function correctedReference(su: Setup, E: number, S: number): number {
  const Eb = 2 * su.M0 - E
  const eb = Eb / 2
  const a = latticePairCurvature({
    M0: su.M0,
    radius: bindingRadius(su.mu, Eb),
  }).a

  return pairR(a, E) - ((8 / 3) * eb * S) / (2 * su.m - eb)
}
