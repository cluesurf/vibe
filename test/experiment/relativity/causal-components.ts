// Causal components: the one-seed component gate redefined by the copy history (E-RLT-0089).
//
// THE USER'S DECISION (2026-09-26). The old component gate joined two lines when a seeded run's STATE differed from
// the vacuum's on them (code/measure/weave-acceptance lineSectors, code/measure/husk-hydro coldLineSectors and
// huskComponents, code/measure/wall-reading seedWake), which is wrong for a dock-varying vacuum. The new rule: two
// docks are connected when they AROSE FROM EACH OTHER, a chain of copy events in the run's history linking them (one
// dock's value copied from the other's, directly or through intermediates). A matter meeting across a boundary is one
// case. Pass is exactly one causal component: every husk dock descends from the seed.
//
// THE INSTRUMENT (code/measure/causal-components). Every knit here beats as collide, then stream. The collision never
// reads another dock, so the only copies between docks are the stream's: slot (x, d) copied into
// (neighbour(x, d), d). The replay runs the rule's own collision, reads the slots between the two steps, and logs
// every slot holding a vibe (love or fear, with its store or point) as a copy from its dock into the next, keeping a
// per-beat record of which docks each dock's new value came from. Union-find over those copies, in the bulk and on the
// husk (a husk dock is a column; two husk docks are joined when any bulk copy joins their columns).
//
// A CHOICE MADE HERE, stated before the run: the gate counts CONTENT copies, love or fear. Calm is a vibe too, and the
// stream copies a calm slot every beat, but counting calm makes the graph the box's own neighbour graph for every knit
// and every state (everyCopyCounts: 1 on any connected box, 2 with a cut), so it cannot tell one knit from another. It
// is reported beside as the every-copy count. If the user means calm to count, every knit here passes by construction.
//
// Gates, fixed before this file ran (after the probes tmp/rlt089-probe.ts and rlt089-probe2.ts, disclosed below):
//  C0 the instrument: the D4 box's step along every direction is its root modulo the periods (0 errors, sides 5 and
//     8); the replay equals the rule's own beat trit for trit on every beat (the hub vacuum under L with and without a
//     seed through bounceRunner, the rich cold knit seeded through coldQuaternionBeat, the committed knit's vacuum
//     through code/rule/lattice-gas beat, 24 beats each, at integer+0); the fresh hub setup runs identically to
//     code/measure/wall-reading's hubSetup at integer+0 (24 beats)
//  C1 the controls separate on every one of the 17 starts: an all-love uniform fill under the committed knit and
//     under the rich cold knit reads exactly 1 husk and 1 bulk component; the same fill with a planted cut (the box
//     split by the husk coordinate v0, every crossing slot reflected into its own dock, so no copy crosses) reads
//     exactly 2 and 2. If they do not separate, the gate is uninformative
//  G  per knit, on each of E-MTH-0028's 17 starts: a single seed at the center (each of the 24 slots flipped in turn,
//     as the old gate) on the knit's vacuum, 24 beats; the knit's reading at a start is the LARGEST husk component
//     count over the 24 seeds; the knit passes when that reading is exactly 1 on all 17 starts. Judged knits:
//      H the hub vacuum under the lone bounce collision L, side 8 (E-RLT-0084 to 0088)
//      R E-RLT-0056's rich cold quaternion knit, side 5
//      V E-RLT-0057's cold knit on the chosen frozen-free group, side 5
// Beside, never gates: the vacuum alone (24 and 96 beats for H); the husk docks descending from the seed; the
// matter-only count (copies of slots that differ from the unseeded vacuum); the every-copy count; the OLD state-match
// counts (replicated here per start, and the old functions at integer+0); the dense backgrounds of R and V; the
// committed and combined knits; H under B and K; H with the planted cut; H's 264 two-seed pairs (E-RLT-0087's matter
// meetings) at integer+0.
// Verdict: pass if C0, C1 and G on H, R and V; partial if C0, C1 and G on at least one of them; fail otherwise (C0 or
// C1 failing makes the gate unverified or uninformative; C0 and C1 holding with G on none says the instrument works
// and the three knits are causally disconnected).
//
// PREDICTED from the probes (integer+0 only): C0 and C1 hold (uniform 1, cut 2; every-copy 1 and 2); the hub vacuum
// alone reads 65 husk components (769 bulk) at 24, 48 and 96 beats under L, B and K alike, so H fails; a seed on R's
// still vacuum reaches 5 husk docks and leaves 121 components, so R fails, and V the same by the lone lemma. So: fail.
//
// FIRST RUN (84 s, tmp/rlt089-run1.log): fail as predicted, no gate moved. C0 holds (0 step errors, 0 of 96 replay
// beats differ, the fresh hub equals hubSetup); C1 holds on all 17 starts (uniform 1 and 1, cut 2 and 2; every-copy 1,
// cut 2). G fails on H, R and V on every start, every number identical over the 17 starts: H 65 husk (largest over the
// seeds; smallest 61), vacuum alone 65 husk and 769 bulk (one component of 3,328 docks and 768 singletons; on the husk
// one of 448 and 64 single columns); R and V copy no content in the vacuum (0 copies), a seed's descent reaches 5 husk
// docks, 121 components. The committed and combined knits read 1 on all 17 (not judged). The old reading replicated
// here equals the old functions (R, V 12 and 9, committed 3 and 1, H 12). AFTER THE FIRST RUN, and disclosed: the
// per-beat record's beside metric read beat 95 only, which copied nothing; it was widened to all 96 beats, and the
// hub singletons' stores were added. Both are beside metrics, and the title was written after the run.
// SECOND RUN (80 s, tmp/rlt089-run2.log): identical in every gated and earlier number. The widened record: the hub
// vacuum copies a vibe into at most 3,072 of 4,096 docks at one beat, copies nothing at 32 of 96 beats, and a dock's
// value comes from at most 24 docks; its 768 singleton docks hold NO store (all 3,072 store docks are connected), so
// the 64 cut-off columns are the empty docks of the hub pattern, which no vacuum pair ever streams through.
//
// DETERMINISM: no random numbers; seeds are every slot of the center dock, starts are E-MTH-0028's family, the dense
// fill is the integer Weyl sequence (i + 1) 40503 mod 2^16. Every count is an exact integer. Depth L2.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { d4BoxMesh, linearMapOf } from '@/code/substrate/d4-box'
import { beat as toneBeat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'
import { COMBINED_DEFAULT, combinedCollision } from '@/code/rule/combined-knit'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { coldQuaternionBeat, emptyColdState, makeColdQuaternionKnit, makeColdQuaternionLattice, quaternionScatter, type ColdQuaternionKnit } from '@/code/rule/cold-quaternion-knit'
import { rotationMaps, scatterMoves, type ScatterSet } from '@/code/rule/cold-scatter'
import { bounceRunner } from '@/code/measure/bounce-pair-kernel'
import { centerOf, emptyOf, hubSetup, seedWake } from '@/code/measure/wall-reading'
import { forcedForms, groupTable, leastRankGroups, rowBasis } from '@/code/measure/color-isotropy-bound'
import { forcedIsotropySpread, unitSamples } from '@/code/measure/coarse-modes'
import { lineSectors, type ScheduledRule } from '@/code/measure/weave-acceptance'
import { coldLineSectors, huskComponents } from '@/code/measure/husk-hydro'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  boxHusk,
  causalRun,
  coldReplay,
  componentCount,
  componentSizes,
  copySources,
  cutTarget,
  everyCopyCounts,
  forest,
  hubFresh,
  hubReplay,
  hubVacuum,
  inverseTarget,
  join,
  rootOf,
  streamTarget,
  toneReplay,
  type BoxHusk,
  type Replay,
} from '@/code/measure/causal-components'
import { type Mesh } from '@/code/tool/mesh'

