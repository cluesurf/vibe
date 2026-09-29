// Inflation or its replacement: the husk's own growth rate at the earliest beats of the true {3,4,3,4} mesh
// (E-CSM-0059).
//
// THE QUESTION. The wake grows by 18.279 per shell (E-GMT-0027), exponential, and the ledger names it as a candidate
// for inflation. But physics is read on the husk, not in the bulk: the question is how fast the HUSK the seed has
// reached grows, beat by beat, at the earliest beats, whether that growth is exponential, and for how many e-folds.
//
// DERIVATION, before the gate run. The seed is the base cell, a husk dock of the cusp read (skin 0). Nothing moves
// faster than one cell per beat (E-NVG-0014), and between cells of one cusp the bulk distance is the skin distance at
// every separation (E-NVG-0014's step certificate). So the husk docks the seed reaches by beat t are those of skin at
// most t, and the cusp layer is the cubic lattice, so their number is the cubic l1 ball, V(t) = (2t + 1)(2t^2 + 2t +
// 3) / 3: 1, 7, 25, 63, 129, 231, 377, 575, 833. That is cubic, not exponential: the per-beat growth ln V(t) - ln V(t -
// 1) is 1.95, 1.27, 0.92, 0.72, 0.58, ... and falls as 3 / t. It exceeds one e-fold per beat only at t = 1 and 2, for a
// total of ln 25 = 3.22 e-folds, against the tens that inflation needs. The bulk seed cone meanwhile grows by 18.28 a
// beat, 2.9 e-folds each beat without end: the exponential room is volume, filled off the husk. E-CSM-0049 read the
// same contrast on a stand-in tree; this reads it on the true mesh, from the seed, in the rule's own beats.
//
// What does inflation's job then. Its two jobs are the horizon and flatness problems, and E-CSM-0058 finds the husk has
// neither (one seed, a horosphere). So the model's replacement for inflation is its start and its geometry, not a
// period of husk growth. Its third job, a nearly scale-invariant spectrum of ripples, is not addressed here.
//
// GATES, fixed before the gate run:
//  G1 the seed's reach on the husk, measured in the radius-4 ball: 1, 7, 25, 63, 129 husk docks by beats 0 to 4, each
//     at seed distance equal to its skin
//  G2 beyond the ball, the cusp layer to skin 8 has the cubic lattice's shells, so with the certificate the reach is
//     V(t) for t <= 8 (833 docks by beat 8); the per-beat growth falls monotonically and is below 0.5 e-fold
//     by beat 8
//  C1 the control, the bulk seed cone in the same beats: 1, 24, 456, 8376, 153192 cells, per-beat growth within 0.1
//     of ln 18.28 = 2.906 at beats 3 and 4 (sustained, exponential)
// Verdict: pass if all hold, which says the husk does NOT inflate: the claim is the negative, and the gates are the
// measurement that makes it one.
//
// DISCLOSED: probe tmp/hc-probe1 read the reach counts 1, 7, 25, 63, 129 before this file.
//
// FIRST RUN (tmp/hc-exp12-run1.log, 16 s): pass, every gate, recorded as is. Husk rate at beat 8 0.371 e-folds, bulk
// rate at beat 4 2.907 against 2.906. Title written after the run.
//
// Depth L2. DETERMINISM: the mesh is exact and nothing is drawn. NOTHING MOVES: a slot takes its neighbor's value.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildHyperbolicBall, cuspLayer, labelledCoin } from '@/code/substrate/coxeter/label-transport'
import { CANONICAL_SHELLS } from '@/code/substrate/mesh-unfolding'
import { cubicBall, cubicShell, huskDocks } from '@/code/measure/husk-cosmology'

const RADIUS = 4
const SKIN = 8
const LN_WARP = Math.log(18.278)

