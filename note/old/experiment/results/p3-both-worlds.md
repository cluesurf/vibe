# P3: A Both-Worlds Substrate (the headline finding)

The most Vibe-Theory-specific open problem is the **addressing-versus-Lorentz
fork**. A regular `{p,q}` tiling gives clean Fibonacci finite-automaton
addressing but breaks Lorentz invariance (it has a preferred frame and voids). A
random Poisson sprinkling is Lorentz-safe but has no addressing. The framework
seems to need both: a substrate that is computable AND relativistic.

This study tests whether a **hyperbolic random graph** can have all three of the
properties at once: exponential reach, Lorentz isotropy, and usable navigation.

## The experiment

`code/experiment/p3-study.ts` sweeps the connectivity (the connection-distance
threshold) of a hyperbolic random graph of 1500 nodes, and measures:

- **reach**: is ball growth exponential (the exponential reach the mesh wants).
- **anisotropy**: the strongest angular order parameter of nearest-link
  directions (0 = isotropic / Lorentz-safe, 1 = a hard preferred frame).
- **routeSuccess**: the success rate of **greedy geometric routing** (always step
  to the neighbor closest to the target in the embedding), using only local
  neighbors and coordinates, no global table and no Fibonacci address.

The regular 3D Lorentzian lattice and a 3D Minkowski sprinkling are controls.

## The result

```
substrate              size  meanDeg  reach   anisotropy  routeSuccess
hyperbolic t=0.8       1500     0.8   false     0.081        0.003
hyperbolic t=1.2       1500     1.6   false     0.082        0.003
hyperbolic t=1.6       1500     2.7   false     0.076        0.012
hyperbolic t=2.2       1500     5.2   true      0.122        0.265
hyperbolic t=3.0       1500    10.8   true      0.069        0.977
lattice 3D (lorentz)    729     4.0   false     1.000        0.000
sprinkle M^3           1200    16.3   false     0.065        0.000
```

## What it says

There is a **connectivity threshold** for the both-worlds substrate. Below mean
degree ~3 the graph is too sparse: it fragments, so there is no exponential reach
and greedy routing gets stuck almost always. Above mean degree ~5 the graph
percolates and reach turns on. By mean degree ~11 (threshold 3.0) the hyperbolic
random graph has:

- **exponential reach** (true),
- **anisotropy 0.069**, far below the 0.25 preferred-frame line, so it is
  Lorentz-safe, essentially as isotropic as a pure sprinkling (0.065),
- **greedy-routing success 0.977**, so a vibe can route a message to any target
  using only its neighbors and coordinates, with no addressing table.

The controls fail the fork exactly as predicted. The **regular lattice** has
anisotropy 1.000, the maximal preferred frame, and greedy routing never succeeds
on its causal-link structure. The **sprinkling** is isotropic (0.065) but, as a
flat causal set, has no exponential reach and is not greedily navigable.

## The candidate resolution

> A connected hyperbolic random graph is a substrate with exponential reach,
> Lorentz isotropy, and navigability all at once. The price is giving up exact
> Fibonacci addressing in favor of **greedy geometric routing**, which needs only
> local neighbors and a coordinate, not a global automaton.

This is a candidate answer to the addressing-versus-Lorentz fork. You do not have
to choose between a computable mesh and a relativistic one. You trade the
*kind* of navigation: exact finite-automaton addressing on a rigid tiling, versus
approximate greedy routing on a random, Lorentz-safe, exponentially-reaching
graph. For Vibe Theory, which wanted both computability and relativity from one
substrate, the random hyperbolic graph is the substrate to build on.

## Honest caveats

- **Greedy routing is not exact addressing.** It succeeds 98 percent of the time
  here, not 100. A few source-target pairs hit local minima. Exact Fibonacci
  addressing never gets stuck. The trade is real: relativity and isotropy bought
  with a small routing failure rate. Whether 98 percent is "usable enough"
  depends on the application, and adding a fallback (backtracking, or a few
  landmark coordinates) would push it higher.
- **This is a static graph.** It tests kinematics, not the evolving, plastic mesh
  Vibe Theory ultimately wants. The next step is to check that greedy routing
  survives when the graph grows and rewires.
- **Reach detection is a heuristic** (unsaturated successive-ratio test), not a
  rigorous growth-exponent fit. The numbers are robust at these sizes but the
  estimator should be hardened for publication.
- **Isotropy is measured on a 2D spatial slice** (the first two spatial axes).
  Full higher-dimensional isotropy would check more projections.

## Next steps to push P3 further

1. Add a **landmark / backtracking fallback** to greedy routing and measure how
   close to 100 percent navigability you can get while staying Lorentz-safe.
2. Test routing and isotropy on a **growing** hyperbolic graph (couple to the
   causal-graph-dynamics rewriting), to move from kinematics to dynamics.
3. Quantify the **stretch** (route length over shortest path) at the both-worlds
   point, to measure the efficiency cost of greedy versus exact routing.
4. Push to higher embedding dimension and confirm isotropy holds across more than
   one spatial plane.
