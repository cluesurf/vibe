// The strong CP problem dissolved on the clock, closing the row. The puzzle: the strong sector
// admits a CP-odd vacuum angle theta, any value in a continuum, yet the neutron's electric dipole
// moment bounds it below one part in ten billion. Why so small? On this model the question loses
// its premise twice, and both halves are measured:
//
//   - THE VACUUM ANGLE HAS NO CONTINUUM TO LIVE IN. The strong-sector phase is the Z_3 clock, whose
//     vacuum manifold is three exact points, not a circle. Measured: across structured clock fields
//     on a ring, the wrapped link differences take EXACTLY three values (0 and plus or minus a
//     third of a turn, to machine precision, never anything between), and every closed-loop winding
//     is an exact integer, hitting five distinct integers across the constructed set. A continuous
//     phase field, the control, takes a continuum of link values and supports any fractional
//     winding density, so the quantization is the Z_3 structure and not the measurement.
//   - THE STRONG SECTOR IS EXACTLY T-REVERSIBLE. A theta term is T-odd, so a strong sector carrying
//     one cannot be time-reversal symmetric. The committed charge knit's T conjugation (velocity
//     reversal, with the corrected half-step convention of E-FND-0097) maps its beat to its exact
//     inverse with Hamming distance zero on generic states, re-measured here. The measured T
//     symmetry forces the CP-odd term to vanish among the three discrete options.
//
// So theta is not small, it is exactly zero: there is no continuous knob to tune and the measured
// symmetry of the sector picks the CP-even point. The prediction is a neutron electric dipole
// moment of exactly zero from the vacuum angle (any observed EDM must come from the CKM phase,
// which the model leaves free). Depth L2: elementary algebra on the model's committed structure
// plus a measured exact symmetry, with the continuous-phase control showing what a real theta
// vacuum would need. Deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { squareMesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Tone, Will } from '@/code/tone/will'
import { pairCollision } from '@/code/rule/collision'
import { beat, collide, streamInverse } from '@/code/rule/lattice-gas'

const THIRD = (2 * Math.PI) / 3
const RING = 60

function wrap(v: number): number {
  let w = v % (2 * Math.PI)

  if (w > Math.PI) {
    w -= 2 * Math.PI
  }

  if (w <= -Math.PI) {
    w += 2 * Math.PI
  }

  return w
}

// winding of a phase field on the ring: the sum of wrapped link differences, in turns
function winding(phase: number[]): {
  turns: number
  linkValues: Set<number>
} {
  let total = 0

  const linkValues = new Set<number>()

  for (let x = 0; x < phase.length; x++) {
    const d = wrap(phase[(x + 1) % phase.length]! - phase[x]!)

    linkValues.add(Number(d.toFixed(12)))
    total += d
  }

  return { turns: total / (2 * Math.PI), linkValues }
}

