# P41: The Margenstern Hyperbolic Tilings, Surveyed

**Status: demonstrated. Both Margenstern families are Lorentz-safe.**

## The question

P40 showed the pentagrid {5,4} and heptagrid {7,3} are Lorentz-safe. Maurice
Margenstern's program centers on two whole families: the {p,4} family (pentagrid and
relatives) and the {p,3} family (heptagrid and relatives). Do they all hold?

## Result

| tiling | vertices | mean degree | Lorentz anisotropy | reach | Lorentz-safe |
| ------ | -------- | ----------- | ------------------ | ----- | ------------ |
| pentagrid {5,4} | 2504 | 41.9 | 0.030 | yes | yes |
| {6,4} | 2510 | 19.1 | 0.039 | yes | yes |
| {8,4} | 2534 | 10.3 | 0.056 | yes | yes |
| heptagrid {7,3} | 2502 | 74.9 | 0.032 | yes | yes |
| {8,3} | 2534 | 30.4 | 0.050 | yes | yes |
| {9,3} | 2536 | 17.1 | 0.030 | yes | yes |

Every tiling in both families is Lorentz-safe, with small anisotropy (well under the
0.25 preferred-frame threshold) and exponential reach.

## Reading

This confirms the P40 lesson across the whole program: every regular hyperbolic tiling
is Lorentz-safe, because curvature scrambles the global directions a flat lattice would
line up. So Margenstern's tilings give the model a large family of deterministic,
exactly-addressable (via his Fibonacci coordinate systems), Lorentz-safe substrates.

## Honest reading

The 3D hyperbolic honeycomb (the dodecagrid {5,3,4}) needs a genuine 3D generator
(sphere inversions) and is not yet covered here. The triangular trigrids {3,p} are
noisier at small sizes. Those are the remaining pieces.

## See also

`p40-non-random-substrates.md`, `note/deterministic-substrate.md`, and
`p41-margenstern-tilings` (the experiment).
