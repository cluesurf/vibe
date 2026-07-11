// The DRY assertion harness for the code/ math-conformance tree.
//
// Every file under test/code/ tests the MATH in the matching file under code/:
// that an identity holds, an algorithm returns the value re-derived by a second
// route, a constant is what the geometry forces. These are not physics claims (those
// live in test/experiment/), they are the floor that guarantees each implementation
// is correct, so the experiments above them can be trusted.
//
// Two rules from the methodology shape the assertions:
//   - Assert EQUALITY where the quantity is exact (integer arithmetic, a group-theory
//     identity, a reversible permutation). Use `equal` / `exactArray`.
//   - Use a tolerance ONLY where the quantity is genuinely floating point (an
//     eigenvalue, a fitted slope). Use `close` / `closeArray`, and keep the tolerance
//     tight enough that a real bug cannot hide under it.
//
// A check fails by throwing. The runner (test/code/run.ts) catches the throw, records
// the failure, and keeps going, so one broken check never hides the rest.

export type Check = {
  name: string
  run: () => void
}

export type Suite = {
  name: string
  checks: Check[]
}

const registry: Suite[] = []

// Group the checks for one code/ module under a readable name. Registering is a side
// effect of the call, so a test file just calls suite(...) at module scope and the
// barrel (test/code/all.ts) picks it up by importing the file, exactly as the
// experiment registry works.
export function suite(name: string, checks: Check[]): Suite {
  const value = { name, checks }

  registry.push(value)

  return value
}

// Every registered suite, in registration order.
export function allSuites(): Suite[] {
  return registry
}

// One named assertion. The body throws (via the expect* helpers) on failure.
export function check(name: string, run: () => void): Check {
  return { name, run }
}

class AssertionError extends Error {}

function fail(message: string): never {
  throw new AssertionError(message)
}

// Exact equality for numbers, strings, booleans. Use for anything the methodology
// says is exact: counts, integer arithmetic, a reversible round-trip, a sign.
export function equal<T>(
  actual: T,
  expected: T,
  message?: string,
): void {
  if (actual !== expected) {
    fail(
      `${message ?? 'equal'}: expected ${String(expected)}, got ${String(actual)}`,
    )
  }
}

// Floating-point closeness, |actual - expected| <= tolerance. Use ONLY for genuinely
// real-valued quantities, and keep the tolerance tight.
export function close(
  actual: number,
  expected: number,
  tolerance: number,
  message?: string,
): void {
  if (!Number.isFinite(actual)) {
    fail(`${message ?? 'close'}: got non-finite ${actual}`)
  }

  if (Math.abs(actual - expected) > tolerance) {
    fail(
      `${message ?? 'close'}: expected ${expected} +/- ${tolerance}, got ${actual} (off by ${Math.abs(actual - expected)})`,
    )
  }
}

export function ok(condition: boolean, message?: string): void {
  if (!condition) {
    fail(message ?? 'expected condition to hold')
  }
}

export function notOk(condition: boolean, message?: string): void {
  if (condition) {
    fail(message ?? 'expected condition to be false')
  }
}

// Exact element-wise equality of two array-likes (length included).
export function exactArray(
  actual: ArrayLike<number>,
  expected: ArrayLike<number>,
  message?: string,
): void {
  equal(
    actual.length,
    expected.length,
    `${message ?? 'exactArray'} length`,
  )

  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      fail(
        `${message ?? 'exactArray'}: at ${i} expected ${expected[i]}, got ${actual[i]}`,
      )
    }
  }
}

// Element-wise closeness of two array-likes (length included), for real-valued vectors.
export function closeArray(
  actual: ArrayLike<number>,
  expected: ArrayLike<number>,
  tolerance: number,
  message?: string,
): void {
  equal(
    actual.length,
    expected.length,
    `${message ?? 'closeArray'} length`,
  )

  for (let i = 0; i < actual.length; i++) {
    close(
      actual[i] ?? NaN,
      expected[i] ?? NaN,
      tolerance,
      `${message ?? 'closeArray'} at ${i}`,
    )
  }
}

// Every entry is a finite number (no NaN, no Infinity).
export function allFinite(
  values: ArrayLike<number>,
  message?: string,
): void {
  for (let i = 0; i < values.length; i++) {
    if (!Number.isFinite(values[i] ?? NaN)) {
      fail(
        `${message ?? 'allFinite'}: non-finite at ${i} (${values[i]})`,
      )
    }
  }
}

// Assert that calling `body` throws (a guard, a precondition). Fails if it returns.
export function throws(body: () => void, message?: string): void {
  try {
    body()
  } catch {
    return
  }

  fail(message ?? 'expected the call to throw')
}
