// DOES THE MOVING LEVEL SOURCE THE SAME 1/r IN ITS REST FRAME (E-GRV-0121; run as E-GRV-0120, renumbered before
// registering because a parallel experiment took 0120 first; the record log prints the old code)? E-GRV-0119 found E-SPN-0104's held level,
// at rest, sources a lump's 1/r (k 0.03072 against the same-energy point lump's 0.03241). E-SPN-0105 gave it momentum:
// at every K up to pi/2 it holds (fidelity at least 0.99 over 128 beats) and its centroid moves at the stand-in band's
// dE/dK (M1 and M2), with an inertia m* far above its rest energy (M3). This reads the depth of the MOVING level in the
// frame that moves with it.
//
// THE SOURCES (code/measure/moving-level, the ring form code/measure/bound-line pointBeatWith with E-SPN-0104's WabP
// rule: both pieces, the working split meeting): a packet of the level at K under a fixed envelope over five lifted
// anchors of the 32-position cover, cos^2(pi d / 6) for d = -2 .. 2 about anchor 0 (a packet of momenta about K, so it
// is localized and still moves at about dE/dK), at K = 0, pi/4 and pi/2, each run WINDOW beats. Its love density on the
// ring (3 units, normalized by the packet's weight) is read each beat in the co-moving frame, shifted by v t, v the
// stand-in's dE/dK at K (a prediction, not the measured motion), by trigonometric interpolation (code/measure/
// moving-level shiftRing, measurement), and averaged over the window.
//
// THE DEPTH AND THE FIT are E-GRV-0119's exactly: code/measure/energy-lines staticDepth, the profile x(r) - x(8) of
// shell means about the husk column of the packet's start center, a + k / r on r = 2 .. 6.
//
// GATES, fixed before the first run of this file.
//  V1 the rest frame's 1/r: at K = pi/4 and pi/2 the co-moving source's k is within 0.95 .. 1.05 of the K = 0 packet's
//     k (the same envelope, at rest).
//  CONTROL+: the K = 0 packet is a lump: its profile within 10 percent of the same-energy point lump's at every r = 2 .. 6
//     and its k within 10 percent (E-GRV-0119's D1); and E-GRV-0119's own held source (E-SPN-0104's WabP, the level at
//     one anchor) reproduces its recorded k 0.03072353960423452 within 1e-12.
//  CONTROL-: E-GRV-0110's spreading source (E-SPN-0103's placement, the working rule with no pieces, code/measure/
//     held-cluster pointBeat) misses E-GRV-0119's D1 again.
//  Verdict: partial if a control fails; pass if V1 holds at both K; fail otherwise.
// REPORTED, not gated, THE SPEED FACTORS: the source's total at each K (the dock energy counts loves, so it is 3 units at
// every K by construction: a source built this way cannot carry a gamma), the level's energy E(K) / E(0) against
// gamma = 1 / sqrt(1 - v^2) with c = 1, the co-moving width against the rest packet's (a Lorentz contraction would be
// 1 / gamma), and the lab-frame average at pi/2 (no shift), which smears the source by v WINDOW.
// PREDICTED: V1 holds at both K (the source is the same three loves, moved); gamma - 1 is below 5e-4 at the fastest
// speed, far under every resolution here, while E(K) / E(0) rises by several percent, the band's m* v^2 / 2, not a
// relativistic gamma; the co-moving width differs from the rest packet's by the band's dispersion (E''(K) is largest
// at K = 0), not by 1 / gamma.
//
// FIRST RUN (71 s, tmp/mb-grv-run1.log, the record): pass, no gate moved. Co-moving k 0.030580, 0.030516, 0.029915 at
// K = 0, pi/4, pi/2: ratio to rest 0.998 and 0.978. The rest packet reads 0.95 to 1.00 of the point lump at r = 2 .. 6
// (k 0.030580 against 0.032409), E-GRV-0119's held source reproduces k 0.03072353960423452 exactly, and E-GRV-0110's
// spreading source is refused again (k 0.01514). THE SPEED FACTORS: the source is 3.000000 units at every K, so no
// gamma can reach the depth; gamma - 1 is 2.8e-4 and 4.4e-4, while E(K) / E(0) is 1.032 and 1.100, the band's rise, 115
// and 230 times gamma - 1. NOT AS PREDICTED: the co-moving width GROWS with K (1.712, 1.733, 1.870, ratio 1.012 and
// 1.092) where the prediction put the most spread at rest; the five-anchor envelope holds momenta about K +- pi/3, and
// about pi/2 their speeds differ more (the band is not a cosine, E'' there is not 0), so the moving packet spreads more.
// That spread, not a contraction by 1 / gamma, is the 2 percent in k at pi/2. The lab-frame average smears it further
// (k 0.02837 at pi/2). Title written after the run.
//
// Depth L2. DETERMINISM: no random numbers. The ring form, the shift, the averages, the Poisson solve and the fits are
// floats (measurement). NOTHING MOVES. HUSK FIRST: source and depth are husk columns.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { shellMeans, staticDepth } from '@/code/measure/energy-lines'
import {
  lineBasis,
  lineLightest,
  wholeBasis,
  type LineSector,
} from '@/code/measure/coined-line-bloch'
import {
  blochPacket,
  fitRing,
  levelPlacement,
  placePoints,
  pointBeat,
  pointDensity,
  ringCenter,
  ringColumns,
  type PointState,
} from '@/code/measure/held-cluster'
import {
  cutDensity,
  pointBeatWith,
  type CutState,
  type PieceOptions,
} from '@/code/measure/bound-line'
import {
  placeCutFramed,
  windowContext,
} from '@/code/measure/permutation-meeting'
import {
  bandSlope,
  blochEntries,
  circularAngle,
  cutStart,
  followLevel,
  inverseFit,
  ringWidth,
  shiftRing,
  weightOf,
  type BandPoint,
} from '@/code/measure/moving-level'

