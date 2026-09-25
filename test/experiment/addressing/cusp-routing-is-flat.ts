// Does the engine's own signal routing take the hyperbolic shortcut through the bulk, or does it walk the
// flat skin? The picture says recall uses the bulk: two points far apart along the flat horosphere are
// only logarithmically far through the hyperbolic interior. This runs the committed rule on the real
// {3,4,3,4} cells and asks.
//
// The substrate. The rule needs every cell's 24 facets labelled by the D4 roots, antipodal within a
// cell and d against -d across every shared facet (code/substrate/coxeter/label-transport). The labels
// come from a frame per cell, stepped across the facet labelled d by tau_d = F_d Z, the face reflection
// followed by the point inversion of the cell. Sending the outer Coxeter generator to Z is a
// homomorphism of [3,4,3,4] onto [3,4,3] because the last Coxeter label, 4, is even, so the labels close
// around every loop. Checked on the ball of radius 4 (162,049 cells, every one of its 3.9 million facet
// steps), with the canonical shell counts 1, 24, 456, 8376, 153192 reproduced. The control is the
// translation-like transport (two mirrors perpendicular to d, how the flat D4 mesh is labelled), which
// must fail on a curved honeycomb, and does.
//
// The skin. Every cell touching one ideal vertex of the base cell has its center on one horosphere, and
// these cells, adjacent across facets that contain the vertex, form the flat horosphere of that cusp:
// each has six layer neighbours and the layer's shells are the cubic lattice's, 1, 6, 18, 38, 66, ...
// Skin distance is breadth-first distance inside the layer. Bulk distance is the cell-graph distance,
// measured exactly for twelve layer cells at each skin distance 1 to 8 by meeting a radius-4 ball
// around the base cell with a radius-3 ball around the target. Beside it, the continuum hyperbolic
// distance between the two cell centers.
//
// The engine. A dense hash background on the ball, the committed turning weave with the reflecting
// frontier of the growing mesh (growingBeat), and a perturbation of the base cell (every slot turned
// one step round the tone cycle). The first beat each cell differs is its arrival. Controls: pure
// streaming on the same ball, which must reach exactly the 24 rays at exactly their distance, and the
// committed rule on the flat side-15 D4 mesh, the horosphere model.
//
// No random numbers: the background is a fixed hash of the slot index.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites, shellDistances } from '@/code/tool/mesh'
import {
  Collision,
  passThrough,
  turningWeave,
} from '@/code/rule/collision'
import { beat, growingBeat } from '@/code/rule/lattice-gas'
import { Will, makeWill } from '@/code/tone/will'
import { hashRand } from '@/code/dynamics/conserving-sweep'
import {
  buildHyperbolicBall,
  bulkDistance,
  cuspLayer,
  labelledCoin,
} from '@/code/substrate/coxeter/label-transport'
import { CANONICAL_SHELLS } from '@/code/substrate/mesh-unfolding'
import { innerJ, matVec } from '@/code/substrate/coxeter/minkowski'
import {
  arrivalRegression,
  firstArrival,
} from '@/code/measure/signal-arrival'
import { linearFit } from '@/code/measure/regression'

const RADIUS = 4
const BEATS = 8
const SKIN = 8
const PER_SKIN = 12
const SALT = 23

function hashBackground(will: Will, cells: number): void {
  for (let i = 0; i < cells * will.mesh.degree; i++) {
    const r = hashRand(i, 0, SALT)

    will.data[i] = r < 1 / 3 ? -1 : r < 2 / 3 ? 1 : 0
  }
}

function perturbCell(will: Will, cell: number): Will {
  const out: Will = { mesh: will.mesh, data: will.data.slice() }

  for (let d = 0; d < will.mesh.degree; d++) {
    const i = cell * will.mesh.degree + d
    const v = out.data[i] ?? 0

    out.data[i] = v === 1 ? -1 : v + 1
  }

  return out
}

type Shell = {
  reached: number
  exact: number
  early: number
  total: number
}

function byShell(
  arrival: Int32Array,
  distance: ArrayLike<number>,
  radius: number,
): Shell[] {
  const shells: Shell[] = Array.from({ length: radius + 1 }, () => ({
    reached: 0,
    exact: 0,
    early: 0,
    total: 0,
  }))

  for (let c = 0; c < arrival.length; c++) {
    const r = distance[c] ?? -1
    const shell = shells[r]

    if (shell === undefined) {
      continue
    }

    shell.total++

    const a = arrival[c] ?? -1

    if (a >= 0) {
      shell.reached++
      shell.exact += a === r ? 1 : 0
      shell.early += a < r ? 1 : 0
    }
  }

  return shells
}

