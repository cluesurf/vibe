// THE KNOTS OF THE PLAQUETTE VACUUM, ITS AREA LAW, AND ITS RESPONSE TO A LUMP (E-GRV-0087). E-GRV-0083 held the
// working vacuum's exact superposed state as a product of knot components and found every component a ring along ONE
// mesh line: an exact area law at the first meeting with eta growing as the bulk depth, and a volume law at equilibrium.
// Step-back.md's proposal: plaquette stores (code/rule/plaquette-store-knit, E-RLT-0107), units of two lines of one
// frame, might join rings of different lines into networks, and so make the entanglement isotropic and area-law.
//
// THE STATE, EXACT. The plaquette piece reads no point (only the occupation and the line stores), so under the no-veto
// store the occupation history is still one history on every term, and the knot network (code/measure/knot-network)
// holds the rule's exact state once it can follow a unit: this file's change to it is a NetworkRule (the collision it
// follows and the rule's own registers, each unit holding four register halves), code/measure/plaquette-readings
// plaquetteNetworkRule. With no rule given the network is E-GRV-0083's, unchanged.
//
// THE ARGUMENT, stated before the run (E-RLT-0107's header): an involutive store releases a frame onto the slots it took
// it from, so a token (a vibe's point register) never leaves its mesh line through a unit; a like meeting joins two
// tokens on one line. So a component can reach a second line only through the collision's isometric map K (the pass
// contact's K on a dock of more than one single), which the vacuum's orbit never uses. The prediction: rings, as before.
//
// WHAT THE PROBES FOUND, disclosed (tmp/plaq-probe3.log; no gate was read): read as its two line stores, the plaquette
// vacuum is the line vacuum on 64 of 64 beats on the keep, Born and exchange paths; one 6+8 pair makes the two differ on
// 0 to 56 of 64 beats depending on the path.
//
// GATES, fixed before this file's first run. The working vacuum's start (every stored pair open), the pass contact, the
// start integer+0 of E-MTH-0028's family, the husk regions of code/measure/knot-network huskRegionFamily.
//  K0 the instrument: (a) the network run with plaquetteNetworkRule(false) (the line rule through the new code path)
//     gives every region the same S as E-GRV-0083's network (no rule given), exactly (===), at beat 2 and beat 36 on side
//     8; (b) the plaquette network on side 8 over 48 beats: 0 lines of one open vibe, every component exactly normed (in
//     integers) at every reading of beats 36 .. 47, 48 inverse beats return every component and token to its beat-0
//     value and place, and its occupation equals the plaquette rule's keep path (code/measure/plaquette-readings
//     plaquetteRunner) at every beat
//  K1 networks: at some beat of 48 on side 8, some component of the plaquette network holds tokens on two or more mesh
//     lines (a token's line: its slot's, its line store's, or for a unit half the line it was taken from). The same
//     reading on E-GRV-0083's network is reported as the control
//  K2 area at equilibrium: side 8, the mean S of each region over beats 36 .. 47, fitted as S = eta A + c and S = v V + c
//     over the 32 regions: the area fit's rms residual below the volume fit's (E-GRV-0083 A1, which failed: 916 against
//     579)
//  K3 eta against bulk depth: eta_1 (the slab slab0-2's S over its area at beat 2) on sides 8, 12, 16: eta_1(16) /
//     eta_1(8) below 1.5 (E-GRV-0083 read exactly 2, eta proportional to the depth)
//  K4 the lump: side 16, one 6+8 pair (a love on slot 6, a fear on slot 8 of the center dock), 24 paths on the full key
//     (offsets code/measure/full-key-paths pathOffset(0 .. 23)), Born, coin on: per husk column the slots, line stores
//     and units differing from the vacuum's run on the same key, summed over beats 16 .. 63 and averaged over the paths,
//     then averaged over each shell of husk distance r (code/measure/plaquette-readings huskDistances); fits over r >= 1
//     of a + k / r and a + k e^(-r / l), l = 0.5, 1, 2, 4: K4 holds when a + k / r has k > 0 and a smaller rms than every
//     exponential. The line rule on the same keys is the control (tmp/elastic-average-2 read a core of range 0.5 on its
//     own key)
// Verdict: fail if K0 fails (the instrument is not the rule) or K1 fails (no networks, so the change leaves the knots as
// they were); pass if K1 to K4 hold; partial otherwise. PREDICTED from the argument: K0 holds, K1, K2 and K3 fail, and
// the plaquette S equals E-GRV-0083's on every region; K4 fails: fail.
//
// FIRST RUN (tmp/grv87-run1.log, 660 s, the record): fail on K1, K2, K3 and K4, as predicted, no gate moved; K0 holds
// (the line rule through the new code path equals E-GRV-0083's network on every region, the plaquette network's
// occupation is the rule's keep path on 48 of 48 beats, exactly normed, reversed exactly, 0 half-open lines). K1: 0 of 48
// beats hold a component on two mesh lines, largest component 4 tokens, one line, as under the line rule; every
// equilibrium region's S equals the line rule's exactly (0 nats apart). K2: the area fit's rms 916 against the volume
// fit's 579 (r2 0.723 against 0.889), E-GRV-0083's numbers to the digit; the equal-area slabs read 1,770, 3,254, 4,404,
// 5,472. K3: eta_1 8.435, 12.65, 16.87 on sides 8, 12, 16, ratio 2.000. K4: the lump's core is the line rule's (241.6
// against 243.9 at r = 0, 21.5 against 21.6 at r = 1), but its tail is 2 to 3.4 times higher (7.4, 10.0, 3.1 at r = 2 to 4
// against 4.1, 4.4, 2.0) and the path totals are 2.5 times the line rule's (about 10,000 against 4,000): the units delay
// the pair's disturbance into more of the vacuum, so the best exponential range widens from 0.5 to 1; a + k/r (k 20.3,
// rms 2.34) still loses to it (rms 2.21), and the shells rise again at r = 13, 14 (3.2, 7.6), the box wrapping. Title
// written after the run.
//
// DETERMINISM: no random numbers; the state is exact in Z[w][1/2]; entropies and fits are floats (measurement). Depth
// L2: a known quantity (region entanglement against area) read off the rule's exact state, with controls that could
// fail (the volume fit, the line rule). HUSK FIRST: every region is a set of husk columns with everything in their bulk
// columns; the lump response is read per husk column.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { THRESHOLD_BORN, THRESHOLD_KEEP, vacuumConfiguration } from '@/code/measure/doublet-locked-readings'
import { boxHusk } from '@/code/measure/causal-components'
import { centerOf } from '@/code/measure/wall-reading'
import { linearFit } from '@/code/measure/regression'
import { fullPathKey, meshLines, pathOffset } from '@/code/measure/full-key-paths'
import { toWords } from '@/code/rule/occupation-veto-knit'
import { sameOccupationPlaquettes, withPlaquettes, type PlaquetteConfiguration } from '@/code/rule/plaquette-store-knit'
import { componentsOf, huskRegionFamily, knotNetwork, networkBeat, networkBeatBack, networkNormExact, networkReturned, regionEntropy, tokenDocks, tokenSlots, type HuskRegion, type KnotNetwork, type NetworkRule } from '@/code/measure/knot-network'
import { huskDistances, plaquetteNetworkRule, plaquetteRunner, unitHalfSlot } from '@/code/measure/plaquette-readings'

