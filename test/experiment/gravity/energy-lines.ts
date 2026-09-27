// ENERGY LINES DRAGGED BY THE RULE (E-GRV-0106). Can the gravitational source be produced by the rule instead of placed
// by hand? The rule conserves E = count + 2 sum |tau| exactly and locally (code/rule/bounce-pair-knit: a stored pair
// counts 2 and releases 2 vibes), E is never negative, and general relativity's source is energy. So let each vibe DRAG
// one unit of energy line along the bulk link it crosses when the stream takes its value there, the way the light's
// string trit is the flux a vibe dragged (code/rule/trit-column), and let each store hold its two. Then Gauss's law for
// energy holds on every dock and every beat with no line placed after beat 0, because energy is conserved dock by dock.
// note/research/vibe/roadmap/discrete-gravity.md, Part 5e.
//
// THE REGISTER (code/measure/energy-lines, whose header derives it): one integer L per bulk link (dock x, line l: the
// link from x along the line's first root). A vibe taken forward across it lowers L by one, backward raises it by one;
// opposite lines cancel, so L is a NET count. What the rule guarantees, derived:
//  - per beat a link changes by -1, 0 or +1 (two slots use it, in opposite senses; the take is a permutation);
//  - div L - e is the same on every dock on every beat (every piece of the collision acts inside one dock and keeps its
//    e, and the stream moves one unit per vibe per link), so Gauss is exact whatever L_0 is;
//  - NOTHING in the rule bounds L itself: L_t = L_0 - (net vibes taken across the link since beat 0), and around a
//    closed loop of links that is the vibes' circulation, which Gauss does not fix. On a mesh line (a ring of 16 docks
//    along one root on side 16) whose vibes stay on it, the differences of L along the ring are fixed by the ring's
//    energy, but the ring's mean grows by the ring's momentum every beat: a vibe that goes once around the box adds one
//    to every link of the ring. The coin flips a lone vibe's direction, so a wake's circulation walks. A trit suffices
//    only where the vibes' circulation stays within one unit.
//
// BEAT-0 LINES (the only lines placed): the vacuum's lines are zero, so the vacuum's start energy is its own background
// (b = -e_0: div L_t = e_t - e_0). A seeded lump (a love at slot 6 and a fear at slot 8 of the center dock, E-GRV-0086's
// pair, energy 2) adds its 2 units as two unit lines from its dock to the antipode dock (code/measure/energy-lines
// routeUnits, one unit a link), so b = -e_vac,0 - 2 at the antipode: on a closed box the lines of a positive content
// must end somewhere, as E-GRV-0090's far sinks did.
//
// DISCLOSED PROBES (instrument only; the gates below were fixed after them and are reruns of disclosed findings):
// tmp/eline-probe1.log (side 8, 512 beats, lines zero at beat 0 in both runs): Gauss 0 off; the vacuum's lines never
// leave a trit and are all zero again at beats 8, 32, 128, 512; the seeded run's reach 2, 3, 4, 6, 7, 12, 12 at beats 4
// to 512 (77 links past a trit at 512); the lines' runner equals keyedRunner bit for bit; 64 beats reverse exactly.
// tmp/eline-probe2.log (side 16, 256 beats): the vacuum's lines stay a trit and are zero at beats 3, 8, 11, 12, 15, ...;
// no vacuum vibe leaves its mesh line (0 ring energy changes); the seeded lines minus the vacuum's reach 8 at beat 256,
// their ring winding (the ring's sum over its 16 links) 4.4 units and the spread along one ring 12, and 334 ring energy
// changes (vibes of the wake move between rings at docks with more than one single line). tmp/eline-probe3.log (side 16,
// 256 beats, the placed antipode lines): Gauss 0 off in both runs, the store-once control off 11,550,720 times; the
// vacuum's lines back at zero on 85 beats (first 3, last 255), their largest husk flux 32 in each half; the seeded
// lines reach 8; 256 beats reverse exactly. The vacuum's time-averaged column energy is NOT uniform (74.5 to 160.5 a
// column), and its lines' time-averaged husk flux reaches 13.4: a background that stays, not a zero one.
//
// GATES (the working vacuum: 'pass' contact, no veto, the coin, no mixer, the full-period key full+0; side 8 for 512
// beats and side 16 for 256 beats; a vacuum run and a seeded run on each):
//  E1 energy Gauss exact: div L - e equals its beat-0 value on every dock after every beat of every run (0 off), and
//     the lines' runner is the registered keyed path bit for bit (its final configuration equals keyedRunner's).
//     CONTROL: the same lines against the energy with a store counted ONCE (count + sum |tau|) must be off on some dock
//     (the store must hold its two; a check that cannot fail proves nothing).
//  E2 every register a trit: |L| <= 1 on every link after every beat of every run. (Disclosed: the seeded runs leave the
//     trit; the gate is the bound the idea needs, kept as stated.)
//  E3 exact reversal of the rule plus its lines: every run run back to beat 0 returns its start configuration and its
//     beat-0 lines bit for bit.
//  E4 the vacuum's lines are a background that does not grow: in both vacuum runs every line stays a trit, the lines
//     return exactly to their beat-0 value at least once in every quarter of the run, and the largest husk column sum
//     (the husk flux, code/measure/energy-lines addHuskFlux) over the run's second half is at most its largest over the
//     first half.
//  Verdict: pass if E1 to E4 and the control hold; fail otherwise.
// REPORTED: the seeded lines' growth (largest |L| at powers of two, and its log-log slope against the beat), and the
// split of the seeded-minus-vacuum lines on the mesh lines into ring winding (sum over the ring / its length) and ring
// spread (largest minus least on the ring).
//
// FIRST RUN (tmp/grv-lines-run1.log, 130 s, the record): fail on E2, no gate moved. E1: Gauss 0 off in all four runs,
// the store-once control off 1,443,840 to 11,552,704 times, every run equal to keyedRunner. E3: all four reverse with
// their lines. E4: the vacuum's lines stay a trit, return to zero in every quarter, husk flux 16 then 16 (side 8), 32 then
// 32 (side 16). E2: the seeded lines reach 12 by beat 256 and 13 overall on side 8 (log-log slope 0.43) and 8 on side 16
// (slope 0.47, diffusive); the seeded-minus-vacuum lines wind 9.875 (side 8) and 4.375 (side 16) units on 12 rings,
// spread 5 and 12. Title written after the run.
//
// Depth L1 for E1 (a continuity equation for a conserved quantity: exact because the rule conserves energy dock by dock,
// which is what is tested) and L2 for the rest. DETERMINISM: no random numbers; one full-period path. NOTHING MOVES:
// the lines are read off the values the stream took.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { boxHusk } from '@/code/measure/causal-components'
import { cloneConfiguration, sameConfiguration, type Configuration } from '@/code/rule/doublet-locked-knit'
import { fullPathKey, keyedRunner, meshLines } from '@/code/measure/full-key-paths'
import { d4BoxCell } from '@/code/substrate/d4-box-integer'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { addHuskFlux, bulkLinks, dockEnergies, gaussBackground, huskCast, lineDivergence, lineRunner, routeUnits } from '@/code/measure/energy-lines'

