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
//
// ROBUSTNESS, added 2026-09-25. The first version was one source, 90 sampled cells, a reflecting
// frontier, and frames that reverse orientation from cell to cell. Each of those is now varied, with
// the instruments in code/measure/cusp-routing, and the negative survives every one:
//
// 1. Every cell of the cusp layer to skin 8, 832 of them, not 90: the exact bulk distance (the two
//    balls meeting) equals the skin distance at 832 of 832.
// 2. Every separation, not only to skin 8: in horospherical coordinates about the ideal vertex the
//    layer's centers form the cubic lattice and skin distance is the l1 distance of the lattice
//    coordinates. Over all 201,600 facet steps of the radius-4 ball no step changes those coordinates
//    by more than 1 in l1, so no path between two layer cells is shorter than their skin distance.
//    Outside the ball: a step whose upper end is at least twice as deep as the layer moves
//    horizontally by at most sqrt(y1 y2) 2 sinh(d / 2) <= half a lattice unit (the upper half space
//    distance formula), under 1 in l1 (measured 0.40 at most). The shallow steps are symmetry images
//    of steps near the base cell, since the cusp's own symmetries act transitively on the layer, and
//    the ball holds them if every shallow cell lies within three steps of a layer cell, which is the
//    one piece not checked.
// 3. Several sources: the base cell, a cell at bulk distance 1 and one at 2, each against the layer
//    cells of all 24 of its cusps, two backgrounds, and two perturbations (the whole cell, or slot 0
//    alone), 12 runs. Across them no cusp target is reached before its skin distance, and no cell of
//    the ball before its distance from the source.
// 4. An absorbing frontier (the outside is empty and never collides, so what leaves never returns)
//    beside the reflecting one, same 12 runs: again zero arrivals beat the skin. The table engine is
//    checked against growingBeat on the original run, arrival for arrival.
// 5. Orientation. The substrate offers no orientation-keeping frames, and none exists of the kind it
//    builds: over all 1,152 symmetries of the base cell, the involutions that commute with the three
//    mirrors the outer one commutes with, keep (r3 X)^4 = 1 and exchange the outer facet with its
//    antipode are exactly one, the point inversion, whose transport reverses orientation. Every normal
//    subgroup acting simply transitively on the cells is the kernel of such a retraction, so the flips
//    are forced for this construction (a non-normal one is not searched). How much they matter: the
//    geometric half cannot see them (the cell graph is the same, cell for cell and distance for
//    distance, under the translation-like transport that labels nothing consistently), and the
//    engine half is causality, which is label-free. For the rule itself, the flat mesh relabelled by
//    12 orientation-keeping and 12 orientation-reversing elements of W(F4) reaches 85.4 and 82.6
//    cells of shells 1 to 4 on average, a gap of 2.8 inside the relabelling spread of 6.6, so a
//    mirrored coin routes no differently from a rotated one. Alternating handedness itself cannot be
//    put on the flat D4 mesh (its cell graph has triangles), so that is the limit of this test.
//
// Run time went from 42 s to 7 to 9 minutes (433 s alone, 518 s beside other runs), most of it the 24 engine runs on the 162,049-cell ball.

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
import {
  ballCenters,
  cellStabilizer,
  centerBulkDistance,
  idealVertexMaps,
  relabelMesh,
  retractionSearch,
  skinCertificate,
  tableArrival,
} from '@/code/measure/cusp-routing'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import {
  determinant,
  pointKey,
  toPoincare,
} from '@/code/substrate/coxeter/minkowski'
import { weylCell } from '@/code/tool/weyl'

const RADIUS = 4
const BEATS = 8
const SKIN = 8
const PER_SKIN = 12
const SALT = 23
// the robustness runs: sources at bulk distance 0, 1 and 2, two backgrounds, two perturbations (every
// slot of the source turned, or slot 0 alone), and both frontiers
const SALTS = [SALT, 101]
const PERTURBATIONS = ['cell', 'slot'] as const
const FRONTIERS = ['reflect', 'absorb'] as const
// relabellings of the flat mesh for the handedness test, per sign of determinant
const RELABELLINGS = 12

function hashBackground(will: Will, cells: number, salt = SALT): void {
  for (let i = 0; i < cells * will.mesh.degree; i++) {
    const r = weylCell(i, 0, salt)

    will.data[i] = r < 1 / 3 ? -1 : r < 2 / 3 ? 1 : 0
  }
}

// every slot of the cell turned one step round the tone cycle, or only the listed ones
function perturbCell(
  will: Will,
  cell: number,
  slots?: readonly number[],
): Will {
  const out: Will = { mesh: will.mesh, data: will.data.slice() }
  const chosen =
    slots ?? Array.from({ length: will.mesh.degree }, (_, d) => d)

  for (const d of chosen) {
    const i = cell * will.mesh.degree + d
    const v = out.data[i] ?? 0

    out.data[i] = v === 1 ? -1 : v + 1
  }

  return out
}

