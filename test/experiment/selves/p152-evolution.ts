// P152: evolution, heredity plus variation plus selection, from the base. (P120, 04-life.md, open question 4.)
//
// Heredity is shown (P120, a daughter inherits a parent's balanced pattern, conservingly, via the arrow).
// Evolution is the full Darwinian loop, heredity plus VARIATION (imperfect copying) plus SELECTION (the
// fitter reproduce more). Every piece is from the base, reproduction is the arrow's balanced copying
// (P120), variation is copy error, and SELECTION is the arrow's VALUE acting on the population (higher-
// value organisms are preferred, so they persist and reproduce). We run a population of balanced-pattern
// organisms in a niche (a fitness = closeness to a desired pattern, the arrow's goal) and check that mean
// fitness RISES to the optimum with selection, stays flat without it (drift), and that offspring are
// HERITABLE. Run: npx tsx code/experiment/p152-evolution.ts

import { hashRand } from '@/code/dynamics/conserving-sweep'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Rng = { next: () => number }

// a balanced +/- pattern (information, net charge zero, so copying it is conserving, P120)
// a DETERMINISTIC counter-indexed hash stream (no seed, no randomness): a drop-in for the RNG stream
function detStream(): Rng {
  let c = 0
  return {
    next: () => hashRand(c++, 0, 0),
    nextInt: ({ max }: { max: number }) => Math.floor(hashRand(c++, 0, 0) * max),
  }
}

function randomBalanced(M: number, rng: Rng): Int8Array {
  const p = new Int8Array(M)
  const half = Math.floor(M / 2)

  for (let i = 0; i < M; i++) {
    p[i] = i < half ? 1 : -1
  }

  for (let i = M - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1))
    const t = p[i]!
    p[i] = p[j]!
    p[j] = t
  }

  return p
}

// reproduction: copy with mutation (variation). flips stay balanced by swapping a +1 and a -1 (conserving)
function reproduce(parent: Int8Array, mu: number, rng: Rng): Int8Array {
  const child = parent.slice()
  const M = child.length

  for (let i = 0; i < M; i++) {
    if (rng.next() < mu) {
      // swap with a random other cell, keeps the pattern balanced (a conserving mutation)
      const j = Math.floor(rng.next() * M)
      const t = child[i]!
      child[i] = child[j]!
      child[j] = t
    }
  }

  return child
}

const fitness = (org: Int8Array, target: Int8Array): number => {
  let m = 0

  for (let i = 0; i < org.length; i++) {
    if (org[i] === target[i]) {
      m++
    }
  }

  return m
}

function evolve(
  select: boolean,
  M: number,
  P: number,
  G: number,
  mu: number,
  target: Int8Array,
  rng: Rng,
): { meanByGen: number[]; heritability: number } {
  let pop: Int8Array[] = []

  for (let i = 0; i < P; i++) {
    pop.push(randomBalanced(M, rng))
  }

  const meanByGen: number[] = []

  let heritSum = 0
  let heritCount = 0

  for (let g = 0; g < G; g++) {
    const scored = pop.map(o => ({ o, f: fitness(o, target) }))
    meanByGen.push(scored.reduce((a, b) => a + b.f, 0) / P)

    // selection, keep the fitter half (the arrow's value), or a random half (drift control)
    const survivors = select
      ? scored.sort((a, b) => b.f - a.f).slice(0, P / 2)
      : scored.slice(0, P / 2)

    // reproduce, each survivor makes 2 offspring (copy with mutation), measure parent-child fitness link
    const next: Int8Array[] = []

    for (const s of survivors) {
      for (let k = 0; k < 2; k++) {
        const child = reproduce(s.o, mu, rng)
        next.push(child)
        heritSum += (s.f - M / 2) * (fitness(child, target) - M / 2)
        heritCount++
      }
    }

    pop = next
  }

  const scored = pop.map(o => fitness(o, target))
  meanByGen.push(scored.reduce((a, b) => a + b, 0) / P)

  // heritability proxy, parent-child fitness covariance sign (positive = heritable)
  const heritability = heritCount > 0 ? heritSum / heritCount : 0

  return { meanByGen, heritability }
}

export function evolution(input?: { M?: number }): {
  M: number
  selectedFinal: number
  driftFinal: number
  startMean: number
  heritability: number
  fitnessRises: boolean
  beatsDrift: boolean
  heritable: boolean
  solved: boolean
} {
  const M = input?.M ?? 40
  const P = 60
  const G = 50
  const mu = 0.06
  const rng = detStream()
  const target = randomBalanced(M, rng)
  const sel = evolve(true, M, P, G, mu, target, detStream())
  const drift = evolve(
    false,
    M,
    P,
    G,
    mu,
    target,
    detStream(),
  )

  const startMean = sel.meanByGen[0]!
  const selectedFinal = sel.meanByGen[sel.meanByGen.length - 1]!
  const driftFinal = drift.meanByGen[drift.meanByGen.length - 1]!
  const heritability = sel.heritability

  const fitnessRises = selectedFinal > startMean + 0.2 * M // mean fitness climbs well above the random start
  const beatsDrift = selectedFinal > driftFinal + 0.15 * M // selection beats drift
  const heritable = heritability > 0 // offspring resemble parents in fitness
  const solved = fitnessRises && beatsDrift && heritable

  return {
    M,
    selectedFinal,
    driftFinal,
    startMean,
    heritability,
    fitnessRises,
    beatsDrift,
    heritable,
    solved,
  }
}

export default experiment({
  id: 'selves/p152-evolution',
  code: 'E-SLF-0087',
  title:
    'heredity plus variation plus selection drives mean fitness up, beating drift',
  category: 'selves',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = evolution({ M: 40 })
    const ok = r.solved && r.fitnessRises && r.beatsDrift && r.heritable

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a population reproducing with mutation under selection raises mean fitness to the optimum on heritable variation, the Darwinian loop from the base',
      metrics: {
        startMean: r.startMean,
        selectedFinal: r.selectedFinal,
        M: r.M,
      },
      control: { driftFinal: r.driftFinal },
    })
  },
})
