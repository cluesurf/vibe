// DOES A HELD CLUSTER'S ENERGY SOURCE THE DEPTH (E-GRV-0110)? E-GRV-0106 showed that the rule's conserved energy E = count
// + 2 sum |tau| carries its Gauss law for free, and E-GRV-0107 that the depth follows the energy only where the energy
// stays: a sparse love+fear pair spreads, so it sources no lump. E-SPN-0093's one-line three-love cluster is the one
// bound state known. This is the chain with nothing placed by hand: the rule's own energy, held in place by the rule's
// own bound state (E-SPN-0102 runs it in the working vacuum), as the source of E-GRV-0090's bounded static step field.
// note/project/vibe/roadmap/research/discrete-gravity.md, Part 5e.
//
// THE SOURCE. E-SPN-0102's placed packet on the side-16 working vacuum's axis line, run by the working vacuum's rule (the
// point-carrying ring form, code/measure/held-cluster pointBeat, which E-SPN-0102 checks equal to the exact superposed rule
// with the vacuum untouched), for WINDOW beats; its expected energy excess per husk column (one unit a love, which the
// exact check below re-reads on a side-8 box: the rule's expected dock energy minus the vacuum's, per column, equals the
// ring form's love density there) averaged over the window. The vacuum's background is subtracted by construction: the
// excess is the seeded run's energy minus the vacuum run's, which stays the vacuum's own on every branch.
//
// THE DEPTH: E-GRV-0090's static field for that content (code/measure/energy-lines staticDepth: the torus's mean
// removed, F = g grad x with div F = rho by code/measure/trit-hop-light coulombFlux, the depth x summed along paths by
// code/rule/step-depth stepDepth), read as the radial profile x(r) - x(8) of shell means about the column of the
// packet's start center, and fitted with a + k / r on r = 2 .. 6. AGAINST: the same field for a POINT lump of the same
// total energy on that column (E-GRV-0090's for the same total energy, the lump the chain should reproduce).
//
// THE WINDOW: 64 beats, about 3.4 of the level's periods 2 pi / 0.33. Chosen on the reference alone (tmp/bsrc-probe7.log,
// E-SPN-0093's own operator's packet, run A of E-SPN-0102): averaged over 16, 32, 64, 128 beats its profile reads 0.992 to
// 1.000, 0.983 to 1.000, 0.952 to 1.000 and 0.865 to 0.998 of the point lump's at r = 2 .. 6 (k 0.0307 against 0.0324 at
// 64), because even the bound state's packet spreads along its line as its 16 momenta dephase (E-SPN-0102). No probe read
// the working vacuum's run as a source.
//
// GATES, fixed before the first run of this file.
//  E0 the energy identity: on the exact side-8 window (2 beats) the rule's expected energy excess per husk column equals
//     the ring form's love density within 1e-12, the vacuum untouched on every branch, the norm kept exactly.
//  D1 1/r with the lump's k: the working vacuum's source gives a profile within 10 percent of the point lump's at every
//     r = 2 .. 6, and a fitted k within 10 percent of the point lump's.
//  D2 the core is the cluster's: the least r_c in 1 .. 7 from which the profile stays within 10 percent (7 if none) is at
//     most the source's own R90 (the radius about the start's center holding 90 percent of the averaged energy) + 1.
//  CONTROL+: the stand-in operator's packet (run A) averaged the same way passes D1 and D2 (the gate can see a held
//     source). CONTROL-: the point lump moved 4 columns along the line misses D1 (the gate can tell a lump elsewhere).
//  Verdict: partial if a control fails; pass if E0, D1, D2 hold; fail otherwise.
// PREDICTED: fail on D1 and D2 (E-SPN-0102 predicts the cluster does not hold in the working vacuum), E0 and both controls
// hold.
//
// FIRST RUN (115 s, tmp/bsrc-grv-run1.log, the record): fail on D1, no gate moved. E0 holds (4.4e-16, 0 disturbed).
// The working vacuum's source is not a lump: averaged over 64 beats it lies 0.16 to 0.25 on every column of its husk
// line (R90 7, the whole ring), so it is a line source, and its depth x(r) - x(8) reads 0.0207, 0.0097, 0.0060, 0.0042,
// 0.0027, 0.0017, 0.0009 at r = 0 .. 6 against the point lump's 0.1522, 0.0259, 0.0118, 0.0067, 0.0039, 0.0021, 0.0010:
// ratio 0.37, 0.51, 0.62, 0.69, 0.79, 0.90 at r = 1 .. 6, k 0.0151 against 0.0324 (0.47). D2 PASSES VACUOUSLY: the core
// (6) is under the source's R90 + 1 = 8 only because the source fills the ring, so D2 says nothing here. Both controls
// hold: the stand-in's packet (R90 3) reads 0.83, 0.95, 0.99, 0.99, 1.00, 1.00 with k 0.0307 (0.95) and core 2, and the
// moved lump misses (0.14, 0.32, 0.60 at r = 1 .. 3). What it means: the chain works for a held source (the stand-in's
// packet gives the lump's 1/r within 5 percent outside its core), but the working vacuum's rule does not hold the
// cluster (E-SPN-0102), so its energy spreads along the line and sources a line's depth, not a lump's. Title written
// after the run.
//
// Depth L2. DETERMINISM: no random numbers. The rule in the exact window is exact in Z[w][1/2]; the ring form, the
// averages, the Poisson solve and the fits are floats (measurement, never read by the rule). NOTHING MOVES. HUSK FIRST:
// source and depth are husk columns.

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
  exactWindow,
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

