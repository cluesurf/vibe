// UNDER THE CLIFFORD REGISTER, DOES THE GRAVITON SHARE MATTER'S LIGHT SPEED, NOW c/4? (E-GRV-0145). E-GRV-0141 found that
// the full dock slide ties the cross polarization's speed to the slide's own c, and E-SPN-0145 re-read it with the slide
// at c* = c/2 (a residue mod p), the one light speed of the slot rule, so the graviton moved at c/2 with matter. E-SPN-0160
// gave light members a Clifford register (Cl+(4), 8 components) to close the flat-band channels, and a theorem followed:
// a partner with no transverse states captures exactly a quarter of the stream, so matter's light speed is c/4. This file
// asks whether gravity's speed follows it, or whether the model now has two limiting speeds.
//
// DERIVED BEFORE THE RUN (code/measure/register-graviton, code/measure/slide-speed; c = sqrt 2 per beat, one root a beat).
// 1. WHAT SETS THE GRAVITON'S SPEED. E-GRV-0141's tie is algebraic: the Fierz-Pauli kernel the full slide forces has the
//    cross polarization's gradient equal to -c_s^2 times its inertia, c_s the speed the slide carries (x^0 = c_s t). c_s
//    enters only as a residue, so the algebra holds at any c_s (E-SPN-0145 read it at 1/2). The algebra does not say which
//    c_s is physical. The slide is the transport of the metric perturbation, and the metric here is read from the rule's
//    own counts (the depth and its register, E-GRV-0119, E-GRV-0144), so what transports it is what transports the counts:
//    the rule's excitations. Their weight (energy) front moves at the largest group speed any band reaches, not at the
//    stream's support front c, which carries no weight beyond it (E-SPN-0145 X1b: the weight beyond c* t falls to 1e-4).
//    So c_s is the largest group speed over every band of the rule.
// 2. UNDER THE REGISTER EVERY BAND IS THE DIRAC BAND OR FLAT (E-SPN-0160 point 4, exact): of a member's 192 bands, 16 are
//    the 2 x 2 walk cos E = cos M - 2 cos^2(M/2) g^2 (8 copies each way), whose speed is at most c/4 and reaches c/4 as K
//    -> 0 in the massless limit, and 176 are flat at phase 0 at every K (speed 0). No band moves at c/2. So the largest
//    group speed of the register rule is exactly c/4, reached by the massless member, and c_s = c/4: THE SLIDE CARRIED AT
//    c/4 PUTS THE GRAVITON AT c/4, and one limiting speed survives. The slot rule's c/2 (E-SPN-0145) is the slot rule's,
//    not a second speed of this one.
// 3. NO REGISTER KEEPS c/2 WITHOUT TRANSVERSE STATES (L1). For a register of any size n built from the Clifford maps,
//    the partner overlap is T = <E(eta) | X_u S_k> = c0 sum_d (u . r_d) gamma(r_d) = 12 c0 gamma(u) (sum_d r_d r_d^T = 12
//    on the D4 roots), so T^T T = 144 c0^2 |u|^2 = |u|^2 / 8 on every register vector (the Clifford relation), against
//    |X_u S_k|^2 = |u|^2 / 2: the share is 1/4 whatever n, the even forms (8) and the whole algebra (16) alike. A partner
//    that takes the whole stream (share 1, speed c/2) is the vector Pi4 (x) 1, which carries transverse states, which
//    E-SPN-0159 proved pin a channel open. So c/2 and a closed census cannot coexist on a covariant partner: the register
//    rule's one speed is c/4, and the graviton must move at c/4 with it. If the slide were read at c/2 while matter moves
//    at c/4, the tie at c/2 would fail on the register rule's own speed (the control).
// 4. WHAT IS NOT DECIDED. The many-body rule with registers is not written, so the count field that is the metric is not
//    run under it here; the identification in point 1 (the slide is carried by the excitations whose counts are the
//    metric) is the model's reading, argued, and the gates measure its two premises: the slide algebra at c/4, and the
//    largest group speed of every band.
//
// PREDICTED: Y1, Y2, Y3 hold and every control holds. Verdict pass.
//
// GATES, fixed before the gate run.
//  Y1 THE SLIDE AT c/4: E-GRV-0141's Y2 reading of the full slide with its speed residue 1/4 mod p (both primes, 2^25
//     and 2^24 below): the axis inertia rank 1, (mu, gamma) rank 1, gamma + c^2 mu rank 0, mixing rank 0, and the face
//     diagonal the same (slideTied speedAtC).
//  Y2 EVERY BAND OF THE REGISTER RULE AT MOST c/4: over 256 Weyl momenta and 20 radial ones, all 192 bands' Hellmann-
//     Feynman speeds per beat at the light point (u = ringUnit(-1, 4)) and the massless point (u = -1) at most c/4 (1 +
//     1e-6); the bands at phase 0 (1e-7) at most 1e-9; AND c/4 IS REACHED: the massless point's largest speed at |K| =
//     1e-3 along the four directions at least c/4 (1 - 1e-5).
//  Y3 THE CAPTURE ON BOTH REGISTERS: the even forms (8) and the whole algebra (16), over 64 Weyl directions: the Clifford
//     relation exact (gap 0), the partner basis orthonormal (1e-12) and orthogonal to the singlet (1e-12), the share 1/4
//     (1e-12) and both Clifford sides multiples of the identity (1e-12).
// CONTROLS (a failure makes the verdict partial). C1 THE TIE AT THE WRONG SPEED FAILS: the slide at 1/4 read with the tie
//  at 1/2 leaves gamma + c^2 mu nonzero (tied rank 1) on both primes. C2 THE c/2 READING STILL HOLDS: E-SPN-0145's slide at
//  (p + 1)/2 passes on both primes (the algebra follows the speed it is given). C3 THE SLOT RULE IS AT c/2: the swap
//  coin's massless pair on the 24 slots (the doubled one-beat, E-SPN-0159's reader) has c0 = c/2 (1e-9). C4 THE VECTOR
//  PARTNER TAKES THE WHOLE STREAM: share 1 (1e-12).
// READ, gating nothing: the light point's largest speed over c/4, the flat bands' largest speed, the largest Clifford
//  side gap.
// Verdict: fail if Y1, Y2 or Y3 fails; partial if a control fails; pass otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them). tmp/rmh-grv-smoke.log: every code path on a small
//  plan (16 Weyl momenta, 4 directions, one prime; 315 s, gating nothing): Y1 (mu 1, pair 1, tied 0, mixing 0, face
//  1/1/0/0 at the residue 1/4), Y2 (light 0.4933 of c/4, massless 0.99999956, flat bands 1.6e-16), Y3 on both registers
//  (share gap 2.2e-16), C1 to C4 held. Its timing set the gate plan's momenta at 256 (from 512) before the gate run.
//
// FIRST RUN (tmp/rmh-grv-run1.log, 1,990 s): PASS, as predicted. No gate moved and none was rerun.
//  - Y1: the full slide at the residue 1/4 (25165795 mod 33554393, 12582910 mod 16777213): mu 1, (mu, gamma) 1, tied 0,
//    mixing 0, and the face 1/1/0/0 on both primes: the graviton at c/4.
//  - Y2: over 276 momenta and all 192 bands, the largest speed 0.606 of c/4 at the light point and 0.99999956 at the
//    massless one; the flat bands 1.6e-16; at |K| 1e-3 the massless point reaches 0.99999956 of c/4 on every direction.
//  - Y3: both registers (8 and 16): the Clifford relation exact, the partner orthonormal (6.7e-16) and off the singlet
//    (0), the share 1/4 to 3.3e-16, both Clifford sides to 1.3e-16.
//  - C1: the 1/4 slide read with the tie at 1/2 fails (tied rank 1, both primes). C2: the slide at 1/2 still passes.
//    C3: the slot rule's massless c0 is c/2 to 2e-12. C4: the vector partner's share 1 to 6.7e-16.
// NEXT. The count field that IS the metric, run under the register's many-body rule (not written, E-SPN-0160 point 7
//  (iii)): the identification of point 1 is argued here and its two premises are measured. And every reading
//  calibrated on c* = c/2 (the graviton slide, the Newton constant's units, E-GRV-0141 and E-SPN-0145) is read again at
//  c/4 if the register rule replaces the slot rule.
//
// Depth L1 (the capture on any Clifford register, the residue algebra) and L2 (the bands of the register walk, read off
// the rule's exact pieces). DETERMINISM: no random numbers; Weyl sequences and fixed directions. NOTHING MOVES: the pieces
// hand values between slots and register components of one dock, the stream takes each slot's value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { primeBelow } from '@/code/algebra/linear/modular-linear'
import { wrap } from '@/code/measure/dock-mixer'
import { covariantDock, covariantProjectors } from '@/code/measure/odd-phase'
import { weylMomenta } from '@/code/measure/singlet-kinematics'
import { slideTied } from '@/code/measure/slide-speed'
import { cycleBand } from '@/code/measure/swap-cone'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { cycleMasslessPair } from '@/code/measure/two-beat'
import { partnerProjector48, REGISTER_ROOTS, registerPiece, scaled, singletProjector24, weylDirections } from '@/code/measure/spinor-register'
import { captureOf, cliffordGap, inverseMod, partnerChecks, vectorShare, type Register } from '@/code/measure/register-graviton'

