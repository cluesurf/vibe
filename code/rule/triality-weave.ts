// The triality weave: a candidate rule that keeps a colour-selecting triality and still connects
// every line, by giving the colour lines a four-line interaction block.
//
// E-FRC-0107 shows why a rule that couples lines in pairs cannot do both: a triality sigma that fixes
// a colour plane fixes its three lines, and no sigma-invariant pairing reaches them. The smallest
// sigma-invariant block that joins a colour line to the rest has four lines, the colour line f and a
// whole sigma-orbit of three, a1, sigma a1, sigma^2 a1. This builds a rule on such blocks.
//
// Each beat t, the 12 lines split into three blocks: colour line f_i with orbit O_{(i + r_t) mod 3},
// r = 0, 1, 2, 2, 1, 0 (a palindrome, period 6). On each block the collision is X P X, where P is the
// committed pair clock (the create, flip, annihilate cycle of the 9-state pair table) on every line,
// and X is the four-line vertex, an involution that swaps these states and fixes all others:
//
//   triple creation   f (s, 0) and the orbit empty  <->  f (-s, -s) and every orbit line (s, 0)
//                     f (0, s) and the orbit empty  <->  f (-s, -s) and every orbit line (0, s)
//   orbit exchange    f empty, a_k (s, 0), the others empty  <->  f (s, s), a_k (-s, 0)
//                     f empty, a_k (0, s), the others empty  <->  f (s, s), a_k (0, -s)
//
// for s = +1 and -1 and k = 1, 2, 3. Every pair conserves charge, every pair is carried to a pair by
// sigma (it treats the three orbit lines alike) and by charge conjugation (s to -s). So X commutes with
// sigma and with C, and because the pair table satisfies C P C = P^-1, each beat obeys
// C (X P X) C = (X P X)^-1, and the palindromic schedule makes the period CPT exact.
//
// The orientation of a line is its leading slot (the lower direction index). The triality used must
// carry leading slots to leading slots, which the two colour-selecting trialities of the previous knit
// do. The constructor refuses one that does not.

import { Collision, PAIR_FORWARD, PAIR_INVERSE } from '@/code/rule/collision'

type Tone = -1 | 0 | 1

const SCHEDULE = [0, 1, 2, 2, 1, 0]

export const TRIALITY_WEAVE_PERIOD = SCHEDULE.length

export type TrialityWeaveLayout = {
  // the 12 lines as [leading, trailing] slot pairs
  readonly lines: readonly (readonly [number, number])[]
  // indices into lines: the three colour lines, and three orbits of three in triality order
  readonly colour: readonly number[]
  readonly orbits: readonly (readonly number[])[]
}

// The block layout for a triality given as a permutation of the 24 directions.
export function trialityWeaveLayout(input: {
  opposite: readonly number[]
  triality: readonly number[]
}): TrialityWeaveLayout {
  const { opposite, triality } = input
  const lines: [number, number][] = []

  for (let d = 0; d < opposite.length; d++) {
    if (d < (opposite[d] ?? d)) {
      lines.push([d, opposite[d] ?? d])
    }
  }

  const lineOfLeading = new Map(lines.map(([leading], k) => [leading, k]))
  const image = lines.map(([leading, trailing]) => {
    const target = lineOfLeading.get(triality[leading] ?? -1)

    if (target === undefined || lines[target]?.[1] !== triality[trailing]) {
      throw new Error('the triality does not carry leading slots to leading slots')
    }

    return target
  })
  const colour = image.map((target, k) => (target === k ? k : -1)).filter(k => k >= 0)
  const seen = new Set(colour)
  const orbits: number[][] = []

  for (let k = 0; k < lines.length; k++) {
    if (seen.has(k)) {
      continue
    }

    const orbit = [k, image[k] ?? k, image[image[k] ?? k] ?? k]

    orbit.forEach(l => seen.add(l))
    orbits.push(orbit)
  }

  if (colour.length !== 3 || orbits.length !== 3 || orbits.some(o => new Set(o).size !== 3)) {
    throw new Error('the permutation is not a colour-selecting triality')
  }

  return { lines, colour, orbits }
}

type Pair = readonly [Tone, Tone]

const same = (a: Pair, b: readonly number[]): boolean => a[0] === b[0] && a[1] === b[1]