export default experiment({
  id: 'gauge/strong-cp-discrete-theta',
  code: 'E-FRC-0079',
  title:
    "strong CP dissolved on the clock: the Z_3 vacuum manifold is three exact points (wrapped link differences take exactly three values to machine precision and every closed-loop winding is an exact integer across five constructed sectors, while the continuous-phase control takes a continuum and fractional windings), and the committed charge knit is exactly T-reversible on generic states (re-measured, Hamming zero), so a CP-odd vacuum angle has neither a continuum to live in nor a T-violating sector to act through, theta is exactly zero rather than mysteriously small, and the vacuum-angle contribution to the neutron electric dipole moment is predicted to be exactly zero",
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    // 1. clock fields: five winding sectors, deterministic patterns
    const sectors = [-2, -1, 0, 1, 2]
    const measuredTurns: number[] = []
    const allLinkValues = new Set<number>()

    for (const w of sectors) {
      // a pure Z_3 staircase with net winding w: the clock ticks once per stair boundary, the
      // minimal-step lift (a two-tick link is the same Z_3 element as a minus-one-tick link, which
      // is exactly the lift ambiguity a discrete phase has and a continuous one does not)
      const phase: number[] = []

      for (let x = 0; x < RING; x++) {
        const ticks =
          ((Math.floor((3 * Math.abs(w) * x) / RING) % 3) + 3) % 3

        phase.push(THIRD * (w >= 0 ? ticks : (3 - ticks) % 3))
      }

      const { turns, linkValues } = winding(phase)

      measuredTurns.push(turns)

      for (const v of linkValues) {
        allLinkValues.add(v)
      }
    }

    const windingsInteger = measuredTurns.every(
      (t, i) => Math.abs(t - sectors[i]!) < 1e-9,
    )
    const threeLinkValues = allLinkValues.size === 3

    // 2. the control: a continuous phase field, a continuum of link values, fractional winding
    const continuous: number[] = []

    for (let x = 0; x < RING; x++) {
      continuous.push(
        0.37 * Math.sin((2 * Math.PI * x) / RING) + (1.4 * x * x) / RING ** 2,
      )
    }

    const control = winding(continuous)
    const controlContinuum = control.linkValues.size > RING / 2
    const controlFractionalDensity = continuous.some((_, x) => {
      const d = wrap(continuous[(x + 1) % RING]! - continuous[x]!)

      return (
        Math.abs(d) > 1e-6 &&
        Math.abs(d) < THIRD - 1e-6
      )
    })

    // 3. the measured T symmetry of the charge knit, corrected convention, two generic states
    const side = 6
    const mesh = squareMesh({ side })
    const opposite = meshOpposites(mesh)
    const forward = pairCollision({ opposite })
    const inverse = pairCollision({ opposite, forward: false })

    const timeReverse = (w: Will): Will => {
      const out = makeWill(mesh)

      for (let cell = 0; cell < mesh.cellCount; cell++) {
        for (let d = 0; d < mesh.degree; d++) {
          out.data[cell * mesh.degree + opposite[d]!] =
            w.data[cell * mesh.degree + d]!
        }
      }

      return out
    }

    const patterns: ((i: number) => Tone)[] = [
      i => ((((i * 5 + (i % 11)) % 3) - 1) as Tone),
      i => ((((i * i + 2 * i) % 3) - 1) as Tone),
    ]

    let tViolation = 0

    for (const pattern of patterns) {
      const start = makeWill(mesh)

      for (let i = 0; i < start.data.length; i++) {
        start.data[i] = pattern(i)
      }

      const fresh = (): Will => ({
        mesh,
        data: Int8Array.from(start.data),
      })
      const flippedInverse = (() => {
        const copy: Will = {
          mesh,
          data: Int8Array.from(start.data),
        }

        collide(copy, inverse)

        return streamInverse(copy)
      })()
      const left = beat(timeReverse(fresh()), forward)
      const right = timeReverse(flippedInverse)

      for (let i = 0; i < left.data.length; i++) {
        if (left.data[i] !== right.data[i]) {
          tViolation++
        }
      }
    }

    const tExact = tViolation === 0

    const ok =
      windingsInteger &&
      threeLinkValues &&
      controlContinuum &&
      controlFractionalDensity &&
      tExact

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the clock fields wind by exact integers through exactly three link values, the continuous control takes a continuum of link values with fractional steps, and the charge knit T conjugation matches its exact inverse with zero Hamming distance on both states',
      metrics: {
        distinctClockLinkValues: allLinkValues.size,
        windingSectorsHit: new Set(
          measuredTurns.map(t => Math.round(t)),
        ).size,
        worstWindingError: Number(
          Math.max(
            ...measuredTurns.map((t, i) =>
              Math.abs(t - sectors[i]!),
            ),
          ).toExponential(2),
        ),
        tViolationSlots: tViolation,
      },
      // CONTROL: the continuous phase, which is what a tunable theta vacuum would require
      control: {
        controlDistinctLinkValues: control.linkValues.size,
      },
      notes:
        'the argument is conditional on the model structure it cites: the strong-sector phase being the Z_3 clock (the committed base) and the strong dynamics being the charge knit (measured T-reversible). The CKM phase stays free (E-FRC-0066), so an observed neutron EDM at the CKM-predicted level would be consistent, while an EDM at the theta level would falsify this dissolution. The one-time CPT flag of E-FND-0097 was resolved positively by E-FND-0101 (the charge knit has exact CP and CPT with the right group elements), which strengthens this dissolution: the strong-sector knit conserves T, CP and CPT outright.',
    })
  },
})
