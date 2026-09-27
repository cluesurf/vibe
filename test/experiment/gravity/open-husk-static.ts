// The open husk, static (E-GRV-0094): the bounded depth field of E-GRV-0090 with the husk made the boundary of a bulk
// that grows below it, so content lines end by going down and no sink is placed by hand
// (note/research/vibe/roadmap/discrete-gravity.md, Parts 5c.1 and 5d 1b).
//
// THE CONSTRUCTION: code/rule/open-husk (its header gives the bulk and every choice), measured by
// code/measure/open-husk. The husk is E-GRV-0090's, unchanged: side 12, nine out-links a dock, a line trit and a step
// (a trit and three base-297 digits) per link, a rate and a remainder per dock. Below it two bulk layers of 8 times the
// docks each (sides 24 and 48, a scale factor 2 a layer: curvature length 1.44 layer spacings, beside the
// {3,4,3,4}'s 1.03 from its shell ratio 18.28), each dock joined down to the 8 it contains by a link of g = 1, and the
// deepest layer's docks 8 links each to the ground (rate 0, depth 0): 126,144 docks and 2,144,448 links, every one
// with the same bounded registers. Depth is found by summing F / g up from the ground. A STAND-IN, added by hand.
//
// PREDICTION, stated before the run from the geometry alone (not from this file): a bulk that GROWS away from the husk
// is a huge conductor under it. For a smooth husk field the bulk acts as a conductance to ground of 1 / (1/8 + 1/64 +
// 1/512) = 7.0 per husk dock, against the husk's own lateral stiffness 6 |p|^2, so the husk sees a SCREENED
// (Yukawa) pull of length about sqrt(6 / 7.0) = 0.93 docks, not 1/r. Randall-Sundrum II's 1/r on the brane needs the
// bulk to SHRINK away from the brane (the zero mode is then normalizable), which is the direction of the {3,4,3,4}
// itself, whose outermost shell (the husk) holds 94 percent of its docks (E-HLG-0011); a shrinking bulk is finite and
// cannot take the lines. E-GRV-0007 found the same screening for the {5,3,4} bulk's Green's function.
//
// DISCLOSED PROBE (tmp/open-probe1.log, instrument only, no gate read from it): with no bulk and no floor the rule
// equals code/rule/step-depth's stepBeat bit for bit for 256 beats; the linear solve on side 16 and 12 (layers 1, 2)
// gives r G(r) = 3.4e-3, 1.4e-3, 5.0e-4, 1.8e-4 at r = 1 .. 4 (a fall near e per dock); the Hann average of 256 beats
// on side 12 matches it to 3e-4 at r = 1 .. 4 with 0 wraps; a beat takes 45 ms.
//
// GATES, fixed before the first run of this file. D 16, three digits, side 12, two layers, the Hann average of 512
// beats from zero field:
//  B0 CONTROL (construction): with no bulk layer and no floor, the open rule equals E-GRV-0090's stepBeat bit for bit
//     (steps, rates, remainders) on every beat of 256 (side 8, a content-4 lump at (2, 2, 2), its sink at (6, 6, 6)).
//  B1 Gauss with no sink: the content is placed on the husk only (never negative anywhere), every unit's line reaches
//     the ground (the placement routes it; count of lines leaving through floor links = the content), and in every run
//     lines out minus lines in equals the content on every dock of husk and bulk after every beat (0 off); the depth
//     summed up from the ground is the same along every path (curl 0 on every check).
//  B2 bounded: in the static runs (a content-4 source alone; with a second at r = 2 and at r = 5) 0 wraps, every register
//     in its window, every run reverses bit for bit.
//  B3 the husk's pull is 1/r: W(r) = -(pi / D) 4 x(r), x the found depth of the Hann field of a content-4 source at
//     the origin at husk dock (r, 0, 0), r = 1 .. 6 (the energy method E(A + B) - 2 E(A) at r = 2 and 5 must agree with
//     it to 1e-3 relative). (a) W < 0 and rising at every r; (b) the force F(r) = W(r + 1) - W(r) keeps a fixed ratio
//     to E-GRV-0090's F (from its recorded W) across r = 2 .. 5: largest over smallest ratio <= 1.25. REPORTED: k of the
//     fit c0 - k / r - b / r^3 on r = 2 .. 6 against E-GRV-0090's 0.0418217; the Yukawa length from log(-r W) on
//     r = 1 .. 5; the linear solve beside the rule's reading; and the shrinking bulk (sides 16, 8, 4, a far sink: the
//     Randall-Sundrum II direction), solved outright, its force against the husk alone at r = 1 .. 6.
//  B4 the dense lump: M units placed one at a time on the husk dock nearest the center that can still send a line to
//     the ground (M = 100, 400, 1600): every unit placed, Gauss exact; the M = 400 lump run 512 beats from zero field:
//     0 wraps, curl 0 on every check (the depth single valued), the energy at every 64 beats within 1e-4 of the size of
//     its static energy from its start, reversal bit for bit. REPORTED: each lump's radius against M, beside
//     E-GRV-0090's area law (1.41, 2.24, 4.69) and the volume count here (the smallest dock radius whose 8 down-links a
//     dock plus crossing lateral links reach M); the share of the lump's lines that leave down through its own docks;
//     the largest static step the linear solve demands of it.
// Verdict: pass if B1 to B4 hold with the control B0; partial if B0 fails; fail otherwise.
//
// FIRST RUN (tmp/grv94-run1.log, 383 s, the record): fail on B3 and B4, no gate moved. B0: 256 of 256 beats equal
// E-GRV-0090's rule bit for bit. B1: every line reaches the ground, Gauss 0 off on 1,536 beat checks over all 126,144
// docks, curl 0. B2: 0 wraps, largest step 0.269, every run reverses. B3: the pull is attractive and rising, W =
// -1.06e-2, -2.18e-3, -5.27e-4, -1.45e-4, -4.58e-5, -2.54e-5 at r = 1 .. 6 (the linear solve to 1.3e-3, the energy
// method to 6.6e-4), but SCREENED, as predicted: its force is 0.457, 0.242, 0.116, 0.054, 0.019 of E-GRV-0090's (spread
// 12.6 on r = 2 .. 5, gate 1.25), a Yukawa length 1.03 docks against the geometry's 0.92, and the 1/r fit gives k =
// -1.1e-3 (E-GRV-0090 0.0418). The husk depth follows the net step down its column (correlation 0.9996). The shrinking
// bulk (the RS II direction) keeps a long-range pull at 0.90 .. 0.64 of the husk alone's, falling toward the smooth
// limit 1 / 1.75 = 0.57. B4: the densest lumps of 100, 400, 1600 units have radius 1.00, 1.73, 3.00, exactly the
// volume count (8 down-links a dock), not E-GRV-0090's area law 1.41, 2.24, 4.69, and 40, 48, 59 percent of their lines
// leave down through their own docks; but the linear solve demands a step of 2.30 at the M = 400 lump, past the window's
// 3/2, and the field run wraps 79,283 times, curl 589, energy from 0 to 374 (8.2 of the static 45.4): the slipping shell
// is still there, reversible and not conservative. Title written after the run.
//
// Depth L2: a known construction (a massless scalar in a layered hyperbolic bulk with a boundary, run as an integer
// reversible rule), with a control. DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES:
// each value takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { fitPowers } from '@/code/measure/husk-coulomb'
import { radionMesh } from '@/code/rule/trit-radion'
import { emptyStep, newStepTally, placeLines, stepBeat, stepRule, stepScratch } from '@/code/rule/step-depth'
import { contentOf } from '@/code/measure/step-depth'
import { compressOpen, duplicateOpen, emptyOpen, FLOOR, HUSK_LATERAL, openBeat, openBeatBack, openDepth, openGaussOff, openMesh, openScratch, placeOpenLines, sameOpen, VERTICAL, type OpenMesh } from '@/code/rule/open-husk'
import { greenSolve, huskDistance, huskDock, newOpenRecord, openContent, openEnergy, openStaticRun } from '@/code/measure/open-husk'

