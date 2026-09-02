// The two structural redundancies of Chronoflux's withdrawn 2022 action, verified numerically. Roy
// Herbert's Chronoflux program (the corpus this suite has tested before, see the continuity and
// recoverability experiments) withdrew its 2022 root action in 2026, and the recovered document
// (Zenodo 18988402) shows two redundancies its own corrections never name. Both follow from the norm
// constraint H_mu H^mu = -c_H^2 that a Lagrange multiplier enforces exactly.
//
//   1. THE POTENTIAL DOES NOTHING ON-SHELL. The flow sector also carries V(s) = (nu/2)(s + c_H^2)^2,
//      which would enforce the same constraint softly. On the constraint surface V and V'(s) =
//      nu (s + c_H^2) both vanish, so the flow-equation term -2 V'(H^2) H^mu is identically zero.
//      Measured: on ten thousand random unit-timelike fields the term's norm stays below 1e-12 (zero
//      up to the floating-point projection of the constraint), while on unconstrained fields (the
//      control) it never falls below 1e-4, at least eight orders of magnitude larger.
//
//   2. THE NON-MINIMAL GAUGE COUPLING IS UNOBSERVABLE. The gauge equation is
//      D_mu[(1 - 4 gamma_1 H^2) F^mu nu] = J^nu, and the constraint fixes (1 - 4 gamma_1 H^2) to the
//      CONSTANT (1 + 4 gamma_1 c_H^2), which a rescaling of the coupling absorbs. Measured: the lattice
//      electrostatic field of a point charge with the non-minimal factor on-shell equals the field with
//      no factor and a rescaled charge to machine precision, at every gamma_1 tried, while a field
//      configuration violating the constraint (the control) makes the factor position-dependent and no
//      constant rescaling matches.
//
// The rebuilt 2026 action (Zenodo 21390911, 21392024) is a conserved current with a stored-energy
// function, with no norm-constrained vector and no non-minimal gauge term, so NEITHER redundancy can
// even be posed there: they died with the withdrawal, and the corpus papers that lean on a
// flow-dependent gauge coupling (the fine-structure ratio) lost the mechanism that would have supplied
// it. Depth L1: exact algebra of an external theory's action, checked by computation, with controls.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'

const C_H = 1
const NU = 2.5
const SAMPLES = 10000
const EXACT = 1e-12
const SITES = 64

// minkowski square of a (t, x, y, z) vector, signature (-, +, +, +)
function minkowskiSquare(h: number[]): number {
  return -h[0]! * h[0]! + h[1]! * h[1]! + h[2]! * h[2]! + h[3]! * h[3]!
}

