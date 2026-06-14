# Findings 26, Thermodynamics, Entropy, and the Arrow of Time

How a second law, dissipation, heat, and a direction of time arise when the base knit is EXACTLY reversible, a
permutation that loses no information. The resolution is the model's deepest piece of honesty, the arrow is not in the
law, it is in the open growing edge plus a low-entropy start plus coarse-graining, and it is measured. Companion to
`findings.md`, extends `findings-3.md` (the bath makes a self), `findings-6.md` (discreteness), `findings-25.md` (the
wake). Cite `\cite{pollard2026vibetest}`.

## The puzzle, a second law from a reversible law

The knit is a bijection on the dock states, every configuration has exactly one successor and exactly one
predecessor, so it conserves information perfectly and runs backward as cleanly as forward. A permutation cannot
forget, cannot form an attractor, and has no built-in direction. Yet the world has a second law, heat flows one way,
memories fade, and time has an arrow. The model does not smuggle the arrow into the law, it earns it. Why it matters,
an arrow inserted as an axiom explains nothing, an arrow that emerges from a time-symmetric law is the real
thermodynamic result.

## Where the arrow comes from, growth and the open edge

A closed reversible bulk has no arrow, but the mesh is OPEN, fresh docks are born at peace at the wake every beat.
That steady supply of new, empty, low-entropy capacity is a reservoir, it makes the system open while the bulk rule
stays a perfect permutation. The irreversibility lives entirely at the growing boundary, not in the law. Two
measurements pin this.

| test | closed bulk | open growing |
| --- | --- | --- |
| Loschmidt echo (run forward, then exact inverse, does the start return) | 0 (exact return) | 0.40 (40 percent fails to recover) |
| non-equilibrium gradient (steady-state profile) | 0.01 (flat, equilibrium, no current) | 1.40 (steep, a sustained current) |

The closed bulk returns to its start with zero error and relaxes flat, a perfect reversible equilibrium. The open
growing system cannot recover 40 percent of its state, because the peace injected at the wake is information the
reversible bulk never had, and it holds a permanent gradient from the frontier outward, the macroscopic footprint of
the arrow. Why it matters, the direction of time is the direction the mesh grows, the same single fact as the time
step and the expansion of space (`findings-25.md`), three things physics usually treats separately.
(`theory-v0.7.0/paper/the-arrow-from-growth.md`,
`theory-v0.7.0/paper/final-specification/06-the-arrow-growth-and-the-bath.md`.)

## The bath, how a reversible universe still dissipates

A bath is everything you stop tracking that a structure can dump its excess into and never get back. It is what makes
dissipation possible while the whole stays reversible. There are three ways to get one, and they agree.

- Radiation to infinity, on an unbounded mesh a local structure radiates its excess outward as waves that travel
  forever and never return.
- Growth, the wake mints fresh empty docks every beat, a reservoir that dilutes and absorbs.
- Coarse-graining, the fine detail you do not observe acts as a bath, the excess hides in unwatched degrees of
  freedom and, to the coarse description, is gone.

The cleanest demonstration is a burst. On an open mesh a burst radiates to the edge and is removed, the center
relaxes to empty and the tracked charge decays from 8 to 0. On a periodic torus the same burst has nowhere to go, it
wraps around and returns fully, recurring 8 to 8, no bath. This is exactly why reversible collisions could not
capture, a reversible bulk has nowhere to dump the relative motion, so two bodies scatter and fly apart, and only with
a bath does capture, and therefore a self, become possible (`findings-3.md`). Reversibility is never broken, system
plus bath is always a reversible permutation, dissipation appears only when you stop following the bath. Why it
matters, the bath is not a new law, it is the part of the same reversible universe you have chosen not to track, and
it is the missing ingredient behind capture, dissipation, and the self. (`theory-v0.7.0/paper/what-the-bath-is.md`.)

## Coarse-graining is the source of effective entropy

The base permutation has ZERO degeneracy, every microstate has a unique successor, so its effective information is
maximal and no coarse-graining of the true micro can raise it. Causal emergence (effective information rising under
coarse-graining) is therefore impossible at the base, and this is measured, over a long orbit the micro successor map
has zero injectivity violations across 132 distinct states, confirming the permutation. Entropy and irreversibility
enter only when you DISCARD information, coarse-graining the dock states to the charge field compresses by about 2.2
and makes 48 of 60 coarse states non-deterministic. Many microstates funnel into one macrostate, which is what creates
robustness, memory, identity, and an effective arrow. The loss is not in the physics, it is in the description, which
is exactly how thermodynamics works, microscopic mechanics is reversible while heat, entropy, and irreversibility
appear at coarse scales. Why it matters, entropy in the model is honestly an observer-relative, coarse-grained
quantity, the base carries none, and the model says so plainly. (`theory-v0.7.0/paper/selves-and-the-coarse-graining-of-reversibility.md`,
`theory-v0.7.0/paper/the-degeneracy-trick.md`, `memory-what-is-lost.md`.)

## The second law as drift toward equilibrium

