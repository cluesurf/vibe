// The base valence arrow points at PEACE, not pleasure. Opposed tones resolve toward peace, agreeing tones
// persist. So the rule resolves CONFLICT toward the center, it does not drain excitation toward a pole.
//
// On a ring, we run the conserving perception rule (the share or annihilate move) from two starts:
//   - opposed: alternating pain and pleasure, all in conflict. It should relax to peace (all rest).
//   - agreeing: all pleasure, no conflict. It should persist (conservation forbids it draining to peace).
// We measure the excitation (nonzero density) over beats, and that charge is conserved throughout. The opposed
// start resolves to peace, the agreeing start (the control) stays put. This is the precise base valence arrow:
// conflict resolves toward peace, agreement is stable.
//
// L2 with a control, deterministic (no zeros and the arrow off, so only the annihilate move fires).
// Run via the suite: npx tsx test/run.ts

import { toCSR, beat, totalCharge } from '@/code/model/self-kit'
import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function ring(n: number): ReturnType<typeof toCSR> {
  const neighbors: number[][] = []

  for (let i = 0; i < n; i++)
    neighbors.push([(i - 1 + n) % n, (i + 1) % n])

  return toCSR(neighbors)
}

function nonzeroDensity(tone: Int8Array): number {
  let c = 0

  for (const value of tone) {
    if (value !== 0) {
      c++
    }
  }

  return c / tone.length
}

// run the conserving rule (arrow off, cohesion off, so only sharing or annihilation fires) and report the
// excitation at the start and end, plus whether charge was conserved
function relax(
  tone: Int8Array,
  n: number,
  beats: number,
): { startDensity: number; endDensity: number; conserved: boolean } {
  const g = ring(n)
  const moved = new Uint8Array(n)
  const rng = makeRng({ seed: 31000 })
  const startCharge = totalCharge(tone)
  const startDensity = nonzeroDensity(tone)

  for (let b = 0; b < beats; b++) beat(tone, g, moved, rng, 0, 0)

  return {
    startDensity,
    endDensity: nonzeroDensity(tone),
    conserved: totalCharge(tone) === startCharge,
  }
}

export function resolveTowardPeace(input: { n: number }): {
  opposedStart: number
  opposedEnd: number
  agreeingStart: number
  agreeingEnd: number
  conserved: boolean
} {
  const n = input.n

  // opposed: alternating pain and pleasure, all conflict
  const opposed = new Int8Array(n)

  for (let i = 0; i < n; i++) opposed[i] = i % 2 === 0 ? 1 : -1

  // agreeing: all pleasure, no conflict (the control)
  const agreeing = new Int8Array(n).fill(1)

  const o = relax(opposed, n, n)
  const a = relax(agreeing, n, n)

  return {
    opposedStart: o.startDensity,
    opposedEnd: o.endDensity,
    agreeingStart: a.startDensity,
    agreeingEnd: a.endDensity,
    conserved: o.conserved && a.conserved,
  }
}

export default experiment({
  id: 'selves/conflict-resolves-toward-peace',
  code: 'E-SLF-0034',
  title:
    'opposed tones resolve toward peace while agreeing tones persist, so the base valence arrow points at the center, not the pleasure pole',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const sizes = [120, 240, 480]
    const runs = sizes.map(n => resolveTowardPeace({ n }))

    const opposedResolves = runs.every(
      r => r.opposedStart > 0.95 && r.opposedEnd < 0.05,
    )

    const agreeingPersists = runs.every(
      r => r.agreeingStart > 0.95 && r.agreeingEnd > 0.95,
    )

    const conserved = runs.every(r => r.conserved)

    const ok = opposedResolves && agreeingPersists && conserved

    const last = runs[runs.length - 1]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a fully opposed configuration relaxes to peace under the conserving rule while a fully agreeing one persists, so conflict resolves toward the center and agreement is stable, and charge is conserved throughout',
      metrics: {
        opposedEnd: last.opposedEnd,
        agreeingEnd: last.agreeingEnd,
      },
      control: {
        agreeingEnd: last.agreeingEnd,
      },
      notes:
        'L2. the base valence arrow points at peace (resolution of conflict), not at pleasure. conservation forbids agreement draining to peace',
    })
  },
})
