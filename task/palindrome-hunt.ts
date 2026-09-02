// The palindrome-family hunt. Every perfect matching of the d4 mesh's 12 lines into 6
// (matter, wire) couples defines a palindrome knit (swap, clock, swap). All 10,395 matchings are
// swept through staged gates, cheapest first, writing results incrementally:
//
//   stage 1  the traveller gate at side 7: a lone tone must hold support exactly one against the
//            uniform vacuum (a single-cell orbit, exact because streaming fixes uniform states)
//            for 18 post-seed beats and reach distance 5.
//   stage 2  the selectivity gate at side 9: the one-beat-offset slab response must stay small
//            while the two-beat-offset slab amplifies (the E-FND-0095 detector contrast lineHop
//            had and the canonical palindrome lost).
//
// Run: pnpm call task/palindrome-hunt.ts [--stage2-only <file>] . Results stream to
// tmp/palindrome-hunt.csv (stage 1) and stdout (stage 2 ranking). CPT is structural for the whole
// family (full inversion fixes every line and the palindrome inverts under negation), verified for
// winners in the experiment that cites this hunt.
import { appendFileSync, writeFileSync } from 'node:fs'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { PAIR_FORWARD, Collision } from '@/code/rule/collision'
import { beat, growingBeat } from '@/code/rule/lattice-gas'
import { Tone } from '@/code/tone/will'

const pairKey = (a: Tone, b: Tone): number => (a + 1) * 3 + (b + 1)

export type Couples = [[number, number], [number, number]][]

export function palindromeFor(couples: Couples): Collision {
  const loneAway = (a: Tone, b: Tone): boolean => a === 0 && b !== 0
  const empty = (a: Tone, b: Tone): boolean => a === 0 && b === 0

  return (slots, base) => {
    for (const [line, wire] of couples) {
      const swap = (): void => {
        const a0 = (slots[base + line[0]] ?? 0) as Tone
        const a1 = (slots[base + line[1]] ?? 0) as Tone
        const w0 = (slots[base + wire[0]] ?? 0) as Tone
        const w1 = (slots[base + wire[1]] ?? 0) as Tone

        if (
          (loneAway(a0, a1) && empty(w0, w1)) ||
          (loneAway(w0, w1) && empty(a0, a1))
        ) {
          slots[base + line[0]] = w0
          slots[base + line[1]] = w1
          slots[base + wire[0]] = a0
          slots[base + wire[1]] = a1
        }
      }

      const clock = (): void => {
        const a = (slots[base + wire[0]] ?? 0) as Tone
        const b = (slots[base + wire[1]] ?? 0) as Tone
        const image = PAIR_FORWARD[pairKey(a, b)]!

        slots[base + wire[0]] = image[0]!
        slots[base + wire[1]] = image[1]!
      }

      swap()
      clock()
      swap()
    }
  }
}

export function linesOf(opposite: number[]): [number, number][] {
  const lines: [number, number][] = []

  for (let d = 0; d < opposite.length; d++) {
    const o = opposite[d]!

    if (d < o) {
      lines.push([d, o])
    }
  }

  return lines
}

// enumerate perfect matchings of n items (n even) as arrays of index pairs
export function matchings(n: number): number[][][] {
  const out: number[][][] = []
  const items = Array.from({ length: n }, (_, i) => i)

  const build = (rest: number[], acc: number[][]): void => {
    if (rest.length === 0) {
      out.push(acc.map(p => [...p]))

      return
    }

    const first = rest[0]!

    for (let j = 1; j < rest.length; j++) {
      build(
        rest.filter((_, k) => k !== 0 && k !== j),
        [...acc, [first, rest[j]!]],
      )
    }
  }

  build(items, [])

  return out
}

export function couplesFrom(
  matching: number[][],
  lines: [number, number][],
): Couples {
  return matching.map(([a, b]) => [lines[a!]!, lines[b!]!])
}

