import {
  conservingEdgeListSweepPumped,
  hashRand,
} from '@/code/dynamics/conserving-sweep'
import { edgesOf } from '@/code/tool/graph'
import { totalCharge } from '@/code/model/self-kit'
import { makeRng } from '@/code/tool/rng'

// The genesis dynamics: the conserving perception rule run from a chosen initial tone, recording how much
// charge (life) exists after each beat. From an all-peace start (the void, Q = 0) with arrow > 0 this is the
// GENESIS curve, the count rising from nothing as the arrow polarizes peace into balanced (+1, -1) pairs and
// the other moves spread them into a dynamic balance. With arrow = 0 it stays dead peace. Conservation holds
// throughout (every move preserves the pair sum), so the total charge Q never leaves its starting value.

// The number of charged (nonzero, non-peace) cells, the amount of "life" in a configuration.
export function chargedCount(tone: Int8Array): number {
  let s = 0

  for (let i = 0; i < tone.length; i++) {
    if (tone[i] !== 0) {
      s++
    }
  }

  return s
}

// Run the conserving rule from `initial` for `beats`, returning the charged-count after each beat (the
// trajectory, length beats + 1 including the start), plus the conserved-charge check. Does not mutate
// `initial`. Deterministic given the seed (the rng only orders the edges and breaks the polarization coin).
export function chargeTrajectory(input: {
  neighbors: readonly (readonly number[])[]
  initial: Int8Array
  beats: number
  arrow: number
  seed: number
}): {
  trajectory: number[]
  qStart: number
  qEnd: number
  conserved: boolean
  end: Int8Array
} {
  const { neighbors, initial, beats, arrow, seed } = input
  const tone = initial.slice()
  const edges = edgesOf(neighbors)
  const moved = new Uint8Array(tone.length)
  const rng = makeRng({ seed })
  const qStart = totalCharge(tone)
  const trajectory: number[] = [chargedCount(tone)]

  for (let b = 0; b < beats; b++) {
    conservingEdgeListSweepPumped({
      tone,
      edges,
      moved,
      rng,
      arrow,
      pump: null,
    })
    trajectory.push(chargedCount(tone))
  }

  const qEnd = totalCharge(tone)

  return {
    trajectory,
    qStart,
    qEnd,
    conserved: qStart === qEnd,
    end: tone,
  }
}

// Whether a trajectory shows GENESIS: it starts empty (or near it), rises to a sustained living level, and
// holds there (a dynamic balance, not a spike that dies). Returns the diagnostic pieces and the verdict.
export function genesisProfile(input: {
  trajectory: number[]
  cells: number
  livingFraction?: number // the level the end must clear to count as "alive" (default 0.05 of cells)
  steadyWindow?: number // how stable the late curve must be (default within 30 percent of the peak)
}): {
  start: number
  peak: number
  end: number
  alive: boolean
  sustained: boolean
  rose: boolean
} {
  const { trajectory, cells } = input
  const livingFraction = input.livingFraction ?? 0.05
  const steadyWindow = input.steadyWindow ?? 0.3
  const start = trajectory[0]!
  const end = trajectory[trajectory.length - 1]!
  const peak = Math.max(...trajectory)
  const mid = trajectory[Math.floor(trajectory.length / 2)]!
  const alive = end > livingFraction * cells
  const rose = end > start && peak > start
  const sustained =
    alive && Math.abs(end - mid) < steadyWindow * Math.max(peak, 1)

  return { start, peak, end, alive, sustained, rose }
}

// One beat of the conserving rule with creation DRIVEN BY THE WAKE instead of a free arrow. The wake gives
// every cell a growth-depth (its radial distance from the seed, the order it was born in), and a per-beat
// growth `rate` (the fraction of the mesh that is fresh frontier, a geometric property of the expanding mesh).
// A peace-peace edge that straddles a depth gradient polarizes when a DETERMINISTIC per-edge-per-beat hash
// clears the rate (the moving frontier's desynchronization, reproducible, no Math.random), with the
// frontier-side (larger depth) cell becoming +1 and the inner cell -1, a balanced pair. So BOTH the creation
// rate and its direction are read off the growth geometry, not posited. Where there is no gradient (uniform
// depth) nothing is ever created. `beat` seeds the hash so successive beats hit different edges.
export function wakeDrivenSweep(input: {
  tone: Int8Array
  edges: readonly (readonly [number, number])[]
  moved: Uint8Array
  depth: Int32Array
  beat: number
  rate: number
}): void {
  const { tone, edges, moved, depth, beat, rate } = input
  moved.fill(0)

  for (const [v, w] of edges) {
    if (moved[v] || moved[w]) {
      continue
    }

    const a = tone[v]!
    const b = tone[w]!
    const key = v * 131071 + w

    if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
      tone[v] = 0
      tone[w] = 0
      moved[v] = 1
      moved[w] = 1
    } else if ((a === 0) !== (b === 0)) {
      const charged = a === 0 ? w : v
      const empty = a === 0 ? v : w

      if (hashRand(key, beat, 1) < 0.5) {
        tone[empty] = tone[charged]!
        tone[charged] = 0
        moved[v] = 1
        moved[w] = 1
      }
    } else if (
      a === 0 &&
      b === 0 &&
      (depth[v] ?? 0) !== (depth[w] ?? 0) &&
      hashRand(key, beat, 0) < rate
    ) {
      const outer = (depth[v] ?? 0) > (depth[w] ?? 0) ? v : w
      const inner = outer === v ? w : v
      tone[outer] = 1
      tone[inner] = -1
      moved[v] = 1
      moved[w] = 1
    }
  }
}

