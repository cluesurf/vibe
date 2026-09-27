// Dependence components: the one-seed component gate with calm, love and fear treated alike (E-RLT-0091).
//
// THE USER'S DIRECTION (2026-09-26). E-RLT-0089 counted only love and fear copies, because the stream copies every
// slot every beat, so counting every copy makes any connected box one component by construction. The user: calm, love
// and fear are to be treated ALL THE SAME. The proposal tested here: "arose from" means DEPENDENCE, not copying. Dock B
// at beat t arose from dock A at beat s when changing A's value at s (to any other value: the other two vibes, and the
// role point or store the slot carries, and the dock's own stores or counters) changes B's value at t. The changed and
// the reference histories run in lockstep, both deterministic, and every dock whose state differs is marked
// (code/measure/dependence-cone; sparse, and checked against the whole changed history). A copy that a later collision
// overwrites regardless carries nothing.
//
// (a) THE THEOREM, stated before any run. Let the beat be U = S C, with C the product over docks of C_x, each a
// bijection of dock x's state (its 24 slots with what they carry, and its dock data), and S the stream, a bijection of
// slot places that carries each slot's value (and moves its role point by a bijective grid move) and leaves dock data
// in place. Then:
//  (i) U is a bijection, so two histories that differ at beat s differ at every beat after it (and before it, run
//      backward). DISTINGUISHABILITY IS CONSERVED: the difference set D_t is never empty.
//  (ii) Locally: C_x is a bijection, so a dock differs after the collision exactly when it differed before. The
//      collision neither creates nor erases a differing dock. The stream sends each differing slot to one neighbour,
//      and dock data stays. So 1 <= |D_(t+1)| <= (differing slots) + (docks with differing data), and D_t lies in the
//      seed's light cone.
//  (iii) What it implies for spread: PERSISTENCE, NOT SPREAD. The theorem forces at least one differing dock per beat,
//      nothing more. A difference carried by one slot through docks that map "one differing slot" to "one differing
//      slot" (a lone vibe passing a transparent dock) visits one dock per beat along one root line, T + 1 docks over T
//      beats, and on a torus it revisits them. So a reversible cone lies between one path (the free difference) and
//      the whole light cone, and SCATTERING decides where: whether the collision maps a one-slot difference to a
//      many-slot one. On an empty vacuum a single changed slot is the whole difference, so there the dependence cone
//      of a new vibe EQUALS its copy descent, exactly.
//  (iv) The UNION reading is automatic. Joining docks by dependence and closing under union (transitive closure) is
//      the same as joining by one-beat dependence, since every longer difference is a chain of one-beat ones. And one
//      beat of a slot-permuting bijective collision sends a change of a slot's value to one output slot, a different
//      one for each slot. So every dock is joined to every dock its slots are copied into: the union reading is the
//      box's neighbour graph, 1 on any connected box, the same as E-RLT-0089's every-copy reading. It cannot tell one
//      reversible knit from another. Only the SEED'S OWN CONE (docks depending on one fixed change, no chaining) can.
//      It is reported, never gated for the judged knits.
//
// (b) PREDICTIONS, written before any run:
//  H  (the hub vacuum under L, side 8, 24 beats): fail on every start. Most of the seed's changes are a lone vibe or a
//     changed store at the center; a lone vibe passes vacuum pairs straight under B (code/rule/bounce-pair-knit), so
//     the cone should stay near the free star through the center, widened by the pair routes a changed store or a
//     blocked line alters. Predicted: fewer than the 448 populated husk docks, and of the 64 empty columns only those
//     on the free star. (The size is the least certain number here: K events, where a dock holds two single lines,
//     scatter.)
//  R, V (the cold knits of E-RLT-0056 and E-RLT-0057, side 5): fail. The vacuum is empty, and a lone tone makes
//     nothing and goes straight; distinct root lines through the center meet again only at the center, so every
//     tone a change makes (a counter change on R pays out a tone at the center) stays on the free star. Predicted: the
//     cone EQUALS the free star (bulk docks), fewer than 125 husk docks.
//  committed, combined (beside): the cone of each new vibe equals its copy descent (iii), exactly.
//  union reading: 1 husk component on every reversible knit (iv).
//
// Gates, fixed before this file ran:
//  C0 the instrument: every rule as given here runs identically to the shared replays that E-RLT-0089 checked against
//     each rule's own beat (hub vacuum and one seed, the rich cold knit seeded, the committed and combined vacuum;
//     24 beats; meaningful values: a role point only on a held slot, a store's point only on a held store); and the
//     sparse lockstep gives the same difference set D_t as the whole changed history on every beat, for a fixed sample
//     of changes (the first, then every P/8-th) on every knit and control, at integer+0
//  C1 the controls (side 5, the committed knit's box, the seed at the center, 24 beats):
//     K1 uniform, a linear mixing collision (every slot gains the dock's sum mod 3: a bijection under which one
//        changed slot changes all 24) on the calm box: the seed's cone covers all 125 husk docks, cover count 1,
//        union 1
//     K2 the same with the planted cut (E-RLT-0089's: the box split by v0, crossing slots reflected): the cone
//        covers exactly the husk docks of the seed's half and none of the other, cover count 2, union 2
//     K3 constant overwrite (every slot becomes love, whatever it held; NOT a bijection) on the all-love box: the
//        copy reading of E-RLT-0089 reads 1 husk component, while the seed's cone is the seed's own dock only (1
//        husk dock) and the union reading is 125 husk components: dependence and copying disagree
//     K4 pass-through (the identity collision, a bijection) on the all-love box: the copy reading reads 1, while the
//        seed's cone equals the free star exactly, fewer than 125 husk docks: a reversible, full box is not enough
//  C2 the theorem: on every run of a bijective rule (H, R, V, committed, combined on every start, K1, K2, K4), no
//     change's difference is ever gone and no collision erases a differing dock; on K3 collisions do erase
//  C3 the empty-vacuum identity (iii): on R, V, committed and combined at integer+0, each new vibe's cone (calm to
//     love or fear, store 0) equals its copy descent (code/measure/causal-components) dock for dock
//  G  per judged knit, on each of E-MTH-0028's 17 starts: the union of the cones of every change of the center dock at
//     beat 0 covers every husk dock. H (gated first, the hub vacuum, its seed at centerOf(8)), R, V
// Verdict: pass if C0 to C3 and G on H, R and V; partial if C0 to C3 and G on at least one; fail otherwise. C0 or C1
// failing makes the instrument unverified or uninformative.
// Beside, never gates: bulk coverage; the smallest single change's coverage; the 64 empty columns of the hub vacuum
// (E-RLT-0089's singleton columns) that depend on the seed, per start, and at 96 beats at integer+0; H under B and K;
// the union reading and the cover count per knit at integer+0; the free star's size.
//
// FIRST RUN (81 s, tmp/rlt091-run1.log): fail. No gate moved. C0 holds (120 of 120 replay beats agree, the sparse
// lockstep equals the whole changed history on 74 changes at every beat). C1 holds: linear mixing 125 of 125 husk
// docks (cover 1, union 1); with the cut 75, exactly the seed's half (cover 2, union 2); constant overwrite 1 husk
// dock and union 125 while the copy reading says 1 (48 of 48 changes erased); pass-through equals the free star (37
// husk, 49 bulk) while the copy reading says 1. C2 holds: 0 empty beats and 0 erased docks on every bijective run.
// C3 FAILS, on a WRONG PREMISE of mine, not the instrument: R 0 mismatches, V 0, but committed 29,361 and combined
// 29,600 (58,961 in all). Their all-calm start is not an empty vacuum: calm makes pairs there, 195,000 and 160,000
// vibe-slots over 25 frames (probes tmp/rlt091-descent-probe.ts and -probe2.ts, after the run), so the copy descent
// fills all 625 docks while the dependence cone reaches 144 and 111. G fails on H, R and V on every start, every
// number identical over the 17 starts: H 61 of 512 husk docks (85 bulk), equal in count to the free star through the
// center (61 husk); 4 of the 64 empty columns, exactly the 4 on the free star; the same at 96 beats and under B; under
// K 452 husk, still 4 empty columns. R and V 37 of 125 = the free star, as predicted. Union reading 1 on every
// reversible knit, as (iv) says. Predictions right: H fails, below 448, empty columns only on the star; R, V equal the
// star; union 1. Wrong: C3's premise for committed and combined. The title was written after the run.
//
// DETERMINISM: no random numbers. Every change of the center dock is enumerated; starts are E-MTH-0028's family.
// Every count is an exact integer. Depth L2.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4BoxMesh, linearMapOf } from '@/code/substrate/d4-box'
import { passThrough, turningWeave } from '@/code/rule/collision'
import { COMBINED_DEFAULT, combinedCollision } from '@/code/rule/combined-knit'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { makeColdQuaternionKnit, makeColdQuaternionLattice, emptyColdState, quaternionScatter, type ColdQuaternionKnit } from '@/code/rule/cold-quaternion-knit'
import { rotationMaps, scatterMoves, type ScatterSet } from '@/code/rule/cold-scatter'
import { centerOf } from '@/code/measure/wall-reading'
import { forcedForms, groupTable, leastRankGroups, rowBasis } from '@/code/measure/color-isotropy-bound'
import { forcedIsotropySpread, unitSamples } from '@/code/measure/coarse-modes'
import { type ScheduledRule } from '@/code/measure/weave-acceptance'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { boxHusk, causalRun, coldReplay, cutTarget, hubFresh, hubReplay, hubVacuum, rootOf, streamTarget, toneReplay, type BoxHusk } from '@/code/measure/causal-components'
import {
  bruteDifferences,
  coldRule,
  coneOf,
  constantLove,
  coverCount,
  freeStar,
  hubRule,
  linearMixing,
  referenceFrames,
  seedCone,
  toneRule,
  unionReading,
  type DockRule,
  type State,
} from '@/code/measure/dependence-cone'
import { type Collision } from '@/code/rule/collision'
import { type Mesh } from '@/code/tool/mesh'

