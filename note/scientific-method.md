# The Scientific Method for Vibe

How Vibe does science. This is the broad programme. The grading rules and the
control requirement live in `experimental-methodology.md`, and the code layout
lives in `architecture.md`. This file is the frame those two sit inside.

There is no single agreed best method. But across computational physics, applied
mathematics, systems biology, climate science, and machine learning, the same
shape keeps appearing. Feynman, Popper, Hestenes, Box, von Neumann, and Pearl all
converge on one instruction:

> **Build the smallest model that can make a precise prediction. Attack it until
> it breaks. Keep only what survives.**

Vibe is ambitious, so treat it as an **engineering discipline**, not as a piece of
writing. A theory is prose. A discipline is a pipeline with gates, and nothing
passes a gate on charm.

The stages below run in order. Each one is a gate. A result that skips a gate is a
work in progress, and we say so.

---

## Stage 0. Fix the ontology

Say what exists before anything runs. No metaphor, no "obviously".

For Vibe the ontology is fixed and small:

- **Cells.** A growing crystal, the {3,4,3,4} honeycomb, one cell per site.
- **Tone.** A ternary value on each cell, or a directional tone on each of the 24
  slots per cell.
- **The rule.** One deterministic reversible conserving local update, the knit.
- **Growth.** Reflection and the wake, how the crystal extends.
- **The arrow.** A value direction, the fifth base thing.

What never varies: the geometry, the ternary alphabet, the rule, the fact that the
base is discrete. What varies: the tone configuration and the size. What is
forbidden: a sixth ingredient. No added cohesion, no maintenance term, no willpower,
no gravity term, no stabiliser. If a phenomenon does not come from the five, we
report the failure, we do not add a knob.

Everything after Stage 0 must be built out of these pieces. If a new object appears
later, it either reduces to these or it is a mistake.

---

## Stage 1. State the axioms

Write only the assumptions. Not the consequences.

Vibe has two:

1. **Something exists.** There is at least one distinction to be made.
2. **A difference once made cannot vanish.** A made distinction is kept.

Each axiom must be **minimal, independent, falsifiable, and computable**. The test
is subtraction. Remove an axiom. If the theory changes a lot, the axiom was doing
work and it stays. If nothing changes, delete it.

Everything Vibe treats as forced (the reversible conserving rule, the ternary
alphabet, dimension eight, the 24-cell) is a claimed consequence of these two, not a
third and fourth axiom. Where a step still rests on a premise rather than a theorem,
that premise is named as a premise in the same breath as the result.

---

## Stage 2. Derive everything, in order

No concept enters halfway through. The chain runs one direction:

```
axioms -> lemmas -> theorems -> algorithms -> simulations -> predictions
```

Vibe's forcing ladder is the worked example. The seed forces a reversible
conserving rule. The smallest alphabet with a vacuum and a mirror forces the ternary
tone. A reversible composition that carries fermions pinches the dimension to eight.
The octonions carry triality, triality forces D4, D4 gives the 24-cell and the
{3,4,3,4} mesh. From there the arrow, record preservation, the emergent quantum, and
the particle content.

If a quantity you need shows up only at the simulation stage and was never derived,
it belongs back in the axioms or it is unearned. The place to catch this is here,
before any code.

---

## Stage 3. Write the specification

Before a simulator, write the interface. Every function **pure, deterministic,
typed**.

Vibe's specification is the substrate engine:

- **Mesh.** A fixed cell count, a coin of directions, a neighbour along each
  direction, and the opposite direction.
- **Tone.** One ternary value per slot.
- **Collision.** A local in-place map on one cell's slots, charge conserving and
  reversible.
- **Beat.** Collide, then stream. The inverse beat un-streams, then collides with
  the inverse.

The specification is the contract. The simulator is one implementation of it. A
second implementation of the same specification is the cross-check at Stage 6.

---

## Stage 4. Write the mathematical model

Only now, and still no code. Everything symbolic.

- **State space** S, the set of tone configurations on the mesh.
- **Transition** T from S to S, the beat.
- **Conserved charge**, the sum the rule preserves exactly.
- **Distance** on states, the Fisher-Rao distance on the activity distribution.
- **Entropy** and **information** measures on the coarse-grained state.
- **Growth** G, the wake, the map that adds a shell.

