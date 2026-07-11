// Conway's Game of Life, the canonical strongly-universal cellular automaton. State
// is a set of live cell keys "x,y" on the infinite 2D integer grid with the Moore
// (8-cell) neighbourhood. A cell is live next step if it has three live neighbours,
// or two live neighbours and is already live. Used to demonstrate strong universality
// on a flat cusp: a glider propagates exactly as a reference Life, so the cusp runs
// Life.

// The eight Moore-neighbourhood offsets (the 3x3 block minus the centre).
export const mooreOffsets: [number, number][] = [-1, 0, 1]
  .flatMap(dx => [-1, 0, 1].map((dy): [number, number] => [dx, dy]))
  .filter(([dx, dy]) => dx !== 0 || dy !== 0)

// One Life step over a set of live "x,y" cell keys.
export function lifeStep(state: Set<string>): Set<string> {
  const count = new Map<string, number>()

  for (const k of state) {
    const [x, y] = k.split(',').map(Number)

    for (const [dx, dy] of mooreOffsets) {
      const nk = `${x! + dx},${y! + dy}`

      count.set(nk, (count.get(nk) ?? 0) + 1)
    }
  }

  const next = new Set<string>()

  for (const [k, c] of count) {
    if (c === 3 || (c === 2 && state.has(k))) next.add(k)
  }

  return next
}

// Whether two sets of "x,y" cell keys are identical (same size, same members). Used to
// confirm a pattern evolves identically to a reference Life.
export function cellSetEqual(a: Set<string>, b: Set<string>): boolean {
  return a.size === b.size && [...a].every(k => b.has(k))
}

// The centroid (mean x, mean y) of a set of "x,y" cell keys. Used to measure how far a
// pattern (a glider) has translated.
export function cellSetCentroid(state: Set<string>): [number, number] {
  let sx = 0
  let sy = 0

  for (const k of state) {
    const [x, y] = k.split(',').map(Number)

    sx += x!
    sy += y!
  }

  return [sx / state.size, sy / state.size]
}
