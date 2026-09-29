// DOES THE HELD CLUSTER'S ENERGY SOURCE A LUMP'S 1/r (E-GRV-0119; run as E-GRV-0118, renumbered before registering
// because a parallel experiment took 0118 first; the record log prints the old code)? E-GRV-0110 read E-GRV-0090's static depth of E-SPN-0093's
// cluster run by the working vacuum's rule: the cluster spread along its line, so its energy sourced a line's depth (k
// 0.0151 against the point lump's 0.0324), while the stand-in's held packet gave the lump's 1/r (k 0.0307). E-SPN-0104
// found the working rule with the drift cost and the fermion sign (E-SPN-0103's pieces) HOLDS the cluster once it is
// placed in one frame along its line (the transport along a line is flat; E-SPN-0103 had put every love at point 0 in
// the table's gauge, a different frame at every dock). This is E-GRV-0110's depth read, unchanged, on that held source.
// note/research/vibe/roadmap/discrete-gravity.md, Part 5e.
//
// THE SOURCES (code/measure/permutation-meeting, code/measure/bound-line pointBeatWith, the ring form E-SPN-0104 checks
// against the exact rule): E-SPN-0104's WabP (the working rule, both pieces, the working split meeting, the parallel
// placement) and KabP (the same with the 'keep' permutation meeting), each on the side-16 working vacuum's axis line
// for WINDOW beats; the expected energy excess per husk column (one unit a love) averaged over the window.
//
// THE DEPTH, THE WINDOW AND THE FIT are E-GRV-0110's exactly: code/measure/energy-lines staticDepth, the profile
// x(r) - x(8) of shell means about the column of the packet's start center, a + k / r on r = 2 .. 6, against a POINT
// lump of the same total energy on that column. 64 beats.
//
// GATES, E-GRV-0110's exactly, fixed before the first run of this file, read on each source.
//  E0 the energy identity: on the exact side-8 window (2 beats) of each source's rule and placement the rule's expected
//     energy excess per husk column equals the ring form's love density within 1e-12, the vacuum untouched on every
//     branch, no leak, the norm kept exactly.
//  D1 1/r with the lump's k: the profile within 10 percent of the point lump's at every r = 2 .. 6, and a fitted k within
//     10 percent of the point lump's.
//  D2 the core is the cluster's: the least r_c in 1 .. 7 from which the profile stays within 10 percent (7 if none) is at
//     most the source's own R90 + 1.
//  CONTROL+: the stand-in operator's packet (run A) passes D1 and D2. CONTROL-: the point lump moved 4 columns along the
//     line misses D1. And E-GRV-0110's own source (E-SPN-0103's placement, the working rule, no pieces: code/measure/
//     held-cluster pointBeat) must MISS D1 again (the gate refuses a source that spreads).
//  Verdict: partial if a control fails; pass if E0, D1, D2 hold on both sources; fail otherwise.
// PREDICTED: pass; WabP and KabP read as the stand-in's packet (E-SPN-0104 read them equal to the flat-link form beat by
// beat over 32 beats), ratio about 0.95 to 1.00 at r = 2 .. 6.
//
// FIRST RUN (62 s, tmp/split-grv-run1.log, the record): pass, as predicted, no gate moved. Both sources hold 3.00000
// units within R90 3 of their start (0.60, 0.76, 0.62, 0.34 on the four central columns), E0 exact (energy gap 4.4e-16,
// 0 disturbed, reversed). Depth ratio 0.827, 0.952, 0.989, 0.990, 0.997, 1.000, 1.004 at r = 1 .. 7, k 0.030724 against
// the point lump's 0.032409 (5.2 percent under), core 2. Both controls hold: E-GRV-0110's spreading source again reads
// 0.37 to 0.90 (k 0.0151), the moved lump 0.14 at r = 1. WHAT IT DOES AND DOES NOT SHOW: the held sources agree with
// the stand-in's packet to five places, as E-SPN-0104 found beat by beat, so this is the stand-in's chain now run by
// the working rule, not a second independent source; the 5 percent in k is the packet's own spread over 64 beats (the
// stand-in read the same), not the rule's. Title written after the run.
//
// Depth L2. DETERMINISM: no random numbers. The rule in the exact window is exact per slice; the ring form, the
// averages, the Poisson solve and the fits are floats (measurement). NOTHING MOVES. HUSK FIRST: source and depth are
// husk columns.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { boxHusk } from '@/code/measure/causal-components'
import { shellMeans, staticDepth } from '@/code/measure/energy-lines'
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
  placePoints,
  pointBeat,
  pointDensity,
  ringCenter,
  ringColumns,
  ringRadius,
  type PointState,
} from '@/code/measure/held-cluster'
import {
  cutDensity,
  pointBeatWith,
  type CutState,
  type PieceOptions,
} from '@/code/measure/bound-line'
import {
  lineGauge,
  meetingWindow,
  placeCutFramed,
} from '@/code/measure/permutation-meeting'
import type { BoundOptions } from '@/code/rule/bound-line-pieces'

