# P2 / P6: Why It Matters and the Optimal Path to Solving It

This is the deepest open problem in the whole program. This document says what it
is, why it matters for Vibe Theory, what a solution would tell you, and the exact
optimal path to get there.

## What P2 and P6 are

- **P2:** a dynamics (an action plus a measure) under which manifold-like causal
  sets DOMINATE the sum over histories. The obstacle is entropy: the
  Kleitman-Rothschild (KR) layered orders outnumber manifold-like orders
  astronomically, so a naive measure is swamped by flat, three-layer junk.
- **P6:** the 2D special case, a computable Lorentzian path integral over causal
  sets that lands on 2D manifold-like orders.

They are the same machinery (the causal-set Monte Carlo), so solving P2 solves P6.

## Why it matters, and what a solution would tell you

This is the crown jewel for Vibe Theory, and here is the precise reason.

- P5 (the Hauptvermutung) showed that geometry is recovered uniquely from an order.
  But it ASSUMED the order was manifold-like (a sprinkling). It answered "given a
  good order, you get a unique spacetime."
- P2 / P6 asks the prior question: **why is the order manifold-like at all?** If the
  dynamics does not favor manifold-like orders, then "spacetime is a vibe mesh"
  requires putting the smooth order in by hand. If the dynamics DOES favor them,
  spacetime emerges for free from the law.

So P2 / P6 is the line between two very different claims:

- **Vibe Theory can DESCRIBE spacetime as a mesh** (P5, done).
- **Vibe Theory's DYNAMICS PRODUCES spacetime** (P2 / P6, the prize).

A solution, a demonstrated phase transition from a layered phase to a manifold
phase as a coupling is tuned, would tell you that smooth, low-dimensional
spacetime is an emergent, dynamically-selected phase of the discrete substrate, not
an assumption. That is the strongest possible evidence that the universe is a vibe
mesh. It is needed to upgrade the framework from "coherent description" to
"generative theory."

## Where we are

The smeared Benincasa-Dowker action makes the manifold phase a stable basin at
small N (the sharp action fails, the smeared one works), and warm starts show two
metastable basins separated by a persistent gap. That is suggestive of a
first-order transition but not proof: at N about 70 with a single chain, the gap is
partly slow mixing, not necessarily true coexistence.

The bottleneck is computational. The Monte Carlo move repairs transitivity with an
O(N^3) Floyd-Warshall closure every step, which caps us near N = 70 to 96.

## The optimal path (exact, in priority order)

### 1. A faster move: incremental closure and incremental action

The single highest-leverage change. Two parts:

- **Incremental transitive closure.** Adding the relation i precedes j adds exactly
  the pairs (a, b) with a in past(i) plus i and b in future(j) plus j. With
  bit-matrix rows this is O(N^2) by OR-ing future(j) into every a-row, not O(N^3).
  Removal is the hard direction: a removed relation may still be implied by another
  path, so recompute reachability only within the affected order interval, bounded
  by the interval size rather than the whole set.
- **Incremental action.** The Benincasa-Dowker action depends only on the
  interval-abundance histogram N_k. A single relation toggle changes only the
  intervals that contain the toggled pair, so the change in N_k, and hence the
  change in the action, is local. Maintain N_k and update it by the delta, turning
  each action evaluation from O(relations) into O(affected intervals).

Together these take a move from O(N^3) to roughly O(N^2) or better, unlocking
N in the few hundred range, which is where the literature sees the transition.

### 2. Parallel tempering (replica exchange)

The fix for the metastability that confounds the warm-start study. Run R replicas
at a ladder of inverse temperatures beta_1 < ... < beta_R. Each replica does local
moves, and periodically adjacent replicas attempt a swap, accepted with probability
min(1, exp((beta_i - beta_j)(S_i - S_j))). Hot replicas roam freely and cool ones
refine, so configurations migrate across the ladder and escape metastable basins.
This gives true equilibrium where a single chain gets stuck, and is the standard
tool for first-order transitions.

### 3. The transition signatures (what to measure)

- **Double-peaked histogram.** At the transition coupling, the order-parameter
  distribution P(height ratio) is bimodal: a manifold peak and a layered peak
  coexisting. This is the smoking gun of a first-order transition. Watch it go
  unimodal to bimodal to unimodal as beta crosses the transition.
- **Susceptibility peak.** The variance of the order parameter (or of the action)
  peaks at the transition, and the peak sharpens and grows with N.
- **Binder cumulant crossing.** The fourth-order cumulant of the order parameter,
  plotted versus beta for several N, crosses at a common point: the transition
  coupling, independent of size. This pins the critical coupling and the order of
  the transition.

### 4. Finite-size scaling

Run at N = 50, 100, 200, 400. A genuine transition shows the susceptibility peak
growing with N (for first order, like the volume), the order-parameter jump
sharpening toward a discontinuity, and the Binder crossing converging. This is the
rigorous proof that the transition survives to the continuum, not a small-system
artefact.

### 5. The right action and the 2D restriction (for P6)

For P6 specifically, restrict to the 2D Benincasa-Dowker coefficients and confirm
the manifold phase has Myrheim-Meyer dimension near 2, and benchmark against the
known 2D continuum results (Surya, Glaser-Surya). Tune the smearing scale epsilon
by finite-size scaling rather than by hand.

## The optimal solution, stated

A demonstrated first-order phase transition: as the coupling crosses a critical
value, the dominant orders switch from layered (KR) to manifold-like (near 2D),
shown by a bimodal order-parameter histogram at the transition, a susceptibility
peak that grows with N, and a Binder cumulant that crosses at a size-independent
coupling, all under parallel tempering at N up to a few hundred enabled by the
incremental move. That would settle P2 and P6: spacetime is a dynamically selected
phase of the vibe mesh.

## What we can do now (down-payment)

Parallel tempering does not need the faster move to help at moderate N. Running it
on the existing machinery at N about 64, with the order-parameter histogram and
susceptibility, directly tests for coexistence where the single-chain warm-start
study could not. That is the concrete next step, implemented alongside this spec.

## See also

`p2-dynamics-spec.md` (the smeared action), `note/experiment/results/p2-dynamics.md`
and `p2-transition.md` (current results), `roadmap.md` (A3).