const RUNS: readonly { side: number; beats: number }[] = [
  { side: 8, beats: 512 },
  { side: 16, beats: 256 },
]
const TRIT = 1
const LUMP_ENERGY = 2

type Run = {
  side: number
  kind: 'vacuum' | 'seeded'
  gaussOff: number
  controlOff: number
  maxAbs: number
  growth: string
  slope: number
  reversed: boolean
  sameAsKeyed: boolean
  zeroQuarters: number
  fluxFirst: number
  fluxSecond: number
  ring: string
}

function runs(side: number, beats: number): Run[] {
  const center = centerOf(side)
  const anti = d4BoxCell({ coordinates: [0, 0, 0, 0], side })
  const f = contactFresh(side, 'pass', center)
  const husk = boxHusk(f.weave.mesh, side)
  const links = bulkLinks(f.tables)
  const cast = huskCast(links, husk)
  const mesh = meshLines(f.tables)
  const ringOf = Int32Array.from({ length: f.cells * 12 }, (_, k) => mesh.lineOf[Math.floor(k / 12) * 24 + (LINE_FIRSTS[k % 12] as number)] as number)
  const vacuum = wordVacuum(f, f.store)
  const seeded = cloneConfiguration(vacuum)

  seeded.vibe[center * 24 + 6] = 1
  seeded.open[center * 24 + 6] = 1
  seeded.vibe[center * 24 + 8] = -1
  seeded.open[center * 24 + 8] = 1

  const zero = new Int32Array(f.cells * 12)
  const placed = new Int32Array(f.cells * 12)

  routeUnits(links, placed, center, anti, LUMP_ENERGY)

  const key = fullPathKey(0)
  const e = new Int32Array(f.cells)
  const e1 = new Int32Array(f.cells)
  const div = new Int32Array(f.cells)
  const vacLines: Int32Array[] = []

  const one = (kind: 'vacuum' | 'seeded', start: Configuration, startLine: Int32Array): Run => {
    const r = lineRunner(f.tables, start, startLine, key)
    const background = gaussBackground(links, startLine, start)
    const background1 = gaussBackground(links, startLine, start, 1)
    const huskFlux = new Float64Array(husk.columns * 9)
    const fluxMax: number[] = []
    const zeroAt: number[] = []
    const growth: [number, number][] = []
    let gaussOff = 0
    let controlOff = 0
    let maxAbs = 0
    let ring = ''

    for (let t = 1; t <= beats; t++) {
      r.beat()
      dockEnergies(r.state(), e)
      dockEnergies(r.state(), e1, 1)
      lineDivergence(links, r.line, div)

      for (let x = 0; x < f.cells; x++) {
        if ((div[x] as number) - (e[x] as number) !== background[x]) gaussOff++
        if ((div[x] as number) - (e1[x] as number) !== background1[x]) controlOff++
      }

      let m = 0
      let atStart = true

      for (let k = 0; k < r.line.length; k++) {
        const v = r.line[k] as number

        if (Math.abs(v) > m) m = Math.abs(v)
        if (v !== startLine[k]) atStart = false
      }

      maxAbs = Math.max(maxAbs, m)
      if (atStart) zeroAt.push(t)
      huskFlux.fill(0)
      addHuskFlux(cast, r.line, huskFlux)
      fluxMax.push(huskFlux.reduce((s, v) => Math.max(s, Math.abs(v)), 0))
      if (kind === 'vacuum' && t === beats) vacLines.push(Int32Array.from(r.line))
      if ((t & (t - 1)) === 0 || t === beats) growth.push([t, m])

      // the seeded lines minus the vacuum's on the same beat, split on the mesh lines
      if (kind === 'seeded' && t === beats) {
        const sum = new Float64Array(mesh.count)
        const hi = new Int32Array(mesh.count).fill(-(1 << 30))
        const lo = new Int32Array(mesh.count).fill(1 << 30)
        const vac = vacLines[0] as Int32Array
        const len = (f.cells * 12) / mesh.count

        for (let k = 0; k < r.line.length; k++) {
          const v = (r.line[k] as number) - (vac[k] as number)
          const q = ringOf[k] as number

          sum[q]! += v
          hi[q] = Math.max(hi[q] as number, v)
          lo[q] = Math.min(lo[q] as number, v)
        }

        let wind = 0
        let spread = 0
        let winding = 0

        for (let q = 0; q < mesh.count; q++) {
          wind = Math.max(wind, Math.abs((sum[q] as number) / len))
          if (sum[q] !== 0) winding++
          spread = Math.max(spread, (hi[q] as number) - (lo[q] as number))
        }

        ring = `winding ${wind.toFixed(3)} on ${winding} of ${mesh.count} rings, spread ${spread}`
      }
    }

    const keyed = keyedRunner(f.tables, start, { key })

    for (let t = 0; t < beats; t++) keyed.beat()

    const sameAsKeyed = sameConfiguration(keyed.state(), r.state())

    for (let t = 0; t < beats; t++) r.back()

    const reversed = sameConfiguration(r.state(), start) && r.line.every((v, k) => v === startLine[k])
    const quarter = beats / 4
    const zeroQuarters = [0, 1, 2, 3].filter(q => zeroAt.some(t => t > q * quarter && t <= (q + 1) * quarter)).length
    const late = growth.filter(([t, m]) => t >= 16 && m > 0)
    const lx = late.map(([t]) => Math.log(t))
    const ly = late.map(([, m]) => Math.log(m))
    const mx = lx.reduce((s, v) => s + v, 0) / Math.max(1, lx.length)
    const my = ly.reduce((s, v) => s + v, 0) / Math.max(1, ly.length)
    const slope = lx.length > 1 ? lx.reduce((s, v, i) => s + (v - mx) * ((ly[i] as number) - my), 0) / lx.reduce((s, v) => s + (v - mx) ** 2, 0) : 0

    return {
      side,
      kind,
      gaussOff,
      controlOff,
      maxAbs,
      growth: growth.map(([t, m]) => `${t}:${m}`).join(' '),
      slope,
      reversed,
      sameAsKeyed,
      zeroQuarters,
      fluxFirst: Math.max(...fluxMax.slice(0, beats / 2)),
      fluxSecond: Math.max(...fluxMax.slice(beats / 2)),
      ring,
    }
  }

  return [one('vacuum', vacuum, zero), one('seeded', seeded, placed)]
}