// The per-beat growth rate read off the mesh, the fraction of cells that are fresh frontier (the outermost
// growth-shell). This is the wake's own creation rate, a geometric property of the expanding mesh, not a knob.
export function growthRate(depth: Int32Array): number {
  let maxD = 0

  for (let i = 0; i < depth.length; i++) {
    if (depth[i]! > maxD) {
      maxD = depth[i]!
    }
  }

  let frontier = 0

  for (let i = 0; i < depth.length; i++) {
    if (depth[i]! === maxD) {
      frontier++
    }
  }

  return frontier / depth.length
}

// The genesis trajectory under the WAKE-DRIVEN rule (no arrow parameter, deterministic via the hash). With a
// real growth-depth gradient and the growth-derived rate this brings a living balance out of the peace void,
// with a uniform (flat) depth, or zero rate (no growth), it stays dead.
export function wakeTrajectory(input: {
  neighbors: readonly (readonly number[])[]
  depth: Int32Array
  initial: Int8Array
  beats: number
  rate: number
}): {
  trajectory: number[]
  qStart: number
  qEnd: number
  conserved: boolean
  end: Int8Array
} {
  const { neighbors, depth, initial, beats, rate } = input
  const tone = initial.slice()
  const edges = edgesOf(neighbors)
  const moved = new Uint8Array(tone.length)
  const qStart = totalCharge(tone)
  const trajectory: number[] = [chargedCount(tone)]

  for (let b = 0; b < beats; b++) {
    wakeDrivenSweep({ tone, edges, moved, depth, beat: b, rate })
    trajectory.push(chargedCount(tone))
  }

  const qEnd = totalCharge(tone)

  return {
    trajectory,
    qStart,
    qEnd,
    conserved: qStart === qEnd,
    end: tone,
  }
}

// Run the conserving rule from all-peace until the FIRST charge appears, and report that first creation event:
// how many +1 and -1 cells it made, whether they are balanced and adjacent (a single conserving pair, the first
// distinction). Returns beatsToFirst = -1 if no charge ever appears (dead peace, e.g. arrow 0).
export function firstDistinction(input: {
  neighbors: readonly (readonly number[])[]
  cells: number
  arrow: number
  seed: number
  maxBeats: number
}): {
  beatsToFirst: number
  plus: number
  minus: number
  balanced: boolean
  adjacent: boolean
} {
  const { neighbors, cells, arrow, seed, maxBeats } = input
  const tone = new Int8Array(cells)
  const edges = edgesOf(neighbors)
  const moved = new Uint8Array(cells)
  const rng = makeRng({ seed })

  for (let b = 0; b < maxBeats; b++) {
    conservingEdgeListSweepPumped({
      tone,
      edges,
      moved,
      rng,
      arrow,
      pump: null,
    })

    if (chargedCount(tone) > 0) {
      let plus = 0
      let minus = 0

      for (let i = 0; i < cells; i++) {
        if (tone[i] === 1) {
          plus++
        } else if (tone[i] === -1) {
          minus++
        }
      }

      let adjacent = false

      for (const [v, w] of edges) {
        if (tone[v]! * tone[w]! === -1) {
          adjacent = true
          break
        }
      }

      return {
        beatsToFirst: b + 1,
        plus,
        minus,
        balanced: plus === minus,
        adjacent,
      }
    }
  }

  return {
    beatsToFirst: -1,
    plus: 0,
    minus: 0,
    balanced: false,
    adjacent: false,
  }
}

