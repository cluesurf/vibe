<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

<p align='center'>
  <a href="https://www.youtube.com/watch?v=IE2uHC0qX1o"><img src='https://github.com/cluesurf/vibe/blob/make/view/vibe-mesh-{7,3}.png?raw=true' height='256'/></a>
</p>

<h3 align='center'>Vibe Theory</h3>
<p align='center'>
  A Discrete Model of the Universe
</p>

<br/>
<br/>
<br/>

## Foreword

This is going to take a long time to figure out, or maybe shorter. But
will definitely work on figuring it out over the years, and in the
meantime, going to be publishing papers as snapshots and such of what
seems like are possible solutions. If they turn out to be wrong, that's
part of the process, constant iterating and refinement until something
works perfectly.

In the meantime, I think the general ideas are the way forward, but the
exact technical details are the hard things to get perfectly right from
there.

## Introduction

[Vibe Theory](https://doi.org/10.5281/zenodo.20665953) treats reality as
one thing, a vast growing crystal of experience. The image above is its
simplest face, the hyperbolic `{7,3}` tessellation, and it is meant
literally. Each tile is a **vibe**, the smallest unit of experience.
Each vibe carries a ternary **tone**, its felt charge, shown as a color:
**red is pain, green is peace, blue is pleasure**. Tiles that touch are
vibes that **note** (experience) one another, so the edges of the
crystal are the relations of the mesh. There is nothing else in the
model but this.

To hold it at a glance: a single tile is one quantum of experience, a
patch of tiles is a thing or a mind, and the whole crystal is the
universe, growing forever at its ever-receding edge, which is the
present. The geometry is hyperbolic because that is the shape roomy
enough to grow without end and with no preferred direction, so it
respects relativity. Everything we call physical, space and time and
matter and force and gravity, and everything we call inner, sensation
and emotion and thought, is a large-scale pattern in this one colored,
growing mesh of feeling.

The flat `{7,3}` picture is the easy-to-draw two-dimensional face. The
committed substrate is one member up the same family of regular
hyperbolic honeycombs, the four-dimensional `{3,4,3,4}`, whose cells are
24-cells and whose 24 directions form the `D4` root system that carries
spin. Its flat three-dimensional cusp is the physical space we live in,
and time is its growth. The three-dimensional `{5,3,4}` and the
two-dimensional `{7,3}` are the lower faces used to build intuition,
since `{3,4,3,4}` cannot be drawn directly. The dimension is not a free
choice. Regular hyperbolic honeycombs run out by the fifth dimension,
and `{3,4,3,4}` is the one that is at once crystallographic,
spinor-carrying, and three-dimensional where physics lives.

For the framework itself see the
[companion papers](https://zenodo.org/search?q=metadata.creators.person_or_org.name%3A%22Pollard%2C%20Lance%22&l=list&p=1&s=10&sort=bestmatch)
and a high-level
[overview](https://www.youtube.com/watch?v=IE2uHC0qX1o).

## What this repo is

`@cluesurf/vibe` is a finite, discrete, reproducible simulator that
turns the theory into runnable measurements. It is the bench where the
model is built, stress-tested, and checked against known physics. It
generates the discrete substrate (the mesh), runs the one local rule
over it in discrete beats, and measures what emerges, so each question
becomes a concrete experiment that either works or does not.

Everything is finite and deterministic, so every result is exactly
reproducible. The base never relies on randomness. Real numbers appear
only as measured outputs (coordinates, eigenvalues, dimensions), never as
the base, in keeping with the discreteness principle. Each question is one
experiment in `test/experiment/<category>/`, a single `defineExperiment`
that returns a structured verdict (status, metrics, control, claim) graded
by an honest depth level, from `L0` circular through `L1` known math and
`L2` known physics to `L3` emergent and novel. The standard the
experiments are held to is in
[`note/experimental-methodology.md`](note/experimental-methodology.md),
and the code and test layout is in
[`note/architecture.md`](note/architecture.md).

The goal is to find out whether this crystal model can actually
reproduce our universe, by deriving space, matter, gravity, the quantum,
cosmology, and mind from the one rule, and to be clear at every step
about what is solid, what is partial, and what is still open. The
companion papers are snapshots of a _work very much in progress_.

## Quick start

```
pnpm install
pnpm test         # the full experiment registry plus the conformance battery
pnpm test:full    # the above, then the extended check suite
```

Every experiment lives in `test/experiment/<category>/<name>.ts` as one
`defineExperiment`, and the suite runner (`test/run.ts`) imports them all
and runs the registry. The shared library they import is in `code/`, and
the named batteries (conformance, paper) are in `test/suite/`. The build
fails only on a code crash or a conformance failure, never on an honest
scientific negative.

## Defining the model

The model reads at a glance through a small DSL
([code/model/vibe.ts](code/model/vibe.ts)). With no options it is the
working model, and one-word swaps express variants for comparison. No
string is ever evaluated, so this is a constructor, not runtime codegen.

```ts
const model = vibe().size(1500).seed(1) // the working model
console.log(model.describe()) // print the model at a glance
const world = model.build().run(40) // build the mesh, run 40 beats
world.read() // emergent structures read off the same mesh
```

The substrate generators build the exact regular honeycombs, including
the two-dimensional `{7,3}`, the three-dimensional `{5,3,4}`, and the
committed four-dimensional `{3,4,3,4}` with its `O(log n)` addressing,
alongside random hyperbolic, lattice, and sprinkled comparison meshes.
Swapping to a flat lattice gives a preferred frame and breaks isotropy,
which is why a curved mesh is the committed choice.

## What is inside

- **substrate**: regular `{p,q,...}` hyperbolic honeycombs through the
  Coxeter engine, including the `{3,4,3,4}` cell graph with `O(log n)`
  addressing, plus hyperbolic random graphs, regular lattices, Minkowski
  and curved sprinklings, and classical sequential growth.
- **tone**: the ternary alphabet and the directional fill carried on
  each cell.
- **rule**: synchronous, asynchronous, reversible, rewriting, and gauge
  updates.
- **operator**: graph Laplacian, Kahler-Dirac and overlap fermions, the
  gauge-covariant Dirac, the cellular-automaton Hamiltonian, and the
  gauge index.
- **algebra**: quaternions and the binary tetrahedral 24-cell, the `D4`
  and `F4` root systems, spinor and vector rotation, Clifford and
  exterior calculus, and the linear-algebra kernels (Lanczos lowest
  eigenvalues, the kernel-polynomial method, Bethe resolvents).
- **measure**: dimension, distance, curvature, manifold-likeness,
  Lorentz isotropy, streaming BFS shells, navigation, CHSH, locality,
  integration, Wilson loops, and Aharonov-Bohm phase.
- **dynamics**: the Benincasa-Dowker action, uniform-measure and
  Wang-Landau sampling, parallel tempering, coarse graining, and the
  Wilson heat bath.
- **control**: the negative controls that make a positive result mean
  something (the substrate or rule where the answer must be no).
- **draw**, **render**, and **viz**: renderers and figures for the bulk,
  the cusp, gliders, gravity, and the nesting tower.
- **test/experiment**: one `defineExperiment` per question, grouped by
  category (foundations, geometry, relativity, spin, gauge, gravity,
  cosmology, holography, quantum, renormalization, selves, computation,
  addressing, substrate-survey), run by the suite runner in `test/`.

## License

MIT. Open for science: use, modify, and build on it freely, with
attribution. See [LICENSE](LICENSE). The written results and figures are
shared under CC-BY-4.0 (attribution).

## ClueSurf

Made by [ClueSurf](https://clue.surf), meditating on the universe ¤.
Follow the work on [YouTube](https://youtube.com/@cluesurf),
[X](https://x.com/cluesurf),
[Instagram](https://instagram.com/cluesurf),
[Substack](https://cluesurf.substack.com),
[Facebook](https://facebook.com/cluesurf), and
[LinkedIn](https://linkedin.com/company/cluesurf), and browse more of
our open-source work here on [GitHub](https://github.com/cluesurf).