const BEATS = 24
const SIDE5_CENTER = 2 * (1 + 5 + 25 + 125)

// ---- the knits, as dependence rules with their starting states ----

type Setup = { readonly rule: DockRule; readonly start: State; readonly husk: BoxHusk; readonly center: number; readonly mesh: Mesh }

function hubSetupOf(kind: CollisionKind): Setup & { hub: ReturnType<typeof hubFresh> } {
  const h = hubFresh(8, kind)
  const rule = hubRule(h.kernel, `hub-${kind}`)
  const v = hubVacuum(h)
  const start: State = { v: Int8Array.from(v.vibe), a: Int16Array.from(v.point), d: new Int16Array(h.cells * 24) }

  for (let x = 0; x < h.cells; x++) {
    for (let l = 0; l < 12; l++) {
      start.d[x * 24 + l] = v.store[x * 12 + l] as number
      start.d[x * 24 + 12 + l] = v.spoint[x * 12 + l] as number
    }
  }

  return { rule, start, husk: boxHusk(h.mesh, 8), center: centerOf(8), mesh: h.mesh, hub: h }
}

const BOX5 = d4BoxMesh({ side: 5 })
const HUSK5 = boxHusk(BOX5, 5)
const TARGET5 = streamTarget(BOX5)
const CUT5 = cutTarget(BOX5, HUSK5, TARGET5)
const OPPOSITE5 = Array.from({ length: 24 }, (_, d) => BOX5.opposite(d))