const C = Math.SQRT2
const C_HALF = C / 2
const C_QUARTER = C / 4
const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const GENERIC_RAW = [0.29, 0.52, 0.8, 0]
const GENERIC = GENERIC_RAW.map(x => x / Math.hypot(...GENERIC_RAW))
const DIRS: readonly number[][] = [[1, 0, 0, 0], [s2, s2, 0, 0], [s3, s3, s3, 0], GENERIC]
const RADII: readonly number[] = [1e-3, 1e-2, 0.1, 0.3, 1]
const SPEED_TOLERANCE = 1e-6
const REACH_TOLERANCE = 1e-5
const FLAT_PHASE = 1e-7
const FLAT_SPEED = 1e-9
const EXACT = 1e-12
const PAIR_KAPPA = 0.01
const SLOT_TOLERANCE = 1e-9
const REACH_K = 1e-3

export type GravitonPlan = { momenta: number; directions: number; primes: number }

export const GATE_PLAN: GravitonPlan = { momenta: 256, directions: 64, primes: 2 }

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gravity/register-graviton-speed',
  code: 'E-GRV-0145',
  title:
    'under the Clifford register the graviton shares matter\'s one light speed, now c/4: every one of a member\'s 192 bands is the Dirac band (at most c/4, reaching c/4 massless) or flat, so the rule\'s largest group speed is c/4 and the full slide carried at c/4 ties the cross polarization to c/4 on both primes; the capture of a partner with no transverse state is 1/4 on the even register (8) and the whole algebra (16) alike, so no register keeps c/2 with a closed census, and the slot rule\'s c/2 is the slot rule\'s, not a second speed; the tie read at the wrong speed fails',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return registerGravitonRun(GATE_PLAN)
  },
})

