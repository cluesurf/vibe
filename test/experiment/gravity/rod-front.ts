// The rod front (E-GRV-0104): a witness for the speed of the pull that reads the husk ALONE at c, calibrated first,
// then turned on the husk backed by shrinking layers whose clocks are warped (E-GRV-0102, 0103).
//
// WHY A NEW WITNESS. E-GRV-0103 read the warped stack's front at 1.14 c (first 10 percent of the maximum) and 1.23 c
// (first 25 percent), and the husk alone, with no bulk, at 1.17 c and 1.40 c by the same method: the method, not the
// bulk, runs ahead of light. Two causes, both removed here (code/measure/open-husk rodFront, whose header gives the
// full argument):
//  - A UNIT HOP IS A DIPOLE: the content leaving and the content arriving are one dock (5 beats) apart at any dock, so
//    their fronts overlap inside each other's smear. Here a ROD of content (one unit a dock on (0 .. 7, 0, 0)) hops one
//    dock +x in one beat, every unit a neighbor hop of the rule: the content changes only at (0, 0, 0) (-1) and
//    (8, 0, 0) (+1), so behind the rod, at (-d, 0, 0), the change is one monopole front with the other 8 docks (40
//    beats) behind it.
//  - A FRACTION OF A MAXIMUM DRIFTS: the husk's short waves run slower than c (its dispersion omega = c p (1 - gamma
//    p^2)), so a front reaches distance d smeared over sigma ~ d^(1/3), and a fixed fraction x of the height crosses
//    at s_x sigma(d) off the cone: a drift a straight line reads as a speed. The one fraction with s_x = 0 is ONE THIRD
//    (the integral of the Airy function up to 0), so the time the change in depth reaches a third of the front's
//    height, u / (24 pi d) (the husk mesh's static field of the content that left), is t0 + d / c.
//
// THE CALIBRATION, before this file was written (tmp/front-probe1.log, disclosed; instrument only, no stack run): on the
// side-64 husk alone the third reads 1.0023 c on d = 4 .. 20 (1.0044, 1.0017, 1.0009 c on d = 4 .. 12, 8 .. 16, 12 ..
// 24), its line through the cone to 0.055 beats; the half reads 0.988 c and the tenth 1.040 c, the drift the header
// predicts in sign (a lower fraction runs ahead). The plateau behind the front is 0.95 .. 1.06 of the height.
//
// THE PREDICTION for the warped stack (code/measure/open-husk stackSpeeds, E-GRV-0103's derivation): s_k = 6 m_k on
// every layer, so every mode of the stack obeys omega^2 = c^2 (p^2 + mass^2), each mode's front is sharp at c and
// carries its full weight (the weights sum to the husk alone's), and its wake then pulls the level down toward the
// stack's static field. So the front's height is the husk's and its third arrives at d / c: the warped stack reads c.
// Its coarse layers are MORE subluminal at a given husk momentum (larger docks), so if anything it reads a little under.
// THE CONTROL, reported and not gated: the one-clock stack (E-GRV-0100 and 0101's rule), whose zero mode runs at 1.302 c
// (derived) and whose layer k carries waves at 2^k c; predicted to read above 1.02 c.
//
// GATES, fixed before the first run of this file. D 16, three digits, kappa = 2 / 297, c(16) = 0.20101; side-64 husk, the
// rod of 8 docks of one unit each, its sink at the antipode, the hop after beat 32, 160 beats watched at (-d, 0, 0),
// d = 2 .. 24, the speed fitted on d = 4 .. 20:
//  F1 the calibrated witness: the husk alone's third reads c within 2 percent.
//  F2 the warped stack (4 shrinking layers, code/rule/open-husk warpClock): its third reads c within 2 percent and never
//     above 1.02 c.
//  F0 exact: in every run Gauss 0 off on every dock after every beat, 0 wraps, every remainder in its own window, every
//     run (with and without the hop) reverses to its start bit for bit, lines included.
// REPORTED: the half and the tenth on each mesh, the plateau, the one-clock control.
// Verdict: pass if F0 to F2 hold; fail otherwise.
//
// FIRST RUN (tmp/rod-front-run1.log; 79 s, the record): fail on F2 by a hair, on the slow side; no gate moved. F1 holds:
// the husk alone reads 1.0023 c (half 0.988, tenth 1.040), its line 0.055 beats off the cone. F2: the warped stack reads
// 0.9798 c, 2.02 percent under c against 2 (never above 1.02 c holds; half 0.947, tenth 1.038). Its third arrives later
// than the husk alone's at every d, 0.1 beats at d = 2 growing to 2.4 beats at d = 24: the pull through the warped bulk
// runs at or under light, never ahead of it. THE CAUSE OF THE 2 PERCENT, read in the same run: the header's claim that
// the stack's front carries the husk's full height is wrong on the mesh. Behind the warped stack's front the level is
// 0.65 of the husk's height at d = 2 falling to 0.55 at d = 24 (the husk alone 0.95 .. 1.06): the massive modes' wakes
// pull the level down within beats of the front, not after it, so a third of the husk's height is a larger share of the
// stack's own step and is reached later, the more so as the front widens with d. A witness taking a third of each mesh's
// OWN step would remove it; that is a new gate for a new run, not this one. THE CONTROL does what it should: the
// one-clock stack reads 1.126 c (tenth 1.28 c), its third ahead of the husk alone's from d = 5 on by up to 10.7 beats,
// so the witness sees a superluminal bulk where there is one. F0 holds: Gauss 0 off in 1,152 beat checks, 0 wraps, every
// remainder in its window, all six runs reverse bit for bit. Title written after the run.
//
// Depth L2: a known construction (a scalar front on a lattice, read by the Airy one-third point) on bounded registers.
// DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the
// rule; the rod's hop is a scheduled event.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lightSpeed } from '@/code/measure/varying-depth-light'
import { stepRule } from '@/code/rule/step-depth'
import { openMesh, warpClock, type OpenMesh } from '@/code/rule/open-husk'
import { newOpenRecord, rodFront, stackSpeeds, type OpenRecord, type RodFront } from '@/code/measure/open-husk'

