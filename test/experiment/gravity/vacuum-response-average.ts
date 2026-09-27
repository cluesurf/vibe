// THE PATH-AVERAGED VACUUM RESPONSE (E-GRV-0086). One path of the rule shows a sparse pair's disturbance on 12 mesh
// lines (E-SPN-0100): lines, not a 3d field. If gravity is the vacuum's elastic response to matter (Sakharov's picture),
// a 3d falloff can only appear as an EXPECTATION over many measurement records, each placing its lines differently.
// This file reads that expectation: one love+fear pair (slots 6 and 8 of the center dock), 24 genuinely different
// paths of the same rule (code/measure/full-key-paths fullPathKey at offsets pathOffset(0..23)), the vibe slots each
// seeded run differs from its own unseeded run on, summed per husk column over beats 16 to 63 and averaged over the
// paths, then averaged over shells of husk distance r (minimum image on the side-16 husk torus).
//
// PROBES before this file, disclosed: tmp/elastic-average-probe (the registered key, 24 start phases k 97): only 2
// distinct paths, because on side 16 that key does not depend on the beat (E-MTH-0029); per column 300.5 at r = 0,
// 29.2, 3.3, 3.6, 1.4, under 1 beyond. tmp/elastic-average-2 (a full-period key of stride 12, 24 offsets k 7919): 24
// distinct paths; 163.6 at r = 0, 18.3, 2.8, 3.2, 1.5, then 0.51, 0.67, 0.50, 0.30, 0.27, 0.24 out to r = 11; the core
// fits a + k e^(-r / 0.5) (rms 0.75) better than a + k / r (rms 1.38); the tail from r = 4 falls about as 1/r^2. The
// gates below are those findings, read before this file, re-read on this file's key (stride 18, so the paths are not
// the probe's): a rerun of disclosed findings, not predictions.
//
// GATES.
//  E1 the 24 paths are distinct: 24 distinct totals of disturbed slot-beats.
//  E2 a massive core: over r >= 1, a + k e^(-r / 0.5) fits the shell means with a smaller rms than a + k / r.
//  E3 no 1/r tail: over r = 4 to 11, k / r^2 fits the shell means with a smaller rms than k / r.
//  CONTROL: the registered key with the start phase shifted by k 97 beats, k = 0 to 7, gives at most 2 distinct totals
//     (the flawed record the probe found), and so cannot be averaged.
//  Verdict: pass if E1 to E3 and the control hold; fail otherwise.
//
// WHAT IT MEANS: the vacuum's average response to a sparse pair is a tight core of range about half a dock plus an
// outgoing flux along lines (1/r^2, what vibes streaming straight out give), not a static 1/r potential. On this rule
// and this box, the radion does not come out of the vacuum's average. Depth L2. DETERMINISM: no random numbers; the
// paths are integer Weyl offsets of a full-period key; the averages are floats (measurement). NOTHING MOVES.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { boxHusk } from '@/code/measure/causal-components'
import { cloneConfiguration } from '@/code/rule/doublet-locked-knit'
import { fullPathKey, keyedRunner, offsetAsBeats, oldPathKey, pathOffset, type PathKey } from '@/code/measure/full-key-paths'

const SIDE = 16
const BEATS = 64
const FROM = 16
const PATHS = 24
const OLD_PHASES = 8
const OLD_PHASE_STEP = 97
const CORE_RANGE = 0.5
const TAIL_FROM = 4
const TAIL_TO = 11

type Shell = { r: number; v: number }

// least squares of y = a + k g(r) over the given shells
function fit(rows: Shell[], g: (r: number) => number, constant: boolean): { a: number; k: number; rms: number } {
  const gx = rows.map(x => g(x.r))
  const mx = constant ? gx.reduce((s, v) => s + v, 0) / rows.length : 0
  const my = constant ? rows.reduce((s, x) => s + x.v, 0) / rows.length : 0
  let num = 0
  let den = 0

  rows.forEach((x, i) => {
    num += ((gx[i] as number) - mx) * (x.v - my)
    den += ((gx[i] as number) - mx) ** 2
  })

  const k = num / den
  const a = my - k * mx

  return { a, k, rms: Math.sqrt(rows.reduce((s, x, i) => s + (x.v - a - k * (gx[i] as number)) ** 2, 0) / rows.length) }
}

