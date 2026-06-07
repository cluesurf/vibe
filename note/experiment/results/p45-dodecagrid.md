# P45: The Dodecagrid, the 3D Hyperbolic Honeycomb {5,3,4}

**Status: demonstrated. The 3D hyperbolic honeycomb is Lorentz-safe, like the 2D tilings.**

## The question

Margenstern's main 3D structure is the dodecagrid, the regular {5,3,4} honeycomb of
right-angled dodecahedra in hyperbolic 3-space. P40 and P41 showed the 2D regular tilings
are Lorentz-safe because curvature scrambles direction. Does the same hold in three
dimensions?

## What we did

Built the dodecagrid deterministically: a central hyperbolic dodecahedron at the
right-angled circumradius (dihedral 90 degrees, four cells per edge), reflected across its
twelve faces (sphere inversions in the Poincare ball), breadth-first. Connected by
hyperbolic distance and measured Lorentz isotropy against a flat 3D cubic lattice.

## Result

| substrate | mean degree | Lorentz anisotropy | reach | Lorentz-safe |
| --------- | ----------- | ------------------ | ----- | ------------ |
| dodecagrid {5,3,4} (3D hyperbolic) | 11.6 | 0.075 | yes | yes |
| flat cubic lattice (3D, control) | 5.6 | 1.000 | no | no |

The dodecagrid is Lorentz-safe (small anisotropy, comparable to the random sprinkle) with
exponential reach, while the flat 3D cubic lattice has a strong preferred frame.

## Reading

The P40 lesson holds in three dimensions too: a regular hyperbolic honeycomb is
Lorentz-safe, because curvature scrambles the global directions a flat lattice lines up.
So Margenstern's 3D dodecagrid is a deterministic, non-random, Lorentz-safe substrate,
joining the 2D pentagrid and heptagrid families.

## Honest reading

The cell circumradius is solved numerically (binary search for the 90-degree dihedral),
and the patch is finite. The anisotropy and reach are robust to that. A fully
addressed 3D navigation (the 3D analogue of P42) is the natural next step.

## See also

`p40-non-random-substrates.md`, `p41-margenstern-tilings.md`,
`note/deterministic-substrate.md`, and `p45-dodecagrid` (the experiment).
