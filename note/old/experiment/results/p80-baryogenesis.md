# P80: Baryogenesis from Out-of-Equilibrium Dynamics

**Status: solved (emergent, non-tautological). The asymmetry is integrated, not inserted.**

## The fix

The earlier version was a biased coin whose output asymmetry just equalled its input bias epsilon.
This version integrates the actual out-of-equilibrium Boltzmann equations for a decaying heavy field,
exactly as real baryogenesis is computed, so the asymmetry emerges and is not equal to epsilon:

- nX'(t) = -K (nX - nEq), the heavy field decaying toward its equilibrium abundance nEq(t) = exp(-t),
- eta'(t) = epsilon * K * (nX - nEq) - K * nEq * eta, a CP source active only out of equilibrium,
  minus washout proportional to the equilibrium abundance,

with K the decay-rate-to-expansion ratio (washout strength).

## Result

| setup | final asymmetry eta |
| ----- | ------------------- |
| all three conditions present | 0.041 = epsilon * 0.411 (NOT epsilon) |
| no C/CP violation (epsilon = 0) | 0.000 |
| in equilibrium (no departure) | 0.000 |
| no baryon-number violation (no source) | 0.000 |

The asymmetry emerges as epsilon times an efficiency (0.411) the integration produces, and the
efficiency peaks at intermediate washout K = 0.3 (the freeze-out curve): strong washout drives it to
equilibrium and erases it, weak washout generates too little. That non-monotonic curve is the genuine
departure-from-equilibrium signature a biased coin cannot give.

## Reading

The matter excess is no longer inserted. It is the integral of the real out-of-equilibrium decay
equations, so it comes out as epsilon times a computed efficiency. Remove the CP tilt, forbid the
number-changing source, or clamp the field to equilibrium, and the dynamics give exactly zero. Each
Sakharov condition is necessary, the asymmetry is emergent, and its size depends on the true CP
violation in the substrate, which is left open (the gauge sector is not yet derived).

## See also

`p30-inflation.md`, `p79-anomaly-charge-quantization.md`, `p77-chiral-gauge.md`.
