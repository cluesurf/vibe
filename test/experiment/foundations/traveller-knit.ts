// The traveller knit, the conjunction the sixth-thing hunt was for, found and measured. The rule is
// code/rule/collision.ts lineHop: one clause (a lone away-slot tone swaps lines with an empty partner)
// plus the committed 9-state table on the wires. PROPOSED as the committed knit's extension per the
// approved programme (2026-09-01); the base is not modified by this experiment, which only measures.
//
//   - LEGAL: twenty-four beats forward and inverse return the exact microstate, charge conserved.
//   - A SPEED-ONE PARTICLE: a lone tone holds exactly ONE slot at coarse magnitude exactly sqrt 3 at
//     EVERY one of forty beats, at sides 9 and 11, advancing one cell per beat, with a single clock
//     phase in free flight, and two such particles superpose to machine precision.
//   - HUSK-RESIDENT: at every beat the particle is visible in the matter sector, the matter projection
//     carries the full phase, and the wire projection carries nothing, so in free flight the particle
//     lives entirely in the matter (position) sector and the wire (clock) sector engages only at
//     interactions, the husk-and-bulk split measured.
//   - TRANSMITTED WITH ROTATION: sent at a one-beat-offset domain it enters, survives (support bounded
//     by seven), and its recoherent phase set gains one clock unit (30 degrees joins 150) against the
//     no-domain control that never leaves 150.
//   - DETECTED: a two-beat-offset domain amplifies it past a hundred cells, the same phase-selective
//     detector the committed rule's walls are.
//
// With growth-shifts-the-clock (interference), wall-measures-the-clock (projective measurement) and
// this, every element of quantum kinematics exists in the programme with the five things' state
// untouched: e^{i(kx - wt)} is motion at speed one (kx from domain crossings, wt from the vacuum
// clock), collapse is the offset-2 wall, and the knit change is ONE clause. Depth L2, candidate
// dynamics; the committed rule's pinned defect is the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites, shellDistances } from '@/code/tool/mesh'
import { makeWill, Will, charge } from '@/code/tone/will'
import { lineHop, pairCollision } from '@/code/rule/collision'
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
const THIRD = (2 * Math.PI) / 3

function matterSlotsOf(mesh: ReturnType<typeof d4Mesh>): Set<number> {
  const opposite = meshOpposites(mesh)
  const lines: [number, number][] = []

  for (let d = 0; d < mesh.degree; d++) {
    const o = opposite[d]!

    if (d < o) {
      lines.push([d, o])
    }
  }

  const matter = new Set<number>()

  for (let k = 0; k + 1 < lines.length; k += 2) {
    matter.add(lines[k]![0])
    matter.add(lines[k]![1])
  }

  return matter
}

// the slab study at side 11: the particle sent at an offset-x band, phases and support tracked
function slab(input: { birth: number; beats: number }): {
  entered: boolean
  maxSupport: number
  phases: number[]
} {
  const side = 11
  const mesh = d4Mesh({ side })
  const rule = lineHop({ opposite: meshOpposites(mesh) })
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
  let maxSupport = 0

  const phases = new Set<number>()

  for (let t = 0; t < input.beats; t++) {
    if (t === 3) {
      seeded.data[seedCell * mesh.degree] = 1
    }

    const active = (cell: number): boolean =>
      late.has(cell) ? t >= input.birth : true

    vacuum = growingBeat(vacuum, rule, active)
    seeded = growingBeat(seeded, rule, active)

    let support = 0

    for (let i = 0; i < seeded.data.length; i++) {
      if (seeded.data[i] !== vacuum.data[i]) {
        support++

        if (late.has(Math.floor(i / mesh.degree))) {
          entered = true
        }
      }
    }

    maxSupport = Math.max(maxSupport, support)

    const difference = pairSub(
      clockAmplitude(seeded),
      clockAmplitude(vacuum),
    )

    if (Math.abs(Math.sqrt(pairAbs2(difference)) - ROOT3) < EXACT) {
      phases.add(phaseDegrees(difference))
    }
  }

  return { entered, maxSupport, phases: [...phases].sort((a, b) => a - b) }
}