const ROOTS = rootsD4()
const BEATS = 24

// ---- the old reading's geometry: a line per direction pair, a husk direction per line ----

function lineGeometry(mesh: Mesh): { lineOf: number[]; huskOfLine: number[] } {
  const firsts = Array.from({ length: 24 }, (_, d) => d).filter(d => d < mesh.opposite(d))
  const lineOf = Array.from({ length: 24 }, (_, d) => firsts.indexOf(Math.min(d, mesh.opposite(d))))
  const keys: string[] = []
  const huskOfLine = firsts.map(d => {
    const r = ROOTS[d] ?? []
    const s = [r[0] ?? 0, r[1] ?? 0, r[2] ?? 0]
    const lead = s.find(x => x !== 0) ?? 1
    const k = s.map(x => x * lead).join(',')

    if (!keys.includes(k)) keys.push(k)

    return keys.indexOf(k)
  })

  return { lineOf, huskOfLine }
}

// ---- a knit, as the gate reads it ----

type Post = { vibe: Int32Array; slotExtra?: Int32Array; lineExtra?: Int32Array }

type Knit = {
  readonly name: string
  readonly mesh: Mesh
  readonly husk: BoxHusk
  readonly target: Int32Array
  readonly center: number
  // a run from the knit's vacuum (or `fill`), the center slot `seed` flipped when given
  make(seed: number | readonly number[] | undefined, fill?: 'uniform' | 'dense'): { replay: Replay; post: () => Post }
}

