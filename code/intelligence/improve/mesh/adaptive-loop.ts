/**
 * Level 6, slice 4 (level6.md): the improve loop whose proposer adapts only through the mesh. Each round the proposer
 * proposes children of the parent, the lead edit first when the lead names one, then the fixed order. A tournament in
 * proposal order runs one metered adaptive step per child (adaptive-step.ts): the mesh selects between the incumbent
 * and the child, carries the winner's tag into the steer runs, and the mux reads the next lead (the child's edit when
 * the child won, the old lead when it lost). The loop decodes the winner's genome and hands the lead read to the
 * proposer and to the next step. The proposer hears nothing else: no grade, no adoption, no baseline (item 0040), and
 * the face hands the loop no grade either; the experiment runs the proposer isolated.
 *
 * Candidate side, like improve.ts: the face is an argument, never an import. Exact, no random numbers.
 */

import { genomeKey, validateGenome, type IntelligenceGenome } from '@/code/intelligence/genome/genome'
import type { Candidate } from '@/code/intelligence/improve/evaluation'
import { EDITS } from '@/code/intelligence/improve/meta-learner'
import { CONTENT_TRITS, decodeGenome, encodeGenome, sameGenome } from '@/code/intelligence/improve/mesh/content-code'

/** bits of a lead, and the sentinel index naming no edit */
export const LEAD_BITS = 5
export const LEAD_NONE = 2 ** LEAD_BITS - 1

/** trits of a content word: the genome, then the tag */
export const STEP_CONTENT_TRITS = CONTENT_TRITS + 1

export type Excitations = readonly [number, number]

/** a genome's content word over the cell's two excitations (bit 0 the first, bit 1 the second) */
export function toneWord(genome: IntelligenceGenome, ex: Excitations): number[] {
  return encodeGenome(genome).map(t => (t === 1 ? ex[1] : ex[0]))
}

/** the genome a word over the excitations names, or null */
export function genomeOfTones(word: readonly number[], ex: Excitations): IntelligenceGenome | null {
  if (!word.every(t => t === ex[0] || t === ex[1])) {
    return null
  }

  return decodeGenome(word.map(t => (t === ex[1] ? 1 : -1)))
}

/** a value as `bits` bits over the excitations, most significant first */
export function bitsOf(value: number, bits: number, ex: Excitations): number[] {
  return Array.from({ length: bits }, (_, j) => (Math.floor(value / 2 ** (bits - 1 - j)) % 2 === 1 ? ex[1] : ex[0]))
}

/** the value of a word over the excitations, or null when a trit is neither */
export function valueOf(word: readonly number[], ex: Excitations): number | null {
  let value = 0

  for (const t of word) {
    if (t !== ex[0] && t !== ex[1]) {
      return null
    }

    value = value * 2 + (t === ex[1] ? 1 : 0)
  }

  return value
}

/** an edit's index on the fixed order */
export function editIndex(id: string): number {
  const index = EDITS.findIndex(e => e.id === id)

  if (index < 0) {
    throw new Error(`adaptive-loop: no edit ${id}`)
  }

  return index
}

/**
 * A proposer that hears only the parent genome and the lead (item 0040: no grade, no baseline). The experiment runs the
 * lead proposer isolated (improve/judge/lead-session.ts), as decision 001 runs every candidate.
 */
export interface LeadProposer {
  id: string
  propose: (genome: IntelligenceGenome, lead: readonly number[]) => Candidate[]
}

export interface LeadProposerOptions { proposals: number; ex: Excitations; pinNone?: boolean }

/**
 * The lead proposer: the first `proposals` edits, in the fixed order with the lead edit moved first, that make a valid
 * genome never proposed before. With the lead naming no edit it is the fixed-order proposer.
 */
export function leadProposer(options: LeadProposerOptions): LeadProposer & { leadFirst: () => number } {
  const seen = new Set<string>()

  let leadFirst = 0

  return {
    id: options.pinNone === true ? 'lead-proposer-pinned' : 'lead-proposer',
    propose(genome, lead) {
      seen.add(genomeKey(genome))

      const value = options.pinNone === true ? LEAD_NONE : valueOf(lead, options.ex)
      const first = value !== null && value < EDITS.length ? EDITS[value]! : null
      const order = first === null ? EDITS : [first, ...EDITS.filter(e => e !== first)]

      const pick = (edits: readonly (typeof EDITS)[number][]): Candidate[] => {
        const local = new Set<string>()
        const out: Candidate[] = []

        for (const e of edits) {
          if (out.length >= options.proposals) {
            break
          }

          const child = e.apply(genome)

          if (child === null || validateGenome(child).length > 0) {
            continue
          }

          const key = genomeKey(child)

          if (seen.has(key) || local.has(key)) {
            continue
          }

          local.add(key)
          out.push({ genome: child, parentVersion: genome.version, edit: e.id, description: `${e.id} (${e.mechanism})` })
        }

        return out
      }

      const out = pick(order)

      if (first !== null && pick(EDITS).map(c => c.edit).join(',') !== out.map(c => c.edit).join(',')) {
        leadFirst++
      }

      for (const c of out) {
        seen.add(genomeKey(c.genome))
      }

      return out
    },
    leadFirst: () => leadFirst,
  }
}

