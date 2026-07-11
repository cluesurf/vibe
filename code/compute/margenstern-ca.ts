// A shared engine for Margenstern's rotation-invariant hyperbolic cellular automata, transcribed from his
// arXiv papers. Each automaton is given as a list of rules, every rule a word [current][neighbours][new] over a
// small colour alphabet, and the rules are ROTATION INVARIANT (a rule holds under the rotations of the tile
// that leave the tiling invariant). This module compiles such a rule list into a deterministic transition
// table by expanding every rule across its rotations, checking there are no conflicts, and stepping a graph.
// The per-paper rule data and the rotation shape (how many neighbours and how a rotation permutes them) live in
// the data modules (margenstern-pentagrid*.ts, margenstern-heptagrid.ts). See
// land/text/papers/maurice-margenstern and note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md.

export type MargensternCa = {
  readonly name: string
  readonly states: string[]
  readonly ruleCount: number
  readonly configurations: number // distinct (current + neighbours) keys
  readonly conflicts: number // rules whose snapshot collides with an earlier rule's (0 for the planar CAs)
  readonly neighbourLen: number
  next(current: string, neighbours: string): string
}

// all cyclic rotations of a ring of `count` symbols (a single p-gon or q-fold vertex ring)
export function cyclicRotations(
  count: number,
): (ring: string) => string[] {
  return (ring: string): string[] => {
    const out: string[] = []

    for (let r = 0; r < count; r++) {
      out.push(ring.slice(r) + ring.slice(0, r))
    }

    return out
  }
}

// all rotations of a neighbourhood made of TWO concentric rings (edge ring then vertex ring), shifted together
// by the same amount, as the pentagrid rules with 5 edge and 5 vertex neighbours use
export function doubleRingRotations(
  count: number,
): (rings: string) => string[] {
  return (rings: string): string[] => {
    const a = rings.slice(0, count)
    const b = rings.slice(count, count * 2)
    const out: string[] = []

    for (let r = 0; r < count; r++) {
      out.push(
        a.slice(r) + a.slice(0, r) + (b.slice(r) + b.slice(0, r)),
      )
    }

    return out
  }
}

// Margenstern lists each rule in ONE canonical orientation (neighbour 1 = the father), and the rule set is
// rotation invariant. So we store the rules RAW (which is conflict-free) and handle orientation at LOOKUP, by
// trying every rotation of the cell's neighbourhood until one matches a stored rule. (Expanding rotations at
// build time instead can create false conflicts when the exact geometric rotation permutation is not modelled.)
export function compileMargensternCa(input: {
  name: string
  rules: string[]
  neighbourLen: number
  rotate: (neighbours: string) => string[]
  // 'throw' (default) demands a clean deterministic table (the planar CAs); 'keep-first' tolerates the snapshot
  // collisions of the 3D dodecagrid, whose rules need context beyond the 12-neighbour snapshot, and counts them
  onConflict?: 'throw' | 'keep-first'
}): MargensternCa {
  const {
    name,
    rules,
    neighbourLen,
    rotate,
    onConflict = 'throw',
  } = input

  const table = new Map<string, string>()
  const states = new Set<string>()

  let conflicts = 0

  for (const rule of rules) {
    if (rule.length !== neighbourLen + 2) {
      throw new Error(
        `${name}: rule "${rule}" is not ${neighbourLen + 2} long`,
      )
    }

    const current = rule[0]!
    const neighbours = rule.slice(1, 1 + neighbourLen)
    const next = rule[1 + neighbourLen]!

    for (const ch of rule) {
      states.add(ch)
    }

    const key = current + neighbours
    const existing = table.get(key)

    if (existing !== undefined && existing !== next) {
      if (onConflict === 'throw') {
        throw new Error(
          `${name}: rule conflict at ${key}: ${existing} vs ${next} (rule ${rule})`,
        )
      }

      conflicts++
      continue // keep the first occurrence
    }

    table.set(key, next)
  }

  return {
    name,
    states: [...states].sort(),
    ruleCount: rules.length,
    configurations: table.size,
    conflicts,
    neighbourLen,
    next(current: string, neighbours: string): string {
      const padded = (neighbours + 'W'.repeat(neighbourLen)).slice(
        0,
        neighbourLen,
      )

      // try the rotations of the cell's neighbourhood (rotation invariance), match the first stored rule
      for (const rotated of rotate(padded)) {
        const hit = table.get(current + rotated)

        if (hit !== undefined) {
          return hit
        }
      }

      return current
    },
  }
}