const unitValue = (angle: number): [number, number] => [Math.cos(angle), Math.sin(angle)]

export function registerGravitonRun(plan: GravitonPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

  // ---------------- Y1, C1, C2: the slide's residues ----------------
  const primes = [primeBelow(2 ** 25), primeBelow(2 ** 24)].slice(0, plan.primes)
  const quarter = primes.map(p => slideTied(inverseMod(4, p), p))
  const wrongTie = primes.map(p => slideTied(inverseMod(4, p), p, inverseMod(2, p)))
  const half = primes.map(p => slideTied((p + 1) / 2, p))
  const Y1 = quarter.every(s => s.speedAtC)
  const C1 = wrongTie.every(s => s.tied === 1)
  const C2 = half.every(s => s.speedAtC)

  log('Y1 C1 C2')

  // ---------------- Y2: every band's speed ----------------
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const schedule = (angle: number) => {
    const [a, b] = unitValue(angle)

    return [registerPiece(qS, [a, b]), registerPiece(qD, [a, -b])]
  }
  const light = schedule(unitAngle(ringUnit(-1, 4)))
  const massless = schedule(unitAngle(ringUnit(0, 3)))
  const momenta = [...weylMomenta(plan.momenta), ...DIRS.flatMap(u => RADII.map(r => u.map(x => x * r)))]
  let topLight = 0
  let topMassless = 0
  let flatTop = 0

  for (const K of momenta) {
    for (const [which, Ps] of [
      ['light', light],
      ['massless', massless],
    ] as const) {
      const b = cycleBand(Ps, REGISTER_ROOTS, K)

      b.phase.forEach((ph, j) => {
        const v = Math.hypot(...(b.velocity[j] as number[]))

        if (Math.abs(wrap(ph)) <= FLAT_PHASE) flatTop = Math.max(flatTop, v)
        if (which === 'light') topLight = Math.max(topLight, v)
        else topMassless = Math.max(topMassless, v)
      })
    }
  }

  const reach = Math.min(
    ...DIRS.map(u => {
      const b = cycleBand(massless, REGISTER_ROOTS, u.map(x => x * REACH_K))

      return Math.max(...b.velocity.map(v => Math.hypot(...v)))
    }),
  )
  const Y2 = topLight <= C_QUARTER * (1 + SPEED_TOLERANCE) && topMassless <= C_QUARTER * (1 + SPEED_TOLERANCE) && flatTop <= FLAT_SPEED && reach >= C_QUARTER * (1 - REACH_TOLERANCE)

  log('Y2')

  // ---------------- Y3, C4: the capture on both registers ----------------
  const dirs = weylDirections(plan.directions)
  const registers: Register[] = ['even', 'whole']
  const reads = registers.map(reg => {
    const caps = dirs.map(u => captureOf(reg, u))
    const checks = partnerChecks(reg)

    return {
      reg,
      clifford: cliffordGap(reg),
      orthonormal: checks.orthonormal,
      singlet: checks.singlet,
      shareGap: Math.max(...caps.map(c => Math.abs(c.share - 0.25))),
      sides: Math.max(...caps.map(c => Math.max(c.sideS, c.sideD))),
    }
  })
  const Y3 = reads.every(r => r.clifford === 0 && r.orthonormal <= EXACT && r.singlet <= EXACT && r.shareGap <= EXACT && r.sides <= EXACT)
  const vector = Math.max(...dirs.map(u => Math.abs(vectorShare(u) - 1)))
  const C4 = vector <= EXACT

  log('Y3 C4')

  // ---------------- C3: the slot rule at c/2 ----------------
  const one = covariantDock(covariantProjectors(), [Math.PI, 0, 0, 0, 0])
  const slotPairs = DIRS.map(u => cycleMasslessPair([one, one], 0, u, PAIR_KAPPA))
  const C3 = slotPairs.every(x => Math.abs(x.c0 / C_HALF - 1) <= SLOT_TOLERANCE)

  log('C3')

  const hard = Y1 && Y2 && Y3
  const controls = C1 && C2 && C3 && C4
  const status = !hard ? 'fail' : !controls ? 'partial' : 'pass'
  const tieLine = (s: ReturnType<typeof slideTied>): string => `mu ${s.mu} pair ${s.pair} tied ${s.tied} mixing ${s.decoupled} face ${s.faceMu}/${s.facePair}/${s.faceTied}/${s.faceDecoupled}`

  return verdict({
    status,
    claim: `Y1 ${Y1} (slide at 1/4: ${quarter.map(tieLine).join('; ')}); Y2 ${Y2} (largest speed over c/4: light ${(topLight / C_QUARTER).toFixed(9)}, massless ${(topMassless / C_QUARTER).toFixed(9)}, flat bands ${flatTop.toExponential(2)}, massless at |K| 1e-3 ${(reach / C_QUARTER).toFixed(9)}); Y3 ${Y3} (${reads.map(r => `${r.reg}: Clifford ${r.clifford}, orthonormal ${r.orthonormal.toExponential(2)}, singlet ${r.singlet.toExponential(2)}, share - 1/4 ${r.shareGap.toExponential(2)}, sides ${r.sides.toExponential(2)}`).join('; ')}); controls C1 ${C1} (tie at 1/2 on the 1/4 slide: ${wrongTie.map(s => s.tied).join(', ')}) C2 ${C2} C3 ${C3} (slot c0 / (c/2) ${slotPairs.map(x => (x.c0 / C_HALF).toFixed(12)).join(' ')}) C4 ${C4} (vector share - 1 ${vector.toExponential(2)})`,
    metrics: {
      Y1: flag(Y1),
      Y2: flag(Y2),
      Y3: flag(Y3),
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      C4: flag(C4),
      topLightOverQuarter: topLight / C_QUARTER,
      topMasslessOverQuarter: topMassless / C_QUARTER,
      reachOverQuarter: reach / C_QUARTER,
      flatTop,
      evenShareGap: (reads[0] as { shareGap: number }).shareGap,
      wholeShareGap: (reads[1] as { shareGap: number }).shareGap,
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: flag(C1), C2: flag(C2), C3: flag(C3), C4: flag(C4) },
    notes: `L1 and L2. Primes ${primes.join(', ')}, 1/4 residues ${primes.map(p => inverseMod(4, p)).join(', ')}. Slide at 1/2: ${half.map(tieLine).join('; ')}. ${momenta.length} momenta, light m ${(wrap(unitAngle(ringUnit(-1, 4)) - Math.PI) / 2).toFixed(6)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
