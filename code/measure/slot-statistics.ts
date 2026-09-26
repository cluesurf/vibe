// Occupation statistics of a lattice-gas state, slot by slot and direction by direction.
//
// A slot holds exactly one of fear, calm, love, never two tones, so exclusion is the state space
// itself. If a rule mixes a state until only its conserved total charge is remembered, each slot's
// three states are weighted e^(mu q) for its charge q, and then
//
//   p(love) p(fear) = p(calm)^2
//
// (the mass-action law of calm + calm <-> love + fear). The ratio R = p(love) p(fear) / p(calm)^2
// measures how far a direction is from that law: 1 on it, and whatever the initial fill gave for a
// direction the rule never touches.

import { Will } from '@/code/tone/will'

// counts[d] = [fears, calms, loves] over every cell, for each direction d
export function directionCounts(will: Will): number[][] {
  const degree = will.mesh.degree
  const counts = Array.from({ length: degree }, () => [0, 0, 0])

  for (let i = 0; i < will.data.length; i++) {
    const row = counts[i % degree] ?? [0, 0, 0]
    const k = (will.data[i] ?? 0) + 1

    row[k] = (row[k] ?? 0) + 1
  }

  return counts
}

// R = fears loves / calms^2 for one row of counts, -1 when there are no calms
export function massActionRatio(counts: readonly number[]): number {
  const [fear = 0, calm = 0, love = 0] = counts

  return calm === 0 ? -1 : (fear * love) / (calm * calm)
}

// a deterministic fill: slot i is love when frac((i + 1) g) < love, fear when below love + fear,
// calm otherwise, with g the golden ratio conjugate
export function goldenFill(input: { will: Will; love: number; fear: number }): void {
  const { will, love, fear } = input
  const golden = (Math.sqrt(5) - 1) / 2

  for (let i = 0; i < will.data.length; i++) {
    const u = ((i + 1) * golden) % 1

    will.data[i] = u < love ? 1 : u < love + fear ? -1 : 0
  }
}
