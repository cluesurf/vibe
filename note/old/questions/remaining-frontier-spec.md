# Remaining Frontier: How to Iterate on and Solve Each

The exact plan for every remaining item beyond P2 / P6 (which has its own spec in
`p2-p6-optimal-path.md`). For each: the goal, the optimal method, the concrete
steps, and an honest note on reachability.

## A4. P8 Schwinger model (chiral fermion in a dynamical gauge field)

**Goal.** Show the chiral overlap fermion feels a fluctuating gauge field by
measuring the chiral condensate in 2D QED (the Schwinger model), which is nonzero
purely from the anomaly. This is the next rung after the index theorem (fixed
background) toward a living chiral-gauge-matter system.

**The blocker.** The condensate is (1/V) Tr(D_ov^{-1}), and the overlap operator is
not Hermitian, so we need its inverse or its (complex) eigenvalues, which the
current Hermitian-only solver cannot give.

**Optimal method.** Two clean options:
1. Build the Hermitian operator H_ov = gamma5 D_ov (the overlap is gamma5-Hermitian,
   so H_ov is Hermitian). Its eigenvalues are real, and the condensate and the
   spectral observables follow from H_ov's spectrum, which the existing
   eigHermitian handles. This avoids a non-Hermitian solver entirely.
2. Alternatively, compute Tr(D_ov^{-1}) by a few-vector stochastic estimator with a
   conjugate-gradient solve on D_ov^dagger D_ov (Hermitian PSD), which scales to
   larger lattices.

**Steps.** (a) Add gamma5-Hermitian assembly of the overlap (reuse the gauge
Wilson-Dirac and the matrix sign). (b) Generate quenched 2D U(1) gauge
configurations by the existing Wilson-action Monte Carlo. (c) For each, get H_ov's
low spectrum and form the condensate, average over configurations and topological
sectors. (d) Validate the sign and rough magnitude against the known Schwinger
result (condensate proportional to the photon mass). Reachable now, option 1 needs
only a gamma5-Hermitian wrapper plus a configuration average.

## B2. Chiral gauge theory (interacting, non-Abelian)

**Goal.** Couple a single chiral (not vector-like) fermion to a dynamical
non-Abelian gauge field with the chiral projection. This is the real path to the
Standard Model.

**Honest status.** This is an OPEN problem in lattice field theory, not just here.
A fully satisfactory, non-perturbative chiral lattice gauge theory does not exist
in the literature. We do not promise a solution.

**Reachable rungs (what we CAN do).**
1. The overlap index in an SU(2) background (the non-Abelian index theorem), in 4D
   where SU(2) has instantons (pi_3(SU(2)) = Z). Needs 4-component spinors, the 4D
   Wilson kernel, and SU(2) link matrices in the Dirac operator. Heavy but a clean
   extension of the U(1) index result.
2. Luscher's construction of the chiral measure for Abelian chiral gauge theory on
   the lattice, demonstrated in 2D: the overlap defines a consistent chiral
   determinant for U(1). This is the furthest reachable rung and is itself
   substantial.

**Steps.** Do the SU(2) index in 4D first (it reuses the overlap machinery with
bigger matrices), then attempt the 2D Abelian chiral measure. Treat the full
non-Abelian chiral theory as out of reach and say so.

## P7. Aligned correlation from dynamics

**Goal.** Currently the aligned setting-state correlation that produces Bell
violation is put in by hand. Produce it from mesh evolution, closing the quantum
link. (The measurement-dependence side is already done: the currency is aligned
bits, not bits.)

**Optimal method.** Build a deterministic mesh process in which the measurement
setting and the outcome-relevant hidden variable are computed by the SAME local
update from a shared region of the substrate. If alignment is forced by sharing the
computation, it is structural, not fine-tuned. Concretely: a small reversible mesh
where a "source" region evolves into both the hidden state read at the detectors
AND the local features that set the measurement angles, through one rule. Then
measure whether the induced correlation is aligned (gives violation) without it
being imposed.

**Steps.** (a) Define a shared-source mesh with a deterministic local rule.
(b) Read lambda and the two settings from overlapping evolved regions.
(c) Measure CHSH and the alignment. (d) Honest test: if a NATURAL rule gives
alignment only for special rules, report which, and whether that class is generic.

**Honest status.** This is the contested heart of superdeterminism. A positive toy
would be suggestive, not decisive. The decisive version (a natural mesh generically
produces the quantum-aligned correlation) is genuine open research.

## B1. Manifold dominance in the continuum limit

**Goal.** Prove manifold-like orders dominate the FULL sum over histories as
N goes to infinity, not just at finite N.

**Honest status.** Open in causal set theory. The finite-N phase transition (P2 /
P6, see its spec) is the evidence we can build. The continuum-limit proof is a
mathematical result beyond simulation. We strengthen the evidence (finite-size
scaling toward the continuum), we do not close it.

## C. P9 (experience) and the Standard Model content

**P9.** We measure structural correlates of a self (a Markov blanket, integration).
Whether those ARE experience is not a question the simulator can decide. This is
the framework's own boundary. No iteration plan, by design.

**Standard Model content.** The specific gauge group, three generations, and the
mass spectrum will not fall out of a small testbed. The ladder (Stages A to E)
shows the mechanism is present, the specific content is out of reach.

## Priority and what we begin now

Reachability, highest first:
1. **P2 / P6 parallel tempering** (own spec): the most important, most achievable.
   Begun now.
2. **A4 Schwinger via gamma5-Hermitian overlap**: reachable with a small wrapper.
3. **B2 SU(2) index in 4D**: reachable but heavy.
4. **P7 alignment toy**: reachable as a suggestive toy, not decisive.
5. **B1, C**: open research or boundary, documented honestly.

We begin with the P2 / P6 down-payment, parallel tempering, because it directly
attacks the deepest problem and the metastability that the warm-start study could
not resolve.

## See also

`p2-p6-optimal-path.md`, `roadmap.md`, `note/experiment/results/`.
