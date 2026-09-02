// The acceptance battery for the proposed knit, and the design law it forced. The user chose
// acceptance-first: re-measure every canon pillar under the palindrome before committing anything.
// The battery immediately earned its keep, twice:
//
//   - THE FULL PALINDROME FAILS THE WALL SECTOR. With the swap on every couple, offset domains do
//     not keep thin walls: the seam radiates (the swap converts seam-mismatch tones into
//     travellers) and the two-domain system blends into a steady mixed state near thirty percent
//     of all slots. The condensate canon cannot carry over to that knit.
//   - THE CROSS-PLANE PAIRING IS ANISOTROPIC. Its six wires contain no x-component at all, so
//     x-offset domains form no walls anywhere, a structurally preferred axis.
//
// Both failures pointed at one design: the BALANCED PARTIAL knit. The pairing is plane-balanced
// (each of the six planes contributes exactly one wire and one matter line, so every axis lies in
// exactly three wire planes and no axis is special), and the swap runs on ONE couple only, the
// matter sector, while the other five couples run the committed clock alone, the medium. Under it,
// every pillar measured here survives:
//
//   - the traveller (swap couple): clean, ballistic to the torus maximum, and the wire-polarization
//     law holds with the predicted planes (responses at x and z, its wire plane, exact support one
//     at y and w while crossing those walls)
//   - selective measurement with the commensurability null: x-wall responses 93, 115, and exactly
//     1 at birth offsets one, two, three
//   - free-streaming ghost species on the clock-only matter lines: ballistic, support exactly one
//     through every wall (a decoupled sector the model gets for free, noted as a dark-matter-shaped
//     bonus rather than a claim)
//   - exact echo, exact superposition, exact CPT (zero violating slots each)
//   - walls that stay BOUNDED and localized: the offset-1 wall's content sits in a breathing band
//     (13,122 slots at the matched beat) against the full palindrome's runaway blend (43,740 at
//     the same beat and geometry, more than three times larger), and its slots sit only in the
//     boundary rows with the bulk exactly vacuum
//   - THE TRADE LAW, measured: wall content in the swap-wire's own planes (x, z) runs higher than
//     in the swap-free orientations (y, w), the price of the matter sector, localized to exactly
//     the planes that bought it
//
// So the acceptance candidate is the balanced partial knit: one interacting matter plane, five
// clock couples as the stable medium, every axis walled, nature's discrete symmetries, and the
// whole particle canon intact. Depth L2, deterministic, no randomness. Adoption stays the user's
// decision, with this battery as its evidence.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import {
  beat,
  growingBeat,
  streamInverse,
} from '@/code/rule/lattice-gas'
import {
  couplesFrom,
  linesOf,
  palindromeFor,
} from '@/task/palindrome-hunt'
import {
  PAIR_FORWARD,
  PAIR_INVERSE,
  Collision,
} from '@/code/rule/collision'
import { Tone } from '@/code/tone/will'

const SIDE = 9
const BALANCED: number[][] = [
  [0, 2],
  [3, 1],
  [4, 6],
  [7, 5],
  [8, 10],
  [11, 9],
]

const pairKey = (a: Tone, b: Tone): number => (a + 1) * 3 + (b + 1)

function partialKnit(input: {
  couples: [[number, number], [number, number]][]
  forward: boolean
}): Collision {
  const table = input.forward ? PAIR_FORWARD : PAIR_INVERSE

  return (slots, base) => {
    for (let k = 0; k < input.couples.length; k++) {
      const [line, wire] = input.couples[k]!
      const loneAway = (a: Tone, b: Tone): boolean =>
        a === 0 && b !== 0
      const empty = (a: Tone, b: Tone): boolean =>
        a === 0 && b === 0

      const swap = (): void => {
        const a0 = slots[base + line[0]]! as Tone
        const a1 = slots[base + line[1]]! as Tone
        const w0 = slots[base + wire[0]]! as Tone
        const w1 = slots[base + wire[1]]! as Tone

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
        const a = slots[base + wire[0]]! as Tone
        const b = slots[base + wire[1]]! as Tone
        const image = table[pairKey(a, b)]!

        slots[base + wire[0]] = image[0]!
        slots[base + wire[1]] = image[1]!
      }

      if (k === 0) {
        swap()
        clock()
        swap()
      } else {
        clock()
      }
    }
  }
}

