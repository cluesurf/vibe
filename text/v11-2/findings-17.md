# Findings 17, How It Works, Worked Mechanisms

The mechanisms the paper leans on, shown rather than named, each with a small worked example or table so the reader
sees the gears turn. Everything here is standard mathematics or a project result, nothing invented. Companion to
`findings.md`. Cite `\cite{pollard2026vibetest}` on the measured ones.

## NAND from the dock, and why that is everything

A logic gate is built straight from the tone. Take a dock site fed by a `+1` bias and two `-1` fills, and the
signed-majority of the line computes NAND, the not-and gate.

| input x | input y | NAND(x, y) |
| --- | --- | --- |
| 0 | 0 | 1 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

NAND is FUNCTIONALLY COMPLETE, every other gate is built from it (NOT x is NAND(x, x), AND is NAND then NOT, OR is
NOT-NOT by De Morgan). So once the tone gives NAND, the dock gives every Boolean circuit, and in particular Rule 110,
which is Turing-universal. Why it matters, the leap from a felt value to universal computation is this one truth
table, the rest is wiring.

## A register machine from create and annihilate

A Minsky machine (increment, decrement-if-nonzero, halt) is Turing-complete, and it runs directly. A register is
ternary CHARGE held in an addressed subtree, INCREMENT is the arrow's create move lifting a `+1/-1` pair from peace,
DECREMENT is annihilation removing one, TEST-ZERO reads the charge. The total tone is conserved throughout, so it is
genuine substrate dynamics, and real programs run, multiplication `3 x 4 = 12` by four increments repeated three
times, `6 x 6 = 36`, monus, all exact. Why it matters, arithmetic is not simulated on top of the physics, it IS the
create-and-annihilate of the vacuum, counted.

## The Casimir shadow, how binding works

A body that excludes the active vacuum absorbs the tones streaming toward it, so fewer arrive from its side, and a
nearby piece is struck more from the open side and pushed back toward the body. The signature is the falloff of the
gap suppression with distance, measured.

| separation d | gap suppression | with the wall removed |
| --- | --- | --- |
| 6 | 1.34 | 0 |
| 8 | 0.80 | 0 |
| 10 | 0.23 | 0 |

The suppression falls smoothly with distance and vanishes entirely when the vacuum is removed, the classic Casimir
shape, and on the 24 sites of a dock the net inward momentum is the integer `-6` (the full shadow) versus `0` with no
body. Why it matters, attraction is not added by hand, it is the vacuum being thinner in a body's shadow, and the
falloff proves it is the real effect, not an artifact.

## The double cover, the belt trick made exact

A spinor needs two full turns to return, and you can watch it in the overlap function, `cos(theta/2)` for a spinor
versus `cos(theta)` for a vector.

| turn theta | vector `cos(theta)` | spinor `cos(theta/2)` |
| --- | --- | --- |
| 0 | +1 | +1 |
| pi | -1 | 0 |
| 2pi | +1 | -1 |
| 4pi | +1 | +1 |

At one full turn (`2pi`) the vector is home but the spinor is INVERTED (`-1`), and only at two turns (`4pi`) is the
spinor home. This is exact in the finite group 2T (the dock), no continuum needed. Why it matters, the electron's
strangest property, that turning it once flips its sign, is a fact about a 24-element multiplication table.

## A holographic quantum code, how a self survives damage

A quantum error-correcting code stores one LOGICAL unit of information redundantly across many PHYSICAL pieces, so
losing some pieces loses nothing. The building block is a PERFECT TENSOR, a tensor whose legs, split into any two
equal halves, form a perfect map from one half to the other, so any half determines the whole. Tile the hyperbolic
bulk with perfect tensors and contract along edges (the HaPPY construction), and the bulk legs become logical
information encoded on the boundary legs.

| code | physical pieces | logical pieces | recovers from |
| --- | --- | --- | --- |
| `[[5,1,3]]` (the perfect-tensor unit) | 5 | 1 | ANY 2 erasures (the locations are known) |
| HaPPY tiling | the boundary qubits | the bulk qubits | erasing any boundary region outside the causal wedge |

A bulk operator can be reconstructed from any boundary region that contains its causal wedge, so the SAME bulk
information lives in many places, and erasing part of the boundary leaves it intact. The code distance grows as
`3^depth`, deeper bulk is more protected. In the model this is measured, a damaged bulk self reconstructs, a spread
bit survives erasure, and the threshold rises as the code grows. Why it matters, this is literally how a self keeps
its identity through damage and turnover, the bulk-boundary code is the mechanism of survival, not a metaphor.

