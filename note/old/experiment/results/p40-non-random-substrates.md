# P40: A Family of Non-Random Substrates

**Status: demonstrated. Several deterministic substrates are Lorentz-safe. Curvature, not disorder, is the key.**

## The question

P39 gave one deterministic substrate (the golden-angle sunflower). Are there others, in
particular the regular {p,q} hyperbolic tessellations of Margenstern's work ({7,3} and
{5,4})? And what actually buys Lorentz safety?

## What we did

Built and measured several substrates on the same Lorentz-isotropy and reach tests: the
random sprinkle, the golden-angle sunflower, a Halton(2,3) disc, the regular {7,3} and
{5,4} tilings, and a flat lattice control.

## Result

| substrate | mean degree | Lorentz anisotropy | reach | Lorentz-safe |
| --------- | ----------- | ------------------ | ----- | ------------ |
| flat lattice (control) | 3.9 | 1.000 | no | no |
| random sprinkle | 10.6 | 0.070 | yes | yes |
| sunflower (golden angle) | 9.1 | 0.049 | yes | yes |
| Halton (2,3) disc | 9.5 | 0.062 | yes | yes |
| tiling {7,3} | 201.7 | 0.027 | yes | yes |
| tiling {5,4} | 66.3 | 0.021 | yes | yes |

Every hyperbolic substrate is Lorentz-safe, **including the regular {7,3} and {5,4}
tessellations**, which come out as isotropic as the random sprinkle or better. Only the
flat lattice has a preferred frame.

## The surprise: curvature, not disorder

A regular tiling in FLAT space breaks Lorentz invariance, like a lattice. The regular
hyperbolic tilings do not. The reason is curvature: in hyperbolic space there is no
global parallelism, so a regular tiling fans its cell directions around the disc and
never lines them up. The holonomy of the curved space scrambles the directions that
flatness would align. So **what buys Lorentz safety is hyperbolic curvature, not
randomness, and not even disorder.** This sharpens the whole substrate story: the random
sprinkle of P3 was sufficient but never necessary.

## Several working non-random substrates

The golden-angle sunflower, the Halton disc, and the regular {7,3} and {5,4} tilings are
all deterministic and Lorentz-safe. The tilings have the further advantage of exact
addressing (Margenstern's Fibonacci coordinates). The substrate no longer needs
randomness.

## Honest reading

The tiling degrees are high here because the proximity connection at this scale includes
several cells. The anisotropy is measured from the nearest-link directions and is robust
to that. The remaining frontier is the same isotropy from a deterministic growth rule
rather than a static placement.

## See also

`note/deterministic-substrate.md` (the spec), `p39-deterministic-substrate`, `p3-study`,
`p27-lorentz-violation`, and `p40-non-random-substrates` (the experiment).