const flip = (v: number): number => (v === 1 ? -1 : 1)

// flip the center dock's seed slots (one seed, or two for a matter meeting)
function plant(vibe: Int8Array, center: number, seed: number | readonly number[] | undefined): void {
  const slots = seed === undefined ? [] : typeof seed === 'number' ? [seed] : seed

  for (const d of slots) vibe[center * 24 + d] = flip(vibe[center * 24 + d] as number)
}

function weylTrit(i: number): number {
  const w = Math.imul(i + 1, 40503) & 0xffff

  return w < 13107 ? -1 : w >= 52429 ? 1 : 0
}

function hubKnit(side: number, kind: CollisionKind): Knit {
  const h = hubFresh(side, kind)
  const husk = boxHusk(h.mesh, side)
  const center = centerOf(side)

  return {
    name: `hub-${kind}`,
    mesh: h.mesh,
    husk,
    target: streamTarget(h.mesh),
    center,
    make(seed, fill) {
      const start = hubVacuum(h)

      if (fill === 'uniform') start.vibe.fill(1)
      plant(start.vibe, center, seed)

      const replay = hubReplay(h.kernel, start)

      return {
        replay,
        post: () => ({ vibe: Int32Array.from(replay.state().vibe), lineExtra: Int32Array.from(replay.state().store) }),
      }
    },
  }
}

function coldKnit(name: string, knitOf: () => ColdQuaternionKnit): Knit {
  const mesh = d4BoxMesh({ side: 5 })
  const husk = boxHusk(mesh, 5)
  const center = 2 * (1 + 5 + 25 + 125)

  return {
    name,
    mesh,
    husk,
    target: streamTarget(mesh),
    center,
    make(seed, fill) {
      const lattice = makeColdQuaternionLattice(mesh, knitOf())
      const start = emptyColdState(mesh)

      if (fill === 'uniform') start.vibe.fill(1)
      if (fill === 'dense') for (let i = 0; i < start.vibe.length; i++) start.vibe[i] = weylTrit(i)
      plant(start.vibe, center, seed)

      const replay = coldReplay(lattice, start)

      return { replay, post: () => ({ vibe: Int32Array.from(replay.state().vibe), slotExtra: Int32Array.from(replay.state().store) }) }
    },
  }
}

function toneKnit(name: string, rule: ScheduledRule): Knit {
  const mesh = d4BoxMesh({ side: 5 })
  const husk = boxHusk(mesh, 5)
  const center = 2 * (1 + 5 + 25 + 125)
  const opposite = Array.from({ length: 24 }, (_, d) => mesh.opposite(d))
  const forward = rule(opposite, true)

  return {
    name,
    mesh,
    husk,
    target: streamTarget(mesh),
    center,
    make(seed, fill) {
      const start = new Int8Array(mesh.cellCount * 24)

      if (fill === 'uniform') start.fill(1)
      if (fill === 'dense') for (let i = 0; i < start.length; i++) start[i] = weylTrit(i)
      plant(start, center, seed)

      const replay = toneReplay(mesh, forward, start)

      return { replay, post: () => ({ vibe: Int32Array.from(replay.data()) }) }
    },
  }
}

// ---- the reading of one knit at one start ----

type Reading = {
  // the gate: the largest husk count over the 24 seeds, and the smallest
  huskMax: number
  huskMin: number
  bulkMax: number
  bulkMin: number
  // the vacuum alone
  vacuumHusk: number
  vacuumBulk: number
  vacuumCopies: number
  // descent: the fewest and most husk docks a seed's descent reaches
  reachMin: number
  reachMax: number
  // matter only: the largest husk count and the most husk docks joined through matter
  matterHuskMin: number
  matterCopiesMax: number
  // the old state-match reading, replicated: bulk line components and husk direction components
  oldBulk: number
  oldHusk: number
}

