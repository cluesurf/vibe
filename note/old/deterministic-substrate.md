# A Non-Random Substrate

**Status: spec plus a working proof of concept. The golden-angle hyperbolic sunflower
is deterministic, non-arbitrary, and as Lorentz-safe as the random sprinkle.**

## The tension

The substrate was built as a *random* hyperbolic graph. The randomness was not a whim.
It was load-bearing: a regular lattice or a regular tiling has preferred directions, so
on it the speed of light depends on direction and Lorentz invariance breaks (P27). A
random scatter has no preferred direction in distribution, so it is Lorentz-safe.

But the framework rejects true randomness (see the vision: there is no randomness, only
determination by the whole that is opaque to the part). So we need a substrate that is
**deterministic and non-arbitrary, yet still has no preferred frame.**

## What we actually need

The point set has to be:

1. **Deterministic.** No random number generator.
2. **Non-arbitrary.** Not one choice among many, but a forced or optimal one.
3. **Aperiodic.** No lattice periodicity, since periodicity is a preferred structure.
4. **Equidistributed.** Uniform by the hyperbolic area measure, so no radial bias.
5. **Angularly isotropic in the limit.** No preferred direction.
6. **Navigable**, and ideally **self-generating from a seed**.

A lattice fails 3 and 5. A regular hyperbolic tiling fails 5 (it keeps a discrete
rotational symmetry). True random fails 1 and 2. So the target is the narrow band of
**deterministic, low-discrepancy, aperiodic** point sets.

## Candidate solutions, ranked

### 1. The golden-angle hyperbolic sunflower (recommended, and now implemented)

Place point `i` of `n` by:

- **Radius**: `u_i = (i + 1/2) / n`, then `r_i = arccosh(1 + u_i (cosh R - 1))`. This is
  the exact inverse of the hyperbolic-area cumulative distribution, sampled at evenly
  stratified heights. It equidistributes the radius by area with **zero** randomness.
- **Angle**: `theta_i = 2*pi * frac(i * phi_inv)`, where `phi_inv = 0.6180339887...` is the
  golden ratio conjugate. This is the golden-angle (sunflower) sequence.

Why this is **non-arbitrary**, not just one option: the golden ratio is the **most
irrational number**, its continued fraction is all ones, so `i * phi_inv mod 1` is the
slowest sequence in the world to fall near any rational, which means the angles never
clump into spokes and never line up into a lattice. By the three-distance theorem and
Weyl equidistribution, the golden angle gives the **lowest-discrepancy** placement of
points on a disc. The sunflower is not a choice among many. It is the unique optimum for
"spread points as evenly as possible with no preferred direction." Nature already uses
it, in phyllotaxis, for exactly this reason.

So this construction removes both random inputs (radial and angular) and replaces them
with the provably optimal deterministic equidistribution. It is **more uniform than a
random draw** (lower discrepancy), not less.

### 2. Deterministic growth from a seed (the framework-native answer)

The deepest answer fits the philosophy directly: the mesh is not sprinkled at all, it
**grows from one element by a deterministic local rule**, and its apparent randomness is
deterministic complexity ("determined by the whole, opaque to the part"). This is the
honest long-term target. It is harder to make provably isotropic, and it is the natural
next research step after the sunflower. The sunflower is the static optimum, the
deterministic growth is the dynamic one.

### 3. Regular {p, q} hyperbolic tessellations (and the curvature surprise)

This is the most interesting case, and the earlier intuition was wrong. A regular
tiling has a discrete rotational symmetry, and in FLAT space that gives it a preferred
frame, exactly like a lattice. So one expects the regular hyperbolic tilings {7,3} and
{5,4} to break Lorentz invariance too.

They do not. Measured (P40), the regular {7,3} and {5,4} tilings come out **as isotropic
as the random sprinkle, or better** (anisotropy about 0.02 to 0.03 versus 0.07 for the
sprinkle), while a flat lattice is 1.0. The reason is curvature: in hyperbolic space
there is no global parallelism, so a regular tiling fans its cell directions around the
disc and never lines them up the way a flat lattice does. The holonomy of the curved
space scrambles the directions that flatness would align.

