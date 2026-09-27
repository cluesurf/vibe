// THE PATH KEY'S FLAW, AND A FULL-PERIOD KEY (E-MTH-0029). Every path of the all-open rule read so far fixed its
// keep-or-exchange choices by code/measure/doublet-locked-readings exchangeAt, ((t cells + x) 12 + l) 27145 + 12345
// mod 65536, and its frame mixer by code/measure/occupation-veto-readings mixBin, the same shape with 3 frames. On a
// D4 box of side 16, cells = 2^16, so t cells vanishes mod 2^16 and the key does not depend on the beat; on sides 8
// and 24, cells 12 carries 2^14, so the key repeats every 4 beats. Found (step-back.md, "An instrument flaw") when 24
// shifts of the start phase gave 2 distinct paths (tmp/elastic-average-probe). This file states the flaw as counts and
// reruns the probe that checked it did not make the findings (tmp/fixed-key-probe).
//
// THE KEY this file names: code/measure/full-key-paths fullKey(t, x, l, offset) = (t 40503 + (x 18 + l) 27145 + 12345
// + offset) mod 65536, 18 key slots a dock (12 lines, 3 frames for the vibe mixer, 3 for the store mixer). exchangeAt
// and mixBin are NOT changed, so every registered experiment still reproduces its record on them.
//
// PROBES before this file, disclosed: tmp/elastic-average-probe (2 distinct paths of 24), tmp/fixed-key-probe (the
// rerun below, with a key of stride 12 whose frame mixer read the next dock's line key; this file's key has stride
// 18, so its full-key numbers are not the probe's and are read afresh). The gates below are the probe's own findings,
// read before this file: a rerun of disclosed findings on a named instrument, not fresh predictions.
//
// GATES.
//  K1 the flaw, counted: over 64 beats, the number of distinct old line keys of every (dock, line) is 1 on side 16 and
//     4 on sides 8 and 24, for every slot. REPORTED beside it: the old frame key (mixBin's shape) per (dock, frame).
//  K2 the fix, counted: the full key takes 64 distinct values over 64 beats on every line, frame and store slot of
//     sides 8, 16 and 24.
//  K3 the findings hold on both keys (side 16, 'pass', veto 'none', Born path, coin on, 64 beats, the wake = trits
//     apart from the unseeded run on the same key and mixer): one lone love stays quiet (wake at most 100 at every
//     sampled beat); one lone love with G scrambles (wake above a twentieth of the slots by beat 64); 8 lone pairs
//     (love at slot 6, fear at slot 8, golden Weyl docks) stay quiet (at most 200 a pair at every sample); 32 pairs
//     scramble. 16 pairs are reported, not gated (the probe: turning at beat 64 on the old key, scrambled on its new).
//  CONTROL: the old key through code/measure/full-key-paths keyedRunner equals vetoPathRunner bit for bit (the runner
//     reproduces the registered record), checked beat by beat on the lone love with and without G.
//  Verdict: pass if K1 to K3 and the control hold; fail otherwise.
//
// Depth L1: a counting fact about an integer key, and a rerun of path readings on a corrected instrument.
// DETERMINISM: no random numbers; keys are integer Weyl numbers, pairs sit at golden Weyl docks. NOTHING MOVES.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { samePoints, THRESHOLD_BORN, tritsApart } from '@/code/measure/doublet-locked-readings'
import { contactFresh, vetoPathRunner } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { cloneConfiguration, type Configuration } from '@/code/rule/doublet-locked-knit'
import { fullPathKey, keyedRunner, oldPathKey, weylDocks, type PathKey } from '@/code/measure/full-key-paths'
import { d4BoxMesh } from '@/code/substrate/d4-box-integer'

const BEATS = 64
const COUNT_SIDES = [8, 16, 24] as const
const SIDE = 16
const EVERY = 8
const QUIET_LONE = 100
const QUIET_PER_PAIR = 200

