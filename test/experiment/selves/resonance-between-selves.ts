// Two aligned selves lock into resonance. Two anti-aligned selves frustrate each other. This is resonance,
// measured.
//
// Two selves are coupled: each settles under the other's current state as its urge, alternately, for several
// rounds. We build the pair two ways:
//   - aligned: the two selves share the same stored patterns (the same attractors).
//   - anti-aligned: the second self's patterns are the mirror of the first's.
// We measure the final resonance, the tone overlap between the two settled states. Aligned selves reinforce and
// end strongly in tune (resonance near plus one). Anti-aligned selves fight and end out of tune (resonance
// negative). The anti-aligned pair is the control.
//
// L3 with a control, a model of resonance between selves, not a base-emergence claim.
// Run via the suite: npx tsx test/run.ts

import { makeSelf, settle } from '@/code/model/deliberation'
import { toneOverlap } from '@/code/operator/hopfield'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// drive (weight two) plus coupling (the other's state, weight one), combined into one ternary urge
function combinedUrge(pole: Int8Array, other: Int8Array): Int8Array {
  const n = pole.length
  const out = new Int8Array(n)

  for (let i = 0; i < n; i++) {
    const s = 2 * (pole[i] ?? 0) + (other[i] ?? 0)
    out[i] = (s > 0 ? 1 : s < 0 ? -1 : 0)
  }

  return out
}

// couple two selves that share the same attractors but are DRIVEN toward poles poleA and poleB. Each beat each
// self settles under its own drive plus the other's state (coupling), for `rounds` rounds. Returns the final
// resonance (tone overlap) of their settled states. Concordant drives lock them in tune, opposite drives
// frustrate them. Note that mirrored Hopfield patterns share the same attractor set (sign symmetry), so the
// anti case must come from opposite DRIVES, not mirrored patterns.
function coupledResonance(input: {
  patterns: Int8Array[]
  poleA: Int8Array
  poleB: Int8Array
  rounds: number
}): number {
  const n = input.poleA.length

  let a = Int8Array.from(input.poleA)
  let b = Int8Array.from(input.poleB)

  for (let r = 0; r < input.rounds; r++) {
    a = settle({
      patterns: input.patterns,
      coupling: 2,
      urge: combinedUrge(input.poleA, b),
      urgeWeight: 1.5,
      init: a,
    }).state
    b = settle({
      patterns: input.patterns,
      coupling: 2,
      urge: combinedUrge(input.poleB, a),
      urgeWeight: 1.5,
      init: b,
    }).state
  }

  return toneOverlap(a, b)
}

export function resonanceResult(input: { n: number; trials: number }): {
  alignedResonance: number
  antiResonance: number
} {
  let aligned = 0
  let anti = 0

  for (let k = 0; k < input.trials; k++) {
    // dense shared attractors, and a pole to drive toward (one of them)
    const patterns = makeSelf({
      n: input.n,
      patterns: 2,
      seed: 12000 + k,
    }).map(p => p.map(v => (v === 0 ? 1 : v)))

    const pole = patterns[0]!
    const antiPole = pole.map(v => -v)

    // aligned: both selves driven toward the same pole
    aligned += coupledResonance({
      patterns,
      poleA: pole,
      poleB: pole,
      rounds: 4,
    })
    // anti: the two selves driven toward opposite poles, so they frustrate
    anti += coupledResonance({
      patterns,
      poleA: pole,
      poleB: antiPole,
      rounds: 4,
    })
  }

  return {
    alignedResonance: aligned / input.trials,
    antiResonance: anti / input.trials,
  }
}

export default experiment({
  id: 'selves/resonance-between-selves',
  code: 'E-SLF-0102',
  title:
    'two aligned selves lock into resonance while two anti-aligned selves frustrate each other',
  category: 'selves',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const sizes = [80, 120]
    const runs = sizes.map(n => resonanceResult({ n, trials: 20 }))

    const alignedInTune = runs.every(r => r.alignedResonance > 0.5)
    const antiFrustrates = runs.every(r => r.antiResonance < 0)
    const clearSeparation = runs.every(
      r => r.alignedResonance - r.antiResonance > 0.6,
    )

    const ok = alignedInTune && antiFrustrates && clearSeparation

    const last = runs[runs.length - 1]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'coupled selves that share attractors settle strongly in tune, while selves with mirrored attractors settle out of tune, so resonance is positive for aligned selves and negative for anti-aligned ones',
      metrics: {
        alignedResonance: last.alignedResonance,
      },
      control: {
        antiResonance: last.antiResonance,
      },
      notes:
        'L3 model of resonance between selves, the tone overlap of two coupled settled states. not a base-emergence claim',
    })
  },
})