So the regular hyperbolic tessellations are genuine working non-random substrates,
deterministic, exactly addressable (Margenstern's Fibonacci coordinates), and
Lorentz-safe. The lesson: **what buys Lorentz safety is hyperbolic curvature, not
disorder.** Randomness was never the essential ingredient.

### 4. Halton and other low-discrepancy sequences

The Halton(2, 3) sequence mapped onto the disc (base-2 radical inverse for the radius
through the area inverse-CDF, base-3 for the angle) is another deterministic,
low-discrepancy, isotropic substrate, measured Lorentz-safe in P40. A second sequence
option alongside the sunflower.

### 5. Energy-minimizing relaxation

Place points by deterministically minimizing a repulsion energy. This gives a unique,
non-arbitrary configuration, but it is expensive and not measurably better than the
sunflower. A fallback, not a first choice.

## The honest Lorentz question

A single deterministic set has one definite arrangement, so it cannot be perfectly
isotropic the way an ensemble average over random sets is. The real test is empirical:
does the deterministic set pass the **same anisotropy measure** as the random one? If
its link directions are as evenly spread, it is as Lorentz-safe in practice, and we have
removed the randomness for free.

## The result

Four non-random substrates are implemented in `code/substrate/hyperbolic-graph` and
measured side by side against the random sprinkle and a flat lattice
(`p39-deterministic-substrate` and `p40-non-random-substrates`):

| substrate | Lorentz anisotropy | Lorentz-safe |
| --------- | ------------------ | ------------ |
| flat lattice (control) | 1.000 | no |
| random sprinkle | 0.070 | yes |
| sunflower (golden angle) | 0.049 | yes |
| Halton (2,3) disc | 0.062 | yes |
| tiling {7,3} | 0.027 | yes |
| tiling {5,4} | 0.021 | yes |

The full {p,4} and {p,3} families (the pentagrid and heptagrid relatives) are surveyed in
`p41-margenstern-tilings`, and all are Lorentz-safe.

So **several** non-random substrates work: the golden-angle sunflower, the Halton disc,
and the regular {7,3} and {5,4} tessellations. Every hyperbolic one is Lorentz-safe and
only the flat lattice is not. The deep lesson is that **randomness was never the essential
ingredient. Hyperbolic curvature is.** The substrate does not need randomness, and it does
not even need disorder.

## 3D: the dodecagrid {5,3,4}

Margenstern's main three-dimensional structure is the **dodecagrid**, the regular {5,3,4}
honeycomb of right-angled dodecahedra in hyperbolic 3-space. We built it deterministically
(`code/substrate/hyperbolic-honeycomb`): a central hyperbolic dodecahedron at the
right-angled circumradius (dihedral 90 degrees, four cells per edge), reflected across its
twelve faces by sphere inversions in the Poincare ball, breadth-first. Measured against a
flat 3D cubic lattice (`p45-dodecagrid`):

| substrate | Lorentz anisotropy | Lorentz-safe |
| --------- | ------------------ | ------------ |
| flat cubic lattice (3D control) | 1.000 | no |
| dodecagrid {5,3,4} (3D hyperbolic) | 0.075 | yes |

The dodecagrid is Lorentz-safe with exponential reach, while the flat cubic lattice has a
strong preferred frame. So the curvature lesson holds in **three dimensions too**: a
regular hyperbolic honeycomb is Lorentz-safe because curvature scrambles the global
directions a flat lattice lines up. The dodecagrid joins the 2D pentagrid and heptagrid as
a deterministic, non-random, Lorentz-safe substrate.

## The remaining frontier

Solution 2, deriving the same isotropy from a deterministic growth rule rather than a
static placement, and a fully addressed 3D navigation (the 3D analogue of P42).

## See also

`note/the-model.md` (the model), `p3-study` and `p27-lorentz-violation` (why the
substrate must be Lorentz-safe), `p39-deterministic-substrate` (the sunflower),
`p40-non-random-substrates` (the family), `p41-margenstern-tilings` (the {p,4} and {p,3}
survey), `p42-fibonacci-navigation` (exact addressing), and `p45-dodecagrid` (the 3D
honeycomb).
