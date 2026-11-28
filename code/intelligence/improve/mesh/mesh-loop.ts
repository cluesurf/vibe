/**
 * Level 6, slice 3: E-CMP-0031's bounded improvement loop with its selection made by the mesh. The
 * proposer proposes children of the parent as before; the evaluator grades each candidate alone; then a tournament in
 * proposal order runs one metered selection solve per child, the incumbent as candidate A and the child as B, and the
 * genome the selection's carrier wrote out becomes the incumbent. The loop never compares two grades itself: it only
 * decodes the word the mesh's read cells handed on (content-code.ts), and a word naming neither candidate keeps the
 * incumbent and is counted.
 *
 * Candidate side, like improve.ts: the face is an argument, never an import, so the loop cannot see how levels are
 * written or how a selection is judged.
 */

import { genomeKey, type IntelligenceGenome } from '@/code/intelligence/genome/genome'
import type { Candidate, Evaluation, MetaLearner } from '@/code/intelligence/improve/evaluation'
import { decodeGenome, sameGenome } from '@/code/intelligence/improve/mesh/content-code'

/** The evaluator as the mesh loop holds it. */
export interface MeshSelectionFace {
  /** a grade on validation, the loop's only split */
  evaluate: (genome: IntelligenceGenome) => Evaluation
  /** one metered selection solve between the incumbent (A) and the challenger (B): the word its carrier wrote, or null */
  select: (incumbent: IntelligenceGenome, challenger: IntelligenceGenome) => number[] | null
}

export interface MeshProposal {
  candidate: Candidate
  evaluation: Evaluation
  /** the mesh made the child the incumbent */
  chosen: boolean
}

export interface MeshRound {
  round: number
  parent: IntelligenceGenome
  baseline: Evaluation
  proposals: MeshProposal[]
  best: IntelligenceGenome
  bestResult: Evaluation
  /** selections whose word decoded to neither candidate */
  carrierFailures: number
}

export interface MeshEpisode {
  seed: IntelligenceGenome
  rounds: MeshRound[]
}

/** One round: propose, grade each child alone, select by the mesh in proposal order. */
export function meshImprove(round: number, genome: IntelligenceGenome, meta: MetaLearner, face: MeshSelectionFace): MeshRound {
  const baseline = face.evaluate(genome)
  const candidates = meta.propose(genome, baseline)
  const proposals: MeshProposal[] = []

  let incumbent = genome
  let incumbentResult = baseline
  let carrierFailures = 0

  for (const candidate of candidates) {
    const result = face.evaluate(candidate.genome)
    const word = face.select(incumbent, candidate.genome)
    const carried = word === null ? null : decodeGenome(word)

    let chosen = false

    if (carried !== null && sameGenome(carried, candidate.genome)) {
      chosen = true
    } else if (carried === null || !sameGenome(carried, incumbent)) {
      carrierFailures++
    }

    proposals.push({ candidate, evaluation: result, chosen })

    if (chosen) {
      incumbent = candidate.genome
      incumbentResult = result
    }

    meta.learn(candidate, result, chosen)
  }

  return { round, parent: genome, baseline, proposals, best: incumbent, bestResult: incumbentResult, carrierFailures }
}

/** `rounds` rounds from each seed in order, one proposer carried through them all (as improveEpisodes). */
export function meshImproveEpisodes(
  seeds: readonly IntelligenceGenome[],
  meta: MetaLearner,
  face: MeshSelectionFace,
  rounds: number,
): MeshEpisode[] {
  return seeds.map(seed => {
    const out: MeshRound[] = []

    let genome = seed

    for (let round = 1; round <= rounds; round++) {
      const record = meshImprove(round, genome, meta, face)

      out.push(record)
      genome = record.best
    }

    return { seed, rounds: out }
  })
}

/** A digest of a run, for the determinism check. */
export function meshDigest(episodes: readonly MeshEpisode[]): string {
  return episodes
    .map(episode =>
      episode.rounds
        .map(r => `${r.round}:${genomeKey(r.best)}:${r.bestResult.meanQ}:${r.proposals.map(p => `${p.candidate.edit}=${p.evaluation.meanQ}/${p.chosen ? 1 : 0}`).join(',')}`)
        .join(';'),
    )
    .join('|')
}
