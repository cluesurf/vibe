// P66: reincarnation as pattern persistence.
// A self is a pattern, not the particular vibes it is made of (see how-selves-live-move-and-evolve).
// So the deep question: can the same pattern survive when ALL of its material is replaced, and can
// it reconstitute after it has fully dissolved? We test both on a memory mesh (a stored attractor,
// reusing the Hopfield machinery of P65):
//   1. Persistence through total turnover (the Ship of Theseus, cellular replacement): keep the
//      self while overwriting its tones in rounds until every tone has been replaced at least once.
//      The self survives though none of its original material remains.
//   2. Reconstitution from a seed after full dissolution (reincarnation proper): randomize the
//      whole mesh so the self is gone, then plant a small fragment of the pattern and let it
//      re-form. The self returns on entirely fresh material from a seed.
// The vibes are never destroyed, only the pattern dissolves and re-forms, which is the model's
// sense in which a self is independent of its substrate. Run: npx tsx code/experiment/p66-reincarnation.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/tool/rng'
import { storedPatterns, hebbianFills, step, overlap } from '~/experiment/p65-dreaming-and-waking'

function settle(J: Int8Array[], state: Int8Array, steps: number): Int8Array {
  const zero = new Float64Array(state.length)
  let t = state
  for (let i = 0; i < steps; i++) t = step(J, t, zero, null)
  return t
}

export function reincarnation(input: { seed: number }): {
  turnoverReached: number
  persistThroughTurnover: number
  reconstituteFromSeed: number
  dissolvedOverlap: number
  solved: boolean
} {
  const size = 120
  const rng = makeRng({ seed: input.seed })
  const P = (storedPatterns(1, size, rng)[0] ?? new Int8Array(size))
  const J = hebbianFills([P], size)

  // 1. Persistence through total turnover. Hold the self, then overwrite tones a fraction at a
  // time (new material), healing after each batch, until every tone has been replaced.
  let state = Int8Array.from(P)
  const seen = new Set<number>()
  const tr = makeRng({ seed: input.seed + 1 })
  let rounds = 0
  while (seen.size < size && rounds < 1000) {
    for (let k = 0; k < Math.round(0.2 * size); k++) {
      const v = tr.nextInt({ max: size })
      state[v] = (tr.nextInt({ max: 3 }) - 1) as -1 | 0 | 1 // fresh material
      seen.add(v)
    }
    state = settle(J, state, 12) // the self heals the new material into itself
    rounds++
  }
  const turnoverReached = seen.size / size
  const persistThroughTurnover = Math.abs(overlap(state, P))

  // 2. Reconstitution from a seed after full dissolution. Randomize everything (the self dies),
  // then plant a fragment of the pattern and let it re-form on the fresh material.
  let blank = Int8Array.from({ length: size }, () => (tr.nextInt({ max: 3 }) - 1) as -1 | 0 | 1)
  const dissolvedOverlap = Math.abs(overlap(blank, P))
  const seedFraction = 0.35
  for (let i = 0; i < Math.round(seedFraction * size); i++) blank[i] = P[i] as -1 | 0 | 1
  const reborn = settle(J, blank, 30)
  const reconstituteFromSeed = Math.abs(overlap(reborn, P))

  return {
    turnoverReached,
    persistThroughTurnover,
    reconstituteFromSeed,
    dissolvedOverlap,
    // Solved: the self survives 100 percent material turnover, and after full dissolution it
    // reconstitutes from a seed (while the dissolved state had essentially no trace of it).
    solved: turnoverReached >= 0.999 && persistThroughTurnover > 0.9 && dissolvedOverlap < 0.3 && reconstituteFromSeed > 0.9,
  }
}

export function main(): void {
  const r = reincarnation({ seed: 1 })
  console.log('P66: reincarnation as pattern persistence')
  console.log('')
  console.log('  1. Persistence through total turnover (the self kept while all its material is replaced):')
  console.log(`     fraction of the original material replaced: ${(100 * r.turnoverReached).toFixed(0)}%`)
  console.log(`     the self still matches its original pattern: ${(100 * r.persistThroughTurnover).toFixed(0)}% (it persisted)`)
  console.log('')
  console.log('  2. Reconstitution from a seed after full dissolution (the self returns on fresh material):')
  console.log(`     after randomizing everything, trace of the self left: ${(100 * r.dissolvedOverlap).toFixed(0)}% (it had dissolved)`)
  console.log(`     after planting a fragment and re-forming, the self is back: ${(100 * r.reconstituteFromSeed).toFixed(0)}%`)
  console.log('')
  console.log(`  reincarnation as pattern persistence solved: ${r.solved ? 'YES' : 'no'}`)
  console.log('')
  console.log('  A self is a pattern, not its material. We replaced every tone it was made of, healing')
  console.log('  after each batch, and the self persisted intact, the Ship of Theseus made exact: you')
  console.log('  remain yourself though your material is wholly replaced. Then we dissolved the self')
  console.log('  completely into noise and planted only a fragment of its pattern, and it re-formed in')
  console.log('  full on entirely fresh material. The vibes are never destroyed, only the pattern')
  console.log('  dissolves and re-forms, so a self is, in this model, separable in principle from any')
  console.log('  particular substrate, which is the precise sense in which a pattern could persist or')
  console.log('  return across a complete turnover of its material.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
