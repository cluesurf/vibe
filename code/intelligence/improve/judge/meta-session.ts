/**
 * A meta-learner run as an isolated candidate: built once in its own context
 * and asked by method name with plain data. What it is told is a copy (a
 * genome, an evaluation, a verdict), so it can never reach the judge's
 * records or the loop's own objects, and what it proposes comes back as data
 * the loop holds as a frozen copy, so it cannot change a genome after the
 * judge graded it.
 *
 * Evaluator side.
 */

import type { IntelligenceGenome } from '@/code/intelligence/genome/genome'
import type { Candidate, Evaluation, MetaLearner } from '@/code/intelligence/improve/evaluation'
import { frozenCopy } from '@/code/intelligence/improve/judge/genome-judge'
import { openCandidate, type CandidateSpec } from '@/code/intelligence/problem/evaluate'

export type SandboxedMetaLearner = MetaLearner & {
  /** the order the next proposal would try edits in, as the candidate says */
  order: () => string[]
  close: () => void
}

/** The proposals an isolated candidate answered, as frozen copies (anything malformed becomes data a judge refuses). */
export function candidatesOf(raw: unknown): Candidate[] {
  if (!Array.isArray(raw)) {
    return []
  }

  const out: Candidate[] = []

  for (const item of raw as unknown[]) {
    const fields = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>

    out.push(
      frozenCopy({
        genome: fields.genome as IntelligenceGenome,
        parentVersion: typeof fields.parentVersion === 'number' ? fields.parentVersion : -1,
        edit: String(fields.edit),
        description: String(fields.description),
      }),
    )
  }

  return out
}

export function sandboxedMetaLearner(spec: CandidateSpec): SandboxedMetaLearner {
  const object = openCandidate(spec)

  return {
    id: object.id,
    propose: (genome: IntelligenceGenome, evaluation: Evaluation) => candidatesOf(object.call('propose', genome, evaluation)),
    learn(candidate: Candidate, result: Evaluation, adopted: boolean) {
      object.call('learn', candidate, result, adopted)
    },
    order() {
      const order = object.call('order')

      return Array.isArray(order) ? (order as unknown[]).map(String) : []
    },
    close: () => object.close(),
  }
}
