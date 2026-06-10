<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

<p align='center'>
  <img src='https://github.com/cluesurf/vibe/blob/make/view/vibe-mesh-{7,3}.png?raw=true' height='256'/>
</p>

<h3 align='center'>Vibe Theory</h3>
<p align='center'>
  A Discrete Model of the Universe<br/>
  (WIP)
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

Vibe Theory treats reality as one thing: a vast, growing crystal of
experience. The image above is its simplest face, the hyperbolic `{7,3}`
tessellation, and it is meant literally. Each tile is a **vibe**, the
smallest unit of experience. Each vibe carries a ternary **tone**, its
felt charge, shown as a color: **red is pain, green is peace, blue is
pleasure**. Tiles that touch are vibes that **note** (experience) one
another, so the edges of the crystal are the relations of the mesh.
There is nothing else in the model but this.

To hold it at a glance: a single tile is one quantum of experience, a
patch of tiles is a thing or a mind, and the whole crystal is the
universe, growing forever at its ever-receding edge (the present). The
geometry is hyperbolic because that is the shape that is roomy enough to
grow without end and has no preferred direction, so it respects
relativity. Everything we call physical, space and time and matter and
force and gravity, and everything we call inner, sensation and emotion
and thought, is a large-scale pattern in this one colored, growing mesh
of feeling.

The flat `{7,3}` picture above is the easy-to-draw special case. The
real substrate is one member of a whole family of hyperbolic crystals
(the regular honeycombs of a reflection, or Coxeter, group), and the
actual universe is the three-dimensional one, the dodecahedral honeycomb
`{5,3,4}`, a crystal of twelve-sided cells filling curved 3D space, with
time as its growth. That is harder to picture and a little richer, which
is why the two-dimensional tiling is shown here, but the model is robust
across the family, and the spatial dimension is not a free choice:
finite-celled hyperbolic crystals exist only in two, three, and four
dimensions, and only three supports stable matter (see P62 and P68
below).

For the framework itself see the
[companion papers](https://zenodo.org/search?q=metadata.creators.person_or_org.name%3A%22Pollard%2C%20Lance%22&l=list&p=1&s=10&sort=bestmatch)
and a high-level [overview](https://cluesurf.substack.com/p/vibe-mesh).
The precise model is specified [here](note/the-model.md).

## What this repo is

`@cluesurf/vibe` is a finite, discrete, reproducible simulator that
turns the theory into runnable measurements. It is the bench where the
model is built, stress-tested, and checked against known physics. It
generates the discrete substrate (the mesh), runs the one local rule
over it in discrete beats, and measures what emerges, so each
question/problem/inquiry becomes a concrete experiment that either works
or does not.

Everything is finite and seeded, so every result is exactly
reproducible. Real numbers appear only as measured outputs (coordinates,
eigenvalues, dimensions), never as the base, in keeping with the
discreteness principle. Each numbered problem below (P1, P2, and so on)
is one such experiment, with its code in `code/experiment/`, its finding
in `note/experiment/results/`, and its status in `note/questions/`.

The goal is practical and honest: to find out whether this crystal model
can actually reproduce our universe, by deriving space, matter, gravity,
the quantum, cosmology, and mind from the one rule, and to be clear at
every step about what is solid, what is partial, and what is still open.
The companion papers are snapshots of a _work very much in progress_.

## Quick start

```
pnpm install
pnpm test                                       # known-answer tests
pnpm call code/experiment/p3-study.ts           # the addressing-vs-Lorentz study
pnpm call code/experiment/p7-bell.ts            # CHSH vs setting correlation
```

Each experiment is also a standalone script:
`npx tsx code/experiment/pN-*.ts`. Findings are tracked in
`note/experiment/results/`.

## Defining the model

The committed model (see [note/the-model.md](note/the-model.md)) is
written and read at a glance with a small DSL
([code/model/vibe.ts](code/model/vibe.ts)). With no options it IS the
committed model, and one-word swaps express variants for comparison.

```ts
const model = vibe().size(1500).seed(1) // the committed model
console.log(model.describe()) // print it at a glance
const world = model.build().run(40) // build the mesh, run 40 beats
world.read() // emergent structures off the same mesh
```

`describe()` prints:

```
vibe model
  mesh      hyperbolic          random hyperbolic causal mesh, Lorentz-safe, degree ~10
  tone      ternary             {-1, 0, +1}, the felt quality of a vibe
  fill      ternary-symmetric   each note carries a ternary fill (a shared relational vibe)
  rule      signed-majority     next(v) = sign(sum over neighbours w of fill(v,w) * will(w))
  schedule  asynchronous        local, neighbours only, no global clock
  growth    net-positive        eternal expansion by local birth
  size 1500, seed 1
```

Swapping `vibe().mesh('lattice')` gives Lorentz anisotropy 1.0 (a
preferred frame) versus 0.06 for the hyperbolic mesh, which is why the
random hyperbolic mesh is the committed choice.

## What is inside

- **substrate**: Poisson-sprinkled Minkowski and curved spacetime,
  regular lattices, `{p,q}` hyperbolic tilings with Fibonacci
  addressing, hyperbolic random graphs, classical sequential growth.
- **rule**: synchronous, asynchronous, reversible, rewriting, and gauge
  updates.
- **fields**: scalar (graph Laplacian), spinor (Kahler-Dirac and overlap
  fermions), vector (the U(1) and SU(2) gauge fields and the free
  photon), tensor (the graviton), plus the Higgs and its mass mechanism.
- **operator**: graph Laplacian, Kahler-Dirac and overlap, the
  gauge-covariant Dirac, the lattice Maxwell operator, the evolution
  Hamiltonian, and the gauge index.
- **measure**: dimension, distance, curvature, manifold-likeness,
  Lorentz isotropy, navigation, CHSH, locality, integration, Wilson
  loops, entanglement entropy, rotation curves.
- **dynamics**: the Benincasa-Dowker action, the correct uniform-measure
  sampler, Wang-Landau density of states, causal-set Monte Carlo,
  classical sequential growth, coarse graining, and the Wilson heat
  bath.
- **experiment**: one runnable script per open problem (P1 to P83), plus
  a scan runner and report writer.

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
