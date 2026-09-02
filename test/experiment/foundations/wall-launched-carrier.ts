// A carrier the bulk cannot host, launched by the wall. Under the committed charge knit a bulk
// defect is PINNED: it never leaves its own line neighbourhood (E-FND-0080), which is why the
// dynamical gauge field is blocked on a carrier. Here the same defect is placed ON the one-beat
// clock wall (the dark-wall structure of E-CSM-0057), and the pinning breaks:
//
//   - THE WALL LAUNCHES A MOVING EXCITATION. The poked difference propagates away from the wall
//     into the elder domain, one column every three beats (one hop per full clock cycle, measured
//     from the front trajectory), unidirectionally: the young-side extent stays within two columns
//     of the wall while the front crosses eleven columns. The same happens at a second position
//     along the wall (translation invariance).
//   - IT IS COHERENT AND CARRIES A NEW PHASE. Before the front wraps the torus, the total
//     difference amplitude returns to EXACTLY root three on at least five sampled beats, at phase
//     90 degrees, a phase neither the free traveller (150) nor its domain-rotated value (30) shows,
//     alternating with magnitude two root three: a breathing, phase-definite excitation.
//   - IT STAYS THIN. The support never exceeds thirteen slots while crossing half the box, a
//     one-dimensional train at one row of cells.
//   - THE BULK CONTROL IS PINNED. The same poke in the domain interior never exceeds support two
//     (the committed rule's known line-neighbourhood reach, E-FND-0080) and goes nowhere:
//     everything above is the wall's doing.
//
// So the model already hosts a slow, coherent, phase-carrying, unidirectional carrier at clock
// walls, with no base change and no knit change: transport that the higher-level route was looking
// for after the offset-link-phase closure (E-FND-0096). Speed one third is one hop per vacuum
// period, so the clock itself paces the transport. What it is not yet: fast (the traveller is speed
// one), bidirectional, or coupled to charge sources, the named follow-ups for the gauge row. Depth
// L2, deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { squareMesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { pairCollision } from '@/code/rule/collision'
import { growingBeat } from '@/code/rule/lattice-gas'
import { clockAmplitude, phaseDegrees } from '@/code/measure/clock-amplitude'
import { pairAbs2, pairSub } from '@/code/algebra/linear/complex-pair'

const SIDE = 24
const ROOT3 = Math.sqrt(3)
const POKE_BEAT = 9
const BEATS = 37

function pokeStudy(pokeCell: number): {
  frontReach: number
  youngSideMax: number
  maxSupport: number
  recoherence90: number
  speedBeatsPerColumn: number
} {
  const mesh = squareMesh({ side: SIDE })
  const rule = pairCollision({ opposite: meshOpposites(mesh) })
  const birth = (c: number): number => (c % SIDE < SIDE / 2 ? 0 : 1)

  let base: Will = makeWill(mesh)
  let poked: Will = makeWill(mesh)
  let frontReach = Infinity
  let youngSideMax = 0
  let maxSupport = 0
  let recoherence90 = 0
  let firstAtNine = -1
  let firstAtThree = -1

  for (let t = 0; t < BEATS; t++) {
    if (t === POKE_BEAT) {
      poked.data[pokeCell * mesh.degree] = 1
    }

    const active = (c: number): boolean => t >= birth(c)

    base = growingBeat(base, rule, active)
    poked = growingBeat(poked, rule, active)

    if (t < POKE_BEAT) {
      continue
    }

    let support = 0
    let lo = SIDE
    let hi = 0

    for (let i = 0; i < poked.data.length; i++) {
      if (poked.data[i] !== base.data[i]) {
        support++

        const x = Math.floor(i / mesh.degree) % SIDE

        lo = Math.min(lo, x)
        hi = Math.max(hi, x)
      }
    }

    maxSupport = Math.max(maxSupport, support)
    frontReach = Math.min(frontReach, lo)
    youngSideMax = Math.max(youngSideMax, hi)

    if (firstAtNine === -1 && lo <= 9) {
      firstAtNine = t
    }

    if (firstAtThree === -1 && lo <= 3) {
      firstAtThree = t
    }

    const difference = pairSub(
      clockAmplitude(poked),
      clockAmplitude(base),
    )

    if (
      Math.abs(Math.sqrt(pairAbs2(difference)) - ROOT3) < 1e-9 &&
      Math.abs(phaseDegrees(difference) - 90) < 1e-6
    ) {
      recoherence90++
    }
  }

  const speedBeatsPerColumn =
    firstAtThree === -1 || firstAtNine === -1
      ? Infinity
      : (firstAtThree - firstAtNine) / 6

  return {
    frontReach,
    youngSideMax,
    maxSupport,
    recoherence90,
    speedBeatsPerColumn,
  }
}

