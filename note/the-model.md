# The Model: What We Have Landed On

This is the mechanical specification. What a vibe is, how many others it touches, how
it reads them, how its tone updates, what kind of automaton this is, and how the
higher structures (especially quantum mechanics) come out of the base. Each claim is
marked committed (a fixed choice), working (a current best choice with alternatives
open), or open (not yet decided). The results referenced (P1, P7, and so on) are in
`note/experiment/results/` and `note/questions/`.

## The one-paragraph picture

Reality is a vast, growing web of tiny experiential ripples. Each ripple is a
**vibe**: a unit of experience with a felt quality. A vibe does only one thing, it
experiences other vibes, and being experienced by them. There is no space or time
underneath. Space is the shape of the web seen from far away, time is the depth of
the web's before-and-after, and everything else (matter, force, the quantum) is a
pattern in the web. The web is not a fixed grid. It is random, hyperbolic, and
forever growing.

## The base ontology (committed)

Four named things, and nothing else.

- **Vibe.** The one kind of entity. A state in relation. **Committed.**
- **Tone.** The felt quality of a vibe, its state. The working alphabet is ternary,
  t in {-1, 0, +1} (pain, peace, pleasure). The tone is not a thing inside the vibe,
  it IS the vibe seen as a felt state. **Committed** that the base alphabet is finite
  and small. **Working** that it is ternary (binary is the strict minimum, richer
  alphabets for matter are composite, never a richer primitive, see P4).
- **Note.** A vibe experiencing another vibe. The note is the only relation. It is not
  a third object between two vibes, it is one vibe's act of experiencing another,
  named for convenience (the same thing a graph calls an edge). A note read from the
  outside is a **link**. **Committed.**
- **Beat.** One discrete tick of update. Time is made of beats. **Committed** that time
  is discrete.

## What kind of automaton is this

This is the most-asked question, so it is answered plainly.

It is **not a regular cellular automaton**. A cellular automaton lives on a fixed
lattice with a fixed number of neighbors per cell. A lattice has preferred axes, so it
breaks Lorentz invariance: the speed of light becomes direction-dependent (P27). We
reject it for exactly that reason.

It is **not a regular hyperbolic tiling automaton** either. A regular hyperbolic
tiling (the {p,q} tilings, which the testbed can build, with Fibonacci addressing) is
hyperbolic but still regular, so it still has a preferred structure. We reject the
regular tiling for the same Lorentz reason.

What we landed on is a **growing, random, hyperbolic, causal network automaton**:

- **Random**, a Poisson sprinkling rather than a grid, because a random graph is
  Lorentz-invariant in distribution: no preferred frame even at the discreteness scale
  (P27, P3). This is the decisive choice.
- **Hyperbolic**, because only hyperbolic geometry is at once exponentially reaching,
  Lorentz-safe, and navigable without a global address book (P3). The committed
  substrate is the **hyperbolic random graph**, not the regular tiling.
- **Causal**, the web carries a before-and-after order (a causal set), which is where
  time and the light cone come from (P5).
- **Growing**, the web adds vibes forever (the eternal-expansion fate), one or a few
  at a time, by a local birth rule (P13, P30).

So: a random hyperbolic causal network that grows by local birth and updates its tones
by a local rule. Closer to a Wolfram-style network/graph automaton than to a
Conway-style lattice cellular automaton, and specifically the random, Lorentz-safe
kind.

## How many vibes is one vibe connected to

There is **no fixed coordination number**, and that is on purpose. A fixed number is a
lattice, which breaks Lorentz invariance. So:

- A vibe notes a **small, variable** set of other vibes, its neighborhood N(v). The
  count varies from vibe to vibe, drawn from a distribution (Poisson-like for a
  sprinkling), not a constant. **Committed** that it is variable, not fixed.
- In the working both-worlds substrate (P3) the mean degree is about **ten to twelve**
  (the runs used mean degree about 11). So a typical vibe directly notes on the order
  of ten others. **Working** value, set by the sprinkling density and the hyperbolic
  curvature, tunable.
- The neighborhood is **local**: a vibe only ever sees the vibes it directly notes,
  never the whole web. All dynamics is local. **Committed.**

The variability of the degree is not a defect. It is the feature that keeps the
substrate Lorentz-safe (P27) and is why a random mesh succeeds where a lattice fails.

## How a vibe reads the others (committed structure, working details)

Each note carries influence in two directions at once. This is the axiom read along a
note.

- **Will.** A vibe's tone turned outward, the part another vibe reads when it notes
  it. Will is the outside of a tone, the felt quality is its inside. They are one
  thing from two sides. Nothing is stored on the link itself. **Committed.**
- **Fill.** How strongly a vibe takes a given neighbor in, the strength of its
  attention along that note. Fill is carried by the note (the tone of the relational
  vibe between the two). **Committed** that attention is structural (it is the note's
  own state, not a free choice the vibe makes).

