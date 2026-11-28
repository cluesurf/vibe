/**
 * The bounded improvement loop (the source's section 15.7): evaluate the
 * current genome, let the meta-learner propose edits, evaluate each, tell
 * the meta-learner what the evaluator decided, and keep the best candidate
 * the evaluator accepts. A round is one call of the source's `improve`; a
 * run is a fixed number of rounds, each starting from the last round's best.
 *
 * The loop holds the evaluator only as an argument. It never imports it, so
 * it cannot read how grades are made or which problems are held out, and it
 * never grades a candidate itself: adoption is `evaluator.compare`, and a
 * candidate with any violation is never adopted.
 *
 * The meta-learner is a candidate. The evaluator runs it isolated (it sees
 * copies of genomes and evaluations, as data), every comparison of a round
 * is made before it is told the result, and the evaluator's evaluations are
 * frozen copies of its own records, which `compare` reads instead of the
 * objects passed in.
 */

import { genomeKey, type IntelligenceGenome } from '@/code/intelligence/genome/genome'
import type { Candidate, Evaluation, Evaluator, MetaLearner } from '@/code/intelligence/improve/evaluation'

export interface Proposal {
  candidate: Candidate
  evaluation: Evaluation
  /** the evaluator judged it better than the round's parent */
  hit: boolean
}

export interface Round {
  round: number
  parent: IntelligenceGenome
  baseline: Evaluation
  proposals: Proposal[]
  best: IntelligenceGenome
  bestResult: Evaluation
  /** hits over proposals, or 0 when nothing was proposed */
  hitRate: number
}

/** One round: the source's `improve`. */
export function improve(round: number, genome: IntelligenceGenome, meta: MetaLearner, evaluator: Evaluator): Round {
  const baseline = evaluator.evaluate(genome)
  const candidates = meta.propose(genome, baseline)
  const proposals: Proposal[] = []

  let best = genome
  let bestResult = baseline

  for (const candidate of candidates) {
    const result = evaluator.evaluate(candidate.genome)
    // every comparison is made before the meta-learner hears the result, so nothing it does with it can change one
    const hit = result.violations === 0 && evaluator.compare(result, baseline)
    const better = result.violations === 0 && evaluator.compare(result, bestResult)

    proposals.push({ candidate, evaluation: result, hit })

    if (better) {
      best = candidate.genome
      bestResult = result
    }

    meta.learn(candidate, result, hit)
  }

  const hits = proposals.filter(p => p.hit).length

  return {
    round,
    parent: genome,
    baseline,
    proposals,
    best,
    bestResult,
    hitRate: proposals.length === 0 ? 0 : hits / proposals.length,
  }
}

/** `rounds` rounds from `seed`, each from the previous round's best. */
export function improveRounds(
  seed: IntelligenceGenome,
  meta: MetaLearner,
  evaluator: Evaluator,
  rounds: number,
): Round[] {
  const out: Round[] = []

  let genome = seed

  for (let round = 1; round <= rounds; round++) {
    const record = improve(round, genome, meta, evaluator)

    out.push(record)
    genome = record.best
  }

  return out
}

export interface Episode {
  seed: IntelligenceGenome
  rounds: Round[]
}

/**
 * One run of `rounds` rounds from each seed in order, with one meta-learner
 * carried through them all, so what it learned improving one seed shapes how
 * it improves the next (the source's "improving how it improves").
 */
export function improveEpisodes(
  seeds: readonly IntelligenceGenome[],
  meta: MetaLearner,
  evaluator: Evaluator,
  rounds: number,
): Episode[] {
  return seeds.map(seed => ({ seed, rounds: improveRounds(seed, meta, evaluator, rounds) }))
}

/** A digest of a run, for the determinism check. */
export function roundsDigest(rounds: readonly Round[]): string {
  return rounds
    .map(
      r =>
        `${r.round}:${genomeKey(r.best)}:${r.bestResult.meanQ}:${r.proposals.map(p => `${p.candidate.edit}=${p.evaluation.meanQ}/${p.hit ? 1 : 0}`).join(',')}`,
    )
    .join(';')
}
