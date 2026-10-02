// The love-fear middle rung read by the qutrit Bell inequality CGLMP (E-QTM-0169).
//
// The ledger row "the love-fear middle rung's true maximum" is held (E-QTM-0165: the exact CHSH maximum of the
// three-weight knot is (8 + 2 sqrt 21 + 2 sqrt 35 - 2 sqrt 15) / 9 = 2.36126). CHSH uses two outcomes, so it
// cannot see the third Schmidt weight fully. The routes map (routes/quantum-relativity-light-computation.md, A,
// the love-fear middle rung's true maximum, fourth route "a qutrit-native inequality") asks for the CGLMP value
// of the knot, with see-saw and the two-setting optimum. Its kill: CGLMP sits at its local bound 2 for the knot
// (then the third weight carries no nonlocality).
//
// WHAT IS RUN. The knot is sum sqrt(p_k) |k k> with p = ((4 + sqrt 15) / 9, 1/9, (4 - sqrt 15) / 9) (E-QTM-0140,
// 0165), so sqrt p1 = (sqrt 10 + sqrt 6) / 6, sqrt p3 = (sqrt 10 - sqrt 6) / 6, sqrt(p1 p3) = 1/9. CGLMP for
// d = 3 (Collins, Gisin, Linden, Massar, Popescu 2002), local bound 2, read in code/measure/cglmp (added for
// this file): (1) at the standard Fourier readings in closed form, (2) maximized over all projective readings,
// two per party, by a deterministic gradient ascent over the four frames (72 real parameters, 16 Weyl starts,
// 5,000 steps each). The same instrument reads the maximally entangled state, the Acin-Durt-Gisin-Latorre
// state (1, gamma, 1) / norm, gamma = (sqrt 11 - sqrt 3) / 2, a product state, the dephased knot (separable),
// and the knot cut to its two largest weights (p1, p2) / (p1 + p2).
//
// DERIVED BEFORE THE GATE RUN. On the Schmidt vectors |00>, |11>, |22> the standard Bell operator is the block
// [[0, c, 2], [c, 0, c], [2, c, 0]], c = 2 / sqrt 3 (probe below; Acin et al. 2002), whose top eigenvalue on
// (1, x, 1) solves l^2 - 2 l - 2 c^2 = 0, l = 1 + sqrt(11/3). A Schmidt state with weight p_m on the middle
// vector and p_a, p_b on the ends reads (4 / sqrt 3) sqrt(p_m) (sqrt p_a + sqrt p_b) + 4 sqrt(p_a p_b). For the
// knot, the three placements give
//   p2 in the middle: 4 sqrt 30 / 27 + 4/9 = 1.25577
//   p1 in the middle: (4 / sqrt 3) (sqrt 10 + sqrt 6) / 6 (1/3 + (sqrt 10 - sqrt 6) / 6) + 4 (sqrt 10 - sqrt 6) / 18
//   p3 in the middle: (4 / sqrt 3) (sqrt 10 - sqrt 6) / 6 (1/3 + (sqrt 10 + sqrt 6) / 6) + 4 (sqrt 10 + sqrt 6) / 18
// all below 2: the standard readings, made for near-symmetric states, see no violation in the knot, so any
// violation needs readings fitted to it. A separable state (the product, the dephased knot) can never pass 2.
//
// PROBES BEFORE THE GATES (disclosed). tmp/qb-probe.ts fixed the sign conventions of the standard readings on
// the maximally entangled state (the first try read 0.05 from a mislabeled term and a swapped beta; the fixed
// form reads 2.8729341) and printed the Schmidt block above. tmp/qb-probe2.ts sized the optimizer on the two
// instrument states only: 600 steps left the Acin state at 2.91483 (2.5e-5 short), 5,000 steps reach
// 2.9148542155126 (1e-13 short) from 8 of 8 starts, 4.6 s a start. The knot was not run.
//
// HYPOTHESES AND GATES, fixed before the gate run:
//   I1 instrument: the standard readings give 4 / (6 sqrt 3 - 9) = 2.8729341 on the maximally entangled state
//      and the block above, to 1e-12; the top eigenvalue of the 9 x 9 standard Bell operator is
//      1 + sqrt(11/3) = 2.9148542 to 1e-9; the optimizer reaches 2.8729341 on the maximally entangled state and
//      1 + sqrt(11/3) on the Acin state to 1e-9, no optimizer value on any state exceeds 1 + sqrt(11/3) + 1e-9,
//      and every frame it returns is unitary to 1e-12
//   C1 control, the instrument reads the local bound: the product state |00> and the dephased knot both
//      optimize to at most 2 + 1e-12, and the product reaches 2 - 1e-9
//   H1 the route's hypothesis: the knot's CGLMP optimum exceeds 2 + 1e-6
//   H2 the derivation: the knot at the standard readings gives the three closed forms above to 1e-12, all < 2
//   P1 falsifier (the route's kill): the knot's optimum is at most 2 + 1e-9
// VERDICT: fail if I1 or C1 fails or P1 is met; pass if H1 and H2 hold; partial otherwise (H1 alone, or an
// optimum between 2 + 1e-9 and 2 + 1e-6).
// Reported, not gated: the cut knot's optimum and the knot's minus it (what the third weight adds or takes),
// the spread of the 16 starts, the knot's CHSH maximum 2.36126 beside it.
//
// WHAT THIS CAN AND CANNOT SHOW. It can show whether the middle rung is nonlocal for a qutrit-native
// inequality and by how much, and whether the third weight adds to it. The optimum is over projective readings,
// two per party, by a local search: a value it reaches is a value of real readings (a lower bound on the true
// maximum), but it is not proven to be the maximum, and non-projective readings are not searched. CGLMP is one
// facet of the two-setting three-outcome local polytope; other facets are not read. Floats throughout, with
// residuals reported; the standard-reading values are closed forms checked in floats.
//
// FIRST RUN 2026-10-02 (tmp/qb-run1.log, 238 s): PASS, every gate as fixed. I1: standard readings 2.8729341
// on the maximally entangled state, block error 9e-16, top eigenvalue 2.9148542155127; the optimizer reaches
// 2.872934051172 and 2.914854215511 (2e-12 short), never above, frames unitary to 4e-15. C1: product 2 +
// 1e-15, dephased knot 2 - 1e-15. H1: the knot's optimum is 2.312116099 (16 of 16 starts within 4e-14), 0.312
// above the local bound and below its CHSH maximum 2.36126; P1 not met. H2: the three placements read 1.255885,
// 1.134988, 1.595110, on the closed forms to 7e-16. A slip in the header's prose, not in the gate: 4 sqrt 30 /
// 27 + 4/9 is 1.25589, not 1.25577 as written above (the gate compared against the closed form). Reported: the
// knot cut to (p1, p2) reads 2.274823935, so the third weight adds 0.0373; the Acin state's starts spread 6e-5
// (some stop short), the knot's 4e-14.
//
// DETERMINISM: Weyl starts, no random number. Depth L2: a float optimization, with closed-form instrument
// checks.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import {
  bellOperator,
  cglmpOptimize,
  cglmpValue,
  dephasedState,
  frameDefect,
  schmidtState,
  standardSettings,
  type Ensemble,
} from '@/code/measure/cglmp'

