// The triality weave: a candidate rule that keeps a color-selecting triality and still connects
// every line, by giving the color lines a four-line interaction block.
//
// Blocks here pair color line f_i with orbit O_{(i + r_t) mod 3}. With the default one-block firing
// the firing block is i = r_t, so the orbit is O_{2 r_t mod 3}.
//
// E-FRC-0107 shows why a rule that couples lines in pairs cannot do both: a triality sigma that fixes
// a color plane fixes its three lines, and no sigma-invariant pairing reaches them. The smallest
// sigma-invariant block that joins a color line to the rest has four lines, the color line f and a
// whole sigma-orbit of three, a1, sigma a1, sigma^2 a1. This builds a rule on such blocks.
//
// Each beat t, with r = 0, 1, 2, 2, 1, 0 (a palindrome, period 6), the collision is V S P S V:
//
//   P  the committed pair clock (the create, flip, annihilate cycle of the 9-state pair table) on
//      every line
//   V  the four-line vertex on the block of color line f_r and orbit O_{2r mod 3}, an involution
//      that swaps these states and fixes all others, for s = +1 and -1:
//        f (s, 0) and the orbit empty  <->  f (-s, -s) and every orbit line (s, 0)
//        f (0, s) and the orbit empty  <->  f (-s, -s) and every orbit line (0, s)
//      one charge on the color line exchanged for three identical charges across the orbit
//   S  the committed turning weave's conditional swap in triality-symmetric form: color lines r and
//      r + 1 as a couple, and orbits r and r + 1 line by line in their triality order
//
// V moves tones between a color line and its orbit only in threes, which a triality-symmetric move
// has to (an orbit state the triality fixes holds a multiple of three tones, a line at most two). S
// never adds a tone. Every piece conserves charge, is carried to itself by sigma and by charge
// conjugation, and because the pair table satisfies C P C = P^-1, each beat obeys
// C (V S P S V) C = (V S P S V)^-1, and the palindromic schedule makes the period CPT exact.
//
// This is the configuration E-FRC-0109 measured best, and the default. The options reach the earlier
// variants: firing the vertex on every block, adding an orbit exchange (f empty with one orbit line
// holding s <-> f (s, s) with that line holding -s), or dropping the swaps. Firing the vertex
// everywhere with the exchange on connects every line but lets one tone avalanche across the box.
//
// The orientation of a line is its leading slot (the lower direction index). The triality used must
// carry leading slots to leading slots, which the two color-selecting trialities of the previous knit
// do. The constructor refuses one that does not.

import {
  Collision,
  PAIR_FORWARD,
  PAIR_INVERSE,
} from '@/code/rule/collision'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  permutationOrder,
  weylF4DirectionPermutations,
} from '@/code/measure/coin-symmetry'
import { zeroSumTriangles } from '@/code/measure/collision-anatomy'

// The first color-selecting triality of the D4 coin that the layout accepts: an order-three
// element of W(F4), as a permutation of the 24 directions, whose fixed directions are exactly one
// zero-sum plane (an A2 with its opposites) and which carries leading slots to leading slots.
export function colorTriality(input: {
  opposite: readonly number[]
}): number[] {
  const { opposite } = input
  const roots = rootsD4()
  const keyOf = (list: readonly number[]): string =>
    [...list].sort((a, b) => a - b).join(',')
  const planes = new Set(
    zeroSumTriangles({ directions: roots }).map(t =>
      keyOf([...t, ...t.map(d => opposite[d] ?? d)]),
    ),
  )
  const found = weylF4DirectionPermutations({ directions: roots }).find(
    p => {
      const fixed = p.map((image, d) => (image === d ? d : -1))

      if (
        permutationOrder({ permutation: p }) !== 3 ||
        !planes.has(keyOf(fixed.filter(d => d >= 0)))
      ) {
        return false
      }

      try {
        trialityWeaveLayout({ opposite, triality: p })

        return true
      } catch {
        return false
      }
    },
  )

  if (found === undefined) {
    throw new Error('no color-selecting triality carries leading slots')
  }

  return found
}

type Tone = -1 | 0 | 1

const SCHEDULE = [0, 1, 2, 2, 1, 0]

export const TRIALITY_WEAVE_PERIOD = SCHEDULE.length

export type TrialityWeaveLayout = {
  // the 12 lines as [leading, trailing] slot pairs
  readonly lines: readonly (readonly [number, number])[]
  // indices into lines: the three color lines, and three orbits of three in triality order
  readonly color: readonly number[]
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

  const lineOfLeading = new Map(
    lines.map(([leading], k) => [leading, k]),
  )
  const image = lines.map(([leading, trailing]) => {
    const target = lineOfLeading.get(triality[leading] ?? -1)

    if (
      target === undefined ||
      lines[target]?.[1] !== triality[trailing]
    ) {
      throw new Error(
        'the triality does not carry leading slots to leading slots',
      )
    }

    return target
  })
  const color = image
    .map((target, k) => (target === k ? k : -1))
    .filter(k => k >= 0)
  const seen = new Set(color)
  const orbits: number[][] = []

  for (let k = 0; k < lines.length; k++) {
    if (seen.has(k)) {
      continue
    }

    const orbit = [k, image[k] ?? k, image[image[k] ?? k] ?? k]

    orbit.forEach(l => seen.add(l))
    orbits.push(orbit)
  }

  if (
    color.length !== 3 ||
    orbits.length !== 3 ||
    orbits.some(o => new Set(o).size !== 3)
  ) {
    throw new Error('the permutation is not a color-selecting triality')
  }

  return { lines, color, orbits }
}

