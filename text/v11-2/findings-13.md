# Findings 13, Convergences, Tensor Networks, and the Discrete-Substrate Scorecard

The big-picture connections that make the theory land, where it touches the deepest currents of modern physics and
mathematics, and the honest checklist of what any discrete substrate must recover, with the vibe scorecard. This is
for the introduction, the holography part, the related-works, and the questions. Companion to `findings.md`. Cite
`\cite{pollard2026vibetest}`, with the AdS-CFT, MERA, and holographic-code literature for the convergences.

## The deep convergences, where the theory meets modern physics

A handful of structural intersections, not proven descriptions of the universe but among the most suggestive in
mathematics, and most of them are bets the theory already makes.

- SYMMETRY IS DEEPER THAN GEOMETRY. The modern insight is that symmetry is primary and geometry follows. The 24-cell
  is not drawn by hand, it is GENERATED automatically by the D4 symmetry, algebra producing geometry. This is the
  thesis of the substrate, the dock is forced by a root system, not chosen as a shape.
- THE UNIVERSE MAY BE RELATIONAL AND ALGEBRAIC. What matters is relations and transformations, not static points,
  the view shared by gauge theory, category theory, and tensor networks. Reflection (Coxeter) systems generate
  infinite structured worlds from a few local rules, which is exactly what a physical law does, which is why the
  reflection machinery feels physics-like.
- HYPERBOLIC BULK, EMERGENT FLAT BOUNDARY. A hyperbolic recursive bulk with a flat boundary is the shape of
  holography and AdS-CFT, and the substrate has it literally, the curved 4D bulk with the flat 3D cubic cusp. So
  Euclidean space is not fundamental, it EMERGES as the boundary geometry of deeper negative curvature, the way our
  flat 3D world is the cusp of the 4D crystal.
- EXPONENTIAL GROWTH MAY BE MORE FUNDAMENTAL THAN FLATNESS. Flat geometry grows polynomially, hyperbolic grows
  exponentially, and the systems that need real capacity (semantic networks, holography, branching memory) prefer
  hyperbolic, which is why the substrate is curved and our flatness is the local approximation.

Why it matters, the theory's central choices, symmetry-first, relational, hyperbolic-bulk-with-flat-boundary,
exponential growth, are not idiosyncrasies, they are the same intuitions converging across modern physics, which is
the case for taking the substrate seriously.

## Tensor networks, the holographic-code connection

Hyperbolic tessellations give the geometry and the graph skeleton, tensor networks put quantum-state data on that
skeleton, and the two together are discrete models of holographic spacetime. The map is direct. MERA, the
scale-by-scale coarse-graining network, looks like a hyperbolic tiling with the renormalization scale as an emergent
radial dimension. The HaPPY code puts perfect tensors on a hyperbolic tiling so bulk logical information is encoded
redundantly on the boundary, a quantum error-correcting code that IS the bulk-boundary dictionary. The 4D hyperbolic
LDPC "golden codes" are built on regular H4 tessellations, the substrate's own setting. The theory realizes this, it
carries a holographic code (the bulk reconstructs after damage), the Ryu-Takayanagi area law (with the flat control
that fails), and the entropy-area scaling, all on the discrete crystal. Why it matters, the substrate is a concrete
instance of the deepest program in quantum gravity, holographic quantum error correction on a hyperbolic graph, and
it adds the dynamics (the knit) that the static networks lack.

## The honest scorecard, what a discrete substrate must recover

A discrete substrate is only as good as the physics it reproduces, and there is a real distinction between
structural and dynamical success that the theory states plainly. Tensor-network and hyperbolic models capture the
STRUCTURE of spacetime impressively, holographic scaling, entanglement geometry, the RT minimal-surface entropy, the
renormalization hierarchy, quantum error correction, causal wedges, exponential volume. But they mostly FAIL the
DYNAMICAL content, a frozen graph has no true dynamical Einstein geometry, curvature that bends in response to
energy. That gap is the real checklist for any discrete substrate, including this one.

The vibe scorecard against it. RECOVERED, the structural suite (holography, RT with a failing control, the
holographic code, exponential growth, the renormalization fixed point) AND a large chunk of the dynamical content the
static networks lack, the reversible local law, exact conservation, the finite light cone, emergent Lorentz
invariance, the Dirac and Maxwell sectors, particle masses, the gauge group, baryogenesis, the dimension selection,
the Bell value, the Born rule, and the self. PARTIAL or OPEN, the fully nonlinear curved-bulk Einstein equation (the
same dynamical-geometry gap the tensor networks have), the coupling constant, the three generation masses, the
measurement problem, and the relativistic massless mode needing a second conservation law. Why it matters, the theory
is measured against the strongest honest standard, not a soft one, it clears the structural bar that the famous
models clear, adds much of the dynamical content they miss, and marks the one place (dynamical curved-bulk gravity)
where it shares their open frontier rather than hiding it.

## Where to look (code and experiments and notes)

- The convergences and framing: `theory-v0.7.0/notes/.../the-deep-convergences.md`,
  `geometry-may-not-be-fundamental.md`, `why-3-4-3-4-matters.md`.
- The tensor-network and holographic-code tie: `theory-v0.7.0/notes/.../tensor-networks-and-hyperbolic-tessellations.md`,
  and the experiments `holography/happy-code-534`, `holography/holographic-code-534`, `holography/ryu-takayanagi-73`,
  `gravity/area-law`.
- The scorecard and the honest gap: `theory-v0.7.0/notes/.../what-a-discrete-substrate-must-recover.md`, and the
  open-frontiers in `findings-7.md` and `theory-v0.7.0/frontiers.md`.