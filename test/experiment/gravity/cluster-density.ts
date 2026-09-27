// TWO CLUSTERS, AND A DENSITY THAT FALLS WITH THE BOX (E-GRV-0085). E-SPN-0100 found quiet two-vibe clusters under the
// 'pass' contact: a love+fear pair (slots 6 and 8 of a dock) holds a small wake on 12 mesh lines for 128 beats, with
// nothing added. The first force the rule could show between composites is then an interaction between two of them,
// and gravity wants it to fall as 1/r. This file reads (a) whether two clusters interact, and how the interaction
// falls with distance, and (b) at what density of such pairs the vacuum stops healing and scrambles.
//
// PROBES before this file, disclosed (all on the registered key, which on side 16 does not depend on the beat and on
// side 24 repeats every 4 beats, E-MTH-0029):
//  - tmp/cluster-pair-probe (side 16, 64 beats, 'pass'): cluster A at the center dock, B r docks along the box index;
//    non-additive slot-beats (where the joint run differs from A alone plus B alone) 477,427 at r = 1 (the box
//    scrambles), 3,706, 4,570, 3,490, 5,704, 2,693, 4,549 at r = 2 to 7 (no trend), 144,156 at r = 8 (the torus wraps
//    them together); tmp/cluster-pair-bounce.log: on 'bounce' 0 at r = 1, 2 and 8, both clusters on their own 2 lines.
//  - tmp/density-probe (side 16, 64 beats, n pairs at golden Weyl docks): 1 to 8 pairs level off near 90 to 117 trits
//    a pair (8 pairs: 714 at beat 64), 16 pairs run away late (17,544), 32 and 64 scramble (583,789 at 32);
//    tmp/density-probe-24 (side 24): 40 pairs, the density quiet on side 16, scramble (2,103,914), and 20 pairs keep
//    growing (830 to 8,294). tmp/fixed-key-probe: on its full-period key 16 pairs scramble (389,184).
// The gates below are those findings, read before this file, re-read on the full-period key (code/measure/full-key-
// paths fullPathKey), with the old key as the control: a rerun of disclosed findings, not predictions.
//
// GATES (Born path, coin on, veto 'none', no mixer; a cluster is a love at slot 6 and a fear at slot 8 of one dock).
//  D1 on 'pass' (side 16, 64 beats, two paths) two clusters interact at every r from 2 to 7 (non-additive slot-beats
//     above 0), and the interaction does not fall with distance: its mean over r = 5 to 7 is at least half its mean over
//     r = 2 to 4 (a 1/r fall would give 0.46 of it and 1/r^2 0.21, so the gate fails on either).
//  D2 on 'bounce' (side 16, 64 beats, one path) the two clusters do not interact at all (0 non-additive slot-beats) at
//     every r from 1 to 8, and each alone stays on its own 2 lines.
//  D3 a threshold on side 16 (64 beats, three paths, n = 1, 2, 4, 8, 16, 32, 64 pairs; the wake is the trits apart from
//     the unseeded run): n up to 8 stays quiet (at most 200 trits a pair at every sampled beat), n = 32 and 64 scramble
//     (above a twentieth of the slots at beat 64). 16 pairs are reported.
//  D4 the threshold falls with the box: on side 24 (two paths) 40 pairs, the density of 8 on side 16, scramble by beat
//     64. 20 pairs are reported.
//  CONTROL: the old key reproduces the probes' 3,706 (r = 2, 'pass'), 714 (8 pairs) and 583,789 (32 pairs).
//  Verdict: pass if D1 to D4 hold and the control reproduces; partial if only the control fails; fail otherwise.
//
// WHAT IT MEANS for gravity: the rule's only contact between composites is K rotating vacuum lines, which gives an
// interaction with no fall (a contact through shared lines, not a field), and the same mechanism, dense enough, breaks
// the vacuum at a density that falls as the box grows. Depth L2. DETERMINISM: no random numbers; paths are integer Weyl
// offsets of the key, pairs sit at golden Weyl docks. NOTHING MOVES.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { tritsApart, type LockedFresh } from '@/code/measure/doublet-locked-readings'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { cloneConfiguration, type Configuration } from '@/code/rule/doublet-locked-knit'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { fullPathKey, keyedRunner, meshLines, oldPathKey, pathOffset, weylDocks, type MeshLines, type PathKey } from '@/code/measure/full-key-paths'

const SIDE = 16
const BIG = 24
const BEATS = 64
const EVERY = 8
const RS = [1, 2, 3, 4, 5, 6, 7, 8] as const
const DENSITIES = [1, 2, 4, 8, 16, 32, 64] as const
const BIG_DENSITIES = [20, 40] as const
const PASS_PATHS = 2
const DENSITY_PATHS = 3
const BIG_PATHS = 2
const QUIET_PER_PAIR = 200
const PROBE = { r2: 3706, pairs8: 714, pairs32: 583789 }

type Box = { f: LockedFresh; lines: MeshLines; vacuum: Configuration; center: number }