function coldSetup(name: string, knit: ColdQuaternionKnit): Setup {
  return { rule: coldRule(name, BOX5, TARGET5, knit), start: { v: new Int8Array(BOX5.cellCount * 24), a: new Int16Array(BOX5.cellCount * 24), d: new Int16Array(BOX5.cellCount * 6) }, husk: HUSK5, center: SIDE5_CENTER, mesh: BOX5 }
}

function toneSetup(name: string, forward: (t: number) => Collision, fill: number, target = TARGET5): Setup {
  const v = new Int8Array(BOX5.cellCount * 24).fill(fill)

  return { rule: toneRule(name, BOX5, target, forward), start: { v, a: new Int16Array(v.length), d: new Int16Array(0) }, husk: HUSK5, center: SIDE5_CENTER, mesh: BOX5 }
}

// E-RLT-0057's knit, rebuilt by that file's rule (as E-RLT-0089 rebuilds it)
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

// ---- C0 ----

const sameArray = (a: ArrayLike<number>, b: ArrayLike<number>): boolean => {
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false

  return true
}

// a meaningful comparison of the hub rule's frame with the shared replay's state
function hubSame(s: State, r: { vibe: Int8Array; point: Int8Array; store: Int8Array; spoint: Int8Array }): boolean {
  for (let i = 0; i < r.vibe.length; i++) {
    if (s.v[i] !== r.vibe[i]) return false
    if (r.vibe[i] !== 0 && s.a[i] !== r.point[i]) return false
  }

  const cells = r.store.length / 12

  for (let x = 0; x < cells; x++) {
    for (let l = 0; l < 12; l++) {
      const st = r.store[x * 12 + l] as number

      if (s.d[x * 24 + l] !== st) return false
      if (st !== 0 && s.d[x * 24 + 12 + l] !== r.spoint[x * 12 + l]) return false
    }
  }

  return true
}

