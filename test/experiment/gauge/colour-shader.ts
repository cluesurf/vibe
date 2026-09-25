// The shader: the smallest version of the amplitude the committed rule lacks, put on the rule's own
// world lines and read off its screen. E-FRC-0100 shows the colour-symmetric pair unitaries form one
// circle U(phi) = P_sym + e^{i phi} P_anti whose only classical points are the identity (phi = 0) and
// the swap (phi = pi). This asks what turning phi does to something a coarse observer could see.
//
// The carrier. A colour label cannot ride a tone of the committed rule in general, because the vacuum
// clock creates and annihilates tones on every line, and at a flip or an annihilation there is no fact
// about which tone went where. What the rule preserves exactly is an excitation over the vacuum, a
// start one slot away from the vacuum whose run stays exactly one slot away at every beat
// (code/dynamics/colour-worldline). On a side-7 D4 mesh over 49 beats, 6 of the 48 (tone, direction)
// lone starts do this. Three of them are placed so that they meet: A and C run along the direction
// (1,1,0,0) one cell apart, B along (1,-1,0,0) from A's cell, so B shares a cell with A every seven
// beats and with C three beats later. The joint run is checked slot by slot against the vacuum run with
// the three single excitations written in, at every beat, so the world lines survive every encounter.
//
// The shader. Each excitation carries a colour qutrit, A red, B green, C blue. At every collision event
// (two excitations in one cell when the collision acts) the pair's qutrits get U(phi), the operator
// E-FRC-0100 built (pairExchangeUnitary). The tones never read the colour, so every tone observable is
// the same at every phi. The screen observable is which excitation ends holding which colour: the
// probability that A ends red, after all 15 events.
//
// Controls. At phi = 0 and pi the shader is a permutation and the answer must be 0 or 1 exactly. The
// classical control swaps each event's pair with probability sin^2(phi / 2), the one-event swap
// probability of U(phi), and is computed exactly over the six colour assignments: it agrees with the
// quantum answer after a single event and at the two classical points, and any gap elsewhere is
// interference between orders of events, which a stochastic permutation cannot produce. What the phase
// cannot change is checked too: the total colour content (each colour held by exactly one excitation
// in total probability), the su(3) quadratic Casimir expectation, and the colour-singlet weight, all
// fixed at every phi and every beat because U(phi) commutes with every global colour rotation.
//
// Depth L2: the unitary is put in by hand (it is the missing ingredient, stated), the world lines and
// the order of events are the committed rule's.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { turningWeave } from '@/code/rule/collision'
import {
  applyPairOperator,
  classicalColourProbability,
  colourBasisState,
  colourProbability,
  excitationWorldLines,
  expectation,
  reducedPurity,
  supportOneSpecies,
  type ColourState,
  type Seed,
} from '@/code/dynamics/colour-worldline'
import {
  combineOperators,
  epsilonState,
  liftGenerator,
  makeOperator,
  multiplyOperators,
  pairExchangeUnitary,
  unitaryAlgebra,
  type Operator,
} from '@/code/measure/colour-symmetry'

const SIDE = 7
const BEATS = 49
const PHASES = [0, 0.25, 0.5, 0.75, 1].map(f => f * Math.PI)
const COLOURS = [0, 1, 2]

// A and C one cell apart along (0,1,0,0), all three running at the speed of light
const SEEDS: Seed[] = [
  { tone: 1, direction: 0, cell: 0 },
  { tone: 1, direction: 1, cell: 0 },
  { tone: 1, direction: 0, cell: SIDE },
]

// sum over the su(3) basis of lift(X)^dagger lift(X), the quadratic Casimir on three triplets
function casimir(): Operator {
  const slots = ['plain', 'plain', 'plain'] as const
  const size = 27

  return combineOperators(
    unitaryAlgebra({ d: 3, special: true }).map(generator => {
      const lifted = liftGenerator({ generator, d: 3, slots })
      const adjoint = makeOperator({ size })

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          adjoint.re[c * size + r] = lifted.re[r * size + c] ?? 0
          adjoint.im[c * size + r] = -(lifted.im[r * size + c] ?? 0)
        }
      }

      return { operator: multiplyOperators(adjoint, lifted), re: 1 }
    }),
  )
}

function singletWeight(state: ColourState): number {
  const epsilon = epsilonState()

  let re = 0
  let im = 0

  for (let s = 0; s < 27; s++) {
    re += (epsilon.re[s] ?? 0) * (state.re[s] ?? 0)
    im += (epsilon.re[s] ?? 0) * (state.im[s] ?? 0)
  }

  return re * re + im * im
}