const DEPTH = 16
const LEVELS = 3
const SIDE = 64
const LAYERS = 4
const ROD = 8
const UNITS = 1
const HOP_AT = 32
const WINDOW = 160
const DISTANCES: readonly number[] = Array.from({ length: 23 }, (_, i) => i + 2)
const FIT: readonly number[] = DISTANCES.filter(d => d >= 4 && d <= 20)
const TOLERANCE = 0.02
const NEVER_FASTER = 1.02

const exact = (record: OpenRecord, front: RodFront): boolean => record.gaussOff === 0 && record.wraps.fWraps + record.wraps.vWraps === 0 && record.restOff === 0 && record.reversed && front.reversed

export default experiment({
  id: 'gravity/rod-front',
  code: 'E-GRV-0104',
  title:
    "a front witness calibrated on the husk alone, the time the change behind a hopping rod reaches a third of the front's height (the Airy point, where a dispersive front's smear drops out), reads the husk alone at 1.0023 c where fractions of a maximum read 1.17 to 1.40 c, and reads the warped stack at 0.980 c, never above c but 2.02 percent under against a 2 percent gate, fail on F2 by a hair: the stack's level behind the front is only 0.55 to 0.65 of the husk's height, so a third of the husk's height comes later; the one-clock control reads 1.126 c, so the witness sees a superluminal bulk where there is one; every run exact and reversed bit for bit",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${(Date.now() - started) / 1000}s`)
    const rule = stepRule(DEPTH, LEVELS)
    const c = lightSpeed(DEPTH)
    const spec = { rod: ROD, units: UNITS, hopAt: HOP_AT, window: WINDOW, distances: DISTANCES, fit: FIT }
    const read = (mesh: OpenMesh): { front: RodFront; record: OpenRecord } => {
      const record = newOpenRecord()

      return { front: rodFront(mesh, rule, spec, record, c), record }
    }

    const alone = read(openMesh(SIDE, 0, 'shrink'))

    log('alone')

    const one = openMesh(SIDE, LAYERS, 'shrink')
    const warped = read(warpClock(one))

    log('warped')

    const oneClock = read(one)

    log('one clock')

    const ratio = (f: RodFront): number => f.speedThird / c
    const f1 = Math.abs(ratio(alone.front) - 1) <= TOLERANCE
    const f2 = Math.abs(ratio(warped.front) - 1) <= TOLERANCE && ratio(warped.front) <= NEVER_FASTER
    const f0 = exact(alone.record, alone.front) && exact(warped.record, warped.front) && exact(oneClock.record, oneClock.front)
    const status = f0 && f1 && f2 ? 'pass' : 'fail'
    const speeds = stackSpeeds(one.sides, 'clock')
    const speedsOne = stackSpeeds(one.sides, 'none')
    const f = (x: number): string => x.toFixed(4)
    const metrics: Record<string, number> = {
      gate_F0: f0 ? 1 : 0,
      gate_F1: f1 ? 1 : 0,
      gate_F2: f2 ? 1 : 0,
      scalarSpeed: c,
      aloneThirdRatio: ratio(alone.front),
      aloneHalfRatio: alone.front.speedHalf / c,
      aloneTenthRatio: alone.front.speedTenth / c,
      aloneOffset: alone.front.offset,
      warpedThirdRatio: ratio(warped.front),
      warpedHalfRatio: warped.front.speedHalf / c,
      warpedTenthRatio: warped.front.speedTenth / c,
      warpedOffset: warped.front.offset,
      oneClockThirdRatio: ratio(oneClock.front),
      oneClockHalfRatio: oneClock.front.speedHalf / c,
      oneClockTenthRatio: oneClock.front.speedTenth / c,
      oneClockOffset: oneClock.front.offset,
      zeroModeSpeedWarped: speeds.zeroMode,
      zeroModeSpeedOneClock: speedsOne.zeroMode,
      gaussOff: alone.record.gaussOff + warped.record.gaussOff + oneClock.record.gaussOff,
      gaussChecks: alone.record.gaussChecks + warped.record.gaussChecks + oneClock.record.gaussChecks,
      wraps: [alone, warped, oneClock].reduce((t, r) => t + r.record.wraps.fWraps + r.record.wraps.vWraps, 0),
      restOff: alone.record.restOff + warped.record.restOff + oneClock.record.restOff,
      seconds: (Date.now() - started) / 1000,
    }

    DISTANCES.forEach((d, i) => {
      metrics[`aloneThird_d${d}`] = alone.front.third[i]!
      metrics[`warpedThird_d${d}`] = warped.front.third[i]!
      metrics[`oneClockThird_d${d}`] = oneClock.front.third[i]!
      metrics[`warpedPlateau_d${d}`] = warped.front.plateau[i]!
    })

    const times = (t: number[]): string => t.map(x => x.toFixed(2)).join(' ')

    return verdict({
      status,
      claim: `the time the change in depth behind a hopping rod reaches one third of the front's height (the Airy point, where a dispersive front's smear drops out) reads the side-${SIDE} husk alone's pull at ${f(ratio(alone.front))} c on d = ${FIT[0]} .. ${FIT[FIT.length - 1]} (half ${f(alone.front.speedHalf / c)} c, tenth ${f(alone.front.speedTenth / c)} c, the drift of a fixed fraction), the husk backed by ${LAYERS} shrinking layers with warped clocks at ${f(ratio(warped.front))} c (half ${f(warped.front.speedHalf / c)}, tenth ${f(warped.front.speedTenth / c)}; zero mode derived ${f(speeds.zeroMode)} c), and the one-clock stack, the control, at ${f(ratio(oneClock.front))} c (zero mode derived ${f(speedsOne.zeroMode)} c); Gauss off ${metrics.gaussOff} in ${metrics.gaussChecks}, ${metrics.wraps} wraps, ${metrics.restOff} remainders out of window, reversal ${f0}`,
      metrics,
      control: { oneClockThirdRatio: ratio(oneClock.front), aloneThirdRatio: ratio(alone.front) },
      notes: `L2. Gates F0 ${f0}, F1 ${f1} (${f(ratio(alone.front))} c), F2 ${f2} (${f(ratio(warped.front))} c). Third, beats after the hop, d = ${DISTANCES.join(' ')}: alone ${times(alone.front.third)}; warped ${times(warped.front.third)}; one clock ${times(oneClock.front.third)}; d / c ${DISTANCES.map(d => (d / c).toFixed(2)).join(' ')}. Offsets ${f(alone.front.offset)}, ${f(warped.front.offset)}, ${f(oneClock.front.offset)} beats. Plateau over the height: alone ${alone.front.plateau.map(x => x.toFixed(3)).join(' ')}; warped ${warped.front.plateau.map(x => x.toFixed(3)).join(' ')}; one clock ${oneClock.front.plateau.map(x => x.toFixed(3)).join(' ')}. Survey ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
