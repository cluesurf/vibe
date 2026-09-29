// LENGTH CONTRACTION AND THE RELATIVITY OF SIMULTANEITY FOR THE CANDIDATE RULE'S LIGHT MEMBER, READ ON THE HUSK
// (E-RLT-0108). The ledger row: "length contraction and simultaneity, boosted knots read on the husk", none. Bound
// composites that move do not exist yet on any rule (the binding chain, E-SPN-0146 to 0165), so the moving object here
// is the one the candidate rule does move: a lone excitation of the swap-coin dock walk (E-SPN-0142, 0143, 0145).
//
// DERIVED BEFORE THE RUNS (the machinery: code/measure/husk-lorentz, code/measure/dock-mixer, code/measure/singlet-
// kinematics).
// 1. THE BAND. Under the swap coin and the ring mixer at theta = pi + 2 m, the light member's band is, exactly,
//    cos E(K) = cos(m) g(K), g(K) = (1/24) sum_d cos(K . r_d) (E-SPN-0143, point 3), E(0) = m. The husk reads the modes
//    uniform along the depth, K4 = 0 (the column sum keeps K4 = 0 and pi, and at K4 = pi, g = 0 and E = pi/2, far from
//    the member), so the husk momenta are K = (k, 0) with k in R^3.
// 2. WHAT A LONE EXCITATION CAN SHOW. A single particle is not a rod, so length contraction is read on its WAVEPACKET.
//    A packet of rest-frame width sigma (sigma >> 1/m), boosted by the Lorentz map, is contracted to sigma/gamma along
//    the motion at t = 0 by construction; what the DYNAMICS decides is whether it stays the Lorentz image of the rest
//    packet as it moves: its longitudinal width must grow as w_rest(t/gamma)/gamma and its transverse width as
//    w_rest(t/gamma). By stationary phase the widths grow as t^2 H Sigma_p H, with H the band's Hessian at the carrier
//    momentum, and for the contracted momentum spread (gamma/sigma along, 1/sigma across) that is the Lorentz image
//    exactly when
//        H_par / H_perp = 1 / gamma^2      (the CONTRACTION identity: m^2/E^3 against 1/E).
//    The relativity of simultaneity is the tilt of the rest frame's "now" in the moving packet: its phase surfaces
//    (events at one proper time) move at the phase speed E/k, and the rest frame's simultaneous events sit at lab times
//    differing by v dx / c*^2 exactly when
//        (E / k) v = c*^2                  (the SIMULTANEITY identity: phase speed times group speed).
//    And one Lorentz factor must serve both the kinematics and the energy:
//        gamma(v) = 1 / sqrt(1 - v^2 / c*^2) = E / m      (the FACTOR identity).
//    c* is the member's own long-wave speed, from its band: c*^2 = lim (E^2 - m^2) / K^2 = m cot(m) c0^2 (E-SPN-0143
//    point 5, c0 = c/2 = 1/sqrt 2 in D4 units), so R = c0^2 / c*^2 = tan(m)/m.
// 3. WHERE THE LATTICE SHOWS. E^2 = m^2 + c*^2 K^2 holds to leading order; every deviation from it is analytic in K^2
//    at fixed gamma and starts at order K^2 (g's quartic is isotropic, E-SPN-0142, and the arccos of the quasienergy
//    adds even powers). A speed beta c* is reached at K = m gamma beta / c* to leading order, so AT FIXED beta EVERY
//    DEVIATION SCALES AS m^2: the member is exactly Lorentz covariant in the light limit m -> 0 (masses small against
//    the inverse dock), and a heavy member is not. The band's top speed along the husk is below c* (the lattice turns
//    the speed over near the zone edge; E-SPN-0143 point 4 puts every band under c0).
// 4. ISOTROPY. g is invariant under W(F4), and on the husk (K4 = 0) its first anisotropy is at K^6 (E-SPN-0142: slope
//    5.98), so the three identities read alike along the husk's axis, face and body diagonals to that order.
//
// GATES, fixed after probe 1 (disclosed below), at the chosen light point e^(i theta*) = -(360 + 37 w)/343 (m* 0.046778,
// E-SPN-0143), read on the RULE's band (the dock matrix's singlet, singletEps), along the husk axis, face and body
// diagonals, at beta = v/c* in {0.1, 0.3, 0.5, 0.7} and 0.9:
//  A1 FACTOR:        |gamma(v)/gamma(E) - 1| <= 1e-3 for beta <= 0.7, <= 1e-2 at 0.9
//  A2 CONTRACTION:   |(H_par/H_perp) gamma^2 - 1| <= 2e-3 for beta <= 0.7, <= 2e-2 at 0.9
//  A3 SIMULTANEITY:  |(E/k) v / c*^2 - 1| <= 1e-3 for beta <= 0.7, <= 5e-3 at 0.9
//  A4 HUSK ISOTROPY: at every beta, each of the three deviations spreads by at most 1e-3 over the three directions, the
//                    two transverse curvatures agree to 1e-6 and the group velocity is along the momentum to 1e-6 rad
//  A5 LIGHT LIMIT:   at beta 0.1, 0.3 and 0.5 the contraction deviation at the k = 2 point (m 0.143348) over the chosen
//                    point's is within 5% of (m2/m*)^2 = 9.391 (the m^2 law of point 3)
// INSTRUMENT (a failure makes the verdict partial): the rule band's three deviations equal the closed form's to 1e-6 at
//  every reading; c* read on the rule equals the closed form's to 1e-8; the deviations at step h and 2h agree to 1e-5.
// CONTROLS (a failure makes the verdict partial):
//  C1 the gates can fail on this rule: at the heavy in-ring point theta = 4 pi/3 (m = pi/6, R 1.102658) the contraction
//     deviation at beta 0.5 exceeds 2e-2 (probe: 4.99e-2)
//  C2 the reader can fail: a Galilean band E = m + c*^2 K^2 / (2 m) of the same rest energy and speed reads a factor
//     deviation above 1e-2 at beta 0.5 (derived: gamma(E) = 1 + beta^2/2 = 1.125 against gamma(v) = 1.1547, 2.6e-2)
// REPORTED, gating nothing: the husk top speed along each direction; the same table at the k = 2 and heavy points.
// Verdict: pass if A1 to A5 hold with the instrument and controls; fail if the instrument and controls hold and a gate
// fails; partial otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed. tmp/hl-probe1.log: the first reading bisected over [0, 3] and landed past the
// speed's lattice maximum (the speed rises, peaks and falls), and the rule's band tracker then threw at large K; fixed
// by reading only below the peak (speedPeak). tmp/hl-probe1b.log, after the fix: at m* the three deviations along all
// three directions read F -3.9e-8, -2.8e-6, -3.1e-5, -2.5e-4, -5.1e-3; L -7.4e-6, -7.7e-5, -3.0e-4, -1.2e-3, -1.3e-2;
// S -4.8e-6, -3.7e-5, -1.2e-4, -3.5e-4, -1.6e-3 at beta 0.1 .. 0.9, rule equal to closed to every printed digit; the
// husk peak 0.9767 c*; the k = 2 point's L at beta 0.5 is 9.57 times the chosen point's; the heavy point's L at 0.5 is
// -5.0e-2. EVERY GATE THRESHOLD ABOVE WAS SET AFTER THAT PROBE, with a margin of about 1.5 to 3 over it, so A1 to A5 are
// confirmations of a probed reading, not blind predictions; the m^2 law (A5) and the controls were derived before it.
//
// FIRST RUN (tmp/hl-lorentz-run1.log): pass, every gate, instrument and control. At m*: factor 3.07e-5 at 0.5 c* and
// 5.07e-3 at 0.9; contraction 3.04e-4 and 1.34e-2; simultaneity 1.23e-4 and 1.58e-3; spread over the three husk
// directions 3.2e-5, transverse split 4.2e-9, tilt 0; the k = 2 over chosen contraction ratio 9.534, 9.537, 9.565 at
// beta 0.1, 0.3, 0.5 against (m2/m*)^2 9.391 (1.5 to 1.9% above the leading law, the next order); husk top speed
// 0.97670, 0.97681, 0.97675 c*; rule against closed 7.8e-7; C1 -4.99e-2, C2 2.64e-2. The title was written after it.
//
// Depth L2: the identities are read on the exact rule's own band (its dock matrix), with a closed form as the
// instrument and a heavy point and a Galilean band that fail. NOT a bound composite, and not a many-body run: a lone
// excitation's packet. The candidate rule is not the adopted rule. DETERMINISM: fixed directions, speeds and steps;
// nothing is drawn. NOTHING MOVES: the coin and the mixer hand a value between slots of one dock, the stream takes it
// one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { dockMatrix, DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { singletEps, singletLevel } from '@/code/measure/singlet-kinematics'
import { ringAngle } from '@/code/measure/swap-cone'
import { closedBand, husk, longWaveSpeed, lorentzReading, speedPeak, type Band, type LorentzReading } from '@/code/measure/husk-lorentz'

