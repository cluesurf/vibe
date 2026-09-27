// The open husk, moving (E-GRV-0095): E-GRV-0091's dynamics gates run again with the husk opened into a growing bulk
// (code/rule/open-husk, E-GRV-0094's geometry: two layers of 8 times the docks each, a floor where the rate is 0), so
// a hop's radiation can go down and the content lines end in the bulk with no sink placed. Does the radiation stop
// piling up in the trit window, does the front read c once the box stops ringing, do lumps still fall alike, and is the
// energy of husk plus bulk kept?
//
// RETURN TIME, stated before the run: a wave going down meets the floor 3 links below the husk and comes back, about 6
// links at c(16) = 0.201 docks a beat, so near 30 beats; far less than the run. Nothing here stops a return: the rule
// is exactly reversible and nothing absorbs. What the growing bulk does is DILUTE it: layer k has 8^k the husk's docks,
// so energy that has spread through the bulk comes back to the husk only in the husk's share of the docks (1 of 73). A
// finite floor deep enough that nothing returns within 4096 beats would need some 400 layers of 8 times the docks each,
// which no machine holds; this run tests the dilution, not a bulk with no return.
//
// GATES, fixed before the first run of this file (D 16, three digits, kappa = 2 / 297, c(16) = 0.20101):
//  D1 exact and bounded: a content-4 source on the side-12 husk at the origin (no sink: its lines end in the bulk)
//     hopping one dock along x and back every 256 beats (15 hops of 4 units each) over 4096 beats: Gauss 0 off on every
//     dock of husk and bulk after every beat, curl 0 on every check, 0 wraps, and the run reverses to its start bit for
//     bit, lines included. REPORTED: the largest husk step in each 256-beat window (E-GRV-0091: 0.63, then 1.00 .. 1.50
//     until the steps wrapped) and the husk's share of the field energy at the end of each.
//  D2 causal, the front at c: a content-4 source at the origin of the side-16 husk; in one run it hops to (1, 0, 0)
//     after beat 32, in the other it stays; compared for 96 beats after the hop at (0, d, 0), d = 2 .. 7: (a) no register
//     there (rate, remainder, the nine out-links' steps and lines, the eight down-links' steps) differs on the first beat
//     after the hop; (b) none differs before beat d after the hop; (c) the radial step's change (out-link +y) read at its
//     HALF MAXIMUM and (d) at the first beat it reaches 25 percent of its maximum, each fitted as t0 + rho / v on
//     d = 3 .. 7 (rho from the hop's midpoint to the link's), give v within 10 percent of c(16), both.
//  D3 fall alike: the content-4 source and a test lump of 1 love or 3 fear at r = 3 and 5 (side 12), W = E(A + B) - E(A)
//     - E(B) from the Hann average of 512 beats (E(B) read once, at r = 3: the bulk is carried into itself by a husk
//     translation), a = -(W(5) - W(3)) / 2 / content (INERTIA IS A STAND-IN: content): both a < 0, alike to 1e-6, each
//     within 1e-3 of the linear solve's value. REPORTED: a against E-GRV-0080's -6.41986e-4 on the closed husk.
//  D4 energy: a content-4 lump on the side-8 husk at (2, 2, 2), no sink, from zero field, 4096 beats, E of husk plus
//     bulk every 64 beats (depth found from the ground): at three digits max |E - E(0)| is at most 1e-4 of the size of
//     its static energy, and it falls at every added digit from one to three; the field part is >= 0 at every sample;
//     the found and local source terms agree to 1e-9. REPORTED: the husk's share of the field energy over the run.
// Verdict: pass if D1 to D4 hold; fail otherwise. (No control of its own: E-GRV-0094's B0 holds the construction to
// E-GRV-0090's rule bit for bit.)
//
// Depth L2: the radion's known construction on bounded registers in a layered bulk. DETERMINISM: every start and
// source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule; a hop is a scheduled
// event.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lightSpeed } from '@/code/measure/varying-depth-light'
import { stepRule } from '@/code/rule/step-depth'
import { emptyOpen, openBeat, openMesh, openScratch, placeOpenLines, type OpenState } from '@/code/rule/open-husk'
import { greenSolve, huskDock, huskMaxStep, newOpenRecord, openContent, openEnergy, openHopRun, openStaticRun, type OpenHop } from '@/code/measure/open-husk'

const DEPTH = 16
const LEVELS = 3
const LAYERS = 2
const LONG_SIDE = 12
const LONG_BEATS = 4096
const LONG_EVERY = 256
const HOP_SIDE = 16
const HOP_AT = 32
const HOP_WINDOW = 96
const HOP_D: readonly number[] = [2, 3, 4, 5, 6, 7]
const SOURCE = 4
const FALL_SIDE = 12
const FALL_R: readonly number[] = [3, 5]
const STATIC_BEATS = 512
const RECORDED_0080 = -6.41986e-4
const ENERGY_SIDE = 8
const ENERGY_BEATS = 4096
const ENERGY_EVERY = 64