// Force a tone configuration to total charge zero deterministically, flipping the lowest-index excess cells to
// peace. Used to put several different initial conditions on the same conserved footing (all Q = 0).
export function balanceToZero(tone: Int8Array): Int8Array {
  let q = totalCharge(tone)

  for (let i = 0; i < tone.length && q !== 0; i++) {
    if (q > 0 && tone[i] === 1) {
      tone[i] = 0
      q--
    } else if (q < 0 && tone[i] === -1) {
      tone[i] = 0
      q++
    }
  }

  return tone
}

// The Hamming-style difference (count of cells whose tone differs) between two runs of the rule from two
// different initial conditions under identical dynamics, recorded after each beat. A decaying difference is
// FORGETTING, the deep past washing out, the start becoming irrelevant.
export function differenceTrajectory(input: {
  neighbors: readonly (readonly number[])[]
  initialA: Int8Array
  initialB: Int8Array
  beats: number
  arrow: number
  seed: number
}): { difference: number[]; startDiff: number; endDiff: number } {
  const { neighbors, initialA, initialB, beats, arrow, seed } = input
  const a = initialA.slice()
  const b = initialB.slice()
  const edges = edgesOf(neighbors)
  const movedA = new Uint8Array(a.length)
  const movedB = new Uint8Array(b.length)
  const rngA = makeRng({ seed })
  const rngB = makeRng({ seed })

  const diff = (): number => {
    let d = 0

    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        d++
      }
    }

    return d
  }

  const difference: number[] = [diff()]

  for (let t = 0; t < beats; t++) {
    conservingEdgeListSweepPumped({
      tone: a,
      edges,
      moved: movedA,
      rng: rngA,
      arrow,
      pump: null,
    })
    conservingEdgeListSweepPumped({
      tone: b,
      edges,
      moved: movedB,
      rng: rngB,
      arrow,
      pump: null,
    })
    difference.push(diff())
  }

  return {
    difference,
    startDiff: difference[0]!,
    endDiff: difference[difference.length - 1]!,
  }
}

// THE FULL PRIZE: genesis on a GENUINELY GROWING mesh, with no arrow parameter, no creation rate, and no
// hash-gated creation. The mesh grows one shell per beat (cells with growth-depth <= b are born). Creation
// happens ONLY where the fresh frontier (depth == b, just born at peace) meets the older structure (depth ==
// b - 1), a 0,0 edge there polarizes, outer +1 and inner -1. Because the frontier MOVES outward each beat, the
// creation never hits the same cells twice, the moving frontier itself provides the desynchronization (no hash
// needed for creation), and the charges are left behind as the edge advances. The bulk runs share and a
// hash-desync hop. So the entire arrow, rate and direction and timing, is the growth, nothing is posited.
export function growingMeshGenesis(input: {
  neighbors: readonly (readonly number[])[]
  depth: Int32Array
  settleBeats?: number
  integerHop?: boolean // when true, the hop desync is an INTEGER parity, so the whole rule is pure ternary + integer (no decimal, no rng, no hash)
}): {
  trajectory: number[]
  qStart: number
  qEnd: number
  conserved: boolean
  maxDepth: number
  bornEnd: number
} {
  const { neighbors, depth } = input
  const settleBeats = input.settleBeats ?? 0
  const integerHop = input.integerHop ?? false
  const n = depth.length

  let maxDepth = 0

  for (let i = 0; i < n; i++) {
    if (depth[i]! > maxDepth) {
      maxDepth = depth[i]!
    }
  }

  const tone = new Int8Array(n)
  const edges = edgesOf(neighbors)
  const moved = new Uint8Array(n)
  const qStart = totalCharge(tone)
  const trajectory: number[] = [0]

  const step = (b: number, frontier: number): void => {
    moved.fill(0)

    for (const [v, w] of edges) {
      const dv = depth[v]!
      const dw = depth[w]!

      if (dv > b || dw > b) {
        continue
      } // not yet born

      if (moved[v] || moved[w]) {
        continue
      }

      const a = tone[v]!
      const c = tone[w]!

      if ((a === 1 && c === -1) || (a === -1 && c === 1)) {
        tone[v] = 0
        tone[w] = 0
        moved[v] = 1
        moved[w] = 1
      } else if (
        frontier >= 0 &&
        a === 0 &&
        c === 0 &&
        ((dv === frontier && dw === frontier - 1) ||
          (dw === frontier && dv === frontier - 1))
      ) {
        const outer = dv > dw ? v : w
        const inner = outer === v ? w : v
        tone[outer] = 1
        tone[inner] = -1
        moved[v] = 1
        moved[w] = 1
      } else if ((a === 0) !== (c === 0)) {
        const charged = a === 0 ? w : v
        const empty = a === 0 ? v : w
        const doHop = integerHop
          ? ((v + w + b) & 1) === 0
          : hashRand(v * 131071 + w, b, 1) < 0.5

        if (doHop) {
          tone[empty] = tone[charged]!
          tone[charged] = 0
          moved[v] = 1
          moved[w] = 1
        }
      }
    }
  }

  for (let b = 1; b <= maxDepth; b++) {
    step(b, b) // grow to shell b, create only at the moving frontier (shell b meets b-1)

    let born = 0,
      alive = 0

    for (let i = 0; i < n; i++) {
      if (depth[i]! <= b) {
        born++

        if (tone[i] !== 0) {
          alive++
        }
      }
    }

    trajectory.push(alive)
  }

  let bornEnd = 0

  for (let i = 0; i < n; i++) {
    if (depth[i]! <= maxDepth) {
      bornEnd++
    }
  }

  for (let s = 0; s < settleBeats; s++) {
    step(maxDepth, -1)
    trajectory.push(chargedCount(tone))
  } // settle, no new creation

  const qEnd = totalCharge(tone)

  return {
    trajectory,
    qStart,
    qEnd,
    conserved: qStart === qEnd,
    maxDepth,
    bornEnd,
  }
}

