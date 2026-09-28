// SHAKING OR STRING BREAKING: WHY THE SLAB COMPOSITE UNBINDS UNDER THE MIXER (E-SPN-0140). note/research/vibe/roadmap/
// remaining-pieces.md, "Three holes on a 2d slab (E-SPN-0135)". E-SPN-0139 (test/experiment/spin/slab-hold-map) found
// that three holes bound by the Steiner string on the slab hold only with the frame mixer off, and that the Klein-gap
// criterion is wrong: at rate 1/64 the tail is 0.29, 0.077, 3.3e-3, 0.060 at D 1, 2, 3, 6. Two readings remain.
//   (A) SHAKING. The mixer perturbs the composite by about theta/4 a beat; it holds only while theta is small against
//       its binding. A threshold rate exists below 1/64, and theta_c(D) tracks the rate-0 binding gap of level D.
//   (B) STRING BREAKING. The leaked weight is the composite plus hole-fear pairs made from the sea, so fidelity to the
//       three-hole level is the wrong witness, and a sea-aware witness (E-GRV-0144's conserved charge register, summed
//       over a window around the composite) stays localized.
//
// DERIVED BEFORE THE RUN.
// 1. (B) HAS NO SECTOR IN THE STAND-IN, AND IN THE RULE IT NEEDS A FEAR. The slab beat (code/measure/slab-holes) is
//    first quantized in exactly three holes: the mixer, the coin, the cost, the contact and the stream each take a
//    three-hole configuration to three-hole configurations, so whatever leaks out of the level is three holes. There is
//    no sector with a fear or a pair in which a broken string could sit. In the rule (E-SPN-0134's candidate beat,
//    code/measure/candidate-audit candidateRun), a pair from the sea is the pair move: forward it needs a love and a
//    fear on one line, backward a store, and the sea holds neither (E-SPN-0134: its stores never change). The coin, the
//    mixer and the meeting permute values inside a dock, the stream moves them, and K reads charges only through
//    love-fear pairs (E-SPN-0134 derivation 6). So a start of holes alone stays holes alone: 3 holes, 0 fears, 0 stores,
//    E-GRV-0144's charge register 3, at every beat. E-GRV-0144 N1 read this for one and two holes; here for three.
//    PREDICTED T2r: exact. (B), read as the lattice's string breaking, is then excluded in both the stand-in and the rule.
// 2. (A) AS A RATE LAW. Each beat the mixer adds z (sum of the dock's slots) / 4 to each hole's slots, |z| = 2 sin
//    theta/2, a one-body perturbation of order theta. If the level's quasi-energy lies in a continuum it couples to at
//    that order (turned-hole states, and the string's excited states, which a Floquet beat folds into every window),
//    Fermi's rule gives a decay rate c theta^2, so over the 128-beat hold 1 - F ~ c theta^2 T, linear in the rate
//    (rate = 2 - 2 cos theta ~ theta^2): SLOPE 1 of ln(1 - least fidelity) on ln rate. A gapped level instead dresses
//    (the Ritz level at that rate is the dressed eigenvector) and its loss falls faster than the rate. With the coupling
//    one-body and the level's shape self-similar in D (the linear potential's Airy scaling), the angle at which the loss
//    reaches the reading's 0.01 is set by the binding gap: theta_c(D) / Delta(D) the same at D 3 and D 6.
//    Delta(D), read before the run at rate 0 only (tmp/string-probe1.log; code/measure/coined-line-bloch lineLightest,
//    one line, box 12, the loves' level whose image the holes are): the gap from the lightest level to the next,
//    0.35043 rad at D 3 and DELTA6 at D 6, so predicted theta_c(6) / theta_c(3) = RATIO_PRED.
//    Extrapolating E-SPN-0139's one point at 1/64 with slope 1 (disclosed: one point, which T1c tests): at D 3 the loss
//    is 4.54 rate and the tail 0.21 rate + 4.5e-5, so the fidelity sets the threshold near rate 1/454 (theta_c about
//    0.047 rad) and 1/512 is the largest scanned rate that holds; at D 6 the loss is 6.61 rate but the tail 3.85 rate,
//    which reaches 1e-3 only below rate 1/3850, under the scan: NO scanned rate holds at D 6 if the tail is linear. If
//    the far leak is second order (tail ~ rate^2) D 6 holds at 1/256 and below. So T1a at D 6 is the sharp question.
// 3. WHERE THE LEAK GOES (the stand-in's only sectors: escaped, far, compact on one line, compact off it). From
//    E-SPN-0139's record at 1/64 (disclosed, not blind): at D 3 the largest tail 3.3e-3 against a loss of 0.071, so the
//    leak is compact; at D 6 0.060 against 0.103, not decided. Shaking predicts compact first (a turned hole, one step off
//    the line, is first order; a long string is not).
// 4. THE SEA-AWARE WITNESS. Every hole carries register 1 (E-GRV-0144's charge register: a hole 1, a fear 4, a store 2),
//    so in the stand-in the register a window misses is the expected number of holes outside it, plus three for every
//    unit of escaped weight (code/measure/slab-string-break holesOutside, registerMissed). The window: Chebyshev radius R
//    around the three holes' centroid, R the smallest integer at which BOTH rate-0 levels keep the missed register per
//    hole at most 1e-3 over the hold (a procedure fixed now; its value is read, not chosen). Predicted: fails at D 6,
//    1/64, for the tail's reason.
//
// THE READING. E-SPN-0139's procedure unchanged (code/measure/slab-holes holdLevel on the w 12 absorbing window, the
// dominant Ritz level over 120 beats, held iff fidelity >= 0.99 AND tail (escaped + weight at V >= 10) <= 1e-3 at every
// one of 128 beats). The level is FOLLOWED in the rate: the placed E-SPN-0104 level at rate 0, then 1/1024, 1/512,
// 1/256, 1/128, 1/64, each start the level read at the rate before. The hold is rerun from each level vector by
// code/measure/slab-string-break watchHold, which reads the witness and keeps the last state.
//
// GATES, fixed before the run.
//  T1 (A) at D 3 and D 6: (a) some scanned rate > 0 holds; (b) theta_c(D), the crossing of the hold margin max((1 - least
//     fidelity) / 0.01, largest tail / 1e-3) through 1 between the largest held rate and the next scanned one (log-log,
//     code/measure/slab-string-break crossingTheta), gives (theta_c(6) / Delta(6)) / (theta_c(3) / Delta(3)) within a
//     factor 1.5 of 1; (c) the slope of ln(1 - least fidelity) on ln rate over 1/1024, 1/512, 1/256 is within 0.25 of 1
//     at each D.
//  T2 (B, the sectors): (r) in the rule, three holes in the flat side-8 love sea under the candidate beat, 4 full-key
//     paths, 128 beats: holes 3, fears 0, stores 0, charge register 3 after every beat on every path; (s) in the stand-in
//     at (D 3, 1/64) and (D 6, 1/64) the compact sectors (Steiner length under 10, on or off one line) carry more than
//     half of the weight that left the level by the last beat.
//  T3 (B, the witness): the missed register per hole stays at most 1e-3 over the hold at (D 3, 1/64) and (D 6, 1/64).
//  READOUT: (A) supported iff T1; (B) supported iff the rule makes a pair from the sea (T2r fails on a fear or a store)
//  AND T3.
// CONTROLS (a failed control makes the verdict partial).
//  CR rate 0 reproduces E-SPN-0139: the D 3 and D 6 levels hold with energies 0.330017263726011 and
//     -0.12246960716426848 to 1e-9.
//  CF the (D, 1/64) level read from the rate-0 vector, as E-SPN-0139 read it, reproduces its least fidelity and largest
//     tail (D 3 0.9290323687319242, 0.0033217368741665556; D 6 0.8967043880394913, 0.060211346429437915) to 1e-9 relative.
//  CP the rule counter sees a pair: E-GRV-0144's hole-and-fear start makes a store on 4 of 4 paths.
// CHECKS: watchHold's fidelity and tail equal holdLevel's bit for bit; the leaked weight equals 1 - the last fidelity to
//  1e-10; held + escaped = 1 to 1e-10 and antisymmetry to 1e-12 at the end of every hold.
// Verdict: partial if a control or check fails; pass if T1 and T2 hold (shaking, not breaking); fail otherwise.
// PREDICTED: fail, on T1a at D 6 (the tail) and possibly T2s at D 6; T2r exact; T3 fails at D 6.
//
// Depth L2: a stand-in (floats, the holes' beat derived from the rule's pieces, the register replaced by the Steiner
// length, the geometry cut to a slab), with the rule itself read for the sectors (T2r, exact integers).
// DETERMINISM: no random numbers; every start is placed or followed, every rule choice the key's integer. NOTHING MOVES:
// the cost is a phase, the coin, the contact and the mixer hand values between slots of one dock, the stream takes each
// value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lineBasis, lineLightest, wholeBasis, type LineSector } from '@/code/measure/coined-line-bloch'
import { ritzLevels, type Ritz } from '@/code/measure/frame-meson'
import { addSlab, holdLevel, normalizedSlab, placeLine, slabSpace, thetaOfRate, type SlabHold, type SlabSpace, type SlabSpec } from '@/code/measure/slab-holes'
import { crossingTheta, holdMargin, holesOutside, leakSectors, seaCount, watchHold, type LeakSectors } from '@/code/measure/slab-string-break'
import { lineFit } from '@/code/measure/moving-level'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { fullPathKey, pathOffset, type PathKey } from '@/code/measure/full-key-paths'
import { rootIndex } from '@/code/measure/crossing-lines'
import { placeInSea, seaConfiguration } from '@/code/measure/pauli-mixer'
import { flatLinks, tablesOn } from '@/code/measure/link-holonomy'
import { candidateRun } from '@/code/measure/candidate-audit'
import type { Configuration } from '@/code/rule/doublet-locked-knit'

