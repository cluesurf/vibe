// Light by threshold counting, first order (E-FRC-0203): the U(1) sector with no sine table, no rounding and
// no real number in the rule (code/rule/photon-count `first`).
//
// The user's rule of 2026-09-26: the base has no continuity and no rounding. A coupling is 1/Q, paid by an
// integer counter that takes the integer drive and emits one unit per threshold Q crossed, keeping the rest.
// Cycling numbers are allowed (the user, the same day), so the U(1) stays compact: the angle is a cycling
// number mod N = 8192, as in E-FRC-0164 to E-FRC-0185. The force is linear in the loop sum B (its centered
// residue mod N), with no table: each plaquette's counter mod Q takes B and the number of times it wraps is
// the kick, f = (r + B) >> 4, r' = (r + B) & 15. Written as Fredkin's second-order form
// A_(t+1) = 2 A_t - A_(t-1) - C^T f mod N the same beat is invertible for any force, and it is the same orbit.
//
// Q, chosen before the run: Q = 16, kappa = 1/16 = 0.0625. Three reasons, in order. (1) It is the integer
// reciprocal nearest the committed 2 pi K / N = 0.06136 (1/16 is 1.9 percent above it, 1/17 is 4.1 percent
// below). (2) The curl-curl operator's largest eigenvalue on the D4 box is exactly 16 (E-FRC-0180), so Q = 16
// puts the top of the band at kappa lambda_max = 1, 4 sin^2(omega/2) = 1, omega = pi/3: the stiffest mode is
// exactly periodic with period 6 beats, and Q = 16 is the smallest Q with every kappa lambda <= 1, which is
// what E-FRC-0204's theorem needs. (3) Q = 2^4, so the counter is the low 4 bits of an adder and the kick its
// carry out: the rule is shifts and masks, with no division at all.
//
// Predictions, fixed before the run (the carried error is (1 - z) u with u = r/Q in [0, 1), the E-FRC-0181
// error at a coarser grain, so its numbers are the reference):
// - A, A4, L pass by construction
// - B fails at small |B|: from the Weyl counter start E-FRC-0181 read 0.17 percent at |B| 1 to 8, above 1e-3
// - C passes: E-FRC-0181 read every wave at |B| 16 to 1024 within 1.3e-4
// - D fails: the first-order error drives every husk branch (E-FRC-0181 lagged +25.6 percent)
// - F fails: E-FRC-0181's drift ratio was 0.63 against the bound 0.01
//
// Choices, fixed before the run: N = 2^13, Q = 2^4, the counters start from an integer Weyl sequence (the top
// 4 bits of (p + 1) 40503 mod 2^16, the golden rate, as E-FRC-0181 started its remainders), the zero start
// reported beside at |B| 1, 4, 8. Boxes: side 8 for B, C, D, F, side 4 and 5 for A, as E-FRC-0185.
//
// Gates, fixed before the run:
// A  exact integer reversibility: the counter arithmetic exhaustively (every B in -4096 .. 4095 against every
//    counter value), the lattice 2,000 beats forward and back on side 4 and 500 on side 5 with 0 mismatches,
//    Gauss's law exact on every beat, and a frame change that commutes with the beat
// A4 Fredkin's second-order form runs the same orbit: 0 mismatches against the leapfrog on every beat, restored
//    exactly when run back, Gauss's law mod N
// L  no float or trig in the rule: the E-MTH-0025 scan of code/rule/photon-count and its value imports finds
//    nothing, integer divisions included
// B  coherent husk waves at m1, peak |B| 1 to 8: the raw flux within 1e-3 of the symbol at kappa = 1/16
// C  every coherent husk wave at |B| 16 to 1024 (4 modes, both polarizations) within 1e-3
// D  the hot husk photon: the lagged estimator (at least one light branch) and the autocorrelation zero
//    crossing within 2 percent
// F  no heating on the hot start: |energy drift| at most 0.01 of the E-FRC-0164 table rule's
// Status: pass if every gate passes, partial if A, A4 and L pass, fail otherwise.
//
// Depth L2: the force derived as an exact carry, measured against the exact linear symbol.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { hotHusk, sectionA, sectionBC, sectionF, sectionL, sectionS } from '@/code/measure/photon-count-battery'

