// The orbit knit: a knit whose schedule is one beat carried round by a coin symmetry, built so that its
// glide symmetry can act irreducibly on R^4.
//
// code/measure/glide-group shows why no knit of the committed architecture can do that: its beat (one
// calm-moving table per wire read in index orientation, one couple swapping slot for slot) is left
// invariant by at most one non-central coin map, so every glide group is abelian. The census there finds
// that two changes to the BEAT lift the obstruction, and nothing about the schedule does:
// - every line carries its own orientation: which of its two slots the table reads first (so which
//   slot a pair from calm puts its love on), instead of the lower direction index
// - the swap runs on a whole orbit of couples under the beat's symmetry, instead of on one couple
// Everything else is the committed beat: six couples of a matter line and a wire, the pair table on
// every wire, and on a swapping couple the palindrome swap, clock, swap, where the swap trades the two
// lines slot for slot (first with first) when one holds a lone tone on its second slot and the other
// is calm.
//
// The schedule is C_t = g^t B g^-t: the beat B transported by the t-th power of a coin map g (as
// code/measure/rule-symmetry-ledger conjugateCollision does), so g is a glide symmetry with a shift of
// one beat by construction, and every map k with k B k^-1 = B that g normalizes is a symmetry of every
// beat. The period is the smallest n with g^n B g^-n = B.
//
// orbitBeatFor searches for a beat invariant under a given k: the census's condition with the
// orientation carried round each k-orbit of lines and the swap on one k-orbit of couples, among all
// 10,395 matchings and 64 role choices, keeping the beats whose swap edges, carried round by g over a
// period, connect all twelve lines.

import { Collision, PAIR_FORWARD, PAIR_INVERSE } from '@/code/rule/collision'
import { conjugateCollision } from '@/code/measure/rule-symmetry-ledger'

export type OrbitBeat = {
  // couples as [matter line, wire line], line indices into linesOf(opposite)
  couples: readonly (readonly [number, number])[]
  // per line, the direction index its table reads first
  lead: readonly number[]
  // per couple, whether it runs the palindrome swap
  swaps: readonly boolean[]
  // the swap's condition: 'loneAway', the committed one (a lone tone on one line's second slot, the
  // other line calm), or 'headOn', the head-on turn weave's (a like pair, love and love or fear and fear,
  // on one line, the other calm), which reads the same whichever way either line is oriented and
  // whichever sign the tones carry, so a beat symmetry may reverse lines when it negates tones
  condition?: 'loneAway' | 'headOn'
}

type Tone = -1 | 0 | 1

export function linesOf(opposite: readonly number[]): [number, number][] {
  const lines: [number, number][] = []

  for (let d = 0; d < opposite.length; d++) {
    if (d < (opposite[d] ?? d)) {
      lines.push([d, opposite[d] ?? d])
    }
  }

  return lines
}

export function orbitBeatCollision(input: {
  beat: OrbitBeat
  opposite: readonly number[]
  forward?: boolean
}): Collision {
  const { beat, opposite } = input
  const table = (input.forward ?? true) ? PAIR_FORWARD : PAIR_INVERSE
  const slotsOf = (line: number): [number, number] => {
    const first = beat.lead[line] ?? 0

    return [first, opposite[first] ?? first]
  }
  const plan = beat.couples.map(([matter, wire], c) => ({
    m: slotsOf(matter),
    w: slotsOf(wire),
    swap: beat.swaps[c] ?? false,
  }))
  const headOn = beat.condition === 'headOn'
  const loaded = (a: number, b: number): boolean =>
    headOn ? a === b && a !== 0 : a === 0 && b !== 0
  const empty = (a: number, b: number): boolean => a === 0 && b === 0

  return (slots, base) => {
    for (const { m, w, swap } of plan) {
      const exchange = (): void => {
        const a0 = slots[base + m[0]] ?? 0
        const a1 = slots[base + m[1]] ?? 0
        const b0 = slots[base + w[0]] ?? 0
        const b1 = slots[base + w[1]] ?? 0

        if (
          (loaded(a0, a1) && empty(b0, b1)) ||
          (loaded(b0, b1) && empty(a0, a1))
        ) {
          slots[base + m[0]] = b0
          slots[base + m[1]] = b1
          slots[base + w[0]] = a0
          slots[base + w[1]] = a1
        }
      }
      const clock = (): void => {
        const a = (slots[base + w[0]] ?? 0) as Tone
        const b = (slots[base + w[1]] ?? 0) as Tone
        const image = table[(a + 1) * 3 + (b + 1)] ?? [a, b]

        slots[base + w[0]] = image[0]
        slots[base + w[1]] = image[1]
      }

      if (swap) {
        exchange()
        clock()
        exchange()
      } else {
        clock()
      }
    }
  }
}