// breadth-first distance over the real cells of a ball from one source, never through the phantom
function distancesFrom(input: {
  mesh: Will['mesh']
  cells: number
  source: number
}): Int32Array {
  const { mesh, cells, source } = input
  const distance = new Int32Array(cells).fill(-1)
  const queue = [source]

  distance[source] = 0

  for (let head = 0; head < queue.length; head++) {
    const c = queue[head]!

    for (let d = 0; d < mesh.degree; d++) {
      const n = mesh.neighbour(c, d)

      if (n < cells && distance[n] === -1) {
        distance[n] = (distance[c] ?? 0) + 1
        queue.push(n)
      }
    }
  }

  return distance
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
    'the committed rule runs on a label-consistent {3,4,3,4} ball (the antipodal transport closes with zero holonomy on 162,049 cells where the translation-like one fails), routes a perturbation along rays no faster than one cell per beat, and between cells of one cusp gets no bulk shortcut: the cell-graph distance equals the flat skin distance at every sampled cell to skin 8 while the continuum hyperbolic distance between the same centers grows only from 1.76 to 5.18, an honest negative for recall through the bulk along a cusp, and robust: 832 of 832 layer cells to skin 8, every separation by a step certificate, three sources to all 24 cusps, an absorbing frontier as well as a reflecting one, and orientation flips that are forced and route no differently from a relabelling',
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

    // ROBUSTNESS 1, more cells: every cell of the cusp layer out to skin 8, not twelve per skin
    const farCenters = ballCenters({ ball: small, coin })
    const layerCells = layer.members.filter(m => m.skin >= 1)

    let layerBulkEqualsSkin = 0

    for (const m of layerCells) {
      const bulk =
        centerBulkDistance({
          near: ball,
          farCenters,
          farDistance: small.distance,
          target: m.frame,
          coin,
        }) ?? 2 * RADIUS

      layerBulkEqualsSkin += bulk === m.skin ? 1 : 0
    }

    // ROBUSTNESS 2, every skin distance: no facet step of the ball moves the horospherical lattice
    // coordinates by more than 1 in l1 (code/measure/cusp-routing, skinCertificate)
    const centers = ballCenters({ ball, coin })
    const certificate = skinCertificate({ ball, centers, coin, layer })
    const certified =
      certificate.largestStep <= 1 + 1e-9 &&
      certificate.skinIsL1 &&
      certificate.axesError < 1e-9 &&
      certificate.nothingAboveLayer

    // ROBUSTNESS 3 and 4, several sources and an absorbing frontier. Each source's cusp targets are
    // the layer cells of all 24 of its ideal vertices, carried there by the source's frame and a
    // symmetry of the base cell, with their skin distance in that cusp
    const stabilizer = cellStabilizer(coin)
    const { maps } = idealVertexMaps({ coin, stabilizer })
    const memberCenters = layerCells.map(m => ({
      skin: m.skin,
      point: matVec(m.frame, center),
    }))
    const sources = [0, 1, ball.distance.findIndex(d => d === 2)]
    const { timeAxis } = coin.frame
    const emptyTally = () => ({
      runs: 0,
      targets: 0,
      reached: 0,
      beatingSkin: 0,
      atSkin: 0,
      early: 0,
      reachedCells: 0,
    })
    const tallies = { reflect: emptyTally(), absorb: emptyTally() }

    let tableMatchesGrowingBeat = false

    for (const source of sources) {
      const g = ball.frames[source]!
      const targets: { cell: number; skin: number }[] = []

      for (const h of maps) {
        for (const m of memberCenters) {
          const cell = ball.index.get(
            pointKey(toPoincare(matVec(g, matVec(h, m.point)), timeAxis)),
          )

          if (cell !== undefined) {
            targets.push({ cell, skin: m.skin })
          }
        }
      }

      const fromSource = distancesFrom({
        mesh: ball.mesh,
        cells: ball.cells,
        source,
      })

      for (const salt of SALTS) {
        const background = makeWill(ball.mesh)

        hashBackground(background, ball.cells, salt)

        for (const kind of PERTURBATIONS) {
          const perturbedWill = perturbCell(
            background,
            source,
            kind === 'cell' ? undefined : [0],
          )

          for (const frontier of FRONTIERS) {
            const arrival = tableArrival({
              mesh: ball.mesh,
              cells: ball.cells,
              start: background.data,
              perturbed: perturbedWill.data,
              beats: BEATS,
              rule,
              frontier,
            })

            if (
              source === 0 &&
              salt === SALT &&
              kind === 'cell' &&
              frontier === 'reflect'
            ) {
              tableMatchesGrowingBeat = arrival.every(
                (a, c) => a === committed[c],
              )
            }

            const tally = tallies[frontier]

            tally.runs++

            for (let c = 0; c < ball.cells; c++) {
              const a = arrival[c] ?? -1

              if (a >= 0) {
                tally.reachedCells++
                tally.early += a < (fromSource[c] ?? 0) ? 1 : 0
              }
            }

            for (const t of targets) {
              const a = arrival[t.cell] ?? -1

              tally.targets++

              if (a >= 0) {
                tally.reached++
                tally.beatingSkin += a < t.skin ? 1 : 0
                tally.atSkin += a === t.skin ? 1 : 0
              }
            }
          }
        }
      }
    }

    // ROBUSTNESS 5, orientation. (a) Every transport of the retraction form, searched over all 1,152
    // symmetries of the base cell: does any keep the frame's orientation? (b) The cell graph is the
    // same under a transport that labels nothing consistently (the translation-like one), so the
    // geometric half of the negative cannot see frames at all. (c) Does the committed rule care about
    // handedness? The flat mesh relabelled by every twelfth-or-so element of W(F4), the same number
    // of each determinant, from one background and source: a mirrored coin against a rotated one
    const retraction = retractionSearch({ coin, stabilizer })
    const orientationKeepingTransports =
      retraction.transportDeterminants.filter(d => d === 1).length
    const sameCellGraph =
      translated.cells === small.cells &&
      translated.keys.every((key, i) => {
        const j = small.index.get(key)

        return j !== undefined && small.distance[j] === translated.distance[i]
      })
    const roots = rootsD4()
    const basisRoots = [
      [1, 1, 0, 0],
      [1, -1, 0, 0],
      [0, 0, 1, 1],
      [0, 0, 1, -1],
    ].map(b => roots.findIndex(r => r.every((v, i) => v === b[i])))
    const basisDeterminant = determinant(
      basisRoots.map(k => roots[k]!),
    )
    const permutations = weylF4DirectionPermutations({ directions: roots })
    const handed = (sign: number): number[][] => {
      const members = permutations.filter(
        p =>
          Math.round(
            determinant(basisRoots.map(k => roots[p[k]!]!)) /
              basisDeterminant,
          ) === sign,
      )
      const stride = Math.floor(members.length / RELABELLINGS)

      return Array.from(
        { length: RELABELLINGS },
        (_, i) => members[i * stride]!,
      )
    }
    const flatDistance = shellDistances(flat, source)
    const flatPerturbed = perturbCell(flatStart, source)
    const reachOf = (permutation: number[]): number => {
      const arrival = tableArrival({
        mesh: relabelMesh({ mesh: flat, permutation }),
        cells: flat.cellCount,
        start: flatStart.data,
        perturbed: flatPerturbed.data,
        beats: BEATS,
        rule: flatRule,
        frontier: 'reflect',
      })

      let reached = 0

      for (let c = 0; c < flat.cellCount; c++) {
        const r = flatDistance[c] ?? -1

        if (r >= 1 && r <= RADIUS && (arrival[c] ?? -1) >= 0) {
          reached++
        }
      }

      return reached
    }
    const keepingReach = handed(1).map(reachOf)
    const mirroringReach = handed(-1).map(reachOf)
    const meanOf = (xs: number[]): number =>
      xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length)
    const spreadOf = (xs: number[]): number => {
      const m = meanOf(xs)

      return Math.sqrt(meanOf(xs.map(x => (x - m) ** 2)))
    }
    const handednessGap = Math.abs(
      meanOf(keepingReach) - meanOf(mirroringReach),
    )
    const handednessSpread = Math.max(
      spreadOf(keepingReach),
      spreadOf(mirroringReach),
    )

    const robustness =
      layerBulkEqualsSkin === layerCells.length &&
      certified &&
      tableMatchesGrowingBeat &&
      tallies.reflect.early === 0 &&
      tallies.absorb.early === 0 &&
      tallies.reflect.beatingSkin === 0 &&
      tallies.absorb.beatingSkin === 0 &&
      sameCellGraph &&
      retraction.inversionSurvives &&
      orientationKeepingTransports === 0 &&
      handednessGap <= handednessSpread

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
      cuspBeatsSkin === 0 &&
      robustness

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a label-consistent lattice gas on {3,4,3,4} exists and closes exactly (the translation-like labelling does not), the committed rule on it never delivers a perturbation earlier than the cell-graph distance, and on the flat horosphere of a cusp the cell-graph distance is the skin distance itself at every sampled cell out to skin 8 while the continuum distance between the same centers grows by a factor under three and ever more slowly, so no signal of the engine can beat the skin between cells of one cusp. It holds at every one of the 832 layer cells to skin 8, at every separation by a step certificate on the horospherical lattice, from three sources to all 24 of their cusps over two backgrounds and two perturbations, with an absorbing frontier as well as a reflecting one, and the orientation flips are forced (the point inversion is the only transport of its kind) and do not change the rule\'s routing beyond what any relabelling does',
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
        layerCellsMeasured: layerCells.length,
        layerBulkEqualsSkin,
        certificateSteps: certificate.steps,
        certificateLargestStep: certificate.largestStep,
        certificateLargestStepBand0: certificate.largestStepByBand[0] ?? 0,
        certificateLargestStepDeeper: Math.max(
          0,
          ...certificate.largestStepByBand.slice(1),
        ),
        certificateStepsBand0: certificate.stepsByBand[0] ?? 0,
        certificateSkinIsL1: certificate.skinIsL1 ? 1 : 0,
        certificateNothingAboveLayer: certificate.nothingAboveLayer ? 1 : 0,
        robustSources: sources.length,
        robustRunsPerFrontier: tallies.reflect.runs,
        reflectCuspTargets: tallies.reflect.targets,
        reflectCuspReached: tallies.reflect.reached,
        reflectCuspAtSkin: tallies.reflect.atSkin,
        reflectCuspBeatingSkin: tallies.reflect.beatingSkin,
        reflectEarlyArrivals: tallies.reflect.early,
        reflectReachedCells: tallies.reflect.reachedCells,
        absorbCuspTargets: tallies.absorb.targets,
        absorbCuspReached: tallies.absorb.reached,
        absorbCuspAtSkin: tallies.absorb.atSkin,
        absorbCuspBeatingSkin: tallies.absorb.beatingSkin,
        absorbEarlyArrivals: tallies.absorb.early,
        absorbReachedCells: tallies.absorb.reachedCells,
        tableMatchesGrowingBeat: tableMatchesGrowingBeat ? 1 : 0,
        retractionInvolutions: retraction.involutions,
        retractionCommuting: retraction.commuting,
        retractionCoxeter: retraction.coxeter,
        retractionLabelling: retraction.labelling,
        orientationKeepingTransports,
        sameCellGraphUnderTranslation: sameCellGraph ? 1 : 0,
        flatReachKeepingMean: meanOf(keepingReach),
        flatReachKeepingMin: Math.min(...keepingReach),
        flatReachKeepingMax: Math.max(...keepingReach),
        flatReachMirroringMean: meanOf(mirroringReach),
        flatReachMirroringMin: Math.min(...mirroringReach),
        flatReachMirroringMax: Math.max(...mirroringReach),
        handednessGap,
        handednessSpread,
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
        'L2, an honest negative with a construction. The construction is new here: the antipodal transport is the only label-preserving one on {3,4,3,4} of the two tried, and it is not a translation (relative to parallel transport it reverses the frame orientation at each step, so neighbouring cells see the coin with opposite handedness, stated rather than hidden). The negative is geometric and holds for any rule that moves one cell per beat across facets: the cells of a cusp are ideal chimneys, one cell each all the way up to the ideal vertex, so a path through the horoball crosses as many cells as the skin path does, and the cell graph embeds the cusp horosphere isometrically at every pair sampled here, the neutered-space picture. The shortcut exists in the continuum metric (1.76 at skin 1 to 5.18 at skin 8: two points of one horosphere a horospherical length sigma apart are 2 asinh(sigma / 2) apart, which heads for twice the logarithm of sigma) and not in the graph the engine streams on. What the committed rule adds: it moves a perturbation along rays, reaching about twenty cells per shell rather than filling the light cone, on the hyperbolic ball and the flat mesh alike, so its routing is ray tracing on the cell graph, and a cusp cell two skin steps away is not reached in eight beats at all. Where the bulk does win is volume: the ball of radius 4 holds 162,049 cells against the cusp layer holding 129 within skin 4, so the shortcut belongs to reaching many cells, not to crossing one cusp. Robustness (header, 2026-09-25): 832 of 832 layer cells, a certificate over 201,600 facet steps (largest l1 step exactly 1 at the layer, 0.40 below it), 12 runs per frontier from sources at distance 0, 1 and 2 to all 24 cusps with zero arrivals beating the skin under either frontier (834 cusp targets reached exactly at skin distance under both), and a handedness gap of 2.8 cells inside a relabelling spread of 6.6. Cusp targets are counted per cusp, so a cell touching several of the source cell\'s ideal vertices counts once for each.',
    })
  },
})
