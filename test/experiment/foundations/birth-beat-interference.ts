// The vacuum clock has three beats, and a defect's Z_3 phase depends on which beat it is made in. This
// is the follow-up the vacuum-clock result (foundations/vacuum-clock-amplitude) asked for. That result
// found that every defect the dynamics creates is born in the empty beat of the flashing vacuum, so all
// carry the same clock phase and their coarse amplitudes never interfere. Here defects are MADE by hand in
// each beat of the cycle, by editing one slot of the vacuum as it stands at that beat: in the empty beat
// a tone is placed, in the (+1,-1) beat a slot is set to zero (a hole) or flipped, in the (-1,+1) beat
// likewise. The coarse amplitude A = sum of omega^tone over the mesh, relative to the vacuum, is then
// traced for each defect and for pairs.
//
// Measured: a hole made in beat 1 carries the phase sequence -30, -150, -30 degrees, the beat-0 tone's
// 30, 30, 150 with every sign flipped and the cycle offset by one beat, and against that tone its relative phase is 60 or 300 degrees, so the
// intensity cross term is exactly |A||B| rather than the maximal 2|A||B|. A flipped slot in beat 1 has
// magnitude 2 sqrt 3 and relative phase 120 degrees at some beats, where the cross term is negative,
// destructive interference. A hole made in beat 2, and a tone made in the next empty beat, are in phase
// with the beat-0 tone (cross term maximal). In every case the two amplitudes add to machine precision
// and the cross term equals 2|A||B| cos(relative phase) exactly. So the coarse amplitude of the charge
// rule supports relative phases and interference between defects of different birth beat. What it does
// not yet show is the rule creating such a defect on its own, which is the open construction.
//
// Control: under the momentum rule the vacuum is empty at every beat and has no clock, so a defect's
// phase is fixed by its tone value alone and never moves, and the relative phase of any pair is one
// constant for all time. Under the charge rule the tone-hole relative phase alternates 60, 300, 60, 60,
// 300, the clock showing in the pair.
//
// Depth L2: a chosen coarse map on the committed rule, exact numbers, a control that fails, and the
// defects placed by hand rather than produced by the dynamics.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { Collision, headOnRotate, pairCollision } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import { ComplexPair, pairAbs2, pairSub } from '@/code/algebra/linear/complex-pair'

const SIDE = 5 // odd, one connected lattice
const BEATS = 12
const DIRECTION = 0
const PARALLEL_DIRECTION = 2
const THIRD = (2 * Math.PI) / 3
const EXACT = 1e-9

type Edit = { beat: number; cell: number; value: number }

// the coarse Z_3 amplitude of a will, the sum of omega^tone over every slot
function clockAmplitude(will: Will): ComplexPair {
  let re = 0
  let im = 0

  for (const tone of will.data) {
    re += Math.cos(THIRD * tone)
    im += Math.sin(THIRD * tone)
  }

  return [re, im]
}

function phaseDegrees(a: ComplexPair): number {
  return Math.round((Math.atan2(a[1], a[0]) * 180) / Math.PI)
}

function relativeDegrees(a: ComplexPair, b: ComplexPair): number {
  return (((phaseDegrees(a) - phaseDegrees(b)) % 360) + 360) % 360
}

// trace the defect amplitude (relative to the vacuum) of a will edited in the stated beats
function trace(input: {
  mesh: ReturnType<typeof d4Mesh>
  collision: Collision
  edits: Edit[]
}): ComplexPair[] {
  const { mesh, collision, edits } = input

  let vacuum = makeWill(mesh)
  let seeded = makeWill(mesh)

  const out: ComplexPair[] = []

  for (let t = 0; t < BEATS; t++) {
    for (const edit of edits) {
      if (edit.beat === t) {
        seeded.data[edit.cell * mesh.degree + DIRECTION] = edit.value
      }
    }

    vacuum = beat(vacuum, collision)
    seeded = beat(seeded, collision)
    out.push(pairSub(clockAmplitude(seeded), clockAmplitude(vacuum)))
  }

  return out
}