// distinct values of key(t, slot) over beats 0..BEATS-1, least and most over every slot
function distinctPerSlot(cells: number, slots: number, key: (t: number, x: number, s: number) => number): { least: number; most: number } {
  const stamp = new Int32Array(65536)
  let least = Infinity
  let most = 0
  let mark = 0

  for (let x = 0; x < cells; x++) {
    for (let s = 0; s < slots; s++) {
      mark++

      let n = 0

      for (let t = 0; t < BEATS; t++) {
        const k = key(t, x, s)

        if (stamp[k] !== mark) {
          stamp[k] = mark
          n++
        }
      }

      least = Math.min(least, n)
      most = Math.max(most, n)
    }
  }

  return { least, most }
}

type Case = { name: string; mix: number; place: (s: Configuration, cells: number, center: number) => void; gate: 'quiet' | 'scrambled' | 'report'; pairs: number }

const pairsAt = (s: Configuration, docks: number[]): void => {
  for (const x of docks) {
    s.vibe[x * 24 + 6] = 1
    s.open[x * 24 + 6] = 1
    s.vibe[x * 24 + 8] = -1
    s.open[x * 24 + 8] = 1
  }
}

const CASES: Case[] = [
  { name: 'lone', mix: 0, place: (s, _c, x) => ((s.vibe[x * 24] = 1), (s.open[x * 24] = 1)), gate: 'quiet', pairs: 0 },
  { name: 'loneG', mix: 4, place: (s, _c, x) => ((s.vibe[x * 24] = 1), (s.open[x * 24] = 1)), gate: 'scrambled', pairs: 0 },
  { name: 'pairs8', mix: 0, place: (s, c) => pairsAt(s, weylDocks(c, 8)), gate: 'quiet', pairs: 8 },
  { name: 'pairs16', mix: 0, place: (s, c) => pairsAt(s, weylDocks(c, 16)), gate: 'report', pairs: 16 },
  { name: 'pairs32', mix: 0, place: (s, c) => pairsAt(s, weylDocks(c, 32)), gate: 'scrambled', pairs: 32 },
]