function readKnit(k: Knit): Reading {
  const vac = k.make(undefined)
  const refPost: Post[] = []
  const vacuum = causalRun({ replay: vac.replay, husk: k.husk, target: k.target, beats: BEATS, keepFrames: true, onBeat: () => refPost.push(vac.post()) })
  const { lineOf, huskOfLine } = lineGeometry(k.mesh)
  const lines = forest(12)
  const reading: Reading = {
    huskMax: 0,
    huskMin: Number.POSITIVE_INFINITY,
    bulkMax: 0,
    bulkMin: Number.POSITIVE_INFINITY,
    vacuumHusk: vacuum.counts.husk,
    vacuumBulk: vacuum.counts.bulk,
    vacuumCopies: vacuum.counts.copies,
    reachMin: Number.POSITIVE_INFINITY,
    reachMax: 0,
    matterHuskMin: Number.POSITIVE_INFINITY,
    matterCopiesMax: 0,
    oldBulk: 0,
    oldHusk: 0,
  }

  for (let d = 0; d < 24; d++) {
    const run = k.make(d)
    const own = lineOf[d] as number
    const touched = new Set<number>([own])
    const result = causalRun({
      replay: run.replay,
      husk: k.husk,
      target: k.target,
      beats: BEATS,
      seedDock: k.center,
      reference: vacuum.frames,
      onBeat: t => {
        const a = run.post()
        const b = refPost[t] as Post

        for (let i = 0; i < a.vibe.length; i++) {
          if (a.vibe[i] !== b.vibe[i] || (a.slotExtra && a.slotExtra[i] !== b.slotExtra?.[i])) touched.add(lineOf[i % 24] as number)
        }

        if (a.lineExtra) {
          for (let i = 0; i < a.lineExtra.length; i++) {
            if (a.lineExtra[i] !== b.lineExtra?.[i]) touched.add(lineOf[LINE_FIRSTS[i % 12] as number] as number)
          }
        }
      },
    })
    const c = result.counts

    reading.huskMax = Math.max(reading.huskMax, c.husk)
    reading.huskMin = Math.min(reading.huskMin, c.husk)
    reading.bulkMax = Math.max(reading.bulkMax, c.bulk)
    reading.bulkMin = Math.min(reading.bulkMin, c.bulk)
    reading.reachMin = Math.min(reading.reachMin, c.reachedHusk)
    reading.reachMax = Math.max(reading.reachMax, c.reachedHusk)
    reading.matterHuskMin = Math.min(reading.matterHuskMin, c.matterHusk)
    reading.matterCopiesMax = Math.max(reading.matterCopiesMax, c.matterCopies)

    for (const l of touched) join(lines, l, own)
  }

  const husk9 = forest(9)

  for (let l = 0; l < 12; l++) join(husk9, huskOfLine[l] as number, huskOfLine[rootOf(lines, l)] as number)

  reading.oldBulk = componentCount(lines)
  reading.oldHusk = componentCount(husk9)

  return reading
}

// the controls on one knit: uniform fill, and the same with the planted cut
function controls(k: Knit): { uniform: [number, number]; cut: [number, number]; every: [number, number]; everyCut: [number, number] } {
  const cut = cutTarget(k.mesh, k.husk, k.target)
  const u = causalRun({ replay: k.make(undefined, 'uniform').replay, husk: k.husk, target: k.target, beats: BEATS }).counts
  const c = causalRun({ replay: k.make(undefined, 'uniform').replay, husk: k.husk, target: cut, beats: BEATS }).counts
  const e = everyCopyCounts(k.husk, k.target)
  const ec = everyCopyCounts(k.husk, cut)

  return { uniform: [u.husk, u.bulk], cut: [c.husk, c.bulk], every: [e.husk, e.bulk], everyCut: [ec.husk, ec.bulk] }
}

// ---- E-RLT-0057's knit, rebuilt by that file's own rule ----

function frozenFreeSet(): { set: ScatterSet; order: number } {
  const table = groupTable()
  const mats = table.permutations.map(p => linearMapOf(p) ?? [])
  const frozenOf = (forms: number[][]): number =>
    Array.from({ length: 12 }, (_, l) => l).filter(l => rowBasis([...forms, Array.from({ length: 12 }, (__, j) => (j === l ? 1 : 0))]).length === forms.length).length
  const free = leastRankGroups(table).groups.filter(g => frozenOf(forcedForms(table, g)) === 0)
  const samples = unitSamples(64)
  const rows = free.map(g => {
    const perms = g.map(x => [...(table.permutations[x] ?? [])])
    const forms = forcedForms(table, g)
    const rotations = rotationMaps({ permutations: table.permutations, group: perms })
    const set = scatterMoves({ group: perms, forms, rotation: rotations[0] })

    return { set, order: g.length, moves: set.moves.length, spread4: forcedIsotropySpread({ group: g.map(x => mats[x] ?? []), rank: 4, generic: [0.31, -0.74, 0.52, 0.29], samples }) }
  })
  const chosen = [...rows].sort((a, b) => b.moves - a.moves || b.order - a.order || a.spread4 - b.spread4)[0]

  if (!chosen) throw new Error('no frozen-free group')

  return { set: chosen.set, order: chosen.order }
}