export default experiment({
  id: 'gravity/vacuum-response-average',
  code: 'E-GRV-0086',
  title:
    "the vacuum's response to one sparse pair, averaged over 24 genuinely different paths, is a massive core plus an outgoing tail and no 1/r, pass: on side 16 (beats 16 to 63, 24 distinct full-key records, read at least 1,639 beats apart) the mean disturbance per husk column is 181.0 at r = 0, 20.0, 3.0, 3.7, 1.6, then 0.53, 0.77, 0.57, 0.36, 0, 0.35, 0.31 out to r = 11; the core fits a + k e^(-r/0.5) (rms 0.84) better than a + k/r (1.54); the tail from r = 4 fits k/r^2 (rms 0.20) better than k/r (0.30), though its log-log slope on nonzero shells is only -1.40, between the two; the registered key gives 2 distinct records over 8 start phases (2,560 and 2,681 alternating), so it could not be averaged",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const t0 = Date.now()
    const center = centerOf(SIDE)
    const f = contactFresh(SIDE, 'pass', center)
    const husk = boxHusk(f.weave.mesh, SIDE)
    const vacuum = wordVacuum(f, f.store)
    const seeded = cloneConfiguration(vacuum)

    seeded.vibe[center * 24 + 6] = 1
    seeded.open[center * 24 + 6] = 1
    seeded.vibe[center * 24 + 8] = -1
    seeded.open[center * 24 + 8] = 1

    // one path: per husk column, the disturbed vibe slot-beats over beats FROM..BEATS-1, and their total
    const pathOf = (key: PathKey, phase: number): { columns: Float64Array; total: number } => {
      const a = keyedRunner(f.tables, vacuum, { key, phase })
      const b = keyedRunner(f.tables, seeded, { key, phase })
      const columns = new Float64Array(husk.columns)
      let total = 0

      for (let t = 0; t < BEATS; t++) {
        a.beat()
        b.beat()
        if (t < FROM) continue

        const p = a.state().vibe
        const q = b.state().vibe

        for (let i = 0; i < p.length; i++) {
          if (p[i] === q[i]) continue
          columns[husk.column[Math.floor(i / 24)] as number]! += 1
          total++
        }
      }

      return { columns, total }
    }

    const offsets = Array.from({ length: PATHS }, (_, k) => pathOffset(k))
    const paths = offsets.map(o => pathOf(fullPathKey(o), 0))
    const oldTotals = Array.from({ length: OLD_PHASES }, (_, k) => pathOf(oldPathKey(f.cells), k * OLD_PHASE_STEP).total)
    const mean = new Float64Array(husk.columns)

    for (const p of paths) for (let c = 0; c < husk.columns; c++) mean[c]! += (p.columns[c] as number) / PATHS

    const at = (c: number): number[] => [c % SIDE, Math.floor(c / SIDE) % SIDE, Math.floor(c / (SIDE * SIDE))]
    const p0 = at(husk.column[center] as number)
    const shells = new Map<number, { sum: number; n: number }>()

    for (let c = 0; c < husk.columns; c++) {
      const r = Math.round(Math.sqrt(at(c).reduce((s, v, j) => s + Math.min(Math.abs(v - (p0[j] as number)), SIDE - Math.abs(v - (p0[j] as number))) ** 2, 0)))
      const e = shells.get(r) ?? { sum: 0, n: 0 }

      e.sum += mean[c] as number
      e.n++
      shells.set(r, e)
    }

    const rows: Shell[] = [...shells.entries()].sort((x, y) => x[0] - y[0]).map(([r, e]) => ({ r, v: e.sum / e.n }))
    const outer = rows.filter(x => x.r >= 1)
    const tail = rows.filter(x => x.r >= TAIL_FROM && x.r <= TAIL_TO)
    const inverse = fit(outer, r => 1 / r, true)
    const core = fit(outer, r => Math.exp(-r / CORE_RANGE), true)
    const tailInverse = fit(tail, r => 1 / r, false)
    const tailSquare = fit(tail, r => 1 / (r * r), false)
    const positive = tail.filter(x => x.v > 0)
    const logSlope = fit(
      positive.map(x => ({ r: Math.log(x.r), v: Math.log(x.v) })),
      r => r,
      true,
    ).k
    const distinct = new Set(paths.map(p => p.total)).size
    const oldDistinct = new Set(oldTotals).size
    const gE1 = distinct === PATHS
    const gE2 = core.rms < inverse.rms
    const gE3 = tailSquare.rms < tailInverse.rms
    const control = oldDistinct <= 2
    const status = gE1 && gE2 && gE3 && control ? 'pass' : 'fail'
    const beats = offsets.map(offsetAsBeats).sort((x, y) => x - y)
    const gaps = beats.map((b, i) => (i + 1 < beats.length ? (beats[i + 1] as number) - b : 65536 - b + (beats[0] as number)))
    const metrics: Record<string, number> = {
      gate_E1: gE1 ? 1 : 0,
      gate_E2: gE2 ? 1 : 0,
      gate_E3: gE3 ? 1 : 0,
      control: control ? 1 : 0,
      distinctTotals: distinct,
      oldDistinctTotals: oldDistinct,
      coreRms: core.rms,
      coreK: core.k,
      inverseRms: inverse.rms,
      tailSquareRms: tailSquare.rms,
      tailInverseRms: tailInverse.rms,
      tailLogSlope: logSlope,
      leastRecordGapBeats: Math.min(...gaps),
      seconds: (Date.now() - t0) / 1000,
    }

    for (const x of rows) metrics[`shell${x.r}`] = x.v

    return verdict({
      status,
      claim: `one love+fear pair's disturbance per husk column averaged over ${PATHS} full-key paths (${distinct} distinct; side ${SIDE}, beats ${FROM} to ${BEATS - 1}): ${rows.map(x => `${x.r}: ${x.v.toFixed(3)}`).join(', ')}; the core fits a + k e^(-r/${CORE_RANGE}) with rms ${core.rms.toFixed(3)} against ${inverse.rms.toFixed(3)} for a + k/r; the tail r = ${TAIL_FROM} to ${TAIL_TO} fits k/r^2 with rms ${tailSquare.rms.toFixed(3)} against ${tailInverse.rms.toFixed(3)} for k/r (log-log slope ${logSlope.toFixed(2)} on its nonzero shells); the registered key gives ${oldDistinct} distinct totals over ${OLD_PHASES} start phases`,
      metrics,
      control: { oldDistinctTotals: oldDistinct, oldTotal0: oldTotals[0]!, oldTotal1: oldTotals[1]! },
      notes: `L2. E1 ${gE1}, E2 ${gE2}, E3 ${gE3}, control ${control}. Path totals: ${paths.map(p => p.total).join(' ')}; old-key totals by phase: ${oldTotals.join(' ')}. The offsets read the one full-period record ${Math.min(...gaps)} or more beats apart (64 are run), so no two paths share a stretch of it. Fits over r >= 1: a + k/r a ${inverse.a.toFixed(3)} k ${inverse.k.toFixed(3)}; a + k e^(-r/${CORE_RANGE}) a ${core.a.toFixed(3)} k ${core.k.toFixed(3)}; tail k/r k ${tailInverse.k.toFixed(3)}, k/r^2 k ${tailSquare.k.toFixed(3)}. ${((Date.now() - t0) / 1000).toFixed(0)} s.`,
    })
  },
})