/**
 * The lead proposer as an isolated candidate (item 0040): the sandbox builds it from data, and its methods take only
 * plain data, the parent genome and the lead's trits. `leadFirst` reports how many proposals the lead reordered.
 */
export function leadProposerCandidate(args: unknown): LeadProposer & { leadFirst: () => number } {
  const options = args as LeadProposerOptions | null

  if (
    options === null ||
    typeof options !== 'object' ||
    !Number.isInteger(options.proposals) ||
    !Array.isArray(options.ex) ||
    options.ex.length !== 2 ||
    (options.pinNone !== undefined && typeof options.pinNone !== 'boolean')
  ) {
    throw new Error('adaptive-loop: lead proposer arguments are malformed')
  }

  return leadProposer({ proposals: options.proposals, ex: [options.ex[0], options.ex[1]], pinNone: options.pinNone })
}

/**
 * The evaluator as the adaptive loop holds it. Item 0040: nothing the loop is told carries a grade. `evaluate` has the
 * evaluator grade a genome on validation and returns nothing; `step` returns only the word the step's carrier wrote.
 */
export interface AdaptiveFace {
  /** the evaluator grades the genome on validation, the loop's only split; the loop is told nothing */
  evaluate: (genome: IntelligenceGenome) => void
  /** one metered step between the incumbent (A) and the challenger (B): the output word its carrier wrote, or null */
  step: (incumbent: IntelligenceGenome, challenger: IntelligenceGenome, edit: string, lead: readonly number[]) => number[] | null
}

export interface AdaptiveProposal {
  candidate: Candidate
  chosen: boolean
  /** the lead after this step, as its value (null when the read names no value) */
  lead: number | null
}

export interface AdaptiveRound {
  round: number
  parent: IntelligenceGenome
  proposals: AdaptiveProposal[]
  best: IntelligenceGenome
  carrierFailures: number
}

export interface AdaptiveEpisode {
  seed: IntelligenceGenome
  rounds: AdaptiveRound[]
}

/** `rounds` rounds from each seed in order, one proposer and one lead carried through them all. */
export function adaptiveEpisodes(
  seeds: readonly IntelligenceGenome[],
  proposer: LeadProposer,
  face: AdaptiveFace,
  rounds: number,
  options: { ex: Excitations; tagA: number; tagB: number; steer: boolean },
): AdaptiveEpisode[] {
  const { ex, tagA, tagB, steer } = options

  let lead = bitsOf(LEAD_NONE, LEAD_BITS, ex)

  return seeds.map(seed => {
    const out: AdaptiveRound[] = []

    let genome = seed

    for (let round = 1; round <= rounds; round++) {
      face.evaluate(genome)

      const candidates = proposer.propose(genome, lead)
      const proposals: AdaptiveProposal[] = []

      let incumbent = genome
      let carrierFailures = 0

      for (const candidate of candidates) {
        face.evaluate(candidate.genome)

        const word = face.step(incumbent, candidate.genome, candidate.edit, lead)
        const winner = word === null || word.length < STEP_CONTENT_TRITS ? null : genomeOfTones(word.slice(0, CONTENT_TRITS), ex)
        const tag = word?.[CONTENT_TRITS]

        let chosen = false

        if (winner !== null && sameGenome(winner, candidate.genome) && tag === tagB) {
          chosen = true
        } else if (winner === null || !sameGenome(winner, incumbent) || tag !== tagA) {
          carrierFailures++
        }

        if (steer && word !== null && word.length === STEP_CONTENT_TRITS + LEAD_BITS) {
          lead = word.slice(STEP_CONTENT_TRITS)
        }

        proposals.push({ candidate, chosen, lead: valueOf(lead, ex) })

        if (chosen) {
          incumbent = candidate.genome
        }
      }

      out.push({ round, parent: genome, proposals, best: incumbent, carrierFailures })
      genome = incumbent
    }

    return { seed, rounds: out }
  })
}

/**
 * A digest of a run, for the determinism and equivalence checks: every round's best genome and every proposal's edit,
 * choice and lead (item 0040: the loop holds no grade, so none is in the digest; a grade is a function of the genome).
 */
export function adaptiveDigest(episodes: readonly AdaptiveEpisode[]): string {
  return episodes
    .map(episode =>
      episode.rounds
        .map(r => `${r.round}:${genomeKey(r.best)}:${r.proposals.map(p => `${p.candidate.edit}/${p.chosen ? 1 : 0}/${p.lead ?? 'x'}`).join(',')}`)
        .join(';'),
    )
    .join('|')
}
