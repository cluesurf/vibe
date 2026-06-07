// P43: freedom and choice, modeled and tested.
// This implements the account in note/research (the freedom-and-choice writeup): a self
// is a stable attractor, a choice is the self resolving an urge from a subtler layer, and
// the result is determined (no randomness) yet not predetermined by any part and not
// shortcut-able (computationally irreducible). We model a self as a small Hopfield
// network (its stored patterns are the options it can settle into) and an urge as a bias
// field from the subtle layer. We then test five claims:
//   1. Determinism: the same self and urge always give the same choice (not random).
//   2. Self-determination: the same urge gives different selves different choices, so the
//      self's own structure is a real cause, not a passive channel.
//   3. The urge matters too: the same self under different urges can choose differently,
//      so neither the self alone nor the urge alone fixes the outcome (no part suffices).
//   4. Agency scales with structure: a stronger self imposes its own pattern over the urge.
//   5. Irreducibility: the choice takes several beats to settle and is not the one-step
//      response to the urge, so it must be lived out, not read off.
// Run: npx tsx code/experiment/p43-freedom-choice.ts

import { pathToFileURL } from 'node:url'
import { makeRng, Rng } from '~/core/rng'

type Tone = -1 | 0 | 1

function ternaryVector(n: number, rng: Rng): Int8Array {
  const v = new Int8Array(n)
  for (let i = 0; i < n; i++) {
    v[i] = (rng.nextInt({ max: 3 }) - 1) as Tone
  }
  return v
}

// A self: M stored patterns (the options it can settle into), the Hopfield attractors.
function makeSelf(input: { n: number; patterns: number; seed: number }): Int8Array[] {
  const rng = makeRng({ seed: input.seed })
  return Array.from({ length: input.patterns }, () => ternaryVector(input.n, rng))
}

function overlap(a: Int8Array, b: Int8Array): number {
  let s = 0
  for (let i = 0; i < a.length; i++) {
    s += (a[i] ?? 0) * (b[i] ?? 0)
  }
  return s / a.length
}

// Settle the self under an urge, from a neutral start. The local field is the Hopfield
// field of the self (its own structure) plus the urge bias from the subtle layer. Returns
// the chosen state and the number of beats it took (its settling time).
function settle(input: {
  patterns: Int8Array[]
  coupling: number
  urge: Int8Array
  urgeWeight: number
  init: Int8Array
  maxBeats?: number
}): { state: Int8Array; beats: number } {
  const n = input.init.length
  let state = Int8Array.from(input.init)
  const maxBeats = input.maxBeats ?? 100
  let beats = 0
  for (let b = 0; b < maxBeats; b++) {
    // Pattern overlaps with the current state (the Hopfield projection).
    const proj = input.patterns.map((xi) => {
      let o = 0
      for (let j = 0; j < n; j++) {
        o += (xi[j] ?? 0) * (state[j] ?? 0)
      }
      return o / n
    })
    const next = new Int8Array(n)
    let changed = false
    for (let i = 0; i < n; i++) {
      let h = input.urgeWeight * (input.urge[i] ?? 0)
      for (let m = 0; m < input.patterns.length; m++) {
        h += input.coupling * (input.patterns[m]![i] ?? 0) * (proj[m] ?? 0)
      }
      const t: Tone = h > 1e-12 ? 1 : h < -1e-12 ? -1 : 0
      next[i] = t
      if (t !== state[i]) {
        changed = true
      }
    }
    state = next
    beats++
    if (!changed) {
      break
    }
  }
  return { state, beats }
}

