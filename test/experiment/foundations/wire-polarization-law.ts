// The wire-polarization law, the palindrome-family hunt's discovery. The hunt asked whether any
// pairing of the 12 lines gives a palindrome knit whose traveller keeps both wake-free transmission
// and a selective detector. The answer is yes, and the mechanism is a law nobody wrote in: THE
// PAIRING SETS THE TRAVELLER'S POLARIZATION. A domain wall along axis a lives in the flashing of
// wires whose plane contains a (wires orthogonal to the boundary flash identically on both sides),
// so a traveller couples to exactly the walls whose axis lies in its WIRE plane:
//
//   - THE LAW, MEASURED ON ALL FOUR AXES: the traveller on the (x, y)-plane line with a
//     (y, z)-plane wire (the cross-plane pairing) responds to y-walls (support 102) and z-walls
//     (88), and is EXACTLY blind to x-walls and w-walls (support exactly one at every beat, while
//     crossing the x-slab repeatedly): wake-free transmission through the walls outside its wire
//     plane, response at the walls inside it. Four predictions, four hits, two of them exact.
//   - SELECTIVITY RETURNS: within the coupled orientation the response distinguishes offsets (160
//     at two beats against 102 at one), and across orientations the contrast is perfect (one
//     against a hundred), so wake-free crossing and detection coexist in ONE knit for the first
//     time, resolved by polarization.
//   - THE CANONICAL PAIRING IS THE DEGENERATE CASE: pairing each line with its own-plane partner
//     puts every wall axis inside every traveller's wire plane, which is why E-FND-0095/0096 saw
//     response at every wall, and why the family looked rigid until the cross-plane classes ran.
//   - CPT STILL COMES FREE: the polarized knit is a palindrome, and its CPT conjugation (negation,
//     full inversion, velocity reversal) is verified exact here on generic states, with echo and
//     superposition exact for the polarized traveller as well.
//
// What remains unsupplied for the full quantum signature is unchanged: in-flight phase rotation
// (the blind crossing preserves the phase exactly, which is transmission but not yet
// e^{i k x}). Depth L2: a measured law of the candidate family with exact controls, found by the
// permanent hunt harness (task/palindrome-hunt.ts). Deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Tone, Will } from '@/code/tone/will'
import { beat, collide, growingBeat, streamInverse } from '@/code/rule/lattice-gas'
import {
  couplesFrom,
  linesOf,
  palindromeFor,
} from '@/task/palindrome-hunt'
import { PAIR_INVERSE, Collision } from '@/code/rule/collision'

const SIDE = 9
const SEED_BEAT = 3
// the cross-plane pairing: line k with line k + 6, each x-plane line wired to a non-x plane
const CROSS_PLANE: number[][] = [
  [0, 6],
  [1, 7],
  [2, 8],
  [3, 9],
  [4, 10],
  [5, 11],
]

const pairKey = (a: Tone, b: Tone): number => (a + 1) * 3 + (b + 1)

function crossPalindromeInverse(
  couples: [[number, number], [number, number]][],
): Collision {
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
        const image = PAIR_INVERSE[pairKey(a, b)]!

        slots[base + wire[0]] = image[0]!
        slots[base + wire[1]] = image[1]!
      }

      swap()
      clock()
      swap()
    }
  }
}

