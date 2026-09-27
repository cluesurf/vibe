// THE PARTIAL CONTACT (E-SPN-0101). Under 'pass', K on a dock of more than one single rotates the vacuum's full lines
// onto other lines: a sparse pair reaches 10 vacuum lines and stays quiet (E-SPN-0100), and dense matter scrambles
// the box (E-GRV-0085). 'bounce' carries no full line and has no reach at all. This file reads a middle contact built
// for the question, code/rule/partial-contact-knit: full lines turn (or pass, for two like vibes) as under 'pass'; a
// non-full line whose image under w_P is also non-full takes w_P; every other line is left alone. It reads the
// occupation only, it is a slot permutation and an involution, and it never carries a vacuum line anywhere.
//
// PROBE before this file, disclosed: tmp/partial-contact-probe (side 16, 64 beats, the registered key, which on side 16
// does not depend on the beat, E-MTH-0029): the partial contact leaves the vacuum's history exactly as 'pass' does (0
// trits apart over 24 beats), momentum never broke (0), it is quiet at every density (8, 16, 32 and 64 pairs: 87, 148,
// 311 and 717 vibe slots apart at beat 64), and it has no reach (0 lines off the seeds for every seed; the 6+8 pair
// sits at a wake of 2), where 'pass' takes the 6+8 pair to 10 lines and scrambles from 16 pairs on. The gates below are
// those findings, read before this file, re-read on the full-period key (code/measure/full-key-paths fullPathKey) on
// two paths, with the old key as the control: a rerun of disclosed findings, not predictions.
//
// GATES (side 16, Born path, coin on, no mixer, 64 beats; the wake is the vibe slots differing from the unseeded run on
// the same contact and key; seeds: one lone love at the center dock's slot 0, the 6+8 love+fear pair there, and n
// such pairs at golden Weyl docks, n = 8, 16, 32, 64):
//  P1 the vacuum's history under the partial contact equals 'pass''s over 24 beats (0 trits apart) on every path.
//  P2 momentum: the moved singles' occupation momentum never changes, on every run (0 breaks).
//  P3 quiet at every density: every partial-contact run holds its wake at or under 50 slots a seeded pair (100 for
//     the lone love) at every sampled beat, while 'pass' with 32 pairs passes a twentieth of the slots by beat 64 (the
//     contrast that could have gone the other way).
//  P4 no reach: every partial-contact run touches 0 mesh lines off its seeds' own, while 'pass' takes the 6+8 pair
//     to at least one.
//  CONTROL: the old key reproduces the probe's 717 (64 pairs) and 2 (the 6+8 pair) at beat 64, and 'pass''s 486,238 at
//     32 pairs.
//  Verdict: pass if P1 to P4 hold and the control reproduces; partial if only the control fails; fail otherwise.
//
// WHAT IT MEANS: without K's rotation of vacuum lines, matter neither scrambles nor reaches across lines. The reach
// across lines under 'pass' was the vacuum's own lines being turned, not the matter moving. Depth L2: a contact rule
// built by hand and read on its runs. DETERMINISM: no random numbers; paths are integer Weyl offsets of the key, and
// pairs sit at golden Weyl docks. NOTHING MOVES.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { tritsApart } from '@/code/measure/doublet-locked-readings'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { cloneConfiguration, type Configuration, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { collidePartial, newPartialTally, type PartialTally } from '@/code/rule/partial-contact-knit'
import { fullPathKey, keyedRunner, meshLines, oldPathKey, pathOffset, vibesApart, weylDocks, type PathKey } from '@/code/measure/full-key-paths'

const SIDE = 16
const BEATS = 64
const HISTORY_BEATS = 24
const EVERY = 8
const PATHS = 2
const DENSITIES = [8, 16, 32, 64] as const
const QUIET_LONE = 100
const QUIET_PER_PAIR = 50
const PROBE = { pairs64: 717, pair68: 2, pass32: 486238 }

type Seed = { name: string; pairs: number; place: (s: Configuration) => void }
type Run = { wake: number[]; off: number; momentumBreaks: number; scatters: number }

