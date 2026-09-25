// Challenge submissions. Every result is a standing challenge, VIBE-CHALLENGE-0NN, open to
// breaking by any route in ROUTES (type.ts). A submission is recorded here when it arrives,
// whatever it finds, and the person who made it is credited permanently. A `broken` or
// `corrected` submission marks its result `challenged` or `broken` in the claim graph, and
// every claim above it reads `dependency_challenged` until it is re-derived.
//
// None has been submitted.

import type { Submission } from './type'

export const SUBMISSIONS: Submission[] = []

export function challengeId(number: string): string {
  return `VIBE-CHALLENGE-${number.padStart(3, '0')}`
}