export function freedomChoice(input: { n: number; seed: number }): {
  deterministic: boolean
  selfDiversity: number
  urgeCanFlip: boolean
  agencyMonotone: boolean
  agencyByCoupling: { coupling: number; selfOverlap: number; urgeOverlap: number }[]
  meanSettlingBeats: number
  irreducible: boolean
} {
  const n = input.n
  const rng = makeRng({ seed: input.seed })
  const init = new Int8Array(n) // neutral start, all zero
  const urge = ternaryVector(n, makeRng({ seed: input.seed + 100 }))

  // 1. Determinism: same self and urge, run twice, identical.
  const selfA = makeSelf({ n, patterns: 2, seed: input.seed + 1 })
  const r1 = settle({ patterns: selfA, coupling: 1, urge, urgeWeight: 1, init })
  const r2 = settle({ patterns: selfA, coupling: 1, urge, urgeWeight: 1, init })
  let deterministic = true
  for (let i = 0; i < n; i++) {
    if (r1.state[i] !== r2.state[i]) {
      deterministic = false
    }
  }

  // 2. Self-determination: same urge, different selves, compare choices.
  const selves = Array.from({ length: 8 }, (_, k) => makeSelf({ n, patterns: 2, seed: input.seed + 10 + k }))
  const outcomes = selves.map((s) => settle({ patterns: s, coupling: 1, urge, urgeWeight: 1, init }).state)
  let pairSum = 0
  let pairCount = 0
  for (let a = 0; a < outcomes.length; a++) {
    for (let b = a + 1; b < outcomes.length; b++) {
      pairSum += 1 - overlap(outcomes[a]!, outcomes[b]!) // 0 = identical, up to 2
      pairCount++
    }
  }
  const selfDiversity = pairSum / Math.max(1, pairCount)

  // 3. The urge matters: same self, several urges, see if the choice changes.
  const baseChoice = settle({ patterns: selfA, coupling: 1, urge, urgeWeight: 1, init }).state
  let urgeCanFlip = false
  for (let k = 0; k < 8; k++) {
    const u2 = ternaryVector(n, makeRng({ seed: input.seed + 500 + k }))
    const c2 = settle({ patterns: selfA, coupling: 1, urge: u2, urgeWeight: 1, init }).state
    if (overlap(baseChoice, c2) < 0.9) {
      urgeCanFlip = true
    }
  }

  // 4. Agency scales with structure: stronger self coupling imposes the self over the urge.
  const couplings = [0.3, 1, 3, 9]
  const agencyByCoupling = couplings.map((c) => {
    const out = settle({ patterns: selfA, coupling: c, urge, urgeWeight: 1, init }).state
    const selfOverlap = Math.max(...selfA.map((xi) => Math.abs(overlap(out, xi))))
    const urgeOverlap = Math.abs(overlap(out, urge))
    return { coupling: c, selfOverlap, urgeOverlap }
  })
  let agencyMonotone = true
  for (let i = 1; i < agencyByCoupling.length; i++) {
    if ((agencyByCoupling[i]!.selfOverlap ?? 0) < (agencyByCoupling[i - 1]!.selfOverlap ?? 0) - 1e-9) {
      agencyMonotone = false
    }
  }

  // 5. Irreducibility: settling takes several beats, and the choice is not the one-step
  // response to the urge alone.
  let beatSum = 0
  let beatCount = 0
  let differsFromOneStep = 0
  for (let k = 0; k < 8; k++) {
    const s = selves[k % selves.length]!
    const u = ternaryVector(n, makeRng({ seed: input.seed + 900 + k }))
    const res = settle({ patterns: s, coupling: 2, urge: u, urgeWeight: 1, init })
    beatSum += res.beats
    beatCount++
    // One-step prediction from the urge alone (the naive shortcut).
    let diff = 0
    for (let i = 0; i < n; i++) {
      const oneStep: Tone = (u[i] ?? 0) > 0 ? 1 : (u[i] ?? 0) < 0 ? -1 : 0
      if (res.state[i] !== oneStep) {
        diff++
      }
    }
    if (diff / n > 0.1) {
      differsFromOneStep++
    }
  }
  const meanSettlingBeats = beatSum / Math.max(1, beatCount)
  const irreducible = meanSettlingBeats > 1.5 && differsFromOneStep >= 5

  return {
    deterministic,
    selfDiversity,
    urgeCanFlip,
    agencyMonotone,
    agencyByCoupling,
    meanSettlingBeats,
    irreducible,
  }
}

export function main(): void {
  const r = freedomChoice({ n: 80, seed: 1 })
  console.log('P43: freedom and choice, modeled and tested')
  console.log('')
  console.log(`  1. determinism (same self and urge always give the same choice): ${r.deterministic ? 'YES' : 'no'} (not random)`)
  console.log(`  2. self-determination (same urge, different selves choose differently): diversity ${r.selfDiversity.toFixed(2)} > 0: ${r.selfDiversity > 0.05 ? 'YES' : 'no'}`)
  console.log(`  3. the urge matters too (same self, different urges can flip the choice): ${r.urgeCanFlip ? 'YES' : 'no'}`)
  console.log('  4. agency scales with structure (a stronger self imposes itself over the urge):')
  for (const a of r.agencyByCoupling) {
    console.log(`       coupling ${a.coupling.toString().padStart(3)}: overlap with self ${a.selfOverlap.toFixed(2)}, with urge ${a.urgeOverlap.toFixed(2)}`)
  }
  console.log(`     self-overlap rises with coupling: ${r.agencyMonotone ? 'YES' : 'no'}`)
  console.log(`  5. irreducibility (the choice takes ${r.meanSettlingBeats.toFixed(1)} beats to settle and is not the one-step response): ${r.irreducible ? 'YES' : 'no'}`)
  console.log('')
  console.log('  So the choice is fully DETERMINED (it reproduces exactly, no randomness), yet it')
  console.log('  is jointly authored by the self AND the urge (neither part alone fixes it), the')
  console.log('  self\'s own structure is a real cause whose say grows with its depth, and the')
  console.log('  outcome is computationally irreducible (it must be settled out beat by beat, not')
  console.log('  read off in one step). That is freedom as the writeup describes it: not random,')
  console.log('  not predetermined by any part, not shortcut-able, but self-determined and lived.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
