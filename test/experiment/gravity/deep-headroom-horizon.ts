// Does the headroom horizon give two clean e-folds of exponential redshift once the horizon is deep enough for the dock
// not to cut it off (E-GRV-0123)? E-GRV-0122 found the room coupling (f = h = (CAP - e) / CAP, register C = 243) traps
// light at r_h = 2 G M with the weak field kept and the profile's kappa ~ 1 / M, but its exponential lasted 0 .. 1.24
// e-folds at r_h 6.5 .. 48.5, and it derived that two e-folds inside the band where the rate is within 10 percent of
// kappa need ln z ~ 3.5, r_h ~ 550 docks. This runs the same rule and reading at r_h 800.5 and 1600.5.
//
// DERIVED BEFORE ANY RUN (tmp/deep-horizon-stair, deep-horizon-scan: the eikonal staircase, no light run).
//  - THE REDUCTION. The light chain is a plane wave on an L x 2 x 2 line, so the radial profile enters only as the room
//    of each dock: the same 1d reduction as E-GRV-0122. At r >= 400 the box-free unit profile (E-GRV-0118, spliced past
//    r = 14 to the stack's Green's function) is its zero mode alone, 1 / r (local slope s = 1.0000): the massive modes
//    are e^(-r / l) gone. So f = 1 - r_h / r and kappa = c0 / (2 r_h), T M constant.
//  - THE BAND. The local e-folding rate c0 f'(r) / 2 over kappa is (r_h / r)^2, within 10 percent for r <= 1.054 r_h,
//    i.e. ln z >= 1.4849 (bandFloor). Two e-folds inside it need the innermost interval at ln z >= 3.485.
//  - THE DOCK. With r_h half a dock off the grid, the first live dock sits at f_1 = 0.5 / (r_h + 0.5), so the continuum
//    top is ln z_1 = ln(2 r_h + 1) / 2 and the band spans ln(0.0513 (2 r_h + 1)) / 2 e-folds: 1.86, 2.20, 2.55 at r_h
//    400.5, 800.5, 1600.5. The dock alone allows 2 e-folds from r_h ~ 532.
//  - THE REGISTER MUST GROW. The room is k = C - floor(C e / CAP) >= 1 at every live dock, so ln z <= ln(C) / 2 whatever
//    r_h is: 2.75 at C = 243, so E-GRV-0122's register holds at most 1.26 e-folds of band at ANY size. Two e-folds need
//    ln(C) / 2 >= 3.485, C >= 1064, and the first room must be 1 (k_1 = ceil(C f_1) = 1, C <= 2 r_h + 1), else the top
//    drops to ln(C / 2) / 2. The scan of odd C on the staircase gives the smallest C with span >= 2 and rate within 10
//    percent: 1073 at every r_h from 800.5 to 2000.5 (1085 at 600.5). To RESOLVE the first live room to 10 percent (C
//    f_1 >= 10) would need C >= 10 (2 r_h + 1) ~ 16,000 at r_h 800.5, far past what the rule holds in exact integers.
//  - WHAT THE RULE HOLDS. makeHeadroomSpanMedium keeps (q0 C)^2 x 4 under 2^31 and (q0 C)^2 C^2 x 64 under 2^53, so C
//    <= 599 at D0 = 16 (ln C / 2 = 3.20: two e-folds impossible there), 1539 at D0 = 2, 1987 at D0 = 1. D0 = 1 is refused:
//    its flat light wrapped 1.1e6 times in the probe (tmp/deep-light1.log). So D0 = 2 and C = 1539 = headroomLimit(2),
//    the largest register the rule holds, which puts the ceiling at ln z = 3.669 and the band's largest span at 2.18.
//    D0 is the gauge resolution (alpha = sqrt(3) / (48 D0)); the horizon's redshift reads only the rates, and K2 checks
//    that the change of D0, C and geometry leaves E-GRV-0122's short window as it was.
//  - THE PREDICTION (staircase at C = 1539, D0 = 2): r_h 800.5 span 2.178, rate over kappa 0.963; 1600.5 span 2.178,
//    rate 0.966. The span no longer grows with M there: k_1 = 1 at both, so the REGISTER sets the top, ln(C) / 2, and
//    the dock law ln(2 r_h + 1) / 2 (3.69, 4.04) is cut to 3.669. At r_h 400.5 (reported, not gated: the continuum band
//    is 1.86 there, so L1 would fail by construction) k_1 = 2 and the top is ln(C / 2) / 2 = 3.323, on the dock law
//    (3.344). The light is predicted to read up to about 0.2 past the staircase at the wall face (E-GRV-0122 0.1; the
//    D0 2 probe at r_h 200.5 0.2), where its first-passage arrival is held by the pile-up.
//  - THE WALL FACE (the D0 2 probe at r_h 400.5, tmp/deep-light6.log, width 128). The interval on the first live dock
//    reads ln z 3.651 against its room's 3.323: its inner detector sits on the frozen wall's face, where the packet piles
//    up and never passes, so its first-passage "arrival" is the pile-up's centroid, not a crossing. Every other interval
//    reads its room to about 0.05. Counted, that one interval lifts the r_h 400.5 band from the staircase's 1.8 to 2.16,
//    above the continuum's own 1.86. So L1 reads the band WITHOUT the wall-face interval (the crossing intervals), and
//    the E-GRV-0122 reading with it is reported beside. Without it the top is the SECOND dock's room: k_2 = ceil(1.5 C /
//    (r_h + 1.5)), ln z_2 = ln(C / k_2) / 2 = 3.323 at r_h 800.5 and 1600.5 (k_2 = 3, 2), so the crossing band spans about
//    1.6 and 1.8: L1 IS PREDICTED TO FAIL at both. It needs k_2 = 1, r_h >= 1.5 C ~ 2300 at C = 1539, which the load
//    budget does not reach (r_h 800.5 took 350 s; 2400.5 and 4800.5 would take about an hour).
//  - THE FLAT JITTER. At D0 2 a dock is 4.3 beats of flat light, so a single interval's first-passage timing jitters by
//    0.07 in ln z (probe), against E-GRV-0122's 0.017 at 29 beats a dock. K1 therefore reads the flat chain on 8-dock
//    intervals (to 0.05, E-GRV-0122's bound) and every single interval to a tenth of the band floor.
//  - THE PACKET. With C fixed and k_1 = 1 the innermost room is 1 / C at every deep r_h, and the geometry scales with
//    r_h, so one packet width serves: a wave whose blueshifted length reaches the dock turns back (E-GRV-0122 (c)).
//
// THE RUN. The box-free unit profile (side 64, E-GRV-0122's). Each r_h runs on a ONE-SIDED SLICE of the line
// (code/measure/headroom-horizon roomSliceMedium): radii from inner - 2 (two frozen docks, the seam's wall) out to the
// packet's end, the room roomOf(profile, M, CAP, C). Detectors on every dock from floor(r_h) to max(ceil(REACH r_h) + 1,
// floor(r_h) + 15), a smooth plane packet (amplitude AMP, extent WIDTH docks) centered GAP + WIDTH / 2 docks past the
// last detector, WIDTH docks of line past its center so the outward half's reflection off the seam trails the inward
// half. Window SLACK times the staircase's eikonal time. Readings exactly as E-GRV-0122: first-passage arrivals, an
// interval between resolved neighbors (weight >= SHARE of the outermost's), f = speed / c_flat placed at the inner dock,
// z = f^(-1/2), u from the outermost detector. c_flat from one flat slice (full room, the seam's wall WIDTH docks inside
// the first detector so its reflection never meets the inward packet on a detector).
//
// GATES, fixed before the first run of this file. The probes (tmp/deep-light*.log) sized D0, the packet and the run
// time; they compared nothing to a gate.
//  L1 at r_h 800.5 and 1600.5: the resolved CROSSING intervals (all but the wall face's) with ln z >= bandFloor(s, 0.9)
//     number at least 3, span >= 2 e-folds of z, and their least-squares slope of ln z against u is within 10 percent of
//     the profile's kappa.
//  L2 T_light M (T_light = that slope / 2 pi) is constant across r_h 800.5 and 1600.5 to 10 percent (max / min - 1).
//  L3 every run (every chain, the flat, the controls) reverses bit for bit with 0 wraps and 0 Gauss violations.
//  K1 flat space: the flat slice reads |ln z| <= 0.05 on every 8-dock interval and <= bandFloor / 10 on every single one.
//  K2 E-GRV-0122 reproduced by this machinery at its r_h 12.5 and 48.5: the near zone (ln z >= 1, E-GRV-0122's own
//     definition) spans within 0.2 e-fold of E-GRV-0122's 0.61 and 1.24, and the band spans under 2 (L1 refuses there).
// Verdict: pass if L1, L2, L3, K1 and K2 all hold; fail otherwise.
// REPORTED: per r_h the light's top ln z against the staircase's ln(C / k_1) / 2, the dock law ln(2 r_h + 1) / 2 and
// the register's ln(C) / 2; the band's span against ln M, and its slope in ln M against the 1/2 law; the frozen
// detectors' weight (trapping, E-GRV-0122's H1).
//
// FIRST RUN (tmp/deep-run1.log, the record, 886 s, 511 MB peak): FAIL on L1 (as predicted) and K2; no gate moved.
//  - L3 holds: every chain, the flat and the controls reverse bit for bit, 0 wraps, 0 Gauss violations. C + 2 = 1541 is
//    refused by the medium. No frozen detector ever reads weight at any r_h.
//  - L1 fails at both r_h, on the span only: the crossing band holds 41 and 85 intervals spanning 1.668 and 1.847
//    e-folds (gate 2) at rate over kappa 0.983 and 0.967 (gate 10 percent). The staircase predicted 1.629 and 1.832 at
//    0.972 and 0.963: the light reads its rooms to 0.04 e-fold and its rate to 1 percent.
//  - L2 holds: T_light M 2.604 and 2.561 (spread 0.017, gate 0.1), the profile's 2.649 at both (1.7 and 3.3 percent
//    under). E-GRV-0122's spread was 0.127, from 4-interval power fits on the staircase's first docks; the band's
//    rate over 41 .. 85 intervals is a far steadier reading.
//  - K1 holds: flat 8-dock blocks at most 0.0097, single intervals 0.072 (the D0 2 jitter of 4.3 beats a dock; the bound
//    was 0.148).
//  - K2 fails: this machinery at E-GRV-0122's r_h 12.5 and 48.5 reads near zones 0.771 and 1.759 against 0.61 and 1.24
//    (gate 0.2), with erratic intervals (at 48.5, ln z 2.97 on dock 54 beside 1.21 on 55). The control ran E-GRV-0122's
//    SIZES with THIS design's packet (128 docks, longer than both horizons) and its register (first rooms 59 and 16 of
//    1539, not 10 and 3 of 243), which was a design error in the control, not a reproduction. It says the deep
//    packet does not read short horizons. It does not bear on the deep runs, which track their own staircase to 0.04.
//  - THE WALL FACE, as the probe showed: the interval on the first live dock reads ln z 3.652, 3.933, 4.008 at r_h 400.5,
//    800.5, 1600.5, against its room's 3.323, 3.669, 3.669. The pile-up puts it 0.26 .. 0.34 past the room and close
//    to the dock law (3.34, 3.69, 4.04); counted, the band spans 2.159, 2.436, 2.521 and would clear 2. It is not a
//    crossing and it is not gated.
//  - THE WINDOW AGAINST ln M (all five r_h, ln M 7.50 .. 12.35): the band span rises 0.53 per unit ln M (1/2 law: 0.5),
//    the wall-face top 0.43 over the dock-limited sizes (k_1 >= 2). The crossing top rises only 0.20: past r_h ~ C / 2 the
//    top is set by ln(C / k_2) / 2, not by ln M, so at a fixed register the window stops growing. Under the register's
//    ceiling the dock's 1/2 ln M law holds; the register caps it at ln(C) / 2 - 1.485 = 2.18 e-folds of band.
//
// Depth L2: a known construction (a static metric's redshift and surface gravity) on the exact integer reversible light
// of E-GRV-0122, over a background placed from the rule's linear statics; the room coupling is E-GRV-0122's change made
// by hand. DETERMINISM: every start and source is placed; nothing is drawn.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lapseLinks, openMesh } from '@/code/rule/open-husk'
import { stackModes } from '@/code/measure/open-husk'
import { linearFit } from '@/code/measure/regression'
import { boxFreeExcess, unitProfile } from '@/code/measure/horizon-temperature'
import {
  bandFloor,
  chainSpeed,
  exponential,
  headroomLimit,
  profileKappa,
  roomChain,
  roomIntervals,
  roomOf,
  roomSliceMedium,
  roomSpeed,
  smoothPacket,
  stairIntervals,
  stairTime,
  type Chain,
  type Exponential,
  type RoomInterval,
} from '@/code/measure/headroom-horizon'

