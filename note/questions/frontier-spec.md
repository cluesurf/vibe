# Frontier Spec: the three remaining open fronts

After the validated results (P1, P3, P4, P5, P7, P8 A-B-C) and the P2 candidate
progress, three things remain open. This is the exact plan for each, and which one
we implement now.

## Front 1: couple the chiral fermion to the gauge field

We have a confining SU(2) gauge theory (Stage C) and a chiral overlap fermion
(Stage D, free). The honest truth: a fully interacting **chiral** gauge theory on
the lattice is an open research problem in physics, not just here. So we do not
claim to solve it. We climb the reachable rung: show the chiral fermion correctly
**sees gauge topology**, which is the deep content that the index theorem captures.

### The exact first step: the lattice index theorem (implemented now)

Put the overlap fermion in a gauge background of known topological charge Q and
show its **zero-mode count equals |Q|**. This is the Atiyah-Singer index theorem
on the lattice (Hasenfratz-Laliena-Niedermayer 1998), the famous demonstration
that the overlap operator captures the chiral anomaly and gauge topology exactly,
as an integer, even at finite lattice spacing.

Plan (2D U(1), position space, exact diagonalisation):

1. **Gauge field of charge Q.** Uniform flux F = 2 pi Q / L^2 on an L by L torus:
   U_1(n1,n2) = exp(-i F n2), and U_2(n1,n2) = exp(i F L n1) on the boundary row
   n2 = L-1, else 1. This gives every plaquette flux F and total flux 2 pi Q.
   Self-check: sum the plaquette phases and confirm it equals 2 pi Q.
2. **Gauge Wilson-Dirac** D_W as a 2 L^2 complex matrix, with the U(1) links as
   the parallel transport on the hops. Self-check: at Q = 0 it reduces to the free
   Wilson operator.
3. **Overlap** D = I + gamma5 sign(H_W), H_W = gamma5 (D_W - m0), built with an
   exact complex-Hermitian eigendecomposition (sign via the eigenvalues).
4. **Index.** Count the zero modes of D (smallest singular values), and validate
   that the count equals |Q| for Q = 0, 1, 2.

This needs a complex-Hermitian eigensolver, built by embedding the n by n complex
Hermitian H = A + iB as the 2n by 2n real symmetric matrix [[A, -B], [B, A]] and
reusing the existing Jacobi solver.

### Beyond the first step (future)

Couple the overlap fermion to the dynamical SU(2) field (measure the chiral
condensate, the index in SU(2) backgrounds, the anomaly), then the genuinely hard
chiral projection. These stay open and we say so.

## Front 2: the P2 phase transition at scale

The smeared action selects manifold-like orders at small N. To confirm a real
**phase transition** we need to see a sharp order-parameter jump and, ideally,
**hysteresis** (two warm starts converging to different phases over a coupling
window, the first-order signature).

Exact plan:
1. **Warm starts.** Let the Monte Carlo begin from a chosen order, not the
   antichain: a 2D sprinkling (the manifold basin) and a layered Kleitman-
   Rothschild order (the layered basin).
2. **Sweep the coupling** for both warm starts and watch the height ratio. If the
   two starts disagree over a window and agree outside it, that is hysteresis and
   a first-order transition.
3. **Scale.** A faster move (incremental closure rather than full Floyd-Warshall)
   is needed to reach a few hundred elements. Until then, warm starts at N about
   100 already expose the basins.

### Measurement design (implemented now)

The order parameter is the height ratio (longest chain over sqrt N): about 1 for a
2D manifold, near 0 for a layered Kleitman-Rothschild order. The protocol:

1. **Two warm starts.** A 2D sprinkling (manifold basin) and a constructed
   three-layer Kleitman-Rothschild order (layered basin), both with a topological
   labelling so they seed the a < b relation directly.
2. **Sweep the inverse temperature beta** with the smeared action (eps = 0.9).
   For each beta and each start, run the Monte Carlo and record the height ratio
   averaged over the second half of the chain (the equilibrated part).
3. **Read the result.** If both starts converge to the same height ratio at a
   given beta, that beta has a single stable phase. If the sprinkling start stays
   high and the layered start stays low over a beta window, that window is a
   coexistence region: a first-order transition with hysteresis. Crucially, if the
   sprinkling start STAYS manifold-like under the smeared action, the manifold
   phase is a genuine stable basin, not merely reachable from the antichain, which
   strengthens the P2 result. The sharp action is the contrast: it should drive
   even the manifold start toward layered.

Honest caveat: at the achievable sizes incomplete mixing can mimic hysteresis. We
read a persistent start-dependence as evidence of metastable basins, not a proven
first-order transition, and say so.

## Front 3: the P6 2D path integral

P6 is the same dynamics as P2, specialised to a 2D-favoring action and the
question of whether the sum over histories lands on 2D manifold-like orders. Once
Front 2 shows the manifold phase is a genuine basin, P6 is its 2D specialisation:
restrict the action to the 2D coefficients, run the warm-started sampler, and
confirm the dominant orders have Myrheim-Meyer dimension near 2. Shares all the
machinery with Front 2.

## What we implement now

**Front 1, the lattice index theorem.** It is the most significant and the most
cleanly validatable (zero modes = |Q|, an integer), and it directly unites the two
latest results (the overlap fermion and gauge fields). Fronts 2 and 3 are speced
above and share the existing causal-set machinery, to be implemented next.

## See also

`note/experiment/results/p4-chirality.md` (the free overlap operator),
`note/experiment/results/p8-confinement.md` (the gauge sector).