const DEPTH = 16
const LEVELS = 3
const SIDE = 12
const LAYERS = 2
const BEATS = 512
const CONTENT = 4
const R: readonly number[] = [1, 2, 3, 4, 5, 6]
const ENERGY_R: readonly number[] = [2, 5]
const FIT_R: readonly number[] = [2, 3, 4, 5, 6]
const RECORDED_0090_W: readonly number[] = [0.126582, 0.145074, 0.151892, 0.155185, 0.157028, 0.158093, 0.158656]
const RECORDED_0090_K = 0.0418217
const CORE_M: readonly number[] = [100, 400, 1600]
const CORE_RUN_M = 400
const CORE_BEATS = 512
const AREA_0090: readonly number[] = [1.41, 2.24, 4.69]

type Core = { m: number; placed: boolean; gauss: number; rLump: number; rVolume: number; downShare: number }

function core(mesh: OpenMesh, m: number, order: readonly number[], dist: Float64Array): Core & { content?: Int32Array; line?: Int8Array } {
  try {
    const lump = compressOpen(mesh, order, m)
    let rLump = 0

    for (let y = 0; y < mesh.huskDocks; y++) if (lump.content[y]! > 0) rLump = Math.max(rLump, dist[y]!)

    // the volume count: the smallest dock radius whose docks' 8 down-links plus the lateral links crossing its sphere
    // reach M
    const radii = [...new Set(Array.from(dist).map(d => Math.round(d * 1e9) / 1e9))].sort((a, b) => a - b)
    const rVolume =
      radii.find(r => {
        let n = 0

        for (let y = 0; y < mesh.huskDocks; y++) {
          if (dist[y]! > r) continue
          n += 8
          for (let h = 0; h < 9; h++) if (dist[mesh.head[y * 9 + h]!]! > r) n++
        }
        for (let y = 0; y < mesh.huskDocks; y++) {
          if (dist[y]! <= r) continue
          for (let h = 0; h < 9; h++) if (dist[mesh.head[y * 9 + h]!]! <= r) n++
        }

        return n >= m
      }) ?? Infinity
    // lines leaving down through the down-links of the lump's own docks
    let down = 0

    for (let l = 0; l < mesh.links; l++) if (mesh.kind[l] === VERTICAL && mesh.tail[l]! < mesh.huskDocks && lump.content[mesh.tail[l]!]! > 0) down += lump.line[l]!

    return { m, placed: true, gauss: openGaussOff(mesh, lump.line, lump.content), rLump, rVolume, downShare: down / m, content: lump.content, line: lump.line }
  } catch {
    return { m, placed: false, gauss: -1, rLump: Infinity, rVolume: Infinity, downShare: 0 }
  }
}

