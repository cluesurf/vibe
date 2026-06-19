// The level stack of the coarse-graining engine. The renormalization tower is an array of levels, each with
// its compression ratio and commuting-square error. The point of the stack is the scale accounting, a
// tractable top simulation of N_top units, with L stacked levels each compressing a factor C, reaches an
// effective substrate of N_top * C^L vibes (see the multi-level-selves plan, E6 and the 10^20 question).

export interface Level {
  level: number
  unitCount: number
  // mean sub-units per unit, the compression factor C at this level.
  compression: number
  // the commuting-square error of this level's effective rule, 0 is perfect.
  commutingError: number
}

// The effective vibe count reached by a stack, N_top * product of the per-level compressions. A flat tower
// with constant compression C over L levels gives N_top * C^L.
export function effectiveVibeCount(input: {
  topUnits: number
  levels: Level[]
}): number {
  let count = input.topUnits

  for (const level of input.levels) {
    count *= level.compression
  }

  return count
}

// A level is clean only if its compression is real (more than one sub-unit per unit) and its commuting-square
// error is below a bound. A level that does not compress, or whose effective rule does not commute, is not a
// clean level and must be reported as an honest negative rather than stacked.
export function isCleanLevel(input: {
  level: Level
  errorBound?: number
}): boolean {
  const bound = input.errorBound ?? 0.25

  return (
    input.level.compression > 1 && input.level.commutingError <= bound
  )
}