const D0 = 2
const CAP = 1.5
const LEVELS = 3
const SIDE = 64
const R_H: readonly number[] = [800.5, 1600.5]
const R_REPORTED: readonly number[] = [400.5]
const R_OLD: readonly number[] = [12.5, 48.5]
const OLD_SPAN: readonly number[] = [0.61, 1.24]
const AMP = 0.1
const WIDTH = 128
const GAP = 4
const REACH = 1.07
const NEAR_OUT = 14
const SLACK = 1.5
const SHARE = 0.25
const RATE_BAND = 0.9
const NEAR_ZONE = 1
const L1_SPAN = 2
const L1_COUNT = 3
const L1_TOLERANCE = 0.1
const L2_TOLERANCE = 0.1
const FLAT_LNZ = 0.05
const FLAT_BLOCK = 8
const FLAT_SINGLE = 0.1
const K2_TOLERANCE = 0.2

type Geometry = { inner: number; from: number; radii: number[]; start: number; length: number }

type Horizon = {
  rh: number
  m: number
  window: number
  chain: Chain
  ivs: RoomInterval[]
  firstRoom: number
  frozenWeight: number
  band: Exponential
  cross: Exponential
  crossStair: Exponential
  near: Exponential
  floor: number
  stair: Exponential
  kappa: number
  temperature: number
}