export default experiment({
  id: 'addressing/cusp-routing-is-flat',
  code: 'E-NVG-0014',
  title:
    'the committed rule runs on a label-consistent {3,4,3,4} ball (the antipodal transport closes with zero holonomy on 162,049 cells where the translation-like one fails), routes a perturbation along rays no faster than one cell per beat, and between cells of one cusp gets no bulk shortcut: the cell-graph distance equals the flat skin distance at every sampled cell to skin 8 while the continuum hyperbolic distance between the same centers grows only from 1.76 to 5.18, an honest negative for recall through the bulk along a cusp',
  category: 'addressing',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const coin = labelledCoin()
    const ball = buildHyperbolicBall({ coin, radius: RADIUS })
    const small = buildHyperbolicBall({ coin, radius: RADIUS - 1 })
    const translated = buildHyperbolicBall({
      coin,
      radius: RADIUS - 1,
      kind: 'translation',
    })
    const shellCounts = new Array<number>(RADIUS + 1).fill(0)

    for (const d of ball.distance) {
      shellCounts[d] = (shellCounts[d] ?? 0) + 1
    }

    const canonical = shellCounts.every(
      (n, r) => n === CANONICAL_SHELLS[r],
    )

    // the skin: the cusp layer of one ideal vertex, and bulk against skin distance on it
    const layer = cuspLayer({ coin, skinRadius: SKIN })
    const cubic = [
      1,
      ...Array.from({ length: SKIN }, (_, r) => 4 * (r + 1) ** 2 + 2),
    ]
    const layerShells = new Array<number>(SKIN + 1).fill(0)

    for (const s of layer.skin.values()) {
      layerShells[s] = (layerShells[s] ?? 0) + 1
    }

    const layerIsCubic =
      layer.layerDegree.every(d => d === 6) &&
      layerShells.every((n, s) => n === cubic[s]) &&
      layer.levelSpread < 1e-9
    const { center, metric } = coin.frame
    const samples: {
      skin: number
      bulk: number
      hyperbolic: number
    }[] = []

    for (let s = 1; s <= SKIN; s++) {
      for (const member of layer.members
        .filter(m => m.skin === s)
        .slice(0, PER_SKIN)) {
        // the two balls meet at distance at most 2 RADIUS - 1, and not meeting proves the distance exceeds it
        const bulk =
          bulkDistance({
            near: ball,
            far: small,
            target: member.frame,
            coin,
          }) ?? 2 * RADIUS

        samples.push({
          skin: s,
          bulk,
          hyperbolic: Math.acosh(
            -innerJ(matVec(member.frame, center), center, metric),
          ),
        })
      }
    }

    // skin 8 lies beyond the meeting range, where the skin path itself bounds the bulk distance by 8
    const bulkEqualsSkin = samples.filter(x => x.bulk === x.skin).length
    const continuum = linearFit({
      xs: samples.map(x => Math.log(x.skin)),
      ys: samples.map(x => x.hyperbolic),
    })

    const hyperbolicAt = (s: number): number => {
      const values = samples
        .filter(x => x.skin === s)
        .map(x => x.hyperbolic)

      return (
        values.reduce((a, b) => a + b, 0) / Math.max(1, values.length)
      )
    }

    // the engine on the ball, and pure streaming, from the same background and perturbation
    const active = (cell: number): boolean => cell < ball.cells
    const start = makeWill(ball.mesh)

    hashBackground(start, ball.cells)

    const perturbed = perturbCell(start, 0)
    const rule = turningWeave({ opposite: coin.opposite })
    const arrivalOf = (schedule: (t: number) => Collision) =>
      firstArrival({
        start,
        perturbed,
        beats: BEATS,
        cells: ball.cells,
        step: (will, t) => growingBeat(will, schedule(t), active),
      })
    const committed = arrivalOf(rule)
    const streaming = arrivalOf(() => passThrough)
    const committedShells = byShell(committed, ball.distance, RADIUS)
    const streamingShells = byShell(streaming, ball.distance, RADIUS)
    const cuspTargets: { skin: number; arrival: number }[] = []

    for (let c = 1; c < ball.cells; c++) {
      const skin = layer.skin.get(ball.keys[c] ?? '')

      if (skin !== undefined) {
        cuspTargets.push({ skin, arrival: committed[c] ?? -1 })
      }
    }

    const cuspReached = cuspTargets.filter(t => t.arrival >= 0)
    const cuspBeatsSkin = cuspReached.filter(
      t => t.arrival < t.skin,
    ).length
    const reachedRegression = arrivalRegression({
      arrival: Array.from(committed),
      distance: Array.from(ball.distance),
    })

    // the flat control: the committed rule on the side-15 D4 mesh
    const side = 15
    const flat = d4Mesh({ side })
    const flatRule = turningWeave({ opposite: meshOpposites(flat) })
    const flatStart = makeWill(flat)

    hashBackground(flatStart, flat.cellCount)

    const mid = (side - 1) / 2
    const source = mid + side * (mid + side * (mid + side * mid))
    const flatArrival = firstArrival({
      start: flatStart,
      perturbed: perturbCell(flatStart, source),
      beats: BEATS,
      cells: flat.cellCount,
      step: (will, t) => beat(will, flatRule(t)),
    })
    const flatShells = byShell(
      flatArrival,
      shellDistances(flat, source),
      RADIUS,
    )

    const substrateBuilt =
      coin.gramError < 1e-9 &&
      coin.stabilizerOrder === 1152 &&
      coin.inversionInStabilizer &&
      coin.inversionExchangesAntipodes &&
      ball.inconsistentSteps === 0 &&
      ball.returnsExactly &&
      canonical
    const translationFails =
      translated.inconsistentSteps > 0 && !translated.returnsExactly
    const noEarlyArrival =
      committedShells.every(s => s.early === 0) &&
      flatShells.every(s => s.early === 0)
    const streamingIsRays = streamingShells.every(
      (s, r) =>
        s.reached === (r === 0 ? 1 : 24) && s.exact === s.reached,
    )
    const cuspIsFlatInBulk = bulkEqualsSkin === samples.length
    // the continuum distance grows by far less than the skin distance does, and ever more slowly (at
    // these separations 2 asinh(sigma / 2) is still on its way to the logarithm, so no log fit is gated)
    const continuumLinear = linearFit({
      xs: samples.map(x => x.skin),
      ys: samples.map(x => x.hyperbolic),
    })
    const middle = SKIN / 2
    const continuumIsSublinear =
      hyperbolicAt(SKIN) / hyperbolicAt(1) < SKIN / 2 &&
      (hyperbolicAt(SKIN) - hyperbolicAt(middle)) / (SKIN - middle) <
        (hyperbolicAt(middle) - hyperbolicAt(1)) / (middle - 1)
    const ok =
      substrateBuilt &&
      translationFails &&
      layerIsCubic &&
      cuspIsFlatInBulk &&
      continuumIsSublinear &&
      noEarlyArrival &&
      streamingIsRays &&
      cuspBeatsSkin === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a label-consistent lattice gas on {3,4,3,4} exists and closes exactly (the translation-like labelling does not), the committed rule on it never delivers a perturbation earlier than the cell-graph distance, and on the flat horosphere of a cusp the cell-graph distance is the skin distance itself at every sampled cell out to skin 8 while the continuum distance between the same centers grows by a factor under three and ever more slowly, so no signal of the engine can beat the skin between cells of one cusp',
      metrics: {
        ballCells: ball.cells,
        frameMismatch: ball.frameMismatch,
        inconsistentSteps: ball.inconsistentSteps,
        cuspSamples: samples.length,
        bulkEqualsSkin,
        hyperbolicDistanceSkin1: hyperbolicAt(1),
        hyperbolicDistanceSkin8: hyperbolicAt(SKIN),
        hyperbolicSlopeAgainstLogSkin: continuum.slope,
        hyperbolicFitR2: continuum.r2,
        hyperbolicLinearFitR2: continuumLinear.r2,
        reachedShell1: committedShells[1]?.reached ?? 0,
        reachedShell2: committedShells[2]?.reached ?? 0,
        reachedShell3: committedShells[3]?.reached ?? 0,
        reachedShell4: committedShells[4]?.reached ?? 0,
        lightSpeedShell4: committedShells[4]?.exact ?? 0,
        cellsShell4: committedShells[4]?.total ?? 0,
        arrivalSlopeAgainstBulk: reachedRegression.slope,
        arrivalR2AgainstBulk: reachedRegression.r2,
        cuspTargetsInBall: cuspTargets.length,
        cuspTargetsReached: cuspReached.length,
        cuspArrivalsBeatingSkin: cuspBeatsSkin,
      },
      control: {
        translationInconsistentSteps: translated.inconsistentSteps,
        streamingReachedShell4: streamingShells[4]?.reached ?? 0,
        streamingLightSpeedShell4: streamingShells[4]?.exact ?? 0,
        flatReachedShell4: flatShells[4]?.reached ?? 0,
        flatLightSpeedShell4: flatShells[4]?.exact ?? 0,
        flatCellsShell4: flatShells[4]?.total ?? 0,
        flatEarlyArrivals: flatShells.reduce((s, x) => s + x.early, 0),
      },
      notes:
        'L2, an honest negative with a construction. The construction is new here: the antipodal transport is the only label-preserving one on {3,4,3,4} of the two tried, and it is not a translation (relative to parallel transport it reverses the frame orientation at each step, so neighbouring cells see the coin with opposite handedness, stated rather than hidden). The negative is geometric and holds for any rule that moves one cell per beat across facets: the cells of a cusp are ideal chimneys, one cell each all the way up to the ideal vertex, so a path through the horoball crosses as many cells as the skin path does, and the cell graph embeds the cusp horosphere isometrically at every pair sampled here, the neutered-space picture. The shortcut exists in the continuum metric (1.76 at skin 1 to 5.18 at skin 8: two points of one horosphere a horospherical length sigma apart are 2 asinh(sigma / 2) apart, which heads for twice the logarithm of sigma) and not in the graph the engine streams on. What the committed rule adds: it moves a perturbation along rays, reaching about twenty cells per shell rather than filling the light cone, on the hyperbolic ball and the flat mesh alike, so its routing is ray tracing on the cell graph, and a cusp cell two skin steps away is not reached in eight beats at all. Where the bulk does win is volume: the ball of radius 4 holds 162,049 cells against the cusp layer holding 129 within skin 4, so the shortcut belongs to reaching many cells, not to crossing one cusp.',
    })
  },
})