export default experiment({
  id: 'method/full-period-key',
  code: 'E-MTH-0029',
  title:
    "the registered path key does not run through the beat, and a named full-period key reads the same findings, pass: over 64 beats exchangeAt's key takes 1 value per dock line on side 16 and 4 on sides 8 and 24 (mixBin's frame key 1 and 16), while fullKey (t 40503 + (x 18 + l) 27145 + 12345 + offset) mod 2^16 takes 64 on every line, frame and store slot; rerun on it (side 16, 'pass', Born path, 64 beats) a lone love stays quiet (23 trits apart at beat 64, 4 on the old key), G scrambles and faster (595,934; 41,057 by beat 32 against 1,179), 8 pairs stay quiet (1,039 against 714) and 32 scramble (594,083 against 583,789), and 16 pairs scramble on the full key (576,000) where the old key's run was only turning (17,544); the old key through the new runner reproduces vetoPathRunner bit for bit",
  category: 'method',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const t0 = Date.now()
    const metrics: Record<string, number> = {}
    const counts: string[] = []
    let k1 = true
    let k2 = true

    for (const side of COUNT_SIDES) {
      const cells = d4BoxMesh({ side }).cellCount
      const old = oldPathKey(cells)
      const full = fullPathKey(0)
      const oldLine = distinctPerSlot(cells, 12, old.line)
      const oldFrame = distinctPerSlot(cells, 3, old.frame)
      const fullLine = distinctPerSlot(cells, 12, full.line)
      const fullFrame = distinctPerSlot(cells, 3, full.frame)
      const fullStore = distinctPerSlot(cells, 3, full.store)
      const want = side === 16 ? 1 : 4

      k1 &&= oldLine.least === want && oldLine.most === want
      k2 &&= [fullLine, fullFrame, fullStore].every(r => r.least === BEATS && r.most === BEATS)
      metrics[`side${side}_oldLineDistinct`] = oldLine.most
      metrics[`side${side}_oldLineDistinctLeast`] = oldLine.least
      metrics[`side${side}_oldFrameDistinct`] = oldFrame.most
      metrics[`side${side}_fullLineDistinctLeast`] = fullLine.least
      metrics[`side${side}_fullFrameDistinctLeast`] = fullFrame.least
      metrics[`side${side}_fullStoreDistinctLeast`] = fullStore.least
      counts.push(`side ${side} (${cells} docks): old line key ${oldLine.least} to ${oldLine.most} distinct a slot, old frame key ${oldFrame.least} to ${oldFrame.most}; full key lines ${fullLine.least} to ${fullLine.most}, frames ${fullFrame.least} to ${fullFrame.most}, stores ${fullStore.least} to ${fullStore.most}`)
    }

    // ---- the rerun ----
    const center = centerOf(SIDE)
    const f = contactFresh(SIDE, 'pass', center)
    const vacuum = wordVacuum(f, f.store)
    const slots = f.cells * 24 + f.cells * 12
    const scrambled = (f.cells * 24) / 20
    const keys: PathKey[] = [oldPathKey(f.cells), fullPathKey(0)]
    const rows: string[] = []
    let k3 = true
    let control = true

    for (const c of CASES) {
      for (const key of keys) {
        const start = cloneConfiguration(vacuum)

        c.place(start, f.cells, center)

        const a = keyedRunner(f.tables, vacuum, { key, mix: c.mix })
        const b = keyedRunner(f.tables, start, { key, mix: c.mix })
        // the control: the old key reproduces vetoPathRunner bit for bit on the lone cases
        const check = key.name === 'old' && c.pairs === 0 ? vetoPathRunner('none', f.tables, start, THRESHOLD_BORN, 0, true, c.mix === 4) : undefined
        const wake: number[] = []

        for (let t = 0; t < BEATS; t++) {
          a.beat()
          b.beat()
          if (check) {
            check.beat()
            control &&= samePoints(check.state(), b.state())
          }
          if (t % EVERY === EVERY - 1) wake.push(tritsApart(b.state(), a.state()))
        }

        const last = wake[wake.length - 1] as number
        const ok = c.gate === 'report' ? true : c.gate === 'scrambled' ? last > scrambled : wake.every(w => w <= (c.pairs === 0 ? QUIET_LONE : QUIET_PER_PAIR * c.pairs))

        k3 &&= ok
        metrics[`${c.name}_${key.name === 'old' ? 'old' : 'full'}_wake64`] = last
        metrics[`${c.name}_${key.name === 'old' ? 'old' : 'full'}_wake32`] = wake[3] as number
        rows.push(`${c.name} ${key.name}: ${wake.join(' ')}${c.gate === 'report' ? '' : ` (${c.gate} ${ok})`}`)
      }
    }

    const status = k1 && k2 && k3 && control ? 'pass' : 'fail'

    metrics.gate_K1 = k1 ? 1 : 0
    metrics.gate_K2 = k2 ? 1 : 0
    metrics.gate_K3 = k3 ? 1 : 0
    metrics.controlBitForBit = control ? 1 : 0
    metrics.slots = slots
    metrics.seconds = (Date.now() - t0) / 1000

    return verdict({
      status,
      claim: `the registered path key does not run through the beat: ${counts.join('; ')}; the findings of the probe hold on the full key (${rows.join('; ')})`,
      metrics,
      control: { oldKeyBitForBit: control ? 1 : 0 },
      notes: `L1. K1 ${k1}, K2 ${k2}, K3 ${k3}, control ${control}. Wake = trits apart (vibes and stores) from the unseeded run on the same key, every ${EVERY} beats, side ${SIDE}; quiet bound ${QUIET_LONE} (lone) or ${QUIET_PER_PAIR} a pair, scrambled above ${scrambled}. ${((Date.now() - t0) / 1000).toFixed(0)} s.`,
    })
  },
})
