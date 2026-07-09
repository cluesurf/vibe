# Vibe to Chronoflux

Chronoflux (Roy Herbert, 38 papers) builds physics from one conserved current of time (a
flow of time filling spacetime, with a density and a direction at every point), its only
law being zero divergence (what flows in equals what flows out, everywhere). It is the
continuous version of what vibe does discretely, so this sheet derives Chronoflux from
vibe rather than adopting it.

## Shared invariants (the survivors)

Structures both theories derive from different starting points. (An invariant here is a
quantity or structure that stays fixed: conserved, forced, or matching across both.)

- **One conserved local quantity is the whole ontology** (the single fundamental thing,
  everything else a face of it). Vibe: charge conserved to the integer, 1112 pairs made
  and 1112 annihilated, net zero ([`E-FND-0008`](../../test/experiment/foundations/conserved-dynamics.ts)). Chronoflux: div J = 0, the continuity law,
  nothing created or destroyed. The same role in each theory, one discrete and one
  continuous. This is the match the rest builds on.
- **Time = a positive divergence of the conserved flow.** Vibe: the wake (the growing
  edge) shows up as a strictly positive outflow that equals the count of newly born cells
  exactly, and is zero in the settled interior ([`E-CSM-0043`](../../test/experiment/cosmology/wake-expansion-scalar.ts)). Chronoflux: the expansion
  scalar (the rate space expands) is the global thinning of the current. The clearest
  direct match in the set.
- **Records as recoverability.** Vibe: the reversible rule keeps records ([`E-FND-0049`](../../test/experiment/foundations/record-preserving-paths.ts)).
  Chronoflux: the recoverability functional (how much of the past a region can still
  recover, accessible over total), which ties entropy, decoherence, and horizons together.
- **Gravity is a coarse-grained stress response** (the geometry bending to match the
  block-averaged flow). Vibe: area-law gravity (entropy set by the boundary area, not the
  volume) from the conserved substrate ([`E-GRV-0047`](../../test/experiment/gravity/coarse-stress-closure.ts)). Chronoflux: curvature forced to match
  the current's stress.

## Correspondence

| vibe | Chronoflux | experiment&nbsp;&nbsp;&nbsp;&nbsp; | grade |
|:--- |:--- |:--- |:--- |
| conserved tone, integer-exact | the conserved current div J = 0 | [`E-FND-0008`](../../test/experiment/foundations/conserved-dynamics.ts) | firm |
| the coarse (block-averaged) tone-current is conserved | zero-divergence continuity | [`E-GRV-0039`](../../test/experiment/gravity/coarse-continuity-closure.ts) | firm |
| the wake, a positive outflow at the edge | the expansion scalar | [`E-CSM-0043`](../../test/experiment/cosmology/wake-expansion-scalar.ts) | firm |
| how much a coarse region can recover | the recoverability functional R | [`E-GRV-0040`](../../test/experiment/gravity/recoverability-functional.ts) | firm |
| the coarse tone-current in the smooth limit | the continuum current | [`E-GRV-0046`](../../test/experiment/gravity/continuum-limit-of-tone-current.ts) | structural |
| the coarse tone-stress balances | gravity as stress consistency | [`E-GRV-0047`](../../test/experiment/gravity/coarse-stress-closure.ts) | structural |
| the 24-direction frame, splitting into a vector and two spinor sets (8v + 8s + 8c) | the timelike flow direction u | (algebra) | firm |
| measurement as the state settling deterministically into one outcome | collapse as the current relaxing | (shared) | firm |

## Divergences

- **Continuous vs discrete.** Chronoflux's fitted continuum constants (its coupling, a
  scalar mass, a relaxation time) are tuned numbers vibe does not carry.
- **A dissipative rate.** Chronoflux adds a Lindblad collapse rate (a damping coefficient
  put in by hand). Vibe is fully reversible, so its collapse emerges from the dynamics with
  no added rate.
- **Astrophysics and the wider claims.** Gravitational-wave echoes, the Millennium
  Problems, and inertia engineering sit beyond what vibe models, so they are not imported.
- **The central unbuilt calculation.** The explicit averaging that turns lattice
  conservation into div J = 0 for a named field is a well-posed conjecture, not yet a
  result.

## See also

- [../triangulating-invariants.md](../triangulating-invariants.md), the method and the full list of recurring invariants across theories.
- [readme.md](readme.md), the index of every theory map.