const exact = (c: Chain): boolean => c.run.reversed && c.run.gauss === 0 && c.run.wraps.angle + c.run.wraps.field + c.run.wraps.potential === 0
const spreadOf = (xs: readonly number[]): number => Math.max(...xs) / Math.min(...xs) - 1
const even = (n: number): number => 2 * Math.ceil(n / 2)

export default experiment({
  id: 'gravity/deep-headroom-horizon',
  code: 'E-GRV-0123',
  title:
    "the deep headroom horizon's redshift runs at kappa and its T M is flat, but the register, not the dock, now ends the exponential, fail on L1 and K2: at D0 2 and C 1539 (the largest register the rule holds exactly; D0 16 holds 599, whose ceiling ln(C) / 2 = 3.20 cannot reach 2 e-folds) on the 1 / r profile at r_h 800.5 and 1600.5 (M 115372, 230672), the crossing intervals of the band (rate within 10 percent of kappa) span 1.668 and 1.847 e-folds (gate 2) at slope 0.983 and 0.967 of kappa, on the staircase's 1.629 and 1.832; T_light M spreads 1.7 percent (gate 10) and sits 2 and 3 percent under the profile's; the second dock's room (3, 2 of 1539) caps the crossing top at 3.16, 3.33, and 2 e-folds would need r_h >= 1.5 C ~ 2300; flat reads 0.010 on 8-dock blocks; the control at E-GRV-0122's r_h 12.5 and 48.5 reads near zones 0.77 and 1.76 against 0.61 and 1.24 (gate 0.2), the 128-dock packet too long for those horizons; exact, 0 wraps, no light past a full register",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${(Date.now() - started) / 1000}s`)
    const metrics: Record<string, number> = {}
    const lines: string[] = []
    const base = headroomLimit(D0)

    // the limit is the rule's own: C builds, C + 2 is refused
    let refused = false

    try {
      roomSliceMedium({ from: 0, length: 4, resolution: D0, base: base + 2, room: r => (r < 2 ? 0 : base + 2) })
    } catch {
      refused = true
    }

    const mesh = lapseLinks(openMesh(SIDE, 1, 'shrink'))
    const modes = stackModes(mesh.sides, 'lapse_upper')
    const profile = unitProfile(boxFreeExcess(mesh, modes), modes)
    const c0 = roomSpeed(D0)

    log('profile')

    const geometry = (rh: number): Geometry => {
      const inner = Math.ceil(rh)
      const from = inner - 2
      const outer = Math.max(Math.ceil(REACH * rh) + 1, Math.floor(rh) + NEAR_OUT + 1)
      const start = outer + GAP + WIDTH / 2

      return { inner, from, radii: Array.from({ length: outer - Math.floor(rh) + 1 }, (_, i) => Math.floor(rh) + i), start, length: even(start + WIDTH - from) }
    }

    // the flat slice: full room, the seam's wall WIDTH docks inside the first detector
    const gf = geometry(R_H[0]!)
    const flatFrom = gf.inner - 2 - WIDTH
    const flatMedium = roomSliceMedium({ from: flatFrom, length: even(gf.start + WIDTH - flatFrom), resolution: D0, base, room: r => (r < flatFrom + 2 ? 0 : base) })
    const flatRadii = gf.radii.filter(r => r >= gf.inner)
    const flat = roomChain(flatMedium, -flatFrom, smoothPacket(flatMedium, LEVELS, gf.start - flatFrom, AMP, WIDTH), flatRadii, Math.ceil((SLACK * (gf.start + WIDTH / 2 - gf.inner)) / c0))
    const cFlat = chainSpeed(flat)
    const flatIvs = roomIntervals(flat, cFlat, SHARE)
    const flatWorst = Math.max(...flatIvs.map(iv => Math.abs(iv.lnz)))
    // the flat chain on FLAT_BLOCK-dock intervals: f = FLAT_BLOCK / (dt c_flat)
    const flatBlocks: number[] = []

    for (let i = 0; i + FLAT_BLOCK < flat.radii.length; i += FLAT_BLOCK) {
      const dt = flat.arrival[i]! - flat.arrival[i + FLAT_BLOCK]!

      flatBlocks.push(-0.5 * Math.log(FLAT_BLOCK / (dt * cFlat)))
    }

    const flatBlockWorst = Math.max(...flatBlocks.map(Math.abs))

    log(`flat c ${cFlat}`)

    const run = (rh: number): Horizon => {
      const m = CAP / profile.at(rh)
      const room = roomOf(profile, m, CAP, base)
      const g = geometry(rh)
      const window = Math.ceil(SLACK * stairTime(room, base, c0, g.inner, g.start + WIDTH / 2))
      const med = roomSliceMedium({ from: g.from, length: g.length, resolution: D0, base, room })
      const chain = roomChain(med, -g.from, smoothPacket(med, LEVELS, g.start - g.from, AMP, WIDTH), g.radii, window)
      const ivs = roomIntervals(chain, cFlat, SHARE)
      const pk = profileKappa(profile, rh, c0)
      const floor = bandFloor(pk.slope, RATE_BAND)
      const band = exponential(ivs, floor)
      const cross = exponential(
        ivs.filter(iv => iv.r > g.inner),
        floor,
      )
      const stairs = stairIntervals(room, base, c0, g.inner, g.radii[g.radii.length - 1]!)

      log(`r_h ${rh} window ${window} L ${g.length} seconds ${chain.run.seconds}`)

      return {
        rh,
        m,
        window,
        chain,
        ivs,
        firstRoom: room(g.inner),
        frozenWeight: g.radii.reduce((a, r, i) => (r <= rh ? a + chain.run.weight[i]! : a), 0),
        band,
        cross,
        crossStair: exponential(
          stairs.filter(iv => iv.r > g.inner),
          floor,
        ),
        near: exponential(ivs, NEAR_ZONE),
        floor,
        stair: exponential(stairs, floor),
        kappa: pk.kappa,
        temperature: cross.rate / (2 * Math.PI),
      }
    }

    const olds = R_OLD.map(run)
    const reported = R_REPORTED.map(run)
    const horizons = R_H.map(run)
    const all = [...olds, ...reported, ...horizons]

    // THE GATES
    const l1Of = (h: Horizon): boolean => h.cross.count >= L1_COUNT && h.cross.span >= L1_SPAN && Math.abs(h.cross.rate / h.kappa - 1) <= L1_TOLERANCE
    const l1 = horizons.every(l1Of)
    const tm = horizons.map(h => h.temperature * h.m)
    const l2 = spreadOf(tm) <= L2_TOLERANCE
    const l3 = [flat, ...all.map(h => h.chain)].every(exact)
    const k1 = flatIvs.length > 0 && flatBlocks.length > 0 && flatBlockWorst <= FLAT_LNZ && flatWorst <= FLAT_SINGLE * horizons[0]!.floor
    const k2 = olds.every((h, i) => Math.abs(h.near.span - OLD_SPAN[i]!) <= K2_TOLERANCE && h.band.span < L1_SPAN)
    const status = l1 && l2 && l3 && k1 && k2 && refused ? 'pass' : 'fail'

    // THE WINDOW AGAINST ln M: the light's top ln z and band span, fitted in ln M over the dock-limited sizes (k_1 >= 2)
    const docked = all.filter(h => h.firstRoom >= 2)
    const topSlope = linearFit({ xs: docked.map(h => Math.log(h.m)), ys: docked.map(h => h.band.top) }).slope
    const crossTopSlope = linearFit({ xs: all.map(h => Math.log(h.m)), ys: all.map(h => h.cross.top) }).slope
    const spanSlope = linearFit({ xs: all.map(h => Math.log(h.m)), ys: all.map(h => h.band.span) }).slope

    all.forEach(h => {
      const key = `r${Math.floor(h.rh)}`

      metrics[`${key}_mass`] = h.m
      metrics[`${key}_lnM`] = Math.log(h.m)
      metrics[`${key}_window`] = h.window
      metrics[`${key}_firstRoom`] = h.firstRoom
      metrics[`${key}_top`] = h.band.top
      metrics[`${key}_stairTop`] = 0.5 * Math.log(base / h.firstRoom)
      metrics[`${key}_dockLaw`] = 0.5 * Math.log(2 * h.rh + 1)
      metrics[`${key}_bandFloor`] = h.floor
      metrics[`${key}_bandCount`] = h.band.count
      metrics[`${key}_bandSpan`] = h.band.span
      metrics[`${key}_bandRateOverKappa`] = h.band.rate / h.kappa
      metrics[`${key}_crossTop`] = h.cross.top
      metrics[`${key}_crossCount`] = h.cross.count
      metrics[`${key}_crossSpan`] = h.cross.span
      metrics[`${key}_crossRateOverKappa`] = h.cross.rate / h.kappa
      metrics[`${key}_crossStairSpan`] = h.crossStair.span
      metrics[`${key}_crossStairRateOverKappa`] = h.crossStair.rate / h.kappa
      metrics[`${key}_stairSpan`] = h.stair.span
      metrics[`${key}_stairRateOverKappa`] = h.stair.rate / h.kappa
      metrics[`${key}_nearSpan`] = h.near.span
      metrics[`${key}_nearCount`] = h.near.count
      metrics[`${key}_kappa`] = h.kappa
      metrics[`${key}_TM`] = h.temperature * h.m
      metrics[`${key}_TProfileM`] = (h.kappa / (2 * Math.PI)) * h.m
      metrics[`${key}_frozenWeight`] = h.frozenWeight
      metrics[`${key}_seconds`] = h.chain.run.seconds
      lines.push(
        `r_h ${h.rh} (M ${h.m.toFixed(0)}, ln M ${Math.log(h.m).toFixed(3)}, window ${h.window}): first room ${h.firstRoom}/${base}; top ln z ${h.band.top.toFixed(3)} (staircase ${(0.5 * Math.log(base / h.firstRoom)).toFixed(3)}, dock law ${(0.5 * Math.log(2 * h.rh + 1)).toFixed(3)}); crossing band >= ${h.floor.toFixed(4)}: ${h.cross.count} intervals spanning ${h.cross.span.toFixed(3)} (top ${h.cross.top.toFixed(3)}), rate over kappa ${(h.cross.rate / h.kappa).toFixed(3)} (staircase ${h.crossStair.span.toFixed(3)}, ${(h.crossStair.rate / h.kappa).toFixed(3)}); with the wall face ${h.band.count} intervals spanning ${h.band.span.toFixed(3)}, rate over kappa ${(h.band.rate / h.kappa).toFixed(3)} (staircase ${h.stair.span.toFixed(3)}, ${(h.stair.rate / h.kappa).toFixed(3)}); near zone ${h.near.count} spanning ${h.near.span.toFixed(3)}; T M ${(h.temperature * h.m).toExponential(4)} (profile ${((h.kappa / (2 * Math.PI)) * h.m).toExponential(4)}); frozen weight ${h.frozenWeight}; intervals ${h.ivs
          .filter(iv => iv.lnz >= NEAR_ZONE)
          .map(iv => `${iv.mid}:${iv.f.toExponential(3)}/${iv.lnz.toFixed(3)}/${iv.u.toFixed(0)}`)
          .join(' ')}`,
      )
    })

    metrics.gate_L1 = l1 ? 1 : 0
    metrics.gate_L2 = l2 ? 1 : 0
    metrics.gate_L3 = l3 ? 1 : 0
    metrics.control_K1 = k1 ? 1 : 0
    metrics.control_K2 = k2 ? 1 : 0
    metrics.base = base
    metrics.baseRefusedAbove = refused ? 1 : 0
    metrics.D0 = D0
    metrics.cFlat = cFlat
    metrics.c0 = c0
    metrics.flatWorst = flatWorst
    metrics.TMSpread = spreadOf(tm)
    metrics.topSlopeInLnM = topSlope
    metrics.crossTopSlopeInLnM = crossTopSlope
    metrics.flatBlockWorst = flatBlockWorst
    metrics.spanSlopeInLnM = spanSlope
    metrics.registerCeiling = 0.5 * Math.log(base)
    metrics.seconds = (Date.now() - started) / 1000

    lines.push(`flat intervals ln z ${flatIvs.map(iv => iv.lnz.toExponential(2)).join(' ')}`)

    return verdict({
      status,
      claim: `the room coupling at D0 ${D0}, C ${base} (the rule's exact limit) on the 1 / r profile at r_h ${R_H.join(', ')}: crossing bands span ${horizons.map(h => h.cross.span.toFixed(3)).join(', ')} (gate ${L1_SPAN}) at rate over kappa ${horizons.map(h => (h.cross.rate / h.kappa).toFixed(3)).join(', ')}, with the wall face ${horizons.map(h => h.band.span.toFixed(3)).join(', ')}; T M spread ${spreadOf(tm).toFixed(4)} (gate ${L2_TOLERANCE}); top ln z ${all.map(h => h.band.top.toFixed(3)).join(', ')} at r_h ${all.map(h => h.rh).join(', ')} against the register's ${(0.5 * Math.log(base)).toFixed(3)}; flat ${flatWorst.toExponential(2)}; E-GRV-0122's near zones ${olds.map(h => h.near.span.toFixed(3)).join(', ')}; exact ${l3}`,
      metrics,
      control: { k1: k1 ? 1 : 0, k2: k2 ? 1 : 0, flatWorst, old12: olds[0]!.near.span, old48: olds[1]!.near.span },
      notes: `L2. L1 ${l1}, L2 ${l2}, L3 ${l3}, K1 ${k1}, K2 ${k2}, limit refused above ${refused}. ${lines.join('. ')}.`,
    })
  },
})
