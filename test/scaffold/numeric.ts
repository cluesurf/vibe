// Small numeric helpers shared by the experiments, lifted out of the old
// monolithic test driver so each test file is self-contained.

// True when every entry of the array-like is a finite number.
export function allFinite(values: ArrayLike<number>): boolean {
  for (let i = 0; i < values.length; i++) {
    if (!Number.isFinite(values[i] ?? NaN)) {
      return false
    }
  }

  return true
}
