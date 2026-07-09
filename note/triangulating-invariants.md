# Triangulating the recurring invariants

How to answer the question a fellow theorist asked: **what does each
model independently require that nobody put in by hand, and what keeps
surviving across derivation chains that started from completely
different primitives?** This note decodes that ask, gives the method for
finding those survivors, and lists the ones Vibe sees from where it
sits, each with the experiment that pins it and the theories it recurs
in.

## The question, decoded

Every foundational theory starts from a few **primitives**, the things
it assumes, and then claims a pile of physics **follows**. The trap is
that a theory can smuggle a result into its primitives and then
congratulate itself for deriving it. So the question to ask about any
single theory is: which of its results are **forced**, and which were
**put in by hand**.

Triangulation is the same question asked across many theories at once.
Line up several frameworks that begin from **different** primitives. Now
look for a structure that each one **derives** rather than assumes. If
the same structure keeps falling out of chains that started nowhere near
each other, that structure is unlikely to be an artifact of any one set
of assumptions. It is a candidate for something real.

The stronger the triangulation, the more it satisfies three tests at
once:

1. **Derived, not assumed, in every theory that shows it.** Nobody put
   it in by hand.
2. **The primitives are genuinely different.** Discrete tone, continuous
   distinguishability, a conserved current, relational configurations.
   The further apart the starting points, the more the agreement means.
3. **Each derivation has a control that could have failed.** The
   structure could have come out otherwise and did not.

A structure that is a **primitive in one theory but derived in another**
is especially telling, because the second theory explains what the first
only assumed.

## How to find an invariant in the first place

Before you can triangulate, you have to know what your own theory
derives. In Vibe an invariant is any structure that stays fixed, in one
of four senses, and each has a way to find it.

### 1. A conserved quantity (run the rule, see what does not move)

Evolve the state and measure what stays exactly constant. Because the
rule is integer and reversible, the check is an exact equality, not a
tolerance. The total charge is conserved to the integer: a run that
creates 1112 plus-minus pairs annihilates all 1112 back, net zero
(E-FND-0008). Parity and the conserved norm are found the same way. A
conserved quantity is the cleanest kind of invariant, because there is
nothing to argue about.

### 2. A forced structure (remove the assumption, see if it survives)

Some structures are not conserved along a run, they are **forced by the
constraints**. The way to test is subtraction: drop or perturb an
assumption and see whether the structure still has to be there. Vibe's
forcing ladder is this test applied down the line, from the two axioms
to the reversible rule, the ternary alphabet, dimension eight, and the
{3,4,3,4} mesh. Where a step is a theorem the structure survives every
substitution. Where it rests on a premise, the premise is named as one.

### 3. A universal number (the scramble control, the put-in-by-hand test)

This is the operational form of "nobody put it in by hand". Take a
measured number and vary the thing it should not depend on: the size,
the fill, the substrate. A number that **survives** the variation is a
property of the class. A number that **dies** when you scramble the
substrate was riding on that substrate and is not fundamental. The
scramble control is exactly the case that could give the boring answer.
Vibe's distinguishability readout is forced this way: relabel the 24
directions by a coin symmetry and the Fisher-Rao readout does not move
(deviation 6.7e-16, machine zero), while an ad-hoc weighted readout
swings by 0.99 and fails (E-FND-0057). So Fisher-Rao is singled out by
the measurement, not chosen.

### 4. A cross-theory recurrence (the triangulation itself)

The fourth sense is the one the question is about. An invariant is
**triangulated** when it appears as a derived result in two or more
theories whose primitives differ. This is not measured on the substrate,
it is read across the map of theories. The rest of this note is the list
of what Vibe sees when it does that.

## The recurring invariants, from where Vibe sits

Ranked by triangulation strength. For each: the structure, what Vibe
derives with the number that pins it, and the theories it recurs in with
their different primitives.

### 1. Time is the accumulated total of irreversible distinction

The strongest one, because **no theory in the set assumes it and every
one derives it**.

- **Vibe.** Time is the wake, the monotone growth of the mesh. The
  record count rises without bound (1 to 8857 over the run) and the
  Fisher-Rao arc length accumulates monotonically, while a fixed mesh
  caps at a bounded record set and has no arrow (E-FND-0051). Primitive:
  a discrete ternary distinction.
- **Timeless Dynamics.** Time is accumulated Fisher-Rao arc length along
  record-preserving paths. Primitive: continuous distinguishability.
- **Chronoflux.** Time's passage and cosmic expansion are one positive
  divergence of a conserved current, the current thinning out as it
  spreads. Vibe measures the same thing: the wake registers as a
  strictly positive edge divergence that equals the count of newly born
  cells exactly and is zero in the settled bulk (E-CSM-0043). Primitive:
  a continuum temporal current.
- **Barbour.** Time capsules, configurations that look like they hold a
  past. Primitive: relational configurations.
- **Rovelli.** Thermal time from a statistical state. Primitive:
  relational and statistical.

Five theories, five different primitives, one account of time: **the
running total of distinction that cannot be undone**. Nobody put it in.

### 2. Records are the basis of the arrow

- **Vibe.** The reversible rule erases nothing (forward then inverse
  recovers the start bit for bit, Hamming distance 0, while a lossy rule
  loses 4.2 percent for good, E-FND-0049), and the wake makes records
  un-erasable because a shell cannot be un-born.
