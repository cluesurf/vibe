# Findings 27, Black Holes and Horizons

The whole horizon story in one place, the thermodynamics of a black hole on the mesh, the entropy that lives on the
boundary, Einstein's equation read off a horizon, and the information paradox turned into a sharp falsifiable
commitment. The honest gaps (formation, the firewall, the full Page curve) are named, not papered over. Companion to
`findings.md`, extends `findings-22.md` (gravity), `findings-5.md` (cosmology), `findings-17.md` (the area law and the
holographic code), `findings-26.md` (the arrow and the bath). Cite `\cite{pollard2026vibetest}`.

## A horizon behaves thermodynamically

A horizon on the mesh is not put in by hand, its thermal behavior is measured. The surface gravity computed along
rays matches the metric value to under 3 percent, a near-horizon detector reads a thermal spectrum (the response
ratio `F(E)/F(-E) = exp(-E/T)`, the detailed-balance signature of a temperature), and the temperature scales as
`1/M`, the smaller the hole the hotter it is. This is the Unruh and Hawking response on the substrate, sourced by a
horizon on the graph rather than by a continuum calculation. Why it matters, the most surprising fact about a black
hole, that it has a temperature, is reproduced as a direct measurement on a discrete crystal.

## Black-hole thermodynamics is complete and self-consistent

All four pieces of the thermodynamic picture close together.

| law | result | meaning |
| --- | --- | --- |
| first law | `dM = T dS` to error about `1e-9` | energy, temperature, and entropy fit together exactly |
| Smarr relation | `M = 2 T S` (exact) | the integrated form holds |
| Bekenstein bound | saturated | the hole is the maximal-entropy object for its size |
| heat capacity | `C = -8 pi M^2` (negative) | the evaporation instability, a hole heats up as it loses mass |
| lifetime | scales as `M^3` | the evaporation time, larger holes live vastly longer |

Why it matters, the laws of black-hole thermodynamics are not assumed, they fall out together with the right signs and
the right scalings, including the negative heat capacity that makes evaporation runaway.

## Entropy lives on the boundary, the area law

A black hole's entropy scales as AREA, `l^2`, not volume, `l^3`, the Bekenstein-Hawking law, and the deeper reason is
the holographic area law for entanglement. The entanglement entropy of a boundary region equals the length of the
shortest bulk curve hanging across it (Ryu-Takayanagi), and on the hyperbolic `{7,3}` that geodesic grows as the LOG
of the interval, giving `S = (c/6) ln(l)` with `c` about 1 for a massless field, while a FLAT `{6,3}` control gives a
linear law that fails. The bulk-to-boundary map is a quantum error-correcting code (HaPPY), the `[[5,1,3]]` perfect
tensor recovers from any 2 erasures, the code distance grows as `3^depth`, and a damaged bulk region reconstructs from
the boundary outside its causal wedge. Why it matters, the area law and the holographic code are measured on the
discrete crystal with a flat control that gives the wrong answer, the strong form of the test, and they ARE the
mechanism by which a horizon stores its entropy on its surface. (`findings-17.md`, `findings-22.md`,
`theory-v0.7.0/paper/draft-v1/30-holography.md`.)

## Einstein's equation, read off a horizon

The full field equation is not postulated, it is derived as an equation of state in the Jacobson sense. Given the
measured area law `S = A/4G` and the Unruh temperature `T = kappa/2pi`, the Clausius relation `dQ = T dS` applied on
every local Rindler (acceleration) horizon IS the full nonlinear Einstein equation `G_uv + Lambda g_uv = 8 pi G T_uv`,
with the Einstein coefficient coming out at exactly `8 pi` (`2 pi / eta = 25.133 = 8 pi`). The cleanest observable
that separates real general relativity from Newton, the factor-2 bending of light, comes out right, because the metric
curves time AND space so a photon deflects by twice the naive Newtonian amount. Why it matters, gravity in the model
is thermodynamics, the field equation is what you get by demanding the Clausius relation on local horizons, the deep
modern reading of Einstein. (`findings-22.md`, `theory-v0.7.0/paper/draft-v1/27-gravity.md`.)

## The cosmological horizon

The same thermodynamics covers the universe's own horizon. The growing substrate carries a de Sitter horizon with
temperature `T = H/2pi` and `Lambda = 3 H^2`, with `H` fixed by the measured growth rate of the wake (`findings-25.md`).
So the cosmological horizon and a black-hole horizon are the same kind of object, a surface with a temperature and an
entropy. Why it matters, one horizon thermodynamics covers black holes, acceleration horizons, and the cosmos, no
separate machinery.