function powerOf(permutation: readonly number[], n: number): number[] {
  let out = permutation.map((_, i) => i)

  for (let k = 0; k < n; k++) {
    out = out.map(d => permutation[d] ?? d)
  }

  return out
}

// C_t = g^t B g^-t, forward or inverse; `period` is the schedule period (callers use orbitKnitPeriod).
// With several base beats B_0 .. B_(s-1), beat t = s u + j runs g^u B_j g^-u, so g is a glide with a
// shift of s beats, and `period` counts beats (s times the number of powers of g).
export function orbitKnit(input: {
  beat: OrbitBeat | readonly OrbitBeat[]
  glide: readonly number[]
  period: number
  opposite: readonly number[]
  forward?: boolean
}): (t: number) => Collision {
  const beats: readonly OrbitBeat[] = Array.isArray(input.beat)
    ? input.beat
    : [input.beat as OrbitBeat]
  const bases = beats.map(beat =>
    orbitBeatCollision({ beat, opposite: input.opposite, forward: input.forward }),
  )
  const s = bases.length
  const collisions = Array.from({ length: input.period }, (_, t) =>
    conjugateCollision({
      collision: bases[t % s] ?? bases[0]!,
      permutation: powerOf(input.glide, Math.floor(t / s)),
    }),
  )

  return t =>
    collisions[((t % input.period) + input.period) % input.period] ??
    bases[0]!
}

// For a list of k-invariant beats: the line pairs each couples and the swap edges each makes, carried
// round by g over `powers` powers. Pairs are encoded a * 12 + b with a < b.
export function carriedStructure(input: {
  beats: readonly OrbitBeat[]
  glide: readonly number[]
  opposite: readonly number[]
  powers: number
}): { pairs: Set<number>; swapEdges: [number, number][] }[] {
  const { beats, glide, opposite, powers } = input
  const lines = linesOf(opposite)
  const lineOf = new Array<number>(opposite.length).fill(-1)

  lines.forEach(([a, b], l) => {
    lineOf[a] = l
    lineOf[b] = l
  })

  return beats.map(beat => {
    const pairs = new Set<number>()
    const swapEdges: [number, number][] = []
    let power = glide.map((_, i) => i)

    for (let u = 0; u < powers; u++) {
      beat.couples.forEach(([m, w], c) => {
        const a = lineOf[power[lines[m]?.[0] ?? 0] ?? 0] ?? 0
        const b = lineOf[power[lines[w]?.[0] ?? 0] ?? 0] ?? 0

        pairs.add(Math.min(a, b) * 12 + Math.max(a, b))

        if (beat.swaps[c]) {
          swapEdges.push([a, b])
        }
      })
      power = power.map(d => glide[d] ?? d)
    }

    return { pairs, swapEdges }
  })
}

