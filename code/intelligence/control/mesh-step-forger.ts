/**
 * The step-fitting forger, as a control.
 *
 * Before the chained digest, the metered digest of a layout was the sum over its runs of key x (frame + 1) x (step + 1) mod
 * M = 2^31 - 1 (key and frame hashes polynomials mod 1,000,003, the key factor carrying the background). The step was
 * chosen by the candidate and checked by no judge, so a candidate could run other words, pay every round, and pick the
 * step that makes its sum equal the judge's target: step + 1 = target / S mod M, in range about once in 2,147 word sets.
 * The run, round, rule, layout and pair-update checks all still pass (a layout's pair updates per run do not depend on
 * its tones). `fitLegacyStep` is that adversary, offline, exact (BigInt products), deterministic; `stepForger` is the
 * candidate that then asks the evaluator for the fitted runs and writes outputs it was handed (decided in its own code,
 * as the smuggler decides). A judge of the pre-0037 fold would have taken it as mesh-realized; the chain of
 * solver/mesh/mesh-digest.ts must refuse it.
 *
 * The legacy fold is kept here only for this control. Candidate side (the factory imports only interfaces); the fitting
 * function is pure and import-free. No random numbers.
 */

import type { CandidateHost } from '@/code/intelligence/problem/candidate'
import type { Problem } from '@/code/intelligence/problem/problem'
import { hold, type Held } from '@/code/intelligence/solver/search/expand'
import { emptyLedger, type Solver } from '@/code/intelligence/solver/solver'

export const LEGACY_DIGEST_MODULUS = 2_147_483_647
export const LEGACY_HASH_MODULUS = 1_000_003
export const LEGACY_STEP_LIMIT = 1_000_000

/** The pre-0037 key hash: a polynomial over the key's char codes, mod 1,000,003. */
export function legacyKeyHash(key: string): number {
  let h = 7

  for (let at = 0; at < key.length; at++) {
    h = (h * 31 + key.charCodeAt(at)) % LEGACY_HASH_MODULUS
  }

  return h
}

const M = BigInt(LEGACY_DIGEST_MODULUS)

/** One run's pre-0037 part without its step factor: (keyHash + 1 + H r) (frameHash + 1) mod M, r the background digit. */
export function legacyRunFactor(keyHash: number, frameHash: number, background: number): bigint {
  const residue = background === -1 ? 2 : background
  const key = BigInt(keyHash + 1 + LEGACY_HASH_MODULUS * residue)

  return (key * BigInt(frameHash + 1)) % M
}

/** The pre-0037 digest of one entry: the sum over its runs of factor x (step + 1), mod M. */
export function legacyDigest(runs: readonly { keyHash: number; frameHash: number; step: number }[], background: number): number {
  let sum = 0n

  for (const run of runs) {
    sum = (sum + legacyRunFactor(run.keyHash, run.frameHash, background) * BigInt(run.step + 1)) % M
  }

  return Number(sum)
}

function inverse(value: bigint): bigint | null {
  let a = ((value % M) + M) % M
  let b = M
  let x = 1n
  let y = 0n

  if (a === 0n) {
    return null
  }

  while (b !== 0n) {
    const q = a / b
    const nextB = a - q * b
    const nextY = x - q * y

    a = b
    b = nextB
    x = y
    y = nextY
  }

  return a === 1n ? ((x % M) + M) % M : null
}

/**
 * Fit the step of a request of wrong words to the legacy target. All runs name one state (`keyHash`). `target` is the
 * judge's legacy digest of the honest runs; `alternatives[k]` lists the wrong words run k may take with their frame
 * hashes (each different from the honest word). The search walks the choices as an odometer (run 0 the fastest digit),
 * from every run at its first alternative, and stops at the first choice whose step is in range, or after `limit` tries.
 * Each try is one modular inverse, so the expected cost is about M / 10^6, 2,147 tries.
 */
export function fitLegacyStep(input: {
  keyHash: number
  background: number
  target: number
  alternatives: readonly (readonly { word: readonly number[]; frameHash: number }[])[]
  limit: number
}): { choice: number[]; step: number; tries: number } | null {
  const { keyHash, background, target, alternatives, limit } = input
  const factor = alternatives.map(list => list.map(a => legacyRunFactor(keyHash, a.frameHash, background)))
  const goal = BigInt(target)
  const choice = alternatives.map(() => 0)

  if (factor.some(list => list.length === 0)) {
    return null
  }

  let sum = factor.reduce((s, list) => (s + list[0]!) % M, 0n)

  for (let tries = 1; tries <= limit; tries++) {
    const inv = inverse(sum)

    if (inv !== null) {
      const stepPlusOne = (goal * inv) % M

      if (stepPlusOne >= 1n && stepPlusOne <= BigInt(LEGACY_STEP_LIMIT + 1)) {
        return { choice, step: Number(stepPlusOne) - 1, tries }
      }
    }

    // the next choice: advance the odometer, updating the sum digit by digit
    let k = 0

    for (; k < factor.length; k++) {
      const list = factor[k]!
      const next = (choice[k]! + 1) % list.length

      sum = (sum - list[choice[k]!]! + list[next]! + M) % M
      choice[k] = next

      if (next !== 0) {
        break
      }
    }

    if (k === factor.length) {
      return null
    }
  }

  return null
}

/** One metered request the forger makes: every run names the problem's initial state. */
export interface ForgedRequest {
  rule: string
  layout: Record<string, unknown>
  step: number
  /** the input trits, run after run */
  words: number[]
  arity: number
}

export interface StepForgerArgs {
  id: string
  requests: ForgedRequest[]
  /** the operator ids it applies, in order: the output it decided in its own code */
  writes: string[]
}

export interface StepForgerHost<S> {
  meshRuns: (rule: string, layout: Record<string, unknown>, step: number, nodes: readonly S[], words: readonly number[]) => { values: number[] }
}

/** Asks for the fitted runs (paying every round), ignores their reads, and writes the output it was handed. */
export function stepForger<S>(args: StepForgerArgs, host: CandidateHost<S> & StepForgerHost<S>): Solver<S> {
  return {
    id: args.id,
    solve(problem: Problem<S>, operators) {
      const ledger = emptyLedger()
      const held: Held = { states: 0, bytes: 0 }

      hold(problem, held, ledger, problem.initial)

      for (const request of args.requests) {
        const runs = request.words.length / request.arity

        host.meshRuns(request.rule, request.layout, request.step, Array.from({ length: runs }, () => problem.initial), request.words)
      }

      const byId = new Map(operators.map(operator => [operator.id, operator]))
      const states = [problem.initial]
      const path: string[] = []

      let state = problem.initial
      let cost = 0

      for (const id of args.writes) {
        const operator = byId.get(id)

        if (operator === undefined) {
          throw new Error(`mesh-step-forger: no operator ${id}`)
        }

        ledger.expansions++
        ledger.operatorCalls++

        if (!operator.applicable(state)) {
          throw new Error('mesh-step-forger: the output is already full')
        }

        ledger.operatorCalls += 2
        cost += operator.cost(state)
        state = operator.apply(state)
        ledger.generated++
        hold(problem, held, ledger, state)
        states.push(state)
        path.push(id)
      }

      return { states, operators: path, cost, solved: problem.goal(state), ledger }
    },
  }
}
