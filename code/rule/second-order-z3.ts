// Second-order reversible Z3 dynamics on any cell graph (item vibe-computation-models-0013, plan.md M3-B, algebra Z3
// cyclic of plan.md section 3): a tone per cell, read as a residue mod 3 (0, 1, 2 stand for the tones 0, +1, -1), and
//
//   s(t+1) = f(s(t) on the cell and its neighbors) - s(t-1)   (mod 3)
//
// every cell at once. No pair schedule, no orientation: the update is a function of the graph alone, so a flat tiling
// and its degree-matched hyperbolic control (decision 001) differ only in the graph. Exact integer arithmetic mod 3,
// no floating point, no random numbers.
//
// Reversibility is structural. Given the two slices (s(t), s(t+1)), the earlier slice is s(t-1) = f(s(t)) - s(t+1),
// which is the SAME step run on the swapped pair (previous = s(t+1), current = s(t)). It holds for any f, linear or
// not, because f reads only the middle slice. A first-order rule s(t+1) = f(s(t)) keeps no second slice and is the
// negative control: it is not injective on most graphs.
//
// The laws f, each fixing the vacuum (f(0) = 0, so an open ball with vacuum outside is an exact window inside the
// light cone of one hop per step):
//   linear  f = sum of neighbor tones + self * own tone         (the Z3 wave; self = 0 is code/dynamics/reversible-wave.ts)
//   square  f = sum of neighbor tones + self * own tone + own tone^2   (nonlinear: superposition must fail)
//
// The same dynamics with modulus q lives in code/dynamics/reversible-wave.ts (reversibleWaveStep, linear, self 0, and
// reversibleWaveStepNonlinear); this file adds the self term, the exact inverse, the first-order control and the
// geodesic front prediction, specialized to Z3. The experiment checks this step against reversible-wave.ts cell for cell.

export type Z3 = 0 | 1 | 2

export type SecondOrderZ3Law =
  | { readonly kind: 'linear'; readonly self: Z3 }
  | { readonly kind: 'square'; readonly self: Z3 }

export type CellNeighbors = readonly (readonly number[])[]

// the residue of a tone in {-1, 0, +1}, and back
export function z3OfTone(tone: -1 | 0 | 1): Z3 {
  return tone === -1 ? 2 : tone
}

export function toneOfZ3(value: number): -1 | 0 | 1 {
  if (value === 0) {
    return 0
  }

  if (value === 1) {
    return 1
  }

  if (value === 2) {
    return -1
  }

  throw new Error(`second-order-z3: ${value} is not a residue mod 3`)
}

// f at one cell: the law applied to the middle slice, as a residue mod 3
function lawAt(
  law: SecondOrderZ3Law,
  neighbors: CellNeighbors,
  current: Uint8Array,
  cell: number,
): number {
  let sum = 0

  for (const j of neighbors[cell] ?? []) {
    sum += current[j]!
  }

  const own = current[cell]!

  sum += law.self * own

  if (law.kind === 'square') {
    sum += own * own
  }

  return sum % 3
}

// One forward step: next[i] = f(current)[i] - previous[i] (mod 3), every cell at once.
export function secondOrderZ3Step(input: {
  neighbors: CellNeighbors
  previous: Uint8Array
  current: Uint8Array
  law: SecondOrderZ3Law
}): Uint8Array {
  const { neighbors, previous, current, law } = input
  const n = neighbors.length

  if (previous.length !== n || current.length !== n) {
    throw new Error('second-order-z3: slice length is not the cell count')
  }

  const next = new Uint8Array(n)

  for (let i = 0; i < n; i++) {
    const p = previous[i]!

    if (p > 2 || current[i]! > 2) {
      throw new Error(`second-order-z3: cell ${i} holds a value outside Z3`)
    }

    next[i] = (lawAt(law, neighbors, current, i) + 3 - p) % 3
  }

  return next
}

// The exact inverse: from (s(t), s(t+1)) recover s(t-1) by running the forward step on the swapped pair.
export function secondOrderZ3Back(input: {
  neighbors: CellNeighbors
  current: Uint8Array
  next: Uint8Array
  law: SecondOrderZ3Law
}): Uint8Array {
  return secondOrderZ3Step({
    neighbors: input.neighbors,
    previous: input.next,
    current: input.current,
    law: input.law,
  })
}

// The negative control: a first-order rule s(t+1) = f(s(t)) that forgets the earlier slice.
export function firstOrderZ3Step(input: {
  neighbors: CellNeighbors
  current: Uint8Array
  law: SecondOrderZ3Law
}): Uint8Array {
  const { neighbors, current, law } = input
  const next = new Uint8Array(neighbors.length)

  for (let i = 0; i < neighbors.length; i++) {
    next[i] = lawAt(law, neighbors, current, i)
  }

  return next
}

// Run `steps` forward steps from (s(-1), s(0)) and return the slices s(-1), s(0), s(1), ..., s(steps).
export function secondOrderZ3Run(input: {
  neighbors: CellNeighbors
  previous: Uint8Array
  current: Uint8Array
  law: SecondOrderZ3Law
  steps: number
}): Uint8Array[] {
  const slices: Uint8Array[] = [input.previous, input.current]

  for (let t = 0; t < input.steps; t++) {
    slices.push(
      secondOrderZ3Step({
        neighbors: input.neighbors,
        previous: slices[slices.length - 2]!,
        current: slices[slices.length - 1]!,
        law: input.law,
      }),
    )
  }

  return slices
}

// The front prediction for the linear law with self 0 from s(-1) = 0, s(0) = delta at the origin. Then
// s(t) = U_t(A) delta, where U_{t+1} = A U_t - U_{t-1} (Chebyshev polynomials of the second kind in the adjacency A),
// whose only term reaching distance t is A^t: the tone at a cell at distance t at time t is the number of geodesics
// from the origin to it, mod 3. This counts them by dynamic programming over the BFS distances.
export function geodesicCountsMod3(input: {
  neighbors: CellNeighbors
  distance: Int32Array
  origin: number
}): Uint8Array {
  const { neighbors, distance, origin } = input
  const n = neighbors.length
  const order = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => distance[a]! - distance[b]! || a - b,
  )
  const count = new Uint8Array(n)

  count[origin] = 1

  for (const u of order) {
    if (u === origin || distance[u]! < 0) {
      continue
    }

    let c = 0

    for (const w of neighbors[u] ?? []) {
      if (distance[w] === distance[u]! - 1) {
        c += count[w]!
      }
    }

    count[u] = c % 3
  }

  return count
}
