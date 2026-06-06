# Roadmap: what is left, and are we at the limit?

An honest map of the frontier after the validated results (P1, P3, P4, P5, P7, P8
A-B-C plus the index theorem) and the candidate progress (P2/P6). The short
answer: we are not at the limit, but the remaining work splits sharply into three
kinds. This document maps all of it and says, for each, exactly how to attack it.

## Tier A: achievable and significant (do these)

Clean, validatable extensions that the testbed can actually settle.

### A1. P1: is the Hamiltonian itself local? (implemented this iteration)
We showed the reversible rule is local and its energy is bounded below. The open
part is whether H = i log U is also local. **How:** build H exactly from the
permutation's cycle structure, expand it in the Pauli basis, and measure the
operator weight by interaction range. A decaying profile means quasi-local. This
quantifies the open part of P1 directly, and it is cheap (a few thousand Pauli
strings for 6 to 8 cells).

### A2. P3: the both-worlds substrate under growth (implemented this iteration)
We showed a static hyperbolic graph has reach, Lorentz isotropy, and navigation at
once. **How:** grow the graph incrementally (add nodes that attach to nearby
existing ones) and re-measure at snapshots. If the three properties persist as the
graph grows, the result lifts from kinematics to dynamics: a stable, growing vibe
mesh, not a one-shot construction.

### A3. P2/P6: a faster move and finite-size scaling
The manifold phase is a stable basin. The two basins are metastable. To prove a
first-order transition we need bigger systems. **How:** replace the O(N^3)
Floyd-Warshall closure repair with an incremental closure update (toggling one
relation only adds or removes the order-interval it implies, O(N^2) amortised),
reach N about 300, and do finite-size scaling of the height-ratio gap. If the gap
sharpens with N, the transition is real.

### A4. P8: the Schwinger model (chiral fermion meets a dynamical gauge field)
The index theorem used a fixed background. **How:** generate dynamical 2D U(1)
gauge configurations by the Wilson action, and measure the overlap fermion's
chiral condensate, which is nonzero in the 2D Schwinger model purely from the
anomaly. A nonzero, gauge-averaged condensate is the chiral fermion genuinely
feeling a fluctuating gauge field. Needs an overlap inverse (a few smallest
eigenvalues suffice).

### A5. 4D extensions
The chirality and index results are in 2D. **How:** 4-component spinors, the 4D
Wilson kernel, and a 4D lattice. The overlap construction is identical. Only the
matrices grow. This reaches the physically relevant dimension.

## Tier B: genuine open research frontier (attack, expect partial)

These are open in the physics literature, not just here. Progress is possible but
a full solution is not promised.

### B1. The causal-set manifold-dominance proof
Even with the smeared action and finite-size scaling (A3), proving that
manifold-like orders dominate the full sum over histories in the continuum limit
is an open problem in causal set theory. We can strengthen the evidence. We cannot
close it.

### B2. Interacting chiral gauge theory
Coupling a single chiral (not vector-like) fermion to a dynamical non-Abelian
gauge field, with the chiral projection, is an open problem on the lattice
(the chiral gauge theory problem). The index theorem and the Schwinger model
(A4) are the reachable rungs below it.

### B3. P7: naturalness of the setting-state correlation
We quantified how much statistical-independence violation buys how much CHSH
violation. Whether a natural deterministic mesh produces the required correlation
without hand-tuning is the contested heart of superdeterminism. **How (a toy):**
build a deterministic substrate where the measurement settings and the hidden
state are both read from the same local region, and measure the induced
correlation. A positive result would be suggestive, not decisive.

## Tier C: beyond reach or out of scope (name them honestly)

### C1. P9: the hard problem of experience
We can measure structural correlates (a Markov blanket, integration). Whether
those correlates ARE experience is not a question the simulator can decide. This
is the framework's own boundary, and we leave it there.

### C2. Deriving the Standard Model
The specific gauge group, three generations, and the mass spectrum are not going
to fall out of a small testbed. The ladder (Stages A to E) shows the mechanism is
present. The specific content is not in reach.

## So, are we at the limit?

No, but we are past the easy wins. The validated results cover the conceptual core
(emergent geometry, spin from topology, confinement, the chirality wall, the index
theorem, the Bell mechanism, dimension uniqueness). What remains is (Tier A)
careful extensions the testbed can still settle, (Tier B) genuine open research
where we can add evidence but not closure, and (Tier C) the honest boundary. The
right move is to clear Tier A, push Tier B as far as the evidence allows, and be
explicit about Tier C.

## This iteration

Implement A1 (P1 Hamiltonian locality) and A2 (P3 under growth), the two cleanest
Tier-A wins, and leave A3 to A5 and Tier B speced above for the next passes.

## Current state (updated)

Since this roadmap was written, the achievable Tier-A items and the two deepest
questions have been cleared or sharpened:

- **A1 / P1 (the law): resolved.** Characterised as a trilemma (local, bounded
  below, propagating: pick two for a CA's own log) and resolved by the
  emergent-mesh Hamiltonian (the Laplacian is all three at once). See `p1-law.md`,
  `p1-emergent`.
- **A2 / P3 (under growth): done.** The both-worlds substrate survives an
  eightfold expansion at constant density. See `p3-growth.md`.
- **B3 / P7 (the quantum link): sharpened.** Determinism makes violation possible,
  and the currency is aligned bits, not bits (1 bit of measurement dependence
  gives S = 4 aligned or S = 1 misaligned). See `p7-naturalness.md`,
  `p7-alignment`.

What genuinely remains, and why it needs more than a quick pass:

- **A3 / P2-P6 at scale** needs a faster Monte Carlo move (incremental closure to
  reach a few hundred elements) before finite-size scaling can prove the phase
  transition. Real engineering, not a one-off.
- **A4 / P8 Schwinger** needs an overlap inverse, which means a complex
  non-Hermitian eigensolver or an iterative solve, infrastructure the testbed does
  not yet have.
- **B2 chiral gauge theory** and **B1 manifold-dominance in the continuum limit**
  are open in the physics literature, not just here.
- **P7 alignment from dynamics** is the residual hinge: producing an aligned
  setting-state correlation from mesh evolution, the genuine frontier of the
  superdeterminism program.
- **C / P9 and the Standard Model content** remain the honest boundary.

So the conceptual core and the two deepest questions are now addressed. What is
left is either infrastructure-gated (A3, A4) or genuine open research (B1, B2, P7
alignment) or out of scope (C).

## See also

`frontier-spec.md` (Fronts 1 to 3 in detail),
`deck/vibe/note/experiment/results/` (all results), `p4-chirality-spec.md`,
`p2-dynamics-spec.md`.