// stage 1: the traveller gate at side 7 against the exact single-cell vacuum orbit
export function travellerGate(
  couples: Couples,
  seedDirection = 0,
): {
  pass: boolean
  distance: number
} {
  const side = 7
  const mesh = d4Mesh({ side })
  const rule = palindromeFor(couples)
  const beats = 21
  const orbit: Int8Array[] = []

  let vacuumCell = new Int8Array(24)

  for (let t = 0; t < beats; t++) {
    const copy = Int8Array.from(vacuumCell)

    rule(copy, 0, 24)
    vacuumCell = copy
    orbit.push(Int8Array.from(vacuumCell))
  }

  const coordinate = (c: number, a: number): number =>
    Math.floor(c / side ** a) % side
  const mid = Math.floor(side / 2)

  let seedCell = 0

  for (let c = 0; c < mesh.cellCount; c++) {
    if (
      coordinate(c, 0) === 1 &&
      coordinate(c, 1) === mid &&
      coordinate(c, 2) === mid &&
      coordinate(c, 3) === mid
    ) {
      seedCell = c
      break
    }
  }

  let seeded: Will = makeWill(mesh)
  let distance = 0

  for (let t = 0; t < beats; t++) {
    if (t === 3) {
      seeded.data[seedCell * 24 + seedDirection] = 1
    }

    seeded = beat(seeded, rule)

    if (t < 3) {
      continue
    }

    let support = 0
    let far = 0

    for (let c = 0; c < mesh.cellCount && support <= 1; c++) {
      const base = c * 24

      for (let d = 0; d < 24; d++) {
        if (seeded.data[base + d] !== orbit[t]![d]) {
          support++

          if (support > 1) {
            break
          }

          let dist = 0

          for (let a = 0; a < 4; a++) {
            const dd = Math.abs(
              coordinate(c, a) - coordinate(seedCell, a),
            )

            dist += Math.min(dd, side - dd)
          }

          far = Math.max(far, dist)
        }
      }
    }

    if (support !== 1) {
      return { pass: false, distance }
    }

    distance = Math.max(distance, far)
  }

  return { pass: distance >= 5, distance }
}

// stage 2: the slab responses at side 9, offsets 1 and 2
export function slabGate(
  couples: Couples,
  seedDirection = 0,
): {
  offset1: number
  offset2: number
} {
  const side = 9
  const mesh = d4Mesh({ side })
  const rule = palindromeFor(couples)
  const coordinate = (c: number, a: number): number =>
    Math.floor(c / side ** a) % side
  const mid = Math.floor(side / 2)

  let seedCell = 0

  for (let c = 0; c < mesh.cellCount; c++) {
    if (
      coordinate(c, 0) === 1 &&
      coordinate(c, 1) === mid &&
      coordinate(c, 2) === mid &&
      coordinate(c, 3) === mid
    ) {
      seedCell = c
      break
    }
  }

  const late = new Set<number>()

  for (let c = 0; c < mesh.cellCount; c++) {
    const x = coordinate(c, 0)

    if (x >= 4 && x <= 6) {
      late.add(c)
    }
  }

  const responseAt = (offset: number): number => {
    let vacuum: Will = makeWill(mesh)
    let seeded: Will = makeWill(mesh)
    let maxSupport = 0

    for (let t = 0; t < 24; t++) {
      if (t === 3) {
        seeded.data[seedCell * 24 + seedDirection] = 1
      }

      const active = (c: number): boolean =>
        late.has(c) ? t >= offset : true

      vacuum = growingBeat(vacuum, rule, active)
      seeded = growingBeat(seeded, rule, active)

      let support = 0

      for (let i = 0; i < seeded.data.length; i++) {
        if (seeded.data[i] !== vacuum.data[i]) {
          support++
        }
      }

      maxSupport = Math.max(maxSupport, support)
    }

    return maxSupport
  }

  return { offset1: responseAt(1), offset2: responseAt(2) }
}

