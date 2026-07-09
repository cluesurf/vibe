# The Vibe experiment suite: index and map

This tree lets you see the whole experiment corpus at a glance, find any single
experiment fast, understand what is covered and what is not, and extend the
suite without reverse-engineering it.

There are **771 experiments** in `test/experiment/`. Each is a small,
deterministic kernel or simulation that states one claim, runs on the discrete
substrate, grades itself at a depth tier, and (for the strong ones) compares
against a control that could have failed. No one is going to read 771 files, so
this folder is the way in.

## The suite in one paragraph

Vibe theory says reality is a growing {3,4,3,4} hyperbolic honeycomb carrying a
ternary tone, updated by one reversible conserving local rule, with physics, the
quantum, and selves all emergent from that discrete base. The experiments test
that program piece by piece: the base axioms, the forced substrate, the
emergence of the Standard Model, gravity, the quantum, spacetime, and the self.
Each result is a measured quantity on the substrate, graded plainly, with the
negatives kept.

## How this tree is organized

- **This file** is the master map: the arenas, the coverage, the tiers, the
  themes, the reading paths, and how to extend.
- **`<arena>/readme.md`** (one per arena, 19 of them) is the full, distilled
  index of that arena, every experiment grouped by sub-theme with a one-line
  distillation. Start in an arena when you know the topic.
- **[concepts.md](concepts.md)** is the cross-index: it walks the big ideas
  (reversibility, emergence, the forced substrate, controls, and so on) and
  points into the arenas. Start here when you know the idea but not the arena.
- **[../library/readme.md](../library/readme.md)** documents the reusable code
  the experiments are built from.

## The arenas

Every experiment lives in exactly one arena (its `test/experiment/<arena>/`
folder). Counts are file counts.

| arena | n | what it tests |
| --- | ---: | --- |
| [selves](selves/readme.md) | 176 | whether a bound, self-maintaining self emerges from lossy coarse-graining: binding, agency, integration, identity, death, nesting, self-model, self-localization |
| [gauge](gauge/readme.md) | 71 | the Standard Model gauge group, charges, forces, the mass hierarchy, Koide, and generations, emerging from the substrate |
| [foundations](foundations/readme.md) | 69 | the base axioms: the ternary tone, the one reversible rule, records and the arrow, the pinch to dimension eight, the substrate forced, the SM from the seed |
| [quantum](quantum/readme.md) | 92 | the quantum as emergent from a deterministic reversible base: Born rule, entanglement, the shared-past mechanism, measurement as settling |
| [gravity](gravity/readme.md) | 50 | gravity as emergent and entropic: curvature from the area law, Einstein as an equation of state, the dark sector, horizons |
| [cosmology](cosmology/readme.md) | 50 | the growing wake: self-creation from the void, expansion, dimension selection, inflation, the CMB, dark energy |
| [spin](spin/readme.md) | 43 | spinors and fermions from the 24-cell and D4 coin: the double cover, Dirac, triality, anyons, emergent matter |
| [relativity](relativity/readme.md) | 43 | Lorentz invariance and the light cone as emergent from a fixed lattice (the hard problem for any discrete theory) |
| [geometry](geometry/readme.md) | 37 | why {3,4,3,4}: the 24-cell, F4, hyperbolic tessellation, curvature, the exceptional-algebra spine |
| [holography](holography/readme.md) | 33 | bulk-boundary duality: the area law, Ryu-Takayanagi, celestial holography, error-correcting codes |
| [substrate-survey](substrate-survey/readme.md) | 30 | why this geometry and not another: the same battery re-run on rival lattices |
| [data-structure](data-structure/readme.md) | 28 | the substrate as a data plane: capacity, indexes, paths, routing |
| [associative](associative/readme.md) | 16 | content-addressable memory on the bulk: recall, Hopfield attractors, capacity from curvature |
| [renormalization](renormalization/readme.md) | 15 | the coarse-graining tower and the renormalization-group flow to the continuum |
| [computation](computation/readme.md) | 14 | universal computation on the substrate: reversible CA, the railway, goal-directed search |
| [fluids](fluids/readme.md) | 13 | lattice-gas hydrodynamics: emergent Navier-Stokes, conservation laws, exotic phases |
| [addressing](addressing/readme.md) | 12 | the addressing scheme and greedy geometric routing on the honeycomb |
| [method](method/readme.md) | 3 | meta-experiments about the suite: the rigidity test and the anti-fooling gates |
| [general](general/readme.md) | 1 | the exact renormalization mechanism |
| **total** | **771** | |

## The coverage map

Depth tier by arena, plus the paper-grade count. This is the scope-and-coverage
view: where the suite is deep, where it is thin, and where it has no
control-gated result yet.

| arena | L0 | L1 | L2 | L3 | paper |
| --- | ---: | ---: | ---: | ---: | ---: |
| selves | 3 | 10 | 135 | 28 | 109 |
| gauge | 3 | 29 | 32 | 7 | 42 |
| foundations | 0 | 24 | 45 | **0** | 37 |
| quantum | 1 | 17 | 61 | 13 | 65 |
| gravity | 4 | 10 | 35 | 1 | 21 |
| cosmology | 1 | 8 | 31 | 10 | 36 |
| spin | 1 | 11 | 24 | 7 | 30 |
| relativity | 1 | 4 | 34 | 4 | 34 |
| geometry | 0 | 12 | 23 | 2 | 20 |
| holography | 0 | 7 | 15 | 11 | 17 |
| substrate-survey | 0 | 17 | 12 | 1 | 13 |
| data-structure | 0 | 16 | 12 | **0** | 28 |
| associative | 0 | 2 | 9 | 5 | 16 |
| renormalization | 0 | 1 | 11 | 3 | 8 |
| computation | 0 | 2 | 12 | **0** | 10 |
| fluids | 0 | 0 | 13 | **0** | 11 |
| addressing | 0 | 4 | 8 | **0** | 3 |
| method | 0 | 0 | 3 | 0 | 1 |
| general | 0 | 0 | 1 | 0 | 0 |
| **total** | **14** | **174** | **500** | **82** | **479** |

