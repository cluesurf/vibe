# P26: Swerves (Momentum Diffusion from Discreteness)

**Status: demonstrated. A distinctive observational signature, with honest caveats.**

## The question

On a continuum geodesic a free particle keeps its velocity forever. On a causal set
there is no element exactly straight ahead, so the particle hops to the nearest
available future element and its velocity gets a tiny kick each step. Does this produce
a measurable momentum diffusion, the Dowker-Henson-Sorkin swerve?

## What we did

Poisson-sprinkle 2D Minkowski. Walk a particle as straight as the discreteness allows
(at each step choose the future point, in a proper-time shell, whose hop rapidity is
closest to the current one). Measure the rapidity variance versus proper time,
averaged over many trajectories.

## Result

- **The rapidity diffuses.** Its variance grows linearly with proper time over the
  clean range (0.08 at proper time 0.8 up to 0.52 at 11). A free particle on a causal
  set does NOT keep its velocity, it random-walks in momentum, the swerve.
- A positive diffusion slope at every sprinkling density (0.079, 0.044, 0.012 at
  density 0.6, 1.2, 2.4).

So discreteness forces momentum diffusion, an effect with **no continuum analogue**.
Over cosmic times it heats particles, a distinctive observational signature for cosmic
rays and the dark sector that a continuum theory cannot produce.

## Honest caveats

- The variance SATURATES at large proper time, as wide-rapidity trajectories leave the
  finite box. This is a boundary effect and is excluded from the slope fit.
- The precise dependence of the diffusion constant on density is not clean here (it
  decreases with density in this fixed-band selection rule). The canonical
  Dowker-Henson-Sorkin scaling needs a fully covariant trajectory rule. The swerve
  itself (diffusion exists, distinctive to discreteness) is robust.

## Why it matters

This is one of the framework's distinctive, OBSERVATIONAL predictions, the kind that
could test the theory against nature rather than just reproduce known physics. A
continuum theory has no swerve. Discreteness predicts one, and its size is set by the
discreteness scale.

## See also

`note/what-the-testbed-proves.md` (why distinctive predictions matter most),
`note/questions/frontiers.md` (the other observational signatures), and `p26-swerves`
(the experiment).