// the induced permutation of the 12 lines under each signed-permutation point-group element,
// used to quotient the 10,395 matchings into physical classes before running any dynamics
export function linePermutations(input: {
  lines: [number, number][]
  roots: number[][]
}): number[][] {
  const { lines, roots } = input
  const rootIndex = new Map<string, number>(
    roots.map((r, i) => [r.join(','), i]),
  )
  const lineOfDirection = new Array<number>(24).fill(-1)

  for (let l = 0; l < lines.length; l++) {
    lineOfDirection[lines[l]![0]] = l
    lineOfDirection[lines[l]![1]] = l
  }

  const perms4: number[][] = []

  const build = (acc: number[], rest: number[]): void => {
    if (rest.length === 0) {
      perms4.push(acc)

      return
    }

    for (let i = 0; i < rest.length; i++) {
      build([...acc, rest[i]!], rest.filter((_, j) => j !== i))
    }
  }

  build([], [0, 1, 2, 3])

  const out: number[][] = []

  for (const p of perms4) {
    for (let m = 0; m < 16; m++) {
      const s = [m & 1 ? -1 : 1, m & 2 ? -1 : 1, m & 4 ? -1 : 1, m & 8 ? -1 : 1]
      const linePerm = new Array<number>(lines.length).fill(-1)

      for (let l = 0; l < lines.length; l++) {
        const root = roots[lines[l]![0]]!
        const image = [0, 1, 2, 3].map(i => s[i]! * root[p[i]!]!)
        const target = rootIndex.get(image.join(','))!

        linePerm[l] = lineOfDirection[target]!
      }

      out.push(linePerm)
    }
  }

  return out
}

// the canonical key of a matching under a set of line permutations (unordered pairs, sorted)
export function canonicalKey(
  matching: number[][],
  linePerms: number[][],
): string {
  let best = ''

  for (const perm of linePerms) {
    const mapped = matching
      .map(([a, b]) => {
        const x = perm[a!]!
        const y = perm[b!]!

        return x < y ? `${x}-${y}` : `${y}-${x}`
      })
      .sort()
      .join('|')

    if (best === '' || mapped < best) {
      best = mapped
    }
  }

  return best
}

const isMain = process.argv[1]?.includes('palindrome-hunt')

if (isMain) {
  const { rootsD4 } = await import('@/code/algebra/group/root-system')
  const mesh = d4Mesh({ side: 7 })
  const lines = linesOf(meshOpposites(mesh))
  const roots = rootsD4()
  const all = matchings(12)
  const linePerms = linePermutations({ lines, roots })
  const classes = new Map<string, { rep: number[][]; size: number }>()

  for (const matching of all) {
    const key = canonicalKey(matching, linePerms)
    const entry = classes.get(key)

    if (entry) {
      entry.size++
    } else {
      classes.set(key, { rep: matching, size: 1 })
    }
  }

  console.log(
    `${all.length} matchings fall into ${classes.size} classes under the 384-element group`,
  )

  const log = 'tmp/palindrome-hunt.csv'

  writeFileSync(
    log,
    'class,orbitSize,seedLine,distance,offset1,offset2,ratio\n',
  )

  const started = Date.now()

  let classIndex = 0

  for (const [key, entry] of classes) {
    const couples = couplesFrom(entry.rep, lines)
    // seed on each line's head direction, deduplicating identical outcomes
    const seen = new Set<string>()

    for (let seedLine = 0; seedLine < lines.length; seedLine++) {
      const seedDirection = lines[seedLine]![0]
      const stage1 = travellerGate(couples, seedDirection)

      if (!stage1.pass) {
        appendFileSync(
          log,
          `${key},${entry.size},${seedLine},${stage1.distance},,,no-traveller\n`,
        )
        continue
      }

      const stage2 = slabGate(couples, seedDirection)
      const ratio =
        stage2.offset1 === 0
          ? Infinity
          : stage2.offset2 / stage2.offset1
      const outcome = `${stage1.distance},${stage2.offset1},${stage2.offset2},${ratio.toFixed(2)}`

      if (seen.has(outcome)) {
        continue
      }

      seen.add(outcome)
      appendFileSync(
        log,
        `${key},${entry.size},${seedLine},${outcome}\n`,
      )

      if (ratio >= 3) {
        console.log(
          `SELECTIVE class=${key} seed=${seedLine} ${outcome}`,
        )
      }
    }

    classIndex++
    console.log(
      `class ${classIndex}/${classes.size} ${key} orbit=${entry.size} [${((Date.now() - started) / 1000).toFixed(0)}s]`,
    )
  }

  console.log(
    `done in ${((Date.now() - started) / 1000).toFixed(0)}s, log at ${log}`,
  )
}
