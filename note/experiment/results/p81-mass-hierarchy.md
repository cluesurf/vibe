# P81: The Mass Hierarchy from Hyperbolic Overlaps

**Status: mechanism and order of magnitude, no longer fitted to the masses.**

## The fix

The earlier version chose the per-step spacing as ln(observed span) / 8, which made "reproduces the
observed 5.5 decades" a tautology. That is removed. The spacing is now the crystal's OWN inter-shell
hyperbolic distance, measured from the substrate (0.86, with the localization length set to one
curvature radius). The resulting span is a prediction, not a fit.

## Result

| overlap law | span from the geometric spacing |
| ----------- | ------------------------------- |
| exponential (hyperbolic substrate) | 3.0 decades (predicted) |
| power-law (flat substrate) | 1.8 decades |
| observed (top quark over electron) | 5.5 decades |

With the spacing fixed to the geometry (no tuning), the exponential mechanism gives a 3.0-decade
hierarchy, the same order of magnitude as the observed 5.5, and beats the flat power law (1.8
decades) from identical positions. To hit 5.5 exactly would require a localization length of about
0.54 curvature radii, which is plausible but an extra input, reported and not used.

## Reading

The genuine result is the mechanism and the order of magnitude, not the exact value. Exponential
localization turns a linear (integer) spread of mode positions into an exponential (multi-decade)
spread of masses, which is the right form for a hierarchy, while a power-law (flat) overlap saturates
at under two decades. The exact span depends on the localization length, and the specific masses are
not derived.

## See also

`p25-electroweak.md`, `p79-anomaly-charge-quantization.md`, the roadmap entry on Yukawa couplings.
