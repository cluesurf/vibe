# P17: Quantum Coherence on the Mesh (Quantum, First Rung)

**Status: validated (one rung). The quantum formalism is a long road.**

## The question

P7 gave the Bell-correlation hinge: quantum-strength correlations can come from the
deterministic mesh. But that is not the quantum formalism. One concrete next rung is
genuine quantum coherence. Does unitary evolution on the mesh produce interference?
The clean signature is the spreading law: a coherent quantum walk spreads
ballistically (width grows like t) because amplitudes interfere, while a classical
random walk on the same graph only diffuses (width grows like sqrt(t)).

## What we did

On a 1D chain, evolve a localized state two ways from the center: the unitary quantum
walk e^{-iAt} (A the adjacency, the hopping operator) and the classical random walk
e^{-Lt} (L the Laplacian, the heat equation). Measure the width (root mean square
displacement) versus time and fit the growth exponent.

## Result

| t | quantum width | classical width |
| - | ------------- | --------------- |
| 4 | 5.66 | 2.83 |
| 8 | 11.31 | 4.00 |
| 16 | 22.63 | 5.66 |
| 32 | 45.25 | 8.00 |
| 48 | 67.88 | 9.80 |

- Quantum walk width ~ **t^1.00** (ballistic, exponent 1).
- Classical walk width ~ **t^0.50** (diffusive, exponent 1/2).

The quantum walk spreads ballistically because amplitudes interfere, the classical
walk only diffuses. **Coherent interference, the heart of quantum behaviour, emerges
on the mesh** from unitary evolution e^{-iHt}.

## Honest reading

This is real quantum coherence (the ballistic law is the textbook signature of a
quantum walk versus a classical one), and it is clean. It is not the full quantum
theory. The Born rule (probabilities as squared amplitudes, here put in by hand as
|amplitude|^2), unitarity from the substrate, complex amplitudes from finite clock-
tones, and an account of measurement are all ahead. We have the coherence, not yet
the formalism. Quantum is at its onset (see the v3 paper).

## See also

`p7-naturalness.md` and `p7-alignment` (the Bell hinge), `p1-law.md` (the emergent
unitary Hamiltonian), and `note/questions/next-version.md` (P17).