## The Ryu-Takayanagi area law, how entanglement becomes geometry

The entanglement entropy of a boundary region equals the length of the shortest bulk curve (geodesic) that hangs
across it. On the hyperbolic `{7,3}` that geodesic length grows as the LOG of the interval, so the entropy is
logarithmic, while on a FLAT control the shortest curve grows linearly, so the entropy is linear. The model measures
the log law on `{7,3}` and the failing linear law on flat `{6,3}`, and for a black hole the entropy scales as AREA
(`l^2`) not volume (`l^3`). Why it matters, entanglement and geometry are the same thing here, the entropy IS a
length, with a control geometry that gives the wrong answer, the strong form of the test.

## The Wilson loop and Aharonov-Bohm, how a force field is felt

A Wilson loop is the product of the gauge phases around a closed path, and it equals the magnetic FLUX enclosed by
the path. A charge carried around a region that has flux but ZERO field inside still picks up that phase, the
Aharonov-Bohm effect, so the field is felt where it is absent. The model measures the Wilson loop equal to the
enclosed flux exactly and the Aharonov-Bohm phase exact. Why it matters, electromagnetism's gauge nature, that the
potential is physical even where the field vanishes, is reproduced on the mesh.

## CHSH, how a local base reaches the quantum limit

A Bell test scores four correlations into one number S. Any local-hidden-variable theory is capped at `S = 2`,
quantum mechanics is capped at the Tsirelson bound `2 sqrt 2` (about 2.83), and nothing reaches higher.

| theory | maximum S |
| --- | --- |
| local hidden variables (the product control) | 2 |
| quantum mechanics (Tsirelson) | `2 sqrt 2` about 2.83 |
| the model's exchange unitary | 2.83 |

The model's exchange dynamics reaches 2.83 while a separable product control stays at 2, and an aligned shared past
buys the violation at the same mutual information as a misaligned past (so it is correlation structure, not extra
information). Why it matters, a LOCAL DETERMINISTIC base hits the exact quantum ceiling that local theories are
supposed to be barred from, which is one of the most surprising results in the whole program.

## The Born rule, why probability is the amplitude squared

Quantum probability is the SQUARE of the amplitude, and the exponent is forced, not chosen. Demand that combining
independent components add up consistently (quadrature additivity), and only the exponent `p = 2` works, `p = 1` and
`p = 3` both fail the additivity test. The model matches `|c|^2` to under 0.01. Why it matters, the one probabilistic
axiom of quantum mechanics is derived from a consistency requirement, not assumed.

## The renormalization fixed point, why scales agree

Coarse-graining blocks several docks into one and asks how the effective coupling changes. The decimation recurrence
is `tanh K' = tanh^2 K`, and iterating it drives the coupling to a fixed point.

| step | coupling K |
| --- | --- |
| start | 1.5 |
| after coarse-graining | about 0.08 |
| fixed point | `K* = 0` |

The measured flow matches the recurrence within 0.02, charge stays exact across five levels, and the wave speed is
invariant to about 15 percent. Why it matters, the rule looks the same at every scale (the fixed point), which is the
deep reason coarse-graining is valid and the reason the universe has consistent physics from atoms to galaxies.

## Integrated information, how a whole exceeds its parts

Integration measures how much a system's cause-effect structure is IRREDUCIBLE, more than the sum of its parts. Take
a cohesive self and a random bag of the same pieces, the self is a local MAXIMUM of integration far above the bag,
and crucially, CUTTING the self's internal links collapses its integration even with the WIRING UNCHANGED, because
the measure reads the live dynamics, not the static graph. Why it matters, consciousness is measured here as
irreducible wholeness in the dynamics, which distinguishes a genuine self from a mere pile, with a control that
fails.

## Where to look (experiments)

- Computation: `computation/turing-3434` (NAND, Rule 110, the register machine), `computation/means-computation`.
- Binding and spin: `selves/casimir-vacuum-attraction`, `selves/shadow-pressure-d4`, `spin/rotation-2pi`,
  `spin/sp1-spin-double-cover`.
- Codes and holography: `holography/happy-code-534`, `holography/holographic-code-534`,
  `holography/ryu-takayanagi-73`, `gravity/area-law`.
- Forces and quantum: `gauge/emergent-u1-gauge` (Wilson loop, Aharonov-Bohm), `quantum/entanglement-bell` (CHSH),
  `quantum/born-rule`.
- Scales and mind: `renormalization/coarse-graining-fixed-point`, `selves/integrated-information`.