export default experiment({
  id: 'gravity/energy-lines',
  code: 'E-GRV-0106',
  title:
    "a unit of energy line dragged by every vibe the stream takes keeps Gauss's law for the rule's energy exact on every dock and beat with nothing placed after beat 0, but nothing bounds the lines, fail on E2: 0 off on sides 8 and 16 (a store counted once is off 1.4 and 11.6 million times), the runs are the registered keyed path bit for bit and reverse exactly with their lines, and the vacuum's lines stay a trit and return to zero every few beats (husk flux 16 and 32 in both halves), but a seeded love+fear pair's lines reach 13 on side 8 in 512 beats and 8 on side 16 in 256, growing as about t^0.45, because Gauss fixes only their divergence: the pair's wake winds 4.4 to 9.9 units around its mesh lines, a circulation the coin walks and nothing in the rule returns",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const t0 = Date.now()
    const all = RUNS.flatMap(({ side, beats }) => runs(side, beats))
    const vac = all.filter(r => r.kind === 'vacuum')
    const seed = all.filter(r => r.kind === 'seeded')
    const gE1 = all.every(r => r.gaussOff === 0 && r.sameAsKeyed)
    const control = all.every(r => r.controlOff > 0)
    const gE2 = all.every(r => r.maxAbs <= TRIT)
    const gE3 = all.every(r => r.reversed)
    const gE4 = vac.every(r => r.maxAbs <= TRIT && r.zeroQuarters === 4 && r.fluxSecond <= r.fluxFirst)
    const status = gE1 && gE2 && gE3 && gE4 && control ? 'pass' : 'fail'
    const metrics: Record<string, number> = { gate_E1: gE1 ? 1 : 0, gate_E2: gE2 ? 1 : 0, gate_E3: gE3 ? 1 : 0, gate_E4: gE4 ? 1 : 0, control: control ? 1 : 0 }

    for (const r of all) {
      const p = `side${r.side}_${r.kind}_`

      metrics[`${p}gaussOff`] = r.gaussOff
      metrics[`${p}controlOff`] = r.controlOff
      metrics[`${p}maxAbs`] = r.maxAbs
      metrics[`${p}slope`] = r.slope
      metrics[`${p}zeroQuarters`] = r.zeroQuarters
      metrics[`${p}fluxFirst`] = r.fluxFirst
      metrics[`${p}fluxSecond`] = r.fluxSecond
    }

    metrics.seconds = (Date.now() - t0) / 1000

    const row = (r: Run): string => `side ${r.side} ${r.kind}: Gauss off ${r.gaussOff} (store-once control off ${r.controlOff}), largest |L| ${r.maxAbs} [${r.growth}], log-log slope ${r.slope.toFixed(2)}, reversed ${r.reversed}, keyed ${r.sameAsKeyed}, back at beat-0 lines in ${r.zeroQuarters} of 4 quarters, husk flux largest ${r.fluxFirst} then ${r.fluxSecond}${r.ring ? `, seeded minus vacuum ${r.ring}` : ''}`

    return verdict({
      status,
      claim: `energy lines dragged by every vibe the stream takes (one net-count register a bulk link, lines placed only at beat 0): ${all.map(row).join('; ')}`,
      metrics,
      control: { leastStoreOnceOff: Math.min(...all.map(r => r.controlOff)) },
      notes: `L2 (E1 L1). Gates E1 ${gE1}, E2 ${gE2}, E3 ${gE3}, E4 ${gE4}; control ${control}. Seeded largest |L|: ${seed.map(r => `side ${r.side} ${r.maxAbs}`).join(', ')}. ${((Date.now() - t0) / 1000).toFixed(0)} s.`,
    })
  },
})