const STARTS = 16
const ITERATIONS = 5000
const S3 = Math.sqrt(3)
const S6 = Math.sqrt(6)
const S10 = Math.sqrt(10)
const S15 = Math.sqrt(15)
const ME_STANDARD = 4 / (6 * S3 - 9)
const QUANTUM_TOP = 1 + Math.sqrt(11 / 3)
const KNOT_CHSH = (8 + 2 * Math.sqrt(21) + 2 * Math.sqrt(35) - 2 * S15) / 9

export default experiment({
  id: 'quantum/middle-rung-cglmp',
  code: 'E-QTM-0169',
  title:
    'the love-fear middle rung violates the qutrit Bell inequality CGLMP, pass: over projective readings, two a party, a deterministic search reaches 2.312116 against the local bound 2 (its CHSH maximum is 2.36126), and the knot cut to its two largest weights reaches 2.274824, so the third Schmidt weight adds 0.0373; the standard Fourier readings see no violation (1.25589, 1.13499, 1.59511 over the three placements, closed forms), so the readings must be fitted to the knot; the instrument reads 2.8729 and 1 + sqrt(11/3) on its reference states and 2 on separable ones; a reached value, not a proven maximum',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const knotP = [(4 + S15) / 9, 1 / 9, (4 - S15) / 9]
    const knot = schmidtState(knotP)
    const std = standardSettings()

    // I1: standard readings
    const me = schmidtState([1 / 3, 1 / 3, 1 / 3])
    const meStd = cglmpValue(me, std)
    const op = bellOperator(std)
    const c = 2 / S3
    const blockWant = [
      [0, c, 2],
      [c, 0, c],
      [2, c, 0],
    ]
    let blockError = 0

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        blockError = Math.max(
          blockError,
          Math.abs(op.re[9 * (4 * i) + 4 * j]! - blockWant[i]![j]!),
          Math.abs(op.im[9 * (4 * i) + 4 * j]!),
        )
      }
    }

    const eig = complexEigenvalues({ re: op.re, im: op.im, n: 9 })
    const topEigen = Math.max(...eig.re)
    const eigImag = Math.max(...eig.im.map(Math.abs))

    const gamma = (Math.sqrt(11) - S3) / 2
    const norm = 2 + gamma * gamma
    const adgl = schmidtState([1 / norm, (gamma * gamma) / norm, 1 / norm])
    const cutP = [knotP[0]! / (knotP[0]! + knotP[1]!), knotP[1]! / (knotP[0]! + knotP[1]!), 0]
    const product: Ensemble = schmidtState([1, 0, 0])

    const runs = [
      ['maximally entangled', me],
      ['Acin state', adgl],
      ['knot', knot],
      ['cut knot', schmidtState(cutP)],
      ['product', product],
      ['dephased knot', dephasedState(knotP)],
    ] as const
    const results = runs.map(([name, state], r) => {
      const out = cglmpOptimize({
        state,
        starts: STARTS,
        iterations: ITERATIONS,
        offset: 1000 * r,
      })

      return {
        name,
        value: out.value,
        spread: out.value - Math.min(...out.values),
        defect: frameDefect(out.settings),
      }
    })
    const at = (name: string) => results.find(x => x.name === name)!
    const maxAll = Math.max(...results.map(x => x.value))
    const maxDefect = Math.max(...results.map(x => x.defect))

    const i1 =
      Math.abs(meStd - ME_STANDARD) < 1e-12 &&
      blockError < 1e-12 &&
      Math.abs(topEigen - QUANTUM_TOP) < 1e-9 &&
      at('maximally entangled').value >= ME_STANDARD - 1e-9 &&
      at('Acin state').value >= QUANTUM_TOP - 1e-9 &&
      maxAll <= QUANTUM_TOP + 1e-9 &&
      maxDefect < 1e-12

    const c1 =
      at('product').value <= 2 + 1e-12 &&
      at('product').value >= 2 - 1e-9 &&
      at('dephased knot').value <= 2 + 1e-12

    // H2: the three placements at the standard readings, against the closed forms
    const placements: [number[], number][] = [
      [[knotP[0]!, knotP[1]!, knotP[2]!], (4 * Math.sqrt(30)) / 27 + 4 / 9],
      [
        [knotP[1]!, knotP[0]!, knotP[2]!],
        (4 / S3) * ((S10 + S6) / 6) * (1 / 3 + (S10 - S6) / 6) +
          (4 * (S10 - S6)) / 18,
      ],
      [
        [knotP[0]!, knotP[2]!, knotP[1]!],
        (4 / S3) * ((S10 - S6) / 6) * (1 / 3 + (S10 + S6) / 6) +
          (4 * (S10 + S6)) / 18,
      ],
    ]
    const stdValues = placements.map(([p]) => cglmpValue(schmidtState(p), std))
    const stdError = Math.max(
      ...placements.map(([, want], k) => Math.abs(stdValues[k]! - want)),
    )
    const h2 = stdError < 1e-12 && placements.every(([, want]) => want < 2)

    const knotValue = at('knot').value
    const h1 = knotValue > 2 + 1e-6
    const p1 = knotValue <= 2 + 1e-9
    const status = !i1 || !c1 || p1 ? 'fail' : h1 && h2 ? 'pass' : 'partial'
    const cut = at('cut knot').value

    return verdict({
      status,
      claim: `the middle rung's CGLMP optimum over projective readings is ${knotValue.toFixed(9)} (local bound 2; its CHSH maximum is ${KNOT_CHSH.toFixed(5)}), against ${cut.toFixed(9)} for the knot cut to its two largest weights (third weight adds ${(knotValue - cut).toExponential(3)}); at the standard Fourier readings it reads ${stdValues.map(v => v.toFixed(6)).join(', ')} over the three placements, all below 2; the instrument reads ${at('maximally entangled').value.toFixed(9)} and ${at('Acin state').value.toFixed(12)} on its two reference states and at most ${Math.max(at('product').value, at('dephased knot').value).toFixed(12)} on separable ones`,
      metrics: {
        knotOptimum: knotValue,
        knotOptimumMinusLocal: knotValue - 2,
        knotSpread: at('knot').spread,
        cutKnotOptimum: cut,
        thirdWeightAdds: knotValue - cut,
        knotChshMaximum: KNOT_CHSH,
        standardP2Middle: stdValues[0]!,
        standardP1Middle: stdValues[1]!,
        standardP3Middle: stdValues[2]!,
        standardClosedFormError: stdError,
      },
      control: {
        maximallyEntangledStandard: meStd,
        maximallyEntangledOptimum: at('maximally entangled').value,
        acinOptimum: at('Acin state').value,
        acinShortfall: QUANTUM_TOP - at('Acin state').value,
        standardBlockError: blockError,
        standardTopEigenvalue: topEigen,
        standardEigenImaginary: eigImag,
        productOptimum: at('product').value,
        dephasedKnotOptimum: at('dephased knot').value,
        largestFrameDefect: maxDefect,
      },
      notes: `L2. Spreads over ${STARTS} starts: ${results.map(x => `${x.name} ${x.spread.toExponential(2)}`).join('; ')}. Projective readings only, local search: the optimum is a reached value, not a proven maximum.`,
    })
  },
})