The model is what the prediction is stated in. If a claim cannot be written in these
symbols, it is not yet a claim.

---

## Stage 5. Predict before you code

Write the prediction first. Then write the code. In that order, every time.

Because the base is deterministic, a Vibe prediction is a **number with a tolerance**,
or a sign, or a scaling exponent. Not a mood. Examples of the shape:

- a dispersion slope equal to a stated value,
- a growth ratio that converges to a stated constant,
- a correlation that decays as a stated power,
- a control case that must return zero.

If you code first and read the number off afterwards, you will fit the code to what
you hoped for without noticing. The prediction written first is the guard against
that. It is Stage 16 in miniature, applied to every single experiment.

---

## Stage 6. Independent implementations

One implementation can hide a bug that agrees with itself. Two implementations
written apart do not share the bug.

Vibe runs in TypeScript today. The path to a second is the multi-backend compiler,
which emits the same rule in another language from one source. The cross-check is
**bit-identical state**. Run the same rule on the same start in two backends and
assert equality slot for slot, not similarity. A reversible integer rule has no
floating-point excuse, so the check is exact.

Until a result has a second implementation it is single-source, and single-source is
a caveat we record.

---

## Stage 7. Turn every law into a test

Not software tests. Scientific tests. Each conservation law and symmetry becomes an
assertion the mathematics has to pass.

- **Conservation.** The total charge after a beat equals the total before, exactly.
- **Reversibility.** Beat forward, then inverse, and recover the start slot for
  slot, distance zero.
- **Symmetry.** Relabel the 24 directions by a coin symmetry and the statistics do
  not move.
- **Translation and reflection.** Shift or mirror the state and the invariants hold.

These run as exact integer equalities, not as tolerances. A loose epsilon where the
quantity should be exact is a method failure. This is how the mathematics becomes
executable.

---

## Stage 8. Property testing, the deterministic way

Generic property testing throws thousands of random worlds at a rule. Vibe cannot do
that, because **the base is deterministic and randomness is banned as a foundation**.
So Vibe adapts the stage rather than skipping it.

Instead of random seeds, sweep a **family of deterministic inputs**: every size in a
range, every structured start pattern, every cell as the perturbation site, every
tessellation in the catalogue. Over that family, assert the properties hold
everywhere: the rule stays reversible, the charge stays conserved, the graph stays
connected. The family is large and it is reproducible, because it is generated, not
drawn.

This is the one stage where the generic recipe must be rewritten for Vibe. Robustness
comes from **varying size and structure, never from averaging over seeds**. A result
that only holds on average over random draws is a statement about an ensemble, and we
label it that way.

---

## Stage 9. Parameter sweeps

Never inspect one interesting example. Run the grid.

Vibe's axes are the arrow strength, the process rates in the tunable rule, the
lattice size, and the tessellation. Sweep the full product, not a single point.
The single striking picture is the thing that fools you. The grid is the thing that
tells you where the picture sits and how wide the region around it is.

---

## Stage 10. Draw the phase diagram

A sweep is a table. A phase diagram is the map that turns the table into regions.

For the tunable rule the plane of arrow against share separates ordered, chaotic, and
dead behaviour. The goal is to find **regions and boundaries**, not anecdotes. A
result that lives on a knife edge between two regions is fragile, and the phase
diagram is what exposes the knife edge.

---

## Stage 11. Hunt for invariants

What never changes is often worth more than what does.

Vibe's invariants include the conserved charge, parity, the Euler characteristic of a
patch, the shell growth ratio near 18.278, the F4 automorphism order 1152, and the
topology of the coin. An invariant that survives every sweep is a spine. When an
invariant breaks under a change you thought was harmless, that break is a finding.

---

## Stage 12. Scale it

Run at 10 cells, then 100, then thousands, then millions. Ask one question. Does the
effect **converge, or does it vanish**.

Many pretty toy results are finite-size artefacts that melt as the lattice grows.
Vibe's rule is to vary the size and watch the measured number. If it settles to a
limit, the effect is real. If it drifts to zero, the effect was the smallness of the
box. This is the same discipline as Stage 8, pointed at scale.

---

## Stage 13. Measure emergence, never eyeball it

A picture that looks alive is not a result. A number is.

