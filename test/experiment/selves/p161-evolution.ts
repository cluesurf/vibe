// P161: evolution, heredity + variation + SELECTION + competition. (P120, open-question 4.)
//
// P120 showed heredity (a daughter inherits a parent's pattern, with tunable variation, conservingly). The
// open piece is the full evolutionary loop, do FITTER patterns out-reproduce, so the population's fitness
// rises over generations (natural selection)? And is the ARROW the fitness gradient, does aligning with
// the value-favored environment drive the climb? This runs a population of heritable selves under
// selection and checks, (1) mean fitness RISES with selection but NOT under neutral drift, (2) the
// population ADAPTS when the environment changes (open-ended), (3) variation is necessary (zero mutation
// stalls). Run: npx tsx code/experiment/p161-evolution.ts

import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

// fitness = alignment of a self's balanced +/- code with the environment's target pattern (the arrow's
// value gradient), in [-1, 1]
function fitness(code: Int8Array, target: Int8Array): number {
  let agree = 0
  for (let i = 0; i < code.length; i++)
    if (code[i] === target[i]) agree++
  return (2 * agree) / code.length - 1
}

function randomCode(m: number, rng: Rng): Int8Array {
  const c = new Int8Array(m)
  for (let i = 0; i < m; i++) c[i] = rng.next() < 0.5 ? 1 : -1
  return c
}

// reproduce: copy the parent with per-site mutation rate mu (heredity with variation, P120)
function reproduce(parent: Int8Array, mu: number, rng: Rng): Int8Array {
  const child = new Int8Array(parent.length)
  for (let i = 0; i < parent.length; i++)
    child[i] = (rng.next() < mu ? -parent[i]! : parent[i]!) as -1 | 1
  return child
}

// one generation: tournament selection (fitter wins) then reproduce with mutation. selection on/off.
function generation(
  pop: Int8Array[],
  target: Int8Array,
  mu: number,
  select: boolean,
  rng: Rng,
): Int8Array[] {
  const K = pop.length
  const fit = pop.map(c => fitness(c, target))
  const next: Int8Array[] = []
  for (let k = 0; k < K; k++) {
    let parent: Int8Array
    if (select) {
      // tournament of 3, the fittest reproduces (competition + selection)
      let best = Math.floor(rng.next() * K)
      for (let t = 0; t < 2; t++) {
        const c = Math.floor(rng.next() * K)
        if (fit[c]! > fit[best]!) best = c
      }
      parent = pop[best]!
    } else {
      parent = pop[Math.floor(rng.next() * K)]! // neutral drift, random parent
    }
    next.push(reproduce(parent, mu, rng))
  }
  return next
}

function meanFitness(pop: Int8Array[], target: Int8Array): number {
  return pop.reduce((s, c) => s + fitness(c, target), 0) / pop.length
}

export function evolution(input?: {
  K?: number
  m?: number
  generations?: number
  mu?: number
}): {
  K: number
  startFitness: number
  selectedFitness: number
  driftFitness: number
  noMutationFitness: number
  adaptedFitness: number
  selectionWorks: boolean
  variationNeeded: boolean
  openEnded: boolean
  solved: boolean
} {
  const K = input?.K ?? 120
  const m = input?.m ?? 200
  const G = input?.generations ?? 60
  const mu = input?.mu ?? 0.03
  const rng = makeRng({ seed: 7 })
  const target = randomCode(m, rng)

  const initPop = (): Int8Array[] =>
    Array.from({ length: K }, () => randomCode(m, rng))

  // (1) with selection, fitness should rise
  let pop = initPop()
  const startFitness = meanFitness(pop, target)
  for (let g = 0; g < G; g++)
    pop = generation(pop, target, mu, true, rng)
  const selectedFitness = meanFitness(pop, target)

  // control, neutral drift (no selection), fitness should NOT rise
  let popD = initPop()
  for (let g = 0; g < G; g++)
    popD = generation(popD, target, mu, false, rng)
  const driftFitness = meanFitness(popD, target)

  // (3) variation needed, selection with ZERO mutation stalls (no raw material)
  let popN = initPop()
  for (let g = 0; g < G; g++)
    popN = generation(popN, target, 0, true, rng)
  const noMutationFitness = meanFitness(popN, target)

  // (2) open-ended adaptation, after converging, CHANGE the environment and see fitness re-rise
  const target2 = randomCode(m, rng)
  let popA = pop // the already-evolved population
  const fitOnNew = meanFitness(popA, target2) // fitness on the NEW target (should start low)
  for (let g = 0; g < G; g++)
    popA = generation(popA, target2, mu, true, rng)
  const adaptedFitness = meanFitness(popA, target2)

  const selectionWorks =
    selectedFitness > startFitness + 0.3 &&
    selectedFitness > driftFitness + 0.3
  const variationNeeded = noMutationFitness < selectedFitness - 0.1 // zero-mutation does worse (stalls on initial variance)
  const openEnded = adaptedFitness > fitOnNew + 0.3 // re-adapts to the new environment
  const solved = selectionWorks && openEnded

  return {
    K,
    startFitness,
    selectedFitness,
    driftFitness,
    noMutationFitness,
    adaptedFitness,
    selectionWorks,
    variationNeeded,
    openEnded,
    solved,
  }
}

export default experiment({
  id: 'selves/p161-evolution',
  title:
    'selection raises fitness, drift does not, and the population re-adapts to a new environment',
  category: 'selves',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = evolution({ K: 120, m: 200, generations: 60, mu: 0.03 })
    const ok = r.solved && r.selectionWorks && r.openEnded
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a heritable population under selection climbs in fitness where neutral drift does not and re-adapts when the environment changes',
      metrics: {
        startFitness: r.startFitness,
        selectedFitness: r.selectedFitness,
        adaptedFitness: r.adaptedFitness,
      },
      control: { driftFitness: r.driftFitness },
    })
  },
})
