# P2 at Scale: the Manifold Phase Is a Stable Basin

The smeared action selects manifold-like orders from a cold (antichain) start.
This study asks the stronger question: is the manifold phase a genuine **stable
basin** of the dynamics, and is there a transition between it and the layered
phase? We warm-start the Monte Carlo from both basins and sweep the coupling.

Reproduce: `npx tsx code/experiment/p2-transition.ts`.

## The setup

The order parameter is the height ratio (longest chain over sqrt N): about 1 for a
2D manifold, near 0 for a layered Kleitman-Rothschild order. We warm-start from
two orders of N = 72:

- a 2D **sprinkling** (the manifold basin), height ratio 1.89, dimension 1.99.
- a **Kleitman-Rothschild** three-layer order (the layered basin), height ratio
  0.35.

For each inverse temperature beta we run the smeared action (eps = 0.9) from each
start and record the height ratio averaged over the second (equilibrated) half of
the chain.

## The result

```
beta   sprinkle-start hr   layered-start hr   gap
0.5          2.34               1.11           1.23
1.0          2.09               1.01           1.08
2.0          2.00               0.92           1.08
4.0          1.89               1.06           0.82

contrast: sharp action, beta = 2, sprinkle start -> 1.51
```

Three things stand out:

1. **The manifold phase is stable.** Started from a sprinkling, the smeared-action
   dynamics keeps the height ratio at about 1.9 to 2.3 across all beta, right at
   the sprinkling reference (1.89). The manifold phase does not decay. It is a
   genuine stable basin, not merely something the cold start happens to find.
2. **The smeared action lifts the layered phase.** Started from the layered order
   (height ratio 0.35), the dynamics drives it up toward 1.0, away from layered and
   toward manifold-like. The action genuinely disfavors layered orders.
3. **The sharp action does the opposite.** The same manifold start, run under the
   sharp action, decays from 1.89 to 1.51. The sharp action erodes the manifold
   phase, the smeared action preserves it. This is the clearest single contrast
   between the two actions.

## What this says

This strengthens the P2 result from "the smeared action's cold-start ensemble is
manifold-like" to "**the manifold phase is a stable basin of the smeared-action
dynamics, and the sharp action is not.**" The manifold start stays manifold, the
layered start climbs toward manifold, and the sharp action erodes the manifold
start. Together these say the smeared action makes manifold-like order the favored,
stable phase, which is exactly what P2 asks for.

## Honest caveats

- **Metastability, not a proven phase transition.** A gap of about 0.8 to 1.2
  persists between the two starts at every beta: they do not fully merge. That gap
  is the signature of metastable coexistence (hysteresis), but at N = 72 with a
  finite chain it is partly slow mixing. We read it as evidence of two basins, not
  as a proven first-order transition. A real proof needs finite-size scaling and a
  faster move to reach a few hundred elements.
- **The layered start does not fully reach the sprinkling value.** It climbs to
  about 1.0, not 1.9. Either the manifold basin is hard to reach from deep in the
  layered basin (a barrier), or the chain has not fully equilibrated. Both are
  consistent with metastable basins.
- **One smearing, modest size.** Fixed eps = 0.9, N = 72. The faster incremental
  move (the speced next step) is what unlocks the scaling study.

## Status

P2 remains **candidate progress**, now strengthened: the manifold phase is a
stable basin under the smeared action, the sharp action erodes it, and there are
two metastable basins separated by a persistent gap. The remaining work is the
faster move and finite-size scaling to turn the metastability into a proven phase
transition (Front 2 and 3 of the frontier spec). P6 is the 2D specialisation and
shares this machinery.

## See also

`p2-dynamics.md` (the cold-start smeared-action result),
`note/questions/frontier-spec.md` (Fronts 2 and 3).