// additivity, cross term and relative phase of a pair against its two singles, from the beat both exist
function pair(input: {
  mesh: ReturnType<typeof d4Mesh>
  collision: Collision
  first: Edit
  second: Edit
}): {
  worstAdditivity: number
  worstCrossTermLaw: number
  relativePhases: number[]
  crossTerms: number[]
} {
  const { mesh, collision, first, second } = input
  const a = trace({ mesh, collision, edits: [first] })
  const b = trace({ mesh, collision, edits: [second] })
  const ab = trace({ mesh, collision, edits: [first, second] })
  const from = Math.max(first.beat, second.beat)

  let worstAdditivity = 0
  let worstCrossTermLaw = 0

  const relativePhases: number[] = []
  const crossTerms: number[] = []

  for (let t = from; t < BEATS; t++) {
    const sum: ComplexPair = [a[t]![0] + b[t]![0], a[t]![1] + b[t]![1]]

    worstAdditivity = Math.max(
      worstAdditivity,
      Math.sqrt(pairAbs2(pairSub(ab[t]!, sum))),
    )

    const cross = pairAbs2(ab[t]!) - pairAbs2(a[t]!) - pairAbs2(b[t]!)
    const relative = relativeDegrees(a[t]!, b[t]!)
    const law =
      2 *
      Math.sqrt(pairAbs2(a[t]!) * pairAbs2(b[t]!)) *
      Math.cos((relative * Math.PI) / 180)

    worstCrossTermLaw = Math.max(worstCrossTermLaw, Math.abs(cross - law))
    relativePhases.push(relative)
    crossTerms.push(Number(cross.toFixed(6)))
  }

  return { worstAdditivity, worstCrossTermLaw, relativePhases, crossTerms }
}