// the two beats (possibly one beat twice) whose carried swap edges together connect all twelve lines
// and whose carried couples meet the most line pairs, first in enumeration order among ties
export function bestBeatPair(input: {
  beats: readonly OrbitBeat[]
  glide: readonly number[]
  opposite: readonly number[]
  powers: number
}): { first: OrbitBeat; second: OrbitBeat; pairs: number } | undefined {
  const carried = carriedStructure(input)
  let best: { first: OrbitBeat; second: OrbitBeat; pairs: number } | undefined

  for (let i = 0; i < carried.length; i++) {
    for (let j = i; j < carried.length; j++) {
      const parent = Array.from({ length: 12 }, (_, x) => x)
      const find = (x: number): number =>
        parent[x] === x ? x : (parent[x] = find(parent[x] ?? x))

      for (const [a, b] of [
        ...(carried[i]?.swapEdges ?? []),
        ...(carried[j]?.swapEdges ?? []),
      ]) {
        parent[find(a)] = find(b)
      }

      if (new Set(Array.from({ length: 12 }, (_, l) => find(l))).size !== 1) {
        continue
      }

      const pairs = new Set([
        ...(carried[i]?.pairs ?? []),
        ...(carried[j]?.pairs ?? []),
      ]).size

      if (!best || pairs > best.pairs) {
        best = {
          first: input.beats[i] as OrbitBeat,
          second: input.beats[j] as OrbitBeat,
          pairs,
        }
      }
    }
  }

  return best
}

// A schedule folded into a palindrome: beats 0 .. n-1 of the given schedule, then the same beats in
// reverse order, period 2n, so beat t and beat 2n - 1 - t are the same collision. With every beat
// CT-symmetric (negating the tones inverts it), the fold is CPT-symmetric with the identity coin map at
// mirror phase 2n - 1, as the committed rule's out-and-back walk is (E-FND-0117).
export function palindromicSchedule(input: {
  schedule: (t: number) => Collision
  n: number
}): (t: number) => Collision {
  const { schedule, n } = input
  const period = 2 * n

  return t => {
    const u = ((t % period) + period) % period

    return schedule(u < n ? u : period - 1 - u)
  }
}

// the beat q B q^-1: couples and leads carried by the coin map q
export function transportBeat(input: {
  beat: OrbitBeat
  map: readonly number[]
  opposite: readonly number[]
}): OrbitBeat {
  const { beat, map, opposite } = input
  const lines = linesOf(opposite)
  const lineOf = new Array<number>(opposite.length).fill(-1)

  lines.forEach(([a, b], l) => {
    lineOf[a] = l
    lineOf[b] = l
  })

  const lineImage = (l: number): number =>
    lineOf[map[lines[l]?.[0] ?? 0] ?? 0] ?? 0
  const lead = new Array<number>(lines.length).fill(0)

  beat.lead.forEach((root, l) => {
    lead[lineImage(l)] = map[root] ?? root
  })

  return {
    couples: beat.couples.map(([m, w]) => [lineImage(m), lineImage(w)]),
    lead,
    swaps: [...beat.swaps],
    condition: beat.condition,
  }
}

// Every coin map that leaves the beat invariant, with its sign eta: +1 carries every wire's first root
// to the image wire's first root (tones kept), -1 to its opposite (tones negated, which only a
// sign-symmetric swap condition survives). The map must keep the couples and their roles, the set of
// swapping couples, and the orientation of every wire and, under 'loneAway', of every swapping matter
// line. Returned as [permutation index, eta] pairs.
export function beatSymmetries(input: {
  beat: OrbitBeat
  permutations: readonly (readonly number[])[]
  opposite: readonly number[]
  // the permutation indices to test, when the caller already knows only these can keep the couples,
  // roles and swaps (structuralCandidates), as beats differing only in orientation share them
  candidates?: readonly number[]
}): [number, number][] {
  const { beat, permutations, opposite } = input
  const lines = linesOf(opposite)
  const lineOf = new Array<number>(opposite.length).fill(-1)

  lines.forEach(([a, b], l) => {
    lineOf[a] = l
    lineOf[b] = l
  })

  const coupleOf = new Map<string, number>()

  beat.couples.forEach(([m, w], c) => {
    coupleOf.set(`${m}/${w}`, c)
  })

  const oriented = beat.couples.flatMap(([m, w], c) =>
    beat.swaps[c] && beat.condition !== 'headOn' ? [m, w] : [w],
  )
  const out: [number, number][] = []
  const tested = input.candidates ?? permutations.map((_, i) => i)

  tested.forEach(index => {
    const p = permutations[index] ?? []
    const image = (l: number): number => lineOf[p[lines[l]?.[0] ?? 0] ?? 0] ?? 0

    for (const eta of [1, -1]) {
      if (eta === -1 && beat.condition !== 'headOn') {
        continue
      }

      const keeps = beat.couples.every(([m, w], c) => {
        const target = coupleOf.get(`${image(m)}/${image(w)}`)

        return target !== undefined && (beat.swaps[target] ?? false) === (beat.swaps[c] ?? false)
      })

      if (!keeps) {
        continue
      }

      const orientationKept = oriented.every(l => {
        const carried = p[beat.lead[l] ?? 0] ?? 0
        const lead = beat.lead[image(l)] ?? 0

        return eta === 1 ? carried === lead : carried === opposite[lead]
      })

      if (orientationKept) {
        out.push([index, eta])
      }
    }
  })

  return out
}

