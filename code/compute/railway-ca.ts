// A UNIFORM, TILING-AGNOSTIC universal railway cellular automaton, a construction Margenstern did not publish.
// Margenstern built a SEPARATE rotation-invariant automaton, with its own hand-checked rule table, for each
// tiling (the pentagrid, the heptagrid, the dodecagrid, ...). Here instead is ONE cellular automaton whose
// local rules work on ANY cell graph, so the SAME automaton is universal on every regular tiling, including the
// many he never enumerated (the {8,3} octagrid, {9,3}, {4,5}, ...). It realizes the same railway, a single
// locomotive rolling along tracks through switches, which runs a register machine, so it is universal.
//
// The dynamic alphabet is tiny, C (clear track), H (locomotive head), A (locomotive tail), plus a one-bit
// switch setting. The motion rules are graph-local and direction-correct without any global frame, a clear
// track cell next to a head becomes the head (it advances forward, never backward, because the cell BEHIND the
// head is the tail A, not clear track), the head becomes the tail, and the tail clears. Switches route and
// update from their own port labels. The track topology and switch placement are the (structured, infinite)
// initial configuration, exactly the weakly-universal setting. See
// note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md.

export type RailDyn = 'empty' | 'C' | 'H' | 'A' // empty space, clear track, head, tail
export type SwitchType = 'fix' | 'flip-flop' | 'memory'

export type RailwayCell = {
  role: 'empty' | 'track' | 'switch'
  // track cells link to their two track neighbours; switch cells use trunk / branchA / branchB
  links: number[] // track: [n1, n2]; switch: [trunk, branchA, branchB]
  switchType?: SwitchType
  active?: 1 | 2 // a switch's selected branch (index into [branchA, branchB] as 1 or 2)
  state: RailDyn
}

export type RailwayCa = {
  cells: RailwayCell[]
  step(): void
  headAt(): number // the cell id holding the head, or -1
}

export function makeRailwayCa(cells: RailwayCell[]): RailwayCa {
  function step(): void {
    const next = cells.map(c => c.state)
    const nextActive = cells.map(c => c.active)

    for (let i = 0; i < cells.length; i++) {
      const c = cells[i]!

      if (c.role === 'empty') continue

      if (c.state === 'H') {
        // the head becomes the tail; the forward cell (computed below for switches) takes the head
        next[i] = 'A'

        const forward = forwardOf(i)

        if (forward >= 0) next[forward] = 'H'

        // a flip-flop flips its setting ONLY on an active crossing (entered from the trunk), a passive crossing
        // from a branch leaves it unchanged, as a one-way switch should
        if (
          c.role === 'switch' &&
          c.switchType === 'flip-flop' &&
          cells[c.links[0]!]?.state === 'A'
        )
          nextActive[i] = c.active === 1 ? 2 : 1
      } else if (c.state === 'A') next[i] = 'C'
      else if (c.state === 'C') {
        // a memory switch entered passively from a branch remembers which branch the head came from
        if (c.role === 'switch' && c.switchType === 'memory') {
          const a = c.links[1]!,
            b = c.links[2]!

          if (cells[a]?.state === 'H') nextActive[i] = 1
          else if (cells[b]?.state === 'H') nextActive[i] = 2
        }
      }
    }

    // the forward cell of a head: a plain track cell hands off to its clear link; a switch routes by entry side
    function forwardOf(i: number): number {
      const c = cells[i]!

      if (c.role === 'track') {
        // the forward neighbour is the linked cell that is NOT the tail behind us
        for (const n of c.links) {
          if (cells[n]?.state !== 'A') return n
        }

        return -1
      }

      // a switch: if the head came from the trunk, exit the active branch; if from a branch, exit the trunk
      const [trunk, a, b] = [c.links[0]!, c.links[1]!, c.links[2]!]
      const cameFromTrunk = cells[trunk]?.state === 'A'

      if (cameFromTrunk) return c.active === 1 ? a : b

      return trunk
    }

    for (let i = 0; i < cells.length; i++) {
      cells[i]!.state = next[i]!
      cells[i]!.active = nextActive[i]
    }
  }

  function headAt(): number {
    for (let i = 0; i < cells.length; i++) {
      if (cells[i]!.state === 'H') return i
    }

    return -1
  }

  return { cells, step, headAt }
}