function replayAgreement(richOf: () => ColdQuaternionKnit, committed: (t: number) => Collision, combined: (t: number) => Collision): { beats: number; mismatches: number } {
  let beats = 0
  let mismatches = 0
  const hub = hubSetupOf('lone')

  for (const seed of [undefined, 5]) {
    const start: State = { v: Int8Array.from(hub.start.v), a: Int16Array.from(hub.start.a), d: Int16Array.from(hub.start.d) }
    const v = hubVacuum(hub.hub)

    if (seed !== undefined) {
      start.v[hub.center * 24 + seed] = 1
      v.vibe[hub.center * 24 + seed] = 1
    }

    const frames = referenceFrames(hub.rule, start, BEATS)
    const replay = hubReplay(hub.hub.kernel, v)

    for (let t = 0; t < BEATS; t++) {
      replay.collide(t)
      replay.stream(hub.rule.target)
      beats++
      mismatches += hubSame(frames[t + 1] as State, replay.state()) ? 0 : 1
    }
  }

  // the rich cold knit, one tone at the center
  const rich = coldSetup('rich', richOf())
  const cold = emptyColdState(BOX5)

  cold.vibe[SIDE5_CENTER * 24 + 3] = 1
  rich.start.v[SIDE5_CENTER * 24 + 3] = 1

  const coldFrames = referenceFrames(rich.rule, rich.start, BEATS)
  const coldRep = coldReplay(makeColdQuaternionLattice(BOX5, richOf()), cold)

  for (let t = 0; t < BEATS; t++) {
    coldRep.collide(t)
    coldRep.stream(TARGET5)
    beats++

    const f = coldFrames[t + 1] as State
    const s = coldRep.state()

    mismatches += sameArray(f.v, s.vibe) && sameArray(f.a, s.store) && sameArray(f.d, s.counter) ? 0 : 1
  }

  rich.start.v[SIDE5_CENTER * 24 + 3] = 0

  // the committed and combined knits, one vibe at the center
  for (const forward of [committed, combined]) {
    const setup = toneSetup('tone', forward, 0)

    setup.start.v[SIDE5_CENTER * 24 + 7] = -1

    const frames = referenceFrames(setup.rule, setup.start, BEATS)
    const rep = toneReplay(BOX5, forward, setup.start.v)

    for (let t = 0; t < BEATS; t++) {
      rep.collide(t)
      rep.stream(TARGET5)
      beats++
      mismatches += sameArray((frames[t + 1] as State).v, rep.data()) ? 0 : 1
    }
  }

  return { beats, mismatches }
}

// the sparse lockstep against the whole changed history, on a fixed sample of the center's changes
function sparseAgreement(s: Setup, frames: readonly State[]): { checked: number; mismatches: number } {
  const f = s.rule.dockFields
  const list = s.rule.perturbations(s.start.v.slice(s.center * 24, s.center * 24 + 24), s.start.a.slice(s.center * 24, s.center * 24 + 24), s.start.d.slice(s.center * f, s.center * f + f))
  const step = Math.max(1, Math.floor(list.length / 8))
  let checked = 0
  let mismatches = 0

  for (let k = 0; k < list.length; k += step) {
    const p = list[k]

    if (!p) continue

    const sparse = coneOf(s.rule, frames, s.center, p, true).sets ?? []
    const brute = bruteDifferences(s.rule, frames, s.center, p)

    checked++

    for (let t = 0; t < brute.length; t++) mismatches += sameArray(sparse[t] ?? [], brute[t] ?? []) ? 0 : 1
  }

  return { checked, mismatches }
}

// ---- C3: each new vibe's cone against its copy descent, on an empty vacuum ----

function descentAgreement(s: Setup, frames: readonly State[], replayOf: (start: State) => ReturnType<typeof toneReplay> | ReturnType<typeof coldReplay>): { checked: number; mismatches: number } {
  let checked = 0
  let mismatches = 0

  for (let d = 0; d < 24; d++) {
    for (const w of [1, -1]) {
      const cone = coneOf(s.rule, frames, s.center, { kind: 'slot', index: d, v: w, a: 0 })
      const start: State = { v: Int8Array.from(s.start.v), a: Int16Array.from(s.start.a), d: Int16Array.from(s.start.d) }

      start.v[s.center * 24 + d] = w

      const run = causalRun({ replay: replayOf(start), husk: s.husk, target: s.rule.target, beats: BEATS, seedDock: s.center })

      checked++

      for (let x = 0; x < s.rule.cells; x++) mismatches += (cone.firstAt[x] !== -1) !== (run.log.reachedAt[x] !== -1) ? 1 : 0
    }
  }

  return { checked, mismatches }
}

// ---- one judged knit at one start ----

type Reading = { husk: number; bulk: number; smallestHusk: number; smallestBulk: number; changes: number; emptyBeats: number; killed: number; emptyColumnsReached: number }

function readSeed(s: Setup, frames: readonly State[], emptyColumns?: Uint8Array): Reading {
  const c = seedCone(s.rule, s.husk, frames, s.center)
  let emptyColumnsReached = 0

  if (emptyColumns) for (let k = 0; k < s.husk.columns; k++) emptyColumnsReached += emptyColumns[k] && c.husk[k] ? 1 : 0

  return { husk: c.huskCount, bulk: c.bulkCount, smallestHusk: c.smallestHusk, smallestBulk: c.smallestBulk, changes: c.perturbations, emptyBeats: c.emptyBeats, killed: c.killed, emptyColumnsReached }
}

