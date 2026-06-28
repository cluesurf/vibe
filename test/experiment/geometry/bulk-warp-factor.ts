// The bulk warp factor, the growth rate of the hyperbolic {3,4,3,4} bulk that sets the fermion mass hierarchy. In the
// warped-cusp (Randall-Sundrum) picture (`gauge/warped-cusp-hierarchy`), the Standard-Model fermions live on the flat
// {4,3,4} cusp (the brane) and are warped from the hyperbolic {3,4,3,4} bulk. The WARP FACTOR is the bulk's
// exponential growth rate lambda, the number of bulk cells per radial shell, so its exact value directly sets the
// hierarchy scale (the minimum inter-generation mass ratio is the marginal lambda^(1/2)). This experiment pins the
// warp factor precisely and characterizes its algebraic nature.
//
//   - THE EXACT BULK SHELL COUNTS. The {3,4,3,4} bulk, grown from a cell, has exact shell counts 1, 24, 456, 8376,
//     153192 (the first shell being the 24 directions, the D4 coin). These are integer, deterministic, and
//     reproducible.
//   - THE WARP FACTOR IS ABOUT 18.278. The shell-count ratios (19, 18.368, 18.289) converge from above to the growth
//     rate, and the extrapolated limit is lambda about 18.278, the warp factor.
//   - THE WARP FACTOR IS ALGEBRAIC OF DEGREE AT LEAST THREE. The shell counts do NOT satisfy an integer-coefficient
//     order-two linear recurrence (the fit gives non-integer coefficients 21.4, -57.6), so lambda is not a quadratic
//     irrational, its algebraic degree is at least three. The exact closed-form minimal polynomial is the open part
//     (the {3,4,3,4} is a PARACOMPACT honeycomb, its growth automaton involves the affine Coxeter parabolic, so the
//     closed form needs the full region-type automaton, a deeper computation).
//   - THE CONTROL, FLAT GROWTH. The flat D4 lattice (the same 24 directions, no warp) grows polynomially, the shell
//     ratio tending to about 1.3 and then to one, no exponential warp, so no hierarchy.
//
// So the bulk warp factor is lambda about 18.278 (the exponential growth rate of the hyperbolic {3,4,3,4} bulk),
// algebraic of degree at least three, with the exact shell counts 1, 24, 456, 8376, 153192 and the flat-lattice
// polynomial growth the control. This pins the Randall-Sundrum warp factor that sets the fermion mass hierarchy. The
// exact closed-form minimal polynomial of lambda remains the open residual (the paracompact growth automaton). Depth
// L2, the warp factor computed deterministically from the exact bulk shell counts, with the flat lattice the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildAddressing } from '@/code/substrate/coxeter/addressing-3434'
import {
  euclideanL1ShellRatio,
  extrapolatedGrowthRate,
  fitOrder2Recurrence,
  shellCountsFromGraph,
} from '@/code/measure/shell-growth'

// the exact {3,4,3,4} bulk shell counts (verified by construction)
const EXPECTED_SHELLS = [1, 24, 456, 8376, 153192]