const BOX = 12
const P = 40
const SIDE = 16
const WINDOW = 64
const REF = 8
const PROFILE_R: readonly number[] = [2, 3, 4, 5, 6]
const TOLERANCE = 0.1
const MOVE = 4
const EXACT = 1e-12

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
  id: 'gravity/held-cluster-depth',
  code: 'E-GRV-0110',
  title:
    "the working vacuum's rule does not hold E-SPN-0093's cluster, so its energy sources a line's depth and not a lump's, fail on D1: averaged over 64 beats the cluster's 3 units lie 0.16 to 0.25 on every column of its husk line (the rule's expected energy excess equals the ring form's love density to 4e-16, the vacuum untouched), and E-GRV-0090's static field of that source reads 0.37 to 0.90 of the same-energy point lump's at r = 1 .. 6, k 0.0151 against 0.0324; the stand-in's own held packet gives the lump's 1/r (0.95 to 1.00 at r = 2 .. 6, k 0.0307, core 2), so the chain holds where the source holds; the core gate passes only vacuously (the source fills the ring)",
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

    // ---- E0 ----
    const win = exactWindow(8, 2, placed, P)
    const gE0 = win.beats.every(
      b =>
        b.normKept &&
        b.disturbed === 0 &&
        b.leak === 0 &&
        b.energyGap <= EXACT,
    )

    // ---- the two sources on the side-16 line ----
    const center = centerOf(SIDE)
    const f = contactFresh(SIDE, 'pass', center)
    const husk = boxHusk(f.weave.mesh, SIDE)
    const ring = axisRing(f.tables, center)
    const L = ring.docks.length
    const fit = fitRing(placed, L)
    const a = blochPacket(basis, L, level.cre, level.cim, true)
    const startDensity = a.density()
    const c0 = Math.round(ringCenter(startDensity)) % L
    const col = husk.column[ring.docks[c0]!]!
    const sumW = new Float64Array(L)
    const sumA = new Float64Array(L)

    let w: PointState = placePoints(L, fit.kept, 0, P)

    for (let t = 1; t <= WINDOW; t++) {
      w = pointBeat(f.tables, ring, w)
      a.step()

      const dw = pointDensity(L, w)
      const da = a.density()

      for (let x = 0; x < L; x++) {
        sumW[x]! += dw[x]!
        sumA[x]! += da[x]!
      }
    }

    const avgW = Float64Array.from(sumW, v => v / WINDOW)
    const avgA = Float64Array.from(sumA, v => v / WINDOW)
    const total = avgW.reduce((s, v) => s + v, 0)

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

      return { ratio, k, d1, core, r90, d2: core <= r90 + 1 }
    }

    const pW = profile(ringColumns(husk, ring, avgW))
    const pA = profile(ringColumns(husk, ring, avgA))
    const pM = profile(
      pointAt(husk.column[ring.docks[(c0 + MOVE) % L]!]!),
    )
    const rW = read(pW, avgW)
    const rA = read(pA, avgA)
    const rM = read(pM, avgW)
    const controlPlus = rA.d1 && rA.d2
    const controlMinus = !rM.d1
    const status = !(controlPlus && controlMinus)
      ? 'partial'
      : gE0 && rW.d1 && rW.d2
        ? 'pass'
        : 'fail'
    const f4 = (x: number): string => x.toFixed(4)
    const f3 = (x: number): string => x.toFixed(3)
    const metrics: Record<string, number> = {
      gate_E0: gE0 ? 1 : 0,
      gate_D1: rW.d1 ? 1 : 0,
      gate_D2: rW.d2 ? 1 : 0,
      controlPlus: controlPlus ? 1 : 0,
      controlMinus: controlMinus ? 1 : 0,
      totalEnergy: total,
      pointK: pointFit.k,
      clusterK: rW.k,
      standInK: rA.k,
      clusterCore: rW.core,
      clusterR90: rW.r90,
      standInCore: rA.core,
      standInR90: rA.r90,
      windowWorstEnergyGap: Math.max(
        ...win.beats.map(b => b.energyGap),
      ),
      seconds: (Date.now() - started) / 1000,
    }

    for (let r = 0; r <= REF; r++) {
      metrics[`cluster_r${r}`] = pW[r]!
      metrics[`point_r${r}`] = pp[r]!
      metrics[`standIn_r${r}`] = pA[r]!
    }

    return verdict({
      status,
      claim: `the working vacuum's cluster, energy ${total.toFixed(5)} averaged over ${WINDOW} beats along its husk line (${[...avgW].map(v => v.toFixed(3)).join(' ')}, R90 ${rW.r90}), sources a depth x(r) - x(8) of ${pW.slice(0, REF).map(f4).join(', ')} at r = 0 .. 7 against the point lump's ${pp.slice(0, REF).map(f4).join(', ')}: ratio ${rW.ratio.map(f3).join(', ')} at r = 1 .. 7, k ${rW.k.toExponential(4)} against ${pointFit.k.toExponential(4)}, core ${rW.core}; the stand-in's packet (R90 ${rA.r90}) reads ratio ${rA.ratio.map(f3).join(', ')}, k ${rA.k.toExponential(4)}, core ${rA.core}; the lump moved ${MOVE} columns reads ${rM.ratio.map(f3).join(', ')}; energy identity on the exact side-8 window ${Math.max(...win.beats.map(b => b.energyGap)).toExponential(1)}`,
      metrics,
      control: {
        plus: controlPlus ? 1 : 0,
        minus: controlMinus ? 1 : 0,
      },
      notes: `L2. Gates E0 ${gE0}, D1 ${rW.d1}, D2 ${rW.d2}; control+ ${controlPlus} (D1 ${rA.d1}, D2 ${rA.d2}), control- ${controlMinus}. Fits a + k/r on r = 2 .. 6: point a ${pointFit.a.toExponential(3)} k ${pointFit.k.toExponential(4)}. Stand-in's averaged source along the line: ${[...avgA].map(v => v.toFixed(3)).join(' ')}. Exact window (side 8, 2 beats): ${win.beats.map(b => `${b.branches} branches, energy gap ${b.energyGap.toExponential(1)}, disturbed ${b.disturbed}`).join('; ')}, reversed ${win.reversed}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