// the hub vacuum's columns into which it never copies a vibe (E-RLT-0089's singleton husk components), 96 beats
function emptyColumnsOf(hub: Setup & { hub: ReturnType<typeof hubFresh> }): Uint8Array {
  const run = causalRun({ replay: hubReplay(hub.hub.kernel, hubVacuum(hub.hub)), husk: hub.husk, target: hub.rule.target, beats: 96 })
  const size = new Int32Array(hub.husk.columns)

  for (let k = 0; k < hub.husk.columns; k++) size[rootOf(run.log.top, k)] = (size[rootOf(run.log.top, k)] ?? 0) + 1

  const out = new Uint8Array(hub.husk.columns)

  for (let k = 0; k < hub.husk.columns; k++) out[k] = size[rootOf(run.log.top, k)] === 1 ? 1 : 0

  return out
}

export default experiment({
  id: 'relativity/dependence-components',
  code: 'E-RLT-0091',
  title:
    "dependence components (calm, love and fear alike; the user's direction), fail: the instrument is exact and informative (constant overwrite reads 1 dock where the copy reading reads 1 component, pass-through reads the free star, linear mixing 125 of 125, a planted cut exactly its half), and a reversible rule is proved to keep every difference alive (0 empty beats, 0 erased docks), but persistence is not spread: the hub vacuum's seed cone is 61 of 512 husk docks, the free star through the center, and reaches only the 4 of its 64 empty columns that lie on that star (452 under K, still 4); E-RLT-0056's and E-RLT-0057's cones are the free star, 37 of 125; the committed and combined knits reach 89 and 65 though every dock receives their vacuum's copies; the union of dependence is 1 on every reversible knit by construction",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const committedRule: ScheduledRule = (o, f) => turningWeave({ opposite: o, forward: f })
    const combinedRule: ScheduledRule = (o, f) => combinedCollision({ spec: COMBINED_DEFAULT, opposite: o, forward: f })
    const committed = committedRule(OPPOSITE5, true)
    const combined = combinedRule(OPPOSITE5, true)
    const richOf = (): ColdQuaternionKnit => makeColdQuaternionKnit({ scatter: quaternionScatter() })
    const frozen = frozenFreeSet()
    const frozenOf = (): ColdQuaternionKnit => makeColdQuaternionKnit({ mode: 'scatter', scatter: frozen.set })

    // ---- C0 ----
    const agreement = replayAgreement(richOf, committed, combined)
    const hub0 = hubSetupOf('lone')
    const hubFrames0 = referenceFrames(hub0.rule, hub0.start, BEATS)
    const R = coldSetup('rich', richOf())
    const V = coldSetup('frozen', frozenOf())
    const committedSetup = toneSetup('committed', committed, 0)
    const combinedSetup = toneSetup('combined', combined, 0)
    const K1 = toneSetup('linear', () => linearMixing, 0)
    const K2 = toneSetup('linear-cut', () => linearMixing, 0, CUT5)
    const K3 = toneSetup('constant', () => constantLove, 1)
    const K4 = toneSetup('pass', () => passThrough, 1)
    const framesOf = (s: Setup): State[] => referenceFrames(s.rule, s.start, BEATS)
    const frames5 = new Map<Setup, State[]>([R, V, committedSetup, combinedSetup, K1, K2, K3, K4].map(s => [s, framesOf(s)]))
    const fr = (s: Setup): State[] => frames5.get(s) as State[]
    const sparseChecks = [
      sparseAgreement(hub0, hubFrames0),
      ...[R, V, committedSetup, combinedSetup, K1, K2, K3, K4].map(s => sparseAgreement(s, fr(s))),
    ]
    const sparseChecked = sparseChecks.reduce((m, c) => m + c.checked, 0)
    const sparseMismatches = sparseChecks.reduce((m, c) => m + c.mismatches, 0)
    const c0 = agreement.mismatches === 0 && sparseMismatches === 0

    // ---- C1 ----
    const star = freeStar(BOX5, HUSK5, SIDE5_CENTER, BEATS)
    const k1 = seedCone(K1.rule, HUSK5, fr(K1), SIDE5_CENTER)
    const k2 = seedCone(K2.rule, HUSK5, fr(K2), SIDE5_CENTER)
    const k3 = seedCone(K3.rule, HUSK5, fr(K3), SIDE5_CENTER)
    const k4 = seedCone(K4.rule, HUSK5, fr(K4), SIDE5_CENTER)
    const half = (x: number): number => ((HUSK5.first[x] as number) < Math.floor(5 / 2) ? 0 : 1)
    const seedHalf = half(SIDE5_CENTER)
    const halfColumns = new Uint8Array(HUSK5.columns)

    for (let x = 0; x < BOX5.cellCount; x++) if (half(x) === seedHalf) halfColumns[HUSK5.column[x] as number] = 1

    let k2Outside = 0
    let k2MissingInside = 0

    for (let k = 0; k < HUSK5.columns; k++) {
      if (k2.husk[k] && !halfColumns[k]) k2Outside++
      if (!k2.husk[k] && halfColumns[k]) k2MissingInside++
    }

    let k4StarMismatch = 0

    for (let x = 0; x < BOX5.cellCount; x++) k4StarMismatch += (k4.bulk[x] === 1) !== (star.bulk[x] === 1) ? 1 : 0

    const union = {
      K1: unionReading(K1.rule, HUSK5, fr(K1)),
      K2: unionReading(K2.rule, HUSK5, fr(K2)),
      K3: unionReading(K3.rule, HUSK5, fr(K3)),
      K4: unionReading(K4.rule, HUSK5, fr(K4)),
    }
    const cover = {
      K1: coverCount(K1.rule, HUSK5, fr(K1), SIDE5_CENTER, 200),
      K2: coverCount(K2.rule, HUSK5, fr(K2), SIDE5_CENTER, 200),
      K4: coverCount(K4.rule, HUSK5, fr(K4), SIDE5_CENTER, 200),
    }
    const copyK3 = causalRun({ replay: toneReplay(BOX5, () => constantLove, K3.start.v), husk: HUSK5, target: TARGET5, beats: BEATS }).counts
    const copyK4 = causalRun({ replay: toneReplay(BOX5, () => passThrough, K4.start.v), husk: HUSK5, target: TARGET5, beats: BEATS }).counts
    const c1K1 = k1.huskCount === HUSK5.columns && cover.K1.seeds === 1 && cover.K1.complete && union.K1.husk === 1
    const c1K2 = k2Outside === 0 && k2MissingInside === 0 && cover.K2.seeds === 2 && cover.K2.complete && union.K2.husk === 2
    const c1K3 = copyK3.husk === 1 && k3.huskCount === 1 && k3.bulkCount === 1 && union.K3.husk === HUSK5.columns
    const c1K4 = copyK4.husk === 1 && k4StarMismatch === 0 && k4.huskCount < HUSK5.columns
    const c1 = c1K1 && c1K2 && c1K3 && c1K4

    // ---- C3 ----
    const descent = [
      descentAgreement(R, fr(R), st => coldReplay(makeColdQuaternionLattice(BOX5, richOf()), { vibe: Int8Array.from(st.v), store: Int32Array.from(st.a), counter: Int32Array.from(st.d) })),
      descentAgreement(V, fr(V), st => coldReplay(makeColdQuaternionLattice(BOX5, frozenOf()), { vibe: Int8Array.from(st.v), store: Int32Array.from(st.a), counter: Int32Array.from(st.d) })),
      descentAgreement(committedSetup, fr(committedSetup), st => toneReplay(BOX5, committed, st.v)),
      descentAgreement(combinedSetup, fr(combinedSetup), st => toneReplay(BOX5, combined, st.v)),
    ]
    const descentChecked = descent.reduce((m, c) => m + c.checked, 0)
    const descentMismatches = descent.reduce((m, c) => m + c.mismatches, 0)
    const c3 = descentMismatches === 0

    // ---- beside at integer+0 ----
    const empty0 = emptyColumnsOf(hub0)
    const emptyCount = empty0.reduce((m, n) => m + n, 0)
    let emptyOnStar = 0
    const hubStar = freeStar(hub0.mesh, hub0.husk, hub0.center, BEATS)
    const hubStarColumns = new Uint8Array(hub0.husk.columns)

    for (let x = 0; x < hub0.rule.cells; x++) if (hubStar.bulk[x]) hubStarColumns[hub0.husk.column[x] as number] = 1
    for (let k = 0; k < hub0.husk.columns; k++) emptyOnStar += empty0[k] && hubStarColumns[k] ? 1 : 0

    const hub96 = readSeed(hub0, referenceFrames(hub0.rule, hub0.start, 96), empty0)
    const hubOthers = (['bounce', 'isometric'] as const).map(kind => {
      const s = hubSetupOf(kind)

      return readSeed(s, referenceFrames(s.rule, s.start, BEATS), empty0)
    })
    const unionJudged = {
      H: unionReading(hub0.rule, hub0.husk, hubFrames0),
      R: unionReading(R.rule, HUSK5, fr(R)),
      V: unionReading(V.rule, HUSK5, fr(V)),
      committed: unionReading(committedSetup.rule, HUSK5, fr(committedSetup)),
      combined: unionReading(combinedSetup.rule, HUSK5, fr(combinedSetup)),
    }
    const coverJudged = {
      R: coverCount(R.rule, HUSK5, fr(R), SIDE5_CENTER, 200),
      V: coverCount(V.rule, HUSK5, fr(V), SIDE5_CENTER, 200),
    }
    const starColumns5 = star.huskCount

    // ---- G and C2 over the start family ----
    const family = startFamily(16)
    const perStart = family.map(member =>
      withStart(member, () => {
        const hub = hubSetupOf('lone')
        const emptyColumns = emptyColumnsOf(hub)
        const r = coldSetup('rich', richOf())
        const v = coldSetup('frozen', frozenOf())
        const cm = toneSetup('committed', committed, 0)
        const cb = toneSetup('combined', combined, 0)

        return {
          member: member.name,
          emptyColumns: emptyColumns.reduce((m, n) => m + n, 0),
          H: readSeed(hub, referenceFrames(hub.rule, hub.start, BEATS), emptyColumns),
          R: readSeed(r, framesOf(r)),
          V: readSeed(v, framesOf(v)),
          committed: readSeed(cm, framesOf(cm)),
          combined: readSeed(cb, framesOf(cb)),
        }
      }),
    )

    type Key = 'H' | 'R' | 'V' | 'committed' | 'combined'
    const keys: Key[] = ['H', 'R', 'V', 'committed', 'combined']
    const columnsOf = (key: Key): number => (key === 'H' ? hub0.husk.columns : HUSK5.columns)
    const passes = (key: Key): number => perStart.filter(p => p[key].husk === columnsOf(key)).length
    const gH = passes('H') === family.length
    const gR = passes('R') === family.length
    const gV = passes('V') === family.length
    const reversibleClean = perStart.every(p => keys.every(key => p[key].emptyBeats === 0 && p[key].killed === 0)) && [k1, k2, k4].every(c => c.emptyBeats === 0 && c.killed === 0)
    const c2 = reversibleClean && k3.killed > 0
    const status = c0 && c1 && c2 && c3 ? (gH && gR && gV ? 'pass' : gH || gR || gV ? 'partial' : 'fail') : 'fail'

    const range = (xs: number[]): string => (Math.min(...xs) === Math.max(...xs) ? `${Math.min(...xs)}` : `${Math.min(...xs)} to ${Math.max(...xs)}`)
    const over = (key: Key, field: keyof Reading): string => range(perStart.map(p => p[key][field]))
    const metrics: Record<string, number> = {
      gateC0: c0 ? 1 : 0,
      gateC1: c1 ? 1 : 0,
      gateC2: c2 ? 1 : 0,
      gateC3: c3 ? 1 : 0,
      gateH: gH ? 1 : 0,
      gateR: gR ? 1 : 0,
      gateV: gV ? 1 : 0,
      starts: family.length,
      replayBeatsChecked: agreement.beats,
      replayMismatches: agreement.mismatches,
      sparseChangesChecked: sparseChecked,
      sparseBeatMismatches: sparseMismatches,
      descentChecked,
      descentMismatches,
      hubColumns: hub0.husk.columns,
      boxColumns: HUSK5.columns,
    }

    for (const key of keys) {
      metrics[`${key}_startsPassing`] = passes(key)

      for (const field of ['husk', 'bulk', 'smallestHusk', 'smallestBulk', 'changes', 'emptyBeats', 'killed', 'emptyColumnsReached'] as const) {
        const xs = perStart.map(p => p[key][field])

        metrics[`${key}_${field}_min`] = Math.min(...xs)
        metrics[`${key}_${field}_max`] = Math.max(...xs)
      }
    }

    const control: Record<string, number> = {
      K1_husk: k1.huskCount,
      K1_bulk: k1.bulkCount,
      K1_cover: cover.K1.seeds,
      K1_unionHusk: union.K1.husk,
      K2_husk: k2.huskCount,
      K2_outsideHalf: k2Outside,
      K2_missingInsideHalf: k2MissingInside,
      K2_cover: cover.K2.seeds,
      K2_unionHusk: union.K2.husk,
      K3_copyHusk: copyK3.husk,
      K3_husk: k3.huskCount,
      K3_bulk: k3.bulkCount,
      K3_killed: k3.killed,
      K3_unionHusk: union.K3.husk,
      K3_unionBulk: union.K3.bulk,
      K4_copyHusk: copyK4.husk,
      K4_husk: k4.huskCount,
      K4_bulk: k4.bulkCount,
      K4_starMismatch: k4StarMismatch,
      K4_cover: cover.K4.seeds,
      K4_unionHusk: union.K4.husk,
      freeStarHusk5: starColumns5,
      freeStarBulk5: star.bulkCount,
      hubFreeStarHusk: hubStar.huskCount,
      hubEmptyColumns: emptyCount,
      hubEmptyColumnsOnStar: emptyOnStar,
      hubEmptyColumnsPerStart_min: Math.min(...perStart.map(p => p.emptyColumns)),
      hubEmptyColumnsPerStart_max: Math.max(...perStart.map(p => p.emptyColumns)),
      hub96Husk: hub96.husk,
      hub96Bulk: hub96.bulk,
      hub96EmptyColumnsReached: hub96.emptyColumnsReached,
      hubBounceHusk: hubOthers[0]?.husk ?? -1,
      hubBounceEmptyReached: hubOthers[0]?.emptyColumnsReached ?? -1,
      hubIsometricHusk: hubOthers[1]?.husk ?? -1,
      hubIsometricEmptyReached: hubOthers[1]?.emptyColumnsReached ?? -1,
      unionH_husk: unionJudged.H.husk,
      unionH_bulk: unionJudged.H.bulk,
      unionR_husk: unionJudged.R.husk,
      unionV_husk: unionJudged.V.husk,
      unionCommitted_husk: unionJudged.committed.husk,
      unionCombined_husk: unionJudged.combined.husk,
      coverR: coverJudged.R.seeds,
      coverV: coverJudged.V.seeds,
      frozenGroupOrder: frozen.order,
      seconds: (Date.now() - started) / 1000,
    }

    const knitLine = (key: Key): string =>
      `${key}: seed cone ${over(key, 'husk')} of ${columnsOf(key)} husk docks over 17 starts (passing on ${passes(key)}), bulk ${over(key, 'bulk')}; smallest single change ${over(key, 'smallestHusk')} husk; ${over(key, 'changes')} changes; empty beats ${over(key, 'emptyBeats')}, erased docks ${over(key, 'killed')}`

    return verdict({
      status,
      claim: `dependence components: controls ${c1 ? 'separate' : 'do not separate'} (linear mixing ${k1.huskCount}, cut ${k2.huskCount} of its half, constant overwrite ${k3.huskCount} against copy ${copyK3.husk}, pass-through ${k4.huskCount} = star against copy ${copyK4.husk}); the hub vacuum's seed cone covers ${over('H', 'husk')} of ${hub0.husk.columns} husk docks and ${over('H', 'emptyColumnsReached')} of its ${emptyCount} empty columns, E-RLT-0056's ${over('R', 'husk')}, E-RLT-0057's ${over('V', 'husk')} of 125; the union reading is ${unionJudged.H.husk}, ${unionJudged.R.husk}, ${unionJudged.V.husk}`,
      metrics,
      control,
      notes: `L2. Gates: C0 ${c0}, C1 ${c1} (K1 ${c1K1}, K2 ${c1K2}, K3 ${c1K3}, K4 ${c1K4}), C2 ${c2}, C3 ${c3}, H ${gH}, R ${gR}, V ${gV}. ${keys.map(knitLine).join('. ')}. Hub empty columns reached by the seed per start: ${over('H', 'emptyColumnsReached')} (of ${emptyCount} at integer+0, ${emptyOnStar} of them on the free star). Hub at 96 beats (integer+0): ${hub96.husk} husk, ${hub96.bulk} bulk, ${hub96.emptyColumnsReached} empty columns. Hub under B ${hubOthers[0]?.husk} husk (${hubOthers[0]?.emptyColumnsReached} empty), under K ${hubOthers[1]?.husk} (${hubOthers[1]?.emptyColumnsReached} empty). Union reading at integer+0: H ${unionJudged.H.husk} husk (${unionJudged.H.bulk} bulk), R ${unionJudged.R.husk}, V ${unionJudged.V.husk}, committed ${unionJudged.committed.husk}, combined ${unionJudged.combined.husk}; controls K1 ${union.K1.husk}, K2 ${union.K2.husk}, K3 ${union.K3.husk}, K4 ${union.K4.husk}. Cover counts: R ${coverJudged.R.seeds}, V ${coverJudged.V.seeds}, K1 ${cover.K1.seeds}, K2 ${cover.K2.seeds}, K4 ${cover.K4.seeds}. Free star on side 5: ${starColumns5} husk, ${star.bulkCount} bulk; hub star ${hubStar.huskCount} husk. Component sizes are not read here (the cone is a set, not a partition). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