export default experiment({
  id: 'foundations/birth-beat-interference',
  code: 'E-FND-0085',
  title:
    'the Z_3 amplitude of the charge rule interferes between defects made in different beats of the vacuum clock: a hole made in the (+1,-1) beat carries the negated, one-beat-offset phase cycle of a tone made in the empty beat (relative phase 60 or 300 degrees, cross term half of maximal), a flipped slot reaches relative phase 120 degrees with a negative cross term, amplitudes add exactly and the cross term is 2|A||B| cos of the relative phase at every beat, while under the momentum rule, which has no clock, every relative phase is one constant for all time',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const centre = Math.floor(mesh.cellCount / 2)
    const far = mesh.neighbour(
      mesh.neighbour(centre, PARALLEL_DIRECTION),
      PARALLEL_DIRECTION,
    )

    const chargeRule = pairCollision({ opposite })
    const momentumRule = headOnRotate({ opposite })

    const tone: Edit = { beat: 0, cell: centre, value: 1 }
    const holeBeat1: Edit = { beat: 1, cell: far, value: 0 }
    const flipBeat1: Edit = { beat: 1, cell: far, value: -1 }
    const holeBeat2: Edit = { beat: 2, cell: far, value: 0 }
    const toneBeat3: Edit = { beat: 3, cell: far, value: 1 }

    // the single defects' phase sequences
    const toneTrace = trace({ mesh, collision: chargeRule, edits: [tone] })
    const holeTrace = trace({ mesh, collision: chargeRule, edits: [holeBeat1] })
    const tonePhases = toneTrace.slice(0, 3).map(phaseDegrees)
    const holePhases = holeTrace.slice(1, 4).map(phaseDegrees)
    // the hole runs the tone's cycle negated and one beat offset: the same three phases with their signs
    // flipped, as a multiset
    const sorted = (xs: number[]): string => [...xs].sort((a, b) => a - b).join(',')
    const mirrored =
      sorted(holePhases) === sorted(tonePhases.map(p => -p)) &&
      !holePhases.every((p, i) => p === -tonePhases[i]!)

    const hole = pair({ mesh, collision: chargeRule, first: tone, second: holeBeat1 })
    const flip = pair({ mesh, collision: chargeRule, first: tone, second: flipBeat1 })
    const late = pair({ mesh, collision: chargeRule, first: tone, second: holeBeat2 })
    const next = pair({ mesh, collision: chargeRule, first: tone, second: toneBeat3 })

    const holeMagnitude = Math.sqrt(pairAbs2(holeTrace[1]!))
    const toneMagnitude = Math.sqrt(pairAbs2(toneTrace[0]!))

    const holeHalfCross =
      hole.relativePhases.every(r => r === 60 || r === 300) &&
      hole.crossTerms.every(c => Math.abs(c - toneMagnitude * holeMagnitude) < EXACT)
    const flipDestructive =
      flip.relativePhases.includes(120) && flip.crossTerms.some(c => c < -EXACT)
    const lateInPhase =
      late.relativePhases.every(r => r === 0) && next.relativePhases.every(r => r === 0)
    const additive = [hole, flip, late, next].every(p => p.worstAdditivity < EXACT)
    const lawHolds = [hole, flip, late, next].every(p => p.worstCrossTermLaw < EXACT)

    // the clock shows in the pair: the tone-hole relative phase takes two values over the beats
    const relativePhaseVaries = new Set(hole.relativePhases).size === 2

    // CONTROL: the momentum rule has no clock, so every relative phase is one constant for all time
    const controlHole = pair({ mesh, collision: momentumRule, first: tone, second: holeBeat1 })
    const controlFlip = pair({ mesh, collision: momentumRule, first: tone, second: flipBeat1 })
    const controlConstant =
      new Set(controlHole.relativePhases).size === 1 &&
      new Set(controlFlip.relativePhases).size === 1

    const ok =
      mirrored &&
      holeHalfCross &&
      flipDestructive &&
      lateInPhase &&
      additive &&
      lawHolds &&
      relativePhaseVaries &&
      controlConstant

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'under the charge rule on the odd-sided d4Mesh a hole made in the (+1,-1) beat of the vacuum clock carries the phase cycle of a tone made in the empty beat with every sign flipped and offset by one beat (-30, -150, -30 against 30, 30, 150 degrees), so the two have relative phase 60 or 300 degrees at every beat and their intensity cross term is |A||B|, half of maximal, a slot flipped in that beat reaches relative phase 120 degrees with a negative cross term, a hole made in the (-1,+1) beat and a tone made in the next empty beat stay in phase (cross term maximal), the pair amplitudes add to machine precision and the cross term equals 2|A||B| cos of the relative phase in every case, the tone-hole relative phase alternating between its two values as the clock turns, while under the momentum rule, whose vacuum has no clock, every relative phase is one constant for all time',
      metrics: {
        mirrored: mirrored ? 1 : 0,
        holeHalfCross: holeHalfCross ? 1 : 0,
        flipDestructive: flipDestructive ? 1 : 0,
        lateInPhase: lateInPhase ? 1 : 0,
        additive: additive ? 1 : 0,
        lawHolds: lawHolds ? 1 : 0,
        relativePhaseVaries: relativePhaseVaries ? 1 : 0,
        controlConstant: controlConstant ? 1 : 0,
        tonePhases: Number(tonePhases.join('')),
        holePhaseBeat2: holePhases[0]!,
        holePhaseBeat3: holePhases[1]!,
        holePhaseBeat4: holePhases[2]!,
        holeRelativeFirst: hole.relativePhases[0]!,
        holeCrossTerm: hole.crossTerms[0]!,
        flipRelativeAtBeat2: flip.relativePhases[0]!,
        flipMinCrossTerm: Math.min(...flip.crossTerms),
        flipMaxCrossTerm: Math.max(...flip.crossTerms),
        worstAdditivity: Number(
          Math.max(...[hole, flip, late, next].map(p => p.worstAdditivity)).toExponential(2),
        ),
        worstCrossTermLaw: Number(
          Math.max(...[hole, flip, late, next].map(p => p.worstCrossTermLaw)).toExponential(2),
        ),
      },
      control: {
        chargeHoleDistinctRelativePhases: new Set(hole.relativePhases).size,
        momentumHoleDistinctRelativePhases: new Set(controlHole.relativePhases).size,
        momentumFlipDistinctRelativePhases: new Set(controlFlip.relativePhases).size,
        momentumFlipRelativePhase: controlFlip.relativePhases[0]!,
        lateHoleRelativeMax: Math.max(...late.relativePhases),
      },
      notes:
        'The clock has three beats and the phase a defect carries depends on the beat it is made in. The defects here are made by editing the vacuum by hand, which is what the dynamics has never done on its own (every dynamical birth lands in the empty beat, E-FND-0084). The open construction is therefore sharper than before: an interaction of the rule that makes a hole or a flip in a non-empty beat, or shifts a defect by one beat of the clock. |A|^2 still has no probability meaning, which is why this stays L2.',
    })
  },
})