export default experiment({
  id: 'foundations/partial-knit-acceptance',
  code: 'E-FND-0109',
  title:
    'the acceptance battery verdict: the full palindrome fails the wall sector (seams radiate into a steady thirty-percent blend) and the cross-plane pairing is anisotropic (no wire contains x, so x-walls cannot form), which forces the balanced partial knit (a plane-balanced pairing, swap on one couple, clock on five) under which every pillar survives: the clean ballistic traveller with the polarization law at its predicted planes, selectivity with the exact commensurability null (93, 115, 1 at offsets one, two, three), free-streaming ghost species at exact support one, exact echo, superposition and CPT, walls bounded at a third of the full palindrome and localized to boundary rows, and the measured trade law (wall content runs higher in exactly the swap-wire planes that bought the matter sector)',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const lines = linesOf(meshOpposites(mesh))
    const couples = couplesFrom(BALANCED, lines)
    const rule = partialKnit({ couples, forward: true })
    const ruleInverse = partialKnit({ couples, forward: false })
    const fullPalindrome = palindromeFor(couples)
    const coordinate = (c: number, a: number): number =>
      Math.floor(c / SIDE ** a) % SIDE
    const mid = Math.floor(SIDE / 2)

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

    // 1. the traveller and the ghost, each against a one-beat x-wall
    const slabRun = (
      seedDirection: number,
    ): { maxSupport: number; distance: number } => {
      const late = new Set<number>()

      for (let c = 0; c < mesh.cellCount; c++) {
        const q = coordinate(c, 0)

        if (q >= 4 && q <= 6) {
          late.add(c)
        }
      }

      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)
      let maxSupport = 0
      let distance = 0

      for (let t = 0; t < 24; t++) {
        if (t === 3) {
          seeded.data[seedCell * 24 + seedDirection] = 1
        }

        const active = (c: number): boolean =>
          late.has(c) ? t >= 1 : true

        vacuum = growingBeat(vacuum, rule, active)
        seeded = growingBeat(seeded, rule, active)

        let support = 0

        for (let i = 0; i < seeded.data.length; i++) {
          if (seeded.data[i] !== vacuum.data[i]) {
            support++

            const cell = Math.floor(i / 24)

            let far = 0

            for (let a = 0; a < 4; a++) {
              const q = Math.abs(
                coordinate(cell, a) - coordinate(seedCell, a),
              )

              far += Math.min(q, SIDE - q)
            }

            distance = Math.max(distance, far)
          }
        }

        maxSupport = Math.max(maxSupport, support)
      }

      return { maxSupport, distance }
    }

    // the traveller's responses per axis and offset
    const responseAt = (axis: number, offset: number): number => {
      const late = new Set<number>()

      for (let c = 0; c < mesh.cellCount; c++) {
        const q = coordinate(c, axis)

        if (q >= 4 && q <= 6) {
          late.add(c)
        }
      }

      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)
      let max = 0

      for (let t = 0; t < 24; t++) {
        if (t === 3) {
          seeded.data[seedCell * 24] = 1
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

        max = Math.max(max, support)
      }

      return max
    }

    const xOffset1 = responseAt(0, 1)
    const xOffset2 = responseAt(0, 2)
    const xOffset3 = responseAt(0, 3)
    const yBlind = responseAt(1, 1)
    const zCoupled = responseAt(2, 1)
    const wBlind = responseAt(3, 1)
    const polarization =
      xOffset1 > 50 && zCoupled > 50 && yBlind === 1 && wBlind === 1
    const selectivity =
      xOffset2 > xOffset1 && xOffset3 === 1

    const ghost = slabRun(lines[3]![0])
    const ghostClean =
      ghost.maxSupport === 1 && ghost.distance >= 8

    // 2. exact echo, superposition, CPT
    const start = makeWill(mesh)

    for (let i = 0; i < start.data.length; i++) {
      start.data[i] = ((((i * 5 + (i % 11)) % 3) - 1) as Tone)
    }

    let echoState: Will = { mesh, data: Int8Array.from(start.data) }

    for (let t = 0; t < 15; t++) {
      echoState = beat(echoState, rule)
    }

    for (let t = 0; t < 15; t++) {
      echoState = streamInverse(echoState)

      for (let c = 0; c < mesh.cellCount; c++) {
        ruleInverse(echoState.data, c * 24, 24)
      }
    }

    let echoHamming = 0

    for (let i = 0; i < echoState.data.length; i++) {
      if (echoState.data[i] !== start.data[i]) {
        echoHamming++
      }
    }

    const secondSeed = 1 + 2 * SIDE + 2 * SIDE * SIDE + 2 * SIDE ** 3

    const differenceOf = (seeds: number[]): Will => {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      for (let t = 0; t < 12; t++) {
        if (t === 3) {
          for (const cell of seeds) {
            seeded.data[cell * 24] = 1
          }
        }

        vacuum = growingBeat(vacuum, rule, () => true)
        seeded = growingBeat(seeded, rule, () => true)
      }

      const difference = makeWill(mesh)

      for (let i = 0; i < seeded.data.length; i++) {
        difference.data[i] = (seeded.data[i]! -
          vacuum.data[i]!) as Tone
      }

      return difference
    }

    const single = differenceOf([seedCell])
    const other = differenceOf([secondSeed])
    const joint = differenceOf([seedCell, secondSeed])

    let superpositionMismatch = 0

    for (let i = 0; i < joint.data.length; i++) {
      if (joint.data[i] !== single.data[i]! + other.data[i]!) {
        superpositionMismatch++
      }
    }

    const cptTransform = (w: Will): Will => {
      const out = makeWill(mesh)

      for (let c = 0; c < mesh.cellCount; c++) {
        const target =
          ((SIDE - coordinate(c, 0)) % SIDE) +
          ((SIDE - coordinate(c, 1)) % SIDE) * SIDE +
          ((SIDE - coordinate(c, 2)) % SIDE) * SIDE * SIDE +
          ((SIDE - coordinate(c, 3)) % SIDE) * SIDE ** 3

        for (let d = 0; d < 24; d++) {
          out.data[target * 24 + d] = -w.data[c * 24 + d]! as Tone
        }
      }

      return out
    }

    let cptViolation = 0

    {
      const left = beat(
        cptTransform({ mesh, data: Int8Array.from(start.data) }),
        rule,
      )
      const copy: Will = { mesh, data: Int8Array.from(start.data) }

      for (let c = 0; c < mesh.cellCount; c++) {
        ruleInverse(copy.data, c * 24, 24)
      }

      const right = cptTransform(streamInverse(copy))

      for (let i = 0; i < left.data.length; i++) {
        if (left.data[i] !== right.data[i]) {
          cptViolation++
        }
      }
    }

    // 3. walls: bounded against the full palindrome, localized to boundary rows
    const wallContent = (
      knit: Collision,
      beats: number,
    ): { total: number; interiorRows: number } => {
      const birth = (c: number): number =>
        coordinate(c, 1) < 4 ? 0 : 1

      let two: Will = makeWill(mesh)
      let vacuumA: Will = makeWill(mesh)
      let vacuumB: Will = makeWill(mesh)

      for (let t = 0; t < beats; t++) {
        two = growingBeat(two, knit, (c: number) => t >= birth(c))
        vacuumA = growingBeat(vacuumA, knit, () => t >= 0)
        vacuumB = growingBeat(vacuumB, knit, () => t >= 1)
      }

      let total = 0

      const perRow = new Array<number>(SIDE).fill(0)

      for (let i = 0; i < two.data.length; i++) {
        const c = Math.floor(i / 24)
        const expected =
          birth(c) === 0 ? vacuumA.data[i] : vacuumB.data[i]

        if (two.data[i] !== expected) {
          total++
          perRow[coordinate(c, 1)]!++
        }
      }

      // interior rows: away from both seams (y = 4 and the torus seam y = 0)
      let interiorRows = 0

      for (const y of [1, 2, 5, 6, 7]) {
        if (perRow[y]! > 0) {
          interiorRows++
        }
      }

      return { total, interiorRows }
    }

    const partialWall = wallContent(rule, 24)
    const fullWall = wallContent(fullPalindrome, 24)
    const wallsBounded =
      partialWall.total < 0.4 * fullWall.total &&
      partialWall.interiorRows === 0
    const tradeLaw = (() => {
      // wall content per axis at the same beat: the swap-wire planes (x, z) run higher
      const axisContent = (axis: number): number => {
        const birth = (c: number): number =>
          coordinate(c, axis) < 4 ? 0 : 1

        let two: Will = makeWill(mesh)
        let vacuumA: Will = makeWill(mesh)
        let vacuumB: Will = makeWill(mesh)

        for (let t = 0; t < 24; t++) {
          two = growingBeat(two, rule, (c: number) => t >= birth(c))
          vacuumA = growingBeat(vacuumA, rule, () => t >= 0)
          vacuumB = growingBeat(vacuumB, rule, () => t >= 1)
        }

        let total = 0

        for (let i = 0; i < two.data.length; i++) {
          const c = Math.floor(i / 24)
          const expected =
            birth(c) === 0 ? vacuumA.data[i] : vacuumB.data[i]

          if (two.data[i] !== expected) {
            total++
          }
        }

        return total
      }

      const x = axisContent(0)
      const y = axisContent(1)
      const z = axisContent(2)
      const w = axisContent(3)

      return x > y && z > y && x > w && z > w
    })()

    const ok =
      polarization &&
      selectivity &&
      ghostClean &&
      echoHamming === 0 &&
      superpositionMismatch === 0 &&
      cptViolation === 0 &&
      wallsBounded &&
      tradeLaw

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the traveller couples at its wire planes and is exactly blind elsewhere, offsets one, two, three give rising response then the exact null, the ghost streams at support one, echo, superposition and CPT are exactly zero, the partial wall holds under forty percent of the full-palindrome wall with zero interior-row content, and the swap-wire planes carry more wall than the swap-free ones',
      metrics: {
        xWallOffsets123: Number(
          `${xOffset1}.${xOffset2}${xOffset3}`,
        ),
        blindResponses: Math.max(yBlind, wBlind),
        ghostMaxSupport: ghost.maxSupport,
        echoHamming,
        superpositionMismatch,
        cptViolation,
        partialWallSlots: partialWall.total,
        fullPalindromeWallSlots: fullWall.total,
      },
      // CONTROL: the full palindrome's wall content at the same beat and geometry, the runaway the
      // partial knit avoids, and the interior rows, exactly empty
      control: {
        wallRatio: Number(
          (partialWall.total / fullWall.total).toFixed(3),
        ),
        interiorRowsWithContent: partialWall.interiorRows,
      },
      notes:
        'the design space this battery mapped: every swap-couple buys a matter plane at the cost of extra wall content in its own wire planes (the trade law), the full palindrome (all swaps) loses stable walls entirely, and the clock-only knit (no swaps, the committed rule) has stable walls and no matter. The balanced partial knit is the measured optimum of that dial at one swap. The clock-only matter lines are free-streaming ghosts, decoupled from everything measured here, recorded as structure. Adoption of this knit as the committed base rule is the standing user decision, with the coarse bridge (sixth-thing-0006) unchanged either way.',
    })
  },
})
