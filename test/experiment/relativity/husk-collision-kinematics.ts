// RELATIVISTIC MOMENTUM AND COLLISIONS FOR THE CANDIDATE RULE'S LIGHT MEMBERS, READ ON THE HUSK (E-RLT-0109). The
// ledger row: "relativistic momentum and collisions, two-knot scattering conserves four-momentum", none. Bound knots
// that move do not exist yet, so the colliding objects are the candidate rule's lone excitations (E-SPN-0142, 0143,
// 0145), each on the light member's band.
//
// DERIVED BEFORE THE RUNS (machinery: code/measure/husk-lorentz).
// 1. CONSERVATION IS EXACT, AND IT IS A THEOREM, NOT A MEASUREMENT. Every piece of the rule commutes with the D4
//    lattice's translations, and the two-body rule is one fixed unitary per beat (E-SPN-0145: two holes interact only
//    at contact, through the empty line's meeting phase, the contact K and the mixer's hop sign). So any two-body
//    scattering conserves the total quasimomentum modulo the dual lattice and the total quasienergy modulo 2 pi,
//    exactly, whatever the contact amplitude is. For momenta far inside the zone (|K . r| < pi/2 on every root, checked)
//    no umklapp term can be reached, and the conserved pair is the ordinary total momentum P and energy E1 + E2 of the
//    band (E from cos E = cos(m) g(K), E-SPN-0143).
// 2. SO THE RELATIVISTIC CONTENT IS THE SHELL. Energy and momentum conservation confine the outgoing pair to the shell
//    {p3 : E(p3) + E(P - p3) = E1 + E2}. For a relativistic band the shell is the CM frame's sphere of radius k*
//    (sqrt s = 2 sqrt(m^2 + c*^2 k*^2), s = (E1 + E2)^2 - c*^2 P^2 the invariant mass) boosted by beta = c* P/(E1 + E2):
//    an ellipsoid, the Lorentz-contracted sphere. The reader places every outgoing momentum the Lorentz boost predicts
//    (26 CM directions: the husk's axes, face and body diagonals, both signs) and reads how far the pair is from
//    conserving the band's own energy. Zero for an exactly relativistic band. Four-momentum conservation with the rule's
//    own E(p), and the invariance of s, are then the same statement.
// 3. THE LATTICE DEFECT SCALES AS m^2. As in E-RLT-0108, every deviation from E^2 = m^2 + c*^2 K^2 starts at order K^2,
//    and the collisions are placed at momenta proportional to m (the same speeds at every mass), so the residual scales
//    as m^2: the collision kinematics are exactly relativistic in the light limit.
//
// GATES, fixed after probe 1 (disclosed below), at the chosen light point (m* 0.046778, E-SPN-0143), on the RULE's band
// (the dock matrix's singlet), husk momenta K4 = 0. Four collisions, momenta in units of m*/0.046778: (0.02, 0, 0) on
// (-0.02, 0, 0) (the CM frame), (0.05, 0, 0) on (0, 0.02, 0) (boost 0.35), (0.1, 0.03, 0) on (-0.02, 0.05, 0.01)
// (boost 0.54), (0.2, 0, 0) on (0.05, 0.05, 0) (boost 0.83):
//  B1 SHELL: the energy residual at the boosted CM sphere is at most 1e-3 of E1 + E2, over all 26 directions, on all four
//  B2 LIGHT LIMIT: on each collision the k = 2 point's residual (m 0.143348, the same collisions scaled by m) over the
//     chosen point's is within 5% of (m2/m*)^2 = 9.391
//  B3 NO UMKLAPP: every incoming and predicted outgoing momentum has |K . r| < pi/2 on every root
// INSTRUMENT (partial on failure): the rule's residuals equal the closed form's to 1e-9 (both are fractions of E1 + E2);
//  the CM collision's boost is 0 to 1e-15 (run 2's form; run 1's k* check is described under FIRST RUN).
// CONTROLS (partial on failure):
//  C1 the shell gate can fail on this rule: at the heavy in-ring point (m = pi/6) the third collision's residual
//     exceeds 1e-3 (probe: 2.1e-2)
//  C2 the reader can fail: a Galilean band of the same rest energy and c* reads a residual above 1e-3 on the third
//     collision
// Verdict: pass if B1 to B3 hold with the instrument and controls; fail if they hold and a gate fails; partial otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed. tmp/hl-probe1b.log: at m* the residuals read 7.0e-7, 1.3e-5, 1.8e-4, 7.3e-4
// (rule equal to closed to every printed digit); the k = 2 over m* ratios 9.38, 9.40, 9.37, 9.29; the heavy point 8.6e-5,
// 1.7e-3, 2.1e-2, 1.9e-2. B1's 1e-3 and B2's 5% were SET AFTER THAT PROBE, so they confirm a probed reading; the m^2
// law and point 1 were derived before it. C2's Galilean reading was not probed.
//
// FIRST RUN (tmp/hl-collision-run1.log): PARTIAL on an INSTRUMENT DEFECT, disclosed. The instrument then asked that the
// CM collision's k*, read back from sqrt s through the RELATIVISTIC relation, equal the incoming 0.02 m*/0.046778 to
// 1e-9. That holds only if the band is exactly relativistic, which is what B1 measures, so the check read the lattice
// defect itself (1.67e-7, 8e-6 of k*, the same order as B1's CM residual 7.0e-7). The fix checks what the instrument
// was meant to check, that the boost vanishes in the CM frame, and reports the k* gap. Every gate, threshold and every
// other number of run 1 is unchanged in run 2: B1 6.98e-7, 1.33e-5, 1.75e-4, 7.30e-4; B2 9.38 to 9.28 against 9.391;
// B3 0.2696; rule against closed 6.7e-14; C1 2.1e-2, C2 0.297.
// SECOND RUN (tmp/hl-collision-run2.log): pass, every gate, instrument and control; CM boost exactly 0; k* gap 1.67e-7
// reported.
//
// NOT MEASURED: WHERE on the shell the pair goes, which is the contact amplitude (E-SPN-0145's contact K and meeting
// phase), and so no cross section. This row's claim is the kinematics, which the amplitude cannot change.
//
// Depth L1 (conservation by symmetry) and L2 (the shell on the exact rule's own band). Lone excitations of the candidate
// rule, not bound knots, and not the adopted rule. DETERMINISM: fixed momenta and directions. NOTHING MOVES.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { dockMatrix, DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { singletEps, singletLevel } from '@/code/measure/singlet-kinematics'
import { ringAngle } from '@/code/measure/swap-cone'
import { closedBand, collisionShell, husk, huskDirections, longWaveSpeed, type Band, type ShellReading } from '@/code/measure/husk-lorentz'

