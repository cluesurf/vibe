# P68: Dimension Selection (Why Three, of Two, Three, Four)

**Status: solved. Only three spatial dimensions gives stable closed orbits.**

## The question

P62 showed the crystal substrate can only exist in spatial dimensions 2, 3, 4. Which does the
universe pick, and why three?

## The criterion

Ehrenfest's argument (1917). Gravity in d spatial dimensions is an inverse-(d-1) power force
(the Gauss law), F ~ 1 / r^(d-1). For such a central force a circular orbit is stable only if
d < 4, and the orbit is a CLOSED ellipse, with no precession (Bertrand's theorem), only for the
inverse-square law, which is exactly d = 3. We confirm by integrating real orbits (RK4) from a
perturbed-circular start and measuring stability and perihelion precession.

## Result

| d | apsidal angle | stable orbit | closed orbit | precession per orbit | clean waves (Huygens) |
| - | ------------- | ------------ | ------------ | -------------------- | --------------------- |
| 2 | 127 deg | yes | no | -1.86 rad (precesses) | no |
| 3 | 180 deg | yes | yes | 0.00 rad (closes) | yes |
| 4 | n/a | no | no | unstable (spirals/escapes) | no |
| 5 | n/a | no | no | unstable | yes |

Only d = 3 gives stable, closed orbits.

## Reading

Among the allowed window {2, 3, 4}, three spatial dimensions is uniquely selected. Two
dimensions gives bound but precessing orbits (apsidal angle 127 degrees, not 180, so the orbit
never closes, no stable repeating structure). Three dimensions gives the inverse-square law,
stable closed ellipses (atoms, solar systems, lasting structure), apsidal angle exactly 180
degrees, zero precession. Four dimensions and up give no stable bound orbit at all. Clean,
wake-free wave propagation (Huygens' principle) independently selects odd dimensions, and three
is the only odd one in the window.

Two independent criteria, one answer. Of the dimensions a crystal substrate can exist in (P62),
only three supports stable matter and clean signals, so a universe that can hold atoms, orbits,
and sharp waves is three-dimensional in space (four-dimensional with time). The dimension is now
pinned: P62 narrows it to {2,3,4} by the geometry of the crystal, and P68 selects 3 by the
physics that can live on it.

## See also

`p62-dimension-window.md` (the {2,3,4} window), `p16-newtonian.md` (the 1/r potential in 3D),
and `note/roadmap.md`.
