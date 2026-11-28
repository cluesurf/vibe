/**
 * The lead proposer of level 6, slice 4 run as an isolated candidate, as
 * every candidate runs. It is built once in its own context from data and asked by method name with plain data:
 * the parent genome and the lead's trits, nothing else. It never holds the face, a grade or a baseline, and what it
 * proposes comes back as frozen copies.
 *
 * Evaluator side.
 */

import type { IntelligenceGenome } from '@/code/intelligence/genome/genome'
import { candidatesOf } from '@/code/intelligence/improve/judge/meta-session'
import type { LeadProposer } from '@/code/intelligence/improve/mesh/adaptive-loop'
import { openCandidate, type CandidateSpec } from '@/code/intelligence/problem/evaluate'

export type SandboxedLeadProposer = LeadProposer & {
  /** proposals the lead reordered, as the candidate counts them */
  leadFirst: () => number
  close: () => void
}

export function sandboxedLeadProposer(spec: CandidateSpec): SandboxedLeadProposer {
  const object = openCandidate(spec)

  return {
    id: object.id,
    propose: (genome: IntelligenceGenome, lead: readonly number[]) => candidatesOf(object.call('propose', genome, Array.from(lead))),
    leadFirst() {
      const count = object.call('leadFirst')

      return typeof count === 'number' && Number.isInteger(count) ? count : -1
    },
    close: () => object.close(),
  }
}