const SWAP_N = 2 / 3
const M_STAR_REF = 0.046778
const COLLISIONS: readonly (readonly [readonly number[], readonly number[]])[] = [
  [
    [0.02, 0, 0],
    [-0.02, 0, 0],
  ],
  [
    [0.05, 0, 0],
    [0, 0.02, 0],
  ],
  [
    [0.1, 0.03, 0],
    [-0.02, 0.05, 0.01],
  ],
  [
    [0.2, 0, 0],
    [0.05, 0.05, 0],
  ],
]
const SHELL = 1e-3
const LAW = 0.05
const RULE_CLOSED = 1e-9
const CM_BOOST = 1e-15
const HEAVY_FLOOR = 1e-3
const GALILEAN_FLOOR = 1e-3

type Point = { theta: number; m: number; rule: Band; closed: Band; cStar: number }

function pointAt(theta: number): Point {
  const P = dockMatrix(theta, SWAP_N, true)
  const level = singletLevel(P, DOCK_ROOTS, 12)
  const m = level.m
  const closed = closedBand(m)

  return { theta, m, rule: K => singletEps(P, DOCK_ROOTS, level, K), closed, cStar: longWaveSpeed(closed, m, [1, 0, 0], 1e-3) }
}

const scaled = (p: Point, v: readonly number[]): number[] => v.map(x => (x * p.m) / M_STAR_REF)

function shells(p: Point, E: Band, dirs: readonly (readonly number[])[]): ShellReading[] {
  return COLLISIONS.map(([a, b]) => collisionShell(E, p.m, p.cStar, scaled(p, a), scaled(p, b), dirs))
}

