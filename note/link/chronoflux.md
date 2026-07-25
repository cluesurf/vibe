# Vibe to Chronoflux

Chronoflux (Roy Herbert, around 90 Zenodo papers as of July 2026) builds physics from one
conserved current of time, a flow filling spacetime with a density and a direction at every
point, its law being that nothing is created or destroyed. It is the continuous version of
what vibe does discretely, so this sheet derives Chronoflux from vibe rather than adopting it.

In July 2026 Herbert re-founded the program from its logical root, in a series titled the
Descendancy of Physical Law. That refactor matters here because it moved his stated base to
exactly the place vibe already stands, and it is what makes the mapping below exact rather
than analogical.

## His base, in his own order

The primitive is **covariant continuity, stated before any metric**. The base object is a
current form on an oriented four-manifold whose closedness is the entire law. Only
orientation is needed. No ruler, no clock, no action.

Everything else is a **descendant**, in a fixed order:

1. **Continuity.** A closed current form. Metric-free.
2. **Conservation.** The familiar zero-divergence current, which is what continuity becomes
   once a volume form and a metric are declared. Not a second axiom.
3. **Admissibility, recoverability, persistence** (the ARP triad). Which continuations are
   lawful, which structures can be inverted back, which identities actually endure.
4. **Time.** Derived, not assumed. It appears only when the conserved current is admitted as
   non-vanishing, positive and future-directed timelike. Clocks read a recovered duration,
   they do not create time.
5. **Geometry, inertia, the quantum regime, matter, fields, gravitation, cosmology**, as
   branches of a tree, each required to show a lawful return to the root.

Two sharpenings are worth keeping. The **action is explicitly not the origin**, because many
inequivalent variational completions return the same continuity law, so the Lagrangian is a
representation of the primitive rather than its source. And the whole edifice is presented as
a typed dependency graph with a uniqueness theorem, which is a methodology claim, not a
physical one.

## The continuity versus discrete question, answered

This is the crux, so it gets its own section. The worry is real: a continuum field carries
uncountably many degrees of freedom in every region, an actual infinity at every point, and
that is the thing vibe refuses. If Herbert's base is continuous and vibe's is discrete, are
they even compatible, or does the discrete side only ever approximate the continuous one with
some leftover error?

The measured answer is that **the transfer splits into two layers with completely different
characters**, and only one of them ever needs a limit. Both are measured side by side on one
state in [`E-GRV-0053`](../../test/experiment/gravity/discrete-to-continuum-layers.ts).

**Layer one, the law. Transfers exactly. No limit, no infinity, no error term.**
The continuity balance holds with **exactly zero residual** at every block scale, under
integer equality with no tolerance. Nothing is approximated. Better, the balance does not even
need the blocks: it holds exactly over partitions built to carry no geometry at all, including
every cell alone, cells interleaved by index, cells scrambled by a fixed deterministic mix,
and a digit-parity split ([`E-FND-0073`](../../test/experiment/foundations/metric-free-continuity.ts)). Those scattered partitions
are verified to carry real boundary flux, so the zero is a genuine cancellation of large terms
and not an empty sum. Since the law reads only adjacency and which slot points where, it never
touches a coordinate or a distance. That is precisely Herbert's orientation-only primitive,
and it lands on the discrete lattice whole.

**Layer two, the field. A finite-resolution reading. The limit is approached, never taken.**
A block of V cells holds V times 24 ternary slots, so its total charge is a bounded integer and
its mean density can only sit on an exact multiple of one over V. So at every finite scale the
attainable densities are a **finite set** with spacing exactly one over V. That spacing shrinks
as blocks grow and reaches zero only in a limit nobody takes. The smooth field of the continuum
theory is the coarse observer's improving reading of finite integer data.

So the two theories are not in tension, and the discrete base gives up nothing:

- **Conservation, continuity, boundary balance and topology are metric-free, and they map
  exactly at every finite scale.** This is the part Herbert calls primitive, and it needs no
  continuum at all.
- **Only the metric layer needs a limit**, and there the continuum appears as the limit of a
  resolution rather than as an instantiated infinity. The convergence rate of that limit is
  itself measured, at the self-averaging rate ([`E-GRV-0046`](../../test/experiment/gravity/continuum-limit-of-tone-current.ts)).

One honest note on grading. The law leg is a real measurement that could have come out nonzero,
and a lossy control shows it does. The resolution leg is arithmetic, a counting fact about the
substrate rather than a discovery, and it is labelled that way in the experiment. Its value is
that it says exactly why no infinity ever appears, not that it proves something surprising.

## Shared invariants (the survivors)

Structures both theories derive from different starting points. (An invariant here is a
quantity or structure that stays fixed: conserved, forced, or matching across both.)

- **One conserved local quantity is the whole ontology** (the single fundamental thing,
  everything else a face of it). Vibe: charge conserved to the integer, 1112 pairs made
  and 1112 annihilated, net zero ([`E-FND-0008`](../../test/experiment/foundations/conserved-dynamics.ts)). Chronoflux: continuity, nothing
  created or destroyed. The same role and the same status in each theory, one discrete and one
  continuous. This is the match the rest builds on.
- **Conservation is logically prior to geometry.** This is the refactor's sharpest gift. Vibe's
  rule conserves exactly with no metric anywhere in its statement, which is Herbert's primitive
  in discrete form ([`E-FND-0073`](../../test/experiment/foundations/metric-free-continuity.ts)).
