# P12: The Free-Energy Crossing (Closing P2's Dominance Question)

**Status: measured. The manifold phase dominates above beta-star about 0.14.**

> Updated: the Wang-Landau refinement below now measures the crossing directly at
> N = 32 and 48, where the leading-order pass (further down) could only bound it.

## The question

P2 showed two phases coexist (a first-order signature), but not which one strictly
**dominates** the sum over histories, nor at what coupling. This is the free-energy
crossing: the coupling beta-star where the manifold (spacetime) phase becomes the
global free-energy minimum.

## Method

For weight e^{-beta S}, log Z_phase(beta) = log W_phase - integral_0^beta <S>_phase
dbeta'. So the free energies are set by two pieces:

- the **entropy gap** g = log W_layered - log W_manifold, read from the beta = 0
  manifold fraction f0 by g = log((1-f0)/f0),
- the **action gap** S_layered - S_manifold, measured from fresh typical configs of
  each phase (2D sprinklings for manifold, Kleitman-Rothschild orders for layered),
  which avoids the metastable-decay contamination of a sampled branch.

Then Delta logZ(beta) = logZ_manifold - logZ_layered = -g + (S_layered - S_manifold)
* beta, and the crossing is beta-star = g / (S_layered - S_manifold).

## Result

| N | entropy gap g | action gap (per unit beta) | beta-star |
| - | ------------- | -------------------------- | --------- |
| 16 | 1.4 | 50 | 0.03 |
| 24 | 0.4 (noisy) | 119 | small |
| 32 | 3.2 | 216 | 0.015 |

- The **action gap is large, positive, and extensive** (it grows like N^2): the
  smeared action favors smooth spacetime over layered orders by a wide, well-sampled
  margin. This is the solid, robust part.
- So a **finite crossing beta-star exists**, and the manifold (spacetime) phase is
  the **global free-energy minimum, the dominant phase, above it**. This is the
  answer P2 was missing: spacetime does not merely coexist, it **wins the sum over
  histories** above a finite coupling.

## Reconciliation with P2

beta-star is the **equilibrium** crossing (where the global minimum switches). The
layered phase stays **metastable** far above it: P2's cold-start runs sit in the
layered basin up to beta about 1 because of the first-order barrier (hysteresis).
Dominant phase and metastable phase are different things, and both hold here. So the
full picture is: manifold spacetime is the dominant phase at essentially any
appreciable coupling, with the layered phase a long-lived metastable competitor.

## Honest limits

The action gap is solid. The **entropy gap g is the weak link**: it is read from the
beta = 0 manifold fraction, reliably measurable only up to about N = 32 (beyond that
the manifold fraction falls below the sampling floor, and the N = 24 value is visibly
noisy). The precise large-N beta-star and its scaling need an entropy-estimation
method (Wang-Landau or multicanonical sampling) rather than direct fraction
counting. What is established is the **structure**: a finite crossing exists, the
manifold phase dominates above it, the layered phase is metastable, and the
mechanism is an extensive action advantage against a sub-extensive (at these N)
entropy advantage.

## Refinement: Wang-Landau (the measured crossing)

The honest limit above was the entropy gap. The refinement removes it. We estimate
the full density of states over the integer height by Wang-Landau sampling (the
1/t schedule of Belardinelli-Pereyra, with the transitivity-preserving single-pair
move), which crosses the entropy barrier and reaches the rare manifold heights that
direct counting cannot. With the per-height mean action this gives the free energy
at every coupling, so the crossing is measured, not bounded.

| N | entropy gap g | measured beta-star | manifold fraction at beta = 0, 0.1, 0.25, 0.5 |
| - | ------------- | ------------------ | --------------------------------------------- |
| 32 | 2.8 | 0.158 | 0.06, 0.26, 0.86, 1.00 |
| 48 | 6.0 | 0.126 | 0.00, 0.30, 0.88, 0.99 |

The equilibrium manifold fraction rises smoothly from near zero (layered dominates)
through the crossing to one (manifold dominates), and the measured **beta-star is
about 0.13 to 0.16, roughly independent of N**. So the manifold (spacetime) phase
**dominates the sum over histories for beta above about 0.14**, a finite continuum
transition coupling. This is a measured crossing, and it is much more physical than
the leading-order estimate, because Wang-Landau integrates over the whole density of
states rather than two extremal configs.

This upgrades P2 from a coexisting stable phase to a **measured dominant phase**: for
beta above the transition coupling, smooth spacetime is the dominant configuration of
the discrete gravitational path integral. The layered phase remains metastable far
above beta-star (the P2 coexistence), exactly the hysteresis of a first-order
transition.

**Remaining limit (now diagnosed precisely).** At N = 64 the per-height entropy drop
reaches about 8, a barrier even between adjacent heights. We tried windowed Wang-
Landau (overlapping height windows, stitched), which exposes the real obstacle: the
transitivity-preserving single-pair move CANNOT change the height of a maximal chain
(adding the top link would break transitivity), so a walk confined to a high window
and seeded from a chain is locked at its low height and never reaches the next. The
limit is therefore the MOVE SET, not just compute. Reaching N = 64 and beyond needs a
height-changing move (a cluster or worm update that extends or shortens a chain in one
step), or replica-exchange across windows with representative (non-chain) warm starts.
That is a dedicated sampler-design effort. The two converged sizes already establish
the scientific result: a finite, roughly N-independent crossing beta-star about 0.14.
The windowed Wang-Landau code is kept as infrastructure for that future move.

## See also

`p12-wang-landau` (the Wang-Landau experiment), `p2-uniform.md` (the coexistence and
the correct sampler), `p2-exact.md` (small-N enumeration), and
`note/questions/next-version.md` (P12).