// the coin maps that keep a beat's couples with their roles and its set of swapping couples, whatever
// the orientation: the only candidates beatSymmetries needs to test for any beat with that structure
export function structuralCandidates(input: {
  beat: OrbitBeat
  permutations: readonly (readonly number[])[]
  opposite: readonly number[]
}): number[] {
  const { beat, permutations, opposite } = input
  const lines = linesOf(opposite)
  const lineOf = new Array<number>(opposite.length).fill(-1)

  lines.forEach(([a, b], l) => {
    lineOf[a] = l
    lineOf[b] = l
  })

  const coupleOf = new Map<string, number>()

  beat.couples.forEach(([m, w], c) => {
    coupleOf.set(`${m}/${w}`, c)
  })

  return permutations
    .map((p, index) => {
      const image = (l: number): number => lineOf[p[lines[l]?.[0] ?? 0] ?? 0] ?? 0
      const keeps = beat.couples.every(([m, w], c) => {
        const target = coupleOf.get(`${image(m)}/${image(w)}`)

        return target !== undefined && (beat.swaps[target] ?? false) === (beat.swaps[c] ?? false)
      })

      return keeps ? index : -1
    })
    .filter(i => i >= 0)
}

// Every distinct full stabilizer (as [permutation index, sign] lists, of more than the identity) of the
// beats a relaxation admits: for each given class representative and both signs, every beat it leaves
// invariant under every orientation choice, each beat's stabilizer computed against the structural
// candidates its couples and swaps allow (shared by all its orientations). A sign a class does not admit
// simply yields no beats.
export function admissibleStabilizers(input: {
  representatives: readonly number[]
  permutations: readonly (readonly number[])[]
  opposite: readonly number[]
  shape: {
    orientation: 'index' | 'all'
    fixedSwap: boolean
    condition: 'loneAway' | 'headOn'
  }
}): { stabilizers: [number, number][][]; beats: number } {
  const { representatives, permutations, opposite, shape } = input
  const glide = opposite.map((_, i) => i)
  const found = new Map<string, [number, number][]>()
  const structure = new Map<string, number[]>()
  let beats = 0

  for (const r of representatives) {
    for (const eta of [1, -1]) {
      const list = orbitBeatFor({
        k: permutations[r] ?? [],
        glide,
        opposite,
        limit: 100_000_000,
        components: 12,
        eta,
        ...shape,
      })

      beats += list.length

      for (const beat of list) {
        const key = beat.couples.map(([m, w], c) => `${m}/${w}${beat.swaps[c] ? 's' : ''}`).join(' ')
        const candidates =
          structure.get(key) ?? structuralCandidates({ beat, permutations, opposite })

        structure.set(key, candidates)

        const s = beatSymmetries({ beat, permutations, opposite, candidates })

        if (s.length > 1) {
          found.set(s.map(([i, e]) => `${i}:${e}`).sort().join(','), s)
        }
      }
    }
  }

  return { stabilizers: [...found.values()], beats }
}

// whether two beats are the same collision in structure: the same couples with the same roles and swaps,
// and the same lead on every wire and on every swapping matter line (the lines the collision reads)
export function sameBeat(a: OrbitBeat, b: OrbitBeat): boolean {
  const key = (beat: OrbitBeat): string =>
    beat.couples
      .map(([m, w], c) => {
        const swap = beat.swaps[c] ?? false

        return `${m}:${swap ? beat.lead[m] : '-'}/${w}:${beat.lead[w]}/${swap ? 's' : 'c'}`
      })
      .sort()
      .join(' ')

  return key(a) === key(b)
}

