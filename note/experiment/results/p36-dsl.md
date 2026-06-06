# P36: The Model DSL (the Committed Model at a Glance)

**Status: a tool. The whole model in a few fluent lines, for the paper.**

## The point

The committed model of `note/the-model.md` should be writable and readable at a glance,
so it can go straight into the paper. The DSL (`code/model/vibe.ts`) does that. With no
options it IS the committed model, and the fluent setters express variants for
comparison. No string is ever evaluated (options are named and dispatched), so it is a
constructor, not runtime code generation.

## The model at a glance (printed by describe)

```
vibe model
  mesh      hyperbolic          random hyperbolic causal mesh, Lorentz-safe, mean degree about 10
  tone      ternary             {-1, 0, +1}, the felt quality of a vibe
  fill      ternary-symmetric   each note carries a ternary fill (a shared relational vibe)
  rule      signed-majority     next(v) = sign( sum over neighbours w of fill(v,w) * will(w) )
  schedule  asynchronous        local, neighbours only, no global clock
  growth    net-positive        eternal expansion by local birth
  size 1500, seed 1
```

## Build, run, read

```
const model = vibe().size(1500).seed(1)   // the committed model
const world = model.build().run(40)        // build the mesh, run 40 beats
world.read()                               // emergent structures off the same mesh
```

Output (one mesh):

- mean degree 10.6, Lorentz anisotropy 0.062, exponential reach true
- emergent Hamiltonian bounded below (min eigenvalue 0.003)
- converged tones -1: 701, 0: 103, +1: 696 (a non-trivial stable pattern)

## Expressing a variant

Swapping one option expresses the Lorentz-violating alternative:

```
vibe().mesh('lattice')   // a regular lattice
```

gives Lorentz anisotropy 1.000 (a strong preferred frame) versus 0.062 for the
hyperbolic mesh. So the DSL makes plain why the random hyperbolic mesh is the committed
choice: the lattice variant breaks Lorentz invariance, the hyperbolic one does not.

## Why it matters

The framework now has a single, legible definition of its model: a few fluent lines
that print at a glance, build, run, and read off the emergent physics, with variants a
one-word change away. This is the model-definition figure for the paper, and the
canonical constructor for the testbed.

## See also

`note/the-model.md` (the full specification), `p34-capstone` (the same model run as an
experiment), and `code/model/vibe.ts` (the DSL).
