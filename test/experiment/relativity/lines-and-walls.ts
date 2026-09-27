// Line components and walls on the hub vacuum under the bounce collisions: which of E-RLT-0085's two structural
// failures a rule change could fix, and which are forced (E-RLT-0087).
//
// THE QUESTION. E-RLT-0085: under the lone bounce collision L the hub vacuum's lines stay 12 components (the committed
// knit's 3) and walls do not quantize (44,691 trits). Find the smallest change that reconnects lines through
// matter-matter meetings only, leaving the vacuum and the lone-vibe wake untouched, and lets walls form; or prove the
// two exclude each other.
//
// THE THEOREM (code/measure/line-locality). If (i) the vacuum visits only docks whose held lines are all full at every
// coin piece and (ii) the collision keeps every line of a dock holding full lines and at most one single, then one
// seed's difference from the vacuum stays on its own line forever, so the battery's vacuum line components are 12
// whatever the collision does with two or more singles. (ii) IS "the lone wake untouched" for L. So the component gate,
// which seeds ONE vibe, cannot see a matter-matter meeting and is forced to 12 by the constraint itself. Conversely, by
// momentum, a collision that moves a lone vibe off its line on such a dock must move a vacuum pair (the E-RLT-0080 to
// E-RLT-0082 wake). What the constraint leaves free is exactly the multi-single docks, and there L already applies K.
//
// THE WALL. The battery's wall gate asks that the settled difference between the half-late vacuum and the uniform one
// be whole sheets of side^3 docks. code/measure/wall-reading splits it into the IDEAL wall (each half its own exact
// vacuum) and the EXCITATION the interface makes. If the ideal difference is not a multiple of side^3 at every settled
// beat, no collision that keeps the vacuum can pass the gate.
//
// Gates, fixed before this file ran (after the probe tmp/sym-wall-probe2.ts, disclosed):
//  T1 exhaustively over every dock with only full lines and at most one single (53,248 occupations), L and B keep every
//     line (0 crossing), and the control K moves a line on some of them (the check has teeth)
//  T2 condition (i): on the side-8 hub vacuum, 0 dock-beats hold a single at a coin piece over 24 beats, for L, B, K
//  T3 on side 8 the 24 single seeds of the center dock touch 0 trits off their own line under L and B (12 components),
//     and more than 0 under K
//  M  matter-matter meetings reconnect the lines under L: two seeds on two lines of one dock (264 pairs) reach lines
//     beyond their own on some pairs, and those pairs join all 12 lines into fewer than 12 components
//  W  walls form under L: at each of four anchors the settled excitation is time-periodic with period at most 24
//     and the ideal wall is whole sheets at every settled beat
// Verdict: pass if every gate holds; fail if T1, T2, T3 and M hold and W does not; partial otherwise.
//
// PREDICTED (from the probe): T1 to T3 and M hold; W fails on both clauses, and fails the same way under K and B.
//
// FIRST RUN (51 s): fail as predicted, recorded as is, no gate moved; title written after the run. T1 to T3 and M
// hold. W fails on both clauses at all four anchors: the IDEAL wall differs from the uniform vacuum by 23,328 to 31,104
// trits, not whole sheets at every beat (the hub vacuum's one-beat-late phase does not differ from it on every dock), so
// the battery's wallsQuantized gate cannot pass on this vacuum under ANY collision that keeps the vacuum; and the
// interface's excitation (39,000 to 42,000 trits on 68 to 79 percent of the docks, all 12 layers, no period in 24)
// is the same under L, B and K to 1 percent: the wall failure is the hub vacuum's, not the lone collision's. Under L
// the strays the interface makes never die (a lone vibe passes every vacuum dock), under K they avalanche; neither
// settles. B, which bounces even two singles off each other, reconnects nothing (0 of 264 pairs).
//
// Depth L2. DETERMINISM: exhaustive occupations, fixed seeds and anchors, integer trit counts, no draw.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lineLocality } from '@/code/measure/line-locality'
import { centerOf, hubSetup, pairSeedComponents, seedWake, vacuumSingleDocks, wallReading, type WallReading } from '@/code/measure/wall-reading'
import { d4BoxCell } from '@/code/substrate/d4-box'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'

const KINDS: CollisionKind[] = ['lone', 'bounce', 'isometric']

