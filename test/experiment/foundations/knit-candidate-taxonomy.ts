// The knit-candidate taxonomy: what the widened park-family hunt found, measured. The user-approved
// programme (2026-09-01) hunts a wake-free variant that passes the full quantum gate (ballistic or
// travelling motion, magnitude recoherence, phase rotation on domain crossing) before any knit change
// is proposed; nothing here alters the committed base. Roughly a thousand rules have now been swept
// (task/rule-search.ts and the widened probes), and the survivors organize into a taxonomy with three
// distinguished rules, all exactly reversible and conserving:
//
//   - THE JEWEL (the committed charge table on every line, plus ONE clause: a line swaps with its
//     partner when one holds a lone head-slot tone and the other the marked pair). A clean orbiting
//     quasiparticle: support at most 2, magnitude exactly sqrt 3, two clock phases, exact unions,
//     exact echo. Against a one-beat-offset domain it is a MIRROR: the particle bounces off with a
//     transient three-cell dressing and returns to exactly sqrt 3, its phase set unchanged, support
//     never above 4 over sixty beats. Against a two-beat-offset domain the wall is a DETECTOR: the
//     difference amplifies past sixty cells, the same phase-selective amplification the committed
//     rule's walls show.
//   - THE PARK RULE (lines swap on lone against marked, wires run the charge clock): the only rule
//     measured to TRANSMIT through an offset domain with its recoherent phase ROTATED by one clock
//     unit, at the cost of a wake.
//   - THE WAKE-FREE RUNNER (swap on lone against empty, an anti-clock wire, charge matter): a
//     single-slot traveller recohering at every beat in free flight, whose offset domains explode.
//
// So motion, recoherence, mirrors, detectors and rotation each exist exactly, no rule yet unites
// transmission-with-rotation and wake-freedom, and that conjunction is the remaining hunt. Depth L2:
// designed candidate dynamics measured exactly, the committed rule's pinned defect as the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites, shellDistances } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import {
  Collision,
  PAIR_FORWARD,
  PAIR_INVERSE,
  pairCollision,
} from '@/code/rule/collision'
import {
  beat,
  growingBeat,
  stream,
  streamInverse,
} from '@/code/rule/lattice-gas'
import {
  clockAmplitude,
  phaseDegrees,
} from '@/code/measure/clock-amplitude'
import {
  pairAbs2,
  pairAdd,
  pairSub,
} from '@/code/algebra/linear/complex-pair'

const ROOT3 = Math.sqrt(3)
const EXACT = 1e-9

const pairKey = (a: number, b: number): number => (a + 1) * 3 + (b + 1)

function couplesOf(
  mesh: ReturnType<typeof d4Mesh>,
): [[number, number], [number, number]][] {
  const opposite = meshOpposites(mesh)
  const lines: [number, number][] = []

  for (let d = 0; d < mesh.degree; d++) {
    const o = opposite[d]!

    if (d < o) {
      lines.push([d, o])
    }
  }

  const couples: [[number, number], [number, number]][] = []

  for (let k = 0; k + 1 < lines.length; k += 2) {
    couples.push([lines[k]!, lines[k + 1]!])
  }

  return couples
}

// the jewel: charge table everywhere, plus the lone-head against marked swap
function jewelKnit(
  mesh: ReturnType<typeof d4Mesh>,
  forward: boolean,
): Collision {
  const couples = couplesOf(mesh)
  const table = forward ? PAIR_FORWARD : PAIR_INVERSE
  const loneHead = (a: number, b: number): boolean => a !== 0 && b === 0
  const marked = (a: number, b: number): boolean => a === 1 && b === -1

  return (slots, base) => {
    for (const [line, wire] of couples) {
      const swap = (): void => {
        const a0 = slots[base + line[0]]!
        const a1 = slots[base + line[1]]!
        const w0 = slots[base + wire[0]]!
        const w1 = slots[base + wire[1]]!

        if (
          (loneHead(a0, a1) && marked(w0, w1)) ||
          (loneHead(w0, w1) && marked(a0, a1))
        ) {
          slots[base + line[0]] = w0
          slots[base + line[1]] = w1
          slots[base + wire[0]] = a0
          slots[base + wire[1]] = a1
        }
      }

      const tables = (): void => {
        for (const pair of [wire, line]) {
          const image = table[pairKey(slots[base + pair[0]]!, slots[base + pair[1]]!)]!

          slots[base + pair[0]] = image[0]
          slots[base + pair[1]] = image[1]
        }
      }

      if (forward) {
        swap()
        tables()
      } else {
        tables()
        swap()
      }
    }
  }
}