There are no continuous weights anywhere. The fill is itself a tone (the tone of the
relational vibe carrying the note), so fill is ternary, in {-1, 0, +1}, not a real
number. So "reading a neighbor weighted by fill" means a **ternary product**: the
neighbor's will times the note's fill, which lands in {-1, 0, +1}. A fill of +1 takes
the neighbor's will as it is, -1 takes it inverted (opposition), 0 ignores the
neighbor. A vibe never reads anything else. It cannot see a vibe it does not note, and
it cannot see the inside (the felt quality) of another vibe, only the will (the
outward tone).

## How the tone updates (working)

This is where we are deliberately not over-committed. The honest position has two
layers.

- **The microscopic rule.** It is a signed-majority vote, the ternary analogue of an
  Ising or Hopfield update, with no continuous weights. Each beat, for a vibe v:
  1. For each neighbor w it notes, form the ternary product of the note's fill
     f(v->w) in {-1,0,+1} and the neighbor's will in {-1,0,+1}. The product is again in
     {-1,0,+1}.
  2. Sum these products over the neighborhood into a local field h_v, a transient
     INTEGER in [-degree, +degree] (degree about 10). It is computed during the beat
     and discarded, never stored, so it is not hidden continuous state, exactly like a
     cellular automaton's neighbor count in a majority rule.
  3. The new tone is sign(h_v): +1 if h_v > 0, -1 if h_v < 0, 0 if h_v = 0 (a balanced
     field gives peace).
  Everything stored stays ternary, on vibes and on the relational vibes that carry the
  fills. The fills are tones too, so attention evolves by the same rule (structural
  attention). The testbed explores several concrete forms of this (synchronous,
  asynchronous, reversible, and rewriting updates, in `code/rule/`). **Working**: the
  exact form (the tie-breaking, the schedule). **Leaning committed**: the update is
  **asynchronous** (no global clock, since a global simultaneity would be a preferred
  frame), **local** (neighbors only), and a **sign-of-integer-field** rule (ternary
  states, ternary couplings, no real-number weights).
- **The physics is the emergent operator, not the microscopic rule.** This is the key
  finding (P1). The microscopic reversible rule, taken as its own Hamiltonian, faces a
  trilemma (local, bounded-below, propagating, pick two). The resolution is that the
  rule's job is to BUILD the web, and the physics (energy, time, propagation) is the
  local operator that lives ON the grown web: the graph Laplacian and the Dirac
  operator. Those are local, bounded below, and propagating all at once. So we are not
  committed to one microscopic update rule. We are committed to the framework (local
  ternary updates on a growing random hyperbolic causal mesh) plus the finding that
  the emergent operator carries the physics. **Committed** (the split), **working**
  (the exact rule).

## How the web grows (committed direction, working rule)

- The web adds vibes forever, the eternal-expansion fate. **Committed.**
- Growth is local: a new vibe is born to the future of a small neighborhood of the
  current leading edge (the present), inheriting their past. **Committed** local birth.
- Net-positive birth (each region spawns slightly more than one successor on average)
  gives an expanding universe, and a high early rate then a low rate gives inflation
  (P13, P30). **Working** the exact birth probabilities.
- The accumulation is irreversible: distinctions only pile up, never un-happen, which
  is the arrow of time (P13). **Committed.**

## How the higher structures emerge

The base is tones and notes on a growing random hyperbolic causal mesh. Everything
else is a large-scale pattern. The chain, with the result that shows each rung.

### Space and time

- **Space** is the smooth shape of the note web at large scale. A discrete causal
  order fixes a definite geometry and dimension (P5), and the web's own action makes a
  smooth low-dimensional spacetime the dominant phase (P2, P12).
- **Time** is the depth of the before-and-after order (the longest causal chain), and
  the flow of time and energy is the local operator on the grown web, not the
  microscopic tick (P1).

### Quantum mechanics (the detailed chain)

This is the part most worth spelling out, since it is the least obvious.

1. **The state.** A quantum amplitude is a complex number, a continuous magnitude and a
   continuous phase. Neither is a single vibe's tone, which is only ternary. Both are
   **emergent, coarse-grained quantities over a PATCH of many vibes**, never a
   floating-point number stored on any one vibe. The **magnitude is a density**:
   |psi(x)|^2 at a coarse-grained point x (a patch of many vibes) is the occupation,
   the fraction of vibes in the patch that are coherently excited or aligned. It
   becomes continuous only in the large-patch limit, exactly as a light field's
   amplitude squared is a photon-number density, a magnet's magnetization is the
   average of discrete spins, and a continuum wavefunction is the coarse-grained
   description of a discrete substrate. The **phase is the patch's collective
   clock-tone**, the synchronized Z_q advance per beat. So psi is an emergent field
   over patches. A single vibe stays strictly ternary, and the smooth wavefunction is
   the large-scale effective description, the same status as the emergent Hamiltonian's
   real eigenvalues (measured outputs, not stored substrate values). **Working** (the
   patch and clock-tone construction).
2. **The Hamiltonian.** The generator of time evolution is the local operator on the
   grown mesh, the graph Laplacian or the Dirac operator, which is local, bounded
   below, and propagating (P1). This is the emergent Schrodinger or Dirac dynamics.