// The four-line vertex X on one block, in place. Reads the four lines, swaps a matched state for its
// partner, leaves everything else.
function vertex(
  slots: Int8Array,
  base: number,
  f: readonly [number, number],
  orbit: readonly (readonly [number, number])[],
  creation: boolean,
  exchange: boolean,
): void {
  const read = (line: readonly [number, number]): [Tone, Tone] => [
    (slots[base + line[0]] ?? 0) as Tone,
    (slots[base + line[1]] ?? 0) as Tone,
  ]
  const write = (line: readonly [number, number], value: Pair): void => {
    slots[base + line[0]] = value[0]
    slots[base + line[1]] = value[1]
  }
  const fv = read(f)
  const ov = orbit.map(read)
  const empty: Pair = [0, 0]
  const allOrbit = (value: Pair): boolean => ov.every(v => same(value, v))

  for (const s of [1, -1] as const) {
    const n = (-s) as Tone

    for (const lone of [[s, 0], [0, s]] as const) {
      // triple creation, forward and back
      if (creation && same(lone, fv) && allOrbit(empty)) {
        write(f, [n, n])
        orbit.forEach(line => write(line, lone))

        return
      }

      if (creation && same([n, n], fv) && allOrbit(lone)) {
        write(f, lone)
        orbit.forEach(line => write(line, empty))

        return
      }

      // orbit exchange, forward and back, on each of the three orbit lines
      const flipped: Pair = lone[0] === 0 ? [0, n] : [n, 0]

      for (let k = 0; k < (exchange ? 3 : 0); k++) {
        const others = ov.every((v, j) => j === k || same(empty, v))

        if (!others) {
          continue
        }

        if (same(empty, fv) && same(lone, ov[k] ?? empty)) {
          write(f, [s, s])
          write(orbit[k] ?? f, flipped)

          return
        }

        if (same([s, s], fv) && same(flipped, ov[k] ?? empty)) {
          write(f, empty)
          write(orbit[k] ?? f, lone)

          return
        }
      }
    }
  }
}

// The collision of beat t (forward) or of its inverse (forward = false). The inverse of X P X is
// X P^-1 X, since X is an involution.
//
// Two options tame how often each half of the vertex fires, the way the turning weave swaps only one
// couple per beat: `creation` and `exchange` are each 'all' (every block, every beat), 'one' (only
// the block of colour line SCHEDULE[t], so each colour line takes its turn on the same palindrome) or
// 'none'. Every choice keeps the triality (each firing block is invariant), CPT (the firing sequence
// is the same palindrome) and reversal (X stays an involution).
export type Firing = 'all' | 'one' | 'none'

export function trialityWeave(input: {
  layout: TrialityWeaveLayout
  forward?: boolean
  creation?: Firing
  exchange?: Firing
}): (t: number) => Collision {
  const { layout, forward = true, creation = 'all', exchange = 'all' } = input
  const fires = (mode: Firing, i: number, rotation: number): boolean =>
    mode === 'all' || (mode === 'one' && i === rotation)
  const table = forward ? PAIR_FORWARD : PAIR_INVERSE
  const key = (a: number, b: number): number => (a + 1) * 3 + (b + 1)

  return (t: number): Collision => {
    const rotation = SCHEDULE[((t % SCHEDULE.length) + SCHEDULE.length) % SCHEDULE.length] ?? 0
    const blocks = layout.colour
      .map((f, i) => ({
        f: layout.lines[f] ?? [0, 0],
        orbit: (layout.orbits[(i + rotation) % 3] ?? []).map(l => layout.lines[l] ?? [0, 0]),
        creation: fires(creation, i, rotation),
        exchange: fires(exchange, i, rotation),
      }))
      .filter(block => block.creation || block.exchange)

    return (slots, base) => {
      for (const block of blocks) {
        vertex(slots, base, block.f, block.orbit, block.creation, block.exchange)
      }

      for (const [leading, trailing] of layout.lines) {
        const out = table[key(slots[base + leading] ?? 0, slots[base + trailing] ?? 0)] ?? [0, 0]

        slots[base + leading] = out[0]
        slots[base + trailing] = out[1]
      }

      for (const block of blocks) {
        vertex(slots, base, block.f, block.orbit, block.creation, block.exchange)
      }
    }
  }
}