// ---- C0: the replay against the rule's own beat ----

const sameArray = (a: ArrayLike<number>, b: ArrayLike<number>): boolean => {
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false

  return true
}

function replayAgreement(richOf: () => ColdQuaternionKnit, committedRule: ScheduledRule): { beats: number; mismatches: number; hubSetupMismatches: number } {
  let beats = 0
  let mismatches = 0
  // the hub, vacuum and one seed, against bounceRunner on the same kernel
  const h = hubFresh(8, 'lone')
  const husk8 = boxHusk(h.mesh, 8)
  const target8 = streamTarget(h.mesh)
  const center8 = centerOf(8)

  for (const seed of [undefined, 5]) {
    const start = hubVacuum(h)

    if (seed !== undefined) start.vibe[center8 * 24 + seed] = 1

    const replay = hubReplay(h.kernel, start)
    const own = bounceRunner(h.kernel, start)

    causalRun({
      replay,
      husk: husk8,
      target: target8,
      beats: BEATS,
      onBeat: () => {
        own.beat()
        beats++
        mismatches += sameArray(own.state().vibe, replay.state().vibe) && sameArray(own.state().store, replay.state().store) ? 0 : 1
      },
    })
  }

  // the fresh hub setup against wall-reading's hubSetup (both at the committed start)
  const old = hubSetup(8, 'lone', 0)
  const oldRun = bounceRunner(old.kernel, emptyOf(old))
  const fresh = hubReplay(h.kernel, hubVacuum(h))
  let hubSetupMismatches = 0

  causalRun({
    replay: fresh,
    husk: husk8,
    target: target8,
    beats: BEATS,
    onBeat: () => {
      oldRun.beat()

      const a = oldRun.state()
      const b = fresh.state()

      hubSetupMismatches += sameArray(a.vibe, b.vibe) && sameArray(a.store, b.store) && sameArray(a.spoint, b.spoint) ? 0 : 1
    },
  })

  // the rich cold knit, seeded, against coldQuaternionBeat
  const box5 = d4BoxMesh({ side: 5 })
  const husk5 = boxHusk(box5, 5)
  const target5 = streamTarget(box5)
  const lattice = makeColdQuaternionLattice(box5, richOf())
  const cold = emptyColdState(box5)

  cold.vibe[2 * (1 + 5 + 25 + 125) * 24 + 3] = 1

  const coldRep = coldReplay(makeColdQuaternionLattice(box5, richOf()), cold)
  let s = cold

  causalRun({
    replay: coldRep,
    husk: husk5,
    target: target5,
    beats: BEATS,
    onBeat: () => {
      s = coldQuaternionBeat(lattice, s)
      beats++
      mismatches += sameArray(s.vibe, coldRep.state().vibe) && sameArray(s.store, coldRep.state().store) && sameArray(s.counter, coldRep.state().counter) ? 0 : 1
    },
  })

  // the committed knit's vacuum, against code/rule/lattice-gas beat
  const opposite = Array.from({ length: 24 }, (_, d) => box5.opposite(d))
  const forward = committedRule(opposite, true)
  const toneRep = toneReplay(box5, forward, new Int8Array(box5.cellCount * 24))
  let will = { mesh: box5, data: new Int8Array(box5.cellCount * 24) }

  causalRun({
    replay: toneRep,
    husk: husk5,
    target: target5,
    beats: BEATS,
    onBeat: t => {
      will = toneBeat(will, forward(t))
      beats++
      mismatches += sameArray(will.data, toneRep.data()) ? 0 : 1
    },
  })

  return { beats, mismatches, hubSetupMismatches }
}