const CUT = 12
const DS = [3, 6]
const RATES = [1 / 1024, 1 / 512, 1 / 256, 1 / 128, 1 / 64]
const SLOPE_RATES = 3
const RITZ_T = 120
const HOLD_BEATS = 128
const FIDELITY = 0.99
const TAIL = 1e-3
const TAIL_FROM = 10
const RATIO_FACTOR = 1.5
const SLOPE_PREDICTED = 1
const SLOPE_TOL = 0.25
const LAST = 1 / 64
const SIDE = 8
const RULE_BEATS = 128
const PATHS = 4
const PAIR_STEPS = 2
const HOLES = 3
// the records compared against (E-SPN-0139's registered numbers)
const R0_ENERGY: Record<number, number> = { 3: 0.330017263726011, 6: -0.12246960716426848 }
const F64_FIDELITY: Record<number, number> = { 3: 0.9290323687319242, 6: 0.8967043880394913 }
const F64_TAIL: Record<number, number> = { 3: 0.0033217368741665556, 6: 0.060211346429437915 }
const ENERGY_SAME = 1e-9
const RECORD_SAME = 1e-9
const LEAK_SAME = 1e-10
const NORM_SAME = 1e-10
const ANTI_SAME = 1e-12

type C = [number, number]
type Point = { D: number; rate: number; hold: SlabHold; margin: number; sectors: LeakSectors; missed: number[]; watchSame: boolean; leakGap: number }

