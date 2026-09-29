// IS THE DEPTH THE RULE'S OWN ENERGY-LINE FLUX, WITH NO SEPARATE REGISTER (E-GRV-0127; run as E-GRV-0124, renumbered before registering
// because parallel experiments took 0124 to 0126 first; the run logs print the old code)? E-GRV-0106 drags one unit of
// energy line with every vibe the stream takes (E = count + 2 sum |tau|, Gauss exact), and E-GRV-0107 found those lines
// carry no lump's depth because a seeded pair's energy spread. E-GRV-0119 now has a source that holds its place: E-SPN-
// 0104's trio on the working rule with the drift cost and the fermion sign. The idea (note/research/vibe/roadmap/
// remaining-pieces.md, section 2): let the step on a link BE the net energy lines crossing it, so the depth register is
// the energy-line register the rule already needs.
//
// THE RUN (code/measure/trio-energy-lines, whose header derives every step): E-GRV-0119's WabP source exactly (side 16,
// box-12 level, P 40, the parallel placement, the working split meeting), run 128 beats by the ring form with the
// integer line register carried EXACTLY as N sectors (N the net loves across the ring's cut), the lines dragged beat by
// beat by E-GRV-0106's rule on the ring's bulk links, their 3 units ending on the ring dock opposite the start center.
// The same run in the plain ring form beside it. The husk flux is the dragged lines cast by code/measure/energy-lines
// huskCast.
//
// GATES, fixed before the first run of this file.
//  G0 the register is the rule's (instrument, must hold for G1 .. G3 to mean anything): on the exact side-8 window of
//     E-GRV-0119's E0 (2 beats), every branch obeys the register's continuity (the loves' drag, each source dock read
//     from the rule's stream table, equals the change of the Gauss register plus the cut crossing, on every ring link:
//     0 off), no open love leaves the ring, the vacuum is untouched, the coherent reading's expected drag equals the
//     ring form's within 1e-12, and the window runs back to its start bit for bit (EXACT REVERSAL); on the 128-beat run
//     the sectored density equals the plain ring form's within 1e-9 at every beat (carrying the integer register splits
//     nothing), and the dragged lines equal the expected Gauss register within 1e-9.
//  G1 Gauss through spheres: on every beat, the net husk flux of the dragged lines out of every husk ball of radius r
//     = 0 .. 7 about the start center's column (the sink outside it; the flux is on the trio's husk line, so a ball is
//     an interval of it) equals the expected energy inside within 1 percent of that energy.
//  G2 the depth is the lines' flux: the depth found by SUMMING the time-averaged husk flux of the lines over beats
//     1 .. 64 (E-GRV-0119's window; code/rule/step-depth stepDepth, x_head = x_tail - F / g along its fixed path), read
//     as E-GRV-0119 reads it (x(r) - x(8) shell means, a + k / r on r = 2 .. 6), gives k within 5 percent of E-GRV-0119's
//     0.03072 (scaled by the source's energy over 3).
//  G3 the circulation stays bounded, not linear: the lines' ring winding (sum over the ring's links over its length,
//     E-GRV-0106's measure) (a) of the expected lines, |W_t - W_0|, and (b) of the register itself, its spread over the
//     entries sqrt(Var W), each has its largest value over beats 65 .. 128 at most 1.25 times its largest over beats
//     0 .. 64, or under 0.05 of a unit line. (Linear growth doubles the second half's largest; diffusive gives 1.41.)
//  CONTROL+: the static field of the SAME time-averaged density (E-GRV-0090's rule, a Poisson solve), fed to G2's
//     summing, passes G2 (the reading can pass a field that spreads). CONTROL-: E-GRV-0107's spreading source (the
//     seeded love+fear pair in the bulk, side 16, the full-period key's path 0, 64 beats, seeded minus vacuum lines)
//     fed to G2's reading must MISS G2 (its target scaled to its energy 2).
//  Verdict: partial if a control or G0 fails; pass if G1, G2, G3 hold; fail otherwise.
// PREDICTED: G0 and G1 hold (Gauss is exact because the rule keeps energy dock by dock); G2 fails, because a love
// cannot leave its line (the line law), so every line the trio drags lies on the trio's own husk line: the flux is a
// tube, its curl is not zero, and summing it gives a path-dependent depth, not 1/r; G3 (a) holds (the expected winding
// is the energy times the centroid's shift, and the level is held), (b) is open: a free packet's position spreads.
//
// FIRST RUN (tmp/elines-run1.log, 80 s): G1 read Infinity, a reading bug, not a Gauss miss: the loves sit on alternate
// docks each beat, so the smallest ball encloses exactly 0 on every other beat and the relative error divided by it
// (tmp/elines-probe1.log: outflow equals the energy inside on every ball, beats 1 .. 3). Fixed as the G1 line says
// ("within 1 percent of 0" is exact up to 1e-12); nothing else changed. SECOND RUN (tmp/elines-run2.log, 81 s, the
// record): partial, G0 fails on one clause, G1 holds, G2 and G3 (b) fail, both controls hold, no gate moved.
//  - G0: every exact branch obeys the continuity (0 off on 36 and 112 branches), 0 off the ring, vacuum untouched,
//    expected drag against the ring form 2.2e-16, reversed bit for bit; lines against the Gauss register 1.5e-13; the
//    residue L - c - Q mod 3 is 0 on every link, entry and beat (the drift cost's string IS the energy register mod 3).
//    But carrying the INTEGER register splits the ring form: 3.4e-7 by beat 128 (> 1e-9). tmp/elines-probe2.log: states
//    reached with cut counts six apart appear from beat 17 (the light-speed tails wind the 16-dock ring), and the gap
//    grows 3e-15 (beat 32), 4e-10 (64), 3.4e-7 (128). The rule's own string, which keeps N mod 3, merges them.
//  - G1: 8 balls, 128 beats, 0 off, largest gap 1.1e-13.
//  - G2: summed, x(r) - x(8) -2.426, -0.289, -0.098, -0.075, -0.041, -0.028, -0.024 at r = 0 .. 6, k -0.236 (128 beats
//    -0.258) against 0.0307, the summed field has curl on 253 husk links, 98.8 percent of the flux is divergence free,
//    and its divergence-fixed part (a Poisson solve) gives k 0.0325: the lump's 1/r lives only in the part the lines
//    do NOT carry. Control+ k 0.030724 (E-GRV-0119 reproduced), control- k 0.332 against 0.0205.
//  - G3: expected winding |W - W0| 0.0230 then 0.0227 (holds); the register's spread 0.132, 0.135, 0.206, 0.334,
//    0.450, 0.578 at beats 1, 16, 32, 64, 96, 128, second half 1.73 times the first (fails): each entry's winding is
//    minus the energy times its centroid's shift, and the free packet spreads.
//  WHAT IT MEANS: the energy lines are already in the rule mod 3 (the string), and Gauss for them is exact, but a
//  source stuck on its line drags a tube, not a 1/r field. Spreading them needs a move that changes their curl and
//  keeps their divergence, a plaquette move on the line register (remaining-pieces idea 3c), which is E-GRV-0090's step
//  relaxation by another name: the depth's dynamics, not its register, is what is still added. Title written after
//  the run.
//
// Depth L2 (G0 and G1 L1: continuity of a conserved count). DETERMINISM: no random numbers; the per-entry register is
// exact integers, amplitudes and expectations floats (measurement). NOTHING MOVES: the lines are read off the values
// the stream took. HUSK FIRST: flux and depth are read on the husk.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { boxHusk } from '@/code/measure/causal-components'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { cloneConfiguration } from '@/code/rule/doublet-locked-knit'
import { fullPathKey, pathOffset } from '@/code/measure/full-key-paths'
import { d4BoxCell } from '@/code/substrate/d4-box-integer'
import { divergence } from '@/code/rule/step-depth'
import { radionMesh } from '@/code/rule/trit-radion'
import { huskDistances } from '@/code/measure/plaquette-readings'
import {
  addHuskFlux,
  bulkLinks,
  huskCast,
  lineRunner,
  routeUnits,
  staticDepth,
} from '@/code/measure/energy-lines'
import {
  lineBasis,
  lineLightest,
  wholeBasis,
  type LineSector,
} from '@/code/measure/coined-line-bloch'
import {
  axisRing,
  blochPacket,
  fitRing,
  levelPlacement,
  ringCenter,
  ringColumns,
} from '@/code/measure/held-cluster'
import {
  cutDensity,
  pointBeatWith,
  type CutState,
  type PieceOptions,
} from '@/code/measure/bound-line'
import {
  lineGauge,
  placeCutFramed,
} from '@/code/measure/permutation-meeting'
import type { BoundOptions } from '@/code/rule/bound-line-pieces'
import {
  depthReading,
  exactLines,
  readSectors,
  ringHuskFlux,
  ringLinks,
  sectorBeat,
  sectorDensity,
  type DepthReading,
  type Sectors,
} from '@/code/measure/trio-energy-lines'