const SIDE = 8
const KNOT_SIDES = [8, 12, 16] as const
const KNOT_BEAT = 2
const EQUILIBRIUM = [36, 47] as const
const BEATS = 48
const LUMP_SIDE = 16
const LUMP_PATHS = 24
const LUMP_BEATS = 64
const LUMP_FROM = 16
const RANGES = [0.5, 1, 2, 4] as const

type Built = { net: KnotNetwork; column: Int32Array; start: PlaquetteConfiguration; rule?: NetworkRule; lineOf: Int32Array }

function build(side: number, rule?: NetworkRule): Built {
  const f = contactFresh(side, 'pass')
  const start = withPlaquettes(toWords(vacuumConfiguration(f, 'all')))
  const net = rule ? knotNetwork('none', f.tables, start, rule) : knotNetwork('none', f.tables, toWords(vacuumConfiguration(f, 'all')))

  return { net, column: boxHusk(f.weave.mesh, side).column, start, rule, lineOf: meshLines(f.tables).lineOf }
}

function readRegions(net: KnotNetwork, column: Int32Array, regions: readonly HuskRegion[]): number[] {
  const docks = tokenDocks(net)
  const cache = new Map<number, { entropy: number; rows: number }>()

  return regions.map(region => regionEntropy(net, t => region.inside[column[docks[t] as number] as number] === 1, cache).entropy)
}