const ritz = (c: readonly C[]): Ritz[] => ritzLevels(c)

export default experiment({
  id: 'spin/slab-string-break',
  code: 'E-SPN-0140',
  title: 'shaking or string breaking: why three holes on the slab unbind under the frame mixer (title written after the run)',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const holdInput = { ritzBeats: RITZ_T, holdBeats: HOLD_BEATS, fidelity: FIDELITY, tail: TAIL, tailFrom: TAIL_FROM, ritz }
    const base: SlabSpec = { holes: HOLES, axes: 2, cut: CUT, rate: 0, D: 3, cost: 'steiner', boundary: 'absorb' }
    const slab = slabSpace(base)
    const at = (space: SlabSpace, over: Partial<SlabSpec>): SlabSpace => ({ ...space, spec: { ...space.spec, ...over } })
    const radii = Array.from({ length: CUT + 1 }, (_, R) => R)
    const outsides = radii.map(R => holesOutside(slab, R))
    const holds: SlabHold[] = []
    const keep = (h: SlabHold): SlabHold => (holds.push(h), h)

    // ---- the grid: rate 0, the record's 1/64, then followed ----
    const gap: Record<number, number> = {}
    const rest: Record<number, { hold: SlabHold; missed: number[] }> = {}
    const record: Record<number, SlabHold> = {}
    const points: Point[] = []

    const watched = (D: number, rate: number, h: SlabHold): Point => {
      const space = at(slab, { D, rate })
      const w = watchHold(space, h.vector, HOLD_BEATS, TAIL_FROM, outsides)
      const sectors = leakSectors(space, h.vector, w.last, w.escaped, TAIL_FROM)
      const watchSame = w.fidelity.every((f, t) => f === h.fidelity[t]) && w.tail.every((x, t) => x === h.tail[t])
      const leakGap = Math.abs(sectors.leaked - (1 - (w.fidelity[HOLD_BEATS - 1] as number)))

      return { D, rate, hold: h, margin: holdMargin(h.minFidelity, h.maxTail, FIDELITY, TAIL), sectors, missed: w.missed.map(m => Math.max(...m) / HOLES), watchSame, leakGap }
    }

    for (const D of DS) {
      const sector: LineSector = { flavors: [0, 0, 0], statistics: 'fermion', D, box: CUT, unit: 0 }
      const basis = lineBasis(sector)
      const line = lineLightest(basis, wholeBasis(basis))
      const level = line.lightest
      const entries = basis.configs.map((ts, i) => ({ ts, amp: [level.cre[i] as number, level.cim[i] as number] as C }))
      const placed = normalizedSlab(addSlab(placeLine(slab, 0, entries), placeLine(slab, 1, entries)))

      gap[D] = line.next - level.unwrapped

      const h0 = keep(holdLevel(at(slab, { D, rate: 0 }), placed, holdInput))
      const p0 = watched(D, 0, h0)

      rest[D] = { hold: h0, missed: p0.missed }
      points.push(p0)
      log(`D ${D} rate 0: held ${h0.held} E ${h0.level.energy} gap ${gap[D]}`)

      record[D] = keep(holdLevel(at(slab, { D, rate: LAST }), h0.vector, holdInput))
      log(`D ${D} record 1/64: ${record[D]!.minFidelity} ${record[D]!.maxTail}`)

      let start = h0.vector

      for (const rate of RATES) {
        const h = keep(holdLevel(at(slab, { D, rate }), start, holdInput))
        const p = watched(D, rate, h)

        points.push(p)
        start = h.vector
        log(`D ${D} rate ${rate}: held ${h.held} min fidelity ${h.minFidelity} max tail ${h.maxTail} E ${h.level.energy} leak ${JSON.stringify(p.sectors)}`)
      }

      // free the vectors: nothing later reads them
      for (const h of holds) h.vector = { re: new Float64Array(0), im: new Float64Array(0) }
    }

    // ---- T1 ----
    const scan = (D: number): Point[] => points.filter(p => p.D === D && p.rate > 0)
    const threshold = (D: number): { heldRate: number; theta: number } => {
      const ps = scan(D)
      const held = ps.filter(p => p.hold.held)

      if (held.length === 0) return { heldRate: Number.NaN, theta: Number.NaN }

      const top = held.reduce((a, b) => (b.rate > a.rate ? b : a))
      const next = ps.filter(p => p.rate > top.rate).sort((a, b) => a.rate - b.rate)[0]

      return { heldRate: top.rate, theta: next ? crossingTheta(top, next) : Number.NaN }
    }
    const th: Record<number, { heldRate: number; theta: number }> = {}

    for (const D of DS) th[D] = threshold(D)

    const T1a = DS.every(D => !Number.isNaN(th[D]!.heldRate))
    const ratioPredicted = (gap[6] as number) / (gap[3] as number)
    const ratioMeasured = th[6]!.theta / th[3]!.theta
    const agreement = ratioMeasured / ratioPredicted
    const T1b = Number.isFinite(agreement) && agreement <= RATIO_FACTOR && agreement >= 1 / RATIO_FACTOR
    const slope: Record<number, number> = {}

    for (const D of DS) {
      const ps = scan(D).slice(0, SLOPE_RATES)

      slope[D] = lineFit(
        ps.map(p => Math.log(p.rate)),
        ps.map(p => Math.log(1 - p.hold.minFidelity)),
      ).b
    }

    const T1c = DS.every(D => Math.abs((slope[D] as number) - SLOPE_PREDICTED) <= SLOPE_TOL)
    const T1 = T1a && T1b && T1c

    log('T1')

    // ---- T2s, T3 ----
    const lastAt = (D: number): Point => points.find(p => p.D === D && p.rate === LAST) as Point
    const compactShare = (s: LeakSectors): number => (s.compactOnLine + s.compactOffLine) / s.leaked
    const T2s = DS.every(D => compactShare(lastAt(D).sectors) > 0.5)
    const R = radii.find(r => r > 0 && DS.every(D => (rest[D]!.missed[r] as number) <= TAIL))
    const T3 = R !== undefined && DS.every(D => (lastAt(D).missed[R] as number) <= TAIL)

    // ---- T2r and CP: the rule ----
    const X = centerOf(SIDE)
    const fr = contactFresh(SIDE, 'pass', X)
    const flat = tablesOn(fr.weave, 'pass', flatLinks(fr.weave))
    const cells = fr.cells
    const B = rootIndex([1, 1, 0, 0])
    const Y = Math.floor((flat.target[X * 24 + B] as number) / 24)
    const a1 = rootIndex([1, 0, 0, 1])
    const a2 = rootIndex([1, 0, 0, -1])
    let Z = X

    for (let k = 0; k < PAIR_STEPS; k++) {
      Z = Math.floor((flat.target[Z * 24 + a1] as number) / 24)
      Z = Math.floor((flat.target[Z * 24 + a2] as number) / 24)
    }

    const sea = seaConfiguration(cells, 1)
    const three = placeInSea(sea, [
      { dock: X, slot: B, vibe: 0 },
      { dock: Y, slot: B, vibe: 0 },
      { dock: Z, slot: B, vibe: 0 },
    ])
    const holeFear = placeInSea(sea, [
      { dock: X, slot: B, vibe: 0 },
      { dock: Y, slot: B, vibe: -1 },
    ])
    const keyOf = (path: number): PathKey => fullPathKey(pathOffset(path))
    const buffer = new Int32Array(cells)
    const start3 = seaCount(three, buffer)
    const rule = { holesOff: 0, fears: 0, stores: 0, registerOff: 0, beats: 0 }
    let pairPaths = 0

    for (let path = 0; path < PATHS; path++) {
      candidateRun({
        tables: flat,
        start: three,
        key: keyOf(path),
        beats: RULE_BEATS,
        mix: true,
        each: (_t, c: Configuration) => {
          const s = seaCount(c, buffer)

          rule.beats++
          rule.holesOff = Math.max(rule.holesOff, Math.abs(s.holes - HOLES))
          rule.fears = Math.max(rule.fears, s.fears)
          rule.stores = Math.max(rule.stores, s.stores)
          rule.registerOff = Math.max(rule.registerOff, Math.abs(s.register - HOLES))
        },
      })

      let stored = 0

      candidateRun({ tables: flat, start: holeFear, key: keyOf(path), beats: RULE_BEATS, mix: true, each: (_t, c: Configuration) => (stored = Math.max(stored, seaCount(c, buffer).stores)) })
      if (stored > 0) pairPaths++
    }

    const T2r = start3.holes === HOLES && start3.register === HOLES && rule.holesOff === 0 && rule.fears === 0 && rule.stores === 0 && rule.registerOff === 0
    const T2 = T2r && T2s
    const CP = pairPaths === PATHS

    log('rule')

    const A = T1
    const Bsupported = !T2r && T3

    // ---- controls and checks ----
    const CR = DS.every(D => rest[D]!.hold.held && Math.abs(rest[D]!.hold.level.energy - (R0_ENERGY[D] as number)) <= ENERGY_SAME)
    const CF = DS.every(D => Math.abs(record[D]!.minFidelity - (F64_FIDELITY[D] as number)) <= RECORD_SAME * (F64_FIDELITY[D] as number) && Math.abs(record[D]!.maxTail - (F64_TAIL[D] as number)) <= RECORD_SAME * (F64_TAIL[D] as number))
    const normGap = Math.max(...holds.map(h => h.normGap))
    const antiGap = Math.max(...holds.map(h => h.antisymmetry))
    const leakGap = Math.max(...points.map(p => p.leakGap))
    const watchSame = points.every(p => p.watchSame)
    const checked = watchSame && leakGap <= LEAK_SAME && normGap <= NORM_SAME && antiGap <= ANTI_SAME
    const status = !CR || !CF || !CP || !checked ? 'partial' : T1 && T2 ? 'pass' : 'fail'

    // ---- report ----
    const rateName = (r: number): string => (r === 0 ? '0' : `1/${Math.round(1 / r)}`)
    const deg = (r: number): string => ((thetaOfRate(r) * 180) / Math.PI).toFixed(2)
    const pointText = (p: Point): string =>
      `D ${p.D} rate ${rateName(p.rate)} (${deg(p.rate)} deg): ${p.hold.held ? 'HELD' : 'not held'} least fidelity ${p.hold.minFidelity.toPrecision(6)} largest tail ${p.hold.maxTail.toExponential(3)} margin ${p.margin.toPrecision(4)} E ${p.hold.level.energy.toFixed(6)} start weight ${p.hold.level.weight.toFixed(4)}; leak ${p.sectors.leaked.toExponential(3)} = escaped ${p.sectors.escaped.toExponential(2)} + far ${p.sectors.far.toExponential(2)} + compact on line ${p.sectors.compactOnLine.toExponential(2)} + off line ${p.sectors.compactOffLine.toExponential(2)}; missed register per hole at R ${R ?? '-'} ${R === undefined ? '-' : (p.missed[R] as number).toExponential(2)}`

    const metrics: Record<string, number> = {
      T1: T1 ? 1 : 0,
      T1a: T1a ? 1 : 0,
      T1b: T1b ? 1 : 0,
      T1c: T1c ? 1 : 0,
      T2: T2 ? 1 : 0,
      T2r: T2r ? 1 : 0,
      T2s: T2s ? 1 : 0,
      T3: T3 ? 1 : 0,
      A_supported: A ? 1 : 0,
      B_supported: Bsupported ? 1 : 0,
      control_CR: CR ? 1 : 0,
      control_CF: CF ? 1 : 0,
      control_CP: CP ? 1 : 0,
      checked: checked ? 1 : 0,
      gapD3: gap[3] as number,
      gapD6: gap[6] as number,
      heldRateD3: th[3]!.heldRate,
      heldRateD6: th[6]!.heldRate,
      thetaCD3: th[3]!.theta,
      thetaCD6: th[6]!.theta,
      ratioPredicted,
      ratioMeasured,
      agreement,
      slopeD3: slope[3] as number,
      slopeD6: slope[6] as number,
      windowRadius: R ?? Number.NaN,
      ruleBeats: rule.beats,
      ruleHolesOff: rule.holesOff,
      ruleFears: rule.fears,
      ruleStores: rule.stores,
      ruleRegisterOff: rule.registerOff,
      pairPaths,
      normGap,
      antiGap,
      leakGap,
      seconds: (Date.now() - started) / 1000,
    }

    for (const p of points) {
      const key = `D${p.D}r${rateName(p.rate).replace('/', '_')}`

      metrics[`${key}Held`] = p.hold.held ? 1 : 0
      metrics[`${key}MinFidelity`] = p.hold.minFidelity
      metrics[`${key}MaxTail`] = p.hold.maxTail
      metrics[`${key}Leak`] = p.sectors.leaked
      metrics[`${key}Far`] = p.sectors.far + p.sectors.escaped
      metrics[`${key}CompactOff`] = p.sectors.compactOffLine
      metrics[`${key}CompactOn`] = p.sectors.compactOnLine
      if (R !== undefined) metrics[`${key}Missed`] = p.missed[R] as number
    }
    for (const D of DS) {
      metrics[`recordD${D}MinFidelity`] = record[D]!.minFidelity
      metrics[`recordD${D}MaxTail`] = record[D]!.maxTail
    }

    const heldMap = DS.map(D => `D ${D}: ${scan(D).map(p => (p.hold.held ? 'H' : '-')).join('')}`).join(', ')

    return verdict({
      status,
      claim: `three holes on the slab (w ${CUT}, D 3 and 6) under the mixer at rates ${RATES.map(rateName).join(', ')}: held ${heldMap}; theta_c ${DS.map(D => `D ${D} ${Number.isNaN(th[D]!.theta) ? 'none' : th[D]!.theta.toFixed(4)}`).join(', ')} against gaps ${DS.map(D => (gap[D] as number).toFixed(4)).join(', ')} (T1a ${T1a}, T1b ${T1b}: measured ratio ${ratioMeasured.toFixed(3)} against ${ratioPredicted.toFixed(3)}), slope of the loss on the rate ${DS.map(D => (slope[D] as number).toFixed(3)).join(', ')} (T1c ${T1c}); the rule keeps three holes three holes (${rule.beats} beats, holes off ${rule.holesOff}, fears ${rule.fears}, stores ${rule.stores}, register off ${rule.registerOff}; T2r ${T2r}), compact share of the leak at 1/64 ${DS.map(D => compactShare(lastAt(D).sectors).toFixed(3)).join(', ')} (T2s ${T2s}); register witness R ${R ?? 'none'} missed ${DS.map(D => (R === undefined ? '-' : (lastAt(D).missed[R] as number).toExponential(2))).join(', ')} (T3 ${T3}); A ${A}, B ${Bsupported}; CR ${CR}, CF ${CF}, CP ${CP}`,
      metrics,
      control: { recordD3: [record[3]!.minFidelity, record[3]!.maxTail], recordD6: [record[6]!.minFidelity, record[6]!.maxTail], rest: DS.map(D => rest[D]!.hold.level.energy), pairPaths },
      notes: `L2. Points: ${points.map(pointText).join('; ')}. Rest missed register per hole by R: ${DS.map(D => `D ${D} ${rest[D]!.missed.map(x => x.toExponential(1)).join(' ')}`).join('; ')}. Checks: watch equal ${watchSame}, leak identity ${leakGap.toExponential(2)}, norm ${normGap.toExponential(2)}, antisymmetry ${antiGap.toExponential(2)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
