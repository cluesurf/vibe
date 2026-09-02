// The bullet-cluster separation mechanism, measured on the gas. The bullet cluster shows two kinds
// of matter doing different things in one collision: the diffuse component (the lensing mass) sailed
// through while the dense gas shocked and lagged. The mechanism needs exactly two measured facts: a
// directed stream with nothing oncoming feels NO drag, and drag against an oncoming stream grows
// with density. Both are measured here on the momentum gas:
//
//   - A SINGLE DIRECTED CLOUD IS EXACTLY COLLISIONLESS: launched alone at half fill, every tone
//     arrives on the ballistic schedule with beam survival exactly 1 (the momentum knit only
//     couples head-on opposites, so a co-moving stream never self-scatters).
//   - DRAG GROWS WITH TARGET DENSITY: two counter-launched clouds cross with beam survival 0.83 at
//     four percent fill (nearly collisionless, the diffuse-halo regime) falling monotonically to
//     0.61 at ninety percent (the shocked-gas regime), with the loss saturating as re-rotation
//     returns scattered tones to the beam, reported as measured.
//
// So a two-density object crossing a target SEPARATES: its diffuse part keeps the ballistic
// schedule its dense part cannot, the bullet morphology, with the no-target run the exact control.
// What this row still lacks is the dark matter IDENTITY (what the model's non-luminous gravitating
// component IS, the clock-wall candidate of the higher-level-emergence note) and the rotation
// curves, so the ledger row stays open with the separation mechanism banked. Depth L2,
// deterministic placement, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  squareMesh,
  meshOpposites,
  meshNeighbors,
} from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { headOnRotate } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import { hashRand } from '@/code/dynamics/conserving-sweep'

const SIDE = 64
const BEATS = 40

function beamSurvival(input: {
  fill: number
  counterCloud: boolean
}): number {
  const mesh = squareMesh({ side: SIDE })
  const opposite = meshOpposites(mesh)
  const neighbors = meshNeighbors(mesh)
  const ex: number[] = []

  for (let d = 0; d < mesh.degree; d++) {
    let dx = neighbors[0]![d]! % SIDE

    if (dx > SIDE / 2) {
      dx -= SIDE
    }

    ex.push(dx)
  }

  const plus = ex.indexOf(1)
  const minus = ex.indexOf(-1)
  const will = makeWill(mesh)

  let launched = 0

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const x = cell % SIDE
    const base = cell * mesh.degree

    if (x >= 8 && x <= 23 && hashRand(cell, 1, 55) < input.fill) {
      will.data[base + plus] = 1
      launched++
    }

    if (
      input.counterCloud &&
      x >= 40 &&
      x <= 55 &&
      hashRand(cell, 2, 55) < input.fill
    ) {
      will.data[base + minus] = 1
      launched++
    }
  }

  const rule = headOnRotate({ opposite })

  let w: Will = { mesh, data: Int8Array.from(will.data) }

  for (let t = 0; t < BEATS; t++) {
    w = beat(w, rule)
  }

  let beam = 0

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const x = cell % SIDE

    if (x >= 48 && w.data[cell * mesh.degree + plus] !== 0) {
      beam++
    }

    if (
      input.counterCloud &&
      x < 16 &&
      w.data[cell * mesh.degree + minus] !== 0
    ) {
      beam++
    }
  }

  return beam / launched
}

export default experiment({
  id: 'cosmology/bullet-separation-mechanism',
  code: 'E-CSM-0053',
  title:
    'the bullet-cluster separation mechanism on the gas: a single directed cloud is exactly collisionless (beam survival 1, the momentum knit never self-scatters a co-moving stream), counter-launched clouds lose beam monotonically with density (0.83 at four percent fill down to 0.61 at ninety, the diffuse-halo versus shocked-gas regimes, saturation by re-rotation reported), so a two-density object separates in a crossing exactly as the bullet cluster shows, with the dark matter identity and the rotation curves still the open half of the row',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const alone = beamSurvival({ fill: 0.5, counterCloud: false })
    const fills = [0.04, 0.2, 0.5, 0.9]
    const survivals = fills.map(fill =>
      beamSurvival({ fill, counterCloud: true }),
    )

    const exactlyCollisionless = alone === 1
    const diluteBallistic = survivals[0]! > 0.8
    const denseDragged = survivals[3]! < 0.65
    const monotone = survivals.every(
      (s, i) => i === 0 || s <= survivals[i - 1]! + 1e-9,
    )

    const ok =
      exactlyCollisionless &&
      diluteBallistic &&
      denseDragged &&
      monotone

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the lone cloud survives at exactly 1, the four percent crossing above 0.8, the ninety percent crossing below 0.65, and survival declines monotonically with density',
      metrics: {
        survivalAt4Percent: Number(survivals[0]!.toFixed(3)),
        survivalAt20Percent: Number(survivals[1]!.toFixed(3)),
        survivalAt50Percent: Number(survivals[2]!.toFixed(3)),
        survivalAt90Percent: Number(survivals[3]!.toFixed(3)),
      },
      // CONTROL: the no-target run, exactly ballistic, so all drag is from the oncoming stream
      control: {
        loneCloudSurvival: alone,
      },
      notes:
        'the loss saturates near forty percent because a scattered pair rotates into the transverse axis and a second collision can rotate it back into the beam, a re-thermalization channel of the four-direction gas, measured and reported rather than modeled away.',
    })
  },
})