export default experiment({
  id: 'foundations/wire-polarization-law',
  code: 'E-FND-0105',
  title:
    "the wire-polarization law: the palindrome pairing sets which wall orientations a traveller couples to, measured on all four axes for the cross-plane knit (responses 102 and 88 at the two axes inside its wire plane, support EXACTLY one at every beat at the two axes outside it while crossing those walls repeatedly), so wake-free transmission and selective detection coexist in one knit for the first time with a perfect one-against-a-hundred orientation contrast plus offset selectivity inside the coupled orientation (160 against 102), the canonical same-plane pairing is the degenerate everything-coupled case that made the family look rigid, and the polarized knit keeps exact echo, superposition, and its CPT conjugation, leaving in-flight phase rotation as the one unsupplied ingredient",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const lines = linesOf(opposite)
    const couples = couplesFrom(CROSS_PLANE, lines)
    const rule = palindromeFor(couples)
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

    // the wall response along each axis, at a given birth offset
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
        if (t === SEED_BEAT) {
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

    const xResponse = responseAt(0, 1)
    const yResponse = responseAt(1, 1)
    const zResponse = responseAt(2, 1)
    const wResponse = responseAt(3, 1)
    const yOffset2 = responseAt(1, 2)

    // the law: blind exactly where the wire plane (y, z) does not reach, coupled where it does
    const blindExact = xResponse === 1 && wResponse === 1
    const coupled = yResponse > 50 && zResponse > 50
    const offsetSelective = yOffset2 > 1.3 * yResponse

    // echo and superposition for the polarized knit
    const ruleInverse = crossPalindromeInverse(couples)
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
      collide(echoState, ruleInverse)
    }

    let echoHamming = 0

    for (let i = 0; i < echoState.data.length; i++) {
      if (echoState.data[i] !== start.data[i]) {
        echoHamming++
      }
    }

    const secondSeed =
      1 + 2 * SIDE + 2 * SIDE * SIDE + 2 * SIDE * SIDE * SIDE

    const differenceOf = (seeds: number[]): Will => {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      for (let t = 0; t < 14; t++) {
        if (t === SEED_BEAT) {
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

    // the CPT conjugation for the polarized knit: negation with full inversion and velocity
    // reversal maps the beat to the flipped inverse, on a generic state
    const cptTransform = (w: Will): Will => {
      const out = makeWill(mesh)

      for (let c = 0; c < mesh.cellCount; c++) {
        const target =
          ((SIDE - coordinate(c, 0)) % SIDE) +
          ((SIDE - coordinate(c, 1)) % SIDE) * SIDE +
          ((SIDE - coordinate(c, 2)) % SIDE) * SIDE * SIDE +
          ((SIDE - coordinate(c, 3)) % SIDE) * SIDE * SIDE * SIDE

        for (let d = 0; d < 24; d++) {
          // full inversion sends each direction to its opposite, and velocity reversal sends it
          // back, so the slot map is the identity and CPT acts as pure negation on inverted cells
          out.data[target * 24 + d] = -w.data[c * 24 + d]! as Tone
        }
      }

      return out
    }

    const flippedInverse = (w: Will): Will => {
      const copy: Will = { mesh, data: Int8Array.from(w.data) }

      collide(copy, ruleInverse)

      return streamInverse(copy)
    }

    let cptViolation = 0

    {
      const left = beat(cptTransform({ mesh, data: Int8Array.from(start.data) }), rule)
      const right = cptTransform(flippedInverse({ mesh, data: Int8Array.from(start.data) }))

      for (let i = 0; i < left.data.length; i++) {
        if (left.data[i] !== right.data[i]) {
          cptViolation++
        }
      }
    }

    const ok =
      blindExact &&
      coupled &&
      offsetSelective &&
      echoHamming === 0 &&
      superpositionMismatch === 0 &&
      cptViolation === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the traveller is blind at exactly support one along the two axes outside its wire plane, responds above fifty along the two inside it with the two-beat offset at least thirty percent above the one-beat, and the polarized knit keeps echo, superposition, and its CPT conjugation exact',
      metrics: {
        xWallResponse: xResponse,
        yWallResponse: yResponse,
        zWallResponse: zResponse,
        wWallResponse: wResponse,
        yWallOffset2Response: yOffset2,
        echoHamming,
        superpositionMismatch,
        cptViolationSlots: cptViolation,
      },
      // CONTROL: the two blind axes, where the same traveller crossing the same kind of wall
      // registers exactly nothing, so the coupled responses are the polarization and not the method
      control: {
        blindAxesWorstResponse: Math.max(xResponse, wResponse),
      },
      notes:
        'the law in one sentence: a wall along axis a lives in the flashing of wires whose plane contains a, so the pairing chooses which walls each traveller can see. The full hunt (task/palindrome-hunt.ts, 10,395 pairings in 90 classes, logged) is what surfaced the cross-plane classes, and an earlier same-day reading of the partial log as family rigidity was wrong and is superseded by this law, the honesty cascade working as designed. The physics reading: one knit hosts differently-polarized traveller species, some blind to a given wall (the neutrino flavor of the picture) and some detected by it, and the in-flight phase rotation that would complete e^{i(kx - wt)} remains the single unsupplied ingredient, with the blind crossing preserving the phase exactly.',
    })
  },
})