export default experiment({
  id: 'relativity/causal-components',
  code: 'E-RLT-0089',
  title:
    "causal components from the copy history (the user's redefinition of the one-seed component gate), fail as predicted: the instrument is exact (the replay equals each rule's own beat on 96 of 96 beats, the fresh hub setup equals hubSetup) and informative (a uniform fill reads 1 husk component and a planted cut 2, on all 17 starts, for the committed and the rich cold knit), but no judged knit reads 1 on any start: the hub vacuum under L reads 65 husk components (769 bulk) with or without a seed, at 24, 48 and 96 beats and under B and K alike, one component of 448 husk docks and 64 columns into which the vacuum never copies a vibe (a seed joins at most 4 of them, two seeds at most 4); E-RLT-0056's and E-RLT-0057's cold vacuums copy no content at all, so a seed's descent reaches 5 of 125 husk docks and leaves 121 components; the committed and combined knits read 1 on every start; the old state-match reading, replicated, gives 12 and 9 on all three judged knits as before",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const committedRule: ScheduledRule = (o, f) => turningWeave({ opposite: o, forward: f })
    const combinedRule: ScheduledRule = (o, f) => combinedCollision({ spec: COMBINED_DEFAULT, opposite: o, forward: f })
    const richOf = (): ColdQuaternionKnit => makeColdQuaternionKnit({ scatter: quaternionScatter() })
    const frozen = frozenFreeSet()
    const frozenOf = (): ColdQuaternionKnit => makeColdQuaternionKnit({ mode: 'scatter', scatter: frozen.set })

    // C0
    const box5 = d4BoxMesh({ side: 5 })
    const stepErrors = boxHusk(box5, 5).stepErrors + boxHusk(hubFresh(8, 'lone').mesh, 8).stepErrors
    const agreement = replayAgreement(richOf, committedRule)
    const c0 = stepErrors === 0 && agreement.mismatches === 0 && agreement.hubSetupMismatches === 0

    // the old functions at the committed start, for the replica
    const oldFunctions = {
      richHusk: huskComponents(coldLineSectors(richOf(), false, box5)),
      richBulk: coldLineSectors(richOf(), false, box5).length,
      frozenHusk: huskComponents(coldLineSectors(frozenOf(), false, box5)),
      frozenBulk: coldLineSectors(frozenOf(), false, box5).length,
      committedHusk: huskComponents(lineSectors(committedRule, false)),
      committedBulk: lineSectors(committedRule, false).length,
      hubBulk: seedWake(hubSetup(8, 'lone', centerOf(8)), centerOf(8), BEATS).components,
    }

    // the per-beat copy record, shown on the hub vacuum at the committed start
    const hub0 = hubKnit(8, 'lone')
    const hubLog = causalRun({ replay: hub0.make(undefined).replay, husk: hub0.husk, target: hub0.target, beats: 96, keepMasks: true })
    // over all 96 beats: the most docks fed at one beat, the beats with no content copy, the most distinct sources
    const hubInverse = inverseTarget(hub0.target)
    let sourcesMax = 0
    let docksFed = 0
    let silentBeats = 0

    for (let t = 0; t < 96; t++) {
      const masks = hubLog.log.masks?.[t] ?? new Int32Array(0)
      let fed = 0

      for (let y = 0; y < hub0.husk.cells; y++) {
        if ((masks[y] ?? 0) === 0) continue

        fed++
        sourcesMax = Math.max(sourcesMax, copySources(hubLog.log, hubInverse, t, y).length)
      }

      docksFed = Math.max(docksFed, fed)
      silentBeats += fed === 0 ? 1 : 0
    }

    // what the hub vacuum's singleton docks hold: a store on some line, at the start
    const hubStart = hubFresh(8, 'lone')
    const rootSize = new Int32Array(hub0.husk.cells)

    for (let x = 0; x < hub0.husk.cells; x++) rootSize[rootOf(hubLog.log.bulk, x)] = (rootSize[rootOf(hubLog.log.bulk, x)] ?? 0) + 1

    let singletons = 0
    let singletonsWithStore = 0
    let othersWithStore = 0

    for (let x = 0; x < hub0.husk.cells; x++) {
      let stores = 0

      for (let l = 0; l < 12; l++) stores += hubStart.store[x * 12 + l] !== 0 ? 1 : 0

      if (rootSize[rootOf(hubLog.log.bulk, x)] === 1) {
        singletons++
        singletonsWithStore += stores > 0 ? 1 : 0
      } else othersWithStore += stores > 0 ? 1 : 0
    }

    const hubBulkSizes = componentSizes(hubLog.log.bulk)
    const hubHuskSizes = componentSizes(hubLog.log.top)

    // beside at the committed start: H under B and K, H with the cut, H's two-seed pairs
    const hubOthers = (['bounce', 'isometric'] as const).map(kind => {
      const k = hubKnit(8, kind)

      return causalRun({ replay: k.make(undefined).replay, husk: k.husk, target: k.target, beats: BEATS }).counts
    })
    const hubCut = causalRun({ replay: hub0.make(undefined).replay, husk: hub0.husk, target: cutTarget(hub0.mesh, hub0.husk, hub0.target), beats: BEATS }).counts
    let pairHuskMin = Number.POSITIVE_INFINITY
    let pairHuskMax = 0
    let pairs = 0

    for (let d1 = 0; d1 < 24; d1++) {
      for (let d2 = d1 + 1; d2 < 24; d2++) {
        if (Math.min(d1, hub0.mesh.opposite(d1)) === Math.min(d2, hub0.mesh.opposite(d2))) continue

        const c = causalRun({ replay: hub0.make([d1, d2]).replay, husk: hub0.husk, target: hub0.target, beats: BEATS, seedDock: hub0.center }).counts

        pairs++
        pairHuskMin = Math.min(pairHuskMin, c.husk)
        pairHuskMax = Math.max(pairHuskMax, c.husk)
      }
    }

    // the start family
    const family = startFamily(16)
    const perStart = family.map(member =>
      withStart(member, () => {
        const hub = hubKnit(8, 'lone')
        const rich = coldKnit('rich', richOf)
        const frozenKnit = coldKnit('frozen', frozenOf)
        const committed = toneKnit('committed', committedRule)
        const combined = toneKnit('combined', combinedRule)
        const dense = (k: Knit) => causalRun({ replay: k.make(undefined, 'dense').replay, husk: k.husk, target: k.target, beats: BEATS }).counts

        return {
          member: member.name,
          H: readKnit(hub),
          R: readKnit(rich),
          V: readKnit(frozenKnit),
          committed: readKnit(committed),
          combined: readKnit(combined),
          controlCommitted: controls(committed),
          controlRich: controls(rich),
          richDense: dense(rich),
          frozenDense: dense(frozenKnit),
          hubVacuum96: causalRun({ replay: hub.make(undefined).replay, husk: hub.husk, target: hub.target, beats: 96 }).counts,
        }
      }),
    )

    const controlOk = (c: ReturnType<typeof controls>): boolean => c.uniform[0] === 1 && c.uniform[1] === 1 && c.cut[0] === 2 && c.cut[1] === 2
    const c1 = perStart.every(p => controlOk(p.controlCommitted) && controlOk(p.controlRich))
    const passes = (key: 'H' | 'R' | 'V' | 'committed' | 'combined'): number => perStart.filter(p => p[key].huskMax === 1).length
    const gH = passes('H') === family.length
    const gR = passes('R') === family.length
    const gV = passes('V') === family.length
    const status = c0 && c1 ? (gH && gR && gV ? 'pass' : gH || gR || gV ? 'partial' : 'fail') : 'fail'

    const range = (xs: number[]): string => (Math.min(...xs) === Math.max(...xs) ? `${Math.min(...xs)}` : `${Math.min(...xs)} to ${Math.max(...xs)}`)
    const over = (key: 'H' | 'R' | 'V' | 'committed' | 'combined', field: keyof Reading): string => range(perStart.map(p => p[key][field]))
    const metrics: Record<string, number> = {
      gateC0: c0 ? 1 : 0,
      gateC1: c1 ? 1 : 0,
      gateH: gH ? 1 : 0,
      gateR: gR ? 1 : 0,
      gateV: gV ? 1 : 0,
      starts: family.length,
      stepErrors,
      replayBeatsChecked: agreement.beats,
      replayMismatches: agreement.mismatches,
      hubSetupMismatches: agreement.hubSetupMismatches,
      frozenGroupOrder: frozen.order,
      frozenMoves: frozen.set.moves.length,
    }

    for (const key of ['H', 'R', 'V', 'committed', 'combined'] as const) {
      metrics[`${key}_startsPassing`] = passes(key)

      for (const field of ['huskMax', 'huskMin', 'bulkMax', 'bulkMin', 'vacuumHusk', 'vacuumBulk', 'vacuumCopies', 'reachMin', 'reachMax', 'matterHuskMin', 'matterCopiesMax', 'oldBulk', 'oldHusk'] as const) {
        const xs = perStart.map(p => p[key][field])

        metrics[`${key}_${field}_min`] = Math.min(...xs)
        metrics[`${key}_${field}_max`] = Math.max(...xs)
      }
    }

    const control: Record<string, number> = {
      ...Object.fromEntries(Object.entries(oldFunctions).map(([k, v]) => [`oldFunction_${k}`, v])),
      hubVacuum96Husk_max: Math.max(...perStart.map(p => p.hubVacuum96.husk)),
      hubVacuum96Husk_min: Math.min(...perStart.map(p => p.hubVacuum96.husk)),
      hubBounceHusk: hubOthers[0]?.husk ?? -1,
      hubBounceBulk: hubOthers[0]?.bulk ?? -1,
      hubIsometricHusk: hubOthers[1]?.husk ?? -1,
      hubIsometricBulk: hubOthers[1]?.bulk ?? -1,
      hubCutHusk: hubCut.husk,
      hubCutBulk: hubCut.bulk,
      hubPairs: pairs,
      hubPairHuskMin: pairHuskMin,
      hubPairHuskMax: pairHuskMax,
      hubMostDocksFedInABeat: docksFed,
      hubBeatsWithNoContentCopy: silentBeats,
      hubMostSourcesOfOneDock: sourcesMax,
      hubSingletonDocks: singletons,
      hubSingletonDocksHoldingAStore: singletonsWithStore,
      hubConnectedDocksHoldingAStore: othersWithStore,
      richDenseHusk_max: Math.max(...perStart.map(p => p.richDense.husk)),
      frozenDenseHusk_max: Math.max(...perStart.map(p => p.frozenDense.husk)),
      uniformHusk_max: Math.max(...perStart.flatMap(p => [p.controlCommitted.uniform[0], p.controlRich.uniform[0]])),
      cutHusk_min: Math.min(...perStart.flatMap(p => [p.controlCommitted.cut[0], p.controlRich.cut[0]])),
      cutHusk_max: Math.max(...perStart.flatMap(p => [p.controlCommitted.cut[0], p.controlRich.cut[0]])),
      everyCopyHusk: perStart[0]?.controlRich.every[0] ?? -1,
      everyCopyBulk: perStart[0]?.controlRich.every[1] ?? -1,
      everyCopyCutHusk: perStart[0]?.controlRich.everyCut[0] ?? -1,
      everyCopyCutBulk: perStart[0]?.controlRich.everyCut[1] ?? -1,
      seconds: (Date.now() - started) / 1000,
    }

    const knitLine = (key: 'H' | 'R' | 'V' | 'committed' | 'combined'): string =>
      `${key}: gate reading (largest husk count over 24 seeds) ${over(key, 'huskMax')} over 17 starts, passing on ${passes(key)} of 17; smallest ${over(key, 'huskMin')}; bulk ${over(key, 'bulkMin')} to ${over(key, 'bulkMax')}; vacuum alone ${over(key, 'vacuumHusk')} husk, ${over(key, 'vacuumBulk')} bulk, ${over(key, 'vacuumCopies')} content copies; descent reaches ${over(key, 'reachMin')} to ${over(key, 'reachMax')} husk docks; matter-only husk count at least ${over(key, 'matterHuskMin')}; OLD state-match ${over(key, 'oldBulk')} bulk lines, ${over(key, 'oldHusk')} husk directions`

    return verdict({
      status,
      claim: `causal components from the copy history: controls ${c1 ? 'separate' : 'do not separate'} (uniform ${control.uniformHusk_max}, cut ${control.cutHusk_min} to ${control.cutHusk_max}); the hub vacuum under L reads ${over('H', 'huskMax')} husk components at worst (vacuum alone ${over('H', 'vacuumHusk')}), E-RLT-0056's knit ${over('R', 'huskMax')}, E-RLT-0057's ${over('V', 'huskMax')}, the committed knit ${over('committed', 'huskMax')}`,
      metrics,
      control,
      notes: `L2. Gates: C0 ${c0}, C1 ${c1}, H ${gH}, R ${gR}, V ${gV}. ${knitLine('H')}. ${knitLine('R')}. ${knitLine('V')}. ${knitLine('committed')}. ${knitLine('combined')}. Hub vacuum at integer+0 over 96 beats: bulk component sizes ${hubBulkSizes.map(([s, n]) => `${n} of ${s}`).join(', ')}; husk ${hubHuskSizes.map(([s, n]) => `${n} of ${s}`).join(', ')}; over 96 beats at most ${docksFed} of ${hub0.husk.cells} docks received a content copy in one beat, ${silentBeats} beats copied no content at all, and a dock's new value came from at most ${sourcesMax} docks; ${singletons} singleton docks, ${singletonsWithStore} of them holding a store (connected docks holding one: ${othersWithStore}). Old functions at integer+0: ${JSON.stringify(oldFunctions)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
