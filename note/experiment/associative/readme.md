# Associative arena

**Associative memory on the substrate**. This arena is the associative-memory engine. It stores patterns on the `{3,4,3,4}` bulk and recalls them by **content**, not by address. Give it a cue and it returns the whole stored item, cleans up noise, completes a fragment, and walks from one memory to the next.

The claim under test is that **content-addressable recall and mind-like read-out fall out of hyperbolic geometry**. The bulk grows exponentially, so a query wave covers the whole store in logarithmic time, capacity rises with curvature, and the flat cubic memory is the worst case on every measure. The 16 experiments cover the base recall core, its robustness, the Hopfield attractor layer, the scaling laws, and the cognitive dynamics.

## Exact content-addressable recall

The base CAM. Store a distinct word on every cell and recall each by exact content with no false positives. This rides the reversible base rule and works on every buildable tessellation.

- **[`E-MMR-0005`](../../../test/experiment/associative/exact-recall.ts)** - a content-addressable memory recalls every stored word exactly, no false positives.
- **[`E-MMR-0016`](../../../test/experiment/associative/tessellation-sweep.ts)** - the same exact recall holds on every buildable regular hyperbolic tessellation.
- **[`E-MMR-0010`](../../../test/experiment/associative/numeric-search.ts)** - the numeric-search primitives (max, min, next-value) run at constant pass cost.

## Robust and graded recall

Pattern completion under damage. Recall stays intact from a corrupted or shrunken cue and degrades smoothly, and overlapping memories interfere the way real ones do.

- **[`E-MMR-0009`](../../../test/experiment/associative/noisy-recall.ts)** - the memory recalls a whole word from a corrupted cue, degrading gracefully past a threshold.
- **[`E-MMR-0006`](../../../test/experiment/associative/graded-recall.ts)** - fidelity degrades smoothly as the cue shrinks, graceful graded recall.
- **[`E-MMR-0008`](../../../test/experiment/associative/interference.ts)** - overlapping memories confuse recall (crosstalk) while well-separated ones recall cleanly.

## Hopfield attractors and dense capacity

The energy-based layer. Attractor clean-up needs dissipation, so it lives on an emergent Hopfield layer and not the bare rule. A sharper higher-order energy stores far more patterns.

- **[`E-MMR-0007`](../../../test/experiment/associative/hopfield-emergent-recall.ts)** - attractor recall works on the dissipative Hopfield layer and fails on the bare reversible rule, the negative.
- **[`E-MMR-0004`](../../../test/experiment/associative/dense-vs-classical-capacity.ts)** - a dense higher-order energy stores more patterns than the classical Hopfield at matched recall.

## Capacity and latency from curvature

The scaling laws. Curvature is the lever. More curvature means more capacity and lower latency, and the flat cubic memory loses on both.

- **[`E-MMR-0001`](../../../test/experiment/associative/capacity-scaling.ts)** - bulk capacity grows exponentially with radius while a flat cubic memory grows polynomially.
- **[`E-MMR-0002`](../../../test/experiment/associative/capacity-vs-curvature.ts)** - capacity rises and search latency falls with curvature across the catalog, the flat cubic lattice worst on both.
- **[`E-MMR-0013`](../../../test/experiment/associative/search-latency.ts)** - search latency scales logarithmically with size, sub-polynomially, versus N^(1/3) for the cubic memory.
- **[`E-MMR-0011`](../../../test/experiment/associative/parallel-cost.ts)** - search cost is constant in size and the communication radius grows logarithmically, versus polynomially on the cubic memory.

## Cognitive dynamics

The mind-like read-out. Spreading activation, priming, free association, and sequence replay all appear as query waves and cued walks on the bulk.

- **[`E-MMR-0015`](../../../test/experiment/associative/spreading-activation.ts)** - spreading activation through semantic memory IS the bulk query wave, made logarithmic by the geometry.
- **[`E-MMR-0012`](../../../test/experiment/associative/priming.ts)** - a pre-activated region resolves a related query in fewer beats, priming as residual activation.
- **[`E-MMR-0003`](../../../test/experiment/associative/chaining.ts)** - free association is a content-cued walk, each recalled word cues the next nearest memory.
- **[`E-MMR-0014`](../../../test/experiment/associative/sequence-recall.ts)** - episodic and sequence memory are stored temporal chains, replayed in order from the first cue.

## What it establishes

The bulk is a working **associative-memory engine**. It recalls by content exactly, completes noisy and partial cues gracefully, and reproduces spreading activation, priming, free association, and sequence replay. Capacity and speed both **improve with curvature**, and the flat cubic memory is the worst case throughout. The one boundary is surfaced. Attractor clean-up is an **emergent dissipative capability**, not a property of the bare reversible rule.