The measures Vibe reads off the coarse-grained state: mutual information, correlation
length, spectral gap, spectral and box dimension, Fisher information, the Lyapunov
exponent, integrated information, persistent homology, compression ratio. Every
emergence claim attaches to one of these with a value and a tolerance. If a claim has
no number, it is a description, and a description is not evidence.

---

## Stage 14. Compare against the standard models

A theory becomes science when it is measured against what already works.

Vibe's neighbours are cellular automata, the Ising model, the lattice gas automaton,
the lattice Boltzmann method, the quantum walk, percolation, network theory, and the
renormalization group. The comparison is not to show they are wrong. It is to show
that Vibe **reproduces, subsumes, or beats** one of them on a stated measure. A result
that reproduces a known construction is graded as a reproduction and cited to its
source. Reproducing known work is worth doing. Dressing it as new is not.

---

## Stage 15. Try to break it

The most important stage. Every month, ask the one question:

> How would I prove this wrong?

For every result you like, build the adversarial case. The control that should return
zero. The substrate where the effect should not appear. The {5,3,4} cell that carries
no spinor is the model here. It is what makes the {3,4,3,4} spinor result mean
something, because it is the case that could have said yes and said no. A claim with
no case that could break it is not a claim, it is a hope.

---

## Stage 16. Lock the blind prediction

Before a run that matters, write four lines and freeze them:

```
expected outcome
reason
confidence
the failure that would change my mind
```

Then run. This kills hindsight. Once you have seen the number it is easy to tell
yourself you expected it. The frozen note is the receipt that says whether you did.

---

## Stage 17. Report the spread, not the anecdote

Never rest a claim on one run.

For Vibe the ensemble is the deterministic family of Stage 8, sizes and structured
starts, not random repeats. Over that family report the centre and the spread and the
size of the effect. A number that clears its bar by a hair across the family is a
knife edge. A number that clears it by a wide margin everywhere is a result. Say which
one you have.

---

## Stage 18. Make it reproducible from one command

Someone else should reproduce every figure from the paper, the code, the version, and
the parameters. Nothing else.

Vibe has the pieces for this by construction. The rule is deterministic and seedless,
so there is no hidden state to leak. Every experiment is registered with its code, its
parameters, and its file. One command runs the suite and every number comes back the
same. If a result needs a manual tweak to reproduce, it is not yet a result.

---

## Stage 19. Publish the whole thing, failures included

Put out the equations, the code, the parameters, and the results. And put out the
**failures and the negative results**, because they are what draw the boundary of the
theory.

Vibe grades and keeps its negatives. An experiment that fails or stays open is a real
outcome, recorded next to the successes, never hidden from the tally. A framework that
only ever publishes its wins is advertising. A framework that publishes where it fails
is telling you where to trust it.

---

## Stage 20. Close the loop

The pipeline is a circle:

```
axioms -> derive -> predict -> simulate -> measure -> compare -> falsify -> refine -> repeat
```

Each turn tightens the theory or kills a piece of it. The loop does not end. A theory
that has stopped looping has stopped being tested.

---

## The immutable experiment record

Every Vibe experiment is self-contained and does not change once recorded. It fixes:

- the **hypothesis** and the **prediction** written before the run,
- the **rule version**, the **size**, and the **parameters**,
- the **measure** and the **control** that could have failed,
- the **depth grade** and the one-line result.

Anyone can rerun it exactly and get the same number, because there is no seed to
match and no hidden state to reconstruct.

## The grade is part of the result

Every result carries its depth grade. **L0** is circular and proves nothing. **L1**
confirms known mathematics. **L2** reproduces known physics on the substrate. **L3**
is a measured, controlled, new consequence of the base rule with a prediction that
could have come out wrong. Most results in a young programme are L1 and L2, and that
is fine, as long as they wear the right label. The full rubric and the control
requirement are in `experimental-methodology.md`.

## The one line to keep

Feynman said it plainest:

> "It does not matter how beautiful your theory is. If it does not agree with
> experiment, it is wrong."

For a computational theory, the experiment is a simulation designed so it **could
contradict the idea**. The weak question is "can I make the model do something
interesting". The strong question is "what precise number does this model predict that
its competitors do not, and can I build the run that might prove me wrong". The second
question is what turns a pretty framework into a science.