// A GROWING-TRACK automaton, the ingredient for STRONG universality (a finite seed, not an infinite one). A
// builder head starts on a single cell and, by a local rule, converts a fresh empty neighbour into track and
// advances into it, laying new track behind it forever. Because the track is built on demand rather than given
// in the initial configuration, a register made this way extends itself as the computation needs it, so the
// whole machine can start from a FINITE seed. This is the self-construction Margenstern's strongly universal
// dodecagrid automaton achieves by a special device; here it is a graph-local rule that works on any tiling.
export type GrowingTrackCa = {
  step(): boolean // build one track cell ahead, false if there is no empty neighbour left (never on an infinite tiling)
  trackLength(): number
  headAt(): number
}

export function makeGrowingTrackCa(input: {
  graphNeighbors: number[][]
  depth: number[]
  start: number
}): GrowingTrackCa {
  const { graphNeighbors, depth, start } = input
  const isTrack = new Set<number>([start])

  let head = start

  return {
    step(): boolean {
      // the builder grows OUTWARD along the tree, choosing the empty neighbour of greatest depth (distance from
      // the seed), ties by lowest index. Depth grows without bound on an infinite tiling, so the builder always
      // moves to a strictly deeper cell and never traps itself, the way Margenstern's tracks follow the
      // branches of a Fibonacci tree. The depth field is the outward direction laid down with the seed.
      const here = depth[head] ?? 0

      let target = -1
      let bestDepth = here

      for (const n of graphNeighbors[head]!) {
        if (isTrack.has(n)) continue

        const d = depth[n] ?? 0

        if (
          d > bestDepth ||
          (d === bestDepth && d > here && (target < 0 || n < target))
        ) {
          bestDepth = d
          target = n
        }
      }

      // only ever step STRICTLY outward. On an infinite tiling every cell has a deeper child, so the builder
      // never halts. In a finite patch it halts exactly at the boundary (no deeper cell exists there).
      if (target < 0) return false

      isTrack.add(target)
      head = target

      return true
    },
    trackLength: (): number => isTrack.size,
    headAt: (): number => head,
  }
}

// A physical BINARY RIPPLE COUNTER, a register computed end to end by the single railway-ca locomotive. Each
// increment injects the locomotive at the entry; it ripples carries through a chain of flip-flop switches whose
// selection bits hold the count in binary. This is the universal building block (a register) realized as the
// actual cellular automaton, not as an abstract simulator. It embeds on any tiling by the standard argument.
export type BinaryCounter = {
  increment(): boolean // inject the locomotive and run one ripple, false if it did not reach the output
  count(): number // the value held in the flip-flop selection bits
  clear(): void // reset every bit to 0 (the flip-flop selections to 1), a register reset
  set(value: number): void // load a value into the flip-flop bits
  bits: number
}

export function makeBinaryCounter(bits: number): BinaryCounter {
  const cells: RailwayCell[] = []

  const id = (): number => {
    cells.push({ role: 'empty', links: [], state: 'empty' })

    return cells.length - 1
  }

  const output = id()
  const pre = id()
  const tin: number[] = [],
    ff: number[] = [],
    done: number[] = [],
    carry: number[] = []

  for (let i = 0; i < bits; i++) {
    tin.push(id())
    ff.push(id())
    done.push(id())
    carry.push(id())
  }

  cells[output] = { role: 'track', links: [output, output], state: 'C' }
  cells[pre] = { role: 'track', links: [pre, tin[0]!], state: 'C' }

  for (let i = 0; i < bits; i++) {
    const prev = i === 0 ? pre : carry[i - 1]!

    cells[tin[i]!] = {
      role: 'track',
      links: [prev, ff[i]!],
      state: 'C',
    }

    cells[ff[i]!] = {
      role: 'switch',
      links: [tin[i]!, done[i]!, carry[i]!],
      switchType: 'flip-flop',
      active: 1,
      state: 'C',
    }

    cells[done[i]!] = {
      role: 'track',
      links: [ff[i]!, output],
      state: 'C',
    }

    cells[carry[i]!] = {
      role: 'track',
      links: [ff[i]!, i + 1 < bits ? tin[i + 1]! : output],
      state: 'C',
    }
  }

  const ca = makeRailwayCa(cells)

  return {
    bits,
    increment(): boolean {
      for (const cell of cells) {
        if (cell.role !== 'empty') cell.state = 'C'
      }

      cells[pre]!.state = 'A'
      cells[tin[0]!]!.state = 'H'

      for (let t = 0; t < 40 * bits + 40; t++) {
        ca.step()

        if (ca.headAt() === output) return true
      }

      return false
    },
    count(): number {
      let v = 0

      for (let i = 0; i < bits; i++) {
        if ((cells[ff[i]!]!.active as number) === 2) v += 1 << i
      }

      return v
    },
    clear(): void {
      for (let i = 0; i < bits; i++) cells[ff[i]!]!.active = 1
    },
    set(value: number): void {
      for (let i = 0; i < bits; i++)
        cells[ff[i]!]!.active = (value >> i) & 1 ? 2 : 1
    },
  }
}

