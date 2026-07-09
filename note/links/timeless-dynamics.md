# Vibe to Timeless Dynamics

Timeless Dynamics (James Lombardo) builds physics from one primitive, distinguishability
(how tellable-apart two states are), measured by the Fisher-Rao metric (the standard
distance between probability distributions), with time emerging rather than assumed. This
sheet lists what vibe and Timeless Dynamics each derive on their own, where they line up,
and where they part. Our most complete bridge, 10 experiments.

## Shared invariants (the survivors)

Structures both theories **derive, not assume**, from different primitives. (An invariant
here is anything that stays fixed: a conserved quantity, a forced structure, or a
correspondence that holds across both theories.)

- **Time = accumulated irreversible distinction.** Vibe: the wake (vibe's growing edge,
  the new cells added each step) piles up records, count 1 to 8857, and its arc length
  only ever rises (E-FND-0051). TD: accumulated Fisher-Rao arc length. Neither assumes
  time, both build it.
- **Records are the arrow.** Vibe: the knit (vibe's one reversible update rule) run
  forward then backward recovers the start exactly, zero cells differ (E-FND-0049). TD:
  the recordability condition (a real path must keep its records). Kept records are what
  give time a direction.
- **Fisher-Rao is forced.** Vibe: relabeling the 24 directions by a symmetry leaves the
  Fisher-Rao readout unchanged (deviation 6.7e-16) while a hand-weighted measure swings
  (0.99), so the geometry picks Fisher-Rao (E-FND-0057). TD: Chentsov's theorem (the one
  that makes Fisher-Rao the unique metric no relabeling can change). Same metric, two
  starts.
- **Born rule from a conserved norm.** Vibe: the |amplitude|^2 rule falls out of a
  conserved total and of envariance (a symmetry of the system-plus-environment), not a
  postulate. TD: Gleason's theorem (the Born rule from the state geometry).
- **A Lyapunov ceiling on record persistence.** Vibe: a coherent record survives only
  below a Lyapunov exponent (the rate at which nearby states pull apart, the chaos rate),
  contrast 0.041 above it and 0.241 below (E-QTM-0092). TD: the Hyperion chaos threshold
  (Saturn's moon Hyperion tumbles chaotically above a derived rate). The freshest survivor,
  push here.

Five shared survivors, more than any other theory.

## Correspondence

| vibe | Timeless Dynamics | exp | grade |
| --- | --- | --- | --- |
| the wake (growing edge) | time as Fisher-Rao arc length | E-FND-0051 | firm |
| the knit erases nothing (exact reverse) | the recordability condition | E-FND-0049 | firm |
| fixed-mesh knit is a closed loop, no arrow | so time is the wake, not the knit | E-FND-0048 | firm |
| Fisher-Rao forced by relabeling | Fisher-Rao forced by Chentsov | E-FND-0057 | firm |
| record axis and radial-scale axis kept distinct | the five-coordinate argument | E-FND-0052 | firm |
| growth forced by recurrence (a finite reversible system must repeat) | records must accumulate for time | E-FND-0055 | firm |
| Lyapunov ceiling on record contrast | the Hyperion chaos threshold | E-QTM-0092 | firm |
| a coarse block window records at most ln(B) bits, the excess spills out | recordability capacity, records at most the local channel limit | E-FND-0072 | structural |
| the gravity potential is short-ranged in the curved interior | TD Poisson gravity from the information potential | E-GRV-0049 | structural |
| that short range is size-independent | the same gravity, its limited reach | E-GRV-0050 | structural |

## Divergences

- **Continuous vs discrete.** TD is a smooth manifold, vibe is a discrete lattice, so every
  map between them is an approximation, never a one-to-one match.
- **The sign.** Vibe's tone on a cell is +1, -1, or 0, and the +/- difference (the mirror)
  is fundamental to vibe. The map into TD reads only how active a cell is, not whether it
  is + or -, so it drops the mirror. TD does not use that sign.
- **Holography.** Vibe treats its flat boundary region (the cusp) as a screen that encodes
  the interior (holography). TD rejects holography. Same coordinate layout, opposite
  reading of it. A fork worth putting to him.
- **Gravity.** TD derives Newtonian gravity from its information potential. Vibe finds that
  same potential short-ranged in the curved interior, so in vibe it can only act on the
  flat boundary, not through the bulk.
