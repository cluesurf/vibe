# P3 Under Growth: a Stable, Expanding Vibe Mesh

The static result showed a hyperbolic random graph has exponential reach, Lorentz
isotropy, and greedy navigability at once. The natural objection: that is a
one-shot construction, not a living mesh. This study answers it. As the mesh grows
(an expanding hyperbolic disc at constant density, Vibe Theory's eternal
expansion), all three properties persist. The both-worlds substrate is dynamical,
not just kinematic.

Reproduce: `npx tsx code/experiment/p3-growth.ts`.

## The setup

We model growth as an expanding hyperbolic disc. The number of nodes grows while
the disc radius grows with ln(N), so the density (and the mean degree) stays
constant, the way a real expanding space keeps its local structure. The base
radius is chosen to reproduce the both-worlds density (mean degree about 10). At
each size we re-measure:

- **reach**: the geometric-mean ball-growth ratio, averaged over several centers
  (well above 1 for exponential reach).
- **anisotropy**: the angular order parameter (below 0.25 means Lorentz-safe).
- **navigability**: greedy and backtracking geometric routing success.

## The result

```
size   radius  meanDeg  growthRatio  anisotropy  greedy  backtrack
 400    5.70     9.9       2.31        0.112       87%     100%
 800    6.39    10.3       3.02        0.094       98%     100%
1600    7.09     9.6       2.44        0.111       96%     100%
3200    7.78    10.0       2.30        0.092       86%     100%

reach exponential (growth ratio > 1.5):  YES
Lorentz-safe (anisotropy < 0.25):        YES
navigable (backtrack > 95%):             YES
both-worlds property survives growth:    YES
```

Across an eightfold growth (400 to 3200 nodes, radius 5.7 to 7.8), at constant
density:

- the **ball-growth ratio stays around 2.3 to 3.0**, well into the exponential
  regime, at every size,
- the **anisotropy stays around 0.1**, far below the 0.25 preferred-frame line,
  as Lorentz-safe as a static sprinkling,
- **backtracking routing reaches 100 percent** of connected targets at every size,
  with greedy routing at 86 to 98 percent.

## What this says

The both-worlds property is **scale-stable under growth**. A mesh that starts as a
Lorentz-safe, exponentially-reaching, navigable hyperbolic graph stays that way as
it expands. This lifts the P3 result from a static existence proof to a dynamical
one: the vibe mesh can grow, in the framework's own eternal-expansion sense, and
remain a both-worlds substrate throughout. The mean degree holds at about 10, so
the local structure is genuinely preserved, not diluted, as the mesh grows.

## Honest caveats

- **An expansion model, not a microscopic growth rule.** We grow by enlarging the
  disc at constant density, the faithful continuum picture of expansion. A
  microscopic rule that adds one node at a time by a local attachment law would be
  the next refinement, and should give the same result since the proximity rule is
  already local.
- **Finite-size reach estimator.** At constant density the disc saturates in a few
  hops, so the ball-growth ratio is averaged over several centers to be stable. It
  is a robust indicator of exponential reach, not a precise growth exponent.
- **Static snapshots.** Each size is its own graph at the appropriate radius. The
  snapshots are nested in spirit (same density, growing radius) but generated
  independently per size.

## Status

P3 strengthens from **candidate solved (static)** to **candidate solved and
stable under growth**. The both-worlds substrate survives an expanding mesh,
keeping reach, Lorentz safety, and navigability across an eightfold growth. The
remaining refinement is a microscopic one-node-at-a-time growth rule coupled to
the causal graph dynamics.

## See also

`p3-both-worlds.md` (the static result), `note/questions/roadmap.md` (A2).
