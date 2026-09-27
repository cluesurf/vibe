// Light by threshold counting, wave-shaped (E-FRC-0205): E-FRC-0185's wave form rebuilt with no rounding
// anywhere, its one rounded term carried by a second counter (code/rule/photon-count `wave`).
//
// E-FRC-0185 fed each plaquette's fresh error back through the leapfrog's own operator,
// 1 - (2 - kappa M) z + z^2, so the shifted field E~ = E + C^T (u_(t-1) - u_(t-2)) was linear light. Two things
// in it were not integer counting: the coupling p/q = 4021/65536 came from round(2 pi K q / N), and the
// spatial term kappa C C^T u_(t-1) was rounded to 1/q every beat. Here the coupling is exactly 1/Q = 1/16
// (E-FRC-0203 says why), the fresh error is carried on a counter D mod 2^16 (four base-16 digits, the top one
// the plain counter of E-FRC-0203), and the spatial term's integer S_p = (C C^T D_(t-1))_p is paid by a second
// counter R mod 16 that emits V = (R + S_p) >> 4 and keeps (R + S_p) & 15. So the kick is
//
//   f_t = B_t/16 + d_t - 2 d_(t-1) + d_(t-2) + (1/16) C C^T d_(t-1) + (rho_(t-1) - rho_t) / 2^16
//
// with d = D / 2^16 and rho = R / 16, every term exact. The shadow E~ obeys the linear leapfrog at kappa = 1/16
// exactly, forced only by the second counter's carry C^T (rho_t - rho_(t-1)) / 2^16: bounded by 2^-16 flux per
// plaquette-beat, first-order shaped, never dropped. It cannot be zero (E-FRC-0204: no rule with bounded
// integer state shadows linear light exactly at a stable kappa = 1/Q), so "exactly linear with no rounding"
// is met as: no rounding anywhere, linear to a carried remainder of 2^-16.
//
// Compact, as the user allowed on 2026-09-26: angles mod N = 8192. The only nonlinearity left is the seam
// at |B| = N/2, where the centered residue jumps by N and the kick by N/Q = 512 flux units: a lattice monopole
// (a Dirac string crossing the plaquette). Section S counts seam crossings at N = 2^13 and 2^16.
//
// Predictions, fixed before the run:
// - A, A4, L pass by construction
// - B, C read in E~ pass: a probe at |B| 1, 4 and 64 read the shadow within 3.7e-7, 1.9e-7 and 9e-11 (a
//   probe, disclosed: those three numbers were seen before these gates were written, the bound 1e-3 is the
//   caller's). The raw flux fails small waves as E-FRC-0185's did (the probe: +547 percent at |B| 1)
// - D read in E~ passes, as E-FRC-0185's shadow read -0.05 percent; the raw lagged estimator fails
// - F passes: no resonant kick (E-FRC-0185's drift ratio 3.5e-4, bound 0.01)
// - S: the shadow tracks the float linear leapfrog at kappa = 1/16 within 0.01 flux units over 2,000 beats on
//   the hot start (no seam crossed; E-FRC-0185's rounded version read 0.0022) and on the E-FRC-0164 start at
//   N = 2^16; at N = 2^13 that rough start crosses the seam and departs where it does
//
// Choices, fixed before the run: N = 2^13, Q = 2^4, four digits (2^16), every counter starts at zero (the
// start at which the shadow run is the linear run from the same integer start). Boxes as E-FRC-0203.
//
// Gates, fixed before the run:
// A, A4, L  as E-FRC-0203
// B  coherent husk waves at m1, peak |B| 1 to 8, read in E~, within 1e-3 of the symbol at kappa = 1/16
// C  every coherent husk wave at |B| 16 to 1024 (4 modes, both polarizations), read in E~, within 1e-3
// D  the hot husk photon read in E~: the lagged estimator (at least one light branch) and the autocorrelation
//    zero crossing within 2 percent
// F  no heating on the hot start: |raw energy drift| at most 0.01 of the E-FRC-0164 table rule's
// Status: pass if every gate passes, partial if A, A4 and L pass, fail otherwise. The raw readings of B, C
// and D and all of S are reported, not gated.
//
// Depth L2: an error-feedback counter whose noise transfer function is the leapfrog's own operator, every
// term carried, measured against the exact linear theory.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { hotHusk, sectionA, sectionBC, sectionF, sectionL, sectionS } from '@/code/measure/photon-count-battery'