export default experiment({
  id: 'gravity/open-husk-static',
  code: 'E-GRV-0094',
  title:
    "a bulk that grows below the husk takes every content line with no sink placed, and screens the husk's pull to a Yukawa of about one dock, fail on B3 and B4: with 2 layers of 8 times the docks and a floor, Gauss is exact on husk and bulk, the depth summed from the ground is path independent and no register wraps, but the force of a content-4 source falls to 0.46, 0.24, 0.12, 0.054, 0.019 of E-GRV-0090's 1/r at r = 1 .. 5 (Yukawa length 1.03 against the geometry's 0.92), where a shrinking bulk keeps a 1/r pull at 0.6 .. 0.9 of the husk's; a dense lump's radius follows its volume (1.00, 1.73, 3.00 for 100, 400, 1600 units) not its area, and the M = 400 lump still demands a step of 2.30 and slips 79,283 times, energy 0 to 374",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${(Date.now() - started) / 1000}s`)
    const rule = stepRule(DEPTH, LEVELS)

    // B0: no bulk, no floor, against stepBeat
    const b0 = (() => {
      const rm = radionMesh([8, 8, 8])
      const om = openMesh(8, 0, 'grow', 0)
      const rho = contentOf(rm, [{ at: [2, 2, 2], to: [6, 6, 6], units: CONTENT }])
      const a = emptyStep(rm)
      const b = emptyOpen(om)

      a.line.set(placeLines(rm, rho))
      b.line.set(a.line)

      const sa = stepScratch(rm)
      const sb = openScratch(om)
      let same = 0

      for (let t = 0; t < 256; t++) {
        stepBeat(rm, rule, a, sa)
        openBeat(om, rule, b, sb)

        let ok = true

        for (let i = 0; i < a.step.length; i++) if (a.step[i] !== b.step[i]) ok = false
        for (let i = 0; i < a.rate.length; i++) if (a.rate[i] !== b.rate[i] || a.rest[i] !== b.rest[i]) ok = false
        if (ok) same++
      }

      return same
    })()
    const control = b0 === 256

    log('B0')

    // B1 .. B3
    const mesh = openMesh(SIDE, LAYERS, 'grow')
    const record = newOpenRecord()
    const rhoA = openContent(mesh, [{ at: [0, 0, 0], units: CONTENT }])
    const floorLines = (line: Int8Array): number => {
      let n = 0

      for (let l = 0; l < mesh.links; l++) if (mesh.kind[l] === FLOOR) n += line[l]!

      return n
    }
    const linesA = placeOpenLines(mesh, rhoA)
    const reachGround = floorLines(linesA) === CONTENT
    const staticA = openStaticRun(mesh, rule, rhoA, BEATS, record)

    log('source')

    const energyW = ENERGY_R.map(r => {
      const both = openStaticRun(mesh, rule, openContent(mesh, [{ at: [0, 0, 0], units: CONTENT }, { at: [r, 0, 0], units: CONTENT }]), BEATS, record)

      log(`pair ${r}`)

      return both.energy - 2 * staticA.energy
    })
    const x = (r: number): number => staticA.depth[huskDock(mesh, [r, 0, 0])]!
    const W = R.map(r => -(Math.PI / DEPTH) * CONTENT * x(r))
    const energyAgree = Math.max(...ENERGY_R.map((r, i) => Math.abs(energyW[i]! / W[R.indexOf(r)]! - 1)))
    const green = greenSolve(mesh, rhoA)
    const Wgreen = R.map(r => -(Math.PI / DEPTH) * CONTENT * green.x[huskDock(mesh, [r, 0, 0])]!)
    const greenAgree = Math.max(...W.map((w, i) => Math.abs(w / Wgreen[i]! - 1)))

    // B1: no negative content anywhere (husk only), every line to the ground, Gauss and curl on every check
    const negative = rhoA.some(v => v < 0)
    const b1 = !negative && reachGround && record.gaussOff === 0 && record.curl === 0
    const wraps = record.wraps.fWraps + record.wraps.vWraps
    const b2 = wraps === 0 && record.maxStep < 1.5 && record.maxRate < 1.5 && record.maxRest <= rule.h && record.reversed
    const rising = W.every((w, i) => w < 0 && (i === 0 || w > W[i - 1]!))
    const force = R.slice(0, -1).map((_, i) => W[i + 1]! - W[i]!)
    const force90 = R.slice(0, -1).map((_, i) => RECORDED_0090_W[i + 1]! - RECORDED_0090_W[i]!)
    const ratio = force.map((f, i) => f / force90[i]!)
    const band = ratio.slice(1, 5)
    const spread = Math.max(...band) / Math.min(...band)
    const b3 = rising && band.every(v => v > 0) && spread <= 1.25 && energyAgree <= 1e-3
    const [c0, c1, c3] = fitPowers(FIT_R, FIT_R.map(r => W[R.indexOf(r)]!), [1, 3]) as [number, number, number]
    const fitK = -c1
    const yuk = (() => {
      const xs = R.slice(0, 5)
      const ys = xs.map(r => Math.log(-r * W[R.indexOf(r)]!))
      const mx = xs.reduce((a, v) => a + v, 0) / xs.length
      const my = ys.reduce((a, v) => a + v, 0) / ys.length
      const slope = xs.reduce((a, v, i) => a + (v - mx) * (ys[i]! - my), 0) / xs.reduce((a, v) => a + (v - mx) ** 2, 0)

      return -1 / slope
    })()
    const predictedLength = Math.sqrt(6 / (1 / (1 / 8 + 1 / 64 + 1 / 512)))
    // depth against the steps going down: per husk dock, the Hann field's net step down its 8 vertical links
    const downCorrelation = (() => {
      const down = new Float64Array(mesh.huskDocks)

      for (let l = 0; l < mesh.links; l++) if (mesh.kind[l] === VERTICAL && mesh.tail[l]! < mesh.huskDocks) down[mesh.tail[l]!]! += staticA.mean[l]!

      const xs = Array.from(down)
      const ys = Array.from(staticA.depth.subarray(0, mesh.huskDocks))
      const mx = xs.reduce((a, v) => a + v, 0) / xs.length
      const my = ys.reduce((a, v) => a + v, 0) / ys.length
      const sxy = xs.reduce((a, v, i) => a + (v - mx) * (ys[i]! - my), 0)
      const sxx = xs.reduce((a, v) => a + (v - mx) ** 2, 0)
      const syy = ys.reduce((a, v) => a + (v - my) ** 2, 0)

      return sxy / Math.sqrt(sxx * syy)
    })()

    log('B3')

    // the shrinking bulk, solved outright (reported)
    const shrink = (layers: number): number[] => {
      const m = openMesh(16, layers, 'shrink')
      const g = greenSolve(m, openContent(m, [{ at: [0, 0, 0], units: 1, to: [8, 8, 8] }]))

      return R.map(r => g.x[huskDock(m, [r, 0, 0])]! - g.x[huskDock(m, [r + 1, 0, 0])]!)
    }
    const shrinkAlone = shrink(0)
    const shrinkTwo = shrink(2)
    const shrinkRatio = shrinkTwo.map((f, i) => f / shrinkAlone[i]!)

    // B4
    const center = [SIDE / 2, SIDE / 2, SIDE / 2]
    const dist = Float64Array.from({ length: mesh.huskDocks }, (_, y) => huskDistance(mesh, y, center))
    const order = Array.from({ length: mesh.huskDocks }, (_, y) => y).sort((p, q) => dist[p]! - dist[q]! || p - q)
    const cores = CORE_M.map(m => core(mesh, m, order, dist))

    log('cores')

    const lump = cores[CORE_M.indexOf(CORE_RUN_M)]!
    const lumpRun = (() => {
      if (!lump.placed) return { wraps: -1, curl: -1, drift: Infinity, reversed: false, maxStep: 0, staticEnergy: 0, demanded: 0, energies: [] as number[] }

      const s = emptyOpen(mesh)

      s.line.set(lump.line!)

      const start = duplicateOpen(s)
      const scratch = openScratch(mesh)
      const tally = newStepTally()
      const g = greenSolve(mesh, lump.content!)
      // the static energy of the lump: -(pi / D) 1/2 rho . x
      let rx = 0

      for (let y = 0; y < mesh.docks; y++) rx += lump.content![y]! * g.x[y]!

      const staticEnergy = -(Math.PI / DEPTH) * 0.5 * rx
      let demanded = 0

      for (let l = 0; l < mesh.links; l++) {
        const z = mesh.head[l]!

        demanded = Math.max(demanded, Math.abs(mesh.weight[l]! * (g.x[mesh.tail[l]!]! - (z >= 0 ? g.x[z]! : 0))))
      }

      const energies = [openEnergy(mesh, rule, s, lump.content!).energy]
      let curl = 0
      let maxStep = 0

      for (let t = 1; t <= CORE_BEATS; t++) {
        openBeat(mesh, rule, s, scratch, tally)
        if (t % 64 === 0) {
          const e = openEnergy(mesh, rule, s, lump.content!)

          energies.push(e.energy)
          curl += openDepth(mesh, s.step).curl

          for (let l = 0; l < mesh.links; l++) maxStep = Math.max(maxStep, Math.abs(s.step[l]!) / rule.unit)
        }
      }

      for (let t = 0; t < CORE_BEATS; t++) openBeatBack(mesh, rule, s, scratch)

      return {
        wraps: tally.fWraps + tally.vWraps,
        curl,
        drift: Math.max(...energies.map(e => Math.abs(e - energies[0]!))) / Math.abs(staticEnergy),
        reversed: sameOpen(s, start),
        maxStep,
        staticEnergy,
        demanded,
        energies,
      }
    })()
    const b4 = cores.every(c => c.placed && c.gauss === 0) && lumpRun.wraps === 0 && lumpRun.curl === 0 && lumpRun.drift <= 1e-4 && lumpRun.reversed

    log('B4')

    const status = !control ? 'partial' : b1 && b2 && b3 && b4 ? 'pass' : 'fail'
    const f = (v: number): string => v.toPrecision(6)
    const e = (v: number): string => v.toExponential(2)
    const huskLinks = Array.from(mesh.kind).filter(k => k === HUSK_LATERAL).length
    const metrics: Record<string, number> = {
      gate_B0: control ? 1 : 0,
      gate_B1: b1 ? 1 : 0,
      gate_B2: b2 ? 1 : 0,
      gate_B3: b3 ? 1 : 0,
      gate_B4: b4 ? 1 : 0,
      controlBeatsSame: b0,
      docks: mesh.docks,
      links: mesh.links,
      huskLinks,
      runs: record.runs,
      beats: record.beats,
      gaussOff: record.gaussOff,
      gaussChecks: record.gaussChecks,
      curl: record.curl,
      curlChecks: record.curlChecks,
      wraps,
      maxStep: record.maxStep,
      maxRate: record.maxRate,
      maxRest: record.maxRest,
      energyAgree,
      greenAgree,
      forceRatioSpread: spread,
      fitK,
      fitC0: c0,
      fitB: -c3,
      k0090: RECORDED_0090_K,
      yukawaLength: yuk,
      predictedLength,
      downCorrelation,
      lumpWraps: lumpRun.wraps,
      lumpCurl: lumpRun.curl,
      lumpDrift: lumpRun.drift,
      lumpReversed: lumpRun.reversed ? 1 : 0,
      lumpMaxStep: lumpRun.maxStep,
      lumpDemandedStep: lumpRun.demanded,
      lumpStaticEnergy: lumpRun.staticEnergy,
      seconds: (Date.now() - started) / 1000,
    }

    R.forEach((r, i) => {
      metrics[`W_r${r}`] = W[i]!
      metrics[`Wlinear_r${r}`] = Wgreen[i]!
      metrics[`shrinkForceRatio_r${r}`] = shrinkRatio[i]!
    })
    ratio.forEach((v, i) => (metrics[`forceRatio0090_r${R[i]}`] = v))
    cores.forEach(c => {
      metrics[`core_M${c.m}_rLump`] = c.rLump
      metrics[`core_M${c.m}_rVolume`] = c.rVolume
      metrics[`core_M${c.m}_downShare`] = c.downShare
    })

    return verdict({
      status,
      claim: `the bounded depth field on a husk (side ${SIDE}) over ${LAYERS} growing bulk layers (8 times the docks a layer) with a floor, no sink placed: every content line reaches the ground (${reachGround}), Gauss off on ${record.gaussOff} of ${record.gaussChecks} beat checks over husk and bulk, curl ${record.curl}, ${wraps} wraps, largest step ${f(record.maxStep)}; a content-4 source's husk pull W(r) = ${W.map(e).join(', ')} at r = ${R.join(', ')} (${rising ? 'rising' : 'NOT rising'}; linear solve to ${e(greenAgree)}, energy method to ${e(energyAgree)}), its force ${ratio.map(e).join(', ')} of E-GRV-0090's (spread ${f(spread)} on r = 2 .. 5), a Yukawa length ${f(yuk)} docks (predicted ${f(predictedLength)}), 1/r fit k ${e(fitK)} against ${RECORDED_0090_K}; the shrinking bulk's force is ${shrinkRatio.map(f).join(', ')} of the husk alone's; the densest lumps of ${CORE_M.join(', ')} units reach radius ${cores.map(c => f(c.rLump)).join(', ')} (the volume count ${cores.map(c => f(c.rVolume)).join(', ')}, E-GRV-0090's area law ${AREA_0090.join(', ')}), ${cores.map(c => f(c.downShare)).join(', ')} of their lines leaving down through their own docks; the M = ${CORE_RUN_M} lump run ${CORE_BEATS} beats wraps ${lumpRun.wraps} times (largest step ${f(lumpRun.maxStep)}, the linear solve demands ${f(lumpRun.demanded)}), curl ${lumpRun.curl}, energy drift ${e(lumpRun.drift)} of its static ${f(lumpRun.staticEnergy)}, reversal ${lumpRun.reversed}; control ${b0} of 256 beats equal E-GRV-0090's rule`,
      metrics,
      control: { beatsSame: b0, control: control ? 1 : 0 },
      notes: `L2. Gates B0 ${control}, B1 ${b1}, B2 ${b2}, B3 ${b3} (rising ${rising}, spread ${f(spread)}, energy method ${e(energyAgree)}), B4 ${b4}. Energy-method W at r = ${ENERGY_R.join(', ')}: ${energyW.map(e).join(', ')}. Linear W: ${Wgreen.map(e).join(', ')} (${green.iterations} iterations). Fit c0 - k/r - b/r^3 on r = ${FIT_R.join(', ')}: c0 ${e(c0)}, k ${e(fitK)}, b ${e(-c3)}. Husk depth against the net step down its column: correlation ${f(downCorrelation)}. Shrinking bulk (16, 8, 4) forces ${shrinkTwo.map(e).join(', ')}, husk alone ${shrinkAlone.map(e).join(', ')}. Lump energies every 64 beats: ${lumpRun.energies.map(v => v.toExponential(6)).join(' ')}. Every run reverses: ${record.reversed}.`,
    })
  },
})