A conserved charge left alone spreads toward balance, the ordinary second law, and for a self that means dissolving
into its surroundings, which is death. The reversible equilibrium dynamics satisfies local detailed balance (the
create move and its annihilation are the forward and reverse of one balanced reaction) and global reversibility (no
persistent circulation around loops), so it is a genuine equilibrium process that explores its accessible states
evenly and drifts any special low-entropy arrangement toward the overwhelming high-entropy churn. Energy conservation
never prevented information loss, a memory is lost as a PATTERN while the total charge stays exactly fixed. Why it
matters, the second law is not an extra postulate, it is what a reversible equilibrium process does to a pattern, the
sum is conserved, the arrangement is not. (`the-conserved-exchange.md`, `memory-what-is-lost.md`, `recent-findings.md`.)

## Landauer, Maxwell's demon, and the cost of memory

Reversible computation erases nothing, so in principle it dissipates no energy, this is the deep meaning of Landauer's
principle, only ERASURE must cost energy. A substrate meant to host arbitrary structure and observers should sit at
this universal, dissipation-free point, and the reversible knit does. The flip side is memory. Because reversibility
forbids attractors, passive permanence is limited to conserved quantities, about one durable bit (the charge Q), and
any richer permanent memory must be ACTIVELY maintained against the equilibrium drift, which costs work. That cost is
not a flaw, it is thermodynamically forced, real memory pays it too, a brain spends energy to maintain and repair, a
computer refreshes its memory. Maintaining a low-entropy pattern against an equilibrium dynamics is precisely the
Landauer bill. Why it matters, the model reproduces the exact information-thermodynamics tradeoff, free reversible
computation, but a thermodynamic price for any durable memory beyond the one conserved bit. (`memory-what-is-lost.md`,
`theory-v0.7.0/paper/why-the-bulk-is-reversible.md`.)

## The past hypothesis and heat death

A bath only works while there is somewhere emptier for the excess to go, heat flows hot to cold and stops at
equilibrium. So an arrow and life require the universe to have begun in a smooth, low-entropy, near-empty state and to
have stayed far from full, this is the past hypothesis. Growth is what keeps it from filling, fresh peace docks born
at the wake continuously refresh the empty capacity, so the bath never runs out. This is exactly cosmic expansion in
the real universe, space stretching and the sky cooling makes fresh low-entropy sink, which is why the universe has
not reached heat death. Why it matters, the model ties the arrow of time, the existence of life, and the expansion of
the universe to one fact, a growing, never-filling low-entropy frontier. (`theory-v0.7.0/paper/what-the-bath-is.md`,
`do-we-need-more-base-things.md`.)

## Why the bulk must be reversible

The reversibility is not a stylistic choice, it is forced by what the model must recover.

- Unitarity, a reversible discrete update has a unitary generator, an irreversible one leaks probability and there is
  no quantum theory to recover (`findings-28.md`).
- Conservation, reversibility plus a symmetry gives an exact conserved current (the charge), irreversible rules leak
  it.
- Relativity, dissipation singles out a rest frame (the frame the dissipative medium is at rest in) and breaks boost
  symmetry, only information-preserving dynamics can be Lorentz invariant.
- No magic deletion, an irreversible rule lets information vanish and entropy sinks appear for free, reversibility
  forbids all of it.
- Earned emergence, in a reversible base, higher structure must appear DESPITE microscopic conservation, which is the
  heart of statistical mechanics and makes the emergence surprising rather than assumed.

Why it matters, the single hardest constraint, exact reversibility, is what lets the model carry quantum mechanics,
conservation, relativity, and an honest arrow all at once, the arrow earned not smuggled.
(`theory-v0.7.0/paper/why-the-bulk-is-reversible.md`.)

## The one-line reading

The knit is a perfect reversible permutation that carries no entropy and no arrow, and the second law, heat,
dissipation, and the direction of time all emerge from three things layered on top, an open growing edge that injects
fresh low-entropy peace (the wake), a low-entropy start (the past hypothesis), and coarse-graining that discards the
fine detail, with reversible computation free and durable memory paying the Landauer price.

## Where to look (notes)

- The arrow from growth, measured: `theory-v0.7.0/paper/the-arrow-from-growth.md`,
  `theory-v0.7.0/paper/final-specification/06-the-arrow-growth-and-the-bath.md`, `where-direction-comes-from.md`.
- The bath and dissipation: `theory-v0.7.0/paper/what-the-bath-is.md`, and `findings-3.md` (capture needs a bath).
- Coarse-graining as the entropy source: `theory-v0.7.0/paper/selves-and-the-coarse-graining-of-reversibility.md`,
  `theory-v0.7.0/paper/the-degeneracy-trick.md`, `the-coarse-graining-chain.md`.
- Second law, detailed balance, memory, Landauer: `the-conserved-exchange.md`, `memory-what-is-lost.md`,
  `recent-findings.md`.
- Why reversible: `theory-v0.7.0/paper/why-the-bulk-is-reversible.md`.