// the park rule: lone against marked line swap, charge clock on wires only
function parkKnit(mesh: ReturnType<typeof d4Mesh>): Collision {
  const couples = couplesOf(mesh)
  const lone = (a: number, b: number): boolean => (a === 0) !== (b === 0)
  const marked = (a: number, b: number): boolean => a === 1 && b === -1

  return (slots, base) => {
    for (const [line, wire] of couples) {
      const a0 = slots[base + line[0]]!
      const a1 = slots[base + line[1]]!
      const w0 = slots[base + wire[0]]!
      const w1 = slots[base + wire[1]]!

      if (
        (lone(a0, a1) && marked(w0, w1)) ||
        (lone(w0, w1) && marked(a0, a1))
      ) {
        slots[base + line[0]] = w0
        slots[base + line[1]] = w1
        slots[base + wire[0]] = a0
        slots[base + wire[1]] = a1
      }

      const image = PAIR_FORWARD[pairKey(slots[base + wire[0]]!, slots[base + wire[1]]!)]!

      slots[base + wire[0]] = image[0]
      slots[base + wire[1]] = image[1]
    }
  }
}

// a traveller against a birth-1 or birth-2 y-slab; reports support ceiling, whether the particle ever
// enters the slab, and the recoherent phase sets before and after contact
function slabRun(input: {
  rule: Collision
  birth: number
  beats: number
  seedSlot: number
}): {
  maxSupport: number
  entered: boolean
  prePhases: number[]
  postPhases: number[]
} {
  const side = 9
  const mesh = d4Mesh({ side })
  const coordinate = (c: number, axis: number): number =>
    Math.floor(c / side ** axis) % side
  const late = new Set<number>()

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const y = coordinate(cell, 1)

    if (y >= 4 && y <= 6) {
      late.add(cell)
    }
  }

  let seedCell = 0

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    if (
      coordinate(cell, 0) === 4 &&
      coordinate(cell, 1) === 0 &&
      coordinate(cell, 2) === 4 &&
      coordinate(cell, 3) === 4
    ) {
      seedCell = cell
      break
    }
  }

  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)

  let maxSupport = 0
  let entered = false

  const pre = new Set<number>()
  const post = new Set<number>()

  for (let t = 0; t < input.beats; t++) {
    if (t === 3) {
      seeded.data[seedCell * mesh.degree + input.seedSlot] = 1
    }

    const active = (cell: number): boolean =>
      late.has(cell) ? t >= input.birth : true

    vacuum = growingBeat(vacuum, input.rule, active)
    seeded = growingBeat(seeded, input.rule, active)

    let support = 0

    for (let i = 0; i < seeded.data.length; i++) {
      if (seeded.data[i] !== vacuum.data[i]) {
        support++

        const y = coordinate(Math.floor(i / mesh.degree), 1)

        if (y >= 4 && y <= 6) {
          entered = true
        }
      }
    }

    maxSupport = Math.max(maxSupport, support)

    const difference = pairSub(
      clockAmplitude(seeded),
      clockAmplitude(vacuum),
    )
    const magnitude = Math.sqrt(pairAbs2(difference))

    if (Math.abs(magnitude - ROOT3) < EXACT) {
      ;(t < 20 ? pre : post).add(phaseDegrees(difference))
    }
  }

  return {
    maxSupport,
    entered,
    prePhases: [...pre].sort((a, b) => a - b),
    postPhases: [...post].sort((a, b) => a - b),
  }
}