const boxOf = (side: number, contact: CollisionKind): Box => {
  const center = centerOf(side)
  const f = contactFresh(side, contact, center)

  return { f, lines: meshLines(f.tables), vacuum: wordVacuum(f, f.store), center }
}

const seeded = (box: Box, docks: number[]): Configuration => {
  const s = cloneConfiguration(box.vacuum)

  for (const x of docks) {
    s.vibe[x * 24 + 6] = 1
    s.open[x * 24 + 6] = 1
    s.vibe[x * 24 + 8] = -1
    s.open[x * 24 + 8] = 1
  }

  return s
}

// the vibe arrays of a run, beat by beat
function track(box: Box, start: Configuration, key: PathKey): Int8Array[] {
  const r = keyedRunner(box.f.tables, start, { key })
  const out: Int8Array[] = []

  for (let t = 0; t < BEATS; t++) {
    r.beat()
    out.push(Int8Array.from(r.state().vibe))
  }

  return out
}

// the mesh lines a track ever differs from the vacuum's on
function linesOf(box: Box, run: Int8Array[], v: Int8Array[]): number {
  const lines = new Set<number>()

  run.forEach((q, t) => {
    const p = v[t] as Int8Array

    for (let i = 0; i < p.length; i++) if (p[i] !== q[i]) lines.add(box.lines.lineOf[i] as number)
  })

  return lines.size
}

// two clusters at the center and r docks along the box index: non-additive slot-beats per r
function clusterPair(box: Box, key: PathKey, rs: readonly number[]): { r: number; nonAdditive: number; bLines: number }[] {
  const v = track(box, box.vacuum, key)
  const a = track(box, seeded(box, [box.center]), key)
  const aLines = linesOf(box, a, v)

  return [
    { r: 0, nonAdditive: 0, bLines: aLines },
    ...rs.map(r => {
      const bDock = (box.center + r) % box.f.cells
      const b = track(box, seeded(box, [bDock]), key)
      const ab = keyedRunner(box.f.tables, seeded(box, [box.center, bDock]), { key })
      let nonAdditive = 0

      for (let t = 0; t < BEATS; t++) {
        ab.beat()

        const q = ab.state().vibe
        const p = v[t] as Int8Array
        const pa = a[t] as Int8Array
        const pb = b[t] as Int8Array

        for (let i = 0; i < p.length; i++) {
          const inUnion = pa[i] !== p[i] || pb[i] !== p[i]

          if ((q[i] !== p[i]) !== inUnion) nonAdditive++
        }
      }

      return { r, nonAdditive, bLines: linesOf(box, b, v) }
    }),
  ]
}

// n pairs at golden Weyl docks: the wake every EVERY beats
function density(box: Box, key: PathKey, n: number): number[] {
  const a = keyedRunner(box.f.tables, box.vacuum, { key })
  const b = keyedRunner(box.f.tables, seeded(box, weylDocks(box.f.cells, n)), { key })
  const wake: number[] = []

  for (let t = 0; t < BEATS; t++) {
    a.beat()
    b.beat()
    if (t % EVERY === EVERY - 1) wake.push(tritsApart(b.state(), a.state()))
  }

  return wake
}

const mean = (xs: number[]): number => xs.reduce((s, x) => s + x, 0) / xs.length

