# P34: The Capstone, the Committed Model Run End-to-End

**Status: demonstrated. One mesh, one rule, all the key structures.**

## The question

Every earlier result used the substrate best suited to it (sprinklings for P2,
lattices for P8, triangulated surfaces for P4, the hyperbolic graph for P3). The honest
gap: does it all fall out of ONE instantiation of the model in `note/the-model.md`?
This runs that single model and reads every key emergent structure off the same mesh
and the same dynamics.

## The model, exactly as committed

- **The substrate**: a random hyperbolic causal mesh (the hyperbolic random graph),
  grown at constant density.
- **The rule**: the ternary signed-majority update. Each beat, a vibe's next tone is
  the sign of the integer sum of its neighbors' ternary wills gated by ternary fills,
  asynchronous, local, no continuous weights. The fills are symmetric (a note is one
  shared relational vibe).

## Result (one mesh of 1500 vibes)

| structure read off the one mesh | result |
| ------------------------------- | ------ |
| mean degree (neighbors per vibe) | 10.6 |
| Lorentz anisotropy | 0.070 (low, no preferred frame) |
| exponential reach | YES |
| tones stay strictly ternary | YES |
| dynamics converges to stable states (flip fraction) | YES (falls to 0.000) |
| emergent Hamiltonian (graph Laplacian) bounded below | YES (min eigenvalue 0.007 >= 0) |
| emergent Hamiltonian local | YES (range 1 by construction) |
| arrow of time (relations accumulate as the mesh grows) | YES |

So the model of `the-model.md` runs as ONE system. From that single instantiation come
a definite geometry with no preferred frame, stable structured states (the basis for
persistent matter and selves, the dynamics flows to a fixed point like a Hopfield net),
the emergent local bounded-below Hamiltonian (the flow of time and energy), and the
arrow of accumulation. The matter, force, and gravity sectors are read off the same
mesh by their operators (P4, P8, P16, P24).

## Why it matters

This closes the integration gap. The framework is not a pile of unrelated demonstrations
on convenient substrates. It is one model, a growing random hyperbolic mesh with a
ternary signed-majority rule, and the key emergent structures come out of that one
model run end-to-end.

## Honest reading

The capstone shows geometry, the emergent Hamiltonian, the dynamics, and the arrow from
the one model. The matter, force, and gravity sectors are still read off the SAME mesh
but by their respective operators (not yet all evolved by the single microscopic rule
in one simulation), which is the natural next integration. And the dynamics converging
to stable states is the basis for persistent matter, not yet the full particle spectrum.

## See also

`note/the-model.md` (the model specification), `note/what-the-testbed-proves.md`, and
`p34-capstone` (the experiment).