// the components holding tokens on two or more mesh lines, and the most lines one component holds
function lineSpread(b: Built): { multi: number; most: number } {
  const slots = tokenSlots(b.net, b.rule ? unitHalfSlot : undefined)
  let multi = 0
  let most = 0

  for (const c of componentsOf(b.net)) {
    if (c.members.length < 2) continue

    const seen = new Set<number>()

    for (const t of c.members) {
      const s = slots[t] as number

      if (s < 0) throw new Error('plaquette-knot-area-law: a token with no slot')
      seen.add(b.lineOf[s] as number)
    }

    if (seen.size > 1) multi++
    most = Math.max(most, seen.size)
  }

  return { multi, most }
}

const rmsOf = (fit: { residual: number }, n: number): number => Math.sqrt(fit.residual / n)

export default experiment({
  id: 'gravity/plaquette-knot-area-law',
  code: 'E-GRV-0087',
  title:
    "plaquette stores leave the vacuum's knots as rings along single lines, so its entanglement is still a volume law and its eta still grows with bulk depth, fail on K1 to K4 with the instrument exact: the knot network run on the plaquette rule (occupation equal to the rule's on 48 of 48 beats, normed, reversed) has 0 components on two mesh lines in 48 beats (largest 4 tokens) and every region's S equal to the line vacuum's exactly (area rms 916 against volume 579, eta_1 8.435, 12.65, 16.87 on sides 8, 12, 16); a 6+8 pair's disturbance over 24 full-key paths keeps the line rule's core (241.6 at r = 0, 21.5 at 1) with a tail 2 to 3 times higher, best exponential range 1 against 0.5, and no 1/r (rms 2.34 against 2.21)",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const member = startFamily(16)[0]!
    const regions = huskRegionFamily(SIDE)

    // ---- K0 (a), K1, K2, K0 (b) on side 8: three networks in lockstep ----
    const side8 = withStart(member, () => {
      const line = build(SIDE)
      const through = build(SIDE, plaquetteNetworkRule(false))
      const plaq = build(SIDE, plaquetteNetworkRule(true))
      const f = contactFresh(SIDE, 'pass')
      const path = plaquetteRunner(f.tables, plaq.start, { key: fullPathKey(0), threshold: THRESHOLD_KEEP })
      let throughSame = true
      let occupationSame = 0
      let normExact = true
      let multiBeats = 0
      let multiMost = 0
      let mostLines = 0
      let lineMostLines = 0
      let worstDiff = 0
      const sumsPlaq = new Array<number>(regions.length).fill(0)
      const sumsLine = new Array<number>(regions.length).fill(0)
      let count = 0

      for (let t = 0; t < BEATS; t++) {
        networkBeat(line.net)
        networkBeat(through.net)
        networkBeat(plaq.net)
        path.beat()
        occupationSame += sameOccupationPlaquettes(plaq.net.config as PlaquetteConfiguration, path.state()) ? 1 : 0

        const spread = lineSpread(plaq)
        const control = lineSpread(line)

        multiBeats += spread.multi > 0 ? 1 : 0
        multiMost = Math.max(multiMost, spread.multi)
        mostLines = Math.max(mostLines, spread.most)
        lineMostLines = Math.max(lineMostLines, control.most)

        if (t === KNOT_BEAT || t === EQUILIBRIUM[0]) {
          const a = readRegions(line.net, line.column, regions)
          const b = readRegions(through.net, through.column, regions)

          throughSame = throughSame && a.every((s, i) => s === b[i])
        }

        if (t >= EQUILIBRIUM[0] && t <= EQUILIBRIUM[1]) {
          const p = readRegions(plaq.net, plaq.column, regions)
          const l = readRegions(line.net, line.column, regions)

          p.forEach((s, i) => {
            sumsPlaq[i] = (sumsPlaq[i] as number) + s
            sumsLine[i] = (sumsLine[i] as number) + (l[i] as number)
            worstDiff = Math.max(worstDiff, Math.abs(s - (l[i] as number)))
          })
          count++
          normExact = normExact && networkNormExact(plaq.net)
        }
      }

      const largest = plaq.net.tally.largest
      const meanPlaq = sumsPlaq.map(s => s / count)
      const meanLine = sumsLine.map(s => s / count)
      const halfOpen = plaq.net.tally.halfOpen

      for (let t = 0; t < BEATS; t++) networkBeatBack(plaq.net)

      const returned = networkReturned(plaq.net, build(SIDE, plaquetteNetworkRule(true)).net)

      return { throughSame, occupationSame, normExact, halfOpen, returned, multiBeats, multiMost, mostLines, lineMostLines, largest, worstDiff, meanPlaq, meanLine }
    })

    log('side 8')

    const area = linearFit({ xs: regions.map(r => r.area), ys: side8.meanPlaq })
    const volume = linearFit({ xs: regions.map(r => r.volume), ys: side8.meanPlaq })
    const areaLine = linearFit({ xs: regions.map(r => r.area), ys: side8.meanLine })
    const volumeLine = linearFit({ xs: regions.map(r => r.volume), ys: side8.meanLine })

    // ---- K3: the knot phase on three sides ----
    const knots = withStart(member, () =>
      KNOT_SIDES.map(side => {
        const b = build(side, plaquetteNetworkRule(true))

        for (let t = 0; t <= KNOT_BEAT; t++) networkBeat(b.net)

        const slab = huskRegionFamily(side).find(r => r.name === 'slab0-2') as HuskRegion
        const S = readRegions(b.net, b.column, [slab])[0] as number

        return { side, eta1: S / slab.area, halfOpen: b.net.tally.halfOpen }
      }),
    )

    log('K3')

    // ---- K4: the lump over 24 full-key paths, the plaquette rule and the line rule ----
    const lump = withStart(member, () => {
      const f = contactFresh(LUMP_SIDE, 'pass')
      const husk = boxHusk(f.weave.mesh, LUMP_SIDE)
      const center = centerOf(LUMP_SIDE)
      const vacuum = withPlaquettes(toWords(vacuumConfiguration(f, 'all')))
      const seeded = withPlaquettes(vacuum)

      seeded.vibe[center * 24 + 6] = 1
      seeded.open[center * 24 + 6] = 1
      seeded.vibe[center * 24 + 8] = -1
      seeded.open[center * 24 + 8] = 1

      const distance = huskDistances(LUMP_SIDE, husk.column[center] as number)
      const profile = (plaquettes: boolean): { rows: { r: number; v: number }[]; totals: number[] } => {
        const total = new Float64Array(husk.columns)
        const totals: number[] = []

        for (let k = 0; k < LUMP_PATHS; k++) {
          const key = fullPathKey(pathOffset(k))
          const a = plaquetteRunner(f.tables, vacuum, { key, threshold: THRESHOLD_BORN, plaquettes })
          const b = plaquetteRunner(f.tables, seeded, { key, threshold: THRESHOLD_BORN, plaquettes })
          let sum = 0

          for (let t = 0; t < LUMP_BEATS; t++) {
            a.beat()
            b.beat()

            if (t < LUMP_FROM) continue

            const p = a.state()
            const q = b.state()
            const add = (dock: number): void => {
              total[husk.column[dock] as number] = (total[husk.column[dock] as number] as number) + 1 / LUMP_PATHS
              sum++
            }

            for (let i = 0; i < p.vibe.length; i++) if (p.vibe[i] !== q.vibe[i]) add(Math.floor(i / 24))
            for (let i = 0; i < p.store.length; i++) if (p.store[i] !== q.store[i]) add(Math.floor(i / 12))
            for (let i = 0; i < p.punit.length; i++) if (p.punit[i] !== q.punit[i]) add(Math.floor(i / 3))
          }

          totals.push(sum)
        }

        const shells = new Map<number, { sum: number; n: number }>()

        for (let c = 0; c < husk.columns; c++) {
          const e = shells.get(distance[c] as number) ?? { sum: 0, n: 0 }

          e.sum += total[c] as number
          e.n++
          shells.set(distance[c] as number, e)
        }

        return { rows: [...shells.entries()].sort((x, y) => x[0] - y[0]).map(([r, e]) => ({ r, v: e.sum / e.n })), totals }
      }
      const fits = (rows: { r: number; v: number }[]): { inverse: { k: number; rms: number }; exps: { l: number; k: number; rms: number }[] } => {
        const pts = rows.filter(p => p.r >= 1)
        const fitOf = (g: (r: number) => number): { k: number; rms: number } => {
          const fit = linearFit({ xs: pts.map(p => g(p.r)), ys: pts.map(p => p.v) })

          return { k: fit.slope, rms: rmsOf(fit, pts.length) }
        }

        return { inverse: fitOf(r => 1 / r), exps: RANGES.map(l => ({ l, ...fitOf(r => Math.exp(-r / l)) })) }
      }
      const on = profile(true)

      log('K4 plaquette rule')

      const off = profile(false)

      log('K4 line rule')

      return { on, off, onFits: fits(on.rows), offFits: fits(off.rows) }
    })

    // ---- the gates ----
    const k0 = side8.throughSame && side8.halfOpen === 0 && side8.normExact && side8.returned && side8.occupationSame === BEATS && knots.every(k => k.halfOpen === 0)
    const k1 = side8.multiBeats > 0
    const k2 = rmsOf(area, regions.length) < rmsOf(volume, regions.length)
    const etaRatio = (knots[2]!.eta1 as number) / (knots[0]!.eta1 as number)
    const k3 = etaRatio < 1.5
    const bestExp = Math.min(...lump.onFits.exps.map(e => e.rms))
    const k4 = lump.onFits.inverse.k > 0 && lump.onFits.inverse.rms < bestExp
    const status = !k0 || !k1 ? 'fail' : k2 && k3 && k4 ? 'pass' : 'partial'
    const f4 = (x: number): string => x.toPrecision(4)
    const shell = (rows: { r: number; v: number }[]): string => rows.map(p => `${p.r}:${p.v.toFixed(3)}`).join(' ')
    const bestL = (x: { exps: { l: number; rms: number }[] }): number => x.exps.reduce((a, e) => (e.rms < a.rms ? e : a)).l
    const metrics: Record<string, number> = {
      gate_K0: k0 ? 1 : 0,
      gate_K1: k1 ? 1 : 0,
      gate_K2: k2 ? 1 : 0,
      gate_K3: k3 ? 1 : 0,
      gate_K4: k4 ? 1 : 0,
      throughSame: side8.throughSame ? 1 : 0,
      occupationSame: side8.occupationSame,
      returned: side8.returned ? 1 : 0,
      normExact: side8.normExact ? 1 : 0,
      halfOpen: side8.halfOpen,
      multiLineBeats: side8.multiBeats,
      multiLineComponentsMost: side8.multiMost,
      mostLinesPerComponent: side8.mostLines,
      mostLinesPerComponentLineRule: side8.lineMostLines,
      largestComponent: side8.largest,
      worstEquilibriumDiffFromLineRule: side8.worstDiff,
      areaSlope: area.slope,
      areaRms: rmsOf(area, regions.length),
      areaR2: area.r2,
      volumeSlope: volume.slope,
      volumeRms: rmsOf(volume, regions.length),
      volumeR2: volume.r2,
      lineAreaRms: rmsOf(areaLine, regions.length),
      lineVolumeRms: rmsOf(volumeLine, regions.length),
      etaRatio,
      lumpInverseK: lump.onFits.inverse.k,
      lumpInverseRms: lump.onFits.inverse.rms,
      lumpBestExpRms: bestExp,
      lumpBestRange: bestL(lump.onFits),
      lineLumpInverseRms: lump.offFits.inverse.rms,
      lineLumpBestExpRms: Math.min(...lump.offFits.exps.map(e => e.rms)),
      lineLumpBestRange: bestL(lump.offFits),
      seconds: (Date.now() - started) / 1000,
    }

    for (const k of knots) metrics[`eta1_side${k.side}`] = k.eta1
    for (const p of lump.on.rows) metrics[`lump_r${p.r}`] = p.v
    for (const p of lump.off.rows) metrics[`lineLump_r${p.r}`] = p.v

    const slabs = [0, 1, 2].map(axis => regions.map((r, i) => (r.name.startsWith(`slab${axis}-`) ? `${r.name} ${(side8.meanPlaq[i] as number).toFixed(1)}` : '')).filter(Boolean).join(', ')).join('; ')

    return verdict({
      status,
      claim: `K0 instrument ${k0} (the line rule through the new code path equals E-GRV-0083's network on every region ${side8.throughSame}; the plaquette network: occupation equal to the rule's keep path on ${side8.occupationSame} of ${BEATS} beats, normed ${side8.normExact}, reversed ${side8.returned}, half-open lines ${side8.halfOpen}); K1 networks ${k1} (components on two or more mesh lines on ${side8.multiBeats} of ${BEATS} beats, most lines in one component ${side8.mostLines}, the line rule ${side8.lineMostLines}; largest component ${side8.largest} tokens; the equilibrium S differs from the line rule's by at most ${side8.worstDiff.toExponential(2)} nats on any region); K2 area ${k2} (area fit eta ${f4(area.slope)}, rms ${f4(rmsOf(area, regions.length))}, r2 ${f4(area.r2)} against volume rms ${f4(rmsOf(volume, regions.length))}, r2 ${f4(volume.r2)}; slabs ${slabs}); K3 depth ${k3} (eta_1 ${knots.map(k => `${f4(k.eta1)} on side ${k.side}`).join(', ')}, ratio 16/8 ${f4(etaRatio)}); K4 1/r ${k4} (lump shells ${shell(lump.on.rows.slice(0, 12))}; a + k/r k ${f4(lump.onFits.inverse.k)} rms ${f4(lump.onFits.inverse.rms)} against the best exponential rms ${f4(bestExp)} at range ${bestL(lump.onFits)}; the line rule's shells ${shell(lump.off.rows.slice(0, 12))}, best range ${bestL(lump.offFits)})`,
      metrics,
      control: { lineMostLines: side8.lineMostLines, lineAreaRms: rmsOf(areaLine, regions.length), lineVolumeRms: rmsOf(volumeLine, regions.length) },
      notes: `L2. Gates K0 ${k0}, K1 ${k1}, K2 ${k2}, K3 ${k3}, K4 ${k4}. Region means (plaquette, line): ${regions.map((r, i) => `${r.name} (A ${r.area}, V ${r.volume}) ${(side8.meanPlaq[i] as number).toFixed(2)}/${(side8.meanLine[i] as number).toFixed(2)}`).join(', ')}. Lump path totals (plaquette): ${lump.on.totals.join(' ')}; (line): ${lump.off.totals.join(' ')}. Lump fits (plaquette): 1/r ${JSON.stringify(lump.onFits.inverse)}, exps ${JSON.stringify(lump.onFits.exps)}; (line): 1/r ${JSON.stringify(lump.offFits.inverse)}, exps ${JSON.stringify(lump.offFits.exps)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