const BOX = 12
const P = 40
const SIDE = 16
const BEATS = 128
const WINDOW = 64
const REF = 8
const FIT_R: readonly number[] = [2, 3, 4, 5, 6]
const TARGET_K = 0.03072
const G1_TOLERANCE = 0.01
const G2_TOLERANCE = 0.05
const G3_RATIO = 1.25
const G3_FLOOR = 0.05
const SAME = 1e-9
const EXACT = 1e-12
const PAIR_ENERGY = 2
const OPTIONS: BoundOptions = { cost: true, sign: true }

export default experiment({
  id: 'gravity/trio-energy-line-depth',
  code: 'E-GRV-0127',
  title:
    "the held trio's own energy lines keep Gauss exactly but are not its depth, partial (fail on G2 and G3b; G0's integer register splits winding histories at 3.4e-7): E-SPN-0104's trio dragging E-GRV-0106's lines for 128 beats, the working rule's drift-cost string equals the energy register mod 3 on every link, entry and beat, every branch of the exact side-8 window obeys the register's continuity (0 off) and reverses bit for bit, and Gauss through every husk ball is exact (1.1e-13); but a love cannot leave its line, so the lines are a tube on the trio's husk line: summed as a depth they give k -0.236 against E-GRV-0119's 0.0307 (curl on 253 husk links, 98.8 percent of the flux divergence free), only their divergence-fixed part, a Poisson solve, gives the lump's k 0.0325; the expected winding stays within 0.023 but the register's spread grows 0.13 to 0.58 as the packet spreads; the same density's static field passes the reading (k 0.030724) and E-GRV-0107's pair misses it (0.332)",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const sector: LineSector = {
      flavors: [0, 0, 0],
      statistics: 'fermion',
      D: 3,
      box: BOX,
      unit: 0,
    }
    const basis = lineBasis(sector)
    const level = lineLightest(basis, wholeBasis(basis)).lightest
    const placed = levelPlacement(basis, level.cre, level.cim)

    // ---- G0, the exact window ----
    const exact = exactLines(OPTIONS, 8, 2, placed, P)

    // ---- the side-16 run ----
    const center = centerOf(SIDE)
    const f = contactFresh(SIDE, 'pass', center)
    const husk = boxHusk(f.weave.mesh, SIDE)
    const mesh = radionMesh([SIDE, SIDE, SIDE])
    const ring = axisRing(f.tables, center)
    const L = ring.docks.length
    const gauge = lineGauge(f.tables, ring)
    const fit = fitRing(placed, L)
    const links = ringLinks(f.tables, ring)
    const cast = huskCast(bulkLinks(f.tables), husk)
    const c0 =
      Math.round(
        ringCenter(
          blochPacket(basis, L, level.cre, level.cim, true).density(),
        ),
      ) % L
    const col = husk.column[ring.docks[c0]!]!
    const sink = (c0 + L / 2) % L
    const sinkCol = husk.column[ring.docks[sink]!]!
    const dist = huskDistances(SIDE, col)
    const options: PieceOptions = { ...OPTIONS, unit: 0, flat: false }

    let plain: CutState = placeCutFramed(gauge, fit.kept, P, 'parallel')
    let sectors: Sectors = new Map([
      [0, placeCutFramed(gauge, fit.kept, P, 'parallel')],
    ])

    const r0 = readSectors(L, sink, sectors, false)
    const lines = Float64Array.from(r0.gauss)
    const winding: number[] = [r0.circulation]
    const spread: number[] = [
      Math.sqrt(Math.max(0, r0.circulation2 - r0.circulation ** 2)),
    ]
    const z3 = new Set<number>(r0.z3)
    const sumFlux64 = new Float64Array(husk.columns * 9)
    const sumFlux128 = new Float64Array(husk.columns * 9)
    const sumDensity64 = new Float64Array(L)
    const hf = new Float64Array(husk.columns * 9)
    const hd = new Float64Array(husk.columns)

    let sectorGap = 0
    let gaussGap = 0
    let offSector = 0
    let largest = r0.largest
    let largestExpected = 0
    let g1Worst = 0
    let g1Abs = 0
    let g1Off = 0
    let g1Radii = 0

    const sectorsSeen = new Set<number>([0])

    for (let t = 1; t <= BEATS; t++) {
      sectors = sectorBeat(options, f.tables, ring, sectors)
      plain = pointBeatWith(options, f.tables, ring, plain)

      const dens = sectorDensity(L, sectors)
      const densPlain = cutDensity(L, plain)

      for (let x = 0; x < L; x++) {
        sectorGap = Math.max(
          sectorGap,
          Math.abs(dens[x]! - densPlain[x]!),
        )
      }

      for (const N of sectors.keys()) {
        sectorsSeen.add(N)
      }

      const r = readSectors(L, sink, sectors, true)

      for (let k = 0; k < L; k++) {
        lines[k]! += r.drag[k]!
        gaussGap = Math.max(gaussGap, Math.abs(lines[k]! - r.gauss[k]!))
        largestExpected = Math.max(largestExpected, Math.abs(lines[k]!))
      }

      for (const q of r.z3) {
        z3.add(q)
      }

      offSector = Math.max(offSector, r.offSector)
      largest = Math.max(largest, r.largest)
      winding.push(r.circulation)
      spread.push(
        Math.sqrt(Math.max(0, r.circulation2 - r.circulation ** 2)),
      )

      // G1: net outflow of each ball against the energy inside
      hf.fill(0)
      ringHuskFlux(links, cast, lines, hf)
      divergence(mesh, hf, hd)

      const content = ringColumns(husk, ring, dens)

      content[sinkCol]! -= 3

      for (let rad = 0; rad <= 7; rad++) {
        if (dist[sinkCol]! <= rad) {
          continue
        }

        let out = 0
        let inside = 0

        for (let c = 0; c < husk.columns; c++) {
          if (dist[c]! > rad) {
            continue
          }

          out += hd[c]!
          inside += content[c]!
        }

        // run 1's reading bug: the loves sit on alternate docks each beat, so a ball can enclose exactly 0, and a
        // relative error then divides by 0 (Infinity for a 1e-16 flux). "Within 1 percent of 0" is read as exact up to
        // float roundoff, 1e-12
        g1Worst = Math.max(
          g1Worst,
          Math.abs(out - inside) / Math.max(Math.abs(inside), 1e-10),
        )
        g1Abs = Math.max(g1Abs, Math.abs(out - inside))

        if (
          Math.abs(out - inside) >
          Math.max(G1_TOLERANCE * Math.abs(inside), 1e-12)
        ) {
          g1Off++
        }

        if (t === 1) {
          g1Radii++
        }
      }

      for (let l = 0; l < hf.length; l++) {
        if (t <= WINDOW) {
          sumFlux64[l]! += hf[l]!
        }

        sumFlux128[l]! += hf[l]!
      }

      if (t <= WINDOW) {
        for (let x = 0; x < L; x++) {
          sumDensity64[x]! += dens[x]!
        }
      }
    }

    const avg64 = Float64Array.from(sumFlux64, v => v / WINDOW)
    const avg128 = Float64Array.from(sumFlux128, v => v / BEATS)
    const density64 = Float64Array.from(sumDensity64, v => v / WINDOW)
    const energy = density64.reduce((s, v) => s + v, 0)
    const target = (TARGET_K * energy) / 3
    const read64 = depthReading(SIDE, col, avg64, REF, FIT_R)
    const read128 = depthReading(SIDE, col, avg128, REF, FIT_R)
    const within = (d: DepthReading, k: number): boolean =>
      Math.abs(d.k / k - 1) <= G2_TOLERANCE

    // ---- CONTROL+: the same density's static field through G2's summing ----
    const coulomb = staticDepth(
      SIDE,
      ringColumns(husk, ring, density64),
    )
    const readPlus = depthReading(SIDE, col, coulomb.flux, REF, FIT_R)
    const controlPlus = within(readPlus, target)

    // ---- CONTROL-: E-GRV-0107's seeded pair, its dragged lines in the bulk ----
    const anti = d4BoxCell({ coordinates: [0, 0, 0, 0], side: SIDE })
    const blinks = bulkLinks(f.tables)
    const vacuum = wordVacuum(f, f.store)
    const seeded = cloneConfiguration(vacuum)

    seeded.vibe[center * 24 + 6] = 1
    seeded.open[center * 24 + 6] = 1
    seeded.vibe[center * 24 + 8] = -1
    seeded.open[center * 24 + 8] = 1

    const placedLines = new Int32Array(f.cells * 12)

    routeUnits(blinks, placedLines, center, anti, PAIR_ENERGY)

    const key = fullPathKey(pathOffset(0))
    const va = lineRunner(
      f.tables,
      vacuum,
      new Int32Array(f.cells * 12),
      key,
    )
    const sb = lineRunner(f.tables, seeded, placedLines, key)
    const pairFlux = new Float64Array(husk.columns * 9)

    for (let t = 0; t < WINDOW; t++) {
      va.beat()
      sb.beat()
      addHuskFlux(cast, sb.line, pairFlux, 1 / WINDOW)
      addHuskFlux(cast, va.line, pairFlux, -1 / WINDOW)
    }

    const readMinus = depthReading(
      SIDE,
      husk.column[center]!,
      pairFlux,
      REF,
      FIT_R,
    )
    const controlMinus = !within(
      readMinus,
      (TARGET_K * PAIR_ENERGY) / 3,
    )

    // ---- the gates ----
    const g0 =
      exact.continuityOff === 0 &&
      exact.offRing === 0 &&
      exact.disturbed === 0 &&
      exact.leak <= EXACT &&
      exact.dragGap <= EXACT &&
      exact.reversed &&
      sectorGap <= SAME &&
      gaussGap <= SAME
    const g1 = g1Off === 0 && g1Radii > 0
    const g2 = within(read64, target)
    const half = (xs: number[], from: number, to: number): number =>
      Math.max(...xs.slice(from, to + 1))
    const dW = winding.map(w => Math.abs(w - winding[0]!))
    const g3aFirst = half(dW, 0, WINDOW)
    const g3aSecond = half(dW, WINDOW + 1, BEATS)
    const g3bFirst = half(spread, 0, WINDOW)
    const g3bSecond = half(spread, WINDOW + 1, BEATS)
    const g3a = g3aSecond <= Math.max(G3_RATIO * g3aFirst, G3_FLOOR)
    const g3b = g3bSecond <= Math.max(G3_RATIO * g3bFirst, G3_FLOOR)
    const g3 = g3a && g3b
    const status = !(controlPlus && controlMinus && g0)
      ? 'partial'
      : g1 && g2 && g3
        ? 'pass'
        : 'fail'
    const f4 = (x: number): string => x.toFixed(4)
    const metrics: Record<string, number> = {
      gate_G0: g0 ? 1 : 0,
      gate_G1: g1 ? 1 : 0,
      gate_G2: g2 ? 1 : 0,
      gate_G3: g3 ? 1 : 0,
      gate_G3a: g3a ? 1 : 0,
      gate_G3b: g3b ? 1 : 0,
      controlPlus: controlPlus ? 1 : 0,
      controlMinus: controlMinus ? 1 : 0,
      energy,
      targetK: target,
      k64: read64.k,
      k128: read128.k,
      curl64: read64.curl,
      helmK64: read64.helmK,
      freeShare64: read64.freeShare,
      plusK: readPlus.k,
      minusK: readMinus.k,
      minusHelmK: readMinus.helmK,
      minusFreeShare: readMinus.freeShare,
      g1Worst,
      g1Abs,
      g1Off,
      g1Radii,
      sectorGap,
      gaussGap,
      offSector,
      sectors: sectorsSeen.size,
      z3Residues: z3.size,
      z3Zero: z3.size === 1 && z3.has(0) ? 1 : 0,
      largestEntryLine: largest,
      largestExpectedLine: largestExpected,
      windingFirst: g3aFirst,
      windingSecond: g3aSecond,
      spreadFirst: g3bFirst,
      spreadSecond: g3bSecond,
      exactContinuityOff: exact.continuityOff,
      exactDragGap: exact.dragGap,
      exactReversed: exact.reversed ? 1 : 0,
      c0,
      sink,
      sinkDistance: dist[sinkCol]!,
      seconds: (Date.now() - started) / 1000,
    }

    for (let q = 0; q <= REF; q++) {
      metrics[`lines64_r${q}`] = read64.profile[q]!
      metrics[`plus_r${q}`] = readPlus.profile[q]!
      metrics[`helm64_r${q}`] = read64.helmProfile[q]!
    }

    const at = [1, 16, 32, 64, 96, 128]

    return verdict({
      status,
      claim: `E-SPN-0104's held trio (energy ${energy.toFixed(5)} over ${WINDOW} beats) dragging E-GRV-0106's energy lines for ${BEATS} beats, the integer register carried exactly as ${sectorsSeen.size} cut sectors (weight off N = 0 at most ${offSector.toExponential(2)}; sectored against plain ${sectorGap.toExponential(1)}; lines against the Gauss register ${gaussGap.toExponential(1)}; residues L - c - Q mod 3 {${[...z3].join(', ')}}): G1 Gauss through ${g1Radii} husk balls on ${BEATS} beats off ${g1Off}, largest gap ${g1Abs.toExponential(2)} (relative ${g1Worst.toExponential(2)}); G2 the depth summed from the lines' averaged flux x(r) - x(8) ${read64.profile.slice(0, REF).map(f4).join(', ')}, k ${read64.k.toExponential(4)} against ${target.toExponential(4)} (curl on ${read64.curl} husk links; its divergence-fixed part k ${read64.helmK.toExponential(4)}, ${(100 * read64.freeShare).toFixed(1)} percent of the flux divergence free; 128 beats k ${read128.k.toExponential(4)}); G3 winding |W - W0| largest ${g3aFirst.toExponential(2)} then ${g3aSecond.toExponential(2)}, register spread ${g3bFirst.toFixed(4)} then ${g3bSecond.toFixed(4)} (at beats ${at.join(', ')}: ${at.map(t => spread[t]!.toFixed(3)).join(', ')}); largest line on an entry ${largest}, expected ${largestExpected.toFixed(3)}; control+ (the same density's static field summed) k ${readPlus.k.toExponential(4)}; control- (E-GRV-0107's pair) k ${readMinus.k.toExponential(4)} against ${((TARGET_K * PAIR_ENERGY) / 3).toExponential(4)}`,
      metrics,
      control: {
        plus: controlPlus ? 1 : 0,
        minus: controlMinus ? 1 : 0,
      },
      notes: `L2 (G0, G1 L1). Gates G0 ${g0}, G1 ${g1}, G2 ${g2}, G3 ${g3} (a ${g3a}, b ${g3b}); control+ ${controlPlus}, control- ${controlMinus}. Exact window (side 8, 2 beats): branches ${exact.branches.join(', ')}, continuity off ${exact.continuityOff}, off the ring ${exact.offRing}, disturbed ${exact.disturbed}, leak ${exact.leak.toExponential(1)}, expected drag against the ring form ${exact.dragGap.toExponential(1)}, reversed ${exact.reversed}. Start center ${c0}, sink ${sink} at husk distance ${dist[sinkCol]}. Control- divergence-fixed k ${readMinus.helmK.toExponential(4)}, divergence-free share ${(100 * readMinus.freeShare).toFixed(1)} percent, curl on ${readMinus.curl} links. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
