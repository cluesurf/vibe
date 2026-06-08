# P21: The Graviton (Polarizations Read from the Operator Spectrum)

**Status: solved. The two polarizations are measured, not imposed by a projector.**

## The fix

The earlier version counted polarizations as the rank of a transverse-traceless projector, which is 2
by construction. This version reads the count from the SPECTRUM of the graviton operator derived in
P24 (Christoffel to Ricci to Einstein), where nothing is imposed by hand.

## Result

The spectrum of the derived operator at any momentum k is, in units of (1/2)|k|^2:

| eigenvalue | count | meaning |
| ---------- | ----- | ------- |
| +(1/2)\|k\|^2 | 2 | physical, propagating graviton polarizations |
| 0 | 3 | diffeomorphism gauge modes (exact zeros) |
| -(1/2)\|k\|^2 | 1 | unphysical trace mode |

Across momentum directions (0,0,1), (1,1,0), (1,1,1), (2,1,3): always 2 physical and 3 gauge. The
masslessness is read from the lattice dispersion (lowest omega^2 = 4 sin^2(pi/L) shrinks to zero as
L grows). A massive spin-2 would carry 5 degrees of freedom (the traceless symmetric tensor), because
it has no diffeomorphism gauge freedom.

## Reading

The two physical polarizations are not imposed by a transverse-traceless projector. They are read off
the spectrum of the operator derived from the action: two modes propagate at +(1/2)|k|^2, three are
pure diffeomorphism gauge (exact zeros), and one trace mode is unphysical. That is the signature of a
massless spin-2 field, the graviton, measured rather than asserted.

## See also

`p24-graviton-from-action.md`, `p73-discrete-graviton.md`, `p32-einstein-equations.md`.
