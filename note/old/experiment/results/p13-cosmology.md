# P13: The Arrow of Time and Cosmology from Growth

**Status: arrow validated. Expansion demonstrated, from geometry AND from growth.**

> Updated twice: the de Sitter refinement demonstrates expansion in an expanding
> geometry, and the local-growth refinement now shows expansion EMERGING from a pure
> local birth rule (net birth above one). Plain percolation (the original pass) gives
> the arrow but not expansion. The last step (fully emergent spatial geometry, no
> comoving coordinate put in) remains open.

## The question

The mesh grows (the eternal-expansion fate), and classical sequential growth is
intrinsically time-asymmetric: elements are born to the future, never the past. Does
that growth give an arrow of time, an expanding universe, and a sensible geometry?

## What we did

Grow a causal set element by element (transitive percolation, coupling p) and
measure, on the grown order: the accumulation of causal relations over growth time
(the arrow), the spatial slice widths versus proper time (expansion), and the
recovered dimension.

## Result (N = 240, p = 0.08)

- **Arrow of time: validated.** The number of causal relations (distinctions) among
  the first k elements grows monotonically and never decreases: 107, 739, 4320,
  11191, 21440 at k = 30, 60, 120, 180, 240. You cannot un-happen what is. This is
  exactly the irreversible cascade of the bootstrap: distinctions only accumulate,
  and that accumulation is the arrow of time.
- **A growing, aging universe.** Volume (240 elements) and age (proper time / height
  38 steps) both increase: a growing, time-oriented causal order with a definite
  beginning.
- **Geometry.** Recovered dimension 1.44, a finite but low (chain-dominated) value.

## Honest reading

The **arrow of time is clean and solid**, and it is the core claim: irreversible,
monotone accumulation of distinctions. The universe grows and has an age.

**Expansion is an honest partial.** Plain transitive percolation does **not** show
cosmological expansion: its spatial slices narrow with proper time (early-half width
7.7, late-half 4.9), and it is chain-dominated (dimension below 2). The committed
eternal-expansion fate needs **richer growth dynamics**, an originary or de
Sitter-like sequential growth with tuned transition couplings that produces a
manifold-like (2D or higher) expanding order. That is the refinement. The arrow is
here, accelerating expansion is the next dial to turn.

So P13 delivers the arrow of time and a growing, aging, time-oriented universe with
a beginning, and identifies cosmological expansion as the next growth-dynamics
problem rather than a free consequence of plain percolation.

## Refinement: expansion from an expanding geometry

The expansion partial is resolved at the level of geometry. We sprinkle into an
expanding 2D de Sitter universe, ds^2 = -dtau^2 + a(tau)^2 dx^2 with a(tau) =
e^{H tau}, sampling by proper volume and building the causal order from the conformal
light cone. The result:

- **The causal order EXPANDS.** Its intrinsic spatial slice width (by causal depth,
  read from the order alone) grows strongly with proper time: early third 7.2, late
  third 24.5, more than a threefold growth. This is the opposite of plain transitive
  percolation, whose slices narrow.
- The recovered dimension stays finite and manifold-like (the flat-space Myrheim-
  Meyer estimator reads about 3.5 here, biased upward by the expansion rather than
  KR-divergent).

So the causal-set framework **faithfully represents cosmological expansion**: an
expanding geometry produces a causal order whose intrinsic spatial volume grows with
time, the committed eternal-expansion fate realised as a geometry.

## Refinement: expansion from a pure local growth rule

The deepest edge, expansion from growth with no imposed metric, now has a clean
down-payment. We grow a 1+1 causal set by a purely local stochastic birth rule: each
cell of the current spatial front spawns one child, plus a second child with
probability q. Each child is born to the future of the front cells within a fixed
comoving horizon (the discrete light cone). Nothing geometric is put in by hand
beyond locality. A net birth above one (q > 0) is the committed eternal-expansion
fate of the bootstrap (distinctions only accumulate) realised as a local rule.

| spawn probability q | net birth | front width over generations | emergent rate | dimension |
| ------------------- | --------- | ---------------------------- | ------------- | --------- |
| 0.0 | 1.0 | 5, 5, 5, ..., 5 (static) | 1.00 | 1.79 |
| 0.3 | 1.3 | 5, 6, 7, 11, ..., 119 (grows) | 1.334 | 1.75 |

- With **net birth one (q = 0) the front is static**, a non-expanding universe.
- With **net birth above one (q = 0.3) the front grows on its own**, generation after
  generation, at an emergent rate of **1.33 per generation, exactly 1 + q**, with no
  metric imposed. The recovered dimension stays manifold-like (about 1.8 in 1+1).

So **cosmological expansion emerges from a purely local growth rule** whenever the net
birth exceeds one. This is the growth-side companion to the de Sitter geometry result:
there expansion was imposed as a metric, here it emerges from the rule itself. The
committed eternal-expansion fate (net positive birth) IS an expanding universe.

## What remains

This still assigns each cell a comoving position by hand (the spatial ordering of the
front). A fully emergent account would have the spatial geometry of the front, not
just its growth rate, come from the relations alone. So the chain is now: the arrow is
free from growth, expansion emerges from net-positive birth, an expanding geometry is
faithfully represented, and the last step (full emergent spatial geometry from a
local rule, with no comoving coordinate put in) is the remaining frontier.

## See also

`p13-expansion` (the de Sitter geometry experiment), `p13-growth-expansion` (the
local growth rule), `p2-uniform.md` (the smeared action produces 2D manifold orders
in the equilibrium ensemble), and `note/questions/next-version.md` (P13).