// the smallest n with g^n B g^-n = B, tested on the lone-tone states and a deterministic dense set
export function orbitKnitPeriod(input: {
  beat: OrbitBeat
  glide: readonly number[]
  opposite: readonly number[]
  maxPeriod?: number
  states: readonly Int8Array[]
}): number {
  const base = orbitBeatCollision({ beat: input.beat, opposite: input.opposite })
  const a = new Int8Array(input.opposite.length)
  const b = new Int8Array(input.opposite.length)

  for (let n = 1; n <= (input.maxPeriod ?? 48); n++) {
    const moved = conjugateCollision({
      collision: base,
      permutation: powerOf(input.glide, n),
    })
    const same = input.states.every(state => {
      a.set(state)
      b.set(state)
      base(a, 0, a.length)
      moved(b, 0, b.length)

      return a.every((x, i) => x === b[i])
    })

    if (same) {
      return n
    }
  }

  return -1
}

// every beat invariant under k (orientation-preserving, tau the identity) whose swap edges, carried
// round by g for a period, connect all twelve lines; the first found in a fixed enumeration order
export function orbitBeatFor(input: {
  k: readonly number[]
  glide: readonly number[]
  opposite: readonly number[]
  limit?: number
  // the most swap-edge components a kept beat may leave (1: connect all twelve lines)
  components?: number
  // the sign of k: +1 keeps every line's orientation, -1 reverses it and negates the tones (the beat is
  // then invariant under k with charge conjugation, which needs the 'headOn' condition)
  eta?: number
  condition?: 'loneAway' | 'headOn'
  // 'carried' (the default): each k-orbit of lines oriented by carrying its lowest line's first root
  // round the orbit; 'all': every choice of orientation for each k-orbit (each can be flipped as a
  // whole); 'index': every line reads its lower direction first (the committed orientation), and only
  // lines whose index orientation k carries consistently may be wires
  orientation?: 'carried' | 'all' | 'index'
  // with a fixed swap couple (k maps it to itself) instead of a k-orbit of couples, the committed shape
  fixedSwap?: boolean
}): OrbitBeat[] {
  const { k, glide, opposite } = input
  const allowed = input.components ?? 1
  const eta = input.eta ?? 1
  const condition = input.condition ?? 'loneAway'
  const orientation = input.orientation ?? 'carried'
  const lines = linesOf(opposite)
  const lineOf = new Array<number>(opposite.length).fill(-1)

  lines.forEach(([a, b], l) => {
    lineOf[a] = l
    lineOf[b] = l
  })

  const lineImage = (p: readonly number[], l: number): number =>
    lineOf[p[lines[l]?.[0] ?? 0] ?? 0] ?? 0
  // a line is compatible when carrying its first root round its k-orbit returns it with the sign eta^l;
  // under 'index' when k carries its lower direction to eta times the image line's lower direction
  const compatible = lines.map(([a], l) => {
    if (orientation === 'index') {
      const image = k[a] ?? a
      const lead = lines[lineOf[image] ?? 0]?.[0] ?? 0

      return eta === 1 ? image === lead : image === opposite[lead]
    }

    let root = a
    let length = 0

    do {
      root = k[root] ?? root
      length++
    } while (lineOf[root] !== l)

    return (root === a ? 1 : -1) === eta ** length
  })
  // the k-orbits of lines, for flipping orientations orbit by orbit
  const orbitOf = new Array<number>(lines.length).fill(-1)
  let orbitCount = 0

  for (let l = 0; l < lines.length; l++) {
    if ((orbitOf[l] ?? -1) >= 0) {
      continue
    }

    let root = lines[l]?.[0] ?? 0

    while ((orbitOf[lineOf[root] ?? 0] ?? -1) < 0) {
      orbitOf[lineOf[root] ?? 0] = orbitCount
      root = k[root] ?? root
    }

    orbitCount++
  }

  const flipChoices = orientation === 'all' ? 1 << orbitCount : 1
  // under 'headOn' the swap reads the same whichever way its lines face, so a swap line needs no
  // orientation; under 'loneAway' it does
  const swapNeedsOrientation = condition === 'loneAway'
  const matchings: [number, number][][] = []
  const build = (rest: readonly number[], acc: [number, number][]): void => {
    if (rest.length === 0) {
      matchings.push(acc)

      return
    }

    const [a, ...others] = rest

    others.forEach((b, i) => {
      build(
        others.filter((_, j) => j !== i),
        [...acc, [a ?? 0, b]],
      )
    })
  }

  build(
    Array.from({ length: lines.length }, (_, i) => i),
    [],
  )

  const out: OrbitBeat[] = []

  for (const m of matchings) {
    const partner = new Array<number>(lines.length).fill(-1)

    for (const [a, b] of m) {
      partner[a] = b
      partner[b] = a
    }

    if (!m.every(([a, b]) => partner[lineImage(k, a)] === lineImage(k, b))) {
      continue
    }

    for (let mask = 0; mask < 1 << m.length; mask++) {
      const wires = m.map(([a, b], c) => ((mask >> c) & 1 ? b : a))
      const matters = m.map(([a, b], c) => ((mask >> c) & 1 ? a : b))
      const isWire = new Array<boolean>(lines.length).fill(false)

      wires.forEach(w => {
        isWire[w] = true
      })

      if (!wires.every(w => compatible[w] && isWire[lineImage(k, w)])) {
        continue
      }

      // the swap on the k-orbit of one couple with a compatible matter line
      for (let seed = 0; seed < m.length; seed++) {
        if (swapNeedsOrientation && !compatible[matters[seed] ?? 0]) {
          continue
        }

        if (
          input.fixedSwap &&
          (lineImage(k, wires[seed] ?? 0) !== wires[seed] ||
            lineImage(k, matters[seed] ?? 0) !== matters[seed])
        ) {
          continue
        }

        const swapWires = new Set<number>()
        let w = wires[seed] ?? 0

        do {
          swapWires.add(w)
          w = lineImage(k, w)
        } while (!swapWires.has(w))

        const swaps = wires.map(x => swapWires.has(x))

        // orientation: the index one, or carry each line's first root round its k-orbit
        const carriedLead = lines.map(([a]) => a)

        if (orientation !== 'index') {
          const done = new Array<boolean>(lines.length).fill(false)

          for (let l = 0; l < lines.length; l++) {
            if (done[l]) {
              continue
            }

            let root = lines[l]?.[0] ?? 0

            while (!done[lineOf[root] ?? 0]) {
              done[lineOf[root] ?? 0] = true
              carriedLead[lineOf[root] ?? 0] = root

              // the image line reads first the image root, reversed when k negates
              const image = k[root] ?? root

              root = eta === 1 ? image : (opposite[image] ?? image)
            }
          }
        }

        // connectivity of the swap edges carried round by g
        const parent = Array.from({ length: lines.length }, (_, i) => i)
        const find = (x: number): number =>
          parent[x] === x ? x : (parent[x] = find(parent[x] ?? x))
        let power = glide.map((_, i) => i)

        for (let t = 0; t < 24; t++) {
          m.forEach((_, c) => {
            if (swaps[c]) {
              const a = lineImage(power, matters[c] ?? 0)
              const b = lineImage(power, wires[c] ?? 0)

              parent[find(a)] = find(b)
            }
          })
          power = power.map(d => glide[d] ?? d)
        }

        const roots = new Set(lines.map((_, l) => find(l)))

        if (roots.size > allowed) {
          continue
        }

        // every orientation choice asked for: each set bit flips a whole k-orbit of lines
        for (let flip = 0; flip < flipChoices; flip++) {
          const lead = carriedLead.map((root, l) =>
            (flip >> (orbitOf[l] ?? 0)) & 1 ? (opposite[root] ?? root) : root,
          )

          out.push({
            couples: m.map((_, c) => [matters[c] ?? 0, wires[c] ?? 0]),
            lead,
            swaps,
            condition,
          })

          if (out.length >= (input.limit ?? 1)) {
            return out
          }
        }
      }
    }
  }

  return out
}