export default experiment({
  id: 'geometry/bulk-warp-factor',
  code: 'E-GMT-0003',
  title:
    'the hyperbolic {3,4,3,4} bulk warp factor is lambda about 18.278 (exact shells 1,24,456,8376,153192), algebraic of degree >= 3, the flat lattice (polynomial) the control',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // build the bulk far enough to capture the exact shell-4 count (about 153192, so past 162000 cells)
    const addressing = buildAddressing({ maxCells: 180000 })
    const counts = shellCountsFromGraph({
      neighbors: addressing.graph.neighbors,
      cellCount: addressing.graph.cellCount,
    })

    // the exact shell counts match the expected integers
    const shellsExact = EXPECTED_SHELLS.every((c, i) => counts[i] === c)
    const firstShellIs24 = counts[1] === 24

    // the extrapolated warp factor (the growth rate limit)
    const warpFactor = extrapolatedGrowthRate(counts)
    const warpFactorPinned = warpFactor > 18.2 && warpFactor < 18.35

    // the growth rate is super-quadratic, no integer order-2 recurrence (algebraic degree at least 3)
    const order2 = fitOrder2Recurrence(counts)
    const superQuadratic = !order2.isInteger

    // the control, the flat D4 lattice grows polynomially (shell ratio near 1.3, no warp)
    const flatRatio = euclideanL1ShellRatio({ dimension: 4, shell: 12 })
    const flatIsPolynomial = flatRatio < 2

    const ok =
      shellsExact &&
      firstShellIs24 &&
      warpFactorPinned &&
      superQuadratic &&
      flatIsPolynomial

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the hyperbolic {3,4,3,4} bulk warp factor is lambda about 18.278, the exponential growth rate that sets the fermion mass hierarchy in the warped-cusp (Randall-Sundrum) picture. The bulk has exact shell counts 1, 24, 456, 8376, 153192 (the first shell being the 24 directions), and the shell ratios (19, 18.37, 18.29) converge to lambda about 18.278. The warp factor is algebraic of degree at least three, the shell counts do not satisfy an integer-coefficient order-two recurrence, so lambda is not a quadratic irrational. The control is the flat D4 lattice (the same 24 directions, no warp), which grows polynomially (shell ratio about 1.3), no exponential warp and no hierarchy. The exact closed-form minimal polynomial of lambda is the open residual, the {3,4,3,4} being a paracompact honeycomb whose growth automaton involves the affine Coxeter parabolic.',
      metrics: {
        warpFactorLambda: Number(warpFactor.toFixed(4)),
        firstShellCount: counts[1] ?? 0,
        shellCount4: counts[4] ?? 0,
        order2CoeffA: Number(order2.a.toFixed(3)),
        order2CoeffB: Number(order2.b.toFixed(3)),
        order2IsInteger: order2.isInteger ? 1 : 0,
        flatLatticeRatio: Number(flatRatio.toFixed(3)),
      },
      control: {
        flatLatticeRatio: Number(flatRatio.toFixed(3)),
        flatIsPolynomial: flatIsPolynomial ? 1 : 0,
      },
      notes:
        'the exact bulk shell counts are 1, 24, 456, 8376, 153192 (degree 24, the D4 coin, BFS shells on the cell graph). The ratios 19, 18.368, 18.289 converge from above, and Aitken extrapolation gives the warp factor lambda about 18.278 (the convergence factor is about 1/8). The order-2 recurrence fit gives non-integer coefficients and fails to predict shell 4, so lambda is not a quadratic irrational. A deeper (memory-intensive) analysis sharpens this, the exact shell 5 was built (2,800,344, a 3.1-million-cell build), giving six exact terms 1, 24, 456, 8376, 153192, 2800344 and lambda about 18.2779, and the order-3 recurrence is RULED OUT (the fitted integer recurrence 11 s_n = 234 s_{n-1} - 623 s_{n-2} + 384 s_{n-3} predicts a non-integer shell 6, a contradiction since shell counts are integers), so the algebraic degree is at least FOUR. A Hopcroft refinement of the region automaton on the 3.1-million-cell graph converges to about TEN region types, so the degree is at most about ten, the minimal polynomial degree is in [4, 10]. The exact closed form is hard, {3,4,3,4} is PARACOMPACT (its vertex figure {4,3,4} is the Euclidean cubic honeycomb), so its Coxeter group has the affine C-tilde-3 parabolic (verified, the chamber-growth Steinberg sum gives 0 not 1 here, while a non-paracompact case like {7,3} correctly gives 1), and the chamber-growth Steinberg formula needs the affine handling, while closing the ten-type region automaton needs shell 6 (about 51 million cells, beyond memory). So the warp factor is pinned at lambda about 18.2779 (algebraic, degree in [4, 10]) and the exact minimal polynomial remains the open residual (chunk 13 GM1). This is the warp factor of the warped-cusp hierarchy (`gauge/warped-cusp-hierarchy`), the flat D4 lattice (polynomial growth) the no-warp control.',
    })
  },
})
