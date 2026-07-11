// P165: a large evolving ecology of planning agents. (P152, P153, open question, life + mind together.)
//
// Evolution (P152) and the integrated planning agent (P153) exist separately. Here they run TOGETHER, a
// POPULATION of planning agents, each with a genome (its lookahead HORIZON), competing on a barrier task.
// Fitness = goal-progress minus the cost of foresight (bigger horizon plans better but costs more). We
// evolve the population (select the fitter, reproduce with mutation) and check, (a) average problem-solving
// RISES over generations (evolving intelligence), and (b) the population ADAPTS its foresight to the task,
// a HARDER task (wider barriers) evolves a LARGER horizon than an EASY one. Intelligence that evolves and
// adapts, from the base. Run: npx tsx code/experiment/p165-evolving-ecology.ts

import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

// a task = a SEQUENCE of barriers with INCREASING span requirements (later barriers need more foresight).
// This is the P140/P143 mechanism, an agent crosses a barrier iff its lookahead horizon spans it. Increasing
// spans give a smooth fitness gradient (crossing more barriers needs progressively more horizon).
function makeBarriers(B: number, base: number, step: number): number[] {
  const reqs: number[] = []

  for (let k = 0; k < B; k++) reqs.push(base + k * step)
  // the horizon needed to cross barrier k

  return reqs
}

// the integrated re-planning agent, crosses barriers in order while its horizon spans them (P143), returns
// the fraction of the barrier sequence crossed (goal-progress)
function agentReach(reqs: number[], horizon: number): number {
  let crossed = 0

  for (const req of reqs) {
    if (horizon >= req) {
      crossed++
    } // the horizon spans this barrier, the re-planning loop crosses it
    else break
    // stuck at the first barrier the horizon cannot span
  }

  return crossed / reqs.length
}

// evolve a population whose genome is the lookahead horizon; fitness = reach minus foresight cost
function evolvePopulation(
  reqs: number[],
  cost: number,
  rng: Rng,
): {
  meanFitnessByGen: number[]
  finalMeanHorizon: number
  finalMeanReach: number
} {
  const P = 60
  const G = 60

  let pop: number[] = []

  for (let i = 0; i < P; i++) pop.push(1 + Math.floor(rng.next() * 4))
  // random small initial horizons

  const meanFitnessByGen: number[] = []

  for (let g = 0; g < G; g++) {
    const scored = pop.map(h => ({
      h,
      f: agentReach(reqs, h) - cost * h,
    }))

    meanFitnessByGen.push(scored.reduce((a, b) => a + b.f, 0) / P)

    const survivors = scored.sort((a, b) => b.f - a.f).slice(0, P / 2)
    const next: number[] = []

    for (const s of survivors) {
      for (let k = 0; k < 2; k++) {
        const step = 1 + Math.floor(rng.next() * 3) // mutate by 1, 2, or 3 (enough to climb the barrier gaps)

        let h = s.h + (rng.next() < 0.5 ? -step : step)

        h = Math.max(1, Math.min(60, h))
        next.push(h)
      }
    }

    pop = next
  }

  const finalMeanHorizon = pop.reduce((a, b) => a + b, 0) / pop.length
  const finalMeanReach =
    pop.reduce((a, b) => a + agentReach(reqs, b), 0) / pop.length

  return { meanFitnessByGen, finalMeanHorizon, finalMeanReach }
}

export function evolvingEcology(): {
  easyHorizon: number
  hardHorizon: number
  easyReach: number
  hardReach: number
  startFitness: number
  endFitness: number
  fitnessRises: boolean
  adaptsToDifficulty: boolean
  bothSolve: boolean
  solved: boolean
} {
  const cost = 0.003
  const easyReqs = makeBarriers(3, 2, 2) // easy, 3 barriers needing horizon 2, 4, 6
  const hardReqs = makeBarriers(6, 3, 3) // hard, 6 barriers needing horizon 3, 6, 9, 12, 15, 18
  const easy = evolvePopulation(easyReqs, cost, makeRng({ seed: 12 }))
  const hard = evolvePopulation(hardReqs, cost, makeRng({ seed: 21 }))

  const startFitness = hard.meanFitnessByGen[0]!
  const endFitness =
    hard.meanFitnessByGen[hard.meanFitnessByGen.length - 1]!

  const fitnessRises = endFitness > startFitness + 0.1
  const adaptsToDifficulty =
    hard.finalMeanHorizon > easy.finalMeanHorizon + 2 // harder task evolves bigger foresight

  const bothSolve =
    easy.finalMeanReach > 0.85 && hard.finalMeanReach > 0.85 // most of each population solves

  const solved = fitnessRises && adaptsToDifficulty && bothSolve

  return {
    easyHorizon: easy.finalMeanHorizon,
    hardHorizon: hard.finalMeanHorizon,
    easyReach: easy.finalMeanReach,
    hardReach: hard.finalMeanReach,
    startFitness,
    endFitness,
    fitnessRises,
    adaptsToDifficulty,
    bothSolve,
    solved,
  }
}

export default experiment({
  id: 'selves/evolving-ecology',
  code: 'E-SLF-0047',
  title:
    'a population of planning agents evolves better problem-solving and adapts its foresight',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = evolvingEcology()
    const ok =
      r.solved && r.fitnessRises && r.adaptsToDifficulty && r.bothSolve

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a population whose genome is its lookahead horizon raises average problem-solving over generations and evolves a larger horizon for a harder task',
      metrics: {
        startFitness: r.startFitness,
        endFitness: r.endFitness,
        easyHorizon: r.easyHorizon,
        hardHorizon: r.hardHorizon,
      },
    })
  },
})
