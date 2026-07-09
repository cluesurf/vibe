# Computation

The **computation** arena asks whether the substrate is a computer. If the base rule can carry universal computation, then anything computable can, in principle, be built out of the vibe. The tests do not assume this. They construct explicit machines on the mesh and run them.

The strategy follows Margenstern's railway program. Universality on a tiling needs three legs, a **tree-like addressing** to route signals, a set of **ballistic signals** that travel in straight lines (wires), and **reversible collisions** that act as gates. Meet all three and the geometry computes. The suite builds this on the canonical **{3,4,3,4}** and cross-checks it on the classic hyperbolic tilings ({5,3,4}, {7,3}) and the flat cusp ({4,3,4}), then names the reversible rule in modern terms (a sparse local-attention update) and asks the harder question, does the substrate ever compute with a **purpose**.

Every machine is deterministic and runs on the live dynamics, and each carries a control (a lossy constructor, a pinning table, a diffusive walk) that should break the result.

14 experiments, grouped below into four sub-themes. Every code appears once.

## Universality on the canonical {3,4,3,4}

The committed geometry and its committed rule are Turing-complete, shown on their own terms.

- **[`E-CMP-0011`](../../../test/experiment/computation/turing-3434.ts)** - Turing-completeness of {3,4,3,4}, built from its Fibonacci-tree addressing and the model's own ternary rule in Margenstern's railway style, the three legs met explicitly.
- **[`E-CMP-0008`](../../../test/experiment/computation/reversible-universality-3434.ts)** - the canonical claim, the committed reversible knit rule on the {3,4,3,4} 24-cell is universal, the same pair table on the final geometry.
- **[`E-CMP-0012`](../../../test/experiment/computation/p44-universality.ts)** - the ternary signed-majority rule is functionally complete (it realizes NAND) and runs NOT, AND, OR, XOR, a full adder, and arbitrary Boolean functions on the live dynamics.
- **[`E-CMP-0006`](../../../test/experiment/computation/p213-universality.ts)** - the flat {4,3,4} cusp runs the reversible Margolus billiard-ball CA, a lone ball flies ballistically (a wire) and the rule is exactly reversible, so the cusp computes.

## Universality across the hyperbolic geometries

Margenstern's theorem is geometry-specific, so each tiling is its own result. These confirm universality transfers and build fully programmable machines.

- **[`E-CMP-0007`](../../../test/experiment/computation/reversible-universality.ts)** - the {5,3,4} dodecagrid with the reversible rule is universal, kept as the comparative cross-geometry precedent to the canonical {3,4,3,4} claim.
- **[`E-CMP-0001`](../../../test/experiment/computation/computation-73.ts)** - the {7,3} heptagrid (Margenstern and Morita's proven-universal tiling) carries the railway prerequisites, a Fibonacci addressing and ballistic signals, a cross-geometry reference point.
- **[`E-CMP-0005`](../../../test/experiment/computation/means-computation.ts)** - the {5,3,4} hosts universal computation via a 2-counter Minsky machine, registers stored as charge in mesh regions, and it computes a times b correctly.
- **[`E-CMP-0010`](../../../test/experiment/computation/substrate-computer.ts)** - a full programmable register machine (INC, DECJZ, HALT) on the {5,3,4}, registers as charge and the operations the substrate's own create and annihilate moves.

## The rule as reversible computation

The base rule read as a computational primitive, exactly reversible, sparse, and able to copy itself.

- **[`E-CMP-0003`](../../../test/experiment/computation/discrete-rule-endtoend.ts)** - one discrete directional rule verified end to end, exact charge conservation, exact momentum conservation, exact reversibility, and a smoothly coarse-graining continuum density.
- **[`E-CMP-0014`](../../../test/experiment/computation/sparse-attention-update.ts)** - the reversible rule is a sparse one-hot local-attention update (one nonzero per row, an O(cells times degree) gather), with exact activity pruning that vanishes on a dense state and on the live-vacuum creating rule.
- **[`E-CMP-0009`](../../../test/experiment/computation/self-replication.ts)** - deterministic self-replication and heredity, a constructor copies a template each generation so the population grows bit-identical, while a lossy constructor breaks the copy, the control.
- **[`E-CMP-0013`](../../../test/experiment/computation/walk-complexity.ts)** - the emergent quantum walk profile sits above the Morse-Hedlund complexity line (genuine interference, Ord and Kauffman), while the classical diffusive walk sits below it.

## Goal-directed search

Universal computation is goal-neutral. These ask whether the substrate coordinates or solves with direction, and one is a flagged failure.

- **[`E-CMP-0004`](../../../test/experiment/computation/hierarchical-solving.ts)** - the global coordination distance is O(log N) and tiny, because the hyperbolic diameter is logarithmic, so a decision at one point reaches all N cells in a few hops.
- **[`E-CMP-0002`](../../../test/experiment/computation/direction-intention.ts)** - INVALID / CIRCULAR (audited), the goal-directed search only "solves" because it moves by copying the target bit, so reaching the target is guaranteed by construction, kept for the record, not evidence.

## What it establishes

The substrate **computes**. Universality is shown on the canonical {3,4,3,4} with its own ternary rule and its committed reversible knit, then confirmed across the {5,3,4}, {7,3}, and flat {4,3,4} geometries with explicit Minsky and register machines that run real programs. The base rule is an **exactly reversible, sparse local-attention update** that can copy itself faithfully, and its emergent walk carries genuine quantum interference rather than trivial diffusion. Coordination across the whole mesh is **O(log N)** by the hyperbolic diameter. The one claim of purposeful problem-solving is a flagged **circular negative**, universal computation is goal-neutral and the substrate does not by itself supply intention.
