// The polaron-frame restriction held to the exact rule at N >= 25 (E-FRC-0239). E-FRC-0236 could reach the exact
// register rule only at N <= 11 on six squares (2 N^6 states) and the two-quantum restriction failed there; E-FRC-0237's
// long-ring decay at N = 25 and 49 was never checked against the rule. The ring's physical sector
// (code/measure/ring-reduced: states the uniform shift leaves alone, N^(L-1) per atom site) brings N = 25 and 49
// within reach on short rings. The STAND-IN atom (an electron whose hop around the circumference rung 0's winding
// flux records, code/rule/loop-ring) is run by the exact rule and by the two-quantum restriction in three frames
// (code/measure/polaron-frame): the lab (E-FRC-0236's), Lang-Firsov (the whole static field) and Silbey-Harris (the
// part of it each mode can follow).
//
// DERIVED before the first run (E-FRC-0238's header and tmp/pol-derive.ts, formulas only).
//   (1) resonant emission  With the gap on the ring's lowest mode (k* = 2 pi / L) a short ring gives vacuum Rabi
//                          exchange, the most sensitive test of the coupling's matrix elements. In the
//                          Silbey-Harris frame the per-beat kick keeps sqrt K = 0.05 of its size at N = 25 (lab
//                          0.11) and the dressed hop's Debye-Waller exponent is W = 0.017 to 0.021, so its
//                          truncation drops about 1e-5 per beat: over the 110 to 310 beats it should follow the rule
//                          to the harmonic reading's accuracy (the finite column at N = 25, 49: a vacuum rung reaches
//                          trit depth 6 with probability 3e-4)
//   (2) the dressing's sign  With the gap ABOVE the band (1.5 times its top) every mode is slower than the atom.
//                          Second order in the coupling: |e, 0> meets |g, 1_k> BELOW it and |g, 0> meets |e, 1_k> ABOVE
//                          it, so the dressed gap OPENS (level repulsion; the x-diagonal polaron shift is the same for
//                          both levels since <e|x|e> = <g|x|g> to 1e-2 and cancels). The Lang-Firsov zeroth order
//                          predicts the opposite, a gap CLOSED by e^(-W/2) (its W counts the slow modes, which cannot
//                          follow an atom faster than themselves). So the exact rule's sign decides which dressing is
//                          physical, and hence which Debye-Waller factor belongs in the golden rule
//   (3) the restriction    Every frame's two-quantum restriction holds the one-quantum intermediate states, so each
//                          should reproduce the second-order shift; the Silbey-Harris frame is gated
//
// Gates, fixed before the first run (no dynamics of this construction was run before this file):
// V0 the kernel: E-FRC-0238's P3 (the reduced beat equals the full rule), re-run here on (N, L) = (5, 3), (5, 4) with
//    the resonant atom, within 1e-12 over 5 beats
// V1 resonant emission: on (N, L) = (25, 4), (25, 5), (49, 4), gap at omega(2 pi / L), the pure bare excited atom
//    times the exact vacuum: |P_e(exact rule) - P_e(Silbey-Harris restriction)| <= 0.01 at every beat
//    t <= 4 / Gamma_GR (the bare golden rule's lifetime scale: 114, 157, 312 beats)
// V2 the dressing: on (N, L) = (25, 4), (49, 4), gap = hop nearest 1.5 times the band top, the bare (g + e)/sqrt 2
//    times the exact vacuum, the dressed gap read as minus the slope of the Ramsey phase arg <e|rho|g> over
//    t in [0, 600]: (a) the exact rule's gap exceeds the bare gap at both N; (b) the Silbey-Harris restriction's gap
//    matches the exact rule's within 10 percent of the exact shift at both N
// Reported: V1 and V2 for the lab and Lang-Firsov restrictions; V1 on E-FRC-0236's box (N = 9, 11, L = 6, 40 beats)
//    in all three frames; the zeroth-order gaps of both frames; the restrictions' dropped weights and start losses;
//    the exact vacuum's filter residual.
// Status: pass if V0 to V2 pass; partial if V0 and V1 pass; fail otherwise.
// FIRST RUN 2026-09-26: pass (see notes, including a finding against derivation (2)'s use of zeroth orders).
//
// Depth L2: Wigner-Weisskopf and the Lamb shift of a STAND-IN atom in the model's column registers, exact rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  loopBeat,
  loopKernel,
  loopSplit,
  ringCurl,
  ringOmega,
  ringSpec,
  splitNear,
  type LoopSpec,
} from '@/code/rule/loop-ring'
import { atomBare } from '@/code/measure/quantum-ladder'
import {
  ringAtomSpec,
  stripGoldenRule,
} from '@/code/measure/few-quanta'
import {
  reducedBeat,
  reducedKernel,
  reducedToFull,
} from '@/code/measure/ring-reduced'
import {
  exactAtomRun,
  ramseyGap,
  reducedVacuum,
  restrictedAtomRun,
  restrictedFrame,
  type Atom,
} from '@/code/measure/polaron-runs'
import { weyl } from '@/code/tool/weyl'