The bulk of the suite is L2 (a real measured quantity). 82 experiments reach L3
(the strongest, gated by a control that could have failed), and 479 are
paper-grade. The bolded zeros are the arenas with no L3 yet, the clearest place
to strengthen (see "where to extend").

## The depth tiers

Every experiment declares a `depth`. The tiers are a plain grading scale, not a
quality ranking.

- **L0** illustrative. A picture or a sanity check, no load-bearing claim.
- **L1** basic. A real but simple regularity on the substrate.
- **L2** substantive. A measured quantity with a clear method. Most of the suite.
- **L3** the strongest. A measured quantity **plus a control that could have
  failed** (a scramble, a flat lattice, or a lossy rule). If the control does
  not separate, the experiment downgrades. This is the anti-fooling gate.
- **paper: true** marks an experiment whose result is clean enough to cite.

The controls (`code/control/`) are the discipline: `scrambleNeighbors` (breaks
the geometry), a flat lattice (removes curvature), and `erasingCollision` (a
lossy rule, removes reversibility). An L3 claim has to beat its control.

## The cross-cutting themes

The arenas are folders, but the ideas run across them. The full walk is in
[concepts.md](concepts.md). The big ones:

- **The substrate is forced, not chosen.** foundations, geometry, and
  substrate-survey converge on {3,4,3,4} and the 24-cell from many independent
  routes, and show rival lattices failing.
- **Everything is emergent.** gauge, quantum, gravity, relativity, and selves
  each grow a piece of known physics out of the same base, none put in by hand.
- **Reversibility and records.** the one rule is exactly reversible and erases
  nothing, so the arrow of time is emergent (foundations, cosmology, quantum).
- **Controls are the point.** the L3 experiments across every arena compare
  against a scramble, a flat lattice, or a lossy rule.
- **The self is a pattern, not a thing.** selves is the largest arena because
  binding, agency, and identity are the hardest and most-tested claims.

## Reading paths (start here)

Four curated walks for diving in cold.

- **The newcomer.** [foundations](foundations/readme.md) (the base) then
  [geometry](geometry/readme.md) (the substrate) then one emergence arena you
  like ([quantum](quantum/readme.md) or [selves](selves/readme.md)).
- **The physicist.** [foundations](foundations/readme.md) then
  [gauge](gauge/readme.md), [spin](spin/readme.md),
  [gravity](gravity/readme.md), [relativity](relativity/readme.md),
  [holography](holography/readme.md). The Standard Model and spacetime program.
- **The mind-and-self reader.** [selves](selves/readme.md) start to finish,
  then [quantum](quantum/readme.md) (measurement) and
  [associative](associative/readme.md).
- **The skeptic.** [method](method/readme.md) (the anti-fooling gates) then
  [substrate-survey](substrate-survey/readme.md) (rival lattices) then scan any
  arena's "controls and negatives" section.

## Coverage gaps and where to extend

The suite catches its own holes. The clearest ones:

- **Arenas with no L3 yet:** foundations, data-structure, computation, fluids,
  addressing. Each has substantive L2 work but no control-gated result. Adding
  a scramble or flat-lattice control to a key L2 experiment there is the highest
  value extension.
- **A registry gap:** `renormalization-tower.ts` declares `E-SLF-0100` inside
  the file, but `registry.csv` skips 0100 (175 selves rows for 176 files). The
  registry needs that row added and the catalog regenerated.
- **Thin arenas by count:** method (3) and general (1) are meta and could hold
  more anti-fooling and cross-suite consistency checks.
- **Open frontiers named in the arenas:** the three-generations count (gauge,
  spin), Lorentz-from-a-fixed-lattice at high energy (relativity), fully
  reversible bulk gravity (gravity), and the single definite quantum outcome
  (quantum) are the standing open problems, each flagged in its arena doc.

## How to add an experiment

The suite is meant to grow. To add one:

1. **Write the file** at `test/experiment/<arena>/<slug>.ts`. Use the
   `experiment()` and `verdict()` scaffold from `test/scaffold/`. Give it an
   `id`, a `code`, a `title`, a `category`, a `depth` (L0 to L3), and `paper`.
2. **Add a control if you want L3.** Compare against `scrambleNeighbors`, a flat
   lattice, or `erasingCollision`, and pass the control result in `control`. An
   L3 claim without a separating control downgrades to L2.
3. **Pick the next code.** Codes are `E-<ARENA>-<NNNN>`, numbered per arena. Use
   the next free number for that arena (see the arena doc or the registry).
4. **Register it.** Add the row to `test/registry.csv`, import it in the barrel
   `test/experiment/all.ts`, and regenerate `test/catalog.ts`. Update the arena
   count in this map and add the one-line to the arena doc.
5. **Keep it deterministic.** No `Math.random`. Vary size, not seeds. Surface
   the negatives.

## Where the code lives

The experiments are thin. The physics lives in `code/`, documented in
[../library/readme.md](../library/readme.md): the substrate, the tone, the rule,
the dynamics, the coarse-graining, the measures, the controls, and the rest.