const SWAP_N = 2 / 3
const H = 1e-4
const KMAX = 3
const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const DIRS: readonly (readonly number[])[] = [
  [1, 0, 0],
  [s2, s2, 0],
  [s3, s3, s3],
]
const NAMES = ['axis', 'face', 'body']
const LOW_BETAS: readonly number[] = [0.1, 0.3, 0.5, 0.7]
const HIGH_BETA = 0.9
const BETAS: readonly number[] = [...LOW_BETAS, HIGH_BETA]
const LIMIT_BETAS: readonly number[] = [0.1, 0.3, 0.5]
const FACTOR = { low: 1e-3, high: 1e-2 }
const CONTRACTION = { low: 2e-3, high: 2e-2 }
const SIMULTANEITY = { low: 1e-3, high: 5e-3 }
const SPREAD = 1e-3
const TRANSVERSE = 1e-6
const TILT = 1e-6
const LAW = 0.05
const RULE_CLOSED = 1e-6
const C_STAR_GAP = 1e-8
const STEP_GAP = 1e-5
const HEAVY_FLOOR = 2e-2
const GALILEAN_FLOOR = 1e-2

type Point = { name: string; theta: number; m: number; rule: Band; closed: Band; cStar: number; cRule: number; peaks: { k: number; v: number }[] }