export default experiment({
  id: 'relativity/lines-and-walls',
  code: 'E-RLT-0087',
  title:
    "line components and walls on the hub vacuum under the bounce collisions, fail on walls as predicted: keeping the lone wake FORCES 12 vacuum line components (a theorem: every dock with full lines and at most one single keeps its lines under L and B, 0 of 53,248 exhaustive occupations cross, K 48,960; the vacuum never holds a single, 0 of 98,304 dock-beats; one seed touches 0 trits off its line against K's 2,223,551), while matter-matter meetings already reconnect the lines under L (160 of 264 two-seed pairs reach other lines, 1 component), so no rule change is needed there and the one-seed gate cannot see it; walls do not form under L, B or K alike (excitation 39,000 to 42,000 trits on 68 to 79 percent of docks, no period, four anchors), and the gate is unpassable on this vacuum by any vacuum-keeping rule because the ideal wall itself is not whole sheets (23,328 to 31,104 trits)",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const locality = Object.fromEntries(KINDS.map(k => [k, [0, 1, 2].map(s => lineLocality(k, s))]))
    const t1 = (['lone', 'bounce'] as const).every(k => locality[k]![0]!.crossing === 0 && locality[k]![1]!.crossing === 0) && locality.isometric![1]!.crossing > 0
    const side = 8
    const center = centerOf(side)
    const per = Object.fromEntries(
      KINDS.map(k => {
        const s = hubSetup(side, k, center)

        return [k, { singles: vacuumSingleDocks(s, 24), seed: seedWake(s, center, 24), pairs: pairSeedComponents(s, center, 24) }]
      }),
    )
    const t2 = KINDS.every(k => per[k]!.singles.withSingle === 0)
    const t3 = per.lone!.seed.offLine === 0 && per.bounce!.seed.offLine === 0 && per.isometric!.seed.offLine > 0
    const m = per.lone!.pairs.crossing > 0 && per.lone!.pairs.components < 12
    const anchors = [0, d4BoxCell({ coordinates: [1, 0, 0, 0], side: 12 }), d4BoxCell({ coordinates: [0, 2, 1, 0], side: 12 }), centerOf(12)]
    const walls: Record<string, WallReading[]> = Object.fromEntries(KINDS.map(k => [k, anchors.map(a => wallReading(hubSetup(12, k, a)))]))
    const idealWhole = (w: WallReading): boolean => w.ideal.every(x => x % w.sheet === 0)
    const w = walls.lone!.every(r => r.period > 0 && idealWhole(r))
    const status = t1 && t2 && t3 && m ? (w ? 'pass' : 'fail') : 'partial'
    const range = (xs: number[]): string => `${Math.min(...xs)}..${Math.max(...xs)}`
    const wallText = (k: string): string =>
      walls[k]!.map((r, i) => `anchor ${anchors[i]}: gate ${range(r.gate)}, ideal ${range(r.ideal)} (whole sheets ${idealWhole(r)}), excitation ${range(r.excitation)} trits on ${range(r.excitationDocks)} docks, layers ${r.layers.length} of 12, period ${r.period}`).join('; ')
    const metrics: Record<string, number> = { gateT1: t1 ? 1 : 0, gateT2: t2 ? 1 : 0, gateT3: t3 ? 1 : 0, gateM: m ? 1 : 0, gateW: w ? 1 : 0 }

    for (const k of KINDS) {
      locality[k]!.forEach((c, s) => {
        metrics[`${k}_singles${s}_cases`] = c.cases
        metrics[`${k}_singles${s}_crossing`] = c.crossing
        metrics[`${k}_singles${s}_fullMoved`] = c.fullMoved
      })
      metrics[`${k}_vacuumSingleDockBeats`] = per[k]!.singles.withSingle
      metrics[`${k}_seedOffLine`] = per[k]!.seed.offLine
      metrics[`${k}_seedComponents`] = per[k]!.seed.components
      metrics[`${k}_seedLargestWake`] = per[k]!.seed.largestWake
      metrics[`${k}_pairCrossing`] = per[k]!.pairs.crossing
      metrics[`${k}_pairComponents`] = per[k]!.pairs.components
      walls[k]!.forEach((r, i) => {
        metrics[`${k}_wall${i}_excitationMax`] = Math.max(...r.excitation)
        metrics[`${k}_wall${i}_excitationDocksMax`] = Math.max(...r.excitationDocks)
        metrics[`${k}_wall${i}_idealWhole`] = idealWhole(r) ? 1 : 0
        metrics[`${k}_wall${i}_period`] = r.period
      })
    }

    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `on the hub vacuum a single seed stays on its line under L and B (${per.lone!.seed.offLine} and ${per.bounce!.seed.offLine} trits off it; K ${per.isometric!.seed.offLine}), forced by keeping the lone wake, while two seeds meeting on one dock reach other lines under L on ${per.lone!.pairs.crossing} of ${per.lone!.pairs.pairs} pairs (${per.lone!.pairs.components} components); walls ${w ? 'form' : 'do not form'} under L`,
      metrics,
      notes: `L2. Gates: T1 ${t1}, T2 ${t2}, T3 ${t3}, M ${m}, W ${w}. Locality (occupations with 0, 1, 2 singles; crossing, full moved): ${KINDS.map(k => `${k} ${locality[k]!.map(c => `${c.cases}/${c.crossing}/${c.fullMoved}`).join(' ')}`).join('; ')}. Side 8: ${KINDS.map(k => `${k} vacuum single dock-beats ${per[k]!.singles.withSingle} of ${per[k]!.singles.checked}, seed off-line ${per[k]!.seed.offLine} (components ${per[k]!.seed.components}, largest wake ${per[k]!.seed.largestWake}), pair seeds crossing ${per[k]!.pairs.crossing} of ${per[k]!.pairs.pairs} (components ${per[k]!.pairs.components})`).join('; ')}. Walls, side 12, sheet 1,728: ${KINDS.map(k => `${k}: ${wallText(k)}`).join(' | ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
