// Reusable zero-dependency SGM-inspired negative-control (mutant) harness primitives.
// Strictly deterministic (zero Math.random), zero external dependencies.

export interface MutantCase {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly run: () => void | Promise<void>
}

export interface MutantResult {
  readonly id: string
  readonly name: string
  readonly killed: boolean
  readonly reason: string
  readonly ms: number
}

export interface MutantSuiteSummary {
  readonly killed: number
  readonly survived: number
  readonly total: number
  readonly results: MutantResult[]
}

export class MutantSurvivedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MutantSurvivedError'
  }
}

/**
 * Expects `fn` to reject a corrupted (mutated) mathematical invariant by either
 * throwing an error or returning `false`. Throws `MutantSurvivedError` if the
 * mutant survives without triggering rejection.
 */
export function assertMutantRejected(fn: () => unknown, label: string): void {
  let result: unknown
  try {
    result = fn()
  } catch {
    return
  }
  if (result === false) {
    return
  }
  throw new MutantSurvivedError(
    `Mutant survived [${label}]: invariant neither threw nor returned false (got ${String(result)})`,
  )
}

/**
 * Asserts that a corrupted numeric observable genuinely violates its exact
 * invariant (`|actual - expected| > tol`, or `actual` is non-finite).
 * Throws `MutantSurvivedError` if the mutated value remains within tolerance.
 */
export function assertNumericMutantRejected(
  actual: number,
  expected: number,
  tol: number,
  label: string,
): void {
  if (!Number.isFinite(actual)) {
    return
  }
  const diff = Math.abs(actual - expected)
  if (diff > tol) {
    return
  }
  throw new MutantSurvivedError(
    `Mutant survived [${label}]: |${actual} - ${expected}| = ${diff.toExponential(3)} <= tol ${tol.toExponential(3)}`,
  )
}

/**
 * Executes a deterministic suite of negative-control mutant probes sequentially.
 * A mutant is counted as "killed" when every rejection assertion inside `run()`
 * succeeds (meaning the invariant rejected the corrupted math). Any thrown
 * error marks the mutant as survived/failed (fail-closed).
 */
export async function runMutantSuite(
  cases: readonly MutantCase[],
): Promise<MutantSuiteSummary> {
  const results: MutantResult[] = []
  let killed = 0
  let survived = 0

  for (const mutant of cases) {
    const startMs = performance.now()
    try {
      await mutant.run()
      const ms = Number((performance.now() - startMs).toFixed(2))
      killed++
      results.push({
        id: mutant.id,
        name: mutant.name,
        killed: true,
        reason: `killed: ${mutant.description}`,
        ms,
      })
    } catch (err) {
      const ms = Number((performance.now() - startMs).toFixed(2))
      survived++
      const reason = err instanceof Error ? err.message : String(err)
      results.push({
        id: mutant.id,
        name: mutant.name,
        killed: false,
        reason,
        ms,
      })
    }
  }

  return {
    killed,
    survived,
    total: cases.length,
    results,
  }
}
