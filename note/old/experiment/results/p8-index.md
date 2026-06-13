# The Lattice Index Theorem: Chiral Fermion Meets Gauge Field

The two latest results were a chiral overlap fermion (P4 / Stage D) and a
confining gauge sector (P8 / Stage C). This unites them: the overlap fermion is
placed in a gauge background of known topological charge, and its index is shown
to equal that charge exactly, as an integer. This is the lattice Atiyah-Singer
index theorem, the precise statement that a chiral fermion sees gauge topology.

Reproduce: `npx tsx code/experiment/p8-index.ts`.

## The setup

On a 2D L by L torus we build a U(1) gauge field of topological charge Q: every
plaquette carries flux 2 pi Q / L^2, with a boundary twist, so the total flux is
2 pi Q. We build the gauge Wilson-Dirac operator with these links as the parallel
transport, form the Hermitian kernel H_W = gamma5 (D_W - m0), and compute the
overlap index from its spectral asymmetry:

```
index = -(1/2) sum_i sign(lambda_i)   over the eigenvalues of H_W
```

The spectral asymmetry counts the net zero crossings of H_W as the mass is dialed,
which is the topological charge. Using the asymmetry (rather than a raw zero-mode
count) is what makes non-topological free zero modes cancel by chirality.

This needed a complex-Hermitian eigensolver, built by embedding the n by n complex
Hermitian H = A + iB as the 2n by 2n real symmetric matrix [[A, -B], [B, A]] and
reusing the Jacobi solver.

## The result

```
charge Q   total flux / 2pi   overlap index   match
   0            0.000              0.000        YES
   1            1.000             -1.000        YES
   2            2.000             -2.000        YES
  -1           -1.000             +1.000        YES
```

The index equals -Q exactly, an integer, for every charge tested, and it flips
sign with the charge. Two self-checks pass: the total flux equals 2 pi Q (the
gauge construction is correct), and the Hermiticity error of H_W is exactly zero
(the gauge Wilson-Dirac operator is gamma5-Hermitian, as it must be). The minus
sign is a fixed convention. The physics is |index| = |Q|.

## What this validates

**The chiral fermion sees gauge topology exactly.** The overlap operator's index
equals the topological charge of the gauge background, as an integer, at finite
lattice spacing. This is the lattice Atiyah-Singer index theorem
(Hasenfratz-Laliena-Niedermayer 1998), and it is the deep content of coupling a
chiral fermion to a gauge field: the chiral anomaly, the index, and gauge topology
are all captured correctly on the mesh. It is the genuine union of the two latest
results, the overlap fermion (P4) and the gauge sector (P8). A known-answer test
guards it (index = -Q for Q = 0, 1, 2, with zero Hermiticity error).

## Honest caveats

- **Background field, not dynamical.** The gauge field here is a fixed classical
  background of definite topology, not the fluctuating quantum SU(2) field of the
  confinement study. Coupling the overlap fermion to the dynamical field (the
  fermion determinant, the chiral condensate) is the next step.
- **U(1), not non-Abelian.** The index theorem holds for non-Abelian backgrounds
  too. Doing it for SU(2) is a clean extension (the links become 2x2 matrices in
  the Wilson operator).
- **The chiral projection is still open.** Seeing topology correctly is necessary
  but not sufficient for a fully interacting chiral gauge theory, which remains an
  open research problem. We claim the index theorem, not the full theory.
- **Exact diagonalisation, small lattice.** L up to 6 by exact complex-Hermitian
  eigendecomposition. The result is exact at this size. Scaling needs an iterative
  sign-function method (a polynomial or rational approximation of sign(H_W)).

## Status

Front 1 of the frontier (couple the chiral fermion to the gauge field) reaches its
first real milestone: the lattice index theorem holds. The chiral fermion and the
gauge field are now connected through gauge topology. The remaining open work is
the dynamical and non-Abelian coupling, and the full chiral gauge theory.

## See also

`p4-chirality.md` (the free overlap fermion), `p8-confinement.md` (the gauge
sector), `note/questions/frontier-spec.md` (the plan for all three fronts).
