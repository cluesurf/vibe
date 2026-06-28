// The discrete continuity (divergence) law on a region of a mesh graph. Over one stream beat, the change in
// the charge enclosed in a region R must equal the net charge transported across R's boundary bonds. This is
// the graph form of the continuity equation div J + d(rho)/dt = 0. For a pure transport (streaming) rule it
// holds exactly at every region and every beat. A lossy rule that destroys charge inside cells breaks it, and
// the residual then equals exactly the charge destroyed inside R. Unlike the coarse-block continuity on the
// flat torus, this runs on an arbitrary cell graph, so it tests the law on the actual curved geometry.

type Adjacency = readonly (readonly number[])[]
type State = readonly (readonly number[])[]

// The ball of cells within `radius` hops of `center`, by breadth-first search over the adjacency (boundary
// bonds, marked -1, are skipped). Returns the set of cell indices in the ball.
export function regionBall(
  adjacency: Adjacency,
  center: number,
  radius: number,
): Set<number> {
  const region = new Set<number>([center])

  let frontier = [center]

  for (let step = 0; step < radius; step++) {
    const next: number[] = []

    for (const cell of frontier) {
      for (const neighbour of adjacency[cell]!) {
        if (neighbour !== -1 && !region.has(neighbour)) {
          region.add(neighbour)
          next.push(neighbour)
        }
      }
    }

    frontier = next
  }

  return region
}

// Total charge over all direction slots of the cells in `region`.
export function regionCharge(
  state: State,
  region: Set<number>,
): number {
  let total = 0

  for (const cell of region) {
    for (const value of state[cell]!) {
      total += value
    }
  }

  return total
}

// The charge that streams OUT of the region across its boundary bonds, read from the state about to be
// streamed: any slot whose neighbour is a real cell outside the region.
function outflow(
  streamed: State,
  adjacency: Adjacency,
  region: Set<number>,
): number {
  let total = 0

  for (const cell of region) {
    const slots = streamed[cell]!
    const bonds = adjacency[cell]!

    for (let d = 0; d < slots.length; d++) {
      const neighbour = bonds[d]!

      if (neighbour !== -1 && !region.has(neighbour)) {
        total += slots[d]!
      }
    }
  }

  return total
}

// The charge that streams INTO the region across its boundary bonds: any slot of an outside cell whose
// neighbour is inside the region.
function inflow(
  streamed: State,
  adjacency: Adjacency,
  region: Set<number>,
): number {
  let total = 0

  for (let cell = 0; cell < adjacency.length; cell++) {
    if (region.has(cell)) {
      continue
    }

    const slots = streamed[cell]!
    const bonds = adjacency[cell]!

    for (let d = 0; d < slots.length; d++) {
      const neighbour = bonds[d]!

      if (neighbour !== -1 && region.has(neighbour)) {
        total += slots[d]!
      }
    }
  }

  return total
}

// The continuity residual for one beat over a region: the enclosed-charge change minus the net charge that
// crossed the boundary. `before` is the state at the start of the beat, `streamed` is the state handed to
// the stream step (after collide and, for a lossy control, after the loss), and `after` is the state at the
// end of the beat. Exactly zero for a conservative transport rule. For a lossy rule it equals minus the
// charge destroyed inside the region, so a nonzero residual localizes the violation.
export function continuityResidual(input: {
  before: State
  streamed: State
  after: State
  adjacency: Adjacency
  region: Set<number>
}): number {
  const { before, streamed, after, adjacency, region } = input

  const enclosedChange =
    regionCharge(after, region) - regionCharge(before, region)

  const net =
    inflow(streamed, adjacency, region) -
    outflow(streamed, adjacency, region)

  return enclosedChange - net
}