- **Time is a positive divergence of the conserved flow, and it is derived.** Vibe: the wake
  shows up as a strictly positive outflow equal to the count of newly born cells exactly, zero
  in the settled interior ([`E-CSM-0043`](../../test/experiment/cosmology/wake-expansion-scalar.ts)). Chronoflux: time appears when the current is
  admitted future-directed timelike. Neither theory puts time in by hand.
- **The three gates above the law.** Vibe: conservation, reversibility and record persistence
  are measured as three independent properties, with a rule that conserves yet cannot be
  inverted, and a reversible rule that loses all local structure ([`E-FND-0074`](../../test/experiment/foundations/arp-separation.ts)).
  Chronoflux: admissibility, recoverability, persistence.
- **Records as recoverability.** Vibe: the reversible rule keeps records ([`E-FND-0049`](../../test/experiment/foundations/record-preserving-paths.ts)).
  Chronoflux: the recoverability functional, which ties entropy, decoherence and horizons
  together ([`E-GRV-0040`](../../test/experiment/gravity/recoverability-functional.ts)).
- **Gravity is a coarse-grained stress response** (the geometry bending to match the
  block-averaged flow). Vibe: area-law gravity from the conserved substrate
  ([`E-GRV-0047`](../../test/experiment/gravity/coarse-stress-closure.ts)). Chronoflux: curvature forced to match the current's stress.

## Correspondence

| vibe | Chronoflux | experiment&nbsp;&nbsp;&nbsp;&nbsp; | grade |
|:--- |:--- |:--- |:--- |
| conserved tone, integer-exact | continuity, the primitive law | [`E-FND-0008`](../../test/experiment/foundations/conserved-dynamics.ts) | firm |
| the balance holds over partitions with no geometry | continuity needs an oriented carrier only, no metric | [`E-FND-0073`](../../test/experiment/foundations/metric-free-continuity.ts) | firm |
| the coarse (block-averaged) tone-current is conserved | zero-divergence continuity, the first descendant | [`E-GRV-0039`](../../test/experiment/gravity/coarse-continuity-closure.ts) | firm |
| exact law at every scale, finite-resolution field | the smooth current as a limit of finite data | [`E-GRV-0053`](../../test/experiment/gravity/discrete-to-continuum-layers.ts) | firm |
| conserve, reverse, persist are independent gates | admissibility, recoverability, persistence | [`E-FND-0074`](../../test/experiment/foundations/arp-separation.ts) | firm |
| the wake, a positive outflow at the edge | time from the future-directed current | [`E-CSM-0043`](../../test/experiment/cosmology/wake-expansion-scalar.ts) | firm |
| how much a coarse region can recover | the recoverability functional | [`E-GRV-0040`](../../test/experiment/gravity/recoverability-functional.ts) | firm |
| the coarse tone-current in the smooth limit | the continuum current | [`E-GRV-0046`](../../test/experiment/gravity/continuum-limit-of-tone-current.ts) | structural |
| the coarse tone-stress balances | gravity as stress consistency | [`E-GRV-0047`](../../test/experiment/gravity/coarse-stress-closure.ts) | structural |
| the 24-direction frame, splitting into a vector and two spinor sets (8v + 8s + 8c) | the timelike flow direction and its frame-flow split | (algebra) | firm |
| measurement as the state settling deterministically into one outcome | collapse as the current relaxing | (shared) | firm |
| the microdynamical rule is primary, any action is emergent | the action is a representation of continuity, not its origin | (shared stance) | firm |

## Divergences

- **Continuous vs discrete, now precisely located.** The disagreement is not about the law,
  which transfers exactly. It is about whether the metric layer is fundamental. Herbert takes a
  smooth manifold as given. Vibe derives geometry as a coarse limit and refuses the actual
  infinity. See the section above for what each side owes.
- **Continuum constants.** His fitted continuum numbers (a coupling, a scalar mass, a
  relaxation time) are tuned quantities vibe does not carry.
- **A dissipative rate.** His collapse machinery carries a damping coefficient put in by hand.
  Vibe is fully reversible, so its settling emerges with no added rate. In the July rebuild he
  goes further and proves collapse does NOT follow from continuity alone, which strengthens
  rather than weakens this point.
- **Astrophysics and the wider claims.** Gravitational-wave echoes, the Millennium Problems and
  inertia engineering sit beyond what vibe models, so they are not imported. Several of these
  he has now retracted or gated himself.

## What the refactor changed here

The old version of this sheet called the coarse-graining from lattice conservation to a
divergence-free current "the central unbuilt calculation". It is built:
[`E-GRV-0039`](../../test/experiment/gravity/coarse-continuity-closure.ts) for the law at every scale, [`E-FND-0073`](../../test/experiment/foundations/metric-free-continuity.ts) for the metric-free
strengthening, [`E-GRV-0046`](../../test/experiment/gravity/continuum-limit-of-tone-current.ts) for the field limit, and [`E-GRV-0053`](../../test/experiment/gravity/discrete-to-continuum-layers.ts) for the
two-layer split that answers the infinity question. What remains open is the metric layer
proper: an Einstein-like response derived rather than targeted, and the dark-matter gradient.

## See also

- [../triangulating-invariants.md](../triangulating-invariants.md), the method and the full list of recurring invariants across theories.
- [readme.md](readme.md), the index of every theory map.