export default experiment({
  id: 'relativity/husk-collision-kinematics',
  code: 'E-RLT-0109',
  title:
    'relativistic collisions of the candidate rule light members, read on the husk, pass: translation invariance and the fixed two-body beat conserve total quasimomentum and quasienergy exactly, and far inside the zone that is the band own energy and momentum; the outgoing shell of every collision is the boosted CM sphere (the Lorentz-contracted ellipsoid) to 7.3e-4 of the energy at boosts up to 0.83 at m 0.046778, and the defect scales as m^2 (ratio 9.3 to 9.4 at m 0.143348), so four-momentum conservation with the rule own E(p) holds exactly in the light limit; a heavy member and a Galilean band fail; where on the shell the pair goes (the contact amplitude) is not computed',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const dirs = huskDirections()
    const chosen = pointAt(Math.PI + ringAngle([3n, 1n], 3).delta)
    const second = pointAt(Math.PI + ringAngle([3n, 1n], 2).delta)
    const heavy = pointAt((4 * Math.PI) / 3)

    // ---------------- gates ----------------
    const rule = shells(chosen, chosen.rule, dirs)
    const closed = shells(chosen, chosen.closed, dirs)
    const B1 = rule.every(r => r.residual <= SHELL)
    const secondRule = shells(second, second.rule, dirs)
    const target = (second.m / chosen.m) ** 2
    const ratios = rule.map((r, i) => (secondRule[i] as ShellReading).residual / r.residual)
    const B2 = ratios.every(x => Math.abs(x / target - 1) <= LAW)

    // B3: the incoming momenta and every predicted outgoing one, well inside the zone
    const farthest = Math.max(...rule.map(r => r.reach))
    const B3 = farthest < Math.PI / 2

    // ---------------- instrument ----------------
    const ruleClosed = Math.max(...rule.map((r, i) => Math.abs(r.residual - (closed[i] as ShellReading).residual)))
    // the CM k* against the incoming momentum is the lattice defect itself (reported); the boost there must vanish
    const cmGap = Math.abs((rule[0] as ShellReading).kStar - (0.02 * chosen.m) / M_STAR_REF)
    const cmBoost = (rule[0] as ShellReading).boost
    const instrument = ruleClosed <= RULE_CLOSED && cmBoost <= CM_BOOST

    // ---------------- controls ----------------
    const heavyRule = shells(heavy, heavy.rule, dirs)
    const C1 = (heavyRule[2] as ShellReading).residual > HEAVY_FLOOR
    const galilean: Band = K => chosen.m + (chosen.cStar * chosen.cStar * ((K[0] as number) ** 2 + (K[1] as number) ** 2 + (K[2] as number) ** 2 + (K[3] as number) ** 2)) / (2 * chosen.m)
    const galileanShell = shells(chosen, galilean, dirs)
    const C2 = (galileanShell[2] as ShellReading).residual > GALILEAN_FLOOR
    const controls = C1 && C2

    const status = !instrument || !controls ? 'partial' : B1 && B2 && B3 ? 'pass' : 'fail'
    const flag = (b: boolean): number => (b ? 1 : 0)
    const metrics: Record<string, number> = {
      B1: flag(B1),
      B2: flag(B2),
      B3: flag(B3),
      instrument: flag(instrument),
      C1: flag(C1),
      C2: flag(C2),
      mStar: chosen.m,
      cStar: chosen.cStar,
      residualCM: (rule[0] as ShellReading).residual,
      residual035: (rule[1] as ShellReading).residual,
      residual054: (rule[2] as ShellReading).residual,
      residual083: (rule[3] as ShellReading).residual,
      boostMax: (rule[3] as ShellReading).boost,
      lawTarget: target,
      lawMin: Math.min(...ratios),
      lawMax: Math.max(...ratios),
      farthestReach: farthest,
      ruleClosed,
      cmGap,
      cmBoost,
      heavyResidual054: (heavyRule[2] as ShellReading).residual,
      galileanResidual054: (galileanShell[2] as ShellReading).residual,
      seconds: (Date.now() - started) / 1000,
    }
    const row = (xs: ShellReading[]): string => xs.map(r => `boost ${r.boost.toFixed(4)} sqrt s/2m ${(r.sqrtS / 2).toFixed(6)} k* ${r.kStar.toFixed(6)} residual ${r.residual.toExponential(3)}`).join('; ')

    return verdict({
      status,
      claim: `at m* ${chosen.m.toFixed(6)} (c* ${chosen.cStar.toFixed(9)}) on the rule's band, husk momenta: B1 ${B1} (residual at the boosted CM sphere ${rule.map(r => r.residual.toExponential(2)).join(', ')} at boosts ${rule.map(r => r.boost.toFixed(3)).join(', ')}); B2 ${B2} (k = 2 over chosen ${ratios.map(x => x.toFixed(4)).join(', ')} against ${target.toFixed(4)}); B3 ${B3} (largest |K . r| ${farthest.toFixed(4)} against pi/2); instrument ${instrument} (rule against closed ${ruleClosed.toExponential(2)}, CM boost ${cmBoost.toExponential(2)}; the CM k* read back relativistically is ${cmGap.toExponential(2)} from the incoming momentum, the lattice defect); controls C1 ${C1} (heavy ${(heavyRule[2] as ShellReading).residual.toExponential(2)}), C2 ${C2} (Galilean ${(galileanShell[2] as ShellReading).residual.toExponential(2)})`,
      metrics,
      control: { C1: flag(C1), C2: flag(C2), instrument: flag(instrument) },
      notes: `L1 and L2. B3 reads |K . r| ${rule.map(r => r.reach.toFixed(4)).join(', ')} per collision over p1, p2 and every predicted p3, p4. Chosen point: ${row(rule)}. k = 2 point (m ${second.m.toFixed(6)}): ${row(secondRule)}. Heavy point (m ${heavy.m.toFixed(6)}): ${row(heavyRule)}. Galilean band: ${row(galileanShell)}. Husk momenta ${husk([1, 0, 0]).join(',')} and ${dirs.length} CM directions. ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