export default experiment({
  id: 'gauge/colour-shader',
  code: 'E-FRC-0105',
  title:
    'a colour qutrit on three exactly preserved excitations of the committed rule, with the colour-symmetric unitary U(phi) at each of their 15 encounters, makes which excitation ends holding which colour a continuous function of phi, a permutation at phi = 0 and pi and fractional between, differing from the matched classical random swap by interference between orders of encounters, while every tone observable, the colour content, the Casimir weight and the singlet weight stay fixed',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const schedule = turningWeave({ opposite: meshOpposites(mesh) })
    const species = supportOneSpecies({ mesh, schedule, beats: BEATS })
    const lines = excitationWorldLines({
      mesh,
      schedule,
      seeds: SEEDS,
      beats: BEATS,
    })
    const C = casimir()
    const initial = colourBasisState({ colours: COLOURS, d: 3 })
    const casimirStart = expectation({ state: initial, operator: C })
    const singletStart = singletWeight(initial)

    let casimirDrift = 0
    let singletDrift = 0
    let contentDrift = 0

    const results = PHASES.map(phase => {
      const operator = pairExchangeUnitary({
        d: 3,
        kind: 'plain',
        phase,
      })

      let state = initial

      for (const event of lines.events) {
        state = applyPairOperator({
          state,
          operator,
          d: 3,
          i: event.first,
          j: event.second,
        })

        casimirDrift = Math.max(
          casimirDrift,
          Math.abs(expectation({ state, operator: C }) - casimirStart),
        )

        singletDrift = Math.max(
          singletDrift,
          Math.abs(singletWeight(state) - singletStart),
        )

        for (const colour of COLOURS) {
          const held = [0, 1, 2].reduce(
            (s, slot) =>
              s + colourProbability({ state, d: 3, slot, colour }),
            0,
          )

          contentDrift = Math.max(contentDrift, Math.abs(held - 1))
        }
      }

      const quantum = colourProbability({
        state,
        d: 3,
        slot: 0,
        colour: 0,
      })
      const classical = classicalColourProbability({
        events: lines.events,
        swapProbability: Math.sin(phase / 2) ** 2,
        colours: COLOURS,
        slot: 0,
        colour: 0,
      })

      return {
        phase,
        quantum,
        classical,
        purity: reducedPurity({ state, d: 3, slot: 0 }),
      }
    })

    const at = (fraction: number) =>
      results.find(
        r => Math.abs(r.phase - fraction * Math.PI) < 1e-12,
      ) ?? results[0]!
    const classicalPoints = [at(0), at(1)]
    const interior = results.filter(
      r => r.phase > 0 && r.phase < Math.PI,
    )
    const pointsArePermutations = classicalPoints.every(
      r =>
        Math.min(Math.abs(r.quantum), Math.abs(r.quantum - 1)) <
          1e-12 && Math.abs(r.purity - 1) < 1e-12,
    )
    const pointsMatchClassical = classicalPoints.every(
      r => Math.abs(r.quantum - r.classical) < 1e-12,
    )
    const interiorFractional = interior.every(
      r => r.quantum > 0.01 && r.quantum < 0.99,
    )
    const interiorEntangled = interior.every(r => r.purity < 1 - 1e-6)
    const largestGap = Math.max(
      ...interior.map(r => Math.abs(r.quantum - r.classical)),
    )
    const firstEvent = lines.events[0]
    const firstEventOnly = PHASES.every(phase => {
      if (firstEvent === undefined) {
        return false
      }

      const state = applyPairOperator({
        state: initial,
        operator: pairExchangeUnitary({ d: 3, kind: 'plain', phase }),
        d: 3,
        i: firstEvent.first,
        j: firstEvent.second,
      })
      const quantum = colourProbability({
        state,
        d: 3,
        slot: firstEvent.first,
        colour: COLOURS[firstEvent.first] ?? 0,
      })

      return Math.abs(quantum - Math.cos(phase / 2) ** 2) < 1e-12
    })
    const invariantsHold =
      casimirDrift < 1e-9 &&
      singletDrift < 1e-12 &&
      contentDrift < 1e-12
    const ok =
      species.length === 6 &&
      lines.supportOne &&
      lines.superposes &&
      lines.events.length === 15 &&
      pointsArePermutations &&
      pointsMatchClassical &&
      interiorFractional &&
      interiorEntangled &&
      largestGap > 0.05 &&
      firstEventOnly &&
      invariantsHold

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'three excitations the committed rule preserves exactly (support one at every beat, exact superposition through all 15 encounters) carry a colour qutrit each, and the colour-symmetric unitary at each encounter turns the probability that A ends red from 1 at phi = 0 to 0 or 1 at phi = pi through fractional values between, with A entangled in between and the matched classical random swap agreeing only at single encounters and the two classical points, while the colour content, the su(3) Casimir weight and the singlet weight never move',
      metrics: {
        supportOneSpecies: species.length,
        encounters: lines.events.length,
        superpositionDefects: lines.superpositionDefects,
        aRedAtZero: at(0).quantum,
        aRedAtQuarter: at(0.25).quantum,
        aRedAtHalf: at(0.5).quantum,
        aRedAtThreeQuarters: at(0.75).quantum,
        aRedAtPi: at(1).quantum,
        aPurityAtHalf: at(0.5).purity,
        largestQuantumClassicalGap: largestGap,
        casimirDrift,
        singletWeight: singletStart,
        singletDrift,
      },
      control: {
        classicalAtQuarter: at(0.25).classical,
        classicalAtHalf: at(0.5).classical,
        classicalAtThreeQuarters: at(0.75).classical,
        classicalAtPi: at(1).classical,
        singleEncounterMatchesCosineSquared: firstEventOnly ? 1 : 0,
      },
      notes:
        'L2, stated plainly: U(phi) is added by hand, the one ingredient E-FND-0080 and E-FRC-0100 show the base lacks, and nothing in the committed rule chooses phi. What the rule supplies is the carrier (the only world lines it preserves exactly are single-slot excitations over the vacuum, 6 of 48 lone starts on this mesh, while a tone as such has no identity through the create, flip and annihilate moves) and the order and timing of encounters. A shared cell is taken as the encounter, although the collision acts on separate lines and the tones do not scatter: the classical dynamics is exactly linear here, so the colour exchange is the only interaction. What phi changes on the screen is who carries which colour and how entangled the carriers are. What it cannot change: every tone observable (the tones never read colour), the colour content, and every su(3) invariant of the colour register, because U(phi) commutes with every global colour rotation. Pair creation in the colour singlet was not used: the committed table turns every empty wire line into a pair and every (-1, +1) wire state back into an empty line, so allowing annihilation only from the singlet would veto moves the committed table performs, which changes the rule.',
    })
  },
})