export default experiment({
  id: 'gravity/cluster-density',
  code: 'E-GRV-0085',
  title:
    "two quiet clusters interact with no fall with distance on 'pass' and not at all on 'bounce', and the density at which pairs scramble the vacuum falls as the box grows, pass: on two full-key paths (side 16, 64 beats) non-additive slot-beats are 3.7 and 8.9 million at r = 1 (the box scrambles), 464 to 19,818 at r = 2 to 7 with no trend (far over near 0.98 and 0.86, where 1/r would give 0.46), and 0 at every r on 'bounce' with each cluster on its own 2 lines; the cluster is not one object (B touches 3, 11 or 12 lines by where it sits); 1 to 8 pairs level off (about 94 to 131 trits a pair) and 16, 32 and 64 scramble on three paths (16 pairs 517,922 to 576,000, where the registered key's run was only turning); on side 24, 40 pairs (the density of 8 on side 16) scramble (about 2 million) and 20 run away late on one path (13,638 and 93,677 at beat 64); the old key reproduces 3,706, 714 and 583,789",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const t0 = Date.now()
    const pass = boxOf(SIDE, 'pass')
    const keys = (n: number): PathKey[] => Array.from({ length: n }, (_, k) => fullPathKey(pathOffset(k)))
    const scrambled = (cells: number): number => (cells * 24) / 20

    // ---- D1, D2 ----
    const onPass = keys(PASS_PATHS).map(key => clusterPair(pass, key, RS))
    const oldR2 = clusterPair(pass, oldPathKey(pass.f.cells), [2])
    const bounce = boxOf(SIDE, 'bounce')
    const onBounce = keys(1).map(key => clusterPair(bounce, key, RS))
    const at = (rows: { r: number; nonAdditive: number }[], r: number): number => rows.find(x => x.r === r)!.nonAdditive
    const gD1 = onPass.every(rows => [2, 3, 4, 5, 6, 7].every(r => at(rows, r) > 0) && mean([5, 6, 7].map(r => at(rows, r))) >= 0.5 * mean([2, 3, 4].map(r => at(rows, r))))
    const gD2 = onBounce.every(rows => RS.every(r => at(rows, r) === 0) && rows.every(x => x.bLines === 2))

    // ---- D3, D4 ----
    const dens = keys(DENSITY_PATHS).map(key => DENSITIES.map(n => ({ n, wake: density(pass, key, n) })))
    const oldDens = [8, 32].map(n => ({ n, wake: density(pass, oldPathKey(pass.f.cells), n) }))
    const last = (w: number[]): number => w[w.length - 1] as number
    const gD3 = dens.every(rows => rows.every(({ n, wake }) => (n <= 8 ? wake.every(w => w <= QUIET_PER_PAIR * n) : n >= 32 ? last(wake) > scrambled(pass.f.cells) : true)))
    const big = boxOf(BIG, 'pass')
    const bigDens = keys(BIG_PATHS).map(key => BIG_DENSITIES.map(n => ({ n, wake: density(big, key, n) })))
    const gD4 = bigDens.every(rows => last(rows.find(x => x.n === 40)!.wake) > scrambled(big.f.cells))
    const control = at(oldR2, 2) === PROBE.r2 && last(oldDens[0]!.wake) === PROBE.pairs8 && last(oldDens[1]!.wake) === PROBE.pairs32
    const gates = [gD1, gD2, gD3, gD4]
    const status = !gates.every(Boolean) ? 'fail' : control ? 'pass' : 'partial'
    const metrics: Record<string, number> = {}

    gates.forEach((g, i) => (metrics[`gate_D${i + 1}`] = g ? 1 : 0))
    onPass.forEach((rows, k) => rows.forEach(x => x.r > 0 && (metrics[`path${k}_pass_r${x.r}`] = x.nonAdditive)))
    onPass.forEach((rows, k) => (metrics[`path${k}_farOverNear`] = mean([5, 6, 7].map(r => at(rows, r))) / mean([2, 3, 4].map(r => at(rows, r)))))
    onBounce.forEach((rows, k) => (metrics[`path${k}_bounceMostNonAdditive`] = Math.max(...rows.map(x => x.nonAdditive))))
    dens.forEach((rows, k) => rows.forEach(({ n, wake }) => (metrics[`path${k}_side16_pairs${n}_wake64`] = last(wake))))
    bigDens.forEach((rows, k) => rows.forEach(({ n, wake }) => (metrics[`path${k}_side24_pairs${n}_wake64`] = last(wake))))
    metrics.control = control ? 1 : 0
    metrics.seconds = (Date.now() - t0) / 1000

    return verdict({
      status,
      claim: `two love+fear clusters on 'pass' (side ${SIDE}, ${BEATS} beats, two full-key paths): non-additive slot-beats at r = 1 to 8 ${onPass.map(rows => rows.filter(x => x.r > 0).map(x => x.nonAdditive).join(', ')).join(' and ')}, far over near ${onPass.map((_, k) => (metrics[`path${k}_farOverNear`] as number).toFixed(2)).join('/')}; on 'bounce' at most ${Math.max(...onBounce.flat().map(x => x.nonAdditive))}; n pairs on side ${SIDE} at beat 64: ${dens.map(rows => rows.map(({ n, wake }) => `${n}: ${last(wake)}`).join(', ')).join(' | ')} (scrambled above ${scrambled(pass.f.cells)}); on side ${BIG}: ${bigDens.map(rows => rows.map(({ n, wake }) => `${n}: ${last(wake)}`).join(', ')).join(' | ')} (above ${scrambled(big.f.cells)})`,
      metrics,
      control: { oldR2: at(oldR2, 2), oldPairs8: last(oldDens[0]!.wake), oldPairs32: last(oldDens[1]!.wake) },
      notes: `L2. Gates ${gates.map((g, i) => `D${i + 1} ${g}`).join(', ')}; control ${control}. Lines touched by A (r 0) and by B alone per r on 'pass': ${onPass.map(rows => rows.map(x => `${x.r}:${x.bLines}`).join(' ')).join(' | ')}; on 'bounce': ${onBounce.map(rows => rows.map(x => `${x.r}:${x.bLines}/${x.nonAdditive}`).join(' ')).join(' | ')}. Density wakes every ${EVERY} beats, side ${SIDE}: ${dens.map((rows, k) => `path ${k}: ${rows.map(({ n, wake }) => `${n}: ${wake.join(' ')}`).join('; ')}`).join(' | ')}; side ${BIG}: ${bigDens.map((rows, k) => `path ${k}: ${rows.map(({ n, wake }) => `${n}: ${wake.join(' ')}`).join('; ')}`).join(' | ')}; old key: ${oldDens.map(({ n, wake }) => `${n}: ${wake.join(' ')}`).join('; ')}. ${((Date.now() - t0) / 1000).toFixed(0)} s.`,
    })
  },
})