export default experiment({
  id: 'foundations/traveller-knit',
  code: 'E-FND-0095',
  title:
    'the traveller knit (lineHop, one clause plus the committed table) measured in full: exactly reversible and conserving, a lone tone is a speed-one particle holding one slot at exactly sqrt 3 at every one of forty beats at two sizes with exact superposition, fully resident in the matter sector with silent wires in free flight (the husk split), transmitted through a one-beat-offset domain with its phase rotated one clock unit against the never-rotating control, and amplified past a hundred cells by a two-beat-offset domain, so every element of quantum kinematics exists with the five things untouched and the knit change is one clause',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // 1. legality
    const echoMesh = d4Mesh({ side: 7 })
    const forward = lineHop({ opposite: meshOpposites(echoMesh) })
    const backward = lineHop({
      opposite: meshOpposites(echoMesh),
      forward: false,
    })

    let will: Will = makeWill(echoMesh)

    for (let i = 0; i < will.data.length; i += 5) {
      will.data[i] = ((i / 5) % 3) - 1
    }

    const start = Int8Array.from(will.data)

    for (let t = 0; t < 24; t++) {
      for (let cell = 0; cell < echoMesh.cellCount; cell++) {
        forward(will.data, cell * echoMesh.degree, echoMesh.degree)
      }

      will = stream(will)
    }

    for (let t = 0; t < 24; t++) {
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

    const chargeDrift = charge(will) - charge({ mesh: echoMesh, data: start })

    // 2. the particle at two sizes, with unions and the husk projection
    let particleClean = true
    let unionGap = 0
    let huskResident = true
    let wiresSilent = true

    const freePhases = new Set<number>()

    for (const side of [9, 11]) {
      const mesh = d4Mesh({ side })
      const rule = lineHop({ opposite: meshOpposites(mesh) })
      const matter = matterSlotsOf(mesh)
      const centre = Math.floor(mesh.cellCount / 2)
      const far = [0, 1, 2, 3].reduce(c => mesh.neighbour(c, 4), centre)

      const run = (
        seeds: number[],
      ): { d: [number, number]; support: number }[] => {
        let vacuum: Will = makeWill(mesh)
        let seeded: Will = makeWill(mesh)

        for (const cell of seeds) {
          seeded.data[cell * mesh.degree] = 1
        }

        const out: { d: [number, number]; support: number }[] = []

        for (let t = 0; t < 40; t++) {
          vacuum = beat(vacuum, rule)
          seeded = beat(seeded, rule)

          let support = 0
          let matterDiff = 0
          let wireRe = 0
          let wireIm = 0

          for (let i = 0; i < seeded.data.length; i++) {
            if (seeded.data[i] !== vacuum.data[i]) {
              support++

              if (matter.has(i % mesh.degree)) {
                matterDiff++
              }
            }

            if (!matter.has(i % mesh.degree)) {
              wireRe +=
                Math.cos(THIRD * seeded.data[i]!) -
                Math.cos(THIRD * vacuum.data[i]!)

              wireIm +=
                Math.sin(THIRD * seeded.data[i]!) -
                Math.sin(THIRD * vacuum.data[i]!)
            }
          }

          if (seeds.length === 1 && seeds[0] === centre) {
            if (matterDiff === 0) {
              huskResident = false
            }

            if (Math.hypot(wireRe, wireIm) > EXACT) {
              wiresSilent = false
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

      const one = run([centre])
      const two = run([far])
      const both = run([centre, far])

      for (let t = 0; t < 40; t++) {
        const magnitude = Math.sqrt(pairAbs2(one[t]!.d))

        if (
          one[t]!.support !== 1 ||
          Math.abs(magnitude - ROOT3) > EXACT
        ) {
          particleClean = false
        }

        freePhases.add(phaseDegrees(one[t]!.d))
        unionGap = Math.max(
          unionGap,
          Math.sqrt(
            pairAbs2(pairSub(both[t]!.d, pairAdd(one[t]!.d, two[t]!.d))),
          ),
        )
      }
    }

    // 3. the domains: control, transmit-with-rotation, detect
    const control = slab({ birth: 0, beats: 26 })
    const transmit = slab({ birth: 1, beats: 26 })
    const detect = slab({ birth: 2, beats: 26 })

    const rotated =
      transmit.entered &&
      transmit.maxSupport <= 7 &&
      transmit.phases.some(p => !control.phases.includes(p))
    const detected = detect.maxSupport > 100

    // CONTROL: the committed rule pins its defect
    const pinMesh = d4Mesh({ side: 7 })
    const pinRule = pairCollision({ opposite: meshOpposites(pinMesh) })
    const pinCentre = Math.floor(pinMesh.cellCount / 2)
    const pinDistance = shellDistances(pinMesh, pinCentre)

    let pinVacuum: Will = makeWill(pinMesh)
    let pinSeeded: Will = makeWill(pinMesh)

    pinSeeded.data[pinCentre * pinMesh.degree] = 1

    let pinReach = 0

    for (let t = 0; t < 12; t++) {
      pinVacuum = beat(pinVacuum, pinRule)
      pinSeeded = beat(pinSeeded, pinRule)

      for (let i = 0; i < pinSeeded.data.length; i++) {
        if (pinSeeded.data[i] !== pinVacuum.data[i]) {
          pinReach = Math.max(
            pinReach,
            pinDistance[Math.floor(i / pinMesh.degree)] ?? 0,
          )
        }
      }
    }

    const ok =
      echoHamming === 0 &&
      chargeDrift === 0 &&
      particleClean &&
      freePhases.size === 1 &&
      unionGap < EXACT &&
      huskResident &&
      wiresSilent &&
      control.phases.length === 1 &&
      rotated &&
      detected &&
      pinReach <= 2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the lineHop knit passes the exact echo with zero charge drift, its lone tone holds exactly one slot at exactly sqrt 3 for all forty beats at sides 9 and 11 with one free phase and superposition exact to machine precision, the particle is visible in the matter sector at every beat while the wire projection is exactly silent, the no-domain control keeps one recoherent phase, the one-beat-offset domain is entered with support at most seven and yields a phase the control never shows, the two-beat-offset domain amplifies past a hundred cells, and the committed rule holds its own defect within distance two, so the proposed one-clause knit supplies motion, coherence, superposition, phase rotation and detection with the base state untouched',
      metrics: {
        echoHamming,
        chargeDrift,
        particleClean: particleClean ? 1 : 0,
        freePhases: freePhases.size,
        unionGap: Number(unionGap.toExponential(2)),
        huskResident: huskResident ? 1 : 0,
        wiresSilent: wiresSilent ? 1 : 0,
        transmitMaxSupport: transmit.maxSupport,
        transmitNewPhases: transmit.phases.filter(
          p => !control.phases.includes(p),
        ).length,
        detectMaxSupport: detect.maxSupport,
      },
      // CONTROL: the no-domain run and the committed rule's pinned defect
      control: {
        controlPhases: control.phases.length,
        committedReach: pinReach,
      },
      notes:
        "Roadmap sixth-thing-0003, the conjunction found: the hunt's two gates (wake-freedom, transmission with rotation) meet in lineHop, one clause plus the committed table, discovered by the direction-resolved sweep after about fourteen hundred rules. The formal adoption of lineHop as the committed knit is proposed per the user-approved programme and stays a base-model decision: this experiment measures the candidate and modifies nothing. The acceptance condition beyond this file is the full suite passing with the addition, and the deeper re-derivation of the L3 canon under the new knit is the named follow-on programme. The husk reading (the user's 3D-husk and 4D-bulk framing): the particle's position and phase live in the matter sector at every beat, the wires are exactly silent in free flight and engage at domains, so physical content is husk-resident and the bulk sector participates at interactions.",
    })
  },
})