export default experiment({
  id: 'spin/partial-contact',
  code: 'E-SPN-0101',
  title:
    "a partial contact that never turns a vacuum line keeps the vacuum and quiets matter at every density, but takes away all reach across lines, pass: on two full-key paths (side 16, 64 beats) it leaves the vacuum's history exactly as 'pass' does (0 trits over 24 beats), no momentum break on any run, 8, 16, 32 and 64 pairs hold wakes of about 141, 282, 495 and 1,120 (about 18 a pair) where 'pass' scrambles 32 pairs to about 495,000, and 0 lines off the seeds for every seed where 'pass' takes the 6+8 pair to 10; so the reach across lines under 'pass' was K turning the vacuum's own lines; the old key reproduces the probe (717, 2, 486,238)",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const t0 = Date.now()
    const center = centerOf(SIDE)
    const f = contactFresh(SIDE, 'pass', center)
    const tables = f.tables
    const lines = meshLines(tables)
    const vacuum = wordVacuum(f, f.store)
    const scrambled = (f.cells * 24) / 20
    const pairAt = (s: Configuration, x: number): void => {
      s.vibe[x * 24 + 6] = 1
      s.open[x * 24 + 6] = 1
      s.vibe[x * 24 + 8] = -1
      s.open[x * 24 + 8] = 1
    }
    const seeds: Seed[] = [
      { name: 'lone', pairs: 0, place: s => ((s.vibe[center * 24] = 1), (s.open[center * 24] = 1)) },
      { name: 'pair68', pairs: 1, place: s => pairAt(s, center) },
      ...DENSITIES.map(n => ({ name: `pairs${n}`, pairs: n, place: (s: Configuration) => weylDocks(f.cells, n).forEach(x => pairAt(s, x)) })),
    ]
    const partialOf = (tally: PartialTally) => (t: LockedTables, c: Configuration, beat: number) => collidePartial(t, c, beat, tally)

    const history = (key: PathKey): { apart: number; breaks: number } => {
      const tally = newPartialTally()
      const p = keyedRunner(tables, vacuum, { key, collide: partialOf(tally) })
      const q = keyedRunner(tables, vacuum, { key })
      let apart = 0

      for (let t = 0; t < HISTORY_BEATS; t++) {
        p.beat()
        q.beat()
        apart += tritsApart(p.state(), q.state())
      }

      return { apart, breaks: tally.momentumBreaks }
    }

    const run = (seed: Seed, key: PathKey, partial: boolean): Run => {
      const tally = newPartialTally()
      const collide = partial ? partialOf(tally) : undefined
      const start = cloneConfiguration(vacuum)

      seed.place(start)

      const seedLines = new Set<number>()

      for (let i = 0; i < start.vibe.length; i++) if (start.vibe[i] !== vacuum.vibe[i]) seedLines.add(lines.lineOf[i] as number)

      // the unseeded run takes its own tally, so the seeded tally counts the seeded run alone
      const a = keyedRunner(tables, vacuum, { key, collide: partial ? partialOf(newPartialTally()) : undefined })
      const b = keyedRunner(tables, start, { key, collide })
      const wake: number[] = []
      const off = new Set<number>()

      for (let t = 0; t < BEATS; t++) {
        a.beat()
        b.beat()

        const p = a.state()
        const q = b.state()

        for (let i = 0; i < p.vibe.length; i++) if (p.vibe[i] !== q.vibe[i] && !seedLines.has(lines.lineOf[i] as number)) off.add(lines.lineOf[i] as number)
        if (t % EVERY === EVERY - 1) wake.push(vibesApart(p, q))
      }

      return { wake, off: off.size, momentumBreaks: tally.momentumBreaks, scatters: tally.scatters }
    }

    const keys = Array.from({ length: PATHS }, (_, k) => fullPathKey(pathOffset(k)))
    const histories = keys.map(history)
    const partial = keys.map(key => seeds.map(seed => ({ seed, run: run(seed, key, true) })))
    const pass = keys.map(key => seeds.filter(s => s.name === 'pair68' || s.name === 'pairs32').map(seed => ({ seed, run: run(seed, key, false) })))
    const oldKey = oldPathKey(f.cells)
    const oldPartial = seeds.filter(s => s.name === 'pair68' || s.name === 'pairs64').map(seed => ({ seed, run: run(seed, oldKey, true) }))
    const oldPass32 = run(seeds.find(s => s.name === 'pairs32')!, oldKey, false)

    const last = (r: Run): number => r.wake[r.wake.length - 1] as number
    const gP1 = histories.every(h => h.apart === 0)
    const gP2 = histories.every(h => h.breaks === 0) && partial.flat().every(x => x.run.momentumBreaks === 0)
    const quiet = partial.flat().every(({ seed, run: r }) => r.wake.every(w => w <= (seed.pairs === 0 ? QUIET_LONE : QUIET_PER_PAIR * seed.pairs)))
    const contrastScramble = pass.every(ps => last(ps.find(x => x.seed.name === 'pairs32')!.run) > scrambled)
    const gP3 = quiet && contrastScramble
    const noReach = partial.flat().every(x => x.run.off === 0)
    const contrastReach = pass.every(ps => ps.find(x => x.seed.name === 'pair68')!.run.off > 0)
    const gP4 = noReach && contrastReach
    const control = last(oldPartial.find(x => x.seed.name === 'pairs64')!.run) === PROBE.pairs64 && last(oldPartial.find(x => x.seed.name === 'pair68')!.run) === PROBE.pair68 && last(oldPass32) === PROBE.pass32
    const gates = [gP1, gP2, gP3, gP4]
    const status = !gates.every(Boolean) ? 'fail' : control ? 'pass' : 'partial'
    const metrics: Record<string, number> = {}

    gates.forEach((g, i) => (metrics[`gate_P${i + 1}`] = g ? 1 : 0))
    histories.forEach((h, k) => (metrics[`path${k}_historyApart`] = h.apart))
    partial.forEach((rs, k) =>
      rs.forEach(({ seed, run: r }) => {
        metrics[`path${k}_${seed.name}_wake64`] = last(r)
        metrics[`path${k}_${seed.name}_wakeMax`] = Math.max(...r.wake)
        metrics[`path${k}_${seed.name}_off`] = r.off
        metrics[`path${k}_${seed.name}_scatters`] = r.scatters
      }),
    )
    pass.forEach((rs, k) =>
      rs.forEach(({ seed, run: r }) => {
        metrics[`path${k}_pass_${seed.name}_wake64`] = last(r)
        metrics[`path${k}_pass_${seed.name}_off`] = r.off
      }),
    )
    metrics.control = control ? 1 : 0
    metrics.seconds = (Date.now() - t0) / 1000

    const row = ({ seed, run: r }: { seed: Seed; run: Run }): string => `${seed.name} ${r.wake.join(' ')} (off ${r.off}, scatters ${r.scatters}, momentum breaks ${r.momentumBreaks})`

    return verdict({
      status,
      claim: `the partial contact on two full-key paths (side ${SIDE}, ${BEATS} beats): the vacuum's history off 'pass''s by ${histories.map(h => h.apart).join('/')} trits over ${HISTORY_BEATS} beats; momentum breaks ${Math.max(...histories.map(h => h.breaks), ...partial.flat().map(x => x.run.momentumBreaks))}; at 8, 16, 32 and 64 pairs the wake at beat 64 is ${partial.map(rs => DENSITIES.map(n => last(rs.find(x => x.seed.name === `pairs${n}`)!.run)).join('/')).join(' and ')} (quiet at every density: ${quiet}), against 'pass''s ${pass.map(ps => last(ps.find(x => x.seed.name === 'pairs32')!.run)).join('/')} at 32 pairs; lines off the seeds under the partial contact ${Math.max(...partial.flat().map(x => x.run.off))} for every seed, against 'pass''s ${pass.map(ps => ps.find(x => x.seed.name === 'pair68')!.run.off).join('/')} for the 6+8 pair`,
      metrics,
      control: { oldPairs64: last(oldPartial.find(x => x.seed.name === 'pairs64')!.run), oldPair68: last(oldPartial.find(x => x.seed.name === 'pair68')!.run), oldPass32: last(oldPass32) },
      notes: `L2. Gates ${gates.map((g, i) => `P${i + 1} ${g}`).join(', ')}; control ${control}. Wake every ${EVERY} beats, partial contact, per path: ${partial.map((rs, k) => `path ${k}: ${rs.map(row).join('; ')}`).join(' | ')}. 'pass': ${pass.map((rs, k) => `path ${k}: ${rs.map(row).join('; ')}`).join(' | ')}. ${((Date.now() - t0) / 1000).toFixed(0)} s.`,
    })
  },
})
