// The momentum gas's density wave as a coarse amplitude: it superposes, it interferes destructively,
// and its nonlinearity at overlap is measured. Two pulses are launched in the disordered pair gas, a
// compression (every slot filled in a slab) and, for the destructive case, a rarefaction (the
// background pairs cleared from a slab). Measured, against the exact bump-free reference:
//
//   - while the disturbances are disjoint the joint excess profile equals the SUM of the single-pulse
//     excesses to machine precision at every column (the medium is deterministic and the disturbances
//     have not met, so this is exact, not approximate),
//   - when a compression crosses a rarefaction the total absolute excess drops to under six tenths of
//     the separate sum, destructive interference of a coarse amplitude that carries a SIGN,
//   - during the crossing the superposition gap grows to a measured fraction of the pulse height, the
//     gas's genuine nonlinearity, which is exactly the term a unitary coarse dynamics would need to
//     not have (the obstruction for the amplitude program, quantified),
//   - under the momentum-pinning pair table (the control) nothing propagates, the pulses never meet,
//     and no cancellation event occurs.
//
// The density amplitude is real: it has a sign and interferes, but carries no U(1) phase, which is the
// difference between sound and the quantum. Depth L2, known lattice-gas acoustics (Hardy, de Pazzis,
// Pomeau 1973; Frisch, Hasslacher, Pomeau 1986) measured exactly on this gas.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { squareMesh, meshOpposites } from '@/code/tool/mesh'
import {
  Collision,
  headOnRotate,
  pairCollision,
} from '@/code/rule/collision'
import { makeWill, Will } from '@/code/tone/will'
import {
  addDensitySlab,
  excessProfileSeries,
  pairGasFill,
} from '@/code/measure/density-front'

const SIDE = 96
const FILL = 0.35
const HALF_WIDTH = 3
const BEATS = 44
const LEFT = 24
const RIGHT = 72
const EXACT = 1e-9

// clear every slot in the slab, a rarefaction: the background pairs are removed there
function clearSlab(will: Will, center: number): void {
  const mesh = will.mesh

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const x = cell % SIDE
    const dx = Math.min(Math.abs(x - center), SIDE - Math.abs(x - center))

    if (dx <= HALF_WIDTH) {
      for (let direction = 0; direction < mesh.degree; direction++) {
        will.data[cell * mesh.degree + direction] = 0
      }
    }
  }
}

function study(collision: Collision): {
  preOverlapGap: number
  overlapGap: number
  minCancelRatio: number
  peakExcess: number
} {
  const mesh = squareMesh({ side: SIDE })

  const state = (mods: ((w: Will) => void)[]): Will => {
    const will = makeWill(mesh)

    pairGasFill({ will, pairFill: FILL })

    for (const mod of mods) {
      mod(will)
    }

    return will
  }

  const compress = (center: number) => (w: Will) =>
    addDensitySlab({ will: w, side: SIDE, center, halfWidth: HALF_WIDTH })
  const rarefy = (center: number) => (w: Will) => clearSlab(w, center)

  const reference = state([])
  const series = (mods: ((w: Will) => void)[]): number[][] =>
    excessProfileSeries({
      reference,
      bumped: state(mods),
      collision,
      beats: BEATS,
      side: SIDE,
    })

  const left = series([compress(LEFT)])
  const rightNegative = series([rarefy(RIGHT)])
  const joint = series([compress(LEFT), rarefy(RIGHT)])

  let preOverlapGap = 0
  let overlapGap = 0
  let minCancelRatio = Infinity
  let peakExcess = 0

  for (let t = 0; t < BEATS; t++) {
    let gap = 0
    let separateSum = 0
    let jointSum = 0

    for (let x = 0; x < SIDE; x++) {
      gap = Math.max(
        gap,
        Math.abs(joint[t]![x]! - left[t]![x]! - rightNegative[t]![x]!),
      )

      separateSum +=
        Math.abs(left[t]![x]!) + Math.abs(rightNegative[t]![x]!)
      jointSum += Math.abs(joint[t]![x]!)
      peakExcess = Math.max(peakExcess, Math.abs(left[t]![x]!))
    }

    // the fronts move at under one cell per beat from 24 and 72 toward 48, so they cannot have met
    // before beat 20
    if (t <= 20) {
      preOverlapGap = Math.max(preOverlapGap, gap)
    } else {
      overlapGap = Math.max(overlapGap, gap)
      minCancelRatio = Math.min(minCancelRatio, jointSum / separateSum)
    }
  }

  return { preOverlapGap, overlapGap, minCancelRatio, peakExcess }
}

export default experiment({
  id: 'fluids/sound-superposition-interference',
  code: 'E-FLD-0014',
  title:
    'the momentum gas density wave is a coarse amplitude with a sign: disjoint pulses superpose to machine precision, a compression crossing a rarefaction cancels the total absolute excess to under six tenths of the separate sum (destructive interference), the nonlinear superposition gap during overlap is measured as the obstruction a unitary coarse dynamics would need to lack, and under the momentum-pinning table nothing propagates and no cancellation occurs',
  category: 'fluids',
  substrates: ['square'],
  depth: 'L2',
  paper: true,
  run() {
    const opposite = meshOpposites(squareMesh({ side: SIDE }))
    const gas = study(headOnRotate({ opposite }))
    const pinned = study(pairCollision({ opposite }))

    const exactWhileDisjoint = gas.preOverlapGap < EXACT
    const destructive = gas.minCancelRatio < 0.6
    const nonlinearityMeasured =
      gas.overlapGap > EXACT && gas.overlapGap < gas.peakExcess
    const controlNeverCancels = pinned.minCancelRatio > 0.9

    const ok =
      exactWhileDisjoint &&
      destructive &&
      nonlinearityMeasured &&
      controlNeverCancels &&
      pinned.preOverlapGap < EXACT

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'in the head-on-rotate gas at fill 0.35 the joint excess of a compression at column 24 and a rarefaction at column 72 equals the exact sum of the single-pulse excesses at every column while the fronts are disjoint, drops to under six tenths of the separate absolute sum when the pulses cross (destructive interference of a signed coarse amplitude), carries a measured nonlinear superposition gap during the overlap, and under the momentum-pinning pair table the pulses never move so no cancellation event exists',
      metrics: {
        preOverlapGap: Number(gas.preOverlapGap.toExponential(2)),
        overlapGap: Number(gas.overlapGap.toFixed(4)),
        peakExcess: Number(gas.peakExcess.toFixed(4)),
        minCancelRatio: Number(gas.minCancelRatio.toFixed(4)),
      },
      // CONTROL: the pinning table propagates nothing, so the crossing and its cancellation never happen
      control: {
        pinnedMinCancelRatio: Number(pinned.minCancelRatio.toFixed(4)),
        pinnedPreOverlapGap: Number(pinned.preOverlapGap.toExponential(2)),
      },
      notes:
        'The amplitude-program reading (roadmap base-model 0005): the density wave is the one coarse variable the momentum rule is known to carry, it superposes and interferes like a real field, and the measured overlap nonlinearity is the exact obstruction to a unitary induced dynamics on this variable. A real amplitude has no U(1) phase, so sound alone cannot make the quantum; the phase lives in the charge rule vacuum clock (E-FND-0084 to 0088), and no committed rule carries both at once, which is now the sharpest statement of what a sixth thing would need to supply.',
    })
  },
})