export default experiment({
  id: 'gauge/photon-count-wave',
  code: 'E-FRC-0205',
  title:
    "light by threshold counting, wave-shaped: each plaquette's carried error fed back through the leapfrog's own operator with the spatial term paid by a second counter instead of rounded, kappa = 1/16, compact angles mod 8192, so the shadow field is linear light to a carried remainder of 2^-16 with no rounding and no real number in the rule, tested on the light battery",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const a = sectionA('wave')
    const l = sectionL()
    const bc = sectionBC('wave', { bound: 1e-3, read: 'shadow', dither: 'zero' })
    const d = hotHusk('wave', 'd', 8, 'zero')
    const d0 = hotHusk('linear', 'd0Linear', 8, 'zero')
    const f = sectionF('wave', { bound: 0.01, dither: 'zero' })
    const s = sectionS('wave', 'zero')
    const okA4 = (a['a4FredkinMismatches'] ?? 1) === 0 && (a['a4FredkinRestored'] ?? 0) === 1 && (a['a4FredkinGaussViolations'] ?? 1) === 0
    const okD = (d['dShadowLaggedLightBranches'] ?? 0) >= 1 && Math.abs(d['dShadowLaggedOverExact'] ?? 1) < 0.02 && Math.abs(d['dShadowDirectOverExact'] ?? 1) < 0.02
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
        'with the carried error fed back through the leapfrog operator and the spatial term paid by a second counter, the compact U(1) beat at kappa = 1/16 is an exact integer bijection with Gauss exact and no real number in the rule, Fredkin form runs the same orbit, and read in the shadow field the light battery passes: husk waves within 1e-3 of the symbol at |B| 1 to 1024, the hot husk photon within 2 percent, no heating',
      metrics: { ...metrics, ...strip(a), ...strip(bc), ...strip(d), ...strip(d0), ...strip(f), ...strip(s) },
      control: {
        linearHuskLaggedOverExact: d0['d0LinearLaggedOverExact'] ?? -1,
        linearHuskDirectOverExact: d0['d0LinearDirectOverExact'] ?? -1,
        e164Drift: f['fE164Drift'] ?? -1,
        linearDrift: f['fLinearDrift'] ?? -1,
      },
      notes:
        'L2, integers and bit operations only in the rule, deterministic (zero counter starts, golden-hashed field starts, no seeds). First run 2026-09-26 (tmp/frc0205.log, 308 s), PASS on every gate. A: the counters exhaustively, every B in -4096 .. 4095 against every D_(t-2) in 0 .. 65535 with D_(t-1) and R on integer Weyl sequences, 536,870,912 cases, 0 failures; 0 mismatches after 2,000 beats back on side 4 and 500 on side 5; 0 Gauss violations; 0 frame mismatches. A4: Fredkin second-order form 0 mismatches against the leapfrog on every beat, restored exactly, Gauss exact mod N. L: 1 file, 0 findings. B read in E~: |B| 1 to 8 within 3.7e-7 of the symbol at kappa = 1/16 (E-FRC-0185: 2.3e-6). C read in E~: every wave at |B| 16 to 1024 within 3.9e-8. D read in E~: lagged -0.312 percent with 1 light branch of 3, direct -0.008 percent, identical to 1e-6 with the floating linear control (-0.312, -0.008). F: raw energy drift -1.4e-5 against E-FRC-0164\'s 0.0160, ratio 8.7e-4 (bound 0.01). Reported, not gated: the RAW flux fails small waves as E-FRC-0185\'s did (+547 percent at |B| 1, +73 at 8, up to 52 percent in C) and its lagged estimator reads +13.8 percent with 8 branches (direct -0.08 percent): the bounded non-propagating dither -(w_t - w_(t-1)) of E-FRC-0185, unchanged by carrying the spatial term. S: the shadow tracks the floating linear leapfrog at kappa = 1/16 within 0.0016 flux units over 2,000 beats from the E-FRC-0164 start and 0.0018 from the hot start (E-FRC-0185 with its rounding: 0.0022 on the hot start), the raw flux within 6.6 flux units. SEAM: 0 crossings on either start at N = 2^13 (largest |B| 4,030 and 3,074 of the seam\'s 4,096), so the N = 2^16 run is identical. E-FRC-0185 crossed the seam on the E-FRC-0164 start at kappa 0.0614 and failed S there; at kappa 1/16 the same start stays inside it, so the compact U(1) costs nothing on these protocols. The predictions in the header held, with S better than predicted.',
    })
  },
})
