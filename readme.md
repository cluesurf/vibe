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
  A Discrete Universe Φ
</p>

<br/>
<br/>
<br/>

## Basics

This codebase is a finite, discrete, reproducible simulator that turns
the theory into runnable measurements. It is the bench where the model
is built, stress-tested, and checked against known physics. It generates
the discrete substrate (the mesh), runs the one local rule over it in
discrete beats, and measures what emerges, so each question becomes a
concrete experiment that either works or does not.

## Introduction

The Standard Model of physics falls out of a single hyperbolic
`{3,4,3,4}` tessellation in four dimensions, matched across hundreds of
reproducible code experiments here. Physical reality appears to be
basically the thin skin at its edge. Imagine it like a baseball. The
inside is a dense weave of tightly wound fibers, all the way through.
That's 3D, but this is in 4D, and at the base that weave is a perfectly
regular grid, built from a single 24-cell reflecting endlessly like a
mirror, and it is where all experience lives, which is basically all of
reality. The thin skin on the cusp is physical reality, worked from
within like a puppet. Consciousness is the grid. The physical universe
is its projection.

[Vibe Theory](https://doi.org/10.5281/zenodo.20694262) treats reality as
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
committed substrate is another member in the same family of regular
hyperbolic honeycombs, the four-dimensional `{3,4,3,4}`, whose cells are
24-cells and whose 24 directions form the `D4` root system that carries
spin. Its flat three-dimensional cusp is the physical space we live in,
and time is its growth. The three-dimensional `{5,3,4}` and the
two-dimensional `{7,3}` are the lower faces used to build intuition,
since `{3,4,3,4}` cannot be drawn directly. The dimension is not a free
choice. Regular hyperbolic honeycombs run out by the fifth dimension,
and `{3,4,3,4}` is the one that is at once crystallographic,
spinor-carrying, and three-dimensional where physics lives.

The base of the model is settled, the discrete substrate and its single
local rule. From it the architecture of physics is derived: the
particles and their charges, the gauge group, the Higgs, the shape of
the mass hierarchy, and the emergent laws of relativity, gravity, the
quantum, holography, and cosmology. The absolute masses and couplings
are free, exactly the parameters the Standard Model leaves free, each
now identified with a specific geometric origin. The larger aim is to
derive space, matter, gravity, the quantum, cosmology, and mind from the
one rule, and to be clear at every step about what is solid, what is
free, and what is still open. The companion papers are snapshots of that
work.

## What is a vibe, and what is falsifiable

The one primitive is the **vibe**, a unit of experience. It carries a
ternary **tone** (its felt charge: pain, peace, pleasure) and it notes
(experiences) its neighbors. Everything else is arrangements of vibes and
one rule for how their tones update. That the base genuinely **is**
experience, that the tone is felt and not merely a label on a number, is
the model's one **axiom**. Like every axiom, it is unfalsifiable. No lab
reading distinguishes a universe whose base is felt from an identical
universe whose base is only structure. We hold it as a **frame**, not a
result. The experiments here never confirm it. They confirm structure.

Under that frame sits a concrete discrete dynamical system, and it is
highly falsifiable: a fixed geometry (the `{3,4,3,4}` honeycomb, a
24-direction coin), a ternary state, and one reversible charge-conserving
local rule. The physics is derived from that fixed base as measured
consequences, and the whole method is built to try to make them come out
wrong. Every deep claim carries a **control**, a case where the answer
should be no, and a test that cannot fail is graded `L0` and counts for
nothing. Honest negatives are kept, not hidden. The spinor that appears
on the `{3,4,3,4}` coin and provably fails to appear on the `{5,3,4}`
control, the area-law exponent that had to land near 2 and not near 3,
the Lorentz isotropy that could have stayed anisotropic: each could have
killed its claim and did not.

So "vibe theory is unfalsifiable" is half right and half wrong, and the
two halves must be kept apart. The axiom "experience is the base" is
unfalsifiable, which is what an axiom is. The physics built under it is
falsifiable, is being falsification-tested with controls and published
failures, and is the opposite of a theory that fits anything. The honest
reading is that the experiments do not prove the base is felt. They show
that a single discrete rule, framed as felt, recovers a large amount of
physics as results that could have come out otherwise.

## Keys

The base model of reality is settled here pretty much, next is to
explore the elaborations/implications.

Here are the key notes:

- [Short audio overview of things](https://www.youtube.com/watch?v=9ftVzOO9Y2I)
- [A Discrete Universe: The Standard Model from the octonions on a hyperbolic 24-cell mesh](https://doi.org/10.5281/zenodo.20768426)
- [Vibe Theory: A Discrete Hyperbolic Substrate for the Emerging Conscious Universe](https://doi.org/10.5281/zenodo.20694262)

## Details

Everything is finite and deterministic, so every result is exactly
reproducible. The base never relies on randomness. Real numbers appear
only as measured outputs (coordinates, eigenvalues, dimensions), never
as the base, in keeping with the discreteness principle. Much of this
code was written with AI assistance, which changes nothing about
trusting it. It is deterministic and reproducible, so you can run it and
verify every result yourself. Each question is one experiment in
`test/experiment/<category>/`, a single `experiment` that returns a
structured verdict (status, metrics, control, claim) graded by an honest
depth level, from `L0` circular through `L1` known math and `L2` known
physics to `L3` emergent and novel. The standard the experiments are
held to is in
[`note/experimental-methodology.md`](note/experimental-methodology.md),
and the code and test layout is in
[`note/architecture.md`](note/architecture.md).

## The Experiment Catalog

[**`test/catalog.csv`**](test/catalog.csv) is the full index of every
experiment in the suite, one row per registered experiment. It is
generated from the registry itself (`npx tsx test/catalog.ts`, or
`pnpm call test/catalog.ts`), so the code and the catalog are always the
same source of truth, and it is sorted strongest-first, by depth, then
id. It is the fastest way to see, at a glance, everything the model has
been asked and how strongly each result holds. Regenerate it any time
the registry changes.

Every experiment self-grades by what it actually establishes, not by
whether it prints PASSED.

| level  | meaning                                                                                                                                                                     |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **L3** | emergent and novel. One base rule produces the result as a measured consequence, with a control, ideally a quantitative prediction that could be wrong. The genuine target. |
| **L2** | known physics. Reproduces a known construction on the substrate (a Dirac quantum walk, lattice gauge theory, a ballistic light cone).                                       |
| **L1** | known math. Correctly confirms an established mathematical fact (the 24-cell is the binary tetrahedral group, a 2pi rotation gives minus one).                              |
| **L0** | circular. The answer is put in by hand, so it proves nothing on its own. Kept only as a consistency note, never as evidence.                                                |

So L3 is the real prize, L1 and L2 are groundwork, and L0 is a marker of
what is assumed rather than derived. Most results in a young program are
L1 and L2, and that is fine as long as they are labeled as such. The
full rubric and the rules the runner enforces (an L3 claim must carry a
control, for instance) are in
[`note/experimental-methodology.md`](note/experimental-methodology.md).

As of the latest run the catalog holds **743 experiments across 18
categories**: 81 at `L3` (emergent and novel), 475 at `L2` (known
physics reproduced), 173 at `L1` (known math confirmed), and 14 at `L0`
(circular), with 484 of them backing a specific claim in the papers. The
largest categories are selves, gauge, foundations, cosmology, quantum,
and gravity. The L3 count fell and the L1 count rose in the standing
depth audit that regraded overclaimed depths, which is the direction
careful regrading moves.

## Quick start

```
pnpm install
pnpm test         # the full experiment registry plus the conformance battery
```

Every experiment lives in `test/experiment/<category>/<name>.ts` as one
`experiment`, and the suite runner (`test/run.ts`) imports them all and
runs the registry. The shared library they import is in `code/`, and the
named batteries (conformance, paper) are in `test/suite/`. The build
fails only on a code crash or a conformance failure, never on an honest
scientific negative.

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
- **test/experiment**: one `experiment` per question, grouped by
  category (foundations, geometry, relativity, spin, gauge, gravity,
  cosmology, holography, quantum, renormalization, selves, computation,
  addressing, substrate-survey, data-structure), run by the suite runner
  in `test/`.

## Documentation

All docs live in `note/`. The entry points:

- **[The library guide](note/library/readme.md)** is how to USE the
  `code/` library. It opens with a
  [features-at-a-glance](note/library/features.md) page (what the
  library solves for in one scannable set of tables) and an
  [overview](note/library/overview.md) of how it all fits together.
  Under that are per-domain API guides (substrate, tone-and-rule,
  operator, measure, dynamics, algebra, model, tool,
  computing-and-data-structures, draw-and-render) and engine deep dives
  explaining how each engine works inside (the Coxeter tessellation
  engine, the reversible rule, the Kahler-Dirac fermion, the spinor
  coin, the spectral methods, the causal-set sampler, the unitary
  evolution, the lattice gauge engine, the coarse-graining and selves
  engine, and the associative memory engine).
- **[The math catalog](note/math.md)** lists every piece of math the
  library runs: what each module implements, what it depends on, and which
  experiments use it.
- **[Architecture](note/architecture.md)** is where code and tests live,
  and how to add an experiment.
- **[Experimental methodology](note/experimental-methodology.md)** is
  the standard every experiment is held to, the depth rubric, the
  control requirement, determinism, and the honest negatives.
- **[Open problems](note/open/)** are the honest negatives written up
  in full. The hardest is
  **[spacelike Bell correlations](note/open/spacelike-bell-correlations.md)**:
  what Bell's theorem actually proves, why a deterministic theory can still
  match quantum mechanics (it drops measurement independence, not
  determinism), the price vibe pays for that, and the measured shared-past
  collapse that makes it hard.
- **[Cross-tessellation experiments](note/cross-tessellation-experiments.md)**
  is how to write an experiment that runs against every regular
  hyperbolic tessellation at once.
- **[Reference data and verification](note/data/reference/readme.md)** is
  the measuring stick: the real physics numbers the experiments are
  checked against, and the live cross-check of each.

## Reference data and verification

The experiments are only as good as the numbers they are compared to, so
those numbers live in one cited place:
[`note/data/reference/`](note/data/reference/readme.md).

- **What we gathered.** Every external value an experiment must match or
  use as a comparison: the fundamental constants, the full Standard Model
  particle table, the roughly 26 free Standard Model parameters, the CKM
  and PMNS mixing matrices, the cosmological parameters, and the
  geometric and group-theory targets the model derives (the ternary 3,
  the 24 of the cell, the octonion ceiling 8, F4 order 1152,
  sin^2(theta_W) = 3/8, the Tsirelson bound, the Born exponent, and so
  on).
- **What it contains.** Structured CSV plus a machine-readable
  `reference.json`, with a prose [readme](note/data/reference/readme.md)
  and a [bibliography](note/data/reference/sources.md). Every single row
  carries a `source` tag and a `verified` date. The empirical values were
  fetched from and reconciled against their primary sources on 2026-06-24
  (CODATA 2022, PDG 2024, NuFIT 6.0, Planck 2018).
- **How we used it.** The
  [verification](note/data/reference/verification/readme.md) folder runs
  the comparison-bearing experiments live and diffs each measured number
  against the reference value, recording a status per experiment in
  [`cross-check.csv`](note/data/reference/verification/cross-check.csv).
  This is the double-and-triple-check rule applied to the data: it
  confirmed the genuine matches (the quantum bounds, the 3/8 angle, F4,
  the warp factor, the area law) and caught real problems (two mismapped
  experiments, one circular result whose number was hardcoded, and one
  result that is actually stronger than the table recorded).

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