## The information paradox, turned into a falsifiable commitment

The base knit is EXACTLY reversible, a permutation that loses no information (`findings-26.md`). So the model CANNOT
destroy information, a black hole scrambles it into the churn but never erases it, and unitarity is exact at the base.
This converts the black-hole information paradox into a sharp prediction, there is no fundamental information loss, and
any confirmed fundamental information loss would FALSIFY the theory. The supporting structure is holographic, a bulk
region is a quantum error-correcting code written on its boundary, geometric adjacency is entanglement (ER=EPR), and
the model's growing holographic code is literally the Almheiri-Dong-Harlow construction with a code that GROWS as the
universe expands, the erasure threshold rising monotonically with age.

| shell radius (age) | docks | marked docks | density | erasure threshold |
| --- | --- | --- | --- | --- |
| 2 | 102 | 45 | 44 percent | 95.0 percent |
| 3 | 812 | 138 | 17 percent | 98.0 percent |
| 4 | 6402 | 333 | 5 percent | 99.0 percent |
| 5 | 50412 | 445 | 1 percent | 99.5 percent |

The survival fraction halves each shell while the absolute redundancy grows, so the deep memory is protected better
the older and larger the universe gets. Why it matters, the model takes the most contested question in gravity and
makes a clean, testable claim, information is preserved by exact reversibility, with a concrete falsifier.
(`theory-v0.7.0/real-world-predictions.md`, `theory-v0.6.0/related-works.md`, `growing-holographic-code.md`,
`findings-26.md`.)

## Scrambling, why a horizon mixes fast

Negative curvature makes nearby geodesics diverge exponentially, so the hyperbolic geometry is intrinsically a fast
scrambler, information injected near a horizon spreads through the bulk quickly and operator growth expands
exponentially, the geometric origin of black-hole-interior complexity growth and chaotic mixing. Why it matters, the
fast scrambling that black holes are famous for is a property of the substrate's curvature, not an added ingredient.
(`theory-v0.7.0/notes/hyperbolic-geometry-in-quantum-theory.md`.)

## The honest gaps

Stated plainly, these are not yet done.

- FORMATION. The model treats the thermodynamics of an existing horizon, gravitational collapse and mergers (how a
  black hole forms in the mesh) are not yet simulated.
- THE PAGE CURVE. It is observed to turn over, the signature of information return, but it is not yet derived from a
  first-principles Bogoliubov calculation, only read off the horizon thermodynamics.
- THE FIREWALL. The AMPS firewall argument, soft hair, and complementarity are not addressed.
- THE INTERIOR AND THE SINGULARITY. Discreteness caps the curvature, so there is no infinite-density singularity
  (`findings-5.md`), but the interior geometry and a possible bounce are not worked out.
- THE SCRAMBLING TIME. Scrambling is qualitatively present from curvature, the quantitative scrambling time and any
  butterfly bound are not computed.

Why it matters, the model has a complete and self-consistent horizon thermodynamics with a sharp information
commitment, and an honest short list of the dynamical pieces (formation, the derived Page curve, the firewall, the
interior) that remain.

## The one-line reading

A horizon on the mesh has a measured temperature (`T ~ 1/M`, detailed-balance thermal) and a boundary entropy (area
law, holographic code), its first law and Smarr relation close to `1e-9`, Einstein's equation is the Clausius
relation on local horizons, and because the base is exactly reversible the model cannot lose information, a clean
falsifiable stand on the information paradox, with formation, the derived Page curve, and the firewall named as open.

## Where to look (notes)

- Horizon thermodynamics and the Jacobson derivation: `findings-22.md`, `findings-5.md`,
  `theory-v0.7.0/paper/draft-v1/27-gravity.md`, `how-reflection-and-selection-work.md`.
- The area law and the holographic code: `findings-17.md`, `theory-v0.7.0/paper/draft-v1/30-holography.md`.
- The information commitment and ER=EPR: `theory-v0.7.0/real-world-predictions.md`, `theory-v0.6.0/related-works.md`,
  `growing-holographic-code.md`, `findings-26.md`.
- Scrambling and complexity: `theory-v0.7.0/notes/hyperbolic-geometry-in-quantum-theory.md`.