- **Timeless Dynamics.** The recordability condition selects paths that
  lay down and keep records.
- **Chronoflux.** The recoverability functional, accessible over total,
  unifies entropy, decoherence, and horizons as one quantity.
- **Barbour.** Records as time capsules.

Different primitives, the same move: **the arrow is un-erasable record
accumulation**, not an external law.

### 3. Distinguishability is the primitive, and Fisher-Rao is forced

- **Vibe.** The ternary tone is the minimal distinction, and the
  Fisher-Rao readout is singled out by 24-cell relabeling invariance
  while ad-hoc measures fail (E-FND-0057).
- **Timeless Dynamics.** Distinguishability measured by Fisher-Rao,
  forced by Chentsov's theorem.
- **Wheeler.** It from bit.
- **Frieden.** Fisher information as the generator of physical law.

Vibe and Timeless Dynamics both land on the **same Fisher-Rao metric,
forced by the same Chentsov-style uniqueness**, from a discrete tone on
one side and continuous distributions on the other. That is a structure
that is a primitive in both yet forced in its specific form in both,
which is why it triangulates.

### 4. The Born rule comes from a conserved norm, not a postulate

- **Vibe.** Reached three independent ways, branch-counting additivity,
  envariance, and a conserved norm concentrating branch weight, each
  with a control that fails.
- **Timeless Dynamics.** Gleason's theorem on the complexified
  Fisher-Rao manifold.
- **Zurek.** Envariance.
- **Masanes-Mueller and D'Ariano-Chiribella.** Reconstruction from
  information axioms.

The squared amplitude keeps falling out of a **conservation or symmetry
constraint**, never postulated. Different roads, one destination.

### 5. Lorentz invariance and the light cone emerge from a discrete substrate

- **Vibe.** A ballistic light cone and emergent Lorentz isotropy from a
  fixed lattice, the hard problem for any discrete theory, measured not
  assumed.
- **'t Hooft.** The cellular-automaton interpretation.
- **Sorkin and Dowker.** Causal sets.
- **Wolfram and Gorard.** Hypergraph rewriting.

A finite discrete substrate keeps producing a **continuous Lorentz
structure** in the coarse limit. Four discrete primitives, one emergent
symmetry.

### 6. Gravity is entropic and thermodynamic, not fundamental

- **Vibe.** Area-law gravity, with Newtonian gravity screened to a
  Yukawa form in the curved bulk (a size-independent spectral gap) so it
  must live on the flat cusp (E-GRV-0049 and E-GRV-0050).
- **Timeless Dynamics.** The Einstein tensor from the Hessian of the
  information potential.
- **Chronoflux.** Curvature forced to match the current's stress.
- **Verlinde, Jacobson, Padmanabhan.** Entropic force, equation of
  state, thermodynamic gravity.

Six frameworks, one reading: **gravity is a coarse-grained statistical
response**, not a base force.

### 7. A Lyapunov ceiling on record persistence (a fresh triangulation)

- **Vibe.** A coherent record's contrast survives only below a Lyapunov
  exponent, high chaos scrambles it away, measured as 0.041 above the
  threshold and 0.241 below, a clean separation (E-QTM-0092).
- **Timeless Dynamics.** The Hyperion derivation: coherent records
  persist only while the chaos rate stays below a threshold, derived
  from the geometry before the run.

Only two theories so far, but from very different primitives, one
measuring the ceiling and the other deriving it. This is the newest
survivor and the one most worth pushing on, because it is fresh and it
already agrees.

## The picture in one paragraph

From where Vibe sits, the structures that keep surviving across
derivation chains from different primitives are: **time as accumulated
irreversible distinction, records as the arrow, distinguishability with
Fisher-Rao forced, the Born rule from a conserved norm, emergent Lorentz
from a discrete base, and entropic gravity**, with a fresh seventh, a
Lyapunov ceiling on how long a record can hold. The first is the
strongest, because no theory in the set assumes time and every one
derives it as the running total of distinction that cannot be undone.
Those six-and-one are the recurring invariants. Each one is derived, not
assumed, in more than one framework, each framework starts somewhere
different, and each derivation carries a control that could have failed.

## A draft reply

> Triangulation is exactly how I have been reading it, and I can tell
> you what survives from the discrete side. The one that stands out is
> time. Nobody in the set assumes it. You derive it as accumulated
> Fisher-Rao arc length, Barbour reads it off time capsules, Chronoflux
> gets it as the positive divergence of a conserved current, and I get
> it as the monotone growth of the mesh, the running total of
> distinction that cannot be undone. Four or five different primitives,
> one account of time. Right behind it are records as the arrow, the
> Born rule out of a conserved norm rather than a postulate, Lorentz
> emerging from a discrete substrate, and gravity coming out entropic.
> And a fresh one just showed up between your work and mine: a chaos
> threshold on how long a coherent record can hold. You derive it from
> the Hyperion geometry, I measure it on the lattice as a Lyapunov
> ceiling, and the shapes agree. That last one is where I would push
> next, because it is new and it already triangulates. My rule for
> counting a survivor is strict: it has to be derived and not assumed in
> each theory, the primitives have to be genuinely different, and each
> derivation needs a control that could have come out the boring way and
> did not.

## See also

The per-theory correspondence cheatsheets are in
[`note/link/`](link/readme.md), one file per theory, each listing the
exact mappings and the experiments behind them.