type Watch = { v: number; r: number; steps: number[]; lines: number[]; down: number[]; radial: number }

const differs = (a: Watch, b: Watch): boolean => a.v !== b.v || a.r !== b.r || a.steps.some((x, i) => x !== b.steps[i]) || a.lines.some((x, i) => x !== b.lines[i]) || a.down.some((x, i) => x !== b.down[i])

const firstAt = (series: number[], share: number): number => {
  const top = Math.max(...series.map(Math.abs))

  return series.findIndex(x => Math.abs(x) >= top * share) + 1
}

const slopeOf = (ys: readonly number[], xs: readonly number[]): number => {
  const mx = xs.reduce((a, v) => a + v, 0) / xs.length
  const my = ys.reduce((a, v) => a + v, 0) / ys.length

  return xs.reduce((a, v, i) => a + (v - mx) * (ys[i]! - my), 0) / xs.reduce((a, v) => a + (v - mx) ** 2, 0)
}

export default experiment({
  id: 'gravity/open-husk-moving',
  code: 'E-GRV-0095',
  title: 'the open husk, moving',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const rule = stepRule(DEPTH, LEVELS)
    const c = lightSpeed(DEPTH)
    const log = (what: string): void => console.error(`${what} ${(Date.now() - started) / 1000}s`)

    // D1
    const longMesh = openMesh(LONG_SIDE, LAYERS, 'grow')
    const longRecord = newOpenRecord()
    const hops: OpenHop[] = []

    for (let k = 1; k * LONG_EVERY < LONG_BEATS; k++) hops.push({ beat: k * LONG_EVERY, from: k % 2 === 1 ? [0, 0, 0] : [1, 0, 0], to: k % 2 === 1 ? [1, 0, 0] : [0, 0, 0], units: SOURCE })

    const windowMax: number[] = []
    const windowShare: number[] = []
    let running = 0
    const longRun = openHopRun(longMesh, rule, openContent(longMesh, [{ at: [0, 0, 0], units: SOURCE }]), hops, LONG_BEATS, longRecord, (t, s, rho) => {
      if (t === 0) return
      running = Math.max(running, huskMaxStep(longMesh, rule, s))
      if (t % LONG_EVERY === 0) {
        const en = openEnergy(longMesh, rule, s, rho)

        windowMax.push(running)
        windowShare.push(en.huskFree / en.free)
        running = 0
      }
    })
    const longWraps = longRecord.wraps.fWraps + longRecord.wraps.vWraps
    const d1 = longRun.reversed && longRecord.gaussOff === 0 && longRecord.curl === 0 && longWraps === 0

    log('long')

    // D2
    const mesh = openMesh(HOP_SIDE, LAYERS, 'grow')
    const hopRecord = newOpenRecord()
    const rho0 = openContent(mesh, [{ at: [0, 0, 0], units: SOURCE }])
    const docks = HOP_D.map(d => huskDock(mesh, [0, d, 0]))
    const downOf = (y: number): number => mesh.docks * 9 + y * 8
    const traceA: Watch[][] = []
    const traceB: Watch[][] = []
    const keep =
      (trace: Watch[][]) =>
      (t: number, s: OpenState): void => {
        if (t <= HOP_AT) return
        trace.push(
          docks.map(y => ({
            v: s.rate[y]!,
            r: s.rest[y]!,
            steps: Array.from({ length: 9 }, (_, h) => s.step[y * 9 + h]!),
            lines: Array.from({ length: 9 }, (_, h) => s.line[y * 9 + h]!),
            down: Array.from({ length: 8 }, (_, n) => s.step[downOf(y) + n]!),
            radial: s.step[y * 9 + 1]!,
          })),
        )
      }

    openHopRun(mesh, rule, rho0, [], HOP_AT + HOP_WINDOW, hopRecord, keep(traceA))
    openHopRun(mesh, rule, rho0, [{ beat: HOP_AT, from: [0, 0, 0], to: [1, 0, 0], units: SOURCE }], HOP_AT + HOP_WINDOW, hopRecord, keep(traceB))

    const firstChange = HOP_D.map((_, i) => traceA.findIndex((w, k) => differs(w[i]!, traceB[k]![i]!)) + 1)
    const noInstant = HOP_D.every((_, i) => !differs(traceA[0]![i]!, traceB[0]![i]!))
    const cone = firstChange.every((k, i) => k === 0 || k >= HOP_D[i]!)
    const pulse = HOP_D.map((_, i) => traceA.map((w, k) => (traceB[k]![i]!.radial - w[i]!.radial) / rule.unit))
    const half = pulse.map(p => firstAt(p, 0.5))
    const quarter = pulse.map(p => firstAt(p, 0.25))
    const tenth = pulse.map(p => firstAt(p, 0.1))
    const rhoD = HOP_D.map(d => Math.sqrt(0.25 + (d + 0.5) ** 2))
    const from = HOP_D.indexOf(3)
    const speedHalf = 1 / slopeOf(half.slice(from), rhoD.slice(from))
    const speedQuarter = 1 / slopeOf(quarter.slice(from), rhoD.slice(from))
    const speedTenth = 1 / slopeOf(tenth.slice(from), rhoD.slice(from))
    const d2 = noInstant && cone && firstChange.every(k => k > 0) && Math.abs(speedHalf / c - 1) <= 0.1 && Math.abs(speedQuarter / c - 1) <= 0.1 && hopRecord.reversed && hopRecord.gaussOff === 0

    log('hop')

    // D3
    const fallMesh = openMesh(FALL_SIDE, LAYERS, 'grow')
    const fallRecord = newOpenRecord()
    const run = (sources: { at: number[]; units: number }[]): number => openStaticRun(fallMesh, rule, openContent(fallMesh, sources), STATIC_BEATS, fallRecord).energy
    const eA = run([{ at: [0, 0, 0], units: SOURCE }])
    const fall = (units: number): number[] => {
      const eB = run([{ at: [FALL_R[0]!, 0, 0], units }])

      return FALL_R.map(r => run([{ at: [0, 0, 0], units: SOURCE }, { at: [r, 0, 0], units }]) - eA - eB)
    }
    const light = fall(1)
    const heavy = fall(3)
    const accel = (w: number[], units: number): number => -(w[1]! - w[0]!) / (FALL_R[1]! - FALL_R[0]!) / units
    const aLight = accel(light, 1)
    const aHeavy = accel(heavy, 3)
    const g = greenSolve(fallMesh, openContent(fallMesh, [{ at: [0, 0, 0], units: SOURCE }]))
    const wLinear = FALL_R.map(r => -(Math.PI / DEPTH) * g.x[huskDock(fallMesh, [r, 0, 0])]!)
    const aWant = accel(wLinear, 1)
    const alike = Math.abs(aLight / aHeavy - 1)
    const d3 = aLight < 0 && aHeavy < 0 && alike <= 1e-6 && Math.abs(aLight / aWant - 1) <= 1e-3 && Math.abs(aHeavy / aWant - 1) <= 1e-3 && fallRecord.reversed && fallRecord.gaussOff === 0 && fallRecord.wraps.fWraps + fallRecord.wraps.vWraps === 0

    log('fall')

    // D4
    const eMesh = openMesh(ENERGY_SIDE, LAYERS, 'grow')
    const lumpRho = openContent(eMesh, [{ at: [2, 2, 2], units: SOURCE }])
    const eg = greenSolve(eMesh, lumpRho)
    let rx = 0

    for (let y = 0; y < eMesh.docks; y++) rx += lumpRho[y]! * eg.x[y]!

    const staticEnergy = -(Math.PI / DEPTH) * 0.5 * rx
    const energyRun = (levels: number): { drift: number; leastFree: number; sourceGap: number; samples: number[]; share: number[]; wraps: number } => {
      const r = stepRule(DEPTH, levels)
      const s = emptyOpen(eMesh)
      const sc = openScratch(eMesh)
      const tally = { vWraps: 0, fWraps: 0 }

      s.line.set(placeOpenLines(eMesh, lumpRho))

      const samples: number[] = []
      const share: number[] = []
      let leastFree = Infinity
      let sourceGap = 0
      const sample = (): void => {
        const en = openEnergy(eMesh, r, s, lumpRho)

        samples.push(en.energy)
        share.push(en.free > 0 ? en.huskFree / en.free : 0)
        leastFree = Math.min(leastFree, en.free)
        sourceGap = Math.max(sourceGap, Math.abs(en.sourceFound - en.sourceLocal) / Math.max(1e-300, Math.abs(en.sourceLocal)))
      }

      sample()
      for (let t = 1; t <= ENERGY_BEATS; t++) {
        openBeat(eMesh, r, s, sc, tally)
        if (t % ENERGY_EVERY === 0) sample()
      }

      return { drift: Math.max(...samples.map(x => Math.abs(x - samples[0]!))) / Math.abs(staticEnergy), leastFree, sourceGap, samples, share, wraps: tally.fWraps + tally.vWraps }
    }
    const byLevel = [1, 2, 3].map(energyRun)
    const three = byLevel[2]!
    const d4 = three.drift <= 1e-4 && byLevel[0]!.drift > byLevel[1]!.drift && byLevel[1]!.drift > three.drift && three.leastFree >= 0 && three.sourceGap <= 1e-9

    log('energy')

    const status = d1 && d2 && d3 && d4 ? 'pass' : 'fail'
    const f = (x: number): string => x.toPrecision(6)
    const e = (x: number): string => x.toExponential(2)
    const metrics: Record<string, number> = {
      gate_D1: d1 ? 1 : 0,
      gate_D2: d2 ? 1 : 0,
      gate_D3: d3 ? 1 : 0,
      gate_D4: d4 ? 1 : 0,
      longBeats: LONG_BEATS,
      longHops: hops.length,
      longGaussOff: longRecord.gaussOff,
      longGaussChecks: longRecord.gaussChecks,
      longCurl: longRecord.curl,
      longWraps,
      longMaxStep: longRecord.maxStep,
      longReversed: longRun.reversed ? 1 : 0,
      scalarSpeed: c,
      speedHalf,
      speedHalfRatio: speedHalf / c,
      speedQuarter,
      speedQuarterRatio: speedQuarter / c,
      speedTenth,
      speedTenthRatio: speedTenth / c,
      aLight,
      aHeavy,
      aWant,
      alike,
      a0080: RECORDED_0080,
      staticEnergy,
      seconds: (Date.now() - started) / 1000,
    }

    windowMax.forEach((v, i) => (metrics[`longWindowMax_${i + 1}`] = v))
    windowShare.forEach((v, i) => (metrics[`longWindowHuskShare_${i + 1}`] = v))
    HOP_D.forEach((d, i) => {
      metrics[`hopFirstChange_d${d}`] = firstChange[i]!
      metrics[`hopHalf_d${d}`] = half[i]!
      metrics[`hopQuarter_d${d}`] = quarter[i]!
      metrics[`hopTenth_d${d}`] = tenth[i]!
      metrics[`hopLightCone_d${d}`] = rhoD[i]! / c
    })
    byLevel.forEach((b, i) => {
      metrics[`energyDrift_L${i + 1}`] = b.drift
      metrics[`energyWraps_L${i + 1}`] = b.wraps
    })

    return verdict({
      status,
      claim: `the bounded depth field on a husk opened into 2 growing bulk layers (no sink placed, D ${DEPTH}, ${LEVELS} digits): a content-4 source hopping 15 times over ${LONG_BEATS} beats keeps Gauss on husk and bulk (${longRecord.gaussOff} off in ${longRecord.gaussChecks}), curl ${longRecord.curl}, ${longWraps} wraps, reversal ${longRun.reversed}, its largest husk step per 256 beats ${windowMax.map(v => v.toFixed(3)).join(', ')} (E-GRV-0091 climbed 0.63 .. 1.50) with the husk holding ${windowShare.map(v => v.toFixed(3)).join(', ')} of the field energy; after a hop nothing changes on the next beat at d = ${HOP_D.join(', ')} (${noInstant ? 'none' : 'SOME'}), the first change ${firstChange.join(', ')} beats after, the radial step's half maximum at ${half.join(', ')} (${f(speedHalf / c)} c), its first 25 percent at ${quarter.join(', ')} (${f(speedQuarter / c)} c), 10 percent at ${tenth.join(', ')} (${f(speedTenth / c)} c); a 1-love and a 3-fear lump fall at ${e(aLight)} and ${e(aHeavy)} per unit content (alike to ${e(alike)}, linear solve ${e(aWant)}, E-GRV-0080's closed husk ${RECORDED_0080}); energy of husk plus bulk drifts ${byLevel.map(b => e(b.drift)).join(', ')} of the static ${f(staticEnergy)} at 1 .. 3 digits over ${ENERGY_BEATS} beats, the husk holding ${three.share.filter((_, i) => i % 16 === 0).map(v => v.toFixed(3)).join(', ')} of the field energy`,
      metrics,
      notes: `L2. Gates D1 ${d1}, D2 ${d2} (instant ${noInstant}, cone ${cone}, half ${f(speedHalf / c)} c, quarter ${f(speedQuarter / c)} c), D3 ${d3}, D4 ${d4}. Light-cone beats rho / c ${rhoD.map(r => (r / c).toFixed(1)).join(', ')}. Radial pulse peaks ${pulse.map(p => e(Math.max(...p.map(Math.abs)))).join(', ')}, final changes ${pulse.map(p => e(p[p.length - 1]!)).join(', ')}. W at r = ${FALL_R.join(', ')}: light ${light.map(x => x.toExponential(8)).join(' ')}, heavy ${heavy.map(x => x.toExponential(8)).join(' ')}, linear per unit ${wLinear.map(x => x.toExponential(8)).join(' ')}. Energy at 3 digits (every 512): ${three.samples.filter((_, i) => i % 8 === 0).map(x => x.toExponential(4)).join(' ')}; least field part ${e(three.leastFree)}; found against local source ${e(three.sourceGap)}; wraps ${byLevel.map(b => b.wraps).join(', ')}. Survey ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
