// The horizon and flatness problems, read on the husk of the true {3,4,3,4} mesh (E-CSM-0058).
//
// THE QUESTION. In standard cosmology two problems ask for inflation. Horizon: regions of the sky that were never in
// causal contact since the big bang show one temperature. Flatness: space is flat to within a percent, which a decelerating
// universe makes an ever finer tuning of the early density. The ledger asks whether the model faces either, read on the
// husk (the screen), not in the bulk (the projector).
//
// THE HUSK. On the true mesh the husk is the cusp layer of one ideal vertex: the cells touching it, whose centers lie on
// one horosphere (E-NVG-0014). The seed is the base 24-cell the mesh unfolds from (E-GMT-0027). It touches all 24 of its
// ideal vertices, so it is itself a husk dock, at skin 0.
//
// DERIVATION, before any gate run.
//  1. Flatness is geometry, not tuning. A horosphere of hyperbolic space is intrinsically Euclidean, and the cells
//     touching one ideal vertex of {3,4,3,4} tile it as the cubic lattice (E-NVG-0014 found degree 6 and cubic shells).
//     There is no density, no parameter and no epoch in this: every cusp is equivalent under the cell's symmetries, and
//     the flatness holds exactly at every size, so nothing needs tuning and nothing can drift. The contrast is the bulk,
//     whose shells grow by 18.28 (E-GMT-0027): the same mesh is strongly curved, and only its horospheres are flat.
//  2. The horizon problem cannot arise for a husk grown from one seed. The rule moves nothing faster than one cell per
//     beat (E-NVG-0014: no arrival beats the cell-graph distance). So at beat T the only husk docks the seed has reached
//     lie within T of it, and between any two of them the seed itself is a common causal ancestor: seed(base) = 0 and
//     d(base, a), d(base, b) <= T. In standard cosmology the problem comes from a start everywhere at once, where two
//     points farther apart than twice the elapsed time share no past. The model's start is one distinction, not a
//     surface, so its husk is at every beat exactly the seed's reach, and it contains no causally disconnected pair.
//  3. The cusp gives no shortcut (E-NVG-0014: bulk distance equals skin distance between cells of one cusp), so the
//     seed's reach on the husk is the cubic l1 ball: the husk docks reached by beat T are those of skin at most T.
//  4. What this does NOT settle: that the reached docks are uniform (thermal agreement is a separate question, of
//     mixing, not of causal access), and the expansion history, which is not read on the husk.
//
// GATES, fixed before the gate run:
//  F1 the husk is flat: on the cusp layer to skin 8, every cell with a complete layer neighbourhood has 6 layer
//     neighbours, the layer's shells are the cubic lattice's (1, 6, 18, 38, 66, 102, 146, 198, 258), and every center
//     lies on one horosphere (Busemann level spread < 1e-9)
//  F2 the contrast: the bulk ball's shells are 1, 24, 456, 8376, 153192 (E-GMT-0027's exponential growth), so the flat
//     husk sits in a curved mesh
//  H1 the seed's reach on the husk is the skin ball: every husk dock inside the radius-4 ball has seed distance equal to
//     its skin (129 of 129), so the docks reached by beat T are exactly the cubic l1 ball of radius T
//  H2 no horizon: at each beat T = 1 .. 4, every pair of husk docks the seed has reached shares a nonempty causal past
//     (some cell c with seed(c) + max(d(c, a), d(c, b)) <= T)
//  C1 the control, a start everywhere at once (every cell present at beat 0, no seed): at beat 1, among the 25 husk docks
//     of skin at most 2, a pair shares no past exactly when their distance exceeds 2, and such pairs exist
// Verdict: pass if all hold. H2 and C1 together are the claim: the model's single-seed start has no horizon problem,
// and the problem appears as soon as the start is a surface.
//
// Reported, not gated: the smallest shared past (count and fraction of a's past) at T = 4 against the pair's separation.
//
// DISCLOSED: probe tmp/hc-probe1 (before this file) built the radius-4 ball (162,049 cells, 17 s), the cusp layer to skin
// 8 (833 cells, degree 6, spread 1.7e-12), and read the husk docks' seed distances (equal to skin at every one of 129)
// and the reach counts 1, 7, 25, 63, 129. F1, F2 and H1 are confirmations of that probe and of E-NVG-0014 here.
//
// FIRST RUN (tmp/hc-exp12-run1.log, 21 s): pass, every gate, recorded as is. 8,256 pairs of reached docks at beat 4, 0
// disjoint, the fewest shared cells 1 (the seed alone, at separation 6 to 8); the control leaves 171 of 300 pairs with
// no shared past at beat 1, exactly those farther apart than 2. Title written after the run.
//
// Depth L2: a derivation from the rule's speed limit and the mesh's geometry, measured on the true mesh.
// DETERMINISM: no start is drawn; the mesh and its distances are exact. NOTHING MOVES: a slot takes its neighbor's value.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildHyperbolicBall, cuspLayer, labelledCoin } from '@/code/substrate/coxeter/label-transport'
import { CANONICAL_SHELLS } from '@/code/substrate/mesh-unfolding'
import { countBoth, countMask, cubicBall, cubicShell, distancesFrom, huskDocks, pastMask } from '@/code/measure/husk-cosmology'