function pointAt(name: string, theta: number): Point {
  const P = dockMatrix(theta, SWAP_N, true)
  const level = singletLevel(P, DOCK_ROOTS, 12)
  const m = level.m
  const rule: Band = K => singletEps(P, DOCK_ROOTS, level, K)
  const closed = closedBand(m)
  const cStar = longWaveSpeed(closed, m, DIRS[0] as number[], 1e-3)
  const cRule = longWaveSpeed(rule, m, DIRS[0] as number[], 1e-3)

  return { name, theta, m, rule, closed, cStar, cRule, peaks: DIRS.map(u => speedPeak(closed, u, KMAX, H)) }
}

// the readings along every direction at every beta the band reaches
function table(p: Point, E: Band, betas: readonly number[], h = H): LorentzReading[][] {
  return DIRS.map((u, j) => betas.filter(b => b * p.cStar < (p.peaks[j] as { v: number }).v).map(b => lorentzReading(E, p.m, p.cStar, u, b, (p.peaks[j] as { k: number }).k, h)))
}

const within = (x: number, beta: number, t: { low: number; high: number }): boolean => Math.abs(x) <= (beta > 0.7 ? t.high : t.low)

export default experiment({
  id: 'relativity/husk-lorentz-kinematics',
  code: 'E-RLT-0108',
  title:
    'length contraction and the relativity of simultaneity for the candidate rule light member, read on the husk, pass: on the swap-coin singlet band (the rule dock matrix, K4 = 0) one Lorentz factor serves speed and energy, the longitudinal over transverse curvature is 1/gamma^2 (a moving packet stays the contracted Lorentz image of its rest packet) and phase speed times group speed is c*^2 (the rest frame now tilts by v dx/c*^2), each within 3.1e-4 up to 0.5 c* and 1.34e-2 at 0.9 c* at m 0.046778, alike on the husk axis, face and body diagonals (spread 3.2e-5), and every deviation scales as m^2 at fixed speed (ratio 9.53 to 9.57 for m 0.143348 against 9.39), so the member is exactly Lorentz covariant in the light limit; a heavy in-ring member and a Galilean band fail; the husk top speed is 0.977 c*; a lone excitation, not a moving bound body',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const chosen = pointAt('chosen', Math.PI + ringAngle([3n, 1n], 3).delta)
    const second = pointAt('k2', Math.PI + ringAngle([3n, 1n], 2).delta)
    const heavy = pointAt('heavy', (4 * Math.PI) / 3)

    log('points')

    // ---------------- the gate readings, on the rule's band ----------------
    const rule = table(chosen, chosen.rule, BETAS)
    const closed = table(chosen, chosen.closed, BETAS)
    const coarse = table(chosen, chosen.rule, BETAS, 2 * H)

    log('chosen point')

    const flat = rule.flat()
    const A1 = flat.every(r => within(r.factor, r.beta, FACTOR))
    const A2 = flat.every(r => within(r.contraction, r.beta, CONTRACTION))
    const A3 = flat.every(r => within(r.simultaneity, r.beta, SIMULTANEITY))
    const spreadOf = (pick: (r: LorentzReading) => number): number =>
      Math.max(
        ...BETAS.map(b => {
          const xs = rule.map(row => row.find(r => r.beta === b)).filter((r): r is LorentzReading => r !== undefined).map(pick)

          return xs.length ? Math.max(...xs) - Math.min(...xs) : 0
        }),
      )
    const spread = Math.max(spreadOf(r => r.factor), spreadOf(r => r.contraction), spreadOf(r => r.simultaneity))
    const transverseSplit = Math.max(...flat.map(r => r.transverseSplit))
    const tilt = Math.max(...flat.map(r => r.tilt))
    const readsAll = rule.every(row => row.length === BETAS.length)
    const A4 = readsAll && spread <= SPREAD && transverseSplit <= TRANSVERSE && tilt <= TILT

    const secondRows = table(second, second.rule, LIMIT_BETAS)
    const lawTarget = (second.m / chosen.m) ** 2
    const ratios = LIMIT_BETAS.map((b, i) => {
      const a = (rule[0] as LorentzReading[])[i] as LorentzReading
      const c = (secondRows[0] as LorentzReading[])[i] as LorentzReading

      return { beta: b, ratio: c.contraction / a.contraction }
    })
    const A5 = ratios.every(r => Math.abs(r.ratio / lawTarget - 1) <= LAW)

    log('light limit')

    // ---------------- instrument ----------------
    const ruleClosed = Math.max(...flat.map((r, i) => {
      const c = closed.flat()[i] as LorentzReading

      return Math.max(Math.abs(r.factor - c.factor), Math.abs(r.contraction - c.contraction), Math.abs(r.simultaneity - c.simultaneity))
    }))
    const cStarGap = Math.abs(chosen.cRule - chosen.cStar)
    const stepGap = Math.max(...flat.map((r, i) => {
      const c = coarse.flat()[i] as LorentzReading

      return Math.max(Math.abs(r.factor - c.factor), Math.abs(r.contraction - c.contraction), Math.abs(r.simultaneity - c.simultaneity))
    }))
    const instrument = ruleClosed <= RULE_CLOSED && cStarGap <= C_STAR_GAP && stepGap <= STEP_GAP

    // ---------------- controls ----------------
    const heavyHalf = lorentzReading(heavy.rule, heavy.m, heavy.cStar, DIRS[0] as number[], 0.5, (heavy.peaks[0] as { k: number }).k, H)
    const C1 = Math.abs(heavyHalf.contraction) > HEAVY_FLOOR
    const galilean: Band = K => chosen.m + (chosen.cStar * chosen.cStar * ((K[0] as number) ** 2 + (K[1] as number) ** 2 + (K[2] as number) ** 2 + (K[3] as number) ** 2)) / (2 * chosen.m)
    const galileanHalf = lorentzReading(galilean, chosen.m, chosen.cStar, DIRS[0] as number[], 0.5, 1, H)
    const C2 = Math.abs(galileanHalf.factor) > GALILEAN_FLOOR
    const controls = C1 && C2

    log('controls')

    // ---------------- reported ----------------
    const heavyRows = table(heavy, heavy.rule, BETAS)
    const secondAll = table(second, second.rule, BETAS)
    const fmt = (rows: LorentzReading[][]): string =>
      rows.map((row, j) => `${NAMES[j]}: ${row.map(r => `b ${r.beta} k ${r.k.toFixed(4)} F ${r.factor.toExponential(2)} L ${r.contraction.toExponential(2)} S ${r.simultaneity.toExponential(2)}`).join(', ')}`).join(' | ')

    const status = !instrument || !controls ? 'partial' : A1 && A2 && A3 && A4 && A5 ? 'pass' : 'fail'
    const flag = (b: boolean): number => (b ? 1 : 0)
    const at = (beta: number, pick: (r: LorentzReading) => number): number => Math.max(...rule.map(row => Math.abs(pick(row.find(r => r.beta === beta) as LorentzReading))))
    const metrics: Record<string, number> = {
      A1: flag(A1),
      A2: flag(A2),
      A3: flag(A3),
      A4: flag(A4),
      A5: flag(A5),
      instrument: flag(instrument),
      C1: flag(C1),
      C2: flag(C2),
      mStar: chosen.m,
      cStar: chosen.cStar,
      R: 0.5 / (chosen.cStar * chosen.cStar),
      factorAtHalf: at(0.5, r => r.factor),
      contractionAtHalf: at(0.5, r => r.contraction),
      simultaneityAtHalf: at(0.5, r => r.simultaneity),
      factorAtHigh: at(HIGH_BETA, r => r.factor),
      contractionAtHigh: at(HIGH_BETA, r => r.contraction),
      simultaneityAtHigh: at(HIGH_BETA, r => r.simultaneity),
      spread,
      transverseSplit,
      tilt,
      lawTarget,
      lawRatioHalf: (ratios[2] as { ratio: number }).ratio,
      huskTopAxis: (chosen.peaks[0] as { v: number }).v / chosen.cStar,
      huskTopFace: (chosen.peaks[1] as { v: number }).v / chosen.cStar,
      huskTopBody: (chosen.peaks[2] as { v: number }).v / chosen.cStar,
      ruleClosed,
      cStarGap,
      stepGap,
      heavyContractionHalf: heavyHalf.contraction,
      galileanFactorHalf: galileanHalf.factor,
      seconds: (Date.now() - started) / 1000,
    }

    return verdict({
      status,
      claim: `at m* ${chosen.m.toFixed(6)} (c* ${chosen.cStar.toFixed(9)}, R ${(0.5 / (chosen.cStar * chosen.cStar)).toFixed(6)}), on the rule's band along the husk axis, face and body diagonals: A1 ${A1} (factor at 0.5 c* ${metrics.factorAtHalf?.toExponential(2)}, at 0.9 ${metrics.factorAtHigh?.toExponential(2)}); A2 ${A2} (contraction ${metrics.contractionAtHalf?.toExponential(2)}, ${metrics.contractionAtHigh?.toExponential(2)}); A3 ${A3} (simultaneity ${metrics.simultaneityAtHalf?.toExponential(2)}, ${metrics.simultaneityAtHigh?.toExponential(2)}); A4 ${A4} (spread ${spread.toExponential(2)}, transverse ${transverseSplit.toExponential(2)}, tilt ${tilt.toExponential(2)}); A5 ${A5} (contraction ratio k2 over chosen ${ratios.map(r => r.ratio.toFixed(4)).join(', ')} at beta ${LIMIT_BETAS.join(', ')}, against (m2/m*)^2 ${lawTarget.toFixed(4)}); husk top speed ${chosen.peaks.map(p => (p.v / chosen.cStar).toFixed(6)).join(', ')} c*; instrument ${instrument} (rule against closed ${ruleClosed.toExponential(2)}, c* ${cStarGap.toExponential(2)}, step ${stepGap.toExponential(2)}); controls C1 ${C1} (heavy contraction at 0.5 c* ${heavyHalf.contraction.toExponential(2)}), C2 ${C2} (Galilean factor at 0.5 c* ${galileanHalf.factor.toExponential(2)})`,
      metrics,
      control: { C1: flag(C1), C2: flag(C2), instrument: flag(instrument) },
      notes: `L2. The chosen point, rule band: ${fmt(rule)}. The k = 2 point (m ${second.m.toFixed(6)}, c* ${second.cStar.toFixed(9)}): ${fmt(secondAll)}. The heavy point (m ${heavy.m.toFixed(6)}, c* ${heavy.cStar.toFixed(9)}, top ${heavy.peaks.map(p => (p.v / heavy.cStar).toFixed(4)).join(', ')} c*): ${fmt(heavyRows)}. Husk momenta K4 = 0 (${husk([1, 0, 0]).join(',')} is the axis). ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