export function huskGrowthRun() {
  const started = Date.now()
  const coin = labelledCoin()
  const ball = buildHyperbolicBall({ coin, radius: RADIUS })
  const layer = cuspLayer({ coin, skinRadius: SKIN })
  const docks = huskDocks({ ball, layer })

  // ---- G1 ----
  const reach = Array.from({ length: RADIUS + 1 }, (_, t) => docks.filter(h => (ball.distance[h.cell] as number) <= t).length)
  const g1 = docks.every(h => ball.distance[h.cell] === h.skin) && reach.every((n, t) => n === cubicBall(t))

  // ---- G2 ----
  const layerShells = new Array<number>(SKIN + 1).fill(0)

  for (const s of layer.skin.values()) layerShells[s] = (layerShells[s] ?? 0) + 1

  const cumulative = layerShells.map((_, s) => layerShells.slice(0, s + 1).reduce((a, b) => a + b, 0))
  const cubic = layerShells.every((n, s) => n === cubicShell(s))
  const rate = cumulative.map((v, t) => (t === 0 ? NaN : Math.log(v / (cumulative[t - 1] as number))))
  const falling = rate.slice(2).every((r, i) => r < (rate[i + 1] as number))
  const g2 = cubic && cumulative.every((v, t) => v === cubicBall(t)) && falling && (rate[SKIN] as number) < 0.5
  const eFoldBeats = rate.filter(r => r >= 1).length
  const eFolds = Math.log(cumulative[eFoldBeats] as number)

  // ---- C1 ----
  const bulk = new Array<number>(RADIUS + 1).fill(0)

  for (const d of ball.distance) bulk[d] = (bulk[d] ?? 0) + 1

  const bulkCone = bulk.map((_, t) => bulk.slice(0, t + 1).reduce((a, b) => a + b, 0))
  const bulkRate = bulkCone.map((v, t) => (t === 0 ? NaN : Math.log(v / (bulkCone[t - 1] as number))))
  const c1 = bulk.every((n, r) => n === CANONICAL_SHELLS[r]) && [3, 4].every(t => Math.abs((bulkRate[t] as number) - LN_WARP) <= 0.1)
  const status = g1 && g2 && c1 ? 'pass' : 'fail'

  return verdict({
    status,
    claim: `on the true {3,4,3,4} mesh the husk the seed reaches grows as the cubic l1 ball, not exponentially: ${cumulative.join(', ')} husk docks by beats 0 to ${SKIN} (measured in the radius-${RADIUS} ball to beat ${RADIUS}, then by the cusp layer's cubic shells and E-NVG-0014's certificate), a per-beat growth of ${rate.slice(1).map(r => r.toFixed(3)).join(', ')} e-folds, above one e-fold per beat only at beats 1 to ${eFoldBeats} (${eFolds.toFixed(2)} e-folds in all); the bulk seed cone in the same beats holds ${bulkCone.join(', ')} cells, ${bulkRate.slice(1).map(r => r.toFixed(3)).join(', ')} e-folds a beat against ln 18.278 = ${LN_WARP.toFixed(3)}, so the exponential room is volume, off the husk`,
    metrics: {
      gate_G1: g1 ? 1 : 0,
      gate_G2: g2 ? 1 : 0,
      gate_C1: c1 ? 1 : 0,
      ...Object.fromEntries(cumulative.map((v, t) => [`huskReachBeat${t}`, v])),
      ...Object.fromEntries(bulkCone.map((v, t) => [`bulkConeBeat${t}`, v])),
      huskRateBeat8: rate[SKIN] as number,
      bulkRateBeat4: bulkRate[RADIUS] as number,
      eFoldBeats,
      eFolds,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      bulkSustainsExponential: c1 ? 1 : 0,
    },
    notes: `L2. Gates G1 ${g1}, G2 ${g2}, C1 ${c1}. The husk's rate falls as about 3 / t (a cubic), the bulk's holds at ln 18.28: after 4 beats the husk holds ${cumulative[4]} docks and the cone ${bulkCone[4]} cells, a ratio of ${((bulkCone[4] as number) / (cumulative[4] as number)).toFixed(0)}. What the model has in inflation's place: its start (one seed) and its geometry (a horosphere) do the horizon and flatness jobs (E-CSM-0058). The scale-invariant ripple spectrum is not read here. The continuum horospherical metric ds^2 = dz^2 + e^(2z) dx^2 has an exponential scale factor along the depth z, the flat slicing of de Sitter, but the cell graph realizes no shortcut along a cusp (E-NVG-0014), and depth is not the rule's time. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'cosmology/husk-growth-rate',
  code: 'E-CSM-0059',
  title:
    'the husk does not inflate, pass: on the true {3,4,3,4} mesh the husk the seed reaches grows as the cubic l1 ball, 1, 7, 25, 63, 129 docks by beats 0 to 4 (measured) and 833 by beat 8, a per-beat growth falling as 3 / t that exceeds one e-fold per beat only at beats 1 and 2 (3.22 e-folds in all), while the bulk seed cone grows 1, 25, 481, 8857, 162049 at ln 18.28 = 2.9 e-folds a beat without end: the exponential room is volume off the husk, so inflation\'s growth has no husk counterpart, and its horizon and flatness jobs are done by the single seed and the horosphere instead (E-CSM-0058)',
  category: 'cosmology',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run: huskGrowthRun,
})