// Apply ONE deterministic beat of the conserving rule to a copy of `tone`, returning the new state. Used to
// enumerate the rule as a map (for Garden-of-Eden / injectivity analysis). Deterministic given the seed.
export function oneBeat(input: {
  tone: Int8Array
  edges: readonly (readonly [number, number])[]
  arrow: number
  seed: number
}): Int8Array {
  const out = input.tone.slice()
  const moved = new Uint8Array(out.length)
  conservingEdgeListSweepPumped({
    tone: out,
    edges: input.edges,
    moved,
    rng: makeRng({ seed: input.seed }),
    arrow: input.arrow,
    pump: null,
  })

  return out
}

// Enumerate the conserving rule as a one-beat map over ALL 3^cells states of a small graph, and report how
// non-injective it is. A GARDEN-OF-EDEN state has no predecessor, so it can only ever be an initial condition.
// The rule's annihilation move loses information, so the map is non-injective, many states map to the same
// image, and a large fraction are Garden-of-Eden (unreachable). This non-injectivity is exactly what gives the
// open system an attractor and lets it forget its start. Cells must be small (3^cells enumerated).
export function gardenOfEdenFraction(input: {
  neighbors: readonly (readonly number[])[]
  cells: number
  arrow: number
  seed: number
}): {
  states: number
  reachable: number
  goeFraction: number
  injectivity: number
} {
  const { neighbors, cells, arrow, seed } = input
  const edges = edgesOf(neighbors)
  const total = 3 ** cells
  const image = new Set<number>()
  const tone = new Int8Array(cells)

  const code = (t: Int8Array): number => {
    let k = 0

    for (let i = cells - 1; i >= 0; i--) {
      k = k * 3 + (t[i]! + 1)
    }

    return k
  }

  for (let s = 0; s < total; s++) {
    let x = s

    for (let i = 0; i < cells; i++) {
      tone[i] = (x % 3) - 1
      x = (x / 3) | 0
    }

    image.add(code(oneBeat({ tone, edges, arrow, seed })))
  }

  const reachable = image.size

  return {
    states: total,
    reachable,
    goeFraction: (total - reachable) / total,
    injectivity: reachable / total,
  }
}

// A structural signature of a configuration (the genesis attractor): how dense (fraction charged), how balanced
// (the normalized net charge, near zero by conservation), and how clustered (the fraction of charged-charged
// neighbour pairs that are the SAME sign). Two configurations from different starts share this signature if the
// attractor is canonical.
export function attractorSignature(input: {
  tone: Int8Array
  neighbors: readonly (readonly number[])[]
}): {
  density: number
  netBalance: number
  sameSignFraction: number
} {
  const { tone, neighbors } = input
  const n = tone.length

  let charged = 0
  let net = 0

  for (let i = 0; i < n; i++) {
    if (tone[i] !== 0) {
      charged++
    }

    net += tone[i]!
  }

  let pairs = 0
  let same = 0

  for (let v = 0; v < n; v++) {
    for (const w of neighbors[v]!) {
      if (w > v && tone[v] !== 0 && tone[w] !== 0) {
        pairs++

        if (tone[v] === tone[w]) {
          same++
        }
      }
    }
  }

  return {
    density: charged / n,
    netBalance: net / n,
    sameSignFraction: pairs > 0 ? same / pairs : 0,
  }
}
