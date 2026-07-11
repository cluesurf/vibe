// Small numeric helpers shared by the experiments, lifted out of the old
// monolithic test driver so each test file is self-contained.

// True when every entry of the array-like is a finite number.
export function allFinite(values: ArrayLike<number>): boolean {
  for (const value of Array.from(values)) {
    if (!Number.isFinite(value ?? NaN)) {
      return false
    }
  }

  return true
}
