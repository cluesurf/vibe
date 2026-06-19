// Two bit-string searches toward a target pattern, the goal-directed and the aimless. Both start from a
// random K-bit string drawn from the supplied rng and count steps to reach the target (Hamming distance
// zero). The GOAL-DIRECTED search keeps only gap-reducing moves (it copies the target bit at a random
// position), so it reaches the target in O(K) steps. The UNDIRECTED search sets a random position to a
// random value, so it only reaches the target by chance, in expected ~2^K steps. The contrast quantifies
// the gap between aimless computation and intentional problem-solving. Both draw from the passed rng so
// the caller controls reproducibility and draw order.

type Rng = { next: () => number }

export function solveGoalDirected(input: {
  target: Int8Array
  rng: Rng
}): number {
  const { target, rng } = input
  const K = target.length
  const s = new Int8Array(K)
  for (let i = 0; i < K; i++) {
    s[i] = (rng.next() < 0.5 ? 1 : 0) as 0 | 1
  }

  let steps = 0
  let gap = 0
  for (let i = 0; i < K; i++) {
    if (s[i] !== target[i]) {
      gap++
    }
  }

  const guard = 1000 * K
  while (gap > 0 && steps < guard) {
    steps++
    const i = Math.floor(rng.next() * K)
    // a move toward the goal is KEPT only if it reduces the gap (goal-directed selection)
    if (s[i] !== target[i]) {
      s[i] = target[i]!
      gap--
    }
  }

  return steps
}

export function solveUndirected(input: {
  target: Int8Array
  rng: Rng
  budget: number
}): { solved: boolean; steps: number } {
  const { target, rng, budget } = input
  const K = target.length
  const s = new Int8Array(K)
  for (let i = 0; i < K; i++) {
    s[i] = (rng.next() < 0.5 ? 1 : 0) as 0 | 1
  }

  let gap = 0
  for (let i = 0; i < K; i++) {
    if (s[i] !== target[i]) {
      gap++
    }
  }

  for (let steps = 1; steps <= budget; steps++) {
    const i = Math.floor(rng.next() * K)
    const v = (rng.next() < 0.5 ? 1 : 0) as 0 | 1
    if (s[i] !== v) {
      if (s[i] === target[i]) {
        gap++
      } else if (v === target[i]) {
        gap--
      }

      s[i] = v
    }

    if (gap === 0) {
      return { solved: true, steps }
    }
  }

  return { solved: false, steps: budget }
}