export default experiment({
  id: 'gauge/photon-count-first',
  code: 'E-FRC-0203',
  title:
    'light by threshold counting: the compact U(1) sector with a force linear in the loop sum, kappa = 1/16 paid by a counter mod 16 per plaquette whose wraps are the kick, no sine, no rounding and no real number in the rule, the leapfrog and Fredkin second-order forms compared bit for bit, tested on the light battery',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const a = sectionA('first')
    const l = sectionL()
    const bc = sectionBC('first', { bound: 1e-3, read: 'raw', dither: 'weyl', other: 'zero' })
    const d = hotHusk('first', 'd', 8, 'weyl')
    const d0 = hotHusk('linear', 'd0Linear', 8, 'zero')
    const f = sectionF('first', { bound: 0.01, dither: 'weyl' })
    const s = sectionS('first', 'weyl')
    const okA4 = (a['a4FredkinMismatches'] ?? 1) === 0 && (a['a4FredkinRestored'] ?? 0) === 1 && (a['a4FredkinGaussViolations'] ?? 1) === 0
    const okD = (d['dLaggedLightBranches'] ?? 0) >= 1 && Math.abs(d['dLaggedOverExact'] ?? 1) < 0.02 && Math.abs(d['dDirectOverExact'] ?? 1) < 0.02
    const gates = { A: a.ok, A4: okA4 ? 1 : 0, L: l.ok, B: bc.okB, C: bc.okC, D: okD ? 1 : 0, F: f.okF }
    const strip = (r: Record<string, number>): Record<string, number> => Object.fromEntries(Object.entries(r).filter(([key]) => !key.startsWith('ok')))

    for (const [gate, ok] of Object.entries(gates)) {
      metrics[`gate${gate}`] = ok
    }

    metrics['lFilesScanned'] = l.files
    metrics['lFindings'] = l.findings.length

    return verdict({
      status: Object.values(gates).every(x => x === 1) ? 'pass' : a.ok === 1 && okA4 && l.ok === 1 ? 'partial' : 'fail',
      claim:
        'with kappa = 1/16 paid by a counter mod 16 per plaquette the compact U(1) beat is an exact integer bijection with Gauss exact and no real number in the rule, Fredkin second-order form runs the same orbit, and the light battery passes: husk waves within 1e-3 of the symbol at |B| 1 to 1024, the hot husk photon within 2 percent, no heating',
      metrics: { ...metrics, ...strip(a), ...strip(bc), ...strip(d), ...strip(d0), ...strip(f), ...strip(s) },
      control: {
        linearHuskLaggedOverExact: d0['d0LinearLaggedOverExact'] ?? -1,
        linearHuskDirectOverExact: d0['d0LinearDirectOverExact'] ?? -1,
        e164Drift: f['fE164Drift'] ?? -1,
        linearDrift: f['fLinearDrift'] ?? -1,
      },
      notes:
        'L2, integers and bit operations only in the rule, deterministic (integer Weyl and zero counter starts, golden-hashed field starts, no seeds). First run 2026-09-26 (tmp/frc0203.log, 119 s), PARTIAL by the status rule: B and F fail. Passes: A (every B in -4096 .. 4095 against every counter value, 131,072 cases, 0 failures; 0 mismatches after 2,000 beats back on side 4 and 500 on side 5; 0 Gauss violations; 0 frame mismatches over 48 beats), A4 (Fredkin second-order form: 0 mismatches against the leapfrog on every beat of both boxes, restored exactly when run back, Gauss exact mod N), L (the rule and its value imports: 1 file, 0 findings of any kind), C (every husk wave at |B| 16 to 1024 within 1.9e-4 of the symbol at kappa = 1/16, where E-FRC-0181 read 1.3e-4), D (the hot husk photon: lagged +1.70 percent with 1 light branch of 8, direct +0.38 percent; the linear control reads -0.31 and -0.008 percent; E-FRC-0181 on this side-8 protocol read +12.2 and +2.6 according to E-FRC-0185, so the counter mod 16 does better than the fine remainder here, and D passing was NOT predicted: the header predicted a fail). Fails: B, the small waves from the Weyl counter start read +0.28, +0.19, +0.12, +0.14, +0.10 percent at |B| 1 to 5 (under 1e-3 from |B| 5 up: 5.5e-4 at 6, 3.0e-4 at 8), as predicted from E-FRC-0181; from the zero counter start the error is coherent with the wave and far larger (+139, +30, +6.9 percent at |B| 1, 4, 8), the E-FRC-0185 raw effect. F, the energy drift on the hot start is 0.0096 against the E-FRC-0164 rule\'s 0.0160 (ratio 0.60, bound 0.01), as E-FRC-0181\'s 0.63: the first-order carry kicks every branch. Reported: 0 seam crossings on the hot start and on the E-FRC-0164 start (largest |B| 4,082 of the seam\'s 4,096), and the N = 2^16 run is identical to the N = 2^13 run because the seam is never reached; the raw flux departs from the float linear leapfrog by up to 117 flux units over 2,000 beats (the carry\'s kicks accumulate: there is no shadow to read in this form). FREDKIN AGAINST THE COUNTER: they are one automaton (E_t = A_(t+1) - A_t mod N), so every gate reads the same; Fredkin\'s form is the simpler statement of reversibility (one line, for any force) and needs no flux array, the leapfrog form is the simpler statement of Gauss\'s law (exact on stored integers rather than mod N) and of the stream (the flux is the copied quantity). Q = 16 was chosen before the run for the three reasons in the header.',
    })
  },
})
