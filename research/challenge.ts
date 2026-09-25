// Challenge submissions. Every result is a standing challenge, C-<arena>-<NNNN> for R-<arena>-<NNNN>, open to
// breaking by any route in ROUTES (type.ts). A submission is recorded here when it arrives,
// whatever it finds, and the person who made it is credited permanently. A `broken` or
// `corrected` submission marks its result `challenged` or `broken` in the claim graph, and
// every claim above it reads `dependency_challenged` until it is re-derived.
//
// None has been submitted.

import type { Submission } from './type'

export const SUBMISSIONS: Submission[] = []

// A result's challenge: the same code with C in place of R, so R-FRC-0001 is challenged as C-FRC-0001.
export function challengeId(code: string): string {
  return `C${code.slice(1)}`
}
