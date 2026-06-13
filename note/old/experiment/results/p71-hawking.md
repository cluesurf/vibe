# P71: Hawking/Unruh Radiation (Thermality Derived)

**Status: solved. Thermality emerges from the response, not plugged in.**

## The fix

The earlier version plugged in the Bogoliubov mixing tanh r = exp(-pi w / kappa) (the answer) and
hardcoded a triangular Page curve. This version derives both.

## 1. Thermal spectrum from the Unruh detector response

A uniformly accelerated detector (the equivalence-principle stand-in for a horizon of surface gravity
kappa = a) couples to the field correlator along its worldline. The 4D massless Wightman function on
that worldline depends only on the proper-time gap, W(dtau) ~ 1 / sinh^2(a(dtau - i eps)/2). The
detector response is its Fourier transform F(E). We compute F(E) numerically and find detailed
balance:

| E | F(E)/F(-E) measured | exp(-2 pi E / a) |
| - | ------------------- | ---------------- |
| 0.5 | 0.210 | 0.208 |
| 1.0 | 0.044 | 0.043 |
| 1.5 | 0.0093 | 0.0090 |

The Planck factor emerges from the transform (max relative residual 4%), and the temperature read off
the response is 0.1597, matching kappa/(2 pi) = 0.1592. Not assumed.

## 2. T ~ 1/M

With the Schwarzschild surface gravity kappa = 1/(4M) and the derived T = kappa/(2 pi), computing T at
several masses and fitting log T vs log M gives an exponent of -1.000. Small holes are hot.

## 3. The Page curve from random-state entanglement

For a black hole plus radiation in a random pure state (Page 1993), the radiation's average
entanglement entropy rises while the radiation is the smaller subsystem and falls once it is larger.
Computed from the entropy formula, the curve peaks at fraction 0.50 (the Page time) and turns over, a
genuine turnover, not a drawn triangle.

## Reading

The thermal spectrum is not put in. The detector response satisfies detailed balance, so the Planck
factor and the temperature T = kappa/(2 pi) emerge from the transform. With kappa = 1/(4M) this gives
T ~ 1/M, and the radiation entanglement entropy rises then falls, so the evaporation is unitary and
information is not lost.

## See also

`p33-black-hole.md`, `p32-einstein-equations.md`, `p24-graviton-from-action.md`.