const BOX = 12
const P = 40
const SIDE = 16
const WINDOW = 64
const REF = 8
const PROFILE_R: readonly number[] = [2, 3, 4, 5, 6]
const TOLERANCE = 0.1
const MOVE = 4
const EXACT = 1e-12
const SOURCES: readonly { name: string; options: BoundOptions }[] = [
  { name: 'WabP', options: { cost: true, sign: true } },
  {
    name: 'KabP',
    options: { cost: true, sign: true, meeting: 'keep' },
  },
]

// least squares of y = a + k / r
function inverseFit(
  rs: readonly number[],
  ys: readonly number[],
): { a: number; k: number } {
  const xs = rs.map(r => 1 / r)
  const mx = xs.reduce((s, v) => s + v, 0) / xs.length
  const my = ys.reduce((s, v) => s + v, 0) / ys.length
  const k =
    xs.reduce((s, v, i) => s + (v - mx) * (ys[i]! - my), 0) /
    xs.reduce((s, v) => s + (v - mx) ** 2, 0)

  return { a: my - k * mx, k }
}

export default experiment({
  id: 'gravity/framed-cluster-depth',
  code: 'E-GRV-0119',
  title:
    "the working rule's held cluster sources a lump's 1/r, pass: with the drift cost and the fermion sign and the cluster placed in one frame (E-SPN-0104), its 3 units stay within R90 3 over 64 beats under the working split meeting and under the keep meeting alike, the rule's energy excess equals the ring form's to 4e-16 with the vacuum untouched, and E-GRV-0090's static depth of that source reads 0.95 to 1.00 of the same-energy point lump's at r = 2 .. 6, k 0.03072 against 0.03241, core 2; E-GRV-0110's spreading source is refused again (0.37 to 0.90, k 0.0151); the held source equals the stand-in's packet to five places, so this closes the chain on the working rule rather than adding an independent source",
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

    // ---- E0, per source ----
    const windows = SOURCES.map(s =>
      meetingWindow(s.options, 'parallel', 8, 2, placed, P),
    )
    const e0 = windows.map(
      w =>
        w.reversed &&
        w.beats.every(
          b =>
            b.normKept &&
            b.disturbed === 0 &&
            b.leak === 0 &&
            b.energyGap <= EXACT,
        ),
    )

    // ---- the sources on the side-16 line ----
    const center = centerOf(SIDE)
    const f = contactFresh(SIDE, 'pass', center)
    const husk = boxHusk(f.weave.mesh, SIDE)
    const ring = axisRing(f.tables, center)
    const L = ring.docks.length
    const gauge = lineGauge(f.tables, ring)
    const fit = fitRing(placed, L)
    const a = blochPacket(basis, L, level.cre, level.cim, true)
    const startDensity = a.density()
    const c0 = Math.round(ringCenter(startDensity)) % L
    const col = husk.column[ring.docks[c0]!]!
    const sums = SOURCES.map(() => new Float64Array(L))
    const sumA = new Float64Array(L)
    const sumW = new Float64Array(L)
    const states: CutState[] = SOURCES.map(() =>
      placeCutFramed(gauge, fit.kept, P, 'parallel'),
    )
    const options: PieceOptions[] = SOURCES.map(s => ({
      ...s.options,
      unit: 0,
      flat: false,
    }))

    let w: PointState = placePoints(L, fit.kept, 0, P)

    for (let t = 1; t <= WINDOW; t++) {
      a.step()
      w = pointBeat(f.tables, ring, w)

      const da = a.density()
      const dw = pointDensity(L, w)

      SOURCES.forEach((_, i) => {
        states[i] = pointBeatWith(
          options[i]!,
          f.tables,
          ring,
          states[i]!,
        )

        const d = cutDensity(L, states[i])

        for (let x = 0; x < L; x++) {
          ;(sums[i] as Float64Array)[x]! += d[x]!
        }
      })

      for (let x = 0; x < L; x++) {
        sumA[x]! += da[x]!
        sumW[x]! += dw[x]!
      }
    }

    const avg = sums.map(s => Float64Array.from(s, v => v / WINDOW))
    const avgA = Float64Array.from(sumA, v => v / WINDOW)
    const avgW = Float64Array.from(sumW, v => v / WINDOW)
    const total = (avg[0] as Float64Array).reduce((s, v) => s + v, 0)

    const profile = (rho: Float64Array): number[] => {
      const m = shellMeans(SIDE, col, staticDepth(SIDE, rho).depth)

      return m.map(v => v - m[REF]!)
    }

    const pointAt = (c: number): Float64Array => {
      const rho = new Float64Array(husk.columns)

      rho[c] = total

      return rho
    }

    const pp = profile(pointAt(col))
    const pointFit = inverseFit(
      PROFILE_R,
      PROFILE_R.map(r => pp[r]!),
    )

    const read = (pr: number[], source: Float64Array) => {
      const ratio = [1, 2, 3, 4, 5, 6, 7].map(r => pr[r]! / pp[r]!)
      const k = inverseFit(
        PROFILE_R,
        PROFILE_R.map(r => pr[r]!),
      ).k
      const d1 =
        PROFILE_R.every(
          r => Math.abs(ratio[r - 1]! - 1) <= TOLERANCE,
        ) && Math.abs(k / pointFit.k - 1) <= TOLERANCE

      let core = 7

      for (let r = 7; r >= 1; r--) {
        if (Math.abs(ratio[r - 1]! - 1) > TOLERANCE) {
          break
        }

        core = r
      }

      const r90 = ringRadius(source, c0, 0.9)

      return {
        ratio,
        k,
        d1,
        core,
        r90,
        d2: core <= r90 + 1,
        profile: pr,
      }
    }

    const rS = avg.map(s =>
      read(profile(ringColumns(husk, ring, s)), s),
    )
    const rA = read(profile(ringColumns(husk, ring, avgA)), avgA)
    const rW = read(profile(ringColumns(husk, ring, avgW)), avgW)
    const rM = read(
      profile(pointAt(husk.column[ring.docks[(c0 + MOVE) % L]!]!)),
      avg[0] as Float64Array,
    )
    const controlPlus = rA.d1 && rA.d2
    const controlMinus = !rM.d1 && !rW.d1
    const held = SOURCES.map((_, i) => e0[i]! && rS[i]!.d1 && rS[i]!.d2)
    const status = !(controlPlus && controlMinus)
      ? 'partial'
      : held.every(Boolean)
        ? 'pass'
        : 'fail'
    const f4 = (x: number): string => x.toFixed(4)
    const f3 = (x: number): string => x.toFixed(3)
    const metrics: Record<string, number> = {
      controlPlus: controlPlus ? 1 : 0,
      controlMinus: controlMinus ? 1 : 0,
      totalEnergy: total,
      pointK: pointFit.k,
      standInK: rA.k,
      standInCore: rA.core,
      standInR90: rA.r90,
      workingK: rW.k,
      seconds: (Date.now() - started) / 1000,
    }

    SOURCES.forEach((s, i) => {
      const r = rS[i]!

      metrics[`${s.name}_E0`] = e0[i] ? 1 : 0
      metrics[`${s.name}_D1`] = r.d1 ? 1 : 0
      metrics[`${s.name}_D2`] = r.d2 ? 1 : 0
      metrics[`${s.name}_k`] = r.k
      metrics[`${s.name}_core`] = r.core
      metrics[`${s.name}_r90`] = r.r90
      metrics[`${s.name}_worstEnergyGap`] = Math.max(
        ...windows[i]!.beats.map(b => b.energyGap),
      )

      metrics[`${s.name}_total`] = (avg[i] as Float64Array).reduce(
        (q, v) => q + v,
        0,
      )

      for (let q = 0; q <= REF; q++) {
        metrics[`${s.name}_r${q}`] = r.profile[q]!
      }
    })

    for (let q = 0; q <= REF; q++) {
      metrics[`point_r${q}`] = pp[q]!
    }

    const sourceRow = (
      name: string,
      r: ReturnType<typeof read>,
      s: Float64Array,
    ): string =>
      `${name} (along its husk line ${[...s].map(v => v.toFixed(3)).join(' ')}, R90 ${r.r90}): x(r) - x(8) ${r.profile.slice(0, REF).map(f4).join(', ')}, ratio ${r.ratio.map(f3).join(', ')} at r = 1 .. 7, k ${r.k.toExponential(4)}, core ${r.core}, D1 ${r.d1}, D2 ${r.d2}`

    return verdict({
      status,
      claim: `the held cluster, energy ${total.toFixed(5)} averaged over ${WINDOW} beats: ${SOURCES.map((s, i) => `${sourceRow(s.name, rS[i]!, avg[i] as Float64Array)}, E0 ${e0[i]}`).join(' | ')}; the point lump ${pp.slice(0, REF).map(f4).join(', ')}, k ${pointFit.k.toExponential(4)}; the stand-in's packet ratio ${rA.ratio.map(f3).join(', ')}, k ${rA.k.toExponential(4)}, core ${rA.core}; E-GRV-0110's spreading source ratio ${rW.ratio.map(f3).join(', ')}, k ${rW.k.toExponential(4)} (D1 ${rW.d1}); the lump moved ${MOVE} columns ${rM.ratio.map(f3).join(', ')}`,
      metrics,
      control: {
        plus: controlPlus ? 1 : 0,
        minus: controlMinus ? 1 : 0,
      },
      notes: `L2. Held (E0, D1, D2): ${SOURCES.map((s, i) => `${s.name} ${held[i]}`).join(', ')}; control+ ${controlPlus} (D1 ${rA.d1}, D2 ${rA.d2}), control- ${controlMinus} (moved lump D1 ${rM.d1}, E-GRV-0110's source D1 ${rW.d1}). Point fit a ${pointFit.a.toExponential(3)} k ${pointFit.k.toExponential(4)}. Exact windows (side 8, 2 beats): ${SOURCES.map((s, i) => `${s.name} ${windows[i]!.beats.map(b => `${b.branches} branches, energy gap ${b.energyGap.toExponential(1)}, disturbed ${b.disturbed}`).join('; ')}, reversed ${windows[i]!.reversed}`).join(' | ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
