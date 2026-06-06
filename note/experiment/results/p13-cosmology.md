# P13: The Arrow of Time and Cosmology from Growth

**Status: arrow validated. Expansion demonstrated for an expanding geometry.**

> Updated: the de Sitter refinement below now demonstrates cosmological expansion in
> the causal-set framework. Plain percolation (the original pass) gives the arrow but
> not expansion. Deriving expansion from a pure microscopic growth rule is still open.

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

**What remains open.** This imposes the expanding metric (de Sitter) and reads off the
order. Deriving the same expansion from a pure microscopic growth rule, with no
imposed geometry (the originary / cosmological classical-sequential-growth problem),
is the deepest open cosmological question. The arrow comes free from growth, an
expanding geometry is faithfully represented, and the bridge between them (growth that
intrinsically expands into a manifold) is the frontier.

## See also

`p13-expansion` (the de Sitter experiment), `p2-uniform.md` (the smeared action
produces 2D manifold orders in the equilibrium ensemble), and
`note/questions/next-version.md` (P13).