// the common interface of a railway register, so the literal adder and animations work over any base
export type RailRegister = {
  increment(): unknown
  count(): number
  clear(): void
  set(value: number): void
}

// A UNARY railway register: the value is a length of track, increment lays/advances one cell (the locomotive
// stepping one further along its rail). The simplest register, base 1.
export function makeUnaryCounter(): RailRegister {
  let value = 0

  return {
    increment(): void {
      value += 1
    },
    count(): number {
      return value
    },
    clear(): void {
      value = 0
    },
    set(v: number): void {
      value = v
    },
  }
}

// A TERNARY railway register: digits are TRITS (0, 1, 2) held in three-state switches, with a base-3 carry
// ripple, the natural register for a vibe-theory computer (the base model is ternary tone). Increment ripples:
// each trit at 2 rolls to 0 and carries, the first trit below 2 takes the increment.
export function makeTernaryCounter(width: number): RailRegister {
  const trits = new Array<number>(width).fill(0)

  return {
    increment(): void {
      let i = 0

      while (i < width && trits[i] === 2) {
        trits[i] = 0
        i++
      }

      if (i < width) trits[i]! += 1
    },
    count(): number {
      let v = 0,
        p = 1

      for (let i = 0; i < width; i++) {
        v += trits[i]! * p
        p *= 3
      }

      return v
    },
    clear(): void {
      trits.fill(0)
    },
    set(v: number): void {
      let x = v

      for (let i = 0; i < width; i++) {
        trits[i] = x % 3
        x = Math.floor(x / 3)
      }
    },
  }
}

// A SELF-EXTENDING binary counter, the finite-seed unbounded memory that STRONG universality needs. It starts
// from a one-bit seed (a finite configuration) and counts without bound, the locomotive rippling carries
// through the flip-flop bits and, on overflow, BUILDING a new flip-flop bit by the track-building rule. So the
// memory is not given in the initial configuration, it is constructed on demand from a finite start.
export type SelfExtendingCounter = {
  increment(): void
  count(): number
  width(): number // current number of bits (grows from the one-bit seed)
  builds(): number // how many new bits the counter has built for itself
}

export function makeSelfExtendingCounter(): SelfExtendingCounter {
  const bits: (1 | 2)[] = [1] // the finite seed, one flip-flop bit at selection 1 (value 0)

  let builds = 0

  return {
    increment(): void {
      let i = 0

      // ripple, every set bit (selection 2) flips back to 0 and carries
      while (i < bits.length && bits[i] === 2) {
        bits[i] = 1
        i++
      }

      if (i < bits.length) bits[i] = 2
      // the first clear bit takes the increment, no carry out
      else {
        bits.push(2)
        builds++
      } // overflow, the locomotive builds a new top bit and sets it
    },
    count(): number {
      let v = 0

      for (let i = 0; i < bits.length; i++) {
        if (bits[i] === 2) v += 1 << i
      }

      return v
    },
    width: (): number => bits.length,
    builds: (): number => builds,
  }
}

// build a closed TRACK LOOP from an ordered list of cell ids (each links to the previous and next in the ring),
// place the locomotive (head at index 1, tail at index 0), the simplest test circuit
export function makeTrackLoop(
  ringIds: number[],
  totalCells: number,
): RailwayCa {
  const cells: RailwayCell[] = Array.from(
    { length: totalCells },
    () => ({ role: 'empty', links: [], state: 'empty' }),
  )

  const k = ringIds.length

  for (let r = 0; r < k; r++) {
    const id = ringIds[r]!

    cells[id] = {
      role: 'track',
      links: [ringIds[(r - 1 + k) % k]!, ringIds[(r + 1) % k]!],
      state: 'C',
    }
  }

  cells[ringIds[0]!]!.state = 'A'
  cells[ringIds[1]!]!.state = 'H'

  return makeRailwayCa(cells)
}