const KINDS = ['lab', 'lang-firsov', 'silbey-harris'] as const
const KEY = {
  lab: 'Lab',
  'lang-firsov': 'LF',
  'silbey-harris': 'SH',
} as const
const RAMSEY = 600

const ladderShape = (spec: LoopSpec) => ({
  n: spec.n,
  plaquettes: spec.squares,
  root: spec.root,
  drift: spec.drift,
  force: spec.force,
  hop: spec.hop!,
})

function kernelCheck(spec: LoopSpec): number {
  const red = reducedKernel(spec, { withAtom: true })
  const full = loopKernel(spec)
  const re = new Float64Array(red.size)
  const im = new Float64Array(red.size)

  for (let i = 0; i < red.size; i++) {
    re[i] = weyl(3 * i + 1) - 0.5
    im[i] = weyl(3 * i + 2) - 0.5
  }

  const f = reducedToFull(spec, re, im, 2)

  let worst = 0

  for (let t = 0; t < 5; t++) {
    reducedBeat(red, re, im)
    loopBeat(full, f.re, f.im)

    const back = reducedToFull(spec, re, im, 2)

    for (let i = 0; i < f.re.length; i++) {
      worst = Math.max(
        worst,
        Math.abs(back.re[i]! - f.re[i]!),
        Math.abs(back.im[i]! - f.im[i]!),
      )
    }
  }

  return worst
}

function aboveBandSpec(n: number, L: number): LoopSpec {
  const split = splitNear(n, 1)
  const top = ringOmega(2 / n, Math.PI)

  return ringSpec(
    n,
    L,
    split,
    Math.round((1.5 * top * split.root) / (2 * Math.PI)),
  )
}

const superposition = (g: Atom, e: Atom): Atom => [
  (g[0] + e[0]) / Math.SQRT2,
  (g[1] + e[1]) / Math.SQRT2,
  (g[2] + e[2]) / Math.SQRT2,
  (g[3] + e[3]) / Math.SQRT2,
]

