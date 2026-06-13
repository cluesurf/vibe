# What the Testbed Shows (and What It Does Not)

A fair, skeptical question: there are dozens of experiment files
producing numbers. How is that not fluff? What does any of it actually
validate? This document answers that plainly. It is the honest
accounting of what the code establishes, what it does not, and why it is
more than rhetoric.

## Is there a single "final model" file?

No, and there should not be. The model is not one file, it is an
assembly:

- **The substrate** (`code/substrate/`): the mesh itself, generated many
  ways (sprinkled spacetime, lattices, hyperbolic graphs, sequential
  growth).
- **The rule** (`code/rule/`, `code/dynamics/`): how the mesh updates
  and which orders it favors (the local rules, the Benincasa-Dowker
  action, the samplers).
- **The operators** (`code/operator/`): the things that read physics off
  the mesh (the Laplacian, the Dirac and overlap operators, the gauge
  and Maxwell operators).
- **The measures** (`code/measure/`): dimension, curvature, Lorentz
  isotropy, CHSH, entanglement, and the rest.

The public surface is `code/index.ts`. "The model" is the claim that
this one substrate, updated by a local rule, carries all of physics as
patterns. The experiments test that claim, piece by piece. There is no
`model.ts` because the model IS the validated assembly, not a single
equation.

## The anti-fluff core: known-answer tests

Here is the key. A number on its own is meaningless. A number from a
tool that has been checked against a case with a KNOWN right answer is
not.

Every measurement tool in the testbed is calibrated against a case where
the correct answer is known independently, from established mathematics
or physics:

- A Poisson sprinkling of a d-dimensional spacetime MUST measure
  dimension d. If the estimator returns the wrong number, the test
  fails.
- A CHSH experiment with independent settings MUST respect the classical
  bound of 2.
- The overlap operator MUST have exactly one fermion species and exact
  chiral symmetry (Ginsparg-Wilson residual at machine zero).
- The uniform-measure sampler MUST reproduce exact enumeration at small
  size.
- A Poisson sprinkling MUST be more isotropic than a regular lattice.

There are 45 such checks (`code/test/run.ts`), and they all pass. This
is the difference between "a number came out" and "a validated number
came out." Several early versions were WRONG in plausible-looking ways,
a miscalibrated dimension estimator, a sprinkler that was not uniform by
volume, a Monte Carlo move that did not sample the right measure, and
the known-answer tests CAUGHT them
(`note/experiment/results/methodology-fixes.md`). A fluff project cannot
be caught being wrong, because it never commits to a checkable claim.
This one does, repeatedly.

## What each experiment actually establishes (three honest categories)

**A. The machinery is correct.** The operators and measures genuinely
compute the physics they claim, because they pass the known-answer
tests. This is real and checkable, not rhetoric.

**B. The framework CAN carry known physics (expressiveness).** Many
experiments reproduce standard results: the Newtonian potential (P16),
the photon (P20), the graviton (P21), confinement and the index theorem
(P8), the electroweak masses (P25). Be clear about what this does and
does not mean.

- It does NOT prove Vibe Theory is uniquely correct. Standard physics
  reproduces these too. Lattice gauge theory has the photon. General
  relativity has the graviton.
- It DOES test a load-bearing claim that could have failed. A monist
  "everything is one mesh of relations" theory is FALSIFIED if you
  cannot build matter, force, and gravity out of that mesh. These
  experiments rule out the failure mode "the mesh is too poor to carry
  physics." That is a real test with a real way to lose, and the
  framework passes it. Expressiveness is necessary, not sufficient.

**C. The genuinely distinctive claims.** A few experiments are where the
framework says something of its own and could be wrong on its own terms:

- **The both-worlds substrate (P3):** one mesh that is at once
  Lorentz-safe and navigable, which a lattice and a generic random graph
  each fail. This is a specific, non-obvious claim and it holds.
- **Dynamical selection of spacetime (P2, P12):** the substrate's own
  action makes smooth spacetime the dominant phase above a measured
  coupling, rather than assuming it. This is the deepest open problem in
  causal set theory and the testbed measures it.
- **Spin from topology in a monist substrate (P4):** the spinor is built
  only from cell tones, and its modes count the topology.
- **Quantum from a classical base (P7):** determinism makes Bell
  violation reachable, and the testbed quantifies the exact residual
  tension (the violation decays with separation), which is the honest
  open problem, not a hidden assumption.

## What the testbed does NOT prove

Stated bluntly, so there is no overselling:

- It does not prove Vibe Theory is the true theory of nature.
- It does not derive the Standard Model uniquely. It shows the mesh can
  HOST gauge fields and the Higgs mechanism, the way lattice field
  theory hosts them.
- It does not settle the framework's foundational claim about experience
  (P9). That is marked a boundary, outside what any simulation decides.

Confirmation as a theory of nature would come from the DISTINCTIVE
PREDICTIONS meeting observation: a Planck-scale Lorentz-violation
signature, the causal-set swerve diffusion, a fluctuating (everpresent)
dark energy. Those are observational programs, not simulations, and they
are listed in `note/questions/frontiers.md`.

## So why is it not fluff

Three concrete reasons.

1. **It is falsifiable and reproducible.** Every claim is a seeded,
   known-answer-tested measurement that could fail. It is not an
   argument you can only agree or disagree with. It is code that either
   passes its checks or does not.
2. **It converts slogans into a program.** "Everything is a vibe mesh"
   becomes "build geometry, time, matter, force, gravity, and the onset
   of quantum behaviour from one mesh, and measure each." Each step is a
   runnable experiment with a way to lose, and several early steps DID
   lose and were corrected.
3. **It is honest about its own status.** Every result is sorted into
   demonstrated, strong-evidence, assumed, open, or boundary
   (`note/questions/readme.md`, `note/experiment/results/`). You always
   know exactly what has been earned and what has not.

## The honest one-paragraph summary

The testbed proves that the monist mesh is **computationally coherent
and expressive**: one substrate, updated by a local rule, can carry
geometry, time, matter, force, the onset of gravity, and the onset of
quantum behaviour, and the machinery that shows this is validated
against known physics by 45 known-answer tests. It **sharpens the
framework's distinctive claims** into measured form (the both-worlds
substrate, the dynamical selection of spacetime, the superdeterministic
quantum tension). It does **not** prove the framework is the correct
theory of nature, that requires its distinctive predictions to meet
data. The value is a coherent, simulable, falsifiable monist model whose
physical claims are checked rather than asserted, with an honest map of
what is proven, what is plausible, and what is open.

## See also

`note/experiment/results/validation.md` (the known-answer test list),
`note/experiment/results/methodology-fixes.md` (errors the tests
caught), `note/questions/readme.md` (the per-problem status), and
`note/questions/frontiers.md` (the distinctive predictions that would
test the theory against nature).