function bulkControl(): { maxSupport: number } {
  const mesh = squareMesh({ side: SIDE })
  const rule = pairCollision({ opposite: meshOpposites(mesh) })
  const birth = (c: number): number => (c % SIDE < SIDE / 2 ? 0 : 1)

  let base: Will = makeWill(mesh)
  let poked: Will = makeWill(mesh)
  let maxSupport = 0

  const pokeCell = 5 + 12 * SIDE

  for (let t = 0; t < BEATS; t++) {
    if (t === POKE_BEAT) {
      poked.data[pokeCell * mesh.degree] = 1
    }

    const active = (c: number): boolean => t >= birth(c)

    base = growingBeat(base, rule, active)
    poked = growingBeat(poked, rule, active)

    if (t < POKE_BEAT) {
      continue
    }

    let support = 0

    for (let i = 0; i < poked.data.length; i++) {
      if (poked.data[i] !== base.data[i]) {
        support++
      }
    }

    maxSupport = Math.max(maxSupport, support)
  }

  return { maxSupport }
}

export default experiment({
  id: 'foundations/wall-launched-carrier',
  code: 'E-FND-0100',
  title:
    'the wall launches a carrier the bulk cannot host: a defect poked onto the one-beat clock wall propagates unidirectionally into the elder domain at one column per three beats (one hop per vacuum period, the clock paces the transport), stays thin (support at most thirteen while crossing eleven columns), recoheres to exactly root three at the new phase 90 degrees at least five times before wrapping, repeats at a second position along the wall, and the identical poke in the bulk stays pinned within its line neighbourhood (support never above two), so slow coherent phase-carrying transport exists at clock walls with no base or knit change',
  category: 'foundations',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const atMiddle = pokeStudy(12 + 12 * SIDE)
    const atOther = pokeStudy(12 + 6 * SIDE)
    const bulk = bulkControl()

    const launches =
      atMiddle.frontReach <= 1 && atOther.frontReach <= 1
    const unidirectional =
      atMiddle.youngSideMax <= 14 && atOther.youngSideMax <= 14
    const clockPaced =
      atMiddle.speedBeatsPerColumn >= 2 &&
      atMiddle.speedBeatsPerColumn <= 4
    const coherent =
      atMiddle.recoherence90 >= 5 && atOther.recoherence90 >= 5
    const thin = atMiddle.maxSupport <= 13
    const bulkPinned = bulk.maxSupport <= 2

    const ok =
      launches &&
      unidirectional &&
      clockPaced &&
      coherent &&
      thin &&
      bulkPinned

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the wall-poked front reaches within one column of the far side at both positions, the young side stays within two columns of the wall, the measured pace is one column per three beats within tolerance, recoherence at phase 90 occurs at least five times at both positions, support stays at or under thirteen, and the bulk poke never exceeds support two',
      metrics: {
        frontReach: atMiddle.frontReach,
        youngSideMax: atMiddle.youngSideMax,
        beatsPerColumn: Number(
          atMiddle.speedBeatsPerColumn.toFixed(2),
        ),
        recoherence90Count: atMiddle.recoherence90,
        maxSupport: atMiddle.maxSupport,
      },
      // CONTROL: the identical poke in the bulk, pinned in its line neighbourhood for the whole run
      control: {
        bulkMaxSupport: bulk.maxSupport,
      },
      notes:
        'the phase 90 is new against the traveller sector (free phase 150, domain-rotated 30), so the wall mode is a distinct excitation, not the traveller in disguise. Speed one third being one hop per clock period says the vacuum cycle is the transport mechanism, which is why the bulk (where every neighbour flashes in step) pins the same defect. The follow-ups for the gauge row: whether two wall modes interfere, whether the mode couples to a charge source, and whether the d4 walls carry the same class.',
    })
  },
})
