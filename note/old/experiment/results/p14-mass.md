# P14: Mass and the Relativistic Dispersion

**Status: validated (one rung of the matter sector).**

## The question

The matter built so far (P4) is massless. Real particles have mass. Does a mass term
give the fermion a rest energy and the correct relativistic energy-momentum relation,
E^2 = p^2 + m^2?

## What we did

Build the 1D lattice Dirac Hamiltonian H(k) = m * sigma_z + sin(k) * sigma_x at each
momentum k, diagonalise it, and read off the positive-energy branch omega(k). Measure
the gap at zero momentum and fit the small-momentum dispersion to omega^2 = a*k^2 + b.

## Result

| m | gap = omega(0) | dispersion fit |
| - | -------------- | -------------- |
| 0.0 | 0.000 | a = 0.97, b = 0.000 |
| 0.3 | 0.300 | a = 0.97, b = 0.090 (m^2 = 0.090) |
| 0.6 | 0.600 | a = 0.97, b = 0.360 (m^2 = 0.360) |

- The **gap equals the mass exactly** (0.300 and 0.600), the rest energy.
- The **intercept equals m^2 exactly** (0.090 and 0.360), so omega^2 = k^2 + m^2.
- The slope a is near 1 (the speed of light), slightly under because the lattice
  dispersion sin^2(k) bends below k^2 away from the origin.
- At m = 0 the gap vanishes and omega = |k|, a massless light-cone mode.

So a mass term gives matter a **rest energy** (the gap) and the **correct
relativistic dispersion E^2 = p^2 + m^2**. Massless matter moves on the light cone,
massive matter has a floor of rest energy.

## Honest reading

This is the dispersion rung: mass as the spectral gap, with the relativistic form.
It is not the full mass mechanism. Connecting the gap to the internal clock-tone
frequency of the v2 picture (mass as the rest-frame oscillation rate), and getting
mass dynamically from the chiral condensate (P8) rather than as a put-in parameter,
are the next steps.

## See also

`p4-chirality.md` (the massless spinor), `p8-schwinger.md` (the condensate that could
generate mass), and `note/questions/next-version.md` (P14).