const RADIUS = 4
const SKIN = 8
const CONTROL_SKIN = 2

export function huskHorizonRun() {
  const started = Date.now()
  const coin = labelledCoin()
  const ball = buildHyperbolicBall({ coin, radius: RADIUS })
  const layer = cuspLayer({ coin, skinRadius: SKIN })

  // ---- F1, F2 ----
  const layerShells = new Array<number>(SKIN + 1).fill(0)

  for (const s of layer.skin.values()) layerShells[s] = (layerShells[s] ?? 0) + 1

  const f1 = layer.layerDegree.every(d => d === 6) && layerShells.every((n, s) => n === cubicShell(s)) && layer.levelSpread < 1e-9
  const bulkShells = new Array<number>(RADIUS + 1).fill(0)

  for (const d of ball.distance) bulkShells[d] = (bulkShells[d] ?? 0) + 1

  const f2 = bulkShells.every((n, r) => n === CANONICAL_SHELLS[r])

  // ---- H1: the seed's reach on the husk ----
  const docks = huskDocks({ ball, layer })
  const seedEqualsSkin = docks.filter(h => ball.distance[h.cell] === h.skin).length
  const reach = Array.from({ length: RADIUS + 1 }, (_, t) => docks.filter(h => (ball.distance[h.cell] as number) <= t).length)
  const h1 = seedEqualsSkin === docks.length && docks.length === cubicBall(RADIUS) && reach.every((n, t) => n === cubicBall(t))

  // ---- H2: every pair of reached husk docks shares a causal past ----
  const from = new Map<number, Int16Array>()

  for (const h of docks) from.set(h.cell, distancesFrom({ ball, source: h.cell, limit: 2 * RADIUS }))

  const perBeat = Array.from({ length: RADIUS }, (_, i) => {
    const T = i + 1
    const reached = docks.filter(h => (ball.distance[h.cell] as number) <= T)
    const masks = reached.map(h => pastMask({ seed: ball.distance, from: from.get(h.cell) as Int16Array, beat: T }))
    let pairs = 0
    let disjoint = 0
    let fewest = Infinity
    let fewestFraction = Infinity
    const bySeparation = new Map<number, { fewest: number; fraction: number }>()

    for (let a = 0; a < reached.length; a++) {
      const own = countMask(masks[a] as Uint8Array)

      for (let b = a + 1; b < reached.length; b++) {
        const shared = countBoth(masks[a] as Uint8Array, masks[b] as Uint8Array)
        const separation = (from.get((reached[a] as { cell: number }).cell) as Int16Array)[(reached[b] as { cell: number }).cell] as number
        const fraction = shared / own

        pairs++
        if (shared === 0) disjoint++
        fewest = Math.min(fewest, shared)
        fewestFraction = Math.min(fewestFraction, fraction)

        const was = bySeparation.get(separation) ?? { fewest: Infinity, fraction: Infinity }

        bySeparation.set(separation, { fewest: Math.min(was.fewest, shared), fraction: Math.min(was.fraction, fraction) })
      }
    }

    return { T, docks: reached.length, pairs, disjoint, fewest, fewestFraction, bySeparation }
  })
  const h2 = perBeat.every(b => b.disjoint === 0 && b.pairs > 0)

  // ---- C1: a start everywhere at once ----
  const near = docks.filter(h => h.skin <= CONTROL_SKIN)
  const everywhere = new Int32Array(ball.cells)
  const controlMasks = near.map(h => pastMask({ seed: everywhere, from: from.get(h.cell) as Int16Array, beat: 1 }))
  let controlPairs = 0
  let controlDisjoint = 0
  let controlAgree = 0

  for (let a = 0; a < near.length; a++) {
    for (let b = a + 1; b < near.length; b++) {
      const shared = countBoth(controlMasks[a] as Uint8Array, controlMasks[b] as Uint8Array)
      const separation = (from.get((near[a] as { cell: number }).cell) as Int16Array)[(near[b] as { cell: number }).cell] as number

      controlPairs++
      if (shared === 0) controlDisjoint++
      if ((shared === 0) === separation > 2) controlAgree++
    }
  }

  const c1 = controlAgree === controlPairs && controlDisjoint > 0
  const status = f1 && f2 && h1 && h2 && c1 ? 'pass' : 'fail'
  const last = perBeat[perBeat.length - 1] as (typeof perBeat)[number]
  const separations = [...last.bySeparation.entries()].sort((p, q) => p[0] - q[0])

  return verdict({
    status,
    claim: `on the true {3,4,3,4} mesh the husk (the cusp layer of one ideal vertex) is flat by geometry: ${layer.members.length} cells to skin ${SKIN}, every complete one with 6 layer neighbours, shells ${layerShells.join(', ')} (the cubic lattice's), one horosphere to ${layer.levelSpread.toExponential(1)}, inside a bulk whose shells are ${bulkShells.join(', ')}; the seed's reach on it is the cubic l1 ball (${reach.join(', ')} docks by beats 0 to ${RADIUS}, seed distance equal to skin at ${seedEqualsSkin} of ${docks.length}), and at every beat 1 to ${RADIUS} every pair of reached docks shares a causal past (${perBeat.map(b => `${b.pairs} pairs at T ${b.T}, ${b.disjoint} disjoint`).join('; ')}); a start everywhere at once instead leaves ${controlDisjoint} of ${controlPairs} pairs of the ${near.length} docks of skin at most ${CONTROL_SKIN} with no shared past at beat 1, exactly those farther apart than 2`,
    metrics: {
      gate_F1: f1 ? 1 : 0,
      gate_F2: f2 ? 1 : 0,
      gate_H1: h1 ? 1 : 0,
      gate_H2: h2 ? 1 : 0,
      gate_C1: c1 ? 1 : 0,
      layerCells: layer.members.length,
      layerLevelSpread: layer.levelSpread,
      huskDocksInBall: docks.length,
      seedEqualsSkin,
      ...Object.fromEntries(reach.map((n, t) => [`reachBeat${t}`, n])),
      ...Object.fromEntries(perBeat.map(b => [`disjointPairsBeat${b.T}`, b.disjoint])),
      sharedFewestBeat4: last.fewest,
      sharedFewestFractionBeat4: last.fewestFraction,
      controlPairs,
      controlDisjoint,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      everywhereStartHasHorizon: c1 ? 1 : 0,
      bulkIsCurved: f2 ? 1 : 0,
    },
    notes: `L2. Gates F1 ${f1}, F2 ${f2}, H1 ${h1}, H2 ${h2}, C1 ${c1}. Ball radius ${RADIUS}: ${ball.cells} cells, closes exactly ${ball.returnsExactly}, frame mismatch ${ball.frameMismatch.toExponential(1)}. Per beat (reached docks, pairs, disjoint, fewest shared cells, smallest shared fraction of a's past): ${perBeat.map(b => `T ${b.T}: ${b.docks}, ${b.pairs}, ${b.disjoint}, ${b.fewest}, ${b.fewestFraction.toFixed(4)}`).join('; ')}. At T ${RADIUS}, by separation (fewest shared cells, smallest fraction): ${separations.map(([d, v]) => `${d}: ${v.fewest}, ${v.fraction.toFixed(4)}`).join('; ')}. At the largest separation, 2T, the shared past is the seed alone: the two docks sit at opposite edges of the seed's reach. The control keeps the same distances and removes only the seed's timing. Not settled here: whether the reached docks agree in temperature (mixing, not causal access), and the husk's expansion history, which is not read. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'cosmology/husk-horizon-flatness',
  code: 'E-CSM-0058',
  title:
    'the horizon and flatness problems read on the husk of the true {3,4,3,4} mesh, pass: the husk (the cusp layer of one ideal vertex) is flat by geometry, not tuning (833 cells to skin 8, degree 6, the cubic lattice\'s shells, one horosphere to 1.7e-12, inside a bulk growing 1, 24, 456, 8376, 153192); the seed\'s reach on it is exactly the cubic l1 ball (1, 7, 25, 63, 129 docks by beats 0 to 4), and at every beat every pair of reached husk docks shares a causal past, while a start everywhere at once leaves every pair farther apart than twice the elapsed time with none, so a single-seed start has no horizon problem and no flatness problem; the thermal uniformity of the reached docks and the expansion history are not read',
  category: 'cosmology',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run: huskHorizonRun,
})