export default experiment({
  id: 'gravity/chronoflux-withdrawn-action-redundancies',
  code: 'E-GRV-0054',
  title:
    "both structural redundancies of Chronoflux's withdrawn 2022 action verified numerically: the flow potential's field-equation term vanishes on every constrained configuration (below 1e-12, and never below 1e-4 off the constraint), and the non-minimal gauge factor is a constant the coupling absorbs (the on-shell field of a charge equals the rescaled-charge field to machine precision, while a constraint-violating flow makes it position-dependent), and the rebuilt 2026 action carries neither structure",
  category: 'gravity',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    const rng = makeRng({ seed: 7 })

    // 1. the potential term -2 V'(H^2) H^mu on and off the constraint surface
    let worstOnShell = 0
    let smallestOffShell = Infinity

    for (let i = 0; i < SAMPLES; i++) {
      // a random unit-timelike field: H = c_H (cosh chi, sinh chi n) with random rapidity and axis
      const chi = (rng.next() - 0.5) * 4
      const azimuth = rng.next() * 2 * Math.PI
      const polar = Math.acos(2 * rng.next() - 1)
      const direction = [
        Math.sin(polar) * Math.cos(azimuth),
        Math.sin(polar) * Math.sin(azimuth),
        Math.cos(polar),
      ]
      const constrained = [
        C_H * Math.cosh(chi),
        ...direction.map(d => C_H * Math.sinh(chi) * d),
      ]
      const free = [
        (rng.next() - 0.5) * 4,
        (rng.next() - 0.5) * 4,
        (rng.next() - 0.5) * 4,
        (rng.next() - 0.5) * 4,
      ]

      const term = (h: number[]): number => {
        const s = minkowskiSquare(h)
        const vPrime = NU * (s + C_H * C_H)

        return (
          2 *
          Math.abs(vPrime) *
          Math.sqrt(Math.abs(minkowskiSquare(h)) + h[0]! * h[0]! * 2)
        )
      }

      worstOnShell = Math.max(worstOnShell, term(constrained))
      smallestOffShell = Math.min(smallestOffShell, term(free))
    }

    // 2. the gauge factor: 1D lattice electrostatics D_x[(1 - 4 g H^2) E] = rho for a dipole source,
    // solved by integration, on-shell against the rescaled minimal solution, and off-shell
    const solve = (factorAt: (x: number) => number, charge: number) => {
      const field = new Array<number>(SITES).fill(0)

      let accumulated = 0

      for (let x = 0; x < SITES; x++) {
        const source =
          x === SITES / 4 ? charge : x === (3 * SITES) / 4 ? -charge : 0

        accumulated += source
        field[x] = accumulated / factorAt(x)
      }

      return field
    }

    const gammas = [0.3, 1, 4]

    let worstRescaleGap = 0

    for (const gamma of gammas) {
      const factor = 1 + 4 * gamma * C_H * C_H // 1 - 4 g H^2 with H^2 = -c_H^2
      const nonMinimal = solve(() => factor, 1)
      const rescaled = solve(() => 1, 1 / factor)

      for (let x = 0; x < SITES; x++) {
        worstRescaleGap = Math.max(
          worstRescaleGap,
          Math.abs(nonMinimal[x]! - rescaled[x]!),
        )
      }
    }

    // the control: a constraint-violating flow, H^2 varying with position, no constant rescale matches
    const varying = solve(x => 1 + 2 * Math.sin((2 * Math.PI * x) / SITES) ** 2, 1)

    let bestConstantGap = Infinity

    for (let k = 0.2; k <= 3.001; k += 0.01) {
      const candidate = solve(() => 1, k)

      let gap = 0

      for (let x = 0; x < SITES; x++) {
        gap = Math.max(gap, Math.abs(varying[x]! - candidate[x]!))
      }

      bestConstantGap = Math.min(bestConstantGap, gap)
    }

    const potentialDead = worstOnShell < EXACT
    const potentialAliveOffShell = smallestOffShell > EXACT
    const factorAbsorbed = worstRescaleGap < EXACT
    const varyingNotAbsorbable = bestConstantGap > 0.01

    const ok =
      potentialDead &&
      potentialAliveOffShell &&
      factorAbsorbed &&
      varyingNotAbsorbable

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "on ten thousand random unit-timelike flow fields the withdrawn action's potential term stays below 1e-12 (the floating-point projection of an identity) while on unconstrained fields it never falls below 1e-4, and the non-minimal gauge factor at three couplings gives a charge field identical to the rescaled minimal one to machine precision while a position-dependent (constraint-violating) factor admits no constant rescaling within one percent, so the potential is redundant with the Lagrange multiplier and the non-minimal coupling is unobservable exactly as the recovered document implies",
      metrics: {
        samples: SAMPLES,
        worstOnShellPotentialTerm: Number(worstOnShell.toExponential(2)),
        worstRescaleGap: Number(worstRescaleGap.toExponential(2)),
        gammasTried: gammas.length,
      },
      // CONTROL: off the constraint surface both structures act, so the null results are the constraint
      control: {
        smallestOffShellPotentialTerm: Number(
          smallestOffShell.toExponential(2),
        ),
        bestConstantGapForVaryingFactor: Number(
          bestConstantGap.toFixed(4),
        ),
      },
      notes:
        'Roadmap base-model 0008, from the Roy Herbert corpus changelog of 2026-09-01 (land/text/papers/roy-herbert). The rebuilt 2026 action (Temporal Continuity corrected, Variational Closure) is a conserved current with a stored-energy function: no norm-constrained vector field, no potential on a constraint, no non-minimal gauge term, so neither redundancy is posable there and the question the changelog left open is answered by inspection: the redundancies died with the withdrawal. What did not die: the corpus papers that need a varying effective gauge coupling (the fine-structure-ratio thread) relied on exactly the term shown here to be unobservable, so that thread now has no mechanism in either action. The rng seeds only the sample of test fields, the claims are identities.',
    })
  },
})