export default experiment({
  id: 'gauge/polaron-restriction-exact',
  code: 'E-FRC-0239',
  title:
    "the polaron-frame restriction held to the exact rule at N = 25 and 49: on short closed strips (the uniform-shift sector, N^(L-1) states per atom site) a STAND-IN atom's vacuum Rabi exchange under the exact register rule is followed by the two-quantum restriction in the Silbey-Harris frame, and an atom above the band shows the dressed gap OPENING, the sign that decides which part of the charge's static field dresses it",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}

    // V0
    let v0 = 0

    for (const [n, L] of [
      [5, 3],
      [5, 4],
    ] as const) {
      const e = kernelCheck(ringAtomSpec(n, L, (2 * Math.PI) / L))

      metrics[`kernelN${n}L${L}`] = e
      v0 = Math.max(v0, e)
    }

    // V1
    let v1 = true

    for (const [n, L, gated] of [
      [25, 4, true],
      [25, 5, true],
      [49, 4, true],
      [9, 6, false],
      [11, 6, false],
    ] as const) {
      const tag = `N${n}L${L}`
      const spec = ringAtomSpec(n, L, (2 * Math.PI) / L)
      const { f, kappa } = loopSplit(spec)
      const bare = atomBare(ladderShape(spec))
      const g = (4 * Math.PI * spec.drift) / spec.root
      const gr = stripGoldenRule({
        n,
        f,
        kappa,
        g,
        dipole: bare.dipole,
        gap: bare.gap,
        curl: ringCurl,
        curlSlope: k => 2 * Math.sin(k),
      })
      const beats = gated ? Math.ceil(4 / gr.rate) : 40
      const vac = reducedVacuum(spec)
      const exact = exactAtomRun(
        spec,
        vac.vacuum,
        bare.excited,
        bare.excited,
        bare.ground,
        beats,
      )

      let lowest = 1

      for (let t = 0; t <= beats; t++) {
        lowest = Math.min(lowest, exact.population[t]!)
      }

      metrics[`beats${tag}`] = beats
      metrics[`vacuumResidual${tag}`] = vac.residual
      metrics[`gap${tag}`] = bare.gap
      metrics[`exactLowest${tag}`] = lowest
      metrics[`exactNormDrift${tag}`] = Math.abs(exact.norm[beats]! - 1)

      for (const kind of KINDS) {
        const choice = restrictedFrame(spec, bare.gap, kind)
        const r = restrictedAtomRun(
          choice,
          bare.excited,
          bare.excited,
          bare.ground,
          beats,
        )

        let worst = 0

        for (let t = 0; t <= beats; t++) {
          worst = Math.max(
            worst,
            Math.abs(exact.population[t]! - r.population[t]!),
          )
        }

        metrics[`ruleMinus${KEY[kind]}${tag}`] = worst
        metrics[`dropped${KEY[kind]}${tag}`] = r.dropped
        metrics[`startLost${KEY[kind]}${tag}`] = r.startLost

        if (kind === 'silbey-harris' && gated) {
          v1 &&= worst <= 0.01
        }
      }

      for (const t of [
        Math.floor(beats / 4),
        Math.floor(beats / 2),
        beats,
      ]) {
        metrics[`exactP${tag}t${t}`] = exact.population[t]!
      }
    }

    // V2
    let v2a = true
    let v2b = true

    for (const [n, L] of [
      [25, 4],
      [49, 4],
    ] as const) {
      const tag = `N${n}L${L}`
      const spec = aboveBandSpec(n, L)
      const bare = atomBare(ladderShape(spec))
      const start = superposition(bare.ground, bare.excited)
      const vac = reducedVacuum(spec)
      const exact = ramseyGap(
        exactAtomRun(
          spec,
          vac.vacuum,
          start,
          bare.excited,
          bare.ground,
          RAMSEY,
        ),
        0,
        RAMSEY,
      )
      const shift = exact.gap - bare.gap

      metrics[`aboveGap${tag}`] = bare.gap
      metrics[`aboveBandTop${tag}`] = ringOmega(2 / n, Math.PI)
      metrics[`aboveExactGap${tag}`] = exact.gap
      metrics[`aboveExactShift${tag}`] = shift
      metrics[`aboveExactWiggle${tag}`] = exact.wiggle
      v2a &&= shift > 0

      for (const kind of KINDS) {
        const choice = restrictedFrame(spec, bare.gap, kind)
        const r = ramseyGap(
          restrictedAtomRun(
            choice,
            start,
            bare.excited,
            bare.ground,
            RAMSEY,
          ),
          0,
          RAMSEY,
        )

        metrics[`above${KEY[kind]}Gap${tag}`] = r.gap
        metrics[`above${KEY[kind]}ShiftError${tag}`] =
          (r.gap - exact.gap) / shift

        metrics[`above${KEY[kind]}ZerothShift${tag}`] =
          choice.prediction.gap - bare.gap

        if (kind === 'silbey-harris') {
          v2b &&= Math.abs(r.gap - exact.gap) <= 0.1 * Math.abs(shift)
        }
      }
    }

    const gates = { V0: v0 <= 1e-12, V1: v1, V2: v2a && v2b }

    for (const [gate, ok] of Object.entries(gates)) {
      metrics[`gate${gate}`] = ok ? 1 : 0
    }

    metrics.gateV2a = v2a ? 1 : 0
    metrics.gateV2b = v2b ? 1 : 0

    const status =
      gates.V0 && gates.V1 && gates.V2
        ? 'pass'
        : gates.V0 && gates.V1
          ? 'partial'
          : 'fail'

    return verdict({
      status,
      claim: `exact rule on the closed strip's physical sector (kernel within ${v0.toExponential(1)} of the full rule): a resonant STAND-IN atom's vacuum Rabi exchange (P_e down to ${metrics.exactLowestN25L4!.toFixed(3)}, ${metrics.exactLowestN25L5!.toFixed(3)}, ${metrics.exactLowestN49L4!.toFixed(3)} at (N, L) = (25, 4), (25, 5), (49, 4)) is followed by the two-quantum restriction within ${metrics.ruleMinusSHN25L4!.toExponential(1)}, ${metrics.ruleMinusSHN25L5!.toExponential(1)}, ${metrics.ruleMinusSHN49L4!.toExponential(1)} in the Silbey-Harris frame (Lang-Firsov ${metrics.ruleMinusLFN25L4!.toExponential(1)}, ${metrics.ruleMinusLFN25L5!.toExponential(1)}, ${metrics.ruleMinusLFN49L4!.toExponential(1)}; lab ${metrics.ruleMinusLabN25L4!.toExponential(1)}, ${metrics.ruleMinusLabN25L5!.toExponential(1)}, ${metrics.ruleMinusLabN49L4!.toExponential(1)}); an atom above the band has its gap shifted by ${metrics.aboveExactShiftN25L4!.toExponential(2)} and ${metrics.aboveExactShiftN49L4!.toExponential(2)} (N = 25, 49) under the exact rule, against Lang-Firsov's zeroth order ${metrics.aboveLFZerothShiftN25L4!.toExponential(2)}, ${metrics.aboveLFZerothShiftN49L4!.toExponential(2)} and Silbey-Harris's ${metrics.aboveSHZerothShiftN25L4!.toExponential(2)}, ${metrics.aboveSHZerothShiftN49L4!.toExponential(2)}; the Silbey-Harris restriction's shift is off by ${(100 * metrics.aboveSHShiftErrorN25L4!).toFixed(1)} and ${(100 * metrics.aboveSHShiftErrorN49L4!).toFixed(1)} percent`,
      metrics,
      control: {
        ruleMinusLabN25L5: metrics.ruleMinusLabN25L5!,
        aboveLFZerothShiftN25L4: metrics.aboveLFZerothShiftN25L4!,
      },
      notes:
        "L2. FIRST RUN 2026-09-26 (tmp/frc0239.log, 227 s), PASS on all gates. No gate moved. V0: the reduced kernel equals the full rule within 7.8e-16. V1: under the exact register rule the resonant STAND-IN atom exchanges its quantum with the ring (P_e down to 0.011, 0.014, 0.005 at (N, L) = (25, 4), (25, 5), (49, 4), exact norm within 5e-13), and the Silbey-Harris two-quantum restriction follows it within 6.3e-3, 7.3e-3, 2.2e-3 over 114, 157, 312 beats; Lang-Firsov within 6.1e-3, 8.1e-3, 2.5e-3; the LAB restriction (E-FRC-0236's) within 2.5e-2, 3.5e-2, 1.9e-2, 3 to 9 times worse. In every frame the error is about the restriction's own dropped weight (SH 5.9e-3, 7.7e-3, 2.2e-3; lab 5.1e-2, 7.6e-2, 2.0e-2), so the dropped weight is an honest error bar. At E-FRC-0236's box (N = 9, 11, L = 6, 40 beats; reported): lab 0.232, 0.133 (0236's failure reproduced), Lang-Firsov 0.034, 0.025, Silbey-Harris 0.030, 0.025: the frame cuts the error sevenfold, not to 0.01. V2: above the band the exact dressed gap OPENS by 9.29e-3 and 3.62e-3 (N = 25, 49), as level repulsion predicted, and every restriction reproduces it within 0.3 percent of the shift (SH 0.08 and 0.01 percent). FINDING AGAINST PART OF THE HEADER'S REASONING, stated plainly: BOTH frames' ZEROTH orders have the wrong sign there (Lang-Firsov -2.36e-2, -8.88e-3; Silbey-Harris -3.26e-3, -1.14e-3). The Silbey-Harris zeroth order is closer in size, but neither frame's vacuum-projected atom is the dressed atom: the physical dressed gap is the second-order level repulsion, which the one-quantum states of any restriction carry. So a 'Debye-Waller-corrected golden rule' read off a frame's zeroth order is NOT a derivation of the rate, and Lang-Firsov's closing of the gap (the basis of its 0.853 at N = 25, L = 512, and the match to E-FRC-0237's 0.860) is refuted as physics on these boxes.",
    })
  },
})