type Pair = readonly [Tone, Tone]

// the fallback for a line index out of range, typed as a line so a block keeps its shape
const NO_LINE: readonly [number, number] = [0, 0]

const same = (a: Pair, b: readonly number[]): boolean =>
  a[0] === b[0] && a[1] === b[1]

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

  const write = (
    line: readonly [number, number],
    value: Pair,
  ): void => {
    slots[base + line[0]] = value[0]
    slots[base + line[1]] = value[1]
  }

  const fv = read(f)
  const ov = orbit.map(read)
  const empty: Pair = [0, 0]
  const allOrbit = (value: Pair): boolean =>
    ov.every(v => same(value, v))

  for (const s of [1, -1] as const) {
    const n = -s as Tone

    for (const lone of [
      [s, 0],
      [0, s],
    ] as const) {
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
// the block of color line SCHEDULE[t], so each color line takes its turn on the same palindrome) or
// 'none'. Every choice keeps the triality (each firing block is invariant), CPT (the firing sequence
// is the same palindrome) and reversal (X stays an involution).
export type Firing = 'all' | 'one' | 'none'

// The committed turning weave's conditional swap on two lines: exchange their contents when one holds
// a lone tone on its trailing slot and the other is empty. An involution that conserves charge and
// the number of tones.
export function conditionalSwap(
  slots: Int8Array,
  base: number,
  a: readonly [number, number],
  b: readonly [number, number],
): void {
  const a0 = slots[base + a[0]] ?? 0
  const a1 = slots[base + a[1]] ?? 0
  const b0 = slots[base + b[0]] ?? 0
  const b1 = slots[base + b[1]] ?? 0
  const loneAway = (x: number, y: number): boolean => x === 0 && y !== 0
  const empty = (x: number, y: number): boolean => x === 0 && y === 0

  if (
    (loneAway(a0, a1) && empty(b0, b1)) ||
    (loneAway(b0, b1) && empty(a0, a1))
  ) {
    slots[base + a[0]] = b0
    slots[base + a[1]] = b1
    slots[base + b[0]] = a0
    slots[base + b[1]] = a1
  }
}

//
// `swaps: true` adds the turning weave's conditional swap in triality-symmetric form: each beat the two
// color lines r and r + 1 swap as a couple (a triality fixes both), and the orbits r and r + 1 swap
// line by line in their triality order (a_k with b_k, a set the triality maps to itself). A swap never
// adds a tone, so it cannot start an avalanche. The beat is then V S P S V, a palindrome of
// involutions, so its CPT mirror is its inverse.
export function trialityWeave(input: {
  layout: TrialityWeaveLayout
  forward?: boolean
  creation?: Firing
  exchange?: Firing
  swaps?: boolean
}): (t: number) => Collision {
  const {
    layout,
    forward = true,
    creation = 'one',
    exchange = 'none',
    swaps = true,
  } = input
  const fires = (mode: Firing, i: number, rotation: number): boolean =>
    mode === 'all' || (mode === 'one' && i === rotation)
  const table = forward ? PAIR_FORWARD : PAIR_INVERSE
  const key = (a: number, b: number): number => (a + 1) * 3 + (b + 1)

  return (t: number): Collision => {
    const rotation =
      SCHEDULE[
        ((t % SCHEDULE.length) + SCHEDULE.length) % SCHEDULE.length
      ] ?? 0
    const blocks = layout.color
      .map((f, i) => ({
        f: layout.lines[f] ?? NO_LINE,
        orbit: (layout.orbits[(i + rotation) % 3] ?? []).map(
          l => layout.lines[l] ?? NO_LINE,
        ),
        creation: fires(creation, i, rotation),
        exchange: fires(exchange, i, rotation),
      }))
      .filter(block => block.creation || block.exchange)
    const line = (l: number): readonly [number, number] =>
      layout.lines[l] ?? NO_LINE
    const pairs: [
      readonly [number, number],
      readonly [number, number],
    ][] = swaps
      ? [
          [
            line(layout.color[rotation] ?? 0),
            line(layout.color[(rotation + 1) % 3] ?? 0),
          ],
          ...[0, 1, 2].map(
            k =>
              [
                line(layout.orbits[rotation]?.[k] ?? 0),
                line(layout.orbits[(rotation + 1) % 3]?.[k] ?? 0),
              ] as [
                readonly [number, number],
                readonly [number, number],
              ],
          ),
        ]
      : []

    const swapAll = (slots: Int8Array, base: number): void => {
      for (const [a, b] of pairs) {
        conditionalSwap(slots, base, a, b)
      }
    }

    return (slots, base) => {
      for (const block of blocks) {
        vertex(
          slots,
          base,
          block.f,
          block.orbit,
          block.creation,
          block.exchange,
        )
      }

      swapAll(slots, base)

      for (const [leading, trailing] of layout.lines) {
        const out = table[
          key(slots[base + leading] ?? 0, slots[base + trailing] ?? 0)
        ] ?? [0, 0]

        slots[base + leading] = out[0]
        slots[base + trailing] = out[1]
      }

      swapAll(slots, base)

      for (const block of blocks) {
        vertex(
          slots,
          base,
          block.f,
          block.orbit,
          block.creation,
          block.exchange,
        )
      }
    }
  }
}