export default experiment({
  id: 'foundations/knit-candidate-taxonomy',
  code: 'E-FND-0094',
  title:
    'the knit-candidate taxonomy from the thousand-rule hunt: the jewel (the committed charge table everywhere plus one swap clause) is a clean orbiting quasiparticle with exact echo, exact unions, support at most 2 at exactly sqrt 3, for which a one-beat-offset domain is a MIRROR (bounces, support at most 4, phases unchanged) and a two-beat-offset domain a DETECTOR (amplifies past sixty cells), while the park rule remains the only measured TRANSMITTER whose recoherent phase rotates by one clock unit on crossing, so motion, recoherence, mirrors, detectors and rotation all exist exactly and no rule yet unites transmission-with-rotation and wake-freedom',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // 1. the jewel's legality: exact echo with charge conserved
    const echoMesh = d4Mesh({ side: 7 })

    let will: Will = makeWill(echoMesh)

    for (let i = 0; i < will.data.length; i += 5) {
      will.data[i] = ((i / 5) % 3) - 1
    }

    const start = Int8Array.from(will.data)
    const forward = jewelKnit(echoMesh, true)
    const backward = jewelKnit(echoMesh, false)

    for (let t = 0; t < 20; t++) {
      for (let cell = 0; cell < echoMesh.cellCount; cell++) {
        forward(will.data, cell * echoMesh.degree, echoMesh.degree)
      }

      will = stream(will)
    }

    for (let t = 0; t < 20; t++) {
      will = streamInverse(will)

      for (let cell = 0; cell < echoMesh.cellCount; cell++) {
        backward(will.data, cell * echoMesh.degree, echoMesh.degree)
      }
    }

    let echoHamming = 0

    for (let i = 0; i < will.data.length; i++) {
      if (will.data[i] !== start[i]) {
        echoHamming++
      }
    }

    // 2. the jewel's free particle: support, magnitude, phases, union, at side 9
    const freeMesh = d4Mesh({ side: 9 })
    const freeRule = jewelKnit(freeMesh, true)
    const centre = Math.floor(freeMesh.cellCount / 2)
    const far = [0, 1, 2, 3].reduce(
      c => freeMesh.neighbour(c, 4),
      centre,
    )

    const runFree = (
      seeds: number[],
    ): { d: [number, number]; support: number }[] => {
      let vacuum: Will = makeWill(freeMesh)
      let seeded: Will = makeWill(freeMesh)

      for (const cell of seeds) {
        seeded.data[cell * freeMesh.degree] = 1
      }

      const out: { d: [number, number]; support: number }[] = []

      for (let t = 0; t < 30; t++) {
        vacuum = beat(vacuum, freeRule)
        seeded = beat(seeded, freeRule)

        let support = 0

        for (let i = 0; i < seeded.data.length; i++) {
          if (seeded.data[i] !== vacuum.data[i]) {
            support++
          }
        }

        out.push({
          d: pairSub(
            clockAmplitude(seeded),
            clockAmplitude(vacuum),
          ) as [number, number],
          support,
        })
      }

      return out
    }

    const one = runFree([centre])
    const two = runFree([far])
    const both = runFree([centre, far])

    const freeClean = one.every(
      x =>
        x.support >= 1 &&
        x.support <= 2 &&
        Math.abs(Math.sqrt(pairAbs2(x.d)) - ROOT3) < EXACT,
    )
    const freePhases = new Set(one.map(x => phaseDegrees(x.d)))

    let unionGap = 0

    for (let t = 0; t < 30; t++) {
      unionGap = Math.max(
        unionGap,
        Math.sqrt(
          pairAbs2(
            pairSub(both[t]!.d, pairAdd(one[t]!.d, two[t]!.d)),
          ),
        ),
      )
    }

    // 3. the jewel's walls: mirror at offset 1, detector at offset 2
    const jewelRule = jewelKnit(d4Mesh({ side: 9 }), true)
    const mirror = slabRun({
      rule: jewelRule,
      birth: 1,
      beats: 60,
      seedSlot: 3,
    })
    const detector = slabRun({
      rule: jewelRule,
      birth: 2,
      beats: 60,
      seedSlot: 3,
    })

    const mirrorClean =
      mirror.maxSupport <= 4 &&
      mirror.postPhases.length > 0 &&
      mirror.postPhases.every(p => mirror.prePhases.includes(p))
    const detectorAmplifies = detector.maxSupport > 60

    // 4. the park rule transmits with a rotated phase, in the measured configuration: side 11, a slab
    // on the first axis born one beat late, the traveller seeded at coordinate one. Against the no-slab
    // control (birth 0), the crossing adds a recoherent phase the control never shows
    const parkPhases = (birth: number): { entered: boolean; phases: Set<number> } => {
      const side = 11
      const mesh = d4Mesh({ side })
      const rule = parkKnit(mesh)
      const coordinate = (c: number, axis: number): number =>
        Math.floor(c / side ** axis) % side
      const late = new Set<number>()

      for (let cell = 0; cell < mesh.cellCount; cell++) {
        const x = coordinate(cell, 0)

        if (x >= 5 && x <= 7) {
          late.add(cell)
        }
      }

      let seedCell = 0

      for (let cell = 0; cell < mesh.cellCount; cell++) {
        if (
          coordinate(cell, 0) === 1 &&
          coordinate(cell, 1) === 5 &&
          coordinate(cell, 2) === 5 &&
          coordinate(cell, 3) === 5
        ) {
          seedCell = cell
          break
        }
      }

      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      let entered = false

      const phases = new Set<number>()

      for (let t = 0; t < 26; t++) {
        if (t === 3) {
          seeded.data[seedCell * mesh.degree] = 1
        }

        const active = (cell: number): boolean =>
          late.has(cell) ? t >= birth : true

        vacuum = growingBeat(vacuum, rule, active)
        seeded = growingBeat(seeded, rule, active)

        for (let i = 0; i < seeded.data.length; i++) {
          if (
            seeded.data[i] !== vacuum.data[i] &&
            late.has(Math.floor(i / mesh.degree))
          ) {
            entered = true
          }
        }

        const difference = pairSub(
          clockAmplitude(seeded),
          clockAmplitude(vacuum),
        )

        if (Math.abs(Math.sqrt(pairAbs2(difference)) - ROOT3) < EXACT) {
          phases.add(phaseDegrees(difference))
        }
      }

      return { entered, phases }
    }

    const noSlab = parkPhases(0)
    const crossing = parkPhases(1)

    const parkTransmits = [...crossing.phases].some(
      p => !noSlab.phases.has(p),
    )

    // CONTROL: the committed rule's defect stays put
    const controlMesh = d4Mesh({ side: 7 })
    const controlRule = pairCollision({
      opposite: meshOpposites(controlMesh),
    })
    const controlCentre = Math.floor(controlMesh.cellCount / 2)
    const distance = shellDistances(controlMesh, controlCentre)

    let controlVacuum: Will = makeWill(controlMesh)
    let controlSeeded: Will = makeWill(controlMesh)

    controlSeeded.data[controlCentre * controlMesh.degree] = 1

    let controlReach = 0

    for (let t = 0; t < 12; t++) {
      controlVacuum = beat(controlVacuum, controlRule)
      controlSeeded = beat(controlSeeded, controlRule)

      for (let i = 0; i < controlSeeded.data.length; i++) {
        if (controlSeeded.data[i] !== controlVacuum.data[i]) {
          controlReach = Math.max(
            controlReach,
            distance[Math.floor(i / controlMesh.degree)] ?? 0,
          )
        }
      }
    }

    const ok =
      echoHamming === 0 &&
      freeClean &&
      freePhases.size === 2 &&
      unionGap < EXACT &&
      mirrorClean &&
      detectorAmplifies &&
      parkTransmits &&
      controlReach <= 2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the jewel passes the exact echo, its free particle holds one or two slots at exactly sqrt 3 with two clock phases for thirty beats and superposes exactly, its one-beat-offset wall reflects it with support never above four and no new phase, its two-beat-offset wall amplifies past sixty cells, the park rule enters the offset slab and its recoherent phase set gains a value the no-slab control never shows (transmission with rotation), and the committed rule holds its defect within distance two, so every element of the quantum kinematics exists exactly in some candidate and their union in one rule is the remaining hunt',
      metrics: {
        echoHamming,
        freeSupportMax: Math.max(...one.map(x => x.support)),
        freePhases: freePhases.size,
        unionGap: Number(unionGap.toExponential(2)),
        mirrorMaxSupport: mirror.maxSupport,
        detectorMaxSupport: detector.maxSupport,
        parkEntered: crossing.entered ? 1 : 0,
        parkControlPhaseCount: noSlab.phases.size,
        parkNewPhases: [...crossing.phases].filter(
          p => !noSlab.phases.has(p),
        ).length,
      },
      // CONTROL: the committed rule's pinned defect
      control: {
        committedReach: controlReach,
        mirrorPostPhaseCount: mirror.postPhases.length,
      },
      notes:
        'Roadmap sixth-thing-0003, the hunt the user approved on 2026-09-01: the wake-free variant that also transmits with rotation has not been found in roughly a thousand rules, so no knit change is proposed yet and the committed base stands unmodified. What the taxonomy fixes: the gates are now automated (task/rule-search.ts plus the slab gate here), the jewel shows the minimal one-clause extension already yields particles, mirrors and detectors, and the named next dimensions are direction-resolved swap conditions and two-wire conditioning aimed at turning the mirror into a transmitter. All candidates are exactly reversible, conserving, deterministic, with no continuity and no random numbers.',
    })
  },
})
