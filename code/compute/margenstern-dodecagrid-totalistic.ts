// Margenstern's OUTER TOTALISTIC weakly universal cellular automaton in the dodecagrid {5,3,4} (hyperbolic 3D),
// FOUR states (arXiv:2108.13094), the first universal outer-totalistic automaton in hyperbolic 3D space. An
// outer-totalistic rule depends only on the cell's own state and the WEIGHT of its neighbourhood, the sum of
// the ranks of its twelve face-neighbours (W=0, B=1, R=2, G=3), not their arrangement. The whole automaton is
// 34 (state, weight) -> new-state entries (35 numbered rules in the paper, one repeated). See
// land/text/papers/more-5/2108.13094.pdf and note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md.

export type DodecaTotalisticState = 'W' | 'B' | 'R' | 'G'
const RANK: Record<string, number> = { W: 0, B: 1, R: 2, G: 3 }

// the complete transition table, [current state, neighbourhood weight, new state]
export const DODECAGRID_TOTALISTIC_RULES: Array<
  [string, number, string]
> = [
  ['W', 0, 'W'],
  ['R', 1, 'R'],
  ['G', 0, 'G'],
  ['R', 2, 'R'],
  ['R', 0, 'R'],
  ['R', 3, 'R'],
  ['W', 2, 'W'],
  ['G', 1, 'G'],
  ['W', 3, 'W'],
  ['G', 2, 'G'],
  ['W', 6, 'W'],
  ['G', 3, 'G'],
  ['W', 5, 'W'],
  ['W', 8, 'W'],
  ['W', 11, 'W'],
  ['W', 15, 'W'],
  ['W', 18, 'W'],
  ['W', 7, 'R'],
  ['W', 10, 'G'],
  ['R', 6, 'W'],
  ['G', 8, 'W'],
  ['W', 9, 'W'],
  ['W', 14, 'B'],
  ['B', 11, 'B'],
  ['W', 13, 'W'],
  ['W', 12, 'W'],
  ['R', 15, 'R'],
  ['W', 19, 'R'],
  ['W', 17, 'R'],
  ['R', 18, 'W'],
  ['R', 17, 'W'],
  ['R', 20, 'W'],
  ['W', 16, 'W'],
  ['G', 5, 'G'],
]

const TOTALISTIC = new Map<string, string>(
  DODECAGRID_TOTALISTIC_RULES.map(([s, w, n]) => [s + ':' + w, n]),
)

// the weight of a neighbourhood, the sum of the ranks of the neighbour states (the outer-totalistic input)
export function dodecagridWeight(neighbours: string[]): number {
  let w = 0

  for (const n of neighbours) {
    w += RANK[n] ?? 0
  }

  return w
}

// the new state of a cell from its current state and the weight of its twelve face-neighbours (conservative
// default when no rule matches)
export function dodecagridTotalisticNext(
  current: string,
  neighbours: string[],
): string {
  return (
    TOTALISTIC.get(current + ':' + dodecagridWeight(neighbours)) ??
    current
  )
}