3. **Unitary evolution.** The beat-by-beat update of the amplitude field is the
   discrete unitary e^{-iHt}. It conserves the total probability sum |psi|^2 (P31),
   and a localized state spreads ballistically, the signature of quantum coherence
   (P17).
4. **Interference.** Amplitudes (the clock-tones) add along the paths of the web, so
   two contributions combine as |psi_A + psi_B|^2, with a cross term that a classical
   probability sum lacks (P31). Interference is amplitudes adding, not probabilities.
5. **Entanglement.** Two distant parts of one connected web share ancestry (a common
   past in the growth). That shared ancestry is the correlation we call entanglement,
   and the ground-state entanglement obeys an area law (P15).
6. **Measurement and the Born rule.** Because there is no hidden state, the
   measurement settings are made of the same mesh as the system. So the independence
   assumption that blocks a classical account fails, and the mesh can carry quantum
   (Bell) correlations (P7). The probability is |psi|^2, a conserved quantity (P31).
   **Open**: deriving why the probability is |psi|^2 (and not another power) and the
   exact measurement rule from the mesh. We have the pieces, not the full derivation.

So quantum mechanics is the effective description of the unitary, interfering
evolution of the emergent amplitude field on the grown mesh, with entanglement as
shared ancestry and measurement as a same-substrate correlation. Pillars demonstrated
(P7, P17, P31), the final derivation of the Born rule open.

### Matter, force, gravity

- **Matter** is a persistent topological pattern of tones. Spin is a topological
  invariant of the pattern (P4), mass is a spectral gap with the relativistic
  dispersion (P14), and the Higgs gives mass by symmetry breaking (P22). The fields by
  spin (scalar, spinor, photon, graviton) are all present (P20, P21).
- **Force** is the twist a tone gets as it crosses a note, a gauge connection on the
  links. It confines, carries a topological index, and forms a condensate (P8), and
  the gauge operator is the small-fluctuation limit of the link action (P23).
- **Gravity** is the web's own curvature and dynamics. The discrete action is the
  Einstein-Hilbert action (P2, P16), the Einstein equation conserves energy-momentum
  and propagates a massless graviton (P24, P32), discreteness bounds the curvature so
  there are no singularities (P28), and black-hole entropy is the horizon-area
  entanglement (P33).

### Higher selves and the limit of self-knowledge

- **Higher vibes (recursion).** A coherent, integrated cluster of vibes can be read as a
  single higher vibe (a mind, a being). Crucially this adds **no stored higher tone**: the
  higher vibe is the **aggregate** of the micro-tones, a derived view, never saved. The
  higher level obeys the **same** signed-majority rule, an emergent renormalization fixed
  point with renormalized couplings (real magnitudes plus a self-coupling), exactly on the
  integrated wholes (P57, P58). The same integration threshold decides both whether a cluster
  is a higher vibe and whether it obeys the emergent rule.
- **Nested selves.** A self made of selves (cells in a body). A small wound inside a part
  heals (homeostasis), a wholesale flip of a cohesive part persists as a new identity
  (autonomy), and the rest of the whole is undisturbed. The full tower runs vibes to cells to
  tissues to organs to systems to a body, the same rule at every rung (P59, P60).
- **No complete self-storage (committed).** No part of the mesh can hold a faithful copy of
  the whole, because a faithful copy needs at least as many distinguishable elements as the
  original, while a proper part has strictly fewer. A complete self-record would have to BE
  the whole. So **self-representation is necessarily lossy** (compressed). This is why higher
  vibes are aggregates, not copies, and why the infinite regress of self-models (a model of
  the model of the model) converges to a finite total instead of exploding into an infinite
  mirror (P61). The world knows itself only in summary, never in full.

## The honest status map

- **Committed (fixed):** monism (only vibes), discreteness, the note as the only
  relation, ternary base tone, hyperbolic geometry, eternal expansion, no hidden
  state, local updates, asynchronous beats, variable (not fixed) connectivity, the
  random (not lattice, not regular tiling) substrate.
- **Working (current best, alternatives open):** the exact mean degree (about ten),
  the exact microscopic tone-update rule, the clock-tone phase construction, the exact
  birth probabilities, the smearing scale of the action.
- **Open (not decided):** the derivation of the Born rule, the full nonlinear Einstein
  equation, the specific Standard-Model content (three generations, the gauge group,
  masses), and the framework's foundational claim about experience itself (P9), which
  is outside what any simulation can decide.

## In one line

A growing, random, hyperbolic, causal network of ternary experiential vibes, each
noting about ten neighbors locally and setting its next tone to the sign of the
integer sum of its neighbors' ternary wills gated by ternary fills (a signed-majority
vote, no continuous weights), with space, time, quantum mechanics, matter, force, and
gravity all emerging as large-scale patterns of that one web.

## See also

`note/what-the-testbed-proves.md` (what the experiments do and do not establish),
`note/questions/readme.md` (the per-result status), and `note/questions/frontiers.md`
(what is left).