const BOX = 12
const P = 40
const SIDE = 16
const WINDOW = 64
const REF = 8
const PROFILE_R: readonly number[] = [2, 3, 4, 5, 6]
const TOLERANCE = 0.1
const RATIO = { low: 0.95, high: 1.05 }
const NS: readonly number[] = [0, 4, 8]
const OFFSETS: readonly number[] = [-2, -1, 0, 1, 2]
// E-GRV-0119's WabP_k (tmp/split-grv-run1.log)
const RECORDED_K = 0.03072353960423452
const RULE: PieceOptions = {
  cost: true,
  sign: true,
  unit: 0,
  flat: false,
}

export default experiment({
  id: 'gravity/moving-level-depth',
  code: 'E-GRV-0121',
  title:
    "E-SPN-0105's moving level sources the rest level's 1/r in its own frame, pass: a five-anchor packet of the held level at K = pi/4 and pi/2 (v 0.0238, 0.0297), run 64 beats by the working rule with both pieces and read co-moving at the stand-in's dE/dK, gives k 0.03052 and 0.02992 against the rest packet's 0.03058 (ratio 0.998, 0.978), the rest packet 0.95 to 1.00 of the point lump, E-GRV-0119's source reproduced exactly and E-GRV-0110's spreading source refused; no gamma: the source counts loves (3 units at every K) and gamma - 1 is 4e-4, while E(K)/E(0) rises 1.100, the band's rise; the 2 percent at pi/2 is the packet spreading faster there (width 1.87 against 1.71), not a contraction",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const sector: LineSector = {
      flavors: [0, 0, 0],
      statistics: 'fermion',
      D: 3,
      box: BOX,
      unit: 0,
    }
    const basis = lineBasis(sector)
    const sub = wholeBasis(basis)
    const level = lineLightest(basis, sub).lightest
    const band = followLevel(
      basis,
      sub,
      level,
      NS.map(n => (2 * Math.PI * n) / 32),
      Math.PI / 64,
    )
    const slopes = band.map(b => bandSlope(basis, sub, b, 1e-3))

    log('band')

    const ctx = windowContext(SIDE)
    const { f, ring, gauge, husk, L } = ctx
    const cover = 32
    const anchors = OFFSETS.map(d => (d + cover) % cover)
    const envelope = OFFSETS.map(d => Math.cos((Math.PI * d) / 6) ** 2)

    // ---- the packets, read co-moving and in the lab ----
    const sources = band.map((b, i) => {
      const placed = blochEntries(
        gauge,
        basis,
        b.vector,
        b.K,
        P,
        anchors,
        envelope,
      )

      let s: CutState = cutStart(placed.entries, P)

      const w0 = weightOf(s)
      const v = slopes[i]!
      const start = Float64Array.from(cutDensity(L, s), x => x / w0)
      const moving = new Float64Array(L)
      const lab = new Float64Array(L)

      for (let t = 1; t <= WINDOW; t++) {
        s = pointBeatWith(RULE, f.tables, ring, s)

        const d = Float64Array.from(cutDensity(L, s), x => x / w0)
        const co = shiftRing(d, v * t)

        for (let x = 0; x < L; x++) {
          moving[x]! += co[x]! / WINDOW
          lab[x]! += d[x]! / WINDOW
        }
      }

      log(`K ${b.K.toFixed(4)}`)

      return {
        K: b.K,
        v,
        energy: b.energy,
        start,
        moving,
        lab,
        total: moving.reduce((q, x) => q + x, 0),
        dropped: placed.dropped,
      }
    })

    // the column of the packets' start center (the same envelope and anchor at every K)
    const rest = sources[0]!
    const c0 =
      Math.round(
        ((circularAngle(rest.start) * L) / (2 * Math.PI) + L) % L,
      ) % L
    const col = husk.column[ring.docks[c0]!]!

    const profile = (rho: Float64Array): number[] => {
      const m = shellMeans(SIDE, col, staticDepth(SIDE, rho).depth)

      return m.map(x => x - m[REF]!)
    }

    const pointAt = (c: number, total: number): Float64Array => {
      const rho = new Float64Array(husk.columns)

      rho[c] = total

      return rho
    }

    const pp = profile(pointAt(col, rest.total))
    const pointK = inverseFit(
      PROFILE_R,
      PROFILE_R.map(r => pp[r]!),
    ).k

    const read = (rho: Float64Array) => {
      const pr = profile(ringColumns(husk, ring, rho))
      const ratio = [1, 2, 3, 4, 5, 6, 7].map(r => pr[r]! / pp[r]!)
      const k = inverseFit(
        PROFILE_R,
        PROFILE_R.map(r => pr[r]!),
      ).k
      const d1 =
        PROFILE_R.every(
          r => Math.abs(ratio[r - 1]! - 1) <= TOLERANCE,
        ) && Math.abs(k / pointK - 1) <= TOLERANCE

      return { pr, ratio, k, d1 }
    }

    const readings = sources.map(s => ({
      moving: read(s.moving),
      lab: read(s.lab),
      width: ringWidth(s.moving),
      labWidth: ringWidth(s.lab),
    }))
    const kRest = readings[0]!.moving.k
    const ratios = readings.map(r => r.moving.k / kRest)
    const v1 = ratios
      .slice(1)
      .every(x => x >= RATIO.low && x <= RATIO.high)

    log('readings')

    // ---- control+: E-GRV-0119's held source, reproduced ----
    const placedLevel = levelPlacement(basis, level.cre, level.cim)
    const kept = fitRing(placedLevel, L).kept
    const a = blochPacket(basis, L, level.cre, level.cim, true)
    const c119 = Math.round(ringCenter(a.density())) % L

    let held: CutState = placeCutFramed(gauge, kept, P, 'parallel')
    let spread: PointState = placePoints(L, kept, 0, P)

    const sumHeld = new Float64Array(L)
    const sumSpread = new Float64Array(L)

    for (let t = 1; t <= WINDOW; t++) {
      held = pointBeatWith(RULE, f.tables, ring, held)
      spread = pointBeat(f.tables, ring, spread)

      const dh = cutDensity(L, held)
      const ds = pointDensity(L, spread)

      for (let x = 0; x < L; x++) {
        sumHeld[x]! += dh[x]! / WINDOW
        sumSpread[x]! += ds[x]! / WINDOW
      }
    }

    // E-GRV-0119's reading, about its own center column
    const col119 = husk.column[ring.docks[c119]!]!

    const profile119 = (rho: Float64Array): number[] => {
      const m = shellMeans(SIDE, col119, staticDepth(SIDE, rho).depth)

      return m.map(x => x - m[REF]!)
    }

    const heldTotal = sumHeld.reduce((q, x) => q + x, 0)
    const pp119 = profile119(pointAt(col119, heldTotal))
    const pointK119 = inverseFit(
      PROFILE_R,
      PROFILE_R.map(r => pp119[r]!),
    ).k
    const k119 = inverseFit(
      PROFILE_R,
      PROFILE_R.map(
        r => profile119(ringColumns(husk, ring, sumHeld))[r]!,
      ),
    ).k
    const spreadProfile = profile119(ringColumns(husk, ring, sumSpread))
    const spreadRatio = [1, 2, 3, 4, 5, 6, 7].map(
      r => spreadProfile[r]! / pp119[r]!,
    )
    const spreadK = inverseFit(
      PROFILE_R,
      PROFILE_R.map(r => spreadProfile[r]!),
    ).k
    const spreadD1 =
      PROFILE_R.every(
        r => Math.abs(spreadRatio[r - 1]! - 1) <= TOLERANCE,
      ) && Math.abs(spreadK / pointK119 - 1) <= TOLERANCE
    const restD1 = readings[0]!.moving.d1
    const controlPlus = restD1 && Math.abs(k119 - RECORDED_K) <= 1e-12
    const controlMinus = !spreadD1
    const status = !(controlPlus && controlMinus)
      ? 'partial'
      : v1
        ? 'pass'
        : 'fail'

    log('controls')

    const gamma = sources.map(s => 1 / Math.sqrt(1 - s.v ** 2))
    const f3 = (x: number): string => x.toFixed(3)
    const f4 = (x: number): string => x.toFixed(4)
    const metrics: Record<string, number> = {
      gate_V1: v1 ? 1 : 0,
      controlPlus: controlPlus ? 1 : 0,
      controlMinus: controlMinus ? 1 : 0,
      pointK,
      restK: kRest,
      k119,
      spreadK,
      restCenter: c0,
      seconds: (Date.now() - started) / 1000,
    }

    sources.forEach((s, i) => {
      const r = readings[i]!
      const n = NS[i]!

      metrics[`n${n}_K`] = s.K
      metrics[`n${n}_v`] = s.v
      metrics[`n${n}_k`] = r.moving.k
      metrics[`n${n}_kRatio`] = ratios[i]!
      metrics[`n${n}_labK`] = r.lab.k
      metrics[`n${n}_total`] = s.total
      metrics[`n${n}_energyRatio`] = s.energy / rest.energy
      metrics[`n${n}_gamma`] = gamma[i]!
      metrics[`n${n}_width`] = r.width
      metrics[`n${n}_widthRatio`] = r.width / readings[0]!.width
      metrics[`n${n}_labWidth`] = r.labWidth
    })

    const row = (i: number): string => {
      const s = sources[i]!
      const r = readings[i]!

      return `K ${f4(s.K)} (v ${s.v.toExponential(3)}): co-moving k ${r.moving.k.toExponential(4)} (ratio to rest ${f4(ratios[i]!)}), ratio to the point lump ${r.moving.ratio.map(f3).join(', ')} at r = 1 .. 7; lab-frame k ${r.lab.k.toExponential(4)}; total ${s.total.toFixed(6)}; E(K)/E(0) ${f4(s.energy / rest.energy)} against gamma ${gamma[i]!.toFixed(6)}; co-moving width ${f4(r.width)} (lab ${f4(r.labWidth)})`
    }

    return verdict({
      status,
      claim: `the level under a five-anchor envelope, ${WINDOW} beats of the working rule with both pieces, read co-moving at the stand-in's dE/dK: ${NS.map((_, i) => row(i)).join(' | ')}; the point lump k ${pointK.toExponential(4)}; V1 ${v1}; control+: the rest packet D1 ${restD1}, E-GRV-0119's held source k ${k119.toExponential(5)}; control-: E-GRV-0110's spreading source k ${spreadK.toExponential(4)}, D1 ${spreadD1}`,
      metrics,
      control: {
        plus: controlPlus ? 1 : 0,
        minus: controlMinus ? 1 : 0,
      },
      notes: `L2. V1 ${v1}; control+ ${controlPlus} (rest D1 ${restD1}, E-GRV-0119 k ${k119} against ${RECORDED_K}), control- ${controlMinus}. Co-moving sources along the line: ${sources.map(s => `K ${f4(s.K)} ${[...s.moving].map(x => x.toFixed(3)).join(' ')}`).join('; ')}. Lab sources: ${sources.map(s => `K ${f4(s.K)} ${[...s.lab].map(x => x.toFixed(3)).join(' ')}`).join('; ')}. Profiles x(r) - x(8): ${sources.map((s, i) => `K ${f4(s.K)} ${readings[i]!.moving.pr.slice(0, REF).map(f4).join(', ')}`).join('; ')}; point ${pp.slice(0, REF).map(f4).join(', ')}. Placement dropped ${sources.map(s => s.dropped.toExponential(1)).join(', ')}. E-GRV-0110's spreading source ratio ${spreadRatio.map(f3).